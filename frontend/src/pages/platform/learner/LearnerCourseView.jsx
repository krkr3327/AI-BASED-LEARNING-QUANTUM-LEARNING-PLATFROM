import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { platformApi } from "../../../services/platformApi";

export default function LearnerCourseView() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(null);
  const [activeItem, setActiveItem] = useState(null); // { type: 'lesson'|'notes'|'quiz'|'assessment'|'challenge'|'problem', data: ... }
  const [loading, setLoading] = useState(true);

  const loadCourseData = async () => {
    try {
      const [c, p] = await Promise.all([
        platformApi.getCourse(courseId),
        platformApi.getProgress(courseId)
      ]);
      setCourse(c);
      setProgress(p);

      // Default to first lesson if not set
      if (c.modules?.length > 0 && c.modules[0].lessons?.length > 0) {
        setActiveItem({
          type: "lesson",
          data: c.modules[0].lessons[0],
          moduleTitle: c.modules[0].title
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const handleMarkLessonComplete = async (lessonId) => {
    try {
      const updatedProg = await platformApi.markLessonComplete(courseId, lessonId);
      setProgress(updatedProg);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !course) {
    return (
      <div style={{ padding: "4rem", textAlign: "center", color: "#64748B" }}>
        Loading interactive classroom...
      </div>
    );
  }

  const completedLessonSet = new Set(progress?.completed_lesson_ids || []);
  const completedQuizSet = new Set(progress?.completed_quiz_ids || []);
  const completedAssessmentSet = new Set(progress?.completed_assessment_ids || []);
  const completedChallengeSet = new Set(progress?.completed_challenge_ids || []);
  const completedProblemSet = new Set(progress?.completed_problem_ids || []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Top Banner with Progress */}
      <div className="pf-card" style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Link to="/learner/dashboard" style={{ textDecoration: "none", color: "#64748B", fontSize: "0.8125rem" }}>
                &larr; Back to Dashboard
              </Link>
              <span className="pf-badge pf-badge-primary">{course.category}</span>
            </div>
            <h1 className="pf-heading-lg" style={{ fontSize: "1.375rem" }}>{course.title}</h1>
            <div style={{ fontSize: "0.8125rem", color: "#64748B" }}>
              Instructor: <strong>{course.trainer_name}</strong> • Level: {course.level}
            </div>
          </div>

          <div style={{ minWidth: "200px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "700", marginBottom: "4px" }}>
              <span style={{ color: "#64748B" }}>Course Completion</span>
              <span style={{ color: "#2563EB" }}>{progress?.overall_percentage || 0}%</span>
            </div>
            <div className="pf-progress-track">
              <div className="pf-progress-bar" style={{ width: `${progress?.overall_percentage || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Sidebar Navigator + Lesson Content Player */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Course Syllabus Navigator */}
        <div className="pf-card" style={{ padding: "1rem", maxHeight: "80vh", overflowY: "auto" }}>
          <h2 style={{ fontSize: "0.9375rem", fontWeight: "700", color: "#0F172A", marginBottom: "1rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.5rem" }}>
            📖 Course Syllabus
          </h2>

          {/* Modules List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {course.modules?.map((m, mIdx) => (
              <div key={m.id}>
                <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#475569", marginBottom: "0.5rem" }}>
                  {m.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "4px" }}>
                  {m.lessons?.map(les => {
                    const isDone = completedLessonSet.has(les.id);
                    const isActive = activeItem?.type === "lesson" && activeItem.data.id === les.id;
                    return (
                      <button
                        key={les.id}
                        onClick={() => setActiveItem({ type: "lesson", data: les, moduleTitle: m.title })}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 10px",
                          borderRadius: "6px",
                          border: "none",
                          background: isActive ? "#EFF6FF" : "transparent",
                          color: isActive ? "#2563EB" : "#334155",
                          fontWeight: isActive ? "600" : "500",
                          fontSize: "0.8125rem",
                          textAlign: "left",
                          cursor: "pointer",
                          transition: "all 0.15s ease"
                        }}
                      >
                        <span style={{ fontSize: "0.875rem" }}>
                          {isDone ? "✅" : les.type === "video" ? "🎥" : "📝"}
                        </span>
                        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {les.title}
                        </span>
                        <span style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>{les.duration}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Notes Section */}
            {course.notes?.length > 0 && (
              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "0.75rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#475569", marginBottom: "0.5rem" }}>
                  📁 Course Notes & Cheatsheets
                </div>
                <button
                  onClick={() => setActiveItem({ type: "notes", data: course.notes })}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    padding: "8px 10px",
                    borderRadius: "6px",
                    border: "none",
                    background: activeItem?.type === "notes" ? "#EFF6FF" : "transparent",
                    color: activeItem?.type === "notes" ? "#2563EB" : "#334155",
                    fontWeight: activeItem?.type === "notes" ? "600" : "500",
                    fontSize: "0.8125rem",
                    textAlign: "left",
                    cursor: "pointer"
                  }}
                >
                  <span>📄</span>
                  <span>View Notes Library ({course.notes.length})</span>
                </button>
              </div>
            )}

            {/* Quizzes Section */}
            {course.quizzes?.length > 0 && (
              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "0.75rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#475569", marginBottom: "0.5rem" }}>
                  ❓ Knowledge Quizzes
                </div>
                {course.quizzes.map(q => {
                  const isDone = completedQuizSet.has(q.id);
                  return (
                    <button
                      key={q.id}
                      onClick={() => navigate(`/learner/course/${course.id}/quiz/${q.id}`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "none",
                        background: "transparent",
                        color: "#334155",
                        fontSize: "0.8125rem",
                        textAlign: "left",
                        cursor: "pointer"
                      }}
                    >
                      <span>{isDone ? "🏆" : "❓"}</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {q.title}
                      </span>
                      {isDone && <span className="pf-badge pf-badge-success" style={{ fontSize: "0.625rem" }}>Passed</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Assessments Section */}
            {course.assessments?.length > 0 && (
              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "0.75rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#475569", marginBottom: "0.5rem" }}>
                  📑 Formal Assessments
                </div>
                {course.assessments.map(asm => {
                  const isDone = completedAssessmentSet.has(asm.id);
                  return (
                    <button
                      key={asm.id}
                      onClick={() => navigate(`/learner/course/${course.id}/assessment/${asm.id}`)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        border: "none",
                        background: "transparent",
                        color: "#334155",
                        fontSize: "0.8125rem",
                        textAlign: "left",
                        cursor: "pointer"
                      }}
                    >
                      <span>{isDone ? "✅" : "📝"}</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {asm.title}
                      </span>
                      {isDone && <span className="pf-badge pf-badge-success" style={{ fontSize: "0.625rem" }}>Submitted</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Practical Challenges */}
            {course.challenges?.length > 0 && (
              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "0.75rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#475569", marginBottom: "0.5rem" }}>
                  ⚡ Practical Challenges
                </div>
                {course.challenges.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => navigate(`/learner/course/${course.id}/challenge/${ch.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "none",
                      background: "transparent",
                      color: "#334155",
                      fontSize: "0.8125rem",
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                  >
                    <span>⚡</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ch.title}
                    </span>
                    {completedChallengeSet.has(ch.id) && <span className="pf-badge pf-badge-success" style={{ fontSize: "0.625rem" }}>Done</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Problems Lab */}
            {course.problems?.length > 0 && (
              <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "0.75rem" }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#475569", marginBottom: "0.5rem" }}>
                  🧩 Problems Lab
                </div>
                {course.problems.map(prb => (
                  <button
                    key={prb.id}
                    onClick={() => navigate(`/learner/course/${course.id}/problem/${prb.id}`)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "none",
                      background: "transparent",
                      color: "#334155",
                      fontSize: "0.8125rem",
                      textAlign: "left",
                      cursor: "pointer"
                    }}
                  >
                    <span>🧩</span>
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {prb.title}
                    </span>
                    {completedProblemSet.has(prb.id) && <span className="pf-badge pf-badge-success" style={{ fontSize: "0.625rem" }}>Solved</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Player Area */}
        <div className="pf-card" style={{ padding: "2rem" }}>
          {activeItem?.type === "lesson" && (
            <div>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "1rem" }}>
                <div>
                  <span className="pf-badge pf-badge-secondary" style={{ marginBottom: "0.5rem" }}>
                    {activeItem.moduleTitle} • {activeItem.data.type === "video" ? "Video Demonstration" : "Theory Lesson"}
                  </span>
                  <h2 className="pf-heading-lg">{activeItem.data.title}</h2>
                  <div style={{ fontSize: "0.8125rem", color: "#64748B", marginTop: "4px" }}>
                    ⏱️ Estimated Time: {activeItem.data.duration}
                  </div>
                </div>

                <button
                  onClick={() => handleMarkLessonComplete(activeItem.data.id)}
                  className={`pf-btn ${completedLessonSet.has(activeItem.data.id) ? "pf-btn-success" : "pf-btn-primary"}`}
                >
                  {completedLessonSet.has(activeItem.data.id) ? "✅ Lesson Completed" : "Mark as Completed"}
                </button>
              </div>

              {/* Video Player or Theory Text */}
              {activeItem.data.type === "video" ? (
                <div>
                  <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "12px", background: "#000", marginBottom: "1.5rem" }}>
                    <iframe
                      src={activeItem.data.video_url}
                      title={activeItem.data.title}
                      style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>

                  {activeItem.data.content && (
                    <div style={{ background: "#F8FAFC", padding: "1.25rem", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                      <h4 style={{ fontWeight: "700", fontSize: "0.9375rem", color: "#0F172A", marginBottom: "0.5rem" }}>
                        Lecture Summary & Timestamps:
                      </h4>
                      <p style={{ fontSize: "0.875rem", color: "#475569", whiteSpace: "pre-line", lineHeight: "1.6" }}>
                        {activeItem.data.content}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Theory Reading */
                <div style={{ fontSize: "1rem", lineHeight: "1.7", color: "#334155" }}>
                  <div style={{ background: "#FFFFFF", padding: "1rem 0", whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
                    {activeItem.data.content}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeItem?.type === "notes" && (
            <div>
              <h2 className="pf-heading-lg" style={{ marginBottom: "0.5rem" }}>Course Notes & Reference Guides</h2>
              <p className="pf-subtext" style={{ marginBottom: "1.5rem" }}>
                Download study handouts, equation sheets, and reference notes published by {course.trainer_name}.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                {course.notes?.map(note => (
                  <div key={note.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                        📄
                      </div>
                      <div>
                        <h4 style={{ fontWeight: "700", fontSize: "0.9375rem", color: "#0F172A" }}>{note.title}</h4>
                        <p style={{ fontSize: "0.8125rem", color: "#64748B", marginTop: "2px" }}>{note.description}</p>
                      </div>
                    </div>
                    <a
                      href={note.file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="pf-btn pf-btn-secondary pf-btn-sm"
                      download
                    >
                      📥 Download ({note.file_name})
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
