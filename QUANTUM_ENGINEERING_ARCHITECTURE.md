# Quantum Engineering Architecture

## Architectural Principles
The Quantum Learning Platform adheres strictly to the single direction of data provenance:
```
USER / FRONTEND
      ↓
Circuit / Algorithm / Experiment Definition
      ↓
API Endpoints (/api/simulation/*, /api/backends/*, /api/algorithms/*)
      ↓
Q-AST / Experiment Definition (M2)
      ↓
Simulation Service
      ↓
Explicit Backend Adapter (QuantumBackend)
      ↓
Actual Quantum Engine Execution (M1, Aer, PennyLane, Cirq, Stabilizer)
      ↓
Result Normalizer (M3)
      ↓
QuantumResult / ExperimentResult
      ↓
Frontend HUD & Data-Driven Visualizations
```

## Engines & Adapters
1. **Custom M1 Reference Engine (`custom_m1`)**: Authoritative dense NumPy statevector engine. Supports full gate operations, parameters, exact probabilities, and dynamic circuits (mid-circuit measurement, resets, classical conditionals).
2. **Qiskit Aer Simulator (`qiskit_aer`)**: Qiskit 2.5.2 & Aer 0.17.2 adapter. Captures pre-measurement statevectors for exact probability distributions while executing shot memory.
3. **PennyLane (`pennylane`)**: Uses `default.qubit` device. Computes exact statevectors via QNodes and samples shots.
4. **Cirq (`cirq`)**: Uses `cirq.Simulator`. Pins all $n$ qubits in Big-Endian order.
5. **Tableau Stabilizer Engine (`stabilizer`)**: Clifford-only tableau simulator scaling up to 50+ qubits for Clifford operations ($X, Y, Z, H, S, CNOT, CZ, SWAP$).

## Experiments & Solvers
- **Parameter Sweeps**: Evaluates parameterized gates ($RX, RY, RZ, CPHASE$) over parameter grids.
- **VQE Solver**: Variational Quantum Eigensolver optimizing ansatz parameters to minimize Pauli expectation values using SciPy optimizers.
- **QEC Repetition Codes**: 3-qubit bit-flip and phase-flip error correction codes with ancilla syndrome measurement and conditional recovery.
- **Randomized Benchmarking**: Random Clifford sequence synthesis, inverse Clifford appending, and ground-state survival probability calculation.
