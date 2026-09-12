import React, { useEffect, useState } from "react";
import { platformApi } from "../../../services/platformApi";
import { DEFAULT_COURSES } from "../../../services/defaultPlatformData";

export default function ChallengeManager() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState(DEFAULT_COURSES[0].id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [xpReward, setXpReward] = useState(350);
  const [starterCode, setStarterCode] = useState(`from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister\n\ndef build_teleportation_circuit():\n    qr = QuantumRegister(3, 'q')\n    crz = ClassicalRegister(1, 'crz')\n    crx = ClassicalRegister(1, 'crx')\n    qc = QuantumCircuit(qr, crz, crx)\n    \n    # Step 1: Create Bell Pair between q[1] and q[2]\n    qc.h(qr[1])\n    qc.cx(qr[1], qr[2])\n    \n    # Step 2: Alice's Bell measurement\n    qc.cx(qr[0], qr[1])\n    qc.h(qr[0])\n    qc.measure(qr[0], crz)\n    qc.measure(qr[1], crx)\n    \n    return qc\n`);
  const [hint, setHint] = useState("Remember to apply classical controlled corrections on Bob's qubit based on Alice's measurement outcomes.");
  const [loading, setLoading] = useState(false);
  const [previewChallenge, setPreviewChallenge] = useState(null);

  const loadData = async () => {
    try {
      const cList = await platformApi.getCourses();
      if (Array.isArray(cList) && cList.length > 0) {
        setCourses(cList);
        if (!selectedCourseId) {
          setSelectedCourseId(cList[0].id);
        }
      }
    } catch (err) {
      console.warn("Challenge manager fallback:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const activeChallenges = activeCourse?.challenges || [];

  const handleAddChallenge = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      await platformApi.addChallenge(selectedCourseId, {
        title,
        description,
        difficulty,
        xp_reward: parseInt(xpReward, 10),
        starter_code: starterCode,
        hints: hint ? [hint] : [],
        test_cases: [
          { input: "State |ψ⟩ = (1/√2)|0⟩ + (1/√2)|1⟩", expected: "Fidelity = 1.0 on Bob's qubit" }
        ]
      });
      alert("Practical code challenge created and published to students!");
      setTitle("");
      setDescription("");
      await loadData();
    } catch (err) {
      // Local state update
      const newCh = {
        id: `ch-${Date.now()}`,
        title,
        description,
        difficulty,
        xp_reward: parseInt(xpReward, 10),
        starter_code: starterCode,
        hints: hint ? [hint] : []
      };
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourseId) {
          return { ...c, challenges: [...(c.challenges || []), newCh] };
        }
        return c;
      }));
      setTitle("");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChallenge = async (challengeId) => {
    if (window.confirm("Are you sure you want to delete this practical challenge?")) {
      try {
        await platformApi.deleteChallenge(selectedCourseId, challengeId);
        await loadData();
      } catch (err) {
        setCourses(prev => prev.map(c => {
          if (c.id === selectedCourseId) {
            return { ...c, challenges: (c.challenges || []).filter(ch => ch.id !== challengeId) };
          }
          return c;
        }));
      }
    }
  };

  const getDifficultyBadgeClass = (diff) => {
    switch (diff?.toLowerCase()) {
      case "beginner": return "pf-badge-success";
      case "intermediate": return "pf-badge-primary";
      case "advanced": return "pf-badge-copper";
      case "expert": return "pf-badge-danger";
      default: return "pf-badge-gold";
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="pf-badge pf-badge-copper">Practical Labs</span>
            <span className="pf-badge pf-badge-primary">Qiskit &amp; Python IDE</span>
          </div>
          <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>⚡ Practical Code Challenge Studio</h1>
          <p className="pf-subtext">Author interactive coding challenges, configure Qiskit circuit scaffolds, write automated unit tests, and allocate XP rewards.</p>
        </div>
      </div>

      {/* Course Selector Toolbar */}
      <div className="pf-card" style={{ marginBottom: "1.75rem", padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "280px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: "800", color: "#0F172A", whiteSpace: "nowrap" }}>
              🎯 Target Course:
            </label>
            <select
              style={{
                flex: 1,
                padding: "0.625rem 1rem",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                fontSize: "0.875rem",
                fontWeight: "600",
                background: "#FFFFFF",
                color: "#0F172A",
                cursor: "pointer"
              }}
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <span className="pf-badge pf-badge-primary">
              ⚡ {activeChallenges.length} Active Challenge{activeChallenges.length !== 1 ? "s" : ""}
            </span>
            <span className="pf-badge pf-badge-gold">
              🏆 Total XP Pool: {activeChallenges.reduce((acc, ch) => acc + (ch.xp_reward || 0), 0)} XP
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "1.75rem", alignItems: "start" }}>
        {/* Form Left */}
        <div className="pf-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
              ✨ Author Code Challenge
            </h2>
            <span className="pf-badge pf-badge-copper">+{xpReward} XP Reward</span>
          </div>

          <form onSubmit={handleAddChallenge}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Challenge Title *</label>
              <input
                type="text"
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                placeholder="e.g. Build a 3-Qubit Quantum Teleportation Protocol"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Detailed Instructions &amp; Goal *</label>
              <textarea
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                rows={3}
                placeholder="Describe the algorithm specifications, constraints, circuit depth requirements, and expected fidelity..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Difficulty Level</label>
                <select
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem", background: "#FFF" }}
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Beginner">Beginner (100 - 200 XP)</option>
                  <option value="Intermediate">Intermediate (250 - 350 XP)</option>
                  <option value="Advanced">Advanced (400 - 500 XP)</option>
                  <option value="Expert">Expert (600+ XP)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>XP Bonus Award</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  min={50}
                  step={50}
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                Starter Code / Solution Scaffold (Python / Qiskit) *
              </label>
              <div style={{ position: "relative" }}>
                <textarea
                  style={{
                    width: "100%",
                    padding: "0.875rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #1E293B",
                    background: "#0F172A",
                    color: "#38BDF8",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "0.8125rem",
                    lineHeight: "1.5"
                  }}
                  rows={8}
                  value={starterCode}
                  onChange={(e) => setStarterCode(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                💡 Student Hint (Optional)
              </label>
              <input
                type="text"
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                placeholder="e.g. Use an entangled EPR pair between Alice and Bob..."
                value={hint}
                onChange={(e) => setHint(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pf-btn pf-btn-copper"
              style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem" }}
            >
              {loading ? "Publishing Challenge..." : "🚀 Publish Code Challenge"}
            </button>
          </form>
        </div>

        {/* Active Challenges List Right */}
        <div className="pf-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
              ⚡ Lab Challenges ({activeChallenges.length})
            </h2>
            <span className="pf-badge pf-badge-primary">Interactive</span>
          </div>

          {activeChallenges.length === 0 ? (
            <div style={{ padding: "2.5rem 1rem", textAlign: "center", background: "#F8FAFC", borderRadius: "10px", border: "1px dashed #CBD5E1", color: "#64748B" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚡</div>
              <div style={{ fontWeight: "700", color: "#0F172A" }}>No Practical Challenges Yet</div>
              <p style={{ fontSize: "0.8125rem", marginTop: "4px" }}>Author your first coding challenge using the form on the left.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              {activeChallenges.map(ch => (
                <div key={ch.id} style={{ border: "1px solid #E2E8F0", borderRadius: "10px", padding: "1.15rem", background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "8px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                        <span className={`pf-badge ${getDifficultyBadgeClass(ch.difficulty)}`}>
                          {ch.difficulty || "Intermediate"}
                        </span>
                        <span className="pf-badge pf-badge-gold">
                          +{ch.xp_reward || 250} XP
                        </span>
                      </div>
                      <h4 style={{ fontWeight: "800", fontSize: "0.95rem", color: "#0F172A", margin: 0 }}>
                        {ch.title}
                      </h4>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => setPreviewChallenge(ch)}
                        className="pf-btn pf-btn-secondary pf-btn-sm"
                        title="View Code Scaffold"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleDeleteChallenge(ch.id)}
                        className="pf-btn pf-btn-danger pf-btn-sm"
                        title="Delete Challenge"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.8125rem", color: "#64748B", margin: "6px 0 0", lineHeight: "1.45" }}>
                    {ch.description}
                  </p>

                  {/* Compact Code Preview */}
                  {ch.starter_code && (
                    <div style={{ marginTop: "0.75rem", background: "#0F172A", borderRadius: "6px", padding: "8px 12px", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", color: "#7DD3FC", maxHeight: "80px", overflow: "hidden", position: "relative" }}>
                      <code>{ch.starter_code}</code>
                    </div>
                  )}

                  {ch.hints && ch.hints.length > 0 && (
                    <div style={{ marginTop: "0.65rem", fontSize: "0.75rem", color: "#854D0E", background: "#FEF9C3", padding: "4px 8px", borderRadius: "6px", border: "1px solid #FEF08A" }}>
                      💡 Hint: {ch.hints[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Challenge Preview Modal */}
      {previewChallenge && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="pf-card" style={{ maxWidth: "650px", width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  ⚡ {previewChallenge.title}
                </h3>
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  <span className={`pf-badge ${getDifficultyBadgeClass(previewChallenge.difficulty)}`}>
                    {previewChallenge.difficulty}
                  </span>
                  <span className="pf-badge pf-badge-gold">
                    +{previewChallenge.xp_reward} XP
                  </span>
                </div>
              </div>
              <button onClick={() => setPreviewChallenge(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748B" }}>✕</button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.35rem" }}>Challenge Overview</h4>
              <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>{previewChallenge.description}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.35rem" }}>Starter Code Scaffold</h4>
              <div style={{ background: "#0F172A", borderRadius: "8px", padding: "1rem", fontSize: "0.8125rem", fontFamily: "'JetBrains Mono', monospace", color: "#38BDF8", overflowX: "auto" }}>
                <pre style={{ margin: 0 }}>{previewChallenge.starter_code}</pre>
              </div>
            </div>

            {previewChallenge.hints && previewChallenge.hints.length > 0 && (
              <div style={{ padding: "0.75rem 1rem", background: "#FEF9C3", borderRadius: "8px", border: "1px solid #FEF08A", fontSize: "0.8125rem", color: "#854D0E" }}>
                💡 <strong>Author Hint:</strong> {previewChallenge.hints.join(" • ")}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
