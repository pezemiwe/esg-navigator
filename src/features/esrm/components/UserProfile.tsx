import React, { useState, useRef, useEffect } from "react";
import { Settings, LogOut, Bell, HelpCircle, ChevronDown } from "lucide-react";
import { getInitials } from "../utils";

interface UserProfileProps {
  user?: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

const UserProfile: React.FC<UserProfileProps> = ({
  user = {
    name: "John Doe",
    email: "john.doe@boi.ng",
    role: "Risk Manager",
    avatar: undefined,
  },
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    console.log("Logging out...");
    setIsDropdownOpen(false);
  };

  const handleSettings = () => {
    console.log("Opening settings...");
    setIsDropdownOpen(false);
  };

  const handleHelp = () => {
    console.log("Opening help...");
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative">
        <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 relative cursor-pointer">
          <Bell className="w-5 h-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -rit-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold animate-pulse">
              {notifications}
            </span>
          )}
        </button>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 group cursor-pointer"
        >
          <div className="relative">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-all duration-200">
                {getInitials(user.name)}
              </div>
            )}
            <div className="absolute -bottom-1 -rit-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>

          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
              {user.name}
            </p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isDropdownOpen && (
          <div className="absolute rit-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-blue-600 font-medium">
                    {user.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="py-2">
              <button
                onClick={handleSettings}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm font-medium">Account Settings</span>
              </button>

              <button
                onClick={handleHelp}
                className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Help & Support</span>
              </button>

              <div className="border-t border-gray-100 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
