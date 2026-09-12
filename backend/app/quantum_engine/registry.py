from typing import Dict, Any, List
from pydantic import BaseModel

class BackendCapability(BaseModel):
    backend_id: str
    display_name: str
    status: str = "operational"
    max_qubits: int
    supported_gates: List[str]
    parameterized_gates: List[str]
    dynamic_circuits: bool
    mid_circuit_measurement: bool
    reset: bool
    conditional_operations: bool
    shots: bool
    statevector: bool
    probabilities: bool
    observables: bool
    expectation_values: bool
    noise_models: List[str]
    stabilizer: bool
    parameter_sweeps: bool
    hardware: bool
    supported_experiments: List[str]

BACKEND_REGISTRY: Dict[str, BackendCapability] = {
    "custom_m1": BackendCapability(
        backend_id="custom_m1",
        display_name="Custom NumPy M1 Reference Engine",
        status="operational",
        max_qubits=16,
        supported_gates=["X", "Y", "Z", "H", "S", "T", "RX", "RY", "RZ", "CNOT", "CZ", "SWAP", "CPHASE", "MCX"],
        parameterized_gates=["RX", "RY", "RZ", "CPHASE"],
        dynamic_circuits=True,
        mid_circuit_measurement=True,
        reset=True,
        conditional_operations=True,
        shots=True,
        statevector=True,
        probabilities=True,
        observables=True,
        expectation_values=True,
        noise_models=["bit_flip", "phase_flip", "depolarizing", "amplitude_damping"],
        stabilizer=False,
        parameter_sweeps=True,
        hardware=False,
        supported_experiments=["SIMULATION", "PARAMETER_SWEEP", "VQE", "QAOA", "QEC", "NOISE_EXPERIMENT"]
    ),
    "qiskit_aer": BackendCapability(
        backend_id="qiskit_aer",
        display_name="Qiskit Aer Simulator",
        status="operational",
        max_qubits=20,
        supported_gates=["X", "Y", "Z", "H", "S", "T", "RX", "RY", "RZ", "CNOT", "CZ", "SWAP", "CPHASE", "MCX"],
        parameterized_gates=["RX", "RY", "RZ", "CPHASE"],
        dynamic_circuits=True,
        mid_circuit_measurement=True,
        reset=True,
        conditional_operations=True,
        shots=True,
        statevector=True,
        probabilities=True,
        observables=True,
        expectation_values=True,
        noise_models=["bit_flip", "phase_flip", "depolarizing", "amplitude_damping"],
        stabilizer=False,
        parameter_sweeps=True,
        hardware=False,
        supported_experiments=["SIMULATION", "PARAMETER_SWEEP", "VQE", "QAOA", "QEC", "NOISE_EXPERIMENT"]
    ),
    "pennylane": BackendCapability(
        backend_id="pennylane",
        display_name="PennyLane default.qubit Simulator",
        status="operational",
        max_qubits=16,
        supported_gates=["X", "Y", "Z", "H", "S", "T", "RX", "RY", "RZ", "CNOT", "CZ", "SWAP", "CPHASE", "MCX"],
        parameterized_gates=["RX", "RY", "RZ", "CPHASE"],
        dynamic_circuits=False,
        mid_circuit_measurement=False,
        reset=False,
        conditional_operations=False,
        shots=True,
        statevector=True,
        probabilities=True,
        observables=True,
        expectation_values=True,
        noise_models=[],
        stabilizer=False,
        parameter_sweeps=True,
        hardware=False,
        supported_experiments=["SIMULATION", "PARAMETER_SWEEP", "VQE", "QAOA"]
    ),
    "cirq": BackendCapability(
        backend_id="cirq",
        display_name="Cirq Local Simulator",
        status="operational",
        max_qubits=16,
        supported_gates=["X", "Y", "Z", "H", "S", "T", "RX", "RY", "RZ", "CNOT", "CZ", "SWAP", "CPHASE", "MCX"],
        parameterized_gates=["RX", "RY", "RZ", "CPHASE"],
        dynamic_circuits=False,
        mid_circuit_measurement=False,
        reset=False,
        conditional_operations=False,
        shots=True,
        statevector=True,
        probabilities=True,
        observables=True,
        expectation_values=True,
        noise_models=[],
        stabilizer=False,
        parameter_sweeps=True,
        hardware=False,
        supported_experiments=["SIMULATION", "PARAMETER_SWEEP"]
    ),
    "stabilizer": BackendCapability(
        backend_id="stabilizer",
        display_name="Clifford Tableau Stabilizer Simulator",
        status="operational",
        max_qubits=50,
        supported_gates=["X", "Y", "Z", "H", "S", "CNOT", "CZ", "SWAP"],
        parameterized_gates=[],
        dynamic_circuits=True,
        mid_circuit_measurement=True,
        reset=True,
        conditional_operations=True,
        shots=True,
        statevector=False,
        probabilities=True,
        observables=True,
        expectation_values=True,
        noise_models=[],
        stabilizer=True,
        parameter_sweeps=False,
        hardware=False,
        supported_experiments=["SIMULATION", "STABILIZER_VALIDATION"]
    )
}

def get_backend_capabilities(backend_id: str = None) -> Any:
    if backend_id:
        if backend_id not in BACKEND_REGISTRY:
            raise ValueError(f"Unknown backend ID: {backend_id}")
        return BACKEND_REGISTRY[backend_id]
    return list(BACKEND_REGISTRY.values())
