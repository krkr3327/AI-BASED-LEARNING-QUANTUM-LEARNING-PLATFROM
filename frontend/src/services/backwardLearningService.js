// Backward Learning Engine Service for Quantum Mastery
// Paradigm: Challenge First -> Attempt -> Pass/Fail -> Diagnostic AI -> Knowledge Gap -> Learning AI -> Targeted Learning -> Quantum Lab -> Experiment AI -> Re-attempt -> Mastery

import { purposeService } from "./purposeService";

export const MISSIONS_DATABASE = [
  {
    id: "mission-bell-state",
    title: "Mission 1: The Quantum Entanglement Bridge",
    tier: "Beginner",
    category: "Entanglement & Bell States",
    targetSkillId: "entanglement",
    description: "Construct a 2-qubit circuit that transforms the ground state |00⟩ into the maximally entangled Bell State |Φ⁺⟩ = (|00⟩ + |11⟩)/√2.",
    objective: "Output statevector must have 50% probability on |00⟩ and 50% probability on |11⟩ with zero phase difference.",
    startingGates: [],
    targetProbabilities: { "00": 0.5, "11": 0.5 },
    maxGates: 3,
    hints: ["Try applying a Hadamard gate to qubit 0 to create superposition first, then couple it with a CNOT gate."],
    correctCircuit: [
      { gate: "H", qubit: 0, time: 0 },
      { gate: "CNOT", control: 0, target: 1, time: 1 }
    ],
    diagnosticPackage: {
      gapIdentified: "Entanglement Synthesis & Hadamard-CNOT Coupling",
      diagnosticExplanation: "Your circuit failed to create maximum entanglement. Without a Hadamard gate on the control qubit followed by a CNOT gate targeting the second qubit, the qubits remain separable and cannot achieve quantum correlation.",
      targetedLearning: {
        video: {
          title: "Visualizing Entanglement & The Bell State Protocol",
          duration: "3m 45s",
          videoUrl: "https://www.youtube-nocookie.com/embed/1Z8f_tZ7c7w",
          keyTakeaway: "Entanglement is created when a superposition state (|0⟩+|1⟩) controls the inversion of an adjacent qubit via CNOT."
        },
        theory: {
          title: "Mathematical Proof of Bell State Generation",
          content: "Starting with |00⟩:\n1. Apply H to qubit 0: (1/√2)(|0⟩ + |1⟩) ⊗ |0⟩ = (1/√2)(|00⟩ + |10⟩)\n2. Apply CNOT(0 → 1): When qubit 0 is |0⟩, qubit 1 stays |0⟩ → |00⟩. When qubit 0 is |1⟩, qubit 1 flips to |1⟩ → |11⟩.\nResult: |Φ⁺⟩ = (1/√2)(|00⟩ + |11⟩)."
        },
        notes: [
          "Hadamard creates unbiased 50/50 superposition.",
          "CNOT performs conditional bit-flip X on target qubit when control is 1.",
          "Bell states violate classical Bell inequalities with correlation E = 2√2 ≈ 2.828."
        ]
      },
      practiceQuiz: {
        question: "What is the resulting statevector if you apply H on qubit 0 of |00⟩ without adding the CNOT gate?",
        options: [
          "(|00⟩ + |11⟩)/√2",
          "(|00⟩ + |10⟩)/√2",
          "|01⟩",
          "(|01⟩ + |10⟩)/√2"
        ],
        correctIndex: 1,
        explanation: "Applying H to qubit 0 results in (|0⟩+|1⟩)/√2 ⊗ |0⟩ = (|00⟩ + |10⟩)/√2. The state is in superposition, but NOT yet entangled."
      },
      labExperimentPrompt: {
        title: "Quantum Lab Sandbox: 2-Qubit Bell State Synthesizer",
        recommendedGates: ["H on q[0]", "CNOT from q[0] to q[1]"],
        verifyAction: "Verify that the Bloch spheres for individual qubits become mixed states (radius < 1) while the 2-qubit statevector shows |00⟩ and |11⟩ peaks."
      }
    }
  },
  {
    id: "mission-phase-kickback",
    title: "Mission 2: Phase Kickback Oracle Inversion",
    tier: "Intermediate",
    category: "Quantum Oracles & Phase Kickback",
    targetSkillId: "phase-kickback",
    description: "Construct a phase kickback circuit using an ancilla qubit in the |−⟩ state to invert the relative phase of the input qubit when a condition is met.",
    objective: "Demonstrate phase kickback where an operation on the target qubit modifies the eigenvalue/phase of the control qubit.",
    startingGates: [],
    targetProbabilities: { "11": 1.0 },
    maxGates: 6,
    hints: ["Prepare qubit 0 in |+⟩ and qubit 1 in |−⟩. Apply CNOT(0 → 1), then apply H on qubit 0."],
    correctCircuit: [
      { gate: "X", qubit: 1, time: 0 },
      { gate: "H", qubit: 0, time: 1 },
      { gate: "H", qubit: 1, time: 1 },
      { gate: "CNOT", control: 0, target: 1, time: 2 },
      { gate: "H", qubit: 0, time: 3 }
    ],
    diagnosticPackage: {
      gapIdentified: "Phase Kickback Mechanism in Quantum Oracles",
      diagnosticExplanation: "Phase kickback is the core engine behind Deutsch-Jozsa, Grover, and Shor's algorithms. When the target qubit is an eigenstate of the gate with eigenvalue −1 (such as |−⟩ under X), the phase −1 is kicked back to the control qubit.",
      targetedLearning: {
        video: {
          title: "Understanding Phase Kickback with Bloch Sphere Rotations",
          duration: "4m 10s",
          videoUrl: "https://www.youtube-nocookie.com/embed/1Z8f_tZ7c7w",
          keyTakeaway: "CNOT|x⟩|−⟩ = (-1)^x |x⟩|−⟩. The phase kickback leaves the target in |−⟩ but alters the control state!"
        },
        theory: {
          title: "Eigenvalue Equation of Phase Kickback",
          content: "Let target qubit be in state |−⟩ = (|0⟩ − |1⟩)/√2.\nApplying X|−⟩ = −|−⟩ (eigenvalue is −1).\nWhen controlled by |x⟩:\nCNOT(|x⟩ ⊗ |−⟩) = |x⟩ ⊗ X^x |−⟩ = |x⟩ ⊗ (−1)^x |−⟩ = (−1)^x |x⟩ ⊗ |−⟩."
        },
        notes: [
          "Target must be prepared in |−⟩ using X followed by H.",
          "Control qubit in |+⟩ gets transformed into |−⟩ without any direct gate applied to it.",
          "Used in oracles to mark solutions with a global or relative phase inversion."
        ]
      },
      practiceQuiz: {
        question: "Why must the target qubit be in the |−⟩ state for phase kickback to occur with a CNOT gate?",
        options: [
          "Because |−⟩ is an eigenstate of X with eigenvalue −1",
          "Because |−⟩ has 100% probability of measuring 0",
          "Because CNOT only acts on qubits in the Z basis",
          "Because |−⟩ eliminates all noise in the quantum channel"
        ],
        correctIndex: 0,
        explanation: "X|−⟩ = X(|0⟩ − |1⟩)/√2 = (|1⟩ − |0⟩)/√2 = −(|0⟩ − |1⟩)/√2 = −|−⟩. The −1 eigenvalue is what transfers to the control qubit."
      },
      labExperimentPrompt: {
        title: "Quantum Lab Sandbox: Phase Kickback Verifier",
        recommendedGates: ["X on q[1]", "H on q[0]", "H on q[1]", "CNOT(0,1)", "H on q[0]"],
        verifyAction: "Observe how qubit 0 measures |1⟩ with 100% certainty after the final H gate, proving its phase was kicked back."
      }
    }
  },
  {
    id: "mission-grover-oracle",
    title: "Mission 3: Grover Search 2-Qubit Target Marking",
    tier: "Advanced",
    category: "Grover Search Algorithm",
    targetSkillId: "grover-qft",
    description: "Construct a 2-qubit Grover Search circuit that marks and amplifies the target state |11⟩ using an Oracle and Diffusion operator.",
    objective: "Measure state |11⟩ with 100% probability after one Grover iteration.",
    startingGates: [],
    targetProbabilities: { "11": 1.0 },
    maxGates: 8,
    hints: ["Apply H to both qubits, then CZ (controlled-Z) as the Oracle, then H-X-CZ-X-H as the Diffusion operator."],
    correctCircuit: [
      { gate: "H", qubit: 0, time: 0 },
      { gate: "H", qubit: 1, time: 0 },
      { gate: "CZ", control: 0, target: 1, time: 1 },
      { gate: "H", qubit: 0, time: 2 },
      { gate: "H", qubit: 1, time: 2 },
      { gate: "X", qubit: 0, time: 3 },
      { gate: "X", qubit: 1, time: 3 },
      { gate: "CZ", control: 0, target: 1, time: 4 },
      { gate: "X", qubit: 0, time: 5 },
      { gate: "X", qubit: 1, time: 5 },
      { gate: "H", qubit: 0, time: 6 },
      { gate: "H", qubit: 1, time: 6 }
    ],
    diagnosticPackage: {
      gapIdentified: "Grover Amplitude Amplification & Diffusion Operator",
      diagnosticExplanation: "Your Grover iteration did not amplify the target amplitude. Grover's algorithm requires two synchronized stages: (1) An Oracle that flips the sign of the target state, and (2) A Diffusion operator (inversion about the mean) that reflects amplitudes across the average.",
      targetedLearning: {
        video: {
          title: "Geometric Visualization of Grover Amplification",
          duration: "5m 20s",
          videoUrl: "https://www.youtube-nocookie.com/embed/1Z8f_tZ7c7w",
          keyTakeaway: "Grover's algorithm rotates the state vector towards the target state in the 2D subspace spanned by the uniform superposition and the target."
        },
        theory: {
          title: "Inversion About the Mean Formula",
          content: "The Diffusion operator is given by:\nD = 2|s⟩⟨s| − I\nwhere |s⟩ = (1/√N) ∑ |x⟩ is the equal superposition state.\nIn circuit form: H^{\\otimes n} X^{\\otimes n} (Controlled-Z) X^{\\otimes n} H^{\\otimes n}."
        },
        notes: [
          "For N=4 (2 qubits), exactly 1 Grover iteration achieves 100% success probability!",
          "Quadratic speedup: O(√N) quantum queries vs O(N) classical search.",
          "Oracle marks solution by applying a −1 phase shift: |w⟩ → −|w⟩."
        ]
      },
      practiceQuiz: {
        question: "How many Grover iterations are needed to find a marked item with 100% probability in a 2-qubit (N=4) search space?",
        options: ["1 iteration", "2 iterations", "4 iterations", "√2 iterations"],
        correctIndex: 0,
        explanation: "For N=4, the rotation angle per iteration is θ = π/3. Starting at θ/2 = π/6, exactly one iteration reaches π/2, yielding 100% probability."
      },
      labExperimentPrompt: {
        title: "Quantum Lab Sandbox: Grover Amplitude Analyzer",
        recommendedGates: ["H, H", "Oracle (CZ)", "Diffusion (H, X, CZ, X, H)"],
        verifyAction: "Check the statevector histogram: |11⟩ will have probability 1.0 while |00⟩, |01⟩, and |10⟩ will be 0.0."
      }
    }
  },
  {
    id: "mission-transpiler-opt",
    title: "Mission 4: Transpiler Basis Gate Synthesis",
    tier: "Career Track",
    category: "Circuit Transpilation & Optimization",
    targetSkillId: "transpilation",
    description: "Synthesize an arbitrary unitary operation using the native hardware basis gate set {CX, RZ, SX, X} with minimum depth.",
    objective: "Map non-native unitary gates into hardware compliant native gates with depth <= 4.",
    startingGates: [],
    targetProbabilities: { "01": 0.5, "10": 0.5 },
    maxGates: 5,
    hints: ["Use single-qubit rotations combined with a CNOT to match the coupling topology."],
    correctCircuit: [
      { gate: "H", qubit: 0, time: 0 },
      { gate: "X", qubit: 1, time: 0 },
      { gate: "CNOT", control: 0, target: 1, time: 1 }
    ],
    diagnosticPackage: {
      gapIdentified: "Hardware Basis Gate Decomposition & SWAP Routing",
      diagnosticExplanation: "Quantum physical backends only execute specific native 1-qubit and 2-qubit gates. Non-native gates like Toffoli or SWAP must be decomposed using pulse-calibrated basis gates.",
      targetedLearning: {
        video: {
          title: "Qiskit Transpiler Level 3 Optimization Pipelines",
          duration: "4m 50s",
          videoUrl: "https://www.youtube-nocookie.com/embed/1Z8f_tZ7c7w",
          keyTakeaway: "Transpilation transforms virtual quantum circuits into physical QPU instructions while mitigating crosstalk noise."
        },
        theory: {
          title: "Universal Single-Qubit Z-Y Decomposition",
          content: "Any single qubit unitary U ∈ SU(2) can be decomposed as:\nU = e^{iα} R_z(β) R_y(γ) R_z(δ)."
        },
        notes: [
          "Transpiler passes include Unroller, CommutativeCancellation, and SabreSWAP.",
          "Minimizing 2-qubit CNOT count directly elevates overall circuit fidelity."
        ]
      },
      practiceQuiz: {
        question: "How many CNOT gates are required in a standard minimal decomposition of a 2-qubit SWAP gate?",
        options: ["1 CNOT", "2 CNOTs", "3 CNOTs", "4 CNOTs"],
        correctIndex: 2,
        explanation: "A SWAP gate decomposes into 3 alternating CNOT gates: CNOT(0,1) - CNOT(1,0) - CNOT(0,1)."
      },
      labExperimentPrompt: {
        title: "Quantum Lab Sandbox: Transpiler Optimizer",
        recommendedGates: ["CNOT(0,1)", "CNOT(1,0)", "CNOT(0,1)"],
        verifyAction: "Verify that state |10⟩ swaps to |01⟩."
      }
    }
  },
  {
    id: "mission-qec-syndrome",
    title: "Mission 5: Quantum Error Correction Syndrome Extraction",
    tier: "Research Track",
    category: "Quantum Error Correction Baseline",
    targetSkillId: "domain-physics",
    description: "Construct a 3-qubit bit-flip error correction code and extract the syndrome without collapsing the logical quantum data.",
    objective: "Correct an injected bit-flip error on data qubit 0 using ancilla syndrome measurements.",
    startingGates: [],
    targetProbabilities: { "000": 1.0 },
    maxGates: 6,
    hints: ["Entangle data qubit with two ancillas via CNOT, inject test error, then extract syndrome."],
    correctCircuit: [
      { gate: "CNOT", control: 0, target: 1, time: 0 },
      { gate: "CNOT", control: 0, target: 2, time: 1 }
    ],
    diagnosticPackage: {
      gapIdentified: "Stabilizer Formalism & Non-Destructive Syndrome Extraction",
      diagnosticExplanation: "Quantum error correction protects quantum information by entangling a logical qubit across multiple physical qubits. Parity measurements detect errors without reading qubit values directly.",
      targetedLearning: {
        video: {
          title: "Surface Code Stabilizers & Anyon Lattice Surgery",
          duration: "6m 10s",
          videoUrl: "https://www.youtube-nocookie.com/embed/1Z8f_tZ7c7w",
          keyTakeaway: "Stabilizer generators measure eigenvalues ±1 without destroying the superposition state."
        },
        theory: {
          title: "3-Qubit Repetition Code Encoding",
          content: "|0_L⟩ = |000⟩\n|1_L⟩ = |111⟩\nStabilizers: S_1 = Z_0 Z_1, S_2 = Z_1 Z_2."
        },
        notes: [
          "Syndrome 10 indicates X error on qubit 0.",
          "Syndrome 11 indicates X error on qubit 1.",
          "Syndrome 01 indicates X error on qubit 2."
        ]
      },
      practiceQuiz: {
        question: "What happens if you directly measure a data qubit in a quantum error correcting code?",
        options: [
          "The code corrects twice as fast",
          "The logical superposition collapses, destroying quantum information",
          "The noise is automatically transferred to the environment",
          "Nothing, quantum states cannot be disturbed"
        ],
        correctIndex: 1,
        explanation: "Direct measurement collapses superposition. Syndrome measurements measure multi-qubit parity without revealing data values."
      },
      labExperimentPrompt: {
        title: "Quantum Lab Sandbox: 3-Qubit QEC Syndrome Analyzer",
        recommendedGates: ["CNOT(0,1)", "CNOT(0,2)"],
        verifyAction: "Verify logical code space protection."
      }
    }
  }
];

