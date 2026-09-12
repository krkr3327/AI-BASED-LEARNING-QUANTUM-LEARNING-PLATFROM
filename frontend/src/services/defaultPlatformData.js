/**
 * defaultPlatformData.js
 * Comprehensive fallback and default state for courses, modules, lessons,
 * notes, quizzes, formal assessments, code challenges, and algorithmic problems.
 */

export const DEFAULT_COURSES = [
  {
    id: "crs-qnt-101",
    title: "Quantum Computing Foundations & Qiskit Algorithms",
    description: "Master the fundamental mechanics of quantum states, superposition, entanglement, and build executable quantum circuits.",
    category: "Quantum Computing",
    level: "Beginner to Intermediate",
    duration: "6 Weeks (24 Hours)",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    is_published: true,
    modules: [
      {
        id: "mod-1",
        title: "Module 1: Superposition & Single-Qubit Mechanics",
        description: "State vectors, Bloch sphere rotations, and Pauli gate operations.",
        lessons: [
          {
            id: "les-1-1",
            title: "Introduction to Qubits & The Bloch Sphere",
            type: "theory",
            duration: "18 min",
            content: "# Introduction to Qubits & The Bloch Sphere\n\nIn classical computation, the fundamental unit of information is the bit (`0` or `1`). In quantum computing, the fundamental unit is the **qubit**, existing in a linear superposition:\n\n$$|\\psi\\rangle = \\alpha |0\\rangle + \\beta |1\\rangle$$\n\nWhere $|\\alpha|^2 + |\\beta|^2 = 1$."
          },
          {
            id: "les-1-2",
            title: "Quantum Gates & State Rotations Walkthrough",
            type: "video",
            duration: "24 min",
            video_url: "https://www.youtube.com/embed/QuRna36xnwk",
            content: "Watch demonstrations of Pauli-X, Hadamard (H), and Phase (S, T) gates on IBM Qiskit quantum simulators."
          }
        ]
      },
      {
        id: "mod-2",
        title: "Module 2: Entanglement & Bell State Circuits",
        description: "Two-qubit interactions, CNOT gates, and EPR pair creation.",
        lessons: [
          {
            id: "les-2-1",
            title: "Constructing Bell States with Hadamard & CNOT",
            type: "theory",
            duration: "22 min",
            content: "# Constructing Bell States\n\nStarting from $|00\\rangle$, apply $H$ on qubit 0 followed by $\\text{CNOT}$ from qubit 0 to 1:\n\n$$\\text{CNOT}(H|0\\rangle \\otimes |0\\rangle) = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}} = |\\Phi^+\\rangle$$"
          }
        ]
      }
    ],
    quizzes: [
      {
        id: "qz-101",
        title: "Qubit Superposition & Gate Logic Mastery",
        description: "Evaluates single-qubit unitary operators, state vector normalization, and basis collapse.",
        time_limit_mins: 15,
        passing_score: 75,
        questions: [
          {
            id: "q-1",
            question: "What is the result of applying a Hadamard (H) gate to the ground state |0⟩?",
            options: ["|1⟩", "(|0⟩ + |1⟩) / √2", "(|0⟩ - |1⟩) / √2", "|0⟩"],
            correct_answer_index: 1,
            explanation: "Hadamard transforms computational basis |0⟩ to the equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2."
          },
          {
            id: "q-2",
            question: "Which Pauli matrix corresponds to a 180° rotation around the Z-axis of the Bloch sphere?",
            options: ["Pauli-X (Bit flip)", "Pauli-Y", "Pauli-Z (Phase flip)", "Hadamard"],
            correct_answer_index: 2,
            explanation: "Pauli-Z matrix [[1, 0], [0, -1]] flips the phase of state |1⟩ while keeping |0⟩ unchanged."
          }
        ]
      },
      {
        id: "qz-102",
        title: "Two-Qubit Entanglement & CNOT Operators",
        description: "Verification of maximal entanglement and Bell state generation circuits.",
        time_limit_mins: 20,
        passing_score: 80,
        questions: [
          {
            id: "q-2-1",
            question: "Given state |10⟩, what is the output after applying a CNOT gate where Qubit 0 is control and Qubit 1 is target?",
            options: ["|00⟩", "|11⟩", "|01⟩", "|10⟩"],
            correct_answer_index: 1,
            explanation: "Since control qubit 0 is |1⟩, target qubit 1 is flipped from |0⟩ to |1⟩, producing state |11⟩."
          }
        ]
      }
    ],
    assessments: [
      {
        id: "asm-101",
        title: "Mid-Term Comprehensive Exam: Dirac Formalism & Bell States",
        description: "Rigorous theoretical derivation of bipartite quantum density matrices and entanglement witnesses.",
        deadline: "2026-11-30T23:59",
        instructions: "Show detailed mathematical derivations for all projection measurements. Justify your tensor product dimensions.",
        total_marks: 50,
        questions: [
          {
            question: "Derive the mathematical proof showing that the Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2 cannot be written as a product state |a⟩ ⊗ |b⟩.",
            max_marks: 25,
            guidelines: "Check that student assumes |a⟩ = a0|0⟩ + a1|1⟩ and |b⟩ = b0|0⟩ + b1|1⟩, setting up equations a0b1 = 0 and a1b0 = 0 to reveal a contradiction."
          },
          {
            question: "Explain the Born Rule for projective measurement operators {Pm} and calculate the measurement probabilities for state |ψ⟩ = (√3/2)|0⟩ + (1/2)|1⟩ in the Hadamard basis {|+⟩, |-⟩}.",
            max_marks: 25,
            guidelines: "Expect transformation into |+⟩ and |-⟩ basis: |ψ⟩ = α|+⟩ + β|-⟩ and evaluation of |α|² and |β|²."
          }
        ]
      }
    ],
    challenges: [
      {
        id: "ch-101",
        title: "Implement Quantum Teleportation Protocol",
        description: "Construct a 3-qubit quantum circuit in Qiskit to teleport an unknown arbitrary state |ψ⟩ from Alice to Bob using an EPR pair.",
        difficulty: "Intermediate",
        xp_reward: 350,
        starter_code: `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n\ndef build_teleportation_circuit():\n    qr = QuantumRegister(3, 'q')\n    crz = ClassicalRegister(1, 'crz')\n    crx = ClassicalRegister(1, 'crx')\n    qc = QuantumCircuit(qr, crz, crx)\n    \n    # Step 1: Create Bell Pair between q[1] and q[2]\n    qc.h(qr[1])\n    qc.cx(qr[1], qr[2])\n    \n    # Step 2: Alice's Bell measurement\n    qc.cx(qr[0], qr[1])\n    qc.h(qr[0])\n    qc.measure(qr[0], crz)\n    qc.measure(qr[1], crx)\n    \n    return qc\n`,
        hints: ["Remember to apply classical controlled corrections on Bob's qubit based on Alice's measurement outcomes."]
      },
      {
        id: "ch-102",
        title: "Superdense Coding Channel Synthesis",
        description: "Encode 2 classical bits into a single qubit transmission through shared entanglement.",
        difficulty: "Beginner",
        xp_reward: 200,
        starter_code: `def superdense_encoder(classical_bits: str):\n    \"\"\" classical_bits in ['00', '01', '10', '11'] \"\"\"\n    # Return unitary gate sequence (I, X, Z, XZ)\n    pass\n`,
        hints: ["Bit '01' requires Pauli-X; bit '10' requires Pauli-Z; bit '11' requires Pauli-Z * Pauli-X."]
      }
    ],
    problems: [
      {
        id: "pr-101",
        title: "Unitary Matrix Hermiticity & Orthogonality Validator",
        description: "Given a 2x2 or 4x4 complex matrix U, verify whether U * U† = I within numerical tolerance 1e-7.",
        difficulty: "Medium",
        starter_code: `import numpy as np\n\ndef verify_unitary(matrix: np.ndarray) -> bool:\n    \"\"\" Returns True if matrix is unitary (U @ U_dagger == I) \"\"\"\n    identity = np.eye(matrix.shape[0])\n    u_dagger = np.conjugate(matrix.T)\n    product = np.matmul(matrix, u_dagger)\n    return np.allclose(product, identity, atol=1e-7)\n`
      },
      {
        id: "pr-102",
        title: "Quantum State Vector Fidelity Evaluator",
        description: "Compute the transition fidelity F(ψ, φ) = |⟨ψ|φ⟩|² between two normalized N-dimensional pure quantum states.",
        difficulty: "Easy",
        starter_code: `import numpy as np\n\ndef calculate_state_fidelity(psi: np.ndarray, phi: np.ndarray) -> float:\n    \"\"\" Compute pure state fidelity |<psi|phi>|^2 \"\"\"\n    inner_product = np.vdot(psi, phi)\n    return float(np.abs(inner_product)**2)\n`
      }
    ],
    notes: [
      {
        id: "not-101",
        title: "Complete Dirac Notation & Pauli Matrix Quick Reference",
        description: "Unitary representations for H, X, Y, Z, CNOT, SWAP, and Toffoli gates with eigenvalue breakdowns.",
        file_url: "#"
      }
    ]
  },
  {
    id: "crs-qnt-201",
    title: "Quantum Key Distribution & Cryptographic Protocols",
    description: "Deep-dive into BB84, E91, quantum teleportation channels, and secure cryptographic key exchanges.",
    category: "Quantum Cryptography",
    level: "Intermediate",
    duration: "4 Weeks (16 Hours)",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    is_published: true,
    modules: [
      {
        id: "mod-201-1",
        title: "Module 1: BB84 Protocol Mechanics",
        description: "Polarization bases, non-orthogonal state encoding, and eavesdropper detection.",
        lessons: [
          {
            id: "les-201-1",
            title: "BB84 State Preparation & Sifting",
            type: "theory",
            duration: "25 min",
            content: "# BB84 Protocol\n\nAlice prepares photons in random rectilinear (+) and diagonal (×) bases..."
          }
        ]
      }
    ],
    quizzes: [
      {
        id: "qz-201",
        title: "Quantum Cryptography & BB84 Evaluation",
        description: "Assess understanding of quantum sifting, quantum bit error rate (QBER), and privacy amplification.",
        time_limit_mins: 15,
        passing_score: 70,
        questions: [
          {
            id: "q-201-1",
            question: "Why can't an eavesdropper (Eve) clone transmitted quantum states without perturbation?",
            options: ["Due to the No-Cloning Theorem", "Because photons travel at light speed", "Because classical noise prevents it", "Due to Heisenberg kinetic error"],
            correct_answer_index: 0,
            explanation: "The No-Cloning Theorem mathematically prohibits unitary copying of an arbitrary unknown quantum state."
          }
        ]
      }
    ],
    assessments: [],
    challenges: [
      {
        id: "ch-201",
        title: "Simulate BB84 Quantum Key Sifting Engine",
        description: "Generate random Alice bases, Bob measurement bases, and simulate privacy amplification with error reconciliation.",
        difficulty: "Intermediate",
        xp_reward: 300,
        starter_code: `import numpy as np\n\ndef simulate_bb84_sifting(num_bits=100):\n    alice_bits = np.random.randint(0, 2, num_bits)\n    alice_bases = np.random.randint(0, 2, num_bits)\n    bob_bases = np.random.randint(0, 2, num_bits)\n    \n    # Matching bases filter\n    sifted_key = [alice_bits[i] for i in range(num_bits) if alice_bases[i] == bob_bases[i]]\n    return sifted_key\n`,
        hints: ["Bases match with 50% probability on average in an ideal unperturbed channel."]
      }
    ],
    problems: [],
    notes: []
  },
  {
    id: "crs-qnt-301",
    title: "Grover's Search & Shor's Factorization Algorithms",
    description: "Analyze quadratic speedup with Grover oracle diffusion operators and Shor's quantum phase estimation for factoring.",
    category: "Quantum Algorithms",
    level: "Advanced",
    duration: "8 Weeks (32 Hours)",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    is_published: true,
    modules: [
      {
        id: "mod-301-1",
        title: "Module 1: Grover Diffusion Operator",
        description: "Oracle tagging, inversion about the mean, and amplitude amplification.",
        lessons: [
          {
            id: "les-301-1",
            title: "Amplitude Amplification Proof",
            type: "theory",
            duration: "30 min",
            content: "# Grover Diffusion Operator\n\n$$D = 2|s\\rangle\\langle s| - I$$"
          }
        ]
      }
    ],
    quizzes: [],
    assessments: [],
    challenges: [
      {
        id: "ch-301",
        title: "Build 2-Qubit Grover Oracle for State |11⟩",
        description: "Construct the phase inversion oracle using Controlled-Z and analyze geometric rotation in the Hilbert plane.",
        difficulty: "Advanced",
        xp_reward: 500,
        starter_code: `def build_grover_oracle_11():\n    # Phase inversion oracle for target state |11>\n    pass\n`,
        hints: ["A single CZ gate acts as the oracle for |11> because it applies -1 only when both qubits are |1>."]
      }
    ],
    problems: [
      {
        id: "pr-301",
        title: "Quantum Phase Estimation Eigenvalue Extractor",
        description: "Calculate the exact phase angle θ for a unitary operator U given its eigenvector |u⟩ such that U|u⟩ = e^(2πiθ)|u⟩.",
        difficulty: "Hard",
        starter_code: `def extract_qpe_phase(unitary_matrix, eigenvector):\n    pass\n`
      }
    ],
    notes: []
  }
];

