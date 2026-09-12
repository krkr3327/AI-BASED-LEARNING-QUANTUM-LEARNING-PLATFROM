# Quantum Mastery Architecture — Dynamic Quantum Learning & Companion Engine

## 1. Executive Summary & Overview

**Quantum Mastery** dynamically takes a learner from their chosen destination—career, research, or academics—to personalized challenges, identifies what they don't know, teaches only what they need, lets them experiment in a Quantum Lab, and continuously adapts their roadmap while a persistent voice-enabled AI robot guides them throughout the entire journey.

### Dynamic Pedagogical Paradigm: Backward Learning Loop
$$\text{GOAL} \longrightarrow \text{DYNAMIC ROADMAP} \longrightarrow \text{CHALLENGE FIRST} \longrightarrow \text{FAIL} \longrightarrow \text{DIAGNOSTIC AI} \longrightarrow \text{TARGETED LEARNING} \longrightarrow \text{QUANTUM LAB} \longrightarrow \text{RE-ATTEMPT} \longrightarrow \text{MASTERY}$$

Crucially, the educational domain layer is strictly decoupled from the core quantum simulation engines (M1/M2/M3). Quantum execution semantics, statevectors, and trace formats remain untouched and scientifically authoritative.

---

## 2. Two-Layer Primary Product Architecture

```text
                         QUANTUMLEARNING
                               │
                ┌──────────────┴──────────────┐
                │                             │
          LEARNING LAYER              DESIGN & SIMULATION
                │                             │
       ┌────────┴────────┐          ┌─────────┴─────────┐
       │                 │          │                   │
 Curriculum &       Assessment   Circuit Designer   Simulation &
 Learning Content   & Progress                       Visualization
       │                 │          │                   │
       │                 │          ├── Drag & Drop     ├── Backends
       │                 │          ├── Code Editor     ├── Results
       │                 │          ├── Syntax          ├── Bloch
       │                 │          └── Multi-Qubit     ├── Statevector
       │                 │                             ├── Histogram
       │                 │                             └── Circuit
       └────────┬────────┘
                │
                └──────────────┬──────────────────────┘
                               ↓
                         AI + RAG SUPPORT
```

### Key Product Integration Loops:

#### 1. Learn ↔ Design Integration Flow
```text
                 LEARNING
                    │
              Interactive Example
                    │
                    ▼
              OPEN IN LAB
                    │
                    ▼
            DESIGN & SIMULATE
                    │
                    ▼
               QUANTUM RESULT
                    │
                    ▼
              VISUALIZE / UNDERSTAND
                    │
                    ▼
                 LEARNING
```

#### 2. Cross-Cutting Contextual AI Architecture
```text
                 LEARNING
                    │
                    ├────────────┐
                    │            │
                    ▼            ▼
               Learning      Learner
                Context       Data
                    │            │
                    └─────┬──────┘
                          │
DESIGN ── Circuit ── Result ── Trace
                          │
                          ▼
                    Quantum Context
                          │
                          ▼
                         RAG
                          │
                          ▼
                         LLM
                          │
                          ▼
                    AI ASSISTANCE
```

### Key Principles:
1. **Independent Learning Domain Layer**: Educational models (`Module`, `Lesson`, `Exercise`, `Attempt`, `MasteryState`) do not mutate M1/M2/M3 execution objects.
2. **Server-Side Scoring Integrity**: Client payloads never submit self-calculated scores. All exercise evaluation, circuit challenge verification, and quiz scoring occur strictly on the backend.
3. **Genuine Simulation Verification**: Circuit exercises are evaluated by compiling the learner's submitted Q-AST and executing it on the simulation backend (`SimulationService`), comparing physical target probabilities against statevector results.
4. **No Synthetic Telemetry**: Progress metrics, mastery evidence, and attempt counts reflect only genuine persisted learner activity.

---

## 3. Core Domain Models

The educational models reside in `backend/app/learning/models.py`:

- **`Concept`**: Fundamental unit of quantum knowledge (e.g. `superposition`, `hadamard`, `entanglement`).
- **`Module`**: Curriculum container grouping logically linked lessons.
- **`Lesson`**: Pedagogical unit containing objectives, concept explanation, intuition, mathematics, circuit preset, practice exercises, and assessment quiz.
- **`Exercise`**: Interactive question (`multiple_choice`, `numeric`, `text`, or `circuit_challenge`).
- **`Assessment`**: End-of-lesson evaluation quiz with specified passing score threshold.
- **`Attempt`**: Recorded learner answer submission with timestamp and evaluation score.
- **`ProgressState`**: Persisted module/lesson completion status.
- **`MasteryState`**: Concept-level evidence breakdown (`NOT_STARTED` ○, `IN_PROGRESS` ◐, `COMPLETED` ●, `MASTERED` ◆).

---

## 4. Structured Curriculum Model (9 Modules)

The curriculum (`backend/app/learning/curriculum.py`) defines 9 structured modules:

