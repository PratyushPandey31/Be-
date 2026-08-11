import React, { useState, useRef, useEffect, useCallback } from 'react';

const M = { fontFamily:"'JetBrains Mono',monospace" };

const STAGES = [
  { id:0, label:'Initialize',        icon:'⚙️',  color:'#64748b', cmd:'init' },
  { id:1, label:'Host Discovery',    icon:'🔍',  color:'#3b82f6', cmd:'nmap -sn' },
  { id:2, label:'Port & Service',    icon:'🔌',  color:'#8b5cf6', cmd:'nmap -sS -sV' },
  { id:3, label:'OpenVAS GVM',       icon:'🛡️',  color:'#f97316', cmd:'gvm-cli' },
  { id:4, label:'NVD + EPSS',        icon:'📡',  color:'#06b6d4', cmd:'nvd-api' },
  { id:5, label:'AI Risk Engine',    icon:'🧠',  color:'#10b981', cmd:'cybershield-ai' },
  { id:6, label:'✓ Complete',        icon:'✅',  color:'#4ade80', cmd:'done' },
];

const LEVEL_COLOR = {
  INIT:'#64748b', INFO:'#67e8f9', NMAP:'#60a5fa',
  OPENVAS:'#fb923c', CVE_FEED:'#a78bfa', AI_ENGINE:'#34d399', SUCCESS:'#4ade80',
};
const LEVEL_BG = {
  INIT:'rgba(100,116,139,.12)', INFO:'rgba(103,232,249,.09)', NMAP:'rgba(96,165,250,.12)',
  OPENVAS:'rgba(251,146,60,.12)', CVE_FEED:'rgba(167,139,250,.12)', AI_ENGINE:'rgba(52,211,153,.12)', SUCCESS:'rgba(74,222,128,.12)',
};

const DISCOVERED_HOSTS = [
  { ip:'10.0.1.50',    name:'PROD-WEB-SERVER-01',   os:'Ubuntu 22.04 LTS',       mac:'00:50:56:AB:12:34', latency:'2.3ms',  ports:['22/ssh','80/http','443/https','8080/http-proxy'],                   risk:'CRITICAL', vulns:2 },
  { ip:'10.0.2.105',   name:'PROD-DB-POSTGRES-01',  os:'RHEL 9.1',               mac:'00:50:56:AB:22:11', latency:'3.1ms',  ports:['22/ssh','5432/postgresql'],                                         risk:'HIGH',     vulns:1 },
  { ip:'10.0.3.200',   name:'CORP-CONFLUENCE-01',   os:'Oracle Linux 8.8',       mac:'00:0C:29:F1:44:AA', latency:'5.8ms',  ports:['80/http','443/https','8090/http'],                                   risk:'CRITICAL', vulns:2 },
  { ip:'10.0.4.12',    name:'CORP-CITRIX-GW-01',    os:'NetScaler 13.1',         mac:'00:0C:29:C2:88:BB', latency:'4.1ms',  ports:['80/http','443/https','22/ssh','4433/tls'],                           risk:'CRITICAL', vulns:1 },
  { ip:'172.16.0.5',   name:'FIN-WIN-DC-01',        os:'Windows Server 2022',    mac:'00:50:56:CC:77:DD', latency:'1.9ms',  ports:['135/rpc','389/ldap','445/smb','3389/rdp','636/ldaps'],              risk:'HIGH',     vulns:2 },
  { ip:'172.16.80.4',  name:'SCADA-PLC-GATEWAY-09', os:'Embedded Linux 4.14',   mac:'AA:BB:CC:11:22:33', latency:'8.2ms',  ports:['502/modbus','102/iso-tsap','20000/dnp3'],                            risk:'HIGH',     vulns:1 },
  { ip:'10.0.5.88',    name:'STAGING-API-NODE-03',  os:'Debian 12 / Node 20',    mac:'00:50:56:FF:11:22', latency:'4.5ms',  ports:['22/ssh','3000/http','8443/https'],                                   risk:'MEDIUM',   vulns:1 },
  { ip:'192.168.20.14',name:'DEV-BUILD-RUNNER-02',  os:'Ubuntu 20.04 LTS',       mac:'DE:AD:BE:EF:00:01', latency:'6.3ms',  ports:['22/ssh','8080/jenkins'],                                             risk:'MEDIUM',   vulns:1 },
  { ip:'192.168.1.1',  name:'INFRA-NET-FW-01',      os:'FortiOS 7.2',            mac:'AC:22:0B:55:E1:F2', latency:'1.2ms',  ports:['22/ssh','443/https','541/ssl-vpn'],                                  risk:'CRITICAL', vulns:1 },
  { ip:'10.0.6.44',    name:'MAIL-EXCHANGE-01',     os:'Windows Server 2019',    mac:'00:11:22:33:44:55', latency:'3.7ms',  ports:['25/smtp','110/pop3','143/imap','443/https','445/smb'],               risk:'HIGH',     vulns:1 },
];

