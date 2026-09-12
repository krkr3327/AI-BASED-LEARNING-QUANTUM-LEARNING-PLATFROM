import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

export default function QuantumTeleportationStudio() {
  const navigate = useNavigate();
  const [protocolMode, setProtocolMode] = useState('teleportation'); // 'teleportation' | 'superdense'

  // Input State Angles
  const [theta, setTheta] = useState(0.85); // radians [0, pi]
  const [phi, setPhi] = useState(0.45);   // radians [0, 2pi]

  // Superdense coding bits
  const [classicalBits, setClassicalBits] = useState('11'); // '00' | '01' | '10' | '11'

  // Current animation step
  const [step, setStep] = useState(3); // 0 to 4
  const [measuredOutcome, setMeasuredOutcome] = useState('10'); // Random classical measurement outcome

  // Compute input state amplitudes
  const alpha = Math.cos(theta / 2);
  const betaMag = Math.sin(theta / 2);
  const prob0 = (alpha * alpha).toFixed(3);
  const prob1 = (betaMag * betaMag).toFixed(3);

  // Reconstructed Bob state fidelity
  const fidelity = '1.0000';

  // Load into Quantum Lab preset
  const handleOpenInLab = () => {
    const preset = [
      { id: '1', gate: 'H', qubit: 1, col: 0 },
      { id: '2', gate: 'CNOT', qubit: 2, col: 1, controlQubit: 1 },
      { id: '3', gate: 'CNOT', qubit: 1, col: 2, controlQubit: 0 },
      { id: '4', gate: 'H', qubit: 0, col: 3 },
      { id: '5', gate: 'MEASURE', qubit: 0, col: 4 },
      { id: '6', gate: 'MEASURE', qubit: 1, col: 4 },
      { id: '7', gate: 'X', qubit: 2, col: 5 },
      { id: '8', gate: 'Z', qubit: 2, col: 6 }
    ];
    navigate('/lab', { state: { preset, numQubits: 3 } });
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '28px', boxShadow: 'var(--shadow-sm)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-primary)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              QUANTUM COMMUNICATION
            </span>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', backgroundColor: '#EFF6FF', color: 'var(--accent-primary)', borderRadius: '4px', fontWeight: 700 }}>
              EPR Non-Locality
            </span>
          </div>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Quantum Teleportation & Superdense Coding Protocol
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Transmit arbitrary quantum states or double classical bandwidth using shared entanglement and local unitary operations.
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setProtocolMode('teleportation')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: protocolMode === 'teleportation' ? 'var(--accent-primary)' : '#F1F5F9',
              color: protocolMode === 'teleportation' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Quantum Teleportation
          </button>
          <button
            onClick={() => setProtocolMode('superdense')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: protocolMode === 'superdense' ? 'var(--accent-primary)' : '#F1F5F9',
              color: protocolMode === 'superdense' ? '#FFFFFF' : 'var(--text-secondary)'
            }}
          >
            Superdense Coding
          </button>
          <button className="btn" style={{ fontSize: '0.8rem', padding: '6px 12px' }} onClick={handleOpenInLab}>
            ⚡ Open Circuit in Lab
          </button>
        </div>
      </div>

      {protocolMode === 'teleportation' ? (
        <div>
          {/* Controls: Target State Angles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', backgroundColor: '#F8FAFC', padding: '16px 20px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', fontWeight: 700, marginBottom: '4px' }}>
                <span>Polar Angle θ:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{(theta / Math.PI).toFixed(2)}π rad</span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.PI}
                step="0.05"
                value={theta}
                onChange={(e) => setTheta(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', fontWeight: 700, marginBottom: '4px' }}>
                <span>Phase Angle ϕ:</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>{(phi / Math.PI).toFixed(2)}π rad</span>
              </div>
              <input
                type="range"
                min="0"
                max={2 * Math.PI}
                step="0.05"
                value={phi}
                onChange={(e) => setPhi(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Simulated Measurement M₀M₁
              </label>
              <select
                value={measuredOutcome}
                onChange={(e) => setMeasuredOutcome(e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.85rem', fontWeight: 700 }}
              >
                <option value="00">00 → Bob applies I (Identity)</option>
                <option value="01">01 → Bob applies X (Bit-flip)</option>
                <option value="10">10 → Bob applies Z (Phase-flip)</option>
                <option value="11">11 → Bob applies XZ (Both)</option>
              </select>
            </div>
          </div>

          {/* Interactive 4-Stage Teleportation Flow */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            
            {/* Stage 1: Input State */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#EFF6FF', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                STAGE 1
              </span>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Alice's Unknown State</h4>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', backgroundColor: '#F8FAFC', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '10px' }}>
                |ψ⟩ = {alpha.toFixed(3)}|0⟩ + {betaMag.toFixed(3)}e<sup>i({(phi/Math.PI).toFixed(2)}π)</sup>|1⟩
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                P(|0⟩) = <strong>{prob0}</strong> • P(|1⟩) = <strong>{prob1}</strong>
              </div>
            </div>

            {/* Stage 2: Bell Measurement */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#FAF5FF', color: '#7E22CE', padding: '2px 6px', borderRadius: '4px' }}>
                STAGE 2
              </span>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Joint Bell Measurement</h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Alice executes CNOT(q₀, q₁) + H(q₀) and projects onto computational basis.
              </div>
              <div style={{ backgroundColor: '#FAF5FF', padding: '6px 10px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: '#7E22CE' }}>
                Outcome: (M₀, M₁) = ({measuredOutcome[0]}, {measuredOutcome[1]})
              </div>
            </div>

            {/* Stage 3: Classical Transfer */}
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#EFF6FF', color: '#2563EB', padding: '2px 6px', borderRadius: '4px' }}>
                STAGE 3
              </span>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>Classical Transmission</h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                2 Classical bits sent over conventional network link to Bob.
              </div>
              <div style={{ backgroundColor: '#EFF6FF', padding: '6px 10px', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 800, color: '#2563EB' }}>
                Payload: 2 bits ("{measuredOutcome}")
              </div>
            </div>

            {/* Stage 4: Bob's Reconstruction */}
            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '8px', padding: '16px', position: 'relative' }}>
              <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', fontWeight: 800, backgroundColor: '#DCFCE7', color: '#166534', padding: '2px 6px', borderRadius: '4px' }}>
                STAGE 4
              </span>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '0.95rem', fontWeight: 800, color: '#166534' }}>Bob's Restored State</h4>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', backgroundColor: '#FFFFFF', padding: '8px 12px', borderRadius: '6px', border: '1px solid #BBF7D0', marginBottom: '8px', color: '#15803D', fontWeight: 700 }}>
                |ψ_Bob⟩ = {alpha.toFixed(3)}|0⟩ + {betaMag.toFixed(3)}e<sup>i({(phi/Math.PI).toFixed(2)}π)</sup>|1⟩
              </div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D' }}>
                Fidelity F(ψ, ψ_Bob) = {fidelity} (Exact)
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Superdense Coding */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          <div style={{ backgroundColor: '#F8FAFC', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Superdense Coding Principle
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              Send <strong>2 classical bits</strong> by transmitting only <strong>1 physical qubit</strong> over the quantum channel using pre-shared entanglement:
            </p>
            <div style={{ display: 'flex', gap: '8px', margin: '14px 0' }}>
              {['00', '01', '10', '11'].map(b => (
                <button
                  key={b}
                  onClick={() => setClassicalBits(b)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '6px',
                    border: `1px solid ${classicalBits === b ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                    backgroundColor: classicalBits === b ? '#EFF6FF' : '#FFFFFF',
                    color: classicalBits === b ? 'var(--accent-primary)' : 'var(--text-primary)',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    cursor: 'pointer'
                  }}
                >
                  {b}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Selected message: <strong>"{classicalBits}"</strong> requires Alice to apply gate: <strong>{classicalBits === '00' ? 'I (Identity)' : classicalBits === '01' ? 'X (Bit Flip)' : classicalBits === '10' ? 'Z (Phase Flip)' : 'iY (Both)'}</strong>.
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>DECODED AT BOB'S RECEIVER</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-mono)', color: '#15803D', margin: '8px 0' }}>
                "{classicalBits}"
              </div>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', margin: 0 }}>
                Bob applies CNOT + H and measures both qubits in computational basis, perfectly extracting 2 bits with 100% deterministic probability.
              </p>
            </div>
            <div style={{ backgroundColor: '#F0FDF4', padding: '10px', borderRadius: '6px', border: '1px solid #BBF7D0', marginTop: '16px', fontSize: '0.8rem', color: '#166534', fontWeight: 700 }}>
              ✓ Channel Capacity Doubled (2 Classical Bits / 1 Qubit)
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
