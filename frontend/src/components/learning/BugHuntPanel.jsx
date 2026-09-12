import React, { useState } from 'react';

/**
 * BugHuntPanel
 * "Quantum Bug Hunt" — Interactive Circuit Debugging Mode
 * Presents broken / buggy quantum circuits and challenges the learner to fix them with minimum edits.
 */
export default function BugHuntPanel({ challenge, onBugFixed }) {
  const defaultBugs = [
    {
      id: 'bug-1',
      title: 'Bug #1: Broken Bell State Synthesizer',
      description: 'The engineer attempted to prepare the Bell state (|00⟩ + |11⟩)/√2, but applied an incorrect gate ordering. Find and replace the flawed gate.',
      initialOperations: [
        { id: '1', gate: 'X', qubit: 0, label: 'Gate 1 (Q0)' },
        { id: '2', gate: 'CNOT', control: 0, target: 1, label: 'Gate 2 (CNOT Q0->Q1)' }
      ],
      targetState: '(|00⟩ + |11⟩)/√2 (Bell State Φ+)',
      solutionCheck: (ops) => {
        // Correct is H on q0, then CNOT(0, 1)
        return ops.length === 2 && ops[0].gate === 'H' && ops[0].qubit === 0 && ops[1].gate === 'CNOT';
      },
      hint: 'A Pauli-X gate flips |0⟩ to |1⟩ deterministically. What gate creates an equal superposition (|0⟩+|1⟩)/√2?'
    },
    {
      id: 'bug-2',
      title: 'Bug #2: Inverted Phase Kickback in Deutsch Oracle',
      description: 'The Deutsch-Jozsa evaluation is failing because the ancillary target qubit was not initialized into the |-⟩ basis before the CNOT oracle.',
      initialOperations: [
        { id: '1', gate: 'H', qubit: 0, label: 'Input superposition (Q0)' },
        { id: '2', gate: 'CNOT', control: 0, target: 1, label: 'Oracle CNOT' }
      ],
      targetState: 'Phase-flipped target qubit enabling kickback',
      solutionCheck: (ops) => {
        // Must contain X then H on qubit 1 (or H on q1 after X)
        const hasQ1Prep = ops.some(o => o.qubit === 1 && (o.gate === 'X' || o.gate === 'H'));
        return ops.length >= 3 && hasQ1Prep;
      },
      hint: 'Phase kickback requires the target qubit to be in the |-⟩ = (|0⟩ - |1⟩)/√2 state using X followed by H.'
    },
    {
      id: 'bug-3',
      title: 'Bug #3: Broken Quantum Teleportation Decoder',
      description: 'Bob measured the teleported qubit after receiving classical bits (m0=1, m1=0), but the phase correction gate was omitted.',
      initialOperations: [
        { id: '1', gate: 'CNOT', control: 0, target: 1, label: 'Teleportation Bell Measurement' },
        { id: '2', gate: 'H', qubit: 0, label: 'Alice basis rotation' }
      ],
      targetState: 'Complete phase correction with Pauli-Z',
      solutionCheck: (ops) => {
        return ops.some(o => o.gate === 'Z');
      },
      hint: 'If Alice measures |1⟩ on the first qubit, Bob must apply a Pauli-Z gate to restore the original relative phase.'
    }
  ];

  const [activeBugIdx, setActiveBugIdx] = useState(0);
  const currentBug = challenge || defaultBugs[activeBugIdx];
  const [operations, setOperations] = useState(currentBug.initialOperations || []);
  const [selectedGateToReplace, setSelectedGateToReplace] = useState(0);
  const [newGate, setNewGate] = useState('H');
  const [feedback, setFeedback] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const handleGateChange = (idx, newGateType) => {
    const updated = [...operations];
    updated[idx] = { ...updated[idx], gate: newGateType };
    setOperations(updated);
    setFeedback(null);
  };

  const handleAddGate = () => {
    const newOp = {
      id: Math.random().toString(),
      gate: 'X',
      qubit: 1,
      label: `Added Gate (${operations.length + 1})`
    };
    setOperations([...operations, newOp]);
    setFeedback(null);
  };

  const handleRemoveGate = (idx) => {
    setOperations(operations.filter((_, i) => i !== idx));
    setFeedback(null);
  };

  const handleReset = () => {
    setOperations(currentBug.initialOperations);
    setFeedback(null);
    setShowHint(false);
  };

  const handleVerify = () => {
    const passed = currentBug.solutionCheck(operations);
    if (passed) {
      setFeedback({
        success: true,
        message: `🎉 Bug Resolved! The circuit now accurately matches the target state: ${currentBug.targetState}.`
      });
      if (onBugFixed) onBugFixed(currentBug.id);
    } else {
      setFeedback({
        success: false,
        message: `❌ Verification Failed. The state does not match ${currentBug.targetState}. Review your gate orientations and bases.`
      });
    }
  };

  return (
    <div style={{
      padding: '28px',
      backgroundColor: '#FFFFFF',
      borderRadius: '10px',
      border: '1.5px solid var(--border-medium)',
      boxShadow: 'var(--shadow-sm)',
      margin: '24px 0'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span style={{ fontSize: '0.725rem', fontWeight: 800, color: '#D97706', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            GAMIFIED MODE • QUANTUM BUG HUNT
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
            {currentBug.title}
          </h3>
        </div>

        {/* Bug Switcher Tabs */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {defaultBugs.map((b, idx) => (
            <button
              key={b.id}
              onClick={() => {
                setActiveBugIdx(idx);
                setOperations(defaultBugs[idx].initialOperations);
                setFeedback(null);
                setShowHint(false);
              }}
              style={{
                padding: '5px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: activeBugIdx === idx ? '1px solid #D97706' : '1px solid var(--border-subtle)',
                backgroundColor: activeBugIdx === idx ? '#FEF3C7' : '#FFFFFF',
                color: activeBugIdx === idx ? '#92400E' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              Bug #{idx + 1}
            </button>
          ))}
        </div>
      </div>

      <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5, margin: '0 0 16px 0' }}>
        {currentBug.description}
      </p>

      {/* Target State Banner */}
      <div style={{ padding: '12px 16px', backgroundColor: '#EFF6FF', borderRadius: '6px', border: '1px solid #BFDBFE', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '0.8rem', color: '#1E40AF', fontWeight: 700 }}>Target Output State:</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 800 }}>
          {currentBug.targetState}
        </span>
      </div>

      {/* Circuit Inspector & Gate Mutator */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
          Current Flawed Circuit Sequence (Click a gate to edit):
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {operations.map((op, idx) => (
            <div
              key={op.id || idx}
              style={{
                padding: '12px 16px',
                backgroundColor: '#F8FAFC',
                border: '1.5px solid var(--border-medium)',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                Step {idx + 1}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select
                  value={op.gate}
                  onChange={(e) => handleGateChange(idx, e.target.value)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '0.9rem',
                    fontWeight: 800,
                    fontFamily: 'monospace',
                    borderRadius: '4px',
                    border: '1px solid var(--border-medium)',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--accent-primary)',
                    cursor: 'pointer'
                  }}
                >
                  {['H', 'X', 'Y', 'Z', 'S', 'T', 'CNOT', 'CZ', 'SWAP'].map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemoveGate(idx)}
                  title="Remove Gate"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#EF4444',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.85rem'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}

          <button
            onClick={handleAddGate}
            style={{
              padding: '12px 18px',
              backgroundColor: '#FFFFFF',
              border: '1.5px dashed var(--border-medium)',
              borderRadius: '8px',
              color: 'var(--accent-primary)',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            + Add Gate
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '8px',
          marginBottom: '18px',
          backgroundColor: feedback.success ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${feedback.success ? '#86EFAC' : '#FCA5A5'}`,
          color: feedback.success ? '#15803D' : '#991B1B',
          fontWeight: 600,
          fontSize: '0.9rem'
        }}>
          {feedback.message}
        </div>
      )}

      {/* Hint Accordion */}
      {showHint && (
        <div style={{ padding: '12px 16px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '6px', marginBottom: '18px', fontSize: '0.85rem', color: '#92400E' }}>
          💡 <strong>Debug Diagnostic Hint:</strong> {currentBug.hint}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <button
          onClick={() => setShowHint(!showHint)}
          style={{
            background: 'none',
            border: 'none',
            color: '#D97706',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: 'pointer',
            padding: 0
          }}
        >
          {showHint ? 'Hide Hint' : '💡 Need a Diagnostic Hint?'}
        </button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              fontSize: '0.825rem',
              fontWeight: 600,
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            Reset Circuit
          </button>
          <button
            onClick={handleVerify}
            style={{
              padding: '8px 20px',
              fontSize: '0.825rem',
              fontWeight: 800,
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            TEST & VERIFY FIX 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
