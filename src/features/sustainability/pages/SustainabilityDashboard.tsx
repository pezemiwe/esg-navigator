import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  AlertTriangle,
  Leaf,
  Building2,
  Target,
  BarChart3,
  Activity,
  Zap,
  FileText,
  CheckCircle2,
  Database,
  CircleDashed,
  RotateCcw,
} from "lucide-react";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useMaterialityStore } from "@/store/materialityStore";
import { useShallow } from "zustand/react/shallow";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
  formatNaira,
  formatNumber,
  getRiskColor,
  getRiskLevel,
  DEFAULT_RISKS,
  DEFAULT_SCOPE1,
  DEFAULT_SCOPE2,
  DEFAULT_SCOPE3,
} from "../data/constants";
import { StatCard } from "../components/StatCard";
import { DataOwnerDashboard } from "../components/DataOwnerDashboard";
import { InternalAuditDashboard } from "../components/InternalAuditDashboard";
import { BoardDashboard } from "../components/BoardDashboard";

const PIE_COLORS = [
  "#86bc25", // Deloitte green
  "#000000",
  "#53565A",
  "#046A38",
  "#C4D600",
  "#A0AD31",
  "#727272",
  "#c6c6c6",
];

export default function SustainabilityDashboard() {
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;

  const {
    entityProfile,
    risks,
    selectedMaterialTopicIds,
    scope1Assets,
    scope2Entries,
    scope3Entries,
    scenarioResults,
    templates,
    setRisks,
  } = useSustainabilityStore(
    useShallow((state) => ({
      entityProfile: state.entityProfile,
      risks: state.risks,
      selectedMaterialTopicIds: state.selectedMaterialTopicIds,
      scope1Assets: state.scope1Assets,
      scope2Entries: state.scope2Entries,
      scope3Entries: state.scope3Entries,
      scenarioResults: state.scenarioResults,
      templates: state.templates,
      setRisks: state.setRisks,
    })),
  );

  const s1 = useMemo(() => calculateScope1(scope1Assets), [scope1Assets]);
  const s2 = useMemo(() => calculateScope2(scope2Entries), [scope2Entries]);
  const s3 = useMemo(() => calculateScope3(scope3Entries), [scope3Entries]);
  const totalEmissions = s1 + s2 + s3;

  const emissionsTrend = useMemo(
    () => [
      {
        year: "FY 2022",
        scope1: s1 * 0.88,
        scope2: s2 * 0.92,
        scope3: s3 * 0.85,
      },
      {
        year: "FY 2023",
        scope1: s1 * 0.94,
        scope2: s2 * 0.96,
        scope3: s3 * 0.92,
      },
      {
        year: "FY 2024",
        scope1: s1 * 0.97,
        scope2: s2 * 0.98,
        scope3: s3 * 0.96,
      },
      { year: "FY 2025", scope1: s1, scope2: s2, scope3: s3 },
    ],
    [s1, s2, s3],
  );

  const topRisks = useMemo(() => {
    return [...risks]
      .sort((a, b) => b.impact * b.likelihood - a.impact * a.likelihood)
      .slice(0, 10);
  }, [risks]);

  const categoryDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    risks.forEach((r) => {
      map[r.category] = (map[r.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [risks]);

  const exposureData = useMemo(() => {
    return (entityProfile?.sectorExposures || []).map((s) => ({
      name: s.sector,
      value: ((entityProfile.loanBook || 0) * s.percentage) / 100,
      pct: s.percentage,
    }));
  }, [entityProfile]);

  const STAGES = useMemo(
    () => [
      {
        id: "profile",
        label: "Entity Profile",
        desc: "Define reporting boundaries & sector exposure",
        done: entityProfile.completed,
        icon: Building2,
      },
      {
        id: "risks",
        label: "Risk Register",
        desc: "Identify climate & sustainability risks",
        done: risks.length > 0,
        icon: AlertTriangle,
      },
      {
        id: "materiality",
        label: "Material Topics",
        desc: "Determine high-priority impact areas",
        done: selectedMaterialTopicIds.length > 0,
        icon: Target,
      },
      {
        id: "scope1",
        label: "Scope 1 Emissions",
        desc: "Calculate direct facility emissions",
        done: scope1Assets.length > 0,
        icon: Activity,
      },
      {
        id: "scope2",
        label: "Scope 2 Emissions",
        desc: "Record purchased electricity & heating",
        done: scope2Entries.length > 0,
        icon: Zap,
      },
      {
        id: "scope3",
        label: "Scope 3 Emissions",
        desc: "Measure financed & supply chain emissions",
        done: scope3Entries.length > 0,
        icon: TrendingUp,
      },
      {
        id: "templates",
        label: "Data Templates",
        desc: "Process portfolio data tracking",
        done: templates.length > 0,
        icon: FileText,
      },
      {
        id: "scenarios",
        label: "Scenario Analysis",
        desc: "Execute climate stress testing",
        done: scenarioResults.length > 0,
        icon: BarChart3,
      },
    ],
    [
      entityProfile,
      risks,
      selectedMaterialTopicIds,
      scope1Assets,
      scope2Entries,
      scope3Entries,
      templates,
      scenarioResults,
    ],
  );

  const completionPct = useMemo(() => {
    const completedCount = STAGES.filter((s) => s.done).length;
    return Math.round((completedCount / STAGES.length) * 100);
  }, [STAGES]);

  const isFlowComplete = completionPct === 100;

  if (role === UserRole.DATA_OWNER) return <DataOwnerDashboard />;
  if (role === UserRole.SUSTAINABILITY_APPROVER)
    return <InternalAuditDashboard />;
  if (role === UserRole.BOARD) return <BoardDashboard />;

  const branchCompletion = [
    { region: "Lagos HQ", pct: 100 },
    { region: "Lagos Branches", pct: 92 },
    { region: "Abuja Region", pct: 85 },
    { region: "Northern Region", pct: 72 },
    { region: "South-South", pct: 68 },
    { region: "South-East", pct: 61 },
  ];

  const handleReset = () => {
    useSustainabilityStore.getState().reset();
    useMaterialityStore.getState().reset();
    window.location.reload();
  };

  const handlePopulateSampleData = () => {
    setRisks(DEFAULT_RISKS);
    setTimeout(() => {
      useSustainabilityStore.getState().selectTopMaterialTopics(10);
      useSustainabilityStore.setState((state) => ({
        entityProfile: {
          ...state.entityProfile,
          name: "Guaranty Trust Holding Company PLC",
          completed: true,
          loanBook: 4500000000,
          branches: 240,
          sectorExposures: [
            { sector: "Oil & Gas", percentage: 22 },
            { sector: "Manufacturing", percentage: 18 },
            { sector: "Agriculture", percentage: 15 },
          ],
        },
        templates: [
          {
            id: "1",
            topicId: "t1",
            topicName: "Env",
            assignedTo: "team",
            department: "Risk",
            frequency: "monthly",
            fields: [],
            status: "approved",
          },
        ],
        scenarioResults: [
          {
            id: "1",
            name: "Net Zero 2050",
            description: "Standard NZ",
            totalEmissions: 1000,
            estimatedCost: 50000000,
            profitImpact: -12,
            nplIncrease: 2,
            capitalAdequacyEffect: -1.5,
            runAt: new Date().toISOString(),
          },
        ],
        scope1Assets: DEFAULT_SCOPE1,
        scope2Entries: DEFAULT_SCOPE2,
        scope3Entries: DEFAULT_SCOPE3,
      }));
    }, 0);
  };

  // WIZARD VIEW (If setup not complete)
  if (!isFlowComplete) {
    return (
      <div className="p-4 md:p-8 max-w-300 mx-auto min-h-screen bg-[#f4f4f4] text-[#161616] font-sans">
        <div className="bg-white border border-[#e0e0e0] p-6 md:p-10 relative overflow-hidden mb-8">
          <div className="absolute -top-25 -right-25 w-75 h-75 rounded-full bg-[#86bc25]/10 pointer-events-none opacity-50 blur-3xl"></div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-4 mb-10">
            <div className="w-18 h-18 bg-[#86bc25]/10 border border-[#86bc25]/20 flex items-center justify-center mb-4">
              <Database size={34} className="text-[#86bc25]" />
            </div>
            <h1 className="text-[32px] font-semibold text-[#161616]">
              Command Center Setup
            </h1>
            <p className="text-[16px] text-[#525252] max-w-150 mx-auto">
              Welcome to your dedicated sustainability intelligence platform. To
              unlock your full IFRS S1/S2 aligned operational dashboard, please
              complete the foundational reporting modules.
            </p>

            <div className="w-full max-w-150 mt-8 mb-2">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[14px] font-semibold text-[#161616]">
                  Overall Readiness
                </span>
                <span className="text-[16px] font-semibold text-[#86bc25]">
                  {completionPct}%
                </span>
              </div>
              <div className="w-full bg-[#e0e0e0] h-2">
                <div
                  className="bg-[#86bc25] h-2 transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {STAGES.map((stage) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.id}
                  className={`p-6 border flex flex-col relative transition-all hover:-translate-y-1 ${stage.done ? "bg-[#f4fadc] border-[#86bc25]/30" : "bg-[#f4f4f4] border-[#e0e0e0]"}`}
                >
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div
                      className={`w-11 h-11 flex items-center justify-center border ${stage.done ? "bg-[#86bc25]/20 border-[#86bc25]/30 text-[#86bc25]" : "bg-white border-[#e0e0e0] text-[#525252]"}`}
                    >
                      <Icon size={20} />
                    </div>
                    {stage.done ? (
                      <div className="w-7 h-7 bg-[#86bc25]/20 flex items-center justify-center rounded-full">
                        <CheckCircle2 size={18} className="text-[#86bc25]" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 border-2 border-dashed border-[#8d8d8d] flex items-center justify-center rounded-full">
                        <CircleDashed size={16} className="text-[#8d8d8d]" />
                      </div>
                    )}
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#161616] mb-1 relative z-10">
                    {stage.label}
                  </h3>
                  <p className="text-[12px] text-[#525252] leading-relaxed relative z-10">
                    {stage.desc}
                  </p>

                  {!stage.done && (
                    <div className="mt-auto pt-4 relative z-10">
                      <span className="inline-flex items-center gap-2 px-2 py-1 bg-[#fff1f1] border border-[#ffb3b8] text-[10px] font-semibold text-[#da1e28] uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#da1e28]"></span>
                        Pending
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex justify-center gap-4">
            <button
              onClick={handleReset}
              className="px-5 py-3 text-[14px] font-medium border border-[#da1e28] text-[#da1e28] hover:bg-[#da1e28] hover:text-white transition-colors flex items-center gap-2 bg-transparent"
            >
              <RotateCcw size={16} /> Reset for Demo
            </button>
            <button
              onClick={handlePopulateSampleData}
              className="px-5 py-3 text-[14px] font-medium bg-[#86bc25] text-white hover:bg-[#70a31d] transition-colors"
            >
              Populate Sample Data for Testing
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN DASHBOARD VIEW
  return (
    <div className="p-4 md:p-8 max-w-400 mx-auto min-h-screen bg-[#f4f4f4] font-sans text-[#161616]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-[#86bc25]"></div>
          <span className="text-[#86bc25] font-bold text-[10px] tracking-widest uppercase">
            Sustainability Command Center
          </span>
        </div>
        <h1 className="text-[28px] font-semibold text-[#161616] tracking-tight">
          {entityProfile.name}
        </h1>
        <p className="text-[14px] text-[#525252] mt-1 max-w-175">
          Integrated climate and sustainability intelligence platform — IFRS
          S1/S2 aligned
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] mb-8">
        <StatCard
          icon={AlertTriangle}
          label="Total Risks Identified"
          value={risks.length}
          sub={`${selectedMaterialTopicIds.length} material topics`}
        />
        <StatCard
          icon={Leaf}
          label="Total Emissions"
          value={`${formatNumber(totalEmissions)}`}
          sub="tCO₂e (Scope 1+2+3 combined)"
          color="#10b981"
        />
        <StatCard
          icon={Building2}
          label="Portfolio Exposure"
          value={formatNaira(entityProfile.loanBook)}
          sub={`${entityProfile.branches || 0} branches nationwide`}
          color="#3b82f6"
        />
        <StatCard
          icon={Target}
          label="IFRS Readiness"
          value={`${completionPct}%`}
          sub="Disclosure compliance score"
          highlight={true}
        />
      </div>

      {/* Progress Banner */}
      <div className="bg-white border border-[#e0e0e0] p-6 mb-8 relative overflow-hidden">
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <Target size={160} className="text-[#86bc25]" />
        </div>
        <div className="relative z-10 flex justify-between items-end mb-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#161616]">
              Data Completeness Tracker
            </h3>
            <p className="text-[12px] text-[#525252] mt-1">
              IFRS S1/S2 disclosure readiness across all reporting modules
            </p>
          </div>
          <span className="text-[24px] font-bold text-[#86bc25]">
            {completionPct}%
          </span>
        </div>
        <div className="w-full bg-[#f4f4f4] h-2 mb-4 relative z-10">
          <div
            className="bg-[#86bc25] h-2 transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          ></div>
        </div>
        <div className="flex flex-wrap gap-2 relative z-10">
          {[
            { label: "Entity Profile", done: entityProfile.completed },
            { label: "Risk Register", done: risks.length > 0 },
            {
              label: "Material Topics",
              done: selectedMaterialTopicIds.length > 0,
            },
            { label: "Scope 1", done: scope1Assets.length > 0 },
            { label: "Scope 2", done: scope2Entries.length > 0 },
            { label: "Scope 3", done: scope3Entries.length > 0 },
            { label: "Templates", done: templates.length > 0 },
            { label: "Scenarios", done: scenarioResults.length > 0 },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 px-3 py-1.5 border text-[11px] font-semibold tracking-wide uppercase ${item.done ? "bg-[#f4fadc] border-[#86bc25]/30 text-[#435e12]" : "bg-[#f4f4f4] border-[#e0e0e0] text-[#8d8d8d]"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${item.done ? "bg-[#86bc25]" : "bg-[#8d8d8d]"}`}
              ></div>
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Trend Chart */}
        <div className="col-span-2 bg-white border border-[#e0e0e0] p-6">
          <h3 className="text-[16px] font-semibold text-[#161616] mb-1">
            GHG Emissions Trend
          </h3>
          <p className="text-[12px] text-[#525252] mb-6">
            Scope 1 + 2 + 3 combined (tCO₂e)
          </p>

          <div className="h-70">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={emissionsTrend}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#000000" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorS2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#53565A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#53565A" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorS3" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#86bc25" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#86bc25" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e0e0e0"
                />
                <XAxis
                  dataKey="year"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#525252" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#525252" }}
                  tickFormatter={(v) => formatNumber(v)}
                  dx={-10}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: "1px solid #161616",
                    padding: "12px",
                    background: "#161616",
                    color: "#f4f4f4",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#f4f4f4" }}
                />
                <Area
                  type="step"
                  dataKey="scope1"
                  name="Scope 1"
                  stroke="#000000"
                  fill="url(#colorS1)"
                  strokeWidth={2}
                />
                <Area
                  type="step"
                  dataKey="scope2"
                  name="Scope 2"
                  stroke="#53565A"
                  fill="url(#colorS2)"
                  strokeWidth={2}
                />
                <Area
                  type="step"
                  dataKey="scope3"
                  name="Scope 3"
                  stroke="#86bc25"
                  fill="url(#colorS3)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 mt-6 border-t border-[#e0e0e0] pt-6">
            {[
              { label: "Scope 1 (Direct)", color: "#000000", value: s1 },
              { label: "Scope 2 (Electricity)", color: "#53565A", value: s2 },
              { label: "Scope 3 (Financed)", color: "#86bc25", value: s3 },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 border border-white outline-1 outline-gray-300"
                  style={{ backgroundColor: s.color }}
                ></div>
                <span className="text-[12px] font-semibold text-[#161616]">
                  {s.label}: {formatNumber(s.value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Portfolio Pie Chart */}
        <div className="bg-white border border-[#e0e0e0] p-6">
          <h3 className="text-[16px] font-semibold text-[#161616] mb-1">
            Portfolio Exposure
          </h3>
          <p className="text-[12px] text-[#525252] mb-6">
            By sector (₦ loan book)
          </p>

          <div className="h-55 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={exposureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {exposureData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 0,
                    border: "1px solid #161616",
                    padding: "12px",
                    background: "#161616",
                    color: "#f4f4f4",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#f4f4f4" }}
                  formatter={(v) => formatNaira(Number(v))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-[#e0e0e0] pt-4">
            {exposureData.slice(0, 4).map((s, i) => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2"
                    style={{ backgroundColor: PIE_COLORS[i] }}
                  ></div>
                  <span className="text-[12px] text-[#161616] font-medium truncate max-w-37.5">
                    {s.name}
                  </span>
                </div>
                <span className="text-[12px] font-bold text-[#161616]">
                  {s.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lower Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Risks */}
        <div className="bg-white border border-[#e0e0e0] p-6">
          <h3 className="text-[16px] font-semibold text-[#161616] mb-1">
            Top Material Topics
          </h3>
          <p className="text-[12px] text-[#525252] mb-6">
            Ranked by composite risk score
          </p>

          <div className="space-y-2">
            {topRisks.slice(0, 5).map((r, i) => {
              const score = r.impact * r.likelihood;
              const color = getRiskColor(score);
              return (
                <div
                  key={r.id}
                  className="flex items-center gap-4 p-3 border border-[#e0e0e0] hover:bg-[#f4f4f4] transition-colors"
                >
                  <span className="text-[14px] font-bold text-[#8d8d8d] w-6">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-[#161616] truncate">
                      {r.name}
                    </p>
                    <p className="text-[11px] text-[#525252] mt-0.5">
                      {r.category}
                    </p>
                  </div>
                  <span
                    className="px-3 py-1 text-[11px] font-bold border"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                      borderColor: `${color}40`,
                    }}
                  >
                    {score} - {getRiskLevel(score)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category & Status */}
        <div className="flex flex-col gap-6">
          {/* Category Bar Char */}
          <div className="bg-white border border-[#e0e0e0] p-6 flex-1">
            <h3 className="text-[16px] font-semibold text-[#161616] mb-1">
              Risk Category Map
            </h3>
            <p className="text-[12px] text-[#525252] mb-6">
              Heatmap count by category
            </p>
            <div className="h-45">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryDistribution}
                  layout="vertical"
                  margin={{ left: 100, top: 0, right: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e0e0e0"
                  />
                  <XAxis
                    type="number"
                    fontSize={11}
                    tick={{ fill: "#161616" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={100}
                    fontSize={11}
                    tick={{ fill: "#525252" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 0,
                      border: "1px solid #161616",
                      padding: "12px",
                      background: "#161616",
                      color: "#f4f4f4",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "#f4f4f4" }}
                    cursor={{ fill: "#f4f4f4" }}
                  />
                  <Bar dataKey="value" fill="#86bc25" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Region Completeness */}
          <div className="bg-white border border-[#e0e0e0] p-6 flex-1">
            <h3 className="text-[16px] font-semibold text-[#161616] mb-1">
              Branch Reporting Status
            </h3>
            <p className="text-[12px] text-[#525252] mb-6">
              Data submission progress by region
            </p>
            <div className="space-y-3">
              {branchCompletion.map((b) => (
                <div key={b.region}>
                  <div className="flex justify-between items-end mb-1">
                    <span className="text-[12px] font-medium text-[#161616]">
                      {b.region}
                    </span>
                    <span
                      className={`text-[12px] font-bold ${b.pct === 100 ? "text-[#86bc25]" : "text-[#8d8d8d]"}`}
                    >
                      {b.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#f4f4f4] overflow-hidden">
                    <div
                      className={`h-full ${b.pct === 100 ? "bg-[#86bc25]" : b.pct >= 80 ? "bg-[#53565A]" : "bg-[#000000]"}`}
                      style={{ width: `${b.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights specific banner */}
      <div className="bg-white border border-[#e0e0e0] p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 flex items-center justify-center bg-[#86bc25]/10 border border-[#86bc25]/30 text-[#435e12]">
            <Zap size={18} />
          </div>
          <h3 className="text-[16px] font-bold text-[#161616]">
            AI-Generated Insights
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Climate Exposure Alert",
              text: `Oil & Gas portfolio exposure at ${(entityProfile.sectorExposures || []).find((s) => s.sector === "Oil & Gas")?.percentage || 22}% exceeds CBN recommended threshold. Consider transition risk mitigation strategies.`,
            },
            {
              title: "Scope 3 Dominance",
              text: `Financed emissions represent ${totalEmissions > 0 ? Math.round((s3 / totalEmissions) * 100) : 0}% of total GHG footprint. Portfolio decarbonization should be prioritized in sustainability strategy.`,
            },
            {
              title: "IFRS S2 Readiness",
              text: `${8 - Math.round(completionPct / 12.5)} disclosure modules are pending completion. Full IFRS S2 compliance requires entity profile, materiality assessment, emissions data, and scenario analysis.`,
            },
          ].map((insight) => (
            <div
              key={insight.title}
              className="p-5 border border-[#e0e0e0] bg-[#f4f4f4] hover:border-[#86bc25]/50 transition-colors"
            >
              <h4 className="text-[14px] font-bold text-[#435e12] mb-2 uppercase tracking-wide">
                {insight.title}
              </h4>
              <p className="text-[12px] text-[#525252] leading-relaxed">
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
