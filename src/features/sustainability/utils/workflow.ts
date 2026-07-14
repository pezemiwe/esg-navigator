import type {
  GovernanceAssessmentData,
  MaterialityApproval,
  Phase4Entry,
  Phase5Item,
  PhaseApproval,
  SRROItem,
  ValueChainData,
} from "@/store/sustainabilityStore";

export const GOVERNANCE_QUESTION_COUNT = 18;

export const WORKFLOW_STEP_ROUTES = {
  dashboard: "/sustainability",
  governance: "/sustainability/governance-assessment",
  valueChain: "/sustainability/value-chain",
  srro: "/sustainability/srro-register",
  materialInformation: "/sustainability/material-information",
  materialityScoring: "/sustainability/materiality-scoring",
  dataCollection: "/sustainability/materiality",
  report: "/sustainability/report",
} as const;

export type WorkflowStepStatus = "complete" | "active" | "pending" | "locked";

export interface WorkflowAssessmentState {
  governanceAssessment: GovernanceAssessmentData;
  valueChain: ValueChainData;
  srroItems: SRROItem[];
  phase4Entries: Phase4Entry[];
  phase5Items: Phase5Item[];
  srroApproval: PhaseApproval;
  materialityApproval: MaterialityApproval;
  reportApproval: PhaseApproval;
}

export interface WorkflowStep {
  id: number;
  key: "governance" | "valueChain" | "srro" | "materialInformation" | "materialityScoring";
  route: string;
  label: string;
  status: WorkflowStepStatus;
  unlocked: boolean;
  complete: boolean;
  detail: string;
}

function getFinalList(state: WorkflowAssessmentState) {
  return state.srroItems.filter((item) => item.includeInFinalList === "Yes");
}

function isPhase4EntryComplete(entry?: Phase4Entry) {
  return (entry?.sources?.length ?? 0) > 0 && (entry?.selectedMetrics?.length ?? 0) > 0;
}

function hasAnyPhase5Score(item: Phase5Item) {
  return (item.metricScores ?? []).some(
    (score) => score.likelihood > 0 || score.magnitude > 0,
  );
}

function toStatus(unlocked: boolean, complete: boolean, started: boolean): WorkflowStepStatus {
  if (!unlocked) return "locked";
  if (complete) return "complete";
  if (started) return "active";
  return "pending";
}

