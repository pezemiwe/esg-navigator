import { useState, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Chip,
  Tooltip,
  LinearProgress,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Download,
  RefreshCw,
  Zap,
} from "lucide-react";
import CRALayout from "../layout/CRALayout";
import CRANavigation from "../components/CRANavigation";
import {
  useCRADataStore,
  useCRAStatusStore,
  usePRARiskStore,
} from "@/store/craStore";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import * as XLSX from "xlsx";
import type {
  MappedAsset,
  ScreeningEntry,
  HazardRating,
} from "../domain/physicalRisk/types";
import {
  ALL_21_RISKS,
  SECTORS,
  ASSET_TYPE_MAP,
  HAZARD_RATING_COLORS,
  RATING_ORDER,
} from "../domain/physicalRisk/constants";
import {
  runPhysicalRiskAssessment,
  suggestRisksForAsset,
} from "../domain/physicalRisk/engine";

const STEP_LABELS = [
  "Configuration",
  "Asset Portfolio",
  "Risk Screening",
  "Assessment",
  "Results",
];

const RISK_CAT_COLORS: Record<string, string> = {
  Meteorological: "#F59E0B",
  Hydrological: "#3B82F6",
  Climatological: "#10B981",
  Geophysical: "#8B5CF6",
};

const getAssetValue = (asset: Record<string, unknown>): number =>
  Number(asset.outstandingBalance) ||
  Number(asset["Net Book Value"]) ||
  Number(asset["Book Value"]) ||
  Number(asset.bookValue) ||
  Number(asset["Market Value"]) ||
  Number(asset.value) ||
  0;

const getAssetName = (asset: Record<string, unknown>): string =>
  (asset.borrowerName as string) ||
  (asset["Tower ID"] as string) ||
  (asset["Segment ID"] as string) ||
  (asset["Facility ID"] as string) ||
  (asset["Equipment ID"] as string) ||
  (asset["System ID"] as string) ||
  (asset.id as string) ||
  "Asset";

const fmtVal = (value: number, currency?: string): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "NGN",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);

