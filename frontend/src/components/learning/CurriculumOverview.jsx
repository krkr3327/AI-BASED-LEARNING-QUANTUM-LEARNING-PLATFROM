import React, { useState, useEffect } from 'react';
import MasteryBadge from './MasteryBadge';
import LevelSelector from './LevelSelector';
import { fetchLevel } from '../../services/learningApi';

const LEVEL_CATEGORIES = [
  { id: 'all', label: '🌐 All 20 Pillars', range: [1, 20], level: 'All' },
  { id: 'beginner', label: '🌱 Beginner Track (Pillars 1–4)', range: [1, 4], level: 'Beginner' },
  { id: 'intermediate', label: '⚡ Intermediate Track (Pillars 5–9)', range: [5, 9], level: 'Intermediate' },
  { id: 'advanced', label: '🚀 Advanced Track (Pillars 10–20)', range: [10, 20], level: 'Advanced' },
  { id: 'foundations', label: '1. Foundations & Principles', range: [1, 4], level: 'Beginner' },
  { id: 'circuits', label: '2. Circuits & Mechanics', range: [5, 7], level: 'Intermediate' },
  { id: 'algorithms', label: '3. Algorithms & NISQ', range: [8, 9], level: 'Intermediate' },
  { id: 'hardware_qec', label: '4. Error, Hardware & Software', range: [10, 13], level: 'Advanced' },
  { id: 'applied', label: '5. Advantages & Applications', range: [14, 17], level: 'Advanced' },
  { id: 'frontier', label: '6. Frontier (QML, QKD & Chemistry)', range: [18, 20], level: 'Advanced' },
];

