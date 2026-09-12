import React from 'react';

export default function CourseCard({ course, onSelect }) {
  return (
    <div
      onClick={() => onSelect && onSelect(course)}
      className="p-5 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl cursor-pointer transition flex flex-col justify-between space-y-4 hover:shadow-lg hover:shadow-cyan-950/40"
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold">
            {course.id.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400">
            {course.lesson_count || course.lessons?.length || 0} Lessons
          </span>
        </div>
        <h3 className="text-lg font-bold text-slate-100 hover:text-cyan-300 transition">
          {course.title}
        </h3>
        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
          {course.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-800/80 flex justify-between items-center text-xs">
        <span className="text-slate-400 font-medium">Explore Modules →</span>
        <span className="text-cyan-400 font-semibold">Start Learning</span>
      </div>
    </div>
  );
}
