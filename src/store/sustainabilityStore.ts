import { create } from "zustand";
import { persist } from "zustand/middleware";
// import { MOCK_RISKS } from "../features/sustainability/data/mockRisks";

export interface EntityProfile {
  name: string;
  description: string;
  hqCountries: string[];
  hqStates: string[];
  branches: number;
  employees: number;
  loanBook: number;
  coreServices: string[];
  upstreamActivities: string[];
  midstreamActivities: string[];
  downstreamActivities: string[];
  sectorExposures: { sector: string; percentage: number }[];
  geographicExposure: string[];
  completed: boolean;
  sasbSector?: string;
  sasbIndustry?: string;
}

export interface SustainabilityRisk {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  impact: number;
  likelihood: number;
  financialEffect: string;
  timeHorizon: string;
  source:
    | "sasb"
    | "issb"
    | "internal"
    | "external"
    | "erm"
    | "regulator"
    | "workshop";
}

export interface StakeholderSurvey {
  id: string;
  respondent: string;
  type: "internal" | "external";
  department?: string;
  risks: string[];
  financialImpact: string;
  disruptionLevel: string;
  timeHorizon: string;
  submittedAt: string;
}

export interface DataTemplate {
  id: string;
  topicId: string;
  topicName: string;
  assignedTo: string;
  department: string;
  frequency: "monthly" | "quarterly" | "annually";
  fields: {
    metric: string;
    fy2023: string;
    fy2024: string;
    fy2025: string;
    notes: string;
  }[];
  status: "pending" | "in-progress" | "submitted" | "approved";
  submittedAt?: string;
}

export interface Scope1Asset {
  id: string;
  name: string;
  branch: string;
  type: "mobile" | "stationary";
  fuelType: "diesel" | "petrol" | "lpg" | "cng";
  litersPerMonth: number;
  months: number;
}

export interface Scope2Entry {
  id: string;
  branch: string;
  kwhPerMonth: number;
  months: number;
  source: "grid" | "private";
  emissionFactor?: number;
}

export interface Scope3Entry {
  id: string;
  sector: string;
  loanExposure: number;
  intensityFactor: number;
}

export interface ScenarioResult {
  id: string;
  name: string;
  description: string;
  totalEmissions: number;
  estimatedCost: number;
  profitImpact: number;
  nplIncrease: number;
  capitalAdequacyEffect: number;
  runAt: string;
}

interface SustainabilityState {
  entityProfile: EntityProfile;
  risks: SustainabilityRisk[];
  selectedMaterialTopicIds: string[];
  topSelectionCount: number;
  stakeholderSurveys: StakeholderSurvey[];
  templates: DataTemplate[];
  scope1Assets: Scope1Asset[];
  scope2Entries: Scope2Entry[];
  scope3Entries: Scope3Entry[];
  scenarioResults: ScenarioResult[];
  reportDraft: string;
  activeStep: number;

  setEntityProfile: (profile: Partial<EntityProfile>) => void;
  setRisks: (risks: SustainabilityRisk[]) => void;
  updateRisk: (id: string, updates: Partial<SustainabilityRisk>) => void;
  addRisk: (risk: SustainabilityRisk) => void;
  removeRisk: (id: string) => void;
  selectTopMaterialTopics: (count: number) => void;
  setSelectedTopicIds: (ids: string[]) => void;
  addStakeholderSurvey: (survey: StakeholderSurvey) => void;
  setTemplates: (templates: DataTemplate[]) => void;
  updateTemplate: (id: string, updates: Partial<DataTemplate>) => void;
  addScope1Asset: (asset: Scope1Asset) => void;
  removeScope1Asset: (id: string) => void;
  addScope2Entry: (entry: Scope2Entry) => void;
  removeScope2Entry: (id: string) => void;
  addScope3Entry: (entry: Scope3Entry) => void;
  removeScope3Entry: (id: string) => void;
  addScenarioResult: (result: ScenarioResult) => void;
  setReportDraft: (draft: string) => void;
  setActiveStep: (step: number) => void;
  reset: () => void;
}

