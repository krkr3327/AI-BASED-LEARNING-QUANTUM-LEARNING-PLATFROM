import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { queryAI, buildContextEnvelope } from '../services/aiClient';
import LevelSelector from '../components/learning/LevelSelector';
import { fetchLevel, setUserLevel } from '../services/learningApi';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function parseAiTutorResponse(fullText) {
  if (!fullText) return { textWithoutRelated: '', relatedQuestions: [] };

  let text = fullText;
  const relatedQuestions = [];

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

  return { textWithoutRelated: text, relatedQuestions };
}

/**
 * Enhanced markdown renderer — handles **bold**, `code`, bullet lists,
 * numbered lists, and dedicated diagram boxes.
 */
function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Unordered list block
    if (/^[-*•]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*•]\s+/, ''));
        i++;
      }
      elements.push(
        <ul key={i} style={{ margin: '6px 0 6px 18px', padding: 0 }}>
          {items.map((it, idx) => (
            <li key={idx} style={{ marginBottom: '3px', lineHeight: 1.55 }}>
              {inlineFormat(it)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list block
    if (/^\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      elements.push(
        <ol key={i} style={{ margin: '6px 0 6px 20px', padding: 0 }}>
          {items.map((it, idx) => (
            <li key={idx} style={{ marginBottom: '3px', lineHeight: 1.55 }}>
              {inlineFormat(it)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Code/Diagram block (```)
    if (line.startsWith('```')) {
      const isDiagram = line.includes('diagram') || line.includes('ascii');
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <div key={i} style={{
          background: '#0F172A', color: '#38BDF8',
          padding: '12px 14px', borderRadius: '8px',
          fontSize: '0.82rem', overflowX: 'auto',
          margin: '10px 0', fontFamily: 'monospace', lineHeight: 1.45,
          border: '1px solid #334155'
        }}>
          <div style={{ fontSize: '0.68rem', color: '#94A3B8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {isDiagram ? '📐 Quantum Circuit / Concept Diagram' : '💻 Code / State Matrix'}
          </div>
          <pre style={{ margin: 0, color: '#E2E8F0', fontFamily: 'inherit' }}>
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // Normal paragraph line
    elements.push(
      <p key={i} style={{ margin: '4px 0', lineHeight: 1.65 }}>
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return elements;
}

/** Handles **bold**, *italic*, `inline code` within a string */
function inlineFormat(text) {
  const parts = [];
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let last = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[2]) {
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4]) {
      parts.push(
        <code key={match.index} style={{
          background: '#EFF6FF', color: '#1D4ED8',
          padding: '1px 5px', borderRadius: '3px',
          fontSize: '0.85em', fontFamily: 'monospace'
        }}>
          {match[4]}
        </code>
      );
    }
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length > 0 ? parts : text;
}

// ─── Level-Adaptive Suggested Questions ──────────────────────────────────────

const LEVEL_SUGGESTED_QUESTIONS = {
  Beginner: [
    'What is a qubit and how is it different from a classical bit?',
    'Explain quantum superposition and the |+⟩ state in simple terms',
    'How does the Hadamard gate create superposition on the Bloch sphere?',
    'What happens when a qubit is measured in the computational basis?',
    'Explain the Pauli-X NOT gate and Pauli-Z phase flip',
    'Why is total probability |α|² + |β|² always equal to 1?'
  ],
  Intermediate: [
    'What is quantum entanglement and how do I create a Bell state |Φ⁺⟩?',
    'How does phase kickback work in the Deutsch-Jozsa algorithm?',
    'Explain the step-by-step protocol of Quantum Teleportation',
    'How does Grover\'s diffusion operator amplify target state probability?',
    'Explain the 3-qubit GHZ state and its multipartite entanglement',
    'What is the difference between pure states and mixed density matrices?'
  ],
  Advanced: [
    'How does the Quantum Fourier Transform (QFT) enable Shor\'s factoring speedup?',
    'Explain 2D Surface Code quantum error correction and syndrome extraction',
    'How does the Variational Quantum Eigensolver (VQE) minimize molecular Hamiltonians?',
    'Explain the Gottesman-Knill theorem and stabilizer tableau polynomial simulation',
    'How do parameterized quantum circuits (PQC) perform Quantum Machine Learning?',
    'What is Quantum Key Distribution (BB84/E91) and the no-cloning security proof?'
  ]
};

// ─── Message Bubble ──────────────────────────────────────────────────────────

function MessageBubble({ msg, onSelectQuestion }) {
  const isAi = msg.role === 'ai';
  const isSystem = msg.role === 'system';

  if (isSystem) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
        <span style={{
          fontSize: '0.72rem', color: '#64748B',
          background: '#F1F5F9', border: '1px solid #E2E8F0',
          borderRadius: '20px', padding: '3px 12px',
          fontFamily: 'monospace'
        }}>
          {msg.text}
        </span>
      </div>
    );
  }

  const { textWithoutRelated, relatedQuestions } = isAi ? parseAiTutorResponse(msg.text) : { textWithoutRelated: msg.text, relatedQuestions: [] };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isAi ? 'flex-start' : 'flex-end',
      gap: '4px',
      maxWidth: '100%'
    }}>
      {/* Avatar + name row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        flexDirection: isAi ? 'row' : 'row-reverse'
      }}>
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: isAi
            ? 'linear-gradient(135deg, #1D4ED8, #7C3AED)'
            : 'linear-gradient(135deg, #0EA5E9, #06B6D4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.75rem', color: '#fff', fontWeight: 700,
          flexShrink: 0
        }}>
          {isAi ? 'AI' : 'U'}
        </div>
        <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>
          {isAi ? 'Quantum AI Tutor' : 'You'}
        </span>
        {msg.intent && (
          <span style={{
            fontSize: '0.65rem', color: '#7C3AED',
            background: '#F5F3FF', border: '1px solid #DDD6FE',
            borderRadius: '4px', padding: '1px 6px',
            fontFamily: 'monospace'
          }}>
            {msg.intent}
          </span>
        )}
      </div>

      {/* Bubble */}
      <div style={{
        maxWidth: '88%',
        padding: '13px 16px',
        background: isAi ? '#FFFFFF' : 'linear-gradient(135deg, #1D4ED8, #2563EB)',
        border: isAi ? '1px solid #E2E8F0' : 'none',
        borderRadius: isAi ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
        boxShadow: isAi ? '0 1px 4px rgba(0,0,0,0.07)' : '0 2px 8px rgba(37,99,235,0.25)',
        color: isAi ? '#1E293B' : '#FFFFFF',
        fontSize: '0.925rem',
        lineHeight: 1.6
      }}>
        {isAi ? renderMarkdown(textWithoutRelated) : msg.text}

        {/* Interactive Related Question Buttons */}
        {isAi && relatedQuestions.length > 0 && (
          <div style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '5px' }}>
              💡 Related Questions (Click to Ask):
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {relatedQuestions.map((q, qIdx) => (
                <button
                  key={qIdx}
                  onClick={() => onSelectQuestion && onSelectQuestion(q)}
                  style={{
                    textAlign: 'left',
                    background: '#F8FAFC',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    color: '#1E293B',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    lineHeight: '1.4'
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

        {/* Sources */}
        {isAi && msg.sources && msg.sources.length > 0 && (
          <div style={{
            marginTop: '10px', paddingTop: '8px',
            borderTop: '1px solid #E2E8F0',
            fontSize: '0.75rem', color: '#64748B'
          }}>
            <span style={{ fontWeight: 700, color: '#1D4ED8' }}>
              📚 Sources ({msg.sources.length}):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
              {msg.sources.map((s, si) => (
                <span key={si} style={{
                  background: '#EFF6FF', color: '#1D4ED8',
                  border: '1px solid #BFDBFE', borderRadius: '4px',
                  padding: '2px 7px', fontSize: '0.7rem'
                }}>
                  {s.title || s.document_id}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Timestamp */}
      <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>
        {formatTime(msg.ts)}
      </span>
    </div>
  );
}

// ─── Typing Indicator ────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '7px' }}>
      <div style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #1D4ED8, #7C3AED)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.75rem', color: '#fff', fontWeight: 700, flexShrink: 0
      }}>
        AI
      </div>
      <div style={{
        padding: '12px 16px',
        background: '#FFFFFF', border: '1px solid #E2E8F0',
        borderRadius: '4px 14px 14px 14px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        display: 'flex', alignItems: 'center', gap: '4px'
      }}>
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: '7px', height: '7px', borderRadius: '50%',
            background: '#1D4ED8', display: 'inline-block',
            animation: `typingBounce 1.2s ease-in-out ${i * 0.2}s infinite`
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Main AITutor Page ───────────────────────────────────────────────────────

export default function AITutor() {
  const location = useLocation();
  const contextData = location.state || {};
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  const [userLevel, setUserLevelState] = useState('Beginner');
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: "Hello! I'm your **Quantum AI Academic Tutor** 🔬\n\nI dynamically adapt explanations to your selected learning tier (Beginner, Intermediate, or Advanced).\n\nAsk me anything about qubits, gates, algorithms, NISQ methods, or circuit debugging!",
      sources: [],
      ts: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useMock, setUseMock] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  useEffect(() => {
    async function loadLvl() {
      const data = await fetchLevel();
      if (data?.level) setUserLevelState(data.level);
    }
    loadLvl();

    const handleLevelChanged = (e) => {
      if (e.detail?.level) setUserLevelState(e.detail.level);
    };
    window.addEventListener('learning:level_changed', handleLevelChanged);
    return () => window.removeEventListener('learning:level_changed', handleLevelChanged);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    const question = (text || input).trim();
    if (!question || loading) return;

    setInput('');
    setShowSuggestions(false);

    const userMsg = { role: 'user', text: question, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    // Build history from current messages (exclude system)
    const history = messages.filter(m => m.role === 'user' || m.role === 'ai');

    const envelope = buildContextEnvelope({
      page: 'aitutor',
      circuit: contextData.circuitContext || contextData.circuit,
      result: contextData.latestResult || contextData.quantum_result,
      learning: { topic: contextData.lessonId, difficulty: userLevel.toLowerCase() }
    });

    const res = await queryAI({
      question,
      taskType: 'chat',
      context: envelope,
      providerOverride: useMock ? 'mock' : null,
      history
    });

    const aiAnswer = res.answer === 'llm_not_configured'
      ? "⚠️ The LLM provider isn't configured on the server yet.\n\nTo enable real AI responses:\n1. Open `backend/.env`\n2. Set `OPENAI_API_KEY=your_key_here`\n3. Restart the backend\n\nFor now, tick **Test Mock Provider** above to get sample responses."
      : (res.answer || 'Sorry, I could not generate a response. Please try again.');

    setMessages(prev => [
      ...prev,
      {
        role: 'ai',
        text: aiAnswer,
        intent: res.intent,
        sources: res.sources || [],
        actions: res.actions || [],
        ts: Date.now()
      }
    ]);
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [input, loading, messages, contextData, useMock]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'ai',
      text: "Chat cleared! I'm ready for your next question 🔬",
      sources: [],
      ts: Date.now()
    }]);
    setShowSuggestions(true);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', width: '100%',
      overflowY: 'auto', background: 'transparent'
    }}>
      {/* Inject typing animation keyframes */}
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        .chat-input:focus {
          border-color: #1D4ED8 !important;
          box-shadow: 0 0 0 3px rgba(29,78,216,0.12) !important;
        }
        .suggestion-pill:hover {
          background: #EFF6FF !important;
          border-color: #1D4ED8 !important;
          color: #1D4ED8 !important;
          transform: translateY(-1px);
        }
        .send-btn:hover:not(:disabled) {
          background: #1E40AF !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(29,78,216,0.35) !important;
        }
        .send-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>

      <div style={{
        maxWidth: '960px', width: '100%',
        margin: '0 auto',
        padding: '32px 32px 40px',
        display: 'flex', flexDirection: 'column', gap: '0', flex: 1
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', paddingBottom: '20px',
          borderBottom: '1px solid #E2E8F0', marginBottom: '0',
          flexWrap: 'wrap', gap: '12px'
        }}>
          <div>
            <div style={{
              fontSize: '0.72rem', color: '#1D4ED8', fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
              fontFamily: 'monospace', marginBottom: '5px'
            }}>
              AI TUTOR
            </div>
            <h1 style={{
              fontSize: '1.9rem', fontWeight: 800, margin: 0,
              letterSpacing: '-0.025em', color: '#0F172A', lineHeight: 1.2
            }}>
              Quantum AI Tutor
            </h1>
            <p style={{ fontSize: '0.925rem', color: '#64748B', margin: '6px 0 0 0' }}>
              Ask any question about quantum computing — gates, algorithms, circuits, or concepts.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Level Tier Switcher */}
            <LevelSelector
              compact={true}
              onLevelChange={(lvl) => setUserLevelState(lvl)}
            />

            <label style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '0.8rem', color: '#64748B', cursor: 'pointer',
              background: '#F8FAFC', border: '1px solid #E2E8F0',
              borderRadius: '6px', padding: '6px 10px'
            }}>
              <input
                type="checkbox"
                checked={useMock}
                onChange={e => setUseMock(e.target.checked)}
                style={{ accentColor: '#7C3AED' }}
              />
              Test Mock Provider
            </label>

            <span style={{
              fontSize: '0.72rem', fontWeight: 700, fontFamily: 'monospace',
              padding: '4px 10px', borderRadius: '4px',
              background: useMock ? '#F5F3FF' : '#EFF6FF',
              color: useMock ? '#6D28D9' : '#1D4ED8',
              border: `1px solid ${useMock ? '#DDD6FE' : '#BFDBFE'}`
            }}>
              {useMock ? '● MOCK' : '● LIVE'}
            </span>

            {messages.length > 1 && (
              <button onClick={clearChat} style={{
                fontSize: '0.8rem', color: '#64748B', cursor: 'pointer',
                background: 'transparent', border: '1px solid #E2E8F0',
                borderRadius: '6px', padding: '6px 12px',
                transition: 'all 0.15s'
              }}>
                Clear Chat
              </button>
            )}
          </div>
        </div>

        {/* ── Chat Window ── */}
        <div style={{
          background: '#F8FAFC', borderRadius: '0 0 12px 12px',
          border: '1px solid #E2E8F0', borderTop: 'none',
          display: 'flex', flexDirection: 'column',
          minHeight: '480px', flex: 1
        }}>

          {/* Messages scroll area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '24px 24px 16px',
            display: 'flex', flexDirection: 'column', gap: '20px',
            minHeight: '380px', maxHeight: '560px'
          }}>
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} msg={msg} onSelectQuestion={sendMessage} />
            ))}

            {loading && <TypingIndicator />}
            <div ref={chatEndRef} />
          </div>

          {/* Suggested questions */}
          {showSuggestions && messages.length <= 1 && (
            <div style={{
              padding: '0 24px 16px',
              borderTop: '1px solid #E2E8F0', paddingTop: '14px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{
                  fontSize: '0.75rem', color: '#2563EB', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  margin: 0, fontFamily: 'monospace'
                }}>
                  {userLevel} Tier Suggested Questions
                </p>
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Click to ask instantly
                </span>
              </div>
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '7px'
              }}>
                {(LEVEL_SUGGESTED_QUESTIONS[userLevel] || LEVEL_SUGGESTED_QUESTIONS.Beginner).map((q, i) => (
                  <button
                    key={i}
                    className="suggestion-pill"
                    onClick={() => sendMessage(q)}
                    style={{
                      fontSize: '0.8rem', color: '#1E293B',
                      background: '#FFFFFF', border: '1px solid #D1D5DB',
                      borderRadius: '20px', padding: '5px 13px',
                      cursor: 'pointer', transition: 'all 0.15s',
                      lineHeight: 1.4
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input bar */}
          <div style={{
            padding: '14px 18px',
            borderTop: '1px solid #E2E8F0',
            background: '#FFFFFF',
            borderRadius: '0 0 12px 12px',
            display: 'flex', gap: '10px', alignItems: 'flex-end'
          }}>
            <textarea
              ref={inputRef}
              className="chat-input"
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                // Auto-resize
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about quantum gates, algorithms, circuits, or any concept... (Enter to send)"
              disabled={loading}
              style={{
                flex: 1, resize: 'none', overflow: 'hidden',
                padding: '10px 14px',
                background: '#F8FAFC', color: '#0F172A',
                border: '1.5px solid #CBD5E1', borderRadius: '8px',
                fontFamily: 'inherit', fontSize: '0.925rem',
                lineHeight: 1.5, outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
                minHeight: '42px'
              }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                padding: '10px 20px', borderRadius: '8px',
                background: '#1D4ED8', color: '#FFFFFF',
                border: 'none', fontWeight: 700, fontSize: '0.875rem',
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: '0 2px 8px rgba(29,78,216,0.2)',
                whiteSpace: 'nowrap', alignSelf: 'flex-end',
                height: '42px', minWidth: '80px'
              }}
            >
              {loading ? (
                <span style={{
                  width: '16px', height: '16px',
                  border: '2px solid rgba(255,255,255,0.5)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'typingBounce 0.8s linear infinite'
                }} />
              ) : (
                <>Send ➤</>
              )}
            </button>
          </div>
        </div>

        {/* Context info footer */}
        {(contextData?.circuitContext || contextData?.lessonId) && (
          <div style={{
            marginTop: '16px', padding: '12px 16px',
            background: '#EFF6FF', border: '1px solid #BFDBFE',
            borderRadius: '8px', display: 'flex', gap: '16px',
            flexWrap: 'wrap', alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.78rem', color: '#1D4ED8', fontWeight: 700 }}>
              📎 Active Context:
            </span>
            {contextData?.circuitContext && (
              <span style={{
                fontSize: '0.78rem', color: '#1D4ED8',
                background: '#DBEAFE', borderRadius: '4px', padding: '2px 8px'
              }}>
                Circuit attached
              </span>
            )}
            {contextData?.lessonId && (
              <span style={{
                fontSize: '0.78rem', color: '#1D4ED8',
                background: '#DBEAFE', borderRadius: '4px', padding: '2px 8px'
              }}>
                Lesson: {contextData.lessonId}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
