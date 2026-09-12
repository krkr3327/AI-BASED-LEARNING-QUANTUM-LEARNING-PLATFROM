import pytest
from fastapi.testclient import TestClient
from app.main import app

from app.schemas.ai import AIRequest, AIAction, AIContextEnvelope
from app.ai.context_engine import AIContextEngine
from app.ai.action_system import AIActionValidator

client = TestClient(app)

def test_journey_1_learning_to_simulation():
    # 1. Fetch lesson
    res_les = client.get("/api/learning/lessons/les-1-2")
    assert res_les.status_code == 200
    les_data = res_les.json()
    assert les_data["preset_circuit"] is not None

    # Format preset circuit operations with type: gate
    preset_ops = []
    for g in les_data["preset_circuit"]:
        preset_ops.append({
            "type": "gate",
            "gate": g["gate"],
            "qubits": g["qubits"]
        })

    # 2. Simulate preset circuit on backend
    sim_payload = {
        "num_qubits": 1,
        "operations": preset_ops,
        "backend": "custom_m1"
    }
    res_sim = client.post("/api/simulation/run", json=sim_payload)
    assert res_sim.status_code == 200
    sim_res = res_sim.json()
    assert sim_res["status"] == "success"
    assert "probabilities" in sim_res
    assert abs(sim_res["probabilities"]["0"] - 0.5) < 0.05

def test_journey_2_algorithm_to_ai_context():
    # 1. Fetch algorithms list
    res_algo = client.get("/api/algorithms/")
    assert res_algo.status_code == 200
    algo_list = res_algo.json()
    assert len(algo_list) > 0

    # 2. Query AI with Algorithm & Execution context
    ai_payload = {
        "question": "Explain Grover algorithm step by step",
        "task_type": "explain_algorithm",
        "context": {
            "page_context": {"page": "algorithms"},
            "algorithm_context": {
                "algorithm_name": "grover",
                "stages": [{"name": "oracle"}, {"name": "diffuser"}]
            },
            "execution_context": {
                "backend": "custom_m1",
                "status": "success",
                "probabilities": {"11": 1.0}
            }
        },
        "provider_override": "mock"
    }
    res_ai = client.post("/api/ai/query", json=ai_payload)
    assert res_ai.status_code == 200
    ai_res = res_ai.json()
    assert ai_res["intent"] in ("explain_algorithm", "explain_algorithm_stage")
    assert ai_res["status"] == "mock_response"
    assert "[Mock AI Provider]" in ai_res["answer"]

def test_journey_3_challenge_evaluation_to_progress():
    # 1. Submit Bell state challenge
    payload = {
        "challenge_id": "ex-3-1-1",
        "num_qubits": 2,
        "operations": [
            {"gate": "H", "qubits": [0]},
            {"gate": "CNOT", "qubits": [0, 1]}
        ]
    }
    res_eval = client.post("/api/learning/challenges/ex-3-1-1/submit", json=payload)
    assert res_eval.status_code == 200
    assert res_eval.json()["passed"] is True

    # 2. Complete lesson and verify progress update
    client.post("/api/learning/lessons/les-3-1/complete")
    res_prog = client.get("/api/learning/progress")
    assert res_prog.status_code == 200
    assert "les-3-1" in res_prog.json()["completed_lessons"]

def test_journey_4_experiment_to_ai_recommendation():
    # 1. Run parameter sweep experiment
    exp_payload = {
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
    res_exp = client.post("/api/simulation/sweep", json=exp_payload)
    assert res_exp.status_code == 200
    exp_res = res_exp.json()
    assert "sweep_results" in exp_res

    # 2. Fetch adaptive learning recommendation
    res_rec = client.get("/api/learning/recommendations")
    assert res_rec.status_code == 200
    assert "recommended_lesson_id" in res_rec.json()
    assert "reason" in res_rec.json()

def test_unified_ai_context_envelope():
    # Build complete AIContextEnvelope across all platform domains
    raw = {
        "page_context": {"page": "lab"},
        "user_context": {"student_level": "Advanced"},
        "learning_context": {"current_topic": "QAOA"},
        "circuit_context": {"num_qubits": 2, "gates": [{"gate": "H", "qubits": [0]}]},
        "execution_context": {"backend": "custom_m1", "probabilities": {"00": 0.5, "11": 0.5}},
        "algorithm_context": {"algorithm_name": "qaoa"},
        "visualization_context": {"visualization_type": "bloch_sphere", "x": 0.0, "y": 1.0, "z": 0.0},
        "error_context": {"error_type": "None"},
        "experiment_context": {"experiment_name": "QAOA Sweep"}
    }

    envelope = AIContextEngine.build_envelope(raw)
    assert envelope.page_context.page == "lab"
    assert envelope.user_context.student_level == "Advanced"
    assert envelope.learning_context.current_topic == "QAOA"
    assert envelope.circuit_context.num_qubits == 2
    assert envelope.execution_context.probabilities == {"00": 0.5, "11": 0.5}
    assert envelope.algorithm_context.algorithm_name == "qaoa"
    assert envelope.visualization_context.y == 1.0

def test_security_boundaries_and_llm_provider_readiness():
    # 1. Verify malicious code injection is strictly blocked
    malicious = AIAction(
        action_type="open_lab",
        target="lab",
        parameters={"code": "import subprocess; subprocess.Popen('calc.exe')"}
    )
    validated = AIActionValidator.validate_action(malicious)
    assert validated.validated is False
    assert "Security Violation" in validated.validation_error

    # 2. Verify AI query with unconfigured LLM honestly returns llm_not_configured
    res_ai = client.post("/api/ai/query", json={"question": "What is QFT?"})
    assert res_ai.status_code == 200
    ai_data = res_ai.json()
    assert ai_data["status"] == "llm_not_configured"
    assert ai_data["provider"] == "none"
    assert len(ai_data["sources"]) > 0  # Knowledge RAG remains operational
