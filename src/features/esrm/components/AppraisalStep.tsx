import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Download,
  User,
  Shield,
  FileText,
  BarChart3,
  ArrowUpCircle,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import NextPreparerModal from "./NextPreparerModal";
import { authorityLevels } from "../data/formData";
import {
  downloadCSV,
  getAppraisalDecisionColor,
  getHeaderColor,
  getCategoryStyles,
} from "../utils";
import { useNextPreparerModal } from "../hooks";
import { useEsrmStore } from "../../../store/esrmStore";
import { DIMENSION_WEIGHTS } from "../data/scoringData";

const approvalOptions = [
  {
    value: "Approve",
    label: "Approve",
    icon: CheckCircle,
    color: "text-emerald-600",
    activeClass: "bg-emerald-50 border-emerald-200 shadow-sm",
  },
  {
    value: "Approve with Conditions",
    label: "Approve with Conditions",
    icon: AlertTriangle,
    color: "text-amber-600",
    activeClass: "bg-amber-50 border-amber-200 shadow-sm",
  },
  {
    value: "Reject",
    label: "Reject",
    icon: XCircle,
    color: "text-red-600",
    activeClass: "bg-red-50 border-red-200 shadow-sm",
  },
  {
    value: "Escalate",
    label: "Escalate",
    icon: TrendingUp,
    color: "text-purple-600",
    activeClass: "bg-purple-50 border-purple-200 shadow-sm",
  },
];

const preparerOptions = [
  { value: "user1", label: "Sarah Connor (Risk Manager)" },
  { value: "user2", label: "John Smith (Credit Officer)" },
  { value: "user3", label: "Emily Chen (ESG Specialist)" },
];

