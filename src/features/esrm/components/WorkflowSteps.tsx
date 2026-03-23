import React from "react";
import {
  Check,
  Lock,
  ShieldAlert,
  Fingerprint,
  ChevronRight,
  Activity,
  Shield,
} from "lucide-react";

interface WorkflowStep {
  id: number;
  name: string;
  status:
    | "locked"
    | "available"
    | "in-progress"
    | "pending-approval"
    | "completed";
  assignedTo?: string;
  completedBy?: string;
  completedDate?: string;
  approver?: string;
}

interface WorkflowStepsProps {
  steps: WorkflowStep[];
  currentStep: number;
  onStepClick: (stepNumber: number) => void;
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  const isStepClickable = (step: WorkflowStep) => {
    return [
      "available",
      "in-progress",
      "completed",
      "pending-approval",
    ].includes(step.status);
  };

  const formatId = (id: number) => id.toString().padStart(2, "0");

  const getStatusDisplay = (
    status: WorkflowStep["status"],
    isActive: boolean,
  ) => {
    if (isActive) {
      return (
        <div className="flex items-center gap-2.5 text-[0.65rem] font-bold tracking-[0.2em] text-indigo-600 dark:text-indigo-400 uppercase">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Awaiting Action
        </div>
      );
    }

    switch (status) {
      case "completed":
        return (
          <div className="flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.2em] text-zinc-900 dark:text-zinc-100 uppercase">
            <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={3} />
            Verified
          </div>
        );
      case "pending-approval":
        return (
          <div className="flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.2em] text-amber-600 dark:text-amber-500 uppercase">
            <ShieldAlert className="w-3.5 h-3.5" strokeWidth={2.5} />
            Under Review
          </div>
        );
      case "available":
        return (
          <div className="flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.2em] text-zinc-400 dark:text-zinc-500 uppercase">
            Eligible
          </div>
        );
      case "locked":
      default:
        return (
          <div className="flex items-center gap-2 text-[0.65rem] font-bold tracking-[0.2em] text-zinc-300 dark:text-zinc-700 uppercase">
            <Lock className="w-3 h-3" strokeWidth={2.5} />
            Restricted
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#0A0A0C] rounded-[1.25rem] border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl shadow-zinc-200/20 dark:shadow-none overflow-hidden font-sans">
      {/* Header Section */}
      <div className="px-6 py-8 md:px-8 bg-zinc-50/40 dark:bg-transparent border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
              <span className="text-[0.65rem] font-bold tracking-[0.25em] text-zinc-900 dark:text-zinc-100 uppercase">
                Executive Clearance Log
              </span>
            </div>
            <h2 className="text-2xl tracking-tight font-medium text-zinc-800 dark:text-zinc-200">
              Chain of Custody
            </h2>
          </div>

          {/* Minimalist Progress Indicators */}
          <div className="flex items-center gap-1.5">
            {steps.map((s) => {
              const isPassed = s.id < currentStep || s.status === "completed";
              const isCurrent = s.id === currentStep;
              return (
                <div
                  key={s.id}
                  className={`h-1.5 rounded-full transition-all duration-700 ease-out ${
                    isCurrent
                      ? "w-8 bg-indigo-600 dark:bg-indigo-500"
                      : isPassed
                        ? "w-2.5 bg-zinc-800 dark:bg-zinc-200"
                        : "w-2.5 bg-zinc-200 dark:bg-zinc-800"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Roster Section */}
      <div className="p-3">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const clickable = isStepClickable(step);

          return (
            <div
              key={step.id}
              onClick={() => clickable && onStepClick(step.id)}
              className={`relative flex items-center p-4 md:p-5 rounded-2xl group transition-all duration-300 ${
                isActive
                  ? "bg-white dark:bg-[#121214] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] dark:shadow-none border border-zinc-200/80 dark:border-zinc-700/80 ring-1 ring-zinc-900/5 dark:ring-white/5 z-10"
                  : clickable
                    ? "hover:bg-zinc-50 dark:hover:bg-zinc-800/40 cursor-pointer border border-transparent"
                    : "opacity-40 cursor-not-allowed border border-transparent"
              }`}
            >
              {/* Sequential ID */}
              <div className="font-mono text-xs font-semibold tracking-wider text-zinc-400 dark:text-zinc-500 w-12 shrink-0">
                {formatId(step.id)}
              </div>

              {/* Data Core */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 items-center">
                <div className="flex flex-col justify-center min-w-0">
                  <h4
                    className={`text-[0.95rem] font-semibold tracking-tight truncate ${
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-900 dark:text-zinc-100"
                    }`}
                  >
                    {step.name}
                  </h4>

                  {/* Metadata Row */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.8rem] text-zinc-500 dark:text-zinc-400">
                    {step.assignedTo && (
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5" />
                        <span>
                          Owner:{" "}
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {step.assignedTo}
                          </span>
                        </span>
                      </span>
                    )}

                    {step.completedBy && step.completedDate && (
                      <>
                        <span className="hidden sm:block w-px h-3 bg-zinc-300 dark:bg-zinc-700"></span>
                        <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300">
                          <Fingerprint className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>
                            Digitally signed by{" "}
                            <span className="font-medium">
                              {step.completedBy}
                            </span>
                          </span>
                          <span className="text-zinc-400 dark:text-zinc-500 ml-1">
                            {step.completedDate}
                          </span>
                        </span>
                      </>
                    )}

                    {step.status === "pending-approval" && step.approver && (
                      <>
                        <span className="hidden sm:block w-px h-3 bg-zinc-300 dark:bg-zinc-700"></span>
                        <span className="text-amber-700 dark:text-amber-500 font-medium">
                          Escalated to {step.approver}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Secure Status Badge */}
                <div className="flex flex-row items-center justify-between lg:justify-end gap-6 mt-2 lg:mt-0">
                  {getStatusDisplay(step.status, isActive)}

                  {/* Micro Interaction Arrow */}
                  {clickable && !isActive ? (
                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all shrink-0" />
                  ) : (
                    <div className="w-4 h-4 shrink-0"></div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSteps;
