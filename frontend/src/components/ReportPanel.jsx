import React, { useState } from 'react';

const M = { fontFamily:"'JetBrains Mono',monospace" };
const TC = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#f59e0b', LOW:'#10b981' };

export default function ReportPanel({ stats, risks, metrics }) {
  const [gen, setGen] = useState(false);
  if(!stats||!metrics) return <div className="card" style={{ padding:60, textAlign:'center', color:'#64748b' }}>Loading…</div>;

  const ts = new Date().toLocaleString();
  const { CRITICAL, HIGH, MEDIUM, LOW } = stats.threat_distribution;
  const conv = metrics.conventional_cvss_only;
  const cs   = metrics.cybershield_ai_framework;
  const gains = metrics.performance_gains;

  const doPrint = () => { setGen(true); setTimeout(()=>{ window.print(); setGen(false); },400); };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }} className="anim-fadeup">

      {/* Control bar */}
      <div className="card no-print" style={{ padding:'16px 22px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <p style={{ fontWeight:700, fontSize:'.95rem', color:'#fff' }}>▤ Executive Vulnerability Assessment Report</p>
          <p style={{ fontSize:'.7rem', color:'#64748b', marginTop:3 }}>IEEE Publication-Grade Report Generator — CyberShield AI Framework</p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <button
            onClick={() => window.open('http://localhost:8000/api/report/benchmark-accuracy-pdf', '_blank')}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #00D26A, #005A9C)',
              color: '#fff',
              fontWeight: 800,
              border: 'none',
              boxShadow: '0 0 12px rgba(0,210,106,0.35)',
              cursor: 'pointer'
            }}
          >
            📥 Download Nessus &amp; OpenVAS Accuracy Audit (PDF)
          </button>
          <button className="btn btn-primary" onClick={doPrint} disabled={gen}>
            {gen?'Generating…':'🖨️ Export / Print Report'}
          </button>
        </div>
      </div>

      {/* ══ REPORT DOCUMENT ══ */}
      <div className="card" style={{ padding:'40px 50px', maxWidth:920, margin:'0 auto', width:'100%' }}>

        {/* Cover */}
        <div style={{ textAlign:'center', paddingBottom:28, marginBottom:28, borderBottom:'2px solid rgba(0,229,255,0.15)' }}>
          <div style={{ fontSize:'2.5rem', marginBottom:14 }}>🛡️</div>
          <h1 style={{ fontSize:'1.3rem', fontWeight:800, color:'#fff', lineHeight:1.35, marginBottom:10 }}>
            CyberShield AI<br/>
            <span style={{ color:'#67e8f9' }}>Intelligent Vulnerability Assessment &amp; Risk Prioritization Report</span>
          </h1>
          <p style={{ fontSize:'.78rem', color:'#64748b', marginBottom:14 }}>
            An Intelligent Vulnerability Assessment and Risk Prioritization Framework Using Artificial Intelligence
          </p>
          <div style={{ display:'flex', justifyContent:'center', gap:24, flexWrap:'wrap' }}>
            {[['Generated',ts],['Classification','CONFIDENTIAL'],['Framework','CyberShield AI v1.0'],['Standard','IEEE Publication Grade']].map(([k,v])=>(
              <div key={k} style={{ ...M, fontSize:'.66rem', textAlign:'center' }}>
                <p style={{ color:'#475569', letterSpacing:.6, textTransform:'uppercase', marginBottom:2 }}>{k}</p>
                <p style={{ color:'#94a3b8', fontWeight:600 }}>{v}</p>
              </div>
            ))}
          </div>
        </div>

        {/* §1 Executive Summary */}
        <section style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:'.95rem', fontWeight:700, color:'#00e5ff', borderBottom:'1px solid rgba(0,229,255,0.2)', paddingBottom:8, marginBottom:14 }}>1. Executive Summary</h2>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
            {[['Total Assets',stats.total_assets,'#3b82f6'],['Open Findings',stats.active_vulnerabilities,'#f97316'],['System Risk',`${stats.average_system_risk}/100`,stats.average_system_risk>=70?'#ef4444':'#f59e0b'],['Critical Threats',CRITICAL,'#ef4444']].map(([lbl,val,col])=>(
              <div key={lbl} style={{ padding:'12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:8, textAlign:'center' }}>
                <p style={{ ...M, fontSize:'1.55rem', fontWeight:800, color:col, lineHeight:1 }}>{val}</p>
                <p style={{ fontSize:'.66rem', color:'#64748b', marginTop:4 }}>{lbl}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize:'.82rem', color:'#cbd5e1', lineHeight:1.8 }}>
            The CyberShield AI framework conducted an automated vulnerability assessment across the monitored network infrastructure.
            The AI-powered multi-factor risk engine identified <strong style={{ color:'#fbbf24' }}>{stats.active_vulnerabilities}</strong> active security findings across{' '}
            <strong style={{ color:'#fbbf24' }}>{stats.total_assets}</strong> registered assets, computing an aggregate system risk index of{' '}
            <strong style={{ color:stats.average_system_risk>=70?'#ef4444':'#f59e0b' }}>{stats.average_system_risk}/100</strong>. Distribution:&nbsp;
            <strong style={{ color:'#ef4444' }}>{CRITICAL} CRITICAL</strong>, <strong style={{ color:'#f97316' }}>{HIGH} HIGH</strong>,{' '}
            <strong style={{ color:'#f59e0b' }}>{MEDIUM} MEDIUM</strong>, <strong style={{ color:'#10b981' }}>{LOW} LOW</strong>.
          </p>
        </section>

        {/* §2 Methodology */}
        <section style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:'.95rem', fontWeight:700, color:'#00e5ff', borderBottom:'1px solid rgba(0,229,255,0.2)', paddingBottom:8, marginBottom:14 }}>2. Methodology &amp; AI Risk Model</h2>
          <div style={{ padding:'14px 18px', background:'rgba(0,229,255,0.04)', border:'1px solid rgba(0,229,255,0.12)', borderRadius:10, marginBottom:12 }}>
            <p style={{ ...M, fontSize:'.8rem', color:'#67e8f9', fontWeight:700, marginBottom:8 }}>CyberShield AI Risk Scoring Formula:</p>
            <pre style={{ ...M, fontSize:'.76rem', color:'#e2e8f0', overflowX:'auto', lineHeight:1.9, whiteSpace:'pre-wrap' }}>{
`Risk Score = CVSS_Base × W_criticality × (1 + α × EPSS) × W_exposure × Exploit_Multiplier
─────────────────────────────────────────────────────────────────────────────
  α            = 0.4  (EPSS amplification coefficient)
  W_criticality ∈ {1.50, 1.25, 1.00, 0.75}  (Mission Critical → Low)
  W_exposure    ∈ {1.50, 1.25, 1.00, 0.50}  (Internet Facing → Air-Gapped)
  Exploit_Mult  = 1.30 if CVE weaponized, else 1.00
  Output        : Normalized to [0, 100]`}</pre>
          </div>
          <p style={{ fontSize:'.82rem', color:'#cbd5e1', lineHeight:1.8 }}>
            Vulnerability data collected via <strong style={{ color:'#67e8f9' }}>Nmap 7.94</strong> (SYN stealth discovery),{' '}
            <strong style={{ color:'#67e8f9' }}>OpenVAS GVM</strong> (authenticated scanning, 87K+ NVTs), and the{' '}
            <strong style={{ color:'#67e8f9' }}>NIST NVD/CVE API</strong>. EPSS probabilities sourced from FIRST.org.{' '}
            Explainable AI (XAI) attributions follow SHAP-style additive feature decomposition for transparent, auditable reasoning.
          </p>
        </section>

        {/* §3 Prioritized Findings */}
        <section style={{ marginBottom:28 }}>
          <h2 style={{ fontSize:'.95rem', fontWeight:700, color:'#00e5ff', borderBottom:'1px solid rgba(0,229,255,0.2)', paddingBottom:8, marginBottom:14 }}>3. Prioritized Vulnerability Findings</h2>
          <div style={{ overflowX:'auto' }}>
            <table className="tbl">
              <thead>
                <tr>{['#','CVE ID','Vulnerability','Asset','CVSS','EPSS','AI Score','Tier'].map(h=><th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {risks.map((r,i)=>{
                  const tier=r.ai_risk.threat_tier; const tc=TC[tier];
                  return (
                    <tr key={r.finding_id}>
                      <td style={{ ...M, color:'#64748b' }}>{i+1}</td>
                      <td style={{ ...M, color:'#67e8f9', fontWeight:700 }}>{r.vulnerability.cve_id}</td>
                      <td style={{ maxWidth:180, color:'#cbd5e1', fontSize:'.77rem' }}>{r.vulnerability.title}</td>
                      <td style={{ ...M, fontSize:'.68rem', color:'#94a3b8' }}>{r.asset.name}</td>
                      <td style={{ ...M, color:'#fbbf24', fontWeight:700 }}>{r.vulnerability.cvss}</td>
                      <td style={{ ...M, color:'#67e8f9' }}>{(r.vulnerability.epss*100).toFixed(1)}%</td>
                      <td style={{ ...M, color:tc, fontWeight:800, fontSize:'1.05rem' }}>{r.ai_risk.risk_score}</td>
                      <td><span className={`badge b-${tier.toLowerCase()}`}>{tier}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* §4 IEEE Benchmarks */}
        <section style={{ marginBottom:14 }}>
          <h2 style={{ fontSize:'.95rem', fontWeight:700, color:'#00e5ff', borderBottom:'1px solid rgba(0,229,255,0.2)', paddingBottom:8, marginBottom:14 }}>4. IEEE Performance Benchmarking Results</h2>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:12 }}>
            {[['Conventional CVSS-Only',conv,'#ef4444'],['CyberShield AI Framework',cs,'#10b981']].map(([lbl,data,col])=>(
              <div key={lbl} style={{ padding:'14px 16px', background:`${col}06`, border:`1px solid ${col}20`, borderRadius:10 }}>
                <p style={{ ...M, fontSize:'.73rem', fontWeight:700, color:col, marginBottom:10 }}>{lbl}</p>
                {Object.entries(data).filter(([k])=>k!=='description').map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', ...M, fontSize:'.67rem', marginBottom:4 }}>
                    <span style={{ color:'#94a3b8' }}>{k.replace(/_/g,' ')}</span>
                    <span style={{ color:col, fontWeight:700 }}>{typeof v==='number'&&v<2?(v*100).toFixed(1)+'%':v}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, padding:'12px 16px', background:'rgba(139,92,246,0.06)', border:'1px solid rgba(139,92,246,0.2)', borderRadius:10, ...M, fontSize:'.7rem' }}>
            {Object.entries(gains).map(([k,v])=>(
              <div key={k}>
                <p style={{ color:'#64748b', marginBottom:2 }}>{k.replace(/_/g,' ')}</p>
                <p style={{ color:'#c4b5fd', fontWeight:700 }}>{v}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <div style={{ paddingTop:20, marginTop:10, borderTop:'1px solid rgba(255,255,255,0.06)', textAlign:'center', ...M, fontSize:'.62rem', color:'#475569' }}>
          CyberShield AI — IEEE Research Publication Platform · Generated: {ts} · CONFIDENTIAL
        </div>
      </div>
    </div>
  );
}
