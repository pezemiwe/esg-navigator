import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Grid,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  alpha,
  useTheme,
} from "@mui/material";
import { Activity } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS,
  MONITORING_CONFIG,
} from "../../domain/physicalRisk/constants";

const FREQ_COLORS: Record<string, string> = {
  Weekly: "#EF4444",
  Monthly: "#F59E0B",
  Seasonal: "#3B82F6",
  Quarterly: "#8B5CF6",
  Biannual: "#10B981",
  Annual: "#6B7280",
};

export default function StepMonitoring() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { results } = usePhysicalRiskStore();

  const cardBg = isDark ? alpha("#0F1623", 0.85) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08);

  /* Aggregate by frequency */
  const freqSummary = useMemo(() => {
    const agg: Record<string, number> = {};
    results.forEach((r) => {
      const f = r.monitoringFrequency || "Quarterly";
      agg[f] = (agg[f] || 0) + 1;
    });
    return Object.entries(agg).sort((a, b) => b[1] - a[1]);
  }, [results]);

  /* Unique KPIs per risk */
  const kpiByRisk = useMemo(() => {
    const map = new Map<
      string,
      { kpi: string; frequency: string; count: number }
    >();
    results.forEach((r) => {
      const existing = map.get(r.risk);
      const cfg = MONITORING_CONFIG[r.risk] ?? {
        kpi: "General monitoring",
        frequency: "Quarterly",
      };
      if (!existing) {
        map.set(r.risk, { kpi: cfg.kpi, frequency: cfg.frequency, count: 1 });
      } else {
        existing.count++;
      }
    });
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [results]);

  if (results.length === 0) {
    return (
      <Alert severity="warning">
        No enriched results. Complete Step 5 (Enrichment) first.
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #1B3A5C 0%, #0F1623 100%)",
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
            <Activity size={24} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Monitoring & Review
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Assign KPIs and monitoring frequencies to each risk using the
              embedded monitoring configuration table (21 climate risks × KPI +
              frequency).
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* KPI row */}
      <Grid container spacing={2}>
        {[
          { label: "Monitored Risks", value: results.length, color: "#3B82F6" },
          { label: "Unique KPIs", value: kpiByRisk.length, color: "#10B981" },
          {
            label: "Weekly Reviews",
            value: results.filter((r) => r.monitoringFrequency === "Weekly")
              .length,
            color: "#EF4444",
          },
          {
            label: "Freq Categories",
            value: freqSummary.length,
            color: "#8B5CF6",
          },
        ].map((k) => (
          <Grid size={{ xs: 6, md: 3 }} key={k.label}>
            <Paper
              sx={{
                p: 2,
                bgcolor: alpha(k.color, 0.08),
                textAlign: "center",
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {k.label}
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {k.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Frequency Distribution */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Monitoring Frequency Distribution
        </Typography>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {freqSummary.map(([freq, count]) => (
            <Chip
              key={freq}
              label={`${freq}: ${count}`}
              sx={{
                fontWeight: 600,
                bgcolor: alpha(FREQ_COLORS[freq] || "#6B7280", 0.15),
                color: FREQ_COLORS[freq] || "#6B7280",
                fontSize: 13,
                py: 2,
              }}
            />
          ))}
        </Stack>
      </Paper>

      {/* KPI Table by Risk */}
      <Paper
        sx={{
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            KPI Schedule by Risk ({kpiByRisk.length} risks)
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {["Risk", "KPI", "Frequency", "Assets Affected"].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 600,
                      bgcolor: isDark ? "#1B2838" : "#F8FAFC",
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {kpiByRisk.map(([risk, { kpi, frequency, count }]) => (
                <TableRow key={risk}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {risk}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontSize={12}>
                      {kpi}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={frequency}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: 10,
                        bgcolor: alpha(
                          FREQ_COLORS[frequency] || "#6B7280",
                          0.15,
                        ),
                        color: FREQ_COLORS[frequency] || "#6B7280",
                      }}
                    />
                  </TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Full monitoring table */}
      <Paper
        sx={{
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Full Monitoring Plan ({results.length} items)
          </Typography>
        </Box>
        <TableContainer sx={{ maxHeight: 450 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  "Asset",
                  "Risk",
                  "Rating",
                  "KPI",
                  "Frequency",
                  "Residual",
                ].map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 600,
                      bgcolor: isDark ? "#1B2838" : "#F8FAFC",
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {results.slice(0, 200).map((r, i) => (
                <TableRow
                  key={i}
                  sx={{
                    "&:nth-of-type(even)": { bgcolor: alpha(borderColor, 0.3) },
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>
                      {r.asset}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>
                      {r.risk}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.hazardRating}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: 10,
                        bgcolor: alpha(
                          HAZARD_RATING_COLORS[r.hazardRating],
                          0.15,
                        ),
                        color: HAZARD_RATING_COLORS[r.hazardRating],
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontSize={12}>
                      {r.monitoringKpi}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.monitoringFrequency}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: 10,
                        bgcolor: alpha(
                          FREQ_COLORS[r.monitoringFrequency] || "#6B7280",
                          0.15,
                        ),
                        color: FREQ_COLORS[r.monitoringFrequency] || "#6B7280",
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.residualRiskRating}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: 10,
                        bgcolor: alpha(
                          HAZARD_RATING_COLORS[r.residualRiskRating],
                          0.15,
                        ),
                        color: HAZARD_RATING_COLORS[r.residualRiskRating],
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Stack>
  );
}
