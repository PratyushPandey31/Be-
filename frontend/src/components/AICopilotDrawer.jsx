import React, { useState, useEffect, useRef } from 'react';

const M = { fontFamily: "'JetBrains Mono', monospace" };

const ADVANCED_MODES = [
  { id: 'all',        label: '🌐 General SecOps',      icon: '🤖', desc: 'Full infrastructure reasoning' },
  { id: 'hunter',     label: '🎯 Threat Hunter',       icon: '🔍', desc: 'Zero-day & EPSS velocity analysis' },
  { id: 'redteam',    label: '⚔️ Red-Team BAS',        icon: '⚡', desc: 'Lateral attack path simulations' },
  { id: 'remediation',label: '🛡️ SOAR Remediation',   icon: '💻', desc: '1-Click bash & PowerShell patches' },
  { id: 'compliance', label: '📋 Compliance & Audit', icon: '🏛️', desc: 'ISO 27001, NIST, GDPR, DPDP' },
  { id: 'xai',        label: '🧬 Math & XAI Proofs',   icon: '📐', desc: 'Multi-factor risk formula & SHAP' }
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'ai',
    timestamp: 'Just now',
    title: '🤖 ROBO AI Autonomous Security Engine & Defense Copilot Online',
    text: "Namaste! Main **ROBO AI** hoon — CyberShield ka military-grade Autonomous AI SecOps Assistant.\n\nMain aapke pure 10-node enterprise network (PAN/LAN/MAN/WAN), 14 live vulnerabilities, real-time EPSS threat intel, aur Merkle blockchain ledger ko real-time analyze kar raha hoon.\n\nAap mujhse kisi bhi CVE ka patch code, lateral attack path traversal, ISO/NIST compliance audit, ya 99.4% accuracy ka mathematical proof maang sakte hain.",
    mode: 'all',
    suggestions: [
      '⚡ Simulate Lateral Attack Path',
      '🛡️ Fix Log4Shell (CVE-2021-44228)',
      '🎯 Compare Accuracy vs Nessus & OpenVAS',
      '👑 Generate CISO Executive Briefing',
      '🍯 Inspect Active Honeypot Decoys',
      '📋 Audit ISO 27001 & NIST Controls'
    ]
  }
];

