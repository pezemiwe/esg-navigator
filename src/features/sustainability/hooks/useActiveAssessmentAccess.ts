import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useSustainabilityStore, type AssessmentProject } from "@/store/sustainabilityStore";
import {
  getAssessmentAccess,
  canAccessRoute,
  type AssessmentAccess,
} from "../utils/assessmentProgress";

function mergeActiveProject(
  activeProjectId: string | null,
  assessmentProjects: AssessmentProject[],
  working: Pick<
    AssessmentProject,
    | "governanceAssessment"
    | "valueChain"
    | "srroItems"
    | "phase4Entries"
    | "phase5Items"
    | "reportApproval"
  >,
): AssessmentProject | null {
  if (!activeProjectId) return null;
  const saved = assessmentProjects.find((p) => p.id === activeProjectId);
  if (!saved) return null;
  return {
    ...saved,
    governanceAssessment: working.governanceAssessment,
    valueChain: working.valueChain,
    srroItems: working.srroItems,
    phase4Entries: working.phase4Entries,
    phase5Items: working.phase5Items,
    reportApproval: working.reportApproval,
  };
}

/** Phase access for the currently selected assessment (activeProjectId). */
export function useActiveAssessmentAccess(): AssessmentAccess & {
  activeProject: AssessmentProject | null;
  canAccessRoute: (path: string) => boolean;
} {
  const {
    activeProjectId,
    assessmentProjects,
    governanceAssessment,
    valueChain,
    srroItems,
    phase4Entries,
    phase5Items,
    reportApproval,
  } = useSustainabilityStore(
    useShallow((s) => ({
      activeProjectId: s.activeProjectId,
      assessmentProjects: s.assessmentProjects,
      governanceAssessment: s.governanceAssessment,
      valueChain: s.valueChain,
      srroItems: s.srroItems,
      phase4Entries: s.phase4Entries,
      phase5Items: s.phase5Items,
      reportApproval: s.reportApproval,
    })),
  );

  const activeProject = useMemo(
    () =>
      mergeActiveProject(activeProjectId, assessmentProjects, {
        governanceAssessment,
        valueChain,
        srroItems,
        phase4Entries,
        phase5Items,
        reportApproval,
      }),
    [
      activeProjectId,
      assessmentProjects,
      governanceAssessment,
      valueChain,
      srroItems,
      phase4Entries,
      phase5Items,
      reportApproval,
    ],
  );

  const access = useMemo(() => getAssessmentAccess(activeProject), [activeProject]);

  return {
    ...access,
    activeProject,
    canAccessRoute: (path: string) => canAccessRoute(activeProject, path),
  };
}
