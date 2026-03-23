import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Slider,
  TextField,
  InputAdornment,
  Divider,
  Button,
  Switch,
  FormControlLabel,
  useTheme,
  alpha,
} from "@mui/material";
import ScenarioLayout from "./layout/ScenarioLayout";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { Save, RefreshCw } from "lucide-react";

const AssumptionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        height: "100%",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "12px",
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Divider sx={{ mb: 3 }} />
      {children}
    </Paper>
  );
};

export default function ScenarioAssumptions() {
  const theme = useTheme();

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
            Assumptions Configuration
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Global calibration for economic variables, carbon pricing models,
            and sector sensitivity betas.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshCw size={18} />}
            sx={{ color: DELOITTE_COLORS.slate.DEFAULT }}
          >
            Reset Defaults
          </Button>
          <Button
            variant="contained"
            startIcon={<Save size={18} />}
            sx={{
              bgcolor: DELOITTE_COLORS.green.DEFAULT,
              color: "#000",
              fontWeight: 700,
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
            }}
          >
            Save Config
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <AssumptionCard
            title="Macroeconomic Variables"
            description="Baseline assumptions for Nigerian economic performance under stress."
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  GDP Growth Sensitivity Factor
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 8 }}>
                    <Slider
                      defaultValue={1.2}
                      min={0.5}
                      max={2.0}
                      step={0.1}
                      sx={{ color: DELOITTE_COLORS.slate.DEFAULT }}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      size="small"
                      defaultValue="1.2"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">x</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Inflation Pass-throu Rate
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 8 }}>
                    <Slider
                      defaultValue={65}
                      min={0}
                      max={100}
                      sx={{ color: DELOITTE_COLORS.slate.DEFAULT }}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid size={{ xs: 4 }}>
                    <TextField
                      size="small"
                      defaultValue="65"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </AssumptionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AssumptionCard
            title="Carbon Pricing Model"
            description="Parameters defining the trajectory and impact of carbon taxes."
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Base Carbon Price (2026)
                </Typography>
                <TextField
                  fullWidth
                  defaultValue="25"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">/ tCO2</InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Annual Escalation Rate (Real)
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      border: "1px solid",
                      borderColor: theme.palette.divider,
                      borderRadius: 1,
                      width: "30%",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    Low (2%)
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      border: "2px solid",
                      borderColor: DELOITTE_COLORS.green.DEFAULT,
                      bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.1),
                      borderRadius: 1,
                      width: "30%",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    Med (5%)
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      border: "1px solid",
                      borderColor: theme.palette.divider,
                      borderRadius: 1,
                      width: "30%",
                      textAlign: "center",
                      fontWeight: 700,
                    }}
                  >
                    High (8%)
                  </Box>
                </Box>
              </Box>
            </Box>
          </AssumptionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <AssumptionCard
            title="Model Settings & Toggles"
            description="Enable or disable specific transmission channels for the stress test engine."
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={<Switch defaultChecked color="warning" />}
                  label="Include Supply Chain Shocks"
                />
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  Models indirect impact from Scope 3 emissions pricing.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={<Switch defaultChecked color="warning" />}
                  label="Physical Risk Damage Functions"
                />
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  Calculates LGD impact based on asset state hazards.
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={<Switch color="warning" />}
                  label="Market Confidence Shock"
                />
                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  Adds liquidity premium to cost of capital calculations.
                </Typography>
              </Grid>
            </Grid>
          </AssumptionCard>
        </Grid>
      </Grid>
    </ScenarioLayout>
  );
}
