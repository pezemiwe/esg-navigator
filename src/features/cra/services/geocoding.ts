export interface GeoResult {
  lat: number;
  lon: number;
  displayName: string;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function geocodeAddress(
  address: string,
): Promise<GeoResult | null> {
  if (!address.trim()) return null;
  try {
    const params = new URLSearchParams({
      q: address,
      format: "json",
      limit: "1",
      addressdetails: "0",
    });
    const res = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: { "User-Agent": "ESG-Navigator/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name ?? address,
    };
  } catch {
    return null;
  }
}
export async function batchGeocode(
  items: { address: string; lat?: number; lon?: number }[],
  onProgress?: (done: number, total: number) => void,
): Promise<Map<number, GeoResult>> {
  const results = new Map<number, GeoResult>();
  const toGeocode = items
    .map((item, idx) => ({
      idx,
      address: item.address,
      lat: item.lat,
      lon: item.lon,
    }))
    .filter((item) => {
      const hasCoords =
        item.lat !== undefined &&
        item.lon !== undefined &&
        !(item.lat === 6.5 && item.lon === 3.4) &&
        !(item.lat === 0 && item.lon === 0);
      return !hasCoords && item.address.trim().length > 0;
    });

  for (let i = 0; i < toGeocode.length; i++) {
    const item = toGeocode[i];
    const result = await geocodeAddress(item.address);
    if (result) results.set(item.idx, result);
    onProgress?.(i + 1, toGeocode.length);
    if (i < toGeocode.length - 1) await sleep(1100);
  }
  return results;
}
