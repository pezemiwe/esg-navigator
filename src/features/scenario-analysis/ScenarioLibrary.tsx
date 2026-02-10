import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  IconButton,
  Button,
  useTheme,
  alpha,
  Divider,
} from "@mui/material";
import ScenarioLayout from "./layout/ScenarioLayout";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  MoreVertical,
  Calendar,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ScenarioItemProps {
  title: string;
  type: "Orderly" | "Disorderly" | "Hot House" | "Custom";
  date: string;
  author: string;
  status: "Completed" | "Draft" | "Archived";
  color: string;
  icon: React.ReactNode;
}

const ScenarioItem = ({
  title,
  type,
  date,
  author,
  status,
  color,
  icon,
}: ScenarioItemProps) => {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: "12px",
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: DELOITTE_COLORS.green.DEFAULT,
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: "10px",
          bgcolor: alpha(color, 0.1),
          color: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mr: 3,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
          {title}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}>
          <Chip
            label={type}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              fontWeight: 600,
              bgcolor: alpha(color, 0.1),
              color: color,
            }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Calendar size={14} color={theme.palette.text.secondary} />
            <Typography variant="caption" color="text.secondary">
              {date}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            • By {author}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip
          label={status}
          size="small"
          variant="outlined"
          sx={{
            fontWeight: 600,
            borderColor:
              status === "Completed"
                ? DELOITTE_COLORS.success
                : theme.palette.divider,
            color:
              status === "Completed"
                ? DELOITTE_COLORS.success
                : theme.palette.text.secondary,
          }}
        />
        <IconButton size="small">
          <MoreVertical size={18} />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default function ScenarioLibrary() {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <ScenarioLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: DELOITTE_COLORS.slate.dark, mb: 1 }}
          >
            Scenario Library
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage yoursaved climate scenarios, NGFS templates, and stress test
            definitions.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} />}
          onClick={() => navigate("/scenario-analysis/run")}
          sx={{
            bgcolor: DELOITTE_COLORS.green.DEFAULT,
            color: "#000",
            fontWeight: 700,
            "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
          }}
        >
          New Scenario
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="text.secondary"
              textTransform="uppercase"
              letterSpacing={1}
            >
              Recent Scenarios
            </Typography>
          </Box>

          <ScenarioItem
            title="Q1 2026 Regulatory Stress Test (NGFS)"
            type="Orderly"
            date="Feb 02, 2026"
            author="Risk Team"
            status="Completed"
            color={DELOITTE_COLORS.success}
            icon={<ShieldCheck size={24} />}
          />
          <ScenarioItem
            title="Hi Inflation & Carbon Tax Shock"
            type="Disorderly"
            date="Jan 28, 2026"
            author="Kwame Mensah"
            status="Draft"
            color={DELOITTE_COLORS.warning}
            icon={<AlertTriangle size={24} />}
          />
          <ScenarioItem
            title="Extreme Physical Risk - Coastal Flooding"
            type="Hot House"
            date="Jan 15, 2026"
            author="ESG Dept"
            status="Completed"
            color={DELOITTE_COLORS.error}
            icon={<TrendingUp size={24} />}
          />
          <ScenarioItem
            title="Custom GDP Shock Sensitivity"
            type="Custom"
            date="Dec 20, 2025"
            author="System Admin"
            status="Archived"
            color={DELOITTE_COLORS.slate.DEFAULT}
            icon={<ShieldCheck size={24} />}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "16px",
              bgcolor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05),
              border: `1px dashed ${alpha(DELOITTE_COLORS.slate.DEFAULT, 0.3)}`,
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Templates
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  py: 1.5,
                }}
              >
                NGFS Net Zero 2050
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  py: 1.5,
                }}
              >
                NGFS Current Policies
              </Button>
              <Button
                variant="outlined"
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  borderColor: theme.palette.divider,
                  color: theme.palette.text.primary,
                  py: 1.5,
                }}
              >
                CBN Stress Test Baseline
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </ScenarioLayout>
  );
}
