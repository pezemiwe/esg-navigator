export interface TemplateMetric {
  id: string;
  name: string;
  unit: string;
  breakdown?: string[];
  description?: string;
  category?: string; // e.g., "GRI 306-3"
}

export const WAST_METRICS: TemplateMetric[] = [
  {
    id: "gri-306-3-total",
    name: "Total Waste Generated",
    unit: "Tonnes",
    description: "Total weight of waste generated from all sources",
    category: "GRI 306-3",
  },
  {
    id: "gri-306-3-breakdown",
    name: "Waste Breakdown",
    unit: "Tonnes",
    breakdown: ["Electronic Waste", "Material Waste", "Hazardous Waste"],
    category: "GRI 306-3",
  },
  {
    id: "gri-306-4",
    name: "Waste Diverted from Disposal",
    unit: "Tonnes",
    description: "Total weight of waste diverted (Recycled/Reused)",
    category: "GRI 306-4",
  },
  {
    id: "gri-306-5",
    name: "Waste Directed to Disposal",
    unit: "Tonnes (By Method)",
    breakdown: ["Incineration", "Landfill", "Other"],
    category: "GRI 306-5",
  },
];

export const ENERGY_METRICS: TemplateMetric[] = [
  {
    id: "gri-302-1-total",
    name: "Total Energy Consumption",
    unit: "Gigajoules (GJ)",
    category: "GRI 302-1",
  },
  {
    id: "gri-302-1-source",
    name: "Energy Consumption by Source",
    unit: "GJ",
    breakdown: [
      "Natural Gas",
      "Diesel",
      "Petrol",
      "Electricity (Grid)",
      "Solar",
      "Hydro",
      "Wind",
    ],
    category: "GRI 302-1",
  },
  {
    id: "sasb-130a-1",
    name: "Grid Electricity Percentage",
    unit: "%",
    category: "SASB FB-PF-130a.1",
  },
  {
    id: "sasb-130a-1-renewable",
    name: "Renewable Energy Percentage",
    unit: "%",
    category: "SASB FB-PF-130a.1",
  },
];

export const WATER_METRICS: TemplateMetric[] = [
  {
    id: "gri-303-3-withdrawal",
    name: "Total Water Withdrawal",
    unit: "Cubic Meters (m³)",
    breakdown: ["Surface Water", "Ground Water", "Rainwater", "Municipal"],
    category: "GRI 303-3",
  },
  {
    id: "sasb-140a-1-stress",
    name: "Water Withdrawn in High Stress Regions",
    unit: "m³",
    description:
      "Amount withdrawn from regions with High or Extremely High Baseline Water Stress",
    category: "SASB FB-PF-140a.1",
  },
];

export const BIODIVERSITY_METRICS: TemplateMetric[] = [
  {
    id: "gri-304-1",
    name: "Sites in Protected Areas",
    unit: "Count / Area (km²)",
    description:
      "Operational sites owned, leased, managed in, or adjacent to, protected areas",
    category: "GRI 304-1",
  },
  {
    id: "gri-304-3",
    name: "Habitats Protected/Restored",
    unit: "Area (km²)",
    category: "GRI 304-3",
  },
];

export const PRODUCT_SAFETY_METRICS: TemplateMetric[] = [
  {
    id: "sasb-250a-1",
    name: "Revenue from Products with Substances of Concern",
    unit: "Currency ($)",
    description:
      "Total revenue from products that contain substances of high concern",
    category: "SASB FB-PF-250a.1",
  },
  {
    id: "sasb-250a-2",
    name: "Incidents of Non-Compliance",
    unit: "Count",
    description:
      "Incidents concerning the health and safety impacts of products and services",
    category: "SASB FB-PF-250a.2",
  },
];

// Mapping helper
export const getTemplateForRisk = (riskName: string): TemplateMetric[] => {
  const normalized = riskName.toLowerCase();
  if (normalized.includes("waste") || normalized.includes("effluent"))
    return WAST_METRICS;
  if (
    normalized.includes("energy") ||
    normalized.includes("fuel") ||
    normalized.includes("carbon")
  )
    return ENERGY_METRICS;
  if (normalized.includes("water")) return WATER_METRICS;
  if (normalized.includes("biodiversity") || normalized.includes("land use"))
    return BIODIVERSITY_METRICS;
  if (
    normalized.includes("product") ||
    normalized.includes("safety") ||
    normalized.includes("health")
  )
    return PRODUCT_SAFETY_METRICS;

  // Default Generic
  return [
    {
      id: "generic-financial",
      name: "Financial Impact",
      unit: "Currency",
      category: "Generic",
    },
    {
      id: "generic-mitigation",
      name: "Mitigation Cost",
      unit: "Currency",
      category: "Generic",
    },
  ];
};
