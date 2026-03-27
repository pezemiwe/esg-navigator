import { useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Activity,
  Grid3x3,
  MapPin,
  ShieldPlus,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS,
  RATING_ORDER,
  RISK_APPETITE,
  ALL_21_RISKS,
  RESILIENCE_MEASURES,
  buildMatrixConfig,
} from "../../domain/physicalRisk/constants";
import type { HazardRating } from "../../domain/physicalRisk/types";
import AssetMapView from "../../components/AssetMapView";

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

const MEASURE_CAT_COLORS: Record<string, string> = {
  Flood: "#3B82F6",
  Electrical: "#F59E0B",
  Wind: "#8B5CF6",
  Heat: "#EF4444",
  Water: "#06B6D4",
  Fire: "#F97316",
  Seismic: "#6366F1",
  Geotechnical: "#84CC16",
  Coastal: "#0EA5E9",
  "Air Quality": "#A78BFA",
  Operational: "#14B8A6",
  Financial: "#EC4899",
};

export default function SingleResults() {
  const { config, mappedAssets, results, resilienceMode, geoConfidence } =
    usePhysicalRiskStore();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "resilience" | "hazards" | "matrix"
  >("hazards");

  const asset = mappedAssets[0];
  const sym = config.currency === "USD" ? "$" : "\u20A6";

  const totalEal = useMemo(
    () => results.reduce((s, r) => s + r.ealLocal, 0),
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

  const mc = useMemo(
    () => buildMatrixConfig(config.matrixSize),
    [config.matrixSize],
  );

  const matrixMap = useMemo(() => {
    const m: Record<string, typeof results> = {};
    results.forEach((r) => {
      const fi = Math.max(1, Math.min(mc.size, Math.round(r.frequencyScore)));
      const ii = Math.max(1, Math.min(mc.size, Math.round(r.intensityScore)));
      const key = `${fi},${ii}`;
      if (!m[key]) m[key] = [];
      m[key].push(r);
    });
    return m;
  }, [results, mc.size]);

  const recommendedMeasures = useMemo(() => {
    const hazardToCats: Record<string, string[]> = {
      "River Flooding": ["Flood"],
      "Flash Flooding": ["Flood"],
      "Coastal Flooding": ["Flood", "Coastal"],
      "Groundwater Flooding": ["Flood"],
      "Storm Surge": ["Coastal"],
      "Sea Level Rise": ["Coastal"],
      "Coastal & Riverbank Erosion": ["Coastal", "Geotechnical"],
      Tsunamis: ["Coastal"],
      "Tropical Cyclones": ["Wind"],
      "Sandstorms / Harmattan": ["Wind", "Air Quality"],
      "Thunderstorms & Lightning": ["Electrical"],
      "Extreme Heat": ["Heat"],
      Drought: ["Water"],
      "Water Scarcity": ["Water"],
      "Wildfire / Bushfire": ["Fire"],
      Earthquakes: ["Seismic"],
      Landslides: ["Geotechnical"],
      "Volcanic Eruptions": ["Air Quality"],
      "Extreme Cold / Frost": ["Operational"],
      Hailstorms: ["Wind", "Operational"],
    };
    const highRisk = results.filter(
      (r) => RATING_ORDER[r.hazardRating] >= RATING_ORDER["High"],
    );
    if (highRisk.length === 0) return [];
    const catSet = new Set<string>();
    highRisk.forEach((r) => {
      (hazardToCats[r.risk] ?? ["Operational"]).forEach((c) => catSet.add(c));
    });
    return RESILIENCE_MEASURES.filter((m) => catSet.has(m.category))
      .sort((a, b) => b.rrf - a.rrf)
      .slice(0, 9);
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="mt-8 px-4 py-3 border border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#141414] text-[17px] text-[#888]">
        No results yet. Run the assessment first.
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-[#F4F4F2] dark:bg-[#0D0D0D] min-h-[calc(100vh-140px)]">
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .fu {
          animation: fadeUp 0.38s ease forwards;
          opacity: 0;
        }
      `}</style>

      {/* Left rail – KPI overview */}
      <div className="hidden lg:flex flex-col w-[300px] flex-shrink-0 border-r border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]">
        {/* Panel 1 – Header */}
        <div
          className="px-6 py-7 border-b border-[#EBEBEB] dark:border-white/[0.06]"
          style={{
            borderLeft: `3px solid ${HAZARD_RATING_COLORS[worstRating]}`,
          }}
        >
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Step 06 / 07
          </div>
          <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
            Assessment Results
          </h2>
          <div
            className="text-[13px] font-semibold"
            style={{ color: HAZARD_RATING_COLORS[worstRating] }}
          >
            {worstRating}
          </div>
          <div className="text-[12px] text-[#888] dark:text-[#555] mt-0.5">
            {asset?.name ?? "Asset"}
          </div>
        </div>

        {/* Panel 2 – KPIs */}
        <div className="border-b border-[#EBEBEB] dark:border-white/[0.06]">
          {[
            { label: "Total EAL", value: fmt(totalEal, sym), color: "#86BC25" },
            { label: "Max SSL", value: fmt(maxSsl, sym), color: "#F59E0B" },
            {
              label: "Extreme",
              value: `${extremeCount}`,
              color: extremeCount > 0 ? "#EF4444" : "#86BC25",
            },
            {
              label: "Very High",
              value: `${vhCount}`,
              color: vhCount > 0 ? "#DC143C" : "#86BC25",
            },
            { label: "Hazards", value: `${results.length}`, color: "#888" },
          ].map((kpi) => (
            <div
              key={kpi.label}
              className="px-6 py-3 border-b border-[#F0F0F0] dark:border-white/[0.04] flex items-center justify-between last:border-b-0"
            >
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.10em] text-[#888] dark:text-[#555]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {kpi.label}
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: kpi.color, fontFamily: "var(--font-mono)" }}
              >
                {kpi.value}
              </span>
            </div>
          ))}
        </div>

        {/* Panel 3 – Distribution */}
        <div className="px-6 py-5 flex-1">
          <div
            className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Distribution
          </div>
          {ORDERED_RATINGS.map((rating) => (
            <div key={rating} className="flex items-center gap-2 mb-1.5">
              <div
                className="w-[3px] h-3 flex-shrink-0"
                style={{ backgroundColor: HAZARD_RATING_COLORS[rating] }}
              />
              <div className="flex-1 h-[6px] bg-[#F0F0F0] dark:bg-white/[0.04] overflow-hidden">
                <div
                  className="h-full transition-all duration-700"
                  style={{
                    width: `${(ratingDist[rating] / maxBar) * 100}%`,
                    backgroundColor: HAZARD_RATING_COLORS[rating],
                  }}
                />
              </div>
              <span
                className="text-[11px] w-3 text-right text-[#888] dark:text-[#555] flex-shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {ratingDist[rating]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-[#E5E5E5] dark:border-white/[0.07] bg-white dark:bg-[#141414] flex-shrink-0">
          {(
            [
              {
                key: "resilience",
                label: "Resilience Impact",
                icon: ShieldCheck,
              },
              { key: "hazards", label: "Per-Hazard Breakdown", icon: Activity },
              { key: "matrix", label: "Risk Matrix", icon: Grid3x3 },
            ] as {
              key: "resilience" | "hazards" | "matrix";
              label: string;
              icon: ElementType;
            }[]
          ).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 transition-colors cursor-pointer bg-transparent ${
                activeTab === key
                  ? "border-[#86BC25] text-[#111] dark:text-[#F0F0F0]"
                  : "border-transparent text-[#888] hover:text-[#111] dark:hover:text-[#F0F0F0]"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <Icon
                size={11}
                className={
                  activeTab === key ? "text-[#86BC25]" : "text-[#BBBBBB]"
                }
              />
              <span className="text-[13px] font-medium uppercase tracking-[0.08em]">
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Tab: Resilience Impact ── */}
          {activeTab === "resilience" && (
            <div className="grid grid-cols-1 md:grid-cols-5 border-b border-[#E5E5E5] dark:border-white/[0.07]">
              {/* Map */}
              <div className="md:col-span-3 border-r border-[#E5E5E5] dark:border-white/[0.07]">
                <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#E5E5E5] dark:border-white/[0.07] bg-white dark:bg-[#141414]">
                  <MapPin size={11} className="text-[#86BC25]" />
                  <span
                    className="text-[17px] font-medium uppercase tracking-[0.08em] text-[#888]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Asset Location
                  </span>
                  {geoConfidence && (
                    <span
                      className="ml-auto text-[17px] font-medium text-[#888]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
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
                        detail: `${asset.assetType} · ${worstRating}`,
                      },
                    ]}
                    height={240}
                    zoom={13}
                    center={[asset.latitude, asset.longitude]}
                  />
                )}
              </div>

              {/* Resilience panel */}
              <div className="md:col-span-2 bg-white dark:bg-[#141414]">
                <div className="flex items-center gap-2 px-5 py-2.5 border-b border-[#E5E5E5] dark:border-white/[0.07]">
                  <ShieldCheck size={11} className="text-[#86BC25]" />
                  <span
                    className="text-[17px] font-medium uppercase tracking-[0.08em] text-[#888]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Resilience Impact
                  </span>
                  <span
                    className="ml-auto text-[17px] border border-[#E5E5E5] dark:border-white/[0.10] px-1.5 py-0.5 text-[#888]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {resilienceMode}
                  </span>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    {
                      label: "Without Resilience",
                      value: fmt(ealWithoutResilience, sym),
                      color: "#EF4444",
                    },
                    {
                      label: "With Resilience",
                      value: fmt(totalEal, sym),
                      color: "#86BC25",
                    },
                    {
                      label: "Annual Savings",
                      value:
                        ealSavings > 0 ? fmt(ealSavings, sym) : fmt(0, sym),
                      color: "#10B981",
                      sub:
                        ealWithoutResilience > 0
                          ? `${pct(ealSavings / ealWithoutResilience)} reduction`
                          : undefined,
                    },
                  ].map((tile) => (
                    <div key={tile.label}>
                      <div
                        className="text-[17px] font-medium uppercase tracking-[0.06em] text-[#BBBBBB] dark:text-[#444] mb-0.5"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {tile.label}
                      </div>
                      <div
                        className="text-[17px] font-semibold"
                        style={{
                          color: tile.color,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {tile.value}
                      </div>
                      {tile.sub && (
                        <div
                          className="text-[17px] mt-0.5"
                          style={{ color: tile.color }}
                        >
                          {tile.sub}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="pt-2 border-t border-[#F0F0F0] dark:border-white/[0.05]">
                    <div
                      className={`px-3 py-2 text-[17px] leading-relaxed ${
                        extremeCount > 0
                          ? "border-l-2 border-red-500 bg-red-50 dark:bg-red-500/[0.05] text-red-600 dark:text-red-400"
                          : vhCount > 0
                            ? "border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-500/[0.05] text-amber-700 dark:text-amber-400"
                            : "border-l-2 border-[#86BC25] bg-[#86BC25]/[0.04] text-[#6b9b1e] dark:text-[#86BC25]"
                      }`}
                    >
                      {RISK_APPETITE[worstRating]}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Per-Hazard Breakdown ── */}
          {activeTab === "hazards" && (
            <div className="bg-white dark:bg-[#141414]">
              {/* Table header bar */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-[#E5E5E5] dark:border-white/[0.07]">
                <Activity size={12} className="text-[#86BC25]" />
                <span
                  className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Per-Hazard Breakdown
                </span>
                <span
                  className="ml-auto text-[17px] text-[#BBBBBB]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {results.length} hazards
                </span>
              </div>

              <div className="overflow-x-auto">
                <table
                  className="w-full border-collapse"
                  style={{ minWidth: 680 }}
                >
                  <thead>
                    <tr className="border-b-2 border-[#E5E5E5] dark:border-white/[0.08] bg-[#F9F9F8] dark:bg-[#1A1A1A]">
                      <th className="w-10 px-3 py-3" />
                      <th className="text-left px-4 py-3">
                        <span
                          className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Hazard
                        </span>
                      </th>
                      <th className="text-left px-3 py-3">
                        <span
                          className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Category
                        </span>
                      </th>
                      <th className="text-left px-3 py-3">
                        <span
                          className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Rating
                        </span>
                      </th>
                      <th className="text-left px-3 py-3">
                        <span
                          className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Intensity
                        </span>
                      </th>
                      <th className="text-left px-3 py-3">
                        <span
                          className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Frequency
                        </span>
                      </th>
                      <th className="text-right px-4 py-3">
                        <span
                          className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Exp. Factor
                        </span>
                      </th>
                      <th className="text-right px-4 py-3">
                        <span
                          className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Net Vuln.
                        </span>
                      </th>
                      <th className="text-right px-4 py-3">
                        <span
                          className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          SSL
                        </span>
                      </th>
                      <th className="text-right px-4 py-3 pr-5">
                        <span
                          className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#86BC25]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          EAL
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map((r, rowIdx) => {
                      const cat = riskCategoryMap[r.risk] ?? "Other";
                      const catColor = CATEGORY_COLORS[cat] ?? "#6B7280";
                      const isExpanded = expandedRow === r.risk;
                      const ratingColor = HAZARD_RATING_COLORS[r.hazardRating];
                      return (
                        <>
                          <tr
                            key={r.risk}
                            onClick={() =>
                              setExpandedRow(isExpanded ? null : r.risk)
                            }
                            className={`cursor-pointer transition-colors duration-100 border-b border-[#F0F0F0] dark:border-white/[0.04]
                          ${isExpanded ? "bg-[#F9F9F7] dark:bg-white/[0.02]" : "hover:bg-[#FAFAF8] dark:hover:bg-white/[0.015]"}
                          animate-fade-up`}
                            style={{ animationDelay: `${rowIdx * 20}ms` }}
                          >
                            <td className="px-3 py-3.5 text-center w-10">
                              <button className="w-5 h-5 flex items-center justify-center hover:bg-[#E5E5E5] dark:hover:bg-white/[0.08] transition-colors bg-transparent mx-auto">
                                {isExpanded ? (
                                  <ChevronUp
                                    size={11}
                                    className="text-[#888]"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={11}
                                    className="text-[#BBBBBB]"
                                  />
                                )}
                              </button>
                            </td>

                            <td className="px-4 py-3.5">
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-[2px] h-4 flex-shrink-0"
                                  style={{ backgroundColor: ratingColor }}
                                />
                                <span className="text-[17px] font-medium text-[#111] dark:text-[#E8E8E8] whitespace-nowrap">
                                  {r.risk}
                                </span>
                              </div>
                            </td>

                            <td className="px-3 py-3.5">
                              <span
                                className="text-[17px] font-medium px-1.5 py-0.5 border"
                                style={{
                                  borderColor: `${catColor}40`,
                                  color: catColor,
                                  backgroundColor: `${catColor}08`,
                                  fontFamily: "var(--font-mono)",
                                }}
                              >
                                {cat.slice(0, 5).toUpperCase()}
                              </span>
                            </td>

                            <td className="px-3 py-3.5">
                              <span
                                className="text-[17px] font-medium px-1.5 py-0.5 border"
                                style={{
                                  borderColor: `${ratingColor}50`,
                                  color: ratingColor,
                                  backgroundColor: `${ratingColor}08`,
                                  fontFamily: "var(--font-mono)",
                                }}
                              >
                                {r.hazardRating
                                  .toUpperCase()
                                  .replace(" ", "\u00A0")}
                              </span>
                            </td>

                            <td className="px-3 py-3.5">
                              <span className="text-[15px] text-[#888] dark:text-[#555]">
                                {r.intensityLabel}
                              </span>
                            </td>

                            <td className="px-3 py-3.5">
                              <span className="text-[15px] text-[#888] dark:text-[#555]">
                                {r.frequencyLabel}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <span
                                className="text-[15px] text-[#333] dark:text-[#CCC]"
                                style={{ fontFamily: "var(--font-mono)" }}
                              >
                                {pct(r.exposureFactor)}
                              </span>
                            </td>

                            <td className="px-4 py-3.5 text-right">
                              <span
                                className="text-[15px] text-[#333] dark:text-[#CCC]"
                                style={{ fontFamily: "var(--font-mono)" }}
                              >
                                {pct(r.sbraNetVulnerability)}
                              </span>
                            </td>

                            <td
                              className="px-4 py-3.5 text-right"
                              title={`${sym}${r.sslLocal.toLocaleString()}`}
                            >
                              <span
                                className="text-[15px] font-medium text-[#333] dark:text-[#CCC]"
                                style={{ fontFamily: "var(--font-mono)" }}
                              >
                                {fmt(r.sslLocal, sym)}
                              </span>
                            </td>

                            <td
                              className="px-4 py-3.5 pr-5 text-right"
                              title={`${sym}${r.ealLocal.toLocaleString()}`}
                            >
                              <span
                                className="text-[15px] font-semibold"
                                style={{
                                  color: "#86BC25",
                                  fontFamily: "var(--font-mono)",
                                }}
                              >
                                {fmt(r.ealLocal, sym)}
                              </span>
                            </td>
                          </tr>

                          {/* Expanded audit row */}
                          <tr key={`${r.risk}-detail`}>
                            <td colSpan={10} className="p-0">
                              <div
                                className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[900px]" : "max-h-0"}`}
                              >
                                <div className="mx-5 mb-3 mt-1 border border-[#E5E5E5] dark:border-white/[0.08] bg-[#FAFAF8] dark:bg-[#1A1A1A]">
                                  {/* Audit header */}
                                  <div
                                    className="px-4 py-2.5 border-b border-[#E5E5E5] dark:border-white/[0.08] flex items-center gap-2"
                                    style={{
                                      borderLeft: `3px solid ${ratingColor}`,
                                    }}
                                  >
                                    <span
                                      className="text-[17px] font-medium uppercase tracking-[0.08em] text-[#888]"
                                      style={{ fontFamily: "var(--font-mono)" }}
                                    >
                                      Calculation Audit — {r.risk}
                                    </span>
                                    <span
                                      className="ml-auto text-[17px] font-medium"
                                      style={{
                                        color: ratingColor,
                                        fontFamily: "var(--font-mono)",
                                      }}
                                    >
                                      {r.hazardRating}
                                    </span>
                                  </div>

                                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                                    <div className="space-y-1.5">
                                      <CalcLine
                                        label="Asset Value"
                                        value={`${sym}${r.assetValueLocal.toLocaleString()}`}
                                      />
                                      <CalcLine
                                        label="Hazard Rating"
                                        value={r.hazardRating}
                                        color={ratingColor}
                                      />
                                      <CalcLine
                                        label="Exposure Factor (EF)"
                                        value={pct(r.exposureFactor)}
                                      />
                                      <CalcLine
                                        label="Exposed Value"
                                        value={`${sym}${r.exposedValueLocal.toLocaleString()}`}
                                        formula="= Asset Value × EF"
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
                                        formula="= IV × (1 − RRF)"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <CalcLine
                                        label="Single Scenario Loss (SSL)"
                                        value={fmt(r.sslLocal, sym)}
                                        formula="= Asset Value × EF × Net Vuln"
                                      />
                                      <CalcLine
                                        label="Annual Probability"
                                        value={pct(r.annualProbability)}
                                      />
                                      <CalcLine
                                        label="Expected Annual Loss (EAL)"
                                        value={fmt(r.ealLocal, sym)}
                                        formula="= SSL × Annual Prob"
                                      />
                                      <div className="border-t border-[#E5E5E5] dark:border-white/[0.07] pt-1.5 my-1" />
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
                                    <div className="px-4 pb-4 pt-1 border-t border-[#E5E5E5] dark:border-white/[0.07]">
                                      <div
                                        className="text-[17px] font-medium uppercase tracking-[0.08em] text-[#3B82F6] mb-2 mt-2"
                                        style={{
                                          fontFamily: "var(--font-mono)",
                                        }}
                                      >
                                        Monitoring Plan
                                      </div>
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        <CalcLine
                                          label="KPI"
                                          value={r.monitoringKpi}
                                        />
                                        <CalcLine
                                          label="Frequency"
                                          value={r.monitoringFrequency}
                                        />
                                        <CalcLine
                                          label="Trigger"
                                          value={r.monitoringTrigger || "—"}
                                        />
                                        <CalcLine
                                          label="Owner"
                                          value={r.monitoringOwnerRole || "—"}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        </>
                      );
                    })}
                  </tbody>
                  {/* Table footer with totals */}
                  <tfoot>
                    <tr className="border-t-2 border-[#E5E5E5] dark:border-white/[0.10] bg-[#F9F9F8] dark:bg-[#1A1A1A]">
                      <td colSpan={7} className="px-4 py-3"></td>
                      <td className="px-4 py-3 text-right w-[200px]">
                        <span
                          className="text-[17px] font-medium uppercase tracking-[0.06em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Total SSL
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className="text-[17px] font-semibold text-[#333] dark:text-[#CCC]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {fmt(totalSsl, sym)}
                        </span>
                      </td>
                      <td className="px-4 py-3 pr-5 text-right">
                        <span
                          className="text-[17px] font-semibold"
                          style={{
                            color: "#86BC25",
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {fmt(totalEal, sym)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* ── Tab: Risk Matrix ── */}
          {activeTab === "matrix" && (
            <div className="bg-white dark:bg-[#141414] p-5 overflow-y-auto">
              {/* Risk Matrix */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-5">
                  <Grid3x3 size={12} className="text-[#86BC25]" />
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAA]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Risk Matrix — Intensity × Likelihood
                  </span>
                </div>

                <div className="flex gap-2">
                  {/* Y-axis frequency labels */}
                  <div
                    className="flex flex-col justify-between flex-shrink-0 pb-6"
                    style={{ width: 84 }}
                  >
                    {Array.from({ length: mc.size }, (_, i) => mc.size - i).map(
                      (freqIdx) => (
                        <div
                          key={freqIdx}
                          className="flex items-center justify-end pr-2"
                          style={{ height: `${100 / mc.size}%` }}
                        >
                          <span
                            className="text-[9px] text-[#888] dark:text-[#555] text-right leading-tight"
                            style={{
                              fontFamily: "var(--font-mono)",
                              maxWidth: 78,
                            }}
                          >
                            {mc.frequencyLabels[freqIdx]}
                          </span>
                        </div>
                      ),
                    )}
                  </div>

                  {/* Grid */}
                  <div className="flex-1">
                    {Array.from({ length: mc.size }, (_, i) => mc.size - i).map(
                      (freqIdx) => (
                        <div key={freqIdx} className="flex gap-0.5 mb-0.5">
                          {Array.from({ length: mc.size }, (_, j) => j + 1).map(
                            (intIdx) => {
                              const cellKey = `${freqIdx},${intIdx}`;
                              const baseRating =
                                (mc.matrix[cellKey] as HazardRating) ??
                                "Negligible";
                              const cellHazards = matrixMap[cellKey] ?? [];
                              const worstCell =
                                cellHazards.length > 0
                                  ? [...cellHazards].sort(
                                      (a, b) =>
                                        RATING_ORDER[b.hazardRating] -
                                        RATING_ORDER[a.hazardRating],
                                    )[0]
                                  : null;
                              const bgColor =
                                HAZARD_RATING_COLORS[baseRating] ?? "#BBBBBB";
                              const hasHazards = cellHazards.length > 0;
                              return (
                                <div
                                  key={intIdx}
                                  className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
                                  style={{
                                    aspectRatio: "1",
                                    backgroundColor: `${bgColor}${hasHazards ? "28" : "10"}`,
                                    border: `1px solid ${bgColor}30`,
                                    minHeight: 44,
                                  }}
                                  title={cellHazards
                                    .map((h) => `${h.risk} (${h.hazardRating})`)
                                    .join("\n")}
                                >
                                  {hasHazards && (
                                    <>
                                      <div
                                        className="w-2.5 h-2.5 rounded-full border-2 border-white/80 flex-shrink-0"
                                        style={{
                                          backgroundColor:
                                            HAZARD_RATING_COLORS[
                                              worstCell!.hazardRating
                                            ],
                                        }}
                                      />
                                      {cellHazards.length > 1 && (
                                        <span
                                          className="text-[9px] font-bold mt-0.5"
                                          style={{
                                            color: bgColor,
                                            fontFamily: "var(--font-mono)",
                                          }}
                                        >
                                          ×{cellHazards.length}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              );
                            },
                          )}
                        </div>
                      ),
                    )}

                    {/* X-axis intensity labels */}
                    <div className="flex gap-0.5 mt-1">
                      {Array.from({ length: mc.size }, (_, j) => j + 1).map(
                        (intIdx) => (
                          <div key={intIdx} className="flex-1 text-center">
                            <span
                              className="text-[9px] text-[#888] dark:text-[#555]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {mc.intensityLabels[intIdx]}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                    <div className="mt-1 text-center">
                      <span
                        className="text-[10px] text-[#BBBBBB] dark:text-[#444]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        INTENSITY →
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating legend */}
                <div className="flex flex-wrap gap-4 mt-5">
                  {ORDERED_RATINGS.map(
                    (r) =>
                      ratingDist[r] > 0 && (
                        <div key={r} className="flex items-center gap-1.5">
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{
                              backgroundColor: HAZARD_RATING_COLORS[r],
                            }}
                          />
                          <span className="text-[11px] text-[#888]">{r}</span>
                          <span
                            className="text-[11px] font-semibold text-[#555]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            ×{ratingDist[r]}
                          </span>
                        </div>
                      ),
                  )}
                </div>
              </div>

              {/* Hazard placement details */}
              <div className="mb-8">
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAA] mb-3"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Hazard Placement
                </p>
                <div className="space-y-1.5">
                  {sorted.map((r) => {
                    const cat = riskCategoryMap[r.risk] ?? "Other";
                    const catColor = CATEGORY_COLORS[cat] ?? "#6B7280";
                    const color = HAZARD_RATING_COLORS[r.hazardRating];
                    return (
                      <div
                        key={r.risk}
                        className="flex items-center gap-3 px-3 py-2.5 bg-[#F9F9F8] dark:bg-[#1A1A1A] border border-[#F0F0F0] dark:border-white/[0.05]"
                      >
                        <div
                          className="w-[3px] h-4 flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="flex-1 text-[13px] text-[#111] dark:text-[#E8E8E8]">
                          {r.risk}
                        </span>
                        <span
                          className="text-[10px] font-semibold uppercase px-1.5 py-0.5 flex-shrink-0"
                          style={{
                            color: catColor,
                            backgroundColor: `${catColor}12`,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {cat.slice(0, 5)}
                        </span>
                        <div
                          className="flex items-center gap-1.5 text-[11px] text-[#BBBBBB] flex-shrink-0"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          <span>I:{r.intensityScore}</span>
                          <span>×</span>
                          <span>F:{r.frequencyScore}</span>
                        </div>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 border flex-shrink-0"
                          style={{
                            color,
                            borderColor: `${color}40`,
                            backgroundColor: `${color}0D`,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {r.hazardRating.toUpperCase().replace(" ", "\u00A0")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommended measures */}
              {recommendedMeasures.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldPlus size={12} className="text-[#86BC25]" />
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAA]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Recommended Resilience Measures
                    </p>
                  </div>
                  <p className="text-[13px] text-[#888] dark:text-[#555] mb-4 leading-relaxed">
                    Based on your{" "}
                    {
                      results.filter(
                        (r) =>
                          RATING_ORDER[r.hazardRating] >= RATING_ORDER["High"],
                      ).length
                    }{" "}
                    High+ rated hazard
                    {results.filter(
                      (r) =>
                        RATING_ORDER[r.hazardRating] >= RATING_ORDER["High"],
                    ).length !== 1
                      ? "s"
                      : ""}
                    , these measures offer the highest resilience reduction
                    factors for your exposed categories.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recommendedMeasures.map((m) => {
                      const mCatColor =
                        MEASURE_CAT_COLORS[m.category] ?? "#6B7280";
                      return (
                        <div
                          key={m.id}
                          className="border border-[#E5E5E5] dark:border-white/[0.07] bg-white dark:bg-[#141414] p-4"
                          style={{ borderLeft: `3px solid ${mCatColor}` }}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-[13px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight">
                              {m.name}
                            </p>
                            <span
                              className="text-[12px] font-bold flex-shrink-0 px-1.5 py-0.5 border"
                              style={{
                                color: "#86BC25",
                                borderColor: "#86BC2540",
                                backgroundColor: "#86BC2508",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              -{(m.rrf * 100).toFixed(0)}%
                            </span>
                          </div>
                          <p className="text-[12px] text-[#888] dark:text-[#555] leading-relaxed">
                            {m.description}
                          </p>
                          <span
                            className="text-[10px] font-semibold uppercase tracking-[0.08em] mt-2 inline-block"
                            style={{
                              color: mCatColor,
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {m.category}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="border border-[#E5E5E5] dark:border-white/[0.07] px-4 py-6 text-center">
                  <ShieldPlus
                    size={20}
                    className="text-[#86BC25] mx-auto mb-2"
                  />
                  <p className="text-[13px] text-[#888] dark:text-[#555]">
                    No High+ rated hazards — your asset is within acceptable
                    risk appetite. Resilience measures are optional but
                    recommended.
                  </p>
                </div>
              )}
            </div>
          )}
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
    <div className="flex items-baseline gap-3">
      <span
        className="text-[17px] text-[#BBBBBB] dark:text-[#444] w-44 flex-shrink-0 leading-relaxed"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
      <div>
        <span
          className="text-[15px] font-medium text-[#111] dark:text-[#DDD]"
          style={color ? { color } : undefined}
        >
          {value}
        </span>
        {formula && (
          <span
            className="block text-[17px] text-[#BBBBBB] dark:text-[#444] mt-0.5"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {formula}
          </span>
        )}
      </div>
    </div>
  );
}
