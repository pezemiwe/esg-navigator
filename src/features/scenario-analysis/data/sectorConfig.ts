/**
 * Sector Configuration for Climate Scenario Analysis
 * ─────────────────────────────────────────────────────
 * Defines 17 industry sectors with calibrated climate-sensitivity
 * coefficients used to project financial metric impacts under
 * NGFS-aligned transition and physical risk scenarios.
 *
 * Each sector carries:
 *  • Taxonomy metadata (icon, color, NACE/ISIC sub-sectors)
 *  • Financial metric sensitivity betas (per-unit shock → % change)
 *  • Baseline financial profile assumptions
 *
 * References:
 *  - NGFS Phase IV (2023) sector-level transition pathways
 *  - TCFD Annex: Metrics & Targets
 *  - IEA World Energy Outlook 2025 cost curves
 */

export interface SectorFinancialProfile {
  /** Gross margin % (baseline) */
  grossMargin: number;
  /** Operating margin % (baseline) */
  operatingMargin: number;
  /** Typical debt-to-equity ratio */
  debtToEquity: number;
  /** Baseline cost of equity % */
  costOfEquity: number;
  /** Baseline cost of debt % */
  costOfDebt: number;
  /** Equity weight in capital structure */
  equityWeight: number;
  /** Typical CapEx-to-revenue ratio */
  capexToRevenue: number;
  /** Typical insurance cost as % of assets */
  insuranceCostPct: number;
  /** PPE as % of total assets */
  ppeToAssets: number;
}

export interface SectorSensitivities {
  /** Revenue sensitivity to carbon price (per $/tCO2) */
  revenueToCarbonPrice: number;
  /** Revenue sensitivity to GDP shock (per 1% GDP change) */
  revenueToGDP: number;
  /** Revenue sensitivity to physical damage index (per 0.1 unit) */
  revenueToPhysical: number;
  /** Price pass-through elasticity (0 = full absorption, 1 = full pass-through) */
  pricePassThrough: number;
  /** Quantity/volume sensitivity to price change */
  quantityElasticity: number;
  /** OpEx sensitivity to carbon price (per $/tCO2) */
  opexToCarbonPrice: number;
  /** OpEx sensitivity to inflation shock (per 1% inflation) */
  opexToInflation: number;
  /** CapEx multiplier under transition (1 = no change, >1 = green capex increase) */
  capexTransitionMultiplier: number;
  /** Insurance cost sensitivity to physical risk index */
  insuranceToPhysical: number;
  /** PPE vulnerability to physical damage */
  ppePhysicalVulnerability: number;
  /** Cost of equity sensitivity to ESG risk premium (bps per unit risk) */
  costOfEquitySensitivity: number;
  /** Cost of debt sensitivity to credit spread widening (bps per unit risk) */
  costOfDebtSensitivity: number;
}

export interface SectorConfig {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  subSectors: string[];
  financialProfile: SectorFinancialProfile;
  sensitivities: SectorSensitivities;
}

