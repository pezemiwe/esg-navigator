"use client";

import { Building2, FolderOpen, ArrowRight, Activity } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";

const MODES = [
  {
    id: "single" as const,
    icon: Building2,
    title: "Single Asset Assessment",
    description:
      "Evaluate one asset with precise geocoding, hazard selection, and full resilience scoring with real-time climate API data.",
    features: [
      "Geocoded location confirm",
      "21-hazard selection",
      "SBRA / ALRA resilience",
      "Full audit trail",
    ],
    cta: "Start assessment",
  },
  {
    id: "portfolio" as const,
    icon: FolderOpen,
    title: "Portfolio Level Assessment",
    description:
      "Upload a CSV register and run climate risk screening across your entire asset base in one batch.",
    features: [
      "Bulk CSV ingestion",
      "Batch hazard screening",
      "Portfolio-level EAL",
      "Export-ready report",
    ],
    cta: "Load portfolio",
  },
];

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${8 + ((i * 37) % 86)}%`,
  top: `${5 + ((i * 53) % 88)}%`,
  size: 1 + (i % 3),
  delay: `${(i * 0.9) % 8}s`,
  duration: `${7 + (i % 6)}s`,
  opacity: 0.06 + (i % 4) * 0.025,
}));

const WAVE_PATHS = [
  "M0,60 C120,20 240,80 360,50 C480,20 600,70 720,45 C840,20 960,65 1080,40 L1080,120 L0,120 Z",
  "M0,70 C100,35 220,85 360,55 C500,25 620,75 780,50 C900,30 1000,70 1080,48 L1080,120 L0,120 Z",
  "M0,55 C140,25 260,75 400,48 C540,22 660,72 800,46 C920,24 1020,68 1080,44 L1080,120 L0,120 Z",
];

export default function ModeSelector() {
  const { setMode, setActiveStep, clearData } = usePhysicalRiskStore();

  const select = (mode: "single" | "portfolio") => {
    clearData();
    setMode(mode);
    setActiveStep(0);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col bg-[#F4F4F2] dark:bg-[#0D0D0D] relative overflow-hidden">
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseDot {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.2;
          }
        }
        @keyframes floatParticle {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-18px) scale(1.15);
          }
        }
        @keyframes waveShift {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        @keyframes gridPulse {
          0%,
          100% {
            opacity: 0.03;
          }
          50% {
            opacity: 0.07;
          }
        }
        @keyframes tempRise {
          0% {
            height: 30%;
          }
          60% {
            height: 72%;
          }
          100% {
            height: 65%;
          }
        }
        @keyframes ringExpand {
          0% {
            transform: scale(0.7);
            opacity: 0.18;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
        .fu {
          animation: fadeUp 0.44s ease forwards;
          opacity: 0;
        }
        .dot {
          animation: pulseDot 2s ease-in-out infinite;
        }
        .particle {
          animation: floatParticle var(--dur) ease-in-out var(--delay) infinite;
        }
        .wave-track {
          animation: waveShift 18s linear infinite;
        }
        .grid-bg {
          animation: gridPulse 6s ease-in-out infinite;
        }
        .temp-bar {
          animation: tempRise 4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .ring {
          animation: ringExpand 3.5s ease-out var(--delay) infinite;
        }
      `}</style>

      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        <div
          className="grid-bg absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(134,188,37,1) 1px, transparent 1px), linear-gradient(90deg, rgba(134,188,37,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            opacity: 0.04,
          }}
        />

        <div
          className="wave-track absolute bottom-0 left-0 flex"
          style={{ width: "200%" }}
        >
          {[0, 1].map((rep) => (
            <svg
              key={rep}
              viewBox="0 0 1080 120"
              className="w-1/2"
              preserveAspectRatio="none"
              style={{ height: "90px" }}
            >
              {WAVE_PATHS.map((d, wi) => (
                <path
                  key={wi}
                  d={d}
                  fill="none"
                  stroke="#86BC25"
                  strokeWidth="0.7"
                  opacity={0.07 - wi * 0.02}
                />
              ))}
            </svg>
          ))}
        </div>

        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="particle absolute rounded-full bg-[#86BC25]"
            style={{
              left: p.left,
              top: p.top,
              width: `${p.size * 3}px`,
              height: `${p.size * 3}px`,
              opacity: p.opacity,
              ["--dur" as string]: p.duration,
              ["--delay" as string]: p.delay,
            }}
          />
        ))}

        <div className="absolute top-[12%] right-[6%] opacity-[0.06]">
          <div className="relative w-28 h-28 flex items-end justify-center">
            <div
              className="temp-bar w-5 bg-gradient-to-t from-[#ef4444] to-[#f97316] rounded-t-sm absolute bottom-0"
              style={{ width: "20px" }}
            />
            <svg className="absolute inset-0" viewBox="0 0 112 112" fill="none">
              <circle
                cx="56"
                cy="56"
                r="50"
                stroke="#86BC25"
                strokeWidth="0.8"
                strokeDasharray="4 6"
              />
            </svg>
          </div>
        </div>

        <div className="absolute bottom-[18%] left-[4%] opacity-[0.055]">
          <div className="relative w-20 h-20">
            {[0, 1, 2].map((ri) => (
              <div
                key={ri}
                className="ring absolute inset-0 rounded-full border border-[#86BC25]"
                style={{ ["--delay" as string]: `${ri * 1.1}s` }}
              />
            ))}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#ef4444]" />
            </div>
          </div>
        </div>

        <div className="absolute top-[35%] left-[2%] opacity-[0.05]">
          <svg width="60" height="50" viewBox="0 0 60 50" fill="none">
            <polyline
              points="0,40 10,28 20,33 30,15 40,20 50,6 60,10"
              stroke="#86BC25"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points="0,40 10,28 20,33 30,15 40,20 50,6 60,10"
              stroke="#86BC25"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.08"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10 border-b border-[#D8D8D8] dark:border-white/[0.07] px-6 md:px-10 py-3 flex items-center gap-3">
        <Activity size={12} className="text-[#86BC25] dot" />
        <span
          className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Physical Risk Assessment
        </span>
        <span className="text-[#CCC] dark:text-white/10">/</span>
        <span
          className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Mode Selection
        </span>
      </div>

      <div className="relative z-10 flex flex-1 flex-col justify-center px-6 md:px-16 lg:px-24 py-12">
        <div className="max-w-5xl w-full mx-auto">
          <div className="fu mb-2" style={{ animationDelay: "0ms" }}>
            <span
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#86BC25]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              — Select assessment mode
            </span>
          </div>

          <h1
            className="fu text-3xl md:text-5xl font-bold text-[#111] dark:text-[#F0F0F0] leading-[1.1] tracking-tight mb-6 max-w-2xl"
            style={{ animationDelay: "60ms" }}
          >
            Select your assessment <br className="hidden md:block" />
            <span className="text-[#86BC25]">methodology</span>
          </h1>

          <p
            className="fu text-lg text-[#666] dark:text-[#999] max-w-xl leading-relaxed mb-12"
            style={{ animationDelay: "110ms" }}
          >
            Choose how you would like to ingest asset data. Both methods utilize
            the same climate hazard API and resilience scoring engine.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            {MODES.map((mode, i) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.id}
                  onClick={() => select(mode.id)}
                  className="fu group text-left bg-white dark:bg-[#141414] border border-[#D8D8D8] dark:border-white/[0.08]
                    hover:border-[#86BC25] dark:hover:border-[#86BC25] hover:shadow-[0_6px_32px_rgba(134,188,37,0.10)]
                    transition-all duration-200 cursor-pointer overflow-hidden"
                  style={{ animationDelay: `${180 + i * 80}ms` }}
                >
                  <div className="h-[2px] bg-[#EBEBEB] dark:bg-white/[0.06] group-hover:bg-[#86BC25] transition-colors duration-200" />
                  <div className="p-7">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-11 h-11 flex items-center justify-center border border-[#E8E8E6] dark:border-white/[0.08] group-hover:border-[#86BC25] group-hover:bg-[#86BC25]/[0.06] transition-all duration-200">
                        <Icon size={20} className="text-[#86BC25]" />
                      </div>
                      <div
                        className="flex items-center gap-1 text-[12px] font-semibold text-[#86BC25] opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        <span>{mode.cta}</span>
                        <ArrowRight size={11} />
                      </div>
                    </div>

                    <h2 className="text-[20px] font-semibold text-[#111] dark:text-[#F0F0F0] tracking-tight mb-2">
                      {mode.title}
                    </h2>
                    <p className="text-[14px] text-[#888] dark:text-[#777] leading-relaxed mb-6">
                      {mode.description}
                    </p>

                    <ul className="space-y-2">
                      {mode.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2.5 text-[13px] text-[#666] dark:text-[#888]"
                        >
                          <div className="w-1 h-1 rounded-full bg-[#86BC25] flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
