import React from 'react';

export default function MasteryIndicator({ concept, masteryScore = 0.0, status = 'NOT_STARTED' }) {
  const getBadgeStyle = () => {
    switch (status.toUpperCase()) {
      case 'MASTERED':
        return 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60';
      case 'COMPLETED':
        return 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60';
      case 'IN_PROGRESS':
        return 'bg-indigo-950/80 text-indigo-400 border-indigo-700/60';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const percentage = Math.round(masteryScore * 100);

  return (
    <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-200">{concept}</p>
        <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="text-right">
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getBadgeStyle()}`}>
          {status.toUpperCase()} ({percentage}%)
        </span>
      </div>
    </div>
  );
}
