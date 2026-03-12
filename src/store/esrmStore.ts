import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PendingTask, ScoringResult } from "../features/esrm/types";
import { preAssessmentQuestions } from "../features/esrm/data/scoringData";
import { computeScoringResult } from "../features/esrm/utils";

const SAMPLE_PROJECT_IDS = [
  "sample-p001",
  "sample-p002",
  "sample-p003",
  "sample-p004",
  "sample-p005",
  "sample-p006",
];

const SAMPLE_TASK_IDS = [
  "sample-t001",
  "sample-t002",
  "sample-t003",
  "sample-t004",
  "sample-t005",
  "sample-t006",
];

const emptyExclusionData = {
  weapons: false,
  tobacco: false,
  adultEntertainment: false,
  gambling: false,
  forcedLabor: false,
  illegalLogging: false,
  radioactiveMaterials: false,
  hazardousChemicals: false,
  conflictMinerals: false,
  unlicensedWaste: false,
  coralReef: false,
  culturalHeritage: false,
  bannedActivities: false,
};

const getTriggeredPsIds = (triggerAnswers: Record<string, string>) =>
  preAssessmentQuestions
    .filter((question) => triggerAnswers[question.key] === "yes")
    .map((question) => question.triggeredPS);

const buildCategorizationDraft = (
  selectedSector: string,
  pcAnswers: Record<string, number>,
  triggerAnswers: Record<string, string>,
  psAnswers: Record<string, number>,
  ctxAnswers: Record<string, number>,
  ctrAnswers: Record<string, number>,
) => ({
  selectedSector,
  pcAnswers,
  triggerAnswers,
  psAnswers,
  ctxAnswers,
  ctrAnswers,
  scoringResult: computeScoringResult(
    selectedSector,
    pcAnswers,
    getTriggeredPsIds(triggerAnswers),
    psAnswers,
    ctxAnswers,
    ctrAnswers,
  ),
});

const essDraftOando = {
  projectData: {
    clientName: "Oando Plc",
    facilityType: "Project Finance",
    sector: "Extractives & Minerals Processing",
    subSector: "Oil & Gas Exploration & Production",
    projectLocation: "Rivers",
    projectType: "CAPEX",
    currency: "USD",
    estimatedAmount: "800",
    estimatedEmployees: "51-100",
  },
  exclusionData: emptyExclusionData,
  riskQuestions: {
    trig_labour: "",
    trig_pollution: "",
    trig_community: "",
    trig_land: "",
    trig_biodiversity: "",
    trig_indigenous: "",
    trig_cultural: "",
  },
};

const essDraftNestle = {
  projectData: {
    clientName: "Nestlé Nigeria Plc",
    facilityType: "Term Loan",
    sector: "Food & Beverage",
    subSector: "Food Retailers & Distributors",
    projectLocation: "Abia",
    projectType: "CAPEX",
    currency: "Naira",
    estimatedAmount: "3500",
    estimatedEmployees: "101-500",
  },
  exclusionData: emptyExclusionData,
  riskQuestions: {
    trig_labour: "yes",
    trig_pollution: "yes",
    trig_community: "no",
    trig_land: "no",
    trig_biodiversity: "no",
    trig_indigenous: "no",
    trig_cultural: "no",
  },
};

const categorizationNestle = buildCategorizationDraft(
  "Manufacturing — Chemicals, Textiles, Food Processing",
  {
    pc_type: 1,
    pc_investment_scale: 1,
    pc_workers: 1,
    pc_footprint: 1,
    pc_duration: 2,
    pc_irreversibility: 1,
  },
  essDraftNestle.riskQuestions,
  {
    ps1_esms: 1,
    ps1_esia: 1,
    ps1_officer: 1,
    ps1_incidents: 1,
    ps2_employees: 1,
    ps2_contracted: 1,
    ps2_migrant: 0,
    ps2_childforced: 0,
    ps2_disputes: 0,
    ps3_hazwaste: 1,
    ps3_wastewater: 1,
    ps3_ghg: 1,
    ps3_water: 1,
    ps3_chemicals: 1,
  },
  {
    ctx_governance: 1,
    ctx_enforcement: 1,
    ctx_conflict: 0,
    ctx_climate: 1,
    ctx_water: 1,
    ctx_ecosystems: 1,
  },
  {
    ctr_history: 1,
    ctr_esms: 1,
    ctr_capacity: 1,
    ctr_reporting: 1,
    ctr_covenants: 1,
  },
);

