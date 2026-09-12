from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_ai_chat_endpoint():
    # Test context-aware AI payload
    payload = {
        "question": "Explain this circuit.",
        "context": {
            "circuit": {"num_qubits": 2, "gates": [{"gate": "H", "qubits": [0]}]},
            "latest_result": {"status": "success", "measurement": "00"}
        }
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    # Verify the AI explicitly indicates the deferred/unconfigured state
    # Real LLM integration is deferred in this phase; the response must NOT contain
    # hardcoded fake answers or external model calls.
    assert "llm_not_configured" in data.get("status", "") or "[AI Capability Deferred]" in data["answer"], \
        f"Expected deferred AI state but got: {data['answer']}"

