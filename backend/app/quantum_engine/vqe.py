import numpy as np
from scipy.optimize import minimize
from typing import Dict, List, Any, Callable
from app.qast.nodes import Circuit, GateNode
from app.qast.adapters.custom_engine import CustomEngineAdapter
from app.quantum_engine.parameterized import bind_parameters
from app.quantum_engine.observables import calculate_expectation_value

class VQESolver:
    def __init__(self, adapter=None):
        self.adapter = adapter or CustomEngineAdapter()

    def solve(
        self,
        circuit_template: Circuit,
        hamiltonian_terms: List[Dict[str, Any]], # e.g. [{"pauli": "ZZ", "coeff": 1.0}, {"pauli": "XX", "coeff": 0.5}]
        param_names: List[str],
        initial_params: List[float],
        maxiter: int = 100
    ) -> Dict[str, Any]:
        
        history = []

        def objective(params_array):
            param_dict = {name: float(val) for name, val in zip(param_names, params_array)}
            bound_circuit = bind_parameters(circuit_template, param_dict)
            
            result = self.adapter.execute(bound_circuit)
            sv = result["statevector"]
            
            energy = 0.0
            for term in hamiltonian_terms:
                pauli = term["pauli"]
                coeff = term["coeff"]
                exp_val = calculate_expectation_value(sv, pauli)
                energy += coeff * exp_val

            history.append({
                "params": param_dict,
                "energy": float(energy)
            })
            return energy

        res = minimize(objective, initial_params, method="COBYLA", options={"maxiter": maxiter})
        
        opt_params = {name: float(val) for name, val in zip(param_names, res.x)}
        
        return {
            "status": "success" if res.success else "completed",
            "optimized_parameters": opt_params,
            "initial_energy": float(history[0]["energy"]) if history else 0.0,
            "final_energy": float(res.fun),
            "iterations": len(history),
            "optimization_history": history,
            "converged": bool(res.success)
        }
