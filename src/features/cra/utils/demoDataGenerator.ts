import type { Asset, AssetTypeData } from "@/types/craTypes";
const NIGERIA_LOCATIONS = {
  Lagos: [
    "Lagos Island",
    "Ikeja",
    "Victoria Island",
    "Lekki",
    "Surulere",
    "Ikoyi",
  ],
  "Abuja FCT": ["Garki", "Wuse", "Maitama", "Asokoro", "Gwarinpa", "Kubwa"],
  Rivers: ["Port Harcourt", "Obio-Akpor", "Bonny", "Eleme", "Ahoada"],
  Kano: ["Kano City", "Fagge", "Nassarawa", "Tarauni", "Ungogo"],
  Oyo: ["Ibadan", "Ogbomoso", "Oyo Town", "Iseyin", "Saki"],
  Delta: ["Warri", "Asaba", "Sapele", "Ughelli", "Agbor"],
  Ogun: ["Abeokuta", "Sagamu", "Ota", "Ijebu Ode"],
  Kaduna: ["Kaduna City", "Zaria", "Kafanchan", "Kagoro"],
};
const SECTORS = [
  "Manufacturing",
  "Agriculture",
  "Mining & Quarrying",
  "Energy",
  "Real Estate",
  "Construction",
  "Trade & Commerce",
  "Financial Services",
  "Transport & Logistics",
  "Hospitality",
];
const ASSET_TYPES = [
  "Term Loans",
  "Overdrafts",
  "Trade Finance",
  "Project Finance",
  "Working Capital",
  "Mortgages",
  "Equipment Finance",
];
const COLLATERAL_TYPES = [
  "Real Estate",
  "Equipment",
  "Inventory",
  "Receivables",
  "Cash Deposit",
  "Government Securities",
  "Corporate Guarantee",
];
const BORROWER_NAMES = {
  Manufacturing: [
    "ABC Manufacturing Ltd",
    "Global Textiles ana",
    "Premium Foods Industries",
    "Golden Plastics Co.",
    "West African Breweries",
    "Modern Steel Works",
  ],
  Agriculture: [
    "Cocoa Ventures Ltd",
    "Tropical Farms ana",
    "AgriTech Innovations",
    "Palm Oil Estates",
    "Poultry Masters Ltd",
    "Organic Produce Co.",
  ],
  "Mining & Quarrying": [
    "Gold Star Mining",
    "Bauxite Extractors Ltd",
    "Diamond Fields ana",
    "Manganese Corporation",
    "Quarry Masters Ltd",
  ],
  Energy: [
    "Solar Power ana",
    "West African Gas",
    "HydroPower Systems",
    "Wind Energy Ltd",
    "Petroleum Services Co.",
  ],
  "Real Estate": [
    "Prime Properties Ltd",
    "Urban Developers ana",
    "Housing Solutions Co.",
    "Commercial Estates Ltd",
    "Luxury Residences",
  ],
  Construction: [
    "BuildRit ana",
    "Infrastructure Masters",
    "Roads & Bridges Ltd",
    "Modern Constructions",
    "Engineering Solutions",
  ],
  "Trade & Commerce": [
    "Import Export Hub",
    "Wholesale Distributors",
    "Retail Giants ana",
    "Trading Company Ltd",
    "Commerce Solutions",
  ],
  "Financial Services": [
    "Investment Partners",
    "Microfinance Solutions",
    "Leasing Company Ltd",
    "Insurance Brokers ana",
  ],
  "Transport & Logistics": [
    "Fast Logistics Ltd",
    "Cargo Masters ana",
    "Freit Forwarders",
    "Transport Solutions",
  ],
  Hospitality: [
    "Grand Hotels ana",
    "Resort Operators Ltd",
    "Restaurant Chain Co.",
    "Tourism Services",
  ],
};
function generateExposure(sector: string): number {
  const baseAmounts = {
    Manufacturing: [500000, 5000000],
    Agriculture: [200000, 3000000],
    "Mining & Quarrying": [1000000, 20000000],
    Energy: [2000000, 50000000],
    "Real Estate": [1000000, 15000000],
    Construction: [500000, 10000000],
    "Trade & Commerce": [300000, 5000000],
    "Financial Services": [1000000, 20000000],
    "Transport & Logistics": [400000, 4000000],
    Hospitality: [500000, 8000000],
  };
  const [min, max] = baseAmounts[sector as keyof typeof baseAmounts] || [
    100000, 1000000,
  ];
  return Math.floor(Math.random() * (max - min) + min);
}
function generateInterestRate(sector: string, tenor: number): number {
  const baseRates = {
    Manufacturing: 18,
    Agriculture: 22,
    "Mining & Quarrying": 16,
    Energy: 15,
    "Real Estate": 19,
    Construction: 20,
    "Trade & Commerce": 21,
    "Financial Services": 17,
    "Transport & Logistics": 19,
    Hospitality: 20,
  };
  const baseRate = baseRates[sector as keyof typeof baseRates] || 18;
  const tenorAdjustment = (tenor / 60) * 2;
  return Number(
    (baseRate + tenorAdjustment + (Math.random() - 0.5) * 2).toFixed(2),
  );
}
export function generateDemoAssets(count: number = 500): Asset[] {
  const assets: Asset[] = [];
  const regions = Object.keys(NIGERIA_LOCATIONS);
  const missingRegionProbability = 0.023;
  const invalidDateProbability = 0.008;
  const missingSectorProbability = 0.015;
  for (let i = 0; i < count; i++) {
    const sector = SECTORS[Math.floor(Math.random() * SECTORS.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    const locations =
      NIGERIA_LOCATIONS[region as keyof typeof NIGERIA_LOCATIONS];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const assetType =
      ASSET_TYPES[Math.floor(Math.random() * ASSET_TYPES.length)];
    const collateralType =
      COLLATERAL_TYPES[Math.floor(Math.random() * COLLATERAL_TYPES.length)];
    const borrowerNames = BORROWER_NAMES[
      sector as keyof typeof BORROWER_NAMES
    ] || ["Generic Company Ltd"];
    const borrowerName =
      borrowerNames[Math.floor(Math.random() * borrowerNames.length)];
    const tenor = Math.floor(Math.random() * 84) + 12;
    const interestRate = generateInterestRate(sector, tenor);
    const outstandingBalance = generateExposure(sector);
    const disbursementDate = new Date();
    disbursementDate.setMonth(
      disbursementDate.getMonth() - Math.floor(Math.random() * 24),
    );
    const maturityDate = new Date(disbursementDate);
    maturityDate.setMonth(maturityDate.getMonth() + tenor);
    const hasRegionIssue = Math.random() < missingRegionProbability;
    const hasDateIssue = Math.random() < invalidDateProbability;
    const hasSectorIssue = Math.random() < missingSectorProbability;
    assets.push({
      id: `FAC-${String(i + 1).padStart(6, "0")}`,
      facilityId: `FAC-${String(i + 1).padStart(6, "0")}`,
      borrowerName: borrowerName + (i % 10 === 0 ? ` ${i}` : ""),
      sector: hasSectorIssue ? "" : sector,
      region: hasRegionIssue ? "" : region,
      location: hasRegionIssue ? "" : location,
      outstandingBalance,
      currency: "NGN",
      assetType,
      collateralType,
      tenor,
      interestRate,
      disbursementDate: disbursementDate.toISOString().split("T")[0],
      maturityDate: hasDateIssue
        ? "invalid-date"
        : maturityDate.toISOString().split("T")[0],
      status: Math.random() > 0.05 ? "Active" : "Impaired",
      riskRating:
        outstandingBalance > 5000000
          ? Math.random() > 0.3
            ? "High"
            : "Medium"
          : "Low",
      latitude: -6.5 + Math.random() * 5,
      longitude: -3.0 + Math.random() * 3,
    });
  }
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * assets.length);
    assets.push({ ...assets[randomIndex], id: assets[randomIndex].id });
  }
  return assets;
}
export function populateDemoData(
  setAssetData: (assetType: string, data: AssetTypeData) => void,
) {
  const demoAssets = generateDemoAssets(500);
  const assetsByType: Record<string, Asset[]> = {};
  demoAssets.forEach((asset) => {
    const type = (asset.assetType as string) || "Term Loans";
    if (!assetsByType[type]) {
      assetsByType[type] = [];
    }
    assetsByType[type].push(asset);
  });
  Object.entries(assetsByType).forEach(([type, assets]) => {
    setAssetData(type, {
      type,
      data: assets,
      uploadedAt: new Date().toISOString(),
      fileName: `${type.replace(/ /g, "_").toLowerCase()}_demo_data.xlsx`,
      rowCount: assets.length,
      columnCount: 15,
      validationStatus: "validated",
      validationErrors: [],
    });
  });
  return demoAssets;
}
