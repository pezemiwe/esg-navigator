export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatShortCurrency(value: number): string {
  if (value >= 1000000000) {
    return `S ${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `S ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `S ${(value / 1000).toFixed(1)}K`;
  }
  return formatCurrency(value);
}

export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}
