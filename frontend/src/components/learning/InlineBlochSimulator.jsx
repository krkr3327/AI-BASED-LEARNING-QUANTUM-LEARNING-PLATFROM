import React, { useState, useEffect, useRef } from 'react';

/**
 * InlineBlochSimulator
 * An interactive, zero-dependency SVG-based 3D Bloch Sphere micro-simulator.
 * Features:
 * - Real-time continuous Theta and Phi slider controls
 * - Interactive single-qubit gate application (X, Y, Z, H, S, T, Rx, Ry, Rz, Reset)
 * - Live Statevector Amplitudes alpha |0> + beta |1> calculation
 * - Exact Bloch 3D coordinates (x, y, z) readout
 * - Measurement projection probability bar
 */
export default function InlineBlochSimulator({ initialTheta = 0, initialPhi = 0, title = "Live 3D Bloch Sphere & Amplitude Inspector" }) {
  const [theta, setTheta] = useState(initialTheta); // 0 to PI
  const [phi, setPhi] = useState(initialPhi);     // 0 to 2*PI
  const [history, setHistory] = useState([]);
  const [measurementResult, setMeasurementResult] = useState(null);

  // Compute statevector amplitudes
  // |psi> = cos(theta/2) |0> + e^(i*phi) sin(theta/2) |1>
  const halfTheta = theta / 2;
  const alphaReal = Math.cos(halfTheta);
  const alphaImag = 0;
  const betaReal = Math.sin(halfTheta) * Math.cos(phi);
  const betaImag = Math.sin(halfTheta) * Math.sin(phi);

  const prob0 = alphaReal * alphaReal;
  const prob1 = betaReal * betaReal + betaImag * betaImag;

  // Cartesian coordinates on unit sphere
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);

  // 3D projection onto 2D SVG canvas (isometric-like perspective)
  const cx = 130;
  const cy = 130;
  const r = 90;

  // Projection angle
  const projX = cx + r * (x * 0.85 - y * 0.35);
  const projY = cy - r * (z * 0.85 + y * 0.35 * 0.5);

  const applyGate = (gateName) => {
    setMeasurementResult(null);
    if (gateName === 'X') {
      // theta -> PI - theta, phi -> -phi
      setTheta(prev => Math.PI - prev);
      setPhi(prev => (prev + Math.PI) % (2 * Math.PI));
      setHistory(h => [...h.slice(-4), 'X']);
    } else if (gateName === 'Z') {
      setPhi(prev => (prev + Math.PI) % (2 * Math.PI));
      setHistory(h => [...h.slice(-4), 'Z']);
    } else if (gateName === 'Y') {
      setTheta(prev => Math.PI - prev);
      setPhi(prev => (Math.PI - prev + 2 * Math.PI) % (2 * Math.PI));
      setHistory(h => [...h.slice(-4), 'Y']);
    } else if (gateName === 'H') {
      // Swap Z and X
      if (Math.abs(z - 1) < 0.05) {
        // |0> -> |+>
        setTheta(Math.PI / 2);
        setPhi(0);
      } else if (Math.abs(z + 1) < 0.05) {
        // |1> -> |->
        setTheta(Math.PI / 2);
        setPhi(Math.PI);
      } else if (Math.abs(x - 1) < 0.05) {
        // |+> -> |0>
        setTheta(0);
        setPhi(0);
      } else if (Math.abs(x + 1) < 0.05) {
        // |-> -> |1>
        setTheta(Math.PI);
        setPhi(0);
      } else {
        setTheta(prev => Math.abs(Math.PI / 2 - prev));
      }
      setHistory(h => [...h.slice(-4), 'H']);
    } else if (gateName === 'S') {
      setPhi(prev => (prev + Math.PI / 2) % (2 * Math.PI));
      setHistory(h => [...h.slice(-4), 'S']);
    } else if (gateName === 'T') {
      setPhi(prev => (prev + Math.PI / 4) % (2 * Math.PI));
      setHistory(h => [...h.slice(-4), 'T']);
    } else if (gateName === 'Rx') {
      setTheta(prev => (prev + Math.PI / 4) % Math.PI);
      setHistory(h => [...h.slice(-4), 'Rx(π/4)']);
    } else if (gateName === 'Ry') {
      setTheta(prev => (prev + Math.PI / 4) % (2 * Math.PI));
      setHistory(h => [...h.slice(-4), 'Ry(π/4)']);
    } else if (gateName === 'Rz') {
      setPhi(prev => (prev + Math.PI / 4) % (2 * Math.PI));
      setHistory(h => [...h.slice(-4), 'Rz(π/4)']);
    } else if (gateName === 'RESET') {
      setTheta(0);
      setPhi(0);
      setHistory([]);
    }
  };

  const measure = () => {
    const outcome = Math.random() < prob0 ? 0 : 1;
    setMeasurementResult(outcome);
    if (outcome === 0) {
      setTheta(0);
      setPhi(0);
    } else {
      setTheta(Math.PI);
      setPhi(0);
    }
  };

  // Format complex amplitude string
  const formatAmp = (re, im) => {
    const rStr = Math.abs(re) < 0.001 ? "0.00" : re.toFixed(2);
    const iStr = Math.abs(im) < 0.001 ? "" : (im > 0 ? ` + ${im.toFixed(2)}i` : ` - ${Math.abs(im).toFixed(2)}i`);
    return `${rStr}${iStr}`;
  };

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#FFFFFF',
      borderRadius: '10px',
      border: '1.5px solid var(--border-medium)',
      boxShadow: 'var(--shadow-sm)',
      margin: '20px 0'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            INTERACTIVE MICRO-SIMULATOR
          </span>
          <h4 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            {title}
          </h4>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => applyGate('RESET')}
            style={{
              padding: '5px 10px',
              fontSize: '0.75rem',
              fontWeight: 600,
              backgroundColor: '#F1F5F9',
              border: '1px solid var(--border-subtle)',
              borderRadius: '4px',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            Reset |0⟩
          </button>
          <button
            onClick={measure}
            style={{
              padding: '5px 12px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: '#DC2626',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#FFFFFF'
            }}
          >
            Measure ⚡
          </button>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', alignItems: 'center' }}>
        {/* Left: 3D SVG Sphere */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F19', borderRadius: '8px', padding: '16px' }}>
          <svg width="260" height="260" viewBox="0 0 260 260">
            <defs>
              <radialGradient id="sphereGrad" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#1E293B" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0B0F19" stopOpacity="0.95" />
              </radialGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Sphere Background */}
            <circle cx={cx} cy={cy} r={r} fill="url(#sphereGrad)" stroke="#334155" strokeWidth="1.5" />
            
            {/* Equator & Meridians */}
            <ellipse cx={cx} cy={cy} rx={r} ry={r * 0.35} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
            <ellipse cx={cx} cy={cy} rx={r * 0.35} ry={r} fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

            {/* Axes */}
            {/* Z-Axis (Vertical) */}
            <line x1={cx} y1={cy - r - 15} x2={cx} y2={cy + r + 15} stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" />
            <text x={cx + 8} y={cy - r - 6} fill="#38BDF8" fontSize="11" fontWeight="bold" fontFamily="monospace">|0⟩ (+z)</text>
            <text x={cx + 8} y={cy + r + 16} fill="#F472B6" fontSize="11" fontWeight="bold" fontFamily="monospace">|1⟩ (-z)</text>

            {/* X-Axis */}
            <line x1={cx - r - 10} y1={cy + 15} x2={cx + r + 10} y2={cy - 15} stroke="#64748B" strokeWidth="1" />
            <text x={cx + r + 14} y={cy - 14} fill="#94A3B8" fontSize="10" fontFamily="monospace">+x (|+⟩)</text>

            {/* State Vector Arrow */}
            <line
              x1={cx}
              y1={cy}
              x2={projX}
              y2={projY}
              stroke="#06B6D4"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#glow)"
            />
            {/* State Vector Tip */}
            <circle cx={projX} cy={projY} r="6" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="2" />

            {/* Coordinate Readout */}
            <text x="14" y="246" fill="#94A3B8" fontSize="10" fontFamily="monospace">
              Bloch: ({x.toFixed(2)}, {y.toFixed(2)}, {z.toFixed(2)})
            </text>
          </svg>

          {measurementResult !== null && (
            <div style={{
              marginTop: '10px',
              padding: '6px 14px',
              backgroundColor: measurementResult === 0 ? '#0284C7' : '#E11D48',
              color: '#FFFFFF',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 700,
              fontFamily: 'monospace'
            }}>
              Collapsed to: |{measurementResult}⟩
            </div>
          )}
        </div>

        {/* Right: Controls & Formulas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* State Formula Box */}
          <div style={{ padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              Statevector Representation |ψ⟩
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
              |ψ⟩ = {formatAmp(alphaReal, alphaImag)}|0⟩ + {formatAmp(betaReal, betaImag)}|1⟩
            </div>
          </div>

          {/* Probabilities */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              <span>P(|0⟩): {(prob0 * 100).toFixed(1)}%</span>
              <span>P(|1⟩): {(prob1 * 100).toFixed(1)}%</span>
            </div>
            <div style={{ display: 'flex', height: '10px', borderRadius: '5px', overflow: 'hidden', backgroundColor: '#E2E8F0' }}>
              <div style={{ width: `${prob0 * 100}%`, backgroundColor: '#0284C7', transition: 'width 0.15s ease' }} title="P(|0⟩)" />
              <div style={{ width: `${prob1 * 100}%`, backgroundColor: '#E11D48', transition: 'width 0.15s ease' }} title="P(|1⟩)" />
            </div>
          </div>

          {/* Angles Slider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                <span>Polar Angle θ (Latitude):</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{(theta * 180 / Math.PI).toFixed(0)}° ({(theta / Math.PI).toFixed(2)}π)</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.02"
                value={theta}
                onChange={(e) => {
                  setTheta(parseFloat(e.target.value));
                  setMeasurementResult(null);
                }}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                <span>Azimuthal Angle φ (Relative Phase):</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{(phi * 180 / Math.PI).toFixed(0)}° ({(phi / Math.PI).toFixed(2)}π)</span>
              </div>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.04"
                value={phi}
                onChange={(e) => {
                  setPhi(parseFloat(e.target.value));
                  setMeasurementResult(null);
                }}
                style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
              />
            </div>
          </div>

          {/* Gate Palette Quick-Buttons */}
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px' }}>
              Quick Gate Transformations
            </div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['X', 'Y', 'Z', 'H', 'S', 'T', 'Rx', 'Ry', 'Rz'].map((g) => (
                <button
                  key={g}
                  onClick={() => applyGate(g)}
                  style={{
                    padding: '5px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: '#F8FAFC',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    fontFamily: 'monospace',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                    e.currentTarget.style.color = '#FFFFFF';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
