import { useState, useCallback } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import {
  MapPin,
  Navigation,
  Building2,
  Pencil,
  Loader2,
  DollarSign,
} from "lucide-react";
import AssetMapView from "../../components/AssetMapView";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import type { GeoConfidence } from "@/store/physicalRiskStore";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export default function SingleGeoConfirm() {
  const canvasRef = useHeroCanvas();
  const {
    mappedAssets,
    geoConfidence,
    setGeoConfidence,
    setMappedAssets,
    config,
  } = usePhysicalRiskStore();
  const asset = mappedAssets[0];
  const [editing, setEditing] = useState(false);
  const [editAddress, setEditAddress] = useState(asset?.region ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const gc = geoConfidence;
  const hasGeo = gc && gc.lat !== 0 && gc.lon !== 0;

  const reGeocode = useCallback(async () => {
    if (!editAddress.trim()) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        q: editAddress,
        format: "json",
        limit: "1",
        addressdetails: "1",
      });
      const res = await fetch(`${NOMINATIM_URL}?${params}`, {
        headers: { "User-Agent": "ESG-Navigator/1.0" },
      });
      if (!res.ok) throw new Error("Geocode failed");
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0)
        throw new Error("No results found for that address");
      const hit = data[0];
      const lat = parseFloat(hit.lat);
      const lon = parseFloat(hit.lon);
      const importance = hit.importance ?? 0;
      let elevation = 0;
      try {
        const elRes = await fetch(
          `https://api.opentopodata.org/v1/srtm90m?locations=${lat},${lon}`,
        );
        if (elRes.ok) {
          const elData = await elRes.json();
          elevation = elData?.results?.[0]?.elevation ?? 0;
        }
      } catch {
        // elevation fetch is best-effort; default 0 is used on failure
      }
      const level: GeoConfidence["level"] =
        importance > 0.7
          ? "Exact Address"
          : importance > 0.4
            ? "Street Level"
            : "City Level";
      const coastDist = Math.abs(
        lat - (lon >= 2 && lon < 5 ? 6 : lon >= 5 && lon < 10 ? 5 : 5.5),
      );
      const newGc: GeoConfidence = {
        lat,
        lon,
        elevation,
        isCoastal: coastDist < 2.5,
        isUrban: hit.type === "city" || hit.type === "administrative",
        level,
        displayName: hit.display_name,
      };
      setGeoConfidence(newGc);
      if (asset)
        setMappedAssets([
          { ...asset, latitude: lat, longitude: lon, region: hit.display_name },
        ]);
      setEditing(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Geocoding failed");
    } finally {
      setLoading(false);
    }
  }, [editAddress, asset, setGeoConfidence, setMappedAssets]);

  if (!asset) return null;

  const META = [
    { label: "Asset Name", value: asset.name, icon: MapPin },
    { label: "Asset Type", value: asset.assetType, icon: Building2 },
    {
      label: "Book Value",
      value: `${config.currency === "USD" ? "$\u00A0" : config.currency === "GHS" ? "\u20B5\u00A0" : "\u20A6\u00A0"}${asset.value.toLocaleString()}`,
      icon: DollarSign,
    },
    {
      label: "Latitude",
      value: gc?.lat?.toFixed(6) ?? "\u2014",
      icon: Navigation,
    },
    {
      label: "Longitude",
      value: gc?.lon?.toFixed(6) ?? "\u2014",
      icon: Navigation,
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] relative">
      <canvas
        ref={canvasRef}
        className="pointer-events-none z-0"
        style={{ position: "fixed", top: 0, left: 0 }}
      />
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes checkPop {
          0% {
            transform: scale(0) rotate(-10deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.2) rotate(3deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scaleY(0.94);
          }
          to {
            opacity: 1;
            transform: scaleY(1);
          }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .saf-fu {
          animation: fadeUp 0.38s ease forwards;
          opacity: 0;
        }
        .si {
          animation: scaleIn 0.18s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          transform-origin: top;
        }
        .check {
          animation: checkPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .pra-field {
          position: relative;
          transition: transform 0.15s ease;
        }
        .pra-field:focus-within {
          transform: translateY(-1px);
        }

        .pra-input-enhanced {
          width: 100%;
          background: white;
          border: 1px solid #d8d8d8;
          padding: 10px 12px;
          font-size: 14px;
          color: #111;
          outline: none;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
          border-radius: 0;
        }
        .dark .pra-input-enhanced {
          background: #1a1a1a;
          border-color: rgba(255, 255, 255, 0.1);
          color: #f0f0f0;
        }
        .pra-input-enhanced:focus {
          border-color: #86bc25;
          box-shadow: 0 0 0 3px rgba(134, 188, 37, 0.1);
        }
        .pra-input-enhanced::placeholder {
          color: #bbbbbb;
        }
        .dark .pra-input-enhanced::placeholder {
          color: #444;
        }

        .pra-label-enhanced {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #999;
          margin-bottom: 6px;
          font-family: var(--font-mono);
          transition: color 0.15s ease;
        }
        .pra-field:focus-within .pra-label-enhanced {
          color: #86bc25;
        }
      `}</style>

      <div className="relative z-10 overflow-hidden bg-[#1A3C21] dark:bg-[#0F1F13]">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`,
          }}
        />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #86BC25 0%, transparent 70%)",
            animation: "heroGlow 6s ease-in-out infinite",
          }}
        />
        <div className="relative px-6 md:px-10 py-6 md:py-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 max-w-300 mx-auto">
            <div className="saf-fu" style={{ animationDelay: "0ms" }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-[#86BC25] flex items-center justify-center">
                  <Navigation size={13} className="text-white" />
                </div>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Step 02 of 07 &mdash; Confirm Location
                </span>
              </div>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                Verify Geocoded Coordinates
              </h1>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                Review the precise location before running the hazard
                assessment.
              </p>
            </div>
          </div>
        </div>
        <div className="h-0.75 bg-white/6">
          <div
            className="h-full bg-[#86BC25]"
            style={{
              width: `${hasGeo ? 100 : 0}%`,
              transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          />
        </div>
      </div>

      <div className="relative z-10 flex-1 flex">
        <div className="hidden lg:flex flex-col w-75 shrink-0 border-r border-[#D8D8D8] dark:border-white/7 bg-white dark:bg-[#111]">
          <div className="px-6 py-7 border-b border-[#EBEBEB] dark:border-white/6">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 02 / 07
            </div>
            <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
              Confirm Location
            </h2>
            <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
              Verify the geocoded coordinates before running the assessment.
            </p>
          </div>

          {hasGeo && (
            <div className="px-6 py-4 border-b border-[#EBEBEB] dark:border-white/6 space-y-3">
              {(
                [
                  { label: "Latitude", value: gc!.lat.toFixed(5) },
                  { label: "Longitude", value: gc!.lon.toFixed(5) },
                ] as { label: string; value: string }[]
              ).map((item) => (
                <div key={item.label}>
                  <span
                    className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] block mb-0.5"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {item.label}
                  </span>
                  <div className="text-[14px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-6 py-5 flex-1">
            <div className="p-4 rounded-xl bg-[#F8FAF3] dark:bg-[#86BC25]/4 border border-[#E8F0D8] dark:border-[#86BC25]/10">
              <div className="w-7 h-7 rounded-lg bg-[#86BC25]/10 flex items-center justify-center mb-3">
                <Navigation size={13} className="text-[#86BC25]" />
              </div>
              <p className="text-[12px] font-semibold text-[#1A3C21] dark:text-[#86BC25] mb-1">
                Geocoding Quality
              </p>
              <p className="text-[11px] text-[#6B7B6E] dark:text-[#666] leading-relaxed">
                Exact Address offers the highest precision. City Level carries
                broader uncertainty — refining the address improves hazard
                scoring accuracy.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 overflow-y-auto">
          <div className="max-w-205">
            {hasGeo && (
              <div
                className="saf-fu mb-7 border border-[#D8D8D8] dark:border-white/7 overflow-hidden"
                style={{ animationDelay: "0ms" }}
              >
                <AssetMapView
                  pins={[
                    {
                      lat: gc.lat,
                      lon: gc.lon,
                      label: asset.name,
                      detail: gc.displayName,
                    },
                  ]}
                  height={300}
                  zoom={15}
                />
              </div>
            )}

            <div className="saf-fu mb-7" style={{ animationDelay: "40ms" }}>
              <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
                Verify this location
              </h1>
            </div>

            <div
              className="saf-fu grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5"
              style={{ animationDelay: "80ms" }}
            >
              {META.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="p-3 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/7"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={11} className="text-[#888] dark:text-[#555]" />
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider text-[#888] dark:text-[#555]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {label}
                    </span>
                  </div>
                  <span className="text-[14px] font-semibold text-[#111] dark:text-[#F0F0F0] wrap-break-word leading-snug">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            {gc?.displayName && (
              <div
                className="saf-fu p-4 mb-5 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/7"
                style={{ animationDelay: "120ms" }}
              >
                <span
                  className="block text-[11px] font-semibold uppercase tracking-wider text-[#888] dark:text-[#555] mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Resolved Address
                </span>
                <span className="text-[14px] text-[#111] dark:text-[#F0F0F0] leading-relaxed">
                  {gc.displayName}
                </span>
              </div>
            )}

            {editing && (
              <div
                className="saf-fu grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 mb-5"
                style={{ animationDelay: "0ms" }}
              >
                <div className="pra-field">
                  <label className="pra-label-enhanced">New Address</label>
                  <div className="relative">
                    <MapPin
                      size={13}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888] dark:text-[#555] pointer-events-none"
                    />
                    <input
                      className="pra-input-enhanced"
                      style={{ paddingLeft: "2.25rem" }}
                      placeholder="Enter a more specific address…"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && reGeocode()}
                    />
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={reGeocode}
                    disabled={loading}
                    className="flex items-center gap-2 px-5 h-10.5 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] disabled:opacity-50 transition-colors shrink-0"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {loading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      "Re-geocode"
                    )}
                  </button>
                </div>
              </div>
            )}

            {error && <p className="text-[13px] text-red-500 mb-4">{error}</p>}

            <div
              className="saf-fu flex items-center justify-between"
              style={{ animationDelay: "160ms" }}
            >
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-[#888] dark:text-[#555] hover:text-[#111] dark:hover:text-[#F0F0F0] transition-colors bg-transparent border-none cursor-pointer"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Pencil size={12} />
                {editing ? "Cancel edit" : "Edit address"}
              </button>
              <p
                className="text-[12px] text-[#AAA] dark:text-[#555]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Proceed to hazard selection →
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
