import { useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  alpha,
  useTheme,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import { FileSpreadsheet, CheckCircle2, Clock, Send } from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import type { DataTemplate } from "@/store/sustainabilityStore";
import { TEMPLATE_CONFIGS } from "../data/constants";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

export default function TemplateGeneration() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const {
    risks,
    selectedMaterialTopicIds,
    templates,
    setTemplates,
    updateTemplate,
  } = useSustainabilityStore();

  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  const selectedRisks = useMemo(() => {
    return risks.filter((r) => selectedMaterialTopicIds.includes(r.id));
  }, [risks, selectedMaterialTopicIds]);

  useEffect(() => {
    if (templates.length > 0 || selectedRisks.length === 0) return;
    const generated: DataTemplate[] = selectedRisks.map((risk) => {
      const config =
        TEMPLATE_CONFIGS[risk.category] || TEMPLATE_CONFIGS["Operational"];
      return {
        id: `tpl-${risk.id}`,
        topicId: risk.id,
        topicName: risk.name,
        assignedTo: config.assignedTo,
        department: config.department,
        frequency: "quarterly",
        fields: config.fields.map((metric) => ({
          metric,
          fy2023: "",
          fy2024: "",
          fy2025: "",
          notes: "",
        })),
        status: "pending",
      };
    });
    setTemplates(generated);
  }, [selectedRisks, templates.length, setTemplates]);

  const statusCounts = useMemo(() => {
    const map = { pending: 0, "in-progress": 0, submitted: 0, approved: 0 };
    templates.forEach((t) => {
      map[t.status]++;
    });
    return map;
  }, [templates]);

  const completionPct = useMemo(() => {
    if (templates.length === 0) return 0;
    const done = templates.filter(
      (t) => t.status === "submitted" || t.status === "approved",
    ).length;
    return Math.round((done / templates.length) * 100);
  }, [templates]);

  const activeT = useMemo(() => {
    return templates.find((t) => t.id === activeTemplate);
  }, [templates, activeTemplate]);

  const handleFieldChange = (
    templateId: string,
    fieldIndex: number,
    key: string,
    value: string,
  ) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    const fields = [...tpl.fields];
    fields[fieldIndex] = { ...fields[fieldIndex], [key]: value };
    updateTemplate(templateId, { fields });
  };

  const handleStatusChange = (
    templateId: string,
    status: DataTemplate["status"],
  ) => {
    updateTemplate(templateId, {
      status,
      submittedAt:
        status === "submitted" ? new Date().toISOString() : undefined,
    });
  };

  const statusConfig: Record<string, { color: string; icon: typeof Clock }> = {
    pending: { color: "#94a3b8", icon: Clock },
    "in-progress": { color: "#f59e0b", icon: Clock },
    submitted: { color: "#3b82f6", icon: Send },
    approved: { color: "#10b981", icon: CheckCircle2 },
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
          DATA TEMPLATE GENERATION
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
          Template Assignment & Data Collection
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", mt: 0.5, maxWidth: 700 }}
        >
          Auto-generated data templates for each material topic — assign to
          departments and track completion status
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Templates Generated",
            value: templates.length,
            color: BRAND,
          },
          { label: "Pending", value: statusCounts.pending, color: "#94a3b8" },
          {
            label: "In Progress",
            value: statusCounts["in-progress"],
            color: "#f59e0b",
          },
          {
            label: "Submitted",
            value: statusCounts.submitted,
            color: "#3b82f6",
          },
          { label: "Approved", value: statusCounts.approved, color: "#10b981" },
          { label: "Completion", value: `${completionPct}%`, color: BRAND },
        ].map((stat) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={stat.label}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: cardBg,
                border: `1px solid ${borderColor}`,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  bgcolor: stat.color,
                },
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {stat.value}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  fontSize: "0.65rem",
                }}
              >
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 3,
          bgcolor: alpha(BRAND, isDark ? 0.06 : 0.03),
          border: `1px solid ${alpha(BRAND, 0.12)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Overall Data Collection Progress
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND }}>
            {completionPct}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionPct}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: alpha(BRAND, 0.1),
            "& .MuiLinearProgress-bar": { bgcolor: BRAND, borderRadius: 4 },
          }}
        />
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 3,
              bgcolor: cardBg,
              border: `1px solid ${borderColor}`,
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2.5, borderBottom: `1px solid ${borderColor}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <FileSpreadsheet size={18} color={BRAND} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Generated Templates
                </Typography>
              </Box>
            </Box>
            <Stack sx={{ maxHeight: 600, overflowY: "auto" }}>
              {templates.map((tpl) => {
                const sConfig = statusConfig[tpl.status];
                const Icon = sConfig.icon;
                const isActive = activeTemplate === tpl.id;
                return (
                  <Box
                    key={tpl.id}
                    onClick={() => setActiveTemplate(tpl.id)}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      borderBottom: `1px solid ${borderColor}`,
                      bgcolor: isActive ? alpha(BRAND, 0.06) : "transparent",
                      borderLeft: isActive
                        ? `3px solid ${BRAND}`
                        : "3px solid transparent",
                      "&:hover": { bgcolor: alpha(BRAND, 0.04) },
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, fontSize: "0.8rem" }}
                          noWrap
                        >
                          {tpl.topicName}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            display: "block",
                            mt: 0.25,
                          }}
                        >
                          {tpl.department} • {tpl.assignedTo}
                        </Typography>
                      </Box>
                      <Chip
                        icon={<Icon size={12} />}
                        label={tpl.status.replace("-", " ")}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.6rem",
                          textTransform: "capitalize",
                          bgcolor: alpha(sConfig.color, 0.1),
                          color: sConfig.color,
                          "& .MuiChip-icon": { color: sConfig.color },
                        }}
                      />
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip
                        label={`${tpl.fields.length} metrics`}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.6rem",
                          bgcolor: alpha("#000", 0.04),
                        }}
                      />
                      <Chip
                        label={tpl.frequency}
                        size="small"
                        sx={{
                          fontWeight: 500,
                          fontSize: "0.6rem",
                          bgcolor: alpha("#000", 0.04),
                        }}
                      />
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          {activeT ? (
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                bgcolor: cardBg,
                border: `1px solid ${borderColor}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, fontSize: "1rem" }}
                  >
                    {activeT.topicName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary" }}
                  >
                    Assigned to {activeT.assignedTo} ({activeT.department})
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Select
                    size="small"
                    value={activeT.status}
                    onChange={(e) =>
                      handleStatusChange(
                        activeT.id,
                        e.target.value as DataTemplate["status"],
                      )
                    }
                    sx={{ fontSize: "0.8rem", minWidth: 130, borderRadius: 2 }}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="submitted">Submitted</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                  </Select>
                </Stack>
              </Box>

              <TableContainer>
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
                          whiteSpace: "nowrap",
                        },
                      }}
                    >
                      <TableCell>Metric</TableCell>
                      <TableCell align="center">FY 2023</TableCell>
                      <TableCell align="center">FY 2024</TableCell>
                      <TableCell align="center">FY 2025</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeT.fields.map((field, fi) => (
                      <TableRow key={fi}>
                        <TableCell
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.78rem",
                            minWidth: 180,
                          }}
                        >
                          {field.metric}
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            value={field.fy2023}
                            onChange={(e) =>
                              handleFieldChange(
                                activeT.id,
                                fi,
                                "fy2023",
                                e.target.value,
                              )
                            }
                            sx={{
                              width: 90,
                              "& input": {
                                textAlign: "center",
                                fontSize: "0.8rem",
                                py: 0.5,
                              },
                              "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            value={field.fy2024}
                            onChange={(e) =>
                              handleFieldChange(
                                activeT.id,
                                fi,
                                "fy2024",
                                e.target.value,
                              )
                            }
                            sx={{
                              width: 90,
                              "& input": {
                                textAlign: "center",
                                fontSize: "0.8rem",
                                py: 0.5,
                              },
                              "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            size="small"
                            value={field.fy2025}
                            onChange={(e) =>
                              handleFieldChange(
                                activeT.id,
                                fi,
                                "fy2025",
                                e.target.value,
                              )
                            }
                            sx={{
                              width: 90,
                              "& input": {
                                textAlign: "center",
                                fontSize: "0.8rem",
                                py: 0.5,
                              },
                              "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            value={field.notes}
                            onChange={(e) =>
                              handleFieldChange(
                                activeT.id,
                                fi,
                                "notes",
                                e.target.value,
                              )
                            }
                            placeholder="Add note..."
                            sx={{
                              minWidth: 120,
                              "& input": { fontSize: "0.78rem", py: 0.5 },
                              "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {activeT.submittedAt && (
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    display: "block",
                    mt: 2,
                    textAlign: "right",
                  }}
                >
                  Submitted on{" "}
                  {new Date(activeT.submittedAt).toLocaleDateString("en-NG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Typography>
              )}
            </Paper>
          ) : (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                borderRadius: 3,
                bgcolor: cardBg,
                border: `1px solid ${borderColor}`,
                textAlign: "center",
              }}
            >
              <FileSpreadsheet
                size={48}
                style={{ opacity: 0.15, marginBottom: 16 }}
              />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Select a Template
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", maxWidth: 400, mx: "auto" }}
              >
                Click on a template from the left panel to view and edit its
                data collection fields. Templates are auto-generated based on
                your selected material topics.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
