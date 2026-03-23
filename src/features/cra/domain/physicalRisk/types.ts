export type HazardRating =
  | "Extreme"
  | "Very High"
  | "High"
  | "Medium"
  | "Low"
  | "Negligible";

export type RiskCategory =
  | "Meteorological"
  | "Hydrological"
  | "Climatological"
  | "Geophysical";

export interface PhysicalRisk {
  id: number;
  risk: string;
  category: RiskCategory;
  definition: string;
}

export interface SectorDefinition {
  name: string;
  subsectors: string[];
}

export interface MatrixConfig {
  size: number;
  matrix: Record<string, HazardRating>;
  intensityLabels: Record<number, string>;
  frequencyLabels: Record<number, string>;
  ratingLabels: string[];
  maxScore: number;
}

export interface AssessmentConfig {
  companyName: string;
  country: string;
  reportDate: string;
  assessorName: string;
  sectorId: string;
  subsector: string;
  matrixSize: number;
  currency: string;
  usdRate: number;
}

export interface MappedAsset {
  id: string;
  name: string;
  assetType: string;
  value: number;
  latitude: number;
  longitude: number;
  region: string;
  sector: string;
}

export interface ScreeningEntry {
  assetId: string;
  assetName: string;
  risks: string[];
}

export interface HazardResult {
  asset: string;
  risk: string;
  latitude: number;
  longitude: number;
  intensityScore: number;
  intensityLabel: string;
  frequencyScore: number;
  frequencyLabel: string;
  hazardRating: HazardRating;
  matrixSize: string;
}

export interface EnrichedResult extends HazardResult {
  assetType: string;
  assetValueLocal: number;
  assetValueUsd: number;
  exposureFactor: number;
  exposedValueLocal: number;
  exposedValueUsd: number;
  inherentVulnerability: number;
  sbraRrf: number;
  sbraNetVulnerability: number;
  annualProbability: number;
  riskScoreNorm: number;
  sslLocal: number;
  sslUsd: number;
  ealLocal: number;
  ealUsd: number;
  responseStrategy: string;
  responsePriority: string;
  responseTimeframe: string;
  residualReductionPct: number;
  residualRiskScore: number;
  residualRiskRating: HazardRating;
  monitoringKpi: string;
  monitoringFrequency: string;
}
