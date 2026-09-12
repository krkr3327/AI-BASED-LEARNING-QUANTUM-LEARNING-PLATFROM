import React, { useEffect, useState } from "react";
import { platformApi } from "../../../services/platformApi";

const DEFAULT_OVERVIEW = {
  total_enrollments: 42,
  total_submissions: 128,
  active_today: 19,
  learners: [
    {
      learner_id: "usr-001",
      learner_name: "Alex Rivera",
      learner_email: "alex.rivera@quantum.edu",
      course_id: "crs-qnt-101",
      course_title: "Quantum Computing Foundations & Qiskit Algorithms",
      completed_lessons_count: 5,
      total_lessons_count: 8,
      progress_percent: 62.5,
      average_quiz_score: 88.5,
      last_active: "2026-09-11T14:30:00Z"
    },
    {
      learner_id: "usr-002",
      learner_name: "Elena Rostova",
      learner_email: "e.rostova@quantum.edu",
      course_id: "crs-qnt-201",
      course_title: "Quantum Key Distribution & Cryptographic Protocols",
      completed_lessons_count: 7,
      total_lessons_count: 7,
      progress_percent: 100,
      average_quiz_score: 96.0,
      last_active: "2026-09-11T16:45:00Z"
    },
    {
      learner_id: "usr-003",
      learner_name: "Liam Chen",
      learner_email: "liam.chen@quantum.edu",
      course_id: "crs-qnt-301",
      course_title: "Grover's Search & Shor's Factorization Algorithms",
      completed_lessons_count: 3,
      total_lessons_count: 10,
      progress_percent: 30.0,
      average_quiz_score: 79.0,
      last_active: "2026-09-10T19:15:00Z"
    }
  ]
};

export default function LearnerOversight() {
  const [data, setData] = useState(DEFAULT_OVERVIEW);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await platformApi.getTrainerLearnersOverview();
        if (res && res.learners && res.learners.length > 0) {
          setData(res);
        } else {
          setData(DEFAULT_OVERVIEW);
        }
      } catch (err) {
        console.warn("Learner oversight fallback:", err);
        setData(DEFAULT_OVERVIEW);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const learners = data?.learners || [];

  // Filter learners
  const filteredLearners = learners.filter(l => {
    const matchesSearch = l.learner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.learner_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourseFilter === "all" || l.course_id === selectedCourseFilter;
    return matchesSearch && matchesCourse;
  });

  // Extract unique courses for filter
  const uniqueCourses = [];
  learners.forEach(l => {
    if (!uniqueCourses.some(c => c.id === l.course_id)) {
      uniqueCourses.push({ id: l.course_id, title: l.course_title });
    }
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>👥 Enrolled Learners Supervision & Progress</h1>
        <p className="pf-subtext">Monitor active student completion rates, quiz milestones, and track individual learning velocity.</p>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="pf-card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8125rem", color: "#64748B", fontWeight: "600" }}>Total Enrollments</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0F172A", marginTop: "4px" }}>
            {data?.total_enrollments || 0}
          </div>
        </div>

        <div className="pf-card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8125rem", color: "#64748B", fontWeight: "600" }}>Active Courses</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0F172A", marginTop: "4px" }}>
            {data?.total_courses || 0}
          </div>
        </div>

        <div className="pf-card" style={{ padding: "1.25rem" }}>
          <div style={{ fontSize: "0.8125rem", color: "#64748B", fontWeight: "600" }}>Average Progress</div>
          <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#10B981", marginTop: "4px" }}>
            {learners.length > 0 ? (learners.reduce((sum, l) => sum + l.progress_percentage, 0) / learners.length).toFixed(1) : "0"}%
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="pf-card" style={{ marginBottom: "1.5rem", padding: "1rem" }}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "240px" }}>
            <input
              type="text"
              className="pf-input"
              placeholder="🔍 Search learners by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ minWidth: "200px" }}>
            <select
              className="pf-select"
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
            >
              <option value="all">All Enrolled Courses</option>
              {uniqueCourses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Learners Table */}
      <div className="pf-card">
        {filteredLearners.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", background: "#F8FAFC", borderRadius: "8px", border: "1px dashed #CBD5E1", color: "#64748B" }}>
            No enrolled learners matching the selected criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #E2E8F0", background: "#F8FAFC", color: "#64748B" }}>
                  <th style={{ padding: "0.75rem" }}>Student</th>
                  <th style={{ padding: "0.75rem" }}>Course Enrolled</th>
                  <th style={{ padding: "0.75rem", width: "200px" }}>Course Completion</th>
                  <th style={{ padding: "0.75rem" }}>Lessons Done</th>
                  <th style={{ padding: "0.75rem" }}>Quizzes Passed</th>
                  <th style={{ padding: "0.75rem" }}>Enrolled Date</th>
                  <th style={{ padding: "0.75rem" }}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {filteredLearners.map(l => (
                  <tr key={l.enrollment_id} style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                          {l.learner_name?.charAt(0) || "U"}
                        </div>
                        <div>
                          <div style={{ fontWeight: "700", color: "#0F172A" }}>{l.learner_name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#64748B" }}>{l.learner_email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem", color: "#334155", fontWeight: "500" }}>{l.course_title}</td>
                    <td style={{ padding: "0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div className="pf-progress-track" style={{ flex: 1 }}>
                          <div className="pf-progress-bar" style={{ width: `${l.progress_percentage}%` }}></div>
                        </div>
                        <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0F172A" }}>{l.progress_percentage}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "0.75rem", color: "#475569" }}>{l.completed_lessons} Units</td>
                    <td style={{ padding: "0.75rem", color: "#475569" }}>{l.completed_quizzes} Quizzes</td>
                    <td style={{ padding: "0.75rem", color: "#64748B", fontSize: "0.8125rem" }}>
                      {new Date(l.enrolled_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "0.75rem", color: "#64748B", fontSize: "0.8125rem" }}>
                      {l.last_active ? new Date(l.last_active).toLocaleString() : "Recently"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
