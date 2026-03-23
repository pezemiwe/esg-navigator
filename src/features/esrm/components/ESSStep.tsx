import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  FileText,
  AlertTriangle,
  Shield,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import NextPreparerModal from "./NextPreparerModal";
import type { ProjectData, ExclusionData } from "../types";
import {
  sectors,
  subSectorsBySector,
  nigerianStates,
  projectTypes,
  currencies,
  employeeRanges,
  exclusionItems,
  facilityTermOptions,
} from "../data/formData";
import { preAssessmentQuestions } from "../data/scoringData";
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

const psNames: Record<string, string> = {
  ps2: "PS2 \u2013 Labour & Working Conditions",
  ps3: "PS3 \u2013 Resource Efficiency & Pollution Prevention",
  ps4: "PS4 \u2013 Community Health, Safety & Security",
  ps5: "PS5 \u2013 Land Acquisition & Involuntary Resettlement",
  ps6: "PS6 \u2013 Biodiversity Conservation & Sustainable Management",
  ps7: "PS7 \u2013 Indigenous Peoples",
  ps8: "PS8 \u2013 Cultural Heritage",
};

const normalizeNumberString = (value: string) => value.replace(/\D/g, "");

const formatNumberWithCommas = (value: string) => {
  const digits = normalizeNumberString(value);
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
};

const defaultProjectData = (): ProjectData => ({
  clientName: "",
  facilityType: "",
  sector: sectors[0],
  subSector: subSectorsBySector[sectors[0]]?.[0] || "",
  projectLocation: "Abia",
  projectType: "CAPEX",
  currency: "Naira",
  estimatedAmount: "",
  estimatedEmployees: "1-20",
});