const essDraftJulius = {
  projectData: {
    clientName: "Julius Berger Nigeria Plc",
    facilityType: "Syndicated Loan",
    sector: "Infrastructure",
    subSector: "Engineering & Construction Services",
    projectLocation: "Ogun",
    projectType: "CAPEX",
    currency: "USD",
    estimatedAmount: "32000",
    estimatedEmployees: "500+",
  },
  exclusionData: emptyExclusionData,
  riskQuestions: {
    trig_labour: "yes",
    trig_pollution: "yes",
    trig_community: "yes",
    trig_land: "yes",
    trig_biodiversity: "no",
    trig_indigenous: "no",
    trig_cultural: "yes",
  },
};

const categorizationJulius = buildCategorizationDraft(
  "Large Infrastructure (Dams, Roads, Ports, Energy)",
  {
    pc_type: 3,
    pc_investment_scale: 3,
    pc_workers: 2,
    pc_footprint: 3,
    pc_duration: 3,
    pc_irreversibility: 2,
  },
  essDraftJulius.riskQuestions,
  {
    ps1_esms: 1,
    ps1_esia: 1,
    ps1_officer: 0,
    ps1_incidents: 1,
    ps2_employees: 2,
    ps2_contracted: 2,
    ps2_migrant: 1,
    ps2_childforced: 0,
    ps2_disputes: 1,
    ps3_hazwaste: 1,
    ps3_wastewater: 2,
    ps3_ghg: 2,
    ps3_water: 2,
    ps3_chemicals: 1,
    ps4_proximity: 2,
    ps4_infrastructure: 2,
    ps4_security: 1,
    ps4_disease: 1,
    ps4_opposition: 2,
    ps5_acquisition: 3,
    ps5_displacement: 2,
    ps5_livelihood: 2,
    ps5_informal: 1,
    ps8_sites: 1,
    ps8_disturbance: 1,
    ps8_archaeological: 2,
    ps8_intangible: 0,
  },
  {
    ctx_governance: 2,
    ctx_enforcement: 2,
    ctx_conflict: 1,
    ctx_climate: 2,
    ctx_water: 1,
    ctx_ecosystems: 1,
  },
  {
    ctr_history: 1,
    ctr_esms: 2,
    ctr_capacity: 1,
    ctr_reporting: 1,
    ctr_covenants: 1,
  },
);

const esddJulius = {
  formData: {
    managementCapacity: "Moderate",
    additionalNotes:
      "Client has existing HSE staff but requires stronger contractor oversight and grievance tracking.",
    keyRisks:
      "Temporary land acquisition and livelihood disruption; community traffic and road safety incidents; construction wastewater, dust and noise; labour influx and worker accommodation issues.",
    mitigationMeasures:
      "Prepare traffic management plan, RAP implementation tracker, wastewater control measures, stakeholder engagement log, and contractor labour management procedures.",
    siteVisitRecommended: "Yes",
    siteVisitReason:
      "Site visit required to validate settlement proximity, borrow pit management, and existing drainage controls along the corridor.",
    dueDiligenceSummary:
      "Project can proceed subject to strengthened land, community safety, contractor labour, and construction pollution controls before first disbursement.",
    esapRecommendations:
      "Include RAP milestones, community grievance redress, worker camp standards, spill response readiness, and monthly monitoring reports in ESAP.",
  },
};

