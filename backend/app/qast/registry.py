from pydantic import BaseModel

class GateDef(BaseModel):
    name: str
    arity: int
    requires_parameters: bool

GATE_REGISTRY = {
    "X": GateDef(name="X", arity=1, requires_parameters=False),
    "Y": GateDef(name="Y", arity=1, requires_parameters=False),
    "Z": GateDef(name="Z", arity=1, requires_parameters=False),
    "H": GateDef(name="H", arity=1, requires_parameters=False),
    "S": GateDef(name="S", arity=1, requires_parameters=False),
    "T": GateDef(name="T", arity=1, requires_parameters=False),
    "RX": GateDef(name="RX", arity=1, requires_parameters=True),
    "RY": GateDef(name="RY", arity=1, requires_parameters=True),
    "RZ": GateDef(name="RZ", arity=1, requires_parameters=True),
    "CNOT": GateDef(name="CNOT", arity=2, requires_parameters=False),
    "CZ": GateDef(name="CZ", arity=2, requires_parameters=False),
    "SWAP": GateDef(name="SWAP", arity=2, requires_parameters=False),
    "CPHASE": GateDef(name="CPHASE", arity=2, requires_parameters=True),
    "MCX": GateDef(name="MCX", arity=-1, requires_parameters=False),
}
