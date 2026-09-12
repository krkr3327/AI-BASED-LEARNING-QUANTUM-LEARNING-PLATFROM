import React, { useState } from 'react';

export default function QuantumAdvantageExplorer() {
  const [domain, setDomain] = useState('grover'); // 'grover' | 'shor' | 'chemistry'

  // Grover parameters: Search space size (log10 N)
  const [logN, setLogN] = useState(10); // N = 10^10

  // Shor parameters: RSA Key size in bits
  const [rsaBits, setRsaBits] = useState(2048);

  // Chemistry parameters: Molecular active space spin-orbitals
  const [orbitals, setOrbitals] = useState(40);

  // Compute Grover comparisons
  const N = Math.pow(10, logN);
  const classicalGroverOps = N;
  const quantumGroverOps = Math.round(Math.PI / 4 * Math.sqrt(N));
  const classicalGroverTimeSec = classicalGroverOps / 1e9; // 1 GHz classical CPU
  const quantumGroverTimeSec = quantumGroverOps / 1e6; // 1 MHz quantum gate rate

  // Compute Shor comparisons
  const classicalShorOpsStr = rsaBits >= 2048 ? '> 10²⁴ Operations' : rsaBits >= 1024 ? '1.2 × 10¹⁹ Operations' : '4.5 × 10¹² Operations';
  const classicalShorTimeStr = rsaBits >= 2048 ? '~300 Trillion Years (Classical Supercomputer)' : rsaBits >= 1024 ? '~3,400 Years' : '~4.2 Months';
  const quantumShorOpsStr = `${Math.round(Math.pow(rsaBits, 3) / 1e9)} G-Gates (~${(Math.pow(rsaBits, 3) / 1e9).toFixed(1)} Billion Ops)`;
  const quantumShorTimeStr = rsaBits >= 2048 ? '~8.2 Hours (Fault-Tolerant QPU)' : rsaBits >= 1024 ? '~1.1 Hours' : '~8.5 Minutes';

  // Compute Chemistry comparisons
  const classicalChemStates = Math.pow(2, orbitals);
  const classicalMemoryGB = (classicalChemStates * 16) / (1024 * 1024 * 1024); // 16 bytes per complex128
  const memoryStr = orbitals >= 50 ? 'Exabyte / Yottabyte Scale (Impossible to store)' : orbitals >= 40 ? `${(classicalMemoryGB / 1024).toFixed(1)} Terabytes RAM` : `${classicalMemoryGB.toFixed(2)} GB RAM`;

  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              COMPUTATIONAL COMPLEXITY THEORY
            </span>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: '#EFF6FF', color: 'var(--accent-primary)', borderRadius: '4px', fontWeight: 700 }}>
              BQP vs P / NP
            </span>
          </div>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Quantum Advantage & Asymptotic Scaling Explorer
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Compare quantum vs classical asymptotic wall-clock runtimes, space complexity, and algorithmic scaling limits.
          </p>
        </div>

        {/* Domain Selector */}
        <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setDomain('grover')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: domain === 'grover' ? '#FFFFFF' : 'transparent',
              color: domain === 'grover' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: domain === 'grover' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            Database Search (Grover)
          </button>
          <button
            onClick={() => setDomain('shor')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: domain === 'shor' ? '#FFFFFF' : 'transparent',
              color: domain === 'shor' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: domain === 'shor' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            RSA Factoring (Shor)
          </button>
          <button
            onClick={() => setDomain('chemistry')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: domain === 'chemistry' ? '#FFFFFF' : 'transparent',
              color: domain === 'chemistry' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: domain === 'chemistry' ? 'var(--shadow-xs)' : 'none'
            }}
          >
            Molecular Chemistry (VQE)
          </button>
        </div>
      </div>

      {domain === 'grover' && (
        <div>
          {/* Grover Slider */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>Search Space Elements (N = 10^{logN}):</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{N.toLocaleString()} items</span>
            </div>
            <input
              type="range"
              min="4"
              max="14"
              step="1"
              value={logN}
              onChange={(e) => setLogN(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          {/* Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Classical Card */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                CLASSICAL BRUTE FORCE O(N)
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1E293B', margin: '8px 0' }}>
                {classicalGroverOps.toExponential(2)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>operations</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Estimated runtime at 1 GHz clock:
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                  {classicalGroverTimeSec > 86400 ? `${(classicalGroverTimeSec / 86400).toFixed(1)} days` : `${classicalGroverTimeSec.toFixed(2)} seconds`}
                </div>
              </div>
            </div>

            {/* Quantum Card */}
            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                QUANTUM GROVER SEARCH O(√N)
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#166534', margin: '8px 0' }}>
                {quantumGroverOps.toExponential(2)} <span style={{ fontSize: '0.9rem', color: '#15803D' }}>oracle calls</span>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Estimated runtime at 1 MHz QPU gate rate:
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>
                  {quantumGroverTimeSec < 1 ? `${(quantumGroverTimeSec * 1000).toFixed(2)} milliseconds` : `${quantumGroverTimeSec.toFixed(2)} seconds`}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {domain === 'shor' && (
        <div>
          {/* Shor Slider */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>RSA Modulus Key Length (n bits):</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>{rsaBits}-bit RSA (2^{rsaBits})</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {[512, 1024, 2048, 4096].map(b => (
                <button
                  key={b}
                  onClick={() => setRsaBits(b)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: `1px solid ${rsaBits === b ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    backgroundColor: rsaBits === b ? '#EFF6FF' : '#FFFFFF',
                    color: rsaBits === b ? 'var(--accent-primary)' : 'var(--text-primary)',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {b}-bit RSA
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                CLASSICAL GNFS SIEVE (SUB-EXPONENTIAL)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1E293B', margin: '8px 0' }}>
                {classicalShorOpsStr}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Time to factor on Top500 Supercomputer:
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                  {classicalShorTimeStr}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                SHOR'S QUANTUM FACTORING O(n³) (POLYNOMIAL)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#166534', margin: '8px 0' }}>
                {quantumShorOpsStr}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Time to factor on Fault-Tolerant QPU:
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>
                  {quantumShorTimeStr}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {domain === 'chemistry' && (
        <div>
          {/* Chemistry Slider */}
          <div style={{ backgroundColor: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>Fermionic Spin-Orbitals (Active Space Qubits):</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>N = {orbitals} Orbitals ({orbitals} Qubits)</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={orbitals}
              onChange={(e) => setOrbitals(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                CLASSICAL EXACT FULL CI (O(2ᴺ))
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1E293B', margin: '8px 0' }}>
                2^{orbitals} = {orbitals > 40 ? '1.1 × 10¹²+' : classicalChemStates.toLocaleString()} States
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Memory footprint to store Hamiltonian matrix:
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
                  {memoryStr}
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                QUANTUM VQE / JORDAN-WIGNER (O(N⁴))
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#166534', margin: '8px 0' }}>
                {orbitals} Logical Qubits
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Quantum state storage requirements:
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>
                  Exact ground state wave function |ψ(θ)⟩ natively represented on {orbitals} qubits without exponential RAM blowup.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
