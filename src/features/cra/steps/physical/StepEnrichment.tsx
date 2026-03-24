import { useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Chip,
  Grid,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import { Layers } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  HAZARD_RATING_COLORS,
  getExposureFactor,
  getAnnualProbability,
  RESPONSE_RULES,
  MONITORING_CONFIG,
  RATING_ORDER,
} from "../../domain/physicalRisk/constants";
import { getInherentVulnerability } from "../../domain/physicalRisk/vulnerabilityTable";
import {
  getSbraRrf,
  getSectorNameById,
} from "../../domain/physicalRisk/sbraTable";
import type {
  EnrichedResult,
  HazardRating,
} from "../../domain/physicalRisk/types";

function scoreToRating(score: number): HazardRating {
  if (score >= 84) return "Extreme";
  if (score >= 67) return "Very High";
  if (score >= 50) return "High";
  if (score >= 34) return "Medium";
  if (score >= 17) return "Low";
  return "Negligible";
}

const fmt = (v: number, sym: string) =>
  v >= 1e9
    ? `${sym}${(v / 1e9).toFixed(2)}B`
    : v >= 1e6
      ? `${sym}${(v / 1e6).toFixed(2)}M`
      : v >= 1e3
        ? `${sym}${(v / 1e3).toFixed(1)}K`
        : `${sym}${v.toFixed(0)}`;

