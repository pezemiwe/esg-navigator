import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Button,
  alpha,
  useTheme,
  Divider,
  Chip,
  Badge,
} from "@mui/material";
import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import CorporateFareIcon from "@mui/icons-material/CorporateFare";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import UploadIcon from "@mui/icons-material/Upload";
import AssessmentIcon from "@mui/icons-material/Assessment";
import PieChartIcon from "@mui/icons-material/PieChart";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import TimelineIcon from "@mui/icons-material/Timeline";
import BusinessIcon from "@mui/icons-material/Business";
import DescriptionIcon from "@mui/icons-material/Description";
export default function DashboardNavbar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const primaryColor = DELOITTE_COLORS.slate.dark;
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const subModuleTitle = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/cra")) return "Credit Risk Analysis";
    if (path.startsWith("/materiality")) return "Materiality Assessment";
    if (path.startsWith("/scenario-analysis")) return "Scenario Analysis";
    if (path.startsWith("/reports")) return "Reporting Hub";
    if (path.startsWith("/dashboard")) return "Executive Dashboard";
    if (path.startsWith("/capacity-building")) return "Learning Hub";
    if (path.startsWith("/sdg-ndc")) return "SDG & NDC Alignment";
    if (path.startsWith("/esrm")) return "E&S Risk Management";
    return "Sustainability Platform";
  }, [location.pathname]);
  const [modulesAnchorEl, setModulesAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [notificationsAnchorEl, setNotificationsAnchorEl] =
    useState<null | HTMLElement>(null);
  if (!user) return null;
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleModulesMenu = (event: React.MouseEvent<HTMLElement>) => {
    setModulesAnchorEl(event.currentTarget);
  };
  const handleModulesClose = () => {
    setModulesAnchorEl(null);
  };
  const handleNotifications = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const primaryAccent = "#86BC25";
  const brandColor = "#3D3F42";
  const darkBg = "#1D1D1D";
  const litBg = "#FFFFFF";
  const textDark = "#334155";
  const textLit = "#FFFFFF";
  const backgroundColor = isDark
    ? alpha("#1D1D1D", 0.9)
    : alpha("#FFFFFF", 0.95);
  const borderColor = isDark
    ? `1px solid ${alpha(primaryAccent, 0.1)}`
    : `1px solid ${alpha(brandColor, 0.1)}`;
  const textColor = isDark ? textLit : textDark;
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        background: backgroundColor,
        color: textColor,
        borderBottom: `1px solid ${alpha(primaryAccent, 0.3)}`,
        zIndex: theme.zIndex.drawer + 1,
        height: 70,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <Toolbar sx={{ minHeight: 70, px: 3 }}>
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 3, flexGrow: 1 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
            }}
            onClick={() => navigate("/modules")}
          >
            <Box
              component="img"
              src={
                isDark ? "/assets/images/logo2.png" : "/assets/images/logo.png"
              }
              alt="Deloitte"
              sx={{
                height: 40,
                width: "auto",
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.05)" },
              }}
            />
            <Box
              sx={{
                display: { xs: "none", lg: "flex" },
                flexDirection: "column",
                borderLeft: `2px solid ${DELOITTE_COLORS.green.DEFAULT}`,
                pl: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  lineHeight: 1.2,
                  color: isDark ? "#fff" : "#1D1D1D",
                }}
              >
                ESG Navigator
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: DELOITTE_COLORS.green.DEFAULT,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {subModuleTitle}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 4 }}>
            <Button
              color="inherit"
              onClick={() => navigate("/cra/dashboard")}
              sx={{
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "none",
                borderRadius: 1,
                px: 2,
                py: 1,
                "&:hover": {
                  backgroundColor: isDark
                    ? alpha("#fff", 0.1)
                    : alpha(textDark, 0.05),
                },
              }}
            >
              Overview
            </Button>
            <Button
              color="inherit"
              onClick={handleModulesMenu}
              endIcon={<ArrowDropDownIcon />}
              sx={{
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "none",
                borderRadius: 1,
                px: 2,
                py: 1,
                "&:hover": {
                  backgroundColor: isDark
                    ? alpha("#fff", 0.1)
                    : alpha(textDark, 0.05),
                },
              }}
            >
              Modules
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate("/reports")}
              sx={{
                fontWeight: 600,
                fontSize: "0.875rem",
                textTransform: "none",
                borderRadius: 1,
                px: 2,
                py: 1,
                "&:hover": {
                  backgroundColor: isDark
                    ? alpha("#fff", 0.1)
                    : alpha(textDark, 0.05),
                },
              }}
            >
              Reports
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<UploadIcon />}
            onClick={() => navigate("/cra/data")}
            sx={{
              color: textColor,
              borderColor: isDark ? alpha("#fff", 0.3) : alpha(textDark, 0.3),
              textTransform: "none",
              fontSize: "0.75rem",
              fontWeight: 500,
              borderRadius: 1, // Sharp
              px: 1.5,
              height: "40px",
              "&:hover": {
                borderColor: primaryAccent,
                backgroundColor: alpha(primaryAccent, 0.1),
              },
            }}
          >
            Upload Data
          </Button>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <ThemeToggle />
          </Box>
          <IconButton
            size="small"
            onClick={handleNotifications}
            sx={{
              color: textColor,
              "&:hover": {
                backgroundColor: isDark
                  ? alpha("#fff", 0.1)
                  : alpha(textDark, 0.05),
              },
            }}
          >
            <Badge badgeContent={3} color="error">
              <NotificationsIcon fontSize="medium" />
            </Badge>
          </IconButton>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 1 }}>
            <IconButton onClick={handleMenu} sx={{ p: 0.5 }}>
              <Avatar
                src={user.avatar}
                alt={user.name}
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: isDark
                    ? alpha(primaryAccent, 0.3)
                    : alpha(primaryAccent, 0.1),
                  color: isDark ? textLit : brandColor,
                  border: `2px solid ${isDark ? alpha(primaryAccent, 0.4) : alpha(primaryAccent, 0.5)}`,
                  fontWeight: 600,
                }}
              >
                {user.name?.[0]?.toUpperCase() || <PersonIcon />}
              </Avatar>
            </IconButton>
          </Box>
        </Box>
        <Menu
          anchorEl={modulesAnchorEl}
          open={Boolean(modulesAnchorEl)}
          onClose={handleModulesClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1.5,
              minWidth: 300,
              borderRadius: 1, // Sharp
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? darkBg : litBg,
            },
          }}
        >
          <MenuItem
            sx={{
              py: 1.5,
              px: 2,
              fontWeight: 700,
              color: isDark ? primaryAccent : brandColor,
              backgroundColor: isDark
                ? alpha(primaryAccent, 0.1)
                : alpha(primaryAccent, 0.08),
            }}
          >
            <AssessmentIcon sx={{ mr: 2, color: primaryAccent }} />
            Climate Risk Assessment
          </MenuItem>
          <Divider sx={{ borderColor: borderColor }} />
          <MenuItem
            onClick={() => {
              handleModulesClose();
              navigate("/cra/data");
            }}
            sx={{ py: 1.5, px: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                color={isDark ? textLit : textDark}
              >
                CRA Data Setup
              </Typography>
              <Typography
                variant="caption"
                color={isDark ? "text.secondary" : "text.disabled"}
              >
                Upload and manage portfolio data
              </Typography>
            </Box>
            <UploadIcon fontSize="small" color="action" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleModulesClose();
              navigate("/cra/segmentation");
            }}
            sx={{ py: 1.5, px: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                color={isDark ? textLit : textDark}
              >
                Portfolio Segmentation
              </Typography>
              <Typography
                variant="caption"
                color={isDark ? "text.secondary" : "text.disabled"}
              >
                Sector and geographic analysis
              </Typography>
            </Box>
            <PieChartIcon fontSize="small" color="action" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleModulesClose();
              navigate("/cra/physical-risk");
            }}
            sx={{ py: 1.5, px: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                color={isDark ? textLit : textDark}
              >
                Physical Risk Assessment
              </Typography>
              <Typography
                variant="caption"
                color={isDark ? "text.secondary" : "text.disabled"}
              >
                Acute and chronic climate hazards
              </Typography>
            </Box>
            <ThunderstormIcon fontSize="small" color="action" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleModulesClose();
              navigate("/cra/transition-risk");
            }}
            sx={{ py: 1.5, px: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                color={isDark ? textLit : textDark}
              >
                Transition Risk Assessment
              </Typography>
              <Typography
                variant="caption"
                color={isDark ? "text.secondary" : "text.disabled"}
              >
                Policy, technology, and market risks
              </Typography>
            </Box>
            <TimelineIcon fontSize="small" color="action" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleModulesClose();
              navigate("/cra/collateral");
            }}
            sx={{ py: 1.5, px: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                color={isDark ? textLit : textDark}
              >
                Collateral Sensitivity
              </Typography>
              <Typography
                variant="caption"
                color={isDark ? "text.secondary" : "text.disabled"}
              >
                Impact on security values
              </Typography>
            </Box>
            <BusinessIcon fontSize="small" color="action" />
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleModulesClose();
              navigate("/cra/reporting");
            }}
            sx={{ py: 1.5, px: 2 }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                color={isDark ? textLit : textDark}
              >
                CRA Reporting
              </Typography>
              <Typography
                variant="caption"
                color={isDark ? "text.secondary" : "text.disabled"}
              >
                Generate compliance reports
              </Typography>
            </Box>
            <DescriptionIcon fontSize="small" color="action" />
          </MenuItem>
        </Menu>
        <Menu
          anchorEl={notificationsAnchorEl}
          open={Boolean(notificationsAnchorEl)}
          onClose={handleNotificationsClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1,
              minWidth: 320,
              maxHeight: 400,
              borderRadius: 2,
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? darkBg : litBg,
            },
          }}
        >
          <MenuItem
            disabled
            sx={{
              py: 1.5,
              px: 2,
              fontWeight: 600,
              color: isDark ? textLit : textDark,
            }}
          >
            <NotificationsIcon sx={{ mr: 2, color: primaryColor }} />
            Notifications
          </MenuItem>
          <Divider sx={{ borderColor: borderColor }} />
          <MenuItem sx={{ py: 1.5, px: 2 }}>
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color={isDark ? textLit : textDark}
              >
                New Data Available
              </Typography>
              <Typography
                variant="caption"
                color={isDark ? "text.secondary" : "text.disabled"}
              >
                Climate risk dataset has been updated
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color={isDark ? "text.secondary" : "text.disabled"}
              >
                2 hours ago
              </Typography>
            </Box>
          </MenuItem>
          <MenuItem sx={{ py: 1.5, px: 2 }}>
            <Box>
              <Typography
                variant="body2"
                fontWeight={600}
                color={isDark ? textLit : textDark}
              >
                Report Generated
              </Typography>
              <Typography
                variant="caption"
                color={isDark ? "text.secondary" : "text.disabled"}
              >
                Q3 ESG Compliance Report is ready
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color={isDark ? "text.secondary" : "text.disabled"}
              >
                1 day ago
              </Typography>
            </Box>
          </MenuItem>
        </Menu>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1,
              minWidth: 300,
              borderRadius: 2,
              border: `1px solid ${borderColor}`,
              backgroundColor: isDark ? darkBg : litBg,
            },
          }}
        >
          <MenuItem disabled sx={{ py: 2, px: 2 }}>
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Avatar
                  src={user.avatar}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: isDark
                      ? alpha(primaryColor, 0.3)
                      : alpha(primaryColor, 0.2),
                    color: isDark ? textLit : textDark,
                    fontWeight: 600,
                  }}
                >
                  {user.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography
                    fontWeight={700}
                    fontSize="0.95rem"
                    color={isDark ? textLit : textDark}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={isDark ? "text.secondary" : "text.disabled"}
                  >
                    {user.email}
                  </Typography>
                  <Chip
                    label={user.role?.replace("_", " ") || "Analyst"}
                    size="small"
                    sx={{
                      mt: 0.5,
                      backgroundColor: isDark
                        ? alpha(primaryColor, 0.2)
                        : alpha(primaryColor, 0.1),
                      color: isDark ? primaryColor : textDark,
                      fontWeight: 600,
                      fontSize: "0.65rem",
                      border: isDark
                        ? `1px solid ${alpha(primaryColor, 0.3)}`
                        : "none",
                    }}
                  />
                </Box>
              </Box>
              <Divider sx={{ my: 1, borderColor: borderColor }} />
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CorporateFareIcon
                  fontSize="small"
                  color={isDark ? "action" : "disabled"}
                />
                <Typography
                  variant="caption"
                  color={isDark ? "text.secondary" : "text.disabled"}
                >
                  Deloitte • ESG Analytics Division
                </Typography>
              </Box>
            </Box>
          </MenuItem>
          <Divider sx={{ borderColor: borderColor }} />
          <MenuItem
            onClick={() => navigate("/modules")}
            sx={{ py: 1.5, px: 2 }}
          >
            <BusinessIcon
              fontSize="small"
              sx={{ mr: 2, color: isDark ? "text.secondary" : "text.disabled" }}
            />
            <Typography color={isDark ? textLit : textDark}>
              Switch Module
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => navigate("/profile")}
            sx={{ py: 1.5, px: 2 }}
          >
            <PersonIcon
              fontSize="small"
              sx={{ mr: 2, color: isDark ? "text.secondary" : "text.disabled" }}
            />
            <Typography color={isDark ? textLit : textDark}>
              Profile Settings
            </Typography>
          </MenuItem>
          <MenuItem
            onClick={() => navigate("/settings")}
            sx={{ py: 1.5, px: 2 }}
          >
            <Typography color={isDark ? textLit : textDark}>
              System Preferences
            </Typography>
          </MenuItem>
          <Divider sx={{ borderColor: borderColor }} />
          <MenuItem
            onClick={handleLogout}
            sx={{
              py: 1.5,
              px: 2,
              color: isDark ? "#EF4444" : "#DC2626",
              "&:hover": {
                backgroundColor: isDark
                  ? alpha("#EF4444", 0.1)
                  : alpha("#DC2626", 0.05),
              },
            }}
          >
            <LogoutIcon fontSize="small" sx={{ mr: 2 }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
