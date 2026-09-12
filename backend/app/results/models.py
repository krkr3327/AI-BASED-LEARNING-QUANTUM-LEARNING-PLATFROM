from pydantic import BaseModel, model_validator
from typing import List, Optional, Dict, Any, Literal

class ComplexAmplitude(BaseModel):
    real: float
    imag: float

class ExecutionError(BaseModel):
    error_type: str
    message: str
    details: Optional[Dict[str, Any]] = None

class TraceStep(BaseModel):
    """
    A single step in a quantum execution trace.

    This structure is backend-agnostic. The frontend QuantumTracePlayer
    consumes TraceStep objects without knowing which backend produced them.

    INVARIANT: Only TraceStep objects with provenance="real_execution" are
    ever created. Synthetic or fabricated trace steps are permanently forbidden.

    The statevector_before and statevector_after fields contain REAL quantum
    state snapshots captured during actual backend execution. They are never
    interpolated, estimated, or reconstructed from final results.
    """
    # Identity — derived from Q-AST operation, never from circuit name
    step_index: int                                  # 0-based position in trace
    operation_type: str                              # "gate" | "measure" | "reset" | "conditional"
    operation_name: str                              # Exact gate name from Q-AST e.g. "H", "RY", "CNOT"
    qubits: List[int]                                # All qubit indices involved
    control_qubits: List[int] = []                   # Control qubit subset (CNOT, CZ, CPHASE, MCX)
    parameters: Optional[Dict[str, Any]] = None      # Actual parameters e.g. {"theta": 0.37}

    # Real quantum state snapshots (populated ONLY with genuine backend data)
    statevector_before: List[ComplexAmplitude]        # Full statevector BEFORE this operation
    statevector_after: List[ComplexAmplitude]         # Full statevector AFTER this operation

    # Derived from statevectors on backend (not computed in browser)
    probabilities_before: Dict[str, float]            # |α_i|² keyed by big-endian bitstring
    probabilities_after: Dict[str, float]             # |α_i|² keyed by big-endian bitstring

    # Dynamic circuit fields
    is_measurement: bool = False
    measurement_result: Optional[List[int]] = None    # Actual sampled bits — NEVER hardcoded
    classical_bits_before: Optional[List[int]] = None
    classical_bits_after: Optional[List[int]] = None
    is_reset: bool = False
    is_conditional: bool = False
    conditional_executed: Optional[bool] = None       # True=executed, False=skipped

    # Provenance — only "real_execution" is valid
    backend: str
    provenance: Literal["real_execution"] = "real_execution"


class TraceCapabilityInfo(BaseModel):
    """
    Describes whether this backend execution produced a trace and why.

    If capability == "unavailable", execution_trace will be an empty list [].
    No synthetic TraceStep objects are ever created to represent unavailability.
    """
    capability: Literal["full", "partial", "unavailable"]
    reason: Optional[str] = None

    @model_validator(mode="before")
    @classmethod
    def parse_str_or_dict(cls, value: Any) -> Any:
        if isinstance(value, str):
            return {"capability": value}
        return value


class QuantumResult(BaseModel):
    status: str
    backend_name: str
    num_qubits: int
    probabilities: Optional[Dict[str, float]] = None
    statevector: Optional[List[ComplexAmplitude]] = None
    measurement: Optional[str] = None
    classical_bits: Optional[List[int]] = None
    execution_history: Optional[List[Dict[str, Any]]] = None
    metadata: Dict[str, Any] = {}
    error: Optional[ExecutionError] = None

    # Execution trace — empty list if trace is unavailable (never contains synthetic steps)
    execution_trace: List[TraceStep] = []
    trace_capability: TraceCapabilityInfo = TraceCapabilityInfo(capability="unavailable")
