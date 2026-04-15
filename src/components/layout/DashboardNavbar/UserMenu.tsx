import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Building2, Settings } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!user) return null;

  const initials = user.name?.[0]?.toUpperCase() ?? "U";

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center p-1 rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-white/10"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-9 h-9 rounded-full border-2 border-primary-400 object-cover"
          />
        ) : (
          <div className="w-9 h-9 rounded-full border-2 border-primary-400 bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300">
            {initials}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-72 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xl z-50">
          <div className="px-4 py-3">
            <div className="flex items-center gap-3 mb-2">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full border-2 border-primary-300 object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg font-semibold text-primary-700 dark:text-primary-300">
                  {initials}
                </div>
              )}
              <div>
                <div className="font-bold text-sm text-neutral-900 dark:text-white">
                  {user.name}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {user.email}
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  {user.role?.replace("_", " ") || "Analyst"}
                </span>
              </div>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-700 my-2" />
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <Building2 className="w-3.5 h-3.5" />
              Deloitte &bull; ESG Analytics Division
            </div>
          </div>

          <div className="border-t border-neutral-200 dark:border-neutral-700" />

          <button
            onClick={() => {
              setOpen(false);
              navigate("/modules");
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Building2 className="w-4 h-4 text-neutral-400" />
            Switch Module
          </button>
          <button
            onClick={() => {
              setOpen(false);
              navigate("/profile");
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <User className="w-4 h-4 text-neutral-400" />
            Profile Settings
          </button>
          <button
            onClick={() => {
              setOpen(false);
              navigate("/settings");
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Settings className="w-4 h-4 text-neutral-400" />
            System Preferences
          </button>

          <div className="border-t border-neutral-200 dark:border-neutral-700" />

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors rounded-b-lg"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
