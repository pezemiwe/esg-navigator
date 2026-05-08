import { useMemo, useState } from "react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Target,
  Globe,
  Leaf,
  Award,
  Zap,
  TreePine,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Sparkles,
  Activity,
} from "lucide-react";

const BRAND_GREEN = "#86bc25";
const DEEP_GREEN = "#00533f";

const KPI_DATA = [
  {
    label: "SDG Alignment Score",
    value: "78.4",
    suffix: "%",
    delta: "+5.2",
    trend: "up" as const,
    icon: Target,
    sub: "Weighted across 17 SDGs",
  },
  {
    label: "NDC Progress",
    value: "62.8",
    suffix: "%",
    delta: "+8.1",
    trend: "up" as const,
    icon: Globe,
    sub: "Nigeria's 2030 commitments",
  },
  {
    label: "Green Finance Volume",
    value: "₦2.4",
    suffix: "B",
    delta: "+18.3",
    trend: "up" as const,
    icon: Leaf,
    sub: "Climate-aligned portfolio",
  },
  {
    label: "Composite ESG Rating",
    value: "B+",
    suffix: "",
    delta: "Upgraded",
    trend: "up" as const,
    icon: Award,
    sub: "From B (Q3 2025)",
  },
  {
    label: "Carbon Offset",
    value: "12,450",
    suffix: " tCO₂e",
    delta: "+34",
    trend: "up" as const,
    icon: TreePine,
    sub: "Portfolio offset",
  },
  {
    label: "Clean Energy Loans",
    value: "₦892",
    suffix: "M",
    delta: "+22.6",
    trend: "up" as const,
    icon: Zap,
    sub: "Renewable project financing",
  },
];

const SDG_GOALS = [
  { id: 1, name: "No Poverty", score: 82, color: "#E5243B", aligned: true },
  { id: 2, name: "Zero Hunger", score: 71, color: "#DDA63A", aligned: true },
  {
    id: 3,
    name: "Good Health & Well-being",
    score: 65,
    color: "#4C9F38",
    aligned: false,
  },
  {
    id: 4,
    name: "Quality Education",
    score: 88,
    color: "#C5192D",
    aligned: true,
  },
  {
    id: 5,
    name: "Gender Equality",
    score: 76,
    color: "#FF3A21",
    aligned: true,
  },
  {
    id: 6,
    name: "Clean Water & Sanitation",
    score: 58,
    color: "#26BDE2",
    aligned: false,
  },
  {
    id: 7,
    name: "Affordable & Clean Energy",
    score: 91,
    color: "#FCC30B",
    aligned: true,
  },
  {
    id: 8,
    name: "Decent Work & Growth",
    score: 85,
    color: "#A21942",
    aligned: true,
  },
  {
    id: 9,
    name: "Industry & Innovation",
    score: 79,
    color: "#FD6925",
    aligned: true,
  },
  {
    id: 10,
    name: "Reduced Inequalities",
    score: 68,
    color: "#DD1367",
    aligned: false,
  },
  {
    id: 11,
    name: "Sustainable Cities",
    score: 74,
    color: "#FD9D24",
    aligned: true,
  },
  {
    id: 12,
    name: "Responsible Consumption",
    score: 62,
    color: "#BF8B2E",
    aligned: false,
  },
  {
    id: 13,
    name: "Climate Action",
    score: 93,
    color: "#3F7E44",
    aligned: true,
  },
  {
    id: 14,
    name: "Life Below Water",
    score: 45,
    color: "#0A97D9",
    aligned: false,
  },
  { id: 15, name: "Life on Land", score: 67, color: "#56C02B", aligned: false },
  {
    id: 16,
    name: "Peace & Justice",
    score: 81,
    color: "#00689D",
    aligned: true,
  },
  { id: 17, name: "Partnerships", score: 77, color: "#19486A", aligned: true },
];

const NDC_COMMITMENTS = [
  {
    sector: "Energy",
    target: "Reduce emissions 15% by 2030",
    progress: 72,
    status: "On Track",
    financing: 1200,
  },
  {
    sector: "Agriculture (REDD+)",
    target: "Restore 10,000 ha forest",
    progress: 58,
    status: "Moderate",
    financing: 450,
  },
  {
    sector: "Transport",
    target: "Expand mass transit",
    progress: 41,
    status: "Behind",
    financing: 680,
  },
  {
    sector: "Waste Management",
    target: "Reduce methane 20%",
    progress: 65,
    status: "On Track",
    financing: 190,
  },
  {
    sector: "Industry",
    target: "Clean production standards",
    progress: 53,
    status: "Moderate",
    financing: 320,
  },
];

