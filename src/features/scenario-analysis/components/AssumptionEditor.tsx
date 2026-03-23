import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Slider,
  TextField,
  InputAdornment,
  Divider,
  Stack,
  Grid,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Database,
  Zap,
  Building2,
} from "lucide-react";
import {
  useCRADataStore,
  usePRARiskStore,
  useTRARiskStore,
} from "@/store/craStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useScenarioStore } from "@/store/scenarioStore";
import { useToast } from "@/features/e-learnings/components/ui/ToastContext";
import { FileSignature } from "lucide-react";
import { getSectorById } from "@/features/scenario-analysis/data/sectorConfig";
interface AssumptionEditorProps {
  onNext: () => void;
  onBack: () => void;
}
const MACRO_ECONOMIC_VARIABLES = [
  "Real GDP Growth",
  "Nominal GDP Growth",
  "Inflation (CPI)",
  "Unemployment Rate",
  "Short-Term Interest Rate",
  "Long-Term Interest Rate",
  "Exchange Rate (USD/S)",
  "Equity Price Index",
  "Residential Real Estate Price Index",
  "Commercial Real Estate Price Index",
  "Energy Prices (Oil)",
  "Energy Prices (Gas)",
  "Commodity Prices (Gold)",
  "Commodity Prices (Cocoa)",
  "Carbon Price (ETS)",
  "Electricity Price",
  "Consumer Confidence Index",
  "Industrial Production",
  "Household Debt to Income",
  "Corporate Bond Spreads",
  "Government Debt to GDP",
];
const DATA_FREQUENCIES = ["Monthly", "Quarterly", "Annual"];
export default function AssumptionEditor({
  onNext,
  onBack,
}: AssumptionEditorProps) {
  const theme = useTheme();
  const { activeScenario, updateParameter, runScenario, selectedSectorId } =
    useScenarioStore();
  const selectedSector = selectedSectorId
    ? getSectorById(selectedSectorId)
    : null;
  const { assets } = useCRADataStore();
  const { riskResults, physicalShockMatrix } = usePRARiskStore();
  const { transRiskScores, sectorRiskScores, transitionShockMatrix } =
    useTRARiskStore();
  const { addToast } = useToast();
  const [selectedMEVs, setSelectedMEVs] = useState<string[]>([]);
  const [dataFrequency, setDataFrequency] = useState<string>("Quarterly");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success">("idle");
  const [physicalShockLoaded, setPhysicalShockLoaded] = useState(false);
  const [transitionShockLoaded, setTransitionShockLoaded] = useState(false);
  const [governanceChecked, setGovernanceChecked] = useState(false);
  const { totalExposure, sectorDistribution } = useMemo(() => {
    const allAssets = Object.values(assets).flatMap((a) => a.data || []);
    if (allAssets.length === 0)
      return { totalExposure: 10000000, sectorDistribution: {} };
    const exposure = allAssets.reduce(
      (sum, a) =>
        sum +
        (Number(a.outstandingBalance) ||
          Number(a["Net Book Value"]) ||
          Number(a["Book Value"]) ||
          0),
      0,
    );
    const sectors: Record<string, number> = {};
    allAssets.forEach((a) => {
      const s = a.sector || "Unclassified";
      sectors[s] =
        (sectors[s] || 0) +
        (Number(a.outstandingBalance) ||
          Number(a["Net Book Value"]) ||
          Number(a["Book Value"]) ||
          0);
    });
    return { totalExposure: exposure, sectorDistribution: sectors };
  }, [assets]);
  if (!activeScenario) return null;
  const handleToggleMEV = (mev: string) => {
    setSelectedMEVs((prev) =>
      prev.includes(mev) ? prev.filter((m) => m !== mev) : [...prev, mev],
    );
  };
  const handleSimulateUpload = () => {
    if (selectedMEVs.length === 0) {
      addToast("Please select at least one variable.", "error");
      return;
    }
    setTimeout(() => {
      setUploadStatus("success");
    }, 1000);
  };
  const handleRun = () => {
    runScenario({ totalExposure, sectorDistribution });
    onNext();
  };
  const renderAssumptionControl = (
    key: string,
    label: string,
    tooltip: string,
    type: "currency" | "percent" | "number",
    min: number,
    max: number,
    step: number,
  ) => {
    const val = (activeScenario as unknown as Record<string, number>)[key] || 0;
    const handleChange = (_: Event, newValue: number | number[]) => {
      updateParameter(key, newValue as number);
    };
    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = parseFloat(e.target.value);
      if (!isNaN(num)) {
        updateParameter(key, num);
      }
    };
    return (
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography variant="body2" fontWeight={600}>
            {label}
          </Typography>
          <Tooltip title={tooltip}>
            <HelpCircle size={14} color={theme.palette.text.secondary} />
          </Tooltip>
        </Stack>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 8 }}>
            <Slider
              size="small"
              value={val}
              min={min}
              max={max}
              step={step}
              onChange={handleChange}
              valueLabelDisplay="auto"
              sx={{ color: DELOITTE_COLORS.green.DEFAULT }}
            />
          </Grid>
          <Grid size={{ xs: 4 }}>
            <TextField
              size="small"
              type="number"
              fullWidth
              value={val}
              onChange={handleTextChange}
              InputProps={{
                startAdornment:
                  type === "currency" ? (
                    <InputAdornment position="start">$</InputAdornment>
                  ) : null,
                endAdornment:
                  type === "percent" ? (
                    <InputAdornment position="end">%</InputAdornment>
                  ) : null,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  };
  return (
    <Box maxWidth="lg">
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Refine Model Assumptions
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Configure the macroeconomic and climate variables for the "
        {activeScenario.name}" scenario.
      </Typography>

      {selectedSector && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 3,
            border: `1px solid ${alpha(selectedSector.color, 0.3)}`,
            bgcolor: alpha(selectedSector.color, 0.04),
            borderRadius: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 2 }}
          >
            <Building2 size={18} color={selectedSector.color} />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={600}
              >
                SECTOR-CALIBRATED PARAMETERS
              </Typography>
              <Typography variant="subtitle2" fontWeight={700}>
                {selectedSector.name}
              </Typography>
            </Box>
          </Stack>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Carbon β
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {activeScenario.betaCarbon.toFixed(4)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                GDP β
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {activeScenario.betaGDP.toFixed(2)}
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Physical Multiplier
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {activeScenario.betaPhysical.toFixed(1)}×
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Gross Margin
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                {(selectedSector.financialProfile.grossMargin * 100).toFixed(0)}
                %
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Macro Economic Variables (MEVs)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Select key variables to include in the stress test model.
                </Typography>
              </Box>
              <Chip
                label={`${selectedMEVs.length} Selected`}
                color="primary"
                size="small"
                sx={{
                  bgcolor: DELOITTE_COLORS.slate.lit,
                  color: "#fff",
                  fontWeight: 600,
                }}
              />
            </Stack>
            <Box
              sx={{
                maxHeight: 300,
                overflowY: "auto",
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 2,
                mb: 3,
                bgcolor: theme.palette.background.default,
              }}
            >
              <Grid container spacing={1}>
                {MACRO_ECONOMIC_VARIABLES.map((mev) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={mev}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedMEVs.includes(mev)}
                          onChange={() => handleToggleMEV(mev)}
                          size="small"
                          sx={{
                            color: DELOITTE_COLORS.slate.DEFAULT,
                            "&.Mui-checked": {
                              color: DELOITTE_COLORS.green.DEFAULT,
                            },
                          }}
                        />
                      }
                      label={<Typography variant="body2">{mev}</Typography>}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Data Configuration
            </Typography>
            <Grid container spacing={3} alignItems="flex-end">
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Data Frequency</InputLabel>
                  <Select
                    value={dataFrequency}
                    label="Data Frequency"
                    onChange={(e) => setDataFrequency(e.target.value)}
                  >
                    {DATA_FREQUENCIES.map((freq) => (
                      <MenuItem key={freq} value={freq}>
                        {freq}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                {uploadStatus === "success" ? (
                  <Alert
                    severity="success"
                    sx={{ py: 0, alignItems: "center" }}
                  >
                    Data successfully linked
                  </Alert>
                ) : (
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Upload size={16} />}
                    onClick={handleSimulateUpload}
                    sx={{
                      color: DELOITTE_COLORS.slate.DEFAULT,
                      borderColor: DELOITTE_COLORS.slate.DEFAULT,
                    }}
                  >
                    Upload MEV Data
                  </Button>
                )}
              </Grid>
            </Grid>
          </Paper>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Shock Propagation
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Import calibrated shocks from the Physical and Transition risk
              modules.
            </Typography>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  bgcolor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${
                    physicalShockLoaded
                      ? DELOITTE_COLORS.success
                      : theme.palette.divider
                  }`,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Physical Risk Shocks
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Source: Physical Risk Module (RCP 4.5/8.5)
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant={physicalShockLoaded ? "contained" : "outlined"}
                  color={physicalShockLoaded ? "success" : "primary"}
                  startIcon={<Zap size={14} />}
                  onClick={() => {
                    let totalWeitedRisk = 0;
                    let totalExp = 0;
                    Object.keys(riskResults).forEach((riskId) => {
                      const methodResults = (
                        riskResults as Record<
                          string,
                          Record<
                            string,
                            | {
                                allAssets?: Array<Record<string, unknown>>;
                                allAssetsWithScores?: Array<
                                  Record<string, unknown>
                                >;
                              }
                            | Array<Record<string, unknown>>
                          >
                        >
                      )[riskId];
                      if (!methodResults) return;
                      Object.keys(methodResults).forEach((method) => {
                        const result = methodResults[method];
                        const assetList = Array.isArray(result)
                          ? result
                          : result?.allAssets || [];
                        assetList.forEach((a: Record<string, unknown>) => {
                          const exp =
                            Number(a["outstandingBalance"]) ||
                            Number(a["Net Book Value"]) ||
                            Number(a["Book Value"]) ||
                            0;
                          const score = Number(a["riskScore"]) || 0;
                          totalWeitedRisk += score * exp;
                          totalExp += exp;
                        });
                      });
                    });
                    if (totalExp === 0) {
                      addToast(
                        "Physical shocks loaded (No assessment data found).",
                        "warning",
                      );
                      setPhysicalShockLoaded(true);
                      return;
                    }
                    const avgScore = totalWeitedRisk / totalExp;
                    const pdi = (avgScore / 25) * 0.5;
                    updateParameter(
                      "physicalDamageIndex",
                      parseFloat(pdi.toFixed(4)),
                    );
                    setPhysicalShockLoaded(true);
                  }}
                  sx={
                    physicalShockLoaded
                      ? { bgcolor: DELOITTE_COLORS.success, color: "#fff" }
                      : {
                          color: DELOITTE_COLORS.slate.DEFAULT,
                          borderColor: DELOITTE_COLORS.slate.DEFAULT,
                        }
                  }
                >
                  {physicalShockLoaded
                    ? "Shocks Loaded"
                    : "Get Physical Shocks"}
                </Button>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  bgcolor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${
                    transitionShockLoaded
                      ? DELOITTE_COLORS.success
                      : theme.palette.divider
                  }`,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Transition Risk Shocks
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Source: Transition Risk Module (NGFS Models)
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant={transitionShockLoaded ? "contained" : "outlined"}
                  color={transitionShockLoaded ? "success" : "primary"}
                  startIcon={<Database size={14} />}
                  onClick={() => {
                    const sectorScoreMap: Record<string, number> = {};
                    const scoresBySector: Record<string, number[]> = {};
                    if (transRiskScores.length === 0) {
                      if (
                        sectorRiskScores &&
                        Object.keys(sectorRiskScores).length > 0
                      ) {
                        Object.keys(sectorRiskScores).forEach((sec) => {
                          sectorScoreMap[sec] = sectorRiskScores[sec];
                        });
                      }
                    } else {
                      transRiskScores.forEach((s) => {
                        if (!scoresBySector[s.sector])
                          scoresBySector[s.sector] = [];
                        scoresBySector[s.sector].push(s.impact * s.likelihood);
                      });
                      Object.keys(scoresBySector).forEach((sec) => {
                        const vals = scoresBySector[sec];
                        sectorScoreMap[sec] =
                          vals.reduce((a, b) => a + b, 0) / vals.length;
                      });
                    }
                    let totalWeited = 0;
                    let totalExp = 0;
                    let foundData = false;
                    Object.values(assets).forEach((assetType) => {
                      if (!assetType.data) return;
                      assetType.data.forEach((a) => {
                        const sec = a.sector;
                        if (sec && sectorScoreMap[sec]) {
                          foundData = true;
                          const exp =
                            Number(a.outstandingBalance) ||
                            Number(a["Net Book Value"] as number) ||
                            Number(a["Book Value"] as number) ||
                            0;
                          totalWeited += sectorScoreMap[sec] * exp;
                          totalExp += exp;
                        }
                      });
                    });
                    if (!foundData || totalExp === 0) {
                      addToast(
                        "Transition shocks loaded (No assessment data found).",
                        "warning",
                      );
                      setTransitionShockLoaded(true);
                      return;
                    }
                    const avg = totalWeited / totalExp;
                    const price = Math.max(0, (avg - 1) * 10);
                    updateParameter(
                      "carbonPrice",
                      parseFloat(price.toFixed(2)),
                    );
                    setTransitionShockLoaded(true);
                  }}
                  sx={
                    transitionShockLoaded
                      ? { bgcolor: DELOITTE_COLORS.success, color: "#fff" }
                      : {
                          color: DELOITTE_COLORS.slate.DEFAULT,
                          borderColor: DELOITTE_COLORS.slate.DEFAULT,
                        }
                  }
                >
                  {transitionShockLoaded
                    ? "Shocks Loaded"
                    : "Get Transition Shocks"}
                </Button>
              </Box>
            </Stack>

            {(physicalShockLoaded || transitionShockLoaded) && (
              <Box mt={3}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" fontWeight={700} mb={2}>
                  Imported Shock Parameters (NGFS Scenarios)
                </Typography>
                <Grid container spacing={2}>
                  {transitionShockLoaded && transitionShockMatrix && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ mb: 1, display: "block" }}
                      >
                        TRANSITION SHOCKS (High Carbon Sectors)
                      </Typography>
                      <TableContainer
                        sx={{
                          border: `1px solid`,
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                              <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>
                                Scenario
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 700, fontSize: 11 }}
                              >
                                Short
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 700, fontSize: 11 }}
                              >
                                Medium
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 700, fontSize: 11 }}
                              >
                                Long
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {["Orderly", "Disorderly", "Hothouse"].map((sc) => (
                              <TableRow key={sc}>
                                <TableCell
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: 12,
                                    color:
                                      sc === "Orderly"
                                        ? "#10B981"
                                        : sc === "Disorderly"
                                          ? "#F59E0B"
                                          : "#EF4444",
                                  }}
                                >
                                  {sc}
                                </TableCell>
                                {["Short Term", "Medium Term", "Long Term"].map(
                                  (h) => (
                                    <TableCell key={h} align="center">
                                      <Chip
                                        label={`${transitionShockMatrix[h]?.[sc] ?? 0}%`}
                                        size="small"
                                        sx={{
                                          fontWeight: 700,
                                          fontSize: 11,
                                          height: 22,
                                        }}
                                      />
                                    </TableCell>
                                  ),
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                  {physicalShockLoaded && physicalShockMatrix && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ mb: 1, display: "block" }}
                      >
                        PHYSICAL SHOCKS (Portfolio-Wide)
                      </Typography>
                      <TableContainer
                        sx={{
                          border: `1px solid`,
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                              <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>
                                Scenario
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 700, fontSize: 11 }}
                              >
                                Short
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 700, fontSize: 11 }}
                              >
                                Medium
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ fontWeight: 700, fontSize: 11 }}
                              >
                                Long
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {["Orderly", "Disorderly", "Hothouse"].map((sc) => (
                              <TableRow key={sc}>
                                <TableCell
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: 12,
                                    color:
                                      sc === "Orderly"
                                        ? "#10B981"
                                        : sc === "Disorderly"
                                          ? "#F59E0B"
                                          : "#EF4444",
                                  }}
                                >
                                  {sc}
                                </TableCell>
                                {["Short Term", "Medium Term", "Long Term"].map(
                                  (h) => (
                                    <TableCell key={h} align="center">
                                      <Chip
                                        label={`${physicalShockMatrix[h]?.[sc] ?? 0}%`}
                                        size="small"
                                        sx={{
                                          fontWeight: 700,
                                          fontSize: 11,
                                          height: 22,
                                        }}
                                      />
                                    </TableCell>
                                  ),
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              height: "100%",
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Key Parameter Overrides
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Fine-tune the specific shock magnitudes applied to the portfolio.
            </Typography>
            <Divider sx={{ mb: 3 }} />
            {renderAssumptionControl(
              "carbonPrice",
              "Carbon Price ($/tCO2)",
              "The projected price per ton of CO2e.",
              "currency",
              0,
              300,
              5,
            )}
            {renderAssumptionControl(
              "gdpShock",
              "GDP Shock (%)",
              "Projected economic contraction or growth impact.",
              "percent",
              -15,
              5,
              0.1,
            )}
            {renderAssumptionControl(
              "inflationShock",
              "Inflation Shock (%)",
              "Projected increase in inflation.",
              "percent",
              0,
              25,
              0.1,
            )}
            {renderAssumptionControl(
              "interestRateShock",
              "Interest Rate Shock (%)",
              "Change in base interest rates.",
              "percent",
              -2,
              15,
              0.25,
            )}
            {renderAssumptionControl(
              "physicalDamageIndex",
              "Physical Damage Index (0-1)",
              "Severity of physical climate events.",
              "number",
              0.0,
              1.0,
              0.01,
            )}
            {renderAssumptionControl(
              "monteCarloTrials",
              "Monte Carlo Trials",
              "Number of stochastic simulations for tail risk calculations (CAT models).",
              "number",
              1000,
              10000,
              500,
            )}
            <Alert severity="info" sx={{ mt: 2 }}>
              Models will use {dataFrequency} data points for temporal
              projections.
            </Alert>
          </Paper>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4 }}>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            mb: 3,
            bgcolor: alpha(DELOITTE_COLORS.primary.DEFAULT, 0.05),
            borderColor: alpha(DELOITTE_COLORS.primary.DEFAULT, 0.2),
            display: "flex",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Box p={1} bgcolor="background.paper" borderRadius="50%">
            <FileSignature size={24} color={DELOITTE_COLORS.primary.DEFAULT} />
          </Box>
          <Box flex={1}>
            <Typography variant="subtitle2" fontWeight={700}>
              Governance & Review
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              gutterBottom
            >
              Confirm that these stress test assumptions align with the banks
              risk appetite framework and have been reviewed by the appropriate
              risk committee.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={governanceChecked}
                  onChange={(e) => setGovernanceChecked(e.target.checked)}
                  sx={{
                    color: DELOITTE_COLORS.slate.DEFAULT,
                    "&.Mui-checked": { color: DELOITTE_COLORS.primary.DEFAULT },
                  }}
                />
              }
              label={
                <Typography variant="body2" fontWeight={600}>
                  I certify assumptions are valid and reviewed.
                </Typography>
              }
            />
          </Box>
        </Paper>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            startIcon={<ArrowLeft />}
            onClick={onBack}
            sx={{ color: theme.palette.text.secondary }}
          >
            Back to Selection
          </Button>
          <Button
            variant="contained"
            onClick={handleRun}
            endIcon={<ArrowRight />}
            disabled={selectedMEVs.length === 0 || !governanceChecked}
            sx={{
              bgcolor: DELOITTE_COLORS.green.DEFAULT,
              color: "#000",
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
              "&.Mui-disabled": {
                bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.3),
              },
            }}
          >
            Run Analysis
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
