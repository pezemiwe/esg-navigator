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
