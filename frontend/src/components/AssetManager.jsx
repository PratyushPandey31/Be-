import React, { useState } from 'react';

const M = { fontFamily:"'JetBrains Mono',monospace" };
const TC = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#f59e0b', LOW:'#10b981' };
const CRITS = ['Mission Critical','High','Medium','Low'];
const ZONES  = ['Internet Facing','DMZ','Internal Subnet','Isolated / Air-Gapped'];
const CC = { 'Mission Critical':'#ef4444', High:'#f97316', Medium:'#f59e0b', Low:'#10b981' };
const ZC = { 'Internet Facing':'#ef4444', DMZ:'#f97316', 'Internal Subnet':'#3b82f6', 'Isolated / Air-Gapped':'#10b981' };
const blank = { name:'', ip_address:'', asset_type:'Server / VM', os_info:'Ubuntu 22.04 LTS', criticality:'High', exposure:'Internal Subnet', owner:'SecOps Team', location:'Primary Datacenter' };

function Field({ label, children }) {
  return (
    <div>
      <label style={{ ...M, fontSize:'.6rem', color:'#64748b', display:'block', marginBottom:5, letterSpacing:.5, textTransform:'uppercase' }}>{label}</label>
      {children}
    </div>
  );
}

/* ─── Asset Detail Modal ─── */
function AssetDetail({ asset, risks, onClose }) {
  const myRisks = risks.filter(r => r.asset.id === asset.id || r.asset.name === asset.name);
  const critColor = CC[asset.criticality] || '#94a3b8';
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', backdropFilter:'blur(10px)', zIndex:110, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="card anim-fadeup" style={{ width:'100%', maxWidth:700, maxHeight:'88vh', overflowY:'auto', padding:0, border:'1px solid rgba(0,240,255,0.2)' }}>
        {/* Header */}
        <div style={{ padding:'22px 26px 18px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6, flexWrap:'wrap' }}>
              <h2 style={{ fontWeight:800, fontSize:'1.08rem', color:'#fff' }}>{asset.name}</h2>
              <span style={{ ...M, fontSize:'.65rem', color:critColor, background:`${critColor}15`, border:`1px solid ${critColor}35`, padding:'3px 10px', borderRadius:6, fontWeight:700 }}>
                {asset.criticality}
              </span>
              <span style={{ ...M, fontSize:'.65rem', color: ZC[asset.exposure]||'#94a3b8', background:`${ZC[asset.exposure]||'#94a3b8'}10`, border:`1px solid ${ZC[asset.exposure]||'#94a3b8'}30`, padding:'3px 10px', borderRadius:6 }}>
                {asset.exposure}
              </span>
            </div>
            <p style={{ ...M, fontSize:'.7rem', color:'#64748b' }}>{asset.asset_type} · {asset.os_info}</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 11px', color:'#94a3b8', cursor:'pointer', fontSize:'1rem' }}>✕</button>
        </div>

        {/* Asset Metadata Grid */}
        <div style={{ padding:'18px 26px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          {[
            ['IP Address',  asset.ip_address, '#67e8f9'],
            ['Asset Type',  asset.asset_type, '#94a3b8'],
            ['OS / Platform', asset.os_info,  '#94a3b8'],
            ['Owner / Team', asset.owner,     '#a78bfa'],
            ['Location / DC', asset.location, '#94a3b8'],
            ['Asset ID',    `#${asset.id}`,   '#475569'],
          ].map(([k,v,col])=>(
            <div key={k} style={{ padding:'10px 13px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.055)', borderRadius:9 }}>
              <p style={{ ...M, fontSize:'.58rem', color:'#475569', letterSpacing:.6, textTransform:'uppercase', marginBottom:4 }}>{k}</p>
              <p style={{ ...M, fontSize:'.75rem', color:col, fontWeight:600 }}>{v}</p>
            </div>
          ))}
        </div>

        {/* Linked Vulnerabilities */}
        <div style={{ padding:'16px 26px 22px' }}>
          <p style={{ ...M, fontSize:'.62rem', color:'#ef4444', fontWeight:700, letterSpacing:.8, textTransform:'uppercase', marginBottom:12 }}>
            ⚠️ Linked Vulnerability Findings ({myRisks.length})
          </p>
          {myRisks.length === 0 ? (
            <div style={{ padding:'20px', textAlign:'center', color:'#475569', ...M, fontSize:'.75rem', background:'rgba(255,255,255,0.02)', borderRadius:8 }}>
              ✓ No active vulnerability findings for this asset.
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {myRisks.map(r => {
                const tc = TC[r.ai_risk.threat_tier];
                return (
                  <div key={r.finding_id} style={{
                    padding:'12px 16px', background:'rgba(255,255,255,0.02)',
                    border:`1px solid rgba(255,255,255,0.06)`, borderLeft:`3px solid ${tc}`,
                    borderRadius:9, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10
                  }}>
                    <div>
                      <div style={{ display:'flex', gap:7, alignItems:'center', marginBottom:4, flexWrap:'wrap' }}>
                        <span style={{ ...M, fontSize:'.78rem', color:'#67e8f9', fontWeight:700 }}>{r.vulnerability.cve_id}</span>
                        <span className={`badge b-${r.ai_risk.threat_tier.toLowerCase()}`}>{r.ai_risk.threat_tier}</span>
                        {r.vulnerability.exploit_available && <span style={{ ...M, fontSize:'.6rem', color:'#fca5a5' }}>⚡ Exploit</span>}
                      </div>
                      <p style={{ fontSize:'.73rem', color:'#cbd5e1' }}>{r.vulnerability.title}</p>
                      <p style={{ ...M, fontSize:'.62rem', color:'#64748b', marginTop:3 }}>{r.vulnerability.cwe}</p>
                    </div>
                    <div style={{ display:'flex', gap:12, alignItems:'center', flexShrink:0 }}>
                      <div style={{ textAlign:'right' }}>
                        <p style={{ ...M, fontSize:'1.4rem', fontWeight:800, color:tc, lineHeight:1 }}>{r.ai_risk.risk_score}</p>
                        <p style={{ ...M, fontSize:'.58rem', color:'#475569' }}>AI RISK</p>
                      </div>
                      <div>
                        <p style={{ ...M, fontSize:'.67rem', color:'#fbbf24' }}>CVSS {r.vulnerability.cvss}</p>
                        <p style={{ ...M, fontSize:'.67rem', color:'#67e8f9', marginTop:2 }}>EPSS {(r.vulnerability.epss*100).toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AssetManager({ assets, onCreate, risks = [] }) {
  const [modal, setModal]     = useState(false);
  const [form, setForm]       = useState(blank);
  const [saving, setSaving]   = useState(false);
  const [ok, setOk]           = useState(false);
  const [detail, setDetail]   = useState(null); // selected asset
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const submit = async (e) => {
    e.preventDefault(); setSaving(true);
    const res = await onCreate(form);
    setSaving(false);
    if (res) { setOk(true); setTimeout(()=>{ setOk(false); setModal(false); setForm(blank); },1200); }
  };

  // count vulnerabilities per asset
  const vulnCount = (a) => risks.filter(r => r.asset.name === a.name).length;
  const riskScore = (a) => {
    const rs = risks.filter(r=>r.asset.name===a.name);
    return rs.length ? Math.max(...rs.map(r=>r.ai_risk.risk_score)) : null;
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }} className="anim-fadeup">

      {/* Header */}
      <div className="card" style={{ padding:'18px 22px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
        <div>
          <p style={{ fontWeight:800, fontSize:'1rem', color:'#fff', marginBottom:3 }}>🖥️ Network Asset Discovery &amp; Criticality Inventory</p>
          <p style={{ fontSize:'.72rem', color:'#64748b' }}>Topology-mapped asset registry · Context provider for AI risk computation · Click any row for details</p>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <button
            onClick={() => window.open('http://localhost:8000/api/report/benchmark-accuracy-pdf', '_blank')}
            className="btn btn-sm"
            style={{
              background: 'linear-gradient(135deg, #00D26A, #005A9C)',
              color: '#fff',
              fontWeight: 800,
              padding: '8px 14px',
              borderRadius: 8,
              border: 'none',
              fontSize: '.72rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 0 14px rgba(0,210,106,0.35)'
            }}
          >
            📥 Download Accuracy Audit (PDF)
          </button>
          <div style={{ display:'flex', gap:6 }}>
            <span style={{ ...M, fontSize:'.68rem', color:'#94a3b8', background:'rgba(255,255,255,0.04)', padding:'6px 12px', borderRadius:7, border:'1px solid rgba(255,255,255,0.07)' }}>
              {assets.length} Assets Registered
            </span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={()=>setModal(true)}>+ Register New Asset</button>
        </div>
      </div>

      {/* Tier Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {CRITS.map(c => {
          const cnt = assets.filter(a=>a.criticality===c).length;
          const col = CC[c];
          return (
            <div key={c} className="card" style={{ padding:'14px 18px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ ...M, fontSize:'.6rem', color:'#64748b', letterSpacing:.8, textTransform:'uppercase', marginBottom:4 }}>{c}</p>
                <p style={{ ...M, fontSize:'1.8rem', fontWeight:800, color:col, lineHeight:1 }}>{cnt}</p>
                <p style={{ fontSize:'.68rem', color:'#64748b', marginTop:3 }}>asset{cnt!==1?'s':''} registered</p>
              </div>
              <div style={{ width:38, height:38, borderRadius:10, background:`${col}12`, border:`1px solid ${col}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>
                {c==='Mission Critical'?'🔴':c==='High'?'🟠':c==='Medium'?'🟡':'🟢'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                {['Asset Name & IP','Type / OS','Criticality','Network Zone','Owner / Location','Active CVEs','Max AI Risk','Actions'].map(h=>(
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map(a => {
                const vc = vulnCount(a);
                const rs = riskScore(a);
                const rsCol = rs!=null?(rs>=80?'#ef4444':rs>=60?'#f97316':rs>=40?'#f59e0b':'#10b981'):'#475569';
                return (
                  <tr key={a.id} style={{ cursor:'pointer' }} onClick={()=>setDetail(a)}>
                    <td>
                      <p style={{ fontWeight:700, color:'#f1f5f9', fontSize:'.83rem' }}>{a.name}</p>
                      <p style={{ ...M, color:'#67e8f9', fontSize:'.72rem', marginTop:2 }}>{a.ip_address}</p>
                    </td>
                    <td>
                      <p style={{ color:'#cbd5e1', fontSize:'.78rem' }}>{a.asset_type}</p>
                      <p style={{ ...M, color:'#64748b', fontSize:'.68rem', marginTop:1 }}>{a.os_info}</p>
                    </td>
                    <td>
                      <span className={`badge b-${a.criticality==='Mission Critical'?'critical':a.criticality.toLowerCase()}`}>{a.criticality}</span>
                    </td>
                    <td style={{ ...M, fontSize:'.72rem', color: ZC[a.exposure]||'#94a3b8', fontWeight:600 }}>{a.exposure}</td>
                    <td>
                      <p style={{ fontSize:'.76rem', color:'#cbd5e1' }}>{a.owner}</p>
                      <p style={{ ...M, fontSize:'.67rem', color:'#64748b', marginTop:1 }}>{a.location}</p>
                    </td>
                    <td style={{ ...M, textAlign:'center' }}>
                      <span style={{ fontSize:'1.2rem', fontWeight:800, color: vc>0?'#f97316':'#10b981' }}>{vc}</span>
                      <p style={{ fontSize:'.62rem', color:'#64748b', marginTop:1 }}>{vc>0?'open':'clean'}</p>
                    </td>
                    <td>
                      {rs!=null ? (
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <span style={{ ...M, fontSize:'1.25rem', fontWeight:800, color:rsCol, lineHeight:1 }}>{rs}</span>
                          <div className="rbar" style={{ width:45 }}>
                            <div className="rbar-fill" style={{ width:`${rs}%`, background:`linear-gradient(90deg,${rsCol}70,${rsCol})` }}/>
                          </div>
                        </div>
                      ) : <span style={{ ...M, fontSize:'.7rem', color:'#334155' }}>—</span>}
                    </td>
                    <td onClick={e=>e.stopPropagation()}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>setDetail(a)}>View →</button>
                    </td>
                  </tr>
                );
              })}
              {assets.length===0 && (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'#475569', ...M, fontSize:'.78rem' }}>
                  No assets registered yet. Click "+ Register New Asset" to begin.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Modal */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', backdropFilter:'blur(10px)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
          <div className="card anim-fadeup" style={{ width:'100%', maxWidth:560, padding:0, border:'1px solid rgba(0,240,255,0.25)' }}>
            <div style={{ padding:'20px 26px 16px', borderBottom:'1px solid rgba(255,255,255,0.07)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ fontWeight:700, fontSize:'.95rem', color:'#fff' }}>🖥️ Register Network Asset</p>
                <p style={{ fontSize:'.7rem', color:'#64748b', marginTop:2 }}>Add asset to topology inventory with criticality &amp; exposure context</p>
              </div>
              <button onClick={()=>setModal(false)} style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'6px 10px', color:'#94a3b8', cursor:'pointer', fontSize:'1rem' }}>✕</button>
            </div>
            <form onSubmit={submit} style={{ padding:'20px 26px', display:'flex', flexDirection:'column', gap:13 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[['Asset Name','name','PROD-WEB-SERVER-01'],['IP Address','ip_address','10.0.1.100']].map(([lbl,key,ph])=>(
                  <Field key={key} label={lbl}>
                    <input required className="inp" placeholder={ph} value={form[key]} onChange={e=>set(key,e.target.value)}/>
                  </Field>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[['Asset Type','asset_type','Web Gateway / API Server'],['OS / Platform','os_info','Ubuntu 22.04 LTS']].map(([lbl,key,ph])=>(
                  <Field key={key} label={lbl}>
                    <input required className="inp" placeholder={ph} value={form[key]} onChange={e=>set(key,e.target.value)}/>
                  </Field>
                ))}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <Field label="Business Criticality">
                  <select className="inp" value={form.criticality} onChange={e=>set('criticality',e.target.value)}>
                    {CRITS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Network Exposure Zone">
                  <select className="inp" value={form.exposure} onChange={e=>set('exposure',e.target.value)}>
                    {ZONES.map(z=><option key={z} value={z}>{z}</option>)}
                  </select>
                </Field>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[['Owner / Team','owner','SecOps Team'],['Location / Datacenter','location','AWS us-east-1']].map(([lbl,key,ph])=>(
                  <Field key={key} label={lbl}>
                    <input required className="inp" placeholder={ph} value={form[key]} onChange={e=>set(key,e.target.value)}/>
                  </Field>
                ))}
              </div>
              <div style={{ marginTop:4, padding:'10px 13px', background:'rgba(0,240,255,0.04)', border:'1px solid rgba(0,240,255,0.12)', borderRadius:8 }}>
                <p style={{ ...M, fontSize:'.65rem', color:'#67e8f9' }}>
                  ℹ️ Criticality &amp; Exposure Zone are used as multipliers in the AI risk scoring engine.
                  "Mission Critical + Internet Facing" = highest risk amplification (×1.5 × ×1.5).
                </p>
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:10, borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
                <button type="submit" className="btn" disabled={saving} style={{
                  background: ok?'#10b981':'linear-gradient(135deg,#06b6d4,#2563eb)',
                  color:'#fff', boxShadow:ok?'0 4px 14px rgba(16,185,129,.3)':'0 4px 14px rgba(6,182,212,.3)'
                }}>
                  {ok ? '✓ Asset Registered!' : saving ? 'Saving…' : '+ Register Asset'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Detail Modal */}
      {detail && <AssetDetail asset={detail} risks={risks} onClose={()=>setDetail(null)}/>}
    </div>
  );
}