const AppraisalStep: React.FC = () => {
  const navigate = useNavigate();
  const [approvalDecision, setApprovalDecision] = useState("Approve");
  const [approver, setApprover] = useState("");
  const [approvalAuthority, setApprovalAuthority] = useState("ESG Officer");
  const [finalComments, setFinalComments] = useState("");
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
  const scoringResult = useEsrmStore((state) => state.scoringResult);
  const setScoringResult = useEsrmStore((state) => state.setScoringResult);
  const activeProject = useMemo(
    () => projects.find((project) => project.id === currentProjectId),
    [projects, currentProjectId],
  );

  useEffect(() => {
    const appraisalDraft = activeProject?.draftData?.appraisal;
    const categorizationDraft = activeProject?.draftData?.categorization;
    if (!activeProject) {
      setApprovalDecision("Approve");
      setApprover("");
      setApprovalAuthority("ESG Officer");
      setFinalComments("");
      setIsFinalizing(false);
      setIsSuccess(false);
      return;
    }
    setApprovalDecision(appraisalDraft?.approvalDecision || "Approve");
    setApprover(appraisalDraft?.approver || "");
    setApprovalAuthority(appraisalDraft?.approvalAuthority || "ESG Officer");
    setFinalComments(appraisalDraft?.finalComments || "");
    if (appraisalDraft) {
      if (appraisalDraft.approvalDecision) {
        setApprovalDecision(appraisalDraft.approvalDecision);
      }
      if (appraisalDraft.approver) setApprover(appraisalDraft.approver);
      if (appraisalDraft.approvalAuthority) {
        setApprovalAuthority(appraisalDraft.approvalAuthority);
      }
      if (appraisalDraft.finalComments)
        setFinalComments(appraisalDraft.finalComments);
    }
    if (categorizationDraft?.scoringResult) {
      setScoringResult(categorizationDraft.scoringResult);
    }
  }, [activeProject, setScoringResult]);

  const handleFinalSubmit = () => {
    const proj = projects.find((p) => p.id === currentProjectId);

    if (proj) {
      // Just step path update for the modal
      updateProject(proj.id, {
        currentStepPath: "monitoring",
        stepNumber: 6,
        progress: 100,
        isDraft: false,
        draftData: {
          ...(proj.draftData ?? {}),
          appraisal: {
            approvalDecision,
            approver,
            approvalAuthority,
            finalComments,
          },
        },
      });
    }

    // Add task for the new assignee
    if (nextPreparer) {
      addTask({
        id: Date.now().toString(),
        projectId: proj?.id,
        projectName: proj ? proj.project : "New Project",
        clientName: proj ? proj.client : "Unknown Client",
        currentStep: "Monitoring & Supervision",
        priority: "High",
        dueDate: new Date(Date.now() + 86400000 * 3)
          .toISOString()
          .split("T")[0],
        assignedBy: "You",
        status: "Pending Review",
      });
    }

    handleSubmit(() => {
      navigate("../monitoring");
    });
  };

  const handleFinalizeAppraisal = () => {
    setIsFinalizing(true);
    // Simulate API call and finalization
    setTimeout(() => {
      setIsFinalizing(false);
      setIsSuccess(true);
      const proj = projects.find((p) => p.id === currentProjectId);
      if (proj) {
        updateProject(proj.id, {
          currentStepPath: "monitoring",
          status: "Completed",
          stepNumber: 6,
          progress: 100,
          isDraft: false,
          draftData: {
            ...(proj.draftData ?? {}),
            appraisal: {
              approvalDecision,
              approver,
              approvalAuthority,
              finalComments,
            },
          },
        });
      }
      setTimeout(() => {
        navigate("../monitoring"); // Navigate after displaying success message
      }, 1500);
    }, 2000);
  };

  const downloadApprovalReport = () => {
    const reportData = [
      ["BOI ESRM - Step 5: Appraisal & Conditions Report"],
      ["Generated on:", new Date().toLocaleDateString()],
      [""],
      ["Approval Decision:", approvalDecision],
      ["Approver:", approver || "Not specified"],
      ["Approval Authority Level:", approvalAuthority],
      [""],
      ["Final Comments from Risk Reviewer:"],
      [finalComments || "No comments provided"],
      [""],
      ["Report generated by BOI ESRM Tool"],
    ];

    downloadCSV(reportData, "Approval_Report.csv");
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
                  Step 5: Appraisal & Conditions
                </h1>
                <p className="text-slate-300 mt-1 text-sm">
                  Summarize E&S risk, define approval decision, conditions, and
                  obtain sign-off.
                </p>
              </div>
              <button
                onClick={openModal}
                className="px-4 py-2 bg-[#86BC25] hover:bg-[#6B9B1E] text-slate-900 rounded-md transition-colors flex items-center gap-2 font-medium text-sm shadow-sm cursor-pointer"
              >
                <User className="w-4 h-4" />
                Select Next Preparer
              </button>
            </div>
          </div>

          <div className="p-6 space-y-8">
            <ProgressBar currentStep={5} />

            {/* ── BR-O-001–005: Scoring Summary from Categorization Step ── */}
            {scoringResult && (
              <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 border-b border-[#86BC25] flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-[#86BC25]" />
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      Risk Categorization Summary
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      5-Dimension Weighted Score — carried forward from Step 2
                      (Categorization)
                    </p>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Category + Composite row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div
                      className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 ${getCategoryStyles(`Category ${scoringResult.category}`)}`}
                    >
                      <AlertTriangle className="w-7 h-7" />
                      <span className="text-xl font-extrabold">
                        Category {scoringResult.category}
                      </span>
                      <span className="text-xs font-medium opacity-80">
                        {scoringResult.category === "A"
                          ? "High Risk"
                          : scoringResult.category === "B"
                            ? "Medium Risk"
                            : "Low Risk"}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Composite Score
                      </span>
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                        {scoringResult.composite.toFixed(2)}
                      </span>
                      <span className="text-xs text-slate-400">
                        out of 5.00
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                        Triggered PS
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {scoringResult.psScores
                          .filter((ps) => ps.triggered)
                          .map((ps) => (
                            <span
                              key={ps.id}
                              className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            >
                              {ps.id.toUpperCase()}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Dimension table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          {[
                            "Dimension",
                            "Normalised (0–5)",
                            "Weight",
                            "Weighted",
                          ].map((h) => (
                            <th
                              key={h}
                              className="text-left py-2 px-3 font-bold text-slate-500 uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            label: "D1 – Sector Risk",
                            dim: scoringResult.D1,
                            w: DIMENSION_WEIGHTS.D1,
                            color: "bg-indigo-500",
                          },
                          {
                            label: "D2 – Project Characteristics",
                            dim: scoringResult.D2,
                            w: DIMENSION_WEIGHTS.D2,
                            color: "bg-sky-500",
                          },
                          {
                            label: "D3 – PS Questionnaire",
                            dim: scoringResult.D3,
                            w: DIMENSION_WEIGHTS.D3,
                            color: "bg-amber-500",
                          },
                          {
                            label: "D4 – Context & Location",
                            dim: scoringResult.D4,
                            w: DIMENSION_WEIGHTS.D4,
                            color: "bg-teal-500",
                          },
                          {
                            label: "D5 – Client Track Record",
                            dim: scoringResult.D5,
                            w: DIMENSION_WEIGHTS.D5,
                            color: "bg-purple-500",
                          },
                        ].map((row) => (
                          <tr
                            key={row.label}
                            className="border-b border-slate-100 dark:border-slate-700/50"
                          >
                            <td className="py-2 px-3 font-medium text-slate-800 dark:text-white">
                              {row.label}
                            </td>
                            <td className="py-2 px-3 text-slate-600 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                <div className="w-20 bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${row.color}`}
                                    style={{
                                      width: `${Math.min((row.dim.normalised / 5) * 100, 100)}%`,
                                    }}
                                  />
                                </div>
                                {row.dim.normalised.toFixed(2)}
                              </div>
                            </td>
                            <td className="py-2 px-3 text-slate-500">
                              {(row.w * 100).toFixed(0)}%
                            </td>
                            <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                              {row.dim.weighted.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Escalation alerts */}
                  {scoringResult.escalationReasons.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="text-xs font-bold text-red-700 dark:text-red-300 mb-2 flex items-center gap-2 uppercase tracking-wider">
                        <ArrowUpCircle className="w-4 h-4" />
                        Auto-Escalation Alerts
                      </h4>
                      <ul className="space-y-1">
                        {scoringResult.escalationReasons.map((r, i) => (
                          <li
                            key={i}
                            className="text-xs text-red-600 dark:text-red-300 flex items-start gap-1.5"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Required actions */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Required Actions — Category {scoringResult.category}
                    </h4>
                    <ul className="space-y-1.5">
                      {scoringResult.requiredActions.map((action, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-[#86BC25] shrink-0 mt-0.5" />
                          {action.replace(/^PS\d+:\s*/, "")}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div
                  className={`bg-white dark:bg-slate-800 rounded-lg border shadow-sm overflow-hidden ${getHeaderColor(approvalDecision)} border-slate-200 dark:border-slate-700`}
                >
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-slate-500" />
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Approval Decision
                    </h3>
                  </div>

                  <div
                    className={`p-6 transition-colors duration-300 ${getAppraisalDecisionColor(approvalDecision)} bg-opacity-30 dark:bg-opacity-10`}
                  >
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                          Final decision from the ESRM review
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {approvalOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected =
                              approvalDecision === option.value;
                            return (
                              <label
                                key={option.value}
                                className={`
                                  flex items-center gap-3 cursor-pointer p-3 rounded-lg border transition-all
                                  ${
                                    isSelected
                                      ? `${option.activeClass} dark:bg-opacity-20`
                                      : "border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                  }
                                `}
                              >
                                <input
                                  type="radio"
                                  name="approvalDecision"
                                  value={option.value}
                                  checked={isSelected}
                                  onChange={(e) =>
                                    setApprovalDecision(e.target.value)
                                  }
                                  className="w-4 h-4 text-[#86BC25] border-slate-300 focus:ring-[#86BC25] cursor-pointer"
                                />
                                <Icon className={`w-5 h-5 ${option.color}`} />
                                <span
                                  className={`text-sm font-medium ${isSelected ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"}`}
                                >
                                  {option.label}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Approver Name / Committee
                          </label>
                          <input
                            type="text"
                            value={approver}
                            onChange={(e) => setApprover(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="e.g. John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Approval Authority Level
                          </label>
                          <div className="relative">
                            <select
                              value={approvalAuthority}
                              onChange={(e) =>
                                setApprovalAuthority(e.target.value)
                              }
                              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent appearance-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-10 cursor-pointer"
                            >
                              {authorityLevels.map((level) => (
                                <option key={level} value={level}>
                                  {level}
                                </option>
                              ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <FileText className="w-5 h-5 text-slate-500" />
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                      Final Comments & Rationale
                    </h3>
                  </div>
                  <div className="p-6">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                      Reviewer Comments
                    </label>
                    <textarea
                      value={finalComments}
                      onChange={(e) => setFinalComments(e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent text-slate-900 dark:text-white bg-white dark:bg-slate-800 resize-none"
                      placeholder="Enter final comments, specific conditions, or rationale for the decision..."
                    />
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={downloadApprovalReport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white rounded-md transition-colors text-sm font-medium cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download PDF Report
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-6 h-6 text-[#86BC25]" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Appraisal Summary
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700 shadow-sm">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Decision
                      </span>
                      <div
                        className={`text-lg font-bold ${
                          approvalDecision === "Approve"
                            ? "text-emerald-600"
                            : approvalDecision === "Reject"
                              ? "text-red-600"
                              : approvalDecision === "Escalate"
                                ? "text-purple-600"
                                : "text-amber-600"
                        }`}
                      >
                        {approvalDecision}
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700 shadow-sm">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Authority
                      </span>
                      <div className="text-slate-900 dark:text-white font-medium">
                        {approvalAuthority}
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700 shadow-sm">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Approver
                      </span>
                      <div className="text-slate-900 dark:text-white font-medium">
                        {approver || "Pending..."}
                      </div>
                    </div>

                    <div className="p-4 bg-white dark:bg-slate-800 rounded-md border border-slate-100 dark:border-slate-700 shadow-sm">
                      <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Date
                      </span>
                      <div className="text-slate-900 dark:text-white font-medium">
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={handleFinalizeAppraisal}
                      disabled={isFinalizing || isSuccess}
                      className={`w-full py-2.5 font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2 ${
                        isSuccess
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 cursor-default"
                          : "bg-[#86BC25] hover:bg-[#6B9B1E] text-slate-900 cursor-pointer"
                      } ${isFinalizing || isSuccess ? "opacity-90" : ""}`}
                    >
                      {isSuccess ? (
                        <>
                          <CheckCircle className="w-5 h-5 text-emerald-500" />
                          Appraisal Finalized!
                        </>
                      ) : isFinalizing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                          Finalizing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Finalize Appraisal
                        </>
                      )}
                    </button>
                    <p className="text-xs text-center text-slate-500 mt-3">
                      {isSuccess
                        ? "Stakeholders have been notified. Redirecting to monitoring..."
                        : "This will lock the appraisal and notify stakeholders."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
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

export default AppraisalStep;
