import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  Download,
  AlertTriangle,
  MapPin,
  Users,
  Shield,
  Eye,
  User,
  Info,
  ClipboardList,
  Building2,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import NextPreparerModal from "./NextPreparerModal";
import { useNextPreparerModal } from "../hooks";
import { useEsrmStore } from "../../../store/esrmStore";
import { useToast } from "@/features/e-learnings/components/ui/ToastContext";

const preparerOptions = [
  { value: "user1", label: "Lisa Brown - Environmental Specialist" },
  { value: "user2", label: "James Miller - Risk Assessment Lead" },
  { value: "user3", label: "Emma Davis - Sustainability Manager" },
];

const managementCapacityOptions = ["Strong", "Moderate", "Weak", "Unknown"];

const tabs = [
  {
    id: "due-diligence-form",
    label: "Due Diligence Form",
    icon: FileText,
  },
  {
    id: "document-manager",
    label: "Document Manager",
    icon: Upload,
  },
];

const triggeredPsLabels: Record<string, string> = {
  ps1: "PS1 - Assessment & Management of E&S Risks",
  ps2: "PS2 - Labour & Working Conditions",
  ps3: "PS3 - Resource Efficiency & Pollution Prevention",
  ps4: "PS4 - Community Health, Safety & Security",
  ps5: "PS5 - Land Acquisition & Involuntary Resettlement",
  ps6: "PS6 - Biodiversity Conservation",
  ps7: "PS7 - Indigenous Peoples",
  ps8: "PS8 - Cultural Heritage",
};

const emptyFormData = {
  managementCapacity: "Strong",
  additionalNotes: "",
  keyRisks: "",
  mitigationMeasures: "",
  siteVisitRecommended: "",
  siteVisitReason: "",
  dueDiligenceSummary: "",
  esapRecommendations: "",
};

const triggerToPsMap: Record<string, string> = {
  trig_labour: "ps2",
  trig_pollution: "ps3",
  trig_community: "ps4",
  trig_land: "ps5",
  trig_biodiversity: "ps6",
  trig_indigenous: "ps7",
  trig_cultural: "ps8",
};

