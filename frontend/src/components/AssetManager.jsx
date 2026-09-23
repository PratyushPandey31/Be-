import React, { useState, useMemo } from 'react';

/* ─── AI Badge Helper (outside component) ─── */
function getAssetAIBadge(asset, risks) {
  const myRisks = risks.filter(r => r.asset.id === asset.id || r.asset.name === asset.name);
  if (myRisks.length === 0) {
    return { text: '✅ ROBO AI: No active vulnerabilities detected. Asset posture: Secure.', color: '#34d399' };
  }
  const topScore = Math.max(...myRisks.map(r => r.ai_risk.risk_score));
  const topCVE = myRisks.find(r => r.ai_risk.risk_score === topScore)?.vulnerability?.cve_id;
  const critCount = myRisks.filter(r => r.ai_risk.threat_tier === 'CRITICAL').length;
  if (topScore > 80) {
    return { text: '🚨 ROBO AI: ' + critCount + ' critical CVEs including ' + topCVE + ' (Risk: ' + topScore + '/100). Mission-critical exposure — immediate isolation and patching required.', color: '#f87171' };
  } else if (topScore > 50) {
    return { text: '⚠️ ROBO AI: ' + myRisks.length + ' active findings including ' + topCVE + ' (Risk: ' + topScore + '/100). High-priority patching within 24h recommended.', color: '#fbbf24' };
  } else {
    return { text: '🔵 ROBO AI: ' + myRisks.length + ' managed findings. Highest risk ' + topScore + '/100. Schedule patch in next maintenance window.', color: '#67e8f9' };
  }
}

const M = { fontFamily: "'JetBrains Mono',monospace" };
const TC = { CRITICAL: '#ef4444', HIGH: '#f97316', MEDIUM: '#f59e0b', LOW: '#10b981' };
const CRITS = ['Mission Critical', 'High', 'Medium', 'Low'];
const ZONES = ['Internet Facing', 'DMZ', 'Internal Subnet', 'Isolated / Air-Gapped'];
const SCOPES = ['ALL', 'PAN', 'LAN', 'MAN', 'WAN'];
const CC = { 'Mission Critical': '#ef4444', High: '#f97316', Medium: '#f59e0b', Low: '#10b981' };
const ZC = { 'Internet Facing': '#ef4444', DMZ: '#f97316', 'Internal Subnet': '#3b82f6', 'Isolated / Air-Gapped': '#10b981' };
const SCOPE_COLORS = { PAN: '#a855f7', LAN: '#3b82f6', MAN: '#06b6d4', WAN: '#ef4444' };

const blank = {
  name: '',
  ip_address: '',
  asset_type: 'Server / VM',
  os_info: 'Ubuntu 22.04 LTS',
  criticality: 'High',
  exposure: 'Internal Subnet',
  network_scope: 'LAN',
  owner: 'SecOps Team',
  location: 'Primary Datacenter'
};

