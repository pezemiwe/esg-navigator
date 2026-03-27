import { useMemo, useCallback, useState } from "react";
import { ChevronDown, ChevronUp, Zap, X, AlertCircle } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { RESILIENCE_MEASURES } from "../../domain/physicalRisk/constants";
import {
  getSbraRrf,
  getSectorNameById,
} from "../../domain/physicalRisk/sbraTable";
import { getInherentVulnerability } from "../../domain/physicalRisk/vulnerabilityTable";
import {
  getExposureFactor,
  getAnnualProbability,
  buildMatrixConfig,
} from "../../domain/physicalRisk/constants";
import { assessHazard } from "../../domain/physicalRisk/engine";
import { ALL_21_RISKS } from "../../domain/physicalRisk/constants";
import type { ResilienceMode } from "../../domain/physicalRisk/types";

const MEASURE_CATEGORIES = [
  "Flood",
  "Electrical",
  "Wind",
  "Heat",
  "Water",
  "Fire",
  "Seismic",
  "Geotechnical",
  "Coastal",
  "Air Quality",
  "Operational",
  "Financial",
];

const CAT_COLORS: Record<string, string> = {
  Flood: "#3B82F6",
  Electrical: "#F59E0B",
  Wind: "#8B5CF6",
  Heat: "#EF4444",
  Water: "#06B6D4",
  Fire: "#DC143C",
  Seismic: "#10B981",
  Geotechnical: "#795548",
  Coastal: "#0891B2",
  "Air Quality": "#78909C",
  Operational: "#FF9800",
  Financial: "#4CAF50",
};

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

