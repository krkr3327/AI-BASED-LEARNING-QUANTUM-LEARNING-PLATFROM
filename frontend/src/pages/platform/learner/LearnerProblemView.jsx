import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { platformApi } from "../../../services/platformApi";

export default function LearnerProblemView() {
  const { courseId, problemId } = useParams();

  const [course, setCourse] = useState(null);
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await platformApi.getCourse(courseId);
        setCourse(c);
        const pb = c.problems?.find(item => item.id === problemId);
        if (pb) {
          setProblem(pb);
          setCode(pb.starter_code || "");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId, problemId]);

  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput("Executing algorithm verification...");
    try {
      const res = await platformApi.executeCode(code, null, problemId);
      setOutput(res.output || (res.success ? "Passed successfully." : res.error));
    } catch (err) {
      setOutput("Execution error: " + err.message);
    } finally {
      setIsExecuting(false);
    }
  };

  if (loading || !problem) {
    return <div style={{ padding: "4rem", textAlign: "center", color: "#64748B" }}>Loading Problem Lab...</div>;
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link to={`/learner/course/${courseId}`} style={{ color: "#64748B", textDecoration: "none", fontSize: "0.875rem" }}>
          &larr; Back to Course Player
        </Link>
        <span className="pf-badge pf-badge-secondary">{problem.difficulty}</span>
      </div>

      <div className="pf-card" style={{ marginBottom: "1.5rem" }}>
        <h1 className="pf-heading-lg" style={{ marginBottom: "0.5rem" }}>🧩 {problem.title}</h1>
        <p className="pf-subtext" style={{ fontSize: "0.9375rem" }}>{problem.description}</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: "1.5rem" }}>
        {/* Editor */}
        <div className="pf-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.875rem", fontWeight: "700", color: "#0F172A" }}>Algorithm Solution</span>
            <button
              onClick={handleRunCode}
              disabled={isExecuting}
              className="pf-btn pf-btn-primary pf-btn-sm"
            >
              {isExecuting ? "Testing..." : "▶️ Test Solution"}
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
            <span style={{ fontSize: "0.8125rem", fontWeight: "700", color: "#94A3B8" }}>Execution Logs</span>
            <button
              onClick={() => setOutput("")}
              style={{ background: "none", border: "none", color: "#64748B", fontSize: "0.75rem", cursor: "pointer" }}
            >
              Clear
            </button>
          </div>

          <pre style={{ flex: 1, fontFamily: "monospace", fontSize: "0.8125rem", whiteSpace: "pre-wrap", overflowY: "auto", margin: 0, color: output.includes("Error") ? "#F87171" : "#34D399" }}>
            {output || "Output will appear here..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
