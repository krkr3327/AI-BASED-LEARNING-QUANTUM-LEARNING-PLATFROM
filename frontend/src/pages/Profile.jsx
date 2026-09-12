import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { platformAuth } from "../services/platformAuth";
import { purposeService } from "../services/purposeService";
import { fetchProgress, fetchMastery, fetchLevel, setUserLevel } from "../services/learningApi";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(platformAuth.getUser() || { name: "Quantum Scholar", email: "student@quantum.edu", id: "QM-2026-88A9" });
  const [purpose, setPurpose] = useState(purposeService.getPurpose());
  const [skillGraph, setSkillGraph] = useState(purposeService.getSkillGraph());
  const [progress, setProgress] = useState(null);
  const [mastery, setMastery] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | certificates | preferences | personal
  const [isEditing, setIsEditing] = useState(false);

  // Extended Profile fields
  const [profileData, setProfileData] = useState(() => {
    const authUser = platformAuth.getUser();
    const defaultName = authUser?.name || "Shaik Mubeena";
    const defaultEmail = authUser?.email || "mubeena003@gmail.com";
    const defaultId = authUser?.id || "QM-2026-88A9";
    const saved = localStorage.getItem("qm_student_profile_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          name: parsed.name || defaultName,
          email: parsed.email || defaultEmail,
          studentId: parsed.studentId || defaultId
        };
      } catch (e) {
        console.warn("Error parsing profile data:", e);
      }
    }
    return {
      name: defaultName,
      email: defaultEmail,
      studentId: defaultId,
      institution: "Institute of Quantum Information & Computation",
      major: "Quantum Computing & Applied Physics",
      bio: "Undergraduate researcher focused on NISQ algorithm optimization, circuit transpilation in Qiskit, and hybrid quantum-classical algorithms (VQE/QAOA).",
      location: "San Francisco, CA (UTC-8)",
      github: "https://github.com/quantum-scholar",
      linkedin: "https://linkedin.com/in/quantum-scholar",
      ibmToken: "ibm_q_token_**********************",
      preferredSimulator: "Aer Statevector Simulator (32 Qubits)",
      voiceEnabled: true,
      emailNotifications: true
    };
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [prog, mast] = await Promise.all([
          fetchProgress().catch(() => null),
          fetchMastery().catch(() => null)
        ]);
        if (prog) setProgress(prog);
        if (mast) setMastery(mast);
      } catch (e) {
        console.warn("Failed to load profile learning data:", e);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem("qm_student_profile_data", JSON.stringify(profileData));
    const updatedUser = { ...user, name: profileData.name, email: profileData.email };
    localStorage.setItem("platform_user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    alert("Profile details successfully updated!");
  };

  const skillsList = Object.values(skillGraph?.skills || {});
  const overallMastery = skillGraph?.overallMastery || 86;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "60px", color: "#0C0D12", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* ── HERO BANNER & AVATAR PROFILE HEADER ── */}
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #CBD5E1",
        borderRadius: "20px",
        overflow: "visible",
        marginBottom: "28px",
        boxShadow: "0 4px 20px rgba(12, 13, 18, 0.04)"
      }}>
        {/* Quantum Gradient Cover Art */}
        <div style={{
          height: "170px",
          background: "linear-gradient(135deg, #2C3F60 0%, #3A68A4 50%, #5F9CD6 100%)",
          borderTopLeftRadius: "19px",
          borderTopRightRadius: "19px",
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          padding: "20px 32px"
        }}>
          <div style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(#AFD8F4 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            opacity: 0.25,
            pointerEvents: "none"
          }} />
          <div style={{ position: "absolute", right: "24px", top: "20px" }}>
            <span style={{ backgroundColor: "#FFF8F2", color: "#A77B5A", padding: "6px 14px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 800, border: "1px solid #F4C6AF", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <span>🛡️</span> Verified Quantum Student
            </span>
          </div>
        </div>

        {/* Profile Info Card Section */}
        <div style={{
          padding: "0 32px 28px 32px",
          borderBottomLeftRadius: "19px",
          borderBottomRightRadius: "19px"
        }}>
          {/* Top Row: Overlapping Avatar and Action Buttons */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "-50px",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "16px"
          }}>
            {/* Avatar with Status Ring */}
            <div style={{ position: "relative" }}>
              <div style={{
                width: "105px",
                height: "105px",
                borderRadius: "50%",
                backgroundColor: "#FFFFFF",
                border: "4px solid #FFFFFF",
                boxShadow: "0 8px 24px rgba(44, 63, 96, 0.22)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)",
                color: "#FFFFFF",
                fontSize: "2.6rem",
                fontWeight: 900,
                flexShrink: 0
              }}>
                {profileData.name?.[0]?.toUpperCase() || user?.name?.[0]?.toUpperCase() || "S"}
              </div>
              <div style={{
                position: "absolute",
                bottom: "4px",
                right: "4px",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                backgroundColor: "#16A34A",
                border: "3px solid #FFFFFF",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }} title="Online & Active" />
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: "9px 18px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "10px",
                  color: "#2C3F60",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s"
                }}
              >
                <span>✏️</span> Edit Profile
              </button>
              <button
                onClick={() => navigate("/learner/dashboard")}
                style={{
                  padding: "9px 20px",
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
                Go to Dashboard ➔
              </button>
            </div>
          </div>

          {/* Student Identity Information */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", marginBottom: "4px" }}>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 900, margin: 0, color: "#0C0D12" }}>
                {profileData.name || user?.name || "Shaik Mubeena"}
              </h1>
              <span style={{ backgroundColor: "#EFF6FB", color: "#3A68A4", border: "1px solid #AFD8F4", padding: "3px 10px", borderRadius: "10px", fontSize: "0.74rem", fontWeight: 800 }}>
                ID: {profileData.studentId || user?.id || "QM-2026-88A9"}
              </span>
              <span style={{ backgroundColor: "#F0FDF4", color: "#15803D", border: "1px solid #BBF7D0", padding: "3px 10px", borderRadius: "10px", fontSize: "0.74rem", fontWeight: 800 }}>
                Level 4 Scholar
              </span>
            </div>

            <p style={{ margin: "4px 0 0 0", color: "#475569", fontSize: "0.95rem", fontWeight: 500 }}>
              {profileData.major || "Quantum Computing & Applied Physics"} • <strong style={{ color: "#2C3F60" }}>{profileData.institution || "Institute of Quantum Information & Computation"}</strong>
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "10px", fontSize: "0.82rem", color: "#64748B", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                📍 {profileData.location || "San Francisco, CA (UTC-8)"}
              </span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                📧 {profileData.email || user?.email || "mubeena003@gmail.com"}
              </span>
              {profileData.github && (
                <>
                  <span>•</span>
                  <a href={profileData.github} target="_blank" rel="noreferrer" style={{ color: "#3A68A4", textDecoration: "none", fontWeight: 600 }}>
                    🐙 GitHub
                  </a>
                </>
              )}
              {profileData.linkedin && (
                <>
                  <span>•</span>
                  <a href={profileData.linkedin} target="_blank" rel="noreferrer" style={{ color: "#3A68A4", textDecoration: "none", fontWeight: 600 }}>
                    💼 LinkedIn
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4-CARD ACADEMIC HUD OVERVIEW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 3px rgba(12, 13, 18, 0.02)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>TARGET DESTINATION</div>
          <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "#3A68A4", marginTop: "4px" }}>{purpose.title}</div>
          <div style={{ fontSize: "0.78rem", color: "#16A34A", fontWeight: 700, marginTop: "4px" }}>{overallMastery}% Cumulative Mastery</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 3px rgba(12, 13, 18, 0.02)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>GAMIFICATION STANDING</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#0C0D12", marginTop: "2px" }}>1,950 XP</div>
          <div style={{ fontSize: "0.78rem", color: "#A47C3A", fontWeight: 700, marginTop: "2px" }}>⭐ Level 4 • Practitioner</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 3px rgba(12, 13, 18, 0.02)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>ACTIVE STUDY STREAK</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#AD6358", marginTop: "2px" }}>8 Days 🔥</div>
          <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600, marginTop: "2px" }}>Consistent Lab Activity</div>
        </div>

        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 3px rgba(12, 13, 18, 0.02)" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#64748B", textTransform: "uppercase" }}>QPU RUNS &amp; EVIDENCE</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#2C3F60", marginTop: "2px" }}>28 Simulations</div>
          <div style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: 600, marginTop: "2px" }}>Verified Statevector Fidelity</div>
        </div>

      </div>

      {/* ── PROFILE TABS NAVIGATION ── */}
      <div style={{
        display: "flex",
        gap: "10px",
        borderBottom: "2px solid #E2E8F0",
        marginBottom: "24px",
        backgroundColor: "#FFFFFF",
        padding: "8px 16px 0 16px",
        borderRadius: "14px 14px 0 0"
      }}>
        {[
          { id: "overview", label: "Academic & Skill Radar", icon: "📊" },
          { id: "certificates", label: "Certifications & Badges", icon: "🏆" },
          { id: "preferences", label: "Platform & Hardware Tokens", icon: "⚙️" },
          { id: "personal", label: "Personal Bio & Portfolio", icon: "👤" }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "12px 18px",
                background: "none",
                border: "none",
                borderBottom: isActive ? "3px solid #3A68A4" : "3px solid transparent",
                color: isActive ? "#3A68A4" : "#64748B",
                fontWeight: isActive ? 800 : 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: ACADEMIC & SKILL RADAR ── */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "24px" }}>
          
          {/* Left: Destination Skill Matrix */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(12, 13, 18, 0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: 0, color: "#0C0D12" }}>
                Destination Competencies ({skillsList.length})
              </h2>
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#3A68A4", backgroundColor: "#EFF6FB", padding: "3px 10px", borderRadius: "10px", border: "1px solid #AFD8F4" }}>
                {purpose.title}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {skillsList.map(skill => {
                const isMastered = skill.mastery >= 70;
                const isGap = skill.mastery < 40;
                return (
                  <div key={skill.id} style={{ padding: "12px 16px", borderRadius: "10px", backgroundColor: isMastered ? "#F0FDF4" : isGap ? "#FFF8F2" : "#EFF6FB", border: `1px solid ${isMastered ? "#BBF7D0" : isGap ? "#F4C6AF" : "#AFD8F4"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#0C0D12" }}>{skill.name}</span>
                      <span style={{ fontSize: "0.75rem", fontWeight: 800, color: isMastered ? "#15803D" : isGap ? "#AD6358" : "#3A68A4" }}>
                        {isMastered ? "✓ Mastered (95%)" : isGap ? "⚠️ Gap Identified" : `${skill.mastery}% Proficient`}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(0,0,0,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${skill.mastery}%`, height: "100%", backgroundColor: isMastered ? "#16A34A" : isGap ? "#AD6358" : "#3A68A4", borderRadius: "3px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Backward Learning & Lab Activity */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(12, 13, 18, 0.02)" }}>
              <h2 style={{ fontSize: "1.15rem", fontWeight: 800, margin: "0 0 12px 0", color: "#0C0D12" }}>
                Backward Learning Stats
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", backgroundColor: "#F5F9FC", borderRadius: "8px" }}>
                  <span style={{ color: "#64748B" }}>Missions Attempted:</span>
                  <span style={{ fontWeight: 700, color: "#0C0D12" }}>3 Missions</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", backgroundColor: "#F5F9FC", borderRadius: "8px" }}>
                  <span style={{ color: "#64748B" }}>Bell State Fidelity:</span>
                  <span style={{ fontWeight: 700, color: "#16A34A" }}>100% (Passed)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", backgroundColor: "#F5F9FC", borderRadius: "8px" }}>
                  <span style={{ color: "#64748B" }}>Phase Kickback Score:</span>
                  <span style={{ fontWeight: 700, color: "#16A34A" }}>92% (Passed)</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: "#FFF8F2", border: "1px solid #F4C6AF", borderRadius: "16px", padding: "20px" }}>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#A77B5A", marginBottom: "4px" }}>
                Continuous Roadmap Sync
              </div>
              <p style={{ fontSize: "0.825rem", color: "#475569", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                Your destination skills and diagnostic scores are updated in real-time as you solve challenges in the Quantum Lab.
              </p>
              <button
                onClick={() => navigate("/learner/mission")}
                style={{ padding: "8px 14px", background: "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)", color: "#FFF", border: "none", borderRadius: "8px", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer" }}
              >
                Launch Next Mission ➔
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: CERTIFICATIONS & BADGES ── */}
      {activeTab === "certificates" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Certificate Showcase Card */}
          <div style={{
            backgroundColor: "#FFFFFF",
            border: "2px solid #D6B15F",
            borderRadius: "18px",
            padding: "28px 32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 4px 20px rgba(214, 177, 95, 0.15)"
          }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span style={{ fontSize: "1.4rem" }}>🎓</span>
                  <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#A47C3A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    OFFICIAL VERIFIED CREDENTIAL
                  </span>
                </div>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 900, color: "#0C0D12", margin: "0 0 8px 0" }}>
                  Quantum Mastery: {purpose.title} Specialist
                </h2>
                <p style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.55, margin: "0 0 14px 0" }}>
                  Issued to <strong>{profileData.name}</strong> upon demonstrating verified simulation mastery in Dirac notation, Bell state creation, phase kickback oracles, and circuit transpilation.
                </p>
                <div style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#64748B", backgroundColor: "#F5F9FC", padding: "8px 12px", borderRadius: "8px", border: "1px dashed #CBD5E1", display: "inline-block", marginBottom: "16px" }}>
                  Verification Hash: QXM-2026-88A9-7E4B-QM99
                </div>
              </div>

              <div>
                <button
                  onClick={() => window.print()}
                  style={{
                    padding: "12px 24px",
                    background: "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(44, 63, 96, 0.25)"
                  }}
                >
                  🖨️ Download Certificate (PDF)
                </button>
              </div>
            </div>

          {/* Micro-Credential Badges Grid */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "24px" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0C0D12", marginBottom: "16px" }}>
              Earned Quantum Achievement Badges
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
              {[
                { title: "Bell State Pioneer", desc: "Constructed 100% fidelity entangled pairs", icon: "🔗", level: "Gold", date: "Sep 2026" },
                { title: "Transpiler Ace", desc: "Optimized multi-qubit basis gate sequences", icon: "⚡", level: "Silver", date: "Sep 2026" },
                { title: "Phase Kickback Master", desc: "Successfully inverted control phase via ancilla", icon: "🎯", level: "Gold", date: "Sep 2026" },
                { title: "Quantum Lab Explorer", desc: "Ran 25+ real-time statevector experiments", icon: "🧪", level: "Bronze", date: "Sep 2026" }
              ].map((b, i) => (
                <div key={i} style={{ border: "1px solid #E2E8F0", borderRadius: "12px", padding: "16px", backgroundColor: "#F5F9FC", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "6px" }}>{b.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#0C0D12" }}>{b.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", margin: "4px 0 8px 0" }}>{b.desc}</div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 800, backgroundColor: "#FFF8F2", color: "#A77B5A", border: "1px solid #F4C6AF", padding: "2px 8px", borderRadius: "8px" }}>
                    {b.level} • {b.date}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 3: PLATFORM & HARDWARE PREFERENCES ── */}
      {activeTab === "preferences" && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(12, 13, 18, 0.02)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0C0D12", marginBottom: "20px" }}>
            Quantum Simulator &amp; Platform Configuration
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "700px" }}>
            
            {/* Preferred Simulator */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#0C0D12", marginBottom: "6px" }}>
                Primary Execution Engine
              </label>
              <select
                value={profileData.preferredSimulator}
                onChange={(e) => setProfileData({ ...profileData, preferredSimulator: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#F5F9FC", color: "#0C0D12", fontSize: "0.9rem" }}
              >
                <option>Aer Statevector Simulator (32 Qubits)</option>
                <option>IBM Quantum Cloud Backend (ibmq_qasm_simulator)</option>
                <option>Rigetti Aspen Quantum Virtual Machine</option>
                <option>PennyLane Autograd Simulator</option>
              </select>
            </div>

            {/* IBM API Token */}
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: "#0C0D12", marginBottom: "6px" }}>
                IBM Quantum API Access Key
              </label>
              <input
                type="password"
                value={profileData.ibmToken}
                onChange={(e) => setProfileData({ ...profileData, ibmToken: e.target.value })}
                style={{ width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1px solid #CBD5E1", backgroundColor: "#F5F9FC", color: "#0C0D12", fontSize: "0.9rem" }}
              />
              <span style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "4px", display: "block" }}>
                Used for hardware transpilation and executing circuits on IBM Quantum hardware.
              </span>
            </div>

            {/* Voice AI Settings */}
            <div style={{ padding: "16px", backgroundColor: "#F5F9FC", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0C0D12" }}>Voice AI Robot Companion</div>
                  <div style={{ fontSize: "0.78rem", color: "#64748B" }}>Enable speech recognition, expressive eyes, and vocal guidance.</div>
                </div>
                <input
                  type="checkbox"
                  checked={profileData.voiceEnabled}
                  onChange={(e) => setProfileData({ ...profileData, voiceEnabled: e.target.checked })}
                  style={{ width: "18px", height: "18px", accentColor: "#3A68A4", cursor: "pointer" }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.setItem("qm_student_profile_data", JSON.stringify(profileData));
                alert("Platform settings saved!");
              }}
              style={{ padding: "10px 20px", background: "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)", color: "#FFF", border: "none", borderRadius: "8px", fontWeight: 700, alignSelf: "flex-start", cursor: "pointer" }}
            >
              Save Hardware Preferences
            </button>

          </div>
        </div>
      )}

      {/* ── TAB 4: PERSONAL BIO & PORTFOLIO ── */}
      {activeTab === "personal" && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(12, 13, 18, 0.02)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0C0D12", marginBottom: "16px" }}>
            Student Biography &amp; Professional Links
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div>
              <div style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 800, textTransform: "uppercase", marginBottom: "6px" }}>BIOGRAPHY</div>
              <p style={{ color: "#0C0D12", fontSize: "0.9rem", lineHeight: 1.6, backgroundColor: "#F5F9FC", padding: "16px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
                {profileData.bio}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "0.8rem", color: "#64748B", fontWeight: 800, textTransform: "uppercase" }}>PORTFOLIO &amp; PROFILES</div>
              
              <a
                href={profileData.github}
                target="_blank"
                rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", backgroundColor: "#F5F9FC", borderRadius: "10px", border: "1px solid #CBD5E1", color: "#0C0D12", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem" }}
              >
                <span>🐙</span> GitHub Repository Portfolio ➔
              </a>

              <a
                href={profileData.linkedin}
                target="_blank"
                rel="noreferrer"
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", backgroundColor: "#F5F9FC", borderRadius: "10px", border: "1px solid #CBD5E1", color: "#0C0D12", textDecoration: "none", fontWeight: 700, fontSize: "0.85rem" }}
              >
                <span>💼</span> LinkedIn Professional Profile ➔
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditing && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(12, 13, 18, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "18px",
            maxWidth: "600px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            padding: "32px",
            border: "1px solid #CBD5E1",
            boxShadow: "0 20px 50px rgba(0,0,0,0.2)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 800, color: "#0C0D12" }}>
                Edit Student Profile
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                style={{ background: "none", border: "none", fontSize: "1.3rem", cursor: "pointer", color: "#64748B" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0C0D12", marginBottom: "4px" }}>Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.9rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0C0D12", marginBottom: "4px" }}>Email Address</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.9rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0C0D12", marginBottom: "4px" }}>Institution / University</label>
                <input
                  type="text"
                  value={profileData.institution}
                  onChange={(e) => setProfileData({ ...profileData, institution: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0C0D12", marginBottom: "4px" }}>Academic Major / Department</label>
                <input
                  type="text"
                  value={profileData.major}
                  onChange={(e) => setProfileData({ ...profileData, major: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0C0D12", marginBottom: "4px" }}>Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0C0D12", marginBottom: "4px" }}>Biography &amp; Research Focus</label>
                <textarea
                  rows={3}
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0C0D12", marginBottom: "4px" }}>GitHub Profile URL</label>
                <input
                  type="url"
                  value={profileData.github}
                  onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.9rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 700, color: "#0C0D12", marginBottom: "4px" }}>LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={profileData.linkedin}
                  onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{ padding: "8px 16px", backgroundColor: "#F5F9FC", border: "1px solid #CBD5E1", borderRadius: "8px", color: "#64748B", fontWeight: 600, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "8px 20px", background: "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)", color: "#FFF", border: "none", borderRadius: "8px", fontWeight: 700, cursor: "pointer" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
