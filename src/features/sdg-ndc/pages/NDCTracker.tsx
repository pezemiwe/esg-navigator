import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
} from "recharts";
import {
  Factory,
  Truck,
  Zap,
  TreePine,
  Building2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Download,
  Flag,
  Target as TargetIcon,
  Calendar,
} from "lucide-react";

const BRAND_GREEN = "#86bc25";

interface Sector {
  id: string;
  name: string;
  icon: typeof Zap;
  color: string;
  baseline: number; // MtCO2e
  targetReduction: number; // %
  currentReduction: number; // %
  financing: number; // ₦M
  projects: number;
  actions: string[];
}

const NDC_SECTORS: Sector[] = [
  {
    id: "energy",
    name: "Energy",
    icon: Zap,
    color: "#F59E0B",
    baseline: 21.4,
    targetReduction: 15,
    currentReduction: 10.8,
    financing: 1200,
    projects: 24,
    actions: [
      "Solar PV project financing — 45 MW installed",
      "Energy-efficiency loans for commercial buildings",
      "LPG adoption financing for 8,000 households",
    ],
  },
  {
    id: "afolu",
    name: "AFOLU (Agriculture, Forestry & Land Use)",
    icon: TreePine,
    color: "#22C55E",
    baseline: 18.7,
    targetReduction: 12,
    currentReduction: 6.9,
    financing: 450,
    projects: 18,
    actions: [
      "REDD+ forest restoration — 4,200 ha restored",
      "Climate-smart agriculture loans (savanna regions)",
      "Cocoa agroforestry financing programme",
    ],
  },
  {
    id: "transport",
    name: "Transport",
    icon: Truck,
    color: "#3B82F6",
    baseline: 12.3,
    targetReduction: 10,
    currentReduction: 4.1,
    financing: 680,
    projects: 9,
    actions: [
      "Electric-vehicle fleet financing for commercial operators",
      "Mass-transit infrastructure (Lagos BRT) co-financing",
      "Non-motorised transport corridor development",
    ],
  },
  {
    id: "waste",
    name: "Waste Management",
    icon: Factory,
    color: "#8B5CF6",
    baseline: 5.8,
    targetReduction: 20,
    currentReduction: 13.0,
    financing: 190,
    projects: 7,
    actions: [
      "Landfill-gas capture project finance",
      "Plastic recycling enterprise loans",
      "Biogas digesters for institutions",
    ],
  },
  {
    id: "industry",
    name: "Industry",
    icon: Building2,
    color: "#EF4444",
    baseline: 8.2,
    targetReduction: 8,
    currentReduction: 4.2,
    financing: 320,
    projects: 12,
    actions: [
      "Clean-production technology upgrade financing",
      "Industrial energy-efficiency retrofit loans",
      "Green-manufacturing certification support",
    ],
  },
];

const EMISSION_TREND = [
  { year: "2020", actual: 73.0, target: 73.0, baseline: 73.0 },
  { year: "2021", actual: 71.5, target: 71.0, baseline: 73.0 },
  { year: "2022", actual: 69.8, target: 68.5, baseline: 73.0 },
  { year: "2023", actual: 67.2, target: 66.0, baseline: 73.0 },
  { year: "2024", actual: 64.8, target: 63.5, baseline: 73.0 },
  { year: "2025", actual: 63.0, target: 61.0, baseline: 73.0 },
  { year: "2026", actual: null, target: 58.5, baseline: 73.0 },
  { year: "2027", actual: null, target: 56.0, baseline: 73.0 },
  { year: "2028", actual: null, target: 53.5, baseline: 73.0 },
  { year: "2029", actual: null, target: 51.0, baseline: 73.0 },
  { year: "2030", actual: null, target: 48.5, baseline: 73.0 },
];

const sectorStatus = (s: Sector) => {
  const ratio = s.currentReduction / s.targetReduction;
  if (ratio >= 0.7)
    return {
      label: "On Track",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: CheckCircle2,
    };
  if (ratio >= 0.5)
    return {
      label: "Moderate",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-300",
      icon: AlertTriangle,
    };
  return {
    label: "Behind",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-700 dark:text-rose-300",
    icon: XCircle,
  };
};

