# ESG Navigator — Comprehensive Application Walkthrough

**Version:** 1.0 — March 2026
**Platform:** React + TypeScript + Material UI + Zustand + Vite
**Deployment:** Vercel / Render

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Authentication & Role-Based Access](#2-authentication--role-based-access)
3. [Landing Page & Login](#3-landing-page--login)
4. [Industry Selection](#4-industry-selection)
5. [Module Selection Hub](#5-module-selection-hub)
6. [Module 1 — Materiality & Sustainability Reporting](#6-module-1--materiality--sustainability-reporting)
   - 6.1 Entity Profile Setup
   - 6.2 Risk Register & Materiality Scoring
   - 6.3 Data Collection (Materiality Dashboard)
   - 6.4 GHG Calculator (Emissions Module)
   - 6.5 IFRS Disclosure (AI Report)
7. [Module 2 — Climate Risk Assessment (CRA)](#7-module-2--climate-risk-assessment-cra)
   - 7.1 CRA Dashboard
   - 7.2 Data Upload
   - 7.3 Portfolio Segmentation
   - 7.4 Physical Risk Assessment
   - 7.5 Transition Risk Assessment
   - 7.6 Collateral Sensitivity
   - 7.7 Risk Rating Engine
   - 7.8 CRA Reporting
8. [Module 3 — Scenario Analysis (Stress Testing)](#8-module-3--scenario-analysis-stress-testing)
   - 8.1 Scenario Dashboard
   - 8.2 Run Simulation
   - 8.3 Quantitative Analysis
   - 8.4 Scenario Library
   - 8.5 Stress Test Reports
9. [Module 4 — SDG & NDC Alignment](#9-module-4--sdg--ndc-alignment)
   - 9.1 SDG Dashboard
   - 9.2 SDG Alignment Detail
   - 9.3 NDC Tracker
   - 9.4 Reports & Disclosure
10. [Module 5 — ESRM (Environmental & Social Risk Management)](#10-module-5--esrm)
11. [Module 6 — Capacity Building Hub (E-Learning / LMS)](#11-module-6--capacity-building-hub)
12. [Standalone Materiality Assessment Module](#12-standalone-materiality-assessment-module)
13. [Theme & UI Configuration](#13-theme--ui-configuration)
14. [Data Architecture & State Management](#14-data-architecture--state-management)

---

## 1. Application Overview

The **ESG Navigator** is a comprehensive Environmental, Social, and Governance (ESG) management platform designed for financial institutions and corporates operating in West Africa (Nigeria and Ghana). It provides end-to-end tools for:

- **Sustainability reporting** aligned with IFRS S1/S2 and SASB standards
- **Climate risk assessment** (physical and transition risks) across loan portfolios or telecom infrastructure
- **Scenario analysis and stress testing** using NGFS scenarios (Orderly, Disorderly, Hot House)
- **SDG and NDC alignment tracking** against the UN's 17 Sustainable Development Goals and Nigeria's Nationally Determined Contributions
- **Environmental & Social Risk Management (ESRM)** project screening and due diligence
- **Capacity building** via an integrated Learning Management System (LMS)

The platform features **multi-industry support** (Financial Services and Telecommunications), **role-based access control** with 12 distinct roles, **dark/light theme toggling**, and a **Deloitte-branded design system** using their signature green (#86BC25).

---

## 2. Authentication & Role-Based Access

### 2.1 Roles

The system supports 12 user roles, each with specific module access and permissions:

| Role                      | Label                   | Module Access                          |
| ------------------------- | ----------------------- | -------------------------------------- |
| `admin`                   | System Administrator    | All modules                            |
| `esg_manager`             | ESG Manager             | All modules                            |
| `risk_analyst`            | Climate Risk Analyst    | CRA, Scenario, Capacity Building       |
| `portfolio_manager`       | Portfolio Manager       | CRA, Scenario                          |
| `executive`               | Executive               | CRA, SDG, Materiality                  |
| `data_entry`              | Data Owner (legacy)     | Materiality                            |
| `sustainability_champion` | Sustainability Champion | Capacity Building, Materiality         |
| `sustainability_manager`  | Sustainability Manager  | Capacity Building, Materiality         |
| `data_owner`              | Data Owner              | Materiality                            |
| `sustainability_approver` | Internal Audit          | Materiality                            |
| `board`                   | Board                   | Materiality                            |
| `erm_team`                | ERM Team                | CRA, Scenario, Capacity Building, ESRM |

### 2.2 Permissions

Permissions include: `view_dashboard`, `view_cra_data`, `upload_data`, `edit_data`, `delete_data`, `run_analysis`, `configure_risk`, `generate_reports`, `export_data`, `manage_users`, `view_audit_logs`, `system_config`.

### 2.3 Sample Users

Pre-configured demo accounts (all passwords follow the pattern shown):

| Name           | Email                    | Role              |
| -------------- | ------------------------ | ----------------- |
| Chioma Adebayo | chioma.adebayo@fmn.com   | Admin             |
| Ibrahim Musa   | ibrahim.musa@fmn.com     | ESG Manager       |
| Funke Akindele | funke.akindele@fmn.com   | Risk Analyst      |
| Emeka Okonkwo  | emeka.okonkwo@fmn.com    | Portfolio Manager |
| Zainab Ahmed   | zainab.ahmed@fmn.com     | Executive         |
| Tunde Bakare   | tunde.bakare@fmn.com     | Data Owner        |
| Amaka Obiora   | data-owner@deloitte.com  | Data Owner        |
| Tunde Fashola  | data-owner2@deloitte.com | Data Owner        |

Sustainability-specific demo users are also available for Sustainability Manager, Internal Audit, and Board roles.

### 2.4 Guards

- **AuthGuard**: Redirects unauthenticated users to `/login`.
- **RoleGuard**: Restricts route access to specific roles.
- **PermissionGuard**: Fine-grained permission checks within components.

---

## 3. Landing Page & Login

### Landing Page (`/`)

- Marketing-style hero page introducing the ESG Navigator
- Call-to-action buttons to log in or learn more
- Brand-consistent design with Deloitte green accents

### Login Page (`/login`)

- Email and password form
- Pre-populated dropdown of sample users for demo convenience
- On successful login, redirects to `/industry-setup`

---

## 4. Industry Selection (`/industry-setup`)

After login, users select their industry context:

- **Financial Services** — Bank-centric with loan portfolios, bonds, derivatives, equities, guarantees as asset types
- **Telecommunications** — Telecom-centric with tower infrastructure, data centers, fiber networks, spectrum licenses, etc.

This selection determines:

- Which asset types are available for data upload
- CRA dashboard labels (e.g., "Portfolio" vs. "Infrastructure")
- Transition risk driver categories
- Collateral sensitivity mappings
- Segmentation options

The industry configuration is stored globally and referenced throughout all modules.

---

## 5. Module Selection Hub (`/modules`)

A hub page showing all available modules as cards. Modules are filtered based on the logged-in user's role (via `roleModuleIds` configuration):

| Module ID  | Module Name                  | Description                                             |
| ---------- | ---------------------------- | ------------------------------------------------------- |
| `cra`      | Climate Risk Assessment      | Physical & transition risk analysis across portfolios   |
| `scenario` | Scenario Analysis            | NGFS-based stress testing and financial impact modeling |
| `sdg`      | SDG & NDC Alignment          | Map activities to UN SDGs and Nigeria's NDC commitments |
| `learning` | Capacity Building Hub        | ESG e-learning courses with certifications              |
| `materia`  | Materiality & Sustainability | Full IFRS S1/S2 sustainability reporting workflow       |
| `esrm`     | ESRM                         | Environmental & Social Risk Management screening        |

---

## 6. Module 1 — Materiality & Sustainability Reporting

**Route prefix:** `/sustainability`
**Layout:** SustainabilityLayout with collapsible sidebar
**Sidebar navigation groups:**

- **Overview** — Sustainability Dashboard
- **Data & Inputs** — Entity Profile, Risk Register, Data Collection, GHG Calculator
- **Reports** — IFRS Disclosure
- **Switch Module** — Return to module hub

### 6.1 Entity Profile Setup (`/sustainability/entity`)

A **5-step wizard** for configuring the entity's identity and operational parameters:

**Step 1 — Corporate Identity:**

- Entity name, description
- Country selection (Nigeria, Ghana) with multi-select
- State/Region selection with expandable country groups, "select all" per country, and individual state checkboxes
- **Branch Locations**: After selecting states, users can add multiple named branch offices per state (e.g., "Victoria Island Branch" and "Ikeja Branch" both in Lagos). Each branch has a name, state, and country. Branches are used for data owner assignment in materiality topics.

**Step 2 — Industry & Materiality:**

- SASB Sector selection (11 sectors: Consumer Goods, Extractives, Financials, Food & Beverage, Health Care, Infrastructure, Renewable Resources, Resource Transformation, Services, Technology & Communications, Transportation)
- Multi-select industries within the chosen sector
- Auto-detection of SASB materiality topics based on selected industries

**Step 3 — Operational Scale:**

- Number of employees
- Branch count
- Loan book size (for financial institutions)
- Scoring matrix configuration (3×3, 4×4, or 5×5) with customizable level labels
- Time horizon definitions (Short, Medium, Long term with custom year ranges)

**Step 4 — Value Chain:**

- Core services (tag input)
- Upstream, midstream, downstream activities (tag inputs)
- Sector exposures (sector + percentage pairs)
- Geographic exposure (tag input)

**Step 5 — Review & Submit:**

- Summary of all configured parameters
- On submission, generates SASB risks plus sample risks (internal, external, ERM, ISSB, regulator) and navigates to Risk Register

### 6.2 Risk Register & Materiality Scoring

**Risk Identification (`/sustainability/risks`):**

- Displays all generated risks in a table (SASB-derived + sample risks)
- Filter by source: SASB, Internal, External, ERM, ISSB, Regulator
- Each risk has: name, category, subcategory, impact (1-5), likelihood (1-5), financial effect, time horizon
- Users can add custom risks or remove existing ones

**Materiality Scoring (`/sustainability/risks/scoring`):**

- Interactive materiality matrix (impact × likelihood)
- Topic selection methods: Top-N, By Severity Level, or Cherry-Pick
- Selected topics become the organization's material topics for data collection
- Approval workflow: Submit → Manager Approval → Internal Audit Approval → Board Approval

### 6.3 Data Collection — Materiality Dashboard (`/sustainability/materiality`)

This is a **role-adaptive view** that changes completely based on the logged-in user's role:

**Data Owner View:**

- Shows only topics assigned to the logged-in data owner
- Each topic expands into the **MaterialityTemplateList** component
- Data owners fill in SASB metrics: each metric has a value input (with units shown in the input adornment), a discussion/analysis field, and a year selector
- Numeric validation on quantitative metrics
- Discussion field validation (minimum substantive text required)
- "Submit" button to mark a topic as completed

**Sustainability Manager View:**

- Full table of all material topics
- Columns: Topic name, Assigned Data Owner, Assigned Branch, Status, Actions
- Bulk assignment: select multiple topics and assign a data owner + branch in one action
- Individual assignment via dropdowns per topic row
- Branch locations are populated from the entity profile's `branchLocations` array
- Status chips: Draft, Submitted, Manager Approved, etc.
- "Approve" and "Reject" actions per topic
- "Proceed to Reporting" navigation button

**Approver Views (Internal Audit / Board):**

- Table of all topics with approve/reject workflow
- Review comments field
- Status progression tracking

### 6.4 GHG Calculator — Emissions Module (`/sustainability/emissions`)

A **4-step stepper** for calculating greenhouse gas emissions:

**Step 1 — Scope 1 (Direct Emissions):**

- Add mobile or stationary combustion assets
- Fields: asset name, branch, type (mobile/stationary), fuel type (diesel/petrol/LPG/CNG), liters per month, number of months
- Each entry auto-calculates tCO₂e using standard emission factors (÷1000 for kg→tCO₂e)
- Total Scope 1 emissions displayed

**Step 2 — Scope 2 (Electricity / Purchased Energy):**

- Add electricity consumption entries per branch
- Fields: branch, kWh per month, months, source (grid/private), emission factor
- Auto-calculates tCO₂e per entry
- Total Scope 2 emissions displayed

**Step 3 — Scope 3 (Financed Emissions / Value Chain):**

- Add sector-level financed emission entries
- Fields: sector, loan exposure amount, intensity factor
- Calculates attributed emissions
- Total Scope 3 emissions displayed

**Step 4 — Summary & Report:**

- Consolidated emissions summary across all 3 scopes
- Visual breakdown charts
- "Proceed to Reporting" button to navigate to IFRS Disclosure

### 6.5 IFRS Disclosure — AI Report (`/sustainability/report`)

**Tab 0 — Report Setup:**

- Pillar-based accordion sections for selecting report content
- Toggle which pillars and sub-sections to include
- Year selector for the reporting period

**Tab 1 — Generate Report:**

- Collects all entity profile data, materiality topics, GHG emissions, scenario results
- Builds a comprehensive IFRS S1/S2 aligned sustainability report
- **Role restriction:** Only Sustainability Manager and Admin roles can generate reports
- Shows generating progress indicator
- Attributes report to the generating user with a timestamp

**Report View:**

- Full editable text area with the generated report content (Georgia/serif font)
- Toolbar with: Regenerate, Add Image, Print, Download PDF
- **PDF Download** generates a properly formatted PDF using jsPDF:
  - Markdown-style headings rendered in bold at different sizes
  - Body text with word-wrap and automatic page breaks
  - Attached images placed on separate pages
  - Filename: `EntityName_Sustainability_Report_YYYY.pdf`
- Image attachment support with preview and remove functionality

---

## 7. Module 2 — Climate Risk Assessment (CRA)

**Route prefix:** `/cra`
**Layout:** CRALayout with top navbar (no sidebar)
**Navigation:** CRANavigation component provides Back/Next module navigation

### 7.1 CRA Dashboard (`/cra/dashboard`)

- KPI metric cards: Asset Exposure, NPL Ratio, Weighted Risk Score, Climate VaR, etc.
- Each KPI shows value, percentage change, trend indicator (up/down)
- Module cards linking to each CRA sub-module with completion percentage
- Progressive disclosure: some modules lock until prerequisites are met (e.g., data upload required first)

### 7.2 Data Upload (`/cra/data`)

- Lists all asset types for the selected industry (e.g., Loans & Advances, Bonds, Equities for Financial Services; Tower Infrastructure, Data Centers, etc. for Telecom)
- CSV file upload for each asset type
- Built-in data validation and preview
- Download template buttons for each asset type
- Asset type cards show upload status and row counts

**Data Viewer (`/cra/data/:assetTypeId`):**

- Tabular view of uploaded data for a specific asset type
- Search, filter, and pagination
- Export functionality

### 7.3 Portfolio Segmentation (`/cra/segmentation`)

- Segments uploaded portfolio data by various dimensions: sector, region, risk level, etc.
- Interactive charts (pie, bar) for exposure distribution
- Filterable data table with search
- Export to Excel functionality
- Geographic visualization of portfolio exposure

### 7.4 Physical Risk Assessment (`/cra/physical`)

**Decision Phase:**

- Grid of 9 physical hazard types: Flood, Drought, Heat Wave, Sea Level Rise, Storm/Cyclone, Landslide, Wildfire, Coastal Erosion, Cold Wave/Frost
- Each has an icon, color, and checkbox for selection
- Users can **add custom risk types**

**Setup Phase:**

- For each selected hazard, configure:
  - Mapping methods: Location-based, Region-based, Sector-based (multi-select)
  - Asset selection: Choose which uploaded asset types to include
  - Justification text area
- Preview button to see risk scoring before running

**Processing:**

- Animated progress indicator during assessment computation

**Overview (Results):**

- **Tabbed interface** — one tab per hazard × method combination
- **5×5 Risk Matrix**: Impact (X) × Likelihood (Y)
  - Color-coded cells: Green (1-5), Yellow (6-10), Orange (12-16), Red (20-25)
  - Each cell shows count of assets and total exposure
  - **Hover tooltip** shows top 5 assets with their exposure amounts
  - **Click** to drill down into assets in that cell
- **Side panel**:
  - Total exposure card with a "View Full Details" button
  - **Top Hazard Contributors (High Risk Areas)**: Shows names with amounts and percentages
- **Legend**: Color-coded risk level descriptions
- **Physical Shock Matrix**: Scenarios (Orderly/Disorderly/Hot House) × Time Horizons (Short/Medium/Long) with percentage impact chips
- **Recent Assessments** log with timestamps
- **Export to Excel** functionality

### 7.5 Transition Risk Assessment (`/cra/transition`)

- Stepper-based workflow for assessing transition risks
- Transition risk drivers categorized by: Policy & Legal, Technology, Market, Reputation
- Industry-specific driver configurations
- Asset-level transition scoring
- Matrix visualization similar to physical risk
- Export capability

### 7.6 Collateral Sensitivity (`/cra/collateral`)

- Maps physical hazards to collateral types
- Industry-specific collateral mappings
- Sensitivity scoring and exposure impact analysis

### 7.7 Risk Rating Engine (`/cra/rating`)

- Composite risk rating system combining physical and transition risk scores
- 5-level rating: Very Low, Low, Medium, High, Very High
- Rating distribution charts (pie chart, bar chart)
- Asset-level risk rating table with pagination
- Summary statistics and exposure breakdown
- Uses formatExposureM for currency formatting (millions/billions with ₦ symbol)

### 7.8 CRA Reporting (`/cra/reporting`)

- Stepper-based report generation workflow
- Section selection with checkboxes
- Auto-generated narrative combining all CRA module results
- Export options: PDF download, print, share

---

## 8. Module 3 — Scenario Analysis (Stress Testing)

**Route prefix:** `/scenario-analysis`
**Layout:** Sidebar with collapsible navigation
**Sidebar items:** Overview, Run Simulation, Quant Analysis, Scenario Library, Stress Test Reports

### 8.1 Scenario Dashboard (`/scenario-analysis`)

- Overview of completed scenario analyses
- Summary KPIs and charts
- Quick-start buttons for new simulations

### 8.2 Run Simulation (`/scenario-analysis/run`)

- Workflow-based scenario configuration
- **NGFS Scenario Selection**: Orderly (Net Zero 2050), Disorderly, Hot House World, Custom
- **Parameter Configuration** per scenario:
  - Carbon price trajectories (short/medium/long term)
  - Physical damage percentages
  - Macro shocks: GDP impact, inflation, interest rate changes
  - Temperature rise target
- Sector-specific beta coefficients (betaCarbon, betaGDP, physicalMultiplier) for: Oil & Gas, Coal Mining, Electricity Generation, Air Transport, etc.
- Time horizon definitions: Short (1-3y), Medium (3-10y), Long (10-30y)
- Run button triggers simulation computation

### 8.3 Quantitative Analysis (`/scenario-analysis/quant`)

- NPV calculations using different WACC scenarios
- Free Cash Flow projections by scenario
- Audited financials integration
- Telecom infrastructure category analysis (for telecom industry)
- Advanced financial modeling outputs

### 8.4 Scenario Library (`/scenario-analysis/library`)

- Browse and manage saved scenarios
- Clone, edit, or delete scenarios
- Compare multiple scenarios side by side

### 8.5 Stress Test Reports (`/scenario-analysis/reports`)

- Generate comprehensive stress test reports
- Include scenario parameters, results, and recommendations
- Export functionality

---

## 9. Module 4 — SDG & NDC Alignment

**Route prefix:** `/sdg-ndc`
**Layout:** SDGLayout with sidebar navigation
**Sidebar items:** Dashboard, SDG Alignment, NDC Tracker, Reports & Disclosure

### 9.1 SDG Dashboard (`/sdg-ndc`)

**KPI Cards (6):**

- SDG Alignment Score (78.4%, +5.2%)
- NDC Progress (62.8%, +8.1%)
- Green Finance Ratio (₦ 2.4B, +18.3%)
- ESG Score (B+, Upgraded)
- Carbon Offset (12,450 tCO₂e, +34%)
- Clean Energy Loans (₦ 892M, +22.6%)

**SDG Goals Grid:**

- All 17 SDG goals displayed with official UN colors
- Each shows alignment score and aligned/not-aligned status
- Summary: X of 17 goals aligned, average score

**NDC Commitments Table:**

- Sectors: Energy, Agriculture (REDD+), Transport, Waste Management, Industry
- Each shows target description, progress percentage, status (On Track/Moderate/Behind), allocated amount

**ESG Pillar Breakdown:**

- Environmental: 82%, Social: 75%, Governance: 88%

**Sustainable Finance Chart:**

- Quarterly financing data: Green, Social, Governance categories

### 9.2 SDG Alignment Detail (`/sdg-ndc/sdg-alignment`)

- Detailed mapping for 6 priority SDGs: No Poverty, Clean Energy, Decent Work, Climate Action, Gender Equality, Industry & Innovation
- Each SDG shows specific targets with codes (e.g., "1.4", "7.1", "13.2")
- Bank-specific actions linked to each target with progress percentages
- Radar chart showing scores across all 17 goals

### 9.3 NDC Tracker (`/sdg-ndc/ndc-tracker`)

- Nigeria's Nationally Determined Contribution tracking
- Sector-by-sector progress monitoring
- Emission reduction targets and actual progress

### 9.4 Reports & Disclosure (`/sdg-ndc/reports`)

- Generate SDG alignment and NDC compliance reports
- Regulatory filing support

---

## 10. Module 5 — ESRM (Environmental & Social Risk Management)

**Route prefix:** `/esrm`
**Layout:** Custom sidebar with collapsible navigation
**Sidebar items:** Dashboard, New Project, Pending Tasks, Completed Projects, Methodology, Admin

### ESRM Workflow

The ESRM module follows a **6-step project workflow:**

1. **ESS (Environmental & Social Screening)** — Initial sector classification and risk screening
2. **Categorization** — Assign risk category (A/B/C) based on screening results
3. **ESDD (Environmental & Social Due Diligence)** — Detailed investigation of identified risks
4. **ESAP (Environmental & Social Action Plan)** — Define mitigation measures and action items
5. **Appraisal** — Final risk assessment and decision recommendation
6. **Monitoring** — Ongoing compliance tracking and reporting

### Key Features

- **Create Customer/Project**: Form to capture new project details
- **Import Data**: Bulk import of projects via modal
- **Projects Table**: Dashboard table showing all projects with status, progress, and current step
- **KPI Cards**: Summary metrics (total projects, active, completed, pending)
- **Charts**: Visual analytics of project distribution
- **Methodology**: Reference documentation for the ESRM framework
- **Admin**: User management and system configuration (role-restricted)
- **Save as Draft**: Projects can be saved as drafts and resumed later

---

## 11. Module 6 — Capacity Building Hub (E-Learning / LMS)

**Route prefix:** `/capacity-building`
**Layout:** LMSLayout with navigation
**Sidebar items:** Dashboard, Course Catalog, My Learning, Course Player, Certifications, Profile

### 11.1 LMS Dashboard

- Overview of learning progress
- Enrolled courses count, completed count
- Recent activity and recommendations

### 11.2 Course Catalog (`/capacity-building/catalog`)

- Full course library with search and category filtering
- Categories derived from course metadata
- Paginated grid display (8 per page)
- Course cards show: title, description, category, duration, completion rate
- "Bestseller" badges on select courses
- Click to navigate to course player

### 11.3 My Learning (`/capacity-building/my-learning`)

- Courses currently in progress
- Completion percentage tracking
- Continue learning buttons

### 11.4 Course Player (`/capacity-building/course/:courseId`)

- Full course content viewer
- Progress tracking with auto-save
- Module/lesson navigation
- Completion triggers certification

### 11.5 Certifications (`/capacity-building/certifications`)

- List of earned certifications
- Certificate details and download

### 11.6 User Profile (`/capacity-building/profile`)

- Learning preferences and settings
- Progress history

---

## 12. Standalone Materiality Assessment Module

**Route prefix:** `/materiality`
**Layout:** MaterialityLayout with dark sidebar

A standalone materiality assessment workflow independent of the full sustainability module:

### 12.1 Profiling (`/materiality/profiling`)

- Topic selection with SASB-aligned categories
- Accordion groups by ESG theme (Environmental, Social, Governance, etc.)
- Toggle topics on/off
- Add custom topics via modal dialog
- Impact and stakeholder interest scoring (1-5 scales)
- Progress indicator showing selected vs. total topics

### 12.2 Data Input (`/materiality/data-input`)

- Tabbed interface for data entry
- SFI (Sustainable Finance Instrument) data integration
- Per-topic metric entry tables
- Role-based editing (Data Owner can edit, others read-only)
- Submit for approval workflow
- Export to Excel

### 12.3 Analytics Dashboard (`/materiality`)

- Visual analytics of materiality assessment results
- Charts and summary statistics
- Topic coverage analysis

---

## 13. Theme & UI Configuration

### Color System

- **Primary Brand**: Deloitte Green `#86BC25`
- **Slate Scale**: `#2D2D2D` (dark), `#636363` (default), `#97999B` (lit), `#D0D0CE` (lighter)
- **Status Colors**: Success (green), Warning (amber), Error (red), Info (blue)
- **SDG Colors**: UN-official colors for all 17 goals
- **Risk Matrix Colors**: `#bbf7d0` (low), `#fde047` (medium), `#fdba74` (high), `#fca5a5` (very high)

### Theme Toggle

- Light and dark mode support throughout the application
- Stored in `themeStore` and persisted across sessions
- Toggle accessible from the top navbar

### Design Patterns

- Material UI (MUI) v6 with custom theming
- Responsive grid layouts
- Paper cards with elevation and outlined variants
- Consistent border radius (8-12px)
- Hover animations (translateY, scale transforms)
- Alpha-blended color accents

---

## 14. Data Architecture & State Management

### Zustand Stores

| Store                 | File                               | Purpose                                                                           |
| --------------------- | ---------------------------------- | --------------------------------------------------------------------------------- |
| `authStore`           | `src/store/authStore.ts`           | User authentication, login/logout, current user                                   |
| `sustainabilityStore` | `src/store/sustainabilityStore.ts` | Entity profile, risks, materiality topics, GHG emissions, scenarios, report draft |
| `materialityStore`    | `src/store/materialityStore.ts`    | Materiality topics, metric inputs, assignments, approval workflow                 |
| `craStore`            | `src/store/craStore.ts`            | CRA data (assets), risk configurations, risk results, assessment history          |
| `scenarioStore`       | `src/store/scenarioStore.ts`       | NGFS scenario parameters, simulation results, financial projections               |
| `esrmStore`           | `src/store/esrmStore.ts`           | ESRM projects, workflow state, scoring results                                    |
| `learningStore`       | `src/store/learningStore.ts`       | Course catalog, enrollment, progress, completions                                 |
| `themeStore`          | `src/store/themeStore.ts`          | Dark/light mode preference                                                        |

### Key Data Models

**EntityProfile** — Central entity configuration:

- `name`, `description`, `hqCountries[]`, `hqStates[]`
- `branchLocations[]` (id, name, state, country) — supports multiple branches per state
- `branches`, `employees`, `loanBook`
- `sasbSector`, `sasbIndustries[]`
- `coreServices[]`, upstream/midstream/downstream activities
- `sectorExposures[]`, `geographicExposure[]`
- `scoringMatrix` (3×3, 4×4, or 5×5 with custom labels)
- `timeHorizons` (short/medium/long with custom year ranges)

**SustainabilityRisk** — Risk register entry:

- `id`, `name`, `category`, `subcategory`
- `impact` (1-5), `likelihood` (1-5)
- `financialEffect`, `timeHorizon`
- `source` (sasb / internal / external / erm / issb / regulator / custom)

**MaterialTopic** — Materiality topic with workflow:

- `id`, `name`, `description`, `dataNeeds[]`
- `assignedUserId`, `assignedBranch`
- `approvalStatus` (Draft → Submitted → Manager Approved → Internal Audit Approved → Board Approved)
- `impact`, `stakeholderInterest` (1-5 scales)

**GHG Scopes**:

- `Scope1Asset` — Mobile/stationary combustion (fuel type, liters, months)
- `Scope2Entry` — Electricity consumption (kWh, source, emission factor)
- `Scope3Entry` — Financed emissions (sector, loan exposure, intensity factor)

### Persistence

All stores use Zustand's `persist` middleware with `localStorage`, ensuring data survives page refreshes during demos.

### Tech Stack

| Technology           | Purpose                                |
| -------------------- | -------------------------------------- |
| React 18+            | UI framework                           |
| TypeScript           | Type safety                            |
| Vite                 | Build tool and dev server              |
| Material UI (MUI) v6 | Component library                      |
| Zustand              | State management                       |
| React Router v6      | Client-side routing                    |
| Recharts             | Charts and visualizations              |
| jsPDF                | PDF report generation                  |
| html2canvas          | Screen capture for reports             |
| xlsx (SheetJS)       | Excel import/export                    |
| Tailwind CSS         | Utility classes (used in ESRM and LMS) |
| Lucide React         | Icon library                           |
| PostCSS              | CSS processing                         |

---

_End of Walkthrough_
