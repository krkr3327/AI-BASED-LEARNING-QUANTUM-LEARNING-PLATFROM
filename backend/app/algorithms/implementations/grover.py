from app.qast.nodes import Circuit, GateNode, MeasurementNode
from typing import Dict, Any

def apply_mcz(operations, qubits):
    if len(qubits) == 1:
        operations.append(GateNode(gate="Z", qubits=[qubits[0]]))
    elif len(qubits) == 2:
        operations.append(GateNode(gate="CZ", qubits=[qubits[0], qubits[1]]))
    else:
        target = qubits[-1]
        controls = qubits[:-1]
        
        operations.append(GateNode(gate="H", qubits=[target]))
        operations.append(GateNode(gate="MCX", qubits=controls + [target]))
        operations.append(GateNode(gate="H", qubits=[target]))

def generate_grover_circuit(parameters: Dict[str, Any]) -> Circuit:
    marked_state = parameters.get("marked_state", "101")
    n = len(marked_state)
    
    if n > 5:
        raise ValueError("Grover search is limited to a maximum of 5 qubits.")
        
    iterations = parameters.get("iterations", 1)
    
    if iterations < 1:
        raise ValueError("Iterations must be at least 1.")
        
    operations = []
    
    # Initialization
    for q in range(n):
        operations.append(GateNode(gate="H", qubits=[q]))
        
    all_qubits = list(range(n))
        
    for _ in range(iterations):
        # --- Phase Oracle ---
        # Apply X to qubits where marked state is 0
        for i, bit in enumerate(marked_state):
            if bit == '0':
                operations.append(GateNode(gate="X", qubits=[i]))
                
        # Apply MCZ
        apply_mcz(operations, all_qubits)
        
        # Apply X to qubits where marked state is 0
        for i, bit in enumerate(marked_state):
            if bit == '0':
                operations.append(GateNode(gate="X", qubits=[i]))
                
        # --- Diffusion Operator ---
        # H layer
        for q in range(n):
            operations.append(GateNode(gate="H", qubits=[q]))
            
        # X layer
        for q in range(n):
            operations.append(GateNode(gate="X", qubits=[q]))
            
        # MCZ
        apply_mcz(operations, all_qubits)
        
        # X layer
        for q in range(n):
            operations.append(GateNode(gate="X", qubits=[q]))
            
        # H layer
        for q in range(n):
            operations.append(GateNode(gate="H", qubits=[q]))
            
    # Measurement
    operations.append(MeasurementNode(qubits=all_qubits, cbits=all_qubits))
    
    return Circuit(num_qubits=n, num_cbits=n, operations=operations)
