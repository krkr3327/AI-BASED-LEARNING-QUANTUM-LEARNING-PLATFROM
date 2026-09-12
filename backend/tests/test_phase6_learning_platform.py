import pytest
from fastapi.testclient import TestClient
from app.main import app

from app.learning.curriculum import CURRICULUM
from app.learning.store import learning_store
from app.ai.context_engine import AIContextEngine
from app.ai.action_system import AIActionValidator
from app.schemas.ai import AIAction

client = TestClient(app)

def test_curriculum_and_course_endpoints():
    # 1. GET /api/learning/courses
    res_courses = client.get("/api/learning/courses")
    assert res_courses.status_code == 200
    courses = res_courses.json()
    assert len(courses) >= 9
    assert courses[0]["id"] == "mod-1"

    # 2. GET /api/learning/courses/{course_id}
    res_mod1 = client.get("/api/learning/courses/mod-1")
    assert res_mod1.status_code == 200
    assert res_mod1.json()["title"].startswith("Module 1")

    # 3. GET /api/learning/topics
    res_topics = client.get("/api/learning/topics")
    assert res_topics.status_code == 200
    topics = res_topics.json()
    assert len(topics) >= 9

    # 4. GET /api/learning/lessons/{lesson_id}
    res_les1 = client.get("/api/learning/lessons/les-1-1")
    assert res_les1.status_code == 200
    les1 = res_les1.json()
    assert les1["id"] == "les-1-1"
    assert len(les1["objectives"]) >= 2

def test_assessment_security_hidden_answers():
    # Verify GET /api/learning/assessments/ass-1-1 returns question text without leaking explanations/answers
    res = client.get("/api/learning/assessments/ass-1-1")
    assert res.status_code == 200
    ass_data = res.json()
    assert "questions" in ass_data
    for q in ass_data["questions"]:
        assert "explanation" not in q

def test_assessment_submission_server_validation():
    # Submit assessment answer
    payload = {
        "assessment_id": "ass-1-1",
        "answers": {"q1": 0}
    }
    res = client.post("/api/learning/assessments/ass-1-1/submit", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "passed" in data
    assert data["score"] >= 0.0
    assert "explanation_map" in data

def test_challenge_submission_authoritative_quantum_execution():
    # Submit a circuit challenge: H on q0, CNOT(0,1) -> Bell state
    payload = {
        "challenge_id": "ex-3-1-1",
        "num_qubits": 2,
        "operations": [
            {"gate": "H", "qubits": [0]},
            {"gate": "CNOT", "qubits": [0, 1]}
        ]
    }
    res = client.post("/api/learning/challenges/ex-3-1-1/submit", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["passed"] is True
    assert data["score"] >= 0.9
    assert "empirical_metrics" in data
    assert "evaluated_probabilities" in data["empirical_metrics"]
    assert data["empirical_metrics"]["evaluated_probabilities"]["00"] > 0.4


def test_challenge_resource_safety_limit():
    # Attempting to submit a challenge with >16 qubits must be rejected
    payload = {
        "challenge_id": "ex-3-1-1",
        "num_qubits": 20,
        "operations": []
    }
    res = client.post("/api/learning/challenges/ex-3-1-1/submit", json=payload)
    assert res.status_code == 400
    assert "Qubit limit exceeded" in res.json()["detail"]

def test_progress_tracking_and_mastery():
    # 1. Check clean initial progress
    res_prog = client.get("/api/learning/progress")
    assert res_prog.status_code == 200

    # 2. Complete lesson
    res_complete = client.post("/api/learning/lessons/les-1-1/complete")
    assert res_complete.status_code == 200

    # 3. Update progress explicitly
    res_upd = client.post("/api/learning/progress", json={"lesson_id": "les-1-1", "status": "COMPLETED"})
    assert res_upd.status_code == 200

    # 4. Check concept mastery
    res_mast = client.get("/api/learning/mastery")
    assert res_mast.status_code == 200
    assert "concept_mastery" in res_mast.json()

def test_hints_and_recommendations():
    # 1. Progressive hints
    hint_req = {"lesson_id": "les-1-1", "hint_level": 1}
    res_hint = client.post("/api/learning/hints", json=hint_req)
    assert res_hint.status_code == 200
    hint_data = res_hint.json()
    assert hint_data["hint_level"] == 1
    assert "Hint Level 1" in hint_data["title"]

    # 2. Recommendations
    res_recs = client.get("/api/learning/recommendations")
    assert res_recs.status_code == 200
    rec_data = res_recs.json()
    assert "recommended_lesson_id" in rec_data
    assert "reason" in rec_data


def test_ai_learning_context_and_actions():
    # 1. Learning context envelope extraction
    raw_payload = {
        "learning": {
            "current_topic": "Superposition",
            "difficulty": "beginner"
        }
    }
    envelope = AIContextEngine.build_envelope(raw_payload)
    assert envelope.learning_context.current_topic == "Superposition"

    # 2. Learning AI actions validation
    action_lesson = AIAction(action_type="open_lesson", target="les-1-1")
    action_challenge = AIAction(action_type="start_challenge", target="ex-3-1-1")
    action_lab = AIAction(action_type="open_lab")

    assert AIActionValidator.validate_action(action_lesson).validated is True
    assert AIActionValidator.validate_action(action_challenge).validated is True
    assert AIActionValidator.validate_action(action_lab).validated is True
