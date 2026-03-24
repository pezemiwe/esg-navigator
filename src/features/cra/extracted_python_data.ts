// ══════════════════════════════════════════════════════════════════
// EXTRACTED FROM ClimateRiskAssessment.ipynb v3.0
// Lines 1800–5781 — Complete data structures for TypeScript port
// ══════════════════════════════════════════════════════════════════

// ──────────────────────────────────────────────────────────────────
// 1. SBRA_BASE_RRF — Remaining sectors (Manufacturing was the last
//    sector before line 1800; lines 1800+ continue with more sectors)
//
//    The SBRA_BASE_RRF dictionary maps 25 sectors → 47 asset types → base RRF value.
//    Sectors in the notebook (in order):
//      Telecoms & ICT, Banking & Financial Services, Oil & Gas,
//      Power & Energy, Manufacturing,
//      Agriculture & Agribusiness, Retail & Commercial, Healthcare,
//      Education, Government & Public Sector,
//      Real Estate & Construction, Transport & Logistics,
//      Mining & Solid Minerals, Media & Entertainment,
//      Hospitality & Tourism, Water & Sanitation,
//      Food & Beverage, Chemical & Petrochemical,
//      Defence & Security, NGO & Development,
//      Religious & Community, Waste Management,
//      Ports & Maritime, Aviation, Digital & Creative Economy
// ──────────────────────────────────────────────────────────────────

