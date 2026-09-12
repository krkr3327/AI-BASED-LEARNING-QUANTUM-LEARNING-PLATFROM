import pytest
from pydantic import ValidationError
from app.qast.nodes import Circuit, GateNode, MeasurementNode
from app.qast.adapters.custom_engine import CustomEngineAdapter

def test_valid_circuit_creation():
    ops = [
        GateNode(gate="H", qubits=[0]),
        GateNode(gate="CNOT", qubits=[0, 1]),
        MeasurementNode(qubits=[0, 1], cbits=[0, 1])
    ]
    circuit = Circuit(num_qubits=2, num_cbits=2, operations=ops)
    assert len(circuit.operations) == 3

def test_invalid_gate_name():
    with pytest.raises(ValidationError):
        GateNode(gate="INVALID", qubits=[0])

def test_invalid_gate_arity():
    with pytest.raises(ValidationError):
        GateNode(gate="CNOT", qubits=[0])

def test_duplicate_qubits():
    with pytest.raises(ValidationError):
        GateNode(gate="CNOT", qubits=[0, 0])

def test_invalid_qubit_index():
    with pytest.raises(ValidationError):
        ops = [GateNode(gate="H", qubits=[2])]
        Circuit(num_qubits=2, num_cbits=0, operations=ops)

def test_adapter_execution_bell_state():
    ops = [
        GateNode(gate="H", qubits=[0]),
        GateNode(gate="CNOT", qubits=[0, 1]),
        MeasurementNode(qubits=[0, 1], cbits=[0, 1])
    ]
    circuit = Circuit(num_qubits=2, num_cbits=2, operations=ops)
    adapter = CustomEngineAdapter()
    result = adapter.execute(circuit)
    
    assert abs(result["probabilities"]["00"] - 0.5) < 1e-5
    assert abs(result["probabilities"]["11"] - 0.5) < 1e-5
    assert result["measured_state"] in ["00", "11"]

def test_missing_parameters():
    with pytest.raises(ValidationError):
        GateNode(gate="RX", qubits=[0])

def test_valid_parameters():
    node = GateNode(gate="RX", qubits=[0], parameters={"theta": 3.14})
    assert node.parameters["theta"] == 3.14