export const SECTORS: SectorConfig[] = [
  {
    id: "financial_services",
    name: "Financial Services",
    icon: "Landmark",
    color: "#1E40AF",
    description:
      "Banks, insurance, asset management, and capital markets. Indirect exposure through financed emissions and credit portfolios.",
    subSectors: [
      "Commercial Banking",
      "Investment Banking",
      "Insurance",
      "Asset Management",
      "Microfinance",
    ],
    financialProfile: {
      grossMargin: 0.65,
      operatingMargin: 0.35,
      debtToEquity: 8.0,
      costOfEquity: 0.14,
      costOfDebt: 0.09,
      equityWeight: 0.12,
      capexToRevenue: 0.05,
      insuranceCostPct: 0.003,
      ppeToAssets: 0.02,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0003,
      revenueToGDP: 1.2,
      revenueToPhysical: -0.08,
      pricePassThrough: 0.3,
      quantityElasticity: -0.2,
      opexToCarbonPrice: 0.0001,
      opexToInflation: 0.4,
      capexTransitionMultiplier: 1.15,
      insuranceToPhysical: 0.5,
      ppePhysicalVulnerability: 0.15,
      costOfEquitySensitivity: 25,
      costOfDebtSensitivity: 15,
    },
  },
  {
    id: "fmcg",
    name: "Fast-Moving Consumer Goods",
    icon: "ShoppingCart",
    color: "#059669",
    description:
      "Consumer packaged goods including food, beverages, household products. Exposed through supply chain disruption and commodity price volatility.",
    subSectors: [
      "Food & Beverages",
      "Personal Care",
      "Household Products",
      "Tobacco",
      "Packaged Foods",
    ],
    financialProfile: {
      grossMargin: 0.42,
      operatingMargin: 0.18,
      debtToEquity: 1.2,
      costOfEquity: 0.12,
      costOfDebt: 0.07,
      equityWeight: 0.55,
      capexToRevenue: 0.06,
      insuranceCostPct: 0.008,
      ppeToAssets: 0.25,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0008,
      revenueToGDP: 0.6,
      revenueToPhysical: -0.15,
      pricePassThrough: 0.65,
      quantityElasticity: -0.35,
      opexToCarbonPrice: 0.0012,
      opexToInflation: 0.7,
      capexTransitionMultiplier: 1.25,
      insuranceToPhysical: 1.2,
      ppePhysicalVulnerability: 0.35,
      costOfEquitySensitivity: 30,
      costOfDebtSensitivity: 20,
    },
  },
  {
    id: "oil_gas",
    name: "Oil & Gas",
    icon: "Fuel",
    color: "#DC2626",
    description:
      "Upstream exploration, midstream pipelines, downstream refining. Highest transition risk from carbon pricing and stranded asset exposure.",
    subSectors: [
      "Exploration & Production",
      "Refining & Marketing",
      "Oilfield Services",
      "Pipeline & Transport",
      "LNG",
    ],
    financialProfile: {
      grossMargin: 0.45,
      operatingMargin: 0.22,
      debtToEquity: 0.8,
      costOfEquity: 0.15,
      costOfDebt: 0.085,
      equityWeight: 0.55,
      capexToRevenue: 0.18,
      insuranceCostPct: 0.012,
      ppeToAssets: 0.55,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0045,
      revenueToGDP: 0.9,
      revenueToPhysical: -0.2,
      pricePassThrough: 0.8,
      quantityElasticity: -0.25,
      opexToCarbonPrice: 0.003,
      opexToInflation: 0.5,
      capexTransitionMultiplier: 0.7,
      insuranceToPhysical: 2.0,
      ppePhysicalVulnerability: 0.6,
      costOfEquitySensitivity: 80,
      costOfDebtSensitivity: 55,
    },
  },
  {
    id: "agriculture",
    name: "Agriculture & Agribusiness",
    icon: "Wheat",
    color: "#65A30D",
    description:
      "Crop production, livestock, agro-processing. Highest physical risk exposure through weather dependence and water stress.",
    subSectors: [
      "Crop Farming",
      "Livestock",
      "Agro-processing",
      "Fisheries & Aquaculture",
      "Forestry",
    ],
    financialProfile: {
      grossMargin: 0.3,
      operatingMargin: 0.12,
      debtToEquity: 0.6,
      costOfEquity: 0.16,
      costOfDebt: 0.1,
      equityWeight: 0.6,
      capexToRevenue: 0.08,
      insuranceCostPct: 0.015,
      ppeToAssets: 0.4,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0015,
      revenueToGDP: 0.4,
      revenueToPhysical: -0.4,
      pricePassThrough: 0.5,
      quantityElasticity: -0.6,
      opexToCarbonPrice: 0.001,
      opexToInflation: 0.8,
      capexTransitionMultiplier: 1.4,
      insuranceToPhysical: 2.5,
      ppePhysicalVulnerability: 0.7,
      costOfEquitySensitivity: 45,
      costOfDebtSensitivity: 35,
    },
  },
  {
    id: "real_estate",
    name: "Real Estate & Property",
    icon: "Building2",
    color: "#7C3AED",
    description:
      "Commercial and residential property development, REITs. Exposed through physical damage, energy efficiency mandates, and stranding risk.",
    subSectors: [
      "Commercial Property",
      "Residential Development",
      "REITs",
      "Facility Management",
      "Property Valuation",
    ],
    financialProfile: {
      grossMargin: 0.4,
      operatingMargin: 0.25,
      debtToEquity: 1.5,
      costOfEquity: 0.13,
      costOfDebt: 0.08,
      equityWeight: 0.4,
      capexToRevenue: 0.15,
      insuranceCostPct: 0.01,
      ppeToAssets: 0.75,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.001,
      revenueToGDP: 1.1,
      revenueToPhysical: -0.25,
      pricePassThrough: 0.4,
      quantityElasticity: -0.5,
      opexToCarbonPrice: 0.0008,
      opexToInflation: 0.6,
      capexTransitionMultiplier: 1.5,
      insuranceToPhysical: 1.8,
      ppePhysicalVulnerability: 0.65,
      costOfEquitySensitivity: 50,
      costOfDebtSensitivity: 35,
    },
  },
  {
    id: "manufacturing",
    name: "Manufacturing",
    icon: "Factory",
    color: "#EA580C",
    description:
      "Industrial production including automotive, chemicals, steel. High carbon intensity with significant transition and physical risk.",
    subSectors: [
      "Automotive",
      "Chemicals",
      "Steel & Metals",
      "Cement",
      "Consumer Electronics",
    ],
    financialProfile: {
      grossMargin: 0.32,
      operatingMargin: 0.14,
      debtToEquity: 1.0,
      costOfEquity: 0.13,
      costOfDebt: 0.075,
      equityWeight: 0.5,
      capexToRevenue: 0.1,
      insuranceCostPct: 0.01,
      ppeToAssets: 0.45,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0035,
      revenueToGDP: 1.0,
      revenueToPhysical: -0.18,
      pricePassThrough: 0.6,
      quantityElasticity: -0.4,
      opexToCarbonPrice: 0.0025,
      opexToInflation: 0.65,
      capexTransitionMultiplier: 1.35,
      insuranceToPhysical: 1.5,
      ppePhysicalVulnerability: 0.5,
      costOfEquitySensitivity: 55,
      costOfDebtSensitivity: 40,
    },
  },
  {
    id: "technology",
    name: "Technology & IT",
    icon: "Cpu",
    color: "#2563EB",
    description:
      "Software, hardware, IT services, and digital infrastructure. Lower direct emissions but growing data center energy demands.",
    subSectors: [
      "Software & SaaS",
      "Hardware",
      "IT Services",
      "Semiconductors",
      "Cloud & Data Centers",
    ],
    financialProfile: {
      grossMargin: 0.65,
      operatingMargin: 0.28,
      debtToEquity: 0.4,
      costOfEquity: 0.11,
      costOfDebt: 0.055,
      equityWeight: 0.7,
      capexToRevenue: 0.08,
      insuranceCostPct: 0.004,
      ppeToAssets: 0.15,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0005,
      revenueToGDP: 0.8,
      revenueToPhysical: -0.06,
      pricePassThrough: 0.5,
      quantityElasticity: -0.15,
      opexToCarbonPrice: 0.0006,
      opexToInflation: 0.35,
      capexTransitionMultiplier: 1.2,
      insuranceToPhysical: 0.6,
      ppePhysicalVulnerability: 0.2,
      costOfEquitySensitivity: 15,
      costOfDebtSensitivity: 10,
    },
  },
  {
    id: "healthcare",
    name: "Healthcare & Pharmaceuticals",
    icon: "Heart",
    color: "#DB2777",
    description:
      "Hospitals, pharma, biotech, medical devices. Defensive sector with moderate transition exposure through energy-intensive supply chains.",
    subSectors: [
      "Pharmaceuticals",
      "Hospitals & Clinics",
      "Medical Devices",
      "Biotechnology",
      "Health Insurance",
    ],
    financialProfile: {
      grossMargin: 0.55,
      operatingMargin: 0.2,
      debtToEquity: 0.7,
      costOfEquity: 0.11,
      costOfDebt: 0.06,
      equityWeight: 0.6,
      capexToRevenue: 0.07,
      insuranceCostPct: 0.006,
      ppeToAssets: 0.2,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0003,
      revenueToGDP: 0.3,
      revenueToPhysical: -0.1,
      pricePassThrough: 0.7,
      quantityElasticity: -0.1,
      opexToCarbonPrice: 0.0004,
      opexToInflation: 0.5,
      capexTransitionMultiplier: 1.1,
      insuranceToPhysical: 0.8,
      ppePhysicalVulnerability: 0.25,
      costOfEquitySensitivity: 15,
      costOfDebtSensitivity: 10,
    },
  },
  {
    id: "mining_metals",
    name: "Mining & Metals",
    icon: "Mountain",
    color: "#78716C",
    description:
      "Mineral extraction, smelting, and processing. Critical transition minerals offset by high energy intensity and tailings risk.",
    subSectors: [
      "Gold Mining",
      "Iron Ore",
      "Bauxite & Aluminium",
      "Lithium & Rare Earths",
      "Coal Mining",
    ],
    financialProfile: {
      grossMargin: 0.38,
      operatingMargin: 0.2,
      debtToEquity: 0.6,
      costOfEquity: 0.16,
      costOfDebt: 0.09,
      equityWeight: 0.6,
      capexToRevenue: 0.2,
      insuranceCostPct: 0.014,
      ppeToAssets: 0.6,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.004,
      revenueToGDP: 0.7,
      revenueToPhysical: -0.22,
      pricePassThrough: 0.7,
      quantityElasticity: -0.3,
      opexToCarbonPrice: 0.003,
      opexToInflation: 0.55,
      capexTransitionMultiplier: 1.3,
      insuranceToPhysical: 2.2,
      ppePhysicalVulnerability: 0.55,
      costOfEquitySensitivity: 70,
      costOfDebtSensitivity: 50,
    },
  },
  {
    id: "telecommunications",
    name: "Telecommunications",
    icon: "Radio",
    color: "#0891B2",
    description:
      "Mobile, broadband, fiber infrastructure. Moderate physical risk through network infrastructure; low transition risk.",
    subSectors: [
      "Mobile Operators",
      "Broadband & Fiber",
      "Tower Companies",
      "Satellite Services",
      "ISPs",
    ],
    financialProfile: {
      grossMargin: 0.55,
      operatingMargin: 0.22,
      debtToEquity: 1.2,
      costOfEquity: 0.12,
      costOfDebt: 0.07,
      equityWeight: 0.45,
      capexToRevenue: 0.15,
      insuranceCostPct: 0.006,
      ppeToAssets: 0.5,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0004,
      revenueToGDP: 0.5,
      revenueToPhysical: -0.12,
      pricePassThrough: 0.45,
      quantityElasticity: -0.15,
      opexToCarbonPrice: 0.0005,
      opexToInflation: 0.45,
      capexTransitionMultiplier: 1.15,
      insuranceToPhysical: 1.0,
      ppePhysicalVulnerability: 0.4,
      costOfEquitySensitivity: 20,
      costOfDebtSensitivity: 15,
    },
  },
  {
    id: "transport_logistics",
    name: "Transportation & Logistics",
    icon: "Truck",
    color: "#D97706",
    description:
      "Freight, aviation, shipping, rail. High transition risk from fuel dependency; significant physical risk to infrastructure.",
    subSectors: [
      "Aviation",
      "Shipping & Maritime",
      "Road Freight",
      "Rail Transport",
      "Warehousing & Logistics",
    ],
    financialProfile: {
      grossMargin: 0.28,
      operatingMargin: 0.1,
      debtToEquity: 1.5,
      costOfEquity: 0.14,
      costOfDebt: 0.08,
      equityWeight: 0.4,
      capexToRevenue: 0.12,
      insuranceCostPct: 0.012,
      ppeToAssets: 0.5,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0035,
      revenueToGDP: 1.0,
      revenueToPhysical: -0.2,
      pricePassThrough: 0.55,
      quantityElasticity: -0.35,
      opexToCarbonPrice: 0.003,
      opexToInflation: 0.7,
      capexTransitionMultiplier: 1.4,
      insuranceToPhysical: 1.8,
      ppePhysicalVulnerability: 0.5,
      costOfEquitySensitivity: 45,
      costOfDebtSensitivity: 35,
    },
  },
  {
    id: "construction",
    name: "Construction & Infrastructure",
    icon: "HardHat",
    color: "#B45309",
    description:
      "Building construction, civil engineering, infrastructure development. Cement-heavy with significant embodied carbon.",
    subSectors: [
      "Residential Construction",
      "Commercial Construction",
      "Civil Engineering",
      "Infrastructure",
      "Building Materials",
    ],
    financialProfile: {
      grossMargin: 0.22,
      operatingMargin: 0.08,
      debtToEquity: 1.0,
      costOfEquity: 0.14,
      costOfDebt: 0.085,
      equityWeight: 0.5,
      capexToRevenue: 0.08,
      insuranceCostPct: 0.01,
      ppeToAssets: 0.35,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.003,
      revenueToGDP: 1.3,
      revenueToPhysical: -0.15,
      pricePassThrough: 0.5,
      quantityElasticity: -0.5,
      opexToCarbonPrice: 0.0025,
      opexToInflation: 0.75,
      capexTransitionMultiplier: 1.35,
      insuranceToPhysical: 1.5,
      ppePhysicalVulnerability: 0.45,
      costOfEquitySensitivity: 40,
      costOfDebtSensitivity: 30,
    },
  },
  {
    id: "utilities",
    name: "Utilities & Power Generation",
    icon: "Zap",
    color: "#EAB308",
    description:
      "Electricity generation, gas distribution, water utilities. Core transition sector with renewable shift opportunities.",
    subSectors: [
      "Thermal Power",
      "Renewable Energy",
      "Gas Distribution",
      "Water Utilities",
      "Grid Infrastructure",
    ],
    financialProfile: {
      grossMargin: 0.4,
      operatingMargin: 0.2,
      debtToEquity: 1.8,
      costOfEquity: 0.12,
      costOfDebt: 0.075,
      equityWeight: 0.35,
      capexToRevenue: 0.25,
      insuranceCostPct: 0.01,
      ppeToAssets: 0.65,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.004,
      revenueToGDP: 0.3,
      revenueToPhysical: -0.18,
      pricePassThrough: 0.6,
      quantityElasticity: -0.1,
      opexToCarbonPrice: 0.0035,
      opexToInflation: 0.5,
      capexTransitionMultiplier: 1.6,
      insuranceToPhysical: 1.5,
      ppePhysicalVulnerability: 0.55,
      costOfEquitySensitivity: 60,
      costOfDebtSensitivity: 45,
    },
  },
  {
    id: "hospitality_tourism",
    name: "Hospitality & Tourism",
    icon: "Palmtree",
    color: "#0D9488",
    description:
      "Hotels, restaurants, travel, leisure. High physical risk from extreme weather events affecting tourism infrastructure.",
    subSectors: [
      "Hotels & Resorts",
      "Restaurants & Catering",
      "Travel Agencies",
      "Entertainment Venues",
      "Eco-Tourism",
    ],
    financialProfile: {
      grossMargin: 0.35,
      operatingMargin: 0.12,
      debtToEquity: 1.3,
      costOfEquity: 0.14,
      costOfDebt: 0.085,
      equityWeight: 0.43,
      capexToRevenue: 0.1,
      insuranceCostPct: 0.012,
      ppeToAssets: 0.45,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.001,
      revenueToGDP: 1.5,
      revenueToPhysical: -0.35,
      pricePassThrough: 0.4,
      quantityElasticity: -0.7,
      opexToCarbonPrice: 0.0008,
      opexToInflation: 0.65,
      capexTransitionMultiplier: 1.2,
      insuranceToPhysical: 2.0,
      ppePhysicalVulnerability: 0.6,
      costOfEquitySensitivity: 40,
      costOfDebtSensitivity: 30,
    },
  },
  {
    id: "retail",
    name: "Retail & E-Commerce",
    icon: "Store",
    color: "#E11D48",
    description:
      "Physical and online retail. Supply chain exposure through sourcing disruptions and logistics costs under carbon pricing.",
    subSectors: [
      "Brick & Mortar Retail",
      "E-Commerce",
      "Supermarkets",
      "Specialty Retail",
      "Wholesale Distribution",
    ],
    financialProfile: {
      grossMargin: 0.3,
      operatingMargin: 0.08,
      debtToEquity: 0.9,
      costOfEquity: 0.12,
      costOfDebt: 0.07,
      equityWeight: 0.52,
      capexToRevenue: 0.04,
      insuranceCostPct: 0.007,
      ppeToAssets: 0.2,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0008,
      revenueToGDP: 0.9,
      revenueToPhysical: -0.12,
      pricePassThrough: 0.55,
      quantityElasticity: -0.4,
      opexToCarbonPrice: 0.0008,
      opexToInflation: 0.6,
      capexTransitionMultiplier: 1.15,
      insuranceToPhysical: 1.0,
      ppePhysicalVulnerability: 0.3,
      costOfEquitySensitivity: 25,
      costOfDebtSensitivity: 18,
    },
  },
  {
    id: "education",
    name: "Education",
    icon: "GraduationCap",
    color: "#4F46E5",
    description:
      "Universities, schools, EdTech, vocational training. Low direct emissions; physical risk to infrastructure and operations.",
    subSectors: [
      "Higher Education",
      "K-12 Schools",
      "Vocational Training",
      "EdTech",
      "Research Institutions",
    ],
    financialProfile: {
      grossMargin: 0.5,
      operatingMargin: 0.15,
      debtToEquity: 0.5,
      costOfEquity: 0.1,
      costOfDebt: 0.06,
      equityWeight: 0.65,
      capexToRevenue: 0.06,
      insuranceCostPct: 0.005,
      ppeToAssets: 0.35,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0002,
      revenueToGDP: 0.4,
      revenueToPhysical: -0.08,
      pricePassThrough: 0.3,
      quantityElasticity: -0.1,
      opexToCarbonPrice: 0.0003,
      opexToInflation: 0.55,
      capexTransitionMultiplier: 1.1,
      insuranceToPhysical: 0.7,
      ppePhysicalVulnerability: 0.3,
      costOfEquitySensitivity: 10,
      costOfDebtSensitivity: 8,
    },
  },
  {
    id: "media_entertainment",
    name: "Media & Entertainment",
    icon: "Film",
    color: "#9333EA",
    description:
      "Broadcasting, streaming, gaming, publishing. Low direct exposure; moderate supply chain and energy intensity for digital delivery.",
    subSectors: [
      "Broadcasting",
      "Streaming & Digital Media",
      "Gaming",
      "Publishing",
      "Advertising",
    ],
    financialProfile: {
      grossMargin: 0.5,
      operatingMargin: 0.18,
      debtToEquity: 0.8,
      costOfEquity: 0.12,
      costOfDebt: 0.065,
      equityWeight: 0.55,
      capexToRevenue: 0.05,
      insuranceCostPct: 0.004,
      ppeToAssets: 0.12,
    },
    sensitivities: {
      revenueToCarbonPrice: -0.0003,
      revenueToGDP: 0.7,
      revenueToPhysical: -0.05,
      pricePassThrough: 0.4,
      quantityElasticity: -0.2,
      opexToCarbonPrice: 0.0003,
      opexToInflation: 0.4,
      capexTransitionMultiplier: 1.1,
      insuranceToPhysical: 0.5,
      ppePhysicalVulnerability: 0.15,
      costOfEquitySensitivity: 12,
      costOfDebtSensitivity: 8,
    },
  },
];

