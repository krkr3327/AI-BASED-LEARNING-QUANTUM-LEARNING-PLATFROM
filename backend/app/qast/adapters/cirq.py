"""
Cirq Quantum Backend Adapter.

Executes a Q-AST Circuit using Cirq's Simulator and produces a
canonical ExecutionTrace with genuine per-gate state snapshots.

TRACE METHOD:
  Cirq's Simulator implements SimulatesIntermediateState, which provides
  the simulate_moment_steps() method. This yields a StepResult after
  each Moment in the circuit, containing the full state_vector().

  To get per-gate (not per-moment) snapshots, we build each gate as its
  own cirq.Moment. This guarantees one StepResult per Q-AST gate.

TWO-PASS STRATEGY:
  Pass 1 (trace pass):  Gate-only circuit, one Moment per gate.
                        simulate_moment_steps() yields per-gate states.
  Pass 2 (measure pass): Full circuit with measurements for sampled outcome.

ENDIANNESS:
  We use sorted(cirq.LineQubit.range(n)) with qubit_order=qubits, so
  qubit 0 is MSB. The statevector is already in big-endian order.
"""
import numpy as np
try:
    import cirq
    CIRQ_AVAILABLE = True
    CIRQ_IMPORT_ERROR = None
except Exception as _cirq_err:
    cirq = None
    CIRQ_AVAILABLE = False
    CIRQ_IMPORT_ERROR = str(_cirq_err)

from typing import Optional, List, Dict, Any

from app.qast.nodes import Circuit, GateNode, MeasurementNode, ResetNode, ConditionalNode


def _build_qubit_list(n: int):
    return cirq.LineQubit.range(n)


if CIRQ_AVAILABLE:
    GATE_MAP = {
        "X": cirq.X,
        "Y": cirq.Y,
        "Z": cirq.Z,
        "H": cirq.H,
        "S": cirq.S,
        "T": cirq.T,
    }
else:
    GATE_MAP = {}


def _make_cirq_op(op: GateNode, qubits):
    gate = op.gate
    if gate == "CNOT":
        return cirq.CNOT(qubits[op.qubits[0]], qubits[op.qubits[1]])
    elif gate == "CZ":
        return cirq.CZ(qubits[op.qubits[0]], qubits[op.qubits[1]])
    elif gate == "SWAP":
        return cirq.SWAP(qubits[op.qubits[0]], qubits[op.qubits[1]])
    elif gate in ("RX", "RY", "RZ"):
        theta = float(op.parameters.get("theta") if "theta" in op.parameters else next(iter(op.parameters.values())))
        if gate == "RX":
            return cirq.rx(theta)(qubits[op.qubits[0]])
        elif gate == "RY":
            return cirq.ry(theta)(qubits[op.qubits[0]])
        elif gate == "RZ":
            return cirq.rz(theta)(qubits[op.qubits[0]])
    elif gate == "CPHASE":
        theta = float(op.parameters.get("theta") if "theta" in op.parameters else next(iter(op.parameters.values())))
        return (cirq.Z ** (theta / np.pi)).controlled()(
            qubits[op.qubits[0]], qubits[op.qubits[1]]
        )
    elif gate == "MCX":
        return cirq.X.controlled(num_controls=len(op.qubits) - 1)(
            *[qubits[q] for q in op.qubits]
        )
    elif gate in GATE_MAP:
        return GATE_MAP[gate](qubits[op.qubits[0]])
    else:
        raise ValueError(f"Cirq adapter: unsupported gate '{gate}'")


def _sv_to_list(sv: np.ndarray) -> List[Dict[str, float]]:
    return [{"real": float(c.real), "imag": float(c.imag)} for c in sv]


def _compute_probs(sv: np.ndarray, num_qubits: int) -> Dict[str, float]:
    return {
        bin(i)[2:].zfill(num_qubits): float(abs(sv[i]) ** 2)
        for i in range(2 ** num_qubits)
    }


def _get_control_qubits(op: GateNode) -> List[int]:
    if op.gate in ("CNOT", "CZ", "CPHASE"):
        return [op.qubits[0]]
    if op.gate == "MCX":
        return list(op.qubits[:-1])
    return []


