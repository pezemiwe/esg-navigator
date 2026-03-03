import {
  Box,
  Typography,
  Paper,
  Button,
  useTheme,
  alpha,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
} from "@mui/material";
import ScenarioLayout from "./layout/ScenarioLayout";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { Download, Eye, FileText, Filter, Inbox } from "lucide-react";
import {
  useScenarioStore,
  type ScenarioRunResults,
} from "@/store/scenarioStore";
import { downloadJSON } from "./utils";
import { useIndustry } from "@/hooks/useIndustry";

export default function ScenarioReports() {
  const theme = useTheme();
  const { results } = useScenarioStore();
  const { isNonFinancial, industryName } = useIndustry();

  const handleDownloadJSON = (data: ScenarioRunResults) => {
    downloadJSON(
      data,
      `scenario-result-${data.scenario}-${new Date().getTime()}.json`,
    );
  };

  const BANKING_STATIC_REPORTS = [
    {
      id: "RPT-2026-001",
      name: "Q1 2026 Climate Stress Test - Executive Summary",
      type: "PDF",
      date: "Feb 02, 2026",
      scenario: "Orderly Transition (NGFS)",
      generatedBy: "System",
      rawData: null,
    },
    {
      id: "RPT-2026-002",
      name: "Portfolio Vulnerability Heatmap - Detailed Data",
      type: "CSV",
      date: "Feb 02, 2026",
      scenario: "Orderly Transition (NGFS)",
      generatedBy: "System",
      rawData: null,
    },
    {
      id: "RPT-2026-003",
      name: "Disorderly Transition - Credit Loss Projections",
      type: "PDF",
      date: "Jan 28, 2026",
      scenario: "Disorderly",
      generatedBy: "Kwame Mensah",
      rawData: null,
    },
    {
      id: "RPT-2026-004",
      name: "Collateral Valuation Impact Report",
      type: "XLSX",
      date: "Jan 15, 2026",
      scenario: "Hot House World",
      generatedBy: "ESG Dept",
      rawData: null,
    },
    {
      id: "RPT-2025-099",
      name: "2025 Annual ESG Risk Disclosure (Pillar 3)",
      type: "PDF",
      date: "Dec 31, 2025",
      scenario: "Multiple",
      generatedBy: "System",
      rawData: null,
    },
  ];

  const generatedReports = results.map((r, i) => ({
    id: `GEN-${i}-${r.timestamp}`,
    name: `${r.scenario.charAt(0).toUpperCase() + r.scenario.slice(1)} Scenario Analysis (${r.horizon})`,
    type: "JSON",
    date: new Date(r.timestamp).toLocaleDateString(),
    scenario: r.scenario.replace(/_/g, " "),
    generatedBy: "User",
    rawData: r,
  }));

  const allReports = isNonFinancial
    ? generatedReports
    : [...generatedReports, ...BANKING_STATIC_REPORTS];

  return (
    <ScenarioLayout>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ color: DELOITTE_COLORS.slate.dark, mb: 1 }}
          >
            {isNonFinancial
              ? `${industryName} Scenario Reports`
              : "Stress Test Reports"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {isNonFinancial
              ? "Access generated climate scenario reports and raw data downloads."
              : "Access generated reports, regulatory exports, and raw data downloads."}
          </Typography>
        </Box>
        {allReports.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<Filter size={18} />}
            sx={{ color: DELOITTE_COLORS.slate.DEFAULT }}
          >
            Filter Results
          </Button>
        )}
      </Box>

      {allReports.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            borderRadius: "12px",
            border: `1px solid ${theme.palette.divider}`,
            py: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Inbox size={48} color={DELOITTE_COLORS.slate.lit} />
          <Typography variant="h6" fontWeight={600} color="text.secondary">
            No reports generated yet
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 440, textAlign: "center" }}
          >
            Run a climate scenario analysis to generate reports. Completed
            scenario results will appear here for download and review.
          </Typography>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: "12px",
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
        >
          <TableContainer>
            <Table>
              <TableHead
                sx={{ bgcolor: alpha(DELOITTE_COLORS.slate.DEFAULT, 0.05) }}
              >
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Report Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Scenario</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date Created</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Generated By</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allReports.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <FileText
                          size={18}
                          color={DELOITTE_COLORS.slate.DEFAULT}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {row.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.scenario}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={row.type}
                        size="small"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          height: 24,
                          bgcolor:
                            row.type === "PDF"
                              ? alpha(DELOITTE_COLORS.error, 0.1)
                              : row.type === "CSV"
                                ? alpha(DELOITTE_COLORS.success, 0.1)
                                : alpha(DELOITTE_COLORS.info, 0.1),
                          color:
                            row.type === "PDF"
                              ? DELOITTE_COLORS.error
                              : row.type === "CSV"
                                ? DELOITTE_COLORS.success
                                : DELOITTE_COLORS.info,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.date}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {row.generatedBy}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 1,
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{ color: DELOITTE_COLORS.slate.DEFAULT }}
                        >
                          <Eye size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          sx={{ color: DELOITTE_COLORS.green.dark }}
                          onClick={() =>
                            row.type === "JSON" && row.rawData
                              ? handleDownloadJSON(row.rawData)
                              : null
                          }
                        >
                          <Download size={18} />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </ScenarioLayout>
  );
}
