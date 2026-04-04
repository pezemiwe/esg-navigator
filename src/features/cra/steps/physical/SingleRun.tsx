import React, { useCallback, useState } from "react";
import { Play, CheckCircle, XCircle, Loader, Shield } from "lucide-react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
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
  const canvasRef = useHeroCanvas();

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

      {/* ── Hero header ── */}
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
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 max-w-300 mx-auto">
            <div className="saf-fu" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#86BC25] flex items-center justify-center">
                  <Play size={13} className="text-white" />
                </div>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Step 05 of 07 &mdash; Run Assessment
                </span>
              </div>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                {done
                  ? "Assessment Complete"
                  : isRunning
                    ? "Assessing Hazards\u2026"
                    : "Run Assessment"}
              </h1>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                {done
                  ? `${results.length} hazard${results.length !== 1 ? "s" : ""} assessed for ${asset?.name ?? ""}.`
                  : `${hazardCount} hazard${hazardCount !== 1 ? "s" : ""} queued for ${asset?.name ?? ""}.`}
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
                  {done ? "Assessed" : "Hazards"}
                </div>
                <div className="text-[30px] font-bold text-white leading-none">
                  {done ? results.length : hazardCount}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-0.75 bg-white/6">
          <div
            className="h-full bg-[#86BC25]"
            style={{
              width: `${done ? 100 : isRunning ? progress : 0}%`,
              transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        </div>
      </div>

      {/* ── Sidebar + content ── */}
      <div className="relative z-10 flex-1 flex">
        {/* Sidebar */}
        <div className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[#D8D8D8] dark:border-white/7 bg-white dark:bg-[#111]">
          <div className="px-5 py-6 border-b border-[#EBEBEB] dark:border-white/6">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 05 / 07
            </div>
            <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight mb-1">
              Run Assessment
            </h2>
            <p className="text-[12px] text-[#888] dark:text-[#666] leading-relaxed">
              Execute the climate API pipeline for this asset and compute risk
              scores.
            </p>
          </div>
          <div className="px-5 py-4 border-b border-[#EBEBEB] dark:border-white/6">
            <div className="space-y-0.5">
              {[
                { num: "01", label: "Configure run" },
                { num: "02", label: "Pipeline stages" },
                { num: "03", label: "Review results" },
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
              {(
                [
                  { label: "Asset", value: asset?.name ?? "\u2014" },
                  { label: "Hazards", value: String(hazardCount) },
                  { label: "Mode", value: resilienceMode, green: true },
                  {
                    label: "Matrix",
                    value: `${config.matrixSize}\u00D7${config.matrixSize}`,
                  },
                ] as Array<{ label: string; value: string; green?: boolean }>
              ).map((k) => (
                <div key={k.label}>
                  <span
                    className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] block mb-0.5"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {k.label}
                  </span>
                  <div
                    className={`text-[14px] font-semibold leading-none truncate ${k.green ? "text-[#86BC25]" : "text-[#111] dark:text-[#F0F0F0]"}`}
                  >
                    {k.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 px-6 md:px-8 xl:pr-12 py-7 overflow-y-auto">
          <div className="max-w-[620px]">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-5"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 05 of 07 \u2014 Run Assessment
            </p>

            {/* Always-visible selected hazards */}
            <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5 mb-5">
              <div
                className="text-[11px] font-semibold uppercase tracking-widest text-[#888] dark:text-[#555] mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Selected Hazards &mdash; {hazardCount} selected
              </div>
              {hazardCount > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {hazardList.map((risk) => {
                    const cat = ALL_21_RISKS.find(
                      (r) => r.risk === risk,
                    )?.category;
                    const color =
                      cat === "Meteorological"
                        ? "#F59E0B"
                        : cat === "Hydrological"
                          ? "#3B82F6"
                          : cat === "Climatological"
                            ? "#10B981"
                            : "#8B5CF6";
                    return (
                      <span
                        key={risk}
                        className="text-[11px] font-medium px-2.5 py-1 border"
                        style={{
                          color,
                          backgroundColor: `${color}10`,
                          borderColor: `${color}30`,
                        }}
                      >
                        {risk}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[12px] text-amber-600 dark:text-amber-400">
                  No hazards selected. Go back to select at least one.
                </p>
              )}
            </div>

            {/* Pre-run state */}
            {!isRunning && !done && (
              <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5">
                {hazardCount === 0 && (
                  <div className="flex items-start gap-2.5 px-3 py-2.5 mb-4 bg-amber-500/10 border border-amber-500/20">
                    <p className="text-[12px] text-amber-700 dark:text-amber-400">
                      No hazards selected. Go back and select at least one.
                    </p>
                  </div>
                )}
                <label className="flex items-center gap-3 mb-5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={useLocalOnly}
                    onChange={(e) => setUseLocalOnly(e.target.checked)}
                    className="w-4 h-4 accent-primary-500 cursor-pointer"
                  />
                  <span className="text-[13px] text-[#555] dark:text-[#AAA]">
                    Use local engine only (no external API calls)
                  </span>
                </label>
                <button
                  onClick={handleRun}
                  disabled={hazardCount === 0}
                  className="flex items-center gap-2 bg-[#86BC25] text-white text-[14px] font-bold px-7 py-3 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  style={
                    hazardCount > 0
                      ? { boxShadow: "0 2px 14px rgba(134,188,37,0.30)" }
                      : undefined
                  }
                >
                  <Play size={15} />
                  Run Assessment
                </button>
              </div>
            )}

            {/* Running state */}
            {isRunning && (
              <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] font-semibold text-[#111] dark:text-[#F0F0F0]">
                    Running pipeline\u2026
                  </p>
                  <span className="text-[12px] text-[#888]">
                    {progress}% &middot; {elapsed}s
                  </span>
                </div>
                <div className="h-1 bg-[#F4F4F2] dark:bg-white/6 mb-5 overflow-hidden">
                  <div
                    className="h-full bg-[#86BC25] transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div>
                  {apis.map((api) => (
                    <div
                      key={api.key}
                      className="flex items-center gap-3 py-2.5 border-b border-[#F4F4F2] dark:border-white/4 last:border-b-0"
                    >
                      <StatusDot status={api.status} />
                      <span
                        className={`text-[12px] ${api.status === "fetching" ? "font-semibold text-[#111] dark:text-[#F0F0F0]" : "text-[#888]"}`}
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

            {/* Done state */}
            {done && !isRunning && (
              <div>
                {error && (
                  <div className="flex items-start gap-2.5 px-4 py-3 mb-4 bg-amber-500/10 border border-amber-500/20">
                    <p className="text-[13px] text-amber-700 dark:text-amber-400">
                      {error}
                    </p>
                  </div>
                )}
                {topResult && (
                  <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5 mb-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#888] dark:text-[#555] mb-3">
                      Top Risk
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[17px] font-bold text-[#111] dark:text-[#F0F0F0] mb-0.5">
                          {topResult.risk}
                        </p>
                        <p className="text-[12px] text-[#888]">
                          {topResult.intensityLabel} intensity &middot;{" "}
                          {topResult.frequencyLabel}
                        </p>
                      </div>
                      <span
                        className="px-3 py-1.5 text-[12px] font-bold border"
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
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Hazards", value: results.length.toString() },
                    {
                      label: "Total EAL",
                      value: fmt(
                        results.reduce((s, r) => s + r.ealLocal, 0),
                        sym,
                      ),
                    },
                    {
                      label: "Max SSL",
                      value: fmt(
                        Math.max(...results.map((r) => r.sslLocal), 0),
                        sym,
                      ),
                    },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-3 text-center"
                    >
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#888] dark:text-[#555] mb-1">
                        {label}
                      </p>
                      <p className="text-[16px] font-extrabold text-[#111] dark:text-[#F0F0F0]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
