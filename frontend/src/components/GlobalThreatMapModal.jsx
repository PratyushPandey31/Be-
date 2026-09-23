import React, { useState, useEffect, useRef } from 'react';

const M = { fontFamily: "'JetBrains Mono', monospace" };

const THREAT_ORIGINS = [
  { id: 'apt29', actor: 'APT-29 (Midnight Blizzard)', origin: 'Moscow, Russia (55.75° N, 37.61° E)', target: '10.0.1.50 (PROD-WEB-SERVER-01)', vector: 'CVE-2021-44228 Log4Shell JNDI Sweep', sev: 'CRITICAL', color: '#ef4444', x: 620, y: 110, tx: 280, ty: 150 },
  { id: 'volt', actor: 'Volt Typhoon (State-Sponsored)', origin: 'Shanghai, China (31.23° N, 121.47° E)', target: '192.168.1.1 (INFRA-NET-FW-01)', vector: 'CVE-2024-21762 FortiOS SSL-VPN Probe', sev: 'CRITICAL', color: '#f97316', x: 790, y: 180, tx: 280, ty: 150 },
  { id: 'lazarus', actor: 'Lazarus Group (Unit 180)', origin: 'Pyongyang, North Korea (39.03° N, 125.76° E)', target: '10.0.2.105 (PROD-DB-POSTGRES)', vector: 'SQL Credential Stuffing & Exfiltration', sev: 'HIGH', color: '#8b5cf6', x: 830, y: 160, tx: 280, ty: 150 },
  { id: 'elfin', actor: 'APT-33 (Elfin / Holmium)', origin: 'Tehran, Iran (35.68° N, 51.38° E)', target: '172.16.80.4 (SCADA-PLC-GATEWAY-09)', vector: 'ICS / SCADA Modbus Remote Command', sev: 'CRITICAL', color: '#ec4899', x: 650, y: 170, tx: 280, ty: 150 },
  { id: 'lockbit', actor: 'LockBit 3.0 Ransomware Core', origin: 'Darknet / Bulletproof Tor Exit Node', target: '10.0.4.12 (CORP-CITRIX-GW-01)', vector: 'CVE-2023-4966 Session Token Hijack', sev: 'CRITICAL', color: '#ef4444', x: 490, y: 120, tx: 280, ty: 150 }
];

