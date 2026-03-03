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
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  TableChart as TableChartIcon,
  PlaylistAddCheck as ListChecksIcon,
  PieChart as PieChartIcon,
  Dashboard as DashboardIcon,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useAuthStore } from "@/store/authStore";

const DRAWER_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

const WORKFLOW_ITEMS = [
  {
    id: "profiling",
    label: "Profiling",
    subLabel: "Define Scope",
    icon: ListChecksIcon,
    path: "/materiality/profiling",
  },
  {
    id: "input",
    label: "Data Input",
    subLabel: "Values & Weights",
    icon: TableChartIcon,
    path: "/materiality/data-input",
  },
  {
    id: "dashboard",
    label: "Analytics",
    subLabel: "Results View",
    icon: PieChartIcon,
    path: "/materiality",
  },
];

export default function MaterialitySidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isDark = theme.palette.mode === "dark";
  const [collapsed, setCollapsed] = useState(false);
  const currentWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const BRAND_GREEN = DELOITTE_COLORS.green.DEFAULT;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: currentWidth,
        flexShrink: 0,
        transition: "width 0.3s ease",
        "& .MuiDrawer-paper": {
          width: currentWidth,
          boxSizing: "border-box",
          bgcolor: isDark ? "#0B1120" : "#2D2D2D",
          color: "#fff",
          borderRight: "none",
          boxShadow: "4px 0 24px rgba(0,0,0,0.4)",
          backgroundImage: `linear-gradient(180deg, ${alpha("#1D1D1D", 0.95)} 0%, ${alpha("#2D2D2D", 0.98)} 100%)`,
          transition: "width 0.3s ease",
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      <Box
        sx={{
          p: collapsed ? 2 : 4,
          pb: 2,
          background: `linear-gradient(90deg, ${alpha(BRAND_GREEN, 0.1)} 0%, transparent 100%)`,
          borderBottom: `1px solid ${alpha(BRAND_GREEN, 0.1)}`,
          display: "flex",
          flexDirection: "column",
          alignItems: collapsed ? "center" : "flex-start",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: collapsed ? 0 : 1,
          }}
        >
          <Box
            component="img"
            src="/assets/images/small-dark.jpg"
            alt="Deloitte"
            sx={{
              height: 28,
              width: 28,
              objectFit: "contain",
            }}
          />
        </Box>
        {!collapsed && (
          <>
            <Typography
              variant="overline"
              sx={{
                color: BRAND_GREEN,
                letterSpacing: "0.2em",
                fontWeight: 700,
                fontSize: "0.65rem",
                display: "block",
                mt: 1,
              }}
            >
              Materiality Assessment
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.4)", display: "block" }}
            >
              FY 2026 Strategic Cycle
            </Typography>
          </>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, py: 4, px: collapsed ? 1 : 2 }}>
        {!collapsed && (
          <Typography
            variant="caption"
            sx={{
              pl: 2,
              mb: 2,
              display: "block",
              color: alpha(BRAND_GREEN, 0.7),
              fontWeight: 700,
              fontSize: "0.65rem",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            Workflow Stages
          </Typography>
        )}

        <List disablePadding>
          {WORKFLOW_ITEMS.map((item) => {
            const customMatch =
              item.id === "dashboard"
                ? location.pathname === "/materiality"
                : location.pathname.startsWith(item.path);

            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 1.5 }}>
                <Tooltip title={collapsed ? item.label : ""} placement="right">
                  <ListItemButton
                    onClick={() => navigate(item.path)}
                    selected={customMatch}
                    sx={{
                      borderRadius: "12px",
                      py: 1.5,
                      px: collapsed ? 1.5 : 2,
                      justifyContent: collapsed ? "center" : "flex-start",
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      bgcolor: customMatch
                        ? alpha(BRAND_GREEN, 0.15)
                        : "transparent",
                      border: `1px solid ${customMatch ? alpha(BRAND_GREEN, 0.3) : "transparent"}`,
                      "&:hover": {
                        bgcolor: alpha(BRAND_GREEN, 0.08),
                        transform: collapsed ? "none" : "translateX(4px)",
                      },
                      "&.Mui-selected": {
                        bgcolor: alpha(BRAND_GREEN, 0.15),
                        "&:hover": { bgcolor: alpha(BRAND_GREEN, 0.2) },
                      },
                    }}
                  >
                    {customMatch && !collapsed && (
                      <Box
                        sx={{
                          position: "absolute",
                          left: 0,
                          top: "50%",
                          transform: "translateY(-50%)",
                          height: "40%",
                          width: "4px",
                          bgcolor: BRAND_GREEN,
                          borderRadius: "0 4px 4px 0",
                          boxShadow: `0 0 12px ${BRAND_GREEN}`,
                        }}
                      />
                    )}

                    <ListItemIcon
                      sx={{
                        minWidth: collapsed ? 0 : 42,
                        color: customMatch
                          ? BRAND_GREEN
                          : "rgba(255,255,255,0.4)",
                        justifyContent: "center",
                      }}
                    >
                      <item.icon sx={{ fontSize: 22 }} />
                    </ListItemIcon>

                    {!collapsed && (
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: customMatch ? 600 : 400,
                            color: customMatch
                              ? "#fff"
                              : "rgba(255,255,255,0.7)",
                            fontSize: "0.95rem",
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "rgba(255,255,255,0.3)",
                            fontSize: "0.7rem",
                            display: "block",
                            mt: -0.3,
                          }}
                        >
                          {item.subLabel}
                        </Typography>
                      </Box>
                    )}

                    {customMatch && !collapsed && (
                      <Box sx={{ ml: "auto" }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: BRAND_GREEN,
                            boxShadow: `0 0 8px ${BRAND_GREEN}`,
                          }}
                        />
                      </Box>
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>

      <Box sx={{ p: collapsed ? 1.5 : 3, background: "rgba(0,0,0,0.2)" }}>
        {!collapsed ? (
          <>
            <Button
              fullWidth
              startIcon={<DashboardIcon />}
              onClick={() => navigate("/modules")}
              sx={{
                justifyContent: "flex-start",
                color: "rgba(255,255,255,0.6)",
                textTransform: "none",
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 1.5,
                mb: 2,
                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              Switch Module
            </Button>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                p: 2,
                borderRadius: "12px",
                bgcolor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: BRAND_GREEN,
                  color: "#000",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                }}
              >
                {user?.name?.charAt(0) || "U"}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  noWrap
                  sx={{ color: "#fff", fontWeight: 500 }}
                >
                  {user?.name || "User"}
                </Typography>
                <Typography
                  variant="caption"
                  noWrap
                  sx={{ color: "rgba(255,255,255,0.4)" }}
                >
                  {user?.role || "ESG Officer"}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Tooltip title="Switch Module" placement="right">
            <IconButton
              onClick={() => navigate("/modules")}
              sx={{
                width: "100%",
                color: "rgba(255,255,255,0.6)",
                "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              <DashboardIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
  );
}
