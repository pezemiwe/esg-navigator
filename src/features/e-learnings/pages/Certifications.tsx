import { Award, Download, Calendar } from "lucide-react";
import { useLearningStore } from "@/store/learningStore";

export default function Certifications() {
  const { courses } = useLearningStore();

  const completedCourses = courses.filter((t) => t.status === "completed");

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-linear-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-neutral-200 dark:border-slate-800 rounded-2xl p-8 md:p-10 shadow-lg relative overflow-hidden transition-colors">
        <div className="absolute top-0 rit-0 w-64 h-64 bg-[#86BC25]/5 dark:bg-[#86BC25]/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[#86BC25] rounded-xl flex items-center justify-center shadow-lg">
                <Award className="text-neutral-900" size={24} />
              </div>
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white transition-colors tracking-tit">
                My Certifications
              </h1>
            </div>
            <p className="text-lg text-neutral-600 dark:text-slate-400 font-medium transition-colors">
              View and download your earned certificates
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {completedCourses.length > 0 ? (
          completedCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-linear-to-br dark:from-slate-900 dark:to-slate-800 rounded-2xl border-2 border-neutral-200 dark:border-slate-800 shadow-lg hover:shadow-2xl p-6 relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:border-[#86BC25]/30"
            >
              <div className="absolute top-0 rit-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Award size={120} className="text-warning-500" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 bg-success-50 dark:bg-success-900/20 rounded-full flex items-center justify-center mb-4 text-success-600 dark:text-success-400 transition-colors">
                  <Award size={24} />
                </div>
                <h3 className="font-bold text-neutral-900 dark:text-white mb-1 transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-slate-400 mb-6 transition-colors">
                  {course.category}
                </p>

                <div className="flex items-center gap-2 text-xs text-neutral-400 dark:text-slate-500 mb-6 transition-colors">
                  <Calendar size={14} />
                  <span>Completed on {course.completedDate || "N/A"}</span>
                </div>

                <button className="w-full btn btn-outline btn-sm flex items-center justify-center gap-2 dark:text-white dark:border-slate-700 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <Download size={16} />
                  Download Certificate
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-neutral-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-neutral-300 dark:border-slate-700 transition-colors">
            <Award className="w-12 h-12 mx-auto text-neutral-300 dark:text-slate-600 mb-4 transition-colors" />
            <h3 className="text-neutral-900 dark:text-white font-medium mb-1 transition-colors">
              No certificates yet
            </h3>
            <p className="text-neutral-500 dark:text-slate-400 text-sm transition-colors">
              Complete training modules to earn certificates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
