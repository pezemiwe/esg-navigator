/**
 * globalHazards.ts
 *
 * Precision coastal-distance and elevation-aware hazard scoring for
 * locations not covered by country-specific files (Nigeria, Ghana).
 *
 * Design principles:
 * 1. Coastal flooding / storm surge / sea level rise scale with TRUE
 *    distance to nearest coastline — not a crude latitude difference.
 * 2. Elevation from geocoding (geoConfidence) provides a continuous
 *    multiplicative correction for all flood hazards.
 * 3. River proximity scales riverine flood risk.
 * 4. Regional climatic profiles cover the rest of West Africa,
 *    East Africa, Southern Africa, North Africa, and globally.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface LocationContext {
  /** Metres above sea level from OpenTopoData (0 if unavailable) */
  elevationM: number;
  /** True if geocoder flagged site as coastal */
  isCoastal: boolean;
  /** True if geocoder flagged site as urban */
  isUrban: boolean;
}

// ---------------------------------------------------------------------------
// Coastal proximity helpers
//
// Instead of "distance from lat X to hardcoded coast lat", we use a
// network of ~400 representative coastal reference points and find the
// Haversine distance to the nearest one.  This gives correct answers for
// inland cities like Legon (~12 km), Abuja (~750 km), Nairobi (~480 km).
// ---------------------------------------------------------------------------

interface CoastPoint {
  lat: number;
  lon: number;
}

/**
 * Representative coastal reference points – one every ~50–100 km along
 * the West African, East African, Southern African, Indian Ocean, Red Sea,
 * Mediterranean, Atlantic, and Pacific coastlines.
 *
 * Not exhaustive – precision within ±30 km is sufficient for scoring.
 */
