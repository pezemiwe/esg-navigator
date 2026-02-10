const Charts = () => {
  const facilityTypeData = [
    { name: "CAPEX", value: 25, color: "bg-slate-700 dark:bg-slate-600" },
    { name: "Guarantee", value: 20, color: "bg-[#86BC25]" },
    { name: "OPEX", value: 35, color: "bg-emerald-600" },
    { name: "Working Capital", value: 15, color: "bg-slate-400" },
  ];

  const sectorData = [
    {
      name: "Manufacturing",
      value: 40,
      color: "bg-slate-700 dark:bg-slate-600",
    },
    { name: "Energy", value: 25, color: "bg-[#86BC25]" },
    { name: "Agriculture", value: 20, color: "bg-emerald-600" },
    { name: "ICT", value: 15, color: "bg-slate-400" },
  ];

  const monthlyData = [
    { month: "Jan", value: 15 },
    { month: "Feb", value: 25 },
    { month: "Mar", value: 20 },
    { month: "Apr", value: 35 },
    { month: "May", value: 30 },
    { month: "Jun", value: 40 },
  ];

  const riskCategoryData = [
    { category: "A", value: 400, color: "bg-red-600", label: "Hi Risk" },
    { category: "B", value: 600, color: "bg-[#86BC25]", label: "Medium Risk" },
    { category: "C", value: 800, color: "bg-emerald-600", label: "Low Risk" },
  ];

  const maxValue = Math.max(...monthlyData.map((d) => d.value));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Projects by Facility Type
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Distribution across facility categories
        </p>

        <div className="h-56 flex items-end justify-center gap-6">
          {facilityTypeData.map((item, index) => (
            <div key={index} className="flex flex-col items-center group">
              <div
                className={`w-16 ${item.color} rounded-t-sm shadow-sm transition-all duration-300 relative group-hover:opacity-90`}
                style={{ height: `${(item.value / 40) * 140}px` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-slate-900 dark:text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.value}
                </div>
              </div>
              <span className="text-xs text-slate-600 dark:text-slate-400 mt-3 text-center font-medium max-w-20 leading-tight">
                {item.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Projects by Sector
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Industry sector breakdown
        </p>

        <div className="space-y-5">
          {sectorData.map((item, index) => (
            <div key={index} className="flex items-center gap-4 group">
              <div className="w-24 text-sm text-slate-700 dark:text-slate-300 font-medium">
                {item.name}
              </div>
              <div className="flex-1 bg-neutral-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-900 dark:text-white w-10 text-rit">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Submission Trends
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Monthly project submission volume
        </p>

        <div className="h-56 flex items-end justify-between gap-3 px-2">
          {monthlyData.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center flex-1 group"
            >
              <div
                className="w-full bg-[#86BC25] rounded-t-sm shadow-sm transition-all duration-300 relative group-hover:bg-amber-400"
                style={{ height: `${(item.value / maxValue) * 140}px` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-slate-900 dark:text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.value}
                </div>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-medium">
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-neutral-200 dark:border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          Exposure by Risk
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Financial volume by risk category
        </p>

        <div className="h-56 flex items-end justify-center gap-12">
          {riskCategoryData.map((item, index) => (
            <div key={index} className="flex flex-col items-center group">
              <div
                className={`w-16 ${item.color} rounded-t-sm shadow-sm transition-all duration-300 relative group-hover:opacity-90`}
                style={{ height: `${(item.value / 800) * 140}px` }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-slate-900 dark:text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  ${item.value}M
                </div>
              </div>
              <div className="text-center mt-3">
                <span className="block text-sm text-slate-900 dark:text-white font-bold">
                  Category {item.category}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {item.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Charts;