export default function NDCTracker() {
  const [activeSector, setActiveSector] = useState<string>(NDC_SECTORS[0].id);

  const totals = useMemo(() => {
    const baseline = NDC_SECTORS.reduce((s, x) => s + x.baseline, 0);
    const financing = NDC_SECTORS.reduce((s, x) => s + x.financing, 0);
    const projects = NDC_SECTORS.reduce((s, x) => s + x.projects, 0);
    const avgProgress =
      NDC_SECTORS.reduce(
        (s, x) => s + (x.currentReduction / x.targetReduction) * 100,
        0,
      ) / NDC_SECTORS.length;
    return { baseline, financing, projects, avgProgress };
  }, []);

  const sectorBars = useMemo(
    () =>
      NDC_SECTORS.map((s) => ({
        sector: s.name.split(" ")[0],
        target: s.targetReduction,
        current: s.currentReduction,
        gap: Math.max(0, s.targetReduction - s.currentReduction),
        color: s.color,
      })),
    [],
  );

  const active = NDC_SECTORS.find((s) => s.id === activeSector)!;
  const ActiveIcon = active.icon;
  const activeStatus = sectorStatus(active);
  const ActiveStatusIcon = activeStatus.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[#86bc25] uppercase mb-3">
                <Flag size={14} /> Nigeria · Updated NDC (2021)
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                NDC <span className="text-[#86bc25]">Implementation</span>{" "}
                Tracker
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl text-sm leading-relaxed">
                Sector-by-sector tracking of Nigeria&apos;s 20% unconditional /
                47% conditional emissions-reduction commitments under the Paris
                Agreement, financed through Deloitte&apos;s green portfolio.
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#86bc25] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#75a620] transition-colors">
              <Download size={14} /> Download NDC Brief
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 mt-8 border border-gray-200 dark:border-gray-800">
            {[
              {
                label: "Total Baseline",
                value: `${totals.baseline.toFixed(1)} Mt`,
                sub: "CO₂e per year",
                accent: BRAND_GREEN,
              },
              {
                label: "Bank Financing",
                value: `₦${(totals.financing / 1000).toFixed(2)}B`,
                sub: "Mobilised to date",
                accent: "#3F7E44",
              },
              {
                label: "Active Projects",
                value: totals.projects,
                sub: "Across 5 sectors",
                accent: "#10B981",
              },
              {
                label: "Implementation",
                value: `${totals.avgProgress.toFixed(0)}%`,
                sub: "Avg vs 2030 targets",
                accent: "#8B5CF6",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white dark:bg-gray-900 px-5 py-4"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1 h-10" style={{ background: s.accent }} />
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      {s.label}
                    </div>
                    <div className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                      {s.value}
                    </div>
                    <div className="text-[10px] text-gray-500">{s.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 space-y-8">
        {/* Trajectory chart */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-end justify-between mb-5 flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#86bc25] font-bold mb-1">
                National Emissions Trajectory
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Path to 2030 (MtCO₂e)
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#86bc25]" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  Actual
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3" style={{ background: "#8B5CF6" }} />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  NDC Target
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-400" />
                <span className="text-gray-700 dark:text-gray-300 font-medium">
                  2020 Baseline
                </span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <AreaChart data={EMISSION_TREND}>
              <defs>
                <linearGradient id="actG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND_GREEN} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={BRAND_GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#E5E7EB"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis dataKey="year" stroke="#9CA3AF" tick={{ fontSize: 11 }} />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fontSize: 11 }}
                domain={[40, 80]}
              />
              <RechartsTooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 0,
                  fontSize: 12,
                }}
              />
              <ReferenceLine
                y={48.5}
                stroke="#EF4444"
                strokeDasharray="4 4"
                label={{
                  value: "2030 Target",
                  position: "right",
                  fontSize: 10,
                  fill: "#EF4444",
                  fontWeight: 700,
                }}
              />
              <Area
                type="monotone"
                dataKey="actual"
                stroke={BRAND_GREEN}
                strokeWidth={3}
                fill="url(#actG)"
                name="Actual Emissions"
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="#8B5CF6"
                strokeWidth={2}
                strokeDasharray="6 4"
                fill="transparent"
                name="NDC Target Path"
              />
              <Area
                type="monotone"
                dataKey="baseline"
                stroke="#9CA3AF"
                strokeWidth={1.5}
                strokeDasharray="2 4"
                fill="transparent"
                name="Baseline"
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>

        {/* Sector bars overview */}
        <section className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-end justify-between mb-5 flex-wrap gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#86bc25] font-bold mb-1">
                Sectoral Reduction Targets
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Target vs Achieved (% reduction)
              </h2>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sectorBars} barCategoryGap={24}>
              <CartesianGrid
                stroke="#E5E7EB"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="sector"
                stroke="#9CA3AF"
                tick={{ fontSize: 11, fontWeight: 600 }}
              />
              <YAxis stroke="#9CA3AF" tick={{ fontSize: 11 }} unit="%" />
              <RechartsTooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 0,
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="square"
                wrapperStyle={{ fontSize: 11, fontWeight: 600 }}
              />
              <Bar dataKey="current" stackId="a" name="Achieved">
                {sectorBars.map((b, i) => (
                  <Cell key={i} fill={b.color} />
                ))}
              </Bar>
              <Bar
                dataKey="gap"
                stackId="a"
                name="Remaining Gap"
                fill="#E5E7EB"
              />
            </BarChart>
          </ResponsiveContainer>
        </section>

        {/* Sector deep-dive */}
        <section>
          <div className="mb-5">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[#86bc25] font-bold mb-1">
              Sectoral Deep-Dive
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Bank Financing by NDC Sector
            </h2>
            <div className="h-px bg-gradient-to-r from-[#86bc25] via-gray-200 dark:via-gray-700 to-transparent mt-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sector rail */}
            <div className="lg:col-span-4 space-y-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800 h-fit">
              {NDC_SECTORS.map((s) => {
                const isActive = s.id === activeSector;
                const Icon = s.icon;
                const st = sectorStatus(s);
                const StIcon = st.icon;
                const ratio = (s.currentReduction / s.targetReduction) * 100;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveSector(s.id)}
                    className={`w-full p-4 text-left transition-colors ${
                      isActive
                        ? "bg-gray-50 dark:bg-gray-800/60"
                        : "bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/40"
                    }`}
                    style={
                      isActive
                        ? { borderLeft: `3px solid ${s.color}` }
                        : { borderLeft: "3px solid transparent" }
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 flex items-center justify-center shrink-0"
                        style={{ background: `${s.color}20` }}
                      >
                        <Icon size={18} style={{ color: s.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs font-black text-gray-900 dark:text-white truncate">
                            {s.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${st.bg} ${st.text}`}
                          >
                            <StIcon size={9} /> {st.label}
                          </span>
                          <span className="text-[10px] font-bold text-gray-500 tabular-nums">
                            {ratio.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active sector detail */}
            <div className="lg:col-span-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
              {/* Banner */}
              <div
                className="p-6 border-b border-gray-200 dark:border-gray-800"
                style={{
                  background: `linear-gradient(90deg, ${active.color}10, transparent)`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 flex items-center justify-center shrink-0"
                    style={{ background: active.color }}
                  >
                    <ActiveIcon size={26} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-black text-gray-900 dark:text-white">
                        {active.name}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${activeStatus.bg} ${activeStatus.text}`}
                      >
                        <ActiveStatusIcon size={10} /> {activeStatus.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Baseline emissions of {active.baseline} MtCO₂e/yr · Target{" "}
                      {active.targetReduction}% reduction by 2030
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800">
                {[
                  {
                    label: "Baseline",
                    value: `${active.baseline}`,
                    suffix: " Mt",
                  },
                  {
                    label: "Target",
                    value: `${active.targetReduction}`,
                    suffix: "%",
                  },
                  {
                    label: "Achieved",
                    value: `${active.currentReduction}`,
                    suffix: "%",
                  },
                  {
                    label: "Financing",
                    value: `₦${active.financing}`,
                    suffix: "M",
                  },
                ].map((m) => (
                  <div key={m.label} className="bg-white dark:bg-gray-900 p-4">
                    <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">
                      {m.label}
                    </div>
                    <div className="text-xl font-black text-gray-900 dark:text-white tabular-nums">
                      {m.value}
                      <span className="text-sm font-bold text-gray-500">
                        {m.suffix}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress vs Target visualization */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-2">
                  Progress against 2030 target
                </div>
                <div className="relative h-3 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${(active.currentReduction / active.targetReduction) * 100}%`,
                      background: active.color,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
                  <span>0%</span>
                  <span
                    className="font-bold tabular-nums"
                    style={{ color: active.color }}
                  >
                    {(
                      (active.currentReduction / active.targetReduction) *
                      100
                    ).toFixed(0)}
                    % of target achieved
                  </span>
                  <span>{active.targetReduction}% target</span>
                </div>
              </div>

              {/* Trajectory mini-chart */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">
                  5-year emissions reduction path
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart
                    data={[
                      { year: "2020", value: 0 },
                      { year: "2022", value: active.currentReduction * 0.3 },
                      { year: "2024", value: active.currentReduction * 0.65 },
                      { year: "2025", value: active.currentReduction },
                      { year: "2030", value: active.targetReduction },
                    ]}
                  >
                    <CartesianGrid
                      stroke="#E5E7EB"
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="year"
                      stroke="#9CA3AF"
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis stroke="#9CA3AF" tick={{ fontSize: 10 }} unit="%" />
                    <RechartsTooltip
                      contentStyle={{
                        background: "#fff",
                        border: "1px solid #E5E7EB",
                        borderRadius: 0,
                        fontSize: 11,
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={active.color}
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: active.color }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Key actions */}
              <div className="p-6">
                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-3">
                  Key bank actions in this sector
                </div>
                <ul className="space-y-2">
                  {active.actions.map((a, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800"
                    >
                      <div
                        className="w-6 h-6 flex items-center justify-center shrink-0"
                        style={{ background: `${active.color}20` }}
                      >
                        <TargetIcon size={12} style={{ color: active.color }} />
                      </div>
                      <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                        {a}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-center justify-between text-[10px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> Next review: Q3 2026
                  </span>
                  <span className="font-bold">
                    {active.projects} active projects
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
