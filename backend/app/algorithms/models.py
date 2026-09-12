from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from app.qast.nodes import Circuit
from app.results.models import QuantumResult

class AlgorithmRequest(BaseModel):
    backend: str = "custom_m1"
    parameters: Dict[str, Any] = {}

class AlgorithmInfo(BaseModel):
    id: str
    name: str
    description: str
    required_parameters: List[str]
    educational_stages: List[str]

class AlgorithmResponse(BaseModel):
    algorithm: AlgorithmInfo
    circuit: Circuit
    result: QuantumResult
    metadata: Dict[str, Any] = {}
