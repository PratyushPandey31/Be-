import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AICopilot from './components/AICopilot';
import AssetManager from './components/AssetManager';
import RiskPrioritizer from './components/RiskPrioritizer';
import ScannerPanel from './components/ScannerPanel';
import EvaluationPanel from './components/EvaluationPanel';
import ReportPanel from './components/ReportPanel';
import XAIDrawer from './components/XAIDrawer';
import AuthModal from './components/AuthModal';

const API = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : 'http://127.0.0.1:8000/api';

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
  const [user, setUser]         = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  const handleResolve = async (findingId) => {
    const r = await fetch(`${API}/findings/${findingId}/status`, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ status:'RESOLVED' })
    });
    if(r.ok) { setXai(null); fetchAll(); }
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

  // If user is not logged in, force Sign In / Register UI first
  if (!user) {
    return (
      <div style={{ ...s.root, background: '#020612', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <AuthModal
          API={API}
          onLoginSuccess={handleLoginSuccess}
          onClose={null}
        />
      </div>
    );
  }

  return (
    <div style={s.root}>
      <Navbar
        tab={tab} setTab={setTab} online={online} stats={stats} scanning={scanning}
        user={user} onOpenAuth={() => setShowAuthModal(true)} onLogout={handleLogout}
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
            {tab==='dashboard'  && <Dashboard  stats={stats} risks={risks} goto={setTab}/>}
            {tab==='aicopilot'  && <AICopilot  API={API} risks={risks} onRefresh={fetchAll}/>}
            {tab==='assets'     && <AssetManager assets={assets} onCreate={createAsset} risks={risks}/>}
            {tab==='prioritize' && <RiskPrioritizer risks={risks} onXai={setXai}/>}
            {tab==='scanner'    && (
              <ScannerPanel
                API={API}
                onDone={fetchAll}
                onScanStart={()=>setScanning(true)}
                onScanEnd={()=>setScanning(false)}
              />
            )}
            {tab==='evaluation' && <EvaluationPanel metrics={metrics}/>}
            {tab==='report'     && <ReportPanel stats={stats} risks={risks} metrics={metrics}/>}
          </div>
        )}
      </main>

      <footer style={s.footer}>
        CyberShield AI — Intelligent Vulnerability Assessment &amp; Risk Prioritization &nbsp;|&nbsp;
        IEEE Research Platform &nbsp;|&nbsp; JWT Auth Active &nbsp;|&nbsp; v1.0
      </footer>

      {xai && <XAIDrawer risk={xai} onClose={()=>setXai(null)} onResolve={handleResolve}/>}

      {showAuthModal && (
        <AuthModal
          API={API}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
