import React, { useState, useEffect } from 'react';
import { getRewardsStatus, claimDailyStreak } from '../../services/rewardsService';
import RewardsModal from '../rewards/RewardsModal';

export default function DashboardStreakXpBanner() {
  const [rewards, setRewards] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const fetchStatus = async () => {
    const data = await getRewardsStatus();
    setRewards(data);
  };

  useEffect(() => {
    fetchStatus();

    const handleXpAwarded = () => fetchStatus();
    window.addEventListener('rewards:xp_awarded', handleXpAwarded);
    return () => window.removeEventListener('rewards:xp_awarded', handleXpAwarded);
  }, []);

  if (!rewards) return null;

  const handleQuickClaim = async () => {
    setClaiming(true);
    const updated = await claimDailyStreak();
    setClaiming(false);
    if (updated) setRewards(updated);
  };

  return (
    <>
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #6366F1 100%)',
        borderRadius: '16px',
        padding: '24px 28px',
        color: '#FFFFFF',
        boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        {/* Left Side: Level & XP Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', maxWidth: '580px', flex: 1 }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.15)',
            border: '1.5px solid rgba(255, 255, 255, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.2rem',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
          }}>
            {rewards.level_icon || '🔬'}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#93C5FD' }}>
                LEVEL {rewards.level} • {rewards.level_title}
              </span>
              <span style={{
                padding: '2px 8px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#FEF08A'
              }}>
                1.5x XP Boost 🔥
              </span>
            </div>

            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em', marginBottom: '8px' }}>
              {rewards.xp} XP Earned <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#BFDBFE' }}>({rewards.xp_needed} XP to Level {rewards.level + 1})</span>
            </div>

            {/* Progress bar */}
            <div style={{ height: '8px', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', overflow: 'hidden', maxWidth: '380px' }}>
              <div style={{
                height: '100%',
                width: `${rewards.progress_pct}%`,
                background: 'linear-gradient(90deg, #38BDF8, #F59E0B)',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>
        </div>

        {/* Right Side: Daily Streak Action Box */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          padding: '12px 18px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.25)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', lineHeight: 1 }}>🔥</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FEF08A', marginTop: '2px' }}>
              {rewards.streak_days} DAYS
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              onClick={handleQuickClaim}
              disabled={claiming}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#F59E0B',
                color: '#78350F',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FBBF24'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F59E0B'}
            >
              {claiming ? 'Claiming…' : '🎁 Claim Streak (+150 XP)'}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#DBEAFE',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'center',
                textDecoration: 'underline'
              }}
            >
              View Badges &amp; Goals →
            </button>
          </div>
        </div>
      </div>

      <RewardsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        rewardsData={rewards}
        onRewardsUpdate={(updated) => setRewards(updated)}
      />
    </>
  );
}
