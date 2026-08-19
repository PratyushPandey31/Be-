import React from 'react';
import { FileText, Printer, Shield, CheckCircle2, Cpu, Download } from 'lucide-react';

export default function ReportGenerator({ stats, prioritizedRisks }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            Executive & IEEE Conference Publication Report
          </h2>
          <p className="text-xs text-gray-400">Exportable research report and security posture evaluation summary</p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => window.open('http://localhost:8000/api/report/benchmark-accuracy-pdf', '_blank')}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold text-xs hover:opacity-90 shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Download className="w-4 h-4" /> Download Nessus &amp; OpenVAS Accuracy Report (PDF)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 text-black font-semibold text-xs hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all"
          >
            <Printer className="w-4 h-4" /> Print / Export IEEE Summary PDF
          </button>
        </div>
      </div>

      {/* Printable Report Document */}
      <div className="glass-panel p-8 space-y-6 text-gray-200 print:bg-white print:text-black print:p-0">
        
        {/* Title Banner */}
        <div className="border-b border-white/10 pb-6 print:border-black/20">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase font-semibold">IEEE Security Research Report</span>
              <h1 className="text-2xl font-bold text-white mt-1 print:text-black">CyberShield AI: Intelligent Vulnerability Assessment & Risk Prioritization</h1>
              <p className="text-xs text-gray-400 mt-1 print:text-gray-600">Automated Multi-Factor Explainable AI Risk Scoring System</p>
            </div>
            <div className="text-right font-mono text-xs text-gray-400 print:text-gray-600">
              <p>Generated: {new Date().toLocaleDateString()}</p>
              <p>Status: CONFIDENTIAL</p>
            </div>
          </div>
        </div>

        {/* Abstract */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold font-mono text-cyan-400 print:text-black uppercase">Executive Abstract</h3>
          <p className="text-xs leading-relaxed text-gray-300 print:text-gray-800">
            This technical document provides an intelligent evaluation of organization-wide cybersecurity posture using the CyberShield AI framework. 
            By integrating traditional vulnerability severity (CVSS v3.1) with Exploit Prediction Scoring System (EPSS), network exposure topology, 
            and asset business criticality, the framework removes decision fatigue for security operation teams through Explainable AI (XAI) feature attribution.
          </p>
        </div>

        {/* System Evaluation Metrics */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 font-mono text-xs border py-4 px-4 rounded-xl border-white/10 print:border-black/20">
            <div>
              <span className="text-gray-400">Total Assets Mapped:</span>
              <p className="text-lg font-bold text-white print:text-black">{stats.total_assets}</p>
            </div>
            <div>
              <span className="text-gray-400">Active Vulnerabilities:</span>
              <p className="text-lg font-bold text-amber-400 print:text-black">{stats.active_vulnerabilities}</p>
            </div>
            <div>
              <span className="text-gray-400">System Risk Index:</span>
              <p className="text-lg font-bold text-rose-400 print:text-black">{stats.average_system_risk} / 100</p>
            </div>
          </div>
        )}

        {/* Priority Action Roadmap Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold font-mono text-cyan-400 print:text-black uppercase">Critical Risk Prioritization Matrix</h3>
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="border-b border-white/10 font-mono text-gray-400 print:border-black print:text-black">
                <th className="py-2">CVE ID</th>
                <th className="py-2">Target Asset</th>
                <th className="py-2">Tier</th>
                <th className="py-2">AI Score</th>
                <th className="py-2">Action Required</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 print:divide-black/10">
              {prioritizedRisks.map((item) => (
                <tr key={item.finding_id}>
                  <td className="py-2.5 font-mono text-cyan-400 print:text-black font-semibold">{item.vulnerability.cve_id}</td>
                  <td className="py-2.5 text-gray-200 print:text-black">{item.asset.name} ({item.asset.ip})</td>
                  <td className="py-2.5 font-mono">{item.ai_risk.threat_tier}</td>
                  <td className="py-2.5 font-mono font-bold text-rose-400 print:text-black">{item.ai_risk.risk_score}</td>
                  <td className="py-2.5 text-gray-300 print:text-black text-[11px]">{item.ai_risk.priority_code}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Signoff block */}
        <div className="pt-8 border-t border-white/10 flex justify-between text-xs font-mono text-gray-400 print:border-black/20 print:text-black">
          <div>
            <p>Framework Developer: CyberShield AI System</p>
            <p>Verification Method: Multi-Factor XAI Algorithm</p>
          </div>
          <div className="text-right">
            <p>Approved By: Chief Information Security Officer (CISO)</p>
            <p>Signature: __________________________</p>
          </div>
        </div>

      </div>
    </div>
  );
}
