import React, { useState } from 'react';
import { claimDailyStreak } from '../../services/rewardsService';

export default function RewardsModal({ isOpen, onClose, rewardsData, onRewardsUpdate }) {
  const [claiming, setClaiming] = useState(false);
  const [claimedToday, setClaimedToday] = useState(false);

  if (!isOpen || !rewardsData) return null;

  const handleClaim = async () => {
    setClaiming(true);
    const updated = await claimDailyStreak();
    setClaiming(false);
    if (updated) {
      setClaimedToday(true);
      if (onRewardsUpdate) onRewardsUpdate(updated);
    }
  };

  const {
    xp = 450,
    streak_days = 3,
    level = 2,
    level_title = 'Qubit Apprentice',
    level_icon = '🔬',
    next_level_xp = 500,
    progress_pct = 80,
    today_xp = 150,
    daily_goal_xp = 200,
    daily_goal_pct = 75,
    badges = [],
    streak_calendar = []
  } = rewardsData;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Hero Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 50%, #7C3AED 100%)',
          padding: '24px 24px 20px',
          color: '#FFFFFF',
          position: 'relative'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              color: '#FFFFFF',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem'
            }}>
              {level_icon}
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93C5FD' }}>
                LEVEL {level} REWARD STATUS
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '2px 0 0', color: '#FFFFFF' }}>
                {level_title}
              </h2>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', color: '#DBEAFE' }}>
              <span>Total Energy: <strong>{xp} XP</strong></span>
              <span>Next Level: <strong>{next_level_xp} XP</strong></span>
            </div>
            <div style={{ height: '10px', backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress_pct}%`,
                background: 'linear-gradient(90deg, #38BDF8, #F59E0B)',
                borderRadius: '6px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', maxHeight: '60vh', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Daily Streak Card */}
          <div style={{
            padding: '14px 16px',
            backgroundColor: '#FFFBEB',
            borderRadius: '12px',
            border: '1px solid #FDE68A',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>🔥</span>
                <div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#92400E' }}>
                    {streak_days} Day Learning Streak!
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#B45309' }}>
                    1.5x XP Multiplier Active on All Quantum Lab Simulations
                  </div>
                </div>
              </div>
              <button
                onClick={handleClaim}
                disabled={claiming || claimedToday}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: claimedToday ? '#059669' : '#D97706',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: claimedToday ? 'default' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {claimedToday ? '✓ Claimed +150 XP' : (claiming ? 'Claiming…' : '🎁 Claim +150 XP')}
              </button>
            </div>

            {/* 7-Day Calendar Streak Checkmarks */}
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '6px', marginTop: '4px' }}>
              {streak_calendar.map((d, i) => (
                <div key={i} style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '6px 4px',
                  borderRadius: '6px',
                  backgroundColor: d.active ? '#FEF3C7' : '#FFFFFF',
                  border: d.active ? '1px solid #F59E0B' : '1px solid #E2E8F0',
                  color: d.active ? '#B45309' : '#94A3B8'
                }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{d.day}</div>
                  <div style={{ fontSize: '0.85rem', marginTop: '2px' }}>{d.active ? '🔥' : '○'}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Goal */}
          <div style={{ padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#334155' }}>
              <span>Daily Activity Goal</span>
              <span style={{ color: '#2563EB' }}>{today_xp} / {daily_goal_xp} XP ({daily_goal_pct}%)</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${daily_goal_pct}%`, backgroundColor: '#2563EB', borderRadius: '4px' }} />
            </div>
          </div>

          {/* Quantum Badges Showcase */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🏆</span> Quantum Achievements &amp; Badges
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {badges.map((b, i) => (
                <div key={i} style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: b.unlocked ? '1px solid #BFDBFE' : '1px solid #E2E8F0',
                  backgroundColor: b.unlocked ? '#EFF6FF' : '#F8FAFC',
                  opacity: b.unlocked ? 1.0 : 0.6,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px'
                }}>
                  <div style={{
                    fontSize: '1.5rem',
                    filter: b.unlocked ? 'none' : 'grayscale(100%)',
                    flexShrink: 0
                  }}>
                    {b.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: b.unlocked ? '#1E40AF' : '#64748B' }}>
                      {b.title} {b.unlocked ? '✓' : '🔒'}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', lineHeight: '1.3', marginTop: '2px' }}>
                      {b.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #E2E8F0',
          backgroundColor: '#F8FAFC',
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Keep Learning 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