export const SBRA_BASE_RRF: Record<string, Record<string, number>> = {
  // ── TELECOMS AND ICT ──
  "Telecoms & ICT": {
    "Office Building": 0.4,
    "Industrial Building": 0.3,
    "Warehouse / Storage": 0.28,
    "Retail Outlet / Branch": 0.3,
    "Healthcare Facility": 0.35,
    "Educational Facility": 0.28,
    "Hospitality Building": 0.28,
    "Religious / Assembly Hall": 0.22,
    "Military / Security Post": 0.35,
    "Data Centre": 0.6,
    "Telecoms Mast / Tower": 0.4,
    "Power Generation Plant": 0.45,
    "Electrical Substation": 0.42,
    "Transmission Line / Pylon": 0.35,
    "Water Treatment Plant": 0.35,
    "Water Distribution Network": 0.3,
    "Onshore Refinery / Process Plant": 0.35,
    "LNG / LPG Terminal": 0.38,
    "Offshore Platform": 0.4,
    "Floating Production Vessel (FPSO)": 0.38,
    "Storage Tank / Tank Farm": 0.32,
    "Petrol Station / Depot": 0.28,
    "Pipeline — Onshore": 0.3,
    "Pipeline — Offshore / Subsea": 0.32,
    "Underground Cable / Duct": 0.45,
    "Road / Bridge / Culvert": 0.25,
    "Rail Track / Rail Infrastructure": 0.25,
    "Port / Jetty / Quay": 0.3,
    "Airport Terminal / Runway": 0.35,
    "Vessel / Barge / Tug": 0.3,
    "Vehicle Fleet / Rolling Stock": 0.28,
    "Outdoor Plant & Equipment": 0.32,
    "Semi-outdoor Kiosk / Booth": 0.28,
    "Open Yard / Storage Compound": 0.22,
    "Solar Farm / Wind Farm": 0.35,
    "Cropland / Farmland": 0.15,
    "Irrigation System": 0.2,
    "Aquaculture Facility": 0.18,
    "Plantation / Forest": 0.15,
    "Mine / Quarry Site": 0.22,
    "Mineral Processing Plant": 0.28,
    "Tailings Dam / Waste Facility": 0.2,
    "Construction Site / Temporary Camp": 0.18,
    "Modular / Prefabricated Unit": 0.22,
    "Server Room / Network Hub": 0.55,
    "ATM / POS Terminal Network": 0.35,
    "Broadcasting / Transmission Equipment": 0.4,
  },

  // ── BANKING AND FINANCIAL SERVICES ──
  "Banking & Financial Services": {
    "Office Building": 0.45,
    "Industrial Building": 0.28,
    "Warehouse / Storage": 0.25,
    "Retail Outlet / Branch": 0.38,
    "Healthcare Facility": 0.35,
    "Educational Facility": 0.28,
    "Hospitality Building": 0.28,
    "Religious / Assembly Hall": 0.2,
    "Military / Security Post": 0.32,
    "Data Centre": 0.58,
    "Telecoms Mast / Tower": 0.35,
    "Power Generation Plant": 0.4,
    "Electrical Substation": 0.4,
    "Transmission Line / Pylon": 0.3,
    "Water Treatment Plant": 0.3,
    "Water Distribution Network": 0.28,
    "Onshore Refinery / Process Plant": 0.3,
    "LNG / LPG Terminal": 0.3,
    "Offshore Platform": 0.35,
    "Floating Production Vessel (FPSO)": 0.32,
    "Storage Tank / Tank Farm": 0.28,
    "Petrol Station / Depot": 0.32,
    "Pipeline — Onshore": 0.25,
    "Pipeline — Offshore / Subsea": 0.28,
    "Underground Cable / Duct": 0.4,
    "Road / Bridge / Culvert": 0.22,
    "Rail Track / Rail Infrastructure": 0.22,
    "Port / Jetty / Quay": 0.28,
    "Airport Terminal / Runway": 0.32,
    "Vessel / Barge / Tug": 0.28,
    "Vehicle Fleet / Rolling Stock": 0.25,
    "Outdoor Plant & Equipment": 0.28,
    "Semi-outdoor Kiosk / Booth": 0.32,
    "Open Yard / Storage Compound": 0.2,
    "Solar Farm / Wind Farm": 0.3,
    "Cropland / Farmland": 0.12,
    "Irrigation System": 0.15,
    "Aquaculture Facility": 0.15,
    "Plantation / Forest": 0.12,
    "Mine / Quarry Site": 0.18,
    "Mineral Processing Plant": 0.22,
    "Tailings Dam / Waste Facility": 0.18,
    "Construction Site / Temporary Camp": 0.15,
    "Modular / Prefabricated Unit": 0.2,
    "Server Room / Network Hub": 0.52,
    "ATM / POS Terminal Network": 0.38,
    "Broadcasting / Transmission Equipment": 0.35,
  },

  // ── OIL AND GAS ──
  "Oil & Gas": {
    "Office Building": 0.45,
    "Industrial Building": 0.48,
    "Warehouse / Storage": 0.4,
    "Retail Outlet / Branch": 0.35,
    "Healthcare Facility": 0.38,
    "Educational Facility": 0.3,
    "Hospitality Building": 0.3,
    "Religious / Assembly Hall": 0.22,
    "Military / Security Post": 0.4,
    "Data Centre": 0.55,
    "Telecoms Mast / Tower": 0.42,
    "Power Generation Plant": 0.52,
    "Electrical Substation": 0.5,
    "Transmission Line / Pylon": 0.42,
    "Water Treatment Plant": 0.42,
    "Water Distribution Network": 0.35,
    "Onshore Refinery / Process Plant": 0.58,
    "LNG / LPG Terminal": 0.62,
    "Offshore Platform": 0.58,
    "Floating Production Vessel (FPSO)": 0.55,
    "Storage Tank / Tank Farm": 0.52,
    "Petrol Station / Depot": 0.42,
    "Pipeline — Onshore": 0.5,
    "Pipeline — Offshore / Subsea": 0.52,
    "Underground Cable / Duct": 0.4,
    "Road / Bridge / Culvert": 0.3,
    "Rail Track / Rail Infrastructure": 0.28,
    "Port / Jetty / Quay": 0.48,
    "Airport Terminal / Runway": 0.4,
    "Vessel / Barge / Tug": 0.48,
    "Vehicle Fleet / Rolling Stock": 0.38,
    "Outdoor Plant & Equipment": 0.48,
    "Semi-outdoor Kiosk / Booth": 0.35,
    "Open Yard / Storage Compound": 0.35,
    "Solar Farm / Wind Farm": 0.4,
    "Cropland / Farmland": 0.15,
    "Irrigation System": 0.2,
    "Aquaculture Facility": 0.18,
    "Plantation / Forest": 0.15,
    "Mine / Quarry Site": 0.35,
    "Mineral Processing Plant": 0.45,
    "Tailings Dam / Waste Facility": 0.3,
    "Construction Site / Temporary Camp": 0.25,
    "Modular / Prefabricated Unit": 0.3,
    "Server Room / Network Hub": 0.52,
    "ATM / POS Terminal Network": 0.3,
    "Broadcasting / Transmission Equipment": 0.35,
  },

  // ── POWER AND ENERGY ──
  "Power & Energy": {
    "Office Building": 0.4,
    "Industrial Building": 0.45,
    "Warehouse / Storage": 0.35,
    "Retail Outlet / Branch": 0.3,
    "Healthcare Facility": 0.35,
    "Educational Facility": 0.28,
    "Hospitality Building": 0.28,
    "Religious / Assembly Hall": 0.2,
    "Military / Security Post": 0.38,
    "Data Centre": 0.52,
    "Telecoms Mast / Tower": 0.38,
    "Power Generation Plant": 0.55,
    "Electrical Substation": 0.52,
    "Transmission Line / Pylon": 0.45,
    "Water Treatment Plant": 0.42,
    "Water Distribution Network": 0.35,
    "Onshore Refinery / Process Plant": 0.48,
    "LNG / LPG Terminal": 0.5,
    "Offshore Platform": 0.5,
    "Floating Production Vessel (FPSO)": 0.48,
    "Storage Tank / Tank Farm": 0.45,
    "Petrol Station / Depot": 0.35,
    "Pipeline — Onshore": 0.42,
    "Pipeline — Offshore / Subsea": 0.45,
    "Underground Cable / Duct": 0.42,
    "Road / Bridge / Culvert": 0.28,
    "Rail Track / Rail Infrastructure": 0.25,
    "Port / Jetty / Quay": 0.38,
    "Airport Terminal / Runway": 0.35,
    "Vessel / Barge / Tug": 0.38,
    "Vehicle Fleet / Rolling Stock": 0.32,
    "Outdoor Plant & Equipment": 0.42,
    "Semi-outdoor Kiosk / Booth": 0.3,
    "Open Yard / Storage Compound": 0.28,
    "Solar Farm / Wind Farm": 0.45,
    "Cropland / Farmland": 0.12,
    "Irrigation System": 0.18,
    "Aquaculture Facility": 0.15,
    "Plantation / Forest": 0.12,
    "Mine / Quarry Site": 0.28,
    "Mineral Processing Plant": 0.38,
    "Tailings Dam / Waste Facility": 0.25,
    "Construction Site / Temporary Camp": 0.22,
    "Modular / Prefabricated Unit": 0.28,
    "Server Room / Network Hub": 0.5,
    "ATM / POS Terminal Network": 0.28,
    "Broadcasting / Transmission Equipment": 0.32,
  },

  // ── MANUFACTURING ──
  Manufacturing: {
    "Office Building": 0.38,
    "Industrial Building": 0.42,
    "Warehouse / Storage": 0.38,
    "Retail Outlet / Branch": 0.3,
    "Healthcare Facility": 0.32,
    "Educational Facility": 0.25,
    "Hospitality Building": 0.25,
    "Religious / Assembly Hall": 0.18,
    "Military / Security Post": 0.32,
    "Data Centre": 0.45,
    "Telecoms Mast / Tower": 0.32,
    "Power Generation Plant": 0.42,
    "Electrical Substation": 0.4,
    "Transmission Line / Pylon": 0.32,
    "Water Treatment Plant": 0.35,
    "Water Distribution Network": 0.28,
    "Onshore Refinery / Process Plant": 0.42,
    "LNG / LPG Terminal": 0.4,
    "Offshore Platform": 0.38,
    "Floating Production Vessel (FPSO)": 0.35,
    "Storage Tank / Tank Farm": 0.38,
    "Petrol Station / Depot": 0.3,
    "Pipeline — Onshore": 0.32,
    "Pipeline — Offshore / Subsea": 0.35,
    "Underground Cable / Duct": 0.32,
    "Road / Bridge / Culvert": 0.22,
    "Rail Track / Rail Infrastructure": 0.2,
    "Port / Jetty / Quay": 0.32,
    "Airport Terminal / Runway": 0.3,
    "Vessel / Barge / Tug": 0.3,
    "Vehicle Fleet / Rolling Stock": 0.28,
    "Outdoor Plant & Equipment": 0.35,
    "Semi-outdoor Kiosk / Booth": 0.25,
    "Open Yard / Storage Compound": 0.22,
    "Solar Farm / Wind Farm": 0.32,
    "Cropland / Farmland": 0.12,
    "Irrigation System": 0.15,
    "Aquaculture Facility": 0.12,
    "Plantation / Forest": 0.12,
    "Mine / Quarry Site": 0.22,
    "Mineral Processing Plant": 0.32,
    "Tailings Dam / Waste Facility": 0.2,
    "Construction Site / Temporary Camp": 0.18,
    "Modular / Prefabricated Unit": 0.22,
    "Server Room / Network Hub": 0.42,
    "ATM / POS Terminal Network": 0.25,
    "Broadcasting / Transmission Equipment": 0.28,
  },

  // ── AGRICULTURE AND AGRIBUSINESS ──
  "Agriculture & Agribusiness": {
    "Office Building": 0.3,
    "Industrial Building": 0.32,
    "Warehouse / Storage": 0.28,
    "Retail Outlet / Branch": 0.22,
    "Healthcare Facility": 0.25,
    "Educational Facility": 0.2,
    "Hospitality Building": 0.2,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.22,
    "Data Centre": 0.35,
    "Telecoms Mast / Tower": 0.22,
    "Power Generation Plant": 0.3,
    "Electrical Substation": 0.28,
    "Transmission Line / Pylon": 0.22,
    "Water Treatment Plant": 0.32,
    "Water Distribution Network": 0.28,
    "Onshore Refinery / Process Plant": 0.28,
    "LNG / LPG Terminal": 0.28,
    "Offshore Platform": 0.25,
    "Floating Production Vessel (FPSO)": 0.22,
    "Storage Tank / Tank Farm": 0.28,
    "Petrol Station / Depot": 0.22,
    "Pipeline — Onshore": 0.22,
    "Pipeline — Offshore / Subsea": 0.22,
    "Underground Cable / Duct": 0.22,
    "Road / Bridge / Culvert": 0.18,
    "Rail Track / Rail Infrastructure": 0.15,
    "Port / Jetty / Quay": 0.22,
    "Airport Terminal / Runway": 0.22,
    "Vessel / Barge / Tug": 0.22,
    "Vehicle Fleet / Rolling Stock": 0.2,
    "Outdoor Plant & Equipment": 0.22,
    "Semi-outdoor Kiosk / Booth": 0.18,
    "Open Yard / Storage Compound": 0.15,
    "Solar Farm / Wind Farm": 0.25,
    "Cropland / Farmland": 0.25,
    "Irrigation System": 0.28,
    "Aquaculture Facility": 0.25,
    "Plantation / Forest": 0.22,
    "Mine / Quarry Site": 0.15,
    "Mineral Processing Plant": 0.22,
    "Tailings Dam / Waste Facility": 0.15,
    "Construction Site / Temporary Camp": 0.12,
    "Modular / Prefabricated Unit": 0.15,
    "Server Room / Network Hub": 0.32,
    "ATM / POS Terminal Network": 0.18,
    "Broadcasting / Transmission Equipment": 0.2,
  },

  // ── RETAIL AND COMMERCIAL ──
  "Retail & Commercial": {
    "Office Building": 0.32,
    "Industrial Building": 0.28,
    "Warehouse / Storage": 0.3,
    "Retail Outlet / Branch": 0.35,
    "Healthcare Facility": 0.28,
    "Educational Facility": 0.22,
    "Hospitality Building": 0.25,
    "Religious / Assembly Hall": 0.18,
    "Military / Security Post": 0.22,
    "Data Centre": 0.38,
    "Telecoms Mast / Tower": 0.22,
    "Power Generation Plant": 0.28,
    "Electrical Substation": 0.28,
    "Transmission Line / Pylon": 0.2,
    "Water Treatment Plant": 0.25,
    "Water Distribution Network": 0.22,
    "Onshore Refinery / Process Plant": 0.25,
    "LNG / LPG Terminal": 0.25,
    "Offshore Platform": 0.22,
    "Floating Production Vessel (FPSO)": 0.2,
    "Storage Tank / Tank Farm": 0.25,
    "Petrol Station / Depot": 0.3,
    "Pipeline — Onshore": 0.18,
    "Pipeline — Offshore / Subsea": 0.2,
    "Underground Cable / Duct": 0.22,
    "Road / Bridge / Culvert": 0.18,
    "Rail Track / Rail Infrastructure": 0.15,
    "Port / Jetty / Quay": 0.22,
    "Airport Terminal / Runway": 0.25,
    "Vessel / Barge / Tug": 0.2,
    "Vehicle Fleet / Rolling Stock": 0.22,
    "Outdoor Plant & Equipment": 0.22,
    "Semi-outdoor Kiosk / Booth": 0.28,
    "Open Yard / Storage Compound": 0.18,
    "Solar Farm / Wind Farm": 0.22,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.12,
    "Aquaculture Facility": 0.12,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.12,
    "Mineral Processing Plant": 0.18,
    "Tailings Dam / Waste Facility": 0.12,
    "Construction Site / Temporary Camp": 0.12,
    "Modular / Prefabricated Unit": 0.15,
    "Server Room / Network Hub": 0.35,
    "ATM / POS Terminal Network": 0.3,
    "Broadcasting / Transmission Equipment": 0.25,
  },

  // ── HEALTHCARE ──
  Healthcare: {
    "Office Building": 0.4,
    "Industrial Building": 0.35,
    "Warehouse / Storage": 0.3,
    "Retail Outlet / Branch": 0.3,
    "Healthcare Facility": 0.45,
    "Educational Facility": 0.3,
    "Hospitality Building": 0.25,
    "Religious / Assembly Hall": 0.2,
    "Military / Security Post": 0.3,
    "Data Centre": 0.48,
    "Telecoms Mast / Tower": 0.28,
    "Power Generation Plant": 0.38,
    "Electrical Substation": 0.38,
    "Transmission Line / Pylon": 0.28,
    "Water Treatment Plant": 0.38,
    "Water Distribution Network": 0.32,
    "Onshore Refinery / Process Plant": 0.3,
    "LNG / LPG Terminal": 0.28,
    "Offshore Platform": 0.28,
    "Floating Production Vessel (FPSO)": 0.25,
    "Storage Tank / Tank Farm": 0.3,
    "Petrol Station / Depot": 0.25,
    "Pipeline — Onshore": 0.22,
    "Pipeline — Offshore / Subsea": 0.22,
    "Underground Cable / Duct": 0.28,
    "Road / Bridge / Culvert": 0.2,
    "Rail Track / Rail Infrastructure": 0.18,
    "Port / Jetty / Quay": 0.22,
    "Airport Terminal / Runway": 0.28,
    "Vessel / Barge / Tug": 0.22,
    "Vehicle Fleet / Rolling Stock": 0.25,
    "Outdoor Plant & Equipment": 0.28,
    "Semi-outdoor Kiosk / Booth": 0.25,
    "Open Yard / Storage Compound": 0.18,
    "Solar Farm / Wind Farm": 0.28,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.12,
    "Aquaculture Facility": 0.12,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.15,
    "Mineral Processing Plant": 0.2,
    "Tailings Dam / Waste Facility": 0.15,
    "Construction Site / Temporary Camp": 0.15,
    "Modular / Prefabricated Unit": 0.25,
    "Server Room / Network Hub": 0.45,
    "ATM / POS Terminal Network": 0.22,
    "Broadcasting / Transmission Equipment": 0.28,
  },

  // ── EDUCATION ──
  Education: {
    "Office Building": 0.3,
    "Industrial Building": 0.22,
    "Warehouse / Storage": 0.2,
    "Retail Outlet / Branch": 0.2,
    "Healthcare Facility": 0.25,
    "Educational Facility": 0.32,
    "Hospitality Building": 0.22,
    "Religious / Assembly Hall": 0.18,
    "Military / Security Post": 0.22,
    "Data Centre": 0.38,
    "Telecoms Mast / Tower": 0.22,
    "Power Generation Plant": 0.25,
    "Electrical Substation": 0.25,
    "Transmission Line / Pylon": 0.18,
    "Water Treatment Plant": 0.25,
    "Water Distribution Network": 0.2,
    "Onshore Refinery / Process Plant": 0.2,
    "LNG / LPG Terminal": 0.2,
    "Offshore Platform": 0.18,
    "Floating Production Vessel (FPSO)": 0.15,
    "Storage Tank / Tank Farm": 0.2,
    "Petrol Station / Depot": 0.18,
    "Pipeline — Onshore": 0.15,
    "Pipeline — Offshore / Subsea": 0.15,
    "Underground Cable / Duct": 0.18,
    "Road / Bridge / Culvert": 0.15,
    "Rail Track / Rail Infrastructure": 0.12,
    "Port / Jetty / Quay": 0.15,
    "Airport Terminal / Runway": 0.18,
    "Vessel / Barge / Tug": 0.15,
    "Vehicle Fleet / Rolling Stock": 0.18,
    "Outdoor Plant & Equipment": 0.18,
    "Semi-outdoor Kiosk / Booth": 0.15,
    "Open Yard / Storage Compound": 0.12,
    "Solar Farm / Wind Farm": 0.2,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.1,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.1,
    "Mineral Processing Plant": 0.15,
    "Tailings Dam / Waste Facility": 0.1,
    "Construction Site / Temporary Camp": 0.1,
    "Modular / Prefabricated Unit": 0.18,
    "Server Room / Network Hub": 0.35,
    "ATM / POS Terminal Network": 0.15,
    "Broadcasting / Transmission Equipment": 0.2,
  },

  // ── GOVERNMENT AND PUBLIC SECTOR ──
  "Government & Public Sector": {
    "Office Building": 0.28,
    "Industrial Building": 0.22,
    "Warehouse / Storage": 0.2,
    "Retail Outlet / Branch": 0.18,
    "Healthcare Facility": 0.25,
    "Educational Facility": 0.22,
    "Hospitality Building": 0.18,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.32,
    "Data Centre": 0.35,
    "Telecoms Mast / Tower": 0.22,
    "Power Generation Plant": 0.28,
    "Electrical Substation": 0.28,
    "Transmission Line / Pylon": 0.2,
    "Water Treatment Plant": 0.3,
    "Water Distribution Network": 0.25,
    "Onshore Refinery / Process Plant": 0.22,
    "LNG / LPG Terminal": 0.22,
    "Offshore Platform": 0.2,
    "Floating Production Vessel (FPSO)": 0.18,
    "Storage Tank / Tank Farm": 0.2,
    "Petrol Station / Depot": 0.18,
    "Pipeline — Onshore": 0.18,
    "Pipeline — Offshore / Subsea": 0.18,
    "Underground Cable / Duct": 0.22,
    "Road / Bridge / Culvert": 0.22,
    "Rail Track / Rail Infrastructure": 0.18,
    "Port / Jetty / Quay": 0.2,
    "Airport Terminal / Runway": 0.25,
    "Vessel / Barge / Tug": 0.18,
    "Vehicle Fleet / Rolling Stock": 0.2,
    "Outdoor Plant & Equipment": 0.18,
    "Semi-outdoor Kiosk / Booth": 0.15,
    "Open Yard / Storage Compound": 0.12,
    "Solar Farm / Wind Farm": 0.2,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.12,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.12,
    "Mineral Processing Plant": 0.15,
    "Tailings Dam / Waste Facility": 0.12,
    "Construction Site / Temporary Camp": 0.1,
    "Modular / Prefabricated Unit": 0.15,
    "Server Room / Network Hub": 0.32,
    "ATM / POS Terminal Network": 0.15,
    "Broadcasting / Transmission Equipment": 0.22,
  },

  // ── REAL ESTATE AND CONSTRUCTION ──
  "Real Estate & Construction": {
    "Office Building": 0.35,
    "Industrial Building": 0.32,
    "Warehouse / Storage": 0.28,
    "Retail Outlet / Branch": 0.28,
    "Healthcare Facility": 0.28,
    "Educational Facility": 0.25,
    "Hospitality Building": 0.3,
    "Religious / Assembly Hall": 0.2,
    "Military / Security Post": 0.25,
    "Data Centre": 0.38,
    "Telecoms Mast / Tower": 0.22,
    "Power Generation Plant": 0.3,
    "Electrical Substation": 0.3,
    "Transmission Line / Pylon": 0.22,
    "Water Treatment Plant": 0.28,
    "Water Distribution Network": 0.22,
    "Onshore Refinery / Process Plant": 0.28,
    "LNG / LPG Terminal": 0.28,
    "Offshore Platform": 0.28,
    "Floating Production Vessel (FPSO)": 0.25,
    "Storage Tank / Tank Farm": 0.28,
    "Petrol Station / Depot": 0.25,
    "Pipeline — Onshore": 0.22,
    "Pipeline — Offshore / Subsea": 0.22,
    "Underground Cable / Duct": 0.25,
    "Road / Bridge / Culvert": 0.3,
    "Rail Track / Rail Infrastructure": 0.25,
    "Port / Jetty / Quay": 0.25,
    "Airport Terminal / Runway": 0.28,
    "Vessel / Barge / Tug": 0.22,
    "Vehicle Fleet / Rolling Stock": 0.22,
    "Outdoor Plant & Equipment": 0.25,
    "Semi-outdoor Kiosk / Booth": 0.2,
    "Open Yard / Storage Compound": 0.18,
    "Solar Farm / Wind Farm": 0.25,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.12,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.18,
    "Mineral Processing Plant": 0.22,
    "Tailings Dam / Waste Facility": 0.15,
    "Construction Site / Temporary Camp": 0.2,
    "Modular / Prefabricated Unit": 0.22,
    "Server Room / Network Hub": 0.35,
    "ATM / POS Terminal Network": 0.18,
    "Broadcasting / Transmission Equipment": 0.22,
  },

  // ── TRANSPORT AND LOGISTICS ──
  "Transport & Logistics": {
    "Office Building": 0.32,
    "Industrial Building": 0.35,
    "Warehouse / Storage": 0.38,
    "Retail Outlet / Branch": 0.25,
    "Healthcare Facility": 0.25,
    "Educational Facility": 0.2,
    "Hospitality Building": 0.22,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.28,
    "Data Centre": 0.38,
    "Telecoms Mast / Tower": 0.25,
    "Power Generation Plant": 0.32,
    "Electrical Substation": 0.32,
    "Transmission Line / Pylon": 0.25,
    "Water Treatment Plant": 0.25,
    "Water Distribution Network": 0.2,
    "Onshore Refinery / Process Plant": 0.28,
    "LNG / LPG Terminal": 0.28,
    "Offshore Platform": 0.3,
    "Floating Production Vessel (FPSO)": 0.28,
    "Storage Tank / Tank Farm": 0.3,
    "Petrol Station / Depot": 0.28,
    "Pipeline — Onshore": 0.28,
    "Pipeline — Offshore / Subsea": 0.3,
    "Underground Cable / Duct": 0.25,
    "Road / Bridge / Culvert": 0.35,
    "Rail Track / Rail Infrastructure": 0.38,
    "Port / Jetty / Quay": 0.42,
    "Airport Terminal / Runway": 0.4,
    "Vessel / Barge / Tug": 0.4,
    "Vehicle Fleet / Rolling Stock": 0.38,
    "Outdoor Plant & Equipment": 0.3,
    "Semi-outdoor Kiosk / Booth": 0.22,
    "Open Yard / Storage Compound": 0.25,
    "Solar Farm / Wind Farm": 0.25,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.12,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.18,
    "Mineral Processing Plant": 0.25,
    "Tailings Dam / Waste Facility": 0.15,
    "Construction Site / Temporary Camp": 0.15,
    "Modular / Prefabricated Unit": 0.2,
    "Server Room / Network Hub": 0.35,
    "ATM / POS Terminal Network": 0.18,
    "Broadcasting / Transmission Equipment": 0.22,
  },

  // ── MINING AND SOLID MINERALS ──
  "Mining & Solid Minerals": {
    "Office Building": 0.32,
    "Industrial Building": 0.4,
    "Warehouse / Storage": 0.32,
    "Retail Outlet / Branch": 0.22,
    "Healthcare Facility": 0.28,
    "Educational Facility": 0.2,
    "Hospitality Building": 0.2,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.3,
    "Data Centre": 0.4,
    "Telecoms Mast / Tower": 0.28,
    "Power Generation Plant": 0.38,
    "Electrical Substation": 0.38,
    "Transmission Line / Pylon": 0.28,
    "Water Treatment Plant": 0.32,
    "Water Distribution Network": 0.25,
    "Onshore Refinery / Process Plant": 0.38,
    "LNG / LPG Terminal": 0.35,
    "Offshore Platform": 0.32,
    "Floating Production Vessel (FPSO)": 0.3,
    "Storage Tank / Tank Farm": 0.35,
    "Petrol Station / Depot": 0.25,
    "Pipeline — Onshore": 0.32,
    "Pipeline — Offshore / Subsea": 0.32,
    "Underground Cable / Duct": 0.28,
    "Road / Bridge / Culvert": 0.25,
    "Rail Track / Rail Infrastructure": 0.28,
    "Port / Jetty / Quay": 0.3,
    "Airport Terminal / Runway": 0.28,
    "Vessel / Barge / Tug": 0.28,
    "Vehicle Fleet / Rolling Stock": 0.28,
    "Outdoor Plant & Equipment": 0.38,
    "Semi-outdoor Kiosk / Booth": 0.22,
    "Open Yard / Storage Compound": 0.25,
    "Solar Farm / Wind Farm": 0.28,
    "Cropland / Farmland": 0.12,
    "Irrigation System": 0.15,
    "Aquaculture Facility": 0.12,
    "Plantation / Forest": 0.12,
    "Mine / Quarry Site": 0.38,
    "Mineral Processing Plant": 0.42,
    "Tailings Dam / Waste Facility": 0.3,
    "Construction Site / Temporary Camp": 0.2,
    "Modular / Prefabricated Unit": 0.22,
    "Server Room / Network Hub": 0.38,
    "ATM / POS Terminal Network": 0.18,
    "Broadcasting / Transmission Equipment": 0.22,
  },

  // ── MEDIA AND ENTERTAINMENT ──
  "Media & Entertainment": {
    "Office Building": 0.32,
    "Industrial Building": 0.25,
    "Warehouse / Storage": 0.22,
    "Retail Outlet / Branch": 0.25,
    "Healthcare Facility": 0.22,
    "Educational Facility": 0.2,
    "Hospitality Building": 0.25,
    "Religious / Assembly Hall": 0.18,
    "Military / Security Post": 0.2,
    "Data Centre": 0.42,
    "Telecoms Mast / Tower": 0.3,
    "Power Generation Plant": 0.28,
    "Electrical Substation": 0.28,
    "Transmission Line / Pylon": 0.22,
    "Water Treatment Plant": 0.2,
    "Water Distribution Network": 0.18,
    "Onshore Refinery / Process Plant": 0.2,
    "LNG / LPG Terminal": 0.2,
    "Offshore Platform": 0.18,
    "Floating Production Vessel (FPSO)": 0.15,
    "Storage Tank / Tank Farm": 0.18,
    "Petrol Station / Depot": 0.18,
    "Pipeline — Onshore": 0.15,
    "Pipeline — Offshore / Subsea": 0.15,
    "Underground Cable / Duct": 0.18,
    "Road / Bridge / Culvert": 0.15,
    "Rail Track / Rail Infrastructure": 0.12,
    "Port / Jetty / Quay": 0.15,
    "Airport Terminal / Runway": 0.2,
    "Vessel / Barge / Tug": 0.15,
    "Vehicle Fleet / Rolling Stock": 0.18,
    "Outdoor Plant & Equipment": 0.22,
    "Semi-outdoor Kiosk / Booth": 0.2,
    "Open Yard / Storage Compound": 0.15,
    "Solar Farm / Wind Farm": 0.2,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.1,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.1,
    "Mineral Processing Plant": 0.15,
    "Tailings Dam / Waste Facility": 0.1,
    "Construction Site / Temporary Camp": 0.1,
    "Modular / Prefabricated Unit": 0.15,
    "Server Room / Network Hub": 0.4,
    "ATM / POS Terminal Network": 0.18,
    "Broadcasting / Transmission Equipment": 0.42,
  },

  // ── HOSPITALITY AND TOURISM ──
  "Hospitality & Tourism": {
    "Office Building": 0.3,
    "Industrial Building": 0.22,
    "Warehouse / Storage": 0.22,
    "Retail Outlet / Branch": 0.28,
    "Healthcare Facility": 0.25,
    "Educational Facility": 0.2,
    "Hospitality Building": 0.35,
    "Religious / Assembly Hall": 0.18,
    "Military / Security Post": 0.2,
    "Data Centre": 0.35,
    "Telecoms Mast / Tower": 0.2,
    "Power Generation Plant": 0.28,
    "Electrical Substation": 0.28,
    "Transmission Line / Pylon": 0.2,
    "Water Treatment Plant": 0.28,
    "Water Distribution Network": 0.22,
    "Onshore Refinery / Process Plant": 0.2,
    "LNG / LPG Terminal": 0.2,
    "Offshore Platform": 0.22,
    "Floating Production Vessel (FPSO)": 0.2,
    "Storage Tank / Tank Farm": 0.2,
    "Petrol Station / Depot": 0.2,
    "Pipeline — Onshore": 0.15,
    "Pipeline — Offshore / Subsea": 0.15,
    "Underground Cable / Duct": 0.18,
    "Road / Bridge / Culvert": 0.18,
    "Rail Track / Rail Infrastructure": 0.15,
    "Port / Jetty / Quay": 0.25,
    "Airport Terminal / Runway": 0.25,
    "Vessel / Barge / Tug": 0.25,
    "Vehicle Fleet / Rolling Stock": 0.22,
    "Outdoor Plant & Equipment": 0.2,
    "Semi-outdoor Kiosk / Booth": 0.25,
    "Open Yard / Storage Compound": 0.15,
    "Solar Farm / Wind Farm": 0.2,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.12,
    "Aquaculture Facility": 0.15,
    "Plantation / Forest": 0.15,
    "Mine / Quarry Site": 0.1,
    "Mineral Processing Plant": 0.12,
    "Tailings Dam / Waste Facility": 0.1,
    "Construction Site / Temporary Camp": 0.1,
    "Modular / Prefabricated Unit": 0.15,
    "Server Room / Network Hub": 0.32,
    "ATM / POS Terminal Network": 0.2,
    "Broadcasting / Transmission Equipment": 0.2,
  },

  // ── WATER AND SANITATION ──
  "Water & Sanitation": {
    "Office Building": 0.3,
    "Industrial Building": 0.35,
    "Warehouse / Storage": 0.28,
    "Retail Outlet / Branch": 0.2,
    "Healthcare Facility": 0.28,
    "Educational Facility": 0.22,
    "Hospitality Building": 0.2,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.25,
    "Data Centre": 0.38,
    "Telecoms Mast / Tower": 0.22,
    "Power Generation Plant": 0.35,
    "Electrical Substation": 0.32,
    "Transmission Line / Pylon": 0.25,
    "Water Treatment Plant": 0.48,
    "Water Distribution Network": 0.45,
    "Onshore Refinery / Process Plant": 0.3,
    "LNG / LPG Terminal": 0.28,
    "Offshore Platform": 0.25,
    "Floating Production Vessel (FPSO)": 0.22,
    "Storage Tank / Tank Farm": 0.32,
    "Petrol Station / Depot": 0.2,
    "Pipeline — Onshore": 0.4,
    "Pipeline — Offshore / Subsea": 0.35,
    "Underground Cable / Duct": 0.3,
    "Road / Bridge / Culvert": 0.22,
    "Rail Track / Rail Infrastructure": 0.18,
    "Port / Jetty / Quay": 0.22,
    "Airport Terminal / Runway": 0.22,
    "Vessel / Barge / Tug": 0.2,
    "Vehicle Fleet / Rolling Stock": 0.2,
    "Outdoor Plant & Equipment": 0.28,
    "Semi-outdoor Kiosk / Booth": 0.18,
    "Open Yard / Storage Compound": 0.15,
    "Solar Farm / Wind Farm": 0.22,
    "Cropland / Farmland": 0.15,
    "Irrigation System": 0.35,
    "Aquaculture Facility": 0.28,
    "Plantation / Forest": 0.15,
    "Mine / Quarry Site": 0.15,
    "Mineral Processing Plant": 0.22,
    "Tailings Dam / Waste Facility": 0.2,
    "Construction Site / Temporary Camp": 0.12,
    "Modular / Prefabricated Unit": 0.15,
    "Server Room / Network Hub": 0.35,
    "ATM / POS Terminal Network": 0.15,
    "Broadcasting / Transmission Equipment": 0.18,
  },

  // ── FOOD AND BEVERAGE ──
  "Food & Beverage": {
    "Office Building": 0.32,
    "Industrial Building": 0.4,
    "Warehouse / Storage": 0.38,
    "Retail Outlet / Branch": 0.28,
    "Healthcare Facility": 0.25,
    "Educational Facility": 0.2,
    "Hospitality Building": 0.22,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.22,
    "Data Centre": 0.4,
    "Telecoms Mast / Tower": 0.22,
    "Power Generation Plant": 0.35,
    "Electrical Substation": 0.35,
    "Transmission Line / Pylon": 0.25,
    "Water Treatment Plant": 0.4,
    "Water Distribution Network": 0.35,
    "Onshore Refinery / Process Plant": 0.38,
    "LNG / LPG Terminal": 0.35,
    "Offshore Platform": 0.28,
    "Floating Production Vessel (FPSO)": 0.25,
    "Storage Tank / Tank Farm": 0.38,
    "Petrol Station / Depot": 0.25,
    "Pipeline — Onshore": 0.28,
    "Pipeline — Offshore / Subsea": 0.25,
    "Underground Cable / Duct": 0.25,
    "Road / Bridge / Culvert": 0.2,
    "Rail Track / Rail Infrastructure": 0.18,
    "Port / Jetty / Quay": 0.28,
    "Airport Terminal / Runway": 0.25,
    "Vessel / Barge / Tug": 0.25,
    "Vehicle Fleet / Rolling Stock": 0.25,
    "Outdoor Plant & Equipment": 0.32,
    "Semi-outdoor Kiosk / Booth": 0.25,
    "Open Yard / Storage Compound": 0.22,
    "Solar Farm / Wind Farm": 0.25,
    "Cropland / Farmland": 0.2,
    "Irrigation System": 0.25,
    "Aquaculture Facility": 0.25,
    "Plantation / Forest": 0.18,
    "Mine / Quarry Site": 0.15,
    "Mineral Processing Plant": 0.25,
    "Tailings Dam / Waste Facility": 0.15,
    "Construction Site / Temporary Camp": 0.12,
    "Modular / Prefabricated Unit": 0.18,
    "Server Room / Network Hub": 0.38,
    "ATM / POS Terminal Network": 0.18,
    "Broadcasting / Transmission Equipment": 0.2,
  },

  // ── CHEMICAL AND PETROCHEMICAL ──
  "Chemical & Petrochemical": {
    "Office Building": 0.38,
    "Industrial Building": 0.48,
    "Warehouse / Storage": 0.42,
    "Retail Outlet / Branch": 0.28,
    "Healthcare Facility": 0.3,
    "Educational Facility": 0.22,
    "Hospitality Building": 0.22,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.32,
    "Data Centre": 0.48,
    "Telecoms Mast / Tower": 0.3,
    "Power Generation Plant": 0.45,
    "Electrical Substation": 0.42,
    "Transmission Line / Pylon": 0.32,
    "Water Treatment Plant": 0.38,
    "Water Distribution Network": 0.3,
    "Onshore Refinery / Process Plant": 0.52,
    "LNG / LPG Terminal": 0.5,
    "Offshore Platform": 0.48,
    "Floating Production Vessel (FPSO)": 0.45,
    "Storage Tank / Tank Farm": 0.5,
    "Petrol Station / Depot": 0.38,
    "Pipeline — Onshore": 0.42,
    "Pipeline — Offshore / Subsea": 0.45,
    "Underground Cable / Duct": 0.32,
    "Road / Bridge / Culvert": 0.22,
    "Rail Track / Rail Infrastructure": 0.2,
    "Port / Jetty / Quay": 0.38,
    "Airport Terminal / Runway": 0.3,
    "Vessel / Barge / Tug": 0.35,
    "Vehicle Fleet / Rolling Stock": 0.3,
    "Outdoor Plant & Equipment": 0.45,
    "Semi-outdoor Kiosk / Booth": 0.28,
    "Open Yard / Storage Compound": 0.28,
    "Solar Farm / Wind Farm": 0.3,
    "Cropland / Farmland": 0.12,
    "Irrigation System": 0.15,
    "Aquaculture Facility": 0.12,
    "Plantation / Forest": 0.12,
    "Mine / Quarry Site": 0.25,
    "Mineral Processing Plant": 0.38,
    "Tailings Dam / Waste Facility": 0.28,
    "Construction Site / Temporary Camp": 0.2,
    "Modular / Prefabricated Unit": 0.25,
    "Server Room / Network Hub": 0.45,
    "ATM / POS Terminal Network": 0.2,
    "Broadcasting / Transmission Equipment": 0.25,
  },

  // ── DEFENCE AND SECURITY ──
  "Defence & Security": {
    "Office Building": 0.4,
    "Industrial Building": 0.4,
    "Warehouse / Storage": 0.38,
    "Retail Outlet / Branch": 0.25,
    "Healthcare Facility": 0.35,
    "Educational Facility": 0.28,
    "Hospitality Building": 0.25,
    "Religious / Assembly Hall": 0.18,
    "Military / Security Post": 0.48,
    "Data Centre": 0.5,
    "Telecoms Mast / Tower": 0.38,
    "Power Generation Plant": 0.45,
    "Electrical Substation": 0.42,
    "Transmission Line / Pylon": 0.32,
    "Water Treatment Plant": 0.38,
    "Water Distribution Network": 0.3,
    "Onshore Refinery / Process Plant": 0.35,
    "LNG / LPG Terminal": 0.35,
    "Offshore Platform": 0.4,
    "Floating Production Vessel (FPSO)": 0.38,
    "Storage Tank / Tank Farm": 0.35,
    "Petrol Station / Depot": 0.3,
    "Pipeline — Onshore": 0.3,
    "Pipeline — Offshore / Subsea": 0.32,
    "Underground Cable / Duct": 0.35,
    "Road / Bridge / Culvert": 0.28,
    "Rail Track / Rail Infrastructure": 0.25,
    "Port / Jetty / Quay": 0.35,
    "Airport Terminal / Runway": 0.4,
    "Vessel / Barge / Tug": 0.38,
    "Vehicle Fleet / Rolling Stock": 0.38,
    "Outdoor Plant & Equipment": 0.35,
    "Semi-outdoor Kiosk / Booth": 0.25,
    "Open Yard / Storage Compound": 0.25,
    "Solar Farm / Wind Farm": 0.3,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.12,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.2,
    "Mineral Processing Plant": 0.28,
    "Tailings Dam / Waste Facility": 0.18,
    "Construction Site / Temporary Camp": 0.18,
    "Modular / Prefabricated Unit": 0.28,
    "Server Room / Network Hub": 0.48,
    "ATM / POS Terminal Network": 0.2,
    "Broadcasting / Transmission Equipment": 0.3,
  },

  // ── NGO AND DEVELOPMENT ──
  "NGO & Development": {
    "Office Building": 0.25,
    "Industrial Building": 0.18,
    "Warehouse / Storage": 0.18,
    "Retail Outlet / Branch": 0.15,
    "Healthcare Facility": 0.25,
    "Educational Facility": 0.22,
    "Hospitality Building": 0.18,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.18,
    "Data Centre": 0.28,
    "Telecoms Mast / Tower": 0.18,
    "Power Generation Plant": 0.2,
    "Electrical Substation": 0.2,
    "Transmission Line / Pylon": 0.15,
    "Water Treatment Plant": 0.25,
    "Water Distribution Network": 0.2,
    "Onshore Refinery / Process Plant": 0.15,
    "LNG / LPG Terminal": 0.15,
    "Offshore Platform": 0.15,
    "Floating Production Vessel (FPSO)": 0.12,
    "Storage Tank / Tank Farm": 0.15,
    "Petrol Station / Depot": 0.15,
    "Pipeline — Onshore": 0.12,
    "Pipeline — Offshore / Subsea": 0.12,
    "Underground Cable / Duct": 0.15,
    "Road / Bridge / Culvert": 0.15,
    "Rail Track / Rail Infrastructure": 0.12,
    "Port / Jetty / Quay": 0.15,
    "Airport Terminal / Runway": 0.15,
    "Vessel / Barge / Tug": 0.15,
    "Vehicle Fleet / Rolling Stock": 0.18,
    "Outdoor Plant & Equipment": 0.15,
    "Semi-outdoor Kiosk / Booth": 0.12,
    "Open Yard / Storage Compound": 0.1,
    "Solar Farm / Wind Farm": 0.15,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.12,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.1,
    "Mineral Processing Plant": 0.12,
    "Tailings Dam / Waste Facility": 0.1,
    "Construction Site / Temporary Camp": 0.1,
    "Modular / Prefabricated Unit": 0.18,
    "Server Room / Network Hub": 0.25,
    "ATM / POS Terminal Network": 0.12,
    "Broadcasting / Transmission Equipment": 0.15,
  },

  // ── RELIGIOUS AND COMMUNITY ──
  "Religious & Community": {
    "Office Building": 0.22,
    "Industrial Building": 0.15,
    "Warehouse / Storage": 0.15,
    "Retail Outlet / Branch": 0.15,
    "Healthcare Facility": 0.2,
    "Educational Facility": 0.18,
    "Hospitality Building": 0.18,
    "Religious / Assembly Hall": 0.2,
    "Military / Security Post": 0.15,
    "Data Centre": 0.22,
    "Telecoms Mast / Tower": 0.15,
    "Power Generation Plant": 0.15,
    "Electrical Substation": 0.15,
    "Transmission Line / Pylon": 0.12,
    "Water Treatment Plant": 0.15,
    "Water Distribution Network": 0.12,
    "Onshore Refinery / Process Plant": 0.12,
    "LNG / LPG Terminal": 0.12,
    "Offshore Platform": 0.1,
    "Floating Production Vessel (FPSO)": 0.1,
    "Storage Tank / Tank Farm": 0.12,
    "Petrol Station / Depot": 0.12,
    "Pipeline — Onshore": 0.1,
    "Pipeline — Offshore / Subsea": 0.1,
    "Underground Cable / Duct": 0.12,
    "Road / Bridge / Culvert": 0.12,
    "Rail Track / Rail Infrastructure": 0.1,
    "Port / Jetty / Quay": 0.1,
    "Airport Terminal / Runway": 0.12,
    "Vessel / Barge / Tug": 0.1,
    "Vehicle Fleet / Rolling Stock": 0.12,
    "Outdoor Plant & Equipment": 0.12,
    "Semi-outdoor Kiosk / Booth": 0.12,
    "Open Yard / Storage Compound": 0.1,
    "Solar Farm / Wind Farm": 0.12,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.1,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.1,
    "Mineral Processing Plant": 0.1,
    "Tailings Dam / Waste Facility": 0.1,
    "Construction Site / Temporary Camp": 0.1,
    "Modular / Prefabricated Unit": 0.12,
    "Server Room / Network Hub": 0.2,
    "ATM / POS Terminal Network": 0.1,
    "Broadcasting / Transmission Equipment": 0.12,
  },

  // ── WASTE MANAGEMENT ──
  "Waste Management": {
    "Office Building": 0.22,
    "Industrial Building": 0.28,
    "Warehouse / Storage": 0.25,
    "Retail Outlet / Branch": 0.15,
    "Healthcare Facility": 0.2,
    "Educational Facility": 0.15,
    "Hospitality Building": 0.15,
    "Religious / Assembly Hall": 0.12,
    "Military / Security Post": 0.18,
    "Data Centre": 0.25,
    "Telecoms Mast / Tower": 0.15,
    "Power Generation Plant": 0.25,
    "Electrical Substation": 0.22,
    "Transmission Line / Pylon": 0.15,
    "Water Treatment Plant": 0.32,
    "Water Distribution Network": 0.25,
    "Onshore Refinery / Process Plant": 0.28,
    "LNG / LPG Terminal": 0.25,
    "Offshore Platform": 0.18,
    "Floating Production Vessel (FPSO)": 0.15,
    "Storage Tank / Tank Farm": 0.28,
    "Petrol Station / Depot": 0.18,
    "Pipeline — Onshore": 0.22,
    "Pipeline — Offshore / Subsea": 0.18,
    "Underground Cable / Duct": 0.18,
    "Road / Bridge / Culvert": 0.18,
    "Rail Track / Rail Infrastructure": 0.15,
    "Port / Jetty / Quay": 0.2,
    "Airport Terminal / Runway": 0.18,
    "Vessel / Barge / Tug": 0.18,
    "Vehicle Fleet / Rolling Stock": 0.22,
    "Outdoor Plant & Equipment": 0.28,
    "Semi-outdoor Kiosk / Booth": 0.15,
    "Open Yard / Storage Compound": 0.22,
    "Solar Farm / Wind Farm": 0.18,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.12,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.2,
    "Mineral Processing Plant": 0.25,
    "Tailings Dam / Waste Facility": 0.28,
    "Construction Site / Temporary Camp": 0.12,
    "Modular / Prefabricated Unit": 0.15,
    "Server Room / Network Hub": 0.22,
    "ATM / POS Terminal Network": 0.12,
    "Broadcasting / Transmission Equipment": 0.15,
  },

  // ── PORTS AND MARITIME ──
  "Ports & Maritime": {
    "Office Building": 0.35,
    "Industrial Building": 0.42,
    "Warehouse / Storage": 0.4,
    "Retail Outlet / Branch": 0.25,
    "Healthcare Facility": 0.28,
    "Educational Facility": 0.22,
    "Hospitality Building": 0.25,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.35,
    "Data Centre": 0.42,
    "Telecoms Mast / Tower": 0.3,
    "Power Generation Plant": 0.4,
    "Electrical Substation": 0.38,
    "Transmission Line / Pylon": 0.28,
    "Water Treatment Plant": 0.32,
    "Water Distribution Network": 0.25,
    "Onshore Refinery / Process Plant": 0.38,
    "LNG / LPG Terminal": 0.42,
    "Offshore Platform": 0.5,
    "Floating Production Vessel (FPSO)": 0.52,
    "Storage Tank / Tank Farm": 0.4,
    "Petrol Station / Depot": 0.3,
    "Pipeline — Onshore": 0.32,
    "Pipeline — Offshore / Subsea": 0.48,
    "Underground Cable / Duct": 0.28,
    "Road / Bridge / Culvert": 0.25,
    "Rail Track / Rail Infrastructure": 0.22,
    "Port / Jetty / Quay": 0.52,
    "Airport Terminal / Runway": 0.32,
    "Vessel / Barge / Tug": 0.52,
    "Vehicle Fleet / Rolling Stock": 0.3,
    "Outdoor Plant & Equipment": 0.38,
    "Semi-outdoor Kiosk / Booth": 0.25,
    "Open Yard / Storage Compound": 0.28,
    "Solar Farm / Wind Farm": 0.28,
    "Cropland / Farmland": 0.12,
    "Irrigation System": 0.15,
    "Aquaculture Facility": 0.2,
    "Plantation / Forest": 0.12,
    "Mine / Quarry Site": 0.18,
    "Mineral Processing Plant": 0.28,
    "Tailings Dam / Waste Facility": 0.2,
    "Construction Site / Temporary Camp": 0.18,
    "Modular / Prefabricated Unit": 0.22,
    "Server Room / Network Hub": 0.4,
    "ATM / POS Terminal Network": 0.18,
    "Broadcasting / Transmission Equipment": 0.25,
  },

  // ── AVIATION ──
  Aviation: {
    "Office Building": 0.38,
    "Industrial Building": 0.35,
    "Warehouse / Storage": 0.32,
    "Retail Outlet / Branch": 0.25,
    "Healthcare Facility": 0.28,
    "Educational Facility": 0.22,
    "Hospitality Building": 0.25,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.38,
    "Data Centre": 0.45,
    "Telecoms Mast / Tower": 0.32,
    "Power Generation Plant": 0.4,
    "Electrical Substation": 0.38,
    "Transmission Line / Pylon": 0.28,
    "Water Treatment Plant": 0.28,
    "Water Distribution Network": 0.22,
    "Onshore Refinery / Process Plant": 0.3,
    "LNG / LPG Terminal": 0.3,
    "Offshore Platform": 0.3,
    "Floating Production Vessel (FPSO)": 0.28,
    "Storage Tank / Tank Farm": 0.32,
    "Petrol Station / Depot": 0.28,
    "Pipeline — Onshore": 0.25,
    "Pipeline — Offshore / Subsea": 0.25,
    "Underground Cable / Duct": 0.28,
    "Road / Bridge / Culvert": 0.25,
    "Rail Track / Rail Infrastructure": 0.22,
    "Port / Jetty / Quay": 0.3,
    "Airport Terminal / Runway": 0.48,
    "Vessel / Barge / Tug": 0.28,
    "Vehicle Fleet / Rolling Stock": 0.32,
    "Outdoor Plant & Equipment": 0.35,
    "Semi-outdoor Kiosk / Booth": 0.22,
    "Open Yard / Storage Compound": 0.22,
    "Solar Farm / Wind Farm": 0.28,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.12,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.15,
    "Mineral Processing Plant": 0.22,
    "Tailings Dam / Waste Facility": 0.15,
    "Construction Site / Temporary Camp": 0.15,
    "Modular / Prefabricated Unit": 0.2,
    "Server Room / Network Hub": 0.42,
    "ATM / POS Terminal Network": 0.18,
    "Broadcasting / Transmission Equipment": 0.28,
  },

  // ── DIGITAL AND CREATIVE ECONOMY ──
  "Digital & Creative Economy": {
    "Office Building": 0.38,
    "Industrial Building": 0.25,
    "Warehouse / Storage": 0.22,
    "Retail Outlet / Branch": 0.28,
    "Healthcare Facility": 0.25,
    "Educational Facility": 0.25,
    "Hospitality Building": 0.25,
    "Religious / Assembly Hall": 0.15,
    "Military / Security Post": 0.2,
    "Data Centre": 0.52,
    "Telecoms Mast / Tower": 0.32,
    "Power Generation Plant": 0.3,
    "Electrical Substation": 0.3,
    "Transmission Line / Pylon": 0.22,
    "Water Treatment Plant": 0.22,
    "Water Distribution Network": 0.18,
    "Onshore Refinery / Process Plant": 0.18,
    "LNG / LPG Terminal": 0.18,
    "Offshore Platform": 0.15,
    "Floating Production Vessel (FPSO)": 0.12,
    "Storage Tank / Tank Farm": 0.15,
    "Petrol Station / Depot": 0.15,
    "Pipeline — Onshore": 0.12,
    "Pipeline — Offshore / Subsea": 0.12,
    "Underground Cable / Duct": 0.18,
    "Road / Bridge / Culvert": 0.12,
    "Rail Track / Rail Infrastructure": 0.1,
    "Port / Jetty / Quay": 0.15,
    "Airport Terminal / Runway": 0.18,
    "Vessel / Barge / Tug": 0.12,
    "Vehicle Fleet / Rolling Stock": 0.15,
    "Outdoor Plant & Equipment": 0.18,
    "Semi-outdoor Kiosk / Booth": 0.18,
    "Open Yard / Storage Compound": 0.12,
    "Solar Farm / Wind Farm": 0.2,
    "Cropland / Farmland": 0.1,
    "Irrigation System": 0.1,
    "Aquaculture Facility": 0.1,
    "Plantation / Forest": 0.1,
    "Mine / Quarry Site": 0.1,
    "Mineral Processing Plant": 0.12,
    "Tailings Dam / Waste Facility": 0.1,
    "Construction Site / Temporary Camp": 0.1,
    "Modular / Prefabricated Unit": 0.15,
    "Server Room / Network Hub": 0.5,
    "ATM / POS Terminal Network": 0.22,
    "Broadcasting / Transmission Equipment": 0.35,
  },
};

