import numpy as np

# Constant Matrices
I = np.array([[1, 0], [0, 1]], dtype=np.complex128)
X = np.array([[0, 1], [1, 0]], dtype=np.complex128)
Y = np.array([[0, -1j], [1j, 0]], dtype=np.complex128)
Z = np.array([[1, 0], [0, -1]], dtype=np.complex128)
H = (1 / np.sqrt(2)) * np.array([[1, 1], [1, -1]], dtype=np.complex128)
S = np.array([[1, 0], [0, 1j]], dtype=np.complex128)
T = np.array([[1, 0], [0, np.exp(1j * np.pi / 4)]], dtype=np.complex128)

def RX(theta: float) -> np.ndarray:
    return np.array([
        [np.cos(theta/2), -1j * np.sin(theta/2)],
        [-1j * np.sin(theta/2), np.cos(theta/2)]
    ], dtype=np.complex128)

def RY(theta: float) -> np.ndarray:
    return np.array([
        [np.cos(theta/2), -np.sin(theta/2)],
        [np.sin(theta/2), np.cos(theta/2)]
    ], dtype=np.complex128)

def RZ(theta: float) -> np.ndarray:
    return np.array([
        [np.exp(-1j * theta/2), 0],
        [0, np.exp(1j * theta/2)]
    ], dtype=np.complex128)

GATE_MAP = {
    "X": X,
    "Y": Y,
    "Z": Z,
    "H": H,
    "S": S,
    "T": T
}
