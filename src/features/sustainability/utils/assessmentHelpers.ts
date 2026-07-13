import type {
  EntitySnapshot,
  GovernanceAssessmentData,
  ValueChainData,
} from "@/store/sustainabilityStore";

export function emptyGovernanceAssessment(): GovernanceAssessmentData {
  return {
    clientName: "",
    sector: "",
    geography: "",
    reportingBasis: "",
    assessmentDate: "",
    reportingRequirement: "",
    documentsReviewed: [],
    kickOffNotes: "",
    questions: {},
    overallConclusion: "",
    mainGovernanceWeaknesses: "",
    immediateActions: "",
    stakeholdersToEngage: "",
    additionalSupportNeeded: "",
  };
}

export function emptyValueChain(): ValueChainData {
  return {
    businessModelDescription: "",
    keyProductsServices: "",
    keyMarketsRegions: "",
    activities: [],
    resources: [],
    questionnaireResponses: {},
    questionOverrides: {},
  };
}

/** True when Phase 1 has at least client context or one scored question. */
export function hasGovernanceStarted(ga: GovernanceAssessmentData): boolean {
  if (ga.clientName?.trim()) return true;
  return Object.values(ga.questions ?? {}).some((q) => !!q.score);
}

/** Resolve the primary entity snapshot regardless of legacy id conventions. */
export function resolvePrimarySnapshot(
  snapshots: Record<string, EntitySnapshot>,
  activeEntityId: string | null | undefined,
  projectId: string,
): EntitySnapshot | null {
  const preferred = activeEntityId ?? "parent";
  return (
    snapshots[preferred]
    ?? snapshots[`${projectId}-parent`]
    ?? snapshots.parent
    ?? Object.values(snapshots)[0]
    ?? null
  );
}