const COAST_POINTS: CoastPoint[] = [
  // === WEST AFRICA – Atlantic/Gulf of Guinea ===
  { lat: 14.7, lon: -17.4 }, // Dakar, Senegal
  { lat: 13.5, lon: -16.7 }, // Banjul, Gambia
  { lat: 11.9, lon: -15.6 }, // Bissau, Guinea-Bissau
  { lat: 10.5, lon: -13.7 }, // Conakry, Guinea
  { lat: 8.5, lon: -13.2 }, // Freetown, Sierra Leone
  { lat: 6.3, lon: -10.8 }, // Monrovia, Liberia
  { lat: 5.3, lon: -4.0 }, // Abidjan, Côte d'Ivoire
  { lat: 5.6, lon: -0.2 }, // Accra, Ghana
  { lat: 5.1, lon: -1.2 }, // Cape Coast, Ghana
  { lat: 4.9, lon: -1.8 }, // Takoradi, Ghana
  { lat: 4.7, lon: -2.2 }, // Axim, Ghana
  { lat: 6.1, lon: 1.2 }, // Lomé, Togo
  { lat: 6.4, lon: 2.4 }, // Cotonou, Benin
  { lat: 6.5, lon: 3.4 }, // Lagos, Nigeria
  { lat: 5.8, lon: 4.9 }, // Warri, Nigeria
  { lat: 4.8, lon: 7.0 }, // Port Harcourt, Nigeria
  { lat: 4.4, lon: 7.2 }, // Bonny, Nigeria
  { lat: 4.3, lon: 8.3 }, // Calabar, Nigeria
  { lat: 3.9, lon: 9.7 }, // Douala, Cameroon
  { lat: 3.8, lon: 10.1 }, // Kribi, Cameroon
  { lat: 0.4, lon: 9.5 }, // Libreville, Gabon
  { lat: -4.8, lon: 11.9 }, // Pointe-Noire, Congo
  { lat: -4.3, lon: 15.3 }, // Kinshasa/mouth, DRC
  { lat: -8.8, lon: 13.2 }, // Luanda, Angola
  { lat: -17.9, lon: 11.8 }, // Namibe, Angola
  { lat: -22.9, lon: 14.5 }, // Walvis Bay, Namibia
  { lat: -33.9, lon: 18.4 }, // Cape Town, South Africa
  { lat: -33.0, lon: 27.9 }, // East London, South Africa
  { lat: -29.9, lon: 31.0 }, // Durban, South Africa
  { lat: -26.0, lon: 32.9 }, // Maputo, Mozambique
  { lat: -19.8, lon: 34.8 }, // Beira, Mozambique
  { lat: -15.0, lon: 40.7 }, // Mozambique Island
  { lat: -11.7, lon: 40.5 }, // Pemba, Mozambique
  { lat: -10.3, lon: 40.2 }, // Mtwara, Tanzania
  { lat: -6.2, lon: 39.2 }, // Dar es Salaam, Tanzania
  { lat: -4.0, lon: 39.7 }, // Mombasa coast
  { lat: -2.5, lon: 40.9 }, // Malindi
  { lat: 2.0, lon: 45.3 }, // Mogadishu
  { lat: 11.6, lon: 43.1 }, // Djibouti
  { lat: 15.6, lon: 39.5 }, // Massawa, Eritrea
  { lat: 15.6, lon: 32.5 }, // Khartoum-ish (Suakin)
  { lat: 21.5, lon: 39.2 }, // Jeddah, Saudi Arabia
  { lat: 22.9, lon: 37.5 }, // Red Sea mid
  { lat: 31.3, lon: 32.3 }, // Port Said, Egypt
  { lat: 30.1, lon: 31.4 }, // Alexandria, Egypt
  { lat: 33.9, lon: 10.1 }, // Sfax, Tunisia
  { lat: 36.8, lon: 10.2 }, // Tunis
  { lat: 36.7, lon: 3.1 }, // Algiers
  { lat: 33.6, lon: -7.6 }, // Casablanca, Morocco
  { lat: 30.4, lon: -9.6 }, // Agadir, Morocco
  { lat: 28.1, lon: -15.4 }, // Las Palmas (Canary Islands reference)
  { lat: 20.9, lon: -17.1 }, // Nouadhibou, Mauritania
  // === INDIAN OCEAN ISLANDS ===
  { lat: -18.9, lon: 47.5 }, // Antananarivo coast ref
  { lat: -12.4, lon: 49.3 }, // Antsiranana, Madagascar
  { lat: -20.2, lon: 57.5 }, // Mauritius
  { lat: -4.6, lon: 55.5 }, // Mahé, Seychelles
  // === EAST / CENTRAL AFRICA (inland reference – NOT coast) ===
  // These are intentionally far from coast so inland cities score near zero
  // === GLOBAL ANCHORS (major port cities) ===
  { lat: 1.3, lon: 103.8 }, // Singapore
  { lat: 22.3, lon: 114.2 }, // Hong Kong
  { lat: 31.2, lon: 121.5 }, // Shanghai
  { lat: 35.6, lon: 139.8 }, // Tokyo
  { lat: 51.5, lon: 0.1 }, // London (Thames mouth ref)
  { lat: 52.4, lon: 4.9 }, // Amsterdam
  { lat: 43.3, lon: 5.4 }, // Marseille
  { lat: 41.4, lon: 2.2 }, // Barcelona
  { lat: 38.7, lon: -9.1 }, // Lisbon
  { lat: 36.8, lon: -5.9 }, // Cadiz
  { lat: 40.6, lon: -74.1 }, // New York
  { lat: 25.8, lon: -80.2 }, // Miami
  { lat: 29.9, lon: -90.1 }, // New Orleans
  // === AMERICAS ===
  { lat: 19.2, lon: -96.1 }, // Veracruz, Mexico (Gulf coast)
  { lat: 19.1, lon: -104.3 }, // Manzanillo, Mexico (Pacific coast)
  { lat: 21.2, lon: -86.8 }, // Cancún, Mexico
  { lat: -34.6, lon: -58.4 }, // Buenos Aires
  { lat: -34.9, lon: -56.2 }, // Montevideo, Uruguay
  { lat: -23.5, lon: -46.6 }, // Santos, São Paulo coast
  { lat: -3.7, lon: -38.5 }, // Fortaleza, Brazil
  { lat: -8.1, lon: -34.9 }, // Recife, Brazil
  { lat: 5.8, lon: -55.2 }, // Paramaribo
  { lat: 6.8, lon: -58.2 }, // Georgetown, Guyana
  { lat: 10.5, lon: -61.4 }, // Port of Spain, Trinidad
  { lat: 17.1, lon: -61.8 }, // Antigua
  { lat: 18.5, lon: -66.1 }, // San Juan, Puerto Rico
  { lat: 18.0, lon: -76.8 }, // Kingston, Jamaica
  { lat: 23.1, lon: -82.4 }, // Havana
  { lat: 15.5, lon: -86.8 }, // Honduras coast
  { lat: 9.9, lon: -84.1 }, // Puntarenas, Costa Rica (Pacific)
  { lat: 9.0, lon: -79.5 }, // Panama City
  { lat: 10.4, lon: -75.5 }, // Cartagena, Colombia
  { lat: 3.9, lon: -77.1 }, // Buenaventura, Colombia (Pacific)
  { lat: -12.1, lon: -77.0 }, // Lima, Peru coast
  { lat: -33.0, lon: -71.6 }, // Valparaíso, Chile (coast)
  { lat: -36.8, lon: -73.1 }, // Concepcion, Chile
  { lat: -51.7, lon: -69.3 }, // Punta Arenas, Chile
  { lat: 37.8, lon: -122.4 }, // San Francisco
  { lat: 34.0, lon: -118.2 }, // Los Angeles
  { lat: 47.6, lon: -122.3 }, // Seattle
  { lat: 49.3, lon: -123.1 }, // Vancouver
  { lat: 61.2, lon: -149.9 }, // Anchorage, Alaska
  { lat: 58.3, lon: -134.4 }, // Juneau, Alaska
  // === PACIFIC ISLANDS ===
  { lat: 21.3, lon: -157.8 }, // Honolulu, Hawaii
  { lat: -17.5, lon: -149.6 }, // Papeete, French Polynesia
  { lat: -13.8, lon: -172.0 }, // Apia, Samoa
  { lat: -21.1, lon: -175.2 }, // Nuku'alofa, Tonga
  { lat: 2.0, lon: -157.5 }, // Christmas Island, Kiribati (East)
  { lat: -17.7, lon: 168.3 }, // Port Vila, Vanuatu
  { lat: -22.3, lon: 166.5 }, // Nouméa, New Caledonia
  { lat: -9.4, lon: 160.0 }, // Honiara, Solomon Islands
  { lat: -9.5, lon: 147.2 }, // Port Moresby, PNG
  { lat: 1.4, lon: 173.0 }, // Tarawa, Kiribati (West)
  { lat: 7.1, lon: 171.4 }, // Majuro, Marshall Islands
  { lat: 7.0, lon: 158.2 }, // Pohnpei, Micronesia
  { lat: 7.5, lon: 134.5 }, // Koror, Palau
  { lat: 13.5, lon: 144.8 }, // Agana, Guam
  // === EAST ASIA COAST ===
  { lat: 25.0, lon: 121.5 }, // Taipei, Taiwan
  { lat: 22.3, lon: 120.3 }, // Kaohsiung, Taiwan
  { lat: 14.6, lon: 120.9 }, // Manila, Philippines
  { lat: 35.1, lon: 129.0 }, // Busan, South Korea
  { lat: 37.5, lon: 126.6 }, // Incheon, South Korea
  { lat: 36.1, lon: 120.3 }, // Qingdao, China
  { lat: 43.1, lon: 131.9 }, // Vladivostok, Russia
  { lat: 50.0, lon: 142.8 }, // Yuzhno-Sakhalinsk, Russia
  { lat: 53.0, lon: 159.5 }, // Petropavlovsk-Kamchatsky, Russia
  { lat: 59.6, lon: 150.8 }, // Magadan, Russia
  // === AUSTRALIA / NEW ZEALAND ===
  { lat: -27.5, lon: 153.0 }, // Brisbane
  { lat: -33.9, lon: 151.2 }, // Sydney
  { lat: -37.8, lon: 145.0 }, // Melbourne
  { lat: -34.9, lon: 138.6 }, // Adelaide
  { lat: -42.9, lon: 147.3 }, // Hobart, Tasmania
  { lat: -31.9, lon: 115.9 }, // Perth
  { lat: -12.5, lon: 130.8 }, // Darwin
  { lat: -36.9, lon: 174.8 }, // Auckland, New Zealand
  { lat: -41.3, lon: 174.8 }, // Wellington, New Zealand
  { lat: -43.5, lon: 172.6 }, // Christchurch, New Zealand
  // === RUSSIA / ARCTIC ===
  { lat: 64.5, lon: 40.5 }, // Arkhangelsk, Russia
  { lat: 68.9, lon: 33.1 }, // Murmansk, Russia
  { lat: 64.0, lon: -22.0 }, // Reykjavik, Iceland
  // === NORTHERN EUROPE ===
  { lat: 59.9, lon: 10.7 }, // Oslo, Norway
  { lat: 60.2, lon: 24.9 }, // Helsinki, Finland
  { lat: 57.7, lon: 12.0 }, // Gothenburg, Sweden
  { lat: 55.7, lon: 21.1 }, // Klaipeda, Lithuania
  { lat: 55.0, lon: 8.5 }, // Esbjerg, Denmark
  // === GULF / ARABIAN PENINSULA ===
  { lat: 26.2, lon: 50.6 }, // Manama, Bahrain
  { lat: 25.3, lon: 55.3 }, // Dubai, UAE
  { lat: 24.5, lon: 54.4 }, // Abu Dhabi, UAE
  { lat: 23.6, lon: 58.6 }, // Muscat, Oman
  { lat: 22.9, lon: 59.5 }, // Salalah, Oman (Arabian Sea)
  { lat: 12.8, lon: 45.0 }, // Aden, Yemen
];

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Distance in km from (lat, lon) to the nearest coastal reference point.
 * Returns a value between 0 and ~2000 km.
 */
