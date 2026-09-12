import React from 'react';

/**
 * QUANTUM DESIGN SYSTEM PRIMITIVES - Professional Academic Edition
 * Standardized design tokens & components for QuantumLearning UI/UX Architecture
 */

export function QuantumPage({ children, env = 'learn', maxWidth = 1240, className = '', style = {} }) {
  return (
    <div 
      className={`quantum-page ${className}`} 
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflowY: 'auto',
        background: 'transparent',
        boxSizing: 'border-box',
        ...style
      }}
    >
      <div 
        style={{
          maxWidth: `${maxWidth}px`,
          width: '100%',
          margin: '0 auto',
          padding: '32px 32px 64px 32px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px'
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function QuantumHeader({ title, subtitle, category, actions, breadcrumb }) {
  return (
    <div 
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        paddingBottom: '20px', 
        borderBottom: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '16px'
      }}
    >
      <div style={{ maxWidth: '800px' }}>
        {breadcrumb && (
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
            {breadcrumb}
          </div>
        )}
        {category && (
          <div style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
            {category}
          </div>
        )}
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.025em', color: 'var(--text-primary)', lineHeight: 1.2 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: 1.5 }}>
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </div>
  );
}

export function QuantumPanel({ children, title, subtitle, badgeText, badgeVariant = 'blue', actions, className = '', style = {} }) {
  return (
    <div 
      className={`quantum-panel ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: '10px',
        padding: '24px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        ...style
      }}
    >
      {(title || badgeText || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: title ? '1px solid var(--border-subtle)' : 'none', paddingBottom: title ? '14px' : '0' }}>
          <div>
            {title && <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>}
            {subtitle && <p style={{ margin: '3px 0 0 0', fontSize: '0.825rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {badgeText && <QuantumBadge variant={badgeVariant}>{badgeText}</QuantumBadge>}
            {actions}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export function QuantumCard({ children, onClick, active = false, hoverable = true, className = '', style = {} }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        backgroundColor: active ? '#EFF6FF' : '#FFFFFF',
        border: active ? '1.5px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: active ? 'var(--shadow-md)' : 'var(--shadow-xs)',
        transition: 'all 0.15s ease',
        ...style
      }}
      onMouseEnter={(e) => {
        if (hoverable && onClick) {
          e.currentTarget.style.borderColor = 'var(--border-active)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable && onClick) {
          e.currentTarget.style.borderColor = active ? 'var(--accent-primary)' : 'var(--border-subtle)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = active ? 'var(--shadow-md)' : 'var(--shadow-xs)';
        }
      }}
    >
      {children}
    </div>
  );
}

export function QuantumButton({ children, onClick, variant = 'primary', size = 'medium', disabled = false, loading = false, style = {}, type = 'button' }) {
  const sizePadding = {
    small: '6px 12px',
    medium: '9px 18px',
    large: '12px 24px'
  }[size] || '9px 18px';

  const sizeFontSize = {
    small: '0.8rem',
    medium: '0.875rem',
    large: '0.95rem'
  }[size] || '0.875rem';

  const variants = {
    primary: {
      bg: 'var(--accent-primary)',
      color: '#FFFFFF',
      border: '1px solid var(--accent-primary)',
      boxShadow: 'var(--shadow-xs)',
      hoverBg: 'var(--accent-primary-hover)'
    },
    secondary: {
      bg: '#FFFFFF',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-medium)',
      boxShadow: 'var(--shadow-xs)',
      hoverBg: 'var(--bg-hover)'
    },
    outline: {
      bg: 'transparent',
      color: 'var(--accent-primary)',
      border: '1px solid var(--accent-primary)',
      boxShadow: 'none',
      hoverBg: '#EFF6FF'
    },
    danger: {
      bg: '#FEF2F2',
      color: 'var(--gate-x)',
      border: '1px solid #FECACA',
      boxShadow: 'none',
      hoverBg: '#FEE2E2'
    },
    ghost: {
      bg: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
      boxShadow: 'none',
      hoverBg: 'var(--bg-hover)'
    }
  };

  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        backgroundColor: v.bg,
        color: v.color,
        fontWeight: 600,
        fontFamily: 'var(--font-family)',
        fontSize: sizeFontSize,
        padding: sizePadding,
        border: v.border,
        borderRadius: '6px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        transition: 'all 0.15s ease',
        boxShadow: v.boxShadow,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        ...style
      }}
    >
      {loading && (
        <span 
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block'
          }} 
        />
      )}
      {children}
    </button>
  );
}

export function QuantumSelect({ options, value, onChange, label, disabled = false, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {label && <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</label>}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          padding: '8px 12px',
          backgroundColor: '#FFFFFF',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-medium)',
          borderRadius: '6px',
          fontFamily: 'var(--font-family)',
          fontSize: '0.875rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: 'var(--shadow-xs)',
          transition: 'all 0.15s ease'
        }}
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt.id} value={opt.value ?? opt.id}>
            {opt.label ?? opt.name ?? opt.title}
          </option>
        ))}
      </select>
    </div>
  );
}

export function QuantumInput({ value, onChange, placeholder, type = 'text', label, error, disabled = false, style = {} }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', ...style }}>
      {label && <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          padding: '9px 14px',
          backgroundColor: '#FFFFFF',
          color: 'var(--text-primary)',
          border: error ? '1px solid var(--gate-x)' : '1px solid var(--border-medium)',
          borderRadius: '6px',
          fontFamily: 'var(--font-family)',
          fontSize: '0.875rem',
          outline: 'none',
          boxShadow: 'var(--shadow-xs)',
          transition: 'all 0.15s ease'
        }}
      />
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--gate-x)' }}>{error}</span>}
    </div>
  );
}

export function QuantumBadge({ children, variant = 'blue' }) {
  const colors = {
    blue: { bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE' },
    cyan: { bg: '#F0F9FF', text: '#0369A1', border: '#BAE6FD' },
    violet: { bg: '#F5F3FF', text: '#6D28D9', border: '#DDD6FE' },
    green: { bg: '#F0FDF4', text: '#15803D', border: '#BBF7D0' },
    amber: { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' },
    red: { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' }
  };
  const c = colors[variant] || colors.blue;

  return (
    <span style={{
      fontSize: '0.725rem',
      fontWeight: 700,
      fontFamily: 'var(--font-mono)',
      letterSpacing: '0.04em',
      padding: '3px 8px',
      borderRadius: '4px',
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {children}
    </span>
  );
}

export function QuantumTabs({ tabs, activeTab, onChangeTab }) {
  return (
    <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            style={{
              padding: '10px 18px',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: isActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export function QuantumEmptyState({ title = 'No Data Recorded', description, actionLabel, onAction, icon }) {
  return (
    <div 
      style={{ 
        padding: '48px 24px', 
        textAlign: 'center', 
        backgroundColor: '#FFFFFF', 
        borderRadius: '8px', 
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xs)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}
    >
      <div style={{ fontSize: '2.5rem', opacity: 0.8 }}>
        {icon || '🔬'}
      </div>
      <div style={{ maxWidth: '480px' }}>
        <h4 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: '0 0 6px 0', fontWeight: 700 }}>
          {title}
        </h4>
        {description && (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {description}
          </p>
        )}
      </div>
      {actionLabel && onAction && (
        <QuantumButton onClick={onAction} style={{ marginTop: '8px' }}>
          {actionLabel}
        </QuantumButton>
      )}
    </div>
  );
}

export function QuantumLoadingState({ message = 'Executing Quantum Computations...' }) {
  return (
    <div style={{ padding: '48px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', color: 'var(--text-secondary)' }}>
      <div 
        style={{ 
          width: '32px', 
          height: '32px', 
          border: '3px solid var(--accent-primary)', 
          borderTopColor: 'transparent', 
          borderRadius: '50%', 
          animation: 'spin 0.8s linear infinite' 
        }} 
      />
      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
    </div>
  );
}

export function QuantumErrorState({ title = 'Quantum Execution Error', message, onRetry }) {
  return (
    <div 
      style={{ 
        padding: '24px', 
        backgroundColor: '#FEF2F2', 
        borderRadius: '8px', 
        border: '1px solid #FECACA', 
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.3rem', color: 'var(--gate-x)' }}>⚠️</span>
        <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--gate-x)', fontWeight: 700 }}>{title}</h4>
      </div>
      <p style={{ margin: 0, color: '#991B1B', fontSize: '0.9rem', lineHeight: 1.5 }}>
        {message}
      </p>
      {onRetry && (
        <div>
          <QuantumButton variant="danger" size="small" onClick={onRetry}>
            RETRY ACTION
          </QuantumButton>
        </div>
      )}
    </div>
  );
}

export function QuantumMetric({ label, value, unit = '', color = 'var(--accent-primary)' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '14px 16px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: '1.4rem', fontWeight: 700, color: color, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
        {value !== undefined && value !== null ? value : 'N/A'}{unit && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '3px' }}>{unit}</span>}
      </span>
    </div>
  );
}

export function QuantumStatusIndicator({ status = 'ready', label = 'SYSTEM OPERATIONAL' }) {
  const isOk = status === 'ready' || status === 'operational';
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', fontWeight: 600, color: isOk ? '#15803D' : '#B91C1C' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isOk ? '#22C55E' : '#EF4444' }} />
      <span>{label}</span>
    </div>
  );
}
