import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  PlayCircle,
  FileText,
  AlertCircle,
  Award,
  BookOpen,
  Share2,
  MoreVertical,
} from "lucide-react";
import QuizComponent from "../components/QuizComponent";
import { useLearningStore } from "@/store/learningStore";
import { useToast } from "../components/ui/ToastContext";

const getVideoUrl = (url: string) => {
  if (url.includes("embed")) {
    return `${url}?modestbranding=1&rel=0&showinfo=0`;
  }
  return url;
};

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { courses, completeCourse, startCourse } = useLearningStore();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<"content" | "quiz">("content");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const course =
    courses.find((t) => t.id === parseInt(courseId || "0")) || null;
  const completed = course?.status === "completed";
  useEffect(() => {
    if (courseId) {
      if (!course) {
        navigate("/capacity-building/catalog");
      } else if (course.status === "not_started") {
        startCourse(course.id);
      }
    }
  }, [courseId, course, navigate, startCourse]);
  if (!course) return null;
  const handleQuizAnswer = (questionId: number, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };
  const handleNextQuestion = () => {
    if (course.quiz && currentQuestion < course.quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };
  const handleQuizSubmit = () => {
    let correctCount = 0;
    course.quiz?.questions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        correctCount++;
      }
    });
    completeCourse(course.id);
    setActiveTab("content");
    addToast(
      `Quiz Submitted! You scored ${correctCount}/${course.quiz?.questions.length}`,
      "success",
    );
    setTimeout(() => {
      addToast("Course Completed! Certificate unlocked.", "success");
    }, 1500);
  };
  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8 bg-white dark:bg-linear-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 border border-neutral-200 dark:border-slate-800 rounded-2xl p-8 shadow-lg transition-colors">
        <nav className="flex items-center gap-2 text-sm text-neutral-600 dark:text-slate-400 mb-5 font-medium transition-colors">
          <Link
            to="/capacity-building"
            className="hover:text-[#86BC25] transition-colors"
          >
            Safety Building
          </Link>
          <span className="text-neutral-300 dark:text-slate-600">/</span>
          <Link
            to="/capacity-building/catalog"
            className="hover:text-[#86BC25] transition-colors"
          >
            Catalog
          </Link>
          <span className="text-neutral-300 dark:text-slate-600">/</span>
          <span className="text-neutral-900 dark:text-white font-medium truncate max-w-50 transition-colors">
            {course.title}
          </span>
        </nav>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-[#86BC25]/10 text-[#86BC25] border border-[#86BC25]/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                {course.category}
              </span>
              {completed && (
                <div className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors">
                  <Award size={14} />
                  Completed
                </div>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-2 font-heading tracking-tit transition-colors">
              {course.title}
            </h1>
            <p className="text-lg text-neutral-500 dark:text-slate-400 max-w-3xl leading-relaxed transition-colors">
              {course.description}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 text-neutral-500 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
              <Share2 size={20} />
            </button>
            <button className="p-2.5 rounded-xl border border-neutral-200 dark:border-slate-700 text-neutral-500 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-black rounded-2xl overflow-hidden shadow-2xl shadow-neutral-900/20 aspect-video relative group ring-1 ring-white/10">
            {activeTab === "content" ? (
              <iframe
                src={getVideoUrl(course.videoUrl || "")}
                title={course.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center text-center p-8">
                <div className="max-w-md">
                  <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-[#86BC25]" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    Quiz Session
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-lg leading-relaxed">
                    Complete the following questions to verify your
                    understanding and earn your certificate.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-100 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
            <div className="flex border-b border-neutral-200 dark:border-slate-800 transition-colors">
              <button
                onClick={() => setActiveTab("content")}
                className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "content"
                    ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                    : "border-transparent text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-200"
                }`}
              >
                Course Content
              </button>
              <button
                onClick={() => setActiveTab("quiz")}
                className={`px-8 py-4 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
                  activeTab === "quiz"
                    ? "border-neutral-900 dark:border-white text-neutral-900 dark:text-white"
                    : "border-transparent text-neutral-500 dark:text-slate-400 hover:text-neutral-700 dark:hover:text-slate-200"
                }`}
              >
                Assessment Quiz
              </button>
            </div>
            <div className="p-6 md:p-8">
              {activeTab === "content" ? (
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                    <BookOpen className="text-[#86BC25]" size={24} />
                    About this course
                  </h3>
                  <p className="text-neutral-600 dark:text-slate-400 leading-relaxed text-lg transition-colors">
                    This module covers essential aspects of{" "}
                    <span className="font-semibold text-neutral-900 dark:text-white transition-colors">
                      {course.title}
                    </span>
                    . Proper understanding of these concepts is crucial for
                    maintaining Deloitte's commitment to Environmental, Social,
                    and Governance standards.
                  </p>
                  <div className="bg-neutral-50 dark:bg-slate-800 rounded-xl p-6 border border-neutral-100 dark:border-slate-700 mt-8 transition-colors">
                    <h4 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 transition-colors">
                      Key Learning Objectives
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-neutral-600 dark:text-slate-400 transition-colors">
                        <div className="min-w-1.5 w-1.5 h-1.5 bg-[#86BC25] rounded-full mt-2" />
                        <span>
                          Understand the regulatory framework and international
                          standards guiding ESG practices.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-neutral-600 dark:text-slate-400 transition-colors">
                        <div className="min-w-1.5 w-1.5 h-1.5 bg-[#86BC25] rounded-full mt-2" />
                        <span>
                          Identify key risk factors, financial implications, and
                          mitigation strategies.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-neutral-600 dark:text-slate-400 transition-colors">
                        <div className="min-w-1.5 w-1.5 h-1.5 bg-[#86BC25] rounded-full mt-2" />
                        <span>
                          Apply best practices in daily banking operations and
                          client engagement.
                        </span>
                      </li>
                      <li className="flex items-start gap-3 text-neutral-600 dark:text-slate-400 transition-colors">
                        <div className="min-w-1.5 w-1.5 h-1.5 bg-[#86BC25] rounded-full mt-2" />
                        <span>
                          Recognize reporting requirements, metrics, and
                          disclosure timelines.
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  {course.quiz ? (
                    <QuizComponent
                      training={course}
                      answers={answers}
                      onAnswer={handleQuizAnswer}
                      currentQuestion={currentQuestion}
                      onNext={handleNextQuestion}
                      onPrev={handlePrevQuestion}
                      onSubmit={handleQuizSubmit}
                    />
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 bg-neutral-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-300 dark:text-slate-600 transition-colors">
                        <AlertCircle size={32} />
                      </div>
                      <h4 className="text-lg font-bold text-neutral-900 dark:text-white transition-colors">
                        No quiz available
                      </h4>
                      <p className="text-neutral-500 dark:text-slate-400 mt-1 transition-colors">
                        This module does not strictly require an assessment.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-neutral-100 dark:border-slate-800 shadow-sm p-6 sticky top-6 transition-colors">
            <h3 className="font-bold text-neutral-900 dark:text-white mb-6 flex items-center justify-between transition-colors">
              <span>Course Progress</span>
              <span className="text-xs font-normal bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-slate-300 px-2 py-1 rounded transition-colors">
                Module 1 of 1
              </span>
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between text-sm mb-2 text-neutral-700 dark:text-slate-300 transition-colors">
                  <span className="font-medium">Overall Completion</span>
                  <span className="font-bold text-neutral-900 dark:text-white transition-colors">
                    {completed ? "100%" : "0%"}
                  </span>
                </div>
                <div className="w-full bg-neutral-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden transition-colors">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${completed ? "bg-green-500" : "bg-[#86BC25]"}`}
                    style={{ width: completed ? "100%" : "0%" }}
                  ></div>
                </div>
              </div>
              <div className="space-y-1">
                <div
                  className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "content" ? "bg-[#86BC25]/10 border border-[#86BC25]/20" : "hover:bg-neutral-50 dark:hover:bg-slate-800"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeTab === "content" ? "bg-[#86BC25] text-neutral-900" : "bg-neutral-100 dark:bg-slate-700 text-neutral-400 dark:text-slate-400"}`}
                  >
                    {completed ? (
                      <CheckCircle size={16} />
                    ) : (
                      <PlayCircle size={16} />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold transition-colors ${activeTab === "content" ? "text-neutral-900 dark:text-white" : "text-neutral-600 dark:text-slate-400"}`}
                    >
                      Video Module
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-slate-500 transition-colors">
                      {course.duration}
                    </p>
                  </div>
                </div>
                <div
                  className={`p-3 rounded-lg flex items-center gap-3 transition-colors ${activeTab === "quiz" ? "bg-[#86BC25]/10 border border-[#86BC25]/20" : "hover:bg-neutral-50 dark:hover:bg-slate-800"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${activeTab === "quiz" ? "bg-[#86BC25] text-neutral-900" : "bg-neutral-100 dark:bg-slate-700 text-neutral-400 dark:text-slate-400"}`}
                  >
                    {completed ? (
                      <CheckCircle size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-sm font-semibold transition-colors ${activeTab === "quiz" ? "text-neutral-900 dark:text-white" : "text-neutral-600 dark:text-slate-400"}`}
                    >
                      Assessment
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-slate-500 transition-colors">
                      5 Questions
                    </p>
                  </div>
                </div>
              </div>
              {completed ? (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800/30 text-center transition-colors">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800/20 rounded-full flex items-center justify-center mx-auto mb-2 text-green-600 dark:text-green-400 transition-colors">
                    <Award size={24} />
                  </div>
                  <h4 className="font-bold text-green-900 dark:text-green-300 text-sm transition-colors">
                    Congratulations!
                  </h4>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1 mb-3 transition-colors">
                    You've successfully completed this module.
                  </p>
                  <button className="w-full py-2 bg-green-600 hover:bg-green-700 text-white dark:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm shadow-green-200 dark:shadow-none">
                    Download Certificate
                  </button>
                </div>
              ) : (
                <div className="bg-neutral-50 dark:bg-slate-800 rounded-xl p-4 border border-neutral-100 dark:border-slate-700 text-center transition-colors">
                  <p className="text-xs text-neutral-500 dark:text-slate-400 transition-colors">
                    Complete all sections to unlock your certificate.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