// ──────────────────────────────────────────────────────────────────
// 2. SUBSECTOR_ADJ — Subsector adjustment to SBRA base RRF
// ──────────────────────────────────────────────────────────────────

export const SUBSECTOR_ADJ: Record<string, number> = {
  // Telecoms
  "Data Centre": +0.1,
  "Mobile Network": 0.0,
  "Broadband/ISP": +0.05,
  Fintech: +0.05,
  Software: +0.05,
  // Oil & Gas
  LNG: +0.1,
  "Upstream Exploration": +0.05,
  "Downstream Refining": +0.05,
  "Midstream Pipeline": 0.0,
  Petrochem: +0.05,
  // Power
  Generation: +0.05,
  "Renewable Energy": +0.05,
  Transmission: 0.0,
  Distribution: 0.0,
  "Gas-to-Power": +0.03,
  // Healthcare
  Hospital: +0.1,
  "Pharma Manufacturing": +0.05,
  "Clinic/PHC": -0.05,
  "Medical Devices": +0.05,
  "Lab Services": +0.03,
  // Banking
  "Commercial Bank": +0.05,
  Insurance: +0.05,
  Microfinance: -0.05,
  Pension: +0.03,
  "Capital Markets": +0.05,
  // Ports
  "Deep Seaport": +0.05,
  "River Port": 0.0,
  "Dry Port": +0.03,
  Shipyard: +0.03,
  "Maritime Authority": 0.0,
  // Aviation
  "International Airport": +0.1,
  "Domestic Airport": +0.05,
  "Cargo Terminal": +0.03,
  "MRO Facility": +0.05,
  "Air Navigation": +0.05,
  // Agriculture
  Irrigation: +0.1,
  "Agro-processing": +0.05,
  "Crop Farming": -0.05,
  Livestock: -0.03,
  Aquaculture: +0.03,
  // Water
  "Water Treatment": +0.05,
  "Sewage/Wastewater": -0.05,
  "Irrigation Authority": +0.05,
  "WASH NGO": -0.03,
  // Mining
  Coal: +0.03,
  Limestone: +0.03,
  "Iron Ore": +0.03,
  Gold: +0.05,
  Bitumen: +0.03,
  Quarrying: 0.0,
  // Manufacturing
  Cement: +0.05,
  "Steel/Metals": +0.05,
  Chemicals: +0.08,
  FMCG: +0.03,
  Packaging: +0.02,
  Textiles: -0.02,
  // Default
  __default__: 0.0,
};

