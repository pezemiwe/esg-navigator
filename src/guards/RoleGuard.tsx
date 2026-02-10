import { type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import {
  Box,
  Typography,
  Button,
  Container,
  alpha,
  useTheme,
} from "@mui/material";
import { Block, ArrowBack } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: ReactNode;
}

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: isDark ? "#1D1D1D" : "#F8FAFC",
        }}
      >
        <Container maxWidth="sm">
          <Box
            sx={{
              textAlign: "center",
              backgroundColor: isDark
                ? alpha("#2D2D2D", 0.8)
                : alpha("#FFFFFF", 0.95),
              p: 6,
              borderRadius: 3,
              border: `1px solid ${isDark ? alpha("#475569", 0.3) : "#E2E8F0"}`,
              boxShadow: isDark
                ? `0 20px 60px ${alpha("#000000", 0.4)}`
                : `0 20px 60px ${alpha("#000000", 0.08)}`,
            }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                backgroundColor: alpha("#86BC25", 0.1),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
              }}
            >
              <Block sx={{ fontSize: 40, color: "#86BC25" }} />
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: isDark ? "#FFFFFF" : "#1D1D1D",
              }}
            >
              Access Denied
            </Typography>

            <Typography
              sx={{
                fontSize: "1.125rem",
                color: isDark ? alpha("#FFFFFF", 0.7) : "#64748B",
                mb: 1,
              }}
            >
              You don't have permission to access this page.
            </Typography>

            <Typography
              sx={{
                fontSize: "0.9375rem",
                color: isDark ? alpha("#FFFFFF", 0.5) : "#94A3B8",
                mb: 4,
              }}
            >
              Your role:{" "}
              <strong>{user.role.replace("_", " ").toUpperCase()}</strong>
            </Typography>

            <Button
              variant="contained"
              startIcon={<ArrowBack />}
              onClick={() => navigate("/dashboard")}
              sx={{
                backgroundColor: "#86BC25",
                color: "#FFFFFF",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                textTransform: "none",
                fontSize: "0.9375rem",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "#6B9B1E",
                  boxShadow: `0 8px 24px ${alpha("#86BC25", 0.3)}`,
                },
              }}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return <>{children}</>;
}
