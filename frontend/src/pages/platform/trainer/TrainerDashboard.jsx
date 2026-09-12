import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { platformApi } from "../../../services/platformApi";
import { platformAuth } from "../../../services/platformAuth";
import { DEFAULT_COURSES } from "../../../services/defaultPlatformData";

export default function TrainerDashboard() {
  const navigate = useNavigate();
  const user = platformAuth.getUser();
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [overview, setOverview] = useState({
    total_enrollments: 42,
    total_submissions: 128,
    active_today: 19
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [cList, ov] = await Promise.all([
          platformApi.getCourses().catch(() => []),
          platformApi.getTrainerLearnersOverview().catch(() => null)
        ]);
        if (Array.isArray(cList) && cList.length > 0) {
          setCourses(cList);
        } else {
          setCourses(DEFAULT_COURSES);
        }
        if (ov) setOverview(ov);
      } catch (err) {
        console.warn("Dashboard data fallback:", err);
        setCourses(DEFAULT_COURSES);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalLessons = courses.reduce((acc, c) => acc + (c.modules?.reduce((mAcc, m) => mAcc + (m.lessons?.length || 0), 0) || 0), 0);
  const totalQuizzes = courses.reduce((acc, c) => acc + (c.quizzes?.length || 0), 0);
  const totalAssessments = courses.reduce((acc, c) => acc + (c.assessments?.length || 0), 0);

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span className="pf-badge pf-badge-copper">Executive Faculty Portal</span>
            <span className="pf-badge pf-badge-gold">Live Term 2026</span>
          </div>
          <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>
            Welcome back, {user?.name || "Professor"} 🎓
          </h1>
          <p className="pf-subtext">
            Manage your courses, author comprehensive curricula, and monitor learner comprehension.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button onClick={() => navigate("/trainer/courses")} className="pf-btn pf-btn-copper">
            ➕ Create New Course
          </button>
          <button onClick={() => navigate("/trainer/assessments")} className="pf-btn pf-btn-secondary">
            📑 View Grading Desk
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem"
      }}>
        <div className="pf-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #A77B5A" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#FFF8F2", color: "#A77B5A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", border: "1px solid #F4C6AF" }}>
            📚
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Courses</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#0C0D12" }}>{courses.length}</div>
          </div>
        </div>

        <div className="pf-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #3A68A4" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#EFF6FB", color: "#3A68A4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", border: "1px solid #AFD8F4" }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>Enrolled Learners</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#0C0D12" }}>{overview?.total_enrollments || 0}</div>
          </div>
        </div>

        <div className="pf-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #D6B15F" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#FFFDF0", color: "#D6B15F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", border: "1px solid #FDE68A" }}>
            📑
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>Submissions &amp; Tests</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#0C0D12" }}>{overview?.total_submissions || 0}</div>
          </div>
        </div>

        <div className="pf-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #2C3F60" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "#F5F9FC", color: "#2C3F60", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", border: "1px solid #CBD5E1" }}>
            🎥
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>Published Lessons</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "900", color: "#0C0D12" }}>{totalLessons}</div>
          </div>
        </div>
      </div>

      {/* Quick Authoring Navigation */}
      <div className="pf-card" style={{ marginBottom: "2rem" }}>
        <h2 className="pf-heading-md" style={{ marginBottom: "1rem" }}>⚡ Quick Authoring Shortcuts</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem"
        }}>
          <Link to="/trainer/videos" style={{ textDecoration: "none" }}>
            <div className="pf-card" style={{ padding: "1rem", textAlign: "center", background: "#FFF8F2", border: "1px solid #F4C6AF" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>🎥</div>
              <div style={{ fontWeight: "700", fontSize: "0.875rem", color: "#2C3F60" }}>Upload Video</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Embed lectures &amp; demos</div>
            </div>
          </Link>

          <Link to="/trainer/theory" style={{ textDecoration: "none" }}>
            <div className="pf-card" style={{ padding: "1rem", textAlign: "center", background: "#FFF8F2", border: "1px solid #F4C6AF" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>📝</div>
              <div style={{ fontWeight: "700", fontSize: "0.875rem", color: "#2C3F60" }}>Write Theory</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Markdown &amp; math notes</div>
            </div>
          </Link>

          <Link to="/trainer/quizzes" style={{ textDecoration: "none" }}>
            <div className="pf-card" style={{ padding: "1rem", textAlign: "center", background: "#FFF8F2", border: "1px solid #F4C6AF" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>❓</div>
              <div style={{ fontWeight: "700", fontSize: "0.875rem", color: "#2C3F60" }}>Build Quiz</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B" }}>MCQ knowledge checks</div>
            </div>
          </Link>

          <Link to="/trainer/assessments" style={{ textDecoration: "none" }}>
            <div className="pf-card" style={{ padding: "1rem", textAlign: "center", background: "#FFF8F2", border: "1px solid #F4C6AF" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>📑</div>
              <div style={{ fontWeight: "700", fontSize: "0.875rem", color: "#2C3F60" }}>Assessments</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Exam authoring &amp; grading</div>
            </div>
          </Link>

          <Link to="/trainer/challenges" style={{ textDecoration: "none" }}>
            <div className="pf-card" style={{ padding: "1rem", textAlign: "center", background: "#FFF8F2", border: "1px solid #F4C6AF" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>⚡</div>
              <div style={{ fontWeight: "700", fontSize: "0.875rem", color: "#2C3F60" }}>Add Challenge</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B" }}>Interactive code labs</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Courses Overview & Enrolled Learners Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem" }}>
        {/* Course Catalog summary */}
        <div className="pf-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="pf-heading-md">My Active Courses ({courses.length})</h2>
            <Link to="/trainer/courses" style={{ color: "#A77B5A", fontSize: "0.875rem", fontWeight: "700", textDecoration: "none" }}>
              Manage All &rarr;
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {courses.map(c => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--pf-border)", background: "#FFFFFF" }}>
                <img
                  src={c.thumbnail}
                  alt={c.title}
                  style={{ width: "64px", height: "48px", objectFit: "cover", borderRadius: "6px" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: "700", fontSize: "0.9375rem", color: "#0C0D12", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", display: "flex", gap: "1rem", marginTop: "2px", alignItems: "center" }}>
                    <span>{c.modules?.length || 0} Modules</span>
                    <span>•</span>
                    <span>{c.quizzes?.length || 0} Quizzes</span>
                    <span>•</span>
                    <span className="pf-badge pf-badge-copper">{c.level}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enrolled Learners */}
        <div className="pf-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="pf-heading-md">Enrolled Learners Oversight</h2>
            <Link to="/trainer/learners" style={{ color: "#A77B5A", fontSize: "0.875rem", fontWeight: "700", textDecoration: "none" }}>
              View Details &rarr;
            </Link>
          </div>

          {overview?.learners?.length === 0 ? (
            <p className="pf-subtext">No enrolled students yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {overview?.learners?.slice(0, 4).map((l, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--pf-border)", background: "#FFFFFF" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FFF8F2", color: "#A77B5A", border: "1px solid #F4C6AF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", fontSize: "0.875rem" }}>
                      {l.learner_name?.charAt(0) || "S"}
                    </div>
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "0.875rem", color: "#0C0D12" }}>{l.learner_name}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{l.course_title}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="pf-badge pf-badge-copper">{l.progress_percentage}% Done</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
