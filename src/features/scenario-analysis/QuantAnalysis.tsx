import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  ComposedChart,
  Area,
} from "recharts";
import {
  Play,
  RefreshCw,
  TrendingUp,
  Activity,
  AlertTriangle,
  Sigma,
  Calculator,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import ScenarioLayout from "./layout/ScenarioLayout";

interface ChartConfig {
  id: string;
  title: string;
  xLabel: string;
  yLabel: string;
  metrics: { rSquared: number; beta: number; alpha: number; var: number };
  metricLabels: { rSquared: string; beta: string; alpha: string; var: string };
  metricSubLabels: {
    rSquared: string;
    beta: string;
    alpha: string;
    var: string;
  };
  generate: (points: number) => Array<{
    x: number;
    y: number;
    base: number;
    lower: number;
    upper: number;
  }>;
}

const CHARTS: ChartConfig[] = [
  {
    id: "carbon-pd",
    title: "Regression: Carbon Price Impact on Portfolio PD",
    xLabel: "Carbon Price ($/tCO₂)",
    yLabel: "Portfolio PD Impact (bps)",
    metrics: { rSquared: 0.87, beta: 1.25, alpha: 0.05, var: 12.4 },
    metricLabels: {
      rSquared: "R² (Correlation)",
      beta: "β (Carbon Sensitivity)",
      alpha: "ECL Impact (α)",
      var: "Climate VaR (99.9%)",
    },
    metricSubLabels: {
      rSquared: "Strong Fit",
      beta: "High Volatility",
      alpha: "Projected",
      var: "Transition Risk",
    },
    generate: (points: number) => {
      const data = [];
      for (let i = 0; i < points; i++) {
        const x = i;
        const base = 50 + 0.5 * x;
        const noise = (Math.random() - 0.5) * 20;
        data.push({
          x,
          y: base + noise,
          base,
          lower: base - 10 - Math.random() * 5,
          upper: base + 10 + Math.random() * 5,
        });
      }
      return data;
    },
  },
  {
    id: "energy-lgd",
    title: "Regression: Energy Cost Shock vs LGD Shift",
    xLabel: "Energy Cost Index (Δ%)",
    yLabel: "LGD Shift (bps)",
    metrics: { rSquared: 0.79, beta: 0.84, alpha: 0.08, var: 9.6 },
    metricLabels: {
      rSquared: "R² (Fit Quality)",
      beta: "β (Energy Sensitivity)",
      alpha: "LGD Shift (α)",
      var: "Energy VaR (99%)",
    },
    metricSubLabels: {
      rSquared: "Good Fit",
      beta: "Moderate",
      alpha: "Cost Driven",
      var: "Supply Shock",
    },
    generate: (points: number) => {
      const data = [];
      for (let i = 0; i < points; i++) {
        const x = i * 0.8;
        const base = 30 + 0.35 * x;
        const noise = (Math.random() - 0.5) * 15;
        data.push({
          x,
          y: base + noise,
          base,
          lower: base - 8 - Math.random() * 4,
          upper: base + 8 + Math.random() * 4,
        });
      }
      return data;
    },
  },
  {
    id: "emissions-ecl",
    title: "Regression: Emissions Intensity vs ECL Migration",
    xLabel: "Emissions Intensity (tCO₂/₦m)",
    yLabel: "ECL Migration Rate (%)",
    metrics: { rSquared: 0.91, beta: 1.52, alpha: 0.03, var: 15.8 },
    metricLabels: {
      rSquared: "R² (Correlation)",
      beta: "β (Emissions Impact)",
      alpha: "ECL Migration (α)",
      var: "Stranded Asset VaR",
    },
    metricSubLabels: {
      rSquared: "Very Strong Fit",
      beta: "Critical",
      alpha: "Sector Specific",
      var: "Physical Risk",
    },
    generate: (points: number) => {
      const data = [];
      for (let i = 0; i < points; i++) {
        const x = i * 1.2;
        const base = 20 + 0.65 * x;
        const noise = (Math.random() - 0.5) * 25;
        data.push({
          x,
          y: base + noise,
          base,
          lower: base - 12 - Math.random() * 6,
          upper: base + 12 + Math.random() * 6,
        });
      }
      return data;
    },
  },
];

const AnimatedDot = ({
  cx,
  cy,
  active,
}: {
  cx?: number;
  cy?: number;
  active: boolean;
}) => {
  if (!cx || !cy) return null;
  if (!active) {
    return <circle cx={cx} cy={cy} r={3} fill="#3b82f6" opacity={0.5} />;
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={4} fill="#86BC25" />
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="none"
        stroke="#86BC25"
        strokeWidth={1.5}
        opacity={0.8}
      >
        <animate
          attributeName="r"
          values="8;18;8"
          dur="1.8s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.8;0.1;0.8"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={cx}
        cy={cy}
        r={14}
        fill="none"
        stroke="#86BC25"
        strokeWidth={0.7}
        opacity={0.4}
      >
        <animate
          attributeName="r"
          values="14;26;14"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.4;0;0.4"
          dur="2.4s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  );
};

const QuantAnalysis: React.FC = () => {
  const [activeChart, setActiveChart] = useState(0);
  const [data, setData] = useState<
    Array<{ x: number; y: number; base: number; lower: number; upper: number }>
  >(() => CHARTS[0].generate(100));
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState({
    rSquared: 0,
    beta: 0,
    alpha: 0,
    var: 0,
  });
  const [animatedPointIdx, setAnimatedPointIdx] = useState(0);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointAnimRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const config = CHARTS[activeChart];

  useEffect(() => {
    if (progress === 100) {
      autoRotateRef.current = setInterval(() => {
        setActiveChart((prev) => {
          const next = (prev + 1) % CHARTS.length;
          setData(CHARTS[next].generate(100));
          setMetrics(CHARTS[next].metrics);
          return next;
        });
      }, 8000);
    }
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [progress]);

  const switchChart = useCallback(
    (idx: number) => {
      setActiveChart(idx);
      setData(CHARTS[idx].generate(100));
      if (progress === 100) {
        setMetrics(CHARTS[idx].metrics);
      }
    },
    [progress],
  );

  useEffect(() => {
    if (progress === 100) {
      pointAnimRef.current = setInterval(() => {
        setAnimatedPointIdx((prev) => (prev + 1) % 100);
      }, 150);
    }
    return () => {
      if (pointAnimRef.current) clearInterval(pointAnimRef.current);
    };
  }, [progress]);

  const runAnalysis = useCallback(() => {
    setIsRunning(true);
    setProgress(0);
    setMetrics({ rSquared: 0, beta: 0, alpha: 0, var: 0 });

    const interval = setInterval(() => {
      setMetrics({
        rSquared: Math.random() * 0.9,
        beta: Math.random() * 2,
        alpha: Math.random() * 0.1,
        var: Math.random() * 15,
      });

      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRunning(false);
          const cfg = CHARTS[activeChart];
          setMetrics(cfg.metrics);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  }, [activeChart]);

  const goToChart = (idx: number) => {
    if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    switchChart(idx);
    if (progress === 100) {
      autoRotateRef.current = setInterval(() => {
        setActiveChart((prev) => {
          const next = (prev + 1) % CHARTS.length;
          setData(CHARTS[next].generate(100));
          setMetrics(CHARTS[next].metrics);
          return next;
        });
      }, 8000);
    }
  };

  const MetricIcon = [TrendingUp, Activity, Sigma, AlertTriangle];
  const metricColors = [
    "text-emerald-500",
    "text-amber-500",
    "text-emerald-500",
    "text-red-500",
  ];
  const metricKeys = ["rSquared", "beta", "alpha", "var"] as const;

  return (
    <ScenarioLayout>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-mono p-6 transition-colors duration-300">
        <div className="mb-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Calculator className="w-8 h-8 text-[#86BC25]" />
              Quantitative Risk Analysis (CRA)
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2">
              Based on CRA Portfolio Segmentation & NGFS Climate Scenarios
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setData(CHARTS[activeChart].generate(100))}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Data
            </button>
            <button
              onClick={runAnalysis}
              disabled={isRunning || progress === 100}
              className="px-6 py-2.5 bg-[#86BC25] text-black font-bold rounded-lg hover:bg-[#e0a20f] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-[#86BC25]/20"
            >
              <Play className="w-4 h-4" />
              {isRunning
                ? `Running Simulation... ${progress}%`
                : progress === 100
                  ? "Calibration Complete"
                  : "Run NGFS Simulation"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() =>
              goToChart((activeChart - 1 + CHARTS.length) % CHARTS.length)
            }
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#86BC25] hover:text-[#86BC25] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {CHARTS.map((chart, i) => (
            <button
              key={chart.id}
              onClick={() => goToChart(i)}
              className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                i === activeChart
                  ? "bg-[#86BC25] text-black border-[#86BC25] shadow-lg shadow-[#86BC25]/20"
                  : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-[#86BC25]/50 hover:text-[#86BC25]"
              }`}
            >
              {i + 1}.{" "}
              {chart.id === "carbon-pd"
                ? "Carbon → PD"
                : chart.id === "energy-lgd"
                  ? "Energy → LGD"
                  : "Emissions → ECL"}
            </button>
          ))}
          <button
            onClick={() => goToChart((activeChart + 1) % CHARTS.length)}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#86BC25] hover:text-[#86BC25] transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {progress === 100 && (
            <div className="ml-2 flex items-center gap-2 text-xs text-slate-400">
              <div className="w-1.5 h-1.5 rounded-full bg-[#86BC25] animate-pulse" />
              Auto-cycling
            </div>
          )}
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8"
          key={`metrics-${activeChart}`}
        >
          {metricKeys.map((key, i) => {
            const Icon = MetricIcon[i];
            const val =
              key === "var"
                ? `${metrics[key].toFixed(1)}%`
                : metrics[key].toFixed(2);
            return (
              <div
                key={key}
                className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 rounded-xl relative overflow-hidden group hover:border-[#86BC25]/50 transition-all shadow-sm animate-[fadeSlideUp_0.4s_ease-out]"
                style={{
                  animationDelay: `${i * 80}ms`,
                  animationFillMode: "backwards",
                }}
              >
                <div className="absolute top-0 rit-0 p-3 opacity-[0.07]">
                  <Icon className="w-14 h-14" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-1 font-semibold tracking-wide">
                  {config.metricLabels[key]}
                </p>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {val}
                  </span>
                  <span
                    className={`${metricColors[i]} text-xs mb-1 font-semibold`}
                  >
                    {config.metricSubLabels[key]}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 rit-0 h-0.5 bg-linear-to-r from-transparent via-[#86BC25] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm relative overflow-hidden">
            {progress === 100 && (
              <div className="absolute top-4 rit-4 flex gap-1.5 z-10">
                {CHARTS.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === activeChart
                        ? "bg-[#86BC25] scale-125 shadow-lg shadow-[#86BC25]/50"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`}
                  />
                ))}
              </div>
            )}

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center justify-between">
              <span className="transition-all duration-300">
                {config.title}
              </span>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                  95% Confidence
                </span>
                <span className="flex items-center gap-1 text-[#86BC25]">
                  <div className="w-2 h-2 rounded-full bg-[#86BC25]" />
                  Regression Line
                </span>
                <span className="flex items-center gap-1 text-blue-500">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  Portfolio Assets
                </span>
              </div>
            </h3>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} key={`chart-${activeChart}`}>
                  <defs>
                    <linearGradient id="colorCi" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.15}
                      />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                    vertical={false}
                    className="dark:stroke-slate-800"
                  />
                  <XAxis
                    dataKey="x"
                    type="number"
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    label={{
                      value: config.xLabel,
                      position: "insideBottom",
                      offset: -5,
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    label={{
                      value: config.yLabel,
                      angle: -90,
                      position: "insideLeft",
                      fill: "#64748b",
                      fontSize: 12,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#2D2D2D",
                      borderColor: "#334155",
                      color: "#f8fafc",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    itemStyle={{ color: "#f8fafc" }}
                  />
                  {(isRunning || progress === 100) && (
                    <Area
                      type="monotone"
                      dataKey="upper"
                      stroke="none"
                      fill="url(#colorCi)"
                      animationDuration={1500}
                    />
                  )}
                  <Scatter
                    name="Portfolio Assets"
                    dataKey="y"
                    fill="#3b82f6"
                    opacity={0.5}
                    shape={(props) => {
                      const { cx, cy, index } = props as {
                        cx: number;
                        cy: number;
                        index: number;
                      };
                      return (
                        <AnimatedDot
                          cx={cx}
                          cy={cy}
                          active={
                            progress === 100 && index === animatedPointIdx
                          }
                        />
                      );
                    }}
                  />
                  {(isRunning || progress === 100) && (
                    <Line
                      type="monotone"
                      dataKey="base"
                      stroke="#86BC25"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 8,
                        fill: "#86BC25",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                      animationDuration={2000}
                      animationEasing="ease-out"
                      filter={progress === 100 ? "url(#glow)" : undefined}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {progress === 100 && (
              <div className="mt-3 h-0.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#86BC25] rounded-full"
                  style={{
                    width: `${((animatedPointIdx % 100) / 100) * 100}%`,
                    transition: "width 0.15s linear",
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Factor Importance (Sensitivity)
              </h3>
              <div className="space-y-4">
                {[
                  { name: "Carbon Price ($/tCO₂)", val: 85 },
                  { name: "Energy Cost Shock", val: 65 },
                  { name: "Emissions Intensity", val: 45 },
                  { name: "Physical Damage Index", val: 30 },
                ].map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-600 dark:text-slate-300 text-xs">
                        {item.name}
                      </span>
                      <span className="text-[#86BC25] font-bold text-xs">
                        {item.val}%
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#86BC25] rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width:
                            isRunning || progress === 100
                              ? `${item.val}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                Model Parameters (NGFS Phase 5)
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Confidence Level
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    99.9%
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Time Horizon
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    2025 – 2050
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Scenario Type
                  </span>
                  <span className="text-slate-900 dark:text-white font-semibold">
                    Disorderly Transition
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Active Regression
                  </span>
                  <span className="text-[#86BC25] font-bold">
                    {activeChart + 1} / {CHARTS.length}
                  </span>
                </div>
                <div className="flex justify-between pb-2">
                  <span className="text-slate-500 dark:text-slate-400">
                    Optimization
                  </span>
                  <span className="text-emerald-500 dark:text-emerald-400 font-semibold">
                    {progress === 100 ? "Converged" : "Pending"}
                  </span>
                </div>
              </div>
              <button className="w-full mt-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg hover:border-[#86BC25] hover:text-[#86BC25] transition-all flex items-center justify-center gap-2">
                <Download className="w-3 h-3" />
                Export Model Params
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ScenarioLayout>
  );
};

export default QuantAnalysis;
