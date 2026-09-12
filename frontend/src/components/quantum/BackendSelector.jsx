import React, { useState, useRef, useEffect } from 'react';

const BACKENDS = [
  { id: 'custom_m1', name: 'NumPy Engine', tag: 'custom_m1', type: 'Local Statevector', badge: 'Fast' },
  { id: 'qiskit_aer', name: 'Qiskit Aer', tag: 'qiskit_aer', type: 'IBM Quantum SDK', badge: 'Aer' },
  { id: 'pennylane', name: 'PennyLane', tag: 'pennylane', type: 'Xanadu QML Engine', badge: 'AutoGrad' },
  { id: 'cirq', name: 'Google Cirq', tag: 'cirq', type: 'Noisy Quantum Sim', badge: 'Cirq' },
  { id: 'qbraid', name: 'qBraid Platform', tag: 'qbraid', type: 'Cloud Quantum Hub', badge: 'Cloud' },
];

export default function BackendSelector({ selectedBackend, onBackendChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const current = BACKENDS.find(b => b.id === selectedBackend) || BACKENDS[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          backgroundColor: '#FFFFFF',
          color: '#0F172A',
          border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-medium)',
          borderRadius: '6px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.825rem',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: 'var(--shadow-xs)',
          transition: 'all 0.15s ease'
        }}
      >
        <span style={{
          width: '7px',
          height: '7px',
          borderRadius: '50%',
          backgroundColor: '#10B981',
          display: 'inline-block'
        }}></span>
        <span>{current.name}</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>
          ({current.tag})
        </span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ 
            color: 'var(--text-muted)', 
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', 
            transition: 'transform 0.15s ease',
            marginLeft: '4px'
          }}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          minWidth: '240px',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-medium)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-lg)',
          padding: '4px',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <div style={{ 
            padding: '4px 8px 6px', 
            fontSize: '0.7rem', 
            fontWeight: 700, 
            color: 'var(--text-muted)', 
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            borderBottom: '1px solid var(--border-subtle)'
          }}>
            Select Quantum Runtime
          </div>
          {BACKENDS.map((backend) => {
            const isSelected = backend.id === selectedBackend;
            return (
              <button
                key={backend.id}
                type="button"
                onClick={() => {
                  onBackendChange(backend.id);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  backgroundColor: isSelected ? 'var(--bg-hover)' : 'transparent',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.1s ease',
                  width: '100%'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div>
                  <div style={{
                    fontSize: '0.825rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    {backend.name} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({backend.tag})</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-light)' }}>
                    {backend.type}
                  </div>
                </div>

                <span style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  backgroundColor: isSelected ? '#DBEAFE' : 'var(--bg-workspace)',
                  color: isSelected ? '#1E40AF' : 'var(--text-secondary)'
                }}>
                  {backend.badge}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
