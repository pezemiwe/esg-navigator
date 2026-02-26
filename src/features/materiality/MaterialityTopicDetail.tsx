import { useMemo } from "react";
import MaterialityLayout from "./layout/MaterialityLayout";
import { useMaterialityStore } from "@/store/materialityStore";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Paper,
  alpha,
} from "@mui/material";
import {
  ArrowBack as ArrowLeftIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  DataUsage as DataUsageIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { DELOITTE_COLORS } from "@/config/colors.config";

const CHART_COLORS = [
  "#86BC25",
  "#000000",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const fmtVal = (v: number, unit: string) => {
  if (unit.toLowerCase().includes("") || unit.toLowerCase().includes("NGN")) {
    return v >= 1e9
      ? `₦${(v / 1e9).toFixed(1)}B`
      : v >= 1e6
        ? `₦${(v / 1e6).toFixed(1)}M`
        : `₦${v.toLocaleString()}`;
  }
  return v >= 1e6
    ? `${(v / 1e6).toFixed(1)}M`
    : v >= 1e3
      ? `${(v / 1e3).toFixed(1)}K`
      : v.toLocaleString();
};

export default function MaterialityTopicDetail() {
  const { id } = useParams();
  const { topics, inputs } = useMaterialityStore();
  const navigate = useNavigate();

  const topic = topics.find((t) => t.id === id);

  const topicInputs = inputs.filter((i) => i.topicId === (topic?.id ?? ""));

  const chartData = useMemo(() => {
    if (!topic) return [];
    return topic.dataNeeds.map((need) => {
      const inputId = `${topic.id}-${need}`;
      const input = topicInputs.find((i) => i.id === inputId);
      const numericValue = input ? parseFloat(String(input.value)) : 0;
      return {
        name: need.length > 20 ? need.slice(0, 18) + "…" : need,
        fullName: need,
        value: isNaN(numericValue) ? 0 : numericValue,
        unit: input?.unit || "",
        period: input?.period || "FY 2025",
      };
    });
  }, [topic, topicInputs]);

  if (!topic) {
    return <Box p={4}>Topic not found</Box>;
  }

  const hasData = chartData.some((d) => d.value > 0);
  const filledMetrics = chartData.filter((d) => d.value > 0).length;
  const totalMetrics = chartData.length;
  const completeness =
    totalMetrics > 0 ? Math.round((filledMetrics / totalMetrics) * 100) : 0;

  const primaryMetric = chartData.find((d) => d.value > 0) || chartData[0];
  const primaryValue = primaryMetric?.value || 0;
  const primaryUnit = primaryMetric?.unit || "";

  const gaugeData = [
    {
      name: "Completeness",
      value: completeness,
      fill: DELOITTE_COLORS.primary.DEFAULT,
    },
  ];

  return (
    <MaterialityLayout>
      <Box p={4} maxWidth="1400px" mx="auto" width="100%">
        <Box
          mb={4}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Button
              startIcon={<ArrowLeftIcon />}
              onClick={() => navigate("/materiality")}
              sx={{ color: "text.secondary" }}
            >
              Back
            </Button>
            <Divider orientation="vertical" flexItem />
            <div>
              <Typography variant="h5" fontWeight="bold">
                {topic.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Metrics:</strong> {topic.dataNeeds.join(" • ")}
              </Typography>
            </div>
          </Box>
          <Box display="flex" gap={2}>
            <Button
              startIcon={<ShareIcon sx={{ fontSize: 18 }} />}
              variant="outlined"
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Share
            </Button>
            <Button
              startIcon={<DownloadIcon sx={{ fontSize: 18 }} />}
              variant="contained"
              sx={{
                bgcolor: "#86BC25",
                color: "black",
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": { bgcolor: "#e0a20f" },
              }}
            >
              Export Summary
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                height: "100%",
                bgcolor: "#000",
                color: "#fff",
                position: "relative",
                overflow: "hidden",
                borderRadius: "12px",
              }}
            >
              <Typography
                variant="overline"
                fontSize={11}
                fontWeight="bold"
                sx={{
                  color: DELOITTE_COLORS.primary.DEFAULT,
                  letterSpacing: "0.1em",
                }}
              >
                PRIMARY METRIC
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                my={1}
                sx={{ color: DELOITTE_COLORS.primary.DEFAULT }}
              >
                {hasData ? fmtVal(primaryValue, primaryUnit) : "—"}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {primaryMetric?.fullName || topic.dataNeeds[0]}
                {primaryUnit && ` (${primaryUnit})`}
              </Typography>
              <Box
                sx={{
                  position: "absolute",
                  right: -20,
                  bottom: -20,
                  opacity: 0.08,
                }}
              >
                <TrendingUpIcon
                  sx={{ fontSize: 120, color: DELOITTE_COLORS.primary.DEFAULT }}
                />
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{ p: 3, height: "100%", borderRadius: "12px" }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight="bold"
                fontSize={11}
              >
                DATA COMPLETENESS
              </Typography>
              <Box display="flex" alignItems="center" gap={2} my={1}>
                <Typography
                  variant="h3"
                  fontWeight="bold"
                  sx={{
                    color:
                      completeness >= 80
                        ? "#10b981"
                        : completeness >= 50
                          ? "#f59e0b"
                          : "#ef4444",
                  }}
                >
                  {completeness}%
                </Typography>
                <DataUsageIcon sx={{ fontSize: 28, color: "#94a3b8" }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {filledMetrics} of {totalMetrics} metrics have data
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{ p: 3, height: "100%", borderRadius: "12px" }}
            >
              <Typography
                variant="overline"
                color="text.secondary"
                fontWeight="bold"
                fontSize={11}
              >
                TOTAL METRICS VALUE
              </Typography>
              <Box display="flex" alignItems="center" gap={2} my={1}>
                <Typography variant="h3" fontWeight="bold">
                  {fmtVal(
                    chartData.reduce((sum, d) => sum + d.value, 0),
                    primaryUnit,
                  )}
                </Typography>
                <AssessmentIcon
                  sx={{ fontSize: 28, color: DELOITTE_COLORS.primary.DEFAULT }}
                />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Sum of all reported metric values
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {!hasData ? (
          <Paper
            variant="outlined"
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: "12px",
              bgcolor: alpha(DELOITTE_COLORS.primary.DEFAULT, 0.03),
            }}
          >
            <AssessmentIcon sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              No Data Submitted Yet
            </Typography>
            <Typography color="text.secondary" maxWidth={500} mx="auto" mb={3}>
              Go to Data Input (Step 2) and enter values for the metrics in this
              topic to generate visualizations.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/materiality/data-input")}
              sx={{
                bgcolor: DELOITTE_COLORS.primary.DEFAULT,
                color: "#000",
                textTransform: "none",
                fontWeight: 700,
                borderRadius: "8px",
                "&:hover": { bgcolor: "#e0a20f" },
              }}
            >
              Go to Data Input
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <Card
                variant="outlined"
                sx={{ height: "100%", borderRadius: "12px" }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={4}>
                    {topic.name} — Metric Breakdown
                  </Typography>
                  <Box height={400}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          angle={-25}
                          textAnchor="end"
                          fontSize={11}
                        />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(v: number | string | undefined) =>
                            Number(v ?? 0).toLocaleString()
                          }
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={50}>
                          {chartData.map((_e, i) => (
                            <Cell
                              key={i}
                              fill={CHART_COLORS[i % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: "12px", mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={2}>
                    Distribution
                  </Typography>
                  <Box height={220}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData.filter((d) => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData
                            .filter((d) => d.value > 0)
                            .map((_e, i) => (
                              <Cell
                                key={i}
                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                              />
                            ))}
                        </Pie>
                        <Tooltip
                          formatter={(v: number | string | undefined) =>
                            Number(v ?? 0).toLocaleString()
                          }
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ borderRadius: "12px" }}>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                    Data Quality
                  </Typography>
                  <Box height={120}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="60%"
                        outerRadius="90%"
                        barSize={12}
                        data={gaugeData}
                        startAngle={180}
                        endAngle={0}
                      >
                        <RadialBar
                          background
                          dataKey="value"
                          cornerRadius={6}
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      mt: -3,
                      color: completeness >= 80 ? "#10b981" : "#f59e0b",
                    }}
                  >
                    {completeness}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Completeness
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Card
                variant="outlined"
                sx={{ borderRadius: "12px", bgcolor: alpha("#000", 0.02) }}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    AI-Driven Insits
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          sx={{ color: DELOITTE_COLORS.primary.DEFAULT }}
                          mb={1}
                        >
                          KEY OBSERVATION
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          The highest-value metric is{" "}
                          <strong>{primaryMetric?.fullName}</strong> at{" "}
                          {fmtVal(primaryValue, primaryUnit)}, accounting for{" "}
                          {chartData.reduce((s, d) => s + d.value, 0) > 0
                            ? Math.round(
                                (primaryValue /
                                  chartData.reduce((s, d) => s + d.value, 0)) *
                                  100,
                              )
                            : 0}
                          % of total reported values for this topic.
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="warning.main"
                          mb={1}
                        >
                          DATA GAP
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {totalMetrics - filledMetrics > 0
                            ? `${totalMetrics - filledMetrics} metric(s) are missing data: ${chartData
                                .filter((d) => d.value === 0)
                                .map((d) => d.fullName)
                                .join(
                                  ", ",
                                )}. Consider completing these for a comprehensive assessment.`
                            : "All metrics have been populated. Data coverage is complete for this reporting cycle."}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: "8px",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight="bold"
                          color="success.main"
                          mb={1}
                        >
                          RECOMMENDATION
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {completeness >= 80
                            ? "Excellent data coverage. This topic is ready for board-level reporting and external disclosure."
                            : completeness >= 50
                              ? "Good progress on data collection. Prioritize filling remaining gaps to meet IFRS S2 and GRI disclosure requirements."
                              : "Data collection for this topic is in early stages. Engage relevant business units to provide quantitative evidence."}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        <Box mt={4}>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            Evidence & Notes
          </Typography>
          <Paper
            variant="outlined"
            sx={{ borderRadius: "12px", overflow: "hidden" }}
          >
            <Box
              p={2}
              borderBottom="1px solid"
              borderColor="divider"
              display="grid"
              gridTemplateColumns="1fr 1fr 0.6fr 0.6fr 1fr"
              fontWeight="bold"
              color="text.secondary"
              fontSize={13}
              bgcolor={alpha("#000", 0.02)}
            >
              <Box>Metric</Box>
              <Box>Value</Box>
              <Box>Unit</Box>
              <Box>Period</Box>
              <Box>Notes</Box>
            </Box>
            {topic.dataNeeds.map((need, i) => {
              const inputId = `${topic.id}-${need}`;
              const input = topicInputs.find((inp) => inp.id === inputId);
              return (
                <Box
                  key={i}
                  p={2}
                  borderBottom="1px solid"
                  borderColor="divider"
                  display="grid"
                  gridTemplateColumns="1fr 1fr 0.6fr 0.6fr 1fr"
                  fontSize={14}
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(DELOITTE_COLORS.primary.DEFAULT, 0.03),
                    },
                  }}
                >
                  <Box fontWeight="medium">{need}</Box>
                  <Box fontWeight="bold">{input?.value || "—"}</Box>
                  <Box color="text.secondary">{input?.unit || "—"}</Box>
                  <Box color="text.secondary">{input?.period || "—"}</Box>
                  <Box color="text.secondary">{input?.notes || "—"}</Box>
                </Box>
              );
            })}
          </Paper>
        </Box>
      </Box>
    </MaterialityLayout>
  );
}
