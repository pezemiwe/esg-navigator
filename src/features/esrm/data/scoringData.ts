// ─────────────────────────────────────────────────────────────────────────────
// BRD/FRD-aligned ESRM Scoring Data
// IFC Performance Standards PS1–PS8 · 5-Dimension Weighted Scoring Model
// ─────────────────────────────────────────────────────────────────────────────

// ── D1: Sector / Activity Risk (weight 15%) ─────────────────────────────────

export interface SectorScore {
  label: string;
  score: number; // fixed 1–5
}

export const sectorScores: SectorScore[] = [
  { label: "Agriculture, Forestry & Fishing", score: 4 },
  { label: "Mining & Extractives", score: 5 },
  { label: "Oil & Gas", score: 5 },
  { label: "Manufacturing (Heavy / Chemical)", score: 4 },
  { label: "Manufacturing (Light / Consumer)", score: 2 },
  { label: "Construction & Real Estate", score: 3 },
  { label: "Energy (Renewables)", score: 3 },
  { label: "Energy (Thermal / Fossil Fuel)", score: 5 },
  { label: "Transport & Logistics", score: 3 },
  { label: "Financial Services & Insurance", score: 1 },
  { label: "Information Technology & Telecoms", score: 1 },
];

// ── D2: Project Characteristics (weight 20%) ────────────────────────────────

export interface ScoredOption {
  label: string;
  value: number; // 1–3
}

export interface ScoredQuestion {
  key: string;
  text: string;
  options: ScoredOption[];
}

export const projectCharacteristicsQuestions: ScoredQuestion[] = [
  {
    key: "pc_scale",
    text: "What is the scale of the project?",
    options: [
      { label: "Small / localised", value: 1 },
      { label: "Medium / regional", value: 2 },
      { label: "Large / national or cross-border", value: 3 },
    ],
  },
  {
    key: "pc_duration",
    text: "What is the expected duration of the project?",
    options: [
      { label: "Short-term (< 1 year)", value: 1 },
      { label: "Medium-term (1–5 years)", value: 2 },
      { label: "Long-term (> 5 years)", value: 3 },
    ],
  },
  {
    key: "pc_technology",
    text: "Does the project use new or unproven technology?",
    options: [
      { label: "Established / proven technology", value: 1 },
      { label: "Moderately new technology", value: 2 },
      { label: "Highly novel or unproven technology", value: 3 },
    ],
  },
  {
    key: "pc_workforce",
    text: "How large is the project workforce?",
    options: [
      { label: "< 50 workers", value: 1 },
      { label: "50–500 workers", value: 2 },
      { label: "> 500 workers", value: 3 },
    ],
  },
  {
    key: "pc_hazmat",
    text: "Does the project involve hazardous materials, emissions or waste?",
    options: [
      { label: "None or negligible", value: 1 },
      { label: "Moderate quantities / managed", value: 2 },
      { label: "Significant quantities / high risk", value: 3 },
    ],
  },
  {
    key: "pc_greenfield",
    text: "Is the project greenfield or located in a sensitive area?",
    options: [
      { label: "Brownfield / existing site", value: 1 },
      { label: "Greenfield / low sensitivity", value: 2 },
      { label: "Greenfield in sensitive or protected area", value: 3 },
    ],
  },
];

export const D2_MAX_RAW = projectCharacteristicsQuestions.length * 3; // 18

// ── Pre-Assessment Screening (7 binary trigger questions) ───────────────────

export interface TriggerQuestion {
  key: string;
  text: string;
  triggeredPS: string; // e.g. "ps2"
}

export const preAssessmentQuestions: TriggerQuestion[] = [
  {
    key: "trig_labour",
    text: "Will the project create significant employment or use contracted / migrant labour?",
    triggeredPS: "ps2",
  },
  {
    key: "trig_pollution",
    text: "Could the project generate significant pollution, emissions, effluents, or waste?",
    triggeredPS: "ps3",
  },
  {
    key: "trig_community",
    text: "Is the project located near communities or could it pose community health / safety risks?",
    triggeredPS: "ps4",
  },
  {
    key: "trig_land",
    text: "Will the project require land acquisition, resettlement, or restrict access to resources?",
    triggeredPS: "ps5",
  },
  {
    key: "trig_biodiversity",
    text: "Is the project in or near areas of high biodiversity value or critical habitats?",
    triggeredPS: "ps6",
  },
  {
    key: "trig_indigenous",
    text: "Will the project affect Indigenous Peoples, customary land users, or traditional communities?",
    triggeredPS: "ps7",
  },
  {
    key: "trig_cultural",
    text: "Are there known cultural, religious, or archaeological heritage sites in the project area?",
    triggeredPS: "ps8",
  },
];

