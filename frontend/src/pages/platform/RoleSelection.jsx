import React from "react";
import { useNavigate } from "react-router-dom";
import QuantumAtmosphereBackground from "../../components/ui/QuantumAtmosphereBackground";
import "./platform.css";

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div
      className="pf-container pf-landing-hero"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        position: "relative",
        zIndex: 1,
        fontFamily: "Inter, system-ui, sans-serif",
        boxSizing: "border-box"
      }}
    >
      <QuantumAtmosphereBackground theme="light" role="trainer" />

      <div style={{ maxWidth: "860px", width: "100%", textAlign: "center", margin: "0 auto", position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* Quantum Brand Pill */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          background: "rgba(255, 255, 255, 0.95)",
          border: "1px solid #BAE6FD",
          padding: "6px 20px",
          borderRadius: "9999px",
          marginBottom: "1.25rem",
          boxShadow: "0 2px 10px rgba(14, 165, 233, 0.12)"
        }}>
          <span style={{ fontSize: "1rem" }}>⚛️</span>
          <span style={{ fontSize: "0.8125rem", fontWeight: "800", color: "#0284C7", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Quantum Mastery Intelligence Engine
          </span>
        </div>

        {/* Hero Title & Subtitle */}
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            marginBottom: "0.875rem",
            letterSpacing: "-0.03em",
            color: "#0F172A",
            lineHeight: 1.2,
            maxWidth: "760px"
          }}
        >
          Interactive Quantum Algorithm &amp; Education Platform
        </h1>

        <p
          style={{
            fontSize: "1rem",
            maxWidth: "640px",
            margin: "0 auto 2.5rem auto",
            lineHeight: "1.6",
            color: "#475569",
            fontWeight: 500
          }}
        >
          Select your portal to continue. Design and supervise structured quantum curricula, or explore personalized challenge tracks, live simulations, and persistent AI guidance.
        </p>

        {/* Dual Portal Entry Cards Grid - Centered 2-column layout */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "1.75rem",
          width: "100%",
          maxWidth: "820px",
          margin: "0 auto 2.5rem auto",
          boxSizing: "border-box"
        }}>
          {/* Trainer Portal Card */}
          <div
            id="role-trainer-card"
            onClick={() => navigate("/auth/trainer")}
            style={{
              padding: "2.25rem 2rem",
              borderRadius: "22px",
              border: "1.5px solid #F4C6AF",
              boxShadow: "0 20px 40px -10px rgba(167, 123, 90, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              cursor: "pointer",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(16px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign: "center",
              boxSizing: "border-box"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.borderColor = "#A77B5A";
              e.currentTarget.style.boxShadow = "0 25px 50px -10px rgba(167, 123, 90, 0.25), 0 8px 20px rgba(0, 0, 0, 0.06)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#F4C6AF";
              e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(167, 123, 90, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)";
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #FFF8F2 0%, #FFFDF0 100%)",
                  border: "1px solid #F4C6AF",
                  width: "64px",
                  height: "64px",
                  borderRadius: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.875rem",
                  marginBottom: "1rem",
                  boxShadow: "0 4px 12px rgba(167, 123, 90, 0.15)"
                }}
              >
                👨‍🏫
              </div>

              <span
                style={{
                  marginBottom: "0.75rem",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#A77B5A",
                  backgroundColor: "#FFF8F2",
                  border: "1px solid #F4C6AF",
                  padding: "4px 14px",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em"
                }}
              >
                INSTRUCTOR SUITE
              </span>

              <h2 style={{ fontSize: "1.45rem", fontWeight: 900, marginBottom: "0.625rem", color: "#0F172A" }}>
                Trainer Portal
              </h2>

              <p style={{ fontSize: "0.875rem", minHeight: "56px", lineHeight: "1.55", marginBottom: "1.5rem", color: "#64748B" }}>
                Author structured video lectures, theory notes, interactive circuit challenges, graded assessments, and oversee learner progress.
              </p>
            </div>

            <button
              style={{
                width: "100%",
                padding: "0.875rem",
                fontSize: "0.9375rem",
                fontWeight: 800,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #A77B5A 0%, #8C6243 100%)",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(167, 123, 90, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <span>Enter as Trainer</span>
              <span>➔</span>
            </button>
          </div>

          {/* Student Portal Card */}
          <div
            id="role-learner-card"
            onClick={() => navigate("/auth/learner")}
            style={{
              padding: "2.25rem 2rem",
              borderRadius: "22px",
              border: "1.5px solid #BAE6FD",
              boxShadow: "0 20px 40px -10px rgba(14, 165, 233, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)",
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
              cursor: "pointer",
              backgroundColor: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(16px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              textAlign: "center",
              boxSizing: "border-box"
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.borderColor = "#0284C7";
              e.currentTarget.style.boxShadow = "0 25px 50px -10px rgba(14, 165, 233, 0.25), 0 8px 20px rgba(0, 0, 0, 0.06)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#BAE6FD";
              e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(14, 165, 233, 0.12), 0 4px 12px rgba(0, 0, 0, 0.04)";
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
              <div
                style={{
                  background: "linear-gradient(135deg, #EFF6FB 0%, #F0FDF4 100%)",
                  border: "1px solid #BAE6FD",
                  width: "64px",
                  height: "64px",
                  borderRadius: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.875rem",
                  marginBottom: "1rem",
                  boxShadow: "0 4px 12px rgba(2, 132, 199, 0.15)"
                }}
              >
                👨‍🎓
              </div>

              <span
                style={{
                  marginBottom: "0.75rem",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  color: "#0284C7",
                  backgroundColor: "#EFF6FB",
                  border: "1px solid #AFD8F4",
                  padding: "4px 14px",
                  borderRadius: "9999px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em"
                }}
              >
                STUDENT WORKSPACE
              </span>

              <h2 style={{ fontSize: "1.45rem", fontWeight: 900, marginBottom: "0.625rem", color: "#0F172A" }}>
                Student / Learner
              </h2>

              <p style={{ fontSize: "0.875rem", minHeight: "56px", lineHeight: "1.55", marginBottom: "1.5rem", color: "#64748B" }}>
                Experience backward learning missions, run multi-backend quantum simulations, solve coding challenges, and gain real mastery.
              </p>
            </div>

            <button
              style={{
                width: "100%",
                padding: "0.875rem",
                fontSize: "0.9375rem",
                fontWeight: 800,
                borderRadius: "12px",
                background: "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
                border: "none",
                color: "#FFFFFF",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(2, 132, 199, 0.35)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <span>Enter as Student</span>
              <span>➔</span>
            </button>
          </div>
        </div>

        {/* Minimal Footer Info */}
        <div style={{ color: "#64748B", fontSize: "0.8125rem", fontWeight: "600", display: "flex", justifyContent: "center", alignItems: "center", gap: "1.25rem", flexWrap: "wrap" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>🔒 Role-Based Access Control</span>
          <span>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>⚡ Multi-Engine Quantum Simulator</span>
          <span>•</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>🤖 AI Socratic &amp; Diagnostic Tutor</span>
        </div>
      </div>
    </div>
  );
}