function Field({ label, children }) {
  return (
    <div>
      <label style={{ ...M, fontSize: '.6rem', color: '#64748b', display: 'block', marginBottom: 5, letterSpacing: .5, textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  );
}

/* ─── Asset Detail Modal ─── */
function AssetDetail({ asset, risks, onClose }) {
  const myRisks = risks.filter(r => r.asset.id === asset.id || r.asset.name === asset.name);
  const critColor = CC[asset.criticality] || '#94a3b8';
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(14px)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card anim-fadeup" style={{ width: '100%', maxWidth: 740, maxHeight: '88vh', overflowY: 'auto', padding: 0, border: '1px solid rgba(0,240,255,0.3)', boxShadow: '0 20px 60px rgba(0,0,0,0.9)' }}>
        {/* Header */}
        <div style={{ padding: '22px 26px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
              <h2 style={{ fontWeight: 800, fontSize: '1.15rem', color: '#fff', margin: 0 }}>{asset.name}</h2>
              <span style={{ ...M, fontSize: '.65rem', color: critColor, background: `${critColor}15`, border: `1px solid ${critColor}35`, padding: '3px 10px', borderRadius: 6, fontWeight: 700 }}>
                {asset.criticality}
              </span>
              <span style={{ ...M, fontSize: '.65rem', color: ZC[asset.exposure] || '#94a3b8', background: `${ZC[asset.exposure] || '#94a3b8'}10`, border: `1px solid ${ZC[asset.exposure] || '#94a3b8'}30`, padding: '3px 10px', borderRadius: 6 }}>
                {asset.exposure}
              </span>
            </div>
            <p style={{ ...M, fontSize: '.72rem', color: '#64748b', margin: 0 }}>{asset.asset_type} &bull; {asset.os_info}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 11px', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
        </div>

        {/* Asset Metadata Grid */}
        <div style={{ padding: '18px 26px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            ['IP Address', asset.ip_address, '#67e8f9'],
            ['Asset Type', asset.asset_type, '#94a3b8'],
            ['OS / Platform', asset.os_info, '#94a3b8'],
            ['Owner / Team', asset.owner, '#a78bfa'],
            ['Location / DC', asset.location, '#94a3b8'],
            ['Asset ID', `#${asset.id}`, '#475569'],
          ].map(([k, v, col]) => (
            <div key={k} style={{ padding: '10px 13px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 9 }}>
              <p style={{ ...M, fontSize: '.58rem', color: '#475569', letterSpacing: .6, textTransform: 'uppercase', marginBottom: 4 }}>{k}</p>
              <p style={{ ...M, fontSize: '.75rem', color: col, fontWeight: 600, margin: 0 }}>{v}</p>
            </div>
          ))}
        </div>

        {/* Linked Vulnerabilities */}
        <div style={{ padding: '16px 26px 22px' }}>
          <p style={{ ...M, fontSize: '.62rem', color: '#ef4444', fontWeight: 700, letterSpacing: .8, textTransform: 'uppercase', marginBottom: 12 }}>
            ⚠️ Linked Vulnerability Findings ({myRisks.length})
          </p>
          {myRisks.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#34d399', ...M, fontSize: '.75rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }}>
              ✓ No active vulnerability findings for this asset. Operating in verified secure state.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myRisks.map(r => {
                const tc = TC[r.ai_risk.threat_tier];
                return (
                  <div key={r.finding_id} style={{
                    padding: '12px 16px', background: 'rgba(255,255,255,0.02)',
                    border: `1px solid rgba(255,255,255,0.06)`, borderLeft: `3px solid ${tc}`,
                    borderRadius: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10
                  }}>
                    <div>
                      <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ ...M, fontSize: '.78rem', color: '#67e8f9', fontWeight: 700 }}>{r.vulnerability.cve_id}</span>
                        <span className={`badge b-${r.ai_risk.threat_tier.toLowerCase()}`}>{r.ai_risk.threat_tier}</span>
                        {r.vulnerability.exploit_available && <span style={{ ...M, fontSize: '.6rem', color: '#fca5a5' }}>⚡ Exploit</span>}
                      </div>
                      <p style={{ fontSize: '.73rem', color: '#cbd5e1', margin: 0 }}>{r.vulnerability.title}</p>
                      <p style={{ ...M, fontSize: '.62rem', color: '#64748b', marginTop: 3 }}>{r.vulnerability.cwe}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ ...M, fontSize: '1.4rem', fontWeight: 800, color: tc, lineHeight: 1, margin: 0 }}>{r.ai_risk.risk_score}</p>
                        <p style={{ ...M, fontSize: '.58rem', color: '#475569', margin: '2px 0 0' }}>AI RISK</p>
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

export default function AssetManager({ assets = [], onCreate, risks = [] }) {
  const [showAdd, setShowAdd]     = useState(false);
  const [sel, setSel]             = useState(null);
  const [filterCrit, setFC]       = useState('ALL');
  const [filterZone, setFZ]       = useState('ALL');
  const [filterScope, setScope]   = useState('ALL');
  const [search, setSearch]       = useState('');
  const [form, setForm]           = useState(blank);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState('');
  const [assetAITexts, setAssetAITexts]   = useState({});
  const [assetAILoading, setAssetAILoading] = useState({});
  const [quarantinedAssets, setQuarantinedAssets] = useState([]);
  const [selectedTopologyNode, setSelectedTopologyNode] = useState(null);

  const toggleQuarantine = (assetId, e) => {
    e?.stopPropagation();
    setQuarantinedAssets(prev =>
      prev.includes(assetId) ? prev.filter(id => id !== assetId) : [...prev, assetId]
    );
  };

  const streamAssetAI = async (asset, risks) => {
    const key = asset.id || asset.name;
    setAssetAILoading(prev => ({ ...prev, [key]: true }));
    setAssetAITexts(prev => ({ ...prev, [key]: '' }));
    try {
      const res = await fetch('http://127.0.0.1:8000/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `You are an AI Security Architect. Provide a 2-sentence rapid risk assessment for asset '${asset.name}' (${asset.ip_address}, ${asset.asset_type}, Criticality: ${asset.criticality}, Zone: ${asset.exposure}). What is the single highest-priority defensive action?`,
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
            if (line.startsWith('data: ')) dataStr = line.slice(6).trim();
          }
          if (evtType === 'token' && dataStr) {
            try {
              const p = JSON.parse(dataStr);
              setAssetAITexts(prev => ({ ...prev, [key]: (prev[key] || '') + p.token }));
            } catch {}
          }
        }
      }
    } catch(e) { console.error(e); }
    finally { setAssetAILoading(prev => ({ ...prev, [key]: false })); }
  };

  const enrichedAssets = useMemo(() => {
    return (assets || []).map(a => {
      if (a.network_scope) return { ...a, computed_scope: a.network_scope };
      let scope = 'LAN';
      const ip = a.ip_address || '';
      const nm = (a.name || '').toUpperCase();
      if (ip.startsWith('10.0.1.') || ip.startsWith('10.0.4.') || ip.startsWith('192.168.1.') || nm.includes('CITRIX') || nm.includes('WEB') || nm.includes('CONFLUENCE')) {
        scope = 'WAN';
      } else if (ip.startsWith('172.16.80.') || nm.includes('SCADA') || nm.includes('PLC') || nm.includes('CAMPUS')) {
        scope = 'MAN';
      } else if (ip.startsWith('192.168.99.') || ip.startsWith('192.168.20.') || nm.includes('RUNNER') || nm.includes('WORKSTATION') || nm.includes('PAN')) {
        scope = 'PAN';
      }
      return { ...a, computed_scope: scope };
    });
  }, [assets]);

  const filtered = useMemo(() => {
    return enrichedAssets.filter(a => {
      if (filterCrit !== 'ALL' && a.criticality !== filterCrit) return false;
      if (filterZone !== 'ALL' && a.exposure !== filterZone) return false;
      if (filterScope !== 'ALL' && a.computed_scope !== filterScope) return false;
      if (search) {
        const q = search.toLowerCase();
        return a.name.toLowerCase().includes(q) || a.ip_address.toLowerCase().includes(q) || a.asset_type.toLowerCase().includes(q) || a.owner.toLowerCase().includes(q);
      }
      return true;
    });
  }, [enrichedAssets, filterCrit, filterZone, filterScope, search]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.ip_address) { setErr('Name and IP address are required.'); return; }
    setSaving(true); setErr('');
    const ok = await onCreate?.(form);
    setSaving(false);
    if (ok) { setForm(blank); setShowAdd(false); }
    else setErr('Failed to register asset. Please check fields.');
  };

  const TOPOLOGY_NODES = useMemo(() => {
    return enrichedAssets.map((a, i) => {
      const isQuarantined = quarantinedAssets.includes(a.id);
      const riskCount = risks.filter(r => r.asset.id === a.id || r.asset.name === a.name).length;
      let x = 80 + (i % 5) * 135;
      let y = i < 5 ? 70 : 160;
      return { ...a, x, y, isQuarantined, riskCount, color: isQuarantined ? '#f59e0b' : CC[a.criticality] || '#3b82f6' };
    });
  }, [enrichedAssets, quarantinedAssets, risks]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div className="card" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(6, 12, 28, 0.95), rgba(15, 23, 42, 0.95))', border: '1.5px solid rgba(0, 240, 255, 0.25)', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: '1.3rem' }}>🌐</span>
              <h3 style={{ fontSize: '1.08rem', fontWeight: 900, color: '#fff', margin: 0 }}>Holographic Enterprise Asset Topology &amp; Zero-Trust Mesh</h3>
              <span style={{ ...M, fontSize: '.6rem', color: '#34d399', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>● 100% INVENTORY TELEMETRY</span>
            </div>
            <p style={{ fontSize: '.74rem', color: '#94a3b8', margin: 0 }}>Interactive live topology linking personal workstations (PAN), local domain clusters (LAN), campus links (MAN), and WAN edge gateways.</p>
          </div>
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
            {SCOPES.map(sc => (
              <button key={sc} onClick={() => setScope(sc)} style={{ background: filterScope === sc ? 'rgba(0,240,255,0.2)' : 'transparent', border: filterScope === sc ? '1px solid #00f0ff' : 'none', color: filterScope === sc ? '#67e8f9' : '#94a3b8', ...M, fontSize: '.7rem', padding: '5px 12px', borderRadius: 6, cursor: 'pointer', fontWeight: filterScope === sc ? 800 : 400 }}>{sc}</button>
            ))}
          </div>
        </div>

        <div style={{ background: 'radial-gradient(circle at center, rgba(15,23,42,0.9), rgba(2,6,20,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 12, position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 30px rgba(0,240,255,0.06)' }}>
          <svg viewBox="0 0 740 230" style={{ width: '100%', height: 'auto', display: 'block' }}>
            <defs>
              <linearGradient id="topoLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(0,240,255,0.4)" />
                <stop offset="50%" stopColor="rgba(139,92,246,0.3)" />
                <stop offset="100%" stopColor="rgba(16,185,129,0.4)" />
              </linearGradient>
            </defs>
            {TOPOLOGY_NODES.map((n, idx) => {
              if (idx >= TOPOLOGY_NODES.length - 1) return null;
              const next = TOPOLOGY_NODES[idx + 1];
              return <line key={`line-${idx}`} x1={n.x} y1={n.y} x2={next.x} y2={next.y} stroke="url(#topoLineGrad)" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />;
            })}
            <line x1="215" y1="70" x2="350" y2="160" stroke="rgba(0,240,255,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
            <line x1="485" y1="70" x2="350" y2="160" stroke="rgba(139,92,246,0.25)" strokeWidth="1.5" strokeDasharray="4 4" />
            {TOPOLOGY_NODES.map(n => {
              const isSelected = selectedTopologyNode?.id === n.id;
              return (
                <g key={n.id} onClick={() => { setSelectedTopologyNode(n); setSel(n); }} style={{ cursor: 'pointer' }}>
                  {n.riskCount > 0 && !n.isQuarantined && (
                    <circle cx={n.x} cy={n.y} r="22" fill="none" stroke={n.color} strokeWidth="1" opacity="0.6">
                      <animate attributeName="r" values="16;28;16" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0.05;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  <circle cx={n.x} cy={n.y} r={isSelected ? "18" : "14"} fill="rgba(15,23,42,0.9)" stroke={n.color} strokeWidth={isSelected ? "3" : "2"} />
                  <circle cx={n.x} cy={n.y} r="6" fill={n.color} />
                  <text x={n.x} y={n.y + 24} textAnchor="middle" fill={isSelected ? "#00f0ff" : "#f1f5f9"} fontSize="8.5" fontWeight="800" fontFamily="'JetBrains Mono',monospace">{n.isQuarantined ? '🔒 ' + n.name : n.name}</text>
                  <text x={n.x} y={n.y + 35} textAnchor="middle" fill="#64748b" fontSize="7.5" fontFamily="'JetBrains Mono',monospace">{n.ip_address}</text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ ...M, fontSize: '.72rem', color: '#67e8f9', fontWeight: 700 }}>{filtered.length} / {assets.length} Assets Active</span>
          {quarantinedAssets.length > 0 && (
            <span style={{ ...M, fontSize: '.65rem', color: '#f59e0b', background: 'rgba(245,158,11,0.15)', border: '1px solid #f59e0b', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>🔒 {quarantinedAssets.length} Quarantined</span>
          )}
          <select className="inp" style={{ width: 140, padding: '5px 8px' }} value={filterCrit} onChange={e => setFC(e.target.value)}>
            <option value="ALL">All Criticalities</option>
            {CRITS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="inp" style={{ width: 160, padding: '5px 8px' }} value={filterZone} onChange={e => setFZ(e.target.value)}>
            <option value="ALL">All Exposure Zones</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <input className="inp" style={{ width: 190, padding: '5px 10px' }} placeholder="🔍 Search name, IP, OS…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Register New Asset</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {filtered.map(a => {
          const critColor = CC[a.criticality] || '#94a3b8';
          const zoneColor = ZC[a.exposure] || '#94a3b8';
          const scopeColor = SCOPE_COLORS[a.computed_scope] || '#3b82f6';
          const count = risks.filter(r => r.asset.id === a.id || r.asset.name === a.name).length;
          const badge = getAssetAIBadge(a, risks);
          const aiKey = a.id || a.name;

          return (
            <div
              key={a.id}
              className="card"
              style={{
                padding: '16px 18px',
                borderLeft: `3px solid ${critColor}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 12
              }}
              onClick={() => setSel(a)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                      <span style={{ ...M, fontSize: '.6rem', background: `${scopeColor}20`, border: `1px solid ${scopeColor}`, color: scopeColor, padding: '1px 6px', borderRadius: 4, fontWeight: 800 }}>
                        {a.computed_scope}
                      </span>
                      <span style={{ ...M, fontSize: '.62rem', color: '#64748b' }}>#{a.id}</span>
                    </div>
                    <h4 style={{ fontWeight: 800, fontSize: '.92rem', color: '#fff', margin: 0 }}>{a.name}</h4>
                  </div>
                  <span style={{ ...M, fontSize: '.65rem', color: critColor, background: `${critColor}15`, border: `1px solid ${critColor}35`, padding: '2px 8px', borderRadius: 5, fontWeight: 700 }}>
                    {a.criticality}
                  </span>
                </div>

                <p style={{ ...M, fontSize: '.78rem', color: '#67e8f9', margin: '0 0 4px' }}>{a.ip_address}</p>
                <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: '0 0 8px' }}>{a.asset_type} &bull; {a.os_info}</p>

                {/* AI Risk Advisory Badge */}
                <div style={{ marginBottom: 8 }} onClick={e => e.stopPropagation()}>
                  <div style={{ background: badge.color === '#f87171' ? 'rgba(239,68,68,0.08)' : badge.color === '#fbbf24' ? 'rgba(245,158,11,0.08)' : 'rgba(0,240,255,0.06)', border: `1px solid ${badge.color}35`, borderRadius: 7, padding: '7px 10px', marginBottom: 6 }}>
                    <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize: '.64rem', color: badge.color, lineHeight: 1.5, margin: 0 }}>{badge.text}</p>
                  </div>
                  {(assetAITexts[aiKey] || assetAILoading[aiKey]) ? (
                    <div style={{ background:'rgba(0,240,255,0.04)', border:'1px solid rgba(0,240,255,0.2)', borderRadius:7, padding:'8px 10px', marginBottom:4 }}>
                      <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.64rem', color:'#a5f3fc', lineHeight:1.5, margin:0 }}>
                        {assetAITexts[aiKey]}
                        {assetAILoading[aiKey] && <span style={{ display:'inline-block', width:5, height:11, background:'#00f0ff', marginLeft:3, verticalAlign:'middle', animation:'pulse .6s infinite' }} />}
                      </p>
                    </div>
                  ) : null}
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <button onClick={() => streamAssetAI(a, risks)} disabled={assetAILoading[aiKey]} style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.62rem', color:'#67e8f9', background:'rgba(0,240,255,0.07)', border:'1px solid rgba(0,240,255,0.25)', borderRadius:6, padding:'4px 10px', cursor:'pointer', fontWeight:700 }}>
                      {assetAILoading[aiKey] ? '⚡ ROBO AI Analyzing…' : '🤖 AI Audit'}
                    </button>
                    <button
                      onClick={(e) => toggleQuarantine(a.id, e)}
                      style={{
                        flex: 1,
                        background: quarantinedAssets.includes(a.id)
                          ? 'rgba(239,68,68,0.2)'
                          : 'rgba(255,255,255,0.04)',
                        border: quarantinedAssets.includes(a.id)
                          ? '1px solid #ef4444'
                          : '1px solid rgba(255,255,255,0.1)',
                        color: quarantinedAssets.includes(a.id) ? '#f87171' : '#cbd5e1',
                        padding: '4px 8px', borderRadius: 6, cursor: 'pointer', ...M, fontSize: '.62rem', fontWeight: 700
                      }}
                    >
                      {quarantinedAssets.includes(a.id) ? '🚨 ISOLATED' : '🔒 Quarantine'}
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10 }}>
                <span style={{ ...M, fontSize: '.65rem', color: zoneColor }}>
                  {a.exposure}
                </span>
                <span style={{ ...M, fontSize: '.68rem', color: count > 0 ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                  {count > 0 ? `⚠️ ${count} CVEs` : '✓ 0 CVEs'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Asset Modal */}
      {sel && <AssetDetail asset={sel} risks={risks} onClose={() => setSel(null)} />}

      {/* Add Asset Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card anim-fadeup" style={{ width: '100%', maxWidth: 540, padding: '24px 28px', border: '1.5px solid rgba(0,240,255,0.35)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>+ Register New Network Asset</h3>
              <button onClick={() => setShowAdd(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.1rem', cursor: 'pointer' }}>✕</button>
            </div>

            {err && <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 7, color: '#fca5a5', fontSize: '.74rem', ...M, marginBottom: 12 }}>⚠️ {err}</div>}

            <form onSubmit={save} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Asset Hostname / Tag">
                  <input className="inp" placeholder="e.g. PROD-API-GATEWAY-02" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </Field>
                <Field label="IP Address">
                  <input className="inp" placeholder="e.g. 10.0.1.75" value={form.ip_address} onChange={e => setForm({ ...form, ip_address: e.target.value })} required />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Asset Type">
                  <input className="inp" placeholder="e.g. Nginx Gateway / Node.js" value={form.asset_type} onChange={e => setForm({ ...form, asset_type: e.target.value })} />
                </Field>
                <Field label="Operating System">
                  <input className="inp" placeholder="e.g. Ubuntu 22.04 LTS" value={form.os_info} onChange={e => setForm({ ...form, os_info: e.target.value })} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Field label="Mission Criticality">
                  <select className="inp" value={form.criticality} onChange={e => setForm({ ...form, criticality: e.target.value })}>
                    {CRITS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Perimeter Exposure">
                  <select className="inp" value={form.exposure} onChange={e => setForm({ ...form, exposure: e.target.value })}>
                    {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {saving ? 'Registering…' : '✓ Save &amp; Enforce Zero-Trust'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
