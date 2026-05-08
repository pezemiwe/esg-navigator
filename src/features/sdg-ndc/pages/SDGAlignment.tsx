import { useMemo, useState } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Download,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Target as TargetIcon,
  TrendingUp,
  Eye,
} from "lucide-react";

const BRAND_GREEN = "#86bc25";

interface SdgTarget {
  code: string;
  desc: string;
  progress: number;
  bankAction: string;
}

interface SdgGoal {
  id: number;
  name: string;
  color: string;
  score: number;
  exposure: number; // ₦M
  targets: SdgTarget[];
}

const SDG_DETAILS: SdgGoal[] = [
  {
    id: 1,
    name: "No Poverty",
    color: "#E5243B",
    score: 82,
    exposure: 420,
    targets: [
      {
        code: "1.4",
        desc: "Equal rights to economic resources & financial services",
        progress: 85,
        bankAction:
          "Microfinance & SME lending — ₦420M to underserved communities",
      },
      {
        code: "1.5",
        desc: "Build resilience of poor to climate shocks",
        progress: 78,
        bankAction: "Climate-resilient agriculture loans in Northern Nigeria",
      },
    ],
  },
  {
    id: 2,
    name: "Zero Hunger",
    color: "#DDA63A",
    score: 71,
    exposure: 310,
    targets: [
      {
        code: "2.3",
        desc: "Double agricultural productivity of small-scale producers",
        progress: 70,
        bankAction: "Smallholder credit guarantee programme — 2,400 farms",
      },
      {
        code: "2.4",
        desc: "Sustainable food production systems",
        progress: 72,
        bankAction: "Cocoa & cassava value-chain financing",
      },
    ],
  },
  {
    id: 3,
    name: "Good Health & Well-being",
    color: "#4C9F38",
    score: 65,
    exposure: 180,
    targets: [
      {
        code: "3.8",
        desc: "Universal health coverage",
        progress: 65,
        bankAction:
          "Health-sector working-capital facilities (HMOs, hospitals)",
      },
    ],
  },
  {
    id: 4,
    name: "Quality Education",
    color: "#C5192D",
    score: 88,
    exposure: 95,
    targets: [
      {
        code: "4.4",
        desc: "Increase youth & adult skills for employment",
        progress: 90,
        bankAction: "Tertiary fees & skills financing — 18,000 students",
      },
      {
        code: "4.b",
        desc: "Expand higher education scholarships",
        progress: 86,
        bankAction: "Deloitte Scholarship Fund partnership",
      },
    ],
  },
  {
    id: 5,
    name: "Gender Equality",
    color: "#FF3A21",
    score: 76,
    exposure: 540,
    targets: [
      {
        code: "5.5",
        desc: "Women's leadership & decision-making",
        progress: 78,
        bankAction: "Board diversity (44% female) & Women in Banking programme",
      },
      {
        code: "5.a",
        desc: "Equal rights to economic resources for women",
        progress: 74,
        bankAction: "Women-owned business credit line — ₦540M",
      },
    ],
  },
  {
    id: 6,
    name: "Clean Water & Sanitation",
    color: "#26BDE2",
    score: 58,
    exposure: 70,
    targets: [
      {
        code: "6.1",
        desc: "Safe & affordable drinking water",
        progress: 58,
        bankAction: "WASH project finance to state utilities",
      },
    ],
  },
  {
    id: 7,
    name: "Affordable & Clean Energy",
    color: "#FCC30B",
    score: 91,
    exposure: 890,
    targets: [
      {
        code: "7.1",
        desc: "Universal access to affordable energy",
        progress: 88,
        bankAction: "Solar home system financing — 12,000 households",
      },
      {
        code: "7.2",
        desc: "Increase share of renewable energy",
        progress: 92,
        bankAction: "₦890M renewable project finance (solar, mini-hydro)",
      },
      {
        code: "7.a",
        desc: "International cooperation for clean energy",
        progress: 85,
        bankAction: "IFC Green Bond co-financing partnership",
      },
    ],
  },
  {
    id: 8,
    name: "Decent Work & Economic Growth",
    color: "#A21942",
    score: 85,
    exposure: 1100,
    targets: [
      {
        code: "8.3",
        desc: "Development-oriented policies for job creation",
        progress: 82,
        bankAction: "Youth Enterprise Fund — 5,200 businesses",
      },
      {
        code: "8.10",
        desc: "Strengthen domestic financial institutions",
        progress: 90,
        bankAction: "Financial inclusion drive — 340,000 accounts",
      },
    ],
  },
  {
    id: 9,
    name: "Industry, Innovation & Infrastructure",
    color: "#FD6925",
    score: 79,
    exposure: 760,
    targets: [
      {
        code: "9.2",
        desc: "Inclusive & sustainable industrialisation",
        progress: 78,
        bankAction: "Manufacturing CapEx loans — ₦760M deployed",
      },
      {
        code: "9.4",
        desc: "Upgrade industries for sustainability",
        progress: 80,
        bankAction: "Energy-efficiency retrofit financing",
      },
    ],
  },
  {
    id: 10,
    name: "Reduced Inequalities",
    color: "#DD1367",
    score: 68,
    exposure: 220,
    targets: [
      {
        code: "10.2",
        desc: "Empower & promote inclusion of all",
        progress: 68,
        bankAction: "Diaspora remittance products & rural agency banking",
      },
    ],
  },
  {
    id: 11,
    name: "Sustainable Cities & Communities",
    color: "#FD9D24",
    score: 74,
    exposure: 480,
    targets: [
      {
        code: "11.2",
        desc: "Safe, affordable, sustainable transport",
        progress: 72,
        bankAction: "Lagos BRT corridor co-financing",
      },
      {
        code: "11.6",
        desc: "Reduce environmental impact of cities",
        progress: 76,
        bankAction: "Green building mortgage scheme",
      },
    ],
  },
  {
    id: 12,
    name: "Responsible Consumption & Production",
    color: "#BF8B2E",
    score: 62,
    exposure: 130,
    targets: [
      {
        code: "12.5",
        desc: "Reduce waste through prevention & recycling",
        progress: 62,
        bankAction: "Circular-economy SME financing pilot",
      },
    ],
  },
  {
    id: 13,
    name: "Climate Action",
    color: "#3F7E44",
    score: 93,
    exposure: 2400,
    targets: [
      {
        code: "13.1",
        desc: "Strengthen resilience to climate hazards",
        progress: 92,
        bankAction: "Climate stress-testing of full ₦2.4B portfolio",
      },
      {
        code: "13.2",
        desc: "Integrate climate measures into policies",
        progress: 94,
        bankAction: "TCFD-aligned disclosures since 2023",
      },
    ],
  },
  {
    id: 14,
    name: "Life Below Water",
    color: "#0A97D9",
    score: 45,
    exposure: 25,
    targets: [
      {
        code: "14.7",
        desc: "Sustainable use of marine resources",
        progress: 45,
        bankAction: "Coastal aquaculture financing pilot",
      },
    ],
  },
  {
    id: 15,
    name: "Life on Land",
    color: "#56C02B",
    score: 67,
    exposure: 150,
    targets: [
      {
        code: "15.2",
        desc: "Sustainable forest management",
        progress: 67,
        bankAction: "REDD+ forest restoration — 4,200 ha",
      },
    ],
  },
  {
    id: 16,
    name: "Peace, Justice & Strong Institutions",
    color: "#00689D",
    score: 81,
    exposure: 0,
    targets: [
      {
        code: "16.5",
        desc: "Reduce corruption & bribery",
        progress: 88,
        bankAction: "ISO 37001 anti-bribery certification",
      },
      {
        code: "16.6",
        desc: "Effective, accountable institutions",
        progress: 74,
        bankAction: "Whistleblower programme & ethics training",
      },
    ],
  },
  {
    id: 17,
    name: "Partnerships for the Goals",
    color: "#19486A",
    score: 77,
    exposure: 0,
    targets: [
      {
        code: "17.3",
        desc: "Mobilise additional financial resources",
        progress: 78,
        bankAction: "Co-financing with IFC, AfDB, Proparco",
      },
      {
        code: "17.17",
        desc: "Effective public-private partnerships",
        progress: 76,
        bankAction: "Government green-bond underwriting",
      },
    ],
  },
];

