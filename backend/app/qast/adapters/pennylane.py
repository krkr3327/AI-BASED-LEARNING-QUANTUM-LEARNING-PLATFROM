"""
PennyLane Quantum Backend Adapter.

Executes a Q-AST Circuit using PennyLane's default.qubit simulator and
produces a canonical ExecutionTrace with genuine per-gate state snapshots.

TRACE METHOD:
  PennyLane 0.33+ supports qml.Snapshot(tag=...) inserted as mid-circuit
  operations. When executed via qml.snapshots(circuit_fn)(), the return
  dict contains every tagged snapshot keyed by the tag string, plus
  "execution_results" for the final return value.

  We inject qml.Snapshot(tag=f'op_{i}_before') before each gate and
  qml.Snapshot(tag=f'op_{i}_after') after each gate. The full statevector
  at each point is then available in the snapshot dict.

DYNAMIC CIRCUIT LIMITATION:
  PennyLane's default.qubit does not support ResetNode or ConditionalNode.
  For circuits containing these, trace_capability="unavailable" is returned
  with an empty execution_trace []. No synthetic trace steps are created.

ENDIANNESS:
  PennyLane's default.qubit returns state with q0=MSB (big-endian).
  No bit-reversal is required.
"""
import numpy as np
try:
    import pennylane as qml
    _PENNYLANE_AVAILABLE = True
except ImportError:
    _PENNYLANE_AVAILABLE = False
from typing import Optional, List, Dict, Any

from app.qast.nodes import Circuit, GateNode, MeasurementNode, ResetNode, ConditionalNode


GATE_MAP = {
    "X": "qml.PauliX",
    "Y": "qml.PauliY",
    "Z": "qml.PauliZ",
    "H": "qml.Hadamard",
    "S": "qml.S",
    "T": "qml.T",
} if not _PENNYLANE_AVAILABLE else {
    "X": qml.PauliX,
    "Y": qml.PauliY,
    "Z": qml.PauliZ,
    "H": qml.Hadamard,
    "S": qml.S,
    "T": qml.T,
}


def _apply_pl_gate(op: GateNode) -> None:
    """Apply a single GateNode to the current PennyLane circuit context."""
    gate = op.gate
    if gate == "CNOT":
        qml.CNOT(wires=[op.qubits[0], op.qubits[1]])
    elif gate == "CZ":
        qml.CZ(wires=[op.qubits[0], op.qubits[1]])
    elif gate == "SWAP":
        qml.SWAP(wires=[op.qubits[0], op.qubits[1]])
    elif gate in ("RX", "RY", "RZ"):
        theta = float(op.parameters.get("theta") if "theta" in op.parameters else next(iter(op.parameters.values())))
        if gate == "RX":
            qml.RX(theta, wires=op.qubits[0])
        elif gate == "RY":
            qml.RY(theta, wires=op.qubits[0])
        elif gate == "RZ":
            qml.RZ(theta, wires=op.qubits[0])
    elif gate == "CPHASE":
        theta = float(op.parameters.get("theta") if "theta" in op.parameters else next(iter(op.parameters.values())))
        qml.ControlledPhaseShift(theta, wires=[op.qubits[0], op.qubits[1]])
    elif gate == "MCX":
        qml.MultiControlledX(wires=op.qubits)
    elif gate in GATE_MAP:
        GATE_MAP[gate](wires=op.qubits[0])
    else:
        raise ValueError(f"PennyLane adapter: unsupported gate '{gate}'")


def _sv_to_list(sv: np.ndarray) -> List[Dict[str, float]]:
    return [{"real": float(c.real), "imag": float(c.imag)}
            for c in np.asarray(sv, dtype=complex)]


def _compute_probs(sv: np.ndarray, num_qubits: int) -> Dict[str, float]:
    sv_a = np.asarray(sv, dtype=complex)
    return {
        bin(i)[2:].zfill(num_qubits): float(abs(sv_a[i]) ** 2)
        for i in range(2 ** num_qubits)
    }


