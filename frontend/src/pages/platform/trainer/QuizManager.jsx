import React, { useEffect, useState } from "react";
import { platformApi } from "../../../services/platformApi";
import { DEFAULT_COURSES } from "../../../services/defaultPlatformData";

export default function QuizManager() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState(DEFAULT_COURSES[0].id);
  
  // Quiz Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimitMins, setTimeLimitMins] = useState(15);
  const [passingScore, setPassingScore] = useState(75);
  
  // Questions in this quiz
  const [questions, setQuestions] = useState([
    {
      question: "What is the mathematical state resulting from applying a Hadamard (H) gate to computational basis state |0⟩?",
      options: [
        "|1⟩",
        "(|0⟩ + |1⟩) / √2",
        "(|0⟩ - |1⟩) / √2",
        "|0⟩"
      ],
      correct_answer_index: 1,
      explanation: "The Hadamard gate maps computational basis state |0⟩ to equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2."
    },
    {
      question: "Which Pauli matrix corresponds to a 180° rotation around the Z-axis of the Bloch sphere?",
      options: [
        "Pauli-X",
        "Pauli-Y",
        "Pauli-Z (Phase Flip)",
        "Identity (I)"
      ],
      correct_answer_index: 2,
      explanation: "Pauli-Z matrix [[1, 0], [0, -1]] adds a π relative phase to state |1⟩ while leaving |0⟩ invariant."
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState(null);

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
      console.warn("Quiz manager using fallback courses:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCourse = courses.find(c => c.id === selectedCourseId) || courses[0];
  const activeQuizzes = activeCourse?.quizzes || [];

  const handleAddQuestionField = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correct_answer_index: 0,
        explanation: ""
      }
    ]);
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (qIndex) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  const handleSaveQuiz = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    if (questions.some(q => !q.question.trim())) {
      alert("Please fill in question text for all questions.");
      return;
    }
    setLoading(true);
    try {
      await platformApi.addQuiz(selectedCourseId, {
        title,
        description,
        time_limit_mins: parseInt(timeLimitMins, 10),
        passing_score: parseFloat(passingScore),
        questions
      });
      alert("Quiz successfully created and published!");
      setTitle("");
      setDescription("");
      await loadData();
    } catch (err) {
      // Local responsive update
      const newQuiz = {
        id: `qz-${Date.now()}`,
        title,
        description,
        time_limit_mins: parseInt(timeLimitMins, 10),
        passing_score: parseFloat(passingScore),
        questions
      };
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourseId) {
          return { ...c, quizzes: [...(c.quizzes || []), newQuiz] };
        }
        return c;
      }));
      setTitle("");
      setDescription("");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await platformApi.deleteQuiz(selectedCourseId, quizId);
        await loadData();
      } catch (err) {
        setCourses(prev => prev.map(c => {
          if (c.id === selectedCourseId) {
            return { ...c, quizzes: (c.quizzes || []).filter(q => q.id !== quizId) };
          }
          return c;
        }));
      }
    }
  };

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="pf-badge pf-badge-copper">Evaluations Desk</span>
            <span className="pf-badge pf-badge-gold">Automated Grading</span>
          </div>
          <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>❓ Interactive Quiz Authoring Studio</h1>
          <p className="pf-subtext">Construct timed multiple-choice assessments with immediate feedback, score requirements, and answer explanations.</p>
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
              📚 {activeQuizzes.length} Active Quizzes
            </span>
            <span className="pf-badge pf-badge-copper">
              ⏱️ Passing Criteria: 70%+
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Active Quizzes Right */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "1.75rem", alignItems: "start" }}>
        
        {/* Quiz Creator Form */}
        <div className="pf-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
              ✨ Build New Quiz
            </h2>
            <span style={{ fontSize: "0.78rem", color: "#64748B", fontWeight: "600" }}>
              {questions.length} Question{questions.length > 1 ? "s" : ""} Defined
            </span>
          </div>

          <form onSubmit={handleSaveQuiz}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Quiz Title *</label>
              <input
                type="text"
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                placeholder="e.g. Unit 2: Bell States & Entanglement Mastery Check"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Description & Instructions</label>
              <textarea
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                rows={2}
                placeholder="Test your grasp of single and two-qubit gate operations and matrix products..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Time Limit (Minutes)</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  min={1}
                  value={timeLimitMins}
                  onChange={(e) => setTimeLimitMins(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Passing Threshold (%)</label>
                <input
                  type="number"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Questions Container */}
            <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "1.25rem", marginTop: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  Question List ({questions.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddQuestionField}
                  className="pf-btn pf-btn-secondary pf-btn-sm"
                  style={{ fontWeight: "700" }}
                >
                  ➕ Add Question
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {questions.map((q, qIndex) => (
                  <div key={qIndex} style={{ border: "1px solid #CBD5E1", borderRadius: "10px", padding: "1.15rem", background: "#F8FAFC" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontWeight: "800", fontSize: "0.875rem", color: "#3A68A4" }}>
                          Question #{qIndex + 1}
                        </span>
                        <span style={{ fontSize: "0.72rem", color: "#64748B" }}>
                          (Select correct option below)
                        </span>
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIndex)}
                          className="pf-btn pf-btn-danger pf-btn-sm"
                          style={{ padding: "2px 8px", fontSize: "0.75rem" }}
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>

                    <div style={{ marginBottom: "0.85rem" }}>
                      <input
                        type="text"
                        style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem", background: "#FFFFFF" }}
                        placeholder="Enter the question text..."
                        value={q.question}
                        onChange={(e) => handleQuestionChange(qIndex, "question", e.target.value)}
                        required
                      />
                    </div>

                    {/* Options Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem", marginBottom: "0.85rem" }}>
                      {q.options.map((opt, optIndex) => {
                        const isCorrect = q.correct_answer_index === optIndex;
                        return (
                          <div
                            key={optIndex}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "6px 10px",
                              background: isCorrect ? "#F0FDF4" : "#FFFFFF",
                              border: isCorrect ? "1.5px solid #22C55E" : "1px solid #CBD5E1",
                              borderRadius: "8px",
                              transition: "all 0.15s ease"
                            }}
                          >
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={isCorrect}
                              onChange={() => handleQuestionChange(qIndex, "correct_answer_index", optIndex)}
                              style={{ cursor: "pointer", accentColor: "#15803D" }}
                            />
                            <input
                              type="text"
                              style={{ width: "100%", border: "none", background: "transparent", fontSize: "0.8125rem", outline: "none", color: "#0F172A", fontWeight: isCorrect ? "700" : "500" }}
                              value={opt}
                              onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                              placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                              required
                            />
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <input
                        type="text"
                        style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "0.8125rem", background: "#FFFFFF", color: "#475569" }}
                        placeholder="💡 Explanation of correct answer (displayed after quiz submission)..."
                        value={q.explanation || ""}
                        onChange={(e) => handleQuestionChange(qIndex, "explanation", e.target.value)}
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
              {loading ? "Publishing Quiz..." : "🚀 Save & Publish Quiz"}
            </button>
          </form>
        </div>

        {/* Existing Quizzes Panel */}
        <div className="pf-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
              📋 Published Quizzes ({activeQuizzes.length})
            </h2>
            <span className="pf-badge pf-badge-primary">Live</span>
          </div>

          {activeQuizzes.length === 0 ? (
            <div style={{ padding: "2.5rem 1rem", textAlign: "center", background: "#F8FAFC", borderRadius: "10px", border: "1px dashed #CBD5E1", color: "#64748B" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>❓</div>
              <div style={{ fontWeight: "700", color: "#0F172A" }}>No Quizzes Created Yet</div>
              <p style={{ fontSize: "0.8125rem", marginTop: "4px" }}>Build your first quiz using the form on the left.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {activeQuizzes.map(quiz => (
                <div key={quiz.id} style={{ border: "1px solid #E2E8F0", borderRadius: "10px", padding: "1.15rem", background: "#FFFFFF", boxShadow: "0 2px 6px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem", gap: "8px" }}>
                    <div>
                      <h4 style={{ fontWeight: "800", fontSize: "0.95rem", color: "#0F172A", margin: 0 }}>
                        {quiz.title}
                      </h4>
                      <p style={{ fontSize: "0.8125rem", color: "#64748B", margin: "4px 0 0" }}>
                        {quiz.description || "No description provided."}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button
                        onClick={() => setPreviewQuiz(quiz)}
                        className="pf-btn pf-btn-secondary pf-btn-sm"
                        title="Preview Questions"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="pf-btn pf-btn-danger pf-btn-sm"
                        title="Delete Quiz"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.78rem", color: "#475569", borderTop: "1px solid #F1F5F9", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
                    <span style={{ fontWeight: "700" }}>⏱️ {quiz.time_limit_mins || 15} mins</span>
                    <span style={{ fontWeight: "700" }}>🎯 Pass: {quiz.passing_score || 70}%</span>
                    <span style={{ fontWeight: "700" }}>❓ {quiz.questions?.length || 0} Questions</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quiz Preview Modal */}
      {previewQuiz && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="pf-card" style={{ maxWidth: "600px", width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
              <div>
                <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  👁️ Quiz Preview: {previewQuiz.title}
                </h3>
                <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "2px" }}>
                  Time Limit: {previewQuiz.time_limit_mins}m • Passing: {previewQuiz.passing_score}%
                </div>
              </div>
              <button onClick={() => setPreviewQuiz(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748B" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {previewQuiz.questions?.map((q, idx) => (
                <div key={idx} style={{ padding: "1rem", borderRadius: "8px", background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div style={{ fontWeight: "700", fontSize: "0.875rem", color: "#0F172A", marginBottom: "0.5rem" }}>
                    {idx + 1}. {q.question}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    {q.options?.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "0.8125rem",
                          background: q.correct_answer_index === oIdx ? "#DCFCE7" : "#FFFFFF",
                          border: q.correct_answer_index === oIdx ? "1px solid #22C55E" : "1px solid #E2E8F0",
                          color: q.correct_answer_index === oIdx ? "#15803D" : "#334155",
                          fontWeight: q.correct_answer_index === oIdx ? "700" : "500"
                        }}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt} {q.correct_answer_index === oIdx ? "✓" : ""}
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div style={{ fontSize: "0.75rem", color: "#64748B", fontStyle: "italic", background: "#EFF6FB", padding: "6px 8px", borderRadius: "6px" }}>
                      💡 {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
