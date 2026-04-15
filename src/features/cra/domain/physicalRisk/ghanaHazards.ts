type HLevel = "H" | "M" | "L";

interface GhanaLocation {
  name: string;
  lat: number;
  lon: number;
  radius: number;
  region: string;
  hazards: Partial<Record<string, HLevel>>;
}

interface GhanaRegion {
  bbox: [number, number, number, number]; // [latMin, latMax, lonMin, lonMax]
  hazards: Partial<Record<string, HLevel>>;
}

export const GHANA_LEVEL_SCORES: Record<HLevel, [number, number]> = {
  H: [0.72, 0.62],
  M: [0.48, 0.36],
  L: [0.22, 0.15],
};
export const GHANA_ABSENT_SCORES: [number, number] = [0.03, 0.02];

// ---------------------------------------------------------------------------
// Named locations – sub-district precision (radius in decimal degrees ≈ km/111)
// Hazards calibrated from NADMO flood records, Ghana EPA climate profiles,
// GCAP (Ghana Climate Action Plan 2022), WRI Aqueduct, and IPCC AR6 West Africa
// ---------------------------------------------------------------------------
const GHANA_LOCATIONS: GhanaLocation[] = [
  // === GREATER ACCRA ===
  {
    name: "Accra Central / James Town",
    lat: 5.55,
    lon: -0.21,
    radius: 0.12,
    region: "Greater Accra",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Sea Level Rise": "H",
      "Flash Flooding": "H",
      "Heavy Rainfall": "H",
      "Coastal & Riverbank Erosion": "H",
      "Extreme Heat": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
  {
    name: "Accra Tema Motorway / Airport Area",
    lat: 5.6,
    lon: -0.17,
    radius: 0.14,
    region: "Greater Accra",
    hazards: {
      "Flash Flooding": "M",
      "Heavy Rainfall": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "M",
    },
  },
  {
    name: "Legon / East Legon",
    lat: 5.65,
    lon: -0.19,
    radius: 0.12,
    region: "Greater Accra",
    hazards: {
      "Flash Flooding": "M",
      "Heavy Rainfall": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "L",
    },
  },
  {
    name: "La / Labadi / Teshie",
    lat: 5.56,
    lon: -0.12,
    radius: 0.14,
    region: "Greater Accra",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "M",
      "Sea Level Rise": "H",
      "Coastal & Riverbank Erosion": "H",
      "Flash Flooding": "M",
      "Heavy Rainfall": "M",
    },
  },
  {
    name: "Tema Port / Tema Industrial",
    lat: 5.63,
    lon: 0.01,
    radius: 0.18,
    region: "Greater Accra",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Sea Level Rise": "H",
      "Flash Flooding": "M",
      "Heavy Rainfall": "M",
      "Coastal & Riverbank Erosion": "M",
      "Extreme Heat": "M",
    },
  },
  {
    name: "Kasoa / Winneba Junction",
    lat: 5.54,
    lon: -0.43,
    radius: 0.2,
    region: "Greater Accra",
    hazards: {
      "Flash Flooding": "H",
      "Heavy Rainfall": "H",
      "Thunderstorms & Lightning": "M",
      "Coastal Flooding": "L",
    },
  },
  {
    name: "Ada Foah / Estuary",
    lat: 5.78,
    lon: 0.63,
    radius: 0.22,
    region: "Greater Accra",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Sea Level Rise": "H",
      "River Flooding": "H",
      "Coastal & Riverbank Erosion": "H",
      "Heavy Rainfall": "M",
    },
  },

  // === EASTERN REGION ===
  {
    name: "Koforidua",
    lat: 6.09,
    lon: -0.26,
    radius: 0.22,
    region: "Eastern",
    hazards: {
      "Heavy Rainfall": "H",
      "Flash Flooding": "H",
      "Thunderstorms & Lightning": "H",
      Landslides: "M",
    },
  },
  {
    name: "Akosombo / Volta Lake",
    lat: 6.29,
    lon: 0.07,
    radius: 0.25,
    region: "Eastern",
    hazards: {
      "River Flooding": "H",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
      "Heavy Rainfall": "M",
    },
  },
  {
    name: "Nkawkaw / Kwahu",
    lat: 6.55,
    lon: -0.77,
    radius: 0.22,
    region: "Eastern",
    hazards: {
      "Heavy Rainfall": "H",
      "Flash Flooding": "M",
      Landslides: "M",
      "Thunderstorms & Lightning": "M",
    },
  },

  // === ASHANTI ===
  {
    name: "Kumasi",
    lat: 6.69,
    lon: -1.62,
    radius: 0.32,
    region: "Ashanti",
    hazards: {
      "Heavy Rainfall": "H",
      "Flash Flooding": "H",
      "Thunderstorms & Lightning": "H",
      "River Flooding": "M",
      Landslides: "L",
      "Extreme Heat": "L",
    },
  },
  {
    name: "Obuasi",
    lat: 6.2,
    lon: -1.67,
    radius: 0.22,
    region: "Ashanti",
    hazards: {
      "Heavy Rainfall": "H",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
    },
  },

  // === WESTERN ===
  {
    name: "Takoradi / Sekondi",
    lat: 4.9,
    lon: -1.76,
    radius: 0.25,
    region: "Western",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Sea Level Rise": "H",
      "Heavy Rainfall": "H",
      "Flash Flooding": "M",
      "Coastal & Riverbank Erosion": "H",
      "Thunderstorms & Lightning": "M",
    },
  },
  {
    name: "Axim",
    lat: 4.87,
    lon: -2.24,
    radius: 0.2,
    region: "Western",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "M",
      "Sea Level Rise": "H",
      "Coastal & Riverbank Erosion": "H",
      "Heavy Rainfall": "M",
    },
  },
  {
    name: "Cape Three Points / Offshore Oil",
    lat: 4.74,
    lon: -2.1,
    radius: 0.22,
    region: "Western",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Sea Level Rise": "H",
      "Coastal & Riverbank Erosion": "H",
    },
  },

  // === CENTRAL ===
  {
    name: "Cape Coast",
    lat: 5.1,
    lon: -1.24,
    radius: 0.22,
    region: "Central",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Sea Level Rise": "H",
      "Coastal & Riverbank Erosion": "H",
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
    },
  },
  {
    name: "Winneba",
    lat: 5.35,
    lon: -0.63,
    radius: 0.18,
    region: "Central",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "M",
      "Sea Level Rise": "H",
      "Coastal & Riverbank Erosion": "H",
      "Heavy Rainfall": "L",
    },
  },
  {
    name: "Swedru",
    lat: 5.53,
    lon: -0.7,
    radius: 0.2,
    region: "Central",
    hazards: {
      "Flash Flooding": "M",
      "Heavy Rainfall": "M",
      "Thunderstorms & Lightning": "M",
    },
  },

  // === VOLTA ===
  {
    name: "Ho",
    lat: 6.6,
    lon: 0.47,
    radius: 0.22,
    region: "Volta",
    hazards: {
      "Heavy Rainfall": "H",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
      Landslides: "L",
    },
  },
  {
    name: "Keta / Keta Lagoon",
    lat: 5.92,
    lon: 1.0,
    radius: 0.2,
    region: "Volta",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Sea Level Rise": "H",
      "Coastal & Riverbank Erosion": "H",
      "Groundwater Flooding": "H",
      "Heavy Rainfall": "M",
    },
  },
  {
    name: "Anloga / Keta Coast",
    lat: 5.8,
    lon: 0.9,
    radius: 0.22,
    region: "Volta",
    hazards: {
      "Coastal Flooding": "H",
      "Storm Surge": "H",
      "Sea Level Rise": "H",
      "Coastal & Riverbank Erosion": "H",
    },
  },

  // === OTI / NORTHERN VOLTA ===
  {
    name: "Dambai / Oti River",
    lat: 8.07,
    lon: -0.17,
    radius: 0.22,
    region: "Oti",
    hazards: {
      "River Flooding": "H",
      "Flash Flooding": "M",
      "Heavy Rainfall": "M",
      "Thunderstorms & Lightning": "M",
    },
  },

  // === NORTHERN ===
  {
    name: "Tamale",
    lat: 9.4,
    lon: -0.85,
    radius: 0.3,
    region: "Northern",
    hazards: {
      "Flash Flooding": "H",
      "Heavy Rainfall": "M",
      Drought: "M",
      "Extreme Heat": "H",
      "Thunderstorms & Lightning": "M",
      "Wildfire / Bushfire": "M",
    },
  },
  {
    name: "Yendi",
    lat: 9.44,
    lon: -0.01,
    radius: 0.22,
    region: "Northern",
    hazards: {
      "Flash Flooding": "M",
      Drought: "M",
      "Extreme Heat": "H",
      "Wildfire / Bushfire": "M",
    },
  },

  // === NORTH EAST ===
  {
    name: "Nalerigu / Gambaga",
    lat: 10.52,
    lon: -0.37,
    radius: 0.22,
    region: "North East",
    hazards: {
      Drought: "H",
      "Extreme Heat": "H",
      Desertification: "M",
      "Wildfire / Bushfire": "M",
      "Sandstorms / Harmattan": "M",
    },
  },

  // === UPPER EAST ===
  {
    name: "Bolgatanga",
    lat: 10.79,
    lon: -0.85,
    radius: 0.25,
    region: "Upper East",
    hazards: {
      Drought: "H",
      "Extreme Heat": "H",
      Desertification: "H",
      "Wildfire / Bushfire": "M",
      "Sandstorms / Harmattan": "H",
      "Water Scarcity": "H",
      "Flash Flooding": "L",
    },
  },
  {
    name: "Navrongo",
    lat: 10.89,
    lon: -1.09,
    radius: 0.22,
    region: "Upper East",
    hazards: {
      Drought: "H",
      "Extreme Heat": "H",
      Desertification: "H",
      "Sandstorms / Harmattan": "H",
      "Water Scarcity": "H",
    },
  },
  {
    name: "Bawku",
    lat: 11.06,
    lon: -0.24,
    radius: 0.22,
    region: "Upper East",
    hazards: {
      Drought: "H",
      "Extreme Heat": "H",
      Desertification: "H",
      "Water Scarcity": "H",
      "Sandstorms / Harmattan": "H",
    },
  },

  // === UPPER WEST ===
  {
    name: "Wa",
    lat: 10.06,
    lon: -2.5,
    radius: 0.25,
    region: "Upper West",
    hazards: {
      Drought: "H",
      "Extreme Heat": "H",
      Desertification: "M",
      "Wildfire / Bushfire": "M",
      "Sandstorms / Harmattan": "H",
      "Water Scarcity": "H",
    },
  },
  {
    name: "Lawra",
    lat: 10.64,
    lon: -2.9,
    radius: 0.22,
    region: "Upper West",
    hazards: {
      Drought: "H",
      "Extreme Heat": "H",
      Desertification: "M",
      "Water Scarcity": "H",
      "Sandstorms / Harmattan": "M",
    },
  },

  // === SAVANNAH ===
  {
    name: "Damongo",
    lat: 9.08,
    lon: -1.82,
    radius: 0.22,
    region: "Savannah",
    hazards: {
      "Flash Flooding": "M",
      Drought: "M",
      "Extreme Heat": "H",
      "Wildfire / Bushfire": "H",
    },
  },

  // === AHAFO / BONO ===
  {
    name: "Sunyani",
    lat: 7.34,
    lon: -2.33,
    radius: 0.22,
    region: "Bono",
    hazards: {
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
      "Wildfire / Bushfire": "L",
    },
  },
  {
    name: "Techiman",
    lat: 7.59,
    lon: -1.94,
    radius: 0.22,
    region: "Bono East",
    hazards: {
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
    },
  },

  // === BONO EAST ===
  {
    name: "Kintampo",
    lat: 8.06,
    lon: -1.73,
    radius: 0.22,
    region: "Bono East",
    hazards: {
      "Flash Flooding": "M",
      "Heavy Rainfall": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "L",
    },
  },
];

