import revenueDisruptionJson from "../../data/physical/revenue_disruption.json";
import rdtDefaultJson from "../../data/physical/rdt_default.json";
import opexUpliftJson from "../../data/physical/opex_uplift.json";
import opexChronicRisksJson from "../../data/physical/opex_chronic_risks.json";
import responseActionsJson from "../../data/physical/response_actions.json";
import alraMeasureContributionsJson from "../../data/physical/alra_measure_contributions.json";
import monitoringConfigJson from "../../data/physical/monitoring_config.json";

type RatingMap = Record<string, [number, number]>;
type RevenueDisruptionTable = Record<string, RatingMap>;
type OpexUpliftTable = Record<string, Record<string, number>>;
type ResponseActionsTable = Record<string, string[]>;
type AlraMeasureContributions = Record<string, Record<string, number>>;
type MonitoringEntry = {
  kpi: string;
  trigger: string;
  review_freq: string;
  data_source: string;
  owner_role: string;
  owner_name: string;
};
type MonitoringTable = Record<string, MonitoringEntry>;

export const REVENUE_DISRUPTION_TABLE =
  revenueDisruptionJson as unknown as RevenueDisruptionTable;
export const RDT_DEFAULT = rdtDefaultJson as unknown as RatingMap;
export const OPEX_UPLIFT_TABLE = opexUpliftJson as OpexUpliftTable;
export const OPEX_CHRONIC_RISKS = opexChronicRisksJson as string[];
export const RESPONSE_ACTIONS_TABLE =
  responseActionsJson as ResponseActionsTable;
export const ALRA_MEASURE_CONTRIBUTIONS =
  alraMeasureContributionsJson as AlraMeasureContributions;
export const MONITORING_CONFIG_FULL = monitoringConfigJson as MonitoringTable;

export function getRevenueDisruption(
  assetType: string,
  hazardRating: string,
): [number, number] {
  const assetEntry = REVENUE_DISRUPTION_TABLE[assetType];
  if (assetEntry) {
    const val = assetEntry[hazardRating];
    if (val) return val;
  }
  const fallback = RDT_DEFAULT[hazardRating];
  return fallback ?? [0, 0];
}

export function getOpexUplift(risk: string, assetType: string): number {
  if (!OPEX_CHRONIC_RISKS.includes(risk)) return 0;
  return OPEX_UPLIFT_TABLE[risk]?.[assetType] ?? 0;
}

export function getResponseActions(risk: string): string[] {
  return (
    RESPONSE_ACTIONS_TABLE[risk] ?? [
      "Conduct detailed risk assessment",
      "Implement appropriate controls",
      "Monitor and review annually",
    ]
  );
}

export function getAlraMeasureContribution(
  measureKey: string,
  risk: string,
): number {
  return ALRA_MEASURE_CONTRIBUTIONS[measureKey]?.[risk] ?? 0;
}

export function computeAlraRrfForRisk(
  confirmedMeasureKeys: string[],
  risk: string,
): number {
  let total = 0;
  for (const key of confirmedMeasureKeys) {
    total += getAlraMeasureContribution(key, risk);
  }
  return Math.min(total, 0.7);
}
