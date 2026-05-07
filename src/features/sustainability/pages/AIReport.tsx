// @ts-nocheck
import { useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
  TrendingUp,
  ShieldAlert,
  BarChart3,
  Save,
  ArrowLeft,
  FileText,
  Zap,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  AlertCircle,
  User,
  ImagePlus,
  X,
  RotateCcw,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useMaterialityStore } from "@/store/materialityStore";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import { useShallow } from "zustand/react/shallow";
import { sampleUsers } from "@/config/sampleUsers";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
  formatNaira,
  formatNumber,
  getRiskLevel,
} from "../data/constants";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

const PILLAR_ICONS: Record<string, typeof Building2> = {
  Governance: Building2,
  Strategy: TrendingUp,
  "Risk Management": ShieldAlert,
  "Metrics & Targets": BarChart3,
};

const PILLAR_COLORS: Record<string, string> = {
  Governance: "#6366f1",
  Strategy: "#0ea5e9",
  "Risk Management": "#f59e0b",
  "Metrics & Targets": "#10b981",
};

const PILLAR_REFS: Record<string, string> = {
  Governance: "IFRS S1 §14–22 / IFRS S2 §5–9",
  Strategy: "IFRS S1 §23–32 / IFRS S2 §10–23",
  "Risk Management": "IFRS S1 §33–38 / IFRS S2 §24–27",
  "Metrics & Targets": "IFRS S1 §39–49 / IFRS S2 §28–41",
};

// ---------------------------------------------------------------------------
// IFRS S1/S2 Minimum Disclosure Requirements
// ---------------------------------------------------------------------------
interface DisclosureItem {
  id: string;
  pillar: string;
  requirement: string;
  description: string;
}

