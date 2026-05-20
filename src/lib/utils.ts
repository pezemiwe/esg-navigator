import { getRegion } from "@/store/regionStore";

export function formatCurrency(value: number): string {
  const r = getRegion();
  return new Intl.NumberFormat(r.locale, {
    style: "currency",
    currency: r.currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatShortCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  const sym = getRegion().currencySymbol;
  if (absValue >= 1000000000) {
    return `${sign}${sym}${(absValue / 1000000000).toFixed(1)}B`;
  }
  if (absValue >= 1000000) {
    return `${sign}${sym}${(absValue / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `${sign}${sym}${(absValue / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}

/** Returns just the currency symbol for the active region (e.g. \u20A6 or \u20B5). */
export function currencySymbol(): string {
  return getRegion().currencySymbol;
}

import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getAssetExposure(asset: Record<string, unknown>): number {
  return (
    Number(asset.outstandingBalance) ||
    Number(asset["Net Book Value"]) ||
    Number(asset["Book Value"]) ||
    Number(asset.bookValue) ||
    0
  );
}
