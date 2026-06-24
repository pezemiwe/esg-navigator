import type { LucideIcon } from "lucide-react";
import {
  Building2,
  TrendingUp,
  BarChart4,
  Shield,
  Wallet,
  Landmark,
  Database,
  Radio,
  Server,
  Cpu,
  Wifi,
  Smartphone,
  Truck,
} from "lucide-react";

export interface IndustryAssetType {
  id: string;
  name: string;
  category: string;
  description: string;
  templateFile: string;
  dataFields: string[];
  icon: LucideIcon;
  priority: "high" | "medium" | "low";
  estimatedRows: number;
}

export interface IndustryTransitionDriver {
  id: string;
  label: string;
}

export interface IndustryTransitionCategory {
  id: string;
  label: string;
  items: IndustryTransitionDriver[];
}

export interface IndustryCollateralMap {
  [hazard: string]: string[];
}

export interface IndustrySegmentationConfig {
  sectors: string[];
  segmentLabel: string;
  segmentDescription: string;
}

export interface IndustryModuleConfig {
  visibleModuleIds: string[];
}

export interface IndustryCRALabels {
  dataUploadTitle: string;
  dataUploadSubtitle: string;
  portfolioLabel: string;
  exposureLabel: string;
  dashboardTitle: string;
  dashboardSubtitle: string;
  sectorExposureTitle: string;
  sectorExposureSubtitle: string;
}

export interface IndustryConfig {
  id: string;
  assetTypes: IndustryAssetType[];
  transitionDrivers: IndustryTransitionCategory[];
  collateralMap: IndustryCollateralMap;
  segmentation: IndustrySegmentationConfig;
  modules: IndustryModuleConfig;
  craLabels: IndustryCRALabels;
  sectorExposure: {
    sector: string;
    exposure: number;
    risk: string;
    trend: string;
    riskScore: number;
    color: string;
  }[];
}

