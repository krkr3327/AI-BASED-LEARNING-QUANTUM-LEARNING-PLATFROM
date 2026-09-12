import React, { useState } from 'react';

/**
 * InlineInterferenceSandbox
 * Interactive Amplitude Addition & Interference Sandbox
 * Demonstrates:
 * - Constructive vs Destructive Interference
 * - Complex Phase rotations
 * - Probability calculations |c1 + c2|^2 vs classical P1 + P2
 */
export default function InlineInterferenceSandbox() {
  const [phase1, setPhase1] = useState(0); // in radians
  const [phase2, setPhase2] = useState(Math.PI); // in radians (default destructive)
  const [amp1, setAmp1] = useState(0.7071);
  const [amp2, setAmp2] = useState(0.7071);

  // Path 1 complex amplitude: amp1 * e^(i * phase1)
  const re1 = amp1 * Math.cos(phase1);
  const im1 = amp1 * Math.sin(phase1);

  // Path 2 complex amplitude: amp2 * e^(i * phase2)
  const re2 = amp2 * Math.cos(phase2);
  const im2 = amp2 * Math.sin(phase2);

  // Total amplitude c_total = c1 + c2
  const reTotal = re1 + re2;
  const imTotal = im1 + im2;

  // Quantum probability = |c_total|^2 = reTotal^2 + imTotal^2
  const quantumProb = Math.min(1.0, reTotal * reTotal + imTotal * imTotal);

  // Classical probability = |c1|^2 + |c2|^2
  const classicalProb = Math.min(1.0, amp1 * amp1 + amp2 * amp2);

  const isConstructive = quantumProb > classicalProb + 0.05;
  const isDestructive = quantumProb < classicalProb - 0.05;

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#FFFFFF',
      borderRadius: '10px',
      border: '1.5px solid var(--border-medium)',
      boxShadow: 'var(--shadow-sm)',
      margin: '20px 0'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <span style={{ fontSize: '0.725rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
          INTERACTIVE QUANTUM MECHANICS
        </span>
        <h4 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', color: 'var(--text-primary)', fontWeight: 700 }}>
          Amplitude Interference & Phase Cancellation Sandbox
        </h4>
        <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Adjust the relative phase between two computational paths to observe quantum constructive vs. destructive amplitude cancellation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
        {/* Controls Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>
              <span>Path 1 Phase φ₁:</span>
              <span style={{ fontFamily: 'monospace' }}>{(phase1 * 180 / Math.PI).toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.05"
              value={phase1}
              onChange={(e) => setPhase1(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#DC2626', marginBottom: '4px' }}>
              <span>Path 2 Phase φ₂:</span>
              <span style={{ fontFamily: 'monospace' }}>{(phase2 * 180 / Math.PI).toFixed(0)}°</span>
            </div>
            <input
              type="range"
              min="0"
              max={2 * Math.PI}
              step="0.05"
              value={phase2}
              onChange={(e) => setPhase2(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#DC2626' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => { setPhase1(0); setPhase2(0); }}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#DCFCE7',
                border: '1px solid #86EFAC',
                color: '#15803D',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Force In-Phase (Constructive)
            </button>
            <button
              onClick={() => { setPhase1(0); setPhase2(Math.PI); }}
              style={{
                flex: 1,
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                backgroundColor: '#FEE2E2',
                border: '1px solid #FCA5A5',
                color: '#B91C1C',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Force Out-of-Phase (Destructive)
            </button>
          </div>
        </div>

        {/* Visualizer Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#0B0F19', padding: '16px', borderRadius: '8px', color: '#FFFFFF' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontFamily: 'monospace' }}>Interference Regime:</span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              backgroundColor: isConstructive ? '#166534' : isDestructive ? '#991B1B' : '#334155',
              color: '#FFFFFF'
            }}>
              {isConstructive ? 'CONSTRUCTIVE (AMPLIFIED)' : isDestructive ? 'DESTRUCTIVE (CANCELLED)' : 'PARTIAL INTERFERENCE'}
            </span>
          </div>

          {/* Probability Comparison Bars */}
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: '#38BDF8' }}>
              <span>Quantum Probability |c₁ + c₂|²:</span>
              <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{(quantumProb * 100).toFixed(1)}%</span>
            </div>
            <div style={{ height: '14px', backgroundColor: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${quantumProb * 100}%`,
                backgroundColor: isConstructive ? '#10B981' : isDestructive ? '#EF4444' : '#06B6D4',
                transition: 'width 0.15s ease'
              }} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: '#94A3B8' }}>
              <span>Classical Probability P₁ + P₂:</span>
              <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>{(classicalProb * 100).toFixed(1)}%</span>
            </div>
            <div style={{ height: '10px', backgroundColor: '#1E293B', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${classicalProb * 100}%`,
                backgroundColor: '#64748B',
                transition: 'width 0.15s ease'
              }} />
            </div>
          </div>

          <div style={{ fontSize: '0.725rem', color: '#94A3B8', lineHeight: 1.4, marginTop: '4px', fontFamily: 'monospace', borderTop: '1px solid #1E293B', paddingTop: '8px' }}>
            c_total = ({reTotal.toFixed(2)}) + ({imTotal.toFixed(2)})i | Phase Diff: {Math.abs((phase1 - phase2) * 180 / Math.PI).toFixed(0)}°
          </div>
        </div>
      </div>
    </div>
  );
}
