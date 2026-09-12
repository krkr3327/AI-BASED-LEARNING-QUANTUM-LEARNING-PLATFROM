import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { platformApi } from "../../../services/platformApi";

export default function TrainerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      const list = await platformApi.getNotifications();
      setNotifications(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await platformApi.markNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: "800px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 className="pf-heading-lg" style={{ marginBottom: "0.25rem" }}>🔔 Instructor Notifications</h1>
          <p className="pf-subtext">Alerts for student enrollments, exam submissions, and system updates.</p>
        </div>
        {notifications.some(n => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="pf-btn pf-btn-secondary pf-btn-sm">
            ✓ Mark All as Read
          </button>
        )}
      </div>

      <div className="pf-card">
        {notifications.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748B" }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>📭</span>
            No notifications at this time.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {notifications.map(n => (
              <div
                key={n.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "1rem",
                  padding: "1rem",
                  borderRadius: "8px",
                  border: "1px solid #E2E8F0",
                  background: n.is_read ? "#FFFFFF" : "#EFF6FF"
                }}
              >
                <div style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: n.type === "success" ? "#ECFDF5" : "#EFF6FF",
                  color: n.type === "success" ? "#10B981" : "#2563EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem"
                }}>
                  {n.type === "success" ? "🎉" : "📣"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                    <h4 style={{ fontWeight: "700", fontSize: "0.9375rem", color: "#0F172A" }}>{n.title}</h4>
                    <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "#475569", marginBottom: "6px" }}>{n.message}</p>
                  {n.link && (
                    <Link to={n.link} style={{ fontSize: "0.8125rem", color: "#2563EB", fontWeight: "600", textDecoration: "none" }}>
                      View Details &rarr;
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
