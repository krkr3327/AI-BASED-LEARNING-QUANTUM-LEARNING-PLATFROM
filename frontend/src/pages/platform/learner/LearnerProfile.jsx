import React, { useEffect, useState } from "react";
import { platformAuth } from "../../../services/platformAuth";

export default function LearnerProfile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const u = platformAuth.getUser();
    if (u) {
      setUser(u);
      setName(u.name || "");
      setPhone(u.phone || "");
      setAvatar(u.avatar || "");
      setBio(u.bio || "");
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
        bio
      });
      setUser(updated);
      setMessage("Profile updated successfully!");
    } catch (err) {
      setMessage("Update failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "700px" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>👤 Student Profile & Account</h1>
        <p className="pf-subtext">Manage your personal details, profile image, and learning bio.</p>
      </div>

      <div className="pf-card">
        {message && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.5rem", background: message.includes("success") ? "#ECFDF5" : "#FEF2F2", color: message.includes("success") ? "#065F46" : "#991B1B", border: `1px solid ${message.includes("success") ? "#A7F3D0" : "#FCA5A5"}` }}>
            {message}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
          <img
            src={avatar || "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150"}
            alt="Profile Preview"
            style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", border: "2px solid #CBD5E1" }}
          />
          <div>
            <h2 className="pf-heading-md" style={{ marginBottom: "2px" }}>{user?.name || "Student"}</h2>
            <div style={{ fontSize: "0.875rem", color: "#64748B" }}>{user?.email}</div>
            <span className="pf-badge pf-badge-primary" style={{ marginTop: "6px" }}>Enrolled Student</span>
          </div>
        </div>

        <form onSubmit={handleUpdate}>
          <div className="pf-input-group">
            <label className="pf-label">Full Name *</label>
            <input
              type="text"
              className="pf-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="pf-input-group">
            <label className="pf-label">Email Address (Fixed)</label>
            <input
              type="email"
              className="pf-input"
              value={user?.email || ""}
              disabled
              style={{ background: "#F1F5F9", cursor: "not-allowed" }}
            />
          </div>

          <div className="pf-input-group">
            <label className="pf-label">Contact Phone</label>
            <input
              type="tel"
              className="pf-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="pf-input-group">
            <label className="pf-label">Avatar Photo URL</label>
            <input
              type="url"
              className="pf-input"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
            />
          </div>

          <div className="pf-input-group">
            <label className="pf-label">Learning Biography &amp; Goals</label>
            <textarea
              className="pf-textarea"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pf-btn pf-btn-primary"
            style={{ width: "100%", padding: "0.75rem", marginTop: "1rem" }}
          >
            {loading ? "Saving..." : "💾 Save Profile Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