const MINIMUM_DISCLOSURES: DisclosureItem[] = [
  // ── Governance ──
  {
    id: "gov-1",
    pillar: "Governance",
    requirement: "Board oversight of sustainability & climate risks",
    description:
      "Clearly describe the roles of the Board in overseeing sustainability and climate-related matters, including the governance body entrusted with oversight responsibility.",
  },
  {
    id: "gov-2",
    pillar: "Governance",
    requirement: "Board competencies & qualifications",
    description:
      "Disclose the skills, experience and qualifications that make the Board fit to oversee sustainability and climate-related matters.",
  },
  {
    id: "gov-3",
    pillar: "Governance",
    requirement: "Dedicated Board Committee",
    description:
      "Disclose the Board Committee dedicated to sustainability and climate-related matters and the obligations of the committee.",
  },
  {
    id: "gov-4",
    pillar: "Governance",
    requirement: "Frequency of Board updates",
    description:
      "Disclose how frequently the Board is informed on sustainability and climate-related matters.",
  },
  {
    id: "gov-5",
    pillar: "Governance",
    requirement: "Targets & remuneration linkage",
    description:
      "Disclose the targets set by the Board relating to sustainability and climate-related matters and remunerations tied to it (if any).",
  },
  {
    id: "gov-6",
    pillar: "Governance",
    requirement: "Management's role & oversight function",
    description:
      "Disclose the management-level position or committee delegated to oversee sustainability and climate-related matters, and describe roles in oversight including integration into other internal functions.",
  },
  {
    id: "gov-7",
    pillar: "Governance",
    requirement: "Management competencies",
    description:
      "Disclose the skills, experience and qualifications that qualify the management team to ensure proper management over sustainability and climate-related matters.",
  },
  {
    id: "gov-8",
    pillar: "Governance",
    requirement: "Reporting structure & monitoring",
    description:
      "Disclose the clear reporting structure established to drive accurate and timely disclosure, and the structure in place to monitor, evaluate and ensure continuous improvement.",
  },
  // ── Strategy ──
  {
    id: "str-1",
    pillar: "Strategy",
    requirement: "Risks & opportunities identification",
    description:
      "Describe all sustainability and climate-related risks and opportunities material to the company. Clearly classify them as physical or transition risks.",
  },
  {
    id: "str-2",
    pillar: "Strategy",
    requirement: "Business model & value chain impact",
    description:
      "Clearly disclose the areas of the company's business model and value chain that sustainability and climate-related risks and opportunities affect.",
  },
  {
    id: "str-3",
    pillar: "Strategy",
    requirement: "Time horizons for risks",
    description:
      "Clearly disclose the time horizons for each of the identified sustainability and climate-related risks.",
  },
  {
    id: "str-4",
    pillar: "Strategy",
    requirement: "Risk management strategies",
    description:
      "Disclose strategies the company plans to or has established in managing identified sustainability and climate-related risks and opportunities.",
  },
  {
    id: "str-5",
    pillar: "Strategy",
    requirement: "Response plans & transition plan",
    description:
      "Clearly describe how the company responds or plans to respond to risks and opportunities, including investment decisions and energy transition plans. Disclose progress made on established strategies.",
  },
  {
    id: "str-6",
    pillar: "Strategy",
    requirement: "Impact on decision-making",
    description:
      "Describe how identified risks have impacted the company's decision-making relating to its business.",
  },
  {
    id: "str-7",
    pillar: "Strategy",
    requirement: "Financial position & performance effects",
    description:
      "Describe the current and anticipated effects of climate-related risks and opportunities on financial position, financial performance and cash flows for the reporting period.",
  },
  {
    id: "str-8",
    pillar: "Strategy",
    requirement: "Material adjustments to carrying amounts",
    description:
      "Describe sustainability and climate-related risks with significant risk of materially adjusting carrying amounts of assets and liabilities in the next annual reporting period.",
  },
  {
    id: "str-9",
    pillar: "Strategy",
    requirement: "Future financial position outlook",
    description:
      "Describe how the company expects its financial position to change over short, medium and long term given its strategies — including capital expenditure, acquisitions, and planned funding sources.",
  },
  {
    id: "str-10",
    pillar: "Strategy",
    requirement: "Cash flow impact projections",
    description:
      "Describe how managing sustainability and climate-related risks could affect the company's cash flows and financial performance in the short, medium and long term.",
  },
  {
    id: "str-11",
    pillar: "Strategy",
    requirement: "Exemption from quantitative information",
    description:
      "If not providing quantitative information, explain why and provide qualitative information including affected line items, totals and subtotals within financial statements.",
  },
  {
    id: "str-12",
    pillar: "Strategy",
    requirement: "Climate resilience & scenario analysis",
    description:
      "Disclose information on the company's capacity to adjust to uncertainties arising from climate-related risks. Describe the climate scenario analysis performed, inputs used, key assumptions, and assessment results.",
  },
  {
    id: "str-13",
    pillar: "Strategy",
    requirement: "Adaptation & mitigation policies",
    description:
      "Disclose policies in place to drive climate adaptation and mitigation strategies, and the entity's understanding of how climate-related risks relate to business operations and associated trade-offs.",
  },
  // ── Risk Management ──
  {
    id: "rm-1",
    pillar: "Risk Management",
    requirement: "Risk identification, prioritisation & monitoring",
    description:
      "Describe how the company identifies, prioritises, and monitors sustainability and climate-related risks and opportunities.",
  },
  {
    id: "rm-2",
    pillar: "Risk Management",
    requirement: "ERM integration",
    description:
      "Describe how the company has integrated the risk management of identified sustainability and climate-related risks into its Enterprise Risk Management policy.",
  },
  {
    id: "rm-3",
    pillar: "Risk Management",
    requirement: "Inputs, parameters & data sources",
    description:
      "Disclose the inputs and parameters used (e.g., data sources, scope of operations covered), whether scenario analysis is used, and how the entity assesses nature, likelihood and magnitude of risks.",
  },
  {
    id: "rm-4",
    pillar: "Risk Management",
    requirement: "Risk prioritisation methodology",
    description:
      "Describe whether and how the company prioritises sustainability-related risks relative to other types of risk, how risks are monitored, and any changes to processes from previous periods.",
  },
  // ── Metrics & Targets ──
  {
    id: "mt-1",
    pillar: "Metrics & Targets",
    requirement: "IFRS-required metrics",
    description:
      "Disclose the relevant metrics required by the IFRS Sustainability Disclosure Standard on applicable topics (e.g., Scope 1, 2 and 3 GHG Emissions).",
  },
  {
    id: "mt-2",
    pillar: "Metrics & Targets",
    requirement: "Performance measurement metrics",
    description:
      "Disclose metrics used to measure and monitor the company's performance in relation to identified sustainability and climate-related risks, including progress towards set targets and regulatory requirements.",
  },
  {
    id: "mt-3",
    pillar: "Metrics & Targets",
    requirement: "Climate-related targets",
    description:
      "Disclose quantitative and qualitative climate-related targets, including objective (mitigation, adaptation), scope, period, base period, milestones, and how targets are informed by latest international agreements.",
  },
  {
    id: "mt-4",
    pillar: "Metrics & Targets",
    requirement: "Other sustainability-related targets",
    description:
      "For each target, disclose the metric used, specific quantitative or qualitative target, period, base period, milestones, performance analysis and any revisions with explanations.",
  },
  {
    id: "mt-5",
    pillar: "Metrics & Targets",
    requirement: "Greenhouse gas emissions",
    description:
      "Disclose aggregation of GHG emissions into CO₂-equivalent, the measurement approach used, and which greenhouse gases and scopes are covered by each target.",
  },
  {
    id: "mt-6",
    pillar: "Metrics & Targets",
    requirement: "Carbon credits & offsets",
    description:
      "Disclose planned use of carbon credits to offset GHG emissions and progress made in achieving climate-related targets.",
  },
  {
    id: "mt-7",
    pillar: "Metrics & Targets",
    requirement: "Transition & physical risk exposure",
    description:
      "Disclose amount and percentage of assets or business activities subject to climate transition risks, physical risks, and climate-related opportunities.",
  },
  {
    id: "mt-8",
    pillar: "Metrics & Targets",
    requirement: "Capital deployment",
    description:
      "Disclose amount and percentage of capex, financing or investment directed towards climate-related risks and opportunities.",
  },
  {
    id: "mt-9",
    pillar: "Metrics & Targets",
    requirement: "Carbon pricing",
    description:
      "Disclose the price for each metric tonne of GHGs the entity uses to assess the costs of its greenhouse gas emissions.",
  },
  {
    id: "mt-10",
    pillar: "Metrics & Targets",
    requirement: "Executive remuneration linkage",
    description:
      "Disclose how and what percentage of executive management remuneration is linked to climate-related matters.",
  },
  {
    id: "mt-11",
    pillar: "Metrics & Targets",
    requirement: "Internally developed & third-party metrics",
    description:
      "For metrics from non-IFRS sources or internally developed: disclose definition, whether absolute or relative, whether validated by third party, and how it differs from standard sources.",
  },
];

const DISCLOSURE_PILLARS = [
  "Governance",
  "Strategy",
  "Risk Management",
  "Metrics & Targets",
] as const;

