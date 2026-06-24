import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  CheckCircle,
  FileText,
  TrendingDown,
  ArrowRight,
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";

export default function ScreenReportExport() {
  const navigate = useNavigate();
  const canvasRef = useHeroCanvas();
  const { config, mappedAssets, results, mode } = usePhysicalRiskStore();
  const [exported, setExported] = useState<Set<string>>(new Set());

  const handleExportExcel = () => {
    const workbook = XLSX.utils.book_new();

    const configHeaders = ["Parameter", "Value"];
    const configRows = [
      ["Assessment Mode", mode],
      ["Country", config.country],
      ["Report Date", config.reportDate],
      ["Assessor", config.assessorName],
      ["Currency", config.currency],
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([configHeaders, ...configRows]),
      "Configuration",
    );

    const assetHeaders = [
      "Asset Name",
      "Type",
      "Region",
      "Value (Local)",
      "Latitude",
      "Longitude",
    ];
    const assetRows = mappedAssets.map((a) => [
      a.name,
      a.assetType,
      a.region,
      a.value,
      a.latitude,
      a.longitude,
    ]);
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([assetHeaders, ...assetRows]),
      "Assets",
    );

    const hazHeaders = [
      "Asset",
      "Risk",
      "Hazard Rating",
      "Frequency Score",
      "Intensity Score",
      "EAL (Local)",
      "Response Strategy",
    ];
    const hazRows = results.map((r) => [
      r.asset,
      r.risk,
      r.hazardRating,
      r.frequencyScore,
      r.intensityScore,
      r.ealLocal,
      r.responseStrategy,
    ]);
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([hazHeaders, ...hazRows]),
      "Hazard Results",
    );

    const filename = `esg_portfolio_assessment_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buf = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
    const blob = new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setExported((prev) => new Set(prev).add("excel"));
  };

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Physical Risk Portfolio Assessment", 14, 20);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Date: ${config.reportDate}`, 14, 30);
    doc.text(`Assessor: ${config.assessorName}`, 14, 38);
    doc.text(`Currency: ${config.currency}`, 14, 46);
    doc.text(`Geography: ${config.country}`, 14, 54);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Portfolio Overview", 14, 68);

    const fmt = (v: number) =>
      Intl.NumberFormat("en-US", {
        style: "currency",
        currency: config.currency,
        maximumFractionDigits: 0,
      }).format(v);

    const assetsData = mappedAssets.map((a, i) => [
      i + 1,
      a.name,
      a.assetType,
      fmt(a.value),
    ]);

    autoTable(doc, {
      startY: 75,
      head: [["#", "Asset Name", "Type", "Value"]],
      body: assetsData,
      theme: "grid",
      headStyles: { fillColor: [134, 188, 37] },
      margin: { left: 14, right: 14 },
    });

    const nextY = (doc as any).lastAutoTable.finalY + 15;
    doc.text("Hazard & Response Summary", 14, nextY);

    const riskData = results
      .slice(0, 200)
      .map((r) => [
        r.asset,
        r.risk,
        r.hazardRating,
        r.responseStrategy,
        fmt(r.ealLocal),
      ]);

    autoTable(doc, {
      startY: nextY + 7,
      head: [["Asset", "Hazard", "Rating", "Strategy", "EAL"]],
      body: riskData,
      theme: "grid",
      headStyles: { fillColor: [50, 50, 50] },
      margin: { left: 14, right: 14 },
    });

    doc.save(
      `esg_portfolio_report_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
    setExported((prev) => new Set(prev).add("pdf"));
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] flex flex-col pt-10">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full z-0 pointer-events-none opacity-40 dark:opacity-30"
      />

      <div className="relative z-10 flex-1 flex flex-col items-center px-4 md:px-8 pb-35">
        <div className="w-full max-w-4xl bg-white dark:bg-[#111] border border-[#D8D8D8] dark:border-white/7">
          <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/6">
            <h2 className="text-[18px] font-semibold text-[#111] dark:text-[#f0f0f0]">
              Report Export (Step 07 / 07)
            </h2>
            <p className="text-[13px] text-[#888] mt-1">
              Download comprehensive assessment results in PDF and Excel
              formats.
            </p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <button
              onClick={handleExportExcel}
              className="flex-1 flex flex-col items-center justify-center gap-3 p-8 border-2 rounded-xl transition-all cursor-pointer hover:border-[#86BC25] hover:bg-[#86BC25]/5 dark:hover:bg-[#86BC25]/10 border-[#E2E2E0] dark:border-[#333] hover:shadow-lg"
            >
              {exported.has("excel") ? (
                <CheckCircle size={32} className="text-[#86BC25]" />
              ) : (
                <FileText size={32} className="text-[#888] dark:text-[#AAA]" />
              )}
              <span className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0]">
                {exported.has("excel")
                  ? "Excel Downloaded"
                  : "Export Detailed Data (XLSX)"}
              </span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex-1 flex flex-col items-center justify-center gap-3 p-8 border-2 rounded-xl transition-all cursor-pointer hover:border-[#86BC25] hover:bg-[#86BC25]/5 dark:hover:bg-[#86BC25]/10 border-[#E2E2E0] dark:border-[#333] hover:shadow-lg"
            >
              {exported.has("pdf") ? (
                <CheckCircle size={32} className="text-[#86BC25]" />
              ) : (
                <Download size={32} className="text-[#888] dark:text-[#AAA]" />
              )}
              <span className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0]">
                {exported.has("pdf")
                  ? "PDF Downloaded"
                  : "Export Executive Report (PDF)"}
              </span>
            </button>
          </div>
        </div>
        <div className="w-full max-w-4xl mt-8 bg-white dark:bg-[#111] border-t-2 border-[#86BC25] px-6 md:px-10 py-6">
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
                Analyse exposure to policy, technology, market and reputational
                transition risks.
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
  );
}
