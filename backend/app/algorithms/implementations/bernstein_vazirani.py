from app.qast.nodes import Circuit, GateNode, MeasurementNode
from typing import Dict, Any

def generate_bv_circuit(parameters: Dict[str, Any]) -> Circuit:
    hidden_string = parameters.get("hidden_string", "101")
    n = len(hidden_string)
    
    # We need n qubits for the input, 1 qubit for the ancilla
    num_qubits = n + 1
    
    operations = []
    
    # Initialization
    # Ancilla (last qubit) starts at |1> by applying X
    operations.append(GateNode(gate="X", qubits=[n]))
    
    # Hadamard layer on all qubits
    for q in range(num_qubits):
        operations.append(GateNode(gate="H", qubits=[q]))
        
    # Oracle: for each '1' in hidden_string, apply CNOT from corresponding input qubit to ancilla
    # q0 is MSB, which corresponds to hidden_string[0]
    for i, bit in enumerate(hidden_string):
        if bit == '1':
            # control is i, target is n
            operations.append(GateNode(gate="CNOT", qubits=[i, n]))
            
    # Final Hadamard layer on input qubits
    for q in range(n):
        operations.append(GateNode(gate="H", qubits=[q]))
        
    # Measurement on input qubits
    operations.append(MeasurementNode(qubits=list(range(n)), cbits=list(range(n))))
    
    return Circuit(num_qubits=num_qubits, num_cbits=n, operations=operations)
