import { useState, useMemo, useRef } from "react";
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
  LinearProgress,
  TextField,
  Chip,
  Snackbar,
  MenuItem,
  Tabs,
  Tab,
  Tooltip,
  Collapse,
  IconButton,
  Avatar,
} from "@mui/material";
import {
  Download,
  Printer,
  Sparkles,
  CheckCircle2,
  Clock,
  Building2,
  TrendingUp,
  ShieldAlert,
  BarChart3,
  Save,
  ArrowLeft,
  FileText,
  Zap,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  AlertCircle,
  User,
  ImagePlus,
  X,
  RotateCcw,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useMaterialityStore } from "@/store/materialityStore";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import { useShallow } from "zustand/react/shallow";
import { sampleUsers } from "@/config/sampleUsers";
import {
  calculateScope1,
  calculateScope2,
  calculateScope3,
  formatNaira,
  formatNumber,
  getRiskLevel,
} from "../data/constants";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

const PILLAR_ICONS: Record<string, typeof Building2> = {
  Governance: Building2,
  Strategy: TrendingUp,
  "Risk Management": ShieldAlert,
  "Metrics & Targets": BarChart3,
};

const PILLAR_COLORS: Record<string, string> = {
  Governance: "#6366f1",
  Strategy: "#0ea5e9",
  "Risk Management": "#f59e0b",
  "Metrics & Targets": "#10b981",
};

const PILLAR_REFS: Record<string, string> = {
  Governance: "IFRS S1 §14–22 / IFRS S2 §5–9",
  Strategy: "IFRS S1 §23–32 / IFRS S2 §10–23",
  "Risk Management": "IFRS S1 §33–38 / IFRS S2 §24–27",
  "Metrics & Targets": "IFRS S1 §39–49 / IFRS S2 §28–41",
};

// ---------------------------------------------------------------------------
// IFRS S1/S2 Minimum Disclosure Requirements
// ---------------------------------------------------------------------------
interface DisclosureItem {
  id: string;
  pillar: string;
  requirement: string;
  description: string;
}

const MINIMUM_DISCLOSURES: DisclosureItem[] = [
  // ── Governance ──
  {
    id: "gov-1",
    pillar: "Governance",
    requirement: "Board oversight of sustainability & climate risks",
    description:
      "Clearly describe the roles of the Board in overseeing sustainability and climate-related matters, including the governance body entrusted with oversight responsibility.",
  },
  {
    id: "gov-2",
    pillar: "Governance",
    requirement: "Board competencies & qualifications",
    description:
      "Disclose the skills, experience and qualifications that make the Board fit to oversee sustainability and climate-related matters.",
  },
  {
    id: "gov-3",
    pillar: "Governance",
    requirement: "Dedicated Board Committee",
    description:
      "Disclose the Board Committee dedicated to sustainability and climate-related matters and the obligations of the committee.",
  },
  {
    id: "gov-4",
    pillar: "Governance",
    requirement: "Frequency of Board updates",
    description:
      "Disclose how frequently the Board is informed on sustainability and climate-related matters.",
  },
  {
    id: "gov-5",
    pillar: "Governance",
    requirement: "Targets & remuneration linkage",
    description:
      "Disclose the targets set by the Board relating to sustainability and climate-related matters and remunerations tied to it (if any).",
  },
  {
    id: "gov-6",
    pillar: "Governance",
    requirement: "Management's role & oversight function",
    description:
      "Disclose the management-level position or committee delegated to oversee sustainability and climate-related matters, and describe roles in oversight including integration into other internal functions.",
  },
  {
    id: "gov-7",
    pillar: "Governance",
    requirement: "Management competencies",
    description:
      "Disclose the skills, experience and qualifications that qualify the management team to ensure proper management over sustainability and climate-related matters.",
  },
  {
    id: "gov-8",
    pillar: "Governance",
    requirement: "Reporting structure & monitoring",
    description:
      "Disclose the clear reporting structure established to drive accurate and timely disclosure, and the structure in place to monitor, evaluate and ensure continuous improvement.",
  },
  // ── Strategy ──
  {
    id: "str-1",
    pillar: "Strategy",
    requirement: "Risks & opportunities identification",
    description:
      "Describe all sustainability and climate-related risks and opportunities material to the company. Clearly classify them as physical or transition risks.",
  },
  {
    id: "str-2",
    pillar: "Strategy",
    requirement: "Business model & value chain impact",
    description:
      "Clearly disclose the areas of the company's business model and value chain that sustainability and climate-related risks and opportunities affect.",
  },
  {
    id: "str-3",
    pillar: "Strategy",
    requirement: "Time horizons for risks",
    description:
      "Clearly disclose the time horizons for each of the identified sustainability and climate-related risks.",
  },
  {
    id: "str-4",
    pillar: "Strategy",
    requirement: "Risk management strategies",
    description:
      "Disclose strategies the company plans to or has established in managing identified sustainability and climate-related risks and opportunities.",
  },
  {
    id: "str-5",
    pillar: "Strategy",
    requirement: "Response plans & transition plan",
    description:
      "Clearly describe how the company responds or plans to respond to risks and opportunities, including investment decisions and energy transition plans. Disclose progress made on established strategies.",
  },
  {
    id: "str-6",
    pillar: "Strategy",
    requirement: "Impact on decision-making",
    description:
      "Describe how identified risks have impacted the company's decision-making relating to its business.",
  },
  {
    id: "str-7",
    pillar: "Strategy",
    requirement: "Financial position & performance effects",
    description:
      "Describe the current and anticipated effects of climate-related risks and opportunities on financial position, financial performance and cash flows for the reporting period.",
  },
  {
    id: "str-8",
    pillar: "Strategy",
    requirement: "Material adjustments to carrying amounts",
    description:
      "Describe sustainability and climate-related risks with significant risk of materially adjusting carrying amounts of assets and liabilities in the next annual reporting period.",
  },
  {
    id: "str-9",
    pillar: "Strategy",
    requirement: "Future financial position outlook",
    description:
      "Describe how the company expects its financial position to change over short, medium and long term given its strategies — including capital expenditure, acquisitions, and planned funding sources.",
  },
  {
    id: "str-10",
    pillar: "Strategy",
    requirement: "Cash flow impact projections",
    description:
      "Describe how managing sustainability and climate-related risks could affect the company's cash flows and financial performance in the short, medium and long term.",
  },
  {
    id: "str-11",
    pillar: "Strategy",
    requirement: "Exemption from quantitative information",
    description:
      "If not providing quantitative information, explain why and provide qualitative information including affected line items, totals and subtotals within financial statements.",
  },
  {
    id: "str-12",
    pillar: "Strategy",
    requirement: "Climate resilience & scenario analysis",
    description:
      "Disclose information on the company's capacity to adjust to uncertainties arising from climate-related risks. Describe the climate scenario analysis performed, inputs used, key assumptions, and assessment results.",
  },
  {
    id: "str-13",
    pillar: "Strategy",
    requirement: "Adaptation & mitigation policies",
    description:
      "Disclose policies in place to drive climate adaptation and mitigation strategies, and the entity's understanding of how climate-related risks relate to business operations and associated trade-offs.",
  },
  // ── Risk Management ──
  {
    id: "rm-1",
    pillar: "Risk Management",
    requirement: "Risk identification, prioritisation & monitoring",
    description:
      "Describe how the company identifies, prioritises, and monitors sustainability and climate-related risks and opportunities.",
  },
  {
    id: "rm-2",
    pillar: "Risk Management",
    requirement: "ERM integration",
    description:
      "Describe how the company has integrated the risk management of identified sustainability and climate-related risks into its Enterprise Risk Management policy.",
  },
  {
    id: "rm-3",
    pillar: "Risk Management",
    requirement: "Inputs, parameters & data sources",
    description:
      "Disclose the inputs and parameters used (e.g., data sources, scope of operations covered), whether scenario analysis is used, and how the entity assesses nature, likelihood and magnitude of risks.",
  },
  {
    id: "rm-4",
    pillar: "Risk Management",
    requirement: "Risk prioritisation methodology",
    description:
      "Describe whether and how the company prioritises sustainability-related risks relative to other types of risk, how risks are monitored, and any changes to processes from previous periods.",
  },
  // ── Metrics & Targets ──
  {
    id: "mt-1",
    pillar: "Metrics & Targets",
    requirement: "IFRS-required metrics",
    description:
      "Disclose the relevant metrics required by the IFRS Sustainability Disclosure Standard on applicable topics (e.g., Scope 1, 2 and 3 GHG Emissions).",
  },
  {
    id: "mt-2",
    pillar: "Metrics & Targets",
    requirement: "Performance measurement metrics",
    description:
      "Disclose metrics used to measure and monitor the company's performance in relation to identified sustainability and climate-related risks, including progress towards set targets and regulatory requirements.",
  },
  {
    id: "mt-3",
    pillar: "Metrics & Targets",
    requirement: "Climate-related targets",
    description:
      "Disclose quantitative and qualitative climate-related targets, including objective (mitigation, adaptation), scope, period, base period, milestones, and how targets are informed by latest international agreements.",
  },
  {
    id: "mt-4",
    pillar: "Metrics & Targets",
    requirement: "Other sustainability-related targets",
    description:
      "For each target, disclose the metric used, specific quantitative or qualitative target, period, base period, milestones, performance analysis and any revisions with explanations.",
  },
  {
    id: "mt-5",
    pillar: "Metrics & Targets",
    requirement: "Greenhouse gas emissions",
    description:
      "Disclose aggregation of GHG emissions into CO₂-equivalent, the measurement approach used, and which greenhouse gases and scopes are covered by each target.",
  },
  {
    id: "mt-6",
    pillar: "Metrics & Targets",
    requirement: "Carbon credits & offsets",
    description:
      "Disclose planned use of carbon credits to offset GHG emissions and progress made in achieving climate-related targets.",
  },
  {
    id: "mt-7",
    pillar: "Metrics & Targets",
    requirement: "Transition & physical risk exposure",
    description:
      "Disclose amount and percentage of assets or business activities subject to climate transition risks, physical risks, and climate-related opportunities.",
  },
  {
    id: "mt-8",
    pillar: "Metrics & Targets",
    requirement: "Capital deployment",
    description:
      "Disclose amount and percentage of capex, financing or investment directed towards climate-related risks and opportunities.",
  },
  {
    id: "mt-9",
    pillar: "Metrics & Targets",
    requirement: "Carbon pricing",
    description:
      "Disclose the price for each metric tonne of GHGs the entity uses to assess the costs of its greenhouse gas emissions.",
  },
  {
    id: "mt-10",
    pillar: "Metrics & Targets",
    requirement: "Executive remuneration linkage",
    description:
      "Disclose how and what percentage of executive management remuneration is linked to climate-related matters.",
  },
  {
    id: "mt-11",
    pillar: "Metrics & Targets",
    requirement: "Internally developed & third-party metrics",
    description:
      "For metrics from non-IFRS sources or internally developed: disclose definition, whether absolute or relative, whether validated by third party, and how it differs from standard sources.",
  },
];

