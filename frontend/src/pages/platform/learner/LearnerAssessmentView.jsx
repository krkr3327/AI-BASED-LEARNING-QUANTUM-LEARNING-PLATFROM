import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { platformApi } from "../../../services/platformApi";
import { platformAuth } from "../../../services/platformAuth";

export default function LearnerAssessmentView() {
  const { courseId, assessmentId } = useParams();
  const navigate = useNavigate();
  const user = platformAuth.getUser();

  const [course, setCourse] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [c, subs] = await Promise.all([
          platformApi.getCourse(courseId),
          platformApi.getSubmissions({ learner_id: user?.id })
        ]);
        setCourse(c);
        const asm = c.assessments?.find(a => a.id === assessmentId);
        setAssessment(asm);

        const existingSub = subs.find(s => s.assessment_id === assessmentId);
        if (existingSub) {
          setSubmission(existingSub);
          setAnswers(existingSub.answers || {});
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, assessmentId, user?.id]);

  const handleAnswerChange = (qId, text) => {
    if (submission) return;
    setAnswers(prev => ({ ...prev, [qId]: text }));
  };

  const handleSubmitAssessment = async (e) => {
    e.preventDefault();
    if (submission) return;
    setSubmitting(true);
    try {
      const sub = await platformApi.submitAssessment(assessmentId, courseId, answers);
      setSubmission(sub);
      alert("Assessment successfully submitted for instructor evaluation!");
    } catch (err) {
      alert("Submission failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !assessment) {
    return <div style={{ padding: "4rem", textAlign: "center", color: "#64748B" }}>Loading Assessment Room...</div>;
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Navigation */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link to={`/learner/course/${courseId}`} style={{ color: "#64748B", textDecoration: "none", fontSize: "0.875rem" }}>
          &larr; Back to Course Player
        </Link>
      </div>

      {/* Header */}
      <div className="pf-card" style={{ marginBottom: "2rem" }}>
        <span className="pf-badge pf-badge-primary" style={{ marginBottom: "0.5rem" }}>Official Assessment</span>
        <h1 className="pf-heading-lg" style={{ marginBottom: "0.5rem" }}>{assessment.title}</h1>
        <p className="pf-subtext" style={{ marginBottom: "1rem" }}>{assessment.description}</p>

        <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.8125rem", color: "#475569", borderTop: "1px solid #E2E8F0", paddingTop: "0.75rem", flexWrap: "wrap" }}>
          <span>🏆 Total Marks: <strong>{assessment.total_marks} Marks</strong></span>
          <span>⏳ Submission Deadline: <strong>{assessment.deadline ? new Date(assessment.deadline).toLocaleDateString() : "Flexible"}</strong></span>
          <span>📜 Instructions: <em>{assessment.instructions}</em></span>
        </div>
      </div>

      {/* Submission / Grading Status Banner */}
      {submission && (
        <div className="pf-card" style={{ marginBottom: "2rem", border: `2px solid ${submission.status === "graded" ? "#10B981" : "#3B82F6"}`, background: submission.status === "graded" ? "#ECFDF5" : "#EFF6FF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "1.125rem", fontWeight: "700", color: submission.status === "graded" ? "#065F46" : "#1E40AF", marginBottom: "4px" }}>
                {submission.status === "graded" ? "🎓 Assessment Graded by Instructor" : "📬 Submission Received — Under Review"}
              </div>
              <div style={{ fontSize: "0.875rem", color: submission.status === "graded" ? "#047857" : "#1D4ED8" }}>
                Submitted on: {new Date(submission.submitted_at).toLocaleString()}
              </div>

              {submission.status === "graded" && (
                <div style={{ marginTop: "0.75rem", background: "#FFFFFF", padding: "0.875rem", borderRadius: "8px", border: "1px solid #A7F3D0" }}>
                  <div style={{ fontWeight: "700", color: "#065F46", fontSize: "0.9375rem" }}>
                    Score Awarded: {submission.score} / {assessment.total_marks} Marks
                  </div>
                  <div style={{ fontSize: "0.875rem", color: "#374151", marginTop: "4px" }}>
                    <strong>Instructor Feedback:</strong> {submission.feedback}
                  </div>
                </div>
              )}
            </div>

            <span className={`pf-badge ${submission.status === "graded" ? "pf-badge-success" : "pf-badge-primary"}`}>
              {submission.status === "graded" ? "Graded" : "Submitted"}
            </span>
          </div>
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmitAssessment}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2rem" }}>
          {assessment.questions?.map((q, idx) => (
            <div key={q.id} className="pf-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <span style={{ fontWeight: "700", color: "#2563EB", fontSize: "0.875rem" }}>Question {idx + 1}</span>
                <span className="pf-badge pf-badge-secondary">{q.max_marks} Marks</span>
              </div>

              <h3 style={{ fontSize: "1rem", fontWeight: "600", color: "#0F172A", marginBottom: "1rem", lineHeight: "1.5" }}>
                {q.question}
              </h3>

              <div className="pf-input-group" style={{ marginBottom: 0 }}>
                <label className="pf-label">Your Response:</label>
                <textarea
                  className="pf-textarea"
                  rows={6}
                  placeholder={submission ? "" : "Type your thorough theoretical explanation and calculations..."}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  disabled={!!submission}
                  required
                />
              </div>
            </div>
          ))}
        </div>

        {!submission && (
          <button
            type="submit"
            disabled={submitting}
            className="pf-btn pf-btn-primary pf-btn-lg"
            style={{ width: "100%", marginBottom: "3rem" }}
          >
            {submitting ? "Submitting Exam..." : "📤 Submit Assessment for Grading"}
          </button>
        )}
      </form>
    </div>
  );
}
