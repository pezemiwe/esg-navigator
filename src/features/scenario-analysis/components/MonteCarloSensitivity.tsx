import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Grid,
  alpha,
  Chip,
  Slider,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
  Area,
} from "recharts";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useScenarioStore } from "@/store/scenarioStore";
import { formatScenarioCurrencyFull, formatDollarM } from "../utils";
import { useIndustry } from "@/hooks/useIndustry";
import { Activity, PlayCircle, RotateCcw, TrendingDown } from "lucide-react";

/* ─── Types ─── */
interface ParameterSweep {
  name: string;
  key: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  baseValue: number;
}

interface SensitivityResult {
  parameter: string;
  lowValue: number;
  baseValue: number;
  highValue: number;
  lowOutput: number;
  baseOutput: number;
  highOutput: number;
  range: number;
}
/* ─── Constants ─── */
const BANKING_PARAMS: ParameterSweep[] = [
  {
    name: "Carbon Price",
    key: "carbonPrice",
    min: 0,
    max: 400,
    step: 10,
    unit: "$/tCO₂",
    baseValue: 150,
  },
  {
    name: "GDP Shock",
    key: "gdpShock",
    min: -6,
    max: 0,
    step: 0.25,
    unit: "%",
    baseValue: -1.0,
  },
  {
    name: "Physical Damage",
    key: "physicalDamage",
    min: 0,
    max: 0.5,
    step: 0.01,
    unit: "index",
    baseValue: 0.1,
  },
  {
    name: "Interest Rate",
    key: "interestRate",
    min: -1,
    max: 5,
    step: 0.25,
    unit: "%",
    baseValue: 0.5,
  },
  {
    name: "Inflation",
    key: "inflation",
    min: -1,
    max: 5,
    step: 0.25,
    unit: "%",
    baseValue: 0.5,
  },
];

const TELECOM_PARAMS: ParameterSweep[] = [
  {
    name: "Carbon Price",
    key: "carbonPrice",
    min: 0,
    max: 400,
    step: 10,
    unit: "$/tCO₂",
    baseValue: 150,
  },
  {
    name: "WACC Premium",
    key: "waccPremium",
    min: 0,
    max: 5,
    step: 0.25,
    unit: "%",
    baseValue: 1.2,
  },
  {
    name: "Physical Damage",
    key: "physicalDamage",
    min: 0,
    max: 0.5,
    step: 0.01,
    unit: "index",
    baseValue: 0.1,
  },
  {
    name: "Revenue Growth",
    key: "revenueGrowth",
    min: -3,
    max: 5,
    step: 0.5,
    unit: "%",
    baseValue: 2.0,
  },
  {
    name: "Energy Cost Shock",
    key: "energyCost",
    min: 0,
    max: 100,
    step: 5,
    unit: "%",
    baseValue: 25,
  },
  {
    name: "Capex Multiplier",
    key: "capexMultiplier",
    min: 0.8,
    max: 2.0,
    step: 0.1,
    unit: "x",
    baseValue: 1.0,
  },
];

function computeBankingOutput(
  baseECL: number,
  carbonPrice: number,
  gdpShock: number,
  physicalDamage: number,
  interestRate: number,
  inflation: number,
): number {
  const carbonEffect = 1 + carbonPrice * 0.0008;
  const gdpEffect = 1 + Math.abs(gdpShock) * 0.15;
  const physEffect = 1 + physicalDamage * 2.5;
  const rateEffect = 1 + interestRate * 0.04;
  const inflEffect = 1 + inflation * 0.02;
  return (
    baseECL * carbonEffect * gdpEffect * physEffect * rateEffect * inflEffect
  );
}

function computeTelecomOutput(
  baseNPV: number,
  carbonPrice: number,
  waccPremium: number,
  physicalDamage: number,
  revenueGrowth: number,
  energyCost: number,
  capexMultiplier: number,
): number {
  const carbonDrag = carbonPrice * 3.5; // $M cost
  const waccDrag = baseNPV * (waccPremium / 100) * 1.8; // Higher WACC → lower NPV
  const physDrag = baseNPV * physicalDamage * 0.5;
  const revenueBoost = baseNPV * (revenueGrowth / 100) * 0.3;
  const energyDrag = energyCost * 12; // $M
  const capexDrag = (capexMultiplier - 1) * baseNPV * 0.08;
  return (
    baseNPV -
    carbonDrag -
    waccDrag -
    physDrag +
    revenueBoost -
    energyDrag -
    capexDrag
  );
}

/* ─── Box-Muller normal random ─── */
function randNormal(mean: number, std: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return mean + z * std;
}

