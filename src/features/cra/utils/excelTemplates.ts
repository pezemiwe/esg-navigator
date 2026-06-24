import * as XLSX from "xlsx";
import { TEMPLATE_DEFINITIONS, SAMPLE_DATA } from "./dataTemplates";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const generateExcelTemplate = async (
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
): Promise<Blob> => {
  const template = TEMPLATE_DEFINITIONS[assetType];
  const sampleData =
    (SAMPLE_DATA as Record<string, Record<string, unknown>[]>)[assetType] || [];

  const workbook = XLSX.utils.book_new();

  const headers = template.columns.map((col) => col.field);
  const dataAoa: unknown[][] = [
    headers,
    ...sampleData.map((row) =>
      headers.map((h) => (row[h] !== undefined ? String(row[h]) : "")),
    ),
  ];
  const dataSheet = XLSX.utils.aoa_to_sheet(dataAoa);
  dataSheet["!cols"] = headers.map((h) => ({ wch: Math.max(h.length, 15) }));
  XLSX.utils.book_append_sheet(workbook, dataSheet, "Data");

  const docAoa: unknown[][] = [
    ["Field Name", "Type", "Required", "Description"],
    ...template.columns.map((col) => [
      col.field,
      col.type,
      col.required ? "Yes" : "No",
      col.description,
    ]),
  ];
  const docSheet = XLSX.utils.aoa_to_sheet(docAoa);
  docSheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(workbook, docSheet, "Field Definitions");

  const instrAoa: unknown[][] = [
    ["DELOITTE ESG NAVIGATOR - Data Upload Template"],
    [""],
    ["Asset Type:", template.name],
    [""],
    ["INSTRUCTIONS:"],
    ["1. Do not modify the column headers in the Data sheet"],
    ["2. Fill in your data starting from row 2 (after the sample data)"],
    ["3. Delete the sample data row before uploading"],
    ["4. Ensure all required fields are filled"],
    ["5. Use the correct data types for each field (see Field Definitions sheet)"],
    ["6. Save the file in Excel format (.xlsx) when done"],
    ["7. Upload the file through the ESG Navigator Data Upload page"],
    [""],
    ["FIELD DEFINITIONS:"],
    ['- See the "Field Definitions" sheet for detailed information about each field'],
    ["- Required fields must have values for every row"],
    ["- Optional fields can be left empty if data is not available"],
    [""],
    ["DATA FORMATTING GUIDELINES:"],
    ["- Dates: Use format YYYY-MM-DD (e.g., 2024-01-15)"],
    ["- Numbers: Do not use commas or currency symbols (e.g., 500000 not 500,000)"],
    ["- Percentages: Enter as decimal (e.g., 15.5 for 15.5%)"],
    ["- Currency: Use standard 3-letter codes (USD, EUR, GBP)"],
    ["- Text: Avoid special characters that may cause import issues"],
    [""],
    ["SUPPORT:"],
    ["If you encounter any issues, please contact:"],
    ["Email: support@deloitte-esg-navigator.com"],
    ["Phone: +234 XXX XXX XXX"],
  ];
  const instrSheet = XLSX.utils.aoa_to_sheet(instrAoa);
  instrSheet["!cols"] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(workbook, instrSheet, "Instructions");

  const buf = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new Blob([buf], { type: XLSX_MIME });
};

export const downloadExcelTemplate = async (
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
): Promise<void> => {
  const blob = await generateExcelTemplate(assetType);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${assetType}_template.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const parseExcelFile = async (
  file: File,
): Promise<Record<string, unknown>[]> => {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(new Uint8Array(buffer), { type: "array", cellDates: true });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];
  const worksheet = workbook.Sheets[sheetName];
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(worksheet, { header: 1 });
  if (aoa.length < 2) return [];

  const headers = (aoa[0] as unknown[]).map((h) => String(h ?? ""));
  const rows: Record<string, unknown>[] = [];
  for (let i = 1; i < aoa.length; i++) {
    const rowVals = aoa[i] as unknown[];
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      if (h) {
        const v = rowVals[idx];
        obj[h] = v instanceof Date ? v.toISOString().slice(0, 10) : (v ?? "");
      }
    });
    rows.push(obj);
  }
  return rows;
};

export const exportDataToExcel = async (
  data: Record<string, unknown>[],
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
): Promise<Blob> => {
  const template = TEMPLATE_DEFINITIONS[assetType];
  const headers = template.columns.map((col) => col.field);
  const aoa: unknown[][] = [
    headers,
    ...data.map((row) =>
      headers.map((h) => (row[h] != null ? String(row[h]) : "")),
    ),
  ];
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(aoa);
  worksheet["!cols"] = headers.map((h) => ({ wch: Math.max(h.length, 15) }));
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  const buf = XLSX.write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
  return new Blob([buf], { type: XLSX_MIME });
};

export const downloadExportedData = async (
  data: Record<string, unknown>[],
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
  filename?: string,
): Promise<void> => {
  const blob = await exportDataToExcel(data, assetType);
  const defaultFilename = `${assetType}_data_${new Date().toISOString().split("T")[0]}.xlsx`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
