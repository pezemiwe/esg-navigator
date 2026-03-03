import { useState, useMemo } from "react";

import {
  Box,
  Typography,
  Paper,
  alpha,
  useTheme,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  TablePagination,
} from "@mui/material";
import {
  Shield,
  AlertTriangle,
  Factory,
  Building,
  Globe,
  Briefcase,
  Scale,
  CloudSun,
  Plus,
  X,
  Trash2,
  Eye,
  FileUp,
  ArrowRight,
  Download,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  useSustainabilityStore,
  type SustainabilityRisk,
} from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import {
  SAMPLE_INTERNAL_RISKS,
  SAMPLE_EXTERNAL_RISKS,
  SAMPLE_ERM_RISKS,
  SAMPLE_ISSB_RISKS,
  SAMPLE_REGULATOR_RISKS,
} from "@/config/sampleRisks";
import { getRiskColor, getRiskLevel, RISK_CATEGORIES } from "../data/constants";

const getHeatMapScore = (impact: number, likelihood: number) =>
  impact * likelihood;

const BRAND = DELOITTE_COLORS.green.DEFAULT;

const TABS = [
  {
    label: "SASB Aligned",
    icon: Factory,
    source: "sasb",
    desc: "Industry-specific material topics from the SASB framework.",
  },
  {
    label: "ISSB S2 (Climate)",
    icon: CloudSun,
    source: "issb",
    desc: "Climate-related risks and opportunities per IFRS S2 standards.",
  },
  {
    label: "Internal",
    icon: Building,
    source: "internal",
    desc: "Risks identified through internal operations and staff.",
  },
  {
    label: "External",
    icon: Globe,
    source: "external",
    desc: "Risks driven by markets, communities, and external stakeholders.",
  },
  {
    label: "ERM Aligned",
    icon: Briefcase,
    source: "erm",
    desc: "Traditional enterprise risks mapped to ESG factors.",
  },
  {
    label: "Regulators",
    icon: Scale,
    source: "regulator",
    desc: "Compliance, legal, and policy-driven risks.",
  },
];

