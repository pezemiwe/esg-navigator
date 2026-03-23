import type {
  PhysicalRisk,
  SectorDefinition,
  MatrixConfig,
  HazardRating,
} from "./types";

export const ALL_21_RISKS: PhysicalRisk[] = [
  {
    id: 1,
    risk: "Extreme Heat",
    category: "Meteorological",
    definition:
      "Prolonged high temperatures causing equipment failure, health impacts, and cooling strain",
  },
  {
    id: 2,
    risk: "Drought",
    category: "Meteorological",
    definition:
      "Prolonged rainfall deficit affecting water supply for cooling, generators, and staff",
  },
  {
    id: 3,
    risk: "Tropical Cyclones",
    category: "Meteorological",
    definition:
      "Rotating storms with extreme winds causing structural damage to masts, towers, buildings",
  },
  {
    id: 4,
    risk: "Thunderstorms & Lightning",
    category: "Meteorological",
    definition:
      "Severe electrical storms causing power surges, equipment damage, and fire risk",
  },
  {
    id: 5,
    risk: "Sandstorms / Harmattan",
    category: "Meteorological",
    definition:
      "Wind-driven dust infiltrating equipment and causing respiratory health issues",
  },
  {
    id: 6,
    risk: "Heavy Rainfall",
    category: "Meteorological",
    definition:
      "Extreme rainfall overwhelming drainage and disrupting access routes",
  },
  {
    id: 7,
    risk: "River Flooding",
    category: "Hydrological",
    definition:
      "Rivers overflowing banks and inundating low-lying or riverside locations",
  },
  {
    id: 8,
    risk: "Flash Flooding",
    category: "Hydrological",
    definition:
      "Rapid surface flooding within hours of heavy rainfall — severe in urban areas",
  },
  {
    id: 9,
    risk: "Coastal Flooding",
    category: "Hydrological",
    definition: "Inundation of coastal land by seawater",
  },
  {
    id: 10,
    risk: "Storm Surge",
    category: "Hydrological",
    definition:
      "Abnormal sea level rise driven by storm pressure — relevant for coastal assets",
  },
  {
    id: 11,
    risk: "Landslides",
    category: "Hydrological",
    definition:
      "Slope instability causing land movement — relevant for hilly terrain",
  },
  {
    id: 12,
    risk: "Coastal & Riverbank Erosion",
    category: "Hydrological",
    definition:
      "Gradual wearing away of coastlines and riverbanks reducing protective buffers",
  },
  {
    id: 13,
    risk: "Groundwater Flooding",
    category: "Hydrological",
    definition:
      "Rising water table causing below-ground flooding of infrastructure and foundations",
  },
  {
    id: 14,
    risk: "Sea Level Rise",
    category: "Climatological",
    definition:
      "Permanent long-term rise in ocean levels making coastal flooding progressively worse",
  },
  {
    id: 15,
    risk: "Desertification",
    category: "Climatological",
    definition:
      "Progressive vegetation loss and land degradation — relevant for northern regions",
  },
  {
    id: 16,
    risk: "Wildfire / Bushfire",
    category: "Climatological",
    definition: "Uncontrolled fires in vegetation near grassland or bush areas",
  },
  {
    id: 17,
    risk: "Water Scarcity",
    category: "Climatological",
    definition:
      "Structural freshwater deficit affecting cooling, generators, and operations",
  },
  {
    id: 18,
    risk: "Glacial Retreat",
    category: "Climatological",
    definition:
      "Melting glaciers reducing dry-season river flows and downstream water supply",
  },
  {
    id: 19,
    risk: "Earthquakes",
    category: "Geophysical",
    definition:
      "Ground shaking from tectonic movement causing structural damage",
  },
  {
    id: 20,
    risk: "Volcanic Eruptions",
    category: "Geophysical",
    definition: "Discharge of ash, lava, and gases from active volcanoes",
  },
  {
    id: 21,
    risk: "Tsunamis",
    category: "Geophysical",
    definition:
      "Giant ocean waves triggered by underwater seismic events — relevant for coastal assets",
  },
];

