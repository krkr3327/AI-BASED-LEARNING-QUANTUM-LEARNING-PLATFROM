import numpy as np
import pytest
from app.quantum_engine.state import QuantumState
from app.quantum_engine.operations import apply_single_qubit_gate, apply_cnot_gate
from app.quantum_engine.measurement import calculate_probabilities
from app.quantum_engine.exceptions import InvalidQubitIndexError

def test_1_apply_X():
    state = QuantumState(1)
    state.vector = apply_single_qubit_gate(state.vector, 1, 0, "X")
    probs = calculate_probabilities(state)
    
    assert np.isclose(probs[0], 0.0)
    assert np.isclose(probs[1], 1.0)

def test_2_apply_H():
    state = QuantumState(1)
    state.vector = apply_single_qubit_gate(state.vector, 1, 0, "H")
    probs = calculate_probabilities(state)
    
    assert np.isclose(probs[0], 0.5)
    assert np.isclose(probs[1], 0.5)

def test_3_H_squared():
    state = QuantumState(1)
    state.vector = apply_single_qubit_gate(state.vector, 1, 0, "H")
    state.vector = apply_single_qubit_gate(state.vector, 1, 0, "H")
    probs = calculate_probabilities(state)
    
    assert np.isclose(probs[0], 1.0)
    assert np.isclose(probs[1], 0.0)

def test_4_bell_state():
    state = QuantumState(2)
    state.vector = apply_single_qubit_gate(state.vector, 2, 0, "H")
    state.vector = apply_cnot_gate(state.vector, 2, 0, 1)
    probs = calculate_probabilities(state)
    
    assert np.isclose(probs[0], 0.5)  # |00>
    assert np.isclose(probs[1], 0.0)  # |01>
    assert np.isclose(probs[2], 0.0)  # |10>
    assert np.isclose(probs[3], 0.5)  # |11>

def test_5_normalization():
    state = QuantumState(3)
    # Apply random sequence of valid gates
    state.vector = apply_single_qubit_gate(state.vector, 3, 0, "H")
    state.vector = apply_single_qubit_gate(state.vector, 3, 1, "X")
    state.vector = apply_cnot_gate(state.vector, 3, 0, 2)
    state.vector = apply_single_qubit_gate(state.vector, 3, 1, "H")
    state.normalize()  # Should not raise exception
    
    probs = calculate_probabilities(state)
    assert np.isclose(np.sum(probs), 1.0)

def test_6_invalid_index():
    state = QuantumState(1)
    with pytest.raises(InvalidQubitIndexError):
        apply_single_qubit_gate(state.vector, 1, 1, "X")

    with pytest.raises(InvalidQubitIndexError):
        apply_cnot_gate(state.vector, 1, 0, 1)

from app.quantum_engine.operations import apply_cz_gate, apply_swap_gate
from app.quantum_engine.exceptions import InvalidGateError

def test_7_apply_S_T():
    state = QuantumState(1)
    state.vector = apply_single_qubit_gate(state.vector, 1, 0, "X") # |1>
    state.vector = apply_single_qubit_gate(state.vector, 1, 0, "S")
    assert np.isclose(state.vector[1], 1j)

    state2 = QuantumState(1)
    state2.vector = apply_single_qubit_gate(state2.vector, 1, 0, "X") # |1>
    state2.vector = apply_single_qubit_gate(state2.vector, 1, 0, "T")
    assert np.isclose(state2.vector[1], np.exp(1j * np.pi / 4))

def test_8_apply_parameterized():
    # RX
    state = QuantumState(1)
    state.vector = apply_single_qubit_gate(state.vector, 1, 0, "RX", {"theta": np.pi})
    probs = calculate_probabilities(state)
    assert np.isclose(probs[1], 1.0) # RX(pi)|0> = -i|1> -> prob 1.0

    # Missing theta
    with pytest.raises(InvalidGateError):
        apply_single_qubit_gate(state.vector, 1, 0, "RY", {})

def test_9_cz():
    state = QuantumState(2)
    state.vector = apply_single_qubit_gate(state.vector, 2, 0, "X")
    state.vector = apply_single_qubit_gate(state.vector, 2, 1, "H")
    # |1> (x) |+>
    state.vector = apply_cz_gate(state.vector, 2, 0, 1)
    # should be |1> (x) |->
    # |10> = 1/sqrt(2), |11> = -1/sqrt(2)
    assert np.isclose(state.vector[2].real, 1/np.sqrt(2))
    assert np.isclose(state.vector[3].real, -1/np.sqrt(2))

def test_10_swap():
    state = QuantumState(2)
    state.vector = apply_single_qubit_gate(state.vector, 2, 0, "X")
    # State is |10>
    state.vector = apply_swap_gate(state.vector, 2, 0, 1)
    # State should be |01>
    probs = calculate_probabilities(state)
    assert np.isclose(probs[1], 1.0)
    assert np.isclose(probs[2], 0.0)
