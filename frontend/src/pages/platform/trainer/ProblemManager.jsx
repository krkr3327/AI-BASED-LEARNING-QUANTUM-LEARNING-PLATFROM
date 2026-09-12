import React, { useEffect, useState } from "react";
import { platformApi } from "../../../services/platformApi";
import { DEFAULT_COURSES } from "../../../services/defaultPlatformData";

export default function ProblemManager() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState(DEFAULT_COURSES[0].id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [starterCode, setStarterCode] = useState(`import numpy as np\n\ndef verify_unitary(matrix: np.ndarray) -> bool:\n    \"\"\" Returns True if matrix is unitary (U @ U_dagger == I) \"\"\"\n    identity = np.eye(matrix.shape[0])\n    u_dagger = np.conjugate(matrix.T)\n    product = np.matmul(matrix, u_dagger)\n    return np.allclose(product, identity, atol=1e-7)\n`);
  const [loading, setLoading] = useState(false);
  const [previewProblem, setPreviewProblem] = useState(null);

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
      console.warn("Problem manager fallback:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const activeProblems = activeCourse?.problems || [];

  const handleAddProblem = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      await platformApi.addProblem(selectedCourseId, {
        title,
        description,
        difficulty,
        starter_code: starterCode,
        test_cases: [
          { input: "Pauli-X matrix [[0, 1], [1, 0]]", output: "True" },
          { input: "Non-unitary matrix [[1, 1], [0, 1]]", output: "False" }
        ]
      });
      alert("Problem successfully published to Laboratory!");
      setTitle("");
      setDescription("");
      await loadData();
    } catch (err) {
      // Local state fallback
      const newPr = {
        id: `pr-${Date.now()}`,
        title,
        description,
        difficulty,
        starter_code: starterCode
      };
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourseId) {
          return { ...c, problems: [...(c.problems || []), newPr] };
        }
        return c;
      }));
      setTitle("");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (window.confirm("Are you sure you want to delete this problem from the laboratory?")) {
      try {
        await platformApi.deleteProblem(selectedCourseId, problemId);
        await loadData();
      } catch (err) {
        setCourses(prev => prev.map(c => {
          if (c.id === selectedCourseId) {
            return { ...c, problems: (c.problems || []).filter(p => p.id !== problemId) };
          }
          return c;
        }));
      }
    }
  };

  const getDifficultyBadgeClass = (diff) => {
    switch (diff?.toLowerCase()) {
      case "easy": return "pf-badge-success";
      case "medium": return "pf-badge-primary";
      case "hard": return "pf-badge-copper";
      default: return "pf-badge-gold";
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="pf-badge pf-badge-copper">Algorithm Laboratory</span>
            <span className="pf-badge pf-badge-gold">Mathematical Problem Sets</span>
          </div>
          <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>🧩 Problems Laboratory Studio</h1>
          <p className="pf-subtext">Author algorithmic puzzles, matrix verification tasks, state fidelity checkers, and mathematical exercises for students.</p>
        </div>
      </div>

      {/* Course Selector Toolbar */}
      <div className="pf-card" style={{ marginBottom: "1.75rem", padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1, minWidth: "280px" }}>
            <label style={{ fontSize: "0.875rem", fontWeight: "800", color: "#0F172A", whiteSpace: "nowrap" }}>
              🎯 Selected Course:
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
              🧩 {activeProblems.length} Lab Problem{activeProblems.length !== 1 ? "s" : ""}
            </span>
            <span className="pf-badge pf-badge-copper">
              🧪 Auto Test Runner Active
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
              ✨ Craft New Lab Problem
            </h2>
            <span className="pf-badge pf-badge-primary">Python NumPy</span>
          </div>

          <form onSubmit={handleAddProblem}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Problem Title *</label>
              <input
                type="text"
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                placeholder="e.g. Unitary Matrix Hermiticity & Orthogonality Validator"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Problem Description &amp; Mathematical Formulation *</label>
              <textarea
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                rows={3}
                placeholder="Given an NxN complex matrix U, verify whether U @ U† = I within numerical tolerance 1e-7..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Difficulty Rating</label>
              <select
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem", background: "#FFF" }}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Easy">Easy (Foundational)</option>
                <option value="Medium">Medium (Algebra &amp; Unitary Transforms)</option>
                <option value="Hard">Hard (Phase Estimation &amp; Quantum Oracles)</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>
                Starter Code &amp; Function Signature *
              </label>
              <textarea
                style={{
                  width: "100%",
                  padding: "0.875rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #1E293B",
                  background: "#0F172A",
                  color: "#34D399",
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

            <button
              type="submit"
              disabled={loading}
              className="pf-btn pf-btn-copper"
              style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem" }}
            >
              {loading ? "Publishing Problem..." : "🚀 Publish Problem to Laboratory"}
            </button>
          </form>
        </div>

        {/* Problems Catalog Right */}
        <div className="pf-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
              🧪 Laboratory Catalog ({activeProblems.length})
            </h2>
            <span className="pf-badge pf-badge-primary">Active</span>
          </div>

          {activeProblems.length === 0 ? (
            <div style={{ padding: "2.5rem 1rem", textAlign: "center", background: "#F8FAFC", borderRadius: "10px", border: "1px dashed #CBD5E1", color: "#64748B" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🧩</div>
              <div style={{ fontWeight: "700", color: "#0F172A" }}>No Problems in Laboratory Yet</div>
              <p style={{ fontSize: "0.8125rem", marginTop: "4px" }}>Craft your first algorithm puzzle using the form on the left.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.15rem" }}>
              {activeProblems.map(pr => (
                <div key={pr.id} style={{ border: "1px solid #E2E8F0", borderRadius: "10px", padding: "1.15rem", background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "8px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "6px", marginBottom: "4px" }}>
                        <span className={`pf-badge ${getDifficultyBadgeClass(pr.difficulty)}`}>
                          {pr.difficulty || "Medium"}
                        </span>
                      </div>
                      <h4 style={{ fontWeight: "800", fontSize: "0.95rem", color: "#0F172A", margin: 0 }}>
                        {pr.title}
                      </h4>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => setPreviewProblem(pr)}
                        className="pf-btn pf-btn-secondary pf-btn-sm"
                        title="View Problem Details"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleDeleteProblem(pr.id)}
                        className="pf-btn pf-btn-danger pf-btn-sm"
                        title="Delete Problem"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <p style={{ fontSize: "0.8125rem", color: "#64748B", margin: "6px 0 0", lineHeight: "1.45" }}>
                    {pr.description}
                  </p>

                  {/* Compact Code Preview */}
                  {pr.starter_code && (
                    <div style={{ marginTop: "0.75rem", background: "#0F172A", borderRadius: "6px", padding: "8px 12px", fontSize: "0.75rem", fontFamily: "'JetBrains Mono', monospace", color: "#34D399", maxHeight: "80px", overflow: "hidden" }}>
                      <code>{pr.starter_code}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Problem Preview Modal */}
      {previewProblem && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="pf-card" style={{ maxWidth: "650px", width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  🧩 {previewProblem.title}
                </h3>
                <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                  <span className={`pf-badge ${getDifficultyBadgeClass(previewProblem.difficulty)}`}>
                    {previewProblem.difficulty}
                  </span>
                </div>
              </div>
              <button onClick={() => setPreviewProblem(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748B" }}>✕</button>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.35rem" }}>Mathematical Specification</h4>
              <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>{previewProblem.description}</p>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "0.875rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.35rem" }}>Starter Code &amp; Function</h4>
              <div style={{ background: "#0F172A", borderRadius: "8px", padding: "1rem", fontSize: "0.8125rem", fontFamily: "'JetBrains Mono', monospace", color: "#34D399", overflowX: "auto" }}>
                <pre style={{ margin: 0 }}>{previewProblem.starter_code}</pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
