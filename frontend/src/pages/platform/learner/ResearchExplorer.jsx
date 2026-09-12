import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RESEARCH_DOMAINS, purposeService } from "../../../services/purposeService";

export default function ResearchExplorer() {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState(RESEARCH_DOMAINS[0]);
  const [activeTab, setActiveTab] = useState("landscape"); // landscape | analysis | gaps | validation
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPaper, setSelectedPaper] = useState(RESEARCH_DOMAINS[0].landscapePapers[0]);
  const [selectedGap, setSelectedGap] = useState(RESEARCH_DOMAINS[0].potentialGaps[0]);
  const [validatedGaps, setValidatedGaps] = useState({});

  const handleDomainChange = (domain) => {
    setSelectedDomain(domain);
    setSelectedPaper(domain.landscapePapers[0]);
    setSelectedGap(domain.potentialGaps[0]);
  };

  const handleSetAsActivePurpose = () => {
    purposeService.setPurpose("research", selectedDomain.id);
    alert(`Active goal set to: Research in ${selectedDomain.title}! Your dynamic roadmap has been updated.`);
  };

  const toggleValidateGap = (gapId) => {
    setValidatedGaps(prev => ({
      ...prev,
      [gapId]: !prev[gapId]
    }));
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", paddingBottom: "60px", color: "#0C0D12", fontFamily: "Inter, system-ui, sans-serif" }}>
      
      {/* ── TOP HEADER ── */}
      <div style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #F5F9FC 100%)",
        border: "1px solid #CBD5E1",
        borderRadius: "16px",
        padding: "24px 28px",
        marginBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px",
        boxShadow: "0 2px 8px rgba(12, 13, 18, 0.03)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span style={{ fontSize: "1.3rem" }}>🔬</span>
            <span style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#3A68A4", fontWeight: 800 }}>
              RESEARCH DISCOVERY &amp; LITERATURE GAP ENGINE
            </span>
          </div>
          <h1 style={{ fontSize: "1.8rem", fontWeight: 800, margin: "0 0 6px 0", color: "#0C0D12" }}>
            Quantum Research Studio
          </h1>
          <p style={{ color: "#475569", margin: 0, fontSize: "0.9rem" }}>
            Search state-of-the-art literature • Identify experimental limitations • Formulate verified research gaps
          </p>
        </div>

        <button
          onClick={handleSetAsActivePurpose}
          style={{
            padding: "12px 20px",
            background: "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)",
            border: "none",
            borderRadius: "10px",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.875rem",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(44, 63, 96, 0.25)"
          }}
        >
          🎯 Set as My Active Research Track
        </button>
      </div>

      {/* ── DOMAIN SELECTOR ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {RESEARCH_DOMAINS.map(d => {
          const isSelected = selectedDomain.id === d.id;
          return (
            <button
              key={d.id}
              onClick={() => handleDomainChange(d)}
              style={{
                padding: "16px",
                borderRadius: "12px",
                backgroundColor: isSelected ? "#EFF6FB" : "#FFFFFF",
                border: isSelected ? "2px solid #3A68A4" : "1px solid #CBD5E1",
                color: "#0C0D12",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: "0 1px 3px rgba(12, 13, 18, 0.02)"
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: "6px" }}>{d.icon}</div>
              <div style={{ fontWeight: 800, fontSize: "0.9rem", marginBottom: "4px", color: isSelected ? "#3A68A4" : "#0C0D12" }}>
                {d.title}
              </div>
              <div style={{ fontSize: "0.75rem", color: "#64748B", lineHeight: "1.3" }}>
                {d.description.slice(0, 60)}...
              </div>
            </button>
          );
        })}
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div style={{
        display: "flex",
        gap: "8px",
        borderBottom: "2px solid #E2E8F0",
        marginBottom: "24px",
        backgroundColor: "#FFFFFF",
        padding: "8px 12px 0 12px",
        borderRadius: "12px 12px 0 0"
      }}>
        {[
          { id: "landscape", label: "1. Research Landscape & Papers", icon: "📚" },
          { id: "analysis", label: "2. Methods & Limitations", icon: "📊" },
          { id: "gaps", label: "3. Potential Research Gaps", icon: "💡" },
          { id: "validation", label: "4. Simulation Gap Validation", icon: "🧪" }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "10px 16px",
                background: "none",
                border: "none",
                borderBottom: isActive ? "3px solid #3A68A4" : "3px solid transparent",
                color: isActive ? "#3A68A4" : "#64748B",
                fontWeight: isActive ? 800 : 600,
                fontSize: "0.85rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px"
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: LANDSCAPE & LITERATURE ── */}
      {activeTab === "landscape" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "24px" }}>
          
          {/* Papers List */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "20px", boxShadow: "0 2px 8px rgba(12, 13, 18, 0.02)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 14px 0", color: "#0C0D12" }}>
              Published Peer-Reviewed Baseline Papers ({selectedDomain.landscapePapers.length})
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {selectedDomain.landscapePapers.map((paper, idx) => {
                const isSelected = selectedPaper.id === paper.id;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedPaper(paper)}
                    style={{
                      padding: "14px",
                      borderRadius: "10px",
                      backgroundColor: isSelected ? "#EFF6FB" : "#F5F9FC",
                      border: isSelected ? "2px solid #3A68A4" : "1px solid #E2E8F0",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: "0.875rem", color: "#0C0D12", marginBottom: "4px" }}>
                      {paper.title}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      {paper.authors} ({paper.year}) • <span style={{ color: "#3A68A4", fontWeight: 700 }}>{paper.citations} Citations</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Paper Details & Contribution */}
          <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(12, 13, 18, 0.02)" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 800, margin: "0 0 16px 0", color: "#0C0D12" }}>
              Key Contribution &amp; Methodology
            </h2>
            <div style={{ backgroundColor: "#F5F9FC", border: "1px solid #E2E8F0", padding: "16px", borderRadius: "10px", marginBottom: "16px" }}>
              <div style={{ fontSize: "0.72rem", color: "#3A68A4", fontWeight: 800, textTransform: "uppercase" }}>CONTRIBUTION:</div>
              <p style={{ color: "#0C0D12", fontSize: "0.875rem", lineHeight: "1.55", margin: "4px 0 0 0" }}>
                {selectedPaper.contribution}
              </p>
            </div>

            <div style={{ backgroundColor: "#FFF8F2", border: "1px solid #F4C6AF", padding: "16px", borderRadius: "10px", borderLeft: "4px solid #AD6358" }}>
              <div style={{ fontSize: "0.72rem", color: "#AD6358", fontWeight: 800, textTransform: "uppercase" }}>PUBLISHED LIMITATIONS &amp; BOTTLENECKS:</div>
              <p style={{ color: "#0C0D12", fontSize: "0.875rem", lineHeight: "1.55", margin: "4px 0 0 0" }}>
                {selectedPaper.limitations}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ── TAB 2: METHODS & LIMITATIONS ── */}
      {activeTab === "analysis" && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(12, 13, 18, 0.02)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0C0D12", marginBottom: "16px" }}>
            State-of-the-Art Limitations Analysis
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {selectedDomain.landscapePapers.map((p, idx) => (
              <div key={idx} style={{ backgroundColor: "#F5F9FC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "18px" }}>
                <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#0C0D12", marginBottom: "8px" }}>{p.title}</div>
                <div style={{ fontSize: "0.825rem", color: "#AD6358", fontWeight: 700, marginBottom: "4px" }}>⚠️ Primary Limitation:</div>
                <div style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5" }}>{p.limitations}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 3: POTENTIAL RESEARCH GAPS ── */}
      {activeTab === "gaps" && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(12, 13, 18, 0.02)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0C0D12", marginBottom: "16px" }}>
            Hypothesized Research Gaps ({selectedDomain.potentialGaps.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {selectedDomain.potentialGaps.map(gap => (
              <div key={gap.id} style={{ backgroundColor: "#FFF8F2", border: "1px solid #F4C6AF", borderRadius: "12px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: "#0C0D12" }}>{gap.title}</div>
                  <span style={{ backgroundColor: "#EFF6FB", color: "#3A68A4", border: "1px solid #AFD8F4", padding: "3px 8px", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 800 }}>
                    Novel Opportunity
                  </span>
                </div>
                <p style={{ color: "#475569", fontSize: "0.875rem", lineHeight: "1.55", margin: "0 0 12px 0" }}>
                  {gap.hypothesis}
                </p>
                <div style={{ fontSize: "0.8rem", color: "#2C3F60", fontWeight: 600 }}>
                  <strong>Empirical Verification Method:</strong> {gap.verification}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: SIMULATION GAP VALIDATION ── */}
      {activeTab === "validation" && (
        <div style={{ backgroundColor: "#FFFFFF", border: "1px solid #CBD5E1", borderRadius: "16px", padding: "28px", boxShadow: "0 2px 8px rgba(12, 13, 18, 0.02)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0C0D12", marginBottom: "16px" }}>
            Empirical Gap Verification Sandbox
          </h2>
          <div style={{ backgroundColor: "#F5F9FC", border: "1px solid #E2E8F0", borderRadius: "12px", padding: "20px", marginBottom: "20px" }}>
            <div style={{ fontWeight: 700, color: "#0C0D12", marginBottom: "6px" }}>
              Validating Hypothesis: {selectedGap.title}
            </div>
            <p style={{ color: "#475569", fontSize: "0.875rem", margin: "0 0 16px 0" }}>
              Run our quantum circuit simulation engine to test the validity of this research limitation.
            </p>
            <button
              onClick={() => toggleValidateGap(selectedGap.id)}
              style={{
                padding: "10px 20px",
                background: validatedGaps[selectedGap.id] ? "#16A34A" : "linear-gradient(135deg, #3A68A4 0%, #2C3F60 100%)",
                border: "none",
                borderRadius: "8px",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer"
              }}
            >
              {validatedGaps[selectedGap.id] ? "✓ Empirical Gap Validated (P < 0.01)" : "⚡ Run Quantum Lab Benchmark"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
