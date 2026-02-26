import { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Step,
  StepLabel,
  Stepper,
  Divider,
  Card,
  CardContent,
  Tooltip,
  IconButton,
  Drawer,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import CRANavigation from "../components/CRANavigation";
import {
  Shield,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Download,
  Save,
  Info,
  TrendingDown,
  Database,
  Eye,
} from "lucide-react";
import CRALayout from "../layout/CRALayout";
import { useCRAStatusStore, useCRADataStore } from "@/store/craStore";
import { useTheme, alpha } from "@mui/material/styles";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  getSensitivityLevel,
  getSensitivityColor,
  currencyFormatter,
} from "../utils/craUtils";
import { COLLATERAL_STEPS, HAIRCUT_POLICY } from "../data/constants";
import { useNavigate } from "react-router-dom";
export default function CollateralSensitivity() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { praReady, traReady } = useCRAStatusStore();
  const { assets } = useCRADataStore();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedCollateralId, setSelectedCollateralId] = useState<
    string | null
  >(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [hazardCollateralMap, setHazardCollateralMap] = useState<
    Record<string, string[]>
  >({
    Flood: ["Land", "Buildings"],
    Drout: ["Agricultural Land", "Crop Assets"],
    "Heat Wave": ["Equipment", "Machinery"],
    "Sea Level Rise": ["Coastal Properties", "Port Infrastructure"],
    "Storm / Cyclone": ["Buildings", "Vehicles", "Equipment"],
    Landslide: ["Land", "Hillside Properties"],
    Wildfire: ["Forestry Assets", "Rural Properties"],
    "Coastal Erosion": ["Coastal Properties", "Land"],
    "Cold Wave / Frost": ["Agricultural Land", "Livestock"],
  });
  const [newCollateralInputs, setNewCollateralInputs] = useState<
    Record<string, string>
  >({});
  const [sectorRiskMap, setSectorRiskMap] = useState<Record<string, string[]>>({
    Energy: ["Carbon Tax", "Emissions Caps", "Stranded Assets"],
    Manufacturing: [
      "Emissions Caps",
      "Energy Efficiency Requirements",
      "Carbon Tax",
    ],
    Mining: ["Rehabilitation Costs", "Carbon Tax", "Stranded Assets"],
    Agriculture: ["Water Pricing", "Land Use Change", "Yield Changes"],
    "Real Estate": ["Energy Efficiency Standards", "Retrofit Requirements"],
    Transport: ["Fuel Price Volatility", "EV Transition Costs"],
    Construction: ["Green Building Standards", "Material Cost Increases"],
  });
  const [newSectorRiskInputs, setNewSectorRiskInputs] = useState<
    Record<string, string>
  >({});
  const collateralUniverse = useMemo(() => {
    const all = Object.values(assets).flatMap((type) => type.data || []);
    if (all.length === 0) {
      return [];
    }
    return all.map((a: Record<string, unknown>, idx) => {
      const type =
        (a.collateralType as string) ||
        (a["Collateral Type"] as string) ||
        (a["Security Type"] as string) ||
        (a["Type"] as string) ||
        (a.type as string) ||
        "General Asset";
      const parseVal = (v: unknown) => {
        if (typeof v === "number") return v;
        if (typeof v === "string") return parseFloat(v.replace(/,/g, "")) || 0;
        return 0;
      };
      const value =
        parseVal(a.estimatedValue) ||
        parseVal(a["Collateral Value"]) ||
        parseVal(a["Estimated Value"]) ||
        parseVal(a["Market Value"]) ||
        parseVal(a.value) ||
        (Number(a.outstandingBalance) || 0) * 1.5 ||
        0;
      return {
        id: (a.id as string) || `COL-${100 + idx}`,
        type,
        sector: (a.sector as string) || "General",
        location: (a.region as string) || "Lagos",
        value,
        exposure: Number(a.outstandingBalance) || 0,
        status:
          a.region && a.region !== "Unknown" && a.region !== "Unclassified"
            ? "OK"
            : "Warning",
      };
    });
  }, [assets]);
  const navigate = useNavigate();
  const assessments = useMemo(() => {
    return collateralUniverse.map((item) => {
      const physScore =
        item.location === "Port Harcourt"
          ? 4.5
          : item.location === "Lagos"
            ? 3.5
            : item.location === "Warri" || item.location === "Kano City"
              ? 4
              : 2.5;
      const physLabel = getSensitivityLevel(physScore);

      const transScore =
        item.sector === "Energy"
          ? 5
          : item.sector === "Manufacturing"
            ? 4
            : item.sector === "Mining"
              ? 4.5
              : item.sector === "Agriculture"
                ? 3.5
                : item.sector === "Real Estate"
                  ? 3
                  : 2;
      const transLabel = getSensitivityLevel(transScore);

      const vulnScore =
        item.type === "Land"
          ? 3
          : item.type === "Buildings" || item.type === "Equipment"
            ? 3.5
            : item.type === "Vehicles"
              ? 2
              : 3;

      const scores = [physScore, transScore, vulnScore].sort((a, b) => b - a);
      const combinedRaw = scores[0] * 0.45 + scores[1] * 0.35 + scores[2] * 0.2;
      const combinedScore = Math.round(combinedRaw * 10) / 10;
      const combinedLevel = getSensitivityLevel(combinedScore);
      const haircut =
        HAIRCUT_POLICY[combinedLevel as keyof typeof HAIRCUT_POLICY];
      const adjustedValue = item.value * (1 - haircut);
      return {
        ...item,
        physScore,
        physLabel,
        transScore,
        transLabel,
        vulnScore,
        combinedScore,
        combinedLevel,
        haircut,
        adjustedValue,
      };
    });
  }, [collateralUniverse]);
  const renderHeader = () => (
    <Box
      sx={{ mb: 4, borderBottom: `1px solid ${theme.palette.divider}`, pb: 2 }}
    >
      <Typography
        variant="overline"
        sx={{
          color: DELOITTE_COLORS.green.DEFAULT,
          fontWeight: 700,
          letterSpacing: 1.2,
        }}
      >
        Credit Risk Management
      </Typography>
      <Typography
        variant="h3"
        sx={{
          fontFamily: "Times New Roman, serif",
          fontWeight: 700,
          color: DELOITTE_COLORS.green.DEFAULT,
          mt: 1,
        }}
      >
        Collateral Sensitivity Assessment
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "text.secondary", mt: 1, maxWidth: 800 }}
      >
        Evaluate the impact of physical and transition climate risks on
        collateral valuation and recoverability. Calculates combined sensitivity
        scores and recommended value adjustments (haircuts).
      </Typography>
    </Box>
  );
  if (collateralUniverse.length === 0) {
    return (
      <CRALayout>
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh" }}>
          <Paper
            elevation={0}
            sx={{
              backgroundColor:
                theme.palette.mode === "dark" ? "#0F1623" : "#FFFFFF",
              border: `2px dashed ${
                theme.palette.mode === "dark"
                  ? alpha("#334155", 0.5)
                  : "#CBD5E1"
              }`,
              borderRadius: 2.5,
              p: 8,
              textAlign: "center",
            }}
          >
            <Stack spacing={3} alignItems="center">
              <Box
                sx={{
                  p: 3,
                  backgroundColor: alpha(DELOITTE_COLORS.warning, 0.12),
                  borderRadius: "50%",
                  display: "flex",
                }}
              >
                <Database
                  size={56}
                  color={DELOITTE_COLORS.warning}
                  strokeWidth={1.5}
                />
              </Box>
              <Box>
                <Typography variant="h5" fontWeight={600} gutterBottom>
                  No Portfolio Data Found
                </Typography>
                <Typography color="text.secondary" maxWidth={500} mx="auto">
                  Collateral Sensitivity analysis requires portfolio data to be
                  uploaded first. Please upload your loan book or asset registry
                  to proceed.
                </Typography>
              </Box>
              <Button
                variant="contained"
                onClick={() => navigate("/cra/data")}
                startIcon={<ArrowRight />}
                sx={{
                  backgroundColor: DELOITTE_COLORS.green.DEFAULT,
                  "&:hover": {
                    backgroundColor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.9),
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
  const Step0_Readiness = () => (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      {!praReady && !traReady && (
        <Alert severity="info" sx={{ my: 2, maxWidth: 800, mx: "auto" }}>
          Please complete at least one Risk Assessment (Physical or Transition)
          to proceed.
        </Alert>
      )}
      <Card variant="outlined" sx={{ p: 4, borderRadius: 2 }}>
        <Typography
          variant="h5"
          sx={{ fontFamily: "Times New Roman, serif", fontWeight: 700, mb: 3 }}
        >
          Assessment Readiness
        </Typography>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Box
            sx={{
              p: 2,
              bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05),
              borderRadius: 1,
            }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Portfolio Context
            </Typography>
            <Typography variant="body2">
              Manufacturing – Rivers – Port Harcourt
            </Typography>
          </Box>
        </Stack>
        <Typography variant="subtitle2" sx={{ mb: 2, color: "text.secondary" }}>
          Upstream Dependencies
        </Typography>
        <Stack spacing={2} sx={{ mb: 4 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Shield
                size={20}
                color={
                  praReady
                    ? DELOITTE_COLORS.success
                    : DELOITTE_COLORS.slate.DEFAULT
                }
              />
              <Typography
                sx={{ color: praReady ? "text.primary" : "text.secondary" }}
              >
                Physical Risk Assessment
              </Typography>
            </Stack>
            {praReady ? (
              <Chip
                label="Completed"
                size="small"
                sx={{
                  bgcolor: alpha(DELOITTE_COLORS.success, 0.1),
                  color: DELOITTE_COLORS.success,
                }}
              />
            ) : (
              <Chip label="Pending" size="small" />
            )}
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <TrendingDown
                size={20}
                color={
                  traReady
                    ? DELOITTE_COLORS.success
                    : DELOITTE_COLORS.slate.DEFAULT
                }
              />
              <Typography
                sx={{ color: traReady ? "text.primary" : "text.secondary" }}
              >
                Transition Risk Assessment
              </Typography>
            </Stack>
            {traReady ? (
              <Chip
                label="Completed"
                size="small"
                sx={{
                  bgcolor: alpha(DELOITTE_COLORS.success, 0.1),
                  color: DELOITTE_COLORS.success,
                }}
              />
            ) : (
              <Chip label="Pending" size="small" />
            )}
          </Stack>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Database
                size={20}
                color={
                  collateralUniverse.length > 0
                    ? DELOITTE_COLORS.success
                    : DELOITTE_COLORS.error
                }
              />
              <Typography
                sx={{
                  color:
                    collateralUniverse.length > 0
                      ? "text.primary"
                      : "text.secondary",
                }}
              >
                Collateral Inventory Data
              </Typography>
            </Stack>
            {collateralUniverse.length > 0 ? (
              <Chip
                label="Available"
                size="small"
                sx={{
                  bgcolor: alpha(DELOITTE_COLORS.success, 0.1),
                  color: DELOITTE_COLORS.success,
                }}
              />
            ) : (
              <Chip label="Missing" size="small" color="error" />
            )}
          </Stack>
        </Stack>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!praReady && !traReady}
          onClick={() => setActiveStep(1)}
          sx={{ bgcolor: DELOITTE_COLORS.green.DEFAULT, py: 1.5 }}
        >
          Start Collateral Sensitivity Assessment
        </Button>
      </Card>
    </Box>
  );
  const Step1_Inventory = () => (
    <Stack spacing={4}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            sx={{ p: 2, textAlign: "center", bgcolor: "background.paper" }}
          >
            <Typography variant="caption" color="text.secondary">
              Total Secured Exposure
            </Typography>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {currencyFormatter.format(
                collateralUniverse.reduce((s, i) => s + i.exposure, 0),
              )}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            sx={{ p: 2, textAlign: "center", bgcolor: "background.paper" }}
          >
            <Typography variant="caption" color="text.secondary">
              Collateral Items
            </Typography>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              {collateralUniverse.length}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            sx={{ p: 2, textAlign: "center", bgcolor: "background.paper" }}
          >
            <Typography variant="caption" color="text.secondary">
              Location Coverage
            </Typography>
            <Typography variant="h5" fontWeight={700} color="success.main">
              100%
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            sx={{ p: 2, textAlign: "center", bgcolor: "background.paper" }}
          >
            <Typography variant="caption" color="text.secondary">
              Valuation Freshness
            </Typography>
            <Typography
              variant="h5"
              fontWeight={700}
              color={DELOITTE_COLORS.green.DEFAULT}
            >
              92%
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider" }}
      >
        <Table>
          <TableHead
            sx={{ bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05) }}
          >
            <TableRow>
              <TableCell>
                <strong>ID</strong>
              </TableCell>
              <TableCell>
                <strong>Type</strong>
              </TableCell>
              <TableCell>
                <strong>Sector</strong>
              </TableCell>
              <TableCell>
                <strong>Location</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Exp. Value</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Status</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collateralUniverse.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell>{row.sector}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell align="right">
                  {currencyFormatter.format(row.exposure)}
                </TableCell>
                <TableCell align="center">
                  {row.status === "OK" ? (
                    <CheckCircle2 size={18} color={DELOITTE_COLORS.success} />
                  ) : (
                    <Tooltip title="Data incomplete">
                      <AlertTriangle
                        size={18}
                        color={DELOITTE_COLORS.warning}
                      />
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
  const Step2_RiskMapping = () => (
    <Stack spacing={4}>
      <Typography variant="body1" color="text.secondary">
        Review automatically mapped climate risk factors based on collateral
        location (Physical Risk) and sector (Transition Risk).
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05),
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Shield color={DELOITTE_COLORS.green.DEFAULT} size={20} />
                <Typography variant="h6" fontFamily="Times New Roman, serif">
                  Physical Risk Mapping
                </Typography>
              </Stack>
            </Box>
            <CardContent>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                      Hazard
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                      Affected Collateral
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(hazardCollateralMap).map(
                    ([hazard, collaterals]) => (
                      <TableRow key={hazard}>
                        <TableCell
                          sx={{ fontWeight: 600, whiteSpace: "nowrap" }}
                        >
                          {hazard}
                        </TableCell>
                        <TableCell>
                          <Stack
                            direction="row"
                            gap={0.5}
                            flexWrap="wrap"
                            alignItems="center"
                          >
                            {collaterals.map((c, i) => (
                              <Chip
                                key={i}
                                label={c}
                                size="small"
                                variant="outlined"
                                onDelete={() => {
                                  setHazardCollateralMap((prev) => ({
                                    ...prev,
                                    [hazard]: prev[hazard].filter(
                                      (_, idx) => idx !== i,
                                    ),
                                  }));
                                }}
                                sx={{ fontSize: "0.75rem", cursor: "pointer" }}
                              />
                            ))}
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <TextField
                                size="small"
                                placeholder="Add..."
                                value={newCollateralInputs[hazard] || ""}
                                onChange={(e) =>
                                  setNewCollateralInputs((prev) => ({
                                    ...prev,
                                    [hazard]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    newCollateralInputs[hazard]?.trim()
                                  ) {
                                    setHazardCollateralMap((prev) => ({
                                      ...prev,
                                      [hazard]: [
                                        ...prev[hazard],
                                        newCollateralInputs[hazard].trim(),
                                      ],
                                    }));
                                    setNewCollateralInputs((prev) => ({
                                      ...prev,
                                      [hazard]: "",
                                    }));
                                  }
                                }}
                                sx={{
                                  width: 90,
                                  "& .MuiInputBase-input": {
                                    py: 0.5,
                                    px: 1,
                                    fontSize: "0.75rem",
                                  },
                                }}
                              />
                            </Stack>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <Box
              sx={{
                p: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05),
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <TrendingDown color={DELOITTE_COLORS.green.DEFAULT} size={20} />
                <Typography variant="h6" fontFamily="Times New Roman, serif">
                  Transition Risk Sensitivity
                </Typography>
              </Stack>
            </Box>
            <CardContent>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                      Sector
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
                      Transition Risk Factors
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(sectorRiskMap).map(([sector, risks]) => (
                    <TableRow key={sector}>
                      <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {sector}
                      </TableCell>
                      <TableCell>
                        <Stack
                          direction="row"
                          gap={0.5}
                          flexWrap="wrap"
                          alignItems="center"
                        >
                          {risks.map((r, i) => (
                            <Chip
                              key={i}
                              label={r}
                              size="small"
                              variant="outlined"
                              onDelete={() => {
                                setSectorRiskMap((prev) => ({
                                  ...prev,
                                  [sector]: prev[sector].filter(
                                    (_, idx) => idx !== i,
                                  ),
                                }));
                              }}
                              sx={{ fontSize: "0.75rem", cursor: "pointer" }}
                            />
                          ))}
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <TextField
                              size="small"
                              placeholder="Add..."
                              value={newSectorRiskInputs[sector] || ""}
                              onChange={(e) =>
                                setNewSectorRiskInputs((prev) => ({
                                  ...prev,
                                  [sector]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (
                                  e.key === "Enter" &&
                                  newSectorRiskInputs[sector]?.trim()
                                ) {
                                  setSectorRiskMap((prev) => ({
                                    ...prev,
                                    [sector]: [
                                      ...prev[sector],
                                      newSectorRiskInputs[sector].trim(),
                                    ],
                                  }));
                                  setNewSectorRiskInputs((prev) => ({
                                    ...prev,
                                    [sector]: "",
                                  }));
                                }
                              }}
                              sx={{
                                width: 90,
                                "& .MuiInputBase-input": {
                                  py: 0.5,
                                  px: 1,
                                  fontSize: "0.75rem",
                                },
                              }}
                            />
                          </Stack>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
  const Step3_Vulnerability = () => (
    <Stack spacing={4}>
      <Alert severity="info" icon={<Info />} sx={{ alignItems: "center" }}>
        Adjust the inherent vulnerability of assets. A high vulnerability score
        increases the impact of physical and transition risks.
      </Alert>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead
            sx={{ bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05) }}
          >
            <TableRow>
              <TableCell>Collateral</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="center">
                Physical Fragility{" "}
                <Tooltip title="Susceptibility to damage">
                  <Info size={14} />
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                Economic Obsolescence{" "}
                <Tooltip title="Asset-specific sensitivity to transition factors">
                  <Info size={14} />
                </Tooltip>
              </TableCell>
              <TableCell align="center">
                Adaptation{" "}
                <Tooltip title="Defenses in place">
                  <Info size={14} />
                </Tooltip>
              </TableCell>
              <TableCell align="center">Overall Vulnerability</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {collateralUniverse.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {row.id}
                  </Typography>
                </TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell align="center">
                  <Chip label="Medium" size="small" variant="outlined" />
                </TableCell>
                <TableCell align="center">
                  <Chip label="Low" size="small" variant="outlined" />
                </TableCell>
                <TableCell align="center">
                  <Chip label="High" size="small" variant="outlined" />
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label="Medium (3)"
                    size="small"
                    sx={{
                      bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.2),
                      color: "#B45309",
                      fontWeight: "bold",
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
  const Step4_Scoring = () => (
    <Stack spacing={4}>
      <Typography variant="body1" color="text.secondary">
        Combined sensitivity scores based on Physical Hazard, Sector Transition
        Risk, and Asset Vulnerability.
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead
            sx={{ bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05) }}
          >
            <TableRow>
              <TableCell>Collateral ID</TableCell>
              <TableCell align="center">Physical Sensitivity</TableCell>
              <TableCell align="center">Transition Sensitivity</TableCell>
              <TableCell align="center">Vulnerability</TableCell>
              <TableCell align="center">
                <strong>Combined Score</strong>
              </TableCell>
              <TableCell align="center">
                <strong>Sensitivity Level</strong>
              </TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessments.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.id}</TableCell>
                <TableCell align="center">
                  <Stack justifyContent="center" alignItems="center">
                    <Typography fontWeight={700}>{row.physScore}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.physLabel}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Stack justifyContent="center" alignItems="center">
                    <Typography fontWeight={700}>{row.transScore}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.transLabel}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Typography fontWeight={700}>{row.vulnScore}</Typography>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    bgcolor: alpha(
                      getSensitivityColor(row.combinedLevel),
                      0.05,
                    ),
                  }}
                >
                  <Typography
                    fontWeight={800}
                    sx={{ color: getSensitivityColor(row.combinedLevel) }}
                  >
                    {row.combinedScore}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={row.combinedLevel}
                    size="small"
                    sx={{
                      bgcolor: alpha(
                        getSensitivityColor(row.combinedLevel),
                        0.1,
                      ),
                      color: getSensitivityColor(row.combinedLevel),
                      fontWeight: 700,
                      minWidth: 80,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedCollateralId(row.id);
                      setDrawerOpen(true);
                    }}
                  >
                    <Eye size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
  const Step5_ValueImpact = () => (
    <Stack spacing={4}>
      <Alert
        severity="warning"
        icon={<AlertTriangle />}
        sx={{ alignItems: "center" }}
      >
        Haircuts are automatically applied based on Deloitte's Credit Risk
        Policy standards.
      </Alert>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead
            sx={{ bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05) }}
          >
            <TableRow>
              <TableCell>Collateral</TableCell>
              <TableCell align="right">Original Value</TableCell>
              <TableCell align="center">Sensitivity</TableCell>
              <TableCell align="center">Haircut</TableCell>
              <TableCell align="right">Adjusted Value</TableCell>
              <TableCell align="right">Loss Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessments.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {row.id}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.type}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  {currencyFormatter.format(row.value)}
                </TableCell>
                <TableCell align="center">
                  <Chip
                    size="small"
                    label={row.combinedLevel}
                    sx={{
                      bgcolor: alpha(
                        getSensitivityColor(row.combinedLevel),
                        0.1,
                      ),
                      color: getSensitivityColor(row.combinedLevel),
                      fontSize: "0.7rem",
                      fontWeight: 700,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <Typography color="error" fontWeight={600}>
                    -{(row.haircut * 100).toFixed(0)}%
                  </Typography>
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ bgcolor: alpha(DELOITTE_COLORS.success, 0.05) }}
                >
                  <Typography fontWeight={700}>
                    {currencyFormatter.format(row.adjustedValue)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography color="error" variant="caption">
                    {currencyFormatter.format(row.adjustedValue - row.value)}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableBody>
            <TableRow
              sx={{ bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05) }}
            >
              <TableCell colSpan={1}>
                <Typography fontWeight={700}>TOTAL</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={700}>
                  {currencyFormatter.format(
                    assessments.reduce((sum, i) => sum + i.value, 0),
                  )}
                </Typography>
              </TableCell>
              <TableCell colSpan={2} />
              <TableCell align="right">
                <Typography fontWeight={700}>
                  {currencyFormatter.format(
                    assessments.reduce((sum, i) => sum + i.adjustedValue, 0),
                  )}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontWeight={700} color="error">
                  {currencyFormatter.format(
                    assessments.reduce(
                      (sum, i) => sum + (i.adjustedValue - i.value),
                      0,
                    ),
                  )}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
  const Step6_Results = () => {
    const totalOriginal = assessments.reduce((sum, i) => sum + i.value, 0);
    const totalAdjusted = assessments.reduce(
      (sum, i) => sum + i.adjustedValue,
      0,
    );
    const totalLoss = totalOriginal - totalAdjusted;
    const highRiskExposure = assessments
      .filter(
        (i) => i.combinedLevel === "High" || i.combinedLevel === "Very High",
      )
      .reduce((sum, i) => sum + i.value, 0);
    const sensitivityDistribution = [
      "Very High",
      "High",
      "Medium",
      "Low",
      "Very Low",
    ]
      .map((level) => {
        const items = assessments.filter((a) => a.combinedLevel === level);
        return {
          level,
          count: items.length,
          exposure: items.reduce((s, i) => s + i.value, 0),
        };
      })
      .filter((d) => d.count > 0);
    const sectorSensitivity: Record<
      string,
      { avgScore: number; level: string; count: number }
    > = {};
    assessments.forEach((a) => {
      if (!sectorSensitivity[a.sector])
        sectorSensitivity[a.sector] = { avgScore: 0, level: "", count: 0 };
      sectorSensitivity[a.sector].avgScore += a.combinedScore;
      sectorSensitivity[a.sector].count++;
    });
    Object.keys(sectorSensitivity).forEach((s) => {
      sectorSensitivity[s].avgScore =
        sectorSensitivity[s].avgScore / sectorSensitivity[s].count;
      sectorSensitivity[s].level = getSensitivityLevel(
        sectorSensitivity[s].avgScore,
      );
    });

    const sectorMap: Record<string, { count: number; exposure: number }> = {};
    assessments.forEach((a) => {
      if (!sectorMap[a.sector]) sectorMap[a.sector] = { count: 0, exposure: 0 };
      sectorMap[a.sector].count++;
      sectorMap[a.sector].exposure += a.value - a.adjustedValue;
    });
    const topSector = Object.entries(sectorMap).sort(
      (a, b) => b[1].exposure - a[1].exposure,
    )[0];
    return (
      <Stack spacing={4}>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                bgcolor: DELOITTE_COLORS.green.DEFAULT,
                color: "#fff",
                height: "100%",
              }}
            >
              <Typography variant="overline" sx={{ opacity: 0.7 }}>
                Climate Adjusted Value
              </Typography>
              <Typography
                variant="h4"
                fontFamily="Times New Roman, serif"
                fontWeight={700}
              >
                {currencyFormatter.format(totalAdjusted)}
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mt: 2 }}
              >
                <TrendingDown size={16} color="#F87171" />
                <Typography variant="body2" color="#F87171">
                  {currencyFormatter.format(totalLoss)} write-down (
                  {totalOriginal > 0
                    ? ((totalLoss / totalOriginal) * 100).toFixed(1)
                    : "0"}
                  %)
                </Typography>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <Typography variant="overline" color="text.secondary">
                High Risk Collateral
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                color={DELOITTE_COLORS.error}
              >
                2 &nbsp;
                <span
                  style={{
                    fontSize: "1rem",
                    color: "#64748B",
                    fontWeight: 400,
                  }}
                >
                  items
                </span>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {currencyFormatter.format(highRiskExposure)} exposure at risk.
                Require immediate review.
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper
              sx={{
                p: 3,
                border: "1px solid",
                borderColor: "divider",
                height: "100%",
              }}
            >
              <Typography variant="overline" color="text.secondary">
                Top Affected Sector
              </Typography>
              <Typography
                variant="h4"
                fontWeight={700}
                color={DELOITTE_COLORS.green.DEFAULT}
              >
                {topSector ? topSector[0] : "N/A"}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {topSector
                  ? `${currencyFormatter.format(topSector[1].exposure)} loss across ${topSector[1].count} items`
                  : "No data"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Collateral Distribution by Sensitivity
          </Typography>
          <Box sx={{ position: "relative", mt: 3, mb: 8 }}>
            <Box
              sx={{
                height: 28,
                display: "flex",
                borderRadius: 1,
                overflow: "hidden",
                border: `1px solid ${isDark ? alpha("#fff", 0.15) : alpha("#000", 0.12)}`,
              }}
            >
              {(
                [
                  { level: "Very Low", label: "Very Low" },
                  { level: "Low", label: "Low" },
                  { level: "Medium", label: "Medium" },
                  { level: "High", label: "High" },
                  { level: "Very High", label: "Very High" },
                ] as const
              ).map((seg) => {
                const dist = sensitivityDistribution.find(
                  (d) => d.level === seg.level,
                );
                return (
                  <Tooltip
                    key={seg.level}
                    title={`${seg.level}: ${dist?.count || 0} items (${dist ? currencyFormatter.format(dist.exposure) : "S 0"})`}
                  >
                    <Box
                      sx={{
                        flex: 1,
                        bgcolor: alpha(
                          getSensitivityColor(seg.level),
                          dist && dist.count > 0 ? 1 : 0.25,
                        ),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight: `1px solid ${isDark ? alpha("#000", 0.3) : "#fff"}`,
                        transition: "all 0.2s",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#fff",
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          textShadow: "0 1px 2px rgba(0,0,0,0.3)",
                        }}
                      >
                        {dist && dist.count > 0 ? dist.count : ""}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mt: 0.5,
              }}
            >
              {["Very Low", "Low", "Medium", "High", "Very High"].map(
                (label) => (
                  <Typography
                    key={label}
                    variant="caption"
                    sx={{
                      flex: 1,
                      textAlign: "center",
                      color: "text.secondary",
                      fontSize: "0.65rem",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </Typography>
                ),
              )}
            </Box>
            <Box sx={{ display: "flex", mt: 1.5 }}>
              {["Very Low", "Low", "Medium", "High", "Very High"].map(
                (level) => (
                  <Stack
                    key={level}
                    alignItems="center"
                    spacing={0.5}
                    sx={{ flex: 1 }}
                  >
                    {Object.entries(sectorSensitivity)
                      .filter(([, data]) => data.level === level)
                      .map(([sector, data]) => (
                        <Chip
                          key={sector}
                          size="small"
                          label={`${sector} (${data.count})`}
                          sx={{
                            height: 20,
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            bgcolor: alpha(
                              getSensitivityColor(data.level),
                              0.12,
                            ),
                            color: getSensitivityColor(data.level),
                            border: `1px solid ${alpha(getSensitivityColor(data.level), 0.3)}`,
                            "& .MuiChip-label": { px: 0.8 },
                            width: "90%",
                          }}
                        />
                      ))}
                  </Stack>
                ),
              )}
            </Box>
          </Box>
        </Box>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Asset</strong>
                </TableCell>
                <TableCell>
                  <strong>Sector</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Sensitivity</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Value Loss</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>Haircut</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {assessments
                .sort(
                  (a, b) =>
                    b.value - b.adjustedValue - (a.value - a.adjustedValue),
                )
                .slice(0, 8)
                .map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.sector}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={row.combinedLevel}
                        size="small"
                        sx={{
                          bgcolor: alpha(
                            getSensitivityColor(row.combinedLevel),
                            0.1,
                          ),
                          color: getSensitivityColor(row.combinedLevel),
                          fontWeight: 700,
                          fontSize: "0.7rem",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: "error.main", fontWeight: 600 }}
                    >
                      {currencyFormatter.format(row.value - row.adjustedValue)}
                    </TableCell>
                    <TableCell align="center">
                      {(row.haircut * 100).toFixed(0)}%
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="outlined" startIcon={<Download />}>
            Export Report
          </Button>
          <Button
            variant="contained"
            startIcon={<Save />}
            onClick={() => setSaveDialogOpen(true)}
            sx={{ bgcolor: DELOITTE_COLORS.green.DEFAULT }}
          >
            Save Assessment
          </Button>
        </Stack>
      </Stack>
    );
  };
  const renderDetailDrawer = () => {
    const item = assessments.find((a) => a.id === selectedCollateralId);
    if (!item) return null;
    return (
      <Box sx={{ width: 400, p: 3 }}>
        <Typography
          variant="h6"
          fontFamily="Times New Roman, serif"
          gutterBottom
        >
          Collateral Details
        </Typography>
        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          gutterBottom
        >
          ID: {item.id}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle2">Context</Typography>
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Type: {item.type}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Location: {item.location}
                </Typography>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Typography variant="body2" color="text.secondary">
                  Sector: {item.sector}
                </Typography>
              </Grid>
            </Grid>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: DELOITTE_COLORS.green.DEFAULT }}
            >
              Climate Risk Inputs
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2">Physical Risk Risk</Typography>
                <Chip label={`${item.physScore}/5`} size="small" />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Mapped to Location: {item.location} (High flood zone)
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography variant="body2">Transition Risk</Typography>
                <Chip label={`${item.transScore}/5`} size="small" />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Mapped to Sector: {item.sector}
              </Typography>
            </Paper>
          </Box>
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: DELOITTE_COLORS.green.DEFAULT }}
            >
              Scoring Logic
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.1),
                borderRadius: 1,
                mt: 1,
              }}
            >
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Combined Score</Typography>
                <Typography variant="body2" fontWeight={700}>
                  {item.combinedScore}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mt: 0.5 }}
              >
                <Typography variant="body2">Sensitivity Level</Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={getSensitivityColor(item.combinedLevel)}
                >
                  {item.combinedLevel}
                </Typography>
              </Stack>
            </Box>
          </Box>
          <Box>
            <Typography variant="subtitle2" sx={{ color: "error.main" }}>
              Value Impact
            </Typography>
            <Typography
              variant="h5"
              color="error.main"
              fontWeight={700}
              sx={{ mt: 1 }}
            >
              -{(item.haircut * 100).toFixed(0)}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Policy defined haircut for {item.combinedLevel} sensitivity.
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  };
  return (
    <CRALayout>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
        {renderHeader()}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {COLLATERAL_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
        <Paper
          elevation={0}
          sx={{
            p: 4,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: theme.palette.divider,
            borderRadius: 2,
          }}
        >
          {activeStep === 0 && Step0_Readiness()}
          {activeStep === 1 && Step1_Inventory()}
          {activeStep === 2 && Step2_RiskMapping()}
          {activeStep === 3 && Step3_Vulnerability()}
          {activeStep === 4 && Step4_Scoring()}
          {activeStep === 5 && Step5_ValueImpact()}
          {activeStep === 6 && Step6_Results()}
        </Paper>
      </Box>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ zIndex: 1400 }}
      >
        {renderDetailDrawer()}
      </Drawer>
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Assessment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Save this snapshot for credit committee review.
          </Typography>
          <TextField
            fullWidth
            label="Assessment Name"
            defaultValue={`CRA-COL-2024-Q1`}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => setSaveDialogOpen(false)}
            sx={{ bgcolor: DELOITTE_COLORS.green.DEFAULT }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
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
        {activeStep > 0 && activeStep < 6 ? (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="outlined"
              onClick={() => setActiveStep(activeStep - 1)}
            >
              Back
            </Button>
            <Typography variant="caption" color="text.secondary">
              Step {activeStep + 1} of 7 — {COLLATERAL_STEPS[activeStep]}
            </Typography>
            <Button
              variant="contained"
              endIcon={<ArrowRight size={16} />}
              onClick={() => setActiveStep(activeStep + 1)}
              sx={{ bgcolor: DELOITTE_COLORS.green.DEFAULT }}
            >
              {activeStep === 5
                ? "View Results"
                : `Next: ${COLLATERAL_STEPS[activeStep + 1]}`}
            </Button>
          </Stack>
        ) : (
          <CRANavigation
            compact
            prevPath="/cra/transition-risk"
            prevLabel="Back: Transition Risk"
            nextPath="/cra/reporting"
            nextLabel="Next: Reporting"
          />
        )}
      </Box>
    </CRALayout>
  );
}
