import React, { useState } from 'react';
import { Radar, Play, Terminal, Shield, CheckCircle2, Cpu, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ScannerAndEvaluation({ onScanComplete }) {
  const [targetSubnet, setTargetSubnet] = useState('10.0.0.0/24');
  const [scanDepth, setScanDepth] = useState('Deep Nmap + OpenVAS');
  const [scanning, setScanning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [evalMetrics, setEvalMetrics] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('scanner');

  const runScanner = async () => {
    setScanning(true);
    setLogs([]);
    try {
      const res = await fetch('http://localhost:8000/api/scan/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_subnet: targetSubnet, scan_depth: scanDepth })
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        if (onScanComplete) onScanComplete();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const fetchEval = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/evaluation/metrics');
      if (res.ok) {
        const data = await res.json();
        setEvalMetrics(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    fetchEval();
  }, []);

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveSubTab('scanner')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'scanner'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radar className="w-4 h-4 text-cyan-400" /> Automated Vulnerability Scanner
          </button>
          <button
            onClick={() => setActiveSubTab('evaluation')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              activeSubTab === 'evaluation'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-400" /> IEEE Performance Evaluation Benchmarks
          </button>
        </div>
      </div>

      {activeSubTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scan Controls */}
          <div className="glass-panel p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radar className="w-5 h-5 text-cyan-400" /> Trigger Network Scan
            </h3>
            <p className="text-xs text-gray-400">Automated port discovery, service enumeration, & CVE matching engine</p>

            <div className="space-y-3 pt-2 text-xs font-mono">
              <div>
                <label className="block text-gray-400 mb-1">Target Network Range</label>
                <input
                  type="text"
                  value={targetSubnet}
                  onChange={(e) => setTargetSubnet(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Scan Profile & Feed</label>
                <select
                  value={scanDepth}
                  onChange={(e) => setScanDepth(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-white focus:border-cyan-500 outline-none"
                >
                  <option value="Quick SYN Discovery">Quick SYN Discovery (Nmap)</option>
                  <option value="Deep Nmap + OpenVAS">Deep Nmap + OpenVAS CVE Query</option>
                  <option value="Full AI Risk Prioritization">Full AI Risk Prioritization</option>
                </select>
              </div>

              <button
                onClick={runScanner}
                disabled={scanning}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black font-sans font-bold text-xs hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-4 shadow-lg shadow-cyan-500/20"
              >
                {scanning ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    Scanning Subnet...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-black" /> Run Automated Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Live Scanner Terminal Output */}
          <div className="glass-panel p-6 lg:col-span-2 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-white/10 text-gray-400">
              <span className="flex items-center gap-1.5"><Terminal className="w-4 h-4 text-cyan-400" /> Scanner CLI Output</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-500">Nmap v7.94 / OpenVAS / CyberShield AI</span>
                {logs.length > 0 && !scanning && (
                  <button
                    onClick={() => window.open('http://localhost:8000/api/report/benchmark-accuracy-pdf', '_blank')}
                    className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold text-[11px] hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
                  >
                    📥 Download Accuracy Report (PDF)
                  </button>
                )}
              </div>
            </div>

            <div className="h-64 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-white/5 space-y-2">
              {logs.length === 0 ? (
                <div className="text-gray-500 italic py-8 text-center">
                  Press 'Run Automated Scan' to trigger asset discovery and vulnerability feed ingestion.
                </div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="flex gap-2 leading-relaxed">
                    <span className="text-gray-500">[{log.timestamp}]</span>
                    <span className={`font-semibold ${
                      log.level === 'SUCCESS' ? 'text-emerald-400' :
                      log.level === 'NMAP' ? 'text-cyan-400' :
                      log.level === 'OPENVAS' ? 'text-purple-400' :
                      log.level === 'AI_ENGINE' ? 'text-amber-400' : 'text-gray-300'
                    }`}>
                      [{log.level}]
                    </span>
                    <span className="text-gray-200">{log.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'evaluation' && evalMetrics && (
        <div className="space-y-6">
          <div className="glass-panel p-6 space-y-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Comparative Evaluation: CyberShield AI vs. Conventional CVSS Prioritization
            </h3>
            <p className="text-xs text-gray-400">Quantitative benchmark metrics for IEEE publication and conference defense</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Conventional CVSS Method */}
            <div className="glass-panel p-6 border-rose-500/20 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h4 className="font-bold text-rose-400 font-mono text-sm">Conventional CVSS-Only Prioritization</h4>
                <span className="text-xs text-gray-400">Baseline Standard</span>
              </div>
              
              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-gray-300 mb-1">
                    <span>Alert Fatigue Index (High False Urgency)</span>
                    <span className="text-rose-400 font-bold">{evalMetrics.conventional_cvss_only.alert_fatigue_index}%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${evalMetrics.conventional_cvss_only.alert_fatigue_index}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-400">Mean Time to Remediate (MTTR):</span>
                  <span className="text-white font-bold">{evalMetrics.conventional_cvss_only.mean_time_to_remediate_hours} Hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Critical Focus Efficiency:</span>
                  <span className="text-rose-400 font-bold">{evalMetrics.conventional_cvss_only.critical_focus_percentage}%</span>
                </div>
              </div>
            </div>

            {/* CyberShield AI Method */}
            <div className="glass-panel p-6 border-emerald-500/30 space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-white/10">
                <h4 className="font-bold text-emerald-400 font-mono text-sm">CyberShield AI Multi-Factor XAI Framework</h4>
                <span className="badge badge-low">Proposed Solution</span>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div>
                  <div className="flex justify-between text-gray-300 mb-1">
                    <span>Alert Fatigue Index (Optimized)</span>
                    <span className="text-emerald-400 font-bold">{evalMetrics.cybershield_ai_framework.alert_fatigue_index}%</span>
                  </div>
                  <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${evalMetrics.cybershield_ai_framework.alert_fatigue_index}%` }}></div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-400">Mean Time to Remediate (MTTR):</span>
                  <span className="text-emerald-400 font-bold">{evalMetrics.cybershield_ai_framework.mean_time_to_remediate_hours} Hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Critical Focus Efficiency:</span>
                  <span className="text-emerald-400 font-bold">{evalMetrics.cybershield_ai_framework.critical_focus_percentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Gain Banner */}
          <div className="glass-panel p-6 bg-gradient-to-r from-purple-950/30 to-cyan-950/30 border-purple-500/30 grid grid-cols-1 md:grid-cols-3 gap-4 text-center font-mono">
            <div>
              <p className="text-xs text-gray-400">REMEDIATION SPEED</p>
              <p className="text-2xl font-bold text-cyan-400 mt-1">{evalMetrics.performance_gains.remediation_speedup}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">FATIGUE REDUCTION</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{evalMetrics.performance_gains.fatigue_reduction}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">PRECISION BOOST</p>
              <p className="text-2xl font-bold text-purple-400 mt-1">{evalMetrics.performance_gains.accuracy_improvement}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
