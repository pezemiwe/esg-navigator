import { useState, useEffect, useMemo } from "react";
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
    return new Set(existing?.risks ?? []);
  });

  const recommended = useMemo(() => {
    if (!asset) return new Set<string>();
    return new Set(suggestRisksForAsset(asset.latitude, asset.longitude));
  }, [asset]);

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
        .fu {
          animation: fadeUp 0.38s ease forwards;
          opacity: 0;
        }
      `}</style>

      {/* Left rail */}
      <div className="hidden lg:flex flex-col w-75 shrink-0 border-r border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]">
        {/* Panel 1 – Header */}
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
            Choose climate hazards to screen against this asset&#39;s location.
          </p>
        </div>

        {/* Panel 2 – Selection count */}
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
          <div className="h-[3px] bg-[#F0F0EE] dark:bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#86BC25] rounded-full transition-all duration-500"
              style={{
                width: `${(selected.size / ALL_21_RISKS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Panel 3 – Category breakdown + actions */}
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
                        className="w-2 h-2 flex-shrink-0"
                        style={{ backgroundColor: meta.color }}
                      />
                      <span
                        className="text-[11px] font-semibold uppercase tracking-[0.10em] text-[#888] dark:text-[#555]"
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
                  <div className="h-[2px] bg-[#E5E5E5] dark:bg-white/[0.06] overflow-hidden">
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

          {/* Legend */}
          <div className="py-4 border-t border-[#F0F0F0] dark:border-white/[0.05]">
            <p
              className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Legend
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
                <span className="text-[11px] text-[#888] dark:text-[#555]">
                  Recommended for location
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 border border-[#86BC25] flex-shrink-0"
                  style={{ backgroundColor: "#86BC25" }}
                />
                <span className="text-[11px] text-[#888] dark:text-[#555]">
                  Selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border border-[#E5E5E5] dark:border-white/[0.10] bg-white dark:bg-[#141414] flex-shrink-0 opacity-30" />
                <span className="text-[11px] text-[#888] dark:text-[#555]">
                  Not applicable
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 md:px-8 py-8 overflow-y-auto">
        <div className="w-full">
          {/* Header row */}
          <div className="fu mb-7" style={{ animationDelay: "0ms" }}>
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
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B]/[0.06] transition-colors cursor-pointer bg-transparent"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.06em",
                  }}
                >
                  <Zap size={10} className="flex-shrink-0" />
                  SELECT RECOMMENDED
                </button>
                <button
                  onClick={selectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D8D8D8] dark:border-white/[0.12] text-[#888] dark:text-[#555] hover:border-[#999] dark:hover:border-white/[0.25] transition-colors cursor-pointer bg-transparent"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    letterSpacing: "0.06em",
                  }}
                >
                  <CheckCircle size={10} className="flex-shrink-0" />
                  SELECT ALL 21
                </button>
                {selected.size > 0 && (
                  <button
                    onClick={() => setSelected(new Set())}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-transparent text-[#CCC] dark:text-[#444] hover:text-[#888] hover:border-[#E5E5E5] dark:hover:border-white/[0.08] transition-colors cursor-pointer bg-transparent"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      letterSpacing: "0.06em",
                    }}
                  >
                    <Check size={10} className="flex-shrink-0" />
                    CLEAR SELECTION
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Categories */}
          {CATEGORIES.map((cat, catIdx) => {
            const meta = CATEGORY_META[cat];
            const risksInCat = ALL_21_RISKS.filter((r) => r.category === cat);
            const selectedCount = risksInCat.filter((r) =>
              selected.has(r.risk),
            ).length;
            return (
              <div
                key={cat}
                className="fu mb-8"
                style={{ animationDelay: `${catIdx * 80 + 60}ms` }}
              >
                {/* Category header */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="h-[2px] w-5 flex-shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span
                    className="text-[17px] font-medium uppercase tracking-[0.1em]"
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
                  <div className="flex-1 h-px bg-[#E5E5E5] dark:bg-white/[0.06]" />
                </div>

                {/* Hazard tiles */}
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
                        className={`relative text-left p-3.5 min-h-[84px] flex flex-col border cursor-pointer transition-all duration-150
                        ${isDisabled ? "opacity-25 cursor-not-allowed bg-white dark:bg-[#141414] border-[#E5E5E5] dark:border-white/[0.06]" : ""}
                        ${!isDisabled && isSelected ? "border-[#86BC25] bg-[#86BC25]/[0.04] dark:bg-[#86BC25]/[0.06]" : ""}
                        ${!isDisabled && !isSelected ? "border-[#E5E5E5] dark:border-white/[0.07] bg-white dark:bg-[#141414] hover:border-[#86BC25]/50" : ""}
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
                        {/* Recommended dot */}
                        {isRecommended && !isDisabled && (
                          <div
                            className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: "#F59E0B" }}
                          />
                        )}

                        {/* Top accent */}
                        <div
                          className="h-[2px] w-6 mb-3 flex-shrink-0"
                          style={{
                            backgroundColor: isSelected
                              ? meta.color
                              : "#E5E5E5",
                            transition: "background-color 0.15s",
                          }}
                        />

                        {/* Risk name — flex-1 pushes check to bottom */}
                        <span
                          className="text-[13px] leading-snug flex-1 pr-4"
                          style={{
                            color: isSelected ? meta.color : "#333",
                            fontWeight: isSelected ? 600 : 400,
                          }}
                        >
                          {risk.risk}
                        </span>

                        {/* Bottom row: category tag + check */}
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
                              className="w-4 h-4 flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: meta.color }}
                            >
                              <Check size={9} color="#fff" strokeWidth={2.5} />
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
  );
}
