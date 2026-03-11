import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  FileText,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  Shield,
  Send,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import NextPreparerModal from "./NextPreparerModal";
import type { ProjectData, ExclusionData, RiskQuestions } from "../types";
import {
  sectors,
  subSectors,
  nigerianStates,
  projectTypes,
  currencies,
  employeeRanges,
  exclusionItems,
  essPerformanceStandards,
} from "../data/formData";
import { getRecommendationColor, calculateESSRiskCategory } from "../utils";
import { useNextPreparerModal } from "../hooks";
import { useEsrmStore } from "../../../store/esrmStore";

const preparerOptions = [
  { value: "user1", label: "Sarah Johnson - ESG Officer" },
  { value: "user2", label: "Michael Chen - Senior Risk Analyst" },
  { value: "user3", label: "David Wilson - Risk Manager" },
];

const tabs = [
  { id: "project-info", label: "Project Information", icon: FileText },
  {
    id: "exclusion-screening",
    label: "Exclusion List Screening",
    icon: AlertTriangle,
  },
  {
    id: "risk-questions",
    label: "E&S Risk Trigger Questions",
    icon: HelpCircle,
  },
  {
    id: "recommendation",
    label: "Screening Recommendation",
    icon: CheckCircle,
  },
];

interface ESSStepProps {
  onSaveDraft?: (projectData: any) => void;
}

