import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchLesson, fetchCurriculum, submitExercise, submitChallenge, submitAssessment } from '../services/learningApi';
import AIContextDrawer from '../components/ai/AIContextDrawer';

export default function Lesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState(null);
  const [curriculum, setCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [exerciseResults, setExerciseResults] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [challengeResult, setChallengeResult] = useState(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [lesData, currData] = await Promise.all([
        fetchLesson(lessonId),
        fetchCurriculum()
      ]);
      if (lesData) setLesson(lesData);
      if (currData) setCurriculum(Array.isArray(currData) ? currData : currData.modules || []);
      setLoading(false);
    }
    load();
  }, [lessonId]);

  if (loading) {
    return <div className="min-h-screen bg-slate-950 text-slate-400 p-10 text-center">Loading Quantum Lesson...</div>;
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 p-10 text-center space-y-4">
        <h2 className="text-xl font-bold">Lesson Not Found</h2>
        <button onClick={() => navigate('/learning')} className="px-4 py-2 bg-cyan-600 text-white text-xs rounded">
          Back to Curriculum
        </button>
      </div>
    );
  }

  const handleSelectOption = (exerciseId, optionIdx) => {
    setSelectedAnswers(prev => ({ ...prev, [exerciseId]: optionIdx }));
  };

  const handleSubmitExercise = async (exerciseId) => {
    const answer = selectedAnswers[exerciseId];
    if (answer === undefined) return;
    const res = await submitExercise(exerciseId, answer);
    setExerciseResults(prev => ({ ...prev, [exerciseId]: res }));
  };

  const handleOpenInLab = () => {
    navigate('/lab', { state: { circuit: lesson.preset_circuit || [] } });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <button onClick={() => navigate('/learning')} className="text-xs text-slate-400 hover:text-cyan-400 font-medium">
          ← Back to Curriculum
        </button>
        <button
          onClick={() => setAiDrawerOpen(true)}
          className="px-3 py-1.5 bg-cyan-950 border border-cyan-700/60 text-cyan-300 hover:bg-cyan-900 text-xs font-bold rounded-lg transition"
        >
          Ask AI About This Lesson
        </button>
      </div>

      {/* Title & Metadata */}
      <div>
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60">
            {lesson.difficulty}
          </span>
          <span className="text-xs text-slate-400">{lesson.time_minutes} min read</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white mt-2">{lesson.title}</h1>
        <p className="text-sm text-slate-400 mt-1">{lesson.description}</p>
      </div>

      {/* Learning Objectives */}
      {lesson.objectives && lesson.objectives.length > 0 && (
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Learning Objectives</h4>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
            {lesson.objectives.map((obj, idx) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Lesson Sections (Concept, Math, Intuition, Example) */}
      <div className="space-y-6">
        {lesson.sections?.map((sec, idx) => (
          <div key={idx} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
            <h3 className="text-lg font-bold text-cyan-300">{sec.title}</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{sec.content}</p>
            {sec.latex_math && (
              <div className="p-3 bg-slate-950 font-mono text-xs text-cyan-400 rounded border border-slate-800">
                {sec.latex_math}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Preset Circuit Example & Try in Lab */}
      {lesson.preset_circuit && lesson.preset_circuit.length > 0 && (
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-100">Interactive Circuit Example</h3>
            <button
              onClick={handleOpenInLab}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition"
            >
              Open in Quantum Lab →
            </button>
          </div>
          <div className="p-3 bg-slate-950 rounded font-mono text-xs text-slate-300">
            {JSON.stringify(lesson.preset_circuit, null, 2)}
          </div>
        </div>
      )}

      {/* Exercises */}
      {lesson.exercises && lesson.exercises.length > 0 && (
        <div className="space-y-4 border-t border-slate-800 pt-6">
          <h3 className="text-xl font-bold text-slate-100">Concept Exercises</h3>
          {lesson.exercises.map((ex) => {
            const res = exerciseResults[ex.id];
            return (
              <div key={ex.id} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                <p className="text-sm font-semibold text-slate-200">{ex.question}</p>

                {ex.options && (
                  <div className="space-y-2">
                    {ex.options.map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800">
                        <input
                          type="radio"
                          name={`ex-${ex.id}`}
                          checked={selectedAnswers[ex.id] === oIdx}
                          onChange={() => handleSelectOption(ex.id, oIdx)}
                          className="text-cyan-500 focus:ring-0"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => handleSubmitExercise(ex.id)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded"
                  >
                    Submit Answer
                  </button>

                  {res && (
                    <span className={`text-xs font-bold ${res.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {res.feedback}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Takeaway */}
      {lesson.takeaway && (
        <div className="p-4 bg-cyan-950/40 border border-cyan-700/40 rounded-xl text-cyan-200 text-xs font-medium">
          <strong>Key Takeaway:</strong> {lesson.takeaway}
        </div>
      )}

      <AIContextDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        initialQuestion={aiQuestion}
        contextData={{ page: 'lesson', topic: lesson.title, lessonId: lesson.id }}
      />
    </div>
  );
}
