import { useState } from "react";
import {
  Building2,
  TrendingUp,
  ShieldAlert,
  BarChart3,
  Save,
  CheckCircle2,
} from "lucide-react";

import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    id: "governance",
    label: "Governance",
    icon: Building2,
    ifrsRef: "IFRS S1 \u00A714\u201322 / IFRS S2 \u00A75\u20139",
    guidance:
      "Describe the governance processes, controls and procedures used to monitor and manage sustainability-related risks and opportunities. Include the role of the board and management.",
    fields: [
      {
        key: "governance",
        label: "Governance Narrative",
        placeholder:
          "Describe board oversight of sustainability risks, committee mandates, management accountability structures\u2026",
        rows: 6,
      },
    ],
  },
  {
    id: "strategy",
    label: "Strategy",
    icon: TrendingUp,
    ifrsRef: "IFRS S1 \u00A723\u201332 / IFRS S2 \u00A710\u201323",
    guidance:
      "Disclose the sustainability-related risks and opportunities that could reasonably affect your business model, strategy and financial planning over the short, medium and long term.",
    fields: [
      {
        key: "strategy",
        label: "Strategy Narrative",
        placeholder:
          "Describe how sustainability risks/opportunities are integrated into strategy, scenario analysis outcomes, resilience of business model\u2026",
        rows: 6,
      },
    ],
  },
  {
    id: "riskManagement",
    label: "Risk Management",
    icon: ShieldAlert,
    ifrsRef: "IFRS S1 \u00A733\u201338 / IFRS S2 \u00A724\u201327",
    guidance:
      "Explain the processes used to identify, assess, prioritise and monitor sustainability-related risks and opportunities, and how these processes are integrated into overall risk management.",
    fields: [
      {
        key: "riskManagement",
        label: "Risk Management Narrative",
        placeholder:
          "Describe identification/assessment processes, prioritisation criteria, integration into enterprise risk management (ERM)\u2026",
        rows: 6,
      },
    ],
  },
  {
    id: "metricsTargets",
    label: "Metrics & Targets",
    icon: BarChart3,
    ifrsRef: "IFRS S1 \u00A739\u201349 / IFRS S2 \u00A728\u201341",
    guidance:
      "Disclose the metrics and targets used to assess and manage material sustainability-related risks and opportunities. Include cross-industry and industry-based metrics.",
    fields: [
      {
        key: "metricsTargets",
        label: "Metrics & Targets Narrative",
        placeholder:
          "List quantitative metrics (Scope 1/2/3 emissions, water intensity, Board diversity %, etc.), current performance, and targets with timelines\u2026",
        rows: 6,
      },
    ],
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function ReportSetup() {
  const [activeTab, setActiveTab] = useState(0);
  const [saved, setSaved] = useState(false);

  const { reportSetup, updateReportSetup } = useSustainabilityStore(
    useShallow((s) => ({
      reportSetup: s.reportSetup,
      updateReportSetup: s.updateReportSetup,
    }))
  );

  const currentSection = SECTIONS[activeTab];
  const completedCount = SECTIONS.filter(
    (s) =>
      reportSetup[s.id as keyof typeof reportSetup]?.toString().trim().length > 0
  ).length;

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1100px] mx-auto min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="text-[#86bc25] font-bold tracking-widest text-xs uppercase mb-1">
          IFRS S1 / S2 DISCLOSURE
        </div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-2">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Report Setup
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-2xl text-sm">
              Prepare your IFRS S1/S2 sustainability disclosure using the four core
              pillars. Complete each section to generate your disclosure package.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-full",
                completedCount === SECTIONS.length
                  ? "bg-[#86bc25]/10 text-[#86bc25]"
                  : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-500"
              )}
            >
              {completedCount} / {SECTIONS.length} sections complete
            </span>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-[#86bc25] text-white hover:bg-[#75a620] text-sm font-bold transition-colors"
            >
              <Save size={16} />
              Save Draft
            </button>
          </div>
        </div>
      </div>

      {/* IFRS pillar tab navigation */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto overflow-y-hidden scrollbar-hide">
          {SECTIONS.map((section, idx) => {
            const Icon = section.icon;
            const isComplete =
              reportSetup[section.id as keyof typeof reportSetup]
                ?.toString()
                .trim().length > 0;
            const isActive = activeTab === idx;

            return (
              <button
                key={section.id}
                onClick={() => setActiveTab(idx)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-bold border-b-2 whitespace-nowrap transition-colors",
                  isActive
                    ? "border-[#86bc25] text-[#86bc25]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                )}
              >
                <Icon size={16} />
                {section.label}
                {isComplete && <CheckCircle2 size={14} className="text-[#86bc25]" />}
              </button>
            );
          })}
        </div>

        {/* Section content */}
        <div className="p-6 md:p-8">
          {/* IFRS reference banner */}
          <div className="mb-6 rounded bg-[#86bc25]/5 border border-[#86bc25]/20 p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <p className="text-sm text-gray-800 dark:text-gray-200 flex-1">
                {currentSection.guidance}
              </p>
              <span className="px-2.5 py-1 bg-[#86bc25]/10 text-[#86bc25] text-xs font-bold rounded shrink-0">
                {currentSection.ifrsRef}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {currentSection.fields.map((field) => {
              const fieldKey = field.key as SectionId;
              return (
                <div key={field.key} className="space-y-2">
                  <label className="block text-sm font-bold text-gray-900 dark:text-white">
                    {field.label}
                  </label>
                  <textarea
                    rows={field.rows}
                    placeholder={field.placeholder}
                    value={
                      (reportSetup[
                        fieldKey as keyof typeof reportSetup
                      ] as string) ?? ""
                    }
                    onChange={(e) =>
                      updateReportSetup({ [fieldKey]: e.target.value })
                    }
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-sm focus:ring-2 focus:ring-[#86bc25] focus:border-[#86bc25] outline-none text-gray-900 dark:text-white leading-relaxed"
                  />
                </div>
              );
            })}

            <hr className="border-gray-200 dark:border-gray-700 my-6" />

            {/* Document upload placeholder */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Supporting Documents
              </h3>
              <div className="p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-center cursor-pointer hover:border-[#86bc25] dark:hover:border-[#86bc25] transition-colors bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Accepted: PDF, DOCX, XLSX — max 20 MB each
                </p>
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-4">
              <button
                disabled={activeTab === 0}
                onClick={() => setActiveTab((t) => t - 1)}
                className="px-4 py-2 text-sm font-bold border border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25]/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous Section
              </button>
              
              <div className="flex gap-3">
                {activeTab < SECTIONS.length - 1 ? (
                  <button
                    onClick={() => setActiveTab((t) => t + 1)}
                    className="px-4 py-2 text-sm font-bold bg-[#86bc25] text-white hover:bg-[#75a620] transition-colors"
                  >
                    Next Section
                  </button>
                ) : (
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-bold bg-[#86bc25] text-white hover:bg-[#75a620] transition-colors"
                  >
                    Finish Setup
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {saved && (
         <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 shadow-lg flex items-center gap-2 z-50 text-sm font-bold">
           <CheckCircle2 size={18} className="text-[#86bc25]" />
           Draft Saved Successfully
         </div>
      )}
    </div>
  );
}