// ──────────────────────────────────────────────────────────────────
// 3. SECTOR_RISK_MODIFIERS — Per sector, per risk adjustment
// ──────────────────────────────────────────────────────────────────

export const SECTOR_RISK_MODIFIERS: Record<string, Record<string, number>> = {
  "Telecoms & ICT": {
    "Extreme Heat": +0.15,
    Drought: +0.1,
    "Tropical Cyclones": +0.05,
    "Thunderstorms & Lightning": +0.2,
    "Sandstorms / Harmattan": +0.1,
    "Heavy Rainfall": 0.0,
    "River Flooding": -0.05,
    "Flash Flooding": -0.05,
    "Coastal Flooding": -0.1,
    "Storm Surge": -0.1,
    Landslides: 0.0,
    "Coastal & Riverbank Erosion": -0.1,
    "Groundwater Flooding": -0.05,
    "Sea Level Rise": -0.15,
    Desertification: 0.0,
    "Wildfire / Bushfire": +0.05,
    "Water Scarcity": +0.1,
    "Glacial Retreat": 0.0,
    Earthquakes: 0.0,
    "Volcanic Eruptions": 0.0,
    Tsunamis: 0.0,
  },
  "Banking & Financial Services": {
    "Extreme Heat": +0.1,
    Drought: +0.05,
    "Tropical Cyclones": +0.05,
    "Thunderstorms & Lightning": +0.15,
    "Sandstorms / Harmattan": +0.05,
    "Heavy Rainfall": 0.0,
    "River Flooding": -0.05,
    "Flash Flooding": -0.05,
    "Coastal Flooding": -0.1,
    "Storm Surge": -0.1,
    Landslides: 0.0,
    "Coastal & Riverbank Erosion": -0.1,
    "Groundwater Flooding": -0.05,
    "Sea Level Rise": -0.15,
    Desertification: 0.0,
    "Wildfire / Bushfire": +0.05,
    "Water Scarcity": +0.05,
    "Glacial Retreat": 0.0,
    Earthquakes: 0.0,
    "Volcanic Eruptions": 0.0,
    Tsunamis: 0.0,
  },
  "Oil & Gas": {
    "Extreme Heat": +0.15,
    Drought: +0.15,
    "Tropical Cyclones": +0.1,
    "Thunderstorms & Lightning": +0.15,
    "Sandstorms / Harmattan": +0.1,
    "Heavy Rainfall": +0.05,
    "River Flooding": -0.05,
    "Flash Flooding": -0.05,
    "Coastal Flooding": -0.05,
    "Storm Surge": -0.05,
    Landslides: +0.05,
    "Coastal & Riverbank Erosion": -0.05,
    "Groundwater Flooding": -0.05,
    "Sea Level Rise": -0.1,
    Desertification: 0.0,
    "Wildfire / Bushfire": +0.1,
    "Water Scarcity": +0.15,
    "Glacial Retreat": 0.0,
    Earthquakes: +0.05,
    "Volcanic Eruptions": +0.05,
    Tsunamis: 0.0,
  },
  "Power & Energy": {
    "Extreme Heat": +0.15,
    Drought: +0.15,
    "Tropical Cyclones": +0.1,
    "Thunderstorms & Lightning": +0.2,
    "Sandstorms / Harmattan": +0.05,
    "Heavy Rainfall": +0.05,
    "River Flooding": -0.05,
    "Flash Flooding": -0.05,
    "Coastal Flooding": -0.05,
    "Storm Surge": -0.05,
    Landslides: 0.0,
    "Coastal & Riverbank Erosion": -0.05,
    "Groundwater Flooding": -0.05,
    "Sea Level Rise": -0.1,
    Desertification: 0.0,
    "Wildfire / Bushfire": +0.05,
    "Water Scarcity": +0.15,
    "Glacial Retreat": 0.0,
    Earthquakes: +0.05,
    "Volcanic Eruptions": 0.0,
    Tsunamis: 0.0,
  },
  "Agriculture & Agribusiness": {
    "Extreme Heat": +0.05,
    Drought: +0.2,
    "Tropical Cyclones": +0.05,
    "Thunderstorms & Lightning": +0.05,
    "Sandstorms / Harmattan": +0.05,
    "Heavy Rainfall": +0.05,
    "River Flooding": +0.1,
    "Flash Flooding": -0.05,
    "Coastal Flooding": -0.1,
    "Storm Surge": -0.1,
    Landslides: +0.05,
    "Coastal & Riverbank Erosion": -0.05,
    "Groundwater Flooding": -0.05,
    "Sea Level Rise": -0.1,
    Desertification: +0.1,
    "Wildfire / Bushfire": +0.05,
    "Water Scarcity": +0.2,
    "Glacial Retreat": +0.05,
    Earthquakes: 0.0,
    "Volcanic Eruptions": 0.0,
    Tsunamis: 0.0,
  },
  "Ports & Maritime": {
    "Extreme Heat": +0.1,
    Drought: +0.1,
    "Tropical Cyclones": +0.1,
    "Thunderstorms & Lightning": +0.1,
    "Sandstorms / Harmattan": +0.05,
    "Heavy Rainfall": +0.05,
    "River Flooding": +0.05,
    "Flash Flooding": -0.05,
    "Coastal Flooding": -0.05,
    "Storm Surge": -0.05,
    Landslides: 0.0,
    "Coastal & Riverbank Erosion": -0.05,
    "Groundwater Flooding": -0.05,
    "Sea Level Rise": -0.1,
    Desertification: 0.0,
    "Wildfire / Bushfire": 0.0,
    "Water Scarcity": +0.1,
    "Glacial Retreat": 0.0,
    Earthquakes: +0.05,
    "Volcanic Eruptions": 0.0,
    Tsunamis: +0.05,
  },
  "Mining & Solid Minerals": {
    "Extreme Heat": +0.05,
    Drought: +0.1,
    "Tropical Cyclones": +0.05,
    "Thunderstorms & Lightning": +0.1,
    "Sandstorms / Harmattan": +0.05,
    "Heavy Rainfall": +0.05,
    "River Flooding": -0.05,
    "Flash Flooding": -0.05,
    "Coastal Flooding": -0.1,
    "Storm Surge": -0.1,
    Landslides: +0.1,
    "Coastal & Riverbank Erosion": -0.05,
    "Groundwater Flooding": -0.05,
    "Sea Level Rise": -0.1,
    Desertification: +0.05,
    "Wildfire / Bushfire": +0.05,
    "Water Scarcity": +0.1,
    "Glacial Retreat": 0.0,
    Earthquakes: +0.1,
    "Volcanic Eruptions": +0.05,
    Tsunamis: 0.0,
  },
  "Chemical & Petrochemical": {
    "Extreme Heat": +0.1,
    Drought: +0.1,
    "Tropical Cyclones": +0.1,
    "Thunderstorms & Lightning": +0.1,
    "Sandstorms / Harmattan": +0.1,
    "Heavy Rainfall": +0.05,
    "River Flooding": -0.05,
    "Flash Flooding": -0.05,
    "Coastal Flooding": -0.05,
    "Storm Surge": -0.05,
    Landslides: 0.0,
    "Coastal & Riverbank Erosion": -0.05,
    "Groundwater Flooding": -0.05,
    "Sea Level Rise": -0.1,
    Desertification: 0.0,
    "Wildfire / Bushfire": +0.1,
    "Water Scarcity": +0.1,
    "Glacial Retreat": 0.0,
    Earthquakes: +0.05,
    "Volcanic Eruptions": +0.05,
    Tsunamis: 0.0,
  },
};

