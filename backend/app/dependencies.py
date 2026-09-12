import os
from app.services.simulation_service import SimulationService
from app.services.ai_service import AIService
from app.services.rag_service import RAGService
from app.services.learning_service import LearningService
from app.ai.llm.nvidia_provider import NvidiaProvider
from app.ai.llm.gemini_provider import GeminiProvider
from app.ai.llm.fallback_provider import FallbackProvider
from app.rag.pipeline import RAGPipeline
from app.core.config import settings

_simulation_service = SimulationService()

# RAG & AI singletons
_rag_pipeline = RAGPipeline()
_rag_service = RAGService(_rag_pipeline)

def _build_llm_provider():
    return FallbackProvider(
        primary=NvidiaProvider(),
        secondary=GeminiProvider()
    )

_llm_provider = _build_llm_provider()
_ai_service = AIService(_llm_provider, _rag_service)

def get_simulation_service() -> SimulationService:
    return _simulation_service

def get_ai_service() -> AIService:
    return _ai_service

def get_rag_service() -> RAGService:
    return _rag_service

def get_learning_service() -> LearningService:
    return LearningService()
