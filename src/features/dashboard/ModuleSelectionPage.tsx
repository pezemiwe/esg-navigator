import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  useTheme,
  alpha,
  IconButton,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import {
  Shield,
  ShowChart,
  EmojiEvents,
  School,
  Note,
  ChevronRight,
  Logout,
  AccountBalance,
  Lock,
  Business,
  SwapHoriz,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCRAStatusStore } from "@/store/craStore";
import { useIndustry } from "@/hooks/useIndustry";
export default function ModuleSelectionPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user, logout } = useAuthStore();
  const { traReady, praReady } = useCRAStatusStore();
  const { config: industryConfig, industryName, sectorId } = useIndustry();
  const isDark = theme.palette.mode === "dark";
  const scenarioUnlocked = traReady || praReady;
  const visibleModuleIds = industryConfig.modules.visibleModuleIds;
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const modules = [
    {
      id: "cra",
      title: "Climate Risk Assessment",
      description:
        "Comprehensive risk evaluation & regulatory reporting framework.",
      icon: Shield,
      path: "/cra/dashboard",
      category: "RISK MANAGEMENT",
      locked: false,
    },
    {
      id: "scenario",
      title: "Scenario Analysis",
      description: "Advanced financial modeling against climate variables.",
      icon: ShowChart,
      path: "/scenario-analysis",
      category: "ANALYTICS",
      locked: !scenarioUnlocked,
    },
    {
      id: "sdg",
      title: "SDG & NDC Alignment",
      description:
        "Tracking national contributions and global sustainability goals.",
      icon: EmojiEvents,
      path: "/sdg-ndc",
      category: "COMPLIANCE",
      locked: false,
    },
    {
      id: "learning",
      title: "Capacity Building Hub",
      description:
        "Professional development, certifications, and learning resources.",
      icon: School,
      path: "/capacity-building",
      category: "EDUCATION",
      locked: false,
    },
    {
      id: "materia",
      title: "Materiality & Sustainability Reporting",
      description:
        "IFRS S1/S2 aligned sustainability intelligence, risk assessment, and climate disclosure.",
      icon: Note,
      path: "/sustainability",
      category: "STRATEGY",
      locked: false,
    },
    {
      id: "esrm",
      title: "ESRM Module",
      description: "Environmental, Social and Risk Management Framework.",
      icon: AccountBalance,
      path: "/esrm",
      category: "RISK MANAGEMENT",
      locked: false,
    },
  ];
  const filteredModules = modules.filter((m) =>
    visibleModuleIds.includes(m.id),
  );
  const isCentered = filteredModules.length <= 4;
  const isQuadrant = filteredModules.length === 4;
  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: isDark ? "#1D1D1D" : "#F8F9FA",
        backgroundImage: isDark
          ? "radial-gradient(circle at 50% 0%, #2D2D2D 0%, #1D1D1D 100%)"
          : "radial-gradient(circle at 50% 0%, #FFFFFF 0%, #F1F5F9 100%)",
        color: isDark ? "#fff" : "#2D2D2D",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          py: 2,
          borderBottom: `1px solid ${
            isDark ? alpha("#fff", 0.1) : alpha("#000", 0.1)
          }`,
          backgroundColor: isDark ? alpha("#1D1D1D", 0.8) : alpha("#fff", 0.8),
          backdropFilter: "blur(12px)",
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
                alt="Deloitte"
                sx={{
                  height: 36,
                }}
              />
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: isDark ? alpha("#fff", 0.2) : alpha("#000", 0.2),
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
                  fontSize: "0.75rem",
                  color: isDark ? alpha("#fff", 0.7) : alpha("#000", 0.6),
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
                  sx={{
                    fontWeight: 600,
                    color: isDark ? "#fff" : "#1D1D1D",
                  }}
                >
                  {user?.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isDark ? alpha("#fff", 0.5) : alpha("#000", 0.5),
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.65rem",
                  }}
                >
                  {user?.department || "Authorized User"}
                </Typography>
              </Box>
              <IconButton
                onClick={handleLogout}
                size="small"
                sx={{
                  color: isDark ? alpha("#fff", 0.7) : alpha("#000", 0.5),
                  "&:hover": { color: isDark ? "#fff" : "#DC2626" },
                }}
              >
                <Logout fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>
      <Box sx={{ flex: 1, py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 8, position: "relative" }}>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: isDark
                  ? alpha("#86BC25", 0.1)
                  : alpha("#86BC25", 0.1),
                color: "#86BC25",
                mb: 3,
                border: `1px solid ${alpha("#86BC25", 0.3)}`,
              }}
            >
              <AccountBalance fontSize="large" />
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontFamily: "Times New Roman, serif",
                fontWeight: 700,
                color: isDark ? "#fff" : "#1D1D1D",
                mb: 2,
                fontSize: { xs: "2rem", md: "3rem" },
                letterSpacing: "-0.5px",
              }}
            >
              Select Your Workspace
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: isDark ? alpha("#fff", 0.6) : alpha("#1D1D1D", 0.6),
                maxWidth: 600,
                mx: "auto",
                fontSize: "1.1rem",
                lineHeight: 1.6,
              }}
            >
              Access centralized tools for climate risk, sustainability
              reporting, and capacity development.
            </Typography>
            {sectorId && (
              <Box
                sx={{
                  mt: 3,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 2,
                  px: 3,
                  py: 1.5,
                  borderRadius: "14px",
                  background: isDark
                    ? `linear-gradient(135deg, ${alpha("#86BC25", 0.1)}, ${alpha("#86BC25", 0.04)})`
                    : `linear-gradient(135deg, ${alpha("#86BC25", 0.08)}, ${alpha("#86BC25", 0.03)})`,
                  border: `1.5px solid ${alpha("#86BC25", 0.25)}`,
                  boxShadow: `0 2px 12px ${alpha("#86BC25", 0.08)}`,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    background: `linear-gradient(135deg, ${alpha("#86BC25", 0.2)}, ${alpha("#86BC25", 0.08)})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Business sx={{ fontSize: 18, color: "#86BC25" }} />
                </Box>
                <Box sx={{ textAlign: "left" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDark ? alpha("#fff", 0.5) : alpha("#000", 0.45),
                      fontSize: "0.62rem",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                      display: "block",
                      lineHeight: 1,
                    }}
                  >
                    Industry
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? "#fff" : "#1D1D1D",
                      fontSize: "0.9rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {industryName}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<SwapHoriz sx={{ fontSize: 16 }} />}
                  onClick={() => navigate("/industry-setup")}
                  sx={{
                    ml: 1,
                    textTransform: "none",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: "#86BC25",
                    borderRadius: "8px",
                    border: `1px solid ${alpha("#86BC25", 0.3)}`,
                    px: 1.5,
                    py: 0.4,
                    minWidth: 0,
                    "&:hover": {
                      backgroundColor: alpha("#86BC25", 0.08),
                      borderColor: "#86BC25",
                    },
                  }}
                >
                  Change
                </Button>
              </Box>
            )}
          </Box>
          <Grid
            container
            spacing={3}
            justifyContent={isCentered ? "center" : "flex-start"}
          >
            {filteredModules.map((module, index) => {
              const Icon = module.icon;
              const isLocked = module.locked;
              return (
                <Grid
                  size={{
                    xs: 12,
                    md: isQuadrant ? 6 : 6,
                    lg: isQuadrant ? 6 : isCentered ? 5 : 4,
                  }}
                  key={index}
                >
                  <Card
                    onClick={() => !isLocked && navigate(module.path)}
                    sx={{
                      height: "100%",
                      backgroundColor: isDark ? alpha("#2D2D2D", 0.4) : "#fff",
                      borderRadius: 1,
                      border: `1px solid ${
                        isDark ? alpha("#fff", 0.05) : alpha("#000", 0.08)
                      }`,
                      boxShadow: isDark
                        ? "none"
                        : "0px 2px 4px rgba(0,0,0,0.02)",
                      transition: "all 0.3s ease",
                      cursor: isLocked ? "not-allowed" : "pointer",
                      scale: isLocked ? "0.98" : "1",
                      opacity: isLocked ? 0.7 : 1,
                      position: "relative",
                      overflow: "visible",
                      "&:hover": !isLocked
                        ? {
                            transform: "translateY(-4px)",
                            boxShadow: `0px 12px 24px ${
                              isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.06)"
                            }`,
                            borderColor: "#86BC25",
                            "& .module-icon": {
                              backgroundColor: "#86BC25",
                              color: "#fff",
                            },
                          }
                        : {},
                    }}
                  >
                    <Box
                      sx={{
                        p: 4,
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      {isLocked && (
                        <Box
                          sx={{
                            position: "absolute",
                            top: 16,
                            rit: 16,
                            color: "text.secondary",
                          }}
                        >
                          <Lock />
                        </Box>
                      )}
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          color: alpha(isDark ? "#fff" : "#000", 0.4),
                          mb: 3,
                          display: "block",
                        }}
                      >
                        {module.category}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mb: 2 }}
                      >
                        <Box
                          className="module-icon"
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: isDark
                              ? alpha("#fff", 0.05)
                              : alpha("#1D1D1D", 0.04),
                            color: isDark ? "#fff" : "#1D1D1D",
                            transition: "all 0.3s ease",
                          }}
                        >
                          <Icon />
                        </Box>
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              fontFamily: "Inter, sans-serif",
                              color: isDark ? "#fff" : "#1D1D1D",
                              lineHeight: 1.3,
                            }}
                          >
                            {module.title}
                          </Typography>
                        </Box>
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{
                          color: isDark
                            ? alpha("#fff", 0.5)
                            : alpha("#000", 0.5),
                          mb: 4,
                          lineHeight: 1.6,
                          flex: 1,
                        }}
                      >
                        {isLocked
                          ? "Complete Climate Risk Assessment (CRA) to unlock this advanced module."
                          : module.description}
                      </Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{
                          color: isLocked ? "text.disabled" : "#86BC25",
                          fontWeight: 600,
                          fontSize: "0.85rem",
                        }}
                      >
                        <Typography
                          variant="button"
                          sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                          {isLocked ? "Locked" : "Access Module"}
                        </Typography>
                        {!isLocked && <ChevronRight fontSize="small" />}
                      </Stack>
                    </Box>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Container>
      </Box>
      <Box
        sx={{
          py: 3,
          textAlign: "center",
          borderTop: `1px solid ${
            isDark ? alpha("#fff", 0.1) : alpha("#000", 0.1)
          }`,
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: isDark ? alpha("#fff", 0.4) : alpha("#000", 0.4) }}
        >
          © {new Date().getFullYear()} Deloitte Nigeria. All Rights Reserved. •
          Confidential & Proprietary
        </Typography>
      </Box>
    </Box>
  );
}
