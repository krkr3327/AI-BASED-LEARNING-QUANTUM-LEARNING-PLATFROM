# Official Quantum Knowledge Base — Curated Online Sources

## IBM Qiskit & IBM Quantum Learning
- **Source**: IBM Qiskit Documentation & IBM Quantum Learning
- **Provider**: IBM (https://docs.quantum.ibm.com/)
- **Core Concepts**: Qiskit is an open-source SDK for working with quantum computers at the level of circuits, pulses, and algorithms. In Qiskit, quantum circuits are constructed using `QuantumCircuit(n_qubits, n_cbits)`.
- **Measurement & Statevector**: Qiskit Aer simulator (`qiskit_aer.AerSimulator`) simulates statevectors, unitary operations, and noisy channels. Measurements in Qiskit collapse the quantum statevector according to Born's rule ($P(x) = |\langle x | \psi \rangle|^2$).

## Google Cirq
- **Source**: Google Cirq Documentation
- **Provider**: Google Quantum AI (https://quantumai.google/cirq)
- **Core Concepts**: Cirq is a Python software library for writing, manipulating, and optimizing quantum circuits, and then running them against quantum computers and quantum simulators. Cirq uses `cirq.LineQubit.range(n)` for linear qubit arrays.
- **Simulation**: Cirq's `cirq.Simulator()` simulates quantum state vectors. Moments group gates that execute synchronously.

## PennyLane
- **Source**: PennyLane Documentation
- **Provider**: Xanadu (https://docs.pennylane.ai/)
- **Core Concepts**: PennyLane is a cross-platform Python library for quantum computing, quantum machine learning, and quantum chemistry. Its core object is the `QNode`, which binds a quantum circuit function to a specific quantum device (`default.qubit`).
- **Variational Algorithms**: PennyLane supports automatic differentiation of quantum circuits via parameter-shift rules and backpropagation.

## Microsoft Azure Quantum
- **Source**: Microsoft Azure Quantum Documentation
- **Provider**: Microsoft (https://learn.microsoft.com/en-us/azure/quantum/)
- **Core Concepts**: Azure Quantum provides cloud access to diverse quantum hardware providers including IonQ, Quantinuum, and Rigetti via Q# and Qiskit adapters.

## qBraid Platform
- **Source**: qBraid Platform Documentation
- **Provider**: qBraid (https://docs.qbraid.com/)
- **Core Concepts**: qBraid is a cloud-based developer platform for quantum computing that provides unified access to multiple quantum backends, SDK transpilation, and hardware submission pipelines.
