import { useState, useEffect, useMemo } from "react";
import { Shield, Check, ChevronDown, ChevronUp } from "lucide-react";
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
    <div className="flex-1 flex bg-[#F4F4F2] dark:bg-[#0D0D0D] min-h-[calc(100vh-140px)]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.38s ease forwards; opacity: 0; }
      `}</style>

      {/* Left rail */}
      <div className="hidden lg:flex flex-col w-[300px] flex-shrink-0 border-r border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]">
        {/* Panel 1 – Header */}
        <div className="px-6 py-7 border-b border-[#EBEBEB] dark:border-white/[0.06]">
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

        {/* Panel 2 – RRF stat */}
        <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/[0.06]">
          <span
            className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] block mb-1"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            RRF ({mode})
          </span>
          <div className="text-[26px] font-semibold text-[#86BC25] leading-none">
            {(effectiveRrf * 100).toFixed(1)}%
          </div>
        </div>

        {/* Panel 3 – Checklist */}
        <div className="px-6 py-5 flex-1">
          <div className="space-y-1">
            {[
              { num: "01", label: "Mode Selection" },
              { num: "02", label: "SBRA / ALRA" },
              { num: "03", label: "Measure Inputs" },
              { num: "04", label: "RRF Calculation" },
            ].map((item, i) => {
              const done =
                i === 0
                  ? true
                  : i === 1
                    ? true
                    : i === 2
                      ? mode === "ALRA" && confirmed.size > 0
                      : effectiveRrf > 0;
              const active =
                !done &&
                (i === 2
                  ? mode === "ALRA"
                  : i === 3
                    ? effectiveRrf === 0
                    : false);
              return (
                <div
                  key={item.num}
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
                      <Check size={10} className="text-white" strokeWidth={3} />
                    ) : (
                      <span
                        className={`text-[9px] font-bold ${
                          active
                            ? "text-[#86BC25]"
                            : "text-[#CCC] dark:text-[#555]"
                        }`}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {item.num}
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
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 overflow-y-auto">
        <div className="max-w-[820px]">
          <div className="fu mb-7" style={{ animationDelay: "0ms" }}>
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

          {/* Mode toggle */}
          <div className="flex border border-[#D8D8D8] dark:border-white/[0.10] overflow-hidden mb-6">
            {(["SBRA", "ALRA"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-3 text-[13px] font-semibold transition-colors cursor-pointer border-none ${
                  mode === m
                    ? "bg-[#86BC25] text-white"
                    : "bg-white dark:bg-[#141414] text-[#888] dark:text-[#555] hover:bg-[#F4F4F2] dark:hover:bg-white/[0.03]"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {m === "SBRA"
                  ? "Sector Benchmark (SBRA)"
                  : "Actual Measures (ALRA)"}
              </button>
            ))}
          </div>

          {/* RRF summary */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/[0.07]">
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
            <div className="p-4 bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/[0.07]">
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

          {/* ALRA measures */}
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
                    className="text-[11px] px-2.5 py-1 border border-[#D8D8D8] dark:border-white/[0.12] text-[#888] dark:text-[#555] hover:border-[#999] transition-colors bg-transparent cursor-pointer"
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
                      className="text-[11px] px-2.5 py-1 border border-transparent text-[#CCC] dark:text-[#444] hover:text-[#888] hover:border-[#E5E5E5] dark:hover:border-white/[0.08] transition-colors bg-transparent cursor-pointer"
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
                      className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/[0.07] overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedCat(isExpanded ? null : cat)}
                        className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-transparent border-none cursor-pointer hover:bg-[#F9F9F8] dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-2 h-2 flex-shrink-0"
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
                            className="text-[#888] flex-shrink-0"
                          />
                        ) : (
                          <ChevronDown
                            size={13}
                            className="text-[#888] flex-shrink-0"
                          />
                        )}
                      </button>
                      <div
                        className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[2000px]" : "max-h-0"}`}
                      >
                        <div className="border-t border-[#F0F0F0] dark:border-white/[0.05]">
                          {measures.map((m) => {
                            const isOn = confirmed.has(m.id);
                            return (
                              <div
                                key={m.id}
                                onClick={() => toggle(m.id)}
                                className="flex items-center gap-3 px-4 py-3.5 border-b border-[#F0F0F0] dark:border-white/[0.04] last:border-b-0 cursor-pointer hover:bg-[#F9F9F8] dark:hover:bg-white/[0.02] transition-colors"
                              >
                                {/* Checkbox */}
                                <div
                                  className={`w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-colors ${
                                    isOn
                                      ? "bg-[#86BC25] border-[#86BC25]"
                                      : "bg-white dark:bg-[#1A1A1A] border-[#D8D8D8] dark:border-white/[0.15]"
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
                                  className={`text-[13px] font-semibold px-2 py-0.5 flex-shrink-0 border ${
                                    isOn
                                      ? "border-[#86BC25]/40 text-[#86BC25] bg-[#86BC25]/[0.06]"
                                      : "border-[#E5E5E5] dark:border-white/[0.08] text-[#888] dark:text-[#555]"
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

          {/* SBRA info */}
          {mode === "SBRA" && (
            <div className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/[0.07] p-8 text-center">
              <Shield size={32} className="text-[#86BC25] mx-auto mb-4" />
              <h2 className="text-[17px] font-semibold text-[#111] dark:text-[#F0F0F0] mb-2">
                Sector Benchmark Applied
              </h2>
              <p className="text-[15px] text-[#888] dark:text-[#666] mb-3 leading-relaxed">
                Based on your sector ({getSectorNameById(config.sectorId)}) and
                asset type ({asset.assetType}), SBRA resilience benchmarks are
                automatically applied for each hazard.
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
  );
}