export default function PhysicalRiskAssessment() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { assets } = useCRADataStore();
  const { setPRAReady } = useCRAStatusStore();
  const { setRiskResults } = usePRARiskStore();
  const {
    activeStep,
    config,
    mappedAssets,
    screening,
    results,
    isRunning,
    progress,
    error,
    setActiveStep,
    setConfig,
    setMappedAssets,
    setScreening,
    setResults,
    setIsRunning,
    setProgress,
    setError,
  } = usePhysicalRiskStore();

  const [resultTab, setResultTab] = useState(0);

  const cardBg = isDark ? alpha("#fff", 0.05) : "#fff";
  const borderColor = isDark ? alpha("#fff", 0.12) : alpha("#000", 0.08);

  const handleLoadAssets = useCallback(() => {
    const mapped: MappedAsset[] = [];
    Object.entries(assets).forEach(([key, typeData]) => {
      if (!typeData.data?.length) return;
      const notebookType = ASSET_TYPE_MAP[key] || "Office Building";
      typeData.data.forEach((asset, idx) => {
        mapped.push({
          id: String(asset.id || `${key}_${idx}`),
          name: getAssetName(asset as Record<string, unknown>),
          assetType: notebookType,
          value: getAssetValue(asset as Record<string, unknown>),
          latitude: Number(asset.latitude) || 6.5,
          longitude: Number(asset.longitude) || 3.4,
          region: asset.region || "Lagos",
          sector: key,
        });
      });
    });
    setMappedAssets(mapped);
  }, [assets, setMappedAssets]);

  const handleAutoScreen = useCallback(() => {
    const entries: ScreeningEntry[] = mappedAssets.map((asset) => ({
      assetId: asset.id,
      assetName: asset.name,
      risks: suggestRisksForAsset(asset.latitude, asset.longitude),
    }));
    setScreening(entries);
  }, [mappedAssets, setScreening]);

  const handleRun = useCallback(() => {
    setIsRunning(true);
    setProgress(0);
    setError(null);
    setTimeout(() => {
      setProgress(30);
      setTimeout(() => {
        setProgress(60);
        setTimeout(() => {
          try {
            const res = runPhysicalRiskAssessment(
              config,
              mappedAssets,
              screening,
            );
            setResults(res);
            setProgress(100);
            setPRAReady(true);
            const riskResultMap: Record<string, unknown> = {};
            res.forEach((r) => {
              if (!riskResultMap[r.risk]) riskResultMap[r.risk] = [];
              (riskResultMap[r.risk] as unknown[]).push(r);
            });
            setRiskResults(riskResultMap);
          } catch (e) {
            setError(e instanceof Error ? e.message : String(e));
          }
          setIsRunning(false);
        }, 400);
      }, 300);
    }, 200);
  }, [
    config,
    mappedAssets,
    screening,
    setIsRunning,
    setProgress,
    setError,
    setResults,
    setPRAReady,
    setRiskResults,
  ]);

  const handleExport = useCallback(() => {
    if (!results.length) return;
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet([
        ["Physical Risk Assessment Report"],
        [],
        ["Company", config.companyName],
        ["Country", config.country],
        ["Report Date", config.reportDate],
        ["Assessor", config.assessorName],
        ["Sector", SECTORS[config.sectorId]?.name || config.sectorId],
        ["Subsector", config.subsector],
        ["Matrix Size", `${config.matrixSize}x${config.matrixSize}`],
        ["Currency", config.currency],
        ["USD Rate", config.usdRate],
        [],
        ["Total Assets", mappedAssets.length],
        ["Total Combinations", results.length],
      ]),
      "Configuration",
    );
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        results.map((r) => ({
          Asset: r.asset,
          "Asset Type": r.assetType,
          Risk: r.risk,
          Latitude: r.latitude,
          Longitude: r.longitude,
          Intensity: r.intensityLabel,
          Frequency: r.frequencyLabel,
          "Hazard Rating": r.hazardRating,
          "Exposure Factor": r.exposureFactor,
          "Inherent Vulnerability": r.inherentVulnerability,
          "SBRA RRF": r.sbraRrf,
          "Net Vulnerability": r.sbraNetVulnerability,
          [`SSL (${config.currency})`]: r.sslLocal,
          "SSL (USD)": r.sslUsd,
          "Annual Probability": r.annualProbability,
          [`EAL (${config.currency})`]: r.ealLocal,
          "EAL (USD)": r.ealUsd,
          "Risk Score": r.riskScoreNorm,
          "Response Strategy": r.responseStrategy,
          "Response Priority": r.responsePriority,
          "Response Timeframe": r.responseTimeframe,
          "Residual Risk Score": r.residualRiskScore,
          "Residual Risk Rating": r.residualRiskRating,
          "Monitoring KPI": r.monitoringKpi,
          "Monitoring Frequency": r.monitoringFrequency,
        })),
      ),
      "Full Results",
    );
    const riskSummary: Record<
      string,
      { totalEAL: number; maxRating: HazardRating; count: number }
    > = {};
    results.forEach((r) => {
      if (!riskSummary[r.risk])
        riskSummary[r.risk] = {
          totalEAL: 0,
          maxRating: "Negligible",
          count: 0,
        };
      riskSummary[r.risk].totalEAL += r.ealLocal;
      riskSummary[r.risk].count++;
      if (
        RATING_ORDER[r.hazardRating] >
        RATING_ORDER[riskSummary[r.risk].maxRating]
      )
        riskSummary[r.risk].maxRating = r.hazardRating;
    });
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(
        Object.entries(riskSummary).map(([risk, d]) => ({
          Risk: risk,
          Combinations: d.count,
          [`Total EAL (${config.currency})`]: d.totalEAL,
          "Highest Rating": d.maxRating,
        })),
      ),
      "Risk Summary",
    );
    XLSX.writeFile(
      wb,
      `PRA_Report_${config.companyName || "Company"}_${config.reportDate}.xlsx`,
    );
  }, [results, config, mappedAssets]);

  const analytics = useMemo(() => {
    if (!results.length) return null;
    const totalEAL = results.reduce((s, r) => s + r.ealLocal, 0);
    const totalEALUsd = results.reduce((s, r) => s + r.ealUsd, 0);
    const avgScore =
      results.reduce((s, r) => s + r.riskScoreNorm, 0) / results.length;
    const totalExposure = mappedAssets.reduce((s, a) => s + a.value, 0);
    const criticalCount = results.filter(
      (r) => r.hazardRating === "Extreme" || r.hazardRating === "Very High",
    ).length;
    const ratingDist: Record<HazardRating, number> = {
      Extreme: 0,
      "Very High": 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Negligible: 0,
    };
    results.forEach((r) => {
      ratingDist[r.hazardRating]++;
    });
    const topRisks = [...results]
      .sort((a, b) => b.ealLocal - a.ealLocal)
      .slice(0, 15);
    const uniqueAssets = [...new Set(results.map((r) => r.asset))];
    const uniqueRisks = [...new Set(results.map((r) => r.risk))];
    const heatMap = new Map<
      string,
      { hazardRating: HazardRating; ealLocal: number; riskScoreNorm: number }
    >();
    results.forEach((r) =>
      heatMap.set(`${r.asset}|${r.risk}`, {
        hazardRating: r.hazardRating,
        ealLocal: r.ealLocal,
        riskScoreNorm: r.riskScoreNorm,
      }),
    );
    return {
      totalEAL,
      totalEALUsd,
      avgScore,
      totalExposure,
      criticalCount,
      ratingDist,
      topRisks,
      uniqueAssets,
      uniqueRisks,
      heatMap,
    };
  }, [results, mappedAssets]);

  const totalScreeningCombinations = screening.reduce(
    (s, e) => s + e.risks.length,
    0,
  );

  const canProceed = (step: number): boolean => {
    if (step === 0)
      return config.companyName.length > 0 && config.sectorId.length > 0;
    if (step === 1) return mappedAssets.length > 0;
    if (step === 2) return totalScreeningCombinations > 0;
    if (step === 3) return results.length > 0;
    return true;
  };

  const sectorOptions = Object.entries(SECTORS).map(([id, sec]) => ({
    id,
    name: sec.name,
  }));

  const subsectorOptions =
    config.sectorId && SECTORS[config.sectorId]
      ? SECTORS[config.sectorId].subsectors
      : [];

  const renderConfig = () => (
    <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
      <Stack spacing={3}>
        <Typography variant="h6" fontWeight={600}>
          Assessment Configuration
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Company Name"
              value={config.companyName}
              onChange={(e) => setConfig({ companyName: e.target.value })}
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
            />
          </Grid>
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
                    {s}&times;{s}
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
            />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );

  const renderAssetPortfolio = () => {
    const hasData = Object.values(assets).some((t) => t.data?.length > 0);
    return (
      <Stack spacing={2}>
        <Paper
          sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              Asset Portfolio
            </Typography>
            <Button
              variant="contained"
              startIcon={<RefreshCw size={16} />}
              disabled={!hasData}
              onClick={handleLoadAssets}
              sx={{
                bgcolor: DELOITTE_COLORS.green.DEFAULT,
                "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
              }}
            >
              Load from CRA Upload
            </Button>
          </Stack>
          {!hasData && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Upload asset data in the CRA Data Upload module first, then return
              here to load assets.
            </Alert>
          )}
          {mappedAssets.length > 0 && (
            <>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {[
                  {
                    label: "Total Assets",
                    value: mappedAssets.length,
                    color: DELOITTE_COLORS.green.DEFAULT,
                  },
                  {
                    label: "Total Exposure",
                    value: fmtVal(
                      mappedAssets.reduce((s, a) => s + a.value, 0),
                      config.currency,
                    ),
                    color: DELOITTE_COLORS.info,
                  },
                  {
                    label: "Asset Types",
                    value: new Set(mappedAssets.map((a) => a.assetType)).size,
                    color: "#F59E0B",
                  },
                  {
                    label: "Regions",
                    value: new Set(mappedAssets.map((a) => a.region)).size,
                    color: "#8B5CF6",
                  },
                ].map((kpi) => (
                  <Grid size={{ xs: 6, md: 3 }} key={kpi.label}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: alpha(kpi.color, 0.1),
                        textAlign: "center",
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
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {[
                        "Name",
                        "Asset Type",
                        `Value (${config.currency})`,
                        "Lat / Lon",
                        "Region",
                      ].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mappedAssets.slice(0, 100).map((asset, i) => (
                      <TableRow
                        key={asset.id}
                        sx={{
                          bgcolor:
                            i % 2 === 0
                              ? "transparent"
                              : alpha(borderColor, 0.3),
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {asset.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={asset.assetType}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {fmtVal(asset.value, config.currency)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {asset.latitude.toFixed(2)},{" "}
                            {asset.longitude.toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>{asset.region}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {mappedAssets.length > 100 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
                >
                  Showing first 100 of {mappedAssets.length} assets
                </Typography>
              )}
            </>
          )}
        </Paper>
      </Stack>
    );
  };

  const renderScreening = () => {
    const categories = [
      "Meteorological",
      "Hydrological",
      "Climatological",
      "Geophysical",
    ];
    return (
      <Stack spacing={2}>
        <Paper
          sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              Risk Screening
            </Typography>
            <Button
              variant="contained"
              startIcon={<Zap size={16} />}
              disabled={mappedAssets.length === 0}
              onClick={handleAutoScreen}
              sx={{
                bgcolor: DELOITTE_COLORS.green.DEFAULT,
                "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
              }}
            >
              Auto-Screen All Assets
            </Button>
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Auto-screen identifies applicable physical risks for each asset
            based on geographic location and climate zone analysis.
          </Typography>
          {screening.length > 0 && (
            <>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {[
                  {
                    label: "Assets Screened",
                    value: screening.length,
                    color: DELOITTE_COLORS.green.DEFAULT,
                  },
                  {
                    label: "Unique Risks",
                    value: new Set(screening.flatMap((s) => s.risks)).size,
                    color: DELOITTE_COLORS.info,
                  },
                  {
                    label: "Total Combinations",
                    value: totalScreeningCombinations,
                    color: "#F59E0B",
                  },
                ].map((kpi) => (
                  <Grid size={{ xs: 4 }} key={kpi.label}>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: alpha(kpi.color, 0.1),
                        textAlign: "center",
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
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  Risks by Category
                </Typography>
                <Stack spacing={1.5}>
                  {categories.map((cat) => {
                    const catRisks = ALL_21_RISKS.filter(
                      (r) => r.category === cat,
                    );
                    const catColor = RISK_CAT_COLORS[cat] || "#666";
                    return (
                      <Box key={cat}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          sx={{ color: catColor }}
                        >
                          {cat}
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          flexWrap="wrap"
                          useFlexGap
                          mt={0.5}
                        >
                          {catRisks.map((r) => {
                            const count = screening.filter((s) =>
                              s.risks.includes(r.risk),
                            ).length;
                            return (
                              <Chip
                                key={r.id}
                                label={`${r.risk} (${count})`}
                                size="small"
                                sx={{
                                  bgcolor: alpha(catColor, 0.12),
                                  color: catColor,
                                  fontWeight: 500,
                                  fontSize: 11,
                                }}
                              />
                            );
                          })}
                        </Stack>
                      </Box>
                    );
                  })}
                </Stack>
              </Box>
              <TableContainer sx={{ maxHeight: 300 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {["Asset", "Location", "Risks Selected"].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600 }}>
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {screening.slice(0, 50).map((entry) => {
                      const asset = mappedAssets.find(
                        (a) => a.id === entry.assetId,
                      );
                      return (
                        <TableRow key={entry.assetId}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ maxWidth: 180 }}
                            >
                              {entry.assetName}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {asset
                                ? `${asset.latitude.toFixed(2)}, ${asset.longitude.toFixed(2)}`
                                : "-"}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              {entry.risks.slice(0, 6).map((r) => (
                                <Chip
                                  key={r}
                                  label={r}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: 10, height: 20 }}
                                />
                              ))}
                              {entry.risks.length > 6 && (
                                <Chip
                                  label={`+${entry.risks.length - 6}`}
                                  size="small"
                                  color="primary"
                                  sx={{ fontSize: 10, height: 20 }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Paper>
      </Stack>
    );
  };

  const renderAssessment = () => (
    <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
      <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
        <Typography variant="h6" fontWeight={600}>
          Run Physical Risk Assessment
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          maxWidth={500}
        >
          The assessment engine will evaluate {totalScreeningCombinations}{" "}
          asset-risk combinations across {mappedAssets.length} assets using the{" "}
          {config.matrixSize}&times;
          {config.matrixSize} hazard matrix.
        </Typography>
        <Grid
          container
          spacing={2}
          justifyContent="center"
          sx={{ maxWidth: 600 }}
        >
          {[
            {
              label: "Assets",
              value: mappedAssets.length,
              color: DELOITTE_COLORS.green.DEFAULT,
            },
            {
              label: "Risks Screened",
              value: new Set(screening.flatMap((s) => s.risks)).size,
              color: DELOITTE_COLORS.info,
            },
            {
              label: "Combinations",
              value: totalScreeningCombinations,
              color: "#F59E0B",
            },
          ].map((kpi) => (
            <Grid size={{ xs: 4 }} key={kpi.label}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  bgcolor: alpha(kpi.color, 0.1),
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
          <Box sx={{ width: "100%", maxWidth: 400 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.2),
                "& .MuiLinearProgress-bar": {
                  bgcolor: DELOITTE_COLORS.green.DEFAULT,
                },
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              textAlign="center"
              display="block"
              mt={1}
            >
              Processing... {progress}%
            </Typography>
          </Box>
        )}
        {error && (
          <Alert severity="error" sx={{ maxWidth: 400 }}>
            {error}
          </Alert>
        )}
        {results.length > 0 && !isRunning && (
          <Alert severity="success" sx={{ maxWidth: 500 }}>
            Assessment complete — {results.length} results generated across{" "}
            {new Set(results.map((r) => r.asset)).size} assets and{" "}
            {new Set(results.map((r) => r.risk)).size} risks.
          </Alert>
        )}
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            size="large"
            startIcon={<Play size={18} />}
            disabled={isRunning || totalScreeningCombinations === 0}
            onClick={handleRun}
            sx={{
              bgcolor: DELOITTE_COLORS.green.DEFAULT,
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
              px: 4,
              py: 1.5,
            }}
          >
            {results.length > 0 ? "Re-Run Assessment" : "Run Assessment"}
          </Button>
          {results.length > 0 && (
            <Button
              variant="outlined"
              size="large"
              onClick={() => setActiveStep(4)}
              endIcon={<ChevronRight size={18} />}
            >
              View Results
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );

  const renderResults = () => {
    if (!analytics) {
      return (
        <Alert severity="info">Run the assessment first to see results.</Alert>
      );
    }
    return (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          {[
            {
              label: "Total Expected Annual Loss",
              primary: fmtVal(analytics.totalEAL, config.currency),
              secondary: fmtVal(analytics.totalEALUsd, "USD"),
              color: DELOITTE_COLORS.error,
            },
            {
              label: "Average Risk Score",
              primary: `${analytics.avgScore.toFixed(0)}/100`,
              secondary: null,
              color: "#F59E0B",
            },
            {
              label: "Critical / Very High",
              primary: String(analytics.criticalCount),
              secondary: `of ${results.length} combinations`,
              color: "#DC143C",
            },
            {
              label: "Portfolio Exposure",
              primary: fmtVal(analytics.totalExposure, config.currency),
              secondary: null,
              color: DELOITTE_COLORS.green.DEFAULT,
            },
          ].map((kpi) => (
            <Grid size={{ xs: 6, md: 3 }} key={kpi.label}>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: alpha(kpi.color, 0.08),
                  border: `1px solid ${alpha(kpi.color, 0.2)}`,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {kpi.label}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  sx={{ color: kpi.color }}
                >
                  {kpi.primary}
                </Typography>
                {kpi.secondary && (
                  <Typography variant="caption" color="text.secondary">
                    {kpi.secondary}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Paper
          sx={{ p: 2, bgcolor: cardBg, border: `1px solid ${borderColor}` }}
        >
          <Typography variant="subtitle2" fontWeight={600} mb={1}>
            Rating Distribution
          </Typography>
          <Stack spacing={0.5}>
            {(Object.entries(analytics.ratingDist) as [HazardRating, number][])
              .filter(([, count]) => count > 0)
              .sort((a, b) => RATING_ORDER[b[0]] - RATING_ORDER[a[0]])
              .map(([rating, count]) => (
                <Stack
                  key={rating}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Typography
                    variant="body2"
                    sx={{ width: 80, textAlign: "right" }}
                  >
                    {rating}
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      height: 20,
                      bgcolor: alpha(borderColor, 0.3),
                      borderRadius: 1,
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(count / results.length) * 100}%`,
                        height: "100%",
                        bgcolor: HAZARD_RATING_COLORS[rating],
                        borderRadius: 1,
                        transition: "width 0.5s ease",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ width: 60 }}
                  >
                    {count} ({((count / results.length) * 100).toFixed(0)}%)
                  </Typography>
                </Stack>
              ))}
          </Stack>
        </Paper>

        <Paper sx={{ bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Tabs
            value={resultTab}
            onChange={(_, v) => setResultTab(v)}
            sx={{ borderBottom: `1px solid ${borderColor}`, px: 2 }}
          >
            <Tab label="Heat Map" />
            <Tab label="Top Risks" />
            <Tab label="Response Plan" />
          </Tabs>
          <Box sx={{ p: 2 }}>
            {resultTab === 0 && (
              <TableContainer sx={{ maxHeight: 500, overflowX: "auto" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          position: "sticky",
                          left: 0,
                          bgcolor: isDark ? "#1D1D1D" : "#fff",
                          zIndex: 3,
                          minWidth: 150,
                        }}
                      >
                        Asset
                      </TableCell>
                      {analytics.uniqueRisks.map((risk) => (
                        <TableCell
                          key={risk}
                          sx={{
                            fontWeight: 600,
                            fontSize: 9,
                            textAlign: "center",
                            writingMode: "vertical-rl",
                            transform: "rotate(180deg)",
                            minWidth: 32,
                            maxWidth: 32,
                            py: 1,
                            px: 0.5,
                          }}
                        >
                          {risk}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.uniqueAssets.slice(0, 30).map((asset) => (
                      <TableRow key={asset}>
                        <TableCell
                          sx={{
                            position: "sticky",
                            left: 0,
                            bgcolor: isDark ? "#1D1D1D" : "#fff",
                            zIndex: 1,
                            maxWidth: 150,
                          }}
                        >
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 140, fontSize: 11 }}
                          >
                            {asset}
                          </Typography>
                        </TableCell>
                        {analytics.uniqueRisks.map((risk) => {
                          const cell = analytics.heatMap.get(
                            `${asset}|${risk}`,
                          );
                          return (
                            <TableCell
                              key={risk}
                              sx={{
                                bgcolor: cell
                                  ? alpha(
                                      HAZARD_RATING_COLORS[cell.hazardRating],
                                      0.85,
                                    )
                                  : "transparent",
                                border: `1px solid ${alpha(borderColor, 0.3)}`,
                                p: 0,
                                textAlign: "center",
                                minWidth: 32,
                                maxWidth: 32,
                                cursor: cell ? "pointer" : "default",
                              }}
                            >
                              {cell && (
                                <Tooltip
                                  title={`${cell.hazardRating} | EAL: ${fmtVal(cell.ealLocal, config.currency)} | Score: ${cell.riskScoreNorm}`}
                                  arrow
                                >
                                  <Box
                                    sx={{
                                      width: "100%",
                                      height: 28,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontSize: 8,
                                        fontWeight: 700,
                                        color:
                                          RATING_ORDER[cell.hazardRating] >= 4
                                            ? "#fff"
                                            : "text.primary",
                                      }}
                                    >
                                      {cell.hazardRating.charAt(0)}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {resultTab === 1 && (
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {[
                        "Asset",
                        "Risk",
                        "Rating",
                        "Intensity",
                        "Frequency",
                        "EF",
                        "Net Vuln.",
                        `SSL (${config.currency})`,
                        `EAL (${config.currency})`,
                        "Score",
                      ].map((h) => (
                        <TableCell
                          key={h}
                          sx={{ fontWeight: 600, fontSize: 12 }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analytics.topRisks.map((r, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 120 }}
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
                              bgcolor: HAZARD_RATING_COLORS[r.hazardRating],
                              color:
                                RATING_ORDER[r.hazardRating] >= 4
                                  ? "#fff"
                                  : "#000",
                              fontWeight: 600,
                              fontSize: 11,
                            }}
                          />
                        </TableCell>
                        <TableCell>{r.intensityLabel}</TableCell>
                        <TableCell>{r.frequencyLabel}</TableCell>
                        <TableCell>
                          {(r.exposureFactor * 100).toFixed(0)}%
                        </TableCell>
                        <TableCell>
                          {(r.sbraNetVulnerability * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          {fmtVal(r.sslLocal, config.currency)}
                        </TableCell>
                        <TableCell>
                          {fmtVal(r.ealLocal, config.currency)}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {r.riskScoreNorm}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {resultTab === 2 && (
              <TableContainer sx={{ maxHeight: 500 }}>
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
                        "KPI",
                        "Monitoring",
                      ].map((h) => (
                        <TableCell
                          key={h}
                          sx={{ fontWeight: 600, fontSize: 12 }}
                        >
                          {h}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...results]
                      .filter((r) => RATING_ORDER[r.hazardRating] >= 3)
                      .sort(
                        (a, b) =>
                          RATING_ORDER[b.hazardRating] -
                          RATING_ORDER[a.hazardRating],
                      )
                      .slice(0, 20)
                      .map((r, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ maxWidth: 100 }}
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
                                bgcolor: HAZARD_RATING_COLORS[r.hazardRating],
                                color:
                                  RATING_ORDER[r.hazardRating] >= 4
                                    ? "#fff"
                                    : "#000",
                                fontWeight: 600,
                                fontSize: 11,
                              }}
                            />
                          </TableCell>
                          <TableCell>{r.responseStrategy}</TableCell>
                          <TableCell>{r.responsePriority}</TableCell>
                          <TableCell>{r.responseTimeframe}</TableCell>
                          <TableCell>
                            <Chip
                              label={r.residualRiskRating}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: 10 }}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              noWrap
                              sx={{ maxWidth: 120, fontSize: 11 }}
                            >
                              {r.monitoringKpi}
                            </Typography>
                          </TableCell>
                          <TableCell>{r.monitoringFrequency}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </Paper>

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            startIcon={<Download size={16} />}
            onClick={handleExport}
            sx={{
              bgcolor: DELOITTE_COLORS.green.DEFAULT,
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
            }}
          >
            Export to Excel
          </Button>
        </Stack>
      </Stack>
    );
  };

  return (
    <CRALayout>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3, maxWidth: 1400, mx: "auto" }}>
        <Paper
          sx={{
            p: 3,
            mb: 3,
            bgcolor: isDark
              ? alpha(DELOITTE_COLORS.green.DEFAULT, 0.08)
              : alpha(DELOITTE_COLORS.green.DEFAULT, 0.05),
            border: `1px solid ${alpha(DELOITTE_COLORS.green.DEFAULT, 0.2)}`,
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Physical Risk Assessment Engine
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Climate Physical Risk Assessment v3.0 — 21 hazards, 47 asset types,
            25 sectors
          </Typography>
        </Paper>

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {STEP_LABELS.map((label, i) => (
            <Step
              key={label}
              completed={activeStep > i}
              sx={{ cursor: "pointer" }}
              onClick={() => {
                if (i <= activeStep || canProceed(activeStep)) setActiveStep(i);
              }}
            >
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    fontWeight: activeStep === i ? 700 : 400,
                  },
                  "& .MuiStepIcon-root.Mui-completed": {
                    color: DELOITTE_COLORS.green.DEFAULT,
                  },
                  "& .MuiStepIcon-root.Mui-active": {
                    color: DELOITTE_COLORS.green.DEFAULT,
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && renderConfig()}
        {activeStep === 1 && renderAssetPortfolio()}
        {activeStep === 2 && renderScreening()}
        {activeStep === 3 && renderAssessment()}
        {activeStep === 4 && renderResults()}

        <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ChevronLeft size={16} />}
            disabled={activeStep === 0}
            onClick={() => setActiveStep(activeStep - 1)}
          >
            Back
          </Button>
          <Button
            variant="contained"
            endIcon={<ChevronRight size={16} />}
            disabled={activeStep === 4 || !canProceed(activeStep)}
            onClick={() => setActiveStep(activeStep + 1)}
            sx={{
              bgcolor: DELOITTE_COLORS.green.DEFAULT,
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
            }}
          >
            {activeStep === 3 ? "View Results" : "Next"}
          </Button>
        </Stack>

        <CRANavigation
          prevPath="/cra/segmentation"
          prevLabel="Back to Segmentation"
          nextPath="/cra/transition-risk"
          nextLabel="Transition Risk Assessment"
        />
      </Box>
    </CRALayout>
  );
}
