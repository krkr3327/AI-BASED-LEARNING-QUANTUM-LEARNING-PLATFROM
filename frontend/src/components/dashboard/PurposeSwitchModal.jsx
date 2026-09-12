import React, { useState, useEffect } from "react";
import { JOB_ROLES, RESEARCH_DOMAINS, ACADEMIC_LEVELS, purposeService } from "../../services/purposeService";

export default function PurposeSwitchModal({ isOpen, onClose, onPurposeUpdated }) {
  const currentPurpose = purposeService.getPurpose();
  const [selectedType, setSelectedType] = useState(currentPurpose.type || "academic");
  const [selectedTargetId, setSelectedTargetId] = useState(currentPurpose.targetId || "beginner");

  useEffect(() => {
    if (isOpen) {
      const p = purposeService.getPurpose();
      setSelectedType(p.type || "academic");
      setSelectedTargetId(p.targetId || "beginner");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      const newPurpose = purposeService.setPurpose(selectedType, selectedTargetId);
      if (onPurposeUpdated) onPurposeUpdated(newPurpose);
      onClose();
    } catch (err) {
      console.error("Error setting purpose:", err);
      alert("Failed to update goal: " + err.message);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(12, 13, 18, 0.65)",
      backdropFilter: "blur(8px)",
      zIndex: 10000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px"
    }}>
      <div style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #CBD5E1",
        borderRadius: "20px",
        width: "100%",
        maxWidth: "760px",
        height: "85vh",
        maxHeight: "720px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 25px 50px -12px rgba(12, 13, 18, 0.3)",
        color: "#0C0D12",
        fontFamily: "Inter, system-ui, sans-serif",
        overflow: "hidden"
      }}>
        {/* Header - Fixed */}
        <div style={{
          padding: "24px 28px 16px 28px",
          borderBottom: "1px solid #F1F5F9",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}>
          <div>
            <div style={{
              display: "inline-block",
              fontSize: "0.72rem",
              color: "#3A68A4",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              backgroundColor: "#EFF6FB",
              padding: "3px 10px",
              borderRadius: "10px",
              border: "1px solid #AFD8F4",
              marginBottom: "6px"
            }}>
              DYNAMIC CURRICULUM &amp; ROADMAP ENGINE
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 900, margin: 0, color: "#0C0D12", letterSpacing: "-0.02em" }}>
              Change Learning Purpose &amp; Destination
            </h2>
            <p style={{ color: "#64748B", fontSize: "0.85rem", margin: "4px 0 0 0" }}>
              Select a target track. The platform will re-synthesize your roadmap, diagnostic tests, missions, and lab experiments.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "#F1F5F9",
              border: "1px solid #E2E8F0",
              borderRadius: "50%",
              width: "34px",
              height: "34px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#64748B",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.15s ease",
              flexShrink: 0
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#E2E8F0"; e.currentTarget.style.color = "#0C0D12"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#F1F5F9"; e.currentTarget.style.color = "#64748B"; }}
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {/* Type Selector Tabs */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
            {[
              { type: "job", title: "💼 Career / Jobs", subtitle: "Industry Roles" },
              { type: "research", title: "🔬 Research Track", subtitle: "Scientific Domains" },
              { type: "academic", title: "🎓 Academic Track", subtitle: "Syllabus Levels" }
            ].map(t => {
              const isSelected = selectedType === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => {
                    setSelectedType(t.type);
                    if (t.type === "job") setSelectedTargetId(JOB_ROLES[0].id);
                    else if (t.type === "research") setSelectedTargetId(RESEARCH_DOMAINS[0].id);
                    else setSelectedTargetId(ACADEMIC_LEVELS[0].id);
                  }}
                  style={{
                    padding: "12px 14px",
                    borderRadius: "12px",
                    backgroundColor: isSelected ? "#EFF6FB" : "#FFFFFF",
                    border: isSelected ? "2px solid #3A68A4" : "1px solid #CBD5E1",
                    color: "#0C0D12",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: isSelected ? "0 2px 8px rgba(58, 104, 164, 0.15)" : "none",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: "0.9rem", color: isSelected ? "#3A68A4" : "#0C0D12" }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#64748B", marginTop: "2px" }}>
                    {t.subtitle}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Options List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {selectedType === "job" && JOB_ROLES.map(role => {
              const isSelected = selectedTargetId === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedTargetId(role.id)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    backgroundColor: isSelected ? "#EFF6FB" : "#FFFFFF",
                    border: isSelected ? "2px solid #3A68A4" : "1px solid #E2E8F0",
                    boxShadow: isSelected ? "0 2px 8px rgba(58, 104, 164, 0.12)" : "0 1px 3px rgba(0,0,0,0.02)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "0.9375rem", color: isSelected ? "#2C3F60" : "#0C0D12" }}>
                      <span style={{ fontSize: "1.1rem" }}>{role.icon}</span>
                      <span>{role.title}</span>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#3A68A4", backgroundColor: "#DCEBF7", padding: "2px 8px", borderRadius: "999px" }}>
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p style={{ color: "#475569", fontSize: "0.825rem", margin: "4px 0 0 0", lineHeight: 1.45 }}>
                    {role.description}
                  </p>
                </div>
              );
            })}

            {selectedType === "research" && RESEARCH_DOMAINS.map(domain => {
              const isSelected = selectedTargetId === domain.id;
              return (
                <div
                  key={domain.id}
                  onClick={() => setSelectedTargetId(domain.id)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    backgroundColor: isSelected ? "#FFF8F2" : "#FFFFFF",
                    border: isSelected ? "2px solid #A77B5A" : "1px solid #E2E8F0",
                    boxShadow: isSelected ? "0 2px 8px rgba(167, 123, 90, 0.12)" : "0 1px 3px rgba(0,0,0,0.02)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "0.9375rem", color: isSelected ? "#A77B5A" : "#0C0D12" }}>
                      <span style={{ fontSize: "1.1rem" }}>{domain.icon}</span>
                      <span>{domain.title}</span>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#A77B5A", backgroundColor: "#FCE8DC", padding: "2px 8px", borderRadius: "999px" }}>
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p style={{ color: "#475569", fontSize: "0.825rem", margin: "4px 0 0 0", lineHeight: 1.45 }}>
                    {domain.description}
                  </p>
                </div>
              );
            })}

            {selectedType === "academic" && ACADEMIC_LEVELS.map(level => {
              const isSelected = selectedTargetId === level.id;
              return (
                <div
                  key={level.id}
                  onClick={() => setSelectedTargetId(level.id)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: "12px",
                    backgroundColor: isSelected ? "#F0FDF4" : "#FFFFFF",
                    border: isSelected ? "2px solid #16A34A" : "1px solid #E2E8F0",
                    boxShadow: isSelected ? "0 2px 8px rgba(22, 163, 74, 0.12)" : "0 1px 3px rgba(0,0,0,0.02)",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 800, fontSize: "0.9375rem", color: isSelected ? "#15803D" : "#0C0D12" }}>
                      <span style={{ fontSize: "1.1rem" }}>{level.icon}</span>
                      <span>{level.title}</span>
                    </div>
                    {isSelected && (
                      <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#16A34A", backgroundColor: "#DCFCE7", padding: "2px 8px", borderRadius: "999px" }}>
                        SELECTED
                      </span>
                    )}
                  </div>
                  <p style={{ color: "#475569", fontSize: "0.825rem", margin: "4px 0 0 0", lineHeight: 1.45 }}>
                    {level.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fixed Bottom Action Bar */}
        <div style={{
          padding: "16px 28px",
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#F8FAFC",
          flexShrink: 0,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ fontSize: "0.8125rem", color: "#64748B" }}>
            Target: <strong style={{ color: "#0F172A" }}>{selectedTargetId}</strong>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 18px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "10px",
                color: "#475569",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: "9px 24px",
                background: "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)",
                border: "none",
                borderRadius: "10px",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.875rem",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(44, 63, 96, 0.3)",
                transition: "all 0.15s ease"
              }}
            >
              Apply &amp; Recalculate Roadmap ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

