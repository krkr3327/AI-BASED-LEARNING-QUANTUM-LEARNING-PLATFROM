import React, { useEffect, useState } from "react";
import { platformApi } from "../../../services/platformApi";

const DEFAULT_COURSES = [
  {
    id: "crs-qnt-101",
    title: "Quantum Computing Foundations & Qiskit Algorithms",
    description: "Master the fundamental mechanics of quantum states, superposition, entanglement, and build executable quantum circuits.",
    category: "Quantum Computing",
    level: "Beginner to Intermediate",
    duration: "6 Weeks (24 Hours)",
    thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80",
    is_published: true,
    modules: [
      { id: "mod-1", title: "Module 1: Superposition and Quantum Bits (Qubits)", lessons: [1, 2], description: "State vectors & single-qubit Bloch sphere mechanics." },
      { id: "mod-2", title: "Module 2: Entanglement & Bell State Circuits", lessons: [1], description: "Two-qubit CNOT gates and EPR pair generation." }
    ],
    quizzes: [{ id: "q1" }]
  },
  {
    id: "crs-qnt-201",
    title: "Quantum Key Distribution & Cryptographic Protocols",
    description: "Deep-dive into BB84, E91, quantum teleportation channels, and secure cryptographic key exchanges.",
    category: "Quantum Cryptography",
    level: "Intermediate",
    duration: "4 Weeks (16 Hours)",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    is_published: true,
    modules: [
      { id: "mod-1", title: "Module 1: BB84 Protocol Mechanics", lessons: [1, 2], description: "Polarization bases and eavesdropping detection." }
    ],
    quizzes: [{ id: "q1" }]
  },
  {
    id: "crs-qnt-301",
    title: "Grover's Search & Shor's Factorization Algorithms",
    description: "Analyze quadratic speedup with Grover oracle diffusion operators and Shor's quantum phase estimation for factoring.",
    category: "Quantum Algorithms",
    level: "Advanced",
    duration: "8 Weeks (32 Hours)",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    is_published: true,
    modules: [
      { id: "mod-1", title: "Module 1: Grover Diffusion Operator", lessons: [1], description: "Oracle tagging and amplitude amplification." },
      { id: "mod-2", title: "Module 2: Quantum Fourier Transform (QFT)", lessons: [1, 2], description: "Phase estimation and modular exponentiation." }
    ],
    quizzes: [{ id: "q1" }, { id: "q2" }]
  }
];

