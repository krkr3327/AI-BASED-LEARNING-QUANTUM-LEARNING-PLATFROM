import React, { useEffect, useState } from "react";
import { platformApi } from "../../../services/platformApi";
import { DEFAULT_COURSES } from "../../../services/defaultPlatformData";

const SAMPLE_PRESETS = [
  {
    title: "Quantum Superposition & Single-Qubit Gates (Qiskit)",
    duration: "18 min",
    videoUrl: "https://www.youtube.com/embed/QuRna36xnwk",
    content: "00:00 - Quantum State Vector Foundations\n04:30 - Applying Hadamard & Pauli-X Gates\n11:15 - Bloch Sphere Vector Rotation\n16:00 - Running on IBM Quantum Cloud",
    moduleIndex: 0
  },
  {
    title: "Quantum Entanglement & Bell State Circuit Walkthrough",
    duration: "24 min",
    videoUrl: "https://www.youtube.com/embed/Z0b7i5jA6bU",
    content: "00:00 - Einstein-Podolsky-Rosen (EPR) Paradox\n06:20 - Constructing the CNOT Entangling Circuit\n14:10 - Measurement Probabilities & Born Rule\n21:00 - Quantum Teleportation Protocol Demo",
    moduleIndex: 1
  },
  {
    title: "Grover's Search Algorithm & Phase Inversion Mechanics",
    duration: "32 min",
    videoUrl: "https://www.youtube.com/embed/mG4nOqW56Q4",
    content: "00:00 - Unstructured Database Search Problem\n07:15 - Oracle Matrix Construction\n18:40 - Amplitude Amplification & Diffusion Operator\n28:30 - Quadratic Speedup Proof",
    moduleIndex: 2
  }
];

