import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import {
  Activity,
  Flame,
  CloudRain,
  Landmark,
  Scale,
  TrendingDown,
  AlertTriangle,
  Play,
  CheckCircle2,
} from "lucide-react";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
  runScenarioSimulation,
  formatNaira,
} from "../data/constants";
import { cn } from "@/lib/utils";

const SCENARIOS = [
  {
    id: "carbon_tax",
    name: "Carbon Tax Introduction",
    description:
      "Federal carbon pricing at $50/tCO2e applied to all direct and financed emissions. Models the impact of planned climate tax policies on Nigerian commercial banks.",
    icon: Scale,
    color: "#ef4444",
    bgCls: "bg-red-50 dark:bg-red-900/10",
    borderCls: "border-red-500",
    textCls: "text-red-500",
    hoverCls: "hover:bg-red-600 transition-colors",
    details: [
      "$50 per tCO2e tax rate",
      "Applied to Scope 1-3 emissions",
      "Direct cost pass-through",
      "Consumer price escalation",
    ],
  },
  {
    id: "fossil_restriction",
    name: "Fossil Fuel Lending Ban",
    description:
      "30% reduction in fossil fuel sector lending capacity per CBN directive. Models portfolio rebalancing requirements and stranded asset exposure.",
    icon: Flame,
    color: "#f59e0b",
    bgCls: "bg-amber-50 dark:bg-amber-900/10",
    borderCls: "border-amber-500",
    textCls: "text-amber-500",
    hoverCls: "hover:bg-amber-600 transition-colors",
    details: [
      "30% fossil fuel lending restriction",
      "Oil & Gas exposure wind-down",
      "Portfolio rebalancing needed",
      "Alternative sector allocation",
    ],
  },
  {
    id: "lagos_flood",
    name: "Lagos Coastal Flooding",
    description:
      "Major flooding event impacting 12% of Lagos real estate collateral values. Models physical risk exposure for coastal branch network and mortgage portfolio.",
    icon: CloudRain,
    color: "#3b82f6",
    bgCls: "bg-blue-50 dark:bg-blue-900/10",
    borderCls: "border-blue-500",
    textCls: "text-blue-500",
    hoverCls: "hover:bg-blue-600 transition-colors",
    details: [
      "12% collateral value impairment",
      "15% of loan book affected",
      "Lagos coastal zone focus",
      "Infrastructure damage cascades",
    ],
  },
  {
    id: "regulatory_capital",
    name: "CBN ESG Capital Add-On",
    description:
      "0.5% capital add-on for non-compliant ESG disclosure. Models regulatory penalty for incomplete IFRS S1/S2 implementation.",
    icon: Landmark,
    color: "#8b5cf6",
    bgCls: "bg-violet-50 dark:bg-violet-900/10",
    borderCls: "border-violet-500",
    textCls: "text-violet-500",
    hoverCls: "hover:bg-violet-600 transition-colors",
    details: [
      "0.5% additional capital requirement",
      "Non-compliance penalty",
      "IFRS S1/S2 alignment required",
      "Regulatory reporting burden",
    ],
  },
];

