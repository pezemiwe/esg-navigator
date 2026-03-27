import os

base = r"c:\Users\pezemiwe\Documents\gcb-esg-navigator\src\features\cra\steps\physical"

# ─── SingleRun ────────────────────────────────────────────────────────────────
singlerun = """import React, { useCallback, useState } from "react";
import { Play, CheckCircle, XCircle, Loader, Shield } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS, buildMatrixConfig, getExposureFactor,
  getAnnualProbability, RESPONSE_RULES, MONITORING_CONFIG, RATING_ORDER,
} from "../../domain/physicalRisk/constants";
import { getInherentVulnerability } from "../../domain/physicalRisk/vulnerabilityTable";
import { getSbraRrf, getSectorNameById } from "../../domain/physicalRisk/sbraTable";
import type { HazardResult, HazardRating, EnrichedResult } from "../../domain/physicalRisk/types";
import { assessHazardsWithClimateApis, assessHazardsLocally } from "../../services/climateApis";
import type { HazardInput } from "../../services/climateApis";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

type StageStatus = "queued" | "fetching" | "complete" | "failed" | "fallback";
interface ApiStage { label: string; key: string; status: StageStatus }

const INITIAL_APIS: ApiStage[] = [
  { label: "Nominatim Geocoding", key: "nominatim", status: "complete" },
  { label: "OpenTopoData Elevation (SRTM)", key: "srtm", status: "complete" },
  { label: "NASA POWER Climate Data", key: "nasa", status: "queued" },
  { label: "Open-Meteo Historical Weather", key: "openmeteo", status: "queued" },
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
  v >= 1e9 ? `${sym}${(v / 1e9).toFixed(2)}B`
  : v >= 1e6 ? `${sym}${(v / 1e6).toFixed(2)}M`
  : v >= 1e3 ? `${sym}${(v / 1e3).toFixed(1)}K`
  : `${sym}${v.toFixed(0)}`;

function StatusDot({ status }: { status: StageStatus }) {
  if (status === "queued") return <div className="w-4 h-4 rounded-full border-2 border-[#4B5563] flex-shrink-0" />;
  if (status === "fetching") return <Loader size={16} className="text-amber-500 animate-spin flex-shrink-0" />;
  if (status === "complete") return <CheckCircle size={16} className="text-green-500 flex-shrink-0" />;
  if (status === "failed") return <XCircle size={16} className="text-red-500 flex-shrink-0" />;
  return <Shield size={16} className="text-amber-500 flex-shrink-0" />;
}

export default function SingleRun() {
  const {
    config, mappedAssets, screening, identifiedRisks, resilienceMode,
    assetResilience, results, isRunning, progress, error,
    setHazardResults, setResults, setIsRunning, setProgress, setError,
  } = usePhysicalRiskStore();

  const [useLocalOnly, setUseLocalOnly] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [apis, setApis] = useState<ApiStage[]>(INITIAL_APIS);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const mc = buildMatrixConfig(config.matrixSize);
  const sym = config.currency === "USD" ? "$" : "\\u20A6";
  const asset = mappedAssets[0];
  const assetScreening = screening.find((s) => s.assetId === asset?.id);
  const hazardList = assetScreening?.risks ?? identifiedRisks;
  const hazardCount = hazardList.length;

  const updateApi = useCallback((key: string, status: StageStatus) => {
    setApis((prev) => prev.map((a) => (a.key === key ? { ...a, status } : a)));
  }, []);

  const handleRun = useCallback(async () => {
    if (!asset || hazardCount === 0) return;
    setIsRunning(true); setProgress(0); setError(null); setElapsed(0); setApis(INITIAL_APIS);
    const start = Date.now();
    const tid = setInterval(() => setElapsed(Math.round((Date.now() - start) / 1000)), 500);
    timerRef.current = tid;
    try {
      const inputs: HazardInput[] = hazardList.map((risk) => ({
        asset: asset.name, assetType: asset.assetType, risk,
        latitude: asset.latitude, longitude: asset.longitude, country: config.country,
      }));
      const sourceToApiKeys = (src: string): string[] => {
        const keys: string[] = []; const s = src.toLowerCase();
        if (s.includes("nasa")) keys.push("nasa");
        if (s.includes("open-meteo")) keys.push("openmeteo");
        if (s.includes("usgs")) keys.push("usgs");
        if (s.includes("noaa")) keys.push("noaa");
        if (s.includes("wri") || s.includes("aqueduct")) keys.push("wri");
        if (s.includes("srtm") || s.includes("elevation") || s.includes("opentopodata")) keys.push("srtm");
        if (s.includes("nominatim") || s.includes("coastal")) keys.push("nominatim");
        return keys;
      };
      const isFallbackSource = (src: string) => /fallback|local engine|geo-spatial|latitude zone|haversine|not coastal/i.test(src);
      const apiHits = new Set<string>();
      updateApi("nasa", "fetching"); updateApi("openmeteo", "fetching"); updateApi("usgs", "fetching");
      updateApi("noaa", "fetching"); updateApi("wri", "fetching");

      let outputs;
      if (useLocalOnly) {
        outputs = assessHazardsLocally(inputs, config.matrixSize);
        ["nasa","openmeteo","usgs","noaa","wri"].forEach((k) => updateApi(k, "fallback"));
      } else {
        outputs = await assessHazardsWithClimateApis(inputs, config.matrixSize,
          (done, total) => setProgress(Math.round((done / total) * 50)),
          (_risk, source) => {
            const keys = sourceToApiKeys(source); const fallback = isFallbackSource(source);
            keys.forEach((k) => { if (!apiHits.has(k)) { apiHits.add(k); updateApi(k, fallback ? "fallback" : "complete"); } });
          },
        );
        ["nasa","openmeteo","usgs","noaa","wri"].forEach((k) => { if (!apiHits.has(k)) updateApi(k, "complete"); });
      }
      setProgress(55);

      const hrResults: HazardResult[] = outputs.map((o) => ({
        asset: o.asset, risk: o.risk, latitude: asset.latitude, longitude: asset.longitude,
        intensityScore: o.intensityScore, intensityLabel: o.intensityLabel,
        frequencyScore: o.frequencyScore, frequencyLabel: o.frequencyLabel,
        hazardRating: o.hazardRating, matrixSize: `${mc.size}x${mc.size}`,
      }));
      setHazardResults(hrResults);

      updateApi("ef", "fetching"); await delay(80); updateApi("ef", "complete"); setProgress(65);
      updateApi("vuln", "fetching"); await delay(80); updateApi("vuln", "complete"); setProgress(75);
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
          rrf = ar && ar.confirmedMeasures.length > 0 ? ar.effectiveRrf : getSbraRrf(hr.risk, asset.assetType, sectorName, config.subsector);
        } else {
          rrf = getSbraRrf(hr.risk, asset.assetType, sectorName, config.subsector);
        }
        const netV = iv * (1 - rrf);
        const sslLocal = assetValueLocal * ef * netV;
        const sslUsd = sslLocal / rate;
        const ap = getAnnualProbability(hr.frequencyLabel);
        const ealLocal = sslLocal * ap; const ealUsd = ealLocal / rate;
        const riskScoreNorm = Math.round((RATING_ORDER[hr.hazardRating] / 6) * 100);
        const response = RESPONSE_RULES[hr.hazardRating];
        const residualScore = Math.round(riskScoreNorm * (1 - response.reductionPct / 100));
        const monitoring = MONITORING_CONFIG[hr.risk] ?? { kpi: "General monitoring", frequency: "Quarterly" };
        return {
          ...hr, assetType: asset.assetType, assetValueLocal, assetValueUsd,
          exposureFactor: ef, exposedValueLocal, exposedValueUsd,
          inherentVulnerability: iv, sbraRrf: rrf, sbraNetVulnerability: netV,
          annualProbability: ap, riskScoreNorm, sslLocal, sslUsd, ealLocal, ealUsd,
          responseStrategy: response.strategy, responsePriority: response.priority,
          responseTimeframe: response.timeframe, residualReductionPct: response.reductionPct,
          residualRiskScore: residualScore, residualRiskRating: scoreToRating(residualScore),
          monitoringKpi: monitoring.kpi, monitoringFrequency: monitoring.frequency,
          monitoringTrigger: monitoring.trigger ?? "", monitoringDataSource: monitoring.dataSource ?? "",
          monitoringOwnerRole: monitoring.ownerRole ?? "",
          dataSource: useLocalOnly ? "Local engine" : "Climate APIs",
        };
      });

      updateApi("estimation", "complete"); setProgress(90);
      updateApi("response", "fetching"); await delay(60); updateApi("response", "complete");
      setResults(enriched); setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    clearInterval(tid); timerRef.current = null; setIsRunning(false);
  }, [asset, hazardCount, hazardList, config, resilienceMode, assetResilience, useLocalOnly, mc.size, updateApi, setHazardResults, setResults, setIsRunning, setProgress, setError]);

  const done = results.length > 0;
  const topResult = done ? [...results].sort((a, b) => RATING_ORDER[b.hazardRating] - RATING_ORDER[a.hazardRating])[0] : null;

  return (
    <div className="max-w-[700px] mx-auto">
      {!isRunning && !done && (
        <div className="text-center py-16">
          <h1 className="text-[26px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mb-2">Run Assessment</h1>
          <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mb-1">
            {hazardCount} hazard{hazardCount !== 1 ? "s" : ""} selected for{" "}
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{asset?.name}</span>
          </p>
          {hazardCount === 0 && (
            <div className="flex items-start gap-2.5 px-4 py-3 mt-4 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left max-w-sm mx-auto">
              <p className="text-[13px] text-amber-700 dark:text-amber-400">No hazards selected. Go back to Step 3 and select at least one hazard.</p>
            </div>
          )}
          <div className="flex items-center justify-center gap-2.5 mt-8 mb-8">
            <button onClick={() => setUseLocalOnly(v => !v)} className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors cursor-pointer border-none ${useLocalOnly ? "bg-primary-500" : "bg-black/[0.12] dark:bg-white/[0.12]"}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${useLocalOnly ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <span className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">Use local engine only (no external API calls)</span>
          </div>
          <button onClick={handleRun} disabled={hazardCount === 0} className="flex items-center gap-2 bg-primary-500 text-white text-[15px] font-bold rounded-full px-8 py-3 mx-auto disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity" style={hazardCount > 0 ? { boxShadow: "0 2px 16px rgba(134,188,37,0.35)" } : undefined}>
            <Play size={16} /> Run Assessment
          </button>
        </div>
      )}

      {isRunning && (
        <div className="py-8">
          <h1 className="text-[26px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mb-1">Assessing Hazards</h1>
          <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mb-6">{progress}% complete \\u00b7 {elapsed}s elapsed</p>
          <div className="h-0.5 rounded-full bg-black/[0.08] dark:bg-white/[0.08] mb-8 overflow-hidden">
            <div className="h-full bg-primary-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <div>
            {apis.map((api) => (
              <div key={api.key} className="flex items-center gap-3 py-3 border-b border-black/[0.04] dark:border-white/[0.04] last:border-b-0">
                <StatusDot status={api.status} />
                <span className={`text-[13px] ${api.status === "fetching" ? "font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]" : "text-[#6E6E73] dark:text-[#86868B]"}`}>{api.label}</span>
                {api.status === "fallback" && <span className="text-[11px] text-amber-500 ml-auto">fallback</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {done && !isRunning && (
        <div>
          <div className="mb-7">
            <h1 className="text-[26px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mb-1">Assessment Complete</h1>
            <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B]">
              {results.length} hazards assessed for{" "}
              <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{asset?.name}</span>
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-[13px] text-amber-700 dark:text-amber-400">{error}</p>
            </div>
          )}

          {topResult && (
            <div className="pra-surface p-5 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-3">Top Risk</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[18px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-0.5">{topResult.risk}</p>
                  <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">{topResult.intensityLabel} intensity \\u00b7 {topResult.frequencyLabel}</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-full text-[13px] font-bold border" style={{ color: HAZARD_RATING_COLORS[topResult.hazardRating], backgroundColor: `${HAZARD_RATING_COLORS[topResult.hazardRating]}18`, borderColor: `${HAZARD_RATING_COLORS[topResult.hazardRating]}40` }}>
                  {topResult.hazardRating}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Hazards", value: results.length.toString() },
              { label: "Total EAL", value: fmt(results.reduce((s, r) => s + r.ealLocal, 0), sym) },
              { label: "Max SSL", value: fmt(Math.max(...results.map((r) => r.sslLocal), 0), sym) },
            ].map(({ label, value }) => (
              <div key={label} className="pra-surface p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-1">{label}</p>
                <p className="text-[16px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
"""