const FINANCING_DATA = [
  { quarter: "Q1 '25", green: 580, social: 320, governance: 210 },
  { quarter: "Q2 '25", green: 720, social: 380, governance: 250 },
  { quarter: "Q3 '25", green: 890, social: 410, governance: 280 },
  { quarter: "Q4 '25", green: 1050, social: 460, governance: 310 },
  { quarter: "Q1 '26", green: 1180, social: 520, governance: 340 },
];

const ESG_PILLAR_DATA = [
  { name: "Environmental", value: 82, fill: BRAND_GREEN },
  { name: "Social", value: 75, fill: "#3B82F6" },
  { name: "Governance", value: 88, fill: "#8B5CF6" },
];

const PIE_COLORS = [BRAND_GREEN, "#22C55E", "#3B82F6", "#8B5CF6", "#EF4444"];

const statusBadge = (status: string) => {
  switch (status) {
    case "On Track":
      return {
        bg: "bg-emerald-50 dark:bg-emerald-900/20",
        text: "text-emerald-700 dark:text-emerald-300",
        icon: CheckCircle2,
      };
    case "Moderate":
      return {
        bg: "bg-amber-50 dark:bg-amber-900/20",
        text: "text-amber-700 dark:text-amber-300",
        icon: AlertTriangle,
      };
    default:
      return {
        bg: "bg-rose-50 dark:bg-rose-900/20",
        text: "text-rose-700 dark:text-rose-300",
        icon: XCircle,
      };
  }
};

