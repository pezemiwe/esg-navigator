// Deloitte Enterprise Colors
const DELOITTE_GREEN = "#86bc25";

export const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
  highlight = false,
  change,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  highlight?: boolean;
  change?: { value: number; label: string };
}) => {
  const isDeloitteGreen =
    color === "#86bc25" || color === DELOITTE_GREEN || highlight;

  return (
    <div
      className={`p-6 flex flex-col justify-between border ${isDeloitteGreen ? "bg-[#f4fadc] border-[#86bc25]/30" : "bg-white border-[#e0e0e0]"}`}
    >
      <div className="flex items-center justify-between mb-6">
        <p
          className={`text-[12px] uppercase font-semibold tracking-wide ${isDeloitteGreen ? "text-[#435e12]" : "text-[#525252]"}`}
        >
          {label}
        </p>
        <div
          className={`w-8 h-8 flex items-center justify-center ${isDeloitteGreen ? "bg-[#86bc25]/20" : "bg-[#f4f4f4]"}`}
        >
          <Icon
            className={`w-4 h-4 ${isDeloitteGreen ? "text-[#435e12]" : "text-[#161616]"}`}
            style={{ color: !isDeloitteGreen && color ? color : undefined }}
          />
        </div>
      </div>
      <div>
        <p
          className={`text-[32px] font-light leading-none mb-1 flex items-baseline gap-2 ${isDeloitteGreen ? "text-[#435e12]" : "text-[#161616]"}`}
        >
          {value}
          {change && (
            <span
              className={`text-[12px] font-bold ${change.value >= 0 ? "text-[#da1e28]" : "text-[#10b981]"}`}
            >
              {change.value > 0 ? "+" : ""}
              {change.value}% {change.label}
            </span>
          )}
        </p>
        {sub && (
          <p
            className={`text-[12px] truncate ${isDeloitteGreen ? "text-[#70a31d]" : "text-[#525252]"}`}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
};
