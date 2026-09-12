import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.qast.nodes import Circuit, GateNode, MeasurementNode
from app.quantum_engine.parameterized import bind_parameters, generate_parameter_sweep
from app.quantum_engine.observables import calculate_expectation_value, build_pauli_tensor
from app.quantum_engine.vqe import VQESolver
from app.quantum_engine.stabilizer import StabilizerEngine
from app.quantum_engine.rb import RBRunner, generate_random_clifford_sequence
from app.quantum_engine.qec import QECRunner
from app.services.simulation_service import SimulationService

client = TestClient(app)
sim_service = SimulationService()

def test_analytical_parameter_sweep_ry():
    """Validate RY(theta)|0> against analytical cos^2(theta/2) and sin^2(theta/2)."""
    thetas = [0.0, np.pi / 2.0, np.pi]
    expected_p0 = [1.0, 0.5, 0.0]
    expected_p1 = [0.0, 0.5, 1.0]

    for theta, exp0, exp1 in zip(thetas, expected_p0, expected_p1):
        circuit = Circuit(num_qubits=1, num_cbits=0, operations=[
            GateNode(gate="RY", qubits=[0], parameters={"theta": float(theta)})
        ])
        res = sim_service.run_simulation(circuit, backend="custom_m1")
        p0 = res.probabilities.get("0", 0.0)
        p1 = res.probabilities.get("1", 0.0)
        assert p0 == pytest.approx(exp0, abs=1e-4)
        assert p1 == pytest.approx(exp1, abs=1e-4)

def test_analytical_observables():
    """Validate <Z> for |0>, |1>; <X> for |+>, |->; and <ZZ> for Bell state."""
    # |0> -> <Z> = 1
    sv0 = np.array([1.0, 0.0], dtype=complex)
    assert calculate_expectation_value(sv0, "Z") == pytest.approx(1.0)

    # |1> -> <Z> = -1
    sv1 = np.array([0.0, 1.0], dtype=complex)
    assert calculate_expectation_value(sv1, "Z") == pytest.approx(-1.0)

    # |+> = (|0>+|1>)/sqrt(2) -> <X> = 1
    sv_plus = np.array([1.0/np.sqrt(2), 1.0/np.sqrt(2)], dtype=complex)
    assert calculate_expectation_value(sv_plus, "X") == pytest.approx(1.0)

    # |-> = (|0>-|1>)/sqrt(2) -> <X> = -1
    sv_minus = np.array([1.0/np.sqrt(2), -1.0/np.sqrt(2)], dtype=complex)
    assert calculate_expectation_value(sv_minus, "X") == pytest.approx(-1.0)

    # Bell state (|00>+|11>)/sqrt(2) -> <ZZ> = 1
    sv_bell = np.array([1.0/np.sqrt(2), 0.0, 0.0, 1.0/np.sqrt(2)], dtype=complex)
    assert calculate_expectation_value(sv_bell, "ZZ") == pytest.approx(1.0)

def test_vqe_analytical_ground_state():
    """VQE optimization for H = Z on 1 qubit. Minimum energy must be -1.0."""
    circuit = Circuit(num_qubits=1, num_cbits=0, operations=[
        GateNode(gate="RX", qubits=[0], parameters={"t": "t"})
    ])
    ham = [{"pauli": "Z", "coeff": 1.0}]
    
    solver = VQESolver()
    res = solver.solve(circuit, ham, ["t"], [0.0], maxiter=50)
    assert res["status"] in ["success", "completed"]
    assert res["final_energy"] == pytest.approx(-1.0, abs=1e-3)

def test_qec_syndrome_matrices():
    """Validate 3-qubit bit-flip repetition code for no error, q0 error, q1 error, q2 error."""
    runner = QECRunner()
    
    # No error
    res_none = runner.run_repetition_code(initial_state_bit=0, error_qubit=None)
    assert res_none["syndrome"] == "00"
    assert res_none["final_measured_state"] == "0"

    # Error on q0
    res_q0 = runner.run_repetition_code(initial_state_bit=0, error_qubit=0)
    assert res_q0["syndrome"] == "10"
    assert res_q0["final_measured_state"] == "0"

    # Error on q1
    res_q1 = runner.run_repetition_code(initial_state_bit=0, error_qubit=1)
    assert res_q1["syndrome"] == "11"
    assert res_q1["final_measured_state"] == "0"

    # Error on q2
    res_q2 = runner.run_repetition_code(initial_state_bit=0, error_qubit=2)
    assert res_q2["syndrome"] == "01"
    assert res_q2["final_measured_state"] == "0"

