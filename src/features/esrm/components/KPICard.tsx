import React from "react";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color: "blue" | "green" | "orange" | "red";
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  color,
}) => {
  const colorClasses = {
    blue: "bg-blue-500 text-white",
    green: "bg-emerald-500 text-white",
    orange: "bg-orange-500 text-white",
    red: "bg-red-500 text-white",
  };

  const bgColorClasses = {
    blue: "bg-blue-50 border-blue-100",
    green: "bg-emerald-50 border-emerald-100",
    orange: "bg-orange-50 border-orange-100",
    red: "bg-red-50 border-red-100",
  };

  const changeColorClasses = {
    positive: "text-emerald-600 bg-emerald-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50",
  };

  return (
    <div
      className={`relative p-6 rounded-xl border-2 ${bgColorClasses[color]} hover:shadow-lg transition-all duration-300 group overflow-hidden cursor-pointer`}
    >
      <div className="absolute top-0 rit-0 w-32 h-32 opacity-5 transform translate-x-8 -translate-y-8">
        <Icon className="w-full h-full" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-lg ${colorClasses[color]} group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="w-6 h-6" />
          </div>
          {change && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${changeColorClasses[changeType]}`}
            >
              {change}
            </span>
          )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-300">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
