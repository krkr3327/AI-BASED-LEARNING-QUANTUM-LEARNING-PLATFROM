"""
Mock AI Provider — Fully functional offline quantum AI tutor.
Delivers educationally accurate answers with ASCII circuit diagrams and curated follow-up questions.
"""
from app.ai.llm.base import LLMProviderInterface


class MockAIProvider(LLMProviderInterface):

    def is_configured(self) -> bool:
        return True

    @property
    def provider_name(self) -> str:
        return "mock_provider"

    def generate_response(self, prompt: str) -> str:
        p = prompt.lower()

        # ── Greetings ──────────────────────────────────────────────────────
        if any(w in p for w in ["hello", "hi ", "hey", "how are you", "who are you", "help"]):
            return (
                "Hello! I am your **Quantum AI Tutor** 🔬\n\n"
                "I am here to guide you through quantum computing, from single-qubit fundamentals to advanced algorithms like Grover and Shor.\n\n"
                "```diagram\n"
                "    ┌─────────────┐       ┌─────────────────┐       ┌──────────────────┐\n"
                "    │   Qubits    │ ───►  │  Quantum Gates  │ ───►  │   Algorithms     │\n"
                "    │ (|0⟩, |1⟩)  │       │ (H, X, CNOT...) │       │ (Grover, VQE...) │\n"
                "    └─────────────┘       └─────────────────┘       └──────────────────┘\n"
                "```\n\n"
                "What concept would you like to explore today?\n\n"
                "### 💡 Related Questions:\n"
                "1. What is a qubit and how does it differ from a classical bit?\n"
                "2. What is quantum superposition and how does the H gate create it?\n"
                "3. How do quantum algorithms achieve exponential speedups?"
            )

        # ── Qubit ──────────────────────────────────────────────────────────
        if any(w in p for w in ["what is a qubit", "qubit", "qubits"]):
            return (
                "A **qubit** (quantum bit) is the fundamental unit of quantum information.\n\n"
                "**Core Principles:**\n"
                "- Unlike a classical bit (which must be strictly `0` or `1`), a qubit exists in a linear superposition: `|ψ⟩ = α|0⟩ + β|1⟩`\n"
                "- `α` and `β` are complex probability amplitudes satisfying the normalization condition: `|α|² + |β|² = 1`\n"
                "- Measurement collapses the state to `0` with probability `|α|²`, or `1` with probability `|β|²`.\n\n"
                "```diagram\n"
                "      Classical Bit                Quantum Qubit (Bloch Sphere)\n"
                "         [ 0 ]                               |0⟩ (North Pole)\n"
                "           │                                    ▲\n"
                "           ▼                                    │   ↗ |ψ⟩ = α|0⟩ + β|1⟩\n"
                "         [ 1 ]                       ◄──────────┼──────────►\n"
                "                                                │\n"
                "                                                ▼\n"
                "                                             |1⟩ (South Pole)\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. How does the Bloch sphere represent a qubit geometrically?\n"
                "2. What is quantum superposition and how does the H gate create it?\n"
                "3. Why does measuring a qubit destroy its superposition?"
            )

        # ── Superposition ──────────────────────────────────────────────────
        if any(w in p for w in ["superposition", "super position"]):
            return (
                "**Superposition** is the ability of a quantum system to exist simultaneously in a combination of multiple states.\n\n"
                "**Mathematical Formulation:**\n"
                "- For a single qubit: `|ψ⟩ = α|0⟩ + β|1⟩`\n"
                "- When `α = 1/√2` and `β = 1/√2`, measuring the qubit gives `0` (50% probability) and `1` (50% probability).\n"
                "- This is fundamentally different from classical randomness: amplitudes can interfere constructively or destructively.\n\n"
                "```diagram\n"
                "               Hadamard Gate (H)\n"
                "    |0⟩ ────────────────[ H ]────────────────► |+⟩ = (|0⟩ + |1⟩)/√2\n"
                "\n"
                "    Probability:  |0⟩ (50%) ▓▓▓▓▓▓▓▓\n"
                "                  |1⟩ (50%) ▓▓▓▓▓▓▓▓\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. What happens if you apply two Hadamard gates in a row (H²)?\n"
                "2. What is quantum interference and how does phase kickback work?\n"
                "3. How does superposition enable quantum parallelism across 2ⁿ states?"
            )

        # ── Hadamard Gate ──────────────────────────────────────────────────
        if any(w in p for w in ["hadamard", "h gate", "h-gate", "h_gate"]):
            return (
                "The **Hadamard Gate (H)** is the most essential single-qubit quantum gate, creating equal superposition from computational basis states.\n\n"
                "**Gate Operations & Matrix:**\n"
                "- `H|0⟩ = (|0⟩ + |1⟩)/√2 = |+⟩`\n"
                "- `H|1⟩ = (|0⟩ - |1⟩)/√2 = |-⟩`\n"
                "- **Self-Inverse Property:** `H · H = I` (applying H twice returns the original state).\n\n"
                "```diagram\n"
                "    H = (1/√2) [ 1   1 ]         Circuit Transformation:\n"
                "               [ 1  -1 ]         q[0]: ──|0⟩──[ H ]──► 1/√2(|0⟩ + |1⟩)\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. Why is H · H equal to the Identity matrix (H² = I)?\n"
                "2. How does the H gate rotate the state vector on the Bloch sphere?\n"
                "3. How is the H gate used to build entangled Bell states?"
            )

        # ── Pauli Gates (X, Y, Z) ──────────────────────────────────────────
        if any(w in p for w in ["pauli", "x gate", "y gate", "z gate", "bit flip", "phase flip"]):
            return (
                "The **Pauli Gates (X, Y, Z)** represent the fundamental single-qubit rotations of π radians (180°) about the respective axes of the Bloch sphere.\n\n"
                "**The Three Pauli Operators:**\n"
                "- **Pauli-X (Bit-Flip / NOT):** `X|0⟩ = |1⟩`, `X|1⟩ = |0⟩`\n"
                "- **Pauli-Z (Phase-Flip):** `Z|0⟩ = |0⟩`, `Z|1⟩ = -|1⟩`\n"
                "- **Pauli-Y (Bit & Phase Flip):** `Y|0⟩ = i|1⟩`, `Y|1⟩ = -i|0⟩`\n\n"
                "```diagram\n"
                "    X Gate (Bit-Flip):       Z Gate (Phase-Flip):     Y Gate (Bit+Phase):\n"
                "    q: ──|0⟩──[ X ]──► |1⟩   q: ──|+⟩──[ Z ]──► |-⟩   q: ──|0⟩──[ Y ]──► i|1⟩\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. What is the difference between an X gate (bit flip) and a Z gate (phase flip)?\n"
                "2. What are the S and T phase gates and how do they relate to Z?\n"
                "3. How do Pauli matrices form a basis for 2x2 Hermitian operators?"
            )

        # ── CNOT & Two-Qubit Gates ─────────────────────────────────────────
        if any(w in p for w in ["cnot", "cx", "controlled not", "cz gate", "swap gate", "two qubit"]):
            return (
                "The **Controlled-NOT (CNOT / CX) Gate** is the standard two-qubit entangling gate.\n\n"
                "**How CNOT Operates:**\n"
                "- **Control Qubit (`q0`):** Remains unchanged.\n"
                "- **Target Qubit (`q1`):** Inverted (X applied) if and only if the control qubit is `|1⟩`.\n"
                "- Maps: `|00⟩ → |00⟩`, `|01⟩ → |01⟩`, `|10⟩ → |11⟩`, `|11⟩ → |10⟩`.\n\n"
                "```diagram\n"
                "    q[0] (Control): ───●───       Truth Table:\n"
                "                       │          |00⟩ → |00⟩\n"
                "    q[1] (Target):  ───⊕───       |01⟩ → |01⟩\n"
                "                                  |10⟩ → |11⟩  (Flipped!)\n"
                "                                  |11⟩ → |10⟩  (Flipped!)\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. How does combining H and CNOT create maximally entangled Bell states?\n"
                "2. What is phase kickback when target qubit is in the |-⟩ state?\n"
                "3. How do you construct a SWAP gate using three CNOT gates?"
            )

        # ── Entanglement & Bell States ─────────────────────────────────────
        if any(w in p for w in ["entanglement", "entangled", "bell state", "bell", "epr"]):
            return (
                "**Quantum Entanglement** is a state where the quantum properties of two or more qubits are inextricably linked, such that measuring one instantly determines the state of the other.\n\n"
                "**The Four Maximally Entangled Bell States:**\n"
                "- `|Φ⁺⟩ = (|00⟩ + |11⟩) / √2`\n"
                "- `|Φ⁻⟩ = (|00⟩ - |11⟩) / √2`\n"
                "- `|Ψ⁺⟩ = (|01⟩ + |10⟩) / √2`\n"
                "- `|Ψ⁻⟩ = (|01⟩ - |10⟩) / √2`\n\n"
                "```diagram\n"
                "               Bell State Generator Circuit (|Φ⁺⟩)\n"
                "    q[0]: ──|0⟩──[ H ]──●──►  (|00⟩ + |11⟩) / √2\n"
                "                        │\n"
                "    q[1]: ──|0⟩─────────⊕──►\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. Why cannot entangled states be factored into independent product states?\n"
                "2. How does Quantum Teleportation use Bell states to transmit qubits?\n"
                "3. What is Bell's Theorem and how does it prove quantum non-locality?"
            )

        # ── Quantum Teleportation ──────────────────────────────────────────
        if any(w in p for w in ["teleportation", "teleport", "quantum teleport"]):
            return (
                "**Quantum Teleportation** is a protocol to transmit an unknown quantum state `|ψ⟩ = α|0⟩ + β|1⟩` from Alice to Bob using a shared Bell pair and 2 classical bits.\n\n"
                "**Step-by-Step Protocol:**\n"
                "1. **Shared Entanglement:** Alice & Bob share Bell pair `(|00⟩+|11⟩)/√2`.\n"
                "2. **Alice's Measurement:** Alice performs Bell measurement on `|ψ⟩` and her half of the Bell pair, yielding classical bits `(m₀, m₁)`.\n"
                "3. **Classical Communication:** Alice sends `(m₀, m₁)` to Bob (no faster-than-light speed).\n"
                "4. **Bob's Correction:** Bob applies `Xᵐ¹ Zᵐ⁰` to recover `|ψ⟩` identically.\n\n"
                "```diagram\n"
                "    |ψ⟩  ───●───[ H ]───[ M: m₀ ] ══════════════╗ (Classical Bits)\n"
                "            │                                   ║\n"
                "    A   ───⊕────────────[ M: m₁ ] ═══════╗      ║\n"
                "                                         ║      ║\n"
                "    B   ───────────────────────────────[ Xᵐ¹ ]─[ Zᵐ⁰ ]──► |ψ⟩ (Bob's Output)\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. Why does Quantum Teleportation not violate the No-Cloning Theorem?\n"
                "2. Why is faster-than-light communication impossible with teleportation?\n"
                "3. What corrective gates does Bob apply if Alice measures 01 or 11?"
            )

        # ── Grover's Algorithm ─────────────────────────────────────────────
        if any(w in p for w in ["grover", "grovers", "search algorithm", "amplitude amplification"]):
            return (
                "**Grover's Algorithm** solves unstructured search across `N = 2ⁿ` database items in `O(√N)` time, providing a quadratic speedup over classical `O(N)` search.\n\n"
                "**Key Algorithmic Phases:**\n"
                "1. **Uniform Superposition:** Apply `H^{\\otimes n}` to start in `|s⟩`.\n"
                "2. **Oracle ($U_w$):** Flips the phase of the target marked state: `|w⟩ → -|w⟩`.\n"
                "3. **Diffusion Operator ($2|s⟩⟨s| - I$):** Reflects all amplitudes across the mean, boosting target amplitude while suppressing non-target states.\n\n"
                "```diagram\n"
                "                 Grover Iteration (Repeated ~π/4 √N times)\n"
                "    |0⟩─[H]─┐  ┌──────────────┐  ┌──────────────────┐  ┌───┐\n"
                "    |0⟩─[H]─┼──┤ Oracle (U_w) ├──┤ Diffusion (2|s⟩⟨s|-I)├─┤ M ├──► Target |w⟩\n"
                "    |0⟩─[H]─┘  └──────────────┘  └──────────────────┘  └───┘\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. How does the Oracle flip the phase of the marked target state?\n"
                "2. How many Grover iterations are required for an 8-item database (3 qubits)?\n"
                "3. What happens if you run too many Grover iterations (over-rotation)?"
            )

        # ── Shor's Algorithm & QFT ─────────────────────────────────────────
        if any(w in p for w in ["shor", "shors", "factoring", "rsa", "qft", "fourier transform"]):
            return (
                "**Shor's Algorithm** factors large composite integers `N = p × q` in polynomial time `O((log N)³)`, threatening classical RSA public-key encryption.\n\n"
                "**Core Strategy:**\n"
                "- Converts factoring into a **Period Finding problem**: finds period `r` of `f(x) = aˣ mod N`.\n"
                "- Uses **Quantum Fourier Transform (QFT)** to extract period `r` exponentially faster than classical algorithms.\n"
                "- Classical post-processing calculates `gcd(a^{r/2} ± 1, N)` to extract factors `p` and `q`.\n\n"
                "```diagram\n"
                "    Register 1 (|0⟩ⁿ): ──[ Hⁿ ]──●──────[ QFT⁻¹ ]──► Measure Phase s/r\n"
                "                                 │\n"
                "    Register 2 (|1⟩) : ────────[ U_a ]─────────────►\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. How does the Quantum Fourier Transform (QFT) extract periodic signals?\n"
                "2. Why does Shor's algorithm provide an exponential speedup over classical algorithms?\n"
                "3. How many physical qubits are needed to break RSA-2048 using error correction?"
            )

        # ── Quantum Error Correction (QEC) ─────────────────────────────────
        if any(w in p for w in ["qec", "error correction", "surface code", "syndrome", "bit-flip code"]):
            return (
                "**Quantum Error Correction (QEC)** protects fragile quantum information from environmental noise and decoherence without measuring (and destroying) the logical quantum state.\n\n"
                "**Key Mechanics:**\n"
                "- **Entangled Encoding:** Encodes 1 logical qubit across multiple physical data qubits (e.g. 3-qubit bit-flip code: `|0_L⟩ = |000⟩`, `|1_L⟩ = |111⟩`).\n"
                "- **Syndrome Measurement:** Ancilla qubits measure stabilizer operators ($Z_0 Z_1, Z_1 Z_2$) to locate errors without collapsing the superposition.\n"
                "- **Recovery:** Applies corrective Pauli gates ($X$ or $Z$) to restore pristine state.\n\n"
                "```diagram\n"
                "    |ψ⟩ ──●──●───────────[ X? ]──► |ψ⟩ (Protected Logical Qubit)\n"
                "          │  │     │  │\n"
                "    |0⟩ ──⊕──┼─────●──┼──► [ M: Syndrome 1 ]\n"
                "             │     │  │\n"
                "    |0⟩ ─────⊕─────┼──●──► [ M: Syndrome 2 ]\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. How does the 3-qubit bit-flip code detect which qubit flipped?\n"
                "2. What is the difference between a bit-flip (X) and phase-flip (Z) error?\n"
                "3. How do 2D Surface Codes achieve high fault-tolerant error thresholds (~1%)?"
            )

        # ── VQE & Quantum Algorithms ───────────────────────────────────────
        if any(w in p for w in ["vqe", "variational", "qaoa", "optimization", "eigensolver"]):
            return (
                "**Variational Quantum Eigensolver (VQE)** is a hybrid quantum-classical algorithm designed for NISQ computers to find ground state energies of molecules and Hamiltonians.\n\n"
                "**Hybrid Feedback Loop:**\n"
                "1. **Quantum Processor (QPU):** Prepares parameterized quantum state `|ψ(θ)⟩` and measures expectation value `⟨H⟩_θ`.\n"
                "2. **Classical Optimizer (CPU):** Runs gradient descent / Nelder-Mead to update parameter angles `θ` to minimize `⟨H⟩` according to the Variational Principle.\n\n"
                "```diagram\n"
                "    ┌─────────────┐  State |ψ(θ)⟩  ┌─────────────┐   Expectation ⟨H⟩\n"
                "    │   Quantum   │ ─────────────► │ Measurement │ ────────────────┐\n"
                "    │ QPU Ansatz  │ ◄───────────── │ Energy Eval │                 │\n"
                "    └─────────────┘   New θ angles └─────────────┘                 ▼\n"
                "                            ▲                             ┌─────────────────┐\n"
                "                            └──────────────────────────── │ Classical CPU   │\n"
                "                                                          │ Optimizer (Min) │\n"
                "                                                          └─────────────────┘\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. What is the Variational Principle in quantum mechanics?\n"
                "2. What are Barren Plateaus in parameterized quantum circuits?\n"
                "3. How is QAOA used to solve combinatorial optimization problems (Max-Cut)?"
            )

        # ── Hardware, Cryostats & Transmons ────────────────────────────────
        if any(w in p for w in ["hardware", "cryostat", "refrigerator", "transmon", "superconducting", "ibm"]):
            return (
                "**Superconducting Quantum Hardware** uses artificial superconducting circuits (transmons) cooled to ~15 millikelvin inside a Dilution Refrigerator (Cryostat).\n\n"
                "**Hardware Components:**\n"
                "- **Dilution Refrigerator:** Multi-stage cooling chamber (50K → 4K → 100mK → 15mK) colder than deep space to eliminate thermal noise.\n"
                "- **Transmon Qubit:** Anharmonic oscillator made of a Josephson junction and capacitor.\n"
                "- **Control Lines:** Coaxial microwave cables transmitting gigahertz pulses for single-qubit rotations and flux lines for two-qubit gates.\n\n"
                "```diagram\n"
                "    [ 300 K ] Room Temp Electronics (Microwave Controllers)\n"
                "       │\n"
                "    [  50 K ] Radiation Shield\n"
                "       │\n"
                "    [   4 K ] Pulse Attenuation\n"
                "       │\n"
                "    [ 15 mK ] Quantum Processor Unit (QPU Chip in Magnetic Shield)\n"
                "```\n\n"
                "### 💡 Related Questions:\n"
                "1. Why do superconducting qubits need to be cooled to 15 millikelvin?\n"
                "2. What is a Josephson junction and why is non-linearity required for qubits?\n"
                "3. What are T1 (relaxation) and T2 (dephasing) decoherence times?"
            )

        # ── Dynamic Fallback for Any General Quantum Query ──────────────────
        return (
            f"**Quantum Analysis for:** `{prompt.strip()}`\n\n"
            "In quantum computing, this concept operates by leveraging the fundamental postulates of quantum mechanics: state vector evolution in Hilbert space, unitary transformation matrices, and projective measurements.\n\n"
            "**Key Principles:**\n"
            "- **State Evolution:** Governed by unitary operators `U` where `U† U = I`, preserving total probability `∑|cᵢ|² = 1`.\n"
            "- **Phase & Interference:** Amplitudes can combine constructively (amplifying correct solutions) or destructively (canceling wrong outcomes).\n"
            "- **Measurement:** Projections collapse the quantum state into an observable eigenstate with probabilistic fidelity.\n\n"
            "```diagram\n"
            "    |Initial State⟩ ───► [ Unitary Evolution: U(t) ] ───► [ Measurement ] ───► Result\n"
            "       (|0...0⟩)          (H, CNOT, Phase Gates)             (Collapse)       (Bitstring)\n"
            "```\n\n"
            "### 💡 Related Questions:\n"
            "1. How can you construct this operation using elementary single and two-qubit gates?\n"
            "2. How does this behave on a physical noisy quantum simulator?\n"
            "3. What is the mathematical matrix representation of this transformation?"
        )
