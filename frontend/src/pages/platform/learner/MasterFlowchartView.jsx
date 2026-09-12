import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { purposeService } from "../../../services/purposeService";

export default function MasterFlowchartView() {
  const navigate = useNavigate();
  const [purpose, setPurpose] = useState(purposeService.getPurpose());
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [presentationMode, setPresentationMode] = useState(false);

  const presentationSteps = [
    { id: "landing", title: "1. Dual Landing & Authentication", desc: "Separate secure entry points for Trainers and Learners with RBAC authentication." },
    { id: "purpose", title: "2. Learner Purpose Selection", desc: "Dynamic selection among 💼 Jobs (Roles), 🔬 Research (Domains), and 🎓 Academic (Levels)." },
    { id: "roadmap", title: "3. Dynamic Personalization & Roadmap Engine", desc: "Evaluates user profile, learning history, and diagnostic assessments to build a customized skill graph." },
    { id: "ai_companion", title: "4. Persistent Voice AI & Robot Avatar", desc: "Listens, speaks with glassy expressive eyes & lip sync, and routes between Diagnostic, Socratic, Learning, and Experiment AI." },
    { id: "backward_mission", title: "5. Backward Learning & Challenge-First Loop", desc: "Presents challenges first. If passed, grants mastery. If failed, engages Diagnostic AI to teach targeted video/theory/notes, mini quiz, and lab experiments before re-attempting." },
    { id: "quantum_lab", title: "6. Scientific Quantum Lab Sandbox", desc: "Execution-backed circuit composer, 3D Bloch sphere, statevector evolution, noise simulation, and algorithm workbench." },
    { id: "mastery", title: "7. Mastery & Dynamic Re-adaptation", desc: "Updates the skill graph, credits known concepts, and recalculates the dynamic roadmap until career, research, or academic readiness." }
  ];

  useEffect(() => {
    let timer;
    if (presentationMode) {
      timer = setInterval(() => {
        setActiveStepIndex(prev => (prev + 1) % presentationSteps.length);
      }, 5000);
    }
    return () => clearInterval(timer);
  }, [presentationMode]);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto", paddingBottom: "60px", color: "#0C0D12", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* ── TOP BANNER ── */}
      <div style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F5F9FC 100%)",
        border: "1px solid #CBD5E1",
        borderRadius: "16px",
        padding: "24px 28px",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "0 2px 8px rgba(12, 13, 18, 0.03)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "1.3rem" }}>🗺️</span>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#3A68A4", fontWeight: 800 }}>
              QUANTUM MASTERY COMPLETE SYSTEM FLOWCHART
            </span>
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px 0", color: "#0C0D12" }}>
            Interactive Project Master Flow
          </h1>
          <p style={{ color: "#475569", margin: 0, fontSize: "0.9rem" }}>
            Single unified architecture: Trainer Studio • Multi-Purpose Pathways • Persistent Voice AI • Backward Learning • Quantum Lab
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={() => setPresentationMode(!presentationMode)}
            style={{
              padding: "10px 18px",
              backgroundColor: presentationMode ? "#16A34A" : "#FFFFFF",
              border: presentationMode ? "none" : "1px solid #CBD5E1",
              borderRadius: "10px",
              color: presentationMode ? "#FFFFFF" : "#2C3F60",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <span>{presentationMode ? "⏸️" : "▶️"}</span>
            <span>{presentationMode ? "Presentation Running" : "Start Presentation Tour"}</span>
          </button>
          <button
            onClick={() => navigate("/learner/mission")}
            style={{
              padding: "10px 18px",
              background: "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)",
              border: "none",
              borderRadius: "10px",
              color: "#FFFFFF",
              fontWeight: 800,
              fontSize: "0.85rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(44, 63, 96, 0.25)"
            }}
          >
            🎯 Open Active Mission
          </button>
        </div>
      </div>

      {/* ── PRESENTATION STEP HIGHLIGHT BAR ── */}
      {presentationMode && (
        <div style={{
          backgroundColor: "#3A68A4",
          padding: "14px 20px",
          borderRadius: "12px",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#FFFFFF"
        }}>
          <div>
            <div style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800, color: "#AFD8F4" }}>
              CURRENT SLIDE EXPLANATION ({activeStepIndex + 1}/{presentationSteps.length}):
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF", marginTop: "2px" }}>
              {presentationSteps[activeStepIndex].title}: {presentationSteps[activeStepIndex].desc}
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            {presentationSteps.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveStepIndex(i)}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: activeStepIndex === i ? "#FFFFFF" : "rgba(255,255,255,0.4)",
                  cursor: "pointer"
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── INTERACTIVE VISUAL FLOWCHART CANVAS (LIGHT THEME) ── */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #CBD5E1",
        borderRadius: "16px",
        padding: "30px",
        position: "relative",
        overflowX: "auto",
        boxShadow: "0 4px 20px rgba(12, 13, 18, 0.03)"
      }}>
        {/* ONE-LINE INNOVATION SUMMARY CARD */}
        <div style={{
          backgroundColor: "#EFF6FB",
          border: "1px solid #AFD8F4",
          borderRadius: "12px",
          padding: "16px 20px",
          marginBottom: "30px",
          textAlign: "center"
        }}>
          <span style={{ fontSize: "0.75rem", color: "#3A68A4", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            The Core Architectural Innovation in One Sentence:
          </span>
          <p style={{ margin: "6px 0 0 0", color: "#0C0D12", fontSize: "0.95rem", fontStyle: "italic", lineHeight: 1.5 }}>
            "Quantum Mastery dynamically takes a learner from their chosen destination—career, research, or academics—to personalized challenges, identifies what they don't know, teaches only what they need, lets them experiment in a Quantum Lab, and continuously adapts their roadmap while a persistent voice-enabled AI robot guides them throughout the entire journey."
          </p>
        </div>

        {/* ── FLOWCHART NODE DIAGRAM ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          
          {/* LEVEL 1: LANDING */}
          <div
            onClick={() => navigate("/")}
            style={{
              padding: "14px 28px",
              borderRadius: "12px",
              backgroundColor: "#EFF6FB",
              border: "2px solid #3A68A4",
              cursor: "pointer",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(58, 104, 164, 0.15)"
            }}
          >
            <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#2C3F60" }}>⚛️ LANDING PAGE</div>
            <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Dual Role Entry: Trainer / Learner</div>
          </div>

          <div style={{ color: "#95AECD", fontSize: "1.2rem" }}>↓</div>

          {/* LEVEL 2: TRAINER & LEARNER BRANCH */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", width: "100%", maxWidth: "900px" }}>
            {/* TRAINER STUDIO */}
            <div
              onClick={() => navigate("/trainer/dashboard")}
              style={{
                backgroundColor: "#FFF8F2",
                border: "1px solid #F4C6AF",
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: 800, color: "#A77B5A", marginBottom: "4px" }}>👨‍🏫 TRAINER STUDIO</div>
              <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                Courses (Videos, Theory, Notes) • Missions (Challenges, Problems) • Assessment (Grading, Analytics)
              </div>
            </div>

            {/* LEARNER ONBOARDING */}
            <div
              onClick={() => navigate("/learner/dashboard")}
              style={{
                backgroundColor: "#EFF6FB",
                border: "2px solid #3A68A4",
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: 800, color: "#3A68A4", marginBottom: "4px" }}>🎓 LEARNER ONBOARDING</div>
              <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                Authentication • Profile Check • Purpose &amp; Destination Selection
              </div>
            </div>
          </div>

          <div style={{ color: "#95AECD", fontSize: "1.2rem" }}>↓</div>

          {/* LEVEL 3: PURPOSE BRANCHES (JOBS / RESEARCH / ACADEMIC) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", width: "100%", maxWidth: "1000px" }}>
            <div
              onClick={() => { purposeService.setPurpose("job", "quantum-software-engineer"); setPurpose(purposeService.getPurpose()); }}
              style={{
                backgroundColor: purpose.type === "job" ? "#EFF6FB" : "#F5F9FC",
                border: purpose.type === "job" ? "2px solid #3A68A4" : "1px solid #CBD5E1",
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: 800, color: "#3A68A4", marginBottom: "4px" }}>💼 1. JOBS / CAREER</div>
              <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                Select Role ➔ Role Skill Graph ➔ Skill &amp; Gap Analysis
              </div>
            </div>

            <div
              onClick={() => { navigate("/learner/research"); }}
              style={{
                backgroundColor: purpose.type === "research" ? "#FFF8F2" : "#F5F9FC",
                border: purpose.type === "research" ? "2px solid #A77B5A" : "1px solid #CBD5E1",
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: 800, color: "#A77B5A", marginBottom: "4px" }}>🔬 2. RESEARCH TRACK</div>
              <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                Domain ➔ Paper Search ➔ Literature Analysis ➔ Potential Gaps ➔ Validation
              </div>
            </div>

            <div
              onClick={() => { purposeService.setPurpose("academic", "intermediate"); setPurpose(purposeService.getPurpose()); }}
              style={{
                backgroundColor: purpose.type === "academic" ? "#F0FDF4" : "#F5F9FC",
                border: purpose.type === "academic" ? "2px solid #16A34A" : "1px solid #CBD5E1",
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer"
              }}
            >
              <div style={{ fontWeight: 800, color: "#16A34A", marginBottom: "4px" }}>🎓 3. ACADEMIC TRACK</div>
              <div style={{ fontSize: "0.8rem", color: "#64748B" }}>
                Level Tier ➔ Courses ➔ Quizzes ➔ Theory &amp; Notes
              </div>
            </div>
          </div>

          <div style={{ color: "#95AECD", fontSize: "1.2rem" }}>↓</div>

          {/* LEVEL 4: DYNAMIC ROADMAP */}
          <div
            onClick={() => navigate("/learner/dashboard")}
            style={{
              width: "100%",
              maxWidth: "1000px",
              backgroundColor: "#FFF8F2",
              border: "2px solid #D6B15F",
              borderRadius: "14px",
              padding: "16px 24px",
              textAlign: "center",
              cursor: "pointer"
            }}
          >
            <div style={{ fontWeight: 800, color: "#A47C3A", fontSize: "1rem" }}>
              🛣️ DYNAMIC PERSONALIZATION &amp; ISOMETRIC ROADMAP ENGINE
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "4px" }}>
              Calculates Dynamic Learning Path • Next Best Action Recommendation • Active Goal Milestones
            </div>
          </div>

          <div style={{ color: "#95AECD", fontSize: "1.2rem" }}>↓</div>

          {/* LEVEL 5: BACKWARD LEARNING LOOP */}
          <div
            onClick={() => navigate("/learner/mission")}
            style={{
              width: "100%",
              maxWidth: "1000px",
              backgroundColor: "#EFF6FB",
              border: "2px dashed #3A68A4",
              borderRadius: "14px",
              padding: "20px",
              textAlign: "center",
              cursor: "pointer"
            }}
          >
            <div style={{ fontWeight: 900, color: "#3A68A4", fontSize: "1.05rem" }}>
              🔄 BACKWARD LEARNING ENGINE (CHALLENGE-FIRST PARADIGM)
            </div>
            <div style={{ fontSize: "0.85rem", color: "#2C3F60", marginTop: "6px" }}>
              1. Challenge First ➔ 2. Attempt Task ➔ 3. Fail/Pass ➔ 4. Diagnostic AI ➔ 5. Targeted Theory/Video ➔ 6. Mini Quiz ➔ 7. Lab Sandbox ➔ 8. Re-attempt
            </div>
          </div>

          <div style={{ color: "#95AECD", fontSize: "1.2rem" }}>↓</div>

          {/* LEVEL 6: LAB & SIMULATION */}
          <div
            onClick={() => navigate("/learner/lab")}
            style={{
              width: "100%",
              maxWidth: "1000px",
              backgroundColor: "#F5F9FC",
              border: "1px solid #CBD5E1",
              borderRadius: "14px",
              padding: "16px 24px",
              textAlign: "center",
              cursor: "pointer"
            }}
          >
            <div style={{ fontWeight: 800, color: "#2C3F60", fontSize: "1rem" }}>
              ⚛️ QUANTUM LAB &amp; SIMULATOR SANDBOX
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748B", marginTop: "4px" }}>
              Circuit Composer • Statevector Evolution • 3D Bloch Sphere • Noise Models &amp; Algorithms
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
