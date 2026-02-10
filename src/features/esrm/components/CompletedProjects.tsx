import React, { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import type { CompletedProject } from "../types";
import { getDecisionColor, getRiskBadgeColor } from "../utils";
import { downloadCSV } from "../utils/riskUtils";
import { mockCompletedProjects } from "../data/mockData";
import { usePagination } from "../hooks";

interface CompletedProjectsProps {
  onViewProject: (projectId: string) => void;
}

const CompletedProjects: React.FC<CompletedProjectsProps> = ({
  onViewProject,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDecision, setFilterDecision] = useState("all");
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [selectedProject, setSelectedProject] =
    useState<CompletedProject | null>(null);

  const completedProjects = mockCompletedProjects;

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case "Approve":
        return <CheckCircle className="w-4 h-4" />;
      case "Approve with Conditions":
        return <AlertTriangle className="w-4 h-4" />;
      case "Reject":
        return <XCircle className="w-4 h-4" />;
      case "Escalate":
        return <Eye className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  const handleProjectClick = (project: CompletedProject) => {
    setSelectedProject(project);
    setShowCompletedModal(true);
  };

  const handleMonitorProject = () => {
    if (selectedProject) {
      setShowCompletedModal(false);
      onViewProject(selectedProject.id);
    }
  };

  const filteredProjects = completedProjects.filter((project) => {
    const matchesSearch =
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.sector.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDecision =
      filterDecision === "all" || project.decision === filterDecision;

    return matchesSearch && matchesDecision;
  });

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    currentItems: currentProjects,
    goToPage,
    prevPage,
    nextPage,
  } = usePagination(filteredProjects, 10);

  const decisionCounts = {
    total: completedProjects.length,
    approved: completedProjects.filter((p) => p.decision === "Approve").length,
    approvedWithConditions: completedProjects.filter(
      (p) => p.decision === "Approve with Conditions",
    ).length,
    rejected: completedProjects.filter((p) => p.decision === "Reject").length,
    escalated: completedProjects.filter((p) => p.decision === "Escalate")
      .length,
  };

  const downloadReport = () => {
    const csvData = [
      [
        "Client Name",
        "Project Name",
        "Sector",
        "State",
        "Risk Category",
        "Facility Type",
        "Amount (M)",
        "Completed Date",
        "Decision",
        "Approver",
        "Authority Level",
        "Comments",
      ],
      ...completedProjects.map((project) => [
        project.clientName,
        project.projectName,
        project.sector,
        project.location,
        project.riskCategory,
        project.facilityType,
        project.estimatedAmount.toString(),
        project.completedDate,
        project.decision,
        project.approver,
        project.approvalAuthority,
        project.finalComments || "",
      ]),
    ];
    downloadCSV(csvData, "Completed_Projects_Report.csv");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Completed Projects
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View all projects that have completed the ESRM workflow process
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          {
            label: "Total Completed",
            count: decisionCounts.total,
            icon: CheckCircle,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            border: "border-amber-200 dark:border-amber-800",
          },
          {
            label: "Approved",
            count: decisionCounts.approved,
            icon: CheckCircle,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            border: "border-emerald-200 dark:border-emerald-800",
          },
          {
            label: "With Conditions",
            count: decisionCounts.approvedWithConditions,
            icon: AlertTriangle,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20",
            border: "border-amber-200 dark:border-amber-800",
          },
          {
            label: "Rejected",
            count: decisionCounts.rejected,
            icon: XCircle,
            color: "text-red-500",
            bg: "bg-red-50 dark:bg-red-900/20",
            border: "border-red-200 dark:border-red-800",
          },
          {
            label: "Escalated",
            count: decisionCounts.escalated,
            icon: Eye,
            color: "text-purple-500",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            border: "border-purple-200 dark:border-purple-800",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className={`${stat.bg} border ${stat.border} rounded-lg p-4 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider ${stat.color.replace("500", "600")}`}
                >
                  {stat.label}
                </p>
                <p
                  className={`text-2xl font-bold ${stat.color.replace("500", "900")} dark:text-white`}
                >
                  {stat.count}
                </p>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <select
                  value={filterDecision}
                  onChange={(e) => setFilterDecision(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="all">All Decisions</option>
                  <option value="Approve">Approved</option>
                  <option value="Approve with Conditions">
                    Approved with Conditions
                  </option>
                  <option value="Reject">Rejected</option>
                  <option value="Escalate">Escalated</option>
                </select>
              </div>
              <button
                onClick={downloadReport}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 text-sm font-bold cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Project Details
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Risk Category
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Completed Date
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Final Decision
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Approver
                </th>
                <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {currentProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-12 text-center text-slate-500 dark:text-slate-400"
                  >
                    No completed projects found
                  </td>
                </tr>
              ) : (
                currentProjects.map((project) => (
                  <tr
                    key={project.id}
                    onClick={() => handleProjectClick(project)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {project.projectName}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {project.clientName}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {project.sector} • {project.location}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskBadgeColor(project.riskCategory)}`}
                      >
                        {project.riskCategory}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-900 dark:text-white font-bold">
                      ${project.estimatedAmount.toFixed(2)}M
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{project.completedDate}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getDecisionColor(project.decision)}`}
                      >
                        {getDecisionIcon(project.decision)}
                        {project.decision}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {project.approver}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {project.approvalAuthority}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleProjectClick(project)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-bold cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredProjects.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {startIndex + 1}
              </span>{" "}
              to{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {Math.min(endIndex, filteredProjects.length)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredProjects.length}
              </span>{" "}
              entries
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-1 text-sm rounded transition-colors cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-[#86BC25] text-slate-900 font-bold"
                        : "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showCompletedModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="bg-slate-900 p-6 border-b border-[#86BC25]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-[#86BC25]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Process Already Completed
                    </h2>
                    <p className="text-slate-400 text-sm">
                      This project has finished the ESRM workflow
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCompletedModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-900 dark:text-white mb-4 uppercase text-xs tracking-wider">
                  Project Summary
                </h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                  <div>
                    <span className="font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Client
                    </span>
                    <div className="text-slate-900 dark:text-white font-medium">
                      {selectedProject.clientName}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Project
                    </span>
                    <div className="text-slate-900 dark:text-white font-medium">
                      {selectedProject.projectName}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Sector
                    </span>
                    <div className="text-slate-900 dark:text-white font-medium">
                      {selectedProject.sector}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      State
                    </span>
                    <div className="text-slate-900 dark:text-white font-medium">
                      {selectedProject.location}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Risk Category
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${getRiskBadgeColor(selectedProject.riskCategory)}`}
                    >
                      {selectedProject.riskCategory}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-slate-500 dark:text-slate-400 block mb-1">
                      Amount
                    </span>
                    <div className="text-slate-900 dark:text-white font-bold">
                      ${selectedProject.estimatedAmount.toFixed(2)}M
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`border rounded-lg p-5 ${getDecisionColor(selectedProject.decision)}`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {getDecisionIcon(selectedProject.decision)}
                  <span className="font-bold text-lg">
                    Final Decision: {selectedProject.decision}
                  </span>
                </div>
                <div className="text-sm space-y-2 pl-6 border-l-2 border-current/20 ml-2">
                  <p>
                    <strong>Approved by:</strong> {selectedProject.approver}
                  </p>
                  <p>
                    <strong>Authority Level:</strong>{" "}
                    {selectedProject.approvalAuthority}
                  </p>
                  <p>
                    <strong>Completed on:</strong>{" "}
                    {selectedProject.completedDate}
                  </p>
                  {selectedProject.finalComments && (
                    <div className="mt-3 pt-3 border-t border-current/20">
                      <p className="opacity-80 mb-1">
                        <strong>Comments:</strong>
                      </p>
                      <p className="italic">
                        "{selectedProject.finalComments}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={() => setShowCompletedModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleMonitorProject}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-900/20 flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-[#86BC25]" />
                  Go to Monitoring
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompletedProjects;
