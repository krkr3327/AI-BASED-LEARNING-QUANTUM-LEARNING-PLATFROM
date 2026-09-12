// Purpose and Goal Management Service for Quantum Mastery

export const JOB_ROLES = [
  {
    id: "quantum-software-engineer",
    title: "Quantum Software Engineer",
    icon: "💻",
    description: "Develop quantum algorithms, integrate Qiskit/Cirq SDKs, optimize circuit transpilation, and build hybrid classical-quantum pipelines.",
    requiredSkills: [
      { id: "qiskit-cirq", name: "Qiskit & Cirq SDKs", level: "Advanced", weight: 90 },
      { id: "transpilation", name: "Circuit Transpilation & Optimization", level: "Advanced", weight: 85 },
      { id: "hybrid-algorithms", name: "Hybrid Quantum-Classical (VQE/QAOA)", level: "Intermediate", weight: 80 },
      { id: "noise-mitigation", name: "Zero-Noise Extrapolation & Measurement Error Mitigation", level: "Intermediate", weight: 75 },
      { id: "linear-algebra", name: "Unitary Matrix Evolution & Linear Algebra", level: "Advanced", weight: 90 }
    ],
    startingMission: "mission-transpiler-opt"
  },
  {
    id: "quantum-algorithm-researcher",
    title: "Quantum Algorithm Researcher",
    icon: "🔬",
    description: "Design novel quantum speedup protocols, phase kickback oracles, Grover search variants, and Hamiltonian simulation algorithms.",
    requiredSkills: [
      { id: "phase-kickback", name: "Phase Kickback & Quantum Oracles", level: "Advanced", weight: 95 },
      { id: "grover-qft", name: "Grover Amplitude Amplification & QFT", level: "Advanced", weight: 90 },
      { id: "hamiltonian-sim", name: "Trotterized Hamiltonian Simulation", level: "Advanced", weight: 85 },
      { id: "complexity-theory", name: "BQP vs NP Quantum Complexity", level: "Intermediate", weight: 70 },
      { id: "linear-algebra", name: "Dirac Notation & Spectral Decomposition", level: "Advanced", weight: 95 }
    ],
    startingMission: "mission-grover-oracle"
  },
  {
    id: "quantum-hardware-engineer",
    title: "Quantum Hardware & Control Engineer",
    icon: "⚡",
    description: "Model physical superconducting & trapped-ion qubits, pulse-level control, T1/T2 decoherence, and cross-resonance gates.",
    requiredSkills: [
      { id: "bloch-dynamics", name: "Bloch Sphere & Hamiltonian Dynamics", level: "Advanced", weight: 90 },
      { id: "decoherence-noise", name: "T1 Relaxation & T2 Dephasing Noise Models", level: "Advanced", weight: 90 },
      { id: "pulse-control", name: "Microwave Pulse Calibration & DRAG", level: "Intermediate", weight: 80 },
      { id: "cross-resonance", name: "Two-Qubit Cross-Resonance Physics", level: "Intermediate", weight: 75 }
    ],
    startingMission: "mission-bloch-decoherence"
  },
  {
    id: "quantum-cryptography-specialist",
    title: "Quantum Cryptography Specialist",
    icon: "🔐",
    description: "Implement quantum key distribution (BB84, E91), quantum coin flipping, entanglement verification, and post-quantum transitions.",
    requiredSkills: [
      { id: "bb84-protocol", name: "BB84 Conjugate Coding & Basis Sifting", level: "Advanced", weight: 90 },
      { id: "e91-entanglement", name: "E91 Bell-Inequality Entanglement QKD", level: "Advanced", weight: 85 },
      { id: "privacy-amplification", name: "Quantum Bit Error Rate (QBER) & Privacy Amplification", level: "Intermediate", weight: 80 },
      { id: "qrng", name: "Quantum Random Number Generation (QRNG)", level: "Intermediate", weight: 75 }
    ],
    startingMission: "mission-bb84-eavesdrop"
  },
  {
    id: "quantum-ml-engineer",
    title: "Quantum Machine Learning Engineer",
    icon: "🧠",
    description: "Train Parameterized Quantum Circuits (PQCs), Quantum Kernel SVMs, Quantum Neural Networks (QNN), and navigate Barren Plateaus.",
    requiredSkills: [
      { id: "parameterized-circuits", name: "Parameterized Quantum Circuits (PQC)", level: "Advanced", weight: 95 },
      { id: "quantum-kernels", name: "Quantum Feature Maps & Hilbert Space Embeddings", level: "Advanced", weight: 90 },
      { id: "barren-plateaus", name: "Gradient Vanishing & Barren Plateau Mitigation", level: "Advanced", weight: 85 },
      { id: "variational-optimization", name: "COBYLA/Adam Variational Optimization", level: "Intermediate", weight: 80 }
    ],
    startingMission: "mission-qml-classifier"
  }
];

