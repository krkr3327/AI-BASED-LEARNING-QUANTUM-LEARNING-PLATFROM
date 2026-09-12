import React, { useState } from 'react';
import {
  generateQiskitCode,
  generateCirqCode,
  generatePennyLaneCode,
  generateOpenQasm,
  generateJupyterNotebookJSON
} from '../../utils/codeGenerators';

export default function CodeExportModal({ isOpen, onClose, circuitPreset, lessonTitle }) {
  const [activeTab, setActiveTab] = useState('qiskit');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const qiskit = generateQiskitCode(circuitPreset, lessonTitle);
  const cirq = generateCirqCode(circuitPreset, lessonTitle);
  const pennylane = generatePennyLaneCode(circuitPreset, lessonTitle);
  const qasm = generateOpenQasm(circuitPreset);

  const getCode = () => {
    switch (activeTab) {
      case 'qiskit': return qiskit;
      case 'cirq': return cirq;
      case 'pennylane': return pennylane;
      case 'qasm': return qasm;
      default: return qiskit;
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getCode());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownloadNotebook = () => {
    const jsonStr = generateJupyterNotebookJSON(circuitPreset, lessonTitle);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeTitle = (lessonTitle || 'quantum_lesson').toLowerCase().replace(/[^a-z0-9]/g, '_');
    a.download = `${safeTitle}.ipynb`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
              MULTI-FRAMEWORK CODE EXPORT
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 700 }}>
              Export Circuit & Python Simulations
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.4rem',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Selection */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '12px 24px',
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid var(--border-subtle)',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'qiskit', label: 'IBM Qiskit (Python)' },
            { id: 'cirq', label: 'Google Cirq' },
            { id: 'pennylane', label: 'Xanadu PennyLane' },
            { id: 'qasm', label: 'OpenQASM 2.0' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 600,
                borderRadius: '6px',
                border: activeTab === tab.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                backgroundColor: activeTab === tab.id ? 'var(--accent-primary)' : '#FFFFFF',
                color: activeTab === tab.id ? '#FFFFFF' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
          <pre style={{
            margin: 0,
            padding: '18px',
            backgroundColor: '#0F172A',
            color: '#E2E8F0',
            borderRadius: '8px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            overflowX: 'auto',
            maxHeight: '400px'
          }}>
            {getCode()}
          </pre>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <button
            onClick={handleDownloadNotebook}
            style={{
              padding: '9px 18px',
              fontSize: '0.825rem',
              fontWeight: 700,
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            ⬇ Download .ipynb (Jupyter Notebook)
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleCopy}
              style={{
                padding: '9px 18px',
                fontSize: '0.825rem',
                fontWeight: 700,
                backgroundColor: copied ? '#15803D' : 'var(--accent-primary)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {copied ? '✓ COPIED TO CLIPBOARD' : 'COPY CODE'}
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '9px 16px',
                fontSize: '0.825rem',
                fontWeight: 600,
                backgroundColor: '#FFFFFF',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
