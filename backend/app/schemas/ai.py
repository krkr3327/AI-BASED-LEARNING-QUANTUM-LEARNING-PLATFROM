from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List

class DocumentSource(BaseModel):
    document_id: str
    chunk_id: str
    title: Optional[str] = None
    topic: Optional[str] = None
    source_url: Optional[str] = None
    source_path: Optional[str] = None
    content: Optional[str] = None
    similarity_score: Optional[float] = None

class RetrievedKnowledge(BaseModel):
    text: str
    source: DocumentSource

class PageContext(BaseModel):
    page: str = "general" # lab, circuit_builder, algorithms, visualization, experiments, learning, error
    location: Optional[str] = None
    section: Optional[str] = None

class UserContext(BaseModel):
    user_id: Optional[str] = None
    student_level: str = "Beginner"
    completed_concepts: List[str] = Field(default_factory=list)
    weak_concepts: List[str] = Field(default_factory=list)
    strong_concepts: List[str] = Field(default_factory=list)

class LearningContext(BaseModel):
    course_id: Optional[str] = None
    module_id: Optional[str] = None
    lesson_id: Optional[str] = None
    current_topic: Optional[str] = None
    completed_topics: List[str] = Field(default_factory=list)
    current_challenge: Optional[str] = None
    assessment_results: List[Dict[str, Any]] = Field(default_factory=list)
    difficulty: Optional[str] = "beginner"
    hints_requested: int = 0
    mistakes: List[str] = Field(default_factory=list)
    learning_objectives: List[str] = Field(default_factory=list)

class CircuitContext(BaseModel):
    qast: Optional[Dict[str, Any]] = None
    num_qubits: int = 0
    num_clbits: int = 0
    operations: List[Dict[str, Any]] = Field(default_factory=list)
    gates: List[Dict[str, Any]] = Field(default_factory=list)
    parameters: Dict[str, Any] = Field(default_factory=dict)
    measurements: List[Dict[str, Any]] = Field(default_factory=list)
    resets: List[Dict[str, Any]] = Field(default_factory=list)
    conditional_operations: List[Dict[str, Any]] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ExecutionContext(BaseModel):
    backend: Optional[str] = None
    status: Optional[str] = None
    num_qubits: Optional[int] = None
    probabilities: Optional[Dict[str, float]] = None
    statevector: Optional[List[Dict[str, float]]] = None
    measurement: Optional[str] = None
    classical_bits: Optional[Dict[str, int]] = None
    execution_history: List[Dict[str, Any]] = Field(default_factory=list)
    execution_trace: List[Dict[str, Any]] = Field(default_factory=list)
    trace_capability: Optional[bool] = None
    errors: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    provenance: Dict[str, Any] = Field(default_factory=dict)

class AlgorithmContext(BaseModel):
    algorithm_name: Optional[str] = None
    description: Optional[str] = None
    generated_qast: Optional[Dict[str, Any]] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    execution_result: Optional[Dict[str, Any]] = None
    stages: List[Dict[str, Any]] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class VisualizationContext(BaseModel):
    visualization_type: Optional[str] = None # bloch_sphere, probability_distribution, statevector, interference, execution_trace, algorithm_metrics, experiment_results
    current_qubit: Optional[int] = None
    alpha: Optional[Dict[str, float]] = None
    beta: Optional[Dict[str, float]] = None
    x: Optional[float] = None
    y: Optional[float] = None
    z: Optional[float] = None
    normalization: Optional[float] = None
    numerical_data: Dict[str, Any] = Field(default_factory=dict)
    source_quantum_result: Optional[Dict[str, Any]] = None

class ErrorContext(BaseModel):
    error_type: Optional[str] = None
    error_code: Optional[str] = None
    user_facing_message: Optional[str] = None
    operation_involved: Optional[str] = None
    backend: Optional[str] = None
    circuit: Optional[Dict[str, Any]] = None
    relevant_parameters: Dict[str, Any] = Field(default_factory=dict)
    execution_state: Optional[str] = None
    recovery_suggestions: List[str] = Field(default_factory=list)

class ExperimentContext(BaseModel):
    experiment_name: Optional[str] = None
    sweep_parameters: Dict[str, Any] = Field(default_factory=dict)
    backend: Optional[str] = None
    noise_model: Optional[str] = None
    results: List[Dict[str, Any]] = Field(default_factory=list)
    metrics: Dict[str, Any] = Field(default_factory=dict)
    execution_history: List[Dict[str, Any]] = Field(default_factory=list)
    comparisons: List[Dict[str, Any]] = Field(default_factory=list)

class KnowledgeContext(BaseModel):
    retrieved_chunks: List[RetrievedKnowledge] = Field(default_factory=list)
    query: Optional[str] = None
    provenance: List[DocumentSource] = Field(default_factory=list)

class AIContextEnvelope(BaseModel):
    page_context: Optional[PageContext] = None
    user_context: Optional[UserContext] = None
    learning_context: Optional[LearningContext] = None
    circuit_context: Optional[CircuitContext] = None
    execution_context: Optional[ExecutionContext] = None
    algorithm_context: Optional[AlgorithmContext] = None
    visualization_context: Optional[VisualizationContext] = None
    error_context: Optional[ErrorContext] = None
    experiment_context: Optional[ExperimentContext] = None
    knowledge_context: Optional[KnowledgeContext] = None
    custom: Dict[str, Any] = Field(default_factory=dict)

# Legacy context wrapper preserved for backward compatibility
class QuantumTutorContext(BaseModel):
    user_question: Optional[str] = None
    task_type: Optional[str] = "general_chat"
    circuit: Optional[Dict[str, Any]] = None
    qast_reference: Optional[Dict[str, Any]] = None
    selected_backend: Optional[str] = None
    quantum_result: Optional[Dict[str, Any]] = None
    relevant_concepts: List[str] = Field(default_factory=list)
    retrieved_knowledge: List[RetrievedKnowledge] = Field(default_factory=list)
    student_level: Optional[str] = "Beginner"
    completed_concepts: List[str] = Field(default_factory=list)
    weak_concepts: List[str] = Field(default_factory=list)
    strong_concepts: List[str] = Field(default_factory=list)

class AIAction(BaseModel):
    action_type: str # add_gate, remove_gate, modify_gate, load_circuit, run_simulation, load_algorithm, open_visualization, navigate, start_experiment, provide_hint, create_challenge
    target: Optional[str] = None
    parameters: Dict[str, Any] = Field(default_factory=dict)
    reason: Optional[str] = None
    validated: bool = False
    validation_error: Optional[str] = None

class AIRequest(BaseModel):
    question: Optional[str] = None
    user_question: Optional[str] = None
    task_type: str = "chat" # chat, explain_concept, explain_gate, explain_circuit, explain_result, debug_circuit, hint, socratic
    context: Optional[Any] = None # Accepts dict, QuantumTutorContext or AIContextEnvelope
    provider_override: Optional[str] = None # e.g., "mock" for MockAIProvider

class AIResponse(BaseModel):
    answer: str
    status: str = "success" # 'success', 'llm_not_configured', 'mock_response', 'error'
    intent: Optional[str] = None
    key_points: List[str] = Field(default_factory=list)
    explanation: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)
    suggested_next_step: Optional[str] = None
    actions: List[AIAction] = Field(default_factory=list)
    sources: List[DocumentSource] = Field(default_factory=list)
    provider: Optional[str] = None
    provenance: Dict[str, Any] = Field(default_factory=dict)

