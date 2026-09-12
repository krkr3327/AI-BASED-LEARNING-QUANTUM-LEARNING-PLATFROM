import pytest
from fastapi.testclient import TestClient
from app.main import app

from app.schemas.ai import (
    AIRequest,
    AIResponse,
    AIAction,
    AIContextEnvelope,
    CircuitContext,
    ExecutionContext,
    AlgorithmContext,
    VisualizationContext,
    ErrorContext,
    LearningContext,
    ExperimentContext,
    UserContext,
    PageContext
)
from app.ai.context_engine import AIContextEngine
from app.ai.intent_engine import IntentEngine
from app.ai.action_system import AIActionValidator, APPROVED_GATES, APPROVED_ALGORITHMS
from app.ai.llm.mock_provider import MockAIProvider
from app.ai.llm.openai_provider import OpenAIProvider

client = TestClient(app)

def test_context_engine_extraction():
    raw_payload = {
        "page": "circuit_builder",
        "student_level": "Intermediate",
        "circuit": {
            "num_qubits": 2,
            "num_clbits": 2,
            "gates": [
                {"gate": "H", "qubits": [0]},
                {"gate": "CNOT", "qubits": [0, 1]},
                {"gate": "MEASURE", "qubits": [0]}
            ]
        },
        "quantum_result": {
            "backend": "numpy",
            "status": "success",
            "num_qubits": 2,
            "probabilities": {"00": 0.5, "11": 0.5},
            "statevector": [{"real": 0.7071, "imag": 0}, {"real": 0, "imag": 0}, {"real": 0, "imag": 0}, {"real": 0.7071, "imag": 0}],
            "measurement": "00",
            "execution_trace": [{"step": 0, "gate": "H", "target_qubits": [0]}]
        },
        "algorithm": {
            "algorithm_name": "grover",
            "stages": [{"name": "oracle"}, {"name": "diffuser"}]
        },
        "visualization": {
            "visualization_type": "bloch_sphere",
            "current_qubit": 0,
            "x": 0.0,
            "y": 1.0,
            "z": 0.0
        },
        "error": {
            "error_type": "DimensionMismatch",
            "user_facing_message": "Matrix dimension does not match qubit count."
        }
    }

    envelope = AIContextEngine.build_envelope(raw_payload)

    assert envelope.page_context.page == "circuit_builder"
    assert envelope.user_context.student_level == "Intermediate"
    assert envelope.circuit_context.num_qubits == 2
    assert len(envelope.circuit_context.gates) == 3
    assert len(envelope.circuit_context.measurements) == 1
    assert envelope.execution_context.probabilities == {"00": 0.5, "11": 0.5}
    assert envelope.execution_context.measurement == "00"
    assert envelope.execution_context.provenance["has_probabilities"] is True
    assert envelope.algorithm_context.algorithm_name == "grover"
    assert envelope.visualization_context.visualization_type == "bloch_sphere"
    assert envelope.visualization_context.y == 1.0
    assert envelope.error_context.error_type == "DimensionMismatch"

def test_intent_engine_deterministic_classification():
    env = AIContextEngine.build_envelope({})

    # Action intent
    assert IntentEngine.classify_intent("Add an H gate to q0", context=env) == "modify_circuit"
    assert IntentEngine.classify_intent("Run simulation on numpy", context=env) == "run_simulation"

    # Visualization intent
    assert IntentEngine.classify_intent("What does this Bloch sphere show?", context=env) == "explain_visualization"

    # Error & Debugging intent
    err_env = AIContextEngine.build_envelope({"error": {"user_facing_message": "Failed"}})
    assert IntentEngine.classify_intent("Why did this error happen?", context=err_env) == "explain_error"
    assert IntentEngine.classify_intent("How to fix this issue?", context=err_env) == "suggest_fix"

    # Analysis intent
    assert IntentEngine.classify_intent("Explain probability distribution", context=env) == "explain_probability"
    assert IntentEngine.classify_intent("Walk me through the execution trace", context=env) == "explain_trace"
    assert IntentEngine.classify_intent("Explain the statevector amplitudes", context=env) == "explain_statevector"

    # Algorithm intent
    algo_env = AIContextEngine.build_envelope({"algorithm": {"algorithm_name": "shor"}})
    assert IntentEngine.classify_intent("Explain Shor algorithm stage", context=algo_env) == "explain_algorithm_stage"

    # Learning intent
    assert IntentEngine.classify_intent("Give me a hint", context=env) == "hint"
    assert IntentEngine.classify_intent("What should I learn next?", context=env) == "next_topic"

def test_action_validator_safety_and_rules():
    # 1. Valid Gate addition
    valid_add = AIAction(
        action_type="add_gate",
        target="q0",
        parameters={"gate": "H", "qubits": [0]},
        reason="Add Hadamard"
    )
    validated = AIActionValidator.validate_action(valid_add)
    assert validated.validated is True

    # 2. Invalid Gate (unrecognized)
    invalid_gate = AIAction(
        action_type="add_gate",
        target="q0",
        parameters={"gate": "INVALID_GATE", "qubits": [0]}
    )
    validated_inv = AIActionValidator.validate_action(invalid_gate)
    assert validated_inv.validated is False
    assert "Invalid gate" in validated_inv.validation_error

    # 3. Security check: Reject code / shell injection attempts
    malicious_action = AIAction(
        action_type="add_gate",
        target="q0",
        parameters={"gate": "H", "qubits": [0], "code": "import os; os.system('whoami')"}
    )
    validated_mal = AIActionValidator.validate_action(malicious_action)
    assert validated_mal.validated is False
    assert "Security Violation" in validated_mal.validation_error

    # 4. Valid Algorithm loading
    valid_algo = AIAction(
        action_type="load_algorithm",
        target="grover",
        parameters={"algorithm": "grover"}
    )
    assert AIActionValidator.validate_action(valid_algo).validated is True

    # 5. Invalid Algorithm loading
    invalid_algo = AIAction(
        action_type="load_algorithm",
        target="nonexistent_algo"
    )
    assert AIActionValidator.validate_action(invalid_algo).validated is False

def test_mock_ai_provider():
    mock = MockAIProvider()
    assert mock.is_configured() is True
    assert mock.provider_name == "mock_provider"

    res1 = mock.generate_response("Explain H gate")
    assert "[Mock AI Provider]" in res1
    assert "Hadamard" in res1

    res2 = mock.generate_response("Explain Shor N=15")
    assert "[Mock AI Provider]" in res2
    assert "r=4" in res2

def test_ai_query_endpoint_unconfigured_llm():
    # Query without LLM key must honestly return llm_not_configured
    response = client.post("/api/ai/query", json={
        "question": "What is superposition?",
        "task_type": "explain_concept"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "llm_not_configured"
    assert data["answer"] == "llm_not_configured"
    assert data["intent"] == "explain_concept"
    assert len(data["sources"]) > 0  # RAG knowledge still works without LLM

def test_ai_query_endpoint_mock_override():
    # Query with mock provider override
    response = client.post("/api/ai/query", json={
        "question": "Tell me about Bell state",
        "task_type": "explain_concept",
        "provider_override": "mock"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "mock_response"
    assert "[Mock AI Provider]" in data["answer"]
    assert data["provider"] == "mock_provider"

def test_ai_validate_action_endpoint():
    action_payload = {
        "action_type": "navigate",
        "target": "circuit_builder"
    }
    response = client.post("/api/ai/validate_action", json=action_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["validated"] is True
