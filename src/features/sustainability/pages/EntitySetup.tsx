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
  ListSubheader,
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { useMaterialityStore } from "@/store/materialityStore";
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
  const [expandedCountryGroups, setExpandedCountryGroups] = useState<
    Set<string>
  >(() => new Set(["Nigeria", "Ghana"]));
  const [newBranchState, setNewBranchState] = useState("");
  const [newBranchName, setNewBranchName] = useState("");
  const resetMateriality = useMaterialityStore((state) => state.reset);

  // Scoring matrix label editors
  const DEFAULT_MATRIX_LABELS: Record<number, string[]> = {
    3: ["Low", "Medium", "High"],
    4: ["Low", "Medium", "High", "Critical"],
    5: ["Very Low", "Low", "Medium", "High", "Critical"],
  };

  const matrixSize = entityProfile.scoringMatrix?.matrixSize ?? 5;
  const matrixLevels =
    entityProfile.scoringMatrix?.levels ?? DEFAULT_MATRIX_LABELS[matrixSize];

  const isFinancial = entityProfile.sasbSector === "Financials";

  const countries = ["Nigeria", "Ghana"];

  const availableIndustries = useMemo(() => {
    if (!entityProfile.sasbSector) return [];
    return (
      SASB_TAXONOMY.find((s) => s.name === entityProfile.sasbSector)
        ?.industries || []
    );
  }, [entityProfile.sasbSector]);

  const recommendedTopics = useMemo(() => {
    if (!entityProfile.sasbSector) return [];
    const industries = entityProfile.sasbIndustries?.length
      ? entityProfile.sasbIndustries
      : entityProfile.sasbIndustry
        ? [entityProfile.sasbIndustry]
        : [];
    if (!industries.length) return [];
    const sectorTopics = (SASB_MATERIALITY_TOPICS as SasbMaterialityTopics)[
      entityProfile.sasbSector
    ];
    if (!sectorTopics) return [];
    const allTopics = new Set<string>();
    industries.forEach((ind) => {
      (sectorTopics[ind] || []).forEach((t) => allTopics.add(t));
    });
    return Array.from(allTopics);
  }, [
    entityProfile.sasbSector,
    entityProfile.sasbIndustries,
    entityProfile.sasbIndustry,
  ]);

  // Handlers
  const handleNext = () => setActiveStep((prev) => prev + 1);
  const handleBack = () => setActiveStep((prev) => prev - 1);
  const handleSave = () => {
    const selectedIndustries = entityProfile.sasbIndustries?.length
      ? entityProfile.sasbIndustries
      : entityProfile.sasbIndustry
        ? [entityProfile.sasbIndustry]
        : ["General"];
    // Generate SASB Risks from all detected topics across all selected industries
    const sasbRisks = recommendedTopics.map((topic, index) => ({
      id: `sasb-${Date.now()}-${index}`,
      name: topic,
      category: "Materiality",
      subcategory: selectedIndustries.join(", "),
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
                            const selectAllItem = value.find((v) =>
                              v.startsWith("select-all-"),
                            );
                            if (selectAllItem) {
                              const country = selectAllItem.replace(
                                "select-all-",
                                "",
                              );
                              const countryStates =
                                countryStateMap[country] || [];
                              const currentStates =
                                entityProfile.hqStates || [];
                              const allSelected = countryStates.every((s) =>
                                currentStates.includes(s),
                              );
                              setEntityProfile({
                                hqStates: allSelected
                                  ? currentStates.filter(
                                      (s) => !countryStates.includes(s),
                                    )
                                  : [
                                      ...new Set([
                                        ...currentStates,
                                        ...countryStates,
                                      ]),
                                    ],
                              });
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
                          renderValue={(selected) => {
                            const hqCountries = entityProfile.hqCountries || [];
                            if (hqCountries.length <= 1) {
                              return (
                                <Box
                                  sx={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 0.5,
                                  }}
                                >
                                  {selected.map((v) => (
                                    <Chip key={v} label={v} size="small" />
                                  ))}
                                </Box>
                              );
                            }
                            return (
                              <Box
                                sx={{
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: 0.5,
                                }}
                              >
                                {hqCountries.map((country) => {
                                  const countrySelected = selected.filter((s) =>
                                    (countryStateMap[country] || []).includes(
                                      s,
                                    ),
                                  );
                                  if (countrySelected.length === 0) return null;
                                  return (
                                    <Box
                                      key={country}
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        flexWrap: "wrap",
                                        gap: 0.5,
                                        mr: 0.5,
                                      }}
                                    >
                                      <Chip
                                        label={country}
                                        size="small"
                                        sx={{
                                          fontWeight: 700,
                                          bgcolor: alpha(BRAND, 0.15),
                                          color: BRAND,
                                        }}
                                      />
                                      {countrySelected.map((state) => (
                                        <Chip
                                          key={state}
                                          label={state}
                                          size="small"
                                        />
                                      ))}
                                    </Box>
                                  );
                                })}
                              </Box>
                            );
                          }}
                        >
                          {(entityProfile.hqStates?.length || 0) > 0 && (
                            <MenuItem
                              value="clear-all"
                              sx={{ fontStyle: "italic", opacity: 0.7 }}
                            >
                              <ListItemText primary="Clear All Selections" />
                            </MenuItem>
                          )}
                          {(entityProfile.hqCountries || []).map((country) => {
                            const countryStates =
                              countryStateMap[country] || [];
                            const currentStates = entityProfile.hqStates || [];
                            const allSelected =
                              countryStates.length > 0 &&
                              countryStates.every((s) =>
                                currentStates.includes(s),
                              );
                            const someSelected =
                              !allSelected &&
                              countryStates.some((s) =>
                                currentStates.includes(s),
                              );
                            const isExpanded =
                              expandedCountryGroups.has(country);
                            return [
                              <ListSubheader
                                key={`header-${country}`}
                                disableSticky
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  setExpandedCountryGroups((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(country)) {
                                      next.delete(country);
                                    } else {
                                      next.add(country);
                                    }
                                    return next;
                                  });
                                }}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  cursor: "pointer",
                                  userSelect: "none",
                                  lineHeight: "40px",
                                  fontWeight: 700,
                                  color: BRAND,
                                  bgcolor: alpha(BRAND, 0.04),
                                  borderRadius: 0.5,
                                }}
                              >
                                <Box component="span">{country}</Box>
                                <Box
                                  component="span"
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {isExpanded ? (
                                    <ChevronUp size={14} />
                                  ) : (
                                    <ChevronDown size={14} />
                                  )}
                                </Box>
                              </ListSubheader>,
                              isExpanded && (
                                <MenuItem
                                  key={`select-all-${country}`}
                                  value={`select-all-${country}`}
                                  dense
                                  sx={{ pl: 3 }}
                                >
                                  <Checkbox
                                    checked={allSelected}
                                    indeterminate={someSelected}
                                    size="small"
                                  />
                                  <ListItemText
                                    primary={`Select all (${country})`}
                                    primaryTypographyProps={{
                                      variant: "body2",
                                    }}
                                  />
                                </MenuItem>
                              ),
                              ...(isExpanded
                                ? countryStates.map((name) => (
                                    <MenuItem
                                      key={name}
                                      value={name}
                                      dense
                                      sx={{ pl: 4 }}
                                    >
                                      <Checkbox
                                        checked={currentStates.includes(name)}
                                        size="small"
                                      />
                                      <ListItemText primary={name} />
                                    </MenuItem>
                                  ))
                                : []),
                            ];
                          })}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Box>

                  <Divider />

                  {/* Section: Branch Locations */}
                  {(entityProfile.hqStates?.length ?? 0) > 0 && (
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
                        Branch Locations
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Add branch offices based on the states you selected.
                        Branch locations are used when assigning data owners to
                        materiality topics.
                      </Typography>
                      <Stack spacing={2}>
                        {(entityProfile.branchLocations || []).map((branch) => (
                          <Paper
                            key={branch.id}
                            variant="outlined"
                            sx={{
                              p: 2,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              borderRadius: 1,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Chip
                                label={branch.state}
                                size="small"
                                sx={{
                                  bgcolor: alpha(BRAND, 0.08),
                                  color: BRAND,
                                  fontWeight: 600,
                                }}
                              />
                              <Typography variant="body2" fontWeight={600}>
                                {branch.name}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {branch.country}
                              </Typography>
                            </Stack>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => {
                                setEntityProfile({
                                  branchLocations: (
                                    entityProfile.branchLocations || []
                                  ).filter((b) => b.id !== branch.id),
                                });
                              }}
                              sx={{ textTransform: "none", minWidth: "auto" }}
                            >
                              Remove
                            </Button>
                          </Paper>
                        ))}
                        <Paper
                          variant="outlined"
                          sx={{ p: 2, borderRadius: 1, borderStyle: "dashed" }}
                        >
                          <Stack spacing={1.5}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Add a branch office — multiple branches per state
                              are supported.
                            </Typography>
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <FormControl size="small" sx={{ minWidth: 180 }}>
                                <InputLabel>State</InputLabel>
                                <Select
                                  label="State"
                                  value={newBranchState}
                                  onChange={(e) =>
                                    setNewBranchState(e.target.value as string)
                                  }
                                >
                                  {(entityProfile.hqStates || []).map(
                                    (state) => (
                                      <MenuItem key={state} value={state}>
                                        {state}
                                      </MenuItem>
                                    ),
                                  )}
                                </Select>
                              </FormControl>
                              <TextField
                                size="small"
                                label="Branch Name"
                                value={newBranchName}
                                onChange={(e) =>
                                  setNewBranchName(e.target.value)
                                }
                                placeholder="e.g. Victoria Island Branch"
                                sx={{ flex: 1 }}
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    newBranchState &&
                                    newBranchName.trim()
                                  ) {
                                    const country =
                                      (entityProfile.hqCountries || []).find(
                                        (c) =>
                                          (countryStateMap[c] || []).includes(
                                            newBranchState,
                                          ),
                                      ) || "";
                                    setEntityProfile({
                                      branchLocations: [
                                        ...(entityProfile.branchLocations ||
                                          []),
                                        {
                                          id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                                          name: newBranchName.trim(),
                                          state: newBranchState,
                                          country,
                                        },
                                      ],
                                    });
                                    setNewBranchName("");
                                    setNewBranchState("");
                                  }
                                }}
                              />
                              <Button
                                variant="contained"
                                size="small"
                                disabled={
                                  !newBranchState || !newBranchName.trim()
                                }
                                onClick={() => {
                                  const country =
                                    (entityProfile.hqCountries || []).find(
                                      (c) =>
                                        (countryStateMap[c] || []).includes(
                                          newBranchState,
                                        ),
                                    ) || "";
                                  setEntityProfile({
                                    branchLocations: [
                                      ...(entityProfile.branchLocations || []),
                                      {
                                        id: `br-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
                                        name: newBranchName.trim(),
                                        state: newBranchState,
                                        country,
                                      },
                                    ],
                                  });
                                  setNewBranchName("");
                                  setNewBranchState("");
                                }}
                                sx={{
                                  textTransform: "none",
                                  bgcolor: BRAND,
                                  "&:hover": { bgcolor: alpha(BRAND, 0.8) },
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Add Branch
                              </Button>
                            </Stack>
                          </Stack>
                        </Paper>
                      </Stack>
                    </Box>
                  )}

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
                        onChange={(e) => {
                          resetMateriality();
                          setEntityProfile({
                            sasbSector: e.target.value,
                            sasbIndustry: undefined,
                            sasbIndustries: undefined,
                          });
                        }}
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
                      <InputLabel>
                        Industries (Select all that apply)
                      </InputLabel>
                      <Select
                        multiple
                        value={
                          entityProfile.sasbIndustries ||
                          (entityProfile.sasbIndustry
                            ? [entityProfile.sasbIndustry]
                            : [])
                        }
                        label="Industries (Select all that apply)"
                        onChange={(e) => {
                          const value = e.target.value as string[];
                          setEntityProfile({
                            sasbIndustries: value,
                            sasbIndustry: value[0], // keep single for backward compat
                          });
                        }}
                        input={
                          <OutlinedInput
                            label="Industries (Select all that apply)"
                            sx={{ borderRadius: 1 }}
                          />
                        }
                        renderValue={(selected) => (
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {(selected as string[]).map((val) => (
                              <Chip
                                key={val}
                                label={val}
                                size="small"
                                sx={{
                                  bgcolor: alpha(BRAND, 0.08),
                                  color: BRAND,
                                  fontWeight: 600,
                                  borderRadius: 1.5,
                                  border: "none",
                                }}
                              />
                            ))}
                          </Box>
                        )}
                        fullWidth
                      >
                        {availableIndustries.map((i) => (
                          <MenuItem key={i} value={i}>
                            <Checkbox
                              checked={(
                                entityProfile.sasbIndustries ||
                                (entityProfile.sasbIndustry
                                  ? [entityProfile.sasbIndustry]
                                  : [])
                              ).includes(i)}
                              sx={{
                                color: BRAND,
                                "&.Mui-checked": { color: BRAND },
                              }}
                            />
                            <ListItemText primary={i} />
                          </MenuItem>
                        ))}
                      </Select>
                      <FormHelperText>
                        Companies operating across multiple industries (e.g.
                        Unilever) may select more than one. Each industry adds
                        its own materiality topics.
                      </FormHelperText>
                    </FormControl>
                  </Stack>

                  {recommendedTopics.length > 0 &&
                    (() => {
                      return (
                        <Fade in>
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 2,
                              p: 3,
                              borderRadius: 1,
                              border: `1px solid ${alpha(BRAND, 0.2)}`,
                              background: `linear-gradient(135deg, ${alpha(BRAND, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
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
                              <Chip
                                label={`${recommendedTopics.length} topics`}
                                size="small"
                                sx={{
                                  bgcolor: alpha(BRAND, 0.1),
                                  color: BRAND,
                                  fontWeight: 700,
                                  ml: "auto",
                                }}
                              />
                            </Box>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              mb={2}
                            >
                              Based on your selected{" "}
                              <strong>
                                {(entityProfile.sasbIndustries?.length ?? 0) > 1
                                  ? `${entityProfile.sasbIndustries!.length} industries`
                                  : entityProfile.sasbIndustry}
                              </strong>
                              , the following topics are material for IFRS S1/S2
                              disclosure:
                            </Typography>

                            <Box
                              sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                            >
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
                      );
                    })()}

                  {/* ── Time Horizons ───────────────────────────────────── */}
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{ p: 3, borderRadius: 1 }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="text.secondary"
                      gutterBottom
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        mb: 0.5,
                      }}
                    >
                      Time Horizons
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mb={2.5}
                    >
                      Set the start and end of each time horizon tier. These
                      will appear as options when scoring risks (e.g. "Short
                      Term (0–3 years)").
                    </Typography>
                    <Stack spacing={2.5}>
                      {(
                        [
                          { key: "short" as const, label: "Short Term" },
                          { key: "medium" as const, label: "Medium Term" },
                          { key: "long" as const, label: "Long Term" },
                        ] as const
                      ).map(({ key, label }) => (
                        <Box key={key}>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            color="text.secondary"
                            sx={{
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {label}
                          </Typography>
                          <Stack direction="row" spacing={1.5} mt={0.75}>
                            <TextField
                              fullWidth
                              size="small"
                              label="From"
                              placeholder="e.g. 0 years"
                              value={
                                entityProfile.timeHorizons?.[key]?.from ?? ""
                              }
                              onChange={(e) =>
                                setEntityProfile({
                                  timeHorizons: {
                                    short: {
                                      from: "",
                                      to: "",
                                      ...entityProfile.timeHorizons?.short,
                                    },
                                    medium: {
                                      from: "",
                                      to: "",
                                      ...entityProfile.timeHorizons?.medium,
                                    },
                                    long: {
                                      from: "",
                                      to: "",
                                      ...entityProfile.timeHorizons?.long,
                                    },
                                    [key]: {
                                      ...entityProfile.timeHorizons?.[key],
                                      from: e.target.value,
                                    },
                                  },
                                })
                              }
                              sx={{
                                "& .MuiOutlinedInput-root": { borderRadius: 1 },
                              }}
                            />
                            <TextField
                              fullWidth
                              size="small"
                              label="To"
                              placeholder="e.g. 3 years"
                              value={
                                entityProfile.timeHorizons?.[key]?.to ?? ""
                              }
                              onChange={(e) =>
                                setEntityProfile({
                                  timeHorizons: {
                                    short: {
                                      from: "",
                                      to: "",
                                      ...entityProfile.timeHorizons?.short,
                                    },
                                    medium: {
                                      from: "",
                                      to: "",
                                      ...entityProfile.timeHorizons?.medium,
                                    },
                                    long: {
                                      from: "",
                                      to: "",
                                      ...entityProfile.timeHorizons?.long,
                                    },
                                    [key]: {
                                      ...entityProfile.timeHorizons?.[key],
                                      to: e.target.value,
                                    },
                                  },
                                })
                              }
                              sx={{
                                "& .MuiOutlinedInput-root": { borderRadius: 1 },
                              }}
                            />
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  </Paper>

                  {/* ── Scoring Matrix ──────────────────────────────────── */}
                  <Paper
                    elevation={0}
                    variant="outlined"
                    sx={{ p: 3, borderRadius: 1 }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="text.secondary"
                      gutterBottom
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        mb: 0.5,
                      }}
                    >
                      Risk Scoring Matrix
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mb={2.5}
                    >
                      Choose the matrix size and label each severity level. This
                      defines the rating scale used throughout your assessment.
                    </Typography>
                    <Stack direction="row" spacing={1} mb={3}>
                      {([3, 4, 5] as const).map((size) => (
                        <Chip
                          key={size}
                          label={`${size}×${size}`}
                          onClick={() =>
                            setEntityProfile({
                              scoringMatrix: {
                                matrixSize: size,
                                levels: DEFAULT_MATRIX_LABELS[size],
                              },
                            })
                          }
                          sx={{
                            fontWeight: 700,
                            borderRadius: 1.5,
                            cursor: "pointer",
                            bgcolor:
                              matrixSize === size
                                ? BRAND
                                : alpha(theme.palette.action.selected, 0.4),
                            color:
                              matrixSize === size ? "#fff" : "text.primary",
                            border:
                              matrixSize === size
                                ? `1px solid ${BRAND}`
                                : `1px solid ${theme.palette.divider}`,
                          }}
                        />
                      ))}
                    </Stack>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${matrixSize}, 1fr)`,
                        gap: 1.5,
                      }}
                    >
                      {Array.from({ length: matrixSize }).map((_, i) => (
                        <TextField
                          key={i}
                          size="small"
                          label={`Level ${i + 1}`}
                          value={matrixLevels[i] ?? ""}
                          onChange={(e) => {
                            const updated = [...matrixLevels];
                            updated[i] = e.target.value;
                            setEntityProfile({
                              scoringMatrix: { matrixSize, levels: updated },
                            });
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: 1 },
                          }}
                        />
                      ))}
                    </Box>
                  </Paper>

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
