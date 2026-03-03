import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  ShieldCheck,
  Info,
  BarChart3,
} from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  type SectorConfig,
  type FinancialMetricResult,
  calculateSectorImpact,
} from "@/features/scenario-analysis/data/sectorConfig";
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
} from "recharts";

interface FinancialMetricsPanelProps {
  sector: SectorConfig;
  params: {
    carbonPrice: number;
    gdpShock: number;
    inflationShock: number;
    interestRateShock: number;
    physicalDamageIndex: number;
  };
  baselineRevenue?: number;
}

const SEVERITY_STYLES: Record<
  string,
  { bg: string; color: string; label: string }
> = {
  low: { bg: "#ECFDF5", color: "#059669", label: "Low Impact" },
  moderate: { bg: "#FFFBEB", color: "#D97706", label: "Moderate" },
  high: { bg: "#FEF2F2", color: "#DC2626", label: "High Impact" },
  critical: { bg: "#450A0A", color: "#FECACA", label: "Critical" },
};

const METRIC_ICONS: Record<string, React.ReactNode> = {
  Impact: <BarChart3 size={16} />,
  Price: <TrendingUp size={16} />,
  Quantity: <TrendingDown size={16} />,
  Revenue: <BarChart3 size={16} />,
  OpEx: <TrendingUp size={16} />,
  CapEx: <TrendingUp size={16} />,
  Insurance: <ShieldCheck size={16} />,
  PPE: <AlertTriangle size={16} />,
  CoE: <TrendingUp size={16} />,
  CoD: <TrendingUp size={16} />,
  WACC: <TrendingUp size={16} />,
};

