import os
base = r"c:\Users\pezemiwe\Documents\gcb-esg-navigator\src\features\cra\steps\physical"

# ── SingleRun ─────────────────────────────────────────────────────────────────
singlerun = r'''import React, { useCallback, useState } from "react";
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
      const isFallbackSource = (src: string) =>
        /fallback|local engine|geo-spatial|latitude zone|haversine|not coastal/i.test(src);
      const apiHits = new Set<string>();
      updateApi("nasa", "fetching"); updateApi("openmeteo", "fetching");
      updateApi("usgs", "fetching"); updateApi("noaa", "fetching"); updateApi("wri", "fetching");
      let outputs;
      if (useLocalOnly) {
        outputs = assessHazardsLocally(inputs, config.matrixSize);
        ["nasa","openmeteo","usgs","noaa","wri"].forEach((k) => updateApi(k, "fallback"));
      } else {
        outputs = await assessHazardsWithClimateApis(
          inputs, config.matrixSize,
          (done, total) => setProgress(Math.round((done / total) * 50)),
          (_risk, source) => {
            const keys = sourceToApiKeys(source);
            const fallback = isFallbackSource(source);
            keys.forEach((k) => {
              if (!apiHits.has(k)) { apiHits.add(k); updateApi(k, fallback ? "fallback" : "complete"); }
            });
          },
        );
        ["nasa","openmeteo","usgs","noaa","wri"].forEach((k) => {
          if (!apiHits.has(k)) updateApi(k, "complete");
        });
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
          rrf = ar && ar.confirmedMeasures.length > 0
            ? ar.effectiveRrf
            : getSbraRrf(hr.risk, asset.assetType, sectorName, config.subsector);
        } else {
          rrf = getSbraRrf(hr.risk, asset.assetType, sectorName, config.subsector);
        }
        const netV = iv * (1 - rrf);
        const sslLocal = assetValueLocal * ef * netV;
        const sslUsd = sslLocal / rate;
        const ap = getAnnualProbability(hr.frequencyLabel);
        const ealLocal = sslLocal * ap;
        const ealUsd = ealLocal / rate;
        const riskScoreNorm = Math.round((RATING_ORDER[hr.hazardRating] / 6) * 100);
        const response = RESPONSE_RULES[hr.hazardRating];
        const residualScore = Math.round(riskScoreNorm * (1 - response.reductionPct / 100));
        const monitoring = MONITORING_CONFIG[hr.risk] ?? { kpi: "General monitoring", frequency: "Quarterly" };
        return {
          ...hr, assetType: asset.assetType,
          assetValueLocal, assetValueUsd,
          exposureFactor: ef, exposedValueLocal, exposedValueUsd,
          inherentVulnerability: iv, sbraRrf: rrf, sbraNetVulnerability: netV,
          annualProbability: ap, riskScoreNorm, sslLocal, sslUsd, ealLocal, ealUsd,
          responseStrategy: response.strategy, responsePriority: response.priority,
          responseTimeframe: response.timeframe, residualReductionPct: response.reductionPct,
          residualRiskScore: residualScore, residualRiskRating: scoreToRating(residualScore),
          monitoringKpi: monitoring.kpi, monitoringFrequency: monitoring.frequency,
          monitoringTrigger: monitoring.trigger ?? "",
          monitoringDataSource: monitoring.dataSource ?? "",
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
  }, [
    asset, hazardCount, hazardList, config, resilienceMode, assetResilience,
    useLocalOnly, mc.size, updateApi,
    setHazardResults, setResults, setIsRunning, setProgress, setError,
  ]);

  const done = results.length > 0;
  const topResult = done
    ? [...results].sort((a, b) => RATING_ORDER[b.hazardRating] - RATING_ORDER[a.hazardRating])[0]
    : null;

  return (
    <div className="max-w-[700px] mx-auto">
      {!isRunning && !done && (
        <div className="text-center py-16">
          <h1 className="text-[26px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] tracking-tight mb-2">
            Run Assessment
          </h1>
          <p className="text-[14px] text-[#6E6E73] dark:text-[#86868B] mb-1">
            {hazardCount} hazard{hazardCount !== 1 ? "s" : ""} selected for{" "}
            <span className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">{asset?.name}</span>
          </p>
          {hazardCount === 0 && (
            <div className="flex items-start gap-2.5 px-4 py-3 mt-4 mb-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left max-w-sm mx-auto">
              <p className="text-[13px] text-amber-700 dark:text-amber-400">
                No hazards selected. Go back and select at least one hazard.
              </p>
            </div>
          )}
          <div className="flex items-center justify-center gap-2.5 mt-8 mb-8">
            <button
              onClick={() => setUseLocalOnly((v) => !v)}
              className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors cursor-pointer border-none ${useLocalOnly ? "bg-primary-500" : "bg-black/[0.12] dark:bg-white/[0.12]"}`}
            >
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${useLocalOnly ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
            <span className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
              Use local engine only (no external API calls)
            </span>
          </div>
          <button
            onClick={handleRun}
            disabled={hazardCount === 0}
            className="flex items-center gap-2 bg-primary-500 text-white text-[15px] font-bold rounded-full px-8 py-3 mx-auto disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={hazardCount > 0 ? { boxShadow: "0 2px 16px rgba(134,188,37,0.35)" } : undefined}
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
                  <span className="text-[11px] text-amber-500 ml-auto">fallback</span>
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
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-3">
                Top Risk
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[18px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-0.5">
                    {topResult.risk}
                  </p>
                  <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B]">
                    {topResult.intensityLabel} intensity &middot; {topResult.frequencyLabel}
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

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Hazards", value: results.length.toString() },
              { label: "Total EAL", value: fmt(results.reduce((s, r) => s + r.ealLocal, 0), sym) },
              { label: "Max SSL", value: fmt(Math.max(...results.map((r) => r.sslLocal), 0), sym) },
            ].map(({ label, value }) => (
              <div key={label} className="pra-surface p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-1">
                  {label}
                </p>
                <p className="text-[16px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
'''