// ---------------------------------------------------------------------------
// Data Owner Report View
// ---------------------------------------------------------------------------

function DataOwnerReportView() {
  const isDark = false;
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [disclosureResponses, setDisclosureResponses] = useState<
    Record<string, string>
  >({});
  const [saved, setSaved] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(
    "Governance",
  );

  // Simulate assignments — in production this would come from the store
  const myDisclosures = useMemo(() => {
    // Show all disclosures for the data owner demo; in production filter by assignment
    return MINIMUM_DISCLOSURES;
  }, []);

  const updateResponse = (id: string, value: string) => {
    setDisclosureResponses((prev) => ({ ...prev, [id]: value }));
  };

  const filledCount = Object.values(disclosureResponses).filter((v) =>
    v.trim(),
  ).length;
  const totalCount = myDisclosures.length;
  const completionPct =
    totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  const pillarGroups = useMemo(() => {
    const groups: Record<string, DisclosureItem[]> = {};
    for (const d of myDisclosures) {
      if (!groups[d.pillar]) groups[d.pillar] = [];
      groups[d.pillar].push(d);
    }
    return groups;
  }, [myDisclosures]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 font-semibold text-sm flex items-center gap-2 hover:text-[#86bc25] transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#86bc25]/10 border-2 border-[#86bc25]/20 flex items-center justify-center">
              <ClipboardCheck size={24} className="text-[#86bc25]" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold dark:text-white">
                My Disclosure Assignments
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Welcome, {user?.name} - complete your assigned minimum
                disclosure responses below
              </p>
            </div>
          </div>
          <button
            onClick={() => setSaved(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#86bc25] hover:bg-[#86bc25]/90 text-white rounded-xl font-bold shadow-lg shadow-[#86bc25]/20 transition-all"
          >
            <Save size={16} /> Save Responses
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#86bc25]" />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Total Assigned
          </div>
          <div className="text-2xl font-black dark:text-white">
            {totalCount}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Completed
          </div>
          <div className="text-2xl font-black text-emerald-500">
            {filledCount}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Pending
          </div>
          <div className="text-2xl font-black text-amber-500">
            {totalCount - filledCount}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            Progress
          </div>
          <div className="text-2xl font-black text-blue-500">
            {completionPct}%
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {DISCLOSURE_PILLARS.map((pillar) => {
          const disclosures = pillarGroups[pillar] || [];
          if (disclosures.length === 0) return null;

          const Icon = PILLAR_ICONS[pillar] || FileText;
          const isExpanded = expandedPillar === pillar;

          return (
            <div
              key={pillar}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm"
            >
              <div
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center justify-between border-b border-slate-200 dark:border-slate-700"
                onClick={() => setExpandedPillar(isExpanded ? null : pillar)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center opacity-80"
                    style={{
                      color: "#86bc25",
                      backgroundColor: "rgba(134, 188, 37, 0.1)",
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-sm dark:text-white">
                      {pillar}
                    </div>
                    <div className="text-xs text-slate-500">
                      {PILLAR_REFS[pillar]}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <CheckCircle2
                      size={12}
                      className={
                        disclosures.filter((d) =>
                          disclosureResponses[d.id]?.trim(),
                        ).length === disclosures.length
                          ? "text-emerald-500"
                          : ""
                      }
                    />
                    {
                      disclosures.filter((d) =>
                        disclosureResponses[d.id]?.trim(),
                      ).length
                    }{" "}
                    / {disclosures.length}
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {disclosures.map((d) => (
                    <div
                      key={d.id}
                      className="p-4 pl-6 bg-slate-50/30 dark:bg-slate-800/30"
                    >
                      <div className="mb-2">
                        <div className="flex gap-2 items-start mb-1">
                          <div
                            className={
                              "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 " +
                              (disclosureResponses[d.id]
                                ? "bg-emerald-500"
                                : "bg-amber-500")
                            }
                          />
                          <div>
                            <div className="font-bold text-sm dark:text-slate-200">
                              {d.requirement}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {d.description}
                            </div>
                          </div>
                        </div>
                      </div>
                      <textarea
                        className="w-full pl-3 p-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-[#86bc25] focus:border-[#86bc25] outline-none transition-all resize-none dark:text-white"
                        rows={3}
                        placeholder="Provide the entity's response..."
                        value={disclosureResponses[d.id] || ""}
                        onChange={(e) => updateResponse(d.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AIReport() {
  const { user } = useAuthStore();
  const role = user?.role;
  if (role === UserRole.DATA_OWNER || role === UserRole.DATA_ENTRY)
    return <DataOwnerReportView />;
  return <ManagerReportView />;
}

function ManagerReportView() {
  const isDark = false;
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;
  const {
    entityProfile,
    risks,
    selectedMaterialTopicIds,
    scope1Assets,
    scope2Entries,
    scope3Entries,
    scenarioResults,
    templates,
    stakeholderSurveys,
    reportDraft,
    setReportDraft,
    reportGeneratedBy,
    setReportGeneratedBy,
    reportYear,
    setReportYear,
  } = useSustainabilityStore(
    useShallow((s) => ({
      entityProfile: s.entityProfile,
      risks: s.risks,
      selectedMaterialTopicIds: s.selectedMaterialTopicIds,
      scope1Assets: s.scope1Assets,
      scope2Entries: s.scope2Entries,
      scope3Entries: s.scope3Entries,
      scenarioResults: s.scenarioResults,
      templates: s.templates,
      stakeholderSurveys: s.stakeholderSurveys,
      reportDraft: s.reportDraft,
      setReportDraft: s.setReportDraft,
      reportGeneratedBy: s.reportGeneratedBy,
      setReportGeneratedBy: s.setReportGeneratedBy,
      reportYear: s.reportYear,
      setReportYear: s.setReportYear,
    })),
  );

  const { topics: materialityTopics, inputs: materialityInputs } =
    useMaterialityStore(
      useShallow((s) => ({
        topics: s.topics,
        inputs: s.inputs,
      })),
    );

  const canGenerate =
    role === UserRole.SUSTAINABILITY_MANAGER || role === UserRole.ADMIN;

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mainTab, setMainTab] = useState(0);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(
    "Governance",
  );
  const [disclosureAssignments, setDisclosureAssignments] = useState<
    Record<string, string>
  >({});
  const [disclosureResponses, setDisclosureResponses] = useState<
    Record<string, string>
  >({});
  const [assignmentSaved, setAssignmentSaved] = useState(false);
  const [reportImages, setReportImages] = useState<
    { id: string; dataUrl: string; name: string }[]
  >([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const REPORT_YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) =>
    String(currentYear - i),
  );
  const [selectedYear, setSelectedYear] = useState(
    reportYear || String(currentYear),
  );

  const dataOwnerUsers = useMemo(
    () => sampleUsers.filter((u) => u.role !== "board"),
    [],
  );

  const pillarDisclosures = useMemo(() => {
    const groups: Record<string, DisclosureItem[]> = {};
    for (const d of MINIMUM_DISCLOSURES) {
      if (!groups[d.pillar]) groups[d.pillar] = [];
      groups[d.pillar].push(d);
    }
    return groups;
  }, []);

  const assignDisclosure = (disclosureId: string, userName: string) => {
    setDisclosureAssignments((prev) => ({ ...prev, [disclosureId]: userName }));
  };

  const disclosureAssignedCount = Object.values(disclosureAssignments).filter(
    (v) => v,
  ).length;

  const disclosureFilledCount = Object.values(disclosureResponses).filter((v) =>
    v.trim(),
  ).length;

  const updateDisclosureResponse = (id: string, value: string) => {
    setDisclosureResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        setReportImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            dataUrl: reader.result as string,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setReportImages((prev) => prev.filter((img) => img.id !== id));
  };

  const s1 = useMemo(() => calculateScope1(scope1Assets), [scope1Assets]);
  const s2 = useMemo(() => calculateScope2(scope2Entries), [scope2Entries]);
  const s3 = useMemo(() => calculateScope3(scope3Entries), [scope3Entries]);
  const totalEmissions = s1 + s2 + s3;

  const selectedRisks = useMemo(() => {
    return risks.filter((r) => selectedMaterialTopicIds.includes(r.id));
  }, [risks, selectedMaterialTopicIds]);

  const completionPct = Math.round(
    (disclosureFilledCount / MINIMUM_DISCLOSURES.length) * 100,
  );

  const generateReport = () => {
    setGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 5;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      const reportingYear = selectedYear;

      // --- Build materiality data section ---
      const selectedTopics = materialityTopics.filter((t) =>
        selectedMaterialTopicIds.includes(t.id),
      );
      const materialitySection =
        selectedTopics.length > 0
          ? selectedTopics
              .map((topic) => {
                const topicInputs = materialityInputs.filter(
                  (inp) => inp.topicId === topic.id,
                );
                const dataLines =
                  topicInputs.length > 0
                    ? topicInputs
                        .map(
                          (inp) =>
                            `      - ${inp.metric}: ${inp.value} (${inp.period})`,
                        )
                        .join("\n")
                    : "      - No data collected yet";
                return `    ${topic.name} [${topic.approvalStatus || "Draft"}]\n${dataLines}`;
              })
              .join("\n\n")
          : "  No materiality topics selected.";

      const report = `
SUSTAINABILITY & CLIMATE RISK DISCLOSURE REPORT
IFRS S1 / IFRS S2 ALIGNED

Prepared for: ${entityProfile.name}
Report Date: ${new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
Reporting Period: FY ${reportingYear}
Framework Alignment: IFRS S1, IFRS S2, GHG Protocol, PCAF, SASB — Commercial Banking
Generated by: ${user?.name || "System"}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EXECUTIVE SUMMARY

${entityProfile.name} presents this comprehensive sustainability disclosure aligned with the International Financial Reporting Standards (IFRS) S1 and S2 requirements. As a leading Nigerian commercial bank with ${entityProfile.branches} branches, ${entityProfile.employees.toLocaleString()} employees, and a total loan book of ${formatNaira(entityProfile.loanBook)}, the Bank recognizes its responsibility as a significant financial intermediary in driving Nigeria's transition to a low-carbon economy.

This report identifies ${risks.length} sustainability-related risks, of which ${selectedMaterialTopicIds.length} have been assessed as material. Total greenhouse gas emissions for FY ${reportingYear} are estimated at ${formatNumber(totalEmissions)} tCO₂e across all three scopes. ${scenarioResults.length > 0 ? `${scenarioResults.length} climate scenario(s) have been modeled to assess financial resilience.` : "Climate scenario analysis is pending completion."}


2. GOVERNANCE (IFRS S1)

2.1 Board Oversight
The Board of Directors maintains oversight of sustainability-related risks through the Board Risk Committee (BRC), which meets quarterly to review climate risk exposures, ESG performance metrics, and regulatory compliance status.

2.2 Management's Role
The Chief Risk Officer (CRO) is responsible for integrating sustainability risks into the enterprise risk management framework. The Sustainability Steering Committee, comprising senior executives from Risk, Credit, Operations, and Compliance functions, oversees material topic assessments and disclosure preparation.

2.3 Internal Controls
The Bank has established internal controls and assurance processes to ensure the reliability and completeness of sustainability disclosures. Data collection templates have been deployed across ${templates.length} material topic areas, with departmental accountability assigned to relevant business units.


3. STRATEGY (IFRS S1 & S2)

3.1 Entity Profile & Value Chain
${entityProfile.description}

Core Banking Services: ${(entityProfile.coreServices || []).join(", ")}

Upstream Activities: ${(entityProfile.upstreamActivities || []).join(", ")}

Downstream Activities (Financed): ${(entityProfile.downstreamActivities || []).join(", ")}

3.2 Sector Exposure Profile
The Bank's loan portfolio is distributed across ${(entityProfile.sectorExposures || []).length} sectors:
${(entityProfile.sectorExposures || []).map((s) => `  • ${s.sector}: ${s.percentage}% (${formatNaira((entityProfile.loanBook * s.percentage) / 100)})`).join("\n")}

3.3 Geographic Exposure
Key operating regions with associated climate risk profiles:
${(entityProfile.geographicExposure || []).map((g) => `  • ${g}`).join("\n")}

3.4 Strategic Impact Assessment
The Bank's strategy is exposed to both transition and physical climate risks, with particular concentration in the Oil & Gas sector (${(entityProfile.sectorExposures || []).find((s) => s.sector === "Oil & Gas")?.percentage || 0}% of loan book) and Lagos coastal exposure. The dual materiality assessment identified ${selectedMaterialTopicIds.length} topics requiring strategic response.


4. RISK MANAGEMENT (IFRS S1)

4.1 Risk Identification Process
The Bank employs a multi-source risk identification approach:
  • Enterprise Risk Management (ERM) Register: ${risks.filter((r) => r.source === "erm").length} risks identified
  • Stakeholder Surveys: ${stakeholderSurveys.length} surveys conducted, ${risks.filter((r) => (r.source as string) === "stakeholder").length} risks captured
  • SASB Standards Alignment: ${risks.filter((r) => r.source === "sasb").length} financially material topics identified
  • Leadership Workshops: ${risks.filter((r) => r.source === "workshop").length} risks from strategic sessions

4.2 Material Topics (Top ${selectedMaterialTopicIds.length})
${selectedRisks
  .map((r, i) => {
    const score = r.impact * r.likelihood;
    return `  ${i + 1}. ${r.name}
     Category: ${r.category} | Score: ${score} (${getRiskLevel(score)})
     Financial Effect: ${r.financialEffect} | Time Horizon: ${r.timeHorizon}`;
  })
  .join("\n\n")}

4.3 Risk Rating Distribution
  • Critical (≥20): ${risks.filter((r) => r.impact * r.likelihood >= 20).length} risks
  • High (12-19): ${
    risks.filter((r) => {
      const s = r.impact * r.likelihood;
      return s >= 12 && s < 20;
    }).length
  } risks
  • Medium (6-11): ${
    risks.filter((r) => {
      const s = r.impact * r.likelihood;
      return s >= 6 && s < 12;
    }).length
  } risks
  • Low (<6): ${risks.filter((r) => r.impact * r.likelihood < 6).length} risks

4.4 Materiality Assessment Data
The following material topics have been assessed with data collected from assigned data owners:

${materialitySection}


5. CLIMATE-RELATED RISKS & OPPORTUNITIES (IFRS S2)

5.1 Transition Risks
${
  selectedRisks
    .filter((r) => r.subcategory === "Transition Risk")
    .map(
      (r) =>
        `  • ${r.name}: Impact ${r.impact}/5, Likelihood ${r.likelihood}/5 — ${r.financialEffect}`,
    )
    .join("\n") || "  • No transition risks identified in material topics."
}

5.2 Physical Risks
${
  selectedRisks
    .filter((r) => r.subcategory === "Physical Risk")
    .map(
      (r) =>
        `  • ${r.name}: Impact ${r.impact}/5, Likelihood ${r.likelihood}/5 — ${r.financialEffect}`,
    )
    .join("\n") || "  • No physical risks identified in material topics."
}

5.3 Additional Material Categories
${
  selectedRisks
    .filter(
      (r) => !["Transition Risk", "Physical Risk"].includes(r.subcategory),
    )
    .map(
      (r) =>
        `  • ${r.name} (${r.subcategory}): Score ${r.impact * r.likelihood}`,
    )
    .join("\n") || "  • None."
}


6. GREENHOUSE GAS EMISSIONS (IFRS S2 / GHG Protocol)

6.1 Scope 1 — Direct Emissions
Source: Owned fuel combustion (generators, fleet vehicles)
Total: ${formatNumber(s1)} tCO₂e
Assets tracked: ${scope1Assets.length}
${scope1Assets.map((a) => `  • ${a.name} (${a.branch}): ${a.fuelType} — ${formatNumber(a.litersPerMonth * a.months * (a.fuelType === "diesel" ? 2.68 : a.fuelType === "petrol" ? 2.31 : a.fuelType === "lpg" ? 1.51 : 2.0))} tCO₂e`).join("\n")}

6.2 Scope 2 — Indirect Emissions (Purchased Electricity)
Source: Grid electricity and private power purchase
Total: ${formatNumber(s2)} tCO₂e
Branch locations: ${scope2Entries.length}
Nigeria grid emission factor: 0.43 kgCO₂/kWh

6.3 Scope 3 — Financed Emissions (Category 15)
Methodology: PCAF Global GHG Accounting Standard
Total: ${formatNumber(s3)} tCO₂e
${scope3Entries.map((e) => `  • ${e.sector}: ${formatNaira(e.loanExposure)} exposure → ${formatNumber(e.loanExposure * e.intensityFactor)} tCO₂e`).join("\n")}

6.4 Emissions Summary
  Total GHG Footprint: ${formatNumber(totalEmissions)} tCO₂e
  Scope 1 share: ${totalEmissions > 0 ? ((s1 / totalEmissions) * 100).toFixed(1) : 0}%
  Scope 2 share: ${totalEmissions > 0 ? ((s2 / totalEmissions) * 100).toFixed(1) : 0}%
  Scope 3 share: ${totalEmissions > 0 ? ((s3 / totalEmissions) * 100).toFixed(1) : 0}%

  Scope 3 financed emissions dominate the Bank's carbon footprint, consistent with the emissions profile of financial institutions globally.


7. SCENARIO ANALYSIS (IFRS S2)

${
  scenarioResults.length > 0
    ? scenarioResults
        .map(
          (r) => `7.x ${r.name}
  Description: ${r.description}
  Estimated Financial Cost: ${formatNaira(r.estimatedCost)}
  Profit Impact: ${r.profitImpact.toFixed(3)}%
  Projected NPL Increase: +${r.nplIncrease}%
  Capital Adequacy Effect: ${r.capitalAdequacyEffect.toFixed(1)}%
  Analysis Date: ${new Date(r.runAt).toLocaleDateString()}
`,
        )
        .join("\n")
    : "  Scenario analysis has not yet been conducted. IFRS S2 requires climate scenario analysis covering at least transition and physical risk scenarios."
}


8. METRICS & TARGETS

8.1 Key Performance Indicators
  • Total sustainability risks tracked: ${risks.length}
  • Material topics under active management: ${selectedMaterialTopicIds.length}
  • GHG emissions intensity: ${entityProfile.loanBook > 0 ? (totalEmissions / (entityProfile.loanBook / 1e9)).toFixed(2) : "N/A"} tCO₂e per ₦B loan book
  • Data collection templates deployed: ${templates.length}
  • Template completion rate: ${templates.length > 0 ? Math.round((templates.filter((t) => t.status === "submitted" || t.status === "approved").length / templates.length) * 100) : 0}%
  • Stakeholder engagement surveys: ${stakeholderSurveys.length}

8.2 Targets
  The Bank commits to:
  • Reducing Scope 1 emissions by 15% by FY 2028 through fleet electrification and solar installations
  • Achieving 30% renewable energy procurement for branch operations by FY 2030
  • Reducing financed emissions intensity by 20% across high-carbon sectors by FY 2030
  • Achieving 100% IFRS S1/S2 disclosure compliance by FY 2026


9. DATA GOVERNANCE & ASSURANCE

Data collection responsibilities have been assigned across ${new Set(templates.map((t) => t.department)).size} departments. All sustainability data undergoes internal verification before disclosure. The Bank intends to obtain limited assurance over its GHG emissions data from an independent assurance provider.


10. REGULATORY ALIGNMENT

This report has been prepared in alignment with:
  • IFRS S1 — General Requirements for Disclosure of Sustainability-related Financial Information
  • IFRS S2 — Climate-related Disclosures
  • GHG Protocol Corporate Standard
  • PCAF Global GHG Accounting and Reporting Standard
  • SASB Standards — Commercial Banks
  • CBN Sustainable Banking Principles
  • Nigeria's Nationally Determined Contribution (NDC) commitments


11. FORWARD-LOOKING STATEMENTS

This report contains forward-looking statements regarding the Bank's climate strategy, emission reduction targets, and scenario analysis outcomes. These statements are based on current expectations and assumptions and are subject to risks and uncertainties, including regulatory changes, macroeconomic conditions, and climate science developments.


12. APPROVAL

This Sustainability & Climate Risk Disclosure Report has been reviewed and approved by the Board Risk Committee of ${entityProfile.name}.

Prepared by: Sustainability Reporting Division
Report Classification: CONFIDENTIAL — FOR REGULATORY & INVESTOR USE


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${new Date().getFullYear()} ${entityProfile.name}. All Rights Reserved.
Powered by ESG Navigator — Deloitte
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

      setReportDraft(report);
      setReportGeneratedBy(user?.name || "System");
      setReportYear(reportingYear);
      setGenerating(false);
    }, 3000);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-6 flex flex-col gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-500 font-semibold text-sm flex items-center gap-2 hover:text-[#86bc25] transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <FileText size={24} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold dark:text-white">
              AI Report Generation
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage, generate, and export IFRS S1/S2 compliant sustainability
              reports
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {!reportDraft ? (
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMainTab(0)}
              className={
                "flex-1 py-3 px-4 text-sm font-bold border-b-2 transition-colors " +
                (mainTab === 0
                  ? "border-[#86bc25] text-[#86bc25] bg-[#86bc25]/5"
                  : "border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800")
              }
            >
              Report Setup (Disclosures)
            </button>
            <button
              onClick={() => setMainTab(1)}
              className={
                "flex-1 py-3 px-4 text-sm font-bold border-b-2 transition-colors " +
                (mainTab === 1
                  ? "border-[#86bc25] text-[#86bc25] bg-[#86bc25]/5"
                  : "border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800")
              }
            >
              Generate Report
            </button>
          </div>
        ) : null}

        {mainTab === 0 && !reportDraft && (
          <div className="p-4 md:p-6 bg-slate-50/50 dark:bg-slate-900/20 space-y-4">
            {DISCLOSURE_PILLARS.map((pillar) => {
              const items = pillarDisclosures[pillar] || [];
              if (items.length === 0) return null;

              const Icon = PILLAR_ICONS[pillar] || FileText;
              const isExpanded = expandedPillar === pillar;

              return (
                <div
                  key={pillar}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm"
                >
                  <div
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 flex flex-wrap items-center justify-between border-b gap-4 border-slate-200 dark:border-slate-700"
                    onClick={() =>
                      setExpandedPillar(isExpanded ? null : pillar)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center opacity-80"
                        style={{
                          color: "#86bc25",
                          backgroundColor: "rgba(134, 188, 37, 0.1)",
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-sm dark:text-white">
                          {pillar}
                        </div>
                        <div className="text-xs text-slate-500">
                          {PILLAR_REFS[pillar]}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignmentSaved(true);
                        }}
                        className="text-xs font-semibold px-2 text-[#86bc25] hover:underline"
                      >
                        Save Setup
                      </button>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={16} className="text-slate-400" />
                      )}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {items.map((d) => {
                        const isFilled = !!disclosureResponses[d.id]?.trim();
                        const isAssigned = !!disclosureAssignments[d.id];
                        return (
                          <div
                            key={d.id}
                            className="p-4 sm:flex gap-4 items-start bg-slate-50/30 dark:bg-slate-800/30"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <div
                                  className={
                                    "w-1.5 h-1.5 rounded-full shrink-0 " +
                                    (isFilled
                                      ? "bg-emerald-500"
                                      : isAssigned
                                        ? "bg-amber-500"
                                        : "bg-slate-400")
                                  }
                                />
                                <div className="font-bold text-sm dark:text-slate-200">
                                  {d.requirement}
                                </div>
                              </div>
                              <div className="text-xs text-slate-500 ml-3 mb-2">
                                {d.description}
                              </div>

                              <textarea
                                className="w-full ml-3 p-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-[#86bc25] focus:border-[#86bc25] outline-none transition-all resize-none dark:text-white"
                                rows={2}
                                placeholder="Override/edit response directly..."
                                value={disclosureResponses[d.id] || ""}
                                onChange={(e) =>
                                  updateDisclosureResponse(d.id, e.target.value)
                                }
                              />
                            </div>

                            <div className="mt-3 sm:mt-0 flex gap-2 items-center flex-wrap shrink-0">
                              <select
                                className="text-xs p-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
                                value={disclosureAssignments[d.id] || ""}
                                onChange={(e) =>
                                  assignDisclosure(d.id, e.target.value)
                                }
                              >
                                <option value="">Unassigned</option>
                                {dataOwnerUsers.map((u) => (
                                  <option key={u.email} value={u.name}>
                                    {u.name}
                                  </option>
                                ))}
                              </select>
                              <div
                                className={
                                  "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded " +
                                  (isFilled
                                    ? "bg-emerald-500/10 text-emerald-600"
                                    : "bg-slate-100 dark:bg-slate-700 text-slate-500")
                                }
                              >
                                {isFilled ? (
                                  <>
                                    <CheckCircle2 size={10} /> Done
                                  </>
                                ) : (
                                  <>
                                    <Clock size={10} /> Pending
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {mainTab === 1 && !reportDraft && (
          <div className="p-4 md:p-8 text-center max-w-4xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-8 text-left">
              {[
                {
                  label: "Disclosures",
                  value: `${disclosureFilledCount} / ${MINIMUM_DISCLOSURES.length}`,
                  color: "emerald",
                  ready: completionPct >= 50,
                },
                {
                  label: "Assignments",
                  value: `${disclosureAssignedCount} / ${MINIMUM_DISCLOSURES.length}`,
                  color: "[#86bc25]",
                  ready: disclosureAssignedCount > 0,
                },
                {
                  label: "Materiality",
                  value: `${selectedMaterialTopicIds.length} topics`,
                  ready: selectedMaterialTopicIds.length > 0,
                },
                {
                  label: "Emissions",
                  value:
                    totalEmissions > 0
                      ? `${formatNumber(totalEmissions)} tCO2e`
                      : "None",
                  ready: totalEmissions > 0,
                },
                {
                  label: "Scenarios",
                  value: `${scenarioResults.length} models`,
                  ready: scenarioResults.length > 0,
                },
                {
                  label: "Templates",
                  value: `${templates.length} deployed`,
                  ready: templates.length > 0,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 rounded-xl flex items-center gap-3"
                >
                  {item.ready ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <AlertCircle size={16} className="text-slate-400" />
                  )}
                  <div>
                    <div className="uppercase tracking-wider text-[10px] font-bold text-slate-500">
                      {item.label}
                    </div>
                    <div
                      className={
                        "text-sm font-bold " +
                        (item.ready
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400")
                      }
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="max-w-md mx-auto py-4">
              <div className="w-16 h-16 bg-[#86bc25]/10 border-2 border-[#86bc25]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-[#86bc25]" />
              </div>
              <h2 className="text-2xl font-black mb-2 dark:text-white">
                Run AI Engine
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Compile entity data, risk assessments, emissions, scenario
                results, and disclosure responses into a cohesive IFRS S1/S2
                report.
              </p>

              <div className="mb-6 max-w-xs mx-auto text-left">
                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                  Reporting Year
                </label>
                <select
                  className="w-full p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-lg text-sm outline-none dark:text-white"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {REPORT_YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      FY {y}
                    </option>
                  ))}
                </select>
              </div>

              {!canGenerate && (
                <p className="text-sm text-amber-500 font-semibold mb-4">
                  Only Managers/Admins can generate reports.
                </p>
              )}

              {generating && (
                <div className="mb-6 text-left">
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                    <div
                      className="h-full bg-[#86bc25] transition-all duration-300"
                      style={{ width: progress + "%" }}
                    />
                  </div>
                  <div className="text-xs text-slate-500 grid-cols-1">
                    {progress < 25
                      ? "Compiling entity..."
                      : progress < 50
                        ? "Analyzing risks..."
                        : progress < 75
                          ? "Calculating emissions..."
                          : "Generating narrative..."}
                  </div>
                </div>
              )}

              <button
                onClick={generateReport}
                disabled={generating || !canGenerate}
                className="w-full sm:w-auto px-8 py-3 bg-[#86bc25] hover:bg-[#86bc25]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold flex items-center justify-center gap-2 mx-auto shadow-xl shadow-[#86bc25]/20 transition-all"
              >
                {generating ? (
                  <Zap size={18} className="animate-pulse" />
                ) : (
                  <Sparkles size={18} />
                )}
                {generating ? "Generating..." : "Generate AI Report"}
              </button>
            </div>
          </div>
        )}

        {reportDraft && (
          <div>
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setReportDraft("");
                    setMainTab(0);
                  }}
                  className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <RotateCcw size={14} /> Back
                </button>
                <div className="font-bold text-sm dark:text-white">
                  Generated Report &mdash; {entityProfile.name}
                </div>
                {reportGeneratedBy && (
                  <div className="px-2 py-1 bg-[#86bc25]/10 text-[#86bc25] rounded text-[10px] font-bold flex items-center gap-1">
                    <User size={10} /> {reportGeneratedBy} &bull; FY{" "}
                    {reportYear}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={generateReport}
                  disabled={generating || !canGenerate}
                  className="px-3 py-1.5 bg-[#86bc25] hover:bg-[#86bc25]/90 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Sparkles size={14} /> Regenerate
                </button>
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="px-3 py-1.5 border border-purple-200 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-50 flex items-center gap-1.5"
                >
                  <ImagePlus size={14} /> Image
                </button>
                <button
                  onClick={() => {
                    const doc = new jsPDF({ unit: "pt", format: "a4" });
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const margin = 50;
                    const maxLineWidth = pageWidth - margin * 2;
                    let y = margin;
                    const renderBlock = (text, fontSize, bold) => {
                      doc.setFont("helvetica", bold ? "bold" : "normal");
                      doc.setFontSize(fontSize);
                      const lineH = fontSize * 1.45;
                      const lines = doc.splitTextToSize(text, maxLineWidth);
                      lines.forEach((line) => {
                        if (y + lineH > pageHeight - margin) {
                          doc.addPage();
                          y = margin;
                        }
                        doc.text(line, margin, y);
                        y += lineH;
                      });
                      y += fontSize * 0.35;
                    };
                    reportDraft.split("\n").forEach((line) => {
                      if (line.startsWith("# ")) {
                        renderBlock(line.replace(/^#\s+/, ""), 16, true);
                      } else if (line.startsWith("## ")) {
                        renderBlock(line.replace(/^##\s+/, ""), 13, true);
                      } else if (line.startsWith("### ")) {
                        renderBlock(line.replace(/^###\s+/, ""), 11, true);
                      } else if (line.trim() === "") {
                        y += 8;
                      } else {
                        renderBlock(line, 10, false);
                      }
                    });
                    reportImages.forEach((img) => {
                      doc.addPage();
                      doc.addImage(
                        img.dataUrl,
                        margin,
                        margin,
                        maxLineWidth,
                        0,
                      );
                    });
                    doc.save(
                      entityProfile.name.replace(/\s+/g, "_") +
                        "_Sustainability_Report_" +
                        new Date().getFullYear() +
                        ".pdf",
                    );
                  }}
                  className="px-3 py-1.5 border border-blue-200 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-50 flex items-center gap-1.5"
                >
                  <Download size={14} /> PDF
                </button>
              </div>
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
              <textarea
                className="w-full p-4 font-serif text-sm leading-relaxed bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#86bc25] dark:text-slate-100 min-h-[600px] resize-y"
                value={reportDraft}
                onChange={(e) => setReportDraft(e.target.value)}
              />

              {reportImages.length > 0 && (
                <div className="mt-6">
                  <div className="font-bold text-sm mb-3 dark:text-white">
                    Attached Images
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {reportImages.map((img) => (
                      <div
                        key={img.id}
                        className="relative w-40 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                      >
                        <button
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded flex items-center justify-center hover:bg-red-600 z-10 transition-colors"
                        >
                          <X size={12} />
                        </button>
                        <img
                          src={img.dataUrl}
                          alt={img.name}
                          className="w-full h-24 object-cover border-b border-slate-200 dark:border-slate-700"
                        />
                        <div className="p-1 px-2 text-[10px] text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap bg-white dark:bg-slate-800">
                          {img.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {assignmentSaved && (
        <div className="fixed bottom-4 right-4 bg-[#86bc25] text-white px-4 py-2 rounded-lg shadow-lg text-sm font-semibold flex items-center gap-2 animate-pulse">
          <CheckCircle2 size={16} /> Progress saved
        </div>
      )}
    </div>
  );
}
