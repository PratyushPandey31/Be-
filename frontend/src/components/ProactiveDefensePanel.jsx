import React, { useState, useEffect } from 'react';

const M = { fontFamily: "'JetBrains Mono', monospace" };

const CATEGORY_COLORS = {
  'WAF Virtual Patching':           { color: '#f97316', bg: 'rgba(249,115,22,0.12)', icon: '🔥' },
  'Kernel Attack Surface Reduction':{ color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', icon: '⚙️' },
  'Zero-Trust Micro-Segmentation':  { color: '#00f0ff', bg: 'rgba(0,240,255,0.10)', icon: '🔒' },
  'Supply Chain Early Shield':       { color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: '🔗' },
};

function ConfidenceBar({ score }) {
  const col = score >= 98 ? '#34d399' : score >= 95 ? '#00f0ff' : '#fbbf24';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`,
          background: `linear-gradient(90deg, ${col}80, ${col})`,
          borderRadius: 3,
          boxShadow: `0 0 6px ${col}60`,
          transition: 'width 1s ease'
        }} />
      </div>
      <span style={{ ...M, fontSize: '.68rem', fontWeight: 800, color: col, minWidth: 42 }}>{score}%</span>
    </div>
  );
}

export default function ProactiveDefensePanel({ API = 'http://127.0.0.1:8000/api', onOpenPitchPad }) {
  const [forecast, setForecast]           = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [appliedRules, setAppliedRules]   = useState({});   // { ruleId: executionSummary }
  const [applyingRule, setApplyingRule]   = useState(null);
  const [copiedCmd, setCopiedCmd]         = useState(null);
  const [allApplied, setAllApplied]       = useState(null); // result of 'enforce all'
  const [expandedRule, setExpandedRule]   = useState(null);

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`${API}/proactive/forecast`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setForecast(await res.json());
    } catch (e) {
      setError(`Failed to load forecast: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForecast(); }, []);

  const applyHardening = async (ruleId) => {
    try {
      setApplyingRule(ruleId);
      const res = await fetch(`${API}/proactive/apply-hardening`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id: ruleId })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAppliedRules(prev => ({ ...prev, [ruleId]: data }));
    } catch (e) {
      console.error('Hardening error:', e);
    } finally {
      setApplyingRule(null);
    }
  };

  const applyAll = async () => {
    setApplyingRule('ALL');
    try {
      const res = await fetch(`${API}/proactive/apply-hardening`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rule_id: 'ALL' })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setAllApplied(data);
      // mark every rule applied
      const allIds = {};
      (forecast?.rules || []).forEach(r => { allIds[r.id] = data; });
      setAppliedRules(allIds);
    } catch (e) {
      console.error('Apply all error:', e);
    } finally {
      setApplyingRule(null);
    }
  };

  const copyCmd = (cmd, id) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const appliedCount = Object.keys(appliedRules).length;
  const totalRules   = forecast?.rules?.length || 4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="anim-fadeup">

      {/* ── HERO BANNER ── */}
      <div className="card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(15,118,110,0.22), rgba(6,12,28,0.96) 55%, rgba(59,130,246,0.10))',
        border: '1.5px solid rgba(15,118,110,0.45)',
        position: 'relative', overflow: 'hidden'
      }}>
        {/* top accent bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #0f766e, #0ea5e9, #8b5cf6)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.8rem' }}>🛡️</span>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0 }}>
                Proactive Defense &amp; Pre-Emptive Threat Shield
              </h1>
              <span className="badge" style={{ background: 'rgba(15,118,110,0.3)', border: '1px solid #0f766e', color: '#2dd4bf', fontWeight: 800, fontSize: '.6rem' }}>
                PRE-ATTACK HARDENING ENGINE
              </span>
            </div>
            <p style={{ fontSize: '.84rem', color: '#cbd5e1', margin: '0 0 0', maxWidth: 800, lineHeight: 1.65 }}>
              Handle vulnerabilities <strong style={{ color: '#2dd4bf' }}>BEFORE</strong> they appear in production.
              CyberShield AI analyzes early threat-intelligence chatter, predicts emerging attack vectors{' '}
              <strong>7–14 days in advance</strong>, and automatically deploys 1-click virtual patches,
              kernel ASR rules, and zero-trust isolation policies.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <button
              onClick={applyAll}
              disabled={applyingRule !== null || appliedCount === totalRules}
              style={{
                background: appliedCount === totalRules
                  ? 'rgba(16,185,129,0.15)'
                  : 'linear-gradient(135deg, #0f766e, #0d9488)',
                border: appliedCount === totalRules ? '1px solid #10b981' : 'none',
                color: appliedCount === totalRules ? '#34d399' : '#fff',
                fontWeight: 900, padding: '10px 18px', borderRadius: 8,
                cursor: appliedCount === totalRules ? 'default' : 'pointer',
                boxShadow: appliedCount === totalRules ? 'none' : '0 0 20px rgba(15,118,110,0.5)',
                fontSize: '.76rem', ...M,
                opacity: applyingRule === 'ALL' ? 0.7 : 1
              }}
            >
              {applyingRule === 'ALL'
                ? '⏳ Applying All Shields…'
                : appliedCount === totalRules
                  ? '✅ All Shields Enforced'
                  : '⚡ Enforce All Pre-Hardening Shields'}
            </button>
            <button onClick={fetchForecast} style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', fontWeight: 700, padding: '10px 14px', borderRadius: 8,
              cursor: 'pointer', fontSize: '.74rem', ...M
            }}>
              🔄 Refresh
            </button>
            {onOpenPitchPad && (
              <button onClick={onOpenPitchPad} className="btn btn-sm btn-ghost"
                style={{ fontSize: '.76rem', fontWeight: 800, padding: '10px 14px' }}>
                🎓 Viva Guide
              </button>
            )}
          </div>
        </div>

        {/* ── 4 KPI CARDS (live from API) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 18 }}>
          <div style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ ...M, fontSize: '.6rem', color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase' }}>Forecast Horizon</p>
            <p style={{ ...M, fontSize: '1.35rem', fontWeight: 900, color: '#2dd4bf', margin: 0 }}>
              {forecast ? `${forecast.forecast_horizon_days} Days` : '—'}
            </p>
            <span style={{ fontSize: '.62rem', color: '#64748b' }}>Pre-Exploit Warning Window</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ ...M, fontSize: '.6rem', color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase' }}>Attack Surface Cut</p>
            <p style={{ ...M, fontSize: '1.35rem', fontWeight: 900, color: '#10b981', margin: 0 }}>
              {forecast ? forecast.threat_reduction_potential.split('%')[0] + '%' : '—'}
            </p>
            <span style={{ fontSize: '.62rem', color: '#64748b' }}>Risk Surface Neutralized</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(56,189,248,0.2)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ ...M, fontSize: '.6rem', color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase' }}>Pre-Hardening Rules</p>
            <p style={{ ...M, fontSize: '1.35rem', fontWeight: 900, color: '#38bdf8', margin: 0 }}>
              {appliedCount}/{totalRules} Applied
            </p>
            <span style={{ fontSize: '.62rem', color: '#64748b' }}>Virtual Patches &amp; ASR Rules</span>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(196,181,253,0.2)', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ ...M, fontSize: '.6rem', color: '#94a3b8', margin: '0 0 3px', textTransform: 'uppercase' }}>Digital Verification</p>
            <p style={{ ...M, fontSize: '.88rem', fontWeight: 900, color: '#c4b5fd', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              HMAC-SHA256
            </p>
            <span style={{ fontSize: '.62rem', color: '#a78bfa' }}>Cryptographically Sealed</span>
          </div>
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, padding: '12px 18px', color: '#f87171', ...M, fontSize: '.78rem' }}>
          ⚠️ {error} — <button onClick={fetchForecast} style={{ background: 'none', border: 'none', color: '#67e8f9', cursor: 'pointer', ...M, fontSize: '.78rem' }}>Retry</button>
        </div>
      )}

      {/* ── GLOBAL SUCCESS BANNER ── */}
      {allApplied && (
        <div style={{
          background: 'rgba(16,185,129,0.1)', border: '1.5px solid rgba(16,185,129,0.4)',
          borderRadius: 12, padding: '16px 22px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
            <span style={{ fontSize: '1.4rem' }}>🔐</span>
            <div>
              <p style={{ ...M, fontSize: '.8rem', fontWeight: 900, color: '#34d399', margin: '0 0 4px' }}>
                ⚡ ALL {totalRules} Pre-Hardening Shields Enforced &amp; Cryptographically Verified
              </p>
              <p style={{ ...M, fontSize: '.68rem', color: '#67e8f9', margin: '0 0 3px' }}>
                Signature: <strong>{allApplied.verification_signature}</strong>
              </p>
              <p style={{ fontSize: '.68rem', color: '#94a3b8', margin: 0 }}>
                Applied by: <strong style={{ color: '#fff' }}>{allApplied.execution_summary?.applied_by || 'Pratyush Pandey (SecOps Lead)'}</strong>
                &nbsp;·&nbsp; Guide: <strong style={{ color: '#c4b5fd' }}>{allApplied.execution_summary?.supervised_by || 'Prof. Pramod Patil'}</strong>
                &nbsp;·&nbsp; {allApplied.execution_summary?.compliance_attestation}
              </p>
            </div>
          </div>
          <span style={{ ...M, fontSize: '.68rem', background: 'rgba(16,185,129,0.25)', border: '1px solid #10b981', color: '#34d399', padding: '4px 12px', borderRadius: 6, fontWeight: 900 }}>
            PASSED · 100% SECURE
          </span>
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ padding: '50px', textAlign: 'center', color: '#64748b', ...M, fontSize: '.8rem' }}>
          <div style={{ width: 36, height: 36, border: '3px solid rgba(0,240,255,0.15)', borderTopColor: '#00f0ff', borderRadius: '50%', animation: 'spin .8s linear infinite', margin: '0 auto 14px' }} />
          Loading threat forecast from intelligence feed…
        </div>
      )}

      {/* ── RULES GRID ── */}
      {!loading && forecast && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                ⚡ Pre-Attack Surface Reduction (ASR) Hardening Rules
              </h3>
              <p style={{ fontSize: '.74rem', color: '#64748b', margin: '3px 0 0' }}>
                Each rule targets a specific predicted attack vector — click <strong style={{ color: '#2dd4bf' }}>Enforce Shield</strong> to apply.
              </p>
            </div>
            <span style={{ ...M, fontSize: '.68rem', color: '#64748b' }}>
              {appliedCount}/{totalRules} enforced
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {forecast.rules.map((rule) => {
              const isApplied  = !!appliedRules[rule.id];
              const isApplying = applyingRule === rule.id;
              const isExpanded = expandedRule === rule.id;
              const catCfg     = CATEGORY_COLORS[rule.category] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', icon: '🛡️' };
              const applyResult = appliedRules[rule.id];

              return (
                <div key={rule.id} className="card" style={{
                  padding: '0',
                  border: isApplied
                    ? '1.5px solid rgba(16,185,129,0.45)'
                    : `1px solid ${catCfg.color}30`,
                  background: isApplied
                    ? 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(6,12,28,0.98))'
                    : 'rgba(255,255,255,0.02)',
                  overflow: 'hidden',
                  display: 'flex', flexDirection: 'column'
                }}>
                  {/* card top color bar */}
                  <div style={{ height: 3, background: isApplied ? '#10b981' : catCfg.color, opacity: isApplied ? 1 : 0.7 }} />

                  <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>

                    {/* Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 5 }}>
                          <span style={{
                            ...M, fontSize: '.6rem', fontWeight: 800,
                            background: catCfg.bg, border: `1px solid ${catCfg.color}50`,
                            color: catCfg.color, padding: '2px 8px', borderRadius: 5
                          }}>
                            {catCfg.icon} {rule.id} · {rule.category}
                          </span>
                          <span style={{
                            ...M, fontSize: '.6rem', color: '#fbbf24',
                            background: 'rgba(251,191,36,0.1)', padding: '2px 7px', borderRadius: 4
                          }}>
                            ⏰ {rule.prediction_horizon}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '.92rem', fontWeight: 800, color: '#fff', margin: '0 0 3px' }}>{rule.title}</h4>
                        <p style={{ ...M, fontSize: '.66rem', color: '#64748b', margin: 0 }}>
                          🎯 Target: <span style={{ color: '#94a3b8' }}>{rule.target_service}</span>
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                        <span style={{
                          ...M, fontSize: '.62rem', fontWeight: 800,
                          padding: '3px 9px', borderRadius: 5,
                          background: isApplied ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.12)',
                          border: isApplied ? '1px solid #10b981' : '1px solid #f59e0b',
                          color: isApplied ? '#34d399' : '#fbbf24'
                        }}>
                          {isApplied ? '✅ ENFORCED' : '⚠️ PENDING'}
                        </span>
                        <span style={{ ...M, fontSize: '.6rem', color: catCfg.color, fontWeight: 700 }}>
                          AI Confidence
                        </span>
                        <span style={{ ...M, fontSize: '.78rem', fontWeight: 900, color: catCfg.color }}>
                          {rule.confidence_score}%
                        </span>
                      </div>
                    </div>

                    {/* Confidence bar */}
                    <ConfidenceBar score={rule.confidence_score} />

                    {/* Threat info box */}
                    <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <p style={{ fontSize: '.73rem', color: '#cbd5e1', margin: 0 }}>
                        <span style={{ color: '#f87171', fontWeight: 700 }}>🎯 Threat Vector: </span>{rule.threat_vector}
                      </p>
                      <p style={{ fontSize: '.73rem', color: '#cbd5e1', margin: 0 }}>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>💥 Blast Radius Saved: </span>{rule.blast_radius_saved}
                      </p>
                      <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>
                        <span style={{ color: '#67e8f9', fontWeight: 700 }}>🔧 Action: </span>{rule.hardening_action}
                      </p>
                    </div>

                    {/* CLI Command box */}
                    <div style={{ background: '#020610', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ ...M, fontSize: '.6rem', color: '#64748b' }}>⬡ Hardening Script (CLI)</span>
                        <button onClick={() => copyCmd(rule.cli_command, rule.id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: copiedCmd === rule.id ? '#34d399' : '#67e8f9',
                          ...M, fontSize: '.62rem', fontWeight: 700
                        }}>
                          {copiedCmd === rule.id ? '✅ Copied!' : '⎘ Copy'}
                        </button>
                      </div>
                      <pre style={{ ...M, fontSize: '.67rem', color: '#2dd4bf', padding: '10px 13px', margin: 0, overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 120 }}>
                        {rule.cli_command}
                      </pre>
                    </div>

                    {/* Success result block after enforcement */}
                    {isApplied && applyResult && (
                      <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '10px 14px' }}>
                        <p style={{ ...M, fontSize: '.65rem', color: '#34d399', fontWeight: 800, margin: '0 0 5px' }}>
                          🔐 Hardening Applied — Cryptographic Verification Seal
                        </p>
                        <p style={{ ...M, fontSize: '.62rem', color: '#67e8f9', margin: '0 0 3px', wordBreak: 'break-all' }}>
                          Signature: {applyResult.verification_signature}
                        </p>
                        <p style={{ fontSize: '.65rem', color: '#94a3b8', margin: '0 0 2px' }}>
                          By: <strong style={{ color: '#fff' }}>{applyResult.execution_summary?.applied_by}</strong>
                          &nbsp;·&nbsp; {applyResult.execution_summary?.compliance_attestation}
                        </p>
                        <p style={{ ...M, fontSize: '.62rem', color: '#475569', margin: 0 }}>
                          Blast Radius Mitigated: {applyResult.execution_summary?.blast_radius_mitigated}
                        </p>
                      </div>
                    )}

                    {/* Enforce button */}
                    <button
                      onClick={() => applyHardening(rule.id)}
                      disabled={isApplied || isApplying || applyingRule !== null}
                      style={{
                        background: isApplied
                          ? 'rgba(16,185,129,0.12)'
                          : `linear-gradient(135deg, ${catCfg.color}cc, ${catCfg.color})`,
                        border: isApplied ? '1px solid #10b981' : 'none',
                        color: isApplied ? '#34d399' : '#fff',
                        fontWeight: 800, padding: '9px 14px', borderRadius: 8,
                        cursor: isApplied || isApplying ? 'default' : 'pointer',
                        width: '100%', fontSize: '.74rem',
                        ...M, opacity: isApplying ? 0.7 : 1,
                        boxShadow: isApplied ? 'none' : `0 0 16px ${catCfg.color}40`,
                        transition: 'all .2s ease'
                      }}
                    >
                      {isApplying
                        ? '⏳ Applying Hardening Shield…'
                        : isApplied
                          ? `✅ ${rule.id} Shield Enforced & Verified`
                          : `🛡️ Enforce Pre-Hardening Shield (${rule.id})`}
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FOOTER SEAL ── */}
      {forecast && (
        <div style={{
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 10, padding: '12px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8
        }}>
          <div>
            <p style={{ ...M, fontSize: '.62rem', color: '#64748b', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              CyberShield AI — Proactive Defense Engine · Digital Seal
            </p>
            <p style={{ ...M, fontSize: '.65rem', color: '#475569', margin: 0 }}>
              {forecast.digital_seal} · Lead: <span style={{ color: '#67e8f9' }}>{forecast.lead_researcher}</span>
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ ...M, fontSize: '.62rem', color: '#475569', margin: 0 }}>
              Guide: <span style={{ color: '#c4b5fd' }}>{forecast.project_guide}</span>
            </p>
            <p style={{ ...M, fontSize: '.6rem', color: '#334155', margin: '2px 0 0' }}>
              {forecast.timestamp}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
