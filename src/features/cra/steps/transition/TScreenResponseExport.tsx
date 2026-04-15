import { useMemo, useState } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import { Workbook } from "exceljs";
import {
  Download,
  FileSpreadsheet,
  Info,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { useTransitionRiskStore } from "@/store/transitionRiskStore";
import { TRANSITION_RATING_COLORS } from "../../domain/transitionRisk/transitionData";
import type {
  TransitionRating,
  Scenario,
  Horizon,
} from "../../domain/transitionRisk/types";

const ACCENT = "#86BC25";
// const HERO_BG = "#1A3C21";

// const ORDERED_RATINGS: TransitionRating[] = [
//   "Extreme",
//   "Very High",
//   "High",
//   "Medium",
//   "Low",
//   "Negligible",
// ];
const SCENARIOS: Scenario[] = ["Orderly", "Disorderly", "Hot House World"];
const HORIZONS: Horizon[] = ["Short", "Medium", "Long"];

const MONITORING_CONFIG: Record<
  string,
  { description: string; frequency: string; kpis: string[] }
> = {
  Extreme: {
    description: "Continuous monitoring � board-level reporting",
    frequency: "Monthly",
    kpis: [
      "Carbon cost impact",
      "Stranded asset exposure",
      "Revenue erosion %",
    ],
  },
  "Very High": {
    description: "Intensive monitoring � executive oversight",
    frequency: "Monthly",
    kpis: ["?PD trend", "Policy compliance gap", "Technology adoption rate"],
  },
  High: {
    description: "Active monitoring � risk committee review",
    frequency: "Quarterly",
    kpis: ["Transition score trend", "Stranding discount", "Market sentiment"],
  },
  Medium: {
    description: "Periodic monitoring � management reporting",
    frequency: "Semi-Annual",
    kpis: ["Regulatory tracking", "Sector benchmarking"],
  },
  Low: {
    description: "Standard monitoring � annual cycle",
    frequency: "Annual",
    kpis: ["Policy landscape review"],
  },
  Negligible: {
    description: "Basic monitoring � passive tracking",
    frequency: "Annual",
    kpis: ["Macro trend review"],
  },
};

const RESPONSE_STRATEGIES: Record<
  string,
  { strategy: string; actions: string[] }
> = {
  Extreme: {
    strategy: "Immediate Portfolio Restructure",
    actions: [
      "Initiate accelerated divestment from highest-exposure counterparties",
      "Require transition plans from all borrowers within 90 days",
      "Engage board-level escalation for capital reallocation",
      "Commission independent science-based target validation",
    ],
  },
  "Very High": {
    strategy: "Active Risk Mitigation",
    actions: [
      "Set transition-linked covenant triggers on new facilities",
      "Mandate annual carbon intensity disclosure from counterparties",
      "Increase loan loss provisions for stranded asset exposure",
      "Establish green lending incentive programme",
    ],
  },
  High: {
    strategy: "Enhanced Engagement",
    actions: [
      "Conduct sector-specific transition readiness assessments",
      "Develop sector decarbonisation benchmarks",
      "Integrate transition risk into pricing models",
      "Request borrower climate strategy roadmaps",
    ],
  },
  Medium: {
    strategy: "Monitoring & Preparedness",
    actions: [
      "Include transition risk factors in annual credit review",
      "Track regulatory pipeline for emerging compliance requirements",
      "Build internal capability on TCFD/ISSB transition metrics",
    ],
  },
  Low: {
    strategy: "Standard Review",
    actions: [
      "Maintain awareness of policy developments",
      "Include basic transition screening in onboarding",
    ],
  },
  Negligible: {
    strategy: "Passive Awareness",
    actions: ["Annual sector-level landscape review"],
  },
};

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

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

const TABS = ["Action Plan", "Monitoring", "Export"];

export default function TScreenResponseExport() {
  const canvasRef = useHeroCanvas("transition");
  const { results, config, selectedScenario, selectedHorizon, organisations } =
    useTransitionRiskStore();
  const [tabValue, setTabValue] = useState(0);
  const [exported, setExported] = useState(false);

  const currentResults = useMemo(() => {
    return results.map((r) => ({
      ...r,
      current: r.scenarios[selectedScenario]?.[selectedHorizon],
    }));
  }, [results, selectedScenario, selectedHorizon]);

  const sortedResults = useMemo(
    () =>
      [...currentResults].sort(
        (a, b) =>
          (b.current?.compositeScore ?? 0) - (a.current?.compositeScore ?? 0),
      ),
    [currentResults],
  );

  const totalEAL = useMemo(
    () =>
      currentResults.reduce(
        (s, r) => s + (r.current?.transitionEalLocal ?? 0),
        0,
      ),
    [currentResults],
  );
  const criticalCount = useMemo(
    () =>
      currentResults.filter((r) =>
        ["Extreme", "Very High", "High"].includes(r.current?.rating ?? ""),
      ).length,
    [currentResults],
  );
  const handleExportExcel = async () => {
    const workbook = new Workbook();
    const loanDate = new Date().toISOString().split("T")[0];

    workbook.addWorksheet("Configuration").addRows([
      ["Parameter", "Value"],
      ["Assessment Date", loanDate],
      ["Assessor", config.assessorName || "N/A"],
      ["Scenario", selectedScenario],
      ["Horizon", selectedHorizon],
      ["USD Rate", config.usdRate],
      ["Base Year", config.baseYear],
      ["Organisations", organisations.length],
    ]);

    const orgHeaders = [
      "Organisation",
      "Sector",
      "Country",
      "Currency",
      "Revenue",
      "OPEX",
      "Total Assets",
      "Asset Life",
      "Base PD",
      "Carbon Intensity",
      "Fossil Revenue %",
      "Low Carbon Revenue %",
      "Tech Dependency",
    ];
    const orgRows = organisations.map((o) => [
      o.orgName,
      o.sector,
      o.country,
      o.currency,
      o.annualRevenueLocal,
      o.annualOpexLocal,
      o.totalAssetValueLocal,
      // o.avgAssetLifeYrs,
      // o.basePd,
      // o.carbonIntensity,
      // o.fossilFuelRevenuePct,
      // o.lowCarbonRevenuePct,
      o.technologyDependency,
    ]);
    workbook
      .addWorksheet("Organisation Profiles")
      .addRows([orgHeaders, ...orgRows]);

    const resHeaders = [
      "Organisation",
      "Sector",
      "Scenario",
      "Horizon",
      "Composite Score",
      "Rating",
      "Policy",
      "Technology",
      "Market",
      "Legal",
      "?PD (bps)",
      "Stranded Discount %",
      "Revenue Erosion %",
      "Rev Erosion EAL",
      "OPEX Compliance EAL",
      "Stranding EAL",
      "Total Transition EAL",
    ];
    const resRows: (string | number)[][] = [];
    results.forEach((r) => {
      SCENARIOS.forEach((sc) => {
        HORIZONS.forEach((h) => {
          const c = r.scenarios[sc]?.[h];
          if (!c) return;
          resRows.push([
            r.org.orgName,
            r.org.sector,
            sc,
            h,
            c.compositeScore,
            c.rating,
            c.drivers.policy,
            c.drivers.technology,
            c.drivers.market,
            c.drivers.legal,
            c.deltaPdBps,
            c.strandedDiscount * 100,
            c.revenueErosionPct,
            c.revErosionEalLocal,
            c.opexComplianceEalLocal,
            c.strandingEalLocal,
            c.transitionEalLocal,
          ]);
        });
      });
    });
    workbook
      .addWorksheet("Assessment Results")
      .addRows([resHeaders, ...resRows]);

    const rpHeaders = [
      "Organisation",
      "Rating",
      "Strategy",
      "Actions",
      "Monitoring Frequency",
      "KPIs",
    ];
    const rpRows = sortedResults.map((r) => {
      const rating = r.current?.rating ?? "Negligible";
      const resp = RESPONSE_STRATEGIES[rating];
      const mon = MONITORING_CONFIG[rating];
      return [
        r.org.orgName,
        rating,
        resp?.strategy ?? "",
        resp?.actions.join("; ") ?? "",
        mon?.frequency ?? "",
        mon?.kpis.join("; ") ?? "",
      ];
    });
    workbook.addWorksheet("Response Plan").addRows([rpHeaders, ...rpRows]);

    const buf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `transition_risk_assessment_${loanDate}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

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
                    <Shield size={13} className="text-white" />
                  </div>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Step 05 of 05 &mdash; Response &amp; Export
                  </span>
                </div>
                <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                  Response Strategy &amp; Export
                </h1>
                <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                  Review recommended actions, monitoring plans, and export the
                  full assessment workbook.
                </p>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Critical Orgs
                  </div>
                  <div className="text-[28px] font-bold text-white leading-none">
                    {criticalCount}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Total EAL
                  </div>
                  <div className="text-[28px] font-bold text-white leading-none">
                    {fmt(totalEAL, "")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 md:px-10 max-w-300 mx-auto w-full mt-6">
          <div className="flex gap-1 mb-6">
            {TABS.map((t, i) => (
              <button
                key={t}
                onClick={() => setTabValue(i)}
                className={`px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] transition-all ${
                  tabValue === i
                    ? "bg-[#86BC25] text-white"
                    : "bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] text-[#888] hover:text-[#333]"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="px-6 md:px-10 pb-10 max-w-300 mx-auto w-full">
          {tabValue === 0 && (
            <div className="space-y-4">
              {sortedResults.map((r) => {
                const c = r.current;
                if (!c) return null;
                const resp =
                  RESPONSE_STRATEGIES[c.rating] ??
                  RESPONSE_STRATEGIES.Negligible;
                return (
                  <div
                    key={r.org.id}
                    className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E3] dark:border-white/[0.06]">
                      <div className="flex items-center gap-3">
                        <RatingPill rating={c.rating} />
                        <span className="text-[14px] font-semibold text-[#333] dark:text-[#DDD]">
                          {r.org.orgName}
                        </span>
                        <span
                          className="text-[11px] text-[#888]"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {r.org.sector}
                        </span>
                      </div>
                      <div
                        className="flex items-center gap-4 text-[11px]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        <span className="text-[#888]">
                          Score{" "}
                          <span className="font-bold text-[#333] dark:text-[#DDD]">
                            {c.compositeScore.toFixed(0)}
                          </span>
                        </span>
                        <span className="text-[#888]">
                          EAL{" "}
                          <span className="font-bold text-[#333] dark:text-[#DDD]">
                            {fmt(c.transitionEalLocal, "")}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle
                          size={12}
                          style={{ color: TRANSITION_RATING_COLORS[c.rating] }}
                        />
                        <span className="text-[12px] font-semibold text-[#333] dark:text-[#DDD]">
                          {resp.strategy}
                        </span>
                      </div>
                      <ul className="space-y-1.5">
                        {resp.actions.map((a, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[12px] text-[#666] dark:text-[#AAA]"
                          >
                            <span className="mt-1.5 w-1 h-1 rounded-full bg-[#86BC25] shrink-0" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {tabValue === 1 && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-5">
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999] block mb-4"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Monitoring Frequency Distribution
                  <InfoTip text="How often each organisation should be reviewed based on its transition risk rating." />
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["Monthly", "Quarterly", "Semi-Annual", "Annual"].map(
                    (freq) => {
                      const count = currentResults.filter(
                        (r) =>
                          MONITORING_CONFIG[r.current?.rating ?? "Negligible"]
                            ?.frequency === freq,
                      ).length;
                      return (
                        <div
                          key={freq}
                          className="bg-[#F7F7F6] dark:bg-white/[0.03] rounded-xl p-4 text-center"
                        >
                          <div className="text-[22px] font-bold text-[#333] dark:text-[#DDD]">
                            {count}
                          </div>
                          <div
                            className="text-[11px] text-[#888] mt-1"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {freq}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E5E5E3] dark:border-white/[0.06]">
                  <h3 className="text-[14px] font-semibold text-[#333] dark:text-[#DDD]">
                    Monitoring Schedule
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-[#F7F7F6] dark:bg-white/[0.02]">
                        {[
                          "Organisation",
                          "Rating",
                          "Frequency",
                          "Description",
                          "KPI Metrics",
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
                      {sortedResults.map((r) => {
                        const rating = r.current?.rating ?? "Negligible";
                        const mc = MONITORING_CONFIG[rating];
                        return (
                          <tr
                            key={r.org.id}
                            className="border-t border-[#F0F0EE] dark:border-white/[0.04] hover:bg-[#FAFAF9] dark:hover:bg-white/[0.02]"
                          >
                            <td className="px-3 py-3 font-medium text-[#333] dark:text-[#DDD]">
                              {r.org.orgName}
                            </td>
                            <td className="px-3 py-3">
                              <RatingPill rating={rating} />
                            </td>
                            <td className="px-3 py-3 font-mono text-[#333] dark:text-[#DDD]">
                              {mc?.frequency}
                            </td>
                            <td className="px-3 py-3 text-[#666] dark:text-[#AAA]">
                              {mc?.description}
                            </td>
                            <td className="px-3 py-3 text-[#666] dark:text-[#AAA]">
                              {mc?.kpis.join(", ")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {tabValue === 2 && (
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1 space-y-6">
                <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <FileSpreadsheet size={20} className="text-[#86BC25]" />
                    <h3 className="text-[14px] font-semibold text-[#333] dark:text-[#DDD]">
                      Excel Workbook
                    </h3>
                  </div>
                  <p className="text-[12px] text-[#666] dark:text-[#AAA] mb-5 leading-relaxed">
                    Exports a comprehensive workbook containing configuration,
                    organisation profiles, full scenario � horizon results,
                    response plans, and monitoring schedules.
                  </p>
                  <div className="space-y-2 mb-6">
                    {[
                      "Configuration",
                      "Organisation Profiles",
                      "Assessment Results (all scenarios)",
                      "Response Plan",
                      "Monitoring Schedule",
                    ].map((sheet) => (
                      <div
                        key={sheet}
                        className="flex items-center gap-2 text-[12px] text-[#666] dark:text-[#AAA]"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#86BC25]" />
                        {sheet}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] transition-colors"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Download size={14} />
                    {exported ? "Downloaded" : "Export XLSX"}
                  </button>
                </div>
              </div>
              <div className="lg:w-72 shrink-0 space-y-5">
                <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-5">
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#999] block mb-3"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Export Summary
                  </span>
                  {[
                    {
                      label: "Organisations",
                      value: organisations.length.toString(),
                    },
                    { label: "Scenario", value: selectedScenario },
                    { label: "Horizon", value: selectedHorizon },
                    { label: "Total EAL", value: fmt(totalEAL, "") },
                    { label: "Critical Orgs", value: criticalCount.toString() },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex justify-between py-2 border-b border-[#F0F0EE] dark:border-white/[0.04] last:border-0"
                    >
                      <span
                        className="text-[11px] text-[#888]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="text-[11px] font-bold text-[#333] dark:text-[#DDD]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
