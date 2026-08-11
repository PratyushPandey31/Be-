import React, { useState, useEffect, useRef } from 'react';

const M = { fontFamily: "'JetBrains Mono', monospace" };

export default function AICopilot({ API, risks, onRefresh }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "### 🤖 CyberShield Autonomous AI Copilot Engine v2.5\n\nWelcome back, Agent. I am monitoring your **network infrastructure, CVE databases, and SHAP XAI feature attribution models** in real-time.\n\nSelect a quick diagnostic prompt or execute 1-click remediation below.",
      patch_code: null,
      attack_vector: null,
      suggested_actions: [
        "⚠️ Show Top Critical Vulnerability",
        "💻 Generate Auto-Patch Code",
        "⚔️ Simulate Attack Vector Graph",
        "📊 Explain IEEE AI Performance"
      ]
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [attackPathData, setAttackPathData] = useState(null);
  const [remediating, setRemediating] = useState(false);
  const [remediatedIds, setRemediatedIds] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    fetchAttackPath();
  }, []);

  const fetchAttackPath = async () => {
    try {
      const res = await fetch(`${API}/ai/attack-path`);
      if (res.ok) setAttackPathData(await res.json());
    } catch (e) {
      console.error("Attack path fetch failed", e);
    }
  };

  const handleSend = async (textToSend = null, findingId = null) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    const userMsgObj = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsgObj]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, finding_id: findingId })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: data.response,
            patch_code: data.patch_code,
            attack_vector: data.attack_vector,
            suggested_actions: data.suggested_actions
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { id: Date.now() + 1, sender: 'ai', text: "⚠️ Error contacting CyberShield AI engine. Please verify backend server." }
        ]);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'ai', text: "⚠️ Network connection error to AI service." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoRemediate = async (findingId) => {
    if (!findingId) return;
    setRemediating(true);
    try {
      const res = await fetch(`${API}/ai/remediate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finding_id: findingId, auto_apply: true })
      });
      if (res.ok) {
        const data = await res.json();
        setRemediatedIds(prev => new Set(prev).add(findingId));
        if (onRefresh) onRefresh();

        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'ai',
            text: `✅ **REMEDIATION EXECUTED SUCCESSFULLY!**\n\nVulnerability \`${data.cve_id}\` on target host \`${data.hostname}\` has been isolated and updated to **RESOLVED** state in SQLite Database.`,
            patch_code: data.remediation_script,
            suggested_actions: ["⚠️ Show Top Critical Vulnerability", "⚔️ Simulate Attack Vector Graph"]
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRemediating(false);
    }
  };

  const copyToClipboard = (text, msgId) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 20 }} className="anim-fadeup">

      {/* LEFT COLUMN: Conversational AI Copilot Chat & Script Terminal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Futuristic Glassmorphic AI Header */}
        <div className="card" style={{
          padding: '22px 26px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(0,240,255,0.10) 100%)',
          border: '1px solid rgba(0,240,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: 'linear-gradient(135deg, #00f0ff, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', boxShadow: '0 0 24px rgba(0,240,255,0.5)',
              animation: 'pulse 2s ease infinite'
            }}>
              🤖
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.3px', margin: 0 }}>
                  CyberShield Autonomous AI Copilot
                </h2>
                <span style={{
                  ...M, fontSize: '.64rem', padding: '3px 9px', borderRadius: 6,
                  background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(16,185,129,0.4)',
                  color: '#34d399', fontWeight: 800
                }}>
                  ● ONLINE &amp; ACTIVE
                </span>
              </div>
              <p style={{ fontSize: '.8rem', color: '#94a3b8', marginTop: 4 }}>
                Real-time Threat Reasoning · SHAP Feature Attribution · Automated Code Generation
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => handleSend("⚠️ Show Top Critical Vulnerability")}
              className="btn btn-primary btn-sm"
              style={{ padding: '8px 14px', fontSize: '.76rem', borderRadius: 10 }}
            >
              ⚡ Top Threat
            </button>
            <button
              onClick={() => handleSend("⚔️ Simulate Attack Vector Graph")}
              className="btn btn-secondary btn-sm"
              style={{ padding: '8px 14px', fontSize: '.76rem', borderRadius: 10 }}
            >
              ⚔️ Attack Chain
            </button>
          </div>
        </div>

        {/* Main Chat Feed */}
        <div className="card" style={{
          height: 520, overflowY: 'auto', padding: 22,
          display: 'flex', flexDirection: 'column', gap: 18,
          background: 'rgba(3,7,18,0.7)', border: '1px solid rgba(255,255,255,0.08)'
        }}>
          {messages.map((m) => (
            <div key={m.id} style={{
              display: 'flex', flexDirection: 'column',
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: 8
            }}>
              <div style={{
                maxWidth: '88%',
                background: m.sender === 'user'
                  ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
                  : 'rgba(15,23,42,0.92)',
                border: m.sender === 'user'
                  ? 'none'
                  : '1px solid rgba(255,255,255,0.12)',
                borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                padding: '16px 20px',
                color: '#fff', fontSize: '.86rem', lineHeight: 1.65,
                boxShadow: m.sender === 'user'
                  ? '0 4px 20px rgba(59,130,246,0.35)'
                  : '0 4px 24px rgba(0,0,0,0.4)'
              }}>
                <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>

                {/* Attack Vector Flow Card */}
                {m.attack_vector && (
                  <div style={{
                    marginTop: 14, padding: '12px 16px', borderRadius: 10,
                    background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#fca5a5', fontSize: '.76rem', ...M, display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <span>⚔️</span>
                    <div>
                      <strong style={{ color: '#ef4444' }}>Simulated Attack Vector:</strong>
                      <div style={{ marginTop: 2, color: '#fee2e2' }}>{m.attack_vector}</div>
                    </div>
                  </div>
                )}

                {/* Code Terminal Display */}
                {m.patch_code && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#090d16', padding: '8px 14px', borderRadius: '10px 10px 0 0',
                      border: '1px solid rgba(0,240,255,0.25)', borderBottom: 'none'
                    }}>
                      <span style={{ ...M, fontSize: '.7rem', color: '#00f0ff', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                        💻 AI Executable Remediation Script
                      </span>
                      <button
                        onClick={() => copyToClipboard(m.patch_code, m.id)}
                        style={{
                          background: 'rgba(0,240,255,0.1)', border: '1px solid rgba(0,240,255,0.3)',
                          borderRadius: 6, color: '#67e8f9', fontSize: '.66rem', padding: '3px 8px',
                          cursor: 'pointer', ...M, fontWeight: 700
                        }}
                      >
                        {copiedId === m.id ? '✓ COPIED!' : '📋 COPY SCRIPT'}
                      </button>
                    </div>
                    <pre style={{
                      ...M, fontSize: '.74rem', background: '#020617', padding: 16,
                      borderRadius: '0 0 10px 10px', border: '1px solid rgba(0,240,255,0.25)',
                      color: '#a7f3d0', overflowX: 'auto', margin: 0, lineHeight: 1.55,
                      boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)'
                    }}>
                      {m.patch_code}
                    </pre>
                  </div>
                )}
              </div>

              {/* Action Chips */}
              {m.suggested_actions && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {m.suggested_actions.map((act, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(act)}
                      style={{
                        padding: '5px 12px', borderRadius: 20,
                        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.14)',
                        color: '#cbd5e1', fontSize: '.72rem', cursor: 'pointer',
                        transition: 'all .2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.borderColor = '#00f0ff';
                        e.target.style.color = '#00f0ff';
                        e.target.style.background = 'rgba(0,240,255,0.08)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.borderColor = 'rgba(255,255,255,0.14)';
                        e.target.style.color = '#cbd5e1';
                        e.target.style.background = 'rgba(255,255,255,0.04)';
                      }}
                    >
                      💡 {act}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', background: 'rgba(0,240,255,0.05)', borderRadius: 12, border: '1px solid rgba(0,240,255,0.2)', width: 'fit-content' }}>
              <div style={{ width: 16, height: 16, border: '2px solid #00f0ff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
              <span style={{ ...M, fontSize: '.78rem', color: '#00f0ff', fontWeight: 700 }}>
                CyberShield AI Analyzing Live Telemetry &amp; SHAP Metrics...
              </span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          style={{ display: 'flex', gap: 10 }}
        >
          <input
            type="text"
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder="Ask AI Copilot (e.g. 'Fix CVE-2024-3094', 'Explain risk score', 'Show attack graph')..."
            style={{
              flex: 1, padding: '14px 20px', background: 'rgba(15,23,42,0.9)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14,
              color: '#fff', fontSize: '.88rem', outline: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputMsg.trim()}
            style={{
              padding: '14px 28px',
              background: loading || !inputMsg.trim()
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #00f0ff 0%, #3b82f6 100%)',
              border: 'none', borderRadius: 14,
              color: loading || !inputMsg.trim() ? '#64748b' : '#000',
              fontWeight: 900, fontSize: '.88rem', cursor: loading || !inputMsg.trim() ? 'not-allowed' : 'pointer',
              boxShadow: loading || !inputMsg.trim() ? 'none' : '0 0 20px rgba(0,240,255,0.4)'
            }}
          >
            Ask AI 🚀
          </button>
        </form>
      </div>

      {/* RIGHT COLUMN: 1-Click AI Auto-Remediate Studio & Threat Graph */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* 1-Click AI Auto-Remediate Studio Card */}
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚡ 1-Click AI Auto-Fix Studio
            </h3>
            <span style={{ ...M, fontSize: '.62rem', fontWeight: 800, padding: '2px 8px', borderRadius: 5, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', color: '#c4b5fd' }}>
              AUTONOMOUS
            </span>
          </div>

          <p style={{ fontSize: '.76rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            Select an active vulnerability to trigger CyberShield AI automated remediation:
          </p>

          <select
            onChange={(e) => {
              const fid = parseInt(e.target.value);
              const found = risks?.find(r => r.finding_id === fid);
              setSelectedFinding(found);
            }}
            style={{
              width: '100%', padding: '12px 14px', background: '#090d16',
              border: '1px solid rgba(0,240,255,0.25)', borderRadius: 12,
              color: '#fff', fontSize: '.8rem', ...M, outline: 'none'
            }}
          >
            <option value="">-- Select Active Finding --</option>
            {risks?.map(r => {
              const cve = r.vulnerability?.cve_id || r.cve_id || 'CVE';
              const host = r.asset?.name || r.hostname || 'Host';
              const tier = r.ai_risk?.threat_tier || r.risk_level || 'HIGH';
              const score = r.ai_risk?.risk_score || r.final_risk_score || 0;
              return (
                <option key={r.finding_id} value={r.finding_id}>
                  {remediatedIds.has(r.finding_id) ? '✓ RESOLVED: ' : ''}{cve} - {host} ({tier} Risk: {score}/100)
                </option>
              );
            })}
          </select>

          {selectedFinding ? (
            <div style={{
              background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,240,255,0.2)',
              borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 12
            }}>
              {(() => {
                const cve = selectedFinding.vulnerability?.cve_id || selectedFinding.cve_id || 'CVE';
                const host = selectedFinding.asset?.name || selectedFinding.hostname || 'Target Server';
                const ip = selectedFinding.asset?.ip || selectedFinding.ip_address || '10.0.0.1';
                const tier = selectedFinding.ai_risk?.threat_tier || selectedFinding.risk_level || 'CRITICAL';
                const score = selectedFinding.ai_risk?.risk_score || selectedFinding.final_risk_score || 0;
                return (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#67e8f9', fontSize: '.92rem' }}>
                        {cve}
                      </span>
                      <span style={{
                        ...M, fontSize: '.68rem', fontWeight: 800, padding: '3px 9px', borderRadius: 6,
                        background: tier === 'CRITICAL' ? 'rgba(239,68,68,0.25)' : 'rgba(249,115,22,0.25)',
                        color: tier === 'CRITICAL' ? '#f87171' : '#fb923c',
                        border: `1px solid ${tier === 'CRITICAL' ? 'rgba(239,68,68,0.4)' : 'rgba(249,115,22,0.4)'}`
                      }}>
                        {tier} ({score}/100)
                      </span>
                    </div>

                    <p style={{ fontSize: '.75rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                      Target: <strong>{host}</strong> ({ip})
                    </p>
                  </>
                );
              })()}

              <button
                onClick={() => handleAutoRemediate(selectedFinding.finding_id)}
                disabled={remediating || remediatedIds.has(selectedFinding.finding_id)}
                style={{
                  width: '100%', padding: '12px',
                  background: remediatedIds.has(selectedFinding.finding_id)
                    ? 'rgba(16,185,129,0.2)'
                    : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: remediatedIds.has(selectedFinding.finding_id)
                    ? '1px solid rgba(16,185,129,0.5)'
                    : 'none',
                  borderRadius: 10,
                  color: remediatedIds.has(selectedFinding.finding_id) ? '#34d399' : '#fff',
                  fontWeight: 900, fontSize: '.82rem', cursor: remediating || remediatedIds.has(selectedFinding.finding_id) ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: remediatedIds.has(selectedFinding.finding_id) ? 'none' : '0 4px 16px rgba(16,185,129,0.4)'
                }}
              >
                {remediating
                  ? '🔄 Executing AI Patch...'
                  : remediatedIds.has(selectedFinding.finding_id)
                  ? '✓ REMEDIATED & RESOLVED IN DB'
                  : '🛡️ Execute AI Remediation Fix'}
              </button>
            </div>
          ) : (
            <div style={{
              padding: 20, border: '1px dashed rgba(255,255,255,0.12)', borderRadius: 12,
              textAlign: 'center', fontSize: '.76rem', color: '#64748b'
            }}>
              Choose a vulnerability finding above to auto-generate &amp; apply fix
            </div>
          )}
        </div>

        {/* AI Threat Graph Visualizer Card */}
        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 900, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              ⚔️ AI Threat Chain Graph
            </h3>
            <button
              onClick={fetchAttackPath}
              style={{ background: 'none', border: 'none', color: '#67e8f9', fontSize: '.72rem', cursor: 'pointer', ...M }}
            >
              🔄 Refresh
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {attackPathData?.nodes?.map((n) => (
              <div key={n.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: n.type === 'attacker'
                  ? 'rgba(239,68,68,0.12)'
                  : n.type === 'gateway'
                  ? 'rgba(59,130,246,0.12)'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${
                  n.type === 'attacker'
                    ? 'rgba(239,68,68,0.35)'
                    : n.type === 'gateway'
                    ? 'rgba(59,130,246,0.35)'
                    : 'rgba(255,255,255,0.08)'
                }`,
                borderRadius: 12, padding: '12px 14px'
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: n.type === 'attacker' ? '#ef4444' : n.type === 'gateway' ? '#3b82f6' : '#8b5cf6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', color: '#fff'
                }}>
                  {n.type === 'attacker' ? '🥷' : n.type === 'gateway' ? '🌐' : '💻'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '.78rem', fontWeight: 700, color: '#fff' }}>{n.label}</div>
                  {n.ip && <div style={{ ...M, fontSize: '.64rem', color: '#94a3b8', marginTop: 2 }}>{n.ip}</div>}
                </div>
                {n.risk_score && (
                  <span style={{ ...M, fontSize: '.68rem', color: '#f87171', fontWeight: 800 }}>
                    {n.risk_score}/100
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
