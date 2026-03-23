import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  alpha,
  IconButton,
  useTheme,
  Grid,
  Card,
} from "@mui/material";
import {
  PlayCircle,
  Security,
  Assessment,
  Brightness4,
  WbSunny,
  Shield,
  ShowChart,
  EmojiEvents,
  School,
  Note,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState, useLayoutEffect } from "react";
import { useThemeStore } from "../../../store/themeStore";

const modules = [
  {
    title: "Climate Risk Assessment",
    description: "Risk evaluation & analysis",
    icon: Shield,
    path: "/cra/dashboard",
  },
  {
    title: "Scenario Analysis & Stress Testing",
    description: "Stress testing & analytics",
    icon: ShowChart,
    path: "/dashboard",
  },
  {
    title: "SDG & NDC Alignment",
    description: "Sustainability goals",
    icon: EmojiEvents,
    path: "/dashboard",
  },
  {
    title: "Capacity Building",
    description: "Training & development",
    icon: School,
    path: "/capacity-building",
  },
  {
    title: "Materiality Topic Assessment",
    description: "Assess materiality topics",
    icon: Note,
    path: "/materiality",
  },
  {
    title: "ESRM",
    description: "Environmental & Social Risk Management",
    icon: Security,
    path: "/esrm",
  },
];

