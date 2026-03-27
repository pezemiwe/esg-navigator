import React, { useCallback, useState } from "react";
import {
  Play,
  Check,
  CheckCircle,
  XCircle,
  Loader,
  Shield,
  Info,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS,
  buildMatrixConfig,
  getExposureFactor,
  getAnnualProbability,
  RESPONSE_RULES,
  MONITORING_CONFIG,
  RATING_ORDER,
  ALL_21_RISKS,
} from "../../domain/physicalRisk/constants";
import { getInherentVulnerability } from "../../domain/physicalRisk/vulnerabilityTable";
import {
  getSbraRrf,
  getSectorNameById,
} from "../../domain/physicalRisk/sbraTable";
import type {
  HazardResult,
  HazardRating,
  EnrichedResult,
} from "../../domain/physicalRisk/types";
import {
  assessHazardsWithClimateApis,
  assessHazardsLocally,
} from "../../services/climateApis";
import type { HazardInput } from "../../services/climateApis";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
type StageStatus = "queued" | "fetching" | "complete" | "failed" | "fallback";
interface ApiStage {
  label: string;
  key: string;
  status: StageStatus;
}

const INITIAL_APIS: ApiStage[] = [
  { label: "Nominatim Geocoding", key: "nominatim", status: "complete" },
  { label: "OpenTopoData Elevation (SRTM)", key: "srtm", status: "complete" },
  { label: "NASA POWER Climate Data", key: "nasa", status: "queued" },
  {
    label: "Open-Meteo Historical Weather",
    key: "openmeteo",
    status: "queued",
  },
  { label: "USGS Earthquake Catalogue", key: "usgs", status: "queued" },
  { label: "NOAA NGDC Volcano / Tsunami", key: "noaa", status: "queued" },
  { label: "WRI Aqueduct Water Risk", key: "wri", status: "queued" },
  { label: "Exposure Factor Lookup", key: "ef", status: "queued" },
  { label: "Vulnerability Matrix", key: "vuln", status: "queued" },
  { label: "Risk Estimation (SSL / EAL)", key: "estimation", status: "queued" },
  { label: "Response & Monitoring", key: "response", status: "queued" },
];

function scoreToRating(score: number): HazardRating {
  if (score >= 84) return "Extreme";
  if (score >= 67) return "Very High";
  if (score >= 50) return "High";
  if (score >= 34) return "Medium";
  if (score >= 17) return "Low";
  return "Negligible";
}

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

function StatusDot({ status }: { status: StageStatus }) {
  if (status === "queued")
    return (
      <div className="w-4 h-4 rounded-full border-2 border-[#4B5563] flex-shrink-0" />
    );
  if (status === "fetching")
    return (
      <Loader size={16} className="text-amber-500 animate-spin flex-shrink-0" />
    );
  if (status === "complete")
    return <CheckCircle size={16} className="text-green-500 flex-shrink-0" />;
  if (status === "failed")
    return <XCircle size={16} className="text-red-500 flex-shrink-0" />;
  return <Shield size={16} className="text-amber-500 flex-shrink-0" />;
}

