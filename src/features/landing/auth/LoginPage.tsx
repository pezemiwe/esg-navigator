import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Divider,
  Link,
  IconButton,
  InputAdornment,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  ArrowForward,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";
import AuthLayout from "@/components/layout/AuthLayout";
export default function LoginPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { toggleTheme } = useThemeStore();
  const isDark = theme.palette.mode === "dark";
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "admin@deloitte.com",
    password: "admin123",
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  return (
    <AuthLayout>
      <Box
        sx={{
          backgroundColor: isDark
            ? alpha("#2D2D2D", 0.8)
            : alpha("#FFFFFF", 0.95),
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: 3,
          border: `1px solid ${isDark ? alpha("#475569", 0.3) : alpha("#E2E8F0", 0.8)}`,
          boxShadow: isDark
            ? `0 20px 60px ${alpha("#000000", 0.5)}`
            : `0 20px 60px ${alpha("#000000", 0.08)}`,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 4,
            pb: 3,
            borderBottom: `1px solid ${isDark ? alpha("#475569", 0.3) : "#E2E8F0"}`,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 16,
              rit: 16,
            }}
          >
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{
                color: isDark ? "#94A3B8" : "#64748B",
                "&:hover": {
                  backgroundColor: isDark
                    ? alpha("#475569", 0.2)
                    : alpha("#64748B", 0.1),
                },
              }}
            >
              {isDark ? (
                <Brightness7 fontSize="small" />
              ) : (
                <Brightness4 fontSize="small" />
              )}
            </IconButton>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <Box
              component="img"
              src={
                isDark ? "/assets/images/logo2.png" : "/assets/images/logo.png"
              }
              alt="Deloitte"
              sx={{
                height: 40,
                width: "auto",
              }}
            />
            <Box
              sx={{
                height: 30,
                width: "1px",
                backgroundColor: isDark ? alpha("#475569", 0.5) : "#E2E8F0",
              }}
            />
            <Typography
              sx={{
                color: isDark ? "#94A3B8" : "#475569",
                fontWeight: 600,
                fontSize: "0.875rem",
                letterSpacing: "0.02em",
              }}
            >
              ESG NAVIGATOR
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: isDark ? "#FFFFFF" : "#1D1D1D",
              mb: 1,
            }}
          >
            Welcome Back
          </Typography>
          <Typography
            sx={{
              fontSize: "0.95rem",
              color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
            }}
          >
            Sign in to access your climate risk dashboard
          </Typography>
        </Box>
        <Box sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: isDark ? "#FFFFFF" : "#334155",
                    mb: 1,
                  }}
                >
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
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: isDark
                        ? alpha("#1D1D1D", 0.4)
                        : "#FFFFFF",
                      borderRadius: "6px",
                      "& fieldset": {
                        borderColor: isDark ? alpha("#475569", 0.5) : "#E2E8F0",
                      },
                      "&:hover fieldset": {
                        borderColor: isDark ? "#475569" : "#CBD5E1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#86BC25",
                        borderWidth: "2px",
                      },
                      "& input": {
                        color: isDark ? "#FFFFFF" : "#1D1D1D",
                      },
                    },
                  }}
                />
              </Box>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: isDark ? "#FFFFFF" : "#334155",
                    mb: 1,
                  }}
                >
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
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          sx={{
                            color: isDark ? "#94A3B8" : "#64748B",
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
                        ? alpha("#1D1D1D", 0.4)
                        : "#FFFFFF",
                      borderRadius: "6px",
                      "& fieldset": {
                        borderColor: isDark ? alpha("#475569", 0.5) : "#E2E8F0",
                      },
                      "&:hover fieldset": {
                        borderColor: isDark ? "#475569" : "#CBD5E1",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#86BC25",
                        borderWidth: "2px",
                      },
                      "& input": {
                        color: isDark ? "#FFFFFF" : "#1D1D1D",
                      },
                    },
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Link
                  href="#"
                  underline="none"
                  sx={{
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#86BC25",
                    "&:hover": {
                      color: "#6B9B1E",
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{
                  backgroundColor: "#86BC25",
                  color: "#FFFFFF",
                  fontWeight: 600,
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  borderRadius: "6px",
                  boxShadow: "none",
                  "&:hover": {
                    backgroundColor: "#6B9B1E",
                    boxShadow: `0 6px 16px ${alpha("#86BC25", 0.3)}`,
                  },
                }}
              >
                Sign In
              </Button>
              <Divider
                sx={{
                  "&::before, &::after": {
                    borderColor: isDark ? alpha("#475569", 0.3) : "#E2E8F0",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: isDark ? alpha("#FFFFFF", 0.5) : "#94A3AF",
                    px: 2,
                  }}
                >
                  OR
                </Typography>
              </Divider>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => navigate("/")}
                sx={{
                  borderColor: isDark ? alpha("#475569", 0.5) : "#CBD5E1",
                  color: isDark ? "#94A3B8" : "#475569",
                  fontWeight: 500,
                  py: 1.5,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  borderRadius: "6px",
                  "&:hover": {
                    borderColor: isDark ? "#86BC25" : "#86BC25",
                    backgroundColor: alpha("#86BC25", 0.05),
                    color: "#86BC25",
                  },
                }}
              >
                Back to Home
              </Button>
            </Stack>
          </form>
        </Box>
        <Box
          sx={{
            p: 3,
            pt: 2,
            borderTop: `1px solid ${isDark ? alpha("#475569", 0.3) : "#E2E8F0"}`,
            textAlign: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.875rem",
              color: isDark ? alpha("#FFFFFF", 0.6) : "#64748B",
            }}
          >
            Need access?{" "}
            <Link
              href="#"
              underline="none"
              sx={{
                fontWeight: 600,
                color: "#86BC25",
                "&:hover": {
                  color: "#6B9B1E",
                },
              }}
            >
              Contact your administrator
            </Link>
          </Typography>
        </Box>
      </Box>
    </AuthLayout>
  );
}
