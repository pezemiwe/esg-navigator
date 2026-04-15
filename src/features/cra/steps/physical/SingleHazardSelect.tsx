import { useState, useEffect, useMemo } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import { Check, CheckCircle, Zap } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { ALL_21_RISKS } from "../../domain/physicalRisk/constants";
import { suggestRisksForAsset } from "../../domain/physicalRisk/engine";
import type { RiskCategory } from "../../domain/physicalRisk/types";

const CATEGORY_META: Record<RiskCategory, { color: string; label: string }> = {
  Meteorological: { color: "#F59E0B", label: "Meteorological" },
  Hydrological: { color: "#3B82F6", label: "Hydrological" },
  Climatological: { color: "#10B981", label: "Climatological" },
  Geophysical: { color: "#8B5CF6", label: "Geophysical" },
};

const CATEGORIES: RiskCategory[] = [
  "Meteorological",
  "Hydrological",
  "Climatological",
  "Geophysical",
];

export default function SingleHazardSelect() {
  const canvasRef = useHeroCanvas();
  const {
    mappedAssets,
    geoConfidence,
    screening,
    setScreening,
    setIdentifiedRisks,
  } = usePhysicalRiskStore();
  const asset = mappedAssets[0];

  const [selected, setSelected] = useState<Set<string>>(() => {
    const existing = screening.find((s) => s.assetId === asset?.id);
    if (existing?.risks?.length) return new Set(existing.risks);
    if (asset) {
      return new Set(
        suggestRisksForAsset(
          asset.latitude,
          asset.longitude,
          geoConfidence?.elevation ?? 0,
        ),
      );
    }
    return new Set();
  });

  const recommended = useMemo(() => {
    if (!asset) return new Set<string>();
    return new Set(
      suggestRisksForAsset(
        asset.latitude,
        asset.longitude,
        geoConfidence?.elevation ?? 0,
      ),
    );
  }, [asset, geoConfidence]);

  const disabled = useMemo(() => {
    const d = new Set<string>();
    if (geoConfidence) {
      if (geoConfidence.elevation > 300) {
        d.add("Coastal Flooding");
        d.add("Storm Surge");
        d.add("Sea Level Rise");
      }
      if (!geoConfidence.isCoastal) {
        d.add("Tsunamis");
        d.add("Coastal & Riverbank Erosion");
      }
    }
    return d;
  }, [geoConfidence]);

  useEffect(() => {
    if (!asset) return;
    const risks = Array.from(selected);
    setScreening([{ assetId: asset.id, assetName: asset.name, risks }]);
    setIdentifiedRisks(risks);
  }, [selected, asset, setScreening, setIdentifiedRisks]);

  const toggle = (risk: string) => {
    if (disabled.has(risk)) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(risk)) next.delete(risk);
      else next.add(risk);
      return next;
    });
  };

  const selectAll = () =>
    setSelected(
      new Set(
        ALL_21_RISKS.filter((r) => !disabled.has(r.risk)).map((r) => r.risk),
      ),
    );
  const selectRecommended = () => {
    const rec = new Set(recommended);
    disabled.forEach((d) => rec.delete(d));
    setSelected(rec);
  };

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
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
                  <Zap size={13} className="text-white" />
                </div>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Step 03 of 07 &mdash; Hazard Selection
                </span>
              </div>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                Select Climate Hazards
              </h1>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                Choose which hazards apply to this asset before scoring begins.
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
                  Selected
                </div>
                <div className="text-[30px] font-bold text-white leading-none">
                  {selected.size}
                  <span className="text-[18px] text-white/40">
                    /{ALL_21_RISKS.length}
                  </span>
                </div>
              </div>
              <svg
                viewBox="0 0 40 40"
                className="w-14 h-14 -rotate-90"
                style={{ filter: "drop-shadow(0 0 6px rgba(134,188,37,0.3))" }}
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
                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - selected.size / ALL_21_RISKS.length)}`}
                  style={{
                    transition:
                      "stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                  }}
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="h-0.75 bg-white/6">
          <div
            className="h-full bg-[#86BC25]"
            style={{
              width: `${Math.round((selected.size / ALL_21_RISKS.length) * 100)}%`,
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
              Step 03 / 07
            </div>
            <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
              Hazard Selection
            </h2>
            <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
              Choose climate hazards to screen against this asset&#39;s
              location.
            </p>
          </div>

          <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/6">
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[10px] uppercase tracking-[0.12em] text-[#AAA]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Selected
              </span>
              <span
                className="text-[11px] font-bold text-[#86BC25]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {selected.size} / {ALL_21_RISKS.length}
              </span>
            </div>
            <div className="h-0.75 bg-[#F0F0EE] dark:bg-white/6 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#86BC25] rounded-full transition-all duration-500"
                style={{
                  width: `${(selected.size / ALL_21_RISKS.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="px-6 py-5 flex-1 flex flex-col">
            <div className="space-y-3 mb-6">
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                const count = ALL_21_RISKS.filter(
                  (r) => r.category === cat && selected.has(r.risk),
                ).length;
                const total = ALL_21_RISKS.filter(
                  (r) => r.category === cat,
                ).length;
                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span
                          className="text-[11px] font-semibold uppercase tracking-widest text-[#888] dark:text-[#555]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {cat.slice(0, 6)}
                        </span>
                      </div>
                      <span
                        className="text-[11px] font-bold"
                        style={{
                          color: meta.color,
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {count}/{total}
                      </span>
                    </div>
                    <div className="h-0.5 bg-[#E5E5E5] dark:bg-white/6 overflow-hidden">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${(count / total) * 100}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="py-4 border-t border-[#F0F0F0] dark:border-white/5">
              <p
                className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] mb-2"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Legend
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shrink-0" />
                  <span className="text-[11px] text-[#888] dark:text-[#555]">
                    Recommended for location
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3.5 h-3.5 border border-[#86BC25] shrink-0"
                    style={{ backgroundColor: "#86BC25" }}
                  />
                  <span className="text-[11px] text-[#888] dark:text-[#555]">
                    Selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border border-[#E5E5E5] dark:border-white/10 bg-white dark:bg-[#141414] shrink-0 opacity-30" />
                  <span className="text-[11px] text-[#888] dark:text-[#555]">
                    Not applicable
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 md:px-8 py-8 overflow-y-auto">
          <div className="w-full">
            <div className="saf-fu mb-7" style={{ animationDelay: "0ms" }}>
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#888] dark:text-[#555] mb-2"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {selected.size} of {ALL_21_RISKS.length} selected for{" "}
                <span className="text-[#86BC25]">{asset.name}</span>
              </p>
              <div className="flex items-end justify-between gap-4 flex-wrap">
                <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
                  Select Hazards
                </h1>
                <div className="flex items-center gap-2 pb-1">
                  <button
                    onClick={selectRecommended}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/6 transition-colors cursor-pointer bg-transparent"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    <Zap size={10} className="shrink-0" />
                    SELECT RECOMMENDED
                  </button>
                  <button
                    onClick={selectAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D8D8D8] dark:border-white/12 text-[#888] dark:text-[#555] hover:border-[#999] dark:hover:border-white/25 transition-colors cursor-pointer bg-transparent"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    <CheckCircle size={10} className="shrink-0" />
                    SELECT ALL 21
                  </button>
                  {selected.size > 0 && (
                    <button
                      onClick={() => setSelected(new Set())}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-transparent text-[#CCC] dark:text-[#444] hover:text-[#888] hover:border-[#E5E5E5] dark:hover:border-white/8 transition-colors cursor-pointer bg-transparent"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        letterSpacing: "0.06em",
                      }}
                    >
                      <Check size={10} className="shrink-0" />
                      CLEAR SELECTION
                    </button>
                  )}
                </div>
              </div>
            </div>

            {CATEGORIES.map((cat, catIdx) => {
              const meta = CATEGORY_META[cat];
              const risksInCat = ALL_21_RISKS.filter((r) => r.category === cat);
              const selectedCount = risksInCat.filter((r) =>
                selected.has(r.risk),
              ).length;
              return (
                <div
                  key={cat}
                  className="saf-fu mb-8"
                  style={{ animationDelay: `${catIdx * 80 + 60}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="h-0.5 w-5 shrink-0"
                      style={{ backgroundColor: meta.color }}
                    />
                    <span
                      className="text-[17px] font-medium uppercase tracking-widest"
                      style={{
                        color: meta.color,
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {meta.label}
                    </span>
                    <span
                      className="text-[17px] font-medium text-[#BBBBBB] dark:text-[#444]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {selectedCount}/{risksInCat.length}
                    </span>
                    <div className="flex-1 h-px bg-[#E5E5E5] dark:bg-white/6" />
                  </div>

                  <div
                    className="grid gap-1.5"
                    style={{
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(140px, 1fr))",
                    }}
                  >
                    {risksInCat.map((risk) => {
                      const isSelected = selected.has(risk.risk);
                      const isDisabled = disabled.has(risk.risk);
                      const isRecommended = recommended.has(risk.risk);
                      return (
                        <button
                          key={risk.id}
                          title={
                            isDisabled
                              ? "Not applicable for this location"
                              : risk.definition
                          }
                          onClick={() => toggle(risk.risk)}
                          disabled={isDisabled}
                          className={`relative text-left p-3.5 min-h-21 flex flex-col border cursor-pointer transition-all duration-150
                        ${isDisabled ? "opacity-25 cursor-not-allowed bg-white dark:bg-[#141414] border-[#E5E5E5] dark:border-white/6" : ""}
                        ${!isDisabled && isSelected ? "border-[#86BC25] bg-[#86BC25]/4 dark:bg-[#86BC25]/6" : ""}
                        ${!isDisabled && !isSelected ? "border-[#E5E5E5] dark:border-white/7 bg-white dark:bg-[#141414] hover:border-[#86BC25]/50" : ""}
                      `}
                          style={
                            isSelected
                              ? {
                                  borderColor: meta.color,
                                  backgroundColor: `${meta.color}08`,
                                }
                              : undefined
                          }
                        >
                          {isRecommended && !isDisabled && (
                            <div
                              className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: "#F59E0B" }}
                            />
                          )}

                          <div
                            className="h-0.5 w-6 mb-3 shrink-0"
                            style={{
                              backgroundColor: isSelected
                                ? meta.color
                                : "#E5E5E5",
                              transition: "background-color 0.15s",
                            }}
                          />

                          <span
                            className="text-[13px] leading-snug flex-1 pr-4"
                            style={{
                              color: isSelected ? meta.color : "#333",
                              fontWeight: isSelected ? 600 : 400,
                            }}
                          >
                            {risk.risk}
                          </span>

                          <div className="flex items-center justify-between mt-2.5">
                            <span
                              className="text-[9px] font-semibold uppercase tracking-[0.08em]"
                              style={{
                                color: isSelected ? meta.color : "#BBBBBB",
                                fontFamily: "var(--font-mono)",
                              }}
                            >
                              {cat.slice(0, 5).toUpperCase()}
                            </span>
                            {isSelected && (
                              <div
                                className="w-4 h-4 flex items-center justify-center shrink-0"
                                style={{ backgroundColor: meta.color }}
                              >
                                <Check
                                  size={9}
                                  color="#fff"
                                  strokeWidth={2.5}
                                />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
