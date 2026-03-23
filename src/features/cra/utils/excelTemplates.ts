import * as XLSX from "xlsx";
import { TEMPLATE_DEFINITIONS, SAMPLE_DATA } from "./dataTemplates";

export const generateExcelTemplate = (
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
): Blob => {
  const template = TEMPLATE_DEFINITIONS[assetType];
  const sampleData =
    (SAMPLE_DATA as Record<string, Record<string, unknown>[]>)[assetType] || [];

  const workbook = XLSX.utils.book_new();

  const headers = template.columns.map((col) => col.field);
  const wsData: (string | number | null)[][] = [headers];

  if (sampleData.length > 0) {
    sampleData.forEach((row) => {
      const rowData = headers.map((header) => {
        const value = row[header];
        return value !== undefined ? String(value) : "";
      });
      wsData.push(rowData);
    });
  }

  const worksheet = XLSX.utils.aoa_to_sheet(wsData);

  const columnWidths = headers.map((header) => ({
    wch: Math.max(header.length, 15),
  }));
  worksheet["!cols"] = columnWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  const docData = [
    ["Field Name", "Type", "Required", "Description"],
    ...template.columns.map((col) => [
      col.field,
      col.type,
      col.required ? "Yes" : "No",
      col.description,
    ]),
  ];

  const docWorksheet = XLSX.utils.aoa_to_sheet(docData);
  docWorksheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 50 }];

  XLSX.utils.book_append_sheet(workbook, docWorksheet, "Field Definitions");

  const instructionsData = [
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
    ["7. Upload the file throu the ESG Navigator Data Upload page"],
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
      "- Numbers: Do not use commas or currency symbols (e.g., 500000 not 500,000 or S 500,000)",
    ],
    ["- Percentages: Enter as decimal (e.g., 15.5 for 15.5%)"],
    ["- Currency: Use standard 3-letter codes (S, USD, EUR, GBP)"],
    ["- Text: Avoid special characters that mit cause import issues"],
    [""],
    ["SUPPORT:"],
    ["If you encounter any issues, please contact:"],
    ["Email: support@deloitte-esg-navigator.com"],
    ["Phone: +234 XXX XXX XXX"],
  ];

  const instructionsWorksheet = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsWorksheet["!cols"] = [{ wch: 80 }];

  if (instructionsWorksheet["A1"]) {
    instructionsWorksheet["A1"].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center" },
    };
  }

  XLSX.utils.book_append_sheet(workbook, instructionsWorksheet, "Instructions");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return blob;
};

export const downloadExcelTemplate = (
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
): void => {
  const blob = generateExcelTemplate(assetType);

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
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false,
          dateNF: "yyyy-mm-dd",
        });

        resolve(jsonData as Record<string, unknown>[]);
      } catch (error) {
        reject(
          new Error("Failed to parse Excel file: " + (error as Error).message),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
};

export const exportDataToExcel = (
  data: Record<string, unknown>[],
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
): Blob => {
  const template = TEMPLATE_DEFINITIONS[assetType];

  const workbook = XLSX.utils.book_new();

  const worksheet = XLSX.utils.json_to_sheet(data);

  const headers = template.columns.map((col) => col.field);
  worksheet["!cols"] = headers.map((header) => ({
    wch: Math.max(header.length, 15),
  }));

  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  return blob;
};

export const downloadExportedData = (
  data: Record<string, unknown>[],
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
  filename?: string,
): void => {
  const blob = exportDataToExcel(data, assetType);
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