export function distToCoastKm(lat: number, lon: number): number {
  let min = Infinity;
  for (const p of COAST_POINTS) {
    const d = haversineKm(lat, lon, p.lat, p.lon);
    if (d < min) min = d;
  }
  return min;
}

/**
 * Coastal exposure factor [0–1]
 *
 * 0–2 km   = 1.0 (shorefront)
 * 2–10 km  = linear decay to 0.5
 * 10–30 km = linear decay to 0.1
 * > 30 km  = 0.0 (no coastal hazard)
 *
 * Elevation modifier: each 10m ASL halves the factor (flood drainage).
 */
export function coastalFactor(
  lat: number,
  lon: number,
  elevationM = 0,
): number {
  const d = distToCoastKm(lat, lon);
  let f: number;
  if (d <= 2) f = 1.0;
  else if (d <= 10) f = 1.0 - ((d - 2) / 8) * 0.5;
  else if (d <= 30) f = 0.5 - ((d - 10) / 20) * 0.5;
  else f = 0;

  // Elevation correction — higher ground drains away coastal inundation.
  // Cap at 50m (above which even shorefront assets are protected).
  const elevCap = Math.min(elevationM, 50);
  const elevMod = Math.max(0, 1 - elevCap / 50);
  return f * elevMod;
}