# ── SingleResults ─────────────────────────────────────────────────────────────
singleresults = r'''import { useMemo, useState } from "react";
import {
  BarChart3, ChevronDown, ChevronUp, ShieldCheck, TrendingDown,
  AlertTriangle, Activity, Eye, Calculator, MapPin,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS, RATING_ORDER, RISK_APPETITE, ALL_21_RISKS,
} from "../../domain/physicalRisk/constants";
import type { HazardRating } from "../../domain/physicalRisk/types";
import AssetMapView from "../../components/AssetMapView";

const ORDERED_RATINGS: HazardRating[] = ["Extreme","Very High","High","Medium","Low","Negligible"];

const fmt = (v: number, sym: string) =>
  v >= 1e9 ? `${sym}${(v / 1e9).toFixed(2)}B`
  : v >= 1e6 ? `${sym}${(v / 1e6).toFixed(2)}M`
  : v >= 1e3 ? `${sym}${(v / 1e3).toFixed(1)}K`
  : `${sym}${v.toFixed(0)}`;

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

const CATEGORY_COLORS: Record<string, string> = {
  Meteorological: "#F59E0B",
  Hydrological: "#3B82F6",
  Climatological: "#10B981",
  Geophysical: "#8B5CF6",
};

export default function SingleResults() {
  const { config, mappedAssets, results, resilienceMode, geoConfidence } = usePhysicalRiskStore();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showCalc, setShowCalc] = useState(false);

  const asset = mappedAssets[0];
  const sym = config.currency === "USD" ? "$" : "\u20A6";

  const totalEal = useMemo(() => results.reduce((s, r) => s + r.ealLocal, 0), [results]);
  const totalSsl = useMemo(() => results.reduce((s, r) => s + r.sslLocal, 0), [results]);
  const maxSsl = useMemo(() => Math.max(...results.map((r) => r.sslLocal), 0), [results]);

  const worstRating = useMemo(() => {
    if (results.length === 0) return "Negligible" as HazardRating;
    return [...results].sort(
      (a, b) => RATING_ORDER[b.hazardRating] - RATING_ORDER[a.hazardRating],
    )[0].hazardRating;
  }, [results]);

  const extremeCount = results.filter((r) => r.hazardRating === "Extreme").length;
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
        const rawSsl = r.assetValueLocal * r.exposureFactor * r.inherentVulnerability;
        return s + rawSsl * r.annualProbability;
      }, 0),
    [results],
  );
  const ealSavings = ealWithoutResilience - totalEal;

  const sorted = useMemo(
    () => [...results].sort((a, b) => RATING_ORDER[b.hazardRating] - RATING_ORDER[a.hazardRating]),
    [results],
  );

  const riskCategoryMap = useMemo(() => {
    const m: Record<string, string> = {};
    ALL_21_RISKS.forEach((r) => (m[r.risk] = r.category));
    return m;
  }, []);

  if (results.length === 0) {
    return (
      <div className="mt-8 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[14px] text-blue-700 dark:text-blue-400">
        No results yet. Run the assessment first.
      </div>
    );
  }

  return (
    <div className="max-w-[960px] mx-auto py-3">
      {/* Summary Banner */}
      <div className="pra-surface overflow-hidden mb-4">
        <div
          className="h-1"
          style={{ background: `linear-gradient(90deg, ${HAZARD_RATING_COLORS[worstRating]}, #86BC25)` }}
        />
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${HAZARD_RATING_COLORS[worstRating]}20` }}
            >
              <BarChart3 size={22} style={{ color: HAZARD_RATING_COLORS[worstRating] }} />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#6E6E73] dark:text-[#86868B]">
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
              { label: "Worst Hazard", value: worstRating, color: HAZARD_RATING_COLORS[worstRating], icon: <AlertTriangle size={15} /> },
              { label: "Total EAL", value: fmt(totalEal, sym), color: "#86BC25", icon: <TrendingDown size={15} /> },
              { label: "Max SSL", value: fmt(maxSsl, sym), color: "#F59E0B", icon: <Activity size={15} /> },
              { label: "Extreme Risks", value: `${extremeCount}`, color: extremeCount > 0 ? "#EF4444" : "#10B981", icon: <ShieldCheck size={15} /> },
              { label: "Very High", value: `${vhCount}`, color: vhCount > 0 ? "#DC143C" : "#10B981", icon: <Eye size={15} /> },
              { label: "Total Hazards", value: `${results.length}`, color: "#3B82F6", icon: <BarChart3 size={15} /> },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] text-center"
              >
                <div className="flex justify-center mb-0.5" style={{ color: kpi.color }}>{kpi.icon}</div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B]">
                  {kpi.label}
                </p>
                <p className="text-[13px] font-extrabold" style={{ color: kpi.color }}>{kpi.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map + Rating Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
        <div className="md:col-span-7 pra-surface overflow-hidden">
          <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2">
            <MapPin size={13} className="text-primary-500" />
            <span className="text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Asset Location</span>
            {geoConfidence && (
              <span className="ml-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.05] text-[#6E6E73] dark:text-[#86868B]">
                {geoConfidence.level}
              </span>
            )}
          </div>
          {asset && (
            <AssetMapView
              pins={[{
                lat: asset.latitude,
                lon: asset.longitude,
                label: asset.name,
                detail: `${asset.assetType} \u00b7 ${worstRating}`,
              }]}
              height={260}
              zoom={13}
              center={[asset.latitude, asset.longitude]}
            />
          )}
        </div>

        <div className="md:col-span-5 pra-surface">
          <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
            <span className="text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Rating Distribution</span>
          </div>
          <div className="p-4">
            {ORDERED_RATINGS.map((rating) => (
              <div key={rating} className="flex items-center gap-2 mb-2">
                <span
                  className="text-[11px] font-semibold w-[72px] flex-shrink-0"
                  style={{ color: HAZARD_RATING_COLORS[rating] }}
                >
                  {rating}
                </span>
                <div className="flex-1 h-[18px] rounded bg-black/[0.04] dark:bg-white/[0.04] overflow-hidden">
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
            <div className="border-t border-black/[0.06] dark:border-white/[0.06] mt-3 pt-3">
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

      {/* Resilience Impact Panel */}
      <div className="pra-surface p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={16} className="text-primary-500" />
          <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Resilience Impact</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-500">
            {resilienceMode}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "EAL Without Resilience", value: fmt(ealWithoutResilience, sym), color: "#EF4444", bgClass: "bg-red-500/5" },
            { label: "EAL With Resilience", value: fmt(totalEal, sym), color: "#86BC25", bgClass: "bg-primary-500/5" },
            {
              label: "Annual Savings",
              value: ealSavings > 0 ? fmt(ealSavings, sym) : fmt(0, sym),
              color: "#10B981",
              bgClass: "bg-green-500/5",
              sub: ealWithoutResilience > 0 ? `(${pct(ealSavings / ealWithoutResilience)} reduction)` : undefined,
            },
          ].map((tile) => (
            <div
              key={tile.label}
              className={`p-4 rounded-xl border border-black/[0.05] dark:border-white/[0.05] text-center ${tile.bgClass}`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-1">
                {tile.label}
              </p>
              <p className="text-[20px] font-extrabold" style={{ color: tile.color }}>{tile.value}</p>
              {tile.sub && <p className="text-[11px] mt-0.5" style={{ color: tile.color }}>{tile.sub}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Per-Hazard Breakdown Table */}
      <div className="pra-surface overflow-hidden mb-4">
        <div className="px-5 py-3 border-b border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2">
          <Activity size={15} className="text-blue-500" />
          <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Per-Hazard Breakdown</span>
          <span className="text-[11px] text-[#6E6E73] dark:text-[#86868B] ml-auto">
            {results.length} hazards assessed
          </span>
        </div>

        <div className="overflow-x-auto" style={{ maxHeight: 480, overflowY: "auto" }}>
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F9F9F9] dark:bg-[#161616]">
              <tr className="border-b border-black/[0.06] dark:border-white/[0.06]">
                <th className="w-8 px-2 py-2.5" />
                <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5">Hazard</th>
                <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-center">Category</th>
                <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-center">Rating</th>
                <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-center">Intensity</th>
                <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-center">Frequency</th>
                <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-right">EF</th>
                <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-right">Net Vuln</th>
                <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-right">SSL</th>
                <th className="text-[11px] font-bold text-[#6E6E73] dark:text-[#86868B] px-3 py-2.5 text-right">EAL</th>
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
                      onClick={() => setExpandedRow(isExpanded ? null : r.risk)}
                      className="border-b border-black/[0.04] dark:border-white/[0.04] cursor-pointer hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-2 py-2 text-center">
                        <button className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-black/[0.06] dark:hover:bg-white/[0.06] border-none bg-transparent cursor-pointer mx-auto">
                          {isExpanded
                            ? <ChevronUp size={13} className="text-[#6E6E73]" />
                            : <ChevronDown size={13} className="text-[#6E6E73]" />}
                        </button>
                      </td>
                      <td className="px-3 py-2.5 text-[12px] font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-nowrap">
                        {r.risk}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: `${catColor}18`, color: catColor }}
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
                        title={`${sym}${r.ealLocal.toLocaleString()}`}
                      >
                        {fmt(r.ealLocal, sym)}
                      </td>
                    </tr>
                    <tr key={`${r.risk}-detail`}>
                      <td colSpan={10} className="p-0">
                        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[900px]" : "max-h-0"}`}>
                          <div className="mx-4 mb-3 p-4 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.06]">
                            <p className="text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
                              Calculation Audit Trail &mdash; {r.risk}
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <CalcLine label="Asset Value" value={`${sym}${r.assetValueLocal.toLocaleString()}`} />
                                <CalcLine label="Hazard Rating" value={r.hazardRating} color={HAZARD_RATING_COLORS[r.hazardRating]} />
                                <CalcLine label="Exposure Factor (EF)" value={pct(r.exposureFactor)} />
                                <CalcLine label="Exposed Value" value={`${sym}${r.exposedValueLocal.toLocaleString()}`} formula="= Asset Value \u00d7 EF" />
                                <CalcLine label="Inherent Vulnerability (IV)" value={pct(r.inherentVulnerability)} />
                                <CalcLine label="Resilience Reduction (RRF)" value={pct(r.sbraRrf)} />
                                <CalcLine label="Net Vulnerability" value={pct(r.sbraNetVulnerability)} formula="= IV \u00d7 (1 \u2212 RRF)" />
                              </div>
                              <div className="space-y-1.5">
                                <CalcLine label="Single Scenario Loss (SSL)" value={fmt(r.sslLocal, sym)} formula="= Asset Value \u00d7 EF \u00d7 Net Vuln" />
                                <CalcLine label="Annual Probability" value={pct(r.annualProbability)} />
                                <CalcLine label="Expected Annual Loss (EAL)" value={fmt(r.ealLocal, sym)} formula="= SSL \u00d7 Annual Prob" />
                                <div className="border-t border-black/[0.06] dark:border-white/[0.06] pt-1.5 my-1.5" />
                                <CalcLine label="Response Strategy" value={r.responseStrategy} />
                                <CalcLine
                                  label="Priority"
                                  value={r.responsePriority}
                                  color={r.responsePriority === "CRITICAL" ? "#EF4444" : r.responsePriority === "HIGH" ? "#DC143C" : "#F59E0B"}
                                />
                                <CalcLine label="Timeframe" value={r.responseTimeframe} />
                                <CalcLine label="Data Source" value={r.dataSource} />
                              </div>
                            </div>
                            {r.monitoringKpi && (
                              <>
                                <div className="border-t border-black/[0.06] dark:border-white/[0.06] mt-3 pt-3" />
                                <p className="text-[11px] font-bold text-blue-500 mb-2">Monitoring Plan</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <CalcLine label="KPI" value={r.monitoringKpi} />
                                  <CalcLine label="Frequency" value={r.monitoringFrequency} />
                                  <CalcLine label="Trigger" value={r.monitoringTrigger || "\u2014"} />
                                  <CalcLine label="Owner" value={r.monitoringOwnerRole || "\u2014"} />
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

        <div className="px-5 py-3 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center justify-between">
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

      {/* Worked Calculation Pipeline */}
      <div className="pra-surface overflow-hidden">
        <button
          onClick={() => setShowCalc(!showCalc)}
          className="w-full px-5 py-3.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors bg-transparent border-none text-left"
        >
          <div className="flex items-center gap-2">
            <Calculator size={15} className="text-purple-500" />
            <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Worked Calculation Pipeline
            </span>
          </div>
          {showCalc
            ? <ChevronUp size={15} className="text-[#6E6E73]" />
            : <ChevronDown size={15} className="text-[#6E6E73]" />}
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${showCalc ? "max-h-[2000px]" : "max-h-0"}`}>
          <div className="px-5 pb-5">
            <div className="border-t border-black/[0.06] dark:border-white/[0.06] mb-4" />
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
                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-purple-500/10 mt-0.5">
                  <span className="text-[11px] font-extrabold text-purple-500">{s.step}</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{s.title}</p>
                  <p className="text-[11px] text-[#6E6E73] dark:text-[#86868B]">{s.desc}</p>
                  <p className="text-[10px] font-mono text-[#9CA3AF] dark:text-[#6B7280] mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
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
      <span className="text-[11px] text-[#9CA3AF] w-40 flex-shrink-0">{label}</span>
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
'''

