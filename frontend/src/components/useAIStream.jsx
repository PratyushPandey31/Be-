/**
 * useAIStream — Shared hook for real-time SSE token-by-token streaming from ROBO AI backend.
 * Usage: const { text, loading, done, trigger, reset } = useAIStream();
 */
import { useState, useRef, useCallback } from 'react';

const API_BASE = 'http://127.0.0.1:8000/api';

export function useAIStream() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const readerRef = useRef(null);

  const reset = useCallback(() => {
    setText('');
    setLoading(false);
    setDone(false);
    setMetadata(null);
  }, []);

  const trigger = useCallback(async ({ prompt, model_id = 'gemini-2.5-pro', depth = 'fast' }) => {
    // Cancel any in-flight stream
    if (readerRef.current) {
      try { readerRef.current.cancel(); } catch {}
    }
    setText('');
    setLoading(true);
    setDone(false);
    setMetadata(null);

    try {
      const res = await fetch(`${API_BASE}/ai/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model_id, deep_search_depth: depth })
      });

      if (!res.ok || !res.body) throw new Error('Stream unavailable');

      const reader = res.body.getReader();
      readerRef.current = reader;
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          if (!part.trim()) continue;
          let evtType = '', dataStr = '';
          for (const line of part.split('\n')) {
            if (line.startsWith('event: ')) evtType = line.slice(7).trim();
            if (line.startsWith('data: '))  dataStr = line.slice(6).trim();
          }
          if (!dataStr) continue;
          try {
            const parsed = JSON.parse(dataStr);
            if (evtType === 'token')    setText(prev => prev + parsed.token);
            if (evtType === 'metadata') setMetadata(parsed);
            if (evtType === 'done')     setDone(true);
          } catch {}
        }
      }
    } catch (e) {
      console.warn('[useAIStream] Stream error:', e.message);
    } finally {
      setLoading(false);
      setDone(true);
      readerRef.current = null;
    }
  }, []);

  return { text, loading, done, metadata, trigger, reset };
}

/**
 * StreamBox — A reusable glassmorphic streaming text display component.
 */
export function StreamBox({ icon = '🤖', label, subLabel, color = '#00f0ff', text, loading, done, onAction, actionLabel, minHeight = 36, fontSize = '.76rem', textColor = '#e2e8f0' }) {
  const M = { fontFamily: "'JetBrains Mono', monospace" };

  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}08, rgba(0,0,0,0.3))`,
      border: `1px solid ${color}35`,
      borderRadius: 12,
      padding: '14px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '1.05rem', animation: loading ? 'pulse 1s infinite' : 'none' }}>{icon}</span>
          <div>
            <p style={{ ...M, fontSize: '.68rem', fontWeight: 800, color, margin: 0 }}>{label}</p>
            {subLabel && <p style={{ ...M, fontSize: '.58rem', color: '#475569', margin: 0 }}>{subLabel}</p>}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {loading && (
            <span style={{ ...M, fontSize: '.58rem', color, background: `${color}15`, border: `1px solid ${color}40`, padding: '2px 8px', borderRadius: 4, fontWeight: 800 }}>
              ● STREAMING
            </span>
          )}
          {done && !loading && (
            <span style={{ ...M, fontSize: '.58rem', color: '#34d399' }}>✓ Done</span>
          )}
        </div>
      </div>

      {/* Streaming Text */}
      <div style={{ ...M, fontSize, color: textColor, lineHeight: 1.7, minHeight }}>
        {text || (!done && <span style={{ color: '#334155' }}>Initializing ROBO AI…</span>)}
        {loading && (
          <span style={{
            display: 'inline-block', width: 7, height: Math.max(12, parseInt(fontSize) || 13),
            background: color, marginLeft: 3, verticalAlign: 'middle',
            animation: 'pulse .55s infinite', boxShadow: `0 0 6px ${color}`
          }} />
        )}
      </div>

      {/* Action Button */}
      {onAction && done && text && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onAction}
            style={{
              ...M, fontSize: '.68rem', fontWeight: 800,
              background: `linear-gradient(135deg, ${color}, ${color}aa)`,
              border: 'none', borderRadius: 8, padding: '6px 16px',
              color: color === '#f59e0b' ? '#000' : '#000',
              cursor: 'pointer', boxShadow: `0 0 14px ${color}40`
            }}
          >
            {actionLabel || 'Ask ROBO AI →'}
          </button>
        </div>
      )}
    </div>
  );
}