export const SECTORS: Record<string, SectorDefinition> = {
  "1": {
    name: "Telecoms & ICT",
    subsectors: [
      "Mobile Network",
      "Broadband/ISP",
      "Data Centre",
      "Fintech",
      "Software",
    ],
  },
  "2": {
    name: "Banking & Financial Services",
    subsectors: [
      "Commercial Bank",
      "Microfinance",
      "Insurance",
      "Pension",
      "Capital Markets",
    ],
  },
  "3": {
    name: "Oil & Gas",
    subsectors: [
      "Upstream Exploration",
      "Midstream Pipeline",
      "Downstream Refining",
      "Petrochem",
      "LNG",
    ],
  },
  "4": {
    name: "Power & Energy",
    subsectors: [
      "Generation",
      "Transmission",
      "Distribution",
      "Renewable Energy",
      "Gas-to-Power",
    ],
  },
  "5": {
    name: "Manufacturing",
    subsectors: [
      "FMCG",
      "Cement",
      "Steel/Metals",
      "Chemicals",
      "Packaging",
      "Textiles",
    ],
  },
  "6": {
    name: "Agriculture & Agribusiness",
    subsectors: [
      "Crop Farming",
      "Livestock",
      "Aquaculture",
      "Agro-processing",
      "Irrigation",
    ],
  },
  "7": {
    name: "Retail & Commercial",
    subsectors: [
      "Supermarket/Retail Chain",
      "Wholesale",
      "E-commerce",
      "Markets/Malls",
    ],
  },
  "8": {
    name: "Healthcare",
    subsectors: [
      "Hospital",
      "Clinic/PHC",
      "Pharma Manufacturing",
      "Medical Devices",
      "Lab Services",
    ],
  },
  "9": {
    name: "Education",
    subsectors: [
      "University",
      "Polytechnic",
      "Secondary School",
      "Research Institute",
    ],
  },
  "10": {
    name: "Government & Public Sector",
    subsectors: [
      "Federal Ministry",
      "State Agency",
      "Local Government",
      "Military",
      "Public Utility",
    ],
  },
  "11": {
    name: "Real Estate & Construction",
    subsectors: [
      "Residential",
      "Commercial Property",
      "Industrial Estate",
      "Infrastructure",
    ],
  },
  "12": {
    name: "Transport & Logistics",
    subsectors: [
      "Road Freight",
      "Rail",
      "Aviation",
      "Seaport",
      "Inland Waterway",
      "Courier",
    ],
  },
  "13": {
    name: "Mining & Solid Minerals",
    subsectors: [
      "Coal",
      "Limestone",
      "Iron Ore",
      "Gold",
      "Bitumen",
      "Quarrying",
    ],
  },
  "14": {
    name: "Media & Entertainment",
    subsectors: [
      "Broadcast",
      "Print",
      "Digital Media",
      "Film/Music Production",
    ],
  },
  "15": {
    name: "Hospitality & Tourism",
    subsectors: ["Hotel", "Restaurant", "Resort", "Tourism Authority"],
  },
  "16": {
    name: "Water & Sanitation",
    subsectors: [
      "Water Treatment",
      "Water Distribution",
      "Sewage/Wastewater",
      "Irrigation Authority",
      "WASH NGO",
    ],
  },
  "17": {
    name: "Food & Beverage",
    subsectors: [
      "Brewery",
      "Bottling Plant",
      "Flour Milling",
      "Dairy",
      "Confectionery",
      "Palm Oil Processing",
    ],
  },
  "18": {
    name: "Chemical & Petrochemical",
    subsectors: [
      "Fertiliser",
      "Industrial Chemicals",
      "Paints & Coatings",
      "Plastic Manufacturing",
      "Rubber",
    ],
  },
  "19": {
    name: "Defence & Security",
    subsectors: [
      "Military Installation",
      "Police",
      "Civil Defence",
      "Private Security",
      "Border Agency",
    ],
  },
  "20": {
    name: "NGO & Development",
    subsectors: [
      "International NGO",
      "Local NGO",
      "UN Agency",
      "Development Finance",
      "Humanitarian",
    ],
  },
  "21": {
    name: "Religious & Community",
    subsectors: [
      "Church/Mosque Complex",
      "Community Centre",
      "Stadium/Arena",
      "Cultural Centre",
    ],
  },
  "22": {
    name: "Waste Management",
    subsectors: [
      "Solid Waste Collection",
      "Recycling",
      "Landfill",
      "Hazardous Waste",
      "E-waste",
    ],
  },
  "23": {
    name: "Ports & Maritime",
    subsectors: [
      "Deep Seaport",
      "River Port",
      "Dry Port",
      "Shipyard",
      "Maritime Authority",
    ],
  },
  "24": {
    name: "Aviation",
    subsectors: [
      "International Airport",
      "Domestic Airport",
      "Cargo Terminal",
      "MRO Facility",
      "Air Navigation",
    ],
  },
  "25": {
    name: "Digital & Creative Economy",
    subsectors: [
      "Tech Hub",
      "Co-working Space",
      "Animation Studio",
      "Gaming",
      "Digital Agency",
    ],
  },
};

