import React, { useState, useEffect } from 'react';

export default function XpCelebrationToast() {
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleXpAwarded = (e) => {
      const { amount, reason } = e.detail || {};
      setToast({ amount: amount || 50, reason: reason || 'Quantum Progress' });

      setTimeout(() => {
        setToast(null);
      }, 3500);
    };

    window.addEventListener('rewards:xp_awarded', handleXpAwarded);
    return () => window.removeEventListener('rewards:xp_awarded', handleXpAwarded);
  }, []);

  if (!toast) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      padding: '10px 20px',
      borderRadius: '30px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 15px rgba(59, 130, 246, 0.5)',
      border: '1px solid #3B82F6',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 10000,
      animation: 'slideUp 0.3s ease',
      fontSize: '0.88rem',
      fontWeight: 700
    }}>
      <span style={{ fontSize: '1.2rem', animation: 'bounce 0.8s infinite' }}>⚡</span>
      <span style={{ color: '#60A5FA' }}>+{toast.amount} XP</span>
      <span style={{ color: '#94A3B8' }}>•</span>
      <span style={{ color: '#F8FAFC' }}>{toast.reason}</span>
      <span style={{ fontSize: '1.1rem' }}>🎉</span>
    </div>
  );
}
