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
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(2,6,18,0.92)',
      backdropFilter: 'blur(24px) saturate(190%)',
      padding: 20
    }}>
      <style>{`
        @keyframes rotate3dLogo {
          0% { transform: perspective(800px) rotateY(0deg) rotateX(0deg); }
          50% { transform: perspective(800px) rotateY(180deg) rotateX(10deg); }
          100% { transform: perspective(800px) rotateY(360deg) rotateX(0deg); }
        }
        @keyframes floatShield {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
      `}</style>

      <div className="card anim-fadeup" style={{
        width: '100%',
        maxWidth: 480,
        padding: 0,
        background: 'linear-gradient(145deg, rgba(8, 20, 38, 0.98), rgba(4, 10, 24, 0.99))',
        border: '1.5px solid rgba(0,240,255,0.4)',
        borderRadius: 18,
        boxShadow: '0 0 50px rgba(0,240,255,0.25), 0 25px 60px rgba(0,0,0,0.9)',
        overflow: 'hidden'
      }}>

        {/* Top Gradient Glow Bar */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #00f0ff, #8b5cf6, #10b981)' }} />

        {/* Header with 3D Rotating Glassmorphic Logo */}
        <div style={{ padding: '28px 28px 18px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{
            width: 68,
            height: 68,
            borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(139,92,246,0.25))',
            border: '2px solid rgba(0,240,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px',
            fontSize: '2.2rem',
            boxShadow: '0 0 30px rgba(0,240,255,0.45)',
            animation: 'rotate3dLogo 8s ease-in-out infinite, floatShield 3s ease-in-out infinite',
            transformStyle: 'preserve-3d'
          }}>
            🛡️
          </div>

          <h2 style={{ fontWeight: 900, fontSize: '1.3rem', color: '#fff', letterSpacing: '-.2px', margin: '0 0 4px' }}>
            CyberShield AI Security Portal
          </h2>
          <p style={{ ...M, fontSize: '.7rem', color: '#67e8f9', margin: 0 }}>
            JWT Authenticated Zero-Trust Access &bull; IEEE v1.0
          </p>

          {/* Mode Switcher Pills */}
          <div style={{ display: 'flex', gap: 4, padding: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)', marginTop: 16 }}>
            <button
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: mode === 'login' ? 'linear-gradient(135deg, rgba(0,240,255,0.25), rgba(2,132,199,0.3))' : 'transparent',
                color: mode === 'login' ? '#a5f3fc' : '#64748b',
                ...M,
                fontSize: '.74rem',
                fontWeight: mode === 'login' ? 800 : 400
              }}
            >
              Sign In (Login)
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); }}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                background: mode === 'register' ? 'linear-gradient(135deg, rgba(139,92,246,0.25), rgba(109,40,217,0.3))' : 'transparent',
                color: mode === 'register' ? '#ddd6fe' : '#64748b',
                ...M,
                fontSize: '.74rem',
                fontWeight: mode === 'register' ? 800 : 400
              }}
            >
              Create Account (Register)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={submit} style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div style={{ padding: '9px 14px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#fca5a5', fontSize: '.76rem', ...M }}>
              ⚠️ {error}
            </div>
          )}

          <div>
            <label style={{ ...M, fontSize: '.64rem', color: '#94a3b8', display: 'block', marginBottom: 5 }}>USERNAME</label>
            <input
              className="inp"
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: '.84rem' }}
              placeholder="e.g. pratyush_secops"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ ...M, fontSize: '.64rem', color: '#94a3b8', display: 'block', marginBottom: 5 }}>EMAIL ADDRESS</label>
              <input
                className="inp"
                type="email"
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: '.84rem' }}
                placeholder="analyst@tcetmumbai.in"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <label style={{ ...M, fontSize: '.64rem', color: '#94a3b8', display: 'block', marginBottom: 5 }}>PASSWORD</label>
            <input
              className="inp"
              type="password"
              style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: '.84rem' }}
              placeholder="••••••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label style={{ ...M, fontSize: '.64rem', color: '#94a3b8', display: 'block', marginBottom: 5 }}>SECURITY ROLE / DESIGNATION</label>
              <select
                className="inp"
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: '.82rem' }}
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="SecOps Lead Analyst">SecOps Lead Analyst (Full Triage &amp; Patch Access)</option>
                <option value="CISO / Lead Auditor">CISO / Lead Auditor (Executive Briefings &amp; PDF Sign-off)</option>
                <option value="Faculty Reviewer / Examiner">Faculty Reviewer / Examiner (Defense &amp; Benchmarks)</option>
                <option value="Threat Hunter">Threat Hunter (XAI &amp; Attack Graph Simulator)</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '11px',
              fontSize: '.85rem',
              fontWeight: 800,
              marginTop: 4,
              boxShadow: '0 0 20px rgba(0,240,255,0.3)'
            }}
          >
            {loading ? 'Authenticating…' : mode === 'login' ? '🔐 Sign In with JWT Token' : '🛡️ Register Security Account'}
          </button>
        </form>

        {/* Quick Demo Login Presets */}
        <div style={{ padding: '14px 28px 18px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ ...M, fontSize: '.6rem', color: '#64748b', textAlign: 'center', marginBottom: 8, textTransform: 'uppercase' }}>
            ⚡ 1-Click Fast Demo Login Roles
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {[
              { label: '👑 Lead SecOps', usr: 'admin' },
              { label: '🏛️ CISO Auditor', usr: 'ciso' },
              { label: '🎓 Faculty Review', usr: 'secops' }
            ].map(b => (
              <button
                key={b.usr}
                onClick={() => quickLogin(b.usr)}
                style={{
                  padding: '7px 8px',
                  borderRadius: 7,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: '#cbd5e1',
                  ...M,
                  fontSize: '.66rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all .15s'
                }}
              >
                {b.label}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', ...M, fontSize: '.68rem' }}
            >
              Continue as Guest SOC Analyst ➔
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
