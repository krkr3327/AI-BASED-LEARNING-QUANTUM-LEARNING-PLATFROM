import React from 'react';

export default function ExperimentModePanel({
  onRunParallelSimulation,
  parallelResults,
  isLoading
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '24px',
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--border-subtle)',
      borderRadius: '10px',
      minHeight: '400px',
      boxShadow: 'var(--shadow-xs)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: '1.2rem', fontWeight: 800 }}>
            ADVANCED EXPERIMENTS WORKBENCH
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', margin: 0 }}>
            Compare cross-backend execution results across Custom M1, Qiskit Aer, PennyLane, and Cirq simulators simultaneously.
          </p>
        </div>

        <button
          onClick={onRunParallelSimulation}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: 'var(--accent-primary)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          {isLoading ? 'RUNNING CROSS-BACKEND...' : '⚡ RUN PARALLEL COMPARISON'}
        </button>
      </div>

      {parallelResults ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
          {Object.entries(parallelResults.results || {}).map(([bName, bRes]) => (
            <div key={bName} style={{ padding: '16px', backgroundColor: '#F8FAFC', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  {bName}
                </span>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#15803D', fontWeight: 700 }}>
                  {bRes.status}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                <div>Sample: <strong>|{bRes.measurement || 'N/A'}⟩</strong></div>
                <div>Runtime: <strong>{bRes.execution_time_ms ? `${bRes.execution_time_ms.toFixed(2)} ms` : 'N/A'}</strong></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '260px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
            Click "RUN PARALLEL COMPARISON" to dispatch circuit execution across all backends.
          </p>
        </div>
      )}
    </div>
  );
}
