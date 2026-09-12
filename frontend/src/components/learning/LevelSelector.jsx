import React, { useState, useEffect } from 'react';
import { fetchLevel, setUserLevel } from '../../services/learningApi';

const LEVELS = [
  {
    id: 'Beginner',
    label: 'Beginner',
    icon: '⚛️',
    tag: 'Qubit Foundations',
    desc: 'Foundations, Qubits & Bloch Sphere',
    accentColor: '#10B981',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0'
  },
  {
    id: 'Intermediate',
    label: 'Intermediate',
    icon: '🔗',
    tag: 'Circuits & Algorithms',
    desc: 'Entanglement, Grover & Oracles',
    accentColor: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE'
  },
  {
    id: 'Advanced',
    label: 'Advanced',
    icon: '🛡️',
    tag: 'Fault Tolerance & QEC',
    desc: 'Surface Codes, VQE, QFT & QML',
    accentColor: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE'
  }
];

export default function LevelSelector({ compact = false, showDetails = true, onLevelChange }) {
  const [activeLevel, setActiveLevel] = useState('Beginner');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadLevel() {
      const data = await fetchLevel();
      if (isMounted && data?.level) {
        setActiveLevel(data.level);
      }
    }
    loadLevel();

    const handleLevelChanged = (e) => {
      if (e.detail?.level) {
        setActiveLevel(e.detail.level);
      }
    };
    window.addEventListener('learning:level_changed', handleLevelChanged);
    return () => {
      isMounted = false;
      window.removeEventListener('learning:level_changed', handleLevelChanged);
    };
  }, []);

  const handleSelectLevel = async (levelId) => {
    if (levelId === activeLevel || isUpdating) return;
    setIsUpdating(true);
    setActiveLevel(levelId);
    try {
      await setUserLevel(levelId);
      if (onLevelChange) {
        onLevelChange(levelId);
      }
    } catch (err) {
      console.error('Failed to update level:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (compact) {
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        borderRadius: '20px',
        padding: '3px',
        border: '1px solid #E2E8F0',
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)'
      }}>
        {LEVELS.map(lvl => {
          const isSelected = activeLevel.toLowerCase() === lvl.id.toLowerCase();
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => handleSelectLevel(lvl.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '16px',
                border: isSelected ? `1px solid ${lvl.borderColor}` : '1px solid transparent',
                backgroundColor: isSelected ? '#FFFFFF' : 'transparent',
                color: isSelected ? lvl.accentColor : '#64748B',
                fontSize: '0.78rem',
                fontWeight: isSelected ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'
              }}
              title={`Switch to ${lvl.label} learning track`}
            >
              <span style={{ fontSize: '0.85rem' }}>{lvl.icon}</span>
              <span>{lvl.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      padding: '20px 24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            ADAPTIVE LEARNING TIER
          </div>
          <h3 style={{ margin: '2px 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
            Select Your Target Experience Level
          </h3>
        </div>
        <div style={{ fontSize: '0.82rem', color: '#64748B', maxWidth: '380px', textAlign: 'right' }}>
          Courses, assessments, lab presets, and AI explanations dynamically tailor to your selected tier.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
        {LEVELS.map(lvl => {
          const isSelected = activeLevel.toLowerCase() === lvl.id.toLowerCase();
          return (
            <div
              key={lvl.id}
              onClick={() => handleSelectLevel(lvl.id)}
              style={{
                position: 'relative',
                padding: '16px',
                borderRadius: '10px',
                border: isSelected ? `2px solid ${lvl.accentColor}` : '1px solid #E2E8F0',
                backgroundColor: isSelected ? lvl.bgColor : '#FAFAFA',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: isSelected ? `0 4px 12px ${lvl.accentColor}25` : 'none',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  backgroundColor: lvl.accentColor,
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  ACTIVE TIER ✓
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ fontSize: '1.4rem' }}>{lvl.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>
                    {lvl.label}
                  </div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: lvl.accentColor, textTransform: 'uppercase' }}>
                    {lvl.tag}
                  </div>
                </div>
              </div>

              {showDetails && (
                <p style={{ margin: '8px 0 0 0', fontSize: '0.8rem', color: '#64748B', lineHeight: 1.45 }}>
                  {lvl.desc}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
