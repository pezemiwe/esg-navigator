import React, { useMemo, useState } from "react";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import { useShallow } from "zustand/react/shallow";
import { sampleUsers } from "@/config/sampleUsers";
import {
  UserCheck,
  ClipboardList,
  Users,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface StatCardProps {
  label: string;
  value: string | number;
  color: string;
  icon: React.ElementType;
}
function StatCard({ label, value, color, icon: Icon }: StatCardProps) {
  return (
    <div className="flex-1 min-w-35 bg-white border border-slate-200 rounded-lg p-4 relative overflow-hidden flex items-center gap-4">
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: color }}
      />
      <div
        className="opacity-80 p-2 rounded-full"
        style={{ backgroundColor: color + "1a", color }}
      >
        <Icon size={24} />
      </div>
      <div>
        <div className="text-2xl font-extrabold leading-none" style={{ color }}>
          {value}
        </div>
        <div className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
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
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Data Management
          </h1>
          <p className="text-slate-500 mt-1">
            Collect and assign data for material metrics approved through the materiality assessment.
            {clientLabel !== "Client" && (
              <span className="ml-1 font-medium text-slate-700">— {clientLabel}</span>
            )}
          </p>
        </div>

        {!activeProjectId || !reportApproved ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
            <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-slate-800 mb-2">No material metrics ready for data collection</h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
              {!activeProjectId
                ? "Start or continue an assessment from the dashboard. Data Management only shows metrics after Phase 5 is approved."
                : "Complete materiality scoring and obtain client approval on the consolidated report. Approved material metrics will appear here automatically."}
            </p>
            <button
              onClick={() => navigate(!activeProjectId ? "/sustainability" : "/sustainability/materiality-scoring")}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#86bc25] hover:bg-[#75a61e] text-white text-sm font-semibold transition-colors"
            >
              {!activeProjectId ? "Go to Assessment Dashboard" : "Go to Materiality Scoring"}
            </button>
          </div>
        ) : (
          <>
            {publishedMetrics.length > 0 && (
              <div className="bg-[#f4fadc] border border-[#86bc25]/30 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#86bc25] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#435e12]">
                    {publishedMetrics.length} material metric{publishedMetrics.length === 1 ? "" : "s"} published from approved assessment
                  </p>
                  <p className="text-xs text-[#525252] mt-0.5">
                    These metrics met the materiality threshold (Final ≥ 6) and are ready for data owner assignment and collection.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4">
              <StatCard
                label="Material Metrics"
                value={publishedMetrics.length}
                color="#da1e28"
                icon={ClipboardList}
              />
              <StatCard
                label="Assigned"
                value={publishedMetrics.filter((m) => m.assignedUserId).length}
                color="#f59e0b"
                icon={UserCheck}
              />
              <StatCard
                label="Unassigned"
                value={publishedMetrics.filter((m) => !m.assignedUserId).length}
                color="#8b5cf6"
                icon={Users}
              />
              <StatCard
                label="Avg Final Score"
                value={
                  publishedMetrics.length
                    ? (publishedMetrics.reduce((a, m) => a + m.finalScore, 0) / publishedMetrics.length).toFixed(1)
                    : "—"
                }
                color="#10b981"
                icon={CheckCircle2}
              />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs tracking-wider uppercase">
                      <th className="p-4 w-24">Ref</th>
                      <th className="p-4">SRRO / CRRO</th>
                      <th className="p-4">Material Metric</th>
                      <th className="p-4 w-40">Topic / Industry</th>
                      <th className="p-4 w-20 text-center">Final</th>
                      <th className="p-4 w-52">Data Owner</th>
                      <th className="p-4 w-36 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {visibleMetrics.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          {isDataOwner
                            ? "No material metrics are assigned to you yet."
                            : "No material metrics were identified in the approved assessment."}
                        </td>
                      </tr>
                    ) : (
                      visibleMetrics
                        .sort((a, b) => b.finalScore - a.finalScore)
                        .map((metric) => (
                          <tr key={metric.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 align-middle">
                              <span className="text-xs font-bold text-[#86bc25] whitespace-nowrap">{metric.srroRef}</span>
                            </td>
                            <td className="p-4 align-middle">
                              <div className="font-semibold text-slate-900 leading-snug">{metric.srroTitle}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{metric.srroCrro} · {metric.type}</div>
                            </td>
                            <td className="p-4 align-middle font-medium text-slate-800">{metric.metricName}</td>
                            <td className="p-4 align-middle text-slate-600 text-xs">
                              {metric.sasbTopic || metric.sasbIndustry || "—"}
                            </td>
                            <td className="p-4 align-middle text-center">
                              <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 text-xs font-bold bg-[#da1e28] text-white">
                                {metric.finalScore}
                              </span>
                            </td>
                            <td className="p-4 align-middle">
                              {isDataOwner ? (
                                <span className="text-slate-700">{user?.name}</span>
                              ) : (
                                <select
                                  value={metric.assignedUserId || ""}
                                  onChange={(e) => {
                                    assignMaterialMetric(metric.id, e.target.value);
                                    setSnackMsg("Data owner assigned");
                                    setTimeout(() => setSnackMsg(""), 3000);
                                  }}
                                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#86bc25]"
                                >
                                  <option value="">Unassigned</option>
                                  {sortedUsers.map((u) => (
                                    <option key={u.name} value={u.name}>{u.name}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="p-4 align-middle text-right">
                              <button
                                onClick={() => navigate("/cra/data")}
                                className="px-3 py-1.5 bg-[#86bc25] hover:bg-[#75a61e] text-white text-xs font-bold rounded shadow-sm transition-colors whitespace-nowrap"
                              >
                                Enter Data
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {snackMsg && (
          <div className="fixed bottom-4 right-4 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <span className="text-sm font-medium">{snackMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
