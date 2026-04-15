import type {
  OrgProfile,
  SectorData,
  CountryPolicyData,
  Scenario,
  Horizon,
  DriverScores,
  ScenarioHorizonResult,
  TransitionResult,
  TransitionRating,
} from "./types";
import {
  getCountryData,
  getSectorData,
  getScenario,
  getTimeHorizon,
} from "./transitionData";

const SCENARIOS: Scenario[] = ["Orderly", "Disorderly", "Hot House World"];
const HORIZONS: Horizon[] = ["Short", "Medium", "Long"];

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
function scorePolicyDriver(
  sector: SectorData,
  country: CountryPolicyData,
  org: OrgProfile,
  scenario: Scenario,
  horizon: Horizon,
): number {
  const sc = getScenario(scenario);
  const income = country.income as "H" | "UM" | "LM" | "L";
  const hKey = horizon.toLowerCase() as "short" | "medium" | "long";

  const basePrice = Math.max(country.carbon_price, 1);
  const multiplier =
    (sc[`carbon_price_${hKey}` as keyof typeof sc] as Record<string, number>)?.[
      income
    ] ?? 1;
  const floor =
    (
      sc[`carbon_price_floor_${hKey}` as keyof typeof sc] as Record<
        string,
        number
      >
    )?.[income] ?? 0;
  const effPrice = Math.max(basePrice * multiplier, floor);

  const carbonCostPctRevenue =
    ((sector.carbon_intensity_tco2_musd * effPrice) / 1_000_000) * 100;
  const policySens = sector.policy_sensitivity / 5;
  const countryFactor =
    (country.ndc / 5) * (country.credibility / 5) * sc.policy_delivery_pct;
  const revExposure =
    org.revenueCarbonFraction * (org.hasTransitionPlan ? 0.7 : 1.0);

  const raw = carbonCostPctRevenue * policySens * countryFactor * revExposure;
  return Math.min(100, raw * 4);
}

function scoreTechnologyDriver(
  sector: SectorData,
  country: CountryPolicyData,
  org: OrgProfile,
  scenario: Scenario,
  horizon: Horizon,
): number {
  const sc = getScenario(scenario);
  const hKey = horizon.toLowerCase() as "short" | "medium" | "long";

  const techVuln = sector.tech_disruption / 5;
  const adoptionSpeed = sc[`tech_speed_${hKey}` as keyof typeof sc] as number;
  const countrySpeed = country.energy_transition / 5;

  const phaseOutYear =
    scenario === "Orderly"
      ? sector.phase_out_year_orderly
      : sector.phase_out_year_disorderly;
  const yearsRemaining = Math.max(1, phaseOutYear - 2025);
  const th = getTimeHorizon(horizon);
  const timePressure = clamp((th.mid_year - 2025) / yearsRemaining, 0, 1);

  const techDep =
    org.technologyDependency * (1 - org.lowCarbonRevenueFraction * 0.5);

  const raw =
    techVuln * adoptionSpeed * countrySpeed * timePressure * techDep * 200;
  return Math.min(100, raw);
}

function scoreMarketDriver(
  sector: SectorData,
  country: CountryPolicyData,
  org: OrgProfile,
  scenario: Scenario,
  horizon: Horizon,
): number {
  const sc = getScenario(scenario);
  const hKey = horizon.toLowerCase() as "short" | "medium" | "long";

  const mktSens = sector.market_sensitivity / 5;
  const premiumBps = sc[
    `market_premium_bps_${hKey}` as keyof typeof sc
  ] as number;
  const premiumImpact = Math.min(1, premiumBps / 300);
  const intlExposure = org.internationalCapitalExposure;
  const listed = org.isListed ? 1.2 : 1.0;
  const supplyChain =
    (sector.supply_chain_exposure / 5) * org.supplyChainCarbonExposure;

  const incomeFactors: Record<string, number> = {
    H: 1.0,
    UM: 0.8,
    LM: 0.6,
    L: 0.4,
  };
  const incomeFactor = incomeFactors[country.income] ?? 0.6;

  let raw =
    mktSens * premiumImpact * intlExposure * listed * incomeFactor * 100;
  raw += supplyChain * 20;
  return Math.min(100, raw);
}

function scoreLegalDriver(
  sector: SectorData,
  country: CountryPolicyData,
  org: OrgProfile,
  scenario: Scenario,
  horizon: Horizon,
): number {
  const sc = getScenario(scenario);
  const legalBase = sector.legal_exposure / 5;
  const legalMult = sc.legal_multiplier;

  const highIncome = country.income === "H" || country.income === "UM";
  const credible = country.credibility >= 3;
  const legalJurisdiction = (highIncome ? 0.6 : 0) + (credible ? 0.4 : 0);

  const disclosureFactor = 1 - org.disclosureQuality * 0.5;
  const fossilPremium = sector.carbon_intensity_tco2_musd > 800 ? 1.5 : 1.0;
  const horizonFactors: Record<string, number> = {
    Short: 0.5,
    Medium: 1.0,
    Long: 1.5,
  };
  const hFactor = horizonFactors[horizon] ?? 1;

  const raw =
    legalBase *
    legalMult *
    legalJurisdiction *
    disclosureFactor *
    fossilPremium *
    hFactor *
    100;
  return Math.min(100, raw);
}
function computeCompositeScore(d: DriverScores): number {
  return d.policy * 0.35 + d.technology * 0.3 + d.market * 0.25 + d.legal * 0.1;
}

