from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_simulation_run_bell_state():
    payload = {
        "num_qubits": 2,
        "num_cbits": 2,
        "gates": [
            {"gate": "H", "qubits": [0]},
            {"gate": "CNOT", "qubits": [0, 1]}
        ],
        "measurements": [
            {"qubits": [0, 1], "cbits": [0, 1]}
        ]
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "00" in data["probabilities"]
    assert "11" in data["probabilities"]
    assert abs(data["probabilities"]["00"] - 0.5) < 1e-5
    assert abs(data["probabilities"]["11"] - 0.5) < 1e-5
    
    # State should be 00 or 11
    assert data["measurement"] in ["00", "11"]

def test_simulation_invalid_api_payload():
    payload = {
        "num_qubits": 2,
        "gates": [
            {"gate": "CNOT", "qubits": [0]} # Invalid arity
        ]
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 400
    assert "requires exactly 2 qubits" in response.json()["detail"]
