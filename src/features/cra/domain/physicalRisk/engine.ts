import type {
  AssessmentConfig,
  MappedAsset,
  ScreeningEntry,
  HazardResult,
  EnrichedResult,
  HazardRating,
  MatrixConfig,
} from "./types";
import {
  ALL_21_RISKS,
  buildMatrixConfig,
  getRating,
  getExposureFactor,
  getAnnualProbability,
  RESPONSE_RULES,
  MONITORING_CONFIG,
  RATING_ORDER,
} from "./constants";
import { getInherentVulnerability } from "./vulnerabilityTable";
import { getSbraRrf, getSectorNameById } from "./sbraTable";

function locationHash(lat: number, lon: number, seed: number): number {
  const x = Math.sin(lat * 12.9898 + lon * 78.233 + seed * 43.321) * 43758.5453;
  return x - Math.floor(x);
}

function toScore(base: number, perturbation: number, maxScore: number): number {
  const raw = base * (maxScore - 1) + 1 + perturbation;
  return Math.max(1, Math.min(maxScore, Math.round(raw)));
}

function geoFactors(lat: number, lon: number) {
  const al = Math.abs(lat);
  const tropical = Math.max(0, 1 - al / 25);
  const sahel = Math.exp(-(((al - 15) / 5) ** 2));

  let coastLat = 5.5;
  if (lon >= -18 && lon < -10) coastLat = 13;
  else if (lon >= -10 && lon < -5) coastLat = 7;
  else if (lon >= -5 && lon < 2) coastLat = 5;
  else if (lon >= 2 && lon < 5) coastLat = 6;
  else if (lon >= 5 && lon < 10) coastLat = 5;
  else if (lon >= 10 && lon < 15) coastLat = 4;

  let coastDist: number;
  if (lon >= 35 && lon < 52) {
    coastDist = Math.abs(lon - 40);
  } else {
    coastDist = Math.abs(lat - coastLat);
  }
  const coastal = Math.max(0, 1 - coastDist / 2.5);

  const rift =
    Math.exp(-(((lon - 35) / 8) ** 2)) * Math.max(0, 1 - Math.abs(al - 5) / 15);

  return { tropical, sahel, coastal, rift, al };
}

function computeBaseScores(
  risk: string,
  lat: number,
  lon: number,
): [number, number] {
  const { tropical, sahel, coastal, rift, al } = geoFactors(lat, lon);

  switch (risk) {
    case "Extreme Heat":
      return [
        0.3 + tropical * 0.4 + sahel * 0.25,
        0.25 + tropical * 0.35 + sahel * 0.25,
      ];
    case "Drought":
      return [0.1 + sahel * 0.65, 0.1 + sahel * 0.55];
    case "Tropical Cyclones":
      return [
        tropical * 0.5 * Math.max(coastal, 0.1),
        tropical * 0.4 * Math.max(coastal, 0.1),
      ];
    case "Thunderstorms & Lightning":
      return [0.25 + tropical * 0.5, 0.3 + tropical * 0.45];
    case "Sandstorms / Harmattan":
      return [sahel * 0.75 + 0.05, sahel * 0.65 + 0.05];
    case "Heavy Rainfall":
      return [
        0.2 + tropical * 0.5 * (1 - sahel * 0.5),
        0.25 + tropical * 0.45 * (1 - sahel * 0.5),
      ];
    case "River Flooding":
      return [0.15 + tropical * 0.35 * (1 - sahel * 0.3), 0.1 + tropical * 0.3];
    case "Flash Flooding":
      return [0.15 + tropical * 0.4, 0.15 + tropical * 0.35];
    case "Coastal Flooding":
      return [coastal * 0.7 + 0.05, coastal * 0.5 + 0.05];
    case "Storm Surge":
      return [
        coastal * 0.65 * (0.5 + tropical * 0.5),
        coastal * 0.55 * (0.5 + tropical * 0.5),
      ];
    case "Landslides": {
      const hill = Math.exp(-(((al - 8) / 6) ** 2)) * (1 - coastal * 0.6);
      return [hill * 0.45 + 0.05, hill * 0.35 + 0.05];
    }
    case "Coastal & Riverbank Erosion":
      return [coastal * 0.65 + 0.05, coastal * 0.55 + 0.05];
    case "Groundwater Flooding":
      return [
        coastal * 0.5 + tropical * 0.15 + 0.05,
        coastal * 0.4 + tropical * 0.15 + 0.05,
      ];
    case "Sea Level Rise":
      return [coastal * 0.6 + 0.05, coastal * 0.5 + 0.05];
    case "Desertification":
      return [sahel * 0.7 + 0.05, sahel * 0.6 + 0.05];
    case "Wildfire / Bushfire": {
      const savanna = sahel * 0.4 + Math.max(0, 1 - al / 20) * 0.3;
      return [savanna + 0.1, savanna + 0.08];
    }
    case "Water Scarcity":
      return [0.15 + sahel * 0.55, 0.1 + sahel * 0.5];
    case "Glacial Retreat": {
      const mtn =
        Math.exp(-(((al - 3) / 5) ** 2)) * Math.exp(-(((lon - 37) / 5) ** 2));
      return [mtn * 0.35 + 0.02, mtn * 0.3 + 0.02];
    }
    case "Earthquakes":
      return [rift * 0.55 + 0.08, rift * 0.4 + 0.05];
    case "Volcanic Eruptions":
      return [rift * 0.45 + 0.02, rift * 0.35 + 0.02];
    case "Tsunamis":
      return [
        coastal * 0.4 * (0.3 + rift * 0.7) + 0.02,
        coastal * 0.3 * (0.3 + rift * 0.7) + 0.02,
      ];
    default:
      return [0.25, 0.2];
  }
}