const essDraftSeplat = {
  projectData: {
    clientName: "Seplat Energy Plc",
    facilityType: "Revolving Credit Facility",
    sector: "Extractives & Minerals Processing",
    subSector: "Oil & Gas Midstream",
    projectLocation: "Delta",
    projectType: "Working Capital",
    currency: "USD",
    estimatedAmount: "6200",
    estimatedEmployees: "101-500",
  },
  exclusionData: emptyExclusionData,
  riskQuestions: {
    trig_labour: "yes",
    trig_pollution: "yes",
    trig_community: "yes",
    trig_land: "no",
    trig_biodiversity: "yes",
    trig_indigenous: "no",
    trig_cultural: "no",
  },
};

const categorizationSeplat = buildCategorizationDraft(
  "Mining, Oil & Gas & Heavy Extractives",
  {
    pc_type: 2,
    pc_investment_scale: 2,
    pc_workers: 1,
    pc_footprint: 2,
    pc_duration: 2,
    pc_irreversibility: 2,
  },
  essDraftSeplat.riskQuestions,
  {
    ps1_esms: 1,
    ps1_esia: 1,
    ps1_officer: 1,
    ps1_incidents: 1,
    ps2_employees: 1,
    ps2_contracted: 1,
    ps2_migrant: 0,
    ps2_childforced: 0,
    ps2_disputes: 0,
    ps3_hazwaste: 2,
    ps3_wastewater: 2,
    ps3_ghg: 2,
    ps3_water: 2,
    ps3_chemicals: 2,
    ps4_proximity: 2,
    ps4_infrastructure: 1,
    ps4_security: 1,
    ps4_disease: 0,
    ps4_opposition: 1,
    ps6_habitat: 2,
    ps6_species: 1,
    ps6_ecosystem: 2,
    ps6_invasive: 0,
  },
  {
    ctx_governance: 2,
    ctx_enforcement: 1,
    ctx_conflict: 1,
    ctx_climate: 2,
    ctx_water: 2,
    ctx_ecosystems: 2,
  },
  {
    ctr_history: 1,
    ctr_esms: 1,
    ctr_capacity: 1,
    ctr_reporting: 1,
    ctr_covenants: 1,
  },
);

const esddSeplat = {
  formData: {
    managementCapacity: "Strong",
    additionalNotes:
      "Corporate E&S systems are established, but facility-specific biodiversity controls need tighter implementation evidence.",
    keyRisks:
      "Air emissions, hazardous materials handling, emergency preparedness, host community safety, and biodiversity sensitivity near the pipeline route.",
    mitigationMeasures:
      "Update emergency response drills, verify bund integrity, confirm habitat screening, and strengthen community incident notification workflow.",
    siteVisitRecommended: "Yes",
    siteVisitReason:
      "Verify storage integrity, flare stack controls, and sensitive habitat buffers around operational assets.",
    dueDiligenceSummary:
      "Client is broadly capable. Monitoring covenants should focus on pollution prevention, biodiversity management, and community emergency preparedness.",
    esapRecommendations:
      "Quarterly emissions reporting, biodiversity incident log, community emergency communication protocol, and secondary containment verification.",
  },
};

const esapSeplat = {
  actionItems: [
    {
      id: 1701,
      actionItem:
        "Update site-specific spill prevention and response procedure",
      ifcPsRef: "PS3",
      responsibleParty: "Client",
      timeline: "Short-term (1–3 months)",
      monitoringIndicator: "Signed spill response procedure and drill record",
    },
    {
      id: 1702,
      actionItem: "Implement biodiversity screening for maintenance activities",
      ifcPsRef: "PS6",
      responsibleParty: "Environmental Consultant",
      timeline: "Medium-term (3–6 months)",
      monitoringIndicator: "Approved screening checklist and monthly log",
    },
  ],
};

const essDraftAccess = {
  projectData: {
    clientName: "Access Bank Plc",
    facilityType: "Trade Finance",
    sector: "Financial",
    subSector: "Commercial Banking",
    projectLocation: "Lagos",
    projectType: "Working Capital",
    currency: "Naira",
    estimatedAmount: "4200",
    estimatedEmployees: "500+",
  },
  exclusionData: emptyExclusionData,
  riskQuestions: {
    trig_labour: "no",
    trig_pollution: "no",
    trig_community: "yes",
    trig_land: "no",
    trig_biodiversity: "no",
    trig_indigenous: "no",
    trig_cultural: "no",
  },
};

const categorizationAccess = buildCategorizationDraft(
  "Financial Intermediaries",
  {
    pc_type: 1,
    pc_investment_scale: 1,
    pc_workers: 1,
    pc_footprint: 0,
    pc_duration: 1,
    pc_irreversibility: 0,
  },
  essDraftAccess.riskQuestions,
  {
    ps1_esms: 1,
    ps1_esia: 0,
    ps1_officer: 1,
    ps1_incidents: 0,
    ps4_proximity: 1,
    ps4_infrastructure: 1,
    ps4_security: 1,
    ps4_disease: 0,
    ps4_opposition: 0,
  },
  {
    ctx_governance: 1,
    ctx_enforcement: 1,
    ctx_conflict: 0,
    ctx_climate: 0,
    ctx_water: 0,
    ctx_ecosystems: 0,
  },
  {
    ctr_history: 0,
    ctr_esms: 1,
    ctr_capacity: 1,
    ctr_reporting: 1,
    ctr_covenants: 1,
  },
);

const esddAccess = {
  formData: {
    managementCapacity: "Strong",
    additionalNotes:
      "Bank has portfolio-level ESG procedures and dedicated officers, with ongoing need for stronger sub-borrower escalation rules.",
    keyRisks:
      "Indirect portfolio exposure, third-party security incidents, and weak downstream borrower grievance handling for financed SMEs.",
    mitigationMeasures:
      "Strengthen sub-borrower screening triggers, quarterly covenant review, and escalation of repeated social incidents.",
    siteVisitRecommended: "No",
    siteVisitReason:
      "Current review is focused on intermediary controls rather than a single operating site.",
    dueDiligenceSummary:
      "Transaction is supportable with conditions tied to portfolio screening, incident escalation, and periodic ESG reporting.",
    esapRecommendations:
      "Enhance portfolio-level escalation matrix and borrower incident reporting thresholds.",
  },
};

const esapAccess = {
  actionItems: [
    {
      id: 1801,
      actionItem: "Update borrower ESG escalation matrix for repeat incidents",
      ifcPsRef: "PS1",
      responsibleParty: "Senior Risk Manager",
      timeline: "Immediate (0–30 days)",
      monitoringIndicator: "Approved matrix circulated to credit teams",
    },
    {
      id: 1802,
      actionItem: "Implement quarterly sub-borrower covenant exception review",
      ifcPsRef: "PS4",
      responsibleParty: "Head of Risk",
      timeline: "Ongoing",
      monitoringIndicator: "Quarterly exception review minutes",
    },
  ],
};

const appraisalAccess = {
  approvalDecision: "Approve with Conditions",
  approver: "Sarah Connor (Risk Manager)",
  approvalAuthority: "Head of Risk",
  finalComments:
    "Proceed subject to quarterly downstream portfolio exception reviews and covenant breach escalation reporting.",
};

const essDraftDangote = {
  projectData: {
    clientName: "Dangote Industries Ltd",
    facilityType: "Project Finance",
    sector: "Extractives & Minerals Processing",
    subSector: "Iron & Steel Producers",
    projectLocation: "Lagos",
    projectType: "CAPEX",
    currency: "USD",
    estimatedAmount: "15000",
    estimatedEmployees: "500+",
  },
  exclusionData: emptyExclusionData,
  riskQuestions: {
    trig_labour: "yes",
    trig_pollution: "yes",
    trig_community: "yes",
    trig_land: "yes",
    trig_biodiversity: "yes",
    trig_indigenous: "no",
    trig_cultural: "yes",
  },
};

const categorizationDangote = buildCategorizationDraft(
  "Mining, Oil & Gas & Heavy Extractives",
  {
    pc_type: 3,
    pc_investment_scale: 3,
    pc_workers: 3,
    pc_footprint: 3,
    pc_duration: 3,
    pc_irreversibility: 3,
  },
  essDraftDangote.riskQuestions,
  {
    ps1_esms: 1,
    ps1_esia: 1,
    ps1_officer: 0,
    ps1_incidents: 1,
    ps2_employees: 2,
    ps2_contracted: 2,
    ps2_migrant: 1,
    ps2_childforced: 0,
    ps2_disputes: 1,
    ps3_hazwaste: 3,
    ps3_wastewater: 3,
    ps3_ghg: 3,
    ps3_water: 2,
    ps3_chemicals: 3,
    ps4_proximity: 2,
    ps4_infrastructure: 2,
    ps4_security: 1,
    ps4_disease: 1,
    ps4_opposition: 2,
    ps5_acquisition: 3,
    ps5_displacement: 3,
    ps5_livelihood: 2,
    ps5_informal: 1,
    ps6_habitat: 2,
    ps6_species: 2,
    ps6_ecosystem: 2,
    ps6_invasive: 1,
    ps8_sites: 1,
    ps8_disturbance: 1,
    ps8_archaeological: 1,
    ps8_intangible: 0,
  },
  {
    ctx_governance: 2,
    ctx_enforcement: 2,
    ctx_conflict: 1,
    ctx_climate: 2,
    ctx_water: 2,
    ctx_ecosystems: 2,
  },
  {
    ctr_history: 2,
    ctr_esms: 2,
    ctr_capacity: 2,
    ctr_reporting: 2,
    ctr_covenants: 2,
  },
);

const esddDangote = {
  formData: {
    managementCapacity: "Moderate",
    additionalNotes:
      "Corporate systems exist but implementation maturity varies across operating sites and contractors.",
    keyRisks:
      "Large-scale emissions, wastewater discharge, significant traffic and community safety exposure, land access and livelihood disruption, biodiversity disturbance, and contractor labour welfare.",
    mitigationMeasures:
      "Tighten emissions controls, install discharge monitoring, implement livelihood restoration tracking, enforce contractor labour standards, and intensify community engagement.",
    siteVisitRecommended: "Yes",
    siteVisitReason:
      "Site verification needed for stack emissions, drainage channels, community buffer zones, and land interface.",
    dueDiligenceSummary:
      "High-risk project requiring close supervision and multiple pre-disbursement conditions before full mobilisation.",
    esapRecommendations:
      "Monthly monitoring, third-party audit of high-risk controls, RAP progress reporting, and contractor HSE compliance verification.",
  },
};

const esapDangote = {
  actionItems: [
    {
      id: 1901,
      actionItem:
        "Complete baseline air emissions and wastewater monitoring plan",
      ifcPsRef: "PS3",
      responsibleParty: "Environmental Consultant",
      timeline: "Immediate (0–30 days)",
      monitoringIndicator: "Approved baseline monitoring plan",
    },
    {
      id: 1902,
      actionItem: "Submit livelihood restoration implementation tracker",
      ifcPsRef: "PS5",
      responsibleParty: "Client",
      timeline: "Short-term (1–3 months)",
      monitoringIndicator: "Tracker reviewed and accepted by BOI ESG team",
    },
  ],
};

const appraisalDangote = {
  approvalDecision: "Approve with Conditions",
  approver: "Emily Chen (ESG Specialist)",
  approvalAuthority: "Chief Risk Officer",
  finalComments:
    "Maintain high-frequency monitoring and pre-disbursement closure of land, emissions, and contractor controls.",
};