export const ALL_47_ASSET_TYPES = [
  "Office Building",
  "Industrial Building",
  "Warehouse / Storage",
  "Retail Outlet / Branch",
  "Healthcare Facility",
  "Educational Facility",
  "Hospitality Building",
  "Religious / Assembly Hall",
  "Military / Security Post",
  "Data Centre",
  "Telecoms Mast / Tower",
  "Power Generation Plant",
  "Electrical Substation",
  "Transmission Line / Pylon",
  "Water Treatment Plant",
  "Water Distribution Network",
  "Onshore Refinery / Process Plant",
  "LNG / LPG Terminal",
  "Offshore Platform",
  "Floating Production Vessel (FPSO)",
  "Storage Tank / Tank Farm",
  "Petrol Station / Depot",
  "Pipeline \u2014 Onshore",
  "Pipeline \u2014 Offshore / Subsea",
  "Underground Cable / Duct",
  "Road / Bridge / Culvert",
  "Rail Track / Rail Infrastructure",
  "Port / Jetty / Quay",
  "Airport Terminal / Runway",
  "Vessel / Barge / Tug",
  "Vehicle Fleet / Rolling Stock",
  "Outdoor Plant & Equipment",
  "Semi-outdoor Kiosk / Booth",
  "Open Yard / Storage Compound",
  "Solar Farm / Wind Farm",
  "Cropland / Farmland",
  "Irrigation System",
  "Aquaculture Facility",
  "Plantation / Forest",
  "Mine / Quarry Site",
  "Mineral Processing Plant",
  "Tailings Dam / Waste Facility",
  "Construction Site / Temporary Camp",
  "Modular / Prefabricated Unit",
  "Server Room / Network Hub",
  "ATM / POS Terminal Network",
  "Broadcasting / Transmission Equipment",
];

