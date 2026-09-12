import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';

const S = {
  page: {
    minHeight: '100vh', width: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg,#0F172A 0%,#1E1B4B 50%,#0F172A 100%)',
    padding: '24px',
    boxSizing: 'border-box',
  },
  wrap: {
    display: 'flex', width: '100%', maxWidth: '900px',
    gap: '0', borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  left: {
    flex: '1', minWidth: '0',
    background: 'linear-gradient(160deg,#1E1B4B,#2563EB 60%,#7C3AED)',
    padding: '48px 40px',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    color: '#fff',
  },
  right: {
    width: '420px', flexShrink: 0,
    background: '#FFFFFF',
    padding: '48px 40px',
    boxSizing: 'border-box',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '40px',
  },
  logoIcon: {
    width: '40px', height: '40px', borderRadius: '10px',
    background: 'rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  feat: {
    display: 'flex', flexDirection: 'column', gap: '20px',
  },
  featItem: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
  },
  featIcon: {
    width: '36px', height: '36px', borderRadius: '8px',
    background: 'rgba(255,255,255,0.12)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, fontSize: '1.1rem',
  },
  title: {
    fontSize: '1.55rem', fontWeight: 800,
    color: '#0F172A', margin: '0 0 4px 0',
    letterSpacing: '-0.025em',
  },
  subtitle: { fontSize: '0.875rem', color: '#64748B', margin: '0 0 24px 0' },
  field: {
    display: 'flex', flexDirection: 'column', gap: '5px',
    marginBottom: '14px',
  },
  label: { fontSize: '0.8rem', fontWeight: 600, color: '#374151' },
  input: (err) => ({
    padding: '10px 13px',
    border: `1.5px solid ${err ? '#EF4444' : '#CBD5E1'}`,
    borderRadius: '8px',
    fontSize: '0.9rem', color: '#0F172A',
    background: '#F8FAFC', outline: 'none',
    fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  }),
  fieldErr: { fontSize: '0.74rem', color: '#EF4444' },
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
    fontSize: '0.95rem', fontWeight: 700, marginTop: '6px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'opacity 0.15s',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px',
  }),
  divider: {
    display: 'flex', alignItems: 'center', gap: '10px',
    margin: '16px 0', color: '#94A3B8', fontSize: '0.8rem',
  },
  demoBtn: {
    width: '100%', padding: '10px',
    background: '#F8FAFC', color: '#374151',
    border: '1.5px solid #CBD5E1', borderRadius: '8px',
    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: '8px',
    transition: 'all 0.15s',
  },
  footer: {
    textAlign: 'center', marginTop: '20px',
    fontSize: '0.875rem', color: '#64748B',
  },
  link: { color: '#2563EB', fontWeight: 600, textDecoration: 'none' },
};

