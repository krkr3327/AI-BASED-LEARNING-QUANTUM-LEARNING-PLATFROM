import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { platformApi } from "../../../services/platformApi";

export default function CourseCatalog() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [cList, enrList] = await Promise.all([
          platformApi.getCourses({ published_only: true }),
          platformApi.getMyEnrollments()
        ]);
        setCourses(cList);
        setEnrollments(enrList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id));

  // Filter options
  const categories = ["all", ...new Set(courses.map(c => c.category))];
  const levels = ["all", "Beginner", "Intermediate", "Advanced"];

  const filteredCourses = courses.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || c.category === selectedCategory;
    const matchesLevel = selectedLevel === "all" || c.level.toLowerCase().includes(selectedLevel.toLowerCase());
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const handleEnroll = async (courseId) => {
    try {
      await platformApi.enroll(courseId);
      navigate(`/learner/course/${courseId}`);
    } catch (err) {
      alert("Enrollment failed: " + err.message);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>🔍 Academic Course Catalog</h1>
        <p className="pf-subtext">Discover comprehensive theoretical and hands-on courses taught by leading researchers.</p>
      </div>

      {/* Search & Filter Controls */}
      <div className="pf-card" style={{ marginBottom: "2rem", padding: "1.25rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div>
            <label className="pf-label" style={{ fontSize: "0.75rem" }}>Search Courses</label>
            <input
              type="text"
              className="pf-input"
              placeholder="Search by topic, algorithms, keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label className="pf-label" style={{ fontSize: "0.75rem" }}>Discipline / Category</label>
            <select
              className="pf-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="pf-label" style={{ fontSize: "0.75rem" }}>Skill Level</label>
            <select
              className="pf-select"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              {levels.map(lvl => (
                <option key={lvl} value={lvl}>
                  {lvl === "all" ? "All Skill Levels" : lvl}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <div className="pf-card" style={{ textAlign: "center", padding: "3rem" }}>
          <p className="pf-subtext">No courses match your filter preferences.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.5rem" }}>
          {filteredCourses.map(course => {
            const isEnrolled = enrolledCourseIds.has(course.id);
            return (
              <div key={course.id} className="pf-card" style={{ padding: "0", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  style={{ width: "100%", height: "180px", objectFit: "cover" }}
                />
                <div style={{ padding: "1.25rem", flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", gap: "6px", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                    <span className="pf-badge pf-badge-primary">{course.category}</span>
                    <span className="pf-badge pf-badge-secondary">{course.level}</span>
                    {isEnrolled && <span className="pf-badge pf-badge-success">Enrolled</span>}
                  </div>

                  <h3 style={{ fontSize: "1.125rem", fontWeight: "700", color: "#0F172A", marginBottom: "0.5rem" }}>
                    {course.title}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#64748B", marginBottom: "1rem", flex: 1 }}>
                    {course.description}
                  </p>

                  <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "0.75rem", marginBottom: "1rem", fontSize: "0.8125rem", color: "#64748B", display: "flex", justifyContent: "space-between" }}>
                    <span>👨‍🏫 {course.trainer_name}</span>
                    <span>📁 {course.modules?.length || 0} Modules</span>
                    <span>⏱️ {course.duration}</span>
                  </div>

                  {isEnrolled ? (
                    <button
                      onClick={() => navigate(`/learner/course/${course.id}`)}
                      className="pf-btn pf-btn-secondary"
                      style={{ width: "100%" }}
                    >
                      ▶️ Go to Course &rarr;
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="pf-btn pf-btn-primary"
                      style={{ width: "100%" }}
                    >
                      ➕ Enroll Free &rarr;
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
