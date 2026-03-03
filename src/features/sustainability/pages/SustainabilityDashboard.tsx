import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  alpha,
  useTheme,
  LinearProgress,
  Chip,
  Stack,
  Button,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  CartesianGrid,
} from "recharts";
import {
  Shield,
  TrendingUp,
  AlertTriangle,
  Leaf,
  Building2,
  Target,
  BarChart3,
  Activity,
  Zap,
  FileText,
  CheckCircle2,
  Database,
  CircleDashed,
  RotateCcw,
} from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useMaterialityStore } from "@/store/materialityStore";
import { useShallow } from "zustand/react/shallow";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
  formatNaira,
  formatNumber,
  getRiskColor,
  getRiskLevel,
  DEFAULT_RISKS,
  DEFAULT_SCOPE1,
  DEFAULT_SCOPE2,
  DEFAULT_SCOPE3,
} from "../data/constants";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

const PIE_COLORS = [
  "#86BC25",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color = BRAND,
  cardBg,
  borderColor,
}: {
  icon: typeof Shield;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  cardBg: string;
  borderColor: string;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      bgcolor: cardBg,
      border: `1px solid ${borderColor}`,
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        bgcolor: color,
      },
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            letterSpacing: "0.08em",
            fontSize: "0.65rem",
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.1 }}
        >
          {value}
        </Typography>
        {sub && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
          >
            {sub}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={22} color={color} />
      </Box>
    </Box>
  </Paper>
);

