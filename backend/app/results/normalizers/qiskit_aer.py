"""
Qiskit Aer Result Normalizer.

Converts the wrapped result from QiskitAerAdapter into the canonical QuantumResult.
The adapter returns a _QiskitResultWrapper that exposes:
  - .final_sv_be: final big-endian statevector (numpy array)
  - .measurement_bitstring: actual sampled bitstring (big-endian reversed)
  - .execution_trace: list of TraceStep dicts with provenance="real_execution"
  - .trace_capability: "full" | "unavailable"
  - .trace_reason: optional explanation string
"""
import numpy as np
from typing import Dict, List, Any
from app.results.models import QuantumResult, ComplexAmplitude, ExecutionError, TraceStep, TraceCapabilityInfo
from app.results.normalizers.custom_engine import _convert_trace_steps


class QiskitAerNormalizer:
    def normalize(self, raw_result, num_qubits: int) -> QuantumResult:
        try:
            if not raw_result.success:
                error_msg = getattr(raw_result, 'status', 'Unknown Qiskit execution error')
                return QuantumResult(
                    status="error",
                    backend_name="qiskit_aer",
                    num_qubits=num_qubits,
                    error=ExecutionError(error_type="backend_failure", message=str(error_msg))
                )

            # Get final statevector (already big-endian from wrapper)
            try:
                sv_raw = raw_result.get_statevector()
                if isinstance(sv_raw, np.ndarray):
                    sv_array = sv_raw
                else:
                    sv_array = np.asarray(sv_raw)

                # If the wrapper already provides big-endian (final_sv_be), use it
                if hasattr(raw_result, 'final_sv_be') and raw_result.final_sv_be is not None:
                    sv_array = raw_result.final_sv_be
                else:
                    # Fallback: apply big-endian reversal to raw Qiskit output
                    N = len(sv_array)
                    be = np.zeros(N, dtype=complex)
                    for idx in range(N):
                        bin_str = bin(idx)[2:].zfill(num_qubits)
                        new_idx = int(bin_str[::-1], 2)
                        be[new_idx] = sv_array[idx]
                    sv_array = be

            except Exception as e:
                return QuantumResult(
                    status="error",
                    backend_name="qiskit_aer",
                    num_qubits=num_qubits,
                    error=ExecutionError(error_type="statevector_extraction", message=str(e))
                )

            # Probabilities from final big-endian statevector
            probabilities: Dict[str, float] = {}
            for idx in range(len(sv_array)):
                prob = float(np.abs(sv_array[idx]) ** 2)
                if prob > 1e-10:
                    probabilities[bin(idx)[2:].zfill(num_qubits)] = prob

            statevector_models = [
                ComplexAmplitude(real=float(c.real), imag=float(c.imag))
                for c in sv_array
            ]

            # Measurement string (from wrapper or memory)
            measurement = getattr(raw_result, 'measurement_bitstring', None)
            if measurement is None:
                try:
                    memory = raw_result.get_memory()
                    if memory:
                        raw_meas = memory[0].replace(" ", "")
                        measurement = raw_meas[::-1]
                except Exception:
                    measurement = None

            # Convert execution trace
            raw_trace = getattr(raw_result, 'execution_trace', [])
            trace_steps = _convert_trace_steps(raw_trace, "qiskit_aer")

            cap = getattr(raw_result, 'trace_capability', 'unavailable')
            trace_reason = getattr(raw_result, 'trace_reason', None)
            trace_cap = TraceCapabilityInfo(capability=cap, reason=trace_reason)

            return QuantumResult(
                status="success",
                backend_name="qiskit_aer",
                num_qubits=num_qubits,
                probabilities=probabilities,
                statevector=statevector_models,
                measurement=measurement,
                metadata={"qiskit_shots": 1},
                execution_trace=trace_steps,
                trace_capability=trace_cap,
            )

        except Exception as e:
            return QuantumResult(
                status="error",
                backend_name="qiskit_aer",
                num_qubits=num_qubits,
                error=ExecutionError(error_type="normalization_error", message=str(e))
            )
