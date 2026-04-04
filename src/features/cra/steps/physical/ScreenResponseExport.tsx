import { useMemo, useState } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import { Workbook } from "exceljs";
import {
  AlertCircle,
  Download,
  FileSpreadsheet,
  FileCode,
  Info,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS,
  RATING_ORDER,
} from "../../domain/physicalRisk/constants";
import type { HazardRating } from "../../domain/physicalRisk/types";

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

const PRIORITY_COLORS: Record<string, string> = {
  Extreme: "#DC143C",
  "Very High": "#FF4500",
  High: "#FF8C00",
  Medium: "#FFD700",
  Low: "#90EE90",
  Negligible: "#D3D3D3",
};
const FREQ_COLORS = [
  "#86BC25",
  "#3B82F6",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];
const MONITORING_CONFIG: Record<
  string,
  { description: string; frequency: string; kpiMetrics: string[] }
> = {
  Extreme: {
    description: "Continuous monitoring",
    frequency: "Daily",
    kpiMetrics: ["Asset condition", "Recovery time", "Financial loss"],
  },
  "Very High": {
    description: "Intensive monitoring",
    frequency: "Weekly",
    kpiMetrics: ["Damage probability", "Financial exposure"],
  },
  High: {
    description: "Active monitoring",
    frequency: "Monthly",
    kpiMetrics: ["Risk score trend", "Mitigation progress"],
  },
  Medium: {
    description: "Periodic monitoring",
    frequency: "Quarterly",
    kpiMetrics: ["KPI benchmarking", "Budget adherence"],
  },
  Low: {
    description: "Standard monitoring",
    frequency: "Semi-Annual",
    kpiMetrics: ["Compliance status"],
  },
  Negligible: {
    description: "Basic monitoring",
    frequency: "Annual",
    kpiMetrics: ["Policy review"],
  },
};
const ORDERED_RATINGS: HazardRating[] = [
  "Extreme",
  "Very High",
  "High",
  "Medium",
  "Low",
  "Negligible",
];
const TABS = ["Action Plan", "Monitoring", "Export"];

function RatingPill({ rating }: { rating: HazardRating }) {
  const color = HAZARD_RATING_COLORS[rating] ?? "#888";
  return (
    <span
      className="text-[10px] font-semibold px-1.5 py-0.5 whitespace-nowrap"
      style={{
        fontFamily: "var(--font-mono)",
        backgroundColor: `${color}22`,
        color,
      }}
    >
      {rating}
    </span>
  );
}

