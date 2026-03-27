import { useCallback, useState } from "react";
import {
  Check,
  Download,
  FileText,
  FileSpreadsheet,
  Printer,
  CheckCircle,
  BarChart3,
} from "lucide-react";
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
    <div className="flex-1 flex bg-[#F4F4F2] dark:bg-[#0D0D0D] min-h-[calc(100vh-140px)]">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fu { animation: fadeUp 0.38s ease forwards; opacity: 0; }
      `}</style>

      {/* Left rail */}
      <div className="hidden lg:flex flex-col w-[300px] flex-shrink-0 border-r border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]">
        {/* Panel 1 – Header */}
        <div className="px-6 py-7 border-b border-[#EBEBEB] dark:border-white/[0.06]">
          <div
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Step 07 / 07
          </div>
          <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
            Export Results
          </h2>
          <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
            Download assessment reports in CSV format or print a summary.
          </p>
        </div>

        {/* Panel 2 – Key stats */}
        <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/[0.06]">
          <div className="space-y-3">
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] block mb-0.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Hazards
              </span>
              <div className="text-[22px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none">
                {results.length}
              </div>
            </div>
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] block mb-0.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Total EAL
              </span>
              <div className="text-[18px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none">
                {fmt(totalEal, sym)}
              </div>
            </div>
            <div>
              <span
                className="text-[10px] uppercase tracking-[0.12em] text-[#AAA] block mb-0.5"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Worst Risk
              </span>
              <div
                className="text-[13px] font-semibold"
                style={{ color: HAZARD_RATING_COLORS[worstRating] }}
              >
                {worstRating}
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3 – Export checklist */}
        <div className="px-6 py-5 flex-1">
          <div className="space-y-1">
            {[
              { num: "01", label: "File Selection" },
              { num: "02", label: "Format Options" },
              { num: "03", label: "Download Files" },
              { num: "04", label: "Confirm Export" },
            ].map((item, i) => {
              const stepDone = exported.size > i;
              const active = !stepDone && exported.size === i;
              return (
                <div
                  key={item.num}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200 ${
                    active ? "bg-[#F7FAF0] dark:bg-[#86BC25]/[0.06]" : ""
                  }`}
                >
                  <div
                    className={`w-5 h-5 flex items-center justify-center flex-shrink-0 border transition-all duration-300 ${
                      stepDone
                        ? "bg-[#86BC25] border-[#86BC25]"
                        : active
                          ? "border-[#86BC25]"
                          : "border-[#DDD] dark:border-white/[0.10]"
                    }`}
                  >
                    {stepDone ? (
                      <Check size={10} className="text-white" strokeWidth={3} />
                    ) : (
                      <span
                        className={`text-[9px] font-bold ${
                          active
                            ? "text-[#86BC25]"
                            : "text-[#CCC] dark:text-[#555]"
                        }`}
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {item.num}
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-[13px] transition-colors duration-200 ${
                      stepDone
                        ? "text-[#86BC25] font-medium"
                        : active
                          ? "text-[#111] dark:text-[#EEE] font-medium"
                          : "text-[#AAA] dark:text-[#555]"
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 overflow-y-auto">
        <div className="max-w-[820px]">
          <div className="fu mb-7" style={{ animationDelay: "0ms" }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#888] dark:text-[#555] mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Step 07 — Export
            </p>
            <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
              Export Results
            </h1>
          </div>

          {/* Export Cards */}
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

          {/* Export All */}
          <div className="bg-white dark:bg-[#141414] border border-[#E5E5E5] dark:border-white/[0.07] p-5">
            <h3
              className="text-[13px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555] mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
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
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div
                    onClick={() => t.set((v: boolean) => !v)}
                    className={`w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-colors cursor-pointer ${t.value ? "bg-[#86BC25] border-[#86BC25]" : "bg-white dark:bg-[#1A1A1A] border-[#D8D8D8] dark:border-white/[0.15]"}`}
                  >
                    {t.value && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path
                          d="M1 3L3.5 5.5L8 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-[14px] text-[#111] dark:text-[#F0F0F0]">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleExportAll}
              className="flex items-center gap-2 bg-[#86BC25] text-white text-[14px] font-semibold px-6 py-3 transition-opacity hover:opacity-90"
              style={
                exported.has("all") ? { background: "#10B981" } : undefined
              }
            >
              {exported.has("all") ? (
                <CheckCircle size={16} />
              ) : (
                <Download size={16} />
              )}
              {exported.has("all")
                ? "All Files Downloaded"
                : `Download All (${1 + (includeCalc ? 1 : 0) + (includeMonitoring ? 1 : 0)} files)`}
            </button>
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
        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
          isDone
            ? "bg-green-500/10 text-green-500"
            : "bg-black/[0.03] dark:bg-white/[0.04] text-[#6E6E73] dark:text-[#86868B]"
        }`}
      >
        {isDone ? <CheckCircle size={20} /> : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">
            {title}
          </span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.05] text-[#6E6E73] dark:text-[#86868B]">
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
        className={`flex-shrink-0 flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
          isDone
            ? "border-green-500/40 text-green-500 bg-green-500/5"
            : "border-black/[0.12] dark:border-white/[0.12] text-[#6E6E73] dark:text-[#86868B] hover:border-primary-500/40 hover:text-primary-500"
        }`}
      >
        {isDone ? <CheckCircle size={13} /> : <Download size={13} />}
        {isDone ? "Done" : "Export"}
      </button>
    </div>
  );
}
