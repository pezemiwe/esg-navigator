import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  OrgProfile,
  TransitionResult,
  TransitionConfig,
  Scenario,
  Horizon,
} from "@/features/cra/domain/transitionRisk/types";

interface TransitionRiskState {
  activeStep: number;
  config: TransitionConfig;
  organisations: OrgProfile[];
  selectedScenario: Scenario;
  selectedHorizon: Horizon;
  results: TransitionResult[];

  /* pipeline */
  isRunning: boolean;
  progress: number;
  pipelineStage: string;
  pipelineStages: {
    label: string;
    status: "pending" | "running" | "done" | "error";
  }[];
  error: string | null;

  /* actions */
  setActiveStep: (step: number) => void;
  setConfig: (partial: Partial<TransitionConfig>) => void;
  setOrganisations: (orgs: OrgProfile[]) => void;
  addOrganisation: (org: OrgProfile) => void;
  removeOrganisation: (id: string) => void;
  setSelectedScenario: (s: Scenario) => void;
  setSelectedHorizon: (h: Horizon) => void;
  setResults: (r: TransitionResult[]) => void;
  setIsRunning: (v: boolean) => void;
  setProgress: (v: number) => void;
  setPipelineStage: (s: string) => void;
  setPipelineStages: (
    stages: {
      label: string;
      status: "pending" | "running" | "done" | "error";
    }[],
  ) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const defaultConfig: TransitionConfig = {
  assessorName: "",
  reportDate: new Date().toISOString().slice(0, 10),
  usdRate: 1500,
  baseYear: 2025,
};

export const useTransitionRiskStore = create<TransitionRiskState>()(
  persist(
    (set) => ({
      activeStep: 0,
      config: { ...defaultConfig },
      organisations: [],
      selectedScenario: "Orderly" as Scenario,
      selectedHorizon: "Medium" as Horizon,
      results: [],
      isRunning: false,
      progress: 0,
      pipelineStage: "",
      pipelineStages: [],
      error: null,

      setActiveStep: (step) => set({ activeStep: step }),
      setConfig: (partial) =>
        set((s) => ({ config: { ...s.config, ...partial } })),
      setOrganisations: (orgs) => set({ organisations: orgs }),
      addOrganisation: (org) =>
        set((s) => ({ organisations: [...s.organisations, org] })),
      removeOrganisation: (id) =>
        set((s) => ({
          organisations: s.organisations.filter((o) => o.id !== id),
        })),
      setSelectedScenario: (sc) => set({ selectedScenario: sc }),
      setSelectedHorizon: (h) => set({ selectedHorizon: h }),
      setResults: (r) => set({ results: r }),
      setIsRunning: (v) => set({ isRunning: v }),
      setProgress: (v) => set({ progress: v }),
      setPipelineStage: (s) => set({ pipelineStage: s }),
      setPipelineStages: (stages) => set({ pipelineStages: stages }),
      setError: (e) => set({ error: e }),
      reset: () =>
        set({
          activeStep: 0,
          config: { ...defaultConfig },
          organisations: [],
          selectedScenario: "Orderly" as Scenario,
          selectedHorizon: "Medium" as Horizon,
          results: [],
          isRunning: false,
          progress: 0,
          pipelineStage: "",
          pipelineStages: [],
          error: null,
        }),
    }),
    {
      name: "transition-risk-store",
      version: 1,
      partialize: (state) => ({
        activeStep: state.activeStep,
        config: state.config,
        organisations: state.organisations,
        selectedScenario: state.selectedScenario,
        selectedHorizon: state.selectedHorizon,
        results: state.results,
      }),
    },
  ),
);
