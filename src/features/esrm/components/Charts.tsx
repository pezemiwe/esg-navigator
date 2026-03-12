import { useMemo } from "react";
import { useEsrmStore } from "../../../store/esrmStore";

const riskColors: Record<string, string> = {
  A: "bg-rose-600 dark:bg-rose-500",
  B: "bg-amber-500",
  C: "bg-emerald-600 dark:bg-emerald-500",
};

const seriesColors = [
  "bg-slate-600 dark:bg-slate-500",
  "bg-[#86BC25]",
  "bg-emerald-600 dark:bg-emerald-500",
  "bg-slate-400 dark:bg-slate-500",
  "bg-cyan-600 dark:bg-cyan-500",
  "bg-orange-500",
];

const formatAmount = (amount: number) => {
  if (amount >= 1000) {
    return `N${(amount / 1000).toFixed(1)}B`;
  }
  return `N${amount.toLocaleString()}M`;
};

export default function Charts() {
  const projects = useEsrmStore((state) => state.projects);

  const { facilityTypes, sectors, trends, exposure } = useMemo(() => {
    const activeProjects = projects.filter((project) => !project.isArchived);

    const facilityMap = new Map<string, number>();
    activeProjects.forEach((project) => {
      const key = project.facilityType || "Unspecified";
      facilityMap.set(key, (facilityMap.get(key) ?? 0) + 1);
    });
    const facilityTypes = Array.from(facilityMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, value], index) => ({
        name,
        value,
        color: seriesColors[index % seriesColors.length],
      }));

    const sectorMap = new Map<string, number>();
    activeProjects.forEach((project) => {
      const key = project.sector || "Unspecified";
      sectorMap.set(key, (sectorMap.get(key) ?? 0) + 1);
    });
    const totalProjects = activeProjects.length || 1;
    const sectors = Array.from(sectorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count], index) => ({
        name,
        count,
        pct: Math.round((count / totalProjects) * 100),
        color: seriesColors[index % seriesColors.length],
      }));

    const monthBuckets = Array.from({ length: 6 }, (_, index) => {
      const date = new Date();
      date.setDate(1);
      date.setMonth(date.getMonth() - (5 - index));
      return {
        key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        month: date.toLocaleDateString("en-US", { month: "short" }),
      };
    });

    const trends = monthBuckets.map((bucket) => ({
      month: bucket.month,
      val: activeProjects.filter((project) =>
        (project.date || "").startsWith(bucket.key),
      ).length,
    }));

    const riskOrder = ["A", "B", "C"];
    const exposure = riskOrder.map((risk) => {
      const amount = activeProjects
        .filter((project) => project.riskCategory === risk)
        .reduce(
          (total, project) => total + Number(project.estimatedAmount || 0),
          0,
        );
      return {
        label: `Category ${risk}`,
        sub:
          risk === "A"
            ? "High Risk"
            : risk === "B"
              ? "Medium Risk"
              : "Low Risk",
        val: amount,
        color: riskColors[risk],
      };
    });

    return { facilityTypes, sectors, trends, exposure };
  }, [projects]);

  const maxFacilityValue = Math.max(
    ...facilityTypes.map((item) => item.value),
    1,
  );
  const maxTrendValue = Math.max(...trends.map((item) => item.val), 1);
  const maxExposureValue = Math.max(...exposure.map((item) => item.val), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
      <div className="bg-white dark:bg-[#0B1120] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">
          Projects by Facility Type
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Distribution across facility categories
        </p>

        <div className="flex-1 flex items-end justify-around pb-2 mt-auto gap-4 px-4 h-48">
          {facilityTypes.map((item) => (
            <div key={item.name} className="flex flex-col items-center w-full">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {item.value}
              </span>
              <div
                className={`w-full max-w-[52px] rounded-t-sm ${item.color} transition-all`}
                style={{
                  height: `${Math.max((item.value / maxFacilityValue) * 144, 18)}px`,
                }}
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-3 text-center leading-tight">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B1120] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">
          Projects by Sector
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Industry sector breakdown
        </p>

        <div className="flex-1 flex flex-col justify-center space-y-5">
          {sectors.map((item) => (
            <div key={item.name} className="flex items-center gap-4">
              <span className="w-40 text-sm font-medium text-slate-700 dark:text-slate-300">
                {item.name}
              </span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full ${item.color} rounded-full`}
                  style={{ width: `${item.pct}%` }}
                />
              </div>
              <span className="w-16 text-right text-sm font-bold text-slate-800 dark:text-white">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B1120] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">
          Submission Trends
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Monthly project submission volume
        </p>

        <div className="flex-1 flex items-end justify-between pb-2 mt-auto gap-2 px-2 h-48">
          {trends.map((item) => (
            <div key={item.month} className="flex flex-col items-center w-full">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {item.val}
              </span>
              <div
                className="w-full max-w-[48px] bg-[#86BC25] rounded-t-sm transition-all"
                style={{
                  height: `${Math.max((item.val / maxTrendValue) * 144, 10)}px`,
                }}
              />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-3">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0B1120] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">
          Exposure by Risk
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Financial volume by risk category
        </p>

        <div className="flex-1 flex items-end justify-center gap-10 pb-2 mt-auto px-4 h-48">
          {exposure.map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {formatAmount(item.val)}
              </span>
              <div
                className={`w-14 rounded-t-sm ${item.color} transition-all`}
                style={{
                  height: `${Math.max((item.val / maxExposureValue) * 144, 10)}px`,
                }}
              />
              <div className="mt-4 text-center">
                <p className="text-sm font-bold text-slate-800 dark:text-white">
                  {item.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
