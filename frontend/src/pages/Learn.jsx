import React, { useState, useEffect, useCallback } from 'react';
import { fetchCurriculum, fetchLesson, fetchProgress, fetchMastery, fetchRecommendations } from '../services/learningApi';
import CurriculumOverview from '../components/learning/CurriculumOverview';
import LessonView from '../components/learning/LessonView';
import AIContextDrawer from '../components/ai/AIContextDrawer';

export default function Learn({ studentProfile }) {
  const [curriculum, setCurriculum] = useState(null);
  const [progress, setProgress] = useState(null);
  const [mastery, setMastery] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  const loadLearningState = useCallback(async (isInitial = false) => {
    if (isInitial) setIsLoading(true);
    setError(null);
    try {
      const [currData, progData, mastData, recData] = await Promise.all([
        fetchCurriculum(),
        fetchProgress(),
        fetchMastery(),
        fetchRecommendations()
      ]);

      if (currData) setCurriculum(currData);
      if (progData) setProgress(progData);
      if (mastData) setMastery(mastData);
      if (recData) setRecommendations(recData);
    } catch (err) {
      console.error('Error fetching learning state:', err);
      setError(err.message);
    } finally {
      if (isInitial) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLearningState(true);
  }, [loadLearningState]);

  const modulesList = Array.isArray(curriculum) ? curriculum : (curriculum?.modules || []);

  const handleSelectLesson = async (lessonId) => {
    setIsLoading(true);
    try {
      const lessonData = await fetchLesson(lessonId);
      if (lessonData) {
        setSelectedLesson(lessonData);
      } else {
        // Fallback search in curriculum modules if API call fails
        for (const mod of modulesList) {
          const found = mod.lessons?.find(l => l.id === lessonId);
          if (found) {
            setSelectedLesson(found);
            break;
          }
        }
      }
    } catch (err) {
      console.error(`Failed to load lesson ${lessonId}:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToCurriculum = () => {
    setSelectedLesson(null);
    loadLearningState();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', backgroundColor: 'var(--bg-primary)' }}>
      {/* Workspace Subheader */}
      <div className="workspace-header" style={{ borderBottom: '1px solid var(--border-subtle)', padding: '16px 40px', backgroundColor: 'var(--bg-panel)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: 'var(--accent-secondary)' }}>QUANTUM</span> LEARNING SYSTEM
        </h2>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            className="btn"
            onClick={() => setIsAiDrawerOpen(true)}
            style={{
              fontSize: '0.85rem',
              borderColor: 'rgba(6, 182, 212, 0.4)',
              color: 'var(--accent-secondary)',
              backgroundColor: 'rgba(6, 182, 212, 0.08)'
            }}
          >
            🤖 ASK AI TUTOR
          </button>
          {selectedLesson && (
            <button className="btn" style={{ fontSize: '0.85rem' }} onClick={handleBackToCurriculum}>
              ← Back to Curriculum Overview
            </button>
          )}
        </div>
      </div>

      <div className="workspace-content" style={{ maxWidth: 1040, margin: '0 auto', width: '100%', padding: '60px 40px' }}>
        {/* Recommendation Rule Banner if available */}
        {!selectedLesson && recommendations && recommendations.recommended_lessons && recommendations.recommended_lessons.length > 0 && (
          <div style={{ padding: '20px 24px', backgroundColor: 'rgba(6, 182, 212, 0.08)', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.3)', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-secondary)', fontWeight: 700 }}>
                Rule-Based Learning Recommendation
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '4px' }}>
                Next Action: {recommendations.recommended_lessons[0].title || recommendations.recommended_lessons[0].id}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {recommendations.recommended_lessons[0].reason}
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
              onClick={() => handleSelectLesson(recommendations.recommended_lessons[0].id)}
            >
              CONTINUE RECOMMENDED →
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading Quantum Learning System...
          </div>
        )}

        {/* Error message */}
        {error && !curriculum && (
          <div style={{ padding: '24px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--gate-x)', borderRadius: '8px', color: 'var(--gate-x)', marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {/* Render View */}
        {!isLoading && !selectedLesson && (
          <CurriculumOverview
            modules={modulesList}
            progress={progress}
            mastery={mastery}
            studentLevel={studentProfile?.level}
            onSelectLesson={handleSelectLesson}
          />
        )}

        {!isLoading && selectedLesson && (
          <LessonView
            lesson={selectedLesson}
            progress={progress}
            mastery={mastery}
            studentLevel={studentProfile?.level}
            onBack={handleBackToCurriculum}
            onRefreshProgress={loadLearningState}
          />
        )}
      </div>

      <AIContextDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        contextData={{
          page: 'learning',
          lessonId: selectedLesson?.id,
          topic: selectedLesson?.title,
          conceptId: selectedLesson?.concept_id
        }}
      />
    </div>
  );
}
