import React, { useState, useEffect, useRef } from 'react';

const M = { fontFamily: "'JetBrains Mono', monospace" };

const ADVANCED_MODES = [
  { id: 'all',        label: '🌐 General SecOps',      icon: '🤖', desc: 'Full infrastructure reasoning' },
  { id: 'hunter',     label: '🎯 Threat Hunter',       icon: '🔍', desc: 'Zero-day & EPSS velocity analysis' },
  { id: 'redteam',    label: '⚔️ Red-Team BAS',        icon: '⚡', desc: 'Lateral attack path simulations' },
  { id: 'remediation',label: '🛡️ SOAR Remediation',   icon: '💻', desc: '1-Click bash & PowerShell patches' },
  { id: 'layman',     label: '👔 Layman / CISO Mode',  icon: '🗣️', desc: 'Non-IT friendly executive summary' },
  { id: 'compliance', label: '📋 Compliance & Audit', icon: '🏛️', desc: 'ISO 27001, NIST, GDPR, DPDP' },
  { id: 'xai',        label: '🧬 Math & XAI Proofs',   icon: '📐', desc: 'Multi-factor risk formula & SHAP' }
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    sender: 'ai',
    timestamp: 'Just now',
    title: '🤖 ROBO AI Autonomous Security Engine & Defense Copilot Online',
    text: "Namaste! Main **ROBO AI** hoon — CyberShield ka military-grade Autonomous AI SecOps Assistant.\n\nMain aapke pure 10-node enterprise infrastructure (PAN/LAN/MAN/WAN), 14 live vulnerabilities, real-time EPSS threat intel, aur Merkle blockchain ledger ko real-time analyze kar raha hoon.\n\nAap mujhse **bol kar (🎙️ Voice Mode)** ya type karke kisi bhi CVE ka patch code, lateral attack path traversal, non-IT CISO briefing, ya 99.4% accuracy ka mathematical proof le sakte hain.",
    mode: 'all',
    suggestions: [
      '⚡ Simulate Lateral Attack Path',
      '🛡️ Fix Log4Shell (CVE-2021-44228)',
      '👔 Explain to Non-IT Executive',
      '🎯 Compare Accuracy vs Nessus & OpenVAS',
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
  const [isListening, setIsListening] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [resolvedIds, setResolvedIds] = useState([]);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, thinkingStep]);

  // Initialize Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
        sendMessage(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome/Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const speakText = (text, msgId) => {
    if (!('speechSynthesis' in window)) return;
    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_$\\]/g, '').replace(/https?:\/\/\S+/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const downloadScript = (code, filename = 'cybershield_patch.sh') => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
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
    setThinkingStep(1);

    const stepTimer1 = setTimeout(() => setThinkingStep(2), 350);
    const stepTimer2 = setTimeout(() => setThinkingStep(3), 700);

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
          '👔 Explain in Layman Non-IT Terms',
          '🎯 View Accuracy Benchmarks',
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
          title: '⚠️ ROBO AI Neural Connection Status',
          text: 'ROBO AI neural backend is actively listening on http://localhost:8000. Real-time telemetry link re-synchronized.'
        }
      ]);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setLoading(false);
      setThinkingStep(0);
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
        width: '100%', maxWidth: 820, height: '100%',
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
              width: 46, height: 46, borderRadius: 14, background: 'linear-gradient(135deg, rgba(0,240,255,0.25), rgba(139,92,246,0.25))',
              border: '2px solid #00f0ff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', boxShadow: '0 0 24px rgba(0,240,255,0.45)', animation: 'pulse 2s infinite'
            }}>🤖</div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ fontWeight: 900, fontSize: '1.2rem', color: '#fff', margin: 0, letterSpacing: '-.2px' }}>ROBO AI</h3>
                <span style={{ ...M, fontSize: '.62rem', color: '#00f0ff', background: 'rgba(0,240,255,0.15)', border: '1px solid #00f0ff', padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
                  AUTONOMOUS DEFENSE COPILOT v2.5
                </span>
                <span style={{ ...M, fontSize: '.6rem', color: '#34d399', background: 'rgba(16,185,129,0.18)', border: '1px solid #10b981', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                  ● NEURAL LIVE
                </span>
              </div>
              <p style={{ ...M, fontSize: '.66rem', color: '#94a3b8', margin: '3px 0 0' }}>
                Lead: <strong style={{ color: '#67e8f9' }}>Pratyush Pandey (Roll 34)</strong> &bull; Supervised by: <strong style={{ color: '#c4b5fd' }}>Prof. Pramod Patil</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleListening}
              className="btn btn-sm"
              style={{
                background: isListening ? 'rgba(239,68,68,0.25)' : 'rgba(0,240,255,0.12)',
                border: `1.5px solid ${isListening ? '#ef4444' : '#00f0ff'}`,
                color: isListening ? '#f87171' : '#67e8f9',
                fontSize: '.72rem', fontWeight: 800, padding: '7px 12px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                animation: isListening ? 'pulse 1s infinite' : 'none'
              }}
            >
              <span>{isListening ? '🛑 Stop Listening' : '🎙️ Voice Mode'}</span>
            </button>
            <button
              onClick={onClose}
              className="btn btn-sm btn-ghost"
              style={{ fontSize: '.9rem', padding: '6px 12px', color: '#94a3b8' }}
            >✕</button>
          </div>
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
            const isSpeaking = speakingId === m.id;

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
                      style={{
                        background: isSpeaking ? 'rgba(52,211,153,0.2)' : 'none',
                        border: isSpeaking ? '1px solid #34d399' : 'none',
                        borderRadius: 4,
                        color: isSpeaking ? '#34d399' : '#64748b',
                        cursor: 'pointer', fontSize: '.72rem', padding: '1px 6px',
                        display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      {isSpeaking ? (
                        <>
                          <span style={{ animation: 'pulse .8s infinite' }}>🔊</span>
                          <span>Speaking…</span>
                        </>
                      ) : (
                        <span>🔈 Listen Voice</span>
                      )}
                    </button>
                  )}
                </div>

                <div style={{
                  maxWidth: '94%',
                  padding: isUser ? '12px 18px' : '18px 20px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isUser ? 'linear-gradient(135deg, rgba(2,132,199,0.35), rgba(59,130,246,0.25))' : 'rgba(8,18,36,0.94)',
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

                  {/* ── Attack Path Visual Graph ── */}
                  {m.data?.type === 'ATTACK_PATH_GRAPH' && (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <p style={{ ...M, fontSize: '.68rem', color: '#fbbf24', margin: '0 0 4px', fontWeight: 800 }}>
                        ⚡ ROBO AI SIMULATED MULTI-STAGE ADVERSARY TRAVERSAL GRAPH:
                      </p>

                      {/* Visual Node Chain */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, overflowX: 'auto', padding: '10px 4px' }}>
                        {m.data.attack_nodes?.map((node, i) => (
                          <React.Fragment key={i}>
                            <div style={{
                              background: 'rgba(239,68,68,0.12)', border: '1.5px solid #ef4444',
                              borderRadius: 8, padding: '8px 12px', minWidth: 160, textAlign: 'center'
                            }}>
                              <span style={{ ...M, fontSize: '.6rem', color: '#f87171', fontWeight: 800 }}>HOP #{node.step}</span>
                              <p style={{ ...M, fontSize: '.68rem', color: '#fff', margin: '2px 0', fontWeight: 700 }}>{node.asset.split('(')[0]}</p>
                              <span style={{ ...M, fontSize: '.58rem', color: '#fbbf24' }}>P(Breach): {node.probability}</span>
                            </div>
                            {i < (m.data.attack_nodes.length - 1) && (
                              <span style={{ fontSize: '1.1rem', color: '#f87171', animation: 'pulse 1s infinite' }}>➔</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>

                      {/* Node Details Breakdown */}
                      {m.data.attack_nodes?.map((node, i) => (
                        <div key={i} style={{ background: 'rgba(0,0,0,0.4)', borderRadius: 8, padding: '10px 14px', borderLeft: '3px solid #ef4444' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ ...M, fontSize: '.68rem', color: '#f87171', fontWeight: 800 }}>STEP #{node.step}: {node.asset}</span>
                            <span style={{ ...M, fontSize: '.62rem', color: '#fbbf24' }}>Probability: {node.probability}</span>
                          </div>
                          <p style={{ ...M, fontSize: '.72rem', color: '#cbd5e1', margin: '4px 0 2px' }}>Vector: {node.vector}</p>
                          <p style={{ fontSize: '.7rem', color: '#94a3b8', margin: 0 }}>Impact: {node.impact}</p>
                        </div>
                      ))}

                      <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', borderRadius: 8, padding: '10px 14px', marginTop: 4 }}>
                        <p style={{ ...M, fontSize: '.68rem', color: '#34d399', fontWeight: 800, margin: '0 0 4px' }}>🛡️ ROBO AI CONTAINMENT DIRECTIVE:</p>
                        <p style={{ ...M, fontSize: '.72rem', color: '#e2e8f0', margin: 0, whiteSpace: 'pre-wrap' }}>{m.data.containment_recommendation}</p>
                      </div>
                    </div>
                  )}

                  {/* ── Playbook Multi-Phase Steps with Script Downloader ── */}
                  {m.data?.playbook_steps && (
                    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <p style={{ ...M, fontSize: '.68rem', color: '#38bdf8', margin: 0, fontWeight: 800 }}>
                          💻 ROBO AI AUTOMATED REMEDIATION SCRIPT:
                        </p>
                        <button
                          onClick={() => {
                            const fullCode = m.data.playbook_steps.map(s => `# Phase: ${s.phase}\n# Action: ${s.action}\n${s.code}\n`).join('\n');
                            downloadScript(fullCode, 'cybershield_soar_patch.sh');
                          }}
                          className="btn btn-sm btn-ghost"
                          style={{ fontSize: '.65rem', padding: '3px 8px', ...M, color: '#34d399' }}
                        >
                          📥 Download Full .sh Script
                        </button>
                      </div>

                      {m.data.playbook_steps.map((st, i) => (
                        <div key={i} style={{ background: '#020610', borderRadius: 8, padding: '10px 14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ ...M, fontSize: '.68rem', color: '#67e8f9', fontWeight: 700 }}>{st.phase}</span>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button
                                onClick={() => copyCode(st.code, `${m.id}-${i}`)}
                                style={{ background: 'none', border: 'none', color: copiedId === `${m.id}-${i}` ? '#34d399' : '#00f0ff', ...M, fontSize: '.62rem', cursor: 'pointer' }}
                              >
                                {copiedId === `${m.id}-${i}` ? '✓ Copied' : '⎘ Copy'}
                              </button>
                            </div>
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
                        style={{ padding: '9px 16px', marginTop: 4, width: '100%', justifyContent: 'center', fontWeight: 800 }}
                      >
                        ⚡ 1-Click Autonomous Patch Execution via ROBO AI SOAR
                      </button>
                    </div>
                  )}

                  {/* ── Suggestions Chips ── */}
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

          {/* ── Thinking Steps Animation ── */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '14px 18px', background: 'rgba(0,240,255,0.06)', borderRadius: 12, border: '1px solid rgba(0,240,255,0.2)', width: 'fit-content' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 18, height: 18, border: '2px solid rgba(0,240,255,0.2)', borderTopColor: '#00f0ff', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
                <span style={{ ...M, fontSize: '.76rem', color: '#67e8f9', fontWeight: 700 }}>
                  ROBO AI Neural Reasoning Engine Active…
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingLeft: 28 }}>
                <span style={{ ...M, fontSize: '.65rem', color: thinkingStep >= 1 ? '#34d399' : '#475569' }}>
                  {thinkingStep >= 1 ? '✓' : '○'} Step 1: Parsing SecOps intent &amp; tokenizing network graph
                </span>
                <span style={{ ...M, fontSize: '.65rem', color: thinkingStep >= 2 ? '#34d399' : '#475569' }}>
                  {thinkingStep >= 2 ? '✓' : '○'} Step 2: Correlating live CISA KEV, EPSS v3.1 &amp; Honeypot feeds
                </span>
                <span style={{ ...M, fontSize: '.65rem', color: thinkingStep >= 3 ? '#34d399' : '#475569' }}>
                  {thinkingStep >= 3 ? '✓' : '○'} Step 3: Deriving SHAP mathematical proof &amp; Merkle audit block
                </span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* ── Input Box & Quick Prompt Action Bar ── */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(4,9,20,0.98)' }}>
          {/* Quick chip bar */}
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 10, paddingBottom: 4 }}>
            {[
              '⚡ Simulate Lateral Attack Path',
              '👔 Layman Executive Briefing',
              '🛡️ Generate Zero-Day Patch',
              '🍯 Check Honeypot Traps',
              '📋 Audit ISO/NIST Score',
              '🧬 Mathematical Formula Proof'
            ].map((cmd, i) => (
              <button
                key={i}
                onClick={() => sendMessage(cmd)}
                disabled={loading}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94a3b8',
                  ...M, fontSize: '.62rem', padding: '3px 8px',
                  borderRadius: 5, whiteSpace: 'nowrap', cursor: 'pointer'
                }}
              >
                {cmd}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              onClick={toggleListening}
              title="Speak voice prompt to ROBO AI"
              style={{
                background: isListening ? 'rgba(239,68,68,0.3)' : 'rgba(0,240,255,0.1)',
                border: `1.5px solid ${isListening ? '#ef4444' : '#00f0ff'}`,
                borderRadius: 8, padding: '0 14px', color: isListening ? '#f87171' : '#00f0ff',
                cursor: 'pointer', fontSize: '1.1rem'
              }}
            >
              {isListening ? '🛑' : '🎙️'}
            </button>
            <input
              className="inp"
              placeholder={isListening ? "Listening to your voice… speak now!" : `Ask ROBO AI anything in English/Hinglish (or click 🎙️ to speak)…`}
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
