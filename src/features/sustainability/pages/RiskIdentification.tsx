import { useState, useMemo } from "react";
import {
  Shield,
  AlertTriangle,
  Factory,
  Building,
  Globe,
  Briefcase,
  Scale,
  CloudSun,
  Plus,
  X,
  Trash2,
  Eye,
  FileUp,
  ArrowRight,
  Download,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useSustainabilityStore,
  type SustainabilityRisk,
} from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import {
  SAMPLE_INTERNAL_RISKS,
  SAMPLE_EXTERNAL_RISKS,
  SAMPLE_ERM_RISKS,
  SAMPLE_ISSB_RISKS,
  SAMPLE_REGULATOR_RISKS,
} from "@/config/sampleRisks";
import { getRiskColor, getRiskLevel, RISK_CATEGORIES } from "../data/constants";
import { cn } from "@/lib/utils";

const getHeatMapScore = (impact: number, likelihood: number) =>
  impact * likelihood;

const TABS = [
  {
    label: "SASB Aligned",
    icon: Factory,
    source: "sasb",
    desc: "Industry-specific material topics from the SASB framework.",
  },
  {
    label: "ISSB S2 (Climate)",
    icon: CloudSun,
    source: "issb",
    desc: "Climate-related risks and opportunities per IFRS S2 standards.",
  },
  {
    label: "Internal",
    icon: Building,
    source: "internal",
    desc: "Risks identified through internal operations and staff.",
  },
  {
    label: "External",
    icon: Globe,
    source: "external",
    desc: "Risks driven by markets, communities, and external stakeholders.",
  },
  {
    label: "ERM Aligned",
    icon: Briefcase,
    source: "erm",
    desc: "Traditional enterprise risks mapped to ESG factors.",
  },
  {
    label: "Regulators",
    icon: Scale,
    source: "regulator",
    desc: "Compliance, legal, and policy-driven risks.",
  },
];

