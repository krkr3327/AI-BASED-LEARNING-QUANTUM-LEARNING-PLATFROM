import React, { useState, useMemo } from 'react';

export default function QkdSimulator() {
  const [protocol, setProtocol] = useState('bb84'); // 'bb84' | 'e91'
  const [keyLength, setKeyLength] = useState(16);
  const [eveInterceptionRate, setEveInterceptionRate] = useState(30); // 0 to 100%
  const [activeStep, setActiveStep] = useState(4); // 0: raw, 1: eve, 2: bob, 3: sifting, 4: qber/final
  const [simulationSeed, setSimulationSeed] = useState(1);

  // Generate Simulation Data based on seed, length, and interception rate
  const simulation = useMemo(() => {
    // Deterministic pseudo-random with seed
    const pseudoRandom = (seed) => {
      let x = Math.sin(seed++) * 10000;
      return () => {
        x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
      };
    };
    const rand = pseudoRandom(simulationSeed * 100 + keyLength);

    const bits = [];
    const aliceBases = []; // 0 = '+', 1 = 'x'
    const eveIntercepted = [];
    const eveBases = [];
    const eveMeasuredBits = [];
    const bobBases = [];
    const bobMeasuredBits = [];

    for (let i = 0; i < keyLength; i++) {
      const bit = rand() > 0.5 ? 1 : 0;
      const aBasis = rand() > 0.5 ? '+' : 'x';
      bits.push(bit);
      aliceBases.push(aBasis);

      // Eve intercept
      const intercepted = (rand() * 100) < eveInterceptionRate;
      eveIntercepted.push(intercepted);

      let photonState = { bit, basis: aBasis };

      if (intercepted) {
        const eBasis = rand() > 0.5 ? '+' : 'x';
        eveBases.push(eBasis);
        let eBit = bit;
        if (eBasis !== aBasis) {
          eBit = rand() > 0.5 ? 1 : 0; // measurement collapse
        }
        eveMeasuredBits.push(eBit);
        photonState = { bit: eBit, basis: eBasis };
      } else {
        eveBases.push('-');
        eveMeasuredBits.push('-');
      }

      // Bob measurement
      const bBasis = rand() > 0.5 ? '+' : 'x';
      bobBases.push(bBasis);
      let bBit = photonState.bit;
      if (bBasis !== photonState.basis) {
        bBit = rand() > 0.5 ? 1 : 0;
      }
      bobMeasuredBits.push(bBit);
    }

    // Sifting: keep where Alice basis == Bob basis
    const siftedIndices = [];
    for (let i = 0; i < keyLength; i++) {
      if (aliceBases[i] === bobBases[i]) {
        siftedIndices.push(i);
      }
    }

    // Check errors in sifted keys
    let errorCount = 0;
    siftedIndices.forEach(idx => {
      if (bits[idx] !== bobMeasuredBits[idx]) {
        errorCount++;
      }
    });

    const qber = siftedIndices.length > 0 ? (errorCount / siftedIndices.length) * 100 : 0;
    const isSecure = qber <= 11.0; // 11% theoretical limit for BB84

    // For E91 simulation: CHSH parameter S calculation
    const chshValue = (2 * Math.SQRT2 * (1 - (eveInterceptionRate / 100) * 0.4)).toFixed(3);
    const e91Secure = parseFloat(chshValue) > 2.0;

    return {
      bits,
      aliceBases,
      eveIntercepted,
      eveBases,
      eveMeasuredBits,
      bobBases,
      bobMeasuredBits,
      siftedIndices,
      errorCount,
      qber: qber.toFixed(1),
      isSecure,
      chshValue,
      e91Secure
    };
  }, [keyLength, eveInterceptionRate, simulationSeed]);

  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', pb: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              QUANTUM CRYPTOGRAPHY
            </span>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: '#EFF6FF', color: 'var(--accent-primary)', borderRadius: '4px', fontWeight: 700 }}>
              Physical Layer Security
            </span>
          </div>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Quantum Key Distribution (QKD) & Eavesdropping Network
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Simulate photon state transmission, Eve's intercept-resend attack, basis reconciliation, and QBER threshold verification.
          </p>
        </div>

        {/* Protocol Selector Tabs */}
        <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setProtocol('bb84')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: protocol === 'bb84' ? '#FFFFFF' : 'transparent',
              color: protocol === 'bb84' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: protocol === 'bb84' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            BB84 (Prepare & Measure)
          </button>
          <button
            onClick={() => setProtocol('e91')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: protocol === 'e91' ? '#FFFFFF' : 'transparent',
              color: protocol === 'e91' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: protocol === 'e91' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            E91 (Entanglement / CHSH)
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', backgroundColor: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
        {/* Eve Eavesdropping Slider */}
        <div style={{ flex: '1', minWidth: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>
            <span>Eve Intercept Probability:</span>
            <span style={{ color: eveInterceptionRate > 0 ? '#DC2626' : '#166534', fontFamily: 'var(--font-mono)' }}>
              {eveInterceptionRate}% {eveInterceptionRate > 0 ? '(Eavesdropper Active)' : '(Channel Secure)'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={eveInterceptionRate}
            onChange={(e) => setEveInterceptionRate(Number(e.target.value))}
            style={{ width: '100%', accentColor: eveInterceptionRate > 20 ? '#DC2626' : 'var(--accent-primary)' }}
          />
        </div>

        {/* Pulse Count */}
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            Photon Pulses (N)
          </label>
          <select
            value={keyLength}
            onChange={(e) => setKeyLength(Number(e.target.value))}
            style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', fontWeight: 600 }}
          >
            <option value={12}>12 Photons</option>
            <option value={16}>16 Photons</option>
            <option value={24}>24 Photons</option>
          </select>
        </div>

        {/* Regenerate Seed */}
        <button
          className="btn"
          style={{ padding: '8px 16px', fontSize: '0.8rem', fontWeight: 700 }}
          onClick={() => setSimulationSeed(s => s + 1)}
        >
          🔄 Re-Transmit Pulses
        </button>
      </div>

      {protocol === 'bb84' ? (
        <div>
          {/* Status Metrics Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700 }}>SIFTED KEY BITS</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '2px' }}>
                {simulation.siftedIndices.length} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/ {keyLength}</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700 }}>EVE INTERCEPTED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: simulation.eveIntercepted.filter(Boolean).length > 0 ? '#DC2626' : '#166534', marginTop: '2px' }}>
                {simulation.eveIntercepted.filter(Boolean).length} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>photons</span>
              </div>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontWeight: 700 }}>QUANTUM BIT ERROR (QBER)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: parseFloat(simulation.qber) > 11.0 ? '#DC2626' : '#15803D', marginTop: '2px' }}>
                {simulation.qber}%
              </div>
            </div>

            <div style={{
              backgroundColor: simulation.isSecure ? '#F0FDF4' : '#FEF2F2',
              padding: '14px',
              borderRadius: '8px',
              border: `1px solid ${simulation.isSecure ? '#BBF7D0' : '#FECACA'}`,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '0.725rem', color: simulation.isSecure ? '#166534' : '#991B1B', fontWeight: 700 }}>SECURITY STATUS</div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: simulation.isSecure ? '#15803D' : '#DC2626', marginTop: '2px' }}>
                {simulation.isSecure ? '✓ SECURE (QBER ≤ 11%)' : '⚠ ABORT: EVE DETECTED'}
              </div>
            </div>
          </div>

          {/* Interactive Protocol Ladder Table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.825rem' }}>
              <tbody>
                {/* Photon Index */}
                <tr style={{ backgroundColor: '#F1F5F9', borderBottom: '1px solid var(--border-subtle)', fontWeight: 700 }}>
                  <td style={{ padding: '10px 14px', textAlign: 'left', minWidth: '160px', fontFamily: 'var(--font-mono)' }}>Photon Pulse #</td>
                  {simulation.bits.map((_, i) => (
                    <td key={i} style={{ padding: '10px 8px', minWidth: '36px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      #{i + 1}
                    </td>
                  ))}
                </tr>

                {/* Alice Random Bit */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    Alice Raw Bit
                  </td>
                  {simulation.bits.map((b, i) => (
                    <td key={i} style={{ padding: '10px 8px', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                      {b}
                    </td>
                  ))}
                </tr>

                {/* Alice Basis */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#FAF5FF' }}>
                  <td style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#7E22CE' }}>
                    Alice Basis (+ / ×)
                  </td>
                  {simulation.aliceBases.map((basis, i) => (
                    <td key={i} style={{ padding: '10px 8px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#7E22CE' }}>
                      {basis === '+' ? '✛' : '✕'}
                    </td>
                  ))}
                </tr>

                {/* Eve Eavesdropping Activity */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#FEF2F2' }}>
                  <td style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#DC2626' }}>
                    Eve Intercept / Basis
                  </td>
                  {simulation.eveIntercepted.map((intercepted, i) => (
                    <td key={i} style={{ padding: '10px 8px', fontFamily: 'var(--font-mono)', color: intercepted ? '#DC2626' : '#9CA3AF', fontWeight: intercepted ? 800 : 400 }}>
                      {intercepted ? (simulation.eveBases[i] === '+' ? '✛' : '✕') : '—'}
                    </td>
                  ))}
                </tr>

                {/* Bob Basis */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#EFF6FF' }}>
                  <td style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#2563EB' }}>
                    Bob Basis (+ / ×)
                  </td>
                  {simulation.bobBases.map((basis, i) => (
                    <td key={i} style={{ padding: '10px 8px', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#2563EB' }}>
                      {basis === '+' ? '✛' : '✕'}
                    </td>
                  ))}
                </tr>

                {/* Bob Measured Bit */}
                <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: '#2563EB' }}>
                    Bob Measured Bit
                  </td>
                  {simulation.bobMeasuredBits.map((b, i) => (
                    <td key={i} style={{ padding: '10px 8px', fontWeight: 800, fontFamily: 'var(--font-mono)', fontSize: '0.95rem' }}>
                      {b}
                    </td>
                  ))}
                </tr>

                {/* Sifting Result */}
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Bases Match (Sifted)
                  </td>
                  {simulation.bits.map((_, i) => {
                    const matched = simulation.aliceBases[i] === simulation.bobBases[i];
                    return (
                      <td key={i} style={{ padding: '10px 8px', fontWeight: 800, color: matched ? '#15803D' : '#94A3B8' }}>
                        {matched ? '✓' : '✗'}
                      </td>
                    );
                  })}
                </tr>

                {/* Final Sifted Key */}
                <tr style={{ backgroundColor: '#F0FDF4' }}>
                  <td style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 800, color: '#166534' }}>
                    Established Key
                  </td>
                  {simulation.bits.map((_, i) => {
                    const matched = simulation.aliceBases[i] === simulation.bobBases[i];
                    const isError = matched && simulation.bits[i] !== simulation.bobMeasuredBits[i];
                    if (!matched) {
                      return <td key={i} style={{ padding: '12px 8px', color: '#CBD5E1' }}>—</td>;
                    }
                    return (
                      <td
                        key={i}
                        style={{
                          padding: '12px 8px',
                          fontWeight: 900,
                          fontFamily: 'var(--font-mono)',
                          fontSize: '1.05rem',
                          color: isError ? '#DC2626' : '#166534',
                          backgroundColor: isError ? '#FEE2E2' : 'transparent'
                        }}
                      >
                        {simulation.bobMeasuredBits[i]}
                        {isError && <span style={{ fontSize: '0.65rem', display: 'block', color: '#DC2626' }}>ERR</span>}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* E91 Entanglement-based CHSH Test */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Ekert (E91) Bell Entanglement Protocol
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              A source emits maximally entangled Bell pairs <code style={{ color: 'var(--accent-primary)' }}>|Φ⁺⟩ = (|00⟩ + |11⟩)/√2</code> to Alice and Bob.
              Security is verified by evaluating the CHSH Bell Inequality correlator:
            </p>
            <div style={{ backgroundColor: '#FFFFFF', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', margin: '12px 0' }}>
              S = |E(a₁, b₁) - E(a₁, b₂) + E(a₂, b₁) + E(a₂, b₂)|
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <li><strong>Classical Local-Hidden-Variable Bound:</strong> <code>S ≤ 2</code></li>
              <li><strong>Quantum Tsirelson's Bound:</strong> <code>S = 2√2 ≈ 2.828</code></li>
              <li><strong>Eavesdropping Effect:</strong> Intercepting or cloning collapses entanglement, pushing <code>S → ≤ 2</code>.</li>
            </ul>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>LIVE CHSH PARAMETER (S)</div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: simulation.e91Secure ? '#15803D' : '#DC2626', margin: '8px 0' }}>
                {simulation.chshValue}
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: simulation.e91Secure ? '#166534' : '#DC2626' }}>
                {simulation.e91Secure ? '✓ Quantum Violation Proven (S > 2.0) — Channel Untampered' : '⚠ Classical Regime (S ≤ 2.0) — Entanglement Broken by Eve!'}
              </div>
            </div>

            {/* Quantum vs Classical Bar */}
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                <span>Classical (S=0)</span>
                <span>Threshold (S=2.0)</span>
                <span>Tsirelson (S=2.83)</span>
              </div>
              <div style={{ height: '10px', backgroundColor: '#E2E8F0', borderRadius: '5px', position: 'relative', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${(parseFloat(simulation.chshValue) / 2.828) * 100}%`,
                    backgroundColor: simulation.e91Secure ? '#15803D' : '#DC2626',
                    borderRadius: '5px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
