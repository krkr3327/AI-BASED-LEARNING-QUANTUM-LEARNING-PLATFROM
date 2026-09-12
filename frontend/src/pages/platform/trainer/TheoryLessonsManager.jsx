import React, { useEffect, useState } from "react";
import { platformApi } from "../../../services/platformApi";
import { DEFAULT_COURSES } from "../../../services/defaultPlatformData";

const THEORY_PRESETS = [
  {
    title: "Unit 1: Quantum Superposition & State Vectors in Hilbert Space",
    duration: "15 min",
    content: `# Unit 1: Quantum Superposition & State Vectors

### 1. Fundamental Postulates
In quantum mechanics, a pure state of a two-level qubit system is represented as a normalized unit vector in a 2-dimensional complex Hilbert space $\\mathcal{H}_2$:

$$\\vert\\psi\\rangle = \\alpha\\vert 0\\rangle + \\beta\\vert 1\\rangle = \\begin{pmatrix} \\alpha \\\\ \\beta \\end{pmatrix}$$

where $\\alpha, \\beta \\in \\mathbb{C}$ are complex probability amplitudes.

### 2. Born Rule & Normalization
Upon measurement in the computational basis $\{|0\\rangle, |1\\rangle\}$:
- Probability of measuring state $|0\\rangle$: $P(0) = |\\alpha|^2$
- Probability of measuring state $|1\\rangle$: $P(1) = |\\beta|^2$

Total probability conservation requires:
$$|\\alpha|^2 + |\\beta|^2 = 1$$

### 3. Bloch Sphere Representation
Any single-qubit state can be parametrized on the Bloch Sphere:
$$\\vert\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)\\vert 0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)\\vert 1\\rangle$$
where $\\theta \\in [0, \\pi]$ is the polar angle and $\\phi \\in [0, 2\\pi)$ is the azimuthal phase angle.`
  },
  {
    title: "Unit 2: Quantum Entanglement & Maximally Entangled Bell States",
    duration: "20 min",
    content: `# Unit 2: Quantum Entanglement & Bell States

### 1. Definition of Entangled States
A composite quantum state $|\\Psi_{AB}\\rangle \\in \\mathcal{H}_A \\otimes \\mathcal{H}_B$ is entangled if it cannot be factored into product states of individual subsystems:

$$|\\Psi_{AB}\\rangle \\neq |\\psi_A\\rangle \\otimes |\\phi_B\\rangle$$

### 2. The Four Canonical Bell States
The maximally entangled 2-qubit Bell basis states are generated using a Hadamard gate followed by a Controlled-NOT (CNOT) gate:

1. $|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$
2. $|\\Phi^-\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle - |11\\rangle)$
3. $|\\Psi^+\\rangle = \\frac{1}{\\sqrt{2}}(|01\\rangle + |10\\rangle)$
4. $|\\Psi^-\\rangle = \\frac{1}{\\sqrt{2}}(|01\\rangle - |10\\rangle)$

### 3. Non-Locality & CHSH Inequality
Bell's theorem states that no physical theory of local hidden variables can ever reproduce all predictions of quantum mechanics. For Bell states, the CHSH inequality parameter reaches:
$$\\langle C \\rangle = 2\\sqrt{2} \\approx 2.828 > 2$$`
  },
  {
    title: "Unit 3: Quantum Logic Gates & Unitary Matrix Transformations",
    duration: "22 min",
    content: `# Unit 3: Quantum Logic Gates & Unitary Operators

### 1. Unitary Requirement
All single-qubit quantum operations correspond to $2 \\times 2$ unitary matrices $U$ such that $U^\\dagger U = I$:

### 2. Pauli Matrix Operators
- **Pauli-X (NOT)**: $\\sigma_x = X = \\begin{pmatrix} 0 & 1 \\\\ 1 & 0 \\end{pmatrix}$
- **Pauli-Y**: $\\sigma_y = Y = \\begin{pmatrix} 0 & -i \\\\ i & 0 \\end{pmatrix}$
- **Pauli-Z (Phase Flip)**: $\\sigma_z = Z = \\begin{pmatrix} 1 & 0 \\\\ 0 & -1 \\end{pmatrix}$

### 3. Hadamard Gate Matrix
The Hadamard transformation creates equal superpositions from basis states:
$$H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$$

Applying $H$ to $|0\\rangle$:
$$H|0\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle + |1\\rangle) = |+\\rangle$$`
  }
];

