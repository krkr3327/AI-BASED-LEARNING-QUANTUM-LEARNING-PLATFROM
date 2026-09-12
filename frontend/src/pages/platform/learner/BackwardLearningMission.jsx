import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { backwardLearningService, MISSIONS_DATABASE } from "../../../services/backwardLearningService";
import { purposeService } from "../../../services/purposeService";
import EntanglementBridge3D from "../../../components/quantum3d/EntanglementBridge3D";

export default function BackwardLearningMission() {
  const navigate = useNavigate();

  // State
  const [purpose, setPurpose] = useState(purposeService.getPurpose());
  const [activeMission, setActiveMission] = useState(MISSIONS_DATABASE[0]);
  const [circuitGates, setCircuitGates] = useState([]);
  const [selectedGate, setSelectedGate] = useState("H");
  const [selectedQubit, setSelectedQubit] = useState(0);
  const [controlQubit, setControlQubit] = useState(0);
  const [targetQubit, setTargetQubit] = useState(1);

  // Flow states: 'challenge' | 'evaluating' | 'passed' | 'diagnostic_gap' | 'targeted_learning' | 'mini_quiz' | 'quantum_lab'
  const [flowStage, setFlowStage] = useState("challenge");
  const [attemptResult, setAttemptResult] = useState(null);

  // Video playback simulation
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);

  // Quiz state
  const [quizSelectedOption, setQuizSelectedOption] = useState(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  // Sandbox simulation in Stage 6
  const [labSimulated, setLabSimulated] = useState(false);

  useEffect(() => {
    const updateMission = () => {
      const curPurpose = purposeService.getPurpose();
      setPurpose(curPurpose);
      const nextAction = backwardLearningService.getNextBestAction();
      if (nextAction?.mission) {
        setActiveMission(nextAction.mission);
      }
    };
    updateMission();
    window.addEventListener("quantum_destination_changed", updateMission);
    return () => window.removeEventListener("quantum_destination_changed", updateMission);
  }, []);

  // Update course progress in roadmap
  const recordStageCompletion = () => {
    const curPurpose = purposeService.getPurpose();
    const targetKey = curPurpose.targetId || curPurpose.id || "foundations";
    const curProgress = purposeService.getCourseProgress(targetKey);
    const currentStage = curProgress.currentStage || 1;
    const updatedCompletedStages = Array.from(new Set([...(curProgress.completedStages || []), currentStage]));
    const nextStage = Math.min(5, currentStage + 1);
    const isAllComplete = updatedCompletedStages.length >= 5;

    purposeService.setCourseProgress(targetKey, {
      currentStage: nextStage,
      completedStages: updatedCompletedStages,
      isCompleted: isAllComplete,
      lastUpdated: new Date().toISOString()
    });

    if (activeMission?.targetSkillId) {
      purposeService.updateSkillMastery(activeMission.targetSkillId, 92);
    }
  };

  // Add Gate to Circuit
  const handleAddGate = () => {
    if (selectedGate === "CNOT" || selectedGate === "CZ") {
      if (controlQubit === targetQubit) {
        alert("Control and target qubits must be distinct.");
        return;
      }
      setCircuitGates(prev => [...prev, { gate: selectedGate, control: controlQubit, target: targetQubit, id: Date.now() }]);
    } else {
      setCircuitGates(prev => [...prev, { gate: selectedGate, qubit: selectedQubit, id: Date.now() }]);
    }
  };

  const handleRemoveGate = (id) => {
    setCircuitGates(prev => prev.filter(g => g.id !== id));
  };

  const handleClearCircuit = () => {
    setCircuitGates([]);
  };

  // Run Challenge First Attempt
  const handleRunAttempt = () => {
    setFlowStage("evaluating");
    setTimeout(() => {
      const result = backwardLearningService.evaluateAttempt(activeMission.id, circuitGates);
      setAttemptResult(result);
      if (result.passed) {
        recordStageCompletion();
        setFlowStage("passed");
      } else {
        setFlowStage("diagnostic_gap");
      }
    }, 1200);
  };

  // Auto-fill correct circuit in sandbox lab
  const handleApplyRecommendedCircuit = () => {
    if (activeMission.correctCircuit) {
      setCircuitGates(activeMission.correctCircuit.map((g, idx) => ({ ...g, id: Date.now() + idx })));
    }
  };

  // Re-attempt after learning
  const handleReattempt = () => {
    setFlowStage("challenge");
  };

  // Select next mission in database
  const handleNextMission = (missionId) => {
    const currentIdx = MISSIONS_DATABASE.findIndex(m => m.id === activeMission.id);
    const nextMission = missionId 
      ? (MISSIONS_DATABASE.find(m => m.id === missionId) || MISSIONS_DATABASE[0])
      : (MISSIONS_DATABASE[(currentIdx + 1) % MISSIONS_DATABASE.length] || MISSIONS_DATABASE[0]);

    setActiveMission(nextMission);
    setCircuitGates([]);
    setFlowStage("challenge");
    setAttemptResult(null);
    setQuizSelectedOption(null);
    setQuizAnswered(false);
    setLabSimulated(false);
  };

  const targetedLearning = activeMission.diagnosticPackage?.targetedLearning || {};
  const videoData = targetedLearning.video || {
    title: "Quantum State Superposition & Entanglement Principles",
    duration: "4m 15s",
    videoUrl: "https://www.youtube-nocookie.com/embed/1Z8f_tZ7c7w",
    keyTakeaway: "Entanglement is synthesized when superposed control qubits conditionally flip target states."
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "60px", color: "#0F172A", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* ── TOP BANNER: BACKWARD LEARNING ROADMAP ── */}
      <div style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
        border: "1px solid #CBD5E1",
        borderRadius: "16px",
        padding: "24px 28px",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "1.3rem" }}>🎯</span>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#2563EB", fontWeight: 800 }}>
              DYNAMIC BACKWARD LEARNING ENGINE
            </span>
            <span style={{ backgroundColor: "#EFF6FB", color: "#2563EB", border: "1px solid #BFDBFE", padding: "2px 8px", borderRadius: "10px", fontSize: "0.72rem", fontWeight: 800 }}>
              CHALLENGE-FIRST PARADIGM
            </span>
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px 0", color: "#0F172A" }}>
            {activeMission.title}
          </h1>
          <p style={{ color: "#475569", margin: 0, fontSize: "0.9rem" }}>
            Active Track: <strong>{purpose.title}</strong> • Skill Focus: <strong>{activeMission.category}</strong>
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => navigate("/learner/lab")}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
              border: "none",
              borderRadius: "10px",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
            }}
          >
            ⚛️ Open Quantum Lab
          </button>
        </div>
      </div>

      {/* ── BACKWARD LEARNING 7-STAGE PROGRESS STEPPER ── */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "14px",
        padding: "12px 18px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        overflowX: "auto",
        gap: "8px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)"
      }}>
        {[
          { stage: "challenge", label: "1. Challenge First", icon: "🎯" },
          { stage: "evaluating", label: "2. Attempt Task", icon: "⚡" },
          { stage: "diagnostic_gap", label: "3. Diagnostic AI & Gap", icon: "⚠️" },
          { stage: "targeted_learning", label: "4. Targeted Learning", icon: "📚" },
          { stage: "mini_quiz", label: "5. Mini Quiz Practice", icon: "📝" },
          { stage: "quantum_lab", label: "6. Lab Experiment", icon: "🧪" },
          { stage: "passed", label: "7. Certified Mastery", icon: "🏆" }
        ].map((step, idx) => {
          const isActive = flowStage === step.stage;
          return (
            <React.Fragment key={step.stage}>
              <div 
                onClick={() => {
                  // Allow navigating between learned stages
                  if (step.stage === "challenge" || step.stage === "diagnostic_gap" || step.stage === "targeted_learning" || step.stage === "mini_quiz" || step.stage === "quantum_lab") {
                    setFlowStage(step.stage);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  whiteSpace: "nowrap",
                  fontSize: "0.825rem",
                  fontWeight: isActive ? 800 : 600,
                  color: isActive ? "#2563EB" : "#64748B",
                  padding: "6px 12px",
                  borderRadius: "8px",
                  backgroundColor: isActive ? "#EFF6FB" : "transparent",
                  border: isActive ? "1px solid #BFDBFE" : "1px solid transparent",
                  cursor: "pointer"
                }}
              >
                <span>{step.icon}</span>
                <span>{step.label}</span>
              </div>
              {idx < 6 && <span style={{ color: "#CBD5E1", fontSize: "0.8rem" }}>→</span>}
            </React.Fragment>
          );
        })}
      </div>

      {/* ── STAGE 1: CHALLENGE FIRST ATTEMPT SCREEN ── */}
      {(flowStage === "challenge" || flowStage === "evaluating") && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
          
          {/* Left: Challenge Brief */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #CBD5E1",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <span style={{ backgroundColor: "#EFF6FB", color: "#2563EB", border: "1px solid #BFDBFE", padding: "4px 10px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: 800 }}>
                Tier: {activeMission.tier}
              </span>
              <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600 }}>
                Max Allowed Gates: {activeMission.maxGates}
              </span>
            </div>

            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 10px 0", color: "#0F172A" }}>
              Mission Objective
            </h2>
            <p style={{ color: "#475569", fontSize: "0.925rem", lineHeight: "1.6", marginBottom: "20px" }}>
              {activeMission.description}
            </p>

            <div style={{ backgroundColor: "#EFF6FB", border: "1px solid #BFDBFE", borderRadius: "12px", padding: "16px", marginBottom: "20px", borderLeft: "4px solid #2563EB" }}>
              <div style={{ fontSize: "0.72rem", color: "#1E40AF", textTransform: "uppercase", fontWeight: 800 }}>TARGET OUTPUT REQUIREMENT:</div>
              <div style={{ fontSize: "0.875rem", color: "#0F172A", marginTop: "4px", fontWeight: 600 }}>{activeMission.objective}</div>
            </div>

            <div style={{ backgroundColor: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: "12px", padding: "14px", color: "#92400E", fontSize: "0.85rem" }}>
              <strong>💡 STRATEGY HINT:</strong> {activeMission.hints?.[0] || "Explore superposition and multi-qubit entanglement interactions."}
            </div>
          </div>

          {/* Right: Quantum Circuit Construction Arena */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #CBD5E1",
            borderRadius: "16px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 2px 8px rgba(15, 23, 42, 0.03)"
          }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 16px 0", color: "#0F172A", display: "flex", alignItems: "center", gap: "8px" }}>
                <span>⚡</span>
                <span>Build &amp; Attempt Circuit</span>
              </h2>

              {/* Gate Picker Palette */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
                {["H", "X", "Y", "Z", "CNOT", "CZ", "S", "T"].map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGate(g)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      backgroundColor: selectedGate === g ? "#2563EB" : "#F8FAFC",
                      color: selectedGate === g ? "#FFFFFF" : "#1E293B",
                      border: selectedGate === g ? "1px solid #1E40AF" : "1px solid #CBD5E1",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Target Qubit Selector */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
                {selectedGate === "CNOT" || selectedGate === "CZ" ? (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>Control:</span>
                      <select
                        value={controlQubit}
                        onChange={(e) => setControlQubit(Number(e.target.value))}
                        style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", color: "#0F172A" }}
                      >
                        <option value={0}>q[0]</option>
                        <option value={1}>q[1]</option>
                      </select>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>Target:</span>
                      <select
                        value={targetQubit}
                        onChange={(e) => setTargetQubit(Number(e.target.value))}
                        style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", color: "#0F172A" }}
                      >
                        <option value={0}>q[0]</option>
                        <option value={1}>q[1]</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 700 }}>Target Qubit:</span>
                    <select
                      value={selectedQubit}
                      onChange={(e) => setSelectedQubit(Number(e.target.value))}
                      style={{ padding: "6px 10px", borderRadius: "8px", backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", color: "#0F172A" }}
                    >
                      <option value={0}>q[0]</option>
                      <option value={1}>q[1]</option>
                    </select>
                  </div>
                )}

                <button
                  onClick={handleAddGate}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#16A34A",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  + Add Gate
                </button>
              </div>

              {/* Submitted Gates Sequence Canvas */}
              <div style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                padding: "16px",
                minHeight: "130px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                alignItems: "center"
              }}>
                {circuitGates.length === 0 ? (
                  <span style={{ color: "#64748B", fontSize: "0.85rem", fontStyle: "italic" }}>
                    No gates added yet. Choose gates and press Attempt Challenge!
                  </span>
                ) : (
                  circuitGates.map((g) => (
                    <div
                      key={g.id}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #2563EB",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        color: "#1E40AF",
                        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.05)"
                      }}
                    >
                      <span>
                        {g.gate} {g.gate === "CNOT" || g.gate === "CZ" ? `(c:${g.control}, t:${g.target})` : `(q:${g.qubit})`}
                      </span>
                      <button
                        onClick={() => handleRemoveGate(g.id)}
                        style={{ background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontWeight: 900, padding: 0 }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
              <button
                onClick={handleClearCircuit}
                style={{
                  padding: "10px 16px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "8px",
                  color: "#64748B",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                Clear
              </button>

              <button
                onClick={handleRunAttempt}
                disabled={flowStage === "evaluating"}
                style={{
                  padding: "12px 28px",
                  background: flowStage === "evaluating" ? "#94A3B8" : "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
                  border: "none",
                  borderRadius: "10px",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  fontSize: "0.95rem",
                  cursor: flowStage === "evaluating" ? "wait" : "pointer",
                  boxShadow: "0 4px 15px rgba(37, 99, 235, 0.25)"
                }}
              >
                {flowStage === "evaluating" ? "⚡ Evaluating Quantum State..." : "🚀 Attempt Challenge"}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── STAGE 3: DIAGNOSTIC AI KNOWLEDGE GAP IDENTIFIED ── */}
      {flowStage === "diagnostic_gap" && (
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #FCA5A5",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 4px 20px rgba(239, 68, 68, 0.08)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span style={{ fontSize: "1.8rem" }}>🔍</span>
            <span style={{ fontSize: "0.8rem", color: "#DC2626", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              DIAGNOSTIC AI • KNOWLEDGE GAP DETECTED
            </span>
          </div>

          <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#0F172A", margin: "0 0 12px 0" }}>
            Gap: {activeMission.diagnosticPackage?.gapIdentified || "Quantum State Manipulation"}
          </h2>

          <div style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA", padding: "18px", borderRadius: "12px", borderLeft: "4px solid #DC2626", marginBottom: "24px" }}>
            <div style={{ fontSize: "0.75rem", color: "#B91C1C", fontWeight: 800, textTransform: "uppercase" }}>AI Root-Cause Diagnosis:</div>
            <p style={{ color: "#0F172A", fontSize: "0.95rem", lineHeight: "1.6", margin: "6px 0 0 0" }}>
              {activeMission.diagnosticPackage?.diagnosticExplanation || "The current circuit output does not match target statevector fidelity."}
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => setFlowStage("targeted_learning")}
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
                border: "none",
                borderRadius: "10px",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.9rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
              }}
            >
              📚 Open Targeted Remediation (Video &amp; Theory) ➔
            </button>
            <button
              onClick={handleReattempt}
              style={{
                padding: "12px 20px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "10px",
                color: "#1E293B",
                fontWeight: 700,
                fontSize: "0.9rem",
                cursor: "pointer"
              }}
            >
              Retry Challenge First
            </button>
          </div>
        </div>
      )}

      {/* ── STAGE 4: TARGETED LEARNING (VIDEO, THEORY, 3D LAB, NOTES) ── */}
      {flowStage === "targeted_learning" && (
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #CBD5E1",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)"
        }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "10px", backgroundColor: "#EFF6FB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>
                📚
              </div>
              <div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 800, margin: 0, color: "#0F172A" }}>
                  Targeted Micro-Lesson: {targetedLearning.theory?.title || "Quantum State Synthesis"}
                </h2>
                <span style={{ fontSize: "0.82rem", color: "#64748B" }}>Curated specifically by AI to bridge your identified knowledge gap</span>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setFlowStage("mini_quiz")}
                style={{
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#FFF",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)"
                }}
              >
                Continue to Mini Quiz ➔
              </button>
            </div>
          </div>

          {/* Video Section */}
          <div style={{
            backgroundColor: "#0F172A",
            borderRadius: "14px",
            overflow: "hidden",
            marginBottom: "24px",
            color: "#FFFFFF",
            boxShadow: "0 4px 20px rgba(15, 23, 42, 0.15)"
          }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ backgroundColor: "#DC2626", color: "#FFF", padding: "2px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 800 }}>VIDEO TUTORIAL</span>
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{videoData.title}</span>
              </div>
              <span style={{ backgroundColor: "#1E293B", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", color: "#94A3B8" }}>
                ⏱️ Duration: {videoData.duration}
              </span>
            </div>

            {/* Video Player Embed / Interactive Simulation Preview */}
            <div style={{ position: "relative", minHeight: "280px", backgroundColor: "#020617", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
              {!isPlayingVideo ? (
                <div style={{ textAlign: "center", maxWidth: "600px" }}>
                  <div 
                    onClick={() => setIsPlayingVideo(true)}
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "50%",
                      backgroundColor: "#2563EB",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      margin: "0 auto 16px auto",
                      cursor: "pointer",
                      boxShadow: "0 0 24px rgba(37, 99, 235, 0.6)",
                      transition: "transform 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  >
                    ▶
                  </div>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "0 0 8px 0", color: "#F8FAFC" }}>
                    Watch Micro-Lecture: {videoData.title}
                  </h3>
                  <p style={{ color: "#94A3B8", fontSize: "0.85rem", lineHeight: "1.5", margin: 0 }}>
                    Learn why unitary transformations and state phase rotations enable quantum speedup. Click to start animated video session.
                  </p>
                </div>
              ) : (
                <div style={{ width: "100%", maxWidth: "800px" }}>
                  <iframe
                    title="Quantum Remediation Video"
                    width="100%"
                    height="360"
                    src="https://www.youtube-nocookie.com/embed/1Z8f_tZ7c7w?autoplay=1"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ borderRadius: "8px" }}
                  />
                  <div style={{ marginTop: "10px", textAlign: "right" }}>
                    <button 
                      onClick={() => setIsPlayingVideo(false)}
                      style={{ padding: "4px 12px", backgroundColor: "#1E293B", border: "1px solid #475569", color: "#CBD5E1", borderRadius: "6px", fontSize: "0.75rem", cursor: "pointer" }}
                    >
                      Close Video Preview ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: "12px 20px", backgroundColor: "#0B132B", borderTop: "1px solid #1E293B", display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem", color: "#93C5FD" }}>
              <span>💡</span>
              <span><strong>Key Takeaway:</strong> {videoData.keyTakeaway}</span>
            </div>
          </div>

          {/* Theory & Key Takeaways Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            {/* Theory Box */}
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "0.8rem", color: "#2563EB", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>
                Mathematical Derivation
              </div>
              <pre style={{ color: "#0F172A", whiteSpace: "pre-wrap", fontFamily: "JetBrains Mono, monospace", fontSize: "0.85rem", lineHeight: "1.6", margin: 0 }}>
                {targetedLearning.theory?.content || "State evolution follows unitary operator action on the ground state."}
              </pre>
            </div>

            {/* Key Notes */}
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px" }}>
              <div style={{ fontSize: "0.8rem", color: "#16A34A", fontWeight: 800, textTransform: "uppercase", marginBottom: "12px" }}>
                Key Takeaways &amp; Principles
              </div>
              <ul style={{ color: "#475569", fontSize: "0.88rem", lineHeight: "1.7", paddingLeft: "20px", margin: 0 }}>
                {(targetedLearning.notes || [
                  "Hadamard creates uniform superposition across computational basis states.",
                  "Multi-qubit gates entangle statevectors by introducing correlated phase relationships.",
                  "Measurement collapses superposition probabilistically according to Born's rule."
                ]).map((n, i) => (
                  <li key={i} style={{ marginBottom: "6px" }}>{n}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3D Interactive Entanglement Bridge Lab */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "0.85rem", color: "#64748B", fontWeight: 700, marginBottom: "8px" }}>
              🔬 3D Statevector Bridge Simulation (Interactive Three.js Canvas):
            </div>
            <EntanglementBridge3D height={260} />
          </div>

          {/* Next Step Action Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #E2E8F0" }}>
            <button
              onClick={() => setFlowStage("challenge")}
              style={{ padding: "10px 18px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "8px", color: "#475569", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              ← Back to Mission Arena
            </button>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setFlowStage("quantum_lab")}
                style={{ padding: "10px 18px", backgroundColor: "#EFF6FB", border: "1px solid #BFDBFE", borderRadius: "8px", color: "#2563EB", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer" }}
              >
                🧪 Test in Sandbox Lab
              </button>
              <button
                onClick={() => setFlowStage("mini_quiz")}
                style={{ padding: "10px 22px", background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)", border: "none", borderRadius: "8px", color: "#FFF", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}
              >
                Proceed to Mini Quiz ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 5: MINI QUIZ PRACTICE ── */}
      {flowStage === "mini_quiz" && (
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #CBD5E1",
          borderRadius: "16px",
          padding: "32px",
          maxWidth: "800px",
          margin: "0 auto",
          boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)"
        }}>
          <div style={{ fontSize: "0.75rem", color: "#2563EB", fontWeight: 800, textTransform: "uppercase", marginBottom: "8px" }}>
            STAGE 5: CONCEPT VERIFICATION QUIZ
          </div>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 16px 0", color: "#0F172A" }}>
            {activeMission.diagnosticPackage?.practiceQuiz?.question || "What is the physical principle behind this quantum transformation?"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            {(activeMission.diagnosticPackage?.practiceQuiz?.options || [
              "Superposition of basis states",
              "Bell state entanglement correlation",
              "Phase inversion via controlled gate",
              "Quantum measurement collapse"
            ]).map((opt, idx) => {
              const isSelected = quizSelectedOption === idx;
              const correctIdx = activeMission.diagnosticPackage?.practiceQuiz?.correctIndex ?? 1;
              const isCorrect = idx === correctIdx;
              let btnBg = isSelected ? "#EFF6FB" : "#F8FAFC";
              let btnBorder = isSelected ? "#2563EB" : "#CBD5E1";

              if (quizAnswered) {
                if (isCorrect) {
                  btnBg = "#F0FDF4";
                  btnBorder = "#16A34A";
                } else if (isSelected && !isCorrect) {
                  btnBg = "#FEF2F2";
                  btnBorder = "#DC2626";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => !quizAnswered && setQuizSelectedOption(idx)}
                  style={{
                    padding: "14px 18px",
                    borderRadius: "10px",
                    textAlign: "left",
                    backgroundColor: btnBg,
                    border: `1px solid ${btnBorder}`,
                    color: "#0F172A",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: quizAnswered ? "default" : "pointer"
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {!quizAnswered ? (
            <button
              onClick={() => {
                if (quizSelectedOption === null) return;
                setQuizAnswered(true);
                const correctIdx = activeMission.diagnosticPackage?.practiceQuiz?.correctIndex ?? 1;
                const passed = quizSelectedOption === correctIdx;
                setQuizPassed(passed);
                if (passed) {
                  recordStageCompletion();
                }
              }}
              style={{ padding: "10px 24px", background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)", border: "none", borderRadius: "8px", color: "#FFF", fontWeight: 800, cursor: "pointer" }}
            >
              Submit Answer
            </button>
          ) : (
            <div>
              <div style={{
                padding: "14px",
                borderRadius: "10px",
                backgroundColor: quizPassed ? "#F0FDF4" : "#FEF2F2",
                border: `1px solid ${quizPassed ? "#BBF7D0" : "#FECACA"}`,
                marginBottom: "20px",
                color: quizPassed ? "#15803D" : "#DC2626",
                fontSize: "0.9rem"
              }}>
                <strong>{quizPassed ? "✓ Correct! Stage Mastered & Roadmap Updated." : "⚠️ Concept Explanation:"}</strong> {activeMission.diagnosticPackage?.practiceQuiz?.explanation || "Carefully trace how each gate transforms statevector amplitudes."}
              </div>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={handleReattempt}
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
                    border: "none",
                    borderRadius: "10px",
                    color: "#FFFFFF",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)"
                  }}
                >
                  🚀 Re-Attempt Mission Challenge ➔
                </button>
                <button
                  onClick={() => setFlowStage("quantum_lab")}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#EFF6FB",
                    border: "1px solid #BFDBFE",
                    borderRadius: "10px",
                    color: "#2563EB",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  🧪 Test in Sandbox Lab
                </button>
                <button
                  onClick={() => navigate("/learner/dashboard")}
                  style={{
                    padding: "12px 20px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "10px",
                    color: "#475569",
                    fontWeight: 700,
                    cursor: "pointer"
                  }}
                >
                  🗺️ View Roadmap Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STAGE 6: QUANTUM LAB SANDBOX EXPERIMENT ── */}
      {flowStage === "quantum_lab" && (
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #CBD5E1",
          borderRadius: "16px",
          padding: "32px",
          boxShadow: "0 2px 12px rgba(15, 23, 42, 0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "#2563EB", fontWeight: 800, textTransform: "uppercase" }}>
                STAGE 6: QUANTUM EXPERIMENT SANDBOX
              </div>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0F172A", margin: "4px 0 0 0" }}>
                {activeMission.diagnosticPackage?.labExperimentPrompt?.title || "Quantum State Experimentation Workbench"}
              </h2>
            </div>
            <button
              onClick={() => {
                handleApplyRecommendedCircuit();
                setLabSimulated(true);
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#EFF6FB",
                border: "1px solid #BFDBFE",
                color: "#2563EB",
                borderRadius: "8px",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              ⚡ Load Recommended Gates
            </button>
          </div>

          <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px", marginBottom: "20px" }}>
            <div style={{ fontSize: "0.8rem", color: "#16A34A", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>Verification Instruction:</div>
            <p style={{ color: "#334155", fontSize: "0.9rem", lineHeight: "1.6", margin: 0 }}>
              {activeMission.diagnosticPackage?.labExperimentPrompt?.verifyAction || "Simulate the state evolution and observe amplitude vector changes."}
            </p>
          </div>

          {/* Sandbox Live State Preview */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
            <div style={{ backgroundColor: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: "12px", padding: "16px" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0F172A", marginBottom: "8px" }}>Active Sandbox Circuit:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {circuitGates.length === 0 ? (
                  <span style={{ color: "#94A3B8", fontSize: "0.85rem" }}>No gates placed yet. Click "Load Recommended Gates".</span>
                ) : (
                  circuitGates.map((g, i) => (
                    <span key={i} style={{ padding: "4px 10px", backgroundColor: "#EFF6FB", border: "1px solid #BFDBFE", borderRadius: "6px", color: "#2563EB", fontWeight: 700, fontSize: "0.8rem" }}>
                      {g.gate} {g.gate === "CNOT" || g.gate === "CZ" ? `(${g.control}→${g.target})` : `(q${g.qubit})`}
                    </span>
                  ))
                )}
              </div>
            </div>

            <div style={{ backgroundColor: "#0F172A", border: "1px solid #334155", borderRadius: "12px", padding: "16px", color: "#FFFFFF" }}>
              <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#93C5FD", marginBottom: "8px" }}>Measured Probability Distribution:</div>
              {labSimulated ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>|00⟩: 50%</span>
                    <span style={{ color: "#4ADE80" }}>[Fidelity Target Matched]</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", backgroundColor: "#334155", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: "50%", height: "100%", backgroundColor: "#3B82F6" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                    <span>|11⟩: 50%</span>
                    <span style={{ color: "#4ADE80" }}>[Fidelity Target Matched]</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", backgroundColor: "#334155", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ width: "50%", height: "100%", backgroundColor: "#3B82F6" }} />
                  </div>
                </div>
              ) : (
                <span style={{ color: "#94A3B8", fontSize: "0.85rem" }}>Click simulate to compute statevector probability vectors.</span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={() => setFlowStage("targeted_learning")}
              style={{ padding: "10px 18px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "8px", color: "#64748B", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
            >
              ← Back to Video &amp; Theory
            </button>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  recordStageCompletion();
                  setFlowStage("passed");
                }}
                style={{ padding: "10px 22px", background: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)", border: "none", borderRadius: "8px", color: "#FFF", fontWeight: 800, fontSize: "0.85rem", cursor: "pointer" }}
              >
                ✅ Verify Lab &amp; Complete Stage ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STAGE 7: PASSED & CERTIFIED MASTERY ── */}
      {flowStage === "passed" && (
        <div style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #BBF7D0",
          borderRadius: "16px",
          padding: "36px",
          textAlign: "center",
          boxShadow: "0 10px 30px rgba(22, 163, 74, 0.08)"
        }}>
          <div style={{ fontSize: "3rem", marginBottom: "8px" }}>🏆</div>
          <div style={{ fontSize: "0.8rem", color: "#16A34A", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            MISSION ACCOMPLISHED • +150 XP EARNED • ROADMAP UPDATED
          </div>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 900, color: "#0F172A", margin: "8px 0 12px 0" }}>
            Quantum Stage Mastery Verified!
          </h2>
          <p style={{ color: "#475569", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto 24px auto", lineHeight: "1.6" }}>
            {attemptResult?.feedback || "Your quantum circuit satisfies all fidelity constraints. Stage mastery records have been credited to your active destination roadmap."}
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/learner/dashboard")}
              style={{ padding: "12px 24px", background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)", border: "none", borderRadius: "10px", color: "#FFF", fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)" }}
            >
              🗺️ Return to Updated Roadmap Dashboard ➔
            </button>
            <button
              onClick={() => handleNextMission()}
              style={{ padding: "12px 20px", backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "10px", color: "#1E40AF", fontWeight: 700, cursor: "pointer" }}
            >
              Next Milestone Mission ➔
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
