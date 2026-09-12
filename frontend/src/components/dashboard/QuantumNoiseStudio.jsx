import React, { useState } from 'react';

/**
 * QuantumNoiseStudio
 * Interactive Density Matrix & Hardware Decoherence Studio
 * Features:
 * - T1 (Longitudinal Relaxation) & T2 (Transverse Dephasing) time sliders
 * - Gate Infidelity & Depolarizing Noise channels
 * - Real-time Density Matrix rho representation: [[rho00, rho01], [rho10, rho11]]
 * - Live calculations: State Purity Tr(rho^2), von Neumann Entropy S(rho), State Fidelity F
 * - Visual decoherence comparison vs ideal pure state
 */
export default function QuantumNoiseStudio() {
  const [t1, setT1] = useState(50); // micro-seconds
  const [t2, setT2] = useState(30); // micro-seconds
  const [timeElapsed, setTimeElapsed] = useState(10); // micro-seconds
  const [gateErrorRate, setGateErrorRate] = useState(0.005); // 0.5% error
  const [initialState, setInitialState] = useState('plus'); // 'plus' (|+>), 'one' (|1>), 'zero' (|0>)

  // Initial pure density matrix rho_0
  let rho00_init = 1;
  let rho11_init = 0;
  let rho01_real_init = 0;
  let rho01_imag_init = 0;

  if (initialState === 'plus') {
    // |+> state: rho = [[0.5, 0.5], [0.5, 0.5]]
    rho00_init = 0.5;
    rho11_init = 0.5;
    rho01_real_init = 0.5;
  } else if (initialState === 'one') {
    // |1> state: rho = [[0, 0], [0, 1]]
    rho00_init = 0;
    rho11_init = 1;
  }

  // Calculate decoherence decay factors
  // Amplitude damping factor: gamma_1 = 1 - exp(-t / T1)
  // Phase damping factor: gamma_2 = exp(-t / T2)
  const gamma1 = Math.min(1.0, 1 - Math.exp(-timeElapsed / Math.max(1, t1)));
  const gamma2 = Math.exp(-timeElapsed / Math.max(1, t2));
  const depolarizeFactor = Math.pow(1 - gateErrorRate, 5);

  // Decayed density matrix elements
  const rho11 = rho11_init * (1 - gamma1) * depolarizeFactor + (1 - depolarizeFactor) * 0.5;
  const rho00 = 1.0 - rho11;
  const rho01_real = rho01_real_init * gamma2 * Math.sqrt(1 - gamma1) * depolarizeFactor;
  const rho01_imag = 0;

  // Purity: Tr(rho^2) = rho00^2 + rho11^2 + 2 * |rho01|^2
  const purity = Math.min(1.0, Math.max(0.5, (rho00 * rho00 + rho11 * rho11 + 2 * (rho01_real * rho01_real))));

  // von Neumann Entropy: S(rho) = -lambda1 log2(lambda1) - lambda2 log2(lambda2)
  // Eigenvalues of 2x2 density matrix: lambda = 1/2 +/- sqrt( (rho00 - rho11)^2 / 4 + |rho01|^2 )
  const diff = (rho00 - rho11) / 2;
  const detTerm = Math.sqrt(Math.max(0, diff * diff + rho01_real * rho01_real));
  const lambda1 = Math.max(1e-9, Math.min(1.0, 0.5 + detTerm));
  const lambda2 = Math.max(1e-9, Math.min(1.0, 0.5 - detTerm));
  const entropy = -(lambda1 * Math.log2(lambda1) + lambda2 * Math.log2(lambda2));

  // Fidelity F to initial pure state
  const fidelity = Math.max(0.0, Math.min(1.0, rho00 * rho00_init + rho11 * rho11_init + 2 * rho01_real * rho01_real_init));

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            PHYSICS & HARDWARE SIMULATOR
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 800 }}>
            Quantum Noise, Decoherence & Density Matrix Studio
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Simulate realistic open-system quantum dissipation, thermal relaxation ($T_1$), and dephasing ($T_2$) on transmon qubits.
          </p>
        </div>

        {/* Initial State Switcher */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'plus', label: 'Initial |+⟩' },
            { id: 'one', label: 'Initial |1⟩' },
            { id: 'zero', label: 'Initial |0⟩' }
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setInitialState(s.id)}
              style={{
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: initialState === s.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                backgroundColor: initialState === s.id ? '#EFF6FF' : '#FFFFFF',
                color: initialState === s.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* Controls Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* T1 Slider */}
          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              <span>Relaxation Time T₁ (Energy Decay):</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{t1} µs</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={t1}
              onChange={(e) => setT1(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--accent-primary)' }}
            />
          </div>

          {/* T2 Slider */}
          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              <span>Dephasing Time T₂ (Phase Coherence):</span>
              <span style={{ fontFamily: 'monospace', color: '#D97706' }}>{t2} µs</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={t2}
              onChange={(e) => setT2(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#D97706' }}
            />
          </div>

          {/* Time Elapsed Slider */}
          <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              <span>Circuit Execution Delay (t):</span>
              <span style={{ fontFamily: 'monospace', color: '#DC2626' }}>{timeElapsed} µs</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="2"
              value={timeElapsed}
              onChange={(e) => setTimeElapsed(parseFloat(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#DC2626' }}
            />
          </div>
        </div>

        {/* Real-Time Quantum Metrics & Density Matrix Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#0B0F19', padding: '18px', borderRadius: '8px', color: '#FFFFFF' }}>
          <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', fontFamily: 'monospace' }}>
            Density Matrix Elements ρ = |ψ⟩⟨ψ|
          </div>

          {/* 2x2 Matrix Box */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
            <div style={{ padding: '10px', backgroundColor: '#1E293B', borderRadius: '6px', border: '1px solid #334155', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>ρ₀₀ (P(|0⟩))</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38BDF8', marginTop: '2px' }}>{rho00.toFixed(3)}</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#1E293B', borderRadius: '6px', border: '1px solid #334155', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>ρ₀₁ (Coherence)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FCD34D', marginTop: '2px' }}>{rho01_real.toFixed(3)}</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#1E293B', borderRadius: '6px', border: '1px solid #334155', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>ρ₁₀ (Coherence)</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FCD34D', marginTop: '2px' }}>{rho01_real.toFixed(3)}</div>
            </div>
            <div style={{ padding: '10px', backgroundColor: '#1E293B', borderRadius: '6px', border: '1px solid #334155', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>ρ₁₁ (P(|1⟩))</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F472B6', marginTop: '2px' }}>{rho11.toFixed(3)}</div>
            </div>
          </div>

          {/* Physics Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '4px' }}>
            <div style={{ padding: '8px', backgroundColor: '#1E293B', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Purity Tr(ρ²)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: purity > 0.9 ? '#10B981' : '#F59E0B' }}>
                {purity.toFixed(3)}
              </div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#1E293B', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Entropy S(ρ)</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: entropy < 0.2 ? '#10B981' : '#EF4444' }}>
                {entropy.toFixed(3)}
              </div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#1E293B', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.65rem', color: '#94A3B8' }}>Fidelity F</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: fidelity > 0.85 ? '#38BDF8' : '#F472B6' }}>
                {(fidelity * 100).toFixed(1)}%
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
