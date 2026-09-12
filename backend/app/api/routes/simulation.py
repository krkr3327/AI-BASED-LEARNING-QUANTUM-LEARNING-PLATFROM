from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any
from pydantic import BaseModel
from app.schemas.circuit import CircuitRequest, CircuitResponse, ParallelCircuitRequest, ParallelSimulationResponse
from app.services.simulation_service import SimulationService
from app.dependencies import get_simulation_service
from app.qast.parser import parse_code_to_qast, qast_to_code, CodeParserError

router = APIRouter()

class CodeCompileRequest(BaseModel):
    code: str

class CodeCompileResponse(BaseModel):
    num_qubits: int
    num_cbits: int
    operations: list

class QASTToCodeRequest(BaseModel):
    num_qubits: int
    num_cbits: int = 0
    operations: list

@router.post("/run", response_model=CircuitResponse)
def run_simulation(request: CircuitRequest, simulation_service: SimulationService = Depends(get_simulation_service)):
    try:
        qast_circuit = request.to_qast()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return simulation_service.run_simulation(qast_circuit, backend=request.backend)


@router.post("/run_parallel", response_model=ParallelSimulationResponse)
def run_parallel(request: ParallelCircuitRequest, simulation_service: SimulationService = Depends(get_simulation_service)):
    try:
        qast_circuit = request.to_qast()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        return simulation_service.run_parallel(qast_circuit, backends=request.backends)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/code_to_qast")
def compile_code_to_qast(request: CodeCompileRequest):
    """Compiles text-based quantum code into Q-AST."""
    try:
        circuit = parse_code_to_qast(request.code)
        # Convert operations to JSON dict format
        ops_dict = []
        for op in circuit.operations:
            ops_dict.append(op.to_dict())
        return {
            "status": "success",
            "num_qubits": circuit.num_qubits,
            "num_cbits": circuit.num_cbits,
            "operations": ops_dict
        }
    except CodeParserError as e:
        raise HTTPException(status_code=400, detail={"message": e.message, "line_number": e.line_number})
    except Exception as e:
        raise HTTPException(status_code=400, detail={"message": str(e)})


@router.post("/qast_to_code")
def convert_qast_to_code(request: QASTToCodeRequest):
    """Converts Q-AST operation list into text-based code syntax."""
    try:
        req = CircuitRequest(num_qubits=request.num_qubits, num_cbits=request.num_cbits, operations=request.operations)
        circuit = req.to_qast()
        code_str = qast_to_code(circuit)
        return {"status": "success", "code": code_str}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
