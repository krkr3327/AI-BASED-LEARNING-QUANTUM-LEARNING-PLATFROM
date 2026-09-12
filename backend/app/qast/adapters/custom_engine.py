"""
Custom M1 Quantum Engine Adapter.

Executes a Q-AST Circuit using our own NumPy statevector engine and
produces a canonical ExecutionTrace with genuine per-gate state snapshots.

TRACE CONTRACT:
- Every TraceStep contains real statevector_before and statevector_after
  captured by copying state.vector immediately before and after each gate.
- No statevector is fabricated, interpolated, or reconstructed.
- measurement_result contains the actual bits returned by measure_qubit().
- provenance is always "real_execution".
- Synthetic TraceStep objects are permanently forbidden.

EXECUTION vs. REPLAY:
- This adapter performs EXECUTION (real quantum state evolution).
- The frontend QuantumTracePlayer performs REPLAY (reading captured snapshots).
- These are separate concerns. The frontend never re-simulates quantum states.
"""
import numpy as np
from typing import List, Dict, Any

from app.qast.nodes import Circuit, GateNode, MeasurementNode, ResetNode, ConditionalNode
from app.quantum_engine.state import QuantumState
from app.quantum_engine.classical_state import ClassicalState
from app.quantum_engine.operations import (
    apply_single_qubit_gate, apply_cnot_gate, apply_cz_gate,
    apply_swap_gate, apply_cphase_gate, apply_mcx_gate, apply_reset_gate
)
from app.quantum_engine import measurement


def _sv_to_list(sv: np.ndarray) -> List[Dict[str, float]]:
    """Convert a numpy complex128 array to a list of {real, imag} dicts."""
    return [{"real": float(c.real), "imag": float(c.imag)} for c in sv]


def _compute_probs(sv: np.ndarray, num_qubits: int) -> Dict[str, float]:
    """Compute probability distribution from statevector (big-endian bitstrings)."""
    return {
        bin(i)[2:].zfill(num_qubits): float(abs(sv[i]) ** 2)
        for i in range(2 ** num_qubits)
    }


def _get_control_qubits(op: GateNode) -> List[int]:
    """Return the control qubits for two-qubit and multi-controlled gates."""
    if op.gate in ("CNOT", "CZ", "CPHASE"):
        return [op.qubits[0]]
    if op.gate == "MCX":
        return op.qubits[:-1]
    return []


