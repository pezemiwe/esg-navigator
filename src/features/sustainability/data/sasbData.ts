export type SasbData = Record<string, Record<string, Record<string, string[]>>>;

export const SASB_DATA: SasbData = {

  // ── Financials ────────────────────────────────────────────────────────────────
  "Financials": {
    "Asset Management & Custody Activities": {
      "Transparent Information & Fair Advice for Customers": [
        "Number of covered employees with investment-related investigations, complaints or regulatory proceedings",
        "Percentage of covered employees with investment-related investigations, complaints or regulatory proceedings",
        "Total monetary losses from legal proceedings associated with marketing financial product information",
        "Description of approach to informing customers about products and services",
      ],
      "Employee Diversity & Inclusion": [
        "Percentage of gender and racial/ethnic group representation for executive management, non-executive management, professionals and all other employees",
      ],
      "Incorporation of ESG Factors in Investment Management & Advisory": [
        "Amount of assets under management employing integration of ESG issues",
        "Amount of assets under management employing sustainability-themed investing",
        "Amount of assets under management employing screening",
        "Description of approach to incorporating ESG factors in investment and wealth management",
        "Description of proxy voting and investee engagement policies and procedures",
      ],
      "Business Ethics": [
        "Total monetary losses from legal proceedings associated with fraud, insider trading, anti-trust or market manipulation",
        "Description of whistleblower policies and procedures",
      ],
      "Systemic Risk Management": [
        "Percentage of open-end fund AUM by category of liquidity classification",
        "Total exposure to securities financing transactions",
        "Net exposure ratio to written credit derivatives",
      ],
      "Activity Metrics": [
        "Total registered assets under management (AUM)",
        "Total unregistered assets under management (AUM)",
        "Total assets under custody and supervision",
      ],
    },

    "Commercial Banks": {
      "Data Security": [
        "Number of data breaches",
        "Percentage of data breaches involving personally identifiable information (PII)",
        "Number of account holders affected by data breaches",
        "Description of approach to identifying and addressing data security risks",
      ],
      "Financial Inclusion & Capacity Building": [
        "Number of loans outstanding qualified to small business and community development programs",
        "Amount of loans outstanding qualified to small business and community development programs",
        "Number of past-due and nonaccrual loans qualified to small business/community development programs",
        "Amount of past-due and nonaccrual loans qualified to small business/community development programs",
        "Number of no-cost retail checking accounts provided to previously unbanked or underbanked customers",
        "Number of participants in financial literacy initiatives for unbanked, underbanked or underserved customers",
      ],
      "Incorporation of ESG Factors in Credit Analysis": [
        "Commercial and industrial credit exposure by industry",
        "Description of approach to incorporating ESG factors in credit analysis",
      ],
      "Business Ethics": [
        "Total monetary losses from legal proceedings associated with fraud, insider trading, anti-trust or market manipulation",
        "Description of whistleblower policies and procedures",
      ],
      "Systemic Risk Management": [
        "Global Systemically Important Bank (G-SIB) score by category",
        "Description of approach to incorporating stress test results into capital adequacy planning and long-term strategy",
      ],
      "Activity Metrics": [
        "Number of checking and savings accounts — personal segment",
        "Number of checking and savings accounts — small business segment",
        "Value of checking and savings accounts — personal segment",
        "Value of checking and savings accounts — small business segment",
        "Number of loans — personal segment",
        "Number of loans — small business segment",
        "Number of loans — corporate segment",
        "Value of loans — personal segment",
        "Value of loans — small business segment",
        "Value of loans — corporate segment",
      ],
    },

    "Consumer Finance": {
      "Customer Privacy": [
        "Number of account holders whose information is used for secondary purposes",
        "Total monetary losses from legal proceedings associated with customer privacy",
      ],
      "Data Security": [
        "Number of data breaches",
        "Percentage of data breaches involving personally identifiable information (PII)",
        "Number of account holders affected by data breaches",
        "Card-related fraud losses from card-not-present fraud",
        "Card-related fraud losses from card-present and other fraud",
        "Description of approach to identifying and addressing data security risks",
      ],
      "Selling Practices": [
        "Percentage of total remuneration for covered employees that is variable and linked to products sold",
        "Approval rate for credit products — applicants with FICO scores above 660",
        "Approval rate for credit products — applicants with FICO scores below 660",
        "Approval rate for pre-paid products — applicants with FICO scores above 660",
        "Approval rate for pre-paid products — applicants with FICO scores below 660",
        "Average fees from add-on products for customers with FICO scores above and below 660",
        "Average APR for customers with FICO scores above and below 660",
        "Number of complaints filed with the CFPB",
        "Percentage of CFPB complaints resulting in monetary or non-monetary relief",
        "Percentage of CFPB complaints disputed by consumers",
        "Percentage of CFPB complaints resulting in investigation",
        "Total monetary losses from legal proceedings associated with selling and servicing of products",
      ],
      "Activity Metrics": [
        "Number of unique consumers with an active credit card account",
        "Number of unique consumers with an active pre-paid debit card account",
        "Number of credit card accounts",
        "Number of pre-paid debit card accounts",
      ],
    },

    "Insurance": {
      "Transparent Information & Fair Advice for Customers": [
        "Total monetary losses from legal proceedings associated with marketing of insurance product information",
        "Complaints-to-claims ratio",
        "Customer retention rate",
        "Description of approach to informing customers about products",
      ],
      "Incorporation of ESG Factors in Investment Management": [
        "Total invested assets by industry and asset class",
        "Description of approach to incorporating ESG factors in investment management",
      ],
      "Policies Designed to Incentivise Responsible Behaviour": [
        "Net premiums written related to energy efficiency and low-carbon technology",
        "Discussion of products and features that incentivise health, safety or environmentally responsible behaviours",
      ],
      "Environmental Risk Exposure": [
        "Probable Maximum Loss (PML) from weather-related natural catastrophes",
        "Total monetary losses from insurance payouts from modelled natural catastrophes",
        "Total monetary losses from insurance payouts from non-modelled natural catastrophes",
        "Description of approach to incorporating environmental risks into underwriting for individual contracts",
        "Description of approach to incorporating environmental risks into firm-level risk and capital adequacy management",
      ],
      "Systemic Risk Management": [
        "Exposure to derivative instruments by category",
        "Total fair value of securities lending collateral assets",
        "Description of approach to managing capital and liquidity risks associated with systemic non-insurance activities",
      ],
      "Activity Metrics": [
        "Number of property and casualty policies in force",
        "Number of life policies in force",
        "Number of assumed reinsurance policies in force",
      ],
    },

    "Investment Banking & Brokerage": {
      "Employee Diversity & Inclusion": [
        "Percentage of gender and racial/ethnic group representation for executive management, non-executive management, professionals and all other employees",
      ],
      "Incorporation of ESG Factors in Investment Banking & Brokerage Activities": [
        "Number of investments and loans incorporating ESG factors by industry",
        "Total value of investments and loans incorporating ESG factors by industry",
        "Total rate of transactions associated with assurance of ESG-related disclosures or advisory",
        "Revenue from transactions associated with assurance of ESG-related disclosures or advisory",
        "Description of approach to incorporating ESG factors in activities",
      ],
      "Business Ethics": [
        "Total monetary losses from legal proceedings associated with fraud, insider trading, anti-trust or market manipulation",
        "Description of whistleblower policies and procedures",
      ],
      "Professional Integrity": [
        "Number of employees that received industry-related conduct certifications",
        "Percentage of employees that received industry-related conduct certifications",
        "Number of mediation and arbitration cases associated with professional integrity including duty of care",
        "Total monetary losses from legal proceedings associated with professional integrity including duty of care",
        "Description of approach to ensuring professional integrity including duty of care",
      ],
      "Employee Incentives & Risk Taking": [
        "Percentage of total remuneration that is variable for Material Risk Takers (MRTs)",
        "Percentage of variable remuneration of MRTs to which malus or clawback provisions were applied",
        "Discussion of policies around supervision and validation of traders' pricing of Level 3 assets and liabilities",
      ],
      "Systemic Risk Management": [
        "Global Systemically Important Bank (G-SIB) score by category",
        "Description of approach to incorporating stress test results into capital adequacy planning and long-term strategy",
      ],
      "Activity Metrics": [
        "Number of underwriting transactions",
        "Number of advisory transactions",
        "Number of securitisation transactions",
        "Value of underwriting transactions",
        "Value of advisory transactions",
        "Value of securitisation transactions",
        "Number of market-making transactions",
        "Number of brokerage transactions",
        "Value of market-making transactions",
        "Value of brokerage transactions",
        "Number of advisory mandates",
        "Number of securitisation mandates",
      ],
    },

    "Mortgage Finance": {
      "Lending Practices": [
        "Number of Hybrid/Option ARM mortgages by FICO score range",
        "Number of mortgages with prepayment penalty by FICO score range",
        "Number of higher-rate mortgages by FICO score range",
        "Value of residential mortgages by type and FICO score range",
        "Number of residential mortgage modifications",
        "Number of foreclosures",
        "Number of short sales or deeds in lieu of foreclosure",
        "Value of mortgage modifications, foreclosures and short sales",
        "Total monetary losses from legal proceedings associated with loan originator communications or remuneration",
        "Description of remuneration structure of loan originators",
      ],
      "Discriminatory Lending": [
        "Number of mortgages issued to minority borrowers by FICO score range",
        "Number of mortgages issued to all other borrowers by FICO score range",
        "Value of mortgages issued to minority borrowers by FICO score range",
        "Value of mortgages issued to all other borrowers by FICO score range",
        "Weighted-average Loan-to-Value (LTV) ratio by borrower group and FICO score",
        "Total monetary losses from legal proceedings associated with discriminatory mortgage lending",
        "Description of policies and procedures for ensuring non-discriminatory mortgage origination",
      ],
      "Environmental Risk to Mortgaged Properties": [
        "Number of mortgage loans in 100-year flood zones",
        "Value of mortgage loans in 100-year flood zones",
        "Total expected loss attributable to mortgage defaults due to weather-related natural catastrophes",
        "Loss Given Default (LGD) attributable to mortgage delinquency due to weather-related natural catastrophes",
        "Description of how climate change and environmental risks are incorporated into mortgage origination and underwriting",
      ],
      "Activity Metrics": [
        "Number of residential mortgages originated",
        "Number of commercial mortgages originated",
        "Value of residential mortgages originated",
        "Value of commercial mortgages originated",
        "Number of residential mortgages purchased",
        "Number of commercial mortgages purchased",
        "Value of residential mortgages purchased",
        "Value of commercial mortgages purchased",
      ],
    },

    "Security & Commodity Exchanges": {
      "Promoting Transparency & Efficiency in Capital Markets": [
        "Number of trading halts related to public release of information",
        "Average duration of trading halts related to public release of information",
        "Percentage of trades generated from automated trading systems",
        "Percentage of trades generated from high-frequency trading",
        "Description of policies and procedures to identify and manage conflicts of interest",
      ],
      "Managing Business Continuity & Technology Risks": [
        "Number of significant market disruptions",
        "Total downtime of trading platforms",
        "Description of efforts to prevent technology errors, security breaches and market disruptions",
      ],
      "Activity Metrics": [
        "Number of trades executed",
        "Average daily volume of trades executed",
      ],
    },
  },

  // ── Extractives & Minerals Processing ────────────────────────────────────────
  "Extractives & Minerals Processing": {
    "Coal Operations": {
      "Greenhouse Gas Emissions": [
        "Gross global Scope 1 emissions",
        "Percentage of Scope 1 emissions covered under emissions-limiting regulations",
        "Discussion of long-term and short-term strategy to manage Scope 1 emissions",
        "Reduction targets and performance against targets",
      ],
      "Water Management": [
        "Total fresh water withdrawn",
        "Percentage of water withdrawn that is recycled",
        "Percentage of water withdrawn in High or Extremely High Baseline Water Stress regions",
        "Number of incidents of non-compliance with water quality permits, standards and regulations",
      ],
      "Waste & Hazardous Materials Management": [
        "Total weight of coal combustion residuals (CCR) generated",
        "Percentage of coal combustion residuals recycled",
        "Number of CCR impoundments by hazard potential classification",
        "Number of CCR impoundments by structural integrity assessment",
      ],
      "Biodiversity Impacts": [
        "Description of environmental management policies and practices for active sites",
        "Percentage of mine sites where acid rock drainage is predicted to occur",
        "Percentage of mine sites where acid rock drainage is actively mitigated",
        "Percentage of mine sites where acid rock drainage is under treatment or remediation",
        "Percentage of proved reserves in or near protected conservation or endangered species habitat",
        "Percentage of probable reserves in or near protected conservation or endangered species habitat",
      ],
      "Workforce Health & Safety": [
        "MSHA all-incidence rate",
        "Fatality rate",
        "Near miss frequency rate (NMFR)",
        "Average hours of health, safety and emergency response training",
        "Discussion of management systems used to integrate a culture of safety throughout the value chain",
      ],
      "Reserves Valuation & Capital Expenditures": [
        "Sensitivity of coal reserve levels to carbon price scenarios",
        "Estimated carbon dioxide emissions embedded in proven coal reserves",
        "Discussion of how climate-related risks are integrated into business and operational strategy",
      ],
      "Business Ethics & Payments Transparency": [
        "Description of management system for prevention of corruption and bribery",
        "Production in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index",
      ],
      "Activity Metrics": [
        "Total amount of coal produced",
        "Total amount of coal reserves by type",
      ],
    },

    "Construction Materials": {
      "Greenhouse Gas Emissions": [
        "Gross global Scope 1 emissions",
        "Percentage of Scope 1 emissions covered under emissions-limiting regulations",
        "Discussion of strategy to manage Scope 1 emissions, reduction targets and performance",
      ],
      "Air Quality": [
        "Air emissions of NOx (excluding N₂O)",
        "Air emissions of SOx",
        "Air emissions of particulate matter (PM10)",
        "Air emissions of dioxins and furans",
        "Air emissions of volatile organic compounds (VOCs)",
        "Air emissions of polycyclic aromatic hydrocarbons (PAHs)",
        "Air emissions of heavy metals",
      ],
      "Energy Management": [
        "Total energy consumed",
        "Percentage of energy from grid electricity",
        "Percentage of energy from alternative sources",
        "Percentage of energy from renewable sources",
      ],
      "Water Management": [
        "Total fresh water withdrawn",
        "Percentage of water withdrawn that is recycled",
        "Percentage of water withdrawn in High or Extremely High Baseline Water Stress regions",
      ],
      "Waste Management": [
        "Amount of waste generated",
        "Percentage of waste that is hazardous",
        "Percentage of waste that is recycled",
      ],
      "Biodiversity Impacts": [
        "Description of environmental management policies and practices for active sites",
        "Terrestrial acreage disturbed",
        "Percentage of impacted area restored",
      ],
      "Workforce Health & Safety": [
        "Total recordable incident rate (TRIR) for full-time employees",
        "Total recordable incident rate (TRIR) for contract employees",
        "Near miss frequency rate (NMFR)",
      ],
      "Product Innovation": [
        "Percentage of products qualifying for credits in sustainable building design certifications",
        "Total addressable market for products that reduce energy, water or material impacts",
        "Share of market for products that reduce energy, water or material impacts",
      ],
      "Pricing Integrity & Transparency": [
        "Total monetary losses from legal proceedings associated with cartel activities, price fixing or anti-trust",
      ],
      "Activity Metrics": [
        "Production by major product line",
      ],
    },

    "Iron & Steel Producers": {
      "Greenhouse Gas Emissions": [
        "Gross global Scope 1 emissions",
        "Percentage of Scope 1 emissions covered under emissions-limiting regulations",
        "Discussion of strategy to manage Scope 1 emissions, reduction targets and performance",
      ],
      "Air Quality": [
        "Air emissions of carbon monoxide (CO)",
        "Air emissions of NOx (excluding N₂O)",
        "Air emissions of SOx",
        "Air emissions of particulate matter (PM10)",
        "Air emissions of manganese oxide (MnO)",
        "Air emissions of lead (Pb)",
        "Air emissions of volatile organic compounds (VOCs)",
        "Air emissions of polycyclic aromatic hydrocarbons (PAHs)",
      ],
      "Energy Management": [
        "Total energy consumed",
        "Percentage of energy from grid electricity",
        "Percentage of energy from renewable sources",
        "Total fuel consumed",
        "Percentage of fuel from coal",
        "Percentage of fuel from natural gas",
        "Percentage of fuel from renewable sources",
      ],
      "Water Management": [
        "Total fresh water withdrawn",
        "Percentage of water withdrawn that is recycled",
        "Percentage of water withdrawn in water-stressed regions",
      ],
      "Waste Management": [
        "Amount of waste generated",
        "Percentage of waste that is hazardous",
        "Percentage of waste that is recycled",
      ],
      "Workforce Health & Safety": [
        "Total recordable incident rate (TRIR) for direct employees",
        "Total recordable incident rate (TRIR) for contract employees",
        "Fatality rate",
      ],
      "Supply Chain Management": [
        "Discussion of process for managing iron ore and coking coal sourcing risks from environmental and social issues",
      ],
      "Activity Metrics": [
        "Raw steel production",
        "Percentage of raw steel from basic oxygen furnace process",
        "Percentage of raw steel from electric arc furnace process",
        "Total iron ore production",
        "Total coking coal production",
      ],
    },

    "Metals & Mining": {
      "Greenhouse Gas Emissions": [
        "Gross global Scope 1 emissions",
        "Percentage of Scope 1 emissions covered under emissions-limiting regulations",
        "Discussion of strategy to manage Scope 1 emissions, reduction targets and performance",
      ],
      "Air Quality": [
        "Air emissions of NOx (excluding N₂O)",
        "Air emissions of SOx",
        "Air emissions of particulate matter (PM10)",
        "Air emissions of mercury (Hg)",
        "Air emissions of lead (Pb)",
        "Air emissions of volatile organic compounds (VOCs)",
      ],
      "Energy Management": [
        "Total energy consumed",
        "Percentage of energy from grid electricity",
        "Percentage of energy from renewable sources",
      ],
      "Water Management": [
        "Total fresh water withdrawn",
        "Percentage of water withdrawn that is recycled",
        "Percentage of water withdrawn in High or Extremely High Baseline Water Stress regions",
        "Number of incidents of non-compliance with water quality permits, standards and regulations",
      ],
      "Waste & Hazardous Materials Management": [
        "Total weight of non-mineral waste, tailings, waste rock and hazardous waste generated",
        "Weight of waste recycled",
        "Number of significant incidents associated with hazardous materials and waste management",
        "Description of waste and hazardous materials management policies for active and inactive operations",
      ],
      "Biodiversity Impacts": [
        "Description of environmental management policies and practices for active sites",
        "Percentage of mine sites where acid rock drainage is predicted to occur",
        "Percentage of mine sites where acid rock drainage is actively mitigated",
        "Percentage of mine sites where acid rock drainage is under treatment or remediation",
        "Percentage of proved reserves in or near protected conservation or endangered species habitat",
        "Percentage of probable reserves in or near protected conservation or endangered species habitat",
      ],
      "Security, Human Rights & Rights of Indigenous Peoples": [
        "Percentage of proved reserves in or near indigenous land",
        "Percentage of probable reserves in or near indigenous land",
        "Discussion of engagement processes and due diligence with respect to human rights, indigenous rights and areas of conflict",
      ],
      "Community Relations": [
        "Discussion of process to manage risks and opportunities associated with community rights and interests",
        "Number of non-technical delays",
        "Duration of non-technical delays",
      ],
      "Labour Relations": [
        "Percentage of workforce covered under collective bargaining agreements — US employees",
        "Percentage of workforce covered under collective bargaining agreements — foreign employees",
        "Number of strikes and lockouts",
        "Duration of strikes and lockouts",
      ],
      "Workforce Health & Safety": [
        "MSHA all-incidence rate",
        "Fatality rate",
        "Near miss frequency rate (NMFR)",
        "Average hours of health, safety and emergency response training",
      ],
      "Business Ethics & Transparency": [
        "Description of management system for prevention of corruption and bribery",
        "Production in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index",
      ],
      "Activity Metrics": [
        "Production of metal ores",
        "Production of finished metal products",
        "Total number of employees",
        "Percentage of employees who are contractors",
      ],
    },

    "Oil & Gas – Exploration & Production": {
      "Greenhouse Gas Emissions": [
        "Gross global Scope 1 emissions",
        "Percentage of Scope 1 emissions that is methane",
        "Percentage of Scope 1 emissions covered under emissions-limiting regulations",
        "Scope 1 emissions from flared hydrocarbons",
        "Scope 1 emissions from other combustion",
        "Scope 1 emissions from process emissions",
        "Scope 1 emissions from other vented emissions",
        "Scope 1 emissions from fugitive emissions",
        "Discussion of strategy to manage Scope 1 emissions, reduction targets and performance",
      ],
      "Air Quality": [
        "Air emissions of NOx (excluding N₂O)",
        "Air emissions of SOx",
        "Air emissions of volatile organic compounds (VOCs)",
        "Air emissions of particulate matter (PM10)",
      ],
      "Water Management": [
        "Total fresh water withdrawn",
        "Total fresh water consumed",
        "Percentage of water in High or Extremely High Baseline Water Stress regions",
        "Volume of produced water and flowback generated",
        "Percentage of produced water discharged",
        "Percentage of produced water injected",
        "Percentage of produced water recycled",
        "Hydrocarbon content in discharged water",
        "Percentage of hydraulically fractured wells with public disclosure of fracturing fluid chemicals",
        "Percentage of hydraulic fracturing sites where ground or surface water quality deteriorated vs. baseline",
      ],
      "Biodiversity Impacts": [
        "Description of environmental management policies and practices for active sites",
        "Number of hydrocarbon spills",
        "Aggregate volume of hydrocarbon spills",
        "Volume of hydrocarbon spills in the Arctic",
        "Volume of hydrocarbon spills impacting shorelines",
        "Volume of hydrocarbon spills recovered",
        "Percentage of proved reserves in or near protected conservation or endangered species habitat",
        "Percentage of probable reserves in or near protected conservation or endangered species habitat",
      ],
      "Security, Human Rights & Rights of Indigenous Peoples": [
        "Percentage of proved reserves in or near areas of conflict",
        "Percentage of probable reserves in or near areas of conflict",
        "Percentage of proved reserves in or near indigenous land",
        "Percentage of probable reserves in or near indigenous land",
        "Discussion of engagement processes and due diligence with respect to human rights, indigenous rights and areas of conflict",
      ],
      "Community Relations": [
        "Discussion of process to manage risks and opportunities associated with community rights and interests",
        "Number of non-technical delays",
        "Duration of non-technical delays",
      ],
      "Workforce Health & Safety": [
        "Total recordable incident rate (TRIR) for full-time employees",
        "Total recordable incident rate (TRIR) for contract employees",
        "Total recordable incident rate (TRIR) for short-service employees",
        "Fatality rate",
        "Near miss frequency rate (NMFR)",
        "Average hours of health, safety and emergency response training",
        "Discussion of management systems used to integrate a culture of safety throughout the exploration and production lifecycle",
      ],
      "Reserves Valuation & Capital Expenditures": [
        "Sensitivity of oil reserve levels to carbon price scenarios",
        "Sensitivity of gas reserve levels to carbon price scenarios",
        "Estimated carbon dioxide emissions embedded in proved hydrocarbon reserves",
        "Amount invested in renewable energy",
        "Revenue generated by renewable energy sales",
        "Discussion of how price, demand and climate regulation influence capital expenditure strategy",
      ],
      "Business Ethics & Transparency": [
        "Percentage of proved reserves in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index",
        "Percentage of probable reserves in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index",
        "Description of management system for prevention of corruption and bribery",
      ],
      "Management of the Legal & Regulatory Environment": [
        "Discussion of corporate positions related to government regulations and policy proposals on environmental and social factors",
      ],
      "Critical Incident Risk Management": [
        "Process Safety Event (PSE) rate for Loss of Primary Containment — Tier 1",
        "Description of management systems used to identify and mitigate catastrophic and tail-end risks",
      ],
      "Activity Metrics": [
        "Production of oil",
        "Production of natural gas",
        "Production of synthetic oil",
        "Production of synthetic gas",
        "Number of offshore sites",
        "Number of terrestrial sites",
      ],
    },

    "Oil & Gas – Midstream": {
      "Greenhouse Gas Emissions": [
        "Gross global Scope 1 emissions",
        "Percentage of Scope 1 emissions that is methane",
        "Percentage of Scope 1 emissions covered under emissions-limiting regulations",
        "Discussion of strategy to manage Scope 1 emissions, reduction targets and performance",
      ],
      "Air Quality": [
        "Air emissions of NOx (excluding N₂O)",
        "Air emissions of SOx",
        "Air emissions of volatile organic compounds (VOCs)",
        "Air emissions of particulate matter (PM10)",
      ],
      "Ecological Impacts": [
        "Description of environmental management policies and practices for active operations",
        "Percentage of land owned, leased or operated within protected conservation or endangered species habitat",
        "Terrestrial acreage disturbed",
        "Percentage of impacted area restored",
        "Number of hydrocarbon spills",
        "Aggregate volume of hydrocarbon spills",
        "Volume of hydrocarbon spills in the Arctic",
        "Volume of hydrocarbon spills impacting shorelines",
        "Volume of hydrocarbon spills recovered",
      ],
      "Competitive Behaviour": [
        "Total monetary losses from legal proceedings associated with federal pipeline and storage regulations",
      ],
      "Critical Incident Risk Management & Operational Safety": [
        "Number of reportable pipeline incidents",
        "Percentage of reportable pipeline incidents that are significant",
        "Percentage of natural gas pipelines inspected",
        "Percentage of hazardous liquid pipelines inspected",
        "Number of accident releases from rail transportation",
        "Number of non-accident releases from rail transportation",
        "Discussion of management systems used to integrate a culture of safety and emergency preparedness",
      ],
      "Activity Metrics": [
        "Total metric ton-kilometres of natural gas transported",
        "Total metric ton-kilometres of crude oil transported",
        "Total metric ton-kilometres of refined petroleum products transported",
      ],
    },

    "Oil & Gas – Refining & Marketing": {
      "Greenhouse Gas Emissions": [
        "Gross global Scope 1 emissions",
        "Percentage of Scope 1 emissions covered under emissions-limiting regulations",
        "Discussion of strategy to manage Scope 1 emissions, reduction targets and performance",
      ],
      "Air Quality": [
        "Air emissions of NOx (excluding N₂O)",
        "Air emissions of SOx",
        "Air emissions of particulate matter (PM10)",
        "Air emissions of hydrogen sulphide (H₂S)",
        "Air emissions of volatile organic compounds (VOCs)",
        "Number of refineries in or near areas of dense population",
      ],
      "Water Management": [
        "Total fresh water withdrawn",
        "Percentage of water withdrawn that is recycled",
        "Percentage of water withdrawn in High or Extremely High Baseline Water Stress regions",
        "Number of incidents of non-compliance with water quality permits, standards and regulations",
      ],
      "Hazardous Materials Management": [
        "Amount of hazardous waste generated",
        "Percentage of hazardous waste recycled",
        "Number of underground storage tanks (USTs)",
        "Number of UST releases requiring cleanup",
        "Percentage of USTs in states with UST financial assurance funds",
      ],
      "Workforce Health & Safety": [
        "Total recordable incident rate (TRIR) for full-time employees",
        "Total recordable incident rate (TRIR) for contract employees",
        "Total recordable incident rate (TRIR) for short-service employees",
        "Fatality rate",
        "Near miss frequency rate (NMFR)",
        "Discussion of management systems used to integrate a culture of safety",
      ],
      "Product Specifications & Clean Fuel Blends": [
        "Percentage of Reid Vapor Pressure (RVP) compliant gasoline produced",
        "Total addressable market for advanced biofuels and associated infrastructure",
        "Share of market for advanced biofuels and associated infrastructure",
      ],
      "Pricing Integrity & Transparency": [
        "Total monetary losses from legal proceedings associated with price fixing or price manipulation",
      ],
      "Critical Incident Risk Management": [
        "Process Safety Event (PSE) rate for Loss of Primary Containment — Tier 1",
        "Challenges to Safety Systems indicator rate — Tier 3",
        "Discussion of measurement of Operating Discipline and Management System Performance through Tier 4 indicators",
      ],
      "Activity Metrics": [
        "Refining throughput of crude oil and other feedstocks",
        "Refining operating capacity",
      ],
    },

    "Oil & Gas – Services": {
      "Emissions Reduction Services & Fuels Management": [
        "Total fuel consumed",
        "Percentage of fuel from renewable sources",
        "Percentage of fuel used in on-road equipment",
        "Percentage of fuel used in off-road equipment",
        "Discussion of strategy or plans to address air emissions risks, opportunities and impacts",
      ],
      "Water Management Services": [
        "Total volume of fresh water handled in operations",
        "Percentage of water recycled",
        "Discussion of strategy or plans to address water consumption and disposal risks, opportunities and impacts",
      ],
      "Chemicals Management": [
        "Volume of hydraulic fracturing fluid used",
        "Percentage of hydraulic fracturing fluid that is hazardous",
        "Discussion of strategy or plans to address chemical-related risks, opportunities and impacts",
      ],
      "Business Ethics & Payments Transparency": [
        "Amount of net revenue in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index",
        "Description of management system for prevention of corruption and bribery",
      ],
      "Workforce Health & Safety": [
        "Total recordable incident rate (TRIR)",
        "Fatality rate",
        "Near miss frequency rate (NMFR)",
        "Total vehicle incident rate (TVIR)",
        "Average hours of health, safety and emergency response training",
      ],
      "Critical Incident Risk Management": [
        "Description of management systems used to identify and mitigate catastrophic and tail-end risks",
        "Discussion of engineering standards related to maintaining wellbore integrity",
      ],
      "Activity Metrics": [
        "Number of active rig sites",
        "Number of active well sites",
        "Total amount of drilling performed",
        "Total number of hours worked by all employees",
      ],
    },
  },

  // ── Infrastructure ────────────────────────────────────────────────────────────
  "Infrastructure": {
    "Electric Utilities & Power Generators": {
      "Greenhouse Gas Emissions & Energy Resource Planning": [
        "Gross global Scope 1 emissions",
        "Percentage of Scope 1 emissions covered under emissions-limiting regulations",
        "Percentage of Scope 1 emissions covered under emissions-reporting regulations",
        "GHG emissions associated with power deliveries",
        "Discussion of long-term and short-term strategy to manage Scope 1 emissions and reduction targets",
        "Number of customers served in markets subject to renewable portfolio standards (RPS)",
        "Percentage fulfilment of renewable portfolio standards target by market",
      ],
      "Air Quality": [
        "Air emissions of NOx (excluding N₂O)",
        "Air emissions of SOx",
        "Air emissions of particulate matter (PM10)",
        "Air emissions of lead (Pb)",
        "Air emissions of mercury (Hg)",
        "Percentage of each air emission type in or near areas of dense population",
      ],
      "Water Management": [
        "Total water withdrawn",
        "Total water consumed",
        "Percentage of water in High or Extremely High Baseline Water Stress regions",
        "Number of incidents of non-compliance with water quantity or quality permits, standards and regulations",
        "Description of water management risks and strategies to mitigate those risks",
      ],
      "Coal Ash Management": [
        "Amount of coal combustion residuals (CCR) generated",
        "Percentage of coal combustion residuals recycled",
        "Total number of CCR impoundments by hazard potential classification",
        "Total number of CCR impoundments by structural integrity assessment",
      ],
      "Energy Affordability": [
        "Average retail electric rate for residential customers",
        "Average retail electric rate for commercial customers",
        "Average retail electric rate for industrial customers",
        "Typical monthly electric bill for residential customers for 500 kWh delivered per month",
        "Typical monthly electric bill for residential customers for 1,000 kWh delivered per month",
        "Number of residential customer electric disconnections for non-payment",
        "Percentage of disconnected customers reconnected within 30 days",
        "Discussion of impact of external factors on customer affordability of electricity",
      ],
      "Workforce Health & Safety": [
        "Total recordable incident rate (TRIR)",
        "Fatality rate",
        "Near miss frequency rate (NMFR)",
      ],
      "End-Use Efficiency & Demand": [
        "Percentage of electric utility revenues from decoupled rate structures",
        "Percentage of electric utility revenues from rate structures containing a lost revenue adjustment mechanism (LRAM)",
        "Customer electricity savings from efficiency measures by market",
      ],
      "Nuclear Safety & Emergency Management": [
        "Total number of nuclear power units by NRC Action Matrix Column",
        "Description of efforts to manage nuclear safety and emergency preparedness",
      ],
      "Grid Resiliency": [
        "Number of incidents of non-compliance with physical and cybersecurity standards or regulations",
        "System Average Interruption Duration Index (SAIDI)",
        "System Average Interruption Frequency Index (SAIFI)",
        "Customer Average Interruption Duration Index (CAIDI)",
      ],
      "Activity Metrics": [
        "Number of residential customers served",
        "Number of commercial customers served",
        "Number of industrial customers served",
        "Total electricity delivered to residential customers",
        "Total electricity delivered to commercial customers",
        "Total electricity delivered to industrial customers",
        "Length of transmission and distribution lines",
        "Total electricity generated by major energy source",
        "Percentage of electricity generated in regulated markets",
        "Total wholesale electricity purchased",
      ],
    },

    "Engineering & Construction Services": {
      "Environmental Impacts of Project Development": [
        "Number of incidents of non-compliance with environmental permits, standards and regulations",
        "Discussion of processes to assess and manage environmental risks associated with project design, siting and construction",
      ],
      "Structural Integrity & Safety": [
        "Amount of defect- and safety-related rework costs",
        "Total monetary losses from legal proceedings associated with defect- and safety-related incidents",
      ],
      "Workforce Health & Safety": [
        "Total recordable incident rate (TRIR) for direct employees",
        "Total recordable incident rate (TRIR) for contract employees",
        "Fatality rate for direct employees",
        "Fatality rate for contract employees",
      ],
      "Lifecycle Impacts of Buildings & Infrastructure": [
        "Number of commissioned projects certified to a third-party multi-attribute sustainability standard",
        "Number of active projects seeking third-party multi-attribute sustainability certification",
        "Discussion of process to incorporate operational-phase energy and water efficiency into project planning and design",
      ],
      "Climate Impacts of Business Mix": [
        "Amount of backlog for hydrocarbon-related projects",
        "Amount of backlog for renewable energy projects",
        "Amount of backlog cancellations associated with hydrocarbon-related projects",
        "Amount of backlog for non-energy projects associated with climate change mitigation",
      ],
      "Business Ethics": [
        "Number of active projects in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index",
        "Total backlog in countries with the 20 lowest rankings in Transparency International's Corruption Perception Index",
        "Total monetary losses from legal proceedings associated with bribery, corruption or anti-competitive practices",
        "Description of policies and practices for prevention of bribery, corruption and anti-competitive behaviour in project bidding",
      ],
      "Activity Metrics": [
        "Number of active projects",
        "Number of commissioned projects",
        "Total backlog",
      ],
    },

    "Gas Utilities & Distributors": {
      "Energy Affordability": [
        "Average retail gas rate for residential customers",
        "Average retail gas rate for commercial customers",
        "Average retail gas rate for industrial customers",
        "Average retail rate for transportation services only",
        "Typical monthly gas bill for residential customers for 50 MMBtu per year",
        "Typical monthly gas bill for residential customers for 100 MMBtu per year",
        "Number of residential customer gas disconnections for non-payment",
        "Percentage of disconnected customers reconnected within 30 days",
        "Discussion of impact of external factors on customer affordability of gas",
      ],
      "End-Use Efficiency": [
        "Percentage of gas utility revenues from decoupled rate structures",
        "Percentage of gas utility revenues from rate structures containing a lost revenue adjustment mechanism (LRAM)",
        "Customer gas savings from efficiency measures by market",
      ],
      "Integrity of Gas Delivery Infrastructure": [
        "Number of reportable pipeline incidents",
        "Number of Corrective Action Orders (CAO)",
        "Number of Notices of Probable Violation (NOPV)",
        "Percentage of distribution pipeline that is cast or wrought iron",
        "Percentage of distribution pipeline that is unprotected steel",
        "Percentage of gas transmission pipelines inspected",
        "Percentage of gas distribution pipelines inspected",
        "Description of efforts to manage integrity of gas delivery infrastructure including safety and emissions risks",
      ],
      "Activity Metrics": [
        "Number of residential customers served",
        "Number of commercial customers served",
        "Number of industrial customers served",
        "Amount of natural gas delivered to residential customers",
        "Amount of natural gas delivered to commercial customers",
        "Amount of natural gas delivered to industrial customers",
        "Amount of natural gas transferred to a third party",
        "Length of gas transmission pipelines",
        "Length of gas distribution pipelines",
      ],
    },

    "Home Builders": {
      "Land Use & Ecological Impacts": [
        "Number of lots delivered on redevelopment sites",
        "Number of homes delivered on redevelopment sites",
        "Number of lots delivered in regions with High or Extremely High Baseline Water Stress",
        "Number of homes delivered in regions with High or Extremely High Baseline Water Stress",
        "Total monetary losses from legal proceedings associated with environmental regulations",
      ],
      "Workforce Health & Safety": [
        "Total recordable incident rate (TRIR) for direct employees",
        "Total recordable incident rate (TRIR) for contract employees",
        "Fatality rate for direct employees",
        "Fatality rate for contract employees",
      ],
      "Design for Resource Efficiency": [
        "Number of homes that obtained a certified HERS Index Score",
        "Average HERS Index Score for certified homes",
        "Percentage of installed water fixtures certified to WaterSense specifications",
        "Number of homes delivered certified to a third-party multi-attribute green building standard",
        "Description of risks and opportunities related to incorporating resource efficiency into home design",
      ],
      "Community Impacts of New Developments": [
        "Description of how proximity to infrastructure, services and economic centres affects site selection",
        "Number of lots delivered on infill sites",
        "Number of homes delivered on infill sites",
        "Total amount invested annually in offsite improvements such as roads, parks and schools",
        "Number of loans issued annually for offsite improvements such as roads, parks and schools",
      ],
      "Climate Change Adaptation": [
        "Number of lots located in 100-year flood zones",
        "Description of climate change risk exposure analysis and strategies for mitigating risks",
      ],
      "Activity Metrics": [
        "Number of controlled lots",
        "Number of homes delivered",
        "Land area of controlled lots",
      ],
    },

    "Real Estate": {
      "Energy Management": [
        "Energy consumption data coverage as a percentage of total floor area by property subsector",
        "Total energy consumed by portfolio area with data coverage",
        "Percentage of energy from grid electricity",
        "Percentage of energy from renewable sources",
        "Like-for-like percentage change in energy consumption for portfolio area with data coverage",
        "Percentage of eligible portfolio that has an energy rating",
        "Percentage of eligible portfolio certified to ENERGY STAR",
        "Description of how building energy management is integrated into property investment analysis and operational strategy",
      ],
      "Water Management": [
        "Water withdrawal data coverage as a percentage of total floor area by property subsector",
        "Water withdrawal data coverage in High or Extremely High Water Stress regions",
        "Total water withdrawn by portfolio area with data coverage",
        "Percentage of water withdrawn in High or Extremely High Baseline Water Stress regions",
        "Like-for-like percentage change in water withdrawn for portfolio area with data coverage",
        "Description of water management risks and strategies to mitigate those risks",
      ],
      "Management of Tenant Sustainability Impacts": [
        "Percentage of new leases containing a cost recovery clause for resource efficiency capital improvements",
        "Leased floor area associated with cost recovery clauses by property subsector",
        "Percentage of tenants separately metered or submetered for grid electricity consumption",
        "Percentage of tenants separately metered or submetered for water withdrawals",
        "Discussion of approach to measuring, incentivising and improving sustainability impacts of tenants",
      ],
      "Climate Change Adaptation": [
        "Area of properties located in 100-year flood zones by property subsector",
        "Description of climate change risk exposure analysis and strategies for mitigating risks",
      ],
      "Activity Metrics": [
        "Number of assets by property subsector",
        "Leasable floor area by property subsector",
        "Percentage of indirectly managed assets by property subsector",
        "Average occupancy rate by property subsector",
      ],
    },

    "Real Estate Services": {
      "Sustainability Services": [
        "Revenue from energy and sustainability services",
        "Floor area of buildings under management provided with energy and sustainability services",
        "Number of buildings under management provided with energy and sustainability services",
      ],
    },
  },

  // ── Other sectors ─────────────────────────────────────────────────────────────
  "Consumer Goods": {
    "Apparel, Accessories & Footwear": {
      "GHG Emissions & Energy": ["Scope 1 GHG emissions", "Scope 2 GHG emissions", "Energy consumed from renewable sources", "Total energy consumed"],
      "Water & Wastewater Management": ["Total water withdrawn", "Total water consumed in water-stressed areas", "Volume of wastewater discharged"],
      "Raw Materials Sourcing": ["Priority raw materials", "Percentage sourced from certified or verified sources", "Supplier environmental audits conducted"],
      "Labour Conditions in Supply Chain": ["Supplier social audits conducted", "Non-conformances identified", "Child labour incidents reported", "Living wage gap analysis"],
      "Product Lifecycle Management": ["Products designed for durability or recyclability", "Percentage of recycled or sustainable materials used"],
    },
    "Household & Personal Products": {
      "GHG Emissions & Energy": ["Scope 1 and 2 GHG emissions", "Total energy consumed", "Renewable energy percentage"],
      "Water Management": ["Total water withdrawn", "Water consumed in water-stressed areas"],
      "Packaging Lifecycle": ["Percentage of packaging that is recyclable or reusable", "Weight of packaging used", "Packaging recovered post-consumer"],
      "Product Safety & Ingredients": ["Products containing substances of very high concern (SVHC)", "Reformulated products", "Recalls and regulatory actions"],
      "Supply Chain Management": ["Tier-1 supplier audits completed", "Critical supplier risk assessments"],
    },
    "Multiline & Specialty Retailers": {
      "Energy Management": ["Total energy consumed", "Energy from grid electricity", "Renewable energy percentage"],
      "Data Security": ["Data breaches involving personally identifiable information (PII)", "Customers notified of breaches", "IT security investment"],
      "Labour Practices": ["Total employee turnover rate", "Gender pay ratio", "Health and safety incidents"],
      "Supply Chain & Sourcing": ["Supplier code of conduct coverage", "Supplier social audits", "Priority supplier ESG risk assessments"],
    },
    "Toys & Sporting Goods": {
      "Product Safety": ["Product recalls issued", "Reportable safety incidents", "Products containing hazardous chemicals"],
      "Packaging & Materials": ["Sustainable materials used", "Packaging recyclability"],
      "Labour Conditions": ["Supplier factory audits", "Non-compliances detected", "Child labour incidents"],
    },
  },
  "Food & Beverage": {
    "Agricultural Products": {
      "GHG Emissions & Energy": ["Scope 1 and 2 GHG emissions", "Energy consumed", "Renewable energy percentage"],
      "Water Management": ["Total water withdrawn", "Water consumed in stressed areas", "Irrigation efficiency"],
      "Land Use & Biodiversity": ["Land under sustainable management", "Deforestation-free sourcing", "Biodiversity impact assessments"],
      "Food Safety & Quality": ["Product recalls", "Food safety audit results", "Customer complaints on quality"],
      "Ingredient Sourcing": ["Certified sustainable sourcing percentage", "Supplier ESG audits", "Traceability to farm level"],
    },
    "Restaurants": {
      "Energy Management": ["Total energy consumed", "Energy intensity per restaurant", "Renewable energy percentage"],
      "Food Safety": ["Health code violations", "Product recalls", "Food safety training hours"],
      "Supply Chain": ["Local sourcing percentage", "Supplier audits", "Food waste diverted from landfill"],
      "Labour Practices": ["Wage rate vs. local minimum wage", "Employee turnover rate", "Tips transparency"],
    },
  },
  "Health Care": {
    "Biotechnology & Pharmaceuticals": {
      "Drug Safety & Efficacy": ["Recalls and safety alerts", "Adverse event reports filed", "Phase III trial success rate"],
      "Access to Medicine": ["Products on essential medicines list", "Tiered pricing programmes", "Licensing agreements for generic production"],
      "Clinical Trial Practices": ["Trials compliant with Good Clinical Practice (GCP) guidelines", "Diversity in trial participants", "Trial result publication rate"],
      "Environmental Footprint": ["Scope 1 and 2 GHG emissions", "Pharmaceutical waste disposed", "Water consumed"],
    },
    "Health Care Delivery": {
      "Patient Safety & Outcomes": ["Hospital-acquired infection rate", "Patient readmission rate", "Mortality rates vs. risk-adjusted benchmark"],
      "Environmental Footprint": ["Energy consumed", "Water withdrawn", "Medical waste generated"],
      "Workforce": ["Nurse-to-patient ratios", "Staff turnover", "Training hours per employee"],
    },
  },
  "Resource Transformation": {
    "Chemicals": {
      "GHG Emissions & Air Quality": ["Scope 1 GHG emissions", "NOx emissions", "SOx emissions", "VOC emissions", "Process safety incidents"],
      "Water Management": ["Water withdrawn", "Wastewater discharged", "Water quality violations"],
      "Hazardous Waste": ["Hazardous waste generated", "Waste disposal method breakdown", "Reportable spills"],
      "Product Stewardship": ["Products on REACH or SVHC watchlist", "Green chemistry investments", "Chemical substitutions completed"],
    },
    "Containers & Packaging": {
      "GHG Emissions & Energy": ["Scope 1 and 2 GHG emissions", "Energy intensity per tonne of packaging"],
      "Packaging Design & Recycled Content": ["Recycled content percentage", "Packaging recyclability rate", "Packaging weight reduction achieved"],
      "Product Lifecycle": ["Extended Producer Responsibility participation", "Post-consumer packaging recovered"],
    },
  },
  "Services": {
    "Professional & Commercial Services": {
      "Environmental Footprint": ["Scope 1 and 2 GHG emissions", "Business travel emissions", "Office energy consumed"],
      "Data Security": ["Data breaches", "Cybersecurity training completion", "Client data governance frameworks"],
      "Workforce Diversity & Inclusion": ["Gender diversity by seniority", "Ethnic diversity representation", "Pay equity gap", "Inclusion index score"],
      "Business Ethics": ["Regulatory violations and fines", "Anti-corruption training completion", "Whistleblower reports"],
    },
    "Hotels & Lodging": {
      "Energy Management": ["Energy consumed per occupied room", "Renewable energy percentage", "Green certifications held"],
      "Water Management": ["Water consumed per occupied room", "Water recycling rate"],
      "Waste Management": ["Waste generated per occupied room", "Waste diverted from landfill", "Single-use plastics eliminated"],
      "Labour Practices": ["Living wage compliance", "Employee turnover", "Health and safety incidents"],
    },
  },
  "Technology & Communications": {
    "Software & IT Services": {
      "Environmental Footprint": ["Scope 1 and 2 GHG emissions", "Data centre Power Usage Effectiveness (PUE)", "Renewable energy for data centres"],
      "Data Privacy & Security": ["Data breaches involving user data", "Requests for user data from governments", "Privacy-by-design adoption rate"],
      "Intellectual Property & Innovation": ["R&D investment as percentage of revenue", "Patents granted", "Open-source contributions"],
      "Workforce": ["Employee attrition rate", "Diversity in technical roles", "Training hours per employee"],
    },
    "Telecommunication Services": {
      "Environmental Footprint": ["Scope 1 and 2 GHG emissions", "Energy consumed by network infrastructure", "E-waste generated from network equipment"],
      "Data Privacy & Security": ["Data breaches", "Government requests for user data", "Network resilience incidents"],
      "Access & Affordability": ["Broadband coverage in underserved areas", "Affordable connectivity plans offered", "Digital inclusion programmes"],
    },
    "Semiconductors": {
      "Energy & GHG": ["Scope 1 GHG emissions from process gases", "Energy consumed per wafer", "Renewable energy percentage"],
      "Water Management": ["Ultra-pure water consumed per wafer", "Water recycled"],
      "Materials Efficiency": ["Hazardous waste generated", "Materials yield rates", "Chemical substitution actions"],
    },
  },
  "Transportation": {
    "Airlines": {
      "GHG Emissions & Fuel": ["Scope 1 GHG emissions", "Fuel efficiency in litres per 100 available seat kilometres (ASK)", "Sustainable aviation fuel (SAF) percentage blended"],
      "Air Quality": ["NOx emissions", "Noise complaints received"],
      "Safety Management": ["Total recordable incident rate (TRIR)", "Fleet incident rate", "Fatalities per billion passenger-kilometres"],
      "Labour Practices": ["Pilot and crew turnover", "Collective bargaining coverage", "Employee satisfaction index"],
    },
    "Road Transportation": {
      "GHG Emissions": ["Scope 1 GHG emissions from fleet", "Fuel efficiency", "Fleet electrification percentage"],
      "Driver Safety & Conditions": ["Road accident rate", "Driver fatigue incidents", "Hours-of-service compliance rate"],
      "Air Quality": ["NOx and particulate matter from fleet"],
    },
  },
  "Renewable Resources & Alternative Energy": {
    "Solar Energy": {
      "Environmental Footprint": ["Land use per MW installed", "Water consumed for panel cleaning", "End-of-life panel recycling rate"],
      "Business Ethics": ["Bribery and corruption incidents", "Regulatory violations"],
      "Supply Chain": ["Forced labour risk in polysilicon supply chain", "Supplier audits completed"],
    },
    "Wind Technology & Project Developers": {
      "Ecological Impacts": ["Avian and bat mortality per GWh", "Land under conservation easement", "Habitat restoration commitments"],
      "Worker Health & Safety": ["Total recordable incident rate (TRIR)", "Fatalities during installation", "Rescue events"],
      "Business Ethics": ["Community benefit agreements", "Regulatory compliance rate"],
    },
  },
};
