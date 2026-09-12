import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { platformAuth } from "../../services/platformAuth";
import QuantumAtmosphereBackground from "../../components/ui/QuantumAtmosphereBackground";
import "./platform.css";

export default function AuthPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const currentRole = role === "trainer" ? "trainer" : "learner";
  const isTrainer = currentRole === "trainer";

  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "register") {
        await platformAuth.register({
          name,
          email,
          password,
          role: currentRole,
          phone: phone || undefined,
          avatar: avatar || undefined
        });
      } else {
        await platformAuth.login(email, password, currentRole);
      }

      // Redirect to respective dashboard
      if (isTrainer) {
        navigate("/trainer/dashboard");
      } else {
        navigate("/learner/dashboard");
      }
    } catch (err) {
      setError(err.message || "An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError("");
    try {
      if (isTrainer) {
        await platformAuth.login("trainer@platform.edu", "trainer123", "trainer");
        navigate("/trainer/dashboard");
      } else {
        await platformAuth.login("student@platform.edu", "student123", "learner");
        navigate("/learner/dashboard");
      }
    } catch (err) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

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
      <QuantumAtmosphereBackground theme="light" role={isTrainer ? "trainer" : "learner"} />

      <div style={{ maxWidth: "480px", width: "100%", margin: "0 auto", position: "relative", zIndex: 2, boxSizing: "border-box" }}>
        
        {/* Navigation back and role badge */}
        <div style={{
          marginBottom: "1.25rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 4px"
        }}>
          <Link
            to="/"
            style={{
              color: "#64748B",
              textDecoration: "none",
              fontSize: "0.875rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              transition: "color 0.15s ease"
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#0284C7"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748B"}
          >
            &larr; Switch Role
          </Link>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: 800,
            padding: "4px 14px",
            borderRadius: "9999px",
            backgroundColor: isTrainer ? "#FFF8F2" : "#EFF6FB",
            border: `1px solid ${isTrainer ? "#F4C6AF" : "#AFD8F4"}`,
            color: isTrainer ? "#A77B5A" : "#0284C7",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            letterSpacing: "0.04em",
            boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
          }}>
            {isTrainer ? "👨‍🏫 Trainer Portal" : "👨‍🎓 Student Portal"}
          </span>
        </div>

        {/* Auth Card with Light Quantum Glassmorphism */}
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(16px)",
          border: `1.5px solid ${isTrainer ? "#F4C6AF" : "#BAE6FD"}`,
          borderRadius: "22px",
          padding: "2.4rem 2.2rem",
          boxShadow: isTrainer
            ? "0 25px 50px -12px rgba(167, 123, 90, 0.15), 0 4px 12px rgba(0, 0, 0, 0.04)"
            : "0 25px 50px -12px rgba(14, 165, 233, 0.15), 0 4px 12px rgba(0, 0, 0, 0.04)"
        }}>
          
          <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
            <h1 style={{ fontSize: "1.65rem", fontWeight: 900, marginBottom: "0.35rem", color: "#0F172A", letterSpacing: "-0.02em" }}>
              {mode === "login"
                ? `Sign In as ${isTrainer ? "Trainer" : "Student"}`
                : `Create ${isTrainer ? "Trainer" : "Student"} Account`}
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#64748B", margin: 0 }}>
              {mode === "login"
                ? "Enter your credentials to access your quantum workspace"
                : "Fill in the details below to initialize your quantum profile"}
            </p>
          </div>

          {/* Symmetrical Mode Switcher Tabs */}
          <div style={{
            display: "flex",
            backgroundColor: "#F1F5F9",
            border: "1px solid #E2E8F0",
            padding: "4px",
            borderRadius: "12px",
            marginBottom: "1.75rem"
          }}>
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              style={{
                flex: 1,
                padding: "9px",
                border: "none",
                borderRadius: "9px",
                background: mode === "login" ? (isTrainer ? "linear-gradient(135deg, #A77B5A, #8C6243)" : "linear-gradient(135deg, #0284C7, #2563EB)") : "transparent",
                color: mode === "login" ? "#FFFFFF" : "#64748B",
                fontWeight: mode === "login" ? "800" : "600",
                fontSize: "0.875rem",
                cursor: "pointer",
                boxShadow: mode === "login" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              style={{
                flex: 1,
                padding: "9px",
                border: "none",
                borderRadius: "9px",
                background: mode === "register" ? (isTrainer ? "linear-gradient(135deg, #A77B5A, #8C6243)" : "linear-gradient(135deg, #0284C7, #2563EB)") : "transparent",
                color: mode === "register" ? "#FFFFFF" : "#64748B",
                fontWeight: mode === "register" ? "800" : "600",
                fontSize: "0.875rem",
                cursor: "pointer",
                boxShadow: mode === "register" ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
                transition: "all 0.15s ease"
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div style={{
              background: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              fontSize: "0.875rem",
              marginBottom: "1.25rem",
              textAlign: "center",
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            {mode === "register" && (
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder={isTrainer ? "e.g. Prof. Sarah Jenkins" : "e.g. Alex Rivera"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "10px",
                    color: "#0F172A",
                    fontSize: "0.875rem",
                    outline: "none"
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Email Address *
              </label>
              <input
                type="email"
                placeholder={isTrainer ? "trainer@platform.edu" : "student@platform.edu"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "10px",
                  color: "#0F172A",
                  fontSize: "0.875rem",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                Password *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "10px",
                  color: "#0F172A",
                  fontSize: "0.875rem",
                  outline: "none"
                }}
              />
            </div>

            {mode === "register" && (
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: "10px",
                    color: "#0F172A",
                    fontSize: "0.875rem",
                    outline: "none"
                  }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.875rem",
                borderRadius: "12px",
                border: "none",
                background: isTrainer ? "linear-gradient(135deg, #A77B5A 0%, #8C6243 100%)" : "linear-gradient(135deg, #0284C7 0%, #2563EB 100%)",
                color: "#FFFFFF",
                fontSize: "0.95rem",
                fontWeight: 800,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: isTrainer ? "0 4px 16px rgba(167, 123, 90, 0.35)" : "0 4px 16px rgba(2, 132, 199, 0.35)",
                marginTop: "0.5rem"
              }}
            >
              {loading
                ? "Authenticating..."
                : mode === "login"
                ? `Sign In to ${isTrainer ? "Faculty Studio" : "Student Portal"}`
                : `Create ${isTrainer ? "Faculty" : "Student"} Account`}
            </button>
          </form>

          {/* Quick Demo Access Trigger */}
          <div style={{ marginTop: "1.5rem", borderTop: "1px solid #E2E8F0", paddingTop: "1.25rem", textAlign: "center" }}>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              style={{
                background: "#F8FAFC",
                border: "1px solid #CBD5E1",
                color: "#334155",
                fontSize: "0.82rem",
                fontWeight: 700,
                padding: "8px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              ⚡ 1-Click Demo Login ({isTrainer ? "Prof. Sarah" : "Student Alex"})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
