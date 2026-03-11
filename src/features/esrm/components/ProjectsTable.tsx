import { ChevronDown, Filter, FileUp, FileDown, Calendar } from "lucide-react";

interface Project {
  id: string;
  client: string;
  project: string;
  sector: string;
  facilityType: string;
  employees: number;
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
}

export default function ProjectsTable({
  projects,
  onImportData,
  onViewProject,
}: ProjectsTableProps) {
  const displayProjects: DisplayProject[] =
    projects && projects.length > 0
      ? projects.map((p) => ({
          ...p,
          statusText: p.isDraft ? "Draft" : p.riskCategory || "Category C",
          statusColor: p.isDraft
            ? "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800"
            : p.riskCategory === "Category A"
              ? "text-rose-700 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10"
              : p.riskCategory === "Category B"
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
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
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
                    {project.project}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
