import { useState } from "react";
import {
  User,
  Mail,
  Building,
  Phone,
  MapPin,
  Calendar,
  Award,
  Shield,
  Save,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
export default function UserProfile() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState("+234 801 000 0000");
  const [location, setLocation] = useState("Head Office, Lagos");
  const handleSave = () => {
    setIsEditing(false);
    alert("Profile updated successfully!");
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-linear-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-2xl p-8 border-2 border-neutral-200 dark:border-slate-800 shadow-xl transition-colors relative overflow-hidden">
        <div className="absolute top-0 rit-0 w-96 h-96 bg-[#86BC25]/5 dark:bg-[#86BC25]/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#86BC25] text-neutral-900 flex items-center justify-center text-4xl font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              {user?.name}
            </h1>
            <p className="text-neutral-500 dark:text-slate-400 font-medium">
              {user?.role} • {user?.department || "Deloitte"}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-3">
              <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 transition-colors">
                Active Employee
              </span>
              <span className="text-sm text-neutral-400">ID: DT-4829</span>
            </div>
          </div>
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors cursor-pointer flex items-center gap-2 ${
              isEditing
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-neutral-100 dark:bg-slate-800 text-neutral-900 dark:text-white hover:bg-neutral-200 dark:hover:bg-slate-700"
            }`}
          >
            {isEditing ? (
              <>
                <Save size={16} /> Save Changes
              </>
            ) : (
              "Edit Profile"
            )}
          </button>
          {isEditing && (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md font-medium text-sm hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors cursor-pointer flex items-center gap-2"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border-2 border-neutral-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-5 flex items-center gap-2 transition-colors">
            <User size={20} className="text-[#86BC25]" />
            Personal Information
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="text-neutral-400" size={16} />
              <div className="flex-1">
                <p className="text-neutral-500 dark:text-slate-500 text-xs">
                  Email Address
                </p>
                <p className="text-neutral-900 dark:text-slate-200 font-medium">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="text-neutral-400" size={16} />
              <div className="flex-1">
                <p className="text-neutral-500 dark:text-slate-500 text-xs">
                  Phone
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1 px-2 py-1 border border-neutral-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#86BC25]"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-slate-200 font-medium">
                    {phone}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="text-neutral-400" size={16} />
              <div className="flex-1">
                <p className="text-neutral-500 dark:text-slate-500 text-xs">
                  Location
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full mt-1 px-2 py-1 border border-neutral-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-neutral-900 dark:text-white focus:outline-none focus:border-[#86BC25]"
                  />
                ) : (
                  <p className="text-neutral-900 dark:text-slate-200 font-medium">
                    {location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-lg p-6 border border-neutral-200 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-lg font-bold text-neutral-900 dark:text-white mb-4 flex items-center gap-2">
            <Shield size={20} className="text-[#86BC25]" />
            Organization Details
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Building className="text-neutral-400" size={16} />
              <div>
                <p className="text-neutral-500 dark:text-slate-500 text-xs">
                  Department
                </p>
                <p className="text-neutral-900 dark:text-slate-200 font-medium">
                  {user?.department || "ESG Office"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Award className="text-neutral-400" size={16} />
              <div>
                <p className="text-neutral-500 dark:text-slate-500 text-xs">
                  Job Title
                </p>
                <p className="text-neutral-900 dark:text-slate-200 font-medium">
                  Senior Analyst
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="text-neutral-400" size={16} />
              <div>
                <p className="text-neutral-500 dark:text-slate-500 text-xs">
                  Joined Date
                </p>
                <p className="text-neutral-900 dark:text-slate-200 font-medium">
                  January 15, 2022
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
