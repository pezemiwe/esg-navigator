import type {
  SustainabilityRisk,
  Scope1Asset,
  Scope2Entry,
  Scope3Entry,
} from "@/store/sustainabilityStore";

export const EMISSION_FACTORS = {
  diesel: 2.68,
  petrol: 2.31,
  lpg: 1.51,
  cng: 2.0,
  nigeriaGrid: 0.43,
} as const;

export const SECTOR_INTENSITY_FACTORS: Record<string, number> = {
  "Oil & Gas": 0.0000021,
  Agriculture: 0.0000015,
  "Real Estate": 0.0000008,
  Manufacturing: 0.0000018,
  "SME / Retail": 0.0000005,
  "Power & Utilities": 0.0000025,
  Transportation: 0.0000019,
  Telecommunications: 0.0000004,
};

export const calculateScope1 = (assets: Scope1Asset[]): number => {
  return assets.reduce((total, asset) => {
    const factor = EMISSION_FACTORS[asset.fuelType] || 0;
    return total + asset.litersPerMonth * asset.months * factor;
  }, 0);
};

export const calculateScope2 = (entries: Scope2Entry[]): number => {
  return entries.reduce((total, entry) => {
    const factor =
      entry.source === "grid"
        ? EMISSION_FACTORS.nigeriaGrid
        : entry.emissionFactor || 0;
    return total + entry.kwhPerMonth * entry.months * factor;
  }, 0);
};

export const calculateScope3 = (entries: Scope3Entry[]): number => {
  return entries.reduce((total, entry) => {
    return total + entry.loanExposure * entry.intensityFactor;
  }, 0);
};

export const runScenarioSimulation = (
  scenarioType: string,
  scope1: number,
  scope2: number,
  scope3: number,
  loanBook: number,
) => {
  const totalEmissions = scope1 + scope2 + scope3;

  switch (scenarioType) {
    case "carbon_tax": {
      const taxRate = 50;
      const estimatedCost = totalEmissions * taxRate;
      return {
        totalEmissions,
        estimatedCost,
        profitImpact: -(estimatedCost / loanBook) * 100,
        nplIncrease: 2.3,
        capitalAdequacyEffect: -0.8,
      };
    }
    case "fossil_restriction": {
      const restrictedExposure = loanBook * 0.22 * 0.3;
      return {
        totalEmissions,
        estimatedCost: restrictedExposure,
        profitImpact: -(restrictedExposure / loanBook) * 100,
        nplIncrease: 4.1,
        capitalAdequacyEffect: -1.5,
      };
    }
    case "lagos_flood": {
      const floodLoss = loanBook * 0.15 * 0.12;
      return {
        totalEmissions,
        estimatedCost: floodLoss,
        profitImpact: -(floodLoss / loanBook) * 100,
        nplIncrease: 3.7,
        capitalAdequacyEffect: -1.2,
      };
    }
    case "regulatory_capital": {
      const penalty = loanBook * 0.005;
      return {
        totalEmissions,
        estimatedCost: penalty,
        profitImpact: -(penalty / loanBook) * 100,
        nplIncrease: 0.5,
        capitalAdequacyEffect: -2.0,
      };
    }
    default:
      return {
        totalEmissions,
        estimatedCost: 0,
        profitImpact: 0,
        nplIncrease: 0,
        capitalAdequacyEffect: 0,
      };
  }
};

export const formatNaira = (value: number): string => {
  if (Math.abs(value) >= 1e12) return `₦${(value / 1e12).toFixed(2)}T`;
  if (Math.abs(value) >= 1e9) return `₦${(value / 1e9).toFixed(2)}B`;
  if (Math.abs(value) >= 1e6) return `₦${(value / 1e6).toFixed(2)}M`;
  if (Math.abs(value) >= 1e3) return `₦${(value / 1e3).toFixed(0)}K`;
  return `₦${value.toLocaleString()}`;
};

