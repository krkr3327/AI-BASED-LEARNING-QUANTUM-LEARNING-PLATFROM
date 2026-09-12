import React, { useState, useEffect } from 'react';

export default function QuantumCodeEditor({ code, onChangeCode, onCompile, error }) {
  const [localCode, setLocalCode] = useState(code || '');

  useEffect(() => {
    setLocalCode(code || '');
  }, [code]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalCode(val);
    if (onChangeCode) onChangeCode(val);
  };

  const lines = localCode.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
      {/* Code Editor Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'rgba(5, 5, 10, 0.6)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'monospace' }}>
            Quantum Code Editor (Q-AST Compiler)
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Syntax: OpenQASM / Q-AST Text</span>
        </div>
        {onCompile && (
          <button 
            className="btn btn-primary" 
            onClick={() => onCompile(localCode)}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            COMPILE CODE TO CANVAS
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '10px 16px', backgroundColor: 'rgba(239, 68, 68, 0.12)', borderBottom: '1px solid var(--gate-x)', color: 'var(--gate-x)', fontSize: '0.85rem', fontFamily: 'monospace' }}>
          ⚠️ Syntax Error: {typeof error === 'object' ? (error.message || JSON.stringify(error)) : error}
        </div>
      )}

      {/* Code Textarea with Line Numbers */}
      <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden', minHeight: '300px' }}>
        {/* Line Numbers Column */}
        <div style={{ width: '44px', backgroundColor: 'rgba(0, 0, 0, 0.3)', borderRight: '1px solid var(--border-subtle)', padding: '16px 0', textAlign: 'right', userSelect: 'none', fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {lines.map((_, idx) => (
            <div key={idx} style={{ paddingRight: '8px', lineHeight: '1.6' }}>{idx + 1}</div>
          ))}
        </div>

        {/* Text Area */}
        <textarea
          value={localCode}
          onChange={handleChange}
          placeholder={`# Quantum Circuit Code Example:\nqubits 2\nH q[0]\nCNOT q[0], q[1]\nM q[0]`}
          style={{
            flex: 1,
            padding: '16px',
            backgroundColor: '#07090E',
            color: '#e2e8f0',
            border: 'none',
            outline: 'none',
            fontFamily: 'Consolas, Monaco, "Andale Mono", monospace',
            fontSize: '0.95rem',
            lineHeight: '1.6',
            resize: 'none',
            whiteSpace: 'pre',
            tabSize: 2
          }}
        />
      </div>

      <div style={{ padding: '8px 16px', backgroundColor: 'rgba(0,0,0,0.4)', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between' }}>
        <span>Line Count: {lines.length}</span>
        <span>Target: Q-AST Single Source of Truth</span>
      </div>
    </div>
  );
}
