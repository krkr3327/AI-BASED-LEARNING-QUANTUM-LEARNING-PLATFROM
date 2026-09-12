from app.qast.nodes import Circuit, GateNode, MeasurementNode
from typing import Dict, Any

def generate_dj_circuit(parameters: Dict[str, Any]) -> Circuit:
    # default to 3 input qubits
    n = parameters.get("num_qubits", 3)
    oracle_type = parameters.get("oracle_type", "constant") # "constant" or "balanced"
    
    num_qubits = n + 1
    operations = []
    
    # Initialization
    # Ancilla (last qubit) starts at |1> by applying X
    operations.append(GateNode(gate="X", qubits=[n]))
    
    # Hadamard layer on all qubits
    for q in range(num_qubits):
        operations.append(GateNode(gate="H", qubits=[q]))
        
    # Oracle
    if oracle_type == "constant":
        # Constant oracle: either do nothing or apply X to ancilla. We'll do nothing for 0, or X for 1
        # Let's apply X to ancilla to represent f(x) = 1
        operations.append(GateNode(gate="X", qubits=[n]))
    elif oracle_type == "balanced":
        # Balanced oracle: e.g. apply CNOT from each input to ancilla
        for i in range(n):
            operations.append(GateNode(gate="CNOT", qubits=[i, n]))
    else:
        raise ValueError(f"Unknown oracle_type for Deutsch-Jozsa: {oracle_type}")
        
    # Final Hadamard layer on input qubits
    for q in range(n):
        operations.append(GateNode(gate="H", qubits=[q]))
        
    # Measurement on input qubits
    operations.append(MeasurementNode(qubits=list(range(n)), cbits=list(range(n))))
    
    return Circuit(num_qubits=num_qubits, num_cbits=n, operations=operations)