export const DEFAULT_RISK_MODIFIERS: Record<string, number> = {
  "Extreme Heat": +0.05,
  Drought: +0.05,
  "Tropical Cyclones": +0.05,
  "Thunderstorms & Lightning": +0.1,
  "Sandstorms / Harmattan": +0.05,
  "Heavy Rainfall": 0.0,
  "River Flooding": -0.05,
  "Flash Flooding": -0.05,
  "Coastal Flooding": -0.1,
  "Storm Surge": -0.1,
  Landslides: 0.0,
  "Coastal & Riverbank Erosion": -0.1,
  "Groundwater Flooding": -0.05,
  "Sea Level Rise": -0.15,
  Desertification: 0.0,
  "Wildfire / Bushfire": +0.05,
  "Water Scarcity": +0.05,
  "Glacial Retreat": 0.0,
  Earthquakes: 0.0,
  "Volcanic Eruptions": 0.0,
  Tsunamis: 0.0,
};

// ──────────────────────────────────────────────────────────────────
// 4. ANNUAL_PROBABILITY
// ──────────────────────────────────────────────────────────────────

export const ANNUAL_PROBABILITY: Record<string, number> = {
  "Almost Certain": 0.9,
  "Very Frequent": 0.5,
  Frequent: 0.2,
  Occasional: 0.1,
  Rare: 0.04,
  "Very Rare": 0.01,
};

