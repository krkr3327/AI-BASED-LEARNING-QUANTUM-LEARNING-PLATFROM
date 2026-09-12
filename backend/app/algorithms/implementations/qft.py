"""
Quantum Fourier Transform (QFT) Reusable Primitive Implementation.

Constructs forward and inverse QFT Q-AST circuits and performs numerical validation
against mathematical Fourier matrix definitions.
"""
import math
import numpy as np
from typing import Dict, Any, Optional
from app.qast.nodes import Circuit, GateNode, MeasurementNode


def generate_qft_circuit(
    num_qubits: int = 3,
    is_inverse: bool = False,
    prepare_state: Optional[str] = None
) -> Circuit:
    """
    Constructs Q-AST Circuit for QFT or inverse QFT on n qubits.
    """
    n = num_qubits
    if n > 8:
        raise ValueError("QFT is limited to a maximum of 8 qubits.")

    operations = []

    # Optional state preparation
    if prepare_state:
        for idx, char in enumerate(prepare_state[:n]):
            if char == '1':
                operations.append(GateNode(gate="X", qubits=[idx]))

    # QFT Gates
    if not is_inverse:
        # Forward QFT
        for i in range(n):
            operations.append(GateNode(gate="H", qubits=[i]))
            for j in range(i + 1, n):
                theta = math.pi / (2 ** (j - i))
                operations.append(GateNode(gate="CPHASE", qubits=[j, i], parameters={"theta": theta}))

        # SWAP layer to reverse qubit order
        for i in range(n // 2):
            operations.append(GateNode(gate="SWAP", qubits=[i, n - 1 - i]))
    else:
        # Inverse QFT (reverse gate order and invert phases)
        for i in range(n // 2):
            operations.append(GateNode(gate="SWAP", qubits=[i, n - 1 - i]))

        for i in reversed(range(n)):
            for j in reversed(range(i + 1, n)):
                theta = -math.pi / (2 ** (j - i))
                operations.append(GateNode(gate="CPHASE", qubits=[j, i], parameters={"theta": theta}))
            operations.append(GateNode(gate="H", qubits=[i]))

    # Measurement
    all_qubits = list(range(n))
    operations.append(MeasurementNode(qubits=all_qubits, cbits=all_qubits))

    return Circuit(num_qubits=n, num_cbits=n, operations=operations)


def run_qft_algorithm(
    num_qubits: int = 3,
    is_inverse: bool = False,
    prepare_state: Optional[str] = None,
    backend: str = "custom_m1"
) -> Dict[str, Any]:
    """
    Executes QFT algorithm and verifies numerical fidelity against theoretical QFT matrix.
    """
    from app.services.simulation_service import SimulationService
    sim_service = SimulationService()

    circuit = generate_qft_circuit(num_qubits, is_inverse, prepare_state)
    execution = sim_service.run_simulation(circuit, backend=backend)

    # Numerical verification against mathematical QFT matrix
    N = 2 ** num_qubits
    qft_matrix = np.zeros((N, N), dtype=complex)
    omega = np.exp(2j * np.pi / N)
    for j in range(N):
        for k in range(N):
            qft_matrix[j, k] = (omega ** (j * k)) / np.sqrt(N)

    if is_inverse:
        qft_matrix = np.conj(qft_matrix)

    # Initial statevector vector v0
    v0 = np.zeros(N, dtype=complex)
    if prepare_state:
        init_idx = int(prepare_state, 2) if set(prepare_state).issubset({'0', '1'}) else 0
        v0[init_idx] = 1.0
    else:
        v0[0] = 1.0

    expected_sv = qft_matrix @ v0

    actual_sv = np.zeros(N, dtype=complex)
    if execution.statevector:
        actual_sv = np.array([complex(c.real, c.imag) for c in execution.statevector], dtype=complex)

    fidelity = float(abs(np.vdot(expected_sv, actual_sv)) ** 2)

    return {
        "algorithm": "qft",
        "parameters": {
            "num_qubits": num_qubits,
            "is_inverse": is_inverse,
            "prepare_state": prepare_state,
        },
        "circuit": circuit,
        "backend": backend,
        "result": execution,
        "analysis": {
            "is_inverse": is_inverse,
            "fourier_matrix_verified": bool(fidelity > 0.99),
            "statevector_fidelity": fidelity,
        },
        "execution_trace": execution.execution_trace,
        "trace_capability": execution.trace_capability,
        "provenance": "real_execution",
    }
