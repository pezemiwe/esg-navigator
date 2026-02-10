import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  LinearProgress,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle2,
  Target,
  Globe,
  Leaf,
  Award,
  Zap,
  TreePine,
} from "lucide-react";
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";
import { DELOITTE_COLORS } from "@/config/colors.config";
import InfoIcon from "@mui/icons-material/Info";

const BRAND_GREEN = DELOITTE_COLORS.green.DEFAULT;

const KPI_DATA = [
  {
    label: "SDG Alignment Score",
    value: "78.4%",
    delta: "+5.2%",
    deltaUp: true,
    icon: Target,
    color: BRAND_GREEN,
    description: "Weited alignment across 17 SDGs",
  },
  {
    label: "NDC Progress",
    value: "62.8%",
    delta: "+8.1%",
    deltaUp: true,
    icon: Globe,
    color: "#10B981",
    description: "Nigeria's NDC commitment tracking",
  },
  {
    label: "Green Finance Ratio",
    value: "₦ 2.4B",
    delta: "+18.3%",
    deltaUp: true,
    icon: Leaf,
    color: "#059669",
    description: "Climate-aligned lending portfolio",
  },
  {
    label: "ESG Score",
    value: "B+",
    delta: "Upgraded",
    deltaUp: true,
    icon: Award,
    color: "#8B5CF6",
    description: "Composite ESG rating",
  },
  {
    label: "Carbon Offset",
    value: "12,450 tCO₂e",
    delta: "+34%",
    deltaUp: true,
    icon: TreePine,
    color: "#22C55E",
    description: "Portfolio carbon offset achieved",
  },
  {
    label: "Clean Energy Loans",
    value: "₦ 892M",
    delta: "+22.6%",
    deltaUp: true,
    icon: Zap,
    color: "#F59E0B",
    description: "Renewable energy project financing",
  },
];

const SDG_GOALS = [
  { id: 1, name: "No Poverty", score: 82, color: "#E5243B", aligned: true },
  { id: 2, name: "Zero Hunger", score: 71, color: "#DDA63A", aligned: true },
  {
    id: 3,
    name: "Good Health",
    score: 65,
    color: "#4C9F38",
    aligned: false,
  },
  {
    id: 4,
    name: "Quality Education",
    score: 88,
    color: "#C5192D",
    aligned: true,
  },
  {
    id: 5,
    name: "Gender Equality",
    score: 76,
    color: "#FF3A21",
    aligned: true,
  },
  {
    id: 6,
    name: "Clean Water",
    score: 58,
    color: "#26BDE2",
    aligned: false,
  },
  {
    id: 7,
    name: "Clean Energy",
    score: 91,
    color: "#FCC30B",
    aligned: true,
  },
  {
    id: 8,
    name: "Decent Work",
    score: 85,
    color: "#A21942",
    aligned: true,
  },
  {
    id: 9,
    name: "Industry & Innovation",
    score: 79,
    color: "#FD6925",
    aligned: true,
  },
  {
    id: 10,
    name: "Reduced Inequalities",
    score: 68,
    color: "#DD1367",
    aligned: false,
  },
  {
    id: 11,
    name: "Sustainable Cities",
    score: 74,
    color: "#FD9D24",
    aligned: true,
  },
  {
    id: 12,
    name: "Responsible Consumption",
    score: 62,
    color: "#BF8B2E",
    aligned: false,
  },
  {
    id: 13,
    name: "Climate Action",
    score: 93,
    color: "#3F7E44",
    aligned: true,
  },
  {
    id: 14,
    name: "Life Below Water",
    score: 45,
    color: "#0A97D9",
    aligned: false,
  },
  {
    id: 15,
    name: "Life on Land",
    score: 67,
    color: "#56C02B",
    aligned: false,
  },
  {
    id: 16,
    name: "Peace & Justice",
    score: 81,
    color: "#00689D",
    aligned: true,
  },
  {
    id: 17,
    name: "Partnerships",
    score: 77,
    color: "#19486A",
    aligned: true,
  },
];

const NDC_COMMITMENTS = [
  {
    sector: "Energy",
    target: "Reduce emissions by 15% by 2030",
    progress: 72,
    status: "On Track",
    sAllocated: 1200,
  },
  {
    sector: "Agriculture (REDD+)",
    target: "Restore 10,000 ha degraded forest",
    progress: 58,
    status: "Moderate",
    sAllocated: 450,
  },
  {
    sector: "Transport",
    target: "Expand mass transit systems",
    progress: 41,
    status: "Behind",
    sAllocated: 680,
  },
  {
    sector: "Waste Management",
    target: "Reduce methane by 20%",
    progress: 65,
    status: "On Track",
    sAllocated: 190,
  },
  {
    sector: "Industry",
    target: "Adopt clean production standards",
    progress: 53,
    status: "Moderate",
    sAllocated: 320,
  },
];