export default function StepEnrichment() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const {
    config,
    mappedAssets,
    hazardResults,
    results,
    isRunning,
    progress,
    setResults,
    setIsRunning,
    setProgress,
    setError,
  } = usePhysicalRiskStore();

  const cardBg = isDark ? alpha("#0F1623", 0.85) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08);
  const sym =
    config.currency === "USD"
      ? "$"
      : config.currency === "NGN"
        ? "₦"
        : config.currency;

  const handleEnrich = useCallback(() => {
    setIsRunning(true);
    setProgress(0);
    setError(null);

    try {
      const sectorName = getSectorNameById(config.sectorId);
      const rate = config.usdRate || 1;
      const enriched: EnrichedResult[] = [];

      for (let i = 0; i < hazardResults.length; i++) {
        const hr = hazardResults[i];
        const asset = mappedAssets.find((a) => a.name === hr.asset);
        if (!asset) continue;

        const assetValueLocal = asset.value;
        const assetValueUsd = assetValueLocal / rate;
        const ef = getExposureFactor(asset.assetType, hr.hazardRating);
        const exposedValueLocal = assetValueLocal * ef;
        const exposedValueUsd = exposedValueLocal / rate;
        const iv = getInherentVulnerability(hr.risk, asset.assetType);
        const rrf = getSbraRrf(
          hr.risk,
          asset.assetType,
          sectorName,
          config.subsector,
        );
        const netV = iv * (1 - rrf);
        const sslLocal = assetValueLocal * ef * netV;
        const sslUsd = sslLocal / rate;
        const ap = getAnnualProbability(hr.frequencyLabel);
        const ealLocal = sslLocal * ap;
        const ealUsd = ealLocal / rate;
        const riskScoreNorm = Math.round(
          (RATING_ORDER[hr.hazardRating] / 6) * 100,
        );

        const response = RESPONSE_RULES[hr.hazardRating];
        const residualScore = Math.round(
          riskScoreNorm * (1 - response.reductionPct / 100),
        );
        const monitoring = MONITORING_CONFIG[hr.risk] ?? {
          kpi: "General monitoring",
          frequency: "Quarterly",
        };

        enriched.push({
          ...hr,
          assetType: asset.assetType,
          assetValueLocal,
          assetValueUsd,
          exposureFactor: ef,
          exposedValueLocal,
          exposedValueUsd,
          inherentVulnerability: iv,
          sbraRrf: rrf,
          sbraNetVulnerability: netV,
          annualProbability: ap,
          riskScoreNorm,
          sslLocal,
          sslUsd,
          ealLocal,
          ealUsd,
          responseStrategy: response.strategy,
          responsePriority: response.priority,
          responseTimeframe: response.timeframe,
          residualReductionPct: response.reductionPct,
          residualRiskScore: residualScore,
          residualRiskRating: scoreToRating(residualScore),
          monitoringKpi: monitoring.kpi,
          monitoringFrequency: monitoring.frequency,
          monitoringTrigger: monitoring.trigger ?? "",
          monitoringDataSource: monitoring.dataSource ?? "",
          monitoringOwnerRole: monitoring.ownerRole ?? "",
          dataSource: "Local engine",
        });

        if (i % 50 === 0)
          setProgress(Math.round((i / hazardResults.length) * 100));
      }

      setResults(enriched);
      setProgress(100);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setIsRunning(false);
  }, [
    config,
    mappedAssets,
    hazardResults,
    setResults,
    setIsRunning,
    setProgress,
    setError,
  ]);

  const totalEal = results.reduce((s, r) => s + r.ealLocal, 0);
  const totalSsl = results.reduce((s, r) => s + r.sslLocal, 0);
  const totalExposure = results.reduce((s, r) => s + r.exposedValueLocal, 0);
  const avgVuln =
    results.length > 0
      ? results.reduce((s, r) => s + r.sbraNetVulnerability, 0) / results.length
      : 0;

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
            <Layers size={24} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Exposure, Vulnerability & Loss
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Apply exposure factors, inherent vulnerability, SBRA resilience
              reduction, and calculate Single Significant Loss (SSL) and
              Expected Annual Loss (EAL) for each combination.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Run enrichment */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
          <Alert severity="info">
            This step applies: Exposure Factor (EF) table → Inherent
            Vulnerability (21×47 matrix) → SBRA Residual Risk Factor
            (sector-adjusted) → SSL & EAL calculation → Response strategy
            assignment.
          </Alert>

          {isRunning && (
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">
                  Enriching {hazardResults.length} results...
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.15),
                  "& .MuiLinearProgress-bar": {
                    bgcolor: DELOITTE_COLORS.green.DEFAULT,
                    borderRadius: 4,
                  },
                }}
              />
            </Box>
          )}

          {results.length > 0 && !isRunning && (
            <Alert severity="success">
              {results.length} results enriched with financial metrics.
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleEnrich}
            disabled={isRunning || hazardResults.length === 0}
            startIcon={<Layers size={16} />}
            sx={{
              bgcolor: DELOITTE_COLORS.green.DEFAULT,
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
              py: 1.5,
            }}
          >
            {results.length > 0
              ? "Re-Run Enrichment"
              : "Run Enrichment Analysis"}
          </Button>
        </Stack>
      </Paper>

      {/* KPI cards */}
      {results.length > 0 && (
        <>
          <Grid container spacing={2}>
            {[
              {
                label: "Total EAL",
                value: fmt(totalEal, sym),
                color: "#EF4444",
              },
              {
                label: "Total SSL",
                value: fmt(totalSsl, sym),
                color: "#F59E0B",
              },
              {
                label: "Exposed Value",
                value: fmt(totalExposure, sym),
                color: DELOITTE_COLORS.info,
              },
              {
                label: "Avg Net Vulnerability",
                value: `${(avgVuln * 100).toFixed(1)}%`,
                color: "#8B5CF6",
              },
            ].map((kpi) => (
              <Grid size={{ xs: 6, md: 3 }} key={kpi.label}>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: alpha(kpi.color, 0.08),
                    textAlign: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {kpi.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {kpi.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Enrichment table */}
          <Paper
            sx={{
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: 2,
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Enriched Results
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
                      "EF",
                      "Vuln",
                      "SBRA RRF",
                      "Net Vuln",
                      "SSL",
                      "EAL",
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
                        "&:nth-of-type(even)": {
                          bgcolor: alpha(borderColor, 0.3),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 130 }}
                        >
                          {r.asset}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 120 }}
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
                              HAZARD_RATING_COLORS[r.hazardRating] || "#888",
                              0.15,
                            ),
                            color:
                              HAZARD_RATING_COLORS[r.hazardRating] || "#888",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {(r.exposureFactor * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell>
                        {(r.inherentVulnerability * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell>{(r.sbraRrf * 100).toFixed(0)}%</TableCell>
                      <TableCell>
                        {(r.sbraNetVulnerability * 100).toFixed(0)}%
                      </TableCell>
                      <TableCell>{fmt(r.sslLocal, sym)}</TableCell>
                      <TableCell>{fmt(r.ealLocal, sym)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      {hazardResults.length === 0 && (
        <Alert severity="warning">
          No hazard results available. Complete Step 4 first.
        </Alert>
      )}
    </Stack>
  );
}
