# ESG Navigator — PowerPoint Presentation Content

**Purpose:** Use this document as slide-by-slide content to build a detailed PowerPoint deck on the ESG Navigator application and its functionalities.

---

## Slide 1 — Title Slide

**Title:** ESG Navigator
**Subtitle:** A Comprehensive Environmental, Social & Governance Management Platform
**Tagline:** Enabling climate-smart decision-making for financial institutions and corporates
**Branding:** Deloitte green (#86BC25) accent bar
**Footer:** Confidential | [Date] | [Presenter Name]

---

## Slide 2 — Agenda / Table of Contents

1. Introduction & Objectives
2. Platform Overview & Architecture
3. Industry & Role Configuration
4. Module 1: Materiality & Sustainability Reporting
5. Module 2: Climate Risk Assessment (CRA)
6. Module 3: Scenario Analysis & Stress Testing
7. Module 4: SDG & NDC Alignment
8. Module 5: ESRM (Environmental & Social Risk Management)
9. Module 6: Capacity Building Hub (E-Learning)
10. Technical Architecture
11. Key Differentiators
12. Demo Walkthrough
13. Q&A

---

## Slide 3 — Introduction & Objectives

**Title:** Why ESG Navigator?

**Key Points:**

- Regulatory pressure: CBN, SEC Nigeria, and global standards (IFRS S1/S2, TCFD) demand structured ESG reporting
- Financial institutions and corporates need integrated tools to assess, quantify, and report on climate-related risks
- Existing approaches are fragmented — spreadsheets, siloed tools, manual processes

**Objectives:**

- Centralize ESG data collection, analysis, and reporting in one platform
- Quantify physical and transition climate risks across portfolios
- Enable scenario-based stress testing aligned with NGFS frameworks
- Track alignment with UN SDGs and national NDC commitments
- Screen projects for environmental and social risks (ESRM)
- Build organizational ESG capacity through integrated e-learning

---

## Slide 4 — Platform Overview

**Title:** ESG Navigator at a Glance

**Visual:** Hub-and-spoke diagram with "ESG Navigator" at center and 6 modules around it

| Module                       | Purpose                                                          |
| ---------------------------- | ---------------------------------------------------------------- |
| Materiality & Sustainability | Entity profiling, risk register, GHG calculation, IFRS reporting |
| Climate Risk Assessment      | Physical & transition risk analysis across portfolios            |
| Scenario Analysis            | NGFS-based stress testing and financial modeling                 |
| SDG & NDC Alignment          | Map activities to UN SDGs and national climate commitments       |
| ESRM                         | Environmental & social risk screening for projects               |
| Capacity Building            | ESG e-learning courses and certifications                        |

**Highlight:** All modules share a common data layer — entity profile, industry configuration, and role-based access

---

## Slide 5 — Multi-Industry Support

**Title:** Flexible Industry Configuration

**Two columns:**

**Column 1 — Financial Services:**

- Asset types: Loans & Advances, Bonds, Derivatives, Equities, Guarantees
- Segmentation: By sector, geography, risk rating
- CRA labels: "Portfolio exposure", "NPL ratio"
- Collateral mapping: Real estate, equipment, financial instruments

**Column 2 — Telecommunications:**

- Asset types: Tower Infrastructure, Data Centers, Fiber Network, Spectrum Licenses, Power Systems, Real Estate, Vehicle Fleet, Supplier Operations, Mobile Money, Active Equipment
- Segmentation: By infrastructure type, region
- CRA labels: "Infrastructure exposure", "Asset sensitivity"
- Collateral mapping: Telecom-specific assets

**Bottom note:** Industry selection at login determines the entire module configuration downstream

---

## Slide 6 — Role-Based Access Control

**Title:** 12 Roles with Granular Access

**Visual:** Role hierarchy diagram or matrix

| Role                   | Access                                          |
| ---------------------- | ----------------------------------------------- |
| System Administrator   | Full access to all modules                      |
| ESG Manager            | Full access to all modules                      |
| Climate Risk Analyst   | CRA, Scenario Analysis, Capacity Building       |
| Portfolio Manager      | CRA, Scenario Analysis                          |
| Executive              | CRA, SDG, Materiality                           |
| Sustainability Manager | Capacity Building, Materiality (approve/assign) |
| Data Owner             | Materiality (fill data)                         |
| Internal Audit         | Materiality (approve/reject)                    |
| Board                  | Materiality (final approval)                    |
| ERM Team               | CRA, Scenario, Capacity Building, ESRM          |

**Key Feature:** Approval workflow — Data Owner → Sustainability Manager → Internal Audit → Board

---

## Slide 7 — Module 1: Entity Profile Setup

**Title:** Sustainability Reporting Starts with Entity Profiling

**Visual:** 5-step wizard screenshot or mockup

**Step 1 — Corporate Identity:**

- Entity name, country (Nigeria/Ghana), state/region multi-select
- Branch locations: Multiple named branches per state

**Step 2 — Industry & Materiality:**

- SASB sector/industry selection (11 sectors, 77 industries)
- Auto-detection of material topics

**Step 3 — Operational Scale:**

- Employee count, branch count, loan book size
- Configurable scoring matrix (3×3, 4×4, 5×5)
- Custom time horizons

**Step 4 — Value Chain:**

- Core services, upstream/midstream/downstream activities
- Sector and geographic exposures

**Step 5 — Review & Submit:**

- Full summary and confirmation

---

## Slide 8 — Module 1: Risk Register & Materiality Assessment

**Title:** Identify, Score, and Prioritize ESG Risks

**Section 1 — Risk Register:**

- Auto-generated risks from 6 sources: SASB, Internal, External, ERM, ISSB, Regulator
- Filterable table with add/remove capability
- Each risk scored on Impact (1-5) and Likelihood (1-5)

**Section 2 — Materiality Scoring:**

- Interactive materiality matrix visualization
- Three selection methods: Top-N, By Severity, Cherry-Pick
- Selected topics become the material topics for data collection

**Section 3 — Role-Based Data Collection:**

- Sustainability Manager assigns topics to Data Owners per branch
- Data Owners fill SASB metrics with values, units, and analysis
- 4-tier approval: Submit → SM Approval → Internal Audit → Board

**Visual suggestion:** Side-by-side mockup of Manager vs. Data Owner view

---

## Slide 9 — Module 1: GHG Calculator

**Title:** Greenhouse Gas Emissions Calculation (Scope 1, 2, 3)

**Visual:** 4-step stepper diagram

**Scope 1 — Direct Emissions:**

- Mobile combustion (vehicles): Fuel type, liters/month
- Stationary combustion (generators): Fuel type, liters/month
- Auto-calculated tCO₂e per asset

**Scope 2 — Purchased Energy:**

- Electricity consumption per branch (kWh/month)
- Grid vs. private source selection
- Emission factor application

**Scope 3 — Financed Emissions:**

- Sector-level loan exposure amounts
- Intensity factors per sector
- Attributed emissions calculation

**Summary:**

- Consolidated dashboard with total emissions
- Visual breakdown by scope
- Year-over-year comparison capability

---

## Slide 10 — Module 1: IFRS Sustainability Disclosure Report

**Title:** AI-Powered IFRS S1/S2 Reporting

**Key Features:**

- Pillar-based report configuration (Governance, Strategy, Risk Management, Metrics & Targets)
- Year selector for reporting period
- AI-generated narrative incorporating:
  - Entity profile data
  - Material topics and scores
  - GHG emissions data
  - Scenario analysis results
- Role restriction: Only SM/Admin can generate
- Full editing capability with rich text
- Export options: PDF download, print
- Image attachment support
- Attribution: Report shows who generated it and when

**Visual suggestion:** Screenshot of the report generation interface and PDF output

---

## Slide 11 — Module 2: Climate Risk Assessment — Overview

**Title:** Comprehensive Climate Risk Assessment

**Visual:** CRA workflow diagram

**8 Sub-modules:**

1. **Dashboard** — KPIs: Asset Exposure, NPL Ratio, Climate VaR, Weighted Risk Score
2. **Data Upload** — CSV upload per asset type with validation and templates
3. **Portfolio Segmentation** — Pie/bar charts by sector, region, risk level
4. **Physical Risk Assessment** — 9 hazard types, 3 mapping methods, 5×5 matrix
5. **Transition Risk Assessment** — Policy, Technology, Market, Reputation drivers
6. **Collateral Sensitivity** — Hazard-to-collateral impact mapping
7. **Risk Rating Engine** — Composite 5-level ratings with distribution charts
8. **Reporting** — Auto-generated CRA narrative with export

---

## Slide 12 — Module 2: Physical Risk Deep Dive

**Title:** Physical Risk Assessment — 9 Hazard Types

**Hazard Grid:**
| Hazard | Icon | Examples |
|--------|------|----------|
| Flood | 🌊 | River flooding, urban flash floods |
| Drought | ☀️ | Water stress, crop failure |
| Heat Wave | 🌡️ | Extreme heat events |
| Sea Level Rise | 🌊 | Coastal inundation |
| Storm/Cyclone | 🌪️ | Wind damage, tropical storms |
| Landslide | ⛰️ | Slope failure, erosion |
| Wildfire | 🔥 | Forest/bush fires |
| Coastal Erosion | 🏖️ | Shoreline retreat |
| Cold Wave/Frost | ❄️ | Extreme cold events |

**Mapping Methods:** Location-based, Region-based, Sector-based

**Results Visualization:**

- 5×5 Risk Matrix (Impact × Likelihood) with color-coded cells
- Drill-down: Click any cell to see assets and exposure values
- Hazard contributors table (top risk areas with ₦ amounts)
- Physical shock matrix across NGFS scenarios and time horizons

---

## Slide 13 — Module 3: Scenario Analysis & Stress Testing

**Title:** NGFS-Aligned Scenario Analysis

**Scenario Framework:**

| Scenario                | Temperature  | Carbon Price | Physical Damage | Macro Impact |
| ----------------------- | ------------ | ------------ | --------------- | ------------ |
| Orderly (Net Zero 2050) | 1.5°C        | High         | Low             | Moderate     |
| Disorderly              | 1.5-2°C      | Late, abrupt | Moderate        | High         |
| Hot House World         | 3°C+         | Low          | Severe          | Severe       |
| Custom                  | User-defined | User-defined | User-defined    | User-defined |

**Parameters per scenario:**

- Carbon price trajectories (short/medium/long term)
- Physical damage percentages per time horizon
- GDP impact, inflation change, interest rate change

**Sector Betas:** 10+ sectors with carbon sensitivity, GDP sensitivity, and physical risk multipliers

**Outputs:**

- NPV under different WACC scenarios
- Free Cash Flow projections
- Sector-level impact analysis
- Quantitative stress test results

---

## Slide 14 — Module 4: SDG & NDC Alignment

**Title:** Tracking Impact Against Global Goals

**SDG Dashboard KPIs:**

- SDG Alignment Score: 78.4% (+5.2%)
- NDC Progress: 62.8% (+8.1%)
- Green Finance Ratio: ₦2.4B (+18.3%)
- ESG Score: B+ (Upgraded)
- Carbon Offset: 12,450 tCO₂e
- Clean Energy Loans: ₦892M

**SDG Alignment:**

- 17 UN SDGs with per-goal alignment scores
- Target-level mapping with bank-specific actions
- Progress tracking per target (e.g., "1.4 — Access to financial services: 75%")

**NDC Tracker:**

- Nigeria's climate commitments by sector (Energy, Agriculture, Transport, Waste, Industry)
- Progress bars and status indicators (On Track / Moderate / Behind)
- Allocated financing per sector

**ESG Pillar Breakdown:** Environmental 82% | Social 75% | Governance 88%

---

## Slide 15 — Module 5: ESRM

**Title:** Environmental & Social Risk Management

**6-Step Project Workflow:**

1. **ESS** — Environmental & Social Screening (sector classification)
2. **Categorization** — Assign risk category A (High) / B (Medium) / C (Low)
3. **ESDD** — Detailed due diligence investigation
4. **ESAP** — Mitigation action plan development
5. **Appraisal** — Final assessment and decision recommendation
6. **Monitoring** — Ongoing compliance tracking

**Dashboard Features:**

- Project listing with status and current step indicator
- KPI cards: Total projects, active, completed, pending
- Charts: Project distribution by category and status
- Methodology reference documentation
- Admin panel for user and configuration management

**Use Case:** Banks screen every project financing deal for E&S risks before approval

---

## Slide 16 — Module 6: Capacity Building Hub

**Title:** Integrated E-Learning & Certifications

**Features:**

- Full LMS with course catalog, enrollment, and progress tracking
- Course categories: ESG fundamentals, climate risk, sustainability reporting, etc.
- Course cards with duration, description, and "Bestseller" badges
- Course player with modular lesson structure
- Automatic certification upon course completion
- User learning profile and history

**Value Proposition:**

- Build organizational ESG expertise alongside tool usage
- Track team competency development
- Ensure consistent understanding of ESG frameworks and standards

---

## Slide 17 — Technical Architecture

**Title:** Modern, Scalable Architecture

**Frontend Stack:**
| Technology | Purpose |
|-----------|---------|
| React 18 + TypeScript | Type-safe, component-based UI |
| Vite | Fast build tooling |
| Material UI v6 | Enterprise component library |
| Zustand | Lightweight state management with persistence |
| React Router v6 | Client-side routing with nested layouts |
| Recharts | Data visualization |
| jsPDF + html2canvas | PDF generation |
| xlsx (SheetJS) | Excel import/export |

**Key Design Decisions:**

- **Zero backend** — All processing runs client-side for demo/prototype flexibility
- **Local storage persistence** — Data survives page refreshes
- **Role-based routing** — Guard components restrict access at route level
- **Multi-industry architecture** — Industry config drives module behavior
- **SASB taxonomy built-in** — 11 sectors, 77 industries with materiality mappings

**Deployment:** Vercel (primary) / Render (fallback) with SPA routing configuration

---

## Slide 18 — Key Differentiators

**Title:** What Sets ESG Navigator Apart

1. **End-to-End Coverage** — From entity profiling to AI-generated IFRS disclosure in one platform
2. **Multi-Industry** — Financial Services and Telecommunications with distinct configurations
3. **Standards-Aligned** — IFRS S1/S2, SASB, TCFD, GHG Protocol, NGFS, UN SDGs
4. **Role-Based Workflows** — 12 roles with granular permissions and 4-tier approval
5. **9 Physical Hazard Types** — Comprehensive climate hazard library with custom additions
6. **NGFS Scenarios** — Pre-built Orderly, Disorderly, Hot House plus custom scenarios
7. **GHG Calculator** — Full Scope 1/2/3 calculation with standard emission factors
8. **AI Report Generation** — Automated IFRS-aligned sustainability narrative
9. **Integrated Learning** — Build team capability alongside tool adoption
10. **West Africa Focus** — Nigeria and Ghana geographic configurations built in

---

## Slide 19 — Demo Flow (Recommended Walkthrough)

**Title:** Live Demo Path

**Suggested demo sequence (15-20 minutes):**

1. **Login** → Select "Chioma Adebayo" (Admin) → Choose Financial Services industry
2. **Module Hub** → Overview of available modules
3. **Sustainability Module**
   - Entity Profile → Show 5-step wizard (pre-filled or quick fill)
   - Risk Register → Show auto-generated risks, filter by source
   - Materiality Scoring → Show matrix, select top topics
   - GHG Calculator → Walk through Scope 1/2/3 entries
   - AI Report → Generate and download PDF
4. **CRA Module**
   - Dashboard → KPIs overview
   - Data Upload → Upload sample CSV
   - Physical Risk → Select hazards, run assessment, show 5×5 matrix
5. **Scenario Analysis** → Select NGFS scenario, adjust parameters, show results
6. **SDG Dashboard** → Show 17-goal alignment, NDC tracker
7. **ESRM** → Create project, walk through 6-step workflow
8. **Capacity Building** → Browse course catalog

**Alternate demo:** Login as Data Owner to show role-restricted view

---

## Slide 20 — Data Templates & Sample Data

**Title:** Ready-to-Use Templates and Test Data

**CSV Templates (downloadable):**

- ERM risks, External risks, Internal risks
- ISSB risks, Regulator risks, SASB risks

**Financial Services Test Data:**

- Loans portfolio (Q1 2026)
- Bonds, derivatives, equities, guarantees templates

**Telecommunications Test Data:**

- Tower infrastructure, data centers, fiber network
- Power systems, spectrum licenses, vehicle fleet
- Real estate, supplier operations, mobile money, active equipment

**Note:** All templates match expected upload formats with validation

---

## Slide 21 — Roadmap & Next Steps

**Title:** Future Enhancements

**Potential additions:**

- Backend API integration (Node.js/Python) for production deployment
- Multi-tenant architecture with database persistence
- Real-time data ingestion from core banking / ERP systems
- Advanced AI/ML models for risk prediction
- Regulatory filing automation (CBN, SEC)
- Mobile application for field data collection
- API marketplace for third-party ESG data providers
- Benchmarking against industry peers

---

## Slide 22 — Q&A

**Title:** Questions & Discussion

**Contact Information:**

- [Presenter Name]
- [Email]
- [Phone]

**Resources:**

- Application URL: [deployment URL]
- Documentation: ESG_Navigator_Walkthrough.md
- Test credentials: See sample users section

---

## Appendix A — SASB Sectors & Industries

| #   | Sector                      | Example Industries                                   |
| --- | --------------------------- | ---------------------------------------------------- |
| 1   | Consumer Goods              | Apparel, Appliance Manufacturing, Household Products |
| 2   | Extractives & Minerals      | Coal Operations, Metal Mining, Oil & Gas             |
| 3   | Financials                  | Commercial Banks, Insurance, Asset Management        |
| 4   | Food & Beverage             | Agricultural Products, Meat Processing, Restaurants  |
| 5   | Health Care                 | Biotechnology, Drug Retailers, Medical Equipment     |
| 6   | Infrastructure              | Electric Utilities, Gas Utilities, Water Utilities   |
| 7   | Renewable Resources         | Biofuels, Forestry, Pulp & Paper                     |
| 8   | Resource Transformation     | Aerospace & Defense, Chemicals, Steel                |
| 9   | Services                    | Education, Hotels, Media                             |
| 10  | Technology & Communications | Hardware, Internet Media, Semiconductors, Telecom    |
| 11  | Transportation              | Air Freight, Airlines, Auto Parts, Marine            |

---

## Appendix B — Physical Risk Matrix Color Key

| Risk Level | Score Range | Color  | Description                                  |
| ---------- | ----------- | ------ | -------------------------------------------- |
| Low        | 1–5         | Green  | Minimal climate exposure                     |
| Medium     | 6–10        | Yellow | Moderate exposure, monitoring required       |
| High       | 12–16       | Orange | Significant exposure, mitigation needed      |
| Very High  | 20–25       | Red    | Critical exposure, immediate action required |

---

## Appendix C — NGFS Scenario Parameters

| Parameter                | Orderly   | Disorderly | Hot House |
| ------------------------ | --------- | ---------- | --------- |
| Carbon Price (Short)     | $30/tCO₂  | $10/tCO₂   | $5/tCO₂   |
| Carbon Price (Medium)    | $80/tCO₂  | $50/tCO₂   | $10/tCO₂  |
| Carbon Price (Long)      | $150/tCO₂ | $120/tCO₂  | $15/tCO₂  |
| Physical Damage (Short)  | 2%        | 3%         | 5%        |
| Physical Damage (Medium) | 5%        | 8%         | 15%       |
| Physical Damage (Long)   | 8%        | 12%        | 25%       |
| GDP Impact               | -1%       | -3%        | -5%       |
| Inflation Change         | +0.5%     | +1.5%      | +2%       |
| Interest Rate Change     | +0.25%    | +1%        | +1.5%     |
| Temperature Target       | 1.5°C     | 2°C        | 3°C+      |

---

_End of PowerPoint Content Guide_
