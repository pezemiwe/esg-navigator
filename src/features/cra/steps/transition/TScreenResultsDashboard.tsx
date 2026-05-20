import { useMemo, useState } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import { BarChart3, ChevronDown, ChevronUp, Info } from "lucide-react";
import { useTransitionRiskStore } from "@/store/transitionRiskStore";
import { TRANSITION_RATING_COLORS } from "../../domain/transitionRisk/transitionData";
import type {
  // TransitionResult,
  TransitionRating,
  Scenario,
  Horizon,
} from "../../domain/transitionRisk/types";

const ACCENT = "#86BC25";
// const HERO_BG = "#1A3C21";

const ORDERED_RATINGS: TransitionRating[] = [
  "Extreme",
  "Very High",
  "High",
  "Medium",
  "Low",
  "Negligible",
];
const SCENARIOS: Scenario[] = ["Orderly", "Disorderly", "Hot House World"];
const HORIZONS: Horizon[] = ["Short", "Medium", "Long"];
const SCENARIO_COLORS: Record<string, string> = {
  Orderly: "#22C55E",
  Disorderly: "#F59E0B",
  "Hot House World": "#EF4444",
};
const DRIVER_COLORS: Record<string, string> = {
  policy: "#3B82F6",
  technology: "#8B5CF6",
  market: "#F59E0B",
  legal: "#EF4444",
};
const DRIVER_LABELS: Record<string, string> = {
  policy: "Policy",
  technology: "Technology",
  market: "Market",
  legal: "Legal",
};

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

function RatingPill({ rating }: { rating: TransitionRating }) {
  const color = TRANSITION_RATING_COLORS[rating] ?? "#888";
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 whitespace-nowrap"
      style={{
        fontFamily: "var(--font-mono)",
        backgroundColor: `${color}20`,
        color,
      }}
    >
      {rating}
    </span>
  );
}

function InfoTip({ text }: { text: string }) {
  return (
    <span className="relative inline-block ml-1 group cursor-help align-middle">
      <Info
        size={10}
        className="text-[#BBBBBB] group-hover:text-[#86BC25] transition-colors"
      />
      <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#111] text-[11px] leading-snug px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-normal text-left shadow-xl">
        {text}
      </span>
    </span>
  );
}