function scoreToRating(score: number): TransitionRating {
  if (score < 10) return "Negligible";
  if (score < 25) return "Low";
  if (score < 45) return "Medium";
  if (score < 65) return "High";
  if (score < 80) return "Very High";
  return "Extreme";
}
function computeDeltaPd(
  score: number,
  scenario: Scenario,
  horizon: Horizon,
  country: CountryPolicyData,
  org: OrgProfile,
): number {
  const basePd =
    score < 10
      ? 0
      : score < 25
        ? 8
        : score < 40
          ? 22
          : score < 55
            ? 55
            : score < 70
              ? 110
              : score < 85
                ? 195
                : 320;

  const scenarioMults: Record<string, number> = {
    Orderly: 0.7,
    Disorderly: 1.8,
    "Hot House World": 0.3,
  };
  const horizonMults: Record<string, number> = {
    Short: 0.4,
    Medium: 1.0,
    Long: 1.8,
  };
  const incomeMults: Record<string, number> = {
    H: 1.0,
    UM: 0.85,
    LM: 0.65,
    L: 0.45,
  };

  const pdAdj = Math.max(0.3, 1 - org.currentPdBps / 2000);

  return (
    basePd *
    (scenarioMults[scenario] ?? 1) *
    (horizonMults[horizon] ?? 1) *
    (incomeMults[country.income] ?? 0.65) *
    pdAdj
  );
}

function computeStrandedDiscount(
  sector: SectorData,
  country: CountryPolicyData,
  scenario: Scenario,
  horizon: Horizon,
  org: OrgProfile,
): number {
  if (sector.stranded_asset_risk <= 1) return 0;
  if (scenario === "Hot House World") return 0;

  const baseFraction = ((sector.stranded_asset_risk - 1) / 4) * 0.6;
  const phaseOutYear =
    scenario === "Orderly"
      ? sector.phase_out_year_orderly
      : sector.phase_out_year_disorderly;
  const remainingLife = Math.max(1, org.assetRemainingLifeYears);
  const beyondFraction = Math.max(
    0,
    (2025 + remainingLife - phaseOutYear) / remainingLife,
  );

  const credFactor =
    (country.credibility * getScenario(scenario).policy_delivery_pct) / 5;

  const horizonFactors: Record<string, number> = {
    Short: 0.2,
    Medium: 0.6,
    Long: 1.0,
  };
  const hf = horizonFactors[horizon] ?? 0.6;

  let discount = baseFraction * beyondFraction * credFactor * hf;
  if (sector.carbon_intensity_tco2_musd > 1000) discount *= 1.4;
  return clamp(discount, 0, 0.8);
}

