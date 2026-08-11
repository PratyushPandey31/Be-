import React from 'react';
import { Shield, AlertCircle, Cpu, Zap, Activity, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function DashboardStats({ stats, onNavigateToRisk }) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: System Health Index */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-mono text-gray-400">AVERAGE RISK INDEX</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.average_system_risk} <span className="text-xs text-gray-400 font-normal">/ 100</span></h3>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden mt-2">
            <div 
              className="bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 h-1.5 rounded-full" 
              style={{ width: `${stats.average_system_risk}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> Multi-factor AI weighted score
          </p>
        </div>

        {/* Metric 2: Active Vulnerabilities */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-mono text-gray-400">ACTIVE FINDINGS</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.active_vulnerabilities}</h3>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex gap-2 mt-3 font-mono text-xs">
            <span className="text-rose-400 font-semibold">{stats.threat_distribution.CRITICAL} Critical</span>
            <span className="text-gray-500">•</span>
            <span className="text-amber-400">{stats.threat_distribution.HIGH} High</span>
          </div>
        </div>

        {/* Metric 3: Monitored Network Assets */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-mono text-gray-400">REGISTERED ASSETS</p>
              <h3 className="text-3xl font-bold text-white mt-1">{stats.total_assets}</h3>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 font-mono">100% Topologically mapped</p>
        </div>

        {/* Metric 4: AI Prioritization Rate */}
        <div className="glass-panel p-5 relative overflow-hidden">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-xs font-mono text-gray-400">XAI DECISION ENGINE</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-1">99.4%</h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> SHAP feature explainability active
          </p>
        </div>

      </div>

      {/* Top 3 Critical Risks Spotlight */}
      <div className="glass-panel p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
              Top Priority Threat Action Vector
            </h2>
            <p className="text-xs text-gray-400">Prioritized by CyberShield AI using EPSS, CVSS, Exposure & Business Criticality</p>
          </div>
          <button 
            onClick={onNavigateToRisk}
            className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
          >
            View All Prioritized Risks <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {stats.top_urgent_risks.map((item) => (
            <div key={item.finding_id} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-cyan-400 font-semibold">{item.vulnerability.cve_id}</span>
                  <span className="text-xs text-gray-300 font-medium">{item.vulnerability.title}</span>
                  <span className={`badge badge-${item.ai_risk.threat_tier.toLowerCase()}`}>
                    {item.ai_risk.threat_tier}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Target: <span className="text-gray-200">{item.asset.name} ({item.asset.ip})</span> • Zone: <span className="text-gray-300">{item.asset.exposure}</span>
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-400 font-mono">AI Risk Score</p>
                  <p className="text-xl font-bold text-rose-400 font-mono">{item.ai_risk.risk_score} / 100</p>
                </div>
                <button 
                  onClick={onNavigateToRisk}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-mono transition-all"
                >
                  Analyze XAI
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
