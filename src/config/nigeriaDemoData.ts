/**
 * Nigeria Demo Seed Data — 40 assets across ALL 8 asset types.
 * Mirrors structure of ghanaDemoData.ts but with Nigeria-specific data.
 */

import type { Asset, AssetTypeData } from "@/types/craTypes";

/* ── Coordinate bounding box for Nigeria (approx) ──────── */
function nigeriaCoord(region: string): { lat: number; lng: number } {
  const map: Record<string, [number, number]> = {
    Lagos: [6.5244, 3.3792],
    Abuja: [9.0765, 7.3986],
    Rivers: [4.8156, 7.0498],
    Kano: [12.0022, 8.592],
    Oyo: [7.85, 3.93],
    Kaduna: [10.5222, 7.4383],
    Enugu: [6.4541, 7.5102],
    Delta: [5.701, 5.91],
    Edo: [6.34, 5.6175],
    "Cross River": [4.9518, 8.3221],
    Anambra: [6.21, 6.99],
    Borno: [11.8333, 13.15],
  };
  const [lat, lng] = map[region] ?? [9.06, 7.49];
  return {
    lat: lat + (Math.random() - 0.5) * 0.15,
    lng: lng + (Math.random() - 0.5) * 0.15,
  };
}

function tag(items: Omit<Asset, "latitude" | "longitude">[]): Asset[] {
  return items.map((item) => {
    const { lat, lng } = nigeriaCoord(item.region as string);
    return {
      ...item,
      country: "Nigeria",
      latitude: lat,
      longitude: lng,
    } as unknown as Asset;
  });
}

