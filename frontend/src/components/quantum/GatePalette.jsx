import React from 'react';

const GATE_CATEGORIES = [
  {
    name: 'FOUNDATION GATES',
    gates: [
      { id: 'H', name: 'Hadamard', symbol: 'H', desc: 'Creates equal superposition |+⟩', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
      { id: 'X', name: 'Pauli-X', symbol: 'X', desc: 'Quantum NOT gate (bit flip)', color: '#E11D48', bg: '#FEF2F2', border: '#FECACA' },
      { id: 'Y', name: 'Pauli-Y', symbol: 'Y', desc: 'Bit & phase flip gate', color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
      { id: 'Z', name: 'Pauli-Z', symbol: 'Z', desc: 'Phase flip gate (π shift)', color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
    ]
  },
  {
    name: 'PHASE SHIFTS',
    gates: [
      { id: 'S', name: 'Phase S', symbol: 'S', desc: 'π/2 phase shift gate', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
      { id: 'T', name: 'Phase T', symbol: 'T', desc: 'π/4 phase shift (π/8 gate)', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    ]
  },
  {
    name: 'PARAMETRIC ROTATIONS',
    gates: [
      { id: 'RX', name: 'Rotation X', symbol: 'RX', desc: 'Rotation around X-axis by θ', parameterized: true, color: '#DB2777', bg: '#FDF2F8', border: '#FBCFE8' },
      { id: 'RY', name: 'Rotation Y', symbol: 'RY', desc: 'Rotation around Y-axis by θ', parameterized: true, color: '#059669', bg: '#F0FDF4', border: '#BBF7D0' },
      { id: 'RZ', name: 'Rotation Z', symbol: 'RZ', desc: 'Rotation around Z-axis by θ', parameterized: true, color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    ]
  },
  {
    name: 'MULTI-QUBIT ENTANGLERS',
    gates: [
      { id: 'CNOT', name: 'Controlled-NOT', symbol: 'CX', desc: 'Flips target if control is |1⟩', multiQubit: true, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
      { id: 'CZ', name: 'Controlled-Z', symbol: 'CZ', desc: 'Phase flips if both are |1⟩', multiQubit: true, color: '#0284C7', bg: '#F0F9FF', border: '#BAE6FD' },
      { id: 'SWAP', name: 'SWAP', symbol: 'SW', desc: 'Swaps states of two qubits', multiQubit: true, color: '#4F46E5', bg: '#EEF2FF', border: '#C7D2FE' },
    ]
  },
  {
    name: 'MEASUREMENT & LOGIC',
    gates: [
      { id: 'M', name: 'Measure', symbol: 'M', desc: 'Collapses qubit to classical bit', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
      { id: 'Reset', name: 'Reset', symbol: '|0⟩', desc: 'Resets qubit to |0⟩ ground state', color: '#475569', bg: '#F8FAFC', border: '#CBD5E1' },
      { id: 'IF', name: 'Conditional', symbol: 'IF', desc: 'Applies gate on classical bit', color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' }
    ]
  }
];

export default function GatePalette({ onDragStart, onSelectGate, selectedGateId }) {
  return (
    <div style={{
      width: '270px',
      flexShrink: 0,
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid var(--border-subtle)',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '18px',
      overflowY: 'auto',
      userSelect: 'none',
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: 700,
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase'
      }}>
        QUANTUM GATE PALETTE
      </div>

      {GATE_CATEGORIES.map(cat => (
        <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            {cat.name}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {cat.gates.map(gate => {
              const isSelected = selectedGateId === gate.id;
              return (
                <div
                  key={gate.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, gate.id)}
                  onClick={() => onSelectGate && onSelectGate(gate)}
                  title={`${gate.name}: ${gate.desc}`}
                  style={{
                    padding: '8px 10px',
                    backgroundColor: isSelected ? '#EFF6FF' : gate.bg,
                    border: isSelected ? '2px solid var(--accent-primary)' : `1px solid ${gate.border}`,
                    borderRadius: '6px',
                    cursor: 'grab',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isSelected ? 'var(--shadow-sm)' : 'var(--shadow-xs)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '0.95rem',
                      color: gate.color
                    }}>
                      {gate.symbol}
                    </span>
                    {gate.parameterized && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: '#DB2777',
                        border: '1px solid #FBCFE8',
                        backgroundColor: '#FFFFFF',
                        padding: '1px 4px',
                        borderRadius: '3px'
                      }}>
                        (θ)
                      </span>
                    )}
                    {gate.multiQubit && (
                      <span style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: '#7C3AED',
                        border: '1px solid #DDD6FE',
                        backgroundColor: '#FFFFFF',
                        padding: '1px 4px',
                        borderRadius: '3px'
                      }}>
                        2-Q
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {gate.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div style={{
        marginTop: 'auto',
        padding: '12px',
        backgroundColor: '#F8FAFC',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.4
      }}>
        💡 <strong>Tip:</strong> Drag any gate onto a wire slot or click a slot directly to place it.
      </div>
    </div>
  );
}
