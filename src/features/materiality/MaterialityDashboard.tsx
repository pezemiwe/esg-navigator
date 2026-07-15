import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import { useShallow } from "zustand/react/shallow";
import { sampleUsers } from "@/config/sampleUsers";
import { ClipboardList, CheckCircle2, ChevronDown, ArrowRight } from "lucide-react";

const PRIORITY_DATA_OWNERS = [
  "Amaka Obiora",
  "Tunde Fashola",
  "Chidinma Obi",
  "Babatunde Okafor",
];

function getSortedUsers() {
  const priority = sampleUsers.filter((u) =>
    PRIORITY_DATA_OWNERS.includes(u.name),
  );
  const rest = sampleUsers.filter(
    (u) => !PRIORITY_DATA_OWNERS.includes(u.name),
  );
  priority.sort(
    (a, b) =>
      PRIORITY_DATA_OWNERS.indexOf(a.name) -
      PRIORITY_DATA_OWNERS.indexOf(b.name),
  );
  return [...priority, ...rest];
}

function scoreColor(fs: number) {
  if (fs >= 12) return "bg-[#da1e28] text-white";
  if (fs >= 6) return "bg-[#f59e0b] text-white";
  if (fs > 0) return "bg-[#86bc25] text-white";
  return "bg-[#f4f4f4] text-[#525252]";
}