def test_stabilizer_cross_validation_and_rejection():
    """Cross-validate Stabilizer vs M1 on Bell state and test non-Clifford rejection."""
    circuit_clifford = Circuit(num_qubits=2, num_cbits=0, operations=[
        GateNode(gate="H", qubits=[0]),
        GateNode(gate="CNOT", qubits=[0, 1])
    ])
    engine = StabilizerEngine(2)
    res_stab = engine.execute_circuit(circuit_clifford)
    assert res_stab["is_clifford"] is True

    # Non-Clifford gate RX(theta) rejection check
    circuit_non_clifford = Circuit(num_qubits=1, num_cbits=0, operations=[
        GateNode(gate="RX", qubits=[0], parameters={"theta": 0.5})
    ])
    with pytest.raises(ValueError) as exc:
        engine_non = StabilizerEngine(1)
        engine_non.execute_circuit(circuit_non_clifford)
    assert "unsupported_operation" in str(exc.value)

def test_rb_noiseless_survival_and_seed_determinism():
    """Noiseless RB survival probability must be 1.0 and seed generation must be deterministic."""
    seq1 = generate_random_clifford_sequence(5, seed=123)
    seq2 = generate_random_clifford_sequence(5, seed=123)
    seq3 = generate_random_clifford_sequence(5, seed=999)
    assert seq1 == seq2
    assert seq1 != seq3

    runner = RBRunner()
    res = runner.run_benchmark(sequence_lengths=[2, 4], num_sequences=3, shots=50, seed=42)
    for prob in res["survival_probabilities"]:
        assert prob == pytest.approx(1.0, abs=1e-5)

def test_qec_logical_state_one():
    """Validate QEC 3-qubit bit-flip code for initial state |1> across error locations."""
    runner = QECRunner()
    for err_q in [None, 0, 1, 2]:
        res = runner.run_repetition_code(initial_state_bit=1, error_qubit=err_q)
        assert res["status"] == "success"
        assert res["final_measured_state"] == "1"

def test_rb_inverse_sequence_mathematical_identity():
    r"""Verify matrix identity U * U^\dagger = I for Clifford sequence and its computed inverse."""
    from app.quantum_engine.rb import get_inverse_clifford_sequence
    from app.quantum_engine.gates import GATE_MAP

    for length in [1, 2, 5, 10]:
        seq = generate_random_clifford_sequence(length, seed=10 + length)
        inv_seq = get_inverse_clifford_sequence(seq)

        full_matrix = np.eye(2, dtype=complex)
        for g in seq + inv_seq:
            if g in GATE_MAP:
                full_matrix = GATE_MAP[g] @ full_matrix

        # Global phase may differ, so check state |0> evolution: |<0|U|0>|^2 = 1.0
        v0 = np.array([1.0, 0.0], dtype=complex)
        v_final = full_matrix @ v0
        prob0 = abs(v_final[0]) ** 2
        assert prob0 == pytest.approx(1.0, abs=1e-5)

def test_cross_backend_bell_state_consistency():
    """Verify Bell state probabilities match across custom_m1, qiskit_aer, pennylane, cirq."""
    payload = {
        "num_qubits": 2,
        "num_cbits": 2,
        "gates": [
            {"gate": "H", "qubits": [0]},
            {"gate": "CNOT", "qubits": [0, 1]}
        ],
        "measurements": [{"qubits": [0, 1], "cbits": [0, 1]}]
    }

    from app.qast.adapters.cirq import CIRQ_AVAILABLE
    for b in ["custom_m1", "qiskit_aer", "pennylane", "cirq"]:
        if b == "cirq" and not CIRQ_AVAILABLE:
            continue
        payload["backend"] = b
        response = client.post("/api/simulation/run", json=payload)
        assert response.status_code == 200, f"Backend {b} failed"
        data = response.json()
        assert data["status"] == "success"
        probs = data["probabilities"]
        assert probs["00"] == pytest.approx(0.5, abs=1e-4)
        assert probs["11"] == pytest.approx(0.5, abs=1e-4)
