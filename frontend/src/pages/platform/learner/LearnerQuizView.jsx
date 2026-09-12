import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { platformApi } from "../../../services/platformApi";

export default function LearnerQuizView() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submittedResult, setSubmittedResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await platformApi.getCourse(courseId);
        setCourse(c);
        const q = c.quizzes?.find(item => item.id === quizId);
        if (q) {
          setQuiz(q);
          setTimeLeft(q.time_limit_mins * 60);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, quizId]);

  // Timer countdown
  useEffect(() => {
    if (submittedResult || timeLeft === null || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, submittedResult]);

  const handleSelectAnswer = (qId, optIdx) => {
    if (submittedResult) return;
    setAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (submittedResult) return;
    try {
      const res = await platformApi.submitQuiz(courseId, quizId, answers);
      setSubmittedResult(res);
    } catch (err) {
      alert("Submission error: " + err.message);
    }
  };

  if (loading || !quiz) {
    return <div style={{ padding: "4rem", textAlign: "center", color: "#64748B" }}>Loading Quiz...</div>;
  }

  const formatTimer = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Quiz Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to={`/learner/course/${courseId}`} style={{ color: "#64748B", textDecoration: "none", fontSize: "0.875rem" }}>
          &larr; Back to Course Player
        </Link>
        {!submittedResult && timeLeft !== null && (
          <div style={{ background: timeLeft < 60 ? "#FEF2F2" : "#EFF6FF", color: timeLeft < 60 ? "#EF4444" : "#2563EB", padding: "6px 14px", borderRadius: "9999px", fontWeight: "700", fontSize: "0.875rem" }}>
            ⏱️ Time Remaining: {formatTimer(timeLeft)}
          </div>
        )}
      </div>

      <div className="pf-card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
          <div>
            <span className="pf-badge pf-badge-primary" style={{ marginBottom: "4px" }}>Knowledge Evaluation</span>
            <h1 className="pf-heading-lg">{quiz.title}</h1>
            <p className="pf-subtext" style={{ marginTop: "4px" }}>{quiz.description}</p>
          </div>
          <div style={{ textAlign: "right", fontSize: "0.8125rem", color: "#64748B" }}>
            <div>Passing Target: <strong>{quiz.passing_score}%</strong></div>
            <div>Questions: <strong>{quiz.questions?.length || 0}</strong></div>
          </div>
        </div>
      </div>

      {/* Result Card if submitted */}
      {submittedResult && (
        <div className="pf-card" style={{ marginBottom: "2rem", border: `2px solid ${submittedResult.passed ? "#10B981" : "#EF4444"}`, background: submittedResult.passed ? "#F0FDF4" : "#FEF2F2" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "1.25rem", fontWeight: "800", color: submittedResult.passed ? "#166534" : "#991B1B", marginBottom: "4px" }}>
                {submittedResult.passed ? "🎉 Congratulations! You Passed!" : "❌ Passing Score Not Met"}
              </div>
              <p style={{ fontSize: "0.875rem", color: submittedResult.passed ? "#15803D" : "#B91C1C" }}>
                You scored {submittedResult.score}% ({submittedResult.correct_count} of {submittedResult.total_questions} correct).
                Required passing grade: {submittedResult.passing_score}%.
              </p>
            </div>
            <button
              onClick={() => navigate(`/learner/course/${courseId}`)}
              className="pf-btn pf-btn-primary"
            >
              Continue Course &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
        {quiz.questions?.map((q, qIndex) => {
          const resDetail = submittedResult?.results?.find(r => r.question_id === q.id);
          const selectedAns = answers[q.id];

          return (
            <div key={q.id} className="pf-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontWeight: "700", color: "#2563EB", fontSize: "0.875rem" }}>
                  Question {qIndex + 1}
                </span>
                {resDetail && (
                  <span className={`pf-badge ${resDetail.is_correct ? "pf-badge-success" : "pf-badge-danger"}`}>
                    {resDetail.is_correct ? "✓ Correct" : "✕ Incorrect"}
                  </span>
                )}
              </div>

              <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#0F172A", marginBottom: "1.25rem" }}>
                {q.question}
              </h3>

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {q.options?.map((opt, optIndex) => {
                  const isChosen = selectedAns === optIndex;
                  let optStyle = {
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "0.875rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    background: isChosen ? "#EFF6FF" : "#FFFFFF",
                    cursor: submittedResult ? "default" : "pointer",
                    transition: "all 0.15s ease"
                  };

                  if (submittedResult) {
                    if (optIndex === q.correct_answer_index) {
                      optStyle.background = "#DCFCE7";
                      optStyle.borderColor = "#86EFAC";
                    } else if (isChosen && !resDetail?.is_correct) {
                      optStyle.background = "#FEE2E2";
                      optStyle.borderColor = "#FCA5A5";
                    }
                  }

                  return (
                    <div
                      key={optIndex}
                      style={optStyle}
                      onClick={() => handleSelectAnswer(q.id, optIndex)}
                    >
                      <input
                        type="radio"
                        name={`quiz-q-${q.id}`}
                        checked={isChosen}
                        onChange={() => handleSelectAnswer(q.id, optIndex)}
                        disabled={!!submittedResult}
                      />
                      <span style={{ fontSize: "0.9375rem", color: "#1E293B" }}>{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanation (Shown upon submission) */}
              {submittedResult && q.explanation && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", background: "#F8FAFC", borderRadius: "6px", border: "1px solid #E2E8F0", fontSize: "0.8125rem", color: "#475569" }}>
                  <strong>💡 Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      {!submittedResult && (
        <button
          onClick={handleSubmitQuiz}
          className="pf-btn pf-btn-primary pf-btn-lg"
          style={{ width: "100%", marginBottom: "3rem" }}
        >
          🚀 Submit Quiz & Calculate Grade
        </button>
      )}
    </div>
  );
}
