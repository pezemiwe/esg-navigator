import { useState, useMemo, useCallback, useRef } from "react";
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
  Upload,
  FileSpreadsheet,
  CheckCircle,
} from "lucide-react";
import CRALayout from "../layout/CRALayout";
import CRANavigation from "../components/CRANavigation";
import {
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
  HAZARD_RATING_COLORS,
  RATING_ORDER,
} from "../domain/physicalRisk/constants";
import { runPhysicalRiskAssessment } from "../domain/physicalRisk/engine";

const STEP_LABELS = [
  "Configuration",
  "Upload Assets",
  "Upload Screening",
  "Run Assessment",
  "Results",
];

const RISK_CAT_COLORS: Record<string, string> = {
  Meteorological: "#F59E0B",
  Hydrological: "#3B82F6",
  Climatological: "#10B981",
  Geophysical: "#8B5CF6",
};

const fmtVal = (value: number, currency?: string): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "NGN",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);

function cleanNumeric(value: unknown): number {
  if (typeof value === "number") return value;
  const cleaned = String(value ?? "0")
    .trim()
    .replace(/[,\s]/g, "")
    .replace(/[₦$£€]/g, "")
    .replace(/NGN|USD|GHS|KES|ZAR/gi, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    return row;
  });
}

export default function PhysicalRiskAssessment() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
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
  const [assetsFileName, setAssetsFileName] = useState("");
  const [screeningFileName, setScreeningFileName] = useState("");
  const [assetsParseError, setAssetsParseError] = useState("");
  const [screeningParseError, setScreeningParseError] = useState("");
  const assetsInputRef = useRef<HTMLInputElement>(null);
  const screeningInputRef = useRef<HTMLInputElement>(null);

  const cardBg = isDark ? alpha("#fff", 0.05) : "#fff";
  const borderColor = isDark ? alpha("#fff", 0.12) : alpha("#000", 0.08);

  const handleAssetsUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setAssetsFileName(file.name);
      setAssetsParseError("");
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          const rows = parseCSV(text);
          if (rows.length === 0) {
            setAssetsParseError("File is empty or has no data rows.");
            return;
          }
          const requiredCols = ["asset_name", "asset_type", "address", "value"];
          const headers = Object.keys(rows[0]);
          const missing = requiredCols.filter((c) => !headers.includes(c));
          if (missing.length > 0) {
            setAssetsParseError(
              `Missing required columns: ${missing.join(", ")}. Required: asset_name, asset_type, address, value`,
            );
            return;
          }
          const mapped: MappedAsset[] = rows.map((row, idx) => {
            const rawValue = cleanNumeric(row.value);
            const currency = (row.currency || "").toUpperCase();
            const valueLocal =
              currency === "USD" ? rawValue * config.usdRate : rawValue;
            return {
              id: `asset_${idx}`,
              name: row.asset_name || `Asset ${idx + 1}`,
              assetType: row.asset_type || "Office Building",
              value: valueLocal,
              latitude: parseFloat(row.latitude || row.lat || "6.5") || 6.5,
              longitude: parseFloat(row.longitude || row.lon || "3.4") || 3.4,
              region: row.address || row.region || "",
              sector: row.sector || "",
            };
          });
          setMappedAssets(mapped);
        } catch (err) {
          setAssetsParseError(
            err instanceof Error ? err.message : "Failed to parse CSV",
          );
        }
      };
      reader.readAsText(file);
      if (e.target) e.target.value = "";
    },
    [config.usdRate, setMappedAssets],
  );

  const handleScreeningUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setScreeningFileName(file.name);
      setScreeningParseError("");
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const text = ev.target?.result as string;
          const rows = parseCSV(text);
          if (rows.length === 0) {
            setScreeningParseError("File is empty or has no data rows.");
            return;
          }
          if (!Object.keys(rows[0]).includes("asset_name")) {
            setScreeningParseError(
              "screening.csv must have an 'asset_name' column.",
            );
            return;
          }
          const allRiskNames = ALL_21_RISKS.map((r) => r.risk);
          const entries: ScreeningEntry[] = rows.map((row, idx) => {
            const assetName = row.asset_name || "";
            const matchedAsset = mappedAssets.find(
              (a) => a.name === assetName,
            );
            const screened = allRiskNames.filter(
              (risk) =>
                risk in row &&
                String(row[risk]).trim().toUpperCase() === "Y",
            );
            return {
              assetId: matchedAsset?.id || `asset_${idx}`,
              assetName,
              risks: screened,
            };
          });
          setScreening(entries);
        } catch (err) {
          setScreeningParseError(
            err instanceof Error ? err.message : "Failed to parse CSV",
          );
        }
      };
      reader.readAsText(file);
      if (e.target) e.target.value = "";
    },
    [mappedAssets, setScreening],
  );

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
            const res = runPhysicalRiskAssessment(config, mappedAssets, screening);
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
    config, mappedAssets, screening,
    setIsRunning, setProgress, setError, setResults, setPRAReady, setRiskResults,
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
    const riskSummary: Record<string, { totalEAL: number; maxRating: HazardRating; count: number }> = {};
    results.forEach((r) => {
      if (!riskSummary[r.risk])
        riskSummary[r.risk] = { totalEAL: 0, maxRating: "Negligible", count: 0 };
      riskSummary[r.risk].totalEAL += r.ealLocal;
      riskSummary[r.risk].count++;
      if (RATING_ORDER[r.hazardRating] > RATING_ORDER[riskSummary[r.risk].maxRating])
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
    const avgScore = results.reduce((s, r) => s + r.riskScoreNorm, 0) / results.length;
    const totalExposure = mappedAssets.reduce((s, a) => s + a.value, 0);
    const criticalCount = results.filter(
      (r) => r.hazardRating === "Extreme" || r.hazardRating === "Very High",
    ).length;
    const ratingDist: Record<HazardRating, number> = {
      Extreme: 0, "Very High": 0, High: 0, Medium: 0, Low: 0, Negligible: 0,
    };
    results.forEach((r) => { ratingDist[r.hazardRating]++; });
    const topRisks = [...results].sort((a, b) => b.ealLocal - a.ealLocal).slice(0, 15);
    const uniqueAssets = [...new Set(results.map((r) => r.asset))];
    const uniqueRisks = [...new Set(results.map((r) => r.risk))];
    const heatMap = new Map<string, { hazardRating: HazardRating; ealLocal: number; riskScoreNorm: number }>();
    results.forEach((r) =>
      heatMap.set(`${r.asset}|${r.risk}`, {
        hazardRating: r.hazardRating, ealLocal: r.ealLocal, riskScoreNorm: r.riskScoreNorm,
      }),
    );
    return { totalEAL, totalEALUsd, avgScore, totalExposure, criticalCount, ratingDist, topRisks, uniqueAssets, uniqueRisks, heatMap };
  }, [results, mappedAssets]);

  const totalScreeningCombinations = screening.reduce((s, e) => s + e.risks.length, 0);

  const canProceed = (step: number): boolean => {
    if (step === 0) return config.companyName.length > 0 && config.sectorId.length > 0;
    if (step === 1) return mappedAssets.length > 0;
    if (step === 2) return totalScreeningCombinations > 0;
    if (step === 3) return results.length > 0;
    return true;
  };

  const sectorOptions = Object.entries(SECTORS).map(([id, sec]) => ({ id, name: sec.name }));

  const subsectorOptions =
    config.sectorId && SECTORS[config.sectorId] ? SECTORS[config.sectorId].subsectors : [];

  const renderConfig = () => (
    <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
      <Stack spacing={3}>
        <Typography variant="h6" fontWeight={600}>
          Assessment Configuration
        </Typography>
        <Alert severity="info" sx={{ mb: 1 }}>
          You will need 3 CSV files: 1. assets.csv &nbsp; 2. screening.csv
          &nbsp; 3. resilience.csv (optional)
        </Alert>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Company Name" value={config.companyName}
              onChange={(e) => setConfig({ companyName: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Country" value={config.country}
              onChange={(e) => setConfig({ country: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Report Date" type="date" value={config.reportDate}
              InputLabelProps={{ shrink: true }}
              onChange={(e) => setConfig({ reportDate: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField fullWidth label="Assessor Name" value={config.assessorName}
              onChange={(e) => setConfig({ assessorName: e.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Sector</InputLabel>
              <Select value={config.sectorId} label="Sector"
                onChange={(e) => setConfig({ sectorId: e.target.value, subsector: "" })}>
                {sectorOptions.map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Subsector</InputLabel>
              <Select value={config.subsector} label="Subsector"
                onChange={(e) => setConfig({ subsector: e.target.value as string })}>
                {subsectorOptions.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Matrix Size</InputLabel>
              <Select value={config.matrixSize} label="Matrix Size"
                onChange={(e) => setConfig({ matrixSize: Number(e.target.value) })}>
                {[3, 4, 5, 6].map((s) => (
                  <MenuItem key={s} value={s}>{s}&times;{s}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth>
              <InputLabel>Currency</InputLabel>
              <Select value={config.currency} label="Currency"
                onChange={(e) => setConfig({ currency: e.target.value as string })}>
                {["NGN", "USD", "GHS", "KES", "ZAR", "GBP", "EUR"].map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField fullWidth label="USD Exchange Rate" type="number" value={config.usdRate}
              onChange={(e) => setConfig({ usdRate: Number(e.target.value) || 1 })} />
          </Grid>
        </Grid>
      </Stack>
    </Paper>
  );

  const renderUploadAssets = () => (
    <Stack spacing={2}>
      <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            FILE 1 of 3: Upload Asset Register (assets.csv)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            CSV file with one row per asset. Required columns: asset_name,
            asset_type, address, value. Optional: latitude, longitude, currency,
            floors, has_basement, build_year.
          </Typography>
          <input type="file" accept=".csv" ref={assetsInputRef}
            style={{ display: "none" }} onChange={handleAssetsUpload} />
          <Stack direction="row" spacing={2} alignItems="center">
            <Button variant="contained" startIcon={<Upload size={16} />}
              onClick={() => assetsInputRef.current?.click()}
              sx={{ bgcolor: DELOITTE_COLORS.green.DEFAULT, "&:hover": { bgcolor: DELOITTE_COLORS.green.dark } }}>
              Upload assets.csv
            </Button>
            {assetsFileName && (
              <Stack direction="row" spacing={1} alignItems="center">
                <FileSpreadsheet size={16} color={DELOITTE_COLORS.green.DEFAULT} />
                <Typography variant="body2" fontWeight={500}>{assetsFileName}</Typography>
                {mappedAssets.length > 0 && <CheckCircle size={16} color={DELOITTE_COLORS.green.DEFAULT} />}
              </Stack>
            )}
          </Stack>
          {assetsParseError && <Alert severity="error">{assetsParseError}</Alert>}
          {mappedAssets.length > 0 && (
            <>
              <Alert severity="success">{mappedAssets.length} assets loaded successfully</Alert>
              <Grid container spacing={2} sx={{ mb: 1 }}>
                {[
                  { label: "Total Assets", value: mappedAssets.length, color: DELOITTE_COLORS.green.DEFAULT },
                  { label: "Total Exposure", value: fmtVal(mappedAssets.reduce((s, a) => s + a.value, 0), config.currency), color: DELOITTE_COLORS.info },
                  { label: "Asset Types", value: new Set(mappedAssets.map((a) => a.assetType)).size, color: "#F59E0B" },
                ].map((kpi) => (
                  <Grid size={{ xs: 4 }} key={kpi.label}>
                    <Paper sx={{ p: 2, bgcolor: alpha(kpi.color, 0.1), textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                      <Typography variant="h5" fontWeight={700}>{kpi.value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {["Name", "Asset Type", `Value (${config.currency})`, "Lat / Lon", "Address"].map((h) => (
                        <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mappedAssets.slice(0, 100).map((asset, i) => (
                      <TableRow key={asset.id} sx={{ bgcolor: i % 2 === 0 ? "transparent" : alpha(borderColor, 0.3) }}>
                        <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{asset.name}</Typography></TableCell>
                        <TableCell><Chip label={asset.assetType} size="small" variant="outlined" /></TableCell>
                        <TableCell align="right">{fmtVal(asset.value, config.currency)}</TableCell>
                        <TableCell><Typography variant="body2" color="text.secondary">{asset.latitude.toFixed(4)}, {asset.longitude.toFixed(4)}</Typography></TableCell>
                        <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{asset.region}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {mappedAssets.length > 100 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  Showing first 100 of {mappedAssets.length} assets
                </Typography>
              )}
            </>
          )}
        </Stack>
      </Paper>
    </Stack>
  );

  const renderUploadScreening = () => {
    const categories = ["Meteorological", "Hydrological", "Climatological", "Geophysical"] as const;
    return (
      <Stack spacing={2}>
        <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={600}>
              FILE 2 of 3: Upload Risk Screening (screening.csv)
            </Typography>
            <Typography variant="body2" color="text.secondary">
              CSV file with asset_name column and one column per risk (Y or N).
              Each row maps an asset to its screened-in physical risks.
            </Typography>
            <input type="file" accept=".csv" ref={screeningInputRef}
              style={{ display: "none" }} onChange={handleScreeningUpload} />
            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="contained" startIcon={<Upload size={16} />}
                onClick={() => screeningInputRef.current?.click()}
                disabled={mappedAssets.length === 0}
                sx={{ bgcolor: DELOITTE_COLORS.green.DEFAULT, "&:hover": { bgcolor: DELOITTE_COLORS.green.dark } }}>
                Upload screening.csv
              </Button>
              {screeningFileName && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <FileSpreadsheet size={16} color={DELOITTE_COLORS.green.DEFAULT} />
                  <Typography variant="body2" fontWeight={500}>{screeningFileName}</Typography>
                  {screening.length > 0 && <CheckCircle size={16} color={DELOITTE_COLORS.green.DEFAULT} />}
                </Stack>
              )}
            </Stack>
            {mappedAssets.length === 0 && (
              <Alert severity="warning">Upload assets.csv first before uploading the screening file.</Alert>
            )}
            {screeningParseError && <Alert severity="error">{screeningParseError}</Alert>}
            {screening.length > 0 && (
              <>
                <Alert severity="success">
                  Screening loaded for {screening.length} assets — {totalScreeningCombinations} asset-risk combinations
                </Alert>
                <Grid container spacing={2} sx={{ mb: 1 }}>
                  {[
                    { label: "Assets Screened", value: screening.length, color: DELOITTE_COLORS.green.DEFAULT },
                    { label: "Unique Risks", value: new Set(screening.flatMap((s) => s.risks)).size, color: DELOITTE_COLORS.info },
                    { label: "Total Combinations", value: totalScreeningCombinations, color: "#F59E0B" },
                  ].map((kpi) => (
                    <Grid size={{ xs: 4 }} key={kpi.label}>
                      <Paper sx={{ p: 2, bgcolor: alpha(kpi.color, 0.1), textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                        <Typography variant="h5" fontWeight={700}>{kpi.value}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
                <Box>
                  <Typography variant="subtitle2" fontWeight={600} mb={1}>Risks by Category</Typography>
                  <Stack spacing={1.5}>
                    {categories.map((cat) => {
                      const catRisks = ALL_21_RISKS.filter((r) => r.category === cat);
                      const catColor = RISK_CAT_COLORS[cat] || "#666";
                      return (
                        <Box key={cat}>
                          <Typography variant="caption" fontWeight={600} sx={{ color: catColor }}>{cat}</Typography>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap mt={0.5}>
                            {catRisks.map((r) => {
                              const count = screening.filter((s) => s.risks.includes(r.risk)).length;
                              return (
                                <Chip key={r.id} label={`${r.risk} (${count})`} size="small"
                                  sx={{ bgcolor: alpha(catColor, 0.12), color: catColor, fontWeight: 500, fontSize: 11 }} />
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
                        {["Asset", "Risks Screened In", "Count"].map((h) => (
                          <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {screening.slice(0, 50).map((entry) => (
                        <TableRow key={entry.assetId}>
                          <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 180 }}>{entry.assetName}</Typography></TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                              {entry.risks.slice(0, 6).map((r) => (
                                <Chip key={r} label={r} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} />
                              ))}
                              {entry.risks.length > 6 && (
                                <Chip label={`+${entry.risks.length - 6}`} size="small" color="primary" sx={{ fontSize: 10, height: 20 }} />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell><Typography variant="body2" fontWeight={600}>{entry.risks.length} / 21</Typography></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Stack>
        </Paper>
      </Stack>
    );
  };

  const renderAssessment = () => (
    <Stack spacing={2}>
      <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>Run Physical Risk Assessment</Typography>
          <Grid container spacing={2}>
            {[
              { label: "Assets", value: mappedAssets.length },
              { label: "Screening Entries", value: screening.length },
              { label: "Total Combinations", value: totalScreeningCombinations },
            ].map((kpi) => (
              <Grid size={{ xs: 4 }} key={kpi.label}>
                <Paper sx={{ p: 2, bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.08), textAlign: "center" }}>
                  <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                  <Typography variant="h5" fontWeight={700}>{kpi.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
          <Alert severity="info">
            The engine will compute hazard scores using geo-spatial factors, apply vulnerability and
            SBRA tables, calculate Expected Annual Loss for each asset-risk combination, and generate
            response strategies aligned with your risk appetite.
          </Alert>
          {isRunning && (
            <Box>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="body2">Processing...</Typography>
                <Typography variant="body2" fontWeight={600}>{progress}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={progress}
                sx={{ height: 8, borderRadius: 4, bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.15),
                  "& .MuiLinearProgress-bar": { bgcolor: DELOITTE_COLORS.green.DEFAULT, borderRadius: 4 } }} />
            </Box>
          )}
          {error && <Alert severity="error">{error}</Alert>}
          {results.length > 0 && !isRunning && (
            <Alert severity="success">{results.length} results generated successfully.</Alert>
          )}
          <Button variant="contained" onClick={handleRun} disabled={isRunning || totalScreeningCombinations === 0}
            sx={{ bgcolor: DELOITTE_COLORS.green.DEFAULT, "&:hover": { bgcolor: DELOITTE_COLORS.green.dark }, py: 1.5 }}>
            {isRunning ? "Running..." : results.length > 0 ? "Re-Run Assessment" : "Run Assessment"}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );

  const renderResults = () => {
    if (results.length === 0) return (
      <Paper sx={{ p: 4, textAlign: "center", bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
        <Typography variant="h6" color="text.secondary">No results yet. Run the assessment first.</Typography>
      </Paper>
    );
    const ratings = ["Negligible", "Low", "Moderate", "High", "Very High", "Extreme"] as const;
    const ratingDist = ratings.map((r) => ({ rating: r, count: results.filter((x) => x.riskRating === r).length }));
    const topRisks = [...results].sort((a, b) => b.riskScoreNorm - a.riskScoreNorm).slice(0, 15);
    const currSym = config.currency === "USD" ? "$" : config.currency === "NGN" ? "₦" : config.currency;
    const fmt = (v: number) => v >= 1e9 ? `${(v / 1e9).toFixed(2)}B` : v >= 1e6 ? `${(v / 1e6).toFixed(2)}M` : v >= 1e3 ? `${(v / 1e3).toFixed(1)}K` : v.toFixed(0);
    const totalEal = results.reduce((s, r) => s + r.ealLocal, 0);
    const avgScore = results.reduce((s, r) => s + r.riskScoreNorm, 0) / results.length;
    const criticalCount = results.filter((r) => r.riskRating === "Extreme" || r.riskRating === "Very High").length;
    const totalExposure = results.reduce((s, r) => s + r.exposedValue, 0);
    const barMax = Math.max(...ratingDist.map((d) => d.count), 1);
    return (
      <Stack spacing={2}>
        <Grid container spacing={2}>
          {[
            { label: "Total EAL", value: `${currSym}${fmt(totalEal)}`, color: "#EF4444" },
            { label: "Avg Risk Score", value: avgScore.toFixed(1), color: DELOITTE_COLORS.info },
            { label: "Critical / Very High", value: criticalCount, color: "#F59E0B" },
            { label: "Portfolio Exposure", value: `${currSym}${fmt(totalExposure)}`, color: DELOITTE_COLORS.green.DEFAULT },
          ].map((kpi) => (
            <Grid size={{ xs: 6, md: 3 }} key={kpi.label}>
              <Paper sx={{ p: 2, bgcolor: alpha(kpi.color, 0.08), textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">{kpi.label}</Typography>
                <Typography variant="h5" fontWeight={700}>{kpi.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Rating Distribution</Typography>
          <Stack spacing={1.5}>
            {ratingDist.map((d) => (
              <Stack key={d.rating} direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" sx={{ width: 90, fontWeight: 500 }}>{d.rating}</Typography>
                <Box sx={{ flex: 1, bgcolor: alpha("#000", 0.06), borderRadius: 1, height: 24, overflow: "hidden" }}>
                  <Box sx={{ width: `${(d.count / barMax) * 100}%`, height: "100%", borderRadius: 1,
                    bgcolor: HAZARD_RATING_COLORS[d.rating as keyof typeof HAZARD_RATING_COLORS] || "#888",
                    transition: "width 0.5s ease" }} />
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ width: 40, textAlign: "right" }}>{d.count}</Typography>
              </Stack>
            ))}
          </Stack>
        </Paper>
        <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600}>
              {resultsTab === 0 ? "Top Risks" : resultsTab === 1 ? "All Results" : "Response Plan"}
            </Typography>
            <Tabs value={resultsTab} onChange={(_, v) => setResultsTab(v)} sx={{ minHeight: 32 }}>
              <Tab label="Top Risks" sx={{ minHeight: 32, py: 0 }} />
              <Tab label="All Results" sx={{ minHeight: 32, py: 0 }} />
              <Tab label="Response" sx={{ minHeight: 32, py: 0 }} />
            </Tabs>
          </Stack>
          {resultsTab === 0 && (
            <TableContainer sx={{ maxHeight: 450 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["Asset", "Risk", "Rating", "Score", "EAL", "SSL"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topRisks.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 150 }}>{r.assetName}</Typography></TableCell>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 130 }}>{r.risk}</Typography></TableCell>
                      <TableCell>
                        <Chip label={r.riskRating} size="small" sx={{ fontWeight: 600, fontSize: 11,
                          bgcolor: alpha(HAZARD_RATING_COLORS[r.riskRating as keyof typeof HAZARD_RATING_COLORS] || "#888", 0.15),
                          color: HAZARD_RATING_COLORS[r.riskRating as keyof typeof HAZARD_RATING_COLORS] || "#888" }} />
                      </TableCell>
                      <TableCell><Typography variant="body2" fontWeight={600}>{r.riskScoreNorm.toFixed(1)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{currSym}{fmt(r.ealLocal)}</Typography></TableCell>
                      <TableCell><Typography variant="body2">{currSym}{fmt(r.sslLocal)}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {resultsTab === 1 && (
            <TableContainer sx={{ maxHeight: 450 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["Asset", "Risk", "Rating", "Score", "Vulnerability", "EF", "EAL", "SSL"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.slice(0, 200).map((r, i) => (
                    <TableRow key={i} sx={{ "&:nth-of-type(even)": { bgcolor: alpha("#000", 0.02) } }}>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 130 }}>{r.assetName}</Typography></TableCell>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 110 }}>{r.risk}</Typography></TableCell>
                      <TableCell>
                        <Chip label={r.riskRating} size="small" sx={{ fontWeight: 600, fontSize: 10,
                          bgcolor: alpha(HAZARD_RATING_COLORS[r.riskRating as keyof typeof HAZARD_RATING_COLORS] || "#888", 0.15),
                          color: HAZARD_RATING_COLORS[r.riskRating as keyof typeof HAZARD_RATING_COLORS] || "#888" }} />
                      </TableCell>
                      <TableCell>{r.riskScoreNorm.toFixed(1)}</TableCell>
                      <TableCell>{(r.inherentVulnerability * 100).toFixed(0)}%</TableCell>
                      <TableCell>{(r.exposureFactor * 100).toFixed(0)}%</TableCell>
                      <TableCell>{currSym}{fmt(r.ealLocal)}</TableCell>
                      <TableCell>{currSym}{fmt(r.sslLocal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {resultsTab === 2 && (
            <TableContainer sx={{ maxHeight: 450 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {["Asset", "Risk", "Strategy", "Priority", "Timeframe", "Residual Rating", "KPI"].map((h) => (
                      <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.slice(0, 200).map((r, i) => (
                    <TableRow key={i}>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 120 }}>{r.assetName}</Typography></TableCell>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 100 }}>{r.risk}</Typography></TableCell>
                      <TableCell><Chip label={r.responseStrategy} size="small" variant="outlined" sx={{ fontSize: 10, height: 20 }} /></TableCell>
                      <TableCell>
                        <Chip label={r.responsePriority} size="small" sx={{ fontSize: 10, height: 20,
                          bgcolor: r.responsePriority === "Immediate" ? alpha("#EF4444", 0.12) :
                            r.responsePriority === "High" ? alpha("#F59E0B", 0.12) : alpha("#22C55E", 0.12),
                          color: r.responsePriority === "Immediate" ? "#EF4444" :
                            r.responsePriority === "High" ? "#F59E0B" : "#22C55E" }} />
                      </TableCell>
                      <TableCell><Typography variant="body2" fontSize={11}>{r.responseTimeframe}</Typography></TableCell>
                      <TableCell>
                        <Chip label={r.residualRiskRating} size="small" sx={{ fontWeight: 600, fontSize: 10,
                          bgcolor: alpha(HAZARD_RATING_COLORS[r.residualRiskRating as keyof typeof HAZARD_RATING_COLORS] || "#888", 0.15),
                          color: HAZARD_RATING_COLORS[r.residualRiskRating as keyof typeof HAZARD_RATING_COLORS] || "#888" }} />
                      </TableCell>
                      <TableCell><Typography variant="body2" noWrap sx={{ maxWidth: 120, fontSize: 11 }}>{r.monitoringKpi}</Typography></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
        <Button variant="contained" startIcon={<FileSpreadsheet size={16} />} onClick={handleExport}
          sx={{ bgcolor: DELOITTE_COLORS.green.DEFAULT, "&:hover": { bgcolor: DELOITTE_COLORS.green.dark }, alignSelf: "flex-start", py: 1.2 }}>
          Export Full Results to Excel
        </Button>
      </Stack>
    );
  };

  const steps = ["Configuration", "Upload Assets", "Upload Screening", "Run Assessment", "Results"];

  return (
    <CRALayout>
      <Stack spacing={3} sx={{ maxWidth: 1200, mx: "auto" }}>
        <Paper sx={{ p: 3, bgcolor: cardBg, border: `1px solid ${borderColor}` }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Physical Risk Assessment Engine
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upload your asset portfolio and risk screening files to compute hazard scores,
            vulnerability, expected annual losses and response strategies.
          </Typography>
        </Paper>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box>
          {activeStep === 0 && renderConfig()}
          {activeStep === 1 && renderUploadAssets()}
          {activeStep === 2 && renderUploadScreening()}
          {activeStep === 3 && renderAssessment()}
          {activeStep === 4 && renderResults()}
        </Box>
        <Stack direction="row" justifyContent="space-between">
          <Button variant="outlined" disabled={activeStep === 0}
            onClick={() => setActiveStep((p) => p - 1)}
            sx={{ borderColor: DELOITTE_COLORS.green.DEFAULT, color: DELOITTE_COLORS.green.DEFAULT }}>
            Back
          </Button>
          <Button variant="contained" disabled={!canProceed || activeStep === steps.length - 1}
            onClick={() => setActiveStep((p) => p + 1)}
            sx={{ bgcolor: DELOITTE_COLORS.green.DEFAULT, "&:hover": { bgcolor: DELOITTE_COLORS.green.dark } }}>
            Next
          </Button>
        </Stack>
        <CRANavigation />
      </Stack>
    </CRALayout>
  );
}
