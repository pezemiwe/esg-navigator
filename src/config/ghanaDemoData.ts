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
    borrowerName: "Agricultural Bank Corporate Bond",
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
    borrowerName: "FX Swap — USD/GHS (Agricultural Bank)",
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
    borrowerName: "Agricultural Bank Head Office",
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
    },
    companyProfile: {
      orgName: "Agricultural Bank PLC",
      regNumber: "GH-CS-12345678",
      country: "Ghana",
      reportingYear: "2026",
      currency: "GHS",
      totalAssets: totalExposure.toString(),
      employees: "3200",
      address: "Thorpe Road, High Street, Accra, Ghana",
      contactName: "Kwame Mensah",
      contactEmail: "k.mensah@agribank.com.gh",
      contactPhone: "+233 30 266 1234",
      industry: "Financial Services",
      description:
        "Agricultural Bank PLC — one of the largest universal banks in Ghana, providing comprehensive financial services across all 16 regions.",
    },
  };
}
