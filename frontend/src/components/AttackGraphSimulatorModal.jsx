import React, { useState, useEffect, useRef } from 'react';

const M = { fontFamily: "'JetBrains Mono', monospace" };

const NODES = [
  { id: 'attacker', label: 'APT-29 Attacker', sub: 'External Ingress', x: 70, y: 160, color: '#ef4444', icon: '💀', type: 'threat' },
  { id: 'gateway', label: 'CORP-CITRIX-GW-01', sub: '10.0.4.12 (DMZ Edge)', cve: 'CVE-2023-4966', cvss: 9.4, epss: 0.961, x: 270, y: 160, color: '#f97316', icon: '🛡️', type: 'perimeter' },
  { id: 'webserver', label: 'PROD-WEB-SERVER-01', sub: '10.0.1.50 (App Core)', cve: 'CVE-2021-44228', cvss: 10.0, epss: 0.976, x: 500, y: 90, color: '#f59e0b', icon: '💻', type: 'app' },
  { id: 'dc', label: 'FIN-WIN-DC-01', sub: '172.16.0.5 (Active Directory)', cve: 'CVE-2021-34527', cvss: 8.8, epss: 0.881, x: 720, y: 90, color: '#8b5cf6', icon: '🏛️', type: 'core' },
  { id: 'db', label: 'CORE-SQL-DB-01', sub: '172.16.0.8 (Crown Jewels)', cve: 'Encrypted Vault', cvss: 0.0, epss: 0.0, x: 920, y: 160, color: '#10b981', icon: '💎', type: 'crown' }
];

const KILLCHAIN_STEPS = [
  { step: 1, name: 'Reconnaissance & Ingress', from: 'attacker', to: 'gateway', desc: 'Attacker scans port 443; identifies vulnerable Citrix ADC gateway.', time: '00:00:01' },
  { step: 2, name: 'Initial Access (Citrix Bleed)', from: 'gateway', to: 'gateway', desc: 'Exploiting CVE-2023-4966: Session buffer overread allows MFA token bypass.', time: '00:00:03' },
  { step: 3, name: 'Lateral Pivot (Log4Shell)', from: 'gateway', to: 'webserver', desc: 'Lateral pivot to PROD-WEB-SERVER-01 via JNDI LDAP injection CVE-2021-44228.', time: '00:00:05' },
  { step: 4, name: 'Domain Escalation (PrintNightmare)', from: 'webserver', to: 'dc', desc: 'Exploiting CVE-2021-34527 to gain SYSTEM domain controller admin rights.', time: '00:00:08' },
  { step: 5, name: 'Data Exfiltration Intent', from: 'dc', to: 'db', desc: 'Attempting SQL data exfiltration from Crown Jewels financial database.', time: '00:00:11' }
];

