import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  alpha,
  useTheme,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  TextField,
  Chip,
  Tooltip,
  Alert,
} from "@mui/material";
import {
  AlertTriangle,
  Zap,
  Droplet,
  Wind,
  Activity,
  Play,
  Flame,
  Waves,
  Mountain,
  ThermometerSnowflake,
  Plus,
  Eye,
  Clock,
  ArrowRight,
  ChevronRight,
  Save,
  Download,
} from "lucide-react";
import CRANavigation from "../components/CRANavigation";
import {
  usePRARiskStore,
  useCRAStatusStore,
  useCRADataStore,
} from "@/store/craStore";
import { useScenarioStore } from "@/store/scenarioStore";
import { useToast } from "@/features/e-learnings/components/ui/ToastContext";
import CRALayout from "../layout/CRALayout";
import * as XLSX from "xlsx";
import type { Asset } from "@/types/craTypes";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { formatExposureM, getDeterministicScore } from "../utils/craUtils";
import { useIndustry } from "@/hooks/useIndustry";

const getAssetExposure = (asset: Record<string, unknown>): number => {
  return (
    Number(asset.outstandingBalance) ||
    Number(asset["Net Book Value"]) ||
    Number(asset["Book Value"]) ||
    Number(asset.bookValue) ||
    0
  );
};
const getAssetName = (asset: Record<string, unknown>): string => {
  return (
    (asset.borrowerName as string) ||
    (asset["Tower ID"] as string) ||
    (asset["Segment ID"] as string) ||
    (asset["Facility ID"] as string) ||
    (asset["Equipment ID"] as string) ||
    (asset["System ID"] as string) ||
    (asset.id as string) ||
    "N/A"
  );
};

interface ScoredAsset extends Asset {
  impactScore: number;
  likelihoodScore: number;
  riskScore: number;
  impactLabel: string;
  likelihoodLabel: string;
  key: string;
  assetType?: string;
  exposure?: number;
}

interface MatrixCell {
  count: number;
  exposure: number;
  assets: ScoredAsset[];
}

interface TableRow {
  key: string;
  impact: string;
  impactScore: number;
  likelihood: string;
  likelihoodScore: number;
  riskScore: number;
}

interface PreviewTable {
  method: string;
  data: TableRow[];
}

const INITIAL_RISK_TYPES = [
  { id: "flood", label: "Flood", icon: Droplet, color: "#3B82F6" },
  {
    id: "drought",
    label: "Drought",
    icon: ThermometerSnowflake,
    color: "#F59E0B",
  },
  { id: "heatwave", label: "Heat Wave", icon: Zap, color: "#EC4899" },
  { id: "sea_level", label: "Sea Level Rise", icon: Waves, color: "#10B981" },
  { id: "cyclone", label: "Storm / Cyclone", icon: Wind, color: "#64748B" },
  { id: "landslide", label: "Landslide", icon: Mountain, color: "#8B5CF6" },
  { id: "wildfire", label: "Wildfire", icon: Flame, color: "#EF4444" },
  {
    id: "coastal_erosion",
    label: "Coastal Erosion",
    icon: Activity,
    color: "#0EA5E9",
  },
  {
    id: "cold_wave",
    label: "Cold Wave / Frost",
    icon: ThermometerSnowflake,
    color: "#6366F1",
  },
];
const MAPPING_METHODS = [
  { value: "location", label: "Location", desc: "Location-based assessment" },
  { value: "region", label: "Region", desc: "Regional climate patterns" },
  { value: "sector", label: "Sector", desc: "Sectoral vulnerability" },
];
const IMPACT_LEVELS = ["Very Low", "Low", "Medium", "High", "Very High"];
const LIKELIHOOD_LEVELS = ["Very Low", "Low", "Medium", "High", "Very High"];

