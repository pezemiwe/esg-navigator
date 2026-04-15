export const TEMPLATE_DEFINITIONS = {
  loans_advances: {
    name: "Loans & Advances",
    columns: [
      {
        field: "Facility ID",
        type: "string",
        required: true,
        description: "Unique identifier for the facility",
      },
      {
        field: "Borrower Name",
        type: "string",
        required: true,
        description: "Name of the borrower",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Economic sector",
      },
      {
        field: "Subsector",
        type: "string",
        required: false,
        description: "Economic subsector",
      },
      {
        field: "Product Type",
        type: "string",
        required: true,
        description: "Type of loan product",
      },
      {
        field: "Loan Amount",
        type: "number",
        required: true,
        description: "Original loan amount",
      },
      {
        field: "Outstanding Balance",
        type: "number",
        required: true,
        description: "Current outstanding balance",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code (e.g., S, USD)",
      },
      {
        field: "Tenor (months)",
        type: "number",
        required: true,
        description: "Loan tenor in months",
      },
      {
        field: "Interest Rate (%)",
        type: "number",
        required: true,
        description: "Annual interest rate",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Date when loan was originated",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: true,
        description: "Loan maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Loan status (Active, NPL, Written-off, etc.)",
      },
      {
        field: "Address",
        type: "string",
        required: false,
        description: "Physical address",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
      {
        field: "Latitude",
        type: "number",
        required: false,
        description: "GPS latitude",
      },
      {
        field: "Longitude",
        type: "number",
        required: false,
        description: "GPS longitude",
      },
      {
        field: "Collateral Type",
        type: "string",
        required: false,
        description: "Type of collateral",
      },
      {
        field: "Collateral Value",
        type: "number",
        required: false,
        description: "Value of collateral",
      },
      {
        field: "Collateral Location",
        type: "string",
        required: false,
        description: "Location of collateral",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Group/Parent",
        type: "string",
        required: false,
        description: "Parent company or group",
      },
    ],
  },

  equities: {
    name: "Equities",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Equity Name",
        type: "string",
        required: true,
        description: "Name of the equity",
      },
      {
        field: "Issuer",
        type: "string",
        required: true,
        description: "Issuing company",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Economic sector",
      },
      {
        field: "Subsector",
        type: "string",
        required: false,
        description: "Economic subsector",
      },
      {
        field: "Number of Shares",
        type: "number",
        required: true,
        description: "Number of shares held",
      },
      {
        field: "Market Value",
        type: "number",
        required: true,
        description: "Current market value",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Acquisition Date",
        type: "date",
        required: true,
        description: "Date of acquisition",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Investment status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country of issuer",
      },
    ],
  },

  bonds_fixed_income: {
    name: "Bonds & Fixed Income",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Bond Name/Issuer",
        type: "string",
        required: true,
        description: "Name of the bond and issuer",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Economic sector",
      },
      {
        field: "Subsector",
        type: "string",
        required: false,
        description: "Economic subsector",
      },
      {
        field: "Face Value",
        type: "number",
        required: true,
        description: "Face value of bond",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Coupon Rate (%)",
        type: "number",
        required: true,
        description: "Annual coupon rate",
      },
      {
        field: "Issue Date",
        type: "date",
        required: true,
        description: "Bond issue date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: true,
        description: "Bond maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Bond status",
      },
      {
        field: "Credit Rating",
        type: "string",
        required: false,
        description: "Credit rating",
      },
      {
        field: "Market Value",
        type: "number",
        required: true,
        description: "Current market value",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country of issuer",
      },
    ],
  },

  derivatives: {
    name: "Derivatives",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Derivative Type",
        type: "string",
        required: true,
        description: "Type of derivative",
      },
      {
        field: "Underlying Asset",
        type: "string",
        required: true,
        description: "Underlying asset",
      },
      {
        field: "Notional Amount",
        type: "number",
        required: true,
        description: "Notional amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Counterparty Name",
        type: "string",
        required: true,
        description: "Counterparty name",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Trade Date",
        type: "date",
        required: true,
        description: "Trade date",
      },
      {
        field: "Maturity/Expiry Date",
        type: "date",
        required: true,
        description: "Maturity or expiry date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Derivative status",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  guarantees_obs: {
    name: "Guarantees & Off-Balance Sheet",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Guarantee Type",
        type: "string",
        required: true,
        description: "Type of guarantee",
      },
      {
        field: "Beneficiary Name",
        type: "string",
        required: true,
        description: "Beneficiary name",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Guarantee amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Issue Date",
        type: "date",
        required: true,
        description: "Issue date",
      },
      {
        field: "Expiry Date",
        type: "date",
        required: true,
        description: "Expiry date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Guarantee status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  other_asset_1: {
    name: "Other Asset 1",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Type of asset",
      },
      {
        field: "Description",
        type: "string",
        required: true,
        description: "Asset description",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Asset amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Origination date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: false,
        description: "Maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Asset status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  other_asset_2: {
    name: "Other Asset 2",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Type of asset",
      },
      {
        field: "Description",
        type: "string",
        required: true,
        description: "Asset description",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Asset amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Origination date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: false,
        description: "Maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Asset status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  other_asset_3: {
    name: "Other Asset 3",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Type of asset",
      },
      {
        field: "Description",
        type: "string",
        required: true,
        description: "Asset description",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Asset amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Origination date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: false,
        description: "Maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Asset status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  other_asset_4: {
    name: "Other Asset 4",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Type of asset",
      },
      {
        field: "Description",
        type: "string",
        required: true,
        description: "Asset description",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Asset amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Origination date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: false,
        description: "Maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Asset status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  other_asset_5: {
    name: "Other Asset 5",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Type of asset",
      },
      {
        field: "Description",
        type: "string",
        required: true,
        description: "Asset description",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Asset amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Origination date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: false,
        description: "Maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Asset status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  other_asset_6: {
    name: "Other Asset 6",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Type of asset",
      },
      {
        field: "Description",
        type: "string",
        required: true,
        description: "Asset description",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Asset amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Origination date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: false,
        description: "Maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Asset status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  other_asset_7: {
    name: "Other Asset 7",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Type of asset",
      },
      {
        field: "Description",
        type: "string",
        required: true,
        description: "Asset description",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Asset amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Origination date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: false,
        description: "Maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Asset status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  other_asset_8: {
    name: "Other Asset 8",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Type of asset",
      },
      {
        field: "Description",
        type: "string",
        required: true,
        description: "Asset description",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Asset amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Origination date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: false,
        description: "Maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Asset status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  other_asset_9: {
    name: "Other Asset 9",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Type of asset",
      },
      {
        field: "Description",
        type: "string",
        required: true,
        description: "Asset description",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Asset amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Origination date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: false,
        description: "Maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Asset status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  other_asset_10: {
    name: "Other Asset 10",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Type of asset",
      },
      {
        field: "Description",
        type: "string",
        required: true,
        description: "Asset description",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Asset amount",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Origination Date",
        type: "date",
        required: true,
        description: "Origination date",
      },
      {
        field: "Maturity Date",
        type: "date",
        required: false,
        description: "Maturity date",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Asset status",
      },
      {
        field: "Counterparty Type",
        type: "string",
        required: true,
        description: "Type of counterparty",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Administrative Geopolitical Zone",
      },
      {
        field: "State",
        type: "string",
        required: true,
        description: "State",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
    ],
  },

  tower_infrastructure: {
    name: "Tower Infrastructure",
    columns: [
      {
        field: "Tower ID",
        type: "string",
        required: true,
        description: "Unique tower identifier",
      },
      {
        field: "Tower Type",
        type: "string",
        required: true,
        description: "Tower type (Greenfield, Rooftop, Monopole, Camouflaged)",
      },
      {
        field: "Height (m)",
        type: "number",
        required: true,
        description: "Tower height in meters",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Latitude",
        type: "number",
        required: true,
        description: "GPS latitude",
      },
      {
        field: "Longitude",
        type: "number",
        required: true,
        description: "GPS longitude",
      },
      {
        field: "Capacity (Tenants)",
        type: "number",
        required: false,
        description: "Max tenant capacity",
      },
      {
        field: "Power Source",
        type: "string",
        required: true,
        description: "Power source type",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value in NGN",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational status",
      },
      {
        field: "Installation Year",
        type: "number",
        required: false,
        description: "Year of installation",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Business unit / segment",
      },
      {
        field: "Region",
        type: "string",
        required: false,
        description: "Operating region",
      },
    ],
  },

  fiber_network: {
    name: "Fiber Optic Network",
    columns: [
      {
        field: "Segment ID",
        type: "string",
        required: true,
        description: "Unique segment identifier",
      },
      {
        field: "Route Name",
        type: "string",
        required: true,
        description: "Route or corridor name",
      },
      {
        field: "Length (km)",
        type: "number",
        required: true,
        description: "Fiber route length in km",
      },
      {
        field: "Fiber Type",
        type: "string",
        required: true,
        description: "Fiber specification (e.g. G.652D)",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Installation Year",
        type: "number",
        required: true,
        description: "Year of installation",
      },
      {
        field: "Capacity (Gbps)",
        type: "number",
        required: true,
        description: "Design capacity in Gbps",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value in NGN",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational status",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Business unit / segment",
      },
      {
        field: "Region",
        type: "string",
        required: false,
        description: "Operating region",
      },
    ],
  },

  data_centers: {
    name: "Data Centers & Core Network",
    columns: [
      {
        field: "Facility ID",
        type: "string",
        required: true,
        description: "Unique facility identifier",
      },
      {
        field: "Facility Type",
        type: "string",
        required: true,
        description: "Type (Core DC, Edge Node, Switching Center)",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Power Capacity (MW)",
        type: "number",
        required: true,
        description: "IT power capacity in MW",
      },
      {
        field: "Cooling Type",
        type: "string",
        required: true,
        description: "Cooling system type",
      },
      {
        field: "Tier Level",
        type: "string",
        required: true,
        description: "Uptime tier classification",
      },
      {
        field: "PUE Rating",
        type: "number",
        required: true,
        description: "Power Usage Effectiveness ratio",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value in NGN",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational status",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Business unit / segment",
      },
      {
        field: "Region",
        type: "string",
        required: false,
        description: "Operating region",
      },
    ],
  },

  spectrum_licenses: {
    name: "Spectrum & Licenses",
    columns: [
      {
        field: "License ID",
        type: "string",
        required: true,
        description: "Unique license identifier",
      },
      {
        field: "Spectrum Band",
        type: "string",
        required: true,
        description: "Frequency band (e.g. 900 MHz)",
      },
      {
        field: "Bandwidth (MHz)",
        type: "number",
        required: false,
        description: "Allocated bandwidth in MHz",
      },
      {
        field: "Coverage Area",
        type: "string",
        required: true,
        description: "Geographic coverage scope",
      },
      {
        field: "Expiry Date",
        type: "date",
        required: true,
        description: "License expiry date",
      },
      {
        field: "License Fee",
        type: "number",
        required: true,
        description: "License acquisition cost in NGN",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Current net book value in NGN",
      },
      {
        field: "Technology (2G/3G/4G/5G)",
        type: "string",
        required: true,
        description: "Technology generation",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "License status",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Business unit / segment",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: false,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: false, description: "State" },
      {
        field: "Region",
        type: "string",
        required: false,
        description: "Coverage region",
      },
    ],
  },

  active_equipment: {
    name: "Active Network Equipment",
    columns: [
      {
        field: "Equipment ID",
        type: "string",
        required: true,
        description: "Unique equipment identifier",
      },
      {
        field: "Equipment Type",
        type: "string",
        required: true,
        description: "Equipment type (BTS, eNodeB, Router, etc.)",
      },
      {
        field: "Manufacturer",
        type: "string",
        required: true,
        description: "Equipment manufacturer",
      },
      {
        field: "Technology Generation",
        type: "string",
        required: true,
        description: "Technology (2G, 3G, 4G, 5G, IP)",
      },
      {
        field: "Site ID",
        type: "string",
        required: false,
        description: "Associated tower or facility ID",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Installation Date",
        type: "date",
        required: true,
        description: "Installation date",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value in NGN",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational status",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Business unit / segment",
      },
      {
        field: "Region",
        type: "string",
        required: false,
        description: "Operating region",
      },
    ],
  },

  power_systems: {
    name: "Power & Energy Systems",
    columns: [
      {
        field: "System ID",
        type: "string",
        required: true,
        description: "Unique system identifier",
      },
      {
        field: "Site ID",
        type: "string",
        required: true,
        description: "Associated tower or facility ID",
      },
      {
        field: "Power Type",
        type: "string",
        required: true,
        description: "Power solution type",
      },
      {
        field: "Capacity (kVA)",
        type: "number",
        required: true,
        description: "Power capacity in kVA",
      },
      {
        field: "Fuel Type",
        type: "string",
        required: true,
        description: "Fuel type (Diesel, Grid, Solar, Hybrid)",
      },
      {
        field: "Annual Fuel Cost",
        type: "number",
        required: true,
        description: "Annual fuel or energy cost in NGN",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value in NGN",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational status",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Business unit / segment",
      },
      {
        field: "Region",
        type: "string",
        required: false,
        description: "Operating region",
      },
    ],
  },

  real_estate_facilities: {
    name: "Real Estate & Office Facilities",
    columns: [
      {
        field: "Property ID",
        type: "string",
        required: true,
        description: "Unique property identifier",
      },
      {
        field: "Property Type",
        type: "string",
        required: true,
        description: "Property type (Office, Switch Room, Warehouse)",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Area (sqm)",
        type: "number",
        required: true,
        description: "Floor area in square meters",
      },
      {
        field: "Ownership Type",
        type: "string",
        required: true,
        description: "Owned or Leased",
      },
      {
        field: "Annual Rent",
        type: "number",
        required: false,
        description: "Annual rent in NGN (if leased)",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value in NGN",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational status",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Business unit / segment",
      },
      {
        field: "Region",
        type: "string",
        required: false,
        description: "Operating region",
      },
    ],
  },

  vehicle_fleet: {
    name: "Vehicle Fleet & Logistics",
    columns: [
      {
        field: "Vehicle ID",
        type: "string",
        required: true,
        description: "Unique vehicle identifier",
      },
      {
        field: "Vehicle Type",
        type: "string",
        required: true,
        description: "Vehicle type (Truck, Van, SUV)",
      },
      {
        field: "Fuel Type",
        type: "string",
        required: true,
        description: "Fuel type (Diesel, Petrol, CNG, Hybrid)",
      },
      {
        field: "Region",
        type: "string",
        required: true,
        description: "Operating region",
      },
      {
        field: "Annual Mileage",
        type: "number",
        required: true,
        description: "Annual distance in km",
      },
      {
        field: "Emissions (tCO2e)",
        type: "number",
        required: true,
        description: "Annual CO2 equivalent emissions",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value in NGN",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational status",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Business unit / segment",
      },
    ],
  },

  mobile_money_infra: {
    name: "Mobile Money & Fintech",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Type",
        type: "string",
        required: true,
        description: "Asset type (Agent Network, POS, Platform)",
      },
      {
        field: "Agent Count",
        type: "number",
        required: false,
        description: "Number of agents in network",
      },
      {
        field: "Region",
        type: "string",
        required: true,
        description: "Operating region",
      },
      {
        field: "Transaction Volume",
        type: "number",
        required: true,
        description: "Monthly transaction volume in NGN",
      },
      {
        field: "Platform",
        type: "string",
        required: true,
        description: "Platform name",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value in NGN",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational status",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Business unit / segment",
      },
    ],
  },

  supplier_operations: {
    name: "Supplier & Operations",
    columns: [
      {
        field: "Supplier ID",
        type: "string",
        required: true,
        description: "Unique supplier identifier",
      },
      {
        field: "Supplier Name",
        type: "string",
        required: true,
        description: "Supplier or vendor name",
      },
      {
        field: "Service Category",
        type: "string",
        required: true,
        description:
          "Service category (Managed Services, Maintenance, Logistics, Energy, Construction)",
      },
      {
        field: "Contract Value",
        type: "number",
        required: true,
        description: "Total contract value in NGN",
      },
      {
        field: "Contract Start",
        type: "date",
        required: true,
        description: "Contract start date",
      },
      {
        field: "Contract End",
        type: "date",
        required: true,
        description: "Contract end date",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value in NGN",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description:
          "Contract status (Active, Expiring, Expired, Under Review)",
      },
      {
        field: "Sector",
        type: "string",
        required: true,
        description: "Business unit / segment",
      },
      {
        field: "Region",
        type: "string",
        required: false,
        description: "Operating region",
      },
    ],
  },

  // ─── Data / ICT ────────────────────────────────────────
  data_centers: {
    name: "Data Centers",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Facility Name",
        type: "string",
        required: true,
        description: "Name of the data centre facility",
      },
      {
        field: "Address",
        type: "string",
        required: false,
        description: "Physical street address",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
      {
        field: "Latitude",
        type: "number",
        required: false,
        description: "GPS latitude",
      },
      {
        field: "Longitude",
        type: "number",
        required: false,
        description: "GPS longitude",
      },
      {
        field: "Capacity (MW)",
        type: "number",
        required: false,
        description: "IT load capacity in megawatts",
      },
      {
        field: "PUE",
        type: "number",
        required: false,
        description: "Power Usage Effectiveness ratio",
      },
      {
        field: "Tier Level",
        type: "string",
        required: false,
        description: "Uptime Institute tier (I–IV)",
      },
      {
        field: "Ownership",
        type: "string",
        required: true,
        description: "Owned or Leased",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value in local currency",
      },
      {
        field: "Annual Energy (kWh)",
        type: "number",
        required: false,
        description: "Annual energy consumption",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational, Under Construction, Decommissioned",
      },
      {
        field: "Sector",
        type: "string",
        required: false,
        description: "Business segment",
      },
    ],
  },

  server_infrastructure: {
    name: "Server Infrastructure",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Name",
        type: "string",
        required: true,
        description: "Descriptive name",
      },
      {
        field: "Type",
        type: "string",
        required: true,
        description: "Server, Storage Array, HPC, etc.",
      },
      {
        field: "Manufacturer",
        type: "string",
        required: false,
        description: "Hardware manufacturer",
      },
      {
        field: "Model",
        type: "string",
        required: false,
        description: "Model number",
      },
      {
        field: "Rack Units",
        type: "number",
        required: false,
        description: "Number of rack units occupied",
      },
      {
        field: "Location",
        type: "string",
        required: true,
        description: "Data centre or facility name",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
      {
        field: "Age (Years)",
        type: "number",
        required: false,
        description: "Asset age in years",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value",
      },
      {
        field: "Annual Power (kWh)",
        type: "number",
        required: false,
        description: "Annual power consumption",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Active, Standby, Decommissioned",
      },
    ],
  },

  network_equipment: {
    name: "Network Equipment",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Asset Name",
        type: "string",
        required: true,
        description: "Descriptive name",
      },
      {
        field: "Type",
        type: "string",
        required: true,
        description: "Router, Switch, Firewall, Load Balancer, etc.",
      },
      {
        field: "Manufacturer",
        type: "string",
        required: false,
        description: "Hardware manufacturer",
      },
      {
        field: "Location",
        type: "string",
        required: true,
        description: "Site or facility",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value",
      },
      {
        field: "Age (Years)",
        type: "number",
        required: false,
        description: "Asset age in years",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Active, Fault, Replaced",
      },
      {
        field: "Sector",
        type: "string",
        required: false,
        description: "Business segment",
      },
    ],
  },

  // ─── Direct Operations ─────────────────────────────────
  offices_facilities: {
    name: "Offices & Facilities",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Facility Name",
        type: "string",
        required: true,
        description: "Name of the facility",
      },
      {
        field: "Address",
        type: "string",
        required: false,
        description: "Street address",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
      {
        field: "Latitude",
        type: "number",
        required: false,
        description: "GPS latitude",
      },
      {
        field: "Longitude",
        type: "number",
        required: false,
        description: "GPS longitude",
      },
      {
        field: "Type",
        type: "string",
        required: true,
        description: "Head Office, Branch, Warehouse, Retail, etc.",
      },
      {
        field: "Floor Area (sqm)",
        type: "number",
        required: false,
        description: "Total floor area in square metres",
      },
      {
        field: "Ownership",
        type: "string",
        required: true,
        description: "Owned or Leased",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value or annual rent cost",
      },
      {
        field: "Annual Energy (kWh)",
        type: "number",
        required: false,
        description: "Annual energy consumption",
      },
      {
        field: "Year Built",
        type: "number",
        required: false,
        description: "Year of construction",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Active, Vacant, Under Renovation",
      },
      {
        field: "Sector",
        type: "string",
        required: false,
        description: "Business unit / segment",
      },
    ],
  },

  company_fleet: {
    name: "Company Fleet",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Registration",
        type: "string",
        required: true,
        description: "Vehicle registration number",
      },
      {
        field: "Type",
        type: "string",
        required: true,
        description: "Sedan, SUV, Van, Truck, Motorcycle, Bus, etc.",
      },
      {
        field: "Fuel Type",
        type: "string",
        required: true,
        description: "Petrol, Diesel, Electric, Hybrid, CNG",
      },
      {
        field: "Year",
        type: "number",
        required: false,
        description: "Manufacture year",
      },
      {
        field: "Make / Model",
        type: "string",
        required: false,
        description: "Vehicle make and model",
      },
      {
        field: "Assigned Base",
        type: "string",
        required: false,
        description: "Primary base location",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value",
      },
      {
        field: "Annual Km",
        type: "number",
        required: false,
        description: "Average annual kilometres driven",
      },
      {
        field: "Annual Fuel Cost",
        type: "number",
        required: false,
        description: "Annual fuel or energy cost",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Active, Disposed, Under Repair",
      },
    ],
  },

  industrial_equipment: {
    name: "Industrial Equipment",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Equipment Name",
        type: "string",
        required: true,
        description: "Descriptive name",
      },
      {
        field: "Type",
        type: "string",
        required: true,
        description: "Generator, Compressor, Pump, CNC Machine, etc.",
      },
      {
        field: "Manufacturer",
        type: "string",
        required: false,
        description: "Equipment manufacturer",
      },
      {
        field: "Capacity",
        type: "string",
        required: false,
        description: "Rated capacity with unit (e.g. 500 kVA)",
      },
      {
        field: "Fuel Type",
        type: "string",
        required: false,
        description: "Diesel, Gas, Electric, etc.",
      },
      {
        field: "Location",
        type: "string",
        required: true,
        description: "Site or facility name",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
      {
        field: "Age (Years)",
        type: "number",
        required: false,
        description: "Asset age",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value",
      },
      {
        field: "Annual Fuel Cost",
        type: "number",
        required: false,
        description: "Annual fuel / energy cost",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational, Under Maintenance, Decommissioned",
      },
    ],
  },

  // ─── Supply Chain ──────────────────────────────────────
  tier1_suppliers: {
    name: "Tier 1 Suppliers",
    columns: [
      {
        field: "Supplier ID",
        type: "string",
        required: true,
        description: "Unique supplier identifier",
      },
      {
        field: "Supplier Name",
        type: "string",
        required: true,
        description: "Legal name of the supplier",
      },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country of primary operations",
      },
      {
        field: "Region",
        type: "string",
        required: false,
        description: "Region or state",
      },
      {
        field: "Address",
        type: "string",
        required: false,
        description: "Physical address",
      },
      {
        field: "Latitude",
        type: "number",
        required: false,
        description: "GPS latitude",
      },
      {
        field: "Longitude",
        type: "number",
        required: false,
        description: "GPS longitude",
      },
      {
        field: "Category",
        type: "string",
        required: true,
        description: "Goods, Services, Raw Materials, IT, Logistics, etc.",
      },
      {
        field: "Annual Spend",
        type: "number",
        required: true,
        description: "Annual procurement spend",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Spend currency code",
      },
      {
        field: "Contract Start",
        type: "date",
        required: false,
        description: "Contract start date",
      },
      {
        field: "Contract End",
        type: "date",
        required: false,
        description: "Contract end or renewal date",
      },
      {
        field: "Credit Score",
        type: "string",
        required: false,
        description: "Internal or external credit rating",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Active, Under Review, Blacklisted, Exited",
      },
    ],
  },

  logistics_transport: {
    name: "Logistics & Transport",
    columns: [
      {
        field: "Provider ID",
        type: "string",
        required: true,
        description: "Unique provider identifier",
      },
      {
        field: "Provider Name",
        type: "string",
        required: true,
        description: "Logistics service provider name",
      },
      {
        field: "Mode",
        type: "string",
        required: true,
        description: "Road, Rail, Air, Sea, Multimodal",
      },
      {
        field: "Origin Country",
        type: "string",
        required: false,
        description: "Primary origin country",
      },
      {
        field: "Destination Country",
        type: "string",
        required: false,
        description: "Primary destination country",
      },
      {
        field: "Route Description",
        type: "string",
        required: false,
        description: "Brief route description",
      },
      {
        field: "Latitude",
        type: "number",
        required: false,
        description: "Hub latitude",
      },
      {
        field: "Longitude",
        type: "number",
        required: false,
        description: "Hub longitude",
      },
      {
        field: "Annual Spend",
        type: "number",
        required: true,
        description: "Annual logistics spend",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Spend currency code",
      },
      {
        field: "Annual Tonnes CO2e",
        type: "number",
        required: false,
        description: "Annual GHG emissions (tonnes CO2e)",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Active, Suspended, Terminated",
      },
    ],
  },

  procurement_data: {
    name: "Procurement Data",
    columns: [
      {
        field: "PO ID",
        type: "string",
        required: true,
        description: "Purchase order number",
      },
      {
        field: "Supplier Name",
        type: "string",
        required: true,
        description: "Supplier / vendor name",
      },
      {
        field: "Category",
        type: "string",
        required: true,
        description: "Procurement category",
      },
      {
        field: "Amount",
        type: "number",
        required: true,
        description: "Order value",
      },
      {
        field: "Currency",
        type: "string",
        required: true,
        description: "Currency code",
      },
      {
        field: "Order Date",
        type: "date",
        required: true,
        description: "Date the PO was raised",
      },
      {
        field: "Delivery Date",
        type: "date",
        required: false,
        description: "Expected or actual delivery date",
      },
      {
        field: "Country of Origin",
        type: "string",
        required: false,
        description: "Country of supplier",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Open, Delivered, Cancelled, Disputed",
      },
    ],
  },

  // ─── Infrastructure ────────────────────────────────────
  physical_buildings: {
    name: "Physical Buildings",
    columns: [
      {
        field: "Asset ID",
        type: "string",
        required: true,
        description: "Unique asset identifier",
      },
      {
        field: "Building Name",
        type: "string",
        required: true,
        description: "Name or description of the building",
      },
      {
        field: "Address",
        type: "string",
        required: false,
        description: "Street address",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
      {
        field: "Latitude",
        type: "number",
        required: false,
        description: "GPS latitude",
      },
      {
        field: "Longitude",
        type: "number",
        required: false,
        description: "GPS longitude",
      },
      {
        field: "Type",
        type: "string",
        required: true,
        description:
          "Office, Residential, Industrial, Mixed-Use, Warehouse, etc.",
      },
      {
        field: "Ownership",
        type: "string",
        required: true,
        description: "Owned or Leased",
      },
      {
        field: "Floor Area (sqm)",
        type: "number",
        required: false,
        description: "Total gross floor area",
      },
      {
        field: "Number of Floors",
        type: "number",
        required: false,
        description: "Total number of floors",
      },
      {
        field: "Year Built",
        type: "number",
        required: false,
        description: "Year of construction",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book value",
      },
      {
        field: "Annual Maintenance Cost",
        type: "number",
        required: false,
        description: "Annual maintenance spend",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Operational, Vacant, Under Construction, Disposed",
      },
    ],
  },

  utility_connections: {
    name: "Utility Connections",
    columns: [
      {
        field: "Connection ID",
        type: "string",
        required: true,
        description: "Unique connection identifier",
      },
      {
        field: "Utility Type",
        type: "string",
        required: true,
        description: "Electricity, Water, Gas, Telecom, Sewage",
      },
      {
        field: "Provider",
        type: "string",
        required: false,
        description: "Utility provider / distribution company",
      },
      {
        field: "Site Name",
        type: "string",
        required: true,
        description: "Site or facility served",
      },
      {
        field: "Address",
        type: "string",
        required: false,
        description: "Physical address of connection point",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
      {
        field: "Annual Consumption",
        type: "number",
        required: false,
        description: "Annual consumption quantity",
      },
      {
        field: "Unit",
        type: "string",
        required: false,
        description: "Unit of consumption (kWh, m³, litres, etc.)",
      },
      {
        field: "Annual Cost",
        type: "number",
        required: false,
        description: "Annual utility cost",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Active, Disconnected, Intermittent",
      },
    ],
  },

  land_assets: {
    name: "Land Assets",
    columns: [
      {
        field: "Parcel ID",
        type: "string",
        required: true,
        description: "Unique land parcel identifier",
      },
      {
        field: "Description",
        type: "string",
        required: false,
        description: "Brief description of the parcel",
      },
      {
        field: "Address",
        type: "string",
        required: false,
        description: "Location address or description",
      },
      {
        field: "Geopolitical Zone",
        type: "string",
        required: true,
        description: "Geopolitical zone",
      },
      { field: "State", type: "string", required: true, description: "State" },
      {
        field: "Country",
        type: "string",
        required: true,
        description: "Country",
      },
      {
        field: "Latitude",
        type: "number",
        required: false,
        description: "GPS latitude (centroid)",
      },
      {
        field: "Longitude",
        type: "number",
        required: false,
        description: "GPS longitude (centroid)",
      },
      {
        field: "Area (Ha)",
        type: "number",
        required: false,
        description: "Land area in hectares",
      },
      {
        field: "Land Use",
        type: "string",
        required: true,
        description:
          "Agricultural, Commercial, Industrial, Residential, Conservation, etc.",
      },
      {
        field: "Tenure",
        type: "string",
        required: true,
        description: "Freehold, Leasehold, Statutory Right of Occupancy, etc.",
      },
      {
        field: "Net Book Value",
        type: "number",
        required: true,
        description: "Net book / market value",
      },
      {
        field: "Status",
        type: "string",
        required: true,
        description: "Active, Idle, Disputed, Under Development",
      },
    ],
  },
};

export const VALIDATION_RULES = {
  required: (value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return "This field is required";
    }
    return null;
  },

  number: (value: unknown) => {
    if (isNaN(Number(value))) {
      return "Must be a valid number";
    }
    return null;
  },

  date: (value: unknown) => {
    const date = new Date(value as string);
    if (isNaN(date.getTime())) {
      return "Must be a valid date";
    }
    return null;
  },

  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Must be a valid email address";
    }
    return null;
  },

  currency: (value: string) => {
    const validCurrencies = ["NGN", "USD", "EUR", "GBP"];
    if (!validCurrencies.includes(value.toUpperCase())) {
      return `Must be one of: ${validCurrencies.join(", ")}`;
    }
    return null;
  },
};

