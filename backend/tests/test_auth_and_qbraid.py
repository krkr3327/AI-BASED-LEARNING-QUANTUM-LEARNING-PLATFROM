"""
Tests for Student Authentication, qBraid Adapter, and RAG Sources.
"""
import pytest
from app.qast.nodes import Circuit, GateNode
from app.qast.adapters.qbraid import QBraidAdapter, QBRAID_CAPABILITIES
from app.results.normalizers.qbraid import QBraidNormalizer
from app.services.simulation_service import SimulationService
from app.rag.sources import SourceRegistry, KnowledgeSource
from app.auth.store import StudentStore
from app.auth.models import SavedCircuit


def test_qbraid_capabilities():
    adapter = QBraidAdapter()
    assert adapter.capabilities["backend_name"] == "qbraid"
    assert adapter.capabilities["hardware_access"] is True


def test_qbraid_missing_key_honest_error():
    adapter = QBraidAdapter()
    circuit = Circuit(num_qubits=2, operations=[GateNode(gate="H", qubits=[0])])
    with pytest.raises(ValueError) as exc_info:
        adapter.execute(circuit)
    assert "configuration_error" in str(exc_info.value)
    assert "QBRAID_API_KEY" in str(exc_info.value)


def test_qbraid_simulation_service_integration():
    sim = SimulationService()
    circuit = Circuit(num_qubits=2, operations=[GateNode(gate="H", qubits=[0])])
    with pytest.raises(Exception) as exc_info:
        sim.run_simulation(circuit, backend="qbraid")
    assert "QBRAID_API_KEY" in str(exc_info.value)


def test_rag_source_registry():
    registry = SourceRegistry()
    sources = registry.list_sources(enabled_only=True)
    assert len(sources) >= 6
    source_ids = [s.source_id for s in sources]
    assert "ibm_quantum_learning" in source_ids
    assert "qiskit_docs" in source_ids
    assert "pennylane_docs" in source_ids
    assert "qbraid_docs" in source_ids


def test_student_store_and_auth(tmp_path):
    storage_file = str(tmp_path / "students_test.json")
    store = StudentStore(storage_file=storage_file)

    # Signup
    record = store.create_student(
        username="alice",
        email="alice@quantum.edu",
        password="secretpassword",
        level="Intermediate"
    )
    assert record.profile.username == "alice"
    assert record.profile.level == "Intermediate"

    # Authenticate
    authenticated = store.authenticate("alice", "secretpassword")
    assert authenticated is not None
    assert authenticated.profile.student_id == record.profile.student_id

    # Invalid password
    assert store.authenticate("alice", "wrongpassword") is None

    # Save Circuit
    saved = SavedCircuit(
        circuit_id="circ_1",
        title="Bell Pair",
        num_qubits=2,
        qast={"num_qubits": 2, "operations": []}
    )
    progress = store.save_circuit(record.profile.student_id, saved)
    assert len(progress.saved_circuits) == 1
    assert progress.saved_circuits[0].title == "Bell Pair"
