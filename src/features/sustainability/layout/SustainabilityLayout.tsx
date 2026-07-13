import { useState, useMemo, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Target,
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
  ClipboardCheck,
  Network,
  ListChecks,
  BookOpen,
  BarChart2,
  Lock,
} from "lucide-react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { UserRole } from "@/config/permissions.config";
import { useAuthStore } from "@/store/authStore";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";
import AssessmentPhaseGate from "../components/AssessmentPhaseGate";
import { useActiveAssessmentAccess } from "../hooks/useActiveAssessmentAccess";
import { routeToPhase } from "../utils/assessmentProgress";

const COLLAPSED_WIDTH = 64;
const DRAWER_WIDTH = 260;

function UserMenu({
  user,
  initials,
}: {
  user: { name?: string; role?: string } | null;
  initials: string;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <div className="relative z-[200]" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-9 h-9 bg-[#f4f4f4] border border-[#e0e0e0] hover:bg-[#f4fadc] hover:border-[#86bc25]/40 transition-colors"
      >
        <span className="text-[12px] font-bold text-[#161616] group-hover:text-[#435e12]">
          {initials}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e0e0e0] shadow-lg shadow-black/5 flex flex-col z-[200]">
          <div className="px-4 py-3 border-b border-[#e0e0e0] bg-[#f4f4f4]">
            <p className="text-[14px] font-bold text-[#161616]">
              {user?.name || "User"}
            </p>
            <p className="text-[10px] text-[#525252] font-semibold tracking-wider uppercase mt-1">
              {user?.role || "Analyst"}
            </p>
          </div>
          <div className="py-1">
            <button
              className="w-full text-left px-4 py-2 text-[13px] font-medium text-[#161616] hover:bg-[#f4f4f4] flex items-center gap-3 transition-colors"
              onClick={() => setOpen(false)}
            >
              <User size={15} className="text-[#525252]" /> My Account
            </button>
            <button
              className="w-full text-left px-4 py-2 text-[13px] font-medium text-[#161616] hover:bg-[#f4f4f4] flex items-center gap-3 transition-colors"
              onClick={() => setOpen(false)}
            >
              <Settings size={15} className="text-[#525252]" /> Settings
            </button>
          </div>
          <div className="border-t border-[#e0e0e0] py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-[13px] font-medium text-[#da1e28] hover:bg-[#fff1f1] flex items-center gap-3 transition-colors"
            >
              <LogOut size={15} /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const navGroups = [
  {
    label: null,
    items: [
      {
        id: "dashboard",
        label: "All Assessments",
        icon: LayoutDashboard,
        path: "/sustainability",
      },
    ],
  },
  {
    label: "DATA & INPUTS",
    items: [
      {
        id: "governance-assessment",
        label: "Governance Assessment",
        icon: ClipboardCheck,
        path: "/sustainability/governance-assessment",
      },
      {
        id: "value-chain",
        label: "Value Chain",
        icon: Network,
        path: "/sustainability/value-chain",
      },
      {
        id: "srro-register",
        label: "SRRO/CRRO Register",
        icon: ListChecks,
        path: "/sustainability/srro-register",
      },
      {
        id: "material-information",
        label: "Material Information",
        icon: BookOpen,
        path: "/sustainability/material-information",
      },
      {
        id: "materiality-scoring",
        label: "Materiality Scoring",
        icon: BarChart2,
        path: "/sustainability/materiality-scoring",
      },
      {
        id: "materiality",
        label: "Data Collection",
        icon: Target,
        path: "/sustainability/materiality",
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

const FULL_NAV = [
  "dashboard",
  "governance-assessment",
  "value-chain",
  "srro-register",
  "material-information",
  "materiality-scoring",
  "materiality",
  "scenarios",
  "templates",
  "report",
  "switch-module",
];

const NAV_VISIBILITY: Partial<Record<string, string[]>> = {
  [UserRole.ADMIN]: FULL_NAV,
  [UserRole.ESG_MANAGER]: FULL_NAV,
  [UserRole.DATA_OWNER]: ["materiality", "switch-module"],
  [UserRole.SUSTAINABILITY_APPROVER]: [
    "dashboard",
    "materiality",
    "report",
    "switch-module",
  ],
  [UserRole.BOARD]: ["dashboard", "materiality", "report", "switch-module"],
  [UserRole.SUSTAINABILITY_CHAMPION]: [
    "dashboard",
    "governance-assessment",
    "value-chain",
    "srro-register",
    "material-information",
    "materiality-scoring",
    "materiality",
    "report",
    "switch-module",
  ],
  [UserRole.SUSTAINABILITY_MANAGER]: [
    "dashboard",
    "governance-assessment",
    "value-chain",
    "srro-register",
    "material-information",
    "materiality-scoring",
    "materiality",
    "scenarios",
    "report",
    "switch-module",
  ],
  [UserRole.CLIENT]: [
    "value-chain",
    "srro-register",
    "switch-module",
  ],
};

const ALLOWED_PATHS: Partial<Record<string, string[]>> = {
  [UserRole.DATA_OWNER]: ["/sustainability/materiality"],
  [UserRole.SUSTAINABILITY_APPROVER]: [
    "/sustainability",
    "/sustainability/materiality",
    "/sustainability/report",
  ],
  [UserRole.BOARD]: [
    "/sustainability",
    "/sustainability/materiality",
    "/sustainability/report",
  ],
  [UserRole.CLIENT]: [
    "/sustainability/value-chain",
    "/sustainability/srro-register",
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
  const currentItem =
    allItems.find((i) => i.path === currentPath) ?? navGroups[0].items[0];
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const { notifications, markNotificationRead, dismissAllNotifications } =
    useSustainabilityStore();
  const unread = notifications.filter((n) => !n.read);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-[64px] px-6 flex items-center justify-between border-b border-[#e0e0e0] bg-white sticky top-0 z-[100]">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSideBar}
          className="lg:hidden p-2 bg-[#f4f4f4] border border-[#e0e0e0] hover:bg-[#e0e0e0] transition-colors"
        >
          <Command size={18} className="text-[#161616]" />
        </button>
        <h2 className="text-[18px] font-semibold text-[#161616] tracking-tight">
          {currentItem?.label}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="relative z-[200]" ref={bellRef}>
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative p-2 text-[#525252] hover:text-[#161616] hover:bg-[#f4f4f4] transition-colors rounded-none"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#da1e28]"></span>
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 mt-2 w-[340px] bg-white border border-[#e0e0e0] shadow-lg shadow-black/5 flex flex-col z-[200]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0] bg-[#f4f4f4]">
                <div className="flex items-center gap-2">
                  <Bell size={16} className="text-[#86bc25]" />
                  <span className="text-[13px] font-bold text-[#161616]">
                    Notifications
                  </span>
                  {unread.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-[#86bc25]/20 text-[#435e12] text-[10px] font-bold">
                      {unread.length}
                    </span>
                  )}
                </div>
                {unread.length > 0 && (
                  <button
                    onClick={dismissAllNotifications}
                    className="text-[11px] font-semibold text-[#86bc25] hover:text-[#435e12] hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 flex flex-col items-center justify-center text-center">
                    <BellOff size={28} className="text-[#8d8d8d] mb-2" />
                    <span className="text-[13px] text-[#525252]">
                      No notifications yet
                    </span>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={`px-4 py-3 border-b border-[#e0e0e0] cursor-pointer hover:bg-[#f4f4f4] transition-colors ${!n.read ? "bg-[#f4fadc]/30" : "bg-white"}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span
                          className={`text-[13px] leading-snug ${!n.read ? "font-bold text-[#161616]" : "font-medium text-[#525252]"}`}
                        >
                          {n.title}
                        </span>
                        {!n.read && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#86bc25] flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      <span className="block mt-1 text-[12px] text-[#525252] leading-relaxed">
                        {n.message}
                      </span>
                      <span className="block mt-1.5 text-[10px] text-[#8d8d8d] font-medium tracking-wide uppercase">
                        {new Date(n.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-[#e0e0e0]"></div>

        <UserMenu user={user} initials={initials} />
      </div>
    </header>
  );
}

function SidebarItem({
  item,
  isActive,
  collapsed,
  locked,
  lockReason,
  onClick,
}: {
  item: (typeof allItems)[0] & { badge?: string };
  isActive: boolean;
  collapsed: boolean;
  locked?: boolean;
  lockReason?: string;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      title={locked ? (lockReason ?? "Complete prior phases for this assessment") : (collapsed ? item.label || "" : undefined)}
      className={`w-full group flex items-center h-[44px] relative transition-colors ${collapsed ? "justify-center px-0" : "px-5"} ${
        locked
          ? "opacity-45 cursor-not-allowed text-[#8d8d8d] bg-transparent"
          : isActive
            ? "bg-[#f4fadc] text-[#435e12]"
            : "hover:bg-[#f4f4f4] text-[#525252] hover:text-[#161616]"
      }`}
    >
      {isActive && !locked && (
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#86bc25]" />
      )}

      <Icon
        size={18}
        className={`flex-shrink-0 ${collapsed ? "" : "mr-3"} ${isActive && !locked ? "text-[#86bc25]" : "text-[#8d8d8d] group-hover:text-[#525252]"} transition-colors`}
        strokeWidth={isActive && !locked ? 2.5 : 2}
      />

      {!collapsed && (
        <div className="flex flex-1 items-center justify-between overflow-hidden">
          <span
            className={`text-[13px] truncate ${isActive && !locked ? "font-bold" : "font-medium"}`}
          >
            {item.label}
          </span>
          {locked ? (
            <Lock size={13} className="ml-2 shrink-0 text-[#8d8d8d]" />
          ) : item.badge ? (
            <span className="ml-2 px-1.5 py-0.5 bg-[#86bc25] text-white text-[9px] font-bold uppercase tracking-wider">
              {item.badge}
            </span>
          ) : null}
        </div>
      )}
    </button>
  );
}

export default function SustainabilityLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();
  const { notifications, governanceAssessment, activeProjectId, saveCurrentProject, syncFromServer, loadProject, ensureAssessmentIntegrity } = useSustainabilityStore();
  const assessmentAccess = useActiveAssessmentAccess();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const activeClientName = governanceAssessment?.clientName || null;

  // Sync server projects, re-hydrate active project, and strip orphan phase 2–5 data
  useEffect(() => {
    const init = async () => {
      if (activeProjectId) loadProject(activeProjectId);
      await syncFromServer();
      ensureAssessmentIntegrity();
    };
    void init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save when navigating between phase pages (not on overview)
  useEffect(() => {
    if (activeProjectId && location.pathname !== "/sustainability") {
      saveCurrentProject();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const role = user?.role;
    if (!role) return;
    const allowed = ALLOWED_PATHS[role];
    if (allowed && !allowed.includes(location.pathname)) {
      navigate(allowed[0], { replace: true });
    }
  }, [location.pathname, user?.role, navigate]);

  const visibleNavGroups = useMemo(() => {
    const role = user?.role;
    const allowed = role ? NAV_VISIBILITY[role] : undefined;
    const useDataMgmtLabel =
      role === UserRole.SUSTAINABILITY_MANAGER ||
      role === UserRole.SUSTAINABILITY_APPROVER ||
      role === UserRole.BOARD ||
      role === UserRole.ADMIN;

    const base = allowed
      ? navGroups
          .map((group) => ({
            ...group,
            items: group.items.filter((item) => allowed.includes(item.id)),
          }))
          .filter((group) => group.items.length > 0)
      : navGroups;

    if (useDataMgmtLabel) {
      return base.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === "materiality"
            ? { ...item, label: "Data Management" }
            : item,
        ),
      }));
    }
    return base;
  }, [user?.role]);

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "U";

  return (
    <div className="flex h-screen bg-[#f4f4f4] overflow-hidden font-sans text-[#161616]">
      {/* Sidebar */}
      <aside
        className="flex flex-col bg-white border-r border-[#e0e0e0] transition-all duration-200 z-[110]"
        style={{ width: collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH }}
      >
        {/* Brand Header */}
        <div
          className="h-[64px] flex items-center border-b border-[#e0e0e0] bg-[#f4f4f4]"
          style={{
            padding: collapsed ? "0" : "0 24px",
            justifyContent: collapsed ? "center" : "flex-start",
          }}
        >
          <div className="w-8 h-8 bg-black flex items-center justify-center flex-shrink-0">
            <span className="text-[#86bc25] font-bold text-[14px]">D.</span>
          </div>
          {!collapsed && (
            <div className="ml-3 pl-3 border-l-2 border-[#86bc25] flex flex-col min-w-0">
              <span className="text-[14px] font-bold leading-tight text-[#161616]">
                ESG Navigator
              </span>
              {activeClientName && activeProjectId ? (
                <span className="text-[9px] font-bold tracking-wide text-[#86bc25] truncate mt-0.5 max-w-[150px]" title={activeClientName}>
                  {activeClientName}
                </span>
              ) : (
                <span className="text-[9px] font-bold tracking-[0.15em] text-[#86bc25] uppercase mt-0.5">
                  Sustainability
                </span>
              )}
            </div>
          )}
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto py-4">
          {visibleNavGroups.map((group, index) => (
            <div key={index} className="mb-6">
              {!collapsed && group.label && (
                <p className="px-6 mb-2 text-[10px] font-bold tracking-wider text-[#8d8d8d] uppercase">
                  {group.label}
                </p>
              )}
              <div className="flex flex-col">
                {group.items.map((item) => {
                  const phaseKey = routeToPhase(item.path);
                  const phaseAccess = phaseKey ? assessmentAccess.phases[phaseKey] : null;
                  const locked = !!phaseAccess && !phaseAccess.unlocked;
                  return (
                  <SidebarItem
                    key={item.id}
                    item={item}
                    isActive={location.pathname === item.path}
                    collapsed={collapsed}
                    locked={locked}
                    lockReason={phaseAccess?.lockReason}
                    onClick={() => navigate(item.path)}
                  />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Toggle Button */}
        <div className="p-4 border-t border-[#e0e0e0] flex justify-center bg-white">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-9 h-9 flex items-center justify-center border border-[#e0e0e0] text-[#525252] hover:bg-[#f4fadc] hover:text-[#435e12] hover:border-[#86bc25]/40 transition-colors"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopNavbar
          currentPath={location.pathname}
          collapsed={collapsed}
          toggleSideBar={() => setCollapsed(!collapsed)}
          user={user}
          initials={initials}
          unreadCount={unreadCount}
        />

        <div className="flex-1 overflow-y-auto relative">
          <AssessmentPhaseGate>
            <Outlet />
          </AssessmentPhaseGate>
        </div>
      </main>
    </div>
  );
}
