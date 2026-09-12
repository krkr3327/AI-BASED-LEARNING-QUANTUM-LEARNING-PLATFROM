# Backend Capabilities Matrix

| Backend ID | Display Name | Max Qubits | Dynamic Circuits | Mid-Circuit Measure | Resets | Conditionals | Parameter Sweeps | VQE / QAOA | QEC | Stabilizer |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `custom_m1` | Custom NumPy M1 Reference Engine | 16 | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| `qiskit_aer` | Qiskit Aer Simulator | 20 | Yes | Yes | Yes | Yes | Yes | Yes | Yes | No |
| `pennylane` | PennyLane default.qubit | 16 | No | No | No | No | Yes | Yes | No | No |
| `cirq` | Cirq Local Simulator | 16 | No | No | No | No | Yes | No | No | No |
| `stabilizer` | Clifford Tableau Stabilizer | 50 | Yes | Yes | Yes | Yes | No | No | No | Yes |
