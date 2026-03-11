import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Tab,
  Tabs,
  TextField,
  Stack,
  Button,
  Chip,
  alpha,
  useTheme,
  Divider,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Building2,
  TrendingUp,
  ShieldAlert,
  BarChart3,
  Save,
  CheckCircle2,
} from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";

const BRAND = DELOITTE_COLORS.green.DEFAULT;

const SECTIONS = [
  {
    id: "governance",
    label: "Governance",
    icon: Building2,
    ifrsRef: "IFRS S1 §14–22 / IFRS S2 §5–9",
    guidance:
      "Describe the governance processes, controls and procedures used to monitor and manage sustainability-related risks and opportunities. Include the role of the board and management.",
    fields: [
      {
        key: "governance",
        label: "Governance Narrative",
        placeholder:
          "Describe board oversight of sustainability risks, committee mandates, management accountability structures…",
        rows: 6,
      },
    ],
  },
  {
    id: "strategy",
    label: "Strategy",
    icon: TrendingUp,
    ifrsRef: "IFRS S1 §23–32 / IFRS S2 §10–23",
    guidance:
      "Disclose the sustainability-related risks and opportunities that could reasonably affect your business model, strategy and financial planning over the short, medium and long term.",
    fields: [
      {
        key: "strategy",
        label: "Strategy Narrative",
        placeholder:
          "Describe how sustainability risks/opportunities are integrated into strategy, scenario analysis outcomes, resilience of business model…",
        rows: 6,
      },
    ],
  },
  {
    id: "riskManagement",
    label: "Risk Management",
    icon: ShieldAlert,
    ifrsRef: "IFRS S1 §33–38 / IFRS S2 §24–27",
    guidance:
      "Explain the processes used to identify, assess, prioritise and monitor sustainability-related risks and opportunities, and how these processes are integrated into overall risk management.",
    fields: [
      {
        key: "riskManagement",
        label: "Risk Management Narrative",
        placeholder:
          "Describe identification/assessment processes, prioritisation criteria, integration into enterprise risk management (ERM)…",
        rows: 6,
      },
    ],
  },
  {
    id: "metricsTargets",
    label: "Metrics & Targets",
    icon: BarChart3,
    ifrsRef: "IFRS S1 §39–49 / IFRS S2 §28–41",
    guidance:
      "Disclose the metrics and targets used to assess and manage material sustainability-related risks and opportunities. Include cross-industry and industry-based metrics.",
    fields: [
      {
        key: "metricsTargets",
        label: "Metrics & Targets Narrative",
        placeholder:
          "List quantitative metrics (Scope 1/2/3 emissions, water intensity, Board diversity %, etc.), current performance, and targets with timelines…",
        rows: 6,
      },
    ],
  },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

export default function ReportSetup() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [activeTab, setActiveTab] = useState(0);
  const [saved, setSaved] = useState(false);

  const { reportSetup, updateReportSetup } = useSustainabilityStore(
    useShallow((s) => ({
      reportSetup: s.reportSetup,
      updateReportSetup: s.updateReportSetup,
    })),
  );

  const cardBg = isDark ? alpha("#fff", 0.04) : "#FFFFFF";
  const borderColor = isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06);

  const currentSection = SECTIONS[activeTab];
  const completedCount = SECTIONS.filter(
    (s) =>
      reportSetup[s.id as keyof typeof reportSetup]?.toString().trim().length >
      0,
  ).length;

  const handleSave = () => {
    setSaved(true);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1100, mx: "auto" }}>
      {/* Header */}
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
          IFRS S1 / S2 DISCLOSURE
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mt: 0.5,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Report Setup
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5, maxWidth: 600 }}
            >
              Prepare your IFRS S1/S2 sustainability disclosure using the four
              core pillars. Complete each section to generate your disclosure
              package.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Chip
              label={`${completedCount} / ${SECTIONS.length} sections complete`}
              size="small"
              sx={{
                bgcolor:
                  completedCount === SECTIONS.length
                    ? alpha(BRAND, 0.1)
                    : alpha("#f59e0b", 0.1),
                color: completedCount === SECTIONS.length ? BRAND : "#f59e0b",
                fontWeight: 700,
                borderRadius: 1.5,
              }}
            />
            <Button
              variant="contained"
              size="small"
              startIcon={<Save size={14} />}
              onClick={handleSave}
              sx={{
                bgcolor: BRAND,
                "&:hover": { bgcolor: BRAND, filter: "brightness(0.9)" },
                borderRadius: 1.5,
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
              }}
            >
              Save Draft
            </Button>
          </Box>
        </Box>
      </Box>

      {/* IFRS pillar tab navigation */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          bgcolor: cardBg,
          border: `1px solid ${borderColor}`,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: `1px solid ${borderColor}`,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              minHeight: 56,
            },
            "& .Mui-selected": { color: BRAND, fontWeight: 700 },
            "& .MuiTabs-indicator": { bgcolor: BRAND },
          }}
        >
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isComplete =
              reportSetup[section.id as keyof typeof reportSetup]
                ?.toString()
                .trim().length > 0;
            return (
              <Tab
                key={section.id}
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Icon size={15} />
                    {section.label}
                    {isComplete && <CheckCircle2 size={13} color={BRAND} />}
                  </Box>
                }
              />
            );
          })}
        </Tabs>

        {/* Section content */}
        <Box sx={{ p: 3 }}>
          {/* IFRS reference banner */}
          <Alert
            severity="info"
            icon={false}
            sx={{
              mb: 3,
              borderRadius: 1.5,
              bgcolor: alpha(BRAND, 0.05),
              border: `1px solid ${alpha(BRAND, 0.15)}`,
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Typography variant="body2" sx={{ color: "text.primary" }}>
                {currentSection.guidance}
              </Typography>
              <Chip
                label={currentSection.ifrsRef}
                size="small"
                sx={{
                  bgcolor: alpha(BRAND, 0.1),
                  color: BRAND,
                  fontWeight: 700,
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
            </Box>
          </Alert>

          <Stack spacing={3}>
            {currentSection.fields.map((field) => {
              const fieldKey = field.key as SectionId;
              return (
                <Box key={field.key}>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    {field.label}
                  </Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={field.rows}
                    placeholder={field.placeholder}
                    value={
                      (reportSetup[
                        fieldKey as keyof typeof reportSetup
                      ] as string) ?? ""
                    }
                    onChange={(e) =>
                      updateReportSetup({ [fieldKey]: e.target.value })
                    }
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        fontSize: "0.875rem",
                        lineHeight: 1.7,
                      },
                    }}
                  />
                </Box>
              );
            })}

            <Divider />

            {/* Document upload placeholder */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Supporting Documents
              </Typography>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  p: 3,
                  borderRadius: 1.5,
                  borderStyle: "dashed",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: BRAND },
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Drag & drop files here, or click to select
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Accepted: PDF, DOCX, XLSX — max 20 MB each
                </Typography>
              </Paper>
            </Box>

            {/* Navigation buttons */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pt: 1,
              }}
            >
              <Button
                variant="outlined"
                size="small"
                disabled={activeTab === 0}
                onClick={() => setActiveTab((t) => t - 1)}
                sx={{
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 600,
                  borderColor: BRAND,
                  color: BRAND,
                  "&:hover": {
                    borderColor: BRAND,
                    bgcolor: alpha(BRAND, 0.05),
                  },
                }}
              >
                ← Previous
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={activeTab === SECTIONS.length - 1}
                onClick={() => setActiveTab((t) => t + 1)}
                sx={{
                  bgcolor: BRAND,
                  "&:hover": { bgcolor: BRAND, filter: "brightness(0.9)" },
                  borderRadius: 1.5,
                  textTransform: "none",
                  fontWeight: 700,
                  "&.Mui-disabled": {
                    bgcolor: alpha(BRAND, 0.3),
                    color: "#fff",
                  },
                }}
              >
                Next →
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>

      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          onClose={() => setSaved(false)}
          sx={{ borderRadius: 1.5 }}
        >
          Draft saved successfully
        </Alert>
      </Snackbar>
    </Box>
  );
}
