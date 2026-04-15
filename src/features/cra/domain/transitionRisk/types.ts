export type TransitionRating =
  | "Extreme"
  | "Very High"
  | "High"
  | "Medium"
  | "Low"
  | "Negligible";

export type Scenario = "Orderly" | "Disorderly" | "Hot House World";
export type Horizon = "Short" | "Medium" | "Long";
export type IncomeGroup = "H" | "UM" | "LM" | "L";
export interface OrgProfile {
  id: string;
  orgName: string;
  sector: string;
  country: string;
  currency: string;
  annualRevenueLocal: number;
  annualOpexLocal: number;
  totalAssetValueLocal: number;
  assetRemainingLifeYears: number;
  revenueCarbonFraction: number;
  lowCarbonRevenueFraction: number;
  technologyDependency: number;
  internationalCapitalExposure: number;
  isListed: boolean;
  supplyChainCarbonExposure: number;
  hasTransitionPlan: boolean;
  disclosureQuality: number;
  currentPdBps: number;
}
export interface CountryPolicyData {
  ndc: number;
  carbon_price: number;
  credibility: number;
  income: string;
  energy_transition: number;
  fossil_dependent: boolean;
}

export interface SectorData {
  carbon_intensity_tco2_musd: number;
  stranded_asset_risk: number;
  tech_disruption: number;
  supply_chain_exposure: number;
  policy_sensitivity: number;
  market_sensitivity: number;
  legal_exposure: number;
  phase_out_year_orderly: number;
  phase_out_year_disorderly: number;
  description: string;
}

export interface NGFSScenarioData {
  full_name: string;
  description: string;
  carbon_price_short: Record<string, number>;
  carbon_price_medium: Record<string, number>;
  carbon_price_long: Record<string, number>;
  carbon_price_floor_short: Record<string, number>;
  carbon_price_floor_medium: Record<string, number>;
  carbon_price_floor_long: Record<string, number>;
  tech_speed_short: number;
  tech_speed_medium: number;
  tech_speed_long: number;
  policy_delivery_pct: number;
  market_premium_bps_short: number;
  market_premium_bps_medium: number;
  market_premium_bps_long: number;
  legal_multiplier: number;
}

export interface TimeHorizonData {
  label: string;
  mid_year: number;
  weight: number;
}
export interface DriverScores {
  policy: number;
  technology: number;
  market: number;
  legal: number;
}
export interface ScenarioHorizonResult {
  scenario: Scenario;
  horizon: Horizon;
  drivers: DriverScores;
  compositeScore: number;
  rating: TransitionRating;
  deltaPdBps: number;
  strandedDiscount: number;
  revenueErosionPct: number;
  revErosionEalLocal: number;
  opexComplianceEalLocal: number;
  strandingEalLocal: number;
  transitionEalLocal: number;
  transitionEalUsd: number;
  annualProbability: number;
}
export interface TransitionResult {
  org: OrgProfile;
  sectorData: SectorData;
  countryData: CountryPolicyData;
  scenarios: Record<Scenario, Record<Horizon, ScenarioHorizonResult>>;
  worstCase: ScenarioHorizonResult;
}
export interface TransitionConfig {
  assessorName: string;
  reportDate: string;
  usdRate: number;
  baseYear: number;
}
