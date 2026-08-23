import React, { useState, useMemo } from 'react';

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

export default function AssetManager({ assets, onCreate, risks = [] }) {
  const [showAdd, setShowAdd]     = useState(false);
  const [sel, setSel]             = useState(null);
  const [filterCrit, setFC]       = useState('ALL');
  const [filterZone, setFZ]       = useState('ALL');
  const [filterScope, setScope]   = useState('ALL'); // ALL | PAN | LAN | MAN | WAN
  const [search, setSearch]       = useState('');
  const [form, setForm]           = useState(blank);
  const [saving, setSaving]       = useState(false);
  const [err, setErr]             = useState('');

  // Auto-tag network scopes based on IP and naming
  const enrichedAssets = useMemo(() => {
    return assets.map(a => {
      let scope = 'LAN';
      const ip = a.ip_address || '';
      const nm = (a.name || '').toUpperCase();
      if (ip.startsWith('10.0.1.') || ip.startsWith('10.0.4.') || ip.startsWith('192.168.1.') || nm.includes('CITRIX') || nm.includes('WEB') || nm.includes('CONFLUENCE')) {
        scope = 'WAN';
      } else if (ip.startsWith('172.16.80.') || nm.includes('SCADA') || nm.includes('PLC') || nm.includes('CAMPUS')) {
        scope = 'MAN';
      } else if (ip.startsWith('192.168.99.') || ip.startsWith('192.168.20.') || nm.includes('RUNNER') || nm.includes('WORKSTATION') || nm.includes('PAN')) {
        scope = 'PAN';
      } else {
        scope = 'LAN';
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
        return a.name.toLowerCase().includes(q) ||
               a.ip_address.toLowerCase().includes(q) ||
               a.asset_type.toLowerCase().includes(q) ||
               a.owner.toLowerCase().includes(q);
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Network Infrastructure Topology Card (PAN / LAN / MAN / WAN) */}
      <div className="card" style={{
        padding: '20px 24px',
        background: 'linear-gradient(135deg, rgba(6, 12, 28, 0.95), rgba(15, 23, 42, 0.95))',
        border: '1.5px solid rgba(0, 240, 255, 0.25)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              🌐 Multi-Tier Network Scope Infrastructure (PAN &bull; LAN &bull; MAN &bull; WAN)
            </h3>
            <p style={{ fontSize: '.72rem', color: '#64748b', margin: '2px 0 0' }}>
              Deep perimeter segmentation mapping personal hardware, internal corporate nodes, campus datalinks, and cloud ingress.
            </p>
          </div>

          {/* Scope Filters */}
          <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.03)', padding: 3, borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)' }}>
            {SCOPES.map(sc => (
              <button
                key={sc}
                onClick={() => setScope(sc)}
                style={{
                  background: filterScope === sc ? 'rgba(0,240,255,0.2)' : 'transparent',
                  border: filterScope === sc ? '1px solid #00f0ff' : 'none',
                  color: filterScope === sc ? '#67e8f9' : '#94a3b8',
                  ...M,
                  fontSize: '.7rem',
                  padding: '4px 12px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: filterScope === sc ? 800 : 400
                }}
              >
                {sc}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Scope Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { scope: 'PAN', title: 'Personal Area Net', desc: 'SecOps Workstations & FIDO2 Vaults', cidr: '192.168.99.x', color: '#a855f7', count: enrichedAssets.filter(a => a.computed_scope === 'PAN').length },
            { scope: 'LAN', title: 'Local Area Net', desc: 'Core Domain Controller & SQL Cluster', cidr: '172.16.0.0/24', color: '#3b82f6', count: enrichedAssets.filter(a => a.computed_scope === 'LAN').length },
            { scope: 'MAN', title: 'Metropolitan Area Net', desc: 'Plant 4 SCADA & Inter-Campus Fiber', cidr: '172.16.80.0/20', color: '#06b6d4', count: enrichedAssets.filter(a => a.computed_scope === 'MAN').length },
            { scope: 'WAN', title: 'Wide Area Net', desc: 'AWS us-east-1 & Citrix Edge DMZ', cidr: '10.0.1.0/24', color: '#ef4444', count: enrichedAssets.filter(a => a.computed_scope === 'WAN').length },
          ].map(z => (
            <div
              key={z.scope}
              onClick={() => setScope(filterScope === z.scope ? 'ALL' : z.scope)}
              style={{
                background: `rgba(255,255,255,0.02)`,
                border: filterScope === z.scope ? `1.5px solid ${z.color}` : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10,
                padding: '12px 14px',
                cursor: 'pointer',
                transition: 'all .15s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ ...M, fontSize: '.72rem', fontWeight: 800, color: z.color }}>{z.scope} ZONE</span>
                <span style={{ ...M, fontSize: '1.2rem', fontWeight: 900, color: '#fff' }}>{z.count} Nodes</span>
              </div>
              <p style={{ fontSize: '.76rem', fontWeight: 700, color: '#f1f5f9', margin: '4px 0 2px' }}>{z.title}</p>
              <p style={{ fontSize: '.65rem', color: '#64748b', margin: 0 }}>{z.desc}</p>
              <p style={{ ...M, fontSize: '.62rem', color: z.color, marginTop: 4 }}>Subnet: {z.cidr}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="card" style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ ...M, fontSize: '.72rem', color: '#67e8f9', fontWeight: 700 }}>
            {filtered.length} / {assets.length} Assets Active
          </span>
          <select className="inp" style={{ width: 140, padding: '5px 8px' }} value={filterCrit} onChange={e => setFC(e.target.value)}>
            <option value="ALL">All Criticalities</option>
            {CRITS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="inp" style={{ width: 160, padding: '5px 8px' }} value={filterZone} onChange={e => setFZ(e.target.value)}>
            <option value="ALL">All Exposure Zones</option>
            {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
          <input
            className="inp"
            style={{ width: 190, padding: '5px 10px' }}
            placeholder="🔍 Search name, IP, OS…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          + Register New Asset
        </button>
      </div>

      {/* Asset Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {filtered.map(a => {
          const critColor = CC[a.criticality] || '#94a3b8';
          const zoneColor = ZC[a.exposure] || '#94a3b8';
          const scopeColor = SCOPE_COLORS[a.computed_scope] || '#3b82f6';
          const count = risks.filter(r => r.asset.id === a.id || r.asset.name === a.name).length;

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
                <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: 0 }}>{a.asset_type} &bull; {a.os_info}</p>
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
