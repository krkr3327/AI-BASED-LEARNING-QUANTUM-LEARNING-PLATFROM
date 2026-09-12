import numpy as np
from app.quantum_engine.exceptions import InvalidQubitIndexError, InvalidGateError
from app.quantum_engine.gates import GATE_MAP, RX, RY, RZ

def apply_single_qubit_gate(state_vector: np.ndarray, num_qubits: int, target_qubit: int, gate_name: str, parameters: dict = None) -> np.ndarray:
    """
    Applies a single-qubit gate to the target qubit using Big-endian convention.
    Qubit 0 is the most significant (leftmost) bit in the tensor product.
    """
    if target_qubit < 0 or target_qubit >= num_qubits:
        raise InvalidQubitIndexError(target_qubit, num_qubits)
    
    if gate_name in ["RX", "RY", "RZ"]:
        if not parameters:
            raise InvalidGateError(f"Gate {gate_name} requires a parameter.")
        val = parameters.get("theta") if "theta" in parameters else next(iter(parameters.values()))
        theta = float(val)
        if gate_name == "RX":
            gate_matrix = RX(theta)
        elif gate_name == "RY":
            gate_matrix = RY(theta)
        else:
            gate_matrix = RZ(theta)
    elif gate_name in GATE_MAP:
        gate_matrix = GATE_MAP[gate_name]
    else:
        raise InvalidGateError(f"Gate {gate_name} not supported.")
    
    I_left = np.eye(2**target_qubit, dtype=np.complex128)
    I_right = np.eye(2**(num_qubits - target_qubit - 1), dtype=np.complex128)
    
    op = np.kron(np.kron(I_left, gate_matrix), I_right)
    return op @ state_vector

def _build_two_qubit_control_term(num_qubits: int, control_qubit: int, target_qubit: int, target_op: np.ndarray) -> np.ndarray:
    P0 = np.array([[1, 0], [0, 0]], dtype=np.complex128)
    P1 = np.array([[0, 0], [0, 1]], dtype=np.complex128)
    I = np.eye(2, dtype=np.complex128)

    def build_term(control_proj, target_mat):
        term = np.array([[1]], dtype=np.complex128)
        for q in range(num_qubits):
            if q == control_qubit:
                term = np.kron(term, control_proj)
            elif q == target_qubit:
                term = np.kron(term, target_mat)
            else:
                term = np.kron(term, I)
        return term
        
    term1 = build_term(P0, I)
    term2 = build_term(P1, target_op)
    return term1 + term2

def apply_cnot_gate(state_vector: np.ndarray, num_qubits: int, control_qubit: int, target_qubit: int) -> np.ndarray:
    """
    Applies a CNOT gate using Big-endian convention.
    """
    if control_qubit < 0 or control_qubit >= num_qubits:
        raise InvalidQubitIndexError(control_qubit, num_qubits)
    if target_qubit < 0 or target_qubit >= num_qubits:
        raise InvalidQubitIndexError(target_qubit, num_qubits)
    if control_qubit == target_qubit:
        raise InvalidGateError("Control and target qubits cannot be the same.")
        
    cnot_op = _build_two_qubit_control_term(num_qubits, control_qubit, target_qubit, GATE_MAP["X"])
    return cnot_op @ state_vector

def apply_cz_gate(state_vector: np.ndarray, num_qubits: int, control_qubit: int, target_qubit: int) -> np.ndarray:
    """
    Applies a CZ gate using Big-endian convention.
    """
    if control_qubit < 0 or control_qubit >= num_qubits:
        raise InvalidQubitIndexError(control_qubit, num_qubits)
    if target_qubit < 0 or target_qubit >= num_qubits:
        raise InvalidQubitIndexError(target_qubit, num_qubits)
    if control_qubit == target_qubit:
        raise InvalidGateError("Control and target qubits cannot be the same.")
        
    cz_op = _build_two_qubit_control_term(num_qubits, control_qubit, target_qubit, GATE_MAP["Z"])
    return cz_op @ state_vector

def apply_swap_gate(state_vector: np.ndarray, num_qubits: int, qubit1: int, qubit2: int) -> np.ndarray:
    """
    Applies a SWAP gate using Big-endian convention.
    SWAP can be decomposed into 3 CNOTs: CNOT(q1, q2) -> CNOT(q2, q1) -> CNOT(q1, q2)
    """
    if qubit1 < 0 or qubit1 >= num_qubits:
        raise InvalidQubitIndexError(qubit1, num_qubits)
    if qubit2 < 0 or qubit2 >= num_qubits:
        raise InvalidQubitIndexError(qubit2, num_qubits)
    if qubit1 == qubit2:
        return state_vector
        
    cnot1 = _build_two_qubit_control_term(num_qubits, qubit1, qubit2, GATE_MAP["X"])
    cnot2 = _build_two_qubit_control_term(num_qubits, qubit2, qubit1, GATE_MAP["X"])
    
    swap_op = cnot1 @ cnot2 @ cnot1
    return swap_op @ state_vector

