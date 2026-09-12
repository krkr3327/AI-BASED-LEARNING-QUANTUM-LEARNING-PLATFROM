from fastapi.testclient import TestClient
from app.main import app
from app.quantum_engine.registry import BACKEND_REGISTRY

client = TestClient(app)

def test_get_capabilities():
    response = client.get("/api/backends/capabilities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == len(BACKEND_REGISTRY)
    
    backend_ids = [b["backend_id"] for b in data]
    assert "custom_m1" in backend_ids
    assert "qiskit_aer" in backend_ids
    assert "pennylane" in backend_ids
    assert "cirq" in backend_ids
    assert "stabilizer" in backend_ids

def test_get_single_capability():
    response = client.get("/api/backends/capabilities/custom_m1")
    assert response.status_code == 200
    data = response.json()
    assert data["backend_id"] == "custom_m1"
    assert data["dynamic_circuits"] is True
    assert data["max_qubits"] == 16

def test_get_invalid_capability():
    response = client.get("/api/backends/capabilities/nonexistent_backend")
    assert response.status_code == 404
