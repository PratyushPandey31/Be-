import React, { useState } from 'react';

const M = { fontFamily: "'JetBrains Mono',monospace" };

export default function AuthModal({ API, onLoginSuccess, onClose }) {
  const [mode, setMode]         = useState('login'); // 'login' | 'register'
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState('SecOps Lead Analyst');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = mode === 'login' ? `${API}/auth/login` : `${API}/auth/register`;
    const payload  = mode === 'login'
      ? { username, password }
      : { username, email, password, role };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || 'Authentication failed');
      }

      // Save token to localStorage
      localStorage.setItem('cybershield_token', data.access_token);
      localStorage.setItem('cybershield_user', JSON.stringify(data.user));

      onLoginSuccess(data.user, data.access_token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (usr) => {
    setUsername(usr);
    setPassword('CyberShield2026!');
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: usr, password: 'CyberShield2026!' })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('cybershield_token', data.access_token);
        localStorage.setItem('cybershield_user', JSON.stringify(data.user));
        onLoginSuccess(data.user, data.access_token);
      }
    } catch (err) {
      setError('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(2,6,18,0.88)', backdropFilter: 'blur(16px)', padding: 20 }}>
      <div className="card anim-fadeup" style={{ width: '100%', maxWidth: 460, padding: 0, border: '1px solid rgba(0,240,255,0.3)', boxShadow: '0 0 40px rgba(0,240,255,0.15), 0 20px 50px rgba(0,0,0,0.8)' }}>

        {/* Top Glow Bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #00f0ff, #8b5cf6, #10b981)' }} />

        {/* Header */}
        <div style={{ padding: '26px 28px 18px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.6rem', boxShadow: '0 0 20px rgba(0,240,255,0.2)' }}>
            🛡️
          </div>
          <h2 style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', letterSpacing: '-.2px' }}>
            CyberShield AI
          </h2>
          <p style={{ ...M, fontSize: '.68rem', color: '#67e8f9', marginTop: 3 }}>
            JWT Authenticated Security Portal
          </p>

          {/* Mode Switcher Pills */}
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 9, border: '1px solid rgba(255,255,255,0.07)', marginTop: 16 }}>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              style={{ flex: 1, padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', background: mode === 'login' ? 'rgba(0,240,255,0.16)' : 'transparent', color: mode === 'login' ? '#a5f3fc' : '#64748b', ...M, fontSize: '.72rem', fontWeight: mode === 'login' ? 700 : 400 }}
            >
              Sign In (Login)
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              style={{ flex: 1, padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', background: mode === 'register' ? 'rgba(139,92,246,0.2)' : 'transparent', color: mode === 'register' ? '#c4b5fd' : '#64748b', ...M, fontSize: '.72rem', fontWeight: mode === 'register' ? 700 : 400 }}
            >
              Register (Sign Up)
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, ...M, fontSize: '.7rem', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          <div>
            <label style={{ ...M, fontSize: '.6rem', color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: .6, textTransform: 'uppercase' }}>Username</label>
            <input required className="inp" placeholder="e.g. secops_lead" value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label style={{ ...M, fontSize: '.6rem', color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: .6, textTransform: 'uppercase' }}>Email Address</label>
                <input required type="email" className="inp" placeholder="analyst@cybershield.ai" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div>
                <label style={{ ...M, fontSize: '.6rem', color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: .6, textTransform: 'uppercase' }}>Security Role</label>
                <select className="inp" value={role} onChange={e => setRole(e.target.value)}>
                  <option>SecOps Lead Analyst</option>
                  <option>CISO / Executive Auditor</option>
                  <option>SOC Threat Hunter</option>
                  <option>DevSecOps Engineer</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label style={{ ...M, fontSize: '.6rem', color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: .6, textTransform: 'uppercase' }}>Password</label>
            <input required type="password" className="inp" placeholder="••••••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', width: '100%', height: 42, marginTop: 4 }}>
            {loading ? 'Authenticating…' : mode === 'login' ? '🔐 Sign In with JWT' : '✨ Create CyberShield Account'}
          </button>

          {/* Quick Demo Access Buttons */}
          <div style={{ marginTop: 10, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ ...M, fontSize: '.6rem', color: '#475569', textAlign: 'center', marginBottom: 8 }}>⚡ ONE-CLICK DEMO AUTHENTICATION</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => quickLogin('secops')} style={{ justifyContent: 'center', fontSize: '.68rem' }}>
                👤 SecOps Demo
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => quickLogin('ciso')} style={{ justifyContent: 'center', fontSize: '.68rem' }}>
                👑 CISO Demo
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}