export const DEFAULT_SUBMISSIONS = [
  {
    id: "sub-101",
    assessment_id: "asm-101",
    assessment_title: "Mid-Term Comprehensive Exam: Dirac Formalism & Bell States",
    course_id: "crs-qnt-101",
    course_title: "Quantum Computing Foundations & Qiskit Algorithms",
    learner_id: "usr-001",
    learner_name: "Alex Rivera",
    learner_email: "alex.rivera@quantum.edu",
    submitted_at: "2026-09-11T16:20:00Z",
    status: "graded",
    score: 46,
    max_marks: 50,
    feedback: "Excellent proof showing tensor product contradiction for |Φ+⟩. Very clear Dirac notation and Born rule expansion.",
    answers: {
      "0": "Proof by Contradiction:\nAssume |Φ+⟩ = |a⟩ ⊗ |b⟩ where |a⟩ = a0|0⟩ + a1|1⟩ and |b⟩ = b0|0⟩ + b1|1⟩.\nThen |a⟩ ⊗ |b⟩ = a0b0|00⟩ + a0b1|01⟩ + a1b0|10⟩ + a1b1|11⟩.\nMatching coefficients with |Φ+⟩ = 1/√2 |00⟩ + 1/√2 |11⟩:\n1) a0b0 = 1/√2\n2) a0b1 = 0\n3) a1b0 = 0\n4) a1b1 = 1/√2\nFrom (2), either a0=0 or b1=0. If a0=0, then a0b0=0, contradicting (1). If b1=0, then a1b1=0, contradicting (4). Thus, no such single-qubit states exist. Q.E.D.",
      "1": "The Born rule states that the probability of measuring outcome m associated with projection operator P_m on state |ψ⟩ is P(m) = ⟨ψ|P_m|ψ⟩.\nIn the Hadamard basis {|+⟩, |-⟩}:\n|0⟩ = (|+⟩ + |-⟩)/√2\n|1⟩ = (|+⟩ - |-⟩)/√2\nSubstituting |ψ⟩ = (√3/2)|0⟩ + (1/2)|1⟩:\n|ψ⟩ = (√3/2)((|+⟩ + |-⟩)/√2) + (1/2)((|+⟩ - |-⟩)/√2)\n= (√3+1)/(2√2) |+⟩ + (√3-1)/(2√2) |-⟩.\nProbability P(+) = |(√3+1)/(2√2)|² = (4 + 2√3)/8 = (2 + √3)/4 ≈ 93.3%.\nProbability P(-) = |(√3-1)/(2√2)|² = (4 - 2√3)/8 = (2 - √3)/4 ≈ 6.7%."
    }
  },
  {
    id: "sub-102",
    assessment_id: "asm-101",
    assessment_title: "Mid-Term Comprehensive Exam: Dirac Formalism & Bell States",
    course_id: "crs-qnt-101",
    course_title: "Quantum Computing Foundations & Qiskit Algorithms",
    learner_id: "usr-002",
    learner_name: "Elena Rostova",
    learner_email: "e.rostova@quantum.edu",
    submitted_at: "2026-09-11T18:45:00Z",
    status: "pending",
    score: null,
    max_marks: 50,
    feedback: "",
    answers: {
      "0": "For a separable state |ψ⟩ = (a|0⟩ + b|1⟩)(c|0⟩ + d|1⟩) = ac|00⟩ + ad|01⟩ + bc|10⟩ + bd|11⟩.\nFor Bell state (|00⟩ + |11⟩)/√2, the cross-terms ad=0 and bc=0 imply ac*bd = 0. But ac=1/√2 and bd=1/√2 gives ac*bd = 1/2 != 0. Contradiction proven.",
      "1": "Projective measurement operators Pm satisfy Pm*Pk = δ_mk Pm and Σ Pm = I. For |ψ⟩ = (√3/2)|0⟩ + (1/2)|1⟩, we project onto |+⟩⟨+|: ⟨+|ψ⟩ = (1/√2)(√3/2) + (1/√2)(1/2) = (√3+1)/(2√2). P(+) = (2+√3)/4."
    }
  }
];
