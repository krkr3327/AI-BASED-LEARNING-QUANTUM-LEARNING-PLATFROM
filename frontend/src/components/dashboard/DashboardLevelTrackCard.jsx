import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurriculumTracks, fetchLevel, setUserLevel } from '../../services/learningApi';

export default function DashboardLevelTrackCard() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState(null);
  const [userLevel, setUserLevelState] = useState('Beginner');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [trackData, levelData] = await Promise.all([
        fetchCurriculumTracks(),
        fetchLevel()
      ]);
      if (trackData) setTracks(trackData);
      if (levelData?.level) setUserLevelState(levelData.level);
    } catch (e) {
      console.warn('Failed to load level tracks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleLevelChanged = (e) => {
      if (e.detail?.level) {
        setUserLevelState(e.detail.level);
        loadData();
      }
    };
    window.addEventListener('learning:level_changed', handleLevelChanged);
    return () => window.removeEventListener('learning:level_changed', handleLevelChanged);
  }, []);

  const handleSelectTrack = async (levelKey) => {
    setUserLevelState(levelKey);
    await setUserLevel(levelKey);
  };

  if (!tracks) return null;

  const activeTrack = tracks[userLevel] || tracks['Beginner'];

  return (
    <div className="pf-glass-card" style={{
      padding: '28px 32px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)' }}>
            DYNAMIC ACADEMIC PATH • LEVEL ADAPTATION
          </div>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.3rem', fontWeight: 800, color: '#0F172A' }}>
            Personalized Curriculum &amp; Challenge Tracks
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: '#64748B' }}>
            Switch your level tier to automatically adapt courses, quiz difficulties, lab circuit presets, and AI tutor explanations.
          </p>
        </div>

        {/* Level Quick Switcher Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Beginner', 'Intermediate', 'Advanced'].map(lvl => {
            const isSelected = userLevel.toLowerCase() === lvl.toLowerCase();
            const colors = {
              Beginner: { text: '#15803D', border: '#BBF7D0', bg: 'rgba(240, 253, 244, 0.85)' },
              Intermediate: { text: '#2563EB', border: '#BFDBFE', bg: 'rgba(239, 246, 255, 0.85)' },
              Advanced: { text: '#92400E', border: '#FDE68A', bg: 'rgba(254, 243, 199, 0.85)' }
            }[lvl];

            return (
              <button
                key={lvl}
                type="button"
                onClick={() => handleSelectTrack(lvl)}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  border: isSelected ? `2px solid ${colors.text}` : '1px solid rgba(226, 232, 240, 0.8)',
                  backgroundColor: isSelected ? colors.bg : 'rgba(255, 255, 255, 0.6)',
                  color: isSelected ? colors.text : '#64748B',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? `0 2px 10px ${colors.text}25` : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{lvl === 'Beginner' ? '⚛️' : lvl === 'Intermediate' ? '🔗' : '🛡️'}</span>
                <span>{lvl}</span>
                {isSelected && <span>✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 Track Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {Object.entries(tracks).map(([key, trk]) => {
          const isSelected = userLevel.toLowerCase() === key.toLowerCase();
          const colors = {
            Beginner: { accent: '#10B981', border: '#A7F3D0', bg: 'rgba(236, 253, 245, 0.75)' },
            Intermediate: { accent: '#2563EB', border: '#BFDBFE', bg: 'rgba(239, 246, 255, 0.75)' },
            Advanced: { accent: '#7C3AED', border: '#DDD6FE', bg: 'rgba(245, 243, 255, 0.75)' }
          }[key] || { accent: '#2563EB', border: '#BFDBFE', bg: 'rgba(239, 246, 255, 0.75)' };

          return (
            <div
              key={key}
              onClick={() => handleSelectTrack(key)}
              style={{
                position: 'relative',
                padding: '22px',
                borderRadius: '14px',
                border: isSelected ? `2px solid ${colors.accent}` : '1px solid rgba(226, 232, 240, 0.8)',
                backgroundColor: isSelected ? colors.bg : 'rgba(255, 255, 255, 0.65)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px',
                boxShadow: isSelected ? `0 4px 16px ${colors.accent}25` : '0 2px 8px rgba(15, 23, 42, 0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: colors.accent, fontFamily: 'var(--font-mono)' }}>
                    {trk.badge}
                  </span>
                  {isSelected && (
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, backgroundColor: colors.accent, color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                      ACTIVE
                    </span>
                  )}
                </div>

                <h4 style={{ margin: '0 0 6px 0', fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
                  {trk.title}
                </h4>

                <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: '#64748B', lineHeight: 1.45 }}>
                  {trk.description}
                </p>

                <div style={{ padding: '8px 10px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.78rem', color: '#334155' }}>
                  <strong style={{ color: colors.accent }}>Focus: </strong> {trk.recommended_focus}
                </div>
              </div>

              <div>
                {/* Progress Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>
                  <span>Track Progress</span>
                  <span>{trk.completed_lessons}/{trk.total_lessons} Lessons ({trk.progress_percent}%)</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${trk.progress_percent}%`, height: '100%', backgroundColor: colors.accent, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/learn`);
                  }}
                  style={{
                    width: '100%',
                    marginTop: '14px',
                    padding: '8px 12px',
                    backgroundColor: isSelected ? colors.accent : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : colors.accent,
                    border: isSelected ? 'none' : `1px solid ${colors.border}`,
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.15s ease'
                  }}
                >
                  {isSelected ? `Continue ${key} Curriculum →` : `View ${key} Track →`}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
