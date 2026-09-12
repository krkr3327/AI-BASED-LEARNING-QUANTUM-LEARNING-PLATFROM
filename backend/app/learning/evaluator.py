"""
Server-Side Circuit Challenge Evaluator.

Evaluates user-submitted circuits against physical quantum state targets
using the actual SimulationService and quantum execution engine.

NO fake scoring: client-submitted scores are strictly ignored.
NO hardcoded string matching: target behavior is evaluated mathematically.
"""
from typing import Dict, Any, List
from app.qast.nodes import Circuit, GateNode, MeasurementNode, ResetNode, ConditionalNode
from app.services.simulation_service import SimulationService

class CircuitChallengeEvaluator:
    def __init__(self, sim_service: SimulationService = None):
        self.sim_service = sim_service or SimulationService()

    def evaluate(
        self,
        challenge_id: str,
        num_qubits: int,
        operations: List[Dict[str, Any]],
        target_behavior: Dict[str, Any]
    ) -> Dict[str, Any]:
        # Build Q-AST Circuit from submitted operations
        ops = []
        for op in operations:
            op_type = op.get("type", "gate")
            if op_type == "gate":
                ops.append(GateNode(gate=op["gate"], qubits=op["qubits"], parameters=op.get("parameters")))
            elif op_type == "measure":
                ops.append(MeasurementNode(qubits=op["qubits"], cbits=op.get("cbits", op["qubits"])))
            elif op_type == "reset":
                ops.append(ResetNode(qubits=op["qubits"]))
            elif op_type == "conditional":
                inner = op["operation"]
                inner_op = GateNode(gate=inner["gate"], qubits=inner["qubits"], parameters=inner.get("parameters"))
                ops.append(ConditionalNode(cbit=op["cbit"], value=op["value"], operation=inner_op))

        qast_circuit = Circuit(num_qubits=num_qubits, num_cbits=num_qubits, operations=ops)

        # 1. Execute on custom_m1 reference engine
        response = self.sim_service.run_simulation(qast_circuit, backend="custom_m1")
        probs = response.probabilities or {}

        passed = True
        reasons = []
        metrics = {"evaluated_probabilities": probs}

        # 2. Evaluate target behavior bounds
        if "min_prob_0" in target_behavior:
            min_val = target_behavior["min_prob_0"]
            prob_0 = probs.get("0", 0.0)
            if prob_0 < min_val:
                passed = False
                reasons.append(f"P(|0⟩) = {prob_0:.3f} is below target minimum {min_val:.3f}.")

        if "max_prob_0" in target_behavior:
            max_val = target_behavior["max_prob_0"]
            prob_0 = probs.get("0", 0.0)
            if prob_0 > max_val:
                passed = False
                reasons.append(f"P(|0⟩) = {prob_0:.3f} exceeds target maximum {max_val:.3f}.")

        if "min_prob_1" in target_behavior:
            min_val = target_behavior["min_prob_1"]
            prob_1 = probs.get("1", 0.0)
            if prob_1 < min_val:
                passed = False
                reasons.append(f"P(|1⟩) = {prob_1:.3f} is below target minimum {min_val:.3f}.")

        if "max_prob_1" in target_behavior:
            max_val = target_behavior["max_prob_1"]
            prob_1 = probs.get("1", 0.0)
            if prob_1 > max_val:
                passed = False
                reasons.append(f"P(|1⟩) = {prob_1:.3f} exceeds target maximum {max_val:.3f}.")

        if "min_prob_00" in target_behavior:
            min_val = target_behavior["min_prob_00"]
            prob_00 = probs.get("00", 0.0)
            if prob_00 < min_val:
                passed = False
                reasons.append(f"P(|00⟩) = {prob_00:.3f} is below target minimum {min_val:.3f}.")

        if "min_prob_11" in target_behavior:
            min_val = target_behavior["min_prob_11"]
            prob_11 = probs.get("11", 0.0)
            if prob_11 < min_val:
                passed = False
                reasons.append(f"P(|11⟩) = {prob_11:.3f} is below target minimum {min_val:.3f}.")

        score = 1.0 if passed else 0.0
        feedback = "Circuit challenge completed successfully! Target quantum state verified." if passed else " ".join(reasons)

        return {
            "passed": passed,
            "score": score,
            "feedback": feedback,
            "empirical_metrics": metrics
        }