class CustomEngineAdapter:
    def execute(self, circuit: Circuit) -> Dict[str, Any]:
        """
        Execute the circuit and return a result dict containing:
        - probabilities, measured_state, statevector, classical_bits
        - execution_history  (legacy field)
        - execution_trace    (canonical TraceStep dicts, real snapshots only)
        - trace_capability   ("full")
        """
        n = circuit.num_qubits
        state = QuantumState(num_qubits=n)
        classical_state = ClassicalState(num_cbits=circuit.num_cbits)

        execution_history: List[Dict[str, Any]] = []
        execution_trace: List[Dict[str, Any]] = []
        step_index = 0

        pre_measurement_probs = None
        pre_measurement_statevector = None

        def _snapshot_before() -> tuple:
            sv = state.vector.copy()
            return sv, _sv_to_list(sv), _compute_probs(sv, n)

        def _snapshot_after() -> tuple:
            sv = state.vector.copy()
            return sv, _sv_to_list(sv), _compute_probs(sv, n)

        def _emit_trace_step(
            idx: int,
            op_type: str,
            op_name: str,
            qubits: List[int],
            control_qubits: List[int],
            parameters: Any,
            sv_before_list: List[Dict],
            probs_before: Dict[str, float],
            sv_after_list: List[Dict],
            probs_after: Dict[str, float],
            is_measurement: bool = False,
            measurement_result: Any = None,
            cbits_before: Any = None,
            cbits_after: Any = None,
            is_reset: bool = False,
            is_conditional: bool = False,
            conditional_executed: Any = None,
        ) -> Dict[str, Any]:
            """
            Build a canonical TraceStep dict.
            provenance is always "real_execution" — never fabricated.
            """
            step = {
                "step_index": idx,
                "operation_type": op_type,
                "operation_name": op_name,
                "qubits": qubits,
                "control_qubits": control_qubits,
                "parameters": parameters,
                "statevector_before": sv_before_list,
                "statevector_after": sv_after_list,
                "probabilities_before": probs_before,
                "probabilities_after": probs_after,
                "is_measurement": is_measurement,
                "measurement_result": measurement_result,
                "classical_bits_before": cbits_before,
                "classical_bits_after": cbits_after,
                "is_reset": is_reset,
                "is_conditional": is_conditional,
                "conditional_executed": conditional_executed,
                "backend": "custom_m1",
                "provenance": "real_execution",
            }
            return step

        def execute_gate(op: GateNode, cond_str: str = None):
            nonlocal state, step_index

            # Snapshot BEFORE (real state, not fabricated)
            sv_before_np, sv_before_list, probs_before = _snapshot_before()

            # Apply gate (actual quantum operation)
            if op.gate == "CNOT":
                state.vector = apply_cnot_gate(state.vector, n, op.qubits[0], op.qubits[1])
            elif op.gate == "CZ":
                state.vector = apply_cz_gate(state.vector, n, op.qubits[0], op.qubits[1])
            elif op.gate == "SWAP":
                state.vector = apply_swap_gate(state.vector, n, op.qubits[0], op.qubits[1])
            elif op.gate == "CPHASE":
                state.vector = apply_cphase_gate(
                    state.vector, n, op.qubits[0], op.qubits[1],
                    float(op.parameters["theta"])
                )
            elif op.gate == "MCX":
                state.vector = apply_mcx_gate(state.vector, n, op.qubits[:-1], op.qubits[-1])
            else:
                state.vector = apply_single_qubit_gate(
                    state.vector, n, op.qubits[0], op.gate, op.parameters
                )
            state.normalize()

            # Snapshot AFTER (real state after gate)
            _, sv_after_list, probs_after = _snapshot_after()

            # Legacy history
            hist = {"step": step_index, "operation": op.gate, "qubits": op.qubits}
            if cond_str is not None:
                hist["condition"] = cond_str
                hist["executed"] = True
            execution_history.append(hist)

            # Canonical trace step (real snapshots, real provenance)
            execution_trace.append(_emit_trace_step(
                idx=step_index,
                op_type="gate",
                op_name=op.gate,
                qubits=list(op.qubits),
                control_qubits=_get_control_qubits(op),
                parameters=dict(op.parameters) if op.parameters else None,
                sv_before_list=sv_before_list,
                probs_before=probs_before,
                sv_after_list=sv_after_list,
                probs_after=probs_after,
                is_conditional=(cond_str is not None),
                conditional_executed=True if cond_str is not None else None,
            ))

        # ── Main execution loop ──────────────────────────────────────────────
        for op in circuit.operations:

            if isinstance(op, GateNode):
                execute_gate(op)
                step_index += 1

            elif isinstance(op, MeasurementNode):
                # Snapshot BEFORE measurement (pre-collapse state)
                sv_before_np, sv_before_list, probs_before = _snapshot_before()
                cbits_before = list(classical_state.bits)

                if pre_measurement_probs is None:
                    pre_measurement_probs = measurement.calculate_probabilities(state)
                    pre_measurement_statevector = state.vector.copy()

                # Actual stochastic measurement — each bit is a real random sample
                results = []
                for q, c in zip(op.qubits, op.cbits):
                    res = measurement.measure_qubit(state, q)  # real random collapse
                    classical_state.set_bit(c, res)
                    results.append(res)

                cbits_after = list(classical_state.bits)

                # Snapshot AFTER measurement (post-collapse state)
                _, sv_after_list, probs_after = _snapshot_after()

                # Legacy history
                execution_history.append({
                    "step": step_index,
                    "operation": "measure",
                    "qubits": op.qubits,
                    "cbits": op.cbits,
                    "result": results if len(results) > 1 else results[0],
                })

                # Canonical trace step — measurement_result from ACTUAL samples
                execution_trace.append(_emit_trace_step(
                    idx=step_index,
                    op_type="measure",
                    op_name="measure",
                    qubits=list(op.qubits),
                    control_qubits=[],
                    parameters={"cbits": list(op.cbits)},
                    sv_before_list=sv_before_list,
                    probs_before=probs_before,
                    sv_after_list=sv_after_list,
                    probs_after=probs_after,
                    is_measurement=True,
                    measurement_result=results,    # actual sampled bits, never hardcoded
                    cbits_before=cbits_before,
                    cbits_after=cbits_after,
                ))
                step_index += 1

            elif isinstance(op, ResetNode):
                sv_before_np, sv_before_list, probs_before = _snapshot_before()

                for q in op.qubits:
                    state.vector = apply_reset_gate(state.vector, n, q)

                _, sv_after_list, probs_after = _snapshot_after()

                execution_history.append({
                    "step": step_index,
                    "operation": "reset",
                    "qubits": op.qubits,
                })
                execution_trace.append(_emit_trace_step(
                    idx=step_index,
                    op_type="reset",
                    op_name="reset",
                    qubits=list(op.qubits),
                    control_qubits=[],
                    parameters=None,
                    sv_before_list=sv_before_list,
                    probs_before=probs_before,
                    sv_after_list=sv_after_list,
                    probs_after=probs_after,
                    is_reset=True,
                ))
                step_index += 1

            elif isinstance(op, ConditionalNode):
                cond_str = f"c{op.cbit} == {op.value}"
                executed = classical_state.get_bit(op.cbit) == op.value

                if executed:
                    execute_gate(op.operation, cond_str=cond_str)
                else:
                    # Skipped — statevector does not change
                    sv_now, sv_list, probs_now = _snapshot_before()

                    execution_history.append({
                        "step": step_index,
                        "operation": op.operation.gate,
                        "qubits": op.operation.qubits,
                        "condition": cond_str,
                        "executed": False,
                    })
                    execution_trace.append(_emit_trace_step(
                        idx=step_index,
                        op_type="conditional",
                        op_name=op.operation.gate,
                        qubits=list(op.operation.qubits),
                        control_qubits=[],
                        parameters=dict(op.operation.parameters) if op.operation.parameters else None,
                        sv_before_list=sv_list,
                        probs_before=probs_now,
                        sv_after_list=sv_list,   # state unchanged (skipped)
                        probs_after=probs_now,
                        is_conditional=True,
                        conditional_executed=False,
                    ))
                step_index += 1

        # ── Final result ─────────────────────────────────────────────────────
        if pre_measurement_probs is None:
            pre_measurement_probs = measurement.calculate_probabilities(state)
            pre_measurement_statevector = state.vector.copy()

        probs_dict = {
            bin(i)[2:].zfill(n): float(p)
            for i, p in enumerate(pre_measurement_probs)
        }

        measured_str = classical_state.get_bitstring() if circuit.num_cbits > 0 else None
        has_measurement = any(isinstance(op, MeasurementNode) for op in circuit.operations)
        if circuit.num_cbits == 0 and has_measurement:
            _, measured_str = measurement.measure(state)

        return {
            "probabilities": probs_dict,
            "measured_state": measured_str,
            "statevector": pre_measurement_statevector,
            "classical_bits": classical_state.bits,
            "execution_history": execution_history,
            "execution_trace": execution_trace,     # real snapshots only
            "trace_capability": "full",
        }
