import { useCallback, useState } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import {
  Play,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  // Info,
} from "lucide-react";
import { useTransitionRiskStore } from "@/store/transitionRiskStore";
import { runTransitionAssessment } from "../../domain/transitionRisk/engine";
import type { TransitionResult } from "../../domain/transitionRisk/types";
import { TRANSITION_RATING_COLORS } from "../../domain/transitionRisk/transitionData";

const ACCENT = "#86BC25";
// const HERO_BG = "#1A3C21";

const PIPELINE: { label: string; key: string }[] = [
  { label: "Loading Sector & Country Data", key: "data" },
  { label: "Policy & Regulation Scoring", key: "policy" },
  { label: "Technology Disruption Scoring", key: "technology" },
  { label: "Market & Sentiment Scoring", key: "market" },
  { label: "Legal & Liability Scoring", key: "legal" },
  { label: "Credit Risk Parameters (?PD)", key: "credit" },
  { label: "Stranded Asset Discount", key: "stranded" },
  { label: "Revenue Erosion Modelling", key: "revenue" },
  { label: "Transition EAL Computation", key: "eal" },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

export default function TScreenRunAssessment() {
  const canvasRef = useHeroCanvas("transition");
  const {
    config,
    organisations,
    results,
    isRunning,
    progress,
    error,
    pipelineStages,
    setResults,
    setIsRunning,
    setProgress,
    setPipelineStage,
    setPipelineStages,
    setError,
    // setActiveStep,
  } = useTransitionRiskStore();

  const [localResults, setLocalResults] = useState<TransitionResult[]>(results);

  const runAssessment = useCallback(async () => {
    if (organisations.length === 0) return;
    setIsRunning(true);
    setProgress(0);
    setError(null);

    const stages = PIPELINE.map((p) => ({
      label: p.label,
      status: "pending" as const,
    }));
    setPipelineStages(stages);

    try {
      for (let i = 0; i < PIPELINE.length; i++) {
        const updated = stages.map((s, idx) => ({
          ...s,
          status:
            idx < i
              ? ("done" as const)
              : idx === i
                ? ("running" as const)
                : ("pending" as const),
        }));
        setPipelineStages(updated);
        setPipelineStage(PIPELINE[i].label);
        setProgress(((i + 1) / PIPELINE.length) * 100);
        await delay(300 + Math.random() * 200);
      }

      const res = runTransitionAssessment(organisations, config.usdRate);
      setLocalResults(res);
      setResults(res);

      setPipelineStages(stages.map((s) => ({ ...s, status: "done" as const })));
      setProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assessment failed");
      setPipelineStages(
        stages.map((s, i) => ({
          ...s,
          status:
            i < stages.length - 1 ? ("done" as const) : ("error" as const),
        })),
      );
    } finally {
      setIsRunning(false);
    }
  }, [
    organisations,
    config.usdRate,
    setResults,
    setIsRunning,
    setProgress,
    setPipelineStage,
    setPipelineStages,
    setError,
  ]);

  const worstEal =
    localResults.length > 0
      ? localResults.reduce(
          (max, r) => Math.max(max, r.worstCase.transitionEalLocal),
          0,
        )
      : 0;
  const worstRating =
    localResults.length > 0
      ? localResults.reduce((w, r) => {
          const order = [
            "Negligible",
            "Low",
            "Medium",
            "High",
            "Very High",
            "Extreme",
          ];
          return order.indexOf(r.worstCase.rating) > order.indexOf(w)
            ? r.worstCase.rating
            : w;
        }, "Negligible" as string)
      : "";

  return (
    <div className="relative min-h-screen">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
      />
      <div className="relative z-10 flex-1 flex flex-col">
        <div
          className={`relative z-10 overflow-hidden bg-[#1A3C21] dark:bg-[#0F1F13]`}
        >
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)`,
            }}
          />
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, ${ACCENT} 0%, transparent 70%)`,
            }}
          />
          <div className="relative px-6 md:px-10 py-6 md:py-8">
            <div className="max-w-300 mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#86BC25] flex items-center justify-center">
                    <Play size={13} className="text-white" />
                  </div>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Step 03 of 05 &mdash; Run Assessment
                  </span>
                </div>
                <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                  Transition Risk Pipeline
                </h1>
                <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                  Execute the 9-stage transition risk computation for{" "}
                  {organisations.length} organisation
                  {organisations.length !== 1 ? "s" : ""}.
                </p>
              </div>
              {localResults.length > 0 && (
                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-right">
                    <div
                      className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-1"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Worst-Case EAL
                    </div>
                    <div className="text-[24px] font-bold text-white leading-none">
                      {fmt(worstEal, "")}
                    </div>
                  </div>
                  {worstRating && (
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded"
                      style={{
                        backgroundColor: `${TRANSITION_RATING_COLORS[worstRating]}20`,
                        color: TRANSITION_RATING_COLORS[worstRating],
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {worstRating}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-6 md:px-10 py-8 max-w-300 mx-auto w-full">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-72 shrink-0 space-y-5">
              <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-[#86BC25]/10 flex items-center justify-center">
                    <span
                      className="text-[11px] font-bold text-[#86BC25]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      03
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Pipeline Status
                  </span>
                </div>
                <div className="space-y-1">
                  {pipelineStages.map((stage, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5">
                      {stage.status === "done" ? (
                        <CheckCircle
                          size={13}
                          className="text-[#22C55E] shrink-0"
                        />
                      ) : stage.status === "running" ? (
                        <Loader
                          size={13}
                          className="text-[#86BC25] animate-spin shrink-0"
                        />
                      ) : stage.status === "error" ? (
                        <XCircle size={13} className="text-red-500 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-[#D1D5DB] dark:border-white/20 shrink-0" />
                      )}
                      <span
                        className={`text-[11px] ${stage.status === "running" ? "text-[#86BC25] font-semibold" : stage.status === "done" ? "text-[#666] dark:text-[#888]" : "text-[#BBB] dark:text-[#555]"}`}
                      >
                        {stage.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {(isRunning || progress === 100) && (
                <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-5 flex flex-col items-center">
                  <svg
                    viewBox="0 0 40 40"
                    className="w-20 h-20 -rotate-90"
                    style={{
                      filter: `drop-shadow(0 0 6px rgba(14,165,233,0.3))`,
                    }}
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="16"
                      fill="none"
                      stroke="rgba(14,165,233,0.1)"
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
                      strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                      style={{
                        transition:
                          "stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                      }}
                    />
                  </svg>
                  <div className="mt-3 text-[24px] font-bold text-[#333] dark:text-[#DDD]">
                    {Math.round(progress)}
                    <span className="text-[14px] text-[#999]">%</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {!isRunning && localResults.length === 0 && (
                <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[#86BC25]/10 flex items-center justify-center mx-auto mb-5">
                    <Play size={28} className="text-[#86BC25]" />
                  </div>
                  <h3 className="text-[18px] font-bold text-[#333] dark:text-[#DDD] mb-2">
                    Ready to Run
                  </h3>
                  <p className="text-[13px] text-[#888] mb-6 max-w-80 mx-auto">
                    The engine will score all {organisations.length}{" "}
                    organisation{organisations.length !== 1 ? "s" : ""} across 3
                    scenarios � 3 horizons.
                  </p>
                  <button
                    onClick={runAssessment}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.08em] rounded-xl hover:bg-[#78AA1F] transition-colors"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Play size={14} /> Run Transition Assessment
                  </button>
                </div>
              )}

              {isRunning && (
                <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-10 text-center">
                  <Loader
                    size={32}
                    className="text-[#86BC25] animate-spin mx-auto mb-4"
                  />
                  <h3 className="text-[16px] font-semibold text-[#333] dark:text-[#DDD] mb-1">
                    Processing...
                  </h3>
                  <p className="text-[13px] text-[#888]">
                    {useTransitionRiskStore.getState().pipelineStage}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-2xl p-5 flex items-start gap-3 mb-6">
                  <AlertCircle
                    size={16}
                    className="text-red-500 shrink-0 mt-0.5"
                  />
                  <div>
                    <h4 className="text-[13px] font-semibold text-red-700 dark:text-red-400">
                      Assessment Error
                    </h4>
                    <p className="text-[12px] text-red-600 dark:text-red-300 mt-1">
                      {error}
                    </p>
                  </div>
                </div>
              )}

              {!isRunning && localResults.length > 0 && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#E5E5E3] dark:border-white/[0.06] flex items-center justify-between">
                      <h3 className="text-[14px] font-semibold text-[#333] dark:text-[#DDD]">
                        Assessment Complete � {localResults.length}{" "}
                        Organisations
                      </h3>
                      <button
                        onClick={runAssessment}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#86BC25] border border-[#86BC25]/30 rounded-lg hover:bg-[#86BC25]/5 transition-colors"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        Re-run
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[12px]">
                        <thead>
                          <tr className="bg-[#F7F7F6] dark:bg-white/[0.02]">
                            {[
                              "Organisation",
                              "Sector",
                              "Rating",
                              "Score",
                              "?PD (bps)",
                              "Transition EAL",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-2.5 text-left font-semibold uppercase tracking-[0.08em] text-[#888]"
                                style={{ fontFamily: "var(--font-mono)" }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {localResults.map((r) => (
                            <tr
                              key={r.org.id}
                              className="border-t border-[#F0F0EE] dark:border-white/[0.04] hover:bg-[#FAFAF9] dark:hover:bg-white/[0.02]"
                            >
                              <td className="px-4 py-3 font-medium text-[#333] dark:text-[#DDD]">
                                {r.org.orgName}
                              </td>
                              <td className="px-4 py-3 text-[#666] dark:text-[#AAA]">
                                {r.org.sector}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded"
                                  style={{
                                    backgroundColor: `${TRANSITION_RATING_COLORS[r.worstCase.rating]}20`,
                                    color:
                                      TRANSITION_RATING_COLORS[
                                        r.worstCase.rating
                                      ],
                                    fontFamily: "var(--font-mono)",
                                  }}
                                >
                                  {r.worstCase.rating}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-mono text-[#333] dark:text-[#DDD]">
                                {r.worstCase.compositeScore.toFixed(1)}
                              </td>
                              <td className="px-4 py-3 font-mono text-[#333] dark:text-[#DDD]">
                                {r.worstCase.deltaPdBps.toFixed(0)}
                              </td>
                              <td className="px-4 py-3 font-mono font-bold text-[#333] dark:text-[#DDD]">
                                {fmt(r.worstCase.transitionEalLocal, "")}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
