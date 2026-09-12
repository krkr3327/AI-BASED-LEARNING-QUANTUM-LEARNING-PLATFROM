import React from 'react';

export default function RecommendationCard({ recommendation, onAction }) {
  if (!recommendation) return null;

  return (
    <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/40 rounded-xl space-y-3 shadow-lg">
      <div className="flex justify-between items-center">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 px-2.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50">
          RECOMMENDED NEXT STEP: {recommendation.recommendation_type}
        </span>
        <span className="text-xs text-slate-400 font-medium">Difficulty: {recommendation.difficulty || 'Beginner'}</span>
      </div>

      <div>
        <h4 className="text-base font-bold text-slate-100">{recommendation.title}</h4>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">{recommendation.reason}</p>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          onClick={() => onAction && onAction(recommendation)}
          className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition shadow-md shadow-cyan-950"
        >
          Continue Learning →
        </button>
      </div>
    </div>
  );
}
