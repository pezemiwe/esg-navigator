import React, { useCallback, useState } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import {
  Play,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  ArrowRight,
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

const PIPELINE: { label: string; key: string }[] = [
  { label: "Risk Identification", key: "identify" },
  { label: "Asset Screening", key: "screen" },
  { label: "Hazard Assessment", key: "hazard" },
  { label: "Exposure Factors", key: "exposure" },
  { label: "Vulnerability Scoring", key: "vulnerability" },
  { label: "Risk Estimation (SSL / EAL)", key: "estimation" },
  { label: "Heat Map Generation", key: "heatmap" },
  { label: "Response Strategy", key: "response" },
  { label: "Monitoring Plan", key: "monitoring" },
];

function scoreToRating(score: number): HazardRating {
  if (score >= 84) return "Extreme";
  if (score >= 67) return "Very High";
  if (score >= 50) return "High";
  if (score >= 34) return "Medium";
  if (score >= 17) return "Low";
  return "Negligible";
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

export default function ScreenRunAssessment() {
  const canvasRef = useHeroCanvas();
  const {
    config,
    mappedAssets,
    screening,
    resilienceMode,
    assetResilience,
    results,
    isRunning,
    progress,
    error,
    pipelineStages,
    setHazardResults,
    setResults,
    setIsRunning,
    setActiveStep,
    setProgress,
    setError,
    setPipelineStages,
    setPipelineStage,
  } = usePhysicalRiskStore();

  const [useLocalOnly, setUseLocalOnly] = useState(false);
  const [currentTask, setCurrentTask] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerIdRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const mc = buildMatrixConfig(config.matrixSize);
  const sym =
    config.currency === "USD"
      ? "$"
      : config.currency === "NGN"
        ? "?"
        : config.currency;
  const totalCombinations = screening.reduce((s, e) => s + e.risks.length, 0);

  type StageStatus = "pending" | "running" | "done" | "error";
  type StageEntry = { label: string; status: StageStatus };

  const updateStage = useCallback(
    (stages: StageEntry[], key: string, status: StageStatus): StageEntry[] => {
      const idx = PIPELINE.findIndex((p) => p.key === key);
      if (idx < 0) return stages;
      const next = [...stages];
      next[idx] = { ...next[idx], status };
      return next;
    },
    [],
  );

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setError(null);
    setElapsed(0);
    const start = Date.now();
    const tid = setInterval(
      () => setElapsed(Math.round((Date.now() - start) / 1000)),
      500,
    );
    timerIdRef.current = tid;

    let stages: StageEntry[] = PIPELINE.map((p) => ({
      label: p.label,
      status: "pending" as StageStatus,
    }));
    setPipelineStages(stages);

    try {
      stages = updateStage(stages, "identify", "running");
      setPipelineStages([...stages]);
      setPipelineStage("Risk Identification");
      setCurrentTask("Identifying risks from screening matrix...");
      await delay(100);
      stages = updateStage(stages, "identify", "done");

      stages = updateStage(stages, "screen", "running");
      setPipelineStages([...stages]);
      setPipelineStage("Asset Screening");
      setCurrentTask("Building asset � hazard combinations...");
      const inputs: HazardInput[] = [];
      for (const entry of screening) {
        const asset = mappedAssets.find(
          (a) => a.id === entry.assetId || a.name === entry.assetName,
        );
        if (!asset) continue;
        for (const risk of entry.risks) {
          inputs.push({
            asset: asset.name,
            assetType: asset.assetType,
            risk,
            latitude: asset.latitude,
            longitude: asset.longitude,
            country: config.country,
          });
        }
      }
      await delay(100);
      stages = updateStage(stages, "screen", "done");

      stages = updateStage(stages, "hazard", "running");
      setPipelineStages([...stages]);
      setPipelineStage("Hazard Assessment");
      setCurrentTask(
        `Querying climate APIs for ${inputs.length} combinations...`,
      );
      let outputs;
      if (useLocalOnly) {
        outputs = assessHazardsLocally(inputs, config.matrixSize);
        setProgress(33);
      } else {
        outputs = await assessHazardsWithClimateApis(
          inputs,
          config.matrixSize,
          (done, total, current) => {
            setProgress(Math.round((done / total) * 33));
            setCurrentTask(current);
          },
        );
      }

      const hrResults: HazardResult[] = outputs.map((o) => {
        const asset = mappedAssets.find((a) => a.name === o.asset);
        return {
          asset: o.asset,
          risk: o.risk,
          latitude: asset?.latitude ?? 0,
          longitude: asset?.longitude ?? 0,
          intensityScore: o.intensityScore,
          intensityLabel: o.intensityLabel,
          frequencyScore: o.frequencyScore,
          frequencyLabel: o.frequencyLabel,
          hazardRating: o.hazardRating,
          matrixSize: `${mc.size}x${mc.size}`,
        };
      });
      setHazardResults(hrResults);
      stages = updateStage(stages, "hazard", "done");

      stages = updateStage(stages, "exposure", "running");
      setPipelineStages([...stages]);
      setPipelineStage("Exposure Factors");
      setCurrentTask("Applying exposure factor tables...");
      setProgress(40);

      stages = updateStage(stages, "vulnerability", "running");
      setPipelineStages([...stages]);
      setPipelineStage("Vulnerability Scoring");
      setCurrentTask(
        "Computing inherent vulnerability & resilience reduction...",
      );
      setProgress(50);

      stages = updateStage(stages, "estimation", "running");
      setPipelineStages([...stages]);
      setPipelineStage("Risk Estimation");
      setCurrentTask("Calculating SSL and EAL for each combination...");

      const sectorName = getSectorNameById(config.sectorId);
      const rate = config.usdRate || 1;
      const enriched: EnrichedResult[] = [];

      for (let i = 0; i < hrResults.length; i++) {
        const hr = hrResults[i];
        const asset = mappedAssets.find((a) => a.name === hr.asset);
        if (!asset) continue;
        const assetValueLocal = asset.value,
          assetValueUsd = assetValueLocal / rate;
        const ef = getExposureFactor(asset.assetType, hr.hazardRating);
        const exposedValueLocal = assetValueLocal * ef,
          exposedValueUsd = exposedValueLocal / rate;
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
        const sslLocal = assetValueLocal * ef * netV,
          sslUsd = sslLocal / rate;
        const ap = getAnnualProbability(hr.frequencyLabel);
        const ealLocal = sslLocal * ap,
          ealUsd = ealLocal / rate;
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
        enriched.push({
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
        });
        if (i % 50 === 0)
          setProgress(50 + Math.round((i / hrResults.length) * 30));
      }

      stages = updateStage(stages, "exposure", "done");
      stages = updateStage(stages, "vulnerability", "done");
      stages = updateStage(stages, "estimation", "done");
      stages = updateStage(stages, "heatmap", "running");
      setPipelineStages([...stages]);
      setPipelineStage("Heat Map");
      setCurrentTask("Building heat map...");
      setProgress(85);
      await delay(100);
      stages = updateStage(stages, "heatmap", "done");
      stages = updateStage(stages, "response", "running");
      setPipelineStages([...stages]);
      setProgress(90);
      await delay(50);
      stages = updateStage(stages, "response", "done");
      stages = updateStage(stages, "monitoring", "running");
      setPipelineStages([...stages]);
      setProgress(95);
      await delay(50);
      stages = updateStage(stages, "monitoring", "done");

      setResults(enriched);
      setProgress(100);
      setPipelineStage("Complete");
      setCurrentTask(
        `Pipeline complete � ${enriched.length} results enriched.`,
      );
      setPipelineStages([...stages]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      const errStages = pipelineStages.map((s) =>
        s.status === "running" ? { ...s, status: "error" as const } : s,
      );
      setPipelineStages(errStages);
    }
    clearInterval(tid);
    timerIdRef.current = null;
    setIsRunning(false);
  }, [
    config,
    mappedAssets,
    screening,
    resilienceMode,
    assetResilience,
    useLocalOnly,
    mc.size,
    pipelineStages,
    updateStage,
    setHazardResults,
    setResults,
    setIsRunning,
    setProgress,
    setError,
    setPipelineStage,
    setPipelineStages,
  ]);

  const isComplete = results.length > 0 && !isRunning;
  const ratingDist: { rating: HazardRating; count: number }[] = (
    [
      "Extreme",
      "Very High",
      "High",
      "Medium",
      "Low",
      "Negligible",
    ] as HazardRating[]
  ).map((r) => ({
    rating: r,
    count: results.filter((x) => x.hazardRating === r).length,
  }));
  const barMax = Math.max(...ratingDist.map((d) => d.count), 1);

  if (screening.length === 0 || mappedAssets.length === 0) {
    return (
      <div className="flex items-start gap-3 m-6 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 text-amber-700 dark:text-amber-400 text-[13px]">
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        Complete Asset Register and Hazard Screening before running.
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
                  <Play size={13} className="text-white" />
                </div>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Step 04 of 06 &mdash; Run Assessment
                </span>
              </div>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                Run Physical Risk Assessment
              </h1>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                Execute the 9-step pipeline for {mappedAssets.length} assets ×{" "}
                {totalCombinations} hazard pairs.
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
                  Combinations
                </div>
                <div className="text-[30px] font-bold text-white leading-none">
                  {totalCombinations}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-0.75 bg-white/6">
          <div
            className="h-full bg-[#86BC25]"
            style={{
              width: `${isComplete ? 100 : isRunning ? 50 : 0}%`,
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
              Step 04 / 06
            </div>
            <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
              Run Assessment
            </h2>
            <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
              Execute the 9-step pipeline — from climate API queries through
              response strategies.
            </p>
          </div>

          <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/6">
            <div className="space-y-1">
              {[
                { num: "01", label: "Configure run" },
                { num: "02", label: "Pipeline stages" },
                { num: "03", label: "Review results" },
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
                { label: "Assets", value: mappedAssets.length },
                { label: "Combinations", value: totalCombinations },
                { label: "Mode", value: resilienceMode, green: true },
                {
                  label: "Matrix",
                  value: `${config.matrixSize}×${config.matrixSize}`,
                },
              ].map((k) => (
                <div key={k.label}>
                  <span
                    className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] block mb-0.5"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {k.label}
                  </span>
                  <div
                    className={`text-[18px] font-semibold leading-none ${"green" in k && k.green ? "text-[#86BC25]" : "text-[#111] dark:text-[#F0F0F0]"}`}
                  >
                    {k.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 overflow-y-auto">
          <div className="mb-7">
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 04 of 06 — Run Assessment
            </p>
            <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
              Run Physical Risk Assessment
            </h1>
          </div>

          <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5 mb-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={handleRun}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#86BC25] text-white text-[13px] font-semibold uppercase tracking-[0.08em] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#78AA1F] transition-colors border-0 cursor-pointer"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Play size={14} />
                {isRunning
                  ? "Running..."
                  : isComplete
                    ? "Re-Run"
                    : "Run Assessment"}
              </button>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => !isRunning && setUseLocalOnly(!useLocalOnly)}
                  className={`w-4 h-4 shrink-0 border flex items-center justify-center ${useLocalOnly ? "bg-[#86BC25] border-transparent" : "bg-white dark:bg-[#111] border-[#D8D8D8]"}`}
                >
                  {useLocalOnly && (
                    <svg width="9" height="7" viewBox="0 0 10 8" fill="none">
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
                <span className="text-[13px] text-[#666] dark:text-[#888]">
                  Local engine only (no API calls)
                </span>
              </label>

              {elapsed > 0 && (
                <span
                  className="text-[13px] text-[#888] ml-auto"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {elapsed}s elapsed
                </span>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 text-[13px]">
                <AlertCircle size={12} className="shrink-0" />
                {error}
              </div>
            )}

            {isRunning && (
              <div className="mt-3">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[13px] text-[#666] dark:text-[#888] truncate pr-4">
                    {currentTask}
                  </span>
                  <span
                    className="text-[13px] font-semibold text-[#111] dark:text-[#F0F0F0] shrink-0"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {progress}%
                  </span>
                </div>
                <div className="h-1.5 bg-[#E5E5E5] dark:bg-white/7">
                  <div
                    className="h-1.5 bg-[#86BC25] transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {pipelineStages.length > 0 && (
            <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5 mb-6">
              <div
                className="text-[11px] font-semibold uppercase tracking-widest text-[#888] dark:text-[#555] mb-4"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Pipeline Progress
              </div>
              <div className="space-y-1">
                {pipelineStages.map((stage, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-3 px-3 py-2 ${stage.status === "running" ? "bg-blue-50 dark:bg-blue-900/10" : stage.status === "done" ? "bg-green-50 dark:bg-green-900/10" : stage.status === "error" ? "bg-red-50 dark:bg-red-900/10" : ""}`}
                  >
                    <div className="w-4 shrink-0 flex justify-center">
                      {stage.status === "done" && (
                        <CheckCircle size={14} color="#10B981" />
                      )}
                      {stage.status === "running" && (
                        <Loader
                          size={14}
                          color="#3B82F6"
                          className="animate-spin"
                        />
                      )}
                      {stage.status === "error" && (
                        <XCircle size={14} color="#EF4444" />
                      )}
                      {stage.status === "pending" && (
                        <div className="w-2 h-2 rounded-full bg-[#D8D8D8] dark:bg-white/15" />
                      )}
                    </div>
                    <span
                      className={`text-[13px] flex-1 ${stage.status === "running" ? "font-semibold text-[#111] dark:text-[#F0F0F0]" : "text-[#666] dark:text-[#888]"}`}
                    >
                      {idx + 1}. {stage.label}
                    </span>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-[0.06em] px-2 py-0.5"
                      style={{
                        fontFamily: "var(--font-mono)",
                        backgroundColor:
                          stage.status === "done"
                            ? "#10B98120"
                            : stage.status === "running"
                              ? "#3B82F620"
                              : stage.status === "error"
                                ? "#EF444420"
                                : "#88888820",
                        color:
                          stage.status === "done"
                            ? "#10B981"
                            : stage.status === "running"
                              ? "#3B82F6"
                              : stage.status === "error"
                                ? "#EF4444"
                                : "#888",
                      }}
                    >
                      {stage.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isComplete && (
            <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5">
              <div
                className="text-[11px] font-semibold uppercase tracking-widest text-[#86BC25] mb-4"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Assessment Complete � {results.length} results
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  {
                    label: "Total EAL",
                    value: fmt(
                      results.reduce((s, r) => s + r.ealLocal, 0),
                      sym,
                    ),
                    color: "#EF4444",
                  },
                  {
                    label: "Max SSL",
                    value: fmt(
                      Math.max(...results.map((r) => r.sslLocal), 0),
                      sym,
                    ),
                    color: "#F59E0B",
                  },
                  {
                    label: "Extreme",
                    value: results.filter((r) => r.hazardRating === "Extreme")
                      .length,
                    color: "#DC143C",
                  },
                  {
                    label: "Avg Net Vuln",
                    value: `${((results.reduce((s, r) => s + r.sbraNetVulnerability, 0) / results.length) * 100).toFixed(1)}%`,
                    color: "#8B5CF6",
                  },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="p-3 border border-[#E5E5E5] dark:border-white/6"
                    style={{ backgroundColor: `${k.color}12` }}
                  >
                    <div
                      className="text-[11px] text-[#888] uppercase tracking-[0.06em] mb-1"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {k.label}
                    </div>
                    <div
                      className="text-[20px] font-semibold"
                      style={{ color: k.color }}
                    >
                      {k.value}
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Rating Distribution
              </div>
              <div className="space-y-1.5">
                {ratingDist.map((d) => (
                  <div key={d.rating} className="flex items-center gap-3">
                    <span className="text-[12px] text-[#666] dark:text-[#888] w-20 text-right shrink-0">
                      {d.rating}
                    </span>
                    <div className="flex-1 h-4 bg-[#F4F4F2] dark:bg-white/4">
                      <div
                        className="h-4 transition-all duration-500"
                        style={{
                          width: `${(d.count / barMax) * 100}%`,
                          backgroundColor:
                            HAZARD_RATING_COLORS[d.rating] ?? "#888",
                        }}
                      />
                    </div>
                    <span
                      className="text-[12px] font-semibold w-7 shrink-0"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 mb-2">
            <button
              onClick={() => setActiveStep(4)}
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
              <span>VIEW RESULTS</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