export const RESEARCH_DOMAINS = [
  {
    id: "qec-fault-tolerance",
    title: "Quantum Error Correction & Fault Tolerance",
    icon: "🛡️",
    description: "Surface code lattice surgery, stabilizer formalisms, syndrome extraction, and fault-tolerant logical gate synthesis.",
    landscapePapers: [
      { id: "p1", title: "Surface Codes: Towards Practical Large-Scale Quantum Computation", authors: "Fowler et al.", year: 2012, citations: 1840, keyContribution: "Demonstrates 2D nearest-neighbor surface code with threshold ~1% error rate.", limitations: "High physical-to-logical qubit overhead (>1000:1 for deep circuits)." },
      { id: "p2", title: "Fault-Tolerant Quantum Computation with Non-Abelian Anyons", authors: "Kitaev et al.", year: 2003, citations: 3200, keyContribution: "Topological protection of quantum information via braided non-Abelian anyons.", limitations: "Severe material fabrication and Majorana zero-mode verification challenges." }
    ],
    potentialGaps: [
      { id: "gap-qec-1", title: "Real-Time Neural Syndrome Decoding on FPGA Hardware", description: "Standard minimum-weight perfect matching decoders are too slow for microsecond QPU coherence cycles.", validationMethod: "Simulate real-time decoding pipeline with Clifford Tableau & benchmark latency vs error threshold." },
      { id: "gap-qec-2", title: "Low-Overhead Floquet Qubit Codes on Heavy-Hex Topologies", description: "Trade static syndrome checks for dynamic measurement schedules to reduce physical qubit requirements.", validationMethod: "Construct circuit schedule in Quantum Lab and evaluate distance d=3 vs d=5 code preservation." }
    ]
  },
  {
    id: "vqe-molecular-chemistry",
    title: "VQE & Molecular Quantum Chemistry",
    icon: "🧪",
    description: "Simulate electronic Hamiltonian ground states (H2, LiH, H2O) using Variational Quantum Eigensolvers with noise-resilient ansätze.",
    landscapePapers: [
      { id: "p3", title: "A Variational Eigenvalue Solver on a Photonic Quantum Processor", authors: "Peruzzo et al.", year: 2014, citations: 2100, keyContribution: "Pioneered the hybrid classical-quantum variational eigensolver framework.", limitations: "Susceptible to noise and optimizer stagnation in high-dimensional parameter spaces." },
      { id: "p4", title: "Strategies for Quantum Computing Molecular Properties", authors: "McArdle et al.", year: 2020, citations: 950, keyContribution: "Comprehensive review of Jordan-Wigner vs Bravyi-Kitaev qubit encodings.", limitations: "Trotter depth explodes for strongly correlated active spaces." }
    ],
    potentialGaps: [
      { id: "gap-vqe-1", title: "Adaptive Symmetry-Preserving Ansatz to Avoid Barren Plateaus", description: "Standard hardware-efficient ansätze suffer from exponential gradient decay; dynamic operator pooling (ADAPT-VQE) reduces circuit depth.", validationMethod: "Simulate H2 dissociation curve with ADAPT ansatz vs Hardware-Efficient Ansatz in VQE workbench." },
      { id: "gap-vqe-2", title: "Zero-Noise Extrapolation with Randomized Compiling for Ground State Energy", description: "Mitigate uncharacterized coherent gate errors by averaging over Pauli twirling instances.", validationMethod: "Inject depolarizing noise model and extrapolate E(0) energy." }
    ]
  },
  {
    id: "quantum-ml-qnn",
    title: "Quantum Neural Networks & Generative QML",
    icon: "🤖",
    description: "Quantum Kernel Methods, Quantum Generative Adversarial Networks (QGANs), and Quantum Transformer Architectures.",
    landscapePapers: [
      { id: "p5", title: "Supervised Learning with Quantum-Enhanced Feature Spaces", authors: "Havlicek et al. (Nature)", year: 2019, citations: 1600, keyContribution: "Proved quantum advantage for classification using non-classically simulable quantum kernels.", limitations: "Feature map selection is heuristic with no general kernel design guarantee." },
      { id: "p6", title: "Barren Plateaus in Quantum Neural Network Training Landscapes", authors: "McClean et al.", year: 2018, citations: 1420, keyContribution: "Showed gradient variance vanishes exponentially with qubit count for Haar-random circuits.", limitations: "Local cost functions alleviate but do not completely eliminate trainability hurdles." }
    ],
    potentialGaps: [
      { id: "gap-qml-1", title: "Layer-by-Layer Pre-training for Deep Quantum Convolutional Neural Networks", description: "Avoid barren plateaus by training localized two-qubit reduction layers sequentially before global fine-tuning.", validationMethod: "Compare loss gradient variance across 8 qubits with layerwise initialization." }
    ]
  },
  {
    id: "quantum-cryptography-qkd",
    title: "Quantum Key Distribution & Entanglement Networks",
    icon: "🌐",
    description: "Quantum repeater architectures, continuous-variable QKD, satellite quantum communication, and device-independent security.",
    landscapePapers: [
      { id: "p7", title: "Quantum Cryptography: Public Key Distribution and Coin Tossing", authors: "Bennett & Brassard", year: 1984, citations: 12000, keyContribution: "Original BB84 protocol leveraging no-cloning theorem for unconditional security.", limitations: "Channel attenuation limits terrestrial fiber distance to ~100 km without repeaters." }
    ],
    potentialGaps: [
      { id: "gap-qkd-1", title: "Decoy-State BB84 Optimization against Multi-Photon Splitting Attacks", description: "Dynamically calibrate signal vs decoy photon intensities according to real-time fiber Raman scattering noise.", validationMethod: "Simulate photon number channel splitting and verify secret key rate equation." }
    ]
  }
];