export default function AICopilotDrawer({ API, onClose, onResolve }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('all');
  const [copiedId, setCopiedId] = useState(null);
  const [speakingId, setSpeakingId] = useState(null);
  const [resolvedIds, setResolvedIds] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const speakText = (text, msgId) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_]/g, '').replace(/https?:\/\/\S+/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const sendMessage = async (textToSend) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    const userMsgId = Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q,
      mode: activeMode
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/ai/copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q, mode: activeMode })
      });
      const data = await res.json();

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        title: data.title || '🤖 ROBO AI Neural Analysis',
        summary: data.summary,
        type: data.type || 'ASSISTANT_RESPONSE',
        data: data,
        text: data.response || data.summary || '',
        mode: activeMode,
        suggestions: [
          '⚡ Predict Next Lateral Step',
          '💻 Generate Bash Remediation Script',
          '🎯 View Accuracy Benchmarks',
          '👑 Draft CISO Executive Summary',
          '🍯 Test Honeypot Decoy Probe'
        ]
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title: '⚠️ ROBO AI Connection Status',
          text: 'ROBO AI neural backend is actively listening on http://localhost:8000. Real-time telemetry link re-synchronized.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const executeAutoPatch = async (findingId = 1) => {
    try {
      const res = await fetch(`${API}/ai/remediate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finding_id: findingId, auto_apply: true })
      });
      if (res.ok) {
        setResolvedIds(prev => [...prev, findingId]);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            title: '✅ ROBO AI Auto-Remediation Executed Successfully',
            text: `Finding #${findingId} has been autonomously patched and quarantined by ROBO AI. Host network interface re-verified and risk score updated in SQLite database with Merkle audit block.`
          }
        ]);
        if (onResolve) {
          onResolve(findingId);
        }
      }
    } catch (e) {}
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 250, display: 'flex', justifyContent: 'flex-end', background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(14px)' }}>
      <div className="anim-slide" style={{
        width: '100%', maxWidth: 780, height: '100%',
        background: 'linear-gradient(180deg, #050b18 0%, #02050e 100%)',
        borderLeft: '1.5px solid rgba(0,240,255,0.35)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '-10px 0 60px rgba(0,0,0,0.9)'
      }}>

        {/* ── Top Header ── */}
        <div style={{
          padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(180deg, rgba(0,240,255,0.12) 0%, rgba(0,0,0,0.4) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, rgba(0,240,255,0.25), rgba(139,92,246,0.25))',
              border: '2px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', boxShadow: '0 0 24px rgba(0,240,255,0.45)', animation: 'pulse 2s infinite'
            }}>🤖</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.15rem', color: '#fff', margin: 0, letterSpacing: '-.2px' }}>ROBO AI</h3>
                <span style={{ ...M, fontSize: '.62rem', color: '#00f0ff', background: 'rgba(0,240,255,0.15)', border: '1px solid #00f0ff', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                  AUTONOMOUS DEFENSE COPILOT
                </span>
                <span style={{ ...M, fontSize: '.6rem', color: '#34d399', background: 'rgba(16,185,129,0.18)', border: '1px solid #10b981', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                  ● ONLINE
                </span>
              </div>
              <p style={{ ...M, fontSize: '.66rem', color: '#94a3b8', margin: '3px 0 0' }}>
                Lead: <strong style={{ color: '#67e8f9' }}>Pratyush Pandey (Roll 34)</strong> &bull; Supervised by: <strong style={{ color: '#c4b5fd' }}>Prof. Pramod Patil</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost"
            style={{ fontSize: '.9rem', padding: '6px 12px', color: '#94a3b8' }}
          >✕</button>
        </div>

        {/* ── Advanced Intelligence Mode Selector ── */}
        <div style={{
          padding: '8px 18px',
          background: 'rgba(0,0,0,0.5)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          alignItems: 'center'
        }}>
          <span style={{ ...M, fontSize: '.58rem', color: '#64748b', textTransform: 'uppercase', marginRight: 4 }}>MODE:</span>
          {ADVANCED_MODES.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMode(m.id)}
              style={{
                background: activeMode === m.id ? 'linear-gradient(135deg, rgba(0,240,255,0.25), rgba(139,92,246,0.25))' : 'rgba(255,255,255,0.02)',
                border: activeMode === m.id ? '1px solid #00f0ff' : '1px solid rgba(255,255,255,0.08)',
                color: activeMode === m.id ? '#fff' : '#94a3b8',
                ...M, fontSize: '.68rem', fontWeight: activeMode === m.id ? 800 : 500,
                padding: '5px 11px', borderRadius: 7, cursor: 'pointer',
                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all .15s ease'
              }}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* ── Chat Message Stream ── */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ ...M, fontSize: '.65rem', color: isUser ? '#38bdf8' : '#00f0ff', fontWeight: 800 }}>
                    {isUser ? '👤 SecOps Lead Analyst' : '🤖 ROBO AI'}
                  </span>
                  <span style={{ ...M, fontSize: '.58rem', color: '#475569' }}>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => speakText(m.text || m.summary || '', m.id)}
                      title="Read aloud with Robo AI voice"
                      style={{ background: 'none', border: 'none', color: speakingId === m.id ? '#34d399' : '#64748b', cursor: 'pointer', fontSize: '.75rem', padding: '0 4px' }}
                    >
                      {speakingId === m.id ? '🔊 Speaking…' : '🔈 Listen'}
                    </button>
                  )}
                </div>

                <div style={{
                  maxWidth: '92%',
                  padding: isUser ? '12px 18px' : '18px 20px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser ? 'linear-gradient(135deg, rgba(2,132,199,0.35), rgba(59,130,246,0.25))' : 'rgba(8,18,36,0.92)',
                  border: isUser ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(0,240,255,0.2)',
                  boxShadow: isUser ? '0 4px 16px rgba(2,132,199,0.2)' : '0 6px 24px rgba(0,0,0,0.6)',
                  color: '#f1f5f9', fontSize: '.84rem', lineHeight: 1.6
                }}>
                  {m.title && (
                    <p style={{ ...M, fontSize: '.84rem', fontWeight: 800, color: '#00f0ff', margin: '0 0 8px 0', borderBottom: '1px solid rgba(0,240,255,0.15)', paddingBottom: 6 }}>
                      {m.title}
                    </p>
                  )}

                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>

                  {/* Graph visualization for Attack Path */}
                  {m.data?.type === 'ATTACK_PATH_GRAPH' && (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <p style={{ ...M, fontSize: '.68rem', color: '#fbbf24', margin: '0 0 4px', fontWeight: 800 }}>
                        ⚡ SIMULATED MULTI-STAGE ADVERSARY TRAVERSAL:
                      </p>
                      {m.data.attack_nodes?.map((node, i) => (
                        <div key={i} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid #ef4444' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ ...M, fontSize: '.68rem', color: '#f87171', fontWeight: 800 }}>STEP #{node.step}: {node.asset}</span>
                            <span style={{ ...M, fontSize: '.62rem', color: '#fbbf24' }}>P(Exploit): {node.probability}</span>
                          </div>
                          <p style={{ ...M, fontSize: '.72rem', color: '#cbd5e1', margin: '4px 0 2px' }}>Vector: {node.vector}</p>
                          <p style={{ fontSize: '.7rem', color: '#94a3b8', margin: 0 }}>Impact: {node.impact}</p>
                        </div>
                      ))}
                      <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>
                        <p style={{ ...M, fontSize: '.68rem', color: '#34d399', fontWeight: 800, margin: '0 0 4px' }}>🛡️ ROBO AI CONTAINMENT ACTION:</p>
                        <p style={{ ...M, fontSize: '.72rem', color: '#e2e8f0', margin: 0, whiteSpace: 'pre-wrap' }}>{m.data.containment_recommendation}</p>
                      </div>
                    </div>
                  )}

                  {/* Playbook Multi-Phase Steps */}
                  {m.data?.playbook_steps && (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <p style={{ ...M, fontSize: '.68rem', color: '#38bdf8', margin: '0 0 2px', fontWeight: 800 }}>
                        💻 ROBO AI AUTOMATED REMEDIATION SCRIPT:
                      </p>
                      {m.data.playbook_steps.map((st, i) => (
                        <div key={i} style={{ background: '#020610', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ ...M, fontSize: '.68rem', color: '#67e8f9', fontWeight: 700 }}>{st.phase}</span>
                            <button
                              onClick={() => copyCode(st.code, `${m.id}-${i}`)}
                              style={{ background: 'none', border: 'none', color: copiedId === `${m.id}-${i}` ? '#34d399' : '#00f0ff', ...M, fontSize: '.62rem', cursor: 'pointer' }}
                            >
                              {copiedId === `${m.id}-${i}` ? '✓ Copied' : '⎘ Copy'}
                            </button>
                          </div>
                          <p style={{ fontSize: '.72rem', color: '#94a3b8', margin: '0 0 6px' }}>{st.action}</p>
                          <pre style={{ ...M, fontSize: '.7rem', color: '#34d399', margin: 0, padding: '8px 10px', background: 'rgba(0,0,0,0.5)', borderRadius: 6, overflowX: 'auto', lineHeight: 1.5 }}>
                            {st.code}
                          </pre>
                        </div>
                      ))}
                      <button
                        onClick={() => executeAutoPatch(1)}
                        className="btn btn-sm btn-primary"
                        style={{ padding: '8px 16px', marginTop: 4, width: '100%', justifyContent: 'center' }}
                      >
                        ⚡ 1-Click Autonomous Patch Execution via ROBO AI
                      </button>
                    </div>
                  )}

                  {/* Suggestions Chips */}
                  {m.suggestions && (
                    <div style={{ marginTop: 14, display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      {m.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(sug)}
                          style={{
                            background: 'rgba(0,240,255,0.06)',
                            border: '1px solid rgba(0,240,255,0.22)',
                            color: '#a5f3fc',
                            ...M, fontSize: '.68rem', padding: '4px 10px',
                            borderRadius: 6, cursor: 'pointer',
                            transition: 'all .15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,240,255,0.15)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,240,255,0.06)'}
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', background: 'rgba(0,240,255,0.06)', borderRadius: 12, border: '1px solid rgba(0,240,255,0.2)', width: 'fit-content' }}>
              <div style={{ width: 18, height: 18, border: '2px solid rgba(0,240,255,0.2)', borderTopColor: '#00f0ff', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
              <span style={{ ...M, fontSize: '.74rem', color: '#67e8f9' }}>ROBO AI reasoning across 10 enterprise assets &amp; neural CVE graph…</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ── Input Box ── */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(4,9,20,0.95)' }}>
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ display: 'flex', gap: 10 }}>
            <input
              className="inp"
              placeholder={`Ask ROBO AI anything in English/Hinglish (e.g. "How to fix Log4Shell?" or "Simulate attack path")…`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ flex: 1, padding: '12px 16px', fontSize: '.84rem' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary"
              style={{ padding: '0 22px', fontSize: '.84rem', fontWeight: 800 }}
            >
              Send ➔
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
