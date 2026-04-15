import type { MatrixConfig, HazardRating } from "../domain/physicalRisk/types";
import { buildMatrixConfig, getRating } from "../domain/physicalRisk/constants";
import { assessHazard as geoMathFallback } from "../domain/physicalRisk/engine";
import { ALL_21_RISKS } from "../domain/physicalRisk/constants";
import {
  coastalFactor,
  distToCoastKm,
} from "../domain/physicalRisk/globalHazards";
export interface HazardInput {
  asset: string;
  assetType: string;
  risk: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface HazardOutput {
  asset: string;
  risk: string;
  intensityScore: number;
  frequencyScore: number;
  intensityLabel: string;
  frequencyLabel: string;
  hazardRating: HazardRating;
  dataSource: string;
}

interface RawScores {
  rawI: number; // 1-3
  rawF: number; // 1-3
  source: string;
}
function scaleScore(raw: number, rawMax: number, targetMax: number): number {
  if (rawMax === targetMax) return raw;
  const scaled = Math.round((raw / rawMax) * targetMax);
  return Math.max(1, Math.min(targetMax, scaled));
}
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
async function fetchWithTimeout(
  url: string,
  timeoutMs = 15000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  } finally {
    clearTimeout(timer);
  }
}
const apiCache = new Map<string, unknown>();

function cacheKey(prefix: string, lat: number, lon: number): string {
  return `${prefix}:${lat.toFixed(2)},${lon.toFixed(2)}`;
}
interface NasaDailyData {
  T2M_MAX: Record<string, number>;
  RH2M: Record<string, number>;
  PRECTOTCORR: Record<string, number>;
}

