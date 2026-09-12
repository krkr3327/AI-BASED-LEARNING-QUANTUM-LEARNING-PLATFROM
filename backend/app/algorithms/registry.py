from app.algorithms.models import AlgorithmInfo
from app.algorithms.implementations.bernstein_vazirani import generate_bv_circuit
from app.algorithms.implementations.deutsch_jozsa import generate_dj_circuit
from app.algorithms.implementations.grover import generate_grover_circuit
from app.algorithms.implementations.qft import generate_qft_circuit, run_qft_algorithm
from app.algorithms.implementations.vqe import run_vqe_algorithm, build_vqe_ansatz
from app.algorithms.implementations.qaoa import run_qaoa_algorithm, build_qaoa_circuit
from app.algorithms.implementations.qec import run_qec_repetition_code
from app.algorithms.implementations.shor import run_shor_algorithm, generate_shor_15_circuit
from typing import Dict, Any, Callable
from app.qast.nodes import Circuit

class AlgorithmRegistry:
    def __init__(self):
        self._algorithms: Dict[str, AlgorithmInfo] = {}
        self._generators: Dict[str, Callable[[Dict[str, Any]], Circuit]] = {}
        self._executors: Dict[str, Callable[..., Dict[str, Any]]] = {}
        
    def register(
        self,
        info: AlgorithmInfo,
        generator: Callable[[Dict[str, Any]], Circuit],
        executor: Callable[..., Dict[str, Any]] = None
    ):
        self._algorithms[info.id] = info
        self._generators[info.id] = generator
        if executor:
            self._executors[info.id] = executor
        
    def get_info(self, algo_id: str) -> AlgorithmInfo:
        if algo_id not in self._algorithms:
            raise ValueError(f"Algorithm {algo_id} not found in registry.")
        return self._algorithms[algo_id]
        
    def generate(self, algo_id: str, parameters: Dict[str, Any]) -> Circuit:
        if algo_id not in self._generators:
            raise ValueError(f"Algorithm generator for {algo_id} not found.")
        return self._generators[algo_id](parameters)

    def execute(self, algo_id: str, parameters: Dict[str, Any], backend: str = "custom_m1") -> Dict[str, Any]:
        if algo_id in self._executors:
            return self._executors[algo_id](backend=backend, **parameters)
        circuit = self.generate(algo_id, parameters)
        from app.services.simulation_service import SimulationService
        sim = SimulationService()
        result = sim.run_simulation(circuit, backend=backend)
        return {
            "algorithm": algo_id,
            "parameters": parameters,
            "circuit": circuit,
            "backend": backend,
            "result": result,
            "execution_trace": result.execution_trace,
            "trace_capability": result.trace_capability,
            "provenance": "real_execution"
        }
        
    def list_all(self) -> list[AlgorithmInfo]:
        return list(self._algorithms.values())

ALGORITHM_REGISTRY = AlgorithmRegistry()

# Register Bernstein-Vazirani
ALGORITHM_REGISTRY.register(
    AlgorithmInfo(
        id="bernstein_vazirani",
        name="Bernstein-Vazirani",
        description="Find a hidden bit string in a single query.",
        required_parameters=["hidden_string"],
        educational_stages=["Initialization", "Hadamard", "Oracle", "Phase Kickback", "Hadamard", "Measurement"]
    ),
    generate_bv_circuit
)

# Register Deutsch-Jozsa
ALGORITHM_REGISTRY.register(
    AlgorithmInfo(
        id="deutsch_jozsa",
        name="Deutsch-Jozsa",
        description="Determine if a function is constant or balanced in a single query.",
        required_parameters=["num_qubits", "oracle_type"],
        educational_stages=["Initialization", "Superposition", "Oracle", "Interference", "Measurement"]
    ),
    generate_dj_circuit
)

# Register Grover
ALGORITHM_REGISTRY.register(
    AlgorithmInfo(
        id="grover",
        name="Grover's Search",
        description="Search an unstructured database quadratically faster.",
        required_parameters=["marked_state", "iterations"],
        educational_stages=["Initialization", "Superposition", "Oracle", "Diffusion", "Amplitude Amplification", "Measurement"]
    ),
    generate_grover_circuit
)

# Register QFT
ALGORITHM_REGISTRY.register(
    AlgorithmInfo(
        id="qft",
        name="Quantum Fourier Transform",
        description="Transform a quantum state to the frequency domain.",
        required_parameters=["num_qubits"],
        educational_stages=["Input", "Hadamard", "Controlled Phase", "Qubit Reversal", "Output"]
    ),
    lambda p: generate_qft_circuit(
        num_qubits=p.get("num_qubits", 3),
        is_inverse=p.get("is_inverse", False),
        prepare_state=p.get("prepare_state")
    ),
    executor=lambda backend="custom_m1", **p: run_qft_algorithm(backend=backend, **p)
)

# Register VQE
ALGORITHM_REGISTRY.register(
    AlgorithmInfo(
        id="vqe",
        name="Variational Quantum Eigensolver (VQE)",
        description="Find ground state energy of physical Hamiltonians using hybrid variational optimization.",
        required_parameters=["num_qubits"],
        educational_stages=["Hamiltonian Setup", "Ansatz Prep", "Expectation Measurement", "Classical Optimization", "Ground State Energy"]
    ),
    lambda p: build_vqe_ansatz(p.get("num_qubits", 2), p.get("ansatz_type", "hardware_efficient"))[0],
    executor=lambda backend="custom_m1", **p: run_vqe_algorithm(backend=backend, **p)
)

# Register QAOA
ALGORITHM_REGISTRY.register(
    AlgorithmInfo(
        id="qaoa",
        name="Quantum Approximate Optimization (QAOA)",
        description="Solve MaxCut graph combinatorial optimization problems using alternating cost/mixer unitaries.",
        required_parameters=["num_nodes"],
        educational_stages=["Graph Input", "Cost Unitary", "Mixer Unitary", "Variational Optimization", "Best Candidate Cut"]
    ),
    lambda p: build_qaoa_circuit(p.get("graph_edges", [[0,1], [1,2], [2,0]]), p.get("num_nodes", 3), p.get("p_steps", 1))[0],
    executor=lambda backend="custom_m1", **p: run_qaoa_algorithm(backend=backend, **p)
)

# Register QEC
ALGORITHM_REGISTRY.register(
    AlgorithmInfo(
        id="qec",
        name="Quantum Error Correction (QEC)",
        description="3-qubit repetition code for logical encoding, error injection, syndrome extraction, and correction.",
        required_parameters=["initial_state_bit"],
        educational_stages=["Logical Encoding", "Error Injection", "Syndrome Extraction", "Syndrome Decoding", "Recovery Verification"]
    ),
    lambda p: generate_qft_circuit(3),
    executor=lambda backend="custom_m1", **p: run_qec_repetition_code(backend=backend, **p)
)

# Register Educational Shor
ALGORITHM_REGISTRY.register(
    AlgorithmInfo(
        id="shor",
        name="Educational Shor's Algorithm (N=15)",
        description="Quantum order-finding with controlled modular multiplication and inverse QFT to factor N=15.",
        required_parameters=["N", "a"],
        educational_stages=["Coprimality Check", "Quantum Order-Finding", "Inverse QFT", "Phase Estimation", "Factor Calculation"]
    ),
    lambda p: generate_shor_15_circuit(),
    executor=lambda backend="custom_m1", **p: run_shor_algorithm(backend=backend, **p)
)