export const useSustainabilityStore = create<SustainabilityState>()(
  persist(
    (set, get) => ({
      entityProfile: {
        name: "",
        description: "",
        hqCountries: [],
        hqStates: [],
        branches: 0,
        employees: 0,
        loanBook: 0,
        coreServices: [],
        upstreamActivities: [],
        midstreamActivities: [],
        downstreamActivities: [],
        sectorExposures: [],
        geographicExposure: [],
        completed: false,
      },

      risks: [],
      selectedMaterialTopicIds: [],
      topSelectionCount: 10,
      stakeholderSurveys: [],
      templates: [],
      scope1Assets: [],
      scope2Entries: [],
      scope3Entries: [],
      scenarioResults: [],
      reportDraft: "",
      activeStep: 0,

      reset: () =>
        set({
          entityProfile: {
            name: "",
            description: "",
            hqCountries: [],
            hqStates: [],
            branches: 0,
            employees: 0,
            loanBook: 0,
            coreServices: [],
            upstreamActivities: [],
            midstreamActivities: [],
            downstreamActivities: [],
            sectorExposures: [],
            geographicExposure: [],
            completed: false,
          },
          risks: [],
          selectedMaterialTopicIds: [],
          stakeholderSurveys: [],
          templates: [],
          scope1Assets: [],
          scope2Entries: [],
          scope3Entries: [],
          scenarioResults: [],
          reportDraft: "",
          activeStep: 0,
        }),

      setEntityProfile: (profile) =>
        set((state) => ({
          entityProfile: { ...state.entityProfile, ...profile },
        })),

      setRisks: (risks) => set({ risks }),

      updateRisk: (id, updates) =>
        set((state) => ({
          risks: state.risks.map((r) =>
            r.id === id ? { ...r, ...updates } : r,
          ),
        })),

      addRisk: (risk) => set((state) => ({ risks: [...state.risks, risk] })),

      removeRisk: (id) =>
        set((state) => ({ risks: state.risks.filter((r) => r.id !== id) })),

      selectTopMaterialTopics: (count) => {
        const risks = get().risks;
        const sorted = [...risks].sort(
          (a, b) => b.impact * b.likelihood - a.impact * a.likelihood,
        );
        set({
          selectedMaterialTopicIds: sorted.slice(0, count).map((r) => r.id),
          topSelectionCount: count,
        });
      },

      setSelectedTopicIds: (ids) => set({ selectedMaterialTopicIds: ids }),

      addStakeholderSurvey: (survey) =>
        set((state) => ({
          stakeholderSurveys: [...state.stakeholderSurveys, survey],
        })),

      setTemplates: (templates) => set({ templates }),

      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t,
          ),
        })),

      addScope1Asset: (asset) =>
        set((state) => ({ scope1Assets: [...state.scope1Assets, asset] })),

      removeScope1Asset: (id) =>
        set((state) => ({
          scope1Assets: state.scope1Assets.filter((a) => a.id !== id),
        })),

      addScope2Entry: (entry) =>
        set((state) => ({ scope2Entries: [...state.scope2Entries, entry] })),

      removeScope2Entry: (id) =>
        set((state) => ({
          scope2Entries: state.scope2Entries.filter((e) => e.id !== id),
        })),

      addScope3Entry: (entry) =>
        set((state) => ({ scope3Entries: [...state.scope3Entries, entry] })),

      removeScope3Entry: (id) =>
        set((state) => ({
          scope3Entries: state.scope3Entries.filter((e) => e.id !== id),
        })),

      addScenarioResult: (result) =>
        set((state) => ({
          scenarioResults: [...state.scenarioResults, result],
        })),

      setReportDraft: (draft) => set({ reportDraft: draft }),

      setActiveStep: (step) => set({ activeStep: step }),
    }),
    {
      name: "sustainability-storage",
    },
  ),
);