async function fetchNasaDaily(
  lat: number,
  lon: number,
): Promise<NasaDailyData | null> {
  const key = cacheKey("nasa_d", lat, lon);
  if (apiCache.has(key)) return apiCache.get(key) as NasaDailyData;

  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 5);
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

  const url =
    `https://power.larc.nasa.gov/api/temporal/daily/point?` +
    `parameters=T2M_MAX,RH2M,PRECTOTCORR&community=RE&` +
    `longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&` +
    `start=${fmt(start)}&end=${fmt(end)}&format=JSON`;

  try {
    const res = await fetchWithTimeout(url, 20000);
    const json = await res.json();
    const params = json?.properties?.parameter;
    if (!params) return null;
    const data: NasaDailyData = {
      T2M_MAX: params.T2M_MAX ?? {},
      RH2M: params.RH2M ?? {},
      PRECTOTCORR: params.PRECTOTCORR ?? {},
    };
    apiCache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

interface NasaMonthlyData {
  PRECTOTCORR: Record<string, number>;
  T2M_MAX: Record<string, number>;
}

async function fetchNasaMonthly(
  lat: number,
  lon: number,
): Promise<NasaMonthlyData | null> {
  const key = cacheKey("nasa_m", lat, lon);
  if (apiCache.has(key)) return apiCache.get(key) as NasaMonthlyData;

  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

  const url =
    `https://power.larc.nasa.gov/api/temporal/monthly/point?` +
    `parameters=PRECTOTCORR,T2M_MAX&community=RE&` +
    `longitude=${lon.toFixed(4)}&latitude=${lat.toFixed(4)}&` +
    `start=${fmt(start)}&end=${fmt(end)}&format=JSON`;

  try {
    const res = await fetchWithTimeout(url, 20000);
    const json = await res.json();
    const params = json?.properties?.parameter;
    if (!params) return null;
    const data: NasaMonthlyData = {
      PRECTOTCORR: params.PRECTOTCORR ?? {},
      T2M_MAX: params.T2M_MAX ?? {},
    };
    apiCache.set(key, data);
    return data;
  } catch {
    return null;
  }
}

async function fetchElevation(
  lat: number,
  lon: number,
): Promise<number | null> {
  const key = cacheKey("elev", lat, lon);
  if (apiCache.has(key)) return apiCache.get(key) as number;

  for (const baseUrl of [
    `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`,
    `https://api.opentopodata.org/v1/srtm90m?locations=${lat},${lon}`,
  ]) {
    try {
      const res = await fetchWithTimeout(baseUrl, 10000);
      const json = await res.json();
      const elev = json?.results?.[0]?.elevation;
      if (typeof elev === "number") {
        apiCache.set(key, elev);
        return elev;
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchOpenMeteoArchive(
  lat: number,
  lon: number,
  params: string,
): Promise<Record<string, unknown> | null> {
  const key = cacheKey("ometeo_" + params, lat, lon);
  if (apiCache.has(key)) return apiCache.get(key) as Record<string, unknown>;

  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 5);
  const fmtD = (d: Date) => d.toISOString().slice(0, 10);

  const url =
    `https://archive-api.open-meteo.com/v1/archive?` +
    `latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&` +
    `start_date=${fmtD(start)}&end_date=${fmtD(end)}&` +
    `daily=${params}&timezone=auto`;

  try {
    const res = await fetchWithTimeout(url, 15000);
    const json = await res.json();
    apiCache.set(key, json);
    return json;
  } catch {
    return null;
  }
}

async function fetchUsgsEarthquakes(
  lat: number,
  lon: number,
  radiusKm = 100,
  minMag = 4.0,
  years = 30,
): Promise<{ count: number; maxMag: number } | null> {
  const key = cacheKey("usgs", lat, lon);
  if (apiCache.has(key))
    return apiCache.get(key) as { count: number; maxMag: number };

  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - years);

  const url =
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
    `&latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}` +
    `&maxradiuskm=${radiusKm}&minmagnitude=${minMag}` +
    `&starttime=${start.toISOString().slice(0, 10)}` +
    `&endtime=${end.toISOString().slice(0, 10)}`;

  try {
    const res = await fetchWithTimeout(url, 15000);
    const json = await res.json();
    const features = json?.features ?? [];
    let maxMag = 0;
    for (const f of features) {
      const m = f?.properties?.mag ?? 0;
      if (m > maxMag) maxMag = m;
    }
    const result = { count: features.length, maxMag };
    apiCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

async function fetchNoaaTsunamis(
  lat: number,
  lon: number,
  radiusKm = 500,
): Promise<{ count: number; maxRunup: number } | null> {
  const key = cacheKey("tsun", lat, lon);
  if (apiCache.has(key))
    return apiCache.get(key) as { count: number; maxRunup: number };

  const minLat = lat - radiusKm / 111;
  const maxLat = lat + radiusKm / 111;
  const minLon = lon - radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  const maxLon = lon + radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  const url =
    `https://www.ngdc.noaa.gov/hazel/hazard-service/api/v1/tsunamis/events?` +
    `minLatitude=${minLat.toFixed(2)}&maxLatitude=${maxLat.toFixed(2)}` +
    `&minLongitude=${minLon.toFixed(2)}&maxLongitude=${maxLon.toFixed(2)}`;

  try {
    const res = await fetchWithTimeout(url, 15000);
    const json = await res.json();
    const items = json?.items ?? json ?? [];
    const events = Array.isArray(items) ? items : [];
    let maxRunup = 0;
    for (const e of events) {
      const r = e?.maxWaterHeight ?? e?.maximumWaterHeight ?? 0;
      if (r > maxRunup) maxRunup = r;
    }
    const result = { count: events.length, maxRunup };
    apiCache.set(key, result);
    return result;
  } catch {
    return null;
  }
}

async function fetchWriAqueduct(
  lat: number,
  lon: number,
  indicator: string,
): Promise<number | null> {
  const key = cacheKey("wri_" + indicator, lat, lon);
  if (apiCache.has(key)) return apiCache.get(key) as number;

  const url =
    `https://api.resourcewatch.org/v1/query?sql=` +
    encodeURIComponent(
      `SELECT ${indicator} FROM aqueduct_projections_20150309 ` +
        `WHERE ST_Intersects(the_geom, ST_SetSRID(ST_Point(${lon},${lat}),4326)) LIMIT 1`,
    );

  try {
    const res = await fetchWithTimeout(url, 12000);
    const json = await res.json();
    const rows = json?.data ?? [];
    if (rows.length > 0 && typeof rows[0]?.[indicator] === "number") {
      const val = rows[0][indicator];
      apiCache.set(key, val);
      return val;
    }
  } catch {
    /* no-op */
  }
  return null;
}
const AFRICAN_GLACIERS: [string, number, number][] = [
  ["Mt Kilimanjaro", -3.076, 37.353],
  ["Mt Kenya", -0.152, 37.308],
  ["Rwenzori Mountains", 0.385, 29.891],
  ["Simien Mountains", 13.25, 38.35],
  // Alps
  ["Mont Blanc", 45.83, 6.86],
  ["Jungfrau", 46.54, 7.96],
  ["Aletsch Glacier", 46.43, 8.11],
  // Himalayas
  ["Gangotri Glacier", 30.93, 79.07],
  ["Siachen Glacier", 35.42, 77.11],
  ["Khumbu Glacier", 27.96, 86.83],
  ["Baltoro Glacier", 35.6, 76.5],
  // Andes
  ["Quelccaya Ice Cap", -13.93, -70.83],
  ["Huascaran", -9.12, -77.6],
  ["Patagonian Ice Field", -49.0, -73.5],
  // North America
  ["Columbia Icefield", 52.15, -117.33],
  ["Glacier NP Montana", 48.75, -113.8],
  // Iceland
  ["Vatnajokull", 64.4, -16.8],
  ["Langjokull", 64.7, -20.1],
  // Scandinavia
  ["Jostedalsbreen", 61.7, 7.1],
  // Russia / Caucasus
  ["Elbrus", 43.35, 42.43],
  ["Fedchenko Glacier", 38.8, 72.2],
  // New Zealand
  ["Fox Glacier", -43.46, 170.18],
  ["Franz Josef Glacier", -43.39, 170.19],
];

const AFRICAN_VOLCANOES: [string, number, number][] = [
  ["Mt Cameroon", 4.203, 9.17],
  ["Nyiragongo", -1.52, 29.25],
  ["Nyamulagira", -1.408, 29.2],
  ["Ol Doinyo Lengai", -2.764, 35.914],
  ["Mt Meru", -3.25, 36.75],
  ["Erta Ale", 13.6, 40.67],
  ["Karthala", -11.75, 43.35],
  ["Piton de la Fournaise", -21.244, 55.708],
  // Ring of Fire – Japan
  ["Mt Fuji", 35.36, 138.73],
  ["Sakurajima", 31.58, 130.66],
  ["Asama", 36.4, 138.52],
  // Ring of Fire – Indonesia
  ["Krakatau", -6.1, 105.42],
  ["Merapi", -7.54, 110.44],
  ["Sinabung", 3.17, 98.39],
  ["Tambora", -8.25, 117.99],
  // Ring of Fire – Philippines
  ["Mayon", 13.25, 123.69],
  ["Taal", 14.0, 120.99],
  ["Pinatubo", 15.13, 120.35],
  // Ring of Fire – Pacific NW / Alaska
  ["Mt St Helens", 46.2, -122.18],
  ["Mt Rainier", 46.85, -121.73],
  ["Redoubt", 60.49, -152.74],
  // Ring of Fire – Central America
  ["Popocatepetl", 19.02, -98.62],
  ["Santa Ana", 13.85, -89.63],
  // Caribbean
  ["Soufriere Hills", 16.72, -62.18],
  ["La Soufrière SVG", 13.33, -61.18],
  // South America
  ["Cotopaxi", -0.68, -78.44],
  ["Villarrica", -39.42, -71.94],
  ["Hudson", -45.9, -72.97],
  // Mediterranean
  ["Etna", 37.75, 14.99],
  ["Stromboli", 38.79, 15.21],
  ["Vesuvius", 40.82, 14.43],
  // Iceland
  ["Hekla", 63.99, -19.7],
  ["Grimsvotn", 64.42, -17.33],
  ["Eyjafjallajokull", 63.63, -19.62],
  // Pacific Islands
  ["Mauna Loa Hawaii", 19.48, -155.6],
  ["Kilauea Hawaii", 19.41, -155.29],
  ["Tanna Vanuatu", -19.53, 169.44],
];

const IPCC_AR6_SLR_MM: Record<string, { rcp45: number; rcp85: number }> = {
  "West Africa": { rcp45: 350, rcp85: 700 },
  "East Africa": { rcp45: 300, rcp85: 650 },
  "Southern Africa": { rcp45: 320, rcp85: 680 },
  "North Africa": { rcp45: 330, rcp85: 690 },
  "Indian Ocean Islands": { rcp45: 340, rcp85: 710 },
  default: { rcp45: 300, rcp85: 650 },
};

function getAfricanSubregion(lat: number, lon: number): string {
  if (lat > 20) return "North Africa";
  if (lon < 20 && lat < 20 && lat > -5) return "West Africa";
  if (lon >= 20 && lon < 45 && lat >= -15) return "East Africa";
  if (lat < -15) return "Southern Africa";
  if (lon >= 45) return "Indian Ocean Islands";
  return "default";
}
async function assessExtremeHeat(lat: number, lon: number): Promise<RawScores> {
  const data = await fetchNasaDaily(lat, lon);
  if (!data) return { rawI: 2, rawF: 2, source: "Fallback" };

  const temps = Object.values(data.T2M_MAX).filter(
    (v) => v !== -999 && v != null,
  );
  const humids = Object.values(data.RH2M).filter(
    (v) => v !== -999 && v != null,
  );
  if (temps.length === 0)
    return { rawI: 2, rawF: 2, source: "NASA POWER (no data)" };

  const maxTemp = Math.max(...temps);
  const avgHumid =
    humids.length > 0 ? humids.reduce((a, b) => a + b, 0) / humids.length : 50;

  let heatIndex = maxTemp;
  if (maxTemp >= 27) {
    const T = maxTemp;
    const R = avgHumid;
    heatIndex =
      -8.784 +
      1.611 * T +
      2.338 * R +
      -0.146 * T * R +
      -0.01231 * T ** 2 +
      -0.01642 * R ** 2 +
      0.002211 * T ** 2 * R +
      0.0007254 * T * R ** 2 +
      -0.000003582 * T ** 2 * R ** 2;
  }

  const rawI = heatIndex >= 42 ? 3 : heatIndex >= 37 ? 2 : 1;
  const hotDays = temps.filter((v) => v > 35).length;
  const pct = (hotDays / temps.length) * 100;
  const rawF = pct >= 30 ? 3 : pct >= 10 ? 2 : 1;

  return { rawI, rawF, source: "NASA POWER" };
}

async function assessDrought(lat: number, lon: number): Promise<RawScores> {
  const monthly = await fetchNasaMonthly(lat, lon);
  if (!monthly) return { rawI: 2, rawF: 2, source: "Fallback" };

  const precip = Object.values(monthly.PRECTOTCORR).filter(
    (v) => v !== -999 && v != null,
  );
  if (precip.length < 24)
    return { rawI: 2, rawF: 2, source: "NASA POWER (insufficient)" };

  const mean = precip.reduce((a, b) => a + b, 0) / precip.length;
  const std = Math.sqrt(
    precip.reduce((s, v) => s + (v - mean) ** 2, 0) / precip.length,
  );
  const recentPrecip = precip.slice(-12);
  const recentMean =
    recentPrecip.reduce((a, b) => a + b, 0) / recentPrecip.length;
  const spi = std > 0 ? (recentMean - mean) / std : 0;

  const rawI = spi <= -1.5 ? 3 : spi <= -1.0 ? 2 : 1;
  const dryMonths = recentPrecip.filter((v) => v < mean * 0.5).length;
  const rawF = dryMonths >= 6 ? 3 : dryMonths >= 3 ? 2 : 1;

  return { rawI, rawF, source: "NASA POWER" };
}

async function assessHeavyRainfall(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const data = await fetchNasaDaily(lat, lon);
  if (!data) return { rawI: 2, rawF: 2, source: "Fallback" };

  const precip = Object.values(data.PRECTOTCORR).filter(
    (v) => v !== -999 && v != null,
  );
  if (precip.length === 0)
    return { rawI: 2, rawF: 2, source: "NASA POWER (no data)" };

  const rx1day = Math.max(...precip);
  const r50mm = precip.filter((v) => v >= 50).length;
  const r100mm = precip.filter((v) => v >= 100).length;

  const rawI =
    rx1day >= 150 || r100mm >= 5 ? 3 : rx1day >= 80 || r100mm >= 1 ? 2 : 1;
  const annualR50 = r50mm / (precip.length / 365) || 0;
  const rawF = annualR50 >= 15 ? 3 : annualR50 >= 5 ? 2 : 1;

  return { rawI, rawF, source: "NASA POWER" };
}

async function assessHarmattan(lat: number, lon: number): Promise<RawScores> {
  const ometeo = await fetchOpenMeteoArchive(lat, lon, "dust");
  if (ometeo?.daily) {
    const daily = ometeo.daily as { dust?: number[] };
    const dustVals = (daily.dust ?? []).filter((v): v is number => v != null);

    if (dustVals.length > 0) {
      const peakDust = Math.max(...dustVals);
      const highDustDays = dustVals.filter((v) => v > 100).length;
      const rawI = peakDust >= 500 ? 3 : peakDust >= 200 ? 2 : 1;
      const pct = (highDustDays / dustVals.length) * 100;
      const rawF = pct >= 20 ? 3 : pct >= 5 ? 2 : 1;
      return { rawI, rawF, source: "Open-Meteo" };
    }
  }

  const al = Math.abs(lat);
  const sahelFactor = Math.exp(-(((al - 15) / 5) ** 2));
  const rawI = sahelFactor > 0.7 ? 3 : sahelFactor > 0.3 ? 2 : 1;
  const rawF = sahelFactor > 0.6 ? 3 : sahelFactor > 0.25 ? 2 : 1;
  return { rawI, rawF, source: "Geo-spatial" };
}

async function assessThunderstorms(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const ometeo = await fetchOpenMeteoArchive(lat, lon, "precipitation_sum");

  if (ometeo?.daily) {
    const daily = ometeo.daily as { precipitation_sum?: number[] };
    const precip = (daily.precipitation_sum ?? []).filter(
      (v): v is number => v != null,
    );

    if (precip.length > 0) {
      const stormDays = precip.filter((v) => v > 20).length;
      const annualStorms = stormDays / (precip.length / 365) || 0;

      const al = Math.abs(lat);
      const tropicalBoost = al < 15 ? 1.5 : al < 25 ? 1.2 : 1.0;
      const adjustedStorms = annualStorms * tropicalBoost;

      const rawI = adjustedStorms > 40 ? 3 : adjustedStorms > 20 ? 2 : 1;
      const rawF = adjustedStorms > 50 ? 3 : adjustedStorms > 25 ? 2 : 1;
      return { rawI, rawF, source: "Open-Meteo" };
    }
  }

  const al = Math.abs(lat);
  const tropical = Math.max(0, 1 - al / 25);
  const rawI = tropical > 0.6 ? 3 : tropical > 0.3 ? 2 : 1;
  const rawF = tropical > 0.5 ? 3 : tropical > 0.25 ? 2 : 1;
  return { rawI, rawF, source: "Geo-spatial" };
}

async function assessFlashFlooding(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const [data, elev] = await Promise.all([
    fetchNasaDaily(lat, lon),
    fetchElevation(lat, lon),
  ]);

  let urbanFactor = 1.0;
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?format=json` +
      `&lat=${lat}&lon=${lon}&zoom=14`;
    const res = await fetchWithTimeout(url, 8000);
    const json = await res.json();
    const type = json?.type ?? "";
    const cat = json?.category ?? "";
    if (
      cat === "place" &&
      ["city", "town", "borough", "suburb"].includes(type)
    ) {
      urbanFactor = 1.4;
    }
  } catch {
    /* no-op */
  }

  if (!data) {
    const rawI = urbanFactor > 1 ? 2 : 1;
    return { rawI, rawF: 2, source: "Fallback" };
  }

  const precip = Object.values(data.PRECTOTCORR).filter(
    (v) => v !== -999 && v != null,
  );
  const rx1day = precip.length > 0 ? Math.max(...precip) : 0;
  const elevFactor = elev != null && elev < 20 ? 1.3 : 1.0;
  const combinedI = rx1day * urbanFactor * elevFactor;

  const rawI = combinedI >= 120 ? 3 : combinedI >= 60 ? 2 : 1;
  const flashDays = precip.filter((v) => v > 50).length;
  const annualFlash = flashDays / (precip.length / 365) || 0;
  const rawF =
    annualFlash * urbanFactor >= 10
      ? 3
      : annualFlash * urbanFactor >= 3
        ? 2
        : 1;

  return { rawI, rawF, source: "NASA POWER + Nominatim" };
}

async function assessRiverFlooding(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const wriScore = await fetchWriAqueduct(lat, lon, "rfr_score");
  if (wriScore != null) {
    const rawI = wriScore >= 4 ? 3 : wriScore >= 2 ? 2 : 1;
    const rawF = wriScore >= 3 ? 3 : wriScore >= 1.5 ? 2 : 1;
    return { rawI, rawF, source: "WRI Aqueduct" };
  }

  const [data, elev] = await Promise.all([
    fetchNasaDaily(lat, lon),
    fetchElevation(lat, lon),
  ]);

  if (data) {
    const precip = Object.values(data.PRECTOTCORR).filter(
      (v) => v !== -999 && v != null,
    );
    const annualTotal =
      precip.length > 0
        ? (precip.reduce((a, b) => a + b, 0) / precip.length) * 365
        : 0;
    const lowElev = elev != null && elev < 50;

    const rawI =
      annualTotal > 2000 && lowElev ? 3 : annualTotal > 1200 || lowElev ? 2 : 1;
    const heavyDays = precip.filter((v) => v > 50).length;
    const annualHeavy = heavyDays / (precip.length / 365) || 0;
    const rawF = annualHeavy >= 10 ? 3 : annualHeavy >= 4 ? 2 : 1;
    return { rawI, rawF, source: "NASA POWER" };
  }

  return { rawI: 1, rawF: 1, source: "Fallback" };
}

async function assessCoastalFlooding(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const cf = coastalFactor(lat, lon);
  if (cf < 0.05) return { rawI: 1, rawF: 1, source: "Not coastal (>30km)" };

  const elev = await fetchElevation(lat, lon);
  const elevation = elev ?? 50;
  const rawI = elevation <= 2 ? 3 : elevation <= 5 ? 2 : 1;
  const rawF = elevation <= 3 ? 3 : elevation <= 8 ? 2 : 1;
  return { rawI, rawF, source: "SRTM Elevation + Coast Distance" };
}

async function assessStormSurge(lat: number, lon: number): Promise<RawScores> {
  const cf = coastalFactor(lat, lon);
  if (cf < 0.05) return { rawI: 1, rawF: 1, source: "Not coastal (>30km)" };

  const elev = await fetchElevation(lat, lon);
  const elevation = elev ?? 50;
  const al = Math.abs(lat);
  const tropicalZone = al < 25;

  const rawI = elevation <= 3 && tropicalZone ? 3 : elevation <= 5 ? 2 : 1;
  const rawF = tropicalZone && elevation <= 5 ? 2 : 1;

  return { rawI, rawF, source: "SRTM + Coast Distance" };
}

async function assessLandslides(lat: number, lon: number): Promise<RawScores> {
  const offsets = [
    [0, 0],
    [0.005, 0],
    [-0.005, 0],
    [0, 0.005],
    [0, -0.005],
  ];

  const elevations: number[] = [];
  for (const [dlat, dlon] of offsets) {
    const e = await fetchElevation(lat + dlat, lon + dlon);
    if (e != null) elevations.push(e);
  }

  if (elevations.length < 3) {
    const al = Math.abs(lat);
    const hill = Math.exp(-(((al - 8) / 6) ** 2));
    const rawI = hill > 0.5 ? 2 : 1;
    return { rawI, rawF: 1, source: "Geo-spatial" };
  }

  const maxElev = Math.max(...elevations);
  const minElev = Math.min(...elevations);
  const slopeDiff = maxElev - minElev;
  const slopeAngle = Math.atan(slopeDiff / 500) * (180 / Math.PI);

  const data = await fetchNasaDaily(lat, lon);
  let rainFactor = 1.0;
  if (data) {
    const precip = Object.values(data.PRECTOTCORR).filter(
      (v) => v !== -999 && v != null,
    );
    const maxRain = precip.length > 0 ? Math.max(...precip) : 0;
    if (maxRain > 80) rainFactor = 1.5;
    else if (maxRain > 50) rainFactor = 1.2;
  }

  const rawI =
    slopeAngle * rainFactor >= 25 ? 3 : slopeAngle * rainFactor >= 10 ? 2 : 1;
  const rawF = slopeAngle >= 15 ? 2 : 1;

  return { rawI, rawF, source: "OpenTopoData SRTM" };
}

async function assessCoastalErosion(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const cf = coastalFactor(lat, lon);
  if (cf < 0.05) return { rawI: 1, rawF: 1, source: "Not coastal (>30km)" };

  const elev = await fetchElevation(lat, lon);
  const elevation = elev ?? 50;
  const rawI = elevation <= 5 ? 3 : elevation <= 15 ? 2 : 1;
  const rawF = elevation <= 10 ? 2 : 1;

  return { rawI, rawF, source: "SRTM + Coast Distance" };
}

async function assessGroundwaterFlooding(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const [elev, data] = await Promise.all([
    fetchElevation(lat, lon),
    fetchNasaDaily(lat, lon),
  ]);

  const elevation = elev ?? 100;
  let wetSeasonRain = 0;
  if (data) {
    const precip = Object.values(data.PRECTOTCORR).filter(
      (v) => v !== -999 && v != null,
    );
    const sorted = [...precip].sort((a, b) => b - a);
    const topQ = sorted.slice(0, Math.floor(sorted.length / 4));
    wetSeasonRain =
      topQ.length > 0 ? topQ.reduce((a, b) => a + b, 0) / topQ.length : 0;
  }

  const lowElevation = elevation < 20;
  const rawI =
    lowElevation && wetSeasonRain > 15
      ? 3
      : lowElevation || wetSeasonRain > 10
        ? 2
        : 1;
  const rawF =
    wetSeasonRain > 12 && lowElevation ? 3 : wetSeasonRain > 8 ? 2 : 1;

  return { rawI, rawF, source: "SRTM + NASA POWER" };
}

async function assessSeaLevelRise(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const cf = coastalFactor(lat, lon);
  if (cf < 0.05) return { rawI: 1, rawF: 1, source: "Not coastal (>30km)" };

  const elev = await fetchElevation(lat, lon);
  const elevation = elev ?? 50;
  const region = getAfricanSubregion(lat, lon);
  const slr = IPCC_AR6_SLR_MM[region] ?? IPCC_AR6_SLR_MM["default"];

  const projectedRise = slr.rcp85 / 1000;
  const riskElevation = elevation - projectedRise;

  const rawI = riskElevation <= 1 ? 3 : riskElevation <= 5 ? 2 : 1;
  const rawF = 2;

  return { rawI, rawF, source: "IPCC AR6 + SRTM + Coast Distance" };
}

async function assessDesertification(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const monthly = await fetchNasaMonthly(lat, lon);
  if (!monthly) return { rawI: 2, rawF: 2, source: "Fallback" };

  const precip = Object.entries(monthly.PRECTOTCORR)
    .filter(([, v]) => v !== -999 && v != null)
    .map(([k, v]) => ({ year: parseInt(k.slice(0, 4)), val: v }));

  if (precip.length < 120) {
    const al = Math.abs(lat);
    const sahel = Math.exp(-(((al - 15) / 5) ** 2));
    return {
      rawI: sahel > 0.5 ? 3 : sahel > 0.2 ? 2 : 1,
      rawF: sahel > 0.4 ? 3 : sahel > 0.15 ? 2 : 1,
      source: "Geo-spatial",
    };
  }

  const yearlyTotals: Record<number, number> = {};
  for (const p of precip) {
    yearlyTotals[p.year] = (yearlyTotals[p.year] ?? 0) + p.val;
  }
  const years = Object.keys(yearlyTotals).map(Number).sort();
  if (years.length < 10)
    return { rawI: 2, rawF: 2, source: "NASA POWER (insuff)" };

  const firstDecade = years.slice(0, 10);
  const lastDecade = years.slice(-10);
  const avgFirst =
    firstDecade.reduce((s, y) => s + yearlyTotals[y], 0) / firstDecade.length;
  const avgLast =
    lastDecade.reduce((s, y) => s + yearlyTotals[y], 0) / lastDecade.length;

  const changePercent =
    avgFirst > 0 ? ((avgLast - avgFirst) / avgFirst) * 100 : 0;

  const rawI = changePercent <= -20 ? 3 : changePercent <= -10 ? 2 : 1;
  const rawF = avgLast < 400 ? 3 : avgLast < 800 ? 2 : 1;

  return { rawI, rawF, source: "NASA POWER" };
}

function assessWildfire(lat: number, lon: number): RawScores {
  const al = Math.abs(lat);

  // Mediterranean / Southern Europe / California (30–45°)
  if (
    al >= 30 &&
    al <= 45 &&
    ((lon >= -130 && lon <= -60) || (lon >= -10 && lon <= 45))
  ) {
    return { rawI: 3, rawF: 2, source: "Latitude zone (Mediterranean/CA)" };
  }
  // Australia boreal/savanna (-10 to -40°)
  if (al >= 10 && al <= 40 && lon >= 110 && lon <= 155) {
    return { rawI: 3, rawF: 3, source: "Latitude zone (Australia)" };
  }
  // Siberia / Russian boreal (50–70°)
  if (lat >= 50 && lon >= 60 && lon <= 180) {
    return { rawI: 2, rawF: 2, source: "Latitude zone (Boreal Siberia)" };
  }
  // African savanna bands
  if (al >= 5 && al <= 15) {
    return { rawI: 2, rawF: 3, source: "Latitude zone (Guinea savanna)" };
  }
  if (al > 15 && al <= 22) {
    return { rawI: 3, rawF: 2, source: "Latitude zone (Sudan savanna)" };
  }
  // South America cerrado (Brazil)
  if (lat >= -25 && lat <= -5 && lon >= -60 && lon <= -40) {
    return { rawI: 2, rawF: 2, source: "Latitude zone (Cerrado Brazil)" };
  }
  return { rawI: 1, rawF: 1, source: "Latitude zone" };
}

async function assessWaterScarcity(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const wriScore = await fetchWriAqueduct(lat, lon, "bws_score");
  if (wriScore != null) {
    const rawI = wriScore >= 4 ? 3 : wriScore >= 2.5 ? 2 : 1;
    const rawF = wriScore >= 3 ? 3 : wriScore >= 1.5 ? 2 : 1;
    return { rawI, rawF, source: "WRI Aqueduct" };
  }

  const monthly = await fetchNasaMonthly(lat, lon);
  if (monthly) {
    const precip = Object.values(monthly.PRECTOTCORR).filter(
      (v) => v !== -999 && v != null,
    );
    if (precip.length > 0) {
      const annualAvg =
        (precip.reduce((a, b) => a + b, 0) / precip.length) * 12;
      const rawI = annualAvg < 400 ? 3 : annualAvg < 800 ? 2 : 1;
      const rawF = annualAvg < 500 ? 3 : annualAvg < 1000 ? 2 : 1;
      return { rawI, rawF, source: "NASA POWER" };
    }
  }

  return { rawI: 2, rawF: 2, source: "Fallback" };
}

function assessGlacialRetreat(lat: number, lon: number): RawScores {
  let minDist = Infinity;
  for (const [, glat, glon] of AFRICAN_GLACIERS) {
    const d = haversineKm(lat, lon, glat, glon);
    if (d < minDist) minDist = d;
  }

  const rawI = minDist <= 50 ? 3 : minDist <= 200 ? 2 : 1;
  const rawF = minDist <= 100 ? 2 : 1;
  return { rawI, rawF, source: "Haversine (African glaciers)" };
}

async function assessEarthquakes(lat: number, lon: number): Promise<RawScores> {
  const result = await fetchUsgsEarthquakes(lat, lon, 100, 4.0, 30);
  if (!result) {
    const riftFactor =
      Math.exp(-(((lon - 35) / 8) ** 2)) *
      Math.max(0, 1 - Math.abs(lat - 5) / 15);
    return {
      rawI: riftFactor > 0.5 ? 2 : 1,
      rawF: riftFactor > 0.3 ? 2 : 1,
      source: "Geo-spatial",
    };
  }

  const { count, maxMag } = result;
  const rawI = maxMag >= 6.0 ? 3 : maxMag >= 5.0 ? 2 : 1;
  const annualCount = count / 30;
  const rawF = annualCount >= 2 ? 3 : annualCount >= 0.5 ? 2 : 1;

  return { rawI, rawF, source: "USGS FDSNWS" };
}

function assessVolcanicEruptions(lat: number, lon: number): RawScores {
  let minDist = Infinity;
  for (const [, vlat, vlon] of AFRICAN_VOLCANOES) {
    const d = haversineKm(lat, lon, vlat, vlon);
    if (d < minDist) minDist = d;
  }

  const rawI = minDist <= 50 ? 3 : minDist <= 150 ? 2 : 1;
  const rawF = minDist <= 100 ? 2 : 1;
  return { rawI, rawF, source: "Haversine (African volcanoes)" };
}

async function assessTsunamis(lat: number, lon: number): Promise<RawScores> {
  const distKm = distToCoastKm(lat, lon);
  if (distKm > 30) return { rawI: 1, rawF: 1, source: "Not coastal (>30km)" };

  const [tsunamiData, elev] = await Promise.all([
    fetchNoaaTsunamis(lat, lon, 500),
    fetchElevation(lat, lon),
  ]);

  const elevation = elev ?? 50;
  const count = tsunamiData?.count ?? 0;
  const maxRunup = tsunamiData?.maxRunup ?? 0;

  const rawI =
    maxRunup >= 5 || elevation <= 5
      ? 3
      : maxRunup >= 2 || elevation <= 10
        ? 2
        : 1;
  const rawF = count >= 5 ? 2 : 1;

  return { rawI, rawF, source: "NOAA NGDC + SRTM + Coast Distance" };
}

async function assessTropicalCyclones(
  lat: number,
  lon: number,
): Promise<RawScores> {
  const al = Math.abs(lat);
  const cf = coastalFactor(lat, lon);

  const latFactor = al >= 5 && al <= 25 ? 1.0 : al <= 30 ? 0.5 : 0.1;
  const coastFactor = cf >= 0.4 ? 1.5 : cf >= 0.1 ? 1.0 : 0.5;
  const basinFactor = lon > 30 && al < 25 ? 1.3 : lon < -10 ? 0.8 : 1.0;

  const combined = latFactor * coastFactor * basinFactor;
  const rawI = combined >= 1.5 ? 3 : combined >= 0.8 ? 2 : 1;
  const rawF = combined >= 1.2 ? 2 : 1;

  return { rawI, rawF, source: "Geo-spatial (cyclone zone + coast dist)" };
}
const RISK_ASSESSOR: Record<
  string,
  (lat: number, lon: number) => Promise<RawScores> | RawScores
> = {
  "Extreme Heat": assessExtremeHeat,
  Drought: assessDrought,
  "Tropical Cyclones": assessTropicalCyclones,
  "Thunderstorms & Lightning": assessThunderstorms,
  "Sandstorms / Harmattan": assessHarmattan,
  "Heavy Rainfall": assessHeavyRainfall,
  "River Flooding": assessRiverFlooding,
  "Flash Flooding": assessFlashFlooding,
  "Coastal Flooding": assessCoastalFlooding,
  "Storm Surge": assessStormSurge,
  Landslides: assessLandslides,
  "Coastal & Riverbank Erosion": assessCoastalErosion,
  "Groundwater Flooding": assessGroundwaterFlooding,
  "Sea Level Rise": assessSeaLevelRise,
  Desertification: assessDesertification,
  "Wildfire / Bushfire": assessWildfire,
  "Water Scarcity": assessWaterScarcity,
  "Glacial Retreat": assessGlacialRetreat,
  Earthquakes: assessEarthquakes,
  "Volcanic Eruptions": assessVolcanicEruptions,
  Tsunamis: assessTsunamis,
};
async function assessSingleRisk(
  risk: string,
  lat: number,
  lon: number,
  mc: MatrixConfig,
): Promise<{ iScore: number; fScore: number; source: string }> {
  const assessor = RISK_ASSESSOR[risk];
  if (!assessor) {
    const riskDef = ALL_21_RISKS.find((r) => r.risk === risk);
    const result = geoMathFallback(risk, riskDef?.id ?? 1, lat, lon, mc);
    return {
      iScore: result.intensityScore,
      fScore: result.frequencyScore,
      source: "Local engine",
    };
  }

  try {
    const raw = await assessor(lat, lon);
    return {
      iScore: scaleScore(raw.rawI, 3, mc.size),
      fScore: scaleScore(raw.rawF, 3, mc.size),
      source: raw.source,
    };
  } catch {
    const riskDef = ALL_21_RISKS.find((r) => r.risk === risk);
    const result = geoMathFallback(risk, riskDef?.id ?? 1, lat, lon, mc);
    return {
      iScore: result.intensityScore,
      fScore: result.frequencyScore,
      source: "Local engine (fallback)",
    };
  }
}
export async function assessHazardsWithClimateApis(
  items: HazardInput[],
  matrixSize: number,
  onProgress?: (done: number, total: number, current: string) => void,
  onItemComplete?: (risk: string, dataSource: string) => void,
): Promise<HazardOutput[]> {
  const mc = buildMatrixConfig(matrixSize);
  const results: HazardOutput[] = [];

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    onProgress?.(idx, items.length, `${item.asset} — ${item.risk}`);

    const { iScore, fScore, source } = await assessSingleRisk(
      item.risk,
      item.latitude,
      item.longitude,
      mc,
    );

    const rating = getRating(mc, iScore, fScore);
    results.push({
      asset: item.asset,
      risk: item.risk,
      intensityScore: iScore,
      frequencyScore: fScore,
      intensityLabel: mc.intensityLabels[iScore] ?? String(iScore),
      frequencyLabel: mc.frequencyLabels[fScore] ?? String(fScore),
      hazardRating: rating,
      dataSource: source,
    });

    onItemComplete?.(item.risk, source);
  }

  onProgress?.(items.length, items.length, "Complete");
  return results;
}
export function assessHazardsLocally(
  items: HazardInput[],
  matrixSize: number,
): HazardOutput[] {
  const mc = buildMatrixConfig(matrixSize);
  return items.map((it) => {
    const riskDef = ALL_21_RISKS.find((r) => r.risk === it.risk);
    const { intensityScore, frequencyScore } = geoMathFallback(
      it.risk,
      riskDef?.id ?? 1,
      it.latitude,
      it.longitude,
      mc,
    );
    const rating = getRating(mc, intensityScore, frequencyScore);
    return {
      asset: it.asset,
      risk: it.risk,
      intensityScore,
      frequencyScore,
      intensityLabel:
        mc.intensityLabels[intensityScore] ?? String(intensityScore),
      frequencyLabel:
        mc.frequencyLabels[frequencyScore] ?? String(frequencyScore),
      hazardRating: rating,
      dataSource: "Local engine",
    };
  });
}
export function clearApiCache(): void {
  apiCache.clear();
}
