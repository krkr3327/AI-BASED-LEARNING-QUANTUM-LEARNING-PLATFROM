import React from 'react';

export default function RightInspector({
  selectedGate,
  onUpdateGateParam,
  onDeleteSelectedGate,
  onDeselectGate,
  numQubits,
  visualGates,
  selectedBackend,
  simResult,
  isStale
}) {
  const operationsCount = visualGates.length;
  const measurementCount = visualGates.filter(g => g.gate === 'M').length;

  return (
    <div style={{
      width: '280px',
      flexShrink: 0,
      backgroundColor: '#FFFFFF',
      borderLeft: '1px solid var(--border-subtle)',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      overflowY: 'auto',
      userSelect: 'none',
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.08em',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          textTransform: 'uppercase'
        }}>
          {selectedGate ? 'GATE INSPECTOR' : 'CIRCUIT OVERVIEW'}
        </div>
        {selectedGate && (
          <button
            onClick={onDeselectGate}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600
            }}
          >
            ✕ Deselect
          </button>
        )}
      </div>

      {selectedGate ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px',
            backgroundColor: '#F8FAFC',
            border: '1.5px solid var(--accent-primary)',
            borderRadius: '8px'
          }}>
            <div style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-primary)'
            }}>
              {selectedGate.gate}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedGate.gate === 'H' ? 'Hadamard Gate' :
                 selectedGate.gate === 'X' ? 'Pauli-X Gate' :
                 selectedGate.gate === 'Y' ? 'Pauli-Y Gate' :
                 selectedGate.gate === 'Z' ? 'Pauli-Z Gate' :
                 selectedGate.gate === 'CNOT' ? 'Controlled-NOT' :
                 selectedGate.gate === 'CZ' ? 'Controlled-Z' :
                 selectedGate.gate === 'SWAP' ? 'SWAP Gate' :
                 selectedGate.gate === 'M' ? 'Measurement' :
                 selectedGate.gate === 'Reset' ? 'Reset Gate' :
                 selectedGate.gate === 'IF' ? 'Conditional Gate' : `${selectedGate.gate} Gate`}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Wire Column: {selectedGate.col}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TYPE</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                {['CNOT', 'CZ', 'SWAP'].includes(selectedGate.gate) ? '2-Qubit Entangler' :
                 selectedGate.gate === 'M' ? 'Measurement' :
                 ['RX', 'RY', 'RZ'].includes(selectedGate.gate) ? 'Parameterized Single-Q' : 'Single-Qubit Gate'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>TARGET</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                {selectedGate.control !== undefined ? `Ctrl: q${selectedGate.control}, Tgt: q${selectedGate.target}` :
                 selectedGate.qubit !== undefined ? `Lane q${selectedGate.qubit}` :
                 selectedGate.cbit !== undefined ? `c${selectedGate.cbit} → q${selectedGate.targetQubit}` : 'N/A'}
              </span>
            </div>

            {['RX', 'RY', 'RZ'].includes(selectedGate.gate) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '6px' }}>
                <label style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  ROTATION ANGLE (θ rad):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedGate.parameters?.theta ?? 0.785}
                  onChange={(e) => onUpdateGateParam && onUpdateGateParam(selectedGate.id, parseFloat(e.target.value))}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border-medium)',
                    color: 'var(--text-primary)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>
            )}
          </div>

          <button
            onClick={() => onDeleteSelectedGate && onDeleteSelectedGate(selectedGate.id)}
            style={{
              marginTop: '12px',
              padding: '8px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              color: 'var(--gate-x)',
              borderRadius: '6px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            🗑 REMOVE GATE
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.825rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Qubit Count</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{numQubits} Lanes</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Operations</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{operationsCount} Gates</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Measurements</span>
              <span style={{ color: '#D97706', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{measurementCount} M</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Backend</span>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{selectedBackend}</span>
            </div>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: isStale ? '#FFFBEB' : simResult ? '#F0FDF4' : '#F8FAFC',
            border: `1px solid ${isStale ? '#FDE68A' : simResult ? '#BBF7D0' : 'var(--border-subtle)'}`,
            borderRadius: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>
              SIMULATION ENGINE STATUS
            </div>
            <div style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'var(--font-mono)',
              color: isStale ? '#B45309' : simResult ? '#15803D' : 'var(--text-secondary)'
            }}>
              {isStale ? '⚡ STALE (Circuit modified)' : simResult ? '✓ SIMULATED' : '○ IDLE (Ready)'}
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', lineHeight: 1.4, marginTop: '6px' }}>
            Click any placed gate on the circuit wires to inspect, configure angles, or delete.
          </div>
        </div>
      )}
    </div>
  );
}
