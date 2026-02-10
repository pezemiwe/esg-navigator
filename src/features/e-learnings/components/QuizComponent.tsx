import React from "react";
import { Award, ArrowRight, Send } from "lucide-react";
import type { Training } from "../types";

interface QuizComponentProps {
  training: Training;
  answers: Record<number, number>;
  onAnswer: (questionId: number, answerIndex: number) => void;
  currentQuestion: number;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
}

const QuizComponent: React.FC<QuizComponentProps> = ({
  training,
  answers,
  onAnswer,
  currentQuestion,
  onNext,
  onPrev,
  onSubmit,
}) => {
  if (!training.quiz) return null;

  const question = training.quiz.questions[currentQuestion];
  const totalQuestions = training.quiz.questions.length;
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  const allAnswered = training.quiz.questions.every(
    (q) => answers[q.id] !== undefined,
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-neutral-200 dark:border-slate-800 shadow-sm p-6 max-w-3xl mx-auto transition-colors">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <Award className="text-[#86BC25]" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
            Quiz Assessment
          </h3>
          <p className="text-sm text-neutral-600 dark:text-slate-400">
            Question {currentQuestion + 1} of {totalQuestions} • Passing Score:{" "}
            {training.quiz.passingScore}%
          </p>
        </div>
      </div>

      <div className="mb-8">
        <div className="w-full h-2 bg-neutral-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-r from-[#86BC25] to-amber-500 transition-all duration-300 rounded-full"
            style={{
              width: `${((currentQuestion + 1) / totalQuestions) * 100}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold text-neutral-800 dark:text-slate-200 mb-6 leading-relaxed">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = answers[question.id] === index;
            return (
              <div
                key={index}
                className={`
                  p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4
                  ${
                    isSelected
                      ? "border-[#3B82F6] bg-blue-50 dark:bg-blue-900/20"
                      : "border-neutral-200 dark:border-slate-700 hover:border-neutral-300 dark:hover:border-slate-600 hover:bg-neutral-50 dark:hover:bg-slate-800"
                  }
                `}
                onClick={() => onAnswer(question.id, index)}
              >
                <div
                  className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                  ${isSelected ? "border-[#3B82F6] bg-[#3B82F6]" : "border-neutral-300 dark:border-slate-600"}
                `}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                  )}
                </div>
                <span
                  className={`text-base ${isSelected ? "text-neutral-900 dark:text-white font-medium" : "text-neutral-700 dark:text-slate-300"}`}
                >
                  {option}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t border-neutral-100 dark:border-slate-800">
        <button
          className="px-4 py-2 text-neutral-600 dark:text-slate-400 hover:text-neutral-900 dark:hover:text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={currentQuestion === 0}
          onClick={onPrev}
        >
          Previous
        </button>

        <span className="text-sm text-neutral-500 dark:text-slate-500 hidden sm:block">
          {Object.keys(answers).length} of {totalQuestions} answered
        </span>

        {isLastQuestion ? (
          <button
            className="flex items-center gap-2 px-6 py-2.5 bg-[#006B3E] text-white rounded-lg font-medium hover:bg-[#005a34] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-green-900/10"
            disabled={!allAnswered}
            onClick={onSubmit}
          >
            <Send size={16} /> Submit Quiz
          </button>
        ) : (
          <button
            className="flex items-center gap-2 px-6 py-2.5 bg-[#006B3E] dark:bg-[#006B3E] text-white rounded-lg font-medium hover:bg-[#005a34] transition-all shadow-sm"
            onClick={onNext}
          >
            Next <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default QuizComponent;
