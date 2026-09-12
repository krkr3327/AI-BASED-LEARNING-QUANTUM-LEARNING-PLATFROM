import React, { useEffect, useState } from "react";
import { platformApi } from "../../../services/platformApi";
import { DEFAULT_COURSES } from "../../../services/defaultPlatformData";

const NOTE_PRESETS = [
  {
    title: "Qiskit Quantum Circuit Reference Cheat Sheet v1.2",
    fileName: "Qiskit_CheatSheet_v1.2.pdf",
    category: "PDF Cheatsheet",
    fileSize: "2.4 MB",
    fileUrl: "https://raw.githubusercontent.com/qiskit-community/qiskit-translations/master/docs/cheatsheet/cheatsheet.pdf",
    description: "Full reference for quantum circuits, Hadamard/Pauli gates, statevector simulators, and QPU job execution."
  },
  {
    title: "Linear Algebra & Dirac Bra-Ket Notation Reference Guide",
    fileName: "Quantum_Linear_Algebra_Formulas.pdf",
    category: "Reference Guide",
    fileSize: "1.8 MB",
    fileUrl: "https://quantum-computing.ibm.com/lab/docs/iql/linalg-cheatsheet.pdf",
    description: "Matrix representations of unitary operators, tensor products, eigenvalues, and projection operators."
  },
  {
    title: "Shor's Algorithm & Quantum Fourier Transform Lab Notebook",
    fileName: "Shors_Algorithm_Walkthrough.ipynb",
    category: "Jupyter Notebook",
    fileSize: "4.1 MB",
    fileUrl: "https://github.com/qiskit-community/qiskit-textbook/raw/main/content/ch-algorithms/shor.ipynb",
    description: "Interactive Jupyter Notebook with step-by-step modular exponentiation circuits and period finding."
  }
];