function scoreToRating(score: number): HazardRating {
  if (score >= 84) return "Extreme";
  if (score >= 67) return "Very High";
  if (score >= 50) return "High";
  if (score >= 34) return "Medium";
  if (score >= 17) return "Low";
  return "Negligible";
}

export function assessHazard(
  risk: string,
  riskId: number,
  lat: number,
  lon: number,
  mc: MatrixConfig,
): { intensityScore: number; frequencyScore: number } {
  const [baseI, baseF] = computeBaseScores(risk, lat, lon);
  const h = locationHash(lat, lon, riskId);
  const p = (h - 0.5) * 0.12;
  return {
    intensityScore: toScore(baseI, p * mc.size, mc.size),
    frequencyScore: toScore(baseF, p * 0.8 * mc.size, mc.size),
  };
}

function enrichResult(
  hr: HazardResult,
  asset: MappedAsset,
  config: AssessmentConfig,
): EnrichedResult {
  const assetValueLocal = asset.value;
  const rate = config.usdRate || 1;
  const assetValueUsd = assetValueLocal / rate;
  const ef = getExposureFactor(asset.assetType, hr.hazardRating);
  const exposedValueLocal = assetValueLocal * ef;
  const exposedValueUsd = exposedValueLocal / rate;
  const iv = getInherentVulnerability(hr.risk, asset.assetType);
  const sectorName = getSectorNameById(config.sectorId);
  const rrf = getSbraRrf(
    hr.risk,
    asset.assetType,
    sectorName,
    config.subsector,
  );
  const netV = iv * (1 - rrf);
  const sslLocal = assetValueLocal * ef * netV;
  const sslUsd = sslLocal / rate;
  const ap = getAnnualProbability(hr.frequencyLabel);
  const ealLocal = sslLocal * ap;
  const ealUsd = ealLocal / rate;
  const riskScoreNorm = Math.round((RATING_ORDER[hr.hazardRating] / 6) * 100);
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
  };
}

export function suggestRisksForAsset(lat: number, lon: number): string[] {
  return ALL_21_RISKS.filter((r) => {
    const [i, f] = computeBaseScores(r.risk, lat, lon);
    return (i + f) / 2 > 0.15;
  }).map((r) => r.risk);
}

export function runPhysicalRiskAssessment(
  config: AssessmentConfig,
  assets: MappedAsset[],
  screening: ScreeningEntry[],
): EnrichedResult[] {
  const mc = buildMatrixConfig(config.matrixSize);
  const results: EnrichedResult[] = [];

  const screeningMap = new Map<string, string[]>();
  for (const entry of screening) {
    screeningMap.set(entry.assetId, entry.risks);
  }

  for (const asset of assets) {
    const risksForAsset = screeningMap.get(asset.id) ?? [];
    for (const riskName of risksForAsset) {
      const riskDef = ALL_21_RISKS.find((r) => r.risk === riskName);
      if (!riskDef) continue;

      const { intensityScore, frequencyScore } = assessHazard(
        riskName,
        riskDef.id,
        asset.latitude,
        asset.longitude,
        mc,
      );
      const rating = getRating(mc, intensityScore, frequencyScore);

      const hazardResult: HazardResult = {
        asset: asset.name,
        risk: riskName,
        latitude: asset.latitude,
        longitude: asset.longitude,
        intensityScore,
        intensityLabel:
          mc.intensityLabels[intensityScore] ?? String(intensityScore),
        frequencyScore,
        frequencyLabel:
          mc.frequencyLabels[frequencyScore] ?? String(frequencyScore),
        hazardRating: rating,
        matrixSize: `${mc.size}x${mc.size}`,
      };

      results.push(enrichResult(hazardResult, asset, config));
    }
  }

  return results;
}
