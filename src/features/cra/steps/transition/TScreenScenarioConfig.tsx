import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import { Settings2, Info, CheckCircle } from "lucide-react";
import { useTransitionRiskStore } from "@/store/transitionRiskStore";
import {
  getAllScenarios,
  getTimeHorizon,
} from "../../domain/transitionRisk/transitionData";
import type { Scenario, Horizon } from "../../domain/transitionRisk/types";

const ACCENT = "#86BC25";
// const HERO_BG = "#1A3C21";

const SCENARIOS: { key: Scenario; color: string }[] = [
  { key: "Orderly", color: "#22C55E" },
  { key: "Disorderly", color: "#F59E0B" },
  { key: "Hot House World", color: "#EF4444" },
];
const HORIZONS: Horizon[] = ["Short", "Medium", "Long"];

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

export default function TScreenScenarioConfig() {
  const canvasRef = useHeroCanvas("transition");
  const {
    selectedScenario,
    setSelectedScenario,
    selectedHorizon,
    setSelectedHorizon,
    organisations,
  } = useTransitionRiskStore();

  const scenarios = getAllScenarios();

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
                    <Settings2 size={13} className="text-white" />
                  </div>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Step 02 of 05 &mdash; Scenario Configuration
                  </span>
                </div>
                <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                  NGFS Scenario & Time Horizon
                </h1>
                <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                  Select the climate scenario and time horizon for your
                  transition risk assessment.
                </p>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                <div className="text-right">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Portfolio
                  </div>
                  <div className="text-[30px] font-bold text-white leading-none">
                    {organisations.length}
                    <span className="text-[14px] text-white/40 ml-1">orgs</span>
                  </div>
                </div>
              </div>
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
                      02
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Driver Weights
                  </span>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      label: "Policy & Regulation",
                      weight: 35,
                      color: "#3B82F6",
                    },
                    {
                      label: "Technology Disruption",
                      weight: 30,
                      color: "#8B5CF6",
                    },
                    {
                      label: "Market & Sentiment",
                      weight: 25,
                      color: "#F59E0B",
                    },
                    {
                      label: "Legal & Liability",
                      weight: 10,
                      color: "#EF4444",
                    },
                  ].map((d) => (
                    <div key={d.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[#666] dark:text-[#AAA]">
                          {d.label}
                        </span>
                        <span
                          className="text-[11px] font-bold"
                          style={{
                            color: d.color,
                            fontFamily: "var(--font-mono)",
                          }}
                        >
                          {d.weight}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-[#F0F0EE] dark:bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${d.weight}%`,
                            backgroundColor: d.color,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-5">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999] block mb-4"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Time Horizon
                </span>
                <div className="space-y-2">
                  {HORIZONS.map((h) => {
                    const th = getTimeHorizon(h);
                    const active = selectedHorizon === h;
                    return (
                      <button
                        key={h}
                        onClick={() => setSelectedHorizon(h)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left ${
                          active
                            ? "border-[#86BC25] bg-[#86BC25]/5 dark:bg-[#86BC25]/10"
                            : "border-[#E5E5E3] dark:border-white/[0.06] hover:border-[#86BC25]/30"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${active ? "border-[#86BC25] bg-[#86BC25]" : "border-[#D1D5DB] dark:border-white/20"}`}
                        >
                          {active && (
                            <CheckCircle size={12} className="text-white" />
                          )}
                        </div>
                        <div>
                          <div className="text-[13px] font-semibold text-[#333] dark:text-[#DDD]">
                            {h}
                          </div>
                          <div
                            className="text-[11px] text-[#888]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {th.label} (mid-{th.mid_year})
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {SCENARIOS.map(({ key, color }) => {
                  const sc = scenarios[key];
                  const active = selectedScenario === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedScenario(key)}
                      className={`text-left rounded-2xl border-2 p-6 transition-all ${
                        active
                          ? "border-[#86BC25] bg-white dark:bg-white/[0.04] shadow-lg shadow-[#86BC25]/10"
                          : "border-[#E5E5E3] dark:border-white/[0.06] bg-white dark:bg-white/[0.02] hover:border-[#86BC25]/30"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span
                          className="text-[11px] font-semibold uppercase tracking-[0.1em]"
                          style={{ color, fontFamily: "var(--font-mono)" }}
                        >
                          {key}
                        </span>
                      </div>
                      <h3 className="text-[15px] font-bold text-[#333] dark:text-[#DDD] mb-2 leading-tight">
                        {sc?.full_name}
                      </h3>
                      <p className="text-[12px] text-[#777] dark:text-[#999] leading-relaxed mb-4">
                        {sc?.description}
                      </p>
                      <div className="space-y-2 pt-3 border-t border-[#F0F0EE] dark:border-white/[0.06]">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#999]">Policy Delivery</span>
                          <span
                            className="font-bold text-[#333] dark:text-[#DDD]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {((sc?.policy_delivery_pct ?? 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#999]">Legal Multiplier</span>
                          <span
                            className="font-bold text-[#333] dark:text-[#DDD]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {sc?.legal_multiplier}x
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-[#999]">
                            Market Premium
                            <InfoTip text="Basis points added to cost of capital at selected horizon" />
                          </span>
                          <span
                            className="font-bold text-[#333] dark:text-[#DDD]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {
                              sc?.[
                                `market_premium_bps_${selectedHorizon.toLowerCase()}` as keyof typeof sc
                              ]
                            }
                            bps
                          </span>
                        </div>
                      </div>
                      {active && (
                        <div
                          className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-[#86BC25]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          <CheckCircle size={13} /> Selected
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="mt-8 bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E5E3] dark:border-white/[0.06]">
                  <h3 className="text-[14px] font-semibold text-[#333] dark:text-[#DDD]">
                    Carbon Price Trajectory (USD/tCO2)
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-[#F7F7F6] dark:bg-white/[0.02]">
                        <th
                          className="px-4 py-2.5 text-left font-semibold uppercase tracking-[0.08em] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          Scenario
                        </th>
                        {HORIZONS.map((h) => (
                          <th
                            key={h}
                            className="px-4 py-2.5 text-right font-semibold uppercase tracking-[0.08em] text-[#888]"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {h} ({getTimeHorizon(h).label})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {SCENARIOS.map(({ key, color }) => {
                        const sc = scenarios[key];
                        return (
                          <tr
                            key={key}
                            className={`border-t border-[#F0F0EE] dark:border-white/[0.04] ${selectedScenario === key ? "bg-[#86BC25]/5" : ""}`}
                          >
                            <td
                              className="px-4 py-3 font-medium"
                              style={{ color }}
                            >
                              <div className="flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                                {key}
                              </div>
                            </td>
                            {(["short", "medium", "long"] as const).map((h) => {
                              const floor =
                                (
                                  sc?.[
                                    `carbon_price_floor_${h}` as keyof typeof sc
                                  ] as Record<string, number>
                                )?.LM ?? 0;
                              return (
                                <td
                                  key={h}
                                  className="px-4 py-3 text-right font-mono text-[#333] dark:text-[#DDD]"
                                >
                                  ${floor}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
