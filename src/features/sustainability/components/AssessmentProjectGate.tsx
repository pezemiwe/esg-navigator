import { FolderOpen, ArrowRight, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Props = {
  phase: string;
  title: string;
  clientName?: string;
  message?: string;
  /** When true, CTA goes to Phase 1 for this assessment. */
  requiresGovernance?: boolean;
};

export default function AssessmentProjectGate({
  phase,
  title,
  clientName,
  message,
  requiresGovernance,
}: Props) {
  const navigate = useNavigate();

  const body = message
    ?? (requiresGovernance
      ? "Complete the Governance Assessment (Phase 1) for this client before continuing. Each assessment unlocks phases independently."
      : "Select or continue an assessment from the dashboard. Phases stay locked until that assessment reaches the prior step.");

  return (
    <div className="min-h-full bg-[#f4f4f4] flex items-center justify-center p-8">
      <div className="bg-white border border-[#e0e0e0] max-w-lg w-full p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-[#f4f4f4] border border-[#e0e0e0] flex items-center justify-center mx-auto mb-4">
          <Lock className="w-5 h-5 text-[#8d8d8d]" />
        </div>
        <p className="text-[10px] font-bold text-[#86bc25] uppercase tracking-widest mb-2">{phase}</p>
        <h2 className="text-[18px] font-semibold text-[#161616] mb-2">{title}</h2>
        {clientName && (
          <p className="text-[12px] font-semibold text-[#525252] mb-3">{clientName}</p>
        )}
        <p className="text-[13px] text-[#525252] leading-relaxed mb-6">{body}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate("/sustainability")}
            className="inline-flex items-center gap-2 bg-[#161616] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#525252] transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            All Assessments
          </button>
          {(requiresGovernance || clientName) && (
            <button
              onClick={() => navigate("/sustainability/governance-assessment")}
              className="inline-flex items-center gap-2 bg-[#86bc25] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors"
            >
              {requiresGovernance ? "Go to Governance" : "Open Phase 1"}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
