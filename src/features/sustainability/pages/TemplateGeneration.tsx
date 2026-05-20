import { useState, useMemo, useEffect } from "react";
import { FileSpreadsheet, CheckCircle2, Clock, Send } from "lucide-react";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useRegionStore } from "@/store/regionStore";
import type { DataTemplate } from "@/store/sustainabilityStore";
import { TEMPLATE_CONFIGS } from "../data/constants";
import { cn } from "@/lib/utils";

export default function TemplateGeneration() {
  const {
    risks,
    selectedMaterialTopicIds,
    templates,
    setTemplates,
    updateTemplate,
  } = useSustainabilityStore();

  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const selectedRisks = useMemo(() => {
    return risks.filter((r) => selectedMaterialTopicIds.includes(r.id));
  }, [risks, selectedMaterialTopicIds]);

  useEffect(() => {
    if (templates.length > 0 || selectedRisks.length === 0) return;
    const generated: DataTemplate[] = selectedRisks.map((risk) => {
      const config =
        TEMPLATE_CONFIGS[risk.category] || TEMPLATE_CONFIGS["Operational"];
      return {
        id: `tpl-${risk.id}`,
        topicId: risk.id,
        topicName: risk.name,
        assignedTo: config.assignedTo,
        department: config.department,
        frequency: "quarterly",
        fields: config.fields.map((metric) => ({
          metric,
          fy2023: "",
          fy2024: "",
          fy2025: "",
          notes: "",
        })),
        status: "pending",
      };
    });
    setTemplates(generated);
  }, [selectedRisks, templates.length, setTemplates]);

  const statusCounts = useMemo(() => {
    const map = { pending: 0, "in-progress": 0, submitted: 0, approved: 0 };
    templates.forEach((t) => {
      map[t.status]++;
    });
    return map;
  }, [templates]);

  const completionPct = useMemo(() => {
    if (templates.length === 0) return 0;
    const done = templates.filter(
      (t) => t.status === "submitted" || t.status === "approved",
    ).length;
    return Math.round((done / templates.length) * 100);
  }, [templates]);

  const activeT = useMemo(() => {
    return templates.find((t) => t.id === activeTemplate);
  }, [templates, activeTemplate]);

  const handleFieldChange = (
    templateId: string,
    fieldIndex: number,
    key: string,
    value: string,
  ) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    const fields = [...tpl.fields];
    fields[fieldIndex] = { ...fields[fieldIndex], [key]: value };
    updateTemplate(templateId, { fields });
  };

  const handleStatusChange = (
    templateId: string,
    status: DataTemplate["status"],
  ) => {
    updateTemplate(templateId, {
      status,
      submittedAt:
        status === "submitted" ? new Date().toISOString() : undefined,
    });
  };

  const statusConfig: Record<
    string,
    { bgCls: string; textCls: string; icon: typeof Clock }
  > = {
    pending: { bgCls: "bg-slate-100", textCls: "text-slate-500", icon: Clock },
    "in-progress": {
      bgCls: "bg-amber-100",
      textCls: "text-amber-500",
      icon: Clock,
    },
    submitted: { bgCls: "bg-blue-100", textCls: "text-blue-500", icon: Send },
    approved: {
      bgCls: "bg-[#86bc25]/10",
      textCls: "text-[#86bc25]",
      icon: CheckCircle2,
    },
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="mb-8">
        <div className="text-[#86bc25] font-bold tracking-widest text-xs uppercase mb-1">
          DATA TEMPLATE GENERATION
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
          Template Assignment & Data Collection
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-3xl text-sm">
          Auto-generated data templates for each material topic — assign to
          departments and track completion status
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-6">
        {[
          {
            label: "Templates",
            value: templates.length,
            borderCls: "border-[#86bc25]",
          },
          {
            label: "Pending",
            value: statusCounts.pending,
            borderCls: "border-slate-400",
          },
          {
            label: "In Progress",
            value: statusCounts["in-progress"],
            borderCls: "border-amber-500",
          },
          {
            label: "Submitted",
            value: statusCounts.submitted,
            borderCls: "border-blue-500",
          },
          {
            label: "Approved",
            value: statusCounts.approved,
            borderCls: "border-emerald-500",
          },
          {
            label: "Completion",
            value: `${completionPct}%`,
            borderCls: "border-[#86bc25]",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#1a1a1a] p-4 text-center border border-gray-200 dark:border-gray-800 relative overflow-hidden"
          >
            <div
              className={`absolute top-0 left-0 right-0 h-[3px] bg-transparent border-t-[3px] ${stat.borderCls}`}
            ></div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white mt-1">
              {stat.value}
            </div>
            <div className="text-[0.65rem] uppercase font-bold text-gray-500 mt-1 tracking-wider">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 mb-6 bg-[#86bc25]/5 border border-[#86bc25]/10">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Overall Data Collection Progress
          </h3>
          <span className="font-extrabold text-[#86bc25] text-lg">
            {completionPct}%
          </span>
        </div>
        <div className="w-full bg-[#86bc25]/20 h-2">
          <div
            className="bg-[#86bc25] h-full transition-all duration-300"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[600px]">
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={20} className="text-[#86bc25]" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Generated Templates
              </h3>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {templates.map((tpl) => {
              const sConfig = statusConfig[tpl.status];
              const Icon = sConfig.icon;
              const isActive = activeTemplate === tpl.id;
              return (
                <div
                  key={tpl.id}
                  onClick={() => setActiveTemplate(tpl.id)}
                  className={cn(
                    "p-4 cursor-pointer border-b border-gray-100 dark:border-gray-800 transition-colors group",
                    isActive
                      ? "bg-[#86bc25]/5 border-l-[3px] border-l-[#86bc25]"
                      : "border-l-[3px] border-l-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {tpl.topicName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {tpl.department} — {tpl.assignedTo}
                      </p>
                    </div>
                    <div
                      className={cn(
                        "flex items-center gap-1.5 px-2 py-1 rounded text-[0.6rem] font-bold capitalize shrink-0",
                        sConfig.bgCls,
                        sConfig.textCls,
                      )}
                    >
                      <Icon size={12} />
                      {tpl.status.replace("-", " ")}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[0.65rem] font-bold rounded capitalize">
                      {tpl.fields.length} metrics
                    </span>
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[0.65rem] font-bold rounded capitalize">
                      {tpl.frequency}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="md:col-span-7">
          {activeT ? (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {activeT.topicName}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Assigned to {activeT.assignedTo} ({activeT.department})
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase">
                    Status
                  </label>
                  <select
                    value={activeT.status}
                    onChange={(e) =>
                      handleStatusChange(
                        activeT.id,
                        e.target.value as DataTemplate["status"],
                      )
                    }
                    className="p-1.5 text-sm font-bold border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#86bc25] focus:ring-1 focus:ring-[#86bc25]"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-900">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr className="text-gray-500 font-bold uppercase tracking-wider text-[0.65rem] align-middle">
                      <th className="p-3 pl-4">Metric</th>
                      <th className="p-3 text-center">FY 2023</th>
                      <th className="p-3 text-center">FY 2024</th>
                      <th className="p-3 text-center">FY 2025</th>
                      <th className="p-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700/50">
                    {activeT.fields.map((field, fi) => (
                      <tr
                        key={fi}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="p-3 pl-4 font-bold text-gray-800 dark:text-gray-200 text-xs min-w-[200px] whitespace-normal">
                          {field.metric}
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            value={field.fy2023}
                            onChange={(e) =>
                              handleFieldChange(
                                activeT.id,
                                fi,
                                "fy2023",
                                e.target.value,
                              )
                            }
                            className="w-24 p-1.5 text-center text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#86bc25] focus:ring-1 focus:ring-[#86bc25]"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            value={field.fy2024}
                            onChange={(e) =>
                              handleFieldChange(
                                activeT.id,
                                fi,
                                "fy2024",
                                e.target.value,
                              )
                            }
                            className="w-24 p-1.5 text-center text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#86bc25] focus:ring-1 focus:ring-[#86bc25]"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="text"
                            value={field.fy2025}
                            onChange={(e) =>
                              handleFieldChange(
                                activeT.id,
                                fi,
                                "fy2025",
                                e.target.value,
                              )
                            }
                            className="w-24 p-1.5 text-center text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#86bc25] focus:ring-1 focus:ring-[#86bc25]"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={field.notes}
                            onChange={(e) =>
                              handleFieldChange(
                                activeT.id,
                                fi,
                                "notes",
                                e.target.value,
                              )
                            }
                            placeholder="Add note..."
                            className="w-full min-w-[150px] p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:border-[#86bc25] focus:ring-1 focus:ring-[#86bc25]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {activeT.submittedAt && (
                <div className="mt-4 text-right">
                  <p className="text-xs text-gray-500 font-medium">
                    Submitted on{" "}
                    {new Date(activeT.submittedAt).toLocaleDateString(
                      useRegionStore.getState().profile.locale,
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <FileSpreadsheet
                size={64}
                strokeWidth={1}
                className="text-gray-300 dark:text-gray-600 mb-6"
              />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Select a Template
              </h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto leading-relaxed">
                Click on a template from the left panel to view and edit its
                data collection fields. Templates are auto-generated based on
                your selected material topics.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
