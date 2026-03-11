import { useState, useMemo, useEffect } from "react";
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
  Tooltip,
  Chip,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Badge,
  Popover,
} from "@mui/material";
import {
  LayoutDashboard,
  Building2,
  ShieldAlert,
  Target,
  Flame,
  FileText,
  ChevronLeft,
  ChevronRight,
  Bell,
  LogOut,
  User,
  Settings,
  LayoutGrid,
  Command,
  BellOff,
} from "lucide-react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { UserRole } from "@/config/permissions.config";
import { DELOITTE_COLORS } from "@/config/colors.config";
import { useAuthStore } from "@/store/authStore";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 80;
const NAVBAR_HEIGHT = 64;
const BRAND = DELOITTE_COLORS.green.DEFAULT;

function UserMenu({
  user,
  initials,
}: {
  user: { name?: string; role?: string } | null;
  initials: string;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const theme = useTheme();
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    handleClose();
    logout();
    navigate("/login");
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{
          ml: 1,
          border: `1px solid ${theme.palette.divider}`,
          p: 0.5,
          transition: "all 0.2s ease",
          "&:hover": {
            bgcolor: alpha(BRAND, 0.08),
            borderColor: alpha(BRAND, 0.3),
          },
        }}
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: alpha(BRAND, 0.1),
            color: BRAND,
            fontSize: "0.75rem",
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              overflow: "visible",
              filter: "drop-shadow(0px 4px 12px rgba(0,0,0,0.1))",
              mt: 1.5,
              minWidth: 200,
              bgcolor: "background.paper",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: "10px",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.name || "User"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.role || "Analyst"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={handleClose} sx={{ fontSize: "0.85rem", gap: 1.5 }}>
          <User size={16} /> My Account
        </MenuItem>
        <MenuItem onClick={handleClose} sx={{ fontSize: "0.85rem", gap: 1.5 }}>
          <Settings size={16} /> Settings
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={handleSignOut}
          sx={{ fontSize: "0.85rem", gap: 1.5, color: "error.main" }}
        >
          <LogOut size={16} /> Sign out
        </MenuItem>
      </Menu>
    </>
  );
}

const navGroups = [
  {
    label: null,
    items: [
      {
        id: "dashboard",
        label: "Overview",
        icon: LayoutDashboard,
        path: "/sustainability",
      },
    ],
  },
  {
    label: "DATA & INPUTS",
    items: [
      {
        id: "entity",
        label: "Entity Profile",
        icon: Building2,
        path: "/sustainability/entity",
      },
      {
        id: "risks",
        label: "Risk Register",
        icon: ShieldAlert,
        path: "/sustainability/risks",
      },
      {
        id: "materiality",
        label: "Data Collection",
        icon: Target,
        path: "/sustainability/materiality",
      },
      // {
      //   id: "templates",
      //   label: "Data Collection",
      //   icon: FileSpreadsheet,
      //   path: "/sustainability/templates",
      // },
      {
        id: "emissions",
        label: "GHG Calculator",
        icon: Flame,
        path: "/sustainability/emissions",
      },
    ],
  },
  {
    label: "REPORTS",
    items: [
      {
        id: "report",
        label: "IFRS Disclosure",
        icon: FileText,
        path: "/sustainability/report",
        badge: "",
      },
    ],
  },
  {
    label: null,
    items: [
      {
        id: "switch-module",
        label: "Switch Module",
        icon: LayoutGrid,
        path: "/modules",
      },
    ],
  },
];

const allItems = navGroups.flatMap((g) => g.items);

// Nav items each role is allowed to see (ADMIN / ESG_MANAGER see everything)
const NAV_VISIBILITY: Partial<Record<string, string[]>> = {
  [UserRole.DATA_OWNER]: ["materiality", "switch-module"],
  [UserRole.SUSTAINABILITY_APPROVER]: [
    "dashboard",
    "materiality",
    "report",
    "switch-module",
  ],
  [UserRole.SUSTAINABILITY_CHAMPION]: [
    "dashboard",
    "entity",
    "risks",
    "materiality",
    "emissions",
    "report",
    "switch-module",
  ],
  [UserRole.SUSTAINABILITY_MANAGER]: [
    "dashboard",
    "entity",
    "risks",
    "materiality",
    "emissions",
    "scenarios",
    "report",
    "switch-module",
  ],
};

// Exact paths each restricted role may visit; first entry is the fallback landing
const ALLOWED_PATHS: Partial<Record<string, string[]>> = {
  [UserRole.DATA_OWNER]: ["/sustainability/materiality"],
  [UserRole.SUSTAINABILITY_APPROVER]: [
    "/sustainability",
    "/sustainability/materiality",
    "/sustainability/report",
  ],
};

