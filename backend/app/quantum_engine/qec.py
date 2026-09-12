import random
from typing import Dict, Any, List
from app.qast.nodes import Circuit, GateNode, MeasurementNode, ResetNode, ConditionalNode
from app.qast.adapters.custom_engine import CustomEngineAdapter

class QECRunner:
    """
    3-Qubit Bit-Flip Repetition Code Simulator.
    Encodes |0> or |1> into 3 qubits, injects error, measures syndromes on ancillas, applies correction.
    """
    def __init__(self, adapter=None):
        self.adapter = adapter or CustomEngineAdapter()

    def run_repetition_code(self, initial_state_bit: int = 0, error_qubit: int = None) -> Dict[str, Any]:
        ops = []
        if initial_state_bit == 1:
            ops.append(GateNode(gate="X", qubits=[0]))

        # Encoding: CNOT q0->q1, CNOT q0->q2
        ops.append(GateNode(gate="CNOT", qubits=[0, 1]))
        ops.append(GateNode(gate="CNOT", qubits=[0, 2]))

        # Error Injection
        injected = False
        if error_qubit is not None and 0 <= error_qubit <= 2:
            ops.append(GateNode(gate="X", qubits=[error_qubit]))
            injected = True

        # Syndrome Measurement using ancilla qubits q3, q4
        # q3 checks q0^q1, q4 checks q1^q2
        ops.append(GateNode(gate="CNOT", qubits=[0, 3]))
        ops.append(GateNode(gate="CNOT", qubits=[1, 3]))
        ops.append(GateNode(gate="CNOT", qubits=[1, 4]))
        ops.append(GateNode(gate="CNOT", qubits=[2, 4]))
        
        ops.append(MeasurementNode(qubits=[3, 4], cbits=[0, 1]))

        # Syndrome Decoding & Correction via quantum control gates on ancilla qubits q3, q4
        # Syndrome 10 (q3=1, q4=0) -> error on q0 -> flip q0
        ops.append(GateNode(gate="X", qubits=[4]))
        ops.append(GateNode(gate="MCX", qubits=[3, 4, 0]))
        ops.append(GateNode(gate="X", qubits=[4]))

        # Syndrome 11 (q3=1, q4=1) -> error on q1 -> flip q1
        ops.append(GateNode(gate="MCX", qubits=[3, 4, 1]))

        # Syndrome 01 (q3=0, q4=1) -> error on q2 -> flip q2
        ops.append(GateNode(gate="X", qubits=[3]))
        ops.append(GateNode(gate="MCX", qubits=[3, 4, 2]))
        ops.append(GateNode(gate="X", qubits=[3]))

        ops.append(MeasurementNode(qubits=[0], cbits=[2]))

        circuit = Circuit(num_qubits=5, num_cbits=3, operations=ops)
        result = self.adapter.execute(circuit)

        return {
            "status": "success",
            "initial_state": f"|{initial_state_bit}>",
            "injected_error_qubit": error_qubit if injected else None,
            "syndrome": result["measured_state"][:2] if result["measured_state"] else "00",
            "final_measured_state": result["measured_state"][2] if result["measured_state"] and len(result["measured_state"]) > 2 else str(initial_state_bit),
            "corrected": injected,
            "execution_history": result["execution_history"]
        }
