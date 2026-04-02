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
    "Very High": 0.42,
    High: 0.26,
    Medium: 0.13,
    Low: 0.05,
    Negligible: 0.02,
  },
  "Industrial Building": {
    Extreme: 0.65,
    "Very High": 0.5,
    High: 0.33,
    Medium: 0.17,
    Low: 0.07,
    Negligible: 0.02,
  },
  "Warehouse / Storage": {
    Extreme: 0.7,
    "Very High": 0.55,
    High: 0.38,
    Medium: 0.2,
    Low: 0.08,
    Negligible: 0.03,
  },
  "Retail Outlet / Branch": {
    Extreme: 0.5,
    "Very High": 0.38,
    High: 0.24,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.02,
  },
  "Healthcare Facility": {
    Extreme: 0.55,
    "Very High": 0.42,
    High: 0.27,
    Medium: 0.13,
    Low: 0.05,
    Negligible: 0.02,
  },
  "Educational Facility": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.02,
  },
  "Hospitality Building": {
    Extreme: 0.6,
    "Very High": 0.45,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Religious / Assembly Hall": {
    Extreme: 0.55,
    "Very High": 0.4,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.02,
  },
  "Military / Security Post": {
    Extreme: 0.5,
    "Very High": 0.38,
    High: 0.24,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.02,
  },
  "Data Centre": {
    Extreme: 0.7,
    "Very High": 0.55,
    High: 0.35,
    Medium: 0.2,
    Low: 0.08,
    Negligible: 0.03,
  },
  "Telecoms Mast / Tower": {
    Extreme: 0.8,
    "Very High": 0.65,
    High: 0.45,
    Medium: 0.25,
    Low: 0.1,
    Negligible: 0.04,
  },
  "Power Generation Plant": {
    Extreme: 0.65,
    "Very High": 0.52,
    High: 0.35,
    Medium: 0.18,
    Low: 0.07,
    Negligible: 0.03,
  },
  "Electrical Substation": {
    Extreme: 0.7,
    "Very High": 0.55,
    High: 0.38,
    Medium: 0.2,
    Low: 0.08,
    Negligible: 0.03,
  },
  "Transmission Line / Pylon": {
    Extreme: 0.75,
    "Very High": 0.6,
    High: 0.42,
    Medium: 0.22,
    Low: 0.09,
    Negligible: 0.03,
  },
  "Water Treatment Plant": {
    Extreme: 0.6,
    "Very High": 0.48,
    High: 0.32,
    Medium: 0.16,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Water Distribution Network": {
    Extreme: 0.55,
    "Very High": 0.42,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Onshore Refinery / Process Plant": {
    Extreme: 0.65,
    "Very High": 0.52,
    High: 0.35,
    Medium: 0.18,
    Low: 0.07,
    Negligible: 0.03,
  },
  "LNG / LPG Terminal": {
    Extreme: 0.65,
    "Very High": 0.52,
    High: 0.35,
    Medium: 0.18,
    Low: 0.07,
    Negligible: 0.03,
  },
  "Offshore Platform": {
    Extreme: 0.75,
    "Very High": 0.62,
    High: 0.45,
    Medium: 0.25,
    Low: 0.1,
    Negligible: 0.04,
  },
  "Floating Production Vessel (FPSO)": {
    Extreme: 0.7,
    "Very High": 0.58,
    High: 0.4,
    Medium: 0.22,
    Low: 0.09,
    Negligible: 0.03,
  },
  "Storage Tank / Tank Farm": {
    Extreme: 0.65,
    "Very High": 0.52,
    High: 0.35,
    Medium: 0.18,
    Low: 0.07,
    Negligible: 0.03,
  },
  "Petrol Station / Depot": {
    Extreme: 0.6,
    "Very High": 0.48,
    High: 0.32,
    Medium: 0.16,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Pipeline \u2014 Onshore": {
    Extreme: 0.4,
    "Very High": 0.3,
    High: 0.2,
    Medium: 0.1,
    Low: 0.04,
    Negligible: 0.01,
  },
  "Pipeline \u2014 Offshore / Subsea": {
    Extreme: 0.45,
    "Very High": 0.35,
    High: 0.22,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.02,
  },
  "Underground Cable / Duct": {
    Extreme: 0.35,
    "Very High": 0.25,
    High: 0.16,
    Medium: 0.08,
    Low: 0.03,
    Negligible: 0.01,
  },
  "Road / Bridge / Culvert": {
    Extreme: 0.55,
    "Very High": 0.42,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Rail Track / Rail Infrastructure": {
    Extreme: 0.5,
    "Very High": 0.38,
    High: 0.25,
    Medium: 0.12,
    Low: 0.05,
    Negligible: 0.02,
  },
  "Port / Jetty / Quay": {
    Extreme: 0.65,
    "Very High": 0.52,
    High: 0.35,
    Medium: 0.18,
    Low: 0.07,
    Negligible: 0.03,
  },
  "Airport Terminal / Runway": {
    Extreme: 0.6,
    "Very High": 0.48,
    High: 0.32,
    Medium: 0.16,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Vessel / Barge / Tug": {
    Extreme: 0.7,
    "Very High": 0.56,
    High: 0.38,
    Medium: 0.2,
    Low: 0.08,
    Negligible: 0.03,
  },
  "Vehicle Fleet / Rolling Stock": {
    Extreme: 0.65,
    "Very High": 0.5,
    High: 0.33,
    Medium: 0.17,
    Low: 0.07,
    Negligible: 0.02,
  },
  "Outdoor Plant & Equipment": {
    Extreme: 0.8,
    "Very High": 0.65,
    High: 0.45,
    Medium: 0.25,
    Low: 0.1,
    Negligible: 0.04,
  },
  "Semi-outdoor Kiosk / Booth": {
    Extreme: 0.75,
    "Very High": 0.6,
    High: 0.4,
    Medium: 0.22,
    Low: 0.09,
    Negligible: 0.03,
  },
  "Open Yard / Storage Compound": {
    Extreme: 0.6,
    "Very High": 0.46,
    High: 0.3,
    Medium: 0.15,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Solar Farm / Wind Farm": {
    Extreme: 0.75,
    "Very High": 0.6,
    High: 0.4,
    Medium: 0.22,
    Low: 0.09,
    Negligible: 0.03,
  },
  "Cropland / Farmland": {
    Extreme: 0.95,
    "Very High": 0.8,
    High: 0.6,
    Medium: 0.35,
    Low: 0.15,
    Negligible: 0.05,
  },
  "Irrigation System": {
    Extreme: 0.65,
    "Very High": 0.5,
    High: 0.33,
    Medium: 0.17,
    Low: 0.07,
    Negligible: 0.02,
  },
  "Aquaculture Facility": {
    Extreme: 0.85,
    "Very High": 0.7,
    High: 0.5,
    Medium: 0.28,
    Low: 0.12,
    Negligible: 0.04,
  },
  "Plantation / Forest": {
    Extreme: 0.9,
    "Very High": 0.75,
    High: 0.55,
    Medium: 0.3,
    Low: 0.12,
    Negligible: 0.04,
  },
  "Mine / Quarry Site": {
    Extreme: 0.55,
    "Very High": 0.42,
    High: 0.28,
    Medium: 0.14,
    Low: 0.06,
    Negligible: 0.02,
  },
  "Mineral Processing Plant": {
    Extreme: 0.65,
    "Very High": 0.52,
    High: 0.35,
    Medium: 0.18,
    Low: 0.07,
    Negligible: 0.03,
  },
  "Tailings Dam / Waste Facility": {
    Extreme: 0.7,
    "Very High": 0.55,
    High: 0.38,
    Medium: 0.2,
    Low: 0.08,
    Negligible: 0.03,
  },
  "Construction Site / Temporary Camp": {
    Extreme: 0.85,
    "Very High": 0.7,
    High: 0.5,
    Medium: 0.28,
    Low: 0.12,
    Negligible: 0.05,
  },
  "Modular / Prefabricated Unit": {
    Extreme: 0.8,
    "Very High": 0.65,
    High: 0.45,
    Medium: 0.25,
    Low: 0.1,
    Negligible: 0.04,
  },
  "Server Room / Network Hub": {
    Extreme: 0.7,
    "Very High": 0.55,
    High: 0.35,
    Medium: 0.2,
    Low: 0.08,
    Negligible: 0.03,
  },
  "ATM / POS Terminal Network": {
    Extreme: 0.75,
    "Very High": 0.58,
    High: 0.38,
    Medium: 0.2,
    Low: 0.08,
    Negligible: 0.03,
  },
  "Broadcasting / Transmission Equipment": {
    Extreme: 0.7,
    "Very High": 0.55,
    High: 0.35,
    Medium: 0.18,
    Low: 0.07,
    Negligible: 0.03,
  },
};

