import type {
  Phase4Entry,
  Phase5Item,
  Phase5MetricScore,
  SRROItem,
} from "@/store/sustainabilityStore";

export interface ApprovedMaterialMetric {
  id: string;
  projectId: string;
  srroRef: string;
  srroTitle: string;
  srroCrro: string;
  type: string;
  metricName: string;
  sasbTopic: string;
  sasbSector: string;
  sasbIndustry: string;
  finalScore: number;
  assignedUserId?: string;
  approvalStatus?: "Draft" | "Submitted" | "Manager Approved" | "Internal Audit Approved" | "Board Approved";
  approvedAt?: string;
}

function calcFinalScore(l: number, m: number, qual: string, agg: string) {
  const base = l * m;
  if (base === 0) return 0;
  return base * (qual === "Yes" ? 2 : 1) * (agg === "Yes" ? 2 : 1);
}

function metricScore(p5: Phase5Item | undefined, name: string): Phase5MetricScore {
  return (
    p5?.metricScores?.find((s) => s.metricName === name) ?? {
      metricName: name,
      likelihood: 0,
      magnitude: 0,
      qualitativeFlag: "",
      aggregationFlag: "",
    }
  );
}

/** Extract material metrics (Final ≥ 6) from an approved Phase 5 assessment. */
export function buildApprovedMaterialMetrics(
  projectId: string,
  srroItems: SRROItem[],
  phase4Entries: Phase4Entry[],
  phase5Items: Phase5Item[],
  existing: ApprovedMaterialMetric[] = [],
): ApprovedMaterialMetric[] {
  const finalList = srroItems.filter((i) => i.includeInFinalList === "Yes");
  const existingById = new Map(existing.map((m) => [m.id, m]));
  const metrics: ApprovedMaterialMetric[] = [];

  for (const srro of finalList) {
    const p4 = phase4Entries.find((e) => e.ref === srro.ref);
    const p5 = phase5Items.find((p) => p.ref === srro.ref);
    const allMetrics = [
      ...new Set([
        ...(p4?.selectedMetrics ?? []),
        ...(p4?.additionalMetrics
          ? p4.additionalMetrics.split(/[,\n]+/).map((m) => m.trim()).filter(Boolean)
          : []),
      ]),
    ];

    for (const name of allMetrics) {
      const s = metricScore(p5, name);
      const fs = calcFinalScore(s.likelihood, s.magnitude, s.qualitativeFlag, s.aggregationFlag);
      if (fs < 6) continue;

      const id = `${projectId}::${srro.ref}::${name}`;
      const prior = existingById.get(id);
      metrics.push({
        id,
        projectId,
        srroRef: srro.ref,
        srroTitle: srro.title,
        srroCrro: srro.srroCrro,
        type: srro.type,
        metricName: name,
        sasbTopic: p4?.sasbTopic ?? "",
        sasbSector: p4?.sasbSector ?? "",
        sasbIndustry: p4?.sasbIndustry ?? "",
        finalScore: fs,
        assignedUserId: prior?.assignedUserId,
        approvalStatus: prior?.approvalStatus ?? "Draft",
        approvedAt: prior?.approvedAt,
      });
    }
  }

  return metrics;
}
