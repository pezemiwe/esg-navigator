import React from "react";
import { CheckCircle, Clock, Lock, User, AlertTriangle } from "lucide-react";

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
  const getStepIcon = (status: string, isActive: boolean) => {
    if (isActive) return <Clock className="w-5 h-5 text-[#86BC25]" />;
    switch (status) {
      case "completed":
        return (
          <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        );
      case "in-progress":
        return <Clock className="w-5 h-5 text-[#86BC25]" />;
      case "pending-approval":
        return (
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        );
      case "available":
        return <User className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
      case "locked":
        return <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />;
      default:
        return <Lock className="w-5 h-5 text-slate-300 dark:text-slate-600" />;
    }
  };

  const getStepColor = (status: string, isActive: boolean) => {
    if (isActive)
      return "bg-slate-900 border-[#86BC25] text-white ring-2 ring-[#86BC25]/20 cursor-default";

    switch (status) {
      case "completed":
        return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 cursor-pointer hover:bg-emerald-100 dark:hover:bg-emerald-900/30";
      case "in-progress":
        return "bg-amber-50 dark:bg-amber-900/20 border-[#86BC25] text-amber-900 dark:text-amber-100 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30";
      case "pending-approval":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300";
      case "available":
        return "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-[#86BC25] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750";
      case "locked":
        return "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed";
      default:
        return "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed";
    }
  };

  const isStepClickable = (step: WorkflowStep) => {
    return (
      step.status === "available" ||
      step.status === "in-progress" ||
      step.status === "completed"
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-neutral-200 dark:border-slate-800 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <span className="w-1 h-6 bg-[#86BC25] rounded-full"></span>
        Workflow Progress
      </h3>
      <div className="space-y-4">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          return (
            <div
              key={step.id}
              onClick={() => isStepClickable(step) && onStepClick(step.id)}
              className={`group relative flex items-center gap-4 p-4 border rounded-xl transition-all duration-300 ${getStepColor(step.status, isActive)}`}
            >
              <div
                className={`p-2 rounded-full ${isActive ? "bg-slate-800" : "bg-white dark:bg-slate-950"} shadow-sm border ${isActive ? "border-[#86BC25]" : "border-slate-100 dark:border-slate-800"}`}
              >
                {getStepIcon(step.status, isActive)}
              </div>

              <div className="flex-1">
                <p className={`font-bold ${isActive ? "text-white" : ""}`}>
                  {step.name}
                </p>
                {step.assignedTo && (
                  <p
                    className={`text-xs mt-1 ${isActive ? "text-slate-300" : "text-slate-500 dark:text-slate-400"}`}
                  >
                    Assigned to: {step.assignedTo}
                  </p>
                )}
                {step.completedBy && step.completedDate && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Completed by {step.completedBy} on {step.completedDate}
                  </p>
                )}
              </div>

              {step.status === "pending-approval" && step.approver && (
                <div className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-200 px-3 py-1.5 rounded-full font-medium border border-amber-200 dark:border-amber-800">
                  Awaiting: {step.approver}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSteps;
