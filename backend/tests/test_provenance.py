import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.quantum_engine import measurement
import numpy as np

client = TestClient(app)

def test_engine_provenance_sentinel(monkeypatch):
    """
    Sentinel Test to ensure the backend actually calls the M1 engine.
    We mock `calculate_probabilities` to ensure it is reached, and we
    can trace the execution provenance.
    """
    call_flag = {"called": False}
    original_calc = measurement.calculate_probabilities

    def sentinel_calculate_probabilities(state):
        call_flag["called"] = True
        return original_calc(state)

    monkeypatch.setattr(measurement, "calculate_probabilities", sentinel_calculate_probabilities)

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
    
    # Proof that the simulation actually ran through the engine
    assert call_flag["called"] is True, "The M1 calculate_probabilities function was completely bypassed!"


def test_simulation_various_circuits():
    # Test A: |0> -> X -> |1>
    res_a = client.post("/api/simulation/run", json={
        "num_qubits": 1,
        "num_cbits": 1,
        "gates": [{"gate": "X", "qubits": [0]}],
        "measurements": [{"qubits": [0], "cbits": [0]}]
    })
    assert res_a.status_code == 200
    assert res_a.json()["probabilities"]["1"] == 1.0

    # Test B: |0> -> H -> 0.5, 0.5
    res_b = client.post("/api/simulation/run", json={
        "num_qubits": 1,
        "num_cbits": 1,
        "gates": [{"gate": "H", "qubits": [0]}],
        "measurements": []
    })
    assert res_b.status_code == 200
    assert np.isclose(res_b.json()["probabilities"]["0"], 0.5)
    assert np.isclose(res_b.json()["probabilities"]["1"], 0.5)

    # Test C: H -> H -> |0>
    res_c = client.post("/api/simulation/run", json={
        "num_qubits": 1,
        "num_cbits": 1,
        "gates": [
            {"gate": "H", "qubits": [0]},
            {"gate": "H", "qubits": [0]}
        ],
        "measurements": [{"qubits": [0], "cbits": [0]}]
    })
    assert res_c.status_code == 200
    # Floating point might be ~1.0
    assert np.isclose(res_c.json()["probabilities"]["0"], 1.0)
    assert np.isclose(res_c.json()["probabilities"]["1"], 0.0)

    # Test D: Bell State
    res_d = client.post("/api/simulation/run", json={
        "num_qubits": 2,
        "num_cbits": 2,
        "gates": [
            {"gate": "H", "qubits": [0]},
            {"gate": "CNOT", "qubits": [0, 1]}
        ],
        "measurements": []
    })
    assert res_d.status_code == 200
    assert np.isclose(res_d.json()["probabilities"]["00"], 0.5)
    assert np.isclose(res_d.json()["probabilities"]["11"], 0.5)

    # Test E: Invalid qubit index
    res_e = client.post("/api/simulation/run", json={
        "num_qubits": 2,
        "num_cbits": 2,
        "gates": [{"gate": "H", "qubits": [99]}],
        "measurements": []
    })
    assert res_e.status_code == 400
