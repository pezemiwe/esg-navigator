import { useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useActiveAssessmentAccess } from "../hooks/useActiveAssessmentAccess";
import { routeToPhase } from "../utils/assessmentProgress";
import AssessmentProjectGate from "./AssessmentProjectGate";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";

const PHASE_LABELS: Record<string, string> = {
  "1": "Phase 1",
  "2": "Phase 2",
  "3": "Phase 3",
  "4": "Phase 4",
  "5": "Phase 5",
  data: "Data Management",
};

type Props = {
  children: ReactNode;
};

/** Blocks page content when the active assessment has not unlocked this route. */
export default function AssessmentPhaseGate({ children }: Props) {
  const location = useLocation();
  const access = useActiveAssessmentAccess();
  const phaseKey = routeToPhase(location.pathname);
  const { user } = useAuthStore();
  const isClient = user?.role === UserRole.CLIENT;

  if (!phaseKey) return <>{children}</>;

  const phaseAccess = access.phases[phaseKey];
  if (phaseAccess.unlocked) return <>{children}</>;

  if (isClient) {
    return <AssessmentProjectGate phase="" title="This section is locked" minimal />;
  }

  return (
    <AssessmentProjectGate
      phase={PHASE_LABELS[String(phaseKey)] ?? "Phase"}
      title="This phase is locked for the selected assessment"
      clientName={access.clientName !== "Unnamed assessment" ? access.clientName : undefined}
      message={phaseAccess.lockReason}
      requiresGovernance={phaseKey !== 1 && !access.phases[1].unlocked}
    />
  );
}
