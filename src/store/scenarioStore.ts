import { create } from "zustand";
import { persist } from "zustand/middleware";
export type ScenarioType = "orderly" | "disorderly" | "hothouse" | "custom";
export type HorizonType = "short" | "medium" | "long";
export const TIME_HORIZONS = {
  short: { start: 1, end: 3, label: "Short (1-3y)" },
  medium: { start: 3, end: 10, label: "Medium (3-10y)" },
  long: { start: 10, end: 30, label: "Long (10-30y)" },
};
export const NGFS_SCENARIOS = {
  orderly: {
    name: "Orderly Transition (Net Zero 2050)",
    description:
      "Immediate climate policy action with smooth transition to net zero by 2050",
    icon: "🌱",
    color: "#10B981",
  },
  disorderly: {
    name: "Disorderly Transition",
    description:
      "Delayed action leading to abrupt policy changes and market disruption",
    icon: "⚡",
    color: "#F59E0B",
  },
  hothouse: {
    name: "Hot House World (Current Policies)",
    description:
      "Limited climate action resulting in severe physical climate impacts",
    icon: "🔥",
    color: "#EF4444",
  },
  custom: {
    name: "Custom Scenario",
    description: "User-defined scenario with custom parameters",
    icon: "⚙️",
    color: "#6366F1",
  },
};
export interface MacroShocks {
  gdp: number;
  inflation: number;
  interestRate: number;
}
export const DEFAULT_SCENARIO_PARAMS = {
  orderly: {
    carbonPrice: { short: 50, medium: 150, long: 200 },
    physicalDamage: { short: 0.02, medium: 0.05, long: 0.1 },
    macroShocks: {
      short: { gdp: -0.5, inflation: 0.5, interestRate: 0.5 },
      medium: { gdp: -1.0, inflation: 0.3, interestRate: 0.3 },
      long: { gdp: -0.8, inflation: 0.2, interestRate: 0.0 },
    },
    temperatureRise: 1.5,
  },
  disorderly: {
    carbonPrice: { short: 20, medium: 180, long: 250 },
    physicalDamage: { short: 0.03, medium: 0.1, long: 0.2 },
    macroShocks: {
      short: { gdp: -2.5, inflation: 3.0, interestRate: 3.5 },
      medium: { gdp: -2.0, inflation: 2.0, interestRate: 2.5 },
      long: { gdp: -1.0, inflation: 0.5, interestRate: 0.5 },
    },
    temperatureRise: 1.8,
  },
  hothouse: {
    carbonPrice: { short: 10, medium: 15, long: 20 },
    physicalDamage: { short: 0.05, medium: 0.2, long: 0.5 },
    macroShocks: {
      short: { gdp: -0.3, inflation: 0.2, interestRate: 0.0 },
      medium: { gdp: -1.5, inflation: 1.0, interestRate: 0.5 },
      long: { gdp: -3.5, inflation: 2.5, interestRate: 1.5 },
    },
    temperatureRise: 3.2,
  },
  custom: {
    carbonPrice: { short: 50, medium: 100, long: 150 },
    physicalDamage: { short: 0.05, medium: 0.15, long: 0.3 },
    macroShocks: {
      short: { gdp: -1.0, inflation: 0.5, interestRate: 0.5 },
      medium: { gdp: -1.5, inflation: 1.0, interestRate: 1.0 },
      long: { gdp: -2.0, inflation: 1.5, interestRate: 1.0 },
    },
    temperatureRise: 2.0,
  },
};
export const SECTOR_BETAS: Record<
  string,
  { betaCarbon: number; betaGDP: number; physicalMultiplier?: number }
