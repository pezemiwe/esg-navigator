import React, { useState } from "react";
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
} from "recharts";
import { useTheme } from "@mui/material/styles";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { RotateCcw, Download, Share2, ArrowLeft } from "lucide-react";
import { useScenarioStore, type ScenarioType } from "@/store/scenarioStore";
import { useToast } from "@/features/e-learnings/components/ui/ToastContext";
import {
  ECLHeatmap,
  SectorBreakdownChart,
  VaRDistributionChart,
  WaterfallChart,
  TornadoChart,
  NigeriaRiskMap,
} from "./charts";
import {
  formatScenarioCurrencyFull,
  formatPercent,
  downloadJSON,
} from "../utils";
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
  const { activeScenario, results } = useScenarioStore();
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
  const currentResults = results.find(
    (r) =>
      r.scenario === selectedTab &&
      r.horizon === (activeScenario?.horizon || "medium"),
  );
  if (!activeScenario) return <Box>No scenario active.</Box>;
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
      parameter: "Sector Beta (Oil & Gas)",
      lowCase: stressedECL * 0.85,
      hiCase: stressedECL * 1.15,
      lowValue: "-50%",
      hiValue: "+50%",
    },
  ];
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
          <Button variant="outlined" startIcon={<Download size={16} />}>
            Export PDF
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
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              ΔECL (INCREASE)
            </Typography>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ color: DELOITTE_COLORS.error, my: 1 }}
            >
              {formatScenarioCurrencyFull(currentResults.eclResults.deltaECL)}
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
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
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
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
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
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
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
      </Grid>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Capital Adequacy & Resilience
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Projected impact on Central Bank of Nigeria regulatory capital ratios
          (CET1, Net Own Funds) under stress.
        </Typography>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Est. Pre-Stress CET1 Ratio
                  </Typography>
                  <Typography variant="h4" fontWeight={700} color="text.primary">
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
                      {(14.5 - currentResults.capitalImpactPercent).toFixed(2)}%
                    </Typography>
                    <Typography variant="caption" color="error">
                      -{currentResults.capitalImpactPercent.toFixed(2)}% Erosion
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
                        cet1: 14.5 - currentResults.capitalImpactPercent * 0.4,
                      },
                      {
                        year: "Year 2",
                        cet1: 14.5 - currentResults.capitalImpactPercent * 0.8,
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
      <Box sx={{ mb: 4 }}>
        <ECLHeatmap />
      </Box>
      <Box sx={{ mb: 4 }}>
        <SectorBreakdownChart sectorBreakdown={sectorBreakdownData} />
      </Box>
      <Box sx={{ mb: 4 }}>
        <NigeriaRiskMap />
      </Box>
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
      <Box sx={{ mb: 4 }}>
        <TornadoChart baseCase={stressedECL} sensitivities={sensitivities} />
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
