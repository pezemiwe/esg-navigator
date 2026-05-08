import { useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Globe2,
  Crosshair,
  FileBarChart2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";

const BRAND_GREEN = "#86bc25";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    subLabel: "Overview & KPIs",
    icon: LayoutDashboard,
    path: "/sdg-ndc",
  },
  {
    id: "sdg-alignment",
    label: "SDG Alignment",
    subLabel: "17 Goals Mapping",
    icon: Globe2,
    path: "/sdg-ndc/sdg-alignment",
  },
  {
    id: "ndc-tracker",
    label: "NDC Tracker",
    subLabel: "Nigeria's Commitments",
    icon: Crosshair,
    path: "/sdg-ndc/ndc-tracker",
  },
  {
    id: "reports",
    label: "Reports & Disclosure",
    subLabel: "Regulatory Filings",
    icon: FileBarChart2,
    path: "/sdg-ndc/reports",
  },
];

export default function SDGLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const isDark = useThemeStore((s) => s.mode === "dark");
  const [collapsed, setCollapsed] = useState(false);

  const initials =
    user?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2) || "U";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0B1120]">
      {/* Sidebar */}
      <aside
        className={`relative shrink-0 bg-white dark:bg-[#0B1120] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-[width] duration-300 ease-out ${
          collapsed ? "w-[72px]" : "w-[260px]"
        }`}
      >
        {/* Brand */}
        <div
          className={`flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 ${collapsed ? "justify-center px-2 py-5" : "px-5 py-5"}`}
          style={{
            background: `linear-gradient(90deg, ${BRAND_GREEN}1A 0%, transparent 100%)`,
          }}
        >
          <button
            onClick={() => navigate("/modules")}
            className="flex items-center gap-3 group"
            title="Back to modules"
          >
            <img
              src={
                isDark
                  ? "/assets/images/small-dark.jpg"
                  : "/assets/images/small-light.png"
              }
              alt="Deloitte"
              className="h-7 w-7 object-contain shrink-0"
            />
            {!collapsed && (
              <div className="border-l-2 border-[#86bc25] pl-3 flex flex-col text-left">
                <span className="font-bold text-gray-900 dark:text-white text-[14px] leading-tight whitespace-nowrap">
                  ESG Navigator
                </span>
                <span className="text-[9px] font-bold text-[#86bc25] uppercase tracking-widest whitespace-nowrap leading-tight mt-0.5">
                  SDG &amp; NDC Alignment
                </span>
              </div>
            )}
          </button>
        </div>

        {/* Module heading */}
        {!collapsed && (
          <div className="px-5 pt-5 pb-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">
              Module Sections
            </div>
          </div>
        )}

        {/* Nav */}
        <nav
          className={`flex-1 overflow-y-auto ${collapsed ? "px-2 pt-3" : "px-3"} pb-2 space-y-1`}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 transition-colors text-left group ${
                  isActive
                    ? "bg-[#86bc25]/10 dark:bg-[#86bc25]/15"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800/60"
                } ${collapsed ? "justify-center px-2" : ""}`}
                style={
                  isActive
                    ? { borderLeft: `3px solid ${BRAND_GREEN}` }
                    : { borderLeft: "3px solid transparent" }
                }
              >
                <Icon
                  size={18}
                  className={`shrink-0 ${
                    isActive
                      ? "text-[#86bc25]"
                      : "text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  }`}
                />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-bold leading-tight truncate ${
                        isActive
                          ? "text-[#86bc25]"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-500 leading-tight truncate mt-0.5">
                      {item.subLabel}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-800 p-3 space-y-2">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-2">
              <div className="w-9 h-9 bg-[#86bc25] flex items-center justify-center text-white text-xs font-black shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-900 dark:text-white truncate">
                  {user?.name || "User"}
                </div>
                <div className="text-[10px] text-gray-500 truncate">
                  {user?.role || "Analyst"}
                </div>
              </div>
            </div>
          )}

          <div className={collapsed ? "flex justify-center" : ""}>
            <ThemeToggle />
          </div>

          <button
            onClick={() => navigate("/modules")}
            title="Back to modules"
            className={`w-full flex items-center gap-2 px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-gray-500 hover:text-[#86bc25] hover:bg-[#86bc25]/5 transition-colors ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <ArrowLeft size={12} />
            {!collapsed && <span>Back to Modules</span>}
          </button>
        </div>

        {/* Collapse handle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:bg-[#86bc25] hover:text-white hover:border-[#86bc25] transition-colors z-10"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