// ── D3: PS Detailed Questionnaire (weight 40%) ─────────────────────────────
// Each PS has multi-option questions scored 0–3.
// PS1 is always assessed; PS2–PS8 only if triggered by pre-assessment.

export interface PSDetailedQuestion {
  key: string;
  text: string;
  options: ScoredOption[];
}

export interface PSQuestionnaire {
  id: string;
  title: string;
  shortTitle: string;
  maxRaw: number;
  questions: PSDetailedQuestion[];
}

const threeOptions: ScoredOption[] = [
  { label: "Low / Negligible", value: 1 },
  { label: "Moderate", value: 2 },
  { label: "High / Significant", value: 3 },
];

export const psQuestionnaires: PSQuestionnaire[] = [
  {
    id: "ps1",
    title: "PS1: Assessment & Management of E&S Risks and Impacts",
    shortTitle: "PS1 – E&S Management",
    maxRaw: 9,
    questions: [
      {
        key: "ps1_d_q1",
        text: "Does the project pose potentially significant adverse environmental and social risks?",
        options: threeOptions,
      },
      {
        key: "ps1_d_q2",
        text: "Has the client conducted a prior Environmental and Social Impact Assessment (ESIA)?",
        options: [
          { label: "Yes – comprehensive", value: 1 },
          { label: "Partial / outdated", value: 2 },
          { label: "No ESIA conducted", value: 3 },
        ],
      },
      {
        key: "ps1_d_q3",
        text: "Does the client have an Environmental and Social Management System (ESMS)?",
        options: [
          { label: "Certified / robust ESMS", value: 1 },
          { label: "Informal or partial ESMS", value: 2 },
          { label: "No ESMS in place", value: 3 },
        ],
      },
    ],
  },
  {
    id: "ps2",
    title: "PS2: Labor and Working Conditions",
    shortTitle: "PS2 – Labour",
    maxRaw: 13,
    questions: [
      {
        key: "ps2_d_q1",
        text: "Does the client have documented HR policies compliant with national labour law?",
        options: [
          { label: "Fully compliant", value: 1 },
          { label: "Partially compliant", value: 2 },
          { label: "No formal policies", value: 3 },
        ],
      },
      {
        key: "ps2_d_q2",
        text: "Are there occupational health and safety (OHS) management procedures in place?",
        options: threeOptions,
      },
      {
        key: "ps2_d_q3",
        text: "Does the project use or plan to use contracted, temporary, or migrant workers?",
        options: [
          { label: "No contracted/migrant workers", value: 1 },
          { label: "Some contracted workers with oversight", value: 2 },
          { label: "Significant use of contracted/migrant workers", value: 3 },
        ],
      },
      {
        key: "ps2_d_q4",
        text: "Is there a grievance mechanism accessible to all workers?",
        options: [
          { label: "Functional and accessible", value: 1 },
          { label: "Exists but not well known", value: 2 },
          { label: "Does not exist", value: 3 },
        ],
      },
      {
        key: "ps2_d_q5",
        text: "Is there any risk of child labour or forced labour in the supply chain?",
        options: [
          { label: "No risk identified", value: 1 },
          { label: "Low risk with some monitoring", value: 2 },
          { label: "Elevated risk / gaps in monitoring", value: 3 },
        ],
      },
    ],
  },
  {
    id: "ps3",
    title: "PS3: Resource Efficiency and Pollution Prevention",
    shortTitle: "PS3 – Pollution",
    maxRaw: 14,
    questions: [
      {
        key: "ps3_d_q1",
        text: "Will the project generate significant greenhouse gas (GHG) emissions?",
        options: threeOptions,
      },
      {
        key: "ps3_d_q2",
        text: "Does the project consume large quantities of water or energy?",
        options: threeOptions,
      },
      {
        key: "ps3_d_q3",
        text: "Will the project produce hazardous or non-hazardous waste in significant volumes?",
        options: threeOptions,
      },
      {
        key: "ps3_d_q4",
        text: "Are pollution prevention and abatement measures in place?",
        options: [
          { label: "Comprehensive measures", value: 1 },
          { label: "Partial measures", value: 2 },
          { label: "No measures", value: 3 },
        ],
      },
      {
        key: "ps3_d_q5",
        text: "Does the project involve use of pesticides or hazardous chemicals?",
        options: [
          { label: "None", value: 1 },
          { label: "Limited / managed use", value: 2 },
          { label: "Significant use", value: 3 },
        ],
      },
    ],
  },
  {
    id: "ps4",
    title: "PS4: Community Health, Safety, and Security",
    shortTitle: "PS4 – Community",
    maxRaw: 12,
    questions: [
      {
        key: "ps4_d_q1",
        text: "Could project activities pose health and safety risks to nearby communities?",
        options: threeOptions,
      },
      {
        key: "ps4_d_q2",
        text: "Does the project require private or public security forces?",
        options: [
          { label: "No security needed", value: 1 },
          { label: "Minor security arrangements", value: 2 },
          { label: "Significant security deployment", value: 3 },
        ],
      },
      {
        key: "ps4_d_q3",
        text: "Is there a risk of increased traffic, noise, or vibration affecting communities?",
        options: threeOptions,
      },
      {
        key: "ps4_d_q4",
        text: "Does the project have an emergency preparedness and response plan?",
        options: [
          { label: "Comprehensive plan tested", value: 1 },
          { label: "Plan exists but untested", value: 2 },
          { label: "No plan in place", value: 3 },
        ],
      },
    ],
  },
  {
    id: "ps5",
    title: "PS5: Land Acquisition and Involuntary Resettlement",
    shortTitle: "PS5 – Land / Resettlement",
    maxRaw: 12,
    questions: [
      {
        key: "ps5_d_q1",
        text: "Will the project require physical displacement of households or businesses?",
        options: [
          { label: "None", value: 1 },
          { label: "Limited displacement with RAP", value: 2 },
          { label: "Significant displacement", value: 3 },
        ],
      },
      {
        key: "ps5_d_q2",
        text: "Will the project cause economic displacement (loss of income or livelihood)?",
        options: threeOptions,
      },
      {
        key: "ps5_d_q3",
        text: "Will the project restrict access to natural resources or legally designated areas?",
        options: threeOptions,
      },
      {
        key: "ps5_d_q4",
        text: "Has a Resettlement Action Plan (RAP) or Livelihood Restoration Plan been prepared?",
        options: [
          { label: "Completed and approved", value: 1 },
          { label: "In preparation", value: 2 },
          { label: "Not developed", value: 3 },
        ],
      },
    ],
  },
  {
    id: "ps6",
    title:
      "PS6: Biodiversity Conservation and Sustainable Management of Living Natural Resources",
    shortTitle: "PS6 – Biodiversity",
    maxRaw: 14,
    questions: [
      {
        key: "ps6_d_q1",
        text: "Is the project located in or near a critical habitat or area of high biodiversity value?",
        options: [
          { label: "No sensitive areas", value: 1 },
          { label: "Near modified habitats", value: 2 },
          { label: "In or adjacent to critical habitat", value: 3 },
        ],
      },
      {
        key: "ps6_d_q2",
        text: "Could project activities affect endangered or legally protected species?",
        options: threeOptions,
      },
      {
        key: "ps6_d_q3",
        text: "Does the project involve land clearing, deforestation, or wetland conversion?",
        options: [
          { label: "None", value: 1 },
          { label: "Limited clearing", value: 2 },
          { label: "Large-scale clearing", value: 3 },
        ],
      },
      {
        key: "ps6_d_q4",
        text: "Is there a Biodiversity Management Plan or offset programme?",
        options: [
          { label: "Comprehensive plan", value: 1 },
          { label: "Partial plan", value: 2 },
          { label: "None", value: 3 },
        ],
      },
      {
        key: "ps6_d_q5",
        text: "Does the project affect ecosystem services that local communities depend upon?",
        options: threeOptions,
      },
    ],
  },
  {
    id: "ps7",
    title: "PS7: Indigenous Peoples",
    shortTitle: "PS7 – Indigenous Peoples",
    maxRaw: 12,
    questions: [
      {
        key: "ps7_d_q1",
        text: "Will the project affect Indigenous Peoples or communities with collective attachment to the project area?",
        options: [
          { label: "No IP communities", value: 1 },
          { label: "IP present but limited impact", value: 2 },
          { label: "Significant impact on IP", value: 3 },
        ],
      },
      {
        key: "ps7_d_q2",
        text: "Has Free, Prior and Informed Consent (FPIC) been obtained?",
        options: [
          { label: "FPIC obtained and documented", value: 1 },
          { label: "Consultation ongoing", value: 2 },
          { label: "No FPIC process initiated", value: 3 },
        ],
      },
      {
        key: "ps7_d_q3",
        text: "Will the project affect land or resources traditionally owned or customarily used by IP?",
        options: threeOptions,
      },
      {
        key: "ps7_d_q4",
        text: "Has an Indigenous Peoples Plan (IPP) been developed?",
        options: [
          { label: "IPP completed", value: 1 },
          { label: "In preparation", value: 2 },
          { label: "Not developed", value: 3 },
        ],
      },
    ],
  },
  {
    id: "ps8",
    title: "PS8: Cultural Heritage",
    shortTitle: "PS8 – Cultural Heritage",
    maxRaw: 11,
    questions: [
      {
        key: "ps8_d_q1",
        text: "Are there known cultural, religious, or archaeological sites within the project area?",
        options: [
          { label: "None identified", value: 1 },
          { label: "Minor sites", value: 2 },
          { label: "Significant heritage sites", value: 3 },
        ],
      },
      {
        key: "ps8_d_q2",
        text: "Could the project disturb, damage, or remove tangible cultural heritage?",
        options: threeOptions,
      },
      {
        key: "ps8_d_q3",
        text: "Will the project affect intangible cultural heritage or traditional practices?",
        options: threeOptions,
      },
      {
        key: "ps8_d_q4",
        text: "Is a chance-finds procedure or Cultural Heritage Management Plan in place?",
        options: [
          { label: "In place and tested", value: 1 },
          { label: "In preparation", value: 2 },
          { label: "None", value: 3 },
        ],
      },
    ],
  },
];