// ──────────────────────────────────────────────────────────────────
// 5. ALL_21_RISKS
// ──────────────────────────────────────────────────────────────────

export interface RiskDefinition {
  id: number;
  risk: string;
  category:
    | "Meteorological"
    | "Hydrological"
    | "Climatological"
    | "Geophysical";
  definition: string;
}

export const ALL_21_RISKS: RiskDefinition[] = [
  {
    id: 1,
    risk: "Extreme Heat",
    category: "Meteorological",
    definition:
      "Prolonged high temperatures causing equipment failure, health impacts, and cooling strain",
  },
  {
    id: 2,
    risk: "Drought",
    category: "Meteorological",
    definition:
      "Prolonged rainfall deficit affecting water supply for cooling, generators, and staff",
  },
  {
    id: 3,
    risk: "Tropical Cyclones",
    category: "Meteorological",
    definition:
      "Rotating storms with extreme winds causing structural damage to masts, towers, buildings",
  },
  {
    id: 4,
    risk: "Thunderstorms & Lightning",
    category: "Meteorological",
    definition:
      "Severe electrical storms causing power surges, equipment damage, and fire risk",
  },
  {
    id: 5,
    risk: "Sandstorms / Harmattan",
    category: "Meteorological",
    definition:
      "Wind-driven dust infiltrating equipment and causing respiratory health issues",
  },
  {
    id: 6,
    risk: "Heavy Rainfall",
    category: "Meteorological",
    definition:
      "Extreme rainfall overwhelming drainage and disrupting access routes",
  },
  {
    id: 7,
    risk: "River Flooding",
    category: "Hydrological",
    definition:
      "Rivers overflowing banks and inundating low-lying or riverside locations",
  },
  {
    id: 8,
    risk: "Flash Flooding",
    category: "Hydrological",
    definition:
      "Rapid surface flooding within hours of heavy rainfall — severe in urban areas",
  },
  {
    id: 9,
    risk: "Coastal Flooding",
    category: "Hydrological",
    definition: "Inundation of coastal land by seawater",
  },
  {
    id: 10,
    risk: "Storm Surge",
    category: "Hydrological",
    definition:
      "Abnormal sea level rise driven by storm pressure — relevant for coastal assets",
  },
  {
    id: 11,
    risk: "Landslides",
    category: "Hydrological",
    definition:
      "Slope instability causing land movement — relevant for hilly terrain",
  },
  {
    id: 12,
    risk: "Coastal & Riverbank Erosion",
    category: "Hydrological",
    definition:
      "Gradual wearing away of coastlines and riverbanks reducing protective buffers",
  },
  {
    id: 13,
    risk: "Groundwater Flooding",
    category: "Hydrological",
    definition:
      "Rising water table causing below-ground flooding of infrastructure and foundations",
  },
  {
    id: 14,
    risk: "Sea Level Rise",
    category: "Climatological",
    definition:
      "Permanent long-term rise in ocean levels making coastal flooding progressively worse",
  },
  {
    id: 15,
    risk: "Desertification",
    category: "Climatological",
    definition:
      "Progressive vegetation loss and land degradation — relevant for northern Nigeria",
  },
  {
    id: 16,
    risk: "Wildfire / Bushfire",
    category: "Climatological",
    definition: "Uncontrolled fires in vegetation near grassland or bush areas",
  },
  {
    id: 17,
    risk: "Water Scarcity",
    category: "Climatological",
    definition:
      "Structural freshwater deficit affecting cooling, generators, and operations",
  },
  {
    id: 18,
    risk: "Glacial Retreat",
    category: "Climatological",
    definition:
      "Melting glaciers reducing dry-season river flows and downstream water supply",
  },
  {
    id: 19,
    risk: "Earthquakes",
    category: "Geophysical",
    definition:
      "Ground shaking from tectonic movement causing structural damage",
  },
  {
    id: 20,
    risk: "Volcanic Eruptions",
    category: "Geophysical",
    definition: "Discharge of ash, lava, and gases from active volcanoes",
  },
  {
    id: 21,
    risk: "Tsunamis",
    category: "Geophysical",
    definition:
      "Giant ocean waves triggered by underwater seismic events — relevant for coastal assets",
  },
];

// ──────────────────────────────────────────────────────────────────
// 6. SECTORS (25 sectors with subsectors)
// ──────────────────────────────────────────────────────────────────

export interface SectorInfo {
  name: string;
  subsectors: string[];
}

export const SECTORS: Record<string, SectorInfo> = {
  "1": {
    name: "Telecoms & ICT",
    subsectors: [
      "Mobile Network",
      "Broadband/ISP",
      "Data Centre",
      "Fintech",
      "Software",
    ],
  },
  "2": {
    name: "Banking & Financial Services",
    subsectors: [
      "Commercial Bank",
      "Microfinance",
      "Insurance",
      "Pension",
      "Capital Markets",
    ],
  },
  "3": {
    name: "Oil & Gas",
    subsectors: [
      "Upstream Exploration",
      "Midstream Pipeline",
      "Downstream Refining",
      "Petrochem",
      "LNG",
    ],
  },
  "4": {
    name: "Power & Energy",
    subsectors: [
      "Generation",
      "Transmission",
      "Distribution",
      "Renewable Energy",
      "Gas-to-Power",
    ],
  },
  "5": {
    name: "Manufacturing",
    subsectors: [
      "FMCG",
      "Cement",
      "Steel/Metals",
      "Chemicals",
      "Packaging",
      "Textiles",
    ],
  },
  "6": {
    name: "Agriculture & Agribusiness",
    subsectors: [
      "Crop Farming",
      "Livestock",
      "Aquaculture",
      "Agro-processing",
      "Irrigation",
    ],
  },
  "7": {
    name: "Retail & Commercial",
    subsectors: [
      "Supermarket/Retail Chain",
      "Wholesale",
      "E-commerce",
      "Markets/Malls",
    ],
  },
  "8": {
    name: "Healthcare",
    subsectors: [
      "Hospital",
      "Clinic/PHC",
      "Pharma Manufacturing",
      "Medical Devices",
      "Lab Services",
    ],
  },
  "9": {
    name: "Education",
    subsectors: [
      "University",
      "Polytechnic",
      "Secondary School",
      "Research Institute",
    ],
  },
  "10": {
    name: "Government & Public Sector",
    subsectors: [
      "Federal Ministry",
      "State Agency",
      "Local Government",
      "Military",
      "Public Utility",
    ],
  },
  "11": {
    name: "Real Estate & Construction",
    subsectors: [
      "Residential",
      "Commercial Property",
      "Industrial Estate",
      "Infrastructure",
    ],
  },
  "12": {
    name: "Transport & Logistics",
    subsectors: [
      "Road Freight",
      "Rail",
      "Aviation",
      "Seaport",
      "Inland Waterway",
      "Courier",
    ],
  },
  "13": {
    name: "Mining & Solid Minerals",
    subsectors: [
      "Coal",
      "Limestone",
      "Iron Ore",
      "Gold",
      "Bitumen",
      "Quarrying",
    ],
  },
  "14": {
    name: "Media & Entertainment",
    subsectors: [
      "Broadcast",
      "Print",
      "Digital Media",
      "Film/Music Production",
    ],
  },
  "15": {
    name: "Hospitality & Tourism",
    subsectors: ["Hotel", "Restaurant", "Resort", "Tourism Authority"],
  },
  "16": {
    name: "Water & Sanitation",
    subsectors: [
      "Water Treatment",
      "Water Distribution",
      "Sewage/Wastewater",
      "Irrigation Authority",
      "WASH NGO",
    ],
  },
  "17": {
    name: "Food & Beverage",
    subsectors: [
      "Brewery",
      "Bottling Plant",
      "Flour Milling",
      "Dairy",
      "Confectionery",
      "Palm Oil Processing",
    ],
  },
  "18": {
    name: "Chemical & Petrochemical",
    subsectors: [
      "Fertiliser",
      "Industrial Chemicals",
      "Paints & Coatings",
      "Plastic Manufacturing",
      "Rubber",
    ],
  },
  "19": {
    name: "Defence & Security",
    subsectors: [
      "Military Installation",
      "Police",
      "Civil Defence",
      "Private Security",
      "Border Agency",
    ],
  },
  "20": {
    name: "NGO & Development",
    subsectors: [
      "International NGO",
      "Local NGO",
      "UN Agency",
      "Development Finance",
      "Humanitarian",
    ],
  },
  "21": {
    name: "Religious & Community",
    subsectors: [
      "Church/Mosque Complex",
      "Community Centre",
      "Stadium/Arena",
      "Cultural Centre",
    ],
  },
  "22": {
    name: "Waste Management",
    subsectors: [
      "Solid Waste Collection",
      "Recycling",
      "Landfill",
      "Hazardous Waste",
      "E-waste",
    ],
  },
  "23": {
    name: "Ports & Maritime",
    subsectors: [
      "Deep Seaport",
      "River Port",
      "Dry Port",
      "Shipyard",
      "Maritime Authority",
    ],
  },
  "24": {
    name: "Aviation",
    subsectors: [
      "International Airport",
      "Domestic Airport",
      "Cargo Terminal",
      "MRO Facility",
      "Air Navigation",
    ],
  },
  "25": {
    name: "Digital & Creative Economy",
    subsectors: [
      "Tech Hub",
      "Co-working Space",
      "Animation Studio",
      "Gaming",
      "Digital Agency",
    ],
  },
};

// ──────────────────────────────────────────────────────────────────
// 7. RESPONSE_RULES
// ──────────────────────────────────────────────────────────────────

export interface ResponseRule {
  strategy: string;
  priority: string;
  timeframe: string;
  residual_reduction: number;
}

export const RESPONSE_RULES: Record<string, ResponseRule> = {
  Extreme: {
    strategy: "Reduce + Transfer",
    priority: "CRITICAL",
    timeframe: "Immediate — within 30 days",
    residual_reduction: 0.4,
  },
  "Very High": {
    strategy: "Reduce + Transfer",
    priority: "HIGH",
    timeframe: "Short-term — within 60 days",
    residual_reduction: 0.35,
  },
  High: {
    strategy: "Reduce",
    priority: "ELEVATED",
    timeframe: "Medium-term — within 90 days",
    residual_reduction: 0.3,
  },
  Medium: {
    strategy: "Reduce or Transfer",
    priority: "MODERATE",
    timeframe: "Planned — within 6 months",
    residual_reduction: 0.2,
  },
  Low: {
    strategy: "Accept or Transfer",
    priority: "LOW",
    timeframe: "Annual review",
    residual_reduction: 0.1,
  },
  Negligible: {
    strategy: "Accept",
    priority: "NEGLIGIBLE",
    timeframe: "Annual review",
    residual_reduction: 0.05,
  },
};

// ──────────────────────────────────────────────────────────────────
// 8. RESPONSE_ACTIONS — Per risk, top 3 actions
// ──────────────────────────────────────────────────────────────────

export const RESPONSE_ACTIONS: Record<string, string[]> = {
  "Extreme Heat": [
    "Install N+1 redundant cooling systems",
    "Implement heat-triggered operational protocols",
    "Install cool roofing and external shading",
  ],
  Drought: [
    "Install on-site water storage (minimum 14 days)",
    "Implement water recycling systems",
    "Identify alternative water supply contracts",
  ],
  "Tropical Cyclones": [
    "Conduct structural wind load assessment",
    "Install storm shutters and impact-resistant glazing",
    "Develop and test cyclone emergency response plan",
  ],
  "Thunderstorms & Lightning": [
    "Install or upgrade lightning protection system",
    "Install surge protection on all critical equipment",
    "Implement uninterruptible power supply (UPS)",
  ],
  "Sandstorms / Harmattan": [
    "Install HEPA dust filtration on all HVAC intakes",
    "Seal all equipment enclosures to IP54 minimum",
    "Implement seasonal maintenance schedule",
  ],
  "Heavy Rainfall": [
    "Inspect and upgrade roof drainage capacity",
    "Install waterproof seals on external penetrations",
    "Develop flood response and recovery procedures",
  ],
  "River Flooding": [
    "Install perimeter flood barriers",
    "Elevate critical equipment above 1-in-100yr level",
    "Develop flood early warning monitoring system",
  ],
  "Flash Flooding": [
    "Install enhanced surface drainage and sump pumps",
    "Raise ground floor electrical infrastructure",
    "Implement real-time rainfall monitoring",
  ],
  "Coastal Flooding": [
    "Install temporary or permanent flood barriers",
    "Raise critical equipment above flood line",
    "Develop coastal flood emergency response plan",
  ],
  "Storm Surge": [
    "Install storm surge barriers",
    "Develop storm surge evacuation procedures",
    "Relocate critical systems above surge level",
  ],
  "Coastal & Riverbank Erosion": [
    "Commission shoreline protection survey",
    "Install revetment or gabion protection works",
    "Monitor shoreline change annually",
  ],
  "Groundwater Flooding": [
    "Install sump pumps and French drains",
    "Waterproof basement and below-grade structures",
    "Install groundwater level monitoring",
  ],
  "Sea Level Rise": [
    "Conduct long-term coastal adaptation planning",
    "Develop 10-year and 30-year relocation roadmap",
    "Raise foundation levels in new construction",
  ],
  Desertification: [
    "Implement dust and air quality monitoring",
    "Establish green buffer zone around facility",
    "Upgrade air filtration systems",
  ],
  "Wildfire / Bushfire": [
    "Clear vegetation buffer zone around perimeter",
    "Install fire suppression systems",
    "Develop wildfire emergency response plan",
  ],
  "Water Scarcity": [
    "Conduct water audit and conservation measures",
    "Install water recycling and rainwater harvesting",
    "Secure alternative water supply agreements",
  ],
  Tsunamis: [
    "Develop tsunami early warning procedures",
    "Install evacuation signage and routes",
    "Raise critical equipment above inundation level",
  ],
  "Glacial Retreat": [
    "Monitor downstream water supply dependencies",
    "Diversify water sources away from glacial systems",
    "Include in long-term supply chain review",
  ],
  Earthquakes: [
    "Conduct structural seismic assessment",
    "Implement equipment anchoring and bracing",
    "Develop earthquake emergency response plan",
  ],
  "Volcanic Eruptions": [
    "Monitor Smithsonian GVP alert levels",
    "Develop ash fall response plan",
    "Include in business continuity plan",
  ],
  Landslides: [
    "Conduct slope stability assessment",
    "Install slope monitoring instrumentation",
    "Implement drainage improvements on slopes",
  ],
};

