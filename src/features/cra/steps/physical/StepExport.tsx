import { useCallback, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Stack,
  Button,
  Grid,
  Alert,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { Download, FileSpreadsheet, CheckCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { getSectorNameById } from "../../domain/physicalRisk/sbraTable";

export default function StepExport() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const {
    config,
    mappedAssets,
    identifiedRisks,
    screening,
    hazardResults,
    results,
  } = usePhysicalRiskStore();

  const cardBg = isDark ? alpha("#0F1623", 0.85) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.1) : alpha("#000", 0.08);
  const [exported, setExported] = useState(false);

  const handleExport = useCallback(() => {
    const wb = XLSX.utils.book_new();

    /* Sheet 1 — Configuration */
    const configRows = [
      ["Company Name", config.companyName],
      ["Country", config.country],
      ["Report Date", config.reportDate],
      ["Assessor", config.assessorName],
      ["Sector", getSectorNameById(config.sectorId)],
      ["Subsector", config.subsector],
      ["Matrix Size", `${config.matrixSize}×${config.matrixSize}`],
      ["Currency", config.currency],
      ["USD Rate", config.usdRate],
      ["Total Assets", mappedAssets.length],
      ["Identified Risks", identifiedRisks.length],
      ["Screened Combos", screening.reduce((s, e) => s + e.risks.length, 0)],
      ["Hazard Results", hazardResults.length],
      ["Enriched Results", results.length],
    ];
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(configRows),
      "Configuration",
    );

    /* Sheet 2 — Asset Register */
    if (mappedAssets.length > 0) {
      const assetHeaders = [
        "Name",
        "Asset Type",
        "Value",
        "Latitude",
        "Longitude",
        "Region",
        "Sector",
      ];
      const assetRows = mappedAssets.map((a) => [
        a.name,
        a.assetType,
        a.value,
        a.latitude,
        a.longitude,
        a.region,
        a.sector,
      ]);
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([assetHeaders, ...assetRows]),
        "Asset Register",
      );
    }

    /* Sheet 3 — Hazard Results */
    if (hazardResults.length > 0) {
      const hHeaders = [
        "Asset",
        "Risk",
        "Latitude",
        "Longitude",
        "Intensity Score",
        "Intensity Label",
        "Frequency Score",
        "Frequency Label",
        "Hazard Rating",
        "Matrix Size",
      ];
      const hRows = hazardResults.map((r) => [
        r.asset,
        r.risk,
        r.latitude,
        r.longitude,
        r.intensityScore,
        r.intensityLabel,
        r.frequencyScore,
        r.frequencyLabel,
        r.hazardRating,
        r.matrixSize,
      ]);
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([hHeaders, ...hRows]),
        "Hazard Results",
      );
    }

    /* Sheet 4 — Full Enriched Results */
    if (results.length > 0) {
      const eHeaders = [
        "Asset",
        "Asset Type",
        "Risk",
        "Hazard Rating",
        "Asset Value (Local)",
        "Asset Value (USD)",
        "Exposure Factor",
        "Exposed Value (Local)",
        "Exposed Value (USD)",
        "Inherent Vulnerability",
        "SBRA RRF",
        "Net Vulnerability",
        "Annual Probability",
        "Risk Score",
        "SSL (Local)",
        "SSL (USD)",
        "EAL (Local)",
        "EAL (USD)",
        "Response Strategy",
        "Priority",
        "Timeframe",
        "Residual Reduction %",
        "Residual Score",
        "Residual Rating",
        "Monitoring KPI",
        "Monitoring Frequency",
      ];
      const eRows = results.map((r) => [
        r.asset,
        r.assetType,
        r.risk,
        r.hazardRating,
        r.assetValueLocal,
        r.assetValueUsd,
        r.exposureFactor,
        r.exposedValueLocal,
        r.exposedValueUsd,
        r.inherentVulnerability,
        r.sbraRrf,
        r.sbraNetVulnerability,
        r.annualProbability,
        r.riskScoreNorm,
        r.sslLocal,
        r.sslUsd,
        r.ealLocal,
        r.ealUsd,
        r.responseStrategy,
        r.responsePriority,
        r.responseTimeframe,
        r.residualReductionPct,
        r.residualRiskScore,
        r.residualRiskRating,
        r.monitoringKpi,
        r.monitoringFrequency,
      ]);
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([eHeaders, ...eRows]),
        "Enriched Results",
      );
    }

    /* Sheet 5 — Risk Summary (pivot by risk) */
    if (results.length > 0) {
      const riskAgg: Record<
        string,
        { count: number; ealTotal: number; sslTotal: number }
      > = {};
      results.forEach((r) => {
        if (!riskAgg[r.risk])
          riskAgg[r.risk] = { count: 0, ealTotal: 0, sslTotal: 0 };
        riskAgg[r.risk].count++;
        riskAgg[r.risk].ealTotal += r.ealLocal;
        riskAgg[r.risk].sslTotal += r.sslLocal;
      });
      const sumHeaders = ["Risk", "Assets Affected", "Total EAL", "Total SSL"];
      const sumRows = Object.entries(riskAgg)
        .sort((a, b) => b[1].ealTotal - a[1].ealTotal)
        .map(([risk, agg]) => [risk, agg.count, agg.ealTotal, agg.sslTotal]);
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([sumHeaders, ...sumRows]),
        "Risk Summary",
      );
    }

    /* Sheet 6 — Response Plan */
    if (results.length > 0) {
      const rpHeaders = [
        "Asset",
        "Risk",
        "Hazard Rating",
        "Strategy",
        "Priority",
        "Timeframe",
        "EAL Before",
        "Reduction %",
        "EAL After",
        "Residual Rating",
      ];
      const rpRows = results.map((r) => [
        r.asset,
        r.risk,
        r.hazardRating,
        r.responseStrategy,
        r.responsePriority,
        r.responseTimeframe,
        r.ealLocal,
        r.residualReductionPct,
        r.ealLocal * (1 - r.residualReductionPct / 100),
        r.residualRiskRating,
      ]);
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([rpHeaders, ...rpRows]),
        "Response Plan",
      );
    }

    /* Sheet 7 — Monitoring Plan */
    if (results.length > 0) {
      const mHeaders = [
        "Asset",
        "Risk",
        "Hazard Rating",
        "KPI",
        "Frequency",
        "Residual Rating",
      ];
      const mRows = results.map((r) => [
        r.asset,
        r.risk,
        r.hazardRating,
        r.monitoringKpi,
        r.monitoringFrequency,
        r.residualRiskRating,
      ]);
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet([mHeaders, ...mRows]),
        "Monitoring Plan",
      );
    }

    const fileName = `Physical_Risk_Assessment_${config.companyName || "Report"}_${config.reportDate}.xlsx`;
    XLSX.writeFile(wb, fileName);
    setExported(true);
  }, [
    config,
    mappedAssets,
    identifiedRisks,
    screening,
    hazardResults,
    results,
  ]);

  const sheets = [
    { name: "Configuration", rows: 14, ready: true },
    {
      name: "Asset Register",
      rows: mappedAssets.length,
      ready: mappedAssets.length > 0,
    },
    {
      name: "Hazard Results",
      rows: hazardResults.length,
      ready: hazardResults.length > 0,
    },
    {
      name: "Enriched Results",
      rows: results.length,
      ready: results.length > 0,
    },
    {
      name: "Risk Summary",
      rows: results.length > 0 ? new Set(results.map((r) => r.risk)).size : 0,
      ready: results.length > 0,
    },
    { name: "Response Plan", rows: results.length, ready: results.length > 0 },
    {
      name: "Monitoring Plan",
      rows: results.length,
      ready: results.length > 0,
    },
  ];

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
            <Download size={24} />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Export Report
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5 }}>
              Download the complete Physical Risk Assessment as a multi-sheet
              Excel workbook containing all configuration, results, risk
              responses, and monitoring plans.
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Report Summary */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Report Contents
        </Typography>
        <Grid container spacing={2}>
          {sheets.map((s) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={s.name}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: s.ready
                    ? alpha(DELOITTE_COLORS.green.DEFAULT, 0.05)
                    : alpha("#888", 0.05),
                  borderColor: s.ready
                    ? alpha(DELOITTE_COLORS.green.DEFAULT, 0.3)
                    : borderColor,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <FileSpreadsheet
                    size={18}
                    color={s.ready ? DELOITTE_COLORS.green.DEFAULT : "#888"}
                  />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {s.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {s.ready ? `${s.rows.toLocaleString()} rows` : "No data"}
                    </Typography>
                  </Box>
                  {s.ready && (
                    <CheckCircle
                      size={14}
                      color={DELOITTE_COLORS.green.DEFAULT}
                      style={{ marginLeft: "auto" }}
                    />
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Configuration summary */}
      <Paper
        sx={{
          p: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Report Metadata
        </Typography>
        <Grid container spacing={2}>
          {[
            ["Company", config.companyName || "—"],
            ["Country", config.country],
            ["Assessor", config.assessorName || "—"],
            ["Sector", getSectorNameById(config.sectorId)],
            ["Date", config.reportDate],
            ["Matrix", `${config.matrixSize}×${config.matrixSize}`],
          ].map(([label, value]) => (
            <Grid size={{ xs: 6, md: 4 }} key={label}>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {value}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Divider />

      {/* Export button */}
      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="contained"
          size="large"
          onClick={handleExport}
          startIcon={<Download size={18} />}
          sx={{
            bgcolor: DELOITTE_COLORS.green.DEFAULT,
            "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
            py: 1.5,
            px: 4,
          }}
        >
          Download Excel Report
        </Button>

        {exported && (
          <Alert severity="success" sx={{ flex: 1 }}>
            Report exported successfully!
          </Alert>
        )}
      </Stack>

      {results.length === 0 && (
        <Alert severity="info">
          For a complete report, run all steps (0-8) before exporting. You can
          still export partial data at any point.
        </Alert>
      )}
    </Stack>
  );
}
