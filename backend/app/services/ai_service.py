from typing import Optional, List, Dict, Any
from app.schemas.ai import (
    AIRequest,
    AIResponse,
    AIAction,
    AIContextEnvelope,
    DocumentSource,
    QuantumTutorContext
)
from app.ai.context_engine import AIContextEngine
from app.ai.intent_engine import IntentEngine
from app.ai.action_system import AIActionValidator
from app.ai.llm.mock_provider import MockAIProvider
from app.services.rag_service import RAGService
from app.schemas.rag import RAGQueryRequest

class AIService:
    """
    Central AI Intelligence Service.
    Coordinates application context extraction, RAG retrieval, intent classification,
    action validation, and provider generation for the QuantumLearning platform.
    """

    def __init__(self, llm_provider, rag_service: RAGService):
        self.llm_provider = llm_provider
        self.rag_service = rag_service

    def query(self, request: AIRequest) -> AIResponse:
        question = request.question or request.user_question or ""

        # 1. Build & normalize application context envelope
        envelope: AIContextEnvelope = AIContextEngine.build_envelope(request.context)

        # 2. Classify intent deterministically
        intent = IntentEngine.classify_intent(
            user_question=question,
            task_type=request.task_type,
            context=envelope
        )

        # 3. Retrieve relevant educational knowledge from RAG system
        rag_query = question if question else f"Quantum computing {intent.replace('_', ' ')}"
        rag_response = self.rag_service.query(RAGQueryRequest(query=rag_query))
        sources: List[DocumentSource] = rag_response.sources if rag_response.sources else []

        # 4. Resolve provider (override for testing or default)
        active_provider = self.llm_provider
        if request.provider_override == "mock":
            active_provider = MockAIProvider()

        # Extract provenance dictionary from execution context
        provenance = {}
        if envelope.execution_context:
            provenance = envelope.execution_context.provenance or {
                "source": "QuantumResult",
                "backend": envelope.execution_context.backend
            }

        # 5. Handle unconfigured LLM state
        if not active_provider or not getattr(active_provider, "is_configured", lambda: False)():
            return AIResponse(
                answer="llm_not_configured",
                status="llm_not_configured",
                intent=intent,
                key_points=[
                    "Central AI Context Engine processed application state.",
                    f"Intent classified: {intent}.",
                    f"Retrieved {len(sources)} grounded educational sources."
                ],
                warnings=["LLM provider is not configured. Add OPENAI_API_KEY to enable generative AI reasoning."],
                actions=[],
                sources=sources,
                provider="none",
                provenance=provenance
            )

        # 6. Build comprehensive prompt for configured provider
        student_level = envelope.user_context.student_level if envelope.user_context else "Beginner"
        prompt_parts = [
            f"STUDENT LEVEL: {student_level}",
            f"CLASSIFIED INTENT: {intent}",
            f"TASK TYPE: {request.task_type}",
            f"USER QUESTION: {question}",
        ]

        if envelope.circuit_context and envelope.circuit_context.gates:
            prompt_parts.append(f"CIRCUIT CONTEXT: num_qubits={envelope.circuit_context.num_qubits}, gates={envelope.circuit_context.gates}")

        if envelope.execution_context and envelope.execution_context.probabilities:
            prompt_parts.append(f"QUANTUM RESULT (GROUND TRUTH): backend={envelope.execution_context.backend}, probabilities={envelope.execution_context.probabilities}, statevector={envelope.execution_context.statevector}, measurement={envelope.execution_context.measurement}")

        if envelope.algorithm_context and envelope.algorithm_context.algorithm_name:
            prompt_parts.append(f"ALGORITHM CONTEXT: name={envelope.algorithm_context.algorithm_name}, parameters={envelope.algorithm_context.parameters}, stages={envelope.algorithm_context.stages}")

        if envelope.visualization_context and envelope.visualization_context.visualization_type:
            prompt_parts.append(f"VISUALIZATION CONTEXT: type={envelope.visualization_context.visualization_type}, qubit={envelope.visualization_context.current_qubit}, coords=({envelope.visualization_context.x}, {envelope.visualization_context.y}, {envelope.visualization_context.z})")

        if envelope.error_context and (envelope.error_context.error_type or envelope.error_context.user_facing_message):
            prompt_parts.append(f"ERROR CONTEXT: type={envelope.error_context.error_type}, code={envelope.error_context.error_code}, message={envelope.error_context.user_facing_message}")

        if rag_response.answer:
            prompt_parts.append(f"RETRIEVED KNOWLEDGE CONTEXT:\n{rag_response.answer}")

        full_prompt = "\n\n".join(prompt_parts)
        answer = active_provider.generate_response(full_prompt)

        # 7. Generate & validate structured actions if applicable
        proposed_actions: List[AIAction] = []
        if intent == "modify_circuit" and ("add " in question.lower() or "h gate" in question.lower()):
            proposed = AIAction(
                action_type="add_gate",
                target="q0",
                parameters={"gate": "H", "qubits": [0]},
                reason="Add Hadamard gate to qubit 0 as requested."
            )
            validated = AIActionValidator.validate_action(proposed, envelope)
            proposed_actions.append(validated)
        elif intent == "load_algorithm":
            proposed = AIAction(
                action_type="load_algorithm",
                target="grover",
                parameters={"algorithm": "grover"},
                reason="Load Grover's search algorithm."
            )
            validated = AIActionValidator.validate_action(proposed, envelope)
            proposed_actions.append(validated)

        provider_name = getattr(active_provider, "last_provider_used", None) or getattr(active_provider, "provider_name", "unknown")
        status = "mock_response" if provider_name == "mock_provider" else ("success" if answer != "llm_not_configured" else "llm_not_configured")

        return AIResponse(
            answer=answer,
            status=status,
            intent=intent,
            key_points=[
                f"Ground truth execution provided by backend simulator.",
                f"Intent resolved to {intent}."
            ],
            explanation=answer,
            actions=proposed_actions,
            sources=sources,
            provider=provider_name,
            provenance=provenance
        )

    # Alias chat method to query for backward compatibility
    def chat(self, request: AIRequest) -> AIResponse:
        return self.query(request)
