import { useState } from "react";
import {
  ChevronDown,
  Filter,
  FileUp,
  FileDown,
  Calendar,
  Trash2,
  AlertTriangle,
  X,
} from "lucide-react";
import { useEsrmStore } from "../../../store/esrmStore";

interface Project {
  currentStepPath: string;
  id: string;
  client: string;
  project: string;
  sector: string;
  facilityType: string;
  employees: number | string;
  date: string;
  isDraft?: boolean;
  riskCategory?: string;
}

interface ProjectsTableProps {
  projects?: Project[];
  onImportData?: () => void;
  onViewProject?: (project: Project) => void;
}

interface DisplayProject extends Project {
  statusText: string;
  statusColor: string;
  phaseText: string;
}

const phaseLabels: Record<string, string> = {
  ess: "ESS Screening",
  categorization: "Categorization",
  esdd: "ESDD",
  esap: "ESAP",
  appraisal: "Appraisal",
  monitoring: "Monitoring",
};

export default function ProjectsTable({
  projects,
  onImportData,
  onViewProject,
}: ProjectsTableProps) {
  const removeProject = useEsrmStore((state) => state.removeProject);
  const [deletingProject, setDeletingProject] = useState<DisplayProject | null>(
    null,
  );

  const handleDeleteConfirm = () => {
    if (deletingProject) {
      removeProject(deletingProject.id);
      setDeletingProject(null);
    }
  };

  const displayProjects: DisplayProject[] =
    projects && projects.length > 0
      ? [...projects]
          .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
          .map((p) => ({
            ...p,
            statusText: p.isDraft ? "Draft" : p.riskCategory || "Category C",
            phaseText: phaseLabels[p.currentStepPath] || "In Progress",
            statusColor: p.isDraft
              ? "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800"
              : p.riskCategory === "A" || p.riskCategory === "Category A"
                ? "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10"
                : p.riskCategory === "B" || p.riskCategory === "Category B"
                  ? "text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10"
                  : "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10",
          }))
      : [];

  return (
    <div className="bg-white dark:bg-[#0B1120] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
          Recent Projects
        </h3>
        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            onClick={onImportData}
            className="flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Import
          </button>
          <button className="flex items-center px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filter
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#F8FAFC] dark:bg-slate-800/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                CLIENT
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                PROJECT
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                SECTOR
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                RISK CATEGORY
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                FACILITY TYPE
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                EMPLOYEES
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                DATE
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap w-16">
                DEL
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {displayProjects.map((project) => (
              <tr
                key={project.id}
                onClick={() => onViewProject?.(project)}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        C
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {project.client}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {project.project}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {project.phaseText}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full inline-block"></span>
                    {project.sector}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${project.statusColor} border-current/20`}
                  >
                    {project.statusText}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {project.facilityType}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    {project.employees}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {project.date}
                  </div>
                </td>
                <td
                  className="px-6 py-4 text-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setDeletingProject(project)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deletingProject && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Delete Project
                </h3>
              </div>
              <button
                onClick={() => setDeletingProject(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
              Are you sure you want to delete this project? This action cannot
              be undone.
            </p>
            <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 mb-6">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {deletingProject.project}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {deletingProject.client}
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingProject(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