export const ACADEMIC_LEVELS = [
  {
    id: "beginner",
    title: "Beginner Track",
    icon: "⚛️",
    description: "Fundamental quantum principles: Superposition, Single-Qubit Gates (X, Y, Z, H), Measurement, and the Bloch Sphere.",
    targetMastery: "Foundations Mastery",
    modules: ["m1", "m2", "m3"]
  },
  {
    id: "intermediate",
    title: "Intermediate Track",
    icon: "🔗",
    description: "Multi-qubit systems, Entanglement (Bell States, GHZ), Quantum Teleportation, Superdense Coding, and Deutsch-Jozsa.",
    targetMastery: "Applied Quantum Systems",
    modules: ["m4", "m5", "m6"]
  },
  {
    id: "advanced",
    title: "Advanced Track",
    icon: "🛡️",
    description: "Quantum Fourier Transform (QFT), Grover Search Algorithm, Variational Quantum Eigensolver (VQE), and Error Correction.",
    targetMastery: "Expert Algorithm Architect",
    modules: ["m7", "m8", "m9"]
  }
];

// Service storage keys
const PURPOSE_STORAGE_KEY = "quantum_mastery_purpose";
const SKILL_GRAPH_STORAGE_KEY = "quantum_mastery_skill_graph";

export const purposeService = {
  getPurpose() {
    try {
      const data = localStorage.getItem(PURPOSE_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Failed to load purpose:", e);
    }
    // Default purpose is academic beginner
    return {
      type: "academic", // "job" | "research" | "academic"
      targetId: "beginner",
      title: "Academic — Beginner Track",
      selectedAt: new Date().toISOString()
    };
  },

  setPurpose(type, targetId) {
    let title = "Academic Track";
    let startingMission = "mission-bell-state";

    if (type === "job") {
      const role = JOB_ROLES.find(r => r.id === targetId);
      title = role ? `Career: ${role.title}` : "Job Role";
      startingMission = role?.startingMission || "mission-transpiler-opt";
    } else if (type === "research") {
      const domain = RESEARCH_DOMAINS.find(d => d.id === targetId);
      title = domain ? `Research: ${domain.title}` : "Research Domain";
      startingMission = "mission-grover-oracle";
    } else {
      const level = ACADEMIC_LEVELS.find(l => l.id === targetId);
      title = level ? `Academic: ${level.title}` : "Academic Track";
      startingMission = targetId === "advanced" ? "mission-qft-period" : (targetId === "intermediate" ? "mission-bell-state" : "mission-single-qubit");
    }

    const purpose = {
      type,
      targetId,
      title,
      startingMission,
      selectedAt: new Date().toISOString()
    };

    localStorage.setItem(PURPOSE_STORAGE_KEY, JSON.stringify(purpose));
    // Trigger dynamic skill recalculation
    const graph = this.recalculateSkillGraph(purpose);

    // Ensure course starts from beginning unless already completed
    const progressKey = `quantum_course_progress_${purpose.targetId || purpose.id}`;
    const existingProgress = localStorage.getItem(progressKey);
    if (!existingProgress) {
      // Initialize fresh course progress: Stage 1 active, 0%
      localStorage.setItem(progressKey, JSON.stringify({
        currentStage: 1,
        completedStages: [],
        isCompleted: false,
        startedAt: new Date().toISOString()
      }));
    }

    // Set active mission to the first stage of the new course
    if (typeof localStorage !== "undefined") {
      const firstMission = purpose.startingMission || "mission-bell-state";
      localStorage.setItem("quantum_mastery_active_mission_id", firstMission);
    }
    
    // Dispatch global event for instantaneous reactivity across the platform
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("quantum_destination_changed", {
        detail: { purpose, skillGraph: graph }
      }));
      window.dispatchEvent(new CustomEvent("quantum_diagnostic_updated", {
        detail: { purpose, skillGraph: graph }
      }));
    }
    return purpose;
  },

  getCourseProgress(targetId) {
    try {
      const key = `quantum_course_progress_${targetId}`;
      const data = localStorage.getItem(key);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Failed to get course progress:", e);
    }
    return { currentStage: 1, completedStages: [], isCompleted: false };
  },

  setCourseProgress(targetId, progressData) {
    try {
      const key = `quantum_course_progress_${targetId}`;
      localStorage.setItem(key, JSON.stringify(progressData));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("quantum_diagnostic_updated", {
          detail: { targetId, progress: progressData }
        }));
      }
    } catch (e) {
      console.warn("Failed to set course progress:", e);
    }
  },

  completeEntirePathway(targetId) {
    const progress = {
      currentStage: 5,
      completedStages: [1, 2, 3, 4, 5],
      isCompleted: true,
      completedAt: new Date().toISOString()
    };
    this.setCourseProgress(targetId, progress);
    return progress;
  },

  resetCourseToStart(targetId) {
    const progress = {
      currentStage: 1,
      completedStages: [],
      isCompleted: false,
      startedAt: new Date().toISOString()
    };
    this.setCourseProgress(targetId, progress);
    return progress;
  },

  getSkillGraph() {
    try {
      const data = localStorage.getItem(SKILL_GRAPH_STORAGE_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn("Failed to load skill graph:", e);
    }
    return this.recalculateSkillGraph(this.getPurpose());
  },

  updateSkillMastery(skillId, masteryPercent) {
    const graph = this.getSkillGraph();
    if (graph.skills && graph.skills[skillId]) {
      graph.skills[skillId].mastery = Math.min(100, Math.max(0, masteryPercent));
      graph.skills[skillId].status = graph.skills[skillId].mastery >= 75 ? "mastered" : (graph.skills[skillId].mastery >= 45 ? "in_progress" : "gap");
      
      const skillsList = Object.values(graph.skills);
      graph.overallMastery = Math.round(skillsList.reduce((acc, s) => acc + s.mastery, 0) / (skillsList.length || 1));
      graph.gapsCount = skillsList.filter(s => s.mastery < 45).length;
      graph.knownCreditsCount = skillsList.filter(s => s.mastery >= 75).length;
      graph.lastUpdated = new Date().toISOString();
      localStorage.setItem(SKILL_GRAPH_STORAGE_KEY, JSON.stringify(graph));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("quantum_diagnostic_updated", {
          detail: { skillId, mastery: masteryPercent, graph }
        }));
      }
    }
    return graph;
  },

  recalculateSkillGraph(purpose) {
    // Computes skills, known credits, gaps, and roadmap based on purpose
    let skillsList = [];
    if (purpose.type === "job") {
      const role = JOB_ROLES.find(r => r.id === purpose.targetId) || JOB_ROLES[0];
      skillsList = role.requiredSkills.map((s, idx) => ({
        id: s.id,
        name: s.name,
        targetLevel: s.level,
        weight: s.weight,
        mastery: idx === 0 ? 65 : (idx === 1 ? 40 : 25), // Dynamic initial baseline
        status: idx === 0 ? "in_progress" : (idx === 1 ? "in_progress" : "gap")
      }));
    } else if (purpose.type === "research") {
      const domain = RESEARCH_DOMAINS.find(d => d.id === purpose.targetId) || RESEARCH_DOMAINS[0];
      skillsList = [
        { id: "literature-analysis", name: "Literature & Methodology Analysis", targetLevel: "Advanced", weight: 90, mastery: 55, status: "in_progress" },
        { id: "domain-physics", name: `${domain.title} Theoretical Baseline`, targetLevel: "Advanced", weight: 95, mastery: 30, status: "gap" },
        { id: "simulation-validation", name: "Simulation Experimentation & Verification", targetLevel: "Advanced", weight: 85, mastery: 45, status: "in_progress" },
        { id: "gap-formulation", name: "Research Question & Hypothesis Formulation", targetLevel: "Advanced", weight: 80, mastery: 20, status: "gap" }
      ];
    } else {
      if (purpose.targetId === "advanced") {
        skillsList = [
          { id: "qft", name: "Quantum Fourier Transform (QFT)", targetLevel: "Advanced", weight: 95, mastery: 35, status: "gap" },
          { id: "grover-qft", name: "Grover Search Algorithm", targetLevel: "Advanced", weight: 90, mastery: 30, status: "gap" },
          { id: "vqe", name: "Variational Quantum Eigensolver (VQE)", targetLevel: "Advanced", weight: 85, mastery: 20, status: "gap" },
          { id: "qec", name: "Quantum Error Correction (Shor/Surface)", targetLevel: "Advanced", weight: 80, mastery: 15, status: "gap" }
        ];
      } else if (purpose.targetId === "intermediate") {
        skillsList = [
          { id: "entanglement", name: "Multi-Qubit Entanglement & Bell States", targetLevel: "Intermediate", weight: 90, mastery: 50, status: "in_progress" },
          { id: "teleportation", name: "Quantum Teleportation & Superdense Coding", targetLevel: "Intermediate", weight: 85, mastery: 35, status: "gap" },
          { id: "deutsch-jozsa", name: "Deutsch-Jozsa & Bernstein-Vazirani", targetLevel: "Intermediate", weight: 80, mastery: 40, status: "gap" },
          { id: "phase-kickback", name: "Phase Kickback & Controlled Operations", targetLevel: "Intermediate", weight: 90, mastery: 45, status: "in_progress" }
        ];
      } else {
        skillsList = [
          { id: "superposition", name: "Superposition & Statevectors", targetLevel: "Foundational", weight: 100, mastery: 75, status: "mastered" },
          { id: "quantum-gates", name: "Single Qubit Gates (X, Y, Z, H, S, T)", targetLevel: "Foundational", weight: 90, mastery: 65, status: "in_progress" },
          { id: "bloch-sphere", name: "Bloch Sphere 3D State Representation", targetLevel: "Foundational", weight: 85, mastery: 70, status: "in_progress" },
          { id: "measurement", name: "Quantum Measurement & Wavefunction Collapse", targetLevel: "Foundational", weight: 80, mastery: 35, status: "gap" }
        ];
      }
    }

    const skillsMap = {};
    skillsList.forEach(s => { skillsMap[s.id] = s; });

    const graph = {
      purpose,
      skills: skillsMap,
      overallMastery: Math.round(skillsList.reduce((acc, s) => acc + s.mastery, 0) / (skillsList.length || 1)),
      gapsCount: skillsList.filter(s => s.mastery < 45).length,
      knownCreditsCount: skillsList.filter(s => s.mastery >= 75).length,
      lastUpdated: new Date().toISOString()
    };

    localStorage.setItem(SKILL_GRAPH_STORAGE_KEY, JSON.stringify(graph));
    return graph;
  }
};