// ── D4: Context & Location Risk (weight 15%) ────────────────────────────────

export const contextQuestions: ScoredQuestion[] = [
  {
    key: "ctx_governance",
    text: "How would you rate the governance and regulatory capacity in the project location?",
    options: [
      { label: "Strong governance & enforcement", value: 1 },
      { label: "Moderate / developing governance", value: 2 },
      { label: "Weak governance / limited enforcement", value: 3 },
    ],
  },
  {
    key: "ctx_conflict",
    text: "Is the project located in or near a conflict-affected or fragile area?",
    options: [
      { label: "Stable / no conflict", value: 1 },
      { label: "Periodic tensions", value: 2 },
      { label: "Active conflict or fragile state", value: 3 },
    ],
  },
  {
    key: "ctx_environmental",
    text: "Is the area environmentally sensitive (flood-prone, arid, protected zones)?",
    options: [
      { label: "Low sensitivity", value: 1 },
      { label: "Moderate sensitivity", value: 2 },
      { label: "High sensitivity / protected area", value: 3 },
    ],
  },
  {
    key: "ctx_social",
    text: "Are there vulnerable or marginalised social groups in the project area?",
    options: [
      { label: "No vulnerable groups", value: 1 },
      { label: "Some vulnerable groups present", value: 2 },
      { label: "Significant vulnerable populations", value: 3 },
    ],
  },
  {
    key: "ctx_infrastructure",
    text: "Is environmental or social infrastructure (waste, water, health) adequate?",
    options: [
      { label: "Adequate infrastructure", value: 1 },
      { label: "Limited infrastructure", value: 2 },
      { label: "Severely lacking", value: 3 },
    ],
  },
  {
    key: "ctx_cumulative",
    text: "Are there cumulative impacts from other industrial or development activities nearby?",
    options: [
      { label: "None / minimal", value: 1 },
      { label: "Some existing activities", value: 2 },
      { label: "Significant cumulative impact zone", value: 3 },
    ],
  },
];

