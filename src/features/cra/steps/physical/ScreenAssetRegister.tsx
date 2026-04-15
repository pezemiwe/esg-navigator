import { useState, useCallback, useRef, useEffect } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  MapPin,
  ChevronDown,
  Trash2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { useCRADataStore } from "@/store/craStore";
import { batchGeocode } from "../../services/geocoding";
import { SECTORS } from "../../domain/physicalRisk/constants";
import type { MappedAsset } from "../../domain/physicalRisk/types";
import AssetMapView from "../../components/AssetMapView";

const VALID_CURRENCIES = new Set([
  "NGN",
  "USD",
  "GHS",
  "KES",
  "ZAR",
  "GBP",
  "EUR",
]);
const fmtVal = (value: number, currency?: string): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: VALID_CURRENCIES.has(currency ?? "")
      ? (currency as string)
      : "NGN",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);

const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  NGN: 1550, // Approximate rate
  GHS: 14.5,
  KES: 132,
  ZAR: 18.8,
  GBP: 0.78,
  EUR: 0.92,
};
const CURRENCIES = ["NGN", "USD", "GHS", "KES", "ZAR", "GBP", "EUR"];

export default function ScreenAssetRegister() {
  const canvasRef = useHeroCanvas();
  const {
    config,
    setConfig,
    mappedAssets,
    geocodeProgress,
    setMappedAssets,
    setGeocodeProgress,
    setActiveStep,
    setMode,
  } = usePhysicalRiskStore();
  const [, setFileName] = useState("");
  const [isGeocoding, setIsGeocoding] = useState(false);
  const geocodePendingRef = useRef(false);

  const sectorOptions = Object.entries(SECTORS).map(([id, sec]) => ({
    id,
    name: sec.name,
  }));
  const subsectorOptions =
    config.sectorId && SECTORS[config.sectorId]
      ? SECTORS[config.sectorId].subsectors
      : [];

  const { assets: craAssets, companyProfile: craCompanyProfile } =
    useCRADataStore();
  const hasCRAData = Object.values(craAssets).some((d) => d.data.length > 0);

  const [showCRAModal, setShowCRAModal] = useState(false);
  const [selectedCRATypes, setSelectedCRATypes] = useState<string[]>([]);

  // Auto-fill from CRA company profile
  useEffect(() => {
    const updates: Partial<typeof config> = {};
    if (craCompanyProfile.orgName && !config.companyName) {
      updates.companyName = craCompanyProfile.orgName;
    }
    if (craCompanyProfile.country && !config.country) {
      updates.country = craCompanyProfile.country;
    }
    if (craCompanyProfile.currency && !config.currency) {
      updates.currency = craCompanyProfile.currency;
      if (EXCHANGE_RATES[craCompanyProfile.currency]) {
        updates.usdRate = EXCHANGE_RATES[craCompanyProfile.currency];
      }
    }
    // Map company industry to sector if not already set
    if (craCompanyProfile.industry && !config.sectorId) {
      const match = sectorOptions.find(
        (s) =>
          s.name.toLowerCase() === craCompanyProfile.industry.toLowerCase() ||
          s.id.toLowerCase() === craCompanyProfile.industry.toLowerCase(),
      );
      if (match) updates.sectorId = match.id;
    }
    if (Object.keys(updates).length > 0) setConfig(updates);
  }, [
    craCompanyProfile,
    config.companyName,
    config.country,
    config.currency,
    config.sectorId,
    setConfig,
    sectorOptions,
  ]);
  const autoGeocode = useCallback(
    async (assets: MappedAsset[]) => {
      const needsGeo = assets.some(
        (a) =>
          a.latitude === 0 && a.longitude === 0 && a.region.trim().length > 0,
      );
      if (!needsGeo) return;
      setIsGeocoding(true);
      setGeocodeProgress(0);
      try {
        const geoResults = await batchGeocode(
          assets.map((a) => ({
            address: a.region,
            lat: a.latitude,
            lon: a.longitude,
          })),
          (done, total) => setGeocodeProgress(Math.round((done / total) * 100)),
        );
        if (geoResults.size > 0) {
          const updated = assets.map((a, idx) => {
            const geo = geoResults.get(idx);
            if (geo) return { ...a, latitude: geo.lat, longitude: geo.lon };
            return a;
          });
          setMappedAssets(updated);
        }
      } catch {
        // geocoding errors are non-fatal; progress bar handles feedback
      }
      setIsGeocoding(false);
      setGeocodeProgress(100);
    },
    [setMappedAssets, setGeocodeProgress],
  );

  const importFromCRAData = useCallback(
    (types?: string[]) => {
      const allAssets: MappedAsset[] = [];
      let idx = 0;
      Object.entries(craAssets).forEach(([assetType, typeData]) => {
        if (!typeData.data.length) return;
        if (types && types.length > 0 && !types.includes(assetType)) return;
        typeData.data.forEach((asset) => {
          const rawValue = (asset.outstandingBalance as number) || 0;
          const assetCurrency = (
            (asset.currency as string) || config.currency
          ).toUpperCase();
          const valueLocal =
            assetCurrency === "USD" ? rawValue * config.usdRate : rawValue;
          allAssets.push({
            id: asset.id || `cra_asset_${idx}`,
            name: asset.borrowerName || asset.id || `Asset ${idx + 1}`,
            assetType:
              (asset.asset_type as string) ||
              assetType.charAt(0).toUpperCase() +
                assetType.slice(1).replace(/_/g, " "),
            value: valueLocal,
            latitude: (asset.latitude as number) || 0,
            longitude: (asset.longitude as number) || 0,
            region: asset.region || "",
            sector: asset.sector || "",
            annualRevenue: asset.annual_revenue
              ? Number(asset.annual_revenue) || undefined
              : undefined,
            annualOpex: asset.annual_opex
              ? Number(asset.annual_opex) || undefined
              : undefined,
          });
          idx++;
        });
      });
      if (allAssets.length === 0) return;
      setMappedAssets(allAssets);
      setFileName(`CRA data (${allAssets.length} assets)`);
      autoGeocode(allAssets);
    },
    [craAssets, config.currency, config.usdRate, setMappedAssets, autoGeocode],
  );

  useEffect(() => {
    if (geocodePendingRef.current && mappedAssets.length > 0) {
      geocodePendingRef.current = false;
      const assets = mappedAssets;
      queueMicrotask(() => autoGeocode(assets));
    }
  }, [mappedAssets, autoGeocode]);

  const needsGeocode = mappedAssets.some(
    (a) => a.latitude === 0 && a.longitude === 0 && a.region.trim().length > 0,
  );
  const totalValue = mappedAssets.reduce((s, a) => s + a.value, 0);
  const geocodedCount = mappedAssets.filter(
    (a) => a.latitude !== 0 || a.longitude !== 0,
  ).length;

  const RAIL_STEPS = [
    {
      num: "01",
      label: "Configuration",
      done: !!(config.companyName && config.country),
    },
    { num: "02", label: "CSV Upload", done: mappedAssets.length > 0 },
    { num: "03", label: "Geocoding", done: geocodedCount > 0 },
    {
      num: "04",
      label: "Preview",
      done: mappedAssets.length > 0 && !isGeocoding,
    },
  ];
  const completedCount = RAIL_STEPS.filter((s) => s.done).length;
  const progressPct = (completedCount / 4) * 100;

  return (
    <>
      <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-0"
          style={{ position: "fixed", top: 0, left: 0 }}
        />
        <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes checkPop {
          0%   { transform: scale(0) rotate(-10deg); opacity: 0; }
          60%  { transform: scale(1.2) rotate(3deg); opacity: 1; }
          100% { transform: scale(1)   rotate(0deg); opacity: 1; }
        }
        @keyframes dotBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.25; }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(134,188,37,0); }
          50% { box-shadow: 0 0 0 5px rgba(134,188,37,0.12); }
        }
        .fu, .saf-fu   { animation: fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) forwards; opacity: 0; }
        .check { animation: checkPop 0.32s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .blink { animation: dotBlink 2s ease-in-out infinite; }

        .saf-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #8A8A88;
          margin-bottom: 8px;
          font-family: var(--font-mono);
          transition: color 0.18s ease;
        }
        .saf-field:focus-within .saf-label { color: #86BC25; }

        .saf-input {
          width: 100%;
          background: white;
          border: 1.5px solid #E2E2E0;
          padding: 12px 14px;
          font-size: 15px;
          color: #1A1A1A;
          outline: none;
          border-radius: 8px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .dark .saf-input {
          background: #161616;
          border-color: rgba(255,255,255,0.08);
          color: #F0F0F0;
        }
        .saf-input:focus {
          border-color: #86BC25;
          box-shadow: 0 0 0 3px rgba(134,188,37,0.10), 0 1px 3px rgba(0,0,0,0.06);
          background: #FEFFFE;
        }
        .dark .saf-input:focus { background: #1A1A1A; }
        .saf-input::placeholder { color: #B0B0AE; }
        .dark .saf-input::placeholder { color: #444; }

        .saf-field { position: relative; transition: transform 0.18s ease; }
        .saf-field:focus-within { transform: translateY(-1px); }

        .saf-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #E8E8E6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .dark .saf-card {
          background: #141414;
          border-color: rgba(255,255,255,0.06);
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        .saf-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
        }

        .submit-btn {
          transition: transform 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
          animation: pulseGreen 3.5s ease-in-out infinite;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(26,60,33,0.25);
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(26,60,33,0.15);
        }
      `}</style>
        <div className="relative z-10 flex-1 flex flex-col">
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
                background:
                  "radial-gradient(circle, #86BC25 0%, transparent 70%)",
                animation: "heroGlow 6s ease-in-out infinite",
              }}
            />
            <div className="relative px-6 md:px-10 py-6 md:py-8">
              <div className="max-w-300 mx-auto">
                <button
                  onClick={() => setMode(null)}
                  className="flex items-center gap-1.5 text-white/50 hover:text-white mb-6 text-[11px] font-semibold uppercase tracking-widest transition-colors cursor-pointer border-none bg-transparent"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <ArrowLeft size={12} /> BACK TO MODE SELECTION
                </button>
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                  <div className="saf-fu" style={{ animationDelay: "0ms" }}>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-[#86BC25] flex items-center justify-center">
                        <Upload size={13} className="text-white" />
                      </div>
                      <span
                        className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Step 01 of 06 &mdash; Asset Register
                      </span>
                    </div>
                    <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                      Portfolio Asset Register
                    </h1>
                    <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                      Upload your portfolio CSV and configure assessment
                      settings.
                    </p>
                  </div>
                  <div
                    className="saf-fu flex items-center gap-5 shrink-0"
                    style={{ animationDelay: "100ms" }}
                  >
                    <div className="text-right">
                      <div
                        className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-1"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Setup
                      </div>
                      <div className="text-[30px] font-bold text-white leading-none">
                        {Math.round(progressPct)}
                        <span className="text-[18px] text-white/40">%</span>
                      </div>
                    </div>
                    <svg
                      viewBox="0 0 40 40"
                      className="w-14 h-14 -rotate-90"
                      style={{
                        filter: "drop-shadow(0 0 6px rgba(134,188,37,0.3))",
                      }}
                    >
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="3"
                      />
                      <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="#86BC25"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 16}`}
                        strokeDashoffset={`${2 * Math.PI * 16 * (1 - progressPct / 100)}`}
                        style={{
                          transition:
                            "stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                        }}
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-0.75 bg-white/6">
              <div
                className="h-full bg-[#86BC25]"
                style={{
                  width: `${progressPct}%`,
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
                  Step 01 / 07
                </div>
                <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
                  Asset Register
                </h2>
                <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
                  Upload your portfolio CSV and configure assessment settings.
                </p>
              </div>

              <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/6">
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
                    {completedCount}/4
                  </span>
                </div>
                <div className="h-0.75 bg-[#F0F0EE] dark:bg-white/6 rounded-full overflow-hidden">
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
                <div className="space-y-0.5">
                  {RAIL_STEPS.map((step, i) => {
                    const active = !step.done && completedCount === i;
                    return (
                      <div
                        key={step.num}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                          active ? "bg-[#F3F9E8] dark:bg-[#86BC25]/6" : ""
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 ${
                            step.done
                              ? "bg-[#86BC25]"
                              : active
                                ? "bg-[#86BC25]/10 border-[1.5px] border-[#86BC25]"
                                : "bg-[#F4F4F2] dark:bg-white/4 border border-[#E2E2E0] dark:border-white/8"
                          }`}
                        >
                          {step.done ? (
                            <Check
                              size={11}
                              className="text-white saf-check"
                              strokeWidth={3}
                            />
                          ) : (
                            <span
                              className={`text-[9px] font-bold ${
                                active
                                  ? "text-[#86BC25]"
                                  : "text-[#C0C0BE] dark:text-[#555]"
                              }`}
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {step.num}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-[14px] transition-colors duration-200 ${
                            step.done
                              ? "text-[#86BC25] font-semibold"
                              : active
                                ? "text-[#1A1A1A] dark:text-[#EEE] font-semibold"
                                : "text-[#A0A09E] dark:text-[#555]"
                          }`}
                        >
                          {step.label}
                        </span>
                        {active && (
                          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#86BC25] saf-blink" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {mappedAssets.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-[#E5E5E5] dark:border-white/6 space-y-4">
                    {[
                      {
                        label: "Assets",
                        value: String(mappedAssets.length),
                        mono: true,
                      },
                      {
                        label: "Total Value",
                        value: fmtVal(totalValue, config.currency),
                        green: true,
                      },
                      {
                        label: "Geocoded",
                        value: `${geocodedCount} / ${mappedAssets.length}`,
                        mono: true,
                      },
                    ].map((stat) => (
                      <div key={stat.label}>
                        <div
                          className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAA] mb-1"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {stat.label}
                        </div>
                        <div
                          className={`text-[18px] font-semibold leading-none ${
                            stat.green
                              ? "text-[#86BC25]"
                              : "text-[#111] dark:text-[#F0F0F0]"
                          }`}
                          style={
                            stat.mono ? { fontFamily: "var(--font-mono)" } : {}
                          }
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 overflow-y-auto">
              <div className="max-w-205">
                <div className="fu mb-7" style={{ animationDelay: "0ms" }}>
                  <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
                    Configure your asset portfolio
                  </h1>
                </div>

                <div className="space-y-8">
                  <div
                    className="saf-card saf-fu"
                    style={{ animationDelay: "40ms" }}
                  >
                    <div className="px-6 py-4 border-b border-[#F0F0EE] dark:border-white/4 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#1A3C21]/6 dark:bg-white/4 flex items-center justify-center">
                        <span
                          className="text-[10px] font-bold text-[#1A3C21] dark:text-[#86BC25]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          01
                        </span>
                      </div>
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#1A1A1A] dark:text-[#F0F0F0] leading-tight">
                          Assessment Configuration
                        </h3>
                        <p className="text-[13px] text-[#999] dark:text-[#555]">
                          Set up the core parameters for the portfolio
                          assessment.
                        </p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="saf-field">
                          <label className="saf-label">Company Name</label>
                          <input
                            className="saf-input"
                            placeholder="e.g. Agricultural Bank PLC"
                            value={config.companyName}
                            onChange={(e) =>
                              setConfig({ companyName: e.target.value })
                            }
                          />
                        </div>
                        <div className="saf-field">
                          <label className="saf-label">Country</label>
                          <input
                            className="saf-input"
                            placeholder="e.g. Nigeria"
                            value={config.country}
                            onChange={(e) =>
                              setConfig({ country: e.target.value })
                            }
                          />
                        </div>
                        <div className="saf-field">
                          <label className="saf-label">Sector</label>
                          <div className="relative">
                            <select
                              className="saf-input appearance-none pr-8"
                              value={config.sectorId}
                              onChange={(e) =>
                                setConfig({
                                  sectorId: e.target.value,
                                  subsector: "",
                                })
                              }
                            >
                              <option value="">� Select Sector �</option>
                              {sectorOptions.map((s) => (
                                <option key={s.id} value={s.id}>
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
                        <div className="saf-field">
                          <label className="saf-label">Subsector</label>
                          <div className="relative">
                            <select
                              className="saf-input appearance-none pr-8"
                              value={config.subsector}
                              onChange={(e) =>
                                setConfig({ subsector: e.target.value })
                              }
                            >
                              <option value="">� Select Subsector �</option>
                              {subsectorOptions.map((s) => (
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
                        <div className="saf-field">
                          <label className="saf-label">Currency</label>
                          <div className="relative">
                            <select
                              className="saf-input appearance-none pr-8"
                              value={config.currency}
                              onChange={(e) => {
                                const newCurrency = e.target.value;
                                setConfig({
                                  currency: newCurrency,
                                  usdRate: EXCHANGE_RATES[newCurrency] || 1550,
                                });
                              }}
                            >
                              {CURRENCIES.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                            <ChevronDown
                              size={12}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#BBBBBB] pointer-events-none"
                            />
                          </div>
                        </div>
                        <div className="saf-field">
                          <label className="saf-label">USD Exchange Rate</label>
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
                              className="saf-input"
                              style={{ paddingLeft: "60px" }}
                              value={config.usdRate}
                              onChange={(e) =>
                                setConfig({
                                  usdRate: Number(e.target.value) || 1,
                                })
                              }
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="saf-label">Risk Matrix Size</label>
                          <div className="relative flex rounded-lg border border-[#E2E2E0] dark:border-white/8 overflow-hidden w-full sm:w-1/2">
                            <div
                              className="absolute top-0 bottom-0 bg-[#1A3C21] dark:bg-[#86BC25] rounded-[7px] z-0"
                              style={{
                                width: "25%",
                                left: `${[3, 4, 5, 6].indexOf(config.matrixSize || 0) * 25}%`,
                                opacity: !config.matrixSize ? 0 : 1,
                                transition:
                                  "left 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease",
                              }}
                            />
                            {[3, 4, 5, 6].map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => setConfig({ matrixSize: s })}
                                className={`relative z-10 flex-1 py-2.75 text-[13px] font-bold tracking-[0.04em] rounded-none first:rounded-l-[7px] last:rounded-r-[7px] transition-colors duration-200 ${
                                  config.matrixSize === s
                                    ? "text-white hover:bg-transparent!"
                                    : "text-[#777] dark:text-[#666]"
                                }`}
                                style={{ fontFamily: "var(--font-mono)" }}
                              >
                                {s}&times;{s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className="saf-card saf-fu"
                    style={{ animationDelay: "80ms" }}
                  >
                    <div className="px-6 py-4 border-b border-[#F0F0EE] dark:border-white/4 flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#1A3C21]/6 dark:bg-white/4 flex items-center justify-center">
                        <span
                          className="text-[10px] font-bold text-[#1A3C21] dark:text-[#86BC25]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          02
                        </span>
                      </div>
                      <div>
                        <h3 className="text-[16px] font-semibold text-[#1A1A1A] dark:text-[#F0F0F0] leading-tight">
                          Asset Register Upload
                        </h3>
                        <p className="text-[13px] text-[#999] dark:text-[#555]">
                          Upload a CSV containing your portfolio data.
                        </p>
                      </div>
                    </div>
                    <div className="p-6 md:p-8">
                      {hasCRAData ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4">
                          <div className="w-14 h-14 flex items-center justify-center border border-[#86BC25]/40 bg-[#86BC25]/8">
                            <FileSpreadsheet
                              size={22}
                              className="text-[#86BC25]"
                            />
                          </div>
                          <div className="text-center">
                            <p className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0]">
                              Portfolio data available from CRA upload
                            </p>
                            <p className="text-[13px] text-[#888] dark:text-[#666] mt-1">
                              Select which asset types to include in this
                              assessment
                            </p>
                          </div>
                          {mappedAssets.length > 0 && (
                            <div className="flex items-center gap-2">
                              <CheckCircle
                                size={14}
                                className="text-[#86BC25]"
                              />
                              <span
                                className="text-[13px] font-medium text-[#86BC25]"
                                style={{ fontFamily: "var(--font-mono)" }}
                              >
                                {mappedAssets.length} assets loaded
                              </span>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedCRATypes([]);
                              setShowCRAModal(true);
                            }}
                            className="px-6 py-2.5 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.06em] hover:bg-[#78AA1F] transition-colors"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            Select from CRA Data →
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
                          <div className="w-14 h-14 flex items-center justify-center border border-[#E5E5E5] dark:border-white/8">
                            <Upload size={22} className="text-[#BBBBBB]" />
                          </div>
                          <p className="text-[14px] text-[#888] dark:text-[#666]">
                            No CRA data uploaded yet.
                            <br />
                            Upload data in the{" "}
                            <span className="text-[#86BC25] font-medium">
                              Asset Portfolio Data Upload
                            </span>{" "}
                            step first.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {isGeocoding && (
                    <div className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/7 p-5 animate-fade-up">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <Loader2
                            size={14}
                            className="text-[#86BC25] animate-spin"
                          />
                          <span className="text-[17px] font-medium text-[#111] dark:text-[#F0F0F0]">
                            Auto-geocoding addresses&hellip;
                          </span>
                        </div>
                        <span
                          className="text-[17px] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {geocodeProgress}%
                        </span>
                      </div>
                      <div className="h-0.75 bg-[#ECECEC] dark:bg-white/6 overflow-hidden rounded-full">
                        <div
                          className="h-full bg-[#86BC25] transition-[width] duration-300 rounded-full"
                          style={{ width: `${geocodeProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  {!isGeocoding && mappedAssets.length > 0 && needsGeocode && (
                    <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 animate-fade-up">
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-amber-600 shrink-0" />
                        <span className="text-[15px] text-amber-700 dark:text-amber-400">
                          {
                            mappedAssets.filter(
                              (a) => a.latitude === 0 && a.longitude === 0,
                            ).length
                          }{" "}
                          assets still missing coordinates
                        </span>
                      </div>
                      <button
                        onClick={() => autoGeocode(mappedAssets)}
                        className="text-[15px] font-semibold text-amber-700 dark:text-amber-400 hover:text-amber-900 transition-colors"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        RETRY GEOCODING{" "}
                        <ArrowRight size={10} className="inline" />
                      </button>
                    </div>
                  )}
                  {mappedAssets.length > 0 && (
                    <div className="fu" style={{ animationDelay: "40ms" }}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-0.5 w-5 bg-[#86BC25] shrink-0" />
                          <span
                            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111] dark:text-[#F0F0F0]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            Preview ({mappedAssets.length} assets)
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            setMappedAssets([]);
                            setFileName("");
                            setGeocodeProgress(0);
                          }}
                          className="flex items-center gap-1.5 text-[15px] font-medium text-red-500 hover:text-red-600 transition-colors"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          <Trash2 size={11} />
                          CLEAR ALL
                        </button>
                      </div>
                      <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-white/7 overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[#F9F9F8] dark:bg-white/3 border-b-2 border-[#E5E5E5] dark:border-white/8">
                                <th className="pra-th">#</th>
                                <th className="pra-th">Asset Name</th>
                                <th className="pra-th">Type</th>
                                <th className="pra-th hidden sm:table-cell">
                                  Region
                                </th>
                                <th className="pra-th text-right">Value</th>
                                <th className="pra-th text-center">Geo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {mappedAssets.slice(0, 12).map((asset, idx) => (
                                <tr
                                  key={asset.id}
                                  className="pra-tr border-b border-[#F0F0F0] dark:border-white/4"
                                >
                                  <td
                                    className="pra-td text-[#CCC] dark:text-[#555]"
                                    style={{ fontFamily: "var(--font-mono)" }}
                                  >
                                    {idx + 1}
                                  </td>
                                  <td className="pra-td font-medium max-w-40 truncate">
                                    {asset.name}
                                  </td>
                                  <td className="pra-td text-[#888] dark:text-[#666] max-w-35 truncate">
                                    {asset.assetType}
                                  </td>
                                  <td className="pra-td hidden sm:table-cell text-[#888] dark:text-[#666] max-w-45 truncate">
                                    {asset.region}
                                  </td>
                                  <td
                                    className="pra-td text-right"
                                    style={{ fontFamily: "var(--font-mono)" }}
                                  >
                                    {fmtVal(asset.value, config.currency)}
                                  </td>
                                  <td className="pra-td text-center">
                                    {asset.latitude !== 0 ? (
                                      <span className="inline-block w-2 h-2 rounded-full bg-[#86BC25]" />
                                    ) : (
                                      <span className="inline-block w-2 h-2 rounded-full bg-[#D8D8D8] dark:bg-white/15" />
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            {mappedAssets.length > 12 && (
                              <tfoot>
                                <tr className="bg-[#F9F9F8] dark:bg-white/2">
                                  <td
                                    colSpan={6}
                                    className="px-4 py-2.5 text-[15px] text-[#888] dark:text-[#666]"
                                    style={{ fontFamily: "var(--font-mono)" }}
                                  >
                                    +{mappedAssets.length - 12} more assets not
                                    shown
                                  </td>
                                </tr>
                              </tfoot>
                            )}
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                  {!isGeocoding && geocodedCount > 0 && (
                    <div className="fu" style={{ animationDelay: "80ms" }}>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-0.5 w-5 bg-[#86BC25] shrink-0" />
                        <span
                          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#111] dark:text-[#F0F0F0]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Asset Locations ({geocodedCount} geocoded)
                        </span>
                      </div>
                      <div className="bg-white dark:bg-[#111111] border border-[#E5E5E5] dark:border-white/7 overflow-hidden">
                        <AssetMapView
                          pins={mappedAssets
                            .filter(
                              (a) => a.latitude !== 0 || a.longitude !== 0,
                            )
                            .map((a) => ({
                              lat: a.latitude,
                              lon: a.longitude,
                              label: a.name,
                              detail: a.assetType,
                            }))}
                          height={340}
                        />
                      </div>
                    </div>
                  )}
                  <div className="fu mt-10" style={{ animationDelay: "120ms" }}>
                    <button
                      onClick={() => setActiveStep(1)}
                      disabled={progressPct !== 100}
                      className="w-full flex items-center justify-center gap-3 rounded-xl text-[15px] font-bold py-4 disabled:opacity-25 disabled:cursor-not-allowed transition-all"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.06em",
                        background:
                          progressPct === 100
                            ? "linear-gradient(135deg, #1A3C21 0%, #2D5A35 100%)"
                            : "#1A3C21",
                        color: "white",
                        boxShadow:
                          progressPct === 100
                            ? "0 8px 25px rgba(26,60,33,0.25)"
                            : "none",
                      }}
                    >
                      <span>ASSESS PORTFOLIO</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════
          CRA DATA SELECTION MODAL
      ═══════════════════════════════ */}
      {showCRAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setShowCRAModal(false)}
          />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-[#1A1A1A] border border-[#E5E5E5] dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-[#E8E8E8] dark:border-white/8">
              <h3 className="text-[15px] font-bold text-[#111] dark:text-white">
                Select Asset Data
              </h3>
              <p className="text-[12px] text-[#888] dark:text-[#666] mt-0.5">
                Choose which uploaded asset types to include in this assessment
              </p>
            </div>
            {/* Asset list */}
            <div className="px-6 py-4 space-y-2 max-h-80 overflow-y-auto">
              {Object.entries(craAssets)
                .filter(([, d]) => d.data.length > 0)
                .map(([assetTypeId, typeData]) => {
                  const label = assetTypeId
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (c) => c.toUpperCase());
                  const checked = selectedCRATypes.includes(assetTypeId);
                  return (
                    <label
                      key={assetTypeId}
                      className={`flex items-center gap-3 p-3 cursor-pointer border transition-colors ${
                        checked
                          ? "border-[#86BC25] bg-[#86BC25]/5 dark:bg-[#86BC25]/10"
                          : "border-[#E8E8E8] dark:border-white/8 hover:border-[#86BC25]/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedCRATypes((prev) =>
                            checked
                              ? prev.filter((t) => t !== assetTypeId)
                              : [...prev, assetTypeId],
                          )
                        }
                        className="accent-[#86BC25] w-4 h-4 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#111] dark:text-white truncate">
                          {label}
                        </p>
                        {typeData.fileName && (
                          <p className="text-[11px] text-[#888] dark:text-[#666] truncate">
                            {typeData.fileName}
                          </p>
                        )}
                      </div>
                      <span
                        className="shrink-0 text-[11px] font-bold text-[#86BC25] tabular-nums"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {typeData.rowCount ?? typeData.data.length} records
                      </span>
                    </label>
                  );
                })}
            </div>
            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E8E8E8] dark:border-white/8 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowCRAModal(false)}
                className="px-4 py-2 text-[12px] font-semibold text-[#555] dark:text-[#AAA] border border-[#D8D8D8] dark:border-white/12 hover:border-[#AAA] transition-colors"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                CANCEL
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCRATypes(
                      Object.entries(craAssets)
                        .filter(([, d]) => d.data.length > 0)
                        .map(([id]) => id),
                    )
                  }
                  className="text-[11px] font-semibold text-[#86BC25] hover:text-[#78AA1F] transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  SELECT ALL
                </button>
                <button
                  type="button"
                  disabled={selectedCRATypes.length === 0}
                  onClick={() => {
                    importFromCRAData(selectedCRATypes);
                    setShowCRAModal(false);
                  }}
                  className="px-5 py-2 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.06em] hover:bg-[#78AA1F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  IMPORT SELECTED
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