export default function NotesManager() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState(DEFAULT_COURSES[0].id);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("PDF Cheatsheet");
  const [description, setDescription] = useState("");
  const [fileName, setFileName] = useState("Quantum_Cheatsheet.pdf");
  const [fileUrl, setFileUrl] = useState("https://raw.githubusercontent.com/qiskit-community/qiskit-translations/master/docs/cheatsheet/cheatsheet.pdf");
  const [fileSize, setFileSize] = useState("2.4 MB");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState("");

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
      console.warn("Notes manager using fallback courses:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCourse = courses.find(c => c.id === selectedCourseId);

  const handleApplyPreset = (preset) => {
    setTitle(preset.title);
    setCategory(preset.category);
    setFileName(preset.fileName);
    setFileSize(preset.fileSize);
    setFileUrl(preset.fileUrl);
    setDescription(preset.description);
  };

  const handleSimulatedFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMB} MB`);
      setFileUrl(`https://storage.quantum-nexus.internal/resources/${encodeURIComponent(file.name)}`);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
      }
      if (file.name.endsWith(".ipynb")) setCategory("Jupyter Notebook");
      else if (file.name.endsWith(".pdf")) setCategory("PDF Cheatsheet");
      else if (file.name.endsWith(".pptx") || file.name.endsWith(".ppt")) setCategory("Slide Deck");
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    if (!title.trim()) {
      alert("Please provide a resource title.");
      return;
    }
    setLoading(true);
    try {
      await platformApi.addNote(selectedCourseId, {
        title: title.trim(),
        description: description.trim(),
        file_name: fileName.trim() || "Resource_Document.pdf",
        file_url: fileUrl.trim(),
        category,
        file_size: fileSize
      });
      setSuccessToast(`Resource "${title}" attached to course repository!`);
      setTimeout(() => setSuccessToast(""), 4000);
      setTitle("");
      setDescription("");
      await loadData();
    } catch (err) {
      alert("Failed to upload note: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (noteId, noteTitle) => {
    if (window.confirm(`Delete resource "${noteTitle || 'this resource'}" from course repository?`)) {
      try {
        await platformApi.deleteNote(selectedCourseId, noteId);
        setSuccessToast("Resource deleted from library.");
        setTimeout(() => setSuccessToast(""), 3000);
        await loadData();
      } catch (err) {
        alert("Failed to delete note: " + err.message);
      }
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    setSuccessToast("Resource link copied to clipboard!");
    setTimeout(() => setSuccessToast(""), 3000);
  };

  const rawNotes = activeCourse?.notes || [];
  const filteredNotes = rawNotes.filter(n => {
    const matchSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (n.description && n.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        (n.file_name && n.file_name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCat = filterCategory === "ALL" || (n.category || "PDF Cheatsheet") === filterCategory;
    return matchSearch && matchCat;
  });

  const getFormatBadge = (name = "") => {
    if (name.endsWith(".ipynb")) return { label: "IPYNB", bg: "#FEF3C7", color: "#D97706", icon: "🪐" };
    if (name.endsWith(".pdf")) return { label: "PDF", bg: "#FEE2E2", color: "#DC2626", icon: "📑" };
    if (name.endsWith(".pptx") || name.endsWith(".ppt")) return { label: "SLIDES", bg: "#DBEAFE", color: "#2563EB", icon: "📊" };
    if (name.endsWith(".py")) return { label: "PYTHON", bg: "#DCFCE7", color: "#15803D", icon: "🐍" };
    return { label: "DOC", bg: "#F1F5F9", color: "#475569", icon: "📄" };
  };

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
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(239, 246, 255, 0.9))",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(37, 99, 235, 0.2)",
        borderRadius: "20px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 12px 30px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(37, 99, 235, 0.1)", color: "#1D4ED8", padding: "4px 12px", borderRadius: "999px", fontSize: "0.8125rem", fontWeight: "700", marginBottom: "0.75rem", letterSpacing: "0.03em" }}>
              📁 STUDY MATERIAL & RESOURCE REPOSITORY
            </div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "800", color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
              Notes & Document Library Studio
            </h1>
            <p style={{ color: "#475569", marginTop: "6px", marginBottom: 0, fontSize: "0.9375rem", maxWidth: "680px", lineHeight: "1.5" }}>
              Distribute supplementary study materials, PDF quantum cheat sheets, Jupyter notebooks (.ipynb), slide decks, and research references.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ background: "#FFFFFF", padding: "0.875rem 1.25rem", borderRadius: "14px", border: "1px solid #E2E8F0", textAlign: "center", minWidth: "110px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: "800", color: "#2563EB" }}>{rawNotes.length}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>Files</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "0.875rem 1.25rem", borderRadius: "14px", border: "1px solid #E2E8F0", textAlign: "center", minWidth: "110px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: "800", color: "#0D9488" }}>PDF / IPYNB</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>Formats</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "0.875rem 1.25rem", borderRadius: "14px", border: "1px solid #E2E8F0", textAlign: "center", minWidth: "110px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: "800", color: "#7C3AED" }}>Direct</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>Download</div>
            </div>
          </div>
        </div>
      </div>

      {/* Select Course Bar */}
      <div style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        padding: "1.25rem 1.75rem",
        marginBottom: "2rem",
        boxShadow: "0 4px 16px rgba(0,0,0,0.02)"
      }}>
        <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
          🎓 ACTIVE COURSE CURRICULUM
        </label>
        <select
          className="pf-select"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          style={{ width: "100%", background: "#F8FAFC", borderColor: "#CBD5E1", fontWeight: "600", color: "#0F172A", padding: "0.625rem 1rem", borderRadius: "10px" }}
        >
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Column: Upload Form */}
        <div style={{ background: "#FFFFFF", borderRadius: "18px", border: "1px solid #E2E8F0", padding: "1.75rem", boxShadow: "0 6px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #F1F5F9" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📤</span> Attach & Publish Resource
            </h2>
          </div>

          {/* Quick Presets Bar */}
          <div style={{ marginBottom: "1.25rem", background: "rgba(37, 99, 235, 0.05)", border: "1px dashed rgba(37, 99, 235, 0.25)", borderRadius: "12px", padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#1D4ED8", marginBottom: "6px", textTransform: "uppercase" }}>
              ⚡ Quick Resource Presets:
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {NOTE_PRESETS.map((p, idx) => (
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
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#2563EB"; e.currentTarget.style.color = "#2563EB"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.color = "#334155"; }}
                >
                  {p.title.substring(0, 24)}...
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddNote}>
            <div className="pf-input-group" style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                Document Title *
              </label>
              <input
                type="text"
                className="pf-input"
                placeholder="e.g. Unit 1 Comprehensive Formula Sheet"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Resource Category
                </label>
                <select
                  className="pf-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem", fontWeight: "600" }}
                >
                  <option value="PDF Cheatsheet">PDF Cheatsheet</option>
                  <option value="Reference Guide">Reference Guide</option>
                  <option value="Jupyter Notebook">Jupyter Notebook (.ipynb)</option>
                  <option value="Slide Deck">Slide Deck (.pptx)</option>
                  <option value="Scientific Preprint">Scientific Preprint</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  File Name (Display) *
                </label>
                <input
                  type="text"
                  className="pf-input"
                  placeholder="e.g. Lecture_01_Summary.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  required
                />
              </div>
            </div>

            {/* Dropzone mockup */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                Select or Drop File to Attach
              </label>
              <div style={{
                border: "2px dashed #2563EB",
                background: "rgba(37, 99, 235, 0.03)",
                borderRadius: "12px",
                padding: "1.25rem",
                textAlign: "center",
                cursor: "pointer",
                position: "relative"
              }}>
                <input
                  type="file"
                  onChange={handleSimulatedFileUpload}
                  style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%", height: "100%" }}
                />
                <div style={{ fontSize: "1.75rem", marginBottom: "2px" }}>📎</div>
                <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0F172A" }}>
                  {fileName ? `${fileName} (${fileSize})` : "Click or drag document file here"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "2px" }}>
                  Auto-generates cloud CDN secure distribution link
                </div>
              </div>
            </div>

            <div className="pf-input-group" style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                Direct Download / Source URL *
              </label>
              <input
                type="text"
                className="pf-input"
                placeholder="https://... or file path"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                required
              />
            </div>

            <div className="pf-input-group" style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                Description & Student Usage Notes
              </label>
              <textarea
                className="pf-textarea"
                rows={3}
                placeholder="Explains matrix multiplication rules, Dirac bracket identities, and gate symbols..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.875rem",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: "0.9375rem",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <span>{loading ? "Saving Resource..." : "➕ Attach Note Resource to Course"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Existing Notes & Documents */}
        <div>
          <div style={{ background: "#FFFFFF", borderRadius: "18px", border: "1px solid #E2E8F0", padding: "1.75rem", boxShadow: "0 6px 20px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  Available Course Resources
                </h2>
                <span style={{ fontSize: "0.8125rem", color: "#64748B" }}>
                  {filteredNotes.length} file{filteredNotes.length !== 1 ? "s" : ""} in library
                </span>
              </div>

              {/* Category Filter */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", color: "#334155", fontWeight: "600" }}
              >
                <option value="ALL">All Formats</option>
                <option value="PDF Cheatsheet">PDF Cheatsheets</option>
                <option value="Reference Guide">Reference Guides</option>
                <option value="Jupyter Notebook">Jupyter Notebooks</option>
                <option value="Slide Deck">Slide Decks</option>
              </select>
            </div>

            {/* Search filter */}
            <div style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="🔍 Search files, titles, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "0.8125rem", background: "#F8FAFC" }}
              />
            </div>

            {filteredNotes.length === 0 ? (
              <div style={{ padding: "3rem 1.5rem", textAlign: "center", background: "#F8FAFC", borderRadius: "12px", border: "1px dashed #CBD5E1" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>📁</div>
                <div style={{ fontWeight: "700", color: "#334155", fontSize: "0.9375rem" }}>No resources attached yet</div>
                <div style={{ fontSize: "0.8125rem", color: "#64748B", marginTop: "4px" }}>
                  Upload formula cheat sheets, Jupyter notebooks, and slides on the left.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "680px", overflowY: "auto", paddingRight: "4px" }}>
                {filteredNotes.map(note => {
                  const badge = getFormatBadge(note.file_name);
                  return (
                    <div
                      key={note.id}
                      style={{
                        border: "1px solid #E2E8F0",
                        borderRadius: "14px",
                        padding: "1.25rem",
                        background: "#FFFFFF",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", marginBottom: "0.5rem" }}>
                        <div style={{ display: "flex", gap: "0.875rem", minWidth: 0, flex: 1 }}>
                          <div style={{
                            width: "44px",
                            height: "44px",
                            borderRadius: "10px",
                            background: badge.bg,
                            color: badge.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "1.375rem",
                            flexShrink: 0
                          }}>
                            {badge.icon}
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "2px" }}>
                              <span style={{ fontSize: "0.6875rem", fontWeight: "700", background: badge.bg, color: badge.color, padding: "2px 6px", borderRadius: "4px" }}>
                                {badge.label}
                              </span>
                              {note.category && (
                                <span style={{ fontSize: "0.6875rem", fontWeight: "600", color: "#64748B" }}>
                                  • {note.category}
                                </span>
                              )}
                            </div>

                            <h4 style={{ fontWeight: "800", fontSize: "0.9375rem", color: "#0F172A", margin: 0, lineHeight: "1.4" }}>
                              {note.title}
                            </h4>

                            <div style={{ fontSize: "0.75rem", color: "#2563EB", fontWeight: "600", marginTop: "4px" }}>
                              📄 {note.file_name} {note.file_size ? `(${note.file_size})` : ""}
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <a
                            href={note.file_url}
                            target="_blank"
                            rel="noreferrer"
                            download
                            style={{
                              padding: "4px 8px",
                              background: "#EFF6FF",
                              color: "#2563EB",
                              border: "1px solid #BFDBFE",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: "700",
                              textDecoration: "none",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "3px"
                            }}
                            title="Download / Open File"
                          >
                            ⬇️ Get
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(note.file_url)}
                            style={{
                              padding: "4px 8px",
                              background: "#F8FAFC",
                              color: "#475569",
                              border: "1px solid #CBD5E1",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              cursor: "pointer"
                            }}
                            title="Copy Link"
                          >
                            🔗
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note.id, note.title)}
                            style={{
                              padding: "4px 8px",
                              background: "#FEE2E2",
                              color: "#DC2626",
                              border: "1px solid #FECACA",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              cursor: "pointer"
                            }}
                            title="Delete Resource"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {note.description && (
                        <div style={{
                          fontSize: "0.8125rem",
                          color: "#475569",
                          marginTop: "8px",
                          background: "#F8FAFC",
                          padding: "0.5rem 0.75rem",
                          borderRadius: "8px",
                          border: "1px solid #E2E8F0"
                        }}>
                          {note.description}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

