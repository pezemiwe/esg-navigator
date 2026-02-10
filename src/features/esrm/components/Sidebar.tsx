import React from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  CheckCircle,
  Clock,
  LogOut,
  Grid,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface SidebarProps {
  onNavigate?: (view: string) => void;
  currentView?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  onNavigate,
  currentView = "dashboard",
  collapsed = false,
  onToggleCollapse,
}) => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      active: currentView === "dashboard",
      view: "dashboard",
    },
    {
      icon: Users,
      label: "Create Customer",
      active: currentView === "create-customer",
      view: "create-customer",
    },
    {
      icon: Clock,
      label: "Pending Tasks",
      active: currentView === "pending-tasks",
      view: "pending-tasks",
    },
    {
      icon: CheckCircle,
      label: "Completed Projects",
      active: currentView === "completed-projects",
      view: "completed-projects",
    },
    {
      icon: Users,
      label: "Methodology",
      active: currentView === "methodology",
      view: "methodology",
    },
    {
      icon: Settings,
      label: "Admin",
      active: currentView === "admin",
      view: "admin",
    },
  ];

  return (
    <aside
      className={`${collapsed ? "w-[72px]" : "w-72"} flex-col bg-white dark:bg-slate-900 border-r border-neutral-200 dark:border-slate-800 fixed h-full z-20 transition-all duration-300 hidden md:flex overflow-hidden`}
    >
      <div
        className={`h-20 flex items-center ${collapsed ? "px-3 justify-center" : "px-6"} border-b border-neutral-200 dark:border-slate-800 bg-white dark:bg-slate-900`}
      >
        <div
          className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}
        >
          {collapsed ? (
            <>
              <img
                src="/assets/images/small-light.png"
                alt="Deloitte"
                className="h-7 w-7 object-contain dark:hidden"
              />
              <img
                src="/assets/images/small-dark.jpg"
                alt="Deloitte"
                className="h-7 w-7 object-contain hidden dark:block"
              />
            </>
          ) : (
            <>
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
              <div className="flex flex-col border-l-2 border-[#86BC25] pl-3">
                <span className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
                  ESG Navigator
                </span>
                <span className="text-xs font-semibold text-[#86BC25] uppercase tracking-wider">
                  ESRM Module
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className={`flex-1 py-8 ${collapsed ? "px-2" : "px-4"} overflow-hidden`}
      >
        <div className="mb-8">
          {!collapsed && (
            <h3 className="px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
              Main Menu
            </h3>
          )}
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                {collapsed ? (
                  <button
                    onClick={() =>
                      onNavigate && item.view && onNavigate(item.view)
                    }
                    className={`flex items-center justify-center w-full p-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                      item.active
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-slate-800 font-bold shadow-md"
                        : "text-neutral-600 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800"
                    }`}
                    title={item.label}
                  >
                    <item.icon
                      size={20}
                      className={
                        item.active
                          ? "text-[#86BC25]"
                          : "text-neutral-400 dark:text-slate-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
                      }
                    />
                  </button>
                ) : (
                  <button
                    onClick={() =>
                      onNavigate && item.view && onNavigate(item.view)
                    }
                    className={`flex items-center w-full gap-3 px-4 py-3.5 rounded-lg transition-all duration-200 group cursor-pointer ${
                      item.active
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-slate-800 font-bold shadow-md transform scale-[1.02]"
                        : "text-neutral-600 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800 hover:text-neutral-900 dark:hover:text-white font-medium"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={
                        item.active
                          ? "text-[#86BC25]"
                          : "text-neutral-400 dark:text-slate-500 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors"
                      }
                    />
                    <span className="tracking-wide text-sm">{item.label}</span>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {!collapsed && (
          <div>
            <h3 className="px-4 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
              Preferences
            </h3>
            <nav className="space-y-1">
              <button
                onClick={() => navigate("/modules")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-500 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-800 hover:text-neutral-900 dark:hover:text-white transition-colors group cursor-pointer"
              >
                <Grid
                  size={20}
                  className="text-neutral-400 dark:text-slate-500 group-hover:text-neutral-900 dark:group-hover:text-white"
                />
                Switch Module
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-neutral-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors group cursor-pointer"
              >
                <LogOut
                  size={20}
                  className="text-neutral-400 group-hover:text-red-500"
                />
                Sign Out
              </button>
            </nav>
          </div>
        )}
        {collapsed && (
          <div className="space-y-1">
            <button
              onClick={() => navigate("/modules")}
              className="w-full flex items-center justify-center p-3 rounded-xl text-neutral-500 dark:text-slate-400 hover:bg-neutral-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Switch Module"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full flex items-center justify-center p-3 rounded-xl text-neutral-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="p-6 border-t border-neutral-100 dark:border-slate-800 bg-neutral-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border-2 border-[#86BC25] p-0.5 shadow-sm overflow-hidden shrink-0">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${user?.name || "User"}`
                }
                alt="User"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                {user?.name || "User Name"}
              </p>
              <p className="text-xs text-neutral-500 dark:text-slate-400 truncate">
                {user?.role || "Risk Manager"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        onClick={onToggleCollapse}
        className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer z-10 transition-all hover:bg-[#444444]"
        style={{
          right: -7,
          width: 14,
          height: 56,
          borderRadius: 5,
          backgroundColor: "#333333",
        }}
      >
        {collapsed ? (
          <ChevronsRight size={10} className="text-white" />
        ) : (
          <ChevronsLeft size={10} className="text-white" />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