export const D4_MAX_RAW = contextQuestions.length * 3; // 18

// ── D5: Client Track Record (weight 10%) ────────────────────────────────────

export const clientTrackRecordQuestions: ScoredQuestion[] = [
  {
    key: "ctr_history",
    text: "Has the client been involved in previous E&S non-compliance incidents?",
    options: [
      { label: "No incidents", value: 1 },
      { label: "Minor incidents resolved", value: 2 },
      { label: "Major violations or repeated incidents", value: 3 },
    ],
  },
  {
    key: "ctr_capacity",
    text: "Does the client have dedicated E&S staff or management capacity?",
    options: [
      { label: "Dedicated E&S team", value: 1 },
      { label: "Part-time or shared responsibility", value: 2 },
      { label: "No E&S capacity", value: 3 },
    ],
  },
  {
    key: "ctr_reporting",
    text: "Does the client produce regular E&S monitoring or sustainability reports?",
    options: [
      { label: "Regular published reports", value: 1 },
      { label: "Occasional internal reports", value: 2 },
      { label: "No reporting", value: 3 },
    ],
  },
  {
    key: "ctr_engagement",
    text: "How responsive has the client been to stakeholder engagement and feedback?",
    options: [
      { label: "Proactive and transparent", value: 1 },
      { label: "Reactive / limited engagement", value: 2 },
      { label: "Unresponsive or hostile", value: 3 },
    ],
  },
  {
    key: "ctr_remediation",
    text: "Has the client demonstrated willingness to invest in E&S mitigation / remediation?",
    options: [
      { label: "Strong commitment and investment", value: 1 },
      { label: "Some willingness", value: 2 },
      { label: "Resistant or unwilling", value: 3 },
    ],
  },
];

