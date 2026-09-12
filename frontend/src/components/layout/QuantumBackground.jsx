import React from 'react';

export default function QuantumBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: -1,
      pointerEvents: 'none',
      backgroundColor: 'var(--bg-primary)',
      overflow: 'hidden'
    }}>
      {/* Background scientific grid */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: 'linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.5
      }}></div>

      {/* Subtle Electric Violet Glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '600px',
        height: '600px',
        backgroundColor: 'var(--accent-primary)',
        borderRadius: '50%',
        filter: 'blur(150px)',
        opacity: 0.15
      }}></div>

      {/* Subtle Quantum Cyan Glow */}
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '5%',
        width: '500px',
        height: '500px',
        backgroundColor: 'var(--accent-secondary)',
        borderRadius: '50%',
        filter: 'blur(120px)',
        opacity: 0.1
      }}></div>

      {/* Subtle Magenta Glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '800px',
        height: '300px',
        backgroundColor: 'var(--accent-magenta)',
        borderRadius: '50%',
        filter: 'blur(180px)',
        opacity: 0.08
      }}></div>

      {/* Some circuit trace lines */}
      <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, opacity: 0.2 }}>
        <path d="M 0 120 L 200 120 L 250 170 L 1000 170" fill="none" stroke="var(--accent-secondary)" strokeWidth="1" />
        <path d="M -50 400 L 150 400 L 200 350 L 800 350" fill="none" stroke="var(--accent-primary)" strokeWidth="1" />
      </svg>
    </div>
  );
}
