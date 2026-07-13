export interface ReportSummaryPayload {
  clientName: string;
  sector: string;
  geography: string;
  governanceRating: string;
  governanceAvg: number;
  gapCount: number;
  srroCount: number;
  materialCount: number;
  materialItems: {
    ref: string;
    title: string;
    metric: string;
    finalScore: number;
  }[];
}

export async function generateReportSummary(payload: ReportSummaryPayload): Promise<string> {
  const res = await fetch("/api/report/generate-summary", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Failed to generate report summary");
  }
  const data = (await res.json()) as { summary: string };
  return data.summary;
}