export default function SingleRun() {
  const {
    config,
    mappedAssets,
    screening,
    identifiedRisks,
    resilienceMode,
    assetResilience,
    results,
    isRunning,
    progress,
    error,
    setHazardResults,
    setResults,
    setIsRunning,
    setProgress,
    setError,
  } = usePhysicalRiskStore();

  const [useLocalOnly, setUseLocalOnly] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [apis, setApis] = useState<ApiStage[]>(INITIAL_APIS);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const mc = buildMatrixConfig(config.matrixSize);
  const sym = config.currency === "USD" ? "$" : "\u20A6";
  const asset = mappedAssets[0];
  const assetScreening = screening.find((s) => s.assetId === asset?.id);
  const hazardList = assetScreening?.risks ?? identifiedRisks;
  const hazardCount = hazardList.length;

  const updateApi = useCallback((key: string, status: StageStatus) => {
    setApis((prev) => prev.map((a) => (a.key === key ? { ...a, status } : a)));
  }, []);

  const handleRun = useCallback(async () => {
    if (!asset || hazardCount === 0) return;
    setIsRunning(true);
    setProgress(0);
    setError(null);
    setElapsed(0);
    setApis(INITIAL_APIS);
    const start = Date.now();
    const tid = setInterval(
      () => setElapsed(Math.round((Date.now() - start) / 1000)),
      500,
    );
    timerRef.current = tid;
    try {
      const inputs: HazardInput[] = hazardList.map((risk) => ({
        asset: asset.name,
        assetType: asset.assetType,
        risk,
        latitude: asset.latitude,
        longitude: asset.longitude,
        country: config.country,
      }));
      const sourceToApiKeys = (src: string): string[] => {
        const keys: string[] = [];
        const s = src.toLowerCase();
        if (s.includes("nasa")) keys.push("nasa");
        if (s.includes("open-meteo")) keys.push("openmeteo");
        if (s.includes("usgs")) keys.push("usgs");
        if (s.includes("noaa")) keys.push("noaa");
        if (s.includes("wri") || s.includes("aqueduct")) keys.push("wri");
        if (
          s.includes("srtm") ||
          s.includes("elevation") ||
          s.includes("opentopodata")
        )
          keys.push("srtm");
        if (s.includes("nominatim") || s.includes("coastal"))
          keys.push("nominatim");
        return keys;
      };
      const isFallbackSource = (src: string) =>
        /fallback|local engine|geo-spatial|latitude zone|haversine|not coastal/i.test(
          src,
        );
      const apiHits = new Set<string>();
      updateApi("nasa", "fetching");
      updateApi("openmeteo", "fetching");
      updateApi("usgs", "fetching");
      updateApi("noaa", "fetching");
      updateApi("wri", "fetching");
      let outputs;
      if (useLocalOnly) {
        outputs = assessHazardsLocally(inputs, config.matrixSize);
        ["nasa", "openmeteo", "usgs", "noaa", "wri"].forEach((k) =>
          updateApi(k, "fallback"),
        );
      } else {
        outputs = await assessHazardsWithClimateApis(
          inputs,
          config.matrixSize,
          (done, total) => setProgress(Math.round((done / total) * 50)),
          (_risk, source) => {
            const keys = sourceToApiKeys(source);
            const fallback = isFallbackSource(source);
            keys.forEach((k) => {
              if (!apiHits.has(k)) {
                apiHits.add(k);
                updateApi(k, fallback ? "fallback" : "complete");
              }
            });
          },
        );
        ["nasa", "openmeteo", "usgs", "noaa", "wri"].forEach((k) => {
          if (!apiHits.has(k)) updateApi(k, "complete");
        });
      }
      setProgress(55);
      const hrResults: HazardResult[] = outputs.map((o) => ({
        asset: o.asset,
        risk: o.risk,
        latitude: asset.latitude,
        longitude: asset.longitude,
        intensityScore: o.intensityScore,
        intensityLabel: o.intensityLabel,
        frequencyScore: o.frequencyScore,
        frequencyLabel: o.frequencyLabel,
        hazardRating: o.hazardRating,
        matrixSize: `${mc.size}x${mc.size}`,
      }));
      setHazardResults(hrResults);
      updateApi("ef", "fetching");
      await delay(80);
      updateApi("ef", "complete");
      setProgress(65);
      updateApi("vuln", "fetching");
      await delay(80);
      updateApi("vuln", "complete");
      setProgress(75);
      updateApi("estimation", "fetching");
      const sectorName = getSectorNameById(config.sectorId);
      const rate = config.usdRate || 1;
      const enriched: EnrichedResult[] = hrResults.map((hr) => {
        const assetValueLocal = asset.value;
        const assetValueUsd = assetValueLocal / rate;
        const ef = getExposureFactor(asset.assetType, hr.hazardRating);
        const exposedValueLocal = assetValueLocal * ef;
        const exposedValueUsd = exposedValueLocal / rate;
        const iv = getInherentVulnerability(hr.risk, asset.assetType);
        let rrf: number;
        if (resilienceMode === "ALRA") {
          const ar = assetResilience.find((a) => a.assetId === asset.id);
          rrf =
            ar && ar.confirmedMeasures.length > 0
              ? ar.effectiveRrf
              : getSbraRrf(
                  hr.risk,
                  asset.assetType,
                  sectorName,
                  config.subsector,
                );
        } else {
          rrf = getSbraRrf(
            hr.risk,
            asset.assetType,
            sectorName,
            config.subsector,
          );
        }
        const netV = iv * (1 - rrf);
        const sslLocal = assetValueLocal * ef * netV;
        const sslUsd = sslLocal / rate;
        const ap = getAnnualProbability(hr.frequencyLabel);
        const ealLocal = sslLocal * ap;
        const ealUsd = ealLocal / rate;
        const riskScoreNorm = Math.round(
          (RATING_ORDER[hr.hazardRating] / 6) * 100,
        );
        const response = RESPONSE_RULES[hr.hazardRating];
        const residualScore = Math.round(
          riskScoreNorm * (1 - response.reductionPct / 100),
        );
        const monitoring = MONITORING_CONFIG[hr.risk] ?? {
          kpi: "General monitoring",
          frequency: "Quarterly",
        };
        return {
          ...hr,
          assetType: asset.assetType,
          assetValueLocal,
          assetValueUsd,
          exposureFactor: ef,
          exposedValueLocal,
          exposedValueUsd,
          inherentVulnerability: iv,
          sbraRrf: rrf,
          sbraNetVulnerability: netV,
          annualProbability: ap,
          riskScoreNorm,
          sslLocal,
          sslUsd,
          ealLocal,
          ealUsd,
          responseStrategy: response.strategy,
          responsePriority: response.priority,
          responseTimeframe: response.timeframe,
          residualReductionPct: response.reductionPct,
          residualRiskScore: residualScore,
          residualRiskRating: scoreToRating(residualScore),
          monitoringKpi: monitoring.kpi,
          monitoringFrequency: monitoring.frequency,
          monitoringTrigger: monitoring.trigger ?? "",
          monitoringDataSource: monitoring.dataSource ?? "",
          monitoringOwnerRole: monitoring.ownerRole ?? "",
          dataSource: useLocalOnly ? "Local engine" : "Climate APIs",
        };
      });
      updateApi("estimation", "complete");
      setProgress(90);
      updateApi("response", "fetching");
      await delay(60);
      updateApi("response", "complete");
      setResults(enriched);
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    clearInterval(tid);
    timerRef.current = null;
    setIsRunning(false);
  }, [
    asset,
    hazardCount,
    hazardList,
    config,
    resilienceMode,
    assetResilience,
    useLocalOnly,
    mc.size,
    updateApi,
    setHazardResults,
    setResults,
    setIsRunning,
    setProgress,
    setError,
  ]);

  const done = results.length > 0;
  const topResult = done
    ? [...results].sort(
        (a, b) => RATING_ORDER[b.hazardRating] - RATING_ORDER[a.hazardRating],
      )[0]
    : null;

  return (
    <div className="flex-1 flex bg-[#F4F4F2] dark:bg-[#0D0D0D] min-h-[calc(100vh-140px)]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.38s ease forwards; opacity: 0; }
      `}</style>

      {/* Left rail */}
      <div className="hidden lg:flex flex-col w-[300px] flex-shrink-0 border-r border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]">
        {/* Panel 1 – Header */}
        <div className="px-6 py-7 border-b border-[#EBEBEB] dark:border-white/[0.06]">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Step 05 / 07
          </div>
          <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
            Run Assessment
          </h2>
          <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
            Fetch climate data from real APIs and calculate risk scores for each
            hazard.
          </p>
        </div>

        {/* Panel 2 – Hazard count / top result */}
        <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/[0.06]">
          <span
            className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] block mb-1"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {done ? "Assessed" : "Hazards"}
          </span>
          <div className="text-[26px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none">
            {done ? results.length : hazardCount}
          </div>
          {done && topResult && (
            <div className="mt-2">
              <span
                className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] block mb-0.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Top Risk
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: HAZARD_RATING_COLORS[topResult.hazardRating] }}
              >
                {topResult.hazardRating}
              </span>
            </div>
          )}
        </div>

        {/* Panel 3 – Pipeline checklist */}
        <div className="px-6 py-5 flex-1">
          <div className="space-y-1">
            {[
              { num: "01", label: "API Data Fetch" },
              { num: "02", label: "Hazard Scoring" },
              { num: "03", label: "EAL Calculation" },
              { num: "04", label: "Response Plan" },
            ].map((item, i) => {
              const stepDone = done || (isRunning && progress >= (i + 1) * 25);
              const active =
                isRunning && Math.floor(progress / 25) === i && !stepDone;
              return (
                <div
                  key={item.num}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 ${
                    active ? "bg-[#F7FAF0] dark:bg-[#86BC25]/[0.06]" : ""
                  }`}
                >
                  <div
                    className={`w-5 h-5 flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${
                      stepDone
                        ? "bg-[#86BC25] border-[#86BC25]"
                        : active
                          ? "border-[#86BC25]"
                          : "border-[#DDD] dark:border-white/[0.10]"
                    }`}
                  >
                    {stepDone ? (
                      <Check size={10} className="text-white" strokeWidth={3} />
                    ) : (
                      <span
                        className={`text-[9px] font-bold ${
                          active
                            ? "text-[#86BC25]"
                            : "text-[#CCC] dark:text-[#555]"
                        }`}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {item.num}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[13px] transition-colors duration-200 ${
                      stepDone
                        ? "text-[#86BC25] font-medium"
                        : active
                          ? "text-[#111] dark:text-[#EEE] font-medium"
                          : "text-[#AAA] dark:text-[#555]"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 overflow-y-auto">
        <div className="max-w-[820px]">
          {!isRunning && !done && (
            <div>
              <div className="fu mb-7" style={{ animationDelay: "0ms" }}>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#888] dark:text-[#555] mb-2"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Step 05 — Run
                </p>
                <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
                  Run Assessment
                </h1>
              </div>

              {hazardCount === 0 ? (
                <div className="flex items-start gap-2.5 px-4 py-3 mt-2 mb-6 bg-amber-500/10 border border-amber-500/20 text-left">
                  <p className="text-[13px] text-amber-700 dark:text-amber-400">
                    No hazards selected. Go back and select at least one hazard.
                  </p>
                </div>
              ) : (
                <>
                  {/* Queued hazards grouped by category */}
                  <div className="mb-8 fu" style={{ animationDelay: "60ms" }}>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] mb-4"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {hazardCount} hazard{hazardCount !== 1 ? "s" : ""} queued
                      · {asset?.name}
                    </p>
                    {[
                      "Meteorological",
                      "Hydrological",
                      "Climatological",
                      "Geophysical",
                    ].map((cat) => {
                      const CAT_COLOR: Record<string, string> = {
                        Meteorological: "#F59E0B",
                        Hydrological: "#3B82F6",
                        Climatological: "#10B981",
                        Geophysical: "#8B5CF6",
                      };
                      const color = CAT_COLOR[cat];
                      const catRisks = hazardList.filter(
                        (r) =>
                          ALL_21_RISKS.find((x) => x.risk === r)?.category ===
                          cat,
                      );
                      if (catRisks.length === 0) return null;
                      return (
                        <div key={cat} className="mb-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: color }}
                            />
                            <span
                              className="text-[10px] font-semibold uppercase tracking-[0.10em]"
                              style={{ color, fontFamily: "var(--font-mono)" }}
                            >
                              {cat}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {catRisks.map((risk) => (
                              <span
                                key={risk}
                                className="text-[12px] px-2.5 py-1 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/[0.07] text-[#333] dark:text-[#CCC]"
                                style={{ borderLeft: `2px solid ${color}` }}
                              >
                                {risk}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* External data sources */}
                  {!useLocalOnly && (
                    <div
                      className="mb-8 fu"
                      style={{ animationDelay: "120ms" }}
                    >
                      <p
                        className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] mb-3"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        External data sources
                      </p>
                      <div className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/[0.07] overflow-hidden">
                        {[
                          {
                            name: "NASA POWER Climate Data",
                            tag: "Climate",
                            color: "#3B82F6",
                            description:
                              "Provides 30-year spatially-averaged climate parameters — temperature extremes, precipitation, humidity and wind speed — at the asset's exact coordinates.",
                          },
                          {
                            name: "Open-Meteo Historical Weather",
                            tag: "Weather",
                            color: "#06B6D4",
                            description:
                              "Delivers daily historical records of wind gusts, high-rainfall events and heat-wave days to quantify hazard frequency and intensity scores.",
                          },
                          {
                            name: "USGS Earthquake Catalogue",
                            tag: "Seismic",
                            color: "#6366F1",
                            description:
                              "Queries seismic event records within 300 km of the asset to derive earthquake frequency scores and expected magnitude bands.",
                          },
                          {
                            name: "NOAA NGDC Volcano / Tsunami",
                            tag: "Geological",
                            color: "#EF4444",
                            description:
                              "Retrieves historical volcanic eruption and tsunami records in the region to score geophysical hazard probability and impact severity.",
                          },
                          {
                            name: "WRI Aqueduct Water Risk",
                            tag: "Water",
                            color: "#0EA5E9",
                            description:
                              "Maps baseline water stress, riverine flood frequency and seasonal drought severity at the asset's 5-arc-minute grid cell.",
                          },
                        ].map((src, i, arr) => (
                          <div
                            key={src.name}
                            className={`flex items-start gap-3.5 px-4 py-3.5 ${
                              i < arr.length - 1
                                ? "border-b border-[#F5F5F5] dark:border-white/[0.04]"
                                : ""
                            }`}
                          >
                            <div
                              className="w-[3px] self-stretch flex-shrink-0"
                              style={{ backgroundColor: src.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-[13px] font-semibold text-[#111] dark:text-[#F0F0F0]">
                                  {src.name}
                                </span>
                                <span
                                  className="text-[9px] font-semibold uppercase tracking-[0.08em] px-1.5 py-0.5"
                                  style={{
                                    color: src.color,
                                    backgroundColor: `${src.color}18`,
                                    fontFamily: "var(--font-mono)",
                                  }}
                                >
                                  {src.tag}
                                </span>
                              </div>
                              <p className="text-[12px] text-[#888] dark:text-[#555] leading-relaxed">
                                {src.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p
                        className="text-[11px] text-[#BBBBBB] dark:text-[#444] mt-2"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Nominatim geocoding + SRTM elevation were already
                        fetched during geo-confirm.
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Local engine toggle */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  onClick={() => setUseLocalOnly((v) => !v)}
                  className={`w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-colors cursor-pointer ${
                    useLocalOnly
                      ? "bg-[#86BC25] border-[#86BC25]"
                      : "bg-white dark:bg-[#1A1A1A] border-[#D8D8D8] dark:border-white/[0.15]"
                  }`}
                >
                  {useLocalOnly && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path
                        d="M1 3L3.5 5.5L8 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                  Use local engine only (no external API calls)
                </span>
              </div>
              <button
                onClick={handleRun}
                disabled={hazardCount === 0}
                className="flex items-center gap-2 bg-primary-500 text-white text-[15px] font-bold px-8 py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                style={
                  hazardCount > 0
                    ? { boxShadow: "0 2px 16px rgba(134,188,37,0.35)" }
                    : undefined
                }
              >
                <Play size={16} />
                Run Assessment
              </button>
            </div>
          )}

          {isRunning && (
            <div className="py-8">
              <h1 className="text-[26px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mb-1">
                Assessing Hazards
              </h1>
              <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mb-6">
                {progress}% complete &middot; {elapsed}s elapsed
              </p>
              <div className="h-0.5 rounded-full bg-black/[0.08] dark:bg-white/[0.08] mb-8 overflow-hidden">
                <div
                  className="h-full bg-primary-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div>
                {apis.map((api) => (
                  <div
                    key={api.key}
                    className="flex items-center gap-3 py-3 border-b border-black/[0.04] dark:border-white/[0.04] last:border-b-0"
                  >
                    <StatusDot status={api.status} />
                    <span
                      className={`text-[13px] ${api.status === "fetching" ? "font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]" : "text-[#6E6E73] dark:text-[#86868B]"}`}
                    >
                      {api.label}
                    </span>
                    {api.status === "fallback" && (
                      <span className="text-[11px] text-amber-500 ml-auto">
                        fallback
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {done && !isRunning && (
            <div>
              <div className="mb-7">
                <h1 className="text-[26px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mb-1">
                  Assessment Complete
                </h1>
                <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B]">
                  {results.length} hazards assessed for{" "}
                  <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {asset?.name}
                  </span>
                </p>
              </div>

              {error && (
                <div className="flex items-start gap-2.5 px-4 py-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <p className="text-[13px] text-amber-700 dark:text-amber-400">
                    {error}
                  </p>
                </div>
              )}

              {topResult && (
                <div className="pra-surface p-5 mb-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-3">
                    Top Risk
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[18px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-0.5">
                        {topResult.risk}
                      </p>
                      <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                        {topResult.intensityLabel} intensity &middot;{" "}
                        {topResult.frequencyLabel}
                      </p>
                    </div>
                    <span
                      className="px-3.5 py-1.5 rounded-full text-[13px] font-bold border"
                      style={{
                        color: HAZARD_RATING_COLORS[topResult.hazardRating],
                        backgroundColor: `${HAZARD_RATING_COLORS[topResult.hazardRating]}18`,
                        borderColor: `${HAZARD_RATING_COLORS[topResult.hazardRating]}40`,
                      }}
                    >
                      {topResult.hazardRating}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3 mb-6">
                {(
                  [
                    {
                      label: "Hazards",
                      value: results.length.toString(),
                      tooltip: "",
                    },
                    {
                      label: "Total EAL",
                      value: fmt(
                        results.reduce((s, r) => s + r.ealLocal, 0),
                        sym,
                      ),
                      tooltip:
                        "Expected Annual Loss — the probability-weighted annual financial loss across all hazards. Calculated as SSL × Annual Probability of occurrence for each hazard, then summed.",
                    },
                    {
                      label: "Max SSL",
                      value: fmt(
                        Math.max(...results.map((r) => r.sslLocal), 0),
                        sym,
                      ),
                      tooltip:
                        "Single Scenario Loss — the worst-case estimated financial loss if the highest-rated hazard event occurs. Calculated as Asset Value × Exposure Factor × Net Vulnerability.",
                    },
                  ] as { label: string; value: string; tooltip: string }[]
                ).map(({ label, value, tooltip }) => (
                  <div key={label} className="pra-surface p-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B]">
                        {label}
                      </p>
                      {tooltip && (
                        <span className="relative group inline-flex cursor-help">
                          <Info
                            size={9}
                            className="text-[#BBBBBB] dark:text-[#444]"
                          />
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[200px] px-2.5 py-1.5 bg-[#111] dark:bg-[#FAFAFA] text-white dark:text-[#111] text-[11px] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 pointer-events-none text-left">
                            {tooltip}
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-[16px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Per-hazard results */}
              <div className="fu" style={{ animationDelay: "80ms" }}>
                <p
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAA] mb-3"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  All hazards
                </p>
                <div className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/[0.07] overflow-hidden">
                  {[...results]
                    .sort(
                      (a, b) =>
                        RATING_ORDER[b.hazardRating] -
                        RATING_ORDER[a.hazardRating],
                    )
                    .map((r, i, arr) => (
                      <div
                        key={r.risk}
                        className={`flex items-center gap-3 px-4 py-3 ${
                          i < arr.length - 1
                            ? "border-b border-[#F5F5F5] dark:border-white/[0.04]"
                            : ""
                        }`}
                      >
                        <div
                          className="w-[3px] h-4 flex-shrink-0"
                          style={{
                            backgroundColor:
                              HAZARD_RATING_COLORS[r.hazardRating],
                          }}
                        />
                        <span className="flex-1 text-[13px] text-[#111] dark:text-[#E8E8E8]">
                          {r.risk}
                        </span>
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 border flex-shrink-0"
                          style={{
                            color: HAZARD_RATING_COLORS[r.hazardRating],
                            borderColor: `${HAZARD_RATING_COLORS[r.hazardRating]}40`,
                            backgroundColor: `${HAZARD_RATING_COLORS[r.hazardRating]}0D`,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {r.hazardRating.toUpperCase().replace(" ", "\u00A0")}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span
                            className="text-[11px] text-[#AAA]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            EAL
                          </span>
                          <span
                            className="text-[12px] font-semibold"
                            style={{
                              color: "#86BC25",
                              fontFamily: "var(--font-mono)",
                            }}
                          >
                            {fmt(r.ealLocal, sym)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
