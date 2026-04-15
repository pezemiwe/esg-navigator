import { useMemo, useState } from "react";
import {
  BarChart3,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  TrendingDown,
  AlertTriangle,
  Activity,
  Eye,
  Calculator,
  MapPin,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS,
  RATING_ORDER,
  RISK_APPETITE,
  ALL_21_RISKS,
} from "../../domain/physicalRisk/constants";
import type { HazardRating } from "../../domain/physicalRisk/types";
import AssetMapView from "../../components/AssetMapView";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";

const ORDERED_RATINGS: HazardRating[] = [
  "Extreme",
  "Very High",
  "High",
  "Medium",
  "Low",
  "Negligible",
];

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

const CATEGORY_COLORS: Record<string, string> = {
  Meteorological: "#F59E0B",
  Hydrological: "#3B82F6",
  Climatological: "#10B981",
  Geophysical: "#8B5CF6",
};

export default function SingleResults() {
  const { config, mappedAssets, results, resilienceMode, geoConfidence } =
    usePhysicalRiskStore();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showCalc, setShowCalc] = useState(false);

  const asset = mappedAssets[0];
  const sym = config.currency === "USD" ? "$" : "\u20A6";

  const totalEal = useMemo(
    () => results.reduce((s, r) => s + r.totalEalLocal, 0),
    [results],
  );
  const totalSsl = useMemo(
    () => results.reduce((s, r) => s + r.sslLocal, 0),
    [results],
  );
  const maxSsl = useMemo(
    () => Math.max(...results.map((r) => r.sslLocal), 0),
    [results],
  );

  const worstRating = useMemo(() => {
    if (results.length === 0) return "Negligible" as HazardRating;
    return [...results].sort(
      (a, b) => RATING_ORDER[b.hazardRating] - RATING_ORDER[a.hazardRating],
    )[0].hazardRating;
  }, [results]);

  const extremeCount = results.filter(
    (r) => r.hazardRating === "Extreme",
  ).length;
  const vhCount = results.filter((r) => r.hazardRating === "Very High").length;

  const ratingDist = useMemo(() => {
    const d: Record<string, number> = {};
    ORDERED_RATINGS.forEach((r) => (d[r] = 0));
    results.forEach((r) => (d[r.hazardRating] = (d[r.hazardRating] || 0) + 1));
    return d;
  }, [results]);
  const maxBar = Math.max(...Object.values(ratingDist), 1);

  const ealWithoutResilience = useMemo(
    () =>
      results.reduce((s, r) => {
        const rawSsl =
          r.assetValueLocal * r.exposureFactor * r.inherentVulnerability;
        return s + rawSsl * r.annualProbability;
      }, 0),
    [results],
  );
  const ealSavings = ealWithoutResilience - totalEal;

  const sorted = useMemo(
    () =>
      [...results].sort(
        (a, b) => RATING_ORDER[b.hazardRating] - RATING_ORDER[a.hazardRating],
      ),
    [results],
  );

  const riskCategoryMap = useMemo(() => {
    const m: Record<string, string> = {};
    ALL_21_RISKS.forEach((r) => (m[r.risk] = r.category));
    return m;
  }, []);

  const canvasRef = useHeroCanvas();

  if (results.length === 0) {
    return (
      <div className="mt-8 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[14px] text-blue-700 dark:text-blue-400">
        No results yet. Run the assessment first.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] relative">
      <canvas
        ref={canvasRef}
        className="pointer-events-none z-0"
        style={{ position: "fixed", top: 0, left: 0 }}
      />
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroGlow { 0%, 100% { opacity: 0.15; transform: scale(1); } 50% { opacity: 0.25; transform: scale(1.05); } }
        .saf-fu { animation: fadeUp 0.38s ease forwards; opacity: 0; }
      `}</style>
      <div className="relative z-10 overflow-hidden bg-[#1A3C21] dark:bg-[#0F1F13]">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg,transparent,transparent 40px,rgba(255,255,255,0.5) 40px,rgba(255,255,255,0.5) 41px)`,
          }}
        />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle,#86BC25 0%,transparent 70%)",
            animation: "heroGlow 6s ease-in-out infinite",
          }}
        />
        <div className="relative px-6 md:px-10 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div className="saf-fu" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#86BC25] flex items-center justify-center">
                  <BarChart3 size={13} className="text-white" />
                </div>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Step 06 of 07 &mdash; Results
                </span>
              </div>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                Assessment Results
              </h1>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                {results.length} hazard{results.length !== 1 ? "s" : ""}{" "}
                assessed for {asset?.name ?? "asset"}.
              </p>
            </div>
            <div
              className="saf-fu flex items-center gap-5 shrink-0"
              style={{ animationDelay: "100ms" }}
            >
              <div className="text-right">
                <div
                  className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Overall
                </div>
                <div
                  className="text-[22px] font-bold leading-none"
                  style={{ color: HAZARD_RATING_COLORS[worstRating] }}
                >
                  {worstRating}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex-1 flex">
        <div className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[#D8D8D8] dark:border-white/7 bg-white dark:bg-[#111]">
          <div className="px-5 py-6 border-b border-[#EBEBEB] dark:border-white/6">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 06 / 07
            </div>
            <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight mb-1">
              Assessment Results
            </h2>
            <p className="text-[12px] text-[#888] dark:text-[#666] leading-relaxed">
              Detailed breakdown of climate hazard ratings, financial exposure
              and resilience impact.
            </p>
          </div>
          <div className="px-5 py-4 border-b border-[#EBEBEB] dark:border-white/6">
            <div className="space-y-0.5">
              {[
                { num: "01", label: "Summary analytics" },
                { num: "02", label: "Hazard breakdown" },
                { num: "03", label: "Calculation pipeline" },
              ].map((item) => (
                <div
                  key={item.num}
                  className="flex items-center gap-3 px-2 py-2"
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 border border-[#E2E2E0] dark:border-white/8 bg-[#F4F4F2] dark:bg-white/4 rounded-md">
                    <span
                      className="text-[9px] font-bold text-[#C0C0BE] dark:text-[#555]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.num}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#A0A09E] dark:text-[#555]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-5 flex-1">
            <div className="space-y-4">
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] block mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Asset
                </span>
                <div className="text-[13px] font-semibold text-[#111] dark:text-[#F0F0F0] truncate">
                  {asset?.name ?? "\u2014"}
                </div>
              </div>
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] block mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Overall Rating
                </span>
                <div
                  className="text-[13px] font-semibold"
                  style={{ color: HAZARD_RATING_COLORS[worstRating] }}
                >
                  {worstRating}
                </div>
              </div>
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] block mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Total EAL
                </span>
                <div className="text-[13px] font-semibold text-[#111] dark:text-[#F0F0F0]">
                  {fmt(totalEal, sym)}
                </div>
              </div>
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] block mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Hazards Assessed
                </span>
                <div className="text-[13px] font-semibold text-[#111] dark:text-[#F0F0F0]">
                  {results.length}
                </div>
              </div>
              <div>
                <span
                  className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] block mb-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Mode
                </span>
                <div className="text-[13px] font-semibold text-[#86BC25]">
                  {resilienceMode}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 px-6 md:px-8 xl:pr-12 py-7 overflow-y-auto">
          <div className="max-w-220">
            <div className="pra-surface overflow-hidden mb-4">
              <div
                className="h-1"
                style={{
                  background: `linear-gradient(90deg, ${HAZARD_RATING_COLORS[worstRating]}, #86BC25)`,
                }}
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${HAZARD_RATING_COLORS[worstRating]}20`,
                    }}
                  >
                    <BarChart3
                      size={22}
                      style={{ color: HAZARD_RATING_COLORS[worstRating] }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[#6E6E73] dark:text-[#86868B]">
                      Single Asset Results
                    </p>
                    <h2 className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {asset?.name ?? "Asset"}
                    </h2>
                  </div>
                  <span
                    className="ml-auto text-[12px] font-bold px-3 py-1 rounded-full border"
                    style={{
                      color: HAZARD_RATING_COLORS[worstRating],
                      backgroundColor: `${HAZARD_RATING_COLORS[worstRating]}18`,
                      borderColor: `${HAZARD_RATING_COLORS[worstRating]}40`,
                    }}
                  >
                    Overall: {worstRating}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    {
                      label: "Worst Hazard",
                      value: worstRating,
                      color: HAZARD_RATING_COLORS[worstRating],
                      icon: <AlertTriangle size={15} />,
                    },
                    {
                      label: "Total EAL",
                      value: fmt(totalEal, sym),
                      color: "#86BC25",
                      icon: <TrendingDown size={15} />,
                    },
                    {
                      label: "Max SSL",
                      value: fmt(maxSsl, sym),
                      color: "#F59E0B",
                      icon: <Activity size={15} />,
                    },
                    {
                      label: "Extreme Risks",
                      value: `${extremeCount}`,
                      color: extremeCount > 0 ? "#EF4444" : "#10B981",
                      icon: <ShieldCheck size={15} />,
                    },
                    {
                      label: "Very High",
                      value: `${vhCount}`,
                      color: vhCount > 0 ? "#DC143C" : "#10B981",
                      icon: <Eye size={15} />,
                    },
                    {
                      label: "Total Hazards",
                      value: `${results.length}`,
                      color: "#3B82F6",
                      icon: <BarChart3 size={15} />,
                    },
                  ].map((kpi) => (
                    <div
                      key={kpi.label}
                      className="p-2.5 rounded-xl border border-black/6 dark:border-white/6 bg-black/2 dark:bg-white/2 text-center"
                    >
                      <div
                        className="flex justify-center mb-0.5"
                        style={{ color: kpi.color }}
                      >
                        {kpi.icon}
                      </div>
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B]">
                        {kpi.label}
                      </p>
                      <p
                        className="text-[13px] font-extrabold"
                        style={{ color: kpi.color }}
                      >
                        {kpi.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
              <div className="md:col-span-7 pra-surface overflow-hidden">
                <div className="px-4 py-3 border-b border-black/6 dark:border-white/6 flex items-center gap-2">
                  <MapPin size={13} className="text-primary-500" />
                  <span className="text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Asset Location
                  </span>
                  {geoConfidence && (
                    <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 text-[#6E6E73] dark:text-[#86868B]">
                      {geoConfidence.level}
                    </span>
                  )}
                </div>
                {asset && (
                  <AssetMapView
                    pins={[
                      {
                        lat: asset.latitude,
                        lon: asset.longitude,
                        label: asset.name,
                        detail: `${asset.assetType} \u00b7 ${worstRating}`,
                      },
                    ]}
                    height={260}
                    zoom={13}
                    center={[asset.latitude, asset.longitude]}
                  />
                )}
              </div>

              <div className="md:col-span-5 pra-surface">
                <div className="px-4 py-3 border-b border-black/6 dark:border-white/6">
                  <span className="text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Rating Distribution
                  </span>
                </div>
                <div className="p-4">
                  {ORDERED_RATINGS.map((rating) => (
                    <div key={rating} className="flex items-center gap-2 mb-2">
                      <span
                        className="text-[11px] font-semibold w-18 shrink-0"
                        style={{ color: HAZARD_RATING_COLORS[rating] }}
                      >
                        {rating}
                      </span>
                      <div className="flex-1 h-4.5 rounded bg-black/4 dark:bg-white/4 overflow-hidden">
                        <div
                          className="h-full rounded transition-all duration-500"
                          style={{
                            width: `${(ratingDist[rating] / maxBar) * 100}%`,
                            backgroundColor: HAZARD_RATING_COLORS[rating],
                          }}
                        />
                      </div>
                      <span className="text-[12px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] w-5 text-right">
                        {ratingDist[rating]}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-black/6 dark:border-white/6 mt-3 pt-3">
                    <div
                      className={`px-3 py-2 rounded-lg text-[11px] ${
                        extremeCount > 0
                          ? "bg-red-500/10 text-red-600 dark:text-red-400"
                          : vhCount > 0
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : "bg-green-500/10 text-green-700 dark:text-green-400"
                      }`}
                    >
                      {RISK_APPETITE[worstRating]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="pra-surface p-5 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={16} className="text-primary-500" />
                <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Resilience Impact
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500">
                  {resilienceMode}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    label: "EAL Without Resilience",
                    value: fmt(ealWithoutResilience, sym),
                    color: "#EF4444",
                    bgClass: "bg-red-500/5",
                  },
                  {
                    label: "EAL With Resilience",
                    value: fmt(totalEal, sym),
                    color: "#86BC25",
                    bgClass: "bg-primary-500/5",
                  },
                  {
                    label: "Annual Savings",
                    value: ealSavings > 0 ? fmt(ealSavings, sym) : fmt(0, sym),
                    color: "#10B981",
                    bgClass: "bg-green-500/5",
                    sub:
                      ealWithoutResilience > 0
                        ? `(${pct(ealSavings / ealWithoutResilience)} reduction)`
                        : undefined,
                  },
                ].map((tile) => (
                  <div
                    key={tile.label}
                    className={`p-4 rounded-xl border border-black/5 dark:border-white/5 text-center ${tile.bgClass}`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-1">
                      {tile.label}
                    </p>
                    <p
                      className="text-[20px] font-extrabold"
                      style={{ color: tile.color }}
                    >
                      {tile.value}
                    </p>
                    {tile.sub && (
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: tile.color }}
                      >
                        {tile.sub}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="pra-surface overflow-hidden mb-4">
              <div className="px-5 py-3 border-b border-black/6 dark:border-white/6 flex items-center gap-2">
                <Activity size={15} className="text-blue-500" />
                <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                  Per-Hazard Breakdown
                </span>
                <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] ml-auto">
                  {results.length} hazards assessed
                </span>
              </div>

              <div
                className="overflow-x-auto"
                style={{ maxHeight: 480, overflowY: "auto" }}
              >
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 z-10 bg-[#F9F9F9] dark:bg-[#161616]">
                    <tr className="border-b border-black/6 dark:border-white/6">
                      <th className="w-8 px-2 py-2.5" />
                      <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5">
                        Hazard
                      </th>
                      <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-center">
                        Category
                      </th>
                      <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-center">
                        Rating
                      </th>
                      <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-center">
                        Intensity
                      </th>
                      <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-center">
                        Frequency
                      </th>
                      <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-right">
                        EF
                      </th>
                      <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-right">
                        Net Vuln
                      </th>
                      <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-right">
                        SSL
                      </th>
                      <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-right">
                        EAL
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((r) => {
                      const cat = riskCategoryMap[r.risk] ?? "Other";
                      const catColor = CATEGORY_COLORS[cat] ?? "#6B7280";
                      const isExpanded = expandedRow === r.risk;
                      return (
                        <>
                          <tr
                            key={r.risk}
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : r.risk)
                            }
                            className="border-b border-black/4 dark:border-white/4 cursor-pointer hover:bg-black/1.5 dark:hover:bg-white/2 transition-colors"
                          >
                            <td className="px-2 py-2 text-center">
                              <button className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/6 dark:hover:bg-white/6 border-none bg-transparent cursor-pointer mx-auto">
                                {isExpanded ? (
                                  <ChevronUp
                                    size={13}
                                    className="text-[#6E6E73]"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={13}
                                    className="text-[#6E6E73]"
                                  />
                                )}
                              </button>
                            </td>
                            <td className="px-3 py-2.5 text-[12px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-nowrap">
                              {r.risk}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span
                                className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${catColor}18`,
                                  color: catColor,
                                }}
                              >
                                {cat}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span
                                className="text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${HAZARD_RATING_COLORS[r.hazardRating]}18`,
                                  color: HAZARD_RATING_COLORS[r.hazardRating],
                                }}
                              >
                                {r.hazardRating}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center text-[11px] text-[#6E6E73] dark:text-[#86868B]">
                              {r.intensityLabel}
                            </td>
                            <td className="px-3 py-2.5 text-center text-[11px] text-[#6E6E73] dark:text-[#86868B]">
                              {r.frequencyLabel}
                            </td>
                            <td className="px-3 py-2.5 text-right text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                              {pct(r.exposureFactor)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-[11px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                              {pct(r.sbraNetVulnerability)}
                            </td>
                            <td
                              className="px-3 py-2.5 text-right text-[11px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]"
                              title={`${sym}${r.sslLocal.toLocaleString()}`}
                            >
                              {fmt(r.sslLocal, sym)}
                            </td>
                            <td
                              className="px-3 py-2.5 text-right text-[11px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]"
                              title={`${sym}${r.totalEalLocal.toLocaleString()}`}
                            >
                              {fmt(r.totalEalLocal, sym)}
                            </td>
                          </tr>
                          <tr key={`${r.risk}-detail`}>
                            <td colSpan={10} className="p-0">
                              <div
                                className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-225" : "max-h-0"}`}
                              >
                                <div className="mx-4 mb-3 p-4 rounded-xl bg-black/2 dark:bg-white/2 border border-black/6 dark:border-white/6">
                                  <p className="text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
                                    Calculation Audit Trail &mdash; {r.risk}
                                  </p>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <CalcLine
                                        label="Asset Value"
                                        value={`${sym}${r.assetValueLocal.toLocaleString()}`}
                                      />
                                      <CalcLine
                                        label="Hazard Rating"
                                        value={r.hazardRating}
                                        color={
                                          HAZARD_RATING_COLORS[r.hazardRating]
                                        }
                                      />
                                      <CalcLine
                                        label="Exposure Factor (EF)"
                                        value={pct(r.exposureFactor)}
                                      />
                                      <CalcLine
                                        label="Exposed Value"
                                        value={`${sym}${r.exposedValueLocal.toLocaleString()}`}
                                        formula={"= Asset Value × EF"}
                                      />
                                      <CalcLine
                                        label="Inherent Vulnerability (IV)"
                                        value={pct(r.inherentVulnerability)}
                                      />
                                      <CalcLine
                                        label="Resilience Reduction (RRF)"
                                        value={pct(r.sbraRrf)}
                                      />
                                      <CalcLine
                                        label="Net Vulnerability"
                                        value={pct(r.sbraNetVulnerability)}
                                        formula={"= IV × (1 − RRF)"}
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <CalcLine
                                        label="Single Scenario Loss (SSL)"
                                        value={fmt(r.sslLocal, sym)}
                                        formula={
                                          "= Asset Value × EF × Net Vuln"
                                        }
                                      />
                                      <CalcLine
                                        label="Annual Probability"
                                        value={pct(r.annualProbability)}
                                      />
                                      <CalcLine
                                        label="Expected Annual Loss (EAL)"
                                        value={fmt(r.totalEalLocal, sym)}
                                        formula={"= SSL × Annual Prob"}
                                      />
                                      <div className="border-t border-black/6 dark:border-white/6 pt-1.5 my-1.5" />
                                      <CalcLine
                                        label="Response Strategy"
                                        value={r.responseStrategy}
                                      />
                                      <CalcLine
                                        label="Priority"
                                        value={r.responsePriority}
                                        color={
                                          r.responsePriority === "CRITICAL"
                                            ? "#EF4444"
                                            : r.responsePriority === "HIGH"
                                              ? "#DC143C"
                                              : "#F59E0B"
                                        }
                                      />
                                      <CalcLine
                                        label="Timeframe"
                                        value={r.responseTimeframe}
                                      />
                                      <CalcLine
                                        label="Data Source"
                                        value={r.dataSource}
                                      />
                                    </div>
                                  </div>
                                  {r.monitoringKpi && (
                                    <>
                                      <div className="border-t border-black/6 dark:border-white/6 mt-3 pt-3" />
                                      <p className="text-[11px] font-bold text-blue-500 mb-2">
                                        Monitoring Plan
                                      </p>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {[
                                          {
                                            label: "KPI",
                                            value: r.monitoringKpi,
                                          },
                                          {
                                            label: "Frequency",
                                            value: r.monitoringFrequency,
                                          },
                                          {
                                            label: "Trigger",
                                            value: r.monitoringTrigger || "—",
                                          },
                                          {
                                            label: "Owner",
                                            value: r.monitoringOwnerRole || "—",
                                          },
                                        ].map((m) => (
                                          <div
                                            key={m.label}
                                            className="p-2 rounded-lg bg-blue-500/5 border border-blue-500/10"
                                          >
                                            <p className="text-[9px] font-semibold uppercase tracking-wider text-blue-400 mb-0.5">
                                              {m.label}
                                            </p>
                                            <p className="text-[11px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] break-words">
                                              {m.value}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="px-5 py-3 border-t border-black/6 dark:border-white/6 flex items-center justify-between">
                <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B]">
                  Click any row to expand the full calculation audit trail
                </span>
                <div className="flex gap-4">
                  <span className="text-[11px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Total SSL: {fmt(totalSsl, sym)}
                  </span>
                  <span className="text-[11px] font-bold text-primary-500">
                    Total EAL: {fmt(totalEal, sym)}
                  </span>
                </div>
              </div>
            </div>
            <div className="pra-surface overflow-hidden">
              <button
                onClick={() => setShowCalc(!showCalc)}
                className="w-full px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-black/2 dark:hover:bg-white/2 transition-colors bg-transparent border-none text-left"
              >
                <div className="flex items-center gap-2">
                  <Calculator size={15} className="text-purple-500" />
                  <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    Worked Calculation Pipeline
                  </span>
                </div>
                {showCalc ? (
                  <ChevronUp size={15} className="text-[#6E6E73]" />
                ) : (
                  <ChevronDown size={15} className="text-[#6E6E73]" />
                )}
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${showCalc ? "max-h-500" : "max-h-0"}`}
              >
                <div className="px-5 pb-5">
                  <div className="border-t border-black/6 dark:border-white/6 mb-4" />
                  {[
                    {
                      step: 1,
                      title: "Hazard Assessment",
                      desc: `${results.length} hazards assessed via ${results[0]?.dataSource ?? "Climate APIs"}`,
                      detail: `Matrix: ${config.matrixSize}\u00d7${config.matrixSize} \u00b7 Intensity \u00d7 Frequency \u2192 Rating`,
                    },
                    {
                      step: 2,
                      title: "Exposure Factor Lookup",
                      desc: `Asset type: ${asset?.assetType ?? "\u2014"} mapped against rating bands`,
                      detail: `EF range: ${pct(Math.min(...results.map((r) => r.exposureFactor)))} \u2014 ${pct(Math.max(...results.map((r) => r.exposureFactor)))}`,
                    },
                    {
                      step: 3,
                      title: "Vulnerability Assessment",
                      desc: "Inherent vulnerability from risk \u00d7 asset-type cross-reference matrix",
                      detail: `IV range: ${pct(Math.min(...results.map((r) => r.inherentVulnerability)))} \u2014 ${pct(Math.max(...results.map((r) => r.inherentVulnerability)))}`,
                    },
                    {
                      step: 4,
                      title: "Resilience Reduction",
                      desc: `Mode: ${resilienceMode} \u00b7 Net Vulnerability = IV \u00d7 (1 \u2212 RRF)`,
                      detail: `RRF range: ${pct(Math.min(...results.map((r) => r.sbraRrf)))} \u2014 ${pct(Math.max(...results.map((r) => r.sbraRrf)))}`,
                    },
                    {
                      step: 5,
                      title: "Single Scenario Loss",
                      desc: "SSL = Asset Value \u00d7 EF \u00d7 Net Vulnerability",
                      detail: `SSL range: ${fmt(Math.min(...results.map((r) => r.sslLocal)), sym)} \u2014 ${fmt(Math.max(...results.map((r) => r.sslLocal)), sym)}`,
                    },
                    {
                      step: 6,
                      title: "Expected Annual Loss",
                      desc: "EAL = SSL \u00d7 Annual Probability",
                      detail: `Total EAL: ${fmt(totalEal, sym)} \u00b7 Total SSL: ${fmt(totalSsl, sym)}`,
                    },
                    {
                      step: 7,
                      title: "Response & Monitoring",
                      desc: "Rating-based strategy assignment + hazard-specific monitoring KPIs",
                      detail: `Strategies assigned: ${[...new Set(results.map((r) => r.responseStrategy))].join(", ")}`,
                    },
                  ].map((s) => (
                    <div key={s.step} className="flex gap-3 mb-4 items-start">
                      <div className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center bg-purple-500/10 mt-0.5">
                        <span className="text-[11px] font-extrabold text-purple-500">
                          {s.step}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
                          {s.title}
                        </p>
                        <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B]">
                          {s.desc}
                        </p>
                        <p className="text-[10px] font-mono text-[#9CA3AF] dark:text-[#6B7280] mt-0.5">
                          {s.detail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalcLine({
  label,
  value,
  formula,
  color,
}: {
  label: string;
  value: string;
  formula?: string;
  color?: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[11px] text-[#9CA3AF] w-40 shrink-0">{label}</span>
      <div>
        <span
          className="text-[11px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]"
          style={color ? { color } : undefined}
        >
          {value}
        </span>
        {formula && (
          <span className="block text-[10px] font-mono text-[#9CA3AF] dark:text-[#6B7280] mt-0.5">
            {formula}
          </span>
        )}
      </div>
    </div>
  );
}
