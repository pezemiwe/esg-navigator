import { DELOITTE_COLORS } from "@/config/colors.config";

export const getSensitivityLevel = (score: number): string => {
  if (score >= 4.5) return "Very High";
  if (score >= 3.5) return "High";
  if (score >= 2.5) return "Medium";
  if (score >= 1.5) return "Low";
  return "Very Low";
};

export const getSensitivityColor = (level: string): string => {
  switch (level) {
    case "Very High":
      return DELOITTE_COLORS.error;
    case "High":
      return "#F97316";
    case "Medium":
      return DELOITTE_COLORS.green.DEFAULT;
    case "Low":
      return "#84CC16";
    case "Very Low":
      return DELOITTE_COLORS.success;
    default:
      return DELOITTE_COLORS.slate.DEFAULT;
  }
};

export const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  notation: "compact",
  compactDisplay: "short",
});

export const getNormalizedDriverScore = (
  impact: number,
  likelihood: number,
): number => {
  const product = impact * likelihood;
  if (product >= 20) return 5;
  if (product >= 12) return 4;
  if (product >= 6) return 3;
  if (product >= 3) return 2;
  return 1;
};

export const getScoreLabel = (score: number): string => {
  if (score >= 4.5) return "VH";
  if (score >= 3.5) return "H";
  if (score >= 2.5) return "M";
  if (score >= 1.5) return "L";
  return "VL";
};

export const getOverallRiskLevel = (
  score: number,
): { label: string; color: string; bg: string } => {
  if (score >= 4.5)
    return { label: "Very High", color: "#ef4444", bg: "#fecaca" };
  if (score >= 3.5) return { label: "High", color: "#f97316", bg: "#ffedd5" };
  if (score >= 2.5) return { label: "Medium", color: "#eab308", bg: "#fef9c3" };
  if (score >= 2.0)
    return { label: "Low-Medium", color: "#84cc16", bg: "#d9f99d" };
  return { label: "Low", color: "#22c55e", bg: "#dcfce7" };
};

export const safeExposure = (val: unknown): number => {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

export const formatExposureM = (val: unknown): string => {
  const num = safeExposure(val);
  return (num / 1000000).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "M";
};

export const getDeterministicScore = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return (Math.abs(hash) % 5) + 1;
};

const ASSET_TYPE_LABELS: Record<string, string> = {
  loans_advances: "Loans & Advances",
  equities: "Equities",
  bonds_fixed_income: "Bonds & Fixed Income",
  derivatives: "Derivatives",
  guarantees_obs: "Guarantees & OBS",
};

export const formatAssetType = (type: string): string => {
  if (ASSET_TYPE_LABELS[type]) return ASSET_TYPE_LABELS[type];
  if (type.startsWith("other_asset_")) {
    const num = type.split("_")[2];
    return `Other Asset ${num}`;
  }
  return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatShortCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    compactDisplay: "short",
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
};

export const formatColumnHeader = (column: string): string =>
  column.replace(/([A-Z])/g, " $1").trim();

export const getRiskLevelColor = (level: string): string => {
  const normalizedLevel = level?.toLowerCase() || "";
  if (normalizedLevel.includes("very high")) return "#ef4444";
  if (normalizedLevel.includes("high")) return "#f97316";
  if (
    normalizedLevel.includes("medium") ||
    normalizedLevel.includes("moderate")
  )
    return "#eab308";
  if (normalizedLevel.includes("low") && !normalizedLevel.includes("very"))
    return "#84cc16";
  if (normalizedLevel.includes("very low")) return "#22c55e";
  return "#6b7280";
};
