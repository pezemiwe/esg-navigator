import { Link } from "react-router-dom";
import { Clock, Award, BookOpen, CheckCircle2, PlayCircle } from "lucide-react";
import { useLearningStore } from "@/store/learningStore";
import { useAuthStore } from "@/store/authStore";
export default function LMSDashboard() {
  const { courses, completedCourses } = useLearningStore();
  const { user } = useAuthStore();
  const inProgressCount = courses.filter(
    (c) => c.status === "in_progress",
  ).length;
  const completedCount = completedCourses.length;
  const totalCourses = courses.length;
  const totalProgress = courses.reduce(
    (acc, curr) => acc + (curr.completionRate || 0),
    0,
  );
  const avgCompletion =
    totalCourses > 0 ? Math.round(totalProgress / totalCourses) : 0;
  return (
    <div className="space-y-8">
      <div className="bg-neutral-900 dark:bg-slate-900 rounded-xl p-8 md:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
        <div className="absolute top-0 rit-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#86BC25]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        <div className="flex-1 space-y-5 relative z-10">
          <h1 className="text-4xl font-bold text-white tracking-tit">
            Ready to learn, {user?.name?.split(" ")[0] || "User"}?
          </h1>
          <p className="text-neutral-300 text-lg max-w-xl leading-relaxed">
            Your progress matters. You have{" "}
            <span className="text-white font-semibold">
              {inProgressCount} courses
            </span>{" "}
            in progress. Invest in your future with our ESG curriculum.
          </p>
          <div className="flex gap-4 pt-2">
            <Link
              to="/capacity-building/my-learning"
              className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3.5 rounded-lg font-bold hover:bg-neutral-100 transition-colors shadow-sm"
            >
              Resume Learning
            </Link>
            <Link
              to="/capacity-building/catalog"
              className="inline-flex items-center justify-center gap-2 bg-transparent text-white border border-neutral-700 px-6 py-3.5 rounded-lg font-bold hover:bg-white/10 transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        </div>
        <div className="hidden lg:block relative z-10">
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-2xl transform rotate-3 transition-transform group-hover:rotate-0 duration-500">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <Award className="text-white" size={24} />
              </div>
              <div>
                <div className="text-xs text-neutral-300 font-bold uppercase tracking-wider">
                  Current Status
                </div>
                <div className="text-white font-bold text-lg">On Track</div>
              </div>
            </div>
            <div className="w-48 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Courses"
          value={totalCourses.toString()}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completion"
          value={`${avgCompletion}%`}
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={inProgressCount.toString()}
        />
        <StatCard
          icon={Award}
          label="Certificates"
          value={completedCount.toString()}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
              Pick up where you left off
            </h2>
            <Link
              to="/capacity-building/my-learning"
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
            >
              My Learning
            </Link>
          </div>
          <div className="space-y-4">
            {courses
              .filter((c) => c.status === "in_progress")
              .slice(0, 3)
              .map((course) => (
                <Link
                  key={course.id}
                  to={`/capacity-building/course/${course.id}`}
                  className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 hover:border-neutral-300 dark:hover:border-slate-700 hover:shadow-sm transition-all p-4 rounded-md flex gap-4 group cursor-pointer"
                >
                  <div className="w-40 h-24 bg-neutral-100 dark:bg-slate-800 shrink-0 relative overflow-hidden rounded">
                    {course.videoUrl ? (
                      <img
                        src={`https://img.youtube.com/vi/${course.videoUrl.split("/").pop()}/hqdefault.jpg`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/0 group-hover:bg-neutral-900/10 transition-all">
                      <PlayCircle className="text-neutral-900 dark:text-white opacity-0 group-hover:opacity-100 w-10 h-10 drop-shadow-md transition-all scale-90 group-hover:scale-100" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-slate-400">
                        <span>{course.duration}</span>
                        <span>•</span>
                        <span>{course.category}</span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1.5 font-medium text-neutral-500 dark:text-slate-400">
                        <span>{course.completionRate || 0}% complete</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#86BC25] h-full rounded-full transition-all duration-300"
                          style={{ width: `${course.completionRate || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            {courses.filter((c) => c.status === "in_progress").length === 0 && (
              <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-md border border-neutral-200 dark:border-slate-800">
                <BookOpen className="mx-auto h-10 w-10 text-neutral-300 dark:text-slate-600 mb-2" />
                <p className="text-neutral-500 dark:text-slate-400">
                  No courses in progress.
                </p>
                <Link
                  to="/capacity-building/catalog"
                  className="text-[#86BC25] font-bold text-sm hover:underline mt-2 inline-block"
                >
                  Start learning today
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white transition-colors">
            Recommended for you
          </h2>
          <div className="bg-transparent space-y-4">
            {courses.slice(0, 3).map((course) => (
              <Link
                to={`/capacity-building/course/${course.id}`}
                key={course.id}
                className="flex gap-4 p-3 rounded-lg hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer border border-transparent hover:border-neutral-200 dark:hover:border-slate-700"
              >
                <div className="w-24 h-16 bg-neutral-200 dark:bg-slate-700 rounded overflow-hidden shrink-0 relative">
                  {course.videoUrl ? (
                    <img
                      src={`https://img.youtube.com/vi/${course.videoUrl.split("/").pop()}/hqdefault.jpg`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-800" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {course.title}
                  </h3>
                  <div className="text-xs text-neutral-500 dark:text-slate-400 mt-1">
                    {course.category}
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs font-bold text-[#86BC25]">
                      4.8 ★
                    </span>
                    <span className="text-[10px] text-neutral-400">(120)</span>
                  </div>
                </div>
              </Link>
            ))}
            <Link
              to="/capacity-building/catalog"
              className="mt-4 block w-full text-center py-3 bg-white dark:bg-slate-800 text-sm font-bold text-neutral-900 dark:text-white hover:bg-neutral-50 dark:hover:bg-slate-700 rounded-lg border border-neutral-200 dark:border-slate-700 transition-colors shadow-sm"
            >
              View All Courses
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-md border border-neutral-200 dark:border-slate-800 flex items-center gap-4 transition-colors">
      <div className="p-3 bg-neutral-100 dark:bg-slate-800 rounded-full text-neutral-700 dark:text-slate-200 transition-colors">
        <Icon size={24} strokeWidth={2} />
      </div>
      <div>
        <div className="text-2xl font-bold text-neutral-900 dark:text-white transition-colors">
          {value}
        </div>
        <div className="text-sm text-neutral-500 dark:text-slate-400 font-medium transition-colors">
          {label}
        </div>
      </div>
    </div>
  );
}
