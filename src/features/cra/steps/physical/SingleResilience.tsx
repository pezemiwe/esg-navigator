import { useState, useEffect, useMemo } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import { Shield, ChevronDown, ChevronUp } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  RESILIENCE_MEASURES,
  ALL_21_RISKS,
} from "../../domain/physicalRisk/constants";
import {
  getSbraRrf,
  getSectorNameById,
} from "../../domain/physicalRisk/sbraTable";
import type { ResilienceMode } from "../../domain/physicalRisk/types";

const MEASURE_CATEGORIES = Array.from(
  new Set(RESILIENCE_MEASURES.map((m) => m.category)),
);

const CATEGORY_COLORS: Record<string, string> = {
  Flood: "#3B82F6",
  Electrical: "#F59E0B",
  Wind: "#8B5CF6",
  Heat: "#EF4444",
  Water: "#06B6D4",
  Fire: "#F97316",
  Seismic: "#6366F1",
  Geotechnical: "#84CC16",
  Coastal: "#0EA5E9",
  "Air Quality": "#A78BFA",
  Operational: "#14B8A6",
  Financial: "#EC4899",
};

export default function SingleResilience() {
  const canvasRef = useHeroCanvas();
  const {
    config,
    mappedAssets,
    screening,
    resilienceMode,
    assetResilience,
    setResilienceMode,
    setAssetResilience,
  } = usePhysicalRiskStore();
  const asset = mappedAssets[0];
  const assetScreening = screening.find((s) => s.assetId === asset?.id);

  const [mode, setMode] = useState<ResilienceMode>(resilienceMode || "SBRA");
  const [confirmed, setConfirmed] = useState<Set<string>>(() => {
    const existing = assetResilience.find((a) => a.assetId === asset?.id);
    return new Set(existing?.confirmedMeasures ?? []);
  });
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const sbraRrf = useMemo(() => {
    if (!asset) return 0;
    const sectorName = getSectorNameById(config.sectorId);
    const risks = assetScreening?.risks ?? [];
    if (risks.length === 0) return 0;
    const sum = risks.reduce(
      (acc, risk) =>
        acc + getSbraRrf(risk, asset.assetType, sectorName, config.subsector),
      0,
    );
    return sum / risks.length;
  }, [asset, config, assetScreening]);

  const alraRrf = useMemo(() => {
    if (confirmed.size === 0) return 0;
    let combined = 0;
    confirmed.forEach((id) => {
      const m = RESILIENCE_MEASURES.find((rm) => rm.id === id);
      if (m) combined = 1 - (1 - combined) * (1 - m.rrf);
    });
    return Math.min(combined, 0.85);
  }, [confirmed]);

  const effectiveRrf = mode === "SBRA" ? sbraRrf : alraRrf;

  useEffect(() => {
    setResilienceMode(mode);
    if (asset) {
      setAssetResilience([
        {
          assetId: asset.id,
          mode,
          confirmedMeasures: Array.from(confirmed),
          effectiveRrf,
        },
      ]);
    }
  }, [
    mode,
    confirmed,
    effectiveRrf,
    asset,
    setResilienceMode,
    setAssetResilience,
  ]);

  const toggle = (id: string) => {
    setConfirmed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const relevantHazards = useMemo(() => {
    const selectedRisks = new Set(assetScreening?.risks ?? []);
    const catToHazards: Record<string, string[]> = {
      Flood: [
        "River Flooding",
        "Flash Flooding",
        "Coastal Flooding",
        "Groundwater Flooding",
      ],
      Electrical: ["Thunderstorms & Lightning"],
      Wind: ["Tropical Cyclones", "Sandstorms / Harmattan"],
      Heat: ["Extreme Heat"],
      Water: ["Drought", "Water Scarcity"],
      Fire: ["Wildfire / Bushfire"],
      Seismic: ["Earthquakes"],
      Geotechnical: ["Landslides"],
      Coastal: [
        "Coastal Flooding",
        "Storm Surge",
        "Coastal & Riverbank Erosion",
        "Sea Level Rise",
        "Tsunamis",
      ],
      "Air Quality": ["Sandstorms / Harmattan", "Volcanic Eruptions"],
      Operational: ALL_21_RISKS.map((r) => r.risk),
      Financial: ALL_21_RISKS.map((r) => r.risk),
    };
    const result: Record<string, string[]> = {};
    for (const [cat, hazards] of Object.entries(catToHazards)) {
      result[cat] = hazards.filter((h) => selectedRisks.has(h));
    }
    return result;
  }, [assetScreening]);

  if (!asset) return null;

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] relative">
      <canvas
        ref={canvasRef}
        className="pointer-events-none z-0"
        style={{ position: "fixed", top: 0, left: 0 }}
      />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        .saf-fu { animation: fadeUp 0.38s ease forwards; opacity: 0; }
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
                  <Shield size={13} className="text-white" />
                </div>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Step 04 of 07 &mdash; Resilience Measures
                </span>
              </div>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                Define Resilience Profile
              </h1>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                Choose SBRA benchmark or enter actual ALRA measures to compute
                your RRF.
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
                  RRF ({mode})
                </div>
                <div className="text-[34px] font-bold text-[#86BC25] leading-none">
                  {(effectiveRrf * 100).toFixed(1)}
                  <span className="text-[20px]">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-0.75 bg-white/6">
          <div
            className="h-full bg-[#86BC25]"
            style={{
              width: `${effectiveRrf > 0 ? 100 : 50}%`,
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
              Step 04 / 07
            </div>
            <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
              Resilience Measures
            </h2>
            <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
              Choose SBRA benchmark or enter actual ALRA measures to reduce your
              risk.
            </p>
          </div>

          <div className="px-6 py-5 flex-1">
            <div className="p-4 rounded-xl bg-[#F8FAF3] dark:bg-[#86BC25]/4 border border-[#E8F0D8] dark:border-[#86BC25]/10">
              <div className="w-7 h-7 rounded-lg bg-[#86BC25]/10 flex items-center justify-center mb-3">
                <Shield size={13} className="text-[#86BC25]" />
              </div>
              <p className="text-[12px] font-semibold text-[#1A3C21] dark:text-[#86BC25] mb-1">
                About RRF
              </p>
              <p className="text-[11px] text-[#6B7B6E] dark:text-[#666] leading-relaxed">
                SBRA applies a fixed reduction factor while ALRA adjusts based on
                individual measures. Select measures to see their combined impact
                on your Resilience Reduction Factor.
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 overflow-y-auto">
          <div className="max-w-205">
            <div className="saf-fu mb-7" style={{ animationDelay: "0ms" }}>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#888] dark:text-[#555] mb-2"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Resilience assessment
              </p>
              <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
                Resilience Measures
              </h1>
            </div>

            <div className="relative flex rounded-lg border border-[#E2E2E0] dark:border-white/10 overflow-hidden mb-6">
              <div
                className="absolute top-0 bottom-0 bg-[#1A3C21] dark:bg-[#86BC25] rounded-[7px] z-0"
                style={{
                  width: "50%",
                  left: mode === "SBRA" ? "0%" : "50%",
                  transition:
                    "left 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }}
              />
              {(["SBRA", "ALRA"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`relative z-10 flex-1 py-3 text-[13px] font-semibold transition-colors duration-200 cursor-pointer border-none rounded-none first:rounded-l-[7px] last:rounded-r-[7px] bg-transparent ${
                    mode === m
                      ? "text-white"
                      : "text-[#777] dark:text-[#666]"
                  }`}
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {m === "SBRA"
                    ? "Sector Benchmark (SBRA)"
                    : "Actual Measures (ALRA)"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-4 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/7">
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider text-[#888] dark:text-[#555] mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Resilience Reduction Factor
                </p>
                <p className="text-[28px] font-semibold text-[#86BC25] leading-none">
                  {(effectiveRrf * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/7">
                <p
                  className="text-[11px] font-semibold uppercase tracking-wider text-[#888] dark:text-[#555] mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Mode
                </p>
                <p className="text-[18px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none">
                  {mode}
                </p>
                <p className="text-[13px] text-[#888] dark:text-[#555] mt-1">
                  {mode === "SBRA"
                    ? "Sector Default"
                    : `${confirmed.size} measure${confirmed.size !== 1 ? "s" : ""}`}
                </p>
              </div>
            </div>

            {mode === "ALRA" && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#AAA]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {confirmed.size} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setConfirmed(
                          new Set(RESILIENCE_MEASURES.map((m) => m.id)),
                        )
                      }
                      className="text-[11px] px-2.5 py-1 border border-[#D8D8D8] dark:border-white/12 text-[#888] dark:text-[#555] hover:border-[#999] transition-colors bg-transparent cursor-pointer"
                      style={{
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      SELECT ALL
                    </button>
                    {confirmed.size > 0 && (
                      <button
                        onClick={() => setConfirmed(new Set())}
                        className="text-[11px] px-2.5 py-1 border border-transparent text-[#CCC] dark:text-[#444] hover:text-[#888] hover:border-[#E5E5E5] dark:hover:border-white/8 transition-colors bg-transparent cursor-pointer"
                        style={{
                          fontFamily: "var(--font-mono)",
                          letterSpacing: "0.06em",
                        }}
                      >
                        CLEAR
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {MEASURE_CATEGORIES.map((cat) => {
                    const measures = RESILIENCE_MEASURES.filter(
                      (m) => m.category === cat,
                    );
                    const catColor = CATEGORY_COLORS[cat] ?? "#6B7280";
                    const isExpanded = expandedCat === cat;
                    const confirmedInCat = measures.filter((m) =>
                      confirmed.has(m.id),
                    ).length;
                    const catHazards = relevantHazards[cat] ?? [];
                    return (
                      <div
                        key={cat}
                        className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/7 overflow-hidden"
                      >
                        <button
                          onClick={() =>
                            setExpandedCat(isExpanded ? null : cat)
                          }
                          className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-transparent border-none cursor-pointer hover:bg-[#F9F9F8] dark:hover:bg-white/2 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-2 h-2 shrink-0"
                              style={{ backgroundColor: catColor }}
                            />
                            <span className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0]">
                              {cat}
                            </span>
                            {confirmedInCat > 0 && (
                              <span
                                className="text-[11px] font-semibold px-2 py-0.5 border"
                                style={{
                                  borderColor: `${catColor}40`,
                                  color: catColor,
                                  backgroundColor: `${catColor}10`,
                                }}
                              >
                                {confirmedInCat}
                              </span>
                            )}
                            {catHazards.length > 0 && (
                              <span className="text-[13px] text-[#888] dark:text-[#555]">
                                {catHazards.slice(0, 2).join(", ")}
                                {catHazards.length > 2
                                  ? ` +${catHazards.length - 2}`
                                  : ""}
                              </span>
                            )}
                          </div>
                          {isExpanded ? (
                            <ChevronUp
                              size={13}
                              className="text-[#888] shrink-0"
                            />
                          ) : (
                            <ChevronDown
                              size={13}
                              className="text-[#888] shrink-0"
                            />
                          )}
                        </button>
                        <div
                          className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-500" : "max-h-0"}`}
                        >
                          <div className="border-t border-[#F0F0F0] dark:border-white/5">
                            {measures.map((m) => {
                              const isOn = confirmed.has(m.id);
                              return (
                                <div
                                  key={m.id}
                                  onClick={() => toggle(m.id)}
                                  className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F0F0F0] dark:border-white/4 last:border-b-0 cursor-pointer hover:bg-[#F9F9F8] dark:hover:bg-white/2 transition-colors"
                                >
                                  <div
                                    className={`w-4 h-4 shrink-0 border flex items-center justify-center transition-colors ${
                                      isOn
                                        ? "bg-[#86BC25] border-[#86BC25]"
                                        : "bg-white dark:bg-[#1A1A1A] border-[#D8D8D8] dark:border-white/15"
                                    }`}
                                  >
                                    {isOn && (
                                      <svg
                                        width="9"
                                        height="7"
                                        viewBox="0 0 9 7"
                                        fill="none"
                                      >
                                        <path
                                          d="M1 3L3.5 5.5L8 1"
                                          stroke="white"
                                          strokeWidth="1.5"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-[15px] leading-snug ${isOn ? "font-semibold text-[#111] dark:text-[#F0F0F0]" : "text-[#333] dark:text-[#CCC]"}`}
                                    >
                                      {m.name}
                                    </p>
                                    <p className="text-[13px] text-[#888] dark:text-[#555] mt-0.5">
                                      {m.description}
                                    </p>
                                  </div>
                                  <span
                                    className={`text-[13px] font-semibold px-2 py-0.5 shrink-0 border ${
                                      isOn
                                        ? "border-[#86BC25]/40 text-[#86BC25] bg-[#86BC25]/6"
                                        : "border-[#E5E5E5] dark:border-white/8 text-[#888] dark:text-[#555]"
                                    }`}
                                    style={{ fontFamily: "var(--font-mono)" }}
                                  >
                                    -{(m.rrf * 100).toFixed(0)}%
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === "SBRA" && (
              <div className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/7 p-8 text-center">
                <Shield size={32} className="text-[#86BC25] mx-auto mb-4" />
                <h2 className="text-[17px] font-semibold text-[#111] dark:text-[#F0F0F0] mb-2">
                  Sector Benchmark Applied
                </h2>
                <p className="text-[15px] text-[#888] dark:text-[#666] mb-3 leading-relaxed">
                  Based on your sector ({getSectorNameById(config.sectorId)})
                  and asset type ({asset.assetType}), SBRA resilience benchmarks
                  are automatically applied for each hazard.
                </p>
                <p
                  className="text-[17px] font-semibold text-[#86BC25]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Avg. RRF: {(sbraRrf * 100).toFixed(1)}%
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
