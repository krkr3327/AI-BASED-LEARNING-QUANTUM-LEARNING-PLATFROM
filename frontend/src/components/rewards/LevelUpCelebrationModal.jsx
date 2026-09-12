import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LevelUpCelebrationModal() {
  const navigate = useNavigate();
  const [levelUpData, setLevelUpData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleLevelUp = (e) => {
      if (e.detail?.new_level) {
        setLevelUpData(e.detail);
        setIsOpen(true);
      }
    };
    window.addEventListener('learning:level_up', handleLevelUp);
    return () => window.removeEventListener('learning:level_up', handleLevelUp);
  }, []);

  if (!isOpen || !levelUpData) return null;

  const newLevel = levelUpData.new_level || 'Intermediate';
  const prevLevel = levelUpData.previous_level || 'Beginner';

  const levelDetails = {
    Intermediate: {
      badge: '⚡ PRACTITIONER TIER',
      color: '#2563EB',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
      lightBg: '#EFF6FF',
      border: '#BFDBFE',
      unlockedPillars: 'Pillars 5 to 9 (Circuits, Entanglement & Landmark Oracles)',
      unlockedFeatures: [
        'Bell States & Multi-Qubit Entanglement circuits',
        'Quantum Teleportation & Phase Kickback algorithms',
        'Deutsch-Jozsa & Grover 3-Qubit Search simulations',
        'Intermediate Quantum Lab Presets & Benchmarks'
      ]
    },
    Advanced: {
      badge: '🚀 ARCHITECT TIER',
      color: '#7C3AED',
      gradient: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
      lightBg: '#F5F3FF',
      border: '#DDD6FE',
      unlockedPillars: 'Pillars 10 to 20 (Fault Tolerance, QEC, VQE & Frontier)',
      unlockedFeatures: [
        'Surface Code Quantum Error Correction & syndrome extraction',
        'Variational Quantum Eigensolver (VQE) ground state chemistry',
        'Quantum Fourier Transform (QFT) & Shor\'s factoring machinery',
        'Quantum Machine Learning (QML) & QKD cryptography'
      ]
    }
  }[newLevel] || {
    badge: '🚀 NEW TIER UNLOCKED',
    color: '#2563EB',
    gradient: 'linear-gradient(135deg, #2563EB, #7C3AED)',
    lightBg: '#EFF6FF',
    border: '#BFDBFE',
    unlockedPillars: 'Next Stage Academic Curriculum',
    unlockedFeatures: ['New interactive algorithms', 'New lab challenges', 'New AI tutoring depth']
  };

  const handleProceed = () => {
    setIsOpen(false);
    navigate('/learn');
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px',
      animation: 'fadeIn 0.25s ease'
    }}>
      <div style={{
        maxWidth: '540px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        border: `2px solid ${levelDetails.border}`,
        overflow: 'hidden',
        textAlign: 'center',
        animation: 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Banner Header */}
        <div style={{
          background: levelDetails.gradient,
          padding: '32px 24px',
          color: '#FFFFFF',
          position: 'relative'
        }}>
          <div style={{
            fontSize: '3.5rem',
            marginBottom: '8px',
            animation: 'bounce 1s infinite alternate'
          }}>
            🎉
          </div>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            opacity: 0.9,
            fontFamily: 'monospace'
          }}>
            ACADEMIC ADVANCEMENT & PROMOTION
          </div>
          <h2 style={{
            fontSize: '2rem',
            margin: '6px 0 0 0',
            fontWeight: 800,
            letterSpacing: '-0.02em'
          }}>
            LEVEL UP: {newLevel.toUpperCase()}!
          </h2>
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px 32px' }}>
          <p style={{
            fontSize: '1rem',
            color: '#334155',
            lineHeight: 1.6,
            margin: '0 0 20px 0'
          }}>
            {levelUpData.message || `You have mastered all ${prevLevel} coursework. Your account has officially promoted to the ${newLevel} track!`}
          </p>

          {/* XP & Rewards Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 18px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #FDE68A',
            borderRadius: '24px',
            color: '#B45309',
            fontWeight: 800,
            fontSize: '0.9rem',
            marginBottom: '20px'
          }}>
            <span>⭐ LEVEL UP BONUS:</span>
            <span>+500 XP EARNED</span>
          </div>

          {/* Unlocked Capabilities Box */}
          <div style={{
            textAlign: 'left',
            backgroundColor: levelDetails.lightBg,
            border: `1px solid ${levelDetails.border}`,
            borderRadius: '10px',
            padding: '16px 20px',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: levelDetails.color,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '8px'
            }}>
              ✨ UNLOCKED IN {newLevel.toUpperCase()} TIER:
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
              {levelDetails.unlockedPillars}
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.82rem', color: '#475569', lineHeight: 1.5 }}>
              {levelDetails.unlockedFeatures.map((feat, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{feat}</li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={handleProceed}
              style={{
                padding: '12px 28px',
                background: levelDetails.gradient,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: `0 4px 14px ${levelDetails.color}40`,
                transition: 'all 0.15s ease'
              }}
            >
              EXPLORE {newLevel.toUpperCase()} CURRICULUM →
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
