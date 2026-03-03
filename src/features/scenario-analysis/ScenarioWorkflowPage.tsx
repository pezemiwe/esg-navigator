import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Fade,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DELOITTE_COLORS } from "@/config/colors.config";
import ScenarioLayout from "./layout/ScenarioLayout";
import { useCRAStatusStore } from "@/store/craStore";
import { useNavigate } from "react-router-dom";
import { Lock, Settings2, BarChart3, Wallet } from "lucide-react";
import PortfolioSelection from "./components/PortfolioSelection";
import ScenarioSelection from "./components/ScenarioSelection";
import AssumptionEditor from "./components/AssumptionEditor";
import ScenarioResults from "./components/ScenarioResults";
import { useScenarioStore } from "@/store/scenarioStore";
import { useIndustry } from "@/hooks/useIndustry";
export default function ScenarioAnalysisPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { activeScenario, resetScenario } = useScenarioStore();
  const { traReady, praReady } = useCRAStatusStore();
  const { isNonFinancial, industryName } = useIndustry();
  const [activeStep, setActiveStep] = useState(0);
  const hasPrerequisites = traReady || praReady;

  const steps = [
    {
      label: "Portfolio Selection",
      description: isNonFinancial
        ? `Define the scope of ${industryName.toLowerCase()} infrastructure assets for the analysis.`
        : "Define the scope of assets and sectors for the stress test.",
      icon: <Wallet size={18} />,
    },
    {
      label: "Scenario Definition",
      description:
        "Select a standard climate scenario (e.g., NGFS Net Zero 2050) or define custom parameters.",
      icon: <Settings2 size={18} />,
    },
    {
      label: "Refine Assumptions",
      description: isNonFinancial
        ? "Adjust WACC, carbon pricing, energy cost, and physical risk variables for sensitivity analysis."
        : "Adjust key economic and climate variables (Carbon Price, GDP Impact) for sensitivity analysis.",
      icon: <Settings2 size={18} />,
    },
    {
      label: "Run & Analyze",
      description: isNonFinancial
        ? "Execute the climate impact model and view projected NPV/FCF/EBITDA impacts."
        : "Execute the stress test model and view projected portfolio impacts.",
      icon: <BarChart3 size={18} />,
    },
  ];
  useEffect(() => {
    if (!activeScenario && activeStep > 1) {
      const t = setTimeout(() => setActiveStep(1), 0);
      return () => clearTimeout(t);
    }
  }, [activeScenario, activeStep]);
  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  const handleReset = () => {
    resetScenario();
    setActiveStep(0);
  };
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <PortfolioSelection onNext={handleNext} />;
      case 1:
        return <ScenarioSelection onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <AssumptionEditor onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <ScenarioResults onRestart={handleReset} onBack={handleBack} />;
      default:
        return null;
    }
  };
  if (!hasPrerequisites) {
    return (
      <ScenarioLayout>
        <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              border: "1px dashed",
              borderColor: theme.palette.divider,
              borderRadius: 3,
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: theme.palette.action.selected,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <Lock size={32} color={theme.palette.text.secondary} />
            </Box>
            <Typography variant="h5" gutterBottom fontWeight={700}>
              Scenario Analysis Locked
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ maxWidth: 500, mx: "auto", mb: 4 }}
            >
              This advanced module relies on baseline risk data calculated in
              the Climate Risk Assessment (CRA) module. Please complete either
              the Transition Risk or Physical Risk assessment first.
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/cra/dashboard")}
              sx={{
                bgcolor: DELOITTE_COLORS.green.DEFAULT,
                "&:hover": { bgcolor: DELOITTE_COLORS.green.dark },
              }}
            >
              Go to CRA Module
            </Button>
          </Paper>
        </Container>
      </ScenarioLayout>
    );
  }
  return (
    <ScenarioLayout>
      <Box sx={{ bgcolor: theme.palette.background.default, width: "100%" }}>
        {activeStep < 3 && (
          <Box
            sx={{
              py: 4,
              px: 6,
              borderBottom: "1px solid",
              borderColor: theme.palette.divider,
              background: `linear-gradient(to rit, ${theme.palette.background.paper}, ${theme.palette.background.default})`,
            }}
          >
            <Container maxWidth="xl">
              <Box sx={{ maxWidth: 800 }}>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  gutterBottom
                  sx={{ color: DELOITTE_COLORS.slate.dark }}
                >
                  {isNonFinancial
                    ? `${industryName} Climate Scenario Analysis`
                    : "Climate Scenario Analysis"}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {isNonFinancial
                    ? `Model the climate impact on ${industryName.toLowerCase()} infrastructure assets. Select an NGFS scenario framework or define custom analysis parameters.`
                    : "Model the financial impact of future climate scenarios on your portfolio. Select a scenario framework (NGFS) or define custom stress-test parameters."}
                </Typography>
              </Box>
            </Container>
          </Box>
        )}
        <Container maxWidth="xl" sx={{ mt: 4, pb: 8 }}>
          <Box sx={{ mb: 4, px: 1 }}>
            <Stepper activeStep={activeStep} orientation="horizontal">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>
                    <Typography
                      variant="subtitle2"
                      fontWeight={activeStep === index ? 700 : 400}
                    >
                      {step.label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
          <Fade in={true} key={activeStep}>
            <Box>{renderStepContent(activeStep)}</Box>
          </Fade>
        </Container>
      </Box>
    </ScenarioLayout>
  );
}
