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
import { Paper, Box, Typography, useTheme, alpha, Stack } from "@mui/material";
import { formatDollarM } from "../../utils";
import type { TelecomResults } from "@/store/scenarioStore";

interface TelecomWaterfallChartProps {
  telecom: TelecomResults;
}

/* ─── Colour palette (muted, professional) ─── */
const COLORS = {
  baseline: "#22C55E",
  carbon: "#EF4444",
  ccus: "#F59E0B",
  flaring: "#A855F7",
  chronic: "#EC4899",
  emergency: "#06B6D4",
  defensive: "#3B82F6",
  stressed: "#DC2626",
  connector: "#CBD5E1",
};

/* ─── Custom Tooltip ─── */
const WaterfallTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
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
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <Paper
      elevation={3}
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: 2,
        minWidth: 180,
        border: `1px solid`,
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} gutterBottom>
        {d.label}
      </Typography>
      {d.isTotal ? (
        <Typography variant="body2" color="text.secondary">
          NPV:{" "}
          <Typography
            component="span"
            variant="body2"
            fontWeight={700}
            color="text.primary"
          >
            {formatDollarM(d.total)}
          </Typography>
        </Typography>
      ) : (
        <Stack spacing={0.25}>
          <Typography variant="body2" color="text.secondary">
            Climate cost:{" "}
            <Typography component="span" fontWeight={700} color="error.main">
              -{formatDollarM(Math.abs(d.delta))}
            </Typography>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Remaining NPV:{" "}
            <Typography component="span" fontWeight={700} color="text.primary">
              {formatDollarM(d.total)}
            </Typography>
          </Typography>
        </Stack>
      )}
    </Paper>
  );
};

export const TelecomWaterfallChart: React.FC<TelecomWaterfallChartProps> = ({
  telecom,
}) => {
  const theme = useTheme();

  const cb = telecom.costBreakdown;
  const baseline = telecom.baselineNPV;

  /* Build the waterfall steps —
     Each step subtracts its share of NPV erosion.
     We scale cost-breakdown amounts proportionally so they sum to deltaNPV. */
  const totalRawCosts =
    cb.carbonTax +
    cb.ccus +
    cb.flaringPenalty +
    cb.chronicOpEx +
    cb.emergencyCapEx +
    cb.defensiveCapEx;
  const absImpact = Math.abs(telecom.deltaNPV); // positive number
  const scale = totalRawCosts > 0 ? absImpact / totalRawCosts : 0;

  const steps = [
    {
      key: "carbon",
      label: "Carbon Tax",
      raw: cb.carbonTax,
      color: COLORS.carbon,
    },
    { key: "ccus", label: "CCUS Investment", raw: cb.ccus, color: COLORS.ccus },
    {
      key: "flaring",
      label: "Flaring Penalty",
      raw: cb.flaringPenalty,
      color: COLORS.flaring,
    },
    {
      key: "chronic",
      label: "Chronic OpEx",
      raw: cb.chronicOpEx,
      color: COLORS.chronic,
    },
    {
      key: "emergency",
      label: "Emergency CapEx",
      raw: cb.emergencyCapEx,
      color: COLORS.emergency,
    },
    {
      key: "defensive",
      label: "Defensive CapEx",
      raw: cb.defensiveCapEx,
      color: COLORS.defensive,
    },
  ];

  let running = baseline;
  const waterfallData: Array<{
    name: string;
    label: string;
    base: number;
    value: number;
    total: number;
    delta: number;
    color: string;
    isTotal: boolean;
  }> = [];

  // Baseline bar
  waterfallData.push({
    name: "Baseline",
    label: "Baseline NPV",
    base: 0,
    value: baseline,
    total: baseline,
    delta: baseline,
    color: COLORS.baseline,
    isTotal: true,
  });

  // Cost waterfall steps (each step decrements running total)
  for (const s of steps) {
    const cost = s.raw * scale;
    if (cost <= 0) continue; // skip zero-cost items
    const newTotal = running - cost;
    waterfallData.push({
      name: s.label,
      label: s.label,
      base: newTotal,
      value: cost,
      total: newTotal,
      delta: -cost,
      color: s.color,
      isTotal: false,
    });
    running = newTotal;
  }

  // Stressed bar
  waterfallData.push({
    name: "Stressed",
    label: "Stressed NPV",
    base: 0,
    value: telecom.stressedNPV,
    total: telecom.stressedNPV,
    delta: telecom.stressedNPV,
    color: COLORS.stressed,
    isTotal: true,
  });

  const maxVal = baseline * 1.12;

  return (
    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          NPV Waterfall — Climate Cost Attribution
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Decomposition of NPV decline from baseline ({formatDollarM(baseline)})
          to stressed ({formatDollarM(telecom.stressedNPV)}) under the selected
          scenario.
        </Typography>
      </Box>

      <Box sx={{ width: "100%", height: 420 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={waterfallData}
            margin={{ top: 30, right: 20, left: 10, bottom: 40 }}
            barCategoryGap="18%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              horizontal
              vertical={false}
              stroke={alpha(theme.palette.text.secondary, 0.12)}
            />
            <XAxis
              dataKey="name"
              height={50}
              interval={0}
              angle={-25}
              textAnchor="end"
              tick={{
                fill: theme.palette.text.secondary,
                fontSize: 11,
                fontWeight: 500,
              }}
              tickLine={false}
              axisLine={{ stroke: alpha(theme.palette.text.secondary, 0.15) }}
            />
            <YAxis
              domain={[0, maxVal]}
              tickFormatter={(v: number) => formatDollarM(v)}
              tick={{ fill: theme.palette.text.secondary, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              content={<WaterfallTooltip />}
              cursor={{ fill: alpha(theme.palette.text.primary, 0.03) }}
            />

            {/* Invisible base bar */}
            <Bar
              dataKey="base"
              stackId="wf"
              fill="transparent"
              isAnimationActive={false}
            />

            {/* Value bar */}
            <Bar
              dataKey="value"
              stackId="wf"
              isAnimationActive
              animationDuration={700}
              radius={[3, 3, 0, 0]}
            >
              {waterfallData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
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
                    ? formatDollarM(entry.value)
                    : `-${formatDollarM(Math.abs(entry.delta))}`;
                  return (
                    <text
                      x={(x ?? 0) + (width ?? 0) / 2}
                      y={(y ?? 0) - 8}
                      textAnchor="middle"
                      fill={entry.color}
                      fontSize={10}
                      fontWeight={700}
                    >
                      {lbl}
                    </text>
                  );
                }}
              />
            </Bar>

            <ReferenceLine
              y={telecom.stressedNPV}
              stroke={COLORS.stressed}
              strokeWidth={1}
              strokeDasharray="6 4"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>

      {/* Summary strip */}
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2,
          bgcolor: alpha(COLORS.stressed, 0.06),
          borderLeft: `4px solid ${COLORS.stressed}`,
          borderRadius: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="subtitle2" fontWeight={700} color="error.dark">
            Total NPV Erosion (ΔNPV)
          </Typography>
          <Typography variant="body2" color="error.main">
            From {formatDollarM(baseline)} to{" "}
            {formatDollarM(telecom.stressedNPV)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right" }}>
          <Typography variant="h5" fontWeight={800} color="error.dark">
            -{formatDollarM(absImpact)}
          </Typography>
          <Typography variant="body2" color="error.main" fontWeight={600}>
            {telecom.deltaNPVPercent.toFixed(1)}%
          </Typography>
        </Box>
      </Paper>
    </Paper>
  );
};
