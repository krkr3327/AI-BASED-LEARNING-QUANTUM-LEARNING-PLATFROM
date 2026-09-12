import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCurriculum, fetchProgress, fetchMastery, fetchRecommendations } from '../services/learningApi';
import CourseCard from '../components/learning/CourseCard';
import RecommendationCard from '../components/learning/RecommendationCard';
import MasteryIndicator from '../components/learning/MasteryIndicator';
import AIContextDrawer from '../components/ai/AIContextDrawer';

export default function Learning() {
  const navigate = useNavigate();
  const [curriculum, setCurriculum] = useState([]);
  const [progress, setProgress] = useState(null);
  const [mastery, setMastery] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [currData, progData, mastData, recData] = await Promise.all([
        fetchCurriculum(),
        fetchProgress(),
        fetchMastery(),
        fetchRecommendations()
      ]);
      if (currData) setCurriculum(Array.isArray(currData) ? currData : currData.modules || []);
      if (progData) setProgress(progData);
      if (mastData) setMastery(mastData);
      if (recData) setRecommendation(recData.recommendation || recData);
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSelectCourse = (course) => {
    if (course.lessons && course.lessons.length > 0) {
      navigate(`/learning/lessons/${course.lessons[0].id}`);
    } else {
      navigate(`/learning/courses/${course.id}`);
    }
  };

  const handleRecommendationAction = (rec) => {
    if (rec.recommended_lesson_id) {
      navigate(`/learning/lessons/${rec.recommended_lesson_id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded border border-cyan-800/60 uppercase">
              Intelligent Learning Platform
            </span>
            <span className="text-xs text-slate-400">Levels 1 – 7 • Adaptive Mastery</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">
            Quantum Computing Curriculum
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Progressive quantum education grounded in authoritative backend simulation and interactive Quantum Lab challenges.
          </p>
        </div>

        <button
          onClick={() => setAiDrawerOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-2"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

      {/* Recommendations */}
      {recommendation && (
        <RecommendationCard recommendation={recommendation} onAction={handleRecommendationAction} />
      )}

      {/* Main Grid: Courses + Mastery Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Course Curriculum Grid */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-200 border-b border-slate-800 pb-2">
            Learning Modules & Levels
          </h2>

          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading quantum curriculum...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {curriculum.map((course) => (
                <CourseCard key={course.id} course={course} onSelect={handleSelectCourse} />
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Concept Mastery Summary */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-cyan-400">Concept Mastery</h3>
            <span className="text-xs font-mono text-slate-400">
              {mastery?.total_mastered || 0} Mastered
            </span>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {mastery?.concept_mastery && Object.keys(mastery.concept_mastery).length > 0 ? (
              Object.values(mastery.concept_mastery).map((m) => (
                <MasteryIndicator
                  key={m.concept_id}
                  concept={m.concept_name || m.concept_id}
                  masteryScore={m.mastery_score}
                  status={m.status}
                />
              ))
            ) : (
              <p className="text-xs text-slate-500 text-center py-6">
                Complete exercises and challenges to build concept mastery.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* AI Assistant Drawer */}
      <AIContextDrawer
        isOpen={aiDrawerOpen}
        onClose={() => setAiDrawerOpen(false)}
        contextData={{ page: 'learning', topic: 'Curriculum Overview' }}
      />
    </div>
  );
}