export default function MaterialityDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;
  const isDataOwner = role === UserRole.DATA_OWNER;

  const {
    activeProjectId,
    approvedMaterialMetrics,
    reportApproval,
    governanceAssessment,
    assignMaterialMetric,
  } = useSustainabilityStore(
    useShallow((state) => ({
      activeProjectId: state.activeProjectId,
      approvedMaterialMetrics: state.approvedMaterialMetrics,
      reportApproval: state.reportApproval,
      governanceAssessment: state.governanceAssessment,
      assignMaterialMetric: state.assignMaterialMetric,
    })),
  );

  const publishedMetrics = activeProjectId
    ? (approvedMaterialMetrics[activeProjectId] ?? [])
    : [];
  const reportApproved = reportApproval.status === "approved";
  const clientLabel = governanceAssessment.clientName || "Client";
  const sortedUsers = useMemo(() => getSortedUsers(), []);
  const [snackMsg, setSnackMsg] = useState("");

  const visibleMetrics = isDataOwner
    ? publishedMetrics.filter((m) => m.assignedUserId === user?.name)
    : publishedMetrics;

  return (
    <div className="min-h-full bg-[#f4f4f4] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e0e0e0] px-8 py-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-[#86bc25]" />
          <span className="text-[#86bc25] font-bold text-[10px] tracking-widest uppercase">Data Collection</span>
        </div>
        <h1 className="text-[22px] font-semibold text-[#161616]">Data Management</h1>
        <p className="text-[13px] text-[#525252] mt-1 max-w-2xl">
          Collect and assign data for material metrics approved through the materiality assessment.
          {clientLabel !== "Client" && (
            <span className="font-semibold text-[#161616]"> — {clientLabel}</span>
          )}
        </p>
      </div>

      <div className="px-6 py-6 max-w-7xl mx-auto space-y-5">
        {!activeProjectId || !reportApproved ? (
          <div className="bg-white border border-[#e0e0e0] py-20 flex flex-col items-center text-center">
            <ClipboardList className="w-10 h-10 text-[#c6c6c6] mb-4 stroke-1" />
            <p className="text-[15px] font-medium text-[#161616]">No material metrics ready for data collection</p>
            <p className="text-[13px] text-[#525252] mt-1 max-w-md">
              {!activeProjectId
                ? "Start or continue an assessment from the dashboard. Data Management only shows metrics after Phase 5 is approved."
                : "Complete materiality scoring and obtain client approval on the consolidated report. Approved material metrics will appear here automatically."}
            </p>
            <button
              onClick={() => navigate(!activeProjectId ? "/sustainability" : "/sustainability/materiality-scoring")}
              className="flex items-center gap-2 bg-[#86bc25] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors mt-6"
            >
              {!activeProjectId ? "Go to Assessment Dashboard" : "Go to Materiality Scoring"} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {publishedMetrics.length > 0 && (
              <div className="flex items-start gap-3 bg-[#f4fadc] border border-[#86bc25]/30 px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-[#86bc25] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-[#435e12]">
                    {publishedMetrics.length} material metric{publishedMetrics.length === 1 ? "" : "s"} published from approved assessment
                  </p>
                  <p className="text-[12px] text-[#525252] mt-0.5">
                    These metrics met the materiality threshold (Final ≥ 6) and are ready for data owner assignment and collection.
                  </p>
                </div>
              </div>
            )}

            {/* KPI strip */}
            <div className="grid grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0]">
              {[
                { label: "Material Metrics", value: publishedMetrics.length, color: "text-[#161616]" },
                { label: "Assigned", value: publishedMetrics.filter((m) => m.assignedUserId).length, color: "text-[#10b981]" },
                { label: "Unassigned", value: publishedMetrics.filter((m) => !m.assignedUserId).length, color: "text-[#f59e0b]" },
                {
                  label: "Avg Final Score",
                  value: publishedMetrics.length
                    ? (publishedMetrics.reduce((a, m) => a + m.finalScore, 0) / publishedMetrics.length).toFixed(1)
                    : "—",
                  color: "text-[#da1e28]",
                },
              ].map((k) => (
                <div key={k.label} className="bg-white px-6 py-4 text-center">
                  <p className="text-[11px] uppercase font-semibold text-[#525252] mb-1">{k.label}</p>
                  <p className={`text-[28px] font-light ${k.color}`}>{k.value}</p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-white border border-[#e0e0e0] overflow-x-auto">
              <table className="w-full text-left border-collapse" style={{ minWidth: 960 }}>
                <thead>
                  <tr className="bg-[#161616] text-white text-[10px] uppercase tracking-wide">
                    <th className="px-4 py-3 w-24">Ref</th>
                    <th className="px-4 py-3">SRRO / CRRO</th>
                    <th className="px-4 py-3">Material Metric</th>
                    <th className="px-4 py-3 w-40">Topic / Industry</th>
                    <th className="px-4 py-3 w-20 text-center">Final</th>
                    <th className="px-4 py-3 w-52">Data Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMetrics.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-[13px] text-[#8d8d8d] italic">
                        {isDataOwner
                          ? "No material metrics are assigned to you yet."
                          : "No material metrics were identified in the approved assessment."}
                      </td>
                    </tr>
                  ) : (
                    visibleMetrics
                      .sort((a, b) => b.finalScore - a.finalScore)
                      .map((metric, idx) => (
                        <tr key={metric.id} className={`border-t border-[#e0e0e0] hover:bg-[#fafafa] transition-colors ${idx % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}>
                          <td className="px-4 py-3 align-top">
                            <span className="text-[11px] font-bold text-[#86bc25] whitespace-nowrap">{metric.srroRef}</span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            <div className="text-[13px] font-semibold text-[#161616] leading-snug">{metric.srroTitle}</div>
                            <div className="text-[11px] text-[#525252] mt-0.5">{metric.srroCrro} · {metric.type}</div>
                          </td>
                          <td className="px-4 py-3 align-top text-[12px] font-medium text-[#161616]">{metric.metricName}</td>
                          <td className="px-4 py-3 align-top text-[12px] text-[#525252]">
                            {metric.sasbTopic || metric.sasbIndustry || "—"}
                          </td>
                          <td className="px-4 py-3 align-top text-center">
                            <span className={`inline-flex items-center justify-center min-w-8 px-2 py-0.5 text-[11px] font-bold ${scoreColor(metric.finalScore)}`}>
                              {metric.finalScore}
                            </span>
                          </td>
                          <td className="px-4 py-3 align-top">
                            {isDataOwner ? (
                              <span className="text-[13px] text-[#161616]">{user?.name}</span>
                            ) : (
                              <div className="relative">
                                <select
                                  value={metric.assignedUserId || ""}
                                  onChange={(e) => {
                                    assignMaterialMetric(metric.id, e.target.value);
                                    setSnackMsg("Data owner assigned");
                                    setTimeout(() => setSnackMsg(""), 3000);
                                  }}
                                  className="w-full appearance-none bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] text-[#161616] px-3 py-1.5 pr-7 cursor-pointer transition-all"
                                >
                                  <option value="">Unassigned</option>
                                  {sortedUsers.map((u) => (
                                    <option key={u.name} value={u.name}>{u.name}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252] pointer-events-none" />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {snackMsg && (
        <div className="fixed bottom-4 right-4 bg-[#161616] text-white px-4 py-3 shadow-xl flex items-center gap-3 z-50">
          <CheckCircle2 className="w-4 h-4 text-[#86bc25]" />
          <span className="text-[13px] font-medium">{snackMsg}</span>
        </div>
      )}
    </div>
  );
}
