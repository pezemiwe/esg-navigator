import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AssessmentConfig,
  MappedAsset,
  ScreeningEntry,
  EnrichedResult,
  HazardResult,
} from "@/features/cra/domain/physicalRisk/types";

interface PhysicalRiskState {
  /* wizard */
  activeStep: number;

  /* step 0 */
  config: AssessmentConfig;

  /* step 1 */
  mappedAssets: MappedAsset[];
  geocodeProgress: number;

  /* step 2 */
  identifiedRisks: string[];

  /* step 3 */
  screening: ScreeningEntry[];

  /* step 4 */
  hazardResults: HazardResult[];

  /* step 5-8 (enriched) */
  results: EnrichedResult[];

  /* process state */
  isRunning: boolean;
  progress: number;
  error: string | null;

  /* actions */
  setActiveStep: (step: number) => void;
  setConfig: (config: Partial<AssessmentConfig>) => void;
  setMappedAssets: (assets: MappedAsset[]) => void;
  setGeocodeProgress: (p: number) => void;
  setIdentifiedRisks: (risks: string[]) => void;
  setScreening: (screening: ScreeningEntry[]) => void;
  setHazardResults: (hr: HazardResult[]) => void;
  setResults: (results: EnrichedResult[]) => void;
  setIsRunning: (running: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const defaultConfig: AssessmentConfig = {
  companyName: "",
  country: "Nigeria",
  reportDate: new Date().toISOString().slice(0, 10),
  assessorName: "",
  sectorId: "1",
  subsector: "",
  matrixSize: 6,
  currency: "NGN",
  usdRate: 1500,
};

export const usePhysicalRiskStore = create<PhysicalRiskState>()(
  persist(
    (set) => ({
      activeStep: 0,
      config: { ...defaultConfig },
      mappedAssets: [],
      geocodeProgress: 0,
      identifiedRisks: [],
      screening: [],
      hazardResults: [],
      results: [],
      isRunning: false,
      progress: 0,
      error: null,
      setActiveStep: (step) => set({ activeStep: step }),
      setConfig: (partial) =>
        set((state) => ({ config: { ...state.config, ...partial } })),
      setMappedAssets: (assets) => set({ mappedAssets: assets }),
      setGeocodeProgress: (p) => set({ geocodeProgress: p }),
      setIdentifiedRisks: (risks) => set({ identifiedRisks: risks }),
      setScreening: (screening) => set({ screening }),
      setHazardResults: (hr) => set({ hazardResults: hr }),
      setResults: (results) => set({ results }),
      setIsRunning: (running) => set({ isRunning: running }),
      setProgress: (progress) => set({ progress }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          activeStep: 0,
          config: { ...defaultConfig },
          mappedAssets: [],
          geocodeProgress: 0,
          identifiedRisks: [],
          screening: [],
          hazardResults: [],
          results: [],
          isRunning: false,
          progress: 0,
          error: null,
        }),
    }),
    {
      name: "physical-risk-store",
      version: 2,
      partialize: (state) => ({
        config: state.config,
        results: state.results,
        activeStep: state.activeStep,
        identifiedRisks: state.identifiedRisks,
      }),
    },
  ),
);
