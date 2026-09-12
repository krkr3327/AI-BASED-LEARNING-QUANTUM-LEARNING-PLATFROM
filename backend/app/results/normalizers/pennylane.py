"""
PennyLane Result Normalizer.

Converts raw output from PennyLaneAdapter into the canonical QuantumResult.

The raw dict from the adapter uses BIG-ENDIAN ordering (PennyLane native),
so no bit-reversal is required.
"""
import numpy as np
from typing import Dict, Any
from app.results.models import QuantumResult, ComplexAmplitude, ExecutionError, TraceCapabilityInfo
from app.results.normalizers.custom_engine import _convert_trace_steps


class PennyLaneNormalizer:
    def normalize(self, raw_result: Dict[str, Any], num_qubits: int) -> QuantumResult:
        try:
            sv_array = raw_result.get("statevector")
            probabilities = raw_result.get("probabilities", {})
            measurement = raw_result.get("measurement")

            statevector_model = None
            if sv_array is not None:
                statevector_model = [
                    ComplexAmplitude(real=float(c.real), imag=float(c.imag))
                    for c in np.asarray(sv_array, dtype=complex)
                ]

            # Convert execution trace
            raw_trace = raw_result.get("execution_trace", [])
            trace_steps = _convert_trace_steps(raw_trace, "pennylane")

            cap = raw_result.get("trace_capability", "unavailable")
            trace_reason = raw_result.get("trace_reason")
            trace_cap = TraceCapabilityInfo(capability=cap, reason=trace_reason)

            return QuantumResult(
                status="success",
                backend_name="pennylane",
                num_qubits=num_qubits,
                probabilities=probabilities,
                statevector=statevector_model,
                measurement=measurement,
                metadata={"simulator": "pennylane_default_qubit"},
                execution_trace=trace_steps,
                trace_capability=trace_cap,
            )
        except Exception as e:
            return QuantumResult(
                status="error",
                backend_name="pennylane",
                num_qubits=num_qubits,
                error=ExecutionError(
                    error_type="normalization_error",
                    message=f"Failed to normalize PennyLane result: {str(e)}"
                )
            )
