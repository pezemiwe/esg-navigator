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
  Tooltip,
} from "@mui/material";
import { BarChart3 } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS,
  RATING_ORDER,
  RISK_APPETITE,
  buildMatrixConfig,
} from "../../domain/physicalRisk/constants";
import type {
  HazardRating,
  EnrichedResult,
} from "../../domain/physicalRisk/types";

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

const ORDERED_RATINGS: HazardRating[] = [
  "Extreme",
  "Very High",
  "High",
  "Medium",
  "Low",
  "Negligible",
];

export default function StepRiskEvaluation() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { config, results } = usePhysicalRiskStore();

  const cardBg = isDark ? alpha("#0F1623", 0.85) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08);
  const sym =
    config.currency === "USD"
      ? "$"
      : config.currency === "NGN"
        ? "₦"
        : config.currency;

  /* Distribution by hazard rating */
  const ratingDist = useMemo(() => {
    const dist: Record<string, number> = {};
    ORDERED_RATINGS.forEach((r) => (dist[r] = 0));
    results.forEach((r) => {
      dist[r.hazardRating] = (dist[r.hazardRating] || 0) + 1;
    });
    return dist;
  }, [results]);

  /* Top 15 risks by EAL */
  const top15 = useMemo(
    () => [...results].sort((a, b) => b.ealLocal - a.ealLocal).slice(0, 15),
    [results],
  );

  /* Risk matrix for visualization */
  const matrix = useMemo(
    () => buildMatrixConfig(config.matrixSize),
    [config.matrixSize],
  );
  const matrixCells = useMemo(() => {
    const cells: Record<string, EnrichedResult[]> = {};
    results.forEach((r) => {
      const key = `${r.intensityScore}-${r.frequencyScore}`;
      if (!cells[key]) cells[key] = [];
      cells[key].push(r);
    });
    return cells;
  }, [results]);

  /* Aggregate by asset type */
  const assetTypeAgg = useMemo(() => {
    const agg: Record<
      string,
      { count: number; ealTotal: number; sslTotal: number }
    > = {};
    results.forEach((r) => {
      if (!agg[r.assetType])
        agg[r.assetType] = { count: 0, ealTotal: 0, sslTotal: 0 };
      agg[r.assetType].count++;
      agg[r.assetType].ealTotal += r.ealLocal;
      agg[r.assetType].sslTotal += r.sslLocal;
    });
    return Object.entries(agg)
      .sort((a, b) => b[1].ealTotal - a[1].ealTotal)
      .slice(0, 10);
  }, [results]);

  const maxBar = Math.max(...Object.values(ratingDist), 1);

  if (results.length === 0) {
    return (
      <Alert severity="warning">
        No enriched results available. Complete Step 5 (Enrichment) first.
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
            <BarChart3 size={24} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Risk Evaluation
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Analyse the portfolio risk profile — rating distribution, top
              exposures, risk matrix visualisation, and asset type aggregation.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* KPI row */}
      <Grid container spacing={2}>
        {[
          { label: "Assessed Risks", value: results.length, color: "#3B82F6" },
          {
            label: "Extreme / Very High",
            value: results.filter((r) => RATING_ORDER[r.hazardRating] >= 5)
              .length,
            color: "#EF4444",
          },
          {
            label: "Total EAL",
            value: fmt(
              results.reduce((s, r) => s + r.ealLocal, 0),
              sym,
            ),
            color: "#F59E0B",
          },
          {
            label: "Average Risk Score",
            value: Math.round(
              results.reduce((s, r) => s + r.riskScoreNorm, 0) / results.length,
            ),
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

      {/* Rating distribution bar chart */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Hazard Rating Distribution
        </Typography>
        <Stack spacing={1}>
          {ORDERED_RATINGS.map((rating) => (
            <Stack key={rating} direction="row" spacing={2} alignItems="center">
              <Typography variant="body2" sx={{ width: 80, fontWeight: 600 }}>
                {rating}
              </Typography>
              <Box sx={{ flex: 1, position: "relative" }}>
                <Box
                  sx={{
                    height: 28,
                    borderRadius: 1,
                    width: `${Math.max((ratingDist[rating] / maxBar) * 100, 2)}%`,
                    bgcolor: alpha(HAZARD_RATING_COLORS[rating], 0.8),
                    transition: "width 0.5s ease",
                  }}
                />
              </Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ minWidth: 32, textAlign: "right" }}
              >
                {ratingDist[rating]}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ minWidth: 40 }}
              >
                {RISK_APPETITE[rating]}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Paper>

      {/* Risk Matrix Visualisation */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Risk Matrix ({config.matrixSize}×{config.matrixSize})
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ minWidth: 400 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    bgcolor: isDark ? "#1B2838" : "#F8FAFC",
                  }}
                >
                  Intensity ↓ / Freq →
                </TableCell>
                {Array.from({ length: config.matrixSize }, (_, j) => j + 1).map(
                  (f) => (
                    <TableCell
                      key={f}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        bgcolor: isDark ? "#1B2838" : "#F8FAFC",
                      }}
                    >
                      {matrix.frequencyLabels[f] || `F${f}`}
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from(
                { length: config.matrixSize },
                (_, i) => config.matrixSize - i,
              ).map((intensity) => (
                <TableRow key={intensity}>
                  <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>
                    {matrix.intensityLabels[intensity] || `I${intensity}`}
                  </TableCell>
                  {Array.from(
                    { length: config.matrixSize },
                    (_, j) => j + 1,
                  ).map((freq) => {
                    const key = `${intensity}-${freq}`;
                    const rating = matrix.matrix[key] || "Negligible";
                    const count = matrixCells[key]?.length || 0;
                    return (
                      <Tooltip
                        key={key}
                        title={count ? `${count} risk(s) — ${rating}` : rating}
                      >
                        <TableCell
                          align="center"
                          sx={{
                            bgcolor: alpha(
                              HAZARD_RATING_COLORS[rating] || "#888",
                              count > 0 ? 0.5 : 0.15,
                            ),
                            border: `1px solid ${borderColor}`,
                            fontWeight: count > 0 ? 700 : 400,
                            fontSize: 13,
                            cursor: count > 0 ? "pointer" : "default",
                            minWidth: 60,
                          }}
                        >
                          {count > 0 ? count : ""}
                        </TableCell>
                      </Tooltip>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        {/* Top 15 Risks by EAL */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            sx={{
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Top 15 Risks by EAL
              </Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 420 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["#", "Asset", "Risk", "Rating", "Score", "EAL"].map(
                      (h) => (
                        <TableCell
                          key={h}
                          sx={{
                            fontWeight: 600,
                            bgcolor: isDark ? "#1B2838" : "#F8FAFC",
                          }}
                        >
                          {h}
                        </TableCell>
                      ),
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {top15.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 110 }}
                        >
                          {r.asset}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 100 }}
                        >
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
                      <TableCell>{r.riskScoreNorm}</TableCell>
                      <TableCell>{fmt(r.ealLocal, sym)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* EAL by Asset Type */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
              p: 2,
            }}
          >
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              EAL by Asset Type
            </Typography>
            <Stack spacing={1}>
              {assetTypeAgg.map(([type, agg]) => {
                const maxEal = assetTypeAgg[0]?.[1]?.ealTotal || 1;
                return (
                  <Box key={type}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mb={0.3}
                    >
                      <Typography
                        variant="caption"
                        noWrap
                        sx={{ maxWidth: 120 }}
                      >
                        {type}
                      </Typography>
                      <Typography variant="caption" fontWeight={600}>
                        {fmt(agg.ealTotal, sym)}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha("#3B82F6", 0.15),
                      }}
                    >
                      <Box
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          width: `${(agg.ealTotal / maxEal) * 100}%`,
                          bgcolor: "#3B82F6",
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
}
