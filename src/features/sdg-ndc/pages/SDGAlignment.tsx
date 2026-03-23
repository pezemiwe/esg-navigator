import {
  Box,
  Typography,
  Paper,
  Grid,
  Stack,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  alpha,
  useTheme,
  Button,
} from "@mui/material";
import { Download, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { DELOITTE_COLORS } from "@/config/colors.config";

const BRAND_GREEN = DELOITTE_COLORS.green.DEFAULT;

const SDG_DETAILS = [
  {
    id: 1,
    name: "No Poverty",
    color: "#E5243B",
    score: 82,
    targets: [
      {
        code: "1.4",
        desc: "Equal rits to economic resources & financial services",
        progress: 85,
        bankAction:
          "Microfinance & SME lending — ₦ 420M to underserved communities",
      },
      {
        code: "1.5",
        desc: "Build resilience of poor to climate shocks",
        progress: 78,
        bankAction: "Climate-resilient agriculture loans in Northern Nigeria",
      },
    ],
  },
  {
    id: 7,
    name: "Affordable & Clean Energy",
    color: "#FCC30B",
    score: 91,
    targets: [
      {
        code: "7.1",
        desc: "Universal access to affordable energy",
        progress: 88,
        bankAction:
          "Solar home system financing — 12,000 households in rural Nigeria",
      },
      {
        code: "7.2",
        desc: "Increase share of renewable energy",
        progress: 92,
        bankAction:
          "₦ 890M renewable energy project finance (solar, mini-hydro)",
      },
      {
        code: "7.a",
        desc: "Enhance international cooperation for clean energy",
        progress: 85,
        bankAction: "IFC Green Bond co-financing partnership",
      },
    ],
  },
  {
    id: 8,
    name: "Decent Work & Economic Growth",
    color: "#A21942",
    score: 85,
    targets: [
      {
        code: "8.3",
        desc: "Promote development-oriented policies for job creation",
        progress: 82,
        bankAction: "Youth Enterprise Fund — 5,200 businesses supported",
      },
      {
        code: "8.10",
        desc: "Strengthen capacity of domestic financial institutions",
        progress: 90,
        bankAction: "Financial inclusion drive — 340,000 new accounts opened",
      },
    ],
  },
  {
    id: 13,
    name: "Climate Action",
    color: "#3F7E44",
    score: 93,
    targets: [
      {
        code: "13.1",
        desc: "Strengthen resilience to climate hazards",
        progress: 95,
        bankAction:
          "Climate risk integrated into all credit decisions via ESG Navigator",
      },
      {
        code: "13.2",
        desc: "Integrate climate measures into national policies",
        progress: 88,
        bankAction:
          "TCFD-aligned disclosures & Central Bank of Nigeria ESG compliance",
      },
      {
        code: "13.3",
        desc: "Improve education & awareness on climate",
        progress: 91,
        bankAction: "Capacity Building Hub — 1,200 staff certified in ESG",
      },
    ],
  },
  {
    id: 5,
    name: "Gender Equality",
    color: "#FF3A21",
    score: 76,
    targets: [
      {
        code: "5.5",
        desc: "Ensure women's participation in economic life",
        progress: 74,
        bankAction: "Women in Business Loan Program — ₦ 180M disbursed",
      },
      {
        code: "5.a",
        desc: "Equal rits to financial resources",
        progress: 78,
        bankAction: "Female entrepreneurship grants & mentorship program",
      },
    ],
  },
  {
    id: 9,
    name: "Industry, Innovation & Infrastructure",
    color: "#FD6925",
    score: 79,
    targets: [
      {
        code: "9.3",
        desc: "Increase access to financial services for SMEs",
        progress: 82,
        bankAction:
          "Digital banking expansion — mobile money integration for 1.2M users",
      },
      {
        code: "9.4",
        desc: "Upgrade infrastructure for sustainability",
        progress: 75,
        bankAction: "Green building finance & sustainable infrastructure loans",
      },
    ],
  },
];

const RADAR_DATA = [
  { subject: "No Poverty", score: 82, fullMark: 100 },
  { subject: "Zero Hunger", score: 71, fullMark: 100 },
  { subject: "Good Health", score: 65, fullMark: 100 },
  { subject: "Education", score: 88, fullMark: 100 },
  { subject: "Gender", score: 76, fullMark: 100 },
  { subject: "Clean Water", score: 58, fullMark: 100 },
  { subject: "Clean Energy", score: 91, fullMark: 100 },
  { subject: "Decent Work", score: 85, fullMark: 100 },
  { subject: "Industry", score: 79, fullMark: 100 },
  { subject: "Inequality", score: 68, fullMark: 100 },
  { subject: "Cities", score: 74, fullMark: 100 },
  { subject: "Consumption", score: 62, fullMark: 100 },
  { subject: "Climate", score: 93, fullMark: 100 },
  { subject: "Oceans", score: 45, fullMark: 100 },
  { subject: "Land", score: 67, fullMark: 100 },
  { subject: "Peace", score: 81, fullMark: 100 },
  { subject: "Partnerships", score: 77, fullMark: 100 },
];

export default function SDGAlignment() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const getStatusIcon = (progress: number) => {
    if (progress >= 80) return <CheckCircle2 size={14} color="#10B981" />;
    if (progress >= 60) return <AlertTriangle size={14} color="#F59E0B" />;
    return <XCircle size={14} color="#EF4444" />;
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
          SDG Mapping
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
          SDG Alignment Detail
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", mt: 1, maxWidth: 800 }}
        >
          Detailed mapping of Deloitte's portfolio, products, and initiatives to
          specific SDG targets — with measurable impact indicators.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              SDG Coverage Radar
            </Typography>
            <Box sx={{ height: 380 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR_DATA} outerRadius="75%">
                  <PolarGrid
                    stroke={alpha(theme.palette.text.secondary, 0.15)}
                  />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{
                      fill: theme.palette.text.secondary,
                      fontSize: 9,
                    }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{
                      fill: theme.palette.text.secondary,
                      fontSize: 9,
                    }}
                  />
                  <Radar
                    name="Deloitte Alignment"
                    dataKey="score"
                    stroke={BRAND_GREEN}
                    fill={alpha(BRAND_GREEN, 0.25)}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Priority SDGs — Deloitte Focus Areas
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 2 }}
            >
              SDGs where Deloitte has the highest alignment and impact potential
            </Typography>
            <Stack spacing={1.5}>
              {SDG_DETAILS.map((sdg) => (
                <Paper
                  key={sdg.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    border: `1px solid ${alpha(sdg.color, 0.3)}`,
                    bgcolor: alpha(sdg.color, isDark ? 0.06 : 0.03),
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 0.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={`SDG ${sdg.id}`}
                        sx={{
                          bgcolor: sdg.color,
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: "0.7rem",
                          height: 22,
                        }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {sdg.name}
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label={`${sdg.score}%`}
                      sx={{
                        bgcolor: alpha(sdg.color, 0.15),
                        color: sdg.color,
                        fontWeight: 800,
                        height: 22,
                      }}
                    />
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={sdg.score}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: alpha(sdg.color, 0.12),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: sdg.color,
                        borderRadius: 3,
                      },
                    }}
                  />
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
          borderRadius: 2,
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
            Target-Level Alignment Matrix
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download size={14} />}
            sx={{
              borderColor: BRAND_GREEN,
              color: BRAND_GREEN,
              textTransform: "none",
              "&:hover": {
                bgcolor: alpha(BRAND_GREEN, 0.08),
                borderColor: BRAND_GREEN,
              },
            }}
          >
            Export Report
          </Button>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>SDG</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Deloitte Action</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Progress
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 700 }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {SDG_DETAILS.flatMap((sdg) =>
                sdg.targets.map((target, tidx) => (
                  <TableRow
                    key={`${sdg.id}-${target.code}`}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(sdg.color, 0.04),
                      },
                    }}
                  >
                    {tidx === 0 && (
                      <TableCell
                        rowSpan={sdg.targets.length}
                        sx={{
                          borderRight: `3px solid ${sdg.color}`,
                          verticalAlign: "top",
                        }}
                      >
                        <Chip
                          size="small"
                          label={`${sdg.id}`}
                          sx={{
                            bgcolor: sdg.color,
                            color: "#fff",
                            fontWeight: 800,
                            minWidth: 28,
                          }}
                        />
                        <Typography
                          variant="caption"
                          display="block"
                          sx={{ mt: 0.5, fontSize: "0.6rem" }}
                        >
                          {sdg.name}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {target.code}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">{target.desc}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ fontSize: "0.7rem" }}>
                        {target.bankAction}
                      </Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ minWidth: 100 }}>
                      <LinearProgress
                        variant="determinate"
                        value={target.progress}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          bgcolor: alpha(sdg.color, 0.12),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: sdg.color,
                            borderRadius: 3,
                          },
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: "0.65rem", fontWeight: 700 }}
                      >
                        {target.progress}%
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getStatusIcon(target.progress)}
                    </TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