export default function SustainabilityScenario() {
  const {
    scope1Assets,
    scope2Entries,
    scope3Entries,
    entityProfile,
    scenarioResults,
    addScenarioResult,
  } = useSustainabilityStore();

  const [runningScenario, setRunningScenario] = useState<string | null>(null);

  const s1 = useMemo(() => calculateScope1(scope1Assets), [scope1Assets]);
  const s2 = useMemo(() => calculateScope2(scope2Entries), [scope2Entries]);
  const s3 = useMemo(() => calculateScope3(scope3Entries), [scope3Entries]);

  const handleRunScenario = (scenarioId: string) => {
    setRunningScenario(scenarioId);
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setTimeout(() => {
      const result = runScenarioSimulation(
        scenarioId,
        s1,
        s2,
        s3,
        entityProfile.loanBook
      );
      addScenarioResult({
        id: `res-${scenarioId}-${Date.now()}`,
        name: scenario.name,
        description: scenario.description,
        ...result,
        runAt: new Date().toISOString(),
      });
      setRunningScenario(null);
    }, 1500);
  };

  const latestResults = useMemo(() => {
    const map = new Map<string, (typeof scenarioResults)[0]>();
    scenarioResults.forEach((r) => {
      const key = r.name;
      const existing = map.get(key);
      if (!existing || new Date(r.runAt) > new Date(existing.runAt)) {
        map.set(key, r);
      }
    });
    return Array.from(map.values());
  }, [scenarioResults]);

  const comparisonData = useMemo(() => {
    return latestResults.map((r) => ({
      name: r.name.split(" ").slice(0, 2).join(" "),
      cost: r.estimatedCost,
      npl: r.nplIncrease,
      capital: Math.abs(r.capitalAdequacyEffect),
      profit: Math.abs(r.profitImpact),
    }));
  }, [latestResults]);

  const radarData = useMemo(() => {
    if (latestResults.length === 0) return [];
    return [
      {
        metric: "Cost Impact",
        ...Object.fromEntries(
          latestResults.map((r) => [
            r.name.split(" ")[0],
            Math.min(r.estimatedCost / 1e9, 100),
          ])
        ),
      },
      {
        metric: "NPL Increase",
        ...Object.fromEntries(
          latestResults.map((r) => [r.name.split(" ")[0], r.nplIncrease * 10])
        ),
      },
      {
        metric: "Capital Effect",
        ...Object.fromEntries(
          latestResults.map((r) => [
            r.name.split(" ")[0],
            Math.abs(r.capitalAdequacyEffect) * 20,
          ])
        ),
      },
      {
        metric: "Profit Impact",
        ...Object.fromEntries(
          latestResults.map((r) => [
            r.name.split(" ")[0],
            Math.abs(r.profitImpact) * 100,
          ])
        ),
      },
      {
        metric: "Emission Risk",
        ...Object.fromEntries(
          latestResults.map((r) => [
            r.name.split(" ")[0],
            Math.min(r.totalEmissions / 10000, 100),
          ])
        ),
      },
    ];
  }, [latestResults]);

  const isRun = (scenarioId: string) => {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    return scenarioResults.some((r) => r.name === scenario?.name);
  };

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen">
      <div className="mb-8">
        <div className="text-[#86bc25] font-bold tracking-widest text-xs uppercase mb-1">
          SCENARIO ANALYSIS
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-2">
          Climate Scenario Stress Testing
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-3xl text-sm">
          Model financial impacts under IFRS S2 scenario analysis requirements —
          transition risks, physical risks, and regulatory scenarios
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const alreadyRun = isRun(scenario.id);
          const isRunning = runningScenario === scenario.id;
          
          return (
            <div
              key={scenario.id}
              className={cn(
                "p-6 bg-white dark:bg-[#1a1a1a] shadow-sm relative overflow-hidden border",
                alreadyRun ? "border-opacity-30" : "border-gray-200 dark:border-gray-800"
              )}
              style={alreadyRun ? { borderColor: scenario.color } : {}}
            >
              <div 
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ backgroundColor: scenario.color }}
              />
              
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className={cn("w-12 h-12 flex items-center justify-center shrink-0", scenario.bgCls)}
                >
                  <Icon size={24} className={scenario.textCls} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      {scenario.name}
                    </h3>
                    {alreadyRun && <CheckCircle2 size={16} className="text-emerald-500" />}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {scenario.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {scenario.details.map((d) => (
                  <span
                    key={d}
                    className={cn("px-2 py-1 text-[0.65rem] font-bold rounded", scenario.bgCls, scenario.textCls)}
                  >
                    {d}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleRunScenario(scenario.id)}
                disabled={isRunning}
                className={cn(
                  "w-full py-2.5 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                  alreadyRun
                    ? "bg-transparent border border-opacity-50 hover:bg-opacity-10"
                    : "text-white"
                )}
                style={
                  alreadyRun
                    ? { borderColor: scenario.color, color: scenario.color }
                    : { backgroundColor: scenario.color }
                }
              >
                {isRunning ? (
                  <Activity size={16} className="animate-spin" />
                ) : (
                  <Play size={16} />
                )}
                {isRunning
                  ? "Running Simulation..."
                  : alreadyRun
                    ? "Re-Run Scenario"
                    : "Run Scenario"}
              </button>
            </div>
          );
        })}
      </div>

      {latestResults.length > 0 && (
        <>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-6">
            Scenario Results
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {latestResults.map((result) => {
              const scenario = SCENARIOS.find((s) => s.name === result.name);
              const color = scenario?.color || "#86bc25";
              return (
                <div
                  key={result.id}
                  className="bg-white dark:bg-gray-800 border p-6"
                  style={{ borderColor: `${color}33` }}
                >
                  <h3 className="text-sm font-bold mb-4" style={{ color }}>
                    {result.name}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        label: "Estimated Cost",
                        value: formatNaira(result.estimatedCost),
                        icon: TrendingDown,
                      },
                      {
                        label: "Profit Impact",
                        value: `${result.profitImpact.toFixed(3)}%`,
                        icon: AlertTriangle,
                      },
                      {
                        label: "NPL Increase",
                        value: `+${result.nplIncrease}%`,
                        icon: Activity,
                      },
                      {
                        label: "Capital Adequacy",
                        value: `${result.capitalAdequacyEffect.toFixed(1)}%`,
                        icon: Landmark,
                      },
                    ].map((metric) => {
                      const MIcon = metric.icon;
                      return (
                        <div
                          key={metric.label}
                          className="p-3 bg-opacity-[0.04] border border-opacity-[0.08]"
                          style={{ backgroundColor: `${color}0A`, borderColor: `${color}14` }}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <MIcon size={12} color={color} />
                            <span className="text-[0.65rem] font-bold text-gray-500 uppercase tracking-wider">
                              {metric.label}
                            </span>
                          </div>
                          <div className="text-base font-extrabold text-gray-900 dark:text-white">
                            {metric.value}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 text-right">
                    <span className="text-xs text-gray-400">
                      Run: {new Date(result.runAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {latestResults.length >= 2 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">
                  Scenario Cost Comparison
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} margin={{ left: 20, bottom: 30 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                      <XAxis dataKey="name" fontSize={10} angle={-15} textAnchor="end" tick={{ fill: "#6b7280" }} axisLine={{ stroke: "#e5e7eb" }} />
                      <YAxis fontSize={10} tickFormatter={(v) => formatNaira(v)} tick={{ fill: "#6b7280" }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(value: any) => formatNaira(Number(value))} contentStyle={{ borderRadius: 0, fontSize: "12px", fontWeight: "bold" }} />
                      <Bar dataKey="cost" name="Estimated Cost" fill="#ef4444" radius={[0, 0, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div className="md:col-span-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-6">
                  Impact Radar
                </h3>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#e5e7eb" />
                      <PolarAngleAxis dataKey="metric" fontSize={10} tick={{ fill: "#6b7280", fontWeight: "bold" }} />
                      <PolarRadiusAxis fontSize={9} tick={{ fill: "#9ca3af" }} />
                      {latestResults.map((r, i) => {
                        const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"];
                        return (
                          <Radar
                            key={r.id}
                            name={r.name.split(" ")[0]}
                            dataKey={r.name.split(" ")[0]}
                            stroke={colors[i % colors.length]}
                            fill={colors[i % colors.length]}
                            fillOpacity={0.15}
                            strokeWidth={2}
                          />
                        );
                      })}
                      <Tooltip contentStyle={{ borderRadius: 0, fontSize: "12px", fontWeight: "bold", border: '1px solid #e5e7eb' }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
