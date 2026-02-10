import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  Typography,
  useTheme,
  alpha,
  Avatar,
  Button,
  Divider,
  Tooltip,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  TrackChanges as TrackChangesIcon,
  Public as PublicIcon,
  Assessment as AssessmentIcon,
  ArrowBack,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    subLabel: "Overview & KPIs",
    icon: DashboardIcon,
    path: "/sdg-ndc",
  },
  {
    id: "sdg-alignment",
    label: "SDG Alignment",
    subLabel: "17 Goals Mapping",
    icon: PublicIcon,
    path: "/sdg-ndc/sdg-alignment",
  },
  {
    id: "ndc-tracker",
    label: "NDC Tracker",
    subLabel: "Nigeria's Commitments",
    icon: TrackChangesIcon,
    path: "/sdg-ndc/ndc-tracker",
  },
  {
    id: "reports",
    label: "Reports & Disclosure",
    subLabel: "Regulatory Filings",
    icon: AssessmentIcon,
    path: "/sdg-ndc/reports",
  },
];

export default function SDGLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isDark = theme.palette.mode === "dark";
  const BRAND_GREEN = DELOITTE_COLORS.green.DEFAULT;
  const [collapsed, setCollapsed] = useState(false);
  const currentWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: currentWidth,
          flexShrink: 0,
          transition: "width 0.3s ease",
          "& .MuiDrawer-paper": {
            width: currentWidth,
            boxSizing: "border-box",
            bgcolor: isDark ? "#0B1120" : "#FAFBFC",
            borderRight: `1px solid ${isDark ? alpha("#fff", 0.06) : alpha("#000", 0.08)}`,
            display: "flex",
            flexDirection: "column",
            transition: "width 0.3s ease",
            overflow: "hidden",
            position: "relative",
          },
        }}
      >
        <Box sx={{ p: collapsed ? 1.5 : 2.5, pb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              cursor: "pointer",
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onClick={() => navigate("/modules")}
          >
            <Box
              component="img"
              src={
                isDark
                  ? "/assets/images/small-dark.jpg"
                  : "/assets/images/small-light.png"
              }
              alt="Deloitte"
              sx={{
                height: 28,
                width: 28,
                objectFit: "contain",
              }}
            />
            {!collapsed && (
              <>
                <Box
                  sx={{
                    height: 28,
                    width: 4,
                    bgcolor: BRAND_GREEN,
                    borderRadius: 1,
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: isDark ? "#FFFFFF" : "#334155",
                      lineHeight: 1.1,
                      fontSize: "0.9rem",
                    }}
                  >
                    ESG Navigator
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 500,
                      color: BRAND_GREEN,
                      lineHeight: 1,
                      fontSize: "0.75rem",
                      letterSpacing: 0.5,
                    }}
                  >
                    SDG & NDC Alignment
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ mx: collapsed ? 1 : 2, my: 1, opacity: 0.5 }} />

        <List sx={{ px: collapsed ? 1 : 1.5, flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={collapsed ? item.label : ""} placement="right">
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    sx={{
                      borderRadius: 1.5,
                      py: 1.5,
                      px: collapsed ? 1.5 : 2,
                      justifyContent: collapsed ? "center" : "flex-start",
                      bgcolor: isActive
                        ? alpha(BRAND_GREEN, isDark ? 0.15 : 0.1)
                        : "transparent",
                      borderLeft:
                        isActive && !collapsed
                          ? `3px solid ${BRAND_GREEN}`
                          : "3px solid transparent",
                      "&:hover": {
                        bgcolor: isActive
                          ? alpha(BRAND_GREEN, isDark ? 0.2 : 0.15)
                          : alpha(BRAND_GREEN, 0.05),
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 36,
                        justifyContent: "center",
                      }}
                    >
                      <Icon
                        sx={{
                          color: isActive
                            ? BRAND_GREEN
                            : isDark
                              ? alpha("#fff", 0.4)
                              : alpha("#000", 0.4),
                          fontSize: 20,
                        }}
                      />
                    </ListItemIcon>
                    {!collapsed && (
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: isActive ? 700 : 500,
                            color: isActive
                              ? BRAND_GREEN
                              : isDark
                                ? alpha("#fff", 0.8)
                                : "text.primary",
                            lineHeight: 1.3,
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: isDark
                              ? alpha("#fff", 0.35)
                              : alpha("#000", 0.4),
                            fontSize: "0.65rem",
                          }}
                        >
                          {item.subLabel}
                        </Typography>
                      </Box>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ p: collapsed ? 1 : 2 }}>
          {!collapsed && <ThemeToggle />}
          <Divider sx={{ my: 1.5, opacity: 0.3 }} />
          {!collapsed && (
            <>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: BRAND_GREEN,
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "U"}
                </Avatar>
                <Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ fontSize: "0.8rem" }}
                  >
                    {user?.name || "User"}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "0.65rem" }}
                  >
                    {user?.role || "Analyst"}
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                startIcon={<ArrowBack sx={{ fontSize: 14 }} />}
                onClick={() => navigate("/modules")}
                sx={{
                  mt: 0.5,
                  color: isDark ? alpha("#fff", 0.5) : alpha("#000", 0.5),
                  textTransform: "none",
                  fontSize: "0.75rem",
                  "&:hover": { color: BRAND_GREEN },
                }}
              >
                Back to Modules
              </Button>
            </>
          )}
        </Box>

        <Box
          onClick={() => setCollapsed(!collapsed)}
          sx={{
            position: "absolute",
            top: "50%",
            right: -7,
            transform: "translateY(-50%)",
            width: 14,
            height: 56,
            backgroundColor: isDark ? "#3D3D3D" : "#333333",
            border: "none",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            zIndex: 10,
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#444444",
            },
          }}
        >
          {collapsed ? (
            <ChevronRight sx={{ fontSize: 10, color: "#FFFFFF" }} />
          ) : (
            <ChevronLeft sx={{ fontSize: 10, color: "#FFFFFF" }} />
          )}
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          bgcolor: isDark ? "#1D1D1D" : "#F8FAFC",
          height: "100vh",
          overflowY: "auto",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
