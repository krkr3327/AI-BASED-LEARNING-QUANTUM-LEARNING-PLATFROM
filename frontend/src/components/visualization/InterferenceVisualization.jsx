import React from 'react';
import { QuantumPanel } from '../ui/QuantumPrimitives';

export default function InterferenceVisualization({ statevector, probabilities }) {
  if (!statevector || statevector.length === 0) {
    return (
      <QuantumPanel title="Quantum Phase & Interference" badgeText="Statevector Stream">
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '16px' }}>
          Execute a quantum circuit to observe quantum phase interference and amplitude constructive/destructive superposition.
        </div>
      </QuantumPanel>
    );
  }

  const numQubits = Math.round(Math.log2(statevector.length));
  
  const amplitudes = statevector.map((amp, idx) => {
    const real = amp.real;
    const imag = amp.imag;
    const mag = Math.sqrt(real * real + imag * imag);
    const phase = Math.atan2(imag, real);
    const phaseDeg = (phase * (180 / Math.PI) + 360) % 360;
    const bitstr = idx.toString(2).padStart(numQubits, '0');
    const prob = probabilities ? (probabilities[bitstr] || 0) : (mag * mag);
    return { idx, bitstr, real, imag, mag, phase, phaseDeg, prob };
  });

  return (
    <QuantumPanel title="Quantum Phase & Interference" badgeText={`${numQubits}-Qubit System`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
          <strong style={{ color: 'var(--accent-primary)' }}>Quantum Interference:</strong> State amplitudes <span style={{ fontFamily: 'var(--font-mono)' }}>ψ(x) = |α| e^(iφ)</span> combine constructively when phases align (<span style={{ fontFamily: 'var(--font-mono)' }}>Δφ ≈ 0°</span>) and cancel destructively when out of phase (<span style={{ fontFamily: 'var(--font-mono)' }}>Δφ ≈ 180°</span>).
        </div>

        {/* Phase Wave & Magnitude Spectrum */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {amplitudes.slice(0, 8).map(a => (
            <div key={a.idx} style={{ backgroundColor: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '10px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  |{a.bitstr}⟩
                </span>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>|α| = <strong>{a.mag.toFixed(3)}</strong></span>
                  <span style={{ color: 'var(--accent-indigo)' }}>φ = <strong>{a.phaseDeg.toFixed(1)}°</strong></span>
                  <span style={{ color: '#15803D' }}>P = <strong>{(a.prob * 100).toFixed(1)}%</strong></span>
                </div>
              </div>

              {/* Amplitude Bar & Phase Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ flex: 1, height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, a.prob * 100)}%`,
                    background: `hsl(${a.phaseDeg}, 75%, 45%)`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                  backgroundColor: a.mag > 0.01 ? '#EFF6FF' : '#F1F5F9',
                  color: a.mag > 0.01 ? 'var(--accent-primary)' : 'var(--text-muted)',
                  border: '1px solid var(--border-subtle)'
                }}>
                  {a.mag > 0.01 ? `Phase ${a.phaseDeg.toFixed(0)}°` : 'Destructive (0)'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {amplitudes.length > 8 && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            Showing top 8 basis state amplitudes of {amplitudes.length} total states.
          </div>
        )}
      </div>
    </QuantumPanel>
  );
}
