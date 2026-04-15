import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  CheckCircle,
  BarChart3,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS,
  RATING_ORDER,
} from "../../domain/physicalRisk/constants";
import type { EnrichedResult } from "../../domain/physicalRisk/types";

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

function downloadCsv(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildHazardCsv(
  results: EnrichedResult[],
  sym: string,
  assetName: string,
): string {
  const header = [
    "Asset",
    "Hazard",
    "Hazard Rating",
    "Intensity",
    "Frequency",
    `Asset Value (${sym})`,
    "Exposure Factor",
    "Inherent Vulnerability",
    "RRF",
    "Net Vulnerability",
    `SSL (${sym})`,
    "Annual Probability",
    `EAL (${sym})`,
    "Response Strategy",
    "Priority",
    "Timeframe",
  ].join(",");
  const rows = results.map((r) =>
    [
      `"${assetName}"`,
      `"${r.risk}"`,
      `"${r.hazardRating}"`,
      `"${r.intensityLabel}"`,
      `"${r.frequencyLabel}"`,
      r.assetValueLocal.toFixed(2),
      r.exposureFactor.toFixed(4),
      r.inherentVulnerability.toFixed(4),
      r.sbraRrf.toFixed(4),
      r.sbraNetVulnerability.toFixed(4),
      r.sslLocal.toFixed(2),
      r.annualProbability.toFixed(4),
      r.ealLocal.toFixed(2),
      `"${r.responseStrategy}"`,
      `"${r.responsePriority}"`,
      `"${r.responseTimeframe}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function buildCalcCsv(
  results: EnrichedResult[],
  sym: string,
  assetName: string,
): string {
  const header = [
    "Asset",
    "Hazard",
    "Rating",
    `Asset Value (${sym})`,
    "EF",
    `Exposed Value (${sym})`,
    "IV",
    "RRF",
    "Net Vuln",
    `SSL (${sym})`,
    "Annual Prob",
    `EAL (${sym})`,
    "Residual Score",
    "Residual Rating",
    "Monitoring KPI",
    "Monitoring Frequency",
    "Monitoring Trigger",
    "Data Source",
  ].join(",");
  const rows = results.map((r) =>
    [
      `"${assetName}"`,
      `"${r.risk}"`,
      `"${r.hazardRating}"`,
      r.assetValueLocal.toFixed(2),
      r.exposureFactor.toFixed(4),
      r.exposedValueLocal.toFixed(2),
      r.inherentVulnerability.toFixed(4),
      r.sbraRrf.toFixed(4),
      r.sbraNetVulnerability.toFixed(4),
      r.sslLocal.toFixed(2),
      r.annualProbability.toFixed(4),
      r.ealLocal.toFixed(2),
      r.residualRiskScore,
      `"${r.residualRiskRating}"`,
      `"${r.monitoringKpi}"`,
      `"${r.monitoringFrequency}"`,
      `"${r.monitoringTrigger}"`,
      `"${r.dataSource}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function buildMonitoringCsv(
  results: EnrichedResult[],
  assetName: string,
): string {
  const header = [
    "Asset",
    "Hazard",
    "KPI",
    "Frequency",
    "Trigger",
    "Data Source",
    "Owner Role",
    "Response Strategy",
    "Priority",
    "Timeframe",
  ].join(",");
  const rows = results.map((r) =>
    [
      `"${assetName}"`,
      `"${r.risk}"`,
      `"${r.monitoringKpi}"`,
      `"${r.monitoringFrequency}"`,
      `"${r.monitoringTrigger}"`,
      `"${r.monitoringDataSource}"`,
      `"${r.monitoringOwnerRole}"`,
      `"${r.responseStrategy}"`,
      `"${r.responsePriority}"`,
      `"${r.responseTimeframe}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

export default function SingleExport() {
  const navigate = useNavigate();
  const canvasRef = useHeroCanvas();
  const { config, mappedAssets, results } = usePhysicalRiskStore();
  const [exported, setExported] = useState<Set<string>>(new Set());
  const [includeCalc, setIncludeCalc] = useState(true);
  const [includeMonitoring, setIncludeMonitoring] = useState(true);

  const asset = mappedAssets[0];
  const sym = config.currency === "USD" ? "$" : "\u20A6";
  const totalEal = results.reduce((s, r) => s + r.ealLocal, 0);
  const worstRating =
    results.length > 0
      ? [...results].sort(
          (a, b) => RATING_ORDER[b.hazardRating] - RATING_ORDER[a.hazardRating],
        )[0].hazardRating
      : "Negligible";

  const markExported = (key: string) =>
    setExported((p) => new Set([...p, key]));

  const handleHazardCsv = useCallback(() => {
    if (!asset) return;
    downloadCsv(
      `${asset.name.replace(/\s+/g, "_")}_hazard_breakdown.csv`,
      buildHazardCsv(results, sym, asset.name),
    );
    markExported("hazard");
  }, [asset, results, sym]);

  const handleCalcCsv = useCallback(() => {
    if (!asset) return;
    downloadCsv(
      `${asset.name.replace(/\s+/g, "_")}_worked_calculations.csv`,
      buildCalcCsv(results, sym, asset.name),
    );
    markExported("calc");
  }, [asset, results, sym]);

  const handleMonitoringCsv = useCallback(() => {
    if (!asset) return;
    downloadCsv(
      `${asset.name.replace(/\s+/g, "_")}_monitoring_plan.csv`,
      buildMonitoringCsv(results, asset.name),
    );
    markExported("monitoring");
  }, [asset, results]);

  const handleExportAll = useCallback(() => {
    handleHazardCsv();
    if (includeCalc) handleCalcCsv();
    if (includeMonitoring) handleMonitoringCsv();
    markExported("all");
  }, [
    handleHazardCsv,
    handleCalcCsv,
    handleMonitoringCsv,
    includeCalc,
    includeMonitoring,
  ]);

  const handlePrint = useCallback(() => {
    window.print();
    markExported("print");
  }, []);

  if (results.length === 0) {
    return (
      <div className="mt-8 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[14px] text-blue-700 dark:text-blue-400">
        No results to export. Run the assessment first.
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] relative">
      <canvas
        ref={canvasRef}
        className="pointer-events-none z-0"
        style={{ position: "fixed", top: 0, left: 0 }}
      />
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroGlow { 0%, 100% { opacity: 0.15; transform: scale(1); } 50% { opacity: 0.25; transform: scale(1.05); } }
        .saf-fu { animation: fadeUp 0.38s ease forwards; opacity: 0; }
      `}</style>
      <div className="relative z-10 overflow-hidden bg-[#1A3C21] dark:bg-[#0F1F13]">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `repeating-linear-gradient(135deg,transparent,transparent 40px,rgba(255,255,255,0.5) 40px,rgba(255,255,255,0.5) 41px)`,
          }}
        />
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle,#86BC25 0%,transparent 70%)",
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
                  Step 07 of 07 &mdash; Export Results
                </span>
              </div>
              <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                Export Results
              </h1>
              <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                Download the assessment for{" "}
                <span className="text-white/80 font-medium">
                  {asset?.name ?? "asset"}
                </span>{" "}
                &mdash; {results.length} hazards assessed.
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
                  Hazards
                </div>
                <div className="text-[30px] font-bold text-white leading-none">
                  {results.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="relative z-10 flex-1 flex">
        <div className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[#D8D8D8] dark:border-white/7 bg-white dark:bg-[#111]">
          <div className="px-5 py-6 border-b border-[#EBEBEB] dark:border-white/6">
            <div
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 07 / 07
            </div>
            <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight mb-1">
              Export Results
            </h2>
            <p className="text-[12px] text-[#888] dark:text-[#666] leading-relaxed">
              Download hazard breakdown, worked calculations, and monitoring
              plan.
            </p>
          </div>
          <div className="px-5 py-4 border-b border-[#EBEBEB] dark:border-white/6">
            <div className="space-y-0.5">
              {[
                { num: "01", label: "Hazard breakdown" },
                { num: "02", label: "Worked calculations" },
                { num: "03", label: "Monitoring plan" },
                { num: "04", label: "Print summary" },
              ].map((item) => (
                <div
                  key={item.num}
                  className="flex items-center gap-3 px-2 py-2"
                >
                  <div className="w-5 h-5 flex items-center justify-center shrink-0 border border-[#E2E2E0] dark:border-white/8 bg-[#F4F4F2] dark:bg-white/4 rounded-md">
                    <span
                      className="text-[9px] font-bold text-[#C0C0BE] dark:text-[#555]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {item.num}
                    </span>
                  </div>
                  <span className="text-[12px] text-[#A0A09E] dark:text-[#555]">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 py-5 flex-1">
            <div className="space-y-4">
              {(
                [
                  { label: "Asset", value: asset?.name ?? "\u2014" },
                  { label: "Hazards", value: String(results.length) },
                  { label: "Overall", value: worstRating, rated: true },
                  { label: "Total EAL", value: fmt(totalEal, sym) },
                ] as Array<{ label: string; value: string; rated?: boolean }>
              ).map((k) => (
                <div key={k.label}>
                  <span
                    className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] dark:text-[#555] block mb-0.5"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {k.label}
                  </span>
                  <div
                    className={`text-[13px] font-semibold leading-none truncate ${k.rated ? "text-[#86BC25]" : "text-[#111] dark:text-[#F0F0F0]"}`}
                  >
                    {k.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 px-6 md:px-8 xl:pr-12 py-7 overflow-y-auto">
          <div className="max-w-175 mx-auto py-3">
            <div className="pra-surface overflow-hidden mb-4">
              <div className="h-1 bg-linear-to-r from-green-500 to-primary-500" />
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                  <Download size={28} className="text-green-500" />
                </div>
                <h2 className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                  Export Results
                </h2>
                <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mb-5">
                  Download the assessment results for{" "}
                  <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">
                    {asset?.name}
                  </strong>{" "}
                  &middot; {results.length} hazards assessed &middot; Overall{" "}
                  {worstRating}
                </p>
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-0.5">
                      Hazards
                    </p>
                    <p className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {results.length}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-0.5">
                      Total EAL
                    </p>
                    <p className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {fmt(totalEal, sym)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] mb-0.5">
                      Worst Rating
                    </p>
                    <span
                      className="text-[12px] font-bold px-2.5 py-1 rounded-full mt-0.5 inline-block"
                      style={{
                        color: HAZARD_RATING_COLORS[worstRating],
                        backgroundColor: `${HAZARD_RATING_COLORS[worstRating]}18`,
                      }}
                    >
                      {worstRating}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2.5 mb-4">
              <ExportCard
                icon={<FileSpreadsheet size={20} />}
                title="Hazard Breakdown"
                description="Full hazard-by-hazard results including ratings, EF, vulnerability, SSL, EAL, and response strategies."
                format="CSV"
                isDone={exported.has("hazard")}
                onExport={handleHazardCsv}
              />
              <ExportCard
                icon={<FileText size={20} />}
                title="Worked Calculations"
                description="Detailed calculation audit trail per hazard: asset value, EF, exposed value, IV, RRF, net vulnerability, SSL, probability, EAL, residual risk."
                format="CSV"
                isDone={exported.has("calc")}
                onExport={handleCalcCsv}
              />
              <ExportCard
                icon={<BarChart3 size={20} />}
                title="Monitoring & Response Plan"
                description="Per-hazard monitoring KPIs, frequencies, triggers, data sources, owner roles, and response assignments."
                format="CSV"
                isDone={exported.has("monitoring")}
                onExport={handleMonitoringCsv}
              />
              <ExportCard
                icon={<Printer size={20} />}
                title="Print Summary"
                description="Open browser print dialog for a printer-friendly version of the results."
                format="PRINT"
                isDone={exported.has("print")}
                onExport={handlePrint}
              />
            </div>
            <div className="pra-surface p-5">
              <h3 className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">
                Export All
              </h3>
              <div className="space-y-3 mb-4">
                {[
                  {
                    key: "calc",
                    label: "Include worked calculations",
                    value: includeCalc,
                    set: setIncludeCalc,
                  },
                  {
                    key: "mon",
                    label: "Include monitoring plan",
                    value: includeMonitoring,
                    set: setIncludeMonitoring,
                  },
                ].map((t) => (
                  <label
                    key={t.key}
                    className="flex items-center gap-3 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={t.value}
                      onChange={(e) => t.set(e.target.checked)}
                      className="w-4 h-4 accent-primary-500 cursor-pointer"
                    />
                    <span className="text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]">
                      {t.label}
                    </span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleExportAll}
                className="w-full py-3.5 rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{
                  background: exported.has("all")
                    ? "#10B981"
                    : "linear-gradient(135deg, #86BC25, #10B981)",
                  boxShadow: "0 2px 16px rgba(134,188,37,0.25)",
                }}
              >
                {exported.has("all") ? (
                  <CheckCircle size={18} />
                ) : (
                  <Download size={18} />
                )}
                {exported.has("all")
                  ? "All Files Downloaded"
                  : `Download All (${1 + (includeCalc ? 1 : 0) + (includeMonitoring ? 1 : 0)} files)`}
              </button>
            </div>
            <div className="bg-white dark:bg-[#111] border-t-2 border-[#86BC25] px-5 md:px-6 py-6 mt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#86BC25] mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Assessment complete
                  </p>
                  <h3 className="text-[17px] font-bold text-[#111] dark:text-[#F0F0F0] mb-1">
                    Continue to Transition Risk Assessment
                  </h3>
                  <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
                    Analyse exposure to policy, technology, market and
                    reputational transition risks.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/cra/transition-risk")}
                  className="flex items-center gap-2 bg-[#1A3C21] text-white text-[13px] font-bold px-6 py-3 hover:opacity-90 transition-opacity shrink-0"
                  style={{ boxShadow: "0 2px 14px rgba(26,60,33,0.30)" }}
                >
                  <TrendingDown size={14} />
                  Transition Risk
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportCard({
  icon,
  title,
  description,
  format,
  isDone,
  onExport,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  format: string;
  isDone: boolean;
  onExport: () => void;
}) {
  return (
    <div
      onClick={onExport}
      className="pra-surface p-4 flex items-center gap-3 cursor-pointer hover:border-primary-500/40 transition-colors"
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
          isDone
            ? "bg-green-500/10 text-green-500"
            : "bg-black/3 dark:bg-white/4 text-[#6E6E73] dark:text-[#86868B]"
        }`}
      >
        {isDone ? <CheckCircle size={20} /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            {title}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/5 text-[#6E6E73] dark:text-[#86868B]">
            {format}
          </span>
        </div>
        <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-snug">
          {description}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onExport();
        }}
        className={`shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
          isDone
            ? "border-green-500/40 text-green-500 bg-green-500/5"
            : "border-black/12 dark:border-white/12 text-[#6E6E73] dark:text-[#86868B] hover:border-primary-500/40 hover:text-primary-500"
        }`}
      >
        {isDone ? <CheckCircle size={13} /> : <Download size={13} />}
        {isDone ? "Done" : "Export"}
      </button>
    </div>
  );
}