files["SingleRun.tsx"] = singlerun

# ─── SingleHazardSelect ────────────────────────────────────────────────────────
hazard = """import { useState, useEffect, useMemo } from "react";
import { CheckCircle, Zap } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { ALL_21_RISKS } from "../../domain/physicalRisk/constants";
import { suggestRisksForAsset } from "../../domain/physicalRisk/engine";
import type { RiskCategory } from "../../domain/physicalRisk/types";

const CATEGORY_META: Record<RiskCategory, { color: string; label: string }> = {
  Meteorological: { color: "#F59E0B", label: "Meteorological" },
  Hydrological: { color: "#3B82F6", label: "Hydrological" },
  Climatological: { color: "#10B981", label: "Climatological" },
  Geophysical: { color: "#8B5CF6", label: "Geophysical" },
};

const CATEGORIES: RiskCategory[] = ["Meteorological", "Hydrological", "Climatological", "Geophysical"];

export default function SingleHazardSelect() {
  const { mappedAssets, geoConfidence, screening, setScreening, setIdentifiedRisks } = usePhysicalRiskStore();
  const asset = mappedAssets[0];

  const [selected, setSelected] = useState<Set<string>>(() => {
    const existing = screening.find((s) => s.assetId === asset?.id);
    return new Set(existing?.risks ?? []);
  });

  const recommended = useMemo(() => {
    if (!asset) return new Set<string>();
    return new Set(suggestRisksForAsset(asset.latitude, asset.longitude));
  }, [asset]);

  const disabled = useMemo(() => {
    const d = new Set<string>();
    if (geoConfidence) {
      if (geoConfidence.elevation > 300) { d.add("Coastal Flooding"); d.add("Storm Surge"); d.add("Sea Level Rise"); }
      if (!geoConfidence.isCoastal) { d.add("Tsunamis"); d.add("Coastal & Riverbank Erosion"); }
    }
    return d;
  }, [geoConfidence]);

  useEffect(() => {
    if (!asset) return;
    const risks = Array.from(selected);
    setScreening([{ assetId: asset.id, assetName: asset.name, risks }]);
    setIdentifiedRisks(risks);
  }, [selected, asset, setScreening, setIdentifiedRisks]);

  const toggle = (risk: string) => {
    if (disabled.has(risk)) return;
    setSelected((prev) => { const next = new Set(prev); if (next.has(risk)) next.delete(risk); else next.add(risk); return next; });
  };

  const selectAll = () => setSelected(new Set(ALL_21_RISKS.filter((r) => !disabled.has(r.risk)).map((r) => r.risk)));
  const selectRecommended = () => { const rec = new Set(recommended); disabled.forEach((d) => rec.delete(d)); setSelected(rec); };

  if (!asset) return null;

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="mb-7">
        <h1 className="text-[26px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight tracking-tight">Select Hazards</h1>
        <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mt-1">
          {selected.size} of {ALL_21_RISKS.length} selected for{" "}
          <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{asset.name}</span>
        </p>
      </div>

      <div className="flex gap-2.5 mb-7 flex-wrap">
        <button onClick={selectRecommended} className="flex items-center gap-1.5 text-[12px] font-semibold text-amber-500 border border-amber-500/40 rounded-full px-3.5 py-1.5 hover:bg-amber-500/[0.08] transition-colors bg-transparent cursor-pointer">
          <Zap size={12} />
          Recommended
        </button>
        <button onClick={selectAll} className="flex items-center gap-1.5 text-[12px] font-semibold text-[#6E6E73] dark:text-[#86868B] border border-black/[0.15] dark:border-white/[0.15] rounded-full px-3.5 py-1.5 hover:border-black/[0.3] dark:hover:border-white/[0.3] transition-colors bg-transparent cursor-pointer">
          <CheckCircle size={12} />
          Select All
        </button>
      </div>

      {CATEGORIES.map((cat) => {
        const meta = CATEGORY_META[cat];
        const risksInCat = ALL_21_RISKS.filter((r) => r.category === cat);
        const selectedCount = risksInCat.filter((r) => selected.has(r.risk)).length;
        return (
          <div key={cat} className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: meta.color }}>{meta.label}</span>
              <span className="text-[12px] text-[#6E6E73] dark:text-[#86868B]">{selectedCount} / {risksInCat.length}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {risksInCat.map((risk) => {
                const isSelected = selected.has(risk.risk);
                const isDisabled = disabled.has(risk.risk);
                const isRecommended = recommended.has(risk.risk);
                return (
                  <button
                    key={risk.id}
                    title={isDisabled ? "Not applicable for this location" : risk.definition}
                    onClick={() => toggle(risk.risk)}
                    disabled={isDisabled}
                    className={`relative text-left p-3 rounded-xl border-[1.5px] cursor-pointer transition-all duration-150 ${isDisabled ? "opacity-30 cursor-not-allowed" : "hover:-translate-y-px"}`}
                    style={{
                      borderColor: isSelected ? `${meta.color}70` : undefined,
                      backgroundColor: isSelected ? `${meta.color}10` : undefined,
                    }}
                  >
                    {isRecommended && !isDisabled && (
                      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: meta.color }}>
                        <CheckCircle size={10} color="#fff" />
                      </div>
                    )}
                    <span
                      className={`text-[12px] leading-snug block ${isRecommended && !isDisabled ? "pt-1" : ""} ${isSelected ? "pr-5" : ""}`}
                      style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? meta.color : undefined }}
                    >
                      {risk.risk}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between p-3 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] mt-2">
        <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
          <span className="font-bold text-primary-500">{selected.size}</span>{" hazards selected \u00b7 "}
          <span className="text-amber-500">\u25cf</span>{" recommended"}
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => {
            const meta = CATEGORY_META[cat];
            const count = ALL_21_RISKS.filter((r) => r.category === cat && selected.has(r.risk)).length;
            if (count === 0) return null;
            return (
              <span key={cat} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${meta.color}15`, color: meta.color }}>
                {cat.slice(0, 4)} {count}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
"""

