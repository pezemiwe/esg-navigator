import { Link } from "react-router-dom";
import { BookOpen, PlayCircle } from "lucide-react";
import { useLearningStore } from "@/store/learningStore";

export default function MyLearning() {
  const { courses } = useLearningStore();

  const myCourses = courses.filter(
    (c) => c.status === "in_progress" || c.status === "completed",
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-linear-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-neutral-200 dark:border-slate-800 rounded-2xl p-8 md:p-10 shadow-lg relative overflow-hidden transition-colors">
        <div className="absolute top-0 rit-0 w-64 h-64 bg-[#86BC25]/5 dark:bg-[#86BC25]/5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-[#86BC25] rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-neutral-900" size={24} />
            </div>
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tit transition-colors">
              My Learning
            </h1>
          </div>
          <p className="text-lg text-neutral-600 dark:text-slate-400 font-medium transition-colors">
            Track your progress and continue your learning journey.
          </p>
        </div>
      </div>

      {myCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {myCourses.map((course) => (
            <Link
              key={course.id}
              to={`/capacity-building/course/${course.id}`}
              className="bg-white dark:bg-slate-900 border-2 border-neutral-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl hover:border-[#86BC25]/30 transition-all duration-300 flex flex-col group h-full cursor-pointer transform hover:-translate-y-1"
            >
              <div className="aspect-video bg-neutral-200 dark:bg-slate-800 relative">
                {course.videoUrl ? (
                  <img
                    src={`https://img.youtube.com/vi/${course.videoUrl.split("/").pop()}/hqdefault.jpg`}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all">
                  <PlayCircle className="text-neutral-900 dark:text-white opacity-0 group-hover:opacity-100 w-12 h-12 drop-shadow-lg transition-all" />
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col transition-colors">
                <h3 className="font-bold text-neutral-900 dark:text-white line-clamp-2 text-base mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-slate-400 mb-2 transition-colors">
                  {course.category}
                </p>

                <div className="mt-auto">
                  <div className="flex justify-between text-xs mb-1.5 font-medium text-neutral-500 dark:text-slate-400 transition-colors">
                    <span>{course.completionRate}% complete</span>
                  </div>
                  <div className="w-full bg-neutral-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden transition-colors">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${course.status === "completed" ? "bg-green-500" : "bg-[#86BC25]"}`}
                      style={{ width: `${course.completionRate}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-lg border border-neutral-200 dark:border-slate-800 transition-colors">
          <BookOpen
            className="mx-auto text-neutral-300 dark:text-slate-600 mb-3 transition-colors"
            size={48}
          />
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white transition-colors">
            No courses started
          </h3>
          <p className="text-neutral-500 dark:text-slate-400 mb-6 transition-colors">
            You haven't enrolled in any courses yet.
          </p>
          <Link
            to="/capacity-building/catalog"
            className="inline-flex items-center justify-center gap-2 bg-[#86BC25] text-neutral-900 px-6 py-2.5 rounded-md font-bold hover:bg-[#6B9B1E] transition-colors cursor-pointer"
          >
            Browse Catalog
          </Link>
        </div>
      )}
    </div>
  );
}
