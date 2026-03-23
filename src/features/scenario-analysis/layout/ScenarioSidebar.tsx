import { useState } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  useTheme,
  alpha,
  Avatar,
  Button,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  LayoutDashboard,
  PlayCircle,
  Library,
  FileBarChart,
  ChevronLeft,
  Calculator,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useAuthStore } from "@/store/authStore";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

export default function ScenarioSidebar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isDark = theme.palette.mode === "dark";
  const [collapsed, setCollapsed] = useState(false);
  const currentWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const menuItems = [
    {
      id: "dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      path: "/scenario-analysis",
    },
    {
      id: "run",
      label: "Run Simulation",
      icon: PlayCircle,
      path: "/scenario-analysis/run",
    },
    {
      id: "quant",
      label: "Quant Analysis",
      icon: Calculator,
      path: "/scenario-analysis/quant",
    },
    {
      id: "library",
      label: "Scenario Library",
      icon: Library,
      path: "/scenario-analysis/library",
    },
    {
      id: "reports",
      label: "Stress Test Reports",
      icon: FileBarChart,
      path: "/scenario-analysis/reports",
    },
  ];

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
          backgroundColor: isDark ? "#1D1D1D" : "#FFFFFF",
          borderRight: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary,
          transition: "width 0.3s ease",
          overflow: "hidden",
          position: "relative",
        },
      }}
    >
      <Box
        sx={{
          height: 72,
          p: collapsed ? 1.5 : 2.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
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
          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 800,
                lineHeight: 1.2,
                letterSpacing: "-0.5px",
                color: isDark ? "#FFF" : DELOITTE_COLORS.slate.dark,
                fontSize: "0.85rem",
              }}
            >
              Scenario Lab
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: DELOITTE_COLORS.green.DEFAULT,
                fontSize: "0.65rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Stress Testing
            </Typography>
          </Box>
        )}
      </Box>
      <Divider sx={{ mx: collapsed ? 1 : 3, mb: 2 }} />
      <List sx={{ px: collapsed ? 1 : 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={collapsed ? item.label : ""} placement="right">
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: "8px",
                    minHeight: 44,
                    justifyContent: collapsed ? "center" : "flex-start",
                    px: collapsed ? 1.5 : 2,
                    backgroundColor: isActive
                      ? alpha(DELOITTE_COLORS.green.DEFAULT, 0.15)
                      : "transparent",
                    color: isActive
                      ? DELOITTE_COLORS.green.dark
                      : theme.palette.text.secondary,
                    "&:hover": {
                      backgroundColor: alpha(
                        DELOITTE_COLORS.green.DEFAULT,
                        0.05,
                      ),
                      color: isActive
                        ? DELOITTE_COLORS.green.dark
                        : theme.palette.text.primary,
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 0 : 36,
                      color: "inherit",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.9rem",
                        fontWeight: isActive ? 600 : 500,
                      }}
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: collapsed ? 1 : 2 }}>
        {!collapsed ? (
          <>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<ChevronLeft size={16} />}
              onClick={() => navigate("/modules")}
              sx={{
                borderColor: theme.palette.divider,
                color: theme.palette.text.secondary,
                justifyContent: "flex-start",
                textTransform: "none",
                mb: 2,
                "&:hover": {
                  borderColor: DELOITTE_COLORS.green.DEFAULT,
                  color: DELOITTE_COLORS.green.DEFAULT,
                  backgroundColor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05),
                },
              }}
            >
              Switch Modules
            </Button>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                backgroundColor: isDark
                  ? alpha("#2D2D2D", 0.5)
                  : alpha("#F1F5F9", 0.8),
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Avatar
                sx={{ width: 32, height: 32, fontSize: "0.875rem" }}
                src={user?.avatar}
              >
                {user?.name.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {user?.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  noWrap
                >
                  {user?.role}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Tooltip title="Switch Modules" placement="right">
            <IconButton
              onClick={() => navigate("/modules")}
              sx={{
                width: "100%",
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: DELOITTE_COLORS.green.DEFAULT,
                  backgroundColor: alpha(DELOITTE_COLORS.green.DEFAULT, 0.05),
                },
              }}
            >
              <ChevronLeft size={18} />
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
          <ChevronsRight size={10} color="#FFFFFF" />
        ) : (
          <ChevronsLeft size={10} color="#FFFFFF" />
        )}
      </Box>
    </Drawer>
  );
}
