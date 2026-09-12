"""
Custom Engine Result Normalizer.

Converts the raw result dict from CustomEngineAdapter into the canonical
QuantumResult model, including the ExecutionTrace.
"""
from app.results.models import QuantumResult, ComplexAmplitude, ExecutionError, TraceStep, TraceCapabilityInfo
from typing import Dict, Any, List


def _convert_trace_steps(raw_trace: List[Dict[str, Any]], backend_name: str) -> List[TraceStep]:
    """
    Convert raw trace step dicts (with numpy-derived data) into TraceStep models.
    Only processes steps with provenance="real_execution".
    Returns empty list if raw_trace is None or empty.
    """
    if not raw_trace:
        return []
    steps = []
    for step in raw_trace:
        if step.get("provenance") != "real_execution":
            continue  # Skip any non-real steps (should never exist, but guard anyway)
        steps.append(TraceStep(
            step_index=step["step_index"],
            operation_type=step["operation_type"],
            operation_name=step["operation_name"],
            qubits=step["qubits"],
            control_qubits=step.get("control_qubits", []),
            parameters=step.get("parameters"),
            statevector_before=[
                ComplexAmplitude(real=a["real"], imag=a["imag"])
                for a in step["statevector_before"]
            ],
            statevector_after=[
                ComplexAmplitude(real=a["real"], imag=a["imag"])
                for a in step["statevector_after"]
            ],
            probabilities_before=step["probabilities_before"],
            probabilities_after=step["probabilities_after"],
            is_measurement=step.get("is_measurement", False),
            measurement_result=step.get("measurement_result"),
            classical_bits_before=step.get("classical_bits_before"),
            classical_bits_after=step.get("classical_bits_after"),
            is_reset=step.get("is_reset", False),
            is_conditional=step.get("is_conditional", False),
            conditional_executed=step.get("conditional_executed"),
            backend=backend_name,
            provenance="real_execution",
        ))
    return steps


class CustomEngineNormalizer:
    def normalize(self, raw_result: Dict[str, Any], num_qubits: int) -> QuantumResult:
        try:
            import numpy as np
            state_array = raw_result.get("statevector")
            statevector_model = None
            if state_array is not None:
                statevector_model = [
                    ComplexAmplitude(real=float(amp.real), imag=float(amp.imag))
                    for amp in state_array
                ]

            # Convert execution trace (real snapshots only)
            raw_trace = raw_result.get("execution_trace", [])
            trace_steps = _convert_trace_steps(raw_trace, "custom_m1")

            cap = raw_result.get("trace_capability", "unavailable")
            trace_reason = raw_result.get("trace_reason")
            trace_cap = TraceCapabilityInfo(
                capability=cap,
                reason=trace_reason
            )

            return QuantumResult(
                status="success",
                backend_name="custom_m1",
                num_qubits=num_qubits,
                probabilities=raw_result.get("probabilities"),
                statevector=statevector_model,
                measurement=raw_result.get("measured_state"),
                classical_bits=raw_result.get("classical_bits"),
                execution_history=raw_result.get("execution_history"),
                metadata={"simulator": "custom_numpy_headless"},
                execution_trace=trace_steps,
                trace_capability=trace_cap,
            )
        except Exception as e:
            return QuantumResult(
                status="error",
                backend_name="custom_m1",
                num_qubits=num_qubits,
                error=ExecutionError(
                    error_type="normalization_error",
                    message=f"Failed to normalize result: {str(e)}"
                )
            )
