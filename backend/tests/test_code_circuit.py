import pytest
from app.qast.parser import parse_code_to_qast, qast_to_code, CodeParserError
from app.services.simulation_service import SimulationService

def test_valid_code_compilation():
    code = """
    qubits 2
    H q[0]
    CNOT q[0], q[1]
    M q[0] -> c[0]
    """
    circuit = parse_code_to_qast(code)
    assert circuit.num_qubits == 2
    assert len(circuit.operations) == 3
    assert circuit.operations[0].gate == "H"
    assert circuit.operations[1].gate == "CNOT"
    assert circuit.operations[2].qubits == [0]

def test_parameterized_and_conditional_code():
    code = """
    qubits 2
    cbits 2
    RX(1.5708) q[0]
    IF c[0] == 1 THEN X q[1]
    """
    circuit = parse_code_to_qast(code)
    assert circuit.num_qubits == 2
    assert circuit.num_cbits == 2
    assert circuit.operations[0].gate == "RX"
    assert circuit.operations[0].parameters["theta"] == pytest.approx(1.5708, abs=1e-3)
    assert circuit.operations[1].cbit == 0
    assert circuit.operations[1].operation.gate == "X"

def test_invalid_syntax_error():
    code = "H" # missing qubit specification
    with pytest.raises(CodeParserError) as exc_info:
        parse_code_to_qast(code)
    assert "Syntax error" in str(exc_info.value)

def test_unsupported_operation_error():
    code = "FOOBAR q[0]"
    with pytest.raises(CodeParserError) as exc_info:
        parse_code_to_qast(code)
    assert "Unsupported gate operation" in str(exc_info.value)

def test_qast_to_code_roundtrip():
    code_in = "qubits 2\ncbits 1\n\nH q[0]\nCNOT q[0], q[1]\nM q[0] -> c[0]"
    circuit = parse_code_to_qast(code_in)
    code_out = qast_to_code(circuit)
    assert "qubits 2" in code_out
    assert "H q[0]" in code_out
    assert "CNOT q[0], q[1]" in code_out

def test_compiled_code_execution_in_simulation_service():
    code = """
    qubits 2
    H q[0]
    CNOT q[0], q[1]
    """
    circuit = parse_code_to_qast(code)
    service = SimulationService()
    res = service.run_simulation(circuit, backend="custom_m1")

    assert res.status == "success"
    assert res.num_qubits == 2
    # Verify Bell state probabilities (50% |00> and 50% |11>)
    assert res.probabilities.get("00", 0) == pytest.approx(0.5, abs=1e-3)
    assert res.probabilities.get("11", 0) == pytest.approx(0.5, abs=1e-3)
