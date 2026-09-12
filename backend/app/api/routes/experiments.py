from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

from app.qast.nodes import Circuit
from app.quantum_engine.parameterized import generate_parameter_sweep, bind_parameters
from app.quantum_engine.vqe import VQESolver
from app.quantum_engine.qec import QECRunner
from app.quantum_engine.rb import RBRunner
from app.services.simulation_service import SimulationService

router = APIRouter()
sim_service = SimulationService()

class ParameterSweepRequest(BaseModel):
    circuit: Circuit
    param_name: str
    start: float
    stop: float
    steps: int
    backend: Optional[str] = "custom_m1"

class VQERequest(BaseModel):
    circuit_template: Circuit
    hamiltonian: List[Dict[str, Any]]
    param_names: List[str]
    initial_params: List[float]
    maxiter: Optional[int] = 50
    backend: Optional[str] = "custom_m1"

class QECRequest(BaseModel):
    initial_state_bit: int = 0
    error_qubit: Optional[int] = None

class RBRequest(BaseModel):
    sequence_lengths: List[int] = [2, 4, 8, 16]
    num_sequences: Optional[int] = 5
    shots: Optional[int] = 100
    seed: Optional[int] = 42

@router.post("/sweep")
def run_parameter_sweep(req: ParameterSweepRequest):
    try:
        values = generate_parameter_sweep(req.param_name, req.start, req.stop, req.steps)
        sweep_results = []
        for val in values:
            bound_circuit = bind_parameters(req.circuit, {req.param_name: val})
            res = sim_service.run_simulation(bound_circuit, backend=req.backend)
            sweep_results.append({
                "param_value": val,
                "probabilities": res.probabilities,
                "measurement": res.measurement
            })
        return {
            "status": "success",
            "param_name": req.param_name,
            "sweep_results": sweep_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/vqe")
def run_vqe(req: VQERequest):
    try:
        solver = VQESolver(adapter=sim_service.adapters.get(req.backend))
        res = solver.solve(
            circuit_template=req.circuit_template,
            hamiltonian_terms=req.hamiltonian,
            param_names=req.param_names,
            initial_params=req.initial_params,
            maxiter=req.maxiter
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/qec")
def run_qec(req: QECRequest):
    try:
        runner = QECRunner()
        return runner.run_repetition_code(
            initial_state_bit=req.initial_state_bit,
            error_qubit=req.error_qubit
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/benchmark")
def run_benchmark(req: RBRequest):
    try:
        runner = RBRunner()
        return runner.run_benchmark(
            sequence_lengths=req.sequence_lengths,
            num_sequences=req.num_sequences,
            shots=req.shots,
            seed=req.seed
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