function TopNavbar({
  currentPath,
  toggleSideBar,
  user,
  initials,
  unreadCount,
}: {
  currentPath: string;
  collapsed: boolean;
  toggleSideBar: () => void;
  user: { name?: string; role?: string } | null;
  initials: string;
  unreadCount: number;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const BRAND_LOCAL = DELOITTE_COLORS.green.DEFAULT;
  const currentItem =
    allItems.find((i) => i.path === currentPath) ?? navGroups[0].items[0];
  const [bellAnchorEl, setBellAnchorEl] = useState<null | HTMLElement>(null);
  const { notifications, markNotificationRead, dismissAllNotifications } =
    useSustainabilityStore();
  const unread = notifications.filter((n) => !n.read);

  const handleBellOpen = (e: React.MouseEvent<HTMLElement>) => {
    setBellAnchorEl(e.currentTarget);
  };
  const handleBellClose = () => setBellAnchorEl(null);

  return (
    <Box
      component="header"
      sx={{
        height: NAVBAR_HEIGHT,
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${theme.palette.divider}`,
        bgcolor: "background.default",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton
          onClick={toggleSideBar}
          size="small"
          sx={{ display: { lg: "none" } }}
        >
          <Command size={20} />
        </IconButton>
        <Typography variant="h6" fontWeight={700} color="text.primary">
          {currentItem?.label}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <ThemeToggle />
        <IconButton size="small" onClick={handleBellOpen}>
          <Badge
            badgeContent={unreadCount}
            color="error"
            max={9}
            sx={{
              "& .MuiBadge-badge": {
                fontSize: "0.6rem",
                minWidth: 16,
                height: 16,
              },
            }}
          >
            <Bell size={18} />
          </Badge>
        </IconButton>
        <Popover
          anchorEl={bellAnchorEl}
          open={Boolean(bellAnchorEl)}
          onClose={handleBellClose}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1,
              width: 340,
              maxHeight: 440,
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: "background.paper",
              overflowY: "auto",
            },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid ${theme.palette.divider}`,
              position: "sticky",
              top: 0,
              bgcolor: "background.paper",
              zIndex: 1,
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Bell size={16} color={BRAND_LOCAL} />
              <Typography fontWeight={700} fontSize="0.875rem">
                Notifications
              </Typography>
              {unread.length > 0 && (
                <Chip
                  label={unread.length}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.7rem",
                    bgcolor: alpha(BRAND_LOCAL, 0.15),
                    color: BRAND_LOCAL,
                    fontWeight: 700,
                    "& .MuiChip-label": { px: 0.75 },
                  }}
                />
              )}
            </Box>
            {unread.length > 0 && (
              <Typography
                variant="caption"
                sx={{
                  color: BRAND_LOCAL,
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={() => {
                  dismissAllNotifications();
                }}
              >
                Mark all read
              </Typography>
            )}
          </Box>
          {/* Body */}
          {notifications.length === 0 ? (
            <Box sx={{ py: 5, textAlign: "center" }}>
              <BellOff size={32} color={theme.palette.text.disabled} />
              <Typography variant="body2" color="text.secondary" mt={1}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            notifications.map((n) => (
              <Box
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                sx={{
                  px: 2,
                  py: 1.5,
                  cursor: "pointer",
                  bgcolor: !n.read
                    ? isDark
                      ? alpha(BRAND_LOCAL, 0.07)
                      : alpha(BRAND_LOCAL, 0.04)
                    : "transparent",
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  "&:last-child": { borderBottom: 0 },
                  "&:hover": { bgcolor: alpha(BRAND_LOCAL, 0.06) },
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  gap={1}
                >
                  <Typography
                    variant="body2"
                    fontWeight={!n.read ? 700 : 600}
                    sx={{ lineHeight: 1.4 }}
                  >
                    {n.title}
                  </Typography>
                  {!n.read && (
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: BRAND_LOCAL,
                        flexShrink: 0,
                        mt: 0.5,
                      }}
                    />
                  )}
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mt={0.25}
                >
                  {n.message}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  display="block"
                  mt={0.25}
                >
                  {new Date(n.timestamp).toLocaleString()}
                </Typography>
              </Box>
            ))
          )}
        </Popover>
        <Divider
          orientation="vertical"
          flexItem
          sx={{ height: 24, alignSelf: "center", mx: 1 }}
        />
        <UserMenu user={user} initials={initials} />
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------
// Sidebar Item Component
// ----------------------------------------------------------------------

function SidebarItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: (typeof allItems)[0] & { badge?: string };
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  const theme = useTheme();

  return (
    <ListItem disablePadding sx={{ mb: 0.5, px: 1.5 }}>
      <Tooltip title={collapsed ? item.label : ""} placement="right" arrow>
        <ListItemButton
          onClick={onClick}
          sx={{
            borderRadius: "12px",
            minHeight: 44,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 0 : 2,
            position: "relative",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            bgcolor: isActive ? alpha(BRAND, 0.1) : "transparent",
            color: isActive ? BRAND : "text.secondary",
            "&:hover": {
              bgcolor: isActive
                ? alpha(BRAND, 0.15)
                : alpha(theme.palette.text.primary, 0.04),
              color: isActive ? BRAND : "text.primary",
              transform: "translateX(4px)",
            },
            ...(collapsed && {
              "&:hover": {
                transform: "none",
              },
            }),
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 0 : 2,
              justifyContent: "center",
              color: "inherit",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </ListItemIcon>

          {!collapsed && (
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                overflow: "hidden",
              }}
            >
              <Typography
                variant="body2"
                noWrap
                sx={{
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "0.9rem",
                  lineHeight: 1.2,
                }}
              >
                {item.label}
              </Typography>
              {item.badge && (
                <Chip
                  label={item?.badge}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    bgcolor: BRAND,
                    color: "#fff",
                    borderRadius: "6px",
                    ml: 1,
                  }}
                />
              )}
            </Box>
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  );
}

// ----------------------------------------------------------------------
// Main Sidebar Component
// ----------------------------------------------------------------------

export default function SustainabilityLayout() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();
  const { notifications } = useSustainabilityStore();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Redirect roles away from pages they are not allowed to view
  useEffect(() => {
    const role = user?.role;
    if (!role) return;
    const allowed = ALLOWED_PATHS[role];
    if (allowed && !allowed.includes(location.pathname)) {
      navigate(allowed[0], { replace: true });
    }
  }, [location.pathname, user?.role, navigate]);

  // Filter nav items per role (undefined entry in NAV_VISIBILITY = full access)
  const visibleNavGroups = useMemo(() => {
    const role = user?.role;
    const allowed = role ? NAV_VISIBILITY[role] : undefined;
    if (!allowed) return navGroups; // ADMIN, ESG_MANAGER, etc. see all
    return navGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => allowed.includes(item.id)),
      }))
      .filter((group) => group.items.length > 0);
  }, [user?.role]);

  const isDark = theme.palette.mode === "dark";
  const drawerWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        bgcolor: "background.default",
        overflow: "hidden",
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "background.paper", // Clean background
            borderRight: `1px solid ${theme.palette.divider}`,
            transition: theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* 1. Brand / Logo Area */}
        <Box
          sx={{
            height: 64, // Standard navbar heightMatch
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 0 : 3,
            borderBottom: `1px solid ${theme.palette.divider}`, // Subtle separation
            gap: 1.5, // Add gap between logo and text
          }}
        >
          <Box
            component="img"
            src={
              isDark
                ? "/assets/images/small-dark.jpg"
                : "/assets/images/small-light.png"
            }
            alt="Logo"
            sx={{
              width: 32,
              height: 32,
              borderRadius: "6px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          {!collapsed && (
            <Box
              sx={{
                borderLeft: `2px solid ${BRAND}`,
                pl: 1.5,
                ml: 0.5,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  lineHeight: 1.2,
                  color: "text.primary",
                  whiteSpace: "nowrap",
                }}
              >
                ESG Navigator
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  color: BRAND,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  whiteSpace: "nowrap",
                }}
              >
                Sustainability
              </Typography>
            </Box>
          )}
        </Box>

        {/* 2. Navigation Links */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 0, py: 2 }}>
          {visibleNavGroups.map((group, index) => (
            <Box key={index} sx={{ mb: 3 }}>
              {!collapsed && group.label && (
                <Typography
                  variant="caption"
                  sx={{
                    px: 3.5,
                    mb: 1, // Reduced margin
                    display: "block",
                    color: "text.disabled",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    fontSize: "0.7rem",
                    textTransform: "uppercase", // Enforce uppercase
                  }}
                >
                  {group.label}
                </Typography>
              )}
              <List disablePadding>
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    isActive={location.pathname === item.path}
                    collapsed={collapsed}
                    onClick={() => navigate(item.path)}
                  />
                ))}
              </List>
            </Box>
          ))}
        </Box>

        {/* 3. Collapse Toggle (Bottom) */}
        <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{
              mx: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha(theme.palette.action.disabledBackground, 0.1),
              "&:hover": {
                bgcolor: alpha(theme.palette.action.disabledBackground, 0.2),
              },
            }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </IconButton>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Navbar Area - Reintegrated */}
        <TopNavbar
          currentPath={location.pathname}
          collapsed={collapsed}
          toggleSideBar={() => setCollapsed(!collapsed)}
          user={user}
          initials={initials}
          unreadCount={unreadCount}
        />

        {/* Scrollable Content Area */}
        <Box sx={{ flex: 1, overflowY: "auto", position: "relative" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
