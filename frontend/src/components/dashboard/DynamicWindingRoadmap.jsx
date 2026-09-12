import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { purposeService } from "../../services/purposeService";

// Dynamic Milestones generator per purpose & detected diagnostic gaps
function getMilestonesForPurpose(purpose, skillGraph) {
  const skills = skillGraph?.skills || {};
  const targetKey = purpose.targetId || purpose.id || "foundations";
  const courseProgress = purposeService.getCourseProgress(targetKey);
  const isCompleted = courseProgress.isCompleted;
  const currentStage = courseProgress.currentStage || 1;
  const completedStages = courseProgress.completedStages || [];

  const resolveStatus = (stepId, fallbackProgress, isGap = false) => {
    if (isCompleted || completedStages.includes(stepId)) {
      return { status: "completed", progress: 100 };
    }
    if (isGap) {
      return { status: "gap", progress: 25 };
    }
    if (stepId === currentStage) {
      return { status: "current", progress: fallbackProgress || 45 };
    }
    if (stepId < currentStage) {
      return { status: "completed", progress: 100 };
    }
    if (stepId === 5) {
      return { status: "goal", progress: 0 };
    }
    return { status: "upcoming", progress: 0 };
  };

  if (purpose.type === "job") {
    if (purpose.targetId === "quantum-software-engineer") {
      const isGapTranspiler = skills["transpilation"]?.status === "gap";
      return [
        { id: 1, title: "Qiskit & Linear Algebra", subtitle: "Unitary Evolution & Statevectors", ...resolveStatus(1, 65), icon: "📐", x: 80, y: 340 },
        { id: 2, title: "Circuit Transpilation", subtitle: isGapTranspiler ? "⚠️ Targeted Remediation Gap" : "Basis Gate Synthesis & Optimization", ...resolveStatus(2, 45, isGapTranspiler), icon: isGapTranspiler ? "⚠️" : "⚡", x: 230, y: 280 },
        { id: 3, title: "Multi-Qubit Entanglement", subtitle: "CNOT Routing & Noise Mitigation", ...resolveStatus(3, 0), icon: "🔗", x: 410, y: 220 },
        { id: 4, title: "Hybrid Quantum-Classical", subtitle: "VQE / QAOA Parameter Optimization", ...resolveStatus(4, 0), icon: "🤖", x: 600, y: 150 },
        { id: 5, title: "Production Quantum Engineer", subtitle: "Industrial Job Role Mastery", ...resolveStatus(5, 0), icon: "🏁", x: 780, y: 70 }
      ];
    } else if (purpose.targetId === "quantum-algorithm-researcher") {
      const isGapKickback = skills["phase-kickback"]?.status === "gap";
      return [
        { id: 1, title: "Dirac Notation & Hilbert Spaces", subtitle: "Spectral Decomposition", ...resolveStatus(1, 60), icon: "📐", x: 80, y: 340 },
        { id: 2, title: "Phase Kickback & Oracles", subtitle: isGapKickback ? "⚠️ Targeted Remediation Gap" : "Eigenvalue Inversion Circuits", ...resolveStatus(2, 40, isGapKickback), icon: isGapKickback ? "⚠️" : "🔍", x: 230, y: 280 },
        { id: 3, title: "Grover & QFT Algorithms", subtitle: "Amplitude Amplification", ...resolveStatus(3, 0), icon: "🚀", x: 410, y: 220 },
        { id: 4, title: "Hamiltonian Simulation", subtitle: "Trotterized Time Evolution", ...resolveStatus(4, 0), icon: "⚛️", x: 600, y: 150 },
        { id: 5, title: "Algorithm Researcher", subtitle: "Novel Quantum Speedup Design", ...resolveStatus(5, 0), icon: "🏁", x: 780, y: 70 }
      ];
    } else if (purpose.targetId === "quantum-cryptography-specialist") {
      return [
        { id: 1, title: "Quantum Physics & No-Cloning", subtitle: "State Indistinguishability", ...resolveStatus(1, 55), icon: "🔐", x: 80, y: 340 },
        { id: 2, title: "BB84 Conjugate Coding", subtitle: "Polarization Basis Sifting", ...resolveStatus(2, 45), icon: "📡", x: 230, y: 280 },
        { id: 3, title: "E91 Bell Entanglement QKD", subtitle: "CHSH Inequality Violation", ...resolveStatus(3, 0), icon: "🔗", x: 410, y: 220 },
        { id: 4, title: "QBER & Privacy Amplification", subtitle: "Information Theoretic Security", ...resolveStatus(4, 0), icon: "🛡️", x: 600, y: 150 },
        { id: 5, title: "Quantum Cryptography Specialist", subtitle: "Post-Quantum Transitions", ...resolveStatus(5, 0), icon: "🏁", x: 780, y: 70 }
      ];
    } else if (purpose.targetId === "quantum-ml-engineer") {
      return [
        { id: 1, title: "Hilbert Space Feature Maps", subtitle: "Quantum Embedding Circuits", ...resolveStatus(1, 60), icon: "🧠", x: 80, y: 340 },
        { id: 2, title: "Parameterized Quantum Circuits", subtitle: "Rotational Gate Layers (PQC)", ...resolveStatus(2, 40), icon: "⚡", x: 230, y: 280 },
        { id: 3, title: "Barren Plateau Mitigation", subtitle: "Gradient Variance Preservation", ...resolveStatus(3, 0), icon: "📉", x: 410, y: 220 },
        { id: 4, title: "Quantum Kernel SVMs", subtitle: "Classification Advantage", ...resolveStatus(4, 0), icon: "🎯", x: 600, y: 150 },
        { id: 5, title: "Quantum ML Engineer", subtitle: "Hybrid QNN Pipeline Ready", ...resolveStatus(5, 0), icon: "🏁", x: 780, y: 70 }
      ];
    } else {
      return [
        { id: 1, title: "Superconducting Qubits", subtitle: "Planar Transmon Physics", ...resolveStatus(1, 60), icon: "⚡", x: 80, y: 340 },
        { id: 2, title: "Decoherence Noise Models", subtitle: "T1 Relaxation & T2 Dephasing", ...resolveStatus(2, 35), icon: "📉", x: 230, y: 280 },
        { id: 3, title: "Microwave Pulse Control", subtitle: "DRAG Pulse Calibration", ...resolveStatus(3, 0), icon: "📡", x: 410, y: 220 },
        { id: 4, title: "Cross-Resonance Interaction", subtitle: "Two-Qubit All-Microwave Gates", ...resolveStatus(4, 0), icon: "🔬", x: 600, y: 150 },
        { id: 5, title: "Quantum Hardware Specialist", subtitle: "Physical QPU Operation Ready", ...resolveStatus(5, 0), icon: "🏁", x: 780, y: 70 }
      ];
    }
  } else if (purpose.type === "research") {
    if (purpose.targetId === "qec-fault-tolerance") {
      return [
        { id: 1, title: "Surface Code Lattice", subtitle: "Stabilizers & Syndrome Operators", ...resolveStatus(1, 60), icon: "🛡️", x: 80, y: 340 },
        { id: 2, title: "Real-Time Neural Decoding", subtitle: "FPGA Low-Latency Synergies", ...resolveStatus(2, 40), icon: "🧠", x: 230, y: 280 },
        { id: 3, title: "Floquet Measurement Codes", subtitle: "Dynamic Schedule Topological Surgery", ...resolveStatus(3, 0), icon: "📐", x: 410, y: 220 },
        { id: 4, title: "Logical Qubit Distance Proof", subtitle: "d=3 vs d=5 Error Suppression", ...resolveStatus(4, 0), icon: "🧪", x: 600, y: 150 },
        { id: 5, title: "Fault-Tolerant Research Discovery", subtitle: "Preprint Ready for Submission", ...resolveStatus(5, 0), icon: "🏁", x: 780, y: 70 }
      ];
    } else if (purpose.targetId === "vqe-molecular-chemistry") {
      return [
        { id: 1, title: "Molecular Electronic Hamiltonian", subtitle: "Fermionic Operator Creation", ...resolveStatus(1, 60), icon: "🧪", x: 80, y: 340 },
        { id: 2, title: "Jordan-Wigner Qubit Mapping", subtitle: "Pauli String Decomposition", ...resolveStatus(2, 45), icon: "⚛️", x: 230, y: 280 },
        { id: 3, title: "ADAPT-VQE Dynamic Ansatz", subtitle: "Operator Pool Gradient Optimization", ...resolveStatus(3, 0), icon: "⚡", x: 410, y: 220 },
        { id: 4, title: "Zero-Noise Energy Extrapolation", subtitle: "H2 & LiH Dissociation Curves", ...resolveStatus(4, 0), icon: "🔬", x: 600, y: 150 },
        { id: 5, title: "Molecular Chemistry Discovery", subtitle: "Preprint Ready for Submission", ...resolveStatus(5, 0), icon: "🏁", x: 780, y: 70 }
      ];
    } else if (purpose.targetId === "quantum-ml-qnn") {
      return [
        { id: 1, title: "Quantum Kernel Embeddings", subtitle: "Non-Linear Hilbert Feature Maps", ...resolveStatus(1, 60), icon: "🤖", x: 80, y: 340 },
        { id: 2, title: "Barren Plateau Analysis", subtitle: "Gradient Variance Decay Mitigation", ...resolveStatus(2, 40), icon: "📉", x: 230, y: 280 },
        { id: 3, title: "Layerwise QNN Pretraining", subtitle: "2-Qubit Reduction Layer Training", ...resolveStatus(3, 0), icon: "🧠", x: 410, y: 220 },
        { id: 4, title: "Generative QGAN Benchmark", subtitle: "Quantum Sample Distribution Fidelity", ...resolveStatus(4, 0), icon: "🎯", x: 600, y: 150 },
        { id: 5, title: "QML Research Discovery", subtitle: "Preprint Ready for Submission", ...resolveStatus(5, 0), icon: "🏁", x: 780, y: 70 }
      ];
    } else {
      return [
        { id: 1, title: "Decoy-State BB84 Architecture", subtitle: "Multi-Photon Splitting Mitigation", ...resolveStatus(1, 60), icon: "🌐", x: 80, y: 340 },
        { id: 2, title: "E91 Entanglement CHSH Test", subtitle: "Device-Independent Security", ...resolveStatus(2, 45), icon: "🔐", x: 230, y: 280 },
        { id: 3, title: "Quantum Repeater Teleportation", subtitle: "Long-Haul Fiber Entanglement Swapping", ...resolveStatus(3, 0), icon: "📡", x: 410, y: 220 },
        { id: 4, title: "Secret Key Rate Simulation", subtitle: "QBER Noise vs Distance Curves", ...resolveStatus(4, 0), icon: "🛡️", x: 600, y: 150 },
        { id: 5, title: "Quantum Network Discovery", subtitle: "Preprint Ready for Submission", ...resolveStatus(5, 0), icon: "🏁", x: 780, y: 70 }
      ];
    }
  } else {
    // Academic track
    if (purpose.targetId === "advanced") {
      return [
        { id: 1, title: "Quantum Fourier Transform", subtitle: "Phase Estimation & Period Finding", ...resolveStatus(1, 60), icon: "⚡", x: 80, y: 340 },
        { id: 2, title: "Grover Search Algorithm", subtitle: "Oracle & Diffusion Operators", ...resolveStatus(2, 40), icon: "🎯", x: 230, y: 280 },
        { id: 3, title: "Variational Eigensolver", subtitle: "Molecular Ground States (VQE)", ...resolveStatus(3, 0), icon: "🧪", x: 410, y: 220 },
        { id: 4, title: "Surface Code Error Correction", subtitle: "Stabilizer Syndrome Extraction", ...resolveStatus(4, 0), icon: "🛡️", x: 600, y: 150 },
        { id: 5, title: "Advanced Quantum Mastery", subtitle: "Comprehensive Algorithmic Fluency", ...resolveStatus(5, 0), icon: "🎓", x: 780, y: 70 }
      ];
    } else if (purpose.targetId === "intermediate") {
      const isGapEntanglement = skills["entanglement"]?.status === "gap";
      return [
        { id: 1, title: "Multi-Qubit States & Tensor Products", subtitle: "Composite Statevectors", ...resolveStatus(1, 60), icon: "📐", x: 80, y: 340 },
        { id: 2, title: "Entanglement & Bell States", subtitle: isGapEntanglement ? "⚠️ Targeted Remediation Gap" : "Hadamard-CNOT Coupled Pairs", ...resolveStatus(2, 50, isGapEntanglement), icon: isGapEntanglement ? "⚠️" : "🔗", x: 230, y: 280 },
        { id: 3, title: "Quantum Teleportation", subtitle: "State Transfer via EPR Channel", ...resolveStatus(3, 0), icon: "✨", x: 410, y: 220 },
        { id: 4, title: "Quantum Oracles & Deutsch-Jozsa", subtitle: "Constant vs Balanced Evaluation", ...resolveStatus(4, 0), icon: "🔍", x: 600, y: 150 },
        { id: 5, title: "Intermediate Certification", subtitle: "Applied Systems Ready", ...resolveStatus(5, 0), icon: "🎓", x: 780, y: 70 }
      ];
    } else {
      return [
        { id: 1, title: "Foundations & Superposition", subtitle: "Qubits, Dirac Notation, |0⟩ & |1⟩", ...resolveStatus(1, 65), icon: "🌱", x: 80, y: 340 },
        { id: 2, title: "Single Qubit Gates", subtitle: "Pauli X, Y, Z and Hadamard H", ...resolveStatus(2, 50), icon: "⚡", x: 230, y: 280 },
        { id: 3, title: "Bloch Sphere Dynamics", subtitle: "State Rotations (θ, φ)", ...resolveStatus(3, 0), icon: "🌐", x: 410, y: 220 },
        { id: 4, title: "Quantum Measurement", subtitle: "Wavefunction Collapse & Born Rule", ...resolveStatus(4, 0), icon: "📊", x: 600, y: 150 },
        { id: 5, title: "Foundations Mastery", subtitle: "Core Physics Fluency", ...resolveStatus(5, 0), icon: "🎓", x: 780, y: 70 }
      ];
    }
  }
}