function computeRevenueErosion(
  sector: SectorData,
  _country: CountryPolicyData,
  scenario: Scenario,
  horizon: Horizon,
  org: OrgProfile,
): number {
  const sc = getScenario(scenario);
  const hKey = horizon.toLowerCase() as "short" | "medium" | "long";
  const techSpeed = sc[`tech_speed_${hKey}` as keyof typeof sc] as number;
  const premiumBps = sc[
    `market_premium_bps_${hKey}` as keyof typeof sc
  ] as number;

  const horizonYears: Record<string, number> = {
    Short: 2,
    Medium: 7,
    Long: 20,
  };
  const hy = horizonYears[horizon] ?? 7;

  const techErosion =
    (sector.tech_disruption / 5) * techSpeed * Math.min(1, hy / 15) * 0.35;
  const mktErosion =
    (sector.market_sensitivity / 5) *
    (premiumBps / 300) *
    Math.min(1, hy / 20) *
    0.15;

  const lowCarbonOffset = org.lowCarbonRevenueFraction * 0.5;
  let total = Math.max(0, (techErosion + mktErosion) * (1 - lowCarbonOffset));

  const scenarioAdj: Record<string, number> = {
    Orderly: 0.7,
    Disorderly: horizon === "Medium" ? 1.8 : 1.3,
    "Hot House World": 0.2,
  };
  total *= scenarioAdj[scenario] ?? 1;
  return clamp(total * 100, 0, 80);
}
function computeTransitionEAL(
  org: OrgProfile,
  sector: SectorData,
  country: CountryPolicyData,
  score: number,
  revErosionPct: number,
  strandedDiscount: number,
  scenario: Scenario,
  horizon: Horizon,
  usdRate: number,
): {
  revErosionEal: number;
  opexComplianceEal: number;
  strandingEal: number;
  totalEal: number;
  totalEalUsd: number;
  annualProb: number;
} {
  const baseProbs: Record<string, Record<string, number>> = {
    Orderly: { Short: 0.05, Medium: 0.12, Long: 0.2 },
    Disorderly: { Short: 0.04, Medium: 0.25, Long: 0.35 },
    "Hot House World": { Short: 0.01, Medium: 0.03, Long: 0.06 },
  };
  const annualProb = (baseProbs[scenario]?.[horizon] ?? 0.1) * (score / 100);

  const revErosionEal =
    org.annualRevenueLocal * (revErosionPct / 100) * annualProb;

  const sc = getScenario(scenario);
  const hKey = horizon.toLowerCase() as "short" | "medium" | "long";
  const income = country.income as "H" | "UM" | "LM" | "L";
  const baseCP = Math.max(country.carbon_price, 1);
  const mult =
    (sc[`carbon_price_${hKey}` as keyof typeof sc] as Record<string, number>)?.[
      income
    ] ?? 1;
  const floor =
    (
      sc[`carbon_price_floor_${hKey}` as keyof typeof sc] as Record<
        string,
        number
      >
    )?.[income] ?? 0;
  const effCP = Math.max(baseCP * mult, floor);

  const revMusd = org.annualRevenueLocal / (usdRate * 1_000_000);
  const carbonLevyLocal =
    sector.carbon_intensity_tco2_musd * effCP * revMusd * usdRate;
  const opexComplianceEal =
    (org.annualOpexLocal * 0.05 + carbonLevyLocal) * annualProb;

  const remainingLife = Math.max(1, org.assetRemainingLifeYears);
  const strandingAnnual =
    (org.totalAssetValueLocal * strandedDiscount) / remainingLife;
  const strandingEal = strandingAnnual * annualProb;

  const totalEal = revErosionEal + opexComplianceEal + strandingEal;

  return {
    revErosionEal,
    opexComplianceEal,
    strandingEal,
    totalEal,
    totalEalUsd: totalEal / Math.max(usdRate, 1),
    annualProb,
  };
}
export function assessOrganisation(
  org: OrgProfile,
  usdRate: number,
): TransitionResult {
  const sectorData = getSectorData(org.sector);
  const countryData = getCountryData(org.country);

  const scenarios: Record<string, Record<string, ScenarioHorizonResult>> = {};
  let worstCase: ScenarioHorizonResult | null = null;

  for (const scenario of SCENARIOS) {
    scenarios[scenario] = {};
    for (const horizon of HORIZONS) {
      const drivers: DriverScores = {
        policy: scorePolicyDriver(
          sectorData,
          countryData,
          org,
          scenario,
          horizon,
        ),
        technology: scoreTechnologyDriver(
          sectorData,
          countryData,
          org,
          scenario,
          horizon,
        ),
        market: scoreMarketDriver(
          sectorData,
          countryData,
          org,
          scenario,
          horizon,
        ),
        legal: scoreLegalDriver(
          sectorData,
          countryData,
          org,
          scenario,
          horizon,
        ),
      };

      const compositeScore = computeCompositeScore(drivers);
      const rating = scoreToRating(compositeScore);
      const deltaPdBps = computeDeltaPd(
        compositeScore,
        scenario,
        horizon,
        countryData,
        org,
      );
      const strandedDiscount = computeStrandedDiscount(
        sectorData,
        countryData,
        scenario,
        horizon,
        org,
      );
      const revenueErosionPct = computeRevenueErosion(
        sectorData,
        countryData,
        scenario,
        horizon,
        org,
      );

      const eal = computeTransitionEAL(
        org,
        sectorData,
        countryData,
        compositeScore,
        revenueErosionPct,
        strandedDiscount,
        scenario,
        horizon,
        usdRate,
      );

      const result: ScenarioHorizonResult = {
        scenario,
        horizon,
        drivers,
        compositeScore,
        rating,
        deltaPdBps,
        strandedDiscount,
        revenueErosionPct,
        revErosionEalLocal: eal.revErosionEal,
        opexComplianceEalLocal: eal.opexComplianceEal,
        strandingEalLocal: eal.strandingEal,
        transitionEalLocal: eal.totalEal,
        transitionEalUsd: eal.totalEalUsd,
        annualProbability: eal.annualProb,
      };

      scenarios[scenario][horizon] = result;

      if (
        !worstCase ||
        result.transitionEalLocal > worstCase.transitionEalLocal
      ) {
        worstCase = result;
      }
    }
  }

  return {
    org,
    sectorData,
    countryData,
    scenarios: scenarios as TransitionResult["scenarios"],
    worstCase: worstCase!,
  };
}

export function runTransitionAssessment(
  orgs: OrgProfile[],
  usdRate: number,
): TransitionResult[] {
  return orgs.map((o) => assessOrganisation(o, usdRate));
}

export { scoreToRating, computeCompositeScore };
