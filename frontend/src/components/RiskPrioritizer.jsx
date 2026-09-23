import React, { useState, useMemo } from 'react';

const M = { fontFamily:"'JetBrains Mono',monospace" };
const TC = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#f59e0b', LOW:'#10b981' };
const TIERS = ['ALL','CRITICAL','HIGH','MEDIUM','LOW'];

/* ─── useAIStream hook inline ─── */
function useAIStream() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const stream = async (prompt, model = 'cybershield-neural-v3') => {
    setText(''); setLoading(true); setDone(false);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model_id: model, deep_search_depth: 'fast' })
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done: d } = await reader.read();
        if (d) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          if (!part.trim()) continue;
          let evtType = '', dataStr = '';
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) evtType = line.slice(7).trim();
            if (line.startsWith('data: '))  dataStr = line.slice(6).trim();
          }
          if (evtType === 'token' && dataStr) {
            try { const p = JSON.parse(dataStr); setText(prev => prev + p.token); } catch {}
          }
        }
      }
    } catch {}
    finally { setLoading(false); setDone(true); }
  };

  return { text, loading, done, stream, reset: () => { setText(''); setDone(false); } };
}

/* ── Clean AI Markdown Formatter ── */
function FormattedAIText({ text, accentColor = '#00f0ff' }) {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((line, lIdx) => {
        if (!line.trim()) return <div key={lIdx} style={{ height: 3 }} />;
        const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ') || line.trim().startsWith('• ');
        const cleanLine = isBullet ? line.trim().replace(/^[\*\-\•]\s+/, '') : line;

        const parts = [];
        const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
        let lastIndex = 0;
        let match;
        let pIdx = 0;

        while ((match = regex.exec(cleanLine)) !== null) {
          if (match.index > lastIndex) {
            parts.push(<span key={pIdx++}>{cleanLine.substring(lastIndex, match.index)}</span>);
          }
          const m = match[0];
          if (m.startsWith('**') && m.endsWith('**')) {
            parts.push(
              <strong key={pIdx++} style={{ color: accentColor, fontWeight: 800 }}>
                {m.slice(2, -2)}
              </strong>
            );
          } else if (m.startsWith('`') && m.endsWith('`')) {
            parts.push(
              <code key={pIdx++} style={{ background: 'rgba(0,240,255,0.12)', color: '#67e8f9', padding: '1px 5px', borderRadius: 4, fontFamily: "'JetBrains Mono',monospace", border: '1px solid rgba(0,240,255,0.25)' }}>
                {m.slice(1, -1)}
              </code>
            );
          }
          lastIndex = match.index + m.length;
        }

        if (lastIndex < cleanLine.length) {
          parts.push(<span key={pIdx++}>{cleanLine.substring(lastIndex)}</span>);
        }

        return (
          <div key={lIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: isBullet ? 6 : 0, lineHeight: 1.65 }}>
            {isBullet && <span style={{ color: accentColor, fontSize: '.72rem', marginTop: 1 }}>▸</span>}
            <div style={{ flex: 1 }}>{parts.length > 0 ? parts : cleanLine}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Inline AI Explain Box per row ─── */
function AIExplainBox({ text, loading, done, color = '#00f0ff' }) {
  if (!text && !loading) return null;
  return (
    <tr>
      <td colSpan={8} style={{ padding: 0 }}>
        <div style={{
          padding: '12px 20px',
          background: `linear-gradient(135deg, ${color}06, rgba(0,0,0,0.4))`,
          borderTop: `1px solid ${color}25`,
          borderBottom: `1px solid ${color}15`,
          display: 'flex', flexDirection: 'column', gap: 4
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: '.85rem', animation: loading ? 'pulse 1s infinite' : 'none' }}>🤖</span>
            <span style={{ ...M, fontSize: '.62rem', fontWeight: 800, color, letterSpacing: .5 }}>
              ROBO AI CyberShield Neural Engine v3.0 — Live Inference
            </span>
            {loading && (
              <span style={{ ...M, fontSize: '.56rem', color, background: `${color}15`, border: `1px solid ${color}40`, padding: '1px 7px', borderRadius: 4, fontWeight: 800 }}>
                ● STREAMING
              </span>
            )}
            {done && !loading && (
              <span style={{ ...M, fontSize: '.56rem', color: '#34d399' }}>✓ Analysis complete</span>
            )}
          </div>
          <div style={{ ...M, fontSize: '.74rem', color: '#a5f3fc', lineHeight: 1.7, margin: 0 }}>
            <FormattedAIText text={text} accentColor={color} />
            {loading && (
              <span style={{
                display: 'inline-block', width: 6, height: 12,
                background: color, marginLeft: 3, verticalAlign: 'middle',
                animation: 'pulse .55s infinite', boxShadow: `0 0 8px ${color}`
              }} />
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}

/* ─── Expandable Detail Row ─── */
function DetailRow({ r, onResolve }) {
  const shap = Object.entries(r.ai_risk.shap_attribution);
  const maxW  = Math.max(...shap.map(([,v])=>v));
  return (
    <tr className="detail-row">
      <td colSpan={8}>
        <div className="detail-inner">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>

            {/* Left: CVE full detail */}
            <div>
              <p style={{ ...M, fontSize:'.6rem', color:'#67e8f9', letterSpacing:1, textTransform:'uppercase', fontWeight:700, marginBottom:10 }}>📋 Full CVE Profile</p>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  ['CVE ID', r.vulnerability.cve_id],
                  ['Title', r.vulnerability.title],
                  ['Component', r.vulnerability.component],
                  ['CWE', r.vulnerability.cwe],
                  ['CVSS Score', r.vulnerability.cvss + ' (Critical)'],
                  ['EPSS Prob', (r.vulnerability.epss*100).toFixed(2) + '%'],
                  ['Exploit PoC', r.vulnerability.exploit_available ? '⚠️ YES — Weaponized' : '✓ Not Available'],
                  ['Finding ID', '#' + r.finding_id],
                  ['Detected At', r.detected_at || 'N/A'],
                ].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', gap:8 }}>
                    <span style={{ ...M, fontSize:'.66rem', color:'#475569', minWidth:90, flexShrink:0 }}>{k}:</span>
                    <span style={{ ...M, fontSize:'.66rem', color:k==='Exploit PoC'&&r.vulnerability.exploit_available?'#fca5a5':'#cbd5e1', fontWeight:k==='CVE ID'?700:400 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle: SHAP attribution bars */}
            <div>
              <p style={{ ...M, fontSize:'.6rem', color:'#c4b5fd', letterSpacing:1, textTransform:'uppercase', fontWeight:700, marginBottom:10 }}>🧬 SHAP Feature Attribution</p>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {shap.map(([feat, wt]) => (
                  <div key={feat}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, ...M, fontSize:'.67rem' }}>
                      <span style={{ color:'#94a3b8' }}>{feat}</span>
                      <span style={{ color:'#a78bfa', fontWeight:700 }}>{wt}%</span>
                    </div>
                    <div className="rbar">
                      <div className="rbar-fill" style={{ width:`${(wt/maxW)*100}%`, background:'linear-gradient(90deg,#7c3aed,#a78bfa)' }}/>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ ...M, fontSize:'.58rem', color:'#334155', marginTop:8 }}>* Additive SHAP-style decomposition</p>
            </div>

            {/* Right: Remediation */}
            <div>
              <p style={{ ...M, fontSize:'.6rem', color:'#6ee7b7', letterSpacing:1, textTransform:'uppercase', fontWeight:700, marginBottom:10 }}>🛡️ Remediation Guide</p>
              <p style={{ fontSize:'.74rem', color:'#cbd5e1', lineHeight:1.75, marginBottom:12 }}>{r.vulnerability.remediation}</p>
              <div style={{ background:'#030609', border:'1px solid rgba(255,255,255,0.07)', borderRadius:8, overflow:'hidden' }}>
                <div style={{ padding:'6px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)', ...M, fontSize:'.6rem', color:'#475569' }}>⬡ Patch CLI</div>
                <pre style={{ ...M, fontSize:'.68rem', color:'#6ee7b7', padding:'10px 12px', overflowX:'auto', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{r.vulnerability.patch_script}</pre>
              </div>
              <div style={{ marginTop:10, ...M, fontSize:'.64rem', color:'#64748b' }}>
                <p>Priority: <span style={{ color:'#fbbf24', fontWeight:700 }}>{r.ai_risk.priority_code}</span></p>
              </div>

              {onResolve && (
                <button
                  onClick={() => onResolve(r.finding_id, r)}
                  style={{
                    marginTop: 10, width: '100%', padding: '8px 14px', borderRadius: 8,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff', ...M, fontSize: '.72rem', fontWeight: 800,
                    cursor: 'pointer', border: 'none',
                    boxShadow: '0 2px 12px rgba(16,185,129,.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                  }}
                >
                  🛡️ Execute Patch &amp; Generate Audit Report →
                </button>
              )}
            </div>
          </div>

          {/* XAI Narrative */}
          <div style={{ marginTop:14, padding:'12px 16px', background:'rgba(0,240,255,0.04)', border:'1px solid rgba(0,240,255,0.12)', borderRadius:8 }}>
            <p style={{ ...M, fontSize:'.6rem', color:'#67e8f9', fontWeight:700, marginBottom:6 }}>💡 AI RISK REASONING NARRATIVE</p>
            <p style={{ fontSize:'.76rem', color:'#cbd5e1', lineHeight:1.75 }}>{r.ai_risk.xai_narrative}</p>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function RiskPrioritizer({ risks, onXai, onResolve }) {
  const [tier, setTier]         = useState('ALL');
  const [minCvss, setMin]       = useState(0);
  const [q, setQ]               = useState('');
  const [sortBy, setSortBy]     = useState('score');
  const [expanded, setExpanded] = useState(null);

  // Per-row AI explanation state
  const [aiTexts, setAiTexts]     = useState({});
  const [aiLoading, setAiLoading] = useState({});
  const [aiDone, setAiDone]       = useState({});

  const list = useMemo(() => {
    let res = risks.filter(r => {
      if (tier !== 'ALL' && r.ai_risk.threat_tier !== tier) return false;
      if (r.vulnerability.cvss < minCvss) return false;
      if (q) {
        const s = q.toLowerCase();
        return r.vulnerability.cve_id.toLowerCase().includes(s) ||
               r.vulnerability.title.toLowerCase().includes(s) ||
               r.asset.name.toLowerCase().includes(s) ||
               (r.vulnerability.cwe||'').toLowerCase().includes(s);
      }
      return true;
    });
    if (sortBy==='cvss')  res = [...res].sort((a,b)=>b.vulnerability.cvss-a.vulnerability.cvss);
    else if (sortBy==='epss') res = [...res].sort((a,b)=>b.vulnerability.epss-a.vulnerability.epss);
    else res = [...res].sort((a,b)=>b.ai_risk.risk_score-a.ai_risk.risk_score);
    return res;
  }, [risks, tier, minCvss, q, sortBy]);

  const toggle = (id) => setExpanded(prev => prev===id ? null : id);

  /* ─── Stream AI explanation for a single row ─── */
  const streamAIWhy = async (findingId, cveId, assetName, cvss, epss, riskScore, rank) => {
    setAiLoading(prev => ({ ...prev, [findingId]: true }));
    setAiTexts(prev => ({ ...prev, [findingId]: '' }));
    setAiDone(prev => ({ ...prev, [findingId]: false }));
    try {
      const res = await fetch('http://127.0.0.1:8000/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are CyberShield AI. In exactly 2 sharp sentences, explain why ${cveId} on ${assetName} (CVSS ${cvss}, EPSS ${(epss*100).toFixed(1)}%, AI Risk Score ${riskScore}/100) is ranked #${rank} and what the SecOps team must do immediately.`,
          model_id: 'cybershield-neural-v3',
          deep_search_depth: 'fast'
        })
      });
      if (!res.ok || !res.body) throw new Error();
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          if (!part.trim()) continue;
          let evtType = '', dataStr = '';
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) evtType = line.slice(7).trim();
            if (line.startsWith('data: '))  dataStr = line.slice(6).trim();
          }
          if (evtType === 'token' && dataStr) {
            try { const p = JSON.parse(dataStr); setAiTexts(prev => ({ ...prev, [findingId]: (prev[findingId] || '') + p.token })); } catch {}
          }
        }
      }
    } catch {}
    finally {
      setAiLoading(prev => ({ ...prev, [findingId]: false }));
      setAiDone(prev => ({ ...prev, [findingId]: true }));
    }
  };

  const exportCSV = () => {
    const h = ['CVE_ID','Vulnerability_Title','CWE','Asset_Name','IP','Exposure','Criticality','CVSS','EPSS%','Exploit','AI_Risk_Score','Tier','Priority','Finding_ID'];
    const rows = list.map(r => [
      r.vulnerability.cve_id,
      `"${(r.vulnerability.title||'').replace(/"/g,'""')}"`,
      r.vulnerability.cwe,
      r.asset.name, r.asset.ip, r.asset.exposure, r.asset.criticality,
      r.vulnerability.cvss,
      (r.vulnerability.epss*100).toFixed(2),
      r.vulnerability.exploit_available ? 'YES' : 'NO',
      r.ai_risk.risk_score, r.ai_risk.threat_tier, r.ai_risk.priority_code, r.finding_id
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [h.join(','), ...rows.map(e=>e.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv); a.download = `cybershield_risks_${Date.now()}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const summary = { crit: list.filter(r=>r.ai_risk.threat_tier==='CRITICAL').length, exploits: list.filter(r=>r.vulnerability.exploit_available).length };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }} className="anim-fadeup">

      {/* Header + Filter Bar */}
      <div className="card" style={{ padding:'18px 22px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16, flexWrap:'wrap', gap:10 }}>
          <div>
            <p style={{ fontWeight:800, fontSize:'1.02rem', color:'#fff', marginBottom:3 }}>⚡ CyberShield AI — Multi-Factor Risk Prioritization Matrix</p>
            <p style={{ fontSize:'.72rem', color:'#64748b' }}>
              Risk Score = CVSS × W<sub>crit</sub> × (1 + 0.4·EPSS) × W<sub>exp</sub> × Exploit Multiplier &nbsp;|&nbsp; SHAP XAI Attribution
            </p>
          </div>
          <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
            <button
              onClick={() => window.open('http://localhost:8000/api/report/benchmark-accuracy-pdf', '_blank')}
              className="btn btn-sm"
              style={{
                background: 'linear-gradient(135deg, #00D26A, #005A9C)',
                color: '#fff', fontWeight: 800, padding: '6px 12px',
                borderRadius: 8, border: 'none', fontSize: '.72rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 5, boxShadow: '0 0 14px rgba(0,210,106,0.35)'
              }}
            >
              📥 Download Accuracy Audit (PDF)
            </button>
            <div style={{ display:'flex', gap:8 }}>
              <span style={{ ...M, fontSize:'.68rem', color:'#ef4444', background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', padding:'4px 10px', borderRadius:6 }}>
                ● {summary.crit} Critical
              </span>
              <span style={{ ...M, fontSize:'.68rem', color:'#fca5a5', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.15)', padding:'4px 10px', borderRadius:6 }}>
                ⚡ {summary.exploits} Exploits
              </span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📥 Export CSV</button>
            <div style={{ ...M, fontSize:'.68rem', color:'#64748b', background:'rgba(255,255,255,0.03)', padding:'6px 12px', borderRadius:7, border:'1px solid rgba(255,255,255,0.06)', textAlign:'center' }}>
              <span style={{ color:'#fff', fontWeight:700 }}>{list.length}</span> findings
            </div>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
          <div style={{ display:'flex', gap:3, alignItems:'center' }}>
            <span style={{ ...M, fontSize:'.62rem', color:'#475569', marginRight:3 }}>TIER:</span>
            {TIERS.map(t => {
              const active = tier===t; const col = TC[t]||'#00f0ff';
              return (
                <button key={t} onClick={()=>setTier(t)} style={{
                  padding:'4px 10px', borderRadius:6, cursor:'pointer',
                  border: active?`1px solid ${col}55`:'1px solid transparent',
                  background: active?`${col}18`:'rgba(255,255,255,0.03)',
                  color: active?col:'#94a3b8',
                  ...M, fontSize:'.62rem', fontWeight:600, letterSpacing:.5, textTransform:'uppercase'
                }}>{t}</button>
              );
            })}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:7, ...M, fontSize:'.68rem', color:'#64748b' }}>
            <span>Min CVSS:</span>
            <input type="range" min={0} max={10} step={.5} value={minCvss} onChange={e=>setMin(+e.target.value)} style={{ width:80, accentColor:'#00f0ff' }}/>
            <span style={{ color:'#00f0ff', fontWeight:700, minWidth:24 }}>{minCvss}</span>
          </div>
          <select className="inp" style={{ width:145, padding:'6px 10px' }} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
            <option value="score">Sort: AI Risk Score</option>
            <option value="cvss">Sort: CVSS Severity</option>
            <option value="epss">Sort: EPSS Probability</option>
          </select>
          <input className="inp" style={{ width:190, padding:'6px 11px' }} placeholder="🔍 Search CVE / asset / CWE…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width:32 }}></th>
                <th>#</th>
                <th>CVE &amp; Vulnerability</th>
                <th>Affected Asset</th>
                <th>CVSS / EPSS</th>
                <th>AI Risk Score</th>
                <th>Tier &amp; Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => {
                const tier2 = r.ai_risk.threat_tier;
                const tc = TC[tier2];
                const isExp = expanded === r.finding_id;
                const hasAI = aiTexts[r.finding_id] || aiLoading[r.finding_id];

                return (
                  <React.Fragment key={r.finding_id}>
                    <tr className={isExp ? 'expanded' : ''} style={{ borderLeft:`2px solid ${isExp?tc:'transparent'}`, transition:'all .15s' }}>
                      <td style={{ textAlign:'center', paddingRight:0 }}>
                        <button onClick={()=>toggle(r.finding_id)} style={{
                          width:20, height:20, borderRadius:4, border:'1px solid rgba(255,255,255,0.12)',
                          background: isExp?'rgba(0,240,255,0.15)':'rgba(255,255,255,0.04)',
                          color: isExp?'#00f0ff':'#475569', cursor:'pointer', fontSize:'.7rem',
                          display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1
                        }}>{isExp?'▾':'▸'}</button>
                      </td>
                      <td style={{ ...M, color:'#334155', fontWeight:700 }}>#{i+1}</td>
                      <td style={{ minWidth:260 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4, flexWrap:'wrap' }}>
                          <span style={{ ...M, fontSize:'.82rem', color:'#67e8f9', fontWeight:700 }}>{r.vulnerability.cve_id}</span>
                          {r.vulnerability.exploit_available && <span className="tag" style={{ color:'#fca5a5', borderColor:'rgba(239,68,68,.3)' }}>⚡ Exploit PoC</span>}
                        </div>
                        <p style={{ fontSize:'.78rem', color:'#f1f5f9', fontWeight:500, marginBottom:3 }}>{r.vulnerability.title}</p>
                        <p style={{ ...M, fontSize:'.62rem', color:'#475569' }}>{r.vulnerability.cwe}</p>
                      </td>
                      <td style={{ minWidth:160 }}>
                        <p style={{ fontSize:'.78rem', color:'#cbd5e1', fontWeight:500 }}>{r.asset.name}</p>
                        <p style={{ ...M, fontSize:'.64rem', color:'#67e8f9', marginTop:1 }}>{r.asset.ip}</p>
                        <p style={{ ...M, fontSize:'.62rem', color:'#64748b', marginTop:1 }}>{r.asset.exposure} · {r.asset.criticality}</p>
                      </td>
                      <td style={{ ...M }}>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                          <span style={{ color:'#fbbf24', fontWeight:700, fontSize:'.82rem' }}>CVSS {r.vulnerability.cvss}</span>
                        </div>
                        <p style={{ color:'#67e8f9', fontSize:'.7rem', marginTop:3 }}>EPSS {(r.vulnerability.epss*100).toFixed(1)}%</p>
                      </td>
                      <td style={{ minWidth:120 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ ...M, fontSize:'1.6rem', fontWeight:800, color:tc, lineHeight:1 }}>{r.ai_risk.risk_score}</span>
                          <div className="rbar" style={{ width:50 }}>
                            <div className="rbar-fill" style={{ width:`${r.ai_risk.risk_score}%`, background:`linear-gradient(90deg,${tc}70,${tc})` }}/>
                          </div>
                        </div>
                        <p style={{ ...M, fontSize:'.58rem', color:'#475569', marginTop:2 }}>/100 normalized</p>
                      </td>
                      <td>
                        <span className={`badge b-${tier2.toLowerCase()}`}>{tier2}</span>
                        <p style={{ ...M, fontSize:'.61rem', color:'#64748b', marginTop:4 }}>{r.ai_risk.priority_code}</p>
                      </td>
                      <td>
                        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                          {/* 🤖 AI Why? — streams inline below the row */}
                          <button
                            onClick={() => streamAIWhy(r.finding_id, r.vulnerability.cve_id, r.asset.name, r.vulnerability.cvss, r.vulnerability.epss, r.ai_risk.risk_score, i+1)}
                            style={{
                              padding:'5px 12px', borderRadius:7,
                              border: aiLoading[r.finding_id] ? '1.5px solid #00f0ff' : '1px solid rgba(0,240,255,0.4)',
                              background: aiLoading[r.finding_id] ? 'rgba(0,240,255,0.15)' : 'rgba(0,240,255,0.07)',
                              color:'#67e8f9', ...M, fontSize:'.69rem', cursor:'pointer',
                              whiteSpace:'nowrap', fontWeight:800,
                              animation: aiLoading[r.finding_id] ? 'pulse 1s infinite' : 'none',
                              boxShadow: aiLoading[r.finding_id] ? '0 0 10px rgba(0,240,255,0.3)' : 'none'
                            }}
                          >
                            {aiLoading[r.finding_id] ? '⚡ Analyzing…' : '🤖 AI Why?'}
                          </button>

                          <button onClick={()=>onXai(r)} style={{
                            padding:'5px 12px', borderRadius:7, border:'1px solid rgba(139,92,246,0.4)',
                            background:'rgba(139,92,246,0.08)', color:'#c4b5fd',
                            ...M, fontSize:'.69rem', cursor:'pointer', whiteSpace:'nowrap', fontWeight:600
                          }}>🧠 Explain XAI</button>

                          {onResolve && (
                            <button
                              onClick={() => onResolve(r.finding_id, r)}
                              style={{
                                padding: '6px 13px', borderRadius: 7, border: '1.5px solid #10b981',
                                background: 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(5,150,105,0.35))',
                                color: '#34d399', ...M, fontSize: '.71rem', cursor: 'pointer',
                                whiteSpace: 'nowrap', fontWeight: 800,
                                boxShadow: '0 0 12px rgba(16,185,129,0.35)',
                                display: 'flex', alignItems: 'center', gap: 5
                              }}
                            >
                              <span>⚡</span> Auto-Fix &amp; Mitigate
                            </button>
                          )}

                          <button onClick={()=>toggle(r.finding_id)} style={{
                            padding:'5px 12px', borderRadius:7, border:'1px solid rgba(255,255,255,0.1)',
                            background:'rgba(255,255,255,0.04)', color:'#94a3b8',
                            ...M, fontSize:'.69rem', cursor:'pointer', whiteSpace:'nowrap'
                          }}>{isExp?'▲ Collapse':'▼ Details'}</button>
                        </div>
                      </td>
                    </tr>

                    {/* 🤖 AI Why? streaming inline box */}
                    {hasAI && (
                      <AIExplainBox
                        text={aiTexts[r.finding_id] || ''}
                        loading={aiLoading[r.finding_id] || false}
                        done={aiDone[r.finding_id] || false}
                        color={tc}
                      />
                    )}

                    {isExp && <DetailRow r={r} onResolve={onResolve}/>}
                  </React.Fragment>
                );
              })}
              {list.length===0 && (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:44, color:'#475569', ...M, fontSize:'.78rem' }}>
                  No vulnerability findings match the current filters.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
