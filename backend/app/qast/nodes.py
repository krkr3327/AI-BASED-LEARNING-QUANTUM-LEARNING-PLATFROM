from pydantic import BaseModel, model_validator
from typing import List, Optional, Dict, Union
from app.qast.registry import GATE_REGISTRY

class ASTNode(BaseModel):
    pass

class GateNode(ASTNode):
    gate: str
    qubits: List[int]
    parameters: Optional[Dict[str, Union[float, str]]] = None


    @model_validator(mode='after')
    def validate_gate(self) -> 'GateNode':
        if self.gate not in GATE_REGISTRY:
            raise ValueError(f"Gate '{self.gate}' is not supported in the registry.")
        reg = GATE_REGISTRY[self.gate]
        if reg.arity == -1:
            if len(self.qubits) < 2:
                raise ValueError(f"Gate '{self.gate}' requires at least 2 qubits, got {len(self.qubits)}.")
        elif len(self.qubits) != reg.arity:
            raise ValueError(f"Gate '{self.gate}' requires exactly {reg.arity} qubits, got {len(self.qubits)}.")
        if len(set(self.qubits)) != len(self.qubits):
            raise ValueError(f"Duplicate qubits found in gate '{self.gate}': {self.qubits}")
        if reg.requires_parameters and not self.parameters:
            raise ValueError(f"Gate '{self.gate}' requires parameters.")
        return self

class MeasurementNode(ASTNode):
    qubits: List[int]
    cbits: List[int]

    @model_validator(mode='after')
    def validate_measurement(self) -> 'MeasurementNode':
        if len(self.qubits) != len(self.cbits):
            raise ValueError("Number of qubits must match number of cbits in measurement.")
        if len(set(self.qubits)) != len(self.qubits):
            raise ValueError("Duplicate qubits in measurement.")
        return self

class ResetNode(ASTNode):
    qubits: List[int]

    @model_validator(mode='after')
    def validate_reset(self) -> 'ResetNode':
        if len(set(self.qubits)) != len(self.qubits):
            raise ValueError("Duplicate qubits in reset.")
        return self

class ConditionalNode(ASTNode):
    cbit: int
    value: int
    operation: GateNode

class Circuit(BaseModel):
    num_qubits: int
    num_cbits: int = 0
    operations: List[Union[GateNode, MeasurementNode, ResetNode, ConditionalNode]] = []

    @model_validator(mode='after')
    def validate_circuit(self) -> 'Circuit':
        for op in self.operations:
            if isinstance(op, GateNode) or isinstance(op, MeasurementNode) or isinstance(op, ResetNode):
                for q in op.qubits:
                    if q < 0 or q >= self.num_qubits:
                        raise ValueError(f"Qubit index {q} out of bounds (0 to {self.num_qubits-1}).")
            if isinstance(op, MeasurementNode):
                for c in op.cbits:
                    if c < 0 or c >= self.num_cbits:
                        raise ValueError(f"Classical bit index {c} out of bounds.")
            if isinstance(op, ConditionalNode):
                if op.cbit < 0 or op.cbit >= self.num_cbits:
                    raise ValueError(f"Classical bit index {op.cbit} out of bounds.")
                for q in op.operation.qubits:
                    if q < 0 or q >= self.num_qubits:
                        raise ValueError(f"Qubit index {q} out of bounds (0 to {self.num_qubits-1}).")
        return self
