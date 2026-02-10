import React from "react";
import {
  Plus,
  Download,
  Edit,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import type { MonitoringEntry } from "../types";
import { getMonitoringStatusColor } from "../utils";
import { downloadCSV } from "../utils/riskUtils";
import { monitoringStatusOptions } from "../data/formData";
import { useEditableTable, usePagination } from "../hooks";

const MonitoringStep: React.FC = () => {
  const {
    items: monitoringEntries,
    editingId,
    editForm,
    addNewItem: addNewEntry,
    deleteItem: deleteEntry,
    startEdit,
    saveEdit,
    cancelEdit,
    handleInputChange,
  } = useEditableTable<MonitoringEntry>(
    [
      {
        id: 1,
        date: "2025-08-08",
        monitoringActivity: "",
        findings: "",
        followUpAction: "",
        status: "Pending",
      },
    ],
    () => ({
      id: Date.now(),
      date: new Date().toISOString().split("T")[0],
      monitoringActivity: "",
      findings: "",
      followUpAction: "",
      status: "Pending",
    }),
    (item) => !item.monitoringActivity,
  );

  const {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    currentItems,
    prevPage,
    nextPage,
  } = usePagination(monitoringEntries, 10);

  const downloadMonitoringLog = () => {
    downloadCSV(
      [
        [
          "Date",
          "Monitoring Activity",
          "Findings",
          "Follow-up Action",
          "Status",
        ],
        ...monitoringEntries.map((item) => [
          item.date,
          item.monitoringActivity,
          item.findings,
          item.followUpAction,
          item.status,
        ]),
      ],
      "Monitoring_Log.csv",
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4" />;
      case "In Progress":
        return <Activity className="w-4 h-4" />;
      case "Pending":
        return <Calendar className="w-4 h-4" />;
      case "Overdue":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Step 6: Monitoring & Supervision
              </h1>
              <p className="text-gray-600 mt-1">
                Track follow-up actions, site visits, compliance status, and E&S
                observations over time.
              </p>
            </div>
          </div>

          <ProgressBar currentStep={6} />

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5" />
                <h3 className="font-bold text-lg">Monitoring Activities Log</h3>
              </div>
              <button
                onClick={addNewEntry}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center gap-2 font-medium cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Add Monitoring Entry
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-8">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Date
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Monitoring Activity
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Findings
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Follow-up Action
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-gray-500"
                      >
                        No monitoring entries added yet. Click "Add Monitoring
                        Entry" to get started.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {startIndex + index + 1}
                        </td>
                        <td className="py-3 px-4">
                          {editingId === item.id ? (
                            <input
                              type="date"
                              value={editForm.date || ""}
                              onChange={(e) =>
                                handleInputChange("date", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#86BC25] focus:border-transparent cursor-pointer"
                            />
                          ) : (
                            <span className="text-sm text-gray-800">
                              {item.date || "-"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingId === item.id ? (
                            <input
                              type="text"
                              value={editForm.monitoringActivity || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "monitoringActivity",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#86BC25] focus:border-transparent"
                              placeholder="Enter monitoring activity"
                            />
                          ) : (
                            <span className="text-sm text-gray-800">
                              {item.monitoringActivity || "-"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingId === item.id ? (
                            <textarea
                              value={editForm.findings || ""}
                              onChange={(e) =>
                                handleInputChange("findings", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#86BC25] focus:border-transparent resize-none"
                              rows={2}
                              placeholder="Enter findings"
                            />
                          ) : (
                            <span className="text-sm text-gray-800">
                              {item.findings || "-"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingId === item.id ? (
                            <textarea
                              value={editForm.followUpAction || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  "followUpAction",
                                  e.target.value,
                                )
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#86BC25] focus:border-transparent resize-none"
                              rows={2}
                              placeholder="Enter follow-up action"
                            />
                          ) : (
                            <span className="text-sm text-gray-800">
                              {item.followUpAction || "-"}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingId === item.id ? (
                            <select
                              value={editForm.status || ""}
                              onChange={(e) =>
                                handleInputChange("status", e.target.value)
                              }
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#86BC25] focus:border-transparent cursor-pointer"
                            >
                              {monitoringStatusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getMonitoringStatusColor(item.status)}`}
                            >
                              {getStatusIcon(item.status)}
                              {item.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {editingId === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={saveEdit}
                                className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors cursor-pointer"
                                title="Save"
                              >
                                <Save className="w-4 h-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => startEdit(item)}
                                className="p-1 text-slate-600 hover:bg-slate-50 rounded transition-colors cursor-pointer dark:text-slate-400 dark:hover:bg-slate-700"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteEntry(item.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer dark:text-red-400 dark:hover:bg-red-900/20"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {monitoringEntries.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, monitoringEntries.length)} of{" "}
                  {monitoringEntries.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm bg-[#86BC25] text-slate-900 font-bold rounded">
                    {currentPage}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {monitoringEntries.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <button
                  onClick={downloadMonitoringLog}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Monitoring Log (CSV)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringStep;
