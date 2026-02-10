import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  alpha,
  useTheme,
  Stack,
  LinearProgress,
  Divider,
} from "@mui/material";
import { Factory, Truck, Zap, TreePine, Building2 } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DELOITTE_COLORS } from "@/config/colors.config";

const BRAND_GREEN = DELOITTE_COLORS.green.DEFAULT;

const NDC_SECTORS = [
  {
    sector: "Energy",
    icon: Zap,
    color: "#F59E0B",
    baselineEmissions: 21.4,
    targetReduction: 15,
    currentReduction: 10.8,
    deloitteFinancing: 1200,
    projects: 24,
    keyActions: [
      "Solar PV project financing — 45MW installed capacity",
      "Energy efficiency loans for commercial buildings",
      "LPG adoption financing for 8,000 households",
    ],
  },
  {
    sector: "AFOLU (Agriculture, Forestry & Land Use)",
    icon: TreePine,
    color: "#22C55E",
    baselineEmissions: 18.7,
    targetReduction: 12,
    currentReduction: 6.9,
    deloitteFinancing: 450,
    projects: 18,
    keyActions: [
      "REDD+ forest restoration — 4,200 ha restored",
      "Climate-smart agriculture loans in savanna regions",
      "Cocoa agroforestry financing program",
    ],
  },
  {
    sector: "Transport",
    icon: Truck,
    color: "#3B82F6",
    baselineEmissions: 12.3,
    targetReduction: 10,
    currentReduction: 4.1,
    deloitteFinancing: 680,
    projects: 9,
    keyActions: [
      "Electric vehicle fleet financing for commercial operators",
      "Mass transit infrastructure co-financing (Lagos BRT)",
      "Non-motorized transport corridor development",
    ],
  },
  {
    sector: "Waste Management",
    icon: Factory,
    color: "#8B5CF6",
    baselineEmissions: 5.8,
    targetReduction: 20,
    currentReduction: 13.0,
    deloitteFinancing: 190,
    projects: 7,
    keyActions: [
      "Landfill gas capture project financing",
      "Plastic recycling enterprise loans",
      "Biogas digester financing for institutions",
    ],
  },
  {
    sector: "Industry",
    icon: Building2,
    color: "#EF4444",
    baselineEmissions: 8.2,
    targetReduction: 8,
    currentReduction: 4.2,
    deloitteFinancing: 320,
    projects: 12,
    keyActions: [
      "Clean production technology upgrade financing",
      "Industrial energy efficiency retrofit loans",
      "Green manufacturing certification support",
    ],
  },
];

const EMISSION_TREND = [
  { year: "2020", actual: 73.0, target: 73.0 },
  { year: "2021", actual: 71.5, target: 71.0 },
  { year: "2022", actual: 69.8, target: 68.5 },
  { year: "2023", actual: 67.2, target: 66.0 },
  { year: "2024", actual: 64.8, target: 63.5 },
  { year: "2025", actual: 63.0, target: 61.0 },
  { year: "2026", actual: null, target: 58.5 },
  { year: "2027", actual: null, target: 56.0 },
  { year: "2028", actual: null, target: 53.5 },
  { year: "2029", actual: null, target: 51.0 },
  { year: "2030", actual: null, target: 48.5 },
];

const FINANCING_PIE = NDC_SECTORS.map((s) => ({
  name: s.sector.split(" (")[0],
  value: s.deloitteFinancing,
  color: s.color,
}));

