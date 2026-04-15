import { Box, Typography, Paper, alpha } from "@mui/material";
import type { Shield } from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

export interface StatCardProps {
  icon: typeof Shield;
  label: string;
  value: string | number;
  sub?: string;
  change?: { value: number; label: string };
  color?: string;
  cardBg: string;
  borderColor: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  change,
  color = BRAND,
  cardBg,
  borderColor,
}: StatCardProps) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      bgcolor: cardBg,
      border: `1px solid ${borderColor}`,
      position: "relative",
      overflow: "hidden",
      "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        bgcolor: color,
      },
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography
          variant="overline"
          sx={{
            color: "text.secondary",
            fontWeight: 600,
            letterSpacing: "0.08em",
            fontSize: "0.65rem",
          }}
        >
          {label}
        </Typography>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.1 }}
        >
          {value}
        </Typography>
        {sub && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", mt: 0.5, display: "block" }}
          >
            {sub}
          </Typography>
        )}
        {change && (
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: "inline-flex",
              alignItems: "center",
              gap: 0.3,
              fontWeight: 700,
              fontSize: "0.65rem",
              color: change.value >= 0 ? "#10b981" : "#ef4444",
              bgcolor:
                change.value >= 0
                  ? alpha("#10b981", 0.08)
                  : alpha("#ef4444", 0.08),
              px: 0.8,
              py: 0.2,
              borderRadius: 1,
            }}
          >
            {change.value >= 0 ? "▲" : "▼"} {Math.abs(change.value).toFixed(1)}%{" "}
            {change.label}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: alpha(color, 0.1),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon size={22} color={color} />
      </Box>
    </Box>
  </Paper>
);
