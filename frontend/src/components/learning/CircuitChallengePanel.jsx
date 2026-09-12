import React, { useState } from 'react';
import { submitChallenge } from '../../services/learningApi';

export default function CircuitChallengePanel({ exercise, onCompleted }) {
  // Gate palette for interactive construction
  const availableGates = ['H', 'X', 'Y', 'Z', 'S', 'T', 'CNOT'];
  
  // Circuit operations built by user
  const [gates, setGates] = useState([]);
  const [numQubits, setNumQubits] = useState(2);
  const [targetQubit, setTargetQubit] = useState(0);
  const [controlQubit, setControlQubit] = useState(0);
  const [selectedGate, setSelectedGate] = useState('H');
  
  // Submission & evaluation state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);

  if (!exercise) return null;

  const handleAddGate = () => {
    let op = { type: 'gate', gate: selectedGate };
    if (selectedGate === 'CNOT') {
      if (controlQubit === targetQubit) {
        setError('Control and target qubits must be different for CNOT.');
        return;
      }
      op.qubits = [controlQubit, targetQubit];
    } else {
      op.qubits = [targetQubit];
    }
    setError(null);
    setGates([...gates, op]);
  };

  const handleRemoveGate = (idx) => {
    setGates(gates.filter((_, i) => i !== idx));
  };

  const handleClear = () => {
    setGates([]);
    setEvaluation(null);
    setError(null);
  };

  const handleSubmit = async () => {
    const qast = {
      num_qubits: numQubits,
      operations: gates
    };

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitChallenge(exercise.id, qast);
      setEvaluation(result);
      if (onCompleted) onCompleted(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '32px', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Interactive Circuit Challenge — Server-side Evaluated
        </span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {exercise.difficulty || 'Foundational'}
        </span>
      </div>

      <h4 style={{ fontSize: '1.25rem', marginBottom: '12px', color: 'var(--text-primary)' }}>
        {exercise.question}
      </h4>

      {exercise.target_description && (
        <div style={{ padding: '12px 16px', backgroundColor: 'rgba(6, 182, 212, 0.08)', borderLeft: '3px solid var(--accent-secondary)', borderRadius: '4px', marginBottom: '20px', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
          <strong>Target Specification:</strong> {exercise.target_description}
        </div>
      )}

      {/* Mini Circuit Construction Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '20px', padding: '16px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Qubits:</label>
        <select value={numQubits} onChange={e => setNumQubits(parseInt(e.target.value))} style={{ padding: '6px 10px', backgroundColor: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
          <option value={1}>1 Qubit</option>
          <option value={2}>2 Qubits</option>
          <option value={3}>3 Qubits</option>
        </select>

        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Gate:</label>
        <select value={selectedGate} onChange={e => setSelectedGate(e.target.value)} style={{ padding: '6px 10px', backgroundColor: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
          {availableGates.map(g => <option key={g} value={g}>{g}</option>)}
        </select>

        {selectedGate === 'CNOT' ? (
          <>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Control q:</label>
            <select value={controlQubit} onChange={e => setControlQubit(parseInt(e.target.value))} style={{ padding: '6px 10px', backgroundColor: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              {Array.from({ length: numQubits }, (_, i) => <option key={i} value={i}>q{i}</option>)}
            </select>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Target q:</label>
            <select value={targetQubit} onChange={e => setTargetQubit(parseInt(e.target.value))} style={{ padding: '6px 10px', backgroundColor: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              {Array.from({ length: numQubits }, (_, i) => <option key={i} value={i}>q{i}</option>)}
            </select>
          </>
        ) : (
          <>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>On q:</label>
            <select value={targetQubit} onChange={e => setTargetQubit(parseInt(e.target.value))} style={{ padding: '6px 10px', backgroundColor: 'var(--bg-panel)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', borderRadius: '4px' }}>
              {Array.from({ length: numQubits }, (_, i) => <option key={i} value={i}>q{i}</option>)}
            </select>
          </>
        )}

        <button className="btn btn-primary" onClick={handleAddGate} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          + Add Gate
        </button>

        <button className="btn" onClick={handleClear} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          Clear
        </button>
      </div>

      {/* Circuit Representation Display */}
      <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#07090E', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'monospace' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Submitted Q-AST Sequence:</div>
        {gates.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>No gates added yet. Select a gate and click "+ Add Gate".</div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {gates.map((op, idx) => (
              <span 
                key={idx} 
                style={{ 
                  padding: '6px 12px', 
                  backgroundColor: 'rgba(139, 92, 246, 0.15)', 
                  border: '1px solid var(--accent-primary)', 
                  borderRadius: '4px',
                  color: 'white',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {op.gate} {op.qubits ? `(${op.qubits.map(q => `q${q}`).join(', ')})` : ''}
                <button 
                  onClick={() => handleRemoveGate(idx)} 
                  style={{ background: 'none', border: 'none', color: 'var(--gate-x)', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div style={{ marginBottom: '16px', color: 'var(--gate-x)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {/* Evaluation Results */}
      {evaluation && (
        <div 
          style={{
            padding: '20px',
            backgroundColor: evaluation.is_correct ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderRadius: '6px',
            border: `1px solid ${evaluation.is_correct ? 'var(--gate-y)' : 'var(--gate-x)'}`,
            marginBottom: '20px'
          }}
        >
          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: evaluation.is_correct ? 'var(--gate-y)' : 'var(--gate-x)', marginBottom: '8px' }}>
            {evaluation.is_correct ? '✓ Challenge Passed!' : '✗ Evaluation Failed'}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '12px' }}>
            {evaluation.explanation}
          </div>
          {evaluation.details && (
            <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: '10px 14px', borderRadius: '4px', fontFamily: 'monospace' }}>
              <div>Evaluated Backend: {evaluation.details.backend || 'custom_m1'}</div>
              <div>Probabilities: {JSON.stringify(evaluation.details.probabilities || {})}</div>
            </div>
          )}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={isSubmitting || gates.length === 0}
      >
        {isSubmitting ? 'Simulating & Evaluating...' : 'EVALUATE CIRCUIT (SIMULATOR)'}
      </button>
    </div>
  );
}
