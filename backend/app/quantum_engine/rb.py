import random
import numpy as np
from typing import List, Dict, Any
from app.qast.nodes import Circuit, GateNode, MeasurementNode
from app.qast.adapters.custom_engine import CustomEngineAdapter

CLIFFORD_GATES_1Q = ["I", "X", "Y", "Z", "H", "S"]

def generate_random_clifford_sequence(length: int, seed: int = None) -> List[str]:
    if seed is not None:
        random.seed(seed)
    return [random.choice(CLIFFORD_GATES_1Q) for _ in range(length)]

def get_inverse_clifford_sequence(seq: List[str]) -> List[str]:
    """
    Computes the inverse sequence of 1-qubit Clifford gates.
    For single-qubit Cliffords {I, X, Y, Z, H, S}:
    - I^† = I, X^† = X, Y^† = Y, Z^† = Z, H^† = H
    - S^† = Z S
    The inverse of sequence G_1 G_2 ... G_k is G_k^† ... G_2^† G_1^†.
    """
    inv = []
    for g in reversed(seq):
        if g == "S":
            inv.extend(["Z", "S"])
        elif g != "I":
            inv.append(g)
    return inv

class RBRunner:
    def __init__(self, adapter=None):
        self.adapter = adapter or CustomEngineAdapter()

    def run_benchmark(
        self,
        sequence_lengths: List[int],
        num_sequences: int = 5,
        shots: int = 100,
        seed: int = 42
    ) -> Dict[str, Any]:
        random.seed(seed)
        results = []

        for seq_len in sequence_lengths:
            survival_count = 0
            for _ in range(num_sequences):
                # 1 qubit RB sequence + inverse sequence
                seq = [random.choice(CLIFFORD_GATES_1Q) for _ in range(seq_len)]
                inv_seq = get_inverse_clifford_sequence(seq)

                ops = []
                for g in seq + inv_seq:
                    if g != "I":
                        ops.append(GateNode(gate=g, qubits=[0]))

                # Append measurement
                ops.append(MeasurementNode(qubits=[0], cbits=[0]))
                circuit = Circuit(num_qubits=1, num_cbits=1, operations=ops)

                res = self.adapter.execute(circuit)
                # Check ground state survival (|0>)
                prob_0 = res["probabilities"].get("0", 0.0)
                if random.random() < prob_0 or prob_0 >= 0.999:
                    survival_count += 1

            survival_prob = survival_count / num_sequences
            results.append({
                "sequence_length": seq_len,
                "survival_probability": float(survival_prob)
            })

        return {
            "status": "success",
            "sequence_lengths": sequence_lengths,
            "survival_probabilities": [r["survival_probability"] for r in results],
            "num_sequences": num_sequences,
            "shots": shots,
            "seed": seed,
            "results": results
        }
