import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  apiCreateProject,
  apiSaveProject,
  apiDeleteProject,
  apiLoadProject,
  apiListProjects,
  isProjectApiUnreachableError,
} from "@/services/projectApi";
import type { ProjectApiServerEntity } from "@/services/projectApi";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui";
import { resolvePrimarySnapshot } from "@/features/sustainability/utils/assessmentHelpers";
import {
  buildApprovedMaterialMetrics,
  type ApprovedMaterialMetric,
} from "@/features/sustainability/utils/materialMetricsSync";
import {
  hasOrphanDownstreamData,
  stripOrphanDownstreamData,
} from "@/features/sustainability/utils/assessmentProgress";

export type { ApprovedMaterialMetric };

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

export type EntityRelationshipType =
  | "Standalone"
  | "Parent"
  | "Subsidiary"
  | "JointVenture"
  | "Associate"
  | "Branch";

// Keep EntityType as an alias for backwards compat with any existing code
export type EntityType = EntityRelationshipType;

export interface AssociatedEntity {
  id: string;
  name: string;
  entityType: EntityRelationshipType;   // keep field name for compat
  relationshipType: EntityRelationshipType;
  parentId: string | null;
  sectorId: string;
  subSector: string;
}

export interface EntitySnapshot {
  governanceAssessment: GovernanceAssessmentData;
  valueChain: ValueChainData;
  srroItems: SRROItem[];
  phase4Entries: Phase4Entry[];
  phase5Items: Phase5Item[];
}

export type ApprovalStatus = "none" | "submitted" | "approved" | "rejected";

export interface PhaseApproval {
  status: ApprovalStatus;
  submittedBy: string;
  submittedAt: string;
  reviewedBy: string;
  reviewedAt: string;
  comment: string;
}

const EMPTY_APPROVAL: PhaseApproval = {
  status: "none", submittedBy: "", submittedAt: "", reviewedBy: "", reviewedAt: "", comment: "",
};

export interface AssessmentProject {
  id: string;
  createdAt: string;
  updatedAt: string;
  governanceAssessment: GovernanceAssessmentData;
  valueChain: ValueChainData;
  srroItems: SRROItem[];
  phase4Entries: Phase4Entry[];
  phase5Items: Phase5Item[];
  isGroupAssessment: boolean;
  groupName: string;
  assessmentEntities: AssociatedEntity[];
  activeEntityId: string;
  entitySnapshots: Record<string, EntitySnapshot>;
  srroApproval: PhaseApproval;
  reportApproval: PhaseApproval;
}

export interface GovernanceAssessmentData {
  clientName: string;
  sector: string;
  geography: string;
  reportingBasis: string;
  assessmentDate: string;
  reportingRequirement: string;
  documentsReviewed: string[];
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
  clientNote?: string;
}

// ─── Phase 4: Material Information Identification ────────────────────────────
export interface Phase4Entry {
  ref: string;
  sources: string[];           // e.g. ["SASB", "GRI", "IFRS S2"]
  sasbSector: string;
  sasbIndustry: string;
  sasbTopic: string;
  selectedMetrics: string[];
  additionalMetrics: string;
  specificInformation: string;
}

// ─── Phase 5: Materiality Assessment ────────────────────────────────────────
export interface Phase5MetricScore {
  metricName: string;
  likelihood: number;
  magnitude: number;
  qualitativeFlag: "Yes" | "No" | "";
  aggregationFlag: "Yes" | "No" | "";
}

export interface Phase5Item {
  ref: string;
  likelihood: number;
  magnitude: number;
  qualitativeFlag: "Yes" | "No" | "";
  aggregationFlag: "Yes" | "No" | "";
  metricScores: Phase5MetricScore[];
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
  questionnaireResponses: Record<string, string>;
  /** Consultant-edited question text, keyed by question id. Overrides the default wording shown to the client. */
  questionOverrides: Record<string, string>;
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
  isGroupAssessment: boolean;
  groupName: string;
  assessmentEntities: AssociatedEntity[];
  activeEntityId: string;
  entitySnapshots: Record<string, EntitySnapshot>;
  assessmentProjects: AssessmentProject[];
  /** Project ids deleted locally while the API was unreachable — retried on next sync. */
  pendingDeleteProjectIds: string[];
  activeProjectId: string | null;
  srroApproval: PhaseApproval;
  reportApproval: PhaseApproval;
  approvedMaterialMetrics: Record<string, ApprovedMaterialMetric[]>;