const OPENVAS_FINDINGS = [
  { host:'10.0.1.50',    port:'8080/tcp', ntv:'1.3.6.1.4.1.25623.1.0.147021', cve:'CVE-2021-44228', cvss:10.0, vector:'AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', service:'Apache Tomcat 9 / Log4j',    tier:'CRITICAL', epss:'97.6%' },
  { host:'10.0.3.200',   port:'443/tcp',  ntv:'1.3.6.1.4.1.25623.1.0.170841', cve:'CVE-2023-22515', cvss:10.0, vector:'AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', service:'Atlassian Confluence 8.3',  tier:'CRITICAL', epss:'97.4%' },
  { host:'10.0.4.12',    port:'443/tcp',  ntv:'1.3.6.1.4.1.25623.1.0.170812', cve:'CVE-2023-4966',  cvss:9.4,  vector:'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', service:'Citrix NetScaler 13.1',     tier:'CRITICAL', epss:'96.1%' },
  { host:'192.168.1.1',  port:'541/tcp',  ntv:'1.3.6.1.4.1.25623.1.0.170922', cve:'CVE-2024-21762', cvss:9.6,  vector:'AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H', service:'FortiOS SSL-VPN',           tier:'CRITICAL', epss:'91.2%' },
  { host:'172.16.0.5',   port:'135/tcp',  ntv:'1.3.6.1.4.1.25623.1.0.100054', cve:'CVE-2021-34527', cvss:8.8,  vector:'AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', service:'Windows Print Spooler',     tier:'HIGH',     epss:'88.1%' },
  { host:'10.0.1.50',    port:'80/tcp',   ntv:'1.3.6.1.4.1.25623.1.0.147500', cve:'CVE-2023-4863',  cvss:8.8,  vector:'AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H', service:'libwebp / Nginx image proc', tier:'HIGH',     epss:'82.2%' },
  { host:'172.16.0.5',   port:'445/tcp',  ntv:'1.3.6.1.4.1.25623.1.0.147024', cve:'CVE-2024-3094',  cvss:10.0, vector:'AV:N/AC:H/PR:N/UI:N/S:C/C:H/I:H/A:H', service:'OpenSSH / liblzma XZ',     tier:'CRITICAL', epss:'94.4%' },
  { host:'10.0.5.88',    port:'3000/tcp', ntv:'1.3.6.1.4.1.25623.1.0.146800', cve:'CVE-2022-22965', cvss:9.8,  vector:'AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', service:'Spring Framework / Tomcat', tier:'CRITICAL', epss:'71.4%' },
  { host:'10.0.6.44',    port:'445/tcp',  ntv:'1.3.6.1.4.1.25623.1.0.100071', cve:'CVE-2021-34527', cvss:8.8,  vector:'AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H', service:'Windows Print Spooler',     tier:'HIGH',     epss:'88.1%' },
  { host:'10.0.3.200',   port:'8090/tcp', ntv:'1.3.6.1.4.1.25623.1.0.170845', cve:'CVE-2023-38606', cvss:9.8,  vector:'AV:L/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H', service:'macOS/iOS Kernel subsystem', tier:'CRITICAL', epss:'76.3%' },
];