function Checkbox({ checked, color }: { checked: boolean; color?: string }) {
  const bg = checked ? color || "#86BC25" : "transparent";
  const border = checked ? "transparent" : "#D8D8D8";
  return (
    <div
      className="w-4 h-4 flex-shrink-0 border flex items-center justify-center"
      style={{ backgroundColor: bg, borderColor: border, borderWidth: 1 }}
    >
      {checked && (
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
  );
}

export default function ScreenResilienceMeasures() {
  const {
    config,
    mappedAssets,
    screening,
    resilienceMode,
    assetResilience,
    setResilienceMode,
    setAssetResilience,
  } = usePhysicalRiskStore();

  const [expandedAsset, setExpandedAsset] = useState<string | null>(
    mappedAssets[0]?.id ?? null,
  );
  const [expandedCat, setExpandedCat] = useState<string | null>("Flood");

  const sym =
    config.currency === "USD"
      ? "$"
      : config.currency === "NGN"
        ? "?"
        : config.currency;
  const sectorName = getSectorNameById(config.sectorId);
  const mc = useMemo(
    () => buildMatrixConfig(config.matrixSize),
    [config.matrixSize],
  );

  const getSbraRrfForAsset = useCallback(
    (assetType: string) => {
      const risks = screening.flatMap((s) => s.risks);
      const uniqueRisks = [...new Set(risks)];
      if (uniqueRisks.length === 0) return 0;
      const total = uniqueRisks.reduce(
        (sum, risk) =>
          sum + getSbraRrf(risk, assetType, sectorName, config.subsector),
        0,
      );
      return total / uniqueRisks.length;
    },
    [screening, sectorName, config.subsector],
  );

  const getAlraRrf = useCallback((measureIds: string[]) => {
    let combined = 0;
    for (const id of measureIds) {
      const m = RESILIENCE_MEASURES.find((rm) => rm.id === id);
      if (m) combined = 1 - (1 - combined) * (1 - m.rrf);
    }
    return Math.min(combined, 0.85);
  }, []);

  const getEffectiveRrf = useCallback(
    (assetId: string, assetType: string) => {
      if (resilienceMode === "SBRA") return getSbraRrfForAsset(assetType);
      const ar = assetResilience.find((a) => a.assetId === assetId);
      return ar ? getAlraRrf(ar.confirmedMeasures) : 0;
    },
    [resilienceMode, assetResilience, getSbraRrfForAsset, getAlraRrf],
  );

  const estimateEalSaved = useCallback(
    (
      assetId: string,
      assetType: string,
      assetValue: number,
      lat: number,
      lon: number,
    ) => {
      const assetScreening = screening.find((s) => s.assetId === assetId);
      if (!assetScreening) return 0;
      const rrf = getEffectiveRrf(assetId, assetType);
      let ealWithout = 0,
        ealWith = 0;
      for (const riskName of assetScreening.risks) {
        const riskDef = ALL_21_RISKS.find((r) => r.risk === riskName);
        if (!riskDef) continue;
        const { intensityScore, frequencyScore } = assessHazard(
          riskName,
          riskDef.id,
          lat,
          lon,
          mc,
        );
        const fLabel = mc.frequencyLabels[frequencyScore] ?? "Occasional";
        const rating =
          mc.matrix[`${intensityScore}-${frequencyScore}`] ?? "Medium";
        const ef = getExposureFactor(assetType, rating);
        const iv = getInherentVulnerability(riskName, assetType);
        const ap = getAnnualProbability(fLabel);
        ealWithout += assetValue * ef * iv * ap;
        ealWith += assetValue * ef * iv * (1 - rrf) * ap;
      }
      return ealWithout - ealWith;
    },
    [screening, getEffectiveRrf, mc],
  );

  const toggleMeasure = useCallback(
    (assetId: string, measureId: string) => {
      const existing = assetResilience.find((a) => a.assetId === assetId);
      if (existing) {
        const hasMeasure = existing.confirmedMeasures.includes(measureId);
        const newMeasures = hasMeasure
          ? existing.confirmedMeasures.filter((m) => m !== measureId)
          : [...existing.confirmedMeasures, measureId];
        setAssetResilience(
          assetResilience.map((a) =>
            a.assetId === assetId
              ? {
                  ...a,
                  confirmedMeasures: newMeasures,
                  effectiveRrf: getAlraRrf(newMeasures),
                  mode: "ALRA" as ResilienceMode,
                }
              : a,
          ),
        );
      } else {
        setAssetResilience([
          ...assetResilience,
          {
            assetId,
            mode: "ALRA",
            confirmedMeasures: [measureId],
            effectiveRrf: getAlraRrf([measureId]),
          },
        ]);
      }
    },
    [assetResilience, setAssetResilience, getAlraRrf],
  );

  const totalEalSaved = useMemo(
    () =>
      mappedAssets.reduce(
        (sum, a) =>
          sum +
          estimateEalSaved(a.id, a.assetType, a.value, a.latitude, a.longitude),
        0,
      ),
    [mappedAssets, estimateEalSaved],
  );
  const assetsWithMeasures = assetResilience.filter(
    (a) => a.confirmedMeasures.length > 0,
  ).length;
  const avgRrf = useMemo(() => {
    if (mappedAssets.length === 0) return 0;
    return (
      mappedAssets.reduce(
        (sum, a) => sum + getEffectiveRrf(a.id, a.assetType),
        0,
      ) / mappedAssets.length
    );
  }, [mappedAssets, getEffectiveRrf]);

  if (mappedAssets.length === 0) {
    return (
      <div className="flex items-start gap-3 m-6 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 text-amber-700 dark:text-amber-400 text-[13px]">
        <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
        No assets uploaded yet. Go back to the Asset Register first.
      </div>
    );
  }

  return (
    <div className="flex-1 flex bg-[#F4F4F2] dark:bg-[#0D0D0D] min-h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-[250px] flex-shrink-0 border-r border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111] px-5 py-8">
        <div
          className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#86BC25] mb-4"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Step 03
        </div>
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0] mb-2 leading-tight tracking-tight">
          Resilience
        </h2>
        <p className="text-[17px] text-[#888] dark:text-[#666] leading-relaxed mb-8">
          Confirm protection measures per asset. SBRA uses sector benchmarks;
          ALRA uses actual confirmed measures.
        </p>
        <div className="space-y-3 mb-8">
          {[
            { num: "01", label: "Select mode" },
            { num: "02", label: "Review RRFs" },
            { num: "03", label: "Confirm measures" },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-2.5">
              <span
                className="text-[17px] font-medium text-[#CCC] dark:text-[#444]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {item.num}
              </span>
              <span className="text-[17px] text-[#888] dark:text-[#666]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-auto pt-6 border-t border-[#E5E5E5] dark:border-white/[0.06] space-y-4">
          {[
            { label: "Mode", value: resilienceMode, green: true },
            { label: "Avg RRF", value: `${(avgRrf * 100).toFixed(1)}%` },
            {
              label: resilienceMode === "ALRA" ? "w/ Measures" : "Assets",
              value:
                resilienceMode === "ALRA"
                  ? assetsWithMeasures
                  : mappedAssets.length,
            },
            { label: "EAL Saved", value: fmt(totalEalSaved, sym), green: true },
          ].map((k) => (
            <div key={k.label}>
              <div
                className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555] mb-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {k.label}
              </div>
              <div
                className={`text-[15px] font-semibold leading-none ${k.green ? "text-[#86BC25]" : "text-[#111] dark:text-[#F0F0F0]"}`}
              >
                {k.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8">
        <div className="mb-7">
          <p
            className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555] mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Portfolio assessment
          </p>
          <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
            Resilience Measures
          </h1>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-2 mb-6">
          {(["SBRA", "ALRA"] as ResilienceMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setResilienceMode(m)}
              className={`px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] border transition-colors ${
                resilienceMode === m
                  ? "bg-[#86BC25] text-white border-[#86BC25]"
                  : "bg-white dark:bg-[#141414] text-[#666] dark:text-[#888] border-[#D8D8D8] dark:border-white/[0.08] hover:border-[#86BC25]"
              }`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {m === "SBRA"
                ? "SBRA � Sector Benchmark"
                : "ALRA � Actual Measures"}
            </button>
          ))}
        </div>

        <div className="px-3 py-2 bg-[#F9F9F8] dark:bg-[#141414] border border-[#D8D8D8] dark:border-white/[0.07] text-[13px] text-[#666] dark:text-[#888] mb-6">
          {resilienceMode === "SBRA"
            ? `SBRA: Pre-calibrated resilience factors for "${sectorName}" sector � no site data needed.`
            : "ALRA: Confirm physical protection measures per asset for greater accuracy. Each measure shows its Resilience Reduction Factor."}
        </div>

        {/* SBRA view */}
        {resilienceMode === "SBRA" && (
          <div className="border border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]">
            {mappedAssets.slice(0, 20).map((asset, idx) => {
              const rrf = getSbraRrfForAsset(asset.assetType);
              const saved = estimateEalSaved(
                asset.id,
                asset.assetType,
                asset.value,
                asset.latitude,
                asset.longitude,
              );
              return (
                <div
                  key={asset.id}
                  className={`flex items-center gap-4 px-4 py-3 border-b border-[#E5E5E5] dark:border-white/[0.06] last:border-b-0 ${idx % 2 === 0 ? "" : "bg-[#F9F9F8] dark:bg-[#141414]"}`}
                >
                  <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC] flex-1 truncate">
                    {asset.name}
                  </span>
                  <span className="text-[11px] text-[#888] dark:text-[#666] shrink-0">
                    {asset.assetType}
                  </span>
                  <span
                    className="text-[11px] font-semibold text-[#86BC25] shrink-0"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    RRF {(rrf * 100).toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-[#10B981] shrink-0">
                    {fmt(saved, sym)} saved
                  </span>
                </div>
              );
            })}
            {mappedAssets.length > 20 && (
              <div className="px-4 py-2 text-center text-[13px] text-[#888]">
                Showing 20 of {mappedAssets.length} assets
              </div>
            )}
          </div>
        )}

        {/* ALRA view */}
        {resilienceMode === "ALRA" && (
          <div className="space-y-2">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  const allIds = RESILIENCE_MEASURES.map((m) => m.id);
                  setAssetResilience(
                    mappedAssets.map((a) => ({
                      assetId: a.id,
                      mode: "ALRA" as ResilienceMode,
                      confirmedMeasures: allIds,
                      effectiveRrf: getAlraRrf(allIds),
                    })),
                  );
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#86BC25] text-white text-[11px] font-semibold uppercase tracking-[0.08em] border-0 cursor-pointer hover:bg-[#78AA1F]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Zap size={11} /> Apply All
              </button>
              <button
                onClick={() => setAssetResilience([])}
                className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#141414] text-[#888] text-[11px] font-semibold uppercase tracking-[0.08em] border border-[#D8D8D8] dark:border-white/[0.08] cursor-pointer hover:border-red-400 hover:text-red-500"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <X size={11} /> Clear All
              </button>
            </div>

            {mappedAssets.slice(0, 50).map((asset) => {
              const isExpanded = expandedAsset === asset.id;
              const ar = assetResilience.find((a) => a.assetId === asset.id);
              const confirmedCount = ar?.confirmedMeasures.length ?? 0;
              const effectiveRrf = getEffectiveRrf(asset.id, asset.assetType);
              const ealSaved = estimateEalSaved(
                asset.id,
                asset.assetType,
                asset.value,
                asset.latitude,
                asset.longitude,
              );

              return (
                <div
                  key={asset.id}
                  className="border border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]"
                >
                  <div
                    onClick={() =>
                      setExpandedAsset(isExpanded ? null : asset.id)
                    }
                    className="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-[#F9F9F8] dark:hover:bg-white/[0.02]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC] truncate">
                        {asset.name}
                      </span>
                      <span className="text-[11px] text-[#888] shrink-0">
                        {asset.assetType}
                      </span>
                      <span
                        className="text-[11px] px-2 py-0.5 border shrink-0"
                        style={{
                          fontFamily: "var(--font-mono)",
                          borderColor:
                            confirmedCount > 0 ? "#86BC25" : "#D8D8D8",
                          color: confirmedCount > 0 ? "#86BC25" : "#888",
                        }}
                      >
                        {confirmedCount}/30
                      </span>
                      <span
                        className="text-[11px] font-semibold text-[#86BC25] shrink-0"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        RRF {(effectiveRrf * 100).toFixed(1)}%
                      </span>
                      <span className="text-[11px] text-[#10B981] shrink-0">
                        {fmt(ealSaved, sym)} saved
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp size={14} className="text-[#888] shrink-0" />
                    ) : (
                      <ChevronDown size={14} className="text-[#888] shrink-0" />
                    )}
                  </div>

                  {isExpanded && (
                    <div className="border-t border-[#E5E5E5] dark:border-white/[0.06] px-4 py-4">
                      {MEASURE_CATEGORIES.map((cat) => {
                        const catMeasures = RESILIENCE_MEASURES.filter(
                          (m) => m.category === cat,
                        );
                        if (catMeasures.length === 0) return null;
                        const catColor = CAT_COLORS[cat] || "#888";
                        const isCatExpanded = expandedCat === cat;
                        const confirmedInCat = catMeasures.filter((m) =>
                          ar?.confirmedMeasures.includes(m.id),
                        ).length;

                        return (
                          <div
                            key={cat}
                            className="mb-2 border border-[#E5E5E5] dark:border-white/[0.06]"
                          >
                            <div
                              onClick={() =>
                                setExpandedCat(isCatExpanded ? null : cat)
                              }
                              className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer hover:bg-[#F4F4F2] dark:hover:bg-white/[0.02]"
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-1 h-4 flex-shrink-0"
                                  style={{ backgroundColor: catColor }}
                                />
                                <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">
                                  {cat}
                                </span>
                                <span
                                  className="text-[11px] px-1.5 py-0 border"
                                  style={{
                                    fontFamily: "var(--font-mono)",
                                    borderColor: catColor,
                                    color: catColor,
                                  }}
                                >
                                  {confirmedInCat}/{catMeasures.length}
                                </span>
                              </div>
                              {isCatExpanded ? (
                                <ChevronUp size={12} className="text-[#888]" />
                              ) : (
                                <ChevronDown
                                  size={12}
                                  className="text-[#888]"
                                />
                              )}
                            </div>
                            {isCatExpanded && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5 px-3 py-2 border-t border-[#E5E5E5] dark:border-white/[0.06]">
                                {catMeasures.map((measure) => {
                                  const isConfirmed =
                                    ar?.confirmedMeasures.includes(
                                      measure.id,
                                    ) ?? false;
                                  return (
                                    <div
                                      key={measure.id}
                                      onClick={() =>
                                        toggleMeasure(asset.id, measure.id)
                                      }
                                      className="flex items-start gap-2.5 p-2 cursor-pointer border transition-colors"
                                      style={{
                                        borderColor: isConfirmed
                                          ? catColor
                                          : "#E5E5E5",
                                        backgroundColor: isConfirmed
                                          ? `${catColor}0D`
                                          : "transparent",
                                      }}
                                    >
                                      <div className="mt-0.5">
                                        <Checkbox
                                          checked={isConfirmed}
                                          color={catColor}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-semibold text-[#333] dark:text-[#CCC]">
                                          {measure.name}
                                        </div>
                                        <div className="text-[11px] text-[#888] leading-snug">
                                          {measure.description}
                                        </div>
                                      </div>
                                      <span
                                        className="text-[10px] font-semibold shrink-0 px-1.5 py-0.5"
                                        style={{
                                          fontFamily: "var(--font-mono)",
                                          backgroundColor: `${catColor}20`,
                                          color: catColor,
                                        }}
                                      >
                                        {(measure.rrf * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