export default function SustainabilityDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const {
    entityProfile,
    risks,
    selectedMaterialTopicIds,
    scope1Assets,
    scope2Entries,
    scope3Entries,
    scenarioResults,
    templates,
    setRisks,
    addScope1Asset,
    addScope2Entry,
    addScope3Entry,
  } = useSustainabilityStore(
    useShallow((state) => ({
      entityProfile: state.entityProfile,
      risks: state.risks,
      selectedMaterialTopicIds: state.selectedMaterialTopicIds,
      scope1Assets: state.scope1Assets,
      scope2Entries: state.scope2Entries,
      scope3Entries: state.scope3Entries,
      scenarioResults: state.scenarioResults,
      templates: state.templates,
      setRisks: state.setRisks,
      addScope1Asset: state.addScope1Asset,
      addScope2Entry: state.addScope2Entry,
      addScope3Entry: state.addScope3Entry,
    })),
  );

  const s1 = useMemo(() => calculateScope1(scope1Assets), [scope1Assets]);
  const s2 = useMemo(() => calculateScope2(scope2Entries), [scope2Entries]);
  const s3 = useMemo(() => calculateScope3(scope3Entries), [scope3Entries]);
  const totalEmissions = s1 + s2 + s3;

  const emissionsTrend = useMemo(
    () => [
      {
        year: "FY 2022",
        scope1: s1 * 0.88,
        scope2: s2 * 0.92,
        scope3: s3 * 0.85,
        total: s1 * 0.88 + s2 * 0.92 + s3 * 0.85,
      },
      {
        year: "FY 2023",
        scope1: s1 * 0.94,
        scope2: s2 * 0.96,
        scope3: s3 * 0.92,
        total: s1 * 0.94 + s2 * 0.96 + s3 * 0.92,
      },
      {
        year: "FY 2024",
        scope1: s1 * 0.97,
        scope2: s2 * 0.98,
        scope3: s3 * 0.96,
        total: s1 * 0.97 + s2 * 0.98 + s3 * 0.96,
      },
      {
        year: "FY 2025",
        scope1: s1,
        scope2: s2,
        scope3: s3,
        total: totalEmissions,
      },
    ],
    [s1, s2, s3, totalEmissions],
  );

  const topRisks = useMemo(() => {
    return [...risks]
      .sort((a, b) => b.impact * b.likelihood - a.impact * a.likelihood)
      .slice(0, 10);
  }, [risks]);

  const categoryDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    risks.forEach((r) => {
      map[r.category] = (map[r.category] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [risks]);

  const exposureData = useMemo(() => {
    return (entityProfile?.sectorExposures || []).map((s) => ({
      name: s.sector,
      value: ((entityProfile.loanBook || 0) * s.percentage) / 100,
      pct: s.percentage,
    }));
  }, [entityProfile]);

  const STAGES = useMemo(
    () => [
      {
        id: "profile",
        label: "Entity Profile",
        desc: "Define reporting boundaries & sector exposure",
        done: entityProfile.completed,
        icon: Building2,
      },
      {
        id: "risks",
        label: "Risk Register",
        desc: "Identify climate & sustainability risks",
        done: risks.length > 0,
        icon: AlertTriangle,
      },
      {
        id: "materiality",
        label: "Material Topics",
        desc: "Determine high-priority impact areas",
        done: selectedMaterialTopicIds.length > 0,
        icon: Target,
      },
      {
        id: "scope1",
        label: "Scope 1 Emissions",
        desc: "Calculate direct facility emissions",
        done: scope1Assets.length > 0,
        icon: Activity,
      },
      {
        id: "scope2",
        label: "Scope 2 Emissions",
        desc: "Record purchased electricity & heating",
        done: scope2Entries.length > 0,
        icon: Zap,
      },
      {
        id: "scope3",
        label: "Scope 3 Emissions",
        desc: "Measure financed & supply chain emissions",
        done: scope3Entries.length > 0,
        icon: TrendingUp,
      },
      {
        id: "templates",
        label: "Data Templates",
        desc: "Process portfolio data tracking",
        done: templates.length > 0,
        icon: FileText,
      },
      {
        id: "scenarios",
        label: "Scenario Analysis",
        desc: "Execute climate stress testing",
        done: scenarioResults.length > 0,
        icon: BarChart3,
      },
    ],
    [
      entityProfile,
      risks,
      selectedMaterialTopicIds,
      scope1Assets,
      scope2Entries,
      scope3Entries,
      templates,
      scenarioResults,
    ],
  );

  const completionPct = useMemo(() => {
    const completedCount = STAGES.filter((s) => s.done).length;
    return Math.round((completedCount / STAGES.length) * 100);
  }, [STAGES]);

  const isFlowComplete = completionPct === 100;

  const branchCompletion = [
    { region: "Lagos HQ", pct: 100 },
    { region: "Lagos Branches", pct: 92 },
    { region: "Abuja Region", pct: 85 },
    { region: "Northern Region", pct: 72 },
    { region: "South-South", pct: 68 },
    { region: "South-East", pct: 61 },
  ];

  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);

  const handleReset = () => {
    useSustainabilityStore.getState().reset();
    useMaterialityStore.getState().reset();
    // Force a reload to ensure all UI states are cleared
    window.location.reload();
  };

  const handlePopulateSampleData = () => {
    setRisks(DEFAULT_RISKS);
    setTimeout(() => {
      useSustainabilityStore.getState().selectTopMaterialTopics(10);
      useSustainabilityStore.setState((state) => ({
        entityProfile: {
          ...state.entityProfile,
          name: "Guaranty Trust Holding Company PLC",
          completed: true,
          loanBook: 4500000000,
          branches: 240,
          sectorExposures: [
            { sector: "Oil & Gas", percentage: 22 },
            { sector: "Manufacturing", percentage: 18 },
            { sector: "Agriculture", percentage: 15 },
          ],
        },
        templates: [
          {
            id: "1",
            topicId: "t1",
            topicName: "Env",
            assignedTo: "team",
            department: "Risk",
            frequency: "monthly",
            fields: [],
            status: "approved",
          },
        ],
        scenarioResults: [
          {
            id: "1",
            name: "Net Zero 2050",
            description: "Standard NZ",
            totalEmissions: 1000,
            estimatedCost: 50000000,
            profitImpact: -12,
            nplIncrease: 2,
            capitalAdequacyEffect: -1.5,
            runAt: new Date().toISOString(),
          },
        ],
      }));
    }, 0);
    DEFAULT_SCOPE1.forEach((a) => addScope1Asset(a));
    DEFAULT_SCOPE2.forEach((e) => addScope2Entry(e));
    DEFAULT_SCOPE3.forEach((e) => addScope3Entry(e));
  };

  if (!isFlowComplete) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 6 },
            borderRadius: 4,
            bgcolor: cardBg,
            border: `1px solid ${borderColor}`,
            position: "relative",
            overflow: "hidden",
            mb: 4,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(BRAND, 0.1)} 0%, ${alpha(BRAND, 0)} 70%)`,
              pointerEvents: "none",
            }}
          />
          <Stack
            alignItems="center"
            textAlign="center"
            spacing={2}
            sx={{ position: "relative", zIndex: 1, mb: 6 }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "20px",
                bgcolor: alpha(BRAND, 0.1),
                border: `1px solid ${alpha(BRAND, 0.2)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Database size={32} color={BRAND} />
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800 }}>
              Command Center Setup
            </Typography>
            <Typography
              variant="body1"
              sx={{ color: "text.secondary", maxWidth: 600, mx: "auto" }}
            >
              Welcome to your dedicated sustainability intelligence platform. To
              unlock your full IFRS S1/S2 aligned operational dashboard, please
              complete the foundational reporting modules.
            </Typography>

            <Box sx={{ width: "100%", maxWidth: 600, mt: 4, mb: 1 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Overall Readiness
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: BRAND }}
                >
                  {completionPct}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionPct}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  bgcolor: alpha(BRAND, 0.1),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    bgcolor: BRAND,
                  },
                }}
              />
            </Box>
          </Stack>

          <Grid container spacing={2}>
            {STAGES.map((stage) => {
              const StageIcon = stage.icon;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={stage.id}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: stage.done
                        ? alpha(BRAND, 0.04)
                        : alpha("#000", isDark ? 0.2 : 0.02),
                      border: `1px solid ${stage.done ? alpha(BRAND, 0.2) : borderColor}`,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "all 0.2s ease-in-out",
                      position: "relative",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          bgcolor: stage.done
                            ? alpha(BRAND, 0.1)
                            : alpha(isDark ? "#fff" : "#000", 0.05),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <StageIcon
                          size={20}
                          color={
                            stage.done ? BRAND : theme.palette.text.disabled
                          }
                        />
                      </Box>
                      {stage.done ? (
                        <CheckCircle2 size={24} color={BRAND} />
                      ) : (
                        <CircleDashed
                          size={24}
                          color={theme.palette.text.disabled}
                        />
                      )}
                    </Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, mb: 0.5 }}
                    >
                      {stage.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", lineHeight: 1.4 }}
                    >
                      {stage.desc}
                    </Typography>
                    {!stage.done && (
                      <Box sx={{ mt: "auto", pt: 2 }}>
                        <Chip
                          label="Pending"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            height: 20,
                            bgcolor: alpha("#f59e0b", 0.1),
                            color: "#f59e0b",
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          <Box
            sx={{ mt: 6, display: "flex", justifyContent: "center", gap: 2 }}
          >
            <Button
              variant="text"
              onClick={handleReset}
              startIcon={<RotateCcw size={16} />}
              color="error"
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              Reset for Demo
            </Button>
            <Button
              variant="outlined"
              onClick={handlePopulateSampleData}
              sx={{
                borderRadius: 2,
                borderColor: alpha(BRAND, 0.3),
                color: BRAND,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  borderColor: BRAND,
                  bgcolor: alpha(BRAND, 0.05),
                },
              }}
            >
              Populate Sample Data for Testing
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

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
          SUSTAINABILITY COMMAND CENTER
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
          {entityProfile.name}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 0.5, maxWidth: 700 }}
        >
          Integrated climate and sustainability intelligence platform — IFRS
          S1/S2 aligned
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={AlertTriangle}
            label="Total Risks Identified"
            value={risks.length}
            sub={`${selectedMaterialTopicIds.length} material topics selected`}
            color="#f59e0b"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={Leaf}
            label="Total Emissions"
            value={`${formatNumber(totalEmissions)} tCO₂e`}
            sub="Scope 1 + 2 + 3 combined"
            color="#10b981"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={Building2}
            label="Portfolio Exposure"
            value={formatNaira(entityProfile.loanBook)}
            sub={`${entityProfile.branches || 0} branches nationwide`}
            color="#3b82f6"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            icon={Target}
            label="IFRS Readiness"
            value={`${completionPct}%`}
            sub="Disclosure compliance score"
            color={BRAND}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          bgcolor: alpha(BRAND, isDark ? 0.08 : 0.04),
          border: `1px solid ${alpha(BRAND, 0.15)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Data Completeness Tracker
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND }}>
            {completionPct}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionPct}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(BRAND, 0.1),
            "& .MuiLinearProgress-bar": { bgcolor: BRAND, borderRadius: 4 },
          }}
        />
        <Stack direction="row" spacing={2} sx={{ mt: 1.5, flexWrap: "wrap" }}>
          {[
            { label: "Entity Profile", done: entityProfile.completed },
            { label: "Risk Register", done: risks.length > 0 },
            {
              label: "Material Topics",
              done: selectedMaterialTopicIds.length > 0,
            },
            { label: "Scope 1", done: scope1Assets.length > 0 },
            { label: "Scope 2", done: scope2Entries.length > 0 },
            { label: "Scope 3", done: scope3Entries.length > 0 },
            { label: "Templates", done: templates.length > 0 },
            { label: "Scenarios", done: scenarioResults.length > 0 },
          ].map((item) => (
            <Chip
              key={item.label}
              label={item.label}
              size="small"
              icon={item.done ? <CheckCircle2 size={14} /> : undefined}
              sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                bgcolor: item.done
                  ? alpha("#10b981", 0.12)
                  : alpha("#000", 0.05),
                color: item.done ? "#10b981" : "text.secondary",
                "& .MuiChip-icon": { color: "#10b981" },
              }}
            />
          ))}
        </Stack>
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              height: "100%",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              GHG Emissions Trend (Scope 1 + 2 + 3)
            </Typography>
            <Box sx={{ height: 280 }}>
              <ResponsiveContainer>
                <AreaChart data={emissionsTrend}>
                  <defs>
                    <linearGradient id="colorS1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorS2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorS3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha("#000", 0.06)}
                  />
                  <XAxis dataKey="year" fontSize={11} />
                  <YAxis
                    fontSize={11}
                    tickFormatter={(v: number) => formatNumber(v)}
                  />
                  <Tooltip
                    formatter={(v: number | undefined) =>
                      v !== undefined ? `${formatNumber(v)} tCO₂e` : ""
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="scope1"
                    name="Scope 1"
                    stroke="#ef4444"
                    fill="url(#colorS1)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="scope2"
                    name="Scope 2"
                    stroke="#f59e0b"
                    fill="url(#colorS2)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="scope3"
                    name="Scope 3"
                    stroke="#3b82f6"
                    fill="url(#colorS3)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
            <Stack
              direction="row"
              spacing={3}
              sx={{ mt: 1.5, justifyContent: "center" }}
            >
              {[
                { label: "Scope 1 (Direct)", color: "#ef4444", value: s1 },
                { label: "Scope 2 (Electricity)", color: "#f59e0b", value: s2 },
                { label: "Scope 3 (Financed)", color: "#3b82f6", value: s3 },
              ].map((s) => (
                <Box
                  key={s.label}
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: s.color,
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    {s.label}: {formatNumber(s.value)} tCO₂e
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              height: "100%",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Portfolio Exposure by Sector
            </Typography>
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={exposureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {exposureData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number | undefined) =>
                      v !== undefined ? formatNaira(v) : ""
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={0.5}>
              {exposureData.slice(0, 5).map((s, i) => (
                <Box
                  key={s.name}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: PIE_COLORS[i],
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 500 }}>
                      {s.name}
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {s.pct}%
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Top 10 Material Topics (by Risk Score)
            </Typography>
            <Stack spacing={1}>
              {topRisks.map((r, i) => {
                const score = r.impact * r.likelihood;
                return (
                  <Box
                    key={r.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(getRiskColor(score), 0.04),
                      border: `1px solid ${alpha(getRiskColor(score), 0.12)}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 800,
                        color: "text.secondary",
                        minWidth: 20,
                      }}
                    >
                      {i + 1}
                    </Typography>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                        noWrap
                      >
                        {r.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "text.secondary" }}
                      >
                        {r.category}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${score} — ${getRiskLevel(score)}`}
                      size="small"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.65rem",
                        bgcolor: alpha(getRiskColor(score), 0.12),
                        color: getRiskColor(score),
                        minWidth: 80,
                      }}
                    />
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Stack spacing={2.5}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: cardBg,
                border: `1px solid ${borderColor}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Risk Heatmap Distribution
              </Typography>
              <Box sx={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={categoryDistribution}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" fontSize={11} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      fontSize={10}
                    />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill={BRAND}
                      radius={[0, 4, 4, 0]}
                      barSize={16}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: cardBg,
                border: `1px solid ${borderColor}`,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
                Branch Reporting Status
              </Typography>
              <Stack spacing={1.5}>
                {branchCompletion.map((b) => (
                  <Box key={b.region}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {b.region}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: b.pct === 100 ? "#10b981" : "text.secondary",
                        }}
                      >
                        {b.pct}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={b.pct}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: alpha("#000", 0.06),
                        "& .MuiLinearProgress-bar": {
                          bgcolor:
                            b.pct === 100
                              ? "#10b981"
                              : b.pct >= 80
                                ? BRAND
                                : "#f59e0b",
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: alpha("#3b82f6", isDark ? 0.08 : 0.03),
          border: `1px solid ${alpha("#3b82f6", 0.12)}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
          <Zap size={18} color="#3b82f6" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            AI-Generated Insights
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {[
            {
              title: "Climate Exposure Alert",
              text: `Oil & Gas portfolio exposure at ${entityProfile.sectorExposures.find((s) => s.sector === "Oil & Gas")?.percentage || 22}% exceeds CBN recommended threshold. Consider transition risk mitigation strategies.`,
            },
            {
              title: "Scope 3 Dominance",
              text: `Financed emissions represent ${totalEmissions > 0 ? Math.round((s3 / totalEmissions) * 100) : 0}% of total GHG footprint. Portfolio decarbonization should be prioritized in sustainability strategy.`,
            },
            {
              title: "IFRS S2 Readiness",
              text: `${8 - Math.round(completionPct / 12.5)} disclosure modules are pending completion. Full IFRS S2 compliance requires entity profile, materiality assessment, emissions data, and scenario analysis.`,
            },
          ].map((insight) => (
            <Grid size={{ xs: 12, md: 4 }} key={insight.title}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha("#3b82f6", 0.06),
                  height: "100%",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "#3b82f6",
                    display: "block",
                    mb: 0.5,
                  }}
                >
                  {insight.title}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", lineHeight: 1.5 }}
                >
                  {insight.text}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
