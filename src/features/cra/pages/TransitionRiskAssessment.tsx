import { useMemo, type ComponentType } from "react";
import {
  Users,
  Settings,
  Play,
  BarChart3,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "lucide-react";
import CRALayout from "../layout/CRALayout";
import { useTransitionRiskStore } from "@/store/transitionRiskStore";

import TScreenOrgSetup from "../steps/transition/TScreenOrgSetup";
import TScreenScenarioConfig from "../steps/transition/TScreenScenarioConfig";
import TScreenRunAssessment from "../steps/transition/TScreenRunAssessment";
import TScreenResultsDashboard from "../steps/transition/TScreenResultsDashboard";
import TScreenResponseExport from "../steps/transition/TScreenResponseExport";

interface StepDef {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const STEPS: StepDef[] = [
  { label: "Organisation Profile", icon: Users },
  { label: "Scenario Config", icon: Settings },
  { label: "Run Assessment", icon: Play },
  { label: "Results Dashboard", icon: BarChart3 },
  { label: "Response & Export", icon: Download },
];

const STEP_COMPONENTS: ComponentType[] = [
  TScreenOrgSetup,
  TScreenScenarioConfig,
  TScreenRunAssessment,
  TScreenResultsDashboard,
  TScreenResponseExport,
];

export default function TransitionRiskAssessment() {
  const { activeStep, organisations, results, setActiveStep, reset } =
    useTransitionRiskStore();

  const canProceed = useMemo(() => {
    switch (activeStep) {
      case 0:
        return organisations.length > 0;
      case 1:
        return true;
      case 2:
        return results.length > 0;
      default:
        return true;
    }
  }, [activeStep, organisations, results]);

  const stepComplete = useMemo(
    () => [
      organisations.length > 0,
      true,
      results.length > 0,
      results.length > 0,
      results.length > 0,
    ],
    [organisations, results],
  );

  const isLastStep = activeStep === STEPS.length - 1;
  const ActiveStepComponent = STEP_COMPONENTS[activeStep] ?? STEP_COMPONENTS[0];

  return (
    <CRALayout>
      <div className="flex flex-col min-h-[calc(100vh-72px)] bg-[#F4F4F2] dark:bg-[#0D0D0D]">
        <div className="flex-1 w-full bg-[#F4F4F2] dark:bg-[#0F1F13] overflow-y-auto">
          <ActiveStepComponent />
        </div>
        {activeStep > 0 && (
          <div className="sticky bottom-0 z-10 bg-white dark:bg-[#111] border-t border-[#D8D8D8] dark:border-white/[0.07]">
            <div className="flex items-stretch">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep(activeStep - 1)}
                className="flex items-center gap-2 px-5 py-3 border-r border-[#D8D8D8] dark:border-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F4F4F2] dark:hover:bg-white/[0.03] transition-colors bg-transparent flex-shrink-0"
              >
                <ChevronLeft size={13} className="text-[#888]" />
                <div className="text-left hidden sm:block">
                  <div
                    className="text-[12px] uppercase tracking-[0.08em] text-[#888] dark:text-[#555]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Previous
                  </div>
                  <div className="text-[17px] font-semibold text-[#333] dark:text-[#CCC]">
                    {activeStep > 0 ? STEPS[activeStep - 1]?.label : ""}
                  </div>
                </div>
              </button>

              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-1.5">
                  {STEPS.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-[3px] transition-all duration-300 ${
                        idx === activeStep
                          ? "w-5 bg-[#86BC25]"
                          : (stepComplete[idx] ?? false)
                            ? "w-3 bg-[#86BC25]/50"
                            : "w-2 bg-[#E5E5E5] dark:bg-white/[0.07]"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                disabled={!canProceed}
                onClick={() => {
                  if (activeStep < STEPS.length - 1) setActiveStep(activeStep + 1);
                  else reset();
                }}
                className="flex items-center gap-2 px-5 py-3 border-l border-[#D8D8D8] dark:border-white/[0.07] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F4F4F2] dark:hover:bg-white/[0.03] transition-colors bg-transparent text-right flex-shrink-0"
              >
                <div className="text-right hidden sm:block">
                  <div
                    className="text-[12px] uppercase tracking-[0.08em] text-[#888] dark:text-[#555]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {activeStep < STEPS.length - 1 ? "Next" : "Restart"}
                  </div>
                  <div className="text-[17px] font-semibold text-[#333] dark:text-[#CCC]">
                    {activeStep < STEPS.length - 1
                      ? (STEPS[activeStep + 1]?.label ?? "")
                      : "New assessment"}
                  </div>
                </div>
                {activeStep < STEPS.length - 1 ? (
                  <ChevronRight size={13} className="text-[#888]" />
                ) : (
                  <RotateCcw size={12} className="text-[#888]" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </CRALayout>
  );
}
