import React, { useState } from 'react';

const M = { fontFamily:"'JetBrains Mono',monospace" };
const TC = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#f59e0b', LOW:'#10b981' };

/* ─── Formula Step Card ─── */
function FormulaStep({ num, label, value, unit='', color='#67e8f9', note }) {
  return (
    <div style={{ display:'flex', gap:10, alignItems:'flex-start', padding:'10px 14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:9 }}>
      <div style={{ width:22, height:22, borderRadius:'50%', background:`${color}20`, border:`1px solid ${color}40`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ ...M, fontSize:'.6rem', color, fontWeight:700 }}>{num}</span>
      </div>
      <div style={{ flex:1 }}>
        <p style={{ ...M, fontSize:'.62rem', color:'#475569', letterSpacing:.5, textTransform:'uppercase', marginBottom:3 }}>{label}</p>
        <p style={{ ...M, fontSize:'1.05rem', fontWeight:800, color, lineHeight:1 }}>{value}<span style={{ fontSize:'.65rem', color:'#475569', marginLeft:4 }}>{unit}</span></p>
        {note && <p style={{ fontSize:'.65rem', color:'#64748b', marginTop:3 }}>{note}</p>}
      </div>
    </div>
  );
}

/* ─── SHAP Bar ─── */
function SHAPBar({ feat, wt, maxW }) {
  const width = (wt / maxW) * 100;
  const col = wt > 30 ? '#a78bfa' : wt > 20 ? '#8b5cf6' : '#6d28d9';
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, ...M, fontSize:'.7rem' }}>
        <span style={{ color:'#94a3b8' }}>{feat}</span>
        <div style={{ display:'flex', gap:6 }}>
          <span style={{ color:'#a78bfa', fontWeight:700 }}>{wt}%</span>
          <span style={{ color:'#334155' }}>contribution</span>
        </div>
      </div>
      <div className="rbar">
        <div className="rbar-fill" style={{ width:`${width}%`, background:`linear-gradient(90deg,#4c1d95,${col})`, transition:'width 1.2s ease' }}/>
      </div>
    </div>
  );
}