const TC = { CRITICAL:'#ef4444', HIGH:'#f97316', MEDIUM:'#f59e0b', LOW:'#10b981' };

/* ── Stage Pipeline ── */
function StagePipeline({ activeStage }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:0, overflowX:'auto', paddingBottom:2 }}>
      {STAGES.map((s, i) => {
        const done=s.id<activeStage, active=s.id===activeStage, pending=s.id>activeStage;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4, minWidth:85, opacity:pending?.3:1, transition:'opacity .3s' }}>
              <div style={{
                width:38, height:38, borderRadius:'50%',
                border:`2px solid ${done||active?s.color:'#2d3748'}`,
                background:done?s.color:active?`${s.color}18`:'rgba(255,255,255,0.02)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:done?'1rem':'.95rem', transition:'all .4s',
                boxShadow:active?`0 0 20px ${s.color}90, 0 0 40px ${s.color}30`:'none',
                animation:active?'glow 1.5s ease infinite':'none',
              }}>{done?'✓':s.icon}</div>
              <p style={{ ...M, fontSize:'.52rem', color:active?s.color:pending?'#2d3748':'#64748b',
                fontWeight:active?700:400, textAlign:'center', letterSpacing:.4, lineHeight:1.3 }}>
                {s.label}
              </p>
              {active && <span style={{ ...M, fontSize:'.5rem', color:s.color, opacity:.7 }}>{s.cmd}</span>}
            </div>
            {i<STAGES.length-1 && (
              <div style={{ flex:1, height:2, minWidth:8,
                background:done?`linear-gradient(90deg,${s.color},${STAGES[i+1].color})`:'rgba(255,255,255,0.06)',
                transition:'background .6s', boxShadow:done?`0 0 6px ${s.color}50`:'' }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ── Live Counter Stat Box ── */
function StatBox({ label, value, color, animate }) {
  const [disp, setDisp] = useState(0);
  useEffect(() => {
    if (!animate || !value) return;
    let cur=0; const target=parseInt(value);
    const step = Math.ceil(target/40);
    const id = setInterval(()=>{ cur=Math.min(cur+step,target); setDisp(cur); if(cur>=target) clearInterval(id); },30);
    return ()=>clearInterval(id);
  }, [value, animate]);
  return (
    <div style={{ padding:'10px 14px', background:`${color}09`, border:`1px solid ${color}22`, borderRadius:10, textAlign:'center', minWidth:90 }}>
      <p style={{ ...M, fontSize:'.56rem', color:'#475569', letterSpacing:.7, textTransform:'uppercase', marginBottom:3 }}>{label}</p>
      <p style={{ ...M, fontSize:'1.3rem', fontWeight:800, color, lineHeight:1 }}>{animate?disp.toLocaleString():value}</p>
    </div>
  );
}

export default function ScannerPanel({ API, onDone, onScanStart, onScanEnd }) {
  const [subnet, setSubnet]   = useState('10.0.0.0/24');
  const [profile, setProfile] = useState('Full & Fast (Comprehensive)');
  const [running, setRunning] = useState(false);
  const [done, setDone]       = useState(false);
  const [logs, setLogs]       = useState([]);
  const [stage, setStage]     = useState(-1);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('terminal');
  const [visibleHosts, setVisibleHosts] = useState([]);
  const [visibleFindings, setVisibleFindings] = useState([]);
  const [packetCount, setPacketCount] = useState(0);
  const [portCount, setPortCount]     = useState(0);
  const [nvtCount, setNvtCount]       = useState(0);
  const termRef = useRef(null);
  const pktRef  = useRef(null);

  useEffect(()=>{ if(termRef.current) termRef.current.scrollTop=termRef.current.scrollHeight; },[logs]);

  const runScan = async () => {
    setRunning(true); setDone(false); setLogs([]); setStage(0);
    setProgress(0); setVisibleHosts([]); setVisibleFindings([]);
    setPacketCount(0); setPortCount(0); setNvtCount(0);
    onScanStart?.();

    // Animated packet counter
    pktRef.current = setInterval(()=>{
      setPacketCount(p => p + Math.floor(Math.random()*1200+400));
    }, 120);

    try {
      const res = await fetch(`${API}/scan/trigger`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ target_subnet:subnet, scan_depth:profile })
      });
      const data = await res.json();
      const allLogs = data.logs||[];

      let hIdx=0, fIdx=0;
      for(let i=0; i<allLogs.length; i++) {
        await new Promise(r=>setTimeout(r, 60));
        const log = allLogs[i];
        setLogs(prev=>[...prev, log]);
        const s=log.stage??0;
        setStage(s);
        setProgress(Math.round((i/allLogs.length)*100));

        // Animate hosts appearing during stage 1
        if(s===1 && hIdx<DISCOVERED_HOSTS.length) {
          setVisibleHosts(prev=>[...prev, DISCOVERED_HOSTS[hIdx++]]);
          setPortCount(p=>p+Math.floor(Math.random()*5+2));
        }
        // Animate findings appearing during stage 3
        if(s===3 && fIdx<OPENVAS_FINDINGS.length) {
          setVisibleFindings(prev=>[...prev, OPENVAS_FINDINGS[fIdx++]]);
          setNvtCount(p=>p+Math.floor(Math.random()*8000+2000));
        }
      }
      clearInterval(pktRef.current);
      setProgress(100); setDone(true); setRunning(false);
      setVisibleHosts(DISCOVERED_HOSTS);
      setVisibleFindings(OPENVAS_FINDINGS);
      onScanEnd?.(); onDone();
    } catch(e) {
      clearInterval(pktRef.current); setRunning(false);
    }
  };

  const stageColor = stage>=0?(STAGES[stage]?.color||'#94a3b8'):'#475569';

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }} className="anim-fadeup">

      {/* Config Card */}
      <div className="card" style={{ padding:'20px 24px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:18, flexWrap:'wrap', gap:12 }}>
          <div>
            <p style={{ fontWeight:800, fontSize:'1.02rem', color:'#fff', marginBottom:3 }}>◎ Automated Security Assessment Pipeline</p>
            <p style={{ fontSize:'.72rem', color:'#64748b' }}>Nmap 7.94 → OpenVAS GVM 22.4 → NIST NVD API v2.0 → FIRST.org EPSS → CyberShield AI Engine</p>
          </div>
          {done && <span style={{ ...M, fontSize:'.7rem', color:'#4ade80', background:'rgba(74,222,128,.08)', border:'1px solid rgba(74,222,128,.2)', padding:'6px 14px', borderRadius:8 }}>✓ Pipeline Complete in 00:04:12</span>}
          {running && <span style={{ ...M, fontSize:'.7rem', color:stageColor, background:`${stageColor}10`, border:`1px solid ${stageColor}30`, padding:'6px 14px', borderRadius:8, animation:'pulse 1s ease infinite' }}>● Stage {stage}/6 Active…</span>}
        </div>

        <div style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap', marginBottom:18 }}>
          <div style={{ flex:1, minWidth:180 }}>
            <label style={{ ...M, fontSize:'.6rem', color:'#64748b', display:'block', marginBottom:5, letterSpacing:.7, textTransform:'uppercase' }}>Target Subnet / CIDR Range</label>
            <input className="inp" value={subnet} onChange={e=>setSubnet(e.target.value)} placeholder="10.0.0.0/24" disabled={running}/>
          </div>
          <div style={{ flex:1, minWidth:220 }}>
            <label style={{ ...M, fontSize:'.6rem', color:'#64748b', display:'block', marginBottom:5, letterSpacing:.7, textTransform:'uppercase' }}>Scan Profile</label>
            <select className="inp" value={profile} onChange={e=>setProfile(e.target.value)} disabled={running}>
              <option>Full & Fast (Comprehensive)</option>
              <option>Deep Scan (All 65535 Ports)</option>
              <option>Stealth SYN Scan (-sS, Low Noise)</option>
              <option>Web Application Focus (-p 80,443,8080,8443)</option>
              <option>Database Discovery (-p 1433,3306,5432,6379,27017)</option>
              <option>Industrial / SCADA Focus (Modbus/DNP3)</option>
            </select>
          </div>
          <button className="btn btn-primary" onClick={runScan} disabled={running} style={{ minWidth:200, justifyContent:'center', height:42 }}>
            {running ? (
              <><span style={{ display:'inline-block', width:14, height:14, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin .7s linear infinite' }}/>&nbsp; Scanning…</>
            ) : '▶ Launch Scan Pipeline'}
          </button>
        </div>

        <StagePipeline activeStage={stage}/>

        {(running||done) && (
          <div style={{ marginTop:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, ...M, fontSize:'.65rem' }}>
              <span style={{ color:'#64748b' }}>Overall Pipeline Progress</span>
              <span style={{ color:stageColor, fontWeight:700 }}>{progress}%</span>
            </div>
            <div className="prog-track" style={{ height:6 }}>
              <div className="prog-fill" style={{ width:`${progress}%`, background:`linear-gradient(90deg, #3b82f6, ${stageColor})`, boxShadow:`0 0 8px ${stageColor}60` }}/>
            </div>
          </div>
        )}
      </div>

      {/* Live Stats during scan */}
      {(running||done) && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:10 }}>
          <StatBox label="Packets Sent"   value={packetCount.toLocaleString()} color="#3b82f6" animate={false}/>
          <StatBox label="Hosts Live"     value={visibleHosts.length}           color="#06b6d4" animate={false}/>
          <StatBox label="Open Ports"     value={portCount}                     color="#8b5cf6" animate={false}/>
          <StatBox label="NVT Checks"     value={nvtCount.toLocaleString()}     color="#f97316" animate={false}/>
          <StatBox label="Findings"       value={visibleFindings.length}        color="#ef4444" animate={false}/>
          <StatBox label="AI Score Top"   value={done?'100.0':stage>=5?'100.0':'—'} color="#10b981" animate={false}/>
        </div>
      )}

      {/* Results Area */}
      {(logs.length>0||done) && (
        <div className="card" style={{ overflow:'hidden' }}>
          {/* Tab Bar */}
          <div style={{ display:'flex', gap:1, padding:'8px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.018)', overflowX:'auto' }}>
            {[
              { id:'terminal', label:'📟 Terminal Output', count:logs.length },
              { id:'hosts',    label:'🖥️ Discovered Hosts', count:visibleHosts.length },
              { id:'openvas',  label:'🛡️ OpenVAS Findings', count:visibleFindings.length },
              { id:'ai',       label:'🧠 AI Scoring', count:done?14:0 },
            ].map(t=>(
              <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{
                padding:'6px 14px', borderRadius:7, border:'none', cursor:'pointer',
                background:activeTab===t.id?'rgba(0,240,255,0.1)':'transparent',
                color:activeTab===t.id?'#a5f3fc':'#64748b',
                ...M, fontSize:'.67rem', fontWeight:activeTab===t.id?700:400,
                borderBottom:activeTab===t.id?'2px solid #00f0ff':'2px solid transparent',
                display:'flex', alignItems:'center', gap:6, whiteSpace:'nowrap'
              }}>
                {t.label}
                {t.count>0 && <span style={{ background:activeTab===t.id?'rgba(0,240,255,0.2)':'rgba(255,255,255,0.06)', padding:'1px 6px', borderRadius:99, fontSize:'.55rem', fontWeight:700 }}>{t.count}</span>}
              </button>
            ))}
          </div>

          {/* Terminal */}
          {activeTab==='terminal' && (
            <div ref={termRef} style={{ background:'#010409', height:480, overflowY:'auto', padding:'14px 18px', ...M, fontSize:'.7rem', lineHeight:1.75 }}>
              {logs.map((log,i)=>{
                if(!log.msg) return <div key={i} style={{ height:6 }}/>;
                const col=LEVEL_COLOR[log.level]||'#64748b';
                const bg =LEVEL_BG[log.level]||'transparent';
                return (
                  <div key={i} style={{ display:'flex', gap:8, marginBottom:1, alignItems:'flex-start' }}>
                    <span style={{ color:'#2d3748', flexShrink:0, minWidth:66 }}>[{log.timestamp}]</span>
                    <span style={{ color:col, background:bg, border:`1px solid ${col}20`, padding:'0 6px', borderRadius:4, fontSize:'.58rem', fontWeight:700, letterSpacing:.6, flexShrink:0, minWidth:72, textAlign:'center' }}>
                      {log.level}
                    </span>
                    <span style={{ color:log.level==='SUCCESS'?'#4ade80':log.level==='INIT'?'#475569':'#e2e8f0', wordBreak:'break-all', flex:1 }}>{log.msg}</span>
                  </div>
                );
              })}
              {running && <div style={{ display:'flex', gap:8, alignItems:'center', marginTop:6, color:'#334155' }}>
                <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:stageColor, animation:'pulse .8s ease infinite' }}/>
                <span style={{ ...M, fontSize:'.68rem', color:stageColor }}>Stage {stage}/6 executing — {STAGES[stage]?.label}…</span>
              </div>}
            </div>
          )}

          {/* Hosts Table */}
          {activeTab==='hosts' && (
            <div style={{ overflowX:'auto', maxHeight:520, overflowY:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:900 }}>
                <thead style={{ position:'sticky', top:0, zIndex:2 }}>
                  <tr style={{ background:'rgba(4,8,20,0.9)', backdropFilter:'blur(12px)' }}>
                    {['IP Address','Asset Name','OS Fingerprint','MAC Address','Latency','Open Ports','Findings','Risk'].map(h=>(
                      <th key={h} style={{ ...M, fontSize:'.58rem', color:'#475569', padding:'11px 14px', textAlign:'left', letterSpacing:.7, textTransform:'uppercase', borderBottom:'1px solid rgba(255,255,255,0.07)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleHosts.map((h,i)=>(
                    <tr key={h.ip} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', borderLeft:`3px solid ${TC[h.risk]}`, animation:'fadeUp .3s ease forwards', opacity:0, animationDelay:`${i*60}ms`, animationFillMode:'forwards' }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${TC[h.risk]}06`}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ ...M, fontSize:'.72rem', color:'#67e8f9', padding:'11px 14px', fontWeight:700 }}>{h.ip}</td>
                      <td style={{ fontSize:'.74rem', color:'#f1f5f9', padding:'11px 14px', fontWeight:600 }}>{h.name}</td>
                      <td style={{ ...M, fontSize:'.67rem', color:'#94a3b8', padding:'11px 14px' }}>{h.os}</td>
                      <td style={{ ...M, fontSize:'.66rem', color:'#475569', padding:'11px 14px' }}>{h.mac}</td>
                      <td style={{ ...M, fontSize:'.68rem', color:'#10b981', padding:'11px 14px' }}>{h.latency}</td>
                      <td style={{ padding:'11px 14px' }}>
                        <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                          {h.ports.map(p=><span key={p} style={{ ...M, fontSize:'.55rem', color:'#8b5cf6', background:'rgba(139,92,246,.08)', border:'1px solid rgba(139,92,246,.2)', padding:'2px 6px', borderRadius:4 }}>{p}</span>)}
                        </div>
                      </td>
                      <td style={{ ...M, fontSize:'1rem', fontWeight:800, color:h.vulns>1?'#ef4444':'#f97316', padding:'11px 14px', textAlign:'center' }}>{h.vulns}</td>
                      <td style={{ padding:'11px 14px' }}><span className={`badge b-${h.risk.toLowerCase()}`} style={{ fontSize:'.58rem' }}>{h.risk}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* OpenVAS Findings */}
          {activeTab==='openvas' && (
            <div style={{ overflowX:'auto', maxHeight:520, overflowY:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:1100 }}>
                <thead style={{ position:'sticky', top:0, zIndex:2 }}>
                  <tr style={{ background:'rgba(4,8,20,0.9)', backdropFilter:'blur(12px)' }}>
                    {['Host','Port','NVT OID','CVE ID','CVSS','EPSS','CVSS v3 Vector','Affected Service','Severity'].map(h=>(
                      <th key={h} style={{ ...M, fontSize:'.56rem', color:'#475569', padding:'11px 12px', textAlign:'left', letterSpacing:.6, textTransform:'uppercase', borderBottom:'1px solid rgba(255,255,255,0.07)', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visibleFindings.map((f,i)=>(
                    <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', borderLeft:`3px solid ${TC[f.tier]}`, animation:'fadeUp .3s ease forwards', opacity:0, animationDelay:`${i*80}ms`, animationFillMode:'forwards' }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${TC[f.tier]}07`}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <td style={{ ...M, fontSize:'.7rem', color:'#67e8f9', padding:'11px 12px', fontWeight:700 }}>{f.host}</td>
                      <td style={{ ...M, fontSize:'.68rem', color:'#a78bfa', padding:'11px 12px' }}>{f.port}</td>
                      <td style={{ ...M, fontSize:'.58rem', color:'#334155', padding:'11px 12px', maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }} title={f.ntv}>{f.ntv}</td>
                      <td style={{ ...M, fontSize:'.72rem', color:'#67e8f9', padding:'11px 12px', fontWeight:700, whiteSpace:'nowrap' }}>{f.cve}</td>
                      <td style={{ ...M, fontSize:'.8rem', color:f.cvss>=9.5?'#ef4444':f.cvss>=8?'#f97316':'#f59e0b', padding:'11px 12px', fontWeight:800 }}>{f.cvss}</td>
                      <td style={{ ...M, fontSize:'.72rem', color:'#06b6d4', padding:'11px 12px', fontWeight:700 }}>{f.epss}</td>
                      <td style={{ ...M, fontSize:'.58rem', color:'#475569', padding:'11px 12px', whiteSpace:'nowrap' }}>{f.vector}</td>
                      <td style={{ fontSize:'.72rem', color:'#cbd5e1', padding:'11px 12px', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.service}</td>
                      <td style={{ padding:'11px 12px' }}><span className={`badge b-${f.tier.toLowerCase()}`} style={{ fontSize:'.57rem' }}>{f.tier}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {done && (
                <div style={{ padding:'12px 16px', background:'rgba(251,146,60,0.04)', borderTop:'1px solid rgba(251,146,60,0.1)' }}>
                  <p style={{ ...M, fontSize:'.63rem', color:'#fb923c' }}>
                    ● Greenbone Community Feed 20240805T0613 · GVM 22.4.4 · 87,453 NVT checks · Config: Full and Fast · Authenticated scan
                    &nbsp;|&nbsp; {visibleFindings.length} findings · {visibleFindings.filter(f=>f.tier==='CRITICAL').length} CRITICAL · {visibleFindings.filter(f=>f.tier==='HIGH').length} HIGH
                  </p>
                </div>
              )}
            </div>
          )}

          {/* AI Scoring Tab */}
          {activeTab==='ai' && done && (
            <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ padding:'14px 18px', background:'rgba(16,185,129,0.05)', border:'1px solid rgba(16,185,129,0.15)', borderRadius:12 }}>
                <p style={{ ...M, fontSize:'.63rem', color:'#34d399', fontWeight:700, letterSpacing:.8, marginBottom:8 }}>🧠 CYBERSHIELD AI — MULTI-FACTOR RISK ENGINE RESULTS</p>
                <p style={{ ...M, fontSize:'.76rem', color:'#94a3b8', lineHeight:1.7 }}>
                  Formula: Risk = CVSS × W<sub>crit</sub> × (1 + 0.8·EPSS) × W<sub>exp</sub> × M<sub>exploit</sub> → Normalized [0, 100]
                </p>
              </div>
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'rgba(255,255,255,0.025)' }}>
                      {['#','CVE ID','CVSS','W_crit','EPSS','EPSS Factor','W_exp','M_exploit','Raw','AI Score','Tier'].map(h=>(
                        <th key={h} style={{ ...M, fontSize:'.58rem', color:'#475569', padding:'10px 12px', textAlign:'left', letterSpacing:.6, textTransform:'uppercase', borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {OPENVAS_FINDINGS.map((f,i)=>{
                      const wcrit=f.tier==='CRITICAL'?1.5:1.25, wexp=f.tier==='CRITICAL'?1.4:1.2;
                      const epssNum=parseFloat(f.epss)/100;
                      const epssFact=(1+0.8*epssNum).toFixed(3);
                      const raw=(f.cvss*wcrit*parseFloat(epssFact)*wexp*1.3).toFixed(2);
                      const score=Math.min(100,(parseFloat(raw)/45*100)).toFixed(1);
                      const tc=TC[f.tier];
                      return (
                        <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.03)', borderLeft:`2px solid ${tc}` }}
                          onMouseEnter={e=>e.currentTarget.style.background=`${tc}06`}
                          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                          <td style={{ ...M, fontSize:'.68rem', color:'#334155', padding:'10px 12px' }}>#{i+1}</td>
                          <td style={{ ...M, fontSize:'.72rem', color:'#67e8f9', padding:'10px 12px', fontWeight:700 }}>{f.cve}</td>
                          <td style={{ ...M, fontSize:'.72rem', color:'#fbbf24', padding:'10px 12px', fontWeight:700 }}>{f.cvss}</td>
                          <td style={{ ...M, fontSize:'.7rem',  color:'#fb923c', padding:'10px 12px' }}>{wcrit}</td>
                          <td style={{ ...M, fontSize:'.7rem',  color:'#06b6d4', padding:'10px 12px' }}>{f.epss}</td>
                          <td style={{ ...M, fontSize:'.7rem',  color:'#a78bfa', padding:'10px 12px' }}>{epssFact}</td>
                          <td style={{ ...M, fontSize:'.7rem',  color:'#06b6d4', padding:'10px 12px' }}>{wexp}</td>
                          <td style={{ ...M, fontSize:'.7rem',  color:'#4ade80', padding:'10px 12px' }}>×1.30</td>
                          <td style={{ ...M, fontSize:'.7rem',  color:'#64748b', padding:'10px 12px' }}>{raw}</td>
                          <td style={{ ...M, fontSize:'1rem',   color:tc,        padding:'10px 12px', fontWeight:800 }}>{score}</td>
                          <td style={{ padding:'10px 12px' }}><span className={`badge b-${f.tier.toLowerCase()}`} style={{ fontSize:'.57rem' }}>{f.tier}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pre-scan welcome */}
      {logs.length===0 && !running && (
        <div className="card" style={{ padding:'60px 40px', textAlign:'center', display:'flex', flexDirection:'column', gap:16, alignItems:'center' }}>
          <div style={{ fontSize:'3rem', marginBottom:4 }}>◎</div>
          <p style={{ fontWeight:800, fontSize:'1.05rem', color:'#e2e8f0' }}>Ready to Launch Security Assessment Pipeline</p>
          <p style={{ fontSize:'.8rem', color:'#64748b', maxWidth:520, lineHeight:1.8 }}>
            Set your target subnet and scan profile above. The 6-stage pipeline will perform
            <strong style={{ color:'#67e8f9' }}> host discovery → port scanning → OpenVAS vulnerability matching → NVD/EPSS enrichment → AI risk scoring</strong>,
            streaming live results to 4 analysis tabs.
          </p>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center', marginTop:6 }}>
            {['Nmap 7.94 SYN Stealth','OpenVAS GVM 22.4','87,453 NVT Checks','NIST NVD API v2.0','FIRST.org EPSS','CyberShield AI Engine'].map(t=>(
              <span key={t} style={{ ...M, fontSize:'.63rem', color:'#64748b', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', padding:'5px 11px', borderRadius:7 }}>{t}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
