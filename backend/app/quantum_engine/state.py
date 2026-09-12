import numpy as np
from app.quantum_engine.exceptions import QuantumEngineError

class QuantumState:
    """
    Represents an n-qubit pure quantum state using Big-endian convention.
    |00...0> is initialized at index 0.
    """
    def __init__(self, num_qubits: int):
        if num_qubits < 1:
            raise QuantumEngineError("Number of qubits must be at least 1.")
        self.num_qubits = num_qubits
        self.vector = np.zeros(2**num_qubits, dtype=np.complex128)
        self.vector[0] = 1.0  # Initialize to |0...0>

    def normalize(self, tolerance: float = 1e-6):
        norm = np.linalg.norm(self.vector)
        if abs(norm - 1.0) > tolerance:
            raise QuantumEngineError(f"State is not normalized. Norm: {norm}")
        self.vector = self.vector / norm
