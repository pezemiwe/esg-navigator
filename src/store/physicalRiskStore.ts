import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AssessmentConfig,
  MappedAsset,
  ScreeningEntry,
  EnrichedResult,
} from "@/features/cra/domain/physicalRisk/types";

interface PhysicalRiskState {
  activeStep: number;
  config: AssessmentConfig;
  mappedAssets: MappedAsset[];
  screening: ScreeningEntry[];
  results: EnrichedResult[];
  isRunning: boolean;
  progress: number;
  error: string | null;
  setActiveStep: (step: number) => void;
  setConfig: (config: Partial<AssessmentConfig>) => void;
  setMappedAssets: (assets: MappedAsset[]) => void;
  setScreening: (screening: ScreeningEntry[]) => void;
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
      screening: [],
      results: [],
      isRunning: false,
      progress: 0,
      error: null,
      setActiveStep: (step) => set({ activeStep: step }),
      setConfig: (partial) =>
        set((state) => ({ config: { ...state.config, ...partial } })),
      setMappedAssets: (assets) => set({ mappedAssets: assets }),
      setScreening: (screening) => set({ screening }),
      setResults: (results) => set({ results }),
      setIsRunning: (running) => set({ isRunning: running }),
      setProgress: (progress) => set({ progress }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          activeStep: 0,
          config: { ...defaultConfig },
          mappedAssets: [],
          screening: [],
          results: [],
          isRunning: false,
          progress: 0,
          error: null,
        }),
    }),
    {
      name: "physical-risk-store",
      version: 1,
      partialize: (state) => ({
        config: state.config,
        results: state.results,
        activeStep: state.activeStep,
      }),
    },
  ),
);
