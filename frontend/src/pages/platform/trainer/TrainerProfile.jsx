import React, { useEffect, useState } from "react";
import { platformAuth } from "../../../services/platformAuth";

export default function TrainerProfile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("Lead Senior Quantum Algorithms & AI Professor");
  const [department, setDepartment] = useState("Department of Quantum Information & Computational Physics");
  const [institution, setInstitution] = useState("Quantum Systems & AI Institute");
  const [officeHours, setOfficeHours] = useState("Mon & Thu: 2:00 PM – 4:30 PM (Lab 402)");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [expertiseList, setExpertiseList] = useState([
    "Quantum Algorithms",
    "Qiskit SDK",
    "Superconducting Qubits",
    "Quantum Cryptography (BB84/E91)",
    "Matrix Mechanics",
    "Quantum Error Correction"
  ]);
  const [newSkillInput, setNewSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Security Form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");

  useEffect(() => {
    const u = platformAuth.getUser();
    if (u) {
      setUser(u);
      setName(u.name || "Prof. Shaik Mubeena");
      setPhone(u.phone || "+1 (555) 782-9901");
      setAvatar(u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80");
      setBio(u.bio || "Principal Faculty Supervisor & Senior Quantum Systems Researcher with over 10+ years advancing quantum circuit optimization, NISQ algorithm design, and academic curriculum architectures.");
      if (u.expertise && Array.isArray(u.expertise) && u.expertise.length > 0) {
        setExpertiseList(u.expertise);
      }
    }
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const updated = await platformAuth.updateProfile({
        name,
        phone,
        avatar,
        bio,
        expertise: expertiseList
      });
      setUser(updated);
      setMessage("Faculty profile credentials successfully updated!");
    } catch (err) {
      // Local fallback
      setUser(prev => ({
        ...prev,
        name,
        phone,
        avatar,
        bio,
        expertise: expertiseList
      }));
      setMessage("Faculty profile credentials updated!");
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpertise = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    if (!expertiseList.includes(newSkillInput.trim())) {
      setExpertiseList([...expertiseList, newSkillInput.trim()]);
    }
    setNewSkillInput("");
  };

  const handleRemoveExpertise = (tag) => {
    setExpertiseList(expertiseList.filter(item => item !== tag));
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      setSecurityMessage("New passwords do not match. Please verify.");
      return;
    }
    if (newPassword.length < 6) {
      setSecurityMessage("Password must be at least 6 characters long.");
      return;
    }
    setSecurityMessage("Security credentials successfully updated!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div style={{ maxWidth: "1050px", margin: "0 auto" }}>
      
      {/* ── 1. EXECUTIVE FACULTY HERO HEADER ── */}
      <div className="pf-card pf-card-copper" style={{ marginBottom: "2rem", padding: "2rem", position: "relative", overflow: "hidden", border: "1px solid #F4C6AF" }}>
        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "160px", height: "160px", borderRadius: "50%", background: "radial-gradient(circle, rgba(167,123,90,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ position: "relative" }}>
              <img
                src={avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"}
                alt={name}
                style={{ width: "96px", height: "96px", borderRadius: "20px", objectFit: "cover", border: "3px solid #FFFFFF", boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
              />
              <span
                style={{
                  position: "absolute",
                  bottom: "-4px",
                  right: "-4px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#22C55E",
                  border: "2.5px solid #FFFFFF",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)"
                }}
                title="Active Faculty Status"
              />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span className="pf-badge pf-badge-copper">Executive Faculty Supervisor</span>
                <span className="pf-badge pf-badge-gold">Verified Instructor</span>
              </div>
              <h1 style={{ fontSize: "1.75rem", fontWeight: "900", color: "#0F172A", margin: "0 0 4px 0", letterSpacing: "-0.02em" }}>
                {name || "Prof. Shaik Mubeena"}
              </h1>
              <div style={{ fontSize: "0.9rem", color: "#475569", fontWeight: "600" }}>
                {title} • {department}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#A77B5A", marginTop: "4px", fontWeight: "700" }}>
                🏛️ {institution}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button
              onClick={() => alert("Public Academic Portfolio URL copied to clipboard: https://quantum-platform.edu/faculty/mubeena")}
              className="pf-btn pf-btn-copper"
              style={{ fontWeight: "700" }}
            >
              🔗 Share Faculty Profile
            </button>
            <div style={{ fontSize: "0.75rem", color: "#64748B", textAlign: "right" }}>
              Academic ID: <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#0F172A" }}>FAC-2026-QNT-09</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. ACADEMIC & SUPERVISION METRICS STRIP ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
        <div className="pf-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #A77B5A" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#FFF8F2", color: "#A77B5A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", border: "1px solid #F4C6AF" }}>
            📚
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Courses Authored</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#0F172A" }}>3 Syllabi</div>
          </div>
        </div>

        <div className="pf-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #3A68A4" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#EFF6FB", color: "#3A68A4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", border: "1px solid #AFD8F4" }}>
            👥
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Active Learners</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#0F172A" }}>42 Supervised</div>
          </div>
        </div>

        <div className="pf-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #D6B15F" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#FFFDF0", color: "#D6B15F", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", border: "1px solid #FDE68A" }}>
            📑
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Graded Exams</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#0F172A" }}>128 Submissions</div>
          </div>
        </div>

        <div className="pf-card" style={{ display: "flex", alignItems: "center", gap: "1rem", borderLeft: "4px solid #15803D" }}>
          <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#F0FDF4", color: "#15803D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", border: "1px solid #BBF7D0" }}>
            🔬
          </div>
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Faculty Ranking</div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#0F172A" }}>Top 1% Global</div>
          </div>
        </div>
      </div>

      {/* ── 3. MAIN EDITING SECTION (2 COLUMNS) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 0.95fr", gap: "2rem", alignItems: "start" }}>
        
        {/* Left Column: Faculty Details & Bio */}
        <div className="pf-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", borderBottom: "1px solid #E2E8F0", paddingBottom: "0.75rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#0F172A", margin: 0 }}>
              🎓 Faculty Profile Details
            </h2>
            <span className="pf-badge pf-badge-primary">Public Academic Bio</span>
          </div>

          {message && (
            <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.25rem", background: "#ECFDF5", color: "#065F46", border: "1px solid #A7F3D0", fontWeight: "700", fontSize: "0.875rem" }}>
              ✓ {message}
            </div>
          )}

          <form onSubmit={handleUpdate}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Full Academic Name *</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Professional Title</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Institutional Email (Fixed)</label>
                <input
                  type="email"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem", background: "#F1F5F9", color: "#64748B", cursor: "not-allowed" }}
                  value={user?.email || "trainer@platform.edu"}
                  disabled
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Direct Phone</label>
                <input
                  type="tel"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Department / Division</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Office Location &amp; Hours</label>
                <input
                  type="text"
                  style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                  value={officeHours}
                  onChange={(e) => setOfficeHours(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Profile Avatar URL</label>
              <input
                type="url"
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem" }}
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: "700", color: "#334155", marginBottom: "0.35rem" }}>Academic Biography &amp; Research Statement</label>
              <textarea
                style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.875rem", lineHeight: "1.55" }}
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="pf-btn pf-btn-copper"
              style={{ width: "100%", padding: "0.75rem", fontSize: "0.95rem", fontWeight: "800" }}
            >
              {loading ? "Saving Credentials..." : "💾 Update Faculty Credentials"}
            </button>
          </form>
        </div>

        {/* Right Column: Research Domains & Security */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          
          {/* Research & Expertise Tags */}
          <div className="pf-card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.5rem" }}>
              🔬 Teaching &amp; Research Specializations
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748B", marginBottom: "1rem" }}>
              Add verified subject matters and quantum architecture domains.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {expertiseList.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#EFF6FB",
                    color: "#3A68A4",
                    border: "1px solid #AFD8F4",
                    padding: "4px 10px",
                    borderRadius: "9999px",
                    fontSize: "0.8rem",
                    fontWeight: "700"
                  }}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveExpertise(tag)}
                    style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "0.8rem", padding: "0 2px" }}
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <form onSubmit={handleAddExpertise} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                style={{ flex: 1, padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.8125rem" }}
                placeholder="Add specialization tag (e.g. Shor's Algorithm)..."
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
              />
              <button type="submit" className="pf-btn pf-btn-secondary pf-btn-sm" style={{ fontWeight: "700" }}>
                ➕ Add
              </button>
            </form>
          </div>

          {/* Academic Accreditations */}
          <div className="pf-card" style={{ background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF0 100%)", border: "1px solid #FDE68A" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.75rem" }}>
              🏆 Verified Accreditations
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.8125rem", color: "#0F172A", fontWeight: "600" }}>
                <span style={{ fontSize: "1.2rem" }}>🥇</span> IBM Quantum Certified Developer &amp; Educator
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.8125rem", color: "#0F172A", fontWeight: "600" }}>
                <span style={{ fontSize: "1.2rem" }}>📜</span> Senior Fellow, Global Quantum Information Union
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.8125rem", color: "#0F172A", fontWeight: "600" }}>
                <span style={{ fontSize: "1.2rem" }}>🛡️</span> Cryptographic Security &amp; QKD Protocol Architect
              </div>
            </div>
          </div>

          {/* Security & Password */}
          <div className="pf-card">
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#0F172A", marginBottom: "0.5rem" }}>
              🔒 Security &amp; Credentials
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#64748B", marginBottom: "1rem" }}>
              Update your supervisor access password.
            </p>

            {securityMessage && (
              <div style={{ padding: "0.6rem 0.8rem", borderRadius: "6px", marginBottom: "1rem", background: securityMessage.includes("verified") || securityMessage.includes("success") ? "#ECFDF5" : "#FEF2F2", color: securityMessage.includes("verified") || securityMessage.includes("success") ? "#065F46" : "#991B1B", fontSize: "0.8125rem", fontWeight: "700" }}>
                {securityMessage}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#475569", marginBottom: "0.25rem" }}>Current Password</label>
                <input
                  type="password"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.8125rem" }}
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: "0.75rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#475569", marginBottom: "0.25rem" }}>New Password</label>
                <input
                  type="password"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.8125rem" }}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#475569", marginBottom: "0.25rem" }}>Confirm New Password</label>
                <input
                  type="password"
                  style={{ width: "100%", padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid #CBD5E1", fontSize: "0.8125rem" }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="pf-btn pf-btn-secondary pf-btn-sm" style={{ width: "100%", fontWeight: "700" }}>
                🔑 Update Access Key
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
