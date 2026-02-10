import React from "react";
import { Video, Play, Eye } from "lucide-react";
import type { Training } from "../types";

interface TrainingCardProps {
  training: Training;
  onStart: (training: Training) => void;
  onView: (training: Training) => void;
}

const TrainingCard: React.FC<TrainingCardProps> = ({
  training,
  onStart,
  onView,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "in_progress":
        return "bg-[#86BC25]/20 dark:bg-[#86BC25]/10 text-amber-700 dark:text-amber-400";
      default:
        return "bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-400";
    }
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 80) return "bg-[#006B3E]";
    if (rate >= 50) return "bg-[#86BC25]";
    return "bg-red-500";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-neutral-200 dark:border-slate-800 shadow-sm p-6 mb-4 hover:shadow-md transition-all">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-neutral-100 dark:bg-slate-800 rounded-lg">
              <Video
                className="text-neutral-600 dark:text-slate-400"
                size={20}
              />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
              {training.title}
            </h3>
          </div>

          <p className="text-neutral-600 dark:text-slate-400 text-sm mb-4 line-clamp-2">
            {training.description}
          </p>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="text-xs">
              <span className="font-semibold text-neutral-900 dark:text-white">
                Category:
              </span>{" "}
              <span className="bg-neutral-100 dark:bg-slate-800 px-2 py-1 rounded text-neutral-600 dark:text-slate-400">
                {training.category}
              </span>
            </div>
            <div className="text-xs text-neutral-600 dark:text-slate-400">
              <span className="font-semibold text-neutral-900 dark:text-white">
                Duration:
              </span>{" "}
              {training.duration}
            </div>
            <div className="text-xs text-neutral-600 dark:text-slate-400">
              <span className="font-semibold text-neutral-900 dark:text-white">
                Due:
              </span>{" "}
              {training.dueDate}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold text-neutral-900 dark:text-white">
              Progress:
            </span>
            <div className="flex-1 max-w-50 h-2 bg-neutral-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${getProgressColor(training.completionRate)}`}
                style={{ width: `${training.completionRate}%` }}
              ></div>
            </div>
            <span className="text-xs font-semibold text-neutral-900 dark:text-white">
              {training.completionRate}%
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-30">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium text-center capitalize ${getStatusColor(training.status)}`}
          >
            {training.status.replace("_", " ")}
          </span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium text-center capitalize border ${
              training.type === "mandatory"
                ? "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                : "border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
            }`}
          >
            {training.type}
          </span>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-slate-800 mt-2">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-[#006B3E] dark:bg-[#006B3E] text-white rounded-lg text-sm font-medium hover:bg-[#005a34] transition-colors"
          onClick={() => onStart(training)}
        >
          <Play size={14} />{" "}
          {training.status === "not_started" ? "Start" : "Continue"}
        </button>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 text-neutral-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-neutral-50 dark:hover:bg-slate-700 transition-colors"
          onClick={() => onView(training)}
        >
          <Eye size={14} /> Details
        </button>
      </div>
    </div>
  );
};

export default TrainingCard;
