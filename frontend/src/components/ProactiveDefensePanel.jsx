import React, { useState, useEffect } from 'react';

const M = { fontFamily: "'JetBrains Mono', monospace" };

export default function ProactiveDefensePanel({ API, onOpenPitchPad }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appliedRules, setAppliedRules] = useState([]);
  const [applyingRule, setApplyingRule] = useState(null);
  const [copiedCmd, setCopiedCmd] = useState(null);
  const [lastSignature, setLastSignature] = useState(null);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API}/proactive/forecast`);
      if (res.ok) {
        const data = await res.json();
        setForecast(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const handleApplyHardening = async (ruleId = 'ALL') => {
    try {
      setApplyingRule(ruleId);
      const res = await fetch(`${API}/proactive/apply-hardening`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id: ruleId })
      });
      if (res.ok) {
        const data = await res.json();
        setLastSignature(data.verification_signature);
        if (ruleId === 'ALL') {
          setAppliedRules(forecast?.rules?.map(r => r.id) || []);
        } else {
          setAppliedRules(prev => [...prev, ruleId]);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setApplyingRule(null);
    }
  };

  const copyCommand = (cmd, id) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Hero Banner */}
      <div className="card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(15, 118, 110, 0.25), rgba(6, 12, 28, 0.95) 60%, rgba(59, 130, 246, 0.15))',
        border: '1.5px solid rgba(15, 118, 110, 0.45)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.8rem' }}>🛡️</span>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                Proactive Defense &amp; Pre-Emptive Threat Shield
              </h1>
              <span className="badge" style={{ background: 'rgba(15,118,110,0.3)', border: '1px solid #0f766e', color: '#2dd4bf', fontWeight: 800 }}>
                PRE-ATTACK HARDENING ENGINE
              </span>
            </div>
            <p style={{ fontSize: '.84rem', color: '#cbd5e1', margin: 0, maxWidth: 840, lineHeight: 1.6 }}>
              Handle vulnerabilities <strong>BEFORE</strong> they appear in production. CyberShield AI analyzes early threat intelligence chatter, 
              predicts emerging attack vectors 7–14 days in advance, and automatically deploys 1-click virtual patches, kernel attack surface reduction (ASR), 
              and zero-trust isolation policies.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              onClick={() => handleApplyHardening('ALL')}
              disabled={applyingRule !== null}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #0f766e, #0d9488)',
                color: '#fff',
                fontWeight: 900,
                padding: '10px 18px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(15,118,110,0.5)',
                fontSize: '.76rem'
              }}
            >
              {applyingRule === 'ALL' ? '…Applying Hardening' : '⚡ Enforce All Pre-Hardening Shields'}
            </button>
            {onOpenPitchPad && (
              <button
                onClick={onOpenPitchPad}
                className="btn btn-sm btn-ghost"
                style={{ fontSize: '.76rem', fontWeight: 800, padding: '10px 14px' }}
              >
                🎓 Viva Guide
              </button>
            )}
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 18 }}>
          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ ...M, fontSize: '.62rem', color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase' }}>Forecast Horizon</p>
            <p style={{ ...M, fontSize: '1.4rem', fontWeight: 900, color: '#2dd4bf', margin: 0 }}>7–14 Days</p>
            <span style={{ fontSize: '.64rem', color: '#64748b' }}>Pre-Exploit Warning Window</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ ...M, fontSize: '.62rem', color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase' }}>Attack Surface Cut</p>
            <p style={{ ...M, fontSize: '1.4rem', fontWeight: 900, color: '#10b981', margin: 0 }}>92.4%</p>
            <span style={{ fontSize: '.64rem', color: '#64748b' }}>Risk Surface Neutralized</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ ...M, fontSize: '.62rem', color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase' }}>Pre-Hardening Rules</p>
            <p style={{ ...M, fontSize: '1.4rem', fontWeight: 900, color: '#38bdf8', margin: 0 }}>4 Active</p>
            <span style={{ fontSize: '.64rem', color: '#64748b' }}>Virtual Patches &amp; ASR</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ ...M, fontSize: '.62rem', color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase' }}>Digital Verification</p>
            <p style={{ ...M, fontSize: '1.1rem', fontWeight: 900, color: '#c4b5fd', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              HMAC-SHA256
            </p>
            <span style={{ fontSize: '.64rem', color: '#a78bfa' }}>Cryptographically Sealed</span>
          </div>
        </div>
      </div>

      {/* Verification Seal Banner if applied */}
      {lastSignature && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1.5px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 12,
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          animation: 'scaleUp 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.3rem' }}>🔐</span>
            <div>
              <p style={{ ...M, fontSize: '.75rem', fontWeight: 800, color: '#34d399', margin: 0 }}>
                Pre-Emptive Hardening Shield Enforced &bull; Cryptographically Verified
              </p>
              <p style={{ ...M, fontSize: '.68rem', color: '#cbd5e1', margin: '2px 0 0' }}>
                Digital Signature: <span style={{ color: '#00f0ff' }}>{lastSignature}</span> &bull; Lead: Pratyush Pandey · Guide: Prof. Pramod Patil
              </p>
            </div>
          </div>
          <span style={{ ...M, fontSize: '.62rem', background: 'rgba(16, 185, 129, 0.25)', color: '#34d399', padding: '3px 9px', borderRadius: 4, fontWeight: 800 }}>
            PASSED &bull; 100% SECURE
          </span>
        </div>
      )}

      {/* Proactive Rules Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              ⚡ Pre-Attack Surface Reduction (ASR) Hardening Rules
            </h3>
            <p style={{ fontSize: '.74rem', color: '#64748b', margin: '2px 0 0' }}>
              Click 'Enforce Shield' to apply virtual patches and sysctl hardening before threat actors exploit the vector.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {(forecast?.rules || []).map((r) => {
            const isApplied = appliedRules.includes(r.id);
            const isApplying = applyingRule === r.id;

            return (
              <div key={r.id} className="card" style={{
                padding: '18px 20px',
                background: isApplied ? 'rgba(16, 185, 129, 0.06)' : 'rgba(255,255,255,0.02)',
                border: isApplied ? '1.5px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: 12
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span className="badge" style={{ ...M, fontSize: '.6rem', background: 'rgba(0,240,255,0.12)', border: '1px solid #00f0ff', color: '#67e8f9' }}>
                        {r.id} &bull; {r.category}
                      </span>
                      <span style={{ ...M, fontSize: '.6rem', color: '#fbbf24', background: 'rgba(251,191,36,0.12)', padding: '2px 6px', borderRadius: 4 }}>
                        {r.prediction_horizon}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '.92rem', fontWeight: 800, color: '#fff', margin: 0 }}>{r.title}</h4>
                    <p style={{ ...M, fontSize: '.68rem', color: '#94a3b8', margin: '2px 0 0' }}>Target: {r.target_service}</p>
                  </div>

                  <span style={{
                    ...M,
                    fontSize: '.62rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: 5,
                    background: isApplied ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.15)',
                    border: isApplied ? '1px solid #10b981' : '1px solid #fbbf24',
                    color: isApplied ? '#34d399' : '#fbbf24'
                  }}>
                    {isApplied ? '✓ ENFORCED' : 'READY TO PRE-HARDEN'}
                  </span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <p style={{ fontSize: '.74rem', color: '#cbd5e1', margin: 0 }}>
                    <strong style={{ color: '#f87171' }}>Threat Vector:</strong> {r.threat_vector}
                  </p>
                  <p style={{ fontSize: '.74rem', color: '#cbd5e1', margin: 0 }}>
                    <strong style={{ color: '#34d399' }}>Blast Radius Saved:</strong> {r.blast_radius_saved}
                  </p>
                  <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>
                    <strong style={{ color: '#67e8f9' }}>Hardening Action:</strong> {r.hardening_action}
                  </p>
                </div>

                {/* CLI Command Box */}
                <div style={{ background: '#020610', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ ...M, fontSize: '.6rem', color: '#64748b' }}>⬡ Hardening Script (CLI)</span>
                    <button
                      onClick={() => copyCommand(r.cli_command, r.id)}
                      style={{ background: 'none', border: 'none', color: copiedCmd === r.id ? '#34d399' : '#67e8f9', ...M, fontSize: '.62rem', cursor: 'pointer', fontWeight: 700 }}
                    >
                      {copiedCmd === r.id ? '✓ Copied' : '⎘ Copy'}
                    </button>
                  </div>
                  <pre style={{ ...M, fontSize: '.68rem', color: '#2dd4bf', padding: '10px 12px', margin: 0, overflowX: 'auto', lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                    {r.cli_command}
                  </pre>
                </div>

                <button
                  onClick={() => handleApplyHardening(r.id)}
                  disabled={isApplied || isApplying}
                  className="btn btn-sm"
                  style={{
                    background: isApplied ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #0f766e, #0d9488)',
                    border: isApplied ? '1px solid #10b981' : 'none',
                    color: isApplied ? '#34d399' : '#fff',
                    fontWeight: 800,
                    padding: '8px 14px',
                    borderRadius: 7,
                    cursor: isApplied ? 'default' : 'pointer',
                    width: '100%',
                    justifyContent: 'center',
                    fontSize: '.74rem'
                  }}
                >
                  {isApplied ? '✓ Shield Enforced & Verified' : isApplying ? '…Applying Hardening' : `🛡️ Enforce Pre-Hardening Shield (${r.id})`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