const FINANCIAL_SERVICES_CONFIG: IndustryConfig = {
  id: "financial_services",
  assetTypes: [
    {
      id: "loans_advances",
      name: "Loans & Advances",
      category: "Core Assets",
      description:
        "Corporate, retail, and commercial loan portfolios including term loans and revolving credit facilities",
      templateFile: "loans_advances_template.xlsx",
      dataFields: [
        "Loan ID",
        "Principal",
        "Interest Rate",
        "Maturity Date",
        "Industry",
        "Geopolitical Zone",
        "State",
        "Collateral Type",
      ],
      icon: Building2,
      priority: "high",
      estimatedRows: 50000,
    },
    {
      id: "equities",
      name: "Equity Securities",
      category: "Investment Portfolio",
      description:
        "Listed and unlisted equity investments across global markets",
      templateFile: "equities_template.xlsx",
      dataFields: [
        "Security ID",
        "Ticker",
        "Shares Held",
        "Market Value",
        "Sector",
        "ESG Score",
        "Dividend Yield",
      ],
      icon: TrendingUp,
      priority: "high",
      estimatedRows: 25000,
    },
    {
      id: "bonds_fixed_income",
      name: "Fixed Income Securities",
      category: "Investment Portfolio",
      description:
        "Government and corporate bonds, money market instruments, and other debt securities",
      templateFile: "bonds_template.xlsx",
      dataFields: [
        "Bond ISIN",
        "Coupon Rate",
        "Maturity",
        "Credit Rating",
        "Issuer",
        "Yield",
        "Currency",
      ],
      icon: Landmark,
      priority: "medium",
      estimatedRows: 35000,
    },
    {
      id: "derivatives",
      name: "Derivative Instruments",
      category: "Trading Assets",
      description:
        "Options, futures, swaps, forward contracts, and structured products across asset classes",
      templateFile: "derivatives_template.xlsx",
      dataFields: [
        "Contract ID",
        "Underlying Asset",
        "Notional Value",
        "Expiry",
        "Counterparty",
        "MTM Value",
        "Risk Category",
      ],
      icon: BarChart4,
      priority: "high",
      estimatedRows: 15000,
    },
    {
      id: "guarantees_obs",
      name: "Off-Balance Sheet Exposures",
      category: "Contingent Liabilities",
      description:
        "Guarantees, letters of credit, undrawn commitments, and other contingent exposures",
      templateFile: "guarantees_template.xlsx",
      dataFields: [
        "Exposure ID",
        "Type",
        "Notional Amount",
        "Counterparty",
        "Tenor",
        "Collateral",
        "Probability of Default",
      ],
      icon: Shield,
      priority: "medium",
      estimatedRows: 12000,
    },
    {
      id: "investment_property",
      name: "Investment Property",
      category: "Real Assets",
      description:
        "Commercial real estate properties held for investment purposes",
      templateFile: "property_template.xlsx",
      dataFields: [
        "Property ID",
        "State",
        "Property Type",
        "Area (sqm)",
        "Valuation",
        "Occupancy Rate",
        "Year Built",
      ],
      icon: Building2,
      priority: "medium",
      estimatedRows: 8000,
    },
    {
      id: "deposits_cash",
      name: "Deposits & Cash Equivalents",
      category: "Liquidity Assets",
      description:
        "Customer deposits, cash reserves, and highly liquid marketable securities",
      templateFile: "deposits_template.xlsx",
      dataFields: [
        "Account ID",
        "Type",
        "Balance",
        "Currency",
        "Maturity",
        "Interest Rate",
        "Institution",
      ],
      icon: Wallet,
      priority: "low",
      estimatedRows: 100000,
    },
    {
      id: "insurance_assets",
      name: "Insurance & Reinsurance",
      category: "Specialized Assets",
      description:
        "Insurance contracts, reinsurance receivables, and technical reserves",
      templateFile: "insurance_template.xlsx",
      dataFields: [
        "Policy ID",
        "Type",
        "Insured Amount",
        "Premium",
        "Term",
        "Risk Profile",
        "Counterparty",
      ],
      icon: Shield,
      priority: "low",
      estimatedRows: 15000,
    },
  ],
  transitionDrivers: [
    {
      id: "policy",
      label: "Policy & Legal",
      items: [
        { id: "carbon_tax", label: "Carbon Tax" },
        { id: "emissions_caps", label: "Emissions Caps" },
        { id: "subsidy_removal", label: "Subsidy Removal" },
        { id: "mandatory_disclosures", label: "Mandatory Disclosures" },
      ],
    },
    {
      id: "technology",
      label: "Technology",
      items: [
        {
          id: "clean_tech_substitution",
          label: "Clean Technology Substitution",
        },
        { id: "asset_obsolescence", label: "Asset Obsolescence" },
        { id: "energy_efficiency", label: "Energy Efficiency Requirements" },
      ],
    },
    {
      id: "market",
      label: "Market",
      items: [
        { id: "demand_shift", label: "Demand Shift" },
        { id: "price_volatility", label: "Price Volatility" },
        { id: "input_cost_increases", label: "Input Cost Increases" },
      ],
    },
    {
      id: "reputation",
      label: "Reputation",
      items: [
        { id: "consumer_backlash", label: "Consumer Backlash" },
        { id: "investor_divestment", label: "Investor Divestment" },
      ],
    },
  ],
  collateralMap: {
    Flood: ["Land", "Buildings"],
    Drought: ["Agricultural Land", "Crop Assets"],
    "Heat Wave": ["Equipment", "Machinery"],
    "Sea Level Rise": ["Coastal Properties", "Port Infrastructure"],
    "Storm / Cyclone": ["Buildings", "Vehicles", "Equipment"],
    Landslide: ["Land", "Hillside Properties"],
    Wildfire: ["Forestry Assets", "Rural Properties"],
    "Coastal Erosion": ["Coastal Properties", "Land"],
    "Cold Wave / Frost": ["Agricultural Land", "Livestock"],
  },
  segmentation: {
    sectors: [
      "Agriculture",
      "Manufacturing",
      "Construction",
      "Trade/Commerce",
      "Financial Services",
      "Services",
      "Transport & Storage",
      "Mining & Quarrying",
      "Utilities",
      "Real Estate",
    ],
    segmentLabel: "Sector",
    segmentDescription: "Economic sector classification",
  },
  modules: {
    visibleModuleIds: ["cra", "scenario", "sdg", "learning", "materia", "esrm"],
  },
  craLabels: {
    dataUploadTitle: "Asset Portfolio Data Upload",
    dataUploadSubtitle:
      "Upload financial asset data for comprehensive climate risk assessment. Ensure all required datasets are validated before proceeding to analysis.",
    portfolioLabel: "Portfolio",
    exposureLabel: "Exposure",
    dashboardTitle: "Climate Risk Assessment",
    dashboardSubtitle:
      "Comprehensive climate risk evaluation across your financial portfolio",
    sectorExposureTitle: "Sector Exposure Analysis",
    sectorExposureSubtitle: "Risk distribution across key economic sectors",
  },
  sectorExposure: [
    {
      sector: "Agriculture & Forestry",
      exposure: 450,
      risk: "High",
      trend: "+12%",
      riskScore: 8.4,
      color: "#EF4444",
    },
    {
      sector: "Energy & Utilities",
      exposure: 320,
      risk: "Medium",
      trend: "+8%",
      riskScore: 6.2,
      color: "#F59E0B",
    },
    {
      sector: "Transport & Storage",
      exposure: 280,
      risk: "High",
      trend: "+15%",
      riskScore: 7.9,
      color: "#EF4444",
    },
    {
      sector: "Real Estate",
      exposure: 210,
      risk: "Medium",
      trend: "+5%",
      riskScore: 5.5,
      color: "#F59E0B",
    },
    {
      sector: "Manufacturing",
      exposure: 180,
      risk: "Low",
      trend: "+3%",
      riskScore: 3.2,
      color: "#10B981",
    },
    {
      sector: "Infrastructure",
      exposure: 150,
      risk: "Medium",
      trend: "+7%",
      riskScore: 4.8,
      color: "#F59E0B",
    },
  ],
};