export default function GlobalThreatMapModal({ onClose }) {
  const [defcon, setDefcon] = useState(3); // 1 = max lockdown, 3 = heightened, 5 = normal
  const [activeThreat, setActiveThreat] = useState(THREAT_ORIGINS[0]);
  const [isLockedDown, setIsLockedDown] = useState(false);
  const [tickerLogs, setTickerLogs] = useState([
    '⚡ Global Threat Intel Stream connected to CISA KEV, EPSS FIRST.org & Honeypot Grid.',
    '🚨 High-velocity SYN flood & exploit probe detected from 185.220.101.44 (LockBit Tor Proxy).',
    '🛡️ Active eBPF drop filters active on perimeter gateway.'
  ]);
  const [packetsIntercepted, setPacketsIntercepted] = useState(84920);

  useEffect(() => {
    const timer = setInterval(() => {
      setPacketsIntercepted(p => p + Math.floor(Math.random() * 18) + 4);
    }, 800);
    return () => clearInterval(timer);
  }, []);

  const triggerLockdown = () => {
    setIsLockedDown(true);
    setDefcon(1);
    setTickerLogs(prev => [
      '🔒 [DEFCON 1] GLOBAL PERIMETER LOCKDOWN ENFORCED: All 5 nation-state Ingress IP ranges severed in 0.008ms.',
      '✅ 100% Ingress traffic restricted to Zero-Trust mTLS verified tunnels.',
      ...prev.slice(0, 8)
    ]);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.92)',
      backdropFilter: 'blur(24px) saturate(200%)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18
    }}>
      <div className="card anim-scaleup" style={{
        width: '100%', maxWidth: 1140, maxHeight: '94vh', overflowY: 'auto',
        background: 'linear-gradient(135deg, rgba(6, 18, 42, 0.98), rgba(15, 23, 42, 0.98))',
        border: `1.5px solid ${isLockedDown ? '#10b981' : defcon === 1 ? '#ef4444' : '#00f0ff'}`,
        borderRadius: 18, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16,
        boxShadow: `0 24px 80px rgba(0,0,0,0.9), 0 0 50px ${isLockedDown ? 'rgba(16,185,129,0.3)' : 'rgba(0,240,255,0.2)'}`
      }}>

        {/* Header with DEFCON status & Action */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.4rem', animation: 'pulse 1.2s infinite' }}>🛰️</span>
              <h2 style={{ fontSize: '1.28rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                Global Threat Radar &amp; Real-Time Cyber Warfare Map
              </h2>
              <span style={{
                ...M, fontSize: '.62rem', fontWeight: 800, padding: '3px 9px', borderRadius: 5,
                background: defcon === 1 ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)',
                border: `1px solid ${defcon === 1 ? '#ef4444' : '#f59e0b'}`,
                color: defcon === 1 ? '#f87171' : '#fbbf24'
              }}>
                DEFCON {defcon} : {defcon === 1 ? 'MAXIMUM CYBER WARFARE LOCKDOWN' : 'HEIGHTENED SURVEILLANCE'}
              </span>
            </div>
            <p style={{ fontSize: '.76rem', color: '#94a3b8', margin: '4px 0 0' }}>
              Real-time geospatial telemetry tracking nation-state threat actors, C2 beaconing &amp; weaponized zero-day exploits targeting your infrastructure.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={triggerLockdown}
              disabled={isLockedDown}
              style={{
                background: isLockedDown ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: isLockedDown ? '1.5px solid #10b981' : 'none',
                color: isLockedDown ? '#34d399' : '#fff', fontWeight: 900,
                padding: '9px 18px', borderRadius: 8, cursor: isLockedDown ? 'default' : 'pointer',
                ...M, fontSize: '.74rem', boxShadow: isLockedDown ? '0 0 16px rgba(16,185,129,0.3)' : '0 0 18px rgba(239,68,68,0.5)',
                animation: isLockedDown ? 'none' : 'pulse 1.5s infinite'
              }}
            >
              {isLockedDown ? '✓ GLOBAL DEFENSE PERIMETER LOCKED' : '🚨 Enforce Global DEFCON 1 Lockdown'}
            </button>

            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.3rem', cursor: 'pointer', marginLeft: 6 }}>✕</button>
          </div>
        </div>

        {/* ── INTERACTIVE 2D/3D GEOSPATIAL VECTOR MAP ── */}
        <div style={{
          background: 'rgba(2, 6, 20, 0.96)', border: '1.5px solid rgba(0, 240, 255, 0.25)',
          borderRadius: 14, padding: '16px 14px', position: 'relative', overflow: 'hidden',
          boxShadow: 'inset 0 4px 24px rgba(0,0,0,0.85)'
        }}>
          {/* Animated Holographic Scanline */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'linear-gradient(180deg, transparent 0%, rgba(0,240,255,0.06) 50%, transparent 100%)',
            backgroundSize: '100% 80px', animation: 'shimmerBar 4s linear infinite'
          }} />

          <svg viewBox="0 0 1000 360" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <filter id="laserGlow">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Stylized Continents Outlines */}
            {/* North America */}
            <path d="M 120 80 Q 240 60 300 120 Q 320 180 260 210 Q 180 230 140 180 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(0,240,255,0.2)" strokeWidth="1.5" />
            {/* South America */}
            <path d="M 280 230 Q 340 250 330 320 Q 290 350 270 300 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(0,240,255,0.15)" strokeWidth="1.5" />
            {/* Europe */}
            <path d="M 460 80 Q 560 70 580 140 Q 520 160 460 130 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(0,240,255,0.2)" strokeWidth="1.5" />
            {/* Africa */}
            <path d="M 480 160 Q 580 160 570 270 Q 510 300 480 220 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(0,240,255,0.15)" strokeWidth="1.5" />
            {/* Asia */}
            <path d="M 600 70 Q 860 60 880 180 Q 760 240 620 180 Z" fill="rgba(255,255,255,0.04)" stroke="rgba(0,240,255,0.2)" strokeWidth="1.5" />
            {/* Australia */}
            <path d="M 780 260 Q 880 260 860 320 Q 800 330 780 290 Z" fill="rgba(255,255,255,0.03)" stroke="rgba(0,240,255,0.15)" strokeWidth="1.5" />

            {/* Target Enterprise Datacenter Hub (US-East) */}
            <circle cx="280" cy="150" r="14" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="2" filter="url(#laserGlow)" />
            <circle cx="280" cy="150" r="5" fill="#34d399" />
            <text x="280" y="180" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="900" fontFamily="'JetBrains Mono',monospace">
              🏢 HQ PRIMARY VAULT (10.0.x.x)
            </text>

            {/* Live Attack Vectors & Particle Laser Lines */}
            {THREAT_ORIGINS.map(t => {
              const isSelected = activeThreat.id === t.id;
              return (
                <g key={t.id} onClick={() => setActiveThreat(t)} style={{ cursor: 'pointer' }}>
                  {/* Trajectory Curve */}
                  <path
                    d={`M ${t.x} ${t.y} Q ${(t.x + t.tx) / 2} ${(t.y + t.ty) / 2 - 40} ${t.tx} ${t.ty}`}
                    stroke={isLockedDown ? '#10b981' : t.color}
                    strokeWidth={isSelected ? '3' : '1.8'}
                    strokeDasharray={isLockedDown ? '4 4' : '8 4'}
                    fill="none"
                    filter="url(#laserGlow)"
                    opacity={isSelected ? 1 : 0.65}
                  />

                  {/* Threat Node Origin Dot with Pulsing Ring */}
                  <circle cx={t.x} cy={t.y} r="16" fill="none" stroke={t.color} strokeWidth="1.5" opacity="0.7">
                    <animate attributeName="r" values="8;20;8" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={t.x} cy={t.y} r="6" fill={t.color} />
                  <text x={t.x} y={t.y - 12} textAnchor="middle" fill="#fff" fontSize="10" fontWeight="800" fontFamily="'JetBrains Mono',monospace">
                    {t.actor.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── BOTTOM CONTROLS & THREAT FORENSICS CARD ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>

          {/* Threat Feeds List */}
          <div style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ ...M, fontSize: '.68rem', fontWeight: 800, color: '#67e8f9', margin: 0, textTransform: 'uppercase' }}>
              📡 Active Nation-State Adversaries ({THREAT_ORIGINS.length} Tracked)
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {THREAT_ORIGINS.map(t => (
                <div
                  key={t.id}
                  onClick={() => setActiveThreat(t)}
                  style={{
                    padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                    background: activeThreat.id === t.id ? `${t.color}18` : 'rgba(255,255,255,0.02)',
                    border: activeThreat.id === t.id ? `1.5px solid ${t.color}` : '1px solid rgba(255,255,255,0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all .15s ease'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ ...M, fontSize: '.68rem', fontWeight: 800, color: t.color }}>{t.actor}</span>
                      <span style={{ ...M, fontSize: '.58rem', background: `${t.color}25`, color: t.color, padding: '1px 6px', borderRadius: 4 }}>{t.sev}</span>
                    </div>
                    <p style={{ fontSize: '.7rem', color: '#94a3b8', margin: '2px 0 0' }}>Origin: {t.origin}</p>
                  </div>
                  <span style={{ ...M, fontSize: '.62rem', color: isLockedDown ? '#34d399' : '#00f0ff' }}>
                    {isLockedDown ? '🛡️ DROPPED' : 'INTERCEPTING →'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Threat Forensics & Live Telemetry Ticker */}
          <div style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ ...M, fontSize: '.68rem', fontWeight: 800, color: '#a78bfa', margin: 0, textTransform: 'uppercase' }}>
                🔍 Vector Forensics: {activeThreat.actor}
              </p>
              <span style={{ ...M, fontSize: '.65rem', color: '#34d399', fontWeight: 800 }}>
                ⚡ {packetsIntercepted.toLocaleString()} Packets Screened
              </span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
              <p style={{ ...M, fontSize: '.6rem', color: '#64748b', margin: '0 0 2px' }}>TARGETED ASSET &amp; EXPLOIT</p>
              <p style={{ ...M, fontSize: '.76rem', color: '#f1f5f9', fontWeight: 700, margin: '0 0 3px' }}>{activeThreat.target}</p>
              <p style={{ ...M, fontSize: '.72rem', color: activeThreat.color, margin: 0 }}>{activeThreat.vector}</p>
            </div>

            {/* Live Ticker */}
            <div style={{ background: '#010409', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 12px', flex: 1, maxHeight: 110, overflowY: 'auto' }}>
              <p style={{ ...M, fontSize: '.58rem', color: '#64748b', margin: '0 0 3px' }}>⬡ LIVE SOAR EVENT STREAM</p>
              {tickerLogs.map((log, i) => (
                <p key={i} style={{ ...M, fontSize: '.64rem', color: log.includes('LOCKDOWN') || log.includes('100%') ? '#34d399' : log.includes('🚨') ? '#fca5a5' : '#cbd5e1', margin: '0 0 3px', lineHeight: 1.35 }}>
                  {log}
                </p>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
