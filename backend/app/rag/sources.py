"""
RAG Source Registry.

Manages curated local documents and approved online quantum documentation sources.
Preserves provenance and trust metadata for every quantum knowledge chunk.
"""
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class KnowledgeSource(BaseModel):
    source_id: str
    title: str
    provider: str
    url: str
    source_type: str = "online_official_doc"  # "local_document" | "online_official_doc"
    version_date: str = "2026-01-01"
    trust_level: str = "official"  # "official" | "curated"
    enabled: bool = True


APPROVED_SOURCES: List[KnowledgeSource] = [
    KnowledgeSource(
        source_id="local_quantum_docs",
        title="Local Curated Quantum Engineering Knowledge",
        provider="QuantumLearning Core",
        url="local://docs/",
        source_type="local_document",
        version_date="2026-09-01",
        trust_level="official",
        enabled=True
    ),
    KnowledgeSource(
        source_id="ibm_quantum_learning",
        title="IBM Quantum Learning",
        provider="IBM",
        url="https://learning.quantum.ibm.com/",
        source_type="online_official_doc",
        version_date="2026-01-01",
        trust_level="official",
        enabled=True
    ),
    KnowledgeSource(
        source_id="qiskit_docs",
        title="IBM Qiskit Documentation",
        provider="IBM",
        url="https://docs.quantum.ibm.com/",
        source_type="online_official_doc",
        version_date="2026-01-01",
        trust_level="official",
        enabled=True
    ),
    KnowledgeSource(
        source_id="azure_quantum",
        title="Microsoft Azure Quantum Documentation",
        provider="Microsoft",
        url="https://learn.microsoft.com/en-us/azure/quantum/",
        source_type="online_official_doc",
        version_date="2026-01-01",
        trust_level="official",
        enabled=True
    ),
    KnowledgeSource(
        source_id="pennylane_docs",
        title="PennyLane Documentation",
        provider="Xanadu",
        url="https://docs.pennylane.ai/",
        source_type="online_official_doc",
        version_date="2026-01-01",
        trust_level="official",
        enabled=True
    ),
    KnowledgeSource(
        source_id="cirq_docs",
        title="Google Cirq Documentation",
        provider="Google Quantum AI",
        url="https://quantumai.google/cirq",
        source_type="online_official_doc",
        version_date="2026-01-01",
        trust_level="official",
        enabled=True
    ),
    KnowledgeSource(
        source_id="qbraid_docs",
        title="qBraid Platform Documentation",
        provider="qBraid",
        url="https://docs.qbraid.com/",
        source_type="online_official_doc",
        version_date="2026-01-01",
        trust_level="official",
        enabled=True
    )
]


class SourceRegistry:
    def __init__(self, sources: Optional[List[KnowledgeSource]] = None):
        self._sources: Dict[str, KnowledgeSource] = {
            s.source_id: s for s in (sources or APPROVED_SOURCES)
        }

    def list_sources(self, enabled_only: bool = True) -> List[KnowledgeSource]:
        if enabled_only:
            return [s for s in self._sources.values() if s.enabled]
        return list(self._sources.values())

    def get_source(self, source_id: str) -> Optional[KnowledgeSource]:
        return self._sources.get(source_id)

    def register_source(self, source: KnowledgeSource) -> None:
        self._sources[source.source_id] = source
