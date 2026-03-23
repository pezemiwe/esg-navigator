import React from "react";
import { Check, CircleDot } from "lucide-react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  const steps = [
    { number: 1, name: "ESS", description: "Screening" },
    { number: 2, name: "Categorization", description: "Risk Level" },
    { number: 3, name: "ESDD", description: "Due Diligence" },
    { number: 4, name: "ESAP", description: "Action Plan" },
    { number: 5, name: "Appraisal", description: "Final Review" },
  ];

  const progressPercentage = Math.max(
    0,
    Math.min(100, ((currentStep - 1) / (steps.length - 1)) * 100),
  );

  return (
    <div className="w-full py-8 px-4">
      <div className="relative flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full -z-10" />

        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 bg-emerald-500 rounded-full -z-10 transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />

        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div
              key={step.number}
              className="relative flex flex-col items-center group"
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 z-10
                  ${
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-100"
                      : isActive
                        ? "bg-slate-900 dark:bg-slate-950 border-[#86BC25] text-[#86BC25] shadow-lg shadow-[#86BC25]/25 ring-4 ring-[#86BC25]/10 scale-125"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600"
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : isActive ? (
                  <CircleDot className="w-5 h-5 animate-pulse" />
                ) : (
                  <span className="text-xs font-bold font-mono">
                    {step.number}
                  </span>
                )}
              </div>

              <div
                className={`absolute top-14 flex flex-col items-center w-40 text-center transition-all duration-300 
                ${isActive ? "opacity-100 transform translate-y-0" : "opacity-70 group-hover:opacity-100"}
              `}
              >
                <span
                  className={`text-sm font-bold mb-0.5 tracking-tit
                    ${
                      isActive
                        ? "text-slate-900 dark:text-white"
                        : isCompleted
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-slate-400 dark:text-slate-500"
                    }
                  `}
                >
                  {step.name}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-600">
                  {step.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-14" />
    </div>
  );
};

export default ProgressBar;
