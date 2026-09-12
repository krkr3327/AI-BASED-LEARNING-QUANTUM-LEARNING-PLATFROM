import React from 'react';

/**
 * Standardized Mastery Status Badge for QuantumLearning
 * States:
 * - MASTERED (◆)
 * - IN_PROGRESS (◐)
 * - NOT_STARTED (○)
 * - COMPLETED (●)
 */
export default function MasteryBadge({ status, score }) {
  let symbol = '○';
  let label = 'Not Started';
  let color = 'var(--text-muted)';
  let bg = 'rgba(255, 255, 255, 0.05)';
  let border = 'var(--border-subtle)';

  switch (status) {
    case 'MASTERED':
      symbol = '◆';
      label = score ? `Mastered (${score}%)` : 'Mastered';
      color = 'var(--accent-secondary)';
      bg = 'rgba(6, 182, 212, 0.12)';
      border = 'rgba(6, 182, 212, 0.3)';
      break;
    case 'COMPLETED':
      symbol = '●';
      label = 'Completed';
      color = 'var(--accent-primary)';
      bg = 'rgba(139, 92, 246, 0.12)';
      border = 'rgba(139, 92, 246, 0.3)';
      break;
    case 'IN_PROGRESS':
      symbol = '◐';
      label = 'In Progress';
      color = '#f59e0b';
      bg = 'rgba(245, 158, 11, 0.12)';
      border = 'rgba(245, 158, 11, 0.3)';
      break;
    case 'NOT_STARTED':
    default:
      symbol = '○';
      label = 'Not Started';
      color = 'var(--text-muted)';
      bg = 'rgba(255, 255, 255, 0.03)';
      border = 'var(--border-subtle)';
      break;
  }

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '0.8rem',
        fontWeight: 600,
        padding: '4px 10px',
        borderRadius: '12px',
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
        letterSpacing: '0.03em'
      }}
    >
      <span style={{ fontSize: '0.9rem', lineHeight: 1 }}>{symbol}</span>
      <span>{label}</span>
    </span>
  );
}