export default function CurriculumOverview({ modules, progress, mastery, studentLevel, onSelectLesson }) {
  const [userLevel, setUserLevel] = useState(studentLevel || 'Beginner');
  const [activeCategory, setActiveCategory] = useState((studentLevel || 'Beginner').toLowerCase());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (studentLevel) {
      setUserLevel(studentLevel);
      setActiveCategory(studentLevel.toLowerCase());
      return;
    }
    async function loadLvl() {
      const data = await fetchLevel();
      if (data?.level) {
        setUserLevel(data.level);
        setActiveCategory(data.level.toLowerCase());
      }
    }
    loadLvl();
  }, [studentLevel]);

  useEffect(() => {
    const handleLevelChanged = (e) => {
      if (e.detail?.level) {
        const lvl = e.detail.level;
        setUserLevel(lvl);
        setActiveCategory(lvl.toLowerCase());
      }
    };
    window.addEventListener('learning:level_changed', handleLevelChanged);
    return () => window.removeEventListener('learning:level_changed', handleLevelChanged);
  }, []);

  const getModuleLevel = (order) => {
    if (order <= 4) return { level: 'Beginner', badge: '🌱 Beginner', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' };
    if (order <= 9) return { level: 'Intermediate', badge: '⚡ Intermediate', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' };
    return { level: 'Advanced', badge: '🚀 Advanced', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' };
  };

  if (!modules || modules.length === 0) {
    return (
      <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading curriculum modules...
      </div>
    );
  }

  // Strict level isolation: only display categories for the active level tier
  const availableCategories = LEVEL_CATEGORIES.filter(c => c.level.toLowerCase() === userLevel.toLowerCase());
  const currentCat = availableCategories.find(c => c.id === activeCategory) || availableCategories[0] || LEVEL_CATEGORIES[1];

  const filteredModules = modules.filter(mod => {
    const order = mod.order || 1;
    const lvlInfo = getModuleLevel(order);

    // Strict level isolation: intermediate and advanced modules must not appear in beginner account
    if (lvlInfo.level.toLowerCase() !== userLevel.toLowerCase()) {
      return false;
    }

    const inCategory = order >= currentCat.range[0] && order <= currentCat.range[1];
    if (!inCategory && activeCategory !== userLevel.toLowerCase()) return false;

    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const matchesMod = mod.title.toLowerCase().includes(query) || (mod.description && mod.description.toLowerCase().includes(query));
    const matchesLessons = (mod.lessons || []).some(l => 
      l.title.toLowerCase().includes(query) || (l.description && l.description.toLowerCase().includes(query))
    );
    return matchesMod || matchesLessons;
  });

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const completedCount = progress?.completed_lessons?.length || 0;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const trackTotalLessons = filteredModules.reduce((s, m) => s + (m.lessons?.length || 0), 0);
  const trackCompletedLessons = filteredModules.reduce((s, m) => {
    const completedInMod = (m.lessons || []).filter(l => (progress?.completed_lessons || []).includes(l.id)).length;
    return s + completedInMod;
  }, 0);
  const isTrackFullyCompleted = trackTotalLessons > 0 && trackCompletedLessons >= trackTotalLessons;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          ACADEMIC CURRICULUM • {userLevel.toUpperCase()} LEARNING PATH
        </div>
        <h1 style={{ fontSize: '2.4rem', marginBottom: '10px', letterSpacing: '-0.03em', color: 'var(--text-primary)', fontWeight: 800 }}>
          {userLevel === 'Beginner' ? '🌱 Beginner Quantum Foundations Track' : userLevel === 'Intermediate' ? '⚡ Intermediate Quantum Circuits Track' : '🚀 Advanced Quantum Architecture Track'}
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '820px', lineHeight: 1.6, margin: 0 }}>
          {userLevel === 'Beginner'
            ? 'Curated exclusively for Beginner accounts: Master physical quantum mechanics, superposition, Bloch sphere statevectors, and single-qubit unitary operations without intermediate/advanced complexity.'
            : userLevel === 'Intermediate'
            ? 'Curated for Intermediate accounts: Master multi-qubit entanglement, Bell states, quantum teleportation, phase kickback, and landmark oracles (Deutsch-Jozsa, Grover).'
            : 'Curated for Advanced accounts: Master Fault-Tolerant Quantum Computing, Surface Code error correction, VQE/QAOA NISQ algorithms, and QML.'}
        </p>

        {/* Strict Level Banner */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: userLevel === 'Beginner' ? '#ECFDF5' : userLevel === 'Intermediate' ? '#EFF6FF' : '#F5F3FF', border: `1px solid ${userLevel === 'Beginner' ? '#A7F3D0' : userLevel === 'Intermediate' ? '#BFDBFE' : '#DDD6FE'}`, borderRadius: '8px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: userLevel === 'Beginner' ? '#065F46' : userLevel === 'Intermediate' ? '#1E40AF' : '#5B21B6' }}>
            <span>🔒 Strict Level Isolation Active:</span>
            <span>Showing ONLY {userLevel} coursework ({userLevel === 'Beginner' ? 'Pillars 1–4' : userLevel === 'Intermediate' ? 'Pillars 5–9' : 'Pillars 10–20'}). Intermediate & other tiers are strictly locked.</span>
          </div>
        </div>

        {/* Track Completion Promotion Banner */}
        {isTrackFullyCompleted && (
          <div style={{
            marginTop: '18px',
            padding: '20px 24px',
            backgroundColor: '#FEF3C7',
            border: '2px solid #F59E0B',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
                🎉 TRACK 100% MASTERED • LEVEL ADVANCEMENT READY
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#78350F', marginTop: '2px' }}>
                You have completed all {trackTotalLessons} lessons in {userLevel} Track!
              </div>
              <div style={{ fontSize: '0.85rem', color: '#92400E', marginTop: '2px' }}>
                {userLevel === 'Beginner'
                  ? 'Promote your account to Intermediate Track to unlock multi-qubit entanglement, Bell states, and quantum oracles.'
                  : userLevel === 'Intermediate'
                  ? 'Promote your account to Advanced Track to unlock Surface Codes, VQE molecular simulations, and QFT.'
                  : 'You have mastered the entire 20-Pillar Quantum Computing Master Syllabus!'}
              </div>
            </div>

            {userLevel !== 'Advanced' && (
              <button
                type="button"
                onClick={async () => {
                  const nextLvl = userLevel === 'Beginner' ? 'Intermediate' : 'Advanced';
                  setUserLevel(nextLvl);
                  setActiveCategory(nextLvl.toLowerCase());
                  window.dispatchEvent(new CustomEvent('learning:level_up', {
                    detail: {
                      previous_level: userLevel,
                      new_level: nextLvl,
                      message: `Congratulations! You completed all ${userLevel} coursework and officially advanced to ${nextLvl} Track!`
                    }
                  }));
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#D97706',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)'
                }}
              >
                ADVANCE TO {userLevel === 'Beginner' ? 'INTERMEDIATE' : 'ADVANCED'} TIER →
              </button>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
          <div style={{ padding: '12px 18px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Active Track Pillars</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{filteredModules.length} Modules</div>
          </div>
          <div style={{ padding: '12px 18px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Track Lessons Completed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
              {trackCompletedLessons}/{trackTotalLessons} Lessons
            </div>
          </div>
          <div style={{ padding: '12px 18px', backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Curriculum Completion</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono)' }}>{completedCount}/{totalLessons} ({progressPercent}%)</div>
          </div>
        </div>
      </div>

      {/* Level Selection Switcher Card */}
      <LevelSelector
        showDetails={true}
        onLevelChange={(newLevel) => {
          setUserLevel(newLevel);
          setActiveCategory(newLevel.toLowerCase());
        }}
      />

      {/* Category & Track Tabs & Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {availableCategories.map(cat => {
            const isSelected = cat.id === activeCategory;
            const isUserLevelMatch = cat.level.toLowerCase() === userLevel.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '7px 14px',
                  backgroundColor: isSelected ? 'var(--accent-primary)' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : (isUserLevelMatch ? '#1D4ED8' : 'var(--text-secondary)'),
                  border: isSelected ? '1px solid var(--accent-primary)' : (isUserLevelMatch ? '1px solid #93C5FD' : '1px solid var(--border-subtle)'),
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: isSelected || isUserLevelMatch ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: 'var(--shadow-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <span>{cat.label}</span>
                {isUserLevelMatch && cat.id !== 'all' && (
                  <span style={{ fontSize: '0.65rem', backgroundColor: isSelected ? '#3B82F6' : '#EFF6FF', color: isSelected ? '#FFFFFF' : '#1D4ED8', padding: '1px 6px', borderRadius: '10px' }}>
                    YOUR TIER
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px' }}>
          <input
            type="text"
            placeholder="Search topics, oracles, gates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 12px 7px 32px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-medium)',
              borderRadius: '6px',
              fontSize: '0.825rem',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      {/* Modules List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {filteredModules.map((mod) => {
          const modProgress = progress?.completed_modules?.includes(mod.id);
          const lvlInfo = getModuleLevel(mod.order || 1);
          const isUserLevelMatch = lvlInfo.level.toLowerCase() === userLevel.toLowerCase();

          return (
            <div
              key={mod.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: isUserLevelMatch ? `2px solid ${lvlInfo.color}` : '1px solid var(--border-subtle)',
                borderRadius: '10px',
                padding: '26px',
                boxShadow: isUserLevelMatch ? `0 4px 16px ${lvlInfo.color}15` : 'var(--shadow-sm)',
                transition: 'all 0.15s ease'
              }}
            >
              {/* Module Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 700, padding: '3px 8px', backgroundColor: '#EFF6FF', color: 'var(--accent-primary)', borderRadius: '4px', border: '1px solid #BFDBFE', fontFamily: 'var(--font-mono)' }}>
                      MODULE {mod.order || mod.id}
                    </span>
                    
                    {/* Level Track Badge */}
                    <span style={{
                      fontSize: '0.725rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      backgroundColor: lvlInfo.bg,
                      color: lvlInfo.color,
                      borderRadius: '4px',
                      border: `1px solid ${lvlInfo.border}`,
                      fontFamily: 'var(--font-mono)'
                    }}>
                      {lvlInfo.badge}
                    </span>

                    {isUserLevelMatch && (
                      <span style={{
                        fontSize: '0.725rem',
                        fontWeight: 700,
                        padding: '3px 8px',
                        backgroundColor: '#FEF3C7',
                        color: '#B45309',
                        borderRadius: '4px',
                        border: '1px solid #FDE68A',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        🎯 RECOMMENDED FOR YOUR LEVEL
                      </span>
                    )}

                    {modProgress && (
                      <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>✓ COMPLETED</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: '1.35rem', margin: 0, color: 'var(--text-primary)', fontWeight: 700 }}>
                    {mod.title}
                  </h3>
                  <p style={{ margin: '6px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '750px', lineHeight: 1.5 }}>
                    {mod.description}
                  </p>
                </div>
              </div>

              {/* Lessons Grid in Module */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginTop: '16px' }}>
                {(mod.lessons || []).map((les) => {
                  const isLessonDone = progress?.completed_lessons?.includes(les.id);
                  const conceptMastery = mastery?.concepts?.[les.concept_id];
                  const status = isLessonDone ? (conceptMastery?.mastery_status || 'COMPLETED') : (progress?.started_lessons?.includes(les.id) ? 'IN_PROGRESS' : 'NOT_STARTED');

                  return (
                    <div
                      key={les.id}
                      onClick={() => onSelectLesson(les.id)}
                      style={{
                        padding: '16px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-subtle)';
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{les.time_minutes || 10} min • {les.difficulty || 'Beginner'}</span>
                          <MasteryBadge status={status} />
                        </div>
                        <h4 style={{ fontSize: '0.95rem', margin: '0 0 6px 0', color: 'var(--text-primary)', fontWeight: 700 }}>
                          {les.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {les.description || les.summary}
                        </p>
                      </div>

                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        OPEN LESSON →
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

