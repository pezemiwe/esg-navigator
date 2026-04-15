export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatShortCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absValue >= 1000000000) {
    return `${sign}\u20A6${(absValue / 1000000000).toFixed(1)}B`;
  }
  if (absValue >= 1000000) {
    return `${sign}\u20A6${(absValue / 1000000).toFixed(1)}M`;
  }
  if (absValue >= 1000) {
    return `${sign}\u20A6${(absValue / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value);
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
