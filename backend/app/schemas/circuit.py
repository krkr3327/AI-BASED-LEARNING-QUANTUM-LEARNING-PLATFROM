from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Union
from app.results.models import TraceCapabilityInfo

class ApiGateOperation(BaseModel):
    type: str = "gate"
    gate: str
    qubits: List[int]
    parameters: Optional[Dict[str, float]] = None

class ApiMeasurementOperation(BaseModel):
    type: str = "measure"
    qubits: List[int]
    cbits: List[int]

class ApiResetOperation(BaseModel):
    type: str = "reset"
    qubits: List[int]

class ApiConditionalOperation(BaseModel):
    type: str = "conditional"
    cbit: int
    value: int
    operation: ApiGateOperation

ApiOperation = Union[ApiGateOperation, ApiMeasurementOperation, ApiResetOperation, ApiConditionalOperation]

class CircuitRequest(BaseModel):
    num_qubits: int
    num_cbits: int = 0
    backend: str = "custom_m1"
    gates: List[ApiGateOperation] = []
    measurements: List[ApiMeasurementOperation] = []
    operations: List[Dict[str, Any]] = []

    def to_qast(self):
        from app.qast.nodes import Circuit, GateNode, MeasurementNode, ResetNode, ConditionalNode
        ops = []

        if self.operations:
            for op_data in self.operations:
                op_type = op_data.get("type", "gate")
                if op_type == "gate":
                    ops.append(GateNode(gate=op_data["gate"], qubits=op_data["qubits"], parameters=op_data.get("parameters")))
                elif op_type == "measure":
                    ops.append(MeasurementNode(qubits=op_data["qubits"], cbits=op_data["cbits"]))
                elif op_type == "reset":
                    ops.append(ResetNode(qubits=op_data["qubits"]))
                elif op_type == "conditional":
                    inner = op_data["operation"]
                    inner_op = GateNode(gate=inner["gate"], qubits=inner["qubits"], parameters=inner.get("parameters"))
                    ops.append(ConditionalNode(cbit=op_data["cbit"], value=op_data["value"], operation=inner_op))
        else:
            # Phase 1/2 backwards compatibility
            for g in self.gates:
                ops.append(GateNode(gate=g.gate, qubits=g.qubits, parameters=g.parameters))
            for m in self.measurements:
                ops.append(MeasurementNode(qubits=m.qubits, cbits=m.cbits))

        return Circuit(num_qubits=self.num_qubits, num_cbits=self.num_cbits, operations=ops)


class ParallelCircuitRequest(BaseModel):
    """Request for parallel multi-backend simulation."""
    num_qubits: int
    num_cbits: int = 0
    operations: List[Dict[str, Any]] = []
    backends: List[str] = ["custom_m1", "qiskit_aer", "pennylane", "cirq"]

    def to_qast(self):
        return CircuitRequest(
            num_qubits=self.num_qubits,
            num_cbits=self.num_cbits,
            operations=self.operations
        ).to_qast()


class ComplexNumber(BaseModel):
    real: float
    imag: float


class CircuitResponse(BaseModel):
    status: str
    backend_name: str
    num_qubits: int
    probabilities: Optional[Dict[str, float]] = None
    statevector: Optional[List[ComplexNumber]] = None
    measurement: Optional[str] = None
    classical_bits: Optional[List[int]] = None
    execution_history: Optional[List[Dict[str, Any]]] = None
    metadata: Dict[str, Any] = {}
    error: Optional[Dict[str, Any]] = None

    # Execution trace — real snapshots from actual backend execution
    # Empty list [] means trace is unavailable (no synthetic steps ever created)
    execution_trace: List[Dict[str, Any]] = []
    trace_capability: TraceCapabilityInfo = TraceCapabilityInfo(capability="unavailable")
    trace_reason: Optional[str] = None


class ParallelBackendResult(BaseModel):
    """Result from one backend in a parallel simulation run."""
    backend: str
    status: str                         # "success" | "error"
    started_at: float                   # actual Unix timestamp (time.time())
    completed_at: float                 # actual Unix timestamp (time.time())
    duration_ms: float                  # actual measured duration
    result: Optional[CircuitResponse] = None
    error: Optional[str] = None


class ParallelSimulationResponse(BaseModel):
    """Response from POST /api/simulation/run_parallel."""
    results: Dict[str, ParallelBackendResult]
    backends_requested: List[str]
    total_duration_ms: float            # wall clock from first start to last complete
