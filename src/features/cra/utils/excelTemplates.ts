import { Workbook } from "exceljs";
import { TEMPLATE_DEFINITIONS, SAMPLE_DATA } from "./dataTemplates";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const generateExcelTemplate = async (
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
): Promise<Blob> => {
  const template = TEMPLATE_DEFINITIONS[assetType];
  const sampleData =
    (SAMPLE_DATA as Record<string, Record<string, unknown>[]>)[assetType] || [];

  const workbook = new Workbook();

  // ── Data sheet ──────────────────────────────────────────────────────────────
  const headers = template.columns.map((col) => col.field);
  const dataSheet = workbook.addWorksheet("Data");
  dataSheet.addRow(headers);
  sampleData.forEach((row) => {
    dataSheet.addRow(
      headers.map((h) => (row[h] !== undefined ? String(row[h]) : "")),
    );
  });
  headers.forEach((h, i) => {
    dataSheet.getColumn(i + 1).width = Math.max(h.length, 15);
  });

  // ── Field Definitions sheet ──────────────────────────────────────────────────
  const docSheet = workbook.addWorksheet("Field Definitions");
  docSheet.addRow(["Field Name", "Type", "Required", "Description"]);
  template.columns.forEach((col) => {
    docSheet.addRow([
      col.field,
      col.type,
      col.required ? "Yes" : "No",
      col.description,
    ]);
  });
  [25, 15, 10, 50].forEach((w, i) => {
    docSheet.getColumn(i + 1).width = w;
  });

  // ── Instructions sheet ───────────────────────────────────────────────────────
  const instrSheet = workbook.addWorksheet("Instructions");
  instrSheet.getColumn(1).width = 80;
  [
    ["DELOITTE ESG NAVIGATOR - Data Upload Template"],
    [""],
    ["Asset Type:", template.name],
    [""],
    ["INSTRUCTIONS:"],
    ["1. Do not modify the column headers in the Data sheet"],
    ["2. Fill in your data starting from row 2 (after the sample data)"],
    ["3. Delete the sample data row before uploading"],
    ["4. Ensure all required fields are filled"],
    [
      "5. Use the correct data types for each field (see Field Definitions sheet)",
    ],
    ["6. Save the file in Excel format (.xlsx) when done"],
    ["7. Upload the file through the ESG Navigator Data Upload page"],
    [""],
    ["FIELD DEFINITIONS:"],
    [
      '- See the "Field Definitions" sheet for detailed information about each field',
    ],
    ["- Required fields must have values for every row"],
    ["- Optional fields can be left empty if data is not available"],
    [""],
    ["DATA FORMATTING GUIDELINES:"],
    ["- Dates: Use format YYYY-MM-DD (e.g., 2024-01-15)"],
    [
      "- Numbers: Do not use commas or currency symbols (e.g., 500000 not 500,000)",
    ],
    ["- Percentages: Enter as decimal (e.g., 15.5 for 15.5%)"],
    ["- Currency: Use standard 3-letter codes (USD, EUR, GBP)"],
    ["- Text: Avoid special characters that may cause import issues"],
    [""],
    ["SUPPORT:"],
    ["If you encounter any issues, please contact:"],
    ["Email: support@deloitte-esg-navigator.com"],
    ["Phone: +234 XXX XXX XXX"],
  ].forEach((r) => instrSheet.addRow(r));

  const buf = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buf], { type: XLSX_MIME });

  return blob;
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
  const workbook = new Workbook();
  const buffer = await file.arrayBuffer();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];

  const headers: string[] = [];
  const rows: Record<string, unknown>[] = [];

  worksheet.eachRow((row, rowNum) => {
    // ExcelJS row.values is 1-indexed (index 0 is undefined)
    const values = (
      row.values as (string | number | boolean | Date | null | undefined)[]
    ).slice(1);
    if (rowNum === 1) {
      headers.push(...values.map((v) => String(v ?? "")));
    } else {
      const obj: Record<string, unknown> = {};
      values.forEach((v, i) => {
        if (headers[i])
          obj[headers[i]] =
            v instanceof Date ? v.toISOString().slice(0, 10) : (v ?? "");
      });
      rows.push(obj);
    }
  });

  return rows;
};

export const exportDataToExcel = async (
  data: Record<string, unknown>[],
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
): Promise<Blob> => {
  const template = TEMPLATE_DEFINITIONS[assetType];
  const headers = template.columns.map((col) => col.field);

  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet("Data");
  worksheet.addRow(headers);
  data.forEach((row) => {
    worksheet.addRow(
      headers.map((h) => (row[h] != null ? String(row[h]) : "")),
    );
  });
  headers.forEach((h, i) => {
    worksheet.getColumn(i + 1).width = Math.max(h.length, 15);
  });

  const buf = await workbook.xlsx.writeBuffer();
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
