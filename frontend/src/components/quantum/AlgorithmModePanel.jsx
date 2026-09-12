import React, { useState, useEffect } from 'react';

const ALGORITHM_CATEGORIES = [
  {
    category: 'FOUNDATIONS',
    algos: [
      { id: 'bell', name: 'Bell State', desc: 'Maximally entangled 2-qubit state |Φ+⟩', qubits: 2 },
      { id: 'ghz', name: 'GHZ State', desc: '3-qubit Greenberger–Horne–Zeilinger entangled state', qubits: 3 }
    ]
  },
  {
    category: 'ORACLE-BASED',
    algos: [
      { id: 'deutsch_jozsa', name: 'Deutsch–Jozsa', desc: 'Determines if function is constant or balanced in 1 query', qubits: 2 },
      { id: 'bernstein_vazirani', name: 'Bernstein–Vazirani', desc: 'Finds hidden n-bit binary string s in 1 query', qubits: 3 }
    ]
  },
  {
    category: 'SEARCH',
    algos: [
      { id: 'grover', name: 'Grover\'s Search', desc: 'Quadratic speedup search for marked state in unstructured database', qubits: 2 }
    ]
  },
  {
    category: 'TRANSFORM',
    algos: [
      { id: 'qft', name: 'Quantum Fourier Transform', desc: 'Maps quantum state to frequency domain amplitudes', qubits: 3 }
    ]
  },
  {
    category: 'VARIATIONAL',
    algos: [
      { id: 'vqe', name: 'VQE (Variational Quantum Eigensolver)', desc: 'Hybrid quantum-classical ground state energy optimization', qubits: 2 },
      { id: 'qaoa', name: 'QAOA (Quantum Approximate Optimization)', desc: 'Solves MaxCut graph combinatorial optimization problems', qubits: 3 }
    ]
  },
  {
    category: 'ERROR CORRECTION',
    algos: [
      { id: 'qec', name: 'Repetition Code (QEC)', desc: '3-qubit logical encoding, error injection, syndrome decoding', qubits: 3 }
    ]
  },
  {
    category: 'ADVANCED',
    algos: [
      { id: 'shor', name: 'Educational Shor\'s (N=15)', desc: 'Order-finding quantum period estimator for factoring N=15', qubits: 4 }
    ]
  }
];

export default function AlgorithmModePanel({
  selectedBackend,
  onBuildAlgorithmCircuit,
  onRunAlgorithmSimulation,
  isLoading
}) {
  const [selectedAlgoId, setSelectedAlgoId] = useState('grover');
  const [params, setParams] = useState({
    num_qubits: 2,
    hidden_string: '101',
    oracle_type: 'balanced',
    marked_state: '11',
    iterations: 1,
    is_inverse: false,
    ansatz_type: 'hardware_efficient',
    max_iterations: 30,
    initial_state_bit: 0,
    N: 15,
    a: 2
  });

  const activeAlgo = ALGORITHM_CATEGORIES.flatMap(c => c.algos).find(a => a.id === selectedAlgoId);

  const handleParamChange = (key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{
      display: 'flex',
      gap: '24px',
      padding: '24px',
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--border-subtle)',
      borderRadius: '10px',
      minHeight: '400px',
      boxShadow: 'var(--shadow-xs)'
    }}>
      {/* Category & Algorithm Selector Column */}
      <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px', borderRight: '1px solid var(--border-subtle)', paddingRight: '20px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          ALGORITHM REGISTRY
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '480px' }}>
          {ALGORITHM_CATEGORIES.map(cat => (
            <div key={cat.category} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {cat.category}
              </div>
              {cat.algos.map(algo => {
                const isSelected = selectedAlgoId === algo.id;
                return (
                  <div
                    key={algo.id}
                    onClick={() => setSelectedAlgoId(algo.id)}
                    style={{
                      padding: '10px 12px',
                      backgroundColor: isSelected ? '#EFF6FF' : '#F8FAFC',
                      border: isSelected ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {algo.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {algo.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Algorithm Parameters & Actions */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ padding: '18px 20px', backgroundColor: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800 }}>
              {activeAlgo?.name}
            </h3>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', padding: '3px 8px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '4px', color: 'var(--accent-primary)', fontWeight: 600 }}>
              Backend: {selectedBackend}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '6px', margin: 0, lineHeight: 1.5 }}>
            {activeAlgo?.desc}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            INPUT / ORACLE PARAMETERS
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {selectedAlgoId === 'bernstein_vazirani' && (
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>HIDDEN BITSTRING (s):</label>
                <input
                  type="text"
                  value={params.hidden_string}
                  onChange={e => handleParamChange('hidden_string', e.target.value)}
                  style={{ width: '100%', marginTop: '4px', padding: '8px 12px', background: '#FFFFFF', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>
            )}

            {selectedAlgoId === 'deutsch_jozsa' && (
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>ORACLE TYPE:</label>
                <select
                  value={params.oracle_type}
                  onChange={e => handleParamChange('oracle_type', e.target.value)}
                  style={{ width: '100%', marginTop: '4px', padding: '8px 12px', background: '#FFFFFF', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                >
                  <option value="constant">Constant f(x) = 0</option>
                  <option value="balanced">Balanced f(x) = x₀ ⊕ x₁</option>
                </select>
              </div>
            )}

            {selectedAlgoId === 'grover' && (
              <div>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>TARGET MARKED STATE:</label>
                <input
                  type="text"
                  value={params.marked_state}
                  onChange={e => handleParamChange('marked_state', e.target.value)}
                  style={{ width: '100%', marginTop: '4px', padding: '8px 12px', background: '#FFFFFF', border: '1px solid var(--border-medium)', color: 'var(--text-primary)', borderRadius: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}
                />
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => onBuildAlgorithmCircuit && onBuildAlgorithmCircuit(selectedAlgoId, params)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#FFFFFF',
              color: 'var(--accent-primary)',
              border: '1.5px solid var(--accent-primary)',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            📋 LOAD ONTO CIRCUIT WIRES
          </button>
          <button
            onClick={() => onRunAlgorithmSimulation && onRunAlgorithmSimulation(selectedAlgoId, params)}
            disabled={isLoading}
            style={{
              padding: '10px 24px',
              backgroundColor: 'var(--accent-primary)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-xs)'
            }}
          >
            {isLoading ? 'EXECUTING...' : '▶ DIRECT EXECUTE & SIMULATE'}
          </button>
        </div>
      </div>
    </div>
  );
}