export const SAMPLE_DATA = {
  loans_advances: [
    {
      "Facility ID": "LN-2024-001",
      "Borrower Name": "ABC Manufacturing Ltd",
      Sector: "Manufacturing",
      Subsector: "Textiles",
      "Product Type": "Term Loan",
      "Loan Amount": 500000,
      "Outstanding Balance": 450000,
      Currency: "NGN",
      "Tenor (months)": 36,
      "Interest Rate (%)": 15.5,
      "Origination Date": "2024-01-15",
      "Maturity Date": "2027-01-15",
      Status: "Active",
      Address: "123 Industrial Area",
      Region: "Greater Lagos",
      City: "Lagos",
      Country: "ana",
      Latitude: 5.6037,
      Longitude: -0.187,
      "Collateral Type": "Real Estate",
      "Collateral Value": 750000,
      "Collateral Location": "Lagos",
      "Counterparty Type": "Corporate",
      "Group/Parent": "ABC Group",
    },
  ],

  equities: [
    {
      "Asset ID": "EQ-2024-001",
      "Equity Name": "Deloitte Nigeria",
      Issuer: "Deloitte Limited",
      Sector: "Financial Services",
      Subsector: "Banking",
      "Number of Shares": 10000,
      "Market Value": 45000,
      Currency: "NGN",
      "Acquisition Date": "2024-01-10",
      Status: "Active",
      "Counterparty Type": "Listed Company",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  bonds_fixed_income: [
    {
      "Asset ID": "BD-2024-001",
      "Bond Name": "ana Government Bond 2027",
      Issuer: "Government of ana",
      Sector: "Government",
      Subsector: "Sovereign",
      "Face Value": 1000000,
      Currency: "NGN",
      "Coupon Rate (%)": 18.5,
      "Issue Date": "2024-01-01",
      "Maturity Date": "2027-01-01",
      Status: "Active",
      "Credit Rating": "B-",
      "Market Value": 980000,
      "Counterparty Type": "Sovereign",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  derivatives: [
    {
      "Asset ID": "DV-2024-001",
      "Derivative Type": "Interest Rate Swap",
      "Underlying Asset": "ana 91-Day T-Bill",
      "Notional Amount": 500000,
      Currency: "NGN",
      "Counterparty Name": "ABC Bank",
      "Counterparty Type": "Financial Institution",
      "Trade Date": "2024-01-15",
      "Maturity/Expiry Date": "2025-01-15",
      Status: "Active",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  guarantees_obs: [
    {
      "Asset ID": "GT-2024-001",
      "Guarantee Type": "Performance Guarantee",
      "Beneficiary Name": "XYZ Construction Ltd",
      Amount: 200000,
      Currency: "NGN",
      "Issue Date": "2024-01-10",
      "Expiry Date": "2025-01-10",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  other_asset_1: [
    {
      "Asset ID": "OA1-2024-001",
      "Asset Type": "Other Financial Instrument",
      Description: "Miscellaneous financial asset",
      Amount: 150000,
      Currency: "NGN",
      "Origination Date": "2024-01-15",
      "Maturity Date": "2025-01-15",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  other_asset_2: [
    {
      "Asset ID": "OA2-2024-001",
      "Asset Type": "Other Financial Instrument",
      Description: "Miscellaneous financial asset",
      Amount: 150000,
      Currency: "NGN",
      "Origination Date": "2024-01-15",
      "Maturity Date": "2025-01-15",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  other_asset_3: [
    {
      "Asset ID": "OA3-2024-001",
      "Asset Type": "Other Financial Instrument",
      Description: "Miscellaneous financial asset",
      Amount: 150000,
      Currency: "NGN",
      "Origination Date": "2024-01-15",
      "Maturity Date": "2025-01-15",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  other_asset_4: [
    {
      "Asset ID": "OA4-2024-001",
      "Asset Type": "Other Financial Instrument",
      Description: "Miscellaneous financial asset",
      Amount: 150000,
      Currency: "NGN",
      "Origination Date": "2024-01-15",
      "Maturity Date": "2025-01-15",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  other_asset_5: [
    {
      "Asset ID": "OA5-2024-001",
      "Asset Type": "Other Financial Instrument",
      Description: "Miscellaneous financial asset",
      Amount: 150000,
      Currency: "NGN",
      "Origination Date": "2024-01-15",
      "Maturity Date": "2025-01-15",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  other_asset_6: [
    {
      "Asset ID": "OA6-2024-001",
      "Asset Type": "Other Financial Instrument",
      Description: "Miscellaneous financial asset",
      Amount: 150000,
      Currency: "NGN",
      "Origination Date": "2024-01-15",
      "Maturity Date": "2025-01-15",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  other_asset_7: [
    {
      "Asset ID": "OA7-2024-001",
      "Asset Type": "Other Financial Instrument",
      Description: "Miscellaneous financial asset",
      Amount: 150000,
      Currency: "NGN",
      "Origination Date": "2024-01-15",
      "Maturity Date": "2025-01-15",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  other_asset_8: [
    {
      "Asset ID": "OA8-2024-001",
      "Asset Type": "Other Financial Instrument",
      Description: "Miscellaneous financial asset",
      Amount: 150000,
      Currency: "NGN",
      "Origination Date": "2024-01-15",
      "Maturity Date": "2025-01-15",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  other_asset_9: [
    {
      "Asset ID": "OA9-2024-001",
      "Asset Type": "Other Financial Instrument",
      Description: "Miscellaneous financial asset",
      Amount: 150000,
      Currency: "NGN",
      "Origination Date": "2024-01-15",
      "Maturity Date": "2025-01-15",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  other_asset_10: [
    {
      "Asset ID": "OA10-2024-001",
      "Asset Type": "Other Financial Instrument",
      Description: "Miscellaneous financial asset",
      Amount: 150000,
      Currency: "NGN",
      "Origination Date": "2024-01-15",
      "Maturity Date": "2025-01-15",
      Status: "Active",
      "Counterparty Type": "Corporate",
      Region: "Greater Lagos",
      Country: "ana",
    },
  ],

  tower_infrastructure: [
    {
      "Tower ID": "TWR-SAMPLE-001",
      "Tower Type": "Greenfield",
      "Height (m)": 45,
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Latitude: 6.4531,
      Longitude: 3.3958,
      "Capacity (Tenants)": 3,
      "Power Source": "Hybrid (Grid + Solar)",
      "Net Book Value": 85000000,
      Status: "Active",
      "Installation Year": 2019,
      Sector: "Consumer Mobile",
      Region: "Lagos Metro",
    },
  ],

  fiber_network: [
    {
      "Segment ID": "FBR-SAMPLE-001",
      "Route Name": "Lagos-Ibadan Backbone",
      "Length (km)": 128,
      "Fiber Type": "Single Mode G.652D",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      "Installation Year": 2019,
      "Capacity (Gbps)": 400,
      "Net Book Value": 450000000,
      Status: "Active",
      Sector: "Wholesale & Interconnect",
      Region: "Lagos Metro",
    },
  ],

  data_centers: [
    {
      "Facility ID": "DC-SAMPLE-001",
      "Facility Type": "Core Data Center",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      "Power Capacity (MW)": 12.5,
      "Cooling Type": "Precision Air + Chilled Water",
      "Tier Level": "Tier III",
      "PUE Rating": 1.45,
      "Net Book Value": 4500000000,
      Status: "Active",
      Sector: "Data & Digital Services",
      Region: "Lagos Metro",
    },
  ],

  spectrum_licenses: [
    {
      "License ID": "SPL-SAMPLE-001",
      "Spectrum Band": "1800 MHz",
      "Bandwidth (MHz)": 20,
      "Coverage Area": "Nationwide",
      "Expiry Date": "2035-06-30",
      "License Fee": 45000000000,
      "Net Book Value": 42000000000,
      "Technology (2G/3G/4G/5G)": "4G LTE",
      Status: "Active",
      Sector: "Consumer Mobile",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Region: "Nationwide",
    },
  ],

  active_equipment: [
    {
      "Equipment ID": "EQP-SAMPLE-001",
      "Equipment Type": "Base Station (eNodeB)",
      Manufacturer: "Ericsson",
      "Technology Generation": "4G LTE",
      "Site ID": "TWR-001",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      "Installation Date": "2019-03-15",
      "Net Book Value": 45000000,
      Status: "Active",
      Sector: "Consumer Mobile",
      Region: "Lagos Metro",
    },
  ],

  power_systems: [
    {
      "System ID": "PWR-SAMPLE-001",
      "Site ID": "TWR-001",
      "Power Type": "Hybrid (Grid + Solar)",
      "Capacity (kVA)": 15,
      "Fuel Type": "Grid/Solar",
      "Annual Fuel Cost": 1200000,
      "Geopolitical Zone": "South West",
      State: "Lagos",
      "Net Book Value": 12000000,
      Status: "Active",
      Sector: "Consumer Mobile",
      Region: "Lagos Metro",
    },
  ],

  real_estate_facilities: [
    {
      "Property ID": "REF-SAMPLE-001",
      "Property Type": "Corporate Headquarters",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      "Area (sqm)": 12500,
      "Ownership Type": "Owned",
      "Annual Rent": 0,
      "Net Book Value": 8500000000,
      Status: "Active",
      Sector: "Enterprise Services",
      Region: "Lagos Metro",
    },
  ],

  vehicle_fleet: [
    {
      "Vehicle ID": "VEH-SAMPLE-001",
      "Vehicle Type": "Service Truck",
      "Fuel Type": "Diesel",
      Region: "Lagos Metro",
      "Annual Mileage": 45000,
      "Emissions (tCO2e)": 14.2,
      "Net Book Value": 18000000,
      Status: "Active",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Sector: "Consumer Mobile",
    },
  ],

  mobile_money_infra: [
    {
      "Asset ID": "MMA-SAMPLE-001",
      "Asset Type": "Agent Network",
      "Agent Count": 85000,
      Region: "Lagos Metro",
      "Transaction Volume": 12500000000,
      Platform: "MoMo PSB",
      "Net Book Value": 2500000000,
      Status: "Active",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Sector: "Mobile Money (MoMo)",
    },
  ],

  supplier_operations: [
    {
      "Supplier ID": "SUP-SAMPLE-001",
      "Supplier Name": "ATC Nigeria Tower Co.",
      "Service Category": "Managed Services",
      "Contract Value": 3500000000,
      "Contract Start": "2023-01-01",
      "Contract End": "2027-12-31",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      "Net Book Value": 2800000000,
      Status: "Active",
      Sector: "Tower Infrastructure",
      Region: "Lagos Metro",
    },
  ],

  // ─── Data / ICT ────────────────────────────────────────
  data_centers: [
    {
      "Asset ID": "DC-SAMPLE-001",
      "Facility Name": "Lagos Tier-III Data Centre",
      Address: "Plot 15, Lekki Free Trade Zone",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Country: "Nigeria",
      Latitude: 6.4698,
      Longitude: 3.5852,
      "Capacity (MW)": 2.5,
      PUE: 1.6,
      "Tier Level": "III",
      Ownership: "Owned",
      "Net Book Value": 4500000000,
      "Annual Energy (kWh)": 21900000,
      Status: "Operational",
      Sector: "ICT Infrastructure",
    },
  ],

  server_infrastructure: [
    {
      "Asset ID": "SRV-SAMPLE-001",
      "Asset Name": "Core Banking Server Cluster",
      Type: "Server",
      Manufacturer: "Dell Technologies",
      Model: "PowerEdge R750",
      "Rack Units": 120,
      Location: "Lagos Tier-III Data Centre",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Country: "Nigeria",
      "Age (Years)": 3,
      "Net Book Value": 850000000,
      "Annual Power (kWh)": 1050000,
      Status: "Active",
    },
  ],

  network_equipment: [
    {
      "Asset ID": "NET-SAMPLE-001",
      "Asset Name": "Core Distribution Router",
      Type: "Router",
      Manufacturer: "Cisco",
      Location: "Lagos Head Office",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Country: "Nigeria",
      "Net Book Value": 45000000,
      "Age (Years)": 4,
      Status: "Active",
      Sector: "ICT Infrastructure",
    },
  ],

  // ─── Direct Operations ─────────────────────────────────
  offices_facilities: [
    {
      "Asset ID": "FAC-SAMPLE-001",
      "Facility Name": "Agricultural Bank Head Office",
      Address: "1 Thorpe Road, Ridgeway",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Country: "Nigeria",
      Latitude: 6.5244,
      Longitude: 3.3792,
      Type: "Head Office",
      "Floor Area (sqm)": 8500,
      Ownership: "Owned",
      "Net Book Value": 6200000000,
      "Annual Energy (kWh)": 3285000,
      "Year Built": 2008,
      Status: "Active",
      Sector: "Corporate",
    },
  ],

  company_fleet: [
    {
      "Asset ID": "FLT-SAMPLE-001",
      Registration: "LND-123XY",
      Type: "SUV",
      "Fuel Type": "Petrol",
      Year: 2022,
      "Make / Model": "Toyota Land Cruiser",
      "Assigned Base": "Lagos Head Office",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Country: "Nigeria",
      "Net Book Value": 38000000,
      "Annual Km": 35000,
      "Annual Fuel Cost": 3200000,
      Status: "Active",
    },
  ],

  industrial_equipment: [
    {
      "Asset ID": "IND-SAMPLE-001",
      "Equipment Name": "Main Backup Generator",
      Type: "Generator",
      Manufacturer: "Mantrac Caterpillar",
      Capacity: "1000 kVA",
      "Fuel Type": "Diesel",
      Location: "Lagos Head Office",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Country: "Nigeria",
      "Age (Years)": 5,
      "Net Book Value": 75000000,
      "Annual Fuel Cost": 12000000,
      Status: "Operational",
    },
  ],

  // ─── Supply Chain ──────────────────────────────────────
  tier1_suppliers: [
    {
      "Supplier ID": "SUP-SAMPLE-001",
      "Supplier Name": "Printserve Nigeria Ltd",
      Country: "Nigeria",
      Region: "Lagos",
      Address: "25 Bode Thomas Street, Surulere",
      Latitude: 6.5017,
      Longitude: 3.3615,
      Category: "Printing & Stationery",
      "Annual Spend": 85000000,
      Currency: "NGN",
      "Contract Start": "2024-01-01",
      "Contract End": "2026-12-31",
      "Credit Score": "A-",
      Status: "Active",
    },
  ],

  logistics_transport: [
    {
      "Provider ID": "LOG-SAMPLE-001",
      "Provider Name": "DHL Supply Chain Nigeria",
      Mode: "Road",
      "Origin Country": "Nigeria",
      "Destination Country": "Nigeria",
      "Route Description": "Lagos – Abuja last-mile deliveries",
      Latitude: 6.5244,
      Longitude: 3.3792,
      "Annual Spend": 120000000,
      Currency: "NGN",
      "Annual Tonnes CO2e": 320,
      Status: "Active",
    },
  ],

  procurement_data: [
    {
      "PO ID": "PO-SAMPLE-20240001",
      "Supplier Name": "Printserve Nigeria Ltd",
      Category: "Printing & Stationery",
      Amount: 4500000,
      Currency: "NGN",
      "Order Date": "2024-01-15",
      "Delivery Date": "2024-01-30",
      "Country of Origin": "Nigeria",
      Status: "Delivered",
    },
  ],

  // ─── Infrastructure ────────────────────────────────────
  physical_buildings: [
    {
      "Asset ID": "BLD-SAMPLE-001",
      "Building Name": "Agricultural Bank Tower A",
      Address: "1 Thorpe Road, Ridgeway",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Country: "Nigeria",
      Latitude: 6.5244,
      Longitude: 3.3792,
      Type: "Office",
      Ownership: "Owned",
      "Floor Area (sqm)": 12000,
      "Number of Floors": 18,
      "Year Built": 2005,
      "Net Book Value": 9500000000,
      "Annual Maintenance Cost": 185000000,
      Status: "Operational",
    },
  ],

  utility_connections: [
    {
      "Connection ID": "UTL-SAMPLE-001",
      "Utility Type": "Electricity",
      Provider: "Eko Electricity Distribution Company",
      "Site Name": "Agricultural Bank Head Office",
      Address: "1 Thorpe Road, Ridgeway",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Country: "Nigeria",
      "Annual Consumption": 3285000,
      Unit: "kWh",
      "Annual Cost": 214000000,
      Status: "Active",
    },
  ],

  land_assets: [
    {
      "Parcel ID": "LND-SAMPLE-001",
      Description: "Corporate campus land",
      Address: "Km 15 Lekki-Epe Expressway",
      "Geopolitical Zone": "South West",
      State: "Lagos",
      Country: "Nigeria",
      Latitude: 6.4481,
      Longitude: 3.5217,
      "Area (Ha)": 4.2,
      "Land Use": "Commercial",
      Tenure: "Freehold",
      "Net Book Value": 3800000000,
      Status: "Active",
    },
  ],
};

export const generateCSVTemplate = (
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
): string => {
  const template = TEMPLATE_DEFINITIONS[assetType];
  if (!template) return "";

  const headers = template.columns.map((col) => col.field).join(",");
  const sampleRow = (SAMPLE_DATA as Record<string, Record<string, unknown>[]>)[
    assetType
  ]?.[0];

  if (sampleRow) {
    const values = template.columns
      .map((col) => {
        const value = sampleRow[col.field];
        return typeof value === "string" && value.includes(",")
          ? `"${value}"`
          : value;
      })
      .join(",");
    return `${headers}\n${values}`;
  }

  return headers;
};

export const validateUploadedData = (
  data: Record<string, unknown>[],
  assetType: keyof typeof TEMPLATE_DEFINITIONS,
) => {
  const template = TEMPLATE_DEFINITIONS[assetType];
  const errors: Array<{ row: number; field: string; error: string }> = [];

  data.forEach((row, rowIndex) => {
    template.columns.forEach((column) => {
      const value = row[column.field];

      if (column.required) {
        const error = VALIDATION_RULES.required(value);
        if (error) {
          errors.push({
            row: rowIndex + 1,
            field: column.field,
            error: error,
          });
        }
      }

      if (value !== null && value !== undefined && value !== "") {
        if (column.type === "number") {
          const error = VALIDATION_RULES.number(value);
          if (error) {
            errors.push({
              row: rowIndex + 1,
              field: column.field,
              error: error,
            });
          }
        } else if (column.type === "date") {
          const error = VALIDATION_RULES.date(value);
          if (error) {
            errors.push({
              row: rowIndex + 1,
              field: column.field,
              error: error,
            });
          }
        }
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};
