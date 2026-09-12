import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submitAssessment } from '../services/learningApi';

export default function Assessment() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSelectOption = (qid, oIdx) => {
    setAnswers(prev => ({ ...prev, [qid]: oIdx }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    const res = await submitAssessment(assessmentId, answers);
    setResult(res);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <button onClick={() => navigate('/learning')} className="text-xs text-slate-400 hover:text-cyan-400 font-medium">
          ← Back to Curriculum
        </button>
        <span className="text-xs font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60">
          ASSESSMENT
        </span>
      </div>

      <div>
        <h1 className="text-2xl font-extrabold text-white">Quantum Concept Assessment</h1>
        <p className="text-xs text-slate-400 mt-1">Answer the following questions to evaluate concept mastery.</p>
      </div>

      {result ? (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4 text-center">
          <h3 className={`text-xl font-bold ${result.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
            {result.passed ? 'Assessment Passed!' : 'Assessment Incomplete'}
          </h3>
          <p className="text-sm text-slate-300">
            Score: {Math.round(result.score * 100)}% ({result.correct_count} of {result.total_questions} correct)
          </p>

          <button
            onClick={() => navigate('/learning')}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded transition"
          >
            Continue Learning
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
            <p className="text-sm font-semibold text-slate-200">
              Q1. What is the state vector representation of basis state |0⟩?
            </p>
            <div className="space-y-2">
              {["[1, 0]^T", "[0, 1]^T", "[1, 1]^T", "[1/2, 1/2]^T"].map((opt, idx) => (
                <label key={idx} className="flex items-center space-x-2 text-xs text-slate-300 p-2.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 cursor-pointer">
                  <input
                    type="radio"
                    name="q1"
                    checked={answers['q1'] === idx}
                    onChange={() => handleSelectOption('q1', idx)}
                    className="text-cyan-500 focus:ring-0"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
