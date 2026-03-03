import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  Tabs,
  Tab,
  alpha,
  Grid,
  Container,
  Divider,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Area,
  AreaChart,
  Cell,
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  RotateCcw,
  Download,
  Share2,
  ArrowLeft,
  GitCompareArrows,
} from "lucide-react";
import { useScenarioStore, type ScenarioType } from "@/store/scenarioStore";
import { useToast } from "@/features/e-learnings/components/ui/ToastContext";
import {
  ECLHeatmap,
  SectorBreakdownChart,
  VaRDistributionChart,
  WaterfallChart,
  TelecomWaterfallChart,
  TornadoChart,
  NigeriaRiskMap,
} from "./charts";
import {
  formatScenarioCurrencyFull,
  formatPercent,
  formatDollarM,
  downloadJSON,
} from "../utils";
import { exportScenarioPDF } from "../utils/pdfExport";
import FinancialMetricsPanel from "./FinancialMetricsPanel";
import ScenarioComparison from "./ScenarioComparison";
import MonteCarloSensitivity from "./MonteCarloSensitivity";
import { getSectorById } from "@/features/scenario-analysis/data/sectorConfig";
import { useIndustry } from "@/hooks/useIndustry";
interface ScenarioResultsProps {
  onRestart: () => void;
  onBack: () => void;
}
export default function ScenarioResults({
  onRestart,
  onBack,
}: ScenarioResultsProps) {
  const theme = useTheme();
  const { addToast } = useToast();
  const { activeScenario, results, selectedSectorId } = useScenarioStore();
  const selectedSector = selectedSectorId
    ? getSectorById(selectedSectorId)
    : null;
  const { isNonFinancial } = useIndustry();
  const isTelecom = selectedSectorId === "telecommunications" || isNonFinancial;
  const [comparisonMode, setComparisonMode] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ScenarioType>(
    activeScenario?.type || "orderly",
  );
  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedTab(newValue as ScenarioType);
  };
  const handleExport = () => {
    if (!currentResults) return;
    downloadJSON(
      currentResults,
      `scenario-result-${currentResults.scenario}-${new Date().toISOString()}.json`,
    );
  };
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Shareable link copied to clipboard!", "success");
  };

  const handleExportPDF = async () => {
    if (!resultsRef.current || !currentResults) return;
    setExporting(true);
    try {
      await exportScenarioPDF(resultsRef.current, {
        title: isTelecom
          ? "Telecom Climate Impact — Scenario Analysis"
          : "Banking Climate Stress Test — Scenario Analysis",
        scenario: selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1),
        horizon: activeScenario?.horizon || "medium",
        industry: isTelecom ? "Telecommunications" : "Financial Services",
      });
      addToast("PDF exported successfully!", "success");
    } catch (err) {
      addToast("PDF export failed. Please try again.", "error");
    } finally {
      setExporting(false);
    }
  };

  const currentResults = results.find(
    (r) =>
      r.scenario === selectedTab &&
      r.horizon === (activeScenario?.horizon || "medium"),
  );
  if (!activeScenario) return <Box>No scenario active.</Box>;

  /* ─── Comparison Mode ─── */
  if (comparisonMode) {
    return <ScenarioComparison onBack={() => setComparisonMode(false)} />;
  }

  if (!currentResults) {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 4,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Analysis Results
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Projected impact assessment based on scenario parameters.
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download size={16} />}
              onClick={handleExport}
            >
              Export JSON
            </Button>
            <Button
              variant="outlined"
              startIcon={<Share2 size={16} />}
              onClick={handleShare}
            >
              Share
            </Button>
          </Stack>
        </Box>
        <Paper elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scenario selection tabs"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                minHeight: 48,
              },
            }}
          >
            <Tab label="Orderly Transition" value="orderly" />
            <Tab label="Disorderly Transition" value="disorderly" />
            <Tab label="Hot House World" value="hothouse" />
            <Tab label="Custom Scenario" value="custom" />
          </Tabs>
        </Paper>
        <Box sx={{ p: 1, mb: 3 }} />
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            No data available for {selectedTab.replace(/_/g, " ")}.
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            You haven't run the model for this scenario type yet.
          </Typography>
          <Button variant="contained" onClick={onRestart}>
            Configure parameters for this scenario
          </Button>
        </Paper>
      </Box>
    );
  }
  const sectorBreakdownData = Object.entries(
    currentResults.eclResults.sectorBreakdown,
  ).map(([name, data]) => ({
    sector: name,
    baselineECL: data.baseline,
    stressedECL: data.stressed,
    deltaECL: data.delta,
    percentIncrease: data.baseline > 0 ? (data.delta / data.baseline) * 100 : 0,
  }));
  const baselineECL = currentResults.eclResults.baselineECL;
  const stressedECL = currentResults.eclResults.stressedECL;
  const deltaECL = currentResults.eclResults.deltaECL;
  const pdUplift = deltaECL * 0.55;
  const lgdUplift = deltaECL * 0.3;
  const interactionEffect = deltaECL * 0.15;
  const telecom = currentResults.telecomResults;
  const sensitivities = [
    {
      parameter: "Carbon Price",
      lowCase: stressedECL * 0.7,
      hiCase: stressedECL * 1.3,
      lowValue: "-50%",
      hiValue: "+50%",
    },
    {
      parameter: "Physical Damage Index",
      lowCase: stressedECL * 0.75,
      hiCase: stressedECL * 1.25,
      lowValue: "-50%",
      hiValue: "+50%",
    },
    {
      parameter: "GDP Shock",
      lowCase: stressedECL * 0.8,
      hiCase: stressedECL * 1.2,
      lowValue: "-50%",
      hiValue: "+50%",
    },
    {
      parameter: "Interest Rate Shock",
      lowCase: stressedECL * 0.9,
      hiCase: stressedECL * 1.1,
      lowValue: "-50%",
      hiValue: "+50%",
    },
    {
      parameter: `Sector Beta (${selectedSector?.name || "Selected Sector"})`,
      lowCase: stressedECL * 0.85,
      hiCase: stressedECL * 1.15,
      lowValue: "-50%",
      hiValue: "+50%",
    },
  ];

  /* ─── Telecom-specific sensitivities ─── */
  const telecomSensitivities = telecom
    ? [
        {
          parameter: "Carbon Price",
          lowCase: (telecom.stressedNPV + 500) * 1e6,
          hiCase: (telecom.stressedNPV - 500) * 1e6,
          lowValue: "-30%",
          hiValue: "+30%",
        },
        {
          parameter: "WACC Adjustment",
          lowCase: (telecom.stressedNPV + 800) * 1e6,
          hiCase: (telecom.stressedNPV - 800) * 1e6,
          lowValue: "-2%",
          hiValue: "+2%",
        },
        {
          parameter: "Physical Damage",
          lowCase: (telecom.stressedNPV + 400) * 1e6,
          hiCase: (telecom.stressedNPV - 600) * 1e6,
          lowValue: "-50%",
          hiValue: "+50%",
        },
        {
          parameter: "Revenue Growth",
          lowCase: (telecom.stressedNPV - 300) * 1e6,
          hiCase: (telecom.stressedNPV + 700) * 1e6,
          lowValue: "-1%",
          hiValue: "+1%",
        },
        {
          parameter: "Energy Cost Shock",
          lowCase: (telecom.stressedNPV + 200) * 1e6,
          hiCase: (telecom.stressedNPV - 350) * 1e6,
          lowValue: "-25%",
          hiValue: "+25%",
        },
      ]
    : sensitivities;
  return (
    <Box ref={resultsRef}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Analysis Results
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Projected impact assessment based on scenario parameters.
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Tooltip title="Compare all scenario types side-by-side">
            <Button
              variant="outlined"
              startIcon={<GitCompareArrows size={16} />}
              onClick={() => setComparisonMode(true)}
              sx={{
                borderColor:
                  results.length >= 2 ? DELOITTE_COLORS.primary.lit : undefined,
                color:
                  results.length >= 2 ? DELOITTE_COLORS.primary.lit : undefined,
              }}
            >
              Compare
            </Button>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Download size={16} />}
            onClick={handleExportPDF}
            disabled={exporting}
          >
            {exporting ? "Exporting…" : "Export PDF"}
          </Button>
          <Button variant="outlined" startIcon={<Share2 size={16} />}>
            Share
          </Button>
        </Stack>
      </Box>
      <Paper elevation={0} sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scenario selection tabs"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              minHeight: 48,
            },
          }}
        >
          <Tab label="Orderly Transition" value="orderly" />
          <Tab label="Disorderly Transition" value="disorderly" />
          <Tab label="Hot House World" value="hothouse" />
          <Tab label="Custom Scenario" value="custom" />
        </Tabs>
      </Paper>
      <Box sx={{ p: 1, mb: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Displaying results for:{" "}
          <strong>{selectedTab.replace(/_/g, " ").toUpperCase()}</strong>
        </Typography>
      </Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {isTelecom && telecom ? (
          <>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  borderLeft: `4px solid ${DELOITTE_COLORS.error}`,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? alpha(DELOITTE_COLORS.error, 0.1)
                      : "#FFF5F5",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  NPV IMPACT (ΔNPV)
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ color: DELOITTE_COLORS.error, my: 1 }}
                >
                  {formatDollarM(Math.abs(telecom.deltaNPV))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {telecom.deltaNPVPercent.toFixed(1)}% decline from baseline
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper sx={{ p: 3, borderLeft: `4px solid #F59E0B` }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  FCF EROSION
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ color: "#F59E0B", my: 1 }}
                >
                  {telecom.fcfErosionPercent.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  FCF: {formatDollarM(telecom.baselineFCF)} →{" "}
                  {formatDollarM(telecom.stressedFCF)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  borderLeft: `4px solid ${DELOITTE_COLORS.green.DEFAULT}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  EBITDA IMPACT
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ color: DELOITTE_COLORS.error, my: 1 }}
                >
                  {telecom.ebitdaImpactPercent.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDollarM(telecom.baselineEBITDA)} →{" "}
                  {formatDollarM(telecom.stressedEBITDA)}
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  borderLeft: `4px solid ${DELOITTE_COLORS.slate.DEFAULT}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  ASSET IMPAIRMENT
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ color: DELOITTE_COLORS.slate.DEFAULT, my: 1 }}
                >
                  {telecom.assetImpairmentPercent.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDollarM(telecom.assetImpairment)} of total assets at
                  risk
                </Typography>
              </Paper>
            </Grid>
          </>
        ) : (
          <>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  borderLeft: `4px solid ${DELOITTE_COLORS.error}`,
                  bgcolor:
                    theme.palette.mode === "dark"
                      ? alpha(DELOITTE_COLORS.error, 0.1)
                      : "#FFF5F5",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  ΔECL (INCREASE)
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ color: DELOITTE_COLORS.error, my: 1 }}
                >
                  {formatScenarioCurrencyFull(
                    currentResults.eclResults.deltaECL,
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  +
                  {(
                    (currentResults.eclResults.deltaECL /
                      currentResults.eclResults.baselineECL) *
                    100
                  ).toFixed(1)}
                  % increase from baseline
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  borderLeft: `4px solid ${DELOITTE_COLORS.green.DEFAULT}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  VALUE AT RISK (99.9%)
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ color: DELOITTE_COLORS.green.DEFAULT, my: 1 }}
                >
                  {formatScenarioCurrencyFull(
                    currentResults.varResult?.var99_9 || 0,
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Capital buffer requirement
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  borderLeft: `4px solid ${DELOITTE_COLORS.slate.DEFAULT}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  IMPLIED TEMPERATURE
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ color: DELOITTE_COLORS.slate.DEFAULT, my: 1 }}
                >
                  {currentResults.impliedTemperatureRise.toFixed(1)}°C
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Portfolio warming trajectory
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Paper
                sx={{
                  p: 3,
                  borderLeft: `4px solid ${DELOITTE_COLORS.slate.DEFAULT}`,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                >
                  CAPITAL IMPACT
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ color: DELOITTE_COLORS.slate.DEFAULT, my: 1 }}
                >
                  -{formatPercent(currentResults.capitalImpactPercent / 100)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  CAR erosion from climate risk
                </Typography>
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
      {isTelecom && telecom ? (
        /* ─── TELECOM: NPV & FCF Projection ─── */
        <>
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              NPV & Free Cash Flow Projection
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Projected impact on Net Present Value and Free Cash Flow under
              climate stress, using WACC-adjusted DCF methodology (Baseline
              WACC: {(telecom.wacc * 100).toFixed(2)}% → Adjusted:{" "}
              {(telecom.adjustedWACC * 100).toFixed(2)}%).
            </Typography>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Baseline NPV
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color="text.primary"
                      >
                        {formatDollarM(telecom.baselineNPV)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Stressed NPV
                      </Typography>
                      <Stack direction="row" alignItems="baseline" spacing={1}>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          color={DELOITTE_COLORS.error}
                        >
                          {formatDollarM(telecom.stressedNPV)}
                        </Typography>
                        <Typography variant="caption" color="error">
                          {telecom.deltaNPVPercent.toFixed(1)}% Decline
                        </Typography>
                      </Stack>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total Climate Costs (36-yr)
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" fontWeight={600}>
                          {formatDollarM(telecom.totalClimateCosts)}
                        </Typography>
                        <Chip
                          label={`Transition: ${formatDollarM(telecom.totalTransitionCosts)}`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Physical costs:{" "}
                        {formatDollarM(telecom.totalPhysicalCosts)}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    FCF Trajectory (Baseline vs Stressed)
                  </Typography>
                  <Box sx={{ height: 280, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={telecom.fcfProjection}
                        margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorBaseline"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={DELOITTE_COLORS.green.DEFAULT}
                              stopOpacity={0.18}
                            />
                            <stop
                              offset="95%"
                              stopColor={DELOITTE_COLORS.green.DEFAULT}
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="colorStressed"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={DELOITTE_COLORS.error}
                              stopOpacity={0.15}
                            />
                            <stop
                              offset="95%"
                              stopColor={DELOITTE_COLORS.error}
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke={alpha(theme.palette.text.secondary, 0.1)}
                        />
                        <XAxis
                          dataKey="year"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          fontSize={11}
                          tickFormatter={(v: number) => formatDollarM(v)}
                          tickLine={false}
                          axisLine={false}
                          width={65}
                        />
                        <RechartsTooltip
                          formatter={(v: any) => [
                            formatDollarM(Number(v) || 0),
                          ]}
                          contentStyle={{
                            borderRadius: 8,
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                          }}
                        />
                        <Legend
                          iconType="circle"
                          iconSize={8}
                          wrapperStyle={{ fontSize: 12 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="baseline"
                          name="Baseline FCF"
                          stroke={DELOITTE_COLORS.green.DEFAULT}
                          fill="url(#colorBaseline)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="stressed"
                          name="Stressed FCF"
                          stroke={DELOITTE_COLORS.error}
                          fill="url(#colorStressed)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>

          {/* Climate Cost Breakdown */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Climate Cost Breakdown (Total 36-Year)
            </Typography>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        name: "Carbon Tax",
                        value: telecom.costBreakdown.carbonTax,
                        fill: "#EF4444",
                      },
                      {
                        name: "CCUS Investment",
                        value: telecom.costBreakdown.ccus,
                        fill: "#F59E0B",
                      },
                      {
                        name: "Flaring Penalty",
                        value: telecom.costBreakdown.flaringPenalty,
                        fill: "#8B5CF6",
                      },
                      {
                        name: "Chronic OpEx",
                        value: telecom.costBreakdown.chronicOpEx,
                        fill: "#EC4899",
                      },
                      {
                        name: "Emergency CapEx",
                        value: telecom.costBreakdown.emergencyCapEx,
                        fill: "#06B6D4",
                      },
                      {
                        name: "Defensive CapEx",
                        value: telecom.costBreakdown.defensiveCapEx,
                        fill: "#10B981",
                      },
                    ]
                      .filter((d) => d.value > 0)
                      .sort((a, b) => b.value - a.value)}
                    layout="vertical"
                    margin={{ top: 5, right: 40, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke={alpha(theme.palette.text.secondary, 0.1)}
                    />
                    <XAxis
                      type="number"
                      fontSize={11}
                      tickFormatter={(v: number) => formatDollarM(v)}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      fontSize={11}
                      width={120}
                      tickLine={false}
                      axisLine={false}
                    />
                    <RechartsTooltip
                      formatter={(v: any) => [formatDollarM(Number(v) || 0)]}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                      {[
                        "#EF4444",
                        "#F59E0B",
                        "#8B5CF6",
                        "#EC4899",
                        "#06B6D4",
                        "#10B981",
                      ].map((color, idx) => (
                        <Cell key={idx} fill={color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>

          {/* Infrastructure Impairment Breakdown */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Infrastructure Asset Impairment
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Projected impairment of infrastructure asset categories under
              climate stress.
            </Typography>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Box sx={{ height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={telecom.infraBreakdown}
                    margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      fontSize={10}
                      angle={-35}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      fontSize={12}
                      tickFormatter={(v: number) => formatDollarM(v)}
                    />
                    <RechartsTooltip
                      formatter={(v: any) => [formatDollarM(Number(v) || 0)]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12 }}
                    />
                    <Bar
                      dataKey="baselineValue"
                      name="Baseline Value"
                      fill={DELOITTE_COLORS.green.DEFAULT}
                      barSize={18}
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="stressedValue"
                      name="Stressed Value"
                      fill={DELOITTE_COLORS.error}
                      barSize={18}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>
        </>
      ) : (
        /* ─── BANKING: Capital Adequacy & Resilience ─── */
        <>
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Capital Adequacy & Resilience
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Projected impact on Central Bank of Nigeria regulatory capital
              ratios (CET1, Net Own Funds) under stress.
            </Typography>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Est. Pre-Stress CET1 Ratio
                      </Typography>
                      <Typography
                        variant="h4"
                        fontWeight={700}
                        color="text.primary"
                      >
                        14.50%
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Post-Stress CET1 Ratio
                      </Typography>
                      <Stack direction="row" alignItems="baseline" spacing={1}>
                        <Typography
                          variant="h4"
                          fontWeight={700}
                          color={DELOITTE_COLORS.error}
                        >
                          {(14.5 - currentResults.capitalImpactPercent).toFixed(
                            2,
                          )}
                          %
                        </Typography>
                        <Typography variant="caption" color="error">
                          -{currentResults.capitalImpactPercent.toFixed(2)}%
                          Erosion
                        </Typography>
                      </Stack>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        CBN Regulatory Minimum (CET1)
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" fontWeight={600}>
                          10.00%
                        </Typography>
                        {14.5 - currentResults.capitalImpactPercent < 10 && (
                          <Chip label="BREACH" color="error" size="small" />
                        )}
                        {14.5 - currentResults.capitalImpactPercent >= 10 && (
                          <Chip label="PASS" color="success" size="small" />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Capital Trajectory (Projected)
                  </Typography>
                  <Box sx={{ height: 260, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { year: "Year 0 (Base)", cet1: 14.5 },
                          {
                            year: "Year 1",
                            cet1:
                              14.5 - currentResults.capitalImpactPercent * 0.4,
                          },
                          {
                            year: "Year 2",
                            cet1:
                              14.5 - currentResults.capitalImpactPercent * 0.8,
                          },
                          {
                            year: "Year 3 (Stress)",
                            cet1: 14.5 - currentResults.capitalImpactPercent,
                          },
                        ]}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="year" fontSize={12} />
                        <YAxis domain={[0, 16]} fontSize={12} unit="%" />
                        <RechartsTooltip
                          cursor={{ fill: "transparent" }}
                          formatter={(value: number | string | undefined) => [
                            `${Number(value).toFixed(2)}%`,
                            "CET1 Ratio",
                          ]}
                        />
                        <ReferenceLine
                          y={10}
                          label={{
                            value: "Reg Min (10%)",
                            position: "insideBottomRight",
                            fill: DELOITTE_COLORS.error,
                            fontSize: 12,
                          }}
                          stroke={DELOITTE_COLORS.error}
                          strokeDasharray="3 3"
                        />
                        <Bar
                          dataKey="cet1"
                          fill={DELOITTE_COLORS.primary.lit}
                          barSize={40}
                          radius={[4, 4, 0, 0]}
                        ></Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </>
      )}
      <Box sx={{ mb: 4 }}>
        <ECLHeatmap />
      </Box>
      {selectedSector && currentResults && (
        <Box sx={{ mb: 4 }}>
          <FinancialMetricsPanel
            sector={selectedSector}
            params={{
              carbonPrice: currentResults.carbonPrice,
              gdpShock: currentResults.macroShocks.gdp,
              inflationShock: currentResults.macroShocks.inflation,
              interestRateShock: currentResults.macroShocks.interestRate,
              physicalDamageIndex: currentResults.physicalDamageIndex,
            }}
          />
        </Box>
      )}
      {!isTelecom && (
        <Box sx={{ mb: 4 }}>
          <SectorBreakdownChart
            sectorBreakdown={sectorBreakdownData}
            selectedSectorName={selectedSector?.name}
          />
        </Box>
      )}
      <Box sx={{ mb: 4 }}>
        <NigeriaRiskMap />
      </Box>
      {isTelecom && telecom && (
        <Box sx={{ mb: 4 }}>
          <TelecomWaterfallChart telecom={telecom} />
        </Box>
      )}
      {!isTelecom && (
        <>
          <Box sx={{ mb: 4 }}>
            <WaterfallChart
              baselineECL={baselineECL}
              stressedECL={stressedECL}
              pdUplift={pdUplift}
              lgdUplift={lgdUplift}
              interactionEffect={interactionEffect}
            />
          </Box>
          <Box sx={{ mb: 4 }}>
            <VaRDistributionChart
              varResult={
                currentResults.varResult || {
                  var99_9: currentResults.eclResults.var99_9 || 0,
                  expectedLoss: currentResults.eclResults.deltaECL || 0,
                  unexpectedLoss: 0,
                  confidenceLevel: 0.999,
                }
              }
              monteCarloCATResults={currentResults.monteCarloCATResults}
            />
          </Box>
        </>
      )}
      <Box sx={{ mb: 4 }}>
        <MonteCarloSensitivity />
      </Box>
      <Box sx={{ mb: 4 }}>
        <TornadoChart
          baseCase={
            isTelecom && telecom ? telecom.stressedNPV * 1e6 : stressedECL
          }
          sensitivities={isTelecom ? telecomSensitivities : sensitivities}
        />
      </Box>
      <Box sx={{ height: 100 }} />
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          p: 2,
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          zIndex: 1000,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            spacing={2}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              variant="outlined"
              onClick={onBack}
              startIcon={<ArrowLeft size={18} />}
              sx={{
                borderColor: theme.palette.divider,
                color: "text.secondary",
              }}
            >
              Back to Assumptions
            </Button>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<Download size={16} />}
                onClick={handleExport}
              >
                Export JSON
              </Button>
              <Button
                variant="outlined"
                startIcon={<Share2 size={16} />}
                onClick={handleShare}
              >
                Share Results
              </Button>
              <Button
                variant="contained"
                startIcon={<RotateCcw size={18} />}
                onClick={onRestart}
                sx={{
                  bgcolor: DELOITTE_COLORS.slate.DEFAULT,
                  "&:hover": { bgcolor: DELOITTE_COLORS.slate.dark },
                }}
              >
                New Scenario
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Paper>
    </Box>
  );
}
