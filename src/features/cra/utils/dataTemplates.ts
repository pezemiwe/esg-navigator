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