def _get_control_qubits(op: GateNode) -> List[int]:
    if op.gate in ("CNOT", "CZ", "CPHASE"):
        return [op.qubits[0]]
    if op.gate == "MCX":
        return list(op.qubits[:-1])
    return []


class PennyLaneAdapter:
    def execute(self, circuit: Circuit) -> dict:
        if not _PENNYLANE_AVAILABLE:
            raise ValueError("pennylane: PennyLane is not installed. Run: pip install pennylane")
        n = circuit.num_qubits

        # Check for dynamic operations (unsupported in PennyLane adapter)
        has_dynamic = any(isinstance(op, (ResetNode, ConditionalNode)) for op in circuit.operations)
        has_measurement = False
        has_mid_circuit_meas = False
        last_op_idx = len(circuit.operations) - 1
        for i, op in enumerate(circuit.operations):
            if isinstance(op, MeasurementNode):
                has_measurement = True
                if i != last_op_idx:
                    has_mid_circuit_meas = True

        if has_dynamic or has_mid_circuit_meas:
            # Return unavailable with EMPTY trace — no synthetic steps created
            trace_reason = (
                "PennyLane adapter does not support dynamic circuits "
                "(Reset, Conditional, or mid-circuit Measurement). "
                "Trace unavailable for this circuit."
            )
            return self._execute_final_only(circuit, n, has_measurement, trace_reason)

        # Collect only gate operations for trace pass
        gate_ops = [op for op in circuit.operations if isinstance(op, GateNode)]

        # ── Pass 1: Trace pass using qml.snapshots ────────────────────────────
        dev = qml.device("default.qubit", wires=n)
        execution_trace: List[Dict[str, Any]] = []

        @qml.qnode(dev)
        def instrumented_circuit():
            for i, op in enumerate(gate_ops):
                qml.Snapshot(tag=f'op_{i}_before')
                _apply_pl_gate(op)
                qml.Snapshot(tag=f'op_{i}_after')
            return qml.state()

        try:
            snapshot_dict = qml.snapshots(instrumented_circuit)()
            trace_capability = "full"
            trace_reason = None
        except Exception as e:
            trace_capability = "unavailable"
            trace_reason = f"PennyLane qml.snapshots failed: {str(e)}"
            snapshot_dict = {}

        if trace_capability == "full" and snapshot_dict:
            # Initial state |0...0>
            initial_sv = np.zeros(2 ** n, dtype=complex)
            initial_sv[0] = 1.0

            for i, op in enumerate(gate_ops):
                before_key = f'op_{i}_before'
                after_key = f'op_{i}_after'

                sv_before = np.asarray(
                    snapshot_dict.get(before_key, initial_sv if i == 0 else None),
                    dtype=complex
                )
                sv_after = np.asarray(snapshot_dict.get(after_key, sv_before), dtype=complex)

                execution_trace.append({
                    "step_index": i,
                    "operation_type": "gate",
                    "operation_name": op.gate,
                    "qubits": list(op.qubits),
                    "control_qubits": _get_control_qubits(op),
                    "parameters": dict(op.parameters) if op.parameters else None,
                    "statevector_before": _sv_to_list(sv_before),
                    "statevector_after": _sv_to_list(sv_after),
                    "probabilities_before": _compute_probs(sv_before, n),
                    "probabilities_after": _compute_probs(sv_after, n),
                    "is_measurement": False,
                    "measurement_result": None,
                    "classical_bits_before": None,
                    "classical_bits_after": None,
                    "is_reset": False,
                    "is_conditional": False,
                    "conditional_executed": None,
                    "backend": "pennylane",
                    "provenance": "real_execution",
                })

        # ── Pass 2: Final state + measurement sampling ─────────────────────────
        dev2 = qml.device("default.qubit", wires=n)

        @qml.qnode(dev2)
        def circuit_fn():
            for op in circuit.operations:
                if isinstance(op, GateNode):
                    _apply_pl_gate(op)
            return qml.state()

        sv = np.array(circuit_fn(), dtype=complex)
        probs_array = np.abs(sv) ** 2
        probabilities = {
            bin(idx)[2:].zfill(n): float(prob)
            for idx, prob in enumerate(probs_array)
            if prob > 1e-10
        }

        measurement: Optional[str] = None
        measurement_bits: Optional[List[int]] = None

        if has_measurement:
            meas_qubits = []
            for op in circuit.operations:
                if isinstance(op, MeasurementNode):
                    meas_qubits.extend(op.qubits)
            meas_qubits = sorted(set(meas_qubits))

            dev_shot = qml.device("default.qubit", wires=n, shots=1)

            @qml.qnode(dev_shot)
            def sample_fn():
                for op in circuit.operations:
                    if isinstance(op, GateNode):
                        _apply_pl_gate(op)
                return qml.sample(wires=list(range(n)))

            sample_result = np.array(sample_fn()).flatten()
            measurement_bits = [int(b) for b in sample_result]
            measurement = "".join(str(b) for b in measurement_bits)

            # Add measurement TraceStep
            if trace_capability == "full":
                pre_meas_sv = sv
                meas_state_idx = int(measurement, 2)
                post_meas_sv = np.zeros(2 ** n, dtype=complex)
                post_meas_sv[meas_state_idx] = 1.0

                step_idx = len(execution_trace)
                for op in circuit.operations:
                    if isinstance(op, MeasurementNode):
                        execution_trace.append({
                            "step_index": step_idx,
                            "operation_type": "measure",
                            "operation_name": "measure",
                            "qubits": list(op.qubits),
                            "control_qubits": [],
                            "parameters": {"cbits": list(op.cbits) if op.cbits else []},
                            "statevector_before": _sv_to_list(pre_meas_sv),
                            "statevector_after": _sv_to_list(post_meas_sv),
                            "probabilities_before": _compute_probs(pre_meas_sv, n),
                            "probabilities_after": _compute_probs(post_meas_sv, n),
                            "is_measurement": True,
                            "measurement_result": measurement_bits,  # actual sample
                            "classical_bits_before": None,
                            "classical_bits_after": measurement_bits,
                            "is_reset": False,
                            "is_conditional": False,
                            "conditional_executed": None,
                            "backend": "pennylane",
                            "provenance": "real_execution",
                        })
                        step_idx += 1
                        break

        return {
            "statevector": sv,
            "probabilities": probabilities,
            "measurement": measurement,
            "num_qubits": n,
            "execution_trace": execution_trace,
            "trace_capability": trace_capability,
            "trace_reason": trace_reason,
        }

    def _execute_final_only(self, circuit: Circuit, n: int,
                            has_measurement: bool, trace_reason: str) -> dict:
        """Execute without trace (dynamic circuit case). Returns empty trace []."""
        dev = qml.device("default.qubit", wires=n)

        @qml.qnode(dev)
        def circuit_fn():
            for op in circuit.operations:
                if isinstance(op, GateNode):
                    _apply_pl_gate(op)
            return qml.state()

        sv = np.array(circuit_fn(), dtype=complex)
        probs_array = np.abs(sv) ** 2
        probabilities = {
            bin(idx)[2:].zfill(n): float(prob)
            for idx, prob in enumerate(probs_array)
            if prob > 1e-10
        }

        measurement: Optional[str] = None
        if has_measurement:
            dev_shot = qml.device("default.qubit", wires=n, shots=1)

            @qml.qnode(dev_shot)
            def sample_fn():
                for op in circuit.operations:
                    if isinstance(op, GateNode):
                        _apply_pl_gate(op)
                return qml.sample(wires=list(range(n)))

            sample_result = np.array(sample_fn()).flatten()
            measurement = "".join(str(int(b)) for b in sample_result)

        return {
            "statevector": sv,
            "probabilities": probabilities,
            "measurement": measurement,
            "num_qubits": n,
            "execution_trace": [],           # empty — no synthetic steps
            "trace_capability": "unavailable",
            "trace_reason": trace_reason,
        }
