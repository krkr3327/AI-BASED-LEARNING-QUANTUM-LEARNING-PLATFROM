import React, { useEffect, useState } from "react";
import { platformApi } from "../../../services/platformApi";
import { DEFAULT_COURSES, DEFAULT_SUBMISSIONS } from "../../../services/defaultPlatformData";

export default function AssessmentManager() {
  const [activeTab, setActiveTab] = useState("creator"); // 'creator' | 'grading'
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState(DEFAULT_COURSES[0].id);
  const [submissions, setSubmissions] = useState(DEFAULT_SUBMISSIONS);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Assessment Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("2026-11-30T23:59");
  const [instructions, setInstructions] = useState("Show detailed mathematical derivations for all projection measurements. Justify your tensor product dimensions.");
  const [questions, setQuestions] = useState([
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
  ]);

  // Grading form
  const [gradeScore, setGradeScore] = useState(45);
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [cList, subs] = await Promise.all([
        platformApi.getCourses().catch(() => []),
        platformApi.getSubmissions().catch(() => [])
      ]);
      if (Array.isArray(cList) && cList.length > 0) {
        setCourses(cList);
        if (!selectedCourseId) {
          setSelectedCourseId(cList[0].id);
        }
      }
      if (Array.isArray(subs) && subs.length > 0) {
        setSubmissions(subs);
      } else {
        setSubmissions(DEFAULT_SUBMISSIONS);
      }
    } catch (err) {
      console.warn("Assessment manager fallback:", err);
      setSubmissions(DEFAULT_SUBMISSIONS);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const activeAssessments = activeCourse?.assessments || [];
  const pendingCount = submissions.filter(s => s.status === "pending").length;

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        max_marks: 25,
        guidelines: ""
      }
    ]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = field === "max_marks" ? parseFloat(value) || 0 : value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const totalCalculatedMarks = questions.reduce((sum, q) => sum + (parseFloat(q.max_marks) || 0), 0);

  const handleCreateAssessment = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    if (questions.some(q => !q.question.trim())) {
      alert("Please provide question text for all assessment questions.");
      return;
    }
    setLoading(true);
    try {
      await platformApi.addAssessment(selectedCourseId, {
        title,
        description,
        deadline,
        instructions,
        total_marks: totalCalculatedMarks,
        questions
      });
      alert("Formal Assessment created and published!");
      setTitle("");
      setDescription("");
      await loadData();
    } catch (err) {
      // Local responsive update
      const newAsm = {
        id: `asm-${Date.now()}`,
        title,
        description,
        deadline,
        instructions,
        total_marks: totalCalculatedMarks,
        questions
      };
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourseId) {
          return { ...c, assessments: [...(c.assessments || []), newAsm] };
        }
        return c;
      }));
      setTitle("");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssessment = async (asmId) => {
    if (window.confirm("Are you sure you want to delete this assessment?")) {
      try {
        await platformApi.deleteAssessment(selectedCourseId, asmId);
        await loadData();
      } catch (err) {
        setCourses(prev => prev.map(c => {
          if (c.id === selectedCourseId) {
            return { ...c, assessments: (c.assessments || []).filter(a => a.id !== asmId) };
          }
          return c;
        }));
      }
    }
  };

  const handleOpenGradeModal = (sub) => {
    setSelectedSubmission(sub);
    setGradeScore(sub.score !== null ? sub.score : Math.round((sub.max_marks || 50) * 0.85));
    setGradeFeedback(sub.feedback || "Solid mathematical derivation. Proper Hilbert tensor product expansion demonstrated.");
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    setLoading(true);
    try {
      await platformApi.gradeSubmission(selectedSubmission.id, parseFloat(gradeScore), gradeFeedback);
      alert("Grade and faculty feedback recorded!");
      setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? { ...s, status: "graded", score: parseFloat(gradeScore), feedback: gradeFeedback } : s));
      setSelectedSubmission(null);
    } catch (err) {
      setSubmissions(prev => prev.map(s => s.id === selectedSubmission.id ? { ...s, status: "graded", score: parseFloat(gradeScore), feedback: gradeFeedback } : s));
      setSelectedSubmission(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header & Tab Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="pf-badge pf-badge-copper">Evaluations &amp; Examination</span>
            <span className="pf-badge pf-badge-gold">Live Term 2026</span>
          </div>
          <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>📑 Formal Assessments &amp; Grading Desk</h1>
          <p className="pf-subtext">Author written theoretical examinations, set comprehensive grading rubrics, and review student submissions.</p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", background: "rgba(255,255,255,0.9)", padding: "5px", borderRadius: "12px", border: "1px solid #CBD5E1", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
          <button
            onClick={() => setActiveTab("creator")}
            style={{
              padding: "0.55rem 1.25rem",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "creator" ? "linear-gradient(135deg, #A77B5A, #8C6243)" : "transparent",
              color: activeTab === "creator" ? "#FFFFFF" : "#475569",
              fontWeight: "700",
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            ✏️ Author Assessments
          </button>
          <button
            onClick={() => setActiveTab("grading")}
            style={{
              padding: "0.55rem 1.25rem",
              borderRadius: "8px",
              border: "none",
              background: activeTab === "grading" ? "linear-gradient(135deg, #3A68A4, #2C3F60)" : "transparent",
              color: activeTab === "grading" ? "#FFFFFF" : "#475569",
              fontWeight: "700",
              fontSize: "0.875rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "all 0.2s ease"
            }}
          >
            📑 Live Grading Desk
            {pendingCount > 0 && (
              <span style={{ background: "#AD6358", color: "#FFF", fontSize: "0.7rem", padding: "1px 6px", borderRadius: "9999px", fontWeight: "800" }}>
                {pendingCount} Pending
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === "creator" ? (
        <div>
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
                  📑 {activeAssessments.length} Published Exam{activeAssessments.length !== 1 ? "s" : ""}
                </span>
                <span className="pf-badge pf-badge-copper">
                  ⚖️ Total Marks: {totalCalculatedMarks} pts
                </span>
              </div>
            </div>
          </div>

          {/* Assessment Creator 2-Column Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.75rem", alignItems: "start" }}>
            {/* Form */}
            <div className="pf-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  📝 Create Formal Examination
                </h2>
                <span className="pf-badge pf-badge-gold">
                  {totalCalculatedMarks} Total Points
                </span>
              </div>

              <form onSubmit={handleCreateAssessment}>
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Assessment Title *</label>
                  <input
                    type="text"
                    style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                    placeholder="e.g. Mid-Term Comprehensive Exam: Dirac Formalism & Bell States"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Description & Scope</label>
                  <textarea
                    style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                    rows={2}
                    placeholder="Rigorous theoretical derivation of bipartite quantum density matrices..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Submission Deadline</label>
                    <input
                      type="datetime-local"
                      style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Calculated Max Marks</label>
                    <div style={{ padding: "0.625rem 0.875rem", borderRadius: "8px", background: "#EFF6FB", border: "1px solid #AFD8F4", fontSize: "0.875rem", fontWeight: "800", color: "#3A68A4" }}>
                      {totalCalculatedMarks} Points Total
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Student Guidelines & Rubric Instructions</label>
                  <textarea
                    style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                    rows={2}
                    placeholder="Provide detailed mathematical derivations for all projection measurements..."
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </div>

                {/* Questions Builder */}
                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                      Questions &amp; Grading Rubric ({questions.length})
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="pf-btn pf-btn-secondary pf-btn-sm"
                      style={{ fontWeight: "700" }}
                    >
                      ➕ Add Question
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {questions.map((q, idx) => (
                      <div key={idx} style={{ border: "1px solid #CBD5E1", borderRadius: "10px", padding: "1.15rem", background: "#F8FAFC" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={{ fontWeight: "800", fontSize: "0.875rem", color: "#A77B5A" }}>
                              Question #{idx + 1}
                            </span>
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <label style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: "600" }}>Max Marks:</label>
                              <input
                                type="number"
                                min={1}
                                style={{ width: "60px", padding: "2px 6px", borderRadius: "6px", border: "1px solid #CBD5E1", fontSize: "0.8125rem", fontWeight: "700", textAlign: "center" }}
                                value={q.max_marks}
                                onChange={(e) => handleQuestionChange(idx, "max_marks", e.target.value)}
                              />
                            </div>
                          </div>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(idx)}
                              className="pf-btn pf-btn-danger pf-btn-sm"
                              style={{ padding: "2px 8px", fontSize: "0.75rem" }}
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>

                        <div style={{ marginBottom: "0.75rem" }}>
                          <textarea
                            style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem", background: "#FFFFFF" }}
                            rows={2}
                            placeholder="Enter the comprehensive theoretical question..."
                            value={q.question}
                            onChange={(e) => handleQuestionChange(idx, "question", e.target.value)}
                            required
                          />
                        </div>

                        <div>
                          <input
                            type="text"
                            style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "0.8125rem", background: "#FFFFFF", color: "#475569" }}
                            placeholder="🎯 Grading criteria (e.g. check for: Born rule formulation, projection operators P_m)..."
                            value={q.guidelines || ""}
                            onChange={(e) => handleQuestionChange(idx, "guidelines", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="pf-btn pf-btn-copper"
                  style={{ width: "100%", marginTop: "1.5rem", padding: "0.75rem", fontSize: "0.95rem" }}
                >
                  {loading ? "Publishing Assessment..." : "🚀 Publish Formal Assessment"}
                </button>
              </form>
            </div>

            {/* Published Assessments List */}
            <div className="pf-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
                <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  📚 Published Exams ({activeAssessments.length})
                </h2>
                <span className="pf-badge pf-badge-primary">Active</span>
              </div>

              {activeAssessments.length === 0 ? (
                <div style={{ padding: "2.5rem 1rem", textAlign: "center", background: "#F8FAFC", borderRadius: "10px", border: "1px dashed #CBD5E1", color: "#64748B" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📑</div>
                  <div style={{ fontWeight: "700", color: "#0F172A" }}>No Formal Assessments Yet</div>
                  <p style={{ fontSize: "0.8125rem", marginTop: "4px" }}>Author your first exam using the form on the left.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {activeAssessments.map(asm => (
                    <div key={asm.id} style={{ border: "1px solid #E2E8F0", borderRadius: "10px", padding: "1.15rem", background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "8px" }}>
                        <div>
                          <h4 style={{ fontWeight: "800", fontSize: "0.95rem", color: "#0F172A", margin: 0 }}>
                            {asm.title}
                          </h4>
                          <p style={{ fontSize: "0.8125rem", color: "#64748B", margin: "4px 0 0" }}>
                            {asm.description || "No description provided."}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAssessment(asm.id)}
                          className="pf-btn pf-btn-danger pf-btn-sm"
                          title="Delete Assessment"
                        >
                          🗑️
                        </button>
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.78rem", color: "#475569", borderTop: "1px solid #F1F5F9", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
                        <span style={{ fontWeight: "700" }}>⚖️ {asm.total_marks || 50} Marks</span>
                        <span style={{ fontWeight: "700" }}>❓ {asm.questions?.length || 0} Questions</span>
                        <span style={{ fontWeight: "700", color: "#A77B5A" }}>📅 Due: {asm.deadline?.replace("T", " ") || "N/A"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* LIVE GRADING DESK TAB */
        <div className="pf-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                📑 Student Submissions &amp; Evaluation Queue
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "#64748B", margin: "4px 0 0" }}>
                Review written responses, evaluate against grading rubrics, and deliver faculty feedback.
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <span className="pf-badge pf-badge-copper">
                {submissions.length} Total Submissions
              </span>
              <span className="pf-badge pf-badge-gold">
                {pendingCount} Pending Review
              </span>
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#F8FAFC", borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "800", color: "#334155" }}>Student</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "800", color: "#334155" }}>Assessment Title</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "800", color: "#334155" }}>Submitted At</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "800", color: "#334155" }}>Status &amp; Score</th>
                  <th style={{ padding: "0.75rem 1rem", fontWeight: "800", color: "#334155", textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: "1px solid #E2E8F0", transition: "background 0.15s ease" }}>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg, #3A68A4, #2C3F60)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "0.85rem" }}>
                          {sub.learner_name?.[0] || "S"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", color: "#0F172A" }}>{sub.learner_name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{sub.learner_email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: "700", color: "#0F172A" }}>{sub.assessment_title}</div>
                      <div style={{ fontSize: "0.75rem", color: "#3A68A4" }}>{sub.course_title}</div>
                    </td>
                    <td style={{ padding: "1rem", color: "#475569", fontSize: "0.8125rem" }}>
                      {sub.submitted_at?.replace("T", " ").replace("Z", "")}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {sub.status === "graded" ? (
                        <span className="pf-badge pf-badge-success" style={{ fontWeight: "800" }}>
                          ✓ Graded: {sub.score} / {sub.max_marks || 50}
                        </span>
                      ) : (
                        <span className="pf-badge pf-badge-warning" style={{ fontWeight: "800" }}>
                          ⏳ Pending Review
                        </span>
                      )}
                    </td>
                    <td style={{ padding: "1rem", textAlign: "right" }}>
                      <button
                        onClick={() => handleOpenGradeModal(sub)}
                        className={`pf-btn pf-btn-sm ${sub.status === "graded" ? "pf-btn-secondary" : "pf-btn-primary"}`}
                        style={{ fontWeight: "700" }}
                      >
                        {sub.status === "graded" ? "✏️ Edit Grade" : "⚖️ Grade & Feedback"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Grading Modal */}
      {selectedSubmission && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="pf-card" style={{ maxWidth: "750px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  ⚖️ Evaluate Student Submission
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "#64748B", margin: "2px 0 0" }}>
                  {selectedSubmission.learner_name} ({selectedSubmission.learner_email}) • {selectedSubmission.assessment_title}
                </p>
              </div>
              <button onClick={() => setSelectedSubmission(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748B" }}>✕</button>
            </div>

            {/* Student Answers Preview */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.75rem" }}>
                Student Written Responses
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {Object.entries(selectedSubmission.answers || {}).map(([qKey, ansText], i) => (
                  <div key={qKey} style={{ border: "1px solid #CBD5E1", borderRadius: "10px", padding: "1rem", background: "#F8FAFC" }}>
                    <div style={{ fontWeight: "800", fontSize: "0.875rem", color: "#3A68A4", marginBottom: "0.5rem" }}>
                      Question #{i + 1}
                    </div>
                    <div style={{ whiteSpace: "pre-wrap", fontSize: "0.875rem", lineHeight: "1.6", color: "#1E293B", background: "#FFFFFF", padding: "0.75rem 1rem", borderRadius: "8px", border: "1px solid #E2E8F0", fontFamily: "'Inter', sans-serif" }}>
                      {ansText}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grading Form */}
            <form onSubmit={handleSubmitGrade} style={{ borderTop: "2px solid #E2E8F0", paddingTop: "1.25rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.35rem" }}>
                    Awarded Score (out of {selectedSubmission.max_marks || 50}) *
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <input
                      type="number"
                      min={0}
                      max={selectedSubmission.max_marks || 50}
                      step={0.5}
                      style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "2px solid #3A68A4", fontSize: "1.1rem", fontWeight: "800", color: "#0F172A", textAlign: "center" }}
                      value={gradeScore}
                      onChange={(e) => setGradeScore(e.target.value)}
                      required
                    />
                    <span style={{ fontWeight: "700", color: "#64748B" }}>/ {selectedSubmission.max_marks || 50}</span>
                  </div>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.35rem" }}>
                    Faculty Evaluation &amp; Feedback *
                  </label>
                  <textarea
                    style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                    rows={3}
                    placeholder="Provide constructive feedback, highlight strong mathematical steps..."
                    value={gradeFeedback}
                    onChange={(e) => setGradeFeedback(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" onClick={() => setSelectedSubmission(null)} className="pf-btn pf-btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="pf-btn pf-btn-copper" style={{ fontWeight: "800" }}>
                  {loading ? "Recording Grade..." : "💾 Submit Grade & Send Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
