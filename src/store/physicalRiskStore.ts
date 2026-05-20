import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getRegion, useRegionStore } from "@/store/regionStore";
import type {
  AssessmentConfig,
  MappedAsset,
  ScreeningEntry,
  EnrichedResult,
  HazardResult,
  ResilienceMode,
  AssetResilience,
} from "@/features/cra/domain/physicalRisk/types";

export type AssessmentMode = "single" | "portfolio" | null;

export interface GeoConfidence {
  lat: number;
  lon: number;
  elevation: number;
  isCoastal: boolean;
  isUrban: boolean;
  level: "Exact Address" | "Street Level" | "City Level";
  displayName: string;
}

interface PhysicalRiskState {
  /* mode */
  mode: AssessmentMode;

  /* wizard */
  activeStep: number;

  /* step 0 — config */
  config: AssessmentConfig;

  /* single-asset geocode confirmation */
  geoConfidence: GeoConfidence | null;

  /* step 1 — assets */
  mappedAssets: MappedAsset[];
  geocodeProgress: number;

  /* step 2 — identified risks */
  identifiedRisks: string[];

  /* step 3 — screening */
  screening: ScreeningEntry[];

  /* resilience measures */
  resilienceMode: ResilienceMode;
  assetResilience: AssetResilience[];

  /* step 4 — hazard */
  hazardResults: HazardResult[];

  /* step 5-8 (enriched) */
  results: EnrichedResult[];

  /* pipeline progress tracking */
  pipelineStage: string;
  pipelineStages: {
    label: string;
    status: "pending" | "running" | "done" | "error";
  }[];

  /* process state */
  isRunning: boolean;
  progress: number;
  error: string | null;

  /* actions */
  setMode: (mode: AssessmentMode) => void;
  setActiveStep: (step: number) => void;
  setConfig: (config: Partial<AssessmentConfig>) => void;
  setGeoConfidence: (gc: GeoConfidence | null) => void;
  setMappedAssets: (assets: MappedAsset[]) => void;
  setGeocodeProgress: (p: number) => void;
  setIdentifiedRisks: (risks: string[]) => void;
  setScreening: (screening: ScreeningEntry[]) => void;
  setResilienceMode: (mode: ResilienceMode) => void;
  setAssetResilience: (resilience: AssetResilience[]) => void;
  setHazardResults: (hr: HazardResult[]) => void;
  setResults: (results: EnrichedResult[]) => void;
  setPipelineStage: (stage: string) => void;
  setPipelineStages: (
    stages: {
      label: string;
      status: "pending" | "running" | "done" | "error";
    }[],
  ) => void;
  setIsRunning: (running: boolean) => void;
  setProgress: (progress: number) => void;
  setError: (error: string | null) => void;
  reset: () => void;
  clearData: () => void;
}

function makeDefaultConfig(): AssessmentConfig {
  return {
    companyName: getRegion().code === "GH" ? "GCB Bank PLC" : "Wema Bank PLC",
    country: getRegion().country,
    reportDate: new Date().toISOString().slice(0, 10),
    assessorName: "",
    sectorId: "",
    subsector: "",
    matrixSize: 6,
    currency: getRegion().currencyCode,
    usdRate: getRegion().code === "GH" ? 14.5 : 1550,
  };
}

export const usePhysicalRiskStore = create<PhysicalRiskState>()(
  persist(
    (set) => ({
      mode: null as AssessmentMode,
      activeStep: 0,
      config: makeDefaultConfig(),
      geoConfidence: null as GeoConfidence | null,
      mappedAssets: [],
      geocodeProgress: 0,
      identifiedRisks: [],
      screening: [],
      resilienceMode: "SBRA" as ResilienceMode,
      assetResilience: [],
      hazardResults: [],
      results: [],
      pipelineStage: "",
      pipelineStages: [],
      isRunning: false,
      progress: 0,
      error: null,
      setMode: (mode) => set({ mode }),
      setActiveStep: (step) => set({ activeStep: step }),
      setConfig: (partial) =>
        set((state) => ({ config: { ...state.config, ...partial } })),
      setGeoConfidence: (gc) => set({ geoConfidence: gc }),
      setMappedAssets: (assets) => set({ mappedAssets: assets }),
      setGeocodeProgress: (p) => set({ geocodeProgress: p }),
      setIdentifiedRisks: (risks) => set({ identifiedRisks: risks }),
      setScreening: (screening) => set({ screening }),
      setResilienceMode: (mode) => set({ resilienceMode: mode }),
      setAssetResilience: (resilience) => set({ assetResilience: resilience }),
      setHazardResults: (hr) => set({ hazardResults: hr }),
      setResults: (results) => set({ results }),
      setPipelineStage: (stage) => set({ pipelineStage: stage }),
      setPipelineStages: (stages) => set({ pipelineStages: stages }),
      setIsRunning: (running) => set({ isRunning: running }),
      setProgress: (progress) => set({ progress }),
      setError: (error) => set({ error }),
      reset: () =>
        set({
          mode: null as AssessmentMode,
          activeStep: 0,
          config: makeDefaultConfig(),
          geoConfidence: null as GeoConfidence | null,
          mappedAssets: [],
          geocodeProgress: 0,
          identifiedRisks: [],
          screening: [],
          resilienceMode: "SBRA" as ResilienceMode,
          assetResilience: [],
          hazardResults: [],
          results: [],
          pipelineStage: "",
          pipelineStages: [],
          isRunning: false,
          progress: 0,
          error: null,
        }),
      clearData: () =>
        set({
          config: makeDefaultConfig(),
          geoConfidence: null as GeoConfidence | null,
          mappedAssets: [],
          geocodeProgress: 0,
          identifiedRisks: [],
          screening: [],
          resilienceMode: "SBRA" as ResilienceMode,
          assetResilience: [],
          hazardResults: [],
          results: [],
          pipelineStage: "",
          pipelineStages: [],
          isRunning: false,
          progress: 0,
          error: null,
        }),
    }),
    {
      name: "physical-risk-store",
      version: 7,
      partialize: (state) => ({
        mode: state.mode,
        config: state.config,
        geoConfidence: state.geoConfidence,
        mappedAssets: state.mappedAssets,
        screening: state.screening,
        results: state.results,
        activeStep: state.activeStep,
        identifiedRisks: state.identifiedRisks,
        resilienceMode: state.resilienceMode,
        assetResilience: state.assetResilience,
      }),
    },
  ),
);

// Re-sync country & currency in the active assessment config when the region changes
useRegionStore.subscribe((state, prev) => {
  if (state.code === prev.code) return;
  const store = usePhysicalRiskStore.getState();
  store.setConfig({
    country: state.profile.country,
    currency: state.profile.currencyCode,
    usdRate: state.code === "GH" ? 14.5 : 1550,
  });
});
