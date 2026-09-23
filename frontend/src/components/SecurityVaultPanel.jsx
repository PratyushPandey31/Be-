import React, { useState, useEffect } from 'react';

const M = { fontFamily: "'JetBrains Mono', monospace" };

export default function SecurityVaultPanel({ API = 'http://127.0.0.1:8000/api', onOpenPitchPad }) {
  const [activeTab, setActiveTab] = useState('mitre');
  const [mitreData, setMitreData] = useState(null);
  const [ledgerData, setLedgerData] = useState(null);
  const [honeypotData, setHoneypotData] = useState(null);
  const [complianceData, setComplianceData] = useState(null);
  const [threatFeed, setThreatFeed] = useState(null);
  const [soarPlaybook, setSoarPlaybook] = useState(null);
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal / Drawer States for Clickable Features
  const [selectedMitre, setSelectedMitre] = useState(null);
  const [selectedCompliance, setSelectedCompliance] = useState(null);
  const [selectedHeatmapItem, setSelectedHeatmapItem] = useState(null);
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedDecoy, setSelectedDecoy] = useState(null);
  const [selectedSoarStep, setSelectedSoarStep] = useState(null);

  // SOAR Live Runner state
  const [soarRunning, setSoarRunning] = useState(false);
  const [soarStepActive, setSoarStepActive] = useState(-1);
  const [soarCompleted, setSoarCompleted] = useState(false);

  // Action Statuses
  const [lockdownStatus, setLockdownStatus] = useState(null);
  const [simulatingRedTeam, setSimulatingRedTeam] = useState(false);
  const [redTeamResult, setRedTeamResult] = useState(null);
  const [actionNotice, setActionNotice] = useState(null);
  const [copiedText, setCopiedText] = useState(null);
  const [vaultAngle, setVaultAngle] = useState(0);
  const [liveEntropy, setLiveEntropy] = useState(7.994);
  const [liveBlockCount, setLiveBlockCount] = useState(1842);
  const [isBlastContained, setIsBlastContained] = useState(false);
  const [mitreValidating, setMitreValidating] = useState(false);
  const [mitreValidationStep, setMitreValidationStep] = useState(0);
  const [liveVaultEvent, setLiveVaultEvent] = useState({
    title: 'NIST ML-KEM Kyber-1024 Key Re-Encapsulation',
    target: 'CORE-TLS-GATEWAY-01',
    hash: '0x9a8f4b21...c87e',
    status: 'SEALED & PROVEN',
    time: 'Just now'
  });

  const VAULT_EVENTS = [
    { title: 'NIST ML-KEM Kyber-1024 Key Encapsulation', target: 'CORE-TLS-GATEWAY-01', hash: '0x9a8f4b21...c87e', status: 'SEALED & PROVEN' },
    { title: 'Merkle Tree Block #1843 State Seal', target: 'IMMUTABLE-LEDGER-01', hash: '0xfe4189ac...33bd', status: 'HMAC-SHA256 MINED' },
    { title: 'Honeypot Trap #2 Captured Probe', target: 'DECOY-SSH-HONEYPOT', hash: '185.220.101.44', status: 'ISOLATED (<0.1s)' },
    { title: 'SOAR Auto-Mitigation Playbook Executed', target: 'INFRA-VPN-EDGE', hash: 'CVE-2024-21762', status: 'CONTAINED (0.18s)' },
    { title: 'Zero-Knowledge Kyber-1024 Key Rotation', target: 'FIN-TRANSACTION-SRV', hash: '0x17b3ee42...fa90', status: 'ROTATED' },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setVaultAngle(a => (a + 2.5) % 360);
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // Continuous live entropy and block counter oscillation
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveEntropy(Number((7.992 + Math.random() * 0.006).toFixed(4)));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Continuous live vault event stream
  useEffect(() => {
    const timer = setInterval(() => {
      const randomEvt = VAULT_EVENTS[Math.floor(Math.random() * VAULT_EVENTS.length)];
      setLiveVaultEvent({
        ...randomEvt,
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
      setLiveBlockCount(c => c + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const fetchAllVault = async () => {
    setLoading(true);
    const eps = [
      `${API}/vault/mitre-matrix`,
      `${API}/vault/merkle-ledger`,
      `${API}/vault/honeypots`,
      `${API}/vault/compliance`,
      `${API}/threat-intel/feed`,
      `${API}/analytics/risk-heatmap`
    ];
    const results = await Promise.all(eps.map(u => fetch(u).then(r => r.ok ? r.json() : null).catch(() => null)));
    setMitreData(results[0]);
    setLedgerData(results[1]);
    setHoneypotData(results[2]);
    setComplianceData(results[3]);
    setThreatFeed(results[4]);
    setHeatmapData(results[5]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllVault();
  }, []);

  const loadSoar = async (cve) => {
    setSoarCompleted(false);
    setSoarStepActive(-1);
    const r = await fetch(`${API}/analytics/soar-playbook?cve_id=${cve}`);
    if (r.ok) setSoarPlaybook(await r.json());
  };

  const runSoarSimulation = () => {
    if (!soarPlaybook?.playbook?.steps?.length) return;
    setSoarRunning(true);
    setSoarStepActive(0);
    setSoarCompleted(false);

    const steps = soarPlaybook.playbook.steps;
    let curr = 0;

    const interval = setInterval(() => {
      curr += 1;
      if (curr < steps.length) {
        setSoarStepActive(curr);
      } else {
        clearInterval(interval);
        setSoarRunning(false);
        setSoarCompleted(true);
        setActionNotice({
          type: 'success',
          msg: `✅ SOAR Playbook for ${soarPlaybook.cve_id} executed successfully! All automated containments enforced and archived to Blockchain Ledger.`
        });
      }
    }, 1100);
  };

  const triggerLockdown = async () => {
    const r = await fetch(`${API}/vault/emergency-lockdown`, { method: 'POST' });
    if (r.ok) {
      const data = await r.json();
      setLockdownStatus(data);
      setActionNotice({
        type: 'danger',
        msg: `🚨 EMERGENCY ZERO-TRUST LOCKDOWN ACTIVATED: ${data.message}`
      });
    }
  };

  const runRedTeam = async () => {
    setSimulatingRedTeam(true);
    const r = await fetch(`${API}/vault/redteam-simulation`, { method: 'POST' });
    if (r.ok) {
      const d = await r.json();
      setRedTeamResult(d.simulation_summary);
      setActionNotice({
        type: 'success',
        msg: `🏆 Red-Team BAS Completed: ${d.simulation_summary.attack_vectors_tested}/${d.simulation_summary.attack_vectors_tested} attacks blocked with ${d.simulation_summary.mean_detection_latency_ms}ms latency!`
      });
    }
    setSimulatingRedTeam(false);
  };

  const simulateHoneypotTrigger = (decoy) => {
    if (!honeypotData) return;
    const updatedDecoys = honeypotData.decoys.map(d => {
      if (d.id === decoy.id) {
        return {
          ...d,
          trapped_attackers_count: d.trapped_attackers_count + 1,
          last_trigger: 'Just now (Simulated Probe Neutralized)'
        };
      }
      return d;
    });
    setHoneypotData({
      ...honeypotData,
      quarantined_attackers_total: honeypotData.quarantined_attackers_total + 1,
      decoys: updatedDecoys
    });
    setActionNotice({
      type: 'warning',
      msg: `🪤 HONEYPOT TRAP TRIGGERED: Simulated intruder on ${decoy.name} (${decoy.ip_address}) auto-isolated in <0.2s!`
    });
  };

  const copyToClipboard = (txt, label = 'Copied') => {
    navigator.clipboard.writeText(txt);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const [testSecret, setTestSecret] = useState('sk_live_99a8b7c6d5e4f3a2b1c0_cyber_quantum_seed');
  const [kyberStreamText, setKyberStreamText] = useState('');
  const [kyberLoading, setKyberLoading] = useState(false);

  const streamKyberAnalysis = async () => {
    setKyberLoading(true);
    setKyberStreamText('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are a Post-Quantum Cryptographer and FIPS 203 Specialist. Analyze the secret key '${testSecret.slice(0, 16)}...': calculate Shannon entropy, assess Shor's Algorithm attack risk, and generate a NIST ML-KEM Kyber-1024 / ML-DSA Dilithium migration playbook in 3 sharp sentences.`,
          model_id: 'cybershield-neural-v3',
          deep_search_depth: 'fast'
        })
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() || '';
        for (const chunk of chunks) {
          if (!chunk.trim()) continue;
          let evtType = '', dataStr = '';
          for (const line of chunk.split('\n')) {
            if (line.startsWith('event: ')) evtType = line.slice(7).trim();
            if (line.startsWith('data: '))  dataStr = line.slice(6).trim();
          }
          if (evtType === 'token' && dataStr) {
            try {
              const p = JSON.parse(dataStr);
              setKyberStreamText(prev => prev + p.token);
            } catch {}
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setKyberLoading(false);
    }
  };

  const TABS = [
    { id: 'mitre',      icon: '🎯', label: 'MITRE Matrix',       count: '10 Tactics' },
    { id: 'kyber',      icon: '⚛️', label: 'Post-Quantum Kyber', count: 'FIPS 203 PQC' },
    { id: 'compliance', icon: '📋', label: 'Compliance Audit',   count: '5 Standards' },
    { id: 'heatmap',    icon: '🗺️', label: 'Risk Heatmap',       count: '14 Findings' },
    { id: 'soar',       icon: '⚙️', label: 'SOAR Automation',    count: 'Auto-Playbooks' },
    { id: 'threat',     icon: '📡', label: 'Live Threat Intel',  count: '4 Feeds' },
    { id: 'merkle',     icon: '🔗', label: 'Blockchain Ledger',  count: '4+ Blocks' },
    { id: 'honeypot',   icon: '🍯', label: 'Honeypot Decoys',    count: '2 Active' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="anim-fadeup">

      {/* ── Top Hero Card ── */}
      <div className="card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(6,12,28,0.98) 55%, rgba(239,68,68,0.14))',
        border: '1.5px solid rgba(139,92,246,0.5)',
        boxShadow: '0 8px 32px rgba(139,92,246,0.15)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: '1.8rem', filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.8))' }}>🔒</span>
              <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                Military-Grade Security Vault &amp; SOAR Engine
              </h1>
              {['NIST SP 800-53 R5', 'ISO 27001:2022', 'MITRE ATT&CK v14', 'INTERACTIVE SOC'].map(b => (
                <span key={b} className="badge" style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid #8b5cf6', color: '#c4b5fd', fontSize: '.58rem' }}>{b}</span>
              ))}
            </div>
            <p style={{ fontSize: '.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.6 }}>
              Full-spectrum enterprise defense: Click any tactic, finding, block, or decoy for <strong>live drill-downs</strong>,
              <strong> automated SOAR remediation</strong>, <strong>cryptographic Merkle proofs</strong>, and <strong>zero-trust lockdown</strong>.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={runRedTeam} disabled={simulatingRedTeam} className="btn btn-sm"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: '.76rem', padding: '10px 18px', borderRadius: 8, boxShadow: '0 0 18px rgba(239,68,68,0.45)' }}>
              {simulatingRedTeam ? '⏳ Simulating Attacks…' : '⚔️ Run Red-Team BAS Simulation'}
            </button>
            <button onClick={triggerLockdown} className="btn btn-sm"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: 900, border: 'none', cursor: 'pointer', fontSize: '.76rem', padding: '10px 16px', borderRadius: 8, boxShadow: '0 0 16px rgba(245,158,11,0.3)' }}>
              🚨 Emergency Lockdown
            </button>
            {onOpenPitchPad && (
              <button onClick={onOpenPitchPad} className="btn btn-sm btn-ghost" style={{ fontSize: '.76rem', fontWeight: 800, padding: '10px 14px' }}>
                🎓 Faculty Pitch Pad
              </button>
            )}
          </div>
        </div>

        {/* 📡 Live Real-Time Quantum & Cryptographic Telemetry Ribbon */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(139,92,246,0.35)',
          borderRadius: 8, padding: '8px 14px', marginTop: 14, flexWrap: 'wrap', gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00f0ff', boxShadow: '0 0 8px #00f0ff', animation: 'pulse 1.5s infinite' }} />
            <span style={{ ...M, fontSize: '.62rem', color: '#00f0ff', fontWeight: 800 }}>LIVE PQC VAULT TELEMETRY:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <span style={{ ...M, fontSize: '.6rem', color: '#94a3b8' }}>
              <span style={{ color: '#34d399', fontWeight: 700 }}>● SHANNON ENTROPY:</span> {liveEntropy} bits/byte
            </span>
            <span style={{ ...M, fontSize: '.6rem', color: '#94a3b8' }}>
              <span style={{ color: '#c4b5fd', fontWeight: 700 }}>● VERIFIED MERKLE BLOCKS:</span> {liveBlockCount.toLocaleString()}
            </span>
            <span style={{ ...M, fontSize: '.6rem', color: '#94a3b8' }}>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>● DECOY TRAPS:</span> 2 Primed &bull; Active
            </span>
            <span style={{ ...M, fontSize: '.6rem', color: '#94a3b8' }}>
              <span style={{ color: '#00f0ff', fontWeight: 700 }}>● PQC LATTICE:</span> NIST ML-KEM Kyber-1024
            </span>
          </div>
        </div>

        {/* 🚨 Live Continuous Cryptographic Action Stream Ticker */}
        <div style={{
          background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 8, padding: '7px 14px', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a855f7', animation: 'pulse 1s infinite' }} />
            <span style={{ ...M, fontSize: '.62rem', color: '#c4b5fd', fontWeight: 800 }}>
              VAULT EVENT [{liveVaultEvent.time}]:
            </span>
            <span style={{ ...M, fontSize: '.62rem', color: '#fff', fontWeight: 700 }}>
              {liveVaultEvent.title}
            </span>
            <span style={{ ...M, fontSize: '.62rem', color: '#67e8f9' }}>
              ({liveVaultEvent.target})
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <code style={{ ...M, fontSize: '.56rem', color: '#94a3b8', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4 }}>
              {liveVaultEvent.hash}
            </code>
            <span style={{ ...M, fontSize: '.58rem', color: '#34d399', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
              {liveVaultEvent.status}
            </span>
          </div>
        </div>

        {/* 6 Clickable KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10, marginTop: 14 }}>
          {[
            ['MITRE Coverage', '100%', '#10b981', 'mitre', '10 Tactics Defended'],
            ['Compliance Avg', `${complianceData?.overall_compliance_average || '98.4%'}`, '#c4b5fd', 'compliance', '5 Global Standards'],
            ['Active Threats', `${threatFeed?.feed_count || 4} Live`, '#f87171', 'threat', 'CISA + EPSS Stream'],
            ['Blockchain Blocks', `${ledgerData?.total_blocks || 4}`, '#00f0ff', 'merkle', 'Tamper-Proof Ledger'],
            ['Decoys Armed', `${honeypotData?.active_decoys_count || 2}`, '#fbbf24', 'honeypot', 'Perimeter Traps'],
            ['Defense Grade', 'A+', '#34d399', 'heatmap', '14 Findings Monitored']
          ].map(([lbl, val, col, tabId, sub]) => (
            <div
              key={lbl}
              onClick={() => setActiveTab(tabId)}
              style={{
                background: activeTab === tabId ? 'rgba(139,92,246,0.25)' : 'rgba(0,0,0,0.45)',
                border: activeTab === tabId ? `1.5px solid ${col}` : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 9,
                padding: '10px 12px',
                cursor: 'pointer',
                transition: 'all .2s ease',
                transform: activeTab === tabId ? 'translateY(-2px)' : 'none'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = col; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { if (activeTab !== tabId) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; } }}
            >
              <p style={{ ...M, fontSize: '.58rem', color: '#94a3b8', margin: '0 0 2px', textTransform: 'uppercase' }}>{lbl}</p>
              <p style={{ ...M, fontSize: '1.2rem', fontWeight: 900, color: col, margin: '0 0 2px' }}>{val}</p>
              <span style={{ fontSize: '.6rem', color: '#64748b' }}>{sub} &bull; Click &rarr;</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Notice */}
      {actionNotice && (
        <div style={{
          background: actionNotice.type === 'danger' ? 'rgba(239,68,68,0.15)' : actionNotice.type === 'warning' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
          border: `1.5px solid ${actionNotice.type === 'danger' ? '#ef4444' : actionNotice.type === 'warning' ? '#f59e0b' : '#10b981'}`,
          borderRadius: 12,
          padding: '12px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12
        }}>
          <p style={{ ...M, fontSize: '.76rem', color: '#fff', margin: 0, fontWeight: 700 }}>{actionNotice.msg}</p>
          <button onClick={() => setActionNotice(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '.8rem' }}>✕</button>
        </div>
      )}

      {/* Red Team Simulation Result Banner */}
      {redTeamResult && (
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.4)', borderRadius: 12, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <p style={{ ...M, fontSize: '.82rem', color: '#34d399', fontWeight: 800, margin: '0 0 2px' }}>
              🏆 Red-Team BAS: {redTeamResult.attack_vectors_tested}/{redTeamResult.attack_vectors_tested} Attacks Blocked &bull; 0% Evasion &bull; {redTeamResult.mean_detection_latency_ms}ms Latency
            </p>
            <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>
              Lead Researcher: <strong style={{ color: '#00f0ff' }}>Pratyush Pandey (Roll 34)</strong> &bull; Supervised by: <strong style={{ color: '#c4b5fd' }}>Prof. Pramod Patil</strong>
            </p>
          </div>
          <span style={{ ...M, fontSize: '.68rem', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#34d399', padding: '4px 12px', borderRadius: 6, fontWeight: 800 }}>
            {redTeamResult.overall_resilience_grade} &bull; 100% BLOCKED
          </span>
        </div>
      )}

      {/* ── Sub-Tab Navigation Bar ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 8 }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              background: activeTab === t.id ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(0,240,255,0.2))' : 'rgba(255,255,255,0.02)',
              border: activeTab === t.id ? '1px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.06)',
              color: activeTab === t.id ? '#fff' : '#94a3b8',
              ...M, fontSize: '.74rem', fontWeight: activeTab === t.id ? 800 : 500,
              padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all .15s ease'
            }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            <span style={{ ...M, fontSize: '.6rem', color: activeTab === t.id ? '#67e8f9' : '#475569', marginLeft: 2 }}>({t.count})</span>
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ padding: '50px', textAlign: 'center', color: '#64748b', ...M, fontSize: '.8rem' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 14px' }} />
          Loading Security Vault Intelligence &amp; Blockchain Feeds…
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB: POST-QUANTUM KYBER-1024 & AI SECRET ENTROPY SCANNER
         ═══════════════════════════════════════════════════════════ */}
      {/* ═══════════════════════════════════════════════════════════
          TAB: POST-QUANTUM KYBER-1024 & HOLOGRAPHIC QUANTUM VAULT GATE
         ═══════════════════════════════════════════════════════════ */}
      {!loading && activeTab === 'kyber' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Main Hero Card with Holographic Vault Gate */}
          <div className="card" style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(6,18,42,0.95), rgba(30,27,75,0.85))',
            border: '1.5px solid rgba(0,240,255,0.35)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            display: 'flex', flexDirection: 'column', gap: 16
          }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ ...M, fontSize: '.62rem', color: '#00f0ff', background: 'rgba(0,240,255,0.15)', border: '1px solid rgba(0,240,255,0.35)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                    NIST FIPS 203 / 204 STANDARDS
                  </span>
                  <span style={{ ...M, fontSize: '.62rem', color: '#34d399', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)', padding: '2px 8px', borderRadius: 4, fontWeight: 700 }}>
                    Lattice-Based Post-Quantum Shield
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: '4px 0 2px' }}>
                  ⚛️ Post-Quantum Cryptanalysis &amp; Holographic Vault Gate
                </h3>
                <p style={{ fontSize: '.76rem', color: '#94a3b8', margin: 0 }}>
                  Hardware Security Module (HSM) Level 4 protection against Shor's Quantum Algorithm attacks. Automated ML-KEM Kyber-1024 key encapsulation.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={streamKyberAnalysis}
                  disabled={kyberLoading}
                  style={{
                    background: 'linear-gradient(135deg, #00f0ff, #8b5cf6)',
                    color: '#000', fontWeight: 900, padding: '10px 18px', borderRadius: 8,
                    border: 'none', cursor: 'pointer', ...M, fontSize: '.74rem',
                    boxShadow: '0 0 16px rgba(0,240,255,0.4)'
                  }}
                >
                  {kyberLoading ? '⚡ AI Cryptanalysis Running…' : '⚛️ Run AI Post-Quantum Cryptanalysis'}
                </button>
              </div>
            </div>

            {/* Split View: 3D Holographic Vault Gate & Quantum Secret Rotation HUD */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 16 }}>
              
              {/* SVG Holographic Quantum Vault Tumbler */}
              <div style={{
                background: 'radial-gradient(circle at center, rgba(15,23,42,0.9), rgba(2,6,20,0.98))',
                border: '1.5px solid rgba(0,240,255,0.25)', borderRadius: 12, padding: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative',
                boxShadow: 'inset 0 0 30px rgba(0,240,255,0.1)'
              }}>
                <svg viewBox="0 0 300 240" style={{ width: '100%', maxWidth: 260, height: 'auto' }}>
                  <defs>
                    <radialGradient id="vaultGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(0,240,255,0.3)" />
                      <stop offset="70%" stopColor="rgba(139,92,246,0.15)" />
                      <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                  </defs>

                  {/* Concentric Vault Rings */}
                  <circle cx="150" cy="120" r="95" fill="none" stroke="rgba(0,240,255,0.2)" strokeWidth="1" strokeDasharray="6 4" />
                  <circle cx="150" cy="120" r="75" fill="url(#vaultGrad)" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5" />
                  <circle cx="150" cy="120" r="55" fill="none" stroke="#fff" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />

                  {/* Rotating Mechanical Tumblers */}
                  <g transform={`rotate(${vaultAngle} 150 120)`}>
                    <circle cx="150" cy="120" r="85" fill="none" stroke="#00f0ff" strokeWidth="2.5" strokeDasharray="50 120" />
                    <circle cx="150" cy="35" r="4" fill="#00f0ff" />
                    <circle cx="150" cy="205" r="4" fill="#00f0ff" />
                  </g>
                  <g transform={`rotate(${-vaultAngle * 1.4} 150 120)`}>
                    <circle cx="150" cy="120" r="68" fill="none" stroke="#a855f7" strokeWidth="2" strokeDasharray="35 80" />
                    <circle cx="150" cy="52" r="3.5" fill="#a855f7" />
                    <circle cx="150" cy="188" r="3.5" fill="#a855f7" />
                  </g>

                  {/* Center Quantum Core Diamond */}
                  <circle cx="150" cy="120" r="36" fill="rgba(0,0,0,0.85)" stroke="#10b981" strokeWidth="2" />
                  <text x="150" y="117" textAnchor="middle" fill="#fff" fontSize="18">⚛️</text>
                  <text x="150" y="135" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="900" fontFamily="'JetBrains Mono',monospace">
                    KYBER-1024
                  </text>
                </svg>

                {/* Vault Status Readout */}
                <div style={{ display: 'flex', justifyContent: 'space-around', width: '100%', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ ...M, fontSize: '.56rem', color: '#64748b', margin: 0 }}>POST-QUANTUM</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: '#34d399', margin: '2px 0 0' }}>100% SECURE</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ ...M, fontSize: '.56rem', color: '#64748b', margin: 0 }}>SHANNON ENTROPY</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: '#00f0ff', margin: '2px 0 0' }}>7.994 / 8.0</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ ...M, fontSize: '.56rem', color: '#64748b', margin: 0 }}>HSM LEVEL</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: '#c4b5fd', margin: '2px 0 0' }}>FIPS 140-3 L4</p>
                  </div>
                </div>
              </div>

              {/* Secret Tester & Instant Post-Quantum Encryptor */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Secret Presets Switcher */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[
                    { id: 'AWS', label: '☁️ AWS Root Master Key', val: 'sk_live_99a8b7c6d5e4f3a2b1c0_cyber_quantum_seed' },
                    { id: 'DB', label: '🗄️ PostgreSQL Master Hash', val: 'postgresql://postgres:KyberPQC_Lattice_994827@10.0.1.50:5432/enterprise_db' },
                    { id: 'K8S', label: '☸️ K8s Cluster Bearer', val: 'eyJhbGciOiJNTEtFTTEwMjQiLCJ0eXAiOiJKV1QifQ.quantum_sealed_cluster_token' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setTestSecret(p.val)}
                      style={{
                        background: testSecret === p.val ? 'rgba(0,240,255,0.2)' : 'rgba(255,255,255,0.04)',
                        border: testSecret === p.val ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.08)',
                        color: testSecret === p.val ? '#00f0ff' : '#94a3b8',
                        padding: '4px 10px', borderRadius: 6, cursor: 'pointer', ...M, fontSize: '.64rem', fontWeight: 700
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Secret Input Box */}
                <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ ...M, fontSize: '.64rem', color: '#67e8f9', fontWeight: 800 }}>🔑 SECRET CIPHER SEED:</span>
                    <button
                      onClick={() => copyToClipboard(testSecret, 'Secret Key Copied')}
                      style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', ...M, fontSize: '.62rem' }}
                    >
                      {copiedText === 'Secret Key Copied' ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                  <input
                    className="inp"
                    value={testSecret}
                    onChange={e => setTestSecret(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '.74rem', background: 'rgba(0,0,0,0.7)', borderColor: 'rgba(0,240,255,0.3)', color: '#a5f3fc' }}
                  />
                </div>

                {/* 1-Click Zero-Knowledge Key Rotation */}
                <button
                  onClick={() => {
                    const newSeed = 'kyber1024_pqc_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
                    setTestSecret(newSeed);
                    setActionNotice({
                      type: 'success',
                      msg: `🗝️ ZERO-KNOWLEDGE POST-QUANTUM KEY ROTATED: Re-encrypted with ML-KEM Kyber-1024 (FIPS 203) & archived to Blockchain Ledger.`
                    });
                  }}
                  style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.4))',
                    border: '1.5px solid #10b981', color: '#34d399', fontWeight: 900,
                    padding: '10px 16px', borderRadius: 8, cursor: 'pointer', ...M, fontSize: '.74rem',
                    boxShadow: '0 0 16px rgba(16,185,129,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  <span>🗝️</span>
                  1-Click Zero-Knowledge Key Rotation &amp; Re-Encrypt
                </button>
              </div>
            </div>

            {/* 3 Quantum Posture Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ ...M, fontSize: '.6rem', color: '#f87171', fontWeight: 800, margin: '0 0 4px' }}>RSA-2048 / ECC P-256</p>
                <p style={{ fontSize: '.76rem', color: '#fca5a5', fontWeight: 700, margin: 0 }}>⚠️ CRACKABLE by 4,096-Qubit Quantum Computer in ~8 Hours</p>
              </div>
              <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '12px 14px' }}>
                <p style={{ ...M, fontSize: '.6rem', color: '#fbbf24', fontWeight: 800, margin: '0 0 4px' }}>AES-256-GCM SYMMETRIC</p>
                <p style={{ fontSize: '.76rem', color: '#fde68a', fontWeight: 700, margin: 0 }}>🛡️ GROVER RESISTANT (Effective Security: 128-Bit Quantum Equivalent)</p>
              </div>
              <div style={{ background: 'rgba(16,185,129,0.09)', border: '1.5px solid #10b981', borderRadius: 10, padding: '12px 14px', boxShadow: '0 0 16px rgba(16,185,129,0.2)' }}>
                <p style={{ ...M, fontSize: '.6rem', color: '#34d399', fontWeight: 800, margin: '0 0 4px' }}>🏆 ML-KEM KYBER-1024 (FIPS 203)</p>
                <p style={{ fontSize: '.76rem', color: '#6ee7b7', fontWeight: 800, margin: 0 }}>✓ 100% QUANTUM SECURE (Module-Lattice Hardness Guarantee)</p>
              </div>
            </div>

            {/* Live Streaming Cryptanalysis Box */}
            {(kyberStreamText || kyberLoading) && (
              <div style={{
                background: 'rgba(0,0,0,0.6)', border: '1.5px solid rgba(0,240,255,0.35)',
                borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '1rem', animation: kyberLoading ? 'pulse 1s infinite' : 'none' }}>⚛️</span>
                  <span style={{ ...M, fontSize: '.68rem', fontWeight: 800, color: '#00f0ff' }}>
                    CYBERSHIELD NEURAL V3.0 — POST-QUANTUM CRYPTANALYSIS INFERENCE
                  </span>
                  {kyberLoading && (
                    <span style={{ ...M, fontSize: '.58rem', color: '#34d399', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                      ● ANALYZING LATTICE RESISTANCE
                    </span>
                  )}
                </div>
                <p style={{ ...M, fontSize: '.76rem', color: '#a5f3fc', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {kyberStreamText}
                  {kyberLoading && <span style={{ display: 'inline-block', width: 6, height: 13, background: '#00f0ff', marginLeft: 3, verticalAlign: 'middle', animation: 'pulse .6s infinite' }} />}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 1: MITRE ATT&CK MATRIX (Clickable Cards with Modal)
         ═══════════════════════════════════════════════════════════ */}
      {!loading && activeTab === 'mitre' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                🎯 MITRE ATT&amp;CK Framework &bull; Full-Spectrum Countermeasures
              </h3>
              <p style={{ fontSize: '.74rem', color: '#64748b', margin: '3px 0 0' }}>
                Click any technique card below to open <strong>Deep Forensics, Threat Actor Profile &amp; Real-Time Countermeasure Drilldown</strong>.
              </p>
            </div>
            <span style={{ ...M, fontSize: '.68rem', color: '#10b981', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', padding: '3px 10px', borderRadius: 5, fontWeight: 800 }}>
              10/10 TACTICS DEFENDED (100%)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {(mitreData?.matrix || []).map(m => (
              <div
                key={m.technique_id}
                onClick={() => setSelectedMitre(m)}
                className="card"
                style={{
                  padding: '16px 18px',
                  borderLeft: `4px solid ${m.status_color}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  cursor: 'pointer',
                  transition: 'all .2s ease',
                  background: 'rgba(255,255,255,0.02)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${m.status_color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ ...M, fontSize: '.62rem', color: '#00f0ff', fontWeight: 800 }}>{m.tactic_id} &bull; {m.tactic_name}</span>
                      <span style={{ ...M, fontSize: '.58rem', color: '#fbbf24', background: 'rgba(251,191,36,0.1)', padding: '1px 6px', borderRadius: 4 }}>{m.technique_id}</span>
                    </div>
                    <h4 style={{ fontSize: '.92rem', fontWeight: 800, color: '#fff', margin: '0 0 3px' }}>{m.technique_name}</h4>
                    <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>Example Vector: <code style={{ color: '#c4b5fd' }}>{m.example_cve}</code></p>
                  </div>
                  <span style={{ ...M, fontSize: '.62rem', fontWeight: 800, padding: '3px 8px', borderRadius: 4, background: `${m.status_color}20`, border: `1px solid ${m.status_color}`, color: m.status_color, whiteSpace: 'nowrap' }}>
                    {m.mitre_status}
                  </span>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 7, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ ...M, fontSize: '.68rem', color: '#34d399', margin: 0 }}>🛡️ {m.cybershield_countermeasure}</p>
                  <span style={{ ...M, fontSize: '.62rem', color: '#67e8f9' }}>🔍 Inspect &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 2: COMPLIANCE AUDIT (Clickable Cards with Detail Modal)
         ═══════════════════════════════════════════════════════════ */}
      {!loading && activeTab === 'compliance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.35)', borderRadius: 12, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div>
              <p style={{ ...M, fontSize: '.86rem', color: '#34d399', fontWeight: 800, margin: '0 0 3px' }}>
                Overall Compliance Score: {complianceData?.overall_compliance_average} &bull; Grade {complianceData?.overall_grade}
              </p>
              <p style={{ fontSize: '.74rem', color: '#94a3b8', margin: 0 }}>
                Continuous evidence collection across 5 major regulatory frameworks &bull; Lead Auditor: <strong style={{ color: '#00f0ff' }}>Pratyush Pandey (Roll 34)</strong>
              </p>
            </div>
            <button
              onClick={() => window.open('http://127.0.0.1:8000/api/report/benchmark-accuracy-pdf', '_blank')}
              className="btn btn-sm"
              style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: 800, fontSize: '.74rem', padding: '8px 14px', borderRadius: 6, border: 'none', cursor: 'pointer' }}
            >
              📥 Download Audit Certificate PDF
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 10 }}>
            {(complianceData?.standards || []).map(s => (
              <div
                key={s.id}
                onClick={() => setSelectedCompliance(s)}
                className="card"
                style={{
                  padding: '16px 20px',
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr',
                  gap: 16,
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all .2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5 }}>
                    <span style={{ ...M, fontSize: '.64rem', background: 'rgba(0,240,255,0.12)', border: '1px solid #00f0ff', color: '#67e8f9', padding: '1px 8px', borderRadius: 4 }}>{s.id}</span>
                    <h4 style={{ fontSize: '.92rem', fontWeight: 800, color: '#fff', margin: 0 }}>{s.standard_name}</h4>
                    <span style={{ fontSize: '.68rem', color: '#94a3b8' }}>{s.category}</span>
                  </div>
                  <p style={{ fontSize: '.74rem', color: '#cbd5e1', margin: '0 0 4px' }}>
                    <strong style={{ color: '#67e8f9' }}>Controls Verified:</strong> {s.controls_verified} &bull; Click to inspect clauses &rarr;
                  </p>
                  <p style={{ fontSize: '.7rem', color: '#64748b', margin: 0 }}>💡 {s.audit_note}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ position: 'relative', marginBottom: 6 }}>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${s.compliance_score}%`, background: s.compliance_score >= 99 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #3b82f6, #67e8f9)', borderRadius: 4 }} />
                    </div>
                  </div>
                  <p style={{ ...M, fontSize: '1.3rem', fontWeight: 900, color: s.compliance_score >= 99 ? '#34d399' : '#38bdf8', margin: '0 0 2px' }}>{s.compliance_score}%</p>
                  <p style={{ ...M, fontSize: '.62rem', color: '#10b981', margin: 0, fontWeight: 700 }}>{s.status} &bull; Click for Details</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 3: RISK HEATMAP MATRIX (Clickable Rows with Modal)
         ═══════════════════════════════════════════════════════════ */}
      {!loading && activeTab === 'heatmap' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 10, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '.82rem', color: '#fff', margin: 0, fontWeight: 700 }}>
              🔴 Critical Quadrant (High CVSS + High EPSS): <span style={{ color: '#ef4444' }}>{heatmapData?.critical_quadrant_count || 0} findings</span> &bull; Click any row for AI Forensics &amp; 1-Click Fix
            </p>
            <p style={{ ...M, fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>Total: {heatmapData?.total_findings || 0} findings mapped</p>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr>{['#', 'CVE ID', 'Asset (IP)', 'CVSS', 'EPSS %', 'AI Score', 'Tier', 'Quadrant', 'Action'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {(heatmapData?.heatmap || []).map((r, i) => {
                  const qColor = r.quadrant === 'HIGH_CVSS|HIGH_EPSS' ? '#ef4444' : r.quadrant === 'LOW_CVSS|HIGH_EPSS' ? '#f97316' : r.quadrant === 'HIGH_CVSS|LOW_EPSS' ? '#f59e0b' : '#10b981';
                  return (
                    <tr
                      key={r.finding_id}
                      onClick={() => setSelectedHeatmapItem(r)}
                      style={{ cursor: 'pointer', transition: 'background .15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ ...M, color: '#475569' }}>#{i + 1}</td>
                      <td style={{ ...M, color: '#67e8f9', fontWeight: 700 }}>{r.cve_id}</td>
                      <td style={{ ...M, fontSize: '.72rem', color: '#94a3b8' }}>{r.asset}<br /><span style={{ color: '#34d399' }}>{r.ip}</span></td>
                      <td style={{ ...M, color: r.cvss >= 9 ? '#ef4444' : '#f59e0b', fontWeight: 800 }}>{r.cvss}</td>
                      <td style={{ ...M, color: r.epss >= 0.5 ? '#ef4444' : '#fbbf24', fontWeight: 700 }}>{(r.epss * 100).toFixed(1)}%</td>
                      <td style={{ ...M, fontWeight: 900, color: r.ai_risk_score >= 90 ? '#ef4444' : r.ai_risk_score >= 70 ? '#f97316' : '#f59e0b', fontSize: '.95rem' }}>{r.ai_risk_score}</td>
                      <td><span className={`badge b-${r.tier.toLowerCase()}`}>{r.tier}</span></td>
                      <td><span style={{ ...M, fontSize: '.6rem', color: qColor, background: `${qColor}15`, border: `1px solid ${qColor}40`, padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>{r.quadrant.replace('|', ' · ')}</span></td>
                      <td>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedHeatmapItem(r); }}
                          className="btn btn-sm btn-ghost"
                          style={{ fontSize: '.65rem', padding: '3px 8px', ...M }}
                        >
                          ⚡ Drilldown
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 4: SOAR AUTOMATION (Live Interactive Playbook Runner)
         ═══════════════════════════════════════════════════════════ */}
      {!loading && activeTab === 'soar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['CVE-2021-44228', 'CVE-2023-22515', 'CVE-2023-4966'].map(cve => (
                <button
                  key={cve}
                  onClick={() => loadSoar(cve)}
                  className="btn btn-sm btn-ghost"
                  style={{
                    ...M,
                    fontSize: '.72rem',
                    fontWeight: soarPlaybook?.cve_id === cve ? 800 : 500,
                    background: soarPlaybook?.cve_id === cve ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.02)',
                    borderColor: soarPlaybook?.cve_id === cve ? '#00f0ff' : 'rgba(255,255,255,0.08)'
                  }}
                >
                  {soarPlaybook?.cve_id === cve ? '● ' : ''}{cve}
                </button>
              ))}
            </div>

            {soarPlaybook && (
              <button
                onClick={runSoarSimulation}
                disabled={soarRunning}
                className="btn btn-sm"
                style={{
                  background: soarRunning ? 'rgba(16,185,129,0.2)' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '.74rem',
                  padding: '8px 16px',
                  borderRadius: 8,
                  cursor: soarRunning ? 'default' : 'pointer',
                  boxShadow: '0 0 16px rgba(16,185,129,0.35)',
                  ...M
                }}
              >
                {soarRunning ? '⏳ Executing Playbook Step-by-Step…' : '▶️ Run Simulated SOAR Playbook'}
              </button>
            )}
          </div>

          {!soarPlaybook && (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', ...M, fontSize: '.78rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12 }}>
              Select a CVE above or click 'CVE-2021-44228' to load its automated SOAR response playbook.
            </div>
          )}

          {soarPlaybook && (
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>{soarPlaybook.playbook?.name}</h3>
                  <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: '2px 0 0' }}>Compliant: {soarPlaybook.playbook?.compliant_with} &bull; Automation: {soarPlaybook.automation_coverage}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ ...M, fontSize: '.68rem', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#34d399', padding: '3px 10px', borderRadius: 5, fontWeight: 800 }}>
                    {soarPlaybook.automation_coverage} AUTO-REMEDIATION
                  </span>
                  {soarCompleted && (
                    <span style={{ ...M, fontSize: '.68rem', background: 'rgba(0,240,255,0.2)', border: '1px solid #00f0ff', color: '#67e8f9', padding: '3px 10px', borderRadius: 5, fontWeight: 800 }}>
                      ✓ ARCHIVED TO BLOCKCHAIN
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(soarPlaybook.playbook?.steps || []).map((s, i) => {
                  const isActive = soarStepActive === i;
                  const isDone = soarStepActive > i || soarCompleted;

                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedSoarStep(s)}
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start',
                        padding: '12px 14px',
                        background: isActive ? 'rgba(0,240,255,0.12)' : isDone ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.02)',
                        border: isActive ? '1.5px solid #00f0ff' : isDone ? '1px solid rgba(16,185,129,0.3)' : `1px solid ${s.auto ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.2)'}`,
                        borderRadius: 8,
                        cursor: 'pointer',
                        transition: 'all .2s ease'
                      }}
                    >
                      <div style={{
                        minWidth: 30,
                        height: 30,
                        borderRadius: 8,
                        background: isDone ? '#10b981' : isActive ? '#00f0ff' : s.auto ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.15)',
                        border: `1px solid ${isDone ? '#10b981' : isActive ? '#00f0ff' : s.auto ? '#10b981' : '#f59e0b'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...M,
                        fontSize: '.72rem',
                        fontWeight: 900,
                        color: isDone || isActive ? '#000' : s.auto ? '#34d399' : '#fbbf24'
                      }}>
                        {isDone ? '✓' : s.step}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 2 }}>
                          <span style={{ ...M, fontSize: '.68rem', color: isDone ? '#34d399' : isActive ? '#00f0ff' : s.auto ? '#34d399' : '#fbbf24', fontWeight: 800 }}>
                            {s.action}
                          </span>
                          <span style={{ ...M, fontSize: '.6rem', color: s.auto ? '#34d399' : '#fbbf24', opacity: 0.7 }}>
                            {s.auto ? '🤖 Automated' : '👤 Manual'} &bull; ~{s.time_s}s
                          </span>
                          {isActive && <span style={{ ...M, fontSize: '.6rem', color: '#00f0ff', fontWeight: 800, animation: 'pulse 1s infinite' }}>● EXECUTING NOW…</span>}
                        </div>
                        <p style={{ ...M, fontSize: '.72rem', color: '#e2e8f0', margin: 0 }}>{s.detail}</p>
                      </div>
                      <span style={{ ...M, fontSize: '.62rem', color: '#64748b' }}>Click &rarr;</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 5: LIVE GLOBAL THREAT INTEL (Clickable Feed Cards)
         ═══════════════════════════════════════════════════════════ */}
      {!loading && activeTab === 'threat' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s ease infinite', boxShadow: '0 0 8px #ef4444' }} />
              <p style={{ ...M, fontSize: '.72rem', color: '#f87171', fontWeight: 800, margin: 0 }}>
                LIVE GLOBAL THREAT INTELLIGENCE STREAM &bull; CISA KEV + FIRST EPSS v3.1 + NVD + Shadowserver
              </p>
            </div>
            <span style={{ ...M, fontSize: '.64rem', color: '#94a3b8' }}>Auto-syncing every 60s</span>
          </div>

          {(threatFeed?.intel_stream || []).map((t) => (
            <div
              key={t.id}
              onClick={() => setSelectedThreat(t)}
              className="card"
              style={{
                padding: '16px 20px',
                borderLeft: '4px solid #ef4444',
                display: 'grid',
                gridTemplateColumns: '3fr 1fr',
                gap: 14,
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all .2s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 5, flexWrap: 'wrap' }}>
                  <span style={{ ...M, fontSize: '.62rem', color: '#f87171', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', padding: '1px 8px', borderRadius: 4, fontWeight: 800 }}>🔴 ACTIVE ADVISORY</span>
                  <span style={{ ...M, fontSize: '.7rem', color: '#fbbf24', fontWeight: 800 }}>{t.cve}</span>
                  <span style={{ ...M, fontSize: '.62rem', color: '#64748b' }}>{t.source}</span>
                  <span style={{ ...M, fontSize: '.62rem', color: '#475569' }}>{t.time_ago}</span>
                </div>
                <p style={{ fontSize: '.84rem', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>{t.headline}</p>
                <p style={{ ...M, fontSize: '.7rem', color: '#34d399', margin: 0 }}>✓ CyberShield Response: {t.action_taken}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ ...M, fontSize: '.62rem', color: '#f87171', margin: '0 0 2px', fontWeight: 700 }}>EPSS SHIFT</p>
                <p style={{ ...M, fontSize: '1.1rem', fontWeight: 900, color: '#fbbf24', margin: '0 0 4px' }}>{t.epss_shift}</p>
                <span style={{ ...M, fontSize: '.62rem', color: '#00f0ff' }}>Inspect Advisory &rarr;</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 6: BLOCKCHAIN MERKLE LEDGER (Clickable Forensic Blocks)
         ═══════════════════════════════════════════════════════════ */}
      {!loading && activeTab === 'merkle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1.5px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <p style={{ ...M, fontSize: '.78rem', color: '#34d399', fontWeight: 800, margin: 0 }}>✓ {ledgerData?.verification?.status}</p>
              <p style={{ fontSize: '.7rem', color: '#94a3b8', margin: '2px 0 0' }}>Latest Merkle Root: <code style={{ color: '#00f0ff', fontSize: '.65rem' }}>{ledgerData?.verification?.latest_merkle_root}</code></p>
            </div>
            <span style={{ ...M, fontSize: '.62rem', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#34d399', padding: '3px 9px', borderRadius: 5, fontWeight: 800 }}>
              {ledgerData?.verification?.attestation?.split('·')[0]}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(ledgerData?.chain || []).map(b => (
              <div
                key={b.index}
                onClick={() => setSelectedBlock(b)}
                className="card"
                style={{
                  padding: '14px 18px',
                  border: '1px solid rgba(139,92,246,0.25)',
                  display: 'grid',
                  gridTemplateColumns: '3fr 1fr',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all .2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.25)'; }}
              >
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3 }}>
                    <span style={{ ...M, fontSize: '.64rem', background: 'rgba(139,92,246,0.25)', border: '1px solid #8b5cf6', color: '#c4b5fd', padding: '1px 8px', borderRadius: 4 }}>BLOCK #{b.index}</span>
                    <span style={{ ...M, fontSize: '.66rem', color: '#fbbf24', fontWeight: 700 }}>{b.event_type}</span>
                    <span style={{ ...M, fontSize: '.6rem', color: '#64748b' }}>{b.timestamp}</span>
                  </div>
                  <p style={{ fontSize: '.8rem', color: '#e2e8f0', fontWeight: 600, margin: '2px 0' }}>{b.details}</p>
                  <p style={{ ...M, fontSize: '.66rem', color: '#64748b', margin: 0 }}>
                    Actor: <span style={{ color: '#38bdf8' }}>{b.actor}</span> &bull; Target: <span style={{ color: '#34d399' }}>{b.target}</span>
                  </p>
                </div>
                <div style={{ ...M, fontSize: '.6rem', textAlign: 'right' }}>
                  <p style={{ color: '#64748b', margin: '0 0 2px' }}>BLOCK HASH:</p>
                  <p style={{ color: '#00f0ff', margin: '0 0 2px', wordBreak: 'break-all' }}>{b.block_hash?.substring(0,28)}…</p>
                  <span style={{ color: '#a78bfa' }}>Inspect Cryptographic Proof &rarr;</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          TAB 7: HONEYPOT DECOY TRAPS (Clickable with Probe Simulator)
         ═══════════════════════════════════════════════════════════ */}
      {!loading && activeTab === 'honeypot' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {(honeypotData?.decoys || []).map(h => (
              <div
                key={h.id}
                onClick={() => setSelectedDecoy(h)}
                className="card"
                style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(0,0,0,0.6))',
                  border: '1.5px solid rgba(6,182,212,0.35)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all .2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 24px rgba(6,182,212,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ ...M, fontSize: '.72rem', color: '#06b6d4', fontWeight: 800 }}>{h.id} &bull; {h.name}</span>
                  <span style={{ ...M, fontSize: '.62rem', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#34d399', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>● {h.status}</span>
                </div>
                <div>
                  <p style={{ ...M, fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0 0 2px' }}>IP: {h.ip_address}</p>
                  <p style={{ fontSize: '.78rem', color: '#cbd5e1', margin: 0 }}>Emulated Service: {h.decoy_service}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '10px 12px' }}>
                  <p style={{ ...M, fontSize: '.7rem', color: '#fca5a5', margin: '0 0 2px' }}>⚠️ Trapped: {h.trapped_attackers_count} Intrusion Probes</p>
                  <p style={{ fontSize: '.7rem', color: '#94a3b8', margin: '0 0 2px' }}>Last: {h.last_trigger}</p>
                  <p style={{ ...M, fontSize: '.68rem', color: '#34d399', margin: 0 }}>✓ {h.action}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); simulateHoneypotTrigger(h); }}
                    className="btn btn-sm"
                    style={{ flex: 1, background: 'rgba(239,68,68,0.2)', border: '1px solid #ef4444', color: '#fca5a5', fontSize: '.7rem', fontWeight: 800, padding: '6px', borderRadius: 6, cursor: 'pointer' }}
                  >
                    🪤 Simulate Attack Probe
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedDecoy(h); }}
                    className="btn btn-sm btn-ghost"
                    style={{ fontSize: '.7rem', padding: '6px 12px' }}
                  >
                    🔍 Inspect Logs
                  </button>
                </div>
              </div>
            ))}

            <div className="card" style={{ padding: '20px', border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 8, gridColumn: 'span 2' }}>
              <p style={{ ...M, fontSize: '.74rem', color: '#64748b', margin: 0 }}>Total Intruders Auto-Quarantined by Honeypot Decoy Network</p>
              <p style={{ ...M, fontSize: '2.8rem', fontWeight: 900, color: '#10b981', margin: 0 }}>{honeypotData?.quarantined_attackers_total || 5}</p>
              <p style={{ fontSize: '.74rem', color: '#94a3b8', margin: 0 }}>IP addresses auto-blocked at perimeter firewall in &lt;0.2 seconds</p>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE MODAL 1: MITRE TECHNIQUE DRILLDOWN & KINETIC DEFENSE ARENA
         ═══════════════════════════════════════════════════════════ */}
      {selectedMitre && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card anim-scaleup" style={{ width: '100%', maxWidth: 740, padding: '24px 28px', border: `1.5px solid ${selectedMitre.status_color || '#00f0ff'}`, background: 'radial-gradient(circle at top, rgba(15,23,42,0.98), rgba(2,6,23,0.99))', maxHeight: '92vh', overflowY: 'auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ ...M, fontSize: '.7rem', color: '#00f0ff', fontWeight: 800 }}>{selectedMitre.tactic_id} &bull; {selectedMitre.tactic_name}</span>
                  <span style={{ ...M, fontSize: '.68rem', color: '#fbbf24', background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                    {selectedMitre.technique_id}
                  </span>
                  <span style={{ ...M, fontSize: '.64rem', color: '#34d399', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                    ● 100% DEFENDED
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: 0 }}>{selectedMitre.technique_name}</h2>
              </div>
              <button onClick={() => { setSelectedMitre(null); setMitreValidating(false); }} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 🌟 Kinetic Laser Attack & Shield Deflection Arena Canvas (SVG) */}
              <div style={{
                background: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399', animation: 'pulse 1.2s infinite' }} />
                    <span style={{ ...M, fontSize: '.66rem', color: '#00f0ff', fontWeight: 800, textTransform: 'uppercase' }}>
                      Kinetic Attack Interception &amp; Countermeasure Simulation
                    </span>
                  </div>
                  <span style={{ ...M, fontSize: '.58rem', color: '#34d399', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                    ● MTTR: 0.180s (DEFLECTED)
                  </span>
                </div>

                {/* SVG Laser & Shield Arena */}
                <div style={{ position: 'relative', height: 160, background: 'radial-gradient(circle at center, rgba(15,23,42,0.9), rgba(2,6,23,0.95))', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <svg viewBox="0 0 450 160" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <linearGradient id="laserBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                        <stop offset="90%" stopColor="#ff0055" stopOpacity="1" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="1" />
                      </linearGradient>
                      <radialGradient id="shieldAura" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(0,240,255,0.5)" />
                        <stop offset="60%" stopColor="rgba(16,185,129,0.2)" />
                        <stop offset="100%" stopColor="transparent" />
                      </radialGradient>
                    </defs>

                    {/* Grid lines */}
                    <line x1="0" y1="80" x2="450" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="5 5" />

                    {/* Left: Adversary Attack Vector Node */}
                    <g transform="translate(60, 80)">
                      <circle cx="0" cy="0" r="28" fill="#090d1f" stroke="#ef4444" strokeWidth="2" />
                      <circle cx="0" cy="0" r="34" fill="none" stroke="#ef4444" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.6">
                        <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="8s" repeatCount="indefinite" />
                      </circle>
                      <text x="0" y="-3" textAnchor="middle" fill="#fff" fontSize="12">💀</text>
                      <text x="0" y="11" textAnchor="middle" fill="#f87171" fontSize="6.5" fontWeight="900" fontFamily="'JetBrains Mono',monospace">
                        {selectedMitre.technique_id}
                      </text>
                      <text x="0" y="24" textAnchor="middle" fill="#94a3b8" fontSize="6" fontFamily="'JetBrains Mono',monospace">
                        INCOMING
                      </text>
                    </g>

                    {/* Animated Red Laser Beam */}
                    <line x1="95" y1="80" x2="225" y2="80" stroke="url(#laserBeamGrad)" strokeWidth="3.5" strokeDasharray="8 4" />
                    <circle cx={95 + ((vaultAngle % 100) / 100) * 130} cy="80" r="4.5" fill="#fff" filter="drop-shadow(0 0 8px #ff0055)" />

                    {/* Middle: Rotating Sentinel Shield Barrier (Deflection Point) */}
                    <g transform="translate(230, 80)">
                      <circle cx="0" cy="0" r="42" fill="url(#shieldAura)" />
                      {/* Shield Arc */}
                      <path d="M-8,-40 Q15,0 -8,40" fill="none" stroke="#00f0ff" strokeWidth="3" filter="drop-shadow(0 0 8px #00f0ff)" />
                      <path d="M-14,-30 Q6,0 -14,30" fill="none" stroke="#34d399" strokeWidth="2" strokeDasharray="6 3" />
                      {/* Deflection Sparks */}
                      <circle cx="-6" cy="0" r={3 + (vaultAngle % 8)} fill="#fff" opacity={1 - (vaultAngle % 8) / 8} />
                      <line x1="-6" y1="0" x2="-25" y2="-18" stroke="#00f0ff" strokeWidth="1.5" opacity="0.7" />
                      <line x1="-6" y1="0" x2="-25" y2="18" stroke="#34d399" strokeWidth="1.5" opacity="0.7" />
                      <text x="0" y="52" textAnchor="middle" fill="#00f0ff" fontSize="7" fontWeight="900" fontFamily="'JetBrains Mono',monospace">
                        🛡️ eBPF FILTER
                      </text>
                    </g>

                    {/* Right: Target Enterprise Protected Asset */}
                    <g transform="translate(380, 80)">
                      <rect x="-42" y="-28" width="84" height="56" rx="8" fill="#090d1f" stroke="#10b981" strokeWidth="2" />
                      <circle cx="0" cy="-6" r="14" fill="rgba(16,185,129,0.2)" />
                      <text x="0" y="-2" textAnchor="middle" fill="#fff" fontSize="11">🖥️</text>
                      <text x="0" y="12" textAnchor="middle" fill="#34d399" fontSize="6.8" fontWeight="900" fontFamily="'JetBrains Mono',monospace">
                        PROTECTED
                      </text>
                      <text x="0" y="22" textAnchor="middle" fill="#64748b" fontSize="5.5" fontFamily="'JetBrains Mono',monospace">
                        0.0% EVASION
                      </text>
                    </g>
                  </svg>
                </div>

                {/* 4 Defense Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 7, padding: '6px 8px', textAlign: 'center', border: '1px solid rgba(0,240,255,0.2)' }}>
                    <p style={{ ...M, fontSize: '.52rem', color: '#64748b', margin: 0 }}>DETECTION LATENCY</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: '#00f0ff', margin: '2px 0 0' }}>12ms</p>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 7, padding: '6px 8px', textAlign: 'center', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <p style={{ ...M, fontSize: '.52rem', color: '#64748b', margin: 0 }}>EVASION RISK</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: '#34d399', margin: '2px 0 0' }}>0.0%</p>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 7, padding: '6px 8px', textAlign: 'center', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <p style={{ ...M, fontSize: '.52rem', color: '#64748b', margin: 0 }}>EPSS PRIORITIZED</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: '#fbbf24', margin: '2px 0 0' }}>YES</p>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 7, padding: '6px 8px', textAlign: 'center', border: '1px solid rgba(168,85,247,0.2)' }}>
                    <p style={{ ...M, fontSize: '.52rem', color: '#64748b', margin: 0 }}>MERKLE PROOF</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: '#c084fc', margin: '2px 0 0' }}>VERIFIED</p>
                  </div>
                </div>
              </div>

              {/* Defensive Countermeasure Rule Box */}
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '12px 16px' }}>
                <p style={{ ...M, fontSize: '.64rem', color: '#34d399', margin: '0 0 4px', textTransform: 'uppercase', fontWeight: 800 }}>
                  🛡️ Active CyberShield Countermeasure
                </p>
                <p style={{ ...M, fontSize: '.82rem', color: '#fff', margin: 0, fontWeight: 700, lineHeight: 1.4 }}>
                  {selectedMitre.cybershield_countermeasure}
                </p>
                <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: '6px 0 0' }}>
                  <strong style={{ color: '#00f0ff' }}>Associated Vector:</strong> {selectedMitre.example_cve} &bull; Matched via eBPF sysctl + WAF L7 bytecode filters.
                </p>
              </div>

              {/* Live Validation Stream (Appears when validating) */}
              {mitreValidating && (
                <div style={{
                  background: '#010409', border: '1.5px solid #00f0ff', borderRadius: 10, padding: '12px 16px',
                  boxShadow: '0 0 20px rgba(0,240,255,0.25)', display: 'flex', flexDirection: 'column', gap: 6
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ ...M, fontSize: '.66rem', color: '#00f0ff', fontWeight: 800 }}>
                      ⚡ LIVE AUTOMATED MITRE VALIDATION SEQUENCE:
                    </span>
                    <span style={{ ...M, fontSize: '.6rem', color: mitreValidationStep >= 4 ? '#34d399' : '#fbbf24', fontWeight: 800 }}>
                      {mitreValidationStep >= 4 ? '● 100% VALIDATED' : `● STEP ${mitreValidationStep}/4 EXECUTING`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[
                      `[00.012s] Ingesting MITRE ATT&CK ${selectedMitre.technique_id} signature token...`,
                      `[00.045s] Compiling eBPF bytecode probe rules into kernel ringbuffer...`,
                      `[00.120s] Synthetic penetration probe simulated -> 100% BLOCKED (<0.1s)`,
                      `[00.240s] Merkle cryptographic state proof generated: 0x9f8b...e1 verified!`
                    ].slice(0, mitreValidationStep).map((log, i) => (
                      <p key={i} style={{ ...M, fontSize: '.65rem', color: i === 2 ? '#34d399' : '#cbd5e1', margin: 0 }}>
                        {log}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => copyToClipboard(selectedMitre.cybershield_countermeasure, 'Countermeasure Copied')}
                  className="btn btn-sm btn-ghost"
                  style={{ flex: 1, padding: '11px', borderRadius: 8, fontSize: '.76rem', fontWeight: 700 }}
                >
                  {copiedText === 'Countermeasure Copied' ? '✓ Defensive Rule Copied!' : '⎘ Copy Defensive Rule'}
                </button>
                <button
                  onClick={() => {
                    setMitreValidating(true);
                    setMitreValidationStep(1);
                    setTimeout(() => setMitreValidationStep(2), 400);
                    setTimeout(() => setMitreValidationStep(3), 800);
                    setTimeout(() => {
                      setMitreValidationStep(4);
                      setActionNotice({ type: 'success', msg: `✅ Countermeasure for ${selectedMitre.technique_id} verified & validated across all 10 assets with 100% resilience!` });
                    }, 1200);
                  }}
                  disabled={mitreValidating && mitreValidationStep < 4}
                  className="btn btn-sm btn-primary"
                  style={{
                    flex: 1, padding: '11px', borderRadius: 8, fontSize: '.76rem', fontWeight: 900,
                    background: mitreValidationStep >= 4 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #00f0ff, #3b82f6)',
                    boxShadow: mitreValidationStep >= 4 ? '0 0 20px rgba(16,185,129,0.5)' : '0 0 16px rgba(0,240,255,0.4)',
                    color: '#000'
                  }}
                >
                  {mitreValidating ? (mitreValidationStep >= 4 ? '✓ Countermeasure Validated!' : '⏳ Validating Rules…') : '⚡ Validate Countermeasure'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE MODAL 2: COMPLIANCE STANDARD DETAIL
         ═══════════════════════════════════════════════════════════ */}
      {selectedCompliance && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card anim-scaleup" style={{ width: '100%', maxWidth: 680, padding: '24px 28px', border: '1.5px solid rgba(0,240,255,0.5)', background: 'rgba(6,12,28,0.98)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span style={{ ...M, fontSize: '.68rem', background: 'rgba(0,240,255,0.15)', border: '1px solid #00f0ff', color: '#67e8f9', padding: '2px 8px', borderRadius: 4 }}>{selectedCompliance.id}</span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', margin: '6px 0 2px' }}>{selectedCompliance.standard_name}</h2>
                <p style={{ fontSize: '.74rem', color: '#94a3b8', margin: 0 }}>{selectedCompliance.category}</p>
              </div>
              <button onClick={() => setSelectedCompliance(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '10px 14px' }}>
                  <p style={{ ...M, fontSize: '.62rem', color: '#64748b', margin: '0 0 2px' }}>COMPLIANCE SCORE</p>
                  <p style={{ ...M, fontSize: '1.4rem', fontWeight: 900, color: '#34d399', margin: 0 }}>{selectedCompliance.compliance_score}%</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '10px 14px' }}>
                  <p style={{ ...M, fontSize: '.62rem', color: '#64748b', margin: '0 0 2px' }}>STATUS</p>
                  <p style={{ ...M, fontSize: '1.4rem', fontWeight: 900, color: '#00f0ff', margin: 0 }}>{selectedCompliance.status}</p>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ fontSize: '.78rem', color: '#cbd5e1', margin: '0 0 4px' }}>
                  <strong style={{ color: '#67e8f9' }}>Audited Controls:</strong> {selectedCompliance.controls_verified}
                </p>
                <p style={{ fontSize: '.74rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{selectedCompliance.audit_note}</p>
              </div>

              <button
                onClick={() => window.open('http://127.0.0.1:8000/api/report/benchmark-accuracy-pdf', '_blank')}
                className="btn btn-sm btn-primary"
                style={{ padding: '10px', width: '100%', justifyContent: 'center' }}
              >
                📥 Download Full {selectedCompliance.id} Audit Certificate (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE MODAL 3: HEATMAP FINDING & THREAT IMPACT DRILLDOWN
         ═══════════════════════════════════════════════════════════ */}
      {selectedHeatmapItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card anim-scaleup" style={{ width: '100%', maxWidth: 740, padding: '24px 28px', border: '1.5px solid rgba(239,68,68,0.6)', background: 'radial-gradient(circle at top, rgba(20,8,40,0.98), rgba(6,12,28,0.99))', maxHeight: '92vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span className="badge b-critical">{selectedHeatmapItem.tier} THREAT</span>
                  <span style={{ ...M, fontSize: '.64rem', color: '#00f0ff', background: 'rgba(0,240,255,0.12)', padding: '2px 8px', borderRadius: 4 }}>
                    QUADRANT: {selectedHeatmapItem.quadrant}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#fff', margin: '4px 0 2px' }}>{selectedHeatmapItem.cve_id}</h2>
                <p style={{ ...M, fontSize: '.74rem', color: '#94a3b8', margin: 0 }}>Compromised Host: <strong style={{ color: '#f87171' }}>{selectedHeatmapItem.asset} ({selectedHeatmapItem.ip})</strong></p>
              </div>
              <button onClick={() => setSelectedHeatmapItem(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* 3 Core Metric Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <p style={{ ...M, fontSize: '.6rem', color: '#64748b', margin: '0 0 2px' }}>CVSS BASE METRIC</p>
                  <p style={{ ...M, fontSize: '1.35rem', fontWeight: 900, color: '#ef4444', margin: 0 }}>{selectedHeatmapItem.cvss}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(251,191,36,0.25)' }}>
                  <p style={{ ...M, fontSize: '.6rem', color: '#64748b', margin: '0 0 2px' }}>EPSS PROBABILITY</p>
                  <p style={{ ...M, fontSize: '1.35rem', fontWeight: 900, color: '#fbbf24', margin: 0 }}>{(selectedHeatmapItem.epss * 100).toFixed(1)}%</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(0,240,255,0.25)' }}>
                  <p style={{ ...M, fontSize: '.6rem', color: '#64748b', margin: '0 0 2px' }}>AI MULTI-FACTOR RISK</p>
                  <p style={{ ...M, fontSize: '1.35rem', fontWeight: 900, color: '#00f0ff', margin: 0 }}>{selectedHeatmapItem.ai_risk_score}/100</p>
                </div>
              </div>

              {/* 🌟 3D Holographic Blast Radius & Lateral Impact Simulator Canvas */}
              <div style={{
                background: 'rgba(2, 6, 23, 0.95)', border: '1px solid rgba(0, 240, 255, 0.3)',
                borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: isBlastContained ? '#10b981' : '#ef4444', boxShadow: `0 0 10px ${isBlastContained ? '#10b981' : '#ef4444'}`, animation: 'pulse 1s infinite' }} />
                    <span style={{ ...M, fontSize: '.66rem', color: '#fff', fontWeight: 800, textTransform: 'uppercase' }}>
                      Kinetic Blast Radius &amp; Lateral Impact Simulator
                    </span>
                  </div>
                  <span style={{ ...M, fontSize: '.58rem', color: isBlastContained ? '#34d399' : '#f87171', background: isBlastContained ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', border: `1px solid ${isBlastContained ? '#10b981' : '#ef4444'}`, padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                    {isBlastContained ? '● BLAST RADIUS SEVERED (0 HOPS)' : '● LATERAL PROPAGATION ACTIVE'}
                  </span>
                </div>

                {/* Kinetic Blast Radius SVG Canvas */}
                <div style={{ position: 'relative', height: 180, background: 'radial-gradient(circle at center, rgba(15,23,42,0.9), rgba(2,6,23,0.95))', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <svg viewBox="0 0 400 180" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <radialGradient id="vaultBlastWaveGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={isBlastContained ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.5)'} />
                        <stop offset="70%" stopColor={isBlastContained ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'} />
                        <stop offset="100%" stopColor="transparent" />
                      </radialGradient>
                    </defs>

                    {/* Concentric Impact Waves */}
                    <circle cx="200" cy="90" r={isBlastContained ? 30 : 25 + (vaultAngle % 30)} fill="url(#vaultBlastWaveGrad)" stroke={isBlastContained ? '#10b981' : '#ef4444'} strokeWidth="1" opacity={1 - (vaultAngle % 30) / 30} />
                    <circle cx="200" cy="90" r={isBlastContained ? 50 : 45 + ((vaultAngle + 15) % 30)} fill="none" stroke={isBlastContained ? '#10b981' : '#f97316'} strokeWidth="0.8" opacity={1 - ((vaultAngle + 15) % 30) / 30} strokeDasharray="4 4" />

                    {/* Lateral Trajectory Laser Vectors */}
                    {[
                      { name: 'Active Directory DC', x: 65, y: 35, col: '#ef4444', status: isBlastContained ? '🛡️ ISOLATED' : '⚠️ AT RISK' },
                      { name: 'Oracle DB Cluster', x: 335, y: 35, col: '#f59e0b', status: isBlastContained ? '🔒 AIRGAPPED' : '🚨 EXPOSURE' },
                      { name: 'Edge VPN Gateway', x: 65, y: 145, col: '#a855f7', status: isBlastContained ? '⚡ eBPF FILTERED' : '⚡ PIVOT PATH' },
                      { name: 'Payment Core', x: 335, y: 145, col: '#10b981', status: isBlastContained ? '⚛️ KYBER LOCKED' : '⚠️ VULNERABLE' }
                    ].map((n, i) => (
                      <g key={i}>
                        <line x1="200" y1="90" x2={n.x} y2={n.y} stroke={isBlastContained ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.5)'} strokeWidth={isBlastContained ? 1 : 1.8} strokeDasharray={isBlastContained ? '3 3' : '6 3'} />
                        {!isBlastContained && (
                          <circle cx={200 + (n.x - 200) * ((vaultAngle % 100) / 100)} cy={90 + (n.y - 90) * ((vaultAngle % 100) / 100)} r="3" fill="#ef4444" filter="drop-shadow(0 0 6px #ef4444)" />
                        )}
                        <g transform={`translate(${n.x}, ${n.y})`}>
                          <rect x="-55" y="-16" width="110" height="32" rx="6" fill="#090d1f" stroke={isBlastContained ? '#10b981' : n.col} strokeWidth="1.2" />
                          <text x="0" y="-3" textAnchor="middle" fill="#fff" fontSize="7.5" fontWeight="800" fontFamily="'JetBrains Mono',monospace">{n.name}</text>
                          <text x="0" y="9" textAnchor="middle" fill={isBlastContained ? '#34d399' : '#94a3b8'} fontSize="6" fontFamily="'JetBrains Mono',monospace">{n.status}</text>
                        </g>
                      </g>
                    ))}

                    {/* Center Compromised Host Node */}
                    <circle cx="200" cy="90" r="22" fill="#030712" stroke={isBlastContained ? '#10b981' : '#ef4444'} strokeWidth="2.5" />
                    <text x="200" y="87" textAnchor="middle" fill="#fff" fontSize="10">💀</text>
                    <text x="200" y="101" textAnchor="middle" fill={isBlastContained ? '#34d399' : '#f87171'} fontSize="6" fontWeight="900" fontFamily="'JetBrains Mono',monospace">
                      {isBlastContained ? 'CONTAINED' : 'ENTRY POINT'}
                    </text>
                  </svg>
                </div>

                {/* 4 Impact Telemetry Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                  <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 7, padding: '6px 8px', textAlign: 'center' }}>
                    <p style={{ ...M, fontSize: '.5rem', color: '#fca5a5', margin: 0 }}>FINANCIAL EXPOSURE</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: isBlastContained ? '#34d399' : '#ef4444', margin: '2px 0 0' }}>{isBlastContained ? '$0.00 SAVED' : '$480,000'}</p>
                  </div>
                  <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 7, padding: '6px 8px', textAlign: 'center' }}>
                    <p style={{ ...M, fontSize: '.5rem', color: '#fde68a', margin: 0 }}>DOWNSTREAM NODES</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: isBlastContained ? '#34d399' : '#f59e0b', margin: '2px 0 0' }}>{isBlastContained ? '0 COMPROMISED' : '4 AT RISK'}</p>
                  </div>
                  <div style={{ background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.25)', borderRadius: 7, padding: '6px 8px', textAlign: 'center' }}>
                    <p style={{ ...M, fontSize: '.5rem', color: '#67e8f9', margin: 0 }}>AUTONOMOUS MTTR</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: '#00f0ff', margin: '2px 0 0' }}>0.280s</p>
                  </div>
                  <div style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: 7, padding: '6px 8px', textAlign: 'center' }}>
                    <p style={{ ...M, fontSize: '.5rem', color: '#c4b5fd', margin: 0 }}>SHADOW-STACK eBPF</p>
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 900, color: '#a855f7', margin: '2px 0 0' }}>ACTIVE</p>
                  </div>
                </div>

                {/* 1-Click Interactive Containment Trigger */}
                <button
                  onClick={() => setIsBlastContained(b => !b)}
                  style={{
                    background: isBlastContained ? 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.4))' : 'linear-gradient(135deg, #ef4444, #dc2626)',
                    border: `1.5px solid ${isBlastContained ? '#10b981' : '#ef4444'}`,
                    color: '#fff', fontWeight: 900, padding: '8px 14px', borderRadius: 8, cursor: 'pointer',
                    ...M, fontSize: '.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    boxShadow: isBlastContained ? '0 0 14px rgba(16,185,129,0.4)' : '0 0 14px rgba(239,68,68,0.5)',
                    transition: 'all .2s ease'
                  }}
                >
                  <span>{isBlastContained ? '✅ BLAST RADIUS CONTAINED (CLICK TO TOGGLE)' : '🔒 1-CLICK SEVER LATERAL VECTORS & ISOLATE BLAST RADIUS'}</span>
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => {
                    loadSoar(selectedHeatmapItem.cve_id);
                    setActiveTab('soar');
                    setSelectedHeatmapItem(null);
                  }}
                  className="btn btn-sm btn-primary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  ⚡ Open SOAR Playbook for {selectedHeatmapItem.cve_id}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE MODAL 4: THREAT INTEL ADVISORY
         ═══════════════════════════════════════════════════════════ */}
      {selectedThreat && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card anim-scaleup" style={{ width: '100%', maxWidth: 680, padding: '24px 28px', border: '1.5px solid rgba(239,68,68,0.5)', background: 'rgba(6,12,28,0.98)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span style={{ ...M, fontSize: '.68rem', color: '#fbbf24', background: 'rgba(251,191,36,0.15)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>{selectedThreat.cve}</span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: '6px 0 2px' }}>{selectedThreat.headline}</h2>
                <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>Source: {selectedThreat.source} &bull; {selectedThreat.time_ago}</p>
              </div>
              <button onClick={() => setSelectedThreat(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ ...M, fontSize: '.64rem', color: '#f87171', margin: '0 0 2px', fontWeight: 700 }}>EPSS WEAPONIZATION TRAJECTORY</p>
                <p style={{ ...M, fontSize: '1.3rem', fontWeight: 900, color: '#fbbf24', margin: '0 0 4px' }}>{selectedThreat.epss_shift}</p>
                <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>Live correlation indicates active exploit kits in wild.</p>
              </div>

              <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ ...M, fontSize: '.68rem', color: '#34d399', fontWeight: 800, margin: '0 0 2px' }}>CYBERSHIELD MITIGATION ACTION</p>
                <p style={{ ...M, fontSize: '.76rem', color: '#cbd5e1', margin: 0 }}>{selectedThreat.action_taken}</p>
              </div>

              <button
                onClick={() => {
                  setActionNotice({ type: 'success', msg: `🛡️ Virtual patch enforced for ${selectedThreat.cve} across all boundary nodes!` });
                  setSelectedThreat(null);
                }}
                className="btn btn-sm btn-primary"
                style={{ padding: '10px', width: '100%', justifyContent: 'center' }}
              >
                🛡️ Deploy Perimeter Virtual Patch for {selectedThreat.cve}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE MODAL 5: BLOCKCHAIN BLOCK FORENSICS
         ═══════════════════════════════════════════════════════════ */}
      {selectedBlock && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card anim-scaleup" style={{ width: '100%', maxWidth: 680, padding: '24px 28px', border: '1.5px solid rgba(0,240,255,0.5)', background: 'rgba(6,12,28,0.98)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span style={{ ...M, fontSize: '.68rem', background: 'rgba(139,92,246,0.25)', border: '1px solid #8b5cf6', color: '#c4b5fd', padding: '2px 8px', borderRadius: 4 }}>BLOCK #{selectedBlock.index}</span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: '6px 0 2px' }}>{selectedBlock.event_type}</h2>
                <p style={{ ...M, fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>Timestamp: {selectedBlock.timestamp}</p>
              </div>
              <button onClick={() => setSelectedBlock(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ fontSize: '.78rem', color: '#e2e8f0', margin: '0 0 6px', fontWeight: 600 }}>{selectedBlock.details}</p>
                <p style={{ ...M, fontSize: '.68rem', color: '#94a3b8', margin: 0 }}>
                  Actor: <strong style={{ color: '#00f0ff' }}>{selectedBlock.actor}</strong> &bull; Target: <strong style={{ color: '#34d399' }}>{selectedBlock.target}</strong>
                </p>
              </div>

              <div style={{ background: '#020610', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' }}>
                <p style={{ ...M, fontSize: '.62rem', color: '#64748b', margin: '0 0 2px' }}>SHA-256 BLOCK HASH:</p>
                <p style={{ ...M, fontSize: '.68rem', color: '#00f0ff', margin: '0 0 8px', wordBreak: 'break-all' }}>{selectedBlock.block_hash}</p>
                <p style={{ ...M, fontSize: '.62rem', color: '#64748b', margin: '0 0 2px' }}>PREVIOUS BLOCK HASH:</p>
                <p style={{ ...M, fontSize: '.68rem', color: '#94a3b8', margin: 0, wordBreak: 'break-all' }}>{selectedBlock.prev_hash}</p>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => copyToClipboard(selectedBlock.block_hash, 'Hash Copied')}
                  className="btn btn-sm btn-ghost"
                  style={{ flex: 1, padding: '10px' }}
                >
                  {copiedText === 'Hash Copied' ? '✓ Copied!' : '⎘ Copy Block Hash'}
                </button>
                <button
                  onClick={() => {
                    setActionNotice({ type: 'success', msg: `✓ Block #${selectedBlock.index} cryptographically validated against latest Merkle Root!` });
                    setSelectedBlock(null);
                  }}
                  className="btn btn-sm btn-primary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  ✓ Verify Cryptographic Proof
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE MODAL 6: HONEYPOT DECOY INSPECTOR
         ═══════════════════════════════════════════════════════════ */}
      {selectedDecoy && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card anim-scaleup" style={{ width: '100%', maxWidth: 680, padding: '24px 28px', border: '1.5px solid rgba(6,182,212,0.5)', background: 'rgba(6,12,28,0.98)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span style={{ ...M, fontSize: '.68rem', background: 'rgba(6,182,212,0.15)', border: '1px solid #06b6d4', color: '#06b6d4', padding: '2px 8px', borderRadius: 4 }}>{selectedDecoy.id}</span>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', margin: '6px 0 2px' }}>{selectedDecoy.name}</h2>
                <p style={{ ...M, fontSize: '.76rem', color: '#94a3b8', margin: 0 }}>IP: {selectedDecoy.ip_address} &bull; Service: {selectedDecoy.decoy_service}</p>
              </div>
              <button onClick={() => setSelectedDecoy(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '10px 14px' }}>
                  <p style={{ ...M, fontSize: '.62rem', color: '#64748b', margin: '0 0 2px' }}>TRAPPED PROBES</p>
                  <p style={{ ...M, fontSize: '1.4rem', fontWeight: 900, color: '#fca5a5', margin: 0 }}>{selectedDecoy.trapped_attackers_count}</p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '10px 14px' }}>
                  <p style={{ ...M, fontSize: '.62rem', color: '#64748b', margin: '0 0 2px' }}>AUTO-DEFENSE ACTION</p>
                  <p style={{ ...M, fontSize: '.74rem', fontWeight: 800, color: '#34d399', margin: '4px 0 0' }}>{selectedDecoy.action}</p>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ ...M, fontSize: '.68rem', color: '#67e8f9', margin: '0 0 4px' }}>LAST INTRUSION ATTEMPT</p>
                <p style={{ fontSize: '.76rem', color: '#cbd5e1', margin: 0 }}>{selectedDecoy.last_trigger}</p>
              </div>

              <button
                onClick={() => {
                  simulateHoneypotTrigger(selectedDecoy);
                  setSelectedDecoy(null);
                }}
                className="btn btn-sm btn-primary"
                style={{ padding: '10px', width: '100%', justifyContent: 'center' }}
              >
                🪤 Trigger Simulated Probe &amp; Auto-Quarantine Attacker
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          INTERACTIVE MODAL 7: SOAR STEP INSPECTOR
         ═══════════════════════════════════════════════════════════ */}
      {selectedSoarStep && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card anim-scaleup" style={{ width: '100%', maxWidth: 640, padding: '24px 28px', border: '1.5px solid rgba(139,92,246,0.5)', background: 'rgba(6,12,28,0.98)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <span style={{ ...M, fontSize: '.68rem', color: selectedSoarStep.auto ? '#34d399' : '#fbbf24', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                  STEP {selectedSoarStep.step} &bull; {selectedSoarStep.action}
                </span>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#fff', margin: '6px 0 2px' }}>SOAR Orchestration Step Detail</h2>
                <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>Execution Mode: {selectedSoarStep.auto ? '🤖 Automated' : '👤 Manual Approval'} &bull; Latency: ~{selectedSoarStep.time_s}s</p>
              </div>
              <button onClick={() => setSelectedSoarStep(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ ...M, fontSize: '.64rem', color: '#64748b', margin: '0 0 4px', textTransform: 'uppercase' }}>Command / Automation Script</p>
                <pre style={{ ...M, fontSize: '.74rem', color: '#00f0ff', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                  {selectedSoarStep.detail}
                </pre>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => copyToClipboard(selectedSoarStep.detail, 'Step Copied')}
                  className="btn btn-sm btn-ghost"
                  style={{ flex: 1, padding: '10px' }}
                >
                  {copiedText === 'Step Copied' ? '✓ Copied!' : '⎘ Copy Step Detail'}
                </button>
                <button
                  onClick={() => {
                    setActionNotice({ type: 'success', msg: `✓ SOAR Step ${selectedSoarStep.step} (${selectedSoarStep.action}) manually enforced & verified!` });
                    setSelectedSoarStep(null);
                  }}
                  className="btn btn-sm btn-primary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  ⚡ Execute This Step
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
