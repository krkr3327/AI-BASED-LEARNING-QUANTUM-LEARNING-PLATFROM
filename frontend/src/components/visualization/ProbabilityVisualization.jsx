import React, { useState, useMemo } from 'react';

export default function ProbabilityVisualization({ probabilities, shots = 1024 }) {
  const [filterZero, setFilterZero] = useState(false);
  const [sortMode, setSortMode] = useState('natural'); // 'natural' | 'prob_desc'
  const [hoveredState, setHoveredState] = useState(null);

  const rawEntries = useMemo(() => {
    if (!probabilities) return [];
    return Object.entries(probabilities);
  }, [probabilities]);

  const processedData = useMemo(() => {
    let list = rawEntries.map(([state, prob]) => {
      const p = typeof prob === 'number' ? prob : parseFloat(prob) || 0;
      // Calculate Monte Carlo simulated counts and Wilson/Poisson standard error
      const expectedCount = Math.round(p * shots);
      const stdError = Math.sqrt((p * (1 - p)) / shots);
      return {
        state,
        prob: p,
        percentage: (p * 100).toFixed(2),
        expectedCount,
        stdError: (stdError * 100).toFixed(2),
        hammingWeight: state.split('').filter(c => c === '1').length
      };
    });

    if (filterZero) {
      list = list.filter(item => item.prob > 0.001);
    }

    if (sortMode === 'prob_desc') {
      list.sort((a, b) => b.prob - a.prob);
    } else {
      list.sort((a, b) => a.state.localeCompare(b.state));
    }

    return list;
  }, [rawEntries, filterZero, sortMode, shots]);

  // Shannon Entropy Calculation: H = -sum(p * log2(p))
  const shannonEntropy = useMemo(() => {
    let h = 0;
    rawEntries.forEach(([, p]) => {
      if (p > 0) {
        h -= p * Math.log2(p);
      }
    });
    return h.toFixed(3);
  }, [rawEntries]);

  if (!probabilities || Object.keys(probabilities).length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No probability data available.</p>;
  }

  const maxProb = Math.max(...processedData.map(d => d.prob), 0.01);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Controls & Metric Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', backgroundColor: '#F8FAFC', padding: '14px 18px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              SHANNON ENTROPY H(X)
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
              {shannonEntropy} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>bits</span>
            </div>
          </div>

          <div style={{ width: '1px', height: '32px', backgroundColor: 'var(--border-subtle)' }} />

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              ACTIVE STATES
            </span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
              {processedData.filter(d => d.prob > 0.001).length} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/ {rawEntries.length}</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setFilterZero(!filterZero)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: `1px solid ${filterZero ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
              backgroundColor: filterZero ? '#EFF6FF' : '#FFFFFF',
              color: filterZero ? 'var(--accent-primary)' : 'var(--text-secondary)',
              fontSize: '0.775rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {filterZero ? 'Showing Non-Zero Only' : 'Show All Basis States'}
          </button>

          <button
            onClick={() => setSortMode(sortMode === 'natural' ? 'prob_desc' : 'natural')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: '#FFFFFF',
              color: 'var(--text-secondary)',
              fontSize: '0.775rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Sort: {sortMode === 'natural' ? 'Numerical (|00⟩..|11⟩)' : 'Probability (High → Low)'}
          </button>
        </div>
      </div>

      {/* SVG Interactive Multi-Bar Histogram */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '20px', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px', fontFamily: 'var(--font-mono)' }}>
          Exact Quantum State Probability Spectrum P(|i⟩) = |⟨i|ψ⟩|²
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {processedData.map((item) => {
            const isHovered = hoveredState === item.state;
            const barWidthPercent = (item.prob / Math.max(maxProb, 0.001)) * 100;

            return (
              <div
                key={item.state}
                onMouseEnter={() => setHoveredState(item.state)}
                onMouseLeave={() => setHoveredState(null)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '70px 1fr 90px',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  backgroundColor: isHovered ? '#F8FAFC' : 'transparent',
                  transition: 'background-color 0.15s ease'
                }}
              >
                {/* State Label */}
                <div style={{
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  color: isHovered ? 'var(--accent-primary)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  |{item.state}⟩
                </div>

                {/* Progress Bar Container with Error Gradient */}
                <div style={{
                  backgroundColor: '#F1F5F9',
                  height: 28,
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: '1px solid var(--border-subtle)',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <div style={{
                    width: `${Math.min(barWidthPercent, 100)}%`,
                    background: item.prob > 0.5 
                      ? 'linear-gradient(90deg, #2563EB 0%, #38BDF8 100%)' 
                      : item.prob > 0.1 
                      ? 'linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)'
                      : 'linear-gradient(90deg, #93C5FD 0%, #BFDBFE 100%)',
                    height: '100%',
                    transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    borderRadius: '4px 0 0 4px',
                    position: 'relative'
                  }} />

                  {/* Inline Probability Label inside or next to bar */}
                  {item.prob > 0.001 && (
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                      color: item.prob > 0.3 ? '#FFFFFF' : 'var(--text-primary)',
                      pointerEvents: 'none'
                    }}>
                      P = {item.prob.toFixed(4)} {item.stdError > 0 && `(±${item.stdError}%)`}
                    </span>
                  )}
                </div>

                {/* Percentage readout */}
                <div style={{
                  textAlign: 'right',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)',
                  color: item.prob > 0.001 ? '#15803D' : 'var(--text-muted)'
                }}>
                  {item.percentage}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
