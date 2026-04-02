"use client";

import { Building2, FolderOpen, ArrowRight, Check } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { useState } from "react";

const MODES = [
  {
    id: "single" as const,
    icon: Building2,
    tag: "Single asset",
    headline: "Asset-Level",
    sub: "Assessment",
    description:
      "Precision climate risk evaluation for a specific property. Full geocoding verification, hazard selection, and resilience scoring against live hazard data.",
    capabilities: [
      "Geocoded coordinate confirmation",
      "21-vector hazard analysis",
      "SBRA & ALRA resilience scoring",
      "GeoConfidence grading",
      "Full audit-trail export",
    ],
    cta: "Begin assessment",
  },
  {
    id: "portfolio" as const,
    icon: FolderOpen,
    tag: "Portfolio",
    headline: "Portfolio Level",
    sub: "Assessment",
    description:
      "Upload a structured asset register and run climate risk screening across your entire portfolio in one automated batch.",
    capabilities: [
      "Structured CSV ingestion",
      "Batch hazard screening",
      "Portfolio-level EAL aggregation",
      "Concentration risk view",
      "Export-ready results",
    ],
    cta: "Load register",
  },
];

export default function ModeSelector() {
  const { setMode, setActiveStep, clearData } = usePhysicalRiskStore();
  const [hovered, setHovered] = useState<string | null>(null);

  const select = (mode: "single" | "portfolio") => {
    clearData();
    setMode(mode);
    setActiveStep(0);
  };

  return (
    <div className="h-[calc(100vh-72px)] flex flex-col bg-white dark:bg-[#0A0A0A] overflow-hidden">
      <style>{`
        @keyframes pi {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .pi { animation: pi 0.52s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* ── Full-fill split panels ── */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden">
        {/* Divider */}
        <div className="hidden md:block absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-[#EBEBEB] dark:bg-white/6 z-10 pointer-events-none" />
        <div className="block md:hidden h-px w-full bg-[#EBEBEB] dark:bg-white/6" />

        {MODES.map((mode, idx) => {
          const Icon = mode.icon;
          const isHov = hovered === mode.id;
          const isOther = hovered !== null && hovered !== mode.id;

          return (
            <button
              key={mode.id}
              onClick={() => select(mode.id)}
              onMouseEnter={() => setHovered(mode.id)}
              onMouseLeave={() => setHovered(null)}
              className={`group relative text-left cursor-pointer overflow-hidden flex flex-col justify-center px-8 md:px-14 lg:px-20 py-8 md:py-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#86BC25] ${
                isHov
                  ? "bg-[#F6FAF0] dark:bg-[#0B100A]"
                  : "bg-white dark:bg-[#0A0A0A]"
              }`}
              style={{
                flex: isHov
                  ? "1.18 1.18 0%"
                  : isOther
                    ? "0.82 0.82 0%"
                    : "1 1 0%",
                transition:
                  "flex 0.55s cubic-bezier(0.22,1,0.36,1), background-color 0.3s ease",
              }}
            >
              {/* Side accent strip */}
              <div
                className={`absolute top-0 bottom-0 ${idx === 0 ? "left-0" : "right-0"} w-0.75 transition-all duration-500 ${
                  isHov ? "bg-[#86BC25]" : "bg-transparent"
                }`}
              />

              {/* ── Content ── */}
              <div className="relative z-10 max-w-105 w-full">
                {/* Tag */}
                <div
                  className="pi flex items-center gap-2.5 mb-8"
                  style={{ animationDelay: `${idx * 55}ms` }}
                >
                  <div
                    className={`w-1.25 h-1.25 rounded-full shrink-0 transition-colors duration-300 ${
                      isHov ? "bg-[#86BC25]" : "bg-[#D5D5D5] dark:bg-[#383838]"
                    }`}
                  />
                  <span className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-[#AAAAAA] dark:text-[#484848]">
                    {mode.tag}
                  </span>
                </div>

                {/* Icon box */}
                <div
                  className={`pi w-14 h-14 rounded-2xl flex items-center justify-center mb-8 transition-all duration-300 ${
                    isHov
                      ? "bg-[#86BC25] shadow-[0_8px_32px_rgba(134,188,37,0.3)]"
                      : "bg-[#F3F3F3] dark:bg-[#181818]"
                  }`}
                  style={{ animationDelay: `${idx * 55 + 35}ms` }}
                >
                  <Icon
                    size={24}
                    className={`transition-colors duration-300 ${
                      isHov ? "text-white" : "text-[#999] dark:text-[#777]"
                    }`}
                  />
                </div>

                {/* Title */}
                <div
                  className="pi mb-4"
                  style={{ animationDelay: `${idx * 55 + 60}ms` }}
                >
                  <h2
                    className="font-bold tracking-[-0.025em] leading-[1.08] text-[#0D0D0D] dark:text-[#F0F0F0] whitespace-nowrap"
                    style={{ fontSize: "clamp(2.2rem, 3.2vw, 3.2rem)" }}
                  >
                    {mode.headline}{" "}
                    <span
                      className={`transition-colors duration-300 ${
                        isHov ? "text-[#86BC25]" : ""
                      }`}
                    >
                      {mode.sub}
                    </span>
                  </h2>
                </div>

                {/* Description */}
                <p
                  className="pi text-[15.5px] leading-[1.72] mb-7 text-[#888] dark:text-[#666]"
                  style={{ animationDelay: `${idx * 55 + 80}ms` }}
                >
                  {mode.description}
                </p>

                {/* Separator */}
                <div
                  className={`h-px mb-6 transition-colors duration-300 ${
                    isHov ? "bg-[#86BC25]/20" : "bg-[#F0F0F0] dark:bg-[#1A1A1A]"
                  }`}
                />

                {/* Capabilities */}
                <ul
                  className="pi space-y-3 mb-9"
                  style={{ animationDelay: `${idx * 55 + 105}ms` }}
                >
                  {mode.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-3">
                      <div
                        className={`w-4.5 h-4.5 rounded-full shrink-0 flex items-center justify-center transition-all duration-300 ${
                          isHov
                            ? "bg-[#86BC25] shadow-[0_2px_8px_rgba(134,188,37,0.25)]"
                            : "bg-[#F0F0F0] dark:bg-[#1C1C1C]"
                        }`}
                      >
                        <Check
                          size={9}
                          strokeWidth={3}
                          className={`transition-colors duration-300 ${
                            isHov
                              ? "text-white"
                              : "text-[#C5C5C5] dark:text-[#555]"
                          }`}
                        />
                      </div>
                      <span className="text-[14px] text-[#666] dark:text-[#777]">
                        {cap}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div
                  className="pi"
                  style={{ animationDelay: `${idx * 55 + 135}ms` }}
                >
                  <div
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg text-[15px] font-semibold transition-all duration-300 ${
                      isHov
                        ? "bg-[#86BC25] text-white shadow-[0_4px_20px_rgba(134,188,37,0.36)]"
                        : "bg-[#F4F4F4] dark:bg-[#161616] text-[#AAAAAA] dark:text-[#555]"
                    }`}
                  >
                    {mode.cta}
                    <ArrowRight
                      size={14}
                      className={`transition-transform duration-300 ${
                        isHov ? "translate-x-0.5" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
