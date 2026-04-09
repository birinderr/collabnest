import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.password2) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.gridOverlay} />
      <div style={styles.blobLeft} />
      <div style={styles.blobRight} />

      <div style={styles.container} className="animate-fade-up">
        <div style={styles.logoWrap}>
          <div style={styles.logoMark}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" fill="var(--accent)" />
              <rect x="11" y="2" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.5" />
              <rect x="2" y="11" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.5" />
              <rect x="11" y="11" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.3" />
            </svg>
          </div>
          <span style={styles.logoText}>CollabNest</span>
        </div>

        <div style={styles.card} className="cn-card">
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '22px', marginBottom: '4px' }}>Create account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Set up your workspace in seconds
            </p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            <div>
              <label className="cn-label">Name <span style={{ color: 'var(--accent)' }}>*</span></label>
              <input
                className="cn-input"
                type="text"
                placeholder="your name"
                value={form.name}
                onChange={set('name')}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="cn-label">Email <span style={{ color: 'var(--accent)' }}>*</span></label>
              <input
                className="cn-input"
                type="email"
                placeholder="ada@example.com"
                value={form.email}
                onChange={set('email')}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="cn-label">Password <span style={{ color: 'var(--accent)' }}>*</span></label>
              <input
                className="cn-input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="cn-label">Confirm password <span style={{ color: 'var(--accent)' }}>*</span></label>
              <input
                className="cn-input"
                type="password"
                placeholder="••••••••"
                value={form.password2}
                onChange={set('password2')}
                required
                disabled={loading}
              />
            </div>

            {error && (
              <p className="cn-error-msg">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M7 4v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="7" cy="10" r="0.75" fill="currentColor" />
                </svg>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="cn-btn-primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <hr className="cn-divider" style={{ margin: '20px 0' }} />

          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '14px' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    padding: '24px',
    background: 'var(--bg-base)',
  },
  gridOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundImage: `
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px',
    opacity: 0.4,
    pointerEvents: 'none',
  },
  blobLeft: {
    position: 'absolute',
    bottom: '-100px',
    left: '-100px',
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(240,165,0,0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blobRight: {
    position: 'absolute',
    top: '-80px',
    right: '-80px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  container: {
    width: '100%',
    maxWidth: '440px',
    position: 'relative',
    zIndex: 1,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
    justifyContent: 'center',
  },
  logoMark: {
    width: '36px',
    height: '36px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: 'Syne, sans-serif',
    fontWeight: 800,
    fontSize: '20px',
    letterSpacing: '-0.02em',
  },
  card: {
    padding: '32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'flex',
    gap: '12px',
  },
};