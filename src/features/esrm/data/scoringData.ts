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
  { label: "Mining, Oil & Gas & Heavy Extractives", score: 5 },
  { label: "Large Infrastructure (Dams, Roads, Ports, Energy)", score: 5 },
  { label: "Agriculture, Forestry & Fishing (Large Scale)", score: 4 },
  { label: "Manufacturing — Chemicals, Textiles, Food Processing", score: 4 },
  { label: "Construction (Large Scale)", score: 4 },
  { label: "Tourism & Hospitality (Sensitive Locations)", score: 3 },
  { label: "Light Manufacturing & Assembly", score: 3 },
  { label: "Agribusiness (Small\u2013Medium Scale)", score: 2 },
  { label: "Healthcare, Education & Services", score: 2 },
  { label: "Financial Intermediaries", score: 2 },
  { label: "Retail, Trading, IT & Telecoms", score: 1 },
];

// ── D2: Project Characteristics (weight 20%) ────────────────────────────────

export interface ScoredOption {
  label: string;
  value: number; // 0–3 (0 = no risk, 3 = high risk)
}

export interface ScoredQuestion {
  key: string;
  text: string;
  options: ScoredOption[];
}

export const projectCharacteristicsQuestions: ScoredQuestion[] = [
  {
    key: "pc_type",
    text: "What is the project type?",
    options: [
      { label: "Rehabilitation / upgrade of existing facility", value: 0 },
      { label: "Expansion of existing operations", value: 1 },
      { label: "Greenfield on previously disturbed land", value: 2 },
      { label: "Greenfield on virgin / sensitive land", value: 3 },
    ],
  },
  {
    key: "pc_investment_scale",
    text: "What is the investment scale?",
    options: [
      { label: "< $10 million", value: 0 },
      { label: "$10 – $50 million", value: 1 },
      { label: "$50 – $200 million", value: 2 },
      { label: "> $200 million", value: 3 },
    ],
  },
  {
    key: "pc_workers",
    text: "How large is the project workforce (direct and contracted)?",
    options: [
      { label: "< 100 workers", value: 0 },
      { label: "100 – 1,000 workers", value: 1 },
      { label: "> 1,000 workers", value: 2 },
      {
        label: "> 1,000 workers with significant migrant / contracted labour",
        value: 3,
      },
    ],
  },
  {
    key: "pc_footprint",
    text: "What is the physical footprint of the project?",
    options: [
      { label: "Small / contained within existing site boundary", value: 0 },
      { label: "Medium / limited new land take", value: 1 },
      { label: "Large / significant new land take", value: 2 },
      {
        label: "Very large / linear infrastructure crossing multiple land uses",
        value: 3,
      },
    ],
  },
  {
    key: "pc_duration",
    text: "What is the expected operational lifespan of the project?",
    options: [
      { label: "< 3 years", value: 0 },
      { label: "3 – 10 years", value: 1 },
      { label: "> 10 years", value: 2 },
      {
        label: "> 10 years with permanent / irreversible infrastructure",
        value: 3,
      },
    ],
  },
  {
    key: "pc_irreversibility",
    text: "How reversible are the potential environmental and social impacts?",
    options: [
      {
        label: "Fully reversible — impacts cease when activity stops",
        value: 0,
      },
      { label: "Mostly reversible with mitigation measures", value: 1 },
      { label: "Partially irreversible — long recovery time", value: 2 },
      {
        label:
          "Irreversible — permanent loss of habitat, livelihoods, or heritage",
        value: 3,
      },
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

export const psQuestionnaires: PSQuestionnaire[] = [
  {
    id: "ps1",
    title: "PS1: Assessment & Management of E&S Risks and Impacts",
    shortTitle: "PS1 – E&S Management",
    maxRaw: 9,
    questions: [
      {
        key: "ps1_esms",
        text: "Does the client have a documented Environmental & Social Management System (ESMS)?",
        options: [
          { label: "Yes — robust or certified ESMS in place", value: 0 },
          { label: "Partial — informal or under development", value: 1 },
          { label: "No ESMS in place", value: 3 },
        ],
      },
      {
        key: "ps1_esia",
        text: "Has an Environmental & Social Impact Assessment (ESIA) been conducted for this project?",
        options: [
          { label: "Yes — current and comprehensive ESIA completed", value: 0 },
          { label: "Partial — outdated or scoped ESIA only", value: 1 },
          { label: "No ESIA has been conducted", value: 3 },
        ],
      },
      {
        key: "ps1_officer",
        text: "Does the client have a designated E&S officer or team responsible for this project?",
        options: [
          { label: "Yes — dedicated full-time E&S officer assigned", value: 0 },
          { label: "No dedicated E&S officer", value: 2 },
        ],
      },
      {
        key: "ps1_incidents",
        text: "Does the client have a record of prior E&S incidents or regulatory violations?",
        options: [
          { label: "No prior incidents or violations", value: 0 },
          {
            label: "Minor incidents, resolved with no recurring issues",
            value: 1,
          },
          { label: "Major violations or repeated non-compliance", value: 3 },
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
        key: "ps2_employees",
        text: "How many direct employees will the project engage?",
        options: [
          { label: "Fewer than 50 employees", value: 1 },
          { label: "50 – 500 employees", value: 2 },
          { label: "More than 500 employees", value: 3 },
        ],
      },
      {
        key: "ps2_contracted",
        text: "Will the project use contracted or third-party labour?",
        options: [
          { label: "No contracted or third-party workers", value: 0 },
          {
            label: "Yes — contracted or third-party workers will be used",
            value: 2,
          },
        ],
      },
      {
        key: "ps2_migrant",
        text: "Will the project employ migrant workers?",
        options: [
          { label: "No migrant workers will be employed", value: 0 },
          { label: "Yes — migrant workers will be employed", value: 2 },
        ],
      },
      {
        key: "ps2_childforced",
        text: "Is there any risk of child labour or forced labour in the project or supply chain?",
        options: [
          { label: "No risk identified", value: 0 },
          { label: "Possible risk — monitoring in place", value: 2 },
          { label: "Likely risk — limited controls", value: 3 },
        ],
      },
      {
        key: "ps2_disputes",
        text: "Are there active or recent labour disputes, strikes, or collective grievances?",
        options: [
          { label: "No labour disputes", value: 0 },
          { label: "Yes — active or recent disputes", value: 3 },
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
        key: "ps3_hazwaste",
        text: "Will the project generate hazardous waste?",
        options: [
          { label: "No hazardous waste generated", value: 0 },
          { label: "Minor quantities, properly managed", value: 1 },
          { label: "Significant hazardous waste generation", value: 3 },
        ],
      },
      {
        key: "ps3_wastewater",
        text: "Will the project discharge wastewater or liquid effluents?",
        options: [
          { label: "No wastewater discharge", value: 0 },
          { label: "Treated discharge — meets regulatory standards", value: 1 },
          { label: "Untreated or inadequately treated discharge", value: 3 },
        ],
      },
      {
        key: "ps3_ghg",
        text: "What level of greenhouse gas (GHG) emissions will the project generate?",
        options: [
          { label: "Negligible GHG emissions", value: 0 },
          { label: "Moderate emissions (operations or transport)", value: 2 },
          {
            label: "High GHG emissions (industrial or energy process)",
            value: 3,
          },
        ],
      },
      {
        key: "ps3_water",
        text: "Will the project consume significant volumes of freshwater?",
        options: [
          { label: "No significant water consumption", value: 0 },
          { label: "Yes — significant freshwater consumption", value: 2 },
        ],
      },
      {
        key: "ps3_chemicals",
        text: "Will the project use, produce, or store hazardous chemicals or pesticides?",
        options: [
          { label: "No hazardous chemicals or pesticides", value: 0 },
          {
            label: "Yes — hazardous chemicals or pesticides involved",
            value: 3,
          },
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
        key: "ps4_proximity",
        text: "Are there communities or households located within 5 km of the project site?",
        options: [
          { label: "No communities within 5 km", value: 0 },
          { label: "Yes — communities present within 5 km", value: 2 },
        ],
      },
      {
        key: "ps4_infrastructure",
        text: "Will the project affect or place burden on public infrastructure (roads, water, power)?",
        options: [
          { label: "No impact on public infrastructure", value: 0 },
          { label: "Yes — public infrastructure will be affected", value: 2 },
        ],
      },
      {
        key: "ps4_security",
        text: "Will the project require armed or private security forces?",
        options: [
          { label: "No security forces required", value: 0 },
          { label: "Yes — security forces will be deployed", value: 2 },
        ],
      },
      {
        key: "ps4_disease",
        text: "Could the project increase the risk of disease transmission to surrounding communities?",
        options: [
          { label: "No disease risk to communities", value: 0 },
          { label: "Possible — workforce influx or vector risk", value: 2 },
          { label: "Likely — known disease-prone context", value: 3 },
        ],
      },
      {
        key: "ps4_opposition",
        text: "Is there community opposition or conflict associated with the project?",
        options: [
          { label: "No community opposition", value: 0 },
          { label: "Minor concerns or isolated objections", value: 1 },
          { label: "Significant opposition or community conflict", value: 3 },
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
        key: "ps5_acquisition",
        text: "Will the project require new land acquisition?",
        options: [
          { label: "No new land acquisition required", value: 0 },
          { label: "Yes — land acquisition is required", value: 3 },
        ],
      },
      {
        key: "ps5_displacement",
        text: "Will the project require physical displacement of people from their homes or businesses?",
        options: [
          { label: "No physical displacement", value: 0 },
          { label: "Yes — fewer than 50 households displaced", value: 2 },
          { label: "Yes — more than 50 households displaced", value: 3 },
        ],
      },
      {
        key: "ps5_livelihood",
        text: "Will the project cause loss of livelihoods or economic displacement?",
        options: [
          { label: "No livelihood or economic displacement", value: 0 },
          { label: "Possible — livelihoods may be affected", value: 2 },
          { label: "Yes — confirmed livelihood loss", value: 3 },
        ],
      },
      {
        key: "ps5_informal",
        text: "Is the project land currently occupied or used informally (without formal title)?",
        options: [
          { label: "No informal occupation of project land", value: 0 },
          { label: "Yes — informal users or occupants are present", value: 3 },
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
        key: "ps6_protected",
        text: "Is the project located near or within a legally protected area (national park, reserve, Ramsar site)?",
        options: [
          { label: "Not near any protected area", value: 0 },
          { label: "Adjacent to a protected area", value: 2 },
          { label: "Within or overlapping a protected area", value: 3 },
        ],
      },
      {
        key: "ps6_habitat",
        text: "Is there potential for the project to affect critical habitat or areas of high biodiversity value?",
        options: [
          { label: "No critical habitat or high biodiversity area", value: 0 },
          { label: "Possible critical habitat in project area", value: 2 },
          { label: "Confirmed critical habitat will be affected", value: 3 },
        ],
      },
      {
        key: "ps6_clearing",
        text: "Will the project involve land clearing, deforestation, or vegetation removal?",
        options: [
          { label: "No land clearing or vegetation removal", value: 0 },
          { label: "Minor clearing — less than 5 hectares", value: 1 },
          { label: "Major clearing — more than 5 hectares", value: 3 },
        ],
      },
      {
        key: "ps6_species",
        text: "Could the project affect endangered, threatened, or legally protected species?",
        options: [
          { label: "No endangered or protected species in area", value: 0 },
          { label: "Possible presence of protected species", value: 2 },
          { label: "Confirmed protected species will be affected", value: 3 },
        ],
      },
      {
        key: "ps6_wetlands",
        text: "Does the project area include or border wetlands, rivers, lakes, or coastal ecosystems?",
        options: [
          { label: "No wetlands, rivers, or coastal ecosystems", value: 0 },
          {
            label: "Yes — project borders or interacts with these features",
            value: 2,
          },
        ],
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
        key: "ps7_presence",
        text: "Are there Indigenous Peoples (IP) living in or near the project area?",
        options: [
          { label: "No Indigenous Peoples in or near project area", value: 0 },
          { label: "Yes — Indigenous Peoples are present", value: 3 },
        ],
      },
      {
        key: "ps7_lands",
        text: "Will the project affect lands, territories, or natural resources traditionally owned or used by Indigenous Peoples?",
        options: [
          { label: "No traditional lands or resources affected", value: 0 },
          {
            label: "Possible impact on traditional lands or resources",
            value: 2,
          },
          {
            label: "Confirmed impact on traditional lands or resources",
            value: 3,
          },
        ],
      },
      {
        key: "ps7_fpic",
        text: "Has Free, Prior, and Informed Consent (FPIC) been obtained from affected Indigenous Peoples?",
        options: [
          { label: "FPIC fully completed and documented", value: 0 },
          { label: "FPIC process in progress", value: 1 },
          { label: "FPIC process not yet started", value: 3 },
        ],
      },
      {
        key: "ps7_conflicts",
        text: "Are there existing or historical conflicts between the project proponent and Indigenous Peoples?",
        options: [
          { label: "No existing or historical conflicts", value: 0 },
          {
            label: "Yes — existing or historical conflicts documented",
            value: 3,
          },
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
        key: "ps8_sites",
        text: "Are there known cultural, religious, or archaeological heritage sites in or near the project area?",
        options: [
          {
            label: "No known heritage sites in or near project area",
            value: 0,
          },
          {
            label: "Heritage sites nearby but not within project footprint",
            value: 1,
          },
          {
            label: "Known heritage sites within the project footprint",
            value: 3,
          },
        ],
      },
      {
        key: "ps8_disturbance",
        text: "Will the project involve ground disturbance, excavation, or civil construction activities?",
        options: [
          { label: "No ground disturbance or excavation", value: 0 },
          { label: "Minor ground disturbance or shallow excavation", value: 1 },
          { label: "Significant deep excavation or earthworks", value: 3 },
        ],
      },
      {
        key: "ps8_archaeological",
        text: "What is the archaeological potential of the project area?",
        options: [
          {
            label: "Low potential — area previously surveyed and cleared",
            value: 0,
          },
          { label: "Possible undiscovered archaeological remains", value: 2 },
          {
            label: "Known or high probability of archaeological remains",
            value: 3,
          },
        ],
      },
      {
        key: "ps8_intangible",
        text: "Will the project affect intangible cultural heritage, sacred sites, or traditional practices?",
        options: [
          { label: "No intangible heritage affected", value: 0 },
          { label: "Possible impact on intangible heritage", value: 1 },
          {
            label: "Confirmed impact on intangible cultural heritage",
            value: 2,
          },
        ],
      },
    ],
  },
];
// ── D4: Context & Location Risk (weight 15%) ────────────────────────────────

export const contextQuestions: ScoredQuestion[] = [
  {
    key: "ctx_governance",
    text: "How would you rate the host country's governance and rule of law?",
    options: [
      { label: "Strong governance and rule of law", value: 1 },
      { label: "Moderate — some governance gaps", value: 2 },
      { label: "Weak governance — limited rule of law", value: 3 },
    ],
  },
  {
    key: "ctx_enforcement",
    text: "What is the E&S regulatory enforcement capacity in the host country?",
    options: [
      { label: "Strong — active and effective enforcement", value: 1 },
      { label: "Moderate — enforcement is uneven", value: 2 },
      { label: "Weak — enforcement is absent or ineffective", value: 3 },
    ],
  },
  {
    key: "ctx_conflict",
    text: "What is the conflict and fragility status of the project location?",
    options: [
      { label: "Stable — no active conflict or fragility", value: 1 },
      { label: "Fragile — periodic tensions or instability", value: 2 },
      { label: "Conflict-affected area", value: 3 },
    ],
  },
  {
    key: "ctx_climate",
    text: "What is the climate vulnerability of the project location?",
    options: [
      { label: "Low vulnerability to climate hazards", value: 1 },
      { label: "Moderate climate vulnerability", value: 2 },
      {
        label: "High vulnerability — flood, drought, or extreme heat risk",
        value: 3,
      },
    ],
  },
  {
    key: "ctx_water",
    text: "What is the water stress level of the project region?",
    options: [
      { label: "Low water stress — adequate water availability", value: 1 },
      { label: "Medium water stress", value: 2 },
      { label: "High water stress — water-scarce region", value: 3 },
    ],
  },
  {
    key: "ctx_ecosystems",
    text: "What is the proximity of the project to sensitive ecosystems or biodiversity hotspots?",
    options: [
      { label: "No sensitive ecosystems nearby", value: 1 },
      { label: "Adjacent to sensitive ecosystems", value: 2 },
      { label: "Within or overlapping sensitive ecosystems", value: 3 },
    ],
  },
];

export const D4_MAX_RAW = contextQuestions.length * 3; // 18

// ── D5: Client Track Record (weight 10%) ────────────────────────────────────

export const clientTrackRecordQuestions: ScoredQuestion[] = [
  {
    key: "ctr_history",
    text: "Has the client been involved in previous E&S non-compliance incidents or regulatory violations?",
    options: [
      { value: 1, label: "No incidents or violations on record" },
      { value: 2, label: "Minor incidents — resolved with no recurrence" },
      { value: 3, label: "Major violations or repeated incidents" },
    ],
  },
  {
    key: "ctr_esms",
    text: "How well-developed is the client's Environmental and Social Management System (ESMS)?",
    options: [
      {
        value: 1,
        label: "Formal ESMS with documented procedures and regular audits",
      },
      {
        value: 2,
        label: "Basic ESMS — documented but inconsistently implemented",
      },
      { value: 3, label: "No formal ESMS" },
    ],
  },
  {
    key: "ctr_capacity",
    text: "Does the client have dedicated E&S staff or management capacity?",
    options: [
      { value: 1, label: "Dedicated E&S team with qualified professionals" },
      { value: 2, label: "Part-time or shared E&S responsibility" },
      { value: 3, label: "No E&S capacity" },
    ],
  },
  {
    key: "ctr_reporting",
    text: "Does the client produce regular E&S monitoring or sustainability reports?",
    options: [
      {
        value: 1,
        label: "Regular published reports aligned to GRI/ISSB standards",
      },
      { value: 2, label: "Occasional or ad-hoc reporting" },
      { value: 3, label: "No reporting" },
    ],
  },
  {
    key: "ctr_covenants",
    text: "Has the client demonstrated compliance with E&S covenants in prior financing arrangements?",
    options: [
      {
        value: 1,
        label: "Full compliance with all covenants — no waivers needed",
      },
      { value: 2, label: "Covenant breaches — resolved after remediation" },
      {
        value: 3,
        label: "Material covenant breaches — unresolved or first-time borrower",
      },
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
    "Independent review by a qualified E&S consultant",
    "Detailed Environmental and Social Action Plan (ESAP)",
    "Board or Executive Committee approval required",
    "Ongoing monitoring with quarterly E&S reporting",
    "Stakeholder engagement and public disclosure plan",
    "PS5: Resettlement Action Plan (RAP) required \u2014 PS5 triggered",
    "PS7: Indigenous Peoples Development Plan (IPDP) required \u2014 PS7 triggered",
    "PS6: Biodiversity Management Plan (BMP) required \u2014 PS6 triggered",
    "PS8: Cultural Heritage Management Plan (CHMP) and chance-finds procedure \u2014 PS8 triggered",
  ],
  B: [
    "Limited E&S assessment or targeted audit required",
    "Environmental and Social Action Plan (ESAP)",
    "Senior Risk Manager approval required",
    "Semi-annual E&S monitoring and reporting",
    "Targeted stakeholder consultation",
    "PS5: Livelihood Restoration Plan required \u2014 PS5 triggered",
    "PS7: Indigenous Peoples engagement and consultation plan \u2014 PS7 triggered",
  ],
  C: [
    "Standard E&S due diligence review",
    "ESG Officer sign-off sufficient",
    "Annual E&S monitoring check",
  ],
};

// ── Demo Auto-Fill Data ─────────────────────────────────────────────────────

export const demoAutoFill = {
  sector: "Construction (Large Scale)",
  projectCharacteristics: {
    pc_type: 3,
    pc_investment: 2,
    pc_workers: 2,
    pc_footprint: 2,
    pc_duration: 2,
    pc_irreversibility: 2,
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
    ps1_esms: 1,
    ps1_esia: 1,
    ps1_officer: 0,
    ps1_incidents: 1,
    // PS2 (triggered — labour)
    ps2_employees: 2,
    ps2_contracted: 2,
    ps2_migrant: 0,
    ps2_childforced: 0,
    ps2_disputes: 0,
    // PS3 (triggered — pollution)
    ps3_hazwaste: 1,
    ps3_wastewater: 1,
    ps3_ghg: 2,
    ps3_water: 2,
    ps3_chemicals: 0,
    // PS4 (triggered — community)
    ps4_proximity: 2,
    ps4_infrastructure: 2,
    ps4_security: 0,
    ps4_disease: 0,
    ps4_opposition: 1,
    // PS5 (triggered — land)
    ps5_acquisition: 3,
    ps5_displacement: 2,
    ps5_livelihood: 2,
    ps5_informal: 0,
    // PS8 (triggered — cultural heritage)
    ps8_sites: 1,
    ps8_disturbance: 1,
    ps8_archaeological: 2,
    ps8_intangible: 0,
  } as Record<string, number>,
  context: {
    ctx_governance: 2,
    ctx_enforcement: 2,
    ctx_conflict: 1,
    ctx_climate: 2,
    ctx_water: 2,
    ctx_ecosystems: 2,
  } as Record<string, number>,
  clientTrackRecord: {
    ctr_history: 2,
    ctr_esms: 2,
    ctr_capacity: 2,
    ctr_reporting: 2,
    ctr_covenants: 2,
  } as Record<string, number>,
};