export const EF_TABLE: Record<string, Record<string, number>> = {
  "Office Building": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.01,
  },
  "Industrial Building": {
    Extreme: 0.65,
    "Very High": 0.48,
    High: 0.3,
    Medium: 0.15,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Warehouse / Storage": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Retail Outlet / Branch": {
    Extreme: 0.5,
    "Very High": 0.38,
    High: 0.22,
    Medium: 0.1,
    Low: 0.04,
    Negligible: 0.01,
  },
  "Healthcare Facility": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Educational Facility": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.01,
  },
  "Hospitality Building": {
    Extreme: 0.55,
    "Very High": 0.42,
    High: 0.26,
    Medium: 0.13,
    Low: 0.05,
    Negligible: 0.01,
  },
  "Religious / Assembly Hall": {
    Extreme: 0.5,
    "Very High": 0.38,
    High: 0.22,
    Medium: 0.1,
    Low: 0.04,
    Negligible: 0.01,
  },
  "Military / Security Post": {
    Extreme: 0.5,
    "Very High": 0.38,
    High: 0.22,
    Medium: 0.1,
    Low: 0.04,
    Negligible: 0.01,
  },
  "Data Centre": {
    Extreme: 0.75,
    "Very High": 0.55,
    High: 0.35,
    Medium: 0.18,
    Low: 0.08,
    Negligible: 0.02,
  },
  "Telecoms Mast / Tower": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Power Generation Plant": {
    Extreme: 0.7,
    "Very High": 0.52,
    High: 0.32,
    Medium: 0.16,
    Low: 0.07,
    Negligible: 0.02,
  },
  "Electrical Substation": {
    Extreme: 0.7,
    "Very High": 0.52,
    High: 0.32,
    Medium: 0.16,
    Low: 0.07,
    Negligible: 0.02,
  },
  "Transmission Line / Pylon": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.01,
  },
  "Water Treatment Plant": {
    Extreme: 0.65,
    "Very High": 0.48,
    High: 0.3,
    Medium: 0.15,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Water Distribution Network": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.01,
  },
  "Onshore Refinery / Process Plant": {
    Extreme: 0.75,
    "Very High": 0.55,
    High: 0.35,
    Medium: 0.18,
    Low: 0.08,
    Negligible: 0.02,
  },
  "LNG / LPG Terminal": {
    Extreme: 0.8,
    "Very High": 0.6,
    High: 0.38,
    Medium: 0.2,
    Low: 0.08,
    Negligible: 0.02,
  },
  "Offshore Platform": {
    Extreme: 0.85,
    "Very High": 0.65,
    High: 0.42,
    Medium: 0.22,
    Low: 0.1,
    Negligible: 0.03,
  },
  "Floating Production Vessel (FPSO)": {
    Extreme: 0.8,
    "Very High": 0.6,
    High: 0.38,
    Medium: 0.2,
    Low: 0.08,
    Negligible: 0.03,
  },
  "Storage Tank / Tank Farm": {
    Extreme: 0.65,
    "Very High": 0.48,
    High: 0.3,
    Medium: 0.15,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Petrol Station / Depot": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Pipeline \u2014 Onshore": {
    Extreme: 0.5,
    "Very High": 0.38,
    High: 0.22,
    Medium: 0.1,
    Low: 0.04,
    Negligible: 0.01,
  },
  "Pipeline \u2014 Offshore / Subsea": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.01,
  },
  "Underground Cable / Duct": {
    Extreme: 0.45,
    "Very High": 0.32,
    High: 0.2,
    Medium: 0.1,
    Low: 0.04,
    Negligible: 0.01,
  },
  "Road / Bridge / Culvert": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Rail Track / Rail Infrastructure": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.01,
  },
  "Port / Jetty / Quay": {
    Extreme: 0.65,
    "Very High": 0.48,
    High: 0.3,
    Medium: 0.15,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Airport Terminal / Runway": {
    Extreme: 0.65,
    "Very High": 0.48,
    High: 0.3,
    Medium: 0.15,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Vessel / Barge / Tug": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Vehicle Fleet / Rolling Stock": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.01,
  },
  "Outdoor Plant & Equipment": {
    Extreme: 0.65,
    "Very High": 0.48,
    High: 0.3,
    Medium: 0.15,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Semi-outdoor Kiosk / Booth": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.01,
  },
  "Open Yard / Storage Compound": {
    Extreme: 0.5,
    "Very High": 0.38,
    High: 0.22,
    Medium: 0.1,
    Low: 0.04,
    Negligible: 0.01,
  },
  "Solar Farm / Wind Farm": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Cropland / Farmland": {
    Extreme: 0.7,
    "Very High": 0.52,
    High: 0.32,
    Medium: 0.16,
    Low: 0.07,
    Negligible: 0.02,
  },
  "Irrigation System": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.01,
  },
  "Aquaculture Facility": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Plantation / Forest": {
    Extreme: 0.65,
    "Very High": 0.48,
    High: 0.3,
    Medium: 0.15,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Mine / Quarry Site": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Mineral Processing Plant": {
    Extreme: 0.65,
    "Very High": 0.48,
    High: 0.3,
    Medium: 0.15,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Tailings Dam / Waste Facility": {
    Extreme: 0.7,
    "Very High": 0.52,
    High: 0.32,
    Medium: 0.16,
    Low: 0.07,
    Negligible: 0.02,
  },
  "Construction Site / Temporary Camp": {
    Extreme: 0.7,
    "Very High": 0.52,
    High: 0.32,
    Medium: 0.16,
    Low: 0.07,
    Negligible: 0.02,
  },
  "Modular / Prefabricated Unit": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Server Room / Network Hub": {
    Extreme: 0.7,
    "Very High": 0.52,
    High: 0.32,
    Medium: 0.16,
    Low: 0.07,
    Negligible: 0.02,
  },
  "ATM / POS Terminal Network": {
    Extreme: 0.5,
    "Very High": 0.38,
    High: 0.22,
    Medium: 0.1,
    Low: 0.04,
    Negligible: 0.01,
  },
  "Broadcasting / Transmission Equipment": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.01,
  },
};

