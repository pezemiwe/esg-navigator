import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  alpha,
  useTheme,
  InputAdornment,
} from "@mui/material";
import { Settings } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { SECTORS } from "../../domain/physicalRisk/constants";

export default function StepSetup() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { config, setConfig } = usePhysicalRiskStore();

  const cardBg = isDark ? alpha("#0F1623", 0.85) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08);
  const accentGradient = "linear-gradient(135deg, #1B3A5C 0%, #0F1623 100%)";

  const sectorOptions = Object.entries(SECTORS).map(([id, sec]) => ({
    id,
    name: sec.name,
  }));
  const subsectorOptions =
    config.sectorId && SECTORS[config.sectorId]
      ? SECTORS[config.sectorId].subsectors
      : [];

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          background: accentGradient,
          color: "#fff",
          border: `1px solid ${alpha("#fff", 0.1)}`,
          borderRadius: 3,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha("#fff", 0.1),
              display: "flex",
            }}
          >
            <Settings size={24} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Assessment Configuration
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Configure company details, sector classification, risk matrix
              parameters, and API settings.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Company & Assessor */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Organisation Details
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Company Name"
              value={config.companyName}
              onChange={(e) => setConfig({ companyName: e.target.value })}
              placeholder="e.g. GCB Bank PLC"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Country"
              value={config.country}
              onChange={(e) => setConfig({ country: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Report Date"
              type="date"
              value={config.reportDate}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setConfig({ reportDate: e.target.value })}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Assessor Name"
              value={config.assessorName}
              onChange={(e) => setConfig({ assessorName: e.target.value })}
              placeholder="e.g. Risk & Compliance Team"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Sector Classification */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Sector Classification
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Sector</InputLabel>
              <Select
                value={config.sectorId}
                label="Sector"
                onChange={(e) =>
                  setConfig({ sectorId: e.target.value, subsector: "" })
                }
              >
                {sectorOptions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Subsector</InputLabel>
              <Select
                value={config.subsector}
                label="Subsector"
                onChange={(e) =>
                  setConfig({ subsector: e.target.value as string })
                }
              >
                {subsectorOptions.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Risk Matrix & Currency */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Risk Matrix & Currency
        </Typography>
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Matrix Size</InputLabel>
              <Select
                value={config.matrixSize}
                label="Matrix Size"
                onChange={(e) =>
                  setConfig({ matrixSize: Number(e.target.value) })
                }
              >
                {[3, 4, 5, 6].map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}&times;{s} (
                    {s === 6
                      ? "Full"
                      : s === 5
                        ? "Standard"
                        : s === 4
                          ? "Compact"
                          : "Basic"}
                    )
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select
                value={config.currency}
                label="Currency"
                onChange={(e) =>
                  setConfig({ currency: e.target.value as string })
                }
              >
                {["NGN", "USD", "GHS", "KES", "ZAR", "GBP", "EUR"].map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="USD Exchange Rate"
              type="number"
              value={config.usdRate}
              onChange={(e) =>
                setConfig({ usdRate: Number(e.target.value) || 1 })
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">1 USD =</InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Stack>
  );
}