export default function BankingLandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { toggleTheme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isDark = theme.palette.mode === "dark";

  const colors = {
    primary: "#1D1D1D",
    secondary: "#86BC25",
    background: isDark ? "#1D1D1D" : "#FFFFFF",
    text: isDark ? "#FFFFFF" : "#1D1D1D",
    muted: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
    border: isDark ? alpha("#334155", 0.5) : alpha("#E2E8F0", 0.8),
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: colors.background,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <Box
          component="iframe"
          src="https://www.youtube.com/embed/Fx_LXyIJzG4?autoplay=1&mute=1&controls=0&loop=1&playlist=Fx_LXyIJzG4&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&modestbranding=1"
          title="Background Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100vw",
            height: "56.25vw",
            minHeight: "100vh",
            minWidth: "177.78vh",
            transform: "translate(-50%, -50%)",
            opacity: isDark ? 0.3 : 0.4,
            pointerEvents: "none",
            border: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: `linear-gradient(to bottom, ${alpha(colors.background, 0.7)} 0%, ${alpha(colors.background, 0.4)} 50%, ${alpha(colors.background, 0.8)} 100%)`,
            zIndex: 1,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundImage: `radial-gradient(${alpha(colors.secondary, 0.05)} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          zIndex: 3,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            backgroundColor: alpha(colors.background, 0.98),
            borderBottom: `1px solid ${colors.border}`,
            backdropFilter: "blur(8px)",
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                height: 64,
                py: 1,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  component="img"
                  src={
                    isDark
                      ? "/assets/images/logo2.png"
                      : "/assets/images/logo.png"
                  }
                  alt="Deloitte"
                  sx={{ height: 28, width: "auto" }}
                />
                <Box
                  sx={{
                    height: 20,
                    width: "1px",
                    backgroundColor: colors.border,
                  }}
                />
                <Typography
                  sx={{
                    color: colors.muted,
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  ESG Navigator
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton
                  onClick={toggleTheme}
                  size="small"
                  sx={{
                    color: colors.muted,
                    "&:hover": {
                      backgroundColor: alpha(colors.secondary, 0.1),
                    },
                  }}
                >
                  {isDark ? (
                    <WbSunny fontSize="small" />
                  ) : (
                    <Brightness4 fontSize="small" />
                  )}
                </IconButton>
                <Button
                  variant="contained"
                  onClick={() => navigate("/login")}
                  size="small"
                  sx={{
                    backgroundColor: colors.secondary,
                    color: colors.primary,
                    fontWeight: 600,
                    px: 2.5,
                    py: 0.75,
                    textTransform: "none",
                    borderRadius: "4px",
                    fontSize: "0.75rem",
                    minWidth: 120,
                    "&:hover": {
                      backgroundColor: alpha(colors.secondary, 0.9),
                      boxShadow: `0 4px 12px ${alpha(colors.secondary, 0.3)}`,
                    },
                  }}
                >
                  Access Platform
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>

        <Container
          maxWidth="lg"
          sx={{
            py: 4,
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.6s ease, transform 0.6s ease",
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1,
                  px: 2,
                  py: 0.75,
                  backgroundColor: alpha(colors.secondary, 0.1),
                  borderRadius: "4px",
                  mb: 3,
                  border: `1px solid ${alpha(colors.secondary, 0.2)}`,
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: colors.secondary,
                  }}
                />
                <Typography
                  sx={{
                    color: colors.secondary,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    letterSpacing: "0.5px",
                  }}
                >
                  ENTERPRISE RISK INTELLIGENCE
                </Typography>
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: {
                    xs: "2.2rem",
                    sm: "2.8rem",
                    md: "3.5rem",
                    lg: "4.2rem",
                  },
                  fontWeight: 800,
                  lineHeight: 1.08,
                  color: isDark ? "#fff" : "#1a202c",
                  mb: 3,
                  letterSpacing: "-0.04em",
                  textShadow: isDark
                    ? "0 2px 16px rgba(0,0,0,0.45)"
                    : "0 2px 12px rgba(253,185,19,0.08)",
                  textAlign: { xs: "left", md: "left" },
                }}
              >
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    fontWeight: 700,
                    color: isDark ? "#fff" : "#1a202c",
                    fontSize: {
                      xs: "1.2rem",
                      sm: "1.5rem",
                      md: "2rem",
                      lg: "2.2rem",
                    },
                    mt: 1,
                    letterSpacing: "-0.01em",
                    textShadow: isDark
                      ? "0 2px 12px rgba(0,0,0,0.25)"
                      : "0 2px 8px rgba(253,185,19,0.08)",
                  }}
                >
                  Transforming Climate Risk into
                </Box>
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    fontWeight: 900,
                    color: isDark ? "#86BC25" : "#86BC25",
                    letterSpacing: "-0.03em",
                    textShadow: isDark
                      ? "0 4px 24px rgba(253,185,19,0.25)"
                      : "0 2px 12px rgba(253,185,19,0.18)",
                    fontSize: {
                      xs: "2.5rem",
                      sm: "3.2rem",
                      md: "4.2rem",
                      lg: "5rem",
                    },
                    lineHeight: 1.05,
                  }}
                >
                  Opportunity
                </Box>
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  lineHeight: 1.6,
                  color: colors.muted,
                  mb: 3,
                  maxWidth: 500,
                }}
              >
                Comprehensive climate risk assessment and management platform
                for financial institutions, ensuring regulatory compliance and
                strategic resilience.
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={4}>
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={<PlayCircle />}
                  onClick={() => navigate("/demo")}
                  sx={{
                    backgroundColor: colors.secondary,
                    color: colors.primary,
                    px: 3,
                    py: 1,
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "4px",
                    minWidth: 180,
                    "&:hover": {
                      backgroundColor: alpha(colors.secondary, 0.9),
                      boxShadow: `0 4px 12px ${alpha(colors.secondary, 0.3)}`,
                    },
                  }}
                >
                  View Live Demo
                </Button>
              </Stack>
              <Stack
                direction="row"
                spacing={3}
                sx={{ pt: 3, borderTop: `1px solid ${colors.border}` }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Security sx={{ fontSize: 16, color: colors.secondary }} />
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: colors.muted,
                    }}
                  >
                    Central Bank of Nigeria Compliant
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Assessment sx={{ fontSize: 16, color: colors.secondary }} />
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: colors.muted,
                    }}
                  >
                    TCFD Aligned
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
              }}
            >
              <Card
                elevation={0}
                sx={{
                  backgroundColor: isDark
                    ? alpha("#2D2D2D", 0.5)
                    : alpha("#F8FAFC", 0.8),
                  border: `1px solid ${colors.border}`,
                  borderRadius: "4px",
                  p: 3,
                  backdropFilter: "blur(8px)",
                }}
              >
                <Stack spacing={2}>
                  <Box sx={{ textAlign: "center", mb: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: colors.text,
                        fontSize: "1rem",
                      }}
                    >
                      Platform Modules
                    </Typography>
                  </Box>

                  <Stack spacing={2}>
                    {modules.map((module, index) => {
                      const IconComponent = module.icon;
                      return (
                        <Card
                          key={index}
                          elevation={0}
                          sx={{
                            backgroundColor: isDark ? "#2D2D2D" : "#FFFFFF",
                            border: `1px solid ${colors.border}`,
                            borderRadius: "4px",
                            p: 2,
                            transition: "all 0.2s ease",
                            cursor: "default",
                          }}
                        >
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: "4px",
                                backgroundColor: alpha(colors.secondary, 0.1),
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              <IconComponent
                                sx={{ fontSize: 18, color: colors.secondary }}
                              />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                              >
                                <Typography
                                  sx={{
                                    fontSize: "0.875rem",
                                    fontWeight: 600,
                                    color: colors.text,
                                  }}
                                >
                                  {module.title}
                                </Typography>
                              </Stack>
                              <Typography
                                sx={{
                                  fontSize: "0.75rem",
                                  color: colors.muted,
                                  mt: 0.25,
                                }}
                              >
                                {module.description}
                              </Typography>
                            </Box>
                          </Stack>
                        </Card>
                      );
                    })}
                  </Stack>
                </Stack>
              </Card>
            </Box>
          </Grid>
        </Container>

        <Box
          sx={{
            borderTop: `1px solid ${colors.border}`,
            backgroundColor: alpha(colors.background, 0.98),
            backdropFilter: "blur(8px)",
            py: 2,
          }}
        >
          <Container maxWidth="lg">
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  color: colors.muted,
                  fontWeight: 500,
                }}
              >
                © {new Date().getFullYear()} Deloitte. All rights reserved.
              </Typography>
              <Stack direction="row" spacing={3}>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: colors.muted,
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": { color: colors.secondary },
                  }}
                  onClick={() => navigate("/privacy")}
                >
                  Privacy Policy
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: colors.muted,
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": { color: colors.secondary },
                  }}
                  onClick={() => navigate("/terms")}
                >
                  Terms of Service
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: colors.muted,
                    fontWeight: 500,
                    cursor: "pointer",
                    "&:hover": { color: colors.secondary },
                  }}
                  onClick={() => navigate("/compliance")}
                >
                  Compliance
                </Typography>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
