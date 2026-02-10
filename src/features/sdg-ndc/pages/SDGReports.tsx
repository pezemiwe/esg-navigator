import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  alpha,
  useTheme,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from "@mui/material";
import {
  Download,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";

const BRAND_GREEN = DELOITTE_COLORS.green.DEFAULT;

const REPORTS = [
  {
    id: "R001",
    title: "SDG Impact Report — FY 2025",
    type: "Annual",
    framework: "UN SDG",
    status: "Published",
    date: "2025-03-15",
    pages: 48,
  },
  {
    id: "R002",
    title: "NDC Progress Report — Q2 2025",
    type: "Quarterly",
    framework: "UNFCCC",
    status: "Published",
    date: "2025-07-01",
    pages: 22,
  },
  {
    id: "R003",
    title: "TCFD Climate Disclosure — 2025",
    type: "Annual",
    framework: "TCFD",
    status: "In Review",
    date: "2025-08-30",
    pages: 36,
  },
  {
    id: "R004",
    title: "CBN Sustainable Banking Report",
    type: "Annual",
    framework: "CBN",
    status: "Draft",
    date: "2025-09-15",
    pages: 28,
  },
  {
    id: "R005",
    title: "UNEP FI PRB Self-Assessment",
    type: "Annual",
    framework: "UNEP FI",
    status: "In Review",
    date: "2025-10-01",
    pages: 42,
  },
  {
    id: "R006",
    title: "Green Bond Impact Statement",
    type: "Semi-Annual",
    framework: "ICMA GBP",
    status: "Published",
    date: "2025-06-30",
    pages: 18,
  },
];

const FRAMEWORKS = [
  {
    name: "UN SDG Framework",
    desc: "Alignment of banking operations with 17 Sustainable Development Goals",
    coverage: 78,
    requirements: 42,
    met: 33,
    color: "#3B82F6",
  },
  {
    name: "Nigeria NDC (Paris Agreement)",
    desc: "National climate commitments — emission reduction targets & adaptation",
    coverage: 63,
    requirements: 28,
    met: 18,
    color: "#22C55E",
  },
  {
    name: "TCFD Recommendations",
    desc: "Climate-related financial disclosures: Governance, Strategy, Risk Mgmt, Metrics",
    coverage: 72,
    requirements: 11,
    met: 8,
    color: "#F59E0B",
  },
  {
    name: "Central Bank of Nigeria ESG Directive",
    desc: "Mandatory sustainable banking principles for all licensed banks",
    coverage: 91,
    requirements: 15,
    met: 14,
    color: "#10B981",
  },
  {
    name: "UNEP FI PRB",
    desc: "Principles for Responsible Banking — impact analysis & target setting",
    coverage: 68,
    requirements: 6,
    met: 4,
    color: "#8B5CF6",
  },
];

const DISCLOSURE_METRICS = [
  {
    metric: "Total Green Finance Deployed",
    value: "₦ 2.4B",
    period: "FY 2025",
  },
  {
    metric: "Carbon Emissions Avoided",
    value: "12,450 tCO₂e",
    period: "FY 2025",
  },
  { metric: "Renewable Energy Financed", value: "45 MW", period: "Cumulative" },
  { metric: "Women Entrepreneurs Financed", value: "3,200", period: "FY 2025" },
  { metric: "SDGs Actively Aligned", value: "11/17", period: "Current" },
  { metric: "ESG Training Hours", value: "8,400 hrs", period: "FY 2025" },
  { metric: "Green Bond Proceeds Allocated", value: "92%", period: "Current" },
  {
    metric: "Climate Risk Integrated Loans",
    value: "78%",
    period: "Portfolio",
  },
];

export default function SDGReports() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published":
        return "#10B981";
      case "In Review":
        return "#F59E0B";
      case "Draft":
        return "#3B82F6";
      default:
        return "#94A3B8";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Published":
        return <CheckCircle2 size={14} />;
      case "In Review":
        return <Clock size={14} />;
      case "Draft":
        return <AlertTriangle size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Box
        sx={{
          mb: 4,
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
        }}
      >
        <Typography
          variant="overline"
          sx={{ color: BRAND_GREEN, fontWeight: 700, letterSpacing: 1.2 }}
        >
          Regulatory Compliance
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontFamily: "Times New Roman, serif",
            fontWeight: 700,
            color: BRAND_GREEN,
            mt: 1,
          }}
        >
          Reports & Disclosure
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mt: 1, maxWidth: 800 }}
        >
          Sustainability reporting, regulatory filings, and disclosure
          management for Deloitte — aligned with international frameworks and
          Central Bank of Nigeria requirements.
        </Typography>
      </Box>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Framework Compliance Overview
      </Typography>
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {FRAMEWORKS.map((fw) => (
          <Grid key={fw.name} size={{ xs: 12, sm: 6, lg: 2.4 }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
                borderRadius: 2,
                borderTop: `3px solid ${fw.color}`,
                height: "100%",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{ mb: 1, fontSize: "0.8rem" }}
              >
                {fw.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 1.5, fontSize: "0.65rem" }}
              >
                {fw.desc}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={fw.coverage}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: alpha(fw.color, 0.12),
                  "& .MuiLinearProgress-bar": {
                    bgcolor: fw.color,
                    borderRadius: 3,
                  },
                }}
              />
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mt: 1 }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: fw.color, fontWeight: 700 }}
                >
                  {fw.coverage}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {fw.met}/{fw.requirements} met
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
          borderRadius: 2,
          mb: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Report Library
          </Typography>
          <Button
            variant="contained"
            size="small"
            startIcon={<FileText size={14} />}
            sx={{
              bgcolor: BRAND_GREEN,
              textTransform: "none",
              "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
            }}
          >
            Generate New Report
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Report</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Framework</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {REPORTS.map((report) => (
                <TableRow
                  key={report.id}
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(BRAND_GREEN, 0.04),
                    },
                  }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FileText size={14} color={BRAND_GREEN} />
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {report.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.65rem" }}
                        >
                          {report.pages} pages
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={report.framework}
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{report.type}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      icon={getStatusIcon(report.status)}
                      label={report.status}
                      sx={{
                        height: 22,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        bgcolor: alpha(getStatusColor(report.status), 0.12),
                        color: getStatusColor(report.status),
                        "& .MuiChip-icon": {
                          color: getStatusColor(report.status),
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption">{report.date}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      startIcon={<Download size={12} />}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.7rem",
                        color: BRAND_GREEN,
                      }}
                    >
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
          borderRadius: 2,
          borderLeft: `4px solid ${BRAND_GREEN}`,
        }}
      >
        <Typography variant="h6" fontWeight={700} gutterBottom>
          📊 Key Disclosure Metrics
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 2 }}
        >
          Summary metrics for annual sustainability report and regulatory
          filings
        </Typography>
        <Grid container spacing={2}>
          {DISCLOSURE_METRICS.map((m) => (
            <Grid key={m.metric} size={{ xs: 6, sm: 4, md: 3 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: isDark ? alpha("#fff", 0.04) : alpha("#000", 0.02),
                  border: `1px solid ${isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06)}`,
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ color: BRAND_GREEN }}
                >
                  {m.value}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.5, fontSize: "0.65rem" }}
                >
                  {m.metric}
                </Typography>
                <Chip
                  size="small"
                  label={m.period}
                  sx={{
                    mt: 0.5,
                    height: 18,
                    fontSize: "0.55rem",
                    fontWeight: 600,
                    bgcolor: alpha(BRAND_GREEN, 0.1),
                    color: BRAND_GREEN,
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  );
}
