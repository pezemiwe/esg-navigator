import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  alpha,
  useTheme,
  Button,
  Chip,
  Stack,
} from "@mui/material";
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
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
  runScenarioSimulation,
  formatNaira,
} from "../data/constants";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

const SCENARIOS = [
  {
    id: "carbon_tax",
    name: "Carbon Tax Introduction",
    description:
      "Federal carbon pricing at $50/tCO₂e applied to all direct and financed emissions. Models the impact of planned climate tax policies on Nigerian commercial banks.",
    icon: Scale,
    color: "#ef4444",
    details: [
      "$50 per tCO₂e tax rate",
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
    details: [
      "0.5% additional capital requirement",
      "Non-compliance penalty",
      "IFRS S1/S2 alignment required",
      "Regulatory reporting burden",
    ],
  },
];

export default function SustainabilityScenario() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const {
    scope1Assets,
    scope2Entries,
    scope3Entries,
    entityProfile,
    scenarioResults,
    addScenarioResult,
  } = useSustainabilityStore();

  const [runningScenario, setRunningScenario] = useState<string | null>(null);

  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);

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
        entityProfile.loanBook,
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
    return [
      {
        metric: "Cost Impact",
        ...Object.fromEntries(
          latestResults.map((r) => [
            r.name.split(" ")[0],
            Math.min(r.estimatedCost / 1e9, 100),
          ]),
        ),
      },
      {
        metric: "NPL Increase",
        ...Object.fromEntries(
          latestResults.map((r) => [r.name.split(" ")[0], r.nplIncrease * 10]),
        ),
      },
      {
        metric: "Capital Effect",
        ...Object.fromEntries(
          latestResults.map((r) => [
            r.name.split(" ")[0],
            Math.abs(r.capitalAdequacyEffect) * 20,
          ]),
        ),
      },
      {
        metric: "Profit Impact",
        ...Object.fromEntries(
          latestResults.map((r) => [
            r.name.split(" ")[0],
            Math.abs(r.profitImpact) * 100,
          ]),
        ),
      },
      {
        metric: "Emission Risk",
        ...Object.fromEntries(
          latestResults.map((r) => [
            r.name.split(" ")[0],
            Math.min(r.totalEmissions / 10000, 100),
          ]),
        ),
      },
    ];
  }, [latestResults]);

  const isRun = (scenarioId: string) => {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    return scenarioResults.some((r) => r.name === scenario?.name);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          sx={{
            color: BRAND,
            fontWeight: 700,
            letterSpacing: "0.15em",
            fontSize: "0.7rem",
          }}
        >
          SCENARIO ANALYSIS
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
          Climate Scenario Stress Testing
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 0.5, maxWidth: 700 }}
        >
          Model financial impacts under IFRS S2 scenario analysis requirements —
          transition risks, physical risks, and regulatory scenarios
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const alreadyRun = isRun(scenario.id);
          const isRunning = runningScenario === scenario.id;
          return (
            <Grid size={{ xs: 12, md: 6 }} key={scenario.id}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  bgcolor: cardBg,
                  border: `1px solid ${alreadyRun ? alpha(scenario.color, 0.3) : borderColor}`,
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: scenario.color,
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 2,
                    mb: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      bgcolor: alpha(scenario.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={24} color={scenario.color} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {scenario.name}
                      </Typography>
                      {alreadyRun && <CheckCircle2 size={16} color="#10b981" />}
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", lineHeight: 1.5 }}
                    >
                      {scenario.description}
                    </Typography>
                  </Box>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mb: 2, flexWrap: "wrap", gap: 0.5 }}
                >
                  {scenario.details.map((d) => (
                    <Chip
                      key={d}
                      label={d}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: "0.65rem",
                        bgcolor: alpha(scenario.color, 0.06),
                        color: isDark ? "#fff" : "text.primary",
                      }}
                    />
                  ))}
                </Stack>

                <Button
                  variant={alreadyRun ? "outlined" : "contained"}
                  startIcon={
                    isRunning ? (
                      <Activity size={16} className="animate-spin" />
                    ) : (
                      <Play size={16} />
                    )
                  }
                  onClick={() => handleRunScenario(scenario.id)}
                  disabled={isRunning}
                  fullWidth
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: alreadyRun ? "transparent" : scenario.color,
                    borderColor: scenario.color,
                    color: alreadyRun ? scenario.color : "#fff",
                    "&:hover": {
                      bgcolor: alreadyRun
                        ? alpha(scenario.color, 0.08)
                        : alpha(scenario.color, 0.85),
                    },
                  }}
                >
                  {isRunning
                    ? "Running Simulation..."
                    : alreadyRun
                      ? "Re-Run Scenario"
                      : "Run Scenario"}
                </Button>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {latestResults.length > 0 && (
        <>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
            Scenario Results
          </Typography>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            {latestResults.map((result) => {
              const scenario = SCENARIOS.find((s) => s.name === result.name);
              const color = scenario?.color || BRAND;
              return (
                <Grid size={{ xs: 12, md: 6 }} key={result.id}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      bgcolor: cardBg,
                      border: `1px solid ${alpha(color, 0.2)}`,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color, mb: 2 }}
                    >
                      {result.name}
                    </Typography>
                    <Grid container spacing={2}>
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
                          <Grid size={6} key={metric.label}>
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: alpha(color, 0.04),
                                border: `1px solid ${alpha(color, 0.08)}`,
                              }}
                            >
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mb: 0.5,
                                }}
                              >
                                <MIcon size={12} color={color} />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "text.secondary",
                                    fontWeight: 600,
                                    fontSize: "0.6rem",
                                  }}
                                >
                                  {metric.label}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 800 }}
                              >
                                {metric.value}
                              </Typography>
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        display: "block",
                        mt: 1.5,
                        textAlign: "right",
                      }}
                    >
                      Run: {new Date(result.runAt).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          {latestResults.length >= 2 && (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: cardBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
                    Scenario Cost Comparison
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={comparisonData}
                        margin={{ left: 20, bottom: 30 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={alpha("#000", 0.06)}
                        />
                        <XAxis
                          dataKey="name"
                          fontSize={10}
                          angle={-15}
                          textAnchor="end"
                        />
                        <YAxis
                          fontSize={10}
                          tickFormatter={(v: number) => formatNaira(v)}
                        />
                        <Tooltip
                          formatter={(v: number | undefined) =>
                            v !== undefined ? formatNaira(v) : ""
                          }
                        />
                        <Bar
                          dataKey="cost"
                          name="Estimated Cost"
                          fill="#ef4444"
                          radius={[4, 4, 0, 0]}
                          barSize={40}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    bgcolor: cardBg,
                    border: `1px solid ${borderColor}`,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 2 }}
                  >
                    Impact Radar
                  </Typography>
                  <Box sx={{ height: 300 }}>
                    <ResponsiveContainer>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke={alpha("#000", 0.08)} />
                        <PolarAngleAxis dataKey="metric" fontSize={10} />
                        <PolarRadiusAxis fontSize={9} />
                        {latestResults.map((r, i) => {
                          const colors = [
                            "#ef4444",
                            "#f59e0b",
                            "#3b82f6",
                            "#8b5cf6",
                          ];
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
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
}
