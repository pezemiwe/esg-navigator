import { useState } from "react";
import {
  Table,
  ListChecks,
  PieChart,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const DRAWER_WIDTH = "w-[280px]";
const COLLAPSED_WIDTH = "w-[72px]";

const WORKFLOW_ITEMS = [
  {
    id: "profiling",
    label: "Profiling",
    subLabel: "Define Scope",
    icon: ListChecks,
    path: "/materiality/profiling",
  },
  {
    id: "input",
    label: "Data Input",
    subLabel: "Values & Weights",
    icon: Table,
    path: "/materiality/data-input",
  },
  {
    id: "dashboard",
    label: "Analytics",
    subLabel: "Results View",
    icon: PieChart,
    path: "/materiality",
  },
];

const BRAND_GREEN = "#86bc25";

export default function MaterialitySidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const currentWidth = collapsed ? COLLAPSED_WIDTH : DRAWER_WIDTH;

  return (
    <aside
      className={`relative flex-shrink-0 transition-all duration-300 ease-in-out h-screen flex flex-col bg-[#161616] text-white shadow-[4px_0_24px_rgba(0,0,0,0.4)] ${currentWidth}`}
    >
      <div
        className={`p-${collapsed ? 2 : 4} pb-2 border-b border-[#86bc25]/20 flex flex-row items-center ${
          collapsed ? "justify-center" : "justify-start"
        }`}
        style={{
          background: `linear-gradient(90deg, ${BRAND_GREEN}1A 0%, transparent 100%)`,
        }}
      >
        <img
          src="/assets/images/small-dark.jpg"
          alt="Deloitte"
          className="h-7 w-7 object-contain flex-shrink-0"
        />
        {!collapsed && (
          <div className="border-l-2 border-[#86bc25] pl-3 ml-3 flex flex-col">
            <span className="font-bold text-white text-[14px] leading-tight whitespace-nowrap">
              ESG Navigator
            </span>
            <span className="text-[9px] font-bold text-[#86bc25] uppercase tracking-widest whitespace-nowrap leading-tight">
              Materiality Assessment
            </span>
          </div>
        )}
      </div>

      <div className={`flex-grow py-4 px-${collapsed ? 1 : 2}`}>
        {!collapsed && (
          <span className="block pl-2 mb-2 text-[#86bc25]/80 font-bold text-[10px] uppercase tracking-[0.15em]">
            Workflow Stages
          </span>
        )}

        <ul className="flex flex-col gap-1.5 p-0 m-0">
          {WORKFLOW_ITEMS.map((item) => {
            const isDashboard = item.id === "dashboard";
            const customMatch = isDashboard
              ? location.pathname === "/materiality"
              : location.pathname.startsWith(item.path);

            const Icon = item.icon;

            return (
              <li key={item.id} className="relative">
                <button
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`group relative w-full flex items-center py-3 px-${
                    collapsed ? "0 justify-center" : "4 justify-start"
                  } transition-all duration-300 ease-in-out bg-transparent border border-transparent ${
                    customMatch
                      ? "bg-[#86bc25]/10 border-[#86bc25]/30 hover:bg-[#86bc25]/20"
                      : "hover:bg-[#86bc25]/10"
                  } ${!collapsed && "hover:translate-x-1"} rounded-none`}
                >
                  {customMatch && !collapsed && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-[40%] w-1 bg-[#86bc25]"
                      style={{ boxShadow: `0 0 12px ${BRAND_GREEN}` }}
                    />
                  )}

                  <div
                    className={`flex items-center justify-center ${
                      collapsed ? "" : "min-w-[42px]"
                    } ${
                      customMatch ? "text-[#86bc25]" : "text-white/40"
                    }`}
                  >
                    <Icon size={20} />
                  </div>

                  {!collapsed && (
                    <div className="flex flex-col text-left">
                      <span
                        className={`text-[15px] ${
                          customMatch ? "font-semibold text-white" : "font-normal text-white/70"
                        }`}
                      >
                        {item.label}
                      </span>
                      <span className="text-[11px] text-white/40 -mt-0.5">
                        {item.subLabel}
                      </span>
                    </div>
                  )}

                  {customMatch && !collapsed && (
                    <div className="ml-auto">
                      <div
                        className="w-1.5 h-1.5 rounded-full bg-[#86bc25]"
                        style={{ boxShadow: `0 0 8px ${BRAND_GREEN}` }}
                      />
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className={`p-${collapsed ? 1.5 : 4} bg-black/20`}>
        {!collapsed ? (
          <>
            <button
              onClick={() => navigate("/modules")}
              className="w-full flex items-center gap-3 py-2 px-3 mb-4 text-white/60 hover:text-white hover:bg-white/5 border border-white/10 rounded-sm transition-colors text-[14px]"
            >
              <LayoutDashboard size={18} />
              Switch Module
            </button>
            <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-sm">
              <div className="w-9 h-9 rounded bg-[#86bc25] text-black flex items-center justify-center font-bold text-[14px]">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-white font-medium text-[14px] truncate">
                  {user?.name || "User"}
                </span>
                <span className="text-white/40 text-[12px] truncate">
                  {user?.role || "ESG Officer"}
                </span>
              </div>
            </div>
          </>
        ) : (
          <button
            onClick={() => navigate("/modules")}
            title="Switch Module"
            className="w-full flex justify-center py-3 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LayoutDashboard size={20} />
          </button>
        )}
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-3.5 h-14 bg-[#333333] hover:bg-[#444444] rounded-sm flex items-center justify-center z-10 transition-colors"
      >
        {collapsed ? (
          <ChevronRight size={14} className="text-white" />
        ) : (
          <ChevronLeft size={14} className="text-white" />
        )}
      </button>
    </aside>
  );
}
