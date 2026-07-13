import type { AssessmentProject, Phase4Entry, Phase5Item, SRROItem } from "@/store/sustainabilityStore";
import { emptyValueChain } from "./assessmentHelpers";

export const PHASE_ROUTES = {
  1: "/sustainability/governance-assessment",
  2: "/sustainability/value-chain",
  3: "/sustainability/srro-register",
  4: "/sustainability/material-information",
  5: "/sustainability/materiality-scoring",
  data: "/sustainability/materiality",
} as const;

export type AssessmentPhaseKey = keyof typeof PHASE_ROUTES;

export type PhaseAccess = {
  unlocked: boolean;
  lockReason?: string;
};

export type AssessmentAccess = {
  hasActiveProject: boolean;
  clientName: string;
  phases: Record<AssessmentPhaseKey, PhaseAccess>;
  /** First phase route the user should work on for this assessment. */
  suggestedRoute: string;
};

const GOVERNANCE_QUESTION_COUNT = 18;

/** Phase 1 complete: engagement context + all governance questions answered. */
export function isPhase1Complete(project: AssessmentProject): boolean {
  const ga = project.governanceAssessment;
  if (!ga.clientName?.trim()) return false;
  const answered = Object.values(ga.questions ?? {}).filter((q) => !!q.score).length;
  return answered >= GOVERNANCE_QUESTION_COUNT;
}

/** Phase 2 complete: questionnaire captured and value chain mapped. */
export function isPhase2Complete(project: AssessmentProject): boolean {
  const vc = project.valueChain;
  const responses = vc.questionnaireResponses ?? {};
  const answeredCount = Object.values(responses).filter((v) => !!String(v ?? "").trim()).length;
  const hasMapping =
    (vc.activities?.length ?? 0) > 0
    || (vc.resources?.length ?? 0) > 0
    || !!vc.businessModelDescription?.trim();
  return answeredCount >= 3 && hasMapping;
}

/** Phase 3 complete: at least one SRRO/CRRO on the final list. */
export function isPhase3Complete(project: AssessmentProject): boolean {
  return project.srroItems.some((i) => i.includeInFinalList === "Yes");
}

/** Phase 4 complete: every final-list SRRO has material metrics mapped. */
export function isPhase4Complete(project: AssessmentProject): boolean {
  const finalRefs = project.srroItems
    .filter((i) => i.includeInFinalList === "Yes")
    .map((i) => i.ref);
  if (finalRefs.length === 0) return false;
  return finalRefs.every((ref) => {
    const entry = project.phase4Entries.find((e) => e.ref === ref);
    return (entry?.selectedMetrics?.length ?? 0) > 0;
  });
}

/** Phase 5 complete: materiality report approved by client. */
export function isPhase5Complete(project: AssessmentProject): boolean {
  return project.reportApproval?.status === "approved";
}

function locked(reason: string): PhaseAccess {
  return { unlocked: false, lockReason: reason };
}

/** Compute per-phase unlock state — strict sequential: finish phase N before N+1 opens. */
export function getAssessmentAccess(project: AssessmentProject | null | undefined): AssessmentAccess {
  if (!project) {
    const noProject = locked("Select or start an assessment from the dashboard.");
    return {
      hasActiveProject: false,
      clientName: "",
      phases: {
        1: noProject,
        2: noProject,
        3: noProject,
        4: noProject,
        5: noProject,
        data: noProject,
      },
      suggestedRoute: "/sustainability",
    };
  }

  const clientName = project.governanceAssessment.clientName?.trim() || "Unnamed assessment";
  const p1 = isPhase1Complete(project);
  const p2 = isPhase2Complete(project);
  const p3 = isPhase3Complete(project);
  const p4 = isPhase4Complete(project);
  const p5 = isPhase5Complete(project);

  const phases: Record<AssessmentPhaseKey, PhaseAccess> = {
    1: { unlocked: true },
    2: p1
      ? { unlocked: true }
      : locked("Complete Governance Assessment (Phase 1) — all 18 questions and engagement context — before continuing."),
    3: p1 && p2
      ? { unlocked: true }
      : locked(
          !p1
            ? "Complete Phase 1 (Governance Assessment) first."
            : "Complete Value Chain Assessment (Phase 2) — questionnaire and activity mapping — before continuing.",
        ),
    4: p1 && p2 && p3
      ? { unlocked: true }
      : locked(
          !p1
            ? "Complete Phase 1 first."
            : !p2
              ? "Complete Phases 1 and 2 first."
              : "Complete SRRO/CRRO Register (Phase 3) — confirm the Final List — before continuing.",
        ),
    5: p1 && p2 && p3 && p4
      ? { unlocked: true }
      : locked(
          !p3
            ? "Complete Phases 1–3 first."
            : "Complete Material Information (Phase 4) — map metrics for all final-list items — before continuing.",
        ),
    data: p1 && p2 && p3 && p4 && p5
      ? { unlocked: true }
      : locked(
          !p4
            ? "Complete Phases 1–4 first."
            : "Complete Materiality Scoring (Phase 5) and obtain client report approval before data collection.",
        ),
  };

  const suggestedRoute = !p1
    ? PHASE_ROUTES[1]
    : !p2
      ? PHASE_ROUTES[2]
      : !p3
        ? PHASE_ROUTES[3]
        : !p4
          ? PHASE_ROUTES[4]
          : PHASE_ROUTES[5];

  return { hasActiveProject: true, clientName, phases, suggestedRoute };
}

export function routeToPhase(path: string): AssessmentPhaseKey | null {
  const entry = Object.entries(PHASE_ROUTES).find(([, route]) => route === path);
  return entry ? (entry[0] as AssessmentPhaseKey) : null;
}

export function canAccessRoute(project: AssessmentProject | null | undefined, path: string): boolean {
  if (path === "/sustainability") return true;
  const phase = routeToPhase(path);
  if (!phase) return true;
  return getAssessmentAccess(project).phases[phase].unlocked;
}

/** True when phases 2–5 have data but Phase 1 is not complete (orphan / cross-assessment bleed). */
export function hasOrphanDownstreamData(project: AssessmentProject): boolean {
  if (isPhase1Complete(project)) return false;
  const vc = project.valueChain;
  const hasVc =
    Object.values(vc.questionnaireResponses ?? {}).some((v) => !!String(v ?? "").trim())
    || (vc.activities?.length ?? 0) > 0
    || (vc.resources?.length ?? 0) > 0;
  return (
    hasVc
    || project.srroItems.length > 0
    || project.phase4Entries.length > 0
    || project.phase5Items.length > 0
  );
}

/** Remove phases 2–5 when governance is not complete — data must not exist without Phase 1. */
export function stripOrphanDownstreamData(project: AssessmentProject): AssessmentProject {
  if (isPhase1Complete(project)) return project;
  return {
    ...project,
    valueChain: emptyValueChain(),
    srroItems: [] as SRROItem[],
    phase4Entries: [] as Phase4Entry[],
    phase5Items: [] as Phase5Item[],
  };
}
