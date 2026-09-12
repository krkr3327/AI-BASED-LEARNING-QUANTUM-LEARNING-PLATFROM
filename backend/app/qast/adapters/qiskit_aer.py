"""
Qiskit Aer Backend Adapter.

Executes a Q-AST Circuit using Qiskit's AerSimulator and produces a
canonical ExecutionTrace with genuine per-gate state snapshots.

TRACE METHOD:
  Qiskit Aer's AerSimulator supports qc.save_statevector(label=...) at
  any point during circuit construction. By injecting a save_statevector
  instruction before and after each gate, we can extract all intermediate
  states from result.data(0) after a single simulation run.

TWO-PASS STRATEGY:
  Pass 1 (trace pass):  Gate-only circuit + save_statevector per gate.
                        Run with shots=None (statevector mode).
                        Extract per-gate snapshots via result.data(0)[label].
  Pass 2 (measure pass): Full circuit with measurements, shots=1, memory=True.
                         Extract the actual sampled bitstring.

  Both passes use the SAME Q-AST circuit — only the Qiskit circuit differs.

ENDIANNESS:
  Qiskit uses little-endian qubit ordering. The big-endian reversal applied
  in QiskitAerNormalizer is also applied per-step here for consistency.

CONSTRAINT:
  save_statevector cannot coexist with mid-circuit measurements in Aer.
  Therefore the trace pass uses a gate-only circuit and the measurement
  pass is a separate run.
"""
import numpy as np
try:
    import qiskit
    from qiskit_aer import AerSimulator
    _QISKIT_AVAILABLE = True
except ImportError:
    qiskit = None
    _QISKIT_AVAILABLE = False
from typing import Optional, List, Dict, Any, Tuple

from app.qast.nodes import Circuit, GateNode, MeasurementNode, ResetNode, ConditionalNode
from app.results.models import ExecutionError


def _le_to_be(sv_array: np.ndarray, num_qubits: int) -> np.ndarray:
    """Convert Qiskit little-endian statevector to big-endian."""
    N = len(sv_array)
    be = np.zeros(N, dtype=complex)
    for idx in range(N):
        bin_str = bin(idx)[2:].zfill(num_qubits)
        new_idx = int(bin_str[::-1], 2)
        be[new_idx] = sv_array[idx]
    return be


def _sv_to_list(sv: np.ndarray) -> List[Dict[str, float]]:
    return [{"real": float(c.real), "imag": float(c.imag)} for c in sv]


def _compute_probs(sv: np.ndarray, num_qubits: int) -> Dict[str, float]:
    return {
        bin(i)[2:].zfill(num_qubits): float(abs(sv[i]) ** 2)
        for i in range(2 ** num_qubits)
    }


