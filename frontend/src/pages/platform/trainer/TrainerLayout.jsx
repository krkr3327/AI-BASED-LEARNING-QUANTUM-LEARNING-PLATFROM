import React, { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { platformAuth } from "../../../services/platformAuth";
import { platformApi } from "../../../services/platformApi";
import QuantumAtmosphereBackground from "../../../components/ui/QuantumAtmosphereBackground";
import "../platform.css";

export default function TrainerLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // RBAC Check
    if (!platformAuth.isAuthenticated()) {
      navigate("/auth/trainer");
      return;
    }
    const currentRole = platformAuth.getRole();
    if (currentRole !== "trainer") {
      navigate("/learner/dashboard");
      return;
    }
    const u = platformAuth.getUser();
    setUser(u);

    // Fetch unread notifications
    platformApi.getNotifications().then(notifs => {
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    }).catch(() => {});
  }, [navigate]);

  const handleLogout = () => {
    platformAuth.logout();
    navigate("/");
  };

  return (
    <div className="pf-container pf-layout" style={{ position: "relative", zIndex: 1 }}>
      <QuantumAtmosphereBackground />
      {/* Sidebar */}
      <aside className="pf-sidebar" style={{ position: "relative", zIndex: 2 }}>
        <div className="pf-sidebar-header">
          <div style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "linear-gradient(135deg, #A77B5A 0%, #2C3F60 100%)",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "800",
            fontSize: "1.1rem",
            boxShadow: "0 2px 8px rgba(167, 123, 90, 0.3)"
          }}>
            🎓
          </div>
          <div>
            <div style={{ fontWeight: "800", fontSize: "0.9375rem", color: "#0C0D12" }}>TRAINER STUDIO</div>
            <div style={{ fontSize: "0.72rem", color: "#A77B5A", fontWeight: 700, textTransform: "uppercase" }}>Faculty Control Center</div>
          </div>
        </div>

        <nav className="pf-sidebar-nav">
          <NavLink to="/trainer/dashboard" end className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>📊</span> Dashboard
          </NavLink>
          
          <div style={{ padding: "0.75rem 0.875rem 0.25rem", fontSize: "0.6875rem", fontWeight: "800", color: "#A77B5A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Curriculum &amp; Content
          </div>

          <NavLink to="/trainer/courses" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>📚</span> Course Management
          </NavLink>
          <NavLink to="/trainer/videos" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>🎥</span> Video Lessons
          </NavLink>
          <NavLink to="/trainer/theory" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>📝</span> Theory &amp; Content
          </NavLink>
          <NavLink to="/trainer/notes" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>📁</span> Notes &amp; Resources
          </NavLink>

          <div style={{ padding: "0.75rem 0.875rem 0.25rem", fontSize: "0.6875rem", fontWeight: "800", color: "#A77B5A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Evaluations &amp; Labs
          </div>

          <NavLink to="/trainer/quizzes" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>❓</span> Quizzes
          </NavLink>
          <NavLink to="/trainer/assessments" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>📑</span> Assessments &amp; Grading
          </NavLink>
          <NavLink to="/trainer/challenges" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>⚡</span> Practical Challenges
          </NavLink>
          <NavLink to="/trainer/problems" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>🧩</span> Problems Lab
          </NavLink>

          <div style={{ padding: "0.75rem 0.875rem 0.25rem", fontSize: "0.6875rem", fontWeight: "800", color: "#A77B5A", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Oversight &amp; Account
          </div>

          <NavLink to="/trainer/learners" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>👥</span> Enrolled Learners
          </NavLink>
          <NavLink to="/trainer/notifications" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>🔔</span> Notifications
            {unreadCount > 0 && (
              <span style={{ marginLeft: "auto", background: "#AD6358", color: "#FFF", fontSize: "0.6875rem", padding: "1px 6px", borderRadius: "9999px", fontWeight: "800" }}>
                {unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink to="/trainer/profile" className={({ isActive }) => `pf-nav-item ${isActive ? "active" : ""}`}>
            <span>👤</span> Trainer Profile
          </NavLink>
        </nav>

        {/* Footer User Info */}
        <div className="pf-sidebar-footer">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem", backgroundColor: "#F5F9FC", padding: "8px 10px", borderRadius: "10px", border: "1px solid #E2E8F0" }}>
            <div style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #A77B5A 0%, #2C3F60 100%)",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "800",
              fontSize: "0.85rem",
              flexShrink: 0
            }}>
              {user?.name?.[0]?.toUpperCase() || "T"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#0C0D12", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.name || "Faculty Trainer"}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#A77B5A", fontWeight: 600 }}>
                Faculty Supervisor
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="pf-btn pf-btn-danger pf-btn-sm"
            style={{ width: "100%" }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pf-main-content" style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "transparent" }}>
        <header className="pf-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="pf-badge pf-badge-copper">👨‍🏫 Faculty Studio</span>
            <span style={{ color: "#CBD5E1" }}>|</span>
            <span style={{ fontSize: "0.875rem", color: "#64748B" }}>Academic Authoring &amp; Supervision Suite</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <Link to="/trainer/notifications" style={{ textDecoration: "none", position: "relative", color: "#475569" }}>
              <span style={{ fontSize: "1.25rem" }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: "-4px", right: "-4px", width: "8px", height: "8px", background: "#AD6358", borderRadius: "50%" }}></span>
              )}
            </Link>
            <Link to="/trainer/profile" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #A77B5A, #2C3F60)", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", fontSize: "0.8rem" }}>
                {user?.name?.[0]?.toUpperCase() || "T"}
              </div>
              <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0C0D12" }}>{user?.name?.split(" ")[0] || "Profile"}</span>
            </Link>
          </div>
        </header>

        <main className="pf-page-body" style={{ position: "relative", zIndex: 10, flex: 1, overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
