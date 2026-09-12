from typing import Dict, List, Any
import copy
from app.qast.nodes import Circuit, GateNode

def bind_parameters(circuit: Circuit, param_values: Dict[str, float]) -> Circuit:
    """
    Returns a copy of the circuit with symbolic parameter references replaced by float values.
    """
    new_circuit = copy.deepcopy(circuit)
    for op in new_circuit.operations:
        if isinstance(op, GateNode) and op.parameters:
            for k, v in op.parameters.items():
                if isinstance(v, str) and v in param_values:
                    op.parameters[k] = float(param_values[v])
                elif isinstance(v, (int, float)):
                    op.parameters[k] = float(v)
    return new_circuit

def generate_parameter_sweep(param_name: str, start: float, stop: float, steps: int) -> List[float]:
    if steps <= 1:
        return [float(start)]
    step_size = (stop - start) / (steps - 1)
    return [float(start + i * step_size) for i in range(steps)]
