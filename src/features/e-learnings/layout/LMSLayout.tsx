import { Suspense, useState } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Award,
  Grid,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";

const navigation = [
  {
    name: "Dashboard",
    href: "/capacity-building",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    name: "Training Library",
    href: "/capacity-building/catalog",
    icon: BookOpen,
    exact: false,
  },
  {
    name: "My Learning",
    href: "/capacity-building/my-learning",
    icon: History,
    exact: false,
  },
  {
    name: "Certifications",
    href: "/capacity-building/certifications",
    icon: Award,
    exact: false,
  },
];

const SIDEBAR_WIDTH = 288;
const COLLAPSED_WIDTH = 72;

export default function LMSLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (path: string, exact: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;

  return (
    <div className="h-screen bg-neutral-50 dark:bg-slate-950 flex font-sans transition-colors duration-300 overflow-hidden">
      {/* Sidebar — no scroll, 100vh */}
      <aside
        className="hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-neutral-200 dark:border-slate-800 fixed h-full z-20 transition-all duration-300 overflow-hidden"
        style={{ width: sidebarWidth }}
      >
        {/* Toggle — dark vertical rectangle, border through center, rounded both ends */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-200 z-30 cursor-pointer hover:bg-[#444444]"
          style={{
            right: -7,
            width: 14,
            height: 56,
            borderRadius: 5,
            backgroundColor: "#333333",
            border: "none",
          }}
        >
          {collapsed ? (
            <ChevronsRight size={10} className="text-white" />
          ) : (
            <ChevronsLeft size={10} className="text-white" />
          )}
        </button>

        {/* Logo — always small */}
        <div className="h-20 flex items-center px-4 border-b border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <Link
            to="/capacity-building"
            className="flex items-center gap-3 group overflow-hidden"
          >
            <img
              src="/assets/images/small-light.png"
              alt="Deloitte"
              className="h-7 w-7 object-contain dark:hidden flex-shrink-0"
            />
            <img
              src="/assets/images/small-dark.jpg"
              alt="Deloitte"
              className="h-7 w-7 object-contain hidden dark:block flex-shrink-0"
            />
            {!collapsed && (
              <div className="flex flex-col border-l-2 border-[#86BC25] pl-3 whitespace-nowrap">
                <span className="text-base font-bold text-neutral-900 dark:text-white leading-tight transition-colors">
                  ESG Navigator
                </span>
                <span className="text-xs font-semibold text-[#86BC25] uppercase tracking-wider">
                  Learning Hub
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation — no scroll */}
        <div className="flex-1 py-8 px-3 overflow-hidden">
          <div className="mb-8">
            {!collapsed && (
              <h3 className="px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
                Main Menu
              </h3>
            )}
            <nav className="space-y-2">
              {navigation.map((item) => {
                const active = isActive(item.href, item.exact);
                const linkEl = (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-3 rounded-lg transition-all duration-200 group ${
                      collapsed ? "px-0 py-3 justify-center" : "px-4 py-3.5"
                    } ${
                      active
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-slate-800 font-bold shadow-md transform scale-[1.02]"
                        : "text-neutral-600 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800 hover:text-neutral-900 dark:hover:text-white font-medium"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={
                        active
                          ? "text-[#86BC25]"
                          : "text-neutral-400 dark:text-slate-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
                      }
                    />
                    {!collapsed && (
                      <span className="tracking-wide">{item.name}</span>
                    )}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <div key={item.name} className="relative group/tip">
                      {linkEl}
                      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-neutral-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium rounded opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                        {item.name}
                      </div>
                    </div>
                  );
                }
                return linkEl;
              })}
            </nav>
          </div>

          {/* Preferences */}
          <div>
            {!collapsed && (
              <h3 className="px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
                Preferences
              </h3>
            )}
            <nav className="space-y-1">
              <div className={collapsed ? "relative group/tip" : ""}>
                <button
                  onClick={() => navigate("/modules")}
                  className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-neutral-500 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-800 hover:text-neutral-900 dark:hover:text-white transition-colors cursor-pointer group ${
                    collapsed ? "px-0 py-3 justify-center" : "px-4 py-3"
                  }`}
                >
                  <Grid
                    size={20}
                    className="text-neutral-400 dark:text-slate-500 group-hover:text-neutral-900 dark:group-hover:text-white"
                  />
                  {!collapsed && "Back to Dashboard"}
                </button>
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-neutral-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium rounded opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                    Back to Dashboard
                  </div>
                )}
              </div>

              <div className={collapsed ? "relative group/tip" : ""}>
                <Link
                  to="/capacity-building/profile"
                  className={`flex items-center gap-3 rounded-xl text-sm font-medium text-neutral-500 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-800 hover:text-neutral-900 dark:hover:text-white transition-colors ${
                    collapsed ? "px-0 py-3 justify-center" : "px-4 py-3"
                  }`}
                >
                  <Settings
                    size={20}
                    className="text-neutral-400 dark:text-slate-500"
                  />
                  {!collapsed && "My Profile"}
                </Link>
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-neutral-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium rounded opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                    My Profile
                  </div>
                )}
              </div>

              <div className={collapsed ? "relative group/tip" : ""}>
                <button
                  onClick={() => logout()}
                  className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-neutral-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer group ${
                    collapsed ? "px-0 py-3 justify-center" : "px-4 py-3"
                  }`}
                >
                  <LogOut
                    size={20}
                    className="text-neutral-400 group-hover:text-red-500"
                  />
                  {!collapsed && "Sign Out"}
                </button>
                {collapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-neutral-900 dark:bg-white text-white dark:text-slate-900 text-xs font-medium rounded opacity-0 invisible group-hover/tip:opacity-100 group-hover/tip:visible transition-all whitespace-nowrap z-50 pointer-events-none">
                    Sign Out
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>

        {/* User info */}
        {!collapsed ? (
          <div className="p-6 border-t border-neutral-100 dark:border-slate-800 bg-neutral-50/50 dark:bg-slate-900/50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border-2 border-[#86BC25] p-0.5 shadow-sm flex-shrink-0">
                <div className="w-full h-full rounded-full bg-neutral-100 dark:bg-slate-700 flex items-center justify-center text-neutral-600 dark:text-slate-300 font-bold text-lg">
                  {user?.name?.charAt(0) || "U"}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-neutral-500 dark:text-slate-400 truncate">
                  {user?.department || "Deloitte Employee"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-neutral-100 dark:border-slate-800 flex justify-center flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-[#86BC25] p-0.5 shadow-sm">
              <div className="w-full h-full rounded-full bg-neutral-100 dark:bg-slate-700 flex items-center justify-center text-neutral-600 dark:text-slate-300 font-bold text-sm">
                {user?.name?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/50 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content — fills remaining space, content area scrolls, scrollbar at page edge */}
      <main
        className="flex-1 flex flex-col overflow-hidden bg-neutral-50 dark:bg-linear-to-br dark:from-slate-950 dark:via-slate-950 dark:to-slate-900 transition-all duration-300"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Fixed header */}
        <header className="h-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-neutral-200 dark:border-slate-800 px-6 md:px-10 flex items-center justify-between shadow-lg transition-colors duration-300 flex-shrink-0 z-30">
          <div className="flex items-center gap-6">
            <button
              className="md:hidden p-2 text-neutral-500 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <div className="hidden md:flex relative w-112.5">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-slate-500"
                size={20}
              />
              <input
                type="text"
                placeholder="Search courses, skills, certifications..."
                className="w-full pl-12 pr-4 py-3 bg-neutral-100 dark:bg-slate-800 border border-neutral-300 dark:border-slate-700 rounded-xl text-sm text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#86BC25]/30 focus:border-[#86BC25] focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-neutral-500 dark:placeholder:text-slate-500 font-medium shadow-inner"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="relative group">
              <button className="relative p-2.5 text-neutral-400 dark:text-slate-400 hover:text-neutral-600 dark:hover:text-slate-200 hover:bg-neutral-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer">
                <Bell size={22} />
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 pointer-events-none"></span>
              </button>
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-neutral-100 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-4 border-b border-neutral-100 dark:border-slate-800">
                  <h3 className="font-bold text-neutral-900 dark:text-white">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="p-4 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border-b border-neutral-50 dark:border-slate-800/50">
                    <p className="text-sm text-neutral-800 dark:text-slate-200 font-medium">
                      New Course Assigned
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-slate-500 mt-1">
                      "Cybersecurity Basics" has been added to your learning.
                    </p>
                  </div>
                  <div className="p-4 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <p className="text-sm text-neutral-800 dark:text-slate-200 font-medium">
                      Deadline Approaching
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-slate-500 mt-1">
                      Complete "ESG Fundamentals" by Friday.
                    </p>
                  </div>
                </div>
                <div className="p-3 border-t border-neutral-100 dark:border-slate-800 text-center">
                  <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                    Mark all as read
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content — scrollbar at page edge */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">
            <Suspense
              fallback={
                <div className="flex h-[50vh] w-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-[#86BC25]" />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
