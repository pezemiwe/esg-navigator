import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  alpha,
  useTheme,
  LinearProgress,
  Stack,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Target,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  Clock,
  CheckCircle2,
  Shield,
  Zap,
} from "lucide-react";
import { useMaterialityStore } from "@/store/materialityStore";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
  formatNumber,
} from "../data/constants";
import { StatCard } from "./StatCard";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

export function BoardDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);
  const { topics } = useMaterialityStore(
    useShallow((s) => ({ topics: s.topics })),
  );
  const {
    entityProfile,
    risks,
    materialityApproval,
    selectedMaterialTopicIds,
    scope1Assets,
    scope2Entries,
    scope3Entries,
    scenarioResults,
  } = useSustainabilityStore(
    useShallow((s) => ({
      entityProfile: s.entityProfile,
      risks: s.risks,
      materialityApproval: s.materialityApproval,
      selectedMaterialTopicIds: s.selectedMaterialTopicIds,
      scope1Assets: s.scope1Assets,
      scope2Entries: s.scope2Entries,
      scope3Entries: s.scope3Entries,
      scenarioResults: s.scenarioResults,
    })),
  );

  const s1 = useMemo(() => calculateScope1(scope1Assets), [scope1Assets]);
  const s2 = useMemo(() => calculateScope2(scope2Entries), [scope2Entries]);
  const s3 = useMemo(() => calculateScope3(scope3Entries), [scope3Entries]);
  const totalEmissions = s1 + s2 + s3;

  const selectedTopics = useMemo(
    () => topics.filter((t) => t.selected),
    [topics],
  );
  const awaitingBoard = selectedTopics.filter(
    (t) => t.approvalStatus === "Internal Audit Approved",
  );
  const boardApproved = selectedTopics.filter(
    (t) => t.approvalStatus === "Board Approved",
  );

  const emissionsTrend = useMemo(
    () => [
      {
        year: "FY 2020",
        scope1: s1 * 0.72,
        scope2: s2 * 0.68,
        scope3: s3 * 0.55,
        total: (s1 + s2 + s3) * 0.65,
      },
      {
        year: "FY 2021",
        scope1: s1 * 0.78,
        scope2: s2 * 0.74,
        scope3: s3 * 0.7,
        total: (s1 + s2 + s3) * 0.74,
      },
      {
        year: "FY 2022",
        scope1: s1 * 0.85,
        scope2: s2 * 0.82,
        scope3: s3 * 0.8,
        total: (s1 + s2 + s3) * 0.82,
      },
      {
        year: "FY 2023",
        scope1: s1 * 0.92,
        scope2: s2 * 0.9,
        scope3: s3 * 0.88,
        total: (s1 + s2 + s3) * 0.9,
      },
      {
        year: "FY 2024",
        scope1: s1 * 0.97,
        scope2: s2 * 0.95,
        scope3: s3 * 0.94,
        total: (s1 + s2 + s3) * 0.95,
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

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Box mb={3}>
        <Typography
          variant="overline"
          sx={{ color: BRAND, fontWeight: 700, letterSpacing: "0.15em" }}
        >
          BOARD OVERSIGHT DASHBOARD
        </Typography>
        <Typography variant="h4" fontWeight={800} mt={0.5}>
          {entityProfile.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Executive sustainability governance and IFRS S1/S2 compliance overview
        </Typography>
      </Box>

      <Grid container spacing={2.5} mb={3}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={Target}
            label="Material Topics"
            value={selectedMaterialTopicIds.length}
            sub={`${boardApproved.length} board-approved`}
            change={{ value: 11.1, label: "vs 2024" }}
            color={BRAND}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={ShieldCheck}
            label="Awaiting Board Approval"
            value={awaitingBoard.length}
            change={{ value: -25.0, label: "vs last Q" }}
            color="#f59e0b"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={Leaf}
            label="GHG Emissions"
            value={`${formatNumber(totalEmissions)} tCO₂e`}
            change={{ value: 5.3, label: "vs 2024" }}
            color="#10b981"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={AlertTriangle}
            label="Scenario Analyses"
            value={scenarioResults.length}
            sub={`${risks.length} risks tracked`}
            change={{ value: 33.3, label: "vs 2024" }}
            color="#3b82f6"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
      </Grid>

      {materialityApproval.status !== "none" && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            bgcolor:
              materialityApproval.status === "pending_board"
                ? alpha("#f59e0b", 0.06)
                : materialityApproval.status === "approved"
                  ? alpha("#10b981", 0.06)
                  : alpha("#3b82f6", 0.06),
            border: `1px solid ${materialityApproval.status === "pending_board" ? alpha("#f59e0b", 0.2) : alpha("#10b981", 0.2)}`,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            {materialityApproval.status === "pending_board" ? (
              <Clock size={18} color="#f59e0b" />
            ) : materialityApproval.status === "approved" ? (
              <CheckCircle2 size={18} color="#10b981" />
            ) : (
              <Shield size={18} color="#3b82f6" />
            )}
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Materiality Assessment:{" "}
                {materialityApproval.status === "pending_board"
                  ? "PENDING BOARD APPROVAL"
                  : materialityApproval.status === "approved"
                    ? "BOARD APPROVED"
                    : materialityApproval.status
                        .replace("_", " ")
                        .toUpperCase()}
              </Typography>
              {materialityApproval.submittedBy && (
                <Typography variant="caption" color="text.secondary">
                  Submitted by {materialityApproval.submittedBy}
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      )}

      <Grid container spacing={2.5} mb={3}>
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
            <Typography variant="subtitle2" fontWeight={700} mb={2}>
              GHG Emissions Trend (FY 2020 – 2025)
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer>
                <AreaChart data={emissionsTrend}>
                  <defs>
                    <linearGradient
                      id="boardEmGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor={BRAND} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
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
                    dataKey="total"
                    name="Total Emissions"
                    stroke={BRAND}
                    fill="url(#boardEmGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="scope1"
                    name="Scope 1"
                    stroke="#ef4444"
                    fill="none"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <Area
                    type="monotone"
                    dataKey="scope2"
                    name="Scope 2"
                    stroke="#f59e0b"
                    fill="none"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <Area
                    type="monotone"
                    dataKey="scope3"
                    name="Scope 3"
                    stroke="#3b82f6"
                    fill="none"
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
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
            <Typography variant="subtitle2" fontWeight={700} mb={2}>
              Governance KPIs
            </Typography>
            <Stack spacing={2}>
              {[
                {
                  label: "IFRS S1/S2 Disclosure Readiness",
                  value: entityProfile.completed ? 85 : 25,
                  color: BRAND,
                },
                {
                  label: "Materiality Assessment Completion",
                  value:
                    selectedTopics.length > 0
                      ? Math.round(
                          (boardApproved.length / selectedTopics.length) * 100,
                        )
                      : 0,
                  color: "#10b981",
                },
                {
                  label: "Risk Register Coverage",
                  value: risks.length > 0 ? 92 : 0,
                  color: "#3b82f6",
                },
                {
                  label: "Data Collection Rate",
                  value:
                    selectedTopics.length > 0
                      ? Math.round(
                          (selectedTopics.filter(
                            (t) =>
                              t.approvalStatus && t.approvalStatus !== "Draft",
                          ).length /
                            selectedTopics.length) *
                            100,
                        )
                      : 0,
                  color: "#f59e0b",
                },
              ].map((kpi) => (
                <Box key={kpi.label}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" fontWeight={600}>
                      {kpi.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color={kpi.color}
                    >
                      {kpi.value}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={kpi.value}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: alpha(kpi.color, 0.1),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: kpi.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
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
          <Typography variant="subtitle2" fontWeight={700}>
            Board-Level Insights
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {[
            {
              title: "Regulatory Compliance",
              text: `The bank has identified ${risks.length} climate-related risks across ${selectedMaterialTopicIds.length} material topics. IFRS S1/S2 disclosure framework is ${entityProfile.completed ? "substantially" : "partially"} complete.`,
            },
            {
              title: "Carbon Footprint",
              text: `Total GHG emissions stand at ${formatNumber(totalEmissions)} tCO₂e. Financed emissions (Scope 3) represent ${totalEmissions > 0 ? Math.round((s3 / totalEmissions) * 100) : 0}% of the total footprint, requiring portfolio-level decarbonization.`,
            },
            {
              title: "Approval Status",
              text: `${boardApproved.length} of ${selectedTopics.length} material topics have received board approval. ${awaitingBoard.length} topic(s) are pending board-level sign-off following internal audit clearance.`,
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
