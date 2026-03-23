export interface SasbSector {
  id: string;
  name: string;
  industries: string[];
}

export type SasbMetricCategory = "Quantitative" | "Discussion and Analysis";

export interface SasbMetric {
  topic: string;
  metric: string;
  category: SasbMetricCategory;
  unit: string;
  code: string;
}

// ----------------------------------------------------------------------
// SASB Taxonomy
// ----------------------------------------------------------------------
export const SASB_TAXONOMY: SasbSector[] = [
  {
    id: "consumer_goods",
    name: "Consumer Goods",
    industries: [
      "Apparel, Accessories & Footwear",
      "Appliance Manufacturing",
      "Building Products & Furnishings",
      "E-Commerce",
      "Household & Personal Products",
      "Multiline and Specialty Retailers & Distributors",
      "Toys & Sporting Goods"
    ],
  },
  {
    id: "extractives_minerals_processing",
    name: "Extractives & Minerals Processing",
    industries: [
      "Coal Operations",
      "Construction Materials",
      "Iron & Steel Producers",
      "Metals & Mining",
      "Oil & Gas - Exploration & Production",
      "Oil & Gas - Midstream",
      "Oil & Gas - Refining & Marketing",
      "Oil & Gas - Services"
    ],
  },
  {
    id: "financials",
    name: "Financials",
    industries: [
      "Asset Management & Custody Activities",
      "Commercial Banks",
      "Consumer Finance",
      "Insurance",
      "Investment Banking & Brokerage",
      "Mortgage Finance",
      "Security & Commodity Exchanges"
    ],
  },
  {
    id: "food_beverage",
    name: "Food & Beverage",
    industries: [
      "Agricultural Products",
      "Alcoholic Beverages",
      "Food Retailers & Distributors",
      "Meat, Poultry & Dairy",
      "Non-Alcoholic Beverages",
      "Processed Foods",
      "Restaurants",
      "Tobacco"
    ],
  },
  {
    id: "health_care",
    name: "Health Care",
    industries: [
      "Biotechnology & Pharmaceuticals",
      "Drug Retailers",
      "Health Care Delivery",
      "Health Care Distributors",
      "Managed Care",
      "Medical Equipment & Supplies"
    ],
  },
  {
    id: "infrastructure",
    name: "Infrastructure",
    industries: [
      "Electric Utilities & Power Generators",
      "Engineering & Construction Services",
      "Gas Utilities & Distributors",
      "Home Builders",
      "Real Estate",
      "Real Estate Services",
      "Waste Management",
      "Water Utilities & Services"
    ],
  },
  {
    id: "renewable_resources_alternative_energy",
    name: "Renewable Resources & Alternative Energy",
    industries: [
      "Biofuels",
      "Forestry Management",
      "Fuel Cells & Industrial Batteries",
      "Pulp & Paper Products",
      "Solar Technology & Project Developers",
      "Wind Technology & Project Developers"
    ],
  },
  {
    id: "resource_transformation",
    name: "Resource Transformation",
    industries: [
      "Aerospace & Defense",
      "Chemicals",
      "Containers & Packaging",
      "Electrical & Electronic Equipment",
      "Industrial Machinery & Goods"
    ],
  },
  {
    id: "services",
    name: "Services",
    industries: [
      "Advertising & Marketing",
      "Casinos & Gaming",
      "Education",
      "Hotels & Lodging",
      "Leisure Facilities",
      "Media & Entertainment",
      "Professional & Commercial Services"
    ],
  },
  {
    id: "technology_communications",
    name: "Technology & Communications",
    industries: [
      "Electronic Manufacturing Services & Original Design Manufacturing",
      "Hardware",
      "Internet Media & Services",
      "Semiconductors",
      "Software & IT Services",
      "Telecommunication Services"
    ],
  },
  {
    id: "transportation",
    name: "Transportation",
    industries: [
      "Air Freight & Logistics",
      "Airlines",
      "Auto Parts",
      "Automobiles",
      "Car Rental & Leasing",
      "Cruise Lines",
      "Marine Transportation",
      "Rail Transportation",
      "Road Transportation"
    ],
  },
];

// ----------------------------------------------------------------------
// Materiality Topics mapping
// ----------------------------------------------------------------------
export const SASB_MATERIALITY_TOPICS: Record<string, Record<string, string[]>> = {
  "Consumer Goods": {
    "Apparel, Accessories & Footwear": [
      "Management of Chemicals in Products",
      "Environmental Impacts in the Supply Chain",
      "Labour Conditions in the Supply Chain",
      "Raw Materials Sourcing"
    ],
    "Appliance Manufacturing": [
      "Energy Management",
      "Product Lifecycle Management",
      "Materials Sourcing",
      "Product Safety"
    ],
    "Building Products & Furnishings": [
      "Wood Supply Chain Management",
      "Management of Chemicals in Products",
      "Product Lifecycle Management",
      "Energy Management"
    ],
    "E-Commerce": [
      "Environmental Impacts of Shipping Operations",
      "Data Privacy & Advertising Standards",
      "Labour Practices",
      "Supply Chain Management"
    ],
    "Household & Personal Products": [
      "Product Environmental & Health Profile",
      "Environmental & Social Impacts of Palm Oil Supply Chain",
      "Packaging Lifecycle Management",
      "Water Management"
    ],
    "Multiline and Specialty Retailers & Distributors": [
      "Energy Management",
      "Data Privacy & Customer Experience",
      "Labour Practices",
      "Supply Chain Management"
    ],
    "Toys & Sporting Goods": [
      "Product Safety",
      "Environmental & Social Impacts of Supply Chain",
      "Management of Chemicals in Products"
    ]
  },
  "Extractives & Minerals Processing": {
    "Coal Operations": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Ecological Impacts",
      "Water Management",
      "Workforce Health & Safety",
      "Labour Relations"
    ],
    "Construction Materials": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Water Management",
      "Waste Management",
      "Biodiversity Impacts",
      "Workforce Health & Safety"
    ],
    "Iron & Steel Producers": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Water Management",
      "Waste Management",
      "Workforce Health & Safety",
      "Labour Relations"
    ],
    "Metals & Mining": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Water Management",
      "Waste & Hazardous Materials Management",
      "Biodiversity Impacts",
      "Security, Human Rights & Rights of Indigenous Peoples",
      "Workforce Health & Safety",
      "Labour Relations",
      "Business Ethics & Payments Transparency"
    ],
    "Oil & Gas - Exploration & Production": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Water Management",
      "Biodiversity Impacts",
      "Workforce Health & Safety",
      "Business Ethics & Payments Transparency"
    ],
    "Oil & Gas - Midstream": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Water Management",
      "Biodiversity Impacts",
      "Workforce Health & Safety",
      "Emergency Management"
    ],
    "Oil & Gas - Refining & Marketing": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Water Management",
      "Hazardous Materials Management",
      "Product Design & Lifecycle Management",
      "Workforce Health & Safety"
    ],
    "Oil & Gas - Services": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Water Management",
      "Workforce Health & Safety",
      "Business Ethics & Payments Transparency"
    ]
  },
  "Financials": {
    "Asset Management & Custody Activities": [
      "Transparent Information & Fair Advice for Customers",
      "Employee Incentives & Risk Taking",
      "Integration of ESG Risk Factors in Investment Management",
      "Management of Legal & Regulatory Environment",
      "Systemic Risk Management",
      "Employee Inclusion"
    ],
    "Commercial Banks": [
      "Financial Inclusion & Capacity Building",
      "Incorporation of ESG Factors in Credit Analysis",
      "Business Ethics",
      "Systemic Risk Management",
      "Data Security"
    ],
    "Consumer Finance": [
      "Selling Practices & Transparency",
      "Data Privacy & Customer Experience",
      "Business Ethics"
    ],
    "Insurance": [
      "Transparent Information & Fair Advice for Customers",
      "Incorporation of ESG Factors in Investment Management",
      "Environmental Risk Exposure",
      "Systemic Risk Management",
      "Business Ethics"
    ],
    "Investment Banking & Brokerage": [
      "Transparent Information & Fair Advice for Customers",
      "Employee Incentives & Risk Taking",
      "Incorporation of ESG Factors in Investment Banking",
      "Business Ethics"
    ],
    "Mortgage Finance": [
      "Selling Practices & Transparency",
      "Business Ethics"
    ],
    "Security & Commodity Exchanges": [
      "Transparent Information & Fair Advice for Customers",
      "Business Ethics",
      "Systemic Risk Management"
    ]
  },
  "Food & Beverage": {
    "Agricultural Products": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Water Management",
      "Land Use & Ecological Impacts",
      "Food Safety & Health Concerns",
      "Supply Chain Management & Traceability",
      "Workforce Health & Safety"
    ],
    "Alcoholic Beverages": [
      "Energy Management",
      "Water Management",
      "Responsible Drinking & Marketing",
      "Packaging Lifecycle Management",
      "Environmental & Social Impacts of Ingredient Supply Chain"
    ],
    "Food Retailers & Distributors": [
      "Energy Management",
      "Air Emissions from Refrigeration",
      "Food Waste Management",
      "Food Safety",
      "Health & Nutrition",
      "Packaging Lifecycle Management",
      "Supply Chain Management"
    ],
    "Meat, Poultry & Dairy": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Water Management",
      "Land Use & Ecological Impacts",
      "Animal Care",
      "Food Safety",
      "Workforce Health & Safety"
    ],
    "Non-Alcoholic Beverages": [
      "Energy Management",
      "Water Management",
      "Packaging Lifecycle Management",
      "Nutrition & Health",
      "Environmental & Social Impacts of Ingredient Supply Chain"
    ],
    "Processed Foods": [
      "Energy Management",
      "Water Management",
      "Food Safety",
      "Health & Nutrition",
      "Product Labeling & Marketing",
      "Packaging Lifecycle Management",
      "Environmental & Social Impacts of Ingredient Supply Chain",
      "Ingredient Sourcing"
    ],
    "Restaurants": [
      "Energy Management",
      "Water Management",
      "Food Safety",
      "Nutrition & Health",
      "Supply Chain Management & Food Integrity"
    ],
    "Tobacco": [
      "Tobacco-Related Harm",
      "Chemical Additives, Ingredients, & By-products",
      "Responsible Advertising & Marketing",
      "Environmental & Social Impacts of Supply Chain"
    ]
  },
  "Health Care": {
    "Biotechnology & Pharmaceuticals": [
      "Drug Safety",
      "Counterfeit Drugs",
      "Drug Pricing & Access",
      "Ethical Marketing",
      "Intellectual Property Protection & Generic Drugs",
      "Employee Recruitment, Inclusion & Performance",
      "Supply Chain Management"
    ],
    "Drug Retailers": [
      "Energy Management",
      "Patient Privacy & Data Security",
      "Drug Safety",
      "Responsible Purchasing",
      "Workforce Diversity"
    ],
    "Health Care Delivery": [
      "Energy Management",
      "Patient Privacy & Data Security",
      "Patient Safety",
      "Affordability & Access",
      "Quality of Care",
      "Workforce Development",
      "Climate Change Impacts on Human Health & Infrastructure"
    ],
    "Health Care Distributors": [
      "Environmental Footprint of Operations",
      "Product Safety & Stewardship",
      "Counterfeit Drugs",
      "Business Ethics"
    ],
    "Managed Care": [
      "Quality of Care",
      "Regulatory Compliance & Legal Settlements",
      "Transparent Information & Fair Advice for Customers",
      "Member Coverage"
    ],
    "Medical Equipment & Supplies": [
      "Energy Management",
      "Product Safety",
      "Ethical Marketing",
      "Product Design & Lifecycle Management",
      "Supply Chain Management"
    ]
  },
  "Infrastructure": {
    "Electric Utilities & Power Generators": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Water Management",
      "Coal Ash Management",
      "Workforce Health & Safety",
      "Nuclear Safety & Emergency Management",
      "Grid Resiliency",
      "End-Use Efficiency"
    ],
    "Engineering & Construction Services": [
      "Lifecycle Impacts of Buildings & Infrastructure",
      "Business Ethics",
      "Workforce Health & Safety",
      "Structural Integrity & Safety"
    ],
    "Gas Utilities & Distributors": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Workforce Health & Safety",
      "Grid Resiliency"
    ],
    "Home Builders": [
      "Land Use & Ecological Impacts",
      "Climate Change Adaptation",
      "Energy Efficiency in Home Building",
      "Water Management",
      "Workforce Health & Safety"
    ],
    "Real Estate": [
      "Energy Management",
      "Water Management",
      "Management of Tenant Sustainability Impacts",
      "Climate Change Adaptation"
    ],
    "Real Estate Services": [
      "Business Ethics",
      "Data Privacy",
      "Transparent Fees & Commissions",
      "Workforce Diversity"
    ],
    "Waste Management": [
      "Greenhouse Gas Emissions",
      "Fleet Fuel Management",
      "Water Management",
      "Workforce Health & Safety",
      "Competitive Behaviour"
    ],
    "Water Utilities & Services": [
      "Water Supply Sustainability",
      "Energy Management",
      "Distribution Network Management",
      "Workforce Health & Safety",
      "Customer Affordability"
    ]
  },
  "Renewable Resources & Alternative Energy": {
    "Biofuels": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Water Management",
      "Biodiversity Impacts",
      "Workforce Health & Safety",
      "Land Use & Feedstock Sourcing"
    ],
    "Forestry Management": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Biodiversity Impacts",
      "Water Management",
      "Workforce Health & Safety",
      "Land Use & Ecological Impacts"
    ],
    "Fuel Cells & Industrial Batteries": [
      "Product Safety",
      "Hazardous Materials Management",
      "Product Lifecycle Management",
      "Materials Sourcing"
    ],
    "Pulp & Paper Products": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Water Management",
      "Wood Supply Chain Management",
      "Workforce Health & Safety"
    ],
    "Solar Technology & Project Developers": [
      "Greenhouse Gas Emissions",
      "Energy Management",
      "Water Management",
      "Hazardous Materials Management",
      "Ecological Impacts",
      "Grid Resiliency",
      "Materials Sourcing"
    ],
    "Wind Technology & Project Developers": [
      "Greenhouse Gas Emissions",
      "Ecological Impacts",
      "Grid Resiliency",
      "Materials Sourcing"
    ]
  },
  "Resource Transformation": {
    "Aerospace & Defense": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Fuel Economy & Emissions in Use-phase",
      "Materials Sourcing & Supply Chain Management",
      "Business Ethics",
      "Workforce Health & Safety"
    ],
    "Chemicals": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Water Management",
      "Hazardous Waste Management",
      "Chemical Safety",
      "Workforce Health & Safety",
      "Safety & Emergency Management"
    ],
    "Containers & Packaging": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Water Management",
      "Waste Management",
      "Product Lifecycle Management",
      "Materials Sourcing",
      "Workforce Health & Safety"
    ],
    "Electrical & Electronic Equipment": [
      "Energy Management",
      "Hazardous Waste Management",
      "Product End-of-Life Management",
      "Materials Sourcing"
    ],
    "Industrial Machinery & Goods": [
      "Energy Management",
      "Workforce Health & Safety",
      "Fuel Economy & Emissions in Product Use",
      "Materials Sourcing",
      "Remanufacturing Design & Services"
    ]
  },
  "Services": {
    "Advertising & Marketing": [
      "Advertising Integrity",
      "Data Privacy & Consumer Data",
      "Enabling Content"
    ],
    "Casinos & Gaming": [
      "Energy Management",
      "Water Management",
      "Responsible Gaming"
    ],
    "Education": [
      "Student Outcomes",
      "Quality & Safety",
      "Marketing & Recruiting Practices",
      "Student Financial Assistance & Education Costs",
      "Accessibility"
    ],
    "Hotels & Lodging": [
      "Energy Management",
      "Water Management",
      "Labour Practices",
      "Supply Chain Management"
    ],
    "Leisure Facilities": [
      "Energy Management",
      "Water Management",
      "Ecological Impacts",
      "Climate Change Impacts"
    ],
    "Media & Entertainment": [
      "Data Privacy",
      "Worker Safety in Production",
      "Enabling Digital Literacy & Content",
      "Intellectual Property Protection"
    ],
    "Professional & Commercial Services": [
      "Greenhouse Gas Emissions",
      "Data Privacy & Security",
      "Professional Integrity",
      "Workforce Diversity"
    ]
  },
  "Technology & Communications": {
    "Electronic Manufacturing Services & Original Design Manufacturing": [
      "Energy Management",
      "Water Management",
      "Hazardous Waste Management",
      "Product Lifecycle Management",
      "Materials Sourcing",
      "Workforce Health & Safety",
      "Labour Conditions in the Supply Chain"
    ],
    "Hardware": [
      "Energy Management",
      "Water Management",
      "Hazardous Waste Management",
      "Product Lifecycle Management",
      "Materials Sourcing",
      "Employee Inclusion"
    ],
    "Internet Media & Services": [
      "Environmental Footprint of Hardware Infrastructure",
      "Data Privacy & Freedom of Expression",
      "Data Security",
      "Employee Recruitment, Inclusion & Performance",
      "Intellectual Property Protection & Technology Stewardship"
    ],
    "Semiconductors": [
      "Energy Management",
      "Water Management",
      "Hazardous Waste Management",
      "Product Lifecycle Management",
      "Materials Sourcing",
      "Workforce Health & Safety"
    ],
    "Software & IT Services": [
      "Environmental Footprint of Hardware Infrastructure",
      "Data Privacy & Freedom of Expression",
      "Data Security",
      "Employee Recruitment, Inclusion & Performance",
      "Intellectual Property Protection & Technology Stewardship"
    ],
    "Telecommunication Services": [
      "Environmental Footprint of Operations",
      "Data Privacy",
      "Data Security",
      "Product End-of-life Management",
      "Competitive Behavior & Open Internet",
      "Managing Systemic Risks from Technology Disruptions"
    ]
  },
  "Transportation": {
    "Air Freight & Logistics": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Driver Working Conditions",
      "Accident & Safety Management"
    ],
    "Airlines": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Labour Relations",
      "Accident & Safety Management"
    ],
    "Auto Parts": [
      "Energy Management",
      "Workforce Health & Safety",
      "Materials Sourcing",
      "Product Safety",
      "Design for Fuel Efficiency"
    ],
    "Automobiles": [
      "Greenhouse Gas Emissions",
      "Fuel Economy & Use-phase Emissions",
      "Materials Sourcing",
      "Product Safety",
      "Workforce Health & Safety"
    ],
    "Car Rental & Leasing": [
      "Fleet Fuel Management & Emissions",
      "Labour Practices",
      "Customer Data Privacy"
    ],
    "Cruise Lines": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Water Management",
      "Waste Management",
      "Labour Relations",
      "Customer Health & Safety"
    ],
    "Marine Transportation": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Water Management",
      "Ecological Impacts",
      "Workforce Health & Safety",
      "Labour Relations",
      "Accident & Safety Management"
    ],
    "Rail Transportation": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Water Management",
      "Workforce Health & Safety",
      "Accident & Safety Management"
    ],
    "Road Transportation": [
      "Greenhouse Gas Emissions",
      "Air Quality",
      "Energy Management",
      "Driver Working Conditions",
      "Accident & Safety Management"
    ]
  }
};

