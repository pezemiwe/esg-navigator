import {
  Users,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const KPICards = () => {
  const kpiData = [
    {
      title: "TOTAL PROJECTS",
      value: "500",
      change: "+12% vs last month",
      trend: "up",
      icon: Users,
    },
    {
      title: "HI RISK (CAT A)",
      value: "50",
      change: "-5% vs last month",
      trend: "down",
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-100 dark:bg-red-900/20",
    },
    {
      title: "MEDIUM RISK (CAT B)",
      value: "300",
      change: "+8% vs last month",
      trend: "up",
      icon: AlertCircle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-100 dark:bg-amber-900/20",
    },
    {
      title: "LOW RISK (CAT C)",
      value: "150",
      change: "+15% vs last month",
      trend: "up",
      icon: CheckCircle,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-100 dark:bg-emerald-900/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpiData.map((kpi, index) => (
        <div
          key={index}
          className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-800 hover:shadow-md hover:border-[#86BC25] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                kpi.bg || "bg-neutral-100 dark:bg-slate-800"
              } group-hover:bg-[#86BC25]/10`}
            >
              <kpi.icon
                className={`w-6 h-6 transition-colors ${
                  kpi.color || "text-neutral-900 dark:text-slate-200"
                } group-hover:text-[#86BC25]`}
              />
            </div>
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                kpi.trend === "up"
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                  : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
              }`}
            >
              {kpi.trend === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {kpi.change.split(" ")[0]}
            </div>
          </div>

          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1 uppercase tracking-wider">
              {kpi.title}
            </p>
            <p className="text-slate-900 dark:text-white text-3xl font-extrabold">
              {kpi.value}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 truncate">
              {kpi.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;
