from typing import Dict, Any, Optional
from app.schemas.ai import (
    AIContextEnvelope,
    PageContext,
    UserContext,
    LearningContext,
    CircuitContext,
    ExecutionContext,
    AlgorithmContext,
    VisualizationContext,
    ErrorContext,
    ExperimentContext,
    KnowledgeContext,
    QuantumTutorContext
)

class AIContextEngine:
    """
    Central AI Context Engine for QuantumLearning.
    Normalizes and extracts domain-specific contexts into unified AIContextEnvelope,
    enforcing modularity and scientific data provenance tracking.
    """

    @classmethod
    def build_envelope(cls, raw_context: Optional[Any] = None) -> AIContextEnvelope:
        if raw_context is None:
            return AIContextEnvelope()

        if isinstance(raw_context, AIContextEnvelope):
            return raw_context

        if isinstance(raw_context, QuantumTutorContext):
            raw_dict = raw_context.model_dump()
        elif isinstance(raw_context, dict):
            raw_dict = raw_context
        elif hasattr(raw_context, "model_dump"):
            raw_dict = raw_context.model_dump()
        else:
            raw_dict = {}

        envelope = AIContextEnvelope()

        # Page & User context
        envelope.page_context = cls.extract_page_context(raw_dict)
        envelope.user_context = cls.extract_user_context(raw_dict)

        # Domain contexts
        if "circuit" in raw_dict or "circuit_context" in raw_dict or "qast_reference" in raw_dict:
            envelope.circuit_context = cls.extract_circuit_context(raw_dict)

        if "quantum_result" in raw_dict or "latest_result" in raw_dict or "execution_context" in raw_dict:
            envelope.execution_context = cls.extract_execution_context(raw_dict)

        if "algorithm" in raw_dict or "algorithm_context" in raw_dict:
            envelope.algorithm_context = cls.extract_algorithm_context(raw_dict)

        if "visualization" in raw_dict or "visualization_context" in raw_dict:
            envelope.visualization_context = cls.extract_visualization_context(raw_dict)

        if "error" in raw_dict or "error_context" in raw_dict:
            envelope.error_context = cls.extract_error_context(raw_dict)

        if "learning" in raw_dict or "learning_context" in raw_dict or "weak_concepts" in raw_dict:
            envelope.learning_context = cls.extract_learning_context(raw_dict)

        if "experiment" in raw_dict or "experiment_context" in raw_dict:
            envelope.experiment_context = cls.extract_experiment_context(raw_dict)

        return envelope

    @classmethod
    def extract_page_context(cls, raw_dict: Dict[str, Any]) -> PageContext:
        page_data = raw_dict.get("page_context") or {}
        if isinstance(page_data, PageContext):
            return page_data
        page_name = page_data.get("page") or raw_dict.get("page") or "general"
        return PageContext(
            page=str(page_name),
            location=page_data.get("location") or raw_dict.get("location"),
            section=page_data.get("section") or raw_dict.get("section")
        )

    @classmethod
    def extract_user_context(cls, raw_dict: Dict[str, Any]) -> UserContext:
        user_data = raw_dict.get("user_context") or {}
        if isinstance(user_data, UserContext):
            return user_data
        return UserContext(
            user_id=user_data.get("user_id") or raw_dict.get("user_id"),
            student_level=user_data.get("student_level") or raw_dict.get("student_level", "Beginner"),
            completed_concepts=user_data.get("completed_concepts") or raw_dict.get("completed_concepts", []),
            weak_concepts=user_data.get("weak_concepts") or raw_dict.get("weak_concepts", []),
            strong_concepts=user_data.get("strong_concepts") or raw_dict.get("strong_concepts", [])
        )

    @classmethod
    def extract_circuit_context(cls, raw_dict: Dict[str, Any]) -> CircuitContext:
        c_data = raw_dict.get("circuit_context") or raw_dict.get("circuit") or raw_dict.get("qast_reference") or {}
        if isinstance(c_data, CircuitContext):
            return c_data

        qast = c_data.get("qast") or (c_data if "gates" in c_data or "instructions" in c_data or "operations" in c_data else None)
        num_qubits = c_data.get("num_qubits") or (qast.get("num_qubits", 0) if isinstance(qast, dict) else 0)
        num_clbits = c_data.get("num_clbits") or (qast.get("num_clbits", 0) if isinstance(qast, dict) else 0)

        gates = c_data.get("gates") or (qast.get("instructions", []) if isinstance(qast, dict) else [])
        measurements = [g for g in gates if isinstance(g, dict) and g.get("gate") in ("MEASURE", "measure", "M")]
        resets = [g for g in gates if isinstance(g, dict) and g.get("gate") in ("RESET", "reset", "R")]
        conditional = [g for g in gates if isinstance(g, dict) and (g.get("condition") or g.get("control_qubits"))]

        return CircuitContext(
            qast=qast if isinstance(qast, dict) else None,
            num_qubits=int(num_qubits),
            num_clbits=int(num_clbits),
            operations=gates,
            gates=gates,
            parameters=c_data.get("parameters", {}),
            measurements=measurements,
            resets=resets,
            conditional_operations=conditional,
            metadata=c_data.get("metadata", {})
        )

    @classmethod
    def extract_execution_context(cls, raw_dict: Dict[str, Any]) -> ExecutionContext:
        res_data = raw_dict.get("execution_context") or raw_dict.get("quantum_result") or raw_dict.get("latest_result") or {}
        if isinstance(res_data, ExecutionContext):
            return res_data

        probabilities = res_data.get("probabilities")
        statevector = res_data.get("statevector")
        measurement = res_data.get("measurement")
        classical_bits = res_data.get("classical_bits")
        execution_trace = res_data.get("execution_trace") or res_data.get("trace") or []
        backend = res_data.get("backend") or raw_dict.get("selected_backend")
        status = res_data.get("status") or "success"

        provenance = {
            "source": "QuantumResult",
            "backend": backend,
            "has_probabilities": probabilities is not None,
            "has_statevector": statevector is not None,
            "has_measurement": measurement is not None,
            "has_trace": bool(execution_trace)
        }

        return ExecutionContext(
            backend=backend,
            status=status,
            num_qubits=res_data.get("num_qubits"),
            probabilities=probabilities,
            statevector=statevector,
            measurement=measurement,
            classical_bits=classical_bits,
            execution_history=res_data.get("execution_history", []),
            execution_trace=execution_trace,
            trace_capability=res_data.get("trace_capability", True if execution_trace else None),
            errors=res_data.get("errors", []),
            metadata=res_data.get("metadata", {}),
            provenance=provenance
        )

    @classmethod
    def extract_algorithm_context(cls, raw_dict: Dict[str, Any]) -> AlgorithmContext:
        algo_data = raw_dict.get("algorithm_context") or raw_dict.get("algorithm") or {}
        if isinstance(algo_data, AlgorithmContext):
            return algo_data

        return AlgorithmContext(
            algorithm_name=algo_data.get("algorithm_name") or algo_data.get("name"),
            description=algo_data.get("description"),
            generated_qast=algo_data.get("generated_qast") or algo_data.get("qast"),
            parameters=algo_data.get("parameters", {}),
            execution_result=algo_data.get("execution_result") or algo_data.get("result"),
            stages=algo_data.get("stages", []),
            metrics=algo_data.get("metrics", {}),
            metadata=algo_data.get("metadata", {})
        )

    @classmethod
    def extract_visualization_context(cls, raw_dict: Dict[str, Any]) -> VisualizationContext:
        viz_data = raw_dict.get("visualization_context") or raw_dict.get("visualization") or {}
        if isinstance(viz_data, VisualizationContext):
            return viz_data

        return VisualizationContext(
            visualization_type=viz_data.get("visualization_type") or viz_data.get("type"),
            current_qubit=viz_data.get("current_qubit") or viz_data.get("qubit"),
            alpha=viz_data.get("alpha"),
            beta=viz_data.get("beta"),
            x=viz_data.get("x"),
            y=viz_data.get("y"),
            z=viz_data.get("z"),
            normalization=viz_data.get("normalization"),
            numerical_data=viz_data.get("numerical_data") or viz_data.get("data", {}),
            source_quantum_result=viz_data.get("source_quantum_result") or raw_dict.get("quantum_result")
        )

    @classmethod
    def extract_error_context(cls, raw_dict: Dict[str, Any]) -> ErrorContext:
        err_data = raw_dict.get("error_context") or raw_dict.get("error") or {}
        if isinstance(err_data, ErrorContext):
            return err_data

        return ErrorContext(
            error_type=err_data.get("error_type") or err_data.get("type"),
            error_code=err_data.get("error_code") or err_data.get("code"),
            user_facing_message=err_data.get("user_facing_message") or err_data.get("message"),
            operation_involved=err_data.get("operation_involved") or err_data.get("operation"),
            backend=err_data.get("backend"),
            circuit=err_data.get("circuit"),
            relevant_parameters=err_data.get("relevant_parameters", {}),
            execution_state=err_data.get("execution_state"),
            recovery_suggestions=err_data.get("recovery_suggestions", [])
        )

    @classmethod
    def extract_learning_context(cls, raw_dict: Dict[str, Any]) -> LearningContext:
        learn_data = raw_dict.get("learning_context") or raw_dict.get("learning") or {}
        if isinstance(learn_data, LearningContext):
            return learn_data

        return LearningContext(
            course_id=learn_data.get("course_id"),
            module_id=learn_data.get("module_id"),
            lesson_id=learn_data.get("lesson_id"),
            current_topic=learn_data.get("current_topic") or raw_dict.get("current_topic"),
            completed_topics=learn_data.get("completed_topics") or raw_dict.get("completed_topics", []),
            current_challenge=learn_data.get("current_challenge"),
            assessment_results=learn_data.get("assessment_results", []),
            difficulty=learn_data.get("difficulty") or "beginner",
            hints_requested=learn_data.get("hints_requested", 0),
            mistakes=learn_data.get("mistakes", []),
            learning_objectives=learn_data.get("learning_objectives", [])
        )

    @classmethod
    def extract_experiment_context(cls, raw_dict: Dict[str, Any]) -> ExperimentContext:
        exp_data = raw_dict.get("experiment_context") or raw_dict.get("experiment") or {}
        if isinstance(exp_data, ExperimentContext):
            return exp_data

        return ExperimentContext(
            experiment_name=exp_data.get("experiment_name") or exp_data.get("name"),
            sweep_parameters=exp_data.get("sweep_parameters", {}),
            backend=exp_data.get("backend"),
            noise_model=exp_data.get("noise_model"),
            results=exp_data.get("results", []),
            metrics=exp_data.get("metrics", {}),
            execution_history=exp_data.get("execution_history", []),
            comparisons=exp_data.get("comparisons", [])
        )
