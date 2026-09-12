import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/authService';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

/* ── tiny inline styles reusing existing CSS tokens ── */
const S = {
  page: {
    minHeight: '100vh', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#0F172A 0%,#1E1B4B 50%,#0F172A 100%)',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    width: '100%', maxWidth: '480px',
    background: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
    padding: '40px 40px 36px',
    boxSizing: 'border-box',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '28px',
  },
  logoIcon: {
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'linear-gradient(135deg,#2563EB,#7C3AED)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  title: {
    fontSize: '1.6rem', fontWeight: 800,
    color: '#0F172A', margin: '0 0 4px 0',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.875rem', color: '#64748B', margin: 0,
  },
  divider: {
    borderBottom: '1px solid #E2E8F0', margin: '20px 0',
  },
  row: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px',
  },
  field: {
    display: 'flex', flexDirection: 'column', gap: '5px',
    marginBottom: '14px',
  },
  label: {
    fontSize: '0.8rem', fontWeight: 600, color: '#374151',
  },
  input: (hasError) => ({
    padding: '10px 13px',
    border: `1.5px solid ${hasError ? '#EF4444' : '#CBD5E1'}`,
    borderRadius: '8px',
    fontSize: '0.9rem', color: '#0F172A',
    background: '#F8FAFC',
    outline: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
    width: '100%',
  }),
  select: {
    padding: '10px 13px',
    border: '1.5px solid #CBD5E1',
    borderRadius: '8px',
    fontSize: '0.9rem', color: '#0F172A',
    background: '#F8FAFC',
    outline: 'none',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
    cursor: 'pointer',
  },
  fieldErr: {
    fontSize: '0.74rem', color: '#EF4444', marginTop: '2px',
  },
  alertErr: {
    background: '#FEF2F2', border: '1px solid #FECACA',
    borderRadius: '8px', padding: '10px 14px',
    fontSize: '0.85rem', color: '#B91C1C',
    marginBottom: '16px',
  },
  alertOk: {
    background: '#F0FDF4', border: '1px solid #BBF7D0',
    borderRadius: '8px', padding: '10px 14px',
    fontSize: '0.85rem', color: '#15803D',
    marginBottom: '16px',
  },
  btn: (loading) => ({
    width: '100%', padding: '12px',
    background: loading
      ? '#93C5FD'
      : 'linear-gradient(135deg,#2563EB,#7C3AED)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '0.95rem', fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    marginTop: '6px',
    transition: 'opacity 0.15s',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px',
  }),
  footer: {
    textAlign: 'center', marginTop: '20px',
    fontSize: '0.875rem', color: '#64748B',
  },
  link: {
    color: '#2563EB', fontWeight: 600,
    textDecoration: 'none',
  },
  pwHint: {
    fontSize: '0.72rem', color: '#94A3B8', marginTop: '3px',
  },
  strengthBar: (score) => {
    const colors = ['#E2E8F0', '#EF4444', '#F97316', '#EAB308', '#22C55E'];
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
    return { color: colors[score] || '#E2E8F0', label: labels[score] || '' };
  },
};

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) || /[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '', email: '', full_name: '',
    password: '', confirm: '', level: 'Beginner',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwScore = passwordStrength(form.password);
  const { color: pwColor, label: pwLabel } = S.strengthBar(pwScore);

  function set(field) {
    return e => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setErrors(er => ({ ...er, [field]: '' }));
      setServerError('');
    };
  }

  function validate() {
    const e = {};
    if (!form.username.trim()) e.username = 'Username is required';
    else if (form.username.length < 3) e.username = 'Min 3 characters';
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) e.username = 'Letters, numbers and _ only';

    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email';

    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Min 6 characters';

    if (!form.confirm) e.confirm = 'Please confirm your password';
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match';

    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    setSuccess('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const data = await signup({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name.trim(),
        level: form.level,
      });
      setSuccess(`Welcome, ${data.profile.username}! Redirecting…`);
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      const msg = err.message || 'Registration failed';
      if (msg.includes('username_exists') || msg.toLowerCase().includes('username')) {
        setErrors(er => ({ ...er, username: 'Username already taken' }));
      } else if (msg.includes('email_exists') || msg.toLowerCase().includes('email')) {
        setErrors(er => ({ ...er, email: 'Email already registered' }));
      } else {
        setServerError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <style>{`
        .rg-input:focus { border-color:#2563EB !important; box-shadow:0 0 0 3px rgba(37,99,235,0.12); background:#fff !important; }
        .rg-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,0.3); }
        .rg-eye { background:none; border:none; cursor:pointer; color:#94A3B8; padding:0 4px; font-size:1rem; }
        .rg-eye:hover { color:#2563EB; }
      `}</style>

      <div style={S.card}>
        {/* Logo */}
        <div style={S.logo}>
          <div style={S.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3"/>
              <path d="M12 2a10 10 0 0 1 10 10"/>
              <path d="M12 2a15 15 0 0 0 0 20"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:'0.9rem', fontWeight:800, color:'#0F172A', letterSpacing:'-0.02em' }}>QUANTUM LAB</div>
            <div style={{ fontSize:'0.65rem', fontWeight:600, color:'#2563EB', textTransform:'uppercase', letterSpacing:'0.06em' }}>Academy & Simulator</div>
          </div>
        </div>

        <h1 style={S.title}>Create your account</h1>
        <p style={S.subtitle}>Start learning quantum computing for free</p>
        <div style={S.divider} />

        {serverError && <div style={S.alertErr}>⚠ {serverError}</div>}
        {success    && <div style={S.alertOk}>✓ {success}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Row: username + full name */}
          <div style={S.row}>
            <div style={S.field}>
              <label style={S.label}>Username <span style={{color:'#EF4444'}}>*</span></label>
              <input
                className="rg-input"
                style={S.input(!!errors.username)}
                placeholder="e.g. quantum_pavan"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
                spellCheck={false}
              />
              {errors.username && <span style={S.fieldErr}>{errors.username}</span>}
            </div>

            <div style={S.field}>
              <label style={S.label}>Full Name</label>
              <input
                className="rg-input"
                style={S.input(false)}
                placeholder="Your name (optional)"
                value={form.full_name}
                onChange={set('full_name')}
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div style={S.field}>
            <label style={S.label}>Email Address <span style={{color:'#EF4444'}}>*</span></label>
            <input
              className="rg-input"
              type="email"
              style={S.input(!!errors.email)}
              placeholder="you@example.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              spellCheck={false}
            />
            {errors.email && <span style={S.fieldErr}>{errors.email}</span>}
          </div>

          {/* Password */}
          <div style={S.field}>
            <label style={S.label}>Password <span style={{color:'#EF4444'}}>*</span></label>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <input
                className="rg-input"
                type={showPw ? 'text' : 'password'}
                style={{ ...S.input(!!errors.password), paddingRight:'40px' }}
                placeholder="Min 6 characters"
                value={form.password}
                onChange={set('password')}
                autoComplete="new-password"
              />
              <button type="button" className="rg-eye" onClick={() => setShowPw(v=>!v)}
                style={{ position:'absolute', right:'10px' }}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span style={S.fieldErr}>{errors.password}</span>}
            {form.password && (
              <div style={{ marginTop:'6px' }}>
                <div style={{ display:'flex', gap:'4px', marginBottom:'3px' }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      height:'3px', flex:1, borderRadius:'2px',
                      background: i <= pwScore ? pwColor : '#E2E8F0',
                      transition:'background 0.2s'
                    }}/>
                  ))}
                </div>
                <span style={{ fontSize:'0.72rem', color: pwColor, fontWeight:600 }}>{pwLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div style={S.field}>
            <label style={S.label}>Confirm Password <span style={{color:'#EF4444'}}>*</span></label>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <input
                className="rg-input"
                type={showConfirm ? 'text' : 'password'}
                style={{ ...S.input(!!errors.confirm), paddingRight:'40px' }}
                placeholder="Re-enter password"
                value={form.confirm}
                onChange={set('confirm')}
                autoComplete="new-password"
              />
              <button type="button" className="rg-eye" onClick={() => setShowConfirm(v=>!v)}
                style={{ position:'absolute', right:'10px' }}>
                {showConfirm ? '🙈' : '👁'}
              </button>
            </div>
            {errors.confirm && <span style={S.fieldErr}>{errors.confirm}</span>}
            {form.confirm && form.password === form.confirm && !errors.confirm && (
              <span style={{ ...S.fieldErr, color:'#15803D' }}>✓ Passwords match</span>
            )}
          </div>

          {/* Level */}
          <div style={S.field}>
            <label style={S.label}>Your Quantum Level</label>
            <select
              className="rg-input"
              style={S.select}
              value={form.level}
              onChange={set('level')}
            >
              {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <span style={S.pwHint}>
              {form.level === 'Beginner'     && 'New to quantum computing — perfect starting point'}
              {form.level === 'Intermediate' && 'Know the basics, exploring algorithms'}
              {form.level === 'Advanced'     && 'Experienced with quantum circuits and algorithms'}
            </span>
          </div>

          <button
            type="submit"
            className="rg-btn"
            style={S.btn(loading)}
            disabled={loading}
          >
            {loading
              ? <><span style={{ width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite' }}/> Creating account…</>
              : 'Create Account →'
            }
          </button>
        </form>

        <div style={S.footer}>
          Already have an account?{' '}
          <Link to="/login" style={S.link}>Sign in</Link>
        </div>

        <div style={{ textAlign:'center', marginTop:'14px', fontSize:'0.72rem', color:'#94A3B8' }}>
          Demo account: <span style={{ fontFamily:'monospace', color:'#64748B' }}>demo_student / quantum123</span>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); }}`}</style>
    </div>
  );
}