// ---------------------------------------------------------------------------
// Region-level fallbacks (16 regions since 2019 reorganisation)
// ---------------------------------------------------------------------------
const GHANA_REGIONS: Record<string, GhanaRegion> = {
  "Greater Accra": {
    bbox: [5.45, 5.9, -0.55, 0.5],
    hazards: {
      "Flash Flooding": "M",
      "Heavy Rainfall": "M",
      "Thunderstorms & Lightning": "M",
      "Extreme Heat": "L",
    },
  },
  Ashanti: {
    bbox: [6.0, 7.5, -2.3, -0.8],
    hazards: {
      "Heavy Rainfall": "H",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "H",
      "River Flooding": "L",
    },
  },
  Eastern: {
    bbox: [5.7, 7.0, -1.2, 0.3],
    hazards: {
      "Heavy Rainfall": "H",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "H",
      Landslides: "L",
    },
  },
  Central: {
    bbox: [4.9, 5.8, -1.8, -0.2],
    hazards: {
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
      "Coastal Flooding": "L",
    },
  },
  Western: {
    bbox: [4.5, 6.5, -3.2, -1.2],
    hazards: {
      "Heavy Rainfall": "H",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "H",
      "Coastal Flooding": "L",
    },
  },
  "Western North": {
    bbox: [5.8, 7.5, -3.2, -2.3],
    hazards: {
      "Heavy Rainfall": "H",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "H",
    },
  },
  Volta: {
    bbox: [5.7, 8.9, -0.3, 1.2],
    hazards: {
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      "River Flooding": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
  Oti: {
    bbox: [7.8, 10.0, -0.6, 0.6],
    hazards: {
      "Flash Flooding": "M",
      Drought: "L",
      "Extreme Heat": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
  Northern: {
    bbox: [8.5, 10.5, -1.8, 0.6],
    hazards: {
      Drought: "M",
      "Extreme Heat": "H",
      "Flash Flooding": "M",
      "Wildfire / Bushfire": "M",
      "Sandstorms / Harmattan": "M",
    },
  },
  "North East": {
    bbox: [9.8, 11.1, -0.8, 0.6],
    hazards: {
      Drought: "H",
      "Extreme Heat": "H",
      Desertification: "M",
      "Wildfire / Bushfire": "M",
      "Sandstorms / Harmattan": "H",
    },
  },
  "Upper East": {
    bbox: [10.3, 11.2, -1.5, 0.4],
    hazards: {
      Drought: "H",
      "Extreme Heat": "H",
      Desertification: "H",
      "Water Scarcity": "H",
      "Sandstorms / Harmattan": "H",
    },
  },
  "Upper West": {
    bbox: [9.5, 11.2, -3.1, -1.8],
    hazards: {
      Drought: "H",
      "Extreme Heat": "H",
      Desertification: "M",
      "Water Scarcity": "H",
      "Sandstorms / Harmattan": "H",
    },
  },
  Savannah: {
    bbox: [8.0, 9.8, -2.8, -0.8],
    hazards: {
      Drought: "M",
      "Extreme Heat": "H",
      "Wildfire / Bushfire": "H",
      "Flash Flooding": "M",
    },
  },
  "Bono East": {
    bbox: [7.2, 8.5, -2.1, -0.6],
    hazards: {
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
  Bono: {
    bbox: [6.8, 8.1, -3.2, -1.8],
    hazards: {
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
  Ahafo: {
    bbox: [6.5, 7.5, -2.8, -1.8],
    hazards: {
      "Heavy Rainfall": "M",
      "Flash Flooding": "M",
      "Thunderstorms & Lightning": "M",
    },
  },
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------
function getGhanaLocationMatch(lat: number, lon: number): GhanaLocation | null {
  let best: GhanaLocation | null = null;
  let bestDist = Infinity;
  for (const loc of GHANA_LOCATIONS) {
    const d = Math.sqrt((lat - loc.lat) ** 2 + (lon - loc.lon) ** 2);
    if (d <= loc.radius && d < bestDist) {
      best = loc;
      bestDist = d;
    }
  }
  return best;
}

function getGhanaRegionName(lat: number, lon: number): string | null {
  for (const [name, region] of Object.entries(GHANA_REGIONS)) {
    const [latMin, latMax, lonMin, lonMax] = region.bbox;
    if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax)
      return name;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API — mirrors nigeriaHazards exports
// ---------------------------------------------------------------------------

/** Returns true if coordinates are within Ghana's bounding box */
export function isInGhana(lat: number, lon: number): boolean {
  return lat >= 4.5 && lat <= 11.2 && lon >= -3.3 && lon <= 1.3;
}

export function getGhanaMatchInfo(
  lat: number,
  lon: number,
): { tier: "location" | "region"; name: string; region: string } | null {
  if (!isInGhana(lat, lon)) return null;
  const loc = getGhanaLocationMatch(lat, lon);
  if (loc) return { tier: "location", name: loc.name, region: loc.region };
  const region = getGhanaRegionName(lat, lon);
  if (region) return { tier: "region", name: region, region };
  return null;
}

export function getGhanaBaseScores(
  lat: number,
  lon: number,
  risk: string,
): [number, number] | null {
  if (!isInGhana(lat, lon)) return null;

  const loc = getGhanaLocationMatch(lat, lon);
  if (loc) {
    const lv = loc.hazards[risk] as HLevel | undefined;
    return lv ? GHANA_LEVEL_SCORES[lv] : GHANA_ABSENT_SCORES;
  }

  const region = getGhanaRegionName(lat, lon);
  if (region) {
    const profile = GHANA_REGIONS[region];
    const lv = profile?.hazards[risk] as HLevel | undefined;
    return lv ? GHANA_LEVEL_SCORES[lv] : GHANA_ABSENT_SCORES;
  }

  return null;
}

export function getGhanaHazardSuggestions(
  lat: number,
  lon: number,
): string[] | null {
  if (!isInGhana(lat, lon)) return null;

  const loc = getGhanaLocationMatch(lat, lon);
  const hazards = loc
    ? loc.hazards
    : (GHANA_REGIONS[getGhanaRegionName(lat, lon) ?? ""]?.hazards ?? null);

  if (!hazards) return null;
  return Object.entries(hazards)
    .filter(([, lv]) => lv === "H" || lv === "M")
    .map(([risk]) => risk);
}
