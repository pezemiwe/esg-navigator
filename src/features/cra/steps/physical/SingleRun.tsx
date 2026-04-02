import React, { useCallback, useState } from "react";
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