export default function FinancialMetricsPanel({
  sector,
  params,
  baselineRevenue = 100,
}: FinancialMetricsPanelProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const metrics = calculateSectorImpact(sector, params, baselineRevenue);

  const overallImpact = metrics[0];
  const otherMetrics = metrics.slice(1);

  // Chart data for waterfall
  const chartData = otherMetrics.map((m) => ({
    name: m.shortLabel,
    value: m.percentChange,
    fill:
      m.direction === "positive"
        ? DELOITTE_COLORS.green.DEFAULT
        : m.direction === "negative"
          ? DELOITTE_COLORS.error
          : DELOITTE_COLORS.slate.DEFAULT,
  }));

  return (
    <Box>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: "12px",
          border: `1px solid ${theme.palette.divider}`,
          background: isDark
            ? `linear-gradient(135deg, ${alpha(sector.color, 0.08)} 0%, transparent 100%)`
            : `linear-gradient(135deg, ${alpha(sector.color, 0.04)} 0%, #FFFFFF 100%)`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5} mb={0.5}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "8px",
                  bgcolor: alpha(sector.color, 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <BarChart3 size={18} color={sector.color} />
              </Box>
              <Typography variant="h6" fontWeight={800}>
                Financial Metrics — {sector.name}
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Projected climate-adjusted financial impacts based on NGFS-aligned
              sector sensitivities.
            </Typography>
          </Box>
          <Paper
            elevation={0}
            sx={{
              px: 3,
              py: 2,
              borderRadius: "10px",
              border: `2px solid ${overallImpact.severity === "critical" ? DELOITTE_COLORS.error : overallImpact.severity === "high" ? "#F59E0B" : DELOITTE_COLORS.green.DEFAULT}`,
              bgcolor: alpha(
                overallImpact.severity === "critical"
                  ? DELOITTE_COLORS.error
                  : overallImpact.severity === "high"
                    ? "#F59E0B"
                    : DELOITTE_COLORS.green.DEFAULT,
                0.06,
              ),
              textAlign: "center",
              minWidth: 180,
            }}
          >
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 1 }}
            >
              Overall Climate Impact
            </Typography>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                color:
                  overallImpact.severity === "critical"
                    ? DELOITTE_COLORS.error
                    : overallImpact.severity === "high"
                      ? "#F59E0B"
                      : overallImpact.severity === "moderate"
                        ? "#D97706"
                        : DELOITTE_COLORS.green.DEFAULT,
              }}
            >
              {overallImpact.percentChange > 0 ? "+" : ""}
              {overallImpact.percentChange.toFixed(2)}%
            </Typography>
            <Chip
              label={
                SEVERITY_STYLES[overallImpact.severity]?.label || "Unknown"
              }
              size="small"
              sx={{
                mt: 0.5,
                fontWeight: 700,
                fontSize: "0.7rem",
                bgcolor: alpha(
                  overallImpact.severity === "critical"
                    ? DELOITTE_COLORS.error
                    : overallImpact.severity === "high"
                      ? "#F59E0B"
                      : DELOITTE_COLORS.green.DEFAULT,
                  0.15,
                ),
                color:
                  overallImpact.severity === "critical"
                    ? DELOITTE_COLORS.error
                    : overallImpact.severity === "high"
                      ? "#F59E0B"
                      : DELOITTE_COLORS.green.DEFAULT,
              }}
            />
          </Paper>
        </Stack>
      </Paper>

      {/* Metric Cards Grid */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {otherMetrics.map((m) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={m.metric}>
            <MetricCard metric={m} sectorColor={sector.color} />
          </Grid>
        ))}
      </Grid>

      {/* Chart */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: "12px",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Financial Impact Waterfall
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Percentage change in each financial metric under the current scenario
          configuration.
        </Typography>
        <Box sx={{ height: 320, width: "100%" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                fontSize={11}
                fontWeight={600}
                tick={{ fill: theme.palette.text.secondary }}
              />
              <YAxis
                fontSize={11}
                unit="%"
                tick={{ fill: theme.palette.text.secondary }}
              />
              <RechartsTooltip
                cursor={{ fill: alpha(theme.palette.text.primary, 0.05) }}
                contentStyle={{
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number | undefined) => [
                  `${(value ?? 0) > 0 ? "+" : ""}${(value ?? 0).toFixed(2)}%`,
                  "Change",
                ]}
              />
              <ReferenceLine y={0} stroke={theme.palette.divider} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Detailed Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: 2.5, bgcolor: alpha(sector.color, 0.03) }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Detailed Financial Impact Analysis
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Comprehensive breakdown of climate-adjusted projections for{" "}
            {sector.name}.
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: isDark ? alpha("#000", 0.2) : alpha("#000", 0.03),
                }}
              >
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                  Financial Metric
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, fontSize: 12 }}
                >
                  Direction
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12 }}>
                  Change
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, fontSize: 12 }}
                >
                  Severity
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>
                  Description
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {metrics.map((m) => {
                const sevStyle =
                  SEVERITY_STYLES[m.severity] || SEVERITY_STYLES.low;
                return (
                  <TableRow
                    key={m.metric}
                    hover
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(sector.color, 0.02),
                      },
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Box
                          sx={{
                            color:
                              m.direction === "positive"
                                ? DELOITTE_COLORS.green.DEFAULT
                                : m.direction === "negative"
                                  ? DELOITTE_COLORS.error
                                  : theme.palette.text.secondary,
                          }}
                        >
                          {METRIC_ICONS[m.shortLabel] || <Minus size={16} />}
                        </Box>
                        <Typography variant="body2" fontWeight={600}>
                          {m.metric}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      {m.direction === "positive" ? (
                        <TrendingUp
                          size={16}
                          color={DELOITTE_COLORS.green.DEFAULT}
                        />
                      ) : m.direction === "negative" ? (
                        <TrendingDown size={16} color={DELOITTE_COLORS.error} />
                      ) : (
                        <Minus size={16} color={theme.palette.text.secondary} />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          color:
                            m.direction === "positive"
                              ? DELOITTE_COLORS.green.DEFAULT
                              : m.direction === "negative"
                                ? DELOITTE_COLORS.error
                                : theme.palette.text.primary,
                        }}
                      >
                        {m.unit === "bps"
                          ? `${m.absoluteChange > 0 ? "+" : ""}${m.absoluteChange.toFixed(0)} bps`
                          : `${m.percentChange > 0 ? "+" : ""}${m.percentChange.toFixed(2)}%`}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={sevStyle.label}
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          bgcolor: isDark
                            ? alpha(sevStyle.color, 0.2)
                            : sevStyle.bg,
                          color: sevStyle.color,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title={m.description} arrow>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            cursor: "help",
                          }}
                        >
                          {m.description}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Sector Profile Footer */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mt: 3,
          borderRadius: "12px",
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.text.primary, 0.02),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
          <Info size={16} color={theme.palette.text.secondary} />
          <Typography variant="subtitle2" fontWeight={700}>
            Sector Financial Profile — {sector.name}
          </Typography>
        </Stack>
        <Divider sx={{ mb: 1.5 }} />
        <Grid container spacing={2}>
          {[
            {
              label: "Gross Margin",
              value: `${(sector.financialProfile.grossMargin * 100).toFixed(0)}%`,
            },
            {
              label: "Operating Margin",
              value: `${(sector.financialProfile.operatingMargin * 100).toFixed(0)}%`,
            },
            {
              label: "D/E Ratio",
              value: `${sector.financialProfile.debtToEquity.toFixed(1)}x`,
            },
            {
              label: "Cost of Equity",
              value: `${(sector.financialProfile.costOfEquity * 100).toFixed(1)}%`,
            },
            {
              label: "Cost of Debt",
              value: `${(sector.financialProfile.costOfDebt * 100).toFixed(1)}%`,
            },
            {
              label: "Equity Weight",
              value: `${(sector.financialProfile.equityWeight * 100).toFixed(0)}%`,
            },
            {
              label: "CapEx / Revenue",
              value: `${(sector.financialProfile.capexToRevenue * 100).toFixed(0)}%`,
            },
            {
              label: "PPE / Assets",
              value: `${(sector.financialProfile.ppeToAssets * 100).toFixed(0)}%`,
            },
          ].map((item) => (
            <Grid size={{ xs: 6, sm: 3, lg: 1.5 }} key={item.label}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.65rem", display: "block" }}
              >
                {item.label}
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {item.value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}

function MetricCard({
  metric,
  sectorColor,
}: {
  metric: FinancialMetricResult;
  sectorColor: string;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const sevStyle = SEVERITY_STYLES[metric.severity] || SEVERITY_STYLES.low;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        height: "100%",
        borderRadius: "10px",
        border: `1px solid ${theme.palette.divider}`,
        borderTop: `3px solid ${metric.direction === "positive" ? DELOITTE_COLORS.green.DEFAULT : metric.direction === "negative" ? DELOITTE_COLORS.error : theme.palette.divider}`,
        transition: "all 0.2s",
        "&:hover": {
          boxShadow: `0 4px 12px ${alpha(sectorColor, 0.1)}`,
          transform: "translateY(-2px)",
        },
      }}
    >
      <Stack spacing={1}>
        <Typography
          variant="caption"
          fontWeight={700}
          color="text.secondary"
          sx={{
            textTransform: "uppercase",
            letterSpacing: 0.5,
            fontSize: "0.65rem",
          }}
        >
          {metric.metric}
        </Typography>
        <Stack direction="row" alignItems="baseline" spacing={0.5}>
          <Typography
            variant="h5"
            fontWeight={800}
            sx={{
              color:
                metric.direction === "positive"
                  ? DELOITTE_COLORS.green.DEFAULT
                  : metric.direction === "negative"
                    ? DELOITTE_COLORS.error
                    : theme.palette.text.primary,
            }}
          >
            {metric.unit === "bps"
              ? `${metric.absoluteChange > 0 ? "+" : ""}${metric.absoluteChange.toFixed(0)}`
              : `${metric.percentChange > 0 ? "+" : ""}${metric.percentChange.toFixed(2)}`}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {metric.unit}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              px: 0.8,
              py: 0.3,
              borderRadius: "4px",
              bgcolor: isDark ? alpha(sevStyle.color, 0.15) : sevStyle.bg,
            }}
          >
            {metric.direction === "positive" ? (
              <TrendingUp size={12} color={DELOITTE_COLORS.green.DEFAULT} />
            ) : metric.direction === "negative" ? (
              <TrendingDown size={12} color={DELOITTE_COLORS.error} />
            ) : (
              <Minus size={12} color={theme.palette.text.secondary} />
            )}
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ fontSize: "0.65rem", color: sevStyle.color }}
            >
              {sevStyle.label}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}
