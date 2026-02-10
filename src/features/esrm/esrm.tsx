/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Users } from "lucide-react";
import Sidebar from "./components/Sidebar";
import KPICards from "./components/KPICards";
import ProjectsTable from "./components/ProjectsTable";
import Charts from "./components/Charts";
import CreateCustomer from "./components/CreateCustomer";
import PendingTasks from "./components/PendingTasks";
import WorkflowSteps from "./components/WorkflowSteps";
import ESSStep from "./components/ESSStep";
import ESDDStep from "./components/ESDDStep";
import ESAPStep from "./components/ESAPStep";
import CategorizationStep from "./components/CategorizationStep";
import AppraisalStep from "./components/AppraisalStep";
import MonitoringStep from "./components/MonitoringStep";
import MethodologyStep from "./components/MethodologyStep";
import AdminStep from "./components/AdminStep";
import ImportDataModal from "./components/ImportDataModal";
import CompletedProjects from "./components/CompletedProjects";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";

const STEP_VIEWS: Record<number, string> = {
  1: "ess",
  2: "categorization",
  3: "esdd",
  4: "esap",
  5: "appraisal",
  6: "monitoring",
};

const initialProjects = [
  {
    id: 1,
    client: "Client 1",
    project: "Project 1",
    sector: "ICT",
    location: "Lagos",
    riskCategory: "B",
    facilityType: "Guarantee",
    employees: "1-20",
    estimatedAmount: 324.37,
    date: "2025-07-16",
  },
  {
    id: 2,
    client: "Client 2",
    project: "Project 2",
    sector: "Manufacturing",
    location: "Abuja",
    riskCategory: "B",
    facilityType: "OPEX",
    employees: "101-500",
    estimatedAmount: 24.99,
    date: "2025-01-22",
  },
  {
    id: 3,
    client: "Client 3",
    project: "Project 3",
    sector: "Energy",
    location: "Abuja",
    riskCategory: "C",
    facilityType: "CAPEX",
    employees: "101-500",
    estimatedAmount: 346.26,
    date: "2025-03-16",
  },
  {
    id: 4,
    client: "Client 4",
    project: "Project 4",
    sector: "ICT",
    location: "Abuja",
    riskCategory: "C",
    facilityType: "Working Capital",
    employees: "500+",
    estimatedAmount: 61.27,
    date: "2025-05-15",
  },
  {
    id: 5,
    client: "Client 5",
    project: "Project 5",
    sector: "ICT",
    location: "Abuja",
    riskCategory: "A",
    facilityType: "CAPEX",
    employees: "101-500",
    estimatedAmount: 478.49,
    date: "2025-04-20",
  },
  {
    id: 6,
    client: "Client 6",
    project: "Project 6",
    sector: "Manufacturing",
    location: "Rivers",
    riskCategory: "A",
    facilityType: "OPEX",
    employees: "101-500",
    estimatedAmount: 575.45,
    date: "2025-05-20",
  },
  {
    id: 7,
    client: "Client 7",
    project: "Project 7",
    sector: "Manufacturing",
    location: "Rivers",
    riskCategory: "B",
    facilityType: "OPEX",
    employees: "101-500",
    estimatedAmount: 88.58,
    date: "2025-05-20",
  },
  {
    id: 8,
    client: "Client 8",
    project: "Project 8",
    sector: "Agriculture",
    location: "Rivers",
    riskCategory: "A",
    facilityType: "OPEX",
    employees: "21-50",
    estimatedAmount: 562.4,
    date: "2025-04-20",
  },
  {
    id: 9,
    client: "Client 9",
    project: "Project 9",
    sector: "Agriculture",
    location: "Abuja",
    riskCategory: "C",
    facilityType: "CAPEX",
    employees: "1-20",
    estimatedAmount: 708.25,
    date: "2025-02-20",
  },
  {
    id: 10,
    client: "Client 10",
    project: "Project 10",
    sector: "Manufacturing",
    location: "Kano",
    riskCategory: "A",
    facilityType: "OPEX",
    employees: "101-500",
    estimatedAmount: 537.88,
    date: "2025-01-20",
  },
];

const workflowSteps = [
  {
    id: 1,
    name: "Environmental & Social Screening",
    status: "completed" as const,
    completedBy: "John Doe",
    completedDate: "2025-01-15",
  },
  {
    id: 2,
    name: "Risk Categorization",
    status: "in-progress" as const,
    assignedTo: "Sarah Johnson",
  },
  {
    id: 3,
    name: "Environmental & Social Due Diligence",
    status: "locked" as const,
  },
  {
    id: 4,
    name: "Environmental & Social Action Plan",
    status: "locked" as const,
  },
  { id: 5, name: "Appraisal & Conditions", status: "locked" as const },
  { id: 6, name: "Monitoring & Supervision", status: "locked" as const },
];

function ESRM() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [currentWorkflowStep, setCurrentWorkflowStep] = useState(1);
  const [showImportModal, setShowImportModal] = useState(false);
  const [projects, setProjects] = useState(initialProjects);

  const getCurrentView = () => {
    const path = location.pathname.split("/").pop();
    if (!path || path === "esrm") return "dashboard";
    return path;
  };

  const currentView = getCurrentView();

  const handleImportData = (importedData: any[]) => {
    setProjects((prev) => [...prev, ...importedData]);
  };

  const handleCreateProject = (projectData: any) => {
    setCurrentProject(projectData.id);
    setCurrentWorkflowStep(1);
    navigate("ess");
  };

  const handleNavigateToStep = (projectId: string, stepNumber: number) => {
    setCurrentProject(projectId);
    setCurrentWorkflowStep(stepNumber);
    navigate(`/esrm/${STEP_VIEWS[stepNumber] || ""}`);
  };

  const handleViewCompletedProject = (projectId: string) => {
    setCurrentProject(projectId);
    setCurrentWorkflowStep(6);
    navigate("/esrm/monitoring");
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen bg-neutral-50 dark:bg-slate-950 flex font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      <Sidebar
        onNavigate={(view) =>
          navigate(view === "dashboard" ? "/esrm" : `/esrm/${view}`)
        }
        currentView={currentView}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? "md:pl-[72px]" : "md:pl-72"}`}
      >
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm border-b border-gray-200 dark:border-slate-800 px-8 py-5 flex-shrink-0 z-10 transition-colors duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                ESRM Dashboard
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Environmental & Social Risk Management
              </p>
            </div>
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <button
                onClick={() => navigate("create-customer")}
                className="px-5 py-2.5 bg-[#86BC25] hover:bg-[#6B9B1E] text-slate-900 rounded-lg transition-all duration-200 flex items-center gap-2 font-bold text-sm shadow-sm hover:shadow-md cursor-pointer"
              >
                <Users className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 space-y-8 overflow-auto">
          <Routes>
            <Route
              path="create-customer"
              element={<CreateCustomer onCreateProject={handleCreateProject} />}
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
            <Route path="ess" element={<ESSStep />} />
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
                  <KPICards />
                  {currentProject && (
                    <WorkflowSteps
                      steps={workflowSteps}
                      currentStep={currentWorkflowStep}
                      onStepClick={setCurrentWorkflowStep}
                    />
                  )}
                  <ProjectsTable
                    projects={projects}
                    onImportData={() => setShowImportModal(true)}
                    onViewProject={(project) => {
                      setCurrentProject(project.id.toString());
                      setCurrentWorkflowStep(1);
                      navigate("ess");
                    }}
                  />
                  <Charts />
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