const DISCLOSURE_PILLARS = [
  "Governance",
  "Strategy",
  "Risk Management",
  "Metrics & Targets",
] as const;

// ---------------------------------------------------------------------------
// Data Owner Report View
// ---------------------------------------------------------------------------
function DataOwnerReportView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);

  const [disclosureResponses, setDisclosureResponses] = useState<
    Record<string, string>
  >({});
  const [saved, setSaved] = useState(false);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(
    "Governance",
  );

  // Simulate assignments — in production this would come from the store
  const myDisclosures = useMemo(() => {
    // Show all disclosures for the data owner demo; in production filter by assignment
    return MINIMUM_DISCLOSURES;
  }, []);

  const updateResponse = (id: string, value: string) => {
    setDisclosureResponses((prev) => ({ ...prev, [id]: value }));
  };

  const filledCount = Object.values(disclosureResponses).filter((v) =>
    v.trim(),
  ).length;
  const totalCount = myDisclosures.length;
  const completionPct =
    totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  const pillarGroups = useMemo(() => {
    const groups: Record<string, DisclosureItem[]> = {};
    for (const d of myDisclosures) {
      if (!groups[d.pillar]) groups[d.pillar] = [];
      groups[d.pillar].push(d);
    }
    return groups;
  }, [myDisclosures]);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
          size="small"
          variant="text"
          sx={{
            mb: 1.5,
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 600,
            pl: 0,
            "&:hover": { bgcolor: "transparent", color: "text.primary" },
          }}
        >
          Back
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: alpha(BRAND, 0.1),
                  border: `1.5px solid ${alpha(BRAND, 0.2)}`,
                }}
              >
                <ClipboardCheck size={20} color={BRAND} />
              </Avatar>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, lineHeight: 1.2 }}
                >
                  My Disclosure Assignments
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.25 }}
                >
                  Welcome, {user?.name} — complete your assigned IFRS S1/S2
                  minimum disclosure responses below
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Button
            variant="contained"
            size="small"
            startIcon={<Save size={14} />}
            onClick={() => setSaved(true)}
            sx={{
              bgcolor: BRAND,
              "&:hover": { bgcolor: BRAND, filter: "brightness(0.92)" },
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 3,
              py: 0.8,
              boxShadow: `0 2px 8px ${alpha(BRAND, 0.25)}`,
            }}
          >
            Save Responses
          </Button>
        </Box>
      </Box>

      {/* Summary stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
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
                height: 2.5,
                bgcolor: BRAND,
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Total Assigned
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
              {totalCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
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
                height: 2.5,
                bgcolor: "#10b981",
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Completed
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mt: 0.25, color: "#10b981" }}
            >
              {filledCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
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
                height: 2.5,
                bgcolor: "#f59e0b",
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Pending
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mt: 0.25, color: "#f59e0b" }}
            >
              {totalCount - filledCount}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 2.5,
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
                height: 2.5,
                bgcolor: "#6366f1",
              },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontWeight: 600,
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Completion
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, mt: 0.25, color: "#6366f1" }}
            >
              {completionPct}%
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Progress bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 0.75,
          }}
        >
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.secondary" }}
          >
            Overall Response Completion
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: BRAND }}>
            {completionPct}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={completionPct}
          sx={{
            height: 6,
            borderRadius: 3,
            bgcolor: alpha(BRAND, 0.08),
            "& .MuiLinearProgress-bar": {
              bgcolor: BRAND,
              borderRadius: 3,
              transition: "transform 0.4s ease",
            },
          }}
        />
      </Paper>

      {/* Disclosure form — accordion by pillar */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          overflow: "hidden",
        }}
      >
        {Object.entries(pillarGroups).map(([pillar, items]) => {
          const PillarIcon = PILLAR_ICONS[pillar] || Building2;
          const pillarColor = PILLAR_COLORS[pillar] || BRAND;
          const filledInPillar = items.filter((d) =>
            disclosureResponses[d.id]?.trim(),
          ).length;
          const isExpanded = expandedPillar === pillar;

          return (
            <Box key={pillar}>
              <Box
                onClick={() => setExpandedPillar(isExpanded ? null : pillar)}
                sx={{
                  px: 3,
                  py: 1.5,
                  cursor: "pointer",
                  bgcolor: isExpanded
                    ? alpha(pillarColor, isDark ? 0.06 : 0.025)
                    : "transparent",
                  borderBottom: `1px solid ${borderColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  transition: "background-color 0.2s ease",
                  "&:hover": {
                    bgcolor: alpha(pillarColor, isDark ? 0.08 : 0.035),
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: alpha(pillarColor, 0.1),
                      border: `1.5px solid ${alpha(pillarColor, 0.2)}`,
                    }}
                  >
                    <PillarIcon size={15} color={pillarColor} />
                  </Avatar>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, fontSize: "0.85rem" }}
                    >
                      {pillar}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        fontSize: "0.65rem",
                      }}
                    >
                      {PILLAR_REFS[pillar]}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    icon={<CheckCircle2 size={10} />}
                    label={`${filledInPillar}/${items.length}`}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: "0.6rem",
                      fontWeight: 700,
                      bgcolor: alpha(
                        filledInPillar === items.length ? "#10b981" : "#94a3b8",
                        0.08,
                      ),
                      color:
                        filledInPillar === items.length
                          ? "#10b981"
                          : "text.secondary",
                      "& .MuiChip-icon": { ml: 0.5 },
                    }}
                  />
                  <IconButton size="small">
                    {isExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </IconButton>
                </Stack>
              </Box>

              <Collapse in={isExpanded}>
                {items.map((disclosure, idx) => {
                  const isFilled = disclosureResponses[disclosure.id]?.trim();
                  return (
                    <Box
                      key={disclosure.id}
                      sx={{
                        px: 3,
                        py: 2,
                        borderBottom:
                          idx < items.length - 1
                            ? `1px solid ${alpha(borderColor, 0.6)}`
                            : `1px solid ${borderColor}`,
                        bgcolor: isFilled
                          ? alpha("#10b981", isDark ? 0.02 : 0.01)
                          : "transparent",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        sx={{ mb: 1 }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: isFilled
                              ? "#10b981"
                              : alpha("#94a3b8", 0.4),
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, fontSize: "0.82rem" }}
                        >
                          {disclosure.requirement}
                        </Typography>
                        {isFilled ? (
                          <Chip
                            icon={<CheckCircle2 size={10} />}
                            label="Done"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              bgcolor: alpha("#10b981", 0.08),
                              color: "#10b981",
                              "& .MuiChip-icon": {
                                color: "#10b981",
                                ml: 0.5,
                              },
                            }}
                          />
                        ) : (
                          <Chip
                            icon={<Clock size={10} />}
                            label="Pending"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.6rem",
                              fontWeight: 600,
                              bgcolor: alpha("#94a3b8", 0.06),
                              color: "text.secondary",
                              "& .MuiChip-icon": { ml: 0.5 },
                            }}
                          />
                        )}
                      </Stack>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          mb: 1.5,
                          pl: 2,
                          fontSize: "0.72rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {disclosure.description}
                      </Typography>
                      <Box sx={{ pl: 2 }}>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          size="small"
                          placeholder={`Provide the entity's response for "${disclosure.requirement}"...`}
                          value={disclosureResponses[disclosure.id] || ""}
                          onChange={(e) =>
                            updateResponse(disclosure.id, e.target.value)
                          }
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              fontSize: "0.82rem",
                              lineHeight: 1.65,
                              bgcolor: isDark
                                ? alpha("#fff", 0.02)
                                : alpha("#f8fafc", 0.6),
                              "&:hover .MuiOutlinedInput-notchedOutline": {
                                borderColor: alpha(BRAND, 0.3),
                              },
                              "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: BRAND,
                                  borderWidth: 1.5,
                                },
                            },
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Collapse>
            </Box>
          );
        })}
      </Paper>

      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        message="Responses saved successfully"
      />
    </Box>
  );
}

