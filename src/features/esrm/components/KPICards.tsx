import { useMemo } from "react";
import {
  Briefcase,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useEsrmStore } from "../../../store/esrmStore";

export default function KPICards() {
  const projects = useEsrmStore((state) => state.projects);

  const kpiData = useMemo(() => {
    const total = projects.length;
    const countA = projects.filter(
      (project) => project.riskCategory === "A",
    ).length;
    const countB = projects.filter(
      (project) => project.riskCategory === "B",
    ).length;
    const countC = projects.filter(
      (project) => project.riskCategory === "C",
    ).length;
    const drafts = projects.filter((project) => project.isDraft).length;
    const completed = projects.filter(
      (project) => project.currentStepPath === "monitoring",
    ).length;

    return [
      {
        title: "Total Projects",
        value: String(total),
        change: `${drafts} drafts, ${completed} at monitoring`,
        icon: Briefcase,
        iconBg: "bg-[#86BC25]/10",
        iconColor: "text-[#86BC25]",
      },
      {
        title: "High Risk (Cat A)",
        value: String(countA),
        change: `${total ? Math.round((countA / total) * 100) : 0}% of portfolio`,
        icon: AlertTriangle,
        iconBg: "bg-rose-50 dark:bg-rose-500/10",
        iconColor: "text-rose-500",
      },
      {
        title: "Medium Risk (Cat B)",
        value: String(countB),
        change: `${total ? Math.round((countB / total) * 100) : 0}% of portfolio`,
        icon: AlertCircle,
        iconBg: "bg-amber-50 dark:bg-amber-500/10",
        iconColor: "text-amber-500",
      },
      {
        title: "Low Risk (Cat C)",
        value: String(countC),
        change: `${total ? Math.round((countC / total) * 100) : 0}% of portfolio`,
        icon: CheckCircle,
        iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
        iconColor: "text-emerald-500",
      },
    ];
  }, [projects]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
      {kpiData.map((kpi) => (
        <div
          key={kpi.title}
          className="bg-white dark:bg-[#0B1120] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/60 flex flex-col justify-between"
        >
          <div className="flex items-start justify-between mb-4">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {kpi.title}
            </span>
            <div
              className={`w-10 h-10 rounded-xl ${kpi.iconBg} flex items-center justify-center`}
            >
              <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
            </div>
          </div>
          <div>
            <p className="text-[32px] font-bold text-slate-900 dark:text-white leading-tight">
              {kpi.value}
            </p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-2">
              {kpi.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
