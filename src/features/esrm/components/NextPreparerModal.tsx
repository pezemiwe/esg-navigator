import React from "react";
import { User, X, CheckCircle, Send } from "lucide-react";

interface NextPreparerModalProps {
  showModal: boolean;
  nextPreparer: string;
  notificationSent: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onPreparerChange: (value: string) => void;
  preparerOptions: { value: string; label: string }[];
}

const NextPreparerModal: React.FC<NextPreparerModalProps> = ({
  showModal,
  nextPreparer,
  notificationSent,
  onClose,
  onSubmit,
  onPreparerChange,
  preparerOptions,
}) => {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden transform transition-all">
        <div className="bg-slate-900 p-4 border-b border-[#86BC25] flex justify-between items-center">
          <h3 className="font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#86BC25]" />
            Select Next Preparer
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!notificationSent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Assign to
                </label>
                <select
                  value={nextPreparer}
                  onChange={(e) => onPreparerChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-transparent bg-white dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="">Select a user...</option>
                  {preparerOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-md border border-slate-200 dark:border-slate-800">
                <div className="flex gap-2">
                  <div className="shrink-0 text-slate-600 dark:text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    The selected user will be notified via email and dashboard
                    notification.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Notification Sent!
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                The next preparer has been notified successfully.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
          {!notificationSent && (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors font-medium text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={!nextPreparer}
                className={`px-4 py-2 rounded-md transition-colors font-medium text-sm flex items-center gap-2 cursor-pointer ${
                  !nextPreparer
                    ? "bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
                    : "bg-[#86BC25] hover:bg-[#6B9B1E] text-slate-900 shadow-sm"
                }`}
              >
                <Send className="w-4 h-4" />
                Send Notification
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NextPreparerModal;