type FilterMode = "all" | "high" | "moderate" | "low";

const progressBadge = (p: number) => {
  if (p >= 80)
    return {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      text: "text-emerald-700 dark:text-emerald-300",
      icon: CheckCircle2,
      label: "On Track",
    };
  if (p >= 60)
    return {
      bg: "bg-amber-50 dark:bg-amber-900/20",
      text: "text-amber-700 dark:text-amber-300",
      icon: AlertTriangle,
      label: "Moderate",
    };
  return {
    bg: "bg-rose-50 dark:bg-rose-900/20",
    text: "text-rose-700 dark:text-rose-300",
    icon: XCircle,
    label: "Behind",
  };
};

export default function SDGAlignment() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");
  const [expanded, setExpanded] = useState<number | null>(7);

  const filtered = useMemo(() => {
    return SDG_DETAILS.filter((g) => {
      if (search && !g.name.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (filter === "high" && g.score < 80) return false;
      if (filter === "moderate" && (g.score < 60 || g.score >= 80))
        return false;
      if (filter === "low" && g.score >= 60) return false;
      return true;
    });
  }, [search, filter]);

  const radar = useMemo(
    () =>
      SDG_DETAILS.map((g) => ({
        goal: `SDG ${g.id}`,
        score: g.score,
        fullMark: 100,
      })),
    [],
  );

  const totalExposure = useMemo(
    () => SDG_DETAILS.reduce((s, g) => s + g.exposure, 0),
    [],
  );
  const totalTargets = useMemo(
    () => SDG_DETAILS.reduce((s, g) => s + g.targets.length, 0),
    [],
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120]">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="text-xs font-bold tracking-[0.2em] text-[#86bc25] uppercase mb-3">
                17-Goal Mapping · Target-Level Detail
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                SDG <span className="text-[#86bc25]">Alignment</span> Matrix
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-2xl text-sm leading-relaxed">
                Granular mapping of Deloitte&apos;s portfolio actions against UN
                SDG targets, including financing volumes and progress against
                each target.
              </p>
            </div>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-[#86bc25] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#75a620] transition-colors">
              <Download size={14} /> Export CSV
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200 dark:bg-gray-800 mt-8 border border-gray-200 dark:border-gray-800">
            {[
              {
                label: "Total Goals",
                value: SDG_DETAILS.length,
                accent: BRAND_GREEN,
              },
              {
                label: "Targets Tracked",
                value: totalTargets,
                accent: "#3F7E44",
              },
              {
                label: "Portfolio Exposure",
                value: `₦${(totalExposure / 1000).toFixed(1)}B`,
                accent: "#10B981",
              },
              {
                label: "Avg Score",
                value: `${Math.round(SDG_DETAILS.reduce((s, g) => s + g.score, 0) / SDG_DETAILS.length)}%`,
                accent: "#8B5CF6",
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

      <div className="max-w-[1600px] mx-auto px-6 lg:px-10 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar */}
        <div className="lg:col-span-5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 h-fit">
          <div className="text-[10px] uppercase tracking-wider text-[#86bc25] font-bold">
            17-Axis View
          </div>
          <h3 className="text-lg font-black text-gray-900 dark:text-white mb-4">
            Coverage Radar
          </h3>
          <ResponsiveContainer width="100%" height={420}>
            <RadarChart data={radar}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis
                dataKey="goal"
                tick={{ fontSize: 10, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fontSize: 9 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke={BRAND_GREEN}
                fill={BRAND_GREEN}
                fillOpacity={0.35}
              />
              <RechartsTooltip
                contentStyle={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 0,
                  fontSize: 12,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-px bg-gray-200 dark:bg-gray-800 mt-4 border border-gray-200 dark:border-gray-800">
            <div className="bg-white dark:bg-gray-900 p-3 text-center">
              <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                Best
              </div>
              <div className="text-lg font-black text-emerald-600 tabular-nums">
                SDG 13
              </div>
              <div className="text-[10px] text-gray-500">
                Climate Action · 93%
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 text-center">
              <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                Worst
              </div>
              <div className="text-lg font-black text-rose-600 tabular-nums">
                SDG 14
              </div>
              <div className="text-[10px] text-gray-500">
                Life Below Water · 45%
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-3 text-center">
              <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                Spread
              </div>
              <div className="text-lg font-black text-gray-900 dark:text-white tabular-nums">
                48 pts
              </div>
              <div className="text-[10px] text-gray-500">93 → 45</div>
            </div>
          </div>
        </div>

        {/* List with filters */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 mb-4 flex flex-col md:flex-row gap-3 md:items-center">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search goals..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-[#86bc25]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              {(["all", "high", "moderate", "low"] as FilterMode[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    filter === f
                      ? "bg-[#86bc25] text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-px bg-gray-200 dark:bg-gray-800 border border-gray-200 dark:border-gray-800">
            {filtered.map((g) => {
              const open = expanded === g.id;
              return (
                <div key={g.id} className="bg-white dark:bg-gray-900">
                  <button
                    onClick={() => setExpanded(open ? null : g.id)}
                    className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <div
                      className="w-12 h-12 flex items-center justify-center text-white text-lg font-black shrink-0"
                      style={{ background: g.color }}
                    >
                      {g.id.toString().padStart(2, "0")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-gray-900 dark:text-white">
                          {g.name}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          · {g.targets.length} targets
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 overflow-hidden max-w-xs">
                          <div
                            className="h-full transition-all duration-700"
                            style={{
                              width: `${g.score}%`,
                              background: g.color,
                            }}
                          />
                        </div>
                        <span
                          className="text-xs font-black tabular-nums"
                          style={{ color: g.color }}
                        >
                          {g.score}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">
                        Exposure
                      </div>
                      <div className="text-sm font-black text-gray-900 dark:text-white tabular-nums">
                        {g.exposure > 0 ? `₦${g.exposure}M` : "—"}
                      </div>
                    </div>
                    {open ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </button>

                  {open && (
                    <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/30 px-4 py-4 space-y-2">
                      {g.targets.map((t) => {
                        const pb = progressBadge(t.progress);
                        const PIcon = pb.icon;
                        return (
                          <div
                            key={t.code}
                            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div
                                  className="px-2 py-1 text-[10px] font-black tracking-wider text-white shrink-0"
                                  style={{ background: g.color }}
                                >
                                  {t.code}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-900 dark:text-white leading-snug">
                                    {t.desc}
                                  </p>
                                  <p className="text-[11px] text-gray-600 dark:text-gray-400 mt-1 flex items-start gap-1">
                                    <TargetIcon
                                      size={11}
                                      className="text-[#86bc25] mt-0.5 shrink-0"
                                    />
                                    <span>{t.bankAction}</span>
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${pb.bg} ${pb.text}`}
                              >
                                <PIcon size={10} /> {pb.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                <div
                                  className="h-full transition-all duration-700"
                                  style={{
                                    width: `${t.progress}%`,
                                    background: g.color,
                                  }}
                                />
                              </div>
                              <span
                                className="text-xs font-black tabular-nums w-10 text-right"
                                style={{ color: g.color }}
                              >
                                {t.progress}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      <div className="flex items-center justify-between pt-1 px-1">
                        <div className="text-[10px] text-gray-500 flex items-center gap-1">
                          <TrendingUp size={11} className="text-emerald-500" />{" "}
                          Updated Q1 2026
                        </div>
                        <button className="flex items-center gap-1 text-[10px] font-bold text-[#86bc25] hover:underline uppercase tracking-wider">
                          <Eye size={11} /> View full evidence pack
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="bg-white dark:bg-gray-900 p-10 text-center text-sm text-gray-500">
                No goals match the current filter.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
