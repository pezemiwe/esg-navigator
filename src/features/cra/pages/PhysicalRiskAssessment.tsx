import { useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  alpha,
  useTheme,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Settings,
  Upload,
  Search,
  Grid3x3,
  CloudLightning,
  Layers,
  BarChart3,
  Shield,
  Activity,
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import CRALayout from "../layout/CRALayout";
import CRANavigation from "../components/CRANavigation";
import { useCRAStatusStore, usePRARiskStore } from "@/store/craStore";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";
import { DELOITTE_COLORS } from "@/config/colors.config";

import StepSetup from "../steps/physical/StepSetup";
import StepFileUpload from "../steps/physical/StepFileUpload";
import StepRiskIdentification from "../steps/physical/StepRiskIdentification";
import StepRiskScreening from "../steps/physical/StepRiskScreening";
import StepHazardAssessment from "../steps/physical/StepHazardAssessment";
import StepEnrichment from "../steps/physical/StepEnrichment";
import StepRiskEvaluation from "../steps/physical/StepRiskEvaluation";
import StepRiskResponse from "../steps/physical/StepRiskResponse";
import StepMonitoring from "../steps/physical/StepMonitoring";
import StepExport from "../steps/physical/StepExport";

const STEPS = [
  { label: "Setup", shortLabel: "CFG", icon: Settings, phase: "Configure" },
  {
    label: "Asset Register",
    shortLabel: "AST",
    icon: Upload,
    phase: "Configure",
  },
  {
    label: "Risk Identification",
    shortLabel: "RID",
    icon: Search,
    phase: "Identify",
  },
  {
    label: "Risk Screening",
    shortLabel: "SCR",
    icon: Grid3x3,
    phase: "Identify",
  },
  {
    label: "Hazard Assessment",
    shortLabel: "HAZ",
    icon: CloudLightning,
    phase: "Assess",
  },
  { label: "Enrichment", shortLabel: "ENR", icon: Layers, phase: "Assess" },
  {
    label: "Risk Evaluation",
    shortLabel: "EVL",
    icon: BarChart3,
    phase: "Evaluate",
  },
  { label: "Risk Response", shortLabel: "RSP", icon: Shield, phase: "Respond" },
  { label: "Monitoring", shortLabel: "MON", icon: Activity, phase: "Monitor" },
  { label: "Export", shortLabel: "EXP", icon: Download, phase: "Report" },
];

const PHASES = [
  "Configure",
  "Identify",
  "Assess",
  "Evaluate",
  "Respond",
  "Monitor",
  "Report",
];

const PHASE_COLORS: Record<string, string> = {
  Configure: "#3B82F6",
  Identify: "#8B5CF6",
  Assess: "#F59E0B",
  Evaluate: "#EF4444",
  Respond: "#10B981",
  Monitor: "#06B6D4",
  Report: "#EC4899",
};

const STEP_COMPONENTS = [
  StepSetup,
  StepFileUpload,
  StepRiskIdentification,
  StepRiskScreening,
  StepHazardAssessment,
  StepEnrichment,
  StepRiskEvaluation,
  StepRiskResponse,
  StepMonitoring,
  StepExport,
];

export default function PhysicalRiskAssessment() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { setPRAReady } = useCRAStatusStore();
  const { setRiskResults } = usePRARiskStore();
  const {
    activeStep,
    config,
    mappedAssets,
    identifiedRisks,
    screening,
    hazardResults,
    results,
    setActiveStep,
  } = usePhysicalRiskStore();

  useEffect(() => {
    if (results.length > 0) {
      setPRAReady(true);
      setRiskResults({ physical: results.length });
    }
  }, [results.length, setPRAReady, setRiskResults]);

  const canProceed = (() => {
    switch (activeStep) {
      case 0:
        return config.companyName.length > 0 && config.sectorId.length > 0;
      case 1:
        return mappedAssets.length > 0;
      case 2:
        return identifiedRisks.length > 0;
      case 3:
        return screening.some((s) => s.risks.length > 0);
      case 4:
        return hazardResults.length > 0;
      case 5:
        return results.length > 0;
      default:
        return true;
    }
  })();

  const stepComplete = useMemo(() => {
    return [
      config.companyName.length > 0 && config.sectorId.length > 0,
      mappedAssets.length > 0,
      identifiedRisks.length > 0,
      screening.some((s) => s.risks.length > 0),
      hazardResults.length > 0,
      results.length > 0,
      results.length > 0,
      results.length > 0,
      results.length > 0,
      results.length > 0,
    ];
  }, [
    config,
    mappedAssets,
    identifiedRisks,
    screening,
    hazardResults,
    results,
  ]);

  const completedCount = stepComplete.filter(Boolean).length;
  const overallProgress = Math.round((completedCount / STEPS.length) * 100);

  const ActiveStepComponent = STEP_COMPONENTS[activeStep] ?? StepSetup;
  const currentPhase = STEPS[activeStep]?.phase ?? "Configure";
  const phaseColor =
    PHASE_COLORS[currentPhase] ?? DELOITTE_COLORS.green.DEFAULT;

  const railBg = isDark
    ? "linear-gradient(180deg, #0D1117 0%, #161B22 50%, #0D1117 100%)"
    : "linear-gradient(180deg, #FAFBFC 0%, #F0F2F5 50%, #FAFBFC 100%)";

  return (
    <CRALayout>
      <Box sx={{ display: "flex", minHeight: "calc(100vh - 72px)" }}>
        {/* ═══ Left Command Rail ═══ */}
        <Box
          sx={{
            width: 72,
            minWidth: 72,
            background: railBg,
            borderRight: `1px solid ${isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06)}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: 1.5,
            pb: 2,
            position: "sticky",
            top: 72,
            height: "calc(100vh - 72px)",
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": { width: 0 },
          }}
        >
          {/* Overall progress ring */}
          <Box
            sx={{
              position: "relative",
              width: 48,
              height: 48,
              mb: 1.5,
              flexShrink: 0,
            }}
          >
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke={isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06)}
                strokeWidth="3"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke={DELOITTE_COLORS.green.DEFAULT}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(overallProgress / 100) * 125.6} 125.6`}
                transform="rotate(-90 24 24)"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            </svg>
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: DELOITTE_COLORS.green.DEFAULT,
                }}
              >
                {overallProgress}%
              </Typography>
            </Box>
          </Box>

          {/* Divider */}
          <Box
            sx={{
              width: 32,
              height: 1,
              bgcolor: isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08),
              mb: 1,
              flexShrink: 0,
            }}
          />

          {/* Step buttons */}
          {STEPS.map((step, idx) => {
            const isActive = idx === activeStep;
            const isComplete = stepComplete[idx];
            const isReachable =
              idx <= activeStep || stepComplete[idx - 1] !== false;
            const StepIcon = step.icon;
            const sColor = PHASE_COLORS[step.phase] ?? "#fff";

            return (
              <Tooltip
                key={idx}
                title={`${idx + 1}. ${step.label}`}
                placement="right"
                arrow
              >
                <Box
                  onClick={() => {
                    if (isReachable) setActiveStep(idx);
                  }}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: isActive ? "14px" : "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: isReachable ? "pointer" : "default",
                    mb: 0.5,
                    flexShrink: 0,
                    position: "relative",
                    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                    opacity: isReachable ? 1 : 0.35,
                    bgcolor: isActive
                      ? alpha(sColor, 0.15)
                      : isComplete
                        ? alpha(DELOITTE_COLORS.green.DEFAULT, 0.08)
                        : "transparent",
                    border: isActive
                      ? `2px solid ${sColor}`
                      : "2px solid transparent",
                    boxShadow: isActive
                      ? `0 0 12px ${alpha(sColor, 0.3)}`
                      : "none",
                    "&:hover": isReachable
                      ? {
                          bgcolor: alpha(sColor, 0.1),
                          transform: "scale(1.08)",
                        }
                      : {},
                  }}
                >
                  {isComplete && !isActive ? (
                    <Check
                      size={16}
                      color={DELOITTE_COLORS.green.DEFAULT}
                      strokeWidth={3}
                    />
                  ) : !isReachable ? (
                    <Lock size={14} color={isDark ? "#555" : "#aaa"} />
                  ) : (
                    <StepIcon
                      size={16}
                      color={isActive ? sColor : isDark ? "#9CA3AF" : "#6B7280"}
                    />
                  )}
                  <Typography
                    sx={{
                      fontSize: 8,
                      fontWeight: isActive ? 800 : 600,
                      mt: 0.25,
                      color: isActive ? sColor : isDark ? "#9CA3AF" : "#6B7280",
                      letterSpacing: 0.5,
                      lineHeight: 1,
                    }}
                  >
                    {step.shortLabel}
                  </Typography>

                  {/* Active indicator bar */}
                  {isActive && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: -2,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 3,
                        height: 20,
                        borderRadius: "0 3px 3px 0",
                        bgcolor: sColor,
                        boxShadow: `0 0 8px ${alpha(sColor, 0.5)}`,
                      }}
                    />
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        {/* ═══ Main Content Area ═══ */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Top phase bar */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06)}`,
              bgcolor: isDark ? alpha("#0F1623", 0.6) : alpha("#FAFAFA", 0.9),
              backdropFilter: "blur(8px)",
              position: "sticky",
              top: 72,
              zIndex: 20,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* Phase breadcrumbs */}
              {PHASES.map((phase) => {
                const pColor = PHASE_COLORS[phase] ?? "#6B7280";
                const pSteps = STEPS.filter((s) => s.phase === phase);
                const pComplete = pSteps.every(
                  (_, i) => stepComplete[STEPS.indexOf(pSteps[i] ?? STEPS[0])],
                );
                const pActive = currentPhase === phase;

                return (
                  <Box
                    key={phase}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "8px",
                      fontSize: 11,
                      fontWeight: pActive ? 700 : 500,
                      letterSpacing: 0.3,
                      color: pActive ? pColor : isDark ? "#6B7280" : "#9CA3AF",
                      bgcolor: pActive ? alpha(pColor, 0.1) : "transparent",
                      border: pActive
                        ? `1px solid ${alpha(pColor, 0.3)}`
                        : "1px solid transparent",
                      transition: "all 0.2s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    {pComplete && <Check size={10} strokeWidth={3} />}
                    {phase}
                  </Box>
                );
              })}
            </Stack>

            <Typography
              variant="caption"
              sx={{ color: isDark ? "#6B7280" : "#9CA3AF", fontWeight: 600 }}
            >
              Step {activeStep + 1}/{STEPS.length}
            </Typography>
          </Box>

          {/* Step title bar */}
          <Box sx={{ px: 3, pt: 2, pb: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "8px",
                  bgcolor: alpha(phaseColor, 0.12),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {(() => {
                  const StIcon = STEPS[activeStep]?.icon ?? Settings;
                  return <StIcon size={15} color={phaseColor} />;
                })()}
              </Box>
              <Box>
                <Typography
                  variant="overline"
                  sx={{
                    color: phaseColor,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: 1.5,
                    lineHeight: 1,
                    display: "block",
                  }}
                >
                  {currentPhase}
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ lineHeight: 1.3, mt: 0.25 }}
                >
                  {STEPS[activeStep]?.label}
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Step content */}
          <Box sx={{ flex: 1, px: 3, pb: 12, maxWidth: 1400 }}>
            <Fade in key={activeStep} timeout={300}>
              <Box>
                <ActiveStepComponent />
              </Box>
            </Fade>
          </Box>

          {/* ═══ Bottom Navigation Bar ═══ */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              position: "sticky",
              bottom: 0,
              zIndex: 10,
              bgcolor: isDark ? alpha("#0F1623", 0.95) : alpha("#FFFFFF", 0.95),
              backdropFilter: "blur(12px)",
              borderTop: `1px solid ${isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06)}`,
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
            }}
          >
            {/* Progress bar */}
            <Box
              sx={{
                maxWidth: 1400,
                width: "100%",
                mx: "auto",
                height: 3,
                borderRadius: 2,
                bgcolor: isDark ? alpha("#fff", 0.04) : alpha("#000", 0.04),
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${((activeStep + (canProceed ? 1 : 0.5)) / STEPS.length) * 100}%`,
                  borderRadius: 2,
                  background: `linear-gradient(90deg, ${PHASE_COLORS.Configure}, ${phaseColor})`,
                  transition: "width 0.5s ease",
                }}
              />
            </Box>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ maxWidth: 1400, width: "100%", mx: "auto" }}
            >
              <Button
                variant="text"
                disabled={activeStep === 0}
                onClick={() => setActiveStep(activeStep - 1)}
                startIcon={<ChevronLeft size={16} />}
                sx={{
                  color: isDark ? "#9CA3AF" : "#6B7280",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: alpha(phaseColor, 0.08) },
                }}
              >
                {activeStep > 0 ? STEPS[activeStep - 1]?.label : "Back"}
              </Button>

              <Stack direction="row" spacing={0.5}>
                {STEPS.map((_, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: idx === activeStep ? 20 : 6,
                      height: 6,
                      borderRadius: 3,
                      bgcolor:
                        idx === activeStep
                          ? phaseColor
                          : stepComplete[idx]
                            ? DELOITTE_COLORS.green.DEFAULT
                            : isDark
                              ? alpha("#fff", 0.1)
                              : alpha("#000", 0.1),
                      transition: "all 0.3s ease",
                    }}
                  />
                ))}
              </Stack>

              <Button
                variant="text"
                disabled={!canProceed || activeStep === STEPS.length - 1}
                onClick={() => setActiveStep(activeStep + 1)}
                endIcon={<ChevronRight size={16} />}
                sx={{
                  color: canProceed
                    ? phaseColor
                    : isDark
                      ? "#4B5563"
                      : "#D1D5DB",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: alpha(phaseColor, 0.08) },
                }}
              >
                {activeStep < STEPS.length - 1
                  ? STEPS[activeStep + 1]?.label
                  : "Finish"}
              </Button>
            </Stack>

            <Box sx={{ maxWidth: 1400, width: "100%", mx: "auto" }}>
              <CRANavigation
                compact
                nextPath="/cra/transition-risk"
                nextLabel="Next: Transition Risk"
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </CRALayout>
  );
}
