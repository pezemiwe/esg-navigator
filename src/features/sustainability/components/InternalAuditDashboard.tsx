import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  CheckCircle2,
} from "lucide-react";
import { useMaterialityStore } from "@/store/materialityStore";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
  formatNumber,
} from "../data/constants";
import { StatCard } from "./StatCard";

// Deloitte Enterprise Colors


export function InternalAuditDashboard() {
  const { topics } = useMaterialityStore(
    useShallow((s) => ({ topics: s.topics })),
  );
  const {
    entityProfile,
    risks,
    materialityApproval,
    selectedMaterialTopicIds,
    scope1Assets,
    scope2Entries,
    scope3Entries,
  } = useSustainabilityStore(
    useShallow((s) => ({
      entityProfile: s.entityProfile,
      risks: s.risks,
      materialityApproval: s.materialityApproval,
      selectedMaterialTopicIds: s.selectedMaterialTopicIds,
      scope1Assets: s.scope1Assets,
      scope2Entries: s.scope2Entries,
      scope3Entries: s.scope3Entries,
    })),
  );

  const s1 = useMemo(() => calculateScope1(scope1Assets), [scope1Assets]);
  const s2 = useMemo(() => calculateScope2(scope2Entries), [scope2Entries]);
  const s3 = useMemo(() => calculateScope3(scope3Entries), [scope3Entries]);
  const totalEmissions = s1 + s2 + s3;

  const selectedTopics = useMemo(
    () => topics.filter((t) => t.selected),
    [topics],
  );
  const awaitingReview = selectedTopics.filter(
    (t) => t.approvalStatus === "Manager Approved",
  );
  const iaApproved = selectedTopics.filter(
    (t) => t.approvalStatus === "Internal Audit Approved",
  );
  const boardApproved = selectedTopics.filter(
    (t) => t.approvalStatus === "Board Approved",
  );
  const pendingSubmission = selectedTopics.filter(
    (t) =>
      !t.approvalStatus ||
      t.approvalStatus === "Draft" ||
      t.approvalStatus === "Submitted",
  );

  const auditTrend = [
    { quarter: "Q1 '24", reviewed: 8, approved: 6, returned: 2 },
    { quarter: "Q2 '24", reviewed: 10, approved: 8, returned: 2 },
    { quarter: "Q3 '24", reviewed: 11, approved: 9, returned: 2 },
    { quarter: "Q4 '24", reviewed: 14, approved: 12, returned: 2 },
    { quarter: "Q1 '25", reviewed: 12, approved: 10, returned: 2 },
    { quarter: "Q2 '25", reviewed: 15, approved: 14, returned: 1 },
    { quarter: "Q3 '25", reviewed: 18, approved: 16, returned: 2 },
    {
      quarter: "Q4 '25",
      reviewed: awaitingReview.length + iaApproved.length,
      approved: iaApproved.length,
      returned: 0,
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto text-[#161616]">
      <div className="mb-6">
        <p className="text-[12px] font-bold text-[#86bc25] uppercase tracking-widest">
          INTERNAL AUDIT DASHBOARD
        </p>
        <h2 className="text-[32px] font-light mt-1">Audit Review Center</h2>
        <p className="text-[14px] text-[#525252] mt-1">
          Quarterly review pipeline for {entityProfile.name} - IFRS S1/S2 compliance monitoring
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div>
          <StatCard
            icon={Clock}
            label="Awaiting Your Review"
            value={awaitingReview.length}
            change={{ value: -12.5, label: "vs last Q" }}
            color="#f59e0b"
          />
        </div>
        <div>
          <StatCard
            icon={ShieldCheck}
            label="Audit Approved"
            value={iaApproved.length + boardApproved.length}
            change={{ value: 28.6, label: "vs 2024" }}
            color="#10b981"
          />
        </div>
        <div>
          <StatCard
            icon={AlertTriangle}
            label="Total Risks"
            value={risks.length}
            sub={`${selectedMaterialTopicIds.length} material`}
            change={{ value: 5.3, label: "vs 2024" }}
            color="#ef4444"
          />
        </div>
        <div>
          <StatCard
            icon={Leaf}
            label="Total Emissions"
            value={`${formatNumber(totalEmissions)} tCO2e`}
            change={{ value: 3.1, label: "vs 2024" }}
            color="#3b82f6"
          />
        </div>
      </div>

      {materialityApproval.status !== "none" && (
        <div
          className={`p-5 mb-6 border ${
            materialityApproval.status === "pending_internal"
              ? "bg-[#fffbeb] border-[#fde68a]" // yellow-50, yellow-200 equivalent
              : "bg-[#f0fdf4] border-[#bbf7d0]" // green-50, green-200 equivalent
          }`}
        >
          <div className="flex items-center gap-3">
            {materialityApproval.status === "pending_internal" ? (
              <Clock size={18} className="text-[#d97706]" />
            ) : (
              <CheckCircle2 size={18} className="text-[#16a34a]" />
            )}
            <div>
              <p className="text-[14px] font-bold">
                Assessment Status:{" "}
                {materialityApproval.status
                  .replace("pending_", "Pending ")
                  .replace("_", " ")
                  .toUpperCase()}
              </p>
              <p className="text-[12px] text-[#525252]">
                Submitted by {materialityApproval.submittedBy || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2 bg-white border border-[#e0e0e0] p-6">
          <h3 className="text-[14px] font-bold mb-4">
            Audit Review Trend (2024 - 2025)
          </h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={auditTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="quarter" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar
                  dataKey="reviewed"
                  name="Reviewed"
                  fill="#3b82f6"
                  radius={[0, 0, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="approved"
                  name="Approved"
                  fill="#10b981"
                  radius={[0, 0, 0, 0]}
                  barSize={18}
                />
                <Bar
                  dataKey="returned"
                  name="Returned"
                  fill="#ef4444"
                  radius={[0, 0, 0, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-[#e0e0e0] p-6">
          <h3 className="text-[14px] font-bold mb-4">Approval Pipeline</h3>
          <div className="flex flex-col gap-4">
            {[
              {
                label: "Pending Submission",
                count: pendingSubmission.length,
                color: "bg-[#94a3b8]",
                textColor: "text-[#94a3b8]",
              },
              {
                label: "Manager Approved (Awaiting IA)",
                count: awaitingReview.length,
                color: "bg-[#f59e0b]",
                textColor: "text-[#f59e0b]",
              },
              {
                label: "IA Approved",
                count: iaApproved.length,
                color: "bg-[#10b981]",
                textColor: "text-[#10b981]",
              },
              {
                label: "Board Approved",
                count: boardApproved.length,
                color: "bg-[#86bc25]",
                textColor: "text-[#86bc25]",
              },
            ].map((stage) => {
              const progress =
                selectedTopics.length > 0
                  ? (stage.count / selectedTopics.length) * 100
                  : 0;

              return (
                <div key={stage.label} className="w-full">
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] font-medium text-[#161616]">
                      {stage.label}
                    </span>
                    <span className={`text-[12px] font-bold ${stage.textColor}`}>
                      {stage.count}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#f4f4f4] overflow-hidden">
                    <div
                      className={`h-full ${stage.color}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e0e0e0]">
        <div className="px-6 py-4 border-b border-[#e0e0e0]">
          <h3 className="text-[14px] font-bold">
            Topics Requiring Audit Review
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4f4f4] text-[12px] text-[#525252] border-b border-[#e0e0e0]">
                <th className="px-6 py-3 font-semibold">Topic</th>
                <th className="px-6 py-3 font-semibold">Data Owner</th>
                <th className="px-6 py-3 font-semibold">Branch</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Approved By</th>
              </tr>
            </thead>
            <tbody>
              {selectedTopics.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-[#525252] text-[14px]">
                    No topics in the pipeline yet
                  </td>
                </tr>
              ) : (
                selectedTopics.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-b border-[#e0e0e0] transition-colors ${
                      t.approvalStatus === "Manager Approved"
                        ? "bg-[#fffbeb]" // light orange/yellow equivalent
                        : "hover:bg-[#f4f4f4]"
                    }`}
                  >
                    <td className="px-6 py-3 text-[14px] font-medium text-[#161616]">
                      {t.name}
                    </td>
                    <td className="px-6 py-3 text-[14px] text-[#525252]">
                      {t.assignedUserId || "—"}
                    </td>
                    <td className="px-6 py-3 text-[14px] text-[#525252]">
                      {t.assignedBranch || "HQ"}
                    </td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full ${
                          t.approvalStatus?.includes("Approved")
                            ? "bg-green-100 text-green-800"
                            : t.approvalStatus === "Submitted" ||
                              t.approvalStatus === "Manager Approved"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {t.approvalStatus || "Draft"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-[14px] text-[#525252]">
                      {t.approvedBy || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