const TELECOMMUNICATIONS_CONFIG: IndustryConfig = {
  id: "telecommunications",
  assetTypes: [
    {
      id: "tower_infrastructure",
      name: "Tower Infrastructure",
      category: "Network Assets",
      description:
        "Cell towers, masts, rooftop installations, and supporting ground infrastructure across all coverage zones",
      templateFile: "tower_infrastructure_template.xlsx",
      dataFields: [
        "Tower ID",
        "Tower Type",
        "Height (m)",
        "Geopolitical Zone",
        "State",
        "Latitude",
        "Longitude",
        "Capacity (Tenants)",
        "Power Source",
        "Net Book Value",
      ],
      icon: Radio,
      priority: "high",
      estimatedRows: 30000,
    },
    {
      id: "fiber_network",
      name: "Fiber Optic Network",
      category: "Network Assets",
      description:
        "Backbone and last-mile fiber optic cables, ducts, manholes, and optical distribution infrastructure",
      templateFile: "fiber_network_template.xlsx",
      dataFields: [
        "Segment ID",
        "Route Name",
        "Length (km)",
        "Fiber Type",
        "Geopolitical Zone",
        "State",
        "Installation Year",
        "Capacity (Gbps)",
        "Net Book Value",
      ],
      icon: Wifi,
      priority: "high",
      estimatedRows: 15000,
    },
    {
      id: "data_centers",
      name: "Data Centers & Core Network",
      category: "Core Infrastructure",
      description:
        "Data centers, switching centers, core network nodes, and edge computing facilities",
      templateFile: "data_centers_template.xlsx",
      dataFields: [
        "Facility ID",
        "Facility Type",
        "Geopolitical Zone",
        "State",
        "Power Capacity (MW)",
        "Cooling Type",
        "Tier Level",
        "PUE Rating",
        "Net Book Value",
      ],
      icon: Server,
      priority: "high",
      estimatedRows: 500,
    },
    {
      id: "spectrum_licenses",
      name: "Spectrum & Licenses",
      category: "Intangible Assets",
      description:
        "Radio frequency spectrum allocations, operating licenses, and regulatory permits",
      templateFile: "spectrum_licenses_template.xlsx",
      dataFields: [
        "License ID",
        "Spectrum Band",
        "Bandwidth (MHz)",
        "Coverage Area",
        "Expiry Date",
        "License Fee",
        "Net Book Value",
        "Technology (2G/3G/4G/5G)",
      ],
      icon: Cpu,
      priority: "high",
      estimatedRows: 200,
    },
    {
      id: "active_equipment",
      name: "Active Network Equipment",
      category: "Network Assets",
      description:
        "Base stations, antennas, radio units, routers, switches, and transmission equipment deployed across the network",
      templateFile: "active_equipment_template.xlsx",
      dataFields: [
        "Equipment ID",
        "Equipment Type",
        "Manufacturer",
        "Technology Generation",
        "Site ID",
        "Geopolitical Zone",
        "State",
        "Installation Date",
        "Net Book Value",
      ],
      icon: Cpu,
      priority: "medium",
      estimatedRows: 80000,
    },
    {
      id: "power_systems",
      name: "Power & Energy Systems",
      category: "Supporting Infrastructure",
      description:
        "Diesel generators, solar panels, battery banks, hybrid power systems, and grid connections at tower and facility sites",
      templateFile: "power_systems_template.xlsx",
      dataFields: [
        "System ID",
        "Site ID",
        "Power Type",
        "Capacity (kVA)",
        "Fuel Type",
        "Annual Fuel Cost",
        "Geopolitical Zone",
        "State",
        "Net Book Value",
      ],
      icon: Database,
      priority: "medium",
      estimatedRows: 25000,
    },
    {
      id: "real_estate_facilities",
      name: "Real Estate & Office Facilities",
      category: "Corporate Assets",
      description:
        "Corporate offices, retail stores, warehouses, switch rooms, and service centers",
      templateFile: "real_estate_template.xlsx",
      dataFields: [
        "Property ID",
        "Property Type",
        "Geopolitical Zone",
        "State",
        "Area (sqm)",
        "Ownership Type",
        "Annual Rent",
        "Net Book Value",
      ],
      icon: Building2,
      priority: "medium",
      estimatedRows: 3000,
    },
    {
      id: "vehicle_fleet",
      name: "Vehicle Fleet & Logistics",
      category: "Corporate Assets",
      description:
        "Service vehicles, field engineering trucks, logistics fleet, and mobile workshop units",
      templateFile: "vehicle_fleet_template.xlsx",
      dataFields: [
        "Vehicle ID",
        "Vehicle Type",
        "Fuel Type",
        "Region",
        "Annual Mileage",
        "Emissions (tCO2e)",
        "Net Book Value",
      ],
      icon: Database,
      priority: "low",
      estimatedRows: 5000,
    },
    {
      id: "mobile_money_infra",
      name: "Mobile Money & Fintech",
      category: "Digital Assets",
      description:
        "MoMo agent network, POS terminals, digital payment infrastructure, and fintech platform assets",
      templateFile: "mobile_money_template.xlsx",
      dataFields: [
        "Asset ID",
        "Asset Type",
        "Agent Count",
        "Region",
        "Transaction Volume",
        "Platform",
        "Net Book Value",
      ],
      icon: Smartphone,
      priority: "low",
      estimatedRows: 10000,
    },
    {
      id: "supplier_operations",
      name: "Supplier & Operations",
      category: "Operations",
      description:
        "Supplier contracts, vendor relationships, managed services agreements, and operational service dependencies",
      templateFile: "supplier_operations_template.xlsx",
      dataFields: [
        "Supplier ID",
        "Supplier Name",
        "Service Category",
        "Contract Value",
        "Contract Start",
        "Contract End",
        "Geopolitical Zone",
        "State",
        "Net Book Value",
        "Status",
      ],
      icon: Truck,
      priority: "medium",
      estimatedRows: 2000,
    },
  ],
  transitionDrivers: [
    {
      id: "energy_regulation",
      label: "Energy & Carbon Regulation",
      items: [
        {
          id: "carbon_tax_energy",
          label: "Carbon Tax on Diesel & Grid Electricity",
        },
        {
          id: "energy_efficiency_mandate",
          label: "Energy Efficiency Mandates for Towers",
        },
        {
          id: "renewable_energy_quota",
          label: "Renewable Energy Portfolio Quota",
        },
        {
          id: "emissions_reporting",
          label: "Mandatory GHG Emissions Reporting",
        },
      ],
    },
    {
      id: "technology_transition",
      label: "Technology Transition",
      items: [
        {
          id: "legacy_network_sunset",
          label: "2G/3G Network Sunset & Decommissioning",
        },
        {
          id: "5g_energy_efficiency",
          label: "5G Energy Efficiency Requirements",
        },
        {
          id: "green_network_tech",
          label: "Green Network Technology Adoption",
        },
        {
          id: "ewaste_regulation",
          label: "E-Waste & Equipment Disposal Regulation",
        },
      ],
    },
    {
      id: "market_demand",
      label: "Market & Demand Shift",
      items: [
        {
          id: "green_telecom_demand",
          label: "Consumer Demand for Green Telecom",
        },
        {
          id: "enterprise_esg_requirements",
          label: "Enterprise Client ESG Requirements",
        },
        {
          id: "energy_cost_passthrough",
          label: "Energy Cost Pass-Through to Tariffs",
        },
        {
          id: "data_growth_energy",
          label: "Data Traffic Growth vs Energy Constraints",
        },
      ],
    },
    {
      id: "physical_resilience",
      label: "Physical & Operational Resilience",
      items: [
        {
          id: "tower_climate_resilience",
          label: "Tower Climate Resilience Standards",
        },
        {
          id: "network_redundancy",
          label: "Network Redundancy & Disaster Recovery",
        },
        {
          id: "supply_chain_disruption",
          label: "Equipment Supply Chain Disruption",
        },
      ],
    },
  ],
  collateralMap: {
    Flood: [
      "Tower Foundations",
      "Underground Fiber",
      "Data Center Basement Equipment",
    ],
    Drought: ["Diesel Generator Systems", "Cooling Water Systems"],
    "Heat Wave": [
      "Data Center Cooling",
      "Active Equipment Performance",
      "Battery Banks",
    ],
    "Sea Level Rise": [
      "Coastal Tower Sites",
      "Submarine Cable Landing Stations",
    ],
    "Storm / Cyclone": [
      "Tower Structures",
      "Antenna Systems",
      "Aerial Fiber",
      "Rooftop Installations",
    ],
    Landslide: ["Hillside Tower Sites", "Buried Fiber Routes"],
    Wildfire: ["Rural Tower Sites", "Aerial Fiber Cable", "Wooden Pole Lines"],
    "Coastal Erosion": ["Coastal Tower Foundations", "Beach Landing Cable"],
    "Cold Wave / Frost": ["Battery Systems", "Solar Panel Efficiency"],
  },
  segmentation: {
    sectors: [
      "Consumer Mobile",
      "Enterprise Services",
      "Wholesale & Interconnect",
      "Mobile Money (MoMo)",
      "Data & Digital Services",
      "Fixed Broadband",
      "Tower Infrastructure",
      "Digital Advertising",
      "Cloud & Hosting",
      "IoT & M2M",
    ],
    segmentLabel: "Business Unit",
    segmentDescription: "Business unit and service line classification",
  },
  modules: {
    visibleModuleIds: ["cra", "scenario", "learning", "materia"],
  },
  craLabels: {
    dataUploadTitle: "Infrastructure & Operations Data Upload",
    dataUploadSubtitle:
      "Upload telecommunications infrastructure and operations data for comprehensive climate risk assessment across your network operations.",
    portfolioLabel: "Asset Base",
    exposureLabel: "Asset Value",
    dashboardTitle: "Climate Risk Assessment",
    dashboardSubtitle:
      "Comprehensive climate risk evaluation across your telecommunications infrastructure and operations",
    sectorExposureTitle: "Business Unit Exposure Analysis",
    sectorExposureSubtitle: "Risk distribution across key business segments",
  },
  sectorExposure: [
    {
      sector: "Tower Infrastructure",
      exposure: 2800,
      risk: "High",
      trend: "+18%",
      riskScore: 8.1,
      color: "#EF4444",
    },
    {
      sector: "Data Centers & Core",
      exposure: 1200,
      risk: "High",
      trend: "+22%",
      riskScore: 7.6,
      color: "#EF4444",
    },
    {
      sector: "Fiber Network",
      exposure: 950,
      risk: "Medium",
      trend: "+14%",
      riskScore: 5.8,
      color: "#F59E0B",
    },
    {
      sector: "Power Systems",
      exposure: 680,
      risk: "High",
      trend: "+25%",
      riskScore: 8.9,
      color: "#EF4444",
    },
    {
      sector: "Active Equipment",
      exposure: 520,
      risk: "Medium",
      trend: "+10%",
      riskScore: 4.5,
      color: "#F59E0B",
    },
    {
      sector: "Corporate & Fleet",
      exposure: 180,
      risk: "Low",
      trend: "+5%",
      riskScore: 2.8,
      color: "#10B981",
    },
  ],
};