export const formatNumber = (value: number, decimals = 1): string => {
  if (Math.abs(value) >= 1e9) return `${(value / 1e9).toFixed(decimals)}B`;
  if (Math.abs(value) >= 1e6) return `${(value / 1e6).toFixed(decimals)}M`;
  if (Math.abs(value) >= 1e3) return `${(value / 1e3).toFixed(decimals)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: decimals });
};

export const getRiskColor = (score: number): string => {
  if (score >= 20) return "#dc2626";
  if (score >= 12) return "#f97316";
  if (score >= 6) return "#eab308";
  return "#22c55e";
};

export const getRiskLevel = (score: number): string => {
  if (score >= 20) return "Critical";
  if (score >= 12) return "High";
  if (score >= 6) return "Medium";
  return "Low";
};

export const RISK_CATEGORIES = [
  "Climate & Environmental",
  "Portfolio & Credit",
  "Social & Human Capital",
  "Governance & Ethics",
  "Operational",
  "Regulatory",
  "Reputation",
];

export const FINANCIAL_EFFECTS = [
  "Cash Flow Impact",
  "Asset Impairment",
  "Regulatory Penalty",
  "Funding Access Risk",
  "Revenue Decline",
  "Credit Loss",
];

export const TIME_HORIZONS = [
  "Short Term (1-3 years)",
  "Medium Term (3-10 years)",
  "Long Term (>10 years)",
];

export const DEFAULT_RISKS: SustainabilityRisk[] = [
  // SASB Aligned
  {
    id: "r-sasb-1",
    name: "Data Security & Privacy Breaches",
    category: "Social & Human Capital",
    subcategory: "Data Security",
    impact: 5,
    likelihood: 3,
    financialEffect: "Regulatory Penalty",
    timeHorizon: "Short Term (1-3 years)",
    source: "sasb",
  },
  {
    id: "r-sasb-2",
    name: "Energy Under-Management & Intensity",
    category: "Climate & Environmental",
    subcategory: "Energy Management",
    impact: 4,
    likelihood: 4,
    financialEffect: "Cash Flow Impact",
    timeHorizon: "Medium Term (3-10 years)",
    source: "sasb",
  },
  {
    id: "r-sasb-3",
    name: "Customer Inclusion & Access Gap",
    category: "Social & Human Capital",
    subcategory: "Financial Inclusion",
    impact: 3,
    likelihood: 4,
    financialEffect: "Revenue Decline",
    timeHorizon: "Medium Term (3-10 years)",
    source: "sasb",
  },
  {
    id: "r-sasb-4",
    name: "Systemic Risk Management Failure",
    category: "Governance & Ethics",
    subcategory: "Systemic Risk",
    impact: 5,
    likelihood: 2,
    financialEffect: "Asset Impairment",
    timeHorizon: "Short Term (1-3 years)",
    source: "sasb",
  },
  {
    id: "r-sasb-5",
    name: "Physical Impacts on Core Assets",
    category: "Climate & Environmental",
    subcategory: "Physical Risk",
    impact: 4,
    likelihood: 3,
    financialEffect: "Asset Impairment",
    timeHorizon: "Long Term (>10 years)",
    source: "sasb",
  },
];

export const SASB_BANKING_TOPICS = [
  "Systemic Risk Management",
  "Data Security & Privacy",
  "Financial Inclusion & Capacity Building",
  "Business Ethics & Conduct",
  "Climate Risk Exposure (Financed Emissions)",
  "Portfolio Carbon Intensity",
  "Workforce Diversity & Inclusion",
  "Customer Privacy Protection",
  "Operational Resilience",
  "Anti-Money Laundering Compliance",
  "Responsible Lending Practices",
  "Employee Health & Safety",
];

export const TEMPLATE_CONFIGS: Record<
  string,
  { department: string; assignedTo: string; fields: string[] }
> = {
  "Climate & Environmental": {
    department: "Risk Management",
    assignedTo: "Chief Risk Officer",
    fields: [
      "Scope 1 Emissions (tCO2e)",
      "Scope 2 Emissions (tCO2e)",
      "Scope 3 Financed Emissions (tCO2e)",
      "Energy Consumption (MWh)",
      "Renewable Energy %",
      "Climate Risk Stress Test Results",
    ],
  },
  "Portfolio & Credit": {
    department: "Credit & Lending",
    assignedTo: "Head of Credit",
    fields: [
      "Sector Loan Exposure (%)",
      "High-Risk Geographic Exposure",
      "NPL Ratio by Sector",
      "Green Finance Portfolio (₦)",
      "Climate-Adjusted PD Models",
      "Stranded Asset Exposure",
    ],
  },
  "Social & Human Capital": {
    department: "Human Resources",
    assignedTo: "HR Director",
    fields: [
      "Total Employees",
      "Gender Diversity Ratio",
      "Total Safety Incidents",
      "Lost Time Injury Rate",
      "Training Hours per Employee",
      "Employee Turnover Rate",
    ],
  },
  "Governance & Ethics": {
    department: "Compliance",
    assignedTo: "Chief Compliance Officer",
    fields: [
      "Confirmed Corruption Cases",
      "Whistleblower Reports Filed",
      "AML Breaches",
      "Regulatory Fines (₦)",
      "Board ESG Training Hours",
      "Ethics Code Violations",
    ],
  },
  Operational: {
    department: "Operations",
    assignedTo: "COO",
    fields: [
      "Diesel Consumption (Liters)",
      "Generator Runtime (Hours)",
      "kWh Purchased per Branch",
      "Water Consumption (m³)",
      "Waste Generated (Tonnes)",
      "Paper Usage (Reams)",
    ],
  },
  Regulatory: {
    department: "Legal & Compliance",
    assignedTo: "General Counsel",
    fields: [
      "Regulatory Submissions Filed",
      "CBN Compliance Score",
      "IFRS S1/S2 Readiness %",
      "Pending Regulatory Actions",
      "Compliance Training Completion %",
      "Policy Review Cycle Status",
    ],
  },
  Reputation: {
    department: "Communications",
    assignedTo: "Head of Corporate Affairs",
    fields: [
      "ESG Rating Score",
      "Sustainability Report Published",
      "Stakeholder Engagement Events",
      "Media Sentiment Score",
      "Investor ESG Queries Resolved",
      "Awards & Recognitions",
    ],
  },
};

export const DEFAULT_SCOPE1: Scope1Asset[] = [
  {
    id: "s1-1",
    name: "Head Office Generators (3x)",
    branch: "Lagos HQ",
    type: "stationary",
    fuelType: "diesel",
    litersPerMonth: 12000,
    months: 12,
  },
  {
    id: "s1-2",
    name: "Branch Generators — Lagos Region",
    branch: "Lagos Branches",
    type: "stationary",
    fuelType: "diesel",
    litersPerMonth: 8500,
    months: 12,
  },
  {
    id: "s1-3",
    name: "Branch Generators — North Region",
    branch: "Northern Branches",
    type: "stationary",
    fuelType: "diesel",
    litersPerMonth: 6200,
    months: 12,
  },
  {
    id: "s1-4",
    name: "Executive Fleet (15 Vehicles)",
    branch: "Head Office",
    type: "mobile",
    fuelType: "petrol",
    litersPerMonth: 3800,
    months: 12,
  },
  {
    id: "s1-5",
    name: "Cash-in-Transit Fleet (22 Vehicles)",
    branch: "Operations",
    type: "mobile",
    fuelType: "diesel",
    litersPerMonth: 5600,
    months: 12,
  },
  {
    id: "s1-6",
    name: "Branch Generators — South-South",
    branch: "PH/Calabar",
    type: "stationary",
    fuelType: "diesel",
    litersPerMonth: 4800,
    months: 12,
  },
];

export const DEFAULT_SCOPE2: Scope2Entry[] = [
  {
    id: "s2-1",
    branch: "Lagos HQ & Data Center",
    kwhPerMonth: 185000,
    months: 12,
    source: "grid",
  },
  {
    id: "s2-2",
    branch: "Lagos Branch Network (28)",
    kwhPerMonth: 142000,
    months: 12,
    source: "grid",
  },
  {
    id: "s2-3",
    branch: "Abuja Branches (18)",
    kwhPerMonth: 95000,
    months: 12,
    source: "grid",
  },
  {
    id: "s2-4",
    branch: "Northern Branches (32)",
    kwhPerMonth: 78000,
    months: 12,
    source: "grid",
  },
  {
    id: "s2-5",
    branch: "South-South Branches (22)",
    kwhPerMonth: 68000,
    months: 12,
    source: "private",
    emissionFactor: 0.52,
  },
  {
    id: "s2-6",
    branch: "South-East Branches (20)",
    kwhPerMonth: 61000,
    months: 12,
    source: "grid",
  },
];

export const DEFAULT_SCOPE3: Scope3Entry[] = [
  {
    id: "s3-1",
    sector: "Oil & Gas",
    loanExposure: 187_000_000_000,
    intensityFactor: 0.0000021,
  },
  {
    id: "s3-2",
    sector: "Agriculture",
    loanExposure: 153_000_000_000,
    intensityFactor: 0.0000015,
  },
  {
    id: "s3-3",
    sector: "Real Estate",
    loanExposure: 127_500_000_000,
    intensityFactor: 0.0000008,
  },
  {
    id: "s3-4",
    sector: "Manufacturing",
    loanExposure: 119_000_000_000,
    intensityFactor: 0.0000018,
  },
  {
    id: "s3-5",
    sector: "SME / Retail",
    loanExposure: 102_000_000_000,
    intensityFactor: 0.0000005,
  },
  {
    id: "s3-6",
    sector: "Power & Utilities",
    loanExposure: 68_000_000_000,
    intensityFactor: 0.0000025,
  },
  {
    id: "s3-7",
    sector: "Transportation",
    loanExposure: 51_000_000_000,
    intensityFactor: 0.0000019,
  },
  {
    id: "s3-8",
    sector: "Telecommunications",
    loanExposure: 42_500_000_000,
    intensityFactor: 0.0000004,
  },
];
