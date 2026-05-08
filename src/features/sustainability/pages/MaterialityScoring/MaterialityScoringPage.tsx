import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckSquare,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useMaterialityStore } from "@/store/materialityStore";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useShallow } from "zustand/react/shallow";
import { UserRole } from "@/config/permissions.config";
import { getRiskColor } from "../../data/constants";
import { getTemplateForRisk } from "@/config/fmn_templates";

const getHeatMapScore = (impact: number, likelihood: number) =>
  impact * likelihood;

const getStableJitter = (id: string, salt: number) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (Math.imul(31, hash) + id.charCodeAt(i)) | 0;
  }
  const random = Math.abs(Math.sin(hash + salt)) * 10000;
  return (random - Math.floor(random) - 0.5) * 0.4;
};

const MaterialityScoringPage = () => {
  const navigate = useNavigate();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const {
    risks,
    addRisk,
    materialityApproval,
    submitMaterialityForApproval,
    internalApproveMaterialityAssessment,
    approveMaterialityAssessment,
    rejectMaterialityAssessment,
    selectionBasis,
    setSelectionBasis,
    selectedSeverityLevel,
    selectBySeverity,
    entityProfile,
    selectedMaterialTopicIds,
    setSelectedTopicIds,
  } = useSustainabilityStore(
    useShallow((state) => ({
      risks: state.risks,
      addRisk: state.addRisk,
      materialityApproval: state.materialityApproval,
      submitMaterialityForApproval: state.submitMaterialityForApproval,
      internalApproveMaterialityAssessment:
        state.internalApproveMaterialityAssessment,
      approveMaterialityAssessment: state.approveMaterialityAssessment,
      rejectMaterialityAssessment: state.rejectMaterialityAssessment,
      selectionBasis: state.selectionBasis,
      setSelectionBasis: state.setSelectionBasis,
      selectedSeverityLevel: state.selectedSeverityLevel,
      setSelectedSeverityLevel: state.setSelectedSeverityLevel,
      selectBySeverity: state.selectBySeverity,
      entityProfile: state.entityProfile,
      selectedMaterialTopicIds: state.selectedMaterialTopicIds,
      setSelectedTopicIds: state.setSelectedTopicIds,
    })),
  );

  const { user } = useAuthStore();
  const setTopics = useMaterialityStore((state) => state.setTopics);

  const [topNSelection, setTopNSelection] = useState<number | "all">(5);
  const [approvalComment, setApprovalComment] = useState("");
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newRisk, setNewRisk] = useState({
    name: "",
    category: "Environmental",
    impact: 3,
    likelihood: 3,
  });

  const handleAddCustomRisk = () => {
    if (!newRisk.name) return;
    addRisk({
      id: `custom-${Date.now()}`,
      name: newRisk.name,
      category: newRisk.category,
      subcategory: "Custom Risk",
      impact: newRisk.impact,
      likelihood: newRisk.likelihood,
      financialEffect: "Unknown",
      timeHorizon: "Medium",
      source: "internal",
    });
    setOpenAddDialog(false);
    setNewRisk({
      name: "",
      category: "Environmental",
      impact: 3,
      likelihood: 3,
    });
  };

  const sortedRisksData = useMemo(() => {
    return [...risks]
      .map((r) => ({
        ...r,
        heatScore: getHeatMapScore(r.impact, r.likelihood),
        jitteredImpact: r.impact + getStableJitter(r.id, 1),
        jitteredLikelihood: r.likelihood + getStableJitter(r.id, 2),
      }))
      .sort((a, b) => b.heatScore - a.heatScore);
  }, [risks]);

  const displayedChartData = useMemo(() => {
    if (selectionBasis === "by-severity")
      return sortedRisksData.filter((r) =>
        selectedMaterialTopicIds.includes(r.id),
      );
    if (selectionBasis === "cherry-pick") return sortedRisksData;
    if (topNSelection === "all") return sortedRisksData;
    return sortedRisksData.slice(0, topNSelection as number);
  }, [
    sortedRisksData,
    selectionBasis,
    topNSelection,
    selectedMaterialTopicIds,
  ]);

  const selectedCount = useMemo(() => {
    if (selectionBasis === "top-n") return displayedChartData.length;
    return selectedMaterialTopicIds.length;
  }, [selectionBasis, displayedChartData, selectedMaterialTopicIds]);

  const severityLevels = useMemo(() => {
    if (entityProfile.scoringMatrix?.levels)
      return entityProfile.scoringMatrix.levels;
    const size = entityProfile.scoringMatrix?.matrixSize ?? 5;
    if (size === 3) return ["Low", "Medium", "High"];
    if (size === 4) return ["Low", "Medium", "High", "Critical"];
    return ["Low", "Medium", "High", "Very High", "Critical"];
  }, [entityProfile.scoringMatrix]);

  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  const isSubmitted =
    materialityApproval.status === "pending_internal" ||
    materialityApproval.status === "pending_board" ||
    materialityApproval.status === "approved";

  const topicsForProceed = useMemo(() => {
    if (selectionBasis === "top-n") return displayedChartData;
    return sortedRisksData.filter((r) =>
      selectedMaterialTopicIds.includes(r.id),
    );
  }, [
    selectionBasis,
    displayedChartData,
    sortedRisksData,
    selectedMaterialTopicIds,
  ]);

  const chartData = isSubmitted ? topicsForProceed : displayedChartData;
  const chartHeight = Math.max(500, chartData.length * 60);

  const handleProceed = () => {
    const mappedTopics = topicsForProceed.map((risk) => {
      const metrics = getTemplateForRisk(risk.name);
      return {
        id: risk.id,
        name: risk.name,
        description: `${risk.category} - ${risk.subcategory}`,
        dataNeeds: metrics.map((m) => m.name),
        status: "partial" as const,
        selected: true,
        impact: risk.impact,
        stakeholderInterest: risk.likelihood,
      };
    });
    setTopics(mappedTopics);
    navigate("/sustainability/materiality");
  };

  const handleSubmitForApproval = () => {
    const submittedBy = user?.name ?? "Sustainability Manager";
    const mappedTopics = topicsForProceed.map((risk) => {
      const metrics = getTemplateForRisk(risk.name);
      return {
        id: risk.id,
        name: risk.name,
        description: `${risk.category} - ${risk.subcategory}`,
        dataNeeds: metrics.map((m) => m.name),
        status: "partial" as const,
        selected: true,
        impact: risk.impact,
        stakeholderInterest: risk.likelihood,
      };
    });
    setTopics(mappedTopics);
    submitMaterialityForApproval(submittedBy);
  };

  const handleToggleCherryPick = (riskId: string) => {
    const updated = selectedMaterialTopicIds.includes(riskId)
      ? selectedMaterialTopicIds.filter((id) => id !== riskId)
      : [...selectedMaterialTopicIds, riskId];
    setSelectedTopicIds(updated);
  };

  return (
    <div className="h-full overflow-y-auto w-full bg-slate-50 dark:bg-[#1a1a1a] p-6 lg:p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/sustainability/risks")}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Risk Register
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
              Materiality Scoring & Prioritization
            </h1>
            <p className="text-base text-gray-500 dark:text-gray-400">
              Review your identified risks sorted by calculated severity (Heat
              Score)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {materialityApproval.status === "approved" ? (
              <button
                onClick={handleProceed}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#86bc25] hover:bg-[#75a620] text-white font-bold text-sm transition-colors rounded-none"
              >
                Proceed to Data Collection <ArrowRight size={16} />
              </button>
            ) : isSubmitted ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-500 rounded-none font-bold text-xs">
                <ShieldCheck size={14} />
                {materialityApproval.status === "pending_internal"
                  ? "Pending Internal Review"
                  : "Pending Board Approval"}
              </div>
            ) : user?.role === UserRole.SUSTAINABILITY_MANAGER ? (
              <button
                title="Submit your selection for approval before proceeding"
                onClick={handleSubmitForApproval}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm transition-colors rounded-none"
              >
                <ShieldCheck size={16} />
                Submit for Approval
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Internal Control / Audit approval panel */}
      {materialityApproval.status === "pending_internal" &&
        user?.role === UserRole.SUSTAINABILITY_APPROVER && (
          <div className="mb-6 p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-none shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Internal Control / Audit Review
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Submitted by {materialityApproval.submittedBy} on{" "}
              {materialityApproval.submittedAt
                ? new Date(materialityApproval.submittedAt).toLocaleString()
                : ""}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Comment (optional)
              </label>
              <input
                type="text"
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-none"
                placeholder="Enter approval or rejection comments..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  internalApproveMaterialityAssessment(
                    user?.name ?? "Internal Reviewer",
                    approvalComment || undefined,
                  );
                  setApprovalComment("");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#86bc25] hover:bg-[#75a620] text-white font-bold text-sm transition-colors rounded-none"
              >
                <CheckCircle2 size={16} />
                Approve
              </button>
              <button
                onClick={() => {
                  rejectMaterialityAssessment(
                    user?.name ?? "Internal Reviewer",
                    approvalComment || "Needs revision",
                  );
                  setApprovalComment("");
                }}
                className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm transition-colors rounded-none"
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>
          </div>
        )}

      {/* Board / Final approval panel */}
      {materialityApproval.status === "pending_board" &&
        user?.role === UserRole.ADMIN && (
          <div className="mb-6 p-6 bg-white dark:bg-[#111111] border border-gray-200 dark:border-gray-800 rounded-none shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
              Board / Final Approval
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Internal review passed. Submitted by{" "}
              {materialityApproval.submittedBy}.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                Comment (optional)
              </label>
              <input
                type="text"
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-none"
                placeholder="Enter approval or rejection comments..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  approveMaterialityAssessment(
                    user?.name ?? "Board Approver",
                    approvalComment || undefined,
                  );
                  setApprovalComment("");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-[#86bc25] hover:bg-[#75a620] text-white font-bold text-sm transition-colors rounded-none"
              >
                <ShieldCheck size={16} />
                Approve
              </button>
              <button
                onClick={() => {
                  rejectMaterialityAssessment(
                    user?.name ?? "Board Approver",
                    approvalComment || "Needs revision",
                  );
                  setApprovalComment("");
                }}
                className="flex items-center gap-2 px-4 py-2 border border-red-500 text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm transition-colors rounded-none"
              >
                <XCircle size={16} />
                Reject
              </button>
            </div>
          </div>
        )}

      {/* Status banners */}
      {materialityApproval.status === "pending_internal" &&
        user?.role !== UserRole.SUSTAINABILITY_APPROVER && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-3 rounded-none">
            <ShieldCheck
              className="text-blue-600 dark:text-blue-400"
              size={20}
            />
            <span className="text-sm text-blue-800 dark:text-blue-300 font-bold">
              Awaiting Internal Control / Audit review.
            </span>
          </div>
        )}
      {materialityApproval.status === "pending_board" &&
        user?.role !== UserRole.ADMIN && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-3 rounded-none">
            <ShieldCheck
              className="text-blue-600 dark:text-blue-400"
              size={20}
            />
            <span className="text-sm text-blue-800 dark:text-blue-300 font-bold">
              Internal review passed. Awaiting Board final approval.
            </span>
          </div>
        )}
      {materialityApproval.status === "rejected" && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3 rounded-none">
          <AlertTriangle
            className="text-red-600 dark:text-red-400 shrink-0 mt-0.5"
            size={20}
          />
          <div className="text-sm text-red-800 dark:text-red-300">
            <strong className="font-extrabold">
              Assessment returned for revision
            </strong>{" "}
            by {materialityApproval.approvedBy}.
            {materialityApproval.comment &&
              ` Reason: ${materialityApproval.comment}`}{" "}
            — Revise your selection and re-submit.
          </div>
        </div>
      )}
      {materialityApproval.status === "approved" && (
        <div className="mb-6 p-4 bg-[#86bc25]/10 border border-[#86bc25]/40 flex items-center gap-3 rounded-none">
          <ShieldCheck
            className="text-[#86bc25]"
            size={20}
          />
          <span className="text-sm text-[#86bc25] dark:text-[#86bc25]">
            <strong className="font-extrabold">Board approval granted</strong> by{" "}
            {materialityApproval.approvedBy}. You may now proceed to data
            collection.
          </span>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#111111] shadow-sm border border-gray-200 dark:border-gray-800 p-6 mb-8 rounded-none">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1">
            {isSubmitted ? (
              <div className="flex items-center gap-2 py-2">
                <ShieldCheck size={18} className="text-[#86bc25]" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Selection locked
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  — submitted for approval. The{" "}
                  <strong className="text-gray-900 dark:text-gray-300">
                    {chartData.length}
                  </strong>{" "}
                  topics below are fixed until a decision is made.
                </span>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  Selection Method
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { value: "top-n" as const, label: "Top Material Risks" },
                    { value: "by-severity" as const, label: "By Severity" },
                    { value: "cherry-pick" as const, label: "Custom Select" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectionBasis(option.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 font-bold transition-colors text-sm rounded-none border ${
                        selectionBasis === option.value
                          ? "bg-[#86bc25] text-white border-[#86bc25]"
                          : "bg-transparent border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      }`}
                    >
                      {option.value === "cherry-pick" && (
                        <CheckSquare size={14} />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>

                {/* Sub-controls */}
                {selectionBasis === "top-n" && (
                  <div className="flex flex-wrap gap-2">
                    {[5, 10, 15, 20, "all"].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          setTopNSelection(
                            num === "all" ? "all" : (num as number),
                          )
                        }
                        className={`px-3 py-1.5 text-xs font-bold transition-all border rounded-none ${
                          topNSelection === num
                            ? "bg-[#86bc25]/10 border-[#86bc25] text-[#86bc25]"
                            : "bg-transparent border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                        }`}
                      >
                        {num === "all" ? "View All" : `Top ${num}`}
                      </button>
                    ))}
                  </div>
                )}

                {selectionBasis === "by-severity" && (
                  <div>
                    <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2">
                      Select a severity level to include all risks at that
                      threshold:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {severityLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() => selectBySeverity(level)}
                          className={`px-3 py-1.5 text-xs font-bold transition-all border rounded-none ${
                            selectedSeverityLevel === level
                              ? "bg-[#86bc25]/10 border-[#86bc25] text-[#86bc25]"
                              : "bg-transparent border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/50"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectionBasis === "cherry-pick" && (
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    Click any bar in the chart below to include or exclude it
                    from your materiality assessment.
                  </span>
                )}
              </>
            )}
          </div>

          <div className="text-right pl-6 sm:shrink-0 flex flex-col justify-end">
            <span className="text-4xl font-extrabold text-[#86bc25] leading-none mb-1">
              {selectedCount}
            </span>
            <span className="text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
              Topics Selected
            </span>
          </div>
        </div>

        <div className="w-full overflow-x-auto">
          <div style={{ height: chartHeight, minWidth: 800 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  barSize={30}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={borderColor}
                    horizontal={true}
                    vertical={false}
                  />
                  <XAxis
                    type="number"
                    stroke={isDark ? "#64748b" : "#94a3b8"}
                    fontSize={12}
                    domain={[0, 25]}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke={isDark ? "#64748b" : "#94a3b8"}
                    fontSize={12}
                    width={250}
                    tickFormatter={(val) =>
                      val.length > 35 ? val.substring(0, 35) + "..." : val
                    }
                  />
                  <RechartsTooltip
                    cursor={{
                      fill: isDark
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.03)",
                    }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-[#1a1a1a] p-4 shadow-xl border border-gray-200 dark:border-gray-800 rounded-none">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">
                              {data.name}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                              {data.category} • {data.subcategory}
                            </p>
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-1.5">
                              <div className="flex justify-between items-center gap-6">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  Heat Score:
                                </span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                  {data.heatScore} / 25
                                </span>
                              </div>
                              <div className="flex justify-between items-center gap-6">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  Likelihood:
                                </span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                  {data.likelihood}
                                </span>
                              </div>
                              <div className="flex justify-between items-center gap-6">
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  Impact:
                                </span>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">
                                  {data.impact}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="heatScore"
                    radius={0}
                    onClick={
                      !isSubmitted && selectionBasis === "cherry-pick"
                        ? (data: { id?: string }) => {
                            if (data?.id) handleToggleCherryPick(data.id);
                          }
                        : undefined
                    }
                    cursor={
                      !isSubmitted && selectionBasis === "cherry-pick"
                        ? "pointer"
                        : "default"
                    }
                  >
                    {chartData.map((entry, index) => {
                      const isSelected =
                        isSubmitted ||
                        selectionBasis !== "cherry-pick" ||
                        selectedMaterialTopicIds.includes(entry.id);
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={getRiskColor(entry.heatScore)}
                          opacity={isSelected ? 1 : 0.3}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  No risk data available to visualize. Add risks to the register
                  first.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {openAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-md shadow-2xl flex flex-col rounded-none relative">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Add Custom Risk
                </h2>
              </div>
              <button
                onClick={() => setOpenAddDialog(false)}
                className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Risk Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-none"
                  value={newRisk.name}
                  onChange={(e) => setNewRisk({ ...newRisk, name: e.target.value })}
                  placeholder="e.g. Supply Chain Disruption"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-none max-h-[200px]"
                  value={newRisk.category}
                  onChange={(e) =>
                    setNewRisk({ ...newRisk, category: e.target.value })
                  }
                >
                  {[
                    "Environmental",
                    "Social",
                    "Governance",
                    "Technology",
                    "Operational",
                  ].map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-gray-800 text-black dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Impact (1-5)
                  </label>
                  <select
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-none max-h-[200px]"
                    value={newRisk.impact}
                    onChange={(e) =>
                      setNewRisk({ ...newRisk, impact: Number(e.target.value) })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <option key={i} value={i} className="bg-white dark:bg-gray-800 text-black dark:text-white">
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-1/2">
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Likelihood (1-5)
                  </label>
                  <select
                    className="w-full p-2 text-sm border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white rounded-none max-h-[200px]"
                    value={newRisk.likelihood}
                    onChange={(e) =>
                      setNewRisk({ ...newRisk, likelihood: Number(e.target.value) })
                    }
                  >
                    {[1, 2, 3, 4, 5].map((i) => (
                      <option key={i} value={i} className="bg-white dark:bg-gray-800 text-black dark:text-white">
                        {i}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-end gap-3 bg-gray-50 dark:bg-gray-800/30">
              <button
                onClick={() => setOpenAddDialog(false)}
                className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomRisk}
                disabled={!newRisk.name}
                className="px-4 py-2 bg-[#86bc25] hover:bg-[#75a620] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-colors rounded-none"
              >
                Add Risk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialityScoringPage;