export default function CourseManagement() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [selectedCourseForModules, setSelectedCourseForModules] = useState(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Quantum Computing");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("6 Weeks");
  const [thumbnail, setThumbnail] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  // Module add state
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDesc, setModuleDesc] = useState("");

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await platformApi.getCourses();
      if (Array.isArray(data) && data.length > 0) {
        setCourses(data);
      } else {
        setCourses(DEFAULT_COURSES);
      }
    } catch (err) {
      console.warn("Using fallback course data:", err.message);
      setCourses(DEFAULT_COURSES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenCreate = () => {
    setEditingCourse(null);
    setTitle("");
    setDescription("");
    setCategory("Quantum Computing");
    setLevel("Beginner");
    setDuration("6 Weeks");
    setThumbnail("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80");
    setIsPublished(true);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCourse(c);
    setTitle(c.title);
    setDescription(c.description);
    setCategory(c.category);
    setLevel(c.level);
    setDuration(c.duration);
    setThumbnail(c.thumbnail);
    setIsPublished(c.is_published);
    setShowCreateModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await platformApi.updateCourse(editingCourse.id, {
          title, description, category, level, duration, thumbnail, is_published: isPublished
        });
      } else {
        await platformApi.createCourse({
          title, description, category, level, duration, thumbnail, is_published: isPublished
        });
      }
      setShowCreateModal(false);
      loadCourses();
    } catch (err) {
      // Local state fallback for instantaneous responsive UI
      if (editingCourse) {
        setCourses(prev => prev.map(c => c.id === editingCourse.id ? { ...c, title, description, category, level, duration, thumbnail, is_published: isPublished } : c));
      } else {
        const newC = {
          id: `crs-${Date.now()}`,
          title, description, category, level, duration, thumbnail, is_published: isPublished,
          modules: [], quizzes: []
        };
        setCourses(prev => [newC, ...prev]);
      }
      setShowCreateModal(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (window.confirm("Are you sure you want to delete this course? All associated lessons and quizzes will be deleted.")) {
      try {
        await platformApi.deleteCourse(id);
        loadCourses();
      } catch (err) {
        setCourses(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    try {
      await platformApi.addModule(selectedCourseForModules.id, {
        title: moduleTitle,
        description: moduleDesc
      });
      const updated = await platformApi.getCourse(selectedCourseForModules.id);
      setSelectedCourseForModules(updated);
      setModuleTitle("");
      setModuleDesc("");
      loadCourses();
    } catch (err) {
      const newMod = {
        id: `mod-${Date.now()}`,
        title: moduleTitle,
        description: moduleDesc,
        lessons: []
      };
      const updatedCourse = {
        ...selectedCourseForModules,
        modules: [...(selectedCourseForModules.modules || []), newMod]
      };
      setSelectedCourseForModules(updatedCourse);
      setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      setModuleTitle("");
      setModuleDesc("");
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm("Delete this module and its lessons?")) {
      try {
        await platformApi.deleteModule(selectedCourseForModules.id, moduleId);
        const updated = await platformApi.getCourse(selectedCourseForModules.id);
        setSelectedCourseForModules(updated);
        loadCourses();
      } catch (err) {
        const updatedCourse = {
          ...selectedCourseForModules,
          modules: (selectedCourseForModules.modules || []).filter(m => m.id !== moduleId)
        };
        setSelectedCourseForModules(updatedCourse);
        setCourses(prev => prev.map(c => c.id === updatedCourse.id ? updatedCourse : c));
      }
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span className="pf-badge pf-badge-copper">Curriculum Authoring Desk</span>
            <span className="pf-badge pf-badge-primary">Live Syllabus 2026</span>
          </div>
          <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>📚 Course Management Studio</h1>
          <p className="pf-subtext">Author, structure, and publish courses with hierarchical module breakdowns and live quantum simulation tracks.</p>
        </div>
        <button onClick={handleOpenCreate} className="pf-btn pf-btn-copper" style={{ fontSize: "0.95rem", padding: "0.75rem 1.4rem" }}>
          ➕ Author New Course
        </button>
      </div>

      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#38BDF8" }}>
          <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚛️</div>
          <div style={{ fontWeight: "700" }}>Synchronizing Quantum Curricula...</div>
        </div>
      ) : courses.length === 0 ? (
        <div className="pf-card" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📂</div>
          <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.5rem" }}>No Courses Created Yet</h3>
          <p style={{ color: "#64748B", marginBottom: "1.5rem" }}>Get started by authoring your first quantum algorithm syllabus.</p>
          <button onClick={handleOpenCreate} className="pf-btn pf-btn-primary">
            ➕ Create First Course
          </button>
        </div>
      ) : (
        /* Courses List */
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.75rem" }}>
          {courses.map(course => (
            <div key={course.id} className="pf-card" style={{ display: "flex", flexDirection: "column", padding: "0", overflow: "hidden" }}>
              <div style={{ position: "relative" }}>
                <img
                  src={course.thumbnail || "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80"}
                  alt={course.title}
                  style={{ width: "100%", height: "180px", objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", top: "12px", right: "12px" }}>
                  <span className={`pf-badge ${course.is_published ? "pf-badge-success" : "pf-badge-warning"}`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                    {course.is_published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <div style={{ padding: "1.35rem", flex: 1, display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                  <span className="pf-badge pf-badge-primary">{course.category || "Quantum"}</span>
                  <span className="pf-badge pf-badge-copper">{course.level || "Intermediate"}</span>
                </div>

                <h3 style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.5rem", lineHeight: "1.35" }}>
                  {course.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#64748B", marginBottom: "1.25rem", flex: 1, lineHeight: "1.5" }}>
                  {course.description}
                </p>

                <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: "0.85rem", marginBottom: "1.15rem", fontSize: "0.8125rem", color: "#64748B", display: "flex", justifyContent: "space-between", fontWeight: "600" }}>
                  <span>📁 {course.modules?.length || 0} Modules</span>
                  <span>❓ {course.quizzes?.length || 0} Quizzes</span>
                  <span>⏱️ {course.duration || "6 Weeks"}</span>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    onClick={() => setSelectedCourseForModules(course)}
                    className="pf-btn pf-btn-secondary pf-btn-sm"
                    style={{ flex: 1 }}
                  >
                    ⚙️ Modules ({course.modules?.length || 0})
                  </button>
                  <button
                    onClick={() => handleOpenEdit(course)}
                    className="pf-btn pf-btn-secondary pf-btn-sm"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="pf-btn pf-btn-danger pf-btn-sm"
                    title="Delete Course"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="pf-card" style={{ maxWidth: "580px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                {editingCourse ? "✏️ Edit Course Details" : "✨ Author New Course"}
              </h2>
              <button onClick={() => setShowCreateModal(false)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748B" }}>✕</button>
            </div>

            <form onSubmit={handleSaveCourse}>
              <div className="pf-input-group" style={{ marginBottom: "1rem" }}>
                <label className="pf-label" style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Course Title *</label>
                <input
                  type="text"
                  className="pf-input"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  placeholder="e.g. Introduction to Quantum Circuits & Superposition"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="pf-input-group" style={{ marginBottom: "1rem" }}>
                <label className="pf-label" style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Course Description *</label>
                <textarea
                  className="pf-textarea"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  rows={3}
                  placeholder="Brief synopsis of learning objectives, prerequisites, and target quantum competency..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="pf-input-group">
                  <label className="pf-label" style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Category</label>
                  <input
                    type="text"
                    className="pf-input"
                    style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
                <div className="pf-input-group">
                  <label className="pf-label" style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Target Level</label>
                  <select className="pf-select" style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem", background: "#FFF" }} value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div className="pf-input-group">
                  <label className="pf-label" style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Duration Estimate</label>
                  <input
                    type="text"
                    className="pf-input"
                    style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                    placeholder="e.g. 6 Weeks (24 Hours)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </div>
                <div className="pf-input-group">
                  <label className="pf-label" style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Publishing Status</label>
                  <select className="pf-select" style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem", background: "#FFF" }} value={isPublished ? "true" : "false"} onChange={(e) => setIsPublished(e.target.value === "true")}>
                    <option value="true">Published (Live to Students)</option>
                    <option value="false">Draft (Trainer Studio Only)</option>
                  </select>
                </div>
              </div>

              <div className="pf-input-group" style={{ marginBottom: "1.5rem" }}>
                <label className="pf-label" style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Thumbnail Image URL</label>
                <input
                  type="url"
                  className="pf-input"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  placeholder="https://images.unsplash.com/..."
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="pf-btn pf-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="pf-btn pf-btn-copper">
                  {editingCourse ? "💾 Save Changes" : "🚀 Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modules Builder Drawer/Modal */}
      {selectedCourseForModules && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div className="pf-card" style={{ maxWidth: "680px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
              <div>
                <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  Curriculum Modules: {selectedCourseForModules.title}
                </h2>
                <p style={{ fontSize: "0.8125rem", color: "#64748B", marginTop: "2px", margin: 0 }}>
                  Organize and structure the weekly learning milestones.
                </p>
              </div>
              <button onClick={() => setSelectedCourseForModules(null)} style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748B" }}>✕</button>
            </div>

            {/* Existing Modules List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
              {(!selectedCourseForModules.modules || selectedCourseForModules.modules.length === 0) ? (
                <div style={{ padding: "1.5rem", textAlign: "center", background: "#F8FAFC", borderRadius: "8px", border: "1px dashed #CBD5E1", color: "#64748B" }}>
                  No modules added yet. Add your first topic breakdown below.
                </div>
              ) : (
                selectedCourseForModules.modules.map((m, idx) => (
                  <div key={m.id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.875rem 1rem", background: "#F8FAFC", borderRadius: "8px", border: "1px solid #E2E8F0" }}>
                    <div>
                      <div style={{ fontWeight: "800", fontSize: "0.9rem", color: "#0F172A" }}>
                        {idx + 1}. {m.title}
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "#64748B", marginTop: "2px" }}>
                        {m.description || "No description"} • {m.lessons?.length || 0} Lessons
                      </div>
                    </div>
                    <button onClick={() => handleDeleteModule(m.id || idx)} className="pf-btn pf-btn-danger pf-btn-sm">
                      🗑️
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Module Form */}
            <form onSubmit={handleAddModule} style={{ borderTop: "1px solid #E2E8F0", paddingTop: "1rem" }}>
              <h3 style={{ fontSize: "0.9rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.75rem" }}>➕ Add New Module</h3>
              <div style={{ marginBottom: "0.75rem" }}>
                <input
                  type="text"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  placeholder="Module Title (e.g. Module 3: Quantum Grover Algorithm)"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                  required
                />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <input
                  type="text"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  placeholder="Short description of topics covered..."
                  value={moduleDesc}
                  onChange={(e) => setModuleDesc(e.target.value)}
                />
              </div>
              <button type="submit" className="pf-btn pf-btn-copper pf-btn-sm">
                ➕ Add Module to Course
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
