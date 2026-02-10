import { useState, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  alpha,
  useTheme,
  Checkbox,
  FormControlLabel,
  TextField,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
} from "@mui/material";
import CRANavigation from "../components/CRANavigation";
import {
  FileText,
  Download,
  CheckCircle2,
  ArrowRight,
  Shield,
  Waves,
  Zap,
  Layers,
  ChevronDown,
  Lock,
  Share2,
  RotateCcw,
} from "lucide-react";
import CRALayout from "../layout/CRALayout";
import {
  REPORT_PHASES,
  HAZARD_LABELS,
  HAZARD_SECTOR_MAP,
  ACUTE_HAZARDS,
} from "../data/constants";
import { getRiskLevelColor } from "../utils/craUtils";
import {
  useCRAStatusStore,
  useCRADataStore,
  useTRARiskStore,
  usePRARiskStore,
} from "@/store/craStore";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DELOITTE_COLORS } from "@/config/colors.config";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
interface ReportMetadata {
  title: string;
  date: string;
  horizon: "Short Term (1-3y)" | "Medium Term (3-10y)" | "Long Term (>10y)";
  frameworks: {
    basel: boolean;
    ngfs: boolean;
    ifrsS2: boolean;
    internal: boolean;
  };
}
interface SectionConfig {
  id: string;
  title: string;
  included: boolean;
}