/* ─── 30 Physical Protection / Resilience Measures ─── */

import type { ResilienceMeasure } from "./types";

export const RESILIENCE_MEASURES: ResilienceMeasure[] = [
  {
    id: "RM01",
    name: "Flood Barriers / Levees",
    category: "Flood",
    rrf: 0.15,
    description:
      "Permanent or deployable flood barriers protecting site perimeter",
  },
  {
    id: "RM02",
    name: "Elevated Foundations",
    category: "Flood",
    rrf: 0.12,
    description: "Building raised above local flood plain level",
  },
  {
    id: "RM03",
    name: "Flood-Proof Cable Routing",
    category: "Flood",
    rrf: 0.08,
    description: "Power and data cables routed above flood levels",
  },
  {
    id: "RM04",
    name: "Sump Pumps / Drainage System",
    category: "Flood",
    rrf: 0.1,
    description: "Automatic sump pump and site drainage system",
  },
  {
    id: "RM05",
    name: "Waterproof Membrane / Tanking",
    category: "Flood",
    rrf: 0.08,
    description: "Below-grade waterproofing on foundations and basements",
  },
  {
    id: "RM06",
    name: "Lightning Protection System",
    category: "Electrical",
    rrf: 0.12,
    description: "BS EN 62305 compliant lightning conductors and earthing",
  },
  {
    id: "RM07",
    name: "Surge Protection Devices",
    category: "Electrical",
    rrf: 0.1,
    description: "Multi-stage SPDs on all incoming power and data lines",
  },
  {
    id: "RM08",
    name: "Uninterruptible Power Supply (UPS)",
    category: "Electrical",
    rrf: 0.08,
    description: "Battery-backed UPS covering critical loads",
  },
  {
    id: "RM09",
    name: "Backup Generator (N+1)",
    category: "Electrical",
    rrf: 0.1,
    description: "Redundant standby generator with automatic transfer switch",
  },
  {
    id: "RM10",
    name: "Wind-Rated Cladding / Roofing",
    category: "Wind",
    rrf: 0.12,
    description: "Building envelope rated for 150+ km/h wind loads",
  },
  {
    id: "RM11",
    name: "Storm Shutters / Impact Glass",
    category: "Wind",
    rrf: 0.08,
    description: "Impact-resistant glazing or deployable shutters",
  },
  {
    id: "RM12",
    name: "Guy Wire / Tower Strengthening",
    category: "Wind",
    rrf: 0.1,
    description: "Additional guy wires or structural bracing on towers/masts",
  },
  {
    id: "RM13",
    name: "N+1 Cooling / HVAC Redundancy",
    category: "Heat",
    rrf: 0.1,
    description: "Redundant cooling units with automatic failover",
  },
  {
    id: "RM14",
    name: "Thermal Insulation Upgrade",
    category: "Heat",
    rrf: 0.06,
    description: "Enhanced roof and wall insulation reducing heat gain",
  },
  {
    id: "RM15",
    name: "Heat-Reflective Roofing",
    category: "Heat",
    rrf: 0.05,
    description: "Cool-roof coating or reflective membrane",
  },
  {
    id: "RM16",
    name: "On-Site Water Storage",
    category: "Water",
    rrf: 0.08,
    description:
      "Rainwater harvesting or dedicated water tanks for 72h autonomy",
  },
  {
    id: "RM17",
    name: "Water Recycling System",
    category: "Water",
    rrf: 0.06,
    description: "Grey water treatment and reuse for cooling and sanitation",
  },
  {
    id: "RM18",
    name: "Fire Suppression System",
    category: "Fire",
    rrf: 0.12,
    description: "Automatic sprinkler or gas suppression (FM-200, Novec)",
  },
  {
    id: "RM19",
    name: "Firebreaks / Vegetation Clearance",
    category: "Fire",
    rrf: 0.08,
    description: "Maintained defensible space around site perimeter",
  },
  {
    id: "RM20",
    name: "Fire Detection & Alarm",
    category: "Fire",
    rrf: 0.06,
    description: "Networked smoke/heat detectors with early warning",
  },
  {
    id: "RM21",
    name: "Seismic Bracing / Base Isolation",
    category: "Seismic",
    rrf: 0.15,
    description: "Structural seismic dampers or base isolation system",
  },
  {
    id: "RM22",
    name: "Seismic Equipment Anchoring",
    category: "Seismic",
    rrf: 0.08,
    description: "All critical equipment bolted and seismically anchored",
  },
  {
    id: "RM23",
    name: "Slope Stabilisation / Retaining Wall",
    category: "Geotechnical",
    rrf: 0.1,
    description: "Engineered retaining structures on slopes within 50m",
  },
  {
    id: "RM24",
    name: "Coastal Protection / Revetment",
    category: "Coastal",
    rrf: 0.12,
    description: "Rock armour, sea wall, or groyne protecting coastal assets",
  },
  {
    id: "RM25",
    name: "Mangrove / Natural Buffer Zone",
    category: "Coastal",
    rrf: 0.08,
    description: "Maintained natural vegetation buffer ≥ 50m from shoreline",
  },
  {
    id: "RM26",
    name: "Air Filtration / Sealed Building",
    category: "Air Quality",
    rrf: 0.08,
    description: "HEPA filtration on air intakes for dust/sand/ash",
  },
  {
    id: "RM27",
    name: "Dust Covers / Equipment Sealing",
    category: "Air Quality",
    rrf: 0.05,
    description: "IP65+ enclosures on outdoor electronics and plant",
  },
  {
    id: "RM28",
    name: "Emergency Response Plan",
    category: "Operational",
    rrf: 0.06,
    description: "Documented and tested emergency/business continuity plan",
  },
  {
    id: "RM29",
    name: "Remote Monitoring & Auto-Shutdown",
    category: "Operational",
    rrf: 0.08,
    description: "IoT-based remote monitoring with automatic safe-shutdown",
  },
  {
    id: "RM30",
    name: "Insurance Coverage (Nat-Cat)",
    category: "Financial",
    rrf: 0.1,
    description: "Comprehensive natural catastrophe insurance policy",
  },
];

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
    strategy: "Reduce + Transfer",
    priority: "CRITICAL",
    timeframe: "Immediate \u2014 within 30 days",
    reductionPct: 40,
  },
  "Very High": {
    strategy: "Reduce + Transfer",
    priority: "HIGH",
    timeframe: "Short-term \u2014 within 60 days",
    reductionPct: 35,
  },
  High: {
    strategy: "Reduce",
    priority: "ELEVATED",
    timeframe: "Medium-term \u2014 within 90 days",
    reductionPct: 30,
  },
  Medium: {
    strategy: "Reduce or Transfer",
    priority: "MODERATE",
    timeframe: "Planned \u2014 within 6 months",
    reductionPct: 20,
  },
  Low: {
    strategy: "Accept or Transfer",
    priority: "LOW",
    timeframe: "Annual review",
    reductionPct: 10,
  },
  Negligible: {
    strategy: "Accept",
    priority: "NEGLIGIBLE",
    timeframe: "Annual review",
    reductionPct: 5,
  },
};