// ---------------------------------------------------------------------------
// Main AIReport Component (Manager / Admin / Champion view)
// ---------------------------------------------------------------------------
export default function AIReport() {
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;

  if (role === UserRole.DATA_OWNER || role === UserRole.DATA_ENTRY) {
    return <DataOwnerReportView />;
  }

  return <ManagerReportView />;
}

function ManagerReportView() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const role = user?.role as UserRole | undefined;
  const {
    entityProfile,
    risks,
    selectedMaterialTopicIds,
    scope1Assets,
    scope2Entries,
    scope3Entries,
    scenarioResults,
    templates,
    stakeholderSurveys,
    reportDraft,
    setReportDraft,
    reportGeneratedBy,
    setReportGeneratedBy,
    reportYear,
    setReportYear,
  } = useSustainabilityStore(
    useShallow((s) => ({
      entityProfile: s.entityProfile,
      risks: s.risks,
      selectedMaterialTopicIds: s.selectedMaterialTopicIds,
      scope1Assets: s.scope1Assets,
      scope2Entries: s.scope2Entries,
      scope3Entries: s.scope3Entries,
      scenarioResults: s.scenarioResults,
      templates: s.templates,
      stakeholderSurveys: s.stakeholderSurveys,
      reportDraft: s.reportDraft,
      setReportDraft: s.setReportDraft,
      reportGeneratedBy: s.reportGeneratedBy,
      setReportGeneratedBy: s.setReportGeneratedBy,
      reportYear: s.reportYear,
      setReportYear: s.setReportYear,
    })),
  );

  const { topics: materialityTopics, inputs: materialityInputs } =
    useMaterialityStore(
      useShallow((s) => ({
        topics: s.topics,
        inputs: s.inputs,
      })),
    );

  const canGenerate =
    role === UserRole.SUSTAINABILITY_MANAGER || role === UserRole.ADMIN;

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [mainTab, setMainTab] = useState(0);
  const [expandedPillar, setExpandedPillar] = useState<string | null>(
    "Governance",
  );
  const [disclosureAssignments, setDisclosureAssignments] = useState<
    Record<string, string>
  >({});
  const [disclosureResponses, setDisclosureResponses] = useState<
    Record<string, string>
  >({});
  const [assignmentSaved, setAssignmentSaved] = useState(false);
  const [reportImages, setReportImages] = useState<
    { id: string; dataUrl: string; name: string }[]
  >([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const currentYear = new Date().getFullYear();
  const REPORT_YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) =>
    String(currentYear - i),
  );
  const [selectedYear, setSelectedYear] = useState(
    reportYear || String(currentYear),
  );

  const dataOwnerUsers = useMemo(
    () => sampleUsers.filter((u) => u.role !== "board"),
    [],
  );

  const assignDisclosure = (disclosureId: string, userName: string) => {
    setDisclosureAssignments((prev) => ({ ...prev, [disclosureId]: userName }));
  };

  const disclosureAssignedCount = Object.values(disclosureAssignments).filter(
    (v) => v,
  ).length;

  const disclosureFilledCount = Object.values(disclosureResponses).filter((v) =>
    v.trim(),
  ).length;

  const updateDisclosureResponse = (id: string, value: string) => {
    setDisclosureResponses((prev) => ({ ...prev, [id]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        setReportImages((prev) => [
          ...prev,
          {
            id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            dataUrl: reader.result as string,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (id: string) => {
    setReportImages((prev) => prev.filter((img) => img.id !== id));
  };

  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);
  const subtleBg = isDark ? alpha("#fff", 0.02) : alpha("#f8fafc", 1);

  const s1 = useMemo(() => calculateScope1(scope1Assets), [scope1Assets]);
  const s2 = useMemo(() => calculateScope2(scope2Entries), [scope2Entries]);
  const s3 = useMemo(() => calculateScope3(scope3Entries), [scope3Entries]);
  const totalEmissions = s1 + s2 + s3;

  const selectedRisks = useMemo(() => {
    return risks.filter((r) => selectedMaterialTopicIds.includes(r.id));
  }, [risks, selectedMaterialTopicIds]);

  const completionPct = Math.round(
    (disclosureFilledCount / MINIMUM_DISCLOSURES.length) * 100,
  );

  const generateReport = () => {
    setGenerating(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          return 100;
        }
        return p + 5;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);

      const reportingYear = selectedYear;

      // --- Build materiality data section ---
      const selectedTopics = materialityTopics.filter((t) =>
        selectedMaterialTopicIds.includes(t.id),
      );
      const materialitySection =
        selectedTopics.length > 0
          ? selectedTopics
              .map((topic) => {
                const topicInputs = materialityInputs.filter(
                  (inp) => inp.topicId === topic.id,
                );
                const dataLines =
                  topicInputs.length > 0
                    ? topicInputs
                        .map(
                          (inp) =>
                            `      - ${inp.metric}: ${inp.value} (${inp.period})`,
                        )
                        .join("\n")
                    : "      - No data collected yet";
                return `    ${topic.name} [${topic.approvalStatus || "Draft"}]\n${dataLines}`;
              })
              .join("\n\n")
          : "  No materiality topics selected.";

      const report = `
SUSTAINABILITY & CLIMATE RISK DISCLOSURE REPORT
IFRS S1 / IFRS S2 ALIGNED

Prepared for: ${entityProfile.name}
Report Date: ${new Date().toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })}
Reporting Period: FY ${reportingYear}
Framework Alignment: IFRS S1, IFRS S2, GHG Protocol, PCAF, SASB — Commercial Banking
Generated by: ${user?.name || "System"}


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EXECUTIVE SUMMARY

${entityProfile.name} presents this comprehensive sustainability disclosure aligned with the International Financial Reporting Standards (IFRS) S1 and S2 requirements. As a leading Nigerian commercial bank with ${entityProfile.branches} branches, ${entityProfile.employees.toLocaleString()} employees, and a total loan book of ${formatNaira(entityProfile.loanBook)}, the Bank recognizes its responsibility as a significant financial intermediary in driving Nigeria's transition to a low-carbon economy.

This report identifies ${risks.length} sustainability-related risks, of which ${selectedMaterialTopicIds.length} have been assessed as material. Total greenhouse gas emissions for FY ${reportingYear} are estimated at ${formatNumber(totalEmissions)} tCO₂e across all three scopes. ${scenarioResults.length > 0 ? `${scenarioResults.length} climate scenario(s) have been modeled to assess financial resilience.` : "Climate scenario analysis is pending completion."}


2. GOVERNANCE (IFRS S1)

2.1 Board Oversight
The Board of Directors maintains oversight of sustainability-related risks through the Board Risk Committee (BRC), which meets quarterly to review climate risk exposures, ESG performance metrics, and regulatory compliance status.

2.2 Management's Role
The Chief Risk Officer (CRO) is responsible for integrating sustainability risks into the enterprise risk management framework. The Sustainability Steering Committee, comprising senior executives from Risk, Credit, Operations, and Compliance functions, oversees material topic assessments and disclosure preparation.

2.3 Internal Controls
The Bank has established internal controls and assurance processes to ensure the reliability and completeness of sustainability disclosures. Data collection templates have been deployed across ${templates.length} material topic areas, with departmental accountability assigned to relevant business units.


3. STRATEGY (IFRS S1 & S2)

3.1 Entity Profile & Value Chain
${entityProfile.description}

Core Banking Services: ${entityProfile.coreServices.join(", ")}

Upstream Activities: ${entityProfile.upstreamActivities.join(", ")}

Downstream Activities (Financed): ${entityProfile.downstreamActivities.join(", ")}

3.2 Sector Exposure Profile
The Bank's loan portfolio is distributed across ${entityProfile.sectorExposures.length} sectors:
${entityProfile.sectorExposures.map((s) => `  • ${s.sector}: ${s.percentage}% (${formatNaira((entityProfile.loanBook * s.percentage) / 100)})`).join("\n")}

3.3 Geographic Exposure
Key operating regions with associated climate risk profiles:
${entityProfile.geographicExposure.map((g) => `  • ${g}`).join("\n")}

3.4 Strategic Impact Assessment
The Bank's strategy is exposed to both transition and physical climate risks, with particular concentration in the Oil & Gas sector (${entityProfile.sectorExposures.find((s) => s.sector === "Oil & Gas")?.percentage || 0}% of loan book) and Lagos coastal exposure. The dual materiality assessment identified ${selectedMaterialTopicIds.length} topics requiring strategic response.


4. RISK MANAGEMENT (IFRS S1)

4.1 Risk Identification Process
The Bank employs a multi-source risk identification approach:
  • Enterprise Risk Management (ERM) Register: ${risks.filter((r) => r.source === "erm").length} risks identified
  • Stakeholder Surveys: ${stakeholderSurveys.length} surveys conducted, ${risks.filter((r) => (r.source as string) === "stakeholder").length} risks captured
  • SASB Standards Alignment: ${risks.filter((r) => r.source === "sasb").length} financially material topics identified
  • Leadership Workshops: ${risks.filter((r) => r.source === "workshop").length} risks from strategic sessions

4.2 Material Topics (Top ${selectedMaterialTopicIds.length})
${selectedRisks
  .map((r, i) => {
    const score = r.impact * r.likelihood;
    return `  ${i + 1}. ${r.name}
     Category: ${r.category} | Score: ${score} (${getRiskLevel(score)})
     Financial Effect: ${r.financialEffect} | Time Horizon: ${r.timeHorizon}`;
  })
  .join("\n\n")}

4.3 Risk Rating Distribution
  • Critical (≥20): ${risks.filter((r) => r.impact * r.likelihood >= 20).length} risks
  • High (12-19): ${
    risks.filter((r) => {
      const s = r.impact * r.likelihood;
      return s >= 12 && s < 20;
    }).length
  } risks
  • Medium (6-11): ${
    risks.filter((r) => {
      const s = r.impact * r.likelihood;
      return s >= 6 && s < 12;
    }).length
  } risks
  • Low (<6): ${risks.filter((r) => r.impact * r.likelihood < 6).length} risks

4.4 Materiality Assessment Data
The following material topics have been assessed with data collected from assigned data owners:

${materialitySection}


5. CLIMATE-RELATED RISKS & OPPORTUNITIES (IFRS S2)

5.1 Transition Risks
${
  selectedRisks
    .filter((r) => r.subcategory === "Transition Risk")
    .map(
      (r) =>
        `  • ${r.name}: Impact ${r.impact}/5, Likelihood ${r.likelihood}/5 — ${r.financialEffect}`,
    )
    .join("\n") || "  • No transition risks identified in material topics."
}

5.2 Physical Risks
${
  selectedRisks
    .filter((r) => r.subcategory === "Physical Risk")
    .map(
      (r) =>
        `  • ${r.name}: Impact ${r.impact}/5, Likelihood ${r.likelihood}/5 — ${r.financialEffect}`,
    )
    .join("\n") || "  • No physical risks identified in material topics."
}

5.3 Additional Material Categories
${
  selectedRisks
    .filter(
      (r) => !["Transition Risk", "Physical Risk"].includes(r.subcategory),
    )
    .map(
      (r) =>
        `  • ${r.name} (${r.subcategory}): Score ${r.impact * r.likelihood}`,
    )
    .join("\n") || "  • None."
}


6. GREENHOUSE GAS EMISSIONS (IFRS S2 / GHG Protocol)

6.1 Scope 1 — Direct Emissions
Source: Owned fuel combustion (generators, fleet vehicles)
Total: ${formatNumber(s1)} tCO₂e
Assets tracked: ${scope1Assets.length}
${scope1Assets.map((a) => `  • ${a.name} (${a.branch}): ${a.fuelType} — ${formatNumber(a.litersPerMonth * a.months * (a.fuelType === "diesel" ? 2.68 : a.fuelType === "petrol" ? 2.31 : a.fuelType === "lpg" ? 1.51 : 2.0))} tCO₂e`).join("\n")}

6.2 Scope 2 — Indirect Emissions (Purchased Electricity)
Source: Grid electricity and private power purchase
Total: ${formatNumber(s2)} tCO₂e
Branch locations: ${scope2Entries.length}
Nigeria grid emission factor: 0.43 kgCO₂/kWh

6.3 Scope 3 — Financed Emissions (Category 15)
Methodology: PCAF Global GHG Accounting Standard
Total: ${formatNumber(s3)} tCO₂e
${scope3Entries.map((e) => `  • ${e.sector}: ${formatNaira(e.loanExposure)} exposure → ${formatNumber(e.loanExposure * e.intensityFactor)} tCO₂e`).join("\n")}

6.4 Emissions Summary
  Total GHG Footprint: ${formatNumber(totalEmissions)} tCO₂e
  Scope 1 share: ${totalEmissions > 0 ? ((s1 / totalEmissions) * 100).toFixed(1) : 0}%
  Scope 2 share: ${totalEmissions > 0 ? ((s2 / totalEmissions) * 100).toFixed(1) : 0}%
  Scope 3 share: ${totalEmissions > 0 ? ((s3 / totalEmissions) * 100).toFixed(1) : 0}%

  Scope 3 financed emissions dominate the Bank's carbon footprint, consistent with the emissions profile of financial institutions globally.


7. SCENARIO ANALYSIS (IFRS S2)

${
  scenarioResults.length > 0
    ? scenarioResults
        .map(
          (r) => `7.x ${r.name}
  Description: ${r.description}
  Estimated Financial Cost: ${formatNaira(r.estimatedCost)}
  Profit Impact: ${r.profitImpact.toFixed(3)}%
  Projected NPL Increase: +${r.nplIncrease}%
  Capital Adequacy Effect: ${r.capitalAdequacyEffect.toFixed(1)}%
  Analysis Date: ${new Date(r.runAt).toLocaleDateString()}
`,
        )
        .join("\n")
    : "  Scenario analysis has not yet been conducted. IFRS S2 requires climate scenario analysis covering at least transition and physical risk scenarios."
}


8. METRICS & TARGETS

8.1 Key Performance Indicators
  • Total sustainability risks tracked: ${risks.length}
  • Material topics under active management: ${selectedMaterialTopicIds.length}
  • GHG emissions intensity: ${entityProfile.loanBook > 0 ? (totalEmissions / (entityProfile.loanBook / 1e9)).toFixed(2) : "N/A"} tCO₂e per ₦B loan book
  • Data collection templates deployed: ${templates.length}
  • Template completion rate: ${templates.length > 0 ? Math.round((templates.filter((t) => t.status === "submitted" || t.status === "approved").length / templates.length) * 100) : 0}%
  • Stakeholder engagement surveys: ${stakeholderSurveys.length}

8.2 Targets
  The Bank commits to:
  • Reducing Scope 1 emissions by 15% by FY 2028 through fleet electrification and solar installations
  • Achieving 30% renewable energy procurement for branch operations by FY 2030
  • Reducing financed emissions intensity by 20% across high-carbon sectors by FY 2030
  • Achieving 100% IFRS S1/S2 disclosure compliance by FY 2026


9. DATA GOVERNANCE & ASSURANCE

Data collection responsibilities have been assigned across ${new Set(templates.map((t) => t.department)).size} departments. All sustainability data undergoes internal verification before disclosure. The Bank intends to obtain limited assurance over its GHG emissions data from an independent assurance provider.


10. REGULATORY ALIGNMENT

This report has been prepared in alignment with:
  • IFRS S1 — General Requirements for Disclosure of Sustainability-related Financial Information
  • IFRS S2 — Climate-related Disclosures
  • GHG Protocol Corporate Standard
  • PCAF Global GHG Accounting and Reporting Standard
  • SASB Standards — Commercial Banks
  • CBN Sustainable Banking Principles
  • Nigeria's Nationally Determined Contribution (NDC) commitments


11. FORWARD-LOOKING STATEMENTS

This report contains forward-looking statements regarding the Bank's climate strategy, emission reduction targets, and scenario analysis outcomes. These statements are based on current expectations and assumptions and are subject to risks and uncertainties, including regulatory changes, macroeconomic conditions, and climate science developments.


12. APPROVAL

This Sustainability & Climate Risk Disclosure Report has been reviewed and approved by the Board Risk Committee of ${entityProfile.name}.

Prepared by: Sustainability Reporting Division
Report Classification: CONFIDENTIAL — FOR REGULATORY & INVESTOR USE


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
© ${new Date().getFullYear()} ${entityProfile.name}. All Rights Reserved.
Powered by GCB ESG Navigator — Deloitte Nigeria
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();

      setReportDraft(report);
      setReportGeneratedBy(user?.name || "System");
      setReportYear(reportingYear);
      setGenerating(false);
    }, 3000);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1400, mx: "auto" }}>
      {/* ━━ Page Header ━━ */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate(-1)}
          size="small"
          variant="text"
          sx={{
            mb: 1.5,
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 600,
            pl: 0,
            "&:hover": { bgcolor: "transparent", color: "text.primary" },
          }}
        >
          Back
        </Button>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: alpha(BRAND, 0.1),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={20} color={BRAND} />
              </Box>
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, lineHeight: 1.2 }}
                >
                  IFRS S1/S2 Disclosure Report
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mt: 0.25 }}
                >
                  Sustainability disclosure aligned with IFRS S1/S2, GHG
                  Protocol, and SASB standards
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Summary metrics */}
          <Stack direction="row" spacing={1.5}>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: alpha(BRAND, isDark ? 0.08 : 0.04),
                border: `1px solid ${alpha(BRAND, 0.12)}`,
                textAlign: "center",
                minWidth: 90,
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: BRAND, lineHeight: 1 }}
              >
                {disclosureAssignedCount}
                <Typography
                  component="span"
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  /{MINIMUM_DISCLOSURES.length}
                </Typography>
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.6rem" }}
              >
                Assigned
              </Typography>
            </Box>
            <Box
              sx={{
                px: 2,
                py: 1,
                borderRadius: 2,
                bgcolor: alpha("#10b981", isDark ? 0.08 : 0.04),
                border: `1px solid ${alpha("#10b981", 0.12)}`,
                textAlign: "center",
                minWidth: 90,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: "#10b981",
                  lineHeight: 1,
                }}
              >
                {completionPct}%
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", fontSize: "0.6rem" }}
              >
                Complete
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* ━━ Main Tab Navigation ━━ */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            borderBottom: `1px solid ${borderColor}`,
            bgcolor: subtleBg,
          }}
        >
          <Tabs
            value={reportDraft ? 2 : mainTab}
            onChange={(_, v) => {
              if (reportDraft && v !== 2) {
                setReportDraft("");
              }
              setMainTab(v);
            }}
            sx={{
              px: 2,
              minHeight: 52,
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                minHeight: 52,
                gap: 1,
                px: 2.5,
              },
              "& .Mui-selected": { color: BRAND, fontWeight: 700 },
              "& .MuiTabs-indicator": {
                bgcolor: BRAND,
                height: 2.5,
                borderRadius: "2px 2px 0 0",
              },
            }}
          >
            <Tab
              icon={<ClipboardCheck size={16} />}
              iconPosition="start"
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>Report Setup</span>
                  <Chip
                    label={`${disclosureFilledCount}/${MINIMUM_DISCLOSURES.length}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      bgcolor:
                        disclosureFilledCount === MINIMUM_DISCLOSURES.length
                          ? alpha("#10b981", 0.1)
                          : alpha("#94a3b8", 0.12),
                      color:
                        disclosureFilledCount === MINIMUM_DISCLOSURES.length
                          ? "#10b981"
                          : "text.secondary",
                    }}
                  />
                </Stack>
              }
            />
            <Tab
              icon={<Sparkles size={16} />}
              iconPosition="start"
              label="Generate Report"
            />
            {reportDraft && (
              <Tab
                icon={<FileText size={16} />}
                iconPosition="start"
                label="View Report"
              />
            )}
          </Tabs>
        </Box>

        {/* ━━ TAB 0: Report Setup ━━ */}
        {mainTab === 0 && !reportDraft && (
          <Box>
            {/* Setup header bar */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: `1px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, fontSize: "0.95rem" }}
                >
                  IFRS S1/S2 Minimum Disclosure Requirements
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.25, maxWidth: 580, fontSize: "0.8rem" }}
                >
                  Expand each pillar to assign data owners and complete
                  disclosure responses. All fields will be compiled into the
                  final report.
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="small"
                startIcon={<Save size={14} />}
                onClick={() => setAssignmentSaved(true)}
                sx={{
                  bgcolor: BRAND,
                  "&:hover": { bgcolor: BRAND, filter: "brightness(0.92)" },
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 0.8,
                  boxShadow: `0 2px 8px ${alpha(BRAND, 0.25)}`,
                }}
              >
                Save Progress
              </Button>
            </Box>

            {/* Progress bar */}
            <Box
              sx={{
                px: 3,
                py: 1.5,
                bgcolor: subtleBg,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  Overall Completion
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: BRAND }}
                >
                  {completionPct}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionPct}
                sx={{
                  height: 5,
                  borderRadius: 3,
                  bgcolor: alpha(BRAND, 0.08),
                  "& .MuiLinearProgress-bar": {
                    bgcolor: BRAND,
                    borderRadius: 3,
                    transition: "transform 0.4s ease",
                  },
                }}
              />
            </Box>

            {/* Pillar accordion sections */}
            {DISCLOSURE_PILLARS.map((pillar) => {
              const PillarIcon = PILLAR_ICONS[pillar] || Building2;
              const pillarColor = PILLAR_COLORS[pillar] || BRAND;
              const pillarItems = MINIMUM_DISCLOSURES.filter(
                (d) => d.pillar === pillar,
              );
              const filledInPillar = pillarItems.filter((d) =>
                disclosureResponses[d.id]?.trim(),
              ).length;
              const assignedInPillar = pillarItems.filter(
                (d) => disclosureAssignments[d.id],
              ).length;
              const isExpanded = expandedPillar === pillar;

              return (
                <Box key={pillar}>
                  {/* Pillar header — clickable accordion */}
                  <Box
                    onClick={() =>
                      setExpandedPillar(isExpanded ? null : pillar)
                    }
                    sx={{
                      px: 3,
                      py: 1.5,
                      cursor: "pointer",
                      bgcolor: isExpanded
                        ? alpha(pillarColor, isDark ? 0.06 : 0.025)
                        : "transparent",
                      borderBottom: `1px solid ${borderColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        bgcolor: alpha(pillarColor, isDark ? 0.08 : 0.035),
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: alpha(pillarColor, 0.1),
                          border: `1.5px solid ${alpha(pillarColor, 0.2)}`,
                        }}
                      >
                        <PillarIcon size={16} color={pillarColor} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, fontSize: "0.85rem" }}
                        >
                          {pillar}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontSize: "0.65rem",
                          }}
                        >
                          {PILLAR_REFS[pillar]}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="Assigned" arrow>
                        <Chip
                          icon={<User size={10} />}
                          label={`${assignedInPillar}/${pillarItems.length}`}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            bgcolor: alpha(
                              assignedInPillar === pillarItems.length
                                ? BRAND
                                : "#94a3b8",
                              0.08,
                            ),
                            color:
                              assignedInPillar === pillarItems.length
                                ? BRAND
                                : "text.secondary",
                            "& .MuiChip-icon": { ml: 0.5 },
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="Completed" arrow>
                        <Chip
                          icon={<CheckCircle2 size={10} />}
                          label={`${filledInPillar}/${pillarItems.length}`}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            bgcolor: alpha(
                              filledInPillar === pillarItems.length
                                ? "#10b981"
                                : "#94a3b8",
                              0.08,
                            ),
                            color:
                              filledInPillar === pillarItems.length
                                ? "#10b981"
                                : "text.secondary",
                            "& .MuiChip-icon": { ml: 0.5 },
                          }}
                        />
                      </Tooltip>
                      <IconButton size="small" sx={{ ml: 0.5 }}>
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </IconButton>
                    </Stack>
                  </Box>

                  {/* Disclosure items */}
                  <Collapse in={isExpanded}>
                    {pillarItems.map((disclosure, idx) => {
                      const isFilled =
                        disclosureResponses[disclosure.id]?.trim();
                      const isAssigned = disclosureAssignments[disclosure.id];

                      return (
                        <Box
                          key={disclosure.id}
                          sx={{
                            px: 3,
                            py: 2,
                            borderBottom:
                              idx < pillarItems.length - 1
                                ? `1px solid ${alpha(borderColor, 0.6)}`
                                : `1px solid ${borderColor}`,
                            bgcolor: isFilled
                              ? alpha("#10b981", isDark ? 0.02 : 0.01)
                              : "transparent",
                            transition: "background-color 0.2s ease",
                          }}
                        >
                          {/* Requirement header row */}
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 2,
                              mb: 1.5,
                            }}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                              >
                                <Box
                                  sx={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: "50%",
                                    bgcolor: isFilled
                                      ? "#10b981"
                                      : isAssigned
                                        ? "#f59e0b"
                                        : alpha("#94a3b8", 0.4),
                                    flexShrink: 0,
                                    mt: 0.2,
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 700,
                                    fontSize: "0.82rem",
                                    color: "text.primary",
                                  }}
                                >
                                  {disclosure.requirement}
                                </Typography>
                              </Stack>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  lineHeight: 1.5,
                                  display: "block",
                                  mt: 0.5,
                                  pl: 2,
                                  fontSize: "0.72rem",
                                }}
                              >
                                {disclosure.description}
                              </Typography>
                            </Box>

                            {/* Assignment + status */}
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              sx={{ flexShrink: 0, pt: 0.25 }}
                            >
                              <TextField
                                select
                                size="small"
                                label="Data Owner"
                                value={
                                  disclosureAssignments[disclosure.id] || ""
                                }
                                onChange={(e) =>
                                  assignDisclosure(
                                    disclosure.id,
                                    e.target.value,
                                  )
                                }
                                sx={{
                                  minWidth: 175,
                                  "& .MuiInputLabel-root": {
                                    fontSize: "0.75rem",
                                  },
                                  "& .MuiOutlinedInput-root": {
                                    borderRadius: 1.5,
                                    fontSize: "0.8rem",
                                  },
                                }}
                              >
                                <MenuItem value="">
                                  <em>Unassigned</em>
                                </MenuItem>
                                {dataOwnerUsers.map((u) => (
                                  <MenuItem key={u.email} value={u.name}>
                                    {u.name}
                                  </MenuItem>
                                ))}
                              </TextField>
                              {isFilled ? (
                                <Chip
                                  icon={<CheckCircle2 size={11} />}
                                  label="Done"
                                  size="small"
                                  sx={{
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    height: 24,
                                    bgcolor: alpha("#10b981", 0.08),
                                    color: "#10b981",
                                    border: `1px solid ${alpha("#10b981", 0.2)}`,
                                    "& .MuiChip-icon": { color: "#10b981" },
                                  }}
                                />
                              ) : (
                                <Chip
                                  icon={<Clock size={11} />}
                                  label="Pending"
                                  size="small"
                                  sx={{
                                    fontSize: "0.65rem",
                                    fontWeight: 600,
                                    height: 24,
                                    bgcolor: alpha("#94a3b8", 0.06),
                                    color: "text.secondary",
                                    border: `1px solid ${alpha("#94a3b8", 0.15)}`,
                                  }}
                                />
                              )}
                            </Stack>
                          </Box>

                          {/* Response text area */}
                          <Box sx={{ pl: 2 }}>
                            <TextField
                              fullWidth
                              multiline
                              rows={3}
                              size="small"
                              placeholder={`Provide the entity's response for "${disclosure.requirement}"...`}
                              value={disclosureResponses[disclosure.id] || ""}
                              onChange={(e) =>
                                updateDisclosureResponse(
                                  disclosure.id,
                                  e.target.value,
                                )
                              }
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  borderRadius: 2,
                                  fontSize: "0.82rem",
                                  lineHeight: 1.65,
                                  bgcolor: isDark
                                    ? alpha("#fff", 0.02)
                                    : alpha("#f8fafc", 0.6),
                                  "&:hover .MuiOutlinedInput-notchedOutline": {
                                    borderColor: alpha(BRAND, 0.3),
                                  },
                                  "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    {
                                      borderColor: BRAND,
                                      borderWidth: 1.5,
                                    },
                                },
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Collapse>
                </Box>
              );
            })}
          </Box>
        )}

        {/* ━━ TAB 1: Generate Report ━━ */}
        {mainTab === 1 && !reportDraft && (
          <Box sx={{ p: { xs: 3, md: 5 }, textAlign: "center" }}>
            {/* Readiness summary cards */}
            <Grid container spacing={2} sx={{ mb: 5, textAlign: "left" }}>
              {[
                {
                  label: "Disclosures Completed",
                  value: `${disclosureFilledCount} / ${MINIMUM_DISCLOSURES.length}`,
                  pct: completionPct,
                  color: "#10b981",
                  ready: completionPct >= 50,
                },
                {
                  label: "Data Owners Assigned",
                  value: `${disclosureAssignedCount} / ${MINIMUM_DISCLOSURES.length}`,
                  pct: Math.round(
                    (disclosureAssignedCount / MINIMUM_DISCLOSURES.length) *
                      100,
                  ),
                  color: BRAND,
                  ready: disclosureAssignedCount > 0,
                },
                {
                  label: "Material Topics",
                  value: `${selectedMaterialTopicIds.length} identified`,
                  pct: selectedMaterialTopicIds.length > 0 ? 100 : 0,
                  color: "#6366f1",
                  ready: selectedMaterialTopicIds.length > 0,
                },
                {
                  label: "GHG Emissions Data",
                  value:
                    totalEmissions > 0
                      ? `${formatNumber(totalEmissions)} tCO₂e`
                      : "Not calculated",
                  pct: totalEmissions > 0 ? 100 : 0,
                  color: "#0ea5e9",
                  ready: totalEmissions > 0,
                },
                {
                  label: "Scenario Analysis",
                  value:
                    scenarioResults.length > 0
                      ? `${scenarioResults.length} scenario(s)`
                      : "Pending",
                  pct: scenarioResults.length > 0 ? 100 : 0,
                  color: "#f59e0b",
                  ready: scenarioResults.length > 0,
                },
                {
                  label: "Data Templates",
                  value: `${templates.length} deployed`,
                  pct: templates.length > 0 ? 100 : 0,
                  color: "#ec4899",
                  ready: templates.length > 0,
                },
              ].map((item) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.label}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: `1px solid ${alpha(item.color, 0.12)}`,
                      bgcolor: alpha(item.color, isDark ? 0.04 : 0.02),
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    {item.ready ? (
                      <CheckCircle2 size={18} color={item.color} />
                    ) : (
                      <AlertCircle
                        size={18}
                        style={{ color: alpha("#94a3b8", 0.5) }}
                      />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 600,
                          color: "text.secondary",
                          fontSize: "0.65rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {item.label}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          color: item.ready ? item.color : "text.secondary",
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>

            {/* Generate CTA */}
            <Box
              sx={{
                maxWidth: 520,
                mx: "auto",
                py: 2,
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
                  mb: 2.5,
                  border: `1.5px solid ${alpha(BRAND, 0.15)}`,
                }}
              >
                <Sparkles size={28} color={BRAND} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Generate Disclosure Report
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "text.secondary",
                  maxWidth: 440,
                  mx: "auto",
                  mb: 2.5,
                  lineHeight: 1.6,
                }}
              >
                The AI engine will compile entity data, risk assessments,
                emissions calculations, scenario results, and your disclosure
                responses into a professionally formatted IFRS S1/S2 report.
              </Typography>

              {/* Year Selector */}
              <Box sx={{ mb: 3, maxWidth: 220, mx: "auto" }}>
                <TextField
                  select
                  fullWidth
                  label="Reporting Year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  }}
                >
                  {REPORT_YEAR_OPTIONS.map((y) => (
                    <MenuItem key={y} value={y}>
                      FY {y}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              {!canGenerate && (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#f59e0b",
                    mb: 2,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  Only Sustainability Managers and Admins can generate reports.
                  You can view the report once it has been generated.
                </Typography>
              )}

              {generating && (
                <Box sx={{ maxWidth: 380, mx: "auto", mb: 3 }}>
                  <LinearProgress
                    variant="determinate"
                    value={progress}
                    sx={{
                      height: 5,
                      borderRadius: 3,
                      bgcolor: alpha(BRAND, 0.08),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: BRAND,
                        borderRadius: 3,
                      },
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      mt: 1,
                      display: "block",
                      fontSize: "0.7rem",
                    }}
                  >
                    {progress < 25
                      ? "Compiling entity profile and value chain data..."
                      : progress < 50
                        ? "Analyzing risk register and materiality assessment..."
                        : progress < 75
                          ? "Calculating emissions and scenario results..."
                          : progress < 95
                            ? "Integrating minimum disclosure responses..."
                            : "Generating IFRS S1/S2 aligned narrative..."}
                  </Typography>
                </Box>
              )}

              <Button
                variant="contained"
                size="large"
                startIcon={
                  generating ? <Zap size={18} /> : <Sparkles size={18} />
                }
                onClick={generateReport}
                disabled={generating || !canGenerate}
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
                  "&.Mui-disabled": {
                    bgcolor: alpha(BRAND, 0.4),
                    color: alpha("#fff", 0.7),
                  },
                }}
              >
                {generating ? "Generating Report..." : "Generate Report"}
              </Button>
            </Box>
          </Box>
        )}

        {/* ━━ TAB 2 / Report View ━━ */}
        {reportDraft && (
          <Box>
            {/* Toolbar */}
            <Box
              sx={{
                px: 3,
                py: 2,
                borderBottom: `1px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<RotateCcw size={14} />}
                  onClick={() => {
                    setReportDraft("");
                    setMainTab(0);
                  }}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: alpha("#94a3b8", 0.3),
                    color: "text.secondary",
                  }}
                >
                  Back to Setup
                </Button>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Generated Report — {entityProfile.name}
                </Typography>
                {reportGeneratedBy && (
                  <Chip
                    icon={<User size={12} />}
                    label={`Generated by ${reportGeneratedBy}${reportYear ? ` • FY ${reportYear}` : ""}`}
                    size="small"
                    sx={{
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      height: 24,
                      bgcolor: alpha(BRAND, 0.08),
                      color: BRAND,
                      "& .MuiChip-icon": { color: BRAND },
                    }}
                  />
                )}
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Sparkles size={14} />}
                  onClick={generateReport}
                  disabled={generating || !canGenerate}
                  sx={{
                    bgcolor: BRAND,
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 2,
                    "&:hover": {
                      bgcolor: BRAND,
                      filter: "brightness(0.92)",
                    },
                  }}
                >
                  Regenerate
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ImagePlus size={14} />}
                  onClick={() => imageInputRef.current?.click()}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: alpha("#8b5cf6", 0.25),
                    color: "#8b5cf6",
                  }}
                >
                  Add Image
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Printer size={14} />}
                  onClick={() => window.print()}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: alpha(BRAND, 0.25),
                    color: BRAND,
                  }}
                >
                  Print
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Download size={14} />}
                  onClick={() => {
                    const doc = new jsPDF({ unit: "pt", format: "a4" });
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();
                    const margin = 50;
                    const maxLineWidth = pageWidth - margin * 2;
                    let y = margin;

                    const renderBlock = (
                      text: string,
                      fontSize: number,
                      bold: boolean,
                    ) => {
                      doc.setFont("helvetica", bold ? "bold" : "normal");
                      doc.setFontSize(fontSize);
                      const lineH = fontSize * 1.45;
                      const lines = doc.splitTextToSize(text, maxLineWidth);
                      (lines as string[]).forEach((line) => {
                        if (y + lineH > pageHeight - margin) {
                          doc.addPage();
                          y = margin;
                        }
                        doc.text(line, margin, y);
                        y += lineH;
                      });
                      y += fontSize * 0.35;
                    };

                    reportDraft.split("\n").forEach((line) => {
                      if (line.startsWith("# ")) {
                        renderBlock(line.replace(/^#\s+/, ""), 16, true);
                      } else if (line.startsWith("## ")) {
                        renderBlock(line.replace(/^##\s+/, ""), 13, true);
                      } else if (line.startsWith("### ")) {
                        renderBlock(line.replace(/^###\s+/, ""), 11, true);
                      } else if (line.trim() === "") {
                        y += 8;
                      } else {
                        renderBlock(line, 10, false);
                      }
                    });

                    reportImages.forEach((img) => {
                      doc.addPage();
                      doc.addImage(
                        img.dataUrl,
                        margin,
                        margin,
                        maxLineWidth,
                        0,
                      );
                    });

                    doc.save(
                      `${entityProfile.name.replace(/\s+/g, "_")}_Sustainability_Report_${new Date().getFullYear()}.pdf`,
                    );
                  }}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    borderColor: alpha("#3b82f6", 0.25),
                    color: "#3b82f6",
                  }}
                >
                  Download
                </Button>
              </Stack>
            </Box>

            {/* Hidden file input for image upload */}
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />

            {/* Editable report body */}
            <Box sx={{ p: { xs: 3, md: 5 } }}>
              <TextField
                fullWidth
                multiline
                value={reportDraft}
                onChange={(e) => setReportDraft(e.target.value)}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: "0.85rem",
                    lineHeight: 1.8,
                    color: isDark ? alpha("#fff", 0.85) : "#1a1a1a",
                    borderRadius: 2,
                    bgcolor: isDark ? alpha("#fff", 0.02) : "#fff",
                    "& fieldset": {
                      borderColor: alpha(borderColor, 0.5),
                    },
                    "&:hover fieldset": {
                      borderColor: alpha(BRAND, 0.3),
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: BRAND,
                      borderWidth: 1.5,
                    },
                  },
                }}
                minRows={20}
              />

              {/* Attached images */}
              {reportImages.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1.5, fontSize: "0.85rem" }}
                  >
                    Attached Images ({reportImages.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {reportImages.map((img) => (
                      <Grid size={{ xs: 12, sm: 6, md: 4 }} key={img.id}>
                        <Paper
                          variant="outlined"
                          sx={{
                            borderRadius: 2,
                            overflow: "hidden",
                            position: "relative",
                            border: `1px solid ${borderColor}`,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => removeImage(img.id)}
                            sx={{
                              position: "absolute",
                              top: 6,
                              right: 6,
                              bgcolor: alpha("#ef4444", 0.85),
                              color: "#fff",
                              width: 24,
                              height: 24,
                              "&:hover": { bgcolor: "#ef4444" },
                            }}
                          >
                            <X size={14} />
                          </IconButton>
                          <Box
                            component="img"
                            src={img.dataUrl}
                            alt={img.name}
                            sx={{
                              width: "100%",
                              maxHeight: 260,
                              objectFit: "contain",
                              display: "block",
                              bgcolor: isDark ? alpha("#fff", 0.03) : "#f8fafc",
                            }}
                          />
                          <Box
                            sx={{
                              px: 1.5,
                              py: 1,
                              borderTop: `1px solid ${borderColor}`,
                            }}
                          >
                            <Typography
                              variant="caption"
                              noWrap
                              sx={{
                                fontSize: "0.7rem",
                                color: "text.secondary",
                              }}
                            >
                              {img.name}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={assignmentSaved}
        autoHideDuration={3000}
        onClose={() => setAssignmentSaved(false)}
        message="Report setup progress saved"
      />
    </Box>
  );
}