def _build_multi_control_term(num_qubits: int, control_qubits: list[int], target_qubit: int, target_op: np.ndarray) -> np.ndarray:
    P0 = np.array([[1, 0], [0, 0]], dtype=np.complex128)
    P1 = np.array([[0, 0], [0, 1]], dtype=np.complex128)
    I = np.eye(2, dtype=np.complex128)

    # We need to construct the matrix:
    # Op = I - |1..1><1..1| (on controls) x (I - target_op) (on target)
    # Alternatively: Op = Sum( |c><c| x I ) for c != 1..1 + |1..1><1..1| x target_op
    
    # It's easier to build the projector onto the all-1 control state:
    def build_term(controls_proj, target_mat):
        term = np.array([[1]], dtype=np.complex128)
        for q in range(num_qubits):
            if q in control_qubits:
                term = np.kron(term, controls_proj)
            elif q == target_qubit:
                term = np.kron(term, target_mat)
            else:
                term = np.kron(term, I)
        return term

    # Projector onto all controls being 1
    proj_all_1 = build_term(P1, I) # Here target is I, but wait, if we pass P1 for controls, it just builds P1 x P1 x P1
    # Actually build_term with P1 for all controls does exactly |11..1><11..1|
    # The full operator is I_full - proj_all_1 + proj_all_1_with_target_op
    
    # To do this correctly:
    term_all_1_with_op = build_term(P1, target_op)
    term_all_1_with_I = build_term(P1, I)
    
    I_full = np.eye(2**num_qubits, dtype=np.complex128)
    return I_full - term_all_1_with_I + term_all_1_with_op

def apply_mcx_gate(state_vector: np.ndarray, num_qubits: int, control_qubits: list[int], target_qubit: int) -> np.ndarray:
    """
    Applies a Multi-Controlled-X gate.
    """
    for q in control_qubits + [target_qubit]:
        if q < 0 or q >= num_qubits:
            raise InvalidQubitIndexError(q, num_qubits)
    if target_qubit in control_qubits:
        raise InvalidGateError("Target qubit cannot be in control qubits.")
    if len(set(control_qubits)) != len(control_qubits):
        raise InvalidGateError("Duplicate control qubits found.")
        
    mcx_op = _build_multi_control_term(num_qubits, control_qubits, target_qubit, GATE_MAP["X"])
    return mcx_op @ state_vector

def apply_cphase_gate(state_vector: np.ndarray, num_qubits: int, control_qubit: int, target_qubit: int, theta: float) -> np.ndarray:
    """
    Applies a Controlled-Phase gate applying e^(i theta) to |11>.
    """
    if control_qubit < 0 or control_qubit >= num_qubits:
        raise InvalidQubitIndexError(control_qubit, num_qubits)
    if target_qubit < 0 or target_qubit >= num_qubits:
        raise InvalidQubitIndexError(target_qubit, num_qubits)
    if control_qubit == target_qubit:
        raise InvalidGateError("Control and target qubits cannot be the same.")
        
    phase_matrix = np.array([[1, 0], [0, np.exp(1j * theta)]], dtype=np.complex128)
    cphase_op = _build_two_qubit_control_term(num_qubits, control_qubit, target_qubit, phase_matrix)
    return cphase_op @ state_vector

def apply_reset_gate(state_vector: np.ndarray, num_qubits: int, target_qubit: int) -> np.ndarray:
    """
    Applies a Reset operation to the target qubit.
    It simulates a measurement and applies an X gate if the outcome is 1.
    """
    if target_qubit < 0 or target_qubit >= num_qubits:
        raise InvalidQubitIndexError(target_qubit, num_qubits)
        
    # Calculate probability of outcome 0
    prob_0 = 0.0
    for i in range(2**num_qubits):
        if (i & (1 << (num_qubits - 1 - target_qubit))) == 0:
            prob_0 += np.abs(state_vector[i]) ** 2
            
    # Sample outcome
    outcome = 0 if np.random.rand() < prob_0 else 1
    
    # Collapse the state
    norm_factor = 0.0
    new_vector = np.zeros_like(state_vector)
    for i in range(2**num_qubits):
        bit_val = 1 if (i & (1 << (num_qubits - 1 - target_qubit))) else 0
        if bit_val == outcome:
            new_vector[i] = state_vector[i]
            norm_factor += np.abs(state_vector[i]) ** 2
            
    if norm_factor > 0:
        new_vector /= np.sqrt(norm_factor)
        
    # If outcome was 1, apply X gate to bring it back to 0
    if outcome == 1:
        I_left = np.eye(2**target_qubit, dtype=np.complex128)
        I_right = np.eye(2**(num_qubits - target_qubit - 1), dtype=np.complex128)
        x_op = np.kron(np.kron(I_left, GATE_MAP["X"]), I_right)
        new_vector = x_op @ new_vector
        
    return new_vector
