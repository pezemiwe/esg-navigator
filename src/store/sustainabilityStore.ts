import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface EntityProfile {
  name: string;
  businessOverview?: string;
  registrationNumber?: string;
  yearOfIncorporation?: number;
  website?: string;
  countryOfIncorporation?: string;
  hqState?: string;
  otherCountriesOfOperation?: string[];
  sector?: string;
  subSector?: string;
  productsAndServices?: string[];
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
  /** Company branch locations derived from selected states */
  branchLocations?: {
    id: string;
    name: string;
    state: string;
    country: string;
  }[];
  companyLogo?: string;
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
  internalApprovedBy?: string;
  internalApprovedAt?: string;
  internalComment?: string;
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

// ─── Phase 1: Governance & Risk Management Assessment ───────────────────────
export interface GovernanceQuestion {
  ref: string;
  score: "No integration" | "Limited integration" | "Integrated" | "";
  evidenceNotes: string;
  gapIdentified: "Yes" | "No" | "";
}

export interface GovernanceAssessmentData {
  clientName: string;
  sector: string;
  geography: string;
  reportingBasis: string;
  assessmentDate: string;
  reportingRequirement: string;
  documentsReviewed: string;
  kickOffNotes: string;
  questions: Record<string, GovernanceQuestion>;
  overallConclusion: string;
  mainGovernanceWeaknesses: string;
  immediateActions: string;
  stakeholdersToEngage: string;
  additionalSupportNeeded: string;
}

// ─── Phase 3: SRRO Identification ───────────────────────────────────────────
export interface SRROItem {
  id: string;
  ref: string;
  source: string;
  title: string;
  description: string;
  type: "Risk" | "Opportunity" | "";
  valueChainStage: "Upstream" | "Core" | "Downstream" | "";
  financialImpact: "Yes" | "No" | "";
  strategicImpact: "Yes" | "No" | "";
  operationalImpact: "Yes" | "No" | "";
  timeHorizon: "Short" | "Medium" | "Long" | "";
  likelihood: number;
  magnitude: number;
  neededByPrimaryUser: "Yes" | "No" | "";
  includeInFinalList: "Yes" | "No" | "";
  srroCrro: "SRRO" | "CRRO" | "";
}

// ─── Phase 4: Material Information Identification ────────────────────────────
export interface Phase4Entry {
  ref: string;
  financialRelevance: "Yes" | "No" | "";
  timeHorizon: "Short" | "Medium" | "Long" | "";
  disclosureArea: string;
  specificInformation: string;
  metricsKPI: string;
  metricSource: string;
}

// ─── Phase 5: Materiality Assessment ────────────────────────────────────────
export interface Phase5Item {
  ref: string;
  likelihood: number;
  magnitude: number;
  qualitativeFlag: "Yes" | "No" | "";
  aggregationFlag: "Yes" | "No" | "";
}

// ─── Phase 2: Value Chain Assessment ────────────────────────────────────────
export interface ValueChainActivity {
  id: string;
  stage: "Upstream" | "Core" | "Downstream" | "";
  activity: string;
  description: string;
  vendorType: string;
  keyStakeholders: string;
  geography: string;
  keyInputs: string;
  keyOutputs: string;
  notes: string;
}

export interface ResourceRelationship {
  id: string;
  vendor: string;
  valueChainStage: string;
  capitalType: string;
  resourceRelationship: "Resource" | "Relationship" | "";
  dependencyImpact: "Dependency" | "Impact" | "";
  riskOpportunity: "Risk" | "Opportunity" | "";
  description: string;
}

export interface ValueChainData {
  businessModelDescription: string;
  keyProductsServices: string;
  keyMarketsRegions: string;
  activities: ValueChainActivity[];
  resources: ResourceRelationship[];
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
  reportGeneratedBy: string;
  reportYear: string;
  activeStep: number;
  governanceAssessment: GovernanceAssessmentData;
  valueChain: ValueChainData;
  srroItems: SRROItem[];
  phase4Entries: Phase4Entry[];
  phase5Items: Phase5Item[];

  setEntityProfile: (profile: Partial<EntityProfile>) => void;
  updateGovernanceAssessment: (updates: Partial<GovernanceAssessmentData>) => void;
  updateGovernanceQuestion: (ref: string, updates: Partial<GovernanceQuestion>) => void;
  updateValueChain: (updates: Partial<ValueChainData>) => void;
  addValueChainActivity: (activity: ValueChainActivity) => void;
  updateValueChainActivity: (id: string, updates: Partial<ValueChainActivity>) => void;
  removeValueChainActivity: (id: string) => void;
  addResourceRelationship: (resource: ResourceRelationship) => void;
  updateResourceRelationship: (id: string, updates: Partial<ResourceRelationship>) => void;
  removeResourceRelationship: (id: string) => void;
  // Phase 3
  setSrroItems: (items: SRROItem[]) => void;
  addSrroItem: (item: SRROItem) => void;
  updateSrroItem: (id: string, updates: Partial<SRROItem>) => void;
  removeSrroItem: (id: string) => void;
  // Phase 4
  upsertPhase4Entry: (entry: Phase4Entry) => void;
  removePhase4Entry: (ref: string) => void;
  // Phase 5
  upsertPhase5Item: (item: Phase5Item) => void;
  removePhase5Item: (ref: string) => void;
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
  setReportGeneratedBy: (name: string) => void;
  setReportYear: (year: string) => void;
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
      reportGeneratedBy: "",
      reportYear: "",
      activeStep: 0,
      governanceAssessment: {
        clientName: "",
        sector: "",
        geography: "",
        reportingBasis: "",
        assessmentDate: "",
        reportingRequirement: "",
        documentsReviewed: "",
        kickOffNotes: "",
        questions: {},
        overallConclusion: "",
        mainGovernanceWeaknesses: "",
        immediateActions: "",
        stakeholdersToEngage: "",
        additionalSupportNeeded: "",
      },
      valueChain: {
        businessModelDescription: "",
        keyProductsServices: "",
        keyMarketsRegions: "",
        activities: [],
        resources: [],
      },
      srroItems: [],
      phase4Entries: [],
      phase5Items: [],

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

      updateGovernanceAssessment: (updates) =>
        set((state) => ({
          governanceAssessment: { ...state.governanceAssessment, ...updates },
        })),

      updateGovernanceQuestion: (ref, updates) =>
        set((state) => ({
          governanceAssessment: {
            ...state.governanceAssessment,
            questions: {
              ...state.governanceAssessment.questions,
              [ref]: { ...state.governanceAssessment.questions[ref], ...updates },
            },
          },
        })),

      updateValueChain: (updates) =>
        set((state) => ({
          valueChain: { ...state.valueChain, ...updates },
        })),

      addValueChainActivity: (activity) =>
        set((state) => ({
          valueChain: {
            ...state.valueChain,
            activities: [...state.valueChain.activities, activity],
          },
        })),

      updateValueChainActivity: (id, updates) =>
        set((state) => ({
          valueChain: {
            ...state.valueChain,
            activities: state.valueChain.activities.map((a) =>
              a.id === id ? { ...a, ...updates } : a,
            ),
          },
        })),

      removeValueChainActivity: (id) =>
        set((state) => ({
          valueChain: {
            ...state.valueChain,
            activities: state.valueChain.activities.filter((a) => a.id !== id),
          },
        })),

      addResourceRelationship: (resource) =>
        set((state) => ({
          valueChain: {
            ...state.valueChain,
            resources: [...state.valueChain.resources, resource],
          },
        })),

      updateResourceRelationship: (id, updates) =>
        set((state) => ({
          valueChain: {
            ...state.valueChain,
            resources: state.valueChain.resources.map((r) =>
              r.id === id ? { ...r, ...updates } : r,
            ),
          },
        })),

      removeResourceRelationship: (id) =>
        set((state) => ({
          valueChain: {
            ...state.valueChain,
            resources: state.valueChain.resources.filter((r) => r.id !== id),
          },
        })),

      // ── Phase 3 ──────────────────────────────────────────────────────────
      setSrroItems: (items) => set({ srroItems: items }),
      addSrroItem: (item) =>
        set((state) => ({ srroItems: [...state.srroItems, item] })),
      updateSrroItem: (id, updates) =>
        set((state) => ({
          srroItems: state.srroItems.map((s) => s.id === id ? { ...s, ...updates } : s),
        })),
      removeSrroItem: (id) =>
        set((state) => ({ srroItems: state.srroItems.filter((s) => s.id !== id) })),

      // ── Phase 4 ──────────────────────────────────────────────────────────
      upsertPhase4Entry: (entry) =>
        set((state) => {
          const exists = state.phase4Entries.some((e) => e.ref === entry.ref);
          return {
            phase4Entries: exists
              ? state.phase4Entries.map((e) => e.ref === entry.ref ? { ...e, ...entry } : e)
              : [...state.phase4Entries, entry],
          };
        }),
      removePhase4Entry: (ref) =>
        set((state) => ({ phase4Entries: state.phase4Entries.filter((e) => e.ref !== ref) })),

      // ── Phase 5 ──────────────────────────────────────────────────────────
      upsertPhase5Item: (item) =>
        set((state) => {
          const exists = state.phase5Items.some((p) => p.ref === item.ref);
          return {
            phase5Items: exists
              ? state.phase5Items.map((p) => p.ref === item.ref ? { ...p, ...item } : p)
              : [...state.phase5Items, item],
          };
        }),
      removePhase5Item: (ref) =>
        set((state) => ({ phase5Items: state.phase5Items.filter((p) => p.ref !== ref) })),

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

      setReportGeneratedBy: (name) => set({ reportGeneratedBy: name }),

      setReportYear: (year) => set({ reportYear: year }),

      setActiveStep: (step) => set({ activeStep: step }),
    }),
    {
      name: "sustainability-storage",
    },
  ),
);
