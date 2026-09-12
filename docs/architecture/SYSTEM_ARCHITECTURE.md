# Quantum Mastery System Architecture & Engineering Baseline

## 1. System Overview

**Quantum Mastery** is a full-stack, execution-backed dynamic quantum education and research platform built on modern Web & Python technology stacks:
- **Backend**: FastAPI (Python 3.11), custom M1 NumPy simulation engine, Qiskit Aer, PennyLane, Cirq, and Pydantic v2 schemas.
- **Frontend**: React 19, Vite 8, React Router v7, Custom Quantum Design System (`QuantumPrimitives.jsx`).
- **Master Flowchart & Complete Architecture**: See [MASTER_FLOWCHART_AND_ARCHITECTURE.md](file:///c:/Users/Shaik%20Mubeena/OneDrive/Desktop/quantum/AI-based-Interactive-Quantum-Algorithim-Learning-Platform/docs/architecture/MASTER_FLOWCHART_AND_ARCHITECTURE.md).

The core architectural invariant is the strict separation between **Quantum Execution** (scientific engines M1/M2/M3) and **Educational/UI Domain Layers**. Educational features, exercises, assessments, and AI context inspectors consume actual simulation data and execution traces without altering or faking backend physics.

---

## 2. Frontend Architecture

The frontend follows a 4-tier layer hierarchy:

$$\text{Pages (Compose Layout \& Services)} \longrightarrow \text{Feature Components} \longrightarrow \text{Domain Visualizers} \longrightarrow \text{UI Primitives}$$

### UI Primitives Layer (`src/components/ui/QuantumPrimitives.jsx`)
Exposes standardized, design-token-constrained primitives:
- `QuantumPage`, `QuantumHeader`, `QuantumPanel`, `QuantumCard`, `QuantumButton`, `QuantumInput`, `QuantumSelect`, `QuantumBadge`, `QuantumTabs`, `QuantumEmptyState`, `QuantumLoadingState`, `QuantumErrorState`, `QuantumMetric`, `QuantumStatusIndicator`.

### Pages (`src/pages/`)
- `Dashboard.jsx`: Command center overview (Curriculum progress, concept mastery, recommendations).
- `Learn.jsx`: 9-Module dynamic structured curriculum & data-driven lesson reader.
- `Challenges.jsx`: Interactive circuit challenge platform evaluating submitted circuits using live backend simulation.
- `Lab.jsx`: Primary visual circuit editor & multi-backend simulation workspace.
- `Algorithms.jsx`: Deutsch-Jozsa, Bernstein-Vazirani, and Grover search workbench.
- `Experiments.jsx`: Parameter sweeps, VQE solver, 3-qubit QEC, and randomized benchmarking.
- `AITutor.jsx`: Prompt context inspector and assistant workspace.

---

## 3. Backend Architecture & Dependency Flow

```
                      FastAPI REST Routes (app/api/routes/)
                                      │
                                      ▼
                        SimulationService (app/services/)
                                      │
                         Q-AST Payload (app/qast/)
                                      │
                         Backend Adapter (app/backends/)
                                      │
                      ┌───────────────┴───────────────┐
                      ▼                               ▼
            Custom M1 Engine (M1/M2/M3)     Qiskit / PennyLane / Cirq
                      │                               │
                      └───────────────┬───────────────┘
                                      ▼
                        QuantumResult & ExecutionTrace
                                      │
                                      ▼
                         Normalizer (app/schemas/)
```

### Clean Dependency Directions:
1. API Routes $\to$ Services $\to$ Q-AST / Domain Models $\to$ Backend Adapters $\to$ Quantum Engine $\to$ Normalizer $\to$ `QuantumResult`.
2. Quantum Engine modules have zero knowledge of HTTP/FastAPI routes or frontend UI concepts.
3. Q-AST remains backend-agnostic.

---

## 4. Q-AST (Quantum Abstract Syntax Tree)

Q-AST (`app/qast/`) represents quantum circuits in a canonical, backend-independent JSON format:
- `num_qubits`: Integer number of quantum registers.
- `num_cbits`: Integer number of classical registers.
- `operations`: List of ordered operations (`gate`, `measure`, `reset`, `conditional`).

Every backend adapter compiles Q-AST into its native execution representation (e.g. NumPy statevector arrays for M1, `qiskit.QuantumCircuit` for Aer, `pennylane.QNode` for PennyLane, `cirq.Circuit` for Cirq).

---

## 5. Quantum Engine (M1 / M2 / M3)

The custom M1 engine (`app/quantum_engine/`) is a headless, exact linear algebra simulator built on NumPy:
- **M1 Core**: Headless matrix multiplication ($U |\psi\rangle$), tensor products ($\otimes$), statevector evolution.
- **M2 Execution**: Dynamic mid-circuit measurement, stochastic state collapse according to Born's rule ($P(x) = |\langle x|\psi\rangle|^2$), conditional gate execution (`IF`), qubit reset.
- **M3 Advanced**: Parameterized gates ($R_x(\theta), R_y(\theta), R_z(\theta)$), Pauli Observables ($X, Y, Z$) and expectation value calculations ($\langle H \rangle = \langle \psi | H | \psi \rangle$).

---

## 6. Backend Adapters

Backend adapters (`app/backends/`) provide an explicit, pluggable backend architecture:
- `custom_m1`: Native NumPy statevector simulator (Full trace capability).
- `qiskit_aer`: Qiskit Aer statevector & shot simulator (Full trace capability).
- `pennylane`: PennyLane default.qubit plugin (Partial trace capability).
- `cirq`: Google Cirq statevector simulator (Full trace capability).

**Invariant**: Backend selection is strictly explicit. Silent backend fallback is forbidden; unsupported operations yield structured capability errors.

---

## 7. Result Normalization & Data Contracts

All simulation outcomes are normalized into a unified `QuantumResult` schema (`app/schemas/quantum.py`):
- `probabilities`: Pre-measurement probability distribution dictionary `{ "00": 0.5, "11": 0.5 }`.
- `statevector`: Pre-measurement complex statevector amplitudes `[{ "real": 0.7071, "imag": 0.0 }, ...]`.
- `measurement`: Actual sampled measurement string `"00"`.
- `execution_trace`: Recorded sequence of `TraceStep` snapshots.

---

## 8. Execution Trace & Visualization Contract

`ExecutionTrace` consists of canonical `TraceStep` objects recorded during backend execution:
- `step_index`: 0-indexed step counter.
- `operation_name`: Gate or operation string (`H`, `CNOT`, `MEASURE`).
- `qubits`: Target qubit indices.
- `statevector_before`: Complex amplitude array before operation.
- `statevector_after`: Complex amplitude array after operation.
- `is_measurement`: Boolean flag indicating stochastic collapse.
- `measurement_result`: Actual sampled bitstring outcome.

**Trace Visualization Contract**:
- `QuantumTracePlayer.jsx` consumes genuine `TraceStep` data.
- Synthetic `TraceStep` objects are forbidden.
- Browser canvas rendering (interpolating between `statevector_before` and `statevector_after`) is explicitly labeled: *"Visual interpolation between gate snapshots — not quantum simulation."*

---

## 9. Experiment Architecture

Experiments (`app/experiments/`) provide multi-run analysis pipelines:
- **Parameter Sweeps**: Evaluates $P(\theta)$ across a discretized parameter interval.
- **VQE Solver**: Variational optimization of ansatz parameters to minimize Hamiltonian expectation value $\langle H \rangle$.
- **QEC Repetition Codes**: 3-qubit bit-flip error encoding, syndrome extraction, and active recovery.
- **Randomized Benchmarking**: Clifford group sequence generation and survival probability measurements.

---

## 10. Learning System Architecture

The educational domain (`app/learning/`) is decoupled from the simulation core:
- **Models**: `Module`, `Lesson`, `Exercise`, `Assessment`, `Attempt`, `MasteryState`.
- **Curriculum**: 9 structured modules (Foundations, Gates, Circuits, Entanglement, Measurement, Algorithms, Parameterized Circuits, Noise, Fault Tolerance).
- **Server-Side Evaluator (`CircuitChallengeEvaluator`)**: Evaluates learner circuits by executing Q-AST on `SimulationService` and verifying physical statevector/probability targets.
- **Mastery Model**: Rule-based scoring ($0.60 \times \text{Assessment Score} + 0.40 \times \text{Exercise Success Rate}$).

---

## 11. AI / RAG Integration Boundary

- **AI Tutor (`AITutor.jsx`)**: Context workspace capturing active Q-AST, simulation result, execution trace, and lesson state.
- **Honest Status**: Exposes `llm_not_configured` status when no remote LLM provider is connected in Phase 6. Fake AI responses are strictly prohibited.

---

## 12. End-to-End Data Flow

```
Learner Action (UI) ──> Q-AST Construction ──> POST /api/simulation/run 
  ──> SimulationService ──> Backend Adapter (e.g. custom_m1) ──> Statevector Evolution 
  ──> TraceStep Recording ──> QuantumResult Normalization ──> REST Response 
  ──> ResultsPanel & QuantumTracePlayer Rendering
```

---

## 13. Scientific Invariants (NON-NEGOTIABLE)

1. $q_0 = \text{MSB}$ (Most Significant Bit indexing).
2. `QuantumResult.probabilities` = pre-measurement quantum distribution.
3. `QuantumResult.statevector` = pre-measurement statevector.
4. `QuantumResult.measurement` = actual sampled measurement outcome.
5. Dynamic measurement physically collapses simulated state.
6. Backend selection is explicit (No silent fallback).
7. Unsupported operations return structured errors.
8. Frontend never independently simulates quantum mechanics.
9. Trace visualization derives purely from backend `ExecutionTrace`.
10. Synthetic `TraceStep` objects are forbidden.

---

## 14. Known Limitations & Phase 7 Scope

- **Autonomous LLM Integration**: Scheduled for Phase 7 (Phase 6 provides data context contracts and inspector UI).
- **Physical Quantum Hardware**: Simulation backends (`custom_m1`, `qiskit_aer`, `pennylane`, `cirq`) are authoritative; cloud hardware dispatch is out of scope for Phase 6.
