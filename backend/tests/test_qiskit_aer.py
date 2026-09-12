import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_qiskit_x_on_q0():
    payload = {
        "backend": "qiskit_aer",
        "num_qubits": 2,
        "num_cbits": 2,
        "gates": [{"gate": "X", "qubits": [0]}],
        "measurements": [{"qubits": [0, 1], "cbits": [0, 1]}]
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["status"] == "success"
    assert data["backend_name"] == "qiskit_aer"
    assert data["probabilities"]["10"] == 1.0

def test_qiskit_h_on_q0():
    payload = {
        "backend": "qiskit_aer",
        "num_qubits": 2,
        "num_cbits": 2,
        "gates": [{"gate": "H", "qubits": [0]}],
        "measurements": [{"qubits": [0, 1], "cbits": [0, 1]}]
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["probabilities"]["00"] == pytest.approx(0.5)
    assert data["probabilities"]["10"] == pytest.approx(0.5)

def test_qiskit_h_then_h():
    payload = {
        "backend": "qiskit_aer",
        "num_qubits": 2,
        "num_cbits": 2,
        "gates": [
            {"gate": "H", "qubits": [0]},
            {"gate": "H", "qubits": [0]}
        ],
        "measurements": [{"qubits": [0, 1], "cbits": [0, 1]}]
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["probabilities"]["00"] == pytest.approx(1.0)

def test_bell_circuit_cross_backend():
    payload = {
        "num_qubits": 2,
        "num_cbits": 2,
        "gates": [
            {"gate": "H", "qubits": [0]},
            {"gate": "CNOT", "qubits": [0, 1]}
        ],
        "measurements": [{"qubits": [0, 1], "cbits": [0, 1]}]
    }
    
    payload["backend"] = "custom_m1"
    response_m1 = client.post("/api/simulation/run", json=payload)
    assert response_m1.status_code == 200
    m1_probs = response_m1.json()["probabilities"]
    
    payload["backend"] = "qiskit_aer"
    response_qiskit = client.post("/api/simulation/run", json=payload)
    assert response_qiskit.status_code == 200
    qiskit_probs = response_qiskit.json()["probabilities"]
    
    for state in ["00", "01", "10", "11"]:
        # default to 0.0 if not present
        p_m1 = m1_probs.get(state, 0.0)
        p_qk = qiskit_probs.get(state, 0.0)
        assert p_m1 == pytest.approx(p_qk, abs=1e-5)
        
    assert qiskit_probs["00"] == pytest.approx(0.5, abs=1e-5)
    assert qiskit_probs["11"] == pytest.approx(0.5, abs=1e-5)

def test_qiskit_measurement_integrity():
    payload = {
        "backend": "qiskit_aer",
        "num_qubits": 2,
        "num_cbits": 2,
        "gates": [{"gate": "H", "qubits": [0]}],
        "measurements": [{"qubits": [0, 1], "cbits": [0, 1]}]
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    
    meas = data.get("measurement")
    assert meas is not None
    assert len(meas) == 2
    assert meas in data["probabilities"]

def test_qiskit_error_invalid_qubit():
    payload = {
        "backend": "qiskit_aer",
        "num_qubits": 2,
        "gates": [{"gate": "X", "qubits": [99]}],
        "measurements": [{"qubits": [0, 1], "cbits": [0, 1]}]
    }
    response = client.post("/api/simulation/run", json=payload)
    # The AST builder checks num_qubits, so this actually fails validation before Qiskit
    # It returns 400 because of Pydantic / node validation.
    assert response.status_code == 400

def test_qiskit_error_unsupported_gate():
    payload = {
        "backend": "qiskit_aer",
        "num_qubits": 2,
        "gates": [{"gate": "UNSUPPORTED", "qubits": [0]}],
        "measurements": [{"qubits": [0, 1], "cbits": [0, 1]}]
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 400
