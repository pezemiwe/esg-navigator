"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  MapPin,
  DollarSign,
  ChevronDown,
  Loader2,
  ArrowRight,
  Check,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { SECTORS } from "../../domain/physicalRisk/constants";

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

const ASSET_GROUPS: Record<string, string[]> = {
  Buildings: [
    "Office Building",
    "Industrial Building",
    "Warehouse / Storage",
    "Retail Outlet / Branch",
    "Healthcare Facility",
    "Educational Facility",
    "Hospitality Building",
    "Religious / Assembly Hall",
    "Military / Security Post",
  ],
  "Critical Infrastructure": [
    "Data Centre",
    "Telecoms Mast / Tower",
    "Power Generation Plant",
    "Electrical Substation",
    "Transmission Line / Pylon",
    "Water Treatment Plant",
    "Water Distribution Network",
    "Server Room / Network Hub",
    "ATM / POS Terminal Network",
    "Broadcasting / Transmission Equipment",
  ],
  "Oil & Gas": [
    "Onshore Refinery / Process Plant",
    "LNG / LPG Terminal",
    "Offshore Platform",
    "Floating Production Vessel (FPSO)",
    "Storage Tank / Tank Farm",
    "Petrol Station / Depot",
    "Pipeline � Onshore",
    "Pipeline � Offshore / Subsea",
    "Underground Cable / Duct",
  ],
  Transport: [
    "Road / Bridge / Culvert",
    "Rail Track / Rail Infrastructure",
    "Port / Jetty / Quay",
    "Airport Terminal / Runway",
    "Vessel / Barge / Tug",
    "Vehicle Fleet / Rolling Stock",
  ],
  "Land & Agriculture": [
    "Cropland / Farmland",
    "Irrigation System",
    "Aquaculture Facility",
    "Plantation / Forest",
  ],
  "Mining & Processing": [
    "Mine / Quarry Site",
    "Mineral Processing Plant",
    "Tailings Dam / Waste Facility",
  ],
  Other: [
    "Outdoor Plant & Equipment",
    "Semi-outdoor Kiosk / Booth",
    "Open Yard / Storage Compound",
    "Solar Farm / Wind Farm",
    "Construction Site / Temporary Camp",
    "Modular / Prefabricated Unit",
  ],
};

const STEPS = [
  { num: "01", label: "Name & Address", field: "name" },
  { num: "02", label: "Asset Type", field: "type" },
  { num: "03", label: "Valuation", field: "value" },
  { num: "04", label: "Matrix & Rate", field: "matrix" },
  { num: "05", label: "Sector", field: "sector" },
];

