import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  LabelList,
} from "recharts";
import { Box, Typography, useTheme, Paper } from "@mui/material";

// Local interface definition to avoid import issues
interface MaterialTopic {
  id: string;
  name: string;
  description: string;
  dataNeeds: string[];
  status: "data-driven" | "partial" | "required";
  selected: boolean;
  assignedUserId?: string;
  approvalStatus?: "Draft" | "Submitted" | "Approved";
  isCustom?: boolean;
  impact?: number;
  stakeholderInterest?: number;
}

interface MaterialityMapProps {
  topics: MaterialTopic[];
}

interface TooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ payload: MaterialTopic }>;
}

const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Paper sx={{ p: 2, border: "1px solid #e0e0e0" }}>
        <Typography variant="subtitle2" fontWeight="bold">
          {data.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Impact: {data.impact}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Stakeholder Interest: {data.stakeholderInterest}
        </Typography>
      </Paper>
    );
  }
  return null;
};

export const MaterialityMap: React.FC<MaterialityMapProps> = ({ topics }) => {
  const theme = useTheme();

  // Filter topics that have coordinates
  const data = useMemo(
    () =>
      topics
        .filter((t) => t.selected && t.impact && t.stakeholderInterest)
        .map((t) => ({
          ...t,
          x: t.impact,
          y: t.stakeholderInterest,
          z: 1, // Uniform size for now
        })),
    [topics],
  );

  return (
    <Box
      sx={{
        width: "100%",
        height: 500,
        bgcolor: "background.paper",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography variant="h6" gutterBottom fontWeight="bold" align="center">
        Materiality Matrix
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey="x"
            name="Business Impact"
            domain={[0, 5]}
            label={{
              value: "Business Impact",
              position: "insideBottom",
              offset: -10,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Stakeholder Interest"
            domain={[0, 5]}
            label={{
              value: "Stakeholder Interest",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <ZAxis type="number" range={[100, 100]} />
          <Tooltip content={CustomTooltip} />
          <Scatter
            name="Material Topics"
            data={data}
            fill={theme.palette.primary.main}
          >
            {data.map((index) => (
              <Cell key={`cell-${index}`} fill={theme.palette.primary.main} />
            ))}
            <LabelList dataKey="name" position="top" />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};
