import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryAI, buildContextEnvelope } from '../../services/aiClient';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function inlineFormat(text) {
  if (!text) return text;
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|`([^`]+)`)/g;
  let last = 0;
  let m;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
    else if (m[3]) parts.push(
      <code key={m.index} style={{ background:'#EFF6FF', color:'#1D4ED8', padding:'1px 4px', borderRadius:'3px', fontSize:'0.82em', fontFamily:'monospace' }}>
        {m[3]}
      </code>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

function parseAiResponse(fullText) {
  if (!fullText) return { mainText: '', diagrams: [], relatedQuestions: [] };

  let text = fullText;
  const diagrams = [];
  const relatedQuestions = [];

  // Extract related questions if present
  const relatedMatch = text.match(/###\s*💡\s*Related Questions:([\s\S]*)$/i);
  if (relatedMatch) {
    const rawQuestions = relatedMatch[1].trim().split('\n');
    rawQuestions.forEach(q => {
      const clean = q.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*•]\s*/, '').trim();
      if (clean && clean.length > 5) {
        relatedQuestions.push(clean);
      }
    });
    text = text.replace(/###\s*💡\s*Related Questions:[\s\S]*$/i, '').trim();
  }

  // Extract diagram code blocks (```diagram ... ``` or ``` ... ```)
  const codeBlockRegex = /```(?:diagram|ascii)?\n([\s\S]*?)```/g;
  let match;
  while ((match = codeBlockRegex.exec(text)) !== null) {
    diagrams.push(match[1].trim());
  }

  // Remove code blocks from main narrative text to avoid duplication
  const narrativeText = text.replace(codeBlockRegex, '').trim();

  return { narrativeText, diagrams, relatedQuestions };
}

function renderBubbleContent(text, onSelectQuestion) {
  if (!text) return null;
  const { narrativeText, diagrams, relatedQuestions } = parseAiResponse(text);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Narrative Explanation */}
      <div>
        {narrativeText.split('\n').map((line, i) => {
          if (!line.trim()) return <div key={i} style={{ height: '4px' }} />;
          if (/^[-*•]\s/.test(line)) {
            return (
              <div key={i} style={{ display:'flex', gap:'6px', marginBottom:'3px' }}>
                <span style={{ color:'#1D4ED8', flexShrink:0 }}>•</span>
                <span>{inlineFormat(line.replace(/^[-*•]\s/, ''))}</span>
              </div>
            );
          }
          return <div key={i} style={{ marginBottom:'3px' }}>{inlineFormat(line)}</div>;
        })}
      </div>

      {/* Visual Diagrams */}
      {diagrams.map((diag, dIdx) => (
        <div key={dIdx} style={{
          backgroundColor: '#0F172A',
          color: '#38BDF8',
          padding: '10px 12px',
          borderRadius: '6px',
          border: '1px solid #334155',
          fontFamily: 'monospace',
          fontSize: '0.78rem',
          lineHeight: '1.45',
          overflowX: 'auto',
          whiteSpace: 'pre'
        }}>
          <div style={{ fontSize: '0.65rem', color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            📐 Quantum Circuit / State Diagram
          </div>
          {diag}
        </div>
      ))}

      {/* Interactive Related Question Buttons */}
      {relatedQuestions.length > 0 && (
        <div style={{
          marginTop: '6px',
          paddingTop: '8px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '4px' }}>
            💡 Related Questions:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {relatedQuestions.map((q, qIdx) => (
              <button
                key={qIdx}
                onClick={() => onSelectQuestion && onSelectQuestion(q)}
                style={{
                  textAlign: 'left',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '5px 10px',
                  fontSize: '0.74rem',
                  color: '#1E293B',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  lineHeight: '1.3'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
              >
                👉 {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const QUICK_QUESTIONS = [
  'What is superposition?',
  'Explain the H gate',
  'What is entanglement?',
  'How does CNOT work?',
  'What is a Bell state?',
  "Explain Grover's algorithm",
];

function TypingDots() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'4px', padding:'10px 14px' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width:'6px', height:'6px', borderRadius:'50%',
          background:'#1D4ED8', display:'inline-block',
          animation:`fcbBounce 1.2s ease-in-out ${i*0.2}s infinite`
        }}/>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FloatingChatBot({ pageContext = 'general' }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen]           = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput]             = useState('');
  const [loading, setLoading]         = useState(false);
  const [unread, setUnread]           = useState(0);
  const [useMock, setUseMock]         = useState(false);
  const [messages, setMessages]       = useState([{
    role: 'ai',
    text: "Hi! I'm your Quantum AI Tutor.\n\nAsk me anything — gates, algorithms, circuits, or any concept you're stuck on!",
    ts: Date.now()
  }]);

  const chatEndRef = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    if (isOpen && !isMinimized) chatEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages, loading, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 120);
  }, [isOpen, isMinimized]);

  const openChat = () => { setIsOpen(true); setIsMinimized(false); setUnread(0); };

  const sendMessage = useCallback(async (text) => {
    const question = (text !== undefined ? text : input).trim();
    if (!question || loading) return;
    setInput('');

    const userMsg = { role:'user', text:question, ts:Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = messages.filter(m => m.role==='user' || m.role==='ai');
    const envelope = buildContextEnvelope({ page: pageContext });

    const res = await queryAI({
      question,
      taskType: 'chat',
      context: envelope,
      providerOverride: useMock ? 'mock' : null,
      history
    });

    const aiAnswer = res.answer === 'llm_not_configured'
      ? "LLM not configured yet.\n\nAdd **OPENAI_API_KEY** to `backend/.env` and restart the server.\n\nOr enable **Mock** mode in the header to test with sample responses."
      : (res.answer || 'Sorry, I could not get a response. Please try again.');

    setMessages(prev => [...prev, {
      role:'ai', text:aiAnswer, intent:res.intent, sources:res.sources||[], ts:Date.now()
    }]);
    setLoading(false);
    if (isMinimized || !isOpen) setUnread(prev => prev + 1);
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [input, loading, messages, pageContext, useMock, isMinimized, isOpen]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role:'ai', text:'Chat cleared! Ask me your next question.', ts:Date.now() }]);
  };

  const hBtn = {
    width:'28px', height:'28px', borderRadius:'6px',
    background:'rgba(255,255,255,0.15)', border:'none',
    color:'#fff', cursor:'pointer',
    display:'flex', alignItems:'center', justifyContent:'center'
  };

  return (
    <>
      <style>{`
        @keyframes fcbBounce {
          0%,60%,100% { transform:translateY(0); opacity:0.4; }
          30% { transform:translateY(-5px); opacity:1; }
        }
        @keyframes fcbSlideUp {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes fcbPulse {
          0%,100% { box-shadow:0 4px 16px rgba(29,78,216,0.35); }
          50%     { box-shadow:0 4px 28px rgba(29,78,216,0.65); }
        }
        .fcb-fab:hover { transform:scale(1.08) translateY(-2px) !important; }
        .fcb-send:hover:not(:disabled) { background:#1E40AF !important; }
        .fcb-send:disabled { opacity:0.5; cursor:not-allowed; }
        .fcb-quick:hover { background:#EFF6FF !important; border-color:#1D4ED8 !important; color:#1D4ED8 !important; }
        .fcb-input:focus { border-color:#1D4ED8 !important; box-shadow:0 0 0 3px rgba(29,78,216,0.1) !important; }
        .fcb-scroll::-webkit-scrollbar { width:4px; }
        .fcb-scroll::-webkit-scrollbar-track { background:transparent; }
        .fcb-scroll::-webkit-scrollbar-thumb { background:#CBD5E1; border-radius:2px; }
        .fcb-hbtn:hover { background:rgba(255,255,255,0.28) !important; }
        .fcb-footer-btn:hover { opacity:0.75; }
      `}</style>

      {/* ── FAB ── */}
      {!isOpen && (
        <button
          className="fcb-fab"
          onClick={openChat}
          title="Ask AI Tutor"
          style={{
            position:'fixed', bottom:'28px', right:'28px', zIndex:9999,
            width:'58px', height:'58px', borderRadius:'50%',
            background:'linear-gradient(135deg,#1D4ED8,#7C3AED)',
            border:'none', cursor:'pointer', color:'#fff',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 16px rgba(29,78,216,0.35)',
            transition:'transform 0.2s ease, box-shadow 0.2s ease',
            animation: unread > 0 ? 'fcbPulse 2s ease-in-out infinite' : 'none'
          }}
        >
          {/* Chat bubble icon */}
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          {unread > 0 && (
            <span style={{
              position:'absolute', top:'-3px', right:'-3px',
              width:'20px', height:'20px', borderRadius:'50%',
              background:'#EF4444', color:'#fff',
              fontSize:'0.7rem', fontWeight:700,
              display:'flex', alignItems:'center', justifyContent:'center',
              border:'2px solid #fff'
            }}>
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      )}

      {/* ── Chat panel ── */}
      {isOpen && (
        <div style={{
          position:'fixed', bottom:'28px', right:'28px', zIndex:9999,
          width:'380px', maxWidth:'calc(100vw - 32px)',
          background:'#FFFFFF', borderRadius:'16px',
          boxShadow:'0 8px 40px rgba(0,0,0,0.18),0 2px 8px rgba(0,0,0,0.08)',
          display:'flex', flexDirection:'column',
          overflow:'hidden', animation:'fcbSlideUp 0.22s ease',
          border:'1px solid #E2E8F0'
        }}>

          {/* Header */}
          <div style={{
            background:'linear-gradient(135deg,#1D4ED8,#7C3AED)',
            padding:'14px 16px',
            display:'flex', alignItems:'center', justifyContent:'space-between'
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
              <div style={{
                width:'36px', height:'36px', borderRadius:'50%',
                background:'rgba(255,255,255,0.2)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'1.1rem'
              }}>🔬</div>
              <div>
                <div style={{ color:'#fff', fontWeight:700, fontSize:'0.925rem', lineHeight:1.2 }}>
                  Quantum AI Tutor
                </div>
                <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.72rem', display:'flex', alignItems:'center', gap:'5px' }}>
                  <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#4ADE80', display:'inline-block' }}/>
                  Online · Ask me anything
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:'4px', alignItems:'center' }}>
              {/* Mock toggle */}
              <label style={{
                display:'flex', alignItems:'center', gap:'4px',
                color:'rgba(255,255,255,0.8)', fontSize:'0.7rem', cursor:'pointer',
                background:'rgba(255,255,255,0.12)', borderRadius:'4px',
                padding:'3px 7px', marginRight:'4px'
              }}>
                <input
                  type="checkbox" checked={useMock}
                  onChange={e => setUseMock(e.target.checked)}
                  style={{ width:'12px', height:'12px', accentColor:'#A78BFA' }}
                />
                Mock
              </label>

              {/* Open full tutor */}
              <button className="fcb-hbtn" onClick={() => { navigate('/ai-tutor'); setIsOpen(false); }} title="Open Full Tutor" style={hBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
              </button>

              {/* Minimize / restore */}
              <button className="fcb-hbtn" onClick={() => setIsMinimized(v => !v)} style={hBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  {isMinimized
                    ? <path d="M5 15l7-7 7 7"/>
                    : <path d="M19 9l-7 7-7-7"/>}
                </svg>
              </button>

              {/* Close */}
              <button className="fcb-hbtn" onClick={() => setIsOpen(false)} title="Close" style={hBtn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Collapsible body */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="fcb-scroll" style={{
                overflowY:'auto',
                padding:'16px 14px 10px',
                display:'flex', flexDirection:'column', gap:'14px',
                maxHeight:'340px', minHeight:'200px',
                background:'#F8FAFC'
              }}>
                {messages.map((msg, idx) => {
                  const isAi = msg.role === 'ai';
                  return (
                    <div key={idx} style={{
                      display:'flex', flexDirection:'column',
                      alignItems: isAi ? 'flex-start' : 'flex-end',
                      gap:'3px'
                    }}>
                      <div style={{
                        maxWidth:'90%',
                        padding:'10px 13px',
                        background: isAi ? '#FFFFFF' : 'linear-gradient(135deg,#1D4ED8,#2563EB)',
                        border: isAi ? '1px solid #E2E8F0' : 'none',
                        borderRadius: isAi ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                        boxShadow: isAi ? '0 1px 3px rgba(0,0,0,0.06)' : '0 2px 6px rgba(37,99,235,0.2)',
                        color: isAi ? '#1E293B' : '#FFFFFF',
                        fontSize:'0.875rem', lineHeight:1.55
                      }}>
                        {renderBubbleContent(msg.text, (q) => sendMessage(q))}
                        {isAi && msg.sources && msg.sources.length > 0 && (
                          <div style={{
                            marginTop:'8px', paddingTop:'6px',
                            borderTop:'1px solid #E2E8F0',
                            fontSize:'0.7rem', color:'#64748B'
                          }}>
                            📚 {msg.sources.map(s => s.title || s.document_id).join(', ')}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize:'0.64rem', color:'#94A3B8' }}>
                        {isAi ? 'AI Tutor' : 'You'} · {formatTime(msg.ts)}
                      </span>
                    </div>
                  );
                })}

                {loading && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'3px' }}>
                    <div style={{
                      background:'#FFFFFF', border:'1px solid #E2E8F0',
                      borderRadius:'4px 12px 12px 12px',
                      boxShadow:'0 1px 3px rgba(0,0,0,0.06)'
                    }}>
                      <TypingDots />
                    </div>
                    <span style={{ fontSize:'0.64rem', color:'#94A3B8' }}>AI Tutor is thinking…</span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick suggestions — only on fresh chat */}
              {messages.length <= 1 && (
                <div style={{
                  padding:'8px 14px',
                  background:'#F8FAFC',
                  borderTop:'1px solid #E2E8F0'
                }}>
                  <p style={{
                    fontSize:'0.68rem', color:'#94A3B8', fontWeight:600,
                    textTransform:'uppercase', letterSpacing:'0.06em',
                    margin:'0 0 6px 0', fontFamily:'monospace'
                  }}>Quick Ask</p>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                    {QUICK_QUESTIONS.map((q, i) => (
                      <button
                        key={i} className="fcb-quick"
                        onClick={() => sendMessage(q)}
                        style={{
                          fontSize:'0.74rem', color:'#374151',
                          background:'#FFFFFF', border:'1px solid #D1D5DB',
                          borderRadius:'16px', padding:'4px 10px',
                          cursor:'pointer', transition:'all 0.15s', lineHeight:1.3
                        }}
                      >{q}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input bar */}
              <div style={{
                padding:'10px 12px',
                background:'#FFFFFF',
                borderTop:'1px solid #E2E8F0',
                display:'flex', gap:'8px', alignItems:'flex-end'
              }}>
                <textarea
                  ref={inputRef}
                  className="fcb-input"
                  rows={1}
                  value={input}
                  onChange={e => {
                    setInput(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 90) + 'px';
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question… (Enter to send)"
                  disabled={loading}
                  style={{
                    flex:1, resize:'none', overflow:'hidden',
                    padding:'8px 12px',
                    background:'#F8FAFC', color:'#0F172A',
                    border:'1.5px solid #CBD5E1', borderRadius:'8px',
                    fontFamily:'inherit', fontSize:'0.875rem',
                    lineHeight:1.45, outline:'none',
                    transition:'border-color 0.15s, box-shadow 0.15s',
                    minHeight:'38px'
                  }}
                />
                <button
                  className="fcb-send"
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || loading}
                  style={{
                    width:'38px', height:'38px', borderRadius:'8px',
                    background:'#1D4ED8', color:'#FFFFFF',
                    border:'none', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0, transition:'background 0.15s',
                    alignSelf:'flex-end'
                  }}
                >
                  {loading
                    ? <span style={{
                        width:'14px', height:'14px',
                        border:'2px solid rgba(255,255,255,0.4)',
                        borderTopColor:'#fff', borderRadius:'50%',
                        display:'inline-block',
                        animation:'fcbBounce 0.8s linear infinite'
                      }}/>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                  }
                </button>
              </div>

              {/* Footer */}
              <div style={{
                padding:'6px 14px',
                background:'#F8FAFC',
                borderTop:'1px solid #E2E8F0',
                display:'flex', justifyContent:'space-between', alignItems:'center'
              }}>
                <button
                  className="fcb-footer-btn"
                  onClick={() => { navigate('/ai-tutor'); setIsOpen(false); }}
                  style={{
                    fontSize:'0.72rem', color:'#1D4ED8', fontWeight:600,
                    background:'none', border:'none', cursor:'pointer', padding:0
                  }}
                >
                  Open Full Tutor ↗
                </button>
                {messages.length > 2 && (
                  <button
                    className="fcb-footer-btn"
                    onClick={clearChat}
                    style={{
                      fontSize:'0.72rem', color:'#94A3B8',
                      background:'none', border:'none', cursor:'pointer', padding:0
                    }}
                  >Clear</button>
                )}
              </div>
            </>
          )}

          {/* Minimized bar */}
          {isMinimized && (
            <div
              onClick={() => { setIsMinimized(false); setUnread(0); }}
              style={{
                padding:'10px 16px', cursor:'pointer',
                background:'#F8FAFC',
                display:'flex', alignItems:'center', gap:'8px',
                fontSize:'0.825rem', color:'#1D4ED8', fontWeight:600
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              {messages.length - 1} message{messages.length !== 2 ? 's' : ''} — click to expand
              {unread > 0 && (
                <span style={{
                  marginLeft:'auto', background:'#EF4444', color:'#fff',
                  borderRadius:'10px', padding:'1px 7px',
                  fontSize:'0.7rem', fontWeight:700
                }}>{unread} new</span>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
