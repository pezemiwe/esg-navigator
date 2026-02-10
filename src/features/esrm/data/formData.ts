import type { ExclusionItem, PerformanceStandard } from "../types";

export const sectors = [
  "General",
  "Manufacturing",
  "Energy",
  "ICT",
  "Agriculture",
];

export const subSectors = [
  "Logistics",
  "Construction",
  "Services",
  "Technology",
  "Finance",
];

export const nigerianStates = [
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "FCT",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

export const projectTypes = ["CAPEX", "OPEX", "Working Capital", "Guarantee"];

export const currencies = ["Naira", "USD", "EUR", "GBP"];

export const employeeRanges = ["1-20", "21-50", "51-100", "101-500", "500+"];

export const managementCapacityOptions = [
  "Strong",
  "Moderate",
  "Weak",
  "Unknown",
];

export const monitoringStatusOptions = [
  "Pending",
  "In Progress",
  "Completed",
  "Overdue",
];

export const authorityLevels = [
  "ESG Officer",
  "Senior Risk Manager",
  "Head of Risk",
  "Chief Risk Officer",
  "Executive Committee",
];

export const exclusionItems: ExclusionItem[] = [
  { key: "weapons", label: "Weapons, firearms or ammunition" },
  { key: "tobacco", label: "Tobacco production" },
  { key: "adultEntertainment", label: "Adult entertainment / pornography" },
  { key: "gambling", label: "Gambling or betting activities" },
  { key: "forcedLabor", label: "Forced or child labor" },
  { key: "illegalLogging", label: "Illegal logging / wildlife trade" },
  { key: "radioactiveMaterials", label: "Radioactive materials" },
  { key: "hazardousChemicals", label: "Hazardous chemicals or asbestos" },
  { key: "conflictMinerals", label: "Conflict minerals or unregulated mining" },
  { key: "unlicensedWaste", label: "Unlicensed waste disposal" },
  { key: "coralReef", label: "Coral reef destruction or marine dumping" },
  { key: "culturalHeritage", label: "Cultural heritage destruction" },
  { key: "bannedActivities", label: "Activities banned by national law" },
];

export const essPerformanceStandards: PerformanceStandard[] = [
  {
    title:
      "Performance Standard 1: Assessment and Management of E&S Risks and Impacts",
    questions: [
      {
        key: "ps1_significant_risks",
        text: "Does the project pose potentially significant E&S risks and impacts?",
      },
      {
        key: "ps1_impact_assessment",
        text: "Has the client conducted prior E&S impact assessments?",
      },
    ],
  },
  {
    title: "Performance Standard 2: Labor and Working Conditions",
    questions: [
      {
        key: "ps2_employment",
        text: "Will the project create employment for >20 people?",
      },
      {
        key: "ps2_health_safety",
        text: "Could the project pose occupational health and safety risks?",
      },
    ],
  },
  {
    title:
      "Performance Standard 3: Resource Efficiency and Pollution Prevention",
    questions: [
      {
        key: "ps3_emissions",
        text: "Will the project generate significant emissions, effluents, or waste?",
      },
      {
        key: "ps3_water_energy",
        text: "Will the project consume large quantities of water or energy?",
      },
    ],
  },
  {
    title: "Performance Standard 4: Community Health, Safety, and Security",
    questions: [
      {
        key: "ps4_communities",
        text: "Is the project located near residential communities or public facilities?",
      },
      {
        key: "ps4_health_risks",
        text: "Could project activities pose health and safety risks to communities?",
      },
    ],
  },
  {
    title:
      "Performance Standard 5: Land Acquisition and Involuntary Resettlement",
    questions: [
      {
        key: "ps5_land_acquisition",
        text: "Will the project require land acquisition or cause physical displacement?",
      },
      {
        key: "ps5_economic_displacement",
        text: "Will the project cause economic displacement (loss of income)?",
      },
    ],
  },
  {
    title:
      "Performance Standard 6: Biodiversity Conservation and Natural Resource Management",
    questions: [
      {
        key: "ps6_biodiversity",
        text: "Is the project located in or near sensitive ecosystems?",
      },
      {
        key: "ps6_endangered_species",
        text: "Could project activities affect endangered species or critical habitats?",
      },
    ],
  },
  {
    title: "Performance Standard 7: Indigenous Peoples",
    questions: [
      {
        key: "ps7_indigenous_peoples",
        text: "Will the project affect Indigenous Peoples or customary land users?",
      },
      {
        key: "ps7_fpic",
        text: "Has the client obtained Free, Prior, and Informed Consent (FPIC)?",
      },
    ],
  },
  {
    title: "Performance Standard 8: Cultural Heritage",
    questions: [
      {
        key: "ps8_cultural_heritage",
        text: "Are there known cultural, religious, or archaeological sites nearby?",
      },
      {
        key: "ps8_tangible_heritage",
        text: "Could the project disturb or damage tangible heritage?",
      },
    ],
  },
];

export const categorizationPerformanceStandards: (PerformanceStandard & {
  id: string;
})[] = [
  {
    id: "ps1",
    title:
      "Performance Standard 1: Assessment and Management of Environmental and Social Risks and Impacts",
    questions: [
      {
        key: "ps1_q1",
        text: "Does the project pose potentially significant adverse environmental and social risks and impacts?",
      },
      {
        key: "ps1_q2",
        text: "Will the project require an Environmental and Social Impact Assessment (ESIA)?",
      },
      {
        key: "ps1_q3",
        text: "Does the project involve activities that are subject to environmental licensing?",
      },
    ],
  },
  {
    id: "ps2",
    title: "Performance Standard 2: Labor and Working Conditions",
    questions: [
      { key: "ps2_q1", text: "Will the project employ 20 or more workers?" },
      {
        key: "ps2_q2",
        text: "Could the project pose occupational health and safety risks to workers?",
      },
      {
        key: "ps2_q3",
        text: "Will the project involve the use of migrant workers or contractors?",
      },
    ],
  },
  {
    id: "ps3",
    title:
      "Performance Standard 3: Resource Efficiency and Pollution Prevention",
    questions: [
      {
        key: "ps3_q1",
        text: "Will the project generate significant air emissions, effluents, or solid waste?",
      },
      {
        key: "ps3_q2",
        text: "Will the project consume large quantities of water or energy?",
      },
      {
        key: "ps3_q3",
        text: "Will the project use or produce hazardous materials or chemicals?",
      },
    ],
  },
  {
    id: "ps4",
    title: "Performance Standard 4: Community Health, Safety, and Security",
    questions: [
      {
        key: "ps4_q1",
        text: "Is the project located near residential communities or public facilities?",
      },
      {
        key: "ps4_q2",
        text: "Could project activities pose health and safety risks to communities?",
      },
      {
        key: "ps4_q3",
        text: "Will the project require security arrangements that could affect communities?",
      },
    ],
  },
  {
    id: "ps5",
    title:
      "Performance Standard 5: Land Acquisition and Involuntary Resettlement",
    questions: [
      {
        key: "ps5_q1",
        text: "Will the project require land acquisition or cause physical displacement?",
      },
      {
        key: "ps5_q2",
        text: "Will the project cause economic displacement (loss of income or livelihood)?",
      },
      {
        key: "ps5_q3",
        text: "Will the project restrict access to natural resources or legally designated areas?",
      },
    ],
  },
  {
    id: "ps6",
    title:
      "Performance Standard 6: Biodiversity Conservation and Sustainable Management of Living Natural Resources",
    questions: [
      {
        key: "ps6_q1",
        text: "Is the project located in or near areas of hi biodiversity value?",
      },
      {
        key: "ps6_q2",
        text: "Could project activities affect endangered species or critical habitats?",
      },
      {
        key: "ps6_q3",
        text: "Will the project involve the sustainable management of living natural resources?",
      },
    ],
  },
  {
    id: "ps7",
    title: "Performance Standard 7: Indigenous Peoples",
    questions: [
      {
        key: "ps7_q1",
        text: "Will the project affect Indigenous Peoples or traditional communities?",
      },
      {
        key: "ps7_q2",
        text: "Are there Indigenous Peoples with collective attachment to the project area?",
      },
      {
        key: "ps7_q3",
        text: "Has the client obtained Free, Prior, and Informed Consent (FPIC) where required?",
      },
    ],
  },
  {
    id: "ps8",
    title: "Performance Standard 8: Cultural Heritage",
    questions: [
      {
        key: "ps8_q1",
        text: "Are there known cultural, religious, or archaeological sites in the project area?",
      },
      {
        key: "ps8_q2",
        text: "Could the project disturb or damage tangible cultural heritage?",
      },
      {
        key: "ps8_q3",
        text: "Will the project affect intangible cultural heritage or traditional practices?",
      },
    ],
  },
];

export const step3Approvers = [
  "David Wilson - Senior ESG Analyst",
  "Lisa Brown - Environmental Specialist",
  "James Miller - Risk Assessment Lead",
  "Emma Davis - Sustainability Manager",
];

export const step5Approvers = [
  "James Miller - Risk Assessment Lead",
  "Emma Davis - Sustainability Manager",
  "Robert Taylor - Senior ESG Officer",
  "Maria Garcia - Chief Risk Officer",
];

export const performanceStandardWeits = [
  { standard: "PS1: Assessment & E&S Management", weight: "15.00" },
  { standard: "PS2: Labor & Working Conditions", weight: "10.00" },
  { standard: "PS3: Resource Efficiency & Pollution", weight: "10.00" },
  { standard: "PS4: Community Health & Safety", weight: "10.00" },
  { standard: "PS5: Land Acquisition", weight: "10.00" },
  { standard: "PS6: Biodiversity", weight: "10.00" },
  { standard: "PS7: Indigenous Peoples", weight: "20.00" },
  { standard: "PS8: Cultural Heritage", weight: "15.00" },
];
