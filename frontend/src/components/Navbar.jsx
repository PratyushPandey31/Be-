import React, { useState, useEffect } from 'react';

const M = { fontFamily: "'JetBrains Mono',monospace" };

const TABS = [
  { id: 'dashboard',  icon: '⬡', label: 'Dashboard' },
  { id: 'aicopilot',  icon: '🤖', label: 'AI Copilot' },
  { id: 'assets',     icon: '◈', label: 'Asset Inventory' },
  { id: 'prioritize', icon: '⚡', label: 'AI Risk Engine' },
  { id: 'scanner',    icon: '◎', label: 'Vulnerability Scanner' },
  { id: 'evaluation', icon: '▦', label: 'IEEE Evaluation' },
  { id: 'report',     icon: '▤', label: 'Report Generator' },
];

/* ── Live Clock ── */
function LiveClock() {
  const [t, setT] = useState(new Date());
  useEffect(() => { const id = setInterval(() => setT(new Date()), 1000); return () => clearInterval(id); }, []);
  return (
    <span style={{ ...M, fontSize: '.7rem', color: '#475569' }}>
      {t.toLocaleTimeString('en-US', { hour12: false })}
    </span>
  );
}

export default function Navbar({ tab, setTab, online, stats, scanning, user, onOpenAuth, onLogout, onOpenPitchPad }) {
  const crit = stats?.threat_distribution?.CRITICAL || 0;
  const avg  = stats?.average_system_risk || 0;
  const rCol = avg >= 80 ? '#ef4444' : avg >= 60 ? '#f97316' : avg >= 40 ? '#f59e0b' : '#10b981';

  return (
    <header style={{
      background: 'rgba(3,7,18,0.92)',
      backdropFilter: 'blur(32px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 1px 0 rgba(0,240,255,0.08), 0 4px 32px rgba(0,0,0,0.6)',
      position: 'sticky', top: 0, zIndex: 50, padding: '0 20px',
    }}>
      {/* Scanning progress bar at very top */}
      {scanning && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'rgba(0,240,255,0.1)', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg,transparent,#00f0ff,#8b5cf6,transparent)', backgroundSize: '200% 100%', animation: 'shimmerBar 1.5s linear infinite' }} />
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 62, gap: 12 }}>

        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,240,255,0.09)', border: '1px solid rgba(0,240,255,0.28)',
            fontSize: '1.15rem', boxShadow: '0 0 14px rgba(0,240,255,0.18)',
            animation: 'pulse 2.5s ease infinite'
          }}>🛡️</div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: '1.02rem', color: '#fff', letterSpacing: '-.3px' }}>CyberShield AI</span>
              <span style={{ ...M, fontSize: '.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.4)', color: '#c4b5fd' }}>IEEE v1.0</span>
              {scanning && (
                <span style={{ ...M, fontSize: '.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 5, background: 'rgba(0,240,255,.12)', border: '1px solid rgba(0,240,255,.3)', color: '#67e8f9', animation: 'pulse 1s ease infinite' }}>
                  ◎ SCANNING
                </span>
              )}
            </div>
            <p style={{ fontSize: '.64rem', color: '#475569', marginTop: 0 }}>Intelligent Vulnerability Assessment &amp; Risk Prioritization</p>
          </div>
        </div>

        {/* Tabs */}
        <nav style={{ display: 'flex', gap: 2, background: 'rgba(255,255,255,0.03)', padding: 3, borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap' }}>
          {TABS.map(({ id, icon, label }) => (
            <button key={id} className={`nav-btn${tab === id ? ' active' : ''}`} onClick={() => setTab(id)} style={{ padding: '6px 13px', fontSize: '.74rem' }}>
              <span style={{ fontSize: '.85rem' }}>{icon}</span> {label}
            </button>
          ))}
        </nav>

        {/* User Auth Chip + Audit Download + Live Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Glowing Faculty Defense Pitch Pad Button */}
          <button
            onClick={onOpenPitchPad}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(234,88,12,0.3))',
              border: '1.5px solid #f59e0b',
              color: '#fbbf24',
              fontWeight: 900,
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: '.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 0 16px rgba(245,158,11,0.35)',
              animation: 'pulse 2s ease infinite'
            }}
            title="Open 30s Viva Pitch & Faculty Defense Cheat Sheet"
          >
            🎓 Faculty Pitch Pad
          </button>

          <button
            onClick={() => window.open('http://localhost:8000/api/report/benchmark-accuracy-pdf', '_blank')}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #00D26A, #005A9C)',
              color: '#fff',
              fontWeight: 800,
              padding: '6px 12px',
              borderRadius: 8,
              border: 'none',
              fontSize: '.68rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 0 14px rgba(0,210,106,0.4)'
            }}
            title="Download Full 4-Page Accuracy Benchmark Audit PDF"
          >
            📥 Audit PDF
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,240,255,0.2)', color: '#00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center', ...M, fontSize: '.7rem', fontWeight: 800 }}>
                {user.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ ...M, fontSize: '.68rem', color: '#fff', fontWeight: 700, lineHeight: 1 }}>{user.username}</span>
                <span style={{ ...M, fontSize: '.55rem', color: '#67e8f9', marginTop: 2 }}>{user.role || 'SecOps'}</span>
              </div>
              <button onClick={onLogout} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '.8rem', marginLeft: 4, padding: '2px 4px' }} title="Sign Out">
                🚪
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onOpenAuth} style={{ padding: '6px 14px', fontSize: '.74rem' }}>
              🔑 Sign In / Register
            </button>
          )}

          {stats && (
            <>
              <div style={{ padding: '5px 11px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, textAlign: 'center' }}>
                <p style={{ ...M, fontSize: '.58rem', color: '#64748b', letterSpacing: .5 }}>CRITICAL</p>
                <p style={{ ...M, fontSize: '.9rem', fontWeight: 800, color: '#ef4444', lineHeight: 1 }}>{crit}</p>
              </div>
              <div style={{ padding: '5px 11px', background: `${rCol}0d`, border: `1px solid ${rCol}25`, borderRadius: 7, textAlign: 'center' }}>
                <p style={{ ...M, fontSize: '.58rem', color: '#64748b', letterSpacing: .5 }}>RISK IDX</p>
                <p style={{ ...M, fontSize: '.9rem', fontWeight: 800, color: rCol, lineHeight: 1 }}>{avg}</p>
              </div>
            </>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, ...M, fontSize: '.68rem' }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: online ? '#10b981' : '#ef4444', boxShadow: online ? '0 0 8px #10b981' : 'none', animation: online ? 'pulse 2s infinite' : 'none' }} />
            <span style={{ color: '#64748b' }}>AI:</span>
            <span style={{ color: online ? '#34d399' : '#f87171', fontWeight: 700 }}>{online ? 'ONLINE' : 'OFFLINE'}</span>
            <span style={{ color: '#334155' }}>|</span>
            <LiveClock />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmerBar {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </header>
  );
}
