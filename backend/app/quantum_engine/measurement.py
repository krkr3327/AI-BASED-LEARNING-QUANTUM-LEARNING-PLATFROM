import numpy as np
from app.quantum_engine.state import QuantumState
from typing import Dict, Tuple

def calculate_probabilities(state: QuantumState) -> np.ndarray:
    """
    Calculates the probability distribution P(i) = |a_i|^2.
    """
    probs = np.abs(state.vector) ** 2
    # Ensure numerical stability
    probs = probs / np.sum(probs)
    return probs

def measure_qubit(state: QuantumState, target_qubit: int) -> int:
    """
    Measures a specific qubit, returns the classical outcome (0 or 1), 
    and collapses the quantum state in place.
    """
    n = state.num_qubits
    
    # Calculate probability of outcome 0
    prob_0 = 0.0
    for i in range(2**n):
        if (i & (1 << (n - 1 - target_qubit))) == 0:
            prob_0 += np.abs(state.vector[i]) ** 2
            
    # Sample outcome
    outcome = 0 if np.random.rand() < prob_0 else 1
    
    # Collapse the state
    norm_factor = 0.0
    for i in range(2**n):
        bit_val = 1 if (i & (1 << (n - 1 - target_qubit))) else 0
        if bit_val != outcome:
            state.vector[i] = 0.0
        else:
            norm_factor += np.abs(state.vector[i]) ** 2
            
    if norm_factor > 0:
        state.vector /= np.sqrt(norm_factor)
        
    return outcome

def measure(state: QuantumState) -> Tuple[int, str]:
    """
    Performs a computational-basis measurement of all qubits.
    Returns the measured integer state and its binary string representation.
    """
    probs = calculate_probabilities(state)
    measured_idx = np.random.choice(len(probs), p=probs)
    # Big-endian: zfill pads left to ensure length num_qubits
    binary_str = bin(measured_idx)[2:].zfill(state.num_qubits)
    
    # Collapse the state completely
    state.vector[:] = 0.0
    state.vector[measured_idx] = 1.0
    
    return int(measured_idx), binary_str
