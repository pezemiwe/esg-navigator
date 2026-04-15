import { useNavigate } from "react-router-dom";
import { useThemeStore } from "@/store/themeStore";

interface NavBrandProps {
  subModuleTitle: string;
}

export function NavBrand({ subModuleTitle }: NavBrandProps) {
  const navigate = useNavigate();
  const isDark = useThemeStore((s) => s.mode === "dark");

  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => navigate("/modules")}
    >
      <img
        src={isDark ? "/assets/images/logo2.png" : "/assets/images/logo.png"}
        alt="Deloitte"
        className="h-10 w-auto transition-transform hover:scale-105"
      />
      <div className="hidden lg:flex flex-col border-l-2 border-primary-500 pl-3">
        <span className="font-bold text-base leading-tight text-neutral-900 dark:text-white">
          ESG Navigator
        </span>
        <span className="text-xs font-semibold text-primary-500 uppercase tracking-wide">
          {subModuleTitle}
        </span>
      </div>
    </div>
  );
}