export default function DynamicWindingRoadmap() {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState(purposeService.getPurpose());
  const [skillGraph, setSkillGraph] = useState(purposeService.getSkillGraph());
  const [milestones, setMilestones] = useState(() => getMilestonesForPurpose(purposeService.getPurpose(), purposeService.getSkillGraph()));
  const [activeHoverNode, setActiveHoverNode] = useState(null);

  useEffect(() => {
    const updateRoadmap = () => {
      const curPurpose = purposeService.getPurpose();
      const curGraph = purposeService.getSkillGraph();
      setPurpose(curPurpose);
      setSkillGraph(curGraph);
      setMilestones(getMilestonesForPurpose(curPurpose, curGraph));
    };

    updateRoadmap();

    window.addEventListener("quantum_destination_changed", updateRoadmap);
    window.addEventListener("quantum_diagnostic_updated", updateRoadmap);

    return () => {
      window.removeEventListener("quantum_destination_changed", updateRoadmap);
      window.removeEventListener("quantum_diagnostic_updated", updateRoadmap);
    };
  }, []);

  const handleNodeClick = (node) => {
    if (node.status === "gap" || node.status === "current") {
      navigate("/learner/mission");
    } else {
      navigate("/learner/learn");
    }
  };

  const completedCount = milestones.filter(m => m.status === "completed").length;
  const inProgressCount = milestones.filter(m => m.status === "current" || m.status === "gap").length;
  const upcomingCount = milestones.filter(m => m.status === "upcoming" || m.status === "goal").length;

  return (
    <div className="pf-glass-card-glow" style={{
      padding: "28px 32px",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* ── ROADMAP HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "1rem" }}>🛣️</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#2563EB", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              DYNAMIC ISOMETRIC ROADMAP
            </span>
            <span style={{ fontSize: "0.72rem", backgroundColor: "#EFF6FF", color: "#1E40AF", padding: "3px 10px", borderRadius: "12px", fontWeight: 800, border: "1px solid #BFDBFE" }}>
              {purpose.type === "job" ? "Career Track" : purpose.type === "research" ? "Research Track" : "Academic Track"}
            </span>
          </div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
            {purpose.title} Dynamic Pathway
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#475569", margin: 0 }}>
            Curriculum, milestones, and challenges re-synthesize in real-time as you switch goals or diagnose skill gaps.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            onClick={() => navigate("/learner/mission")}
            className="pf-btn-azure"
            style={{
              padding: "10px 22px",
              borderRadius: "12px",
              fontSize: "0.85rem",
              fontWeight: 800,
              cursor: "pointer"
            }}
          >
            Launch Active Mission ➔
          </button>
        </div>
      </div>

      {/* ── METRIC PROGRESS STRIP (FROSTED GLASS CAPSULE) ── */}
      <div style={{
        display: "flex",
        gap: "24px",
        padding: "12px 22px",
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(12px)",
        borderRadius: "14px",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        marginBottom: "24px",
        flexWrap: "wrap",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.02)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#16A34A", boxShadow: "0 0 8px rgba(22, 163, 74, 0.5)" }} />
          <span style={{ fontSize: "0.82rem", color: "#475569" }}>Completed: <strong style={{ color: "#0F172A" }}>{completedCount} Stage</strong></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#2563EB", boxShadow: "0 0 8px rgba(37, 99, 235, 0.5)" }} />
          <span style={{ fontSize: "0.82rem", color: "#475569" }}>Active Target: <strong style={{ color: "#0F172A" }}>{inProgressCount} Stage</strong></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#D97706", boxShadow: "0 0 8px rgba(217, 119, 6, 0.4)" }} />
          <span style={{ fontSize: "0.82rem", color: "#475569" }}>Ahead: <strong style={{ color: "#0F172A" }}>{upcomingCount} Stages</strong></span>
        </div>
      </div>

      {/* ── ISOMETRIC WINDING ROADMAP SVG CANVAS (FROSTED GLASS CANVAS) ── */}
      <div style={{
        position: "relative",
        width: "100%",
        height: "420px",
        background: "linear-gradient(180deg, rgba(240, 248, 255, 0.6) 0%, rgba(255, 255, 255, 0.45) 100%)",
        backdropFilter: "blur(16px)",
        borderRadius: "18px",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        overflow: "hidden",
        boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.9)"
      }}>
        <svg viewBox="0 0 900 420" style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}>
          <defs>
            <linearGradient id="roadGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="roadBedGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.4" />
            </linearGradient>
            <filter id="nodeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* S-Shaped Winding Highway Bed */}
          <path
            d="M 80 340 C 180 340, 160 280, 230 280 C 330 280, 310 220, 410 220 C 510 220, 490 150, 600 150 C 700 150, 680 70, 780 70"
            fill="none"
            stroke="url(#roadBedGrad)"
            strokeWidth="32"
            strokeLinecap="round"
          />

          {/* Main Glowing Quantum Path */}
          <path
            d="M 80 340 C 180 340, 160 280, 230 280 C 330 280, 310 220, 410 220 C 510 220, 490 150, 600 150 C 700 150, 680 70, 780 70"
            fill="none"
            stroke="url(#roadGrad)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Dashed Center Guidance Line */}
          <path
            d="M 80 340 C 180 340, 160 280, 230 280 C 330 280, 310 220, 410 220 C 510 220, 490 150, 600 150 C 700 150, 680 70, 780 70"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeDasharray="6 8"
            strokeLinecap="round"
          />

          {/* Interactive Milestone Nodes */}
          {milestones.map((node) => {
            const isCompleted = node.status === "completed";
            const isCurrent = node.status === "current";
            const isGap = node.status === "gap";
            const isGoal = node.status === "goal";

            const nodeBg = isCompleted ? "#16A34A" : isGap ? "#DC2626" : isCurrent ? "#2563EB" : isGoal ? "#D97706" : "#FFFFFF";
            const nodeBorder = isCompleted ? "#BBF7D0" : isGap ? "#FECACA" : isCurrent ? "#BFDBFE" : isGoal ? "#FDE68A" : "#CBD5E1";

            return (
              <g
                key={node.id}
                onClick={() => handleNodeClick(node)}
                onMouseEnter={() => setActiveHoverNode(node)}
                onMouseLeave={() => setActiveHoverNode(null)}
                style={{ cursor: "pointer", transition: "transform 0.2s" }}
              >
                {/* Pulse ring on current / gap node */}
                {(isCurrent || isGap) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="28"
                    fill="none"
                    stroke={isGap ? "#EF4444" : "#2563EB"}
                    strokeWidth="2.5"
                    opacity="0.6"
                  >
                    <animate attributeName="r" values="24;36;24" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Node Base Shadow */}
                <circle cx={node.x} cy={node.y + 4} r="20" fill="rgba(15, 23, 42, 0.12)" />

                {/* Main Node Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="20"
                  fill={nodeBg}
                  stroke={nodeBorder}
                  strokeWidth="3.5"
                  filter="url(#nodeGlow)"
                />

                {/* Milestone Icon */}
                <text
                  x={node.x}
                  y={node.y + 5}
                  textAnchor="middle"
                  fontSize="14"
                  fill={isCompleted || isCurrent || isGap ? "#FFFFFF" : "#0F172A"}
                  fontWeight="bold"
                >
                  {isCompleted ? "✓" : node.icon}
                </text>

                {/* Stage Label Below */}
                <text
                  x={node.x}
                  y={node.y + 36}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="800"
                  fill="#0F172A"
                >
                  {node.title}
                </text>

                {/* Subtitle / Remediation Badge */}
                <text
                  x={node.x}
                  y={node.y + 50}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isGap ? "800" : "600"}
                  fill={isGap ? "#DC2626" : "#64748B"}
                >
                  {node.subtitle}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Popover Tooltip */}
        {activeHoverNode && (
          <div style={{
            position: "absolute",
            top: `${Math.max(10, activeHoverNode.y - 95)}px`,
            left: `${Math.min(680, Math.max(20, activeHoverNode.x - 110))}px`,
            backgroundColor: "#FFFFFF",
            border: activeHoverNode.status === "gap" ? "2px solid #EF4444" : "1px solid #CBD5E1",
            borderRadius: "12px",
            padding: "10px 14px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
            pointerEvents: "none",
            zIndex: 10,
            width: "220px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: activeHoverNode.status === "gap" ? "#DC2626" : "#3A68A4", textTransform: "uppercase" }}>
                {activeHoverNode.status === "gap" ? "⚠️ Diagnostic Weakness" : `Stage ${activeHoverNode.id}`}
              </span>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#16A34A" }}>
                {activeHoverNode.progress}% Done
              </span>
            </div>
            <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#0C0D12" }}>
              {activeHoverNode.title}
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "2px" }}>
              {activeHoverNode.subtitle}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
