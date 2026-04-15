"use client";

import { Building2, FolderOpen, ArrowRight, Check } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";

const CAPABILITIES = [
  "Batch hazard screening across all uploaded assets",
  "21-vector climate hazard analysis",
  "Portfolio-level EAL aggregation",
  "Concentration and geographic risk view",
  "SBRA & ALRA resilience scoring",
  "Export-ready results and audit trail",
];

export default function ModeSelector() {
  const { setMode, setActiveStep, clearData } = usePhysicalRiskStore();

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

      {/* Top-right individual asset button */}
      <div className="flex justify-end px-6 pt-5 pb-0">
        <button
          onClick={() => select("single")}
          className="flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] dark:border-white/10 text-[12px] font-semibold text-[#555] dark:text-[#888] hover:border-[#86BC25] hover:text-[#1A3C21] dark:hover:text-[#86BC25] transition-all duration-200"
          style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}
        >
          <Building2 size={13} />
          ASSESS INDIVIDUAL ASSET
          <ArrowRight size={11} />
        </button>
      </div>

      {/* Main centered content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-2xl">
          {/* Tag */}
          <div className="pi flex items-center gap-2.5 mb-8">
            <div className="w-1.25 h-1.25 rounded-full bg-[#86BC25] shrink-0" />
            <span className="text-[12.5px] font-semibold uppercase tracking-[0.16em] text-[#AAAAAA] dark:text-[#484848]">
              Portfolio Assessment
            </span>
          </div>

          {/* Icon */}
          <div
            className="pi w-16 h-16 rounded-2xl flex items-center justify-center mb-8 bg-[#86BC25] shadow-[0_8px_32px_rgba(134,188,37,0.3)]"
            style={{ animationDelay: "35ms" }}
          >
            <FolderOpen size={26} className="text-white" />
          </div>

          {/* Heading */}
          <div className="pi mb-5" style={{ animationDelay: "60ms" }}>
            <h2
              className="font-bold tracking-[-0.025em] leading-[1.08] text-[#0D0D0D] dark:text-[#F0F0F0]"
              style={{ fontSize: "clamp(2.4rem, 3.5vw, 3.6rem)" }}
            >
              Physical Risk <span className="text-[#86BC25]">Assessment</span>
            </h2>
          </div>

          {/* Description */}
          <p
            className="pi text-[16px] leading-[1.72] mb-8 text-[#888] dark:text-[#666] max-w-xl"
            style={{ animationDelay: "80ms" }}
          >
            Run a comprehensive climate risk screening across your entire asset
            portfolio. Upload your structured asset data and receive
            batch-processed hazard exposure, resilience scores, and
            portfolio-level risk aggregation.
          </p>

          {/* Divider */}
          <div className="h-px mb-7 bg-[#86BC25]/20" />

          {/* Capabilities */}
          <ul
            className="pi grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10"
            style={{ animationDelay: "105ms" }}
          >
            {CAPABILITIES.map((cap) => (
              <li key={cap} className="flex items-center gap-3">
                <div className="w-4.5 h-4.5 rounded-full shrink-0 flex items-center justify-center bg-[#86BC25] shadow-[0_2px_8px_rgba(134,188,37,0.25)]">
                  <Check size={9} strokeWidth={3} className="text-white" />
                </div>
                <span className="text-[14px] text-[#666] dark:text-[#777]">
                  {cap}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="pi" style={{ animationDelay: "135ms" }}>
            <button
              onClick={() => select("portfolio")}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#86BC25] text-white text-[15px] font-semibold rounded-lg hover:bg-[#78AA1F] shadow-[0_4px_20px_rgba(134,188,37,0.36)] hover:shadow-[0_6px_28px_rgba(134,188,37,0.45)] transition-all duration-200"
            >
              Begin Assessment
              <ArrowRight size={15} className="translate-x-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
