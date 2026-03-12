import type { ExclusionItem } from "../types";

export const sectors = [
  "Extractives & Minerals Processing",
  "Resource Transformation",
  "Technology & Communications",
  "Financial",
  "Health Care",
  "Food & Beverage",
  "Services",
  "Infrastructure",
  "Consumer Goods",
  "Renewable Resources & Alternative Energy",
  "Transportation",
];

export const subSectorsBySector: Record<string, string[]> = {
  "Extractives & Minerals Processing": [
    "Oil & Gas Exploration & Production",
    "Oil & Gas Midstream",
    "Oil & Gas Refining & Marketing",
    "Coal Operations",
    "Iron & Steel Producers",
    "Gold & Silver Mining",
    "Metals & Mining – General",
  ],
  "Resource Transformation": [
    "Chemicals",
    "Construction Materials",
    "Industrial Machinery & Goods",
    "Containers & Packaging",
    "Paper & Forest Products",
    "Aerospace & Defence",
  ],
  "Technology & Communications": [
    "Semiconductors",
    "Software & IT Services",
    "Hardware",
    "Telecommunication Services",
    "Internet Media & Services",
    "Electronic Manufacturing",
  ],
  Financial: [
    "Retail Banking",
    "Commercial Banking",
    "Investment Banking & Brokerage",
    "Insurance",
    "Asset Management",
    "Mortgage Finance",
  ],
  "Health Care": [
    "Pharmaceuticals",
    "Biotechnology",
    "Medical Devices & Supplies",
    "Managed Care",
    "Hospitals & Healthcare Providers",
  ],
  "Food & Beverage": [
    "Agricultural Products",
    "Meat, Poultry & Dairy",
    "Non-Alcoholic Beverages",
    "Alcoholic Beverages",
    "Food Retailers & Distributors",
    "Restaurants",
  ],
  Services: [
    "Hotels & Lodging",
    "Casinos & Gaming",
    "Media & Entertainment",
    "Education",
    "Professional & Commercial Services",
    "Leisure & Recreation",
  ],
  Infrastructure: [
    "Electric Utilities",
    "Gas Utilities & Distributors",
    "Water & Wastewater Services",
    "Waste Management",
    "Engineering & Construction Services",
    "Real Estate Owners & Developers",
  ],
  "Consumer Goods": [
    "Apparel, Accessories & Footwear",
    "Automobiles",
    "Household & Personal Products",
    "Building Products & Furnishings",
    "E-Commerce",
    "Multiline & Specialty Retail",
  ],
  "Renewable Resources & Alternative Energy": [
    "Forestry Management",
    "Fisheries & Aquaculture",
    "Biofuels",
    "Pulp & Paper Products",
    "Solar Technology",
    "Wind Technology",
  ],
  Transportation: [
    "Airlines",
    "Marine Transportation",
    "Road Transportation",
    "Rail Transportation",
    "Trucking",
    "Car Rental & Leasing",
  ],
};

// Flat list for backward compatibility
export const subSectors = Object.values(subSectorsBySector).flat();

export const facilityTermOptions = [
  "Term Loan",
  "Revolving Credit Facility",
  "Project Finance",
  "Trade Finance",
  "Overdraft Facility",
  "Bridging Loan",
  "Syndicated Loan",
  "Mezzanine Financing",
  "Letter of Credit",
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
