import React, { useState, useEffect } from 'react';
import { getRewardsStatus } from '../../services/rewardsService';
import RewardsModal from './RewardsModal';

export default function StreakXpHud() {
  const [rewards, setRewards] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [animatePulse, setAnimatePulse] = useState(false);

  const fetchStatus = async () => {
    const data = await getRewardsStatus();
    setRewards(data);
  };

  useEffect(() => {
    fetchStatus();

    // Listen for real-time XP award events
    const handleXpAwarded = (e) => {
      setAnimatePulse(true);
      fetchStatus();
      setTimeout(() => setAnimatePulse(false), 1500);
    };

    window.addEventListener('rewards:xp_awarded', handleXpAwarded);
    return () => window.removeEventListener('rewards:xp_awarded', handleXpAwarded);
  }, []);

  if (!rewards) return null;

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '3px 8px',
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: animatePulse ? 'scale(1.05)' : 'scale(1)'
      }}
      onClick={() => setIsModalOpen(true)}
      title="Click to view Streak & XP Rewards"
      >
        {/* Streak Flame Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          backgroundColor: '#FEF3C7',
          border: '1px solid #FDE68A',
          borderRadius: '16px',
          color: '#B45309',
          fontSize: '0.75rem',
          fontWeight: 800,
          fontFamily: 'var(--font-mono)'
        }}>
          <span style={{ fontSize: '0.9rem', animation: 'pulse 1.5s infinite' }}>🔥</span>
          <span>{rewards.streak_days}d</span>
        </div>

        {/* Level & XP Chip */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 8px',
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '16px',
          color: '#1D4ED8',
          fontSize: '0.75rem',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)'
        }}>
          <span>⚡ {rewards.xp} XP</span>
          <span style={{ color: '#93C5FD' }}>•</span>
          <span>Lvl {rewards.level}</span>
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