export function getWorkflowSteps(state: WorkflowAssessmentState): WorkflowStep[] {
  const answeredCount = Object.values(state.governanceAssessment.questions ?? {}).filter(
    (question) => !!question?.score,
  ).length;
  const phase1Started =
    answeredCount > 0 || state.governanceAssessment.clientName.trim() !== "";
  const phase1Complete = answeredCount === GOVERNANCE_QUESTION_COUNT;

  const phase2Started =
    state.valueChain.businessModelDescription.trim() !== "" ||
    state.valueChain.keyProductsServices.trim() !== "" ||
    state.valueChain.keyMarketsRegions.trim() !== "" ||
    state.valueChain.activities.length > 0 ||
    state.valueChain.resources.length > 0;
  const phase2Complete =
    state.valueChain.activities.length > 0 && state.valueChain.resources.length > 0;

  const finalList = getFinalList(state);
  const phase3Started = state.srroItems.length > 0;
  const phase3Complete = state.srroApproval.status === "approved";

  const completedPhase4Entries = finalList.filter((item) =>
    isPhase4EntryComplete(state.phase4Entries.find((entry) => entry.ref === item.ref)),
  ).length;
  const phase4Started = state.phase4Entries.length > 0;
  const phase4Complete =
    finalList.length > 0 && completedPhase4Entries === finalList.length;

  const scoredPhase5Items = state.phase5Items.filter(hasAnyPhase5Score).length;
  const phase5Started =
    state.phase5Items.length > 0 || state.reportApproval.status !== "none";
  const phase5Complete = state.reportApproval.status === "approved";

  return [
    {
      id: 1,
      key: "governance",
      route: WORKFLOW_STEP_ROUTES.governance,
      label: "Governance Assessment",
      status: toStatus(true, phase1Complete, phase1Started),
      unlocked: true,
      complete: phase1Complete,
      detail: phase1Complete
        ? `All ${GOVERNANCE_QUESTION_COUNT} questions answered`
        : answeredCount > 0
          ? `${answeredCount}/${GOVERNANCE_QUESTION_COUNT} questions answered`
          : "Not started",
    },
    {
      id: 2,
      key: "valueChain",
      route: WORKFLOW_STEP_ROUTES.valueChain,
      label: "Value Chain Assessment",
      status: toStatus(phase1Complete, phase2Complete, phase2Started),
      unlocked: phase1Complete,
      complete: phase2Complete,
      detail: phase2Complete
        ? `${state.valueChain.activities.length} activities and ${state.valueChain.resources.length} resources mapped`
        : phase2Started
          ? "In progress"
          : "Locked until Phase 1 is complete",
    },
    {
      id: 3,
      key: "srro",
      route: WORKFLOW_STEP_ROUTES.srro,
      label: "SRRO / CRRO Register",
      status: toStatus(phase2Complete, phase3Complete, phase3Started),
      unlocked: phase2Complete,
      complete: phase3Complete,
      detail: !phase2Complete
        ? "Locked until Phase 2 is complete"
        : state.srroApproval.status === "submitted"
          ? "Awaiting review"
          : state.srroApproval.status === "rejected"
            ? "Review response received"
            : phase3Complete
              ? `${finalList.length} final-list items approved`
              : phase3Started
                ? `${state.srroItems.length} items identified`
                : "Not started",
    },
    {
      id: 4,
      key: "materialInformation",
      route: WORKFLOW_STEP_ROUTES.materialInformation,
      label: "Material Information",
      status: toStatus(phase3Complete, phase4Complete, phase4Started),
      unlocked: phase3Complete,
      complete: phase4Complete,
      detail: !phase3Complete
        ? "Locked until Phase 3 is approved"
        : phase4Complete
          ? `${completedPhase4Entries}/${finalList.length} final-list items configured`
          : phase4Started
            ? `${completedPhase4Entries}/${finalList.length} items configured`
            : "Not started",
    },
    {
      id: 5,
      key: "materialityScoring",
      route: WORKFLOW_STEP_ROUTES.materialityScoring,
      label: "Materiality Scoring",
      status: toStatus(phase4Complete, phase5Complete, phase5Started),
      unlocked: phase4Complete,
      complete: phase5Complete,
      detail: !phase4Complete
        ? "Locked until Phase 4 is complete"
        : state.reportApproval.status === "submitted"
          ? "Awaiting review"
          : state.reportApproval.status === "rejected"
            ? "Review response received"
            : phase5Complete
              ? "Assessment approved"
              : scoredPhase5Items > 0
                ? `${scoredPhase5Items} items scored`
                : "Not started",
    },
  ];
}

export function getWorkflowCompletion(steps: WorkflowStep[]): number {
  const completeCount = steps.filter((step) => step.complete).length;
  return Math.round((completeCount / steps.length) * 100);
}

export function getNextWorkflowRoute(state: WorkflowAssessmentState): string {
  const steps = getWorkflowSteps(state);
  const nextStep = steps.find((step) => step.unlocked && !step.complete);
  return nextStep?.route ?? WORKFLOW_STEP_ROUTES.materialityScoring;
}

export function getUnlockedWorkflowRoutes(state: WorkflowAssessmentState): string[] {
  const steps = getWorkflowSteps(state);
  const unlocked = steps.filter((step) => step.unlocked).map((step) => step.route);
  const phase5 = steps.find((step) => step.key === "materialityScoring");
  if (phase5?.complete) {
    unlocked.push(WORKFLOW_STEP_ROUTES.dataCollection, WORKFLOW_STEP_ROUTES.report);
  }
  return unlocked;
}

export function getWorkflowStateForProject(state: WorkflowAssessmentState) {
  const steps = getWorkflowSteps(state);
  return {
    steps,
    completion: getWorkflowCompletion(steps),
    nextRoute: getNextWorkflowRoute(state),
    unlockedRoutes: getUnlockedWorkflowRoutes(state),
  };
}