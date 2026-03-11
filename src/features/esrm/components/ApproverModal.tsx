import React from "react";
import { User, X, CheckCircle } from "lucide-react";

interface ApproverModalProps {
  showModal: boolean;
  selectedApprover: string;
  expectedCompletionDate: string;
  notificationSent?: boolean;
  approverOptions: string[];
  onClose: () => void;
  onSubmit: () => void;
  onApproverChange: (value: string) => void;
  onDateChange: (value: string) => void;
  title?: string;
  subtitle?: string;
}

const ApproverModal: React.FC<ApproverModalProps> = ({
  showModal,
  selectedApprover,
  expectedCompletionDate,
  notificationSent = false,
  approverOptions,
  onClose,
  onSubmit,
  onApproverChange,
  onDateChange,
  title = "Select Next Preparer",
  subtitle = "Choose approver for next step",
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 dark:border-slate-700">
        <div className="bg-slate-900 p-6 border-b border-[#86BC25]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-[#86BC25]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-slate-400 text-sm">{subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {notificationSent ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Request Sent Successfully
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {selectedApprover} has been notified to review this project.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Select Approver
                </label>
                <select
                  value={selectedApprover}
                  onChange={(e) => onApproverChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="">Choose an approver...</option>
                  {approverOptions.map((approver) => (
                    <option key={approver} value={approver}>
                      {approver}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Expected Completion Date
                </label>
                <input
                  type="date"
                  value={expectedCompletionDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={onSubmit}
                  disabled={!selectedApprover || !expectedCompletionDate}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-bold shadow-lg shadow-slate-900/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                >
                  Assign Approver
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApproverModal;
