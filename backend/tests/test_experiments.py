import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.qast.nodes import Circuit, GateNode, MeasurementNode
from app.quantum_engine.parameterized import bind_parameters, generate_parameter_sweep
from app.quantum_engine.observables import calculate_expectation_value
from app.quantum_engine.vqe import VQESolver
from app.quantum_engine.stabilizer import StabilizerEngine
from app.quantum_engine.rb import RBRunner
from app.quantum_engine.qec import QECRunner

client = TestClient(app)

def test_parameterized_binding_and_sweep():
    ops = [GateNode(gate="RX", qubits=[0], parameters={"theta": "theta_val"})]
    circuit = Circuit(num_qubits=1, num_cbits=0, operations=ops)
    
    bound = bind_parameters(circuit, {"theta_val": 3.14159})
    assert bound.operations[0].parameters["theta"] == 3.14159

    sweep = generate_parameter_sweep("theta", 0.0, 3.14159, 5)
    assert len(sweep) == 5
    assert sweep[0] == 0.0
    assert abs(sweep[-1] - 3.14159) < 1e-4

def test_observables_expectation():
    # |0> -> <Z> = 1.0
    sv_0 = np.array([1.0, 0.0], dtype=complex)
    assert abs(calculate_expectation_value(sv_0, "Z") - 1.0) < 1e-5
    
    # |1> -> <Z> = -1.0
    sv_1 = np.array([0.0, 1.0], dtype=complex)
    assert abs(calculate_expectation_value(sv_1, "Z") - (-1.0)) < 1e-5

def test_vqe_solver():
    # Minimize <Z> for RX(theta)|0>
    ops = [GateNode(gate="RX", qubits=[0], parameters={"theta": "t"})]
    circuit = Circuit(num_qubits=1, num_cbits=0, operations=ops)
    ham = [{"pauli": "Z", "coeff": 1.0}]
    
    solver = VQESolver()
    res = solver.solve(circuit, ham, ["t"], [0.0], maxiter=30)
    assert "final_energy" in res
    assert res["final_energy"] <= 1.0

def test_stabilizer_engine():
    circuit = Circuit(num_qubits=2, num_cbits=0, operations=[
        GateNode(gate="H", qubits=[0]),
        GateNode(gate="CNOT", qubits=[0, 1])
    ])
    engine = StabilizerEngine(2)
    res = engine.execute_circuit(circuit)
    assert res["status"] == "success"
    assert res["is_clifford"] is True

def test_qec_repetition_code():
    runner = QECRunner()
    res = runner.run_repetition_code(initial_state_bit=0, error_qubit=1)
    assert res["status"] == "success"
    assert res["corrected"] is True

def test_rb_runner():
    runner = RBRunner()
    res = runner.run_benchmark(sequence_lengths=[2, 4], num_sequences=2, shots=10)
    assert res["status"] == "success"
    assert len(res["survival_probabilities"]) == 2

def test_experiment_endpoints():
    # Sweep API endpoint
    payload = {
        "circuit": {
            "num_qubits": 1,
            "num_cbits": 0,
            "operations": [{"type": "gate", "gate": "RX", "qubits": [0], "parameters": {"theta": "t"}}]
        },
        "param_name": "t",
        "start": 0.0,
        "stop": 3.14,
        "steps": 3
    }
    response = client.post("/api/simulation/sweep", json=payload)
    assert response.status_code == 200
    assert len(response.json()["sweep_results"]) == 3
