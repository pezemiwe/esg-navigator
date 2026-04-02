import { useCallback, useState } from "react";
import {
  Download, FileText, FileSpreadsheet, Printer, CheckCircle, BarChart3,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { HAZARD_RATING_COLORS, RATING_ORDER } from "../../domain/physicalRisk/constants";
import type { EnrichedResult } from "../../domain/physicalRisk/types";

const fmt = (v: number, sym: string) =>
  v >= 1e9 ? `${sym}${(v / 1e9).toFixed(2)}B`
  : v >= 1e6 ? `${sym}${(v / 1e6).toFixed(2)}M`
  : v >= 1e3 ? `${sym}${(v / 1e3).toFixed(1)}K`
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

function buildHazardCsv(results: EnrichedResult[], sym: string, assetName: string): string {
  const header = [
    "Asset","Hazard","Hazard Rating","Intensity","Frequency",
    `Asset Value (${sym})`, "Exposure Factor","Inherent Vulnerability","RRF",
    "Net Vulnerability",`SSL (${sym})`,"Annual Probability",`EAL (${sym})`,
    "Response Strategy","Priority","Timeframe",
  ].join(",");
  const rows = results.map((r) =>
    [
      `"${assetName}"`, `"${r.risk}"`, `"${r.hazardRating}"`,
      `"${r.intensityLabel}"`, `"${r.frequencyLabel}"`,
      r.assetValueLocal.toFixed(2), r.exposureFactor.toFixed(4),
      r.inherentVulnerability.toFixed(4), r.sbraRrf.toFixed(4),
      r.sbraNetVulnerability.toFixed(4), r.sslLocal.toFixed(2),
      r.annualProbability.toFixed(4), r.ealLocal.toFixed(2),
      `"${r.responseStrategy}"`, `"${r.responsePriority}"`, `"${r.responseTimeframe}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function buildCalcCsv(results: EnrichedResult[], sym: string, assetName: string): string {
  const header = [
    "Asset","Hazard","Rating",`Asset Value (${sym})`,"EF",`Exposed Value (${sym})`,
    "IV","RRF","Net Vuln",`SSL (${sym})`,"Annual Prob",`EAL (${sym})`,
    "Residual Score","Residual Rating","Monitoring KPI","Monitoring Frequency",
    "Monitoring Trigger","Data Source",
  ].join(",");
  const rows = results.map((r) =>
    [
      `"${assetName}"`, `"${r.risk}"`, `"${r.hazardRating}"`,
      r.assetValueLocal.toFixed(2), r.exposureFactor.toFixed(4),
      r.exposedValueLocal.toFixed(2), r.inherentVulnerability.toFixed(4),
      r.sbraRrf.toFixed(4), r.sbraNetVulnerability.toFixed(4),
      r.sslLocal.toFixed(2), r.annualProbability.toFixed(4), r.ealLocal.toFixed(2),
      r.residualRiskScore, `"${r.residualRiskRating}"`,
      `"${r.monitoringKpi}"`, `"${r.monitoringFrequency}"`,
      `"${r.monitoringTrigger}"`, `"${r.dataSource}"`,
    ].join(","),
  );
  return [header, ...rows].join("\n");
}

function buildMonitoringCsv(results: EnrichedResult[], assetName: string): string {
  const header = [
    "Asset","Hazard","KPI","Frequency","Trigger","Data Source",
    "Owner Role","Response Strategy","Priority","Timeframe",
  ].join(",");
  const rows = results.map((r) =>
    [
      `"${assetName}"`, `"${r.risk}"`, `"${r.monitoringKpi}"`,
      `"${r.monitoringFrequency}"`, `"${r.monitoringTrigger}"`,
      `"${r.monitoringDataSource}"`, `"${r.monitoringOwnerRole}"`,
      `"${r.responseStrategy}"`, `"${r.responsePriority}"`, `"${r.responseTimeframe}"`,
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

  const markExported = (key: string) => setExported((p) => new Set([...p, key]));

  const handleHazardCsv = useCallback(() => {
    if (!asset) return;
    downloadCsv(`${asset.name.replace(/\s+/g, "_")}_hazard_breakdown.csv`, buildHazardCsv(results, sym, asset.name));
    markExported("hazard");
  }, [asset, results, sym]);

  const handleCalcCsv = useCallback(() => {
    if (!asset) return;
    downloadCsv(`${asset.name.replace(/\s+/g, "_")}_worked_calculations.csv`, buildCalcCsv(results, sym, asset.name));
    markExported("calc");
  }, [asset, results, sym]);

  const handleMonitoringCsv = useCallback(() => {
    if (!asset) return;
    downloadCsv(`${asset.name.replace(/\s+/g, "_")}_monitoring_plan.csv`, buildMonitoringCsv(results, asset.name));
    markExported("monitoring");
  }, [asset, results]);

  const handleExportAll = useCallback(() => {
    handleHazardCsv();
    if (includeCalc) handleCalcCsv();
    if (includeMonitoring) handleMonitoringCsv();
    markExported("all");
  }, [handleHazardCsv, handleCalcCsv, handleMonitoringCsv, includeCalc, includeMonitoring]);

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
    <div className="max-w-[700px] mx-auto py-3">
      {/* Header card */}
      <div className="pra-surface overflow-hidden mb-4">
        <div className="h-1 bg-gradient-to-r from-green-500 to-primary-500" />
        <div className="p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <Download size={28} className="text-green-500" />
          </div>
          <h2 className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
            Export Results
          </h2>
          <p className="text-[13px] text-[#6E6E73] dark:text-[#86868B] mb-5">
            Download the assessment results for{" "}
            <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">{asset?.name}</strong>
            {" "}&middot; {results.length} hazards assessed &middot; Overall {worstRating}
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
      <div className="pra-surface p-5">
        <h3 className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">Export All</h3>
        <div className="space-y-3 mb-4">
          {[
            { key: "calc", label: "Include worked calculations", value: includeCalc, set: setIncludeCalc },
            { key: "mon", label: "Include monitoring plan", value: includeMonitoring, set: setIncludeMonitoring },
          ].map((t) => (
            <div key={t.key} className="flex items-center gap-3">
              <button
                onClick={() => t.set((v: boolean) => !v)}
                className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors cursor-pointer border-none ${t.value ? "bg-primary-500" : "bg-black/[0.12] dark:bg-white/[0.12]"}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${t.value ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
              <span className="text-[13px] text-[#1D1D1F] dark:text-[#F5F5F7]">{t.label}</span>
            </div>
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
          {exported.has("all") ? <CheckCircle size={18} /> : <Download size={18} />}
          {exported.has("all")
            ? "All Files Downloaded"
            : `Download All (${1 + (includeCalc ? 1 : 0) + (includeMonitoring ? 1 : 0)} files)`}
        </button>
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
          <span className="text-[14px] font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{title}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/[0.05] dark:bg-white/[0.05] text-[#6E6E73] dark:text-[#86868B]">
            {format}
          </span>
        </div>
        <p className="text-[12px] text-[#6E6E73] dark:text-[#86868B] leading-snug">{description}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onExport(); }}
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