export const RATING_ORDER: Record<HazardRating, number> = {
  Negligible: 1,
  Low: 2,
  Medium: 3,
  High: 4,
  "Very High": 5,
  Extreme: 6,
};

export const ANNUAL_PROBABILITY: Record<string, number> = {
  "Almost Certain": 0.9,
  "Very Frequent": 0.5,
  Frequent: 0.2,
  Occasional: 0.1,
  Rare: 0.04,
  "Very Rare": 0.01,
};

export const RISK_APPETITE: Record<HazardRating, string> = {
  Extreme: "CRITICAL \u2014 Immediate action required",
  "Very High": "HIGH \u2014 Action required within 30 days",
  High: "ELEVATED \u2014 Action within 90 days",
  Medium: "MODERATE \u2014 Monitor and plan response",
  Low: "LOW \u2014 Accept and monitor",
  Negligible: "NEGLIGIBLE \u2014 Accept",
};

export const RESPONSE_RULES: Record<
  HazardRating,
  {
    strategy: string;
    priority: string;
    timeframe: string;
    reductionPct: number;
  }
> = {
  Extreme: {
    strategy: "Avoid / Transfer",
    priority: "Critical",
    timeframe: "Immediate",
    reductionPct: 40,
  },
  "Very High": {
    strategy: "Transfer / Mitigate",
    priority: "High",
    timeframe: "30 days",
    reductionPct: 35,
  },
  High: {
    strategy: "Mitigate / Reduce",
    priority: "Elevated",
    timeframe: "90 days",
    reductionPct: 30,
  },
  Medium: {
    strategy: "Monitor / Reduce",
    priority: "Moderate",
    timeframe: "6 months",
    reductionPct: 20,
  },
  Low: {
    strategy: "Accept / Monitor",
    priority: "Low",
    timeframe: "Annual review",
    reductionPct: 10,
  },
  Negligible: {
    strategy: "Accept",
    priority: "Minimal",
    timeframe: "No action needed",
    reductionPct: 0,
  },
};

export const MONITORING_CONFIG: Record<
  string,
  { kpi: string; frequency: string }