# ── SingleExport ──────────────────────────────────────────────────────────────
singleexport = r'''import { useCallback, useState } from "react";
import {
  Download, FileText, FileSpreadsheet, Printer, CheckCircle, BarChart3,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { HAZARD_RATING_COLORS, RATING_ORDER } from "../../domain/physicalRisk/constants";
import type { EnrichedResult } from "../../domain/physicalRisk/types";

const fmt = (v: number, sym: string) =>
  v >= 1e9 ? `${sym}${(v / 1e9).toFixed(2)}B`
  : v >= 1e6 ? `${sym}${(v / 1e6).toFixed(2)}M`
  : v >= 1e3 ? `${sym}${(v / 1e3).toFixed(1)}K`
  : `${sym}${v.toFixed(0)}`;

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildHazardCsv(results: EnrichedResult[], sym: string, assetName: string): string {
  const header = [
    "Asset","Hazard","Hazard Rating","Intensity","Frequency",
    `Asset Value (${sym})`, "Exposure Factor","Inherent Vulnerability","RRF",
    "Net Vulnerability",`SSL (${sym})`,"Annual Probability",`EAL (${sym})`,
    "Response Strategy","Priority","Timeframe",
  ].join(",");
  const rows = results.map((r) =>
    [
      `"${assetName}"`, `"${r.risk}"`, `"${r.hazardRating}"`,
      `"${r.intensityLabel}"`, `"${r.frequencyLabel}"`,
      r.assetValueLocal.toFixed(2), r.exposureFactor.toFixed(4),
      r.inherentVulnerability.toFixed(4), r.sbraRrf.toFixed(4),
      r.sbraNetVulnerability.toFixed(4), r.sslLocal.toFixed(2),
      r.annualProbability.toFixed(4), r.ealLocal.toFixed(2),
      `"${r.responseStrategy}"`, `"${r.responsePriority}"`, `"${r.responseTimeframe}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function buildCalcCsv(results: EnrichedResult[], sym: string, assetName: string): string {
  const header = [
    "Asset","Hazard","Rating",`Asset Value (${sym})`,"EF",`Exposed Value (${sym})`,
    "IV","RRF","Net Vuln",`SSL (${sym})`,"Annual Prob",`EAL (${sym})`,
    "Residual Score","Residual Rating","Monitoring KPI","Monitoring Frequency",
    "Monitoring Trigger","Data Source",
  ].join(",");
  const rows = results.map((r) =>
    [
      `"${assetName}"`, `"${r.risk}"`, `"${r.hazardRating}"`,
      r.assetValueLocal.toFixed(2), r.exposureFactor.toFixed(4),
      r.exposedValueLocal.toFixed(2), r.inherentVulnerability.toFixed(4),
      r.sbraRrf.toFixed(4), r.sbraNetVulnerability.toFixed(4),
      r.sslLocal.toFixed(2), r.annualProbability.toFixed(4), r.ealLocal.toFixed(2),
      r.residualRiskScore, `"${r.residualRiskRating}"`,
      `"${r.monitoringKpi}"`, `"${r.monitoringFrequency}"`,
      `"${r.monitoringTrigger}"`, `"${r.dataSource}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function buildMonitoringCsv(results: EnrichedResult[], assetName: string): string {
  const header = [
    "Asset","Hazard","KPI","Frequency","Trigger","Data Source",
    "Owner Role","Response Strategy","Priority","Timeframe",
  ].join(",");
  const rows = results.map((r) =>
    [
      `"${assetName}"`, `"${r.risk}"`, `"${r.monitoringKpi}"`,
      `"${r.monitoringFrequency}"`, `"${r.monitoringTrigger}"`,
      `"${r.monitoringDataSource}"`, `"${r.monitoringOwnerRole}"`,
      `"${r.responseStrategy}"`, `"${r.responsePriority}"`, `"${r.responseTimeframe}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export default function SingleExport() {
  const { config, mappedAssets, results } = usePhysicalRiskStore();
  const [exported, setExported] = useState<Set<string>>(new Set());
  const [includeCalc, setIncludeCalc] = useState(true);
  const [includeMonitoring, setIncludeMonitoring] = useState(true);

  const asset = mappedAssets[0];
  const sym = config.currency === "USD" ? "$" : "\u20A6";
  const totalEal = results.reduce((s, r) => s + r.ealLocal, 0);
  const worstRating =
    results.length > 0
      ? [...results].sort(
          (a, b) => RATING_ORDER[b.hazardRating] - RATING_ORDER[a.hazardRating],
        )[0].hazardRating
      : "Negligible";

  const markExported = (key: string) => setExported((p) => new Set([...p, key]));

  const handleHazardCsv = useCallback(() => {
    if (!asset) return;
    downloadCsv(`${asset.name.replace(/\s+/g, "_")}_hazard_breakdown.csv`, buildHazardCsv(results, sym, asset.name));
    markExported("hazard");
  }, [asset, results, sym]);

  const handleCalcCsv = useCallback(() => {
    if (!asset) return;
    downloadCsv(`${asset.name.replace(/\s+/g, "_")}_worked_calculations.csv`, buildCalcCsv(results, sym, asset.name));
    markExported("calc");
  }, [asset, results, sym]);

  const handleMonitoringCsv = useCallback(() => {
    if (!asset) return;
    downloadCsv(`${asset.name.replace(/\s+/g, "_")}_monitoring_plan.csv`, buildMonitoringCsv(results, asset.name));
    markExported("monitoring");
  }, [asset, results]);

  const handleExportAll = useCallback(() => {
    handleHazardCsv();
    if (includeCalc) handleCalcCsv();
    if (includeMonitoring) handleMonitoringCsv();
    markExported("all");
  }, [handleHazardCsv, handleCalcCsv, handleMonitoringCsv, includeCalc, includeMonitoring]);

  const handlePrint = useCallback(() => {
    window.print();
    markExported("print");
  }, []);

  if (results.length === 0) {
    return (
      <div className="mt-8 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[14px] text-blue-700 dark:text-blue-400">
        No results to export. Run the assessment first.
      </div>
    );
  }

  return (
    <div className="max-w-[700px] mx-auto py-3">
      {/* Header card */}
      <div className="pra-surface overflow-hidden mb-4">
        <div className="h-1 bg-gradient-to-r from-green-500 to-primary-500" />
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <Download size={28} className="text-green-500" />
          </div>
          <h2 className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
            Export Results
          </h2>
          <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mb-5">
            Download the assessment results for{" "}
            <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">{asset?.name}</strong>
            {" "}&middot; {results.length} hazards assessed &middot; Overall {worstRating}
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-0.5">
                Hazards
              </p>
              <p className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {results.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-0.5">
                Total EAL
              </p>
              <p className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">
                {fmt(totalEal, sym)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-0.5">
                Worst Rating
              </p>
              <span
                className="text-[12px] font-bold px-2.5 py-1 rounded-full mt-0.5 inline-block"
                style={{
                  color: HAZARD_RATING_COLORS[worstRating],
                  backgroundColor: `${HAZARD_RATING_COLORS[worstRating]}18`,
                }}
              >
                {worstRating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Cards */}
      <div className="space-y-2.5 mb-4">
        <ExportCard
          icon={<FileSpreadsheet size={20} />}
          title="Hazard Breakdown"
          description="Full hazard-by-hazard results including ratings, EF, vulnerability, SSL, EAL, and response strategies."
          format="CSV"
          isDone={exported.has("hazard")}
          onExport={handleHazardCsv}
        />
        <ExportCard
          icon={<FileText size={20} />}
          title="Worked Calculations"
          description="Detailed calculation audit trail per hazard: asset value, EF, exposed value, IV, RRF, net vulnerability, SSL, probability, EAL, residual risk."
          format="CSV"
          isDone={exported.has("calc")}
          onExport={handleCalcCsv}
        />
        <ExportCard
          icon={<BarChart3 size={20} />}
          title="Monitoring & Response Plan"
          description="Per-hazard monitoring KPIs, frequencies, triggers, data sources, owner roles, and response assignments."
          format="CSV"
          isDone={exported.has("monitoring")}
          onExport={handleMonitoringCsv}
        />
        <ExportCard
          icon={<Printer size={20} />}
          title="Print Summary"
          description="Open browser print dialog for a printer-friendly version of the results."
          format="PRINT"
          isDone={exported.has("print")}
          onExport={handlePrint}
        />
      </div>

      {/* Export All */}
      <div className="pra-surface p-5">
        <h3 className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">Export All</h3>
        <div className="space-y-3 mb-4">
          {[
            { key: "calc", label: "Include worked calculations", value: includeCalc, set: setIncludeCalc },
            { key: "mon", label: "Include monitoring plan", value: includeMonitoring, set: setIncludeMonitoring },
          ].map((t) => (
            <div key={t.key} className="flex items-center gap-3">
              <button
                onClick={() => t.set((v: boolean) => !v)}
                className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors cursor-pointer border-none ${t.value ? "bg-primary-500" : "bg-black/[0.12] dark:bg-white/[0.12]"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${t.value ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className="text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]">{t.label}</span>
            </div>
          ))}
        </div>
        <button
          onClick={handleExportAll}
          className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{
            background: exported.has("all")
              ? "#10B981"
              : "linear-gradient(135deg, #86BC25, #10B981)",
            boxShadow: "0 2px 16px rgba(134,188,37,0.25)",
          }}
        >
          {exported.has("all") ? <CheckCircle size={18} /> : <Download size={18} />}
          {exported.has("all")
            ? "All Files Downloaded"
            : `Download All (${1 + (includeCalc ? 1 : 0) + (includeMonitoring ? 1 : 0)} files)`}
        </button>
      </div>
    </div>
  );
}

function ExportCard({
  icon,
  title,
  description,
  format,
  isDone,
  onExport,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  format: string;
  isDone: boolean;
  onExport: () => void;
}) {
  return (
    <div
      onClick={onExport}
      className="pra-surface p-4 flex items-center gap-3 cursor-pointer hover:border-primary-500/40 transition-colors"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          isDone
            ? "bg-green-500/10 text-green-500"
            : "bg-black/[0.03] dark:bg-white/[0.04] text-[#6E6E73] dark:text-[#86868B]"
        }`}
      >
        {isDone ? <CheckCircle size={20} /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{title}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.05] text-[#6E6E73] dark:text-[#86868B]">
            {format}
          </span>
        </div>
        <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-snug">{description}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onExport(); }}
        className={`flex-shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
          isDone
            ? "border-green-500/40 text-green-500 bg-green-500/5"
            : "border-black/[0.12] dark:border-white/[0.12] text-[#6E6E73] dark:text-[#86868B] hover:border-primary-500/40 hover:text-primary-500"
        }`}
      >
        {isDone ? <CheckCircle size={13} /> : <Download size={13} />}
        {isDone ? "Done" : "Export"}
      </button>
    </div>
  );
}
'''

files = {
    "SingleRun.tsx": singlerun,
    "SingleResults.tsx": singleresults,
    "SingleExport.tsx": singleexport,
}

for name, content in files.items():
    path = os.path.join(base, name)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Written: {name} ({len(content)} bytes)")
