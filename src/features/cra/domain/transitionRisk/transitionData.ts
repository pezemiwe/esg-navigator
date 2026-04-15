import COUNTRY_POLICY_DB from "../../data/transition/country_policy_db.json";
import COUNTRY_FALLBACKS from "../../data/transition/country_fallbacks.json";
import SECTOR_DB from "../../data/transition/sector_db.json";
import NGFS_SCENARIOS from "../../data/transition/ngfs_scenarios.json";
import TIME_HORIZONS from "../../data/transition/time_horizons.json";
import RATING_ICONS from "../../data/transition/rating_icons.json";

import type {
  CountryPolicyData,
  SectorData,
  NGFSScenarioData,
  TimeHorizonData,
  Scenario,
  Horizon,
} from "./types";
const countryDb = COUNTRY_POLICY_DB as Record<string, CountryPolicyData>;
const countryFallbacks = COUNTRY_FALLBACKS as Record<string, CountryPolicyData>;

export function getCountryData(country: string): CountryPolicyData {
  if (countryDb[country]) return { ...countryDb[country] };
  const lower = country.toLowerCase();
  for (const [key, val] of Object.entries(countryDb)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase()))
      return { ...val };
  }
  return { ...countryFallbacks["DEFAULT"] };
}

export function getCountryList(): string[] {
  return Object.keys(countryDb);
}
const sectorDb = SECTOR_DB as Record<string, SectorData>;
const DEFAULT_SECTOR: SectorData = {
  carbon_intensity_tco2_musd: 200,
  stranded_asset_risk: 2,
  tech_disruption: 2,
  supply_chain_exposure: 2,
  policy_sensitivity: 2,
  market_sensitivity: 2,
  legal_exposure: 1,
  phase_out_year_orderly: 2060,
  phase_out_year_disorderly: 2055,
  description: "Unclassified sector",
};

export function getSectorData(sector: string): SectorData {
  if (sectorDb[sector]) return { ...sectorDb[sector] };
  const lower = sector.toLowerCase();
  for (const [key, val] of Object.entries(sectorDb)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase()))
      return { ...val };
  }
  return { ...DEFAULT_SECTOR };
}

export function getSectorList(): string[] {
  return Object.keys(sectorDb);
}
const scenarioDb = NGFS_SCENARIOS as Record<string, NGFSScenarioData>;
const timeHorizons = TIME_HORIZONS as Record<string, TimeHorizonData>;

export function getScenario(s: Scenario): NGFSScenarioData {
  return scenarioDb[s];
}

export function getTimeHorizon(h: Horizon): TimeHorizonData {
  return timeHorizons[h];
}

export function getAllScenarios(): Record<string, NGFSScenarioData> {
  return scenarioDb;
}
const ratingIcons = RATING_ICONS as Record<string, string>;
export function getRatingIcon(rating: string): string {
  return ratingIcons[rating] ?? "?";
}
export const TRANSITION_RATING_COLORS: Record<string, string> = {
  Extreme: "#DC2626",
  "Very High": "#EA580C",
  High: "#F59E0B",
  Medium: "#EAB308",
  Low: "#22C55E",
  Negligible: "#94A3B8",
};
