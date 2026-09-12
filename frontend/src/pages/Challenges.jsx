import React, { useState, useEffect } from 'react';
import { QuantumPage, QuantumHeader, QuantumPanel, QuantumCard, QuantumBadge, QuantumButton, QuantumEmptyState, QuantumLoadingState, QuantumErrorState } from '../components/ui/QuantumPrimitives';
import CircuitChallengePanel from '../components/learning/CircuitChallengePanel';
import { fetchCurriculum } from '../services/learningApi';

export default function Challenges() {
  const [challenges, setChallenges] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState({});

  useEffect(() => {
    async function loadChallenges() {
      setIsLoading(true);
      setError(null);
      try {
        const curriculum = await fetchCurriculum();
        const extracted = [];
        
        const mods = Array.isArray(curriculum) ? curriculum : (curriculum?.modules || []);
        mods.forEach(mod => {
          (mod.lessons || []).forEach(les => {
            (les.exercises || []).forEach(ex => {
              if (ex.type === 'circuit_challenge') {
                extracted.push({
                  id: ex.id,
                  question: ex.question,
                  difficulty: ex.difficulty,
                  preset_gates: ex.preset_gates || [],
                  target_behavior: ex.target_behavior || {},
                  lesson_title: les.title,
                  module_title: mod.title,
                  module_id: mod.id,
                  category: mod.title.includes('Entanglement') ? 'ENTANGLEMENT' : (mod.title.includes('Foundations') ? 'FOUNDATIONS' : 'ALGORITHMS')
                });
              }
            });
          });
        });

        // Fallback default challenges if curriculum challenges are empty
        if (extracted.length === 0) {
          extracted.push(
            {
              id: 'challenge_x_state',
              question: 'Construct a 1-qubit circuit that transforms the initial state |0⟩ into state |1⟩.',
              target_description: 'P(|1⟩) ≥ 0.99 using a single Pauli-X gate.',
              difficulty: 'FOUNDATIONAL',
              category: 'FOUNDATIONS',
              concept_id: 'state_preparation',
              lesson_title: 'State Preparation'
            },
            {
              id: 'challenge_bell_state',
              question: 'Construct a 2-qubit Bell state circuit generating maximum entanglement |Φ⁺⟩ = 1/√2(|00⟩ + |11⟩).',
              target_description: 'P(|00⟩) ≥ 0.45 and P(|11⟩) ≥ 0.45 with P(|01⟩) = 0.',
              difficulty: 'INTERMEDIATE',
              category: 'ENTANGLEMENT',
              concept_id: 'bell_state',
              lesson_title: 'Bell States'
            }
          );
        }

        setChallenges(extracted);
      } catch (err) {
        console.error('Failed to load challenges:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadChallenges();
  }, []);

  const categories = ['ALL', 'FOUNDATIONS', 'ENTANGLEMENT', 'ALGORITHMS'];
  const filtered = selectedCategory === 'ALL' ? challenges : challenges.filter(c => c.category === selectedCategory);

  const handleChallengeCompleted = (challengeId, result) => {
    if (result && result.is_correct) {
      setCompletedChallenges(prev => ({ ...prev, [challengeId]: true }));
    }
  };

  return (
    <QuantumPage env="learn" maxWidth={1200}>
      <QuantumHeader
        title="Interactive Quantum Circuit Challenges"
        subtitle="Test your quantum intuition by constructing circuits that satisfy physical statevector and probability targets evaluated live on the backend simulator."
        category="PRACTICE & EVALUATION"
        actions={
          selectedChallenge ? (
            <QuantumButton variant="secondary" onClick={() => setSelectedChallenge(null)}>
              ← Back to Challenge Index
            </QuantumButton>
          ) : null
        }
      />

      {isLoading && <QuantumLoadingState message="Loading Circuit Challenges..." />}

      {error && (
        <QuantumErrorState
          title="Unable to load challenges"
          message={error}
          onRetry={() => window.location.reload()}
        />
      )}

      {!isLoading && !error && !selectedChallenge && (
        <>
          {/* Category Filters */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  backgroundColor: selectedCategory === cat ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-panel)',
                  border: selectedCategory === cat ? '1px solid var(--accent-secondary)' : '1px solid var(--border-subtle)',
                  color: selectedCategory === cat ? 'var(--accent-secondary)' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <QuantumEmptyState
              title="No Challenges Available in Selected Category"
              description="Select another category or return to the Curriculum page to unlock additional challenges."
              actionLabel="Return to Learn"
              onAction={() => window.location.href = '/learn'}
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {filtered.map(ch => {
                const isPassed = completedChallenges[ch.id];

                return (
                  <QuantumCard key={ch.id} onClick={() => setSelectedChallenge(ch)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <QuantumBadge variant={ch.difficulty === 'ADVANCED' ? 'amber' : 'cyan'}>
                        {ch.difficulty || 'FOUNDATIONAL'}
                      </QuantumBadge>
                      {isPassed ? (
                        <span style={{ color: 'var(--gate-y)', fontSize: '0.85rem', fontWeight: 600 }}>✓ Passed</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                          Concept: {ch.concept_id}
                        </span>
                      )}
                    </div>

                    <h4 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: '0 0 8px 0', fontWeight: 600 }}>
                      {ch.question || ch.lesson_title}
                    </h4>

                    {ch.target_description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                        {ch.target_description}
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ch.module_title || 'Module'}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', fontWeight: 600, fontFamily: 'monospace' }}>
                        START CHALLENGE →
                      </span>
                    </div>
                  </QuantumCard>
                );
              })}
            </div>
          )}
        </>
      )}

      {!isLoading && selectedChallenge && (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          <QuantumPanel
            title={`Challenge: ${selectedChallenge.lesson_title || 'Circuit Challenge'}`}
            badgeText={completedChallenges[selectedChallenge.id] ? 'PASSED ✓' : (selectedChallenge.difficulty || 'FOUNDATIONAL')}
            badgeVariant={completedChallenges[selectedChallenge.id] ? 'green' : 'cyan'}
          >
            <CircuitChallengePanel
              exercise={selectedChallenge}
              onCompleted={(result) => handleChallengeCompleted(selectedChallenge.id, result)}
            />
          </QuantumPanel>
        </div>
      )}
    </QuantumPage>
  );
}
