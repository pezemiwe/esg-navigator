import React from "react";
import { Clock, AlertTriangle, CheckCircle } from "lucide-react";
import { getPriorityColor } from "../utils";
import { useEsrmStore } from "../../../store/esrmStore";

interface PendingTasksProps {
  onNavigateToStep: (projectId: string, stepNumber: number) => void;
}

const PendingTasks: React.FC<PendingTasksProps> = ({ onNavigateToStep }) => {
  const searchTerm = "";
  const filterStatus = "all";
  const filterPriority = "all";

  const tasks = useEsrmStore((state) => state.tasks);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending Review":
      case "Awaiting Approval":
        return <Clock className="w-4 h-4" />;
      case "In Progress":
        return <CheckCircle className="w-4 h-4" />;
      case "Overdue":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.currentStep.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || task.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || task.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const taskCounts = {
    total: tasks.length,
    pending: tasks.filter(
      (t) => t.status === "Pending Review" || t.status === "Awaiting Approval",
    ).length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    overdue: tasks.filter((t) => t.status === "Overdue").length,
  };

  const getStepNumber = (stepName: string) => {
    const name = stepName.toLowerCase();
    if (name.includes("ess") || name.includes("screening")) return 1;
    if (name.includes("categorization")) return 2;
    if (name.includes("esdd") || name.includes("due diligence")) return 3;
    if (name.includes("esap") || name.includes("action plan")) return 4;
    if (name.includes("appraisal")) return 5;
    if (name.includes("monitoring")) return 6;
    return 1;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 dark:border-slate-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Pending Tasks
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Track work in progress and manage task assignments
            </p>
          </div>

          <div className="p-6 border-b border-gray-200 dark:border-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:border-[#86BC25] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Tasks
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {taskCounts.total}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:border-[#86BC25] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Pending
                    </p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {taskCounts.pending}
                    </p>
                  </div>
                  <Clock className="w-8 h-8 text-amber-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:border-[#86BC25] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {taskCounts.inProgress}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500" />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:border-[#86BC25] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Overdue
                    </p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {taskCounts.overdue}
                    </p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Task List
            </h3>
            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() =>
                    onNavigateToStep(task.id, getStepNumber(task.currentStep))
                  }
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-[#86BC25] transition-colors bg-white dark:bg-slate-800 shadow-sm flex justify-between items-center cursor-pointer group"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      {task.projectName}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {task.clientName}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {task.currentStep}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 text-rit">
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-bold ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority.toUpperCase()}
                    </span>
                    <span
                      className={`flex items-center text-xs gap-1 ${task.status === "Overdue" ? "text-red-600" : "text-slate-500"}`}
                    >
                      {getStatusIcon(task.status)}
                      {task.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Due: {task.dueDate}
                    </span>
                  </div>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                    No Pending Tasks
                  </h3>
                  <p className="text-xs text-slate-500 max-w-[200px] text-center">
                    You're all caught up! There are currently no tasks assigned
                    to you.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingTasks;
