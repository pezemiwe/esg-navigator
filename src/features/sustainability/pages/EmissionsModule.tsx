import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  alpha,
  useTheme,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Flame,
  Zap,
  Building2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import type {
  Scope1Asset,
  Scope2Entry,
  Scope3Entry,
} from "@/store/sustainabilityStore";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
  formatNumber,
  formatNaira,
  DEFAULT_SCOPE1,
  DEFAULT_SCOPE2,
  DEFAULT_SCOPE3,
  EMISSION_FACTORS,
  SECTOR_INTENSITY_FACTORS,
} from "../data/constants";

const BRAND = DELOITTE_COLORS.green.DEFAULT;
const PIE_COLORS = ["#ef4444", "#f59e0b", "#3b82f6"];
const SECTOR_COLORS = [
  "#86BC25",
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
];

export default function EmissionsModule() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const {
    scope1Assets,
    scope2Entries,
    scope3Entries,
    addScope1Asset,
    removeScope1Asset,
    addScope2Entry,
    removeScope2Entry,
    addScope3Entry,
    removeScope3Entry,
  } = useSustainabilityStore();

  const [activeStep, setActiveStep] = useState(0);
  const [s1Open, setS1Open] = useState(false);
  const [s2Open, setS2Open] = useState(false);
  const [s3Open, setS3Open] = useState(false);

  const [newS1, setNewS1] = useState<Partial<Scope1Asset>>({
    name: "",
    branch: "",
    type: "stationary",
    fuelType: "diesel",
    litersPerMonth: 0,
    months: 12,
  });
  const [newS2, setNewS2] = useState<Partial<Scope2Entry>>({
    branch: "",
    kwhPerMonth: 0,
    months: 12,
    source: "grid",
  });
  const [newS3, setNewS3] = useState<Partial<Scope3Entry>>({
    sector: "Oil & Gas",
    loanExposure: 0,
    intensityFactor: SECTOR_INTENSITY_FACTORS["Oil & Gas"],
  });

  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);

  useEffect(() => {
    if (scope1Assets.length === 0)
      DEFAULT_SCOPE1.forEach((a) => addScope1Asset(a));
    if (scope2Entries.length === 0)
      DEFAULT_SCOPE2.forEach((e) => addScope2Entry(e));
    if (scope3Entries.length === 0)
      DEFAULT_SCOPE3.forEach((e) => addScope3Entry(e));
  }, [
    scope1Assets.length,
    scope2Entries.length,
    scope3Entries.length,
    addScope1Asset,
    addScope2Entry,
    addScope3Entry,
  ]);

  const s1Total = useMemo(() => calculateScope1(scope1Assets), [scope1Assets]);
  const s2Total = useMemo(
    () => calculateScope2(scope2Entries),
    [scope2Entries],
  );
  const s3Total = useMemo(
    () => calculateScope3(scope3Entries),
    [scope3Entries],
  );
  const grandTotal = s1Total + s2Total + s3Total;

  const scopePie = [
    { name: "Scope 1 (Direct)", value: s1Total },
    { name: "Scope 2 (Electricity)", value: s2Total },
    { name: "Scope 3 (Financed)", value: s3Total },
  ];

  const s3SectorBar = useMemo(() => {
    return scope3Entries.map((e) => ({
      sector: e.sector,
      emissions: e.loanExposure * e.intensityFactor,
      exposure: e.loanExposure,
    }));
  }, [scope3Entries]);

  const handleAddS1 = () => {
    if (!newS1.name) return;
    addScope1Asset({ ...newS1, id: `s1-${Date.now()}` } as Scope1Asset);
    setNewS1({
      name: "",
      branch: "",
      type: "stationary",
      fuelType: "diesel",
      litersPerMonth: 0,
      months: 12,
    });
    setS1Open(false);
  };

  const handleAddS2 = () => {
    if (!newS2.branch) return;
    addScope2Entry({ ...newS2, id: `s2-${Date.now()}` } as Scope2Entry);
    setNewS2({ branch: "", kwhPerMonth: 0, months: 12, source: "grid" });
    setS2Open(false);
  };

  const handleAddS3 = () => {
    if (!newS3.sector) return;
    addScope3Entry({ ...newS3, id: `s3-${Date.now()}` } as Scope3Entry);
    setNewS3({
      sector: "Oil & Gas",
      loanExposure: 0,
      intensityFactor: SECTOR_INTENSITY_FACTORS["Oil & Gas"],
    });
    setS3Open(false);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1600, mx: "auto" }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="overline"
          sx={{
            color: BRAND,
            fontWeight: 700,
            letterSpacing: "0.15em",
            fontSize: "0.7rem",
          }}
        >
          GHG EMISSIONS
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
          GHG Emissions Calculator
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 0.5, maxWidth: 700 }}
        >
          Calculate Scope 1, 2, and 3 greenhouse gas emissions using IPCC
          emission factors — aligned with GHG Protocol and PCAF
        </Typography>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {[
          {
            label: "Scope 1 — Direct",
            value: `${formatNumber(s1Total)} tCO₂e`,
            icon: Flame,
            color: "#ef4444",
            sub: `${scope1Assets.length} assets tracked`,
          },
          {
            label: "Scope 2 — Electricity",
            value: `${formatNumber(s2Total)} tCO₂e`,
            icon: Zap,
            color: "#f59e0b",
            sub: `${scope2Entries.length} branches`,
          },
          {
            label: "Scope 3 — Financed",
            value: `${formatNumber(s3Total)} tCO₂e`,
            icon: Building2,
            color: "#3b82f6",
            sub: `${scope3Entries.length} sectors`,
          },
          {
            label: "Total Emissions",
            value: `${formatNumber(grandTotal)} tCO₂e`,
            icon: Flame,
            color: BRAND,
            sub: "All scopes combined",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: cardBg,
                  border: `1px solid ${borderColor}`,
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: stat.color,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        color: "text.secondary",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        fontSize: "0.6rem",
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, mt: 0.5, lineHeight: 1.1 }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        mt: 0.5,
                        display: "block",
                      }}
                    >
                      {stat.sub}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: alpha(stat.color, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={20} color={stat.color} />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              height: "100%",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Emissions by Scope
            </Typography>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={scopePie}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name?.split(" ")[0]} ${name?.split(" ")[1]} ${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                    fontSize={9}
                  >
                    {scopePie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number | undefined) =>
                      v !== undefined ? `${formatNumber(v)} tCO₂e` : ""
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              height: "100%",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Financed Emissions by Sector (Scope 3)
            </Typography>
            <Box sx={{ height: 240 }}>
              <ResponsiveContainer>
                <BarChart data={s3SectorBar} margin={{ left: 10 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={alpha("#000", 0.06)}
                  />
                  <XAxis
                    dataKey="sector"
                    fontSize={10}
                    angle={-15}
                    textAnchor="end"
                    height={50}
                  />
                  <YAxis
                    fontSize={10}
                    tickFormatter={(v: number) => formatNumber(v)}
                  />
                  <Tooltip
                    formatter={(v: number | undefined) =>
                      v !== undefined ? `${formatNumber(v)} tCO₂e` : ""
                    }
                  />
                  <Bar dataKey="emissions" radius={[4, 4, 0, 0]} barSize={28}>
                    {s3SectorBar.map((_, i) => (
                      <Cell
                        key={i}
                        fill={SECTOR_COLORS[i % SECTOR_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ━━ Step Indicators ━━ */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          mb: 3,
        }}
      >
        <Stepper activeStep={activeStep} alternativeLabel>
          {[
            {
              label: "Scope 1 — Direct Emissions",
              icon: <Flame size={16} />,
              count: scope1Assets.length,
            },
            {
              label: "Scope 2 — Electricity",
              icon: <Zap size={16} />,
              count: scope2Entries.length,
            },
            {
              label: "Scope 3 — Financed Emissions",
              icon: <Building2 size={16} />,
              count: scope3Entries.length,
            },
            {
              label: "Summary & Report",
              icon: <FileText size={16} />,
              count: 0,
            },
          ].map((step, index) => (
            <Step key={step.label} completed={activeStep > index}>
              <StepLabel
                onClick={() => setActiveStep(index)}
                sx={{ cursor: "pointer" }}
                optional={
                  index < 3 ? (
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {step.count}{" "}
                      {index === 0
                        ? "assets"
                        : index === 1
                          ? "branches"
                          : "sectors"}
                    </Typography>
                  ) : undefined
                }
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  justifyContent="center"
                >
                  {step.icon}
                  <span>{step.label}</span>
                </Stack>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {activeStep === 0 && (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={() => setS1Open(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderColor: alpha("#ef4444", 0.3),
                color: "#ef4444",
              }}
            >
              Add Scope 1 Asset
            </Button>
          </Stack>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${borderColor}`,
              bgcolor: cardBg,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "text.secondary",
                    },
                  }}
                >
                  <TableCell>Asset Name</TableCell>
                  <TableCell>Branch</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Fuel</TableCell>
                  <TableCell align="right">L/Month</TableCell>
                  <TableCell align="right">Months</TableCell>
                  <TableCell align="right">EF (kgCO₂/L)</TableCell>
                  <TableCell align="right">Emissions (tCO₂e)</TableCell>
                  <TableCell sx={{ width: 50 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {scope1Assets.map((a) => {
                  const ef = EMISSION_FACTORS[a.fuelType];
                  const em = (a.litersPerMonth * a.months * ef) / 1000;
                  return (
                    <TableRow key={a.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{a.name}</TableCell>
                      <TableCell>{a.branch}</TableCell>
                      <TableCell>
                        <Chip
                          label={a.type}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.65rem" }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={a.fuelType}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            bgcolor: alpha("#ef4444", 0.06),
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {a.litersPerMonth.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">{a.months}</TableCell>
                      <TableCell align="right">{ef}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, color: "#ef4444" }}
                      >
                        {formatNumber(em)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => removeScope1Asset(a.id)}
                          sx={{
                            color: "#ef4444",
                            opacity: 0.5,
                            "&:hover": { opacity: 1 },
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow
                  sx={{
                    "& td": {
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      borderTop: `2px solid ${borderColor}`,
                    },
                  }}
                >
                  <TableCell colSpan={7}>Total Scope 1 Emissions</TableCell>
                  <TableCell align="right" sx={{ color: "#ef4444" }}>
                    {formatNumber(s1Total)} tCO₂e
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeStep === 1 && (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={() => setS2Open(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderColor: alpha("#f59e0b", 0.3),
                color: "#f59e0b",
              }}
            >
              Add Scope 2 Entry
            </Button>
          </Stack>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${borderColor}`,
              bgcolor: cardBg,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "text.secondary",
                    },
                  }}
                >
                  <TableCell>Branch / Location</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell align="right">kWh/Month</TableCell>
                  <TableCell align="right">Months</TableCell>
                  <TableCell align="right">EF (kgCO₂/kWh)</TableCell>
                  <TableCell align="right">Emissions (tCO₂e)</TableCell>
                  <TableCell sx={{ width: 50 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {scope2Entries.map((e) => {
                  const ef =
                    e.source === "grid"
                      ? EMISSION_FACTORS.nigeriaGrid
                      : e.emissionFactor || 0;
                  const em = (e.kwhPerMonth * e.months * ef) / 1000;
                  return (
                    <TableRow key={e.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{e.branch}</TableCell>
                      <TableCell>
                        <Chip
                          label={e.source}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.65rem",
                            bgcolor: alpha("#f59e0b", 0.06),
                          }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {e.kwhPerMonth.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">{e.months}</TableCell>
                      <TableCell align="right">{ef}</TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, color: "#f59e0b" }}
                      >
                        {formatNumber(em)}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => removeScope2Entry(e.id)}
                          sx={{
                            color: "#f59e0b",
                            opacity: 0.5,
                            "&:hover": { opacity: 1 },
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow
                  sx={{
                    "& td": {
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      borderTop: `2px solid ${borderColor}`,
                    },
                  }}
                >
                  <TableCell colSpan={5}>Total Scope 2 Emissions</TableCell>
                  <TableCell align="right" sx={{ color: "#f59e0b" }}>
                    {formatNumber(s2Total)} tCO₂e
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {activeStep === 2 && (
        <>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Plus size={16} />}
              onClick={() => setS3Open(true)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderColor: alpha("#3b82f6", 0.3),
                color: "#3b82f6",
              }}
            >
              Add Scope 3 Sector
            </Button>
          </Stack>
          <TableContainer
            component={Paper}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${borderColor}`,
              bgcolor: cardBg,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      color: "text.secondary",
                    },
                  }}
                >
                  <TableCell>Sector</TableCell>
                  <TableCell align="right">Loan Exposure (₦)</TableCell>
                  <TableCell align="right">Intensity Factor</TableCell>
                  <TableCell align="right">
                    Financed Emissions (tCO₂e)
                  </TableCell>
                  <TableCell align="right">% of Total</TableCell>
                  <TableCell sx={{ width: 50 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {scope3Entries.map((e) => {
                  const em = e.loanExposure * e.intensityFactor;
                  return (
                    <TableRow key={e.id}>
                      <TableCell sx={{ fontWeight: 600 }}>{e.sector}</TableCell>
                      <TableCell align="right">
                        {formatNaira(e.loanExposure)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                      >
                        {e.intensityFactor.toExponential(2)}
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{ fontWeight: 700, color: "#3b82f6" }}
                      >
                        {formatNumber(em)}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        {s3Total > 0 ? ((em / s3Total) * 100).toFixed(1) : 0}%
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => removeScope3Entry(e.id)}
                          sx={{
                            color: "#3b82f6",
                            opacity: 0.5,
                            "&:hover": { opacity: 1 },
                          }}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow
                  sx={{
                    "& td": {
                      fontWeight: 800,
                      fontSize: "0.85rem",
                      borderTop: `2px solid ${borderColor}`,
                    },
                  }}
                >
                  <TableCell colSpan={3}>
                    Total Scope 3 Financed Emissions
                  </TableCell>
                  <TableCell align="right" sx={{ color: "#3b82f6" }}>
                    {formatNumber(s3Total)} tCO₂e
                  </TableCell>
                  <TableCell align="right">100%</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      {/* ━━ Step 3: Summary & Proceed to Reporting ━━ */}
      {activeStep === 3 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            bgcolor: cardBg,
            border: `1px solid ${borderColor}`,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              bgcolor: alpha(BRAND, 0.08),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              border: `1.5px solid ${alpha(BRAND, 0.15)}`,
            }}
          >
            <CheckCircle2 size={28} color={BRAND} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            GHG Emissions Summary
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", maxWidth: 500, mx: "auto", mb: 4 }}
          >
            All three scopes have been calculated. Review the summary below and
            proceed to generate your sustainability report.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4, maxWidth: 700, mx: "auto" }}>
            {[
              {
                label: "Scope 1 — Direct",
                value: `${formatNumber(s1Total)} tCO₂e`,
                color: "#ef4444",
                pct:
                  grandTotal > 0
                    ? ((s1Total / grandTotal) * 100).toFixed(1)
                    : "0",
              },
              {
                label: "Scope 2 — Electricity",
                value: `${formatNumber(s2Total)} tCO₂e`,
                color: "#f59e0b",
                pct:
                  grandTotal > 0
                    ? ((s2Total / grandTotal) * 100).toFixed(1)
                    : "0",
              },
              {
                label: "Scope 3 — Financed",
                value: `${formatNumber(s3Total)} tCO₂e`,
                color: "#3b82f6",
                pct:
                  grandTotal > 0
                    ? ((s3Total / grandTotal) * 100).toFixed(1)
                    : "0",
              },
              {
                label: "Total Emissions",
                value: `${formatNumber(grandTotal)} tCO₂e`,
                color: BRAND,
                pct: "100",
              },
            ].map((item) => (
              <Grid size={{ xs: 12, sm: 6 }} key={item.label}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 2.5,
                    border: `1px solid ${alpha(item.color, 0.15)}`,
                    bgcolor: alpha(item.color, isDark ? 0.04 : 0.02),
                    textAlign: "left",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      fontSize: "0.6rem",
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: item.color, mt: 0.5 }}
                  >
                    {item.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    {item.pct}% of total
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            size="large"
            startIcon={<FileText size={18} />}
            onClick={() => navigate("/sustainability/report")}
            sx={{
              bgcolor: BRAND,
              color: "#fff",
              fontWeight: 700,
              borderRadius: 2.5,
              px: 5,
              py: 1.5,
              textTransform: "none",
              fontSize: "0.95rem",
              boxShadow: `0 4px 14px ${alpha(BRAND, 0.3)}`,
              "&:hover": {
                bgcolor: BRAND,
                filter: "brightness(0.92)",
                boxShadow: `0 6px 20px ${alpha(BRAND, 0.35)}`,
              },
            }}
          >
            Proceed to Reporting
          </Button>
        </Paper>
      )}

      {/* ━━ Step Navigation ━━ */}
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={16} />}
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => s - 1)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            borderColor: alpha(BRAND, 0.3),
            color: BRAND,
          }}
        >
          Previous Step
        </Button>
        <Button
          variant="contained"
          endIcon={<ArrowRight size={16} />}
          disabled={activeStep === 3}
          onClick={() => setActiveStep((s) => s + 1)}
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            bgcolor: BRAND,
            "&:hover": { bgcolor: BRAND, filter: "brightness(0.92)" },
          }}
        >
          {activeStep === 2 ? "View Summary" : "Next Step"}
        </Button>
      </Stack>

      <Dialog
        open={s1Open}
        onClose={() => setS1Open(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Scope 1 Asset</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Asset Name"
              value={newS1.name}
              onChange={(e) => setNewS1({ ...newS1, name: e.target.value })}
              size="small"
            />
            <TextField
              fullWidth
              label="Branch / Location"
              value={newS1.branch}
              onChange={(e) => setNewS1({ ...newS1, branch: e.target.value })}
              size="small"
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={newS1.type}
                    label="Type"
                    onChange={(e) =>
                      setNewS1({
                        ...newS1,
                        type: e.target.value as "mobile" | "stationary",
                      })
                    }
                  >
                    <MenuItem value="stationary">Stationary</MenuItem>
                    <MenuItem value="mobile">Mobile</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={6}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Fuel Type</InputLabel>
                  <Select
                    value={newS1.fuelType}
                    label="Fuel Type"
                    onChange={(e) =>
                      setNewS1({
                        ...newS1,
                        fuelType: e.target.value as Scope1Asset["fuelType"],
                      })
                    }
                  >
                    <MenuItem value="diesel">Diesel (2.68)</MenuItem>
                    <MenuItem value="petrol">Petrol (2.31)</MenuItem>
                    <MenuItem value="lpg">LPG (1.51)</MenuItem>
                    <MenuItem value="cng">CNG (2.0)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Liters per Month"
                  type="number"
                  value={newS1.litersPerMonth}
                  onChange={(e) =>
                    setNewS1({
                      ...newS1,
                      litersPerMonth: Number(e.target.value),
                    })
                  }
                  size="small"
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Months"
                  type="number"
                  value={newS1.months}
                  onChange={(e) =>
                    setNewS1({ ...newS1, months: Number(e.target.value) })
                  }
                  size="small"
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setS1Open(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddS1}
            sx={{
              bgcolor: "#ef4444",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#dc2626" },
            }}
          >
            Add Asset
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={s2Open}
        onClose={() => setS2Open(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Scope 2 Entry</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Branch / Location"
              value={newS2.branch}
              onChange={(e) => setNewS2({ ...newS2, branch: e.target.value })}
              size="small"
            />
            <FormControl size="small" fullWidth>
              <InputLabel>Source</InputLabel>
              <Select
                value={newS2.source}
                label="Source"
                onChange={(e) =>
                  setNewS2({
                    ...newS2,
                    source: e.target.value as "grid" | "private",
                  })
                }
              >
                <MenuItem value="grid">National Grid (EF: 0.43)</MenuItem>
                <MenuItem value="private">Private Generation</MenuItem>
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="kWh per Month"
                  type="number"
                  value={newS2.kwhPerMonth}
                  onChange={(e) =>
                    setNewS2({ ...newS2, kwhPerMonth: Number(e.target.value) })
                  }
                  size="small"
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  fullWidth
                  label="Months"
                  type="number"
                  value={newS2.months}
                  onChange={(e) =>
                    setNewS2({ ...newS2, months: Number(e.target.value) })
                  }
                  size="small"
                />
              </Grid>
            </Grid>
            {newS2.source === "private" && (
              <TextField
                fullWidth
                label="Custom Emission Factor (kgCO₂/kWh)"
                type="number"
                value={newS2.emissionFactor || ""}
                onChange={(e) =>
                  setNewS2({ ...newS2, emissionFactor: Number(e.target.value) })
                }
                size="small"
              />
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setS2Open(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddS2}
            sx={{
              bgcolor: "#f59e0b",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#d97706" },
            }}
          >
            Add Entry
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={s3Open}
        onClose={() => setS3Open(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>Add Scope 3 Sector</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Sector</InputLabel>
              <Select
                value={newS3.sector}
                label="Sector"
                onChange={(e) => {
                  const s = e.target.value;
                  setNewS3({
                    ...newS3,
                    sector: s,
                    intensityFactor: SECTOR_INTENSITY_FACTORS[s] || 0.000001,
                  });
                }}
              >
                {Object.keys(SECTOR_INTENSITY_FACTORS).map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Loan Exposure (₦)"
              type="number"
              value={newS3.loanExposure}
              onChange={(e) =>
                setNewS3({ ...newS3, loanExposure: Number(e.target.value) })
              }
              size="small"
            />
            <TextField
              fullWidth
              label="Intensity Factor"
              type="number"
              value={newS3.intensityFactor}
              onChange={(e) =>
                setNewS3({ ...newS3, intensityFactor: Number(e.target.value) })
              }
              size="small"
              inputProps={{ step: 0.0000001 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setS3Open(false)}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddS3}
            sx={{
              bgcolor: "#3b82f6",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: "#2563eb" },
            }}
          >
            Add Sector
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