export default function NDCTracker() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const totalFinancing = NDC_SECTORS.reduce((s, n) => s + n.deloitteFinancing, 0);
  const totalProjects = NDC_SECTORS.reduce((s, n) => s + n.projects, 0);
  const avgReduction = (
    NDC_SECTORS.reduce(
      (s, n) => s + (n.currentReduction / n.targetReduction) * 100,
      0,
    ) / NDC_SECTORS.length
  ).toFixed(0);

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          mb: 4,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: BRAND_GREEN, fontWeight: 700, letterSpacing: 1.2 }}
        >
          Climate Commitments
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "Times New Roman, serif",
            fontWeight: 700,
            color: BRAND_GREEN,
            mt: 1,
          }}
        >
          Nigeria NDC Tracker
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mt: 1, maxWidth: 800 }}
        >
          Monitoring Deloitte's contribution to Nigeria's Nationally Determined
          Contributions (NDC) under the Paris Agreement — Updated NDC 2021
          targeting 64 MtCO₂e reduction by 2030.
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            label: "Total NDC Financing",
            value: `₦ ${(totalFinancing / 1000).toFixed(1)}B`,
            sub: `Across ${totalProjects} projects`,
            color: BRAND_GREEN,
          },
          {
            label: "Avg. Target Achievement",
            value: `${avgReduction}%`,
            sub: "Of NDC sector targets",
            color: "#10B981",
          },
          {
            label: "Emissions Reduced",
            value: "10.0 MtCO₂e",
            sub: "Cumulative since 2020",
            color: "#22C55E",
          },
          {
            label: "NDC Gap to 2030",
            value: "14.5 MtCO₂e",
            sub: "Remaining target shortfall",
            color: "#EF4444",
          },
        ].map((kpi) => (
          <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
                borderRadius: 2,
                borderLeft: `4px solid ${kpi.color}`,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {kpi.label}
              </Typography>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ color: kpi.color, mt: 0.5 }}
              >
                {kpi.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {kpi.sub}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Nigeria Emissions Trajectory vs. NDC Target
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 2 }}
            >
              Total G emissions (MtCO₂e) — actual vs. 2030 Paris Agreement
              pathway
            </Typography>
            <Box sx={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={EMISSION_TREND}
                  margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(theme.palette.text.secondary, 0.1)}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[40, 80]}
                    tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}`}
                    label={{
                      value: "MtCO₂e",
                      angle: -90,
                      position: "insideLeft",
                      style: {
                        fill: theme.palette.text.secondary,
                        fontSize: 11,
                      },
                    }}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                    formatter={(
                      value:
                        | number
                        | string
                        | readonly (string | number)[]
                        | undefined,
                      name: string | undefined,
                    ) => [
                      value !== undefined && value !== null
                        ? `${value} MtCO₂e`
                        : "Projected",
                      name === "actual" ? "Actual" : "NDC Target",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="target"
                    stroke="#10B981"
                    fill={alpha("#10B981", 0.1)}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    name="NDC Target"
                    connectNulls
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke={BRAND_GREEN}
                    fill={alpha(BRAND_GREEN, 0.15)}
                    strokeWidth={2.5}
                    name="Actual"
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              NDC Financing by Sector
            </Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={FINANCING_PIE}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {FINANCING_PIE.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(
                      value:
                        | number
                        | string
                        | readonly (string | number)[]
                        | undefined,
                      name: string | undefined,
                    ) => [`₦ ${value}M`, name]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "0.7rem" }}
                    formatter={(value: string) => (
                      <span style={{ color: theme.palette.text.secondary }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Sector-Level NDC Progress
      </Typography>
      <Stack spacing={3}>
        {NDC_SECTORS.map((ndc) => {
          const Icon = ndc.icon;
          const pct = (ndc.currentReduction / ndc.targetReduction) * 100;
          const status =
            pct >= 70 ? "On Track" : pct >= 50 ? "Moderate" : "Behind";
          const statusColor =
            pct >= 70 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444";

          return (
            <Paper
              key={ndc.sector}
              elevation={0}
              sx={{
                p: 3,
                border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
                borderRadius: 2,
                borderLeft: `4px solid ${ndc.color}`,
              }}
            >
              <Grid container spacing={3} alignItems="center">
                <Grid size={{ xs: 12, md: 5 }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(ndc.color, 0.12),
                      }}
                    >
                      <Icon size={22} color={ndc.color} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {ndc.sector}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Baseline: {ndc.baselineEmissions} MtCO₂e · Target: −
                        {ndc.targetReduction}%
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                      >
                        Reduction Progress
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        sx={{ color: statusColor }}
                      >
                        {pct.toFixed(0)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(pct, 100)}
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        bgcolor: isDark
                          ? alpha("#fff", 0.08)
                          : alpha("#000", 0.06),
                        "& .MuiLinearProgress-bar": {
                          bgcolor: statusColor,
                          borderRadius: 5,
                        },
                      }}
                    />
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 0.5, display: "block" }}
                    >
                      {ndc.currentReduction}% of {ndc.targetReduction}% target
                      achieved
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Stack spacing={0.5} alignItems="flex-end">
                    <Chip
                      size="small"
                      label={status}
                      sx={{
                        bgcolor: alpha(statusColor, 0.12),
                        color: statusColor,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      ₦ {ndc.deloitteFinancing}M · {ndc.projects} projects
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2, opacity: 0.5 }} />

              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{ mb: 1, display: "block" }}
              >
                Deloitte Key Actions:
              </Typography>
              <Grid container spacing={1}>
                {ndc.keyActions.map((action, idx) => (
                  <Grid key={idx} size={{ xs: 12, md: 4 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: alpha(ndc.color, isDark ? 0.06 : 0.03),
                        border: `1px solid ${alpha(ndc.color, 0.12)}`,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                        {action}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
