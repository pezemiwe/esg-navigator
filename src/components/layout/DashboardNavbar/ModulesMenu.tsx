import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  PieChart,
  CloudLightning,
  TrendingUp,
  Building2,
  FileText,
  BarChart3,
  ChevronDown,
  Lock,
} from "lucide-react";
import { useCRAStatusStore } from "@/store/craStore";

const MODULE_ITEMS = [
  {
    label: "CRA Data Setup",
    description: "Upload and manage portfolio data",
    path: "/cra/data",
    icon: Upload,
    requiresData: false,
  },
  {
    label: "Portfolio Segmentation",
    description: "Sector and geographic analysis",
    path: "/cra/segmentation",
    icon: PieChart,
    requiresData: true,
  },
  {
    label: "Physical Risk Assessment",
    description: "Acute and chronic climate hazards",
    path: "/cra/physical-risk",
    icon: CloudLightning,
    requiresData: true,
  },
  {
    label: "Transition Risk Assessment",
    description: "Policy, technology, and market risks",
    path: "/cra/transition-risk",
    icon: TrendingUp,
    requiresData: true,
  },
  {
    label: "Collateral Sensitivity",
    description: "Impact on security values",
    path: "/cra/collateral",
    icon: Building2,
    requiresData: true,
  },
  {
    label: "CRA Reporting",
    description: "Generate compliance reports",
    path: "/cra/reporting",
    icon: FileText,
    requiresData: true,
  },
] as const;

export function ModulesMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { dataUploaded } = useCRAStatusStore();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-semibold rounded transition-colors text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10"
      >
        Modules
        <ChevronDown className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl z-50">
          <div className="flex items-center gap-2 px-4 py-3 bg-primary-50 dark:bg-primary-900/20 rounded-t-lg">
            <BarChart3 className="w-5 h-5 text-primary-500" />
            <span className="font-bold text-sm text-primary-700 dark:text-primary-400">
              Climate Risk Assessment
            </span>
          </div>
          <div className="border-t border-neutral-200 dark:border-neutral-700" />
          {MODULE_ITEMS.map((item) => {
            const locked = item.requiresData && !dataUploaded;
            return (
              <button
                key={item.path}
                onClick={() => {
                  if (locked) return;
                  setOpen(false);
                  navigate(item.path);
                }}
                className={`flex items-center w-full px-4 py-3 text-left transition-colors ${
                  locked
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                }`}
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    {item.label}
                    {locked && <Lock className="w-3 h-3 text-neutral-400" />}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {locked ? "Complete Data Setup first" : item.description}
                  </div>
                </div>
                <item.icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
