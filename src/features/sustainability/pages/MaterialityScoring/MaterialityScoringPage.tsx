import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
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

const getHeatMapScore = (impact: number, likelihood: number) => impact * likelihood;

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
      internalApproveMaterialityAssessment: state.internalApproveMaterialityAssessment,
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
    setNewRisk({ name: "", category: "Environmental", impact: 3, likelihood: 3 });
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
    if (selectionBasis === "by-severity") return sortedRisksData.filter((r) => selectedMaterialTopicIds.includes(r.id));
    if (selectionBasis === "cherry-pick") return sortedRisksData;
    if (topNSelection === "all") return sortedRisksData;
    return sortedRisksData.slice(0, topNSelection as number);
  }, [sortedRisksData, selectionBasis, topNSelection, selectedMaterialTopicIds]);

  const selectedCount = useMemo(() => {
    if (selectionBasis === "top-n") return displayedChartData.length;
    return selectedMaterialTopicIds.length;
  }, [selectionBasis, displayedChartData, selectedMaterialTopicIds]);

  const severityLevels = useMemo(() => {
    if (entityProfile.scoringMatrix?.levels) return entityProfile.scoringMatrix.levels;
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
    return sortedRisksData.filter((r) => selectedMaterialTopicIds.includes(r.id));
  }, [selectionBasis, displayedChartData, sortedRisksData, selectedMaterialTopicIds]);

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
    <div className="h-full overflow-y-auto w-full bg-slate-50 dark:bg-slate-900/50 p-6 lg:p-8">
      <div className="mb-8">
        <button
          onClick={() => navigate("/sustainability/risks")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Risk Register
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
              Materiality Scoring & Prioritization
            </h1>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Review your identified risks sorted by calculated severity (Heat Score)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {materialityApproval.status === "approved" ? (
              <button
                onClick={handleProceed}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#86BC25] hover:bg-[#75A520] text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
              >
                Proceed to Data Collection <ArrowRight size={16} />
              </button>
            ) : isSubmitted ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-500 rounded-full font-bold text-xs">
                <ShieldCheck size={14} />
                {materialityApproval.status === "pending_internal"
                  ? "Pending Internal Review"
                  : "Pending Board Approval"}
              </div>
            ) : user?.role === UserRole.SUSTAINABILITY_MANAGER ? (
              <button
                title="Submit your selection for approval before proceeding"
                onClick={handleSubmitForApproval}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-black rounded-lg font-bold text-sm transition-colors shadow-sm"
              >
                <ShieldCheck size={16} />
                Submit for Approval
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Internal Control / Audit approval panel */}
      {materialityApproval.status === "pending_internal" && user?.role === UserRole.SUSTAINABILITY_APPROVER && (
        <div className="mb-6 p-6 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/60 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
            Internal Control / Audit Review
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Submitted by {materialityApproval.submittedBy} on{" "}
            {materialityApproval.submittedAt ? new Date(materialityApproval.submittedAt).toLocaleString() : ""}
          </p>
          <div className="mb-4">
            <TextField
              label="Comment (optional)"
              size="small"
              fullWidth
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              InputProps={{ style: { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'transparent' } }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                internalApproveMaterialityAssessment(user?.name ?? "Internal Reviewer", approvalComment || undefined);
                setApprovalComment("");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors"
            >
              <CheckCircle2 size={16} />
              Approve
            </button>
            <button
              onClick={() => {
                rejectMaterialityAssessment(user?.name ?? "Internal Reviewer", approvalComment || "Needs revision");
                setApprovalComment("");
              }}
              className="flex items-center gap-2 px-4 py-2 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg font-semibold text-sm transition-colors"
            >
              <XCircle size={16} />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Board / Final approval panel */}
      {materialityApproval.status === "pending_board" && user?.role === UserRole.ADMIN && (
        <div className="mb-6 p-6 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800/60 rounded-xl shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">
            Board / Final Approval
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Internal review passed. Submitted by {materialityApproval.submittedBy}.
          </p>
          <div className="mb-4">
            <TextField
              label="Comment (optional)"
              size="small"
              fullWidth
              value={approvalComment}
              onChange={(e) => setApprovalComment(e.target.value)}
              InputProps={{ style: { backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'transparent' } }}
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                approveMaterialityAssessment(user?.name ?? "Board Approver", approvalComment || undefined);
                setApprovalComment("");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors"
            >
              <ShieldCheck size={16} />
              Approve
            </button>
            <button
              onClick={() => {
                rejectMaterialityAssessment(user?.name ?? "Board Approver", approvalComment || "Needs revision");
                setApprovalComment("");
              }}
              className="flex items-center gap-2 px-4 py-2 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg font-semibold text-sm transition-colors"
            >
              <XCircle size={16} />
              Reject
            </button>
          </div>
        </div>
      )}

      {/* Status banners */}
      {materialityApproval.status === "pending_internal" && user?.role !== UserRole.SUSTAINABILITY_APPROVER && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
          <ShieldCheck className="text-blue-600 dark:text-blue-400" size={20} />
          <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">Awaiting Internal Control / Audit review.</span>
        </div>
      )}
      {materialityApproval.status === "pending_board" && user?.role !== UserRole.ADMIN && (
        <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
          <ShieldCheck className="text-blue-600 dark:text-blue-400" size={20} />
          <span className="text-sm text-blue-800 dark:text-blue-300 font-medium">Internal review passed. Awaiting Board final approval.</span>
        </div>
      )}
      {materialityApproval.status === "rejected" && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 flex items-start gap-3">
          <AlertTriangle className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-rose-800 dark:text-rose-300">
            <strong className="font-semibold">Assessment returned for revision</strong> by {materialityApproval.approvedBy}.
            {materialityApproval.comment && ` Reason: ${materialityApproval.comment}`} — Revise your selection and re-submit.
          </div>
        </div>
      )}
      {materialityApproval.status === "approved" && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
          <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={20} />
          <span className="text-sm text-emerald-800 dark:text-emerald-300">
            <strong className="font-semibold">Board approval granted</strong> by {materialityApproval.approvedBy}. You may now proceed to data collection.
          </span>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white dark:bg-[#0B1120] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 mb-8">
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex-1">
            {isSubmitted ? (
               <div className="flex items-center gap-2 py-2">
                 <ShieldCheck size={18} color="#86BC25" />
                 <span className="text-sm font-bold text-slate-800 dark:text-white">Selection locked</span>
                 <span className="text-xs text-slate-500 dark:text-slate-400">
                    — submitted for approval. The <strong className="text-slate-700 dark:text-slate-300">{chartData.length}</strong> topics below are fixed until a decision is made.
                 </span>
               </div>
            ) : (
              <>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Selection Method</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {[
                    { value: "top-n", label: "Top Material Risks" },
                    { value: "by-severity", label: "By Severity" },
                    { value: "cherry-pick", label: "Custom Select" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectionBasis(option.value as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${
                        selectionBasis === option.value
                          ? "bg-[#86BC25] text-black"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      {option.value === "cherry-pick" && <CheckSquare size={14} />}
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
                        onClick={() => setTopNSelection(num === "all" ? "all" : (num as number))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          topNSelection === num
                            ? "bg-[#86BC25]/15 border-[#86BC25]/40 text-[#86BC25]"
                            : "bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        }`}
                      >
                        {num === "all" ? "View All" : `Top ${num}`}
                      </button>
                    ))}
                  </div>
                )}

                {selectionBasis === "by-severity" && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Select a severity level to include all risks at that threshold:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {severityLevels.map((level) => (
                        <button
                          key={level}
                          onClick={() => selectBySeverity(level)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                            selectedSeverityLevel === level
                              ? "bg-[#86BC25]/15 border-[#86BC25]/40 text-[#86BC25]"
                              : "bg-transparent border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectionBasis === "cherry-pick" && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Click any bar in the chart below to include or exclude it from your materiality assessment.
                  </span>
                )}
              </>
            )}
          </div>

          <div className="text-right pl-6 sm:shrink-0 flex flex-col justify-end">
             <span className="text-4xl font-extrabold text-[#86BC25] leading-none mb-1">{selectedCount}</span>
             <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Topics Selected</span>
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
                  <CartesianGrid strokeDasharray="3 3" stroke={borderColor} horizontal={true} vertical={false} />
                  <XAxis type="number" stroke={isDark ? "#64748b" : "#94a3b8"} fontSize={12} domain={[0, 25]} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke={isDark ? "#64748b" : "#94a3b8"}
                    fontSize={12}
                    width={250}
                    tickFormatter={(val) => (val.length > 35 ? val.substring(0, 35) + "..." : val)}
                  />
                  <RechartsTooltip
                    cursor={{ fill: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-[#0B1120] p-4 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800/60">
                            <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-0.5">{data.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{data.category} • {data.subcategory}</p>
                            <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700/60 flex flex-col gap-1.5">
                               <div className="flex justify-between items-center gap-6">
                                  <span className="text-xs text-slate-600 dark:text-slate-400">Heat Score:</span>
                                  <span className="text-xs font-bold text-slate-800 dark:text-white">{data.heatScore} / 25</span>
                               </div>
                               <div className="flex justify-between items-center gap-6">
                                  <span className="text-xs text-slate-600 dark:text-slate-400">Likelihood:</span>
                                  <span className="text-xs font-bold text-slate-800 dark:text-white">{data.likelihood}</span>
                               </div>
                               <div className="flex justify-between items-center gap-6">
                                  <span className="text-xs text-slate-600 dark:text-slate-400">Impact:</span>
                                  <span className="text-xs font-bold text-slate-800 dark:text-white">{data.impact}</span>
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
                    radius={[0, 4, 4, 0]}
                    onClick={
                      !isSubmitted && selectionBasis === "cherry-pick"
                        ? (data: { id?: string }) => {
                            if (data?.id) handleToggleCherryPick(data.id);
                          }
                        : undefined
                    }
                    cursor={!isSubmitted && selectionBasis === "cherry-pick" ? "pointer" : "default"}
                  >
                    {chartData.map((entry, index) => {
                      const isSelected =
                        isSubmitted ||
                        selectionBasis !== "cherry-pick" ||
                        selectedMaterialTopicIds.includes(entry.id);
                      return (
                        <Cell key={`cell-${index}`} fill={getRiskColor(entry.heatScore)} opacity={isSelected ? 1 : 0.3} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-sm text-slate-500 dark:text-slate-400">No risk data available to visualize. Add risks to the register first.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Custom Risk</DialogTitle>
        <DialogContent>
          <div className="flex flex-col gap-4 mt-2">
            <TextField
              label="Risk Name"
              fullWidth
              value={newRisk.name}
              onChange={(e) => setNewRisk({ ...newRisk, name: e.target.value })}
              placeholder="e.g. Supply Chain Disruption"
            />
            <TextField select label="Category" fullWidth value={newRisk.category} onChange={(e) => setNewRisk({ ...newRisk, category: e.target.value })}>
              {["Environmental", "Social", "Governance", "Technology", "Operational"].map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
            <div className="flex gap-4">
              <TextField select label="Impact (1-5)" fullWidth value={newRisk.impact} onChange={(e) => setNewRisk({ ...newRisk, impact: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
              </TextField>
              <TextField select label="Likelihood (1-5)" fullWidth value={newRisk.likelihood} onChange={(e) => setNewRisk({ ...newRisk, likelihood: Number(e.target.value) })}>
                {[1, 2, 3, 4, 5].map((i) => <MenuItem key={i} value={i}>{i}</MenuItem>)}
              </TextField>
            </div>
          </div>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <button onClick={() => setOpenAddDialog(false)} className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors">Cancel</button>
          <button
            onClick={handleAddCustomRisk}
            disabled={!newRisk.name}
            className="px-4 py-2 bg-[#86BC25] hover:bg-[#75A520] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-colors shadow-sm"
          >
            Add Risk
          </button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default MaterialityScoringPage;