export default function SDGDashboard() {
  const [hoveredSDG, setHoveredSDG] = useState<number | null>(null);

  const stats = useMemo(() => {
    const aligned = SDG_GOALS.filter((g) => g.aligned).length;
    const avg = Math.round(
      SDG_GOALS.reduce((s, g) => s + g.score, 0) / SDG_GOALS.length,
    );
    const high = SDG_GOALS.filter((g) => g.score >= 80).length;
    const low = SDG_GOALS.filter((g) => g.score < 60).length;
    return { aligned, avg, high, low };
  }, []);

  const sortedSDG = useMemo(
    () => [...SDG_GOALS].sort((a, b) => b.score - a.score),
    [],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120]">
      {/* ── Header ─────────────────────────────────── */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#86bc25] uppercase mb-3">
                <Sparkles size={14} /> Sustainability Compliance · FY 2026
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                SDG &amp; NDC{" "}
                <span className="text-[#86bc25]">Alignment Dashboard</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl text-sm leading-relaxed">
                Executive view of Deloitte&apos;s alignment with the UN
                Sustainable Development Goals and Nigeria&apos;s Nationally
                Determined Contributions under the Paris Agreement.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex flex-col items-end pr-4 border-r border-gray-200 dark:border-gray-700">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                  Reporting Period
                </span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  Q1 2026 · Apr 30
                </span>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-[#86bc25] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#75a620] transition-colors">
                <Download size={14} /> Export Report
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 mt-8 border border-gray-200 dark:border-gray-800">
            {[
              {
                label: "Goals Aligned",
                value: `${stats.aligned}/17`,
                accent: BRAND_GREEN,
              },
              {
                label: "Avg Score",
                value: `${stats.avg}%`,
                accent: DEEP_GREEN,
              },
              {
                label: "High Performers (≥80)",
                value: stats.high,
                accent: "#10B981",
              },
              {
                label: "Needs Attention (<60)",
                value: stats.low,
                accent: "#EF4444",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-gray-900 px-5 py-4"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1 h-8" style={{ background: s.accent }} />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      {s.label}
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                      {s.value}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
        {/* ── KPI Cards ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
          {KPI_DATA.map((kpi) => {
            const Icon = kpi.icon;
            const TrendIcon =
              kpi.trend === "up" ? ArrowUpRight : ArrowDownRight;
            return (
              <div
                key={kpi.label}
                className="bg-white dark:bg-gray-900 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 -mr-8 -mt-8 rounded-full bg-[#86bc25]/5 group-hover:bg-[#86bc25]/10 transition-colors" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-[#86bc25]/10 flex items-center justify-center">
                      <Icon size={18} className="text-[#86bc25]" />
                    </div>
                    <div className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <TrendIcon size={12} /> {kpi.delta}
                      {kpi.delta !== "Upgraded" && "%"}
                    </div>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1">
                    {kpi.label}
                  </div>
                  <div className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                    {kpi.value}
                    <span className="text-base font-bold text-gray-500">
                      {kpi.suffix}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                    {kpi.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 17 SDG Tiles ──────────────────────────── */}
        <section className="mt-10">
          <SectionHeader
            kicker="UN Sustainable Development Goals"
            title="17-Goal Alignment Matrix"
            description="Composite alignment score per goal based on portfolio exposure, financing flows and operational impact."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
            {SDG_GOALS.map((g) => (
              <div
                key={g.id}
                onMouseEnter={() => setHoveredSDG(g.id)}
                onMouseLeave={() => setHoveredSDG(null)}
                className="bg-white dark:bg-gray-900 aspect-square p-3 flex flex-col justify-between cursor-pointer relative overflow-hidden group"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ background: g.color }}
                />
                <div className="relative">
                  <div
                    className="w-9 h-9 flex items-center justify-center text-white text-base font-black"
                    style={{ background: g.color }}
                  >
                    {g.id.toString().padStart(2, "0")}
                  </div>
                </div>
                <div className="relative">
                  <div className="text-[10px] font-bold text-gray-700 dark:text-gray-300 leading-tight line-clamp-2 mb-1">
                    {g.name}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-sm font-black tabular-nums"
                      style={{ color: g.color }}
                    >
                      {g.score}%
                    </span>
                    {g.aligned ? (
                      <CheckCircle2 size={12} className="text-emerald-500" />
                    ) : (
                      <AlertTriangle size={12} className="text-amber-500" />
                    )}
                  </div>
                  <div className="h-1 bg-gray-100 dark:bg-gray-800 mt-1.5 overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{
                        width: `${g.score}%`,
                        background: g.color,
                        opacity:
                          hoveredSDG === null || hoveredSDG === g.id ? 1 : 0.5,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ESG + Financing ──────────────────────── */}
        <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] uppercase tracking-wider text-[#86bc25] font-bold">
                Composite Score
              </div>
              <Activity size={14} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-5">
              ESG Pillar Performance
            </h3>

            {/* Composite ring */}
            <div
              className="relative mx-auto"
              style={{ width: 200, height: 200 }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="62%"
                  outerRadius="100%"
                  data={ESG_PILLAR_DATA}
                  startAngle={90}
                  endAngle={-270}
                  barSize={14}
                >
                  <RadialBar
                    background={{ fill: "#F1F5F9" }}
                    dataKey="value"
                    cornerRadius={0}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[9px] uppercase tracking-[0.2em] text-gray-500 font-bold">
                  Composite
                </div>
                <div className="text-3xl font-black text-gray-900 dark:text-white tabular-nums leading-none">
                  {Math.round(
                    ESG_PILLAR_DATA.reduce((s, p) => s + p.value, 0) /
                      ESG_PILLAR_DATA.length,
                  )}
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">/ 100</div>
              </div>
            </div>

            {/* Pillar bars */}
            <div className="mt-5 space-y-3 flex-1">
              {ESG_PILLAR_DATA.map((p) => (
                <div key={p.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5"
                        style={{ background: p.fill }}
                      />
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {p.name}
                      </span>
                    </div>
                    <span
                      className="text-sm font-black tabular-nums"
                      style={{ color: p.fill }}
                    >
                      {p.value}
                      <span className="text-[10px] text-gray-500 font-bold">
                        /100
                      </span>
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${p.value}%`, background: p.fill }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-[#86bc25] font-bold">
                  Financing Flow · ₦ Millions
                </div>
                <h3 className="text-lg font-black text-gray-900 dark:text-white">
                  Sustainable Finance Trajectory
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <TrendingUp size={14} className="text-emerald-500" />
                <span className="font-bold text-emerald-600">+103% YoY</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={FINANCING_DATA}>
                <defs>
                  <linearGradient id="grnG" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={BRAND_GREEN}
                      stopOpacity={0.6}
                    />
                    <stop
                      offset="100%"
                      stopColor={BRAND_GREEN}
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="socG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="govG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="#E5E7EB"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="quarter"
                  stroke="#9CA3AF"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: 0,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 600 }} />
                <Area
                  type="monotone"
                  dataKey="green"
                  name="Green Finance"
                  stroke={BRAND_GREEN}
                  strokeWidth={2.5}
                  fill="url(#grnG)"
                />
                <Area
                  type="monotone"
                  dataKey="social"
                  name="Social Finance"
                  stroke="#3B82F6"
                  strokeWidth={2.5}
                  fill="url(#socG)"
                />
                <Area
                  type="monotone"
                  dataKey="governance"
                  name="Governance Investments"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fill="url(#govG)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* ── NDC Commitments ─────────────────────── */}
        <section className="mt-10">
          <SectionHeader
            kicker="Nigeria · Paris Agreement"
            title="NDC Sectoral Progress"
            description="Tracking against Nigeria's 2030 Nationally Determined Contributions across the five priority sectors."
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
              {NDC_COMMITMENTS.map((c) => {
                const sb = statusBadge(c.status);
                const SIcon = sb.icon;
                return (
                  <div
                    key={c.sector}
                    className="bg-white dark:bg-gray-900 p-5 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {c.sector}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${sb.bg} ${sb.text}`}
                          >
                            <SIcon size={10} /> {c.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                          {c.target}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                            <div
                              className="h-full transition-all duration-700"
                              style={{
                                width: `${c.progress}%`,
                                background:
                                  c.progress >= 70
                                    ? BRAND_GREEN
                                    : c.progress >= 50
                                      ? "#F59E0B"
                                      : "#EF4444",
                              }}
                            />
                          </div>
                          <span className="text-sm font-black tabular-nums text-gray-900 dark:text-white w-12 text-right">
                            {c.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="text-right pl-4 border-l border-gray-200 dark:border-gray-800">
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                          Financing
                        </div>
                        <div className="text-base font-black text-[#86bc25] tabular-nums">
                          ₦{c.financing}M
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-gray-300 group-hover:text-[#86bc25] group-hover:translate-x-0.5 transition-all ml-auto mt-1"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
              <div className="text-[10px] uppercase tracking-wider text-[#86bc25] font-bold">
                Capital Allocation
              </div>
              <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">
                NDC Financing Mix
              </h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={NDC_COMMITMENTS}
                    dataKey="financing"
                    nameKey="sector"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {NDC_COMMITMENTS.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #E5E7EB",
                      borderRadius: 0,
                      fontSize: 12,
                    }}
                    formatter={(v) => [`₦${v}M`, "Financing"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {NDC_COMMITMENTS.map((c, i) => (
                  <div
                    key={c.sector}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5"
                        style={{
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {c.sector}
                      </span>
                    </div>
                    <span className="font-black tabular-nums text-gray-900 dark:text-white">
                      ₦{c.financing}M
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Top SDG performance ranking ─────────── */}
        <section className="mt-10 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
          <SectionHeader
            kicker="Performance Ranking"
            title="SDG Score Distribution"
            description="Sorted by composite alignment score, identifying strategic strengths and improvement areas."
            inline
          />
          <ResponsiveContainer width="100%" height={420}>
            <BarChart
              data={sortedSDG}
              layout="vertical"
              margin={{ left: 20, right: 30 }}
            >
              <CartesianGrid
                stroke="#E5E7EB"
                strokeDasharray="3 3"
                horizontal={false}
              />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#9CA3AF"
                tick={{ fontSize: 10 }}
                width={170}
              />
              <RechartsTooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 0,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="score" radius={0}>
                {sortedSDG.map((g) => (
                  <Cell key={g.id} fill={g.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </section>
      </div>
    </div>
  );
}

function SectionHeader({
  kicker,
  title,
  description,
  inline = false,
}: {
  kicker: string;
  title: string;
  description?: string;
  inline?: boolean;
}) {
  return (
    <div className={inline ? "mb-5" : "mb-5"}>
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#86bc25] font-bold mb-1">
        {kicker}
      </div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="h-px bg-gradient-to-r from-[#86bc25] via-gray-200 dark:via-gray-700 to-transparent mt-3" />
    </div>
  );
}
