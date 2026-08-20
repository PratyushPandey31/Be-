import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AssetManager from './components/AssetManager';
import RiskPrioritizer from './components/RiskPrioritizer';
import ScannerPanel from './components/ScannerPanel';
import EvaluationPanel from './components/EvaluationPanel';
import ReportPanel from './components/ReportPanel';
import XAIDrawer from './components/XAIDrawer';
import AuthModal from './components/AuthModal';
import AICopilotDrawer from './components/AICopilotDrawer';
import FacultyPitchPadModal from './components/FacultyPitchPadModal';
import MitigationReportModal from './components/MitigationReportModal';

const API = 'http://127.0.0.1:8000/api';

const s = {
  root:   { minHeight:'100vh', display:'flex', flexDirection:'column', fontFamily:"'Inter', system-ui, sans-serif" },
  main:   { flex:1, width:'100%', maxWidth:1640, margin:'0 auto', padding:'22px 22px', display:'flex', flexDirection:'column', gap:18 },
  loader: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:'80px 20px',
            background:'rgba(6,12,28,0.5)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, margin:'40px 0' },
  spin:   { width:40, height:40, border:'3px solid rgba(0,240,255,0.15)', borderTopColor:'#00f0ff', borderRadius:'50%', animation:'spin .8s linear infinite' },
  footer: { borderTop:'1px solid rgba(255,255,255,0.05)', padding:'12px 24px', textAlign:'center',
            fontFamily:"'JetBrains Mono',monospace", fontSize:'.65rem', color:'#334155' },
};

