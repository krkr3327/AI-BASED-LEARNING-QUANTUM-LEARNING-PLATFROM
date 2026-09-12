"""
Simulation Service.

Orchestrates backend selection, execution, normalization, and response
construction. Supports both single-backend and parallel multi-backend runs.

PARALLEL EXECUTION:
  Uses concurrent.futures.ThreadPoolExecutor to submit all selected backends
  concurrently. Each backend's started_at and completed_at are real
  time.time() measurements — never fabricated.

TRACE:
  After normalization, the QuantumResult.execution_trace and
  trace_capability are mapped into the CircuitResponse. The execution_trace
  is always either a genuine list of real snapshots or an empty list [].
  Synthetic trace steps are never created.
"""
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Dict, List

from app.qast.nodes import Circuit
from app.qast.adapters.custom_engine import CustomEngineAdapter
from app.qast.adapters.qiskit_aer import QiskitAerAdapter
from app.qast.adapters.pennylane import PennyLaneAdapter
from app.qast.adapters.cirq import CirqAdapter
from app.qast.adapters.qbraid import QBraidAdapter
from app.results.normalizers.custom_engine import CustomEngineNormalizer
from app.results.normalizers.qiskit_aer import QiskitAerNormalizer
from app.results.normalizers.pennylane import PennyLaneNormalizer
from app.results.normalizers.cirq import CirqNormalizer
from app.results.normalizers.qbraid import QBraidNormalizer
from app.schemas.circuit import CircuitResponse, ParallelBackendResult, ParallelSimulationResponse
from fastapi import HTTPException
from app.results.models import ExecutionError, QuantumResult


class SimulationService:
    def __init__(self):
        self.adapters = {
            "custom_m1": CustomEngineAdapter(),
            "qiskit_aer": QiskitAerAdapter(),
            "pennylane": PennyLaneAdapter(),
            "cirq": CirqAdapter(),
            "qbraid": QBraidAdapter(),
        }
        self.normalizers = {
            "custom_m1": CustomEngineNormalizer(),
            "qiskit_aer": QiskitAerNormalizer(),
            "pennylane": PennyLaneNormalizer(),
            "cirq": CirqNormalizer(),
            "qbraid": QBraidNormalizer(),
        }

    def run_simulation(self, qast_circuit: Circuit, backend: str = "custom_m1") -> CircuitResponse:
        try:
            if backend not in self.adapters:
                raise ValueError(f"Unknown backend: {backend}")

            adapter = self.adapters[backend]
            normalizer = self.normalizers[backend]

            # 1. Execute via Adapter
            raw_result = adapter.execute(qast_circuit)

            # 2. Normalize
            result = normalizer.normalize(raw_result, qast_circuit.num_qubits)

            if result.status == "error":
                raise HTTPException(status_code=500, detail=result.error.message)

            # 3. Build response with trace
            response_dict = result.model_dump()

            # Convert TraceStep models to plain dicts for CircuitResponse
            trace_steps_raw = []
            for step in result.execution_trace:
                step_dict = step.model_dump()
                # Convert ComplexAmplitude lists to plain dicts
                step_dict["statevector_before"] = [
                    {"real": a.real, "imag": a.imag} for a in step.statevector_before
                ]
                step_dict["statevector_after"] = [
                    {"real": a.real, "imag": a.imag} for a in step.statevector_after
                ]
                trace_steps_raw.append(step_dict)

            return CircuitResponse(
                status=result.status,
                backend_name=result.backend_name,
                num_qubits=result.num_qubits,
                probabilities=result.probabilities,
                statevector=[{"real": a.real, "imag": a.imag} for a in result.statevector] if result.statevector else None,
                measurement=result.measurement,
                classical_bits=result.classical_bits,
                execution_history=result.execution_history,
                metadata=result.metadata,
                execution_trace=trace_steps_raw,
                trace_capability=result.trace_capability,
                trace_reason=result.trace_capability.reason,
            )

        except HTTPException:
            raise
        except ValueError as e:
            msg = str(e)
            if ":" in msg:
                err_type, err_msg = msg.split(":", 1)
                error_obj = ExecutionError(error_type=err_type.strip(), message=err_msg.strip())
            else:
                error_obj = ExecutionError(error_type="backend_failure", message=msg)
            raise HTTPException(status_code=500, detail=error_obj.message)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    def run_parallel(
        self, qast_circuit: Circuit, backends: List[str]
    ) -> ParallelSimulationResponse:
        """
        Execute the same Q-AST circuit on all requested backends concurrently.

        Uses ThreadPoolExecutor to submit all backends simultaneously.
        started_at and completed_at are real time.time() values from actual execution.
        No fake RUNNING states are ever emitted.
        """
        if not backends:
            raise ValueError("At least one backend must be specified.")

        unknown = [b for b in backends if b not in self.adapters]
        if unknown:
            raise ValueError(f"Unknown backends: {unknown}")

        wall_start = time.time()
        results: Dict[str, ParallelBackendResult] = {}

        def _run_one(backend: str):
            started_at = time.time()
            try:
                response = self.run_simulation(qast_circuit, backend)
                completed_at = time.time()
                return backend, ParallelBackendResult(
                    backend=backend,
                    status="success",
                    started_at=started_at,
                    completed_at=completed_at,
                    duration_ms=(completed_at - started_at) * 1000.0,
                    result=response,
                )
            except Exception as e:
                completed_at = time.time()
                return backend, ParallelBackendResult(
                    backend=backend,
                    status="error",
                    started_at=started_at,
                    completed_at=completed_at,
                    duration_ms=(completed_at - started_at) * 1000.0,
                    error=str(e),
                )

        with ThreadPoolExecutor(max_workers=len(backends)) as executor:
            futures = {executor.submit(_run_one, b): b for b in backends}
            for future in as_completed(futures):
                backend_name, backend_result = future.result()
                results[backend_name] = backend_result

        wall_end = time.time()

        return ParallelSimulationResponse(
            results=results,
            backends_requested=backends,
            total_duration_ms=(wall_end - wall_start) * 1000.0,
        )