/**
 * Flood intensity modifier based on elevation alone [0–1]
 * Used for River Flooding and Flash Flooding risk.
 * 0–5m ASL: full exposure; 5–30m: linear decay; >30m: minimal.
 */
export function elevationFloodFactor(elevationM = 0): number {
  if (elevationM <= 5) return 1.0;
  if (elevationM <= 30) return 1.0 - ((elevationM - 5) / 25) * 0.7;
  if (elevationM <= 100) return 0.3 - ((elevationM - 30) / 70) * 0.25;
  return 0.05;
}

// ---------------------------------------------------------------------------
// Regional climate profiles (for global fallback)
// Each entry covers a lat/lon bounding box.
// Hazard values are [intensityBase, frequencyBase] on 0–1 scale.
// ---------------------------------------------------------------------------

type ScorePair = [number, number];

interface RegionProfile {
  bbox: [number, number, number, number]; // [latMin, latMax, lonMin, lonMax]
  hazards: Partial<Record<string, ScorePair>>;
  /** Optional: fine-tune the coastal hazards (will be overridden by coastalFactor) */
  coastalCapH?: number; // max coastal hazard intensity [0–1]
}

const REGION_PROFILES: RegionProfile[] = [
  // ---- WEST AFRICA sub-Saharan (non-coastal interior) ----
  {
    bbox: [8.0, 15.0, -18.0, 5.0],
    hazards: {
      "Extreme Heat": [0.62, 0.55],
      Drought: [0.55, 0.48],
      "Sandstorms / Harmattan": [0.52, 0.45],
      "Water Scarcity": [0.5, 0.42],
      "Wildfire / Bushfire": [0.38, 0.3],
      "Flash Flooding": [0.22, 0.18],
    },
  },
  // ---- WEST AFRICA humid tropics (Guinea Coast interior) ----
  {
    bbox: [4.0, 8.0, -18.0, 5.0],
    hazards: {
      "Heavy Rainfall": [0.62, 0.58],
      "Flash Flooding": [0.52, 0.45],
      "Thunderstorms & Lightning": [0.55, 0.5],
      "River Flooding": [0.38, 0.3],
      "Extreme Heat": [0.28, 0.22],
    },
    coastalCapH: 0.85,
  },
  // ---- SAHEL BELT ----
  {
    bbox: [12.0, 20.0, -18.0, 25.0],
    hazards: {
      "Extreme Heat": [0.72, 0.68],
      Drought: [0.7, 0.62],
      Desertification: [0.55, 0.48],
      "Sandstorms / Harmattan": [0.65, 0.58],
      "Water Scarcity": [0.65, 0.55],
      "Wildfire / Bushfire": [0.28, 0.22],
      "Flash Flooding": [0.15, 0.12],
    },
  },
  // ---- NORTH AFRICA ----
  {
    bbox: [20.0, 38.0, -5.0, 40.0],
    hazards: {
      "Extreme Heat": [0.72, 0.65],
      Drought: [0.7, 0.62],
      Desertification: [0.65, 0.55],
      "Water Scarcity": [0.62, 0.55],
      "Sandstorms / Harmattan": [0.55, 0.48],
      "Flash Flooding": [0.12, 0.08],
    },
    coastalCapH: 0.7,
  },
  // ---- EAST AFRICA (Ethiopia, Kenya, Tanzania) ----
  {
    bbox: [-5.0, 15.0, 30.0, 45.0],
    hazards: {
      "Heavy Rainfall": [0.48, 0.42],
      "Flash Flooding": [0.38, 0.32],
      "Thunderstorms & Lightning": [0.45, 0.4],
      Drought: [0.45, 0.38],
      "Extreme Heat": [0.42, 0.35],
      "Water Scarcity": [0.4, 0.32],
      Earthquakes: [0.42, 0.28], // Rift Valley
      "River Flooding": [0.32, 0.28],
    },
    coastalCapH: 0.75,
  },
  // ---- CENTRAL AFRICA ----
  {
    bbox: [-5.0, 6.0, 10.0, 32.0],
    hazards: {
      "Heavy Rainfall": [0.65, 0.6],
      "Flash Flooding": [0.52, 0.48],
      "Thunderstorms & Lightning": [0.62, 0.58],
      "River Flooding": [0.45, 0.38],
    },
    coastalCapH: 0.8,
  },
  // ---- SOUTHERN AFRICA (Zimbabwe, Zambia, Mozambique interior) ----
  {
    bbox: [-25.0, -5.0, 20.0, 40.0],
    hazards: {
      "Heavy Rainfall": [0.42, 0.35],
      "Flash Flooding": [0.35, 0.28],
      Drought: [0.45, 0.38],
      "Extreme Heat": [0.38, 0.3],
      "Thunderstorms & Lightning": [0.4, 0.35],
      "Wildfire / Bushfire": [0.38, 0.32],
      "Tropical Cyclones": [0.28, 0.22],
    },
    coastalCapH: 0.8,
  },
  // ---- SOUTH AFRICA (Cape) ----
  {
    bbox: [-35.0, -25.0, 15.0, 35.0],
    hazards: {
      "Heavy Rainfall": [0.35, 0.28],
      "Flash Flooding": [0.28, 0.22],
      Drought: [0.42, 0.35],
      "Extreme Heat": [0.35, 0.28],
      "Wildfire / Bushfire": [0.45, 0.38],
    },
    coastalCapH: 0.72,
  },
  // ---- SOUTHEAST ASIA ----
  {
    bbox: [-10.0, 25.0, 95.0, 145.0],
    hazards: {
      "Heavy Rainfall": [0.72, 0.68],
      "Flash Flooding": [0.62, 0.55],
      "River Flooding": [0.55, 0.48],
      "Tropical Cyclones": [0.58, 0.48],
      "Thunderstorms & Lightning": [0.65, 0.62],
      Landslides: [0.45, 0.38],
      "Extreme Heat": [0.42, 0.35],
    },
    coastalCapH: 0.92,
  },
  // ---- SOUTH ASIA ----
  {
    bbox: [5.0, 35.0, 60.0, 95.0],
    hazards: {
      "Heavy Rainfall": [0.65, 0.6],
      "Flash Flooding": [0.55, 0.48],
      "River Flooding": [0.52, 0.45],
      "Tropical Cyclones": [0.48, 0.38],
      "Extreme Heat": [0.58, 0.52],
      Drought: [0.42, 0.35],
      Landslides: [0.38, 0.3],
      Earthquakes: [0.38, 0.22],
    },
    coastalCapH: 0.88,
  },
  // ---- MIDDLE EAST / ARABIAN PENINSULA ----
  {
    bbox: [10.0, 40.0, 35.0, 65.0],
    hazards: {
      "Extreme Heat": [0.8, 0.75],
      Drought: [0.72, 0.65],
      "Water Scarcity": [0.7, 0.62],
      "Sandstorms / Harmattan": [0.6, 0.55],
      "Flash Flooding": [0.18, 0.12],
      Earthquakes: [0.28, 0.18],
    },
    coastalCapH: 0.7,
  },
  // ---- EUROPE (temperate) ----
  {
    bbox: [35.0, 72.0, -25.0, 45.0],
    hazards: {
      "Heavy Rainfall": [0.42, 0.38],
      "River Flooding": [0.35, 0.3],
      "Flash Flooding": [0.3, 0.25],
      "Thunderstorms & Lightning": [0.3, 0.28],
      Drought: [0.28, 0.22],
      "Extreme Heat": [0.28, 0.22],
      "Wildfire / Bushfire": [0.25, 0.18],
      Earthquakes: [0.15, 0.08],
    },
    coastalCapH: 0.65,
  },
  // ---- NORTH AMERICA (continental) ----
  {
    bbox: [25.0, 70.0, -125.0, -55.0],
    hazards: {
      "Heavy Rainfall": [0.4, 0.35],
      "River Flooding": [0.38, 0.32],
      "Flash Flooding": [0.35, 0.28],
      "Thunderstorms & Lightning": [0.42, 0.38],
      "Extreme Heat": [0.35, 0.28],
      Drought: [0.3, 0.25],
    },
    coastalCapH: 0.8,
  },
  // ---- CARIBBEAN ----
  {
    bbox: [8.0, 25.0, -90.0, -55.0],
    hazards: {
      "Tropical Cyclones": [0.72, 0.58],
      "Heavy Rainfall": [0.62, 0.55],
      "Flash Flooding": [0.52, 0.45],
      "Storm Surge": [0.65, 0.52],
      "Coastal Flooding": [0.65, 0.55],
      "Sea Level Rise": [0.58, 0.48],
      "Extreme Heat": [0.45, 0.38],
      Earthquakes: [0.28, 0.15],
    },
    coastalCapH: 0.92,
  },
  // ---- LATIN AMERICA (tropical) ----
  {
    bbox: [-5.0, 15.0, -90.0, -35.0],
    hazards: {
      "Heavy Rainfall": [0.65, 0.6],
      "Flash Flooding": [0.55, 0.48],
      "River Flooding": [0.5, 0.42],
      "Tropical Cyclones": [0.38, 0.28],
      Landslides: [0.42, 0.35],
      Earthquakes: [0.3, 0.18],
    },
    coastalCapH: 0.85,
  },
  // ---- WEST PACIFIC ISLANDS (bbox does NOT cross antimeridian) ----
  {
    bbox: [-25.0, 25.0, 130.0, 180.0],
    hazards: {
      "Tropical Cyclones": [0.7, 0.58],
      "Heavy Rainfall": [0.65, 0.6],
      "Flash Flooding": [0.52, 0.45],
      "Thunderstorms & Lightning": [0.55, 0.52],
      Earthquakes: [0.48, 0.3],
      "Volcanic Eruptions": [0.38, 0.18],
      Landslides: [0.35, 0.28],
    },
    coastalCapH: 1.0,
  },
  // ---- EAST PACIFIC ISLANDS (Hawaii, Polynesia, Eastern Kiribati) ----
  {
    bbox: [-25.0, 25.0, -180.0, -115.0],
    hazards: {
      "Tropical Cyclones": [0.62, 0.48],
      "Heavy Rainfall": [0.58, 0.52],
      "Flash Flooding": [0.45, 0.38],
      "Thunderstorms & Lightning": [0.45, 0.42],
      Earthquakes: [0.38, 0.22],
      "Volcanic Eruptions": [0.28, 0.12],
    },
    coastalCapH: 1.0,
  },
  // ---- EAST ASIA (China, Japan, South Korea, Taiwan) ----
  {
    bbox: [25.0, 55.0, 100.0, 150.0],
    hazards: {
      "Heavy Rainfall": [0.62, 0.58],
      "Flash Flooding": [0.52, 0.45],
      "River Flooding": [0.5, 0.42],
      "Tropical Cyclones": [0.52, 0.42],
      "Thunderstorms & Lightning": [0.45, 0.4],
      Landslides: [0.4, 0.32],
      Earthquakes: [0.48, 0.3],
      "Volcanic Eruptions": [0.32, 0.18],
      "Extreme Heat": [0.38, 0.32],
      Drought: [0.28, 0.22],
      "Wildfire / Bushfire": [0.22, 0.18],
    },
    coastalCapH: 0.85,
  },
  // ---- CENTRAL ASIA (Kazakhstan, Uzbekistan, Kyrgyzstan, Tajikistan, Turkmenistan) ----
  {
    bbox: [35.0, 56.0, 45.0, 90.0],
    hazards: {
      "Extreme Heat": [0.62, 0.55],
      Drought: [0.6, 0.52],
      "Water Scarcity": [0.65, 0.58],
      Desertification: [0.52, 0.45],
      "Sandstorms / Harmattan": [0.45, 0.4],
      Earthquakes: [0.45, 0.28],
      Landslides: [0.35, 0.28],
      "Flash Flooding": [0.25, 0.2],
    },
  },
  // ---- RUSSIA / NORTHERN ASIA / SIBERIA ----
  {
    bbox: [50.0, 83.0, 20.0, 180.0],
    hazards: {
      "River Flooding": [0.45, 0.38],
      "Heavy Rainfall": [0.3, 0.25],
      "Flash Flooding": [0.28, 0.22],
      "Wildfire / Bushfire": [0.48, 0.4],
      Earthquakes: [0.32, 0.18],
      "Volcanic Eruptions": [0.28, 0.15],
      "Glacial Retreat": [0.45, 0.4],
      Drought: [0.2, 0.15],
    },
  },
  // ---- AUSTRALIA ----
  {
    bbox: [-45.0, -10.0, 110.0, 156.0],
    hazards: {
      Drought: [0.68, 0.62],
      "Wildfire / Bushfire": [0.72, 0.65],
      "Extreme Heat": [0.65, 0.58],
      "Flash Flooding": [0.42, 0.35],
      "River Flooding": [0.38, 0.3],
      "Heavy Rainfall": [0.38, 0.32],
      "Tropical Cyclones": [0.38, 0.28],
      "Thunderstorms & Lightning": [0.42, 0.38],
      "Water Scarcity": [0.55, 0.48],
      Desertification: [0.4, 0.32],
    },
    coastalCapH: 0.8,
  },
  // ---- NEW ZEALAND ----
  {
    bbox: [-47.0, -34.0, 163.0, 180.0],
    hazards: {
      Earthquakes: [0.7, 0.55],
      "Volcanic Eruptions": [0.45, 0.28],
      Landslides: [0.52, 0.45],
      "Heavy Rainfall": [0.55, 0.5],
      "River Flooding": [0.45, 0.38],
      "Flash Flooding": [0.42, 0.35],
      "Thunderstorms & Lightning": [0.3, 0.28],
      "Wildfire / Bushfire": [0.25, 0.2],
    },
    coastalCapH: 0.75,
  },
  // ---- TEMPERATE SOUTH AMERICA (Peru, Chile, Argentina, Uruguay, Paraguay, S. Brazil) ----
  {
    bbox: [-56.0, -5.0, -82.0, -33.0],
    hazards: {
      Earthquakes: [0.55, 0.38],
      "Volcanic Eruptions": [0.4, 0.22],
      Landslides: [0.45, 0.38],
      "River Flooding": [0.42, 0.35],
      "Flash Flooding": [0.38, 0.3],
      "Heavy Rainfall": [0.45, 0.4],
      Drought: [0.38, 0.3],
      "Wildfire / Bushfire": [0.38, 0.3],
      "Extreme Heat": [0.25, 0.2],
      "Thunderstorms & Lightning": [0.35, 0.3],
    },
    coastalCapH: 0.8,
  },
  // ---- HORN OF AFRICA / SOMALI COAST / ARABIAN SEA ----
  {
    bbox: [2.0, 15.0, 40.0, 52.0],
    hazards: {
      Drought: [0.72, 0.65],
      "Extreme Heat": [0.68, 0.6],
      "Water Scarcity": [0.65, 0.58],
      "Flash Flooding": [0.3, 0.25],
      "Sandstorms / Harmattan": [0.45, 0.4],
      "Heavy Rainfall": [0.22, 0.18],
    },
    coastalCapH: 0.75,
  },
  // ---- GLOBAL CATCH-ALL (any location not matched by a specific profile above) ----
  {
    bbox: [-90.0, 90.0, -180.0, 180.0],
    hazards: {
      "Heavy Rainfall": [0.25, 0.2],
      "Flash Flooding": [0.2, 0.15],
      "River Flooding": [0.2, 0.15],
      "Extreme Heat": [0.2, 0.15],
      "Thunderstorms & Lightning": [0.2, 0.18],
      Drought: [0.18, 0.15],
      "Wildfire / Bushfire": [0.15, 0.12],
    },
  },
];