export default function AttackGraphSimulatorModal({ onClose, API = 'http://127.0.0.1:8000/api' }) {
  const [activeStep, setActiveStep] = useState(0); // 0 = idle, 1..5 = in progress
  const [isRunning, setIsRunning]   = useState(false);
  const [isShielded, setIsShielded] = useState(false);
  const [shieldStep, setShieldStep] = useState(null); // step at which shield was deployed
  const [logMessages, setLogMessages] = useState([
    '⚡ Attack Graph Simulation Engine Initialized. Ready for MITRE ATT&CK Adversarial Simulation.'
  ]);
  const [selectedNode, setSelectedNode] = useState(NODES[1]);
  const timerRef = useRef(null);

  const addLog = (msg) => setLogMessages(prev => [msg, ...prev.slice(0, 14)]);

  const startSimulation = () => {
    setIsRunning(true);
    setIsShielded(false);
    setShieldStep(null);
    setActiveStep(1);
    addLog('🚨 SIMULATION STARTED: Threat Actor APT-29 initiating external perimeter scan on CORP-CITRIX-GW-01');

    let current = 1;
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      current += 1;
      if (current <= 5) {
        setActiveStep(current);
        const st = KILLCHAIN_STEPS[current - 1];
        addLog(`⚔️ KILLCHAIN STEP ${current}/5 [${st.name}]: ${st.desc}`);
      } else {
        clearInterval(timerRef.current);
        setIsRunning(false);
        addLog('💀 SIMULATION COMPLETE: Without AI Micro-Segmentation, Attacker reached Crown Jewels DB in 11.2 seconds!');
      }
    }, 2000);
  };

  const deployAIShield = () => {
    if (!isRunning && activeStep === 0) return;
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsShielded(true);
    setShieldStep(activeStep);
    addLog(`🛡️ ROBO AI AUTONOMOUS INTERVENTION TRIGGERED AT STEP ${activeStep}! Zero-Trust eBPF Micro-Segmentation enforced.`);
    addLog(`🔒 Network bridge between DMZ Edge and Internal Subnet SEVERED in 0.042ms.`);
    addLog(`✅ BLAST RADIUS CONTAINED: Crown Jewels SQL DB and Active Directory 100% PROTECTED.`);
  };

  const resetSimulation = () => {
    clearInterval(timerRef.current);
    setIsRunning(false);
    setIsShielded(false);
    setActiveStep(0);
    setShieldStep(null);
    setLogMessages(['⚡ Attack Graph Simulator reset to baseline zero-state.']);
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(2, 6, 20, 0.88)',
      backdropFilter: 'blur(20px)', zIndex: 120, display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="card anim-scaleup" style={{
        width: '100%', maxWidth: 1100, maxHeight: '92vh', overflowY: 'auto',
        background: 'linear-gradient(135deg, rgba(6, 18, 42, 0.98), rgba(15, 23, 42, 0.98))',
        border: '1.5px solid rgba(0, 240, 255, 0.4)', borderRadius: 16,
        padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16,
        boxShadow: '0 24px 80px rgba(0, 0, 0, 0.9), 0 0 40px rgba(0, 240, 255, 0.2)'
      }}>

        {/* Modal Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.4rem' }}>🌐</span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                Interactive Multi-Stage Cyber Attack Graph Simulator
              </h2>
              <span style={{ ...M, fontSize: '.62rem', fontWeight: 800, color: '#00f0ff', background: 'rgba(0,240,255,0.15)', border: '1px solid rgba(0,240,255,0.35)', padding: '2px 8px', borderRadius: 4 }}>
                MITRE ATT&CK LATERAL PATH ENGINE
              </span>
            </div>
            <p style={{ fontSize: '.76rem', color: '#94a3b8', margin: '4px 0 0' }}>
              Simulate real-world APT lateral movement from Internet Ingress to Crown Jewels DB &bull; Test 1-click autonomous AI micro-segmentation.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={startSimulation}
              disabled={isRunning}
              style={{
                background: isRunning ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #ef4444, #f97316)',
                color: '#fff', fontWeight: 900, padding: '8px 18px', borderRadius: 8,
                border: 'none', cursor: isRunning ? 'default' : 'pointer', ...M, fontSize: '.74rem',
                boxShadow: isRunning ? 'none' : '0 0 16px rgba(239,68,68,0.4)'
              }}
            >
              {isRunning ? '⏳ Attack Simulation Running…' : '🚀 Launch Attack Simulation'}
            </button>

            <button
              onClick={deployAIShield}
              disabled={!isRunning && activeStep === 0}
              style={{
                background: isShielded ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #00f0ff, #10b981)',
                color: isShielded ? '#34d399' : '#000', fontWeight: 900, padding: '8px 18px', borderRadius: 8,
                border: isShielded ? '1.5px solid #10b981' : 'none', cursor: 'pointer', ...M, fontSize: '.74rem',
                boxShadow: isShielded ? '0 0 20px rgba(16,185,129,0.4)' : '0 0 16px rgba(0,240,255,0.4)',
                animation: isRunning ? 'pulse 1s infinite' : 'none'
              }}
            >
              {isShielded ? '✅ AI Micro-Shield Active' : '🛡️ Deploy AI Micro-Segmentation'}
            </button>

            <button
              onClick={resetSimulation}
              style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', ...M, fontSize: '.74rem'
              }}
            >
              🔄 Reset
            </button>

            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.3rem', cursor: 'pointer', marginLeft: 6 }}>✕</button>
          </div>
        </div>

        {/* ── INTERACTIVE CANVAS / SVG ATTACK GRAPH ── */}
        <div style={{
          background: 'rgba(2, 6, 20, 0.95)', border: '1.5px solid rgba(0, 240, 255, 0.25)',
          borderRadius: 14, padding: '16px 14px', position: 'relative', overflow: 'hidden',
          boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.8)'
        }}>
          {/* SVG Connection Lines & Laser Beams */}
          <svg viewBox="0 0 1000 240" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="laserLine" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#ef4444" stopOpacity="1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="1" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Baseline Network Links */}
            <path d="M 70 160 L 270 160" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 270 160 Q 380 90 500 90" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" fill="none" />
            <path d="M 500 90 L 720 90" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M 720 90 Q 820 160 920 160" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeDasharray="4 4" fill="none" />

            {/* Active Exploit Lasers based on Killchain Step */}
            {activeStep >= 1 && (
              <path d="M 70 160 L 270 160" stroke="#ef4444" strokeWidth="4" filter="url(#glow)" strokeDasharray="8 4" />
            )}
            {activeStep >= 3 && !isShielded && (
              <path d="M 270 160 Q 380 90 500 90" stroke="#f59e0b" strokeWidth="4" filter="url(#glow)" strokeDasharray="8 4" fill="none" />
            )}
            {activeStep >= 4 && !isShielded && (
              <path d="M 500 90 L 720 90" stroke="#8b5cf6" strokeWidth="4" filter="url(#glow)" strokeDasharray="8 4" />
            )}
            {activeStep >= 5 && !isShielded && (
              <path d="M 720 90 Q 820 160 920 160" stroke="#ef4444" strokeWidth="4" filter="url(#glow)" strokeDasharray="8 4" fill="none" />
            )}

            {/* AI Micro-Shield Barrier Deflection */}
            {isShielded && (
              <g>
                <line x1="380" y1="40" x2="380" y2="200" stroke="#10b981" strokeWidth="4" strokeDasharray="6 2" filter="url(#glow)" />
                <rect x="340" y="100" width="80" height="30" rx="6" fill="rgba(16,185,129,0.2)" stroke="#10b981" strokeWidth="1.5" />
                <text x="380" y="120" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="800" fontFamily="'JetBrains Mono',monospace">🔒 AI SHIELD</text>
              </g>
            )}

            {/* Interactive Node Render */}
            {NODES.map((node) => {
              const isBreached = activeStep >= 1 && node.id === 'attacker' ||
                                 activeStep >= 2 && node.id === 'gateway' ||
                                 activeStep >= 3 && node.id === 'webserver' && !isShielded ||
                                 activeStep >= 4 && node.id === 'dc' && !isShielded ||
                                 activeStep >= 5 && node.id === 'db' && !isShielded;
              const isTargetSelected = selectedNode?.id === node.id;

              return (
                <g key={node.id} onClick={() => setSelectedNode(node)} style={{ cursor: 'pointer' }}>
                  {/* Outer Pulsing Ring if breached */}
                  {isBreached && (
                    <circle cx={node.x} cy={node.y} r="28" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6">
                      <animate attributeName="r" values="24;34;24" dur="1.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.5s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={node.x} cy={node.y} r="22"
                    fill={isBreached ? 'rgba(239,68,68,0.25)' : 'rgba(15,23,42,0.95)'}
                    stroke={isTargetSelected ? '#00f0ff' : isBreached ? '#ef4444' : node.color}
                    strokeWidth={isTargetSelected ? '3' : '2'}
                    filter="url(#glow)"
                  />
                  <text x={node.x} y={node.y + 6} textAnchor="middle" fontSize="16">{node.icon}</text>

                  {/* Node Label Below */}
                  <text x={node.x} y={node.y + 36} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="800" fontFamily="'JetBrains Mono',monospace">
                    {node.label}
                  </text>
                  <text x={node.x} y={node.y + 49} textAnchor="middle" fill={node.color} fontSize="9" fontFamily="'JetBrains Mono',monospace">
                    {node.sub}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── LOWER 2-COLUMN SECTION: Killchain Timeline & Target Forensic Card ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 14 }}>

          {/* Left: 5 Killchain Phases Progress */}
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ ...M, fontSize: '.68rem', fontWeight: 800, color: '#67e8f9', margin: 0, textTransform: 'uppercase' }}>
              ⚡ Real-Time MITRE Killchain Progression
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {KILLCHAIN_STEPS.map((st) => {
                const isPassed = activeStep > st.step;
                const isCurrent = activeStep === st.step;
                const isBlocked = isShielded && st.step > shieldStep;

                return (
                  <div
                    key={st.step}
                    style={{
                      padding: '8px 12px', borderRadius: 8,
                      background: isCurrent ? 'rgba(239,68,68,0.15)' : isPassed ? 'rgba(245,158,11,0.08)' : isBlocked ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)',
                      border: isCurrent ? '1.5px solid #ef4444' : isBlocked ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ ...M, fontSize: '.64rem', color: isBlocked ? '#34d399' : isCurrent ? '#f87171' : '#94a3b8', fontWeight: 800 }}>
                          PHASE {st.step}: {st.name}
                        </span>
                      </div>
                      <p style={{ fontSize: '.7rem', color: '#cbd5e1', margin: '2px 0 0' }}>{st.desc}</p>
                    </div>
                    <span style={{
                      ...M, fontSize: '.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4,
                      color: isBlocked ? '#34d399' : isCurrent ? '#f87171' : isPassed ? '#fbbf24' : '#64748b',
                      background: isBlocked ? 'rgba(16,185,129,0.15)' : isCurrent ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)'
                    }}>
                      {isBlocked ? '🛡️ CONTAINED' : isCurrent ? '● EXECUTING' : isPassed ? '✓ EXPLOITED' : 'STANDBY'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Node Forensics & Blast Radius */}
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ ...M, fontSize: '.68rem', fontWeight: 800, color: '#a78bfa', margin: 0, textTransform: 'uppercase' }}>
                🔍 Node Forensics: {selectedNode?.label}
              </p>
              <span style={{ ...M, fontSize: '.62rem', color: selectedNode?.color, background: `${selectedNode?.color}15`, border: `1px solid ${selectedNode?.color}35`, padding: '2px 7px', borderRadius: 4, fontWeight: 700 }}>
                {selectedNode?.type?.toUpperCase()}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 7 }}>
                <p style={{ ...M, fontSize: '.58rem', color: '#64748b', margin: '0 0 2px' }}>CVE IDENTIFIER</p>
                <p style={{ ...M, fontSize: '.76rem', color: '#67e8f9', fontWeight: 800, margin: 0 }}>{selectedNode?.cve || 'None'}</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: 7 }}>
                <p style={{ ...M, fontSize: '.58rem', color: '#64748b', margin: '0 0 2px' }}>CVSS / EPSS</p>
                <p style={{ ...M, fontSize: '.76rem', color: '#fbbf24', fontWeight: 800, margin: 0 }}>
                  {selectedNode?.cvss ? `${selectedNode.cvss} / ${(selectedNode.epss * 100).toFixed(1)}%` : 'Protected'}
                </p>
              </div>
            </div>

            {/* Live Event Stream Terminal */}
            <div style={{ background: '#010409', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 12px', flex: 1, maxHeight: 130, overflowY: 'auto' }}>
              <p style={{ ...M, fontSize: '.6rem', color: '#64748b', margin: '0 0 4px' }}>⬡ LIVE KERNEL &amp; SOAR TELEMETRY</p>
              {logMessages.map((log, idx) => (
                <p key={idx} style={{ ...M, fontSize: '.66rem', color: log.includes('BLAST') || log.includes('CONTAINED') ? '#34d399' : log.includes('🚨') || log.includes('💀') ? '#fca5a5' : '#cbd5e1', margin: '0 0 3px', lineHeight: 1.4 }}>
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