export default function RiskIdentification() {
  const navigate = useNavigate();
  const { risks, setRisks, entityProfile, materialityApproval } =
    useSustainabilityStore(
      useShallow((state) => ({
        risks: state.risks,
        setRisks: state.setRisks,
        entityProfile: state.entityProfile,
        materialityApproval: state.materialityApproval,
      })),
    );

  const DEFAULT_MATRIX_LABELS: Record<number, string[]> = {
    3: ["Low", "Medium", "High"],
    4: ["Low", "Medium", "High", "Critical"],
    5: ["Very Low", "Low", "Medium", "High", "Critical"],
  };
  const matrixSize = entityProfile.scoringMatrix?.matrixSize ?? 5;
  const matrixLevels =
    entityProfile.scoringMatrix?.levels ?? DEFAULT_MATRIX_LABELS[matrixSize];

  const buildHorizonLabel = (
    name: string,
    tier?: { from: string; to: string },
  ) =>
    tier?.from || tier?.to
      ? `${name} (${tier.from ?? ""}–${tier.to ?? ""})`
      : null;
  const timeHorizonOptions = [
    buildHorizonLabel("Short Term", entityProfile.timeHorizons?.short) ??
      "Short Term (0-3 years)",
    buildHorizonLabel("Medium Term", entityProfile.timeHorizons?.medium) ??
      "Medium Term (3-10 years)",
    buildHorizonLabel("Long Term", entityProfile.timeHorizons?.long) ??
      "Long Term (10+ years)",
  ];

  const [tabIndex, setTabIndex] = useState(0);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"form" | "csv">("form");
  const [viewRiskModalOpen, setViewRiskModalOpen] = useState(false);
  const [missingTabsWarningOpen, setMissingTabsWarningOpen] = useState(false);

  const [selectedRisk, setSelectedRisk] = useState<SustainabilityRisk | null>(
    null,
  );
  const [deleteRiskId, setDeleteRiskId] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [newRisk, setNewRisk] = useState({
    name: "",
    category: "",
    impact: Math.ceil(matrixSize / 2),
    likelihood: Math.ceil(matrixSize / 2),
    financialEffect: "",
    timeHorizon: timeHorizonOptions[0],
  });

  const dynamicRiskList = useMemo(() => {
    return risks;
  }, [risks]);

  const handleAddRisk = () => {
    if (!newRisk.name || !newRisk.category) return;

    const riskToAdd: SustainabilityRisk = {
      ...newRisk,
      id: `custom-${Date.now()}`,
      source: TABS[tabIndex].source as SustainabilityRisk["source"],
      subcategory: "Custom User Entry",
    };

    setRisks([...risks, riskToAdd]);
    setAddModalOpen(false);
    setNewRisk({
      name: "",
      category: "",
      impact: Math.ceil(matrixSize / 2),
      likelihood: Math.ceil(matrixSize / 2),
      financialEffect: "",
      timeHorizon: timeHorizonOptions[0],
    });
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      setTimeout(() => {
        const csvData = event.target?.result as string;

        const parseCSVLine = (text: string) => {
          const result = [];
          let item = "";
          let inQuotes = false;
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              result.push(item);
              item = "";
            } else {
              item += char;
            }
          }
          result.push(item);
          return result;
        };

        const lines = csvData
          .split("\n")
          .filter((line) => line.trim().length > 0);
        if (lines.length < 2) {
          setIsUploading(false);
          return;
        }

        const newRisks: SustainabilityRisk[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length >= 6) {
            newRisks.push({
              id: `csv-${Date.now()}-${i}`,
              source: TABS[tabIndex].source as SustainabilityRisk["source"],
              subcategory: "Imported Record",
              name: values[0].trim(),
              category: values[1].trim(),
              impact: parseInt(values[2].trim(), 10) || 3,
              likelihood: parseInt(values[3].trim(), 10) || 3,
              financialEffect: values[4].trim(),
              timeHorizon: values[5].trim(),
            });
          }
        }
        setRisks([...risks, ...newRisks]);
        setIsUploading(false);
        setAddModalOpen(false);
      }, 800);
    };
    reader.readAsText(file);
  };

  const handleDeleteRisk = (id: string) => {
    setRisks(risks.filter((r) => r.id !== id));
  };

  const confirmDelete = () => {
    if (deleteRiskId) {
      handleDeleteRisk(deleteRiskId);
      setDeleteRiskId(null);
    }
  };

  const handleScoringClick = () => {
    const missingSources = Object.entries(sourceCounts)
      .filter(([, count]) => count === 0)
      .map(([source]) => source);

    if (missingSources.length > 0) {
      setMissingTabsWarningOpen(true);
    } else {
      navigate("/sustainability/risks/scoring");
    }
  };

  const activeSource = TABS[tabIndex].source;
  const activeRisks = dynamicRiskList.filter((r) => r.source === activeSource);
  const sourceCounts = {
    sasb: dynamicRiskList.filter((r) => r.source === "sasb").length,
    issb: dynamicRiskList.filter((r) => r.source === "issb").length,
    internal: dynamicRiskList.filter((r) => r.source === "internal").length,
    external: dynamicRiskList.filter((r) => r.source === "external").length,
    erm: dynamicRiskList.filter((r) => r.source === "erm").length,
    regulator: dynamicRiskList.filter((r) => r.source === "regulator").length,
  };

  return (
    <div className="h-full overflow-y-auto p-4 md:p-8 w-full max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-[#86bc25]" />
            <span className="text-[#86bc25] font-extrabold tracking-widest text-[0.65rem] uppercase">
              SUSTAINABILITY MODULE
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
            Risk Register
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Multi-source taxonomy for{" "}
            <strong>{entityProfile.name || "your entity"}</strong>
          </p>
        </div>
        <button
          className={cn(
            "px-6 py-2.5 rounded-none font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
            materialityApproval.status === "pending_internal" ||
              materialityApproval.status === "pending_board"
              ? "bg-amber-500 hover:bg-amber-600 text-black"
              : materialityApproval.status === "approved"
                ? "bg-[#86bc25] hover:bg-[#75a620] text-white"
                : "bg-[#86bc25] hover:bg-[#75a620] text-white",
          )}
          onClick={handleScoringClick}
          disabled={dynamicRiskList.length === 0}
        >
          {materialityApproval.status === "pending_internal" ||
          materialityApproval.status === "pending_board" ? (
            <Clock size={18} />
          ) : materialityApproval.status === "approved" ? (
            <CheckCircle2 size={18} />
          ) : (
            <ArrowRight size={18} />
          )}
          {materialityApproval.status === "pending_internal" ||
          materialityApproval.status === "pending_board"
            ? "Preview Pending Approval"
            : materialityApproval.status === "approved"
              ? "Preview Approved Topics"
              : "Perform Materiality Scoring"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
        {[
          {
            label: "Total Identified Risks",
            value: dynamicRiskList.length,
            icon: Shield,
            iconColor: "text-violet-500",
            iconBg: "bg-violet-500/10",
            trendColor: "bg-emerald-500",
            trendText: "Active in scope",
            trendTextColor: "text-emerald-500",
            badge: null,
          },
          {
            label: "Critical Priority (Heat > 15)",
            value: dynamicRiskList.filter(
              (r) => getHeatMapScore(r.impact, r.likelihood) >= 15,
            ).length,
            icon: AlertTriangle,
            iconColor: "text-blue-500",
            iconBg: "bg-blue-500/10",
            trendColor: "bg-red-500",
            trendText: "Requires immediate mitigation",
            trendTextColor: "text-red-500",
            badge:
              dynamicRiskList.filter(
                (r) => getHeatMapScore(r.impact, r.likelihood) >= 15,
              ).length > 0
                ? "NEEDS ATTENTION"
                : null,
          },
          {
            label: "Regulator Flagged",
            value: dynamicRiskList.filter((r) => r.source === "regulator")
              .length,
            icon: Scale,
            iconColor: "text-amber-500",
            iconBg: "bg-amber-500/10",
            trendColor: "bg-emerald-500",
            trendText: "Compliance exposure",
            trendTextColor: "text-emerald-500",
            badge: null,
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 flex flex-col justify-between min-h-[210px] shadow-sm relative overflow-hidden"
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{
                backgroundColor:
                  stat.iconColor === "text-violet-500"
                    ? "#8b5cf6"
                    : stat.iconColor === "text-blue-500"
                      ? "#3b82f6"
                      : "#f59e0b",
              }}
            />
            <div className="flex justify-between items-start pl-2">
              <h3 className="font-bold text-gray-900 dark:text-white text-base max-w-[70%] leading-snug">
                {stat.label}
              </h3>
              <div
                className={cn(
                  "p-2.5 flex items-center justify-center shrink-0",
                  stat.iconBg,
                )}
              >
                <stat.icon
                  size={22}
                  className={stat.iconColor}
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pl-2">
              <span className="text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-none">
                {stat.value}
              </span>
              {stat.badge && (
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold text-[0.65rem] tracking-wider rounded">
                  {stat.badge}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-3 pl-2">
              <div
                className={cn("w-2 h-2 rounded-full shrink-0", stat.trendColor)}
              />
              <span className={cn("font-bold text-sm", stat.trendTextColor)}>
                {stat.trendText}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden mb-8">
        <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800 no-scrollbar">
          {TABS.map((t, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTabIndex(idx);
                setPage(0);
              }}
              className={cn(
                "flex items-center gap-2 px-6 py-4 font-bold text-sm whitespace-nowrap border-b-2 transition-colors",
                tabIndex === idx
                  ? "border-[#86bc25] text-[#86bc25]"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300",
              )}
            >
              <t.icon size={16} />
              <span>{t.label}</span>
              <span className="text-xs opacity-60">
                ({sourceCounts[t.source as keyof typeof sourceCounts]})
              </span>
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 min-h-[400px]">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-6 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#86bc25]/10 text-[#86bc25]">
                  {(() => {
                    const Icon = TABS[tabIndex].icon;
                    return <Icon size={20} />;
                  })()}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {TABS[tabIndex].label} Intelligence
                </h2>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tabIndex === 0 && entityProfile.sasbIndustry
                  ? `Dynamically generated material topics for the ${entityProfile.sasbIndustry} sector, conforming to SASB logic.`
                  : TABS[tabIndex].desc}
              </p>
            </div>
            {activeRisks.length > 0 && (
              <button
                onClick={() => {
                  setUploadMode("form");
                  setAddModalOpen(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#86bc25] hover:bg-[#75a620] text-white font-bold text-sm transition-colors w-full md:w-auto justify-center"
              >
                <Plus size={18} />
                Add Record
              </button>
            )}
          </div>

          {activeRisks.length === 0 ? (
            <div className="py-20 px-4 text-center">
              <div className="w-16 h-16 mx-auto bg-[#86bc25]/10 border border-[#86bc25]/20 flex items-center justify-center mb-4">
                {(() => {
                  const Icon = TABS[tabIndex].icon;
                  return <Icon size={32} className="text-[#86bc25]" />;
                })()}
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                No Risk Data Catalogued
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto mb-6">
                Populate this source by defining manual records or bulk
                importing a CSV dataset.
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setUploadMode("form");
                    setAddModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25]/10 font-bold text-sm transition-colors"
                >
                  <FileUp size={18} />
                  Add Record
                </button>
                {(() => {
                  let samples: SustainabilityRisk[] = [];
                  if (activeSource === "issb") samples = SAMPLE_ISSB_RISKS;
                  else if (activeSource === "regulator")
                    samples = SAMPLE_REGULATOR_RISKS;
                  else if (activeSource === "internal")
                    samples = SAMPLE_INTERNAL_RISKS;
                  else if (activeSource === "external")
                    samples = SAMPLE_EXTERNAL_RISKS;
                  else if (activeSource === "erm") samples = SAMPLE_ERM_RISKS;

                  const newSamples = samples.filter(
                    (s) => !risks.some((r) => r.id === s.id),
                  );

                  if (newSamples.length > 0) {
                    return (
                      <button
                        onClick={() => {
                          setRisks([...risks, ...newSamples]);
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25]/10 font-bold text-sm transition-colors"
                      >
                        <Download size={18} />
                        Load Sample Data
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                All Transactions
              </h4>
              <div className="overflow-x-auto border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Risk Vector
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Category Map
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">
                        Severity
                        <br />
                        (Impact x Likelihood)
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Primary Financial Effect
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Time Horizon
                      </th>
                      <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {activeRisks
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((risk) => {
                        const heat = getHeatMapScore(
                          risk.impact,
                          risk.likelihood,
                        );
                        const color = getRiskColor(heat);
                        const level = getRiskLevel(heat);
                        return (
                          <tr
                            key={risk.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                          >
                            <td className="p-4">
                              <span className="font-bold text-sm text-gray-900 dark:text-white">
                                {risk.name}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center px-2 py-1 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
                                {risk.category}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span
                                className="inline-flex items-center justify-center px-3 py-1 text-xs font-bold min-w-[100px]"
                                style={{ backgroundColor: `${color}1A`, color }}
                              >
                                {level} ({heat})
                              </span>
                            </td>
                            <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                              {risk.financialEffect}
                            </td>
                            <td className="p-4 text-sm text-gray-500">
                              {risk.timeHorizon}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedRisk(risk);
                                    setViewRiskModalOpen(true);
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => setDeleteRiskId(risk.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rows per page:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setPage(0);
                    }}
                    className="border border-gray-300 dark:border-gray-700 bg-transparent text-sm p-1 max-h-[200px]"
                  >
                    {[5, 10, 20, 50].map((v) => (
                      <option
                        key={v}
                        value={v}
                        className="bg-white dark:bg-gray-800 text-black dark:text-white"
                      >
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {page * rowsPerPage + 1}-
                    {Math.min((page + 1) * rowsPerPage, activeRisks.length)} of{" "}
                    {activeRisks.length}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-1 border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                    >
                      &lt;
                    </button>
                    <button
                      onClick={() =>
                        setPage((p) =>
                          Math.min(
                            Math.ceil(activeRisks.length / rowsPerPage) - 1,
                            p + 1,
                          ),
                        )
                      }
                      disabled={(page + 1) * rowsPerPage >= activeRisks.length}
                      className="p-1 border border-gray-300 dark:border-gray-700 disabled:opacity-50"
                    >
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                    Add New {TABS[tabIndex].label} Risk
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Capture risk metadata and scoring for this source.
                  </p>
                </div>
                <button
                  onClick={() => setAddModalOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex gap-4 mt-6 border-b border-gray-200 dark:border-gray-800">
                <button
                  className={cn(
                    "pb-2 text-sm font-bold border-b-2 transition-colors",
                    uploadMode === "form"
                      ? "border-[#86bc25] text-[#86bc25]"
                      : "border-transparent text-gray-500 hover:text-gray-700",
                  )}
                  onClick={() => setUploadMode("form")}
                >
                  Manual Entry
                </button>
                <button
                  className={cn(
                    "pb-2 text-sm font-bold border-b-2 transition-colors",
                    uploadMode === "csv"
                      ? "border-[#86bc25] text-[#86bc25]"
                      : "border-transparent text-gray-500 hover:text-gray-700",
                  )}
                  onClick={() => setUploadMode("csv")}
                >
                  Bulk Upload (CSV)
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto">
              {uploadMode === "csv" ? (
                <div className="text-center py-8 px-4 border-2 border-dashed border-[#86bc25]/40 bg-[#86bc25]/5 rounded-sm">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Upload a CSV File
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Your file must include headers: name, category, impact,
                    likelihood, financialEffect, timeHorizon.
                  </p>
                  <div className="flex flex-col items-center gap-4">
                    <a
                      href={`/templates/${TABS[tabIndex].source}_template.csv`}
                      download={`${TABS[tabIndex].source}_risk_template.csv`}
                      className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#86bc25]/40 text-[#86bc25] hover:bg-[#86bc25]/5 font-bold text-sm transition-colors"
                    >
                      <Download size={16} />
                      Download Template
                    </a>
                    <label className="flex items-center gap-2 px-6 py-2.5 bg-[#86bc25] hover:bg-[#75a620] text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50">
                      {isUploading ? "Uploading..." : "Select File"}
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <div>
                    <span className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                      Risk Information
                    </span>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Risk Vector (Name)
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
                          placeholder="e.g., Supply Chain Disruption"
                          value={newRisk.name}
                          onChange={(e) =>
                            setNewRisk({ ...newRisk, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Category
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white max-h-[200px]"
                          value={newRisk.category}
                          onChange={(e) =>
                            setNewRisk({ ...newRisk, category: e.target.value })
                          }
                        >
                          <option
                            value=""
                            disabled
                            className="bg-white dark:bg-gray-800 text-black dark:text-white"
                          >
                            Select category
                          </option>
                          {RISK_CATEGORIES.map((cat) => (
                            <option
                              key={cat}
                              value={cat}
                              className="bg-white dark:bg-gray-800 text-black dark:text-white"
                            >
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Time Horizon
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white max-h-[200px]"
                          value={newRisk.timeHorizon}
                          onChange={(e) =>
                            setNewRisk({
                              ...newRisk,
                              timeHorizon: e.target.value,
                            })
                          }
                        >
                          {timeHorizonOptions.map((opt) => (
                            <option
                              key={opt}
                              value={opt}
                              className="bg-white dark:bg-gray-800 text-black dark:text-white"
                            >
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Primary Financial Effect
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white"
                          placeholder="e.g., Increased Operating Costs"
                          value={newRisk.financialEffect}
                          onChange={(e) =>
                            setNewRisk({
                              ...newRisk,
                              financialEffect: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-widest mb-3 block">
                      Scoring
                    </span>
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Impact Score
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white max-h-[200px]"
                          value={newRisk.impact}
                          onChange={(e) =>
                            setNewRisk({
                              ...newRisk,
                              impact: Number(e.target.value),
                            })
                          }
                        >
                          {Array.from({ length: matrixSize }, (_, i) => (
                            <option
                              key={i + 1}
                              value={i + 1}
                              className="bg-white dark:bg-gray-800 text-black dark:text-white"
                            >
                              {i + 1} - {matrixLevels[i]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Likelihood Score
                        </label>
                        <select
                          className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white max-h-[200px]"
                          value={newRisk.likelihood}
                          onChange={(e) =>
                            setNewRisk({
                              ...newRisk,
                              likelihood: Number(e.target.value),
                            })
                          }
                        >
                          {Array.from({ length: matrixSize }, (_, i) => (
                            <option
                              key={i + 1}
                              value={i + 1}
                              className="bg-white dark:bg-gray-800 text-black dark:text-white"
                            >
                              {i + 1} - {matrixLevels[i]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {uploadMode !== "csv" && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/30">
                <span className="text-xs text-gray-500">
                  Complete required fields to add a risk.
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setAddModalOpen(false)}
                    className="px-4 py-2 font-bold text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddRisk}
                    disabled={!newRisk.name || !newRisk.category}
                    className="flex items-center gap-2 px-5 py-2 bg-[#86bc25] hover:bg-[#75a620] text-white font-bold text-sm transition-colors disabled:opacity-50"
                  >
                    <Plus size={16} />
                    Add Record
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewRiskModalOpen && selectedRisk && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-lg shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedRisk.name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedRisk.category} — {selectedRisk.subcategory}
                </p>
              </div>
              <button
                onClick={() => setViewRiskModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                    Impact Score
                  </span>
                  <span className="text-2xl font-extrabold text-red-500">
                    {selectedRisk.impact} / {matrixSize}
                  </span>
                </div>
                <div className="flex-1">
                  <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                    Likelihood Score
                  </span>
                  <span className="text-2xl font-extrabold text-blue-500">
                    {selectedRisk.likelihood} / {matrixSize}
                  </span>
                </div>
              </div>

              <div className="p-5 bg-[#86bc25]/5 border border-[#86bc25]/10 flex items-center justify-between">
                <div>
                  <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                    Calculated Severity (Heat Map)
                  </span>
                  <span className="text-3xl font-extrabold text-[#86bc25]">
                    {getHeatMapScore(
                      selectedRisk.impact,
                      selectedRisk.likelihood,
                    )}
                  </span>
                </div>
                <span
                  className="px-3 py-1 font-bold text-sm"
                  style={{
                    backgroundColor: `${getRiskColor(getHeatMapScore(selectedRisk.impact, selectedRisk.likelihood))}1A`,
                    color: getRiskColor(
                      getHeatMapScore(
                        selectedRisk.impact,
                        selectedRisk.likelihood,
                      ),
                    ),
                  }}
                >
                  {getRiskLevel(
                    getHeatMapScore(
                      selectedRisk.impact,
                      selectedRisk.likelihood,
                    ),
                  )}
                </span>
              </div>

              <div>
                <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                  Primary Financial Effect
                </span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedRisk.financialEffect}
                </p>
              </div>

              <div>
                <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-widest block mb-1">
                  Time Horizon
                </span>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedRisk.timeHorizon}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteRiskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm shadow-2xl p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Delete Risk Record
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to delete this risk record? This action
              cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteRiskId(null)}
                className="px-4 py-2 font-bold text-sm text-gray-600 hover:text-gray-900 border border-gray-300 dark:border-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Missing Tabs Warning Modal */}
      {missingTabsWarningOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="text-amber-500" size={24} />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Incomplete Risk Data
              </h2>
            </div>
            <p className="text-gray-500 text-sm mb-4">
              You have not uploaded or entered any risks for one or more tabs.
              Are you sure you want to proceed to scoring without completing all
              sections?
            </p>
            <div className="mb-6">
              <span className="block font-bold text-sm text-gray-900 dark:text-white mb-1">
                Missing sections:
              </span>
              <span className="text-sm text-gray-500">
                {Object.entries(sourceCounts)
                  .filter(([, count]) => count === 0)
                  .map(
                    ([source]) => TABS.find((t) => t.source === source)?.label,
                  )
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setMissingTabsWarningOpen(false)}
                className="px-4 py-2 font-bold text-sm text-gray-600 hover:text-gray-900 border border-gray-300 dark:border-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setMissingTabsWarningOpen(false);
                  navigate("/sustainability/risks/scoring");
                }}
                className="px-4 py-2 bg-[#86bc25] hover:bg-[#75a620] text-white font-bold text-sm transition-colors"
              >
                Proceed Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
