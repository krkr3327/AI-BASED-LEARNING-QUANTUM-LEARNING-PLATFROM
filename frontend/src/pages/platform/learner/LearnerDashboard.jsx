import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { platformApi } from "../../../services/platformApi";
import { platformAuth } from "../../../services/platformAuth";

export default function LearnerDashboard() {
  const navigate = useNavigate();
  const user = platformAuth.getUser();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [enrList, allCourses] = await Promise.all([
          platformApi.getMyEnrollments(),
          platformApi.getCourses({ published_only: true })
        ]);
        setEnrollments(enrList);
        setCourses(allCourses);

        // Load progress for each enrollment
        const pMap = {};
        for (const enr of enrList) {
          try {
            const p = await platformApi.getProgress(enr.course_id);
            pMap[enr.course_id] = p;
          } catch (e) {
            console.error(e);
          }
        }
        setProgressMap(pMap);
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalLessonsDone = Object.values(progressMap).reduce((acc, p) => acc + (p.completed_lesson_ids?.length || 0), 0);
  const totalQuizzesPassed = Object.values(progressMap).reduce((acc, p) => acc + (p.completed_quiz_ids?.length || 0), 0);
  const totalChallengesDone = Object.values(progressMap).reduce((acc, p) => acc + (p.completed_challenge_ids?.length || 0), 0);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>
            Hello, {user?.name || "Student"} 🚀
          </h1>
          <p className="pf-subtext">
            Track your course progress, explore new curriculum tracks, and practice interactive problem sets.
          </p>
        </div>
        <button onClick={() => navigate("/learner/catalog")} className="pf-btn pf-btn-primary">
          🔍 Explore Course Catalog
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1.25rem",
        marginBottom: "2rem"
      }}>
        <div className="pf-glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "20px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(239, 246, 255, 0.9)", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 2px 8px rgba(37, 99, 235, 0.15)" }}>
            📚
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#64748B" }}>Enrolled Courses</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0F172A" }}>{enrollments.length}</div>
          </div>
        </div>

        <div className="pf-glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "20px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(236, 253, 245, 0.9)", color: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 2px 8px rgba(16, 185, 129, 0.15)" }}>
            ✅
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#64748B" }}>Lessons Completed</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0F172A" }}>{totalLessonsDone}</div>
          </div>
        </div>

        <div className="pf-glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "20px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(254, 243, 199, 0.9)", color: "#D97706", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 2px 8px rgba(217, 119, 6, 0.15)" }}>
            🏆
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#64748B" }}>Quizzes Mastered</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0F172A" }}>{totalQuizzesPassed}</div>
          </div>
        </div>

        <div className="pf-glass-card" style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "20px" }}>
          <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(245, 243, 255, 0.9)", color: "#8B5CF6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", boxShadow: "0 2px 8px rgba(139, 92, 246, 0.15)" }}>
            ⚡
          </div>
          <div>
            <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#64748B" }}>Challenges Solved</div>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0F172A" }}>{totalChallengesDone}</div>
          </div>
        </div>
      </div>

      {/* Current Enrolled Courses */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h2 className="pf-heading-md" style={{ marginBottom: "1rem" }}>In-Progress Courses</h2>

        {enrollments.length === 0 ? (
          <div className="pf-glass-card" style={{ textAlign: "center", padding: "3rem" }}>
            <p className="pf-subtext" style={{ marginBottom: "1rem" }}>You are not enrolled in any courses yet.</p>
            <button onClick={() => navigate("/learner/catalog")} className="pf-btn-azure" style={{ padding: "10px 20px", borderRadius: "10px", fontWeight: 800 }}>
              Browse Course Catalog
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
            {enrollments.map(enr => {
              const course = courses.find(c => c.id === enr.course_id);
              const prog = progressMap[enr.course_id] || { overall_percentage: 0 };
              return (
                <div key={enr.id} className="pf-glass-card" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <img
                    src={course?.thumbnail || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600"}
                    alt={enr.course_title}
                    style={{ width: "100%", height: "160px", objectFit: "cover" }}
                  />
                  <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", gap: "6px", marginBottom: "0.5rem" }}>
                      <span className="pf-badge pf-badge-primary">{course?.category || "Course"}</span>
                      <span className="pf-badge pf-badge-secondary">{course?.level || "All Levels"}</span>
                    </div>

                    <h3 style={{ fontSize: "1.0625rem", fontWeight: "700", color: "#0F172A", marginBottom: "0.5rem" }}>
                      {enr.course_title}
                    </h3>
                    <p style={{ fontSize: "0.8125rem", color: "#64748B", marginBottom: "1.25rem", flex: 1 }}>
                      Instructor: <strong>{course?.trainer_name || "Platform Faculty"}</strong>
                    </p>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: "1rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: "600", marginBottom: "4px" }}>
                        <span style={{ color: "#64748B" }}>Course Completion</span>
                        <span style={{ color: "#2563EB" }}>{prog.overall_percentage}%</span>
                      </div>
                      <div className="pf-progress-track">
                        <div className="pf-progress-bar" style={{ width: `${prog.overall_percentage}%` }}></div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/learner/course/${enr.course_id}`)}
                      className="pf-btn pf-btn-primary"
                      style={{ width: "100%" }}
                    >
                      ▶️ Continue Learning &rarr;
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Explore Catalog Teaser */}
      {courses.filter(c => !enrollments.some(e => e.course_id === c.id)).length > 0 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="pf-heading-md">Recommended For You</h2>
            <Link to="/learner/catalog" style={{ color: "#2563EB", fontSize: "0.875rem", fontWeight: "600", textDecoration: "none" }}>
              View All Courses &rarr;
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {courses.filter(c => !enrollments.some(e => e.course_id === c.id)).map(c => (
              <div key={c.id} className="pf-card" style={{ padding: "1.25rem" }}>
                <span className="pf-badge pf-badge-secondary" style={{ marginBottom: "0.5rem" }}>{c.category}</span>
                <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#0F172A", marginBottom: "0.5rem" }}>{c.title}</h3>
                <p style={{ fontSize: "0.8125rem", color: "#64748B", marginBottom: "1rem" }}>{c.description}</p>
                <button
                  onClick={async () => {
                    await platformApi.enroll(c.id);
                    navigate(`/learner/course/${c.id}`);
                  }}
                  className="pf-btn pf-btn-secondary pf-btn-sm"
                  style={{ width: "100%" }}
                >
                  ➕ Enroll Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