const ESG_PILLAR_DATA = [
  { name: "Environmental", value: 82, fill: "#10B981" },
  { name: "Social", value: 75, fill: "#3B82F6" },
  { name: "Governance", value: 88, fill: "#8B5CF6" },
];

const FINANCING_DATA = [
  { quarter: "Q1 2025", green: 580, social: 320, governance: 210 },
  { quarter: "Q2 2025", green: 720, social: 380, governance: 250 },
  { quarter: "Q3 2025", green: 890, social: 410, governance: 280 },
  { quarter: "Q4 2025", green: 1050, social: 460, governance: 310 },
];

export default function SDGDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const alignedCount = SDG_GOALS.filter((g) => g.aligned).length;
  const avgScore = Math.round(
    SDG_GOALS.reduce((s, g) => s + g.score, 0) / SDG_GOALS.length,
  );

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
          sx={{
            color: BRAND_GREEN,
            fontWeight: 700,
            letterSpacing: 1.2,
          }}
        >
          Sustainability Compliance
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
          SDG & NDC Alignment Dashboard
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mt: 1, maxWidth: 800 }}
        >
          Tracking Deloitte's alignment with the UN Sustainable Development
          Goals and Nigeria's Nationally Determined Contributions under the
          Paris Agreement.
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {KPI_DATA.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Grid key={kpi.label} size={{ xs: 12, sm: 6, md: 4, lg: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  height: "100%",
                  border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
                  borderRadius: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: alpha(kpi.color, 0.4),
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 20px ${alpha(kpi.color, 0.12)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1.5,
                      bgcolor: alpha(kpi.color, 0.12),
                    }}
                  >
                    <Icon size={18} color={kpi.color} />
                  </Box>
                  <Chip
                    size="small"
                    label={kpi.delta}
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      bgcolor: alpha(kpi.deltaUp ? "#10B981" : "#EF4444", 0.12),
                      color: kpi.deltaUp ? "#10B981" : "#EF4444",
                    }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ color: kpi.color }}
                >
                  {kpi.value}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem" }}
                >
                  {kpi.label}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  SDG Alignment Overview
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {alignedCount}/17 SDGs actively aligned · Average score:{" "}
                  {avgScore}%
                </Typography>
              </Box>
              <Chip
                label={`${alignedCount} Aligned`}
                sx={{
                  bgcolor: alpha("#10B981", 0.12),
                  color: "#10B981",
                  fontWeight: 700,
                }}
              />
            </Box>

            <Grid container spacing={1.5}>
              {SDG_GOALS.map((goal) => (
                <Grid key={goal.id} size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }}>
                  <Tooltip
                    title={`SDG ${goal.id}: ${goal.name} — ${goal.score}% aligned`}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(goal.color, isDark ? 0.15 : 0.08),
                        border: `1px solid ${alpha(goal.color, goal.aligned ? 0.4 : 0.15)}`,
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        position: "relative",
                        "&:hover": {
                          transform: "scale(1.03)",
                          boxShadow: `0 2px 12px ${alpha(goal.color, 0.2)}`,
                        },
                      }}
                    >
                      {goal.aligned && (
                        <CheckCircle2
                          size={12}
                          color="#10B981"
                          style={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                          }}
                        />
                      )}
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{ color: goal.color, fontSize: "1.1rem" }}
                      >
                        {goal.id}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          fontSize: "0.6rem",
                          lineHeight: 1.2,
                          color: "text.secondary",
                          mt: 0.3,
                          height: 24,
                          overflow: "hidden",
                        }}
                      >
                        {goal.name}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={goal.score}
                        sx={{
                          mt: 0.5,
                          height: 4,
                          borderRadius: 2,
                          bgcolor: alpha(goal.color, 0.15),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: goal.color,
                            borderRadius: 2,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          color: goal.color,
                        }}
                      >
                        {goal.score}%
                      </Typography>
                    </Paper>
                  </Tooltip>
                </Grid>
              ))}
            </Grid>
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
              ESG Pillar Scores
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 2 }}
            >
              Deloitte composite ESG performance
            </Typography>

            <Box sx={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="90%"
                  data={ESG_PILLAR_DATA}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={8}
                    background={{ fill: isDark ? "#2D2D2D" : "#F1F5F9" }}
                  >
                    {ESG_PILLAR_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </RadialBar>
                </RadialBarChart>
              </ResponsiveContainer>
            </Box>

            <Stack spacing={1.5}>
              {ESG_PILLAR_DATA.map((pillar) => (
                <Box
                  key={pillar.name}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: pillar.fill,
                      }}
                    />
                    <Typography variant="body2">{pillar.name}</Typography>
                  </Stack>
                  <Chip
                    size="small"
                    label={`${pillar.value}%`}
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      bgcolor: alpha(pillar.fill, 0.12),
                      color: pillar.fill,
                      height: 22,
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  🇬🇭 Nigeria NDC Commitments
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Paris Agreement nationally determined contributions —
                  Deloitte's advisory & financing role
                </Typography>
              </Box>
              <Tooltip title="ana's Updated NDC (2021) targets 64 MtCO₂e reduction by 2030">
                <IconButton size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            <Stack spacing={2}>
              {NDC_COMMITMENTS.map((ndc) => (
                <Paper
                  key={ndc.sector}
                  elevation={0}
                  sx={{
                    p: 2,
                    border: `1px solid ${isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06)}`,
                    borderRadius: 1.5,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        {ndc.sector}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        {ndc.target}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={`₦ ${ndc.sAllocated}M`}
                        sx={{
                          height: 22,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: alpha(BRAND_GREEN, 0.12),
                          color: BRAND_GREEN,
                        }}
                      />
                      <Chip
                        size="small"
                        label={ndc.status}
                        sx={{
                          height: 22,
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          bgcolor: alpha(
                            ndc.status === "On Track"
                              ? "#10B981"
                              : ndc.status === "Moderate"
                                ? "#F59E0B"
                                : "#EF4444",
                            0.12,
                          ),
                          color:
                            ndc.status === "On Track"
                              ? "#10B981"
                              : ndc.status === "Moderate"
                                ? "#F59E0B"
                                : "#EF4444",
                        }}
                      />
                    </Stack>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={ndc.progress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: isDark
                        ? alpha("#fff", 0.08)
                        : alpha("#000", 0.06),
                      "& .MuiLinearProgress-bar": {
                        bgcolor:
                          ndc.status === "On Track"
                            ? "#10B981"
                            : ndc.status === "Moderate"
                              ? "#F59E0B"
                              : "#EF4444",
                        borderRadius: 4,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: "block" }}
                  >
                    {ndc.progress}% complete
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 5 }}>
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
              ESG-Aligned Financing Trend
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 2 }}
            >
              Deloitte sustainable finance allocation by pillar (₦ millions)
            </Typography>

            <Box sx={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={FINANCING_DATA}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha(theme.palette.text.secondary, 0.1)}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="quarter"
                    tick={{
                      fill: theme.palette.text.secondary,
                      fontSize: 11,
                    }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{
                      fill: theme.palette.text.secondary,
                      fontSize: 11,
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => `${v}`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: 8,
                    }}
                    formatter={(value: number | string | undefined) => [
                      `₦ ${value}M`,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
                  <Bar
                    dataKey="green"
                    name="Environmental"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    stackId="finance"
                  />
                  <Bar
                    dataKey="social"
                    name="Social"
                    fill="#3B82F6"
                    radius={[0, 0, 0, 0]}
                    stackId="finance"
                  />
                  <Bar
                    dataKey="governance"
                    name="Governance"
                    fill="#8B5CF6"
                    radius={[4, 4, 0, 0]}
                    stackId="finance"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
          borderRadius: 2,
          borderLeft: `4px solid ${BRAND_GREEN}`,
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          🏦 Deloitte ESG Strategic Alignment
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Key regulatory frameworks and voluntary commitments guiding Deloitte's
          sustainability strategy in Nigeria
        </Typography>
        <Grid container spacing={2}>
          {[
            {
              title: "Central Bank of Nigeria ESG Directive",
              desc: "Compliance with CBN's Sustainable Banking Principles (2019) requiring ESG integration in credit decisions",
              status: "Compliant",
              color: "#10B981",
            },
            {
              title: "Nigeria Green Bond Framework",
              desc: "Active participation in SEC Nigeria's green bond market development initiative",
              status: "Active",
              color: "#3B82F6",
            },
            {
              title: "UNEP FI PRB Signatory",
              desc: "Committed to the UN Principles for Responsible Banking — annual impact reporting",
              status: "Signatory",
              color: "#8B5CF6",
            },
            {
              title: "TCFD Reporting",
              desc: "Climate-related financial disclosures aligned with TCFD recommendations",
              status: "In Progress",
              color: "#F59E0B",
            },
          ].map((framework) => (
            <Grid key={framework.title} size={{ xs: 12, sm: 6, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: alpha(framework.color, isDark ? 0.08 : 0.05),
                  border: `1px solid ${alpha(framework.color, 0.2)}`,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={700}>
                    {framework.title}
                  </Typography>
                  <Chip
                    size="small"
                    label={framework.status}
                    sx={{
                      height: 18,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      bgcolor: alpha(framework.color, 0.15),
                      color: framework.color,
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.7rem" }}
                >
                  {framework.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
