import React, { useState } from 'react';
import CertificateModal from './CertificateModal';

/**
 * MasteryRadarChart
 * Interactive 6-axis SVG Radar Chart calculating competency across:
 * 1. Linear Algebra & Foundations
 * 2. Circuit Synthesis & Unitaries
 * 3. Algorithm Machinery (Shor/Grover/QFT)
 * 4. NISQ & Variational (VQE/QAOA/QML)
 * 5. Error Correction & Noise (QEC)
 * 6. Cryogenics & Hardware Physics
 */
export default function MasteryRadarChart({ progress, mastery }) {
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [hoveredAxis, setHoveredAxis] = useState(null);

  const completedCount = progress?.completed_lessons?.length || 0;
  const totalLessons = 60; // Approximate total across 20 modules
  const completionRatio = Math.min(1.0, completedCount / totalLessons);

  // Compute 6-axis competencies (0 to 100)
  const baseScore = Math.min(100, Math.round(completionRatio * 85) + 15);

  const axes = [
    { key: 'linalg', label: 'Linear Algebra', value: Math.min(100, baseScore + 10), desc: 'Hilbert spaces, Dirac notation, eigenvalues, unitary matrices' },
    { key: 'circuits', label: 'Circuit Synthesis', value: Math.min(100, baseScore + 5), desc: 'Multi-qubit entanglement, universal gate sets, transpilation' },
    { key: 'algorithms', label: 'Algorithms & QFT', value: Math.min(100, baseScore - 5), desc: 'Shor, Grover, Quantum Phase Estimation, Amplitude Amplification' },
    { key: 'nisq', label: 'NISQ & QML', value: Math.min(100, baseScore - 8), desc: 'VQE, QAOA, Parameter-Shift Rule, Quantum Kernels (QSVM)' },
    { key: 'qec', label: 'Error Correction', value: Math.min(100, baseScore - 12), desc: 'Surface code, stabilizer formalism, syndrome measurement' },
    { key: 'hardware', label: 'Cryo & Hardware', value: Math.min(100, baseScore + 2), desc: 'Transmon qubits, dilution refrigeration, microwave DRAG pulses' }
  ];

  const overallAverage = Math.round(axes.reduce((sum, a) => sum + a.value, 0) / axes.length);

  // Radar geometry calculations
  const size = 300;
  const center = size / 2;
  const radius = 105;
  const angleStep = (Math.PI * 2) / axes.length;

  // Grid concentric circles/polygons
  const levels = [0.25, 0.5, 0.75, 1.0];

  const getCoordinates = (valueRatio, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius * valueRatio;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  // Polygon points for learner score
  const polygonPoints = axes.map((axis, i) => {
    const coords = getCoordinates(axis.value / 100, i);
    return `${coords.x},${coords.y}`;
  }).join(' ');

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '10px',
      border: '1px solid var(--border-subtle)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <CertificateModal
        isOpen={isCertOpen}
        onClose={() => setIsCertOpen(false)}
        learnerName="Quantum Scholar"
        masteryScore={overallAverage}
        completedCount={completedCount}
      />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            COMPETENCY DIAGNOSTICS
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 800 }}>
            Quantum Mastery Radar & Skill Matrix
          </h3>
        </div>

        <button
          onClick={() => setIsCertOpen(true)}
          style={{
            padding: '8px 16px',
            fontSize: '0.8rem',
            fontWeight: 700,
            backgroundColor: '#FEF3C7',
            color: '#92400E',
            border: '1px solid #FDE68A',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          🏆 VIEW & DOWNLOAD CERTIFICATE
        </button>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
        
        {/* Radar SVG */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Background Grid Rings */}
            {levels.map((lvl, lIdx) => {
              const ringPoints = axes.map((_, i) => {
                const c = getCoordinates(lvl, i);
                return `${c.x},${c.y}`;
              }).join(' ');
              return (
                <polygon
                  key={lIdx}
                  points={ringPoints}
                  fill={lIdx === levels.length - 1 ? '#F8FAFC' : 'none'}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                />
              );
            })}

            {/* Axis Radial Lines */}
            {axes.map((_, i) => {
              const outer = getCoordinates(1.0, i);
              return (
                <line
                  key={i}
                  x1={center}
                  y1={center}
                  x2={outer.x}
                  y2={outer.y}
                  stroke="#CBD5E1"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                />
              );
            })}

            {/* Competency Area Polygon */}
            <polygon
              points={polygonPoints}
              fill="rgba(37, 99, 235, 0.22)"
              stroke="var(--accent-primary)"
              strokeWidth="2.5"
            />

            {/* Competency Point Dots */}
            {axes.map((axis, i) => {
              const coords = getCoordinates(axis.value / 100, i);
              const isHovered = hoveredAxis === axis.key;
              return (
                <circle
                  key={i}
                  cx={coords.x}
                  cy={coords.y}
                  r={isHovered ? 6 : 4.5}
                  fill={isHovered ? '#0284C7' : '#2563EB'}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onMouseEnter={() => setHoveredAxis(axis.key)}
                  onMouseLeave={() => setHoveredAxis(null)}
                />
              );
            })}

            {/* Labels */}
            {axes.map((axis, i) => {
              const labelCoords = getCoordinates(1.22, i);
              const isHovered = hoveredAxis === axis.key;
              return (
                <text
                  key={i}
                  x={labelCoords.x}
                  y={labelCoords.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="10"
                  fontWeight={isHovered ? '800' : '600'}
                  fill={isHovered ? 'var(--accent-primary)' : 'var(--text-secondary)'}
                  fontFamily="system-ui, sans-serif"
                >
                  {axis.label}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Competency Progress Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>COMPETENCY DOMAIN</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
              OVERALL: {overallAverage}%
            </span>
          </div>

          {axes.map((axis) => {
            const isHovered = hoveredAxis === axis.key;
            return (
              <div
                key={axis.key}
                onMouseEnter={() => setHoveredAxis(axis.key)}
                onMouseLeave={() => setHoveredAxis(null)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '6px',
                  backgroundColor: isHovered ? '#EFF6FF' : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', fontWeight: 700, marginBottom: '4px', color: isHovered ? 'var(--accent-primary)' : 'var(--text-primary)' }}>
                  <span>{axis.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)' }}>{axis.value}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${axis.value}%`,
                      backgroundColor: axis.value >= 75 ? '#10B981' : axis.value >= 50 ? 'var(--accent-primary)' : '#F59E0B',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
