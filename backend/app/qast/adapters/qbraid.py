"""
qBraid Quantum Backend Adapter.

Integrates qBraid into the Q-AST backend architecture.
Provides capability metadata and handles configuration/credential checks.
Returns an honest configuration error when credentials or dependencies are absent.
Never fabricates hardware execution or fake quantum results.
"""
import os
from typing import Dict, Any
from app.qast.nodes import Circuit

# qBraid backend capability metadata
QBRAID_CAPABILITIES = {
    "backend_name": "qbraid",
    "display_name": "qBraid Platform",
    "provider": "qBraid",
    "supports_trace": False,
    "hardware_access": True,
    "requires_credentials": True,
    "version": "1.0.0"
}


class QBraidAdapter:
    """
    Adapter for qBraid quantum execution.
    """
    def __init__(self):
        self.capabilities = QBRAID_CAPABILITIES

    def execute(self, circuit: Circuit) -> Dict[str, Any]:
        api_key = os.getenv("QBRAID_API_KEY")
        if not api_key:
            raise ValueError(
                "configuration_error: qBraid API key (QBRAID_API_KEY) is not configured. "
                "Please set a valid qBraid API key in your environment to submit jobs to qBraid."
            )

        try:
            import qbraid
        except ImportError:
            raise ValueError(
                "configuration_error: The 'qbraid' Python package is not installed. "
                "Please install qbraid (`pip install qbraid`) to use this backend."
            )

        try:
            device_id = os.getenv("QBRAID_DEVICE_ID", "aws_sv1_simulator")
            device = qbraid.get_device(device_id)
            job = device.run(circuit)
            result = job.result()
            
            return {
                "statevector": getattr(result, "statevector", None),
                "probabilities": getattr(result, "probabilities", {}),
                "measurement": getattr(result, "measurement", None),
                "num_qubits": circuit.num_qubits,
                "execution_trace": [],
                "trace_capability": "unavailable",
                "trace_reason": "qBraid remote device execution does not support step-by-step statevector tracing",
                "job_id": getattr(job, "id", None),
                "device_id": device_id,
            }
        except Exception as e:
            raise ValueError(f"qbraid_execution_error: {str(e)}")
