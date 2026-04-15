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
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Clock,
  ShieldCheck,
  AlertTriangle,
  Leaf,
  CheckCircle2,
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

export function InternalAuditDashboard() {
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
  } = useSustainabilityStore(
    useShallow((s) => ({
      entityProfile: s.entityProfile,
      risks: s.risks,
      materialityApproval: s.materialityApproval,
      selectedMaterialTopicIds: s.selectedMaterialTopicIds,
      scope1Assets: s.scope1Assets,
      scope2Entries: s.scope2Entries,
      scope3Entries: s.scope3Entries,
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
  const awaitingReview = selectedTopics.filter(
    (t) => t.approvalStatus === "Manager Approved",
  );
  const iaApproved = selectedTopics.filter(
    (t) => t.approvalStatus === "Internal Audit Approved",
  );
  const boardApproved = selectedTopics.filter(
    (t) => t.approvalStatus === "Board Approved",
  );
  const pendingSubmission = selectedTopics.filter(
    (t) =>
      !t.approvalStatus ||
      t.approvalStatus === "Draft" ||
      t.approvalStatus === "Submitted",
  );

  const auditTrend = [
    { quarter: "Q1 '24", reviewed: 8, approved: 6, returned: 2 },
    { quarter: "Q2 '24", reviewed: 10, approved: 8, returned: 2 },
    { quarter: "Q3 '24", reviewed: 11, approved: 9, returned: 2 },
    { quarter: "Q4 '24", reviewed: 14, approved: 12, returned: 2 },
    { quarter: "Q1 '25", reviewed: 12, approved: 10, returned: 2 },
    { quarter: "Q2 '25", reviewed: 15, approved: 14, returned: 1 },
    { quarter: "Q3 '25", reviewed: 18, approved: 16, returned: 2 },
    {
      quarter: "Q4 '25",
      reviewed: awaitingReview.length + iaApproved.length,
      approved: iaApproved.length,
      returned: 0,
    },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Box mb={3}>
        <Typography
          variant="overline"
          sx={{ color: BRAND, fontWeight: 700, letterSpacing: "0.15em" }}
        >
          INTERNAL AUDIT DASHBOARD
        </Typography>
        <Typography variant="h4" fontWeight={800} mt={0.5}>
          Audit Review Center
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Quarterly review pipeline for {entityProfile.name} — IFRS S1/S2
          compliance monitoring
        </Typography>
      </Box>

      <Grid container spacing={2.5} mb={3}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={Clock}
            label="Awaiting Your Review"
            value={awaitingReview.length}
            change={{ value: -12.5, label: "vs last Q" }}
            color="#f59e0b"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={ShieldCheck}
            label="Audit Approved"
            value={iaApproved.length + boardApproved.length}
            change={{ value: 28.6, label: "vs 2024" }}
            color="#10b981"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={AlertTriangle}
            label="Total Risks"
            value={risks.length}
            sub={`${selectedMaterialTopicIds.length} material`}
            change={{ value: 5.3, label: "vs 2024" }}
            color="#ef4444"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={Leaf}
            label="Total Emissions"
            value={`${formatNumber(totalEmissions)} tCO₂e`}
            change={{ value: 3.1, label: "vs 2024" }}
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
              materialityApproval.status === "pending_internal"
                ? alpha("#f59e0b", 0.06)
                : alpha("#10b981", 0.06),
            border: `1px solid ${materialityApproval.status === "pending_internal" ? alpha("#f59e0b", 0.2) : alpha("#10b981", 0.2)}`,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            {materialityApproval.status === "pending_internal" ? (
              <Clock size={18} color="#f59e0b" />
            ) : (
              <CheckCircle2 size={18} color="#10b981" />
            )}
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Assessment Status:{" "}
                {materialityApproval.status
                  .replace("pending_", "Pending ")
                  .replace("_", " ")
                  .toUpperCase()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Submitted by {materialityApproval.submittedBy || "N/A"}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      <Grid container spacing={2.5} mb={3}>
        <Grid size={{ xs: 12, md: 8 }}>
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
              Audit Review Trend (2024 – 2025)
            </Typography>
            <Box sx={{ height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={auditTrend}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha("#000", 0.06)}
                  />
                  <XAxis dataKey="quarter" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar
                    dataKey="reviewed"
                    name="Reviewed"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                  />
                  <Bar
                    dataKey="approved"
                    name="Approved"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                  />
                  <Bar
                    dataKey="returned"
                    name="Returned"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
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
            <Typography variant="subtitle2" fontWeight={700} mb={2}>
              Approval Pipeline
            </Typography>
            <Stack spacing={2}>
              {[
                {
                  label: "Pending Submission",
                  count: pendingSubmission.length,
                  color: "#94a3b8",
                },
                {
                  label: "Manager Approved (Awaiting IA)",
                  count: awaitingReview.length,
                  color: "#f59e0b",
                },
                {
                  label: "IA Approved",
                  count: iaApproved.length,
                  color: "#10b981",
                },
                {
                  label: "Board Approved",
                  count: boardApproved.length,
                  color: BRAND,
                },
              ].map((stage) => (
                <Box key={stage.label}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="caption" fontWeight={600}>
                      {stage.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color={stage.color}
                    >
                      {stage.count}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={
                      selectedTopics.length > 0
                        ? (stage.count / selectedTopics.length) * 100
                        : 0
                    }
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: alpha(stage.color, 0.1),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: stage.color,
                        borderRadius: 3,
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
          borderRadius: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ px: 3, py: 2, borderBottom: `1px solid ${borderColor}` }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Topics Requiring Audit Review
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 700 }}>Topic</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Data Owner</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Approved By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedTopics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No topics in the pipeline yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                selectedTopics.map((t) => (
                  <TableRow
                    key={t.id}
                    sx={{
                      bgcolor:
                        t.approvalStatus === "Manager Approved"
                          ? alpha("#f59e0b", 0.04)
                          : "inherit",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {t.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t.assignedUserId || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t.assignedBranch || "HQ"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={t.approvalStatus || "Draft"}
                        color={
                          t.approvalStatus?.includes("Approved")
                            ? "success"
                            : t.approvalStatus === "Submitted" ||
                                t.approvalStatus === "Manager Approved"
                              ? "warning"
                              : "default"
                        }
                        variant={
                          !t.approvalStatus || t.approvalStatus === "Draft"
                            ? "outlined"
                            : "filled"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {t.approvedBy || "—"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
