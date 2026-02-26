import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { Paper, Box, Typography, useTheme, alpha } from "@mui/material";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { formatScenarioCurrency } from "../../utils";
interface TornadoChartProps {
  baseCase: number;
  sensitivities: Array<{
    parameter: string;
    lowCase: number;
    hiCase: number;
    lowValue: string;
    hiValue: string;
  }>;
}
const formatCurrency = (value: number): string => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatScenarioCurrency(Math.abs(value) * 1000000)}`;
};
const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      parameter: string;
      lowValue: string;
      hiValue: string;
      lowImpact: number;
      hiImpact: number;
      totalRange: number;
    };
  }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper elevation={3} sx={{ p: 2, bgcolor: "background.paper" }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          {data.parameter}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Low Case ({data.lowValue}):{" "}
            <Typography
              component="span"
              variant="body2"
              fontWeight={600}
              color="success.main"
            >
              {formatCurrency(data.lowImpact)}
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            High Case ({data.hiValue}):{" "}
            <Typography
              component="span"
              variant="body2"
              fontWeight={600}
              color="error.main"
            >
              {formatCurrency(data.hiImpact)}
            </Typography>
          </Typography>
          <Typography variant="body2" color="primary" fontWeight={600}>
            Total Range: S {data.totalRange.toFixed(1)}M
          </Typography>
        </Box>
      </Paper>
    );
  }
  return null;
};
export const TornadoChart: React.FC<TornadoChartProps> = ({
  baseCase,
  sensitivities,
}) => {
  const theme = useTheme();
  const tornadoData = sensitivities
    .map((s) => ({
      ...s,
      lowImpact: (s.lowCase - baseCase) / 1000000,
      hiImpact: (s.hiCase - baseCase) / 1000000,
      totalRange: Math.abs(s.hiCase - s.lowCase) / 1000000,
    }))
    .sort((a, b) => b.totalRange - a.totalRange);
  const chartData = tornadoData.map((item) => ({
    parameter: item.parameter,
    lowImpact: item.lowImpact,
    hiImpact: item.hiImpact,
    lowValue: item.lowValue,
    hiValue: item.hiValue,
    totalRange: item.totalRange,
  }));
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          <span style={{ marginRight: 8, fontSize: "1.2rem" }}>🌪️</span>
          Sensitivity Analysis - Tornado Chart
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Impact on ΔECL from ±50% parameter variations - identifies key risk
          drivers
        </Typography>
      </Box>
      <Box sx={{ width: "100%", height: 500 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 20, right: 80, left: 160, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              domain={["dataMin", "dataMax"]}
              tickFormatter={(value) =>
                `${value > 0 ? "+" : ""}${value.toFixed(0)}M`
              }
              label={{
                value: "Impact on ΔECL (S millions)",
                position: "insideBottom",
                offset: -10,
                style: { fill: theme.palette.text.secondary },
              }}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <YAxis
              type="category"
              dataKey="parameter"
              width={150}
              tick={{ fill: theme.palette.text.secondary }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "transparent" }}
            />
            <ReferenceLine
              x={0}
              stroke={theme.palette.text.disabled}
              strokeWidth={2}
            />
            <Bar
              dataKey="lowImpact"
              stackId="a"
              fill={DELOITTE_COLORS.success}
              name="Downside Case"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`low-${index}`}
                  fill={DELOITTE_COLORS.success}
                  opacity={0.8}
                />
              ))}
            </Bar>
            <Bar
              dataKey="hiImpact"
              stackId="a"
              fill={DELOITTE_COLORS.error}
              name="Upside Case"
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`hi-${index}`}
                  fill={DELOITTE_COLORS.error}
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 2,
          bgcolor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.1),
          borderRadius: 2,
          border: `1px solid ${alpha(DELOITTE_COLORS.slate.DEFAULT, 0.2)}`,
        }}
      >
        <Typography
          variant="subtitle2"
          color={DELOITTE_COLORS.slate.DEFAULT}
          gutterBottom
          fontWeight={600}
        >
          🎯 Top 3 Most Sensitive Parameters:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {tornadoData.slice(0, 3).map((item, index) => (
            <Paper
              key={item.parameter}
              elevation={0}
              sx={{ p: 2, bgcolor: "background.paper" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: DELOITTE_COLORS.info,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography variant="body2" fontWeight={600}>
                    {item.parameter}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography variant="body2" fontWeight={600}>
                    Range: S {item.totalRange.toFixed(1)}M
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.lowValue} → {item.hiValue}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" color="success.main">
                  Low: {formatCurrency(item.lowImpact)}
                </Typography>
                <Typography variant="caption" color="error.main">
                  Hi: {formatCurrency(item.hiImpact)}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>
      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2,
          bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.1),
          borderLeft: `4px solid ${DELOITTE_COLORS.green.DEFAULT}`,
        }}
      >
        <Typography
          variant="subtitle2"
          color={DELOITTE_COLORS.green.dark}
          gutterBottom
        >
          💡 Risk Management Insits:
        </Typography>
        <Typography
          component="ul"
          variant="body2"
          color="text.secondary"
          sx={{ pl: 2, m: 0 }}
        >
          <li>
            Parameters with wider bars represent key uncertainty drivers
            requiring active monitoring
          </li>
          <li>
            Carbon price sensitivity indicates transition risk exposure -
            consider climate hedging strategies
          </li>
          <li>
            Physical damage sensitivity hilits importance of collateral state
            diversification
          </li>
          <li>
            GDP shock sensitivity reveals macroeconomic correlation - stress
            testing for recession scenarios
          </li>
          <li>
            Results inform risk appetite framework calibration and scenario
            selection for ICAAP
          </li>
        </Typography>
      </Paper>
    </Paper>
  );
};
