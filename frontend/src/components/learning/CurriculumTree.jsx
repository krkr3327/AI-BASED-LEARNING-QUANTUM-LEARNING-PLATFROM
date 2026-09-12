import React, { useState } from 'react';

export default function CurriculumTree({ curriculum = [], activeLessonId = null, onSelectLesson }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({
      ...prev,
      [modId]: prev[modId] === undefined ? false : !prev[modId] // Default open
    }));
  };

  const isExpanded = (modId) => {
    return expandedModules[modId] !== false; // default open
  };

  const filteredCurriculum = curriculum.map(mod => {
    if (!searchQuery.trim()) return mod;
    const query = searchQuery.toLowerCase();
    const matchesMod = mod.title.toLowerCase().includes(query) || (mod.description && mod.description.toLowerCase().includes(query));
    const matchingLessons = (mod.lessons || []).filter(l => 
      l.title.toLowerCase().includes(query) || 
      (l.description && l.description.toLowerCase().includes(query))
    );
    if (matchesMod || matchingLessons.length > 0) {
      return {
        ...mod,
        lessons: matchesMod ? mod.lessons : matchingLessons
      };
    }
    return null;
  }).filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Search Input */}
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          placeholder="Search 17 pillars & lessons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px 8px 34px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-medium)',
            borderRadius: '6px',
            fontSize: '0.85rem',
            color: 'var(--text-primary)',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>

      {/* Modules Tree */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredCurriculum.map((mod) => {
          const open = isExpanded(mod.id);
          return (
            <div
              key={mod.id}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              {/* Module Accordion Header */}
              <div
                onClick={() => toggleModule(mod.id)}
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#F8FAFC',
                  borderBottom: open ? '1px solid var(--border-subtle)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 0.15s ease',
                    color: 'var(--text-muted)'
                  }}>
                    ▶
                  </span>
                  <h4 style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    margin: 0,
                    color: 'var(--text-primary)'
                  }}>
                    {mod.title}
                  </h4>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: '#EFF6FF',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  border: '1px solid #DBEAFE'
                }}>
                  {mod.lessons?.length || 0} Lessons
                </span>
              </div>

              {/* Lessons List */}
              {open && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {mod.lessons?.map((les) => {
                    const isActive = les.id === activeLessonId;
                    return (
                      <div
                        key={les.id}
                        onClick={() => onSelectLesson && onSelectLesson(les.id)}
                        style={{
                          padding: '10px 14px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          backgroundColor: isActive ? '#EFF6FF' : '#FFFFFF',
                          borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                          borderBottom: '1px solid #F1F5F9',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = '#F8FAFC';
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) e.currentTarget.style.backgroundColor = '#FFFFFF';
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{
                            fontSize: '0.825rem',
                            fontWeight: isActive ? 700 : 500,
                            color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)'
                          }}>
                            {les.title}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)'
                          }}>
                            {les.difficulty || 'Beginner'} • {les.time_minutes || 10} min
                          </span>
                        </div>
                        <span style={{
                          fontSize: '0.8rem',
                          color: isActive ? 'var(--accent-primary)' : 'var(--text-light)',
                          fontWeight: 700
                        }}>
                          →
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