export const D5_MAX_RAW = clientTrackRecordQuestions.length * 3; // 15

// ── Dimension Weights ───────────────────────────────────────────────────────

export const DIMENSION_WEIGHTS = {
  D1: 0.15,
  D2: 0.2,
  D3: 0.4,
  D4: 0.15,
  D5: 0.1,
} as const;

// ── Category Thresholds ─────────────────────────────────────────────────────

export const CATEGORY_THRESHOLDS = {
  A: 3.5, // ≥ 3.5 → Category A (High Risk)
  B: 2.0, // ≥ 2.0 → Category B (Medium Risk)
  // < 2.0 → Category C (Low Risk)
} as const;

// ── Required Actions per Category ───────────────────────────────────────────

export const categoryActions: Record<string, string[]> = {
  A: [
    "Full Environmental and Social Impact Assessment (ESIA) required",
    "Independent review by qualified E&S consultant",
    "Detailed Environmental and Social Action Plan (ESAP)",
    "Board or Executive Committee approval required",
    "Ongoing monitoring with quarterly reporting",
    "Stakeholder engagement and disclosure plan",
  ],
  B: [
    "Limited E&S assessment or audit required",
    "Environmental and Social Action Plan (ESAP)",
    "Senior Risk Manager approval required",
    "Semi-annual monitoring and reporting",
    "Targeted stakeholder consultation",
  ],
  C: [
    "Standard E&S due diligence review",
    "ESG Officer sign-off sufficient",
    "Annual monitoring check",
  ],
};

// ── Demo Auto-Fill Data ─────────────────────────────────────────────────────

export const demoAutoFill = {
  sector: "Construction & Real Estate",
  projectCharacteristics: {
    pc_scale: 2,
    pc_duration: 2,
    pc_technology: 1,
    pc_workforce: 3,
    pc_hazmat: 2,
    pc_greenfield: 3,
  } as Record<string, number>,
  preAssessment: {
    trig_labour: "yes",
    trig_pollution: "yes",
    trig_community: "yes",
    trig_land: "yes",
    trig_biodiversity: "no",
    trig_indigenous: "no",
    trig_cultural: "yes",
  } as Record<string, string>,
  psAnswers: {
    // PS1 (always)
    ps1_d_q1: 2,
    ps1_d_q2: 2,
    ps1_d_q3: 2,
    // PS2 (triggered)
    ps2_d_q1: 2,
    ps2_d_q2: 2,
    ps2_d_q3: 2,
    ps2_d_q4: 2,
    ps2_d_q5: 1,
    // PS3 (triggered)
    ps3_d_q1: 2,
    ps3_d_q2: 2,
    ps3_d_q3: 2,
    ps3_d_q4: 2,
    ps3_d_q5: 1,
    // PS4 (triggered)
    ps4_d_q1: 2,
    ps4_d_q2: 1,
    ps4_d_q3: 2,
    ps4_d_q4: 2,
    // PS5 (triggered)
    ps5_d_q1: 3,
    ps5_d_q2: 2,
    ps5_d_q3: 2,
    ps5_d_q4: 2,
    // PS8 (triggered)
    ps8_d_q1: 2,
    ps8_d_q2: 1,
    ps8_d_q3: 1,
    ps8_d_q4: 2,
  } as Record<string, number>,
  context: {
    ctx_governance: 2,
    ctx_conflict: 1,
    ctx_environmental: 2,
    ctx_social: 2,
    ctx_infrastructure: 2,
    ctx_cumulative: 2,
  } as Record<string, number>,
  clientTrackRecord: {
    ctr_history: 2,
    ctr_capacity: 2,
    ctr_reporting: 2,
    ctr_engagement: 1,
    ctr_remediation: 1,
  } as Record<string, number>,
};