/* ─────────────────────────────────────────────────────── */
/*  LOANS & ADVANCES — 10 assets                          */
/* ─────────────────────────────────────────────────────── */
const LOANS: Asset[] = tag([
  {
    id: "NG-LN-001",
    borrowerName: "Dangote Cement Plc",
    sector: "Manufacturing",
    region: "Lagos",
    outstandingBalance: 45_000_000,
    currency: "NGN",
    status: "Performing",
    maturityDate: "2029-06-30",
  },
  {
    id: "NG-LN-002",
    borrowerName: "Nigerian Breweries Plc",
    sector: "Manufacturing",
    region: "Lagos",
    outstandingBalance: 18_500_000,
    currency: "NGN",
    status: "Performing",
    maturityDate: "2028-03-15",
  },
  {
    id: "NG-LN-003",
    borrowerName: "Olam Nigeria Ltd",
    sector: "Agriculture",
    region: "Kaduna",
    outstandingBalance: 12_300_000,
    currency: "NGN",
    status: "Performing",
    maturityDate: "2027-12-31",
  },
  {
    id: "NG-LN-004",
    borrowerName: "Nigerian National Petroleum Corp (NNPC)",
    sector: "Oil & Gas",
    region: "Abuja",
    outstandingBalance: 62_000_000,
    currency: "NGN",
    status: "Performing",
    maturityDate: "2030-09-30",
  },
  {
    id: "NG-LN-005",
    borrowerName: "Eko Atlantic Development Corp",
    sector: "Real Estate & Construction",
    region: "Lagos",
    outstandingBalance: 38_000_000,
    currency: "NGN",
    status: "Watch",
    maturityDate: "2028-11-30",
  },
  {
    id: "NG-LN-006",
    borrowerName: "Flour Mills of Nigeria",
    sector: "Manufacturing",
    region: "Lagos",
    outstandingBalance: 15_800_000,
    currency: "NGN",
    status: "Performing",
    maturityDate: "2027-07-15",
  },
  {
    id: "NG-LN-007",
    borrowerName: "Transcorp Power Ltd",
    sector: "Energy & Utilities",
    region: "Delta",
    outstandingBalance: 85_000_000,
    currency: "NGN",
    status: "Performing",
    maturityDate: "2032-12-31",
  },
  {
    id: "NG-LN-008",
    borrowerName: "MTN Nigeria Communications Plc",
    sector: "Telecommunications",
    region: "Lagos",
    outstandingBalance: 55_000_000,
    currency: "NGN",
    status: "Performing",
    maturityDate: "2029-03-31",
  },
  {
    id: "NG-LN-009",
    borrowerName: "Lagos University Teaching Hospital",
    sector: "Health & Pharmaceuticals",
    region: "Lagos",
    outstandingBalance: 22_000_000,
    currency: "NGN",
    status: "Performing",
    maturityDate: "2028-06-30",
  },
  {
    id: "NG-LN-010",
    borrowerName: "Northern Nigeria Agri-Processing",
    sector: "Agriculture",
    region: "Kano",
    outstandingBalance: 9_500_000,
    currency: "NGN",
    status: "Watch",
    maturityDate: "2027-09-30",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  EQUITIES — 5 assets                                    */
/* ─────────────────────────────────────────────────────── */
const EQUITIES: Asset[] = tag([
  {
    id: "NG-EQ-001",
    borrowerName: "Zenith Bank Plc",
    sector: "Financial Services",
    region: "Lagos",
    outstandingBalance: 28_000_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-EQ-002",
    borrowerName: "Dangote Sugar Refinery",
    sector: "Manufacturing",
    region: "Lagos",
    outstandingBalance: 72_000_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-EQ-003",
    borrowerName: "Nestle Nigeria Plc",
    sector: "Retail & Consumer Goods",
    region: "Lagos",
    outstandingBalance: 14_500_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-EQ-004",
    borrowerName: "Seplat Energy Plc",
    sector: "Oil & Gas",
    region: "Rivers",
    outstandingBalance: 95_000_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-EQ-005",
    borrowerName: "Access Holdings Plc",
    sector: "Financial Services",
    region: "Lagos",
    outstandingBalance: 19_000_000,
    currency: "NGN",
    status: "Active",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  BONDS / FIXED INCOME — 5 assets                        */
/* ─────────────────────────────────────────────────────── */
const BONDS: Asset[] = tag([
  {
    id: "NG-BD-001",
    borrowerName: "Federal Government of Nigeria (FGN Bond 2028)",
    sector: "Sovereign",
    region: "Abuja",
    outstandingBalance: 120_000_000,
    currency: "NGN",
    status: "Active",
    maturityDate: "2028-12-31",
  },
  {
    id: "NG-BD-002",
    borrowerName: "Nigerian Agricultural Insurance Corp",
    sector: "Agriculture",
    region: "Abuja",
    outstandingBalance: 35_000_000,
    currency: "NGN",
    status: "Active",
    maturityDate: "2027-09-15",
  },
  {
    id: "NG-BD-003",
    borrowerName: "TCN Infrastructure Bond",
    sector: "Energy & Utilities",
    region: "Abuja",
    outstandingBalance: 48_000_000,
    currency: "NGN",
    status: "Active",
    maturityDate: "2030-06-30",
  },
  {
    id: "NG-BD-004",
    borrowerName: "FBN Quest Merchant Bank",
    sector: "Financial Services",
    region: "Lagos",
    outstandingBalance: 8_500_000,
    currency: "NGN",
    status: "Active",
    maturityDate: "2027-03-31",
  },
  {
    id: "NG-BD-005",
    borrowerName: "Wema Bank Corporate Bond",
    sector: "Financial Services",
    region: "Lagos",
    outstandingBalance: 25_000_000,
    currency: "NGN",
    status: "Active",
    maturityDate: "2029-06-30",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  DERIVATIVES — 4 assets                                 */
/* ─────────────────────────────────────────────────────── */
const DERIVATIVES: Asset[] = tag([
  {
    id: "NG-DV-001",
    borrowerName: "Cocoa Forward Hedge (NEPC)",
    sector: "Agriculture",
    region: "Cross River",
    outstandingBalance: 32_000_000,
    currency: "NGN",
    status: "Active",
    maturityDate: "2027-06-30",
  },
  {
    id: "NG-DV-002",
    borrowerName: "Crude Oil Futures (NNPC)",
    sector: "Oil & Gas",
    region: "Rivers",
    outstandingBalance: 58_000_000,
    currency: "NGN",
    status: "Active",
    maturityDate: "2027-12-31",
  },
  {
    id: "NG-DV-003",
    borrowerName: "FX Swap — USD/NGN (Wema Bank)",
    sector: "Financial Services",
    region: "Lagos",
    outstandingBalance: 42_000_000,
    currency: "NGN",
    status: "Active",
    maturityDate: "2026-12-15",
  },
  {
    id: "NG-DV-004",
    borrowerName: "Interest Rate Swap (GTBank)",
    sector: "Financial Services",
    region: "Lagos",
    outstandingBalance: 18_500_000,
    currency: "NGN",
    status: "Active",
    maturityDate: "2028-03-31",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  GUARANTEES / OFF-BALANCE SHEET — 3 assets              */
/* ─────────────────────────────────────────────────────── */
const GUARANTEES: Asset[] = tag([
  {
    id: "NG-GT-001",
    borrowerName: "Port Harcourt Refinery LC",
    sector: "Oil & Gas",
    region: "Rivers",
    outstandingBalance: 25_000_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-GT-002",
    borrowerName: "Nigerian Ports Authority Guarantee",
    sector: "Transport & Logistics",
    region: "Lagos",
    outstandingBalance: 40_000_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-GT-003",
    borrowerName: "TCN Standby LC",
    sector: "Energy & Utilities",
    region: "Abuja",
    outstandingBalance: 15_000_000,
    currency: "NGN",
    status: "Active",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  INVESTMENT PROPERTY — 3 assets                         */
/* ─────────────────────────────────────────────────────── */
const PROPERTY: Asset[] = tag([
  {
    id: "NG-PR-001",
    borrowerName: "Wema Bank Head Office",
    sector: "Real Estate & Construction",
    region: "Lagos",
    outstandingBalance: 35_000_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-PR-002",
    borrowerName: "Victoria Island Commercial Block",
    sector: "Real Estate & Construction",
    region: "Lagos",
    outstandingBalance: 22_000_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-PR-003",
    borrowerName: "Abuja Branch Complex",
    sector: "Real Estate & Construction",
    region: "Abuja",
    outstandingBalance: 12_000_000,
    currency: "NGN",
    status: "Active",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  DEPOSITS & CASH — 3 assets                             */
/* ─────────────────────────────────────────────────────── */
const DEPOSITS: Asset[] = tag([
  {
    id: "NG-DP-001",
    borrowerName: "Central Bank of Nigeria Placement",
    sector: "Financial Services",
    region: "Abuja",
    outstandingBalance: 200_000_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-DP-002",
    borrowerName: "Interbank Placement (Stanbic IBTC)",
    sector: "Financial Services",
    region: "Lagos",
    outstandingBalance: 75_000_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-DP-003",
    borrowerName: "Treasury Bill Holdings",
    sector: "Sovereign",
    region: "Abuja",
    outstandingBalance: 150_000_000,
    currency: "NGN",
    status: "Active",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  INSURANCE & REINSURANCE — 2 assets                     */
/* ─────────────────────────────────────────────────────── */
const INSURANCE: Asset[] = tag([
  {
    id: "NG-IN-001",
    borrowerName: "AIICO Insurance Receivable",
    sector: "Financial Services",
    region: "Lagos",
    outstandingBalance: 6_500_000,
    currency: "NGN",
    status: "Active",
  },
  {
    id: "NG-IN-002",
    borrowerName: "Leadway Life Reinsurance",
    sector: "Financial Services",
    region: "Lagos",
    outstandingBalance: 11_000_000,
    currency: "NGN",
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
    id: "NG-DC-001",
    borrowerName: "Wema Bank Lagos Primary DC",
    sector: "ICT Infrastructure",
    region: "Lagos",
    outstandingBalance: 280_000_000,
    currency: "NGN",
    status: "Operational",
    "Tier Level": "Tier III",
    "Capacity (MW)": 1.2,
    "PUE": 1.6,
    "Net Book Value": 280_000_000,
  },
  {
    id: "NG-DC-002",
    borrowerName: "Wema Bank Abuja Disaster Recovery Site",
    sector: "ICT Infrastructure",
    region: "Abuja",
    outstandingBalance: 145_000_000,
    currency: "NGN",
    status: "Operational",
    "Tier Level": "Tier II",
    "Capacity (MW)": 0.5,
    "PUE": 1.8,
    "Net Book Value": 145_000_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  SERVER INFRASTRUCTURE — 3 assets                      */
/* ─────────────────────────────────────────────────────── */
const SERVER_INFRA: Asset[] = tag([
  {
    id: "NG-SV-001",
    borrowerName: "Core Banking Server Cluster",
    sector: "ICT Infrastructure",
    region: "Lagos",
    outstandingBalance: 95_000_000,
    currency: "NGN",
    status: "Active",
    "Type": "Blade Server",
    "Age (Years)": 3,
    "Rack Units": 42,
    "Net Book Value": 95_000_000,
  },
  {
    id: "NG-SV-002",
    borrowerName: "ATM Switch & Middleware Servers",
    sector: "ICT Infrastructure",
    region: "Lagos",
    outstandingBalance: 48_000_000,
    currency: "NGN",
    status: "Active",
    "Type": "Rack Server",
    "Age (Years)": 4,
    "Rack Units": 28,
    "Net Book Value": 48_000_000,
  },
  {
    id: "NG-SV-003",
    borrowerName: "Enterprise Storage Arrays (SAN/NAS)",
    sector: "ICT Infrastructure",
    region: "Lagos",
    outstandingBalance: 62_000_000,
    currency: "NGN",
    status: "Active",
    "Type": "Storage Array",
    "Age (Years)": 2,
    "Rack Units": 14,
    "Net Book Value": 62_000_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  NETWORK EQUIPMENT — 4 assets                          */
/* ─────────────────────────────────────────────────────── */
const NETWORK_EQUIP: Asset[] = tag([
  {
    id: "NG-NE-001",
    borrowerName: "Cisco Core Switches — Lagos HQ",
    sector: "ICT Infrastructure",
    region: "Lagos",
    outstandingBalance: 18_500_000,
    currency: "NGN",
    status: "Active",
    "Manufacturer": "Cisco",
    "Type": "Core Switch",
    "Net Book Value": 18_500_000,
  },
  {
    id: "NG-NE-002",
    borrowerName: "WAN Edge Routers (SD-WAN)",
    sector: "ICT Infrastructure",
    region: "Lagos",
    outstandingBalance: 22_000_000,
    currency: "NGN",
    status: "Active",
    "Manufacturer": "Cisco",
    "Type": "WAN Router",
    "Net Book Value": 22_000_000,
  },
  {
    id: "NG-NE-003",
    borrowerName: "Palo Alto Firewall Cluster",
    sector: "ICT Infrastructure",
    region: "Lagos",
    outstandingBalance: 31_000_000,
    currency: "NGN",
    status: "Active",
    "Manufacturer": "Palo Alto Networks",
    "Type": "Next-Gen Firewall",
    "Net Book Value": 31_000_000,
  },
  {
    id: "NG-NE-004",
    borrowerName: "Branch Network Distribution Layer",
    sector: "ICT Infrastructure",
    region: "Abuja",
    outstandingBalance: 9_500_000,
    currency: "NGN",
    status: "Active",
    "Manufacturer": "Juniper",
    "Type": "Distribution Switch",
    "Net Book Value": 9_500_000,
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
    id: "NG-OF-001",
    borrowerName: "Wema Bank Head Office — Marina Road Lagos",
    sector: "Direct Operations",
    region: "Lagos",
    outstandingBalance: 3_200_000_000,
    currency: "NGN",
    status: "Owned",
    "Address": "1 Marina Road, Lagos Island, Lagos",
    "Floor Area (sqm)": 12_500,
    "Energy Consumption (kWh)": 2_400_000,
    "Annual Rent / Book Value": 3_200_000_000,
  },
  {
    id: "NG-OF-002",
    borrowerName: "Abuja Regional Centre — Maitama",
    sector: "Direct Operations",
    region: "Abuja",
    outstandingBalance: 1_450_000_000,
    currency: "NGN",
    status: "Owned",
    "Address": "Plot 1234, Cadastral Zone A06, Maitama, Abuja",
    "Floor Area (sqm)": 6_800,
    "Energy Consumption (kWh)": 980_000,
    "Annual Rent / Book Value": 1_450_000_000,
  },
  {
    id: "NG-OF-003",
    borrowerName: "Kano Business Banking Branch",
    sector: "Direct Operations",
    region: "Kano",
    outstandingBalance: 620_000_000,
    currency: "NGN",
    status: "Leased",
    "Address": "22 Bank Road, Kano Municipal, Kano State",
    "Floor Area (sqm)": 2_200,
    "Energy Consumption (kWh)": 320_000,
    "Annual Rent / Book Value": 620_000_000,
  },
  {
    id: "NG-OF-004",
    borrowerName: "Port Harcourt GRA Branch",
    sector: "Direct Operations",
    region: "Rivers",
    outstandingBalance: 510_000_000,
    currency: "NGN",
    status: "Owned",
    "Address": "43 Aba Road, GRA Phase II, Port Harcourt",
    "Floor Area (sqm)": 1_900,
    "Energy Consumption (kWh)": 280_000,
    "Annual Rent / Book Value": 510_000_000,
  },
  {
    id: "NG-OF-005",
    borrowerName: "Enugu Independence Layout Branch",
    sector: "Direct Operations",
    region: "Enugu",
    outstandingBalance: 340_000_000,
    currency: "NGN",
    status: "Leased",
    "Address": "15 Independence Layout, Enugu State",
    "Floor Area (sqm)": 1_400,
    "Energy Consumption (kWh)": 195_000,
    "Annual Rent / Book Value": 340_000_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  COMPANY FLEET — 4 assets                              */
/* ─────────────────────────────────────────────────────── */
const FLEET: Asset[] = tag([
  {
    id: "NG-FL-001",
    borrowerName: "Lagos Operations Fleet Pool (12 vehicles)",
    sector: "Direct Operations",
    region: "Lagos",
    outstandingBalance: 72_000_000,
    currency: "NGN",
    status: "Active",
    "Fuel Type": "Petrol/Diesel Mix",
    "Annual Km": 480_000,
    "Net Book Value": 72_000_000,
  },
  {
    id: "NG-FL-002",
    borrowerName: "Abuja & North Fleet Pool (8 vehicles)",
    sector: "Direct Operations",
    region: "Abuja",
    outstandingBalance: 52_000_000,
    currency: "NGN",
    status: "Active",
    "Fuel Type": "Petrol/Diesel Mix",
    "Annual Km": 320_000,
    "Net Book Value": 52_000_000,
  },
  {
    id: "NG-FL-003",
    borrowerName: "Security & Cash-in-Transit Vehicles (6 units)",
    sector: "Direct Operations",
    region: "Lagos",
    outstandingBalance: 84_000_000,
    currency: "NGN",
    status: "Active",
    "Fuel Type": "Diesel",
    "Annual Km": 210_000,
    "Net Book Value": 84_000_000,
  },
  {
    id: "NG-FL-004",
    borrowerName: "Executive Vehicle Pool (4 vehicles)",
    sector: "Direct Operations",
    region: "Lagos",
    outstandingBalance: 61_000_000,
    currency: "NGN",
    status: "Active",
    "Fuel Type": "Petrol",
    "Annual Km": 95_000,
    "Net Book Value": 61_000_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  INDUSTRIAL EQUIPMENT — 3 assets                       */
/* ─────────────────────────────────────────────────────── */
const INDUSTRIAL_EQUIP: Asset[] = tag([
  {
    id: "NG-IE-001",
    borrowerName: "HQ Diesel Generator Set (2×1.5MVA)",
    sector: "Direct Operations",
    region: "Lagos",
    outstandingBalance: 45_000_000,
    currency: "NGN",
    status: "Operational",
    "Type": "Generator",
    "Capacity": "3 MVA total",
    "Fuel Type": "Diesel",
    "Age (Years)": 4,
    "Net Book Value": 45_000_000,
  },
  {
    id: "NG-IE-002",
    borrowerName: "Abuja Regional Generator (800 kVA)",
    sector: "Direct Operations",
    region: "Abuja",
    outstandingBalance: 22_000_000,
    currency: "NGN",
    status: "Operational",
    "Type": "Generator",
    "Capacity": "800 kVA",
    "Fuel Type": "Diesel",
    "Age (Years)": 3,
    "Net Book Value": 22_000_000,
  },
  {
    id: "NG-IE-003",
    borrowerName: "UPS & Power Conditioning Systems",
    sector: "Direct Operations",
    region: "Lagos",
    outstandingBalance: 18_500_000,
    currency: "NGN",
    status: "Operational",
    "Type": "UPS",
    "Capacity": "500 kVA",
    "Fuel Type": "Electric / Battery",
    "Age (Years)": 2,
    "Net Book Value": 18_500_000,
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
    id: "NG-S1-001",
    borrowerName: "Microsoft Nigeria Ltd",
    sector: "ICT Vendor",
    region: "Lagos",
    outstandingBalance: 185_000_000,
    currency: "NGN",
    status: "Active",
    "Category": "Software & Cloud",
    "Annual Spend": 185_000_000,
    "Credit Score": "AA",
  },
  {
    id: "NG-S1-002",
    borrowerName: "Interswitch Group",
    sector: "Payment Processing",
    region: "Lagos",
    outstandingBalance: 220_000_000,
    currency: "NGN",
    status: "Active",
    "Category": "Fintech Services",
    "Annual Spend": 220_000_000,
    "Credit Score": "AA",
  },
  {
    id: "NG-S1-003",
    borrowerName: "Huawei Nigeria Ltd",
    sector: "Telecoms & ICT",
    region: "Abuja",
    outstandingBalance: 142_000_000,
    currency: "NGN",
    status: "Active",
    "Category": "Network Hardware",
    "Annual Spend": 142_000_000,
    "Credit Score": "A",
  },
  {
    id: "NG-S1-004",
    borrowerName: "Johnson Controls Nigeria",
    sector: "Building Services",
    region: "Lagos",
    outstandingBalance: 38_000_000,
    currency: "NGN",
    status: "Active",
    "Category": "Facilities Management",
    "Annual Spend": 38_000_000,
    "Credit Score": "BBB",
  },
  {
    id: "NG-S1-005",
    borrowerName: "CrowdStrike Nigeria (Cybersecurity)",
    sector: "ICT Vendor",
    region: "Lagos",
    outstandingBalance: 55_000_000,
    currency: "NGN",
    status: "Active",
    "Category": "Security Services",
    "Annual Spend": 55_000_000,
    "Credit Score": "A",
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  LOGISTICS & TRANSPORT — 3 assets                      */
/* ─────────────────────────────────────────────────────── */
const LOGISTICS: Asset[] = tag([
  {
    id: "NG-LG-001",
    borrowerName: "NIPOST Courier Services",
    sector: "Logistics",
    region: "Lagos",
    outstandingBalance: 12_000_000,
    currency: "NGN",
    status: "Active",
    "Mode": "Road",
    "Origin Country": "Nigeria",
    "Tonnes (CO2e)": 18.4,
    "Annual Spend": 12_000_000,
  },
  {
    id: "NG-LG-002",
    borrowerName: "DHL Nigeria Express",
    sector: "Logistics",
    region: "Lagos",
    outstandingBalance: 28_000_000,
    currency: "NGN",
    status: "Active",
    "Mode": "Air/Road",
    "Origin Country": "Nigeria",
    "Tonnes (CO2e)": 42.1,
    "Annual Spend": 28_000_000,
  },
  {
    id: "NG-LG-003",
    borrowerName: "G4S Cash Management Nigeria",
    sector: "Security Logistics",
    region: "Lagos",
    outstandingBalance: 96_000_000,
    currency: "NGN",
    status: "Active",
    "Mode": "Road (Armoured)",
    "Origin Country": "Nigeria",
    "Tonnes (CO2e)": 65.8,
    "Annual Spend": 96_000_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  PROCUREMENT DATA — 6 records                          */
/* ─────────────────────────────────────────────────────── */
const PROCUREMENT: Asset[] = tag([
  {
    id: "NG-PO-001",
    borrowerName: "Office Consumables & Stationery — Q1 2026",
    sector: "Procurement",
    region: "Lagos",
    outstandingBalance: 9_200_000,
    currency: "NGN",
    status: "Approved",
    "Category": "Admin Supplies",
    "Date": "2026-01-31",
  },
  {
    id: "NG-PO-002",
    borrowerName: "IT Hardware Refresh — Q1 2026",
    sector: "Procurement",
    region: "Lagos",
    outstandingBalance: 68_000_000,
    currency: "NGN",
    status: "Approved",
    "Category": "ICT Hardware",
    "Date": "2026-02-14",
  },
  {
    id: "NG-PO-003",
    borrowerName: "Physical Security Services Contract",
    sector: "Procurement",
    region: "Lagos",
    outstandingBalance: 42_000_000,
    currency: "NGN",
    status: "Active",
    "Category": "Security Services",
    "Date": "2026-01-01",
  },
  {
    id: "NG-PO-004",
    borrowerName: "Electricity & Utility Payments — Q1 2026",
    sector: "Procurement",
    region: "Lagos",
    outstandingBalance: 31_500_000,
    currency: "NGN",
    status: "Paid",
    "Category": "Utilities",
    "Date": "2026-01-31",
  },
  {
    id: "NG-PO-005",
    borrowerName: "Brand & Marketing Agency Retainer",
    sector: "Procurement",
    region: "Lagos",
    outstandingBalance: 18_000_000,
    currency: "NGN",
    status: "Active",
    "Category": "Marketing",
    "Date": "2026-01-01",
  },
  {
    id: "NG-PO-006",
    borrowerName: "Group Insurance Premium Renewal 2026",
    sector: "Procurement",
    region: "Lagos",
    outstandingBalance: 55_000_000,
    currency: "NGN",
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
    id: "NG-BL-001",
    borrowerName: "Wema Bank Head Office Tower",
    sector: "Infrastructure",
    region: "Lagos",
    outstandingBalance: 3_200_000_000,
    currency: "NGN",
    status: "Owned",
    "Type": "Commercial Office",
    "Floor Area (sqm)": 12_500,
    "Year Built": 2005,
    "Net Book Value": 3_200_000_000,
  },
  {
    id: "NG-BL-002",
    borrowerName: "Abuja Maitama Regional Centre",
    sector: "Infrastructure",
    region: "Abuja",
    outstandingBalance: 1_450_000_000,
    currency: "NGN",
    status: "Owned",
    "Type": "Commercial Office",
    "Floor Area (sqm)": 6_800,
    "Year Built": 2012,
    "Net Book Value": 1_450_000_000,
  },
  {
    id: "NG-BL-003",
    borrowerName: "Wema Bank Training & Learning Academy — Yaba",
    sector: "Infrastructure",
    region: "Lagos",
    outstandingBalance: 620_000_000,
    currency: "NGN",
    status: "Owned",
    "Type": "Training Facility",
    "Floor Area (sqm)": 3_200,
    "Year Built": 2018,
    "Net Book Value": 620_000_000,
  },
  {
    id: "NG-BL-004",
    borrowerName: "Port Harcourt GRA Branch Building",
    sector: "Infrastructure",
    region: "Rivers",
    outstandingBalance: 510_000_000,
    currency: "NGN",
    status: "Owned",
    "Type": "Branch Office",
    "Floor Area (sqm)": 1_900,
    "Year Built": 2009,
    "Net Book Value": 510_000_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  UTILITY CONNECTIONS — 4 assets                        */
/* ─────────────────────────────────────────────────────── */
const UTILITIES: Asset[] = tag([
  {
    id: "NG-UT-001",
    borrowerName: "EKEDC Power Supply — Lagos HQ",
    sector: "Infrastructure",
    region: "Lagos",
    outstandingBalance: 18_000_000,
    currency: "NGN",
    status: "Active",
    "Type": "Electricity",
    "Provider": "EKEDC",
    "Annual Consumption": "2,400,000 kWh",
    "Annual Cost": 18_000_000,
  },
  {
    id: "NG-UT-002",
    borrowerName: "AEDC Power Supply — Abuja Centre",
    sector: "Infrastructure",
    region: "Abuja",
    outstandingBalance: 8_500_000,
    currency: "NGN",
    status: "Active",
    "Type": "Electricity",
    "Provider": "AEDC",
    "Annual Consumption": "980,000 kWh",
    "Annual Cost": 8_500_000,
  },
  {
    id: "NG-UT-003",
    borrowerName: "Lagos Water Corporation — HQ Supply",
    sector: "Infrastructure",
    region: "Lagos",
    outstandingBalance: 2_400_000,
    currency: "NGN",
    status: "Active",
    "Type": "Water",
    "Provider": "Lagos Water Corporation",
    "Annual Consumption": "12,500 m³",
    "Annual Cost": 2_400_000,
  },
  {
    id: "NG-UT-004",
    borrowerName: "MTN Fibre Leased Line — HQ Connectivity",
    sector: "Infrastructure",
    region: "Lagos",
    outstandingBalance: 14_400_000,
    currency: "NGN",
    status: "Active",
    "Type": "Telecommunications",
    "Provider": "MTN Nigeria",
    "Annual Consumption": "10 Gbps",
    "Annual Cost": 14_400_000,
  },
]);

/* ─────────────────────────────────────────────────────── */
/*  LAND ASSETS — 3 assets                                */
/* ─────────────────────────────────────────────────────── */
const LAND: Asset[] = tag([
  {
    id: "NG-LA-001",
    borrowerName: "Lagos Island — Marina Road Land Parcel",
    sector: "Infrastructure",
    region: "Lagos",
    outstandingBalance: 2_800_000_000,
    currency: "NGN",
    status: "Freehold",
    "Area (Ha)": 0.85,
    "Land Use": "Commercial Banking",
    "Tenure": "Freehold",
    "Net Book Value": 2_800_000_000,
  },
  {
    id: "NG-LA-002",
    borrowerName: "Victoria Island — Annexe Plot",
    sector: "Infrastructure",
    region: "Lagos",
    outstandingBalance: 1_950_000_000,
    currency: "NGN",
    status: "Leasehold",
    "Area (Ha)": 0.42,
    "Land Use": "Future Development",
    "Tenure": "99-Year Leasehold",
    "Net Book Value": 1_950_000_000,
  },
  {
    id: "NG-LA-003",
    borrowerName: "Abuja FCT — Maitama Plot",
    sector: "Infrastructure",
    region: "Abuja",
    outstandingBalance: 980_000_000,
    currency: "NGN",
    status: "Freehold",
    "Area (Ha)": 0.62,
    "Land Use": "Commercial Banking",
    "Tenure": "Freehold",
    "Net Book Value": 980_000_000,
  },
]);

function makeTypeData(type: string, data: Asset[]): AssetTypeData {
  return {
    type,
    data,
    uploadedAt: new Date().toISOString(),
    fileName: `nigeria_demo_${type}.csv`,
    rowCount: data.length,
    columnCount: 10,
    validationStatus: "validated",
    validationErrors: [],
  };
}

export interface NigeriaDemoSeed {
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

export function getNigeriaDemoSeed(): NigeriaDemoSeed {
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
      orgName: "Wema Bank PLC",
      regNumber: "NG-RC-12345678",
      country: "Nigeria",
      reportingYear: "2026",
      currency: "NGN",
      totalAssets: totalExposure.toString(),
      employees: "3200",
      address: "1 Marina Road, Lagos Island, Lagos, Nigeria",
      contactName: "Adebayo Ogunlesi",
      contactEmail: "a.ogunlesi@wemabank.com",
      contactPhone: "+234 1 270 1234",
      industry: "Financial Services",
      description:
        "Wema Bank PLC — one of Nigeria's longest-standing universal banks, providing comprehensive financial services across all 36 states.",
    },
  };
}
