import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Target,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  Clock,
  CheckCircle2,
  Shield,
  Zap,
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
const BRAND = "#86bc25";

export function BoardDashboard() {
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
    scenarioResults,
  } = useSustainabilityStore(
    useShallow((s) => ({
      entityProfile: s.entityProfile,
      risks: s.risks,
      materialityApproval: s.materialityApproval,
      selectedMaterialTopicIds: s.selectedMaterialTopicIds,
      scope1Assets: s.scope1Assets,
      scope2Entries: s.scope2Entries,
      scope3Entries: s.scope3Entries,
      scenarioResults: s.scenarioResults,
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
  const awaitingBoard = selectedTopics.filter(
    (t) => t.approvalStatus === "Internal Audit Approved",
  );
  const boardApproved = selectedTopics.filter(
    (t) => t.approvalStatus === "Board Approved",
  );

  const emissionsTrend = useMemo(
    () => [
      {
        year: "FY 2020",
        scope1: s1 * 0.72,
        scope2: s2 * 0.68,
        scope3: s3 * 0.55,
        total: (s1 + s2 + s3) * 0.65,
      },
      {
        year: "FY 2021",
        scope1: s1 * 0.78,
        scope2: s2 * 0.74,
        scope3: s3 * 0.7,
        total: (s1 + s2 + s3) * 0.74,
      },
      {
        year: "FY 2022",
        scope1: s1 * 0.85,
        scope2: s2 * 0.82,
        scope3: s3 * 0.8,
        total: (s1 + s2 + s3) * 0.82,
      },
      {
        year: "FY 2023",
        scope1: s1 * 0.92,
        scope2: s2 * 0.9,
        scope3: s3 * 0.88,
        total: (s1 + s2 + s3) * 0.9,
      },
      {
        year: "FY 2024",
        scope1: s1 * 0.97,
        scope2: s2 * 0.95,
        scope3: s3 * 0.94,
        total: (s1 + s2 + s3) * 0.95,
      },
      {
        year: "FY 2025",
        scope1: s1,
        scope2: s2,
        scope3: s3,
        total: totalEmissions,
      },
    ],
    [s1, s2, s3, totalEmissions],
  );

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto text-[#161616]">
      <div className="mb-6">
        <p className="text-[12px] font-bold text-[#86bc25] uppercase tracking-widest">
          BOARD OVERSIGHT DASHBOARD
        </p>
        <h2 className="text-[32px] font-light mt-1">{entityProfile.name}</h2>
        <p className="text-[14px] text-[#525252] mt-1">
          Executive sustainability governance and IFRS S1/S2 compliance overview
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div>
          <StatCard
            icon={Target}
            label="Material Topics"
            value={selectedMaterialTopicIds.length}
            sub={`${boardApproved.length} board-approved`}
            change={{ value: 11.1, label: "vs 2024" }}
            color={BRAND}
          />
        </div>
        <div>
          <StatCard
            icon={ShieldCheck}
            label="Awaiting Board Approval"
            value={awaitingBoard.length}
            change={{ value: -25.0, label: "vs last Q" }}
            color="#f59e0b"
          />
        </div>
        <div>
          <StatCard
            icon={Leaf}
            label="GHG Emissions"
            value={`${formatNumber(totalEmissions)} tCO2e`}
            change={{ value: 5.3, label: "vs 2024" }}
            color="#10b981"
          />
        </div>
        <div>
          <StatCard
            icon={AlertTriangle}
            label="Scenario Analyses"
            value={scenarioResults.length}
            sub={`${risks.length} risks tracked`}
            change={{ value: 33.3, label: "vs 2024" }}
            color="#3b82f6"
          />
        </div>
      </div>

      {materialityApproval.status !== "none" && (
        <div
          className={`p-5 mb-6 border ${
            materialityApproval.status === "pending_board"
              ? "bg-[#fffbeb] border-[#fde68a]" // yellow
              : materialityApproval.status === "approved"
              ? "bg-[#f0fdf4] border-[#bbf7d0]" // green
              : "bg-[#eff6ff] border-[#bfdbfe]" // blue
          }`}
        >
          <div className="flex items-center gap-3">
            {materialityApproval.status === "pending_board" ? (
              <Clock size={18} className="text-[#d97706]" />
            ) : materialityApproval.status === "approved" ? (
              <CheckCircle2 size={18} className="text-[#16a34a]" />
            ) : (
              <Shield size={18} className="text-[#2563eb]" />
            )}
            <div>
              <p className="text-[14px] font-bold">
                Materiality Assessment:{" "}
                {materialityApproval.status === "pending_board"
                  ? "PENDING BOARD APPROVAL"
                  : materialityApproval.status === "approved"
                  ? "BOARD APPROVED"
                  : materialityApproval.status.replace("_", " ").toUpperCase()}
              </p>
              {materialityApproval.submittedBy && (
                <p className="text-[12px] text-[#525252]">
                  Submitted by {materialityApproval.submittedBy}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white border border-[#e0e0e0] p-6">
          <h3 className="text-[14px] font-bold mb-4">
            GHG Emissions Trend (FY 2020 - 2025)
          </h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emissionsTrend}>
                <defs>
                  <linearGradient id="boardEmGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BRAND} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="year" fontSize={11} />
                <YAxis fontSize={11} tickFormatter={(v) => formatNumber(v)} />
                <Tooltip
                  formatter={(v: number | undefined) =>
                    v !== undefined ? `${formatNumber(v)} tCO2e` : ""
                  }
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Total Emissions"
                  stroke={BRAND}
                  fill="url(#boardEmGrad)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="scope1"
                  name="Scope 1"
                  stroke="#ef4444"
                  fill="none"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <Area
                  type="monotone"
                  dataKey="scope2"
                  name="Scope 2"
                  stroke="#f59e0b"
                  fill="none"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
                <Area
                  type="monotone"
                  dataKey="scope3"
                  name="Scope 3"
                  stroke="#3b82f6"
                  fill="none"
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border border-[#e0e0e0] p-6">
          <h3 className="text-[14px] font-bold mb-4">Governance KPIs</h3>
          <div className="flex flex-col gap-4">
            {[
              {
                label: "IFRS S1/S2 Disclosure Readiness",
                value: entityProfile.completed ? 85 : 25,
                color: "bg-[#86bc25]",
                textColor: "text-[#86bc25]",
              },
              {
                label: "Materiality Assessment Completion",
                value:
                  selectedTopics.length > 0
                    ? Math.round(
                        (boardApproved.length / selectedTopics.length) * 100,
                      )
                    : 0,
                color: "bg-[#10b981]",
                textColor: "text-[#10b981]",
              },
              {
                label: "Risk Register Coverage",
                value: risks.length > 0 ? 92 : 0,
                color: "bg-[#3b82f6]",
                textColor: "text-[#3b82f6]",
              },
              {
                label: "Data Collection Rate",
                value:
                  selectedTopics.length > 0
                    ? Math.round(
                        (selectedTopics.filter(
                          (t) => t.approvalStatus && t.approvalStatus !== "Draft",
                        ).length /
                          selectedTopics.length) *
                          100,
                      )
                    : 0,
                color: "bg-[#f59e0b]",
                textColor: "text-[#f59e0b]",
              },
            ].map((kpi) => (
              <div key={kpi.label} className="w-full">
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] font-medium text-[#161616]">
                    {kpi.label}
                  </span>
                  <span className={`text-[12px] font-bold ${kpi.textColor}`}>
                    {kpi.value}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#f4f4f4] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${kpi.color}`}
                    style={{ width: `${kpi.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#eff6ff] border border-[#bfdbfe] p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} className="text-[#2563eb]" />
          <h3 className="text-[14px] font-bold text-[#161616]">Board-Level Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Regulatory Compliance",
              text: `The bank has identified ${risks.length} climate-related risks across ${selectedMaterialTopicIds.length} material topics. IFRS S1/S2 disclosure framework is ${
                entityProfile.completed ? "substantially" : "partially"
              } complete.`,
            },
            {
              title: "Carbon Footprint",
              text: `Total GHG emissions stand at ${formatNumber(totalEmissions)} tCO2e. Financed emissions (Scope 3) represent ${
                totalEmissions > 0
                  ? Math.round((s3 / totalEmissions) * 100)
                  : 0
              }% of the total footprint, requiring portfolio-level decarbonization.`,
            },
            {
              title: "Approval Status",
              text: `${boardApproved.length} of ${selectedTopics.length} material topics have received board approval. ${awaitingBoard.length} topic(s) are pending board-level sign-off following internal audit clearance.`,
            },
          ].map((insight) => (
            <div key={insight.title} className="bg-[#dbeafe] p-4 rounded">
              <span className="block text-[12px] font-bold text-[#2563eb] mb-1">
                {insight.title}
              </span>
              <span className="text-[12px] text-[#525252] leading-relaxed">
                {insight.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
