import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Stack,
  useTheme,
  Grid,
  alpha,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import {
  Check,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import {
  useScenarioStore,
  type ScenarioType,
  type HorizonType,
} from "@/store/scenarioStore";
interface ScenarioCardProps {
  title: string;
  description: string;
  type: ScenarioType;
  icon: React.ReactNode;
  color: string;
  features: string[];
  onSelect: () => void;
}
const ScenarioCard = ({
  title,
  description,
  type,
  icon,
  color,
  features,
  onSelect,
}: ScenarioCardProps) => {
  const theme = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.2s",
        borderColor: theme.palette.divider,
        "&:hover": {
          borderColor: color,
          boxShadow: `0 4px 20px ${alpha(color, 0.15)}`,
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              bgcolor: alpha(color, 0.1),
              color: color,
              mr: 2,
            }}
          >
            {icon}
          </Box>
          <Chip
            label={type.replace(/_/g, " ")}
            size="small"
            sx={{
              bgcolor: alpha(color, 0.1),
              color: color,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          />
        </Box>
        <Typography variant="h6" gutterBottom fontWeight={700}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3, flex: 1 }}
        >
          {description}
        </Typography>
        <Box sx={{ mb: 3 }}>
          {features.map((feature, i) => (
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              key={i}
              sx={{ mb: 1 }}
            >
              <Check size={14} color={color} />
              <Typography variant="caption" color="text.secondary">
                {feature}
              </Typography>
            </Stack>
          ))}
        </Box>
        <Button
          variant="contained"
          fullWidth
          onClick={onSelect}
          sx={{
            bgcolor: color,
            "&:hover": { bgcolor: alpha(color, 0.9) },
          }}
        >
          Select Scenario
        </Button>
      </CardContent>
    </Card>
  );
};
interface ScenarioSelectionProps {
  onNext: () => void;
  onBack?: () => void;
}
export default function ScenarioSelection({
  onNext,
  onBack,
}: ScenarioSelectionProps) {
  const { createScenario, runAllScenarios } = useScenarioStore();
  const [horizon, setHorizon] = useState<HorizonType>("medium");
  const [isBatchLoading, setIsBatchLoading] = React.useState(false);
  const handleSelect = (type: ScenarioType) => {
    createScenario(type, horizon);
    onNext();
  };
  const handleHorizonChange = (
    _event: React.MouseEvent<HTMLElement>,
    newHorizon: HorizonType,
  ) => {
    if (newHorizon !== null) {
      setHorizon(newHorizon);
    }
  };
  const handleRunAll = async () => {
    setIsBatchLoading(true);
    createScenario("orderly", "medium");
    await runAllScenarios();
    setIsBatchLoading(false);
    onNext();
  };
  return (
    <Box>
      <Box sx={{ mb: 2 }}>
        {onBack && (
          <Button
            startIcon={<ArrowLeft size={16} />}
            onClick={onBack}
            sx={{ color: "text.secondary", mb: 1 }}
          >
            Back to Portfolio
          </Button>
        )}
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Select Scenario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose a standard NGFS reference scenario or define a custom stress
            test.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={handleRunAll}
          disabled={isBatchLoading}
          startIcon={
            isBatchLoading ? (
              <CircularProgress size={16} />
            ) : (
              <TrendingUp size={16} />
            )
          }
        >
          {isBatchLoading ? "Running Batch..." : "Run Batch Analysis"}
        </Button>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Stack spacing={1} alignItems="center">
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <Calendar size={14} /> TIME HORIZON
          </Typography>
          <ToggleButtonGroup
            value={horizon}
            exclusive
            onChange={handleHorizonChange}
            aria-label="time horizon"
            size="small"
            color="primary"
          >
            <ToggleButton value="short">Short (1-3y)</ToggleButton>
            <ToggleButton value="medium">Medium (3-10y)</ToggleButton>
            <ToggleButton value="long">Long (10-30y)</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ScenarioCard
            title="Orderly Transition"
            description="NGFS Net Zero 2050: Climate policies are introduced early and become gradually more stringent. Both physical and transition risks are relatively subdued."
            type="orderly"
            icon={<ShieldCheck size={24} />}
            color={DELOITTE_COLORS.success}
            features={[
              "Net Zero 2050 aligned",
              "Smooth carbon price increase",
              "Low physical risk",
              "High transition urgency",
            ]}
            onSelect={() => handleSelect("orderly")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ScenarioCard
            title="Disorderly Transition"
            description="NGFS Delayed Transition: Late, disruptive, sudden and/or unanticipated policy action. Transition risks are high, physical risks are moderate."
            type="disorderly"
            icon={<AlertTriangle size={24} />}
            color={DELOITTE_COLORS.warning}
            features={[
              "Delayed Action (post-2030)",
              "Sharp carbon price hike",
              "Disruptive technology shifts",
              "High financial volatility",
            ]}
            onSelect={() => handleSelect("disorderly")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ScenarioCard
            title="Hot House World"
            description="NGFS Current Policies: Limited climate policies are implemented. Global warming exceeds 2.5°C, leading to severe physical risks and irreversible damage."
            type="hothouse"
            icon={<TrendingUp size={24} />}
            color={DELOITTE_COLORS.error}
            features={[
              "Current Policies continued",
              "3°C+ Temperature Rise",
              "Severe Weather Events",
              "Low Transition Risk",
            ]}
            onSelect={() => handleSelect("hothouse")}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <ScenarioCard
            title="Custom / User-Defined Scenario"
            description="Define your own custom stress test by manually adjusting Carbon Price, GDP Shock, and Physical Risk paths. Best for idiosyncratic stress testing."
            type="custom"
            icon={<ShieldCheck size={24} />}
            color={DELOITTE_COLORS.slate.DEFAULT}
            features={[
              "Fully Adjustable Parameters",
              "Test Specific Portfolio Sensitivities",
              "Reverse Stress Testing Capability",
            ]}
            onSelect={() => handleSelect("custom")}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
