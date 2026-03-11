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
  sasbIndustry?: string; // legacy single
  sasbIndustries?: string[]; // multi-select — preferred after Mar 2026
  timeHorizons?: {
    short: { from: string; to: string };
    medium: { from: string; to: string };
    long: { from: string; to: string };
  };
  scoringMatrix?: {
    matrixSize: 3 | 4 | 5;
    levels: string[]; // labels, length === matrixSize
  };
  /** SASB metric entries: keyed by metric code, stores year + value */
  sasbMetricEntries?: Record<string, { year: string; value: string }>;
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

export interface Notification {
  id: string;
  type: "reminder" | "approval_request" | "approval_result" | "escalation";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface MaterialityApproval {
  status:
    | "none"
    | "pending_internal"
    | "pending_board"
    | "approved"
    | "rejected";
  submittedBy?: string;
  submittedAt?: string;
  // Stage 1 - Internal Control / Audit
  internalApprovedBy?: string;
  internalApprovedAt?: string;
  internalComment?: string;
  // Stage 2 — Board / final approver
  approvedBy?: string;
  approvedAt?: string;
  comment?: string;
}

export interface ReportSetup {
  governance: string;
  strategy: string;
  riskManagement: string;
  metricsTargets: string;
  governanceDocs: string[];
  strategyDocs: string[];
  riskManagementDocs: string[];
  metricsTargetsDocs: string[];
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
  selectionBasis: "top-n" | "by-severity" | "cherry-pick";
  selectedSeverityLevel: string;
  materialityApproval: MaterialityApproval;
  reportSetup: ReportSetup;
  notifications: Notification[];
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
  setSelectionBasis: (basis: "top-n" | "by-severity" | "cherry-pick") => void;
  setSelectedSeverityLevel: (level: string) => void;
  selectBySeverity: (level: string) => void;
  submitMaterialityForApproval: (submittedBy: string) => void;
  internalApproveMaterialityAssessment: (
    approvedBy: string,
    comment?: string,
  ) => void;
  approveMaterialityAssessment: (approvedBy: string, comment?: string) => void;
  rejectMaterialityAssessment: (approvedBy: string, comment: string) => void;
  updateReportSetup: (updates: Partial<ReportSetup>) => void;
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  dismissAllNotifications: () => void;
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
      selectionBasis: "top-n",
      selectedSeverityLevel: "",
      materialityApproval: { status: "none" },
      reportSetup: {
        governance: "",
        strategy: "",
        riskManagement: "",
        metricsTargets: "",
        governanceDocs: [],
        strategyDocs: [],
        riskManagementDocs: [],
        metricsTargetsDocs: [],
      },
      notifications: [],
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
          selectionBasis: "top-n",
          selectedSeverityLevel: "",
          materialityApproval: { status: "none" },
          reportSetup: {
            governance: "",
            strategy: "",
            riskManagement: "",
            metricsTargets: "",
            governanceDocs: [],
            strategyDocs: [],
            riskManagementDocs: [],
            metricsTargetsDocs: [],
          },
          notifications: [],
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

      setSelectionBasis: (basis) => set({ selectionBasis: basis }),

      setSelectedSeverityLevel: (level) =>
        set({ selectedSeverityLevel: level }),

      selectBySeverity: (level) => {
        const { risks, entityProfile } = get();
        const matrixSize = entityProfile.scoringMatrix?.matrixSize ?? 5;
        const maxScore = matrixSize * matrixSize;
        // Dynamic thresholds: divide score range into matrixSize equal bands
        // Comparison: score >= thresholds[i] && score < thresholds[i+1]
        // Last level has no upper bound (catches top of range via ?? maxScore+1)
        const thresholds = Array.from(
          { length: matrixSize },
          (_, i) => i * matrixSize,
        );
        const levels =
          entityProfile.scoringMatrix?.levels ??
          (matrixSize === 3
            ? ["Low", "Medium", "High"]
            : matrixSize === 4
              ? ["Low", "Medium", "High", "Critical"]
              : ["Low", "Medium", "High", "Very High", "Critical"]);
        const levelIndex = levels.findIndex(
          (l) => l.toLowerCase() === level.toLowerCase(),
        );
        if (levelIndex === -1) return;
        const minScore = thresholds[levelIndex];
        const maxThreshold = thresholds[levelIndex + 1] ?? maxScore + 1;
        const filtered = risks.filter((r) => {
          const score = r.impact * r.likelihood;
          return score >= minScore && score < maxThreshold;
        });
        set({
          selectedMaterialTopicIds: filtered.map((r) => r.id),
          selectedSeverityLevel: level,
        });
      },

      submitMaterialityForApproval: (submittedBy) =>
        set(() => ({
          materialityApproval: {
            status: "pending_internal",
            submittedBy,
            submittedAt: new Date().toISOString(),
          },
        })),

      internalApproveMaterialityAssessment: (approvedBy, comment) =>
        set((state) => ({
          materialityApproval: {
            ...state.materialityApproval,
            status: "pending_board",
            internalApprovedBy: approvedBy,
            internalApprovedAt: new Date().toISOString(),
            internalComment: comment,
          },
          notifications: [
            {
              id: crypto.randomUUID(),
              type: "approval_result" as const,
              title: "Internal Review Completed",
              message: `Materiality assessment passed internal review by ${approvedBy}. Awaiting Board approval.`,
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        })),

      approveMaterialityAssessment: (approvedBy, comment) =>
        set((state) => ({
          materialityApproval: {
            ...state.materialityApproval,
            status: "approved",
            approvedBy,
            approvedAt: new Date().toISOString(),
            comment,
          },
          notifications: [
            {
              id: crypto.randomUUID(),
              type: "approval_result" as const,
              title: "Materiality Assessment Fully Approved",
              message: `Board approval granted by ${approvedBy}. You may now proceed to data collection.`,
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        })),

      rejectMaterialityAssessment: (approvedBy, comment) =>
        set((state) => ({
          materialityApproval: {
            ...state.materialityApproval,
            status: "rejected",
            approvedBy,
            approvedAt: new Date().toISOString(),
            comment,
          },
          notifications: [
            {
              id: crypto.randomUUID(),
              type: "approval_result" as const,
              title: "Materiality Assessment Requires Revision",
              message: `${approvedBy} has returned the assessment for revision. Comment: ${comment}`,
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        })),

      updateReportSetup: (updates) =>
        set((state) => ({
          reportSetup: { ...state.reportSetup, ...updates },
        })),

      addNotification: (n) =>
        set((state) => ({
          notifications: [
            {
              ...n,
              id: crypto.randomUUID(),
              timestamp: new Date().toISOString(),
              read: false,
            },
            ...state.notifications,
          ],
        })),

      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),

      dismissAllNotifications: () =>
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            read: true,
          })),
        })),

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