export const getSectorById = (id: string): SectorConfig | undefined =>
  SECTORS.find((s) => s.id === id);

export const getSectorByName = (name: string): SectorConfig | undefined =>
  SECTORS.find(
    (s) => s.name.toLowerCase() === name.toLowerCase() || s.id === name,
  );

/**
 * Calculate all financial metric impacts for a given sector under
 * specified shock parameters.
 */
export interface FinancialMetricResult {
  metric: string;
  shortLabel: string;
  baseline: number;
  stressed: number;
  absoluteChange: number;
  percentChange: number;
  unit: string;
  direction: "positive" | "negative" | "neutral";
  severity: "low" | "moderate" | "high" | "critical";
  description: string;
}

export function calculateSectorImpact(
  sector: SectorConfig,
  params: {
    carbonPrice: number;
    gdpShock: number;
    inflationShock: number;
    interestRateShock: number;
    physicalDamageIndex: number;
  },
  baselineRevenue: number = 100,
): FinancialMetricResult[] {
  const s = sector.sensitivities;
  const fp = sector.financialProfile;

  // --- Revenue-side calculations ---
  const revenueImpactCarbon = s.revenueToCarbonPrice * params.carbonPrice;
  const revenueImpactGDP = (s.revenueToGDP * params.gdpShock) / 100;
  const revenueImpactPhysical =
    s.revenueToPhysical * params.physicalDamageIndex;
  const totalRevenueImpact =
    revenueImpactCarbon + revenueImpactGDP + revenueImpactPhysical;

  // Price change (portion passed through)
  const costPressure =
    s.opexToCarbonPrice * params.carbonPrice +
    (s.opexToInflation * params.inflationShock) / 100;
  const priceChange = costPressure * s.pricePassThrough;

  // Quantity/volume change
  const quantityChange =
    priceChange * s.quantityElasticity +
    (s.revenueToGDP * params.gdpShock) / 100 * 0.5;

  // Revenue change (price × quantity combined)
  const revenueChange = totalRevenueImpact;

  // --- Cost-side calculations ---
  const baselineOpex = baselineRevenue * (1 - fp.operatingMargin);
  const opexChangeCarbon = s.opexToCarbonPrice * params.carbonPrice;
  const opexChangeInflation = (s.opexToInflation * params.inflationShock) / 100;
  const opexChange = opexChangeCarbon + opexChangeInflation;

  // CapEx
  const baselineCapex = baselineRevenue * fp.capexToRevenue;
  const capexMultiplier =
    1 +
    (s.capexTransitionMultiplier - 1) *
      Math.min(params.carbonPrice / 100, 1.5);
  const stressedCapex = baselineCapex * capexMultiplier;
  const capexChange = (stressedCapex - baselineCapex) / baselineCapex;

  // Insurance cost
  const baselineInsurance = baselineRevenue * fp.insuranceCostPct * 10;
  const insuranceMultiplier =
    1 + s.insuranceToPhysical * params.physicalDamageIndex;
  const stressedInsurance = baselineInsurance * insuranceMultiplier;
  const insuranceChange =
    (stressedInsurance - baselineInsurance) / baselineInsurance;

  // PPE
  const baselinePPE = baselineRevenue * fp.ppeToAssets * 5;
  const ppeImpairment =
    s.ppePhysicalVulnerability * params.physicalDamageIndex;
  const stressedPPE = baselinePPE * (1 - ppeImpairment);

  // Cost of equity
  const riskPremiumBps =
    s.costOfEquitySensitivity *
    (params.carbonPrice / 50 + params.physicalDamageIndex * 2);
  const baselineCOE = fp.costOfEquity * 100;
  const stressedCOE = baselineCOE + riskPremiumBps / 100;

  // Cost of debt
  const debtSpreadBps =
    s.costOfDebtSensitivity *
    (params.carbonPrice / 50 +
      params.physicalDamageIndex * 2 +
      params.interestRateShock * 0.3);
  const baselineCOD = fp.costOfDebt * 100;
  const stressedCOD = baselineCOD + debtSpreadBps / 100;

  // WACC
  const baselineWACC =
    fp.equityWeight * fp.costOfEquity +
    (1 - fp.equityWeight) * fp.costOfDebt;
  const stressedWACC =
    fp.equityWeight * (stressedCOE / 100) +
    (1 - fp.equityWeight) * (stressedCOD / 100);
  const waccChangeBps = (stressedWACC - baselineWACC) * 10000;

  // Overall impact (weighted composite)
  const overallImpact =
    revenueChange * 0.3 +
    opexChange * -0.2 +
    capexChange * -0.15 +
    insuranceChange * -0.1 +
    ppeImpairment * -0.1 +
    (waccChangeBps / 10000) * -0.15;

  const classify = (
    pctChange: number,
  ): "low" | "moderate" | "high" | "critical" => {
    const abs = Math.abs(pctChange);
    if (abs < 0.02) return "low";
    if (abs < 0.08) return "moderate";
    if (abs < 0.2) return "high";
    return "critical";
  };

  const dir = (
    val: number,
  ): "positive" | "negative" | "neutral" =>
    val > 0.001 ? "positive" : val < -0.001 ? "negative" : "neutral";

  return [
    {
      metric: "Overall Climate Impact",
      shortLabel: "Impact",
      baseline: 0,
      stressed: overallImpact * 100,
      absoluteChange: overallImpact * 100,
      percentChange: overallImpact * 100,
      unit: "%",
      direction: dir(overallImpact),
      severity: classify(overallImpact),
      description:
        "Composite measure of climate-related financial impact across all metrics, weighted by materiality.",
    },
    {
      metric: "Price Impact",
      shortLabel: "Price",
      baseline: 100,
      stressed: 100 * (1 + priceChange),
      absoluteChange: priceChange * 100,
      percentChange: priceChange * 100,
      unit: "%",
      direction: dir(priceChange),
      severity: classify(priceChange),
      description:
        "Projected change in product/service pricing driven by carbon cost pass-through and input cost inflation.",
    },
    {
      metric: "Quantity / Volume",
      shortLabel: "Quantity",
      baseline: 100,
      stressed: 100 * (1 + quantityChange),
      absoluteChange: quantityChange * 100,
      percentChange: quantityChange * 100,
      unit: "%",
      direction: dir(quantityChange),
      severity: classify(quantityChange),
      description:
        "Projected change in sales volumes driven by price elasticity effects and economic contraction.",
    },
    {
      metric: "Revenue",
      shortLabel: "Revenue",
      baseline: baselineRevenue,
      stressed: baselineRevenue * (1 + revenueChange),
      absoluteChange: revenueChange * baselineRevenue,
      percentChange: revenueChange * 100,
      unit: "%",
      direction: dir(revenueChange),
      severity: classify(revenueChange),
      description:
        "Net revenue impact combining price pass-through, volume contraction, and direct GDP sensitivity.",
    },
    {
      metric: "Operating Expenditure",
      shortLabel: "OpEx",
      baseline: baselineOpex,
      stressed: baselineOpex * (1 + opexChange),
      absoluteChange: opexChange * baselineOpex,
      percentChange: opexChange * 100,
      unit: "%",
      direction: dir(opexChange),
      severity: classify(opexChange),
      description:
        "Increase in operating costs from carbon pricing, energy costs, and input price inflation.",
    },
    {
      metric: "Capital Expenditure",
      shortLabel: "CapEx",
      baseline: baselineCapex,
      stressed: stressedCapex,
      absoluteChange: stressedCapex - baselineCapex,
      percentChange: capexChange * 100,
      unit: "%",
      direction: dir(capexChange),
      severity: classify(capexChange),
      description:
        "Additional capital investment required for green technology adoption, retrofitting, and compliance.",
    },
    {
      metric: "Insurance Cost",
      shortLabel: "Insurance",
      baseline: baselineInsurance,
      stressed: stressedInsurance,
      absoluteChange: stressedInsurance - baselineInsurance,
      percentChange: insuranceChange * 100,
      unit: "%",
      direction: dir(insuranceChange),
      severity: classify(insuranceChange),
      description:
        "Projected increase in insurance premiums due to heightened physical climate risk exposure.",
    },
    {
      metric: "Property, Plant & Equipment",
      shortLabel: "PPE",
      baseline: baselinePPE,
      stressed: stressedPPE,
      absoluteChange: stressedPPE - baselinePPE,
      percentChange: -ppeImpairment * 100,
      unit: "%",
      direction: dir(-ppeImpairment),
      severity: classify(ppeImpairment),
      description:
        "Impairment of fixed assets from physical climate events (flooding, storms, heat damage).",
    },
    {
      metric: "Cost of Equity",
      shortLabel: "CoE",
      baseline: baselineCOE,
      stressed: stressedCOE,
      absoluteChange: riskPremiumBps,
      percentChange: (riskPremiumBps / baselineCOE) * 100,
      unit: "bps",
      direction: dir(riskPremiumBps),
      severity: classify(riskPremiumBps / 1000),
      description:
        "Increase in required equity return driven by climate risk premium demanded by investors.",
    },
    {
      metric: "Cost of Debt",
      shortLabel: "CoD",
      baseline: baselineCOD,
      stressed: stressedCOD,
      absoluteChange: debtSpreadBps,
      percentChange: (debtSpreadBps / baselineCOD) * 100,
      unit: "bps",
      direction: dir(debtSpreadBps),
      severity: classify(debtSpreadBps / 1000),
      description:
        "Credit spread widening from lender repricing of climate-exposed debt instruments.",
    },
    {
      metric: "Weighted Avg. Cost of Capital",
      shortLabel: "WACC",
      baseline: baselineWACC * 100,
      stressed: stressedWACC * 100,
      absoluteChange: waccChangeBps,
      percentChange: (waccChangeBps / (baselineWACC * 10000)) * 100,
      unit: "bps",
      direction: dir(waccChangeBps),
      severity: classify(waccChangeBps / 1000),
      description:
        "Blended cost of capital increase, impacting enterprise valuations and project hurdle rates.",
    },
  ];
}