> = {
  "Extreme Heat": {
    kpi: "Max temperature exceedance days per year",
    frequency: "Monthly",
  },
  Drought: {
    kpi: "Standardised Precipitation Index (SPI)",
    frequency: "Monthly",
  },
  "Tropical Cyclones": {
    kpi: "Storm proximity events within 500km",
    frequency: "Seasonal",
  },
  "Thunderstorms & Lightning": {
    kpi: "Lightning strike incidents within 5km",
    frequency: "Monthly",
  },
  "Sandstorms / Harmattan": {
    kpi: "Dust concentration (AOD) during Harmattan season",
    frequency: "Seasonal",
  },
  "Heavy Rainfall": {
    kpi: "Days exceeding 50mm rainfall per year",
    frequency: "Monthly",
  },
  "River Flooding": {
    kpi: "River gauge level above flood threshold",
    frequency: "Weekly",
  },
  "Flash Flooding": {
    kpi: "Urban flood incident reports",
    frequency: "Monthly",
  },
  "Coastal Flooding": {
    kpi: "Tidal inundation extent monitoring",
    frequency: "Monthly",
  },
  "Storm Surge": { kpi: "Storm surge warning triggers", frequency: "Seasonal" },
  Landslides: { kpi: "Slope movement sensor readings", frequency: "Quarterly" },
  "Coastal & Riverbank Erosion": {
    kpi: "Shoreline retreat measurement (m/year)",
    frequency: "Biannual",
  },
  "Groundwater Flooding": {
    kpi: "Groundwater table level monitoring",
    frequency: "Monthly",
  },
  "Sea Level Rise": {
    kpi: "Relative sea level trend (mm/year)",
    frequency: "Annual",
  },
  Desertification: {
    kpi: "Vegetation cover change (NDVI)",
    frequency: "Annual",
  },
  "Wildfire / Bushfire": {
    kpi: "Fire danger index exceedance days",
    frequency: "Seasonal",
  },
  "Water Scarcity": { kpi: "Baseline water stress score", frequency: "Annual" },
  "Glacial Retreat": {
    kpi: "Glacier mass balance change",
    frequency: "Annual",
  },
  Earthquakes: { kpi: "Seismic events M4+ within 100km", frequency: "Annual" },
  "Volcanic Eruptions": {
    kpi: "Volcanic alert level changes",
    frequency: "Annual",
  },
  Tsunamis: { kpi: "Tsunami warning system alerts", frequency: "Annual" },
};

export const HAZARD_RATING_COLORS: Record<HazardRating, string> = {
  Extreme: "#8B0000",
  "Very High": "#DC143C",
  High: "#FF6347",
  Medium: "#FFA500",
  Low: "#4CAF50",
  Negligible: "#81C784",
};

export const ASSET_TYPE_MAP: Record<string, string> = {
  tower_infrastructure: "Telecoms Mast / Tower",
  data_centers: "Data Centre",
  fiber_network: "Underground Cable / Duct",
  power_systems: "Electrical Substation",
  active_equipment: "Server Room / Network Hub",
  spectrum_licenses: "Broadcasting / Transmission Equipment",
  real_estate_facilities: "Office Building",
  supplier_operations: "Industrial Building",
  mobile_money_infra: "ATM / POS Terminal Network",
  loans_advances: "Office Building",
  equities: "Office Building",
  bonds_fixed_income: "Office Building",
  derivatives: "Office Building",
  property: "Office Building",
  deposits: "Office Building",
  insurance: "Office Building",
  off_balance_sheet: "Office Building",
};

