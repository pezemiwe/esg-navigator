import React, { useMemo } from "react";
import { Box, Typography, Paper, Grid, useTheme, alpha } from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { formatScenarioCurrency } from "../../utils";
interface VaRDistributionChartProps {
  varResult: {
    var99_9: number;
    expectedLoss: number;
    unexpectedLoss: number;
    confidenceLevel: number;
  };
  monteCarloCATResults?: {
    trials: number;
    meanLoss: number;
    var99_9: number;
    maxLoss: number;
    simulatedLosses?: number[];
    eventBreakdown: Array<{
      eventType: string;
      frequency: number;
      averageSeverity: number;
      totalLoss: number;
    }>;
  };
}
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: { loss: number; density: number; isTail: boolean };
  }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper elevation={3} sx={{ p: 2, bgcolor: "background.paper" }}>
        <Typography variant="subtitle2" fontWeight={600}>
          Loss: {formatScenarioCurrency(data.loss * 1000000)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {data.isTail ? "Tail Risk (>99.9% VaR)" : "Expected Range"}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Density: {data.density.toFixed(4)}
        </Typography>
      </Paper>
    );
  }
  return null;
};
export const VaRDistributionChart: React.FC<VaRDistributionChartProps> = ({
  varResult,
  monteCarloCATResults,
}) => {
  const theme = useTheme();
  const distributionData = useMemo(() => {
    if (
      monteCarloCATResults?.simulatedLosses &&
      monteCarloCATResults.simulatedLosses.length > 0
    ) {
      const losses = monteCarloCATResults.simulatedLosses.map(
        (l) => l / 1000000,
      );
      const riskMax = Math.max(...losses);
      const riskMin = Math.min(...losses);
      const max = riskMax > 0 ? riskMax * 1.1 : 10;
      const min = Math.max(0, riskMin * 0.9);
      const binCount = 40;
      const binSize = (max - min) / binCount;
      const bins = new Array(binCount).fill(0);
      losses.forEach((l) => {
        const binIndex = Math.min(
          Math.floor((l - min) / binSize),
          binCount - 1,
        );
        bins[binIndex]++;
      });
      const varThresholdM = varResult.var99_9 / 1000000;
      return bins.map((count, i) => {
        const x = min + (i + 0.5) * binSize;
        const density = count / losses.length / (binSize || 1);
        return {
          loss: x,
          density: density,
          isTail: x > varThresholdM,
        };
      });
    }
    const mean = varResult.expectedLoss / 1000000;
    let stdDev = varResult.unexpectedLoss / 3 / 1000000;
    if (stdDev <= 0.01) {
      stdDev = Math.max(mean * 0.05, 0.1);
    }
    const points = 100;
    const data = [];
    const rangeSigma = 4.5;
    for (let i = 0; i <= points; i++) {
      const x = mean + stdDev * ((i / points) * 2 * rangeSigma - rangeSigma);
      const z = (x - mean) / stdDev;
      const y = Math.exp(-0.5 * z * z) / (stdDev * Math.sqrt(2 * Math.PI));
      const varThresholdM = varResult.var99_9 / 1000000;
      data.push({
        loss: x,
        density: y,
        isTail: x > varThresholdM,
      });
    }
    return data;
  }, [varResult, monteCarloCATResults]);
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          <span style={{ marginRight: 8, fontSize: "1.2rem" }}>📈</span>
          Value at Risk (VaR) Distribution
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Loss distribution with 99.9% VaR threshold - Basel III capital
          adequacy requirement
        </Typography>
      </Box>
      <Box sx={{ width: "100%", height: 350 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={distributionData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="loss"
              label={{
                value: "Potential Loss (S millions)",
                position: "insideBottom",
                offset: -10,
                style: { fill: theme.palette.text.secondary },
              }}
              tickFormatter={(value) => value.toFixed(0)}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis
              label={{
                value: "Probability Density",
                angle: -90,
                position: "insideLeft",
                style: { fill: theme.palette.text.secondary },
              }}
              tickFormatter={(value) => value.toFixed(2)}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Area
              type="monotone"
              dataKey="density"
              stroke={DELOITTE_COLORS.green.DEFAULT}
              fill={`url(#colorDensity)`}
              fillOpacity={0.6}
              name="Loss Probability"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorDensity" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={DELOITTE_COLORS.green.DEFAULT}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={DELOITTE_COLORS.green.DEFAULT}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <ReferenceLine
              x={varResult.var99_9 / 1000000}
              stroke={DELOITTE_COLORS.error}
              strokeWidth={2}
              strokeDasharray="5 5"
              label={{
                value: `99.9% VaR: ${formatScenarioCurrency(varResult.var99_9)}`,
                position: "top",
                fill: DELOITTE_COLORS.error,
                fontWeight: "bold",
                fontSize: 12,
              }}
            />
            <ReferenceLine
              x={varResult.expectedLoss / 1000000}
              stroke={DELOITTE_COLORS.success}
              strokeWidth={2}
              label={{
                value: `EL: ${formatScenarioCurrency(varResult.expectedLoss)}`,
                position: "top",
                fill: DELOITTE_COLORS.success,
                fontWeight: "bold",
                fontSize: 12,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(DELOITTE_COLORS.success, 0.1),
              border: `1px solid ${alpha(DELOITTE_COLORS.success, 0.3)}`,
            }}
          >
            <Typography
              variant="caption"
              color={alpha(DELOITTE_COLORS.success, 0.9)}
              fontWeight={600}
            >
              EXPECTED LOSS
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ color: DELOITTE_COLORS.success, my: 0.5 }}
            >
              {formatScenarioCurrency(varResult.expectedLoss)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mean of distribution
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.1),
              border: `1px solid ${alpha(DELOITTE_COLORS.green.DEFAULT, 0.3)}`,
            }}
          >
            <Typography
              variant="caption"
              color={DELOITTE_COLORS.green.dark}
              fontWeight={600}
            >
              UNEXPECTED LOSS
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ color: DELOITTE_COLORS.green.dark, my: 0.5 }}
            >
              {formatScenarioCurrency(varResult.unexpectedLoss)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              VaR - Expected Loss
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(DELOITTE_COLORS.error, 0.1),
              border: `1px solid ${alpha(DELOITTE_COLORS.error, 0.3)}`,
            }}
          >
            <Typography variant="caption" color="error" fontWeight={600}>
              99.9% VaR
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ color: DELOITTE_COLORS.error, my: 0.5 }}
            >
              {formatScenarioCurrency(varResult.var99_9)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Capital buffer requirement
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      {monteCarloCATResults && (
        <Paper variant="outlined" sx={{ mt: 3, p: 2 }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
          >
            <span>🌪️</span>
            Catastrophic Event Simulation (
            {monteCarloCATResults.trials.toLocaleString()} trials)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Mean Loss
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatScenarioCurrency(monteCarloCATResults.meanLoss)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                CAT VaR (99.9%)
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatScenarioCurrency(monteCarloCATResults.var99_9)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Maximum Loss
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {formatScenarioCurrency(monteCarloCATResults.maxLoss)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Most Frequent
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {monteCarloCATResults.eventBreakdown[0]?.eventType || "N/A"}
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {monteCarloCATResults.eventBreakdown.map((event) => (
              <Box
                key={event.eventType}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 1,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {event.eventType}
                </Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Typography variant="caption">
                    Freq: {event.frequency.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption">
                    Avg Severity:{" "}
                    {formatScenarioCurrency(event.averageSeverity)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2,
          bgcolor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.1),
          borderLeft: `4px solid ${DELOITTE_COLORS.slate.DEFAULT}`,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: DELOITTE_COLORS.slate.DEFAULT }}
          gutterBottom
        >
          📋 Regulatory Context:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Central Bank of Nigeria requires banks to hold capital for unexpected losses at
          99.9% confidence level under Basel III framework. VaR informs Pillar 2
          climate risk capital add-ons in ICAAP submissions.
        </Typography>
      </Paper>
    </Paper>
  );
};