export default function RiskIdentification() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const { risks, setRisks, entityProfile } = useSustainabilityStore(
    useShallow((state) => ({
      risks: state.risks,
      setRisks: state.setRisks,
      entityProfile: state.entityProfile,
    })),
  );
  const [tabIndex, setTabIndex] = useState(0);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState<"form" | "csv">("form");
  const [viewRiskModalOpen, setViewRiskModalOpen] = useState(false);
  const [missingTabsWarningOpen, setMissingTabsWarningOpen] = useState(false);

  const [selectedRisk, setSelectedRisk] = useState<SustainabilityRisk | null>(
    null,
  );
  const [deleteRiskId, setDeleteRiskId] = useState<string | null>(null);

  // Pagination State
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [newRisk, setNewRisk] = useState({
    name: "",
    category: "",
    impact: 3,
    likelihood: 3,
    financialEffect: "",
    timeHorizon: "Short Term (0-3 years)",
  });

  const dynamicRiskList = useMemo(() => {
    return risks;
  }, [risks]);

  const handleAddRisk = () => {
    if (!newRisk.name || !newRisk.category) return;

    const riskToAdd: SustainabilityRisk = {
      ...newRisk,
      id: `custom-${Date.now()}`,
      source: TABS[tabIndex].source as SustainabilityRisk["source"],
      subcategory: "Custom User Entry",
    };

    setRisks([...risks, riskToAdd]);
    setAddModalOpen(false);
    setNewRisk({
      name: "",
      category: "",
      impact: 3,
      likelihood: 3,
      financialEffect: "",
      timeHorizon: "Short Term (0-3 years)",
    });
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      // Simulate network delay for uploading state
      setTimeout(() => {
        const csvData = event.target?.result as string;

        // Better CSV parsing to handle quotes
        const parseCSVLine = (text: string) => {
          const result = [];
          let item = "";
          let inQuotes = false;
          for (let i = 0; i < text.length; i++) {
            const char = text[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === "," && !inQuotes) {
              result.push(item);
              item = "";
            } else {
              item += char;
            }
          }
          result.push(item);
          return result;
        };

        const lines = csvData
          .split("\n")
          .filter((line) => line.trim().length > 0);
        if (lines.length < 2) {
          setIsUploading(false);
          return;
        }

        const newRisks: SustainabilityRisk[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length >= 6) {
            newRisks.push({
              id: `csv-${Date.now()}-${i}`,
              source: TABS[tabIndex].source as SustainabilityRisk["source"],
              subcategory: "Imported Record",
              name: values[0].trim(),
              category: values[1].trim(),
              impact: parseInt(values[2].trim(), 10) || 3,
              likelihood: parseInt(values[3].trim(), 10) || 3,
              financialEffect: values[4].trim(),
              timeHorizon: values[5].trim(),
            });
          }
        }
        setRisks([...risks, ...newRisks]);
        setIsUploading(false);
        setAddModalOpen(false);
      }, 800);
    };
    reader.readAsText(file);
  };

  const handleDeleteRisk = (id: string) => {
    setRisks(risks.filter((r) => r.id !== id));
  };

  const confirmDelete = () => {
    if (deleteRiskId) {
      handleDeleteRisk(deleteRiskId);
      setDeleteRiskId(null);
    }
  };

  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);
  const modalFieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 1.5,
      bgcolor: isDark ? alpha("#fff", 0.02) : alpha("#0f172a", 0.01),
    },
    "& .MuiInputLabel-root": {
      fontWeight: 500,
    },
  };

  const handleScoringClick = () => {
    const missingSources = Object.entries(sourceCounts)
      .filter(([, count]) => count === 0)
      .map(([source]) => source);

    if (missingSources.length > 0) {
      setMissingTabsWarningOpen(true);
    } else {
      navigate("/sustainability/risks/scoring");
    }
  };

  const activeSource = TABS[tabIndex].source;
  const activeRisks = dynamicRiskList.filter((r) => r.source === activeSource);
  const sourceCounts = {
    sasb: dynamicRiskList.filter((r) => r.source === "sasb").length,
    issb: dynamicRiskList.filter((r) => r.source === "issb").length,
    internal: dynamicRiskList.filter((r) => r.source === "internal").length,
    external: dynamicRiskList.filter((r) => r.source === "external").length,
    erm: dynamicRiskList.filter((r) => r.source === "erm").length,
    regulator: dynamicRiskList.filter((r) => r.source === "regulator").length,
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflowY: "auto",
        p: 4,
        width: "100%",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Risk Register Command Center
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Multi-source taxonomy tracking for{" "}
            {entityProfile.name || "your entity"}
          </Typography>
        </Box>
        <Button
          variant="contained"
          endIcon={<ArrowRight size={18} />}
          onClick={handleScoringClick}
          disabled={dynamicRiskList.length === 0}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 2,
            bgcolor: BRAND,
            textTransform: "none",
            fontWeight: 600,
            fontSize: "0.95rem",
            "&:hover": { bgcolor: alpha(BRAND, 0.9) },
          }}
        >
          Perform Materiality Scoring
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2.5,
          mb: 5,
          width: "100%",
        }}
      >
        {[
          {
            label: "Total Identified Risks",
            value: dynamicRiskList.length,
            icon: Shield,
            iconColor: "#7c3aed",
            iconBg: alpha("#7c3aed", 0.1),
            trendColor: "#10b981",
            trendText: "Active in scope",
            badge: null,
          },
          {
            label: "Critical Priority (Heat > 15)",
            value: dynamicRiskList.filter(
              (r) => getHeatMapScore(r.impact, r.likelihood) >= 15,
            ).length,
            icon: AlertTriangle,
            iconColor: "#3b82f6",
            iconBg: alpha("#3b82f6", 0.12),
            trendColor: "#dc2626",
            trendText: "Requires immediate mitigation",
            badge:
              dynamicRiskList.filter(
                (r) => getHeatMapScore(r.impact, r.likelihood) >= 15,
              ).length > 0
                ? "NEEDS ATTENTION"
                : null,
          },
          {
            label: "Regulator Flagged",
            value: dynamicRiskList.filter((r) => r.source === "regulator")
              .length,
            icon: Scale,
            iconColor: "#f59e0b",
            iconBg: alpha("#f59e0b", 0.14),
            trendColor: "#10b981",
            trendText: "Compliance exposure",
            badge: null,
          },
        ].map((stat, i) => (
          <Box key={i} sx={{ display: "flex", width: "100%" }}>
            <Paper
              elevation={0}
              sx={{
                p: 2.75,
                width: "100%",
                minHeight: 210,
                borderRadius: "14px",
                bgcolor: isDark ? alpha("#fff", 0.03) : "#ffffff",
                border: `1px solid ${isDark ? alpha("#fff", 0.06) : "rgba(15,23,42,0.05)"}`,
                boxShadow: isDark
                  ? "0 10px 28px rgba(0,0,0,0.35)"
                  : "0 8px 24px rgba(15, 23, 42, 0.08)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start"
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: "text.primary",
                    fontSize: "1.05rem",
                    lineHeight: 1.35,
                    maxWidth: "70%",
                  }}
                >
                  {stat.label}
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: "12px",
                    bgcolor: stat.iconBg,
                    color: stat.iconColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <stat.icon size={20} strokeWidth={2.5} />
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={1.2} mt={1.75}>
                <Typography
                  sx={{
                    fontSize: "3.2rem",
                    fontWeight: 800,
                    color: "text.primary",
                    letterSpacing: "-0.035em",
                    lineHeight: 1,
                  }}
                >
                  {stat.value}
                </Typography>
                {stat.badge && (
                  <Chip
                    label={stat.badge}
                    size="small"
                    sx={{
                      bgcolor: alpha("#dc2626", 0.1),
                      color: "#dc2626",
                      fontWeight: 700,
                      fontSize: "0.62rem",
                      height: 20,
                      borderRadius: "6px",
                      letterSpacing: "0.04em",
                    }}
                  />
                )}
              </Box>

              <Box display="flex" alignItems="center" gap={0.7} mt={1.25}>
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: stat.trendColor,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: stat.trendColor,
                    fontWeight: 600,
                    fontSize: "0.93rem",
                  }}
                >
                  {stat.trendText}
                </Typography>
              </Box>
            </Paper>
          </Box>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          borderRadius: "18px",
          border: `1px solid ${isDark ? alpha("#fff", 0.08) : "rgba(15,23,42,0.06)"}`,
          bgcolor: isDark ? alpha("#fff", 0.03) : "#ffffff",
          boxShadow: isDark
            ? "0 10px 30px rgba(0,0,0,0.32)"
            : "0 10px 28px rgba(15,23,42,0.08)",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={(_, v) => {
            setTabIndex(v);
            setPage(0);
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            py: 1,
            borderBottom: `1px solid ${borderColor}`,
            bgcolor: isDark ? alpha("#fff", 0.01) : "#ffffff",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.82rem",
              minHeight: 46,
              px: 0.75,
              mr: 2,
              ml: 0,
              color: "text.secondary",
              letterSpacing: "0.02em",
              transition: "color 0.2s ease",
            },
            "& .Mui-selected": {
              color: BRAND,
              fontWeight: 700,
            },
            "& .MuiTabs-indicator": {
              bgcolor: BRAND,
              height: 2,
              borderRadius: 99,
            },
          }}
        >
          {TABS.map((t, idx) => (
            <Tab
              key={idx}
              label={
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <t.icon size={15} />
                  <span>{t.label}</span>
                  <Typography
                    sx={{
                      fontSize: "0.75rem",
                      color: "text.disabled",
                      fontWeight: 600,
                    }}
                  >
                    ({sourceCounts[t.source as keyof typeof sourceCounts]})
                  </Typography>
                </Stack>
              }
            />
          ))}
        </Tabs>

        <Box p={4} minHeight={400}>
          <Box
            mb={4}
            pb={3}
            borderBottom={`1px solid ${borderColor}`}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center" mb={0.5}>
                <Box
                  sx={{
                    color: BRAND,
                    display: "flex",
                    alignItems: "center",
                    p: 0.75,
                    borderRadius: 1.5,
                    bgcolor: alpha(BRAND, 0.08),
                  }}
                >
                  {(() => {
                    const Icon = TABS[tabIndex].icon;
                    return <Icon size={20} />;
                  })()}
                </Box>
                <Typography variant="h6" fontWeight={700} color="text.primary">
                  {TABS[tabIndex].label} Intelligence
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {tabIndex === 0 && entityProfile.sasbIndustry
                  ? `Dynamically generated material topics for the ${entityProfile.sasbIndustry} sector, conforming to SASB logic.`
                  : TABS[tabIndex].desc}
              </Typography>
            </Box>
            {activeRisks.length > 0 && (
              <Button
                variant="contained"
                startIcon={<Plus size={18} />}
                onClick={() => {
                  setUploadMode("form");
                  setAddModalOpen(true);
                }}
                sx={{
                  bgcolor: BRAND,
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 1.5,
                  boxShadow: `0 4px 12px ${alpha(BRAND, 0.25)}`,
                  "&:hover": {
                    bgcolor: alpha(BRAND, 0.9),
                    boxShadow: `0 6px 16px ${alpha(BRAND, 0.35)}`,
                  },
                  px: 2.5,
                  py: 1,
                }}
              >
                Add Record
              </Button>
            )}
          </Box>

          {activeRisks.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Risk Data Catalogued
              </Typography>
              <Typography variant="body2" color="text.disabled" mb={3}>
                Populate this vector by defining manual records or bulk
                importing a CSV dataset.
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  setUploadMode("form");
                  setAddModalOpen(true);
                }}
                startIcon={<FileUp size={18} />}
                sx={{ borderColor: BRAND, color: BRAND }}
              >
                Add Record
              </Button>
              {(() => {
                let samples: SustainabilityRisk[] = [];
                if (activeSource === "issb") samples = SAMPLE_ISSB_RISKS;
                else if (activeSource === "regulator")
                  samples = SAMPLE_REGULATOR_RISKS;
                else if (activeSource === "internal")
                  samples = SAMPLE_INTERNAL_RISKS;
                else if (activeSource === "external")
                  samples = SAMPLE_EXTERNAL_RISKS;
                else if (activeSource === "erm") samples = SAMPLE_ERM_RISKS;

                const newSamples = samples.filter(
                  (s) => !risks.some((r) => r.id === s.id),
                );

                if (newSamples.length > 0) {
                  return (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setRisks([...risks, ...newSamples]);
                      }}
                      startIcon={<Download size={18} />}
                      sx={{ borderColor: BRAND, color: BRAND, ml: 2 }}
                    >
                      Load Sample Data
                    </Button>
                  );
                }
                return null;
              })()}
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 1.25 }}>
                <Typography
                  sx={{
                    fontSize: "0.98rem",
                    fontWeight: 700,
                    color: "text.primary",
                    mb: 0,
                  }}
                >
                  All Transactions
                </Typography>
              </Box>

              <TableContainer
                sx={{
                  borderTop: `1px solid ${isDark ? alpha("#fff", 0.08) : "rgba(15,23,42,0.06)"}`,
                  borderRadius: "0 0 18px 18px",
                  overflow: "hidden",
                }}
              >
                <Table
                  sx={{
                    minWidth: 800,
                    "& .MuiTableCell-root": {
                      borderColor: isDark
                        ? alpha("#fff", 0.08)
                        : "rgba(15,23,42,0.06)",
                    },
                  }}
                >
                  <TableHead>
                    <TableRow
                      sx={{ bgcolor: isDark ? alpha("#fff", 0.02) : "#f8fafc" }}
                    >
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "text.secondary",
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          borderBottom: `2px solid ${borderColor}`,
                        }}
                      >
                        Risk Vector
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "text.secondary",
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          borderBottom: `2px solid ${borderColor}`,
                        }}
                      >
                        Category Map
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "text.secondary",
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          textAlign: "center",
                          borderBottom: `2px solid ${borderColor}`,
                        }}
                      >
                        Severity
                        <br />
                        (Impact x Likelihood)
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "text.secondary",
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          borderBottom: `2px solid ${borderColor}`,
                        }}
                      >
                        Primary Financial Effect
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "text.secondary",
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          borderBottom: `2px solid ${borderColor}`,
                        }}
                      >
                        Time Horizon
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 700,
                          color: "text.secondary",
                          fontSize: "0.72rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                          borderBottom: `2px solid ${borderColor}`,
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeRisks
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                      .map((risk) => {
                        const heat = getHeatMapScore(
                          risk.impact,
                          risk.likelihood,
                        );
                        const color = getRiskColor(heat);
                        const level = getRiskLevel(heat);
                        return (
                          <TableRow
                            key={risk.id}
                            hover
                            sx={{
                              "&:last-child td": { border: 0 },
                              transition: "background-color 0.2s ease",
                              "&:hover": {
                                bgcolor: isDark
                                  ? alpha("#fff", 0.02)
                                  : alpha("#0f172a", 0.02),
                              },
                            }}
                          >
                            <TableCell>
                              <Typography variant="subtitle2" fontWeight={700}>
                                {risk.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={risk.category}
                                size="small"
                                variant="outlined"
                                sx={{ borderRadius: 1 }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={`${level} (${heat})`}
                                size="small"
                                sx={{
                                  bgcolor: alpha(color, 0.1),
                                  color: color,
                                  fontWeight: 700,
                                  minWidth: 100,
                                  borderRadius: 1.5,
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {risk.financialEffect}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {risk.timeHorizon}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Stack
                                direction="row"
                                spacing={0.5}
                                justifyContent="flex-end"
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedRisk(risk);
                                    setViewRiskModalOpen(true);
                                  }}
                                  sx={{
                                    color: "text.secondary",
                                    "&:hover": {
                                      color: "#3b82f6",
                                      bgcolor: alpha("#3b82f6", 0.1),
                                    },
                                  }}
                                >
                                  <Eye size={16} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => setDeleteRiskId(risk.id)}
                                  sx={{
                                    color: "text.secondary",
                                    "&:hover": {
                                      color: "#ef4444",
                                      bgcolor: alpha("#ef4444", 0.1),
                                    },
                                  }}
                                >
                                  <Trash2 size={16} />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    {activeRisks.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          align="center"
                          sx={{ py: 6, color: "text.secondary" }}
                        >
                          No records found in this vector.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 20, 50]}
                component="div"
                count={activeRisks.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </>
          )}
        </Box>
      </Paper>

      <Dialog
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${borderColor}`,
            backgroundImage: "none",
            boxShadow: isDark
              ? "0 14px 36px rgba(0,0,0,0.45)"
              : "0 16px 38px rgba(15,23,42,0.14)",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            px: 3,
            pt: 3,
            pb: 2,
            borderBottom: `1px solid ${borderColor}`,
            bgcolor: isDark ? alpha("#fff", 0.01) : alpha("#0f172a", 0.01),
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Add New {TABS[tabIndex].label} Risk
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Capture risk metadata and scoring for this source.
              </Typography>
            </Box>
            <IconButton
              onClick={() => setAddModalOpen(false)}
              size="small"
              sx={{
                color: "text.secondary",
                border: `1px solid ${borderColor}`,
                bgcolor: isDark ? alpha("#fff", 0.01) : "#fff",
                "&:hover": {
                  bgcolor: isDark
                    ? alpha("#fff", 0.05)
                    : alpha("#0f172a", 0.05),
                },
              }}
            >
              <X size={20} />
            </IconButton>
          </Stack>
          <Box mt={3}>
            <Tabs
              value={uploadMode === "form" ? 0 : 1}
              onChange={(_, v) => setUploadMode(v === 0 ? "form" : "csv")}
              sx={{
                minHeight: 36,
                "& .MuiTab-root": {
                  minHeight: 36,
                  py: 0,
                  px: 2,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  textTransform: "none",
                  color: "text.secondary",
                },
                "& .Mui-selected": { color: BRAND },
                "& .MuiTabs-indicator": { bgcolor: BRAND },
              }}
            >
              <Tab label="Manual Entry" />
              <Tab label="Bulk Upload (CSV)" />
            </Tabs>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 3, pt: uploadMode === "csv" ? 0 : 2.25 }}>
          {uploadMode === "csv" ? (
            <Box
              textAlign="center"
              mt={4}
              py={3}
              px={2}
              sx={{
                border: `1px dashed ${alpha(BRAND, 0.4)}`,
                borderRadius: 1.5,
                bgcolor: isDark ? alpha(BRAND, 0.05) : alpha(BRAND, 0.03),
              }}
            >
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Upload a CSV File
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3} px={4}>
                Your file must include headers: name, category, impact,
                likelihood, financialEffect, timeHorizon.
              </Typography>
              <Button
                variant="outlined"
                component="a"
                href={`/templates/${TABS[tabIndex].source}_template.csv`}
                download={`${TABS[tabIndex].source}_risk_template.csv`}
                startIcon={<Download size={16} />}
                sx={{
                  borderColor: alpha(BRAND, 0.4),
                  color: BRAND,
                  fontWeight: 600,
                  textTransform: "none",
                  px: 2.5,
                  mb: 3,
                  "&:hover": {
                    borderColor: BRAND,
                    bgcolor: alpha(BRAND, 0.05),
                  },
                }}
              >
                Download Template
              </Button>
              <br />
              <Button
                variant="contained"
                component="label"
                disabled={isUploading}
                sx={{
                  bgcolor: BRAND,
                  color: "#fff",
                  fontWeight: 600,
                  textTransform: "none",
                  px: 2.5,
                  "&:hover": { bgcolor: alpha(BRAND, 0.9) },
                }}
              >
                {isUploading ? "Uploading..." : "Select File"}
                <input
                  type="file"
                  hidden
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </Button>
            </Box>
          ) : (
            <Stack spacing={3} sx={{ width: "100%" }}>
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  Risk Information
                </Typography>
                <Stack spacing={2} sx={{ width: "100%" }}>
                  <TextField
                    fullWidth
                    label="Risk Vector (Name)"
                    variant="outlined"
                    value={newRisk.name}
                    onChange={(e) =>
                      setNewRisk({ ...newRisk, name: e.target.value })
                    }
                    placeholder="e.g., Supply Chain Disruption"
                    sx={modalFieldSx}
                  />
                  <FormControl fullWidth sx={modalFieldSx}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={newRisk.category}
                      label="Category"
                      onChange={(e) =>
                        setNewRisk({ ...newRisk, category: e.target.value })
                      }
                    >
                      {RISK_CATEGORIES.map((cat) => (
                        <MenuItem key={cat} value={cat}>
                          {cat}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={modalFieldSx}>
                    <InputLabel>Time Horizon</InputLabel>
                    <Select
                      value={newRisk.timeHorizon}
                      label="Time Horizon"
                      onChange={(e) =>
                        setNewRisk({ ...newRisk, timeHorizon: e.target.value })
                      }
                    >
                      <MenuItem value="Short Term (0-3 years)">
                        Short Term (0-3 years)
                      </MenuItem>
                      <MenuItem value="Medium Term (3-10 years)">
                        Medium Term (3-10 years)
                      </MenuItem>
                      <MenuItem value="Long Term (10+ years)">
                        Long Term (10+ years)
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Primary Financial Effect"
                    variant="outlined"
                    value={newRisk.financialEffect}
                    onChange={(e) =>
                      setNewRisk({
                        ...newRisk,
                        financialEffect: e.target.value,
                      })
                    }
                    placeholder="e.g., Increased Operating Costs"
                    sx={modalFieldSx}
                  />
                </Stack>
              </Box>

              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: "text.secondary",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  Scoring
                </Typography>
                <Stack spacing={2} sx={{ width: "100%" }}>
                  <FormControl fullWidth sx={modalFieldSx}>
                    <InputLabel>Impact Score</InputLabel>
                    <Select
                      value={newRisk.impact}
                      label="Impact Score"
                      onChange={(e) =>
                        setNewRisk({
                          ...newRisk,
                          impact: Number(e.target.value),
                        })
                      }
                    >
                      <MenuItem value={1}>1 - Very Low</MenuItem>
                      <MenuItem value={2}>2 - Low</MenuItem>
                      <MenuItem value={3}>3 - Moderate</MenuItem>
                      <MenuItem value={4}>4 - High</MenuItem>
                      <MenuItem value={5}>5 - Critical</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl fullWidth sx={modalFieldSx}>
                    <InputLabel>Likelihood Score</InputLabel>
                    <Select
                      value={newRisk.likelihood}
                      label="Likelihood Score"
                      onChange={(e) =>
                        setNewRisk({
                          ...newRisk,
                          likelihood: Number(e.target.value),
                        })
                      }
                    >
                      <MenuItem value={1}>1 - Rare</MenuItem>
                      <MenuItem value={2}>2 - Unlikely</MenuItem>
                      <MenuItem value={3}>3 - Possible</MenuItem>
                      <MenuItem value={4}>4 - Likely</MenuItem>
                      <MenuItem value={5}>5 - Almost Certain</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            </Stack>
          )}
        </DialogContent>

        {uploadMode !== "csv" && (
          <DialogActions
            sx={{
              p: 3,
              pt: 2.25,
              borderTop: `1px solid ${borderColor}`,
              bgcolor: isDark ? alpha("#fff", 0.01) : alpha("#0f172a", 0.01),
              justifyContent: "space-between",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Complete required fields to add a risk.
            </Typography>
            <Box display="flex" gap={1}>
              <Button
                onClick={() => setAddModalOpen(false)}
                variant="outlined"
                sx={{
                  color: "text.secondary",
                  borderColor,
                  fontWeight: 600,
                  textTransform: "none",
                  px: 2.25,
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleAddRisk}
                disabled={!newRisk.name || !newRisk.category}
                startIcon={<Plus size={16} />}
                sx={{
                  bgcolor: BRAND,
                  "&:hover": { bgcolor: alpha(BRAND, 0.9) },
                  fontWeight: 600,
                  textTransform: "none",
                  px: 3,
                  boxShadow: `0 6px 14px ${alpha(BRAND, 0.28)}`,
                }}
              >
                Add Record
              </Button>
            </Box>
          </DialogActions>
        )}
      </Dialog>

      {/* View Modal */}
      <Dialog
        open={viewRiskModalOpen}
        onClose={() => setViewRiskModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${borderColor}`,
            backgroundImage: "none",
            boxShadow: isDark
              ? "0 14px 36px rgba(0,0,0,0.45)"
              : "0 16px 38px rgba(15,23,42,0.14)",
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            px: 3,
            pt: 3,
            pb: 2,
            borderBottom: `1px solid ${borderColor}`,
            bgcolor: isDark ? alpha("#fff", 0.01) : alpha("#0f172a", 0.01),
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {selectedRisk?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {selectedRisk?.category} • {selectedRisk?.subcategory}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setViewRiskModalOpen(false)}
              size="small"
              sx={{ color: "text.secondary" }}
            >
              <X size={20} />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          {selectedRisk && (
            <Stack spacing={3.5} mt={2}>
              <Stack direction="row" spacing={3}>
                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    textTransform="uppercase"
                  >
                    Impact Score
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#ef4444"
                    mt={0.5}
                  >
                    {selectedRisk.impact} / 5
                  </Typography>
                </Box>
                <Box flex={1}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    textTransform="uppercase"
                  >
                    Likelihood Score
                  </Typography>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="#3b82f6"
                    mt={0.5}
                  >
                    {selectedRisk.likelihood} / 5
                  </Typography>
                </Box>
              </Stack>

              <Box
                p={2.5}
                borderRadius={2}
                bgcolor={alpha(BRAND, 0.05)}
                border={`1px solid ${alpha(BRAND, 0.1)}`}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                    textTransform="uppercase"
                  >
                    Calculated Severity (Heat Map Score)
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    color={BRAND}
                    mt={0.5}
                  >
                    {getHeatMapScore(
                      selectedRisk.impact,
                      selectedRisk.likelihood,
                    )}
                  </Typography>
                </Box>
                <Chip
                  label={getRiskLevel(
                    getHeatMapScore(
                      selectedRisk.impact,
                      selectedRisk.likelihood,
                    ),
                  )}
                  sx={{
                    bgcolor: alpha(
                      getRiskColor(
                        getHeatMapScore(
                          selectedRisk.impact,
                          selectedRisk.likelihood,
                        ),
                      ),
                      0.1,
                    ),
                    color: getRiskColor(
                      getHeatMapScore(
                        selectedRisk.impact,
                        selectedRisk.likelihood,
                      ),
                    ),
                    fontWeight: 700,
                    borderRadius: 1.5,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  Primary Financial Effect
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedRisk.financialEffect}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  Time Horizon
                </Typography>
                <Typography variant="body1" fontWeight={500} mt={0.5}>
                  {selectedRisk.timeHorizon}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={Boolean(deleteRiskId)}
        onClose={() => setDeleteRiskId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${borderColor}`,
            backgroundImage: "none",
            boxShadow: isDark
              ? "0 10px 30px rgba(0,0,0,0.4)"
              : "0 10px 30px rgba(15,23,42,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            Delete Risk Record
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography color="text.secondary">
            Are you sure you want to delete this risk record? This action cannot
            be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setDeleteRiskId(null)}
            variant="outlined"
            sx={{
              color: "text.secondary",
              borderColor,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 1.5,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={<Trash2 size={16} />}
            sx={{
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 1.5,
              boxShadow: "none",
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Missing Tabs Warning Modal */}
      <Dialog
        open={missingTabsWarningOpen}
        onClose={() => setMissingTabsWarningOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            bgcolor: theme.palette.background.paper,
            border: `1px solid ${borderColor}`,
            backgroundImage: "none",
            boxShadow: isDark
              ? "0 10px 30px rgba(0,0,0,0.4)"
              : "0 10px 30px rgba(15,23,42,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3, px: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <AlertTriangle color="#f59e0b" size={24} />
            <Typography variant="h6" fontWeight={700}>
              Incomplete Risk Data
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 2 }}>
          <Typography color="text.secondary" mb={2}>
            You have not uploaded or entered any risks for one or more tabs. Are
            you sure you want to proceed to scoring without completing all
            sections?
          </Typography>
          <Typography variant="body2" fontWeight={600} color="text.primary">
            Missing sections:
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {Object.entries(sourceCounts)
              .filter(([, count]) => count === 0)
              .map(([source]) => TABS.find((t) => t.source === source)?.label)
              .filter(Boolean)
              .join(", ")}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1, gap: 1 }}>
          <Button
            onClick={() => setMissingTabsWarningOpen(false)}
            variant="outlined"
            sx={{
              color: "text.secondary",
              borderColor,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 1.5,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setMissingTabsWarningOpen(false);
              navigate("/sustainability/risks/scoring");
            }}
            variant="contained"
            sx={{
              bgcolor: BRAND,
              color: "#fff",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 1.5,
              boxShadow: "none",
              "&:hover": { bgcolor: alpha(BRAND, 0.9) },
            }}
          >
            Proceed Anyway
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scoring Modal Removed */}
    </Box>
  );
}
