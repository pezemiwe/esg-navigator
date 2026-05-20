/**
 * Ghana Demo Seed Data — 40 assets across ALL 8 asset types.
 * Temporary: remove after demo.
 *
 * All borrowers, sectors, and regions are Ghana-specific.
 */

import type { Asset, AssetTypeData } from "@/types/craTypes";

/* ── Coordinate bounding box for Ghana (approx) ──────── */
function ghanaCoord(region: string): { lat: number; lng: number } {
  const map: Record<string, [number, number]> = {
    "Greater Accra": [5.6037, -0.187],
    Ashanti: [6.6885, -1.6244],
    Western: [5.0527, -1.7545],
    Eastern: [6.0902, -0.4561],
    Central: [5.158, -1.1558],
    Northern: [9.4034, -0.8393],
    Volta: [6.6169, 0.4703],
    Bono: [7.4936, -2.3484],
    "Upper East": [10.7069, -0.982],
    Savannah: [9.0643, -1.3933],
  };
  const [lat, lng] = map[region] ?? [6.7, -1.5];
  return {
    lat: lat + (Math.random() - 0.5) * 0.15,
    lng: lng + (Math.random() - 0.5) * 0.15,
  };
}

function tag(items: Omit<Asset, "latitude" | "longitude">[]): Asset[] {
  return items.map((item) => {
    const { lat, lng } = ghanaCoord(item.region as string);
    return {
      ...item,
      country: "Ghana",
      latitude: lat,
      longitude: lng,
    } as unknown as Asset;
  });
}

