/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Users, Bell, Search } from "lucide-react";
import Sidebar from "./components/Sidebar";
import KPICards from "@/features/esrm/components/KPICards.tsx";
import ProjectsTable from "./components/ProjectsTable";
import Charts from "@/features/esrm/components/Charts.tsx";
import CreateCustomer from "./components/CreateCustomer";
import PendingTasks from "./components/PendingTasks";
import CompletedProjects from "./components/CompletedProjects";
import ImportDataModal from "./components/ImportDataModal";
import { useEsrmStore } from "@/store/esrmStore";

import ESDDStep from "@/features/esrm/components/ESDDStep.tsx";
import ESAPStep from "./components/ESAPStep";
import CategorizationStep from "./components/CategorizationStep";
import AppraisalStep from "./components/AppraisalStep";
import MonitoringStep from "./components/MonitoringStep";
import MethodologyStep from "./components/MethodologyStep";
import AdminStep from "./components/AdminStep";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";
import { useAuthStore } from "@/store/authStore";

const STEP_VIEWS: Record<number, string> = {
  1: "ess",
  2: "categorization",
  3: "esdd",
  4: "esap",
  5: "appraisal",
  6: "monitoring",
};

function ESRM() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [showImportModal, setShowImportModal] = useState(false);
  const [newProjectFlowKey, setNewProjectFlowKey] = useState(0);

  const projects = useEsrmStore((state) => state.projects);
  const addProject = useEsrmStore((state) => state.addProject);
  const setCurrentProject = useEsrmStore((state) => state.setCurrentProject);
  const clearScoringResult = useEsrmStore((state) => state.clearScoringResult);

  const startNewProjectFlow = () => {
    setCurrentProject(null);
    clearScoringResult();
    setNewProjectFlowKey((current) => current + 1);
    navigate("/esrm/create-customer");
  };

  const getCurrentView = () => {
    const path = location.pathname.split("/").pop();
    if (!path || path === "esrm") return "dashboard";
    return path;
  };

  const currentView = getCurrentView();

  const handleSidebarNavigate = (view: string) => {
    if (view === "create-customer") {
      startNewProjectFlow();
      return;
    }

    navigate(view === "dashboard" ? "/esrm" : `/esrm/${view}`);
  };

  const handleImportData = (importedData: any[]) => {
    importedData.forEach((p) => addProject(p));
  };

  const handleCreateProject = (projectData: any) => {
    const state = useEsrmStore.getState();
    const existing = state.projects.find((p) => p.id === projectData.id);
    const newProject = {
      ...projectData,
      isDraft: false,
      status: "Active",
      progress: 5,
      currentStepPath: "ess",
      stepNumber: 1,
    };

    if (existing) {
      state.updateProject(projectData.id, newProject);
    } else {
      state.addProject(newProject);
    }

    state.setCurrentProject(projectData.id);
    navigate("ess");
  };

  const handleSaveDraft = (projectData: any) => {
    const state = useEsrmStore.getState();
    const exists = state.projects.find((p) => p.id === projectData.id);
    if (exists) {
      state.updateProject(projectData.id, { ...projectData, isDraft: true });
    } else {
      state.addProject({ ...projectData, isDraft: true });
    }
    state.setCurrentProject(projectData.id);
    navigate("/esrm"); // go back to dashboard
  };

  const handleNavigateToStep = (projectId: string, stepNumber: number) => {
    setCurrentProject(projectId);
    navigate(`/esrm/${STEP_VIEWS[stepNumber] || ""}`);
  };

  const handleViewCompletedProject = (projectId: string) => {
    setCurrentProject(projectId);
    navigate("/esrm/monitoring");
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100">
      <Sidebar
        onNavigate={handleSidebarNavigate}
        currentView={currentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? "md:ml-18" : "md:ml-64"
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 bg-white dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/60 px-6 shrink-0 z-30">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-sm font-semibold text-slate-900 dark:text-white">
                ESRM Dashboard
              </h1>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Environmental & Social Risk Management
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden lg:block">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-48 pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#86BC25]/40 focus:border-[#86BC25]/40 dark:text-white transition-all"
                />
              </div>
              <ThemeToggle />
              <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer">
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#86BC25] rounded-full" />
              </button>
              <button
                onClick={startNewProjectFlow}
                className="px-4 py-2 bg-[#86BC25] hover:bg-[#78aa20] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                New Project
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 space-y-6 min-h-0">
          <Routes>
            <Route
              path="create-customer"
              element={
                <CreateCustomer
                  key={`create-customer-${newProjectFlowKey}`}
                  onCreateProject={handleCreateProject}
                  onSaveDraft={handleSaveDraft}
                />
              }
            />
            <Route
              path="pending-tasks"
              element={<PendingTasks onNavigateToStep={handleNavigateToStep} />}
            />
            <Route
              path="completed-projects"
              element={
                <CompletedProjects onViewProject={handleViewCompletedProject} />
              }
            />
            <Route
              path="ess"
              element={
                <CreateCustomer
                  key={`ess-${currentView}-${newProjectFlowKey}`}
                  onCreateProject={handleCreateProject}
                  onSaveDraft={handleSaveDraft}
                />
              }
            />
            <Route path="categorization" element={<CategorizationStep />} />
            <Route path="esdd" element={<ESDDStep />} />
            <Route path="esap" element={<ESAPStep />} />
            <Route path="appraisal" element={<AppraisalStep />} />
            <Route path="monitoring" element={<MonitoringStep />} />
            <Route path="methodology" element={<MethodologyStep />} />
            <Route path="admin" element={<AdminStep />} />
            <Route
              index
              element={
                <>
                  {/* Welcome Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        Welcome back, {user?.name?.split(" ")[0] || "User"}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Here&apos;s your ESRM portfolio overview for today.
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tabular-nums">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  {projects.length > 0 ? (
                    <>
                      <KPICards />
                      {/* {currentProject && (
                        <WorkflowSteps
                          steps={workflowSteps}
                          currentStep={currentWorkflowStep}
                          onStepClick={setCurrentWorkflowStep}
                        />
                      )} */}
                      <ProjectsTable
                        projects={projects}
                        onImportData={() => setShowImportModal(true)}
                        onViewProject={(project) => {
                          setCurrentProject(project.id.toString());
                          navigate(project.currentStepPath || "ess");
                        }}
                      />
                      <Charts />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-12 mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6">
                        <Users className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        No Projects Yet
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                        You haven't added or completed any projects. Your
                        dashboard will populate once you begin processing ESRM
                        tasks.
                      </p>
                      <button
                        onClick={startNewProjectFlow}
                        className="px-6 py-2.5 bg-[#86BC25] hover:bg-[#78aa20] text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                      >
                        <Users className="w-4 h-4" />
                        Start New Project
                      </button>
                    </div>
                  )}
                </>
              }
            />
          </Routes>
        </main>

        <ImportDataModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImport={handleImportData}
        />
      </div>
    </div>
  );
}

export default ESRM;
