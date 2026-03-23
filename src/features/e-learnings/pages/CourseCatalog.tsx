import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { useLearningStore } from "@/store/learningStore";
export default function CourseCatalog() {
  const { courses } = useLearningStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const categories = ["All", ...new Set(courses.map((t) => t.category))];
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const currentCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-linear-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-neutral-200 dark:border-slate-800 rounded-2xl p-8 md:p-10 shadow-lg relative overflow-hidden transition-colors">
        <div className="absolute top-0 rit-0 w-64 h-64 bg-[#86BC25]/5 dark:bg-[#86BC25]/5 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-[#86BC25] rounded-xl flex items-center justify-center shadow-lg">
              <BookOpen className="text-neutral-900" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-neutral-900 dark:text-white tracking-tit">
                Course Library
              </h1>
              <p className="text-neutral-600 dark:text-slate-400 text-base font-medium mt-1">
                {filteredCourses.length} courses available • Explore ESG
                training modules
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="relative max-w-2xl">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-slate-500"
            size={22}
          />
          <input
            type="text"
            placeholder="What do you want to learn?"
            className="w-full pl-12 pr-4 py-4 border border-neutral-300 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-[#86BC25] focus:border-transparent placeholder-neutral-500 dark:placeholder-slate-500 bg-white dark:bg-slate-800 text-neutral-900 dark:text-white transition-all shadow-sm text-lg"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentPage(1);
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md"
                  : "bg-white dark:bg-slate-800 text-neutral-600 dark:text-slate-300 border border-neutral-200 dark:border-slate-700 hover:bg-neutral-100 dark:hover:bg-slate-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      {filteredCourses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentCourses.map((course) => (
              <Link
                key={course.id}
                to={`/capacity-building/course/${course.id}`}
                className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col group h-full cursor-pointer relative"
              >
                {course.id % 2 === 0 && (
                  <div className="absolute top-2 left-2 z-10 bg-[#86BC25] text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                    BESTSELLER
                  </div>
                )}
                <div className="aspect-video bg-neutral-200 dark:bg-slate-800 relative overflow-hidden">
                  {course.videoUrl ? (
                    <img
                      src={`https://img.youtube.com/vi/${course.videoUrl.split("/").pop()}/hqdefault.jpg`}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-neutral-900 dark:text-white line-clamp-2 text-base mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-neutral-500 dark:text-slate-400 mb-2 truncate">
                    {course.category}
                  </p>
                  <div className="flex items-center gap-1 mb-2">
                    <span className="text-sm font-bold text-[#86BC25]">
                      4.7
                    </span>
                    <div className="flex text-[#86BC25]">
                      {"★★★★".split("").map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                      <span className="text-neutral-300 dark:text-slate-600">
                        ★
                      </span>
                    </div>
                    <span className="text-xs text-neutral-400 dark:text-slate-500">
                      (204)
                    </span>
                  </div>
                  <div className="mt-auto pt-3 border-t border-neutral-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-neutral-500 dark:text-slate-400 font-medium">
                      {course.duration} • Intermediate
                    </span>
                    {course.status === "completed" ? (
                      <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                        Completed
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-neutral-900 dark:text-white">
                        Free
                      </span>
                    )}
                  </div>
                  {course.status === "in_progress" && (
                    <div className="w-full h-1 bg-neutral-100 dark:bg-slate-700 mt-3 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#86BC25]"
                        style={{ width: `${course.completionRate}%` }}
                      />
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-10 gap-2 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-3 rounded-lg border-2 border-neutral-300 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#86BC25] hover:border-[#86BC25] hover:text-neutral-900 text-neutral-700 dark:text-slate-400 transition-all cursor-pointer font-bold disabled:hover:bg-transparent disabled:hover:border-neutral-300 dark:disabled:hover:border-slate-700 disabled:hover:text-neutral-700 dark:disabled:hover:text-slate-400"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`min-w-11 h-11 rounded-lg font-bold text-sm transition-all cursor-pointer ${
                      currentPage === i + 1
                        ? "bg-[#86BC25] text-neutral-900 shadow-lg scale-110 border-2 border-[#86BC25]"
                        : "bg-white dark:bg-slate-800 border-2 border-neutral-300 dark:border-slate-700 text-neutral-700 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-700 hover:border-neutral-400 dark:hover:border-slate-600"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-3 rounded-lg border-2 border-neutral-300 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#86BC25] hover:border-[#86BC25] hover:text-neutral-900 text-neutral-700 dark:text-slate-400 transition-all cursor-pointer font-bold disabled:hover:bg-transparent disabled:hover:border-neutral-300 dark:disabled:hover:border-slate-700 disabled:hover:text-neutral-700 dark:disabled:hover:text-slate-400"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-lg border border-neutral-200 dark:border-slate-800 transition-colors">
          <div className="w-24 h-24 bg-neutral-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-neutral-300 dark:text-slate-600 transition-colors">
            <Search size={40} />
          </div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white transition-colors">
            No courses found
          </h3>
          <p className="text-neutral-500 dark:text-slate-400 mt-2 max-w-md mx-auto transition-colors">
            We couldn't find any courses matching "{searchTerm}" in the selected
            category. Try adjusting your search or filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedCategory("All");
            }}
            className="mt-6 text-[#86BC25] hover:text-[#6B9B1E] font-semibold transition-colors cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
