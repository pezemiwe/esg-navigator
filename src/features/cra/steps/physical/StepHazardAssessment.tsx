import { useCallback, useState } from "react";
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
import { Activity, Globe, Satellite } from "lucide-react";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  HAZARD_RATING_COLORS,
  buildMatrixConfig,
} from "../../domain/physicalRisk/constants";
import type {
  HazardResult,
  HazardRating,
} from "../../domain/physicalRisk/types";
import {
  assessHazardsWithClimateApis,
  assessHazardsLocally,
} from "../../services/climateApis";
import type { HazardInput } from "../../services/climateApis";

export default function StepHazardAssessment() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const {
    config,
    mappedAssets,
    screening,
    hazardResults,
    isRunning,
    progress,
    error,
    setHazardResults,
    setIsRunning,
    setProgress,
    setError,
  } = usePhysicalRiskStore();

  const [currentTask, setCurrentTask] = useState("");
  const [useLocalOnly, setUseLocalOnly] = useState(false);

  const cardBg = isDark ? alpha("#0F1623", 0.85) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08);
  const mc = buildMatrixConfig(config.matrixSize);

  const totalCombinations = screening.reduce((s, e) => s + e.risks.length, 0);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setProgress(0);
    setError(null);
    setCurrentTask("Preparing assessment...");

    try {
      const inputs: HazardInput[] = [];
      for (const entry of screening) {
        const asset = mappedAssets.find(
          (a) => a.id === entry.assetId || a.name === entry.assetName,
        );
        if (!asset) continue;
        for (const risk of entry.risks) {
          inputs.push({
            asset: asset.name,
            assetType: asset.assetType,
            risk,
            latitude: asset.latitude,
            longitude: asset.longitude,
            country: config.country,
          });
        }
      }

      let outputs;
      if (useLocalOnly) {
        outputs = assessHazardsLocally(inputs, config.matrixSize);
        setProgress(100);
        setCurrentTask("Complete");
      } else {
        outputs = await assessHazardsWithClimateApis(
          inputs,
          config.matrixSize,
          (done, total, current) => {
            setProgress(Math.round((done / total) * 100));
            setCurrentTask(current);
          },
        );
      }

      const results: HazardResult[] = outputs.map((o) => {
        const asset = mappedAssets.find((a) => a.name === o.asset);
        return {
          asset: o.asset,
          risk: o.risk,
          latitude: asset?.latitude ?? 0,
          longitude: asset?.longitude ?? 0,
          intensityScore: o.intensityScore,
          intensityLabel: o.intensityLabel,
          frequencyScore: o.frequencyScore,
          frequencyLabel: o.frequencyLabel,
          hazardRating: o.hazardRating,
          matrixSize: `${mc.size}x${mc.size}`,
        };
      });

      setHazardResults(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setIsRunning(false);
  }, [
    config,
    mappedAssets,
    screening,
    useLocalOnly,
    mc.size,
    setHazardResults,
    setIsRunning,
    setProgress,
    setError,
  ]);

  // Rating distribution
  const ratingDist: { rating: HazardRating; count: number }[] = [
    "Extreme",
    "Very High",
    "High",
    "Medium",
    "Low",
    "Negligible",
  ].map((r) => ({
    rating: r as HazardRating,
    count: hazardResults.filter((x) => x.hazardRating === r).length,
  }));
  const barMax = Math.max(...ratingDist.map((d) => d.count), 1);

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
              Hazard Assessment
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Real-time climate data from NASA POWER, USGS, NOAA, Open-Meteo
              and other public APIs powers the hazard scoring engine.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Engine info + Run */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Satellite size={18} color={DELOITTE_COLORS.green.DEFAULT} />
              <Typography variant="subtitle1" fontWeight={700}>
                Climate Data Engine
              </Typography>
            </Stack>
            <Chip
              label={useLocalOnly ? "Local Engine" : "Live Climate APIs"}
              size="small"
              icon={useLocalOnly ? <Globe size={14} /> : <Satellite size={14} />}
              onClick={() => setUseLocalOnly(!useLocalOnly)}
              color={useLocalOnly ? "default" : "success"}
              variant={useLocalOnly ? "outlined" : "filled"}
              sx={{ cursor: "pointer", fontWeight: 600 }}
            />
          </Stack>

          <Grid container spacing={2}>
            {[
              {
                label: "Assets",
                value: mappedAssets.length,
                color: DELOITTE_COLORS.green.DEFAULT,
              },
              {
                label: "Screened Risks",
                value: new Set(screening.flatMap((s) => s.risks)).size,
                color: DELOITTE_COLORS.info,
              },
              {
                label: "Combinations",
                value: totalCombinations,
                color: "#F59E0B",
              },
              {
                label: "Matrix",
                value: `${mc.size}×${mc.size}`,
                color: "#8B5CF6",
              },
            ].map((kpi) => (
              <Grid size={{ xs: 6, md: 3 }} key={kpi.label}>
                <Paper
                  sx={{
                    p: 1.5,
                    bgcolor: alpha(kpi.color, 0.08),
                    textAlign: "center",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {kpi.label}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {kpi.value}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {isRunning && (
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2" noWrap sx={{ maxWidth: "70%" }}>
                  {currentTask || "Fetching climate data..."}
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

          {error && <Alert severity="error">{error}</Alert>}
          {hazardResults.length > 0 && !isRunning && (
            <Alert severity="success">
              {hazardResults.length} hazard assessments completed using
              {useLocalOnly ? " local geo-math engine" : " real climate data APIs"}.
            </Alert>
          )}

          <Button
            variant="contained"
            onClick={handleRun}
            disabled={isRunning || totalCombinations === 0}
            startIcon={useLocalOnly ? <Globe size={16} /> : <Satellite size={16} />}
            sx={{
              bgcolor: DELOITTE_COLORS.green.DEFAULT,
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
              py: 1.5,
            }}
          >
            {isRunning
              ? "Assessing..."
              : hazardResults.length > 0
                ? "Re-Run Hazard Assessment"
                : "Run Hazard Assessment"}
          </Button>
        </Stack>
      </Paper>

      {/* Rating distribution */}
      {hazardResults.length > 0 && (
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
            {ratingDist.map((d) => (
              <Stack
                key={d.rating}
                direction="row"
                alignItems="center"
                spacing={2}
              >
                <Typography variant="body2" sx={{ width: 90, fontWeight: 500 }}>
                  {d.rating}
                </Typography>
                <Box
                  sx={{
                    flex: 1,
                    bgcolor: alpha("#000", 0.06),
                    borderRadius: 1,
                    height: 24,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      width: `${(d.count / barMax) * 100}%`,
                      height: "100%",
                      borderRadius: 1,
                      bgcolor: HAZARD_RATING_COLORS[d.rating] || "#888",
                      transition: "width 0.5s ease",
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ width: 40, textAlign: "right" }}
                >
                  {d.count}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
      )}

      {/* Hazard results table */}
      {hazardResults.length > 0 && (
        <Paper
          sx={{
            bgcolor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 2,
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              Hazard Results
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 450 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {[
                    "Asset",
                    "Risk",
                    "Intensity",
                    "Frequency",
                    "Hazard Rating",
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
                {hazardResults.slice(0, 200).map((r, i) => (
                  <TableRow
                    key={i}
                    sx={{
                      "&:nth-of-type(even)": {
                        bgcolor: alpha(borderColor, 0.3),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
                        {r.asset}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 140 }}>
                        {r.risk}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${r.intensityScore} — ${r.intensityLabel}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${r.frequencyScore} — ${r.frequencyLabel}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 11 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={r.hazardRating}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: 11,
                          bgcolor: alpha(
                            HAZARD_RATING_COLORS[r.hazardRating] || "#888",
                            0.15,
                          ),
                          color: HAZARD_RATING_COLORS[r.hazardRating] || "#888",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {hazardResults.length > 200 && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ p: 1, display: "block", textAlign: "center" }}
            >
              Showing first 200 of {hazardResults.length} results
            </Typography>
          )}
        </Paper>
      )}
    </Stack>
  );
}