const defaultExclusionData = (): ExclusionData => ({
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

const defaultRiskQuestions = () =>
  Object.fromEntries(preAssessmentQuestions.map((q) => [q.key, ""]));

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

  const [projectData, setProjectData] =
    useState<ProjectData>(defaultProjectData);

  const [exclusionData, setExclusionData] =
    useState<ExclusionData>(defaultExclusionData);

  const [riskQuestions, setRiskQuestions] =
    useState<Record<string, string>>(defaultRiskQuestions);

  const currentSubSectors = subSectorsBySector[projectData.sector] ?? [];

  const triggeredPS = preAssessmentQuestions.filter(
    (q) => riskQuestions[q.key] === "yes",
  );

  // Restore draft form data when loading an existing project
  useEffect(() => {
    if (!currentProjectId) {
      setActiveTab("project-info");
      setProjectData(defaultProjectData());
      setExclusionData(defaultExclusionData());
      setRiskQuestions(defaultRiskQuestions());
      return;
    }
    const proj = projects.find((p) => p.id === currentProjectId);
    if (!proj?.draftData) {
      setActiveTab("project-info");
      setProjectData(defaultProjectData());
      setExclusionData(defaultExclusionData());
      setRiskQuestions(defaultRiskQuestions());
      return;
    }
    const essDraft =
      proj.draftData.ess ??
      (proj.draftData.projectData
        ? {
            projectData: proj.draftData.projectData,
            exclusionData: proj.draftData.exclusionData,
            riskQuestions: proj.draftData.riskQuestions,
          }
        : null);
    if (!essDraft) {
      setActiveTab("project-info");
      setProjectData(defaultProjectData());
      setExclusionData(defaultExclusionData());
      setRiskQuestions(defaultRiskQuestions());
      return;
    }
    const { projectData: pd, exclusionData: ed, riskQuestions: rq } = essDraft;
    if (pd) {
      setProjectData({
        ...pd,
        estimatedAmount: normalizeNumberString(
          String(pd.estimatedAmount ?? ""),
        ),
      });
    }
    if (ed) setExclusionData(ed);
    if (rq) setRiskQuestions(rq);
    setActiveTab("project-info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

  const handleFinalSubmit = () => {
    const proj = projects.find((p) => p.id === currentProjectId);
    const projectId = proj?.id || `proj-${Date.now()}`;
    const estimatedAmountValue = Number(
      normalizeNumberString(projectData.estimatedAmount),
    );
    const hasExclusions = Object.values(exclusionData).some((v) => v);
    const riskCat = hasExclusions
      ? "Excluded"
      : triggeredPS.length > 2
        ? "A"
        : triggeredPS.length > 0
          ? "B"
          : "C";
    const draftData = {
      ...(proj?.draftData ?? {}),
      ess: { projectData, exclusionData, riskQuestions },
    };

    if (proj) {
      updateProject(proj.id, {
        currentStepPath: "categorization",
        stepNumber: 2,
        progress: 20,
        isDraft: false,
        riskCategory: riskCat,
        draftData,
      });
    } else {
      addProject({
        id: projectId,
        client: projectData.clientName || "Unnamed Client",
        project: `${projectData.clientName || "New"} ${projectData.subSector || "Project"}`,
        sector: projectData.sector,
        location: projectData.projectLocation,
        riskCategory: riskCat,
        facilityType: projectData.facilityType || "N/A",
        employees: projectData.estimatedEmployees,
        estimatedAmount: estimatedAmountValue || 0,
        date: new Date().toISOString().split("T")[0],
        currentStepPath: "categorization",
        stepNumber: 2,
        progress: 20,
        isDraft: false,
        draftData: { ess: { projectData, exclusionData, riskQuestions } },
      });
      setCurrentProject(projectId);
    }

    addTask({
      id: Date.now().toString(),
      projectId,
      projectName:
        proj?.project ||
        `${projectData.clientName || "New"} ${projectData.subSector || "Project"}`,
      clientName: proj ? proj.client : projectData.clientName,
      currentStep: "Risk Categorization",
      priority: "High",
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      assignedBy: "You",
      status: "Pending Review",
    });

    handleApproverSubmit(() => {
      navigate("../categorization");
    });
  };

  const buildDraftProjectData = () => {
    const hasExclusions = Object.values(exclusionData).some((v) => v);
    const riskCat = hasExclusions ? "Excluded" : "TBD";
    const proj = projects.find((p) => p.id === currentProjectId);
    const draftId = proj?.id || currentProjectId || `draft-${Date.now()}`;
    const estimatedAmountValue = Number(
      normalizeNumberString(projectData.estimatedAmount),
    );

    return {
      id: draftId,
      client: projectData.clientName || "Unnamed Draft",
      project: `${projectData.clientName || "New"} ${projectData.subSector || "Project"}`,
      sector: projectData.sector,
      location: projectData.projectLocation,
      riskCategory: riskCat,
      facilityType: projectData.facilityType || "N/A",
      employees: projectData.estimatedEmployees,
      estimatedAmount: estimatedAmountValue || 0,
      date: new Date().toISOString().split("T")[0],
      currentStepPath: "ess",
      stepNumber: 1,
      isDraft: true,
      draftData: {
        ...(proj?.draftData ?? {}),
        ess: { projectData, exclusionData, riskQuestions },
      },
    };
  };

  const persistDraftProject = (navigateToDashboard = false) => {
    const proj = projects.find((p) => p.id === currentProjectId);
    const draftProjectData = buildDraftProjectData();

    if (navigateToDashboard && onSaveDraft) {
      onSaveDraft(draftProjectData);
      return draftProjectData;
    }

    if (proj) {
      updateProject(proj.id, draftProjectData);
    } else {
      addProject(draftProjectData);
    }

    setCurrentProject(draftProjectData.id);
    return draftProjectData;
  };

  const handleSaveDraftLocal = () => {
    persistDraftProject(true);
  };

  const handleContinueToTab = (nextTab: string) => {
    persistDraftProject(false);
    setActiveTab(nextTab);
  };

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
          />
          {!projectData.clientName.trim() && (
            <p className="text-xs text-red-500 mt-1">Client name is required</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Facility Type
          </label>
          <div className="relative">
            <select
              value={projectData.facilityType}
              onChange={(e) =>
                setProjectData({ ...projectData, facilityType: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10"
            >
              <option value="">Select facility type...</option>
              {facilityTermOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
          {!projectData.facilityType && (
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
              onChange={(e) => {
                const newSector = e.target.value;
                const newSubSectors = subSectorsBySector[newSector] ?? [];
                setProjectData({
                  ...projectData,
                  sector: newSector,
                  subSector: newSubSectors[0] || "",
                });
              }}
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
            Sub-sector (SASB Industry)
          </label>
          <div className="relative">
            <select
              value={projectData.subSector}
              onChange={(e) =>
                setProjectData({ ...projectData, subSector: e.target.value })
              }
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10"
            >
              {currentSubSectors.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
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
              Est. Amount (Millions)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatNumberWithCommas(projectData.estimatedAmount)}
              onChange={(e) =>
                setProjectData({
                  ...projectData,
                  estimatedAmount: normalizeNumberString(e.target.value),
                })
              }
              className="w-full px-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="e.g. 5,000"
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

      <div className="flex justify-between pt-4">
        <button
          onClick={handleSaveDraftLocal}
          className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleContinueToTab("exclusion-screening")}
          disabled={
            !projectData.clientName.trim() ||
            !projectData.facilityType ||
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
          onClick={() => handleContinueToTab("risk-questions")}
          className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
        >
          Proceed to Risk Questions
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>
      </div>
    </div>
  );

  const renderRiskQuestions = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            Answer the following trigger questions to identify which IFC
            Performance Standards apply. PS1 is always assessed. PS2PS8 are
            triggered based on your responses below.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {preAssessmentQuestions.map((q, idx) => (
          <div
            key={q.key}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5"
          >
            <div className="flex items-start gap-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-3">
                  {q.text}
                </p>
                <div className="flex flex-wrap gap-4">
                  {["yes", "no"].map((val) => (
                    <label
                      key={val}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                        riskQuestions[q.key] === val
                          ? val === "yes"
                            ? "bg-amber-50 dark:bg-amber-900/20 border-amber-400 text-amber-800 dark:text-amber-200"
                            : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 text-emerald-800 dark:text-emerald-200"
                          : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.key}
                        value={val}
                        checked={riskQuestions[q.key] === val}
                        onChange={() =>
                          setRiskQuestions({ ...riskQuestions, [q.key]: val })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium capitalize">
                        {val}
                      </span>
                    </label>
                  ))}
                  {riskQuestions[q.key] === "yes" && (
                    <span className="ml-auto text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded border border-amber-200 dark:border-amber-700 self-center">
                      Triggers{" "}
                      {psNames[q.triggeredPS] || q.triggeredPS.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={() => handleContinueToTab("recommendation")}
          className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors font-medium flex items-center gap-2 cursor-pointer"
        >
          View Screening Recommendation
          <ChevronDown className="w-4 h-4 -rotate-90" />
        </button>
      </div>
    </div>
  );

  const renderRecommendation = () => {
    const hasExclusions = Object.values(exclusionData).some((v) => v);
    const excludedItems = exclusionItems.filter(
      (item) => exclusionData[item.key],
    );

    return (
      <div className="space-y-6">
        <div
          className={`rounded-lg border p-5 ${
            hasExclusions
              ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"
              : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800"
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            {hasExclusions ? (
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            ) : (
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            )}
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Exclusion List Screening:{" "}
              <span
                className={
                  hasExclusions
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }
              >
                {hasExclusions ? "FAILED" : "PASSED"}
              </span>
            </h3>
          </div>
          {hasExclusions ? (
            <div>
              <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                The following exclusion criteria were triggered. This project
                may be ineligible for financing:
              </p>
              <ul className="space-y-1">
                {excludedItems.map((item) => (
                  <li
                    key={item.key}
                    className="flex items-center gap-2 text-sm text-red-800 dark:text-red-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              No exclusion criteria were triggered. The project may proceed to
              the next stage.
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#86BC25]" />
            IFC Performance Standards Assessment Scope
          </h3>

          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg mb-3">
            <CheckCircle className="w-5 h-5 text-[#86BC25]" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                PS1 Assessment & Management of E&S Risks
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Always assessed for all projects
              </p>
            </div>
          </div>

          {triggeredPS.length === 0 ? (
            <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400">
              No additional performance standards triggered. Only PS1 applies.
            </div>
          ) : (
            <div className="space-y-2">
              {triggeredPS.map((q) => (
                <div
                  key={q.key}
                  className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg"
                >
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {psNames[q.triggeredPS] || q.triggeredPS.toUpperCase()}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Triggered by: {q.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <button
            onClick={handleSaveDraftLocal}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
          >
            Save Draft
          </button>
          <button
            onClick={openApproverModal}
            className="px-6 py-2 bg-[#86BC25] hover:bg-[#6B9B1E] text-slate-900 rounded-lg transition-colors font-bold flex items-center gap-2 cursor-pointer"
          >
            Continue
            <ChevronDown className="w-4 h-4 -rotate-90" />
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
                  Initial project screening, exclusion list check, and
                  high-level risk assessment.
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