# ─── SingleResilience ──────────────────────────────────────────────────────────
resilience = """import { useState, useEffect, useMemo } from "react";
import { Shield, ChevronDown, ChevronUp, SkipForward } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { RESILIENCE_MEASURES, ALL_21_RISKS } from "../../domain/physicalRisk/constants";
import { getSbraRrf, getSectorNameById } from "../../domain/physicalRisk/sbraTable";
import type { ResilienceMode } from "../../domain/physicalRisk/types";

const MEASURE_CATEGORIES = Array.from(new Set(RESILIENCE_MEASURES.map((m) => m.category)));

const CATEGORY_COLORS: Record<string, string> = {
  Flood: "#3B82F6", Electrical: "#F59E0B", Wind: "#8B5CF6", Heat: "#EF4444",
  Water: "#06B6D4", Fire: "#F97316", Seismic: "#6366F1", Geotechnical: "#84CC16",
  Coastal: "#0EA5E9", "Air Quality": "#A78BFA", Operational: "#14B8A6", Financial: "#EC4899",
};

export default function SingleResilience() {
  const { config, mappedAssets, screening, resilienceMode, assetResilience, setResilienceMode, setAssetResilience, setActiveStep } = usePhysicalRiskStore();
  const asset = mappedAssets[0];
  const assetScreening = screening.find((s) => s.assetId === asset?.id);

  const [mode, setMode] = useState<ResilienceMode>(resilienceMode || "SBRA");
  const [confirmed, setConfirmed] = useState<Set<string>>(() => {
    const existing = assetResilience.find((a) => a.assetId === asset?.id);
    return new Set(existing?.confirmedMeasures ?? []);
  });
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const sbraRrf = useMemo(() => {
    if (!asset) return 0;
    const sectorName = getSectorNameById(config.sectorId);
    const risks = assetScreening?.risks ?? [];
    if (risks.length === 0) return 0;
    const sum = risks.reduce((acc, risk) => acc + getSbraRrf(risk, asset.assetType, sectorName, config.subsector), 0);
    return sum / risks.length;
  }, [asset, config, assetScreening]);

  const alraRrf = useMemo(() => {
    if (confirmed.size === 0) return 0;
    let combined = 0;
    confirmed.forEach((id) => {
      const m = RESILIENCE_MEASURES.find((rm) => rm.id === id);
      if (m) combined = 1 - (1 - combined) * (1 - m.rrf);
    });
    return Math.min(combined, 0.85);
  }, [confirmed]);

  const effectiveRrf = mode === "SBRA" ? sbraRrf : alraRrf;

  useEffect(() => {
    setResilienceMode(mode);
    if (asset) {
      setAssetResilience([{ assetId: asset.id, mode, confirmedMeasures: Array.from(confirmed), effectiveRrf }]);
    }
  }, [mode, confirmed, effectiveRrf, asset, setResilienceMode, setAssetResilience]);

  const toggle = (id: string) => {
    setConfirmed((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const relevantHazards = useMemo(() => {
    const selectedRisks = new Set(assetScreening?.risks ?? []);
    const catToHazards: Record<string, string[]> = {
      Flood: ["River Flooding","Flash Flooding","Coastal Flooding","Groundwater Flooding"],
      Electrical: ["Thunderstorms & Lightning"], Wind: ["Tropical Cyclones","Sandstorms / Harmattan"],
      Heat: ["Extreme Heat"], Water: ["Drought","Water Scarcity"], Fire: ["Wildfire / Bushfire"],
      Seismic: ["Earthquakes"], Geotechnical: ["Landslides"],
      Coastal: ["Coastal Flooding","Storm Surge","Coastal & Riverbank Erosion","Sea Level Rise","Tsunamis"],
      "Air Quality": ["Sandstorms / Harmattan","Volcanic Eruptions"],
      Operational: ALL_21_RISKS.map((r) => r.risk), Financial: ALL_21_RISKS.map((r) => r.risk),
    };
    const result: Record<string, string[]> = {};
    for (const [cat, hazards] of Object.entries(catToHazards)) {
      result[cat] = hazards.filter((h) => selectedRisks.has(h));
    }
    return result;
  }, [assetScreening]);

  if (!asset) return null;

  return (
    <div className="max-w-[800px] mx-auto">
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-[26px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight tracking-tight">Resilience Measures</h1>
          <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mt-1">Optional \u2014 skip to use sector benchmark defaults.</p>
        </div>
        <button onClick={() => { setMode("SBRA"); setActiveStep(4); }} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#6E6E73] dark:text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors bg-transparent border-none cursor-pointer mt-1">
          Skip <SkipForward size={13} />
        </button>
      </div>

      <div className="pra-surface p-5 mb-5">
        <div className="flex rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] mb-5">
          {(["SBRA", "ALRA"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)} className={`flex-1 py-3 text-[13px] font-semibold transition-colors ${mode === m ? "bg-primary-500/10 text-primary-500" : "text-[#6E6E73] dark:text-[#86868B] hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"}`}>
              {m === "SBRA" ? "Use Sector Benchmark (SBRA)" : "Enter Actual Measures (ALRA)"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-1">Resilience Reduction Factor</p>
            <p className="text-[28px] font-extrabold text-primary-500 leading-none">{(effectiveRrf * 100).toFixed(1)}%</p>
          </div>
          <div className="p-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] text-center">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-1">Mode</p>
            <p className="text-[18px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] leading-none">{mode}</p>
            <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B] mt-0.5">{mode === "SBRA" ? "Sector Default" : `${confirmed.size} measures`}</p>
          </div>
        </div>
      </div>

      {mode === "ALRA" && (
        <div>
          {MEASURE_CATEGORIES.map((cat) => {
            const measures = RESILIENCE_MEASURES.filter((m) => m.category === cat);
            const catColor = CATEGORY_COLORS[cat] ?? "#6B7280";
            const isExpanded = expandedCat === cat;
            const confirmedInCat = measures.filter((m) => confirmed.has(m.id)).length;
            const catHazards = relevantHazards[cat] ?? [];
            return (
              <div key={cat} className="mb-2 pra-surface overflow-hidden">
                <button onClick={() => setExpandedCat(isExpanded ? null : cat)} className="w-full flex items-center justify-between p-4 text-left bg-transparent border-none cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: catColor }} />
                    <span className="text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{cat}</span>
                    {confirmedInCat > 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${catColor}18`, color: catColor }}>{confirmedInCat}</span>
                    )}
                    {catHazards.length > 0 && (
                      <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B]">{catHazards.slice(0, 2).join(", ")}{catHazards.length > 2 ? ` +${catHazards.length - 2}` : ""}</span>
                    )}
                  </div>
                  {isExpanded ? <ChevronUp size={15} className="text-[#6E6E73] dark:text-[#86868B]" /> : <ChevronDown size={15} className="text-[#6E6E73] dark:text-[#86868B]" />}
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[2000px]" : "max-h-0"}`}>
                  <div className="px-4 pb-4">
                    {measures.map((m) => {
                      const isOn = confirmed.has(m.id);
                      return (
                        <div key={m.id} className="flex items-center gap-3 py-3 border-b border-black/[0.04] dark:border-white/[0.04] last:border-b-0">
                          <button onClick={() => toggle(m.id)} className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors cursor-pointer border-none ${isOn ? "bg-primary-500" : "bg-black/[0.12] dark:bg-white/[0.12]"}`} aria-label={`Toggle ${m.name}`}>
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isOn ? "translate-x-4" : "translate-x-0.5"}`} />
                          </button>
                          <div className="flex-1 min-w-0">
                            <p className={`text-[13px] leading-snug ${isOn ? "font-bold text-[#1D1D1F] dark:text-[#F5F5F7]" : "font-medium text-[#1D1D1F] dark:text-[#F5F5F7]"}`}>{m.name}</p>
                            <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B]">{m.description}</p>
                          </div>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${isOn ? "bg-primary-500/10 text-primary-500" : "bg-black/[0.04] dark:bg-white/[0.04] text-[#6E6E73] dark:text-[#86868B]"}`}>
                            -{(m.rrf * 100).toFixed(0)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {mode === "SBRA" && (
        <div className="pra-surface p-8 text-center">
          <Shield size={36} className="text-primary-500 mx-auto mb-4" />
          <h2 className="text-[16px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Sector Benchmark Applied</h2>
          <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mb-3 leading-relaxed">
            Based on your sector ({getSectorNameById(config.sectorId)}) and asset type ({asset.assetType}), SBRA resilience benchmarks are automatically applied for each hazard.
          </p>
          <p className="text-[13px] font-bold text-primary-500">Avg. RRF: {(sbraRrf * 100).toFixed(1)}%</p>
        </div>
      )}

      <button onClick={() => setActiveStep(4)} className="mt-6 w-full bg-primary-500 text-white text-[14px] font-semibold rounded-full py-3 hover:opacity-90 disabled:opacity-40 transition-opacity" style={{ boxShadow: "0 2px 16px rgba(134,188,37,0.3)" }}>
        Proceed to Assessment
      </button>
    </div>
  );
}
"""

files = {
    "SingleHazardSelect.tsx": hazard,
    "SingleResilience.tsx": resilience,
}

for name, content in files.items():
    path = os.path.join(base, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Written: {name}")
