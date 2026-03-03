import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Select,
  MenuItem,
  Chip,
  Grid,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardHeader,
  alpha,
  Divider,
  Alert,
  Tooltip,
  DialogContentText,
  useTheme,
} from "@mui/material";
import CRANavigation from "../components/CRANavigation";
import {
  Save,
  Download,
  Database,
  Users,
  Briefcase,
  Layers,
  TrendingUp,
  RefreshCw,
  Info,
  Trash2,
  Plus,
  ArrowRight,
  Clock,
  ChevronRight,
  Zap,
} from "lucide-react";
import {
  useTRARiskStore,
  useCRAStatusStore,
  useCRADataStore,
} from "@/store/craStore";
import {
  getNormalizedDriverScore,
  getScoreLabel,
  getOverallRiskLevel,
  formatExposureM,
} from "../utils/craUtils";
import { useScenarioStore } from "@/store/scenarioStore";
import CRALayout from "../layout/CRALayout";
import type { Asset } from "@/types/craTypes";
import { useIndustry } from "@/hooks/useIndustry";

const CATEGORY_ICON_MAP: Record<string, typeof Briefcase> = {
  policy: Briefcase,
  technology: Layers,
  market: TrendingUp,
  reputation: Users,
  energy_regulation: Zap,
  technology_transition: Layers,
  market_demand: TrendingUp,
  physical_resilience: Briefcase,
};
const SCENARIOS = [
  "NGFS Net Zero 2050",
  "Delayed Transition",
  "Current Policies",
];
const IMPACT_LEVELS = [
  { value: 1, label: "Very Low" },
  { value: 2, label: "Low" },
  { value: 3, label: "Medium" },
  { value: 4, label: "High" },
  { value: 5, label: "Very High" },
];
const LIKELIHOOD_LEVELS = IMPACT_LEVELS;
const STEPS = ["Specify Drivers", "Score Calibration", "Analysis & Reporting"];
import { DELOITTE_COLORS } from "@/config/colors.config";
export default function TransitionRiskAssessment() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const { config: industryConfig } = useIndustry();
  const DRIVER_CATEGORIES = useMemo(
    () =>
      industryConfig.transitionDrivers.map((cat) => ({
        ...cat,
        icon: CATEGORY_ICON_MAP[cat.id] ?? Briefcase,
      })),
    [industryConfig.transitionDrivers],
  );
  const FLATTENED_DRIVERS = useMemo(
    () => DRIVER_CATEGORIES.flatMap((c) => c.items),
    [DRIVER_CATEGORIES],
  );
  const { createScenario, updateParameter } = useScenarioStore();
  const {
    selectedDrivers,
    selectedScenario,
    transRiskScores,
    transitionShockMatrix,
    setSelectedDrivers,
    setScenario,
    updateRiskScore,
    resetTRA,
  } = useTRARiskStore();
  const { traReady, setTRAReady } = useCRAStatusStore();
  const { assets } = useCRADataStore();
  const [activeStep, setActiveStep] = useState(traReady ? 2 : 0);
  const [resultsTab, setResultsTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"landing" | "assessment">("landing");
  const [drillDownCell, setDrillDownCell] = useState<{
    impact: number;
    likelihood: number;
    riskId: string;
    assets: Asset[];
    riskScore: number;
  } | null>(null);
  const [shockResult, setShockResult] = useState<number | null>(null);
  const availableAssetTypes = useMemo(() => {
    return Object.keys(assets).filter(
      (k) => assets[k].data && assets[k].data.length > 0,
    );
  }, [assets]);
  const hasData = availableAssetTypes.length > 0;
  const allAssets = useMemo(() => {
    return availableAssetTypes.flatMap((type) =>
      assets[type].data.map((a) => ({ ...a, assetType: assets[type].type })),
    );
  }, [availableAssetTypes, assets]);
  const availableSectors = useMemo(() => {
    const sectors = new Set<string>();
    allAssets.forEach((a) => {
      if (a.sector) sectors.add(a.sector);
    });
    return Array.from(sectors).sort();
  }, [allAssets]);
  const handleToggleDriver = (driverId: string) => {
    const newSelection = selectedDrivers.includes(driverId)
      ? selectedDrivers.filter((id) => id !== driverId)
      : [...selectedDrivers, driverId];
    setSelectedDrivers(newSelection);
  };
  const getScore = useMemo(
    () => (sector: string, driverId: string) => {
      return (
        transRiskScores.find(
          (s) => s.sector === sector && s.driverId === driverId,
        ) || { sector, driverId, impact: 1, likelihood: 1 }
      );
    },
    [transRiskScores],
  );
  const handleScoreChange = (
    sector: string,
    driverId: string,
    field: "impact" | "likelihood",
    value: number,
  ) => {
    const currentScore = getScore(sector, driverId);
    updateRiskScore({
      ...currentScore,
      [field]: value,
    });
  };
  const sectorSensitivityTable = useMemo(() => {
    if (activeStep !== 2) return [];
    return availableSectors.map((sector) => {
      const driverScores = selectedDrivers.map((dId) => {
        const s = getScore(sector, dId);
        return getNormalizedDriverScore(s.impact || 1, s.likelihood || 1);
      });
      const overallScore =
        driverScores.reduce((a, b) => a + b, 0) / (driverScores.length || 1);
      const classification = getOverallRiskLevel(overallScore);
      const exposure = allAssets
        .filter((a) => a.sector === sector)
        .reduce(
          (sum, a) =>
            sum +
            (Number(a.outstandingBalance) ||
              Number(
                (a as unknown as Record<string, unknown>)["Net Book Value"],
              ) ||
              Number((a as unknown as Record<string, unknown>)["Book Value"]) ||
              0),
          0,
        );
      return {
        sector,
        driverScores: selectedDrivers.reduce(
          (acc, dId, idx) => ({ ...acc, [dId]: driverScores[idx] }),
          {} as Record<string, number>,
        ),
        overallScore,
        classification,
        exposure,
        riskWeitedExposure: exposure * overallScore,
      };
    });
  }, [activeStep, availableSectors, selectedDrivers, getScore, allAssets]);

  const computedMatrices = useMemo(() => {
    if (activeStep !== 2) return {};
    const matrices: Record<
      string,
      Array<Array<{ count: number; exposure: number; assets: Asset[] }>>
    > = {};
    selectedDrivers.forEach((driverId) => {
      const matrix = Array(5)
        .fill(null)
        .map(() =>
          Array(5)
            .fill(null)
            .map(() => ({
              count: 0,
              exposure: 0,
              assets: [] as Asset[],
            })),
        );
      allAssets.forEach((asset) => {
        if (!asset.sector) return;
        const scoreConfig = transRiskScores.find(
          (s) => s.sector === asset.sector && s.driverId === driverId,
        ) || { impact: 1, likelihood: 1 };
        const impactIdx = (scoreConfig.impact || 1) - 1;
        const likelihoodIdx = (scoreConfig.likelihood || 1) - 1;
        if (
          impactIdx >= 0 &&
          impactIdx < 5 &&
          likelihoodIdx >= 0 &&
          likelihoodIdx < 5
        ) {
          matrix[likelihoodIdx][impactIdx].count++;
          matrix[likelihoodIdx][impactIdx].exposure +=
            Number(asset.outstandingBalance) ||
            Number(
              (asset as unknown as Record<string, unknown>)["Net Book Value"],
            ) ||
            Number(
              (asset as unknown as Record<string, unknown>)["Book Value"],
            ) ||
            0;
          matrix[likelihoodIdx][impactIdx].assets.push({
            ...asset,
            impactScore: scoreConfig.impact,
            likelihoodScore: scoreConfig.likelihood,
            riskScore:
              (scoreConfig.impact || 1) * (scoreConfig.likelihood || 1),
          } as Asset);
        }
      });
      matrices[driverId] = matrix;
    });
    return matrices;
  }, [activeStep, selectedDrivers, allAssets, transRiskScores]);
  const handleReset = () => {
    if (resetTRA) resetTRA();
    setTRAReady(false);
    setActiveStep(0);
    setResultsTab(0);
  };
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    if (resetTRA) resetTRA();
    setTRAReady(false);
    setActiveStep(0);
    setResultsTab(0);
    setDeleteDialogOpen(false);
  };
  if (!hasData) {
    return (
      <CRALayout>
        <Box sx={{ p: 3 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h5" fontWeight={700}>
              Transition Risk Assessment
            </Typography>
          </Stack>
          <Paper
            sx={{
              p: 6,
              textAlign: "center",
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "background.paper",
              mt: 4,
            }}
          >
            <Database size={48} className="text-gray-400 mx-auto mb-4" />
            <Typography variant="h5" gutterBottom>
              Portfolio Data Required
            </Typography>
            <Typography color="text.secondary" paragraph>
              Please upload portfolio data files to initialize the Transition
              Risk engine.
            </Typography>
          </Paper>
        </Box>
      </CRALayout>
    );
  }
  if (viewMode === "landing") {
    if (!hasData) {
      return (
        <CRALayout>
          <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh" }}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: isDark ? "#0F1623" : "#FFFFFF",
                border: `2px dashed ${
                  theme.palette.mode === "dark"
                    ? alpha("#334155", 0.5)
                    : "#CBD5E1"
                }`,
                borderRadius: 2.5,
                p: 8,
                textAlign: "center",
                maxWidth: 800,
                mx: "auto",
                mt: 8,
              }}
            >
              <Stack spacing={3} alignItems="center">
                <Box
                  sx={{
                    p: 3,
                    backgroundColor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.12),
                    borderRadius: "50%",
                    display: "flex",
                  }}
                >
                  <Briefcase
                    size={56}
                    color={DELOITTE_COLORS.slate.DEFAULT}
                    strokeWidth={1.5}
                  />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Prerequisites Not Met
                  </Typography>
                  <Typography color="text.secondary" maxWidth={500} mx="auto">
                    Transition Risk Assessment requires portfolio data. Please
                    upload data In the Data Upload module first.
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => navigate("/cra/data")}
                  endIcon={<ArrowRight />}
                  sx={{
                    backgroundColor: DELOITTE_COLORS.green.DEFAULT,
                    "&:hover": {
                      backgroundColor: alpha(
                        DELOITTE_COLORS.green.DEFAULT,
                        0.9,
                      ),
                    },
                  }}
                >
                  Go to Data Upload
                </Button>
              </Stack>
            </Paper>
          </Box>
        </CRALayout>
      );
    }
    return (
      <CRALayout>
        <Box
          sx={{
            minHeight: "100vh",
            bgcolor: "background.default",
            p: { xs: 3, md: 6 },
          }}
        >
          <Stack spacing={4} maxWidth="1600px" mx="auto">
            <Box
              sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 3 }}
            >
              <Typography
                variant="overline"
                color="primary"
                fontWeight={700}
                letterSpacing={1.5}
              >
                Assessment & Reporting
              </Typography>
              <Typography
                variant="h3"
                fontWeight={700}
                color="text.primary"
                sx={{ mt: 1, letterSpacing: -0.5 }}
              >
                Transition Risk Assessment
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mt: 1, maxWidth: 800 }}
              >
                Analyze policy, technology, and market risks associated with the
                transition to a low-carbon economy.
              </Typography>
            </Box>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 5 }}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "background.paper",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: DELOITTE_COLORS.green.DEFAULT,
                      transform: "translateY(-4px)",
                      boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)",
                    },
                    cursor: "pointer",
                  }}
                  onClick={() => setViewMode("assessment")}
                >
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05),
                      borderRadius: "50%",
                      mb: 3,
                    }}
                  >
                    <Plus size={40} color={DELOITTE_COLORS.green.DEFAULT} />
                  </Box>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    New Assessment
                  </Typography>
                  <Typography
                    align="center"
                    color="text.secondary"
                    sx={{ mb: 4, maxWidth: 300 }}
                  >
                    Define drivers, calibrate sector sensitivity, and evaluate
                    carbon tax impacts.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowRight size={18} />}
                    sx={{
                      bgcolor: isDark
                        ? "primary.main"
                        : DELOITTE_COLORS.green.DEFAULT,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      color: isDark ? "primary.contrastText" : "white",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode("assessment");
                    }}
                  >
                    Start Analysis
                  </Button>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 7 }}>
                <Paper
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      p: 3,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      bgcolor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.02),
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6" fontWeight={700}>
                        Recent Assessments
                      </Typography>
                      <Button
                        size="small"
                        endIcon={<ArrowRight size={16} />}
                        sx={{ color: DELOITTE_COLORS.green.DEFAULT }}
                      >
                        View All
                      </Button>
                    </Stack>
                  </Box>
                  <Stack
                    divider={
                      <Box sx={{ borderBottom: 1, borderColor: "divider" }} />
                    }
                  >
                    {[1, 2].map((_, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 3,
                          "&:hover": {
                            bgcolor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05),
                          },
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          setTRAReady(true);
                          setActiveStep(2);
                          setViewMode("assessment");
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={2}
                          alignItems="flex-start"
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: 1,
                              bgcolor: alpha(
                                DELOITTE_COLORS.green.DEFAULT,
                                0.1,
                              ),
                              color: DELOITTE_COLORS.green.DEFAULT,
                              mt: 0.5,
                            }}
                          >
                            <Zap size={20} />
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={600}
                              mb={0.5}
                            >
                              {idx === 0
                                ? "NGFS Net Zero 2050 Scenario"
                                : "Current Policies Assessment"}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              mb={1}
                            >
                              {idx === 0
                                ? "Stress testing hi-carbon sectors against $100/t carbon tax."
                                : "Baseline regulatory review."}
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <Clock
                                  size={14}
                                  color={DELOITTE_COLORS.slate.DEFAULT}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {idx === 0 ? "1 day ago" : "1 week ago"}
                                </Typography>
                              </Stack>
                              <Chip
                                label="Completed"
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: "0.65rem",
                                  bgcolor: alpha(DELOITTE_COLORS.success, 0.1),
                                  color: DELOITTE_COLORS.success,
                                }}
                              />
                            </Stack>
                          </Box>
                          <ChevronRight
                            size={20}
                            color={DELOITTE_COLORS.slate.DEFAULT}
                          />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </CRALayout>
    );
  }
  return (
    <CRALayout>
      <Box sx={{ px: 3, pt: 3, pb: 4 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Transition Risk Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeStep === 0
                ? "Layer 1 - Define Drivers"
                : activeStep === 1
                  ? "Layer 2 - Score Drivers by Sector"
                  : "Analysis & Results"}
            </Typography>
          </Box>
          <Box>
            {activeStep === 2 && (
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  startIcon={<Trash2 size={16} />}
                >
                  Delete
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleReset}
                  startIcon={<RefreshCw />}
                >
                  New Assessment
                </Button>
                <Button variant="contained" startIcon={<Download />}>
                  Export Results
                </Button>
              </Stack>
            )}
          </Box>
        </Stack>
        <Divider sx={{ mb: 3 }} />
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep}>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        {activeStep === 0 && (
          <Stack spacing={4}>
            <Grid container spacing={4}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Select Transition Risk Drivers
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Define which transition risks apply to your portfolio. These
                    selected drivers will form the basis of your sector scoring.
                  </Typography>
                  <Stack spacing={2}>
                    {DRIVER_CATEGORIES.map((category) => (
                      <Card key={category.id} variant="outlined">
                        <CardHeader
                          avatar={
                            <category.icon
                              size={20}
                              className="text-secondary"
                            />
                          }
                          title={category.label}
                          titleTypographyProps={{ fontWeight: 600 }}
                          sx={{ pb: 1 }}
                        />
                        <CardContent sx={{ pt: 0 }}>
                          <Grid container spacing={1}>
                            {category.items.map((item) => (
                              <Grid size={{ xs: 12, sm: 6 }} key={item.id}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={selectedDrivers.includes(
                                        item.id,
                                      )}
                                      onChange={() =>
                                        handleToggleDriver(item.id)
                                      }
                                    />
                                  }
                                  label={item.label}
                                />
                              </Grid>
                            ))}
                          </Grid>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper sx={{ p: 3, position: "sticky", top: 20 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Transition Scenario
                      </Typography>
                      <Select
                        value={selectedScenario}
                        onChange={(e) => setScenario(e.target.value)}
                        displayEmpty
                        size="small"
                        fullWidth
                      >
                        <MenuItem value="" disabled>
                          Select Scenario
                        </MenuItem>
                        {SCENARIOS.map((s) => (
                          <MenuItem key={s} value={s}>
                            {s}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Assessment Scope
                      </Typography>
                      <Chip
                        label="Sector Level Only"
                        color="default"
                        variant="outlined"
                        size="small"
                        sx={{ fontWeight: "bold", width: "100%" }}
                      />
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        Analysis is performed by aggregating portfolio data into
                        sectors.
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Selected Drivers: <b>{selectedDrivers.length}</b>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Each selected driver will require scoring for every
                        sector in your portfolio.
                      </Typography>
                    </Box>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                      disabled={selectedDrivers.length === 0}
                    >
                      Proceed to Calibration
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        )}
        {activeStep === 1 && (
          <Stack spacing={3}>
            <Alert severity="info" icon={<Info />} sx={{ mb: 2 }}>
              Assign Impact and Likelihood for each sector. The system will
              normalize these into a 1-5 Driver Score.
            </Alert>
            <Paper sx={{ p: 3 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box>
                  <Typography variant="h6">Score Drivers by Sector</Typography>
                </Box>
                <Box>
                  <Button onClick={() => setActiveStep(0)} sx={{ mr: 1 }}>
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setTRAReady(true);
                      setActiveStep(2);
                    }}
                    startIcon={<Save />}
                  >
                    Run Assessment
                  </Button>
                </Box>
              </Stack>
              <TableContainer
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  maxHeight: "65vh",
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell
                        sx={{ bgcolor: "background.paper", fontWeight: "bold" }}
                      >
                        Sector
                      </TableCell>
                      {selectedDrivers.map((dId) => (
                        <TableCell
                          key={dId}
                          align="center"
                          sx={{ bgcolor: "background.paper", minWidth: 200 }}
                        >
                          {FLATTENED_DRIVERS.find((d) => d.id === dId)?.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableSectors.map((sector) => (
                      <TableRow key={sector} hover>
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ fontWeight: 600 }}
                        >
                          {sector}
                        </TableCell>
                        {selectedDrivers.map((dId) => {
                          const score = getScore(sector, dId);
                          const normalizedScore = getNormalizedDriverScore(
                            score.impact || 1,
                            score.likelihood || 1,
                          );
                          return (
                            <TableCell key={dId} align="center">
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                justifyContent="center"
                              >
                                <Stack spacing={0.5}>
                                  <Select
                                    value={score.impact}
                                    onChange={(e) =>
                                      handleScoreChange(
                                        sector,
                                        dId,
                                        "impact",
                                        Number(e.target.value),
                                      )
                                    }
                                    size="small"
                                    sx={{
                                      height: 30,
                                      fontSize: "0.8rem",
                                      minWidth: 80,
                                    }}
                                  >
                                    {IMPACT_LEVELS.map((l) => (
                                      <MenuItem key={l.value} value={l.value}>
                                        Imp: {l.value}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                  <Select
                                    value={score.likelihood}
                                    onChange={(e) =>
                                      handleScoreChange(
                                        sector,
                                        dId,
                                        "likelihood",
                                        Number(e.target.value),
                                      )
                                    }
                                    size="small"
                                    sx={{
                                      height: 30,
                                      fontSize: "0.8rem",
                                      minWidth: 80,
                                    }}
                                  >
                                    {LIKELIHOOD_LEVELS.map((l) => (
                                      <MenuItem key={l.value} value={l.value}>
                                        Lik: {l.value}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </Stack>
                                <Tooltip title="Normalized Score (1-5)">
                                  <Box
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      borderRadius: "50%",
                                      bgcolor: alpha(
                                        normalizedScore >= 5
                                          ? "#ef4444"
                                          : normalizedScore >= 4
                                            ? "#f97316"
                                            : normalizedScore >= 3
                                              ? "#eab308"
                                              : "#22c55e",
                                        0.2,
                                      ),
                                      color:
                                        normalizedScore >= 4
                                          ? "error.main"
                                          : "text.primary",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontWeight: "bold",
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    {normalizedScore}
                                  </Box>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        )}
        {activeStep === 2 && (
          <Stack spacing={3}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={resultsTab} onChange={(_, v) => setResultsTab(v)}>
                <Tab label="Sector Scorecard" />
                <Tab label="Portfolio Impact" />
                <Tab label="Detailed Risk Matrices" />
                <Tab
                  label="Shock Parameter Calibration"
                  icon={<Zap size={16} />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>
            {resultsTab === 0 && (
              <Paper sx={{ p: 0, overflow: "hidden" }}>
                <Box
                  sx={{
                    p: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    Transition Risk Sector Scorecard
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Inherent transition risk by sector, independent of portfolio
                    exposure.
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>
                          Sector
                        </TableCell>
                        {selectedDrivers.map((dId) => (
                          <TableCell
                            key={dId}
                            align="center"
                            sx={{ fontWeight: "bold" }}
                          >
                            {FLATTENED_DRIVERS.find((d) => d.id === dId)?.label}
                          </TableCell>
                        ))}
                        <TableCell
                          align="center"
                          sx={{
                            fontWeight: "bold",
                            bgcolor: "background.default",
                            borderLeft: "1px solid #eee",
                          }}
                        >
                          Overall Score
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: "bold" }}>
                          Risk Level
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sectorSensitivityTable.map((row) => (
                        <TableRow key={row.sector} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {row.sector}
                          </TableCell>
                          {selectedDrivers.map((dId) => (
                            <TableCell key={dId} align="center">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="center"
                                alignItems="center"
                              >
                                <Typography fontWeight="bold">
                                  {row.driverScores[dId]}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  ({getScoreLabel(row.driverScores[dId])})
                                </Typography>
                              </Stack>
                            </TableCell>
                          ))}
                          <TableCell
                            align="center"
                            sx={{ borderLeft: "1px solid #eee" }}
                          >
                            <Typography fontWeight="bold">
                              {row.overallScore.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={row.classification.label}
                              size="small"
                              sx={{
                                bgcolor: row.classification.bg,
                                color: row.classification.color,
                                fontWeight: 800,
                                minWidth: 100,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
            {resultsTab === 1 && (
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  {[
                    { label: "Very High", bg: "#fecaca", color: "#7f1d1d" },
                    { label: "High", bg: "#ffedd5", color: "#7c2d12" },
                    { label: "Medium", bg: "#fef9c3", color: "#713f12" },
                    { label: "Low", bg: "#dcfce7", color: "#14532d" },
                    { label: "Very Low", bg: "#f0f9ff", color: "#0c4a6e" },
                  ].map((level) => {
                    const matching = sectorSensitivityTable.filter(
                      (s) => s.classification.label === level.label,
                    );
                    const exposure = matching.reduce(
                      (sum, s) => sum + s.exposure,
                      0,
                    );
                    return (
                      <Grid key={level.label} size={{ xs: 6, md: 2.4 }}>
                        <Paper
                          sx={{
                            p: 2,
                            textAlign: "center",
                            bgcolor: level.bg,
                            color: level.color,
                          }}
                        >
                          <Typography variant="h4" fontWeight={800}>
                            {matching.length}
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            display="block"
                          >
                            {level.label} Risk
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.8 }}>
                            ₦{formatExposureM(exposure).replace("M", "M")}{" "}
                            exposure
                          </Typography>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
                <Paper sx={{ p: 0, overflow: "hidden" }}>
                  <TableContainer>
                    <Table stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Sector
                          </TableCell>
                          <TableCell align="right" sx={{ fontWeight: "bold" }}>
                            Exposure (S)
                          </TableCell>
                          {selectedDrivers.map((dId) => (
                            <TableCell
                              key={dId}
                              align="center"
                              sx={{
                                fontSize: "0.75rem",
                                color: "text.secondary",
                              }}
                            >
                              {
                                FLATTENED_DRIVERS.find((d) => d.id === dId)
                                  ?.label
                              }{" "}
                              <br /> (1-5)
                            </TableCell>
                          ))}
                          <TableCell
                            align="center"
                            sx={{
                              fontWeight: "bold",
                              bgcolor: "background.default",
                              borderLeft: "1px solid #eee",
                            }}
                          >
                            Overall Score <br />
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: "normal" }}
                            >
                              (Avg Layers)
                            </Typography>
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ fontWeight: "bold", minWidth: 140 }}
                          >
                            Risk Level
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sectorSensitivityTable.map((row) => (
                          <TableRow key={row.sector} hover>
                            <TableCell sx={{ fontWeight: 500 }}>
                              {row.sector}
                            </TableCell>
                            <TableCell align="right">
                              {row.exposure.toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                              })}
                            </TableCell>
                            {selectedDrivers.map((dId) => (
                              <TableCell key={dId} align="center">
                                <Chip
                                  label={row.driverScores[dId]}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: "transparent",
                                    bgcolor: alpha(
                                      row.driverScores[dId] >= 4.5
                                        ? "#ef4444"
                                        : row.driverScores[dId] >= 3.5
                                          ? "#f97316"
                                          : "#e5e7eb",
                                      0.15,
                                    ),
                                    fontWeight: "bold",
                                  }}
                                />
                              </TableCell>
                            ))}
                            <TableCell
                              align="center"
                              sx={{
                                borderLeft: "1px solid #eee",
                                fontWeight: "bold",
                                fontSize: "1.1rem",
                              }}
                            >
                              {row.overallScore.toFixed(2)}
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={row.classification.label}
                                sx={{
                                  bgcolor: row.classification.bg,
                                  color: row.classification.color,
                                  fontWeight: 800,
                                  minWidth: 100,
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
            )}
            {resultsTab === 2 && (
              <Stack spacing={4}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Risk Concentration Matrices
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ maxWidth: 800, mb: 2 }}
                  >
                    These heatmaps visualize the distribution of portfolio
                    assets across different risk levels for each selected
                    transition driver. Use this to identify "hot spots" where
                    hi-impact and hi-likelihood risks coincide with significant
                    exposure.
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Select Driver to View Matrix
                  </Typography>
                  <div className="flex gap-2 flex-wrap">
                    {selectedDrivers.map((dId) => (
                      <Chip
                        key={dId}
                        label={
                          FLATTENED_DRIVERS.find((d) => d.id === dId)?.label
                        }
                        onClick={() => {}}
                        variant="outlined"
                      />
                    ))}
                  </div>
                </Box>
                {selectedDrivers.map((dId) => (
                  <Paper key={dId} sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="h6">
                        {FLATTENED_DRIVERS.find((d) => d.id === dId)?.label}{" "}
                        Matrix
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Breakdown of asset exposure by likelihood and impact
                        severity for{" "}
                        {FLATTENED_DRIVERS.find((d) => d.id === dId)?.label}.
                        Cells in the top-rit (Red) represent critical risk
                        concentrations requiring immediate attention.
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(5, 1fr)",
                            gap: 0.5,
                            maxWidth: 500,
                          }}
                        >
                          {[4, 3, 2, 1, 0].map((y) =>
                            [0, 1, 2, 3, 4].map((x) => {
                              const cell = computedMatrices[dId]?.[x]?.[y];
                              return (
                                <Tooltip
                                  title={`${cell?.count || 0} Assets`}
                                  key={`${x}-${y}`}
                                >
                                  <Box
                                    onClick={() =>
                                      cell?.count > 0 &&
                                      setDrillDownCell({
                                        impact: y + 1,
                                        likelihood: x + 1,
                                        riskId: dId,
                                        assets: cell.assets,
                                        riskScore: (y + 1) * (x + 1),
                                      })
                                    }
                                    sx={{
                                      aspectRatio: "1",
                                      bgcolor:
                                        cell?.count > 0
                                          ? (y + 1) * (x + 1) >= 20
                                            ? "#fca5a5"
                                            : (y + 1) * (x + 1) >= 12
                                              ? "#fdba74"
                                              : "#bbf7d0"
                                          : "#f3f4f6",
                                      cursor:
                                        cell?.count > 0 ? "pointer" : "default",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "0.8rem",
                                      fontWeight: "bold",
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    {cell?.count > 0 ? cell.count : ""}
                                  </Box>
                                </Tooltip>
                              );
                            }),
                          )}
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{ display: "block", mt: 1, ml: 2 }}
                        >
                          X: Likelihood (1-5) | Y: Impact (1-5)
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <Stack spacing={2}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="caption">
                              Total{" "}
                              {
                                FLATTENED_DRIVERS.find((d) => d.id === dId)
                                  ?.label
                              }{" "}
                              Exposure
                            </Typography>
                            <Typography variant="h6">
                              ₦
                              {formatExposureM(
                                computedMatrices[dId]
                                  .flat()
                                  .reduce((acc, c) => acc + c.exposure, 0),
                              ).replace("M", "M")}
                            </Typography>
                          </Paper>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography
                              variant="subtitle2"
                              fontWeight={700}
                              gutterBottom
                            >
                              Risk Interpretation
                            </Typography>
                            {(() => {
                              const flat = computedMatrices[dId]?.flat() || [];
                              const totalAssets = flat.reduce(
                                (s, c) => s + c.count,
                                0,
                              );
                              const hiRisk = flat
                                .filter((_, idx) => {
                                  const row = Math.floor(idx / 5);
                                  const col = idx % 5;
                                  return (row + 1) * (col + 1) >= 12;
                                })
                                .reduce((s, c) => s + c.count, 0);
                              const criticalExposure = flat
                                .filter((_, idx) => {
                                  const row = Math.floor(idx / 5);
                                  const col = idx % 5;
                                  return (row + 1) * (col + 1) >= 20;
                                })
                                .reduce((s, c) => s + c.exposure, 0);
                              const driverLabel =
                                FLATTENED_DRIVERS.find((d) => d.id === dId)
                                  ?.label || dId;
                              const pctHiRisk =
                                totalAssets > 0
                                  ? ((hiRisk / totalAssets) * 100).toFixed(0)
                                  : "0";
                              return (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{ lineHeight: 1.6 }}
                                >
                                  <strong>{pctHiRisk}%</strong> of portfolio
                                  assets ({hiRisk} of {totalAssets}) face
                                  elevated {driverLabel.toLowerCase()} risk
                                  (score ≥12).
                                  {criticalExposure > 0 && (
                                    <>
                                      {" "}
                                      Critical-zone exposure (score ≥20) totals{" "}
                                      <strong>
                                        ₦
                                        {formatExposureM(
                                          criticalExposure,
                                        ).replace("M", "M")}
                                      </strong>
                                      , requiring immediate mitigation
                                      strategies and enhanced monitoring.
                                    </>
                                  )}
                                  {criticalExposure === 0 && (
                                    <>
                                      {" "}
                                      No assets currently fall within the
                                      critical risk zone (score ≥20), indicating
                                      manageable exposure levels under current
                                      conditions.
                                    </>
                                  )}
                                </Typography>
                              );
                            })()}
                          </Paper>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            )}
            {resultsTab === 3 && (
              <Stack
                spacing={4}
                alignItems="center"
                justifyContent="center"
                py={4}
              >
                <Paper
                  variant="outlined"
                  sx={{ width: "100%", maxWidth: 800, p: 3, borderRadius: 3 }}
                >
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <Zap size={20} color={DELOITTE_COLORS.primary.DEFAULT} />
                    Transition Impact Shocks — High Carbon Sectors
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={3}>
                    Percentage impact on asset values under NGFS climate
                    scenarios across different time horizons. These shocks can
                    be exported to the Scenario Analysis module for stress
                    testing.
                  </Typography>
                  <TableContainer>
                    <Table
                      size="medium"
                      sx={{
                        "& th, & td": { textAlign: "center", fontWeight: 600 },
                      }}
                    >
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha("#000", 0.04) }}>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              textAlign: "left !important",
                            }}
                          >
                            Scenario / Horizon
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#10B981" }}>
                            Short Term (1-3y)
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#F59E0B" }}>
                            Medium Term (3-10y)
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: "#EF4444" }}>
                            Long Term (&gt;10y)
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(["Orderly", "Disorderly", "Hothouse"] as const).map(
                          (scenario) => (
                            <TableRow
                              key={scenario}
                              sx={{
                                "&:hover": {
                                  bgcolor: alpha(
                                    DELOITTE_COLORS.green.DEFAULT,
                                    0.04,
                                  ),
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  textAlign: "left !important",
                                  fontWeight: 700,
                                  color:
                                    scenario === "Orderly"
                                      ? "#10B981"
                                      : scenario === "Disorderly"
                                        ? "#F59E0B"
                                        : "#EF4444",
                                }}
                              >
                                {scenario}
                              </TableCell>
                              {(
                                [
                                  "Short Term",
                                  "Medium Term",
                                  "Long Term",
                                ] as const
                              ).map((horizon) => {
                                const val =
                                  transitionShockMatrix[horizon]?.[scenario] ??
                                  0;
                                return (
                                  <TableCell key={horizon}>
                                    <Chip
                                      label={`${val}%`}
                                      size="small"
                                      sx={{
                                        fontWeight: 700,
                                        fontSize: 13,
                                        bgcolor:
                                          val <= -25
                                            ? alpha("#EF4444", 0.12)
                                            : val <= -10
                                              ? alpha("#F59E0B", 0.12)
                                              : val < 0
                                                ? alpha("#3B82F6", 0.12)
                                                : alpha("#10B981", 0.08),
                                        color:
                                          val <= -25
                                            ? "#EF4444"
                                            : val <= -10
                                              ? "#F59E0B"
                                              : val < 0
                                                ? "#3B82F6"
                                                : "#10B981",
                                        minWidth: 60,
                                      }}
                                    />
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ),
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                    These transition shocks represent the estimated percentage
                    decline in hi-carbon sector asset values under each NGFS
                    scenario pathway. Use "Push to Scenario Analysis" to apply
                    these parameters.
                  </Alert>
                </Paper>
              </Stack>
            )}
          </Stack>
        )}
        <Dialog
          open={!!drillDownCell}
          onClose={() => setDrillDownCell(null)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle>
            Risk Details:{" "}
            {drillDownCell &&
              FLATTENED_DRIVERS.find((d) => d.id === drillDownCell.riskId)
                ?.label}
          </DialogTitle>
          <DialogContent dividers>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Sector</TableCell>
                    <TableCell>Borrower</TableCell>
                    <TableCell align="right">Exposure</TableCell>
                    <TableCell align="center">Impact</TableCell>
                    <TableCell align="center">Likelihood</TableCell>
                    <TableCell align="center">Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drillDownCell?.assets.map(
                    (
                      asset: Asset & {
                        impactScore?: number;
                        likelihoodScore?: number;
                        riskScore?: number;
                      },
                      i: number,
                    ) => (
                      <TableRow key={i}>
                        <TableCell>{asset.sector}</TableCell>
                        <TableCell>{asset.borrowerName || "N/A"}</TableCell>
                        <TableCell align="right">
                          ₦
                          {(
                            Number(asset.outstandingBalance) ||
                            Number(
                              (asset as Record<string, unknown>)[
                                "Net Book Value"
                              ],
                            ) ||
                            0
                          ).toLocaleString(undefined, {
                            maximumFractionDigits: 0,
                          })}
                        </TableCell>
                        <TableCell align="center">
                          {asset.impactScore || 1}
                        </TableCell>
                        <TableCell align="center">
                          {asset.likelihoodScore || 1}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={drillDownCell.riskScore}
                            size="small"
                            sx={{ fontWeight: "bold" }}
                          />
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDrillDownCell(null)}>Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={shockResult !== null}
          onClose={() => setShockResult(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Transition Impact Shocks Generated
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: alpha(DELOITTE_COLORS.primary.DEFAULT, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <Zap size={32} color={DELOITTE_COLORS.primary.DEFAULT} />
              </Box>
              <Typography variant="h6" gutterBottom>
                Carbon Price Shock Calculated
              </Typography>
              <Typography color="text.secondary" paragraph>
                Based on the sector-weited transition risk sensitivity, the
                implied Shadow Carbon Price for stress testing is:
              </Typography>
              <Typography
                variant="h2"
                fontWeight={800}
                color="primary"
                sx={{ my: 1 }}
              >
                ${shockResult?.toFixed(2)}
              </Typography>
              <Chip label="per tonne CO2e" size="small" sx={{ mb: 3 }} />
              <Alert severity="info" sx={{ textAlign: "left" }}>
                This shock parameter represents the financial impact per
                emission unit to be applied in the Scenario Analysis module.
              </Alert>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setShockResult(null)} color="inherit">
              Close
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowRight />}
              onClick={() => {
                createScenario("custom", "medium", `Transition Shock via TRA`);
                updateParameter("carbonPrice", shockResult!);
                navigate("/scenario-analysis/assumptions");
              }}
              sx={{
                bgcolor: DELOITTE_COLORS.green.DEFAULT,
                color: "#000",
                "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
              }}
            >
              Push to Scenario Analysis
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Delete Assessment Result?</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this assessment result? This
              action cannot be undone and you will lose all current scores and
              configurations.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete Result
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
      <Box
        sx={{
          px: 3,
          py: 2,
          position: "sticky",
          bottom: 0,
          zIndex: 10,
          backgroundColor: isDark
            ? alpha("#0F1623", 0.95)
            : alpha("#FFFFFF", 0.95),
          backdropFilter: "blur(8px)",
          boxShadow: isDark
            ? "0 -4px 20px rgba(0,0,0,0.2)"
            : "0 -4px 20px rgba(0,0,0,0.05)",
        }}
      >
        <CRANavigation
          compact
          prevPath="/cra/physical-risk"
          prevLabel="Back: Physical Risk"
          nextPath="/cra/collateral"
          nextLabel="Next: Collateral"
        />
      </Box>
    </CRALayout>
  );
}
