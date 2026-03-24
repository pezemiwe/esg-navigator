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
import { Shield } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import {
  HAZARD_RATING_COLORS,
  RESPONSE_RULES,
} from "../../domain/physicalRisk/constants";
import type { HazardRating } from "../../domain/physicalRisk/types";

const PRIORITY_COLORS: Record<string, string> = {
  Critical: "#DC143C",
  High: "#FF6347",
  Elevated: "#FFA500",
  Moderate: "#3B82F6",
  Low: "#4CAF50",
  Minimal: "#81C784",
};

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

export default function StepRiskResponse() {
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

  /* Strategy summary */
  const strategySummary = useMemo(() => {
    const agg: Record<
      string,
      { count: number; ealBefore: number; ealAfter: number }
    > = {};
    results.forEach((r) => {
      const s = r.responseStrategy;
      if (!agg[s]) agg[s] = { count: 0, ealBefore: 0, ealAfter: 0 };
      agg[s].count++;
      agg[s].ealBefore += r.ealLocal;
      agg[s].ealAfter += r.ealLocal * (1 - r.residualReductionPct / 100);
    });
    return Object.entries(agg).sort((a, b) => b[1].ealBefore - a[1].ealBefore);
  }, [results]);

  const totalEalBefore = results.reduce((s, r) => s + r.ealLocal, 0);
  const totalEalAfter = results.reduce(
    (s, r) => s + r.ealLocal * (1 - r.residualReductionPct / 100),
    0,
  );
  const totalReduction =
    totalEalBefore > 0
      ? ((1 - totalEalAfter / totalEalBefore) * 100).toFixed(1)
      : "0";

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
            <Shield size={24} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Risk Response Strategy
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Automated response assignment based on hazard rating — Avoid,
              Transfer, Mitigate, Monitor, or Accept — with priority and
              timeframe for each risk.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* KPI row */}
      <Grid container spacing={2}>
        {[
          {
            label: "EAL Before Response",
            value: fmt(totalEalBefore, sym),
            color: "#EF4444",
          },
          {
            label: "EAL After Response",
            value: fmt(totalEalAfter, sym),
            color: "#10B981",
          },
          {
            label: "Portfolio Reduction",
            value: `${totalReduction}%`,
            color: "#8B5CF6",
          },
          {
            label: "Critical Risks",
            value: results.filter((r) => r.responsePriority === "Critical")
              .length,
            color: "#DC143C",
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

      {/* Strategy breakdown */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Response Strategy Breakdown
        </Typography>
        <Grid container spacing={2}>
          {strategySummary.map(([strat, agg]) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={strat}>
              <Paper
                variant="outlined"
                sx={{ p: 2, borderRadius: 2, bgcolor: alpha(borderColor, 0.1) }}
              >
                <Typography variant="subtitle2" fontWeight={700}>
                  {strat}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {agg.count} risks
                </Typography>
                <Stack direction="row" justifyContent="space-between" mt={1}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      EAL Before
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {fmt(agg.ealBefore, sym)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      EAL After
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      color="success.main"
                    >
                      {fmt(agg.ealAfter, sym)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Response rules reference */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Response Rules Reference
        </Typography>
        <Stack spacing={1}>
          {(Object.keys(RESPONSE_RULES) as HazardRating[]).map((rating) => {
            const rule = RESPONSE_RULES[rating];
            return (
              <Stack
                key={rating}
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: alpha(HAZARD_RATING_COLORS[rating], 0.06),
                }}
              >
                <Chip
                  label={rating}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: 10,
                    minWidth: 80,
                    bgcolor: alpha(HAZARD_RATING_COLORS[rating], 0.15),
                    color: HAZARD_RATING_COLORS[rating],
                  }}
                />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {rule.strategy}
                </Typography>
                <Chip
                  label={rule.priority}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: PRIORITY_COLORS[rule.priority],
                    borderColor: PRIORITY_COLORS[rule.priority],
                    fontSize: 10,
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ minWidth: 100 }}
                >
                  {rule.timeframe}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={{ minWidth: 40 }}
                >
                  -{rule.reductionPct}%
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </Paper>

      {/* Full response action plan */}
      <Paper
        sx={{
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            Action Plan ({results.length} items)
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
                  "Strategy",
                  "Priority",
                  "Timeframe",
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
                    <Typography variant="body2" noWrap sx={{ maxWidth: 110 }}>
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
                      {r.responseStrategy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={r.responsePriority}
                      size="small"
                      variant="outlined"
                      sx={{
                        fontSize: 10,
                        color: PRIORITY_COLORS[r.responsePriority],
                        borderColor: PRIORITY_COLORS[r.responsePriority],
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {r.responseTimeframe}
                    </Typography>
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
