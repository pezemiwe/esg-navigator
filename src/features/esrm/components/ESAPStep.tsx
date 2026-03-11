import { useNavigate } from "react-router-dom";
import {
  Plus,
  Download,
  Edit,
  Trash2,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import ProgressBar from "./ProgressBar";
import ApproverModal from "./ApproverModal";
import { type ActionItem } from "../types";
import { downloadCSV } from "../utils";
import { useEditableTable, usePagination, useApproverModal } from "../hooks";
import { useEsrmStore } from "../../../store/esrmStore";
import { step5Approvers } from "../data/formData";

function ESAPStep() {
  const navigate = useNavigate();
  const {
    items: actionItems,
    editingId,
    editForm,
    addNewItem: addNewAction,
    deleteItem: deleteAction,
    startEdit,
    saveEdit,
    cancelEdit,
    handleInputChange,
  } = useEditableTable<ActionItem>(
    [],
    () => ({
      id: Date.now(),
      actionItem: "",
      ifcPsRef: "",
      responsibleParty: "",
      timeline: "",
      monitoringIndicator: "",
    }),
    (item) => !item.actionItem,
  );

  const {
    currentPage,
    totalPages,
    startIndex,
    currentItems,
    prevPage,
    nextPage,
  } = usePagination(actionItems);

  const {
    showModal: showApproverModal,
    selectedApprover,
    expectedCompletionDate,
    setSelectedApprover,
    setExpectedCompletionDate,
    openModal: openApproverModal,
    closeModal: closeApproverModal,
    handleSubmit: handleApproverSubmit,
    notificationSent,
  } = useApproverModal();

  const addTask = useEsrmStore((state) => state.addTask);
  const currentProjectId = useEsrmStore((state) => state.currentProjectId);
  const projects = useEsrmStore((state) => state.projects);
  const updateProject = useEsrmStore((state) => state.updateProject);

  const handleFinalSubmit = () => {
    const proj = projects.find((p) => p.id === currentProjectId);

    if (proj) {
      updateProject(proj.id, {
        currentStepPath: "appraisal",
        stepNumber: 5,
        progress: 80,
        isDraft: false,
      });
    }

    if (selectedApprover) {
      addTask({
        id: Date.now().toString(),
        projectName: proj ? proj.project : "New Project",
        clientName: proj ? proj.client : "Unknown Client",
        currentStep: "Appraisal & Conditions",
        priority: "Medium",
        dueDate:
          expectedCompletionDate ||
          new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
        assignedBy: "You",
        status: "Awaiting Approval",
      });
    }

    handleApproverSubmit(() => {
      navigate("../appraisal");
    });
  };

  const downloadESAPReport = () => {
    downloadCSV(
      [
        [
          "Action Item",
          "IFC PS Ref",
          "Responsible Party",
          "Timeline",
          "Monitoring Indicator",
        ],
        ...actionItems.map((item) => [
          item.actionItem,
          item.ifcPsRef,
          item.responsibleParty,
          item.timeline,
          item.monitoringIndicator,
        ]),
      ],
      "ESAP_Report.csv",
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Step 4: Environmental & Social Action Plan
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Capture actionable steps to mitigate identified E&S risks
              </p>
            </div>
            <button
              onClick={openApproverModal}
              className="cursor-pointer px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 font-bold shadow-lg shadow-slate-900/20"
            >
              <User className="w-4 h-4 text-[#86BC25]" />
              Select Next Preparer
            </button>
          </div>
        </div>

        <div className="p-6">
          <ProgressBar currentStep={4} />

          <div className="flex justify-end mb-6">
            <button
              onClick={addNewAction}
              className="cursor-pointer px-4 py-2 bg-[#86BC25] text-slate-900 rounded-lg hover:bg-[#e5a812] transition-colors flex items-center gap-2 font-bold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Action Item
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Action Item
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    IFC PS Ref
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Responsible Party
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Indicator
                  </th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {currentItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-500 dark:text-slate-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                          <Plus className="w-6 h-6 text-slate-400" />
                        </div>
                        <p>No action items added yet</p>
                        <button
                          onClick={addNewAction}
                          className="cursor-pointer text-[#86BC25] hover:underline font-bold text-sm"
                        >
                          Add your first action item
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-slate-500 dark:text-slate-400">
                        {startIndex + index + 1}
                      </td>
                      <td className="py-4 px-6">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editForm.actionItem || ""}
                            onChange={(e) =>
                              handleInputChange("actionItem", e.target.value)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="Enter action item"
                            autoFocus
                          />
                        ) : (
                          <span className="text-sm text-slate-900 dark:text-white font-medium">
                            {item.actionItem || "-"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editForm.ifcPsRef || ""}
                            onChange={(e) =>
                              handleInputChange("ifcPsRef", e.target.value)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="e.g. PS1"
                          />
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                            {item.ifcPsRef || "-"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editForm.responsibleParty || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "responsibleParty",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="Responsible party"
                          />
                        ) : (
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {item.responsibleParty || "-"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editForm.timeline || ""}
                            onChange={(e) =>
                              handleInputChange("timeline", e.target.value)
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="Timeline"
                          />
                        ) : (
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {item.timeline || "-"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editForm.monitoringIndicator || ""}
                            onChange={(e) =>
                              handleInputChange(
                                "monitoringIndicator",
                                e.target.value,
                              )
                            }
                            className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-sm focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                            placeholder="Monitoring indicator"
                          />
                        ) : (
                          <span className="text-sm text-slate-600 dark:text-slate-300">
                            {item.monitoringIndicator || "-"}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {editingId === item.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={saveEdit}
                              className="cursor-pointer p-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded transition-colors"
                              title="Save"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="cursor-pointer p-1.5 bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(item)}
                              className="cursor-pointer p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => deleteAction(item.id)}
                              className="cursor-pointer p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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

          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {actionItems.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={downloadESAPReport}
                  className="cursor-pointer px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 font-medium text-sm"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </button>
              </div>
            )}

            {actionItems.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="text-sm text-slate-500 dark:text-slate-400 mr-4">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="cursor-pointer p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="cursor-pointer p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <ApproverModal
          showModal={showApproverModal}
          selectedApprover={selectedApprover}
          expectedCompletionDate={expectedCompletionDate}
          approverOptions={step5Approvers}
          notificationSent={notificationSent}
          onClose={closeApproverModal}
          onSubmit={handleFinalSubmit}
          onApproverChange={setSelectedApprover}
          onDateChange={setExpectedCompletionDate}
          title="Select Next Preparer"
          subtitle="Choose approver for Step 5"
        />
      </div>
    </div>
  );
}

export default ESAPStep;
