export const COLLATERAL_STEPS = [
  "Readiness Check",
  "Collateral Inventory",
  "Climate Risk Mapping",
  "Vulnerability Assessment",
  "Sensitivity Scoring",
  "Value Adjustment",
  "Results",
];

export const HAIRCUT_POLICY: Record<string, number> = {
  "Very High": 0.4,
  High: 0.3,
  Medium: 0.2,
  Low: 0.1,
  "Very Low": 0.0,
};

export const NIGERIA_REGIONS = [
  "Lagos",
  "Abuja (FCT)",
  "Rivers",
  "Kano",
  "Oyo",
  "Delta",
  "Ogun",
  "Kaduna",
  "Enugu",
  "Cross River",
  "Anambra",
  "Edo",
  "Kwara",
  "Bayelsa",
  "Ondo",
];

export const NIGERIA_LOCATIONS: Record<string, string[]> = {
  Lagos: [
    "Lagos Island",
    "Victoria Island",
    "Ikeja",
    "Lekki",
    "Apapa",
    "Surulere",
  ],
  "Abuja (FCT)": ["Wuse", "Garki", "Maitama", "Asokoro", "Gwarinpa", "Kubwa"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Bonny", "Eleme", "Okrika"],
  Kano: ["Kano Municipal", "Nassarawa", "Fagge", "Tarauni", "Ungogo"],
  Oyo: ["Ibadan", "Ogbomoso", "Oyo", "Iseyin", "Saki"],
  Delta: ["Warri", "Asaba", "Sapele", "Uelli", "Agbor"],
  Ogun: ["Abeokuta", "Ijebu-Ode", "Sagamu", "Ota", "Ilaro"],
  Kaduna: ["Kaduna", "Zaria", "Kafanchan", "Birnin Gwari"],
};

export const SECTORS = [
  "Agriculture",
  "Manufacturing",
  "Construction",
  "Trade/Commerce",
  "Financial Services",
  "Services",
  "Transport & Storage",
  "Mining & Quarrying",
  "Utilities",
  "Real Estate",
];

export const REPORT_PHASES = [
  "Readiness Check",
  "Report Setup",
  "Report Assembly",
  "Review & Export",
];

export const HAZARD_LABELS: Record<string, string> = {
  flood: "Flood",
  drout: "Drought",
  heatwave: "Heat Wave",
  sea_level: "Sea Level Rise",
  cyclone: "Storm / Cyclone",
  landslide: "Landslide",
  wildfire: "Wildfire",
  coastal_erosion: "Coastal Erosion",
  cold_wave: "Cold Wave / Frost",
};

export const HAZARD_SECTOR_MAP: Record<string, string> = {
  flood: "Real Estate, Agriculture",
  drout: "Agriculture, Food Processing",
  heatwave: "Agriculture, Energy",
  sea_level: "Coastal Real Estate, Tourism",
  cyclone: "All Sectors (Regional)",
  landslide: "Mining, Real Estate",
  wildfire: "Forestry, Agriculture",
  coastal_erosion: "Coastal Infrastructure",
  cold_wave: "Agriculture, Energy",
};

export const ACUTE_HAZARDS = [
  "flood",
  "cyclone",
  "wildfire",
  "landslide",
  "cold_wave",
  "heatwave",
];

export const SENSITIVITY_LEVELS = [
  "Very Low",
  "Low",
  "Medium",
  "High",
  "Very High",
];
