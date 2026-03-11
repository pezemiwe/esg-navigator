import React from "react";

export default function Charts() {
  const facilityTypes = [
    { name: "CAPEX", value: 25, color: "bg-slate-600 dark:bg-slate-500" },
    { name: "Guarantee", value: 20, color: "bg-[#86BC25]" },
    { name: "OPEX", value: 35, color: "bg-emerald-600 dark:bg-emerald-500" },
    {
      name: "Working Capital",
      value: 15,
      color: "bg-slate-400 dark:bg-slate-500",
    },
  ];

  const sectors = [
    { name: "Manufacturing", pct: 40, color: "bg-slate-600 dark:bg-slate-500" },
    { name: "Energy", pct: 25, color: "bg-[#86BC25]" },
    {
      name: "Agriculture",
      pct: 20,
      color: "bg-emerald-600 dark:bg-emerald-500",
    },
    { name: "ICT", pct: 15, color: "bg-slate-400 dark:bg-slate-500" },
  ];

  const trends = [
    { month: "Jan", val: 30 },
    { month: "Feb", val: 45 },
    { month: "Mar", val: 35 },
    { month: "Apr", val: 65 },
    { month: "May", val: 55 },
    { month: "Jun", val: 80 },
  ];

  const exposure = [
    {
      label: "Category A",
      sub: "High Risk",
      val: 40,
      color: "bg-rose-600 dark:bg-rose-500",
    },
    { label: "Category B", sub: "Medium Risk", val: 60, color: "bg-[#86BC25]" },
    {
      label: "Category C",
      sub: "Low Risk",
      val: 85,
      color: "bg-emerald-600 dark:bg-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
      {/* Card 1: Projects by Facility Type */}
      <div className="bg-white dark:bg-[#0B1120] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">
          Projects by Facility Type
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Distribution across facility categories
        </p>

        <div className="flex-1 flex items-end justify-around pb-2 mt-auto gap-4 px-4 h-48">
          {facilityTypes.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center w-full">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {item.value}
              </span>
              <div
                className={`w-full max-w-[48px] rounded-t-sm ${item.color} transition-all`}
                style={{ height: `${item.value * 3}px` }}
              ></div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-3 text-center leading-tight">
                {item.name.split(" ").map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: Projects by Sector */}
      <div className="bg-white dark:bg-[#0B1120] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">
          Projects by Sector
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Industry sector breakdown
        </p>

        <div className="flex-1 flex flex-col justify-center space-y-6">
          {sectors.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <span className="w-28 text-sm font-medium text-slate-700 dark:text-slate-300">
                {item.name}
              </span>
              <div className="flex-1 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className={`h-full ${item.color} rounded-full`}
                  style={{ width: `${item.pct}%` }}
                ></div>
              </div>
              <span className="w-10 text-right text-sm font-bold text-slate-800 dark:text-white">
                {item.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 3: Submission Trends */}
      <div className="bg-white dark:bg-[#0B1120] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">
          Submission Trends
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Monthly project submission volume
        </p>

        <div className="flex-1 flex items-end justify-between pb-2 mt-auto gap-2 px-2 h-48">
          {trends.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center w-full">
              <div
                className="w-full max-w-[48px] bg-[#86BC25] rounded-t-sm transition-all"
                style={{ height: `${item.val * 1.8}px` }}
              ></div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-3">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 4: Exposure by Risk */}
      <div className="bg-white dark:bg-[#0B1120] rounded-xl shadow-sm border border-slate-100 dark:border-slate-800/60 p-6 flex flex-col">
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-white mb-1">
          Exposure by Risk
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Financial volume by risk category
        </p>

        <div className="flex-1 flex items-end justify-center gap-12 pb-2 mt-auto px-4 h-48">
          {exposure.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div
                className={`w-14 rounded-t-sm ${item.color} transition-all`}
                style={{ height: `${item.val * 1.8}px` }}
              ></div>
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