// ----------------------------------------------------------------------
// Industry Metrics mapping
// ----------------------------------------------------------------------
export const SASB_INDUSTRY_METRICS: Record<string, SasbMetric[]> = {
  "Apparel, Accessories & Footwear": [
    {
      "topic": "Management of Chemicals in Products",
      "metric": "Description of processes to assess and manage risks and/or hazards associated with chemicals in products",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-AA-250a.1"
    },
    {
      "topic": "Environmental Impacts in the Supply Chain",
      "metric": "(1) Percentage of Tier 1 supplier facilities audited to a social responsibility code of conduct, (2) a list of the top five social sustainability risks identified in audits",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-AA-430a.1"
    },
    {
      "topic": "Environmental Impacts in the Supply Chain",
      "metric": "Percentage of raw materials third-party certified to an environmental or social sustainability standard, by standard",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "CG-AA-440a.2"
    },
    {
      "topic": "Labour Conditions in the Supply Chain",
      "metric": "Description of the greatest (1) labour and (2) environmental, health, and safety risks in the supply chain",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-AA-430a.2"
    },
    {
      "topic": "Raw Materials Sourcing",
      "metric": "Description of environmental risks associated with sourcing priority raw materials and management strategy for identified risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-AA-440a.1"
    }
  ],
  "Appliance Manufacturing": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "CG-AM-130a.1"
    },
    {
      "topic": "Product Lifecycle Management",
      "metric": "Percentage of eligible products by revenue certified to an energy efficiency certification",
      "category": "Quantitative",
      "unit": "Percentage (%) by revenue",
      "code": "CG-AM-410a.1"
    },
    {
      "topic": "Product Lifecycle Management",
      "metric": "Revenue from products designed with end-of-life management features",
      "category": "Quantitative",
      "unit": "Presentation currency, Percentage (%)",
      "code": "CG-AM-410a.2"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Description of the management of risks associated with the use of critical materials",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-AM-440a.1"
    },
    {
      "topic": "Product Safety",
      "metric": "List of certifications obtained, both new and current, for products",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-AM-250a.1"
    }
  ],
  "Building Products & Furnishings": [
    {
      "topic": "Wood Supply Chain Management",
      "metric": "Percentage of wood raw materials certified to third-party forest management standards",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "CG-BP-430a.1"
    },
    {
      "topic": "Wood Supply Chain Management",
      "metric": "Percentage of wood raw materials from certified reclaimed or post-consumer sources",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "CG-BP-430a.2"
    },
    {
      "topic": "Management of Chemicals in Products",
      "metric": "Description of processes to assess and manage risks and/or hazards associated with chemicals in products",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-BP-250a.1"
    },
    {
      "topic": "Product Lifecycle Management",
      "metric": "Description of efforts to manage product and packaging lifecycle impacts, specifically chemicals of concern",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-BP-410a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "CG-BP-130a.1"
    }
  ],
  "E-Commerce": [
    {
      "topic": "Environmental Impacts of Shipping Operations",
      "metric": "(1) Total greenhouse gas (GHG) footprint of product shipments, (2) percentage third-party certified",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "CG-EC-130a.1"
    },
    {
      "topic": "Environmental Impacts of Shipping Operations",
      "metric": "Discussion of strategies to reduce the environmental impact of product delivery",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-EC-130a.2"
    },
    {
      "topic": "Data Privacy & Advertising Standards",
      "metric": "Description of policies and practices relating to collection, usage, and retention of customer information",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-EC-220a.1"
    },
    {
      "topic": "Data Privacy & Advertising Standards",
      "metric": "(1) Number of data breaches, (2) percentage involving personally identifiable information, (3) number of customers affected",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "CG-EC-220a.2"
    },
    {
      "topic": "Labour Practices",
      "metric": "(1) Average hourly wage, by gender and by region, (2) percentage earning minimum wage",
      "category": "Quantitative",
      "unit": "Reporting currency, Percentage (%)",
      "code": "CG-EC-330a.1"
    },
    {
      "topic": "Labour Practices",
      "metric": "(1) Number of work-related injuries, (2) fatalities, (3) near misses",
      "category": "Quantitative",
      "unit": "Number, Rate",
      "code": "CG-EC-320a.1"
    },
    {
      "topic": "Supply Chain Management",
      "metric": "Discussion of supply chain transparency and management of environmental and social risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-EC-430a.1"
    }
  ],
  "Household & Personal Products": [
    {
      "topic": "Product Environmental & Health Profile",
      "metric": "Revenue from products with (1) no added parabens, phthalates, formaldehyde and formaldehyde releasers, and (2) products certified to third-party environmental or health and sustainability standards",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "CG-HP-250a.1"
    },
    {
      "topic": "Product Environmental & Health Profile",
      "metric": "Discussion of process to identify and manage emerging concerns about chemicals in products",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-HP-250a.2"
    },
    {
      "topic": "Environmental & Social Impacts of Palm Oil Supply Chain",
      "metric": "Percentage of palm oil sourced that is certified to Roundtable on Sustainable Palm Oil (RSPO) supply chain standards, by standard",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "CG-HP-430a.1"
    },
    {
      "topic": "Packaging Lifecycle Management",
      "metric": "(1) Total weight of packaging, (2) percentage made from recycled or renewable materials, (3) percentage that is recyclable, reusable, or compostable",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "CG-HP-410a.1"
    },
    {
      "topic": "Packaging Lifecycle Management",
      "metric": "Discussion of strategies to reduce the environmental impact of packaging throughout its lifecycle",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-HP-410a.2"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed; percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "CG-HP-140a.1"
    }
  ],
  "Multiline and Specialty Retailers & Distributors": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "CG-MR-130a.1"
    },
    {
      "topic": "Data Privacy & Customer Experience",
      "metric": "Description of policies and practices relating to collection, usage, and retention of customer information",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-MR-220a.1"
    },
    {
      "topic": "Labour Practices",
      "metric": "(1) Voluntary and (2) involuntary employee turnover rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "CG-MR-330a.1"
    },
    {
      "topic": "Labour Practices",
      "metric": "Average hourly wage and percentage of employees earning minimum wage",
      "category": "Quantitative",
      "unit": "Reporting currency, Percentage (%)",
      "code": "CG-MR-330a.2"
    },
    {
      "topic": "Supply Chain Management",
      "metric": "Percentage of (1) Tier 1 supplier facilities and (2) suppliers beyond Tier 1 that have been audited to a social sustainability code of conduct",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "CG-MR-430a.1"
    },
    {
      "topic": "Supply Chain Management",
      "metric": "Priority countries for sourcing and discussion of risks, both sourcing and destination, and strategy",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-MR-430a.2"
    }
  ],
  "Toys & Sporting Goods": [
    {
      "topic": "Product Safety",
      "metric": "Number of (1) recalls and (2) total units recalled",
      "category": "Quantitative",
      "unit": "Number",
      "code": "CG-TS-250a.1"
    },
    {
      "topic": "Product Safety",
      "metric": "Description of approach to quality and safety of products and management of related risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-TS-250a.2"
    },
    {
      "topic": "Environmental & Social Impacts of Supply Chain",
      "metric": "(1) Percentage of Tier 1 supplier facilities audited to a social responsibility code of conduct, (2) a list of the top five social sustainability risks identified in audits",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-TS-430a.1"
    },
    {
      "topic": "Environmental & Social Impacts of Supply Chain",
      "metric": "Percentage of raw materials third-party certified to an environmental or social sustainability standard, by standard",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "CG-TS-430a.2"
    },
    {
      "topic": "Management of Chemicals in Products",
      "metric": "Description of processes to assess and manage risks and/or hazards associated with chemicals in products, including any restrictions on chemicals of concern",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "CG-TS-250a.3"
    }
  ],
  "Coal Operations": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "EM-CO-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions, GHG emissions reduction targets, and analysis of performance against those targets",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-CO-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "(1) NOx, (2) SOx, and (3) particulate matter emissions",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "EM-CO-120a.1"
    },
    {
      "topic": "Ecological Impacts",
      "metric": "Percentage of (1) proved and (2) probable coal reserves in or near protected areas or areas of protected conservation status",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "EM-CO-160a.1"
    },
    {
      "topic": "Ecological Impacts",
      "metric": "Discussion of engagement processes and due diligence practices with respect to human rights, indigenous rights, and operation in areas of conflict",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-CO-160a.2"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "EM-CO-140a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Number of incidents of non-compliance associated with water quality permits, standards, and regulations",
      "category": "Quantitative",
      "unit": "Number",
      "code": "EM-CO-140a.2"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) MSHA All Incidence Rate, (2) fatality rate, (3) near miss frequency rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "EM-CO-320a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "Description of occupational health and safety management systems and practices",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-CO-320a.2"
    },
    {
      "topic": "Labour Relations",
      "metric": "Percentage of active workforce covered under collective bargaining agreements",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "EM-CO-310a.1"
    }
  ],
  "Construction Materials": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "EM-CM-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions, GHG emissions reduction targets, and analysis of performance against those targets",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-CM-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "(1) NOx, (2) SOx, (3) particulate matter (PM10), and (4) mercury (Hg) emissions",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "EM-CM-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "EM-CM-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "EM-CM-140a.1"
    },
    {
      "topic": "Waste Management",
      "metric": "Amount of waste generated, percentage hazardous, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "EM-CM-150a.1"
    },
    {
      "topic": "Biodiversity Impacts",
      "metric": "Description of environmental management policies and practices for active sites",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-CM-160a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) direct employees and (b) contract employees",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "EM-CM-320a.1"
    }
  ],
  "Iron & Steel Producers": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "EM-IS-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions, GHG emissions reduction targets, and analysis of performance against those targets",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-IS-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "(1) NOx, (2) SOx, (3) volatile organic compounds (VOCs), (4) particulate matter (PM), and (5) mercury (Hg) emissions",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "EM-IS-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "EM-IS-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "EM-IS-140a.1"
    },
    {
      "topic": "Waste Management",
      "metric": "Amount of waste generated, percentage hazardous, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "EM-IS-150a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) direct employees and (b) contract employees",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "EM-IS-320a.1"
    },
    {
      "topic": "Labour Relations",
      "metric": "Percentage of active workforce covered under collective bargaining agreements",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "EM-IS-310a.1"
    }
  ],
  "Metals & Mining": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "EM-MM-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions, GHG emissions reduction targets, and analysis of performance against those targets",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-MM-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) particulate matter (PM10), (4) mercury (Hg), (5) lead (Pb), and (6) volatile organic compounds (VOCs)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "EM-MM-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "EM-MM-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "EM-MM-140a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Number of incidents of non-compliance associated with water quality permits, standards, and regulations",
      "category": "Quantitative",
      "unit": "Number",
      "code": "EM-MM-140a.2"
    },
    {
      "topic": "Waste & Hazardous Materials Management",
      "metric": "(1) Total weight of tailings produced, (2) total weight of waste rock generated",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "EM-MM-150a.4"
    },
    {
      "topic": "Biodiversity Impacts",
      "metric": "Description of environmental management policies and practices for active sites",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-MM-160a.1"
    },
    {
      "topic": "Biodiversity Impacts",
      "metric": "Percentage of (1) proved and (2) probable reserves in or near protected areas or areas of protected conservation status",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "EM-MM-160a.2"
    },
    {
      "topic": "Security, Human Rights & Rights of Indigenous Peoples",
      "metric": "Percentage of (1) new projects and (2) total projects that have undergone a community impact assessment or equivalent",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "EM-MM-210b.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) direct employees and (b) contract employees",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "EM-MM-320a.1"
    },
    {
      "topic": "Labour Relations",
      "metric": "Percentage of active workforce covered under collective bargaining agreements, percentage in a country with the right to collectively bargain",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "EM-MM-310a.1"
    },
    {
      "topic": "Business Ethics & Payments Transparency",
      "metric": "Description of the management system for prevention of corruption and bribery throughout the value chain",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-MM-510a.1"
    }
  ],
  "Oil & Gas - Exploration & Production": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "EM-EP-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Amount of gross global Scope 1 GHG emissions from: (1) flared hydrocarbons, (2) other combustion, (3) process emissions, (4) other vented emissions, and (5) fugitive emissions",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e",
      "code": "EM-EP-110a.2"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions, GHG emissions reduction targets, and analysis of performance against those targets",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-EP-110a.3"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), and (4) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "EM-EP-120a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total fresh water withdrawn, (2) total fresh water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "EM-EP-140a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Volume of produced water and flowback generated; percentage (1) discharged, (2) injected, (3) recycled; hydrocarbon content in discharged water",
      "category": "Quantitative",
      "unit": "Cubic metres (m³), Percentage (%), Metric tonnes (t)",
      "code": "EM-EP-140a.2"
    },
    {
      "topic": "Biodiversity Impacts",
      "metric": "Description of environmental management policies and practices for active sites",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-EP-160a.2"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) direct employees and (b) contract employees",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "EM-EP-320a.1"
    },
    {
      "topic": "Business Ethics & Payments Transparency",
      "metric": "Description of the management system for prevention of corruption and bribery throughout the value chain",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-EP-510a.1"
    }
  ],
  "Oil & Gas - Midstream": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "EM-MD-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions, GHG emissions reduction targets, and analysis of performance against those targets",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-MD-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), and (4) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "EM-MD-120a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "EM-MD-140a.1"
    },
    {
      "topic": "Biodiversity Impacts",
      "metric": "Description of environmental management policies and practices for active sites",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-MD-160a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) direct employees and (b) contract employees",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "EM-MD-320a.1"
    },
    {
      "topic": "Emergency Management",
      "metric": "Number of reportable spills, volume of spills, and percentage recovered",
      "category": "Quantitative",
      "unit": "Number, Cubic metres (m³), Percentage (%)",
      "code": "EM-MD-160a.2"
    }
  ],
  "Oil & Gas - Refining & Marketing": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "EM-RM-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions, GHG emissions reduction targets, and analysis of performance against those targets",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-RM-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), (4) particulate matter (PM10), and (5) hydrogen sulfide (H2S)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "EM-RM-120a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "EM-RM-140a.1"
    },
    {
      "topic": "Hazardous Materials Management",
      "metric": "Amount of hazardous waste generated, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "EM-RM-150a.1"
    },
    {
      "topic": "Product Design & Lifecycle Management",
      "metric": "(1) Total addressable market and (2) revenue from renewable fuels and advanced biofuels",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Presentation currency",
      "code": "EM-RM-410a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) direct employees and (b) contract employees",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "EM-RM-320a.1"
    }
  ],
  "Oil & Gas - Services": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "EM-SV-110a.1"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), and (4) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "EM-SV-120a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total fresh water withdrawn, (2) total fresh water consumed",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³)",
      "code": "EM-SV-140a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) direct employees and (b) contract employees",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "EM-SV-320a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "Number of road accidents and incidents",
      "category": "Quantitative",
      "unit": "Number",
      "code": "EM-SV-320a.2"
    },
    {
      "topic": "Business Ethics & Payments Transparency",
      "metric": "Description of the management system for prevention of corruption and bribery throughout the value chain",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "EM-SV-510a.1"
    },
    {
      "topic": "Business Ethics & Payments Transparency",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with bribery or corruption",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "EM-SV-510a.2"
    }
  ],
  "Asset Management & Custody Activities": [
    {
      "topic": "Transparent Information & Fair Advice for Customers",
      "metric": "(1) Number and (2) percentage of covered employees with a record of investment-related investigation, consumer initiated complaint, private civil action, or customer arbitration",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "FN-AC-270a.1"
    },
    {
      "topic": "Employee Incentives & Risk Taking",
      "metric": "Percentage of variable compensation that is deferred",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "FN-AC-510a.1"
    },
    {
      "topic": "Employee Incentives & Risk Taking",
      "metric": "Description of compensation structures that incentivise long-term, sustainable value creation",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-AC-510a.2"
    },
    {
      "topic": "Integration of ESG Risk Factors in Investment Management",
      "metric": "Amount of assets under management (AUM), by asset class, that employ (1) integration of ESG issues, (2) sustainability-themed investing, (3) screening",
      "category": "Quantitative",
      "unit": "Reporting currency",
      "code": "FN-AC-410a.1"
    },
    {
      "topic": "Integration of ESG Risk Factors in Investment Management",
      "metric": "Description of how ESG factors are incorporated into investment and/or wealth management processes",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-AC-410a.2"
    },
    {
      "topic": "Management of Legal & Regulatory Environment",
      "metric": "Monetary losses as a result of legal proceedings associated with fraud, insider trading, anti-trust, anti-competitive behaviour, market manipulation, malpractice, or other related financial industry laws",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-AC-510a.3"
    },
    {
      "topic": "Systemic Risk Management",
      "metric": "Description of approach to systemic risk management in operations and investment strategies",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-AC-550a.1"
    },
    {
      "topic": "Employee Inclusion",
      "metric": "Percentage of gender and racial/ethnic group representation for (1) executive management, (2) non-executive management, (3) professionals, and (4) all other employees",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "FN-AC-330a.1"
    }
  ],
  "Commercial Banks": [
    {
      "topic": "Financial Inclusion & Capacity Building",
      "metric": "(1) Number and (2) amount of loans outstanding qualified to programmes designed to promote small business and community development",
      "category": "Quantitative",
      "unit": "Number, Reporting currency",
      "code": "FN-CB-240a.1"
    },
    {
      "topic": "Financial Inclusion & Capacity Building",
      "metric": "Number of no-cost retail checking accounts provided to previously unbanked or underbanked customers",
      "category": "Quantitative",
      "unit": "Number",
      "code": "FN-CB-240a.2"
    },
    {
      "topic": "Financial Inclusion & Capacity Building",
      "metric": "Number of participants in financial literacy initiatives for unbanked, underbanked, or underserved customers",
      "category": "Quantitative",
      "unit": "Number",
      "code": "FN-CB-240a.3"
    },
    {
      "topic": "Incorporation of ESG Factors in Credit Analysis",
      "metric": "Commercial and industrial credit exposure, by industry",
      "category": "Quantitative",
      "unit": "Reporting currency",
      "code": "FN-CB-410a.1"
    },
    {
      "topic": "Incorporation of ESG Factors in Credit Analysis",
      "metric": "Description of approach to incorporation of ESG factors in credit analysis",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-CB-410a.2"
    },
    {
      "topic": "Business Ethics",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with fraud, insider trading, anti-trust, anti-competitive behaviour, market manipulation, malpractice, or other related laws or regulations",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-CB-510a.1"
    },
    {
      "topic": "Business Ethics",
      "metric": "Description of whistleblower policies and procedures",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-CB-510a.2"
    },
    {
      "topic": "Systemic Risk Management",
      "metric": "Global Systemically Important Bank (G-SIB) score, by category",
      "category": "Quantitative",
      "unit": "Unitless",
      "code": "FN-CB-550a.1"
    },
    {
      "topic": "Systemic Risk Management",
      "metric": "Description of approach to managing systemic risks that could affect the stability of the financial system",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-CB-550a.2"
    },
    {
      "topic": "Data Security",
      "metric": "Number of data breaches, percentage involving personally identifiable information",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "FN-CB-230a.1"
    }
  ],
  "Consumer Finance": [
    {
      "topic": "Selling Practices & Transparency",
      "metric": "(1) Number of complaints filed by customers, (2) percentage with monetary or non-monetary relief, (3) percentage dispute rate with credit reporting agencies",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "FN-CF-270a.1"
    },
    {
      "topic": "Selling Practices & Transparency",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with selling and servicing of products",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-CF-270a.2"
    },
    {
      "topic": "Selling Practices & Transparency",
      "metric": "Description of policies and practices to ensure fair and responsible products, marketing, and financial education",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-CF-270a.3"
    },
    {
      "topic": "Data Privacy & Customer Experience",
      "metric": "Description of approach to identifying and addressing data security risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-CF-230a.1"
    },
    {
      "topic": "Business Ethics",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with fraud and other financial crimes",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-CF-510a.1"
    }
  ],
  "Insurance": [
    {
      "topic": "Transparent Information & Fair Advice for Customers",
      "metric": "Complaints-to-claims ratio",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "FN-IN-270a.1"
    },
    {
      "topic": "Transparent Information & Fair Advice for Customers",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with marketing and selling of products",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-IN-270a.2"
    },
    {
      "topic": "Incorporation of ESG Factors in Investment Management",
      "metric": "Total invested assets, by industry and asset class",
      "category": "Quantitative",
      "unit": "Reporting currency",
      "code": "FN-IN-410a.1"
    },
    {
      "topic": "Incorporation of ESG Factors in Investment Management",
      "metric": "Description of approach to incorporation of ESG factors in investment management processes",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-IN-410a.2"
    },
    {
      "topic": "Environmental Risk Exposure",
      "metric": "Probable maximum loss (PML) of insured products from weather-related natural catastrophes",
      "category": "Quantitative",
      "unit": "Reporting currency",
      "code": "FN-IN-450a.1"
    },
    {
      "topic": "Environmental Risk Exposure",
      "metric": "Total amount of monetary losses attributable to insurance payouts from (1) modelled natural catastrophes and (2) non-modelled natural catastrophes",
      "category": "Quantitative",
      "unit": "Reporting currency",
      "code": "FN-IN-450a.2"
    },
    {
      "topic": "Environmental Risk Exposure",
      "metric": "Description of process for developing and implementing exposure management strategies",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-IN-450a.3"
    },
    {
      "topic": "Systemic Risk Management",
      "metric": "Exposure to derivative instruments by category",
      "category": "Quantitative",
      "unit": "Reporting currency",
      "code": "FN-IN-550a.1"
    },
    {
      "topic": "Business Ethics",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with fraud, market manipulation, malpractice, or other related laws or regulations",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-IN-510a.1"
    }
  ],
  "Investment Banking & Brokerage": [
    {
      "topic": "Transparent Information & Fair Advice for Customers",
      "metric": "(1) Number and (2) percentage of covered employees with a record of investment-related investigation, consumer-initiated complaint, private civil action, or customer arbitration",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "FN-IB-270a.1"
    },
    {
      "topic": "Employee Incentives & Risk Taking",
      "metric": "Percentage of variable compensation that is deferred",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "FN-IB-510a.1"
    },
    {
      "topic": "Employee Incentives & Risk Taking",
      "metric": "Description of compensation structures that incentivise long-term, sustainable value creation",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-IB-510a.2"
    },
    {
      "topic": "Incorporation of ESG Factors in Investment Banking",
      "metric": "Revenue from investment banking services, by industry",
      "category": "Quantitative",
      "unit": "Reporting currency",
      "code": "FN-IB-410a.1"
    },
    {
      "topic": "Incorporation of ESG Factors in Investment Banking",
      "metric": "Description of approach to incorporation of ESG factors in investment banking and brokerage activities",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-IB-410a.2"
    },
    {
      "topic": "Business Ethics",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with fraud, insider trading, anti-trust, anti-competitive behaviour, market manipulation, malpractice, or other related laws",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-IB-510a.3"
    }
  ],
  "Mortgage Finance": [
    {
      "topic": "Selling Practices & Transparency",
      "metric": "(1) Number and (2) dollar amount of mortgages originated by category, (3) percentage of total mortgages to under-represented groups",
      "category": "Quantitative",
      "unit": "Number, Reporting currency, Percentage (%)",
      "code": "FN-MF-270a.1"
    },
    {
      "topic": "Selling Practices & Transparency",
      "metric": "(1) Number and (2) dollar amount of mortgages in foreclosure",
      "category": "Quantitative",
      "unit": "Number, Reporting currency",
      "code": "FN-MF-270a.2"
    },
    {
      "topic": "Selling Practices & Transparency",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with selling and servicing of products",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-MF-270a.3"
    },
    {
      "topic": "Selling Practices & Transparency",
      "metric": "Description of policies and practices to ensure equitable access to financial services",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-MF-270a.4"
    },
    {
      "topic": "Business Ethics",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with fraud, market manipulation, or other related laws or regulations",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-MF-510a.1"
    }
  ],
  "Security & Commodity Exchanges": [
    {
      "topic": "Transparent Information & Fair Advice for Customers",
      "metric": "Description of market surveillance systems and practices",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-EX-270a.1"
    },
    {
      "topic": "Transparent Information & Fair Advice for Customers",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with market manipulation, spoofing, and other related market integrity issues",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-EX-270a.2"
    },
    {
      "topic": "Business Ethics",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with anti-competitive behaviour",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FN-EX-510a.1"
    },
    {
      "topic": "Business Ethics",
      "metric": "Description of whistleblower policies and procedures",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-EX-510a.2"
    },
    {
      "topic": "Systemic Risk Management",
      "metric": "Description of approach to ensuring system reliability and integrity",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FN-EX-550a.1"
    }
  ],
  "Agricultural Products": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "FB-AG-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-AG-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), (4) particulate matter (PM10), and (5) hydrogen sulfide (H2S)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "FB-AG-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "FB-AG-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "FB-AG-140a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Number of incidents of non-compliance associated with water quality permits, standards, and regulations",
      "category": "Quantitative",
      "unit": "Number",
      "code": "FB-AG-140a.2"
    },
    {
      "topic": "Land Use & Ecological Impacts",
      "metric": "Amount of land owned, leased, or managed in or near areas of protected conservation status or endangered species habitat",
      "category": "Quantitative",
      "unit": "Hectares (ha)",
      "code": "FB-AG-160a.1"
    },
    {
      "topic": "Land Use & Ecological Impacts",
      "metric": "Description of strategy to manage land use impacts on ecosystem services",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-AG-160a.2"
    },
    {
      "topic": "Food Safety & Health Concerns",
      "metric": "Revenue from products labelled and/or marketed to promote health and nutrition attributes",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FB-AG-260a.1"
    },
    {
      "topic": "Supply Chain Management & Traceability",
      "metric": "Discussion of strategy and practices to manage risks and/or hazards associated with use of genetically modified organisms",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-AG-430a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "FB-AG-320a.1"
    }
  ],
  "Alcoholic Beverages": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "FB-AB-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "FB-AB-140a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Number of incidents of non-compliance associated with water quality permits, standards, and regulations",
      "category": "Quantitative",
      "unit": "Number",
      "code": "FB-AB-140a.2"
    },
    {
      "topic": "Responsible Drinking & Marketing",
      "metric": "Description of efforts to promote responsible drinking and manage related risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-AB-270a.1"
    },
    {
      "topic": "Responsible Drinking & Marketing",
      "metric": "Number of instances of non-compliance with industry or regulatory marketing and labelling codes",
      "category": "Quantitative",
      "unit": "Number",
      "code": "FB-AB-270a.2"
    },
    {
      "topic": "Packaging Lifecycle Management",
      "metric": "(1) Total weight of packaging, (2) percentage from recycled or renewable materials, (3) percentage recyclable, reusable, or compostable",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "FB-AB-410a.1"
    },
    {
      "topic": "Environmental & Social Impacts of Ingredient Supply Chain",
      "metric": "Percentage of agricultural ingredients sourced from regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "FB-AB-440a.1"
    },
    {
      "topic": "Environmental & Social Impacts of Ingredient Supply Chain",
      "metric": "List of priority agricultural ingredients and discussion of sourcing risks related to environmental and social considerations",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-AB-440a.2"
    }
  ],
  "Food Retailers & Distributors": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "FB-FR-130a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy from refrigerants, (2) percentage in HFCs, (3) percentage in natural refrigerants",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "FB-FR-130a.2"
    },
    {
      "topic": "Air Emissions from Refrigeration",
      "metric": "(1) Gross global Scope 1 GHG emissions, (2) percentage from refrigerants",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "FB-FR-110a.1"
    },
    {
      "topic": "Food Waste Management",
      "metric": "Amount of food waste generated, percentage diverted from the waste stream",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "FB-FR-150a.1"
    },
    {
      "topic": "Food Safety",
      "metric": "Number of recalls issued, total amount of product recalled",
      "category": "Quantitative",
      "unit": "Number, Metric tonnes (t)",
      "code": "FB-FR-250a.1"
    },
    {
      "topic": "Food Safety",
      "metric": "(1) Total number of notices of food safety violation received, (2) percentage corrected",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "FB-FR-250a.2"
    },
    {
      "topic": "Health & Nutrition",
      "metric": "Revenue from products labelled and/or marketed to promote health and nutrition attributes",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FB-FR-260a.1"
    },
    {
      "topic": "Health & Nutrition",
      "metric": "Discussion of the process to identify and manage products and ingredients related to nutritional and health concerns",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-FR-260a.2"
    },
    {
      "topic": "Packaging Lifecycle Management",
      "metric": "(1) Total weight of packaging, (2) percentage from recycled or renewable materials, (3) percentage recyclable, reusable, or compostable",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "FB-FR-410a.1"
    },
    {
      "topic": "Supply Chain Management",
      "metric": "Percentage of food supplier facilities certified to food safety standards",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "FB-FR-430a.1"
    }
  ],
  "Meat, Poultry & Dairy": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "FB-MP-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-MP-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), and (4) hydrogen sulfide (H2S)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "FB-MP-120a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "FB-MP-140a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Number of incidents of non-compliance associated with water quality permits, standards, and regulations",
      "category": "Quantitative",
      "unit": "Number",
      "code": "FB-MP-140a.2"
    },
    {
      "topic": "Land Use & Ecological Impacts",
      "metric": "Amount of land owned, leased, or managed in or near areas of protected conservation status",
      "category": "Quantitative",
      "unit": "Hectares (ha)",
      "code": "FB-MP-160a.1"
    },
    {
      "topic": "Animal Care",
      "metric": "Percentage of animals raised under (1) controlled atmosphere stunning and (2) conventional stunning",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "FB-MP-430a.1"
    },
    {
      "topic": "Animal Care",
      "metric": "Description of efforts to assess and manage the risks and/or hazards of the use of antibiotics in livestock",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-MP-430a.2"
    },
    {
      "topic": "Food Safety",
      "metric": "Global Food Safety Initiative (GFSI) audit non-conformance rates and corrective action rates for (a) major and (b) minor non-conformances",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "FB-MP-250a.1"
    },
    {
      "topic": "Food Safety",
      "metric": "Number of recalls issued and total amount of food product recalled",
      "category": "Quantitative",
      "unit": "Number, Metric tonnes (t)",
      "code": "FB-MP-250a.2"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "FB-MP-320a.1"
    }
  ],
  "Non-Alcoholic Beverages": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "FB-NB-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "FB-NB-140a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Number of incidents of non-compliance associated with water quality permits, standards, and regulations",
      "category": "Quantitative",
      "unit": "Number",
      "code": "FB-NB-140a.2"
    },
    {
      "topic": "Packaging Lifecycle Management",
      "metric": "(1) Total weight of packaging, (2) percentage from recycled or renewable materials, (3) percentage recyclable, reusable, or compostable",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "FB-NB-410a.1"
    },
    {
      "topic": "Packaging Lifecycle Management",
      "metric": "Discussion of strategies to reduce the environmental impact of packaging throughout its lifecycle",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-NB-410a.2"
    },
    {
      "topic": "Nutrition & Health",
      "metric": "Revenue from products labelled and/or marketed to promote health and nutrition attributes",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FB-NB-260a.1"
    },
    {
      "topic": "Nutrition & Health",
      "metric": "Discussion of the process to identify and manage products related to nutritional and health concerns",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-NB-260a.2"
    },
    {
      "topic": "Environmental & Social Impacts of Ingredient Supply Chain",
      "metric": "Percentage of beverage ingredients sourced from regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "FB-NB-440a.1"
    },
    {
      "topic": "Environmental & Social Impacts of Ingredient Supply Chain",
      "metric": "List of priority beverage ingredients and discussion of sourcing risks related to environmental and social considerations",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-NB-440a.2"
    }
  ],
  "Restaurants": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "FB-RN-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³)",
      "code": "FB-RN-140a.1"
    },
    {
      "topic": "Food Safety",
      "metric": "(1) Number of recalls issued, (2) total weight of food product recalled",
      "category": "Quantitative",
      "unit": "Number, Metric tonnes (t)",
      "code": "FB-RN-250a.1"
    },
    {
      "topic": "Food Safety",
      "metric": "(1) Number of notices of food safety violation, (2) percentage corrected",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "FB-RN-250a.2"
    },
    {
      "topic": "Nutrition & Health",
      "metric": "Revenue from products labelled and/or marketed to promote health and nutrition attributes",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FB-RN-260a.1"
    },
    {
      "topic": "Nutrition & Health",
      "metric": "Discussion of the process to identify and manage products and ingredients related to nutritional and health concerns",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-RN-260a.2"
    },
    {
      "topic": "Supply Chain Management & Food Integrity",
      "metric": "Percentage of food suppliers certified to food safety standards",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "FB-RN-430a.1"
    },
    {
      "topic": "Supply Chain Management & Food Integrity",
      "metric": "Description of strategies to manage risks associated with climate change impacts on ingredient sourcing",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-RN-430a.2"
    }
  ],
  "Tobacco": [
    {
      "topic": "Tobacco-Related Harm",
      "metric": "Tobacco settlement costs",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FB-TB-210a.1"
    },
    {
      "topic": "Tobacco-Related Harm",
      "metric": "Amount of monetary losses as a result of legal proceedings associated with tobacco health claims",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FB-TB-210a.2"
    },
    {
      "topic": "Chemical Additives, Ingredients, & By-products",
      "metric": "Percentage of combustible tobacco product revenue from products that (1) reduce harm and (2) expand market",
      "category": "Quantitative",
      "unit": "Percentage (%) by revenue",
      "code": "FB-TB-250a.1"
    },
    {
      "topic": "Chemical Additives, Ingredients, & By-products",
      "metric": "Description of efforts to develop tobacco and nicotine products with reduced harm potential",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-TB-250a.2"
    },
    {
      "topic": "Responsible Advertising & Marketing",
      "metric": "Number of incidents of non-compliance with industry or regulatory marketing and advertising codes",
      "category": "Quantitative",
      "unit": "Number",
      "code": "FB-TB-270a.1"
    },
    {
      "topic": "Responsible Advertising & Marketing",
      "metric": "Amount of monetary losses as a result of legal proceedings associated with marketing practices",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "FB-TB-270a.2"
    },
    {
      "topic": "Environmental & Social Impacts of Supply Chain",
      "metric": "Percentage of tobacco sourced from Voluntary Compliance Agreement (VCA) programme participants",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "FB-TB-430a.1"
    },
    {
      "topic": "Environmental & Social Impacts of Supply Chain",
      "metric": "Description of management of environmental and social risks associated with tobacco sourcing",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-TB-430a.2"
    }
  ],
  "Biotechnology & Pharmaceuticals": [
    {
      "topic": "Drug Safety",
      "metric": "List of products with a black box warning and their associated safety risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-BP-250a.1"
    },
    {
      "topic": "Drug Safety",
      "metric": "(1) Number of FDA enforcement actions taken in response to violations of manufacturing standards, (2) percentage corrected",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "HC-BP-250a.2"
    },
    {
      "topic": "Counterfeit Drugs",
      "metric": "Description of methods and technologies used to maintain traceability of products throughout the supply chain and prevent counterfeiting",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-BP-250a.3"
    },
    {
      "topic": "Drug Pricing & Access",
      "metric": "Percentage of revenues from (1) emerging markets and (2) least developed countries",
      "category": "Quantitative",
      "unit": "Percentage (%) by revenue",
      "code": "HC-BP-240a.1"
    },
    {
      "topic": "Drug Pricing & Access",
      "metric": "(1) List of products on the WHO Essential Medicines List (2) revenues from those products",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-BP-240a.2"
    },
    {
      "topic": "Drug Pricing & Access",
      "metric": "Patient Assistance Program expenditures",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-BP-240a.3"
    },
    {
      "topic": "Ethical Marketing",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with false marketing claims",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-BP-270a.1"
    },
    {
      "topic": "Intellectual Property Protection & Generic Drugs",
      "metric": "Percentage of total revenues from (1) innovative/branded and (2) generic products",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "HC-BP-520a.1"
    },
    {
      "topic": "Intellectual Property Protection & Generic Drugs",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with patent infringement",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-BP-520a.2"
    },
    {
      "topic": "Employee Recruitment, Inclusion & Performance",
      "metric": "(1) Voluntary and (2) involuntary employee turnover rate",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "HC-BP-330a.1"
    },
    {
      "topic": "Supply Chain Management",
      "metric": "Percentage of (1) entity's purchased inputs by cost and (2) supplier facilities audited to the Pharmaceutical Supply Chain Initiative (PSCI) principles",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "HC-BP-430a.1"
    }
  ],
  "Drug Retailers": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "HC-DR-130a.1"
    },
    {
      "topic": "Patient Privacy & Data Security",
      "metric": "Number of data breaches, percentage involving personally identifiable information",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "HC-DR-230a.1"
    },
    {
      "topic": "Drug Safety",
      "metric": "(1) Number of adverse events, (2) percentage that were reported to the Food and Drug Administration (FDA)",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "HC-DR-250a.1"
    },
    {
      "topic": "Drug Safety",
      "metric": "Discussion of programs and practices for safe dispensing and disposal of drugs",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-DR-250a.2"
    },
    {
      "topic": "Responsible Purchasing",
      "metric": "Number and value of drug products (1) returned and (2) donated due to safety concerns or excess stock",
      "category": "Quantitative",
      "unit": "Number, Presentation currency",
      "code": "HC-DR-430a.1"
    },
    {
      "topic": "Workforce Diversity",
      "metric": "Percentage of gender and racial/ethnic group representation in management and all employees",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "HC-DR-330a.1"
    }
  ],
  "Health Care Delivery": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "HC-DY-130a.1"
    },
    {
      "topic": "Patient Privacy & Data Security",
      "metric": "Number of data breaches, percentage involving personally identifiable information",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "HC-DY-230a.1"
    },
    {
      "topic": "Patient Safety",
      "metric": "Description of risk management practices for patient safety",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-DY-250a.1"
    },
    {
      "topic": "Patient Safety",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with medical errors",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-DY-250a.2"
    },
    {
      "topic": "Affordability & Access",
      "metric": "Number of patients (1) uninsured and (2) underinsured",
      "category": "Quantitative",
      "unit": "Number",
      "code": "HC-DY-240a.1"
    },
    {
      "topic": "Affordability & Access",
      "metric": "Amount of charity care provided",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-DY-240a.2"
    },
    {
      "topic": "Quality of Care",
      "metric": "Description of quality of care programs and investment in quality care",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-DY-260a.1"
    },
    {
      "topic": "Workforce Development",
      "metric": "(1) Total recordable incident rate (TRIR), (2) fatality rate, and (3) near miss frequency rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "HC-DY-320a.1"
    },
    {
      "topic": "Climate Change Impacts on Human Health & Infrastructure",
      "metric": "Description of policies and practices to address the physical and human health impacts of climate change",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-DY-450a.1"
    }
  ],
  "Health Care Distributors": [
    {
      "topic": "Environmental Footprint of Operations",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "HC-HD-130a.1"
    },
    {
      "topic": "Product Safety & Stewardship",
      "metric": "Description of the management of pharmaceutical product return and disposal",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-HD-250a.1"
    },
    {
      "topic": "Product Safety & Stewardship",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with product safety and stewardship",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-HD-250a.2"
    },
    {
      "topic": "Counterfeit Drugs",
      "metric": "Description of methods used to prevent the distribution of counterfeit products",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-HD-250a.3"
    },
    {
      "topic": "Business Ethics",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with bribery or corruption",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-HD-510a.1"
    },
    {
      "topic": "Business Ethics",
      "metric": "Description of code of ethics governing interactions with health care professionals",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-HD-510a.2"
    }
  ],
  "Managed Care": [
    {
      "topic": "Quality of Care",
      "metric": "(1) Medical loss ratio, (2) percentage in markets subject to minimum medical loss ratio requirements",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "HC-MC-260a.1"
    },
    {
      "topic": "Quality of Care",
      "metric": "Description of quality of care programs and measurement of quality of care",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-MC-260a.2"
    },
    {
      "topic": "Regulatory Compliance & Legal Settlements",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with coverage, billing, and access",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-MC-510a.1"
    },
    {
      "topic": "Transparent Information & Fair Advice for Customers",
      "metric": "(1) Member satisfaction as measured by the Consumer Assessment of Healthcare Providers & Systems (CAHPS) survey, (2) days to first appointment",
      "category": "Quantitative",
      "unit": "Number",
      "code": "HC-MC-240a.1"
    },
    {
      "topic": "Member Coverage",
      "metric": "Percentage of members grouped by type of plan",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "HC-MC-240a.2"
    }
  ],
  "Medical Equipment & Supplies": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "HC-MS-130a.1"
    },
    {
      "topic": "Product Safety",
      "metric": "(1) Number of recalls and (2) total units recalled",
      "category": "Quantitative",
      "unit": "Number",
      "code": "HC-MS-250a.1"
    },
    {
      "topic": "Product Safety",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with product safety",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-MS-250a.2"
    },
    {
      "topic": "Ethical Marketing",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with false marketing claims or off-label marketing",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-MS-270a.1"
    },
    {
      "topic": "Ethical Marketing",
      "metric": "Description of code of ethics governing promotion of products to health care professionals",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "HC-MS-270a.2"
    },
    {
      "topic": "Product Design & Lifecycle Management",
      "metric": "Revenue from products designed for reuse or remanufacturing",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "HC-MS-410a.1"
    },
    {
      "topic": "Supply Chain Management",
      "metric": "(1) Percentage of (a) entity's and (b) suppliers' facilities audited to quality management system standards",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "HC-MS-430a.1"
    }
  ],
  "Electric Utilities & Power Generators": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "IF-EU-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-EU-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) particulate matter (PM10), (4) lead (Pb), and (5) mercury (Hg)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "IF-EU-120a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "IF-EU-140a.1"
    },
    {
      "topic": "Coal Ash Management",
      "metric": "Amount of coal combustion products generated, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "IF-EU-150a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "IF-EU-320a.1"
    },
    {
      "topic": "Nuclear Safety & Emergency Management",
      "metric": "Description of policies and practices for nuclear safety and emergency preparedness",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-EU-540a.1"
    },
    {
      "topic": "Grid Resiliency",
      "metric": "(1) System average interruption duration index (SAIDI), (2) system average interruption frequency index (SAIFI), (3) customer average interruption duration index (CAIDI), with and without major event days",
      "category": "Quantitative",
      "unit": "Minutes, Number",
      "code": "IF-EU-550a.1"
    },
    {
      "topic": "Grid Resiliency",
      "metric": "Discussion of efforts to manage the impacts of climate change on operations, including physical and transition risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-EU-550a.2"
    },
    {
      "topic": "End-Use Efficiency",
      "metric": "Percentage of electric load served by smart grid technology",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "IF-EU-420a.1"
    }
  ],
  "Engineering & Construction Services": [
    {
      "topic": "Lifecycle Impacts of Buildings & Infrastructure",
      "metric": "Revenue from projects with an environmental and/or social impact assessment",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "IF-EN-410a.1"
    },
    {
      "topic": "Lifecycle Impacts of Buildings & Infrastructure",
      "metric": "Description of the approach to measuring, monitoring, and reducing the lifecycle impacts of projects",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-EN-410a.2"
    },
    {
      "topic": "Business Ethics",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with bribery or corruption",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "IF-EN-510a.1"
    },
    {
      "topic": "Business Ethics",
      "metric": "Description of policies and practices for prevention of corruption and bribery throughout the value chain",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-EN-510a.2"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) direct employees and (b) contract employees",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "IF-EN-320a.1"
    },
    {
      "topic": "Structural Integrity & Safety",
      "metric": "(1) Number of defect- and safety-related product recalls, (2) total units recalled",
      "category": "Quantitative",
      "unit": "Number",
      "code": "IF-EN-250a.1"
    },
    {
      "topic": "Structural Integrity & Safety",
      "metric": "Amount of back-log for projects due to defects and safety issues",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "IF-EN-250a.2"
    }
  ],
  "Gas Utilities & Distributors": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "IF-GU-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Description of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-GU-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "IF-GU-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "IF-GU-130a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "IF-GU-320a.1"
    },
    {
      "topic": "Grid Resiliency",
      "metric": "Number of (1) uncontrolled fire incidents, (2) explosions, and (3) pipeline ruptures",
      "category": "Quantitative",
      "unit": "Number",
      "code": "IF-GU-540a.1"
    },
    {
      "topic": "Grid Resiliency",
      "metric": "Description of the strategies to manage the risks of climate change for distribution and transmission infrastructure",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-GU-550a.1"
    }
  ],
  "Home Builders": [
    {
      "topic": "Land Use & Ecological Impacts",
      "metric": "(1) Number of home sites in or near areas of protected conservation status or endangered species habitat, (2) percentage that are in or near those areas",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "IF-HB-160a.1"
    },
    {
      "topic": "Land Use & Ecological Impacts",
      "metric": "Description of approach to managing environmental impacts of land use",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-HB-160a.2"
    },
    {
      "topic": "Climate Change Adaptation",
      "metric": "Number of homes delivered in (1) 100-year and (2) 500-year flood zones",
      "category": "Quantitative",
      "unit": "Number",
      "code": "IF-HB-420a.1"
    },
    {
      "topic": "Climate Change Adaptation",
      "metric": "Description of climate change risk exposure analysis and adaptation strategy",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-HB-420a.2"
    },
    {
      "topic": "Energy Efficiency in Home Building",
      "metric": "(1) Number and (2) percentage of homes delivered certified to a third-party multi-attribute green building standard",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "IF-HB-410a.1"
    },
    {
      "topic": "Energy Efficiency in Home Building",
      "metric": "(1) Average energy consumption and (2) percentage of homes delivered that exceed energy efficiency standards",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "IF-HB-410a.2"
    },
    {
      "topic": "Water Management",
      "metric": "Total water withdrawn and percentage in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "IF-HB-140a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) direct employees and (b) contract employees",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "IF-HB-320a.1"
    }
  ],
  "Real Estate": [
    {
      "topic": "Energy Management",
      "metric": "Energy consumption data coverage as a percentage of total floor area, by property subsector",
      "category": "Quantitative",
      "unit": "Percentage (%) by floor area",
      "code": "IF-RE-130a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed by portfolio area with data coverage and (2) percentage grid electricity",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "IF-RE-130a.2"
    },
    {
      "topic": "Energy Management",
      "metric": "Percentage of eligible portfolio that (1) has obtained an energy efficiency rating and (2) is certified to ENERGY STAR",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "IF-RE-130a.3"
    },
    {
      "topic": "Water Management",
      "metric": "Water withdrawal data coverage as a percentage of total floor area",
      "category": "Quantitative",
      "unit": "Percentage (%) by floor area",
      "code": "IF-RE-140a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn by portfolio area with data coverage and (2) percentage in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "IF-RE-140a.2"
    },
    {
      "topic": "Management of Tenant Sustainability Impacts",
      "metric": "(1) Percentage of new leases that contain a tenant sustainability clause and (2) percentage of tenants covered by those leases",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "IF-RE-410a.1"
    },
    {
      "topic": "Management of Tenant Sustainability Impacts",
      "metric": "Description of approach to measuring and improving sustainability impacts of tenants",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-RE-410a.2"
    },
    {
      "topic": "Climate Change Adaptation",
      "metric": "Area of property in (1) 100-year and (2) 500-year flood zones",
      "category": "Quantitative",
      "unit": "Square metres (m²)",
      "code": "IF-RE-450a.1"
    },
    {
      "topic": "Climate Change Adaptation",
      "metric": "Description of climate change risk exposure analysis, strategy, and performance",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-RE-450a.2"
    }
  ],
  "Real Estate Services": [
    {
      "topic": "Business Ethics",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with fraud, misrepresentation, or anti-competitive behaviour",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "IF-RS-510a.1"
    },
    {
      "topic": "Business Ethics",
      "metric": "Description of policies and practices for compliance with professional ethics codes",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-RS-510a.2"
    },
    {
      "topic": "Data Privacy",
      "metric": "Description of policies and practices relating to collection and sale of personal data",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-RS-220a.1"
    },
    {
      "topic": "Transparent Fees & Commissions",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with misleading fees or commissions",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "IF-RS-270a.1"
    },
    {
      "topic": "Workforce Diversity",
      "metric": "Percentage of gender and racial/ethnic group representation for (1) management, (2) professionals, and (3) all other employees",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "IF-RS-330a.1"
    }
  ],
  "Waste Management": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "IF-WM-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Description of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-WM-110a.2"
    },
    {
      "topic": "Fleet Fuel Management",
      "metric": "(1) Fleet fuel consumed, (2) percentage natural gas, (3) percentage from renewable sources",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "IF-WM-110a.3"
    },
    {
      "topic": "Water Management",
      "metric": "Water withdrawal and percentage in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "IF-WM-140a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "IF-WM-320a.1"
    },
    {
      "topic": "Competitive Behaviour",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with anti-competitive behaviour",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "IF-WM-520a.1"
    }
  ],
  "Water Utilities & Services": [
    {
      "topic": "Water Supply Sustainability",
      "metric": "(1) Total water sourced from regions with High or Extremely High Baseline Water Stress, (2) percentage",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "IF-WU-140a.1"
    },
    {
      "topic": "Water Supply Sustainability",
      "metric": "Description of water supply resilience strategy and the factors that could impair the ability to provide adequate supply",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "IF-WU-140a.2"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "IF-WU-130a.1"
    },
    {
      "topic": "Distribution Network Management",
      "metric": "(1) Number of main breaks, (2) percentage due to age",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "IF-WU-550a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "IF-WU-320a.1"
    },
    {
      "topic": "Customer Affordability",
      "metric": "(1) Average annual water and sewer cost per residential customer, (2) percentage of residential customers with past due bills",
      "category": "Quantitative",
      "unit": "Presentation currency, Percentage (%)",
      "code": "IF-WU-240a.1"
    }
  ],
  "Biofuels": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "(1) Scope 1 GHG emissions, (2) emissions from feedstock cultivation",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e",
      "code": "RR-BI-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "GHG emissions intensity, by product and feedstock",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e per metric tonne",
      "code": "RR-BI-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), (4) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "RR-BI-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "RR-BI-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "RR-BI-140a.1"
    },
    {
      "topic": "Biodiversity Impacts",
      "metric": "Description of environmental management policies and practices for agricultural supply chain",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-BI-160a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "RR-BI-320a.1"
    },
    {
      "topic": "Land Use & Feedstock Sourcing",
      "metric": "Percentage of (1) biofuel feedstocks that are certified by a third-party sustainability standard",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "RR-BI-160a.2"
    }
  ],
  "Forestry Management": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e",
      "code": "RR-FM-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Description of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-FM-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "RR-FM-120a.1"
    },
    {
      "topic": "Biodiversity Impacts",
      "metric": "Area of forestland managed: (1) certified to a third-party forest management standard, (2) in protected areas",
      "category": "Quantitative",
      "unit": "Hectares (ha)",
      "code": "RR-FM-160a.1"
    },
    {
      "topic": "Biodiversity Impacts",
      "metric": "Description of strategy to manage the risk of deforestation and forest degradation",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-FM-160a.2"
    },
    {
      "topic": "Water Management",
      "metric": "Description of water management risks and discussion of strategies and practices to mitigate those risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-FM-140a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "RR-FM-320a.1"
    },
    {
      "topic": "Land Use & Ecological Impacts",
      "metric": "Description of impact of operations on forest ecosystems",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-FM-160a.3"
    }
  ],
  "Fuel Cells & Industrial Batteries": [
    {
      "topic": "Product Safety",
      "metric": "Description of approach to managing product safety risks during transportation, storage, and installation",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-FC-250a.1"
    },
    {
      "topic": "Product Safety",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with product safety",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "RR-FC-250a.2"
    },
    {
      "topic": "Hazardous Materials Management",
      "metric": "Amount of hazardous waste generated, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "RR-FC-150a.1"
    },
    {
      "topic": "Product Lifecycle Management",
      "metric": "Description of end-of-life management policies and take-back programmes for fuel cells and batteries",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-FC-410a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Description of the management of risks associated with the use of critical materials",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-FC-440a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Percentage of cobalt, lithium, nickel, manganese, and other critical materials from certified responsible sources",
      "category": "Quantitative",
      "unit": "Percentage (%) by weight",
      "code": "RR-FC-440a.2"
    }
  ],
  "Pulp & Paper Products": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "RR-PP-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-PP-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), (4) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "RR-PP-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "RR-PP-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "RR-PP-140a.1"
    },
    {
      "topic": "Wood Supply Chain Management",
      "metric": "Percentage of wood fibre sourced from (1) third-party certified forests and (2) certified short-rotation plantations or agricultural sources",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "RR-PP-430a.1"
    },
    {
      "topic": "Wood Supply Chain Management",
      "metric": "Percentage of wood fibre sourced from (1) whole tree harvesting, (2) forest residue, (3) mill residue, (4) post-consumer recovered fibre",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "RR-PP-430a.2"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "RR-PP-320a.1"
    }
  ],
  "Solar Technology & Project Developers": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e",
      "code": "RR-ST-110a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "RR-ST-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Total water withdrawn and total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "RR-ST-140a.1"
    },
    {
      "topic": "Hazardous Materials Management",
      "metric": "Amount of hazardous waste generated, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "RR-ST-150a.1"
    },
    {
      "topic": "Ecological Impacts",
      "metric": "Description of project site selection and environmental impact assessment for solar projects",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-ST-160a.1"
    },
    {
      "topic": "Grid Resiliency",
      "metric": "Description of efforts to manage the grid resiliency impacts of solar technology",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-ST-550a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Percentage of polysilicon sourced from (1) companies that are certified and (2) companies not certified to a responsible sourcing programme",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "RR-ST-440a.1"
    }
  ],
  "Wind Technology & Project Developers": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e",
      "code": "RR-WT-110a.1"
    },
    {
      "topic": "Ecological Impacts",
      "metric": "(1) Number of reported bird and bat deaths and (2) description of mitigation strategies",
      "category": "Discussion and Analysis",
      "unit": "Number, n/a",
      "code": "RR-WT-160a.1"
    },
    {
      "topic": "Ecological Impacts",
      "metric": "Description of project site selection and environmental impact assessment for wind projects",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-WT-160a.2"
    },
    {
      "topic": "Grid Resiliency",
      "metric": "Description of efforts to manage the grid resiliency and reliability impacts of wind technology",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-WT-550a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Description of approach to managing environmental and social risks associated with rare earth minerals sourcing",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RR-WT-440a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Percentage of rare earth materials sourced from (1) companies certified and (2) companies not certified to a responsible sourcing programme",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "RR-WT-440a.2"
    }
  ],
  "Aerospace & Defense": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "RT-AE-110a.1"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), (4) particulate matter (PM10), (5) hazardous air pollutants (HAPs)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "RT-AE-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "RT-AE-130a.1"
    },
    {
      "topic": "Fuel Economy & Emissions in Use-phase",
      "metric": "(1) Percentage of products sold and (2) percentage of revenue from products that have obtained relevant fuel efficiency and emissions certification",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "RT-AE-410a.1"
    },
    {
      "topic": "Materials Sourcing & Supply Chain Management",
      "metric": "Percentage of (1) entity's and (2) suppliers' facilities audited to a supply chain risk management programme",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "RT-AE-430a.1"
    },
    {
      "topic": "Materials Sourcing & Supply Chain Management",
      "metric": "Description of approach to managing risks associated with use of critical materials",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RT-AE-440a.1"
    },
    {
      "topic": "Business Ethics",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with anti-competitive behaviour, bribery, or corruption",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "RT-AE-510a.1"
    },
    {
      "topic": "Business Ethics",
      "metric": "Description of whistleblower policies and procedures",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RT-AE-510a.2"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "RT-AE-320a.1"
    }
  ],
  "Chemicals": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "RT-CH-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RT-CH-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), (4) hazardous air pollutants (HAPs), and (5) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "RT-CH-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "RT-CH-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "RT-CH-140a.1"
    },
    {
      "topic": "Hazardous Waste Management",
      "metric": "Amount of hazardous waste generated, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "RT-CH-150a.1"
    },
    {
      "topic": "Chemical Safety",
      "metric": "(1) Percentage of products assessed for environmental and human health impacts and (2) percentage meeting goals",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "RT-CH-250a.1"
    },
    {
      "topic": "Chemical Safety",
      "metric": "Description of processes to identify and manage emerging concerns and product stewardship risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RT-CH-250a.2"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) employees and (b) contract workers",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "RT-CH-320a.1"
    },
    {
      "topic": "Safety & Emergency Management",
      "metric": "(1) Number of reportable releases and (2) total quantities released to the environment",
      "category": "Quantitative",
      "unit": "Number, Kilograms (kg)",
      "code": "RT-CH-540a.1"
    }
  ],
  "Containers & Packaging": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "RT-CP-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RT-CP-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) volatile organic compounds (VOCs), (4) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "RT-CP-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "RT-CP-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "RT-CP-140a.1"
    },
    {
      "topic": "Waste Management",
      "metric": "Amount of waste generated, percentage hazardous, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "RT-CP-150a.1"
    },
    {
      "topic": "Product Lifecycle Management",
      "metric": "Percentage of packaging materials that are (1) recyclable, (2) made from recycled content, (3) compostable",
      "category": "Quantitative",
      "unit": "Percentage (%) by weight",
      "code": "RT-CP-410a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Discussion of strategy to manage risks associated with sourcing of virgin materials",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RT-CP-440a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "RT-CP-320a.1"
    }
  ],
  "Electrical & Electronic Equipment": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "RT-EE-130a.1"
    },
    {
      "topic": "Hazardous Waste Management",
      "metric": "Amount of hazardous waste generated, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "RT-EE-150a.1"
    },
    {
      "topic": "Product End-of-Life Management",
      "metric": "Percentage of products by revenue that contain IEC 62474 declarable substances",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "RT-EE-410a.1"
    },
    {
      "topic": "Product End-of-Life Management",
      "metric": "(1) Total weight of products recovered and (2) percentage reused, recycled, or donated",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "RT-EE-410a.2"
    },
    {
      "topic": "Product End-of-Life Management",
      "metric": "Discussion of the processes for decommissioning electronic equipment",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RT-EE-410a.3"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Description of the management of risks associated with the use of critical materials",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RT-EE-440a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Percentage of tantalum, tin, gold, and tungsten smelters in supply chain certified to a responsible sourcing programme",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "RT-EE-440a.2"
    }
  ],
  "Industrial Machinery & Goods": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "RT-IG-130a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "RT-IG-320a.1"
    },
    {
      "topic": "Fuel Economy & Emissions in Product Use",
      "metric": "Revenue from products designed to improve resource efficiency and emissions in their use",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "RT-IG-410a.1"
    },
    {
      "topic": "Fuel Economy & Emissions in Product Use",
      "metric": "Description of approach and strategy to address fuel economy and lifecycle emissions in products",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RT-IG-410a.2"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Description of the management of risks associated with the use of critical materials",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "RT-IG-440a.1"
    },
    {
      "topic": "Remanufacturing Design & Services",
      "metric": "Revenue from (1) remanufactured products and (2) remanufacturing services",
      "category": "Quantitative",
      "unit": "Presentation currency, Percentage (%)",
      "code": "RT-IG-440a.2"
    }
  ],
  "Advertising & Marketing": [
    {
      "topic": "Advertising Integrity",
      "metric": "Revenue from (1) contracts that include standards and guidelines related to advertising content, (2) all advertising contracts",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "SV-AD-270a.1"
    },
    {
      "topic": "Advertising Integrity",
      "metric": "Number of incidents of non-compliance with industry or regulatory self-regulatory codes of conduct",
      "category": "Quantitative",
      "unit": "Number",
      "code": "SV-AD-270a.2"
    },
    {
      "topic": "Advertising Integrity",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with false advertising, consumer protection, or data privacy",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "SV-AD-270a.3"
    },
    {
      "topic": "Data Privacy & Consumer Data",
      "metric": "Description of policies and practices relating to collection, usage, and retention of customer information",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "SV-AD-220a.1"
    },
    {
      "topic": "Data Privacy & Consumer Data",
      "metric": "Number of (1) data breaches, (2) percentage involving personally identifiable information",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "SV-AD-220a.2"
    },
    {
      "topic": "Enabling Content",
      "metric": "Percentage of products and services involving (1) media classified as suitable for all ages, (2) media with restricted access due to mature content",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "SV-AD-260a.1"
    }
  ],
  "Casinos & Gaming": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "SV-CA-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed, percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "SV-CA-140a.1"
    },
    {
      "topic": "Responsible Gaming",
      "metric": "Description of policies and practices relating to fair and responsible marketing and customer protection",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "SV-CA-270a.1"
    },
    {
      "topic": "Responsible Gaming",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with deceptive or aggressive marketing practices",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "SV-CA-270a.2"
    },
    {
      "topic": "Responsible Gaming",
      "metric": "Number of (1) self-excluded customers and (2) customers barred from entering casino",
      "category": "Quantitative",
      "unit": "Number",
      "code": "SV-CA-270a.3"
    }
  ],
  "Education": [
    {
      "topic": "Student Outcomes",
      "metric": "(1) Graduation rates, (2) time to completion, and (3) percentage of students with job placement within 6 months of graduation",
      "category": "Quantitative",
      "unit": "Percentage (%), Years",
      "code": "SV-ED-260a.1"
    },
    {
      "topic": "Student Outcomes",
      "metric": "Loan repayment rates, by programme",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "SV-ED-260a.2"
    },
    {
      "topic": "Quality & Safety",
      "metric": "(1) Percentage of programmes accredited by a recognised accreditation body and (2) description of commitment to quality",
      "category": "Discussion and Analysis",
      "unit": "Percentage (%), n/a",
      "code": "SV-ED-260a.3"
    },
    {
      "topic": "Marketing & Recruiting Practices",
      "metric": "(1) Number and (2) amount of monetary losses as a result of legal proceedings associated with marketing and recruiting",
      "category": "Quantitative",
      "unit": "Number, Presentation currency",
      "code": "SV-ED-270a.1"
    },
    {
      "topic": "Student Financial Assistance & Education Costs",
      "metric": "Description of strategies used to reduce the risk of student loan delinquency and default",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "SV-ED-240a.1"
    },
    {
      "topic": "Accessibility",
      "metric": "Total amount of student financial aid and grants provided",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "SV-ED-240a.2"
    }
  ],
  "Hotels & Lodging": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "SV-HL-130a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "Energy consumed per (1) occupied room and (2) square metre of floor area",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ)",
      "code": "SV-HL-130a.2"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed; percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "SV-HL-140a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Water withdrawn per (1) occupied room and (2) square metre of floor area",
      "category": "Quantitative",
      "unit": "Cubic metres (m³)",
      "code": "SV-HL-140a.2"
    },
    {
      "topic": "Labour Practices",
      "metric": "(1) Voluntary and (2) involuntary employee turnover rate",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "SV-HL-310a.1"
    },
    {
      "topic": "Supply Chain Management",
      "metric": "Description of policies and practices for supply chain management, including identification of suppliers",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "SV-HL-430a.1"
    }
  ],
  "Leisure Facilities": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "SV-LF-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed; percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "SV-LF-140a.1"
    },
    {
      "topic": "Ecological Impacts",
      "metric": "Description of policies and practices to preserve ecological integrity at recreational sites",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "SV-LF-160a.1"
    },
    {
      "topic": "Ecological Impacts",
      "metric": "Number of incidents of non-compliance with environmental permits or regulations at recreational sites",
      "category": "Quantitative",
      "unit": "Number",
      "code": "SV-LF-160a.2"
    },
    {
      "topic": "Climate Change Impacts",
      "metric": "Description of risks associated with climate change to business operations and strategy for managing those risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "SV-LF-450a.1"
    }
  ],
  "Media & Entertainment": [
    {
      "topic": "Data Privacy",
      "metric": "Description of policies and practices relating to targeted advertising, personalisation, and data collection",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "SV-ME-220a.1"
    },
    {
      "topic": "Data Privacy",
      "metric": "Number of (1) data breaches, (2) percentage involving personally identifiable information",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "SV-ME-220a.2"
    },
    {
      "topic": "Worker Safety in Production",
      "metric": "Number of worker fatalities and injuries on production sets",
      "category": "Quantitative",
      "unit": "Number, Rate",
      "code": "SV-ME-320a.1"
    },
    {
      "topic": "Enabling Digital Literacy & Content",
      "metric": "Description of approaches to enable digital literacy and access for customers",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "SV-ME-260a.1"
    },
    {
      "topic": "Intellectual Property Protection",
      "metric": "Revenue generated from licensing of intellectual property (IP)",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "SV-ME-520a.1"
    },
    {
      "topic": "Intellectual Property Protection",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with intellectual property",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "SV-ME-520a.2"
    }
  ],
  "Professional & Commercial Services": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e",
      "code": "SV-PS-110a.1"
    },
    {
      "topic": "Data Privacy & Security",
      "metric": "Description of policies and practices relating to customer data collection, use, and security",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "SV-PS-220a.1"
    },
    {
      "topic": "Data Privacy & Security",
      "metric": "Number of (1) data breaches, (2) percentage involving personally identifiable information",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "SV-PS-220a.2"
    },
    {
      "topic": "Professional Integrity",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with professional integrity, including consumer protection",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "SV-PS-510a.1"
    },
    {
      "topic": "Professional Integrity",
      "metric": "Description of approach to ensuring professional integrity",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "SV-PS-510a.2"
    },
    {
      "topic": "Workforce Diversity",
      "metric": "Percentage of gender and racial/ethnic group representation for (1) executive management, (2) non-executive management, (3) professionals, and (4) all other employees",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "SV-PS-330a.1"
    }
  ],
  "Electronic Manufacturing Services & Original Design Manufacturing": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TC-ES-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed; percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "TC-ES-140a.1"
    },
    {
      "topic": "Hazardous Waste Management",
      "metric": "Amount of hazardous waste generated, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "TC-ES-150a.1"
    },
    {
      "topic": "Product Lifecycle Management",
      "metric": "Percentage of products by revenue that contain IEC 62474 declarable substances",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TC-ES-410a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "(1) Description of the management of risks associated with the use of critical materials, (2) percentage of Tier 1 suppliers that have verified sourcing of 3TG minerals from conflict-free smelters",
      "category": "Discussion and Analysis",
      "unit": "Percentage (%), n/a",
      "code": "TC-ES-440a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate for (a) direct employees and (b) contract employees",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "TC-ES-320a.1"
    },
    {
      "topic": "Labour Conditions in the Supply Chain",
      "metric": "Percentage of Tier 1 supplier facilities audited to a labour code of conduct",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TC-ES-430a.1"
    },
    {
      "topic": "Labour Conditions in the Supply Chain",
      "metric": "Percentage of Tier 1 supplier facilities that have the International Labour Organization (ILO) Core Conventions violations corrected",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TC-ES-430a.2"
    }
  ],
  "Hardware": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TC-HW-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed; percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "TC-HW-140a.1"
    },
    {
      "topic": "Hazardous Waste Management",
      "metric": "Amount of hazardous waste generated, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "TC-HW-150a.1"
    },
    {
      "topic": "Product Lifecycle Management",
      "metric": "Percentage of products by revenue that contain IEC 62474 declarable substances",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TC-HW-410a.1"
    },
    {
      "topic": "Product Lifecycle Management",
      "metric": "(1) Weight of end-of-life products recovered and (2) percentage reused, recycled, or donated",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "TC-HW-410a.2"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Description of the management of risks associated with the use of critical materials",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-HW-440a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Percentage of Tier 1 suppliers that have verified sourcing of 3TG minerals from conflict-free smelters",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TC-HW-440a.2"
    },
    {
      "topic": "Employee Inclusion",
      "metric": "Percentage of gender and racial/ethnic group representation for (1) management, (2) technical and (3) all other employees",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TC-HW-330a.1"
    }
  ],
  "Internet Media & Services": [
    {
      "topic": "Environmental Footprint of Hardware Infrastructure",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TC-IM-130a.1"
    },
    {
      "topic": "Environmental Footprint of Hardware Infrastructure",
      "metric": "(1) Total water withdrawn, (2) total water consumed; percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "TC-IM-130a.2"
    },
    {
      "topic": "Data Privacy & Freedom of Expression",
      "metric": "Description of policies and practices relating to behavioural advertising and user privacy",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-IM-220a.1"
    },
    {
      "topic": "Data Privacy & Freedom of Expression",
      "metric": "Number of users whose information is used for secondary purposes",
      "category": "Quantitative",
      "unit": "Number",
      "code": "TC-IM-220a.2"
    },
    {
      "topic": "Data Privacy & Freedom of Expression",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with user privacy",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "TC-IM-220a.3"
    },
    {
      "topic": "Data Security",
      "metric": "(1) Number of data breaches, (2) percentage involving personally identifiable information, (3) number of users affected",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "TC-IM-230a.1"
    },
    {
      "topic": "Data Security",
      "metric": "Description of approach to identifying and addressing data security risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-IM-230a.2"
    },
    {
      "topic": "Employee Recruitment, Inclusion & Performance",
      "metric": "(1) Percentage of gender and (2) percentage of racial and ethnic group representation for (a) management, (b) technical employees, and (c) all other employees",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TC-IM-330a.1"
    },
    {
      "topic": "Intellectual Property Protection & Technology Stewardship",
      "metric": "Description of the approach to identifying and addressing risks related to intellectual property",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-IM-520a.1"
    }
  ],
  "Semiconductors": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TC-SC-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed; percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "TC-SC-140a.1"
    },
    {
      "topic": "Hazardous Waste Management",
      "metric": "Amount of hazardous waste generated, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "TC-SC-150a.1"
    },
    {
      "topic": "Hazardous Waste Management",
      "metric": "Amount of hazardous waste disposed of, by treatment method",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "TC-SC-150a.2"
    },
    {
      "topic": "Product Lifecycle Management",
      "metric": "Percentage of products by revenue that contain IEC 62474 declarable substances",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TC-SC-410a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Percentage of Tier 1 suppliers that have verified sourcing of 3TG minerals from conflict-free smelters",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TC-SC-440a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Description of the management of risks associated with the use of critical materials",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-SC-440a.2"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "TC-SC-320a.1"
    }
  ],
  "Software & IT Services": [
    {
      "topic": "Environmental Footprint of Hardware Infrastructure",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TC-SI-130a.1"
    },
    {
      "topic": "Environmental Footprint of Hardware Infrastructure",
      "metric": "(1) Total water withdrawn, (2) total water consumed; percentage of each in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "TC-SI-130a.2"
    },
    {
      "topic": "Data Privacy & Freedom of Expression",
      "metric": "Description of policies and practices relating to collection, use, and disclosure of customer data",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-SI-220a.1"
    },
    {
      "topic": "Data Privacy & Freedom of Expression",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with user privacy",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "TC-SI-220a.2"
    },
    {
      "topic": "Data Security",
      "metric": "(1) Number of data breaches, (2) percentage involving personally identifiable information, (3) number of users affected",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "TC-SI-230a.1"
    },
    {
      "topic": "Data Security",
      "metric": "Description of approach to identifying and addressing data security risks, including use of third-party cybersecurity standards",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-SI-230a.2"
    },
    {
      "topic": "Employee Recruitment, Inclusion & Performance",
      "metric": "(1) Percentage of gender and (2) percentage of racial and ethnic group representation for (a) management, (b) technical employees, and (c) all other employees",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TC-SI-330a.1"
    },
    {
      "topic": "Intellectual Property Protection & Technology Stewardship",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with intellectual property infringement",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "TC-SI-520a.1"
    }
  ],
  "Air Freight & Logistics": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "TR-AF-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-AF-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "TR-AF-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total fuel consumed, (2) percentage natural gas, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TR-AF-130a.1"
    },
    {
      "topic": "Driver Working Conditions",
      "metric": "Percentage of drivers that are (1) company employees, (2) independent contractors",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TR-AF-310a.1"
    },
    {
      "topic": "Accident & Safety Management",
      "metric": "(1) Number of road accidents and incidents, (2) fatal accidents rate",
      "category": "Quantitative",
      "unit": "Number, Rate",
      "code": "TR-AF-540a.1"
    },
    {
      "topic": "Accident & Safety Management",
      "metric": "Description of progress towards an accident-free operations",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-AF-540a.2"
    }
  ],
  "Airlines": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "TR-AL-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-AL-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "TR-AL-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total fuel consumed, (2) percentage sustainable aviation fuel (SAF)",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TR-AL-130a.1"
    },
    {
      "topic": "Labour Relations",
      "metric": "Percentage of active workforce covered under collective bargaining agreements",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TR-AL-310a.1"
    },
    {
      "topic": "Labour Relations",
      "metric": "Number of work stoppages, total employee days idle",
      "category": "Quantitative",
      "unit": "Number, Days",
      "code": "TR-AL-310a.2"
    },
    {
      "topic": "Accident & Safety Management",
      "metric": "(1) Safety measurement system (SMS) implementation status, (2) number of accidents and incidents",
      "category": "Quantitative",
      "unit": "Number",
      "code": "TR-AL-540a.1"
    },
    {
      "topic": "Accident & Safety Management",
      "metric": "Description of strategy for managing the risks associated with the increased frequency and intensity of extreme weather events",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-AL-540a.2"
    }
  ],
  "Auto Parts": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TR-AP-130a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "TR-AP-320a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Description of the management of risks associated with the use of critical materials",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-AP-440a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Percentage of Tier 1 suppliers that have verified sourcing of 3TG minerals from conflict-free smelters",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TR-AP-440a.2"
    },
    {
      "topic": "Product Safety",
      "metric": "Number of recalls issued and total units recalled",
      "category": "Quantitative",
      "unit": "Number",
      "code": "TR-AP-250a.1"
    },
    {
      "topic": "Product Safety",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with product safety",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "TR-AP-250a.2"
    },
    {
      "topic": "Design for Fuel Efficiency",
      "metric": "Revenue from products designed to increase fuel efficiency and reduce emissions",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "TR-AP-410a.1"
    }
  ],
  "Automobiles": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "(1) Gross global Scope 1 GHG emissions and (2) Scope 3 emissions from product use",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e",
      "code": "TR-AU-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-AU-110a.2"
    },
    {
      "topic": "Fuel Economy & Use-phase Emissions",
      "metric": "Sales-weighted average passenger fleet fuel economy by region",
      "category": "Quantitative",
      "unit": "Litres per 100km, Miles per gallon (MPG)",
      "code": "TR-AU-410a.1"
    },
    {
      "topic": "Fuel Economy & Use-phase Emissions",
      "metric": "Description of strategy for managing the risks related to fuel economy and emissions regulations",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-AU-410a.2"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Description of the management of risks associated with the use of critical materials",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-AU-440a.1"
    },
    {
      "topic": "Materials Sourcing",
      "metric": "Percentage of Tier 1 suppliers that have verified sourcing of 3TG minerals from conflict-free smelters",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TR-AU-440a.2"
    },
    {
      "topic": "Product Safety",
      "metric": "Number of recalls issued and total units recalled",
      "category": "Quantitative",
      "unit": "Number",
      "code": "TR-AU-250a.1"
    },
    {
      "topic": "Product Safety",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with vehicle safety",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "TR-AU-250a.2"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "TR-AU-320a.1"
    }
  ],
  "Car Rental & Leasing": [
    {
      "topic": "Fleet Fuel Management & Emissions",
      "metric": "(1) Fleet fuel consumed, (2) percentage from alternative fuels, (3) percentage from renewable fuels",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TR-CR-110a.1"
    },
    {
      "topic": "Fleet Fuel Management & Emissions",
      "metric": "Discussion of strategy to manage fleet emissions and fuel economy",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-CR-110a.2"
    },
    {
      "topic": "Labour Practices",
      "metric": "(1) Voluntary and (2) involuntary employee turnover rate",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TR-CR-310a.1"
    },
    {
      "topic": "Customer Data Privacy",
      "metric": "Description of policies and practices relating to collection, usage, and retention of customer information",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-CR-220a.1"
    },
    {
      "topic": "Customer Data Privacy",
      "metric": "Number of data breaches, percentage involving personally identifiable information",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "TR-CR-220a.2"
    }
  ],
  "Cruise Lines": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "TR-CL-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-CL-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "TR-CL-120a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Percentage of wastewater (graywater and blackwater) treated before discharge, (2) volume of wastewater discharged in ports and protected areas",
      "category": "Quantitative",
      "unit": "Percentage (%), Cubic metres (m³)",
      "code": "TR-CL-140a.1"
    },
    {
      "topic": "Waste Management",
      "metric": "(1) Total weight of waste generated and (2) percentage recycled or composted",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "TR-CL-150a.1"
    },
    {
      "topic": "Labour Relations",
      "metric": "Percentage of active workforce covered under collective bargaining agreements",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TR-CL-310a.1"
    },
    {
      "topic": "Customer Health & Safety",
      "metric": "Number of passenger injuries",
      "category": "Quantitative",
      "unit": "Number",
      "code": "TR-CL-250a.1"
    },
    {
      "topic": "Customer Health & Safety",
      "metric": "Description of process for managing on-board passenger health and safety",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-CL-250a.2"
    }
  ],
  "Marine Transportation": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "TR-MT-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-MT-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "TR-MT-120a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Percentage of fleet that meets ballast water management standards and (2) number of reportable spills",
      "category": "Quantitative",
      "unit": "Percentage (%), Number",
      "code": "TR-MT-140a.1"
    },
    {
      "topic": "Ecological Impacts",
      "metric": "Description of efforts to reduce ecological impacts of shipping on marine and coastal ecosystems",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-MT-160a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "TR-MT-320a.1"
    },
    {
      "topic": "Labour Relations",
      "metric": "Percentage of active workforce covered under collective bargaining agreements",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TR-MT-310a.1"
    },
    {
      "topic": "Accident & Safety Management",
      "metric": "(1) Number of marine casualties, (2) percentage that resulted in total losses",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "TR-MT-540a.1"
    }
  ],
  "Rail Transportation": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "TR-RA-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-RA-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O) and (2) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "TR-RA-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total fuel consumed, (2) percentage from grid electricity, (3) percentage from alternative sources",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TR-RA-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Volume of water used in operations, percentage in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "TR-RA-140a.1"
    },
    {
      "topic": "Workforce Health & Safety",
      "metric": "(1) Total recordable incident rate (TRIR) and (2) fatality rate",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "TR-RA-320a.1"
    },
    {
      "topic": "Accident & Safety Management",
      "metric": "(1) Number of train accidents, (2) injuries, (3) fatalities, (4) associated fines and penalties",
      "category": "Quantitative",
      "unit": "Number, Presentation currency",
      "code": "TR-RA-540a.1"
    },
    {
      "topic": "Accident & Safety Management",
      "metric": "Description of approach to establishing the safety management system (SMS)",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-RA-540a.2"
    }
  ],
  "Road Transportation": [
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Gross global Scope 1 GHG emissions, percentage covered under emissions-limiting regulations",
      "category": "Quantitative",
      "unit": "Metric tonnes CO2-e, Percentage (%)",
      "code": "TR-RO-110a.1"
    },
    {
      "topic": "Greenhouse Gas Emissions",
      "metric": "Discussion of long-term and short-term strategy or plan to manage Scope 1 emissions",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-RO-110a.2"
    },
    {
      "topic": "Air Quality",
      "metric": "Air emissions of the following pollutants: (1) NOx (excluding N2O), (2) SOx, (3) particulate matter (PM10)",
      "category": "Quantitative",
      "unit": "Metric tonnes (t)",
      "code": "TR-RO-120a.1"
    },
    {
      "topic": "Energy Management",
      "metric": "(1) Total fuel consumed, (2) percentage from alternative fuels, (3) percentage from renewable fuels",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TR-RO-130a.1"
    },
    {
      "topic": "Driver Working Conditions",
      "metric": "Percentage of drivers that are (1) company employees, (2) independent contractors",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "TR-RO-310a.1"
    },
    {
      "topic": "Driver Working Conditions",
      "metric": "Total amount of monetary losses as a result of legal proceedings associated with driver working conditions",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "TR-RO-310a.2"
    },
    {
      "topic": "Accident & Safety Management",
      "metric": "(1) Number of road accidents and incidents, (2) fatal accident rate",
      "category": "Quantitative",
      "unit": "Number, Rate",
      "code": "TR-RO-540a.1"
    },
    {
      "topic": "Accident & Safety Management",
      "metric": "Description of progress towards achieving accident-free operations",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TR-RO-540a.2"
    }
  ],
  "Telecommunication Services": [
    {
      "topic": "Environmental Footprint of Operations",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "TC-TL-130a.1"
    },
    {
      "topic": "Environmental Footprint of Operations",
      "metric": "(1) Total water withdrawn, (2) total water consumed",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³)",
      "code": "TC-TL-140a.1"
    },
    {
      "topic": "Environmental Footprint of Operations",
      "metric": "Discussion of the integration of environmental considerations into strategic planning for network infrastructure",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-TL-130a.2"
    },
    {
      "topic": "Data Privacy",
      "metric": "Description of policies and practices relating to behavioural advertising and user privacy",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-TL-220a.1"
    },
    {
      "topic": "Data Privacy",
      "metric": "Number of government requests for customer information, percentage complied with",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "TC-TL-220a.2"
    },
    {
      "topic": "Data Privacy",
      "metric": "Number of customers whose information is used for secondary purposes",
      "category": "Quantitative",
      "unit": "Number",
      "code": "TC-TL-220a.3"
    },
    {
      "topic": "Data Security",
      "metric": "(1) Number of data breaches, (2) percentage involving personally identifiable information (PII), (3) number of customers affected",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "TC-TL-230a.1"
    },
    {
      "topic": "Data Security",
      "metric": "Description of approach to identifying and addressing data security risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-TL-230a.2"
    },
    {
      "topic": "Product End-of-life Management",
      "metric": "Mass of electronic waste collected, percentage recycled",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "TC-TL-410a.1"
    },
    {
      "topic": "Competitive Behavior & Open Internet",
      "metric": "Description of risks and opportunities associated with net neutrality and discussion of policy",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-TL-520a.1"
    },
    {
      "topic": "Competitive Behavior & Open Internet",
      "metric": "(1) Total amount of monetary losses from legal proceedings associated with anti-competitive practices",
      "category": "Quantitative",
      "unit": "Presentation currency",
      "code": "TC-TL-520a.2"
    },
    {
      "topic": "Managing Systemic Risks from Technology Disruptions",
      "metric": "Number of (1) performance issues and (2) service disruptions; (3) percentage caused by cybersecurity incidents",
      "category": "Quantitative",
      "unit": "Number, Percentage (%)",
      "code": "TC-TL-550a.1"
    },
    {
      "topic": "Managing Systemic Risks from Technology Disruptions",
      "metric": "Description of business continuity risks related to disruptions of operations",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "TC-TL-550a.2"
    }
  ],
  "Processed Foods": [
    {
      "topic": "Energy Management",
      "metric": "(1) Total energy consumed, (2) percentage grid electricity, (3) percentage renewable",
      "category": "Quantitative",
      "unit": "Gigajoules (GJ), Percentage (%)",
      "code": "FB-PF-130a.1"
    },
    {
      "topic": "Water Management",
      "metric": "(1) Total water withdrawn, (2) total water consumed; percentage in regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Thousand cubic metres (m³), Percentage (%)",
      "code": "FB-PF-140a.1"
    },
    {
      "topic": "Water Management",
      "metric": "Description of water management risks and discussion of strategies and practices to mitigate those risks",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-PF-140a.2"
    },
    {
      "topic": "Food Safety",
      "metric": "Global Food Safety Initiative (GFSI) audit conformance rates for (1) major and (2) minor non-conformances",
      "category": "Quantitative",
      "unit": "Rate",
      "code": "FB-PF-250a.1"
    },
    {
      "topic": "Food Safety",
      "metric": "(1) Number of recalls, (2) number of units recalled",
      "category": "Quantitative",
      "unit": "Number",
      "code": "FB-PF-250a.2"
    },
    {
      "topic": "Health & Nutrition",
      "metric": "Revenue from products labelled and/or marketed to (1) children and (2) families",
      "category": "Quantitative",
      "unit": "Presentation currency, Percentage (%)",
      "code": "FB-PF-270a.1"
    },
    {
      "topic": "Health & Nutrition",
      "metric": "Discussion of the process to identify and manage products and ingredients related to nutritional and health concerns",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-PF-270a.2"
    },
    {
      "topic": "Product Labeling & Marketing",
      "metric": "Percentage of advertising impressions made on children",
      "category": "Quantitative",
      "unit": "Percentage (%)",
      "code": "FB-PF-270a.3"
    },
    {
      "topic": "Packaging Lifecycle Management",
      "metric": "(1) Total weight of packaging, (2) percentage made from recycled or renewable materials, (3) percentage that is recyclable, reusable, or compostable",
      "category": "Quantitative",
      "unit": "Metric tonnes (t), Percentage (%)",
      "code": "FB-PF-410a.1"
    },
    {
      "topic": "Environmental & Social Impacts of Ingredient Supply Chain",
      "metric": "Percentage of ingredients sourced from regions with High or Extremely High Baseline Water Stress",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "FB-PF-430a.1"
    },
    {
      "topic": "Ingredient Sourcing",
      "metric": "Percentage of ingredients that are certified to third-party environmental or social sustainability standards",
      "category": "Quantitative",
      "unit": "Percentage (%) by cost",
      "code": "FB-PF-440a.1"
    },
    {
      "topic": "Ingredient Sourcing",
      "metric": "Discussion of sourcing risks due to environmental and social considerations",
      "category": "Discussion and Analysis",
      "unit": "n/a",
      "code": "FB-PF-440a.2"
    }
  ]
};
