import { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bell, Upload } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";
import { NavBrand } from "./NavBrand";
import { ModulesMenu } from "./ModulesMenu";
import { UserMenu } from "./UserMenu";

function useSubModuleTitle() {
  const { pathname } = useLocation();
  return useMemo(() => {
    if (pathname.startsWith("/cra")) return "Credit Risk Analysis";
    if (pathname.startsWith("/materiality")) return "Materiality Assessment";
    if (pathname.startsWith("/scenario-analysis")) return "Scenario Analysis";
    if (pathname.startsWith("/carbon-accounting")) return "Carbon Accounting";
    if (pathname.startsWith("/reports")) return "Reporting Hub";
    if (pathname.startsWith("/dashboard")) return "Executive Dashboard";
    if (pathname.startsWith("/capacity-building")) return "Learning Hub";
    if (pathname.startsWith("/sdg-ndc")) return "SDG & NDC Alignment";
    if (pathname.startsWith("/esrm")) return "E&S Risk Management";
    return "Sustainability Platform";
  }, [pathname]);
}

export default function DashboardNavbar() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const subModuleTitle = useSubModuleTitle();

  if (!user) return null;

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-[70px] border-b border-primary-500/30 bg-white/95 dark:bg-neutral-900/90 backdrop-blur-xl">
      <nav className="flex items-center h-full px-6">
        <div className="flex items-center gap-6 flex-1">
          <NavBrand subModuleTitle={subModuleTitle} />

          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => navigate("/cra/dashboard")}
              className="px-3 py-2 text-sm font-semibold rounded transition-colors text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10"
            >
              Overview
            </button>
            <ModulesMenu />
            <button
              onClick={() => navigate("/reports")}
              className="px-3 py-2 text-sm font-semibold rounded transition-colors text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10"
            >
              Reports
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/cra/data")}
            className="flex items-center gap-1.5 px-3 h-10 text-xs font-medium border rounded transition-colors text-neutral-700 dark:text-neutral-200 border-neutral-300 dark:border-neutral-600 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20"
          >
            <Upload className="w-4 h-4" />
            Upload Data
          </button>
          <ThemeToggle />
          <button className="p-2 rounded transition-colors text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10">
            <Bell className="w-5 h-5" />
          </button>
          <UserMenu />
        </div>
      </nav>
    </header>
  );
}