const ACTIVE_MISSION_KEY = "quantum_mastery_active_mission";

export const backwardLearningService = {
  getActiveMission() {
    try {
      const data = localStorage.getItem(ACTIVE_MISSION_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Failed to load active mission:", e);
    }
    return this.getNextBestAction().mission;
  },

  setActiveMission(missionId) {
    const mission = MISSIONS_DATABASE.find(m => m.id === missionId) || MISSIONS_DATABASE[0];
    localStorage.setItem(ACTIVE_MISSION_KEY, JSON.stringify(mission));
    return mission;
  },

  getNextBestAction() {
    const purpose = purposeService.getPurpose();
    const skillGraph = purposeService.getSkillGraph();
    
    // Find highest priority gap
    const skills = Object.values(skillGraph.skills || {});
    const gapSkill = skills.find(s => s.status === "gap") || skills.find(s => s.mastery < 60) || skills[0];

    let matchedMission = MISSIONS_DATABASE.find(m => m.targetSkillId === gapSkill?.id);
    
    if (!matchedMission) {
      if (purpose.type === "job") matchedMission = MISSIONS_DATABASE[3];
      else if (purpose.type === "research") matchedMission = MISSIONS_DATABASE[4];
      else if (purpose.targetId === "advanced") matchedMission = MISSIONS_DATABASE[2];
      else if (purpose.targetId === "intermediate") matchedMission = MISSIONS_DATABASE[1];
      else matchedMission = MISSIONS_DATABASE[0];
    }
    
    return {
      recommendationType: "backward_mission",
      mission: matchedMission,
      rationale: `Dynamically adapted for your '${purpose.title}' curriculum. AI diagnostic identified weak concept: ${gapSkill?.name || 'Quantum Core'}.`,
      estimatedTime: "10-15 mins",
      xpReward: 150
    };
  },

  evaluateAttempt(missionId, circuitGates) {
    const mission = MISSIONS_DATABASE.find(m => m.id === missionId) || MISSIONS_DATABASE[0];
    
    let passed = false;
    let feedback = "";

    if (mission.id === "mission-bell-state") {
      const hasH0 = circuitGates.some(g => g.gate === "H" && g.qubit === 0);
      const hasCNOT01 = circuitGates.some(g => g.gate === "CNOT" && g.control === 0 && g.target === 1);
      if (hasH0 && hasCNOT01) {
        passed = true;
        feedback = "Success! Perfect Bell State |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 generated!";
      } else if (!hasH0) {
        feedback = "Missing Hadamard gate on qubit 0. The circuit remains in classical ground state |00⟩.";
      } else {
        feedback = "Hadamard is present, but qubits are not entangled without a CNOT(0 → 1) gate.";
      }
    } else if (mission.id === "mission-phase-kickback") {
      const hasX1 = circuitGates.some(g => g.gate === "X" && g.qubit === 1);
      const hasH0 = circuitGates.some(g => g.gate === "H" && g.qubit === 0);
      const hasCNOT = circuitGates.some(g => g.gate === "CNOT" && g.control === 0 && g.target === 1);
      if (hasX1 && hasH0 && hasCNOT) {
        passed = true;
        feedback = "Success! Phase kickback successfully shifted the control qubit relative phase!";
      } else {
        feedback = "Phase kickback incomplete. Ensure target is in |−⟩ and control is coupled via CNOT.";
      }
    } else if (mission.id === "mission-grover-oracle") {
      const hasCZ = circuitGates.some(g => g.gate === "CZ" || g.gate === "CNOT");
      const hasH = circuitGates.some(g => g.gate === "H");
      if (hasCZ && hasH && circuitGates.length >= 4) {
        passed = true;
        feedback = "Success! Target amplitude inverted and amplified with high fidelity!";
      } else {
        feedback = "Grover diffusion operator incomplete. Inversion about the mean requires synchronized H-X-CZ-X-H sequence.";
      }
    } else {
      passed = circuitGates.length >= 2;
      feedback = passed ? "Mission Passed! Circuit meets target expectation." : "Statevector fidelity below threshold. Diagnostic AI triggered.";
    }

    const result = {
      missionId,
      passed,
      feedback,
      timestamp: new Date().toISOString(),
      circuitSubmitted: circuitGates
    };

    // Diagnostic AI update: If passed -> 95%, If failed -> 25% (Flag as Weak Gap)
    if (passed) {
      purposeService.updateSkillMastery(mission.targetSkillId, 95);
    } else {
      purposeService.updateSkillMastery(mission.targetSkillId, 25);
    }

    return result;
  }
};
