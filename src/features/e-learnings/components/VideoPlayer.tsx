import React from "react";
import { Video } from "lucide-react";
import type { Training } from "../types";
interface VideoPlayerProps {
  training: Training;
  progress: number;
  onProgressUpdate: (id: number, progress: number) => void;
}
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  training,
  progress,
  onProgressUpdate,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-neutral-200 dark:border-slate-800 shadow-sm p-6 overflow-hidden transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-neutral-100 dark:bg-slate-800 rounded-lg">
          <Video className="text-neutral-900 dark:text-slate-200" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
            Training Video
          </h3>
          <p className="text-sm text-neutral-600 dark:text-slate-400">
            Duration: {training.duration}
          </p>
        </div>
      </div>
      <div className="relative pb-[56.25%] h-0 bg-black rounded-xl overflow-hidden mb-6 shadow-inner">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={training.videoUrl}
          title={training.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-neutral-900 dark:text-white">
            Progress
          </span>
          <span className="text-sm text-neutral-600 dark:text-slate-400">
            {progress || 0}% complete
          </span>
        </div>
        <div className="w-full h-2 bg-neutral-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#86BC25] to-amber-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress || 0}%` }}
          ></div>
        </div>
      </div>
      <div className="text-center">
        <button
          className="px-6 py-2 bg-[#006B3E] text-white rounded-lg text-sm font-medium hover:bg-[#005a34] transition-colors shadow-sm"
          onClick={() => {
            const newProgress = Math.min((progress || 0) + 25, 100);
            onProgressUpdate(training.id, newProgress);
          }}
        >
          Simulate Progress (+25%)
        </button>
      </div>
    </div>
  );
};
export default VideoPlayer;
