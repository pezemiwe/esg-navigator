import { useState, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Stack,
  Button,
  TextField,
  InputAdornment,
  alpha,
  useTheme,
  Collapse,
  Divider,
  Fade,
  IconButton,
} from "@mui/material";
import {
  Search,
  ArrowForward,
  CheckCircle,
  Business,
  ExpandMore,
  ExpandLess,
  Logout,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useScenarioStore } from "@/store/scenarioStore";
import { useAuthStore } from "@/store/authStore";
import { SECTORS } from "@/features/scenario-analysis/data/sectorConfig";
import {
  useCRADataStore,
  useCRAStatusStore,
  usePRARiskStore,
  useTRARiskStore,
  useSegmentationStore,
} from "@/store/craStore";

export default function IndustrySelectionPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { user, logout } = useAuthStore();
  const { selectedSectorId, setSelectedSector, resetScenario } =
    useScenarioStore();
  const { clearAllData } = useCRADataStore();
  const craStatus = useCRAStatusStore();
  const praStore = usePRARiskStore();
  const traStore = useTRARiskStore();
  const segStore = useSegmentationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [localSelected, setLocalSelected] = useState<string | null>(
    selectedSectorId,
  );

  const filteredSectors = useMemo(
    () =>
      SECTORS.filter(
        (s) =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.subSectors.some((sub) =>
            sub.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      ),
    [searchQuery],
  );

  const selectedSector = SECTORS.find((s) => s.id === localSelected);

  const handleContinue = () => {
    if (localSelected) {
      // Clear all stores when switching industries
      if (localSelected !== selectedSectorId) {
        clearAllData();
        craStatus.updateStatus("dataUploaded", false);
        craStatus.updateStatus("segmentationReady", false);
        craStatus.setPRAReady(false);
        craStatus.setTRAReady(false);
        praStore.resetPRA();
        traStore.resetTRA();
        segStore.resetFilters();
        resetScenario();
      }
      setSelectedSector(localSelected);
      navigate("/modules");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#0A0A0A" : "#FAFAFA",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top Nav Bar ── */}
      <Box
        sx={{
          py: 2,
          borderBottom: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.06)}`,
          backgroundColor: isDark ? alpha("#0A0A0A", 0.9) : alpha("#fff", 0.9),
          backdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                component="img"
                src={
                  isDark
                    ? "/assets/images/logo2.png"
                    : "/assets/images/logo.png"
                }
                alt="Logo"
                sx={{ height: 36 }}
              />
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: isDark
                    ? alpha("#fff", 0.15)
                    : alpha("#000", 0.12),
                  height: 24,
                  alignSelf: "center",
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 600,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontSize: "0.72rem",
                  color: isDark ? alpha("#fff", 0.6) : alpha("#000", 0.5),
                }}
              >
                ESG Navigator
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box
                sx={{
                  textAlign: "right",
                  display: { xs: "none", sm: "block" },
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: isDark ? "#fff" : "#1D1D1D" }}
                >
                  {user?.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? alpha("#fff", 0.45) : alpha("#000", 0.45),
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.62rem",
                  }}
                >
                  {user?.department || "Authorized User"}
                </Typography>
              </Box>
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{
                  color: isDark ? alpha("#fff", 0.6) : alpha("#000", 0.45),
                  "&:hover": { color: isDark ? "#fff" : "#DC2626" },
                }}
              >
                <Logout fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ── Main Content ── */}
      <Box sx={{ flex: 1, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Fade in timeout={600}>
            <Box
              sx={{
                textAlign: "center",
                mb: { xs: 4, md: 6 },
                position: "relative",
              }}
            >
              {/* Glow effect */}
              <Box
                sx={{
                  position: "absolute",
                  top: -60,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 400,
                  height: 400,
                  background: `radial-gradient(circle, ${alpha("#86BC25", 0.08)} 0%, transparent 70%)`,
                  filter: "blur(60px)",
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              />

              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha("#86BC25", 0.15)}, ${alpha("#86BC25", 0.05)})`
                    : `linear-gradient(135deg, ${alpha("#86BC25", 0.12)}, ${alpha("#86BC25", 0.04)})`,
                  border: `1px solid ${alpha("#86BC25", 0.2)}`,
                  mb: 3,
                  position: "relative",
                }}
              >
                <Business sx={{ fontSize: 28, color: "#86BC25" }} />
              </Box>

              <Typography
                variant="h3"
                sx={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 800,
                  color: isDark ? "#fff" : "#111827",
                  mb: 1.5,
                  fontSize: { xs: "1.75rem", md: "2.25rem" },
                  letterSpacing: "-0.5px",
                  lineHeight: 1.2,
                  position: "relative",
                }}
              >
                Select Your Industry
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: isDark ? alpha("#fff", 0.55) : alpha("#000", 0.55),
                  maxWidth: 580,
                  mx: "auto",
                  fontSize: "1rem",
                  lineHeight: 1.7,
                  position: "relative",
                }}
              >
                Your industry selection calibrates climate risk models,
                financial baselines, and scenario sensitivity parameters across
                all modules.
              </Typography>
            </Box>
          </Fade>

          {/* Search */}
          <Fade in timeout={800}>
            <Box sx={{ maxWidth: 520, mx: "auto", mb: 4 }}>
              <TextField
                fullWidth
                placeholder="Search by industry, sub-sector, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    backgroundColor: isDark ? alpha("#fff", 0.04) : "#fff",
                    border: `1px solid ${isDark ? alpha("#fff", 0.08) : alpha("#000", 0.08)}`,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: alpha("#86BC25", 0.4),
                    },
                    "&.Mui-focused": {
                      borderColor: "#86BC25",
                      boxShadow: `0 0 0 3px ${alpha("#86BC25", 0.1)}`,
                    },
                    "& fieldset": { border: "none" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search
                        sx={{
                          fontSize: 20,
                          color: isDark
                            ? alpha("#fff", 0.35)
                            : alpha("#000", 0.35),
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Fade>

          {/* Selected sector confirmation banner */}
          {selectedSector && (
            <Fade in timeout={400}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  maxWidth: 520,
                  mx: "auto",
                  borderRadius: "14px",
                  border: `1.5px solid ${alpha("#86BC25", 0.35)}`,
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha("#86BC25", 0.06)}, ${alpha("#86BC25", 0.02)})`
                    : `linear-gradient(135deg, ${alpha("#86BC25", 0.06)}, ${alpha("#86BC25", 0.02)})`,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      background: `linear-gradient(135deg, ${alpha(selectedSector.color, 0.15)}, ${alpha(selectedSector.color, 0.05)})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Business
                      sx={{ fontSize: 20, color: selectedSector.color }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 700,
                        color: isDark ? "#fff" : "#111827",
                        fontSize: "0.875rem",
                      }}
                    >
                      {selectedSector.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: isDark ? alpha("#fff", 0.5) : alpha("#000", 0.5),
                        fontSize: "0.72rem",
                      }}
                    >
                      {selectedSector.subSectors.length} sub-sectors
                    </Typography>
                  </Box>
                  <CheckCircle sx={{ fontSize: 22, color: "#86BC25" }} />
                </Stack>
              </Paper>
            </Fade>
          )}

          {/* Sector Grid */}
          <Fade in timeout={1000}>
            <Grid container spacing={2}>
              {filteredSectors.map((sector) => {
                const isSelected = sector.id === localSelected;
                const isExpanded = expandedSector === sector.id;

                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={sector.id}>
                    <Paper
                      elevation={0}
                      onClick={() => setLocalSelected(sector.id)}
                      sx={{
                        p: 2.5,
                        height: "100%",
                        borderRadius: "14px",
                        border: isSelected
                          ? `2px solid ${alpha("#86BC25", 0.6)}`
                          : `1px solid ${isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06)}`,
                        backgroundColor: isSelected
                          ? isDark
                            ? alpha("#86BC25", 0.04)
                            : alpha("#86BC25", 0.03)
                          : isDark
                            ? alpha("#fff", 0.02)
                            : "#fff",
                        cursor: "pointer",
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        position: "relative",
                        overflow: "hidden",
                        "&:hover": {
                          borderColor: isSelected
                            ? alpha("#86BC25", 0.6)
                            : alpha(sector.color, 0.4),
                          transform: "translateY(-3px)",
                          boxShadow: isDark
                            ? `0 8px 32px ${alpha(sector.color, 0.12)}`
                            : `0 8px 32px ${alpha(sector.color, 0.08)}`,
                        },
                      }}
                    >
                      {/* Selected indicator line */}
                      {isSelected && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 3,
                            background: `linear-gradient(90deg, #86BC25, ${sector.color})`,
                            borderRadius: "14px 14px 0 0",
                          }}
                        />
                      )}

                      <Stack spacing={1.5}>
                        {/* Header */}
                        <Stack
                          direction="row"
                          alignItems="flex-start"
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                          >
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: "10px",
                                background: `linear-gradient(135deg, ${alpha(sector.color, 0.12)}, ${alpha(sector.color, 0.04)})`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <Business
                                sx={{ fontSize: 18, color: sector.color }}
                              />
                            </Box>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: isDark ? "#fff" : "#111827",
                                lineHeight: 1.3,
                                fontSize: "0.85rem",
                              }}
                            >
                              {sector.name}
                            </Typography>
                          </Stack>
                          {isSelected && (
                            <CheckCircle
                              sx={{
                                fontSize: 20,
                                color: "#86BC25",
                                flexShrink: 0,
                                mt: 0.3,
                              }}
                            />
                          )}
                        </Stack>

                        {/* Description */}
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDark
                              ? alpha("#fff", 0.5)
                              : alpha("#000", 0.5),
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.6,
                            fontSize: "0.75rem",
                          }}
                        >
                          {sector.description}
                        </Typography>

                        {/* Sub-sector toggle */}
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedSector(isExpanded ? null : sector.id);
                          }}
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.5,
                            cursor: "pointer",
                            color: isDark
                              ? alpha("#fff", 0.4)
                              : alpha("#000", 0.4),
                            transition: "color 0.2s",
                            "&:hover": { color: sector.color },
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                          >
                            {sector.subSectors.length} sub-sectors
                          </Typography>
                          {isExpanded ? (
                            <ExpandLess sx={{ fontSize: 16 }} />
                          ) : (
                            <ExpandMore sx={{ fontSize: 16 }} />
                          )}
                        </Box>

                        {/* Expanded sub-sectors */}
                        <Collapse in={isExpanded}>
                          <Divider sx={{ mb: 1, opacity: 0.5 }} />
                          <Stack spacing={0.5}>
                            {sector.subSectors.map((sub) => (
                              <Typography
                                key={sub}
                                variant="caption"
                                sx={{
                                  color: isDark
                                    ? alpha("#fff", 0.5)
                                    : alpha("#000", 0.5),
                                  pl: 1.5,
                                  borderLeft: `2px solid ${alpha(sector.color, 0.3)}`,
                                  fontSize: "0.72rem",
                                  lineHeight: 1.6,
                                }}
                              >
                                {sub}
                              </Typography>
                            ))}
                          </Stack>
                        </Collapse>
                      </Stack>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          </Fade>

          {/* No results */}
          {filteredSectors.length === 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: "16px",
                border: `1px dashed ${isDark ? alpha("#fff", 0.1) : alpha("#000", 0.1)}`,
                backgroundColor: isDark
                  ? alpha("#fff", 0.02)
                  : alpha("#000", 0.01),
              }}
            >
              <Typography
                sx={{
                  color: isDark ? alpha("#fff", 0.4) : alpha("#000", 0.4),
                  fontSize: "0.9rem",
                }}
              >
                No industries match "{searchQuery}"
              </Typography>
            </Paper>
          )}

          {/* Continue Button */}
          <Fade in timeout={1200}>
            <Box sx={{ textAlign: "center", mt: 5, mb: 2 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleContinue}
                disabled={!localSelected}
                endIcon={<ArrowForward />}
                sx={{
                  px: 5,
                  py: 1.5,
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  textTransform: "none",
                  backgroundColor: "#86BC25",
                  color: "#fff",
                  boxShadow: localSelected
                    ? `0 4px 20px ${alpha("#86BC25", 0.35)}`
                    : "none",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: "#6FA01E",
                    transform: "translateY(-1px)",
                    boxShadow: `0 8px 28px ${alpha("#86BC25", 0.4)}`,
                  },
                  "&.Mui-disabled": {
                    backgroundColor: isDark
                      ? alpha("#86BC25", 0.15)
                      : alpha("#86BC25", 0.25),
                    color: isDark ? alpha("#fff", 0.25) : alpha("#000", 0.3),
                  },
                }}
              >
                Continue to Workspace
              </Button>
              <Typography
                variant="caption"
                display="block"
                sx={{
                  mt: 1.5,
                  color: isDark ? alpha("#fff", 0.3) : alpha("#000", 0.3),
                  fontSize: "0.72rem",
                }}
              >
                You can change your industry selection anytime from settings
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          py: 3,
          textAlign: "center",
          borderTop: `1px solid ${isDark ? alpha("#fff", 0.06) : alpha("#000", 0.06)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: isDark ? alpha("#fff", 0.3) : alpha("#000", 0.3),
            fontSize: "0.7rem",
          }}
        >
          © {new Date().getFullYear()} Deloitte Nigeria. All Rights Reserved. •
          Confidential & Proprietary
        </Typography>
      </Box>
    </Box>
  );
}