export default function VideoLessonsManager() {
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [selectedCourseId, setSelectedCourseId] = useState(DEFAULT_COURSES[0].id);
  const [selectedModuleId, setSelectedModuleId] = useState(DEFAULT_COURSES[0].modules[0]?.id || "");
  
  // Lesson form
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("20 min");
  const [videoUrl, setVideoUrl] = useState("https://www.youtube.com/embed/QuRna36xnwk");
  const [content, setContent] = useState("");
  const [uploadMode, setUploadMode] = useState("embed"); // 'embed' | 'upload'
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [previewVideoModal, setPreviewVideoModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModule, setFilterModule] = useState("ALL");
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
      console.warn("Video manager using fallback course data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeCourse = courses.find(c => c.id === selectedCourseId);
  const activeModule = activeCourse?.modules?.find(m => m.id === selectedModuleId);

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
    setDuration(preset.duration);
    setVideoUrl(preset.videoUrl);
    setContent(preset.content);
    if (activeCourse?.modules && activeCourse.modules[preset.moduleIndex]) {
      setSelectedModuleId(activeCourse.modules[preset.moduleIndex].id);
    }
  };

  const handleSimulatedFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
      setIsUploading(true);
      setUploadProgress(15);
      
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            setVideoUrl(`https://storage.quantum-nexus.internal/videos/${encodeURIComponent(file.name)}`);
            if (!title) {
              setTitle(file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "));
            }
            return 100;
          }
          return prev + 25;
        });
      }, 300);
    }
  };

  const handleAddVideoLesson = async (e) => {
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
        duration: duration.trim() || "15 min",
        type: "video",
        video_url: videoUrl.trim(),
        content: content.trim()
      });
      setSuccessToast(`Video lecture "${title}" published successfully!`);
      setTimeout(() => setSuccessToast(""), 4000);
      setTitle("");
      setContent("");
      setUploadedFileName("");
      setUploadProgress(0);
      await loadData();
    } catch (err) {
      alert("Failed to add video lesson: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId, lessonTitle) => {
    if (window.confirm(`Are you sure you want to delete "${lessonTitle || 'this video lesson'}"?`)) {
      try {
        await platformApi.deleteLesson(selectedCourseId, moduleId, lessonId);
        setSuccessToast("Video lesson removed from curriculum.");
        setTimeout(() => setSuccessToast(""), 3000);
        await loadData();
      } catch (err) {
        alert("Failed to delete lesson: " + err.message);
      }
    }
  };

  // Collect all video lessons from the active course
  const allVideoLessons = [];
  if (activeCourse?.modules) {
    activeCourse.modules.forEach(m => {
      m.lessons?.forEach(l => {
        if (l.type === "video") {
          allVideoLessons.push({ ...l, moduleTitle: m.title, moduleId: m.id });
        }
      });
    });
  }

  // Filter video lessons
  const filteredVideos = allVideoLessons.filter(v => {
    const matchSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (v.content && v.content.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchMod = filterModule === "ALL" || v.moduleId === filterModule;
    return matchSearch && matchMod;
  });

  // Safe embed url generator
  const getEmbedUrl = (rawUrl) => {
    if (!rawUrl) return "";
    if (rawUrl.includes("youtube.com/watch?v=")) {
      return rawUrl.replace("youtube.com/watch?v=", "youtube.com/embed/");
    }
    if (rawUrl.includes("youtu.be/")) {
      return rawUrl.replace("youtu.be/", "youtube.com/embed/");
    }
    return rawUrl;
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
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 253, 250, 0.9))",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(13, 148, 136, 0.2)",
        borderRadius: "20px",
        padding: "2rem",
        marginBottom: "2rem",
        boxShadow: "0 12px 30px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(13, 148, 136, 0.1)", color: "#0F766E", padding: "4px 12px", borderRadius: "999px", fontSize: "0.8125rem", fontWeight: "700", marginBottom: "0.75rem", letterSpacing: "0.03em" }}>
              🎬 MULTIMEDIA CURRICULUM SUITE
            </div>
            <h1 style={{ fontSize: "1.875rem", fontWeight: "800", color: "#0F172A", margin: 0, letterSpacing: "-0.02em" }}>
              Video Lecture Studio
            </h1>
            <p style={{ color: "#475569", marginTop: "6px", marginBottom: 0, fontSize: "0.9375rem", maxWidth: "680px", lineHeight: "1.5" }}>
              Deliver immersive algorithmic demonstrations, live QPU hardware executions, and interactive lecture series seamlessly linked to module milestones.
            </p>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ background: "#FFFFFF", padding: "0.875rem 1.25rem", borderRadius: "14px", border: "1px solid #E2E8F0", textAlign: "center", minWidth: "110px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: "800", color: "#0D9488" }}>{allVideoLessons.length}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>Lectures</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "0.875rem 1.25rem", borderRadius: "14px", border: "1px solid #E2E8F0", textAlign: "center", minWidth: "110px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: "800", color: "#2563EB" }}>{activeCourse?.modules?.length || 0}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>Modules</div>
            </div>
            <div style={{ background: "#FFFFFF", padding: "0.875rem 1.25rem", borderRadius: "14px", border: "1px solid #E2E8F0", textAlign: "center", minWidth: "110px", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
              <div style={{ fontSize: "1.375rem", fontWeight: "800", color: "#7C3AED" }}>4K / 60fps</div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: "600", textTransform: "uppercase" }}>Streaming</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course & Module Selectors Bar */}
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
              <option value="">No modules found in course</option>
            )}
          </select>
        </div>
      </div>

      {/* Main Workspace Layout: 2 Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Column: Authoring & Uploading Studio */}
        <div style={{ background: "#FFFFFF", borderRadius: "18px", border: "1px solid #E2E8F0", padding: "1.75rem", boxShadow: "0 6px 20px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", paddingBottom: "0.75rem", borderBottom: "1px solid #F1F5F9" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0F172A", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span>📽️</span> Author & Embed Lecture
            </h2>
            
            {/* Mode Switcher */}
            <div style={{ display: "inline-flex", background: "#F1F5F9", padding: "3px", borderRadius: "8px" }}>
              <button
                type="button"
                onClick={() => setUploadMode("embed")}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: uploadMode === "embed" ? "#0D9488" : "transparent",
                  color: uploadMode === "embed" ? "#FFFFFF" : "#64748B",
                  transition: "all 0.2s ease"
                }}
              >
                URL Embed
              </button>
              <button
                type="button"
                onClick={() => setUploadMode("upload")}
                style={{
                  padding: "4px 12px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: uploadMode === "upload" ? "#0D9488" : "transparent",
                  color: uploadMode === "upload" ? "#FFFFFF" : "#64748B",
                  transition: "all 0.2s ease"
                }}
              >
                Direct File Upload
              </button>
            </div>
          </div>

          {/* Quick Presets Bar */}
          <div style={{ marginBottom: "1.25rem", background: "rgba(13, 148, 136, 0.05)", border: "1px dashed rgba(13, 148, 136, 0.25)", borderRadius: "12px", padding: "0.75rem 1rem" }}>
            <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#0F766E", marginBottom: "6px", textTransform: "uppercase" }}>
              ⚡ Quick Quantum Presets:
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {SAMPLE_PRESETS.map((p, idx) => (
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
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "#0D9488"; e.currentTarget.style.color = "#0D9488"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.color = "#334155"; }}
                >
                  {p.title.substring(0, 26)}...
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddVideoLesson}>
            <div className="pf-input-group" style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                Lecture Title *
              </label>
              <input
                type="text"
                className="pf-input"
                placeholder="e.g. Demonstration of Hadamard Gates in Qiskit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div className="pf-input-group" style={{ marginBottom: 0 }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Duration Estimate *
                </label>
                <input
                  type="text"
                  className="pf-input"
                  placeholder="e.g. 24 min"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  required
                />
              </div>

              <div className="pf-input-group" style={{ marginBottom: 0 }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Resolution / Quality
                </label>
                <input
                  type="text"
                  className="pf-input"
                  value="1080p Full HD"
                  readOnly
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #E2E8F0", background: "#F8FAFC", fontSize: "0.875rem", color: "#64748B" }}
                />
              </div>
            </div>

            {uploadMode === "embed" ? (
              <div className="pf-input-group" style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Video Stream / Embed URL (YouTube, Vimeo, Cloud Storage) *
                </label>
                <input
                  type="url"
                  className="pf-input"
                  placeholder="https://www.youtube.com/embed/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  required
                />
                <span style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "4px", display: "block" }}>
                  💡 Supports direct YouTube URLs, embed URLs, Vimeo links, and raw MP4 streams.
                </span>
              </div>
            ) : (
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                  Upload Raw Video File (.mp4, .webm, .mov)
                </label>
                <div style={{
                  border: "2px dashed #0D9488",
                  background: "rgba(13, 148, 136, 0.03)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative"
                }}>
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    onChange={handleSimulatedFileUpload}
                    style={{
                      position: "absolute",
                      inset: 0,
                      opacity: 0,
                      cursor: "pointer",
                      width: "100%",
                      height: "100%"
                    }}
                  />
                  <div style={{ fontSize: "2rem", marginBottom: "4px" }}>📤</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0F172A" }}>
                    {uploadedFileName ? uploadedFileName : "Click or drag video file here to upload"}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748B", marginTop: "2px" }}>
                    High-bitrate H.264 / AV1 hardware accelerated ingestion (Up to 2GB)
                  </div>
                  {isUploading && (
                    <div style={{ marginTop: "12px" }}>
                      <div style={{ height: "6px", background: "#E2E8F0", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ width: `${uploadProgress}%`, height: "100%", background: "#0D9488", transition: "width 0.3s ease" }} />
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "#0F766E", fontWeight: "700", marginTop: "4px", display: "block" }}>
                        Uploading & Transcoding: {uploadProgress}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Live Player Preview Card */}
            {videoUrl && (
              <div style={{ marginBottom: "1rem", borderRadius: "12px", overflow: "hidden", border: "1px solid #E2E8F0", background: "#0F172A" }}>
                <div style={{ padding: "6px 12px", background: "#1E293B", color: "#94A3B8", fontSize: "0.75rem", fontWeight: "700", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>📺 LIVE INGESTION PREVIEW</span>
                  <span style={{ color: "#34D399" }}>● READY TO STREAM</span>
                </div>
                <div style={{ position: "relative", width: "100%", paddingBottom: "50%", background: "#000000" }}>
                  <iframe
                    src={getEmbedUrl(videoUrl)}
                    title="Video Ingest Preview"
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            <div className="pf-input-group" style={{ marginBottom: "1.25rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
                Chapter Timestamps & Key Takeaways
              </label>
              <textarea
                className="pf-textarea"
                rows={4}
                placeholder="00:00 - Lecture Introduction&#10;05:30 - Quantum Matrix Math&#10;15:45 - Circuit Code Walkthrough"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem", fontFamily: "monospace" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedModuleId}
              style={{
                width: "100%",
                padding: "0.875rem",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0D9488, #0F766E)",
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: "0.9375rem",
                border: "none",
                cursor: (loading || !selectedModuleId) ? "not-allowed" : "pointer",
                boxShadow: "0 4px 14px rgba(13, 148, 136, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <span>{loading ? "Publishing Stream..." : "🚀 Publish Video Lesson to Module"}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Published Video Lessons Library */}
        <div>
          <div style={{ background: "#FFFFFF", borderRadius: "18px", border: "1px solid #E2E8F0", padding: "1.75rem", boxShadow: "0 6px 20px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h2 style={{ fontSize: "1.125rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
                  Published Video Lectures
                </h2>
                <span style={{ fontSize: "0.8125rem", color: "#64748B" }}>
                  {filteredVideos.length} lecture{filteredVideos.length !== 1 ? "s" : ""} in current view
                </span>
              </div>

              {/* Module Filter */}
              <select
                value={filterModule}
                onChange={(e) => setFilterModule(e.target.value)}
                style={{ fontSize: "0.75rem", padding: "4px 8px", borderRadius: "6px", border: "1px solid #CBD5E1", color: "#334155", fontWeight: "600" }}
              >
                <option value="ALL">All Modules</option>
                {activeCourse?.modules?.map(m => (
                  <option key={m.id} value={m.id}>{m.title}</option>
                ))}
              </select>
            </div>

            {/* Search filter */}
            <div style={{ marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="🔍 Search lectures or timestamp topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #E2E8F0", fontSize: "0.8125rem", background: "#F8FAFC" }}
              />
            </div>

            {filteredVideos.length === 0 ? (
              <div style={{ padding: "3rem 1.5rem", textAlign: "center", background: "#F8FAFC", borderRadius: "12px", border: "1px dashed #CBD5E1" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "8px" }}>🎬</div>
                <div style={{ fontWeight: "700", color: "#334155", fontSize: "0.9375rem" }}>No video lessons match query</div>
                <div style={{ fontSize: "0.8125rem", color: "#64748B", marginTop: "4px" }}>
                  Select a module on the left and publish your first video lecture.
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "680px", overflowY: "auto", paddingRight: "4px" }}>
                {filteredVideos.map(les => (
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
                          background: "rgba(13, 148, 136, 0.1)",
                          color: "#0F766E",
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
                          onClick={() => setPreviewVideoModal(les)}
                          style={{
                            padding: "4px 8px",
                            background: "#EFF6FF",
                            color: "#2563EB",
                            border: "1px solid #BFDBFE",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: "700",
                            cursor: "pointer"
                          }}
                          title="Preview Video Player"
                        >
                          ▶ Play
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

                    <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "0.8125rem", color: "#64748B", marginBottom: "0.75rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        ⏱️ <strong style={{ color: "#334155" }}>{les.duration}</strong>
                      </span>
                      <span>•</span>
                      <a
                        href={les.video_url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#0D9488", textDecoration: "none", fontWeight: "600", display: "flex", alignItems: "center", gap: "3px" }}
                      >
                        🔗 Source Link
                      </a>
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
                        {les.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Video Preview Modal */}
      {previewVideoModal && (
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
            maxWidth: "800px",
            overflow: "hidden",
            boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)"
          }}>
            <div style={{ padding: "1.25rem 1.5rem", background: "#0F172A", color: "#FFFFFF", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#34D399", fontWeight: "700", textTransform: "uppercase" }}>
                  {previewVideoModal.moduleTitle}
                </span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "1.125rem", fontWeight: "800", color: "#FFFFFF" }}>
                  {previewVideoModal.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewVideoModal(null)}
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

            <div style={{ position: "relative", width: "100%", paddingBottom: "56.25%", background: "#000000" }}>
              <iframe
                src={getEmbedUrl(previewVideoModal.video_url)}
                title={previewVideoModal.title}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div style={{ padding: "1.25rem 1.5rem", background: "#F8FAFC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "0.8125rem", color: "#64748B" }}>
                ⏱️ Estimated Lesson Duration: <strong style={{ color: "#0F172A" }}>{previewVideoModal.duration}</strong>
              </div>
              <button
                onClick={() => setPreviewVideoModal(null)}
                style={{
                  padding: "6px 16px",
                  background: "#0D9488",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "700",
                  fontSize: "0.875rem",
                  cursor: "pointer"
                }}
              >
                Done Watching
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