export default function XAIDrawer({ risk, onClose, onResolve }) {
  const [tab, setTab] = useState('overview'); // overview | formula | shap | remediation
  const [copied, setCopied] = useState(false);
  const [resolving, setResolving] = useState(false);

  if (!risk) return null;
  const { asset, vulnerability, ai_risk } = risk;
  const tc   = TC[ai_risk.threat_tier];
  const fs   = ai_risk.formula_steps || {};
  const shap = Object.entries(ai_risk.shap_attribution || {});
  const maxW = Math.max(...shap.map(([,v])=>v));

  const copy = () => { navigator.clipboard.writeText(vulnerability.patch_script); setCopied(true); setTimeout(()=>setCopied(false),2000); };
  const doResolve = async () => { setResolving(true); await onResolve?.(risk.finding_id, risk); setResolving(false); };

  const tabs = [
    { id:'overview',    label:'📊 Overview' },
    { id:'formula',     label:'🔢 AI Formula' },
    { id:'shap',        label:'🧬 XAI / SHAP' },
    { id:'remediation', label:'🛡️ Remediation' },
  ];

  return (
    <div style={{ position:'fixed', inset:0, zIndex:200, display:'flex', justifyContent:'flex-end', background:'rgba(0,0,0,0.8)', backdropFilter:'blur(12px)' }}>
      <div className="anim-slide" style={{
        width:'100%', maxWidth:720, height:'100%',
        background:'#070d1a', borderLeft:`1px solid ${tc}30`,
        display:'flex', flexDirection:'column', overflow:'hidden'
      }}>
        {/* Header */}
        <div style={{ padding:'22px 28px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
            <div>
              <p style={{ ...M, fontSize:'.6rem', color:'#8b5cf6', letterSpacing:1.2, textTransform:'uppercase', fontWeight:700, marginBottom:6 }}>
                🧠 CyberShield AI — Explainable Risk Analysis
              </p>
              <h2 style={{ fontWeight:800, fontSize:'1.06rem', color:'#fff', marginBottom:4 }}>
                {vulnerability.cve_id}: {vulnerability.title}
              </h2>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                <span className={`badge b-${ai_risk.threat_tier.toLowerCase()}`}>{ai_risk.threat_tier}</span>
                <span style={{ ...M, fontSize:'.65rem', color:'#64748b' }}>{asset.name}</span>
                <span style={{ ...M, fontSize:'.65rem', color:'#67e8f9' }}>{asset.ip}</span>
                <span style={{ ...M, fontSize:'.65rem', color:'#64748b' }}>·</span>
                <span style={{ ...M, fontSize:'.65rem', color:'#64748b' }}>{asset.exposure}</span>
                {vulnerability.exploit_available && (
                  <span style={{ ...M, fontSize:'.63rem', color:'#fca5a5', background:'rgba(239,68,68,.12)', border:'1px solid rgba(239,68,68,.3)', padding:'2px 8px', borderRadius:5 }}>⚡ Exploit PoC Confirmed</span>
                )}
              </div>
            </div>
            <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 11px', color:'#94a3b8', cursor:'pointer', fontSize:'1rem', flexShrink:0 }}>✕</button>
          </div>

          {/* Risk Score Hero */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10 }}>
            {[
              { label:'AI Risk Score', val:ai_risk.risk_score+'/100', col:tc },
              { label:'CVSS Score',    val:vulnerability.cvss, col:'#fbbf24' },
              { label:'EPSS Prob.',    val:(vulnerability.epss*100).toFixed(1)+'%', col:'#67e8f9' },
              { label:'Priority',      val:ai_risk.priority_code?.split('—')[0]?.trim()||'', col:'#a78bfa' },
            ].map(({label,val,col})=>(
              <div key={label} style={{ padding:'10px 12px', background:`${col}08`, border:`1px solid ${col}20`, borderRadius:9 }}>
                <p style={{ ...M, fontSize:'.58rem', color:'#475569', letterSpacing:.6, textTransform:'uppercase', marginBottom:4 }}>{label}</p>
                <p style={{ ...M, fontSize:'.95rem', fontWeight:800, color:col, lineHeight:1 }}>{val}</p>
              </div>
            ))}
          </div>

          {/* Tab Navigation + Audit PDF Button */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:14, flexWrap:'wrap', gap:6 }}>
            <div style={{ display:'flex', gap:2 }}>
              {tabs.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  padding:'6px 13px', borderRadius:7, border:'none', cursor:'pointer',
                  background: tab===t.id ? 'rgba(0,240,255,0.12)' : 'rgba(255,255,255,0.03)',
                  color: tab===t.id ? '#a5f3fc' : '#64748b',
                  ...M, fontSize:'.65rem', fontWeight: tab===t.id ? 700 : 400,
                  borderBottom: tab===t.id ? `2px solid #00f0ff` : '2px solid transparent',
                }}>{t.label}</button>
              ))}
            </div>
            <button
              onClick={() => window.open('http://localhost:8000/api/report/benchmark-accuracy-pdf', '_blank')}
              style={{
                padding:'5px 11px', borderRadius:6, border:'none', cursor:'pointer',
                background:'linear-gradient(135deg, #00D26A, #005A9C)', color:'#fff',
                ...M, fontSize:'.63rem', fontWeight:800, display:'flex', alignItems:'center', gap:4
              }}
              title="Download Full 4-Page Accuracy Audit Report"
            >
              📥 Download Accuracy Audit (PDF)
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 28px', display:'flex', flexDirection:'column', gap:16 }}>

          {/* ── OVERVIEW TAB ── */}
          {tab==='overview' && (
            <>
              {/* CVE Profile */}
              <div>
                <p style={{ ...M, fontSize:'.62rem', color:'#67e8f9', fontWeight:700, letterSpacing:.8, textTransform:'uppercase', marginBottom:10 }}>CVE Full Profile</p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  {[
                    ['CVE ID',          vulnerability.cve_id,                                '#67e8f9'],
                    ['CWE Weakness',     vulnerability.cwe,                                  '#a78bfa'],
                    ['Affected Component', vulnerability.component,                          '#94a3b8'],
                    ['CVSS v3 Score',    vulnerability.cvss + ' (Critical)',                 '#fbbf24'],
                    ['EPSS Probability', (vulnerability.epss*100).toFixed(2)+'% (Top 1%)', '#67e8f9'],
                    ['Exploit Status',   vulnerability.exploit_available ? '⚠️ Active PoC Confirmed — Weaponized' : '✓ No Public Exploit', vulnerability.exploit_available?'#fca5a5':'#6ee7b7'],
                    ['Asset Name',       asset.name,                                         '#cbd5e1'],
                    ['Asset Criticality',asset.criticality,                                  TC[asset.criticality==='Mission Critical'?'CRITICAL':asset.criticality] || '#94a3b8'],
                    ['Network Zone',     asset.exposure,                                     '#94a3b8'],
                    ['Owner / Team',     asset.owner,                                        '#a78bfa'],
                    ['Location',         asset.location,                                     '#64748b'],
                    ['Finding ID',       '#'+risk.finding_id,                                '#475569'],
                  ].map(([k,v,col])=>(
                    <div key={k} style={{ padding:'9px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.055)', borderRadius:8 }}>
                      <p style={{ ...M, fontSize:'.58rem', color:'#475569', letterSpacing:.5, marginBottom:3, textTransform:'uppercase' }}>{k}</p>
                      <p style={{ ...M, fontSize:'.72rem', color:col, fontWeight:600 }}>{v||'—'}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* XAI Narrative */}
              <div style={{ padding:'16px 18px', background:'rgba(0,240,255,0.04)', border:'1px solid rgba(0,240,255,0.15)', borderRadius:12 }}>
                <p style={{ ...M, fontSize:'.62rem', color:'#67e8f9', fontWeight:700, letterSpacing:.8, textTransform:'uppercase', marginBottom:10 }}>💡 AI Risk Reasoning Narrative</p>
                <p style={{ fontSize:'.82rem', color:'#cbd5e1', lineHeight:1.85 }}>{ai_risk.xai_narrative}</p>
              </div>
            </>
          )}

          {/* ── FORMULA TAB ── */}
          {tab==='formula' && (
            <>
              <div style={{ padding:'14px 18px', background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:12, marginBottom:4 }}>
                <p style={{ ...M, fontSize:'.62rem', color:'#c4b5fd', fontWeight:700, letterSpacing:.8, marginBottom:6 }}>MATHEMATICAL FORMULA — CYBERSHIELD AI RISK ENGINE</p>
                <div style={{ ...M, fontSize:'.82rem', color:'#e2e8f0', lineHeight:2.2, textAlign:'center' }}>
                  <div style={{ padding:'12px 16px', background:'rgba(0,0,0,0.3)', borderRadius:8, display:'inline-block' }}>
                    <span style={{ color:'#fbbf24' }}>Risk</span>
                    <span style={{ color:'#94a3b8' }}> = </span>
                    <span style={{ color:'#67e8f9' }}>CVSS</span>
                    <span style={{ color:'#94a3b8' }}> × </span>
                    <span style={{ color:'#fb923c' }}>W<sub style={{ fontSize:'.6em' }}>crit</sub></span>
                    <span style={{ color:'#94a3b8' }}> × (1 + </span>
                    <span style={{ color:'#a78bfa' }}>α·EPSS</span>
                    <span style={{ color:'#94a3b8' }}>) × </span>
                    <span style={{ color:'#06b6d4' }}>W<sub style={{ fontSize:'.6em' }}>exp</sub></span>
                    <span style={{ color:'#94a3b8' }}> × </span>
                    <span style={{ color:'#4ade80' }}>M<sub style={{ fontSize:'.6em' }}>exploit</sub></span>
                  </div>
                </div>
                <p style={{ ...M, fontSize:'.65rem', color:'#64748b', marginTop:8, textAlign:'center' }}>Output normalized to [0, 100] index · MAX_THEORETICAL = 49.14</p>
              </div>

              <p style={{ ...M, fontSize:'.62rem', color:'#c4b5fd', fontWeight:700, letterSpacing:.8, textTransform:'uppercase' }}>Step-by-Step Computation</p>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
                <FormulaStep num={1} label="CVSS Base Score" value={fs.step1_cvss} unit="/10.0" color='#fbbf24' note="NIST NVD CVSS v3.1 base severity score"/>
                <FormulaStep num={2} label="Criticality Weight (W_crit)" value={fs.step2_w_criticality} color='#fb923c' note={`${asset.criticality} → W_crit = ${fs.step2_w_criticality}`}/>
                <FormulaStep num={3} label="EPSS α Coefficient" value={`α = ${fs.step3_alpha}`} color='#a78bfa' note="Empirically tuned amplification factor"/>
                <FormulaStep num={4} label="EPSS Probability Score" value={`${(fs.step4_epss*100).toFixed(2)}%`} color='#67e8f9' note="FIRST.org EPSS — 30-day exploitation probability"/>
                <FormulaStep num={5} label="EPSS Factor (1 + α·EPSS)" value={fs.step5_epss_factor} color='#a78bfa' note={`= 1 + ${fs.step3_alpha} × ${fs.step4_epss} = ${fs.step5_epss_factor}`}/>
                <FormulaStep num={6} label="Exposure Weight (W_exp)" value={fs.step6_w_exposure} color='#06b6d4' note={`${asset.exposure} → W_exp = ${fs.step6_w_exposure}`}/>
                <FormulaStep num={7} label="Exploit Multiplier (M_exploit)" value={fs.step7_m_exploit} color='#4ade80' note={vulnerability.exploit_available ? "×1.30 — Weaponized PoC confirmed" : "×1.00 — No exploit detected"}/>
                <FormulaStep num={8} label="Raw Risk Value" value={fs.step8_raw_risk} color='#fbbf24' note={`= ${fs.step1_cvss}×${fs.step2_w_criticality}×${fs.step5_epss_factor}×${fs.step6_w_exposure}×${fs.step7_m_exploit}`}/>
              </div>

              <div style={{ padding:'16px 20px', background:`${tc}08`, border:`1px solid ${tc}30`, borderRadius:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
                  <div>
                    <p style={{ ...M, fontSize:'.63rem', color:'#64748b', marginBottom:4 }}>NORMALIZATION — Step 9</p>
                    <p style={{ ...M, fontSize:'.78rem', color:'#cbd5e1' }}>
                      ({fs.step8_raw_risk} ÷ {fs.step9_normalization}) × 100 = {fs.step10_risk_score}
                    </p>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <p style={{ ...M, fontSize:'.63rem', color:'#64748b', marginBottom:2 }}>FINAL AI RISK SCORE</p>
                    <p style={{ ...M, fontSize:'2.5rem', fontWeight:900, color:tc, lineHeight:1 }}>{fs.step10_risk_score}</p>
                    <p style={{ ...M, fontSize:'.6rem', color:'#475569' }}>/100 normalized index</p>
                  </div>
                </div>
              </div>

              <div style={{ padding:'10px 14px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.055)', borderRadius:9 }}>
                <p style={{ ...M, fontSize:'.62rem', color:'#475569' }}>
                  Model parameters: W_crit ∈ &#123;0.75, 1.00, 1.25, 1.50&#125; · W_exp ∈ &#123;0.60, 1.00, 1.20, 1.40&#125; · M_exploit ∈ &#123;1.00, 1.30&#125; · α = 0.8 · MAX_THEORETICAL = 49.14
                </p>
              </div>
            </>
          )}

          {/* ── SHAP TAB ── */}
          {tab==='shap' && (
            <>
              <div style={{ padding:'14px 18px', background:'rgba(139,92,246,0.05)', border:'1px solid rgba(139,92,246,0.18)', borderRadius:12 }}>
                <p style={{ ...M, fontSize:'.63rem', color:'#c4b5fd', fontWeight:700, letterSpacing:.8, marginBottom:6 }}>SHAP-STYLE FEATURE ATTRIBUTION</p>
                <p style={{ fontSize:'.77rem', color:'#94a3b8', lineHeight:1.7 }}>
                  Additive decomposition of total risk score into per-feature contributions.
                  Each feature's marginal lift above baseline is normalized as a percentage of total accumulated risk signal.
                </p>
              </div>

              <div style={{ padding:'16px 18px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12 }}>
                {shap.map(([feat,wt])=>(
                  <SHAPBar key={feat} feat={feat} wt={wt} maxW={maxW}/>
                ))}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                {shap.map(([feat,wt])=>{
                  const col = wt>=30?'#ef4444':wt>=25?'#f97316':wt>=20?'#f59e0b':wt>=15?'#3b82f6':'#10b981';
                  return (
                    <div key={feat} style={{ padding:'12px 14px', background:`${col}08`, border:`1px solid ${col}25`, borderRadius:9, textAlign:'center' }}>
                      <p style={{ ...M, fontSize:'1.6rem', fontWeight:900, color:col, lineHeight:1 }}>{wt}%</p>
                      <p style={{ fontSize:'.67rem', color:'#64748b', marginTop:5, lineHeight:1.4 }}>{feat}</p>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding:'12px 16px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:9 }}>
                <p style={{ ...M, fontSize:'.63rem', color:'#475569', lineHeight:1.7 }}>
                  * SHAP (SHapley Additive exPlanations) attribution methodology applied to multi-factor risk model.
                  Feature contributions are additive and sum to 100%. Top contributor: <span style={{ color:'#a78bfa', fontWeight:700 }}>{shap.sort((a,b)=>b[1]-a[1])[0]?.[0]}</span>
                  &nbsp;({shap.sort((a,b)=>b[1]-a[1])[0]?.[1]}% of total risk signal).
                </p>
              </div>
            </>
          )}

          {/* ── REMEDIATION TAB ── */}
          {tab==='remediation' && (
            <>
              <div style={{ padding:'14px 18px', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:12 }}>
                <p style={{ ...M, fontSize:'.63rem', color:'#6ee7b7', fontWeight:700, letterSpacing:.8, marginBottom:8 }}>REMEDIATION PRIORITY</p>
                <p style={{ ...M, fontSize:'.9rem', color:'#34d399', fontWeight:700, marginBottom:4 }}>{ai_risk.priority_code}</p>
                <p style={{ fontSize:'.78rem', color:'#94a3b8', lineHeight:1.7 }}>
                  AI Risk Score {ai_risk.risk_score}/100 — {ai_risk.threat_tier} tier.
                  Asset: {asset.name} ({asset.criticality}, {asset.exposure}).
                </p>
              </div>

              <div>
                <p style={{ ...M, fontSize:'.63rem', color:'#6ee7b7', fontWeight:700, letterSpacing:.8, textTransform:'uppercase', marginBottom:10 }}>Recommended Mitigation Steps</p>
                <div style={{ padding:'16px 18px', background:'rgba(16,185,129,0.04)', border:'1px solid rgba(16,185,129,0.12)', borderRadius:12 }}>
                  <p style={{ fontSize:'.82rem', color:'#cbd5e1', lineHeight:1.85 }}>{vulnerability.remediation}</p>
                </div>
              </div>

              <div>
                <p style={{ ...M, fontSize:'.63rem', color:'#6ee7b7', fontWeight:700, letterSpacing:.8, textTransform:'uppercase', marginBottom:10 }}>Automated Patch CLI Script</p>
                <div style={{ background:'#030609', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, overflow:'hidden' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)', ...M, fontSize:'.62rem' }}>
                    <span style={{ color:'#475569' }}>⬡ bash — Automated Patch Script · {vulnerability.cve_id}</span>
                    <button onClick={copy} style={{ background:'none', border:'none', color:copied?'#6ee7b7':'#67e8f9', cursor:'pointer', ...M, fontSize:'.65rem', fontWeight:700 }}>
                      {copied ? '✓ Copied!' : '⎘ Copy Script'}
                    </button>
                  </div>
                  <pre style={{ ...M, fontSize:'.73rem', color:'#6ee7b7', padding:'16px 18px', overflowX:'auto', lineHeight:1.7, whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                    {vulnerability.patch_script}
                  </pre>
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {[
                  { label:'Estimated Effort', val:'4–8 hours', color:'#f59e0b' },
                  { label:'Rollback Risk', val:'Low', color:'#10b981' },
                  { label:'Restart Required', val:'Yes (service)', color:'#f97316' },
                  { label:'Downtime Window', val:'15–30 min', color:'#3b82f6' },
                ].map(({label,val,color})=>(
                  <div key={label} style={{ padding:'10px 14px', background:`${color}08`, border:`1px solid ${color}20`, borderRadius:9 }}>
                    <p style={{ ...M, fontSize:'.6rem', color:'#475569', marginBottom:3, textTransform:'uppercase', letterSpacing:.5 }}>{label}</p>
                    <p style={{ ...M, fontSize:'.82rem', color, fontWeight:700 }}>{val}</p>
                  </div>
                ))}
              </div>

              {onResolve && (
                <button onClick={doResolve} disabled={resolving} className="btn" style={{
                  width:'100%', justifyContent:'center', padding:'13px 20px',
                  background:'linear-gradient(135deg, #10b981, #059669)',
                  color:'#fff', fontWeight: 900,
                  boxShadow:'0 4px 20px rgba(16,185,129,.4)', fontSize:'.86rem',
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                }}>
                  {resolving ? '…Executing Remediation' : '🛡️ Execute Autonomous Mitigation & View Audit Report ➔'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
