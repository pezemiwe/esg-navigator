import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Link,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
  Fade,
  LinearProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowForward,
  Lock,
  Email,
  Person,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/layout/AuthLayout/AuthLayout";
import { useAuthStore } from "@/store/authStore";
import { useLocation } from "react-router-dom";
export default function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const login = useAuthStore((state) => state.login);
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const DEMO_USERS = [
    {
      role: "Sustainability Champion",
      name: "Ngozi Eze",
      email: "sustainability-champion@deloitte.com",
      password: "champion123",
    },
    {
      role: "Sustainability Manager",
      name: "Dare Adeleke",
      email: "sustainability-manager@deloitte.com",
      password: "manager123",
    },
    {
      role: "Data Owner",
      name: "Amaka Obiora",
      email: "data-owner@deloitte.com",
      password: "owner123",
    },
    {
      role: "Data Owner 2",
      name: "Tunde Fashola",
      email: "data-owner2@deloitte.com",
      password: "owner456",
    },
    {
      role: "Data Owner 3",
      name: "Chidinma Obi",
      email: "data-owner3@deloitte.com",
      password: "owner789",
    },
    {
      role: "Data Owner 4",
      name: "Babatunde Okafor",
      email: "data-owner4@deloitte.com",
      password: "owner321",
    },
    {
      role: "Internal Audit",
      name: "Ifeoma Chukwudi",
      email: "approver@deloitte.com",
      password: "approver123",
    },
    {
      role: "Board",
      name: "Chief Adeyinka Ogunleye",
      email: "board@deloitte.com",
      password: "board123",
    },
    {
      role: "ERM Team",
      name: "Seun Afolabi",
      email: "erm@deloitte.com",
      password: "erm123",
    },
    {
      role: "Admin",
      name: "Zainab Murtala",
      email: "admin@deloitte.com",
      password: "admin123",
    },
  ];

  const handleRoleSelect = (roleLabel: string) => {
    setSelectedRole(roleLabel);
    const match = DEMO_USERS.find((u) => u.role === roleLabel);
    if (match) {
      setFormData({ email: match.email, password: match.password });
      if (error) setError(null);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(formData.email, formData.password);
      await new Promise((resolve) => setTimeout(resolve, 800));
      const state = location.state as {
        from?: string | { pathname: string; search?: string };
      };
      let from = "/industry-setup";
      if (state?.from) {
        if (typeof state.from === "string") {
          from = state.from;
        } else if (typeof state.from === "object" && state.from?.pathname) {
          from = state.from.pathname;
          if (state.from.search) {
            from += state.from.search;
          }
        }
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(null);
  };
  return (
    <AuthLayout>
      <Fade in={true} timeout={600}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 480,
            mx: "auto",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -100,
              left: "50%",
              transform: "translateX(-50%)",
              width: 400,
              height: 400,
              background: `radial-gradient(circle, ${alpha("#86BC25", 0.15)} 0%, transparent 70%)`,
              filter: "blur(60px)",
              pointerEvents: "none",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              backgroundColor: isDark
                ? alpha("#2D2D2D", 0.98)
                : "rgba(255, 255, 255, 0.98)",
              border: `1px solid ${
                isDark ? alpha("#86BC25", 0.1) : alpha("#E2E8F0", 0.9)
              }`,
              boxShadow: isDark
                ? `0 20px 60px ${alpha("#000000", 0.4)}, 0 0 0 1px ${alpha("#86BC25", 0.05)}`
                : `0 20px 60px ${alpha("#000000", 0.08)}, 0 0 0 1px ${alpha("#86BC25", 0.1)}`,
              overflow: "hidden",
              backdropFilter: "blur(20px)",
            }}
          >
            <Box
              sx={{
                height: 2,
                backgroundColor: "#86BC25",
              }}
            />
            <Box
              sx={{
                p: 4.5,
                pt: 1.5,
                pb: 1.5,
                borderBottom: `1px solid ${
                  isDark ? alpha("#334155", 0.3) : "#F1F5F9"
                }`,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  my: 2,
                }}
              >
                <Box
                  component="img"
                  src={
                    isDark
                      ? "/assets/images/logo2.png"
                      : "/assets/images/logo.png"
                  }
                  alt="Deloitte"
                  sx={{
                    height: 40,
                    width: "auto",
                  }}
                />
                <Box
                  sx={{
                    height: 28,
                    width: "1.5px",
                    background: isDark
                      ? `linear-gradient(180deg, transparent, ${alpha("#86BC25", 0.5)}, transparent)`
                      : `linear-gradient(180deg, transparent, ${alpha("#E2E8F0", 0.8)}, transparent)`,
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      color: isDark ? "#94A3B8" : "#64748B",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      letterSpacing: "0.08em",
                      mb: 0.25,
                    }}
                  >
                    ESG NAVIGATOR
                  </Typography>
                </Box>
              </Box>
              <Stack
                sx={{
                  mt: 4.5,
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.75rem",
                    fontWeight: 700,
                    color: isDark ? "#FFFFFF" : "#1D1D1D",
                    mb: 1,
                    lineHeight: 1,
                  }}
                >
                  Welcome back
                </Typography>
                <Typography
                  sx={{
                    fontSize: "0.9375rem",
                    color: isDark ? alpha("#FFFFFF", 0.65) : "#64748B",
                    lineHeight: 1,
                    fontWeight: 400,
                  }}
                >
                  Sign in to access your ESG Navigator dashboard
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ p: 4, pt: 3 }}>
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: isDark
                      ? alpha("#DC2626", 0.1)
                      : alpha("#FEE2E2", 0.8),
                    color: isDark ? "#FCA5A5" : "#DC2626",
                    border: `1px solid ${isDark ? alpha("#DC2626", 0.2) : "#FCA5A5"}`,
                  }}
                >
                  {error}
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {/* Role selector */}
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: isDark ? alpha("#FFFFFF", 0.9) : "#334155",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      <Person
                        sx={{ fontSize: 15, opacity: 0.8, color: "#86BC25" }}
                      />
                      Sign in as
                    </Typography>
                    <FormControl fullWidth size="medium">
                      <Select
                        displayEmpty
                        value={selectedRole}
                        onChange={(e) => handleRoleSelect(e.target.value)}
                        disabled={isLoading}
                        renderValue={(val) =>
                          val ? (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                sx={{ fontWeight: 600, fontSize: "0.9375rem" }}
                              >
                                {val}
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: "0.8125rem",
                                  color: "text.secondary",
                                }}
                              >
                                &mdash;{" "}
                                {DEMO_USERS.find((u) => u.role === val)?.name}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography
                              sx={{
                                color: isDark ? alpha("#fff", 0.35) : "#94A3B8",
                                fontSize: "0.9375rem",
                              }}
                            >
                              Select a role to continue…
                            </Typography>
                          )
                        }
                        sx={{
                          backgroundColor: isDark
                            ? alpha("#1D1D1D", 0.5)
                            : "#FAFAFA",
                          borderRadius: "8px",
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: isDark
                              ? alpha("#475569", 0.4)
                              : "#E2E8F0",
                            borderWidth: "1.5px",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: isDark
                              ? alpha("#86BC25", 0.5)
                              : alpha("#86BC25", 0.6),
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#86BC25",
                            borderWidth: "2px",
                          },
                          "& .MuiSelect-select": {
                            padding: "13px 16px",
                            color: isDark ? "#FFFFFF" : "#1D1D1D",
                          },
                        }}
                      >
                        {DEMO_USERS.map((u) => (
                          <MenuItem key={u.role} value={u.role}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                width: "100%",
                              }}
                            >
                              <Typography
                                sx={{ fontWeight: 600, fontSize: "0.875rem" }}
                              >
                                {u.role}
                              </Typography>
                              <Typography
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.8125rem",
                                }}
                              >
                                &mdash; {u.name}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: isDark ? alpha("#FFFFFF", 0.9) : "#334155",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      <Email
                        sx={{
                          fontSize: 15,
                          opacity: 0.8,
                          color: "#86BC25",
                        }}
                      />
                      Email Address
                    </Typography>
                    <TextField
                      fullWidth
                      name="email"
                      type="email"
                      placeholder="you@deloitte.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      size="medium"
                      disabled={isLoading}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: isDark
                            ? alpha("#1D1D1D", 0.5)
                            : "#FAFAFA",
                          borderRadius: "8px",
                          transition: "all 0.3s ease",
                          "& fieldset": {
                            borderColor: isDark
                              ? alpha("#475569", 0.4)
                              : "#E2E8F0",
                            borderWidth: "1.5px",
                          },
                          "&:hover fieldset": {
                            borderColor: isDark
                              ? alpha("#86BC25", 0.5)
                              : alpha("#86BC25", 0.6),
                          },
                          "&.Mui-focused": {
                            backgroundColor: isDark
                              ? alpha("#1D1D1D", 0.7)
                              : "#FFFFFF",
                            "& fieldset": {
                              borderColor: "#86BC25",
                              borderWidth: "2px",
                            },
                            boxShadow: `0 0 0 4px ${alpha("#86BC25", 0.12)}`,
                          },
                          "& input": {
                            color: isDark ? "#FFFFFF" : "#1D1D1D",
                            fontSize: "0.9375rem",
                            padding: "13px 16px",
                            fontWeight: 500,
                          },
                        },
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontSize: "0.8125rem",
                        fontWeight: 600,
                        color: isDark ? alpha("#FFFFFF", 0.9) : "#334155",
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                      }}
                    >
                      <Lock
                        sx={{
                          fontSize: 15,
                          opacity: 0.8,
                          color: "#86BC25",
                        }}
                      />
                      Password
                    </Typography>
                    <TextField
                      fullWidth
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      variant="outlined"
                      size="medium"
                      disabled={isLoading}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              disabled={isLoading}
                              sx={{
                                color: isDark ? "#94A3B8" : "#64748B",
                                mr: 0.5,
                                "&:hover": {
                                  backgroundColor: isDark
                                    ? alpha("#86BC25", 0.1)
                                    : alpha("#86BC25", 0.08),
                                  color: "#86BC25",
                                },
                              }}
                            >
                              {showPassword ? (
                                <VisibilityOff fontSize="small" />
                              ) : (
                                <Visibility fontSize="small" />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: isDark
                            ? alpha("#1D1D1D", 0.5)
                            : "#FAFAFA",
                          borderRadius: "8px",
                          transition: "all 0.3s ease",
                          "& fieldset": {
                            borderColor: isDark
                              ? alpha("#475569", 0.4)
                              : "#E2E8F0",
                            borderWidth: "1.5px",
                          },
                          "&:hover fieldset": {
                            borderColor: isDark
                              ? alpha("#86BC25", 0.5)
                              : alpha("#86BC25", 0.6),
                          },
                          "&.Mui-focused": {
                            backgroundColor: isDark
                              ? alpha("#1D1D1D", 0.7)
                              : "#FFFFFF",
                            "& fieldset": {
                              borderColor: "#86BC25",
                              borderWidth: "2px",
                            },
                            boxShadow: `0 0 0 4px ${alpha("#86BC25", 0.12)}`,
                          },
                          "& input": {
                            color: isDark ? "#FFFFFF" : "#1D1D1D",
                            fontSize: "0.9375rem",
                            padding: "13px 16px",
                            fontWeight: 500,
                          },
                        },
                      }}
                    />
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 1,
                      }}
                    >
                      <Link
                        href="#"
                        underline="none"
                        sx={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "#86BC25",
                          display: "flex",
                          alignItems: "center",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            color: "#6B9B1E",
                            transform: "translateX(2px)",
                          },
                        }}
                      >
                        Forgot password?
                      </Link>
                    </Box>
                  </Box>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isLoading}
                    endIcon={!isLoading && <ArrowForward />}
                    sx={{
                      backgroundColor: "#86BC25",
                      color: "#FFFFFF",
                      fontWeight: 700,
                      px: 3,
                      py: 1.5,
                      textTransform: "none",
                      fontSize: "1rem",
                      borderRadius: "8px",
                      boxShadow: `0 4px 16px ${alpha("#86BC25", 0.3)}`,
                      mt: 1,
                      "&:hover": {
                        backgroundColor: "#6B9B1E",
                        boxShadow: `0 8px 24px ${alpha("#86BC25", 0.4)}`,
                        transform: "translateY(-1px)",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                      "&:disabled": {
                        backgroundColor: isDark
                          ? alpha("#475569", 0.3)
                          : alpha("#CBD5E1", 0.5),
                        color: isDark
                          ? alpha("#FFFFFF", 0.3)
                          : alpha("#64748B", 0.5),
                        boxShadow: "none",
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  {isLoading && (
                    <LinearProgress
                      sx={{
                        height: 2,
                        borderRadius: 1,
                        backgroundColor: isDark
                          ? alpha("#475569", 0.3)
                          : alpha("#CBD5E1", 0.3),
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: "#86BC25",
                          backgroundSize: "200% 100%",
                          animation: "loading 1.5s ease-in-out infinite",
                        },
                        "@keyframes loading": {
                          "0%": { backgroundPosition: "200% 0" },
                          "100%": { backgroundPosition: "-200% 0" },
                        },
                      }}
                    />
                  )}
                </Stack>
              </form>
            </Box>
            <Box
              sx={{
                p: 2.5,
                pt: 2,
                borderTop: `1px solid ${
                  isDark ? alpha("#334155", 0.3) : "#F1F5F9"
                }`,
                textAlign: "center",
                background: isDark
                  ? alpha("#1D1D1D", 0.3)
                  : alpha("#F8FAFC", 0.8),
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  color: isDark ? alpha("#FFFFFF", 0.6) : "#64748B",
                  lineHeight: 1,
                  fontWeight: 500,
                }}
              >
                Need access?{" "}
                <Link
                  href="#"
                  underline="none"
                  sx={{
                    fontWeight: 700,
                    color: "#86BC25",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "#6B9B1E",
                    },
                  }}
                >
                  Contact system administrator
                </Link>
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              mt: 3.5,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: isDark ? alpha("#FFFFFF", 0.45) : "#94A3B8",
                lineHeight: 1.6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                fontWeight: 500,
              }}
            >
              <Lock sx={{ fontSize: 13, opacity: 0.7 }} />
              All access is logged and monitored for security purposes
            </Typography>
          </Box>
        </Box>
      </Fade>
    </AuthLayout>
  );
}