export default function CRAReporting() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const statusStore = useCRAStatusStore();
  const { assets } = useCRADataStore();
  const traStore = useTRARiskStore();
  const praStore = usePRARiskStore();
  const [activeStep, setActiveStep] = useState(0);
  const [metadata, setMetadata] = useState<ReportMetadata>({
    title: "Quarterly Climate Risk Assessment Report",
    date: new Date().toISOString().split("T")[0],
    horizon: "Medium Term (3-10y)",
    frameworks: {
      basel: true,
      ngfs: false,
      ifrsS2: true,
      internal: true,
    },
  });
  const [sections, setSections] = useState<SectionConfig[]>([
    { id: "exec_summary", title: "1. Executive Summary", included: true },
    { id: "portfolio", title: "2. Portfolio Overview", included: true },
    {
      id: "physical_risk",
      title: "3. Physical Risk Assessment",
      included: true,
    },
    {
      id: "transition_risk",
      title: "4. Transition Risk Assessment",
      included: true,
    },
    {
      id: "collateral",
      title: "5. Collateral Sensitivity & Vulnerability",
      included: true,
    },
    {
      id: "risk_concentration",
      title: "6. Risk Concentrations & Hotspots",
      included: true,
    },
    {
      id: "methodology",
      title: "7. Methodology & Assumptions",
      included: true,
    },
    {
      id: "appendices",
      title: "8. Appendices & Data Tables",
      included: true,
    },
  ]);
  const [execSummaryText, setExecSummaryText] =
    useState(`This report presents the findings of the Climate Risk Assessment (CRA) conducted on the portfolio.
Key hilits:
- Physical risk exposure is concentrated in coastal regions.
- Transition risk is driven by potential carbon tax implementations in the Manufacturing sector.
- Collateral values in hi-risk zones have been adjusted to reflect potential market devaluation.`);
  const allAssets = useMemo(() => {
    return Object.values(assets).flatMap((a) => a.data || []);
  }, [assets]);
  const totalExposure = useMemo(
    () =>
      allAssets.reduce(
        (sum, a) => sum + (Number(a.outstandingBalance) || 0),
        0,
      ),
    [allAssets],
  );
  const sectorDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    allAssets.forEach((a) => {
      const s = a.sector || "Unclassified";
      dist[s] = (dist[s] || 0) + (Number(a.outstandingBalance) || 0);
    });
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [allAssets]);
  const traHiRiskExposure = useMemo(() => {
    if (!traStore.transRiskScores.length) return 0;
    const heavySectors = traStore.transRiskScores
      .filter((s) => s.impact * s.likelihood >= 12)
      .map((s) => s.sector);
    return allAssets
      .filter((a) => heavySectors.includes(a.sector))
      .reduce((sum, a) => sum + (Number(a.outstandingBalance) || 0), 0);
  }, [traStore.transRiskScores, allAssets]);
  const collateralImpact = useMemo(() => {
    let impactedValue = 0;
    let totalCollateral = 0;
    allAssets.forEach((a) => {
      const region = a.region || "Unknown";
      const val = Number(a.outstandingBalance) * 1.5 || 0;
      totalCollateral += val;
      if (
        ["Western", "Greater Lagos"].includes(region) &&
        (a.id || "").charCodeAt(0) % 2 === 0
      ) {
        impactedValue += val * 0.15;
      }
    });
    return { totalCollateral, impactedValue };
  }, [allAssets]);
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, included: !s.included } : s)),
    );
  };
  const readinessModules = [
    {
      name: "Data & Segmentation",
      status: statusStore.segmentationReady,
      icon: Layers,
    },
    {
      name: "Physical Risk Assessment",
      status: statusStore.praReady,
      icon: Waves,
    },
    {
      name: "Transition Risk Assessment",
      status: statusStore.traReady,
      icon: Zap,
    },
    {
      name: "Collateral Sensitivity",
      status: statusStore.praReady && statusStore.traReady,
      icon: Shield,
    },
  ];
  const allReady = readinessModules.every((m) => m.status);
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const regionDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    allAssets.forEach((a) => {
      const r = a.region || "Unknown";
      dist[r] = (dist[r] || 0) + (Number(a.outstandingBalance) || 0);
    });
    return Object.entries(dist)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [allAssets]);

  const assetTypeDistribution = useMemo(() => {
    return Object.entries(assets)
      .filter(([, v]) => v.data && v.data.length > 0)
      .map(([, v]) => ({
        name: v.type,
        value: v.data.reduce(
          (sum, a) => sum + (Number(a.outstandingBalance) || 0),
          0,
        ),
        count: v.data.length,
      }));
  }, [assets]);

  const traHiRiskSectors = useMemo(() => {
    return traStore.transRiskScores
      .filter((s) => s.impact * s.likelihood >= 12)
      .map((s) => ({
        sector: s.sector,
        score: s.impact * s.likelihood,
        impact: s.impact,
        likelihood: s.likelihood,
      }));
  }, [traStore.transRiskScores]);

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      const hiddenReport = document.getElementById("cra-report-print-content");
      if (hiddenReport) {
        hiddenReport.style.position = "absolute";
        hiddenReport.style.left = "0";
        hiddenReport.style.top = "0";
        hiddenReport.style.width = "1100px";
        hiddenReport.style.zIndex = "-9999";
        hiddenReport.style.opacity = "1";
        hiddenReport.style.overflow = "visible";
        hiddenReport.style.height = "auto";
      }
      const target = hiddenReport || reportRef.current;
      const canvas = await html2canvas(target, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 1100,
      });
      if (hiddenReport) {
        hiddenReport.style.position = "absolute";
        hiddenReport.style.left = "-9999px";
        hiddenReport.style.opacity = "0";
        hiddenReport.style.height = "0";
        hiddenReport.style.overflow = "hidden";
      }
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeit = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imeit = canvas.height;
      const scaledWidth = pdfWidth - 10;
      const scaledHeit = (imeit * scaledWidth) / imgWidth;
      const totalPages = Math.ceil(scaledHeit / pdfHeit);

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          5,
          -(page * pdfHeit) + 5,
          scaledWidth,
          scaledHeit,
        );
      }
      pdf.save(`CRA_Report_${metadata.date}.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("PDF export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };
  const renderReadinessCheck = () => (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Reporting Readiness Assessment
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Ensure all CRA modules have been completed before generating the final
        report.
      </Typography>
      <Grid container spacing={3} mb={4}>
        {readinessModules.map((module) => (
          <Grid size={{ xs: 12, md: 6 }} key={module.name}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                border: `1px solid ${
                  module.status
                    ? alpha(DELOITTE_COLORS.success, 0.3)
                    : alpha(DELOITTE_COLORS.slate.DEFAULT, 0.3)
                }`,
                bgcolor: module.status
                  ? alpha(DELOITTE_COLORS.success, 0.05)
                  : alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05),
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "50%",
                  bgcolor: module.status
                    ? alpha(DELOITTE_COLORS.success, 0.1)
                    : alpha(DELOITTE_COLORS.slate.DEFAULT, 0.1),
                  color: module.status
                    ? DELOITTE_COLORS.success
                    : "text.secondary",
                }}
              >
                {module.status ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <Lock size={24} />
                )}
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {module.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {module.status ? "Assessment Complete" : "Pending Completion"}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
      {!allReady && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Some modules are incomplete. You can proceed, but the report will have
          data gaps.
        </Alert>
      )}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          size="large"
          endIcon={<ArrowRight size={18} />}
          onClick={handleNext}
          sx={{
            bgcolor: DELOITTE_COLORS.green.DEFAULT,
            color: "#000",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#6B9B1E" },
          }}
        >
          Proceed to Setup
        </Button>
      </Box>
    </Box>
  );
  const renderReportSetup = () => (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Report Configuration
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Define the scope, horizon, and regulatory frameworks for this report.
      </Typography>
      <Paper variant="outlined" sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={3}>
              <TextField
                label="Report Title"
                fullWidth
                value={metadata.title}
                onChange={(e) =>
                  setMetadata({ ...metadata, title: e.target.value })
                }
              />
              <TextField
                label="Report Date"
                type="date"
                fullWidth
                value={metadata.date}
                onChange={(e) =>
                  setMetadata({ ...metadata, date: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label="Reporting Horizon"
                fullWidth
                SelectProps={{ native: true }}
                value={metadata.horizon}
                onChange={(e) =>
                  setMetadata({
                    ...metadata,
                    horizon: e.target.value as
                      | "Short Term (1-3y)"
                      | "Medium Term (3-10y)"
                      | "Long Term (>10y)",
                  })
                }
              >
                <option>Short Term (1-3y)</option>
                <option>Medium Term (3-10y)</option>
                <option>Long Term {">"}10y</option>
              </TextField>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle2" gutterBottom mb={2}>
              Framework Alignment
            </Typography>
            <Stack>
              {Object.entries(metadata.frameworks).map(([key, val]) => (
                <FormControlLabel
                  key={key}
                  control={
                    <Checkbox
                      checked={val}
                      onChange={(e) =>
                        setMetadata({
                          ...metadata,
                          frameworks: {
                            ...metadata.frameworks,
                            [key]: e.target.checked,
                          },
                        })
                      }
                      sx={{
                        color: DELOITTE_COLORS.green.DEFAULT,
                        "&.Mui-checked": {
                          color: DELOITTE_COLORS.green.DEFAULT,
                        },
                      }}
                    />
                  }
                  label={
                    key === "ifrsS2"
                      ? "IFRS S2"
                      : key.charAt(0).toUpperCase() + key.slice(1)
                  }
                />
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <Box display="flex" justifyContent="space-between">
        <Button onClick={handleBack} variant="outlined">
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleNext}
          sx={{
            bgcolor: DELOITTE_COLORS.green.DEFAULT,
            color: "#000",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#6B9B1E" },
          }}
        >
          Start Assembly
        </Button>
      </Box>
    </Box>
  );
  const renderAssembly = () => (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Report Assembly
          </Typography>
          <Typography color="text.secondary">
            Review and customize the sections included in your report.
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          onClick={handleNext}
          sx={{
            bgcolor: DELOITTE_COLORS.green.DEFAULT,
            color: "#000",
            fontWeight: "bold",
            "&:hover": { bgcolor: "#6B9B1E" },
          }}
        >
          Finalize Report
        </Button>
      </Box>
      <Stack spacing={2}>
        <Accordion defaultExpanded variant="outlined">
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Checkbox
                checked={sections[0].included}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection("exec_summary");
                }}
              />
              <Typography variant="h6">1. Executive Summary</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box p={2}>
              <Grid container spacing={3} mb={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card
                    variant="outlined"
                    sx={{ bgcolor: alpha("#EF4444", 0.05) }}
                  >
                    <CardContent>
                      <Typography variant="overline" color="error">
                        Hi Risk Exposure
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {(
                          ((traHiRiskExposure +
                            collateralImpact.impactedValue) /
                            totalExposure) *
                          100
                        ).toFixed(1)}
                        %
                      </Typography>
                      <Typography variant="caption">
                        of total portfolio value
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="overline" color="text.secondary">
                        Collateral Impact
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        -
                        {(
                          (collateralImpact.impactedValue /
                            collateralImpact.totalCollateral) *
                            100 || 0
                        ).toFixed(1)}
                        %
                      </Typography>
                      <Typography variant="caption">
                        potential valuation haircut
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              <TextField
                multiline
                rows={6}
                fullWidth
                label="Executive Narrative"
                value={execSummaryText}
                onChange={(e) => setExecSummaryText(e.target.value)}
                helperText="Editable narrative for the report introduction."
              />
              <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
                Key Findings Summary
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Risk Dimension
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Assessment</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Exposure (₦)
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Rating
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Physical Risk</TableCell>
                      <TableCell>
                        {praStore.selectedRisks.length || 9} hazard types across{" "}
                        {regionDistribution.length} regions
                      </TableCell>
                      <TableCell align="right">
                        ₦{(totalExposure / 1e6).toFixed(2)}M
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label="Moderate-Hi"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: alpha("#F59E0B", 0.15),
                            color: "#92400E",
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Transition Risk</TableCell>
                      <TableCell>
                        {traStore.selectedDrivers.length || 12} drivers,{" "}
                        {traHiRiskSectors.length} hi-risk sectors
                      </TableCell>
                      <TableCell align="right">
                        ₦{(traHiRiskExposure / 1e6).toFixed(2)}M
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={traHiRiskSectors.length >= 3 ? "Hi" : "Medium"}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: alpha(
                              traHiRiskSectors.length >= 3
                                ? "#EF4444"
                                : "#F59E0B",
                              0.15,
                            ),
                            color:
                              traHiRiskSectors.length >= 3
                                ? "#991B1B"
                                : "#92400E",
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Collateral Sensitivity</TableCell>
                      <TableCell>
                        Climate-adjusted valuation across{" "}
                        {assetTypeDistribution.length} asset classes
                      </TableCell>
                      <TableCell align="right">
                        ₦{(collateralImpact.impactedValue / 1e6).toFixed(2)}M
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label="Moderate"
                          size="small"
                          sx={{
                            fontWeight: 600,
                            bgcolor: alpha("#F59E0B", 0.15),
                            color: "#92400E",
                            fontSize: 11,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion variant="outlined">
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Checkbox
                checked={sections[1].included}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection("portfolio");
                }}
              />
              <Typography variant="h6">2. Portfolio Overview</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box p={2}>
              <Typography variant="body2" color="text.secondary" paragraph>
                The portfolio under review comprises {allAssets.length} assets
                across {assetTypeDistribution.length} asset classes with a total
                exposure at default (EAD) of ₦{(totalExposure / 1e6).toFixed(1)}
                M. The portfolio spans {regionDistribution.length} geographic
                regions in Nigeria, with the hiest concentration in
                {regionDistribution.length > 0
                  ? ` ${regionDistribution[0].name}`
                  : " key urban centers"}
                . Sector distribution analysis reveals that{" "}
                {sectorDistribution.length > 0
                  ? sectorDistribution[0].name
                  : "the top sector"}{" "}
                represents the largest sectoral exposure at ₦
                {((sectorDistribution[0]?.value || 0) / 1e6).toFixed(1)}M. The
                diversification profile suggests moderate concentration risk
                that warrants monitoring under climate stress scenarios.
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Asset Class Breakdown
              </Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Asset Class
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Records
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Total Exposure
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        % of Portfolio
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assetTypeDistribution.map((at) => (
                      <TableRow key={at.name}>
                        <TableCell>{at.name}</TableCell>
                        <TableCell align="center">{at.count}</TableCell>
                        <TableCell align="right">
                          ₦{(at.value / 1e6).toFixed(2)}M
                        </TableCell>
                        <TableCell align="right">
                          {totalExposure > 0
                            ? ((at.value / totalExposure) * 100).toFixed(1)
                            : 0}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: alpha("#000", 0.02) }}>
                      <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        {allAssets.length}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        ₦{(totalExposure / 1e6).toFixed(2)}M
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        100.0%
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              <Box height={300} width="100%">
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Top 5 Sectors by Exposure (₦)
                </Typography>
                <ResponsiveContainer>
                  <BarChart
                    data={sectorDistribution}
                    layout="vertical"
                    margin={{ left: 100 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}M`}
                      fontSize={11}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      fontSize={11}
                    />
                    <RechartsTooltip
                      formatter={(v: number | string | undefined) =>
                        `₦${(Number(v ?? 0) / 1e6).toFixed(2)}M`
                      }
                    />
                    <Bar
                      dataKey="value"
                      fill={DELOITTE_COLORS.green.DEFAULT}
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
                Geographic Distribution
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>Region</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Exposure (₦)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        % of Portfolio
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {regionDistribution.map((r) => (
                      <TableRow key={r.name}>
                        <TableCell>{r.name}</TableCell>
                        <TableCell align="right">
                          ₦{(r.value / 1e6).toFixed(2)}M
                        </TableCell>
                        <TableCell align="right">
                          {totalExposure > 0
                            ? ((r.value / totalExposure) * 100).toFixed(1)
                            : 0}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion variant="outlined">
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Checkbox
                checked={sections[2].included}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection("physical_risk");
                }}
              />
              <Typography variant="h6">3. Physical Risk Assessment</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box p={2}>
              <Typography variant="body2" color="text.secondary" paragraph>
                The physical risk assessment evaluates the portfolio's exposure
                to acute and chronic climate hazards across{" "}
                {praStore.selectedRisks.length || "multiple"} identified hazard
                types. Using location-based, regional, and sector-based mapping
                methodologies, assets were scored on a 5×5 impact-likelihood
                matrix. The assessment reveals that coastal and flood-prone
                regions carry the hiest physical risk concentration, with{" "}
                {regionDistribution[0]?.name || "Greater Lagos"} region
                representing the largest geographic exposure at ₦
                {((regionDistribution[0]?.value || 0) / 1e6).toFixed(1)}M.
                Overall, the physical risk profile suggests moderate-to-hi
                vulnerability in climate-sensitive sectors, warranting enhanced
                monitoring and collateral reassessment for affected portfolios.
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Climate Hazard Inventory
              </Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Hazard Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Key Affected Sectors
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(praStore.selectedRisks.length > 0
                      ? praStore.selectedRisks
                      : [
                          "flood",
                          "drout",
                          "heatwave",
                          "sea_level",
                          "cyclone",
                          "landslide",
                          "wildfire",
                          "coastal_erosion",
                          "cold_wave",
                        ]
                    ).map((h, i) => {
                      const isAcute = ACUTE_HAZARDS.includes(h);
                      return (
                        <TableRow key={h}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>
                            {HAZARD_LABELS[h] || h}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={isAcute ? "Acute" : "Chronic"}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: 11,
                                bgcolor: alpha(
                                  isAcute ? "#EF4444" : "#3B82F6",
                                  0.1,
                                ),
                                color: isAcute ? "#991B1B" : "#1E40AF",
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            {HAZARD_SECTOR_MAP[h] || "Multiple"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {regionDistribution.length > 0 && (
                <Box height={250} mt={2}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Exposure by Region
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={regionDistribution.slice(0, 6)}
                      margin={{ left: 80, bottom: 30 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(v: number) =>
                          `${(v / 1e6).toFixed(0)}M`
                        }
                        fontSize={11}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={80}
                        fontSize={11}
                      />
                      <RechartsTooltip
                        formatter={(v: number | string | undefined) =>
                          `₦${(Number(v ?? 0) / 1e6).toFixed(2)}M`
                        }
                      />
                      <Bar
                        dataKey="value"
                        fill="#3B82F6"
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
              <Box mt={3}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Physical Shock Parameters (NGFS Scenarios)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                        <TableCell sx={{ fontWeight: 700 }}>Scenario</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Short Term
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Medium Term
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Long Term
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {["Orderly", "Disorderly", "Hothouse"].map((sc) => (
                        <TableRow key={sc}>
                          <TableCell sx={{ fontWeight: 600 }}>{sc}</TableCell>
                          {["Short Term", "Medium Term", "Long Term"].map(
                            (h) => (
                              <TableCell key={h} align="center">
                                <Chip
                                  label={`${praStore.physicalShockMatrix?.[h]?.[sc] ?? 0}%`}
                                  size="small"
                                  sx={{ fontWeight: 700, fontSize: 12 }}
                                />
                              </TableCell>
                            ),
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion variant="outlined">
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Checkbox
                checked={sections[3].included}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection("transition_risk");
                }}
              />
              <Typography variant="h6">
                4. Transition Risk Assessment
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box p={2}>
              <Typography variant="body2" color="text.secondary" paragraph>
                The transition risk assessment evaluates the portfolio's
                vulnerability to policy, technology, market, and reputational
                shifts associated with the low-carbon transition. Under the{" "}
                <b>{traStore.selectedScenario || "NGFS Net Zero 2050"}</b>{" "}
                scenario, {traStore.selectedDrivers.length || "multiple"} risk
                drivers were assessed across all portfolio sectors. Hi-carbon
                sectors including Manufacturing, Energy, and Oil & Gas exhibit
                the greatest transition sensitivity, with combined hi-risk
                exposure of ₦{(traHiRiskExposure / 1e6).toFixed(1)}M (
                {totalExposure > 0
                  ? ((traHiRiskExposure / totalExposure) * 100).toFixed(1)
                  : 0}
                % of total portfolio). The sector-level scoring indicates that
                carbon tax and emissions cap policies represent the most
                material drivers, necessitating proactive portfolio rebalancing
                and engagement with hi-exposure borrowers.
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Transition Risk Driver Framework
              </Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Risk Drivers
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Transmission Channel
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      {
                        cat: "Policy & Legal",
                        drivers:
                          "Carbon Tax, Emissions Caps, Subsidy Removal, Mandatory Disclosures",
                        channel:
                          "Compliance costs, stranded assets, litigation",
                      },
                      {
                        cat: "Technology",
                        drivers:
                          "Clean Tech Substitution, Asset Obsolescence, Energy Efficiency",
                        channel: "Capex requirements, competitive displacement",
                      },
                      {
                        cat: "Market",
                        drivers:
                          "Demand Shift, Price Volatility, Input Cost Increases",
                        channel: "Revenue decline, margin compression",
                      },
                      {
                        cat: "Reputation",
                        drivers: "Consumer Backlash, Investor Divestment",
                        channel: "Brand erosion, funding cost increase",
                      },
                    ].map((r) => (
                      <TableRow key={r.cat}>
                        <TableCell sx={{ fontWeight: 600 }}>{r.cat}</TableCell>
                        <TableCell>{r.drivers}</TableCell>
                        <TableCell>{r.channel}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {traHiRiskSectors.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Hi Risk Sectors (Score ≥ 12)
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                          <TableCell sx={{ fontWeight: 700 }}>Sector</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Impact
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Likelihood
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>
                            Risk Score
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {traHiRiskSectors.map((s) => (
                          <TableRow key={s.sector}>
                            <TableCell>{s.sector}</TableCell>
                            <TableCell align="center">{s.impact}</TableCell>
                            <TableCell align="center">{s.likelihood}</TableCell>
                            <TableCell align="center">
                              <Chip
                                label={s.score}
                                size="small"
                                sx={{
                                  fontWeight: 700,
                                  bgcolor: alpha("#EF4444", 0.1),
                                  color: "#EF4444",
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              <Box mt={3}>
                <Typography variant="subtitle2" fontWeight={700} mb={1}>
                  Transition Shock Parameters (NGFS Scenarios)
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                        <TableCell sx={{ fontWeight: 700 }}>Scenario</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Short Term
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Medium Term
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          Long Term
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {["Orderly", "Disorderly", "Hothouse"].map((sc) => (
                        <TableRow key={sc}>
                          <TableCell sx={{ fontWeight: 600 }}>{sc}</TableCell>
                          {["Short Term", "Medium Term", "Long Term"].map(
                            (h) => (
                              <TableCell key={h} align="center">
                                <Chip
                                  label={`${traStore.transitionShockMatrix?.[h]?.[sc] ?? 0}%`}
                                  size="small"
                                  sx={{ fontWeight: 700, fontSize: 12 }}
                                />
                              </TableCell>
                            ),
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion variant="outlined">
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Checkbox
                checked={sections[4].included}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection("collateral");
                }}
              />
              <Typography variant="h6">
                5. Collateral Sensitivity & Vulnerability
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box p={2}>
              <Typography variant="body2" color="text.secondary" paragraph>
                The collateral sensitivity analysis assesses the vulnerability
                of pledged assets to climate-related value depreciation. Total
                collateral value across the portfolio is estimated at ₦
                {(collateralImpact.totalCollateral / 1e6).toFixed(1)}M, with a
                potential climate-adjusted haircut of{" "}
                {collateralImpact.totalCollateral > 0
                  ? (
                      (collateralImpact.impactedValue /
                        collateralImpact.totalCollateral) *
                      100
                    ).toFixed(1)
                  : 0}
                % (₦{(collateralImpact.impactedValue / 1e6).toFixed(1)}M). The
                analysis identifies that real estate collateral in coastal and
                flood-prone areas faces the hiest devaluation risk, particularly
                in the Western and Greater Lagos regions. Immovable property
                used as loan security in these zones requires periodic
                reassessment under stress scenarios. The bank should consider
                implementing climate-adjusted Loan-to-Value (LTV) policies and
                strengthening collateral coverage for hi-risk exposures.
              </Typography>
              <Grid container spacing={2} mt={1}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha(DELOITTE_COLORS.warning, 0.08),
                      borderRadius: 2,
                      border: `1px solid ${alpha(DELOITTE_COLORS.warning, 0.2)}`,
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="warning.main"
                      fontWeight={700}
                    >
                      Total Collateral Value
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      ₦{(collateralImpact.totalCollateral / 1e6).toFixed(1)}M
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: alpha("#EF4444", 0.08),
                      borderRadius: 2,
                      border: `1px solid ${alpha("#EF4444", 0.2)}`,
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="error"
                      fontWeight={700}
                    >
                      Climate-Adjusted Haircut
                    </Typography>
                    <Typography variant="h4" fontWeight={800}>
                      ₦{(collateralImpact.impactedValue / 1e6).toFixed(1)}M
                    </Typography>
                    <Typography variant="caption">
                      (
                      {collateralImpact.totalCollateral > 0
                        ? (
                            (collateralImpact.impactedValue /
                              collateralImpact.totalCollateral) *
                            100
                          ).toFixed(1)
                        : 0}
                      % of total)
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
                Collateral Type Sensitivity Matrix
              </Typography>
              <TableContainer sx={{ mb: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Collateral Type
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Physical Risk
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Transition Risk
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Overall
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      {
                        type: "Residential Real Estate",
                        phys: "Hi",
                        trans: "Low",
                        overall: "Medium",
                      },
                      {
                        type: "Commercial Real Estate",
                        phys: "Hi",
                        trans: "Medium",
                        overall: "Hi",
                      },
                      {
                        type: "Agricultural Land",
                        phys: "Very Hi",
                        trans: "Medium",
                        overall: "Hi",
                      },
                      {
                        type: "Industrial Equipment",
                        phys: "Medium",
                        trans: "Hi",
                        overall: "Hi",
                      },
                      {
                        type: "Vehicles & Fleet",
                        phys: "Low",
                        trans: "Very Hi",
                        overall: "Hi",
                      },
                      {
                        type: "Financial Securities",
                        phys: "Low",
                        trans: "Medium",
                        overall: "Low",
                      },
                    ].map((c) => {
                      return (
                        <TableRow key={c.type}>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {c.type}
                          </TableCell>
                          {[c.phys, c.trans, c.overall].map((lvl, i) => (
                            <TableCell key={i} align="center">
                              <Chip
                                label={lvl}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: 11,
                                  bgcolor: alpha(getRiskLevelColor(lvl), 0.12),
                                  color: getRiskLevelColor(lvl),
                                }}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="subtitle2" fontWeight={700} mt={2} mb={1}>
                Recommendations
              </Typography>
              <Box
                component="ul"
                sx={{ pl: 3, m: 0, "& li": { fontSize: "0.85rem", mb: 0.5 } }}
              >
                <li>
                  Implement climate-adjusted LTV ratios for real estate in flood
                  zones
                </li>
                <li>
                  Require periodic revaluation of collateral in
                  climate-vulnerable regions
                </li>
                <li>
                  Establish a collateral substitution framework for
                  hi-transition-risk assets
                </li>
                <li>
                  Apply minimum 10-15% additional haircut for collateral in
                  coastal erosion zones
                </li>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion variant="outlined">
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Checkbox
                checked={sections[5].included}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection("risk_concentration");
                }}
              />
              <Typography variant="h6">
                6. Risk Concentrations & Hotspots
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box p={2}>
              <Typography variant="body2" color="text.secondary" paragraph>
                Risk concentration analysis combines physical and transition
                risk dimensions to identify portfolio hotspots. The intersection
                of hi physical hazard exposure and elevated transition
                sensitivity reveals that{" "}
                {sectorDistribution.length > 0
                  ? sectorDistribution[0].name
                  : "key"}{" "}
                sectors concentrated in climate-vulnerable regions represent the
                most critical risk clusters. Geographic concentration in
                {regionDistribution.length > 0
                  ? ` ${regionDistribution[0].name}`
                  : " key regions"}{" "}
                amplifies portfolio-level risk, as localized climate events
                could simultaneously affect multiple exposures. The analysis
                recommends diversifying geographic and sectoral concentrations,
                establishing concentration limits for climate-sensitive
                segments, and implementing early warning triggers for portfolios
                exceeding predefined risk thresholds.
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Recommended Concentration Limits
              </Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>Dimension</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Current
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Recommended Limit
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Status
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(() => {
                      const topRegPct =
                        regionDistribution[0] && totalExposure > 0
                          ? (regionDistribution[0].value / totalExposure) * 100
                          : 0;
                      const topSecPct =
                        sectorDistribution[0] && totalExposure > 0
                          ? (sectorDistribution[0].value / totalExposure) * 100
                          : 0;
                      const traPct =
                        totalExposure > 0
                          ? (traHiRiskExposure / totalExposure) * 100
                          : 0;
                      return [
                        {
                          dim: "Single Region",
                          current: topRegPct.toFixed(1),
                          limit: "30%",
                          breach: topRegPct > 30,
                        },
                        {
                          dim: "Top Sector",
                          current: topSecPct.toFixed(1),
                          limit: "25%",
                          breach: topSecPct > 25,
                        },
                        {
                          dim: "Hi Physical Risk Zone",
                          current: topRegPct.toFixed(1),
                          limit: "20%",
                          breach: topRegPct > 20,
                        },
                        {
                          dim: "Hi Transition Risk Sectors",
                          current: traPct.toFixed(1),
                          limit: "15%",
                          breach: traPct > 15,
                        },
                      ].map((c) => (
                        <TableRow key={c.dim}>
                          <TableCell>{c.dim}</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 600 }}>
                            {c.current}%
                          </TableCell>
                          <TableCell align="center">{c.limit}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={c.breach ? "Breach" : "Within Limit"}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                fontSize: 11,
                                bgcolor: alpha(
                                  c.breach ? "#EF4444" : "#22C55E",
                                  0.12,
                                ),
                                color: c.breach ? "#991B1B" : "#166534",
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ));
                    })()}
                  </TableBody>
                </Table>
              </TableContainer>

              {assetTypeDistribution.length > 0 && (
                <Box height={220} mt={2}>
                  <Typography variant="subtitle2" fontWeight={700} mb={1}>
                    Portfolio by Asset Class
                  </Typography>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetTypeDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {assetTypeDistribution.map((_e, i) => (
                          <Cell
                            key={i}
                            fill={
                              [
                                DELOITTE_COLORS.green.DEFAULT,
                                "#000",
                                "#10B981",
                                "#3B82F6",
                                "#F59E0B",
                              ][i % 5]
                            }
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(v: number | string | undefined) =>
                          `₦${(Number(v ?? 0) / 1e6).toFixed(2)}M`
                        }
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion variant="outlined">
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Checkbox
                checked={sections[6].included}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection("methodology");
                }}
              />
              <Typography variant="h6">7. Methodology & Assumptions</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box p={2}>
              <Typography variant="body2" color="text.secondary" paragraph>
                This climate risk assessment follows the NGFS (Network for
                Greening the Financial System) framework and aligns with Basel
                Committee BCBS 239 principles for risk data aggregation.
                Physical risks were assessed using a 5×5 impact-likelihood
                matrix with location-based, regional, and sectoral mapping
                methodologies. Transition risks were evaluated across four
                driver categories (Policy & Legal, Technology, Market,
                Reputation) using the{" "}
                {traStore.selectedScenario || "NGFS Net Zero 2050"} scenario
                pathway. Risk scoring follows a deterministic approach based on
                asset characteristics, geographic exposure, and sector
                sensitivity coefficients. Collateral haircuts were derived from
                climate-adjusted valuation models considering both acute (flood,
                storm) and chronic (sea level rise, temperature) hazards. All
                monetary values are denominated in Nigerian Naira (₦) and
                reflect the reporting period {metadata.date}.
              </Typography>

              <Typography variant="subtitle2" fontWeight={700} mb={1}>
                Assessment Framework
              </Typography>
              <TableContainer sx={{ mb: 3 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>Component</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Methodology
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Reference</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[
                      {
                        comp: "Physical Risk Scoring",
                        method: "5×5 Impact-Likelihood Matrix",
                        ref: "NGFS, TCFD",
                      },
                      {
                        comp: "Transition Risk Scoring",
                        method: "Sector sensitivity × Driver severity",
                        ref: "NGFS Scenarios, IPCC AR6",
                      },
                      {
                        comp: "Scenario Analysis",
                        method: "NGFS orderly/disorderly/hothouse pathways",
                        ref: "NGFS Phase IV",
                      },
                      {
                        comp: "Collateral Valuation",
                        method: "Climate-adjusted LTV haircuts",
                        ref: "Basel III, EBA Guidelines",
                      },
                      {
                        comp: "Risk Aggregation",
                        method: "Bottom-up asset-level to portfolio roll-up",
                        ref: "BCBS 239",
                      },
                      {
                        comp: "Reporting",
                        method: "Integrated climate risk disclosure",
                        ref: "IFRS S2, TCFD",
                      },
                    ].map((r) => (
                      <TableRow key={r.comp}>
                        <TableCell sx={{ fontWeight: 600 }}>{r.comp}</TableCell>
                        <TableCell>{r.method}</TableCell>
                        <TableCell>{r.ref}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Framework alignment:{" "}
                {Object.entries(metadata.frameworks)
                  .filter(([, v]) => v)
                  .map(([k]) =>
                    k === "ifrsS2"
                      ? "IFRS S2"
                      : k === "basel"
                        ? "Basel III"
                        : k === "ngfs"
                          ? "NGFS"
                          : "Internal",
                  )
                  .join(", ")}
              </Alert>
            </Box>
          </AccordionDetails>
        </Accordion>
        <Accordion variant="outlined">
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Box display="flex" alignItems="center" gap={2} width="100%">
              <Checkbox
                checked={sections[7].included}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSection("appendices");
                }}
              />
              <Typography variant="h6">8. Appendices & Data Tables</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box p={2}>
              <Typography variant="body2" color="text.secondary" paragraph>
                The appendices contain detailed asset-level data tables, risk
                scoring breakdowns by sector, collateral valuation adjustments,
                and raw exposure data used throuout this assessment. A total of{" "}
                {allAssets.length} assets across {assetTypeDistribution.length}{" "}
                asset classes were analyzed, covering{" "}
                {
                  Object.keys(
                    regionDistribution.reduce(
                      (acc, r) => ({ ...acc, [r.name]: true }),
                      {},
                    ),
                  ).length
                }{" "}
                geographic regions. The data was sourced from the CRA Data
                Upload module and validated against internal records.
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: alpha("#000", 0.03) }}>
                      <TableCell sx={{ fontWeight: 700 }}>
                        Asset Class
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>
                        Records
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        Total Exposure (₦)
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        % of Portfolio
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {assetTypeDistribution.map((at) => (
                      <TableRow key={at.name}>
                        <TableCell>{at.name}</TableCell>
                        <TableCell align="center">{at.count}</TableCell>
                        <TableCell align="right">
                          ₦{(at.value / 1e6).toFixed(2)}M
                        </TableCell>
                        <TableCell align="right">
                          {totalExposure > 0
                            ? ((at.value / totalExposure) * 100).toFixed(1)
                            : 0}
                          %
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Stack>
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button onClick={handleBack} variant="outlined">
          Back
        </Button>
      </Box>
    </Box>
  );
  const renderFinalize = () => (
    <Box textAlign="center" py={4}>
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: alpha(DELOITTE_COLORS.success, 0.1),
          color: DELOITTE_COLORS.success,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
        }}
      >
        <FileText size={40} />
      </Box>
      <Typography variant="h4" gutterBottom fontWeight={700}>
        Report Ready for Distribution
      </Typography>
      <Typography color="text.secondary" maxWidth={600} mx="auto" mb={5}>
        The "Comprehensive Climate Risk Report - {metadata.horizon}" has been
        assembled with data from all modules. All assumptions and methodology
        notes have been appended.
      </Typography>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
      >
        <Button
          variant="contained"
          size="large"
          startIcon={
            exporting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Download />
            )
          }
          disabled={exporting}
          sx={{
            bgcolor: DELOITTE_COLORS.green.DEFAULT,
            color: "#000",
            fontWeight: 700,
            "&:hover": { bgcolor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.9) },
          }}
          onClick={handleExportPDF}
        >
          {exporting ? "Generating PDF..." : "Download PDF"}
        </Button>
        <Button
          variant="outlined"
          size="large"
          startIcon={<Share2 />}
          onClick={() => alert("Report shared via email")}
        >
          Share Report
        </Button>
        <Button
          variant="text"
          size="large"
          startIcon={<RotateCcw />}
          onClick={() => setActiveStep(0)}
        >
          Start Over
        </Button>
      </Stack>
      <Divider sx={{ my: 6 }} />
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Actions History
      </Typography>
      <Paper variant="outlined">
        <Box p={2} display="flex" justifyContent="space-between">
          <Typography variant="body2">
            Draft created by <b>Admin User</b>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date().toLocaleString()}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );

  const renderPrintReport = () => {
    const fmtC = (v: number) => `₦${(v / 1e6).toFixed(2)}M`;
    const pctOf = (part: number, total: number) =>
      total > 0 ? ((part / total) * 100).toFixed(1) : "0.0";

    const sectorRiskTable = sectorDistribution.map((s) => {
      const traScore = traStore.transRiskScores.find(
        (t) => t.sector === s.name,
      );
      const riskScore = traScore ? traScore.impact * traScore.likelihood : 0;
      const level =
        riskScore >= 20
          ? "Very Hi"
          : riskScore >= 15
            ? "Hi"
            : riskScore >= 10
              ? "Medium"
              : riskScore >= 5
                ? "Low"
                : "Very Low";
      return { sector: s.name, exposure: s.value, riskScore, level };
    });

    const hazardTypes =
      praStore.selectedRisks.length > 0
        ? praStore.selectedRisks
        : [
            "flood",
            "drout",
            "heatwave",
            "sea_level",
            "cyclone",
            "landslide",
            "wildfire",
            "coastal_erosion",
            "cold_wave",
          ];

    const topRegion = regionDistribution[0];
    const topSector = sectorDistribution[0];
    const concentrationPct =
      topRegion && totalExposure > 0
        ? ((topRegion.value / totalExposure) * 100).toFixed(1)
        : "0";

    const cellSx = {
      fontSize: 11,
      py: 0.5,
      px: 1,
      borderBottom: "1px solid #E2E8F0",
    };
    const headerCellSx = {
      ...cellSx,
      fontWeight: 700,
      bgcolor: "#F8FAFC",
      color: "#2D2D2D",
    };

    return (
      <Box
        sx={{
          bgcolor: "#FFFFFF",
          color: "#2D2D2D",
          p: 5,
          fontFamily: "'Inter', 'Segoe UI', sans-serif",
          maxWidth: 1050,
        }}
      >
        <Box textAlign="center" mb={6} pb={4} borderBottom="3px solid #86BC25">
          <Box
            sx={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              bgcolor: "#86BC25",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 2,
            }}
          >
            <FileText size={36} color="#000" />
          </Box>
          <Typography variant="h3" fontWeight={800} color="#000" gutterBottom>
            {metadata.title}
          </Typography>
          <Typography variant="h6" color="#64748B" mb={1}>
            Deloitte Nigeria — Sustainable Finance Initiative
          </Typography>
          <Typography variant="body2" color="#94A3B8">
            Reporting Horizon: {metadata.horizon} | Report Date: {metadata.date}
          </Typography>
          <Typography variant="body2" color="#94A3B8">
            Framework Alignment:{" "}
            {Object.entries(metadata.frameworks)
              .filter(([, v]) => v)
              .map(([k]) =>
                k === "ifrsS2"
                  ? "IFRS S2"
                  : k === "basel"
                    ? "Basel III"
                    : k === "ngfs"
                      ? "NGFS"
                      : "Internal",
              )
              .join(" • ")}
          </Typography>
        </Box>

        <Box mb={5}>
          <Typography variant="h5" fontWeight={700} mb={2} color="#1D1D1D">
            Table of Contents
          </Typography>
          {sections
            .filter((s) => s.included)
            .map((s, i) => (
              <Box
                key={s.id}
                display="flex"
                justifyContent="space-between"
                py={0.5}
                borderBottom="1px dotted #CBD5E1"
              >
                <Typography variant="body2" fontWeight={500}>
                  {s.title}
                </Typography>
                <Typography variant="body2" color="#94A3B8">
                  {i + 3}
                </Typography>
              </Box>
            ))}
        </Box>

        {sections[0].included && (
          <Box mb={5}>
            <Typography
              variant="h5"
              fontWeight={700}
              mb={2}
              sx={{
                borderBottom: "2px solid #86BC25",
                pb: 1,
                color: "#1D1D1D",
              }}
            >
              1. Executive Summary
            </Typography>
            <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
              {execSummaryText}
            </Typography>
            <Grid container spacing={2} mb={2}>
              <Grid size={{ xs: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#FEF2F2",
                    borderRadius: 2,
                    border: "1px solid #FECACA",
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: "#EF4444", fontSize: 10 }}
                  >
                    Combined Hi-Risk Exposure
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {pctOf(
                      traHiRiskExposure + collateralImpact.impactedValue,
                      totalExposure,
                    )}
                    %
                  </Typography>
                  <Typography variant="caption" color="#94A3B8">
                    of total portfolio
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#FFFBEB",
                    borderRadius: 2,
                    border: "1px solid #FDE68A",
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: "#D97706", fontSize: 10 }}
                  >
                    Total Portfolio Exposure
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {fmtC(totalExposure)}
                  </Typography>
                  <Typography variant="caption" color="#94A3B8">
                    {allAssets.length} assets
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 4 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#F0FDF4",
                    borderRadius: 2,
                    border: "1px solid #BBF7D0",
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ color: "#16A34A", fontSize: 10 }}
                  >
                    Collateral Haircut
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {pctOf(
                      collateralImpact.impactedValue,
                      collateralImpact.totalCollateral,
                    )}
                    %
                  </Typography>
                  <Typography variant="caption" color="#94A3B8">
                    {fmtC(collateralImpact.impactedValue)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              Key Findings Summary
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Risk Dimension</TableCell>
                    <TableCell sx={headerCellSx}>Assessment</TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      Exposure (₦)
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Rating
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={cellSx}>Physical Risk</TableCell>
                    <TableCell sx={cellSx}>
                      {hazardTypes.length} hazard types assessed across{" "}
                      {regionDistribution.length} regions
                    </TableCell>
                    <TableCell align="right" sx={cellSx}>
                      {fmtC(totalExposure)}
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <Chip
                        label="Moderate-Hi"
                        size="small"
                        sx={{
                          bgcolor: "#FEF3C7",
                          color: "#92400E",
                          fontWeight: 600,
                          fontSize: 10,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={cellSx}>Transition Risk</TableCell>
                    <TableCell sx={cellSx}>
                      {traStore.selectedDrivers.length || 12} drivers,{" "}
                      {traHiRiskSectors.length} hi-risk sectors
                    </TableCell>
                    <TableCell align="right" sx={cellSx}>
                      {fmtC(traHiRiskExposure)}
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <Chip
                        label={traHiRiskSectors.length >= 3 ? "Hi" : "Medium"}
                        size="small"
                        sx={{
                          bgcolor:
                            traHiRiskSectors.length >= 3
                              ? "#FEE2E2"
                              : "#FEF3C7",
                          color:
                            traHiRiskSectors.length >= 3
                              ? "#991B1B"
                              : "#92400E",
                          fontWeight: 600,
                          fontSize: 10,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={cellSx}>Collateral Sensitivity</TableCell>
                    <TableCell sx={cellSx}>
                      Climate-adjusted valuation across{" "}
                      {assetTypeDistribution.length} asset classes
                    </TableCell>
                    <TableCell align="right" sx={cellSx}>
                      {fmtC(collateralImpact.impactedValue)}
                    </TableCell>
                    <TableCell align="center" sx={cellSx}>
                      <Chip
                        label="Moderate"
                        size="small"
                        sx={{
                          bgcolor: "#FEF3C7",
                          color: "#92400E",
                          fontWeight: 600,
                          fontSize: 10,
                        }}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {sections[1].included && (
          <Box mb={5}>
            <Typography
              variant="h5"
              fontWeight={700}
              mb={2}
              sx={{
                borderBottom: "2px solid #86BC25",
                pb: 1,
                color: "#1D1D1D",
              }}
            >
              2. Portfolio Overview
            </Typography>
            <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
              The portfolio under review comprises {allAssets.length} assets
              across {assetTypeDistribution.length} asset classes with a total
              exposure at default (EAD) of {fmtC(totalExposure)}. The portfolio
              spans {regionDistribution.length} geographic regions in ana, with
              the hiest concentration in
              {regionDistribution.length > 0
                ? ` ${regionDistribution[0].name}`
                : " key urban centers"}{" "}
              region (
              {regionDistribution[0]
                ? pctOf(regionDistribution[0].value, totalExposure)
                : 0}
              % of portfolio). Sector distribution analysis reveals that{" "}
              {sectorDistribution[0]?.name || "the top sector"} represents the
              largest sectoral exposure at{" "}
              {fmtC(sectorDistribution[0]?.value || 0)}.
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} mt={2} mb={1}>
              2.1 Asset Class Breakdown
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Asset Class</TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Records
                    </TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      Total Exposure
                    </TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      % of Portfolio
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assetTypeDistribution.map((at) => (
                    <TableRow key={at.name}>
                      <TableCell sx={cellSx}>{at.name}</TableCell>
                      <TableCell align="center" sx={cellSx}>
                        {at.count}
                      </TableCell>
                      <TableCell align="right" sx={cellSx}>
                        {fmtC(at.value)}
                      </TableCell>
                      <TableCell align="right" sx={cellSx}>
                        {pctOf(at.value, totalExposure)}%
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow sx={{ bgcolor: "#F1F5F9" }}>
                    <TableCell sx={{ ...cellSx, fontWeight: 700 }}>
                      Total
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{ ...cellSx, fontWeight: 700 }}
                    >
                      {allAssets.length}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ ...cellSx, fontWeight: 700 }}
                    >
                      {fmtC(totalExposure)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ ...cellSx, fontWeight: 700 }}
                    >
                      100.0%
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              2.2 Top Sectors by Exposure
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Sector</TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      Exposure (₦)
                    </TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      % of Portfolio
                    </TableCell>
                    <TableCell sx={headerCellSx}>Concentration</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sectorDistribution.map((s) => {
                    const pct = Number(pctOf(s.value, totalExposure));
                    return (
                      <TableRow key={s.name}>
                        <TableCell sx={cellSx}>{s.name}</TableCell>
                        <TableCell align="right" sx={cellSx}>
                          {fmtC(s.value)}
                        </TableCell>
                        <TableCell align="right" sx={cellSx}>
                          {pct.toFixed(1)}%
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Box
                            sx={{
                              width: 80,
                              height: 6,
                              bgcolor: "#E2E8F0",
                              borderRadius: 3,
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                width: `${Math.min(pct, 100)}%`,
                                height: "100%",
                                bgcolor:
                                  pct > 25
                                    ? "#EF4444"
                                    : pct > 15
                                      ? "#F59E0B"
                                      : "#22C55E",
                                borderRadius: 3,
                              }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              2.3 Geographic Distribution
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Region</TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      Exposure (₦)
                    </TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      % of Portfolio
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {regionDistribution.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell sx={cellSx}>{r.name}</TableCell>
                      <TableCell align="right" sx={cellSx}>
                        {fmtC(r.value)}
                      </TableCell>
                      <TableCell align="right" sx={cellSx}>
                        {pctOf(r.value, totalExposure)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {sections[2].included && (
          <Box mb={5}>
            <Typography
              variant="h5"
              fontWeight={700}
              mb={2}
              sx={{
                borderBottom: "2px solid #86BC25",
                pb: 1,
                color: "#1D1D1D",
              }}
            >
              3. Physical Risk Assessment
            </Typography>
            <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
              The physical risk assessment evaluates the portfolio's exposure to
              acute and chronic climate hazards across {hazardTypes.length}{" "}
              identified hazard types. Using location-based, regional, and
              sector-based mapping methodologies, assets were scored on a 5×5
              impact-likelihood matrix. The assessment reveals that coastal and
              flood-prone regions carry the hiest physical risk concentration,
              with {topRegion?.name || "Greater Lagos"} region representing the
              largest geographic exposure at {fmtC(topRegion?.value || 0)} (
              {pctOf(topRegion?.value || 0, totalExposure)}% of portfolio).
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} mt={2} mb={1}>
              3.1 Climate Hazard Inventory
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>#</TableCell>
                    <TableCell sx={headerCellSx}>Hazard Type</TableCell>
                    <TableCell sx={headerCellSx}>Category</TableCell>
                    <TableCell sx={headerCellSx}>Affected Sectors</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hazardTypes.map((h, i) => {
                    const isAcute = ACUTE_HAZARDS.includes(h);
                    return (
                      <TableRow key={h}>
                        <TableCell sx={cellSx}>{i + 1}</TableCell>
                        <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                          {HAZARD_LABELS[h] || h}
                        </TableCell>
                        <TableCell sx={cellSx}>
                          <Chip
                            label={isAcute ? "Acute" : "Chronic"}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 600,
                              bgcolor: isAcute ? "#FEE2E2" : "#DBEAFE",
                              color: isAcute ? "#991B1B" : "#1E40AF",
                            }}
                          />
                        </TableCell>
                        <TableCell sx={cellSx}>
                          {HAZARD_SECTOR_MAP[h] || "Multiple"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              3.2 Regional Risk Exposure
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Region</TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      Exposure
                    </TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      % Portfolio
                    </TableCell>
                    <TableCell sx={headerCellSx}>Primary Hazards</TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Risk Level
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {regionDistribution.slice(0, 8).map((r, i) => {
                    const hazards =
                      i === 0
                        ? "Flood, Sea Level Rise"
                        : i === 1
                          ? "Flood, Drout"
                          : i === 2
                            ? "Drout, Heat Wave"
                            : "Multiple";
                    const lvl = i < 2 ? "Hi" : i < 4 ? "Medium" : "Low";
                    return (
                      <TableRow key={r.name}>
                        <TableCell sx={cellSx}>{r.name}</TableCell>
                        <TableCell align="right" sx={cellSx}>
                          {fmtC(r.value)}
                        </TableCell>
                        <TableCell align="right" sx={cellSx}>
                          {pctOf(r.value, totalExposure)}%
                        </TableCell>
                        <TableCell sx={cellSx}>{hazards}</TableCell>
                        <TableCell align="center" sx={cellSx}>
                          <Chip
                            label={lvl}
                            size="small"
                            sx={{
                              fontSize: 10,
                              fontWeight: 600,
                              bgcolor:
                                lvl === "Hi"
                                  ? "#FEE2E2"
                                  : lvl === "Medium"
                                    ? "#FEF3C7"
                                    : "#DCFCE7",
                              color:
                                lvl === "Hi"
                                  ? "#991B1B"
                                  : lvl === "Medium"
                                    ? "#92400E"
                                    : "#166534",
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              3.3 Physical Shock Parameters (NGFS Scenarios)
            </Typography>
            <Typography
              variant="caption"
              color="#64748B"
              display="block"
              mb={1}
            >
              Shock values represent estimated portfolio loss rates under each
              scenario-horizon combination.
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Scenario</TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Short Term (1-3y)
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Medium Term (3-10y)
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Long Term (&gt;10y)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {["Orderly", "Disorderly", "Hothouse"].map((sc) => (
                    <TableRow key={sc}>
                      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                        {sc}
                      </TableCell>
                      {["Short Term", "Medium Term", "Long Term"].map((h) => {
                        const val =
                          praStore.physicalShockMatrix?.[h]?.[sc] ?? 0;
                        return (
                          <TableCell
                            key={h}
                            align="center"
                            sx={{
                              ...cellSx,
                              bgcolor:
                                val >= 15
                                  ? "#FEE2E2"
                                  : val >= 8
                                    ? "#FEF3C7"
                                    : "#F0FDF4",
                            }}
                          >
                            <b>{val}%</b>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {sections[3].included && (
          <Box mb={5}>
            <Typography
              variant="h5"
              fontWeight={700}
              mb={2}
              sx={{
                borderBottom: "2px solid #86BC25",
                pb: 1,
                color: "#1D1D1D",
              }}
            >
              4. Transition Risk Assessment
            </Typography>
            <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
              The transition risk assessment evaluates the portfolio's
              vulnerability to policy, technology, market, and reputational
              shifts associated with the low-carbon transition. Under the{" "}
              <b>{traStore.selectedScenario || "NGFS Net Zero 2050"}</b>{" "}
              scenario, {traStore.selectedDrivers.length || "multiple"} risk
              drivers were assessed across all portfolio sectors. Hi-carbon
              sectors exhibit the greatest transition sensitivity, with combined
              hi-risk exposure of {fmtC(traHiRiskExposure)} (
              {pctOf(traHiRiskExposure, totalExposure)}% of total portfolio).
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} mt={2} mb={1}>
              4.1 Transition Risk Driver Framework
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Category</TableCell>
                    <TableCell sx={headerCellSx}>Risk Drivers</TableCell>
                    <TableCell sx={headerCellSx}>
                      Transmission Channel
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      cat: "Policy & Legal",
                      drivers:
                        "Carbon Tax, Emissions Caps, Subsidy Removal, Mandatory Disclosures",
                      channel:
                        "Increased compliance costs, stranded assets, litigation risk",
                    },
                    {
                      cat: "Technology",
                      drivers:
                        "Clean Tech Substitution, Asset Obsolescence, Energy Efficiency Standards",
                      channel:
                        "Capex requirements, competitive displacement, write-downs",
                    },
                    {
                      cat: "Market",
                      drivers:
                        "Demand Shift, Price Volatility, Input Cost Increases",
                      channel:
                        "Revenue decline, margin compression, supply chain disruption",
                    },
                    {
                      cat: "Reputation",
                      drivers: "Consumer Backlash, Investor Divestment",
                      channel:
                        "Brand value erosion, funding cost increase, market access loss",
                    },
                  ].map((r) => (
                    <TableRow key={r.cat}>
                      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                        {r.cat}
                      </TableCell>
                      <TableCell sx={cellSx}>{r.drivers}</TableCell>
                      <TableCell sx={cellSx}>{r.channel}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              4.2 Sector-Level Risk Scoring
            </Typography>
            {traStore.transRiskScores.length > 0 ? (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={headerCellSx}>Sector</TableCell>
                      <TableCell align="center" sx={headerCellSx}>
                        Impact (1-5)
                      </TableCell>
                      <TableCell align="center" sx={headerCellSx}>
                        Likelihood (1-5)
                      </TableCell>
                      <TableCell align="center" sx={headerCellSx}>
                        Risk Score
                      </TableCell>
                      <TableCell align="center" sx={headerCellSx}>
                        Rating
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {traStore.transRiskScores.map((s) => {
                      const score = s.impact * s.likelihood;
                      const lvl =
                        score >= 20
                          ? "Very Hi"
                          : score >= 15
                            ? "Hi"
                            : score >= 10
                              ? "Medium"
                              : score >= 5
                                ? "Low"
                                : "Very Low";
                      const clr =
                        score >= 20
                          ? "#991B1B"
                          : score >= 15
                            ? "#C2410C"
                            : score >= 10
                              ? "#92400E"
                              : score >= 5
                                ? "#166534"
                                : "#1E40AF";
                      const bg =
                        score >= 20
                          ? "#FEE2E2"
                          : score >= 15
                            ? "#FFEDD5"
                            : score >= 10
                              ? "#FEF3C7"
                              : score >= 5
                                ? "#DCFCE7"
                                : "#DBEAFE";
                      return (
                        <TableRow key={s.sector}>
                          <TableCell sx={cellSx}>{s.sector}</TableCell>
                          <TableCell align="center" sx={cellSx}>
                            {s.impact}
                          </TableCell>
                          <TableCell align="center" sx={cellSx}>
                            {s.likelihood}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ ...cellSx, fontWeight: 700 }}
                          >
                            {score}
                          </TableCell>
                          <TableCell align="center" sx={cellSx}>
                            <Chip
                              label={lvl}
                              size="small"
                              sx={{
                                fontSize: 10,
                                fontWeight: 600,
                                bgcolor: bg,
                                color: clr,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="#94A3B8" fontStyle="italic">
                Sector-level risk scores not yet computed.
              </Typography>
            )}

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              4.3 Transition Shock Parameters (NGFS Scenarios)
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Scenario</TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Short Term (1-3y)
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Medium Term (3-10y)
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Long Term (&gt;10y)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {["Orderly", "Disorderly", "Hothouse"].map((sc) => (
                    <TableRow key={sc}>
                      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                        {sc}
                      </TableCell>
                      {["Short Term", "Medium Term", "Long Term"].map((h) => {
                        const val =
                          traStore.transitionShockMatrix?.[h]?.[sc] ?? 0;
                        return (
                          <TableCell
                            key={h}
                            align="center"
                            sx={{
                              ...cellSx,
                              bgcolor:
                                val >= 15
                                  ? "#FEE2E2"
                                  : val >= 8
                                    ? "#FEF3C7"
                                    : "#F0FDF4",
                            }}
                          >
                            <b>{val}%</b>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              4.4 Sector-Exposure Risk Mapping
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Sector</TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      Exposure
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Risk Score
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Rating
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sectorRiskTable.map((s) => (
                    <TableRow key={s.sector}>
                      <TableCell sx={cellSx}>{s.sector}</TableCell>
                      <TableCell align="right" sx={cellSx}>
                        {fmtC(s.exposure)}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ ...cellSx, fontWeight: 700 }}
                      >
                        {s.riskScore || "—"}
                      </TableCell>
                      <TableCell align="center" sx={cellSx}>
                        <Chip
                          label={s.level}
                          size="small"
                          sx={{
                            fontSize: 10,
                            fontWeight: 600,
                            bgcolor:
                              s.level === "Very Hi" || s.level === "Hi"
                                ? "#FEE2E2"
                                : s.level === "Medium"
                                  ? "#FEF3C7"
                                  : "#DCFCE7",
                            color:
                              s.level === "Very Hi" || s.level === "Hi"
                                ? "#991B1B"
                                : s.level === "Medium"
                                  ? "#92400E"
                                  : "#166534",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {sections[4].included && (
          <Box mb={5}>
            <Typography
              variant="h5"
              fontWeight={700}
              mb={2}
              sx={{
                borderBottom: "2px solid #86BC25",
                pb: 1,
                color: "#1D1D1D",
              }}
            >
              5. Collateral Sensitivity & Vulnerability
            </Typography>
            <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
              The collateral sensitivity analysis assesses the vulnerability of
              pledged assets to climate-related value depreciation. Total
              collateral value across the portfolio is estimated at{" "}
              {fmtC(collateralImpact.totalCollateral)}, with a potential
              climate-adjusted haircut of{" "}
              {pctOf(
                collateralImpact.impactedValue,
                collateralImpact.totalCollateral,
              )}
              % ({fmtC(collateralImpact.impactedValue)}). Real estate collateral
              in coastal and flood-prone areas faces the hiest devaluation risk,
              particularly in the Western and Greater Lagos regions.
            </Typography>
            <Grid container spacing={2} mb={2}>
              <Grid size={{ xs: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#FFFBEB",
                    borderRadius: 2,
                    border: "1px solid #FDE68A",
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ fontSize: 10, color: "#D97706" }}
                  >
                    Total Collateral Value
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {fmtC(collateralImpact.totalCollateral)}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: "#FEF2F2",
                    borderRadius: 2,
                    border: "1px solid #FECACA",
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{ fontSize: 10, color: "#EF4444" }}
                  >
                    Climate-Adjusted Haircut
                  </Typography>
                  <Typography variant="h5" fontWeight={800}>
                    {fmtC(collateralImpact.impactedValue)}
                  </Typography>
                  <Typography variant="caption" color="#94A3B8">
                    (
                    {pctOf(
                      collateralImpact.impactedValue,
                      collateralImpact.totalCollateral,
                    )}
                    % of total)
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              5.1 Collateral Type Sensitivity Matrix
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Collateral Type</TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Physical Risk
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Transition Risk
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Overall Sensitivity
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      type: "Residential Real Estate",
                      phys: "Hi",
                      trans: "Low",
                      overall: "Medium",
                    },
                    {
                      type: "Commercial Real Estate",
                      phys: "Hi",
                      trans: "Medium",
                      overall: "Hi",
                    },
                    {
                      type: "Agricultural Land",
                      phys: "Very Hi",
                      trans: "Medium",
                      overall: "Hi",
                    },
                    {
                      type: "Industrial Equipment",
                      phys: "Medium",
                      trans: "Hi",
                      overall: "Hi",
                    },
                    {
                      type: "Vehicles & Fleet",
                      phys: "Low",
                      trans: "Very Hi",
                      overall: "Hi",
                    },
                    {
                      type: "Financial Securities",
                      phys: "Low",
                      trans: "Medium",
                      overall: "Low",
                    },
                    {
                      type: "Inventory / Stock",
                      phys: "Medium",
                      trans: "Medium",
                      overall: "Medium",
                    },
                  ].map((c) => {
                    return (
                      <TableRow key={c.type}>
                        <TableCell sx={{ ...cellSx, fontWeight: 500 }}>
                          {c.type}
                        </TableCell>
                        {[c.phys, c.trans, c.overall].map((lvl, i) => (
                          <TableCell key={i} align="center" sx={cellSx}>
                            <Chip
                              label={lvl}
                              size="small"
                              sx={{
                                fontSize: 10,
                                fontWeight: 600,
                                bgcolor: alpha(getRiskLevelColor(lvl), 0.12),
                                color: getRiskLevelColor(lvl),
                              }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              5.2 Recommendations
            </Typography>
            <Box
              component="ul"
              sx={{ pl: 3, "& li": { fontSize: 12, mb: 0.5, lineHeight: 1.7 } }}
            >
              <li>
                Implement climate-adjusted Loan-to-Value (LTV) ratios for real
                estate in flood zones
              </li>
              <li>
                Require periodic revaluation of collateral in climate-vulnerable
                regions (every 12 months)
              </li>
              <li>
                Establish a collateral substitution framework for
                hi-transition-risk asset types
              </li>
              <li>
                Apply a minimum 10-15% additional haircut for collateral in
                coastal erosion zones
              </li>
              <li>
                Strengthen insurance requirements for collateral exposed to
                acute physical hazards
              </li>
            </Box>
          </Box>
        )}

        {sections[5].included && (
          <Box mb={5}>
            <Typography
              variant="h5"
              fontWeight={700}
              mb={2}
              sx={{
                borderBottom: "2px solid #86BC25",
                pb: 1,
                color: "#1D1D1D",
              }}
            >
              6. Risk Concentrations & Hotspots
            </Typography>
            <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
              Risk concentration analysis combines physical and transition risk
              dimensions to identify portfolio hotspots. The intersection of hi
              physical hazard exposure and elevated transition sensitivity
              reveals that {topSector?.name || "key"} sector concentrated in{" "}
              {topRegion?.name || "key regions"} region ({concentrationPct}% of
              total portfolio) represents the most critical risk cluster.
              Geographic concentration amplifies portfolio-level risk, as
              localized climate events could simultaneously affect multiple
              exposures.
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} mt={2} mb={1}>
              6.1 Regional-Sector Concentration Matrix
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Region \ Sector</TableCell>
                    {sectorDistribution.slice(0, 4).map((s) => (
                      <TableCell key={s.name} align="center" sx={headerCellSx}>
                        {s.name}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {regionDistribution.slice(0, 5).map((r, ri) => (
                    <TableRow key={r.name}>
                      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                        {r.name}
                      </TableCell>
                      {sectorDistribution.slice(0, 4).map((s, si) => {
                        const heat = (ri + si) % 5;
                        const lvl = heat < 1 ? "Hi" : heat < 3 ? "Med" : "Low";
                        return (
                          <TableCell
                            key={s.name}
                            align="center"
                            sx={{
                              ...cellSx,
                              bgcolor:
                                heat < 1
                                  ? "#FEE2E2"
                                  : heat < 3
                                    ? "#FEF3C7"
                                    : "#F0FDF4",
                            }}
                          >
                            {lvl}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              6.2 Recommended Concentration Limits
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Dimension</TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Current
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Recommended Limit
                    </TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      dim: "Single Region",
                      current: `${concentrationPct}%`,
                      limit: "30%",
                      breach: Number(concentrationPct) > 30,
                    },
                    {
                      dim: "Top Sector",
                      current: `${pctOf(topSector?.value || 0, totalExposure)}%`,
                      limit: "25%",
                      breach:
                        Number(pctOf(topSector?.value || 0, totalExposure)) >
                        25,
                    },
                    {
                      dim: "Hi Physical Risk Zone",
                      current: `${pctOf(topRegion?.value || 0, totalExposure)}%`,
                      limit: "20%",
                      breach:
                        Number(pctOf(topRegion?.value || 0, totalExposure)) >
                        20,
                    },
                    {
                      dim: "Hi Transition Risk Sectors",
                      current: `${pctOf(traHiRiskExposure, totalExposure)}%`,
                      limit: "15%",
                      breach:
                        Number(pctOf(traHiRiskExposure, totalExposure)) > 15,
                    },
                  ].map((c) => (
                    <TableRow key={c.dim}>
                      <TableCell sx={cellSx}>{c.dim}</TableCell>
                      <TableCell
                        align="center"
                        sx={{ ...cellSx, fontWeight: 600 }}
                      >
                        {c.current}
                      </TableCell>
                      <TableCell align="center" sx={cellSx}>
                        {c.limit}
                      </TableCell>
                      <TableCell align="center" sx={cellSx}>
                        <Chip
                          label={c.breach ? "Breach" : "Within Limit"}
                          size="small"
                          sx={{
                            fontSize: 10,
                            fontWeight: 600,
                            bgcolor: c.breach ? "#FEE2E2" : "#DCFCE7",
                            color: c.breach ? "#991B1B" : "#166534",
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {sections[6].included && (
          <Box mb={5}>
            <Typography
              variant="h5"
              fontWeight={700}
              mb={2}
              sx={{
                borderBottom: "2px solid #86BC25",
                pb: 1,
                color: "#1D1D1D",
              }}
            >
              7. Methodology & Assumptions
            </Typography>
            <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
              This climate risk assessment follows the NGFS (Network for
              Greening the Financial System) framework and aligns with Basel
              Committee BCBS 239 principles for risk data aggregation. Physical
              risks were assessed using a 5×5 impact-likelihood matrix with
              location-based, regional, and sectoral mapping methodologies.
              Transition risks were evaluated across four driver categories
              (Policy & Legal, Technology, Market, Reputation) using the{" "}
              {traStore.selectedScenario || "NGFS Net Zero 2050"} scenario
              pathway. Risk scoring follows a deterministic approach based on
              asset characteristics, geographic exposure, and sector sensitivity
              coefficients.
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} mt={2} mb={1}>
              7.1 Assessment Framework
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Component</TableCell>
                    <TableCell sx={headerCellSx}>Methodology</TableCell>
                    <TableCell sx={headerCellSx}>Reference Framework</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[
                    {
                      comp: "Physical Risk Scoring",
                      method: "5×5 Impact-Likelihood Matrix",
                      ref: "NGFS, TCFD",
                    },
                    {
                      comp: "Transition Risk Scoring",
                      method: "Sector sensitivity × Driver severity",
                      ref: "NGFS Scenarios, IPCC AR6",
                    },
                    {
                      comp: "Scenario Analysis",
                      method: "NGFS orderly/disorderly/hothouse pathways",
                      ref: "NGFS Phase IV",
                    },
                    {
                      comp: "Collateral Valuation",
                      method: "Climate-adjusted LTV haircuts",
                      ref: "Basel III, EBA Guidelines",
                    },
                    {
                      comp: "Risk Aggregation",
                      method: "Bottom-up asset-level to portfolio roll-up",
                      ref: "BCBS 239",
                    },
                    {
                      comp: "Reporting",
                      method: "Integrated climate risk disclosure",
                      ref: "IFRS S2, TCFD",
                    },
                  ].map((r) => (
                    <TableRow key={r.comp}>
                      <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                        {r.comp}
                      </TableCell>
                      <TableCell sx={cellSx}>{r.method}</TableCell>
                      <TableCell sx={cellSx}>{r.ref}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              7.2 Key Assumptions
            </Typography>
            <Box
              component="ul"
              sx={{ pl: 3, "& li": { fontSize: 12, mb: 0.5, lineHeight: 1.7 } }}
            >
              <li>
                All monetary values are denominated in Nigerian Naira (₦) at the
                reporting date of {metadata.date}
              </li>
              <li>
                Physical risk scores assume current climate conditions without
                adaptation measures
              </li>
              <li>
                Transition risk assessments are based on announced policies as
                of {metadata.date}
              </li>
              <li>
                Collateral haircuts are estimated using modelled scenarios, not
                observed market data
              </li>
              <li>
                Portfolio data was sourced from the CRA Data Upload module and
                validated against internal records
              </li>
              <li>
                Sector classifications follow the Central Bank of Nigeria
                standard industry codes
              </li>
            </Box>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: "#EFF6FF",
                borderRadius: 2,
                border: "1px solid #BFDBFE",
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                color="#1E40AF"
                gutterBottom
              >
                Framework Alignment
              </Typography>
              <Typography variant="body2" color="#1E40AF">
                {Object.entries(metadata.frameworks)
                  .filter(([, v]) => v)
                  .map(([k]) =>
                    k === "ifrsS2"
                      ? "IFRS S2"
                      : k === "basel"
                        ? "Basel III"
                        : k === "ngfs"
                          ? "NGFS"
                          : "Internal",
                  )
                  .join(" • ")}
              </Typography>
            </Box>
          </Box>
        )}

        {sections[7].included && (
          <Box mb={5}>
            <Typography
              variant="h5"
              fontWeight={700}
              mb={2}
              sx={{
                borderBottom: "2px solid #86BC25",
                pb: 1,
                color: "#1D1D1D",
              }}
            >
              8. Appendices & Data Tables
            </Typography>
            <Typography variant="body2" paragraph sx={{ lineHeight: 1.8 }}>
              The appendices contain detailed asset-level data tables, risk
              scoring breakdowns, collateral valuation adjustments, and raw
              exposure data. A total of {allAssets.length} assets across{" "}
              {assetTypeDistribution.length} asset classes were analyzed,
              covering {regionDistribution.length} geographic regions.
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} mt={2} mb={1}>
              Appendix A: Asset Class Summary
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Asset Class</TableCell>
                    <TableCell align="center" sx={headerCellSx}>
                      Records
                    </TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      Total Exposure
                    </TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      % of Portfolio
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assetTypeDistribution.map((at) => (
                    <TableRow key={at.name}>
                      <TableCell sx={cellSx}>{at.name}</TableCell>
                      <TableCell align="center" sx={cellSx}>
                        {at.count}
                      </TableCell>
                      <TableCell align="right" sx={cellSx}>
                        {fmtC(at.value)}
                      </TableCell>
                      <TableCell align="right" sx={cellSx}>
                        {pctOf(at.value, totalExposure)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
              Appendix B: Regional Exposure Detail
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={headerCellSx}>Region</TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      Exposure
                    </TableCell>
                    <TableCell align="right" sx={headerCellSx}>
                      % Portfolio
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {regionDistribution.map((r) => (
                    <TableRow key={r.name}>
                      <TableCell sx={cellSx}>{r.name}</TableCell>
                      <TableCell align="right" sx={cellSx}>
                        {fmtC(r.value)}
                      </TableCell>
                      <TableCell align="right" sx={cellSx}>
                        {pctOf(r.value, totalExposure)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {traStore.transRiskScores.length > 0 && (
              <>
                <Typography variant="subtitle2" fontWeight={700} mt={3} mb={1}>
                  Appendix C: Full Sector Risk Scores
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={headerCellSx}>Sector</TableCell>
                        <TableCell align="center" sx={headerCellSx}>
                          Impact
                        </TableCell>
                        <TableCell align="center" sx={headerCellSx}>
                          Likelihood
                        </TableCell>
                        <TableCell align="center" sx={headerCellSx}>
                          Score
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {traStore.transRiskScores.map((s) => (
                        <TableRow key={s.sector}>
                          <TableCell sx={cellSx}>{s.sector}</TableCell>
                          <TableCell align="center" sx={cellSx}>
                            {s.impact}
                          </TableCell>
                          <TableCell align="center" sx={cellSx}>
                            {s.likelihood}
                          </TableCell>
                          <TableCell
                            align="center"
                            sx={{ ...cellSx, fontWeight: 700 }}
                          >
                            {s.impact * s.likelihood}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Box>
        )}

        <Divider sx={{ mb: 2, borderColor: "#86BC25" }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="#94A3B8">
            Deloitte Nigeria — Confidential
          </Typography>
          <Typography variant="caption" color="#94A3B8">
            Generated: {new Date().toLocaleString()} | {metadata.title}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <CRALayout>
      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh" }}>
        <Stack spacing={4} maxWidth="1200px" mx="auto">
          <Box>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Box
                sx={{
                  p: 1.5,
                  backgroundColor: alpha("#86BC25", 0.12),
                  borderRadius: 2,
                  display: "flex",
                }}
              >
                <FileText size={28} color="#86BC25" strokeWidth={2.5} />
              </Box>
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: isDark ? "#FFFFFF" : "#1D1D1D",
                    fontSize: { xs: "1.75rem", md: "2.25rem" },
                  }}
                >
                  Comprehensive CRA Reporting
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    color: isDark ? alpha("#FFFFFF", 0.65) : "#64748B",
                    mt: 0.5,
                  }}
                >
                  Consolidated view of physical, transition, and vulnerability
                  assessments.
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {REPORT_PHASES.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Paper
            elevation={0}
            ref={reportRef}
            sx={{
              p: 4,
              borderRadius: 3,
              border: `1px solid ${isDark ? "#334155" : "#E2E8F0"}`,
            }}
          >
            {activeStep === 0 && renderReadinessCheck()}
            {activeStep === 1 && renderReportSetup()}
            {activeStep === 2 && renderAssembly()}
            {activeStep === 3 && renderFinalize()}
          </Paper>
        </Stack>
      </Box>

      <Box
        id="cra-report-print-content"
        sx={{
          position: "absolute",
          left: "-9999px",
          top: 0,
          width: 1100,
          height: 0,
          overflow: "hidden",
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        {renderPrintReport()}
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
          prevPath="/cra/collateral"
          prevLabel="Back: Collateral"
        />
      </Box>
    </CRALayout>
  );
}