/* ─────────────────────────────────────────────────────── */
/*  LOANS & ADVANCES — 10 assets                         */
/* ─────────────────────────────────────────────────────── */
const LOANS: Asset[] = tag([
  {
    id: "GH-LN-001",
    borrowerName: "Golden Star Resources Ltd",
    sector: "Mining & Extractives",
    region: "Western",
    outstandingBalance: 45_000_000,
    currency: "GHS",
    status: "Performing",
    maturityDate: "2029-06-30",
  },
  {
    id: "GH-LN-002",
    borrowerName: "Kumasi Brewing Company",
    sector: "Manufacturing",
    region: "Ashanti",
    outstandingBalance: 18_500_000,
    currency: "GHS",
    status: "Performing",
    maturityDate: "2028-03-15",
  },
  {
    id: "GH-LN-003",
    borrowerName: "Volta River Estates Ltd",
    sector: "Agriculture",
    region: "Volta",
    outstandingBalance: 12_300_000,
    currency: "GHS",
    status: "Performing",
    maturityDate: "2027-12-31",
  },
  {
    id: "GH-LN-004",
    borrowerName: "Ghana Oil Company (GOIL)",
    sector: "Oil & Gas",
    region: "Greater Accra",
    outstandingBalance: 62_000_000,
    currency: "GHS",
    status: "Performing",
    maturityDate: "2030-09-30",
  },
  {
    id: "GH-LN-005",
    borrowerName: "Accra Mall Development Corp",
    sector: "Real Estate & Construction",
    region: "Greater Accra",
    outstandingBalance: 38_000_000,
    currency: "GHS",
    status: "Watch",
    maturityDate: "2028-11-30",
  },
  {
    id: "GH-LN-006",
    borrowerName: "Kasapreko Company Ltd",
    sector: "Manufacturing",
    region: "Greater Accra",
    outstandingBalance: 15_800_000,
    currency: "GHS",
    status: "Performing",
    maturityDate: "2027-07-15",
  },
  {
    id: "GH-LN-007",
    borrowerName: "Bui Power Authority",
    sector: "Energy & Utilities",
    region: "Bono",
    outstandingBalance: 85_000_000,
    currency: "GHS",
    status: "Performing",
    maturityDate: "2032-12-31",
  },
  {
    id: "GH-LN-008",
    borrowerName: "ScanCom Ltd (MTN Ghana)",
    sector: "Telecommunications",
    region: "Greater Accra",
    outstandingBalance: 55_000_000,
    currency: "GHS",
    status: "Performing",
    maturityDate: "2029-03-31",
  },
  {
    id: "GH-LN-009",
    borrowerName: "Korle-Bu Teaching Hospital",
    sector: "Health & Pharmaceuticals",
    region: "Greater Accra",
    outstandingBalance: 22_000_000,
    currency: "GHS",
    status: "Performing",
    maturityDate: "2028-06-30",
  },
  {
    id: "GH-LN-010",
    borrowerName: "West Africa Agri-Processing",
    sector: "Agriculture",
    region: "Northern",
    outstandingBalance: 9_500_000,
    currency: "GHS",
    status: "Watch",
    maturityDate: "2027-09-30",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  EQUITIES — 5 assets                                   */
/* ─────────────────────────────────────────────────────── */
const EQUITIES: Asset[] = tag([
  {
    id: "GH-EQ-001",
    borrowerName: "Agricultural Development Bank",
    sector: "Financial Services",
    region: "Greater Accra",
    outstandingBalance: 28_000_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-EQ-002",
    borrowerName: "AngloGold Ashanti (Ghana)",
    sector: "Mining & Extractives",
    region: "Ashanti",
    outstandingBalance: 72_000_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-EQ-003",
    borrowerName: "Fan Milk Ghana Ltd",
    sector: "Retail & Consumer Goods",
    region: "Greater Accra",
    outstandingBalance: 14_500_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-EQ-004",
    borrowerName: "Tullow Oil Ghana",
    sector: "Oil & Gas",
    region: "Western",
    outstandingBalance: 95_000_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-EQ-005",
    borrowerName: "Enterprise Group Ltd",
    sector: "Financial Services",
    region: "Greater Accra",
    outstandingBalance: 19_000_000,
    currency: "GHS",
    status: "Active",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  BONDS / FIXED INCOME — 5 assets                       */
/* ─────────────────────────────────────────────────────── */
const BONDS: Asset[] = tag([
  {
    id: "GH-BD-001",
    borrowerName: "Government of Ghana (GoG Bond 2028)",
    sector: "Sovereign",
    region: "Greater Accra",
    outstandingBalance: 120_000_000,
    currency: "GHS",
    status: "Active",
    maturityDate: "2028-12-31",
  },
  {
    id: "GH-BD-002",
    borrowerName: "Ghana Cocoa Board (COCOBOD)",
    sector: "Agriculture",
    region: "Greater Accra",
    outstandingBalance: 35_000_000,
    currency: "GHS",
    status: "Active",
    maturityDate: "2027-09-15",
  },
  {
    id: "GH-BD-003",
    borrowerName: "ECG Infrastructure Bond",
    sector: "Energy & Utilities",
    region: "Greater Accra",
    outstandingBalance: 48_000_000,
    currency: "GHS",
    status: "Active",
    maturityDate: "2030-06-30",
  },
  {
    id: "GH-BD-004",
    borrowerName: "Dalex Finance & Leasing",
    sector: "Financial Services",
    region: "Greater Accra",
    outstandingBalance: 8_500_000,
    currency: "GHS",
    status: "Active",
    maturityDate: "2027-03-31",
  },
  {
    id: "GH-BD-005",
    borrowerName: "GCB Bank Corporate Bond",
    sector: "Financial Services",
    region: "Greater Accra",
    outstandingBalance: 25_000_000,
    currency: "GHS",
    status: "Active",
    maturityDate: "2029-06-30",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  DERIVATIVES — 4 assets                                */
/* ─────────────────────────────────────────────────────── */
const DERIVATIVES: Asset[] = tag([
  {
    id: "GH-DV-001",
    borrowerName: "Cocoa Forward Hedge (COCOBOD)",
    sector: "Agriculture",
    region: "Greater Accra",
    outstandingBalance: 32_000_000,
    currency: "GHS",
    status: "Active",
    maturityDate: "2027-06-30",
  },
  {
    id: "GH-DV-002",
    borrowerName: "Gold Futures (AngloGold)",
    sector: "Mining & Extractives",
    region: "Ashanti",
    outstandingBalance: 58_000_000,
    currency: "GHS",
    status: "Active",
    maturityDate: "2027-12-31",
  },
  {
    id: "GH-DV-003",
    borrowerName: "FX Swap — USD/GHS (GCB Bank)",
    sector: "Financial Services",
    region: "Greater Accra",
    outstandingBalance: 42_000_000,
    currency: "GHS",
    status: "Active",
    maturityDate: "2026-12-15",
  },
  {
    id: "GH-DV-004",
    borrowerName: "Interest Rate Swap (Ecobank Ghana)",
    sector: "Financial Services",
    region: "Greater Accra",
    outstandingBalance: 18_500_000,
    currency: "GHS",
    status: "Active",
    maturityDate: "2028-03-31",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  GUARANTEES / OFF-BALANCE SHEET — 3 assets             */
/* ─────────────────────────────────────────────────────── */
const GUARANTEES: Asset[] = tag([
  {
    id: "GH-GT-001",
    borrowerName: "Tema Oil Refinery LC",
    sector: "Oil & Gas",
    region: "Greater Accra",
    outstandingBalance: 25_000_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-GT-002",
    borrowerName: "Ghana Ports Authority Guarantee",
    sector: "Transport & Logistics",
    region: "Greater Accra",
    outstandingBalance: 40_000_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-GT-003",
    borrowerName: "Electricity Company Standby LC",
    sector: "Energy & Utilities",
    region: "Greater Accra",
    outstandingBalance: 15_000_000,
    currency: "GHS",
    status: "Active",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  INVESTMENT PROPERTY — 3 assets                        */
/* ─────────────────────────────────────────────────────── */
const PROPERTY: Asset[] = tag([
  {
    id: "GH-PR-001",
    borrowerName: "GCB Bank Head Office",
    sector: "Real Estate & Construction",
    region: "Greater Accra",
    outstandingBalance: 35_000_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-PR-002",
    borrowerName: "Ridge Tower Commercial Block",
    sector: "Real Estate & Construction",
    region: "Greater Accra",
    outstandingBalance: 22_000_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-PR-003",
    borrowerName: "Kumasi Branch Complex",
    sector: "Real Estate & Construction",
    region: "Ashanti",
    outstandingBalance: 12_000_000,
    currency: "GHS",
    status: "Active",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  DEPOSITS & CASH — 3 assets                            */
/* ─────────────────────────────────────────────────────── */
const DEPOSITS: Asset[] = tag([
  {
    id: "GH-DP-001",
    borrowerName: "Bank of Ghana Placement",
    sector: "Financial Services",
    region: "Greater Accra",
    outstandingBalance: 200_000_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-DP-002",
    borrowerName: "Interbank Placement (Stanbic)",
    sector: "Financial Services",
    region: "Greater Accra",
    outstandingBalance: 75_000_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-DP-003",
    borrowerName: "Treasury Bill Holdings",
    sector: "Sovereign",
    region: "Greater Accra",
    outstandingBalance: 150_000_000,
    currency: "GHS",
    status: "Active",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  INSURANCE & REINSURANCE — 2 assets                    */
/* ─────────────────────────────────────────────────────── */
const INSURANCE: Asset[] = tag([
  {
    id: "GH-IN-001",
    borrowerName: "SIC Insurance Receivable",
    sector: "Financial Services",
    region: "Greater Accra",
    outstandingBalance: 6_500_000,
    currency: "GHS",
    status: "Active",
  },
  {
    id: "GH-IN-002",
    borrowerName: "Enterprise Life Reinsurance",
    sector: "Financial Services",
    region: "Greater Accra",
    outstandingBalance: 11_000_000,
    currency: "GHS",
    status: "Active",
  },
]);

/* ═══════════════════════════════════════════════════════ */
/*  DATA / ICT ASSETS                                      */
/* ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────── */
/*  DATA CENTERS — 2 assets                               */
/* ─────────────────────────────────────────────────────── */
const DATA_CENTERS: Asset[] = tag([
  {
    id: "GH-DC-001",
    borrowerName: "GCB Bank Accra Primary Data Centre",
    sector: "ICT Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 32_000_000,
    currency: "GHS",
    status: "Operational",
    "Tier Level": "Tier III",
    "Capacity (MW)": 0.9,
    "PUE": 1.7,
    "Net Book Value": 32_000_000,
  },
  {
    id: "GH-DC-002",
    borrowerName: "GCB Bank Kumasi Disaster Recovery Site",
    sector: "ICT Infrastructure",
    region: "Ashanti",
    outstandingBalance: 18_000_000,
    currency: "GHS",
    status: "Operational",
    "Tier Level": "Tier II",
    "Capacity (MW)": 0.4,
    "PUE": 1.9,
    "Net Book Value": 18_000_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  SERVER INFRASTRUCTURE — 3 assets                      */
/* ─────────────────────────────────────────────────────── */
const SERVER_INFRA: Asset[] = tag([
  {
    id: "GH-SV-001",
    borrowerName: "Core Banking Server Cluster (Accra)",
    sector: "ICT Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 11_500_000,
    currency: "GHS",
    status: "Active",
    "Type": "Blade Server",
    "Age (Years)": 3,
    "Rack Units": 42,
    "Net Book Value": 11_500_000,
  },
  {
    id: "GH-SV-002",
    borrowerName: "ATM Switch & Middleware Systems",
    sector: "ICT Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 5_800_000,
    currency: "GHS",
    status: "Active",
    "Type": "Rack Server",
    "Age (Years)": 4,
    "Rack Units": 28,
    "Net Book Value": 5_800_000,
  },
  {
    id: "GH-SV-003",
    borrowerName: "Enterprise Storage Infrastructure (SAN/NAS)",
    sector: "ICT Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 7_500_000,
    currency: "GHS",
    status: "Active",
    "Type": "Storage Array",
    "Age (Years)": 2,
    "Rack Units": 14,
    "Net Book Value": 7_500_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  NETWORK EQUIPMENT — 4 assets                          */
/* ─────────────────────────────────────────────────────── */
const NETWORK_EQUIP: Asset[] = tag([
  {
    id: "GH-NE-001",
    borrowerName: "Cisco Core Switches — Accra HQ",
    sector: "ICT Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 2_200_000,
    currency: "GHS",
    status: "Active",
    "Manufacturer": "Cisco",
    "Type": "Core Switch",
    "Net Book Value": 2_200_000,
  },
  {
    id: "GH-NE-002",
    borrowerName: "WAN Edge Routers (SD-WAN Nationwide)",
    sector: "ICT Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 2_650_000,
    currency: "GHS",
    status: "Active",
    "Manufacturer": "Cisco",
    "Type": "WAN Router",
    "Net Book Value": 2_650_000,
  },
  {
    id: "GH-NE-003",
    borrowerName: "FortiGate Firewall Cluster",
    sector: "ICT Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 3_800_000,
    currency: "GHS",
    status: "Active",
    "Manufacturer": "Fortinet",
    "Type": "Next-Gen Firewall",
    "Net Book Value": 3_800_000,
  },
  {
    id: "GH-NE-004",
    borrowerName: "Branch Distribution Network Layer",
    sector: "ICT Infrastructure",
    region: "Ashanti",
    outstandingBalance: 1_150_000,
    currency: "GHS",
    status: "Active",
    "Manufacturer": "HP Aruba",
    "Type": "Distribution Switch",
    "Net Book Value": 1_150_000,
  },
]);

/* ═══════════════════════════════════════════════════════ */
/*  DIRECT OPERATIONS ASSETS                              */
/* ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────── */
/*  OFFICES & FACILITIES — 5 assets                       */
/* ─────────────────────────────────────────────────────── */
const OFFICES: Asset[] = tag([
  {
    id: "GH-OF-001",
    borrowerName: "GCB Bank Head Office — High Street Accra",
    sector: "Direct Operations",
    region: "Greater Accra",
    outstandingBalance: 185_000_000,
    currency: "GHS",
    status: "Owned",
    "Address": "Thorpe Road, High Street, Accra, Ghana",
    "Floor Area (sqm)": 10_200,
    "Energy Consumption (kWh)": 1_920_000,
    "Annual Rent / Book Value": 185_000_000,
  },
  {
    id: "GH-OF-002",
    borrowerName: "Kumasi Adum Regional Centre",
    sector: "Direct Operations",
    region: "Ashanti",
    outstandingBalance: 82_000_000,
    currency: "GHS",
    status: "Owned",
    "Address": "Kejetia Road, Adum, Kumasi, Ashanti Region",
    "Floor Area (sqm)": 4_800,
    "Energy Consumption (kWh)": 740_000,
    "Annual Rent / Book Value": 82_000_000,
  },
  {
    id: "GH-OF-003",
    borrowerName: "Tema Community 1 Branch",
    sector: "Direct Operations",
    region: "Greater Accra",
    outstandingBalance: 38_000_000,
    currency: "GHS",
    status: "Leased",
    "Address": "Fishing Harbour Road, Community 1, Tema",
    "Floor Area (sqm)": 1_800,
    "Energy Consumption (kWh)": 265_000,
    "Annual Rent / Book Value": 38_000_000,
  },
  {
    id: "GH-OF-004",
    borrowerName: "Cape Coast Branch — Castle Road",
    sector: "Direct Operations",
    region: "Central",
    outstandingBalance: 29_500_000,
    currency: "GHS",
    status: "Owned",
    "Address": "Castle Road, Cape Coast, Central Region",
    "Floor Area (sqm)": 1_500,
    "Energy Consumption (kWh)": 210_000,
    "Annual Rent / Book Value": 29_500_000,
  },
  {
    id: "GH-OF-005",
    borrowerName: "Tamale Northern Regional Branch",
    sector: "Direct Operations",
    region: "Northern",
    outstandingBalance: 22_000_000,
    currency: "GHS",
    status: "Leased",
    "Address": "Bolgatanga Road, Tamale, Northern Region",
    "Floor Area (sqm)": 1_100,
    "Energy Consumption (kWh)": 155_000,
    "Annual Rent / Book Value": 22_000_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  COMPANY FLEET — 4 assets                              */
/* ─────────────────────────────────────────────────────── */
const FLEET: Asset[] = tag([
  {
    id: "GH-FL-001",
    borrowerName: "Accra Operations Fleet Pool (10 vehicles)",
    sector: "Direct Operations",
    region: "Greater Accra",
    outstandingBalance: 4_500_000,
    currency: "GHS",
    status: "Active",
    "Fuel Type": "Petrol/Diesel Mix",
    "Annual Km": 380_000,
    "Net Book Value": 4_500_000,
  },
  {
    id: "GH-FL-002",
    borrowerName: "Kumasi & Ashanti Fleet Pool (6 vehicles)",
    sector: "Direct Operations",
    region: "Ashanti",
    outstandingBalance: 2_800_000,
    currency: "GHS",
    status: "Active",
    "Fuel Type": "Petrol/Diesel Mix",
    "Annual Km": 240_000,
    "Net Book Value": 2_800_000,
  },
  {
    id: "GH-FL-003",
    borrowerName: "Cash-in-Transit & Security Vehicles (5 units)",
    sector: "Direct Operations",
    region: "Greater Accra",
    outstandingBalance: 3_600_000,
    currency: "GHS",
    status: "Active",
    "Fuel Type": "Diesel",
    "Annual Km": 160_000,
    "Net Book Value": 3_600_000,
  },
  {
    id: "GH-FL-004",
    borrowerName: "Executive Vehicle Pool (3 vehicles)",
    sector: "Direct Operations",
    region: "Greater Accra",
    outstandingBalance: 2_100_000,
    currency: "GHS",
    status: "Active",
    "Fuel Type": "Petrol",
    "Annual Km": 72_000,
    "Net Book Value": 2_100_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  INDUSTRIAL EQUIPMENT — 3 assets                       */
/* ─────────────────────────────────────────────────────── */
const INDUSTRIAL_EQUIP: Asset[] = tag([
  {
    id: "GH-IE-001",
    borrowerName: "HQ Diesel Generator Set (2×750 kVA)",
    sector: "Direct Operations",
    region: "Greater Accra",
    outstandingBalance: 2_800_000,
    currency: "GHS",
    status: "Operational",
    "Type": "Generator",
    "Capacity": "1.5 MVA total",
    "Fuel Type": "Diesel",
    "Age (Years)": 4,
    "Net Book Value": 2_800_000,
  },
  {
    id: "GH-IE-002",
    borrowerName: "Kumasi Regional Generator (500 kVA)",
    sector: "Direct Operations",
    region: "Ashanti",
    outstandingBalance: 1_350_000,
    currency: "GHS",
    status: "Operational",
    "Type": "Generator",
    "Capacity": "500 kVA",
    "Fuel Type": "Diesel",
    "Age (Years)": 3,
    "Net Book Value": 1_350_000,
  },
  {
    id: "GH-IE-003",
    borrowerName: "UPS & Power Conditioning Systems",
    sector: "Direct Operations",
    region: "Greater Accra",
    outstandingBalance: 1_100_000,
    currency: "GHS",
    status: "Operational",
    "Type": "UPS",
    "Capacity": "400 kVA",
    "Fuel Type": "Electric / Battery",
    "Age (Years)": 2,
    "Net Book Value": 1_100_000,
  },
]);

/* ═══════════════════════════════════════════════════════ */
/*  SUPPLY CHAIN ASSETS                                   */
/* ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────── */
/*  TIER 1 SUPPLIERS — 5 assets                           */
/* ─────────────────────────────────────────────────────── */
const TIER1_SUPPLIERS: Asset[] = tag([
  {
    id: "GH-S1-001",
    borrowerName: "Microsoft Ghana Ltd",
    sector: "ICT Vendor",
    region: "Greater Accra",
    outstandingBalance: 12_000_000,
    currency: "GHS",
    status: "Active",
    "Category": "Software & Cloud",
    "Annual Spend": 12_000_000,
    "Credit Score": "AA",
  },
  {
    id: "GH-S1-002",
    borrowerName: "eTranzact Ghana",
    sector: "Payment Processing",
    region: "Greater Accra",
    outstandingBalance: 14_500_000,
    currency: "GHS",
    status: "Active",
    "Category": "Fintech Services",
    "Annual Spend": 14_500_000,
    "Credit Score": "A",
  },
  {
    id: "GH-S1-003",
    borrowerName: "Huawei Technologies Ghana",
    sector: "Telecoms & ICT",
    region: "Greater Accra",
    outstandingBalance: 9_200_000,
    currency: "GHS",
    status: "Active",
    "Category": "Network Hardware",
    "Annual Spend": 9_200_000,
    "Credit Score": "A",
  },
  {
    id: "GH-S1-004",
    borrowerName: "Serv Technologies (Facilities)",
    sector: "Building Services",
    region: "Greater Accra",
    outstandingBalance: 2_400_000,
    currency: "GHS",
    status: "Active",
    "Category": "Facilities Management",
    "Annual Spend": 2_400_000,
    "Credit Score": "BBB",
  },
  {
    id: "GH-S1-005",
    borrowerName: "G4S Ghana Security Services",
    sector: "Security Services",
    region: "Greater Accra",
    outstandingBalance: 5_800_000,
    currency: "GHS",
    status: "Active",
    "Category": "Security Services",
    "Annual Spend": 5_800_000,
    "Credit Score": "BBB",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  LOGISTICS & TRANSPORT — 3 assets                      */
/* ─────────────────────────────────────────────────────── */
const LOGISTICS: Asset[] = tag([
  {
    id: "GH-LG-001",
    borrowerName: "Ghana Post Courier Services",
    sector: "Logistics",
    region: "Greater Accra",
    outstandingBalance: 780_000,
    currency: "GHS",
    status: "Active",
    "Mode": "Road",
    "Origin Country": "Ghana",
    "Tonnes (CO2e)": 14.2,
    "Annual Spend": 780_000,
  },
  {
    id: "GH-LG-002",
    borrowerName: "DHL Ghana Express",
    sector: "Logistics",
    region: "Greater Accra",
    outstandingBalance: 1_850_000,
    currency: "GHS",
    status: "Active",
    "Mode": "Air/Road",
    "Origin Country": "Ghana",
    "Tonnes (CO2e)": 32.6,
    "Annual Spend": 1_850_000,
  },
  {
    id: "GH-LG-003",
    borrowerName: "Brink's Ghana Cash Management",
    sector: "Security Logistics",
    region: "Greater Accra",
    outstandingBalance: 6_200_000,
    currency: "GHS",
    status: "Active",
    "Mode": "Road (Armoured)",
    "Origin Country": "Ghana",
    "Tonnes (CO2e)": 48.5,
    "Annual Spend": 6_200_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  PROCUREMENT DATA — 6 records                          */
/* ─────────────────────────────────────────────────────── */
const PROCUREMENT: Asset[] = tag([
  {
    id: "GH-PO-001",
    borrowerName: "Office Consumables & Stationery — Q1 2026",
    sector: "Procurement",
    region: "Greater Accra",
    outstandingBalance: 620_000,
    currency: "GHS",
    status: "Approved",
    "Category": "Admin Supplies",
    "Date": "2026-01-31",
  },
  {
    id: "GH-PO-002",
    borrowerName: "IT Hardware Refresh — Q1 2026",
    sector: "Procurement",
    region: "Greater Accra",
    outstandingBalance: 4_500_000,
    currency: "GHS",
    status: "Approved",
    "Category": "ICT Hardware",
    "Date": "2026-02-14",
  },
  {
    id: "GH-PO-003",
    borrowerName: "Security Services Contract Renewal",
    sector: "Procurement",
    region: "Greater Accra",
    outstandingBalance: 2_800_000,
    currency: "GHS",
    status: "Active",
    "Category": "Security Services",
    "Date": "2026-01-01",
  },
  {
    id: "GH-PO-004",
    borrowerName: "ECG & Utility Payments — Q1 2026",
    sector: "Procurement",
    region: "Greater Accra",
    outstandingBalance: 2_100_000,
    currency: "GHS",
    status: "Paid",
    "Category": "Utilities",
    "Date": "2026-01-31",
  },
  {
    id: "GH-PO-005",
    borrowerName: "Brand & Communications Agency Retainer",
    sector: "Procurement",
    region: "Greater Accra",
    outstandingBalance: 1_200_000,
    currency: "GHS",
    status: "Active",
    "Category": "Marketing",
    "Date": "2026-01-01",
  },
  {
    id: "GH-PO-006",
    borrowerName: "Group Insurance Premium Renewal 2026",
    sector: "Procurement",
    region: "Greater Accra",
    outstandingBalance: 3_600_000,
    currency: "GHS",
    status: "Paid",
    "Category": "Insurance",
    "Date": "2026-01-15",
  },
]);

/* ═══════════════════════════════════════════════════════ */
/*  INFRASTRUCTURE ASSETS                                 */
/* ═══════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────── */
/*  PHYSICAL BUILDINGS — 4 assets                         */
/* ─────────────────────────────────────────────────────── */
const BUILDINGS: Asset[] = tag([
  {
    id: "GH-BL-001",
    borrowerName: "GCB Bank Head Office — High Street Accra",
    sector: "Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 185_000_000,
    currency: "GHS",
    status: "Owned",
    "Type": "Commercial Office",
    "Floor Area (sqm)": 10_200,
    "Year Built": 1989,
    "Net Book Value": 185_000_000,
  },
  {
    id: "GH-BL-002",
    borrowerName: "Kumasi Adum Regional Centre",
    sector: "Infrastructure",
    region: "Ashanti",
    outstandingBalance: 82_000_000,
    currency: "GHS",
    status: "Owned",
    "Type": "Commercial Office",
    "Floor Area (sqm)": 4_800,
    "Year Built": 2004,
    "Net Book Value": 82_000_000,
  },
  {
    id: "GH-BL-003",
    borrowerName: "GCB Bank Training & Innovation Centre — East Legon",
    sector: "Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 38_000_000,
    currency: "GHS",
    status: "Owned",
    "Type": "Training Facility",
    "Floor Area (sqm)": 2_400,
    "Year Built": 2016,
    "Net Book Value": 38_000_000,
  },
  {
    id: "GH-BL-004",
    borrowerName: "Cape Coast Branch Building",
    sector: "Infrastructure",
    region: "Central",
    outstandingBalance: 29_500_000,
    currency: "GHS",
    status: "Owned",
    "Type": "Branch Office",
    "Floor Area (sqm)": 1_500,
    "Year Built": 1998,
    "Net Book Value": 29_500_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  UTILITY CONNECTIONS — 4 assets                        */
/* ─────────────────────────────────────────────────────── */
const UTILITIES: Asset[] = tag([
  {
    id: "GH-UT-001",
    borrowerName: "ECG Power Supply — Accra HQ",
    sector: "Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 1_150_000,
    currency: "GHS",
    status: "Active",
    "Type": "Electricity",
    "Provider": "Electricity Company of Ghana (ECG)",
    "Annual Consumption": "1,920,000 kWh",
    "Annual Cost": 1_150_000,
  },
  {
    id: "GH-UT-002",
    borrowerName: "ECG Power Supply — Kumasi Regional Centre",
    sector: "Infrastructure",
    region: "Ashanti",
    outstandingBalance: 540_000,
    currency: "GHS",
    status: "Active",
    "Type": "Electricity",
    "Provider": "Electricity Company of Ghana (ECG)",
    "Annual Consumption": "740,000 kWh",
    "Annual Cost": 540_000,
  },
  {
    id: "GH-UT-003",
    borrowerName: "Ghana Water Company — Accra HQ Supply",
    sector: "Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 155_000,
    currency: "GHS",
    status: "Active",
    "Type": "Water",
    "Provider": "Ghana Water Company Ltd",
    "Annual Consumption": "8,500 m³",
    "Annual Cost": 155_000,
  },
  {
    id: "GH-UT-004",
    borrowerName: "Vodafone Ghana Fibre — HQ Connectivity",
    sector: "Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 920_000,
    currency: "GHS",
    status: "Active",
    "Type": "Telecommunications",
    "Provider": "Vodafone Ghana",
    "Annual Consumption": "5 Gbps",
    "Annual Cost": 920_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  LAND ASSETS — 3 assets                                */
/* ─────────────────────────────────────────────────────── */
const LAND: Asset[] = tag([
  {
    id: "GH-LA-001",
    borrowerName: "Accra Central — High Street Land Parcel",
    sector: "Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 165_000_000,
    currency: "GHS",
    status: "Freehold",
    "Area (Ha)": 0.72,
    "Land Use": "Commercial Banking",
    "Tenure": "Freehold",
    "Net Book Value": 165_000_000,
  },
  {
    id: "GH-LA-002",
    borrowerName: "Airport Residential Plot — Accra",
    sector: "Infrastructure",
    region: "Greater Accra",
    outstandingBalance: 115_000_000,
    currency: "GHS",
    status: "Leasehold",
    "Area (Ha)": 0.35,
    "Land Use": "Future Development",
    "Tenure": "50-Year Leasehold",
    "Net Book Value": 115_000_000,
  },
  {
    id: "GH-LA-003",
    borrowerName: "Kumasi City Centre Commercial Plot",
    sector: "Infrastructure",
    region: "Ashanti",
    outstandingBalance: 72_000_000,
    currency: "GHS",
    status: "Freehold",
    "Area (Ha)": 0.55,
    "Land Use": "Commercial Banking",
    "Tenure": "Freehold",
    "Net Book Value": 72_000_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  Assemble into AssetTypeData records                    */
/* ─────────────────────────────────────────────────────── */
function makeTypeData(type: string, data: Asset[]): AssetTypeData {
  return {
    type,
    data,
    uploadedAt: new Date().toISOString(),
    fileName: `ghana_demo_${type}.csv`,
    rowCount: data.length,
    columnCount: 10,
    validationStatus: "validated",
    validationErrors: [],
  };
}

export interface GhanaDemoSeed {
  assets: Record<string, AssetTypeData>;
  companyProfile: {
    orgName: string;
    regNumber: string;
    country: string;
    reportingYear: string;
    currency: string;
    totalAssets: string;
    employees: string;
    address: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    industry: string;
    description: string;
  };
}

export function getGhanaDemoSeed(): GhanaDemoSeed {
  const all = [
    ...LOANS,
    ...EQUITIES,
    ...BONDS,
    ...DERIVATIVES,
    ...GUARANTEES,
    ...PROPERTY,
    ...DEPOSITS,
    ...INSURANCE,
  ];
  const totalExposure = all.reduce(
    (s, a) => s + ((a.outstandingBalance as number) || 0),
    0,
  );

  return {
    assets: {
      loans_advances: makeTypeData("loans_advances", LOANS),
      equities: makeTypeData("equities", EQUITIES),
      bonds_fixed_income: makeTypeData("bonds_fixed_income", BONDS),
      derivatives: makeTypeData("derivatives", DERIVATIVES),
      guarantees_obs: makeTypeData("guarantees_obs", GUARANTEES),
      investment_property: makeTypeData("investment_property", PROPERTY),
      deposits_cash: makeTypeData("deposits_cash", DEPOSITS),
      insurance_assets: makeTypeData("insurance_assets", INSURANCE),
      // ICT
      data_centers: makeTypeData("data_centers", DATA_CENTERS),
      server_infrastructure: makeTypeData("server_infrastructure", SERVER_INFRA),
      network_equipment: makeTypeData("network_equipment", NETWORK_EQUIP),
      // Direct Operations
      offices_facilities: makeTypeData("offices_facilities", OFFICES),
      company_fleet: makeTypeData("company_fleet", FLEET),
      industrial_equipment: makeTypeData("industrial_equipment", INDUSTRIAL_EQUIP),
      // Supply Chain
      tier1_suppliers: makeTypeData("tier1_suppliers", TIER1_SUPPLIERS),
      logistics_transport: makeTypeData("logistics_transport", LOGISTICS),
      procurement_data: makeTypeData("procurement_data", PROCUREMENT),
      // Infrastructure
      physical_buildings: makeTypeData("physical_buildings", BUILDINGS),
      utility_connections: makeTypeData("utility_connections", UTILITIES),
      land_assets: makeTypeData("land_assets", LAND),
    },
    companyProfile: {
      orgName: "GCB Bank PLC",
      regNumber: "GH-CS-12345678",
      country: "Ghana",
      reportingYear: "2026",
      currency: "GHS",
      totalAssets: totalExposure.toString(),
      employees: "3200",
      address: "Thorpe Road, High Street, Accra, Ghana",
      contactName: "Kwame Mensah",
      contactEmail: "k.mensah@gcbbank.com.gh",
      contactPhone: "+233 30 266 1234",
      industry: "Financial Services",
      description:
        "GCB Bank PLC — one of the largest universal banks in Ghana, providing comprehensive financial services across all 16 regions.",
    },
  };
}