/* ─── Component ─── */
export default function MonteCarloSensitivity() {
  const theme = useTheme();
  const { activeScenario, results, selectedSectorId } = useScenarioStore();
  const { isNonFinancial } = useIndustry();
  const isTelecom = selectedSectorId === "telecommunications" || isNonFinancial;

  const [trials, setTrials] = useState(5000);
  const [running, setRunning] = useState(false);
  const [sweepResults, setSweepResults] = useState<SensitivityResult[]>([]);
  const [distribution, setDistribution] = useState<
    { bin: string; count: number; cumulative: number }[]
  >([]);
  const [stats, setStats] = useState<{
    mean: number;
    p5: number;
    p50: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
    std: number;
  } | null>(null);

  const params = isTelecom ? TELECOM_PARAMS : BANKING_PARAMS;

  const baselineInput = useMemo(() => {
    if (!activeScenario) return 0;
    const r = results.find(
      (r) =>
        r.scenario === activeScenario.type &&
        r.horizon === activeScenario.horizon,
    );
    if (isTelecom && r?.telecomResults) return r.telecomResults.baselineNPV;
    return r?.eclResults.baselineECL ?? 0;
  }, [activeScenario, results, isTelecom]);

  /* ─── Run the sensitivity + Monte Carlo ─── */
  const runAnalysis = useCallback(async () => {
    setRunning(true);
    // Give UI time to render spinner
    await new Promise((r) => setTimeout(r, 100));

    const scenario = activeScenario;
    if (!scenario) {
      setRunning(false);
      return;
    }

    /* 1. Deterministic Tornado Sweep */
    const baseParams = {
      carbonPrice: scenario.carbonPrice,
      gdpShock: scenario.gdpShock,
      physicalDamage: scenario.physicalDamageIndex,
      interestRate: scenario.interestRateShock,
      inflation: scenario.inflationShock,
      waccPremium: 1.2,
      revenueGrowth: 2.0,
      energyCost: 25,
      capexMultiplier: 1.0,
    };

    const baseVal = isTelecom
      ? computeTelecomOutput(
          baselineInput,
          baseParams.carbonPrice,
          baseParams.waccPremium,
          baseParams.physicalDamage,
          baseParams.revenueGrowth,
          baseParams.energyCost,
          baseParams.capexMultiplier,
        )
      : computeBankingOutput(
          baselineInput,
          baseParams.carbonPrice,
          baseParams.gdpShock,
          baseParams.physicalDamage,
          baseParams.interestRate,
          baseParams.inflation,
        );

    const sweeps: SensitivityResult[] = params.map((p) => {
      const low = p.min + (p.baseValue - p.min) * 0.3;
      const high = p.max - (p.max - p.baseValue) * 0.3;

      const makeParams = (override: number) => {
        const pp = { ...baseParams, [p.key]: override };
        return isTelecom
          ? computeTelecomOutput(
              baselineInput,
              pp.carbonPrice,
              pp.waccPremium,
              pp.physicalDamage,
              pp.revenueGrowth,
              pp.energyCost,
              pp.capexMultiplier,
            )
          : computeBankingOutput(
              baselineInput,
              pp.carbonPrice,
              pp.gdpShock,
              pp.physicalDamage,
              pp.interestRate,
              pp.inflation,
            );
      };

      const lowOut = makeParams(low);
      const highOut = makeParams(high);

      return {
        parameter: p.name,
        lowValue: low,
        baseValue: p.baseValue,
        highValue: high,
        lowOutput: lowOut,
        baseOutput: baseVal,
        highOutput: highOut,
        range: Math.abs(highOut - lowOut),
      };
    });

    sweeps.sort((a, b) => b.range - a.range);
    setSweepResults(sweeps);

    /* 2. Monte Carlo Simulation */
    const outputs: number[] = [];

    for (let i = 0; i < trials; i++) {
      const cp = randNormal(
        baseParams.carbonPrice,
        baseParams.carbonPrice * 0.3,
      );
      const gdp = randNormal(
        baseParams.gdpShock,
        Math.abs(baseParams.gdpShock) * 0.5 || 0.5,
      );
      const pd = Math.max(
        0,
        randNormal(
          baseParams.physicalDamage,
          baseParams.physicalDamage * 0.5 || 0.05,
        ),
      );
      const ir = randNormal(
        baseParams.interestRate,
        Math.abs(baseParams.interestRate) * 0.4 || 0.3,
      );

      let out: number;
      if (isTelecom) {
        const wacc = randNormal(baseParams.waccPremium, 0.5);
        const rev = randNormal(baseParams.revenueGrowth, 1.0);
        const energy = Math.max(0, randNormal(baseParams.energyCost, 10));
        const capex = Math.max(
          0.5,
          randNormal(baseParams.capexMultiplier, 0.15),
        );
        out = computeTelecomOutput(
          baselineInput,
          cp,
          wacc,
          pd,
          rev,
          energy,
          capex,
        );
      } else {
        const inf = randNormal(
          baseParams.inflation,
          Math.abs(baseParams.inflation) * 0.4 || 0.3,
        );
        out = computeBankingOutput(baselineInput, cp, gdp, pd, ir, inf);
      }

      outputs.push(out);
    }

    // Statistics
    outputs.sort((a, b) => a - b);
    const mean = outputs.reduce((s, v) => s + v, 0) / outputs.length;
    const variance =
      outputs.reduce((s, v) => s + (v - mean) ** 2, 0) / outputs.length;
    const std = Math.sqrt(variance);

    setStats({
      mean,
      p5: outputs[Math.floor(outputs.length * 0.05)],
      p50: outputs[Math.floor(outputs.length * 0.5)],
      p95: outputs[Math.floor(outputs.length * 0.95)],
      p99: outputs[Math.floor(outputs.length * 0.99)],
      min: outputs[0],
      max: outputs[outputs.length - 1],
      std,
    });

    // Distribution histogram
    const bins = 40;
    const minVal = outputs[0];
    const maxVal = outputs[outputs.length - 1];
    const binW = (maxVal - minVal) / bins;
    const hist: number[] = new Array(bins).fill(0);
    outputs.forEach((v) => {
      const idx = Math.min(Math.floor((v - minVal) / binW), bins - 1);
      hist[idx]++;
    });

    let cumul = 0;
    const distData = hist.map((count, i) => {
      cumul += count;
      return {
        bin: isTelecom
          ? formatDollarM(minVal + i * binW)
          : formatScenarioCurrencyFull(minVal + i * binW),
        count,
        cumulative: (cumul / outputs.length) * 100,
      };
    });
    setDistribution(distData);

    setRunning(false);
  }, [activeScenario, baselineInput, isTelecom, params, trials]);

  const fmtOut = (v: number) =>
    isTelecom ? formatDollarM(v) : formatScenarioCurrencyFull(v);

  return (
    <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        <Activity size={20} />
        <Typography variant="h6" fontWeight={700}>
          Monte Carlo Sensitivity Analysis
        </Typography>
        <Chip
          label="Advanced"
          size="small"
          color="primary"
          variant="outlined"
        />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Run {trials.toLocaleString()} randomized simulations varying key
        parameters to identify which variables drive the most impact and map the
        full distribution of outcomes.
      </Typography>

      {/* Controls */}
      <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <Box sx={{ width: 200 }}>
          <Typography variant="caption" color="text.secondary">
            Simulations
          </Typography>
          <Slider
            value={trials}
            onChange={(_, v) => setTrials(v as number)}
            min={1000}
            max={20000}
            step={1000}
            valueLabelDisplay="auto"
            size="small"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={
            running ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <PlayCircle size={16} />
            )
          }
          onClick={runAnalysis}
          disabled={running || !activeScenario}
          sx={{
            bgcolor: DELOITTE_COLORS.primary.lit,
            "&:hover": { bgcolor: DELOITTE_COLORS.primary.dark },
          }}
        >
          {running ? "Running…" : "Run Simulation"}
        </Button>
        {sweepResults.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<RotateCcw size={14} />}
            size="small"
            onClick={() => {
              setSweepResults([]);
              setDistribution([]);
              setStats(null);
            }}
          >
            Reset
          </Button>
        )}
      </Stack>

      {running && <LinearProgress sx={{ mb: 3 }} />}

      {/* Results */}
      {sweepResults.length > 0 && stats && (
        <>
          {/* ─── Stats Cards ─── */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {[
              {
                label: "Mean",
                value: fmtOut(stats.mean),
                color: DELOITTE_COLORS.primary.lit,
              },
              {
                label: "5th %ile (Best)",
                value: fmtOut(isTelecom ? stats.p95 : stats.p5),
                color: "#10B981",
              },
              { label: "Median", value: fmtOut(stats.p50), color: "#3B82F6" },
              {
                label: "95th %ile (Worst)",
                value: fmtOut(isTelecom ? stats.p5 : stats.p95),
                color: "#F59E0B",
              },
              {
                label: "99th %ile (Tail)",
                value: fmtOut(isTelecom ? stats.min : stats.p99),
                color: "#EF4444",
              },
              {
                label: "Std Dev",
                value: fmtOut(stats.std),
                color: DELOITTE_COLORS.slate.DEFAULT,
              },
            ].map((s, i) => (
              <Grid size={{ xs: 6, md: 2 }} key={i}>
                <Paper
                  sx={{
                    p: 2,
                    borderLeft: `3px solid ${s.color}`,
                    bgcolor:
                      theme.palette.mode === "dark"
                        ? alpha(s.color, 0.08)
                        : alpha(s.color, 0.04),
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    {s.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: s.color }}
                  >
                    {s.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* ─── Tornado Chart ─── */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              <TrendingDown
                size={16}
                style={{ marginRight: 6, verticalAlign: "middle" }}
              />
              Parameter Sensitivity Tornado
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Width of each bar shows the impact range when that parameter is
              varied. Wider bars = higher sensitivity.
            </Typography>
            <Box sx={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sweepResults.map((s) => ({
                    parameter: s.parameter,
                    lowDelta: s.lowOutput - s.baseOutput,
                    highDelta: s.highOutput - s.baseOutput,
                    range: s.range,
                  }))}
                  layout="vertical"
                  margin={{ top: 10, right: 60, left: 140, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke={alpha(theme.palette.text.secondary, 0.1)}
                  />
                  <XAxis
                    type="number"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => fmtOut(v)}
                  />
                  <YAxis
                    type="category"
                    dataKey="parameter"
                    fontSize={12}
                    width={130}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    formatter={(
                      v: number | undefined,
                      name: string | undefined,
                    ) => [
                      fmtOut(v ?? 0),
                      name === "lowDelta" ? "Low Scenario" : "High Scenario",
                    ]}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                    }}
                  />
                  <ReferenceLine
                    x={0}
                    stroke={theme.palette.text.disabled}
                    strokeWidth={2}
                  />
                  <Bar
                    dataKey="lowDelta"
                    fill="#10B981"
                    barSize={20}
                    radius={[4, 0, 0, 4]}
                  >
                    {sweepResults.map((_, i) => (
                      <Cell key={i} fill="#10B981" opacity={0.75} />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="highDelta"
                    fill="#EF4444"
                    barSize={20}
                    radius={[0, 4, 4, 0]}
                  >
                    {sweepResults.map((_, i) => (
                      <Cell key={i} fill="#EF4444" opacity={0.75} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* ─── Distribution Histogram ─── */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Output Distribution ({trials.toLocaleString()} trials)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Frequency distribution of simulated {isTelecom ? "NPV" : "ECL"}{" "}
              outcomes with cumulative probability overlay.
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distribution}
                  margin={{ top: 10, right: 50, left: 10, bottom: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke={alpha(theme.palette.text.secondary, 0.1)}
                  />
                  <XAxis
                    dataKey="bin"
                    fontSize={9}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    tickLine={false}
                    axisLine={false}
                    interval={Math.floor(distribution.length / 8)}
                  />
                  <YAxis
                    yAxisId="freq"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: "Frequency",
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        fill: theme.palette.text.secondary,
                        fontSize: 11,
                      },
                    }}
                  />
                  <YAxis
                    yAxisId="cum"
                    orientation="right"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    tickFormatter={(v: number) => `${v}%`}
                    label={{
                      value: "Cumulative %",
                      angle: 90,
                      position: "insideRight",
                      style: {
                        fill: theme.palette.text.secondary,
                        fontSize: 11,
                      },
                    }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                    }}
                  />
                  <Bar
                    yAxisId="freq"
                    dataKey="count"
                    fill={alpha(DELOITTE_COLORS.primary.lit, 0.65)}
                    radius={[2, 2, 0, 0]}
                  />
                  <Area
                    yAxisId="cum"
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#EF4444"
                    fill="none"
                    strokeWidth={2}
                    dot={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>

          {/* ─── Key Insights ─── */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              bgcolor: alpha(DELOITTE_COLORS.primary.lit, 0.06),
              borderRadius: 2,
              border: `1px solid ${alpha(DELOITTE_COLORS.primary.lit, 0.2)}`,
            }}
          >
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Key Insights
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2" color="text.secondary">
                <strong>Top risk driver:</strong> {sweepResults[0]?.parameter} —
                accounts for the widest impact range of{" "}
                {fmtOut(sweepResults[0]?.range ?? 0)}.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>95% confidence interval:</strong> {fmtOut(stats.p5)} to{" "}
                {fmtOut(stats.p95)}.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Tail risk (99th %ile):</strong>{" "}
                {fmtOut(isTelecom ? stats.min : stats.p99)} — represents extreme
                adverse scenario.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Assessment:</strong>{" "}
                {isTelecom
                  ? `Under ${trials.toLocaleString()} simulations, expected NPV is ${fmtOut(stats.mean)} with ${((stats.std / Math.abs(stats.mean)) * 100).toFixed(1)}% coefficient of variation.`
                  : `Under ${trials.toLocaleString()} simulations, expected stressed ECL is ${fmtOut(stats.mean)} with ${((stats.std / Math.abs(stats.mean)) * 100).toFixed(1)}% coefficient of variation.`}
              </Typography>
            </Stack>
          </Paper>
        </>
      )}
    </Paper>
  );
}
