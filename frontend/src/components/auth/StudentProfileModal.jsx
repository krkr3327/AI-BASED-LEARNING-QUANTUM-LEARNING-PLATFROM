import React, { useState } from 'react';

export default function StudentProfileModal({ isOpen, onClose, studentProfile, studentProgress, onAuthSuccess }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLoginView ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLoginView
      ? { username, password }
      : { username, email, password, level };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Authentication failed');

      localStorage.setItem('q_token', data.token);
      if (onAuthSuccess) onAuthSuccess(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--bg-panel)', border: '1px solid var(--border-active)',
        borderRadius: '12px', width: '420px', padding: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontFamily: 'monospace', color: 'var(--accent-secondary)' }}>
            {studentProfile ? 'STUDENT PROFILE' : (isLoginView ? 'STUDENT LOGIN' : 'CREATE STUDENT ACCOUNT')}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid var(--gate-x)', borderRadius: '6px', color: 'var(--gate-x)', fontSize: '0.85rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {studentProfile ? (
          <div>
            <div style={{ marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '14px', borderRadius: '8px' }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>{studentProfile.full_name || studentProfile.username}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontFamily: 'monospace' }}>{studentProfile.email}</div>
              <div style={{ marginTop: '8px', display: 'inline-block', padding: '2px 8px', borderRadius: '4px', background: 'rgba(6,182,212,0.15)', color: 'var(--accent-primary)', border: '1px solid var(--accent-primary)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                LEVEL: {studentProfile.level}
              </div>
            </div>

            {studentProgress && (
              <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                <div>Completed Lessons: <strong style={{ color: '#fff' }}>{studentProgress.completed_lessons?.length || 0}</strong></div>
                <div>Experiments Executed: <strong style={{ color: '#fff' }}>{studentProgress.experiments_count || 0}</strong></div>
                <div>Saved Circuits: <strong style={{ color: '#fff' }}>{studentProgress.saved_circuits?.length || 0}</strong></div>
              </div>
            )}

            <button
              onClick={() => {
                localStorage.removeItem('q_token');
                if (onAuthSuccess) onAuthSuccess({ profile: null, progress: null });
                onClose();
              }}
              style={{ width: '100%', padding: '10px', background: 'rgba(239,68,68,0.2)', border: '1px solid var(--gate-x)', color: 'var(--gate-x)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontFamily: 'monospace' }}>USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', background: '#0b1120', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            {!isLoginView && (
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontFamily: 'monospace' }}>EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', padding: '8px 12px', background: '#0b1120', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontFamily: 'monospace' }}>PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '8px 12px', background: '#0b1120', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
              />
            </div>

            {!isLoginView && (
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontFamily: 'monospace' }}>EXPERIENCE LEVEL</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', background: '#0b1120', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: '#fff' }}
                >
                  <option value="Beginner">Beginner (Conceptual & Intuitive)</option>
                  <option value="Intermediate">Intermediate (Matrix & Circuit Formalism)</option>
                  <option value="Advanced">Advanced (Linear Algebra & Derivations)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ marginTop: '10px', width: '100%', padding: '10px' }}
            >
              {loading ? 'Authenticating...' : (isLoginView ? 'LOG IN' : 'CREATE ACCOUNT')}
            </button>

            <div style={{ textAlign: 'center', marginTop: '10px' }}>
              <button
                type="button"
                onClick={() => setIsLoginView(!isLoginView)}
                style={{ background: 'none', border: 'none', color: 'var(--accent-secondary)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {isLoginView ? "Don't have an account? Sign up" : 'Already registered? Log in'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