export default function App() {
  const [tab, setTab]         = useState('dashboard');
  const [online, setOnline]   = useState(false);
  const [stats, setStats]     = useState(null);
  const [assets, setAssets]   = useState([]);
  const [risks, setRisks]     = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [xai, setXai]         = useState(null);
  const [scanning, setScanning] = useState(false);

  // User Auth State
  const [user, setUser]                 = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // AI Copilot Drawer State
  const [showCopilot, setShowCopilot]   = useState(false);

  // Faculty Defense Pitch Pad State
  const [showPitchPad, setShowPitchPad] = useState(false);

  // Mitigation Execution Mini Audit Report State
  const [mitigationReport, setMitigationReport] = useState(null);
  const [showMitigationModal, setShowMitigationModal] = useState(false);

  useEffect(() => {
    // Check saved user session in localStorage
    const savedUser = localStorage.getItem('cybershield_user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch { }
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const [h, st, as, ri, me] = await Promise.all([
        fetch(`${API}/health`).catch(()=>null),
        fetch(`${API}/dashboard/stats`).catch(()=>null),
        fetch(`${API}/assets`).catch(()=>null),
        fetch(`${API}/prioritize`).catch(()=>null),
        fetch(`${API}/evaluation/metrics`).catch(()=>null),
      ]);
      setOnline(h?.ok || false);
      if (st?.ok) setStats(await st.json());
      if (as?.ok) setAssets(await as.json());
      if (ri?.ok) setRisks(await ri.json());
      if (me?.ok) setMetrics(await me.json());
    } catch { setOnline(false); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); const id=setInterval(fetchAll,12000); return ()=>clearInterval(id); }, [fetchAll]);

  const createAsset = async (data) => {
    const r = await fetch(`${API}/assets`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data) });
    if(r.ok) fetchAll();
    return r.ok;
  };

  const handleResolve = async (findingId, findingData = null) => {
    const currentFinding = findingData || risks.find(r => r.finding_id === findingId);
    try {
      const r = await fetch(`${API}/findings/${findingId}/status`, {
        method:'PUT', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ status:'RESOLVED' })
      });

      const reportPayload = {
        finding_id: findingId,
        cve_id: currentFinding?.vulnerability?.cve_id || `Finding #${findingId}`,
        title: currentFinding?.vulnerability?.title || 'Security Weakness Remediation',
        asset_name: currentFinding?.asset?.name || 'Enterprise Node',
        asset_ip: currentFinding?.asset?.ip || '10.0.x.x',
        asset_exposure: currentFinding?.asset?.exposure || 'Perimeter Gateway',
        asset_criticality: currentFinding?.asset?.criticality || 'Mission Critical',
        previous_risk_score: currentFinding?.ai_risk?.risk_score || 95.0,
        threat_tier: currentFinding?.ai_risk?.threat_tier || 'CRITICAL',
        cvss: currentFinding?.vulnerability?.cvss || 9.8,
        epss: currentFinding?.vulnerability?.epss || 0.95,
        patch_script: currentFinding?.vulnerability?.patch_script || 'sudo systemctl restart security-daemon && sudo apt-get --only-upgrade update',
        timestamp: new Date().toLocaleString()
      };

      setMitigationReport(reportPayload);
      setShowMitigationModal(true);
      setXai(null);
      fetchAll();
    } catch (e) {
      console.error("Mitigation error:", e);
    }
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('cybershield_token');
    localStorage.removeItem('cybershield_user');
    setUser(null);
  };

  return (
    <div style={s.root}>
      <Navbar
        tab={tab} setTab={setTab} online={online} stats={stats} scanning={scanning}
        user={user} onOpenAuth={() => setShowAuthModal(true)} onLogout={handleLogout}
        onOpenPitchPad={() => setShowPitchPad(true)}
      />

      <main style={s.main}>
        {loading ? (
          <div style={s.loader}>
            <div style={s.spin}/>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.82rem', color:'#00f0ff' }}>
              Connecting to CyberShield AI Engine…
            </p>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:'.68rem', color:'#475569' }}>
              Loading vulnerability database · asset inventory · risk metrics
            </p>
          </div>
        ) : (
          <div className="anim-fadeup">
            {tab==='dashboard'  && <Dashboard stats={stats} risks={risks} goto={setTab} onOpenCopilot={() => setShowCopilot(true)} onOpenPitchPad={() => setShowPitchPad(true)} onResolve={handleResolve} />}
            {tab==='aicopilot'  && <AICopilotDrawer API={API} onClose={()=>setTab('dashboard')} onResolve={handleResolve} />}
            {tab==='assets'     && <AssetManager assets={assets} onCreate={createAsset} risks={risks}/>}
            {tab==='prioritize' && <RiskPrioritizer risks={risks} onXai={setXai} onResolve={handleResolve} />}
            {tab==='scanner'    && (
              <ScannerPanel
                API={API}
                onDone={fetchAll}
                onScanStart={()=>setScanning(true)}
                onScanEnd={()=>setScanning(false)}
              />
            )}
            {tab==='evaluation' && <EvaluationPanel metrics={metrics} onOpenPitchPad={() => setShowPitchPad(true)}/>}
            {tab==='report'     && <ReportPanel stats={stats} risks={risks} metrics={metrics}/>}
          </div>
        )}
      </main>

      <footer style={s.footer}>
        CyberShield AI — Intelligent Vulnerability Assessment &amp; Risk Prioritization &nbsp;|&nbsp;
        IEEE Research Platform &nbsp;|&nbsp; AI Copilot Active &nbsp;|&nbsp; v1.0
      </footer>

      {/* Floating CyberShield AI Copilot Trigger Button */}
      <button
        onClick={() => setShowCopilot(true)}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 120,
          background: 'linear-gradient(135deg, #00f0ff, #8b5cf6)',
          border: '1px solid rgba(255,255,255,0.4)', borderRadius: 99,
          padding: '12px 20px', color: '#fff', cursor: 'pointer',
          boxShadow: '0 6px 24px rgba(0,240,255,0.4), 0 0 40px rgba(139,92,246,0.3)',
          fontFamily: "'JetBrains Mono',monospace", fontSize: '.82rem', fontWeight: 800,
          display: 'flex', alignItems: 'center', gap: 8, transition: 'all .2s ease'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0) scale(1)'}
      >
        <span style={{ fontSize: '1.1rem', animation: 'pulse 1.5s ease infinite' }}>🤖</span>
        <span>AI Copilot</span>
      </button>

      {xai && <XAIDrawer risk={xai} onClose={()=>setXai(null)} onResolve={handleResolve}/>}

      {showAuthModal && (
        <AuthModal
          API={API}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {showCopilot && (
        <AICopilotDrawer
          API={API}
          onClose={() => setShowCopilot(false)}
          onResolve={handleResolve}
        />
      )}

      {/* Faculty Defense & Viva Pitch Pad Modal */}
      <FacultyPitchPadModal
        isOpen={showPitchPad}
        onClose={() => setShowPitchPad(false)}
        onNavigateTab={(targetTab) => {
          setShowPitchPad(false);
          setTab(targetTab);
        }}
      />

      {/* Mitigation Execution Mini Audit Report Modal Popup */}
      <MitigationReportModal
        isOpen={showMitigationModal}
        onClose={() => setShowMitigationModal(false)}
        reportData={mitigationReport}
      />
    </div>
  );
}