const ESSStep: React.FC<ESSStepProps> = ({ onSaveDraft }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("project-info");
  const {
    showModal: showApproverModal,
    nextPreparer,
    notificationSent,
    setNextPreparer,
    openModal: openApproverModal,
    closeModal: closeApproverModal,
    handleSubmit: handleApproverSubmit,
  } = useNextPreparerModal();

  const addTask = useEsrmStore((state) => state.addTask);
  const currentProjectId = useEsrmStore((state) => state.currentProjectId);
  const projects = useEsrmStore((state) => state.projects);
  const addProject = useEsrmStore((state) => state.addProject);
  const updateProject = useEsrmStore((state) => state.updateProject);
  const setCurrentProject = useEsrmStore((state) => state.setCurrentProject);

  const handleFinalSubmit = () => {
    let projId = currentProjectId;
    let proj = projects.find((p) => p.id === currentProjectId);

    if (!proj) {
      const categoryResult = calculateRiskCategory();
      const riskCat =
        categoryResult === "Excluded"
          ? "Excluded"
          : categoryResult.replace("Category ", "");
      projId = Date.now().toString();
      const newProj = {
        id: projId,
        client: projectData.clientName || "Unnamed Client",
        project: "New Project",
        sector: projectData.sector,
        location: projectData.projectLocation,
        riskCategory: riskCat,
        facilityType: projectData.facilityType || "N/A",
        employees: projectData.estimatedEmployees,
        estimatedAmount: parseFloat(projectData.estimatedAmount as any) || 0,
        date: new Date().toISOString().split("T")[0],
        status: "Active",
        progress: 15,
        currentStepPath: "categorization",
        stepNumber: 2,
        isDraft: false,
      };
      addProject(newProj);
      setCurrentProject(projId);
      proj = newProj;
    } else {
      updateProject(projId as string, {
        currentStepPath: "categorization",
        stepNumber: 2,
        isDraft: false,
      });
    }

    if (nextPreparer) {
      addTask({
        id: Date.now().toString(),
        projectName: proj.project,
        clientName: proj.client,
        currentStep: "Risk Categorization",
        priority: "High",
        dueDate: new Date(Date.now() + 86400000 * 3)
          .toISOString()
          .split("T")[0],
        assignedBy: "You",
        status: "Pending Review",
      });
    }

    handleApproverSubmit(() => {
      navigate("../categorization");
    });
  };

  const handleSaveDraftLocal = () => {
    if (onSaveDraft) {
      const categoryResult = calculateRiskCategory();
      const riskCat =
        categoryResult === "Excluded"
          ? "Excluded"
          : categoryResult.replace("Category ", "") || "Draft";

      onSaveDraft({
        id: Date.now(),
        client: projectData.clientName || "Unnamed Draft",
        project: "New Project",
        sector: projectData.sector,
        location: projectData.projectLocation,
        riskCategory: riskCat,
        facilityType: projectData.facilityType || "N/A",
        employees: projectData.estimatedEmployees,
        estimatedAmount: parseFloat(projectData.estimatedAmount) || 0,
        date: new Date().toISOString().split("T")[0],
        currentStepPath: "ess",
        stepNumber: 1,
      });
    }
  };

  const [projectData, setProjectData] = useState<ProjectData>({
    clientName: "",
    facilityType: "",
    sector: "General",
    subSector: "Logistics",
    projectLocation: "Abia",
    projectType: "CAPEX",
    currency: "Naira",
    estimatedAmount: "0",
    estimatedEmployees: "1-20",
  });

  const [exclusionData, setExclusionData] = useState<ExclusionData>({
    weapons: false,
    tobacco: false,
    adultEntertainment: false,
    gambling: false,
    forcedLabor: false,
    illegalLogging: false,
    radioactiveMaterials: false,
    hazardousChemicals: false,
    conflictMinerals: false,
    unlicensedWaste: false,
    coralReef: false,
    culturalHeritage: false,
    bannedActivities: false,
  });

  const [riskQuestions, setRiskQuestions] = useState<RiskQuestions>({
    ps1_significant_risks: "",
    ps1_impact_assessment: "",
    ps2_employment: "",
    ps2_health_safety: "",
    ps3_emissions: "",
    ps3_water_energy: "",
    ps4_communities: "",
    ps4_health_risks: "",
    ps5_land_acquisition: "",
    ps5_economic_displacement: "",
    ps6_biodiversity: "",
    ps6_endangered_species: "",
    ps7_indigenous_peoples: "",
    ps7_fpic: "",
    ps8_cultural_heritage: "",
    ps8_tangible_heritage: "",
  });

  const calculateRiskCategory = () =>
    calculateESSRiskCategory(exclusionData, riskQuestions);

  const renderProjectInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Client Name
          </label>
          <input
            type="text"
            value={projectData.clientName}
            onChange={(e) =>
              setProjectData({ ...projectData, clientName: e.target.value })
            }
            className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="Enter client name"
            required
          />
          {!projectData.clientName.trim() && (
            <p className="text-xs text-red-500 mt-1">Client name is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Facility Type
          </label>
          <input
            type="text"
            value={projectData.facilityType}
            onChange={(e) =>
              setProjectData({ ...projectData, facilityType: e.target.value })
            }
            className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            placeholder="Enter facility type"
            required
          />
          {!projectData.facilityType.trim() && (
            <p className="text-xs text-red-500 mt-1">
              Facility type is required
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Sector
          </label>
          <div className="relative">
            <select
              value={projectData.sector}
              onChange={(e) =>
                setProjectData({ ...projectData, sector: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10"
            >
              {sectors.map((sector) => (
                <option key={sector} value={sector}>
                  {sector}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Sub-sector
          </label>
          <div className="relative">
            <select
              value={projectData.subSector}
              onChange={(e) =>
                setProjectData({ ...projectData, subSector: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10"
            >
              {subSectors.map((subSector) => (
                <option key={subSector} value={subSector}>
                  {subSector}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Project State
          </label>
          <div className="relative">
            <select
              value={projectData.projectLocation}
              onChange={(e) =>
                setProjectData({
                  ...projectData,
                  projectLocation: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10"
            >
              {nigerianStates.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Project Type
          </label>
          <div className="relative">
            <select
              value={projectData.projectType}
              onChange={(e) =>
                setProjectData({ ...projectData, projectType: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10"
            >
              {projectTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Currency
            </label>
            <div className="relative">
              <select
                value={projectData.currency}
                onChange={(e) =>
                  setProjectData({ ...projectData, currency: e.target.value })
                }
                className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10"
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Est. Amount
            </label>
            <input
              type="number"
              value={projectData.estimatedAmount}
              onChange={(e) =>
                setProjectData({
                  ...projectData,
                  estimatedAmount: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Employees
          </label>
          <div className="relative">
            <select
              value={projectData.estimatedEmployees}
              onChange={(e) =>
                setProjectData({
                  ...projectData,
                  estimatedEmployees: e.target.value,
                })
              }
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10"
            >
              {employeeRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={() => setActiveTab("exclusion-screening")}
          disabled={
            !projectData.clientName.trim() ||
            !projectData.facilityType.trim() ||
            !projectData.estimatedAmount ||
            projectData.estimatedAmount === "0"
          }
          className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Proceed to Exclusion Screening
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>
      </div>
    </div>
  );

  const renderExclusionScreening = () => (
    <div className="space-y-6">
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <div className="flex gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            Check any activities that apply to the project. If any of these are
            selected, the project may be excluded from financing.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exclusionItems.map((item) => (
          <label
            key={item.key}
            className={`
                flex items-center p-4 rounded-lg border cursor-pointer transition-all
                ${
                  exclusionData[item.key]
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }
            `}
          >
            <input
              type="checkbox"
              checked={exclusionData[item.key]}
              onChange={(e) =>
                setExclusionData({
                  ...exclusionData,
                  [item.key]: e.target.checked,
                })
              }
              className="w-5 h-5 text-red-600 border-slate-300 rounded focus:ring-red-500 mr-3"
            />
            <span
              className={`text-sm font-medium ${exclusionData[item.key] ? "text-red-800 dark:text-red-200" : "text-slate-700 dark:text-slate-300"}`}
            >
              {item.label}
            </span>
          </label>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={() => setActiveTab("risk-questions")}
          className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
        >
          Proceed to Risk Questions
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>
      </div>
    </div>
  );

  const renderRiskQuestions = () => (
    <div className="space-y-8">
      {essPerformanceStandards.map((ps, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm"
        >
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-3 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-wide">
              {ps.title}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {ps.questions.map((q) => (
              <div
                key={q.key}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-dashed border-slate-100 dark:border-slate-700 last:border-0"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-normal max-w-2xl">
                  {q.text}
                </span>
                <div className="flex items-center gap-4 shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={q.key}
                      value="yes"
                      checked={riskQuestions[q.key] === "yes"}
                      onChange={() =>
                        setRiskQuestions({ ...riskQuestions, [q.key]: "yes" })
                      }
                      className="w-4 h-4 text-[#86BC25] border-slate-300 focus:ring-[#86BC25]"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Yes
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={q.key}
                      value="no"
                      checked={riskQuestions[q.key] === "no"}
                      onChange={() =>
                        setRiskQuestions({ ...riskQuestions, [q.key]: "no" })
                      }
                      className="w-4 h-4 text-[#86BC25] border-slate-300 focus:ring-[#86BC25]"
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      No
                    </span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end pt-4">
        <button
          onClick={() => setActiveTab("recommendation")}
          className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
        >
          View Recommendation
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>
      </div>
    </div>
  );

  const renderRecommendation = () => {
    const category = calculateRiskCategory();
    const colorClass = getRecommendationColor(category);

    return (
      <div className="max-w-3xl mx-auto space-y-8 text-center pt-8">
        <div
          className={`p-8 rounded-xl border-2 ${colorClass} bg-opacity-10 dark:bg-opacity-10`}
        >
          <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">
            Risk Categorization Result
          </h2>
          <div className="text-5xl font-black my-6 tracking-tit bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
            {category}
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            Based on the information provided, this project has been categorized
            as <strong>{category}</strong>.
            {category === "Category A" &&
              " Detailed ESDD and hi-level approval required."}
            {category === "Category B" && " Standard ESDD required."}
            {category === "Category C" && " Minimal E&S risks expected."}
            {category === "Excluded" &&
              " Financing for this project is likely prohibited."}
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={handleSaveDraftLocal}
            className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium cursor-pointer"
          >
            Save Draft
          </button>
          <button
            onClick={openApproverModal}
            className="px-6 py-3 bg-[#86BC25] hover:bg-[#6B9B1E] text-slate-900 rounded-lg shadow-md transition-all font-bold flex items-center gap-2 cursor-pointer"
          >
            Submit for Review
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-900 px-6 py-5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#86BC25]" />
                  Step 1: Environmental and Social Screening
                </h1>
                <p className="text-slate-300 mt-1 text-sm">
                  Initial project screening, exclusion list check, and risk
                  categorization.
                </p>
              </div>
              <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded border border-slate-700">
                Phase 1 of 5
              </div>
            </div>
          </div>

          <div className="p-6">
            <ProgressBar currentStep={1} />

            <div className="mb-8 border-b border-slate-200 dark:border-slate-700">
              <nav className="flex space-x-8 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer
                        ${
                          isActive
                            ? "border-[#86BC25] text-[#86BC25]"
                            : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                        }
                      `}
                    >
                      <Icon
                        className={`w-4 h-4 ${isActive ? "text-[#86BC25]" : "text-slate-400"}`}
                      />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="min-h-100">
              {activeTab === "project-info" && renderProjectInfo()}
              {activeTab === "exclusion-screening" &&
                renderExclusionScreening()}
              {activeTab === "risk-questions" && renderRiskQuestions()}
              {activeTab === "recommendation" && renderRecommendation()}
            </div>
          </div>
        </div>
      </div>

      <NextPreparerModal
        showModal={showApproverModal}
        nextPreparer={nextPreparer}
        notificationSent={notificationSent}
        onClose={closeApproverModal}
        onSubmit={handleFinalSubmit}
        onPreparerChange={setNextPreparer}
        preparerOptions={preparerOptions}
      />
    </div>
  );
};

export default ESSStep;