> = {
  "Oil & Gas": { betaCarbon: 0.0045, betaGDP: -0.45 },
  "Coal Mining": { betaCarbon: 0.005, betaGDP: -0.42 },
  "Electricity Generation": { betaCarbon: 0.004, betaGDP: -0.25 },
  "Air Transport": { betaCarbon: 0.0035, betaGDP: -0.55 },
  "Cement & Construction": { betaCarbon: 0.0038, betaGDP: -0.5 },
  Agriculture: {
    betaCarbon: 0.0015,
    betaGDP: -0.3,
    physicalMultiplier: 1.5,
  },
  "Financial Services": { betaCarbon: 0.001, betaGDP: -0.4 },
  Technology: { betaCarbon: 0.0008, betaGDP: -0.35 },
  Healthcare: { betaCarbon: 0.0005, betaGDP: -0.2 },
  "Real Estate": {
    betaCarbon: 0.0012,
    betaGDP: -0.48,
    physicalMultiplier: 1.5,
  },
  Unclassified: { betaCarbon: 0.001, betaGDP: -0.35 },
};
export interface ECLResults {
  baselineECL: number;
  stressedECL: number;
  deltaECL: number;
  deltaECLPercent: number;
  var99_9: number;
  pillar2CapitalAddon: number;
  liquidityImpact: number;
  sectorBreakdown: Record<
    string,
    {
      baseline: number;
      stressed: number;
      delta: number;
    }
  >;
}
export interface ScenarioRunResults {
  scenario: ScenarioType;
  horizon: HorizonType;
  eclResults: ECLResults;
  portfolioValueAtRisk: number;
  impliedTemperatureRise: number;
  capitalImpactPercent: number;
  timestamp: string;
  carbonPrice: number;
  physicalDamageIndex: number;
  macroShocks: MacroShocks;
  avgPDUplift: number;
  avgLGDUplift: number;
  equityRevaluation: number;
  bondRevaluation: number;
  varResult: {
    var99_9: number;
    expectedLoss: number;
    unexpectedLoss: number;
    confidenceLevel: number;
    meanLoss?: number;
    maxLoss?: number;
    eventBreakdown?: Array<{
      eventType: string;
      frequency: number;
      averageSeverity: number;
      totalLoss: number;
    }>;
  };
  monteCarloCATResults?: {
    trials: number;
    meanLoss: number;
    var99_9: number;
    maxLoss: number;
    simulatedLosses: number[];
    eventBreakdown: Array<{
      eventType: string;
      frequency: number;
      averageSeverity: number;
      totalLoss: number;
    }>;
  };
  catModelResults?: {
    flood: number;
    drout: number;
    cyclone: number;
    wildfire: number;
    total: number;
  };
}
export interface ScenarioConfig {
  id: string;
  name: string;
  horizon: HorizonType;
  type: ScenarioType;
  carbonPrice: number;
  gdpShock: number;
  inflationShock: number;
  interestRateShock: number;
  physicalDamageIndex: number;
  betaCarbon: number;
  betaGDP: number;
  betaPhysical: number;
  monteCarloTrials: number;
  varConfidence: number;
  createdAt: string;
  status: "draft" | "running" | "completed";
}
interface ScenarioStore {
  activeScenario: ScenarioConfig | null;
  results: ScenarioRunResults[];
  comparisonView: boolean;
  createScenario: (
    type: ScenarioType,
    horizon: HorizonType,
    name?: string,
  ) => void;
  updateParameter: (key: string, value: number) => void;
  runScenario: (portfolioData?: {
    totalExposure?: number;
    sectorDistribution?: Record<string, number>;
  }) => Promise<void>;
  runAllScenarios: (portfolioData?: {
    totalExposure?: number;
    sectorDistribution?: Record<string, number>;
  }) => Promise<void>;
  resetScenario: () => void;
  deleteResult: (resultId: string) => void;
  toggleComparison: () => void;
  exportResults: () => void;
}
export const useScenarioStore = create<ScenarioStore>()(
  persist(
    (set, get) => ({
      activeScenario: null,
      results: [],
      comparisonView: false,
      createScenario: (type, horizon, name) => {
        const params = DEFAULT_SCENARIO_PARAMS[type];
        const horizonParams = params.macroShocks[horizon];
        const carbonPrice = params.carbonPrice[horizon];
        const physicalDamage = params.physicalDamage[horizon];
        set({
          activeScenario: {
            id: `sc-${Date.now()}`,
            name: name || NGFS_SCENARIOS[type].name,
            horizon,
            type,
            carbonPrice,
            gdpShock: horizonParams.gdp,
            inflationShock: horizonParams.inflation,
            interestRateShock: horizonParams.interestRate,
            physicalDamageIndex: physicalDamage,
            betaCarbon: 0.0008,
            betaGDP: -0.15,
            betaPhysical: 1.0,
            monteCarloTrials: 1000,
            varConfidence: 0.999,
            createdAt: new Date().toISOString(),
            status: "draft",
          },
        });
      },
      updateParameter: (key, value) =>
        set((state) => {
          if (!state.activeScenario) return {};
          return {
            activeScenario: {
              ...state.activeScenario,
              [key]: value,
            },
          };
        }),
      runScenario: async (portfolioData) => {
        const scenario = get().activeScenario;
        if (!scenario) return;
        set((state) => ({
          activeScenario: state.activeScenario
            ? { ...state.activeScenario, status: "running" }
            : null,
        }));
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const result = calculateScenarioImpact(scenario, portfolioData);
        set((state) => ({
          activeScenario: state.activeScenario
            ? { ...state.activeScenario, status: "completed" }
            : null,
          results: [...state.results, result],
        }));
      },
      runAllScenarios: async (portfolioData) => {
        const currentScenario = get().activeScenario;
        if (!currentScenario) return;
        const scenarios: Array<{ type: ScenarioType; horizon: HorizonType }> =
          [];
        const types: ScenarioType[] = ["orderly", "disorderly", "hothouse"];
        const horizons: HorizonType[] = ["short", "medium", "long"];
        types.forEach((type) => {
          horizons.forEach((horizon) => {
            scenarios.push({ type, horizon });
          });
        });
        const results: ScenarioRunResults[] = [];
        for (const { type, horizon } of scenarios) {
          const params = DEFAULT_SCENARIO_PARAMS[type];
          const horizonParams = params.macroShocks[horizon];
          const tempScenario: ScenarioConfig = {
            ...currentScenario,
            id: `sc-${type}-${horizon}-${Date.now()}`,
            name: `${NGFS_SCENARIOS[type].name} - ${TIME_HORIZONS[horizon].label}`,
            type,
            horizon,
            carbonPrice: params.carbonPrice[horizon],
            gdpShock: horizonParams.gdp,
            inflationShock: horizonParams.inflation,
            interestRateShock: horizonParams.interestRate,
            physicalDamageIndex: params.physicalDamage[horizon],
          };
          const result = calculateScenarioImpact(tempScenario, portfolioData);
          results.push(result);
        }
        set((state) => ({
          results: [...state.results, ...results],
        }));
      },
      resetScenario: () => set({ activeScenario: null }),
      deleteResult: (resultId) =>
        set((state) => ({
          results: state.results.filter(
            (r) => `${r.scenario}-${r.horizon}-${r.timestamp}` !== resultId,
          ),
        })),
      toggleComparison: () =>
        set((state) => ({ comparisonView: !state.comparisonView })),
      exportResults: () => {
        const results = get().results;
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `scenario-analysis-results-${new Date().toISOString()}.json`;
        link.click();
      },
    }),
    {
      name: "scenario-store",
    },
  ),
);
function calculateScenarioImpact(
  scenario: ScenarioConfig,
  portfolioData?: {
    totalExposure?: number;
    sectorDistribution?: Record<string, number>;
  },
): ScenarioRunResults {
  const defaultExposure = 15000000000;
  const baselinePD = 0.025;
  const baselineLGD = 0.45;
  const exposure = portfolioData?.totalExposure || defaultExposure;
  const logitPD0 = Math.log(baselinePD / (1 - baselinePD));
  const carbonImpact = scenario.betaCarbon * scenario.carbonPrice * 0.3;
  const gdpImpact = scenario.betaGDP * scenario.gdpShock;
  const logitPDStressed = logitPD0 + carbonImpact + gdpImpact;
  const stressedPD = 1 / (1 + Math.exp(-logitPDStressed));
  const pdUplift = Math.min(stressedPD - baselinePD, 0.5);
  const lgdUplift = scenario.physicalDamageIndex * scenario.betaPhysical * 0.25;
  const stressedLGD = Math.min(baselineLGD + lgdUplift, 1.0);
  const baselineECL = exposure * baselinePD * baselineLGD;
  const stressedECL = exposure * stressedPD * stressedLGD;
  const deltaECL = stressedECL - baselineECL;
  const deltaECLPercent = (deltaECL / exposure) * 100;
  const equityRevaluation = calculateEquityImpact(scenario, exposure);
  const bondRevaluation = calculateBondImpact(scenario, exposure);
  const catResults = runMonteCarloCAT(scenario, exposure);
  const simulatedLosses =
    catResults.simulatedLosses?.sort((a: number, b: number) => a - b) || [];
  const maxLoss =
    simulatedLosses.length > 0
      ? simulatedLosses[simulatedLosses.length - 1]
      : catResults.total * 5;
  const catVaR99_9 =
    simulatedLosses.length > 0
      ? simulatedLosses[Math.floor(simulatedLosses.length * 0.999)]
      : catResults.total * 3;
  const var99_9 = calculateVaR(deltaECL, catResults, 0.999);
  const pillar2CapitalAddon = deltaECL * 0.125;
  const liquidityImpact = exposure * scenario.physicalDamageIndex * 0.15;
  const impliedTemperatureRise =
    DEFAULT_SCENARIO_PARAMS[scenario.type].temperatureRise;
  let sectorBreakdown: Record<
    string,
    { baseline: number; stressed: number; delta: number }
  > = {};
  const hasSectorData =
    portfolioData?.sectorDistribution &&
    Object.keys(portfolioData.sectorDistribution).length > 0;
  if (hasSectorData) {
    Object.entries(
      portfolioData.sectorDistribution as Record<string, number>,
    ).forEach(([sector, sectorExposure]) => {
      const betas = SECTOR_BETAS[sector] || SECTOR_BETAS["Unclassified"];
      const sectorBaselineECL = sectorExposure * baselinePD * baselineLGD;
      const sectorCarbonImpact = betas.betaCarbon * scenario.carbonPrice * 0.3;
      const sectorGdpImpact = betas.betaGDP * scenario.gdpShock;
      const sectorLogitPD = logitPD0 + sectorCarbonImpact + sectorGdpImpact;
      const sectorStressedPD = 1 / (1 + Math.exp(-sectorLogitPD));
      const physicalMult = betas.physicalMultiplier || 1.0;
      const sectorLgdUplift = lgdUplift * physicalMult;
      const sectorStressedLGD = Math.min(baselineLGD + sectorLgdUplift, 1.0);
      const sectorStressedECL =
        sectorExposure * sectorStressedPD * sectorStressedLGD;
      sectorBreakdown[sector] = {
        baseline: sectorBaselineECL,
        stressed: sectorStressedECL,
        delta: sectorStressedECL - sectorBaselineECL,
      };
    });
  } else {
    sectorBreakdown = {
      "Oil & Gas": {
        baseline: baselineECL * 0.25,
        stressed: stressedECL * 0.3,
        delta: stressedECL * 0.3 - baselineECL * 0.25,
      },
      Agriculture: {
        baseline: baselineECL * 0.2,
        stressed: stressedECL * 0.22,
        delta: stressedECL * 0.22 - baselineECL * 0.2,
      },
      "Real Estate": {
        baseline: baselineECL * 0.15,
        stressed: stressedECL * 0.18,
        delta: stressedECL * 0.18 - baselineECL * 0.15,
      },
      Manufacturing: {
        baseline: baselineECL * 0.15,
        stressed: stressedECL * 0.15,
        delta: stressedECL * 0.15 - baselineECL * 0.15,
      },
      Other: {
        baseline: baselineECL * 0.25,
        stressed: stressedECL * 0.15,
        delta: stressedECL * 0.15 - baselineECL * 0.25,
      },
    };
  }
  return {
    scenario: scenario.type,
    horizon: scenario.horizon,
    eclResults: {
      baselineECL,
      stressedECL,
      deltaECL,
      deltaECLPercent,
      var99_9,
      pillar2CapitalAddon,
      liquidityImpact,
      sectorBreakdown,
    },
    varResult: {
      var99_9,
      expectedLoss: deltaECL,
      unexpectedLoss: var99_9 - deltaECL,
      confidenceLevel: 0.999,
      meanLoss: deltaECL,
      maxLoss: deltaECL * 1.5,
      eventBreakdown: [
        {
          eventType: "Credit Risk",
          frequency: 0.8,
          averageSeverity: 0.6,
          totalLoss: deltaECL * 0.7,
        },
        {
          eventType: "Market Risk",
          frequency: 0.5,
          averageSeverity: 0.4,
          totalLoss: deltaECL * 0.2,
        },
        {
          eventType: "Operational Risk",
          frequency: 0.2,
          averageSeverity: 0.3,
          totalLoss: deltaECL * 0.1,
        },
      ],
    },
    monteCarloCATResults: {
      trials: scenario.monteCarloTrials || 2000,
      meanLoss: catResults.total,
      var99_9: catVaR99_9,
      maxLoss: maxLoss,
      simulatedLosses: simulatedLosses,
      eventBreakdown: [
        {
          eventType: "Flood",
          frequency: 0.05,
          averageSeverity: catResults.flood > 0 ? catResults.flood / 0.05 : 0,
          totalLoss: catResults.flood,
        },
        {
          eventType: "Drout",
          frequency: 0.03,
          averageSeverity:
            catResults.drout > 0 ? catResults.drout / 0.03 : 0,
          totalLoss: catResults.drout,
        },
        {
          eventType: "Cyclone",
          frequency: 0.01,
          averageSeverity:
            catResults.cyclone > 0 ? catResults.cyclone / 0.01 : 0,
          totalLoss: catResults.cyclone,
        },
        {
          eventType: "Wildfire",
          frequency: 0.02,
          averageSeverity:
            catResults.wildfire > 0 ? catResults.wildfire / 0.02 : 0,
          totalLoss: catResults.wildfire,
        },
      ],
    },
    portfolioValueAtRisk: var99_9,
    impliedTemperatureRise,
    capitalImpactPercent: (pillar2CapitalAddon / exposure) * 100,
    timestamp: new Date().toISOString(),
    carbonPrice: scenario.carbonPrice,
    physicalDamageIndex: scenario.physicalDamageIndex,
    macroShocks: {
      gdp: scenario.gdpShock,
      inflation: scenario.inflationShock,
      interestRate: scenario.interestRateShock,
    },
    avgPDUplift: pdUplift,
    avgLGDUplift: lgdUplift,
    equityRevaluation,
    bondRevaluation,
    catModelResults: catResults,
  };
}
function calculateEquityImpact(
  scenario: ScenarioConfig,
  exposure: number,
): number {
  const equityExposure = exposure * 0.08;
  const transitionShock = (scenario.carbonPrice / 100) * -0.15;
  const physicalShock = scenario.physicalDamageIndex * -0.2;
  return equityExposure * (transitionShock + physicalShock);
}
function calculateBondImpact(
  scenario: ScenarioConfig,
  exposure: number,
): number {
  const bondExposure = exposure * 0.12;
  const durationShock = scenario.interestRateShock * -5.5;
  return bondExposure * (durationShock / 100);
}
function runMonteCarloCAT(scenario: ScenarioConfig, exposure: number) {
  const TRIALS = scenario.monteCarloTrials || 2000;
  const physicalMultiplier = 1 + scenario.physicalDamageIndex * 2;
  const PROBS = {
    flood: 0.05 * physicalMultiplier,
    drout: 0.03 * physicalMultiplier,
    cyclone: 0.01 * physicalMultiplier,
    wildfire: 0.02 * physicalMultiplier,
  };
  const SEVERITY_MEAN = {
    flood: 0.15,
    drout: 0.1,
    cyclone: 0.25,
    wildfire: 0.05,
  };
  let totalSimulatedLoss = 0;
  const eventLosses = {
    flood: 0,
    drout: 0,
    cyclone: 0,
    wildfire: 0,
  };
  const losses: number[] = [];
  for (let i = 0; i < TRIALS; i++) {
    let trialLoss = 0;
    if (Math.random() < PROBS.flood) {
      const severity = sampleLogNormal(SEVERITY_MEAN.flood, 0.8);
      const loss = exposure * Math.min(severity, 1.0);
      trialLoss += loss;
      eventLosses.flood += loss;
    }
    if (Math.random() < PROBS.drout) {
      const severity = sampleLogNormal(SEVERITY_MEAN.drout, 0.4);
      const loss = exposure * Math.min(severity, 1.0);
      trialLoss += loss;
      eventLosses.drout += loss;
    }
    if (Math.random() < PROBS.cyclone) {
      const severity = sampleLogNormal(SEVERITY_MEAN.cyclone, 1.2);
      const loss = exposure * Math.min(severity, 1.0);
      trialLoss += loss;
      eventLosses.cyclone += loss;
    }
    if (Math.random() < PROBS.wildfire) {
      const severity = sampleLogNormal(SEVERITY_MEAN.wildfire, 0.6);
      const loss = exposure * Math.min(severity, 1.0);
      trialLoss += loss;
      eventLosses.wildfire += loss;
    }
    losses.push(trialLoss);
    totalSimulatedLoss += trialLoss;
  }
  const meanLoss = totalSimulatedLoss / TRIALS;
  return {
    flood: eventLosses.flood / TRIALS,
    drout: eventLosses.drout / TRIALS,
    cyclone: eventLosses.cyclone / TRIALS,
    wildfire: eventLosses.wildfire / TRIALS,
    total: meanLoss,
    simulatedLosses: losses,
  };
}
function sampleLogNormal(mean: number, sigma: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const mu = Math.log(mean) - (sigma * sigma) / 2;
  return Math.exp(mu + sigma * z);
}
function calculateVaR(
  deltaECL: number,
  catResults: { simulatedLosses?: number[]; total?: number },
  confidence: number,
): number {
  if (catResults.simulatedLosses) {
    const sortedLosses = [...catResults.simulatedLosses].sort((a, b) => a - b);
    const index = Math.floor(sortedLosses.length * confidence);
    const catVaR = sortedLosses[Math.min(index, sortedLosses.length - 1)];
    const creditVolatility = deltaECL * 0.4;
    const zScore = confidence >= 0.999 ? 3.09 : 2.33;
    const creditVaR = deltaECL + zScore * creditVolatility;
    return creditVaR + catVaR;
  }
  const expectedLoss = deltaECL + (catResults.total || 0);
  const volatility = expectedLoss * 0.35;
  const zScore = confidence === 0.999 ? 3.09 : 2.33;
  return expectedLoss + zScore * volatility;
}
