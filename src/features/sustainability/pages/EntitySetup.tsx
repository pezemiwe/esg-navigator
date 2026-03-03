import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Chip,
  Stack,
  Button,
  alpha,
  useTheme,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stepper,
  Step,
  StepLabel,
  Avatar,
  Fade,
  InputAdornment,
  Alert,
  Snackbar,
  Tooltip,
  OutlinedInput,
  Checkbox,
  ListItemText,
  FormHelperText,
} from "@mui/material";
import {
  Landmark,
  Factory,
  PieChart,
  Network,
  ArrowLeft,
  ArrowRight,
  Activity,
  Info as InfoIcon,
  CheckCircle2,
  Users,
  ClipboardCheck,
  Edit2,
} from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import { SASB_TAXONOMY, SASB_MATERIALITY_TOPICS } from "@/config/sasb.config";
import {
  SAMPLE_INTERNAL_RISKS,
  SAMPLE_EXTERNAL_RISKS,
  SAMPLE_ERM_RISKS,
  SAMPLE_ISSB_RISKS,
  SAMPLE_REGULATOR_RISKS,
} from "@/config/sampleRisks";

type SasbMaterialityTopics = Record<string, Record<string, string[]>>;

const BRAND = DELOITTE_COLORS.green.DEFAULT;

const countryStateMap: Record<string, string[]> = {
  Nigeria: [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT - Abuja",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ],
  Ghana: [
    "Ashanti",
    "Ahafo",
    "Bono",
    "Bono East",
    "Central",
    "Eastern",
    "Greater Accra",
    "North East",
    "Northern",
    "Oti",
    "Savannah",
    "Upper East",
    "Upper West",
    "Volta",
    "Western",
    "Western North",
  ],
};

const steps = [
  {
    label: "Corporate Identity",
    description: "Establish your entity's legal and reporting profile.",
    icon: Landmark,
    tooltip:
      "Your corporate identity establishes the legal boundaries for your ESG disclosures, ensuring alignment with baseline IFRS requirements.",
  },
  {
    label: "Industry & Materiality",
    description: "Map your operations to SASB standards to identify risks.",
    icon: Factory,
    tooltip:
      "Accurately selecting your SASB sector automatically detects the material topics your investors and regulators care about most.",
  },
  {
    label: "Operational Scale",
    description: "Define the magnitude of your operations and impact.",
    icon: PieChart,
    tooltip:
      "Financial and employee data contextualizes your environmental and social footprint, enabling accurate intensity metric calculations.",
  },
  {
    label: "Value Chain",
    description: "Map upstream and downstream activities.",
    icon: Network,
    tooltip:
      "Tracing your full value chain is a mandatory IFRS S2 requirement to accurately measure Scope 3 emissions.",
  },
  {
    label: "Review & Submit",
    description:
      "Verify your entity profile before proceeding to Risk Register.",
    icon: ClipboardCheck,
    tooltip:
      "Final validation step to ensure all parameters are securely configured before locking the initial risk framework.",
  },
];

interface TagInputProps {
  label: string;
  items: string[];
  value: string;
  setValue: (value: string) => void;
  onAdd: () => void;
  onRemove: (value: string) => void;
  placeholder: string;
}

const TagInput = ({
  label,
  items,
  value,
  setValue,
  onAdd,
  onRemove,
  placeholder,
}: TagInputProps) => {
  const theme = useTheme();

  return (
    <Box>
      <Typography
        variant="caption"
        fontWeight={600}
        color="text.secondary"
        gutterBottom
        display="block"
        sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          p: 2,
          border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          borderRadius: 1,
          bgcolor: alpha(theme.palette.background.paper, 0.5),
          transition: "border-color 0.2s",
          "&:hover": {
            borderColor: theme.palette.text.secondary,
          },
          "&:focus-within": {
            borderColor: BRAND,
            boxShadow: `0 0 0 2px ${alpha(BRAND, 0.1)}`,
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          gap={1}
          mb={items.length > 0 ? 1.5 : 0}
        >
          {items.map((item: string) => (
            <Chip
              key={item}
              label={item}
              onDelete={() => onRemove(item)}
              size="small"
              sx={{
                borderRadius: 1.5,
                bgcolor: alpha(BRAND, 0.08),
                color: BRAND,
                fontWeight: 600,
                border: "none",
              }}
            />
          ))}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <input
            placeholder={placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), onAdd())
            }
            onBlur={() => {
              if (value.trim()) onAdd();
            }}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "0.875rem",
              color: theme.palette.text.primary,
              minWidth: 0,
            }}
          />
          <Button
            size="small"
            onClick={onAdd}
            disabled={!value.trim()}
            sx={{
              minWidth: "auto",
              px: 1.5,
              textTransform: "none",
              fontWeight: 600,
              color: BRAND,
            }}
          >
            Add
          </Button>
        </Stack>
      </Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 0.5, display: "block" }}
      >
        Press <b>Enter</b> to add a tag
      </Typography>
    </Box>
  );
};

