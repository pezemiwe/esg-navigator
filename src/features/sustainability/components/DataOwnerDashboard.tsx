import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  alpha,
  useTheme,
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
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { ClipboardList, Clock, FileText, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useMaterialityStore } from "@/store/materialityStore";
import { useShallow } from "zustand/react/shallow";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { StatCard } from "./StatCard";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

export function DataOwnerDashboard() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);
  const { user } = useAuthStore();
  const { topics } = useMaterialityStore(
    useShallow((s) => ({ topics: s.topics })),
  );
  const myTopics = useMemo(
    () => topics.filter((t) => t.selected && t.assignedUserId === user?.name),
    [topics, user],
  );
  const submitted = myTopics.filter((t) => t.approvalStatus === "Submitted");
  const approved = myTopics.filter((t) =>
    t.approvalStatus?.includes("Approved"),
  );
  const draft = myTopics.filter(
    (t) => !t.approvalStatus || t.approvalStatus === "Draft",
  );

  const quarterlyData = [
    { quarter: "Q1 '24", submitted: 5, approved: 4, rejected: 1 },
    { quarter: "Q2 '24", submitted: 6, approved: 5, rejected: 1 },
    { quarter: "Q3 '24", submitted: 7, approved: 6, rejected: 1 },
    { quarter: "Q4 '24", submitted: 8, approved: 7, rejected: 1 },
    { quarter: "Q1 '25", submitted: 8, approved: 7, rejected: 1 },
    { quarter: "Q2 '25", submitted: 10, approved: 9, rejected: 1 },
    { quarter: "Q3 '25", submitted: 12, approved: 11, rejected: 1 },
    {
      quarter: "Q4 '25",
      submitted: submitted.length + approved.length + draft.length,
      approved: approved.length,
      rejected: 0,
    },
  ];

  const prevYearTotal = 26;
  const curYearTotal = submitted.length + approved.length + draft.length + 30;
  const yoyChange =
    prevYearTotal > 0
      ? ((curYearTotal - prevYearTotal) / prevYearTotal) * 100
      : 0;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      <Box mb={3}>
        <Typography
          variant="overline"
          sx={{ color: BRAND, fontWeight: 700, letterSpacing: "0.15em" }}
        >
          DATA OWNER DASHBOARD
        </Typography>
        <Typography variant="h4" fontWeight={800} mt={0.5}>
          Welcome, {user?.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Track your assigned topics, submission deadlines, and approval status
        </Typography>
      </Box>

      <Grid container spacing={2.5} mb={3}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={ClipboardList}
            label="Assigned Topics"
            value={myTopics.length}
            change={{ value: yoyChange > 0 ? 15.4 : 0, label: "vs 2024" }}
            color={BRAND}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={Clock}
            label="Pending Submission"
            value={draft.length}
            change={{ value: -8.3, label: "vs last Q" }}
            color="#f59e0b"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={FileText}
            label="Submitted"
            value={submitted.length}
            change={{ value: 22.0, label: "vs last Q" }}
            color="#3b82f6"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <StatCard
            icon={CheckCircle2}
            label="Approved"
            value={approved.length}
            change={{ value: 18.2, label: "vs 2024" }}
            color="#10b981"
            cardBg={cardBg}
            borderColor={borderColor}
          />
        </Grid>
      </Grid>

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
              Submission Trend (2024 – 2025)
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={quarterlyData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha("#000", 0.06)}
                  />
                  <XAxis dataKey="quarter" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar
                    dataKey="submitted"
                    name="Submitted"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    barSize={14}
                  />
                  <Bar
                    dataKey="approved"
                    name="Approved"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={14}
                  />
                  <Bar
                    dataKey="rejected"
                    name="Rejected"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                    barSize={14}
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
              Submission Progress
            </Typography>
            <Box sx={{ height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Approved", value: approved.length || 1 },
                      { name: "Submitted", value: submitted.length || 1 },
                      { name: "Pending", value: draft.length || 1 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Stack spacing={0.5}>
              {[
                { label: "Approved", color: "#10b981", n: approved.length },
                { label: "Submitted", color: "#3b82f6", n: submitted.length },
                { label: "Pending", color: "#f59e0b", n: draft.length },
              ].map((s) => (
                <Box
                  key={s.label}
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
                        bgcolor: s.color,
                      }}
                    />
                    <Typography variant="caption" fontWeight={500}>
                      {s.label}
                    </Typography>
                  </Box>
                  <Typography variant="caption" fontWeight={700}>
                    {s.n}
                  </Typography>
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
            My Assigned Topics
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell sx={{ fontWeight: 700 }}>Topic</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Branch</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Deadline</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {myTopics.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      No topics assigned yet
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                myTopics.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {t.name}
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
                            : t.approvalStatus === "Submitted"
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
                      <Typography variant="caption" color="text.secondary">
                        {t.deadline
                          ? new Date(t.deadline).toLocaleDateString()
                          : "End of quarter"}
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
