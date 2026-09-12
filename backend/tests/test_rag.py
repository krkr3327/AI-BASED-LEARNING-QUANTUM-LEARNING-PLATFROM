from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_rag_query_superposition():
    response = client.post("/api/rag/query", json={"query": "What is quantum superposition?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data
    assert len(data["sources"]) > 0
    # Sources are structured metadata dicts - validate structure and content
    for s in data["sources"]:
        assert isinstance(s, dict), "Each source must be a structured metadata dict"
        assert "document_id" in s, "Source must include document_id"
    # The retrieved document should relate to qubits or superposition
    doc_ids = [s["document_id"].lower() for s in data["sources"]]
    titles = [s.get("title", "").lower() for s in data["sources"]]
    combined = " ".join(doc_ids + titles)
    assert "qubit" in combined or "superposition" in combined, \
        f"Expected qubit or superposition topic in sources, got: {combined}"

def test_rag_query_entanglement():
    response = client.post("/api/rag/query", json={"query": "How does a CNOT gate create entanglement?"})
    assert response.status_code == 200
    data = response.json()
    assert "answer" in data
    assert "sources" in data
    assert len(data["sources"]) > 0
    # Sources are structured metadata dicts - validate structure and content
    for s in data["sources"]:
        assert isinstance(s, dict), "Each source must be a structured metadata dict"
        assert "document_id" in s, "Source must include document_id"
    # The retrieved document should relate to entanglement or gates
    doc_ids = [s["document_id"].lower() for s in data["sources"]]
    titles = [s.get("title", "").lower() for s in data["sources"]]
    combined = " ".join(doc_ids + titles)
    assert "entanglement" in combined or "gate" in combined, \
        f"Expected entanglement or gate topic in sources, got: {combined}"