const FEATURES = [
  { icon: '⚛', title: 'Quantum Circuit Lab', desc: 'Build and simulate quantum circuits with real NumPy state-vector engine' },
  { icon: '🤖', title: 'AI Tutor', desc: 'Ask any quantum question — powered by Gemini AI with curriculum context' },
  { icon: '📚', title: '17-Module Curriculum', desc: 'Complete quantum computing course from qubits to Shor\'s algorithm' },
  { icon: '🏆', title: 'Progress Tracking', desc: 'Mastery scoring, adaptive recommendations, and saved circuits' },
];

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm]         = useState({ username: '', password: '' });
  const [errors, setErrors]     = useState({});
  const [serverError, setServerError] = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

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
    if (!form.password)        e.password = 'Password is required';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError(''); setSuccess('');
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const data = await login({ username: form.username.trim(), password: form.password });
      setSuccess(`Welcome back, ${data.profile.username}! Redirecting…`);
      // Dispatch custom event so App.jsx can update global auth state
      window.dispatchEvent(new CustomEvent('auth:login', { detail: data }));
      setTimeout(() => navigate('/'), 1200);
    } catch (err) {
      const msg = err.message || 'Login failed';
      if (err.status === 401) setServerError('Incorrect username or password');
      else setServerError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function loginAsDemo(e) {
    e.preventDefault();
    setServerError(''); setSuccess('');
    setLoading(true);
    try {
      const data = await login({ username: 'demo_student', password: 'quantum123' });
      setSuccess(`Logged in as demo account! Redirecting…`);
      window.dispatchEvent(new CustomEvent('auth:login', { detail: data }));
      setTimeout(() => navigate('/'), 1200);
    } catch {
      setServerError('Demo login failed — make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={S.page}>
      <style>{`
        .lg-input:focus { border-color:#2563EB !important; box-shadow:0 0 0 3px rgba(37,99,235,0.12); background:#fff !important; }
        .lg-btn:hover:not(:disabled) { opacity:0.9; transform:translateY(-1px); box-shadow:0 6px 20px rgba(37,99,235,0.3); }
        .lg-demo:hover { background:#EFF6FF !important; border-color:#2563EB !important; color:#1D4ED8 !important; }
        .lg-eye { background:none; border:none; cursor:pointer; color:#94A3B8; padding:0 4px; font-size:1rem; }
        .lg-eye:hover { color:#2563EB; }
        @keyframes spin { to { transform:rotate(360deg); }}
        @media(max-width:680px) { .lg-left { display:none !important; } .lg-wrap { max-width:440px !important; } }
      `}</style>

      <div className="lg-wrap" style={S.wrap}>
        {/* ── Left panel — features ── */}
        <div className="lg-left" style={S.left}>
          <div>
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
                <div style={{ fontSize:'0.9rem', fontWeight:800, letterSpacing:'-0.02em' }}>QUANTUM LAB</div>
                <div style={{ fontSize:'0.62rem', fontWeight:600, color:'rgba(255,255,255,0.65)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Academy & Simulator</div>
              </div>
            </div>

            <h2 style={{ fontSize:'1.65rem', fontWeight:800, margin:'0 0 10px', lineHeight:1.25 }}>
              India's first AI-powered<br />Quantum Learning Platform
            </h2>
            <p style={{ fontSize:'0.9rem', color:'rgba(255,255,255,0.7)', margin:'0 0 32px', lineHeight:1.6 }}>
              Learn quantum computing interactively — circuits, algorithms, AI tutor, all in one place.
            </p>

            <div style={S.feat}>
              {FEATURES.map((f, i) => (
                <div key={i} style={S.featItem}>
                  <div style={S.featIcon}>{f.icon}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:'2px' }}>{f.title}</div>
                    <div style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.65)', lineHeight:1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginTop:'32px' }}>
            SIH 2026 · Quantum Computing Education Platform
          </div>
        </div>

        {/* ── Right panel — login form ── */}
        <div style={S.right}>
          <h1 style={S.title}>Welcome back</h1>
          <p style={S.subtitle}>Sign in to continue your quantum journey</p>

          {serverError && <div style={S.alertErr}>⚠ {serverError}</div>}
          {success     && <div style={S.alertOk}>✓ {success}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div style={S.field}>
              <label style={S.label}>Username</label>
              <input
                className="lg-input"
                style={S.input(!!errors.username)}
                placeholder="Your username"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
                spellCheck={false}
                autoFocus
              />
              {errors.username && <span style={S.fieldErr}>{errors.username}</span>}
            </div>

            <div style={S.field}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <label style={S.label}>Password</label>
                <span style={{ fontSize:'0.74rem', color:'#64748B' }}>
                  Forgot? Use demo account below
                </span>
              </div>
              <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
                <input
                  className="lg-input"
                  type={showPw ? 'text' : 'password'}
                  style={{ ...S.input(!!errors.password), paddingRight:'40px' }}
                  placeholder="Your password"
                  value={form.password}
                  onChange={set('password')}
                  autoComplete="current-password"
                />
                <button type="button" className="lg-eye"
                  style={{ position:'absolute', right:'10px' }}
                  onClick={() => setShowPw(v => !v)}>
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
              {errors.password && <span style={S.fieldErr}>{errors.password}</span>}
            </div>

            <button type="submit" className="lg-btn" style={S.btn(loading)} disabled={loading}>
              {loading
                ? <><span style={{ width:'16px',height:'16px',border:'2px solid rgba(255,255,255,0.4)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.8s linear infinite' }}/> Signing in…</>
                : 'Sign In →'
              }
            </button>
          </form>

          {/* Divider */}
          <div style={S.divider}>
            <div style={{ flex:1, height:'1px', background:'#E2E8F0' }}/>
            <span>or</span>
            <div style={{ flex:1, height:'1px', background:'#E2E8F0' }}/>
          </div>

          {/* Demo login */}
          <button
            className="lg-demo"
            style={S.demoBtn}
            onClick={loginAsDemo}
            disabled={loading}
          >
            ⚡ Try Demo Account
          </button>

          <div style={{ marginTop:'8px', textAlign:'center', fontSize:'0.74rem', color:'#94A3B8' }}>
            username: <code>demo_student</code> · password: <code>quantum123</code>
          </div>

          <div style={S.footer}>
            Don't have an account?{' '}
            <Link to="/register" style={S.link}>Create one free</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