const OIL_GAS_CONFIG: IndustryConfig = {
  id: "oil_gas",
  assetTypes: [
    {
      id: "upstream_fields",
      name: "Upstream Fields & Wells",
      category: "Production Assets",
      description:
        "Onshore and offshore producing fields, wellheads, platforms, and supporting extraction infrastructure.",
      templateFile: "upstream_fields_template.xlsx",
      dataFields: [
        "Asset ID",
        "Field Name",
        "Asset Type",
        "Region",
        "State",
        "Latitude",
        "Longitude",
        "Production Capacity",
        "Hydrocarbon Type",
        "Net Book Value",
      ],
      icon: Database,
      priority: "high",
      estimatedRows: 4000,
    },
    {
      id: "pipelines_flowlines",
      name: "Pipelines & Flowlines",
      category: "Midstream Assets",
      description:
        "Transmission pipelines, gathering systems, flowlines, manifolds, and related evacuation infrastructure.",
      templateFile: "pipelines_template.xlsx",
      dataFields: [
        "Pipeline ID",
        "Pipeline Type",
        "Length (km)",
        "Region",
        "State",
        "Operating Pressure",
        "Product Transported",
        "Installation Year",
        "Net Book Value",
      ],
      icon: Wifi,
      priority: "high",
      estimatedRows: 2500,
    },
    {
      id: "processing_refining",
      name: "Processing & Refining Facilities",
      category: "Downstream Assets",
      description:
        "Gas processing plants, refineries, fractionation units, terminals, and product treatment facilities.",
      templateFile: "processing_refining_template.xlsx",
      dataFields: [
        "Facility ID",
        "Facility Type",
        "Region",
        "State",
        "Throughput Capacity",
        "Feedstock Type",
        "Emissions Intensity",
        "Net Book Value",
      ],
      icon: Server,
      priority: "high",
      estimatedRows: 600,
    },
    {
      id: "storage_terminals",
      name: "Storage Tanks & Terminals",
      category: "Logistics Assets",
      description:
        "Tank farms, depots, export terminals, jetties, and product storage infrastructure.",
      templateFile: "storage_terminals_template.xlsx",
      dataFields: [
        "Terminal ID",
        "Terminal Type",
        "Region",
        "State",
        "Storage Capacity",
        "Product Type",
        "Ownership Type",
        "Net Book Value",
      ],
      icon: Building2,
      priority: "high",
      estimatedRows: 900,
    },
    {
      id: "marine_logistics",
      name: "Marine & Export Logistics",
      category: "Export Assets",
      description:
        "FPSOs, support vessels, export lines, marine loading systems, and offshore logistics assets.",
      templateFile: "marine_logistics_template.xlsx",
      dataFields: [
        "Asset ID",
        "Asset Type",
        "Region",
        "Home Port",
        "Capacity",
        "Fuel Type",
        "Annual Operating Cost",
        "Net Book Value",
      ],
      icon: Truck,
      priority: "medium",
      estimatedRows: 1200,
    },
    {
      id: "power_utilities",
      name: "Power & Utility Systems",
      category: "Supporting Assets",
      description:
        "Captive power units, compressors, flare systems, water treatment, and site utility infrastructure.",
      templateFile: "power_utilities_template.xlsx",
      dataFields: [
        "System ID",
        "System Type",
        "Site ID",
        "Region",
        "State",
        "Capacity",
        "Fuel Source",
        "Net Book Value",
      ],
      icon: Cpu,
      priority: "medium",
      estimatedRows: 3500,
    },
    {
      id: "retail_distribution",
      name: "Retail Distribution Network",
      category: "Downstream Network",
      description:
        "Service stations, lubricant depots, LPG outlets, and branded retail distribution infrastructure.",
      templateFile: "retail_distribution_template.xlsx",
      dataFields: [
        "Outlet ID",
        "Outlet Type",
        "Region",
        "State",
        "Sales Volume",
        "Storage Capacity",
        "Ownership Model",
        "Net Book Value",
      ],
      icon: Radio,
      priority: "medium",
      estimatedRows: 5000,
    },
    {
      id: "contractor_supply_chain",
      name: "Contractor & Supply Chain",
      category: "Operations",
      description:
        "Critical suppliers, drilling contractors, maintenance vendors, and operational support agreements.",
      templateFile: "contractor_supply_chain_template.xlsx",
      dataFields: [
        "Supplier ID",
        "Supplier Name",
        "Service Category",
        "Contract Value",
        "Region",
        "State",
        "Criticality",
        "Status",
      ],
      icon: Shield,
      priority: "medium",
      estimatedRows: 2500,
    },
  ],
  transitionDrivers: [
    {
      id: "policy_carbon",
      label: "Policy & Carbon Regulation",
      items: [
        { id: "carbon_price", label: "Carbon Pricing & Emissions Charges" },
        { id: "methane_rules", label: "Methane Abatement Requirements" },
        { id: "flaring_limits", label: "Gas Flaring Elimination Mandates" },
        { id: "disclosure_rules", label: "Mandatory Climate Disclosure" },
      ],
    },
    {
      id: "market_transition",
      label: "Market & Demand Transition",
      items: [
        { id: "demand_shift", label: "Demand Shift to Lower-Carbon Energy" },
        { id: "export_market_access", label: "Export Market Carbon Standards" },
        { id: "price_volatility", label: "Commodity Price Volatility" },
        { id: "capital_repricing", label: "Capital Repricing for High-Carbon Assets" },
      ],
    },
    {
      id: "technology_operations",
      label: "Technology & Operations",
      items: [
        { id: "ccus_adoption", label: "CCUS & Emissions Reduction Investments" },
        { id: "electrification", label: "Asset Electrification Requirements" },
        { id: "leak_detection", label: "Leak Detection & Monitoring Standards" },
        { id: "asset_obsolescence", label: "Stranded Asset & Obsolescence Risk" },
      ],
    },
    {
      id: "physical_resilience",
      label: "Physical & Infrastructure Resilience",
      items: [
        { id: "coastal_exposure", label: "Coastal Flooding & Surge Exposure" },
        { id: "heat_stress", label: "Heat Stress on Processing Assets" },
        { id: "pipeline_integrity", label: "Pipeline Integrity Under Extreme Weather" },
        { id: "supply_disruption", label: "Operational & Supply Disruption" },
      ],
    },
  ],
  collateralMap: {
    Flood: ["Onshore Fields", "Tank Farms", "Pump Stations"],
    Drought: ["Water Treatment Systems", "Cooling Systems"],
    "Heat Wave": ["Processing Units", "Compressors", "Storage Tanks"],
    "Sea Level Rise": ["Coastal Terminals", "Offshore Logistics Bases"],
    "Storm / Cyclone": ["Offshore Platforms", "Marine Loading Systems", "Pipelines"],
    Landslide: ["Hillside Pipelines", "Remote Flow Stations"],
    Wildfire: ["Onshore Fields", "Power Units", "Storage Depots"],
    "Coastal Erosion": ["Export Terminals", "Jetty Infrastructure"],
    "Cold Wave / Frost": ["Gas Processing Equipment", "Instrumentation Systems"],
  },
  segmentation: {
    sectors: [
      "Exploration & Production",
      "Midstream Transport",
      "Refining & Processing",
      "Retail Distribution",
      "Gas Commercialization",
      "Marine Logistics",
      "Support Services",
      "Power & Utilities",
    ],
    segmentLabel: "Value Chain Segment",
    segmentDescription: "Oil and gas value chain and operating segment classification",
  },
  modules: {
    visibleModuleIds: ["cra", "scenario", "sdg", "learning", "materia", "esrm"],
  },
  craLabels: {
    dataUploadTitle: "Oil & Gas Asset Data Upload",
    dataUploadSubtitle:
      "Upload upstream, midstream, and downstream asset data for a climate risk assessment aligned to operational exposure and transition risk.",
    portfolioLabel: "Asset Base",
    exposureLabel: "Asset Value",
    dashboardTitle: "Climate Risk Assessment",
    dashboardSubtitle:
      "Comprehensive climate risk evaluation across your oil and gas assets, infrastructure, and operating segments",
    sectorExposureTitle: "Value Chain Exposure Analysis",
    sectorExposureSubtitle: "Risk distribution across key oil and gas operating segments",
  },
  sectorExposure: [
    {
      sector: "Exploration & Production",
      exposure: 2400,
      risk: "High",
      trend: "+21%",
      riskScore: 8.7,
      color: "#EF4444",
    },
    {
      sector: "Midstream Transport",
      exposure: 1650,
      risk: "High",
      trend: "+17%",
      riskScore: 7.5,
      color: "#EF4444",
    },
    {
      sector: "Refining & Processing",
      exposure: 1320,
      risk: "High",
      trend: "+19%",
      riskScore: 8.1,
      color: "#EF4444",
    },
    {
      sector: "Storage & Terminals",
      exposure: 760,
      risk: "Medium",
      trend: "+12%",
      riskScore: 5.9,
      color: "#F59E0B",
    },
    {
      sector: "Retail Distribution",
      exposure: 430,
      risk: "Medium",
      trend: "+9%",
      riskScore: 4.8,
      color: "#F59E0B",
    },
    {
      sector: "Support Services",
      exposure: 260,
      risk: "Low",
      trend: "+4%",
      riskScore: 3.1,
      color: "#10B981",
    },
  ],
};

const INDUSTRY_CONFIGS: Record<string, IndustryConfig> = {
  financial_services: FINANCIAL_SERVICES_CONFIG,
  oil_gas: OIL_GAS_CONFIG,
  telecommunications: TELECOMMUNICATIONS_CONFIG,
};

const DEFAULT_INDUSTRY = "financial_services";

export function getIndustryConfig(sectorId: string | null): IndustryConfig {
  if (!sectorId) return INDUSTRY_CONFIGS[DEFAULT_INDUSTRY];
  return INDUSTRY_CONFIGS[sectorId] ?? INDUSTRY_CONFIGS[DEFAULT_INDUSTRY];
}

export function isNonFinancialIndustry(sectorId: string | null): boolean {
  return sectorId !== null && sectorId !== "financial_services";
}
