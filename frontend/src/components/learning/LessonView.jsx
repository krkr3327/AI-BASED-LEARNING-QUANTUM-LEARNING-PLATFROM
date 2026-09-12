import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PracticePanel from './PracticePanel';
import CircuitChallengePanel from './CircuitChallengePanel';
import AssessmentPanel from './AssessmentPanel';
import MasteryBadge from './MasteryBadge';
import InlineBlochSimulator from './InlineBlochSimulator';
import InlineInterferenceSandbox from './InlineInterferenceSandbox';
import BugHuntPanel from './BugHuntPanel';
import CodeExportModal from './CodeExportModal';
import { completeLesson } from '../../services/learningApi';

export default function LessonView({ lesson, progress, mastery, onBack, onRefreshProgress }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('lesson');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  const isAlreadyCompleted = (progress?.completed_lessons || []).includes(lesson?.id) || completedSuccess;

  const handleMarkComplete = async () => {
    if (!lesson?.id) return;
    setIsCompleting(true);
    try {
      const res = await completeLesson(lesson.id);
      setCompletedSuccess(true);
      window.dispatchEvent(new CustomEvent('rewards:xp_awarded', {
        detail: { xp: 50, reason: `Mastered Lesson: ${lesson.title}` }
      }));
      if (onRefreshProgress) onRefreshProgress();
    } catch (e) {
      console.warn('Failed to complete lesson:', e);
    } finally {
      setIsCompleting(false);
    }
  };

  if (!lesson) return null;

  const conceptId = lesson.concept_id;
  const conceptMastery = mastery?.concepts?.[conceptId];

  const handleTryInLab = () => {
    let preset = [];
    if (lesson.circuit_preset && lesson.circuit_preset.operations) {
      preset = lesson.circuit_preset.operations.map((op, idx) => ({
        id: Math.random().toString(),
        gate: op.gate,
        qubit: op.qubits ? op.qubits[0] : 0,
        control: op.qubits && op.qubits.length > 1 ? op.qubits[0] : undefined,
        target: op.qubits && op.qubits.length > 1 ? op.qubits[1] : undefined,
        col: idx + 1,
        parameters: op.parameters
      }));
    } else if (Array.isArray(lesson.preset_circuit)) {
      preset = lesson.preset_circuit.map((op, idx) => ({
        id: Math.random().toString(),
        gate: (op.gate || '').toUpperCase(),
        qubit: op.qubits ? op.qubits[0] : 0,
        control: op.controls && op.controls.length > 0 ? op.controls[0] : undefined,
        target: op.targets && op.targets.length > 0 ? op.targets[0] : (op.qubits ? op.qubits[0] : 0),
        col: idx + 1,
        parameters: op.params
      }));
    } else {
      preset = [{ id: '1', gate: 'H', qubit: 0, col: 1 }];
    }

    navigate('/lab', { state: { preset } });
  };

  const handleWatchProcess = () => {
    let preset = [];
    if (lesson.circuit_preset && lesson.circuit_preset.operations) {
      preset = lesson.circuit_preset.operations.map((op, idx) => ({
        id: Math.random().toString(),
        gate: op.gate,
        qubit: op.qubits ? op.qubits[0] : 0,
        control: op.qubits && op.qubits.length > 1 ? op.qubits[0] : undefined,
        target: op.qubits && op.qubits.length > 1 ? op.qubits[1] : undefined,
        col: idx + 1,
        parameters: op.parameters
      }));
    } else if (Array.isArray(lesson.preset_circuit)) {
      preset = lesson.preset_circuit.map((op, idx) => ({
        id: Math.random().toString(),
        gate: (op.gate || '').toUpperCase(),
        qubit: op.qubits ? op.qubits[0] : 0,
        control: op.controls && op.controls.length > 0 ? op.controls[0] : undefined,
        target: op.targets && op.targets.length > 0 ? op.targets[0] : (op.qubits ? op.qubits[0] : 0),
        col: idx + 1,
        parameters: op.params
      }));
    } else {
      preset = [{ id: '1', gate: 'H', qubit: 0, col: 1 }];
    }

    navigate('/lab', { state: { preset, autoExecute: true } });
  };

  const rawPreset = lesson.circuit_preset?.operations || lesson.preset_circuit || [{ gate: 'H', qubit: 0 }];

  return (
    <div style={{ animation: 'fadeIn 0.2s ease' }}>
      {/* Code Export Modal */}
      <CodeExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        circuitPreset={rawPreset}
        lessonTitle={lesson.title}
      />

      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <button className="btn" onClick={onBack} style={{ fontSize: '0.85rem' }}>
          ← Back to Curriculum
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>CONCEPT: {conceptId}</span>
          <MasteryBadge status={conceptMastery?.mastery_status || 'NOT_STARTED'} score={conceptMastery?.assessment_score} />
        </div>
      </div>

      {/* Lesson Title Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.75rem', padding: '3px 8px', backgroundColor: '#EFF6FF', color: 'var(--accent-primary)', borderRadius: '4px', border: '1px solid #BFDBFE', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {lesson.module_id?.toUpperCase()}
          </span>
          <span style={{ fontSize: '0.75rem', padding: '3px 8px', backgroundColor: '#F1F5F9', color: 'var(--text-secondary)', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontWeight: 600 }}>
            {lesson.difficulty || 'FOUNDATIONAL'}
          </span>
          <span style={{ fontSize: '0.75rem', padding: '3px 8px', backgroundColor: '#F1F5F9', color: 'var(--text-secondary)', borderRadius: '4px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)' }}>
            {lesson.time_minutes || lesson.estimated_minutes || 15} MIN READ
          </span>
        </div>
        <h1 style={{ fontSize: '2.4rem', margin: '0 0 10px 0', letterSpacing: '-0.03em', color: 'var(--text-primary)', fontWeight: 800 }}>
          {lesson.title}
        </h1>
        {lesson.description && (
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
            {lesson.description}
          </p>
        )}
      </div>

      {/* Section Navigation Tabs */}
      <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '32px', flexWrap: 'wrap' }}>
        {[
          { id: 'lesson', label: '1. LESSON THEORY' },
          { id: 'practice', label: `2. PRACTICE (${(lesson.exercises || []).length})` },
          { id: 'bughunt', label: '3. 🐛 BUG HUNT' },
          { id: 'assessment', label: '4. ASSESSMENT' },
          { id: 'mastery', label: '5. MASTERY EVIDENCE' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 18px',
              backgroundColor: activeTab === tab.id ? '#FFFFFF' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === tab.id ? 'var(--accent-primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: LESSON CONTENT */}
      {activeTab === 'lesson' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Objectives */}
          {((lesson.objectives && lesson.objectives.length > 0) || (lesson.learning_objectives && lesson.learning_objectives.length > 0)) && (
            <div style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
              <h3 style={{ margin: '0 0 14px 0', color: 'var(--accent-primary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                Measurable Learning Objectives
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(lesson.objectives || lesson.learning_objectives).map((obj, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    <span style={{ color: '#15803D', fontWeight: 'bold' }}>✓</span>
                    <span>{obj}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sections / Concept Explanation */}
          {lesson.sections && lesson.sections.length > 0 ? (
            lesson.sections.map((sec, sIdx) => (
              <div key={sIdx} style={{ backgroundColor: '#FFFFFF', padding: '28px', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
                <h3 style={{ fontSize: '1.2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '14px', color: 'var(--text-primary)', fontWeight: 700 }}>
                  {sec.title}
                </h3>
                <div style={{ fontSize: '1.025rem', lineHeight: '1.8', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                  {sec.content}
                </div>
                {sec.latex_math && (
                  <div style={{ marginTop: '14px', padding: '14px 18px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.95rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    Formula: {sec.latex_math}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div style={{ backgroundColor: '#FFFFFF', padding: '32px', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
              <h3 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 700 }}>
                Physical & Mathematical Foundations
              </h3>
              <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                {lesson.concept_text || lesson.content || lesson.description}
              </div>
            </div>
          )}

          {/* Inline Micro-Simulators Embedded Directly into Theory */}
          <InlineBlochSimulator
            title={`Live 3D Bloch Sphere & Statevector Simulator (${lesson.title})`}
          />

          {/* If the lesson deals with phase, interference, or algorithms, show the Interference Sandbox */}
          {(lesson.id?.includes('2-') || lesson.id?.includes('8-') || lesson.id?.includes('19-') || lesson.title?.toLowerCase().includes('interference') || lesson.title?.toLowerCase().includes('phase')) && (
            <InlineInterferenceSandbox />
          )}

          {/* Interactive Circuit & Simulation Launcher */}
          <div style={{ padding: '28px', backgroundColor: '#FFFFFF', borderRadius: '10px', border: '1.5px solid var(--border-medium)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                  Interactive Quantum Simulation
                </span>
                <h3 style={{ fontSize: '1.3rem', margin: '4px 0 0 0', color: 'var(--text-primary)', fontWeight: 700 }}>
                  Execute Lesson Circuit & Export Code
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn btn-primary" onClick={handleTryInLab} style={{ padding: '9px 18px', fontSize: '0.85rem' }}>
                  TRY IN LAB →
                </button>
                <button className="btn" onClick={handleWatchProcess} style={{ padding: '9px 18px', fontSize: '0.85rem', color: 'var(--accent-primary)', borderColor: 'var(--accent-primary)' }}>
                  WATCH TRACE →
                </button>
                <button
                  onClick={() => setIsExportOpen(true)}
                  style={{
                    padding: '9px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    backgroundColor: '#0F172A',
                    color: '#38BDF8',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  ⚡ EXPORT CODE (QISKIT/CIRQ)
                </button>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '18px' }}>
              This circuit can be simulated step-by-step in the Quantum Engine, visualized on the 3D Bloch sphere, or exported directly to Python frameworks.
            </p>

            {(lesson.preset_circuit || lesson.circuit_preset) && (
              <div style={{ padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontFamily: 'var(--font-mono)', fontSize: '0.825rem', color: 'var(--text-primary)' }}>
                <div style={{ marginBottom: '6px', color: 'var(--text-muted)', fontWeight: 600 }}>Circuit Preset Operations:</div>
                <pre style={{ margin: 0, overflowX: 'auto' }}>{JSON.stringify(lesson.preset_circuit || lesson.circuit_preset, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Key Takeaway */}
          {lesson.takeaway && (
            <div style={{ padding: '20px', backgroundColor: '#F0FDF4', borderRadius: '8px', borderLeft: '4px solid #15803D', border: '1px solid #BBF7D0' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
                Core Takeaway
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#14532D', lineHeight: 1.5 }}>
                {lesson.takeaway}
              </div>
            </div>
          )}

          {/* Action to Practice & Complete Lesson */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', padding: '24px 0', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => setActiveTab('practice')} style={{ padding: '12px 24px', fontSize: '0.9rem', fontWeight: 700 }}>
              CONTINUE TO PRACTICE EXERCISES →
            </button>
            <button
              className="btn btn-primary"
              onClick={handleMarkComplete}
              disabled={isCompleting || isAlreadyCompleted}
              style={{
                padding: '12px 28px',
                fontSize: '0.9rem',
                fontWeight: 700,
                backgroundColor: isAlreadyCompleted ? '#10B981' : 'var(--accent-primary)',
                borderColor: isAlreadyCompleted ? '#10B981' : 'var(--accent-primary)'
              }}
            >
              {isCompleting ? 'Recording Mastery...' : isAlreadyCompleted ? '✓ LESSON COMPLETED (+50 XP)' : '✓ MARK LESSON COMPLETE (+50 XP)'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: PRACTICE */}
      {activeTab === 'practice' && (
        <div>
          <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--text-primary)', fontWeight: 700 }}>
            Concept Practice & Interactive Verification
          </h3>

          <PracticePanel
            exercises={lesson.exercises}
            onAttemptCompleted={() => onRefreshProgress && onRefreshProgress()}
          />

          {lesson.circuit_challenge && (
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '20px', color: 'var(--text-primary)', fontWeight: 700 }}>
                Circuit Construction Challenge
              </h3>
              <CircuitChallengePanel
                challenge={lesson.circuit_challenge}
                onChallengeCompleted={() => onRefreshProgress && onRefreshProgress()}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BUG HUNT */}
      {activeTab === 'bughunt' && (
        <div>
          <BugHuntPanel
            onBugFixed={() => onRefreshProgress && onRefreshProgress()}
          />
        </div>
      )}

      {/* TAB 3: ASSESSMENT */}
      {activeTab === 'assessment' && (
        <div>
          <AssessmentPanel
            assessment={lesson.assessment}
            lessonId={lesson.id}
            conceptId={conceptId}
            onAssessmentCompleted={() => onRefreshProgress && onRefreshProgress()}
          />
        </div>
      )}

      {/* TAB 4: MASTERY EVIDENCE */}
      {activeTab === 'mastery' && (
        <div style={{ padding: '32px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 700 }}>
            Mastery Evidence Record
          </h3>
          {conceptMastery ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Status:</span>
                <MasteryBadge status={conceptMastery.mastery_status} score={conceptMastery.assessment_score} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ASSESSMENT SCORE</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '4px' }}>
                    {conceptMastery.assessment_score !== undefined ? `${conceptMastery.assessment_score}%` : 'N/A'}
                  </div>
                </div>
                <div style={{ padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>EXERCISES ATTEMPTED</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                    {conceptMastery.exercise_attempts_count || 0}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No mastery record logged yet. Complete the practice exercises and assessment to record evidence.</p>
          )}
        </div>
      )}
    </div>
  );
}
