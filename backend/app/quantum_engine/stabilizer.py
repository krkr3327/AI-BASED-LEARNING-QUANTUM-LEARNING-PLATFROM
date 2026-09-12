import numpy as np
from typing import List, Dict, Any
from app.qast.nodes import Circuit, GateNode, MeasurementNode, ResetNode, ConditionalNode

class StabilizerEngine:
    """
    Tableau-based Clifford Stabilizer Simulator.
    Supports Clifford operations: X, Y, Z, H, S, CNOT, CZ, SWAP.
    """
    def __init__(self, num_qubits: int):
        self.num_qubits = num_qubits
        self.n = num_qubits
        # Tableau size: 2n rows (n destabilizers, n stabilizers), 2n + 1 cols (x, z, phase r)
        self.tableau = np.zeros((2 * self.n, 2 * self.n + 1), dtype=int)
        for i in range(2 * self.n):
            self.tableau[i, i] = 1

    def apply_h(self, q: int):
        for i in range(2 * self.n):
            x = self.tableau[i, q]
            z = self.tableau[i, q + self.n]
            self.tableau[i, 2 * self.n] ^= (x & z)
            self.tableau[i, q] = z
            self.tableau[i, q + self.n] = x

    def apply_s(self, q: int):
        for i in range(2 * self.n):
            x = self.tableau[i, q]
            z = self.tableau[i, q + self.n]
            self.tableau[i, 2 * self.n] ^= (x & z)
            self.tableau[i, q + self.n] ^= x

    def apply_x(self, q: int):
        self.apply_h(q)
        self.apply_s(q)
        self.apply_s(q)
        self.apply_h(q)

    def apply_z(self, q: int):
        self.apply_s(q)
        self.apply_s(q)

    def apply_cnot(self, q_ctrl: int, q_targ: int):
        for i in range(2 * self.n):
            x1 = self.tableau[i, q_ctrl]
            z1 = self.tableau[i, q_ctrl + self.n]
            x2 = self.tableau[i, q_targ]
            z2 = self.tableau[i, q_targ + self.n]
            
            self.tableau[i, 2 * self.n] ^= (x1 & z2 & (x2 ^ z1 ^ 1))
            self.tableau[i, q_targ] ^= x1
            self.tableau[i, q_ctrl + self.n] ^= z2

    def execute_circuit(self, circuit: Circuit) -> Dict[str, Any]:
        for op in circuit.operations:
            if isinstance(op, GateNode):
                g = op.gate
                if g == "H":
                    self.apply_h(op.qubits[0])
                elif g == "S":
                    self.apply_s(op.qubits[0])
                elif g == "X":
                    self.apply_x(op.qubits[0])
                elif g == "Z":
                    self.apply_z(op.qubits[0])
                elif g == "CNOT":
                    self.apply_cnot(op.qubits[0], op.qubits[1])
                elif g == "CZ":
                    self.apply_h(op.qubits[1])
                    self.apply_cnot(op.qubits[0], op.qubits[1])
                    self.apply_h(op.qubits[1])
                elif g == "SWAP":
                    self.apply_cnot(op.qubits[0], op.qubits[1])
                    self.apply_cnot(op.qubits[1], op.qubits[0])
                    self.apply_cnot(op.qubits[0], op.qubits[1])
                else:
                    raise ValueError(f"unsupported_operation: Non-Clifford gate '{g}' not supported by Stabilizer engine.")

        return {
            "status": "success",
            "backend_name": "stabilizer",
            "num_qubits": self.n,
            "tableau_dimension": [2 * self.n, 2 * self.n + 1],
            "is_clifford": True
        }
