from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.algorithms.models import AlgorithmRequest, AlgorithmInfo, AlgorithmResponse
from app.algorithms.registry import ALGORITHM_REGISTRY
from app.services.simulation_service import SimulationService
from app.algorithms.implementations.vqe import run_vqe_algorithm
from app.algorithms.implementations.qaoa import run_qaoa_algorithm
from app.algorithms.implementations.qec import run_qec_repetition_code
from app.algorithms.implementations.qft import run_qft_algorithm
from app.algorithms.implementations.shor import run_shor_algorithm

router = APIRouter()

class VQEParams(BaseModel):
    num_qubits: Optional[int] = 2
    hamiltonian: Optional[List[Dict[str, Any]]] = None
    ansatz_type: Optional[str] = "hardware_efficient"
    max_iterations: Optional[int] = 40
    backend: Optional[str] = "custom_m1"

class QAOAParams(BaseModel):
    graph_edges: Optional[List[List[int]]] = None
    num_nodes: Optional[int] = 3
    p_steps: Optional[int] = 1
    max_iterations: Optional[int] = 40
    backend: Optional[str] = "custom_m1"

class QECParams(BaseModel):
    initial_state_bit: Optional[int] = 0
    error_qubit: Optional[str] = "q1"
    backend: Optional[str] = "custom_m1"

class QFTParams(BaseModel):
    num_qubits: Optional[int] = 3
    is_inverse: Optional[bool] = False
    prepare_state: Optional[str] = None
    backend: Optional[str] = "custom_m1"

class ShorParams(BaseModel):
    N: Optional[int] = 15
    a: Optional[int] = 2
    backend: Optional[str] = "custom_m1"


@router.get("/", response_model=List[AlgorithmInfo])
async def list_algorithms():
    """List all available algorithms."""
    return ALGORITHM_REGISTRY.list_all()


@router.post("/vqe/run")
async def run_vqe_endpoint(params: VQEParams):
    try:
        return run_vqe_algorithm(
            num_qubits=params.num_qubits or 2,
            hamiltonian=params.hamiltonian,
            ansatz_type=params.ansatz_type or "hardware_efficient",
            max_iterations=params.max_iterations or 40,
            backend=params.backend or "custom_m1"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/qaoa/run")
async def run_qaoa_endpoint(params: QAOAParams):
    try:
        return run_qaoa_algorithm(
            graph_edges=params.graph_edges,
            num_nodes=params.num_nodes or 3,
            p_steps=params.p_steps or 1,
            max_iterations=params.max_iterations or 40,
            backend=params.backend or "custom_m1"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/qec/run")
async def run_qec_endpoint(params: QECParams):
    try:
        return run_qec_repetition_code(
            initial_state_bit=params.initial_state_bit or 0,
            error_qubit=params.error_qubit,
            backend=params.backend or "custom_m1"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/qft/run")
async def run_qft_endpoint(params: QFTParams):
    try:
        return run_qft_algorithm(
            num_qubits=params.num_qubits or 3,
            is_inverse=params.is_inverse or False,
            prepare_state=params.prepare_state,
            backend=params.backend or "custom_m1"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/shor/run")
async def run_shor_endpoint(params: ShorParams):
    try:
        return run_shor_algorithm(
            N=params.N or 15,
            a=params.a or 2,
            backend=params.backend or "custom_m1"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{algorithm_id}/run")
async def run_algorithm(algorithm_id: str, request: AlgorithmRequest):
    """Run a generic algorithm via registry."""
    try:
        return ALGORITHM_REGISTRY.execute(
            algo_id=algorithm_id,
            parameters=request.parameters,
            backend=request.backend
        )
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

