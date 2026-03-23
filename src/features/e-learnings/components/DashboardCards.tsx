import React from "react";
import { Video, BookOpen, TrendingUp, Award } from "lucide-react";
import type { Stats } from "../types";

interface DashboardCardsProps {
  onNavigate: (view: string) => void;
  stats: Stats;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  onNavigate,
  stats,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-800 hover:shadow-md hover:border-[#86BC25] transition-all cursor-pointer group"
        onClick={() => onNavigate("training")}
      >
        <div className="w-12 h-12 bg-neutral-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#86BC25]/10 transition-colors">
          <Video
            className="text-neutral-900 dark:text-slate-200 group-hover:text-[#86BC25]"
            size={24}
          />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
          My Training
        </h3>
        <p className="text-sm text-neutral-600 dark:text-slate-400 mb-4">
          Start or continue your assigned training modules
        </p>
        <div className="text-xs font-medium text-neutral-500 dark:text-slate-500">
          {stats.pending} pending • {stats.completed} completed
        </div>
      </div>

      <div
        className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-800 hover:shadow-md hover:border-[#86BC25] transition-all cursor-pointer group"
        onClick={() => onNavigate("library")}
      >
        <div className="w-12 h-12 bg-neutral-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#86BC25]/10 transition-colors">
          <BookOpen
            className="text-neutral-900 dark:text-slate-200 group-hover:text-[#86BC25]"
            size={24}
          />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
          Training Library
        </h3>
        <p className="text-sm text-neutral-600 dark:text-slate-400 mb-4">
          Browse all available training content
        </p>
        <div className="text-xs font-medium text-neutral-500 dark:text-slate-500">
          {stats.totalModules} modules available
        </div>
      </div>

      <div
        className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-800 hover:shadow-md hover:border-[#86BC25] transition-all cursor-pointer group"
        onClick={() => onNavigate("reports")}
      >
        <div className="w-12 h-12 bg-neutral-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#86BC25]/10 transition-colors">
          <TrendingUp
            className="text-neutral-900 dark:text-slate-200 group-hover:text-[#86BC25]"
            size={24}
          />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
          Progress Reports
        </h3>
        <p className="text-sm text-neutral-600 dark:text-slate-400 mb-4">
          View completion rates and analytics
        </p>
        <div className="text-xs font-medium text-neutral-500 dark:text-slate-500">
          {stats.completionRate}% overall completion
        </div>
      </div>

      <div
        className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-800 hover:shadow-md hover:border-[#86BC25] transition-all cursor-pointer group"
        onClick={() => onNavigate("certificates")}
      >
        <div className="w-12 h-12 bg-neutral-100 dark:bg-slate-800 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#86BC25]/10 transition-colors">
          <Award
            className="text-neutral-900 dark:text-slate-200 group-hover:text-[#86BC25]"
            size={24}
          />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">
          Certifications
        </h3>
        <p className="text-sm text-neutral-600 dark:text-slate-400 mb-4">
          View and download your certificates
        </p>
        <div className="text-xs font-medium text-neutral-500 dark:text-slate-500">
          {stats.certificates} certificates earned
        </div>
      </div>
    </div>
  );
};

export default DashboardCards;