const calculateMatrixConfig = (
  assets: Asset[],
  riskId: string,
  method: string,
) => {
  const matrix = Array(5)
    .fill(0)
    .map(() =>
      Array(5)
        .fill(0)
        .map(() => ({ count: 0, exposure: 0, assets: [] as ScoredAsset[] })),
    );
  const tableRows: TableRow[] = [];
  const assetGroups: Record<string, Asset[]> = {};
  const allAssetsWithScores: ScoredAsset[] = [];
  assets.forEach((asset) => {
    let key = "Unknown";
    if (method === "location")
      key =
        (asset["Location"] as string) ||
        (asset["location"] as string) ||
        (asset["City"] as string) ||
        (asset["city"] as string) ||
        asset.region ||
        "Lagos";
    if (method === "region") key = asset.region || "Greater Lagos";
    if (method === "sector") key = asset.sector || "General";
    if (!assetGroups[key]) assetGroups[key] = [];
    assetGroups[key].push(asset);
  });
  Object.keys(assetGroups).forEach((key) => {
    const groupAssets = assetGroups[key];
    const impactScore = getDeterministicScore(
      `${riskId}-${method}-${key}-impact`,
    );
    const likelihoodScore = getDeterministicScore(
      `${riskId}-${method}-${key}-likelihood`,
    );
    const riskScore = impactScore * likelihoodScore;
    const impactLabel = IMPACT_LEVELS[impactScore - 1];
    const likelihoodLabel = LIKELIHOOD_LEVELS[likelihoodScore - 1];
    tableRows.push({
      key,
      impact: impactLabel,
      impactScore,
      likelihood: likelihoodLabel,
      likelihoodScore,
      riskScore,
    });
    const impactIdx = impactScore - 1;
    const likelihoodIdx = likelihoodScore - 1;
    groupAssets.forEach((asset) => {
      matrix[likelihoodIdx][impactIdx].count++;
      matrix[likelihoodIdx][impactIdx].exposure += getAssetExposure(asset);
      matrix[likelihoodIdx][impactIdx].assets.push({
        ...asset,
        impactScore,
        likelihoodScore,
        riskScore,
        impactLabel,
        likelihoodLabel,
        key,
      });
      allAssetsWithScores.push({
        ...asset,
        impactScore,
        likelihoodScore,
        riskScore,
        impactLabel,
        likelihoodLabel,
        key,
      });
    });
  });
  return { matrix, tableRows, allAssetsWithScores };
};
export default function PhysicalRiskAssessment() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const { config: industryConfig } = useIndustry();
  const { createScenario, updateParameter } = useScenarioStore();
  const { addToast } = useToast();
  const {
    selectedRisks,
    riskConfigurations,
    riskResults,
    recentAssessments,
    physicalShockMatrix,
    setSelectedRisks,
    updateRiskConfig,
    setRiskResults,
    saveAssessment,
    loadAssessment,
  } = usePRARiskStore();
  const { setPRAReady } = useCRAStatusStore();
  const { assets } = useCRADataStore();
  const [viewMode, setViewMode] = useState<
    "decision" | "setup" | "processing" | "overview"
  >(Object.keys(riskResults).length > 0 ? "overview" : "decision");
  const [activeMatrixTab, setActiveMatrixTab] = useState(0);
  const [customRisks, setCustomRisks] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [showAddRiskModal, setShowAddRiskModal] = useState(false);
  const [newRiskName, setNewRiskName] = useState("");
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState<{
    riskId: string;
    tables: PreviewTable[];
  } | null>(null);
  const [drillDownCell, setDrillDownCell] = useState<{
    l: number;
    i: number;
    riskId: string;
    method: string;
    assets: ScoredAsset[];
  } | null>(null);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [shockResult, setShockResult] = useState<number | null>(null);
  const hasUploadedAssets = Object.values(assets).some(
    (assetType) => assetType.data && assetType.data.length > 0,
  );
  const uploadedAssetTypes = Object.keys(assets).filter(
    (key) => assets[key].data && assets[key].data.length > 0,
  );
  const allRiskTypes = useMemo(() => {
    return [...INITIAL_RISK_TYPES, ...customRisks];
  }, [customRisks]);
  const allMatrices = useMemo(() => {
    const flat: Array<{
      riskId: string;
      method: string;
      matrix: MatrixCell[][];
      allAssets?: ScoredAsset[];
      riskLabel: string;
      methodLabel: string;
      assetLabels: string[];
    }> = [];
    Object.keys(riskResults).forEach((riskId) => {
      const riskLabel =
        allRiskTypes.find((r) => r.id === riskId)?.label || riskId;
      const methodResults = riskResults[riskId];
      const config = riskConfigurations[riskId];
      const assetLabels = (config?.selectedAssets || []).map(
        (key) => assets[key]?.type || key,
      );

      if (typeof methodResults === "object" && methodResults !== null) {
        Object.keys(methodResults).forEach((method) => {
          const methodLabel =
            MAPPING_METHODS.find((m) => m.value === method)?.label || method;
          const resultData = (
            methodResults as Record<
              string,
              | { matrix?: MatrixCell[][]; allAssetsWithScores?: ScoredAsset[] }
              | MatrixCell[][]
            >
          )[method];
          const matrix = Array.isArray(resultData)
            ? resultData
            : resultData?.matrix;
          const allAssets = Array.isArray(resultData)
            ? []
            : resultData?.allAssetsWithScores || [];
          if (matrix) {
            flat.push({
              riskId,
              method,
              matrix,
              allAssets,
              riskLabel,
              methodLabel,
              assetLabels,
            });
          }
        });
      }
    });
    return flat;
  }, [riskResults, allRiskTypes, riskConfigurations, assets]);

  const handleToggleRisk = (riskId: string) => {
    if (selectedRisks.includes(riskId)) {
      setSelectedRisks(selectedRisks.filter((id) => id !== riskId));
    } else {
      setSelectedRisks([...selectedRisks, riskId]);
      if (!riskConfigurations[riskId]) {
        updateRiskConfig(riskId, {
          riskId,
          mappingMethod: [],
          selectedAssets: [],
          justification: "",
        });
      }
    }
  };
  const handleConfigChange = (
    riskId: string,
    field: keyof (typeof riskConfigurations)[string],
    value: unknown,
  ) => {
    updateRiskConfig(riskId, { [field]: value });
  };
  const handleAddCustomRisk = () => {
    if (newRiskName.trim()) {
      const newRisk = {
        id: `custom_${Date.now()}`,
        label: newRiskName.trim(),
        icon: AlertTriangle,
        color: "#64748B",
      };
      setCustomRisks([...customRisks, newRisk]);
      setNewRiskName("");
      setShowAddRiskModal(false);
    }
  };
  const handlePreview = (riskId: string) => {
    const config = riskConfigurations[riskId];
    if (!config) return;
    const methods = Array.isArray(config.mappingMethod)
      ? config.mappingMethod
      : [config.mappingMethod];
    const assetKeys =
      config.selectedAssets && config.selectedAssets.length > 0
        ? config.selectedAssets
        : uploadedAssetTypes;
    const selectedAssetData = assetKeys.flatMap(
      (key) => assets[key]?.data || [],
    );
    const previewTables = methods.map((method: string) => {
      const { tableRows } = calculateMatrixConfig(
        selectedAssetData,
        riskId,
        method as string,
      );
      return { method, data: tableRows };
    });
    setPreviewData({ riskId, tables: previewTables });
    setShowPreviewModal(true);
  };
  const handleRunAssessment = () => {
    setViewMode("processing");
    setTimeout(() => {
      const newResults: Record<
        string,
        Record<
          string,
          { matrix: MatrixCell[][]; allAssetsWithScores: ScoredAsset[] }
        >
      > = {};
      selectedRisks.forEach((riskId) => {
        const config = riskConfigurations[riskId];
        if (!config) return;
        const methods = Array.isArray(config.mappingMethod)
          ? config.mappingMethod
          : [config.mappingMethod];
        const assetKeys =
          config.selectedAssets && config.selectedAssets.length > 0
            ? config.selectedAssets
            : uploadedAssetTypes;
        const selectedAssetData = assetKeys.flatMap(
          (key) =>
            assets[key]?.data.map((d: Asset) => ({
              ...d,
              assetType: assets[key].type,
            })) || [],
        );
        newResults[riskId] = {};
        methods.forEach((method: string) => {
          const { matrix, allAssetsWithScores } = calculateMatrixConfig(
            selectedAssetData,
            riskId,
            method,
          );
          newResults[riskId][method] = { matrix, allAssetsWithScores };
        });
      });
      setRiskResults({ ...riskResults, ...newResults });
      setPRAReady(true);
      setViewMode("overview");
      setActiveMatrixTab(0);
    }, 2500);
  };
  const handleCellClick = (
    l: number,
    i: number,
    riskId: string,
    method: string,
    cellAssets: ScoredAsset[],
  ) => {
    if (cellAssets && cellAssets.length > 0) {
      setDrillDownCell({ l, i, riskId, method, assets: cellAssets });
    }
  };
  if (!hasUploadedAssets) {
    return (
      <CRALayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            textAlign: "center",
            gap: 3,
            p: 3,
          }}
        >
          <AlertTriangle size={64} color={theme.palette.warning.main} />
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              No Asset Data Uploaded
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ maxWidth: 500, mx: "auto" }}
            >
              Please upload asset data first before configuring physical risk
              assessments.
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => {}} disabled>
            Upload Data (Go to CRA Overview)
          </Button>
        </Box>
      </CRALayout>
    );
  }
  if (viewMode === "decision") {
    if (!hasUploadedAssets) {
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
                    backgroundColor: alpha(DELOITTE_COLORS.warning, 0.12),
                    borderRadius: "50%",
                    display: "flex",
                  }}
                >
                  <AlertTriangle
                    size={56}
                    color={DELOITTE_COLORS.warning}
                    strokeWidth={1.5}
                  />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    Prerequisites Not Met
                  </Typography>
                  <Typography color="text.secondary" maxWidth={500} mx="auto">
                    Physical Risk Assessment requires portfolio data. Please
                    upload data in the Data Upload module first.
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
              sx={{
                borderBottom: `1px solid ${isDark ? alpha("#94A3B8", 0.2) : alpha("#94A3B8", 0.2)}`,
                pb: 3,
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "flex-end" }}
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: isDark
                        ? DELOITTE_COLORS.slate.lit
                        : DELOITTE_COLORS.green.DEFAULT,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: 1.2,
                      display: "block",
                      mb: 0.5,
                    }}
                  >
                    CLIMATE RISK ASSESSMENT
                  </Typography>
                  <Typography
                    variant="h3"
                    fontWeight={700}
                    color="text.primary"
                    sx={{ mt: 1, letterSpacing: -0.5 }}
                  >
                    Physical Risk Assessment
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "1rem",
                      color: isDark ? alpha("#FFFFFF", 0.65) : "#64748B",
                      lineHeight: 1.6,
                    }}
                  >
                    Evaluate exposure to acute and chronic climate hazards.
                  </Typography>
                </Box>
                {viewMode === "decision" && (
                  <Button
                    variant="contained"
                    startIcon={<Play />}
                    onClick={() => {
                      setSelectedRisks([]);
                      setRiskResults({});
                      setViewMode("setup");
                    }}
                    sx={{
                      backgroundColor: DELOITTE_COLORS.green.DEFAULT,
                      color: "#FFFFFF",
                      "&:hover": {
                        backgroundColor: "#E5A710",
                      },
                    }}
                  >
                    Start New Assessment
                  </Button>
                )}
              </Stack>
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
                  onClick={() => setViewMode("setup")}
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
                    Select hazards and configure risk parameters to analyze
                    portfolio vulnerability.
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowRight size={18} />}
                    sx={{
                      bgcolor: DELOITTE_COLORS.green.DEFAULT,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMode("setup");
                    }}
                  >
                    Configure Analysis
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
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Clock
                          size={20}
                          color={DELOITTE_COLORS.green.DEFAULT}
                        />
                        <Typography variant="h6" fontWeight={700}>
                          Recent Assessments
                        </Typography>
                      </Stack>
                      <Button
                        size="small"
                        endIcon={<ArrowRight size={16} />}
                        sx={{ color: DELOITTE_COLORS.green.DEFAULT }}
                      >
                        View All
                      </Button>
                    </Stack>
                  </Box>
                  {recentAssessments.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                      <Typography variant="body2" color="text.secondary">
                        No previous assessments found.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack
                      divider={
                        <Box sx={{ borderBottom: 1, borderColor: "divider" }} />
                      }
                    >
                      {recentAssessments.map((assessment) => (
                        <Box
                          key={assessment.id}
                          sx={{
                            p: 3,
                            "&:hover": {
                              bgcolor: alpha(
                                DELOITTE_COLORS.slate.DEFAULT,
                                0.05,
                              ),
                            },
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            loadAssessment(assessment.id);
                            setPRAReady(true);
                            setViewMode("overview");
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
                              <Activity size={20} />
                            </Box>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                mb={0.5}
                              >
                                {assessment.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={1}
                              >
                                {new Date(assessment.date).toLocaleDateString()}
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
                                    {new Date(
                                      assessment.date,
                                    ).toLocaleTimeString()}
                                  </Typography>
                                </Stack>
                                <Chip
                                  label={`${assessment.selectedRisks.length} Risks`}
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.65rem",
                                    bgcolor: alpha(
                                      DELOITTE_COLORS.success,
                                      0.1,
                                    ),
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
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </CRALayout>
    );
  }
  if (viewMode === "processing") {
    return (
      <CRALayout>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
            gap: 2,
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h5">Analyzing Portfolio Exposure...</Typography>
          <Typography color="text.secondary">
            Mapping assets to hazard layers...
          </Typography>
        </Box>
      </CRALayout>
    );
  }
  if (viewMode === "setup") {
    return (
      <CRALayout>
        <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Configuration
              </Typography>
              <Typography color="text.secondary">
                Select risks and mapping parameters
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => setViewMode("decision")}>
              Cancel
            </Button>
          </Stack>
          <Stack spacing={4}>
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Select Risks</Typography>
                <Button
                  startIcon={<Plus size={18} />}
                  variant="outlined"
                  size="small"
                  onClick={() => setShowAddRiskModal(true)}
                >
                  Add Custom Risk
                </Button>
              </Stack>
              <Grid container spacing={2}>
                {allRiskTypes.map((risk) => {
                  const isSelected = selectedRisks.includes(risk.id);
                  const Icon =
                    "icon" in risk
                      ? (
                          risk as unknown as {
                            icon: React.ComponentType<{
                              size?: number;
                              color?: string;
                            }>;
                            color: string;
                          }
                        ).icon
                      : AlertTriangle;
                  const color =
                    "color" in risk
                      ? (
                          risk as unknown as {
                            icon: React.ComponentType<{
                              size?: number;
                              color?: string;
                            }>;
                            color: string;
                          }
                        ).color
                      : "#94A3B8";
                  return (
                    <Grid size={{ xs: 6, md: 3, lg: 2 }} key={risk.id}>
                      <Paper
                        variant="outlined"
                        onClick={() => handleToggleRisk(risk.id)}
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          borderColor: isSelected ? color : "divider",
                          bgcolor: isSelected
                            ? alpha(color, 0.08)
                            : "transparent",
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          height: "100%",
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between">
                          <Icon size={24} color={isSelected ? color : "gray"} />
                          <Checkbox
                            checked={isSelected}
                            size="small"
                            disableRipple
                          />
                        </Stack>
                        <Typography fontWeight={600} variant="body2">
                          {risk.label}
                        </Typography>
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </Paper>
            {selectedRisks.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Parameters
                </Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width="20%">Risk Type</TableCell>
                        <TableCell width="25%">Mapping Method(s)</TableCell>
                        <TableCell width="25%">Select Assets</TableCell>
                        <TableCell width="20%">
                          Justification{" "}
                          <span style={{ color: "#EF4444" }}>*</span>
                        </TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedRisks.map((riskId) => {
                        const risk = allRiskTypes.find((r) => r.id === riskId);
                        const config = riskConfigurations[riskId];
                        if (!config) return null;
                        return (
                          <TableRow key={riskId}>
                            <TableCell>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Typography fontWeight={500}>
                                  {risk?.label}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <FormControl fullWidth size="small">
                                <Select
                                  multiple
                                  value={
                                    Array.isArray(config.mappingMethod)
                                      ? config.mappingMethod
                                      : []
                                  }
                                  onChange={(e) =>
                                    handleConfigChange(
                                      riskId,
                                      "mappingMethod",
                                      e.target.value,
                                    )
                                  }
                                  renderValue={(selected: string[]) => (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                      }}
                                    >
                                      {selected.map((val: string) => (
                                        <Chip
                                          key={val}
                                          label={
                                            MAPPING_METHODS.find(
                                              (m) => m.value === val,
                                            )?.label || val
                                          }
                                          size="small"
                                        />
                                      ))}
                                    </Box>
                                  )}
                                >
                                  {MAPPING_METHODS.map((m) => (
                                    <MenuItem key={m.value} value={m.value}>
                                      {m.label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <FormControl fullWidth size="small">
                                <Select
                                  multiple
                                  value={config.selectedAssets || []}
                                  onChange={(e) =>
                                    handleConfigChange(
                                      riskId,
                                      "selectedAssets",
                                      e.target.value,
                                    )
                                  }
                                  renderValue={(selected: string[]) => (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                      }}
                                    >
                                      {selected.map((val: string) => (
                                        <Chip
                                          key={val}
                                          label={assets[val]?.type || val}
                                          size="small"
                                        />
                                      ))}
                                    </Box>
                                  )}
                                >
                                  {uploadedAssetTypes.map((key) => (
                                    <MenuItem key={key} value={key}>
                                      {assets[key].type}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </TableCell>
                            <TableCell>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Provide justification..."
                                value={config.justification || ""}
                                onChange={(e) =>
                                  handleConfigChange(
                                    riskId,
                                    "justification",
                                    e.target.value,
                                  )
                                }
                                required
                                error={!config.justification?.trim()}
                                helperText={
                                  !config.justification?.trim()
                                    ? "Required"
                                    : ""
                                }
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Button
                                size="small"
                                variant="text"
                                startIcon={<Eye size={16} />}
                                disabled={
                                  !config.mappingMethod?.length ||
                                  !config.selectedAssets?.length
                                }
                                onClick={() => handlePreview(riskId)}
                              >
                                Preview
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  spacing={2}
                  mt={3}
                >
                  <Button
                    startIcon={<Play />}
                    variant="contained"
                    onClick={handleRunAssessment}
                    disabled={selectedRisks.some(
                      (riskId) =>
                        !riskConfigurations[riskId]?.justification?.trim() ||
                        !riskConfigurations[riskId]?.mappingMethod?.length ||
                        !riskConfigurations[riskId]?.selectedAssets?.length,
                    )}
                  >
                    Run Assessment
                  </Button>
                </Stack>
              </Paper>
            )}
          </Stack>
          <Dialog
            open={showAddRiskModal}
            onClose={() => setShowAddRiskModal(false)}
          >
            <DialogTitle>Add Custom Physical Risk</DialogTitle>
            <DialogContent>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Define a new physical risk type to include in your assessment.
              </Typography>
              <TextField
                autoFocus
                label="Risk Name"
                fullWidth
                value={newRiskName}
                onChange={(e) => setNewRiskName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowAddRiskModal(false)}>Cancel</Button>
              <Button
                onClick={handleAddCustomRisk}
                variant="contained"
                disabled={!newRiskName.trim()}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>Preview Scoring Configuration</DialogTitle>
            <DialogContent dividers>
              {previewData && (
                <Stack spacing={3}>
                  <Typography gutterBottom>
                    Previewing mapping for{" "}
                    <b>
                      {
                        allRiskTypes.find((r) => r.id === previewData.riskId)
                          ?.label
                      }
                    </b>
                    . Showing sample scoring distribution based on selected
                    methods.
                  </Typography>
                  {previewData.tables.map((tbl: PreviewTable, idx: number) => (
                    <Box key={idx}>
                      <Typography
                        variant="subtitle2"
                        gutterBottom
                        sx={{
                          textTransform: "uppercase",
                          color: "text.secondary",
                        }}
                      >
                        Method:{" "}
                        {MAPPING_METHODS.find((m) => m.value === tbl.method)
                          ?.label || tbl.method}
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                {MAPPING_METHODS.find(
                                  (m) => m.value === tbl.method,
                                )?.label || "Key"}
                              </TableCell>
                              <TableCell>Impact</TableCell>
                              <TableCell>Impact Score</TableCell>
                              <TableCell>Likelihood</TableCell>
                              <TableCell>Likelihood Score</TableCell>
                              <TableCell>Risk Score</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tbl.data
                              .slice(0, 8)
                              .map((row: TableRow, rIdx: number) => (
                                <TableRow key={rIdx}>
                                  <TableCell>{row.key}</TableCell>
                                  <TableCell>{row.impact}</TableCell>
                                  <TableCell>{row.impactScore}</TableCell>
                                  <TableCell>{row.likelihood}</TableCell>
                                  <TableCell>{row.likelihoodScore}</TableCell>
                                  <TableCell>
                                    <b>{row.riskScore}</b>
                                  </TableCell>
                                </TableRow>
                              ))}
                            {tbl.data.length > 8 && (
                              <TableRow>
                                <TableCell colSpan={6} align="center">
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ... {tbl.data.length - 8} more rows
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  ))}
                </Stack>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowPreviewModal(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </CRALayout>
    );
  }
  if (viewMode === "overview") {
    const activeItem = allMatrices[activeMatrixTab];
    const topHazardContributors = activeItem?.allAssets
      ? (() => {
          const groups: Record<string, number> = {};
          let totalHiRiskExposure = 0;
          activeItem.allAssets.forEach((a: ScoredAsset) => {
            if (a.riskScore >= 10) {
              const key = a.key || "Unknown";
              groups[key] = (groups[key] || 0) + (a.exposure || 0);
              totalHiRiskExposure += a.exposure || 0;
            }
          });
          return Object.entries(groups)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, val]) => ({
              name,
              value: val,
              percent:
                totalHiRiskExposure > 0 ? (val / totalHiRiskExposure) * 100 : 0,
            }));
        })()
      : [];
    const handleExport = () => {
      if (!activeItem?.allAssets) return;
      const data = activeItem.allAssets.map((asset: ScoredAsset) => ({
        "Asset Type": asset.assetType,
        [industryConfig.id === "telecommunications"
          ? "Asset Name"
          : "Borrower"]: getAssetName(asset),
        "Ref ID": asset.facilityId || asset.id,
        Key: asset.key,
        Exposure: getAssetExposure(asset),
        "Risk Score": asset.riskScore,
        Impact: IMPACT_LEVELS[asset.impactScore - 1],
        Likelihood: LIKELIHOOD_LEVELS[asset.likelihoodScore - 1],
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Risk Data");
      XLSX.writeFile(wb, "Physical_Risk_Data.xlsx");
    };
    return (
      <CRALayout>
        <Dialog
          open={shockResult !== null}
          onClose={() => setShockResult(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Physical Impact Shocks Generated
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
                Shock Calculated
              </Typography>
              <Typography color="text.secondary" paragraph>
                Based on the location-weited risk exposure, the recommended
                Physical Damage Index (PDI) for stress testing is:
              </Typography>
              <Typography
                variant="h2"
                fontWeight={800}
                color="primary"
                sx={{ my: 1 }}
              >
                {shockResult}
              </Typography>
              <Chip
                label="Physical Damage Index (0.0 - 1.0)"
                size="small"
                sx={{ mb: 3 }}
              />
              <Alert severity="info" sx={{ textAlign: "left" }}>
                This shock parameter represents the estimated capital
                destruction factor to be applied in the Scenario Analysis
                module.
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
                createScenario("custom", "medium", `Physical Shock`);
                updateParameter("physicalDamageIndex", shockResult!);
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
        <Box sx={{ p: 3, maxWidth: 1600, mx: "auto", pb: 10 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Physical Risk Overview
              </Typography>
              <Typography color="text.secondary">
                Aggregate view of all assessed risks
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                startIcon={<Save />}
                variant="outlined"
                onClick={() => {
                  saveAssessment();
                  addToast("Assessment saved to recent history.", "success");
                  setViewMode("decision");
                }}
              >
                Save
              </Button>
              <Button
                variant="outlined"
                onClick={() => setViewMode("decision")}
              >
                Close
              </Button>
              <Button
                startIcon={<Plus />}
                variant="contained"
                onClick={() => setViewMode("setup")}
              >
                New
              </Button>
            </Stack>
          </Stack>
          {allMatrices.length === 0 ? (
            <Paper sx={{ p: 5, textAlign: "center" }}>
              <Typography color="text.secondary">
                No assessments completed yet.
              </Typography>
            </Paper>
          ) : (
            <Box>
              <Paper sx={{ mb: 3 }}>
                <Tabs
                  value={activeMatrixTab}
                  onChange={(_, v) => setActiveMatrixTab(v)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ borderBottom: 1, borderColor: "divider" }}
                >
                  {allMatrices.map((item) => (
                    <Tab
                      key={`${item.riskId}-${item.method}`}
                      label={`${item.riskLabel} (${item.methodLabel})`}
                    />
                  ))}
                </Tabs>
                {activeItem && (
                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={4}>
                      <Grid size={{ xs: 12, lg: 8 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="h6">
                              Risk Matrix: {activeItem.riskLabel}
                            </Typography>
                            {activeItem.assetLabels.length > 0 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Asset Types: {activeItem.assetLabels.join(", ")}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: "action.hover",
                            borderRadius: 2,
                            overflow: "auto",
                          }}
                        >
                          <Box
                            sx={{
                              display: "grid",
                              gridTemplateColumns: "100px repeat(5, 1fr)",
                              gap: 1,
                              minWidth: 600,
                            }}
                          >
                            <Box />
                            {[
                              "Very Low (1)",
                              "Low (2)",
                              "Medium (3)",
                              "High (4)",
                              "Very High (5)",
                            ].map((label) => (
                              <Box
                                key={label}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  p: 1,
                                  fontWeight: "bold",
                                  color: "text.secondary",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {label}
                              </Box>
                            ))}
                            {[
                              { idx: 4, label: "Very High (5)" },
                              { idx: 3, label: "High (4)" },
                              { idx: 2, label: "Medium (3)" },
                              { idx: 1, label: "Low (2)" },
                              { idx: 0, label: "Very Low (1)" },
                            ].map(({ idx: impactIdx, label: rowLabel }) => (
                              <>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "flex-end",
                                    pr: 2,
                                    fontWeight: "bold",
                                    color: "text.secondary",
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {rowLabel}
                                </Box>
                                {[0, 1, 2, 3, 4].map((likelihoodIdx) => {
                                  const cell =
                                    activeItem.matrix[likelihoodIdx][impactIdx];
                                  const score =
                                    (impactIdx + 1) * (likelihoodIdx + 1);
                                  let bgColor = "#bbf7d0";
                                  if (score >= 20) bgColor = "#fca5a5";
                                  else if (score >= 12) bgColor = "#fdba74";
                                  else if (score >= 6) bgColor = "#fde047";
                                  return (
                                    <Tooltip
                                      key={`${impactIdx}-${likelihoodIdx}`}
                                      title={
                                        cell.count > 0 ? (
                                          <Box sx={{ p: 0.5 }}>
                                            <Typography
                                              variant="subtitle2"
                                              sx={{
                                                mb: 1,
                                                textDecoration: "underline",
                                              }}
                                            >
                                              Top Assets:
                                            </Typography>
                                            {cell.assets
                                              .sort(
                                                (
                                                  a: ScoredAsset,
                                                  b: ScoredAsset,
                                                ) =>
                                                  (b.exposure || 0) -
                                                  (a.exposure || 0),
                                              )
                                              .slice(0, 5)
                                              .map(
                                                (
                                                  a: ScoredAsset,
                                                  idx: number,
                                                ) => (
                                                  <Stack
                                                    key={idx}
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    spacing={2}
                                                    sx={{ mb: 0.5 }}
                                                  >
                                                    <Typography variant="caption">
                                                      {a.borrowerName ||
                                                        "Unnamed"}
                                                    </Typography>
                                                    <Typography
                                                      variant="caption"
                                                      fontWeight="bold"
                                                    >
                                                      {formatExposureM(
                                                        a.exposure,
                                                      )}
                                                    </Typography>
                                                  </Stack>
                                                ),
                                              )}
                                          </Box>
                                        ) : (
                                          ""
                                        )
                                      }
                                      arrow
                                      placement="top"
                                    >
                                      <Paper
                                        elevation={0}
                                        onClick={() =>
                                          handleCellClick(
                                            likelihoodIdx + 1,
                                            impactIdx + 1,
                                            activeItem.riskId,
                                            activeItem.method,
                                            cell.assets,
                                          )
                                        }
                                        sx={{
                                          bgcolor: alpha(bgColor, 0.7),
                                          border: "1px solid rgba(0,0,0,0.05)",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          aspectRatio: "1/0.8",
                                          cursor:
                                            cell.count > 0
                                              ? "pointer"
                                              : "default",
                                          transition: "all 0.2s",
                                          "&:hover": {
                                            transform: "scale(1.02)",
                                            boxShadow: 2,
                                            zIndex: 1,
                                          },
                                        }}
                                      >
                                        {cell.count > 0 && (
                                          <>
                                            <Typography
                                              fontWeight={800}
                                              variant="h6"
                                            >
                                              {cell.count}
                                            </Typography>
                                            <Typography
                                              variant="caption"
                                              sx={{ fontSize: "0.65rem" }}
                                            >
                                              ₦{formatExposureM(cell.exposure)}
                                            </Typography>
                                          </>
                                        )}
                                      </Paper>
                                    </Tooltip>
                                  );
                                })}
                              </>
                            ))}
                          </Box>
                        </Box>
                        <Stack
                          direction="row"
                          justifyContent="center"
                          mt={2}
                          spacing={4}
                        >
                          <Typography variant="body2" color="text.secondary">
                            Y-Axis: <b>Impact Severity</b>
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            X-Axis: <b>Likelihood Probability</b>
                          </Typography>
                        </Stack>
                        <Stack
                          direction="row"
                          justifyContent="center"
                          mt={2}
                          spacing={3}
                          sx={{
                            p: 1,
                            bgcolor: "background.paper",
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          {[
                            {
                              label: "Very High Risk (20-25)",
                              color: "#fca5a5",
                            },
                            { label: "High Risk (12-16)", color: "#fdba74" },
                            { label: "Medium Risk (6-10)", color: "#fde047" },
                            { label: "Low Risk (1-5)", color: "#bbf7d0" },
                          ].map((item) => (
                            <Stack
                              key={item.label}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Box
                                sx={{
                                  width: 16,
                                  height: 16,
                                  bgcolor: item.color,
                                  borderRadius: 0.5,
                                  border: "1px solid rgba(0,0,0,0.1)",
                                }}
                              />
                              <Typography variant="caption">
                                {item.label}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Grid>
                      <Grid size={{ xs: 12, lg: 4 }}>
                        <Stack spacing={2}>
                          <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography
                              variant="subtitle2"
                              color="primary"
                              gutterBottom
                            >
                              TOTAL EXPOSURE
                            </Typography>
                            <Typography variant="h4" fontWeight={700}>
                              ₦{" "}
                              {formatExposureM(
                                activeItem.matrix
                                  .flat()
                                  .reduce(
                                    (sum: number, c: MatrixCell) =>
                                      sum + (c.exposure || 0),
                                    0,
                                  ),
                              )}
                            </Typography>
                            <Button
                              variant="outlined"
                              size="small"
                              sx={{ mt: 2 }}
                              fullWidth
                              startIcon={<Eye size={16} />}
                              onClick={() => setShowFullDetails(true)}
                            >
                              View Full Details
                            </Button>
                          </Paper>
                          <Paper
                            variant="outlined"
                            sx={{ p: 0, overflow: "hidden" }}
                          >
                            <Box sx={{ p: 2, bgcolor: "action.selected" }}>
                              <Typography variant="subtitle2">
                                Top Hazard Contributors (High Risk Areas)
                              </Typography>
                            </Box>
                            <Table size="small">
                              <TableBody>
                                {topHazardContributors.length > 0 ? (
                                  topHazardContributors.map((item, i) => (
                                    <TableRow key={i}>
                                      <TableCell>{item.name}</TableCell>
                                      <TableCell
                                        align="right"
                                        sx={{ fontWeight: "bold" }}
                                      >
                                        {item.percent.toFixed(1)}%
                                        <Typography
                                          variant="caption"
                                          display="block"
                                          color="text.secondary"
                                        >
                                          ₦ {formatExposureM(item.value)}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={2} align="center">
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        No high risk contributors found
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </Paper>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>
            </Box>
          )}

          <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, mt: 3 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <Zap size={20} color={DELOITTE_COLORS.primary.DEFAULT} />
              Physical Impact Shocks — Portfolio-Wide
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Percentage impact on portfolio asset values due to physical
              climate hazards under NGFS scenarios. These shocks can be exported
              to the Scenario Analysis module for stress testing.
            </Typography>
            <TableContainer>
              <Table
                size="medium"
                sx={{ "& th, & td": { textAlign: "center", fontWeight: 600 } }}
              >
                <TableHead>
                  <TableRow sx={{ bgcolor: alpha("#000", 0.04) }}>
                    <TableCell
                      sx={{ fontWeight: 700, textAlign: "left !important" }}
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
                            bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.04),
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
                          ["Short Term", "Medium Term", "Long Term"] as const
                        ).map((horizon) => {
                          const val =
                            physicalShockMatrix[horizon]?.[scenario] ?? 0;
                          return (
                            <TableCell key={horizon}>
                              <Chip
                                label={`${val}%`}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  fontSize: 13,
                                  bgcolor:
                                    val <= -10
                                      ? alpha("#EF4444", 0.12)
                                      : val <= -5
                                        ? alpha("#F59E0B", 0.12)
                                        : val < 0
                                          ? alpha("#3B82F6", 0.12)
                                          : alpha("#10B981", 0.08),
                                  color:
                                    val <= -10
                                      ? "#EF4444"
                                      : val <= -5
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
              Physical shocks represent the estimated percentage decline in
              asset values due to climate hazards. Use "Push to Scenario
              Analysis" to apply these parameters in stress testing.
            </Alert>
          </Paper>

          <Dialog
            open={showFullDetails}
            onClose={() => setShowFullDetails(false)}
            maxWidth="xl"
            fullWidth
          >
            <DialogTitle
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                {activeItem?.riskLabel} - Assessment Details (
                {activeItem?.methodLabel})
              </Box>
              <Button
                startIcon={<Download size={18} />}
                variant="outlined"
                size="small"
                onClick={handleExport}
              >
                Export to Excel
              </Button>
            </DialogTitle>
            <DialogContent dividers>
              <TableContainer sx={{ maxHeight: "70vh" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset Type</TableCell>
                      <TableCell>
                        {industryConfig.id === "telecommunications"
                          ? "Asset Name / ID"
                          : "Borrower / ID"}
                      </TableCell>
                      <TableCell>Key ({activeItem?.method})</TableCell>
                      <TableCell>
                        {industryConfig.segmentation.segmentLabel}
                      </TableCell>
                      <TableCell align="right">
                        {industryConfig.craLabels.exposureLabel}
                      </TableCell>
                      <TableCell align="center">Impact</TableCell>
                      <TableCell align="center">Impact Score</TableCell>
                      <TableCell align="center">Likelihood</TableCell>
                      <TableCell align="center">Likelihood Score</TableCell>
                      <TableCell align="center">Risk Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeItem?.allAssets?.map(
                      (asset: ScoredAsset, i: number) => (
                        <TableRow key={i} hover>
                          <TableCell>{asset.assetType || "N/A"}</TableCell>
                          <TableCell>
                            <Stack>
                              <Typography variant="body2" fontWeight={500}>
                                {getAssetName(asset)}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {asset.facilityId || asset.id}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>{asset.key}</TableCell>
                          <TableCell>{asset.sector || "N/A"}</TableCell>
                          <TableCell align="right">
                            {getAssetExposure(asset).toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell align="center">
                            {IMPACT_LEVELS[asset.impactScore - 1]}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={asset.impactScore}
                              size="small"
                              sx={{
                                bgcolor:
                                  asset.impactScore >= 4
                                    ? "#fca5a5"
                                    : undefined,
                                fontWeight: "bold",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {LIKELIHOOD_LEVELS[asset.likelihoodScore - 1]}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={asset.likelihoodScore}
                              size="small"
                              sx={{ fontWeight: "bold" }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <b>{asset.riskScore}</b>
                          </TableCell>
                        </TableRow>
                      ),
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowFullDetails(false)}>Close</Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={!!drillDownCell}
            onClose={() => setDrillDownCell(null)}
            maxWidth="lg"
            fullWidth
          >
            <DialogTitle>
              Details:{" "}
              {drillDownCell &&
                `${MAPPING_METHODS.find((m) => m.value === drillDownCell.method)?.label} Analysis`}
              {drillDownCell && (
                <Typography variant="body2" color="text.secondary">
                  Risk Assessment for{" "}
                  {
                    allRiskTypes.find((r) => r.id === drillDownCell.riskId)
                      ?.label
                  }
                </Typography>
              )}
            </DialogTitle>
            <DialogContent dividers>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Asset Type</TableCell>
                      <TableCell>Asset ID</TableCell>
                      <TableCell>
                        {industryConfig.id === "telecommunications"
                          ? "Asset Name"
                          : "Borrower"}
                      </TableCell>
                      <TableCell>Key ({drillDownCell?.method})</TableCell>
                      <TableCell align="right">
                        {industryConfig.craLabels.exposureLabel} (₦)
                      </TableCell>
                      <TableCell align="center">Impact</TableCell>
                      <TableCell align="center">Likelihood</TableCell>
                      <TableCell align="center">Risk Score</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {drillDownCell?.assets.map(
                      (asset: ScoredAsset, i: number) => (
                        <TableRow key={i}>
                          <TableCell>{asset.assetType || "N/A"}</TableCell>
                          <TableCell>{asset.facilityId || asset.id}</TableCell>
                          <TableCell>{getAssetName(asset)}</TableCell>
                          <TableCell>
                            {drillDownCell.method === "location"
                              ? (asset.location as string) || asset.region
                              : drillDownCell.method === "region"
                                ? asset.region
                                : asset.sector}
                          </TableCell>
                          <TableCell align="right">
                            {getAssetExposure(asset).toLocaleString()}
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={asset.impactScore}
                              size="small"
                              color={
                                asset.impactScore >= 4 ? "error" : "default"
                              }
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip label={asset.likelihoodScore} size="small" />
                          </TableCell>
                          <TableCell align="center">
                            <b>{asset.riskScore}</b>
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
            prevPath="/cra/segmentation"
            prevLabel="Back: Portfolio Segmentation"
            nextPath="/cra/transition-risk"
            nextLabel="Next: Transition Risk Assessment"
          />
        </Box>
      </CRALayout>
    );
  }
  return null;
}