function getRegionProfile(lat: number, lon: number): RegionProfile | null {
  for (const profile of REGION_PROFILES) {
    const [latMin, latMax, lonMin, lonMax] = profile.bbox;
    if (lat >= latMin && lat <= latMax && lon >= lonMin && lon <= lonMax)
      return profile;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get globally-calibrated base hazard scores for any location.
 *
 * The coastal hazards (Coastal Flooding, Storm Surge, Sea Level Rise,
 * Coastal & Riverbank Erosion) are overridden by the precision
 * distance-to-coast model so they are NEVER inflated for inland cities.
 *
 * Returns null if no regional profile covers the location — the caller
 * should then fall back to the legacy geoFactors model.
 */
export function getGlobalBaseScores(
  lat: number,
  lon: number,
  risk: string,
  context: Partial<LocationContext> = {},
): [number, number] | null {
  const elevationM = context.elevationM ?? 0;
  const cf = coastalFactor(lat, lon, elevationM);
  const eff = elevationFloodFactor(elevationM);

  // Coastal hazards are computed from pure distance model regardless of region
  const coastalRisks = new Set([
    "Coastal Flooding",
    "Storm Surge",
    "Sea Level Rise",
    "Coastal & Riverbank Erosion",
    "Groundwater Flooding",
    "Tsunamis",
  ]);

  if (coastalRisks.has(risk)) {
    // Full inland suppression — Legon at 12km+20m gets cf≈0
    const base = risk === "Tsunamis" ? cf * 0.25 : cf * 0.8;
    const freq = risk === "Tsunamis" ? cf * 0.18 : cf * 0.65;
    return [Math.max(0.02, base), Math.max(0.02, freq)];
  }

  // Flood hazards modulated by elevation
  if (risk === "River Flooding" || risk === "Flash Flooding") {
    const regional = getRegionProfile(lat, lon);
    const pair = regional?.hazards[risk];
    const [baseI, baseF] = pair ?? [0.25, 0.2];
    return [baseI * eff, baseF * eff];
  }

  const regional = getRegionProfile(lat, lon);
  if (!regional) return null;

  const pair = regional.hazards[risk];
  if (pair) return pair;

  // Risk not present in this region = very low
  return [0.03, 0.02];
}

/**
 * Get hazard suggestions (H/M rated) for any global location.
 */
export function getGlobalHazardSuggestions(
  lat: number,
  lon: number,
  context: Partial<LocationContext> = {},
): string[] {
  const elevationM = context.elevationM ?? 0;
  const cf = coastalFactor(lat, lon, elevationM);
  const regional = getRegionProfile(lat, lon);

  const suggestions: string[] = [];

  // Coastal suggestions only if genuinely coastal
  if (cf >= 0.4) {
    suggestions.push(
      "Coastal Flooding",
      "Storm Surge",
      "Sea Level Rise",
      "Coastal & Riverbank Erosion",
    );
  }

  // Regional suggestions
  if (regional) {
    for (const [risk, pair] of Object.entries(regional.hazards)) {
      const intensity = pair?.[0] ?? 0;
      if (intensity >= 0.45 && !suggestions.includes(risk)) {
        suggestions.push(risk);
      }
    }
  }

  return suggestions;
}

/**
 * Diagnostic: explains why a location received a specific coastal rating.
 * Useful for showing in the UI why Legon ≠ coastal.
 */
export function diagnoseCoastalScore(
  lat: number,
  lon: number,
  elevationM = 0,
): {
  distToCoastKm: number;
  coastalFactor: number;
  elevationM: number;
  classification: "Shorefront" | "Near-Coastal" | "Coastal-Adjacent" | "Inland";
} {
  const d = distToCoastKm(lat, lon);
  const cf = coastalFactor(lat, lon, elevationM);
  let classification:
    | "Shorefront"
    | "Near-Coastal"
    | "Coastal-Adjacent"
    | "Inland";
  if (d <= 2) classification = "Shorefront";
  else if (d <= 10) classification = "Near-Coastal";
  else if (d <= 30) classification = "Coastal-Adjacent";
  else classification = "Inland";
  return { distToCoastKm: d, coastalFactor: cf, elevationM, classification };
}