const sampleProjects = [
  {
    id: "sample-p001",
    client: "Dangote Industries Ltd",
    project: "Cement Plant Capacity Expansion",
    sector: "Extractives & Minerals Processing",
    location: "Lagos",
    riskCategory: "A",
    facilityType: "Project Finance",
    employees: "500+",
    estimatedAmount: 15000,
    date: "2025-10-12",
    currentStepPath: "monitoring",
    stepNumber: 6,
    progress: 95,
    isDraft: false,
    draftData: {
      ess: essDraftDangote,
      categorization: categorizationDangote,
      esdd: esddDangote,
      esap: esapDangote,
      appraisal: appraisalDangote,
    },
  },
  {
    id: "sample-p002",
    client: "Access Bank Plc",
    project: "Agribusiness Loan Portfolio",
    sector: "Food & Beverage",
    location: "Abuja",
    riskCategory: "B",
    facilityType: "Trade Finance",
    employees: "101-500",
    estimatedAmount: 4200,
    date: "2025-11-04",
    currentStepPath: "appraisal",
    stepNumber: 5,
    progress: 78,
    isDraft: false,
    draftData: {
      ess: essDraftAccess,
      categorization: categorizationAccess,
      esdd: esddAccess,
      esap: esapAccess,
      appraisal: appraisalAccess,
    },
  },
  {
    id: "sample-p003",
    client: "Seplat Energy Plc",
    project: "Midstream Integrity Upgrade Programme",
    sector: "Extractives & Minerals Processing",
    location: "Delta",
    riskCategory: "B",
    facilityType: "Revolving Credit Facility",
    employees: "101-500",
    estimatedAmount: 6200,
    date: "2025-12-01",
    currentStepPath: "esap",
    stepNumber: 4,
    progress: 64,
    isDraft: false,
    draftData: {
      ess: essDraftSeplat,
      categorization: categorizationSeplat,
      esdd: esddSeplat,
      esap: esapSeplat,
    },
  },
  {
    id: "sample-p004",
    client: "Julius Berger Nigeria Plc",
    project: "Lagos-Ibadan Highway Upgrade",
    sector: "Infrastructure",
    location: "Ogun",
    riskCategory: "A",
    facilityType: "Syndicated Loan",
    employees: "500+",
    estimatedAmount: 32000,
    date: "2026-01-15",
    currentStepPath: "esdd",
    stepNumber: 3,
    progress: 47,
    isDraft: false,
    draftData: {
      ess: essDraftJulius,
      categorization: categorizationJulius,
      esdd: esddJulius,
    },
  },
  {
    id: "sample-p005",
    client: "Nestlé Nigeria Plc",
    project: "Food Processing Plant Upgrade",
    sector: "Food & Beverage",
    location: "Abia",
    riskCategory: "B",
    facilityType: "Term Loan",
    employees: "101-500",
    estimatedAmount: 3500,
    date: "2026-02-03",
    currentStepPath: "categorization",
    stepNumber: 2,
    progress: 26,
    isDraft: false,
    draftData: {
      ess: essDraftNestle,
      categorization: categorizationNestle,
    },
  },
  {
    id: "sample-p006",
    client: "Oando Plc",
    project: "Upstream Oil Exploration Block OML-125",
    sector: "Extractives & Minerals Processing",
    location: "Rivers",
    riskCategory: "C",
    facilityType: "Project Finance",
    employees: "51-100",
    estimatedAmount: 800,
    date: "2026-03-07",
    currentStepPath: "ess",
    stepNumber: 1,
    progress: 8,
    isDraft: true,
    draftData: {
      ess: essDraftOando,
    },
  },
];

