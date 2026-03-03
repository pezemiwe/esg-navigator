/**
 * Format a raw absolute Naira value (e.g. 302 000 000) for display.
 * Auto-scales to B / M as appropriate.
 */
export const formatScenarioCurrency = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    return `${sign}\u20A6${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  if (abs >= 1_000_000) {
    return `${sign}\u20A6${(abs / 1_000_000).toFixed(1)}M`;
  }
  return `${sign}\u20A6${abs.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export const formatScenarioCurrencyFull = (value: number): string => {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) {
    return `${sign}\u20A6${(abs / 1_000_000_000).toFixed(2)}B`;
  }
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format a dollar amount in $M.
 * Automatically promotes to $B when >= 1 000 $M.
 * Input is always in $M (millions).
 */
export const formatDollarM = (valueInM: number): string => {
  const abs = Math.abs(valueInM);
  const sign = valueInM < 0 ? "-" : "";
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(2)}B`;
  }
  if (abs >= 100) {
    return `${sign}$${abs.toFixed(0)}M`;
  }
  return `${sign}$${abs.toFixed(1)}M`;
};

export const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const downloadJSON = (data: unknown, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