  setEntityProfile: (profile: Partial<EntityProfile>) => void;
  createNewProject: () => string;
  submitSrroForReview: (submittedBy: string) => void;
  approveSrro: (reviewedBy: string, comment: string) => void;
  rejectSrro: (reviewedBy: string, comment: string) => void;
  resetSrroApproval: () => void;
  submitReportForReview: (submittedBy: string) => void;
  approveReport: (reviewedBy: string, comment: string) => void;
  rejectReport: (reviewedBy: string, comment: string) => void;
  resetReportApproval: () => void;
  assignMaterialMetric: (metricId: string, userId: string) => void;
  syncFromServer: () => Promise<void>;
  loadProject: (id: string) => void;
  saveCurrentProject: () => void;
  /** Clear phases 2–5 when Phase 1 is incomplete; persists to local + server. */
  ensureAssessmentIntegrity: () => void;
  deleteProject: (id: string) => void;
  updateGovernanceAssessment: (updates: Partial<GovernanceAssessmentData>) => void;
  setIsGroupAssessment: (v: boolean) => void;
  setGroupName: (name: string) => void;
  addAssessmentEntity: (entity: AssociatedEntity) => void;
  removeAssessmentEntity: (id: string) => void;
  switchActiveEntity: (id: string) => void;
  updateGovernanceQuestion: (ref: string, updates: Partial<GovernanceQuestion>) => void;
  updateValueChain: (updates: Partial<ValueChainData>) => void;
  setValueChainActivities: (items: ValueChainActivity[]) => void;
  setResourceRelationships: (items: ResourceRelationship[]) => void;
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
  upsertPhase5MetricScore: (ref: string, metricName: string, updates: Partial<Phase5MetricScore>) => void;
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

// ─── Server → EntitySnapshot mapping ────────────────────────────────────────
function safeJson<T>(raw: string, fallback: T): T {
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function snapshotFromServerEntity(e: ProjectApiServerEntity): EntitySnapshot {
  return {
    governanceAssessment: safeJson<GovernanceAssessmentData>(e.governanceJson, {
      clientName: "", sector: "", geography: "", reportingBasis: "",
      assessmentDate: "", reportingRequirement: "", documentsReviewed: [],
      kickOffNotes: "", questions: {}, overallConclusion: "",
      mainGovernanceWeaknesses: "", immediateActions: "",
      stakeholdersToEngage: "", additionalSupportNeeded: "",
    }),
    valueChain: safeJson<ValueChainData>(e.valueChainJson, {
      businessModelDescription: "", keyProductsServices: "",
      keyMarketsRegions: "", activities: [], resources: [], questionnaireResponses: {}, questionOverrides: {},
    }),
    srroItems: e.srroItems.map((s) => ({ ...s } as SRROItem)),
    phase4Entries: safeJson<Phase4Entry[]>(e.phase4Json, []),
    phase5Items: safeJson<Phase5Item[]>(e.phase5Json, []),
  };
}

/** Apply orphan downstream strip and return whether data changed. */
function cleanedProjectPatch(project: AssessmentProject): {
  cleaned: AssessmentProject;
  changed: boolean;
} {
  const cleaned = stripOrphanDownstreamData(project);
  const changed = hasOrphanDownstreamData(project);
  return { cleaned, changed };
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
      isGroupAssessment: false,
      groupName: "",
      assessmentEntities: [],
      activeEntityId: "parent",
      entitySnapshots: {},
      assessmentProjects: [],
      pendingDeleteProjectIds: [],
      activeProjectId: null,
      srroApproval: { ...EMPTY_APPROVAL },
      reportApproval: { ...EMPTY_APPROVAL },
      approvedMaterialMetrics: {},
      governanceAssessment: {
        clientName: "",
        sector: "",
        geography: "",
        reportingBasis: "",
        assessmentDate: "",
        reportingRequirement: "",
        documentsReviewed: [],
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
        questionnaireResponses: {},
        questionOverrides: {},
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

      createNewProject: () => {
        const id = crypto.randomUUID();
        const now = new Date().toISOString();
        const state = get();
        const newProject: AssessmentProject = {
          id, createdAt: now, updatedAt: now,
          governanceAssessment: state.governanceAssessment,
          valueChain: state.valueChain,
          srroItems: state.srroItems,
          phase4Entries: state.phase4Entries,
          phase5Items: state.phase5Items,
          isGroupAssessment: state.isGroupAssessment,
          groupName: state.groupName,
          assessmentEntities: state.assessmentEntities,
          activeEntityId: state.activeEntityId,
          entitySnapshots: state.entitySnapshots,
          srroApproval: state.srroApproval,
          reportApproval: state.reportApproval,
        };
        // Save current project before creating new
        const updatedProjects = state.activeProjectId
          ? state.assessmentProjects.map((p) =>
              p.id === state.activeProjectId
                ? { ...newProject, id: p.id, createdAt: p.createdAt, ...{
                    governanceAssessment: state.governanceAssessment,
                    valueChain: state.valueChain,
                    srroItems: state.srroItems,
                    phase4Entries: state.phase4Entries,
                    phase5Items: state.phase5Items,
                    isGroupAssessment: state.isGroupAssessment,
                    groupName: state.groupName,
                    assessmentEntities: state.assessmentEntities,
                    activeEntityId: state.activeEntityId,
                    entitySnapshots: state.entitySnapshots,
                    srroApproval: state.srroApproval,
                    reportApproval: state.reportApproval,
                    updatedAt: now,
                  } }
                : p,
            )
          : state.assessmentProjects;
        const emptyGov: GovernanceAssessmentData = {
          clientName: "", sector: "", geography: "", reportingBasis: "",
          assessmentDate: "", reportingRequirement: "", documentsReviewed: [],
          kickOffNotes: "", questions: {}, overallConclusion: "",
          mainGovernanceWeaknesses: "", immediateActions: "",
          stakeholdersToEngage: "", additionalSupportNeeded: "",
        };
        const emptyVC: ValueChainData = {
          businessModelDescription: "", keyProductsServices: "",
          keyMarketsRegions: "", activities: [], resources: [], questionnaireResponses: {}, questionOverrides: {},
        };
        set({
          assessmentProjects: [...updatedProjects, { ...newProject, governanceAssessment: emptyGov, valueChain: emptyVC, srroItems: [], phase4Entries: [], phase5Items: [], isGroupAssessment: false, groupName: "", assessmentEntities: [], activeEntityId: "parent", entitySnapshots: {}, srroApproval: { ...EMPTY_APPROVAL }, reportApproval: { ...EMPTY_APPROVAL } }],
          activeProjectId: id,
          governanceAssessment: emptyGov,
          valueChain: emptyVC,
          srroItems: [],
          phase4Entries: [],
          phase5Items: [],
          isGroupAssessment: false,
          groupName: "",
          assessmentEntities: [],
          activeEntityId: "parent",
          entitySnapshots: {},
          srroApproval: { ...EMPTY_APPROVAL },
          reportApproval: { ...EMPTY_APPROVAL },
        });
        // Fire-and-forget API sync
        (async () => {
          try {
            const userId = useAuthStore.getState().user?.id ?? "anonymous";
            await apiCreateProject(userId, { id, groupName: "", isGroupAssessment: false });
          } catch (err) {
            console.warn("[sustainabilityStore] Failed to sync new project to server:", err);
          }
        })();
        return id;
      },

      saveCurrentProject: () => {
        set((state) => {
          if (!state.activeProjectId) return {};
          const now = new Date().toISOString();
          return {
            assessmentProjects: state.assessmentProjects.map((p) =>
              p.id === state.activeProjectId
                ? {
                    ...p,
                    updatedAt: now,
                    governanceAssessment: state.governanceAssessment,
                    valueChain: state.valueChain,
                    srroItems: state.srroItems,
                    phase4Entries: state.phase4Entries,
                    phase5Items: state.phase5Items,
                    isGroupAssessment: state.isGroupAssessment,
                    groupName: state.groupName,
                    assessmentEntities: state.assessmentEntities,
                    activeEntityId: state.activeEntityId,
                    entitySnapshots: state.entitySnapshots,
                    srroApproval: state.srroApproval,
                    reportApproval: state.reportApproval,
                  }
                : p,
            ),
          };
        });
        // Fire-and-forget API sync
        (async () => {
          try {
            const state = get();
            if (!state.activeProjectId) return;
            const userId = useAuthStore.getState().user?.id ?? "anonymous";
            const mapSrroItem = (s: SRROItem) => ({
              ref: s.ref, source: s.source, title: s.title, description: s.description,
              type: s.type, valueChainStage: s.valueChainStage,
              financialImpact: s.financialImpact, strategicImpact: s.strategicImpact,
              operationalImpact: s.operationalImpact, timeHorizon: s.timeHorizon,
              likelihood: s.likelihood, magnitude: s.magnitude,
              neededByPrimaryUser: s.neededByPrimaryUser, includeInFinalList: s.includeInFinalList,
              srroCrro: s.srroCrro,
            });

            const entityPayload = state.assessmentEntities.length > 0
              ? state.assessmentEntities.map((e) => {
                  // Use snapshot if it exists (entity was switched away from).
                  // If no snapshot, this entity is the active context — use top-level state.
                  const snap = state.entitySnapshots[e.id];
                  return {
                    id: e.id,
                    name: e.name,
                    parentId: e.parentId ?? null,
                    sectorId: e.sectorId ?? "",
                    subSector: e.subSector ?? "",
                    relationshipType: e.relationshipType ?? e.entityType ?? "Standalone",
                    governanceJson: JSON.stringify(snap ? snap.governanceAssessment : state.governanceAssessment),
                    valueChainJson: JSON.stringify(snap ? snap.valueChain : state.valueChain),
                    phase4Json: JSON.stringify(snap ? snap.phase4Entries : state.phase4Entries),
                    phase5Json: JSON.stringify(snap ? snap.phase5Items : state.phase5Items),
                    srroItems: (snap ? snap.srroItems : state.srroItems ?? []).map(mapSrroItem),
                  };
                })
              : [{
                  // Single-entity flow: use a project-scoped ID so each project gets its own
                  // entity row. Fallback to activeEntityId only if it isn't the generic "parent"
                  // literal (which is shared across all projects and causes upsert collisions).
                  id: (state.activeEntityId && state.activeEntityId !== "parent")
                    ? state.activeEntityId
                    : `${state.activeProjectId}-parent`,
                  name: state.governanceAssessment?.clientName || state.groupName || "Primary Entity",
                  parentId: null,
                  sectorId: state.governanceAssessment?.sector || "",
                  subSector: "",
                  relationshipType: "Standalone",
                  governanceJson: JSON.stringify(state.governanceAssessment ?? {}),
                  valueChainJson: JSON.stringify(state.valueChain ?? {}),
                  phase4Json: JSON.stringify(state.phase4Entries ?? []),
                  phase5Json: JSON.stringify(state.phase5Items ?? []),
                  srroItems: (state.srroItems ?? []).map(mapSrroItem),
                }];

            const entityId = entityPayload[0]?.id ?? state.activeEntityId;
            await apiSaveProject(userId, state.activeProjectId, {
              groupName: state.groupName,
              isGroupAssessment: state.isGroupAssessment,
              activeEntityId: entityId,
              entities: entityPayload,
            });
          } catch (err) {
            console.warn("[sustainabilityStore] Failed to sync project save to server:", err);
          }
        })();
      },

      ensureAssessmentIntegrity: () => {
        const state = get();
        let anyChanged = false;

        const scrubbedProjects = state.assessmentProjects.map((p) => {
          const { cleaned, changed } = cleanedProjectPatch(p);
          if (changed) anyChanged = true;
          return cleaned;
        });

        if (!state.activeProjectId) {
          const workingSlice: AssessmentProject = {
            id: "__working__",
            createdAt: "",
            updatedAt: "",
            governanceAssessment: state.governanceAssessment,
            valueChain: state.valueChain,
            srroItems: state.srroItems,
            phase4Entries: state.phase4Entries,
            phase5Items: state.phase5Items,
            isGroupAssessment: state.isGroupAssessment,
            groupName: state.groupName,
            assessmentEntities: state.assessmentEntities,
            activeEntityId: state.activeEntityId,
            entitySnapshots: state.entitySnapshots,
            srroApproval: state.srroApproval,
            reportApproval: state.reportApproval,
          };
          const { cleaned: workingCleaned, changed: workingChanged } = cleanedProjectPatch(workingSlice);
          if (!anyChanged && !workingChanged) return;
          set({
            ...(workingChanged
              ? {
                  valueChain: workingCleaned.valueChain,
                  srroItems: workingCleaned.srroItems,
                  phase4Entries: workingCleaned.phase4Entries,
                  phase5Items: workingCleaned.phase5Items,
                  srroApproval: { ...EMPTY_APPROVAL },
                  reportApproval: { ...EMPTY_APPROVAL },
                }
              : {}),
            ...(anyChanged ? { assessmentProjects: scrubbedProjects } : {}),
          });
          return;
        }

        const activeCleaned = scrubbedProjects.find((p) => p.id === state.activeProjectId);
        const merged: AssessmentProject = activeCleaned ?? {
          id: state.activeProjectId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          governanceAssessment: state.governanceAssessment,
          valueChain: state.valueChain,
          srroItems: state.srroItems,
          phase4Entries: state.phase4Entries,
          phase5Items: state.phase5Items,
          isGroupAssessment: state.isGroupAssessment,
          groupName: state.groupName,
          assessmentEntities: state.assessmentEntities,
          activeEntityId: state.activeEntityId,
          entitySnapshots: state.entitySnapshots,
          srroApproval: state.srroApproval,
          reportApproval: state.reportApproval,
        };

        const { cleaned, changed: activeChanged } = cleanedProjectPatch({
          ...merged,
          governanceAssessment: state.governanceAssessment,
          valueChain: state.valueChain,
          srroItems: state.srroItems,
          phase4Entries: state.phase4Entries,
          phase5Items: state.phase5Items,
        });

        if (!anyChanged && !activeChanged) return;

        set((s) => ({
          valueChain: cleaned.valueChain,
          srroItems: cleaned.srroItems,
          phase4Entries: cleaned.phase4Entries,
          phase5Items: cleaned.phase5Items,
          srroApproval: activeChanged ? { ...EMPTY_APPROVAL } : s.srroApproval,
          reportApproval: activeChanged ? { ...EMPTY_APPROVAL } : s.reportApproval,
          assessmentProjects: scrubbedProjects.map((p) =>
            p.id === s.activeProjectId
              ? {
                  ...p,
                  governanceAssessment: cleaned.governanceAssessment,
                  valueChain: cleaned.valueChain,
                  srroItems: cleaned.srroItems,
                  phase4Entries: cleaned.phase4Entries,
                  phase5Items: cleaned.phase5Items,
                  ...(activeChanged
                    ? { srroApproval: { ...EMPTY_APPROVAL }, reportApproval: { ...EMPTY_APPROVAL } }
                    : {}),
                }
              : p,
          ),
          approvedMaterialMetrics: s.activeProjectId && activeChanged
            ? { ...s.approvedMaterialMetrics, [s.activeProjectId]: [] }
            : s.approvedMaterialMetrics,
        }));
        get().saveCurrentProject();
      },

      syncFromServer: async () => {
        try {
          const userId = useAuthStore.getState().user?.id ?? "anonymous";

          // Retry deletes that failed while the API was offline
          const pendingDeletes = [...get().pendingDeleteProjectIds];
          for (const projectId of pendingDeletes) {
            try {
              await apiDeleteProject(userId, projectId);
              set((s) => ({
                pendingDeleteProjectIds: s.pendingDeleteProjectIds.filter((pid) => pid !== projectId),
              }));
            } catch (err) {
              if (isProjectApiUnreachableError(err)) break;
              // Already gone or not owned by this user — drop from retry queue
              set((s) => ({
                pendingDeleteProjectIds: s.pendingDeleteProjectIds.filter((pid) => pid !== projectId),
              }));
            }
          }

          const serverList = await apiListProjects(userId);
          const knownIds = new Set(get().assessmentProjects.map((p) => p.id));
          const pendingSet = new Set(get().pendingDeleteProjectIds);
          const missing = serverList.filter((p) => !knownIds.has(p.id) && !pendingSet.has(p.id));
          for (const stub of missing) {
            try {
              const full = await apiLoadProject(userId, stub.id);
              const snapshots: Record<string, EntitySnapshot> = {};
              for (const e of full.entities) snapshots[e.id] = snapshotFromServerEntity(e);
              const activeId = full.activeEntityId ?? "parent";
              const primary = resolvePrimarySnapshot(snapshots, activeId, full.id);
              const emptyGovAssessment: GovernanceAssessmentData = {
                clientName: "", sector: "", geography: "", reportingBasis: "",
                assessmentDate: "", reportingRequirement: "", documentsReviewed: [],
                kickOffNotes: "", questions: {}, overallConclusion: "",
                mainGovernanceWeaknesses: "", immediateActions: "",
                stakeholdersToEngage: "", additionalSupportNeeded: "",
              };
              const emptyVC: ValueChainData = {
                businessModelDescription: "", keyProductsServices: "",
                keyMarketsRegions: "", activities: [], resources: [], questionnaireResponses: {}, questionOverrides: {},
              };
              const project: AssessmentProject = stripOrphanDownstreamData({
                id: full.id,
                createdAt: full.createdAt,
                updatedAt: full.updatedAt,
                groupName: full.groupName,
                isGroupAssessment: full.isGroupAssessment,
                activeEntityId: activeId,
                governanceAssessment: primary?.governanceAssessment ?? emptyGovAssessment,
                valueChain: primary?.valueChain ?? emptyVC,
                srroItems: primary?.srroItems ?? [],
                phase4Entries: primary?.phase4Entries ?? [],
                phase5Items: primary?.phase5Items ?? [],
                assessmentEntities: full.entities
                  .filter((e) => e.id !== "parent" && !e.id.endsWith("-parent"))
                  .map((e) => ({
                    id: e.id, name: e.name, parentId: e.parentId,
                    sectorId: e.sectorId, subSector: e.subSector,
                    relationshipType: e.relationshipType as EntityRelationshipType,
                    entityType: e.relationshipType as EntityRelationshipType,
                  })),
                entitySnapshots: snapshots,
                srroApproval: { ...EMPTY_APPROVAL },
                reportApproval: { ...EMPTY_APPROVAL },
              });
              set((s) => ({ assessmentProjects: [...s.assessmentProjects, project] }));
            } catch {
              // skip projects that fail to load individually
            }
          }
        } catch (err) {
          console.warn("[sustainabilityStore] syncFromServer failed:", err);
        }
      },

      loadProject: (id) => {
        // 1. Immediate localStorage hydrate — only flush working state when switching projects
        set((state) => {
          const now = new Date().toISOString();
          const isSwitch = state.activeProjectId != null && state.activeProjectId !== id;
          const saved = isSwitch
            ? state.assessmentProjects.map((p) =>
                p.id === state.activeProjectId
                  ? {
                      ...p,
                      updatedAt: now,
                      governanceAssessment: state.governanceAssessment,
                      valueChain: state.valueChain,
                      srroItems: state.srroItems,
                      phase4Entries: state.phase4Entries,
                      phase5Items: state.phase5Items,
                      isGroupAssessment: state.isGroupAssessment,
                      groupName: state.groupName,
                      assessmentEntities: state.assessmentEntities,
                      activeEntityId: state.activeEntityId,
                      entitySnapshots: state.entitySnapshots,
                      srroApproval: state.srroApproval,
                      reportApproval: state.reportApproval,
                    }
                  : p,
              )
            : state.assessmentProjects;
          const raw = saved.find((p) => p.id === id);
          if (!raw) return {};
          const { cleaned: project } = cleanedProjectPatch(raw);
          return {
            assessmentProjects: saved.map((p) => (p.id === id ? { ...p, ...project } : p)),
            activeProjectId: id,
            governanceAssessment: project.governanceAssessment,
            valueChain: project.valueChain,
            srroItems: project.srroItems,
            phase4Entries: project.phase4Entries,
            phase5Items: project.phase5Items,
            isGroupAssessment: project.isGroupAssessment,
            groupName: project.groupName,
            assessmentEntities: project.assessmentEntities,
            activeEntityId: project.activeEntityId,
            entitySnapshots: project.entitySnapshots,
            srroApproval: project.srroApproval ?? { ...EMPTY_APPROVAL },
            reportApproval: project.reportApproval ?? { ...EMPTY_APPROVAL },
          };
        });
        // 2. Fire-and-forget server round-trip — overwrites snapshots if server has newer data
        (async () => {
          try {
            const userId = useAuthStore.getState().user?.id ?? "anonymous";
            const serverProject = await apiLoadProject(userId, id);
            const snapshots: Record<string, EntitySnapshot> = {};
            for (const e of serverProject.entities) {
              snapshots[e.id] = snapshotFromServerEntity(e);
            }
            const activeId = serverProject.activeEntityId ?? "parent";
            const activeSnap = resolvePrimarySnapshot(snapshots, activeId, id);
            if (!activeSnap) return;
            set((state) => {
              const existing = state.assessmentProjects.find((p) => p.id === id);
              const merged: AssessmentProject = {
                ...(existing ?? {
                  id,
                  createdAt: serverProject.createdAt,
                  updatedAt: serverProject.updatedAt,
                  srroApproval: { ...EMPTY_APPROVAL },
                  reportApproval: { ...EMPTY_APPROVAL },
                }),
                updatedAt: serverProject.updatedAt,
                groupName: serverProject.groupName,
                isGroupAssessment: serverProject.isGroupAssessment,
                activeEntityId: activeId,
                entitySnapshots: snapshots,
                governanceAssessment: activeSnap.governanceAssessment,
                valueChain: activeSnap.valueChain,
                srroItems: activeSnap.srroItems,
                phase4Entries: activeSnap.phase4Entries,
                phase5Items: activeSnap.phase5Items,
                assessmentEntities: serverProject.entities
                  .filter((e) => e.id !== "parent" && !e.id.endsWith("-parent"))
                  .map((e) => ({
                    id: e.id,
                    name: e.name,
                    parentId: e.parentId,
                    sectorId: e.sectorId,
                    subSector: e.subSector,
                    relationshipType: e.relationshipType as EntityRelationshipType,
                    entityType: e.relationshipType as EntityRelationshipType,
                  })),
              };
              const { cleaned: updatedProject } = cleanedProjectPatch(merged);
              return {
                assessmentProjects: existing
                  ? state.assessmentProjects.map((p) => (p.id === id ? updatedProject : p))
                  : [...state.assessmentProjects, updatedProject],
                entitySnapshots: snapshots,
                activeEntityId: activeId,
                groupName: serverProject.groupName,
                isGroupAssessment: serverProject.isGroupAssessment,
                governanceAssessment: updatedProject.governanceAssessment,
                valueChain: updatedProject.valueChain,
                srroItems: updatedProject.srroItems,
                phase4Entries: updatedProject.phase4Entries,
                phase5Items: updatedProject.phase5Items,
              };
            });
            if (get().activeProjectId === id) get().ensureAssessmentIntegrity();
          } catch (err) {
            console.warn("[sustainabilityStore] Server load failed, using localStorage data:", err);
          }
        })();
      },

      deleteProject: (id) => {
        set((state) => {
          const projects = state.assessmentProjects.filter((p) => p.id !== id);
          if (state.activeProjectId !== id) return { assessmentProjects: projects };
          const emptyGov: GovernanceAssessmentData = {
            clientName: "", sector: "", geography: "", reportingBasis: "",
            assessmentDate: "", reportingRequirement: "", documentsReviewed: [],
            kickOffNotes: "", questions: {}, overallConclusion: "",
            mainGovernanceWeaknesses: "", immediateActions: "",
            stakeholdersToEngage: "", additionalSupportNeeded: "",
          };
          return {
            assessmentProjects: projects,
            activeProjectId: null,
            governanceAssessment: emptyGov,
            valueChain: { businessModelDescription: "", keyProductsServices: "", keyMarketsRegions: "", activities: [], resources: [], questionnaireResponses: {}, questionOverrides: {} },
            srroItems: [],
            phase4Entries: [],
            phase5Items: [],
            isGroupAssessment: false,
            groupName: "",
            assessmentEntities: [],
            activeEntityId: "parent",
            entitySnapshots: {},
            srroApproval: { ...EMPTY_APPROVAL },
            reportApproval: { ...EMPTY_APPROVAL },
          };
        });
        // Optimistic removal above; sync delete to server in the background.
        (async () => {
          const queuePendingDelete = () => {
            set((s) => ({
              pendingDeleteProjectIds: s.pendingDeleteProjectIds.includes(id)
                ? s.pendingDeleteProjectIds
                : [...s.pendingDeleteProjectIds, id],
            }));
          };

          try {
            const userId = useAuthStore.getState().user?.id ?? "anonymous";
            await apiDeleteProject(userId, id);
            set((s) => ({
              pendingDeleteProjectIds: s.pendingDeleteProjectIds.filter((pid) => pid !== id),
            }));
          } catch (err) {
            console.warn("[sustainabilityStore] Failed to sync project delete to server:", err);
            queuePendingDelete();
            if (isProjectApiUnreachableError(err)) {
              toast.warning(
                "Assessment removed. The API server is offline — run npm run dev:all to sync the deletion.",
              );
            } else {
              toast.warning(
                "Assessment removed on this device. Server delete will retry automatically on next sync.",
              );
            }
          }
        })();
      },

      submitSrroForReview: (submittedBy) =>
        set((state) => ({
          srroApproval: { ...EMPTY_APPROVAL, status: "submitted", submittedBy, submittedAt: new Date().toISOString() },
          notifications: [...state.notifications, {
            id: crypto.randomUUID(), type: "approval_request" as const,
            title: "SRRO List Submitted for Review",
            message: `${submittedBy} has submitted the SRRO/CRRO Final List for review and approval.`,
            timestamp: new Date().toISOString(), read: false,
          }],
        })),

      approveSrro: (reviewedBy, comment) =>
        set((state) => ({
          srroApproval: { ...state.srroApproval, status: "approved", reviewedBy, reviewedAt: new Date().toISOString(), comment },
          notifications: [...state.notifications, {
            id: crypto.randomUUID(), type: "approval_result" as const,
            title: "SRRO List Approved",
            message: `${reviewedBy} approved the SRRO/CRRO Final List.${comment ? ` Comment: "${comment}"` : ""}`,
            timestamp: new Date().toISOString(), read: false,
          }],
        })),

      rejectSrro: (reviewedBy, comment) =>
        set((state) => ({
          srroApproval: { ...state.srroApproval, status: "rejected", reviewedBy, reviewedAt: new Date().toISOString(), comment },
          notifications: [...state.notifications, {
            id: crypto.randomUUID(), type: "approval_result" as const,
            title: "SRRO List — Revision Required",
            message: `${reviewedBy} requested revisions to the SRRO/CRRO Final List. Reason: "${comment}"`,
            timestamp: new Date().toISOString(), read: false,
          }],
        })),

      resetSrroApproval: () => set({ srroApproval: { ...EMPTY_APPROVAL } }),

      submitReportForReview: (submittedBy) =>
        set((state) => ({
          reportApproval: { ...EMPTY_APPROVAL, status: "submitted", submittedBy, submittedAt: new Date().toISOString() },
          notifications: [...state.notifications, {
            id: crypto.randomUUID(), type: "approval_request" as const,
            title: "Materiality Output Submitted for Report Approval",
            message: `${submittedBy} has submitted the materiality assessment output for review before report generation.`,
            timestamp: new Date().toISOString(), read: false,
          }],
        })),

      approveReport: (reviewedBy, comment) =>
        set((state) => {
          const projectId = state.activeProjectId;
          const published = projectId
            ? buildApprovedMaterialMetrics(
                projectId,
                state.srroItems,
                state.phase4Entries,
                state.phase5Items,
                state.approvedMaterialMetrics[projectId] ?? [],
              )
            : [];
          return {
            reportApproval: { ...state.reportApproval, status: "approved", reviewedBy, reviewedAt: new Date().toISOString(), comment },
            approvedMaterialMetrics: projectId
              ? { ...state.approvedMaterialMetrics, [projectId]: published }
              : state.approvedMaterialMetrics,
            notifications: [...state.notifications, {
              id: crypto.randomUUID(), type: "approval_result" as const,
              title: "Report Approved — Ready to Download",
              message: `${reviewedBy} approved the materiality output. ${published.length} material metric${published.length === 1 ? "" : "s"} published to Data Management.${comment ? ` Comment: "${comment}"` : ""}`,
              timestamp: new Date().toISOString(), read: false,
            }],
          };
        }),

      rejectReport: (reviewedBy, comment) =>
        set((state) => ({
          reportApproval: { ...state.reportApproval, status: "rejected", reviewedBy, reviewedAt: new Date().toISOString(), comment },
          notifications: [...state.notifications, {
            id: crypto.randomUUID(), type: "approval_result" as const,
            title: "Report Approval — Revision Required",
            message: `${reviewedBy} requested revisions before the report can be generated. Reason: "${comment}"`,
            timestamp: new Date().toISOString(), read: false,
          }],
        })),

      resetReportApproval: () => set({ reportApproval: { ...EMPTY_APPROVAL } }),

      assignMaterialMetric: (metricId, userId) =>
        set((state) => {
          const projectId = state.activeProjectId;
          if (!projectId) return {};
          const current = state.approvedMaterialMetrics[projectId] ?? [];
          return {
            approvedMaterialMetrics: {
              ...state.approvedMaterialMetrics,
              [projectId]: current.map((m) =>
                m.id === metricId ? { ...m, assignedUserId: userId } : m,
              ),
            },
          };
        }),

      setIsGroupAssessment: (v) => set({ isGroupAssessment: v }),
      setGroupName: (name) => set({ groupName: name }),

      addAssessmentEntity: (entity) =>
        set((state) => ({ assessmentEntities: [...state.assessmentEntities, entity] })),

      removeAssessmentEntity: (id) =>
        set((state) => {
          const entities = state.assessmentEntities.filter((e) => e.id !== id);
          const { [id]: _snap, ...snapshots } = state.entitySnapshots; // eslint-disable-line @typescript-eslint/no-unused-vars
          if (state.activeEntityId === id) {
            const parentSnap = snapshots["parent"];
            return {
              assessmentEntities: entities,
              entitySnapshots: snapshots,
              activeEntityId: "parent",
              ...(parentSnap
                ? {
                    governanceAssessment: parentSnap.governanceAssessment,
                    valueChain: parentSnap.valueChain,
                    srroItems: parentSnap.srroItems,
                    phase4Entries: parentSnap.phase4Entries,
                    phase5Items: parentSnap.phase5Items,
                  }
                : {}),
            };
          }
          return { assessmentEntities: entities, entitySnapshots: snapshots };
        }),

      switchActiveEntity: (newId) =>
        set((state) => {
          const currentId = state.activeEntityId;
          if (currentId === newId) return {};
          const snapshot: EntitySnapshot = {
            governanceAssessment: state.governanceAssessment,
            valueChain: state.valueChain,
            srroItems: state.srroItems,
            phase4Entries: state.phase4Entries,
            phase5Items: state.phase5Items,
          };
          const updatedSnapshots = { ...state.entitySnapshots, [currentId]: snapshot };
          const existing = updatedSnapshots[newId];
          if (existing) {
            return {
              entitySnapshots: updatedSnapshots,
              activeEntityId: newId,
              governanceAssessment: existing.governanceAssessment,
              valueChain: existing.valueChain,
              srroItems: existing.srroItems,
              phase4Entries: existing.phase4Entries,
              phase5Items: existing.phase5Items,
            };
          }
          return {
            entitySnapshots: updatedSnapshots,
            activeEntityId: newId,
            governanceAssessment: {
              clientName: state.governanceAssessment.clientName,
              sector: state.governanceAssessment.sector,
              geography: state.governanceAssessment.geography,
              reportingBasis: state.governanceAssessment.reportingBasis,
              assessmentDate: state.governanceAssessment.assessmentDate,
              reportingRequirement: state.governanceAssessment.reportingRequirement,
              documentsReviewed: [],
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
              questionnaireResponses: {},
              questionOverrides: {},
            },
            srroItems: [],
            phase4Entries: [],
            phase5Items: [],
          };
        }),

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

      setValueChainActivities: (items) =>
        set((state) => ({
          valueChain: { ...state.valueChain, activities: items },
        })),

      setResourceRelationships: (items) =>
        set((state) => ({
          valueChain: { ...state.valueChain, resources: items },
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
      upsertPhase5MetricScore: (ref, metricName, updates) =>
        set((state) => {
          const blank: Phase5MetricScore = { metricName, likelihood: 0, magnitude: 0, qualitativeFlag: "", aggregationFlag: "" };
          const existing = state.phase5Items.find((p) => p.ref === ref);
          const baseItem: Phase5Item = existing ?? { ref, likelihood: 0, magnitude: 0, qualitativeFlag: "", aggregationFlag: "", metricScores: [] };
          const scores = baseItem.metricScores ?? [];
          const hasScore = scores.some((s) => s.metricName === metricName);
          const newScores = hasScore
            ? scores.map((s) => s.metricName === metricName ? { ...s, ...updates } : s)
            : [...scores, { ...blank, ...updates }];
          const updated: Phase5Item = { ...baseItem, metricScores: newScores };
          const itemExists = state.phase5Items.some((p) => p.ref === ref);
          return {
            phase5Items: itemExists
              ? state.phase5Items.map((p) => p.ref === ref ? updated : p)
              : [...state.phase5Items, updated],
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

// ─── Entity tree selector (pure, outside Zustand) ─────────────────────────────

export interface EntityTreeNode extends AssociatedEntity {
  children: EntityTreeNode[];
}

export function getEntityTree(entities: AssociatedEntity[]): EntityTreeNode[] {
  const map = new Map<string, EntityTreeNode>();
  for (const e of entities) {
    map.set(e.id, { ...e, children: [] });
  }
  const roots: EntityTreeNode[] = [];
  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