export default function EntitySetup() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { entityProfile, setEntityProfile, setRisks } = useSustainabilityStore(
    useShallow((state) => ({
      entityProfile: state.entityProfile,
      setEntityProfile: state.setEntityProfile,
      setRisks: state.setRisks,
    })),
  );
  const [activeStep, setActiveStep] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const [newService, setNewService] = useState("");
  const [newUpstream, setNewUpstream] = useState("");
  const [newMidstream, setNewMidstream] = useState("");
  const [newDownstream, setNewDownstream] = useState("");
  const [newGeo, setNewGeo] = useState("");

  const isFinancial = entityProfile.sasbSector === "Financials";

  const countries = ["Nigeria", "Ghana"];

  const states = useMemo(() => {
    const hqCountries = entityProfile.hqCountries;
    if (!hqCountries || hqCountries.length === 0) return [];
    const available = hqCountries.flatMap(
      (country) => countryStateMap[country] || [],
    );
    return [...new Set(available)].sort();
  }, [entityProfile]);

  const availableIndustries = useMemo(() => {
    if (!entityProfile.sasbSector) return [];
    return (
      SASB_TAXONOMY.find((s) => s.name === entityProfile.sasbSector)
        ?.industries || []
    );
  }, [entityProfile.sasbSector]);

  const recommendedTopics = useMemo(() => {
    if (!entityProfile.sasbSector || !entityProfile.sasbIndustry) return [];
    const sectorTopics = (SASB_MATERIALITY_TOPICS as SasbMaterialityTopics)[
      entityProfile.sasbSector
    ];
    return sectorTopics?.[entityProfile.sasbIndustry] || [];
  }, [entityProfile.sasbSector, entityProfile.sasbIndustry]);

  // Handlers
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleSave = () => {
    // Generate SASB Risks from detected pattern
    const sasbRisks = recommendedTopics.map((topic, index) => ({
      id: `sasb-${Date.now()}-${index}`,
      name: topic,
      category: "Materiality",
      subcategory: entityProfile.sasbIndustry || "General",
      impact: Math.floor(Math.random() * 5) + 1,
      likelihood: Math.floor(Math.random() * 5) + 1,
      financialEffect: "Medium",
      timeHorizon: "Medium-term",
      source: "sasb" as const,
    }));

    const allRisks = [
      ...sasbRisks,
      ...SAMPLE_INTERNAL_RISKS,
      ...SAMPLE_EXTERNAL_RISKS,
      ...SAMPLE_ERM_RISKS,
      ...SAMPLE_ISSB_RISKS,
      ...SAMPLE_REGULATOR_RISKS,
    ];

    setRisks(allRisks);

    setEntityProfile({ completed: true });
    setShowToast(true);
    setTimeout(() => {
      navigate("/sustainability/risks");
    }, 1500);
  };
  const handleCloseToast = () => setShowToast(false);

  const handleAddItem = (
    field:
      | "coreServices"
      | "upstreamActivities"
      | "midstreamActivities"
      | "downstreamActivities"
      | "geographicExposure",
    value: string,
    setter: (v: string) => void,
  ) => {
    if (!value.trim()) return;
    const current = entityProfile[field] as string[];
    if (!current.includes(value.trim())) {
      setEntityProfile({ [field]: [...current, value.trim()] });
    }
    setter("");
  };

  const handleRemoveItem = (
    field:
      | "coreServices"
      | "upstreamActivities"
      | "midstreamActivities"
      | "downstreamActivities"
      | "geographicExposure",
    value: string,
  ) => {
    const current = entityProfile[field] as string[];
    setEntityProfile({ [field]: current.filter((i) => i !== value) });
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        bgcolor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          pt: 4,
          pb: 2,
          px: 4,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box maxWidth="lg" mx="auto">
          <Box mb={3} textAlign="center">
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Entity Profile Setup
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configure your entity parameters for IFRS S1/S2 & SASB compliance.
            </Typography>
          </Box>

          <Stepper
            activeStep={activeStep}
            alternativeLabel
            sx={{
              "& .MuiStepConnector-root": {
                top: 18,
              },
            }}
          >
            {steps.map((step) => (
              <Step key={step.label}>
                <StepLabel
                  StepIconComponent={(props) => (
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        bgcolor: props.active
                          ? BRAND
                          : props.completed
                            ? alpha(BRAND, 0.2)
                            : alpha(theme.palette.action.disabled, 0.1),
                        color: props.active
                          ? "#fff"
                          : props.completed
                            ? BRAND
                            : theme.palette.text.disabled,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: props.active
                          ? `4px solid ${alpha(BRAND, 0.2)}`
                          : "none",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {props.completed ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <step.icon size={18} />
                      )}
                    </Box>
                  )}
                >
                  {step.label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 4,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Fade in key={activeStep} timeout={500}>
          <Paper
            elevation={0}
            variant="outlined"
            sx={{
              maxWidth: 900,
              mx: "auto",
              borderRadius: 1,
              overflow: "hidden",
              bgcolor: theme.palette.background.paper,
            }}
          >
            <Box
              sx={{
                p: 3,
                borderBottom: `1px solid ${theme.palette.divider}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {steps[activeStep].label}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {steps[activeStep].description}
                </Typography>
              </Box>

              <Tooltip title={steps[activeStep].tooltip} arrow placement="left">
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    bgcolor: alpha(BRAND, 0.08),
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    cursor: "pointer",
                  }}
                >
                  <InfoIcon size={14} color={BRAND} />
                  <Typography variant="caption" fontWeight={600} color={BRAND}>
                    Why this matters
                  </Typography>
                </Box>
              </Tooltip>
            </Box>

            <Box sx={{ p: 4 }}>
              {activeStep === 0 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="text.secondary"
                      gutterBottom
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        mb: 2,
                      }}
                    >
                      Legal Identity
                    </Typography>
                    <Stack spacing={4}>
                      <TextField
                        fullWidth
                        label="Entity Legal Name"
                        variant="outlined"
                        value={entityProfile.name}
                        onChange={(e) =>
                          setEntityProfile({ name: e.target.value })
                        }
                        placeholder="e.g. Global City Bank Plc"
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: 1 },
                        }}
                      />
                      <FormControl fullWidth>
                        <InputLabel id="hq-country-label">Countries</InputLabel>
                        <Select
                          labelId="hq-country-label"
                          multiple
                          value={entityProfile.hqCountries || []}
                          onChange={(e) => {
                            const value = e.target.value as string[];
                            if (value.includes("clear-all")) {
                              setEntityProfile({
                                hqCountries: [],
                                hqStates: [],
                              });
                              return;
                            }

                            const selectedCountries = value.filter(
                              (v) => v !== "clear-all",
                            );

                            const validStates = selectedCountries.flatMap(
                              (country: string) =>
                                countryStateMap[country] || [],
                            );
                            const newStates = (
                              entityProfile.hqStates || []
                            ).filter((state: string) =>
                              validStates.includes(state),
                            );

                            setEntityProfile({
                              hqCountries: selectedCountries,
                              hqStates: newStates,
                            });
                          }}
                          input={
                            <OutlinedInput
                              label="Countries"
                              sx={{ borderRadius: 1 }}
                            />
                          }
                          renderValue={(selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {(entityProfile.hqCountries?.length || 0) > 0 && (
                            <MenuItem
                              value="clear-all"
                              sx={{ fontStyle: "italic", opacity: 0.7 }}
                            >
                              <ListItemText primary="Clear All Selections" />
                            </MenuItem>
                          )}
                          {countries.map((name) => (
                            <MenuItem key={name} value={name}>
                              <Checkbox
                                checked={
                                  (entityProfile.hqCountries || []).indexOf(
                                    name,
                                  ) > -1
                                }
                              />
                              <ListItemText primary={name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth>
                        <InputLabel id="hq-state-label">
                          States / Regions
                        </InputLabel>
                        <Select
                          labelId="hq-state-label"
                          multiple
                          value={entityProfile.hqStates || []}
                          onChange={(e) => {
                            const value = e.target.value as string[];
                            if (value.includes("clear-all")) {
                              setEntityProfile({ hqStates: [] });
                              return;
                            }

                            setEntityProfile({
                              hqStates: value.filter((v) => v !== "clear-all"),
                            });
                          }}
                          input={
                            <OutlinedInput
                              label="States / Regions"
                              sx={{ borderRadius: 1 }}
                            />
                          }
                          renderValue={(selected) => (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                              }}
                            >
                              {selected.map((value) => (
                                <Chip key={value} label={value} size="small" />
                              ))}
                            </Box>
                          )}
                        >
                          {(entityProfile.hqStates?.length || 0) > 0 && (
                            <MenuItem
                              value="clear-all"
                              sx={{ fontStyle: "italic", opacity: 0.7 }}
                            >
                              <ListItemText primary="Clear All Selections" />
                            </MenuItem>
                          )}
                          {states.map((name) => (
                            <MenuItem key={name} value={name}>
                              <Checkbox
                                checked={
                                  (entityProfile.hqStates || []).indexOf(name) >
                                  -1
                                }
                              />
                              <ListItemText primary={name} />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Section: Business Overview */}
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="text.secondary"
                      gutterBottom
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        mb: 2,
                      }}
                    >
                      Business Overview
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={12}
                      label="Business Description"
                      placeholder="Provide a detailed description of the entity's main business activities (approx. 500 words)..."
                      value={entityProfile.description}
                      onChange={(e) =>
                        setEntityProfile({ description: e.target.value })
                      }
                      sx={{
                        "& .MuiOutlinedInput-root": { borderRadius: 1 },
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mt: 0.5,
                      }}
                    >
                      <FormHelperText sx={{ mt: 0 }}>
                        Comprehensive description used for automated report
                        introductions.
                      </FormHelperText>
                      <FormHelperText
                        sx={{
                          mt: 0,
                          textAlign: "right",
                          color:
                            (entityProfile.description?.trim().split(/\s+/)
                              .length || 0) > 500
                              ? "error.main"
                              : "text.secondary",
                        }}
                      >
                        Word Count:{" "}
                        {entityProfile.description
                          ? entityProfile.description
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean).length
                          : 0}{" "}
                        / 500
                      </FormHelperText>
                    </Box>
                  </Box>
                </Stack>
              )}

              {activeStep === 1 && (
                <Stack spacing={4}>
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    color="text.secondary"
                    gutterBottom
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      mb: 2,
                    }}
                  >
                    Sector Classification (SASB / SICS)
                  </Typography>

                  <Stack spacing={4}>
                    <FormControl fullWidth sx={{ width: "100%" }}>
                      <InputLabel>Primary Sector</InputLabel>
                      <Select
                        value={entityProfile.sasbSector || ""}
                        label="Primary Sector"
                        onChange={(e) =>
                          setEntityProfile({
                            sasbSector: e.target.value,
                            sasbIndustry: undefined,
                          })
                        }
                        sx={{ borderRadius: 1 }}
                        fullWidth
                      >
                        {SASB_TAXONOMY.map((s) => (
                          <MenuItem key={s.name} value={s.name}>
                            {s.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl
                      fullWidth
                      disabled={!entityProfile.sasbSector}
                      sx={{ width: "100%" }}
                    >
                      <InputLabel>Industry</InputLabel>
                      <Select
                        value={entityProfile.sasbIndustry || ""}
                        label="Industry"
                        onChange={(e) =>
                          setEntityProfile({ sasbIndustry: e.target.value })
                        }
                        sx={{ borderRadius: 1 }}
                        fullWidth
                      >
                        {availableIndustries.map((i) => (
                          <MenuItem key={i} value={i}>
                            {i}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>

                  {entityProfile.sasbIndustry && (
                    <Fade in>
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 2,
                          p: 3,
                          borderRadius: 1,
                          border: `1px solid ${alpha(BRAND, 0.2)}`,
                          background: `linear-gradient(135deg, ${alpha(
                            BRAND,
                            0.05,
                          )} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                        }}
                      >
                        <Box
                          display="flex"
                          alignItems="center"
                          gap={1.5}
                          mb={2}
                        >
                          <Factory size={18} color={BRAND} />
                          <Typography variant="subtitle1" fontWeight={700}>
                            Detected Materiality Pattern
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mb={2}
                        >
                          Entities in{" "}
                          <strong>{entityProfile.sasbIndustry}</strong>{" "}
                          typically disclose on:
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {recommendedTopics.map((topic) => (
                            <Chip
                              key={topic}
                              label={topic}
                              size="small"
                              sx={{
                                bgcolor: "background.paper",
                                border: `1px solid ${theme.palette.divider}`,
                                fontWeight: 500,
                              }}
                            />
                          ))}
                        </Box>
                      </Paper>
                    </Fade>
                  )}

                  <Divider sx={{ my: 2 }} />

                  <TagInput
                    label="Core Products & Services"
                    items={entityProfile.coreServices}
                    value={newService}
                    setValue={setNewService}
                    onAdd={() =>
                      handleAddItem("coreServices", newService, setNewService)
                    }
                    onRemove={(v: string) =>
                      handleRemoveItem("coreServices", v)
                    }
                    placeholder="e.g. Retail Banking, Commercial Lending..."
                  />
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      fontWeight={700}
                    >
                      Quantitative Metrics
                    </Typography>
                    <Alert
                      severity="info"
                      sx={{
                        mt: 1,
                        borderRadius: 1,
                        border: "1px solid currentColor",
                      }}
                    >
                      {isFinancial
                        ? "Financial metrics are calibrated for Asset Management & Banking entities."
                        : "Standard corporate metrics selected based on your sector."}
                    </Alert>
                  </Box>

                  <Stack spacing={4}>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        {isFinancial
                          ? "Assets Under Management / Loan Book"
                          : "Annual Revenue"}
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder={
                          isFinancial ? "Total Assets Value" : "Gross Revenue"
                        }
                        value={
                          entityProfile.loanBook
                            ? entityProfile.loanBook.toLocaleString()
                            : ""
                        }
                        onChange={(e) => {
                          const rawVal = e.target.value.replace(/,/g, "");
                          if (!isNaN(Number(rawVal))) {
                            setEntityProfile({ loanBook: Number(rawVal) });
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <Typography color="text.secondary" mr={1}>
                              ₦
                            </Typography>
                          ),
                          sx: { borderRadius: 1 },
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Workforce Size
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Full Time Employees (FTE)"
                        value={
                          entityProfile.employees
                            ? entityProfile.employees.toLocaleString()
                            : ""
                        }
                        onChange={(e) => {
                          const rawVal = e.target.value.replace(/,/g, "");
                          if (!isNaN(Number(rawVal))) {
                            setEntityProfile({ employees: Number(rawVal) });
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Users size={16} />
                            </InputAdornment>
                          ),
                          sx: { borderRadius: 1 },
                        }}
                      />
                    </Box>
                  </Stack>

                  <Divider />

                  <Box>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      fontWeight={700}
                      display="block"
                      mb={2}
                    >
                      Operational Footprint
                    </Typography>
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="subtitle2" gutterBottom>
                          Facilities / Branches
                        </Typography>
                        <TextField
                          fullWidth
                          type="number"
                          value={entityProfile.branches || ""}
                          onChange={(e) =>
                            setEntityProfile({
                              branches: Number(e.target.value),
                            })
                          }
                          InputProps={{ sx: { borderRadius: 1 } }}
                          placeholder="Count"
                        />
                      </Box>
                      <Box>
                        <TagInput
                          label="Key Geographic Markets"
                          items={entityProfile.geographicExposure}
                          value={newGeo}
                          setValue={setNewGeo}
                          onAdd={() =>
                            handleAddItem(
                              "geographicExposure",
                              newGeo,
                              setNewGeo,
                            )
                          }
                          onRemove={(v: string) =>
                            handleRemoveItem("geographicExposure", v)
                          }
                          placeholder="Add country (e.g. Nigeria, Ghana)"
                        />
                      </Box>
                    </Stack>
                  </Box>
                </Stack>
              )}

              {activeStep === 3 && (
                <Stack spacing={4}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    Value Chain Mapping
                  </Typography>

                  <Stack spacing={4} sx={{ width: "100%" }}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 3, borderRadius: 1, width: "100%" }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={1.5}
                        mb={2}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }}
                        >
                          <ArrowLeft size={16} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Upstream
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        Activities involving suppliers, raw material sourcing,
                        and inbound logistics.
                      </Typography>
                      <TagInput
                        label="Sourcing & Logistics"
                        items={entityProfile.upstreamActivities}
                        value={newUpstream}
                        setValue={setNewUpstream}
                        onAdd={() =>
                          handleAddItem(
                            "upstreamActivities",
                            newUpstream,
                            setNewUpstream,
                          )
                        }
                        onRemove={(v: string) =>
                          handleRemoveItem("upstreamActivities", v)
                        }
                        placeholder="e.g. Procurement, Data Centers..."
                      />
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{ p: 3, borderRadius: 1, width: "100%" }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={1.5}
                        mb={2}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                          }}
                        >
                          <Activity size={16} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Midstream
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        Direct operational activities, manufacturing, internal
                        processing, and core value creation.
                      </Typography>
                      <TagInput
                        label="Core Operations"
                        items={entityProfile.midstreamActivities}
                        value={newMidstream}
                        setValue={setNewMidstream}
                        onAdd={() =>
                          handleAddItem(
                            "midstreamActivities",
                            newMidstream,
                            setNewMidstream,
                          )
                        }
                        onRemove={(v: string) =>
                          handleRemoveItem("midstreamActivities", v)
                        }
                        placeholder="e.g. Manufacturing, Assembly, Service Delivery..."
                      />
                    </Paper>

                    <Paper
                      variant="outlined"
                      sx={{ p: 3, borderRadius: 1, width: "100%" }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        gap={1.5}
                        mb={2}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.main,
                          }}
                        >
                          <ArrowRight size={16} />
                        </Avatar>
                        <Typography variant="subtitle1" fontWeight={700}>
                          Downstream
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        paragraph
                      >
                        Activities involving distribution, customer use, and
                        end-of-life impact.
                      </Typography>
                      <TagInput
                        label="Distribution & Use"
                        items={entityProfile.downstreamActivities}
                        value={newDownstream}
                        setValue={setNewDownstream}
                        onAdd={() =>
                          handleAddItem(
                            "downstreamActivities",
                            newDownstream,
                            setNewDownstream,
                          )
                        }
                        onRemove={(v: string) =>
                          handleRemoveItem("downstreamActivities", v)
                        }
                        placeholder="e.g. Customer Support, Recycling..."
                      />
                    </Paper>
                  </Stack>
                </Stack>
              )}

              {activeStep === 4 && (
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      fontWeight={700}
                    >
                      Summary Review
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Please review your entity profile configuration below
                      before proceeding.
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    {/* Entity Identity */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color={BRAND}
                        >
                          Corporate Identity
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Edit2 size={14} />}
                          onClick={() => setActiveStep(0)}
                        >
                          Edit
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Entity Legal Name
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {entityProfile.name || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Business Overview
                          </Typography>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {entityProfile.description || "N/A"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Sector Classification */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color={BRAND}
                        >
                          Industry & Materiality
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Edit2 size={14} />}
                          onClick={() => setActiveStep(1)}
                        >
                          Edit
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Sector
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {entityProfile.sasbSector || "N/A"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Typography variant="caption" color="text.secondary">
                            Industry
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {entityProfile.sasbIndustry || "N/A"}
                          </Typography>
                        </Grid>
                        {entityProfile.coreServices.length > 0 && (
                          <Grid size={{ xs: 12 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              display="block"
                              mb={0.5}
                            >
                              Core Products & Services
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              gap={1}
                            >
                              {entityProfile.coreServices.map((service) => (
                                <Chip
                                  key={service}
                                  label={service}
                                  size="small"
                                  sx={{ borderRadius: 1 }}
                                />
                              ))}
                            </Stack>
                          </Grid>
                        )}
                      </Grid>
                    </Paper>

                    {/* Operational Scale */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color={BRAND}
                        >
                          Operational Scale
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Edit2 size={14} />}
                          onClick={() => setActiveStep(2)}
                        >
                          Edit
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            {isFinancial ? "AUM / Loan Book" : "Annual Revenue"}
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            ₦{" "}
                            {entityProfile.loanBook
                              ? entityProfile.loanBook.toLocaleString()
                              : "0"}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Workforce Size
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {entityProfile.employees
                              ? entityProfile.employees.toLocaleString()
                              : "0"}{" "}
                            FTEs
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            Facilities / Branches
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {entityProfile.branches || "0"}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Value Chain */}
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 1 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          color={BRAND}
                        >
                          Value Chain Mapping
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<Edit2 size={14} />}
                          onClick={() => setActiveStep(3)}
                        >
                          Edit
                        </Button>
                      </Box>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mb={0.5}
                          >
                            Upstream
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            gap={1}
                          >
                            {entityProfile.upstreamActivities.length > 0 ? (
                              entityProfile.upstreamActivities.map((item) => (
                                <Chip
                                  key={item}
                                  label={item}
                                  size="small"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                None added
                              </Typography>
                            )}
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mb={0.5}
                          >
                            Midstream
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            gap={1}
                          >
                            {entityProfile.midstreamActivities.length > 0 ? (
                              entityProfile.midstreamActivities.map((item) => (
                                <Chip
                                  key={item}
                                  label={item}
                                  size="small"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                None added
                              </Typography>
                            )}
                          </Stack>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mb={0.5}
                          >
                            Downstream
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            gap={1}
                          >
                            {entityProfile.downstreamActivities.length > 0 ? (
                              entityProfile.downstreamActivities.map((item) => (
                                <Chip
                                  key={item}
                                  label={item}
                                  size="small"
                                  variant="outlined"
                                />
                              ))
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                None added
                              </Typography>
                            )}
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Stack>
                </Stack>
              )}
            </Box>

            {/* Footer */}
            <Box
              sx={{
                p: 3,
                borderTop: `1px solid ${theme.palette.divider}`,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                sx={{ fontWeight: 600 }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={
                  activeStep === steps.length - 1 ? handleSave : handleNext
                }
                disabled={
                  activeStep === 0
                    ? !entityProfile.name
                    : activeStep === 1
                      ? !entityProfile.sasbSector || !entityProfile.sasbIndustry
                      : activeStep === 2
                        ? !entityProfile.loanBook || !entityProfile.employees
                        : false
                }
                sx={{
                  px: 4,
                  borderRadius: 1,
                  bgcolor: BRAND,
                  fontWeight: 600,
                  "&:hover": { bgcolor: alpha(BRAND, 0.9) },
                }}
              >
                {activeStep === steps.length - 1
                  ? "Complete & Proceed to Risk Register"
                  : "Continue"}
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Box>

      {/* Snackbar Toast */}
      <Snackbar
        open={showToast}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity="success"
          sx={{ width: "100%" }}
        >
          Entity profile saved successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