class CirqAdapter:
    def execute(self, circuit: Circuit) -> dict:
        if not CIRQ_AVAILABLE:
            raise ValueError(f"backend_unavailable: Cirq adapter is not available on this system ({CIRQ_IMPORT_ERROR})")

        n = circuit.num_qubits
        qubits = _build_qubit_list(n)

        # Validate dynamic operations
        for i, op in enumerate(circuit.operations):
            if isinstance(op, (ResetNode, ConditionalNode)):
                raise ValueError(
                    f"unsupported_dynamic_operation: Cirq adapter does not support {type(op).__name__}."
                )
            if isinstance(op, MeasurementNode) and i != len(circuit.operations) - 1:
                raise ValueError(
                    "unsupported_dynamic_operation: Cirq adapter does not support mid-circuit measurements."
                )

        has_measurement = any(isinstance(op, MeasurementNode) for op in circuit.operations)

        # ── Pass 1: Trace pass using simulate_moment_steps ────────────────────
        execution_trace: List[Dict[str, Any]] = []
        trace_capability = "unavailable"
        trace_reason = None

        # Collect gate operations only
        gate_ops_in_order = [op for op in circuit.operations if isinstance(op, GateNode)]

        # Build gate-only circuit with ONE gate per Moment (for per-gate stepping)
        gate_moments = [cirq.Moment([_make_cirq_op(op, qubits)]) for op in gate_ops_in_order]

        if gate_moments:
            gate_only_circuit = cirq.Circuit(gate_moments)
            sim = cirq.Simulator()

            try:
                # Initial state |0...0> before any gate
                prev_sv = np.zeros(2 ** n, dtype=complex)
                prev_sv[0] = 1.0

                step_index = 0
                for moment_idx, step_result in enumerate(
                    sim.simulate_moment_steps(gate_only_circuit, qubit_order=qubits)
                ):
                    sv_after = np.array(step_result.state_vector(), dtype=complex)
                    op = gate_ops_in_order[moment_idx]

                    execution_trace.append({
                        "step_index": step_index,
                        "operation_type": "gate",
                        "operation_name": op.gate,
                        "qubits": list(op.qubits),
                        "control_qubits": _get_control_qubits(op),
                        "parameters": dict(op.parameters) if op.parameters else None,
                        "statevector_before": _sv_to_list(prev_sv),
                        "statevector_after": _sv_to_list(sv_after),
                        "probabilities_before": _compute_probs(prev_sv, n),
                        "probabilities_after": _compute_probs(sv_after, n),
                        "is_measurement": False,
                        "measurement_result": None,
                        "classical_bits_before": None,
                        "classical_bits_after": None,
                        "is_reset": False,
                        "is_conditional": False,
                        "conditional_executed": None,
                        "backend": "cirq",
                        "provenance": "real_execution",
                    })
                    prev_sv = sv_after.copy()
                    step_index += 1

                trace_capability = "full"
                final_gate_sv = prev_sv

            except Exception as e:
                # Trace pass failed — fall back
                trace_capability = "unavailable"
                trace_reason = f"Cirq simulate_moment_steps failed: {str(e)}"
                execution_trace = []
                final_gate_sv = None
        else:
            # No gate operations — initial state
            final_gate_sv = np.zeros(2 ** n, dtype=complex)
            final_gate_sv[0] = 1.0
            trace_capability = "full"
            step_index = 0

        # ── Pass 2: Full simulation for final statevector and measurement ─────
        all_ops = []
        for op in circuit.operations:
            if isinstance(op, GateNode):
                all_ops.append(_make_cirq_op(op, qubits))

        meas_qubits_ordered = None
        if has_measurement:
            measured_indices = []
            for op in circuit.operations:
                if isinstance(op, MeasurementNode):
                    measured_indices.extend(op.qubits)
            measured_indices = sorted(set(measured_indices))
            meas_qubits_ordered = [qubits[i] for i in measured_indices]
            all_ops.append(cirq.measure(*meas_qubits_ordered, key="m"))

        full_circuit = cirq.Circuit(all_ops)
        sim2 = cirq.Simulator()

        # Get final statevector from gate-only circuit
        gate_only_full = cirq.Circuit([_make_cirq_op(op, qubits) for op in gate_ops_in_order])
        sv_result = sim2.simulate(gate_only_full, qubit_order=qubits)
        sv_array = np.array(sv_result.final_state_vector, dtype=complex)

        probs_array = np.abs(sv_array) ** 2
        probabilities = {}
        for idx, prob in enumerate(probs_array):
            if prob > 1e-10:
                bitstr = bin(idx)[2:].zfill(n)
                probabilities[bitstr] = float(prob)

        # Measurement
        measurement_str: Optional[str] = None
        measurement_bits: Optional[List[int]] = None

        if has_measurement:
            meas_result = sim2.run(full_circuit, repetitions=1)
            raw_bits = meas_result.measurements["m"][0]
            measurement_bits = [int(b) for b in raw_bits]
            measurement_str = "".join(str(b) for b in measurement_bits)

            # Add measurement TraceStep
            pre_meas_sv = sv_array  # state before measurement collapse
            # Post-measurement: collapse to measured state
            meas_state_idx = int(measurement_str, 2)
            post_meas_sv = np.zeros(2 ** n, dtype=complex)
            post_meas_sv[meas_state_idx] = 1.0

            if trace_capability == "full":
                for op in circuit.operations:
                    if isinstance(op, MeasurementNode):
                        execution_trace.append({
                            "step_index": step_index,
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
                            "backend": "cirq",
                            "provenance": "real_execution",
                        })
                        step_index += 1
                        break

        return {
            "statevector": sv_array,
            "probabilities": probabilities,
            "measurement": measurement_str,
            "num_qubits": n,
            "execution_trace": execution_trace,
            "trace_capability": trace_capability,
            "trace_reason": trace_reason,
        }
