import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { platformApi } from "../../../services/platformApi";

export default function LearnerChallengeView() {
  const { courseId, challengeId } = useParams();

  const [course, setCourse] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await platformApi.getCourse(courseId);
        setCourse(c);
        const ch = c.challenges?.find(item => item.id === challengeId);
        if (ch) {
          setChallenge(ch);
          setCode(ch.starter_code || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, challengeId]);

  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput("Executing script in Python runtime...");
    try {
      const res = await platformApi.executeCode(code, challengeId);
      setOutput(res.output || (res.success ? "Execution completed with 0 errors." : res.error));
    } catch (err) {
      setOutput("Execution request failed: " + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading || !challenge) {
    return <div style={{ padding: "4rem", textAlign: "center", color: "#64748B" }}>Loading Challenge Lab...</div>;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to={`/learner/course/${courseId}`} style={{ color: "#64748B", textDecoration: "none", fontSize: "0.875rem" }}>
          &larr; Back to Course Player
        </Link>
        <div style={{ display: "flex", gap: "8px" }}>
          <span className="pf-badge pf-badge-primary">{challenge.difficulty}</span>
          <span className="pf-badge pf-badge-success">+{challenge.xp_reward} XP Reward</span>
        </div>
      </div>

      <div className="pf-card" style={{ marginBottom: "1.5rem" }}>
        <h1 className="pf-heading-lg" style={{ marginBottom: "0.5rem" }}>⚡ {challenge.title}</h1>
        <p className="pf-subtext" style={{ fontSize: "0.9375rem" }}>{challenge.description}</p>

        {challenge.hints?.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <button
              onClick={() => setShowHint(!showHint)}
              className="pf-btn pf-btn-secondary pf-btn-sm"
            >
              💡 {showHint ? "Hide Hint" : "Need a Hint?"}
            </button>
            {showHint && (
              <div style={{ marginTop: "0.5rem", background: "#FFFBEB", border: "1px solid #FDE68A", padding: "0.75rem 1rem", borderRadius: "8px", fontSize: "0.8125rem", color: "#92400E" }}>
                {challenge.hints[0]}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Code Editor and Output Split */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "1.5rem" }}>
        {/* Editor Box */}
        <div className="pf-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0F172A" }}>Python Solution Editor</span>
            <button
              onClick={handleRunCode}
              disabled={isExecuting}
              className="pf-btn pf-btn-success pf-btn-sm"
            >
              {isExecuting ? "Running..." : "▶️ Execute Code"}
            </button>
          </div>

          <textarea
            className="pf-code-editor"
            rows={18}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck="false"
          />
        </div>

        {/* Output Console */}
        <div className="pf-card" style={{ display: "flex", flexDirection: "column", background: "#0F172A", color: "#F8FAFC", border: "1px solid #1E293B" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", borderBottom: "1px solid #334155", paddingBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#94A3B8" }}>Terminal Stdout Console</span>
            <button
              onClick={() => setOutput("")}
              style={{ background: "none", border: "none", color: "#64748B", fontSize: "0.75rem", cursor: "pointer" }}
            >
              Clear
            </button>
          </div>

          <pre style={{ flex: 1, fontFamily: "monospace", fontSize: "0.8125rem", whiteSpace: "pre-wrap", overflowY: "auto", margin: 0, color: output.includes("Error") ? "#F87171" : "#34D399" }}>
            {output || "Output will appear here after clicking 'Execute Code'..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