const sampleTasks: PendingTask[] = [
  {
    id: "sample-t001",
    projectId: "sample-p006",
    projectName: "Cement Plant Capacity Expansion",
    clientName: "Dangote Industries Ltd",
    currentStep: "Monitoring & Supervision",
    priority: "High",
    dueDate: "2026-03-20",
    assignedBy: "Sarah Johnson",
    status: "In Progress",
  },
  {
    id: "sample-t002",
    projectId: "sample-p003",
    projectName: "Lagos-Ibadan Highway Upgrade",
    clientName: "Julius Berger Nigeria Plc",
    currentStep: "E&S Due Diligence",
    priority: "High",
    dueDate: "2026-03-18",
    assignedBy: "Michael Chen",
    status: "Awaiting Approval",
  },
  {
    id: "sample-t003",
    projectId: "sample-p005",
    projectName: "Agribusiness Loan Portfolio",
    clientName: "Access Bank Plc",
    currentStep: "Appraisal & Conditions",
    priority: "Medium",
    dueDate: "2026-03-25",
    assignedBy: "David Wilson",
    status: "Pending Review",
  },
  {
    id: "sample-t004",
    projectId: "sample-p004",
    projectName: "Midstream Integrity Upgrade Programme",
    clientName: "Seplat Energy Plc",
    currentStep: "Environmental & Social Action Plan",
    priority: "Medium",
    dueDate: "2026-04-01",
    assignedBy: "Emma Davis",
    status: "Pending Review",
  },
  {
    id: "sample-t005",
    projectId: "sample-p002",
    projectName: "Food Processing Plant Upgrade",
    clientName: "Nestlé Nigeria Plc",
    currentStep: "Risk Categorization",
    priority: "Medium",
    dueDate: "2026-04-06",
    assignedBy: "Emma Davis",
    status: "Pending Review",
  },
  {
    id: "sample-t006",
    projectId: "sample-p001",
    projectName: "Upstream Oil Exploration Block OML-125",
    clientName: "Oando Plc",
    currentStep: "E&S Screening",
    priority: "Low",
    dueDate: "2026-04-10",
    assignedBy: "You",
    status: "Overdue",
  },
];

interface EsrmState {
  projects: any[];
  tasks: PendingTask[];
  currentProjectId: string | null;
  scoringResult: ScoringResult | null;
  setCurrentProject: (id: string | null) => void;
  addProject: (project: any) => void;
  updateProject: (id: string | number, updates: any) => void;
  removeProject: (id: string) => void;
  addTask: (task: PendingTask) => void;
  removeTask: (id: string) => void;
  setScoringResult: (result: ScoringResult | null) => void;
  clearScoringResult: () => void;
}

const mergeSampleProjects = (projects: any[] = []) => [
  ...sampleProjects,
  ...projects.filter((project) => !SAMPLE_PROJECT_IDS.includes(project.id)),
];

const mergeSampleTasks = (tasks: PendingTask[] = []) => [
  ...sampleTasks,
  ...tasks.filter((task) => !SAMPLE_TASK_IDS.includes(task.id)),
];

const createClearedPersistedState = () => ({
  projects: [],
  tasks: [],
  currentProjectId: null,
  scoringResult: null,
});

const isTaskForProject = (task: PendingTask, project: any) =>
  task.projectId === project.id ||
  (!task.projectId &&
    task.projectName === project.project &&
    task.clientName === project.client);

export const useEsrmStore = create<EsrmState>()(
  persist(
    (set) => ({
      projects: mergeSampleProjects(),
      tasks: mergeSampleTasks(),
      currentProjectId: null,
      scoringResult: null,
      setCurrentProject: (id) => set({ currentProjectId: id }),
      addProject: (p) => set((state) => ({ projects: [p, ...state.projects] })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),
      removeProject: (id) =>
        set((state) => {
          const projectToRemove = state.projects.find((p) => p.id === id);

          return {
            projects: state.projects.filter((p) => p.id !== id),
            tasks: projectToRemove
              ? state.tasks.filter(
                  (task) => !isTaskForProject(task, projectToRemove),
                )
              : state.tasks,
            currentProjectId:
              state.currentProjectId === id ? null : state.currentProjectId,
          };
        }),
      addTask: (t) => set((state) => ({ tasks: [t, ...state.tasks] })),
      removeTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
      setScoringResult: (result) => set({ scoringResult: result }),
      clearScoringResult: () => set({ scoringResult: null }),
    }),
    {
      name: "esrm-storage",
      version: 5,
      migrate: (persistedState: any, version: number) => {
        if (version < 5) {
          return createClearedPersistedState();
        }
        return persistedState;
      },
    },
  ),
);
