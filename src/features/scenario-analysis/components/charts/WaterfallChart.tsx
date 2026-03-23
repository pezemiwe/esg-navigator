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
  LabelList,
} from "recharts";
import { Paper, Box, Typography, useTheme, Grid, alpha } from "@mui/material";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { formatScenarioCurrency } from "../../utils";

interface WaterfallChartProps {
  baselineECL: number;
  stressedECL: number;
  pdUplift: number;
  lgdUplift: number;
  interactionEffect: number;
}

const COLORS = {
  baseline: DELOITTE_COLORS.success,
  pdUplift: "#F59E0B",
  lgdUplift: "#EF4444",
  interaction: "#8B5CF6",
  stressed: "#DC2626",
  connector: "#94A3B8",
};

const WaterfallTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      label: string;
      base: number;
      value: number;
      total: number;
      delta: number;
      color: string;
      isTotal: boolean;
    };
  }>;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;
    return (
      <Paper
        elevation={4}
        sx={{ p: 2, bgcolor: "background.paper", minWidth: 180 }}
      >
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          {data.label}
        </Typography>
        {data.isTotal ? (
          <Typography variant="body2" color="text.secondary">
            Total ECL:{" "}
            <Typography
              component="span"
              variant="body2"
              fontWeight={700}
              color="text.primary"
            >
              {formatScenarioCurrency(data.total * 1000000)}
            </Typography>
          </Typography>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Impact:{" "}
              <Typography
                component="span"
                variant="body2"
                fontWeight={700}
                color={data.delta >= 0 ? "error.main" : "success.main"}
              >
                {data.delta >= 0 ? "+" : ""}
                {formatScenarioCurrency(data.delta * 1000000)}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cumulative:{" "}
              <Typography
                component="span"
                variant="body2"
                fontWeight={700}
                color="text.primary"
              >
                {formatScenarioCurrency(data.total * 1000000)}
              </Typography>
            </Typography>
          </Box>
        )}
      </Paper>
    );
  }
  return null;
};
export const WaterfallChart: React.FC<WaterfallChartProps> = ({
  baselineECL,
  stressedECL,
  pdUplift,
  lgdUplift,
  interactionEffect,
}) => {
  const theme = useTheme();

  const bM = baselineECL / 1000000;
  const pdM = pdUplift / 1000000;
  const lgdM = lgdUplift / 1000000;
  const intM = interactionEffect / 1000000;
  const sM = stressedECL / 1000000;

  const deltaECL = stressedECL - baselineECL;
  const percentIncrease = ((deltaECL / baselineECL) * 100).toFixed(1);

  const waterfallData = [
    {
      name: "Baseline ECL",
      label: "Baseline ECL",
      base: 0,
      value: bM,
      total: bM,
      delta: bM,
      color: COLORS.baseline,
      isTotal: true,
    },
    {
      name: "PD Uplift",
      label: "PD Uplift",
      base: bM,
      value: pdM,
      total: bM + pdM,
      delta: pdM,
      color: COLORS.pdUplift,
      isTotal: false,
    },
    {
      name: "LGD Uplift",
      label: "LGD Uplift",
      base: bM + pdM,
      value: lgdM,
      total: bM + pdM + lgdM,
      delta: lgdM,
      color: COLORS.lgdUplift,
      isTotal: false,
    },
    {
      name: "Interaction",
      label: "Interaction Effect",
      base: bM + pdM + lgdM,
      value: intM,
      total: bM + pdM + lgdM + intM,
      delta: intM,
      color: COLORS.interaction,
      isTotal: false,
    },
    {
      name: "Stressed ECL",
      label: "Stressed ECL",
      base: 0,
      value: sM,
      total: sM,
      delta: sM,
      color: COLORS.stressed,
      isTotal: true,
    },
  ];

  const maxVal = Math.max(sM, bM) * 1.18;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          <span style={{ marginRight: 8, fontSize: "1.2rem" }}>🌊</span>
          ECL Waterfall Attribution
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Breakdown of ECL increase from baseline to stressed scenario — ana
          portfolio
        </Typography>
      </Box>

      <Box sx={{ width: "100%", height: 450 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={waterfallData}
            margin={{ top: 30, right: 30, left: 20, bottom: 20 }}
            barCategoryGap="20%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal={true}
              vertical={false}
              stroke={alpha(theme.palette.text.secondary, 0.15)}
            />
            <XAxis
              dataKey="name"
              height={40}
              interval={0}
              tick={{
                fill: theme.palette.text.secondary,
                fontSize: 12,
                fontWeight: 600,
              }}
              tickLine={false}
              axisLine={{ stroke: alpha(theme.palette.text.secondary, 0.2) }}
            />
            <YAxis
              domain={[0, maxVal]}
              label={{
                value: "ECL (S millions)",
                angle: -90,
                position: "insideLeft",
                style: {
                  fill: theme.palette.text.secondary,
                  fontSize: 12,
                },
              }}
              tickFormatter={(v: number) => `${v.toFixed(0)}M`}
              tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
              axisLine={{ stroke: alpha(theme.palette.text.secondary, 0.2) }}
              tickLine={false}
            />
            <Tooltip
              content={<WaterfallTooltip />}
              cursor={{ fill: alpha(theme.palette.text.primary, 0.04) }}
            />

            <Bar
              dataKey="base"
              stackId="waterfall"
              fill="transparent"
              isAnimationActive={false}
            />

            <Bar
              dataKey="value"
              stackId="waterfall"
              isAnimationActive={true}
              animationDuration={800}
              radius={[3, 3, 0, 0]}
            >
              {waterfallData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                content={(props) => {
                  const { x, y, width, index } = props as {
                    x: number;
                    y: number;
                    width: number;
                    index: number;
                  };
                  const entry = waterfallData[index];
                  if (!entry) return null;
                  const lbl = entry.isTotal
                    ? formatScenarioCurrency(entry.value * 1000000)
                    : `+${formatScenarioCurrency(entry.value * 1000000)}`;
                  return (
                    <text
                      x={(x || 0) + (width || 0) / 2}
                      y={(y || 0) - 8}
                      textAnchor="middle"
                      fill={entry.color}
                      fontSize={11}
                      fontWeight={700}
                    >
                      {lbl}
                    </text>
                  );
                }}
              />
            </Bar>

            <ReferenceLine
              y={sM}
              stroke={COLORS.stressed}
              strokeWidth={1.5}
              strokeDasharray="6 4"
              label={{
                value: `Stressed: ${formatScenarioCurrency(stressedECL)}`,
                position: "right",
                fill: COLORS.stressed,
                fontWeight: "bold",
                fontSize: 11,
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(COLORS.baseline, 0.1),
              border: `1px solid ${alpha(COLORS.baseline, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              color={COLORS.baseline}
              fontWeight={600}
            >
              Baseline ECL
            </Typography>
            <Typography variant="h6" fontWeight={800} color={COLORS.baseline}>
              {formatScenarioCurrency(baselineECL)}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(COLORS.pdUplift, 0.1),
              border: `1px solid ${alpha(COLORS.pdUplift, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              color={COLORS.pdUplift}
              fontWeight={600}
            >
              PD Impact
            </Typography>
            <Typography variant="h6" fontWeight={800} color={COLORS.pdUplift}>
              +{formatScenarioCurrency(pdUplift)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {deltaECL > 0 ? ((pdUplift / deltaECL) * 100).toFixed(0) : "0"}%
              of ΔECL
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(COLORS.lgdUplift, 0.1),
              border: `1px solid ${alpha(COLORS.lgdUplift, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              color={COLORS.lgdUplift}
              fontWeight={600}
            >
              LGD Impact
            </Typography>
            <Typography variant="h6" fontWeight={800} color={COLORS.lgdUplift}>
              +{formatScenarioCurrency(lgdUplift)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {deltaECL > 0 ? ((lgdUplift / deltaECL) * 100).toFixed(0) : "0"}%
              of ΔECL
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              bgcolor: alpha(COLORS.interaction, 0.1),
              border: `1px solid ${alpha(COLORS.interaction, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="caption"
              color={COLORS.interaction}
              fontWeight={600}
            >
              Interaction
            </Typography>
            <Typography
              variant="h6"
              fontWeight={800}
              color={COLORS.interaction}
            >
              +{formatScenarioCurrency(interactionEffect)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {deltaECL > 0
                ? ((interactionEffect / deltaECL) * 100).toFixed(0)
                : "0"}
              % of ΔECL
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          mt: 3,
          p: 2,
          bgcolor: alpha(COLORS.stressed, 0.08),
          borderLeft: `4px solid ${COLORS.stressed}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 1,
        }}
      >
        <Box>
          <Typography variant="subtitle1" fontWeight={700} color="error.dark">
            Total ECL Increase (ΔECL)
          </Typography>
          <Typography variant="body2" color="error.main">
            From {formatScenarioCurrency(baselineECL)} to{" "}
            {formatScenarioCurrency(stressedECL)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h4" fontWeight={800} color="error.dark">
            +{formatScenarioCurrency(deltaECL)}
          </Typography>
          <Typography variant="body2" color="error.main" fontWeight={600}>
            +{percentIncrease}%
          </Typography>
        </Box>
      </Paper>
      <Paper
        elevation={0}
        sx={{
          mt: 4,
          p: 2,
          bgcolor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.08),
          borderLeft: `4px solid ${DELOITTE_COLORS.slate.DEFAULT}`,
          borderRadius: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: DELOITTE_COLORS.slate.DEFAULT }}
          gutterBottom
        >
          📘 Methodology:
        </Typography>
        <Typography
          component="ul"
          variant="body2"
          color="text.secondary"
          sx={{ pl: 2, m: 0 }}
        >
          <li>
            <Typography component="span" fontWeight={600}>
              PD Uplift:{" "}
            </Typography>
            Impact from probability of default increases due to carbon pricing
            and GDP shocks (logit transformation with calibrated sector betas)
          </li>
          <li>
            <Typography component="span" fontWeight={600}>
              LGD Uplift:{" "}
            </Typography>
            Impact from loss given default increases due to physical damage to
            collateral (state × collateral type factors)
          </li>
          <li>
            <Typography component="span" fontWeight={600}>
              Interaction:{" "}
            </Typography>
            Non-linear effects from combined PD and LGD stresses (ECL = EAD × PD
            × LGD formula)
          </li>
          <li>
            Calculations follow IFRS 9 expected credit loss framework with NGFS
            scenario inputs
          </li>
        </Typography>
      </Paper>
    </Paper>
  );
};
