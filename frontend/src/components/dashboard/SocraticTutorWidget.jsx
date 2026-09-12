import React, { useState } from 'react';

/**
 * SocraticTutorWidget
 * Embedded Socratic AI Tutor Sidecar & Misconception Diagnostics
 * Features:
 * - Dynamic Socratic questions & analogy generator
 * - Instant Misconception Remediation Cards
 * - Persona / Track Selector (Developer, Physicist, Financial Quant)
 */
export default function SocraticTutorWidget() {
  const [selectedTrack, setSelectedTrack] = useState('dev');
  const [activeMisconception, setActiveMisconception] = useState(null);
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "👋 Welcome! I am your Socratic Quantum Tutor. Instead of just giving answers, I'll guide your physical intuition. What quantum concept or circuit behavior would you like to explore?"
    }
  ]);
  const [inputText, setInputText] = useState('');

  const misconceptions = [
    {
      id: 'misc-1',
      title: 'Global Phase vs Relative Phase',
      tag: 'Common Pitfall',
      summary: 'Why is e^(iθ) unobservable, but (|0⟩ + e^(iφ)|1⟩) changes measurement outcomes?',
      explanation: 'Multiplying the whole state by e^(iθ) cancels out in probability norm |e^(iθ)·c|² = |c|². However, a relative phase φ between basis components causes constructive/destructive interference upon applying Hadamard gates!'
    },
    {
      id: 'misc-2',
      title: 'Quantum Cloning Misconception',
      tag: 'Security & QEC',
      summary: 'Can a CNOT gate copy an arbitrary unknown quantum superposition?',
      explanation: 'No! Applying CNOT to state (α|0⟩+β|1⟩)|0⟩ creates the entangled Bell state α|00⟩+β|11⟩, which is NOT the cloned state (α|0⟩+β|1⟩)⊗(α|0⟩+β|1⟩) = α²|00⟩+αβ|01⟩+βα|10⟩+β²|11⟩.'
    },
    {
      id: 'misc-3',
      title: 'Quantum Computers & NP-Complete',
      tag: 'Complexity Theory',
      summary: 'Do quantum computers solve all hard NP-complete problems in O(1)?',
      explanation: 'No. BQP (Bounded-error Quantum Polynomial-time) is not believed to contain NP-complete problems. Quantum algorithms provide quadratic speedups (Grover) or period-finding polynomial speedups (Shor for factoring in BQP), not magic instant solutions for general NP.'
    }
  ];

  const handleSend = (userQuestion) => {
    const q = userQuestion || inputText;
    if (!q.trim()) return;

    setMessages(prev => [
      ...prev,
      { sender: 'user', text: q },
      {
        sender: 'ai',
        text: `💡 Socratic Probe: Consider what happens to the statevector amplitudes when you rotate the basis. If you apply a Hadamard transform first, how does interference cancel out the unwanted probability components?`
      }
    ]);
    setInputText('');
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '10px',
      border: '1px solid var(--border-subtle)',
      padding: '24px',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)' }}>
            SOCRATIC AI PEDAGOGY
          </span>
          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 800 }}>
            Adaptive Socratic AI Tutor & Misconception Engine
          </h3>
        </div>

        {/* Track Switcher */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { id: 'dev', label: '💻 Software Engineer' },
            { id: 'physics', label: '⚛️ Physicist' },
            { id: 'quant', label: '📊 Quant Finance' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedTrack(t.id)}
              style={{
                padding: '6px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                borderRadius: '4px',
                border: selectedTrack === t.id ? '1px solid #8B5CF6' : '1px solid var(--border-subtle)',
                backgroundColor: selectedTrack === t.id ? '#F5F3FF' : '#FFFFFF',
                color: selectedTrack === t.id ? '#7C3AED' : 'var(--text-secondary)',
                cursor: 'pointer'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Left: Chat dialog */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '260px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
          <div style={{ flex: 1, padding: '14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  backgroundColor: m.sender === 'user' ? 'var(--accent-primary)' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-primary)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div style={{ padding: '10px', borderTop: '1px solid var(--border-subtle)', backgroundColor: '#FFFFFF', display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="Ask a conceptual question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              onClick={() => handleSend()}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                backgroundColor: '#8B5CF6',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              Ask AI
            </button>
          </div>
        </div>

        {/* Right: Misconception Diagnostic Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Instant Misconception Diagnostics (Click to diagnose):
          </div>

          {misconceptions.map(m => {
            const isExpanded = activeMisconception === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setActiveMisconception(isExpanded ? null : m.id)}
                style={{
                  padding: '12px 14px',
                  backgroundColor: isExpanded ? '#FAF5FF' : '#FFFFFF',
                  border: isExpanded ? '1.5px solid #8B5CF6' : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.825rem', fontWeight: 700, color: isExpanded ? '#6D28D9' : 'var(--text-primary)' }}>
                    {m.title}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#8B5CF6', fontWeight: 700 }}>
                    {isExpanded ? '▲ Hide' : '▼ 60s Fix'}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.775rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {m.summary}
                </p>

                {isExpanded && (
                  <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #E9D5FF', fontSize: '0.8rem', color: '#4C1D95', lineHeight: 1.5 }}>
                    💡 <strong>Remediation:</strong> {m.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
