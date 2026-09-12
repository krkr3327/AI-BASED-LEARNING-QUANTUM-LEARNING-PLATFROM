"""
Tests for Learning System Domain API & Server-Side Challenge Evaluator.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_curriculum():
    response = client.get("/api/learning/curriculum")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 9
    assert data[0]["id"] == "mod-1"

def test_get_module():
    response = client.get("/api/learning/modules/mod-1")
    assert response.status_code == 200
    data = response.json()
    assert data["title"].startswith("Module 1")

def test_get_lesson():
    response = client.get("/api/learning/lessons/les-1-1")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "01 — What is a Qubit?"

def test_complete_lesson():
    response = client.post("/api/learning/lessons/les-1-1/complete")
    assert response.status_code == 200
    assert response.json()["completed"] is True

def test_submit_exercise_multiple_choice():
    payload = {"exercise_id": "ex-1-1-1", "answer": 1}
    response = client.post("/api/learning/exercises/ex-1-1-1/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "passed" in data
    assert "score" in data

def test_submit_circuit_challenge_pass():
    # Challenge ex-1-2-2: H on q0 -> superposition state |+>
    payload = {
        "challenge_id": "ex-1-2-2",
        "num_qubits": 1,
        "operations": [
            {"type": "gate", "gate": "H", "qubits": [0]}
        ]
    }
    response = client.post("/api/learning/challenges/ex-1-2-2/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["passed"] is True
    assert data["score"] == 1.0

def test_submit_circuit_challenge_fail():
    # Challenge ex-1-2-2 requires equal superposition, but X gate produces |1>
    payload = {
        "challenge_id": "ex-1-2-2",
        "num_qubits": 1,
        "operations": [
            {"type": "gate", "gate": "X", "qubits": [0]}
        ]
    }
    response = client.post("/api/learning/challenges/ex-1-2-2/submit", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["passed"] is False
    assert data["score"] == 0.0

def test_get_progress_and_mastery():
    res_p = client.get("/api/learning/progress")
    assert res_p.status_code == 200
    assert "completed_lessons" in res_p.json()

    res_m = client.get("/api/learning/mastery")
    assert res_m.status_code == 200
    assert "concept_mastery" in res_m.json()

def test_get_recommendation():
    response = client.get("/api/learning/recommendations")
    assert response.status_code == 200
    data = response.json()
    assert "recommended_lesson_id" in data
