# ESG Navigator — User Journey Walkthrough

**Version:** 1.0 — March 2026
**Platform:** React + TypeScript + Tailwind CSS + Material UI + Zustand + Vite
**Deployment:** Vercel / Render

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Who Uses the Platform — Roles & Access](#2-who-uses-the-platform--roles--access)
3. [Getting Started — Landing Page & Login](#3-getting-started--landing-page--login)
4. [Setting Your Industry Context](#4-setting-your-industry-context)
5. [Choosing a Module](#5-choosing-a-module)
6. [Module 1 — Materiality & Sustainability Reporting](#6-module-1--materiality--sustainability-reporting)
7. [Module 2 — Climate Risk Assessment (CRA)](#7-module-2--climate-risk-assessment-cra)
8. [Module 3 — Scenario Analysis & Stress Testing](#8-module-3--scenario-analysis--stress-testing)
9. [Module 4 — SDG & NDC Alignment](#9-module-4--sdg--ndc-alignment)
10. [Module 5 — ESRM (Environmental & Social Risk Management)](#10-module-5--esrm)
11. [Module 6 — Capacity Building Hub](#11-module-6--capacity-building-hub)
12. [Standalone Materiality Assessment](#12-standalone-materiality-assessment)

---

## 1. Platform Overview

The **ESG Navigator** is an end-to-end ESG management platform built for financial institutions and corporates operating in West Africa — primarily Nigeria and Ghana. It guides organisations through every dimension of their sustainability mandate, from identifying material topics and reporting under IFRS S1/S2, to quantifying climate risk across loan portfolios, stress-testing under NGFS scenarios, and tracking alignment with the UN SDGs and Nigeria's NDC commitments.

The platform supports two industries out of the box — **Financial Services** and **Telecommunications** — and adapts its language, asset types, and risk drivers accordingly. It enforces role-based access so each person in the organisation sees exactly the tools they need, nothing more.

---

## 2. Who Uses the Platform — Roles & Access

Different people in your organisation will have different journeys. The platform recognises 12 roles:

| Role | Who They Are | What They Can Do |
|---|---|---|
| System Administrator | IT / platform owner | Full access to all modules and settings |
| ESG Manager | ESG function lead | All modules |
| Climate Risk Analyst | Risk team | Climate Risk Assessment, Scenario Analysis, Capacity Building |
| Portfolio Manager | Credit / portfolio function | Climate Risk Assessment, Scenario Analysis |
| Executive | Board-level or senior leadership | CRA summary, SDG, Materiality dashboards |
| Data Owner | Topic-level data contributor | Enter and submit materiality data for assigned topics |
| Sustainability Manager | Sustainability function | Full materiality workflow, approvals, reporting |
| Sustainability Champion | Department-level ESG rep | Capacity Building, Materiality |
| Internal Audit | Audit function | Review and approve materiality submissions |
| Board | Governance | Final approval on materiality and disclosures |
| ERM Team | Enterprise risk function | CRA, Scenario Analysis, Capacity Building, ESRM |

When you log in, the platform filters the module hub and navigation to show only what is relevant to your role.

---

## 3. Getting Started — Landing Page & Login

### The Landing Page

The first thing you see is the **ESG Navigator landing page** — a marketing-style hero screen that introduces the platform with a short description of its capabilities and calls to action to log in or learn more. The Deloitte green (#86BC25) branding runs throughout.

### Logging In

Click **Log In** to reach the login screen. Enter your email address and password. For demos, the platform provides a pre-populated dropdown of sample user accounts so you can step into any role immediately without typing credentials manually.

Once authenticated, you are taken directly to the **Industry Selection** screen.

---

## 4. Setting Your Industry Context

Every new session begins with choosing your industry:

- **Financial Services** — Oriented around a bank's loan portfolio, with asset types such as Loans & Advances, Bonds, Equities, Derivatives, and Guarantees. CRA analysis focuses on borrower and collateral climate exposure.
- **Telecommunications** — Oriented around physical infrastructure, with asset types such as Tower Infrastructure, Data Centers, Fiber Networks, Spectrum Licenses, Power Systems, and Vehicle Fleets.

This single choice shapes the entire platform for your session — the language used, the data templates available, the asset type menus in the Climate Risk module, the transition risk driver categories, and the collateral sensitivity mappings.

---

## 5. Choosing a Module

After setting your industry, you land on the **Module Selection Hub** — a card grid listing every module available to you. Each card shows the module name, a short description, and in some cases a completion or readiness indicator. Modules you do not have access to under your role are not displayed.

| Module | Purpose |
|---|---|
| Materiality & Sustainability Reporting | Full IFRS S1/S2 sustainability reporting workflow, from entity set-up through GHG calculations and board-approved disclosure |
| Climate Risk Assessment | Physical and transition risk analysis across your portfolio or infrastructure, with geocoded hazard scoring |
| Scenario Analysis | NGFS-based stress testing to quantify financial impact under Orderly, Disorderly, and Hot House climate scenarios |
| SDG & NDC Alignment | Map your activities to the 17 UN SDGs and track progress against Nigeria's Nationally Determined Contributions |
| ESRM | Environmental & Social Risk Management project screening and action planning for new deals or projects |
| Capacity Building Hub | Integrated e-learning library for building ESG competency across your team |

Click a card to enter that module.

---

## 6. Module 1 — Materiality & Sustainability Reporting

This module guides you through producing a full sustainability disclosure aligned with IFRS S1/S2 and SASB standards. It is designed as a collaborative workflow — different people in your organisation contribute different parts of the process.

The module has a **collapsible sidebar** with grouped navigation: Overview, then Data & Inputs (Entity Profile, Risk Register, Data Collection, GHG Calculator), then Reports.

---

### Step A — Entity Profile (5-Step Wizard)

Before anything else, an ESG Manager or Admin sets up your organisation's profile. This is a five-step wizard.

**Step 1 — Corporate Identity**
Give the entity a name and description, select the countries where you operate (Nigeria, Ghana, or both), and choose the specific states or regions. You can select all states in a country at once or pick individually. Once states are selected, you add your **branch locations** — named offices within each state (for example, "Victoria Island Branch" and "Ikeja Branch" under Lagos). These branches matter later when assigning data owners to specific locations.

**Step 2 — Industry & Materiality**
Select your SASB sector (one of 11: Consumer Goods, Extractives, Financials, Food & Beverage, Health Care, Infrastructure, Renewable Resources, Resource Transformation, Services, Technology & Communications, Transportation) and then choose your specific industries within that sector. The platform auto-detects the SASB materiality topics that apply to your selection.

**Step 3 — Operational Scale**
Enter your number of employees, number of branches, and loan book size. Configure the **scoring matrix** your organisation will use for materiality scoring — choose between a 3×3, 4×4, or 5×5 grid and customise the level labels. Finally, define your time horizons: what counts as Short, Medium, and Long term (in years).

**Step 4 — Value Chain**
Describe your organisation's value chain by entering core services, upstream activities, midstream activities, downstream activities, sector exposures (with percentage allocations), and geographic footprint.

**Step 5 — Review & Submit**
A summary of all your inputs is displayed for review. On submission, the platform generates your starting risk register — populated with SASB-derived risks plus sample internal, external, ERM, ISSB, and regulator risks — and takes you directly to the Risk Register.

---

### Step B — Risk Register & Materiality Scoring

**Risk Register**
The risk register shows all of your organisation's identified sustainability risks in a table. You can filter by source (SASB, Internal, External, ERM, ISSB, Regulator) and add custom risks via a form. Each risk carries a name, category, subcategory, impact score (1–5), likelihood score (1–5), financial effect description, and time horizon.

**Materiality Scoring**
The scoring screen presents an interactive **materiality matrix** showing your risks plotted by impact and likelihood. You select which topics to carry forward as your organisation's material topics — choosing by a top-N count, by severity level, or by manually cherry-picking.

Once topics are selected, the approval workflow activates: the Sustainability Manager submits the selection, the ESG Manager approves, Internal Audit reviews and approves, and the Board gives final sign-off. Status tracking shows exactly where each submission sits in this chain.

---

### Step C — Data Collection

This is where your **Data Owners** contribute their part of the picture.

**What a Data Owner sees:** When a Data Owner logs in and opens the Data Collection screen, they see only the materiality topics that have been assigned to them. Each topic expands to reveal the SASB metrics that need to be filled in — quantitative fields (with units shown inline) and a qualitative discussion field for narrative analysis. Once all metrics for a topic are complete, the Data Owner hits Submit to mark it done.

**What the Sustainability Manager sees:** A full table of all material topics, each showing the assigned Data Owner, the assigned branch, and the current status. The Sustainability Manager can bulk-assign multiple topics to a Data Owner and branch in a single action, or update assignments individually per row. As Data Owners submit their topics, the Manager reviews each submission and approves or rejects it, with comments. Once all topics are approved, the Manager can proceed to the Reporting step.

**What Approvers (Internal Audit, Board) see:** A review view of all topics with their current approval status. They can approve or reject with comments, progressing the workflow towards final sign-off.

---

### Step D — GHG Calculator

A four-step emissions calculator covering all three scopes.

**Scope 1 — Direct Emissions:** Add your combustion assets (vehicles, generators). For each entry you specify the asset name, its branch, whether it is mobile or stationary, the fuel type (diesel, petrol, LPG, or CNG), how many litres per month, and over how many months. The platform converts this to tonnes of CO₂ equivalent automatically using standard emission factors.

**Scope 2 — Purchased Energy:** Add your electricity consumption entries per branch, specifying kWh per month, the number of months, whether the source is grid or private generation, and the applicable emission factor. Scope 2 tCO₂e is shown per entry and in total.

**Scope 3 — Financed Emissions:** Add sector-level financed emission entries — the sector name, your loan exposure in that sector, and the intensity factor. The platform calculates attributed Scope 3 emissions.

**Summary:** All three scopes are consolidated into a total emissions figure with a breakdown chart. From here you move to the Report.

---

### Step E — IFRS Disclosure (AI-Generated Report)

The reporting screen has two tabs.

**Report Setup:** Choose which pillars and sub-sections to include in your disclosure using accordions. Select the reporting year.

**Generate Report:** The platform draws together everything — your entity profile, material topics, GHG data, and scenario results — and produces a full IFRS S1/S2 aligned sustainability report narrative attributed to the generating user with a timestamp. Only Sustainability Manager and Admin roles can trigger generation.

Once generated, the report appears as editable rich text. You can modify sections directly, attach images (they appear on separate pages in the PDF), regenerate specific sections, or export. The **Download PDF** button produces a properly formatted document with headings, body text, and automatic page breaks. The file is named after your entity and reporting year.

---

## 7. Module 2 — Climate Risk Assessment (CRA)

The CRA module is the analytical centrepiece of the platform. It moves from raw data upload through to a final climate risk rating for every asset in your portfolio or infrastructure base. The module has a top navigation bar with sequential steps.

---

### 7.1 CRA Dashboard

When you enter the CRA module, you land on a dashboard showing portfolio-level KPIs: total asset exposure, NPL ratio, weighted risk score, and Climate Value at Risk. Module completion cards link to each section and show progress status — some sections lock until prerequisite steps are complete (data must be uploaded before segmentation can run, for example).

---

### 7.2 Uploading Your Data

The data upload screen lists every asset type relevant to your selected industry. For Financial Services these are Loans & Advances, Bonds, Equities, Derivatives, and Guarantees. For Telecommunications these are Tower Infrastructure, Data Centers, Fiber Networks, Spectrum Licenses, Power Systems, Real Estate & Facilities, Active Equipment, Mobile Money Infrastructure, Vehicle Fleet, and Supplier Operations.

For each asset type you can download a pre-formatted CSV template, populate it with your data, and upload it back. The platform validates the file and shows a preview of the ingested rows including row counts and any validation errors. You can upload data for multiple asset types — each tracks independently.

Once uploaded, you can click into any asset type to open a full searchable, filterable, paginated table of that dataset with export functionality.

---

### 7.3 Portfolio Segmentation

The segmentation screen slices your combined portfolio data across multiple dimensions — sector, region, risk level, and others. Interactive charts (pie and bar) show how exposure is distributed. A filterable table lets you drill into any segment. You can also visualise the portfolio's geographic footprint and export the segmentation result to Excel.

---

### 7.4 Physical Risk Assessment

When you click into Physical Risk, you arrive at a **Mode Selector** — an animated landing screen with two paths:

- **Single Asset Assessment** — precision assessment of a single asset using real-time climate API data
- **Portfolio Assessment** — bulk upload and batch scoring across your entire asset base

Choosing a mode starts a dedicated multi-step flow.

---

#### Single Asset Assessment — 7 Steps

**Step 1 — Asset Details**

Fill in the asset you want to assess. The form is laid out in a two-column grid: Asset Description and Asset Type side by side at the top, then the full address below, then replacement value with a currency toggle (₦ NGN or $ USD), and finally sector and subsector. There are 47 asset types organised into 7 groups: Buildings, Critical Infrastructure, Oil & Gas, Transport, Land & Agriculture, Mining & Processing, and Other.

As you type the address, live suggestions appear from the platform's geocoding service, and a green checkmark confirms when a valid address is matched.

**Step 2 — Location Confirm**

The platform shows your asset on an embedded map, pinned at the geocoded coordinates. You see the geocoding confidence level — **Exact Address**, **Street Level**, or **City Level** — colour-coded green, amber, and red respectively. The screen also shows the asset's elevation in metres above sea level and whether it has coastal proximity. If the pin position doesn't look right, you can edit the address and re-geocode without leaving this step.

**Step 3 — Hazard Selection**

Choose which of 21 UNDRR climate hazards to assess the asset against, organised into four categories:

- **Meteorological** (amber) — Extreme Heat, Tropical Cyclone, Hailstorm, and others
- **Hydrological** (blue) — Riverine Flooding, Flash Flood, Storm Surge, and others
- **Climatological** (green) — Drought, Extreme Cold, Wildfire, and others
- **Geophysical** (purple) — Earthquake, Landslide, Tsunamis, and others

The platform auto-recommends hazards based on the asset's location, marking them with a lightning bolt badge. Some hazards are automatically disabled if they don't apply geographically — for example, Sea Level Rise is disabled for assets above 300 m elevation, and Tsunamis are disabled for inland assets. Quick-select buttons let you choose all hazards or recommended ones only.

**Step 4 — Resilience**

Tell the platform how resilient this asset is. There are two approaches:

- **SBRA (Standard Building Resilience Assessment)** — the platform looks up a resilience factor automatically from a built-in table based on your asset type and sector. Quick and straightforward.
- **ALRA (Asset-Level Resilience Assessment)** — you manually confirm which physical resilience measures are in place across up to 12 categories: Flood, Electrical, Wind, Heat, Water, Fire, Seismic, Geotechnical, Coastal, Air Quality, Operational, and Financial. The platform combines these into a composite resilience factor (capped at 0.85) and shows you the live Expected Annual Loss impact as you confirm each measure.

You can also skip this step to use SBRA defaults.

**Step 5 — Run Assessment**

The platform runs a live **11-stage data pipeline**, fetching climate and hazard data from multiple real-world sources:

1. Nominatim Geocoding
2. OpenTopoData Elevation / SRTM
3. NASA POWER Climate Data
4. Open-Meteo Historical Weather
5. USGS Earthquake Catalogue
6. NOAA NGDC Volcano / Tsunami Data
7. WRI Aqueduct Water Risk
8. Exposure Factor Lookup
9. Vulnerability Matrix
10. Risk Estimation (SSL / EAL calculation)
11. Response & Monitoring Assignment

Each stage shows a live status dot (queued, fetching, complete, or fallback). If any external source is unavailable, the platform falls back to its local estimation engine. An elapsed timer runs throughout.

**Step 6 — Results**

Results are presented in three tabs:

- **Hazards tab:** Every hazard you selected appears as a row showing its rating, intensity, frequency, Stressed Scenario Loss (SSL), Expected Annual Loss (EAL), resilience factor, and net vulnerability. You can expand any row to see the full calculation breakdown. An asset map with a pin sits alongside the table.
- **Resilience tab:** Breakdown of how your resilience measures reduce EAL, shown comparatively.
- **Pipeline tab:** The full log of every data source called in Step 5.

A summary header shows your asset's worst hazard rating, counts of Extreme and Very High hazards, total EAL, and total SSL. Rating levels are: **Negligible, Low, Medium, High, Very High, Extreme**.

**Step 7 — Export**

Download two CSV files — a Hazard Report (asset, hazard, rating, SSL, EAL, recommended response strategy, priority, timeframe) and a full Calculation Sheet. You can also print the results to PDF via the browser. A green banner at the bottom of this step prompts you onwards to Transition Risk Assessment.

---

#### Portfolio Assessment — 6 Steps

**Step 1 — Asset Register**

Upload a CSV of your asset portfolio by drag-and-drop. Required columns are: asset name, address or region, value, asset type, and sector. Multiple currencies are supported (NGN, USD, GHS, KES, ZAR, GBP, EUR). Once uploaded, the platform automatically geocodes every asset — you see a progress bar advancing per asset — and displays all assets on a map with pins.

**Step 2 — Hazard Screening**

An asset × hazard grid appears (rows = assets, columns = 21 hazards). Each cell is a toggle. Click **Auto-Screen** to have the platform recommend hazards for every asset based on its geocoded location, or toggle cells manually. You can also upload a pre-filled screening matrix CSV.

**Step 3 — Resilience Measures**

Each asset has an expandable panel for configuring SBRA or ALRA mode. A portfolio-level summary shows the estimated aggregate EAL reduction from all resilience configurations.

**Step 4 — Run Assessment**

The platform runs a 9-stage pipeline across every asset-hazard combination in batch. A progress bar, elapsed timer, and per-stage status indicator keep you informed. A "Local only" toggle is available to skip external API calls for a fast run.

**Step 5 — Results Dashboard**

A filterable results table shows every asset's scores. Portfolio totals for EAL and SSL are displayed alongside a rating distribution chart and a map showing all pinned assets.

**Step 6 — Export**

Download the full portfolio assessment as a CSV, including a monitoring plan and response strategy summary for each asset-hazard combination. A green banner prompts you onwards to Transition Risk Assessment.

---

### 7.5 Transition Risk Assessment

A stepper-based workflow for assessing how the transition to a low-carbon economy affects your portfolio. Transition risks are grouped into four driver categories: **Policy & Legal, Technology, Market, and Reputation**. The driver options adapt to your chosen industry. Each asset is scored against the relevant drivers, results are visualised in a matrix, and findings can be exported.

---

### 7.6 Collateral Sensitivity

This section maps the physical hazards identified in your assessment to the collateral types held against your loans or assets. Industry-specific collateral mappings compute a sensitivity score and estimated impact on collateral values under different hazard scenarios.

---

### 7.7 Risk Rating Engine

The Risk Rating Engine combines physical and transition risk scores into a single **composite climate risk rating** for every asset across a five-level scale: Very Low, Low, Medium, High, Very High. A dashboard shows the distribution across your portfolio via pie and bar charts, a paginated asset-level rating table, and summary exposure statistics broken down by rating band.

---

### 7.8 CRA Reporting

A stepper-based screen for generating a full narrative Climate Risk Assessment report combining findings from data upload through to risk ratings. Select which sections to include, generate the report, and export as PDF or print.

---

## 8. Module 3 — Scenario Analysis & Stress Testing

This module stress-tests your portfolio against forward-looking climate scenarios derived from the **NGFS (Network for Greening the Financial System)** framework. The module has a sidebar with five sections: Overview, Run Simulation, Quantitative Analysis, Scenario Library, and Stress Test Reports.

---

### 8.1 Overview Dashboard

Your landing screen shows a summary of all completed stress tests — KPIs, chart snapshots, and quick-start buttons to configure a new simulation.

---

### 8.2 Running a Simulation

Click **Run Simulation** to configure a new stress test.

**Choose a scenario:**
- **Orderly — Net Zero 2050:** Smooth, policy-driven transition. Carbon prices rise steadily. Physical damage stays low.
- **Disorderly:** Late and abrupt policy action. Carbon prices spike sharply. Higher physical disruption.
- **Hot House World:** No effective climate policy. Physical damage is high. Transition risk is low.
- **Custom:** Define your own parameter set.

**Configure parameters:** For each scenario you set carbon price trajectories across three time horizons (short, medium, long), physical damage percentages, and macro shock assumptions — GDP impact, inflation rate change, interest rate change, and temperature rise target.

**Sector sensitivities:** The platform applies sector-specific coefficients to translate the macro shocks into asset-level financial impacts across sectors including Oil & Gas, Coal Mining, Electricity Generation, Air Transport, and others.

Hit **Run** to compute results.

---

### 8.3 Quantitative Analysis

The Quantitative Analysis screen presents the financial modelling outputs — NPV calculations under different WACC assumptions, free cash flow projections by scenario across the defined time horizons, and (for telecom clients) infrastructure category-level analysis. Audited financials can be integrated as the baseline.

---

### 8.4 Scenario Library

Browse all saved scenarios. Clone a scenario to use as a template for a new run, edit one, delete it, or compare two or more scenarios side by side.

---

### 8.5 Stress Test Reports

Generate a comprehensive written report documenting the stress test methodology, scenario parameters, quantitative results, and recommendations. Export as PDF or print.

---

## 9. Module 4 — SDG & NDC Alignment

This module tracks how your organisation's activities align with the **17 UN Sustainable Development Goals** and Nigeria's **Nationally Determined Contributions (NDCs)** under the Paris Agreement. It has a sidebar with: Dashboard, SDG Alignment, NDC Tracker, and Reports & Disclosure.

---

### 9.1 Dashboard

Six KPI cards give an at-a-glance picture:

- SDG Alignment Score (e.g. 78.4%, up 5.2%)
- NDC Progress (e.g. 62.8%, up 8.1%)
- Green Finance Ratio (e.g. ₦2.4B, up 18.3%)
- ESG Score (e.g. B+, Upgraded)
- Carbon Offset (e.g. 12,450 tCO₂e, up 34%)
- Clean Energy Loans (e.g. ₦892M, up 22.6%)

All 17 SDG goals are displayed as a grid using official UN colours, each showing its alignment score and whether it is currently aligned or not. A summary line shows how many of the 17 goals are aligned and the average score across all.

An NDC Commitments table lists the key sectors covered by Nigeria's NDC (Energy, Agriculture/REDD+, Transport, Waste Management, Industry) with progress percentages and on-track/moderate/behind status badges. ESG pillar scores (Environmental, Social, Governance) and a quarterly Sustainable Finance chart complete the dashboard.

---

### 9.2 SDG Alignment Detail

Drill into the six priority SDGs your organisation has mapped. For each goal you see the specific UN target codes addressed (e.g. 7.1, 13.2), the concrete actions linked to each target, and a progress percentage per action. A radar chart shows scores across all 17 goals at once.

---

### 9.3 NDC Tracker

A sector-by-sector tracker of your contribution towards Nigeria's emission reduction targets. Each sector shows the target description, a progress bar, and a status badge (On Track / Moderate / Behind).

---

### 9.4 Reports & Disclosure

Generate an SDG alignment and NDC compliance report for regulatory filing or voluntary disclosure, with export options.

---

## 10. Module 5 — ESRM (Environmental & Social Risk Management)

The ESRM module manages the environmental and social due diligence process for new projects or lending relationships. It has a sidebar with: Dashboard, New Project, Pending Tasks, Completed Projects, Methodology, and Admin.

---

### The ESRM Project Workflow

Every project moves through a **six-step workflow:**

**Step 1 — Environmental & Social Screening (ESS)**
An initial review of the project's sector and activities to flag potential environmental and social risks. The platform maps the project against a built-in risk library.

**Step 2 — Categorisation**
Based on the screening, the project is assigned a risk category: **Category A** (high risk), **Category B** (moderate risk), or **Category C** (low risk). This determines the depth of due diligence required.

**Step 3 — Environmental & Social Due Diligence (ESDD)**
A detailed investigation of the identified risks, capturing substantive findings, documentation, and evidence for each flag raised in screening.

**Step 4 — Environmental & Social Action Plan (ESAP)**
Mitigation measures are defined for each significant risk, each assigned an owner and a deadline. This becomes the binding commitment the borrower or project team must fulfil.

**Step 5 — Appraisal**
A final risk assessment weighing residual risk against the ESAP commitments. The outcome is a decision recommendation — approve, approve with conditions, or decline.

**Step 6 — Monitoring**
Ongoing tracking of ESAP completion and compliance, recorded here over the life of the project.

---

### Managing Projects

The **ESRM Dashboard** shows a table of all projects with their current status, progress percentage, and active workflow step. KPI cards at the top summarise total, active, completed, and pending projects.

Create a new project via the **New Project** form, or import a batch via the **Import Data** modal. Projects can be saved as drafts at any point and resumed later. The **Methodology** section provides reference documentation on the ESRM framework and categorisation criteria. The **Admin** section (restricted by role) handles user access and system configuration.

---

## 11. Module 6 — Capacity Building Hub

An integrated Learning Management System (LMS) for building ESG knowledge across your team. It has a sidebar with: Dashboard, Training Library, My Learning, and Certifications.

---

### 11.1 LMS Dashboard

Your learning home screen. Shows how many courses you are enrolled in, how many you have completed, and your recent activity.

---

### 11.2 Training Library

Browse the full catalogue of ESG courses. Search by keyword or filter by category. Courses appear as cards in a paginated grid (8 per page) showing the title, description, category, duration, and completion rate. Some courses carry a **Bestseller** badge. Click any card to go to the course player.

---

### 11.3 My Learning

Shows all the courses you are currently enrolled in with progress percentages. A **Continue** button on each card takes you straight back to where you left off.

---

### 11.4 Course Player

The full course experience — content viewer with module and lesson navigation, auto-saved progress tracking, and a completion trigger that awards a certificate on finishing.

---

### 11.5 Certifications

A record of all certifications you have earned. Each certificate shows the course, completion date, and can be downloaded.

---

## 12. Standalone Materiality Assessment

Accessible independently of the full Sustainability module, this standalone workflow lets organisations run a focused materiality assessment on its own.

---

### 12.1 Topic Profiling

Choose which materiality topics apply to your organisation. Topics are drawn from SASB-aligned categories grouped by ESG theme in expandable accordions. Toggle individual topics on or off, or add a completely custom topic via a modal dialog. Each selected topic gets an impact score and a stakeholder interest score on a 1–5 scale. A progress indicator shows how many topics you have selected out of the total available.

---

### 12.2 Data Input

A tabbed interface for entering data against each selected topic. Data Owners fill in per-topic metric tables — quantitative entries with units shown inline and qualitative discussion fields for narrative. Role-based access means only assigned Data Owners can edit; everyone else sees a read-only view. Completed submissions enter the approval workflow. Export to Excel is available throughout.

---

### 12.3 Analytics Dashboard

Once data is collected, the Analytics Dashboard visualises the results — charts, summary statistics, and topic coverage analysis showing how comprehensively the assessment has been completed.

---

_End of User Journey Walkthrough_