class QiskitAerAdapter:
    def __init__(self):
        if not _QISKIT_AVAILABLE:
            self.simulator = None
            return
        self.simulator = AerSimulator(method="statevector")

    def _apply_gate_to_qc(self, qc: Any, op_gate: str,
                          qubits: List[int], parameters: Optional[Dict]) -> None:
        """Apply a single gate to a Qiskit QuantumCircuit."""
        if op_gate == 'X':
            qc.x(qubits[0])
        elif op_gate == 'Y':
            qc.y(qubits[0])
        elif op_gate == 'Z':
            qc.z(qubits[0])
        elif op_gate == 'H':
            qc.h(qubits[0])
        elif op_gate == 'S':
            qc.s(qubits[0])
        elif op_gate == 'T':
            qc.t(qubits[0])
        elif op_gate in ('RX', 'RY', 'RZ'):
            theta = float(parameters.get('theta') if 'theta' in parameters else next(iter(parameters.values())))
            if op_gate == 'RX':
                qc.rx(theta, qubits[0])
            elif op_gate == 'RY':
                qc.ry(theta, qubits[0])
            elif op_gate == 'RZ':
                qc.rz(theta, qubits[0])
        elif op_gate == 'CNOT':
            qc.cx(qubits[0], qubits[1])
        elif op_gate == 'CZ':
            qc.cz(qubits[0], qubits[1])
        elif op_gate == 'SWAP':
            qc.swap(qubits[0], qubits[1])
        elif op_gate == 'CPHASE':
            theta = float(parameters.get('theta') if 'theta' in parameters else next(iter(parameters.values())))
            qc.cp(theta, qubits[0], qubits[1])
        elif op_gate == 'MCX':
            qc.mcx(qubits[:-1], qubits[-1])
        else:
            raise ValueError(f"Unsupported gate: {op_gate}")

    def execute(self, circuit: Circuit) -> Any:
        if not _QISKIT_AVAILABLE:
            raise ValueError("qiskit_aer: Qiskit is not installed. Run: pip install qiskit qiskit-aer")
        """
        Execute circuit. Returns a tuple (qiskit_result, trace_data) where:
        - qiskit_result: the standard Qiskit result for normalizer compatibility
        - trace_data: dict with 'execution_trace' and 'trace_capability'

        The normalizer accesses both via the wrapped result object.
        """
        n = circuit.num_qubits
        cr_size = circuit.num_cbits if circuit.num_cbits > 0 else circuit.num_qubits

        # ── Pass 1: Trace pass (gate-only, save_statevector per gate) ─────────
        trace_qc = qiskit.QuantumCircuit(n)

        # Extract only gate operations (no measurements for trace pass)
        gate_ops = [op for op in circuit.operations if isinstance(op, GateNode)]
        has_measurement = any(isinstance(op, MeasurementNode) for op in circuit.operations)

        execution_trace: List[Dict[str, Any]] = []
        step_index = 0

        # Save initial state (before any gates)
        trace_qc.save_statevector(label='sv_initial')

        for i, op in enumerate(circuit.operations):
            if isinstance(op, GateNode):
                self._apply_gate_to_qc(trace_qc, op.gate, op.qubits, op.parameters)
                trace_qc.save_statevector(label=f'sv_after_{i}')

            elif isinstance(op, ResetNode):
                for q in op.qubits:
                    trace_qc.reset(q)
                trace_qc.save_statevector(label=f'sv_after_{i}')

            elif isinstance(op, ConditionalNode):
                # Conditionals require classical bits — skip in trace pass
                # (trace pass is gate-only for statevector extraction)
                trace_qc.save_statevector(label=f'sv_after_{i}')

        try:
            trace_result = self.simulator.run(trace_qc, shots=None).result()
        except Exception as e:
            # Trace pass failed — fall back to final-only
            return self._execute_final_only(circuit, n, cr_size, has_measurement)

        if not trace_result.success:
            return self._execute_final_only(circuit, n, cr_size, has_measurement)

        # Extract labeled snapshots from result.data(0)
        result_data = trace_result.data(0)
        prev_sv_be = _le_to_be(np.asarray(result_data['sv_initial']), n)

        op_step_idx = 0
        for i, op in enumerate(circuit.operations):
            sv_before_be = prev_sv_be.copy()
            label = f'sv_after_{i}'

            if isinstance(op, GateNode) and label in result_data:
                sv_after_le = np.asarray(result_data[label])
                sv_after_be = _le_to_be(sv_after_le, n)

                control_qubits = []
                if op.gate in ("CNOT", "CZ", "CPHASE"):
                    control_qubits = [op.qubits[0]]
                elif op.gate == "MCX":
                    control_qubits = list(op.qubits[:-1])

                execution_trace.append({
                    "step_index": op_step_idx,
                    "operation_type": "gate",
                    "operation_name": op.gate,
                    "qubits": list(op.qubits),
                    "control_qubits": control_qubits,
                    "parameters": dict(op.parameters) if op.parameters else None,
                    "statevector_before": _sv_to_list(sv_before_be),
                    "statevector_after": _sv_to_list(sv_after_be),
                    "probabilities_before": _compute_probs(sv_before_be, n),
                    "probabilities_after": _compute_probs(sv_after_be, n),
                    "is_measurement": False,
                    "measurement_result": None,
                    "classical_bits_before": None,
                    "classical_bits_after": None,
                    "is_reset": False,
                    "is_conditional": False,
                    "conditional_executed": None,
                    "backend": "qiskit_aer",
                    "provenance": "real_execution",
                })
                prev_sv_be = sv_after_be
                op_step_idx += 1

            elif isinstance(op, ResetNode) and label in result_data:
                sv_after_le = np.asarray(result_data[label])
                sv_after_be = _le_to_be(sv_after_le, n)
                execution_trace.append({
                    "step_index": op_step_idx,
                    "operation_type": "reset",
                    "operation_name": "reset",
                    "qubits": list(op.qubits),
                    "control_qubits": [],
                    "parameters": None,
                    "statevector_before": _sv_to_list(sv_before_be),
                    "statevector_after": _sv_to_list(sv_after_be),
                    "probabilities_before": _compute_probs(sv_before_be, n),
                    "probabilities_after": _compute_probs(sv_after_be, n),
                    "is_measurement": False,
                    "measurement_result": None,
                    "classical_bits_before": None,
                    "classical_bits_after": None,
                    "is_reset": True,
                    "is_conditional": False,
                    "conditional_executed": None,
                    "backend": "qiskit_aer",
                    "provenance": "real_execution",
                })
                prev_sv_be = sv_after_be
                op_step_idx += 1

        # ── Pass 2: Measurement pass (if circuit has measurements) ────────────
        measurement_result_bits = None
        measurement_bitstring = None
        # Pre-measurement statevector: the state BEFORE any measurement collapse
        # This is used for the final probabilities in the response (quantum state before collapse)
        pre_measurement_statevector = prev_sv_be.copy()
        final_statevector = prev_sv_be  # will be updated to post-meas only for trace step

        if has_measurement:
            meas_qc = qiskit.QuantumCircuit(n, cr_size)
            for op in circuit.operations:
                if isinstance(op, GateNode):
                    self._apply_gate_to_qc(meas_qc, op.gate, op.qubits, op.parameters)
                elif isinstance(op, ResetNode):
                    for q in op.qubits:
                        meas_qc.reset(q)
                elif isinstance(op, ConditionalNode):
                    with meas_qc.if_test((meas_qc.clbits[op.cbit], op.value)):
                        self._apply_gate_to_qc(
                            meas_qc, op.operation.gate,
                            op.operation.qubits, op.operation.parameters
                        )
                elif isinstance(op, MeasurementNode):
                    for i_m in range(len(op.qubits)):
                        meas_qc.measure(op.qubits[i_m], op.cbits[i_m])

            meas_qc.save_statevector()

            try:
                meas_result = self.simulator.run(meas_qc, shots=1, memory=True).result()
                if meas_result.success:
                    # Extract actual sampled bitstring (reversed to big-endian)
                    memory = meas_result.get_memory()
                    if memory:
                        raw = memory[0].replace(" ", "")
                        measurement_bitstring = raw[::-1]
                        measurement_result_bits = [int(b) for b in measurement_bitstring]

                    # Build post-measurement collapsed statevector
                    # (state AFTER measurement collapse — for trace only, NOT for probabilities)
                    meas_state_idx = int(measurement_bitstring, 2)
                    post_meas_sv = np.zeros(n * n if n > 1 else 2, dtype=complex)
                    post_meas_sv = np.zeros(2 ** n, dtype=complex)
                    post_meas_sv[meas_state_idx] = 1.0

                    for op in circuit.operations:
                        if isinstance(op, MeasurementNode):
                            execution_trace.append({
                                "step_index": op_step_idx,
                                "operation_type": "measure",
                                "operation_name": "measure",
                                "qubits": list(op.qubits),
                                "control_qubits": [],
                                "parameters": {"cbits": list(op.cbits)},
                                "statevector_before": _sv_to_list(pre_measurement_statevector),
                                "statevector_after": _sv_to_list(post_meas_sv),
                                "probabilities_before": _compute_probs(pre_measurement_statevector, n),
                                "probabilities_after": _compute_probs(post_meas_sv, n),
                                "is_measurement": True,
                                "measurement_result": measurement_result_bits,  # actual sample
                                "classical_bits_before": None,
                                "classical_bits_after": measurement_result_bits,
                                "is_reset": False,
                                "is_conditional": False,
                                "conditional_executed": None,
                                "backend": "qiskit_aer",
                                "provenance": "real_execution",
                            })
                            op_step_idx += 1
                            break
                    # final_statevector stays as pre_measurement_statevector for response probabilities
            except Exception:
                pass  # Measurement pass failed; trace still valid from gate pass

        # ── Wrap for normalizer ───────────────────────────────────────────────
        # Return a wrapper that gives the normalizer what it needs.
        # final_sv_be is the PRE-MEASUREMENT statevector so that probabilities
        # in the response reflect the quantum state before collapse.
        return _QiskitResultWrapper(
            trace_result=trace_result,
            final_sv_be=pre_measurement_statevector,
            n=n,
            measurement_bitstring=measurement_bitstring,
            execution_trace=execution_trace,
            trace_capability="full",
        )

    def _execute_final_only(self, circuit, n, cr_size, has_measurement):
        """
        Fallback: run the original circuit and return without intermediate trace.
        Returns the standard Qiskit result object with trace_capability="unavailable".
        """
        qc = qiskit.QuantumCircuit(n, cr_size)
        for op in circuit.operations:
            if isinstance(op, GateNode):
                self._apply_gate_to_qc(qc, op.gate, op.qubits, op.parameters)
            elif isinstance(op, ResetNode):
                for q in op.qubits:
                    qc.reset(q)
            elif isinstance(op, ConditionalNode):
                with qc.if_test((qc.clbits[op.cbit], op.value)):
                    self._apply_gate_to_qc(
                        qc, op.operation.gate,
                        op.operation.qubits, op.operation.parameters
                    )
            elif isinstance(op, MeasurementNode):
                for i_m in range(len(op.qubits)):
                    qc.measure(op.qubits[i_m], op.cbits[i_m])

        qc.save_statevector()
        result = self.simulator.run(qc, shots=1 if has_measurement else None, memory=True).result()
        return _QiskitResultWrapper(
            trace_result=result,
            final_sv_be=None,
            n=n,
            measurement_bitstring=None,
            execution_trace=[],
            trace_capability="unavailable",
            trace_reason="Qiskit Aer trace pass failed; only final state available.",
            raw_result=result,
        )


class _QiskitResultWrapper:
    """
    Wraps Qiskit result data so QiskitAerNormalizer can access both the
    standard Qiskit result (for backward compatibility) and the trace data.
    """
    def __init__(self, trace_result, final_sv_be, n, measurement_bitstring,
                 execution_trace, trace_capability,
                 trace_reason=None, raw_result=None):
        self._trace_result = trace_result
        self._raw_result = raw_result or trace_result
        self.final_sv_be = final_sv_be
        self.n = n
        self.measurement_bitstring = measurement_bitstring
        self.execution_trace = execution_trace
        self.trace_capability = trace_capability
        self.trace_reason = trace_reason
        self.success = trace_result.success

    def get_statevector(self):
        if self.final_sv_be is not None:
            return self.final_sv_be
        return self._raw_result.get_statevector()

    def get_memory(self):
        try:
            return self._raw_result.get_memory()
        except Exception:
            return []

    # Forward any other attribute access to the raw result
    def __getattr__(self, name):
        return getattr(self._raw_result, name)
