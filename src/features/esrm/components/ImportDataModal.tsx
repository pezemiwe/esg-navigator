/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ImportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: any[]) => void;
}

const ImportDataModal: React.FC<ImportDataModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [importMessage, setImportMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateTemplate = () => {
    const templateData = [
      {
        "Client Name": "Sample Client 1",
        Project: "Sample Project 1",
        Sector: "ICT",
        Location: "Lagos",
        "Risk Category": "B",
        "Facility Type": "CAPEX",
        Employees: "101-500",
        "Estimated Amount": "324.37",
        "Contact Email": "client1@example.com",
        "Contact Phone": "+234 xxx xxx xxxx",
        Date: "2025-01-15",
      },
      {
        "Client Name": "Sample Client 2",
        Project: "Sample Project 2",
        Sector: "Manufacturing",
        Location: "Abuja",
        "Risk Category": "A",
        "Facility Type": "OPEX",
        Employees: "21-50",
        "Estimated Amount": "156.89",
        "Contact Email": "client2@example.com",
        "Contact Phone": "+234 xxx xxx xxxx",
        Date: "2025-01-16",
      },
    ];

    const csvContent = [
      Object.keys(templateData[0]).join(","),
      ...templateData.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ESRM_Import_Template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    if (
      selectedFile.type !== "text/csv" &&
      !selectedFile.name.endsWith(".csv")
    ) {
      setImportStatus("error");
      setImportMessage("Please select a CSV file");
      return;
    }

    setFile(selectedFile);
    setImportStatus("idle");
    setImportMessage("");
  };

  const parseCSV = (csvText: string) => {
    const lines = csvText.split("\n").filter((line) => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }

    return data;
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setImportStatus("idle");

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        setImportStatus("error");
        setImportMessage("No valid data found in the file");
        return;
      }

      const transformedData = data.map((row, index) => ({
        id: Date.now() + index,
        client: row["Client Name"] || `Client ${index + 1}`,
        project: row["Project"] || `Project ${index + 1}`,
        sector: row["Sector"] || "ICT",
        location: row["Location"] || "Lagos",
        riskCategory: row["Risk Category"] || "B",
        facilityType: row["Facility Type"] || "CAPEX",
        employees: row["Employees"] || "1-20",
        estimatedAmount: parseFloat(row["Estimated Amount"]) || 0,
        date: row["Date"] || new Date().toISOString().split("T")[0],
      }));

      onImport(transformedData);
      setImportStatus("success");
      setImportMessage(
        `Successfully imported ${transformedData.length} records`,
      );

      setTimeout(() => {
        onClose();
        setFile(null);
        setImportStatus("idle");
        setImportMessage("");
      }, 2000);
    } catch (error: any) {
      setImportStatus("error");
      setImportMessage(`Error importing file: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="bg-linear-to-r from-emerald-600 to-teal-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Import Data</h2>
                <p className="text-emerald-100">
                  Upload customer data from spreadsheet
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-slate-600" />
                <div>
                  <h3 className="font-semibold text-slate-800">
                    Download Template
                  </h3>
                  <p className="text-sm text-slate-600">
                    Get the CSV template with sample data
                  </p>
                </div>
              </div>
              <button
                onClick={generateTemplate}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {file ? file.name : "Drop your CSV file here"}
            </h3>
            <p className="text-gray-500 mb-4">
              {file ? "File ready for import" : "or click to browse files"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileInput}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Browse Files
            </button>
          </div>

          {importStatus === "success" && (
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">{importMessage}</span>
            </div>
          )}

          {importStatus === "error" && (
            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-800">{importMessage}</span>
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">
              Import Instructions:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Download the template to see the required format</li>
              <li>• Ensure your CSV file has the correct column headers</li>
              <li>• All required fields must be filled</li>
              <li>• File size should not exceed 10MB</li>
            </ul>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="px-6 py-3 bg-[#86BC25] hover:bg-[#6B9B1E] text-white rounded-lg transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {importing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Import Data
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportDataModal;
