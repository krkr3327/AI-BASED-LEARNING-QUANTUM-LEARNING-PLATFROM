import numpy as np
from typing import List, Dict, Any

I_MAT = np.eye(2, dtype=complex)
X_MAT = np.array([[0, 1], [1, 0]], dtype=complex)
Y_MAT = np.array([[0, -1j], [1j, 0]], dtype=complex)
Z_MAT = np.array([[1, 0], [0, -1]], dtype=complex)

PAULI_DICT = {"I": I_MAT, "X": X_MAT, "Y": Y_MAT, "Z": Z_MAT}

def build_pauli_tensor(pauli_str: str) -> np.ndarray:
    """
    Builds N-qubit Pauli operator matrix from string e.g. 'ZI', 'ZZ', 'IX'.
    q0 is MSB (leftmost).
    """
    mat = PAULI_DICT[pauli_str[0]]
    for char in pauli_str[1:]:
        mat = np.kron(mat, PAULI_DICT[char])
    return mat

def calculate_expectation_value(statevector: np.ndarray, observable_str: str) -> float:
    """
    Computes <psi| O |psi> for statevector and Pauli string observable.
    """
    num_qubits = int(np.log2(len(statevector)))
    if len(observable_str) != num_qubits:
        raise ValueError(f"Observable string length {len(observable_str)} must match num_qubits {num_qubits}")
    
    op_matrix = build_pauli_tensor(observable_str)
    psi = np.asarray(statevector, dtype=complex)
    exp_val = np.vdot(psi, op_matrix @ psi)
    return float(np.real(exp_val))
