import type { SRROItem } from "@/store/sustainabilityStore";
import { downloadCsv, parseSpreadsheetFile } from "./csvUtils";

export const OTHER_SOURCES = [
  "Regulators and peers",
  "IFRS S2 climate risk",
  "SASB",
  "CDSB",
  "Internal risk register",
] as const;

export type OtherSource = (typeof OTHER_SOURCES)[number];

export interface SrroRawImportRow {
  title: string;
  description: string;
  notes: string;
}

const SRRO_TEMPLATE_HEADERS = ["Title", "Description", "Additional Notes"];

export function downloadSrroSourceTemplate(source: string, clientName: string): void {
  const instructions = [
    ["INSTRUCTIONS: Fill in at least the Title column. Description and Additional Notes help AI classify the risk/opportunity."],
    ["Source:", source],
    [""],
  ];
  const example = [
    ["Example regulatory risk", "New disclosure requirements may increase compliance costs", "Referenced in NAIC climate risk survey 2024"],
    ["", "", ""],
  ];

  const csv = [
    ...instructions.map((r) => r.join(",")),
    SRRO_TEMPLATE_HEADERS.join(","),
    ...example.map((r) => r.join(",")),
  ].join("\r\n");

  const safeName = (clientName.replace(/\s+/g, "_") || "Client");
  const safeSource = source.replace(/\s+/g, "_").replace(/\//g, "-");
  downloadCsv(`${safeName}_SRRO_${safeSource}_Template.csv`, csv);
}

function pickField(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const val = row[key];
    if (val) return val;
  }
  return "";
}

export async function parseSrroRawUpload(file: File): Promise<SrroRawImportRow[]> {
  const raw = await parseSpreadsheetFile(file);
  const results: SrroRawImportRow[] = [];

  for (const row of raw) {
    const title = pickField(row, "title", "risk_title", "name", "risk/opportunity");
    const description = pickField(row, "description", "risk_description", "details");
    const notes = pickField(row, "additional_notes", "notes", "reference", "source_reference");

    if (!title.trim() && !description.trim()) continue;
    if (title.toLowerCase() === "example regulatory risk") continue;
    if (title.toLowerCase().startsWith("instructions")) continue;

    results.push({
      title: title.trim() || description.trim().slice(0, 80),
      description: description.trim(),
      notes: notes.trim(),
    });
  }

  return results;
}

export function nextSrroRef(existingItems: SRROItem[]): string {
  const nums = existingItems
    .map((i) => {
      const trailing = i.ref.match(/(\d+)\s*$/);
      if (trailing) return parseInt(trailing[1], 10);
      const parsed = parseInt(i.ref, 10);
      return isNaN(parsed) ? 0 : parsed;
    })
    .filter((n) => n > 0);
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return String(max + 1).padStart(3, "0");
}

export function rawRowsToPreviewItems(
  rows: SrroRawImportRow[],
  source: string,
  existingItems: SRROItem[],
): Omit<SRROItem, "id">[] {
  let refNum = parseInt(nextSrroRef(existingItems), 10);
  return rows.map((row) => {
    const ref = String(refNum++).padStart(3, "0");
    return {
      ref,
      source,
      title: row.title,
      description: row.description || row.notes,
      type: "" as SRROItem["type"],
      valueChainStage: "" as SRROItem["valueChainStage"],
      financialImpact: "" as SRROItem["financialImpact"],
      strategicImpact: "" as SRROItem["strategicImpact"],
      operationalImpact: "" as SRROItem["operationalImpact"],
      timeHorizon: "" as SRROItem["timeHorizon"],
      likelihood: 0,
      magnitude: 0,
      neededByPrimaryUser: "" as SRROItem["neededByPrimaryUser"],
      includeInFinalList: "" as SRROItem["includeInFinalList"],
      srroCrro: "" as SRROItem["srroCrro"],
      clientNote: row.notes,
    };
  });
}