export default function TScreenResultsDashboard() {
  const canvasRef = useHeroCanvas("transition");
  const {
    results,
    selectedScenario,
    setSelectedScenario,
    selectedHorizon,
    setSelectedHorizon,
    // setActiveStep,
  } = useTransitionRiskStore();

  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);

  const currentResults = useMemo(() => {
    return results.map((r) => ({
      ...r,
      current: r.scenarios[selectedScenario]?.[selectedHorizon],
    }));
  }, [results, selectedScenario, selectedHorizon]);

  const totalEal = useMemo(
    () =>
      currentResults.reduce(
        (s, r) => s + (r.current?.transitionEalLocal ?? 0),
        0,
      ),
    [currentResults],
  );

  const avgScore = useMemo(() => {
    if (currentResults.length === 0) return 0;
    return (
      currentResults.reduce((s, r) => s + (r.current?.compositeScore ?? 0), 0) /
      currentResults.length
    );
  }, [currentResults]);

  const ratingDist = useMemo(() => {
    const dist: Record<string, number> = {};
    ORDERED_RATINGS.forEach((r) => (dist[r] = 0));
    currentResults.forEach((r) => {
      const rating = r.current?.rating ?? "Negligible";
      dist[rating] = (dist[rating] || 0) + 1;
    });
    return dist;
  }, [currentResults]);
  const maxBar = Math.max(...Object.values(ratingDist), 1);

  const worstRating = useMemo(() => {
    if (currentResults.length === 0) return "Negligible" as TransitionRating;
    const ratings = currentResults.map(
      (r) => r.current?.rating ?? "Negligible",
    );
    const order: TransitionRating[] = [
      "Extreme",
      "Very High",
      "High",
      "Medium",
      "Low",
      "Negligible",
    ];
    return order.find((o) => ratings.includes(o)) ?? "Negligible";
  }, [currentResults]);

  const avgDeltaPd = useMemo(() => {
    if (currentResults.length === 0) return 0;
    return (
      currentResults.reduce((s, r) => s + (r.current?.deltaPdBps ?? 0), 0) /
      currentResults.length
    );
  }, [currentResults]);

  const totalStrandingEal = useMemo(() => {
    return currentResults.reduce(
      (s, r) => s + (r.current?.strandingEalLocal ?? 0),
      0,
    );
  }, [currentResults]);

  const avgRevErosion = useMemo(() => {
    if (currentResults.length === 0) return 0;
    return (
      currentResults.reduce(
        (s, r) => s + (r.current?.revenueErosionPct ?? 0),
        0,
      ) / currentResults.length
    );
  }, [currentResults]);

  const transitionReadiness = useMemo(() => {
    if (currentResults.length === 0) return 0;
    return (
      currentResults.reduce((s, r) => {
        const org = r.org;
        let score = 0;
        score += org.hasTransitionPlan ? 25 : 0;
        score += org.lowCarbonRevenueFraction * 25;
        score += org.disclosureQuality * 25;
        score += (1 - org.revenueCarbonFraction) * 25;
        return s + score;
      }, 0) / currentResults.length
    );
  }, [currentResults]);

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
                    <BarChart3 size={13} className="text-white" />
                  </div>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Step 04 of 05 &mdash; Results Dashboard
                  </span>
                </div>
                <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                  Transition Risk Results
                </h1>
                <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                  Review driver scores, ratings, and financial impacts across
                  scenarios.
                </p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Total EAL
                  </div>
                  <div className="text-[28px] font-bold text-white leading-none">
                    {fmt(totalEal, "")}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Avg Score
                  </div>
                  <div className="text-[28px] font-bold text-white leading-none">
                    {avgScore.toFixed(1)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 md:px-10 py-5 max-w-300 mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            {[
              {
                label: "Worst Rating",
                value: worstRating,
                color: TRANSITION_RATING_COLORS[worstRating],
              },
              {
                label: "Avg \u0394PD",
                value: `${avgDeltaPd.toFixed(0)}bps`,
                color: avgDeltaPd > 100 ? "#EF4444" : "#F59E0B",
              },
              {
                label: "Total EAL",
                value: fmt(totalEal, ""),
                color: "#86BC25",
              },
              {
                label: "Stranding EAL",
                value: fmt(totalStrandingEal, ""),
                color: "#EF4444",
              },
              {
                label: "Avg Rev. Erosion",
                value: `${avgRevErosion.toFixed(1)}%`,
                color: "#3B82F6",
              },
              {
                label: "Readiness",
                value: `${transitionReadiness.toFixed(0)}%`,
                color: transitionReadiness > 50 ? "#22C55E" : "#F59E0B",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-xl p-3 text-center"
              >
                <div
                  className="text-[10px] font-semibold uppercase tracking-wider text-[#999] mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {kpi.label}
                </div>
                <div
                  className="text-[18px] font-extrabold"
                  style={{ color: kpi.color }}
                >
                  {kpi.value}
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-72 shrink-0 space-y-5">
              <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-5">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999] block mb-3"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Active Scenario
                </span>
                {SCENARIOS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedScenario(s)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg mb-1 text-left transition-all text-[12px] ${
                      selectedScenario === s
                        ? "bg-[#86BC25]/10 font-semibold text-[#86BC25]"
                        : "text-[#666] dark:text-[#AAA] hover:bg-[#F7F7F6] dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: SCENARIO_COLORS[s] }}
                    />
                    {s}
                  </button>
                ))}
              </div>
              <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-5">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999] block mb-3"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Time Horizon
                </span>
                <div className="flex gap-1">
                  {HORIZONS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setSelectedHorizon(h)}
                      className={`flex-1 py-2 rounded-lg text-[11px] font-semibold transition-all ${
                        selectedHorizon === h
                          ? "bg-[#86BC25] text-white"
                          : "bg-[#F7F7F6] dark:bg-white/[0.04] text-[#888] hover:text-[#333]"
                      }`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-5">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999] block mb-3"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Rating Distribution
                </span>
                <div className="space-y-2">
                  {ORDERED_RATINGS.map((r) => (
                    <div key={r} className="flex items-center gap-2">
                      <span
                        className="text-[10px] w-16 text-right text-[#888]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {r}
                      </span>
                      <div className="flex-1 h-3 bg-[#F0F0EE] dark:bg-white/[0.04] rounded-sm overflow-hidden">
                        <div
                          className="h-full rounded-sm transition-all duration-500"
                          style={{
                            width: `${(ratingDist[r] / maxBar) * 100}%`,
                            backgroundColor: TRANSITION_RATING_COLORS[r],
                          }}
                        />
                      </div>
                      <span
                        className="text-[11px] font-bold w-5 text-right text-[#333] dark:text-[#DDD]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {ratingDist[r]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0 space-y-6">
              <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E5E3] dark:border-white/[0.06]">
                  <h3 className="text-[14px] font-semibold text-[#333] dark:text-[#DDD]">
                    Scenario × Horizon Heatmap
                    <InfoTip text="Shows the composite transition risk score for each scenario×horizon combination, averaged across all organisations." />
                  </h3>
                </div>
                <div className="p-5 overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr>
                        <th
                          className="px-3 py-2 text-left font-semibold uppercase tracking-[0.08em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Scenario
                        </th>
                        {HORIZONS.map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-center font-semibold uppercase tracking-[0.08em] text-[#888]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SCENARIOS.map((sc) => (
                        <tr
                          key={sc}
                          className="border-t border-[#F0F0EE] dark:border-white/[0.04]"
                        >
                          <td
                            className="px-3 py-3 font-medium"
                            style={{ color: SCENARIO_COLORS[sc] }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: SCENARIO_COLORS[sc] }}
                              />
                              {sc}
                            </div>
                          </td>
                          {HORIZONS.map((h) => {
                            const avg =
                              results.length > 0
                                ? results.reduce(
                                    (s, r) =>
                                      s +
                                      (r.scenarios[sc]?.[h]?.compositeScore ??
                                        0),
                                    0,
                                  ) / results.length
                                : 0;
                            const rating =
                              avg < 10
                                ? "Negligible"
                                : avg < 25
                                  ? "Low"
                                  : avg < 45
                                    ? "Medium"
                                    : avg < 65
                                      ? "High"
                                      : avg < 80
                                        ? "Very High"
                                        : "Extreme";
                            const color = TRANSITION_RATING_COLORS[rating];
                            const isActive =
                              sc === selectedScenario && h === selectedHorizon;
                            return (
                              <td key={h} className="px-3 py-3 text-center">
                                <button
                                  onClick={() => {
                                    setSelectedScenario(sc);
                                    setSelectedHorizon(h);
                                  }}
                                  className={`inline-flex flex-col items-center px-3 py-2 rounded-lg transition-all ${isActive ? "ring-2 ring-[#86BC25] bg-[#86BC25]/5" : "hover:bg-[#F7F7F6] dark:hover:bg-white/[0.03]"}`}
                                >
                                  <span
                                    className="text-[16px] font-bold"
                                    style={{ color }}
                                  >
                                    {avg.toFixed(0)}
                                  </span>
                                  <span
                                    className="text-[9px] font-semibold mt-0.5"
                                    style={{
                                      color,
                                      fontFamily: "var(--font-mono)",
                                    }}
                                  >
                                    {rating}
                                  </span>
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E5E3] dark:border-white/[0.06]">
                  <h3 className="text-[14px] font-semibold text-[#333] dark:text-[#DDD]">
                    Organisation Detail — {selectedScenario} / {selectedHorizon}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-[#F7F7F6] dark:bg-white/[0.02]">
                        {[
                          "Organisation",
                          "Rating",
                          "Score",
                          "Policy",
                          "Tech",
                          "Market",
                          "Legal",
                          "?PD",
                          "Rev Erosion",
                          "Stranding",
                          "EAL",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2.5 text-left font-semibold uppercase tracking-[0.08em] text-[#888] whitespace-nowrap"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentResults.map((r) => {
                        const c = r.current;
                        if (!c) return null;
                        const isExpanded = expandedOrg === r.org.id;
                        return (
                          <tr
                            key={r.org.id}
                            className={`border-t border-[#F0F0EE] dark:border-white/[0.04] cursor-pointer transition-colors ${isExpanded ? "bg-[#86BC25]/5" : "hover:bg-[#FAFAF9] dark:hover:bg-white/[0.02]"}`}
                            onClick={() =>
                              setExpandedOrg(isExpanded ? null : r.org.id)
                            }
                          >
                            <td className="px-3 py-3 font-medium text-[#333] dark:text-[#DDD]">
                              <div className="flex items-center gap-1.5">
                                {isExpanded ? (
                                  <ChevronUp size={12} />
                                ) : (
                                  <ChevronDown size={12} />
                                )}
                                {r.org.orgName}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <RatingPill rating={c.rating} />
                            </td>
                            <td className="px-3 py-3 font-mono text-[#333] dark:text-[#DDD]">
                              {c.compositeScore.toFixed(1)}
                            </td>
                            {(
                              [
                                "policy",
                                "technology",
                                "market",
                                "legal",
                              ] as const
                            ).map((d) => (
                              <td
                                key={d}
                                className="px-3 py-3 font-mono"
                                style={{ color: DRIVER_COLORS[d] }}
                              >
                                {c.drivers[d].toFixed(0)}
                              </td>
                            ))}
                            <td className="px-3 py-3 font-mono text-[#333] dark:text-[#DDD]">
                              {c.deltaPdBps.toFixed(0)}bp
                            </td>
                            <td className="px-3 py-3 font-mono text-[#333] dark:text-[#DDD]">
                              {c.revenueErosionPct.toFixed(1)}%
                            </td>
                            <td className="px-3 py-3 font-mono text-[#333] dark:text-[#DDD]">
                              {(c.strandedDiscount * 100).toFixed(1)}%
                            </td>
                            <td className="px-3 py-3 font-mono font-bold text-[#333] dark:text-[#DDD]">
                              {fmt(c.transitionEalLocal, "")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {expandedOrg &&
                (() => {
                  const r = currentResults.find(
                    (x) => x.org.id === expandedOrg,
                  );
                  if (!r?.current) return null;
                  const c = r.current;
                  // const maxDriver = Math.max(
                  //   c.drivers.policy,
                  //   c.drivers.technology,
                  //   c.drivers.market,
                  //   c.drivers.legal,
                  //   1,
                  // );
                  return (
                    <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-6">
                      <h4 className="text-[14px] font-semibold text-[#333] dark:text-[#DDD] mb-5">
                        {r.org.orgName} — Driver Breakdown
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {(
                          ["policy", "technology", "market", "legal"] as const
                        ).map((d) => (
                          <div key={d} className="text-center">
                            <div className="relative w-20 h-20 mx-auto mb-2">
                              <svg
                                viewBox="0 0 40 40"
                                className="w-full h-full -rotate-90"
                              >
                                <circle
                                  cx="20"
                                  cy="20"
                                  r="16"
                                  fill="none"
                                  stroke="#F0F0EE"
                                  strokeWidth="3"
                                  className="dark:stroke-white/10"
                                />
                                <circle
                                  cx="20"
                                  cy="20"
                                  r="16"
                                  fill="none"
                                  stroke={DRIVER_COLORS[d]}
                                  strokeWidth="3"
                                  strokeLinecap="round"
                                  strokeDasharray={`${2 * Math.PI * 16}`}
                                  strokeDashoffset={`${2 * Math.PI * 16 * (1 - c.drivers[d] / 100)}`}
                                />
                              </svg>
                              <span className="absolute inset-0 flex items-center justify-center text-[14px] font-bold text-[#333] dark:text-[#DDD]">
                                {c.drivers[d].toFixed(0)}
                              </span>
                            </div>
                            <span
                              className="text-[11px] font-semibold text-[#666] dark:text-[#AAA]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {DRIVER_LABELS[d]}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          {
                            label: "Revenue Erosion EAL",
                            value: c.revErosionEalLocal,
                            color: "#3B82F6",
                          },
                          {
                            label: "OPEX Compliance EAL",
                            value: c.opexComplianceEalLocal,
                            color: "#F59E0B",
                          },
                          {
                            label: "Stranding EAL",
                            value: c.strandingEalLocal,
                            color: "#EF4444",
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="bg-[#F7F7F6] dark:bg-white/[0.03] rounded-xl p-4"
                          >
                            <div
                              className="text-[11px] text-[#888] mb-1"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {item.label}
                            </div>
                            <div
                              className="text-[18px] font-bold"
                              style={{ color: item.color }}
                            >
                              {fmt(item.value, "")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