1. **MODULE 1 — Quantum Foundations**: Bits vs Qubits, Statevector Representation, Superposition, Basis Measurement.
2. **MODULE 2 — Single-Qubit Quantum Gates**: Pauli X/Y/Z, Hadamard, Phase S & T, Parametric Rotations ($R_x, R_y, R_z$).
3. **MODULE 3 — Quantum Circuits & Multi-Qubit Systems**: Tensor products, CNOT, CZ, SWAP, Controlled Operations.
4. **MODULE 4 — Entanglement & Quantum Interference**: Bell states ($|\Phi^+\rangle$), GHZ states, Phase cancellation.
5. **MODULE 5 — Dynamic Circuits & Mid-Circuit Measurement**: State collapse, Measurement, Reset, Conditional operations (`IF`).
6. **MODULE 6 — Quantum Algorithms**: Bernstein-Vazirani, Deutsch-Jozsa, Grover's Search, QFT foundations.
7. **MODULE 7 — Parameterized & Hybrid Algorithms**: VQE, Parameter Sweeps, Observables, Expectation Values $\langle H \rangle$.
8. **MODULE 8 — Noise & Quantum Reliability**: Bit-flip, Phase-flip, Depolarizing noise, Error Mitigation, Quantum Error Correction ($[[3,1,1]]$ code).
9. **MODULE 9 — Advanced Quantum Architecture**: Stabilizers, Randomized Benchmarking, Surface Code Foundations, Logical Qubits.

---

## 5. Pedagogical Lesson Flow

Every lesson exposes a consistent 9-step structure:

$$\text{CONCEPT} \to \text{INTUITION} \to \text{MATHEMATICS} \to \text{CIRCUIT} \to \text{SIMULATION} \to \text{PROCESS} \to \text{PRACTICE} \to \text{ASSESS} \to \text{MASTERY}$$

- **Objectives**: Measurable goals (e.g. "Predict $H|0\rangle$ state probabilities").
- **Mathematics**: Explicit matrix definitions ($H = \frac{1}{\sqrt{2}} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$) and Dirac notation.
- **Circuit Integration**: Pre-loaded Q-AST preset executable in Quantum Lab.
- **Action Launchers**:
  - `TRY IN LAB`: Opens `/lab` with pre-populated gate layout.
  - `WATCH PROCESS`: Launches statevector trace evolution in Process Viewer.

---

## 6. Server-Side Circuit Challenge Evaluation

The evaluator (`backend/app/learning/evaluator.py`) verifies user-submitted circuits without relying on textual gate matching:

1. Learner constructs circuit Q-AST in `CircuitChallengePanel.jsx`.
2. Frontend sends payload to `POST /api/learning/challenges/{exercise_id}/submit`.
3. `CircuitChallengeEvaluator` executes the Q-AST using backend `SimulationService`.
4. Evaluator extracts actual `QuantumResult.probabilities` and `statevector`.
5. Physical criteria are checked:
   - Target probability check: $P(|1\rangle) \ge \text{threshold}$.
   - Entanglement check: $P(|00\rangle) + P(|11\rangle) \ge 0.99$.
6. Structured evaluation response (`is_correct`, `explanation`, `details`) returned.

---

## 7. Rule-Based Mastery & Recommendation Engine

### Mastery Scoring Model:
$$\text{Mastery Score} = 0.60 \times (\text{Assessment Score}) + 0.40 \times (\text{Exercise Success Rate})$$

- **`MASTERED` (◆)**: Score $\ge 85\%$ and $\ge 2$ exercise attempts.
- **`COMPLETED` (●)**: Lesson completed and Assessment Passed ($\ge 70\%$).
- **`IN_PROGRESS` (◐)**: Exercises or lesson started.
- **`NOT_STARTED` (○)**: No activity recorded.

### Recommendation Rules:
1. **Rule 1**: If prerequisite modules/lessons incomplete $\implies$ Recommend prerequisite.
2. **Rule 2**: If lesson completed but exercise accuracy $< 70\%$ $\implies$ Recommend exercise practice.
3. **Rule 3**: If assessment score $< 70\%$ $\implies$ Recommend retaking lesson assessment.
4. **Rule 4**: If concept mastered $\implies$ Recommend next logical concept in curriculum path.

---

## 8. REST API Contracts

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/learning/curriculum` | Returns 9-module curriculum hierarchy |
| `GET` | `/api/learning/modules/{id}` | Returns specific module structure |
| `GET` | `/api/learning/lessons/{id}` | Returns detailed lesson content |
| `POST` | `/api/learning/exercises/{id}/submit` | Server-evaluated exercise answer |
| `POST` | `/api/learning/challenges/{id}/submit` | Server-evaluated circuit challenge |
| `POST` | `/api/learning/assessments/{id}/submit` | Server-scored lesson assessment |
| `GET` | `/api/learning/progress` | Learner module/lesson progress state |
| `GET` | `/api/learning/mastery` | Learner concept mastery breakdown |
| `GET` | `/api/learning/recommendations` | Rule-based next learning action |

---

## 9. Persistence Architecture

- **File-backed Persistence**: `backend/app/learning/store_data.json`.
- **Store Abstraction**: `LearningStore` handles atomic JSON read/writes for learner progress, exercise attempts, assessment results, and mastery snapshots.
- **Development Learner Identity**: `dev_user_01` development identity abstraction for Phase 6.

---

## 10. Phase 6 Non-Goals (Explicit Exclusions)

Phase 6 deliberately omits:
- Autonomous LLM tutor execution (reserved for Phase 7).
- Machine learning / reinforcement learning adaptive engines.
- Production authentication / OAuth.
- Social gamification / fake streak tracking.
- Physical quantum hardware job dispatch.
