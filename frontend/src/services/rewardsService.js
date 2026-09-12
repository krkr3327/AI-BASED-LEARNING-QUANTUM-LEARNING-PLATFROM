import { getToken } from './authService';

const API_BASE = '/api/learning/rewards';

export async function getRewardsStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`);
    if (!res.ok) throw new Error('Failed to fetch rewards status');
    return await res.json();
  } catch (err) {
    console.warn('Rewards status fallback:', err);
    return {
      xp: 450,
      streak_days: 3,
      streak_multiplier: 1.5,
      today_xp: 150,
      daily_goal_xp: 200,
      daily_goal_pct: 75,
      level: 2,
      level_title: 'Qubit Apprentice',
      level_icon: '🔬',
      next_level_xp: 500,
      xp_in_level: 250,
      xp_needed: 50,
      progress_pct: 83,
      badges: [
        { id: 'FIRST_QUBIT', title: 'First Qubit', icon: '⚛️', desc: 'Created and simulated your first quantum circuit', unlocked: true },
        { id: 'SUPERPOSITION_EXPLORER', title: 'Superposition Explorer', icon: '🌀', desc: 'Prepared a Hadamard equal superposition state', unlocked: true },
        { id: 'BELL_ENTANGLER', title: 'Bell Entangler', icon: '🔗', desc: 'Created a maximally entangled Bell pair |Φ+⟩', unlocked: true },
        { id: 'GROVER_SEARCHER', title: 'Oracle Hunter', icon: '🎯', desc: 'Executed 3D Grover Search amplitude amplification', unlocked: false },
        { id: 'QEC_DEFENDER', title: 'QEC Guardian', icon: '🛡️', desc: 'Protected a logical qubit with surface code error correction', unlocked: false },
        { id: 'STREAK_FLAME', title: 'Consistency Master', icon: '🔥', desc: 'Maintained a 3+ day continuous learning streak', unlocked: true }
      ],
      streak_calendar: [
        { day: 'Mon', active: true },
        { day: 'Tue', active: true },
        { day: 'Wed', active: true },
        { day: 'Thu', active: false },
        { day: 'Fri', active: false },
        { day: 'Sat', active: false },
        { day: 'Sun', active: false }
      ]
    };
  }
}

export async function claimDailyStreak() {
  try {
    const res = await fetch(`${API_BASE}/claim_daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to claim daily streak');
    return await res.json();
  } catch (err) {
    console.error('Error claiming daily streak:', err);
    return null;
  }
}

export async function awardXp(amount, reason = 'Quantum Activity') {
  try {
    const res = await fetch(`${API_BASE}/award_xp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, reason })
    });
    if (!res.ok) throw new Error('Failed to award XP');
    const data = await res.json();
    
    // Dispatch reward event for global celebration toast
    window.dispatchEvent(new CustomEvent('rewards:xp_awarded', {
      detail: { amount, reason, totalXp: data.xp, level: data.level }
    }));
    
    return data;
  } catch (err) {
    console.error('Error awarding XP:', err);
    return null;
  }
}