export default function SingleAssetForm() {
  const {
    config,
    mappedAssets,
    setConfig,
    setMappedAssets,
    setActiveStep,
    setGeoConfidence,
  } = usePhysicalRiskStore();

  const existingAsset = mappedAssets[0];
  const [assetName, setAssetName] = useState(() => existingAsset?.name ?? "");
  const [address, setAddress] = useState(() => existingAsset?.region ?? "");
  const [assetType, setAssetType] = useState(
    () => existingAsset?.assetType ?? "",
  );
  const [replValue, setReplValue] = useState(() =>
    existingAsset?.value ? String(existingAsset.value) : "",
  );
  const [replDisplay, setReplDisplay] = useState(() => {
    const v = existingAsset?.value;
    return v ? Number(v).toLocaleString() : "";
  });
  const [currency, setCurrency] = useState<"NGN" | "USD">(() =>
    config.currency === "USD" ? "USD" : "NGN",
  );
  const [usdRate, setUsdRate] = useState(() => config.usdRate ?? 1600);
  const [matrixSize, setMatrixSize] = useState<number>(
    () => config.matrixSize ?? 5,
  );
  const [sectorId, setSectorId] = useState(() => config.sectorId || "1");
  const [subsector, setSubsector] = useState(() => config.subsector || "");

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] =
    useState<AddressSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAssetTypeDropdown, setShowAssetTypeDropdown] = useState(false);
  const [_activeField, setActiveField] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const addressRef = useRef<HTMLDivElement>(null);
  const assetTypeRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          format: "json",
          limit: "6",
          addressdetails: "1",
        });
        const res = await fetch(`${NOMINATIM_URL}?${params}`, {
          headers: { "User-Agent": "GCB-ESG-Navigator/1.0" },
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }, 400);
  }, []);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (addressRef.current && !addressRef.current.contains(e.target as Node))
        setShowSuggestions(false);
      if (
        assetTypeRef.current &&
        !assetTypeRef.current.contains(e.target as Node)
      )
        setShowAssetTypeDropdown(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const sectorDef = SECTORS[sectorId];
  const subsectors = useMemo(() => sectorDef?.subsectors ?? [], [sectorDef]);
  useEffect(() => {
    if (subsectors.length > 0 && !subsectors.includes(subsector))
      setSubsector(subsectors[0]);
  }, [sectorId, subsectors, subsector]);

  const fieldsDone = {
    name: assetName.trim().length > 0 && address.trim().length > 0,
    type: assetType.length > 0,
    value: parseFloat(replValue) > 0,
    matrix: matrixSize >= 3,
    sector: sectorId.length > 0,
  };
  const completedCount = Object.values(fieldsDone).filter(Boolean).length;
  const progressPct = (completedCount / 5) * 100;
  const isValid = Object.values(fieldsDone).every(Boolean);

  const handleValueChange = (raw: string) => {
    const cleaned = raw.replace(/[^0-9.]/g, "").replace(/(\.[0-9]*)\./g, "$1");
    setReplValue(cleaned);
    if (cleaned === "" || cleaned === ".") {
      setReplDisplay(cleaned);
      return;
    }
    const [intPart, decPart] = cleaned.split(".");
    setReplDisplay(
      Number(intPart).toLocaleString() +
        (decPart !== undefined ? "." + decPart : ""),
    );
  };

  const handleSubmit = async () => {
    if (!isValid) return;
    const lat = selectedSuggestion
      ? parseFloat(selectedSuggestion.lat)
      : (mappedAssets[0]?.latitude ?? 0);
    const lon = selectedSuggestion
      ? parseFloat(selectedSuggestion.lon)
      : (mappedAssets[0]?.longitude ?? 0);
    setConfig({ sectorId, subsector, currency, usdRate, matrixSize });
    const asset = {
      id: mappedAssets[0]?.id ?? `SA-${Date.now()}`,
      name: assetName.trim(),
      assetType,
      value: parseFloat(replValue),
      latitude: lat,
      longitude: lon,
      region: selectedSuggestion?.display_name ?? address,
      sector: sectorDef?.name ?? "",
    };
    setMappedAssets([asset]);
    if (selectedSuggestion) {
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
        /* ignore */
      }
      const importance = selectedSuggestion.importance ?? 0;
      const level =
        importance > 0.7
          ? ("Exact Address" as const)
          : importance > 0.4
            ? ("Street Level" as const)
            : ("City Level" as const);
      const coastDist = Math.abs(
        lat - (lon >= 2 && lon < 5 ? 6 : lon >= 5 && lon < 10 ? 5 : 5.5),
      );
      setGeoConfidence({
        lat,
        lon,
        elevation,
        isCoastal: coastDist < 2.5,
        isUrban:
          selectedSuggestion.type === "city" ||
          selectedSuggestion.type === "administrative",
        level,
        displayName: selectedSuggestion.display_name,
      });
    }
    setActiveStep(1);
  };

  return (
    <div className="flex-1 flex bg-[#F4F4F2] dark:bg-[#0D0D0D] min-h-[calc(100vh-140px)]">
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
        @keyframes progressFill {
          from {
            width: 0%;
          }
        }
        @keyframes pulseGreen {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(134, 188, 37, 0);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(134, 188, 37, 0.15);
          }
        }
        @keyframes cardReveal {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes dotBlink {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.25;
          }
        }
        @keyframes shimmer {
          0% {
            background-position: -400px 0;
          }
          100% {
            background-position: 400px 0;
          }
        }

        .fu {
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
        .blink {
          animation: dotBlink 2s ease-in-out infinite;
        }
        .card-in {
          animation: cardReveal 0.35s ease forwards;
          opacity: 0;
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

        .shimmer-line {
          background: linear-gradient(
            90deg,
            #f0f0ee 25%,
            #e8e8e5 50%,
            #f0f0ee 75%
          );
          background-size: 400px 100%;
          animation: shimmer 1.4s ease-in-out infinite;
          border-radius: 2px;
        }
        .dark .shimmer-line {
          background: linear-gradient(
            90deg,
            #1e1e1e 25%,
            #252525 50%,
            #1e1e1e 75%
          );
          background-size: 400px 100%;
        }

        .submit-btn {
          transition:
            transform 0.15s ease,
            box-shadow 0.15s ease,
            background-color 0.15s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(134, 188, 37, 0.3);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0px);
          box-shadow: 0 2px 8px rgba(134, 188, 37, 0.2);
        }
        .submit-btn:not(:disabled) {
          animation: pulseGreen 3s ease-in-out infinite;
        }
      `}</style>

      {/* -- LEFT RAIL -- */}
      <div className="hidden lg:flex flex-col w-[300px] flex-shrink-0 border-r border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]">
        <div className="px-6 py-7 border-b border-[#EBEBEB] dark:border-white/[0.06]">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Step 01 / 07
          </div>
          <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
            Asset Details
          </h2>
          <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
            Provide basic information about the asset you want to assess.
          </p>
        </div>

        <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/[0.06]">
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[10px] uppercase tracking-[0.12em] text-[#AAA]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Completion
            </span>
            <span
              className="text-[11px] font-bold text-[#86BC25]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {completedCount}/5
            </span>
          </div>
          <div className="h-[3px] bg-[#F0F0EE] dark:bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#86BC25] rounded-full"
              style={{
                width: `${progressPct}%`,
                transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            />
          </div>
        </div>

        <div className="px-6 py-5 flex-1">
          <div className="space-y-1">
            {STEPS.map((step, i) => {
              const done = fieldsDone[step.field as keyof typeof fieldsDone];
              const active = !done && completedCount === i;
              return (
                <div
                  key={step.num}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 ${
                    active ? "bg-[#F7FAF0] dark:bg-[#86BC25]/[0.06]" : ""
                  }`}
                >
                  <div
                    className={`w-5 h-5 flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${
                      done
                        ? "bg-[#86BC25] border-[#86BC25]"
                        : active
                          ? "border-[#86BC25]"
                          : "border-[#DDD] dark:border-white/[0.10]"
                    }`}
                  >
                    {done ? (
                      <Check
                        size={10}
                        className="text-white check"
                        strokeWidth={3}
                      />
                    ) : (
                      <span
                        className={`text-[9px] font-bold ${active ? "text-[#86BC25]" : "text-[#CCC] dark:text-[#555]"}`}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {step.num}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[13px] transition-colors duration-200 ${
                      done
                        ? "text-[#86BC25] font-medium"
                        : active
                          ? "text-[#111] dark:text-[#EEE] font-medium"
                          : "text-[#AAA] dark:text-[#555]"
                    }`}
                  >
                    {step.label}
                  </span>
                  {active && (
                    <div className="ml-auto w-1 h-1 rounded-full bg-[#86BC25] blink" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* -- FORM AREA -- */}
      <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 overflow-y-auto">
        <div className="max-w-[820px]">
          <div className="fu mb-7" style={{ animationDelay: "0ms" }}>
            <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
              Asset details
            </h1>
          </div>

          <div className="space-y-5">
            {/* Asset Name + Asset Type — 2-col grid */}
            <div
              className="fu grid grid-cols-1 sm:grid-cols-2 gap-3"
              style={{
                animationDelay: "40ms",
                position: "relative",
                zIndex: showAssetTypeDropdown ? 400 : "auto",
              }}
            >
              <div className="pra-field">
                <label className="pra-label-enhanced">Asset Description</label>
                <input
                  className="pra-input-enhanced"
                  placeholder="e.g. Lagos Head Office"
                  value={assetName}
                  onFocus={() => setActiveField("name")}
                  onBlur={() => setActiveField(null)}
                  onChange={(e) => setAssetName(e.target.value)}
                />
              </div>
              <div className="pra-field" style={{ position: "relative" }}>
                <div ref={assetTypeRef} className="relative">
                  <label className="pra-label-enhanced">Asset Type</label>
                  <button
                    type="button"
                    onClick={() => setShowAssetTypeDropdown((v) => !v)}
                    className="pra-input-enhanced w-full flex items-center justify-between cursor-pointer text-left"
                    style={{ paddingRight: "36px" }}
                  >
                    <span
                      className={
                        assetType
                          ? "text-[#111] dark:text-[#F0F0F0]"
                          : "text-[#BBBBBB] dark:text-[#444]"
                      }
                    >
                      {assetType || "Select asset type"}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`absolute right-3 text-[#BBBBBB] dark:text-[#444] flex-shrink-0 transition-transform duration-200 ${showAssetTypeDropdown ? "rotate-180" : ""}`}
                    />
                  </button>
                  {showAssetTypeDropdown && (
                    <div className="si absolute top-full left-0 right-0 z-[9999] mt-0.5 bg-white dark:bg-[#1A1A1A] border border-[#D8D8D8] dark:border-white/[0.10] overflow-y-auto max-h-64 shadow-2xl">
                      {Object.entries(ASSET_GROUPS).map(([group, types]) => (
                        <div key={group}>
                          <div
                            className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#888] dark:text-[#555] bg-[#F9F9F8] dark:bg-white/[0.02] border-b border-[#F0F0F0] dark:border-white/[0.04]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {group}
                          </div>
                          {types.map((type) => (
                            <button
                              key={type}
                              onMouseDown={() => {
                                setAssetType(type);
                                setShowAssetTypeDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 text-[13px] border-b border-[#F4F4F4] dark:border-white/[0.03] last:border-b-0 hover:bg-[#F7FAF0] dark:hover:bg-white/[0.03] transition-colors ${assetType === type ? "text-[#86BC25] font-medium" : "text-[#333] dark:text-[#CCC]"}`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Address */}
            <div
              className="fu pra-field"
              style={{
                animationDelay: "80ms",
                position: "relative",
                zIndex: showSuggestions ? 300 : "auto",
              }}
            >
              <div ref={addressRef} className="relative">
                <label className="pra-label-enhanced">Street Address</label>
                <div className="relative flex items-center">
                  <MapPin
                    size={13}
                    className="absolute left-3 text-[#BBBBBB] dark:text-[#444] pointer-events-none"
                  />
                  <input
                    className="pra-input-enhanced"
                    style={{ paddingLeft: "28px" }}
                    placeholder="Start typing an address"
                    value={address}
                    onFocus={() => {
                      setActiveField("address");
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      setSelectedSuggestion(null);
                      fetchSuggestions(e.target.value);
                      setShowSuggestions(true);
                    }}
                  />
                  {loading && (
                    <Loader2
                      size={13}
                      className="absolute right-3 text-[#BBBBBB] dark:text-[#444] animate-spin pointer-events-none"
                    />
                  )}
                  {selectedSuggestion && !loading && (
                    <div className="absolute right-3 w-4 h-4 bg-[#86BC25] flex items-center justify-center">
                      <Check size={9} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
                {showSuggestions && suggestions.length > 0 && (
                  <div className="si absolute top-full left-0 right-0 z-[9999] mt-0.5 bg-white dark:bg-[#1A1A1A] border border-[#D8D8D8] dark:border-white/[0.10] shadow-2xl overflow-hidden">
                    {suggestions.map((s) => (
                      <button
                        key={`${s.lat}-${s.lon}`}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setSelectedSuggestion(s);
                          setAddress(s.display_name);
                          setSuggestions([]);
                          setShowSuggestions(false);
                        }}
                        className="w-full flex items-start gap-2.5 px-3.5 py-2.5 text-left border-b border-[#F0F0F0] dark:border-white/[0.05] last:border-b-0 hover:bg-[#F7FAF0] dark:hover:bg-white/[0.03] transition-colors"
                      >
                        <MapPin
                          size={12}
                          className="text-[#86BC25] mt-[3px] flex-shrink-0"
                        />
                        <span className="text-[13px] text-[#333] dark:text-[#CCC] leading-snug">
                          {s.display_name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Value + Currency */}
            <div className="fu" style={{ animationDelay: "160ms" }}>
              <div className="flex gap-2.5 items-end">
                <div className="flex-1 pra-field">
                  <label className="pra-label-enhanced">
                    Replacement Value
                  </label>
                  <div className="relative flex items-center">
                    <DollarSign
                      size={13}
                      className="absolute left-3 text-[#BBBBBB] dark:text-[#444] pointer-events-none"
                    />
                    <input
                      type="text"
                      inputMode="decimal"
                      className="pra-input-enhanced"
                      style={{ paddingLeft: "28px" }}
                      placeholder="0.00"
                      value={replDisplay}
                      onFocus={() => setActiveField("value")}
                      onBlur={() => setActiveField(null)}
                      onChange={(e) => handleValueChange(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex border border-[#D8D8D8] dark:border-white/[0.10] overflow-hidden mb-0.5 flex-shrink-0">
                  {(["NGN", "USD"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      className={`px-3.5 py-[10px] text-[11px] font-semibold tracking-[0.06em] transition-all duration-150 ${
                        currency === c
                          ? "bg-[#86BC25] text-white"
                          : "text-[#888] dark:text-[#666] hover:bg-[#F4F4F2] dark:hover:bg-white/[0.03]"
                      }`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {c === "NGN" ? "₦ NGN" : "$ USD"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Matrix Size + Exchange Rate */}
            <div
              className="fu grid grid-cols-1 sm:grid-cols-2 gap-3"
              style={{ animationDelay: "160ms" }}
            >
              <div className="pra-field">
                <label className="pra-label-enhanced">Risk Matrix Size</label>
                <div className="flex border border-[#D8D8D8] dark:border-white/[0.10] overflow-hidden">
                  {[3, 4, 5, 6].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMatrixSize(s)}
                      className={`flex-1 py-[10px] text-[11px] font-semibold tracking-[0.06em] transition-all duration-150 ${
                        matrixSize === s
                          ? "bg-[#86BC25] text-white"
                          : "text-[#888] dark:text-[#666] hover:bg-[#F4F4F2] dark:hover:bg-white/[0.03]"
                      }`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {s}&times;{s}
                    </button>
                  ))}
                </div>
              </div>
              {currency === "USD" && (
                <div className="pra-field">
                  <label className="pra-label-enhanced">
                    USD Exchange Rate
                  </label>
                  <div className="relative flex items-center">
                    <span
                      className="absolute left-3 text-[11px] text-[#BBBBBB] dark:text-[#444] pointer-events-none select-none"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      1 USD =
                    </span>
                    <input
                      type="number"
                      min={1}
                      className="pra-input-enhanced"
                      style={{ paddingLeft: "60px" }}
                      value={usdRate}
                      onChange={(e) => setUsdRate(Number(e.target.value) || 1)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sector + Subsector */}
            <div
              className="fu grid grid-cols-1 sm:grid-cols-2 gap-3"
              style={{ animationDelay: "200ms" }}
            >
              <div className="pra-field">
                <label className="pra-label-enhanced">Sector</label>
                <div className="relative">
                  <select
                    className="pra-input-enhanced appearance-none pr-8"
                    value={sectorId}
                    onFocus={() => setActiveField("sector")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => setSectorId(e.target.value)}
                  >
                    {Object.entries(SECTORS).map(([id, s]) => (
                      <option key={id} value={id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none"
                  />
                </div>
              </div>
              <div className="pra-field">
                <label className="pra-label-enhanced">Subsector</label>
                <div className="relative">
                  <select
                    className="pra-input-enhanced appearance-none pr-8"
                    value={subsector}
                    onFocus={() => setActiveField("subsector")}
                    onBlur={() => setActiveField(null)}
                    onChange={(e) => setSubsector(e.target.value)}
                  >
                    {subsectors.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={12}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="submit-btn mt-8 w-full flex items-center justify-center gap-2 bg-[#86BC25] text-white text-[13px] font-semibold py-3.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}
          >
            <span>ASSESS THIS ASSET</span>
            <ArrowRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