export default function TheoryLessonsManager() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState(DEFAULT_COURSES[0].id);
  const [selectedModuleId, setSelectedModuleId] = useState(DEFAULT_COURSES[0].modules[0]?.id || "");
  
  // Lesson form
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("18 min");
  const [content, setContent] = useState(THEORY_PRESETS[0].content);
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'edit' | 'preview'
  const [previewModalLesson, setPreviewModalLesson] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const loadData = async () => {
    try {
      const cList = await platformApi.getCourses();
      if (Array.isArray(cList) && cList.length > 0) {
        setCourses(cList);
        if (!selectedCourseId) {
          setSelectedCourseId(cList[0].id);
          if (cList[0].modules?.length > 0) {
            setSelectedModuleId(cList[0].modules[0].id);
          }
        }
      }
    } catch (err) {
      console.warn("Theory manager using fallback courses:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCourse = courses.find(c => c.id === selectedCourseId);
  const activeModule = activeCourse?.modules?.find(m => m.id === selectedModuleId);

  // Auto calculate duration on content change
  useEffect(() => {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const estimatedMinutes = Math.max(3, Math.ceil(wordCount / 120));
    setDuration(`${estimatedMinutes} min`);
  }, [content]);

  const handleCourseChange = (cid) => {
    setSelectedCourseId(cid);
    const crs = courses.find(c => c.id === cid);
    if (crs && crs.modules?.length > 0) {
      setSelectedModuleId(crs.modules[0].id);
    } else {
      setSelectedModuleId("");
    }
  };

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setContent(preset.content);
    setDuration(preset.duration);
  };

  const insertSnippet = (snippet) => {
    setContent(prev => prev + "\n" + snippet);
  };

  const handleAddTheoryLesson = async (e) => {
    e.preventDefault();
    if (!selectedCourseId || !selectedModuleId) {
      alert("Please select both a course and a target module.");
      return;
    }
    if (!title.trim()) {
      alert("Please provide a lesson title.");
      return;
    }
    setLoading(true);
    try {
      await platformApi.addLesson(selectedCourseId, selectedModuleId, {
        title: title.trim(),
        duration: duration.trim(),
        type: "theory",
        content: content.trim()
      });
      setSuccessToast(`Theory lesson "${title}" published successfully!`);
      setTimeout(() => setSuccessToast(""), 4000);
      setTitle("");
      await loadData();
    } catch (err) {
      alert("Failed to add theory lesson: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId, lessonTitle) => {
    if (window.confirm(`Are you sure you want to delete "${lessonTitle || 'this theory lesson'}"?`)) {
      try {
        await platformApi.deleteLesson(selectedCourseId, moduleId, lessonId);
        setSuccessToast("Theory lesson deleted from syllabus.");
        setTimeout(() => setSuccessToast(""), 3000);
        await loadData();
      } catch (err) {
        alert("Failed to delete lesson: " + err.message);
      }
    }
  };

  // Collect all theory lessons from the active course
  const allTheoryLessons = [];
  if (activeCourse?.modules) {
    activeCourse.modules.forEach(m => {
      m.lessons?.forEach(l => {
        if (l.type === "theory") {
          allTheoryLessons.push({ ...l, moduleTitle: m.title, moduleId: m.id });
        }
      });
    });
  }

  const filteredTheory = allTheoryLessons.filter(l => 
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (l.content && l.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "3rem" }}>
      {/* Toast Notification */}
      {successToast && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 9999,
          background: "linear-gradient(135deg, #059669, #10B981)",
          color: "#FFFFFF",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(16, 185, 129, 0.35)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontWeight: 600,
          fontSize: "0.9375rem"
        }}>
          <span>✨</span>
          <span>{successToast}</span>
        </div>
      )}

      {/* Hero Studio Banner */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 243, 255, 0.9))",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(124, 58, 237, 0.2)",
        borderRadius: "20px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 12px 30px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(124, 58, 237, 0.1)", color: "#6D28D9", padding: "4px 12px", borderRadius: "999px", fontSize: "0.8125rem", fontWeight: "700", marginBottom: "0.75rem", letterSpacing: "0.03em" }}>
              📖 QUANTUM SCIENTIFIC SYLLABUS
            </div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "800", color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
              Theory & Syllabus Authoring Suite
            </h1>
            <p style={{ color: "#475569", marginTop: "6px", marginBottom: 0, fontSize: "0.9375rem", maxWidth: "680px", lineHeight: "1.5" }}>
              Compose rigorous quantum mechanics proofs, Dirac bracket derivations, gate matrices, and structured interactive theoretical reading material.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ background: "#FFFFFF", padding: "0.875rem 1.25rem", borderRadius: "14px", border: "1px solid #E2E8F0", textAlign: "center", minWidth: "110px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: "800", color: "#7C3AED" }}>{allTheoryLessons.length}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>Theory Units</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "0.875rem 1.25rem", borderRadius: "14px", border: "1px solid #E2E8F0", textAlign: "center", minWidth: "110px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: "800", color: "#0D9488" }}>LaTeX</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>Math Engine</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "0.875rem 1.25rem", borderRadius: "14px", border: "1px solid #E2E8F0", textAlign: "center", minWidth: "110px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: "800", color: "#2563EB" }}>100%</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>Live Preview</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course & Module Selectors */}
      <div style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        padding: "1.25rem 1.75rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.02)",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "1.5rem"
      }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
            🎓 ACTIVE COURSE CURRICULUM
          </label>
          <select
            className="pf-select"
            value={selectedCourseId}
            onChange={(e) => handleCourseChange(e.target.value)}
            style={{ width: "100%", background: "#F8FAFC", borderColor: "#CBD5E1", fontWeight: "600", color: "#0F172A", padding: "0.625rem 1rem", borderRadius: "10px" }}
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
            📂 TARGET MODULE ATTACHMENT
          </label>
          <select
            className="pf-select"
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            disabled={!activeCourse?.modules || activeCourse.modules.length === 0}
            style={{ width: "100%", background: "#F8FAFC", borderColor: "#CBD5E1", fontWeight: "600", color: "#0F172A", padding: "0.625rem 1rem", borderRadius: "10px" }}
          >
            {activeCourse?.modules && activeCourse.modules.length > 0 ? (
              activeCourse.modules.map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))
            ) : (
              <option value="">No modules in this course</option>
            )}
          </select>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Column: Markdown & Math Theory Editor */}
        <div style={{ background: "#FFFFFF", borderRadius: "18px", border: "1px solid #E2E8F0", padding: "1.75rem", boxShadow: "0 6px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #F1F5F9" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span>✍️</span> Theory Markdown Editor
            </h2>

            {/* View Mode Toggle */}
            <div style={{ display: "inline-flex", background: "#F1F5F9", padding: "3px", borderRadius: "8px" }}>
              <button
                type="button"
                onClick={() => setViewMode("split")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: viewMode === "split" ? "#7C3AED" : "transparent",
                  color: viewMode === "split" ? "#FFFFFF" : "#64748B"
                }}
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode("edit")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: viewMode === "edit" ? "#7C3AED" : "transparent",
                  color: viewMode === "edit" ? "#FFFFFF" : "#64748B"
                }}
              >
                Editor Only
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                style={{
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: viewMode === "preview" ? "#7C3AED" : "transparent",
                  color: viewMode === "preview" ? "#FFFFFF" : "#64748B"
                }}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Quick Syllabus Presets */}
          <div style={{ marginBottom: "1.25rem", background: "rgba(124, 58, 237, 0.05)", border: "1px dashed rgba(124, 58, 237, 0.25)", borderRadius: "12px", padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#6D28D9", marginBottom: "6px", textTransform: "uppercase" }}>
              ⚡ Load Theoretical Topic Presets:
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {THEORY_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  style={{
                    fontSize: "0.75rem",
                    padding: "4px 10px",
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "6px",
                    cursor: "pointer",
                    color: "#334155",
                    fontWeight: "600",
                    transition: "all 0.15s ease"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.color = "#7C3AED"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.color = "#334155"; }}
                >
                  {p.title.split(":")[0]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddTheoryLesson}>
            <div className="pf-input-group" style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                Lesson / Section Title *
              </label>
              <input
                type="text"
                className="pf-input"
                placeholder="e.g. Mathematical Derivation of Quantum Superposition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Estimated Reading Duration
                </label>
                <input
                  type="text"
                  className="pf-input"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Content Format
                </label>
                <div style={{ padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#F8FAFC", fontSize: "0.875rem", color: "#64748B", fontWeight: "600" }}>
                  Markdown + KaTeX Math
                </div>
              </div>
            </div>

            {/* Scientific Notation Quick Insert Bar */}
            <div style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#64748B", marginBottom: "4px" }}>
                INSERT SCIENTIFIC NOTATION CHIPS:
              </label>
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                <button type="button" onClick={() => insertSnippet("$$\\vert\\psi\\rangle = \\alpha\\vert 0\\rangle + \\beta\\vert 1\\rangle$$")} style={{ fontSize: "0.75rem", padding: "2px 8px", background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: "4px", cursor: "pointer" }}>|ψ⟩ State</button>
                <button type="button" onClick={() => insertSnippet("$$H = \\frac{1}{\\sqrt{2}}\\begin{pmatrix} 1 & 1 \\\\ 1 & -1 \\end{pmatrix}$$")} style={{ fontSize: "0.75rem", padding: "2px 8px", background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: "4px", cursor: "pointer" }}>Hadamard Matrix</button>
                <button type="button" onClick={() => insertSnippet("$$|\\Phi^+\\rangle = \\frac{1}{\\sqrt{2}}(|00\\rangle + |11\\rangle)$$")} style={{ fontSize: "0.75rem", padding: "2px 8px", background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: "4px", cursor: "pointer" }}>Bell State</button>
                <button type="button" onClick={() => insertSnippet("```python\nfrom qiskit import QuantumCircuit\nqc = QuantumCircuit(2)\nqc.h(0)\nqc.cx(0, 1)\n```")} style={{ fontSize: "0.75rem", padding: "2px 8px", background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: "4px", cursor: "pointer" }}>Qiskit Code Block</button>
                <button type="button" onClick={() => insertSnippet("> [!NOTE]\n> **Physical Interpretation**: Phase coherence is preserved.")} style={{ fontSize: "0.75rem", padding: "2px 8px", background: "#F1F5F9", border: "1px solid #CBD5E1", borderRadius: "4px", cursor: "pointer" }}>Callout Alert</button>
              </div>
            </div>

            {/* Editor and Preview Split Area */}
            <div style={{
              display: viewMode === "split" ? "grid" : "block",
              gridTemplateColumns: viewMode === "split" ? "1fr 1fr" : "1fr",
              gap: "1rem",
              marginBottom: "1.25rem"
            }}>
              {viewMode !== "preview" && (
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748B", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                    <span>MARKDOWN SOURCE</span>
                    <span>{content.length} chars</span>
                  </div>
                  <textarea
                    className="pf-textarea"
                    rows={12}
                    style={{
                      width: "100%",
                      fontFamily: "monospace",
                      fontSize: "0.8125rem",
                      lineHeight: "1.6",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #CBD5E1"
                    }}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                </div>
              )}

              {viewMode !== "edit" && (
                <div>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#7C3AED", marginBottom: "4px", display: "flex", justifyContent: "space-between" }}>
                    <span>LIVE RENDERED OUTPUT</span>
                    <span>Format Preview</span>
                  </div>
                  <div style={{
                    minHeight: "260px",
                    maxHeight: "330px",
                    overflowY: "auto",
                    padding: "0.875rem",
                    borderRadius: "8px",
                    border: "1px solid #E2E8F0",
                    background: "#FAFAFA",
                    fontSize: "0.8125rem",
                    lineHeight: "1.6",
                    color: "#0F172A",
                    whiteSpace: "pre-wrap"
                  }}>
                    {content}
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !selectedModuleId}
              style={{
                width: "100%",
                padding: "0.875rem",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: "0.9375rem",
                border: "none",
                cursor: (loading || !selectedModuleId) ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(124, 58, 237, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <span>{loading ? "Publishing Syllabus..." : "📚 Publish Theory Lesson to Syllabus"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Published Theory Lessons */}
        <div>
          <div style={{ background: "#FFFFFF", borderRadius: "18px", border: "1px solid #E2E8F0", padding: "1.75rem", boxShadow: "0 6px 20px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  Published Theory Syllabus
                </h2>
                <span style={{ fontSize: "0.8125rem", color: "#64748B" }}>
                  {filteredTheory.length} theory topic{filteredTheory.length !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Search Input */}
            <div style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="🔍 Search theory units or equations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "0.8125rem", background: "#F8FAFC" }}
              />
            </div>

            {filteredTheory.length === 0 ? (
              <div style={{ padding: "3rem 1.5rem", textAlign: "center", background: "#F8FAFC", borderRadius: "12px", border: "1px dashed #CBD5E1" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📝</div>
                <div style={{ fontWeight: "700", color: "#334155", fontSize: "0.9375rem" }}>No theory lessons match query</div>
                <div style={{ fontSize: "0.8125rem", color: "#64748B", marginTop: "4px" }}>
                  Author and publish reading units from the left pane.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "680px", overflowY: "auto", paddingRight: "4px" }}>
                {filteredTheory.map(les => (
                  <div
                    key={les.id}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "14px",
                      padding: "1.25rem",
                      background: "#FFFFFF",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <div style={{ flex: 1 }}>
                        <span style={{
                          display: "inline-block",
                          background: "rgba(124, 58, 237, 0.1)",
                          color: "#6D28D9",
                          fontSize: "0.6875rem",
                          fontWeight: "700",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          marginBottom: "4px",
                          textTransform: "uppercase"
                        }}>
                          {les.moduleTitle}
                        </span>
                        <h4 style={{ fontWeight: "800", fontSize: "0.9375rem", color: "#0F172A", margin: "2px 0 0 0", lineHeight: "1.4" }}>
                          {les.title}
                        </h4>
                      </div>

                      <div style={{ display: "flex", gap: "6px" }}>
                        <button
                          type="button"
                          onClick={() => setPreviewModalLesson(les)}
                          style={{
                            padding: "4px 8px",
                            background: "#F5F3FF",
                            color: "#7C3AED",
                            border: "1px solid #DDD6FE",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                          title="Read Full Formatted Lesson"
                        >
                          👁️ Read
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLesson(les.moduleId, les.id, les.title)}
                          style={{
                            padding: "4px 8px",
                            background: "#FEE2E2",
                            color: "#DC2626",
                            border: "1px solid #FECACA",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            cursor: "pointer"
                          }}
                          title="Delete Lesson"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.8125rem", color: "#64748B", marginBottom: "0.75rem" }}>
                      <span>📖 Estimated Reading: <strong style={{ color: "#334155" }}>{les.duration}</strong></span>
                    </div>

                    {les.content && (
                      <div style={{
                        fontSize: "0.75rem",
                        color: "#475569",
                        background: "#F8FAFC",
                        padding: "0.625rem 0.875rem",
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                        whiteSpace: "pre-line",
                        maxHeight: "100px",
                        overflowY: "auto",
                        fontFamily: "monospace"
                      }}>
                        {les.content.substring(0, 180)}...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reader Modal */}
      {previewModalLesson && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(6px)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem"
        }}>
          <div style={{
            background: "#FFFFFF",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "850px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
          }}>
            <div style={{ padding: "1.25rem 1.75rem", background: "#0F172A", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#A78BFA", fontWeight: "700", textTransform: "uppercase" }}>
                  {previewModalLesson.moduleTitle} • ⏱️ {previewModalLesson.duration}
                </span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "1.125rem", fontWeight: "800", color: "#FFFFFF" }}>
                  {previewModalLesson.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewModalLesson(null)}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#FFFFFF",
                  fontSize: "1.25rem",
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: "2rem", overflowY: "auto", flex: 1, fontSize: "0.9375rem", lineHeight: "1.7", color: "#1E293B", whiteSpace: "pre-wrap", background: "#FDFDFD" }}>
              {previewModalLesson.content}
            </div>

            <div style={{ padding: "1.25rem 1.75rem", background: "#F8FAFC", borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setPreviewModalLesson(null)}
                style={{
                  padding: "8px 20px",
                  background: "#7C3AED",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