// ──────────────────────────────────────────────────────────────────
// 9. MONITORING_CONFIG
// ──────────────────────────────────────────────────────────────────

export interface MonitoringEntry {
  kpi: string;
  trigger: string;
  review_freq: string;
  data_source: string;
  owner_role: string;
  owner_name: string;
}

export const MONITORING_CONFIG: Record<string, MonitoringEntry> = {
  "Extreme Heat": {
    kpi: "Maximum daily temperature (°C) and cooling system uptime (%)",
    trigger: "Temperature exceeds 40°C for 3+ consecutive days",
    review_freq: "Monthly during hot season",
    data_source: "NIMET / NiMet alerts",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  Drought: {
    kpi: "Monthly rainfall (mm) vs historical average",
    trigger: "SPI index below -1.0 for 2+ consecutive months",
    review_freq: "Monthly",
    data_source: "NIMET / NASA POWER",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  "Tropical Cyclones": {
    kpi: "Atlantic storm activity index, NOAA seasonal forecast",
    trigger: "Named storm within 1000km",
    review_freq: "Weekly during Jun-Nov",
    data_source: "NOAA National Hurricane Center",
    owner_role: "Emergency Response Coordinator",
    owner_name: "[Insert Name]",
  },
  "Thunderstorms & Lightning": {
    kpi: "Lightning strike incidents per month at each site",
    trigger: "Strike within 5km or equipment damage incident",
    review_freq: "After each significant storm",
    data_source: "Internal incident log / Earth Networks",
    owner_role: "ICT Infrastructure Manager",
    owner_name: "[Insert Name]",
  },
  "Sandstorms / Harmattan": {
    kpi: "Air quality index (PM2.5 µg/m³) at each site",
    trigger: "PM2.5 exceeds 150 µg/m³ or filter replacement due",
    review_freq: "Monthly (Nov-Mar)",
    data_source: "IQAir / NIMET Dust Forecast",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  "Heavy Rainfall": {
    kpi: "Monthly rainfall total vs drainage capacity threshold",
    trigger: "Rainfall exceeds 100mm/24hr",
    review_freq: "Monthly during rainy season",
    data_source: "NIMET / CHIRPS",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  "River Flooding": {
    kpi: "River level at nearest gauge (metres above datum)",
    trigger: "Level reaches 80% of 1-in-10yr flood level",
    review_freq: "Weekly during May-Oct",
    data_source: "NIHSA River Level Monitoring",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  "Flash Flooding": {
    kpi: "Flood incidents per site per rainy season",
    trigger: "Surface flooding reaches ground floor threshold",
    review_freq: "After each heavy rainfall",
    data_source: "Internal log / LASEMA alerts",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  "Coastal Flooding": {
    kpi: "Tidal gauge reading (metres)",
    trigger: "Tidal level exceeds 0.5m above chart datum",
    review_freq: "Monthly",
    data_source: "NPA Tidal Records",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  "Storm Surge": {
    kpi: "Surge height at nearest coastal station (metres)",
    trigger: "Storm surge warning issued",
    review_freq: "During Atlantic storm season",
    data_source: "NIMET Coastal Hazard Alerts",
    owner_role: "Emergency Response Coordinator",
    owner_name: "[Insert Name]",
  },
  "Coastal & Riverbank Erosion": {
    kpi: "Shoreline position change (m/yr) by survey",
    trigger: "Shoreline retreats >1m from baseline",
    review_freq: "Annual survey",
    data_source: "Annual survey / Satellite imagery",
    owner_role: "Property Manager",
    owner_name: "[Insert Name]",
  },
  "Groundwater Flooding": {
    kpi: "Groundwater table depth (m) at site boundary",
    trigger: "Water table rises within 0.5m of basement slab",
    review_freq: "Monthly during wet season",
    data_source: "Site monitoring well / NGSA",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  "Sea Level Rise": {
    kpi: "IPCC AR6 sea level projection vs 10-year asset plan",
    trigger: "New IPCC report issued or tidal records show >5mm/yr",
    review_freq: "Every 5 years",
    data_source: "IPCC AR6 / NASA Sea Level",
    owner_role: "Chief Risk Officer",
    owner_name: "[Insert Name]",
  },
  Desertification: {
    kpi: "Annual rainfall trend vs 30-year average",
    trigger: "Annual rainfall 20% below 30-yr average for 3+ years",
    review_freq: "Annual",
    data_source: "NIMET / NASA POWER",
    owner_role: "Sustainability Manager",
    owner_name: "[Insert Name]",
  },
  "Wildfire / Bushfire": {
    kpi: "Fire incidents within 5km of facility per season",
    trigger: "Active fire detected within 2km",
    review_freq: "Monthly (Nov-Mar dry season)",
    data_source: "NASA FIRMS Fire Alerts",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  "Water Scarcity": {
    kpi: "Daily water consumption vs storage reserve (days)",
    trigger: "Reserve drops below 7-day supply",
    review_freq: "Monthly",
    data_source: "Internal meter / Water Board",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  Tsunamis: {
    kpi: "NOAA Tsunami Warning Center alert status",
    trigger: "Tsunami watch or warning issued for Atlantic coast",
    review_freq: "Annual drill",
    data_source: "NOAA Tsunami Warning System",
    owner_role: "Emergency Response Coordinator",
    owner_name: "[Insert Name]",
  },
  "Glacial Retreat": {
    kpi: "WGMS glacier mass balance report (annual)",
    trigger: "New WGMS report shows >5% mass loss per decade",
    review_freq: "Every 5 years",
    data_source: "WGMS Annual Report",
    owner_role: "Sustainability Manager",
    owner_name: "[Insert Name]",
  },
  Earthquakes: {
    kpi: "USGS seismic activity within 100km (M4+ events/yr)",
    trigger: "M4.0+ earthquake detected within 100km",
    review_freq: "Annual structural inspection",
    data_source: "USGS Earthquake Program",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
  "Volcanic Eruptions": {
    kpi: "Smithsonian GVP alert level for nearest volcano",
    trigger: "Alert level elevated to Yellow or above",
    review_freq: "Annual",
    data_source: "Smithsonian GVP / USGS",
    owner_role: "Chief Risk Officer",
    owner_name: "[Insert Name]",
  },
  Landslides: {
    kpi: "Rainfall intensity at slope locations (mm/hr)",
    trigger: "Rainfall exceeds 50mm/hr at slope location",
    review_freq: "Annual site inspection",
    data_source: "Site monitoring / NIMET",
    owner_role: "Facilities Manager",
    owner_name: "[Insert Name]",
  },
};

// ──────────────────────────────────────────────────────────────────
// 10. RATING_ORDER
// ──────────────────────────────────────────────────────────────────

export const RATING_ORDER: Record<string, number> = {
  Negligible: 1,
  Low: 2,
  Medium: 3,
  High: 4,
  "Very High": 5,
  Extreme: 6,
};

// ──────────────────────────────────────────────────────────────────
// 11. HAZARD_RATING_COLORS (from generate_heatmap_html)
// ──────────────────────────────────────────────────────────────────

export const HAZARD_RATING_COLORS: Record<string, string> = {
  Extreme: "#8B0000",
  "Very High": "#CC0000",
  High: "#FF6600",
  Medium: "#FFA500",
  Low: "#FFD700",
  Negligible: "#90EE90",
};

export const HAZARD_RATING_TEXT_COLORS: Record<string, string> = {
  Extreme: "#FFFFFF",
  "Very High": "#FFFFFF",
  High: "#FFFFFF",
  Medium: "#000000",
  Low: "#000000",
  Negligible: "#000000",
};

// ──────────────────────────────────────────────────────────────────
// 12. RISK_APPETITE
// ──────────────────────────────────────────────────────────────────

export const RISK_APPETITE: Record<string, string> = {
  Extreme: "CRITICAL — Immediate action required",
  "Very High": "HIGH — Action required within 30 days",
  High: "ELEVATED — Action within 90 days",
  Medium: "MODERATE — Monitor and plan response",
  Low: "LOW — Accept and monitor",
  Negligible: "NEGLIGIBLE — Accept",
};

// ──────────────────────────────────────────────────────────────────
// 13. ALRA_MEASURE_CONTRIBUTIONS
// ──────────────────────────────────────────────────────────────────

export const ALRA_MEASURE_CONTRIBUTIONS: Record<
  string,
  Record<string, number>
> = {
  reinforced_concrete: {
    "Tropical Cyclones": 0.2,
    "Heavy Rainfall": 0.1,
    "Storm Surge": 0.1,
    "Coastal Flooding": 0.1,
  },
  elevated_ground_floor: {
    "Flash Flooding": 0.3,
    "Coastal Flooding": 0.3,
    "Storm Surge": 0.3,
    "River Flooding": 0.25,
    "Groundwater Flooding": 0.2,
  },
  flood_barriers: {
    "Flash Flooding": 0.35,
    "Coastal Flooding": 0.35,
    "Storm Surge": 0.35,
    "River Flooding": 0.3,
  },
  waterproofed_basement: {
    "Groundwater Flooding": 0.25,
    "Flash Flooding": 0.2,
    "River Flooding": 0.15,
  },
  anti_corrosion: {
    "Coastal & Riverbank Erosion": 0.15,
    "Sandstorms / Harmattan": 0.1,
  },
  storm_shutters: { "Tropical Cyclones": 0.2, "Heavy Rainfall": 0.15 },
  n1_redundant_cooling: {
    "Extreme Heat": 0.35,
    "Water Scarcity": 0.2,
    Drought: 0.15,
  },
  backup_generators_72hr: {
    "Thunderstorms & Lightning": 0.25,
    "Flash Flooding": 0.1,
    "Heavy Rainfall": 0.1,
    "Extreme Heat": 0.1,
  },
  ups_systems: { "Thunderstorms & Lightning": 0.2, "Extreme Heat": 0.05 },
  lightning_protection: { "Thunderstorms & Lightning": 0.4 },
  sealed_enclosures: { "Sandstorms / Harmattan": 0.3, "Heavy Rainfall": 0.15 },
  dust_filtration: { "Sandstorms / Harmattan": 0.3, Desertification: 0.1 },
  water_cooling_backup: {
    "Extreme Heat": 0.2,
    Drought: 0.2,
    "Water Scarcity": 0.15,
  },
  bcp_tested: {
    "Extreme Heat": 0.1,
    "Flash Flooding": 0.1,
    "Heavy Rainfall": 0.1,
    "Tropical Cyclones": 0.1,
    "Thunderstorms & Lightning": 0.05,
  },
  remote_monitoring: {
    "Extreme Heat": 0.05,
    "Flash Flooding": 0.05,
    "Groundwater Flooding": 0.05,
  },
  maintenance_programme: {
    "Sandstorms / Harmattan": 0.15,
    "Extreme Heat": 0.1,
    "Heavy Rainfall": 0.05,
  },
  staff_emergency_training: {
    "Tropical Cyclones": 0.1,
    "Flash Flooding": 0.08,
    "Heavy Rainfall": 0.05,
  },
  evacuation_procedures: {
    "Tropical Cyclones": 0.1,
    Tsunamis: 0.1,
    "Flash Flooding": 0.08,
  },
  water_storage_7days: { Drought: 0.3, "Water Scarcity": 0.3 },
  rainwater_harvesting: { "Water Scarcity": 0.15, Drought: 0.1 },
  enhanced_drainage: {
    "Flash Flooding": 0.3,
    "Groundwater Flooding": 0.25,
    "Heavy Rainfall": 0.2,
  },
  sump_pumps: { "Groundwater Flooding": 0.25, "Flash Flooding": 0.15 },
  perimeter_drainage: {
    "Flash Flooding": 0.25,
    "River Flooding": 0.2,
    "Heavy Rainfall": 0.15,
  },
  seawall_500m: {
    "Coastal Flooding": 0.3,
    "Storm Surge": 0.3,
    "Coastal & Riverbank Erosion": 0.2,
  },
  shoreline_protection: {
    "Coastal & Riverbank Erosion": 0.25,
    "Coastal Flooding": 0.15,
  },
  foundation_piling: {
    "Groundwater Flooding": 0.2,
    "Sea Level Rise": 0.15,
    "Coastal & Riverbank Erosion": 0.15,
  },
  mangrove_buffer: { "Coastal & Riverbank Erosion": 0.15, "Storm Surge": 0.1 },
  property_insurance: {
    "Extreme Heat": 0.08,
    "Heavy Rainfall": 0.08,
    "Flash Flooding": 0.08,
    "Coastal Flooding": 0.08,
    "Storm Surge": 0.08,
    "Tropical Cyclones": 0.08,
    Tsunamis: 0.08,
    "Wildfire / Bushfire": 0.08,
  },
  bi_insurance: {
    "Extreme Heat": 0.05,
    "Flash Flooding": 0.05,
    "Heavy Rainfall": 0.05,
    Drought: 0.05,
    "Water Scarcity": 0.05,
  },
  cat_parametric_cover: {
    "Tropical Cyclones": 0.15,
    Tsunamis: 0.15,
    "Storm Surge": 0.1,
    "Coastal Flooding": 0.1,
  },
};

// ──────────────────────────────────────────────────────────────────
// 14. FUNCTIONS — build_matrix_config, get_rating, scale_score
// ──────────────────────────────────────────────────────────────────

export interface MatrixConfig {
  size: number;
  matrix: Record<string, string>; // key: "i,f" → rating
  intensity_labels: Record<number, string>;
  frequency_labels: Record<number, string>;
  rating_labels: string[];
  max_score: number;
}

export function buildMatrixConfig(size: number): MatrixConfig {
  size = Math.floor(size);

  if (size === 3) {
    return {
      size: 3,
      matrix: {
        "3,3": "High",
        "3,2": "High",
        "3,1": "Medium",
        "2,3": "High",
        "2,2": "Medium",
        "2,1": "Low",
        "1,3": "Medium",
        "1,2": "Low",
        "1,1": "Low",
      },
      intensity_labels: { 1: "Low", 2: "Medium", 3: "High" },
      frequency_labels: { 1: "Rare", 2: "Occasional", 3: "Frequent" },
      rating_labels: ["Low", "Medium", "High"],
      max_score: 3,
    };
  }

  if (size === 4) {
    return {
      size: 4,
      matrix: {
        "4,4": "Very High",
        "4,3": "Very High",
        "4,2": "High",
        "4,1": "High",
        "3,4": "Very High",
        "3,3": "High",
        "3,2": "High",
        "3,1": "Medium",
        "2,4": "High",
        "2,3": "Medium",
        "2,2": "Medium",
        "2,1": "Low",
        "1,4": "Medium",
        "1,3": "Low",
        "1,2": "Low",
        "1,1": "Low",
      },
      intensity_labels: { 1: "Low", 2: "Medium", 3: "High", 4: "Very High" },
      frequency_labels: {
        1: "Rare",
        2: "Occasional",
        3: "Frequent",
        4: "Very Frequent",
      },
      rating_labels: ["Low", "Medium", "High", "Very High"],
      max_score: 4,
    };
  }

  if (size === 5) {
    return {
      size: 5,
      matrix: {
        "5,5": "Very High",
        "5,4": "Very High",
        "5,3": "High",
        "5,2": "High",
        "5,1": "Medium",
        "4,5": "Very High",
        "4,4": "High",
        "4,3": "High",
        "4,2": "Medium",
        "4,1": "Medium",
        "3,5": "High",
        "3,4": "High",
        "3,3": "Medium",
        "3,2": "Medium",
        "3,1": "Low",
        "2,5": "Medium",
        "2,4": "Medium",
        "2,3": "Low",
        "2,2": "Low",
        "2,1": "Negligible",
        "1,5": "Low",
        "1,4": "Low",
        "1,3": "Negligible",
        "1,2": "Negligible",
        "1,1": "Negligible",
      },
      intensity_labels: {
        1: "Negligible",
        2: "Low",
        3: "Medium",
        4: "High",
        5: "Very High",
      },
      frequency_labels: {
        1: "Very Rare",
        2: "Rare",
        3: "Occasional",
        4: "Frequent",
        5: "Very Frequent",
      },
      rating_labels: ["Negligible", "Low", "Medium", "High", "Very High"],
      max_score: 5,
    };
  }

  // Default: 6×6
  return {
    size: 6,
    matrix: {
      "6,6": "Extreme",
      "6,5": "Extreme",
      "6,4": "Very High",
      "6,3": "Very High",
      "6,2": "High",
      "6,1": "High",
      "5,6": "Extreme",
      "5,5": "Very High",
      "5,4": "Very High",
      "5,3": "High",
      "5,2": "High",
      "5,1": "Medium",
      "4,6": "Very High",
      "4,5": "Very High",
      "4,4": "High",
      "4,3": "High",
      "4,2": "Medium",
      "4,1": "Medium",
      "3,6": "High",
      "3,5": "High",
      "3,4": "Medium",
      "3,3": "Medium",
      "3,2": "Low",
      "3,1": "Low",
      "2,6": "Medium",
      "2,5": "Medium",
      "2,4": "Low",
      "2,3": "Low",
      "2,2": "Negligible",
      "2,1": "Negligible",
      "1,6": "Low",
      "1,5": "Low",
      "1,4": "Negligible",
      "1,3": "Negligible",
      "1,2": "Negligible",
      "1,1": "Negligible",
    },
    intensity_labels: {
      1: "Negligible",
      2: "Low",
      3: "Medium",
      4: "High",
      5: "Very High",
      6: "Extreme",
    },
    frequency_labels: {
      1: "Very Rare",
      2: "Rare",
      3: "Occasional",
      4: "Frequent",
      5: "Very Frequent",
      6: "Almost Certain",
    },
    rating_labels: [
      "Negligible",
      "Low",
      "Medium",
      "High",
      "Very High",
      "Extreme",
    ],
    max_score: 6,
  };
}

export function getRating(
  mc: MatrixConfig,
  iScore: number,
  fScore: number,
): string {
  const maxS = mc.size;
  iScore = Math.max(1, Math.min(maxS, iScore));
  fScore = Math.max(1, Math.min(maxS, fScore));
  return mc.matrix[`${iScore},${fScore}`] || "Low";
}

export function scaleScore(
  rawScore: number,
  rawMax: number,
  targetMax: number,
): number {
  if (rawMax === targetMax) return rawScore;
  const scaled = Math.round((rawScore / rawMax) * targetMax);
  return Math.max(1, Math.min(targetMax, scaled));
}

// ──────────────────────────────────────────────────────────────────
// 15. enrich_results — Full enrichment logic
// ──────────────────────────────────────────────────────────────────
//
// Python formula (exact port):
//
// function enrichResults(allResults, mc, assetRegister, alraRegister,
//                        sectorName, subsectorName, usdRate, vulnMethod) {
//   const enriched = [];
//   const benchmarksCache = {};
//
//   for (const r of allResults) {
//     if (!r) continue;
//     const assetName   = r.asset;
//     const risk        = r.risk;
//     const hazardRating = r.hazard_rating;
//     const freqLabel   = r.frequency_label;
//     const iScore      = r.intensity_score;
//     const fScore      = r.frequency_score;
//
//     const assetInfo   = assetRegister[assetName] || {};
//     const assetValue  = assetInfo.value_ngn || 0;
//     const assetType   = assetInfo.asset_type || "Office Building";
//
//     // Step 4: Exposure
//     const ef           = getEf(hazardRating, assetType);
//     const exposedValue = Math.round(assetValue * ef);
//     const annualProb   = getAnnualProbability(freqLabel);
//
//     // Step 5: Vulnerability
//     const inherentV = getInherentVulnerability(risk, assetType);
//
//     const sbraRrf  = getSbraRrf(risk, assetType, sectorName, subsectorName, benchmarksCache);
//     const sbraNetV = Math.round(inherentV * (1 - sbraRrf) * 1000) / 1000;
//
//     let alraRrf    = null;
//     let alraNetV   = null;
//
//     if (vulnMethod === "ALRA" || vulnMethod === "BOTH") {
//       const alraRrfVal = getAlraRrf(assetName, risk, alraRegister);
//       if (alraRrfVal !== null) {
//         alraRrf  = alraRrfVal;
//         alraNetV = Math.round(inherentV * (1 - alraRrf) * 1000) / 1000;
//       } else {
//         alraRrf  = sbraRrf;
//         alraNetV = sbraNetV;
//       }
//     }
//     if (vulnMethod === "SBRA") {
//       alraRrf  = sbraRrf;
//       alraNetV = sbraNetV;
//     }
//
//     // Step 6: Risk Score
//     const maxSize = mc.size;
//     function riskScore(netV) {
//       const vScaled = Math.max(1, Math.min(maxSize, Math.round(netV * maxSize)));
//       const raw     = iScore * fScore * vScaled;
//       const norm    = Math.round((raw / (maxSize ** 3)) * 100 * 10) / 10;
//       return { raw, norm };
//     }
//
//     const { raw: rawSbra, norm: normSbra } = riskScore(sbraNetV);
//     const { raw: rawAlra, norm: normAlra } = riskScore(alraNetV);
//
//     // Step 6: Financial Loss
//     const sslSbraNgn = Math.round(assetValue * ef * sbraNetV);
//     const sslAlraNgn = Math.round(assetValue * ef * alraNetV);
//     const ealSbraNgn = Math.round(sslSbraNgn * annualProb);
//     const ealAlraNgn = Math.round(sslAlraNgn * annualProb);
//     const sslSbraUsd = Math.round(sslSbraNgn / usdRate);
//     const sslAlraUsd = Math.round(sslAlraNgn / usdRate);
//     const ealSbraUsd = Math.round(ealSbraNgn / usdRate);
//     const ealAlraUsd = Math.round(ealAlraNgn / usdRate);
//
//     enriched.push({
//       ...r,
//       asset_value_ngn: assetValue,
//       asset_value_usd: Math.round(assetValue / usdRate),
//       asset_type: assetType,
//       exposure_factor: ef,
//       exposed_value_ngn: exposedValue,
//       exposed_value_usd: Math.round(exposedValue / usdRate),
//       inherent_vulnerability: inherentV,
//       sbra_rrf: sbraRrf,
//       sbra_net_vulnerability: sbraNetV,
//       alra_rrf: alraRrf,
//       alra_net_vulnerability: alraNetV,
//       annual_probability: annualProb,
//       risk_score_raw_sbra: rawSbra,
//       risk_score_norm_sbra: normSbra,
//       risk_score_raw_alra: rawAlra,
//       risk_score_norm_alra: normAlra,
//       ssl_sbra_ngn: sslSbraNgn,
//       ssl_sbra_usd: sslSbraUsd,
//       ssl_alra_ngn: sslAlraNgn,
//       ssl_alra_usd: sslAlraUsd,
//       eal_sbra_ngn: ealSbraNgn,
//       eal_sbra_usd: ealSbraUsd,
//       eal_alra_ngn: ealAlraNgn,
//       eal_alra_usd: ealAlraUsd,
//     });
//   }
//   return enriched;
// }
//
// ──────────────────────────────────────────────────────────────────
// 16. getSbraRrf — SBRA RRF calculation
// ──────────────────────────────────────────────────────────────────
//
// function getSbraRrf(risk, assetType, sectorName, subsectorName, cache) {
//   const cacheKey = `${sectorName}|${subsectorName}|${assetType}|${risk}`;
//   if (cache[cacheKey] !== undefined) return cache[cacheKey];
//
//   const sectorTable = SBRA_BASE_RRF[sectorName] || SBRA_BASE_RRF["Government & Public Sector"];
//   const baseRrf = sectorTable[assetType] ?? 0.25;
//   const subAdj  = SUBSECTOR_ADJ[subsectorName] ?? SUBSECTOR_ADJ["__default__"];
//   const riskMod = (SECTOR_RISK_MODIFIERS[sectorName] || DEFAULT_RISK_MODIFIERS)[risk] ?? 0.00;
//
//   let finalRrf = baseRrf + subAdj + riskMod;
//   finalRrf = Math.round(Math.max(0.10, Math.min(0.70, finalRrf)) * 100) / 100;
//
//   cache[cacheKey] = finalRrf;
//   return finalRrf;
// }
//
// ──────────────────────────────────────────────────────────────────
// 17. getAlraRrf
// ──────────────────────────────────────────────────────────────────
//
// function getAlraRrf(assetName, risk, alraRegister) {
//   if (!alraRegister || !alraRegister[assetName]) return null;
//   const register = alraRegister[assetName];
//   let totalRrf = 0.0;
//   for (const [measure, inPlace] of Object.entries(register)) {
//     if (inPlace) {
//       const contributions = ALRA_MEASURE_CONTRIBUTIONS[measure] || {};
//       totalRrf += contributions[risk] || 0.0;
//     }
//   }
//   return Math.round(Math.max(0.10, Math.min(0.70, totalRrf)) * 100) / 100;
// }
//
// ──────────────────────────────────────────────────────────────────
// 18. calculateResidualRisk
// ──────────────────────────────────────────────────────────────────
//
// function calculateResidualRisk(riskScoreNorm, reductionFactor) {
//   const residualScore = Math.round(riskScoreNorm * (1 - reductionFactor) * 10) / 10;
//   let residualRating;
//   if (residualScore >= 80) residualRating = "Extreme";
//   else if (residualScore >= 60) residualRating = "Very High";
//   else if (residualScore >= 40) residualRating = "High";
//   else if (residualScore >= 20) residualRating = "Medium";
//   else if (residualScore >= 5)  residualRating = "Low";
//   else residualRating = "Negligible";
//   return { residualScore, residualRating };
// }
