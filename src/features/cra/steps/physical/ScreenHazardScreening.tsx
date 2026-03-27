import { useCallback, useRef, useState, useEffect } from "react";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Wand2,
  Check,
  X,
} from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { ALL_21_RISKS } from "../../domain/physicalRisk/constants";
import { suggestRisksForAsset } from "../../domain/physicalRisk/engine";
import type { ScreeningEntry } from "../../domain/physicalRisk/types";

const CATEGORY_COLORS: Record<string, string> = {
  Meteorological: "#F59E0B",
  Hydrological: "#3B82F6",
  Climatological: "#10B981",
  Geophysical: "#8B5CF6",
};

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else current += ch;
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    return row;
  });
}

export default function ScreenHazardScreening() {
  const {
    mappedAssets,
    identifiedRisks,
    setIdentifiedRisks,
    screening,
    setScreening,
  } = usePhysicalRiskStore();
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState("");
  const csvRef = useRef<HTMLInputElement>(null);

  /* Auto-include all 21 risks on first mount if none selected */
  useEffect(() => {
    if (identifiedRisks.length === 0) {
      setIdentifiedRisks(ALL_21_RISKS.map((r) => r.risk));
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isScreenedIn = (assetName: string, riskName: string): boolean => {
    const entry = screening.find((s) => s.assetName === assetName);
    return entry?.risks.includes(riskName) ?? false;
  };

  const toggleCell = (
    assetId: string,
    assetName: string,
    riskName: string,
  ) => {
    const existing = screening.find((s) => s.assetName === assetName);
    if (existing) {
      const updated = screening.map((s) => {
        if (s.assetName !== assetName) return s;
        const hasRisk = s.risks.includes(riskName);
        return {
          ...s,
          risks: hasRisk
            ? s.risks.filter((r) => r !== riskName)
            : [...s.risks, riskName],
        };
      });
      setScreening(updated);
    } else {
      setScreening([...screening, { assetId, assetName, risks: [riskName] }]);
    }
  };

  const handleAutoScreen = () => {
    const entries: ScreeningEntry[] = mappedAssets.map((asset) => {
      const suggested = suggestRisksForAsset(asset.latitude, asset.longitude);
      return { assetId: asset.id, assetName: asset.name, risks: suggested };
    });
    setScreening(entries.filter((e) => e.risks.length > 0));
  };

  const handleSelectAll = () => {
    const riskNames = ALL_21_RISKS.map((r) => r.risk);
    const entries: ScreeningEntry[] = mappedAssets.map((asset) => ({
      assetId: asset.id,
      assetName: asset.name,
      risks: [...riskNames],
    }));
    setScreening(entries);
  };

  const handleClearAll = () => setScreening([]);

  const handleCsvUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setCsvFileName(file.name);
      setCsvError("");
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          const rows = parseCSV(text);
          if (rows.length === 0) {
            setCsvError("File is empty.");
            return;
          }
          if (!Object.keys(rows[0]).includes("asset_name")) {
            setCsvError("screening.csv must have an 'asset_name' column.");
            return;
          }
          const allRiskNames = ALL_21_RISKS.map((r) => r.risk);
          const entries: ScreeningEntry[] = rows.map((row, idx) => {
            const assetName = row.asset_name || "";
            const matched = mappedAssets.find((a) => a.name === assetName);
            const screened = allRiskNames.filter(
              (risk) =>
                risk in row && String(row[risk]).trim().toUpperCase() === "Y",
            );
            return {
              assetId: matched?.id || `asset_${idx}`,
              assetName,
              risks: screened,
            };
          });
          setScreening(entries.filter((e) => e.risks.length > 0));
        } catch (err) {
          setCsvError(
            err instanceof Error ? err.message : "Failed to parse CSV",
          );
        }
      };
      reader.readAsText(file);
      if (e.target) e.target.value = "";
    },
    [mappedAssets, setScreening],
  );

  const totalCombinations = screening.reduce((s, e) => s + e.risks.length, 0);
  const assetsScreened = screening.length;
  const uniqueHazards = new Set(screening.flatMap((s) => s.risks)).size;

  /* Build category groups preserving insertion order */
  const categoryGroups = ALL_21_RISKS.reduce<
    { category: string; count: number }[]
  >((acc, risk) => {
    const last = acc[acc.length - 1];
    if (last && last.category === risk.category) {
      last.count++;
    } else {
      acc.push({ category: risk.category, count: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="flex-1 flex bg-[#F4F4F2] dark:bg-[#0D0D0D] min-h-[calc(100vh-140px)]">
      {/* Left info rail */}
      <div className="hidden lg:flex flex-col w-[250px] flex-shrink-0 border-r border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111] px-5 py-8">
        <div
          className="text-[15px] font-medium uppercase tracking-[0.1em] text-[#86BC25] mb-4"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Step 02
        </div>
        <h2 className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0] mb-2 leading-tight tracking-tight">
          Hazard Screening
        </h2>
        <p className="text-[17px] text-[#888] dark:text-[#666] leading-relaxed mb-8">
          Select which hazards apply to each asset in your portfolio.
        </p>
        <div className="space-y-3 mb-8">
          {[
            { num: "01", label: "Auto-screen" },
            { num: "02", label: "Manual toggle" },
            { num: "03", label: "CSV import" },
          ].map((item) => (
            <div key={item.num} className="flex items-center gap-2.5">
              <span
                className="text-[17px] font-medium text-[#CCC] dark:text-[#444]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {item.num}
              </span>
              <span className="text-[17px] text-[#888] dark:text-[#666]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
        {totalCombinations > 0 && (
          <div className="mt-auto pt-6 border-t border-[#E5E5E5] dark:border-white/[0.06] space-y-4">
            <div>
              <div
                className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555] mb-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Assets
              </div>
              <div className="text-[26px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none">
                {assetsScreened}
              </div>
            </div>
            <div>
              <div
                className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555] mb-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Hazards
              </div>
              <div className="text-[15px] font-semibold text-[#86BC25] leading-none">
                {uniqueHazards} active
              </div>
            </div>
            <div>
              <div
                className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555] mb-1"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Pairs
              </div>
              <div className="text-[15px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-none">
                {totalCombinations}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8">
        {/* Editorial header */}
        <div className="mb-7 animate-fade-up">
          <p
            className="text-[17px] font-medium uppercase tracking-[0.1em] text-[#888] dark:text-[#555] mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Portfolio assessment
          </p>
          <h1 className="text-[28px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight">
            Hazard Screening Matrix
          </h1>
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <button
            onClick={handleAutoScreen}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#86BC25] text-white text-[11px] font-semibold uppercase tracking-[0.08em] cursor-pointer hover:bg-[#78AA1F] transition-colors border-0"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Wand2 size={11} />
            Auto-Screen by Location
          </button>
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#141414] text-[#333] dark:text-[#CCC] text-[11px] font-semibold uppercase tracking-[0.08em] border border-[#D8D8D8] dark:border-white/[0.08] cursor-pointer hover:border-[#86BC25] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Check size={11} />
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#141414] text-[#888] text-[11px] font-semibold uppercase tracking-[0.08em] border border-[#D8D8D8] dark:border-white/[0.08] cursor-pointer hover:border-red-400 hover:text-red-500 transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <X size={11} />
            Clear All
          </button>
          <button
            onClick={() => csvRef.current?.click()}
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-[#141414] text-[#333] dark:text-[#CCC] text-[11px] font-semibold uppercase tracking-[0.08em] border border-[#D8D8D8] dark:border-white/[0.08] cursor-pointer hover:border-[#86BC25] transition-colors"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <Upload size={11} />
            Import CSV
          </button>
          <input
            type="file"
            accept=".csv"
            ref={csvRef}
            className="hidden"
            onChange={handleCsvUpload}
          />
          {csvFileName && (
            <div
              className="flex items-center gap-1.5 text-[11px] text-[#86BC25]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <FileSpreadsheet size={11} />
              <span>{csvFileName}</span>
              <CheckCircle size={11} />
            </div>
          )}
          {totalCombinations > 0 && (
            <div
              className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-[#86BC25]/10 border border-[#86BC25]/20 text-[#86BC25] text-[11px] font-semibold uppercase tracking-[0.08em]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {totalCombinations} pairs screened
            </div>
          )}
        </div>

        {csvError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 text-[13px] mb-5">
            <AlertCircle size={12} className="flex-shrink-0" />
            {csvError}
          </div>
        )}

        {/* Screening matrix */}
        {mappedAssets.length > 0 ? (
          <div className="overflow-auto max-h-[520px] border border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]">
            <table className="border-collapse" style={{ width: "max-content" }}>
              <thead className="sticky top-0 z-[3]">
                {/* Category header row */}
                <tr>
                  <th
                    rowSpan={2}
                    className="sticky left-0 z-[4] bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/[0.07] px-3 py-2 text-left min-w-[160px] align-bottom"
                  >
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#888] dark:text-[#555]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Asset
                    </span>
                  </th>
                  {categoryGroups.map((grp) => (
                    <th
                      key={grp.category}
                      colSpan={grp.count}
                      className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/[0.07] px-2 py-1.5 text-center"
                      style={{
                        borderTop: `2px solid ${CATEGORY_COLORS[grp.category] || "#888"}`,
                      }}
                    >
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap"
                        style={{
                          color: CATEGORY_COLORS[grp.category] || "#888",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        {grp.category}
                      </span>
                    </th>
                  ))}
                </tr>
                {/* Individual hazard name row */}
                <tr>
                  {ALL_21_RISKS.map((risk) => (
                    <th
                      key={risk.id}
                      title={risk.definition}
                      className="bg-white dark:bg-[#111] border-b border-r border-[#D8D8D8] dark:border-white/[0.07] p-0 text-center min-w-[44px]"
                    >
                      <div
                        className="flex items-end justify-center py-2 px-1"
                        style={{ height: 80 }}
                      >
                        <span
                          className="text-[9px] font-medium text-[#666] dark:text-[#999] leading-none"
                          style={{
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {risk.risk}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mappedAssets.slice(0, 100).map((asset, rowIdx) => (
                  <tr
                    key={asset.id}
                    className={
                      rowIdx % 2 === 0
                        ? "bg-white dark:bg-[#111]"
                        : "bg-[#F9F9F8] dark:bg-[#141414]"
                    }
                  >
                    <td
                      className={`sticky left-0 z-[2] border-r border-b border-[#D8D8D8] dark:border-white/[0.07] px-3 py-1.5 ${
                        rowIdx % 2 === 0
                          ? "bg-white dark:bg-[#111]"
                          : "bg-[#F9F9F8] dark:bg-[#141414]"
                      }`}
                    >
                      <span className="text-[13px] font-medium text-[#333] dark:text-[#CCC] truncate block max-w-[148px]">
                        {asset.name}
                      </span>
                      <span className="text-[11px] text-[#999] truncate block max-w-[148px]">
                        {asset.assetType}
                      </span>
                    </td>
                    {ALL_21_RISKS.map((risk) => {
                      const checked = isScreenedIn(asset.name, risk.risk);
                      return (
                        <td
                          key={risk.id}
                          className="border-r border-b border-[#D8D8D8] dark:border-white/[0.07] p-0"
                        >
                          <button
                            onClick={() =>
                              toggleCell(asset.id, asset.name, risk.risk)
                            }
                            className="w-full h-full flex items-center justify-center p-2 hover:bg-[#F4F4F2] dark:hover:bg-white/[0.04] transition-colors"
                            title={`${asset.name} — ${risk.risk}`}
                          >
                            <div
                              className={`w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-colors ${
                                checked
                                  ? "border-transparent"
                                  : "border-[#D8D8D8] dark:border-white/[0.2]"
                              }`}
                              style={
                                checked
                                  ? {
                                      backgroundColor:
                                        CATEGORY_COLORS[risk.category] ||
                                        "#86BC25",
                                    }
                                  : {}
                              }
                            >
                              {checked && (
                                <svg
                                  width="9"
                                  height="7"
                                  viewBox="0 0 10 8"
                                  fill="none"
                                >
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
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            {mappedAssets.length > 100 && (
              <div className="px-4 py-2 text-center text-[13px] text-[#888] dark:text-[#666] border-t border-[#D8D8D8] dark:border-white/[0.07]">
                Showing first 100 of {mappedAssets.length} assets
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 text-amber-700 dark:text-amber-400 text-[13px]">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            <span>
              No assets found. Go back to the Asset Register step and upload
              your portfolio CSV first.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
