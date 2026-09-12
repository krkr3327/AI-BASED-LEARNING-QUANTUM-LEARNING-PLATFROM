from typing import Optional, Dict, Any
from app.schemas.ai import AIContextEnvelope

class IntentEngine:
    """
    Deterministic AI Intent Classification Engine for QuantumLearning.
    Classifies user requests into specific domain intents without requiring an LLM.
    Architected to allow seamless replacement or enhancement by an LLM model later.
    """

    VALID_INTENTS = {
        # EXPLANATION
        "explain_concept", "explain_gate", "explain_circuit", "explain_algorithm", "explain_result", "explain_visualization",
        # LEARNING
        "teach", "quiz", "hint", "next_topic", "adaptive_challenge",
        # DEBUGGING
        "debug_circuit", "explain_error", "suggest_fix",
        # ANALYSIS
        "compare_results", "analyze_experiment", "explain_probability", "explain_statevector", "explain_trace",
        # ACTION
        "modify_circuit", "run_simulation", "load_algorithm", "navigate", "configure_experiment",
        # RESEARCH
        "explain_algorithm_stage", "compare_backends", "investigate_result"
    }

    @classmethod
    def classify_intent(
        cls,
        user_question: Optional[str] = None,
        task_type: Optional[str] = None,
        context: Optional[AIContextEnvelope] = None
    ) -> str:
        question = (user_question or "").lower().strip()
        task = (task_type or "").lower().strip()

        # 1. Direct task_type match if it is a recognized intent
        if task in cls.VALID_INTENTS:
            return task

        # 2. Page & Error Context-driven intent classification
        if context and context.error_context and (context.error_context.error_type or context.error_context.user_facing_message):
            if any(w in question for w in ["fix", "resolve", "solution", "how to"]):
                return "suggest_fix"
            return "explain_error"

        # 3. Action intent classification (circuit creation/modification/execution)
        if any(w in question for w in ["add ", "insert ", "remove ", "delete ", "place ", "create bell", "h gate", "cnot"]):
            return "modify_circuit"
        if any(w in question for w in ["run simulation", "execute circuit", "simulate"]):
            return "run_simulation"
        if any(w in question for w in ["load algorithm", "open algorithm"]):
            return "load_algorithm"

        # 4. Analysis intent classification (statevector, probabilities, trace)
        if any(w in question for w in ["trace", "execution trace", "step by step trace"]):
            return "explain_trace"
        if any(w in question for w in ["statevector", "psi", "amplitudes"]):
            return "explain_statevector"
        if any(w in question for w in ["probability", "probabilities", "chance of 0", "chance of 1"]):
            return "explain_probability"
        if any(w in question for w in ["compare backends", "aer vs numpy", "pennylane vs qiskit"]):
            return "compare_backends"
        if any(w in question for w in ["compare", "experiment comparison"]):
            return "compare_results"

        # 5. Visualization intent classification
        if any(w in question for w in ["bloch", "sphere", "coordinates", "vector pointing", "interference"]):
            return "explain_visualization"


        # 6. Debugging intent classification
        if any(w in question for w in ["debug", "why is my circuit", "not working", "wrong output", "why zero"]):
            return "debug_circuit"
        if any(w in question for w in ["error", "exception", "failed"]):
            return "explain_error"

        # 7. Learning intent classification
        if any(w in question for w in ["hint", "give me a hint", "stuck"]):
            return "hint"
        if any(w in question for w in ["quiz", "test me", "question"]):
            return "quiz"
        if any(w in question for w in ["what should i learn next", "next topic", "where to start"]):
            return "next_topic"
        if any(w in question for w in ["harder problem", "challenge"]):
            return "adaptive_challenge"

        # 8. Algorithm intent classification
        if context and context.algorithm_context and context.algorithm_context.algorithm_name:
            if any(w in question for w in ["stage", "step", "oracle", "diffuser", "qft"]):
                return "explain_algorithm_stage"
            return "explain_algorithm"

        if any(w in question for w in ["grover", "shor", "vqe", "qaoa", "qec", "deutsch", "bernstein"]):
            return "explain_algorithm"

        # 9. Circuit & Result context defaults
        if context and context.circuit_context and context.circuit_context.gates:
            if any(w in question for w in ["explain this circuit", "what does this circuit do"]):
                return "explain_circuit"

        if context and context.execution_context and context.execution_context.probabilities:
            if any(w in question for w in ["explain result", "what does this mean", "why did this happen"]):
                return "explain_result"

        if any(w in question for w in ["gate", "hadamard", "pauli", "phase", "cnot"]):
            return "explain_gate"

        # 10. Fallback default
        return "explain_concept"