export default function ScreenResponseExport() {
  const canvasRef = useHeroCanvas();
  const {
    config,
    mappedAssets,
    results,
    mode,
    config: cfg,
  } = usePhysicalRiskStore();
  const enrichedResults: Record<string, unknown>[] = [];
  const [tabValue, setTabValue] = useState(0);
  const [exported, setExported] = useState(false);

  const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    NGN: "\u20A6",
    GHS: "\u20B5",
    KES: "KSh",
    ZAR: "R",
    GBP: "\u00A3",
    EUR: "\u20AC",
  };
  const sym = CURRENCY_SYMBOLS[config.currency] ?? config.currency;
  const fmt = (v: number) =>
    v >= 1e9
      ? `${sym}${(v / 1e9).toFixed(2)}B`
      : v >= 1e6
        ? `${sym}${(v / 1e6).toFixed(2)}M`
        : v >= 1e3
          ? `${sym}${(v / 1e3).toFixed(1)}K`
          : `${sym}${v.toFixed(0)}`;

  const actionPlan = useMemo(
    () =>
      [...results].sort(
        (a, b) =>
          (RATING_ORDER[b.hazardRating] || 0) -
          (RATING_ORDER[a.hazardRating] || 0),
      ),
    [results],
  );

  const strategySummary = useMemo(() => {
    const m: Record<string, { count: number; eal: number }> = {};
    results.forEach((r) => {
      if (!m[r.responseStrategy]) m[r.responseStrategy] = { count: 0, eal: 0 };
      m[r.responseStrategy].count++;
      m[r.responseStrategy].eal += r.ealLocal;
    });
    return Object.entries(m).sort((a, b) => b[1].eal - a[1].eal);
  }, [results]);

  const totalEalBefore = useMemo(
    () => results.reduce((s, r) => s + r.ealLocal, 0),
    [results],
  );
  const totalEalAfter = useMemo(
    () => results.reduce((s, r) => s + r.ealLocal * (1 - r.sbraRrf), 0),
    [results],
  );
  const totalReduction =
    totalEalBefore > 0
      ? ((totalEalBefore - totalEalAfter) / totalEalBefore) * 100
      : 0;
  const criticalCount = useMemo(
    () =>
      results.filter((r) =>
        ["Extreme", "Very High", "High"].includes(r.hazardRating),
      ).length,
    [results],
  );

  const kpiByRisk = useMemo(() => {
    const m: Record<
      string,
      {
        ealBefore: number;
        ealAfter: number;
        ssl: number;
        rating: HazardRating;
        count: number;
      }
    > = {};
    results.forEach((r) => {
      if (!m[r.risk])
        m[r.risk] = {
          ealBefore: 0,
          ealAfter: 0,
          ssl: 0,
          rating: r.hazardRating,
          count: 0,
        };
      m[r.risk].ealBefore += r.ealLocal;
      m[r.risk].ealAfter += r.ealLocal * (1 - r.sbraRrf);
      m[r.risk].ssl = Math.max(m[r.risk].ssl, r.sslLocal);
      m[r.risk].count++;
      if (
        (RATING_ORDER[r.hazardRating] || 0) >
        (RATING_ORDER[m[r.risk].rating] || 0)
      )
        m[r.risk].rating = r.hazardRating;
    });
    return Object.entries(m)
      .sort((a, b) => b[1].ealBefore - a[1].ealBefore)
      .slice(0, 15);
  }, [results]);

  const freqSummary = useMemo(() => {
    const m: Record<string, number> = {};
    ORDERED_RATINGS.forEach((r) => {
      m[MONITORING_CONFIG[r]?.frequency || "Annual"] = 0;
    });
    results.forEach((r) => {
      const f = MONITORING_CONFIG[r.hazardRating]?.frequency || "Annual";
      m[f] = (m[f] || 0) + 1;
    });
    return Object.entries(m)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1]);
  }, [results]);

  const handleExportExcel = async () => {
    const workbook = new Workbook();
    const loanDate = new Date().toISOString().split("T")[0];

    const configRows = [
      ["Configuration Parameter", "Value"],
      ["Assessment Date", loanDate],
      ["Organisation", cfg.companyName || "N/A"],
      ["Sector", cfg.sectorId ?? "N/A"],
      ["Currency", cfg.currency],
      ["USD Rate", cfg.usdRate],
      ["Mode", mode ?? "N/A"],
      ["Matrix Size", cfg.matrixSize],
      ["Risk-Free Rate", "N/A"],
      ["Plan Horizon (yrs)", "N/A"],
      ["Total Assets", mappedAssets.length],
      ["Total Results", results.length],
    ];
    workbook.addWorksheet("Configuration").addRows(configRows);

    const assetHeaders = [
      "Name",
      "Asset Type",
      "Country",
      "Sector",
      "Value",
      "Currency",
      "Latitude",
      "Longitude",
    ];
    const assetRows = mappedAssets.map((a) => [
      a.name,
      a.assetType,
      a.region,
      a.sector,
      a.value,
      cfg.currency,
      a.latitude,
      a.longitude,
    ]);
    workbook
      .addWorksheet("Asset Register")
      .addRows([assetHeaders, ...assetRows]);

    const hazHeaders = [
      "Asset",
      "Asset Type",
      "Risk",
      "Hazard Rating",
      "Score",
      "Frequency Score",
      "Intensity Score",
      "EAL (Local)",
      "EAL (USD)",
      "SSL (Local)",
      "Response Strategy",
    ];
    const hazRows = results.map((r) => [
      r.asset,
      r.assetType,
      r.risk,
      r.hazardRating,
      r.riskScoreNorm,
      r.frequencyScore,
      r.intensityScore,
      r.ealLocal,
      r.ealUsd,
      r.sslLocal,
      r.responseStrategy,
    ]);
    workbook.addWorksheet("Hazard Results").addRows([hazHeaders, ...hazRows]);

    if (enrichedResults.length > 0) {
      const enrichHeaders = [
        "Asset",
        "Risk",
        "Temp Change (°C)",
        "Precip Change (%)",
        "Sea Level Rise (m)",
        "Extreme Event Freq",
      ];
      const enrichRows = enrichedResults.map((e) => [
        e.asset,
        e.risk,
        e.tempChange,
        e.precipChange,
        e.seaLevelRise,
        e.extremeEventFreq,
      ]);
      workbook
        .addWorksheet("Enriched Results")
        .addRows([enrichHeaders, ...enrichRows]);
    }

    const riskSummaryHeaders = [
      "Risk",
      "Max Rating",
      "Assets Exposed",
      "EAL Before",
      "EAL After",
      "Reduction (%)",
      "SSL",
    ];
    const riskSummaryRows = kpiByRisk.map(([risk, d]) => [
      risk,
      d.rating,
      d.count,
      d.ealBefore,
      d.ealAfter,
      d.ealBefore > 0
        ? (((d.ealBefore - d.ealAfter) / d.ealBefore) * 100).toFixed(1)
        : 0,
      d.ssl,
    ]);
    workbook
      .addWorksheet("Risk Summary")
      .addRows([riskSummaryHeaders, ...riskSummaryRows]);

    const respHeaders = [
      "Asset",
      "Risk",
      "Hazard Rating",
      "Response Strategy",
      "EAL Before",
      "EAL After",
      "SBRA RRF (%)",
      "SSL",
      "Priority",
    ];
    const respRows = actionPlan.map((r) => [
      r.asset,
      r.risk,
      r.hazardRating,
      r.responseStrategy,
      r.ealLocal,
      r.ealLocal * (1 - r.sbraRrf),
      (r.sbraRrf * 100).toFixed(1),
      r.sslLocal,
      RATING_ORDER[r.hazardRating] >= 4
        ? "High"
        : RATING_ORDER[r.hazardRating] >= 2
          ? "Medium"
          : "Low",
    ]);
    workbook.addWorksheet("Response Plan").addRows([respHeaders, ...respRows]);

    const monHeaders = [
      "Asset",
      "Risk",
      "Rating",
      "Monitoring Frequency",
      "Monitoring Description",
      "KPI Metrics",
    ];
    const monRows = results.map((r) => {
      const mc = MONITORING_CONFIG[r.hazardRating];
      return [
        r.asset,
        r.risk,
        r.hazardRating,
        mc?.frequency || "Annual",
        mc?.description || "",
        mc?.kpiMetrics?.join("; ") || "",
      ];
    });
    workbook.addWorksheet("Monitoring Plan").addRows([monHeaders, ...monRows]);

    const buf = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `physical_risk_assessment_${loanDate}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
  };

  const handleExportHeatMap = () => {
    const uniqueAssets = [...new Set(results.map((r) => r.asset))];
    const uniqueRisks = [...new Set(results.map((r) => r.risk))];
    const cells: Record<string, string> = {};
    results.forEach((r) => {
      cells[`${r.asset}||${r.risk}`] = r.hazardRating;
    });
    const rotatedTh = (text: string) =>
      `<th style="border:1px solid #D8D8D8;padding:0;min-width:28px;background:#F4F4F2;"><div style="writing-mode:vertical-rl;transform:rotate(180deg);height:80px;display:flex;align-items:center;justify-content:center;padding:4px;"><span style="font-size:10px;color:#555;white-space:nowrap;">${text}</span></div></th>`;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>GCB ESG Navigator - Physical Risk Heat Map</title>
<style>body{font-family:IBM Plex Mono,monospace;background:#F4F4F2;padding:32px}h1{font-size:18px;font-weight:700;margin-bottom:16px}table{border-collapse:collapse}td,th{border:1px solid #D8D8D8;font-size:11px}</style></head><body>
<h1>Physical Risk Heat Map</h1><p style="font-size:12px;color:#888;">Generated ${new Date().toLocaleString()}</p>
<div style="overflow:auto"><table><thead><tr><th style="border:1px solid #D8D8D8;padding:6px 12px;background:#F4F4F2;text-align:left;white-space:nowrap">Asset</th>
${uniqueRisks.map(rotatedTh).join("")}</tr></thead><tbody>
${uniqueAssets
  .map(
    (a, i) =>
      `<tr style="background:${i % 2 === 0 ? "#fff" : "#fafafa"}"><td style="border:1px solid #D8D8D8;padding:5px 10px;font-weight:600;white-space:nowrap;max-width:200px;overflow:hidden;">${a}</td>${uniqueRisks
        .map((r) => {
          const rating = cells[`${a}||${r}`];
          const color = rating
            ? HAZARD_RATING_COLORS[rating as HazardRating]
            : "#ccc";
          return rating
            ? `<td title="${a} - ${r}: ${rating}" style="background:${color}88;border:1px solid ${color}44;"></td>`
            : `<td style="border:1px solid #eee"></td>`;
        })
        .join("")}</tr>`,
  )
  .join("")}
</tbody></table></div>
<h2 style="margin-top:32px;font-size:14px">Legend</h2><div style="display:flex;gap:12px;flex-wrap:wrap">${ORDERED_RATINGS.map((r) => `<span style="background:${HAZARD_RATING_COLORS[r]}22;color:${HAZARD_RATING_COLORS[r]};font-weight:700;font-size:11px;padding:2px 8px;border:1px solid ${HAZARD_RATING_COLORS[r]}55">${r}</span>`).join("")}</div>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `heat_map_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (results.length === 0) {
    return (
      <div className="flex items-start gap-3 m-6 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 text-amber-700 dark:text-amber-400 text-[13px]">
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        No results yet. Run the assessment pipeline first.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ position: "fixed", top: 0, left: 0 }}
      />
      <style>{`
        @keyframes heroGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.05); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .saf-fu { animation: fadeUp 0.38s ease forwards; opacity: 0; }
        .saf-label {
          display: block;
          font-size: 12.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #8A8A88;
          margin-bottom: 8px;
          font-family: var(--font-mono);
          transition: color 0.18s ease;
        }
        .saf-field:focus-within .saf-label { color: #86BC25; }
        .saf-input {
          width: 100%;
          background: white;
          border: 1.5px solid #E2E2E0;
          padding: 12px 14px;
          font-size: 15px;
          color: #1A1A1A;
          outline: none;
          border-radius: 8px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .dark .saf-input { background: #161616; border-color: rgba(255,255,255,0.08); color: #F0F0F0; }
        .saf-input:focus { border-color: #86BC25; box-shadow: 0 0 0 3px rgba(134,188,37,0.10); background: #FEFFFE; }
        .dark .saf-input:focus { background: #1A1A1A; }
        .saf-input::placeholder { color: #B0B0AE; }
        .saf-field { position: relative; transition: transform 0.18s ease; }
        .saf-field:focus-within { transform: translateY(-1px); }
        .saf-card {
          background: white;
          border-radius: 12px;
          border: 1px solid #E8E8E6;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);
          transition: box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .dark .saf-card { background: #141414; border-color: rgba(255,255,255,0.06); box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
        .saf-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04); }
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
                  <Download size={13} className="text-white" />
                </div>
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Step 06 of 06 &mdash; Response and Export
                </span>
              </div>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                Response and Export
              </h1>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                Prioritised action plan, monitoring schedule, and full XLSX
                export.
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
                  Reduction
                </div>
                <div className="text-[30px] font-bold text-white leading-none">
                  {totalReduction.toFixed(0)}
                  <span className="text-[18px] text-white/40">%</span>
                </div>
              </div>
              {criticalCount > 0 && (
                <div className="text-right">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-red-400/60 mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Critical
                  </div>
                  <div className="text-[30px] font-bold text-red-400 leading-none">
                    {criticalCount}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-0.75 bg-white/6">
          <div
            className="h-full bg-[#86BC25]"
            style={{
              width: `${Math.min(totalReduction, 100)}%`,
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
              Step 06 / 06
            </div>
            <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
              Response and Export
            </h2>
            <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
              Prioritised action plan, monitoring schedule, and full XLSX
              export.
            </p>
          </div>

          <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/6">
            <div className="space-y-1">
              {[
                { num: "01", label: "Action plan" },
                { num: "02", label: "Monitoring" },
                { num: "03", label: "Export" },
              ].map((item) => (
                <div
                  key={item.num}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-sm"
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 border border-[#E2E2E0] dark:border-white/8 bg-[#F4F4F2] dark:bg-white/4 rounded-md">
                    <span
                      className="text-[9px] font-bold text-[#C0C0BE] dark:text-[#555]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.num}
                    </span>
                  </div>
                  <span className="text-[13px] text-[#A0A09E] dark:text-[#555]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 py-5 flex-1">
            <div className="space-y-4">
              {[
                {
                  label: "EAL Before",
                  value: fmt(totalEalBefore),
                  tip: "Expected Annual Loss before resilience measures are applied.",
                },
                {
                  label: "EAL After",
                  value: fmt(totalEalAfter),
                  green: true,
                  tip: "Expected Annual Loss after resilience measures reduce vulnerability.",
                },
                {
                  label: "Reduction",
                  value: `${totalReduction.toFixed(1)}%`,
                  green: true,
                  tip: undefined,
                },
                {
                  label: "Critical",
                  value: criticalCount,
                  red: true,
                  tip: undefined,
                },
              ].map((k) => (
                <div key={k.label}>
                  <span
                    className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] block mb-0.5 flex items-center"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {k.label}
                    {k.tip && <InfoTip text={k.tip} />}
                  </span>
                  <div
                    className={`text-[18px] font-semibold leading-none ${k.green ? "text-[#86BC25]" : k.red ? "text-red-500" : "text-[#111] dark:text-[#F0F0F0]"}`}
                  >
                    {k.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 space-y-6 overflow-y-auto">
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 06 of 06 — Response and Export
            </p>
            <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
              Response and Export
            </h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                label: "EAL Before Measures",
                tip: "Expected Annual Loss before resilience measures are applied.",
                v: fmt(totalEalBefore),
                c: "#EF4444",
              },
              {
                label: "EAL After Measures",
                tip: "Expected Annual Loss after resilience measures reduce vulnerability.",
                v: fmt(totalEalAfter),
                c: "#86BC25",
              },
              {
                label: "Portfolio Reduction",
                tip: undefined,
                v: `${totalReduction.toFixed(1)}%`,
                c: "#3B82F6",
              },
              {
                label: "Critical Risk Combos",
                tip: undefined,
                v: criticalCount,
                c: "#DC143C",
              },
            ].map((k) => (
              <div
                key={k.label}
                className="p-4 border border-[#D8D8D8] dark:border-white/7 bg-white dark:bg-[#111]"
                style={{ borderTop: `2px solid ${k.c}` }}
              >
                <div
                  className="text-[11px] text-[#888] dark:text-[#555] uppercase tracking-[0.06em] mb-1 leading-tight flex items-center"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {k.label}
                  {k.tip && <InfoTip text={k.tip} />}
                </div>
                <div className="text-[22px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none">
                  {k.v}
                </div>
              </div>
            ))}
          </div>

          <div className="flex border-b border-[#D8D8D8] dark:border-white/7">
            {TABS.map((tab, idx) => (
              <button
                key={tab}
                onClick={() => setTabValue(idx)}
                className={`px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                  tabValue === idx
                    ? "border-b-2 border-[#86BC25] text-[#86BC25]"
                    : "text-[#888] dark:text-[#666] hover:text-[#333] dark:hover:text-white"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {tab}
              </button>
            ))}
          </div>

          {tabValue === 0 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {strategySummary.slice(0, 4).map(([strat, info], idx) => (
                  <div
                    key={strat}
                    className="p-4 bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7"
                    style={{
                      borderTop: `2px solid ${FREQ_COLORS[idx] || "#86BC25"}`,
                    }}
                  >
                    <div
                      className="text-[11px] text-[#888] uppercase tracking-[0.06em] mb-1"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {strat}
                    </div>
                    <div className="text-[20px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none mb-0.5">
                      {info.count}
                    </div>
                    <div className="text-[11px] text-[#888]">
                      {fmt(info.eal)} EAL
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7">
                <div className="px-5 py-4 border-b border-[#E5E5E5] dark:border-white/6 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">
                    Prioritised Action Plan
                  </span>
                  <span
                    className="text-[11px] text-[#888]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {actionPlan.length} items
                  </span>
                </div>
                <div className="overflow-auto max-h-125">
                  <table className="w-full border-collapse text-[12px]">
                    <thead className="sticky top-0 bg-[#F4F4F2] dark:bg-[#141414]">
                      <tr>
                        {[
                          { h: "#", tip: undefined },
                          { h: "Asset", tip: undefined },
                          { h: "Risk", tip: undefined },
                          { h: "Rating", tip: undefined },
                          { h: "Strategy", tip: undefined },
                          {
                            h: "EAL Before",
                            tip: "Expected Annual Loss before resilience measures.",
                          },
                          {
                            h: "EAL After",
                            tip: "Expected Annual Loss after resilience reduction factor (RRF) applied.",
                          },
                          {
                            h: "RRF %",
                            tip: "Resilience Reduction Factor: the percentage reduction in vulnerability from resilience measures. Based on SBRA (Sector-Based) or ALRA (Asset-Level) methodology.",
                          },
                          {
                            h: "SSL",
                            tip: "Stress Scenario Loss: maximum potential loss under an extreme stress event.",
                          },
                        ].map(({ h, tip }) => (
                          <th
                            key={h}
                            className="px-3 py-1.5 text-left text-[11px] font-semibold text-[#888] border-b border-[#D8D8D8] dark:border-white/7 whitespace-nowrap"
                          >
                            <span className="inline-flex items-center gap-0.5">
                              {h}
                              {tip && <InfoTip text={tip} />}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {actionPlan.map((r, i) => (
                        <tr
                          key={i}
                          className={
                            i % 2 === 0
                              ? "bg-white dark:bg-[#111]"
                              : "bg-[#F9F9F8] dark:bg-[#141414]/50"
                          }
                        >
                          <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-[#888]">
                            {i + 1}
                          </td>
                          <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 truncate max-w-25">
                            {r.asset}
                          </td>
                          <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 truncate max-w-25">
                            {r.risk}
                          </td>
                          <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5">
                            <RatingPill rating={r.hazardRating} />
                          </td>
                          <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5">
                            <span
                              className="text-[10px] px-1.5 py-0.5 font-semibold"
                              style={{
                                fontFamily: "var(--font-mono)",
                                backgroundColor: `${PRIORITY_COLORS[r.hazardRating] || "#888"}22`,
                                color:
                                  PRIORITY_COLORS[r.hazardRating] || "#888",
                              }}
                            >
                              {r.responseStrategy}
                            </span>
                          </td>
                          <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 font-semibold text-red-500">
                            {fmt(r.ealLocal)}
                          </td>
                          <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 font-semibold text-[#86BC25]">
                            {fmt(r.ealLocal * (1 - r.sbraRrf))}
                          </td>
                          <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-[#888]">
                            {(r.sbraRrf * 100).toFixed(0)}%
                          </td>
                          <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5">
                            {fmt(r.sslLocal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {tabValue === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7 p-5">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] mb-4"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Monitoring Frequency Distribution
                  </div>
                  <div className="space-y-3">
                    {freqSummary.map(([freq, count], idx) => {
                      const maxCount = freqSummary[0]?.[1] || 1;
                      return (
                        <div key={freq}>
                          <div className="flex justify-between mb-1">
                            <span className="text-[12px] text-[#555] dark:text-[#999]">
                              {freq}
                            </span>
                            <span
                              className="text-[11px] font-semibold text-[#333] dark:text-[#CCC]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {count}
                            </span>
                          </div>
                          <div className="h-5 bg-[#F4F4F2] dark:bg-white/4">
                            <div
                              className="h-5 transition-all duration-500"
                              style={{
                                width: `${(count / maxCount) * 100}%`,
                                backgroundColor: FREQ_COLORS[idx] || "#86BC25",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-3">
                  {ORDERED_RATINGS.filter((r) =>
                    results.some((res) => res.hazardRating === r),
                  )
                    .slice(0, 4)
                    .map((rating) => {
                      const mc = MONITORING_CONFIG[rating];
                      const color = HAZARD_RATING_COLORS[rating];
                      return (
                        <div
                          key={rating}
                          className="p-3 border border-[#D8D8D8] dark:border-white/7 bg-white dark:bg-[#111]"
                          style={{ borderLeft: `3px solid ${color}` }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <RatingPill rating={rating as HazardRating} />
                            <span
                              className="text-[11px] text-[#888]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {mc.frequency}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#555] dark:text-[#999]">
                            {mc.description}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
              <div className="bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7">
                <div className="px-5 py-4 border-b border-[#E5E5E5] dark:border-white/6">
                  <span className="text-[13px] font-semibold text-[#333] dark:text-[#CCC]">
                    Risk KPI Summary (Top 15)
                  </span>
                </div>
                <div className="overflow-auto max-h-95">
                  <table className="w-full border-collapse text-[12px]">
                    <thead className="sticky top-0 bg-[#F4F4F2] dark:bg-[#141414]">
                      <tr>
                        {[
                          { h: "Risk", tip: undefined },
                          { h: "Rating", tip: undefined },
                          {
                            h: "EAL Before",
                            tip: "Expected Annual Loss before resilience measures.",
                          },
                          {
                            h: "EAL After",
                            tip: "Expected Annual Loss after RRF applied.",
                          },
                          { h: "Reduction", tip: undefined },
                          {
                            h: "Max SSL",
                            tip: "Stress Scenario Loss: maximum potential loss under a stress event.",
                          },
                          { h: "Assets", tip: undefined },
                        ].map(({ h, tip }) => (
                          <th
                            key={h}
                            className="px-3 py-1.5 text-left text-[11px] font-semibold text-[#888] border-b border-[#D8D8D8] dark:border-white/7 whitespace-nowrap"
                          >
                            <span className="inline-flex items-center gap-0.5">
                              {h}
                              {tip && <InfoTip text={tip} />}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {kpiByRisk.map(([risk, d], i) => {
                        const red =
                          d.ealBefore > 0
                            ? ((d.ealBefore - d.ealAfter) / d.ealBefore) * 100
                            : 0;
                        return (
                          <tr
                            key={risk}
                            className={
                              i % 2 === 0
                                ? "bg-white dark:bg-[#111]"
                                : "bg-[#F9F9F8] dark:bg-[#141414]/50"
                            }
                          >
                            <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 truncate max-w-30">
                              {risk}
                            </td>
                            <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5">
                              <RatingPill rating={d.rating} />
                            </td>
                            <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-red-500 font-semibold">
                              {fmt(d.ealBefore)}
                            </td>
                            <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-[#86BC25] font-semibold">
                              {fmt(d.ealAfter)}
                            </td>
                            <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5">
                              {red.toFixed(1)}%
                            </td>
                            <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5">
                              {fmt(d.ssl)}
                            </td>
                            <td className="px-3 py-1.5 border-b border-[#E5E5E5] dark:border-white/5 text-[#888]">
                              {d.count}
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
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7">
                  <div className="flex items-center gap-3 mb-3">
                    <FileSpreadsheet size={20} color="#86BC25" />
                    <span className="text-[14px] font-semibold text-[#111] dark:text-[#F0F0F0]">
                      Full XLSX Workbook
                    </span>
                  </div>
                  <p className="text-[13px] text-[#888] dark:text-[#666] mb-4 leading-relaxed">
                    7-sheet Excel workbook: Configuration, Asset Register,
                    Hazard Results, Enriched Results, Risk Summary, Response
                    Plan, Monitoring Plan.
                  </p>
                  <button
                    onClick={handleExportExcel}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] transition-colors"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Download size={13} />
                    Download Excel
                  </button>
                  {exported && (
                    <div
                      className="mt-3 text-[11px] text-[#86BC25]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Exported successfully
                    </div>
                  )}
                </div>
                <div className="p-6 bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7">
                  <div className="flex items-center gap-3 mb-3">
                    <FileCode size={20} color="#3B82F6" />
                    <span className="text-[14px] font-semibold text-[#111] dark:text-[#F0F0F0]">
                      HTML Heat Map
                    </span>
                  </div>
                  <p className="text-[13px] text-[#888] dark:text-[#666] mb-4 leading-relaxed">
                    Standalone HTML file with the asset - hazard heat map,
                    colour-coded by rating. Shareable without software
                    dependencies.
                  </p>
                  <button
                    onClick={handleExportHeatMap}
                    className="flex items-center gap-2 px-5 py-2.5 border border-[#3B82F6] text-[#3B82F6] text-[12px] font-semibold uppercase tracking-[0.08em] hover:bg-[#3B82F6]/10 transition-colors"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    <Download size={13} />
                    Download Heat Map
                  </button>
                </div>
              </div>
              <div className="px-4 py-3 border border-[#E5E5E5] dark:border-white/6 bg-white dark:bg-[#111] text-[12px] text-[#888]">
                <span className="font-semibold text-[#555] dark:text-[#999]">
                  Summary:{" "}
                </span>
                {results.length} risk combinations - {mappedAssets.length}{" "}
                assets - EAL {fmt(totalEalBefore)} → {fmt(totalEalAfter)} (
                {totalReduction.toFixed(1)}% reduction)
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