export const MONITORING_CONFIG: Record<
  string,
  {
    kpi: string;
    frequency: string;
    trigger: string;
    dataSource: string;
    ownerRole: string;
  }
> = {
  "Extreme Heat": {
    kpi: "Max temperature exceedance days per year",
    frequency: "Monthly",
    trigger: "Heat index > 42\u00b0C for 3+ consecutive days",
    dataSource: "NASA POWER / national met service",
    ownerRole: "HSE Manager",
  },
  Drought: {
    kpi: "Standardised Precipitation Index (SPI)",
    frequency: "Monthly",
    trigger: "SPI < -1.5 for 2+ consecutive months",
    dataSource: "NASA POWER / CHIRPS satellite rainfall",
    ownerRole: "Facilities Manager",
  },
  "Tropical Cyclones": {
    kpi: "Storm proximity events within 500 km",
    frequency: "Seasonal",
    trigger: "Named storm forecast within 72h / 500km",
    dataSource: "IBTrACS / national met service",
    ownerRole: "Emergency Response Lead",
  },
  "Thunderstorms & Lightning": {
    kpi: "Lightning strike incidents within 5 km",
    frequency: "Monthly",
    trigger: "3+ lightning incidents per month within 5 km",
    dataSource: "Open-Meteo / national met service",
    ownerRole: "Electrical Safety Officer",
  },
  "Sandstorms / Harmattan": {
    kpi: "Dust concentration (AOD) during Harmattan season",
    frequency: "Seasonal",
    trigger: "AOD > 1.5 for 5+ days or visibility < 1 km",
    dataSource: "Open-Meteo / NASA POWER AOD",
    ownerRole: "Operations Manager",
  },
  "Heavy Rainfall": {
    kpi: "Days exceeding 50 mm rainfall per year",
    frequency: "Monthly",
    trigger: "Daily rainfall > 100 mm or 5-day total > 200 mm",
    dataSource: "NASA POWER / local rain-gauge network",
    ownerRole: "Infrastructure Manager",
  },
  "River Flooding": {
    kpi: "River gauge level above flood threshold",
    frequency: "Weekly",
    trigger: "Gauge reading > flood warning level",
    dataSource: "WRI Aqueduct / national hydrological service",
    ownerRole: "Flood Risk Officer",
  },
  "Flash Flooding": {
    kpi: "Urban flood incident reports",
    frequency: "Monthly",
    trigger: "> 50 mm rainfall in 1 h in urban catchment",
    dataSource: "NASA POWER / Nominatim land-use",
    ownerRole: "Emergency Response Lead",
  },
  "Coastal Flooding": {
    kpi: "Tidal inundation extent monitoring",
    frequency: "Monthly",
    trigger: "Storm tide forecast > 1.5 m above MHWS",
    dataSource: "SRTM elevation + tidal gauge data",
    ownerRole: "Coastal Assets Manager",
  },
  "Storm Surge": {
    kpi: "Storm surge warning triggers",
    frequency: "Seasonal",
    trigger: "Surge forecast > 2 m at coastal location",
    dataSource: "SRTM + national coastal monitoring",
    ownerRole: "Emergency Response Lead",
  },
  Landslides: {
    kpi: "Slope movement sensor readings",
    frequency: "Quarterly",
    trigger: "Slope displacement > 5 mm/month or heavy rain on steep terrain",
    dataSource: "OpenTopoData SRTM + NASA POWER rainfall",
    ownerRole: "Geotechnical Engineer",
  },
  "Coastal & Riverbank Erosion": {
    kpi: "Shoreline retreat measurement (m/year)",
    frequency: "Biannual",
    trigger: "Annual retreat > 1 m or buffer zone < 10 m",
    dataSource: "SRTM + Nominatim + satellite imagery",
    ownerRole: "Coastal Assets Manager",
  },
  "Groundwater Flooding": {
    kpi: "Groundwater table level monitoring",
    frequency: "Monthly",
    trigger: "Water table within 0.5 m of foundation base",
    dataSource: "SRTM elevation + NASA POWER wet-season data",
    ownerRole: "Facilities Manager",
  },
  "Sea Level Rise": {
    kpi: "Relative sea level trend (mm/year)",
    frequency: "Annual",
    trigger: "Projected 2100 SLR exceeds site elevation margin",
    dataSource: "IPCC AR6 projections + SRTM elevation",
    ownerRole: "Strategic Risk Manager",
  },
  Desertification: {
    kpi: "Vegetation cover change (NDVI)",
    frequency: "Annual",
    trigger: "Decadal rainfall decline > 15% or NDVI drop > 20%",
    dataSource: "NASA POWER rainfall trend analysis",
    ownerRole: "Environmental Manager",
  },
  "Wildfire / Bushfire": {
    kpi: "Fire danger index exceedance days",
    frequency: "Seasonal",
    trigger: "FDI 'Extreme' rating or active fire within 5 km",
    dataSource: "Latitude-based fire zone classification",
    ownerRole: "HSE Manager",
  },
  "Water Scarcity": {
    kpi: "Baseline water stress score",
    frequency: "Annual",
    trigger: "BWS score > 3.0 or annual rainfall < 500 mm",
    dataSource: "WRI Aqueduct / NASA POWER",
    ownerRole: "Utilities Manager",
  },
  "Glacial Retreat": {
    kpi: "Glacier mass balance change",
    frequency: "Annual",
    trigger: "Downstream flow reduction > 10% year-on-year",
    dataSource: "Haversine distance to African glaciers",
    ownerRole: "Water Resources Manager",
  },
  Earthquakes: {
    kpi: "Seismic events M4+ within 100 km",
    frequency: "Annual",
    trigger: "M5.0+ event within 100 km or 3+ M4.0+ events/year",
    dataSource: "USGS FDSNWS earthquake catalogue",
    ownerRole: "Structural Engineer",
  },
  "Volcanic Eruptions": {
    kpi: "Volcanic alert level changes",
    frequency: "Annual",
    trigger: "Alert level raised to 'Watch' or higher within 150 km",
    dataSource: "Haversine distance to African volcanoes",
    ownerRole: "Emergency Response Lead",
  },
  Tsunamis: {
    kpi: "Tsunami warning system alerts",
    frequency: "Annual",
    trigger: "Tsunami warning issued for coastal zone",
    dataSource: "NOAA NGDC tsunami database + SRTM",
    ownerRole: "Emergency Response Lead",
  },
};

export const HAZARD_RATING_COLORS: Record<HazardRating, string> = {
  Extreme: "#DC2626",
  "Very High": "#EF4444",
  High: "#F87171",
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