export function buildMatrixConfig(size: number): MatrixConfig {
  const s = Math.max(3, Math.min(6, Math.round(size)));
  if (s === 3) {
    return {
      size: 3,
      maxScore: 3,
      intensityLabels: { 1: "Low", 2: "Medium", 3: "High" },
      frequencyLabels: { 1: "Rare", 2: "Occasional", 3: "Frequent" },
      ratingLabels: ["Low", "Medium", "High"],
      matrix: {
        "3,3": "High",
        "3,2": "High",
        "3,1": "Medium",
        "2,3": "High",
        "2,2": "Medium",
        "2,1": "Low",
        "1,3": "Medium",
        "1,2": "Low",
        "1,1": "Low",
      },
    };
  }
  if (s === 4) {
    return {
      size: 4,
      maxScore: 4,
      intensityLabels: { 1: "Low", 2: "Medium", 3: "High", 4: "Very High" },
      frequencyLabels: {
        1: "Rare",
        2: "Occasional",
        3: "Frequent",
        4: "Very Frequent",
      },
      ratingLabels: ["Low", "Medium", "High", "Very High"],
      matrix: {
        "4,4": "Very High",
        "4,3": "Very High",
        "4,2": "High",
        "4,1": "High",
        "3,4": "Very High",
        "3,3": "High",
        "3,2": "High",
        "3,1": "Medium",
        "2,4": "High",
        "2,3": "Medium",
        "2,2": "Medium",
        "2,1": "Low",
        "1,4": "Medium",
        "1,3": "Low",
        "1,2": "Low",
        "1,1": "Low",
      },
    };
  }
  if (s === 5) {
    return {
      size: 5,
      maxScore: 5,
      intensityLabels: {
        1: "Negligible",
        2: "Low",
        3: "Medium",
        4: "High",
        5: "Very High",
      },
      frequencyLabels: {
        1: "Very Rare",
        2: "Rare",
        3: "Occasional",
        4: "Frequent",
        5: "Very Frequent",
      },
      ratingLabels: ["Negligible", "Low", "Medium", "High", "Very High"],
      matrix: {
        "5,5": "Very High",
        "5,4": "Very High",
        "5,3": "High",
        "5,2": "High",
        "5,1": "Medium",
        "4,5": "Very High",
        "4,4": "High",
        "4,3": "High",
        "4,2": "Medium",
        "4,1": "Medium",
        "3,5": "High",
        "3,4": "High",
        "3,3": "Medium",
        "3,2": "Medium",
        "3,1": "Low",
        "2,5": "Medium",
        "2,4": "Medium",
        "2,3": "Low",
        "2,2": "Low",
        "2,1": "Negligible",
        "1,5": "Low",
        "1,4": "Low",
        "1,3": "Negligible",
        "1,2": "Negligible",
        "1,1": "Negligible",
      },
    };
  }
  return {
    size: 6,
    maxScore: 6,
    intensityLabels: {
      1: "Negligible",
      2: "Low",
      3: "Medium",
      4: "High",
      5: "Very High",
      6: "Extreme",
    },
    frequencyLabels: {
      1: "Very Rare",
      2: "Rare",
      3: "Occasional",
      4: "Frequent",
      5: "Very Frequent",
      6: "Almost Certain",
    },
    ratingLabels: [
      "Negligible",
      "Low",
      "Medium",
      "High",
      "Very High",
      "Extreme",
    ],
    matrix: {
      "6,6": "Extreme",
      "6,5": "Extreme",
      "6,4": "Very High",
      "6,3": "Very High",
      "6,2": "High",
      "6,1": "High",
      "5,6": "Extreme",
      "5,5": "Very High",
      "5,4": "Very High",
      "5,3": "High",
      "5,2": "High",
      "5,1": "Medium",
      "4,6": "Very High",
      "4,5": "Very High",
      "4,4": "High",
      "4,3": "High",
      "4,2": "Medium",
      "4,1": "Medium",
      "3,6": "High",
      "3,5": "High",
      "3,4": "Medium",
      "3,3": "Medium",
      "3,2": "Low",
      "3,1": "Low",
      "2,6": "Medium",
      "2,5": "Medium",
      "2,4": "Low",
      "2,3": "Low",
      "2,2": "Negligible",
      "2,1": "Negligible",
      "1,6": "Low",
      "1,5": "Low",
      "1,4": "Negligible",
      "1,3": "Negligible",
      "1,2": "Negligible",
      "1,1": "Negligible",
    },
  };
}

export function getRating(
  mc: MatrixConfig,
  iScore: number,
  fScore: number,
): HazardRating {
  const i = Math.max(1, Math.min(mc.size, iScore));
  const f = Math.max(1, Math.min(mc.size, fScore));
  return mc.matrix[`${i},${f}`] || "Low";
}

export function scaleScore(
  rawScore: number,
  rawMax: number,
  targetMax: number,
): number {
  if (rawMax === targetMax) return rawScore;
  const scaled = Math.round((rawScore / rawMax) * targetMax);
  return Math.max(1, Math.min(targetMax, scaled));
}

export function getExposureFactor(
  assetType: string,
  hazardRating: HazardRating,
): number {
  const typeEf = EF_TABLE[assetType];
  if (typeEf) return typeEf[hazardRating] ?? 0.1;
  return EF_TABLE["Office Building"][hazardRating] ?? 0.1;
}

export function getAnnualProbability(frequencyLabel: string): number {
  return ANNUAL_PROBABILITY[frequencyLabel] ?? 0.1;
}
