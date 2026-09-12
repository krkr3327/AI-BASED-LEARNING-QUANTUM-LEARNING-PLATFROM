import React, { useState } from 'react';
import { submitAssessment } from '../../services/learningApi';
import MasteryBadge from './MasteryBadge';

export default function AssessmentPanel({ assessment, onCompleted }) {
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  if (!assessment) return null;

  const handleSelectOption = (questionId, optionIdx) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const handleTextAnswer = (questionId, text) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await submitAssessment(assessment.id, answers);
      setReport(result);
      if (onCompleted) onCompleted(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompleteAnswers = (assessment.questions || []).every(q => answers[q.id] !== undefined && answers[q.id] !== '');

  return (
    <div style={{ padding: '40px', backgroundColor: 'var(--bg-panel)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '40px' }}>
      <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '20px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Lesson Assessment Quiz
          </span>
          <h3 style={{ fontSize: '1.8rem', margin: '6px 0 0 0', color: 'var(--text-primary)' }}>
            {assessment.title || 'Knowledge Assessment'}
          </h3>
        </div>
        {report && <MasteryBadge status={report.mastery_status} score={report.score} />}
      </div>

      {!report ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {(assessment.questions || []).map((q, qIdx) => (
            <div key={q.id || qIdx} style={{ padding: '24px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Question {qIdx + 1} of {assessment.questions.length}
              </div>
              <h4 style={{ fontSize: '1.15rem', marginBottom: '16px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                {q.question}
              </h4>

              {q.options ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = answers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        style={{
                          padding: '14px 18px',
                          backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.15)' : 'var(--bg-panel)',
                          border: isSelected ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                          borderRadius: '6px',
                          textAlign: 'left',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                        onClick={() => handleSelectOption(q.id, optIdx)}
                      >
                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: isSelected ? '5px solid var(--accent-primary)' : '2px solid var(--border-subtle)',
                          boxSizing: 'border-box'
                        }} />
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Type your numerical or text answer..."
                  value={answers[q.id] || ''}
                  onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-panel)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)'
                  }}
                />
              )}
            </div>
          ))}

          {error && (
            <div style={{ color: 'var(--gate-x)', fontSize: '0.9rem' }}>
              {error}
            </div>
          )}

          <div style={{ textAlign: 'right', marginTop: '16px' }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={!isCompleteAnswers || isSubmitting}
              style={{ padding: '14px 32px', fontSize: '1rem' }}
            >
              {isSubmitting ? 'Evaluating Assessment...' : 'SUBMIT ASSESSMENT'}
            </button>
          </div>
        </div>
      ) : (
        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {/* Summary Banner */}
          <div 
            style={{
              padding: '32px',
              backgroundColor: report.score >= (assessment.passing_score || 70) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              border: `1px solid ${report.score >= (assessment.passing_score || 70) ? 'var(--gate-y)' : 'var(--gate-x)'}`,
              marginBottom: '32px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: report.score >= 70 ? 'var(--gate-y)' : 'var(--gate-x)', fontWeight: 600 }}>
                {report.score >= 70 ? 'Passed Assessment' : 'Needs Review'}
              </div>
              <h3 style={{ fontSize: '2.5rem', margin: '8px 0', color: 'var(--text-primary)' }}>
                {report.score}% Final Score
              </h3>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                Answered {report.correct_count} of {report.total_count} questions correctly.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Calculated Mastery Status:</div>
              <MasteryBadge status={report.mastery_status} score={report.score} />
            </div>
          </div>

          {/* Breakdown per question */}
          <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Question Feedback</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {(report.details || []).map((dt, idx) => (
              <div key={idx} style={{ padding: '20px', backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: `1px solid ${dt.is_correct ? 'var(--gate-y)' : 'var(--gate-x)'}` }}>
                <div style={{ fontWeight: 600, color: dt.is_correct ? 'var(--gate-y)' : 'var(--gate-x)', marginBottom: '6px' }}>
                  Question {idx + 1}: {dt.is_correct ? '✓ Correct' : '✗ Incorrect'}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {dt.explanation}
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn"
            onClick={() => {
              setReport(null);
              setAnswers({});
            }}
          >
            RETRACT / RETAKE ASSESSMENT
          </button>
        </div>
      )}
    </div>
  );
}
