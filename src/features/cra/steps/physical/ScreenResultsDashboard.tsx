import { useMemo, useState } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS,
  RATING_ORDER,
  RISK_APPETITE,
  buildMatrixConfig,
} from "../../domain/physicalRisk/constants";
import type {
  HazardRating,
  EnrichedResult,
} from "../../domain/physicalRisk/types";
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

function RatingPill({ rating }: { rating: HazardRating }) {
  const color = HAZARD_RATING_COLORS[rating] ?? "#888";
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 whitespace-nowrap"
      style={{
        fontFamily: "var(--font-mono)",
        backgroundColor: `${color}20`,
        color,
      }}
    >
      {rating}
    </span>
  );
}

export default function ScreenResultsDashboard() {
  const canvasRef = useHeroCanvas();
  const { config, mappedAssets, results, setActiveStep } =
    usePhysicalRiskStore();
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);

  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    NGN: "\u20A6",
    GHS: "\u20B5",
    KES: "KSh",
    ZAR: "R",
    GBP: "\u00A3",
    EUR: "\u20AC",
  };
  const sym = CURRENCY_SYMBOLS[config.currency] ?? config.currency;
  const rate = config.usdRate || 1;

  const totalPortfolioValue = useMemo(
    () => mappedAssets.reduce((s, a) => s + a.value, 0),
    [mappedAssets],
  );
  const totalEal = useMemo(
    () => results.reduce((s, r) => s + r.ealLocal, 0),
    [results],
  );
  const maxSsl = useMemo(
    () => Math.max(...results.map((r) => r.sslLocal), 0),
    [results],
  );
  const extremeCount = useMemo(
    () => results.filter((r) => r.hazardRating === "Extreme").length,
    [results],
  );

  const ratingDist = useMemo(() => {
    const dist: Record<string, number> = {};
    ORDERED_RATINGS.forEach((r) => (dist[r] = 0));
    results.forEach((r) => {
      dist[r.hazardRating] = (dist[r.hazardRating] || 0) + 1;
    });
    return dist;
  }, [results]);
  const maxBar = Math.max(...Object.values(ratingDist), 1);

  const matrix = useMemo(
    () => buildMatrixConfig(config.matrixSize),
    [config.matrixSize],
  );
  const matrixCells = useMemo(() => {
    const cells: Record<string, EnrichedResult[]> = {};
    results.forEach((r) => {
      const key = `${r.intensityScore}-${r.frequencyScore}`;
      if (!cells[key]) cells[key] = [];
      cells[key].push(r);
    });
    return cells;
  }, [results]);

  const uniqueAssets = useMemo(
    () => [...new Set(results.map((r) => r.asset))],
    [results],
  );
  const uniqueRisks = useMemo(
    () => [...new Set(results.map((r) => r.risk))],
    [results],
  );
  const heatMap = useMemo(() => {
    const map: Record<string, EnrichedResult> = {};
    results.forEach((r) => {
      map[`${r.asset}||${r.risk}`] = r;
    });
    return map;
  }, [results]);

  const assetAgg = useMemo(() => {
    const agg: Record<
      string,
      {
        ealLocal: number;
        ealUsd: number;
        sslLocal: number;
        maxRating: HazardRating;
        riskCount: number;
        value: number;
      }
    > = {};
    results.forEach((r) => {
      if (!agg[r.asset]) {
        const a = mappedAssets.find((a) => a.name === r.asset);
        agg[r.asset] = {
          ealLocal: 0,
          ealUsd: 0,
          sslLocal: 0,
          maxRating: "Negligible",
          riskCount: 0,
          value: a?.value ?? 0,
        };
      }
      agg[r.asset].ealLocal += r.ealLocal;
      agg[r.asset].ealUsd += r.ealUsd;
      agg[r.asset].sslLocal = Math.max(agg[r.asset].sslLocal, r.sslLocal);
      agg[r.asset].riskCount++;
      if (RATING_ORDER[r.hazardRating] > RATING_ORDER[agg[r.asset].maxRating])
        agg[r.asset].maxRating = r.hazardRating;
    });
    return Object.entries(agg).sort((a, b) => b[1].ealLocal - a[1].ealLocal);
  }, [results, mappedAssets]);

  const top15 = useMemo(
    () => [...results].sort((a, b) => b.ealLocal - a.ealLocal).slice(0, 15),
    [results],
  );
  const assetTypeAgg = useMemo(() => {
    const agg: Record<string, { count: number; ealTotal: number }> = {};
    results.forEach((r) => {
      if (!agg[r.assetType]) agg[r.assetType] = { count: 0, ealTotal: 0 };
      agg[r.assetType].count++;
      agg[r.assetType].ealTotal += r.ealLocal;
    });
    return Object.entries(agg)
      .sort((a, b) => b[1].ealTotal - a[1].ealTotal)
      .slice(0, 10);
  }, [results]);

  if (results.length === 0) {
    return (
      <div className="flex items-start gap-3 m-6 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 text-amber-700 dark:text-amber-400 text-[13px]">
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        No results yet. Run the assessment pipeline first.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ position: "fixed", top: 0, left: 0 }}
      />
      <style>{`
        @keyframes heroGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .saf-fu { animation: fadeUp 0.38s ease forwards; opacity: 0; }
        .saf-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #8A8A88;
          margin-bottom: 8px;
          font-family: var(--font-mono);
          transition: color 0.18s ease;
        }
        .saf-field:focus-within .saf-label { color: #86BC25; }
        .saf-input {
          width: 100%;
          background: white;
          border: 1.5px solid #E2E2E0;
          padding: 12px 14px;
          font-size: 15px;
          color: #1A1A1A;
          outline: none;
          border-radius: 8px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .dark .saf-input { background: #161616; border-color: rgba(255,255,255,0.08); color: #F0F0F0; }
        .saf-input:focus { border-color: #86BC25; box-shadow: 0 0 0 3px rgba(134,188,37,0.10); background: #FEFFFE; }
        .dark .saf-input:focus { background: #1A1A1A; }
        .saf-input::placeholder { color: #B0B0AE; }
        .saf-field { position: relative; transition: transform 0.18s ease; }
        .saf-field:focus-within { transform: translateY(-1px); }
        .saf-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #E8E8E6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .dark .saf-card { background: #141414; border-color: rgba(255,255,255,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .saf-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04); }
      `}</style>

      <div className="relative z-10 overflow-hidden bg-[#1A3C21] dark:bg-[#0F1F13]">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`,
          }}
        />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #86BC25 0%, transparent 70%)",
            animation: "heroGlow 6s ease-in-out infinite",
          }}
        />
        <div className="relative px-6 md:px-10 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 max-w-300 mx-auto">
            <div className="saf-fu" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#86BC25] flex items-center justify-center">
                  <MapPin size={13} className="text-white" />
                </div>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Step 05 of 06 &mdash; Results Dashboard
                </span>
              </div>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                Results Dashboard
              </h1>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                Portfolio KPIs, heat map, per-asset drill-downs, and risk
                distribution.
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
                  Total EAL
                </div>
                <div className="text-[30px] font-bold text-white leading-none">
                  {fmt(totalEal, sym)}
                </div>
              </div>
              {extremeCount > 0 && (
                <div className="text-right">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-400/60 mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Extreme
                  </div>
                  <div className="text-[30px] font-bold text-red-400 leading-none">
                    {extremeCount}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-0.75 bg-white/6">
          <div
            className="h-full bg-[#86BC25]"
            style={{
              width: "100%",
              transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex-1 flex">
        <div className="hidden lg:flex flex-col w-75 shrink-0 border-r border-[#D8D8D8] dark:border-white/7 bg-white dark:bg-[#111]">
          <div className="px-6 py-7 border-b border-[#EBEBEB] dark:border-white/6">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 05 / 06
            </div>
            <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
              Results
            </h2>
            <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
              Portfolio KPIs, heat map, per-asset drill-downs, and risk
              distribution.
            </p>
          </div>

          <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/6">
            <div className="space-y-1">
              {[
                { num: "01", label: "KPIs" },
                { num: "02", label: "Heat map" },
                { num: "03", label: "Drill-down" },
              ].map((item) => (
                <div
                  key={item.num}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm"
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 border border-[#E2E2E0] dark:border-white/8 bg-[#F4F4F2] dark:bg-white/4 rounded-md">
                    <span
                      className="text-[9px] font-bold text-[#C0C0BE] dark:text-[#555]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.num}
                    </span>
                  </div>
                  <span className="text-[13px] text-[#A0A09E] dark:text-[#555]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-5 flex-1">
            <div className="space-y-4">
              {[
                {
                  label: "Portfolio Value",
                  value: fmt(totalPortfolioValue, sym),
                },
                { label: "Total EAL", value: fmt(totalEal, sym), green: true },
                { label: "Max SSL", value: fmt(maxSsl, sym) },
                { label: "Extreme", value: extremeCount, red: true },
              ].map((k) => (
                <div key={k.label}>
                  <span
                    className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] block mb-0.5"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {k.label}
                  </span>
                  <div
                    className={`text-[18px] font-semibold leading-none ${"green" in k && k.green ? "text-[#86BC25]" : "red" in k && k.red ? "text-red-500" : "text-[#111] dark:text-[#F0F0F0]"}`}
                  >
                    {k.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 space-y-8 overflow-y-auto">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 05 of 06 — Results Dashboard
            </p>
            <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
              Results Dashboard
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "Total Portfolio Value",
                v: fmt(totalPortfolioValue, sym),
                sub: `$${fmt(totalPortfolioValue / rate, "")}`,
                c: "#3B82F6",
              },
              {
                label: "Expected Annual Loss",
                v: fmt(totalEal, sym),
                sub: `$${fmt(totalEal / rate, "")}`,
                c: "#EF4444",
              },
              {
                label: "Max Single Significant Loss",
                v: fmt(maxSsl, sym),
                sub: `$${fmt(maxSsl / rate, "")}`,
                c: "#F59E0B",
              },
              {
                label: "Extreme Ratings",
                v: extremeCount,
                sub: `${results.filter((r) => RATING_ORDER[r.hazardRating] >= 5).length} Extreme/VH`,
                c: "#DC143C",
              },
            ].map((k) => (
              <div
                key={k.label}
                className="p-4 border border-[#D8D8D8] dark:border-white/7 bg-white dark:bg-[#111]"
                style={{ borderTop: `2px solid ${k.c}` }}
              >
                <div
                  className="text-[11px] text-[#888] dark:text-[#555] uppercase tracking-[0.06em] mb-1 leading-tight"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {k.label}
                </div>
                <div className="text-[22px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none mb-0.5">
                  {k.v}
                </div>
                <div className="text-[11px] text-[#888]">{k.sub}</div>
              </div>
            ))}
          </div>

          {mappedAssets.some((a) => a.latitude !== 0 || a.longitude !== 0) && (
            <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={14} color="#3B82F6" />
                <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">
                  Portfolio Asset Locations
                </span>
                <span
                  className="text-[11px] text-[#86BC25] ml-auto"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {
                    mappedAssets.filter(
                      (a) => a.latitude !== 0 || a.longitude !== 0,
                    ).length
                  }{" "}
                  mapped
                </span>
              </div>
              <AssetMapView
                pins={mappedAssets
                  .filter((a) => a.latitude !== 0 || a.longitude !== 0)
                  .map((a) => {
                    const worstRating =
                      assetAgg.find(([name]) => name === a.name)?.[1]
                        ?.maxRating ?? "Negligible";
                    return {
                      lat: a.latitude,
                      lon: a.longitude,
                      label: a.name,
                      detail: `${a.assetType} - ${worstRating} - EAL: ${fmt(assetAgg.find(([n]) => n === a.name)?.[1]?.ealLocal ?? 0, sym)}`,
                    };
                  })}
                height={380}
              />
            </div>
          )}

          <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7">
            <div className="px-5 py-4 border-b border-[#E5E5E5] dark:border-white/6">
              <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">
                Asset Hazard Heat Map
              </span>
            </div>
            <div className="overflow-auto max-h-120">
              <table
                className="border-collapse"
                style={{ width: "max-content" }}
              >
                <thead className="sticky top-0 z-[2]">
                  <tr>
                    <th className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/7 px-3 py-2 sticky left-0 z-[3] text-left min-w-[140px]">
                      <span
                        className="text-[11px] font-semibold uppercase tracking-[0.06em] text-[#888]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Asset
                      </span>
                    </th>
                    {uniqueRisks.map((risk) => (
                      <th
                        key={risk}
                        title={risk}
                        className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/7 px-4 py-3 whitespace-nowrap min-w-[120px] text-center"
                      >
                        <span className="text-[12px] font-bold text-[#111] dark:text-[#F0F0F0]">
                          {risk}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uniqueAssets.slice(0, 60).map((assetName, rowIdx) => (
                    <tr
                      key={assetName}
                      className={
                        rowIdx % 2 === 0
                          ? "bg-white dark:bg-[#111]"
                          : "bg-[#F9F9F8] dark:bg-[#141414]"
                      }
                    >
                      <td
                        className={`sticky left-0 z-[1] border-r border-b border-[#D8D8D8] dark:border-white/7 px-3 py-1 text-[12px] font-semibold text-[#333] dark:text-[#CCC] truncate max-w-[138px] ${rowIdx % 2 === 0 ? "bg-white dark:bg-[#111]" : "bg-[#F9F9F8] dark:bg-[#141414]"}`}
                      >
                        {assetName}
                      </td>
                      {uniqueRisks.map((risk) => {
                        const r = heatMap[`${assetName}||${risk}`];
                        if (!r)
                          return (
                            <td
                              key={risk}
                              className="border-r border-b border-[#E5E5E5] dark:border-white/5 w-10 h-10"
                            />
                          );
                        let color =
                          HAZARD_RATING_COLORS[r.hazardRating] ?? "#888";
                        if (
                          r.hazardRating === "High" ||
                          r.hazardRating === "Very High" ||
                          r.hazardRating === "Extreme"
                        ) {
                          color = "#FF0000";
                        }
                        return (
                          <td
                            key={risk}
                            title={`${assetName} - ${risk}: ${r.hazardRating}`}
                            className="border-r border-b border-[#E5E5E5] dark:border-white/5 w-10 h-10 cursor-pointer"
                            style={{ backgroundColor: `${color}88` }}
                          />
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {uniqueAssets.length > 60 && (
                <div className="px-4 py-2 text-center text-[13px] text-[#888] border-t border-[#E5E5E5]">
                  Showing 60 of {uniqueAssets.length} assets
                </div>
              )}
            </div>
            <div className="px-5 py-3 border-t border-[#E5E5E5] dark:border-white/6 flex flex-wrap gap-2">
              {ORDERED_RATINGS.map((r) => {
                const color = HAZARD_RATING_COLORS[r];
                return (
                  <span
                    key={r}
                    className="text-[10px] font-semibold px-2 py-0.5"
                    style={{
                      fontFamily: "var(--font-mono)",
                      backgroundColor: `${color}22`,
                      color,
                    }}
                  >
                    {r}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-4"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Rating Distribution
              </div>
              <div className="space-y-2">
                {ORDERED_RATINGS.map((rating) => (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-[12px] font-semibold w-20 text-right shrink-0 text-[#555] dark:text-[#999]">
                      {rating}
                    </span>
                    <div className="flex-1 h-6 bg-[#F4F4F2] dark:bg-white/4">
                      <div
                        className="h-6 transition-all duration-500"
                        style={{
                          width: `${Math.max((ratingDist[rating] / maxBar) * 100, 1)}%`,
                          backgroundColor: HAZARD_RATING_COLORS[rating],
                        }}
                      />
                    </div>
                    <span
                      className="text-[12px] font-semibold w-6 shrink-0 text-[#333] dark:text-[#CCC]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {ratingDist[rating]}
                    </span>
                    <span className="text-[10px] text-[#888] w-16 shrink-0">
                      {RISK_APPETITE[rating]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-4"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Risk Matrix ({config.matrixSize} x {config.matrixSize})
              </div>
              <div className="overflow-auto">
                <table className="border-collapse text-[12px] w-full">
                  <thead>
                    <tr>
                      <th className="bg-[#F4F4F2] dark:bg-[#141414] border border-[#D8D8D8] dark:border-white/7 px-2 py-1 text-left text-[10px] font-semibold text-[#666]">
                        Intensity \\ Freq
                      </th>
                      {Array.from(
                        { length: config.matrixSize },
                        (_, j) => j + 1,
                      ).map((f) => (
                        <th
                          key={f}
                          className="bg-[#F4F4F2] dark:bg-[#141414] border border-[#D8D8D8] dark:border-white/7 px-2 py-1 text-center font-semibold text-[#666] whitespace-nowrap"
                        >
                          {matrix.frequencyLabels[f] || `F${f}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(
                      { length: config.matrixSize },
                      (_, i) => config.matrixSize - i,
                    ).map((intensity) => (
                      <tr key={intensity}>
                        <td className="bg-[#F4F4F2] dark:bg-[#141414] border border-[#D8D8D8] dark:border-white/7 px-2 py-1 font-semibold text-[#666] whitespace-nowrap">
                          {matrix.intensityLabels[intensity] || `I${intensity}`}
                        </td>
                        {Array.from(
                          { length: config.matrixSize },
                          (_, j) => j + 1,
                        ).map((freq) => {
                          const key = `${intensity}-${freq}`;
                          const rating = matrix.matrix[key] || "Negligible";
                          const count = matrixCells[key]?.length || 0;
                          const color = HAZARD_RATING_COLORS[rating] || "#888";
                          return (
                            <td
                              key={freq}
                              title={count ? `${count} risk(s)` : rating}
                              className="border border-[#D8D8D8] dark:border-white/7 text-center min-w-[60px] py-4 text-[14px]"
                              style={{
                                backgroundColor: `${color}${rating === "High" || rating === "Very High" || rating === "Extreme" ? (count > 0 ? "AA" : "60") : count > 0 ? "88" : "28"}`,
                                fontWeight: count > 0 ? 700 : 400,
                              }}
                            >
                              {count > 0 ? count : ""}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7">
            <div className="px-5 py-4 border-b border-[#E5E5E5] dark:border-white/6">
              <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">
                Per-Asset Drill-Down (sorted by EAL)
              </span>
            </div>
            <div className="divide-y divide-[#E5E5E5] dark:divide-white/6">
              {assetAgg.slice(0, 30).map(([assetName, agg]) => {
                const isExpanded = expandedAsset === assetName;
                const assetResults = results
                  .filter((r) => r.asset === assetName)
                  .sort((a, b) => b.ealLocal - a.ealLocal);
                const headerColor =
                  HAZARD_RATING_COLORS[agg.maxRating] ?? "#888";
                return (
                  <div key={assetName}>
                    <div
                      onClick={() =>
                        setExpandedAsset(isExpanded ? null : assetName)
                      }
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F9F9F8] dark:hover:bg-white/2"
                      style={{
                        borderLeft: `3px solid ${isExpanded ? headerColor : "transparent"}`,
                      }}
                    >
                      <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC] flex-1 truncate">
                        {assetName}
                      </span>
                      <RatingPill rating={agg.maxRating} />
                      <span className="text-[11px] text-[#888] shrink-0">
                        val {fmt(agg.value, sym)}
                      </span>
                      <span className="text-[11px] font-semibold text-red-500 shrink-0">
                        EAL {fmt(agg.ealLocal, sym)}
                      </span>
                      <span className="text-[11px] text-[#F59E0B] shrink-0">
                        SSL {fmt(agg.sslLocal, sym)}
                      </span>
                      <span className="text-[11px] text-[#888] shrink-0">
                        {agg.riskCount}r
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={13} className="text-[#888] shrink-0" />
                      ) : (
                        <ChevronDown
                          size={13}
                          className="text-[#888] shrink-0"
                        />
                      )}
                    </div>
                    {isExpanded && (
                      <div className="overflow-auto max-h-70 border-t border-[#E5E5E5] dark:border-white/6">
                        <table className="w-full border-collapse text-[12px]">
                          <thead className="sticky top-0 bg-[#F4F4F2] dark:bg-[#141414]">
                            <tr>
                              {[
                                "Risk",
                                "Rating",
                                "EF",
                                "IV",
                                "RRF",
                                "SSL",
                                "EAL",
                                "Response",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-3 py-1.5 text-left text-[11px] font-semibold text-[#888] border-b border-[#D8D8D8] dark:border-white/7"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {assetResults.map((r, i) => (
                              <tr
                                key={i}
                                className={
                                  i % 2 === 0
                                    ? ""
                                    : "bg-[#F9F9F8] dark:bg-[#141414]/50"
                                }
                              >
                                <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 truncate max-w-[110px]">
                                  {r.risk}
                                </td>
                                <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5">
                                  <RatingPill rating={r.hazardRating} />
                                </td>
                                <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-[#888]">
                                  {(r.exposureFactor * 100).toFixed(0)}%
                                </td>
                                <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-[#888]">
                                  {(r.inherentVulnerability * 100).toFixed(0)}%
                                </td>
                                <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-[#888]">
                                  {(r.sbraRrf * 100).toFixed(0)}%
                                </td>
                                <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5">
                                  {fmt(r.sslLocal, sym)}
                                </td>
                                <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 font-semibold">
                                  {fmt(r.ealLocal, sym)}
                                </td>
                                <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-[#888] truncate max-w-[110px]">
                                  {r.responseStrategy}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
              {assetAgg.length > 30 && (
                <div className="px-4 py-2 text-center text-[13px] text-[#888]">
                  Showing 30 of {assetAgg.length} assets
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-3 bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7">
              <div className="px-5 py-4 border-b border-[#E5E5E5] dark:border-white/6">
                <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">
                  Top 15 Risks by EAL
                </span>
              </div>
              <div className="overflow-auto max-h-100">
                <table className="w-full border-collapse text-[12px]">
                  <thead className="sticky top-0 bg-[#F4F4F2] dark:bg-[#141414]">
                    <tr>
                      {[
                        "#",
                        "Asset",
                        "Risk",
                        "Rating",
                        "Score",
                        "EAL",
                        "EAL ($)",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-3 py-1.5 text-left text-[11px] font-semibold text-[#888] border-b border-[#D8D8D8] dark:border-white/7 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {top15.map((r, i) => (
                      <tr
                        key={i}
                        className={
                          i % 2 === 0 ? "" : "bg-[#F9F9F8] dark:bg-[#141414]/50"
                        }
                      >
                        <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-[#888]">
                          {i + 1}
                        </td>
                        <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 truncate max-w-[100px]">
                          {r.asset}
                        </td>
                        <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 truncate max-w-[100px]">
                          {r.risk}
                        </td>
                        <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5">
                          <RatingPill rating={r.hazardRating} />
                        </td>
                        <td
                          className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {r.riskScoreNorm}
                        </td>
                        <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 font-semibold">
                          {fmt(r.ealLocal, sym)}
                        </td>
                        <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-[#888]">
                          {fmt(r.ealUsd, "$")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="md:col-span-2 bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-4"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                EAL by Asset Type
              </div>
              <div className="space-y-3">
                {assetTypeAgg.map(([type, agg]) => {
                  const maxEal = assetTypeAgg[0]?.[1]?.ealTotal || 1;
                  return (
                    <div key={type}>
                      <div className="flex justify-between mb-1">
                        <span className="text-[12px] text-[#555] dark:text-[#999] truncate max-w-[120px]">
                          {type}
                        </span>
                        <span
                          className="text-[11px] font-semibold text-[#333] dark:text-[#CCC]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {fmt(agg.ealTotal, sym)}
                        </span>
                      </div>
                      <div className="h-2 bg-[#F4F4F2] dark:bg-white/4">
                        <div
                          className="h-2 bg-[#3B82F6] transition-all duration-500"
                          style={{ width: `${(agg.ealTotal / maxEal) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-10 mb-2">
            <button
              onClick={() => setActiveStep(5)}
              disabled={results.length === 0}
              className="w-full flex items-center justify-center gap-3 rounded-xl text-[15px] font-bold py-4 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
              style={{
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.06em",
                background:
                  results.length > 0
                    ? "linear-gradient(135deg, #1A3C21 0%, #2D5A35 100%)"
                    : "#1A3C21",
                color: "white",
                boxShadow:
                  results.length > 0
                    ? "0 8px 25px rgba(26,60,33,0.25)"
                    : "none",
              }}
            >
              <span>EXPORT REPORT</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
