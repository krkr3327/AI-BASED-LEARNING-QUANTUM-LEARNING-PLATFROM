import React, { useState, useMemo } from 'react';

// Phase to HSL Color Converter (Hue: 0 = Cyan/Blue, 90 = Green, 180 = Yellow/Orange, 270 = Magenta/Red)
function phaseToColor(phaseRad) {
  let deg = ((phaseRad * 180) / Math.PI) % 360;
  if (deg < 0) deg += 360;
  return `hsl(${deg.toFixed(0)}, 85%, 50%)`;
}

export default function StatevectorVisualization({ statevector, numQubits = 1 }) {
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'density' | 'phasor'
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const processedAmplitudes = useMemo(() => {
    if (!statevector || statevector.length === 0) return [];
    return statevector.map((amp, idx) => {
      const real = typeof amp.real === 'number' ? amp.real : parseFloat(amp.real) || 0;
      const imag = typeof amp.imag === 'number' ? amp.imag : parseFloat(amp.imag) || 0;
      const mag = Math.sqrt(real * real + imag * imag);
      const prob = real * real + imag * imag;
      let phase = Math.atan2(imag, real); // [-pi, pi]
      if (phase < 0) phase += 2 * Math.PI; // [0, 2pi]
      const binaryStr = idx.toString(2).padStart(numQubits, '0');

      return {
        idx,
        binaryStr,
        real,
        imag,
        mag,
        prob,
        probPct: (prob * 100).toFixed(2),
        phase,
        phasePi: (phase / Math.PI).toFixed(2),
        color: phaseToColor(phase)
      };
    });
  }, [statevector, numQubits]);

  // Compute Density Matrix elements rho_ij = c_i * c_j^*
  const densityMatrix = useMemo(() => {
    if (processedAmplitudes.length === 0) return [];
    const matrix = [];
    for (let i = 0; i < processedAmplitudes.length; i++) {
      const row = [];
      const ai = processedAmplitudes[i];
      for (let j = 0; j < processedAmplitudes.length; j++) {
        const aj = processedAmplitudes[j];
        // (ai.real + i*ai.imag) * (aj.real - i*aj.imag)
        const realPart = ai.real * aj.real + ai.imag * aj.imag;
        const imagPart = ai.imag * aj.real - ai.real * aj.imag;
        const mag = Math.sqrt(realPart * realPart + imagPart * imagPart);
        row.push({ i, j, real: realPart, imag: imagPart, mag });
      }
      matrix.push(row);
    }
    return matrix;
  }, [processedAmplitudes]);

  if (!statevector || statevector.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No statevector data available.</p>;
  }

  // Dirac Ket Expression String
  const diracString = processedAmplitudes
    .filter(a => a.mag > 0.001)
    .map(a => {
      const sign = a.real >= 0 ? '+' : '-';
      return `(${a.real.toFixed(3)}${a.imag >= 0 ? '+' : ''}${a.imag.toFixed(3)}i)|${a.binaryStr}⟩`;
    })
    .join(' + ') || '|0...0⟩';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      
      {/* Header & View Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <div>
          <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
            STATEVECTOR HILBERT SPACE (2^{numQubits} = {statevector.length} BASIS STATES)
          </span>
          <div style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', marginTop: '2px', overflowX: 'auto', maxWidth: '650px' }}>
            |ψ⟩ = {diracString}
          </div>
        </div>

        {/* View Switcher */}
        <div style={{ display: 'flex', backgroundColor: '#E2E8F0', padding: '3px', borderRadius: '6px' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: viewMode === 'table' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'table' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            Phase Disc Table
          </button>
          <button
            onClick={() => setViewMode('phasor')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: viewMode === 'phasor' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'phasor' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            Polar Phase Wheels
          </button>
          <button
            onClick={() => setViewMode('density')}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: viewMode === 'density' ? '#FFFFFF' : 'transparent',
              color: viewMode === 'density' ? 'var(--accent-primary)' : 'var(--text-secondary)'
            }}
          >
            Density Matrix Heatmap [ρ]
          </button>
        </div>
      </div>

      {/* VIEW 1: ADVANCED PHASE DISC TABLE */}
      {viewMode === 'table' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', backgroundColor: '#F8FAFC', fontSize: '0.725rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <th style={{ padding: '12px 18px' }}>Basis |i⟩</th>
                <th style={{ padding: '12px 18px' }}>Phase Disc</th>
                <th style={{ padding: '12px 18px' }}>Real Amplitude (α)</th>
                <th style={{ padding: '12px 18px' }}>Imag Amplitude (β)</th>
                <th style={{ padding: '12px 18px' }}>Phase Angle (arg ψ)</th>
                <th style={{ padding: '12px 18px' }}>Probability (|ψ|²)</th>
              </tr>
            </thead>
            <tbody>
              {processedAmplitudes.map((amp) => {
                const isHovered = hoveredIdx === amp.idx;
                return (
                  <tr
                    key={amp.idx}
                    onMouseEnter={() => setHoveredIdx(amp.idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      backgroundColor: isHovered ? '#F8FAFC' : 'transparent',
                      transition: 'background-color 0.12s'
                    }}
                  >
                    <td style={{ padding: '12px 18px', color: 'var(--accent-primary)', fontWeight: 800 }}>
                      |{amp.binaryStr}⟩
                    </td>
                    
                    {/* SVG Phase Wheel Disc */}
                    <td style={{ padding: '12px 18px' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="24" height="24" viewBox="-12 -12 24 24">
                          <circle cx="0" cy="0" r="10" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
                          {amp.mag > 0.001 && (
                            <>
                              <circle cx="0" cy="0" r={Math.max(amp.mag * 10, 2)} fill={amp.color} opacity="0.35" />
                              <line
                                x1="0"
                                y1="0"
                                x2={(Math.cos(amp.phase) * 10).toFixed(2)}
                                y2={(-Math.sin(amp.phase) * 10).toFixed(2)}
                                stroke={amp.color}
                                strokeWidth="2.5"
                                strokeLinecap="round"
                              />
                            </>
                          )}
                        </svg>
                      </div>
                    </td>

                    <td style={{ padding: '12px 18px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {amp.real >= 0 ? `+${amp.real.toFixed(4)}` : amp.real.toFixed(4)}
                    </td>
                    <td style={{ padding: '12px 18px', color: 'var(--text-primary)', fontWeight: 600 }}>
                      {amp.imag >= 0 ? `+${amp.imag.toFixed(4)}` : amp.imag.toFixed(4)}
                    </td>
                    <td style={{ padding: '12px 18px', color: amp.color, fontWeight: 700 }}>
                      {amp.phasePi}π rad
                    </td>
                    <td style={{ padding: '12px 18px', color: amp.prob > 0.01 ? '#15803D' : 'var(--text-muted)', fontWeight: 800 }}>
                      {amp.probPct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW 2: POLAR PHASE WHEELS GRID */}
      {viewMode === 'phasor' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px', backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          {processedAmplitudes.map((amp) => (
            <div
              key={amp.idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '12px 8px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)', marginBottom: '8px' }}>
                |{amp.binaryStr}⟩
              </div>
              <svg width="60" height="60" viewBox="-30 -30 60 60">
                <circle cx="0" cy="0" r="26" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
                <circle cx="0" cy="0" r={Math.max(amp.mag * 26, 1)} fill={amp.color} opacity="0.25" />
                <line x1="-26" y1="0" x2="26" y2="0" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="-26" x2="0" y2="26" stroke="#F1F5F9" strokeWidth="1" />
                {amp.mag > 0.001 && (
                  <line
                    x1="0"
                    y1="0"
                    x2={(Math.cos(amp.phase) * 26).toFixed(2)}
                    y2={(-Math.sin(amp.phase) * 26).toFixed(2)}
                    stroke={amp.color}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
                <circle cx="0" cy="0" r="3" fill="var(--text-primary)" />
              </svg>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: amp.color, marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                {amp.phasePi}π rad
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                P = {amp.probPct}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 3: 2D DENSITY MATRIX [ρ] HEATMAP */}
      {viewMode === 'density' && (
        <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px', fontFamily: 'var(--font-mono)' }}>
            Density Operator Matrix Elements ρ_ij = |⟨i|ψ⟩⟨ψ|j⟩| (Populations on Diagonal, Coherences Off-Diagonal)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${statevector.length}, 48px)`, gap: '4px' }}>
              {densityMatrix.map((row, i) =>
                row.map((cell, j) => {
                  const intensity = Math.min(cell.mag, 1.0);
                  const isDiag = i === j;
                  const bg = isDiag
                    ? `rgba(37, 99, 235, ${Math.max(intensity, 0.08)})`
                    : `rgba(168, 85, 247, ${Math.max(intensity, 0.08)})`;

                  return (
                    <div
                      key={`${i}-${j}`}
                      title={`ρ[|${processedAmplitudes[i].binaryStr}⟩, |${processedAmplitudes[j].binaryStr}⟩] = ${cell.real.toFixed(3)} + ${cell.imag.toFixed(3)}i`}
                      style={{
                        width: '48px',
                        height: '48px',
                        backgroundColor: bg,
                        border: `1px solid ${isDiag ? '#93C5FD' : '#E9D5FF'}`,
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'help',
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: intensity > 0.4 ? '#FFFFFF' : 'var(--text-primary)'
                      }}
                    >
                      {cell.mag > 0.001 ? cell.mag.toFixed(2) : '0'}
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#2563EB', borderRadius: '2px' }} /> Diagonal Population (Probability)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '12px', height: '12px', backgroundColor: '#A855F7', borderRadius: '2px' }} /> Off-Diagonal Coherences (Quantum Superposition)
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
