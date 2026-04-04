import { useMemo, useEffect, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Grid3x3,
  Shield,
  Play,
  BarChart3,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  RotateCcw,
  Crosshair,
  FileText,
  TrendingDown,
} from "lucide-react";
import CRALayout from "../layout/CRALayout";
import { useCRAStatusStore, usePRARiskStore } from "@/store/craStore";
import { usePhysicalRiskStore } from "@/store/physicalRiskStore";

import ScreenAssetRegister from "../steps/physical/ScreenAssetRegister";
import ScreenHazardScreening from "../steps/physical/ScreenHazardScreening";
import ScreenResilienceMeasures from "../steps/physical/ScreenResilienceMeasures";
import ScreenRunAssessment from "../steps/physical/ScreenRunAssessment";
import ScreenResultsDashboard from "../steps/physical/ScreenResultsDashboard";
import ScreenResponseExport from "../steps/physical/ScreenResponseExport";
import ScreenReportExport from "../steps/physical/ScreenReportExport";

import ModeSelector from "../steps/physical/ModeSelector";
import SingleAssetForm from "../steps/physical/SingleAssetForm";
import SingleGeoConfirm from "../steps/physical/SingleGeoConfirm";
import SingleHazardSelect from "../steps/physical/SingleHazardSelect";
import SingleResilience from "../steps/physical/SingleResilience";
import SingleRun from "../steps/physical/SingleRun";
import SingleResults from "../steps/physical/SingleResults";
import SingleExport from "../steps/physical/SingleExport";

interface StepDef {
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const SINGLE_STEPS: StepDef[] = [
  { label: "Asset Details", icon: FileText },
  { label: "Location", icon: Crosshair },
  { label: "Hazards", icon: Grid3x3 },
  { label: "Resilience", icon: Shield },
  { label: "Run", icon: Play },
  { label: "Results", icon: BarChart3 },
  { label: "Export", icon: Download },
];

const SINGLE_COMPONENTS: ComponentType[] = [
  SingleAssetForm,
  SingleGeoConfirm,
  SingleHazardSelect,
  SingleResilience,
  SingleRun,
  SingleResults,
  SingleExport,
];

const PORTFOLIO_STEPS: StepDef[] = [
  { label: "Asset Register", icon: Upload },
  { label: "Hazard Screening", icon: Grid3x3 },
  { label: "Resilience", icon: Shield },
  { label: "Run", icon: Play },
  { label: "Results", icon: BarChart3 },
  { label: "Result & Response", icon: FileText },
  { label: "Export", icon: Download },
];

const PORTFOLIO_COMPONENTS: ComponentType[] = [
  ScreenAssetRegister,
  ScreenHazardScreening,
  ScreenResilienceMeasures,
  ScreenRunAssessment,
  ScreenResultsDashboard,
  ScreenResponseExport,
  ScreenReportExport,
];

export default function PhysicalRiskAssessment() {
  const navigate = useNavigate();
  const { setPRAReady } = useCRAStatusStore();
  const { setRiskResults } = usePRARiskStore();
  const {
    mode,

    activeStep,
    mappedAssets,
    screening,
    results,
    geoConfidence,
    setActiveStep,
  } = usePhysicalRiskStore();

  useEffect(() => {
    if (results.length > 0) {
      setPRAReady(true);
      setRiskResults({ physical: results.length });
    }
  }, [results.length, setPRAReady, setRiskResults]);

  const STEPS = mode === "single" ? SINGLE_STEPS : PORTFOLIO_STEPS;
  const STEP_COMPONENTS =
    mode === "single" ? SINGLE_COMPONENTS : PORTFOLIO_COMPONENTS;

  const canProceed = useMemo(() => {
    if (mode === "single") {
      switch (activeStep) {
        case 0:
          return mappedAssets.length > 0;
        case 1:
          return geoConfidence !== null;
        case 2:
          return screening.some((s) => s.risks.length > 0);
        case 3:
          return true;
        case 4:
          return results.length > 0;
        default:
          return true;
      }
    }
    switch (activeStep) {
      case 0:
        return mappedAssets.length > 0;
      case 1:
        return screening.some((s) => s.risks.length > 0);
      case 2:
        return true;
      case 3:
        return results.length > 0;
      default:
        return true;
    }
  }, [mode, activeStep, mappedAssets, screening, results, geoConfidence]);

  const stepComplete = useMemo(() => {
    if (mode === "single") {
      return [
        mappedAssets.length > 0,
        geoConfidence !== null,
        screening.some((s) => s.risks.length > 0),
        true,
        results.length > 0,
        results.length > 0,
        results.length > 0,
      ];
    }
    return [
      mappedAssets.length > 0,
      screening.some((s) => s.risks.length > 0),
      true,
      results.length > 0,
      results.length > 0,
      results.length > 0,
      results.length > 0,
    ];
  }, [mode, mappedAssets, screening, results, geoConfidence]);

  if (mode === null) {
    return (
      <CRALayout>
        <ModeSelector />
      </CRALayout>
    );
  }

  const isLastStep = activeStep === STEPS.length - 1;
  const ActiveStepComponent = STEP_COMPONENTS[activeStep] ?? STEP_COMPONENTS[0];

  return (
    <CRALayout>
      <div className="flex flex-col min-h-[calc(100vh-72px)] bg-[#F4F4F2] dark:bg-[#0D0D0D]">
        <div className="flex-1 w-full bg-[#f4f4f2] dark:bg-[#0f1f13] overflow-y-auto">
          <ActiveStepComponent />
        </div>

        {/* Transition Risk CTA */}
        {isLastStep && results.length > 0 && (
          <div className="bg-white dark:bg-[#111] border-t-2 border-[#86BC25] px-6 md:px-10 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.1em] text-[#86BC25] mb-1"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Assessment complete
                </p>
                <h3 className="text-[18px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight">
                  Continue to Transition Risk Assessment
                </h3>
                <p className="text-[13px] text-[#888] dark:text-[#666] mt-0.5">
                  Analyse exposure to policy, technology, market and
                  reputational transition risks.
                </p>
              </div>
              <button
                onClick={() => navigate("/cra/transition-risk")}
                className="flex items-center gap-2 px-6 py-3 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] transition-colors shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <TrendingDown size={14} />
                Transition Risk
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* Footer nav */}

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
                  if (activeStep < STEPS.length - 1)
                    setActiveStep(activeStep + 1);
                  else usePhysicalRiskStore.getState().reset();
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
                  <RotateCcw size={12} className="text-[#88]" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </CRALayout>
  );
}
