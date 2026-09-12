import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchCurriculum } from '../services/learningApi';

export default function Course() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const currData = await fetchCurriculum();
      const list = Array.isArray(currData) ? currData : currData?.modules || [];
      const found = list.find(m => m.id === courseId);
      if (found) setCourse(found);
      setLoading(false);
    }
    load();
  }, [courseId]);

  if (loading) return <div className="min-h-screen bg-slate-950 text-slate-400 p-10 text-center">Loading Module...</div>;

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-300 p-10 text-center space-y-4">
        <h2 className="text-xl font-bold">Module Not Found</h2>
        <button onClick={() => navigate('/learning')} className="px-4 py-2 bg-cyan-600 text-white text-xs rounded">
          Back to Curriculum
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <button onClick={() => navigate('/learning')} className="text-xs text-slate-400 hover:text-cyan-400 font-medium">
          ← Back to Curriculum
        </button>
        <span className="text-xs font-mono font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800/60">
          MODULE {course.order}
        </span>
      </div>

      <div>
        <h1 className="text-3xl font-extrabold text-white">{course.title}</h1>
        <p className="text-sm text-slate-400 mt-2">{course.description}</p>
      </div>

      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-bold text-slate-200">Module Lessons</h3>
        <div className="space-y-3">
          {course.lessons?.map((les) => (
            <div
              key={les.id}
              onClick={() => navigate(`/learning/lessons/${les.id}`)}
              className="p-4 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl cursor-pointer transition flex justify-between items-center"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-100">{les.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{les.description}</p>
              </div>
              <span className="text-xs text-cyan-400 font-semibold font-mono">Start →</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
