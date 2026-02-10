import { Bell, Search, User, ChevronDown } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            ESRM Dashboard
          </h1>
          <span className="px-3 py-1 bg-[#86BC25]/10 text-amber-900 dark:text-[#86BC25] border border-[#86BC25]/20 text-sm font-medium rounded-full">
            Live Overview
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-[#86BC25] focus:border-[#86BC25] w-64 transition-colors bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <button className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -rit-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>

          <div className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors group">
            <div className="w-8 h-8 bg-slate-900 dark:bg-[#86BC25] rounded-full flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#86BC25]/50 transition-all">
              <User className="w-4 h-4 text-white dark:text-slate-900" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                John Doe
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Administrator
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
