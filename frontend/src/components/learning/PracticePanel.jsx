import React, { useState } from 'react';
import { submitExercise } from '../../services/learningApi';

export default function PracticePanel({ exercises, onAttemptCompleted }) {
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});

  if (!exercises || exercises.length === 0) {
    return (
      <div style={{ padding: '24px', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
        No practice exercises recorded for this section.
      </div>
    );
  }

  const handleOptionSelect = (exerciseId, optionIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [exerciseId]: optionIdx }));
  };

  const handleTextChange = (exerciseId, text) => {
    setSelectedAnswers(prev => ({ ...prev, [exerciseId]: text }));
  };

  const handleSubmit = async (exercise) => {
    const answer = selectedAnswers[exercise.id];
    if (answer === undefined || answer === '') return;

    setLoading(prev => ({ ...prev, [exercise.id]: true }));
    setErrors(prev => ({ ...prev, [exercise.id]: null }));

    try {
      const result = await submitExercise(exercise.id, answer);
      setSubmissions(prev => ({ ...prev, [exercise.id]: result }));
      if (onAttemptCompleted) {
        onAttemptCompleted(result);
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [exercise.id]: err.message }));
    } finally {
      setLoading(prev => ({ ...prev, [exercise.id]: false }));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {exercises.map((ex, idx) => {
        const isSubmitted = !!submissions[ex.id];
        const result = submissions[ex.id];
        const isPassed = Boolean(result?.is_correct ?? result?.passed);
        const isCurrentLoading = !!loading[ex.id];
        const currentError = errors[ex.id];
        const currentVal = selectedAnswers[ex.id];

        return (
          <div 
            key={ex.id || idx}
            style={{
              padding: '32px',
              backgroundColor: 'var(--bg-panel)',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Exercise {idx + 1} — {ex.difficulty || 'Foundational'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Concept: {ex.concept_id}
              </span>
            </div>

            <h4 style={{ fontSize: '1.2rem', marginBottom: '20px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {ex.question}
            </h4>

            {/* Multiple Choice / Select */}
            {ex.type === 'multiple_choice' && ex.options && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                {ex.options.map((option, optIdx) => {
                  let borderStyle = '1px solid var(--border-subtle)';
                  let bgStyle = 'var(--bg-primary)';
                  let textColor = 'var(--text-primary)';

                  if (isSubmitted) {
                    if (isPassed && currentVal === optIdx) {
                      borderStyle = '1px solid var(--gate-y)';
                      bgStyle = 'rgba(16, 185, 129, 0.12)';
                    } else if (!isPassed && currentVal === optIdx) {
                      borderStyle = '1px solid var(--gate-x)';
                      bgStyle = 'rgba(239, 68, 68, 0.12)';
                    }
                  } else if (currentVal === optIdx) {
                    borderStyle = '1px solid var(--accent-secondary)';
                    bgStyle = 'rgba(6, 182, 212, 0.1)';
                  }

                  return (
                    <button
                      key={optIdx}
                      style={{
                        padding: '16px 20px',
                        backgroundColor: bgStyle,
                        border: borderStyle,
                        borderRadius: '6px',
                        cursor: isSubmitted ? 'default' : 'pointer',
                        textAlign: 'left',
                        color: textColor,
                        fontSize: '1rem',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onClick={() => !isSubmitted && handleOptionSelect(ex.id, optIdx)}
                      disabled={isSubmitted}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: currentVal === optIdx ? '5px solid var(--accent-secondary)' : '2px solid var(--border-subtle)',
                        boxSizing: 'border-box'
                      }} />
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Numeric / Text */}
            {(ex.type === 'numeric' || ex.type === 'text') && (
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="text"
                  placeholder="Enter your answer..."
                  value={currentVal || ''}
                  onChange={(e) => handleTextChange(ex.id, e.target.value)}
                  disabled={isSubmitted}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    fontFamily: 'monospace'
                  }}
                />
              </div>
            )}

            {currentError && (
              <div style={{ marginBottom: '16px', color: 'var(--gate-x)', fontSize: '0.9rem' }}>
                {currentError}
              </div>
            )}

            {/* Result Box */}
            {isSubmitted && (
              <div 
                style={{
                  padding: '20px',
                  backgroundColor: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '6px',
                  border: `1px solid ${isPassed ? 'var(--gate-y)' : 'var(--gate-x)'}`,
                  marginBottom: '20px'
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '1.05rem', color: isPassed ? 'var(--gate-y)' : 'var(--gate-x)', marginBottom: '8px' }}>
                  {isPassed ? '✓ Correct Answer' : '✗ Incorrect Answer'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                  {result.explanation}
                </div>
              </div>
            )}

            {/* Submit / Retry Button */}
            {!isSubmitted ? (
              <button
                className="btn btn-primary"
                onClick={() => handleSubmit(ex)}
                disabled={currentVal === undefined || currentVal === '' || isCurrentLoading}
              >
                {isCurrentLoading ? 'Evaluating...' : 'SUBMIT ANSWER'}
              </button>
            ) : (
              <button
                className="btn"
                onClick={() => {
                  setSubmissions(prev => ({ ...prev, [ex.id]: null }));
                  setSelectedAnswers(prev => ({ ...prev, [ex.id]: undefined }));
                }}
              >
                RETRY EXERCISE
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
