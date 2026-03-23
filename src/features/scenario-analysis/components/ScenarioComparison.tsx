import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  alpha,
  Divider,
  Button,
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
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Cell,
} from "recharts";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  useScenarioStore,
  NGFS_SCENARIOS,
  type ScenarioRunResults,
  type ScenarioType,
  type HorizonType,
} from "@/store/scenarioStore";
import {
  formatScenarioCurrencyFull,
  formatDollarM,
  formatPercent,
} from "../utils";
import { useIndustry } from "@/hooks/useIndustry";
import { ArrowLeft, GitCompareArrows } from "lucide-react";

interface ScenarioComparisonProps {
  onBack: () => void;
}

const SCENARIO_COLORS: Record<string, string> = {
  orderly: "#10B981",
  disorderly: "#F59E0B",
  hothouse: "#EF4444",
  custom: "#6366F1",
};

export default function ScenarioComparison({
  onBack,
}: ScenarioComparisonProps) {
  const theme = useTheme();
  const { results, activeScenario } = useScenarioStore();
  const { isNonFinancial } = useIndustry();
  const isTelecom = results[0]?.telecomResults != null || isNonFinancial;
  const horizon: HorizonType = activeScenario?.horizon || "medium";

  /* ─── Group results by scenario type for the selected horizon ─── */
  const grouped = useMemo(() => {
    const map: Partial<Record<ScenarioType, ScenarioRunResults>> = {};
    results.forEach((r) => {
      if (r.horizon === horizon) {
        // Keep last run per type
        map[r.scenario] = r;
      }
    });
    return map;
  }, [results, horizon]);

  const scenarios = (
    ["orderly", "disorderly", "hothouse", "custom"] as ScenarioType[]
  ).filter((s) => grouped[s]);

  if (scenarios.length < 2) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Paper sx={{ p: 6, maxWidth: 600, mx: "auto" }}>
          <GitCompareArrows
            size={48}
            style={{ color: DELOITTE_COLORS.slate.DEFAULT, marginBottom: 16 }}
          />
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Multi-Scenario Comparison
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Run at least <strong>2 different scenario types</strong> for the
            same time horizon to unlock comparison mode. You currently have{" "}
            <strong>{scenarios.length}</strong> scenario(s) for the{" "}
            <strong>{horizon}</strong> horizon.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Tip: Go back and run Orderly, Disorderly, and Hot House scenarios to
            populate this view.
          </Typography>
          <Button variant="outlined" onClick={onBack}>
            Back to Results
          </Button>
        </Paper>
      </Box>
    );
  }

  /* ─── Build comparison data (banking vs telecom) ─── */
  const bankingData = scenarios.map((s) => {
    const r = grouped[s]!;
    return {
      scenario: NGFS_SCENARIOS[s].name.replace(/\s*\(.*?\)/, ""),
      shortName: s.charAt(0).toUpperCase() + s.slice(1),
      type: s,
      baselineECL: r.eclResults.baselineECL,
      stressedECL: r.eclResults.stressedECL,
      deltaECL: r.eclResults.deltaECL,
      var99_9: r.varResult.var99_9,
      capitalImpact: r.capitalImpactPercent,
      temperature: r.impliedTemperatureRise,
    };
  });

  const telecomData = scenarios.map((s) => {
    const r = grouped[s]!;
    const t = r.telecomResults;
    return {
      scenario: NGFS_SCENARIOS[s].name.replace(/\s*\(.*?\)/, ""),
      shortName: s.charAt(0).toUpperCase() + s.slice(1),
      type: s,
      baselineNPV: t?.baselineNPV ?? 0,
      stressedNPV: t?.stressedNPV ?? 0,
      deltaNPV: t?.deltaNPV ?? 0,
      deltaNPVPercent: t?.deltaNPVPercent ?? 0,
      ebitdaImpact: t?.ebitdaImpactPercent ?? 0,
      fcfErosion: t?.fcfErosionPercent ?? 0,
      assetImpairment: t?.assetImpairmentPercent ?? 0,
      totalClimateCosts: t?.totalClimateCosts ?? 0,
      transitionCosts: t?.totalTransitionCosts ?? 0,
      physicalCosts: t?.totalPhysicalCosts ?? 0,
    };
  });

  /* ─── Radar chart data ─── */
  const radarData = isTelecom
    ? [
        {
          metric: "NPV Decline",
          ...Object.fromEntries(
            telecomData.map((d) => [d.type, Math.abs(d.deltaNPVPercent)]),
          ),
        },
        {
          metric: "EBITDA Impact",
          ...Object.fromEntries(
            telecomData.map((d) => [d.type, Math.abs(d.ebitdaImpact)]),
          ),
        },
        {
          metric: "FCF Erosion",
          ...Object.fromEntries(
            telecomData.map((d) => [d.type, Math.abs(d.fcfErosion)]),
          ),
        },
        {
          metric: "Asset Impairment",
          ...Object.fromEntries(
            telecomData.map((d) => [d.type, d.assetImpairment]),
          ),
        },
        {
          metric: "Climate Costs ($B)",
          ...Object.fromEntries(
            telecomData.map((d) => [d.type, d.totalClimateCosts / 1000]),
          ),
        },
      ]
    : [
        {
          metric: "ECL Increase",
          ...Object.fromEntries(
            bankingData.map((d) => [
              d.type,
              (d.deltaECL / d.baselineECL) * 100,
            ]),
          ),
        },
        {
          metric: "VaR 99.9%",
          ...Object.fromEntries(
            bankingData.map((d) => [d.type, d.var99_9 / 1e9]),
          ),
        },
        {
          metric: "Capital Impact",
          ...Object.fromEntries(
            bankingData.map((d) => [d.type, d.capitalImpact]),
          ),
        },
        {
          metric: "Temperature (°C)",
          ...Object.fromEntries(
            bankingData.map((d) => [d.type, d.temperature]),
          ),
        },
      ];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 0.5 }}
          >
            <GitCompareArrows size={22} />
            <Typography variant="h5" fontWeight={700}>
              Multi-Scenario Comparison
            </Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Side-by-side comparison of {scenarios.length} scenario pathways —{" "}
            {horizon} horizon. Delta highlights show relative severity.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          onClick={onBack}
        >
          Back to Results
        </Button>
      </Box>

      {/* ─── KPI Comparison Cards ─── */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {scenarios.map((s) => {
          const r = grouped[s]!;
          const t = r.telecomResults;
          const color = SCENARIO_COLORS[s];
          return (
            <Grid size={{ xs: 12, md: 12 / scenarios.length }} key={s}>
              <Paper
                sx={{
                  p: 2.5,
                  borderTop: `4px solid ${color}`,
                  height: "100%",
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography fontSize={18}>
                      {NGFS_SCENARIOS[s].icon}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {NGFS_SCENARIOS[s].name.replace(/\s*\(.*?\)/, "")}
                    </Typography>
                  </Stack>
                  <Divider />
                  {isTelecom && t ? (
                    <>
                      <Metric
                        label="NPV Decline"
                        value={`${t.deltaNPVPercent.toFixed(1)}%`}
                        sub={`${formatDollarM(Math.abs(t.deltaNPV))} erosion`}
                        color={color}
                      />
                      <Metric
                        label="Stressed NPV"
                        value={formatDollarM(t.stressedNPV)}
                        sub={`Baseline: ${formatDollarM(t.baselineNPV)}`}
                        color={color}
                      />
                      <Metric
                        label="EBITDA Impact"
                        value={`${t.ebitdaImpactPercent.toFixed(1)}%`}
                        sub={`FCF erosion: ${t.fcfErosionPercent.toFixed(1)}%`}
                        color={color}
                      />
                      <Metric
                        label="Climate Costs"
                        value={formatDollarM(t.totalClimateCosts)}
                        sub={`Trans: ${formatDollarM(t.totalTransitionCosts)} | Phys: ${formatDollarM(t.totalPhysicalCosts)}`}
                        color={color}
                      />
                      <Metric
                        label="Asset Impairment"
                        value={`${t.assetImpairmentPercent.toFixed(1)}%`}
                        sub={formatDollarM(t.assetImpairment)}
                        color={color}
                      />
                    </>
                  ) : (
                    <>
                      <Metric
                        label="ΔECL"
                        value={formatScenarioCurrencyFull(
                          r.eclResults.deltaECL,
                        )}
                        sub={`+${((r.eclResults.deltaECL / r.eclResults.baselineECL) * 100).toFixed(1)}% increase`}
                        color={color}
                      />
                      <Metric
                        label="VaR (99.9%)"
                        value={formatScenarioCurrencyFull(r.varResult.var99_9)}
                        sub="Capital buffer requirement"
                        color={color}
                      />
                      <Metric
                        label="Capital Impact"
                        value={`-${formatPercent(r.capitalImpactPercent / 100)}`}
                        sub={`CET1: ${(14.5 - r.capitalImpactPercent).toFixed(2)}%`}
                        color={color}
                      />
                      <Metric
                        label="Temperature"
                        value={`${r.impliedTemperatureRise.toFixed(1)}°C`}
                        sub="Portfolio warming"
                        color={color}
                      />
                    </>
                  )}
                </Stack>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* ─── Bar Chart Comparison ─── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {isTelecom ? "NPV Impact by Scenario ($M)" : "ECL Impact by Scenario"}
        </Typography>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={
                isTelecom
                  ? telecomData.map((d) => ({
                      name: d.shortName,
                      type: d.type,
                      baseline: d.baselineNPV,
                      stressed: d.stressedNPV,
                    }))
                  : bankingData.map((d) => ({
                      name: d.shortName,
                      type: d.type,
                      baseline: d.baselineECL,
                      stressed: d.stressedECL,
                    }))
              }
              margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={alpha(theme.palette.text.secondary, 0.1)}
              />
              <XAxis
                dataKey="name"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) =>
                  isTelecom ? formatDollarM(v) : formatScenarioCurrencyFull(v)
                }
              />
              <RechartsTooltip
                formatter={(v: number | undefined) =>
                  v !== undefined
                    ? isTelecom
                      ? formatDollarM(v)
                      : formatScenarioCurrencyFull(v)
                    : ""
                }
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                }}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
              <Bar
                dataKey="baseline"
                name={isTelecom ? "Baseline NPV" : "Baseline ECL"}
                radius={[4, 4, 0, 0]}
                barSize={32}
              >
                {(isTelecom ? telecomData : bankingData).map((d) => (
                  <Cell
                    key={d.type}
                    fill={alpha(SCENARIO_COLORS[d.type], 0.35)}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="stressed"
                name={isTelecom ? "Stressed NPV" : "Stressed ECL"}
                radius={[4, 4, 0, 0]}
                barSize={32}
              >
                {(isTelecom ? telecomData : bankingData).map((d) => (
                  <Cell key={d.type} fill={SCENARIO_COLORS[d.type]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* ─── Radar Chart (Risk Profile) ─── */}
      <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Risk Profile Overlay
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Multi-dimensional comparison of climate risk impacts across scenarios.
        </Typography>
        <Box sx={{ height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="72%">
              <PolarGrid stroke={alpha(theme.palette.text.secondary, 0.15)} />
              <PolarAngleAxis
                dataKey="metric"
                fontSize={11}
                tick={{ fill: theme.palette.text.secondary }}
              />
              <PolarRadiusAxis fontSize={10} />
              {scenarios.map((s) => (
                <Radar
                  key={s}
                  name={NGFS_SCENARIOS[s].name.replace(/\s*\(.*?\)/, "")}
                  dataKey={s}
                  stroke={SCENARIO_COLORS[s]}
                  fill={SCENARIO_COLORS[s]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12 }}
              />
              <RechartsTooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* ─── Telecom: Cost Breakdown Comparison ─── */}
      {isTelecom && (
        <Paper variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Climate Cost Breakdown by Scenario
          </Typography>
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={telecomData.map((d) => ({
                  name: d.shortName,
                  type: d.type,
                  transition: d.transitionCosts,
                  physical: d.physicalCosts,
                }))}
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={alpha(theme.palette.text.secondary, 0.1)}
                />
                <XAxis
                  dataKey="name"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => formatDollarM(v)}
                />
                <RechartsTooltip
                  formatter={(v: number | undefined) =>
                    v !== undefined ? [formatDollarM(v)] : []
                  }
                  contentStyle={{
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                  }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar
                  dataKey="transition"
                  name="Transition Costs"
                  stackId="costs"
                  fill="#F59E0B"
                  radius={[0, 0, 0, 0]}
                  barSize={40}
                />
                <Bar
                  dataKey="physical"
                  name="Physical Costs"
                  stackId="costs"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Paper>
      )}

      {/* ─── Scenario Summary Table ─── */}
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Scenario Summary Matrix
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Box
            component="table"
            sx={{
              width: "100%",
              borderCollapse: "collapse",
              "& th, & td": {
                px: 2,
                py: 1.5,
                textAlign: "left",
                borderBottom: `1px solid ${theme.palette.divider}`,
                fontSize: 13,
              },
              "& th": {
                fontWeight: 700,
                bgcolor:
                  theme.palette.mode === "dark"
                    ? alpha(DELOITTE_COLORS.slate.DEFAULT, 0.15)
                    : "#F8FAFC",
                color: "text.secondary",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              },
            }}
          >
            <thead>
              <tr>
                <th>Metric</th>
                {scenarios.map((s) => (
                  <th key={s}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: SCENARIO_COLORS[s],
                        }}
                      />
                      <span>
                        {NGFS_SCENARIOS[s].name.replace(/\s*\(.*?\)/, "")}
                      </span>
                    </Stack>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isTelecom
                ? [
                    {
                      label: "NPV Decline",
                      values: telecomData.map(
                        (d) => `${d.deltaNPVPercent.toFixed(1)}%`,
                      ),
                    },
                    {
                      label: "Stressed NPV",
                      values: telecomData.map((d) =>
                        formatDollarM(d.stressedNPV),
                      ),
                    },
                    {
                      label: "EBITDA Impact",
                      values: telecomData.map(
                        (d) => `${d.ebitdaImpact.toFixed(1)}%`,
                      ),
                    },
                    {
                      label: "FCF Erosion",
                      values: telecomData.map(
                        (d) => `${d.fcfErosion.toFixed(1)}%`,
                      ),
                    },
                    {
                      label: "Asset Impairment",
                      values: telecomData.map(
                        (d) => `${d.assetImpairment.toFixed(1)}%`,
                      ),
                    },
                    {
                      label: "Total Climate Costs",
                      values: telecomData.map((d) =>
                        formatDollarM(d.totalClimateCosts),
                      ),
                    },
                    {
                      label: "Transition Costs",
                      values: telecomData.map((d) =>
                        formatDollarM(d.transitionCosts),
                      ),
                    },
                    {
                      label: "Physical Costs",
                      values: telecomData.map((d) =>
                        formatDollarM(d.physicalCosts),
                      ),
                    },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{row.label}</td>
                      {row.values.map((v, j) => (
                        <td key={j}>{v}</td>
                      ))}
                    </tr>
                  ))
                : [
                    {
                      label: "ΔECL",
                      values: bankingData.map((d) =>
                        formatScenarioCurrencyFull(d.deltaECL),
                      ),
                    },
                    {
                      label: "Stressed ECL",
                      values: bankingData.map((d) =>
                        formatScenarioCurrencyFull(d.stressedECL),
                      ),
                    },
                    {
                      label: "VaR (99.9%)",
                      values: bankingData.map((d) =>
                        formatScenarioCurrencyFull(d.var99_9),
                      ),
                    },
                    {
                      label: "Capital Impact",
                      values: bankingData.map(
                        (d) => `-${formatPercent(d.capitalImpact / 100)}`,
                      ),
                    },
                    {
                      label: "Post-Stress CET1",
                      values: bankingData.map(
                        (d) => `${(14.5 - d.capitalImpact).toFixed(2)}%`,
                      ),
                    },
                    {
                      label: "Temperature",
                      values: bankingData.map(
                        (d) => `${d.temperature.toFixed(1)}°C`,
                      ),
                    },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{row.label}</td>
                      {row.values.map((v, j) => (
                        <td key={j}>{v}</td>
                      ))}
                    </tr>
                  ))}
            </tbody>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

/* ─── Reusable Metric row ─── */
function Metric({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ color, lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {sub}
      </Typography>
    </Box>
  );
}
