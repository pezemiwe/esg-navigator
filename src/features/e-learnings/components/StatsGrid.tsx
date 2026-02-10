import React from "react";
import type { Stats } from "../types";

interface StatsGridProps {
  stats: Stats;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-neutral-200 dark:border-transparent text-neutral-900 dark:text-white relative overflow-hidden shadow-sm transition-colors">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-2xl">📚</span>
            <span className="px-2 py-1 bg-green-500/20 text-green-600 dark:text-green-300 text-xs rounded-full font-medium">
              +3 this month
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalModules}</div>
          <div className="text-neutral-600 dark:text-slate-300 text-sm">
            Active Training Modules
          </div>
        </div>
        <div className="absolute -rit-4 -bottom-4 w-24 h-24 bg-neutral-100/50 dark:bg-white/5 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white dark:bg-linear-to-br dark:from-[#86BC25] dark:to-amber-600 rounded-xl p-6 border border-neutral-200 dark:border-transparent text-neutral-900 dark:text-white relative overflow-hidden shadow-sm transition-colors">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-2xl">✅</span>
            <span className="px-2 py-1 bg-amber-100 dark:bg-white/20 text-amber-700 dark:text-white text-xs rounded-full font-medium">
              +5% vs last month
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.completionRate}%</div>
          <div className="text-neutral-600 dark:text-white/90 text-sm">
            Overall Completion Rate
          </div>
        </div>
        <div className="absolute -rit-4 -bottom-4 w-24 h-24 bg-amber-50 dark:bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white dark:bg-linear-to-br dark:from-[#006B3E] dark:to-green-800 rounded-xl p-6 border border-neutral-200 dark:border-transparent text-neutral-900 dark:text-white relative overflow-hidden shadow-sm transition-colors">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-2xl">🎯</span>
            <span className="px-2 py-1 bg-green-100 dark:bg-white/20 text-green-700 dark:text-white text-xs rounded-full font-medium">
              23 this week
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.certificates}</div>
          <div className="text-neutral-600 dark:text-green-50 text-sm">
            Certifications Earned
          </div>
        </div>
        <div className="absolute -rit-4 -bottom-4 w-24 h-24 bg-green-50 dark:bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-neutral-200 dark:border-slate-800 relative overflow-hidden shadow-sm transition-colors">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <span className="text-2xl">⏰</span>
            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">
              4 overdue
            </span>
          </div>
          <div className="text-3xl font-bold mb-1 text-neutral-900 dark:text-white">
            {stats.pending}
          </div>
          <div className="text-neutral-600 dark:text-slate-400 text-sm">
            Pending Completions
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
