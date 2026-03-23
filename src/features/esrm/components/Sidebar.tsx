import React from "react";
import {
  LayoutDashboard,
  ShieldCheck,
  Briefcase,
  LogOut,
  Grid,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileBarChart,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";

interface SidebarProps {
  onNavigate?: (view: string) => void;
  currentView?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navSections = [
  {
    items: [
      { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
      { icon: UserPlus, label: "New Project", view: "create-customer" },
      { icon: Briefcase, label: "Pending Tasks", view: "pending-tasks" },
      {
        icon: ShieldCheck,
        label: "Completed Projects",
        view: "completed-projects",
      },
      { icon: BookOpen, label: "Methodology", view: "methodology" },
      { icon: FileBarChart, label: "Admin", view: "admin" },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  currentView = "dashboard",
  collapsed = false,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { mode } = useThemeStore();
  const isDark = mode === "dark";

  const initials = (user?.name || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={`${
        collapsed ? "w-18" : "w-64"
      } fixed left-0 top-0 flex-col bg-white dark:bg-[#0B1120] border-r border-slate-200/60 dark:border-slate-800/60 h-screen z-30 transition-all duration-300 ease-out hidden md:flex`}
    >
      {/* Brand */}
      <div
        className={`h-16 flex items-center border-b border-slate-100 dark:border-slate-800/40 shrink-0 ${
          collapsed ? "justify-center px-0" : "px-5"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <img
            src={
              isDark
                ? "/assets/images/small-dark.jpg"
                : "/assets/images/small-light.png"
            }
            alt="Logo"
            className="w-8 h-8 rounded-md object-contain shrink-0"
          />
          {!collapsed && (
            <div className="border-l-2 border-[#86BC25] pl-2.5 ml-0.5">
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight whitespace-nowrap">
                ESG Navigator
              </p>
              <p className="text-[10px] font-bold text-[#86BC25] uppercase tracking-[0.12em] whitespace-nowrap">
                ESRM Module
              </p>
            </div>
          )}
        </div>
      </div>

      {/* User Card */}
      <div
        className={`shrink-0 border-b border-slate-100 dark:border-slate-800/40 ${
          collapsed ? "py-4 flex justify-center" : "px-4 py-4"
        }`}
      >
        {collapsed ? (
          <div className="w-9 h-9 rounded-full bg-[#86BC25]/10 ring-2 ring-[#86BC25]/20 flex items-center justify-center">
            <span className="text-xs font-bold text-[#86BC25]">{initials}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#86BC25]/10 ring-2 ring-[#86BC25]/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-[#86BC25]">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">
                {user?.name || "ESRM User"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.role || "Risk Analyst"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 overflow-y-auto overflow-x-hidden py-4 ${
          collapsed ? "px-2" : "px-3"
        }`}
      >
        {navSections.map((section, si) => (
          <div key={si} className={si > 0 ? "mt-6" : ""}>
            {!collapsed && "label" in section && (
              <p className="px-5 mb-3 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-slate-300">
                {(section as any).label}
              </p>
            )}
            {collapsed && si > 0 && (
              <div className="mx-2 mb-3 h-px bg-slate-100 dark:bg-slate-800" />
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const active = currentView === item.view;
                return (
                  <li key={item.view}>
                    <button
                      onClick={() => onNavigate?.(item.view)}
                      title={collapsed ? item.label : undefined}
                      className={`relative flex items-center w-full rounded-r-none transition-all duration-200 group cursor-pointer ${
                        active
                          ? "bg-[#86BC25]/10 text-[#86BC25]"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                      } ${collapsed ? "justify-center p-3" : "px-5 py-3 gap-4"}`}
                    >
                      {/* Active accent bar */}
                      {active && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#86BC25]" />
                      )}
                      <item.icon
                        size={20}
                        className={
                          active
                            ? "text-[#86BC25]"
                            : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        }
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                      {!collapsed && (
                        <span
                          className={`text-sm whitespace-nowrap ${
                            active ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {item.label}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className={`shrink-0 border-t border-slate-100 dark:border-slate-800/40 py-4 ${
          collapsed ? "px-2" : "px-3"
        }`}
      >
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate("/modules")}
              title={collapsed ? "Switch Module" : undefined}
              className={`flex items-center w-full rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer ${
                collapsed ? "justify-center p-3" : "px-5 py-3 gap-4"
              }`}
            >
              <Grid
                size={20}
                strokeWidth={1.8}
                className="text-slate-400 dark:text-slate-500"
              />
              {!collapsed && (
                <span className="text-sm font-medium">Switch Module</span>
              )}
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              title={collapsed ? "Sign Out" : undefined}
              className={`flex items-center w-full rounded-lg text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer ${
                collapsed ? "justify-center p-3" : "px-5 py-3 gap-4"
              }`}
            >
              <LogOut size={20} strokeWidth={1.8} />
              {!collapsed && (
                <span className="text-sm font-medium">Sign Out</span>
              )}
            </button>
          </li>
        </ul>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute top-[50%] -translate-y-1/2 -right-3 w-6 h-6 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-sm text-slate-400 hover:text-[#86BC25] z-40 cursor-pointer transition-colors"
      >
        {collapsed ? (
          <ChevronRight size={13} strokeWidth={2.5} />
        ) : (
          <ChevronLeft size={13} strokeWidth={2.5} />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