const ESDDStep: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("due-diligence-form");
  const { addToast } = useToast();
  const {
    showModal,
    nextPreparer,
    notificationSent,
    setNextPreparer,
    openModal,
    closeModal,
    handleSubmit,
  } = useNextPreparerModal();

  const addTask = useEsrmStore((state) => state.addTask);
  const currentProjectId = useEsrmStore((state) => state.currentProjectId);
  const projects = useEsrmStore((state) => state.projects);
  const updateProject = useEsrmStore((state) => state.updateProject);
  const [formData, setFormData] = useState(emptyFormData);

  const activeProject = useMemo(
    () => projects.find((project) => project.id === currentProjectId),
    [projects, currentProjectId],
  );

  const categorizationSnapshot = activeProject?.draftData?.categorization;
  const essSnapshot = activeProject?.draftData?.ess;

  const triggeredStandards = useMemo(() => {
    const answers =
      categorizationSnapshot?.triggerAnswers ??
      essSnapshot?.riskQuestions ??
      {};
    return Object.entries(answers)
      .filter(([, value]) => value === "yes")
      .map(([key]) => triggerToPsMap[key])
      .filter(Boolean);
  }, [categorizationSnapshot?.triggerAnswers, essSnapshot?.riskQuestions]);

  const identifiedRisks = useMemo(() => {
    const requiredActions =
      categorizationSnapshot?.scoringResult?.requiredActions?.map(
        (action: string) => action.replace(/^PS\d+:\s*/, ""),
      ) ?? [];
    const standards = triggeredStandards.map(
      (standard) => triggeredPsLabels[standard] ?? standard.toUpperCase(),
    );
    return Array.from(new Set([...requiredActions, ...standards]));
  }, [
    categorizationSnapshot?.scoringResult?.requiredActions,
    triggeredStandards,
  ]);

  useEffect(() => {
    if (!activeProject) {
      const timeoutId = window.setTimeout(() => {
        setActiveTab("due-diligence-form");
        setFormData(emptyFormData);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
    const savedForm = activeProject.draftData?.esdd?.formData;
    if (savedForm) {
      const timeoutId = window.setTimeout(() => {
        setFormData(savedForm);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
    if (identifiedRisks.length > 0) {
      const timeoutId = window.setTimeout(() => {
        setFormData((current) => ({
          ...current,
          keyRisks: current.keyRisks || identifiedRisks.join("; "),
        }));
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
    const timeoutId = window.setTimeout(() => {
      setFormData(emptyFormData);
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [activeProject, identifiedRisks]);

  const handleInputChange = (
    field: keyof typeof emptyFormData,
    value: string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const persistEsddDraft = (isDraft: boolean) => {
    if (!activeProject) return;
    updateProject(activeProject.id, {
      isDraft,
      draftData: {
        ...(activeProject.draftData ?? {}),
        esdd: { formData },
      },
    });
  };

  const handleSaveDraft = () => {
    persistEsddDraft(true);
    addToast("ESDD draft saved", "success");
  };

  const handleFinalSubmit = () => {
    const proj = projects.find((p) => p.id === currentProjectId);

    if (proj) {
      updateProject(proj.id, {
        currentStepPath: "esap",
        stepNumber: 4,
        progress: 60,
        isDraft: false,
        draftData: {
          ...(proj.draftData ?? {}),
          esdd: { formData },
        },
      });
    }

    if (nextPreparer) {
      addTask({
        id: Date.now().toString(),
        projectId: proj?.id,
        projectName: proj ? proj.project : "New Project",
        clientName: proj ? proj.client : "Unknown Client",
        currentStep: "Environmental & Social Action Plan",
        priority: "High",
        dueDate: new Date(Date.now() + 86400000 * 3)
          .toISOString()
          .split("T")[0],
        assignedBy: "You",
        status: "Pending Review",
      });
    }

    handleSubmit(() => {
      navigate("../esap");
    });
  };

  const handleDownloadReport = () => {
    addToast("Report download started", "success");
  };

  const renderDueDiligenceForm = () => (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-linear-to-r from-slate-950 via-slate-900 to-slate-800">
        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
              Due Diligence Overview
            </p>
            <h3 className="text-xl font-bold text-white mb-2">
              {activeProject?.project || "Environmental & Social Due Diligence"}
            </h3>
            <p className="text-sm text-slate-300 max-w-2xl">
              Review management capacity, verify key environmental and social
              risks, and convert prior-step findings into a concise,
              decision-ready due diligence package.
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-slate-400 mb-1">Client</p>
            <p className="text-sm font-semibold text-white">
              {activeProject?.client || "Not selected"}
            </p>
            <p className="text-xs text-slate-400 mt-3 mb-1">Sector</p>
            <p className="text-sm font-semibold text-white">
              {activeProject?.sector || "Not selected"}
            </p>
          </div>
          <div className="rounded-xl bg-white/5 border border-white/10 p-4">
            <p className="text-xs text-slate-400 mb-1">Facility</p>
            <p className="text-sm font-semibold text-white">
              {activeProject?.facilityType || "Not selected"}
            </p>
            <p className="text-xs text-slate-400 mt-3 mb-1">Risk Category</p>
            <p className="text-sm font-semibold text-white">
              {activeProject?.riskCategory || "Pending"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
            <Users className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Management Capacity & Review Controls
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Capture governance readiness, review depth, and site
                verification needs.
              </p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Client's E&S Management Capacity
              </label>
              <select
                value={formData.managementCapacity}
                onChange={(e) =>
                  handleInputChange("managementCapacity", e.target.value)
                }
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {managementCapacityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Capacity Assessment Notes
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) =>
                  handleInputChange("additionalNotes", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#86BC25] focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="Summarize governance strength, E&S staffing, escalation readiness, and process maturity."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Is a site visit recommended?
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Yes", value: "Yes" },
                  { label: "No", value: "No" },
                ].map((option) => {
                  const selected =
                    formData.siteVisitRecommended === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
                        selected
                          ? "border-[#86BC25] bg-[#86BC25]/10"
                          : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="siteVisit"
                        value={option.value}
                        checked={selected}
                        onChange={(e) =>
                          handleInputChange(
                            "siteVisitRecommended",
                            e.target.value,
                          )
                        }
                        className="w-4 h-4 text-[#86BC25] border-slate-300 focus:ring-[#86BC25]"
                      />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {option.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Reason for Site Visit Recommendation
              </label>
              <textarea
                value={formData.siteVisitReason}
                onChange={(e) =>
                  handleInputChange("siteVisitReason", e.target.value)
                }
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#86BC25] focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="State what needs physical verification on site and why it matters for the decision."
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-[#86BC25]" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Prior-Step Signals
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Triggered standards and required actions carried from screening
                and categorization.
              </p>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                Triggered Standards
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 text-white">
                  PS1
                </span>
                {triggeredStandards.length === 0 ? (
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    No additional standards triggered.
                  </span>
                ) : (
                  triggeredStandards.map((standard) => (
                    <span
                      key={standard}
                      className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800"
                    >
                      {standard.toUpperCase()}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">
                Identified Risk Themes
              </p>
              <div className="space-y-2">
                {identifiedRisks.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    No prior-step risks have been flagged yet.
                  </p>
                ) : (
                  identifiedRisks.map((risk) => (
                    <div
                      key={risk}
                      className="flex gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3"
                    >
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        {risk}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Key E&S Risks Identified
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Consolidate material risks detected through screening,
                categorization, and review.
              </p>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {identifiedRisks.length > 0 && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300 mb-2">
                  Auto-carried from prior steps
                </p>
                <div className="flex flex-wrap gap-2">
                  {identifiedRisks.map((risk) => (
                    <span
                      key={risk}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200"
                    >
                      {risk}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <textarea
              value={formData.keyRisks}
              onChange={(e) => handleInputChange("keyRisks", e.target.value)}
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#86BC25] focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Describe the material environmental and social risks in a lender-ready form."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Mitigation Measures
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                State the control actions that can realistically reduce the
                identified risk profile.
              </p>
            </div>
          </div>
          <div className="p-6">
            <textarea
              value={formData.mitigationMeasures}
              onChange={(e) =>
                handleInputChange("mitigationMeasures", e.target.value)
              }
              rows={8}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#86BC25] focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="List mitigation measures, owners, and critical timing expectations."
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
            <Eye className="w-5 h-5 text-sky-500" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                Due Diligence Summary
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Summarize the headline findings and decision posture.
              </p>
            </div>
          </div>
          <div className="p-6">
            <textarea
              value={formData.dueDiligenceSummary}
              onChange={(e) =>
                handleInputChange("dueDiligenceSummary", e.target.value)
              }
              rows={7}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#86BC25] focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Summarize what matters most for the credit and ESG decision."
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
            <MapPin className="w-5 h-5 text-violet-500" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">
                ESAP Recommendations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Convert due diligence findings into specific action-plan
                instructions.
              </p>
            </div>
          </div>
          <div className="p-6">
            <textarea
              value={formData.esapRecommendations}
              onChange={(e) =>
                handleInputChange("esapRecommendations", e.target.value)
              }
              rows={7}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-[#86BC25] focus:border-transparent resize-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              placeholder="Specify what the ESAP should require before and after disbursement."
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={handleSaveDraft}
          className="cursor-pointer px-5 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
        >
          Save Draft
        </button>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDownloadReport}
            className="cursor-pointer px-5 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download ESDD Report
          </button>
          <button
            onClick={openModal}
            className="cursor-pointer px-5 py-3 bg-[#86BC25] hover:bg-[#6B9B1E] text-slate-900 rounded-xl transition-colors font-bold flex items-center gap-2"
          >
            <User className="w-4 h-4" />
            Select Next Preparer
          </button>
        </div>
      </div>
    </div>
  );

  const renderDocumentManager = () => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
      <div className="text-center max-w-3xl mx-auto">
        <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Upload className="w-12 h-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
          Document Manager
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Upload supporting diligence documents tied to the triggered
          Performance Standards for this project.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-5 h-5 text-[#86BC25]" />
              <h4 className="font-semibold text-slate-900 dark:text-white">
                Required Standards
              </h4>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-slate-700 dark:text-slate-300">
                PS1 - Assessment & Management of E&S Risks
              </div>
              {triggeredStandards.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No additional triggered standards recorded yet.
                </p>
              ) : (
                triggeredStandards.map((standard) => (
                  <div
                    key={standard}
                    className="text-sm text-slate-700 dark:text-slate-300"
                  >
                    {triggeredPsLabels[standard] ?? standard.toUpperCase()}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 p-5">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Upload environmental permits, site visit evidence, management
                system documents, incident logs, and any studies that support
                the due diligence position.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-900 px-6 py-5 rounded-t-lg">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Shield className="w-6 h-6 text-[#86BC25]" />
                Step 3: Environmental and Social Due Diligence
              </h1>
              <button
                onClick={openModal}
                className="cursor-pointer px-4 py-2 bg-[#86BC25] hover:bg-[#6B9B1E] text-slate-900 rounded-md transition-colors flex items-center gap-2 font-medium text-sm shadow-sm"
              >
                <User className="w-4 h-4" />
                Select Next Preparer
              </button>
            </div>
          </div>

          <div className="p-6">
            <ProgressBar currentStep={3} />

            <div className="mb-8 border-b border-slate-200 dark:border-slate-700">
              <nav className="flex space-x-8">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`cursor-pointer flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "border-[#86BC25] text-[#86BC25]"
                          : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
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

            {activeTab === "due-diligence-form"
              ? renderDueDiligenceForm()
              : renderDocumentManager()}
          </div>
        </div>
      </div>

      <NextPreparerModal
        showModal={showModal}
        nextPreparer={nextPreparer}
        notificationSent={notificationSent}
        onClose={closeModal}
        onSubmit={handleFinalSubmit}
        onPreparerChange={setNextPreparer}
        preparerOptions={preparerOptions}
      />
    </div>
  );
};

export default ESDDStep;
