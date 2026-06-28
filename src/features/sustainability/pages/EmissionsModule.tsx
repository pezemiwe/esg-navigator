/* eslint-disable */
// @ts-nocheck
import { useState, useMemo, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  Flame,
  Zap,
  Building2,
  FileText,
  Check,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Download,
  LayoutDashboard,
  Info,
  Loader2,
  Database,
  FileSpreadsheet,
  Bell,
  BellOff,
  LayoutGrid,
} from "lucide-react";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
import { getRegion } from "@/store/regionStore";
import { ThemeToggle } from "@/components/ui/ThemeToggle/ThemeToggle";
import { NavBrand } from "@/components/layout/DashboardNavbar/NavBrand";
import { UserMenu } from "@/components/layout/DashboardNavbar/UserMenu";
import type { Scope1Asset, Scope2Entry } from "@/store/sustainabilityStore";
import {
  calculateScope1,
  calculateScope2,
  formatNumber,
  EMISSION_FACTORS,
  MRIO_SECTOR_INTENSITIES,
} from "../data/constants";
import type { PortfolioAsset } from "../data/portfolioData";

// Deloitte Design System Colors
const DELOITTE_GREEN = "#86bc25";
const DELOITTE_DARK_GREEN = "#00533f";
const DELOITTE_LIME = "#c4d600";
const DELOITTE_TEAL = "#007680";
const DELOITTE_AMBER = "#ed8b00";
const DELOITTE_RED = "#da291c";
const DELOITTE_BLACK = "#000000";
// Ordered palette for charts (rotates)
const DELOITTE_PALETTE = [
  DELOITTE_GREEN,
  DELOITTE_DARK_GREEN,
  DELOITTE_LIME,
  DELOITTE_TEAL,
  DELOITTE_AMBER,
  DELOITTE_RED,
  "#43b02a",
  "#62b5e5",
];
// DQS scale colors: 1 best (dark green) -> 5 poor (red)
const DQS_COLORS: Record<number, string> = {
  1: DELOITTE_DARK_GREEN,
  2: DELOITTE_GREEN,
  3: DELOITTE_LIME,
  4: DELOITTE_AMBER,
  5: DELOITTE_RED,
};

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   CSV TEMPLATES â€” match BOI parser expectations
   Header row contains the columns the merge logic looks for.
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const buildCsvTemplates = (): Record<string, { name: string; csv: string }> => {
  const sym = getRegion().currencySymbol;
  return {
    s1: {
      name: "S1_Financial_Asset_Template.csv",
      csv: [
        "BOI FINANCED EMISSIONS MODEL v3 â€” S1 Financial Asset Data",
        "Fill rows below the header. Values in $m unless otherwise noted.",
        "",
        `#,Asset Class,Counterparty / Asset,Instrument Type,Exposure Metric,Input Currency,Exposure (${sym}m â€” if local),Exposure ($m â€” auto),Denom Currency,Denominator (${sym}m â€” if local),Denominator ($m â€” auto),Denominator Basis,Reporting Year`,
        "1,Corporate Loan,Sample Counterparty Ltd,Term Loan,Outstanding Loan,USD,,50,USD,,200,Total Debt,2025",
        "2,Listed Equity,Sample Equity Plc,Common Stock,Market Value,USD,,25,USD,,500,Market Cap,2025",
      ].join("\n"),
    },
    s2: {
      name: "S2_Counterparty_Profile_Template.csv",
      csv: [
        "BOI FINANCED EMISSIONS MODEL v3 â€” S2 Counterparty Profile",
        "One row per counterparty. Sector (27) drives MRIO intensity lookup.",
        "",
        "Counterparty Name,Sector (27),EORA26 Sector,ISIC Code,Country,Revenue ($m),Total Debt ($m),Listed (Y/N)",
        `Sample Counterparty Ltd,Manufacturing,Manufacturing,C25,${getRegion().country},120,200,N`,
        `Sample Equity Plc,Financial Services,Financial Intermediation,K64,${getRegion().country},800,500,Y`,
      ].join("\n"),
    },
    s3: {
      name: "S3_GHG_Reported_Template.csv",
      csv: [
        "BOI FINANCED EMISSIONS MODEL v3 â€” S3 GHG Inventory (Reported)",
        "Counterparty-disclosed Scope 1 + 2 emissions. tCO2e.",
        "",
        "Counterparty Name,Reported S1 (tCO2e),Reported S2 (tCO2e),Total S1+S2 (tCO2e),Reporting Standard,Third-Party Verified (Y/N),Reporting Year",
        "Sample Counterparty Ltd,1500,800,2300,GHG Protocol,Y,2024",
      ].join("\n"),
    },
    s4: {
      name: "S4_Activity_Data_Template.csv",
      csv: [
        "BOI FINANCED EMISSIONS MODEL v3 â€” S4 Energy & Activity Data",
        "Raw fuel and electricity consumption. Units: litres for liquid fuels, m3 for natural gas, kWh for electricity.",
        "",
        "Counterparty Name,Diesel (litres),Petrol (litres),LPG (litres),Natural Gas (m3),Heavy Fuel Oil (litres),Electricity (kWh),Est. S1 (tCO2e),Est. S2 (tCO2e),Reporting Year",
        "Sample Counterparty Ltd,50000,5000,0,0,0,1200000,180,540,2024",
      ].join("\n"),
    },
  };
};

function downloadTemplate(id: "s1" | "s2" | "s3" | "s4") {
  const tpl = buildCsvTemplates()[id];
  if (!tpl) return;
  const blob = new Blob([tpl.csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = tpl.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   GHG ROUTING ENGINE (Unchanged Logic)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
type DQS = 1 | 2 | 3 | 4 | 5;
type RouteOption =
  | "Option 1"
  | "Option 2"
  | "Option 3"
  | "Option 4"
  | "Sovereign";

interface RouteResult extends PortfolioAsset {
  option: RouteOption;
  dqs: DQS;
  attributionFactor: number;
  financedEmissions: number;
  emissionsLow?: number;
  emissionsHigh?: number;
}

function routeAsset(asset: PortfolioAsset): RouteResult {
  const af = asset.denominator > 0 ? asset.exposure / asset.denominator : 0;
  if (asset.isGovernmentBond && asset.govtConsumptionEmissions) {
    return {
      ...asset,
      option: "Sovereign",
      dqs: 4,
      attributionFactor: af,
      financedEmissions: asset.govtConsumptionEmissions * af,
    };
  }
  if (asset.ghgReported && asset.ghgReported > 0) {
    return {
      ...asset,
      option: "Option 1",
      dqs: asset.ghgVerified ? 1 : 2,
      attributionFactor: af,
      financedEmissions: asset.ghgReported * af,
    };
  }
  const hasActivity =
    (asset.activityDiesel ?? 0) > 0 ||
    (asset.activityPetrol ?? 0) > 0 ||
    (asset.activityLpg ?? 0) > 0 ||
    (asset.activityNaturalGas ?? 0) > 0 ||
    (asset.activityHfo ?? 0) > 0 ||
    (asset.activityElectricity ?? 0) > 0;
  if (hasActivity) {
    const s1 =
      ((asset.activityDiesel ?? 0) * EMISSION_FACTORS.diesel +
        (asset.activityPetrol ?? 0) * EMISSION_FACTORS.petrol +
        (asset.activityLpg ?? 0) * EMISSION_FACTORS.lpg +
        (asset.activityNaturalGas ?? 0) * EMISSION_FACTORS.naturalGas +
        (asset.activityHfo ?? 0) * EMISSION_FACTORS.hfo) /
      1000;
    const s2 =
      ((asset.activityElectricity ?? 0) * EMISSION_FACTORS.nigeriaGrid) / 1000;
    return {
      ...asset,
      option: "Option 2",
      dqs: 3,
      attributionFactor: af,
      financedEmissions: (s1 + s2) * af,
    };
  }
  if (asset.annualRevenue && asset.annualRevenue > 0) {
    const intensity =
      MRIO_SECTOR_INTENSITIES[asset.sector] ??
      MRIO_SECTOR_INTENSITIES["SME / General (Unclassified)"];
    return {
      ...asset,
      option: "Option 3",
      dqs: 4,
      attributionFactor: af,
      financedEmissions: asset.annualRevenue * intensity * af,
    };
  }
  const central = asset.exposure * 625.0 * 0.1 * af;
  return {
    ...asset,
    option: "Option 4",
    dqs: 5,
    attributionFactor: af,
    financedEmissions: central,
    emissionsLow: central * 0.6,
    emissionsHigh: central * 1.8,
  };
}

const ASSET_CLASSES = [
  "Term Loan",
  "Business Loan",
  "Project Loan",
  "Bond Holding",
  "Equity Shares",
  "Revolving Credit",
  "Mortgage",
];
const MRIO_SECTORS = Object.keys(MRIO_SECTOR_INTENSITIES);

const STEPS = [
  { id: 0, label: "Scope 1", desc: "Direct Sources", icon: Flame },
  { id: 1, label: "Scope 2", desc: "Purchased Electricity", icon: Zap },
  { id: 2, label: "Scope 3", desc: "Financed Emissions", icon: Building2 },
  {
    id: 3,
    label: "Dashboard",
    desc: "Inventory Review",
    icon: LayoutDashboard,
  },
];

const blankS1 = (): Partial<Scope1Asset> => ({
  name: "",
  branch: "",
  type: "stationary",
  fuelType: "diesel",
  litersPerMonth: 0,
  months: 12,
});
const blankS2 = (): Partial<Scope2Entry> => ({
  branch: "",
  kwhPerMonth: 0,
  months: 12,
  source: "grid",
});
const blankPortfolio = (): Partial<PortfolioAsset> => ({
  counterparty: "",
  assetClass: "Term Loan",
  sector: MRIO_SECTORS[0],
  isicCode: "",
  exposure: 0,
  denominator: 0,
  denominatorBasis: "Total Debt",
  annualRevenue: 0,
  ghgReported: 0,
  ghgVerified: false,
});

function parseScope1Csv(text: string): Scope1Asset[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const get = (row: string[], key: string) => {
    const i = headers.indexOf(key);
    return i >= 0 ? (row[i]?.trim() ?? "") : "";
  };
  const num = (v: string) => parseFloat(v) || 0;

  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line, idx) => {
      const row = line.split(",");
      return {
        id: `s1-${Date.now()}-${idx}`,
        name: get(row, "name"),
        branch: get(row, "branch"),
        type: (get(row, "type") || "stationary") as "mobile" | "stationary",
        fuelType: (get(row, "fuel_type") || "diesel") as
          | "diesel"
          | "petrol"
          | "lpg"
          | "cng",
        litersPerMonth: num(get(row, "liters_per_month")),
        months: num(get(row, "months")) || 12,
      } as Scope1Asset;
    });
}

function parseScope2Csv(text: string): Scope2Entry[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const get = (row: string[], key: string) => {
    const i = headers.indexOf(key);
    return i >= 0 ? (row[i]?.trim() ?? "") : "";
  };
  const num = (v: string) => parseFloat(v) || 0;

  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line, idx) => {
      const row = line.split(",");
      const emissionFactor = num(get(row, "emission_factor"));
      return {
        id: `s2-${Date.now()}-${idx}`,
        branch: get(row, "branch"),
        source: (get(row, "source") || "grid") as "grid" | "private",
        kwhPerMonth: num(get(row, "kwh_per_month")),
        months: num(get(row, "months")) || 12,
        emissionFactor: emissionFactor || undefined,
      } as Scope2Entry;
    });
}

function parsePortfolioCsv(text: string): PortfolioAsset[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const get = (row: string[], key: string) => {
    const i = headers.indexOf(key);
    return i >= 0 ? (row[i]?.trim() ?? "") : "";
  };
  const num = (v: string) => parseFloat(v) || 0;
  const bool = (v: string) =>
    v.toLowerCase() === "true" || v === "1" || v.toLowerCase() === "yes";

  return lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line, idx) => {
      const row = line.split(",");
      return {
        id: `csv-${Date.now()}-${idx}`,
        counterparty: get(row, "counterparty"),
        assetClass:
          get(row, "assetclass") || get(row, "asset_class") || "Term Loan",
        sector: get(row, "sector") || "SME / General (Unclassified)",
        isicCode: get(row, "isic") || get(row, "isiccode") || "",
        exposure: num(get(row, "exposure")),
        denominator: num(get(row, "denominator")),
        denominatorBasis:
          get(row, "denominatorbasis") ||
          get(row, "denominator_basis") ||
          "Total Debt",
        annualRevenue: num(
          get(row, "annualrevenue") || get(row, "annual_revenue"),
        ),
        ghgReported: num(get(row, "ghgreported") || get(row, "ghg_reported")),
        ghgVerified: bool(get(row, "ghgverified") || get(row, "ghg_verified")),
        activityDiesel: num(
          get(row, "activitydiesel") || get(row, "activity_diesel"),
        ),
        activityPetrol: num(
          get(row, "activitypetrol") || get(row, "activity_petrol"),
        ),
        activityLpg: num(get(row, "activitylpg") || get(row, "activity_lpg")),
        activityNaturalGas: num(
          get(row, "activitynaturalgas") || get(row, "activity_naturalgas"),
        ),
        activityHfo: num(get(row, "activityhfo") || get(row, "activity_hfo")),
        activityElectricity: num(
          get(row, "activityelectricity") || get(row, "activity_electricity"),
        ),
      } satisfies PortfolioAsset;
    });
}

// Reusable Deloitte UI Input
interface DeloitteInputProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}
const DeloitteInput = ({
  label,
  type = "text",
  value,
  onChange,
  placeholder = "",
}: DeloitteInputProps) => (
  <div className="w-full">
    <label className="block text-[12px] text-[#525252] mb-1 font-medium">
      {label}
    </label>
    <div className="relative">
      <input
        type={type}
        min={type === "number" ? 0 : undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#f4f4f4] border-b border-[#8d8d8d] text-[#161616] text-[14px] px-4 py-3 outline-none focus:outline-none focus:border-[#86bc25] focus:border-b-2 transition-all rounded-none"
      />
    </div>
  </div>
);

interface SelectOption {
  label: string;
  value: string;
}
interface DeloitteSelectProps {
  label: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
}
const DeloitteSelect = ({
  label,
  value,
  onChange,
  options,
}: DeloitteSelectProps) => (
  <div className="w-full">
    <label className="block text-[12px] text-[#525252] mb-1 font-medium">
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className="w-full bg-[#f4f4f4] border-b border-[#8d8d8d] text-[#161616] text-[14px] px-4 py-3 outline-none focus:outline-none focus:border-[#86bc25] focus:border-b-2 transition-all rounded-none appearance-none cursor-pointer"
      >
        {options.map((opt: SelectOption) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#161616]">
        â–¼
      </div>
    </div>
  </div>
);

const EmptyBox = ({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) => (
  <div className="flex flex-col items-center justify-center py-20 bg-[#f4f4f4] border-t border-[#e0e0e0]">
    <Icon className="w-8 h-8 text-[#525252] mb-4 stroke-1" />
    <h3 className="text-[16px] font-medium text-[#161616] mb-1">{title}</h3>
    <p className="text-[14px] text-[#525252] text-center max-w-sm">{desc}</p>
  </div>
);

export default function EmissionsModule() {
  const navigate = useNavigate();
  const {
    scope1Assets,
    scope2Entries,
    notifications,
    markNotificationRead,
    dismissAllNotifications,
    addScope1Asset,
    removeScope1Asset,
    addScope2Entry,
    removeScope2Entry,
  } = useSustainabilityStore();

  const [step, setStep] = useState(0);
  const [s1Modal, setS1Modal] = useState(false);
  const [s2Modal, setS2Modal] = useState(false);
  const [s3Modal, setS3Modal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [csvError, setCsvError] = useState("");
  const [isUploading, setIsUploading] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [bellOpen, setBellOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const fileParseS1Context = useRef<HTMLInputElement>(null);
  const fileParseS2Context = useRef<HTMLInputElement>(null);
  const fileParseS3Context = useRef<HTMLInputElement>(null);
  const fileParseS4Context = useRef<HTMLInputElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([]);
  // View-uploaded-data modal state
  const [viewSheet, setViewSheet] = useState<null | {
    id: "s1" | "s2" | "s3" | "s4";
    name: string;
    data: any[];
  }>(null);
  const [viewPage, setViewPage] = useState(1);
  const [viewSearch, setViewSearch] = useState("");
  // Chart/table toggles for dashboard widgets
  const [sectorView, setSectorView] = useState<"chart" | "table">("chart");
  const [classView, setClassView] = useState<"chart" | "table">("chart");
  const [optionView, setOptionView] = useState<"chart" | "table">("chart");
  const [s1DataState, setS1DataState] = useState<{
    name: string;
    data: any[];
  } | null>(null);
  const [s2DataState, setS2DataState] = useState<{
    name: string;
    data: any[];
  } | null>(null);
  const [s3DataState, setS3DataState] = useState<{
    name: string;
    data: any[];
  } | null>(null);
  const [s4DataState, setS4DataState] = useState<{
    name: string;
    data: any[];
  } | null>(null);

  const [newS1, setNewS1] = useState<Partial<Scope1Asset>>(blankS1());
  const [newS2, setNewS2] = useState<Partial<Scope2Entry>>(blankS2());
  const [newP, setNewP] = useState<Partial<PortfolioAsset>>(blankPortfolio());

  const s1Total = useMemo(() => calculateScope1(scope1Assets), [scope1Assets]);
  const s2Total = useMemo(
    () => calculateScope2(scope2Entries),
    [scope2Entries],
  );
  const portfolioResults: RouteResult[] = useMemo(
    () => portfolioAssets.map(routeAsset),
    [portfolioAssets],
  );
  const financedTotal = portfolioResults.reduce(
    (s, r) => s + r.financedEmissions,
    0,
  );
  const grandTotal = s1Total + s2Total + financedTotal;
  const unreadNotifications = notifications.filter((n) => !n.read);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setBellOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAddS1 = () => {
    if (!newS1.name) return;
    addScope1Asset({ ...newS1, id: `s1-${Date.now()}` } as Scope1Asset);
    setNewS1(blankS1());
    setS1Modal(false);
  };
  const handleAddS2 = () => {
    if (!newS2.branch) return;
    addScope2Entry({ ...newS2, id: `s2-${Date.now()}` } as Scope2Entry);
    setNewS2(blankS2());
    setS2Modal(false);
  };
  const handleAddPortfolio = () => {
    if (!newP.counterparty || !newP.exposure || !newP.denominator) return;
    setPortfolioAssets((prev) => [
      ...prev,
      { ...blankPortfolio(), ...newP, id: `p-${Date.now()}` } as PortfolioAsset,
    ]);
    setNewP(blankPortfolio());
    setS3Modal(false);
  };
  const removePortfolioAsset = (id: string) =>
    setPortfolioAssets((prev) => prev.filter((a) => a.id !== id));

  const processUpload = <T,>(
    file: File,
    parser: (text: string) => T[],
    onSuccess: (parsed: T[]) => void,
    key: string,
    errorMsg: string,
  ) => {
    setCsvError("");
    setIsUploading((prev) => ({ ...prev, [key]: true }));

    const reader = new FileReader();
    reader.onload = (e) => {
      // Simulate loading time for analytics demo
      setTimeout(() => {
        try {
          const text = e.target?.result as string;
          const parsed = parser(text);
          if (parsed.length === 0) {
            setCsvError("No valid rows found. Check your CSV format.");
            setIsUploading((prev) => ({ ...prev, [key]: false }));
            return;
          }
          onSuccess(parsed);
        } catch {
          setCsvError(errorMsg);
        } finally {
          setIsUploading((prev) => ({ ...prev, [key]: false }));
        }
      }, 1500);
    };
    reader.readAsText(file);
  };

  const handleScope1CsvUpload = (file: File) => {
    processUpload(
      file,
      parseScope1Csv,
      (parsed) => parsed.forEach(addScope1Asset),
      "scope1",
      "Failed to parse Scope 1 CSV.",
    );
  };

  const handleScope2CsvUpload = (file: File) => {
    processUpload(
      file,
      parseScope2Csv,
      (parsed) => parsed.forEach(addScope2Entry),
      "scope2",
      "Failed to parse Scope 2 CSV.",
    );
  };

  const handleCsvUpload = (file: File) => {
    processUpload(
      file,
      parsePortfolioCsv,
      (parsed) => setPortfolioAssets((prev) => [...prev, ...parsed]),
      "scope3",
      "Failed to parse Financed CSV.",
    );
  };

  const dl = (f: string) => {
    const a = document.createElement("a");
    a.href = `/templates/${f}`;
    a.download = f;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col font-sans text-[#161616]">
      {/* Carbon Accounting Header */}
      <header className="bg-white border-b border-[#e0e0e0] sticky top-0 z-30 w-full shadow-sm">
        <div className="px-6 py-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-5 min-w-0">
            <NavBrand subModuleTitle="Carbon Accounting" />
            <div className="min-w-0">
              <h1 className="text-[18px] font-semibold text-[#161616] m-0 leading-none">
                Carbon Emissions & Reporting Workspace
              </h1>
              <p className="text-[12px] text-[#525252] mt-1">
                Audit-ready accounting following GHG Protocol and PCAF.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end xl:self-auto">
            <button
              onClick={() => navigate("/modules")}
              className="inline-flex items-center gap-2 h-10 px-4 border border-[#86bc25] text-[#86bc25] hover:bg-[#f4fadc] transition-colors text-[13px] font-semibold"
            >
              <LayoutGrid className="w-4 h-4" />
              Switch Module
            </button>
            <ThemeToggle />
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setBellOpen((open) => !open)}
                className="relative inline-flex items-center justify-center h-10 w-10 border border-[#e0e0e0] hover:bg-[#f4f4f4] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-[#161616]" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#da1e28]"></span>
                )}
              </button>

              {bellOpen && (
                <div className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] bg-white border border-[#e0e0e0] shadow-lg shadow-black/5 flex flex-col z-40">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#e0e0e0] bg-[#f4f4f4]">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#86bc25]" />
                      <span className="text-[13px] font-bold text-[#161616]">
                        Notifications
                      </span>
                      {unreadNotifications.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-[#86bc25]/20 text-[#435e12] text-[10px] font-bold">
                          {unreadNotifications.length}
                        </span>
                      )}
                    </div>
                    {unreadNotifications.length > 0 && (
                      <button
                        onClick={dismissAllNotifications}
                        className="text-[11px] font-semibold text-[#86bc25] hover:text-[#435e12] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-[360px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-10 flex flex-col items-center justify-center text-center">
                        <BellOff className="w-7 h-7 text-[#8d8d8d] mb-2" />
                        <span className="text-[13px] text-[#525252]">
                          No notifications yet
                        </span>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => markNotificationRead(notification.id)}
                          className={`w-full text-left px-4 py-3 border-b border-[#e0e0e0] hover:bg-[#f4f4f4] transition-colors ${!notification.read ? "bg-[#f4fadc]/30" : "bg-white"}`}
                        >
                          <div className="flex justify-between items-start gap-2">
                            <span
                              className={`text-[13px] leading-snug ${!notification.read ? "font-bold text-[#161616]" : "font-medium text-[#525252]"}`}
                            >
                              {notification.title}
                            </span>
                            {!notification.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#86bc25] flex-shrink-0 mt-1.5"></span>
                            )}
                          </div>
                          <span className="block mt-1 text-[12px] text-[#525252] leading-relaxed">
                            {notification.message}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <UserMenu />
          </div>
        </div>
        <div className="px-6 pb-4 flex justify-end">
          <div className="flex items-center divide-x divide-[#e0e0e0] bg-white">
            <div className="px-6 text-right">
              <p className="text-[12px] text-[#525252] uppercase font-medium">
                Financed (Cat 15)
              </p>
              <p className="text-[16px] font-semibold text-[#161616] mt-0.5">
                {formatNumber(financedTotal)}{" "}
                <span className="text-[12px] font-normal text-[#525252]">
                  tCOâ‚‚e
                </span>
              </p>
            </div>
            <div className="px-6 text-right">
              <p className="text-[12px] text-[#525252] uppercase font-medium">
                Enterprise Total
              </p>
              <p className="text-[18px] font-semibold text-[#86bc25] mt-0.5">
                {formatNumber(grandTotal)}{" "}
                <span className="text-[12px] font-normal text-[#525252]">
                  tCOâ‚‚e
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Grid Layout Container */}
      <div className="flex flex-1 w-full relative">
        {/* Left SideNav - Carbon Style */}
        <aside className="w-64 bg-white border-r border-[#e0e0e0] flex flex-col pt-6 shrink-0 relative">
          <nav className="flex-1 flex flex-col">
            {STEPS.map((s, i) => {
              const active = step === i;
              const completed = step > i;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(i)}
                  className={`w-full text-left flex items-start px-4 py-4 relative outline-none transition-colors ${
                    active
                      ? "bg-[#e5e5e5]"
                      : "hover:bg-[#f4f4f4] bg-white text-[#161616]"
                  }`}
                  style={
                    active
                      ? { borderLeft: `4px solid ${DELOITTE_GREEN}` }
                      : { borderLeft: "4px solid transparent" }
                  }
                >
                  <div className="mr-3 mt-0.5">
                    {completed ? (
                      <Check className="w-4.5 h-4.5 text-[#86bc25] stroke-[2.5]" />
                    ) : (
                      <s.icon
                        className={`w-4.5 h-4.5 stroke-[1.5] ${active ? "text-[#86bc25]" : "text-[#525252]"}`}
                      />
                    )}
                  </div>
                  <div>
                    <p
                      className={`text-[14px] leading-tight ${active ? "font-semibold text-[#161616]" : "font-normal text-[#525252]"}`}
                    >
                      {s.label}
                    </p>
                    <p className="text-[12px] text-[#525252] mt-1 leading-snug">
                      {s.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-[#e0e0e0] bg-[#f4f4f4]">
            <div className="flex gap-2">
              <Info className="w-4 h-4 text-[#86bc25] shrink-0 fill-transparent" />
              <p className="text-[12px] text-[#525252] leading-snug">
                Values are updated in real-time within the enterprise data
                store.
              </p>
            </div>
          </div>
        </aside>

        {/* Content Viewport */}
        <main className="flex-1 overflow-x-hidden flex flex-col relative w-full h-full bg-[#f4f4f4] pb-24">
          <div className="p-6 md:p-8 max-w-350 w-full mx-auto animate-in fade-in duration-200">
            {/* STEP 1: SCOPE 1 */}
            {step === 0 && (
              <div className="bg-white border border-[#e0e0e0] rounded-none">
                <div className="px-6 py-6 border-b border-[#e0e0e0] flex items-center justify-between">
                  <div>
                    <h2 className="text-[20px] font-normal text-[#161616]">
                      Scope 1 Data Capture
                    </h2>
                    <p className="text-[14px] text-[#525252] mt-1">
                      Log owned machinery, stationary combustion, and mobile
                      transport fuel.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => dl("scope1_template.csv")}
                      className="px-4 py-3 bg-transparent border border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25] hover:text-white text-[14px] font-medium transition-colors"
                    >
                      Export Template
                    </button>
                    <button
                      onClick={() => {
                        if (isUploading["scope1"]) return;
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".csv";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) handleScope1CsvUpload(file);
                        };
                        input.click();
                      }}
                      className="px-4 py-3 bg-transparent border border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25] hover:text-white text-[14px] font-medium transition-colors flex items-center gap-2"
                    >
                      {isUploading["scope1"] ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" /> Bulk Upload
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setS1Modal(true)}
                      className="px-4 py-3 bg-[#86bc25] text-white hover:bg-[#70a31d] text-[14px] font-medium transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Record
                    </button>
                  </div>
                </div>

                {scope1Assets.length === 0 ? (
                  <EmptyBox
                    icon={Flame}
                    title="No Scope 1 Records"
                    desc="Awaiting entries for direct combustion. Add a new record manually or wait for sync."
                  />
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-[14px] text-left border-collapse">
                      <thead className="bg-[#f4f4f4] border-b border-[#e0e0e0] text-[#161616] font-semibold">
                        <tr>
                          <th className="px-6 py-3">Asset Designation</th>
                          <th className="px-6 py-3">Facility Ref</th>
                          <th className="px-6 py-3">Combustion Type</th>
                          <th className="px-6 py-3 text-right">
                            Volume (L/mo)
                          </th>
                          <th className="px-6 py-3 text-right">
                            Total Impact (tCOâ‚‚e)
                          </th>
                          <th className="px-6 py-3 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e0e0]">
                        {scope1Assets.map((a) => {
                          const ef =
                            EMISSION_FACTORS[
                              a.fuelType as keyof typeof EMISSION_FACTORS
                            ] ?? 0;
                          const em = (a.litersPerMonth * a.months * ef) / 1000;
                          return (
                            <tr key={a.id} className="hover:bg-[#f4f4f4] group">
                              <td className="px-6 py-4 text-[#161616] font-medium">
                                {a.name}
                              </td>
                              <td className="px-6 py-4 text-[#525252]">
                                {a.branch}
                              </td>
                              <td className="px-6 py-4 text-[#525252] capitalize">
                                {a.fuelType}
                              </td>
                              <td className="px-6 py-4 text-[#161616] text-right">
                                {a.litersPerMonth.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-[#161616] text-right font-medium">
                                {formatNumber(em)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => removeScope1Asset(a.id)}
                                  className="text-[#86bc25] opacity-0 group-hover:opacity-100 hover:text-[#da1e28]"
                                >
                                  <Trash2 className="w-4 h-4 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-[#f4f4f4]">
                          <td
                            colSpan={4}
                            className="px-6 py-4 text-right font-semibold text-[#525252] uppercase text-[12px] tracking-wide"
                          >
                            Aggregate Sum (Scope 1)
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-[#161616] text-[16px]">
                            {formatNumber(s1Total)}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SCOPE 2 */}
            {step === 1 && (
              <div className="bg-white border border-[#e0e0e0] rounded-none">
                <div className="px-6 py-6 border-b border-[#e0e0e0] flex items-center justify-between">
                  <div>
                    <h2 className="text-[20px] font-normal text-[#161616]">
                      Scope 2 Operations
                    </h2>
                    <p className="text-[14px] text-[#525252] mt-1">
                      Log indirect electricity and grid consumption variables.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => dl("scope2_template.csv")}
                      className="px-4 py-3 bg-transparent border border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25] hover:text-white text-[14px] font-medium transition-colors"
                    >
                      Export Template
                    </button>
                    <button
                      onClick={() => {
                        if (isUploading["scope2"]) return;
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = ".csv";
                        input.onchange = (e) => {
                          const file = (e.target as HTMLInputElement)
                            .files?.[0];
                          if (file) handleScope2CsvUpload(file);
                        };
                        input.click();
                      }}
                      className="px-4 py-3 bg-transparent border border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25] hover:text-white text-[14px] font-medium transition-colors flex items-center gap-2"
                    >
                      {isUploading["scope2"] ? (
                        <>Uploading...</>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" /> Bulk Upload
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setS2Modal(true)}
                      className="px-4 py-3 bg-[#86bc25] text-white hover:bg-[#70a31d] text-[14px] font-medium transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Facility
                    </button>
                  </div>
                </div>

                {scope2Entries.length === 0 ? (
                  <EmptyBox
                    icon={Zap}
                    title="No Scope 2 Electricity Data"
                    desc="No facilities currently reporting grid or energy usage."
                  />
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-[14px] text-left border-collapse">
                      <thead className="bg-[#f4f4f4] border-b border-[#e0e0e0] text-[#161616] font-semibold">
                        <tr>
                          <th className="px-6 py-3">Facility Definition</th>
                          <th className="px-6 py-3">Power Source Network</th>
                          <th className="px-6 py-3 text-right">
                            Consumption (kWh/mo)
                          </th>
                          <th className="px-6 py-3 text-right">
                            Total Impact (tCOâ‚‚e)
                          </th>
                          <th className="px-6 py-3 w-12 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e0e0e0]">
                        {scope2Entries.map((e) => {
                          const ef =
                            e.source === "grid"
                              ? EMISSION_FACTORS.nigeriaGrid
                              : e.emissionFactor || 0;
                          const em = (e.kwhPerMonth * e.months * ef) / 1000;
                          return (
                            <tr key={e.id} className="hover:bg-[#f4f4f4] group">
                              <td className="px-6 py-4 text-[#161616] font-medium">
                                {e.branch}
                              </td>
                              <td className="px-6 py-4 text-[#525252] capitalize">
                                {e.source}
                              </td>
                              <td className="px-6 py-4 text-[#161616] text-right">
                                {e.kwhPerMonth.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-[#161616] text-right font-medium">
                                {formatNumber(em)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => removeScope2Entry(e.id)}
                                  className="text-[#86bc25] opacity-0 group-hover:opacity-100 hover:text-[#da1e28]"
                                >
                                  <Trash2 className="w-4 h-4 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-[#f4f4f4]">
                          <td
                            colSpan={3}
                            className="px-6 py-4 text-right font-semibold text-[#525252] uppercase text-[12px] tracking-wide"
                          >
                            Aggregate Sum (Scope 2)
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-[#161616] text-[16px]">
                            {formatNumber(s2Total)}
                          </td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: SCOPE 3 (Portfolio) */}
            {step === 2 && (
              <div className="animate-in fade-in duration-200">
                <div className="bg-white border border-[#e0e0e0] flex flex-col mb-6">
                  <div className="px-6 py-6 border-b border-[#e0e0e0] flex items-center justify-between">
                    <div>
                      <h2 className="text-[20px] font-normal text-[#161616]">
                        Financed Emissions Data Integration
                      </h2>
                      <p className="text-[14px] text-[#525252] mt-1">
                        Upload the required datasets to calculate Scope 3
                        financed emissions according to PCAF standards.
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        title="Ensure all datasets are uploaded exactly as named to compile without mock values"
                        disabled={!s1DataState || !s2DataState}
                        onClick={() => {
                          // Helper: find a column whose normalized key matches a regex
                          const findKey = (obj: any, re: RegExp) => {
                            const k = Object.keys(obj || {}).find((kk) =>
                              re.test(kk),
                            );
                            return k ? obj[k] : undefined;
                          };
                          // Helper: parse number, stripping commas and currency symbols
                          const num = (v: any): number => {
                            if (v === null || v === undefined || v === "")
                              return 0;
                            const s = String(v)
                              .replace(/[,$â‚¦\s]/g, "")
                              .trim();
                            const n = parseFloat(s);
                            return isNaN(n) ? 0 : n;
                          };
                          // Normalize counterparty name for matching
                          const norm = (v: any) =>
                            String(v || "")
                              .replace(/[^a-zA-Z0-9]/g, "")
                              .toLowerCase();

                          const merged = (s1DataState?.data || []).map(
                            (s1: any, index: number) => {
                              const cpName =
                                s1["Counterparty / Asset"] ||
                                s1["Counterparty Name"] ||
                                s1["Counterparty"] ||
                                findKey(s1, /counterparty/i) ||
                                "Unknown";
                              const cpStr = norm(cpName);

                              const s2 =
                                (s2DataState?.data || []).find(
                                  (x: any) =>
                                    norm(
                                      x["Counterparty Name"] ||
                                        findKey(x, /counterparty/i),
                                    ) === cpStr,
                                ) || {};
                              const s3 =
                                (s3DataState?.data || []).find(
                                  (x: any) =>
                                    norm(
                                      x["Counterparty Name"] ||
                                        findKey(x, /counterparty/i),
                                    ) === cpStr,
                                ) || {};
                              const s4 =
                                (s4DataState?.data || []).find(
                                  (x: any) =>
                                    norm(
                                      x["Counterparty Name"] ||
                                        findKey(x, /counterparty/i),
                                    ) === cpStr,
                                ) || {};

                              // S1: Exposure ($m â€” auto), Denominator ($m â€” auto), Asset Class, Denominator Basis
                              const exp = num(
                                findKey(s1, /^exposure\s*\(\$m/i) ||
                                  findKey(s1, /exposure.*\$m/i),
                              );
                              const denom =
                                num(
                                  findKey(s1, /^denominator\s*\(\$m/i) ||
                                    findKey(s1, /denominator.*\$m/i),
                                ) || 1;
                              const assetClass = String(
                                findKey(s1, /^asset\s*class$/i) ||
                                  "Corporate Loan",
                              );
                              const basis = String(
                                findKey(s1, /denominator\s*basis/i) || "Debt",
                              );

                              // S2: Counterparty profile
                              const sector = String(
                                findKey(s2, /^sector\s*\(27/i) ||
                                  findKey(s2, /^sector/i) ||
                                  "Unclassified",
                              );
                              const eoraSector = String(
                                findKey(s2, /eora/i) || sector,
                              );
                              const isic = String(findKey(s2, /isic/i) || "");
                              const annualRev = num(
                                findKey(s2, /^revenue\s*\(\$m/i) ||
                                  findKey(s2, /revenue.*\$m/i),
                              );

                              // S3: Total S1+S2 (tCO?e), Third-Party Verified
                              const ghg = num(
                                findKey(s3, /total\s*s1\s*\+\s*s2/i),
                              );
                              const verified = String(
                                findKey(s3, /verified/i) || "",
                              )
                                .toLowerCase()
                                .trim()
                                .startsWith("y");

                              // S4: raw activity data (litres, m3, kWh) â€” routeAsset will apply EMISSION_FACTORS
                              const diesel = num(findKey(s4, /^diesel/i));
                              const petrol = num(findKey(s4, /^petrol/i));
                              const lpg = num(findKey(s4, /^lpg/i));
                              const natGas = num(findKey(s4, /natural\s*gas/i));
                              const hfo = num(
                                findKey(s4, /heavy\s*fuel|^hfo/i),
                              );
                              const electricity = num(
                                findKey(
                                  s4,
                                  /^electricity\s*\(?kwh|^electricity$/i,
                                ),
                              );
                              // Fallback: pre-calculated Est. S1/S2 if no raw data
                              const estS1 = num(findKey(s4, /^est\.?\s*s1/i));
                              const estS2 = num(findKey(s4, /^est\.?\s*s2/i));
                              const hasRawActivity =
                                diesel +
                                  petrol +
                                  lpg +
                                  natGas +
                                  hfo +
                                  electricity >
                                0;
                              const hasEstActivity = estS1 + estS2 > 0;

                              // Routing per PCAF
                              let emissions = 0;
                              let dqs: 1 | 2 | 3 | 4 | 5 = 5;
                              let option = "Option 4";
                              const af = denom > 0 ? exp / denom : 0;

                              if (ghg > 0) {
                                emissions = ghg * af;
                                dqs = verified ? 1 : 2;
                                option = "Option 1";
                              } else if (hasRawActivity || hasEstActivity) {
                                const borrower = hasRawActivity
                                  ? (diesel * (EMISSION_FACTORS as any).diesel +
                                      petrol *
                                        (EMISSION_FACTORS as any).petrol +
                                      lpg * (EMISSION_FACTORS as any).lpg +
                                      natGas *
                                        (EMISSION_FACTORS as any).naturalGas +
                                      hfo * (EMISSION_FACTORS as any).hfo +
                                      electricity *
                                        (EMISSION_FACTORS as any).nigeriaGrid) /
                                    1000
                                  : estS1 + estS2;
                                emissions = borrower * af;
                                dqs = 3;
                                option = "Option 2";
                              } else if (annualRev > 0) {
                                const intensity =
                                  MRIO_SECTOR_INTENSITIES[sector] ||
                                  MRIO_SECTOR_INTENSITIES[eoraSector] ||
                                  500;
                                const borrowerEmissions = annualRev * intensity;
                                emissions = borrowerEmissions * af;
                                dqs = 4;
                                option = "Option 3";
                              }

                              return {
                                id: "xl-" + Date.now() + "-" + index,
                                counterparty: cpName,
                                assetClass,
                                sector,
                                isicCode: isic,
                                exposure: exp,
                                denominator: denom,
                                denominatorBasis: basis,
                                annualRevenue: annualRev,
                                ghgReported: ghg,
                                ghgVerified: verified,
                                activityDiesel: diesel,
                                activityPetrol: petrol,
                                activityLpg: lpg,
                                activityNaturalGas: natGas,
                                activityHfo: hfo,
                                activityElectricity: electricity,
                                financedEmissions: emissions,
                                dqs,
                                option,
                                attributionFactor: af,
                                isGovernmentBond:
                                  assetClass
                                    .toLowerCase()
                                    .includes("government bond") ||
                                  assetClass
                                    .toLowerCase()
                                    .includes("sovereign"),
                                govtConsumptionEmissions: 0,
                              };
                            },
                          );

                          if (merged.length === 0) {
                            console.warn(
                              "[EmissionsModule] No rows merged. Check that S1 has data and Counterparty names match across files.",
                            );
                          } else {
                            console.log(
                              "[EmissionsModule] Merged " +
                                merged.length +
                                " assets. First:",
                              merged[0],
                            );
                          }
                          setPortfolioAssets(merged);
                          setStep(3);
                        }}
                        className="px-6 py-2 bg-[#86bc25] text-white hover:bg-[#6c9c1b] text-[14px] font-medium transition-colors disabled:bg-[#c6c6c6] disabled:text-[#8d8d8d] rounded-none"
                      >
                        Process & Build Inventory
                      </button>
                    </div>
                  </div>

                  <div className="p-6 grid grid-cols-1 gap-4">
                    {[
                      {
                        id: 1,
                        tplId: "s1" as const,
                        sheetKey: "s1" as const,
                        req: true,
                        label: "Financial Asset Data",
                        desc: "Counterparty exposure, asset class, and denominator values.",
                        state: s1DataState,
                        setter: setS1DataState,
                        ref: fileParseS1Context,
                      },
                      {
                        id: 2,
                        tplId: "s2" as const,
                        sheetKey: "s2" as const,
                        req: true,
                        label: "Counterparty Profile",
                        desc: "Sector classifications, revenue, and physical identifiers.",
                        state: s2DataState,
                        setter: setS2DataState,
                        ref: fileParseS2Context,
                      },
                      {
                        id: 3,
                        tplId: "s3" as const,
                        sheetKey: "s3" as const,
                        req: false,
                        label: "GHG Inventory Report",
                        desc: "Reported footprint (Scope 1 & 2) and verification status.",
                        state: s3DataState,
                        setter: setS3DataState,
                        ref: fileParseS3Context,
                      },
                      {
                        id: 4,
                        tplId: "s4" as const,
                        sheetKey: "s4" as const,
                        req: false,
                        label: "Energy & Activity Data",
                        desc: "Fuel consumption and electricity usage records.",
                        state: s4DataState,
                        setter: setS4DataState,
                        ref: fileParseS4Context,
                      },
                    ].map((sheet) => (
                      <div
                        key={sheet.id}
                        className="flex items-center justify-between p-4 border border-[#e0e0e0] bg-[#f4f4f4] rounded-none"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            {sheet.state ? (
                              <div className="w-5 h-5 rounded-full bg-[#198038] flex items-center justify-center text-white">
                                <Check className="w-3 h-3" />
                              </div>
                            ) : sheet.req ? (
                              <div className="w-5 h-5 rounded-full bg-[#da1e28] flex items-center justify-center text-white text-[10px] font-bold">
                                !
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-[#8d8d8d] flex items-center justify-center text-white text-[10px] font-bold">
                                ?
                              </div>
                            )}
                            <strong className="text-[15px] font-medium text-[#161616]">
                              {sheet.label}
                            </strong>
                            <span
                              className={`text-[11px] uppercase font-bold px-2 py-0.5 rounded-none ${sheet.req ? "bg-[#ffe5e5] text-[#da1e28]" : "bg-[#e5e5e5] text-[#525252]"}`}
                            >
                              {sheet.req ? "Required" : "Optional"}
                            </span>
                          </div>

                          {sheet.state ? (
                            <div className="pl-8 flex flex-col gap-0.5 mt-2">
                              <span className="text-[13px] font-medium text-[#161616] bg-white border border-[#e0e0e0] px-2 py-1 inline-flex items-center w-fit gap-2">
                                <FileSpreadsheet className="w-3.5 h-3.5 text-[#198038]" />
                                {sheet.state.name}
                              </span>
                              <span className="text-[12px] text-[#525252] mt-1">
                                {sheet.state.data.length} valid records
                                integrated
                              </span>
                            </div>
                          ) : (
                            <p className="text-[13px] text-[#525252] pl-8 mt-1">
                              {sheet.desc}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <button
                            onClick={() => downloadTemplate(sheet.tplId)}
                            title="Download blank template"
                            className="bg-white text-[#161616] border border-[#e0e0e0] hover:bg-[#f4f4f4] px-3 py-2 text-[13px] transition-colors flex items-center gap-2 font-medium cursor-pointer rounded-none"
                          >
                            <Download className="w-4 h-4" /> Template
                          </button>

                          <button
                            onClick={() => sheet.ref.current?.click()}
                            className={`${sheet.state ? "bg-white text-[#161616] border-[#e0e0e0] hover:bg-[#f4f4f4]" : "bg-[#86bc25] text-white border-transparent hover:bg-[#6c9c1b]"} border px-4 py-2 text-[13px] transition-colors flex items-center gap-2 font-medium cursor-pointer rounded-none`}
                          >
                            <Upload className="w-4 h-4" />
                            {sheet.state ? "Replace" : "Upload"}
                          </button>

                          {sheet.state && (
                            <>
                              <button
                                onClick={() => {
                                  setViewSheet({
                                    id: sheet.sheetKey,
                                    name: sheet.state!.name,
                                    data: sheet.state!.data,
                                  });
                                  setViewPage(1);
                                  setViewSearch("");
                                }}
                                className="bg-white text-[#161616] border border-[#e0e0e0] hover:bg-[#f4f4f4] px-3 py-2 text-[13px] transition-colors flex items-center gap-2 font-medium cursor-pointer rounded-none"
                              >
                                <Database className="w-4 h-4" /> View
                              </button>
                              <button
                                onClick={() => {
                                  if (
                                    confirm(
                                      `Remove uploaded file "${sheet.state!.name}"?`,
                                    )
                                  )
                                    sheet.setter(null);
                                }}
                                className="text-[#da291c] hover:bg-[#fde7e6] p-2 transition-colors border border-transparent hover:border-[#da291c] rounded-none flex items-center gap-2 text-[13px] font-medium"
                              >
                                <Trash2 className="w-4 h-4" /> Remove
                              </button>
                            </>
                          )}

                          <input
                            ref={sheet.ref}
                            type="file"
                            accept=".csv,.xlsx"
                            className="hidden"
                            onChange={async (e) => {
                              const f = e.target.files?.[0];
                              if (!f) return;
                              try {
                                const data = await f.arrayBuffer();
                                const X = (window as any).XLSX || XLSX;
                                const workbook = X.read(data, {
                                  type: "array",
                                });
                                const first = workbook.SheetNames[0];
                                const ws = workbook.Sheets[first];
                                // Read entire sheet as 2D array first to find the real header row
                                const rows: any[][] = X.utils.sheet_to_json(
                                  ws,
                                  { header: 1, blankrows: false, defval: "" },
                                );
                                // Find header row: contains "Counterparty Name" or "Counterparty / Asset" + at least 3 non-empty cells
                                let headerIdx = 0;
                                for (
                                  let i = 0;
                                  i < Math.min(rows.length, 15);
                                  i++
                                ) {
                                  const row = rows[i] || [];
                                  const cells = row.map((c: any) =>
                                    String(c || "").toLowerCase(),
                                  );
                                  const hasCp = cells.some(
                                    (c) =>
                                      c.includes("counterparty name") ||
                                      c.includes("counterparty / asset") ||
                                      c === "counterparty",
                                  );
                                  const nonEmpty = cells.filter(
                                    (c) => c.trim().length > 0,
                                  ).length;
                                  if (hasCp && nonEmpty >= 3) {
                                    headerIdx = i;
                                    break;
                                  }
                                }
                                // Build header keys (normalize whitespace/newlines)
                                const headers = (rows[headerIdx] || []).map(
                                  (h: any) =>
                                    String(h || "")
                                      .replace(/\s+/g, " ")
                                      .trim(),
                                );
                                // Find footer: any row after data containing "EMISSION FACTOR" or fully empty until end
                                const json: any[] = [];
                                for (
                                  let r = headerIdx + 1;
                                  r < rows.length;
                                  r++
                                ) {
                                  const row = rows[r] || [];
                                  const firstCell = String(row[0] || "").trim();
                                  if (!firstCell) continue;
                                  if (
                                    /emission factor|reference|fuel\s*\/\s*energy|^the\s|^update/i.test(
                                      firstCell,
                                    )
                                  )
                                    break;
                                  const obj: Record<string, any> = {};
                                  headers.forEach((h: string, idx: number) => {
                                    if (h) obj[h] = row[idx];
                                  });
                                  json.push(obj);
                                }
                                sheet.setter({ name: f.name, data: json });
                              } catch (err) {
                                console.error(
                                  "[EmissionsModule] CSV parse error:",
                                  err,
                                );
                              } finally {
                                e.target.value = "";
                              }
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in duration-200">
                <div className="mb-6 flex justify-between items-end gap-6">
                  <div className="min-w-0">
                    <h2 className="text-[24px] font-normal text-[#161616] leading-tight">
                      Portfolio Inventory Review
                    </h2>
                    <p className="text-[14px] text-[#525252] mt-1">
                      Displaying real-time analytical scorecards: Total Financed
                      Emissions, Total Exposure, Emission Intensity Metrics, DQS
                      Overview, Emissions by Sector and Asset Classes, Highest
                      Emitter Tables.
                    </p>
                  </div>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => setStep(2)}
                      className="px-4 py-2 border border-[#e0e0e0] bg-white text-[#161616] hover:bg-[#f4f4f4] text-[14px] font-medium transition-colors rounded-none"
                    >
                      Back to Import
                    </button>
                    <button className="px-6 py-2 bg-[#86bc25] text-white hover:bg-[#6c9c1b] text-[14px] font-medium transition-colors rounded-none flex items-center gap-2">
                      Export Report <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] mb-2">
                  {[
                    {
                      label: "Total Financed Emissions",
                      value: financedTotal,
                      suffix: "tCOâ‚‚e",
                      highlight: true,
                    },
                    {
                      label: "Total Exposure",
                      value: portfolioResults.reduce(
                        (a, b) => a + (b.exposure || 0),
                        0,
                      ),
                      suffix: "$M",
                      highlight: false,
                    },
                    {
                      label: "Emission Intensity",
                      value:
                        portfolioResults.reduce(
                          (a, b) => a + (b.exposure || 0),
                          0,
                        ) > 0
                          ? financedTotal /
                            portfolioResults.reduce(
                              (a, b) => a + (b.exposure || 0),
                              0,
                            )
                          : 0,
                      suffix: "tCOâ‚‚e / $M",
                      highlight: false,
                    },
                    {
                      label: "Total Facilities",
                      value: portfolioResults.length,
                      suffix: "Loans / Assets",
                      highlight: false,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`p-6 flex flex-col justify-between ${stat.highlight ? "bg-[#f4fadc]" : "bg-white"}`}
                    >
                      <p
                        className={`text-[13px] uppercase font-semibold mb-6 tracking-wide ${stat.highlight ? "text-[#86bc25]" : "text-[#525252]"}`}
                      >
                        {stat.label}
                      </p>
                      <div>
                        <p
                          className={`text-[32px] font-light leading-none ${stat.highlight ? "text-[#435e12]" : "text-[#161616]"}`}
                        >
                          {stat.label === "Total Facilities"
                            ? stat.value
                            : formatNumber(stat.value)}
                        </p>
                        <p
                          className={`text-[13px] mt-1.5 font-medium ${stat.highlight ? "text-[#86bc25]" : "text-[#8d8d8d]"}`}
                        >
                          {stat.suffix}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secondary KPI row */}
                {portfolioResults.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] mb-6">
                    {(() => {
                      const totEm =
                        portfolioResults.reduce(
                          (a, b) => a + b.financedEmissions,
                          0,
                        ) || 1;
                      const weightedDqs =
                        portfolioResults.reduce(
                          (a, b) => a + b.dqs * b.financedEmissions,
                          0,
                        ) / totEm;
                      const coverage =
                        (portfolioResults.filter(
                          (r) =>
                            r.option === "Option 1" || r.option === "Option 2",
                        ).length /
                          portfolioResults.length) *
                        100;
                      const sectorMap: Record<string, number> = {};
                      portfolioResults.forEach((r) => {
                        sectorMap[r.sector] =
                          (sectorMap[r.sector] || 0) + r.financedEmissions;
                      });
                      const topSector = Object.entries(sectorMap).sort(
                        (a, b) => b[1] - a[1],
                      )[0];
                      const verifiedShare =
                        (portfolioResults
                          .filter((r) => r.dqs === 1)
                          .reduce((a, b) => a + b.financedEmissions, 0) /
                          totEm) *
                        100;
                      return [
                        {
                          label: "Weighted Avg DQS",
                          value: weightedDqs.toFixed(2),
                          suffix: "(1=best Â· 5=worst)",
                        },
                        {
                          label: "PCAF Data Coverage",
                          value: coverage.toFixed(1) + "%",
                          suffix: "Option 1+2 share",
                        },
                        {
                          label: "Verified Emissions",
                          value: verifiedShare.toFixed(1) + "%",
                          suffix: "Third-party verified",
                        },
                        {
                          label: "Top Emitting Sector",
                          value: topSector ? topSector[0] : "â€”",
                          suffix: topSector
                            ? formatNumber(topSector[1]) + " tCOâ‚‚e"
                            : "",
                        },
                      ];
                    })().map((stat) => (
                      <div
                        key={stat.label}
                        className="p-6 bg-white flex flex-col justify-between"
                      >
                        <p className="text-[13px] uppercase font-semibold mb-6 tracking-wide text-[#525252]">
                          {stat.label}
                        </p>
                        <div>
                          <p
                            className="text-[24px] font-light leading-tight text-[#161616] truncate"
                            title={String(stat.value)}
                          >
                            {stat.value}
                          </p>
                          <p className="text-[12px] mt-1.5 font-medium text-[#8d8d8d]">
                            {stat.suffix}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {portfolioResults.length > 0 ? (
                  <>
                    <div className="space-y-6 mb-6">
                      <div className="bg-white border border-[#e0e0e0] p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-[16px] font-medium text-[#161616]">
                            Emissions by Sector
                          </h3>
                          <div className="flex border border-[#e0e0e0]">
                            <button
                              onClick={() => setSectorView("chart")}
                              className={`px-3 py-1 text-[12px] font-medium ${sectorView === "chart" ? "bg-[#86bc25] text-white" : "bg-white text-[#525252] hover:bg-[#f4f4f4]"}`}
                            >
                              Chart
                            </button>
                            <button
                              onClick={() => setSectorView("table")}
                              className={`px-3 py-1 text-[12px] font-medium border-l border-[#e0e0e0] ${sectorView === "table" ? "bg-[#86bc25] text-white" : "bg-white text-[#525252] hover:bg-[#f4f4f4]"}`}
                            >
                              Table
                            </button>
                          </div>
                        </div>
                        {sectorView === "chart" ? (
                          <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={Object.entries(
                                  portfolioResults.reduce((acc, r) => {
                                    acc[r.sector] =
                                      (acc[r.sector] || 0) +
                                      r.financedEmissions;
                                    return acc;
                                  }, {}),
                                )
                                  .map(([sector, val]) => ({
                                    name: sector,
                                    value: val,
                                  }))
                                  .sort((a, b) => b.value - a.value)
                                  .slice(0, 7)}
                                layout="vertical"
                                margin={{
                                  top: 0,
                                  right: 30,
                                  left: 0,
                                  bottom: 0,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  horizontal={true}
                                  vertical={false}
                                  stroke="#e0e0e0"
                                />
                                <XAxis
                                  type="number"
                                  tickFormatter={(v) => formatNumber(v)}
                                  tick={{ fontSize: 11, fill: "#525252" }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <YAxis
                                  dataKey="name"
                                  type="category"
                                  width={160}
                                  tick={{
                                    fontSize: 12,
                                    fill: "#161616",
                                    fontWeight: 500,
                                  }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Tooltip
                                  cursor={{ fill: "#f4f4f4" }}
                                  formatter={(val) => [
                                    formatNumber(val) + " tCOâ‚‚e",
                                    "Emissions",
                                  ]}
                                  contentStyle={{
                                    borderRadius: "4px",
                                    border: "1px solid #e0e0e0",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    fontSize: "13px",
                                  }}
                                />
                                <Bar
                                  dataKey="value"
                                  fill="#86bc25"
                                  barSize={24}
                                  radius={[0, 0, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="max-h-[280px] overflow-auto border border-[#e0e0e0]">
                            <table className="w-full text-left text-[13px]">
                              <thead className="bg-[#f4f4f4] text-[#525252] sticky top-0">
                                <tr>
                                  <th className="px-4 py-2 font-medium">
                                    Sector
                                  </th>
                                  <th className="px-4 py-2 font-medium text-right">
                                    Emissions (tCOâ‚‚e)
                                  </th>
                                  <th className="px-4 py-2 font-medium text-right">
                                    % of Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const tot =
                                    portfolioResults.reduce(
                                      (a, b) => a + b.financedEmissions,
                                      0,
                                    ) || 1;
                                  return Object.entries(
                                    portfolioResults.reduce((acc: any, r) => {
                                      acc[r.sector] =
                                        (acc[r.sector] || 0) +
                                        r.financedEmissions;
                                      return acc;
                                    }, {}),
                                  )
                                    .map(([s, v]) => ({ s, v: v as number }))
                                    .sort((a, b) => b.v - a.v)
                                    .map((row) => (
                                      <tr
                                        key={row.s}
                                        className="border-b border-[#e0e0e0] hover:bg-[#f9f9f9]"
                                      >
                                        <td className="px-4 py-2">{row.s}</td>
                                        <td className="px-4 py-2 text-right font-mono">
                                          {formatNumber(row.v)}
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-[#525252]">
                                          {((row.v / tot) * 100).toFixed(1)}%
                                        </td>
                                      </tr>
                                    ));
                                })()}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="bg-white border border-[#e0e0e0] p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <h3 className="text-[16px] font-medium text-[#161616]">
                            DQS Overview
                          </h3>
                          <div className="relative group">
                            <Info className="w-4 h-4 text-[#8d8d8d] cursor-pointer" />
                            <div className="absolute left-6 top-0 z-20 hidden group-hover:block w-72 bg-[#161616] text-white text-[12px] rounded-sm p-3 shadow-lg leading-relaxed">
                              <p className="font-semibold mb-1">
                                Data Quality Score (DQS)
                              </p>
                              <p>
                                A PCAF metric (1â€“5) rating the reliability of
                                financed emissions data:
                              </p>
                              <ul className="mt-1 space-y-0.5 list-none">
                                <li>
                                  <span className="font-medium text-[#86bc25]">
                                    1
                                  </span>{" "}
                                  â€” Verified reported GHG data
                                </li>
                                <li>
                                  <span className="font-medium text-[#86bc25]">
                                    2
                                  </span>{" "}
                                  â€” Unverified reported GHG data
                                </li>
                                <li>
                                  <span className="font-medium text-yellow-400">
                                    3
                                  </span>{" "}
                                  â€” Activity-based estimation
                                </li>
                                <li>
                                  <span className="font-medium text-orange-400">
                                    4
                                  </span>{" "}
                                  â€” Revenue-based MRIO proxy
                                </li>
                                <li>
                                  <span className="font-medium text-red-400">
                                    5
                                  </span>{" "}
                                  â€” Exposure-based fallback
                                </li>
                              </ul>
                              <p className="mt-1 text-[#8d8d8d]">
                                Lower is better.
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={Object.entries(
                                  portfolioResults.reduce((acc, r) => {
                                    acc[`Score ${r.dqs}`] =
                                      (acc[`Score ${r.dqs}`] || 0) +
                                      r.financedEmissions;
                                    return acc;
                                  }, {}),
                                ).map(([name, value]) => ({ name, value }))}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={105}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {Object.entries(
                                  portfolioResults.reduce((acc, r) => {
                                    acc[`Score ${r.dqs}`] =
                                      (acc[`Score ${r.dqs}`] || 0) +
                                      r.financedEmissions;
                                    return acc;
                                  }, {}),
                                )
                                  .sort(
                                    ([a], [b]) =>
                                      Number(a.replace("Score ", "")) -
                                      Number(b.replace("Score ", "")),
                                  )
                                  .map(([name], idx) => {
                                    const score = Number(
                                      name.replace("Score ", ""),
                                    ) as 1 | 2 | 3 | 4 | 5;
                                    return (
                                      <Cell
                                        key={idx}
                                        fill={
                                          DQS_COLORS[score] ||
                                          DELOITTE_PALETTE[
                                            idx % DELOITTE_PALETTE.length
                                          ]
                                        }
                                      />
                                    );
                                  })}
                              </Pie>
                              <Tooltip
                                formatter={(val) => formatNumber(val)}
                                contentStyle={{
                                  borderRadius: "4px",
                                  border: "1px solid #e0e0e0",
                                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                  fontSize: "13px",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ background: DQS_COLORS[1] }}
                            ></div>
                            <span className="text-[12px] text-[#525252]">
                              DQS 1 (Best)
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ background: DQS_COLORS[2] }}
                            ></div>
                            <span className="text-[12px] text-[#525252]">
                              DQS 2
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ background: DQS_COLORS[3] }}
                            ></div>
                            <span className="text-[12px] text-[#525252]">
                              DQS 3
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ background: DQS_COLORS[4] }}
                            ></div>
                            <span className="text-[12px] text-[#525252]">
                              DQS 4
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ background: DQS_COLORS[5] }}
                            ></div>
                            <span className="text-[12px] text-[#525252]">
                              DQS 5 (Poor)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 mb-6">
                      <div className="col-span-5 bg-white border border-[#e0e0e0] p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-[16px] font-medium text-[#161616]">
                            Emissions by Asset Classes
                          </h3>
                          <div className="flex border border-[#e0e0e0]">
                            <button
                              onClick={() => setClassView("chart")}
                              className={`px-3 py-1 text-[12px] font-medium ${classView === "chart" ? "bg-[#86bc25] text-white" : "bg-white text-[#525252] hover:bg-[#f4f4f4]"}`}
                            >
                              Chart
                            </button>
                            <button
                              onClick={() => setClassView("table")}
                              className={`px-3 py-1 text-[12px] font-medium border-l border-[#e0e0e0] ${classView === "table" ? "bg-[#86bc25] text-white" : "bg-white text-[#525252] hover:bg-[#f4f4f4]"}`}
                            >
                              Table
                            </button>
                          </div>
                        </div>
                        {classView === "chart" ? (
                          <div className="h-[280px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={Object.entries(
                                  portfolioResults.reduce((acc, r) => {
                                    acc[r.assetClass] =
                                      (acc[r.assetClass] || 0) +
                                      r.financedEmissions;
                                    return acc;
                                  }, {}),
                                )
                                  .map(([name, val]) => ({ name, value: val }))
                                  .sort((a, b) => b.value - a.value)}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 20,
                                }}
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  vertical={false}
                                  stroke="#e0e0e0"
                                />
                                <XAxis
                                  dataKey="name"
                                  tick={{ fontSize: 11, fill: "#525252" }}
                                  axisLine={false}
                                  tickLine={false}
                                  height={30}
                                />
                                <YAxis
                                  tickFormatter={(v) => formatNumber(v)}
                                  tick={{ fontSize: 11, fill: "#525252" }}
                                  axisLine={false}
                                  tickLine={false}
                                />
                                <Tooltip
                                  cursor={{ fill: "#f4f4f4" }}
                                  formatter={(val) => [
                                    formatNumber(val),
                                    "tCOâ‚‚e",
                                  ]}
                                  contentStyle={{
                                    borderRadius: "4px",
                                    fontSize: "13px",
                                  }}
                                />
                                <Bar
                                  dataKey="value"
                                  fill="#00533f"
                                  barSize={40}
                                  radius={[0, 0, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="max-h-[280px] overflow-auto border border-[#e0e0e0]">
                            <table className="w-full text-left text-[13px]">
                              <thead className="bg-[#f4f4f4] text-[#525252] sticky top-0">
                                <tr>
                                  <th className="px-4 py-2 font-medium">
                                    Asset Class
                                  </th>
                                  <th className="px-4 py-2 font-medium text-right">
                                    Emissions (tCOâ‚‚e)
                                  </th>
                                  <th className="px-4 py-2 font-medium text-right">
                                    % of Total
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {(() => {
                                  const tot =
                                    portfolioResults.reduce(
                                      (a, b) => a + b.financedEmissions,
                                      0,
                                    ) || 1;
                                  return Object.entries(
                                    portfolioResults.reduce((acc: any, r) => {
                                      acc[r.assetClass] =
                                        (acc[r.assetClass] || 0) +
                                        r.financedEmissions;
                                      return acc;
                                    }, {}),
                                  )
                                    .map(([s, v]) => ({ s, v: v as number }))
                                    .sort((a, b) => b.v - a.v)
                                    .map((row) => (
                                      <tr
                                        key={row.s}
                                        className="border-b border-[#e0e0e0] hover:bg-[#f9f9f9]"
                                      >
                                        <td className="px-4 py-2">{row.s}</td>
                                        <td className="px-4 py-2 text-right font-mono">
                                          {formatNumber(row.v)}
                                        </td>
                                        <td className="px-4 py-2 text-right font-mono text-[#525252]">
                                          {((row.v / tot) * 100).toFixed(1)}%
                                        </td>
                                      </tr>
                                    ));
                                })()}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>

                      <div className="bg-white border border-[#e0e0e0] flex flex-col">
                        <div className="p-6 border-b border-[#e0e0e0] flex justify-between items-center">
                          <h3 className="text-[16px] font-medium text-[#161616]">
                            Highest Emitter Tables
                          </h3>
                          <button
                            onClick={() => setPortfolioAssets([])}
                            className="text-[#da291c] text-[13px] font-medium flex items-center gap-1 hover:underline"
                          >
                            <Trash2 size={14} /> Clear Portfolio
                          </button>
                        </div>
                        <div className="flex-1 overflow-auto max-h-[310px]">
                          <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#f4f4f4] text-[#525252] sticky top-0 font-medium whitespace-nowrap">
                              <tr>
                                <th className="px-4 py-3">Counterparty</th>
                                <th className="px-4 py-3">Sector</th>
                                <th className="px-4 py-3">Asset Class</th>
                                <th className="px-4 py-3 text-right">
                                  Exposure ($M)
                                </th>
                                <th className="px-4 py-3 text-right">
                                  Emissions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {[...portfolioResults]
                                .sort(
                                  (a, b) =>
                                    b.financedEmissions - a.financedEmissions,
                                )
                                .slice(0, 10)
                                .map((p, i) => (
                                  <tr
                                    key={p.id}
                                    className={`border-b border-[#e0e0e0] hover:bg-[#f9f9f9] ${i < 3 ? "bg-[#fffcf8]" : ""}`}
                                  >
                                    <td className="px-4 py-3 font-medium text-[#161616] flex items-center gap-2">
                                      {i < 3 && (
                                        <span className="text-[#ed8b00]">
                                          â˜…
                                        </span>
                                      )}
                                      {p.counterparty}
                                    </td>
                                    <td
                                      className="px-4 py-3 text-[#525252] truncate max-w-[120px]"
                                      title={p.sector}
                                    >
                                      {p.sector}
                                    </td>
                                    <td className="px-4 py-3 text-[#525252]">
                                      {p.assetClass}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">
                                      {formatNumber(p.exposure)}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-semibold text-[#da291c]">
                                      {formatNumber(p.financedEmissions)}
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* PCAF Option Distribution + Full Inventory */}
                    <div className="space-y-6 mb-6">
                      <div className="bg-white border border-[#e0e0e0] p-6">
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-[16px] font-medium text-[#161616]">
                              PCAF Option Distribution
                            </h3>
                            <p className="text-[12px] text-[#525252] mt-1">
                              Methodology used per counterparty
                            </p>
                          </div>
                          <div className="flex border border-[#e0e0e0]">
                            <button
                              onClick={() => setOptionView("chart")}
                              className={`px-3 py-1 text-[12px] font-medium ${optionView === "chart" ? "bg-[#86bc25] text-white" : "bg-white text-[#525252] hover:bg-[#f4f4f4]"}`}
                            >
                              Chart
                            </button>
                            <button
                              onClick={() => setOptionView("table")}
                              className={`px-3 py-1 text-[12px] font-medium border-l border-[#e0e0e0] ${optionView === "table" ? "bg-[#86bc25] text-white" : "bg-white text-[#525252] hover:bg-[#f4f4f4]"}`}
                            >
                              Table
                            </button>
                          </div>
                        </div>
                        {(() => {
                          const map: Record<
                            string,
                            { count: number; emissions: number }
                          > = {};
                          portfolioResults.forEach((r) => {
                            const k = r.option;
                            if (!map[k]) map[k] = { count: 0, emissions: 0 };
                            map[k].count += 1;
                            map[k].emissions += r.financedEmissions;
                          });
                          const order = [
                            "Option 1",
                            "Option 2",
                            "Option 3",
                            "Option 4",
                            "Sovereign",
                          ];
                          const rows = order
                            .filter((k) => map[k])
                            .map((k) => ({
                              name: k,
                              count: map[k].count,
                              emissions: map[k].emissions,
                            }));
                          return optionView === "chart" ? (
                            <div className="h-[280px]">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={rows}
                                  margin={{
                                    top: 10,
                                    right: 20,
                                    left: 0,
                                    bottom: 10,
                                  }}
                                >
                                  <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                    stroke="#e0e0e0"
                                  />
                                  <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 11, fill: "#525252" }}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <YAxis
                                    tickFormatter={(v) => formatNumber(v)}
                                    tick={{ fontSize: 11, fill: "#525252" }}
                                    axisLine={false}
                                    tickLine={false}
                                  />
                                  <Tooltip
                                    cursor={{ fill: "#f4f4f4" }}
                                    formatter={(val: any) => [
                                      formatNumber(val),
                                      "tCOâ‚‚e",
                                    ]}
                                  />
                                  <Bar
                                    dataKey="emissions"
                                    fill="#86bc25"
                                    barSize={40}
                                  >
                                    {rows.map((_, i) => (
                                      <Cell
                                        key={i}
                                        fill={
                                          DELOITTE_PALETTE[
                                            i % DELOITTE_PALETTE.length
                                          ]
                                        }
                                      />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="max-h-[280px] overflow-auto border border-[#e0e0e0]">
                              <table className="w-full text-left text-[13px]">
                                <thead className="bg-[#f4f4f4] text-[#525252] sticky top-0">
                                  <tr>
                                    <th className="px-4 py-2 font-medium">
                                      Option
                                    </th>
                                    <th className="px-4 py-2 font-medium text-right">
                                      Count
                                    </th>
                                    <th className="px-4 py-2 font-medium text-right">
                                      Emissions (tCOâ‚‚e)
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {rows.map((r) => (
                                    <tr
                                      key={r.name}
                                      className="border-b border-[#e0e0e0] hover:bg-[#f9f9f9]"
                                    >
                                      <td className="px-4 py-2 font-medium">
                                        {r.name}
                                      </td>
                                      <td className="px-4 py-2 text-right font-mono">
                                        {r.count}
                                      </td>
                                      <td className="px-4 py-2 text-right font-mono">
                                        {formatNumber(r.emissions)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Full counterparty inventory with row-level delete */}
                      <div className="bg-white border border-[#e0e0e0] flex flex-col">
                        <div className="p-6 border-b border-[#e0e0e0] flex justify-between items-center">
                          <h3 className="text-[16px] font-medium text-[#161616]">
                            Counterparty Inventory ({portfolioResults.length})
                          </h3>
                        </div>
                        <div className="flex-1 overflow-auto max-h-[340px]">
                          <table className="w-full text-left text-[13px]">
                            <thead className="bg-[#f4f4f4] text-[#525252] sticky top-0 font-medium whitespace-nowrap">
                              <tr>
                                <th className="px-4 py-3">Counterparty</th>
                                <th className="px-4 py-3">Option</th>
                                <th className="px-4 py-3">DQS</th>
                                <th className="px-4 py-3 text-right">
                                  Exposure ($M)
                                </th>
                                <th className="px-4 py-3 text-right">
                                  Emissions
                                </th>
                                <th className="px-4 py-3 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {portfolioResults.map((p) => (
                                <tr
                                  key={p.id}
                                  className="border-b border-[#e0e0e0] hover:bg-[#f9f9f9]"
                                >
                                  <td
                                    className="px-4 py-3 font-medium text-[#161616] truncate max-w-[180px]"
                                    title={p.counterparty}
                                  >
                                    {p.counterparty}
                                  </td>
                                  <td className="px-4 py-3 text-[#525252]">
                                    {p.option}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span
                                      className="inline-block px-2 py-0.5 text-[11px] font-semibold text-white"
                                      style={{ background: DQS_COLORS[p.dqs] }}
                                    >
                                      {p.dqs}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono">
                                    {formatNumber(p.exposure)}
                                  </td>
                                  <td className="px-4 py-3 text-right font-mono font-semibold">
                                    {formatNumber(p.financedEmissions)}
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      onClick={() =>
                                        setPortfolioAssets((arr) =>
                                          arr.filter((a) => a.id !== p.id),
                                        )
                                      }
                                      className="text-[#da291c] hover:bg-[#fde7e6] p-1 rounded-none"
                                      title="Remove counterparty"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white border border-[#e0e0e0] p-16 flex flex-col items-center justify-center text-center mb-6">
                    <Database className="w-12 h-12 text-[#cccccc] mb-4" />
                    <h3 className="text-[18px] font-medium text-[#161616] mb-2">
                      Awaiting Calculation Data
                    </h3>
                    <p className="text-[14px] text-[#525252] max-w-md">
                      Navigate back to the data integration view to upload the
                      necessary counterparty inputs and calculate financed
                      emissions.
                    </p>
                    <button
                      onClick={() => setStep(2)}
                      className="mt-6 px-6 py-2.5 bg-[#161616] text-white hover:bg-[#393939] text-[14px] font-medium transition-colors rounded-none"
                    >
                      Go to Data Integration
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ MODALS (CARBON STYLE) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}

      {/* View Uploaded Data Modal â€” paginated table */}
      {viewSheet &&
        (() => {
          const PAGE_SIZE = 25;
          const term = viewSearch.trim().toLowerCase();
          const filtered = term
            ? viewSheet.data.filter((row) =>
                Object.values(row || {}).some((v) =>
                  String(v ?? "")
                    .toLowerCase()
                    .includes(term),
                ),
              )
            : viewSheet.data;
          const totalPages = Math.max(
            1,
            Math.ceil(filtered.length / PAGE_SIZE),
          );
          const pageSafe = Math.min(viewPage, totalPages);
          const slice = filtered.slice(
            (pageSafe - 1) * PAGE_SIZE,
            pageSafe * PAGE_SIZE,
          );
          const headers = Object.keys(viewSheet.data[0] || {});
          return (
            <div className="fixed inset-0 z-[300] flex items-start justify-center bg-[#161616]/70 pt-[5vh] px-4">
              <div
                className="bg-white w-full max-w-[1200px] shadow-2xl flex flex-col"
                style={{ maxHeight: "90vh" }}
              >
                <div className="px-6 py-4 border-b border-[#e0e0e0] flex items-center justify-between bg-[#f4f4f4]">
                  <div>
                    <h3 className="text-[18px] font-medium text-[#161616]">
                      {viewSheet.name}
                    </h3>
                    <p className="text-[12px] text-[#525252] mt-0.5">
                      {filtered.length} of {viewSheet.data.length} rows Â·{" "}
                      {headers.length} columns
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      placeholder="Search rowsâ€¦"
                      value={viewSearch}
                      onChange={(e) => {
                        setViewSearch(e.target.value);
                        setViewPage(1);
                      }}
                      className="bg-white border border-[#8d8d8d] text-[13px] px-3 py-1.5 outline-none focus:border-[#86bc25] rounded-none"
                    />
                    <button
                      onClick={() => {
                        setViewSheet(null);
                        setViewSearch("");
                      }}
                      className="px-4 py-1.5 bg-[#161616] text-white hover:bg-[#393939] text-[13px] font-medium rounded-none"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-left text-[12px] whitespace-nowrap">
                    <thead className="bg-[#f4f4f4] text-[#525252] sticky top-0 font-medium border-b border-[#e0e0e0]">
                      <tr>
                        <th className="px-3 py-2 w-12">#</th>
                        {headers.map((h) => (
                          <th key={h} className="px-3 py-2">
                            {h}
                          </th>
                        ))}
                        <th className="px-3 py-2 sticky right-0 bg-[#f4f4f4]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {slice.map((row, idx) => {
                        const globalIdx = (pageSafe - 1) * PAGE_SIZE + idx;
                        return (
                          <tr
                            key={globalIdx}
                            className="border-b border-[#e0e0e0] hover:bg-[#f9f9f9]"
                          >
                            <td className="px-3 py-2 text-[#8d8d8d] font-mono">
                              {globalIdx + 1}
                            </td>
                            {headers.map((h) => (
                              <td key={h} className="px-3 py-2 text-[#161616]">
                                {String(row[h] ?? "")}
                              </td>
                            ))}
                            <td className="px-3 py-2 sticky right-0 bg-white">
                              <button
                                onClick={() => {
                                  const setter =
                                    viewSheet.id === "s1"
                                      ? setS1DataState
                                      : viewSheet.id === "s2"
                                        ? setS2DataState
                                        : viewSheet.id === "s3"
                                          ? setS3DataState
                                          : setS4DataState;
                                  const newData = viewSheet.data.filter(
                                    (_, i) => i !== filtered.indexOf(row),
                                  );
                                  setter({
                                    name: viewSheet.name,
                                    data: newData,
                                  });
                                  setViewSheet({ ...viewSheet, data: newData });
                                }}
                                className="text-[#da291c] hover:bg-[#fde7e6] p-1 rounded-none"
                                title="Delete row"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {slice.length === 0 && (
                        <tr>
                          <td
                            colSpan={headers.length + 2}
                            className="px-6 py-12 text-center text-[#8d8d8d]"
                          >
                            No rows match.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-3 border-t border-[#e0e0e0] bg-[#f4f4f4] flex items-center justify-between text-[13px]">
                  <span className="text-[#525252]">
                    Page {pageSafe} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewPage(1)}
                      disabled={pageSafe === 1}
                      className="px-3 py-1 border border-[#e0e0e0] bg-white text-[#161616] hover:bg-white disabled:text-[#c6c6c6] disabled:cursor-not-allowed rounded-none"
                    >
                      First
                    </button>
                    <button
                      onClick={() => setViewPage((p) => Math.max(1, p - 1))}
                      disabled={pageSafe === 1}
                      className="px-3 py-1 border border-[#e0e0e0] bg-white text-[#161616] hover:bg-white disabled:text-[#c6c6c6] disabled:cursor-not-allowed rounded-none"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() =>
                        setViewPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={pageSafe === totalPages}
                      className="px-3 py-1 border border-[#e0e0e0] bg-white text-[#161616] hover:bg-white disabled:text-[#c6c6c6] disabled:cursor-not-allowed rounded-none"
                    >
                      Next
                    </button>
                    <button
                      onClick={() => setViewPage(totalPages)}
                      disabled={pageSafe === totalPages}
                      className="px-3 py-1 border border-[#e0e0e0] bg-white text-[#161616] hover:bg-white disabled:text-[#c6c6c6] disabled:cursor-not-allowed rounded-none"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

      {s1Modal && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center bg-[#161616]/70 pt-[10vh] px-4">
          <div className="bg-white w-full max-w-150 shadow-2xl relative">
            <div className="px-6 py-5 border-b border-[#e0e0e0] flex items-center justify-between bg-[#f4f4f4]">
              <h3 className="text-[18px] font-normal text-[#161616]">
                Define Scope 1 Asset
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <DeloitteInput
                label="Entity Name"
                value={newS1.name ?? ""}
                onChange={(e) =>
                  setNewS1((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Primary Generator 001"
              />
              <div className="grid grid-cols-2 gap-5">
                <DeloitteInput
                  label="Location Reference"
                  value={newS1.branch ?? ""}
                  onChange={(e) =>
                    setNewS1((p) => ({ ...p, branch: e.target.value }))
                  }
                />
                <DeloitteSelect
                  label="System Type"
                  value={newS1.type}
                  onChange={(e) =>
                    setNewS1((p) => ({
                      ...p,
                      type: e.target.value as "stationary" | "mobile",
                    }))
                  }
                  options={[
                    { label: "Stationary Machine", value: "stationary" },
                    { label: "Mobile / Vehicle", value: "mobile" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <DeloitteSelect
                  label="Chemical Fuel"
                  value={newS1.fuelType}
                  onChange={(e) =>
                    setNewS1((p) => ({
                      ...p,
                      fuelType: e.target.value as
                        | "diesel"
                        | "petrol"
                        | "lpg"
                        | "cng",
                    }))
                  }
                  options={[
                    { label: "Diesel (HSD)", value: "diesel" },
                    { label: "Petrol (MoGas)", value: "petrol" },
                    { label: "Liquefied Petrol Gas (LPG)", value: "lpg" },
                    { label: "Compressed Natural Gas (CNG)", value: "cng" },
                  ]}
                />
                <DeloitteInput
                  label="Monthly Volume (Litres)"
                  type="number"
                  value={newS1.litersPerMonth || ""}
                  onChange={(e) =>
                    setNewS1((p) => ({
                      ...p,
                      litersPerMonth: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex bg-[#f4f4f4] border-t border-[#e0e0e0]">
              <button
                onClick={() => setS1Modal(false)}
                className="flex-1 py-4 text-[#161616] text-[14px] hover:bg-[#e5e5e5] font-medium transition-colors border-r border-[#e0e0e0]"
              >
                Cancel
              </button>
              <button
                disabled={!newS1.name}
                onClick={handleAddS1}
                className="flex-1 py-4 text-white text-[14px] bg-[#86bc25] hover:bg-[#70a31d] disabled:bg-[#c6c6c6] disabled:text-[#8d8d8d] font-medium transition-colors"
              >
                Commit Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {s2Modal && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center bg-[#161616]/70 pt-[10vh] px-4">
          <div className="bg-white w-full max-w-150 shadow-2xl relative">
            <div className="px-6 py-5 border-b border-[#e0e0e0] flex items-center justify-between bg-[#f4f4f4]">
              <h3 className="text-[18px] font-normal text-[#161616]">
                Define Scope 2 Grid Setup
              </h3>
            </div>
            <div className="p-6 space-y-5">
              <DeloitteInput
                label="Region / Facility Key"
                value={newS2.branch ?? ""}
                onChange={(e) =>
                  setNewS2((p) => ({ ...p, branch: e.target.value }))
                }
                placeholder="Lagos Head Office"
              />
              <div className="grid grid-cols-2 gap-5">
                <DeloitteSelect
                  label="Vendor Source Node"
                  value={newS2.source}
                  onChange={(e) =>
                    setNewS2((p) => ({
                      ...p,
                      source: e.target.value as "grid" | "private",
                    }))
                  }
                  options={[
                    { label: "National Grid Output", value: "grid" },
                    { label: "Private Microgrid", value: "private" },
                  ]}
                />
                <DeloitteInput
                  label="Monthly Draw (kWh)"
                  type="number"
                  value={newS2.kwhPerMonth || ""}
                  onChange={(e) =>
                    setNewS2((p) => ({
                      ...p,
                      kwhPerMonth: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex bg-[#f4f4f4] border-t border-[#e0e0e0]">
              <button
                onClick={() => setS2Modal(false)}
                className="flex-1 py-4 text-[#161616] text-[14px] hover:bg-[#e5e5e5] font-medium transition-colors border-r border-[#e0e0e0]"
              >
                Cancel
              </button>
              <button
                disabled={!newS2.branch}
                onClick={handleAddS2}
                className="flex-1 py-4 text-white text-[14px] bg-[#86bc25] hover:bg-[#70a31d] disabled:bg-[#c6c6c6] disabled:text-[#8d8d8d] font-medium transition-colors"
              >
                Commit Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {s3Modal && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center bg-[#161616]/70 pt-[10vh] px-4">
          <div className="bg-white w-full max-w-175 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="px-6 py-5 border-b border-[#e0e0e0] flex items-center justify-between bg-[#f4f4f4] sticky top-0 z-10">
              <h3 className="text-[18px] font-normal text-[#161616]">
                Define Scope 3 PCAF Logic
              </h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-5">
                <DeloitteInput
                  label="Counterparty Title"
                  value={newP.counterparty ?? ""}
                  onChange={(e) =>
                    setNewP((p) => ({ ...p, counterparty: e.target.value }))
                  }
                />
                <DeloitteSelect
                  label="Asset Format Protocol"
                  value={newP.assetClass}
                  onChange={(e) =>
                    setNewP((p) => ({ ...p, assetClass: e.target.value }))
                  }
                  options={ASSET_CLASSES.map((ac) => ({
                    label: ac,
                    value: ac,
                  }))}
                />
              </div>
              <DeloitteSelect
                label="Macro-Economic Segment"
                value={newP.sector}
                onChange={(e) =>
                  setNewP((p) => ({ ...p, sector: e.target.value }))
                }
                options={MRIO_SECTORS.map((s) => ({ label: s, value: s }))}
              />
              <div className="grid grid-cols-2 gap-5 pt-2 border-t border-[#e0e0e0]">
                <DeloitteInput
                  label="Enterprise Holding ($M)"
                  type="number"
                  value={newP.exposure || ""}
                  onChange={(e) =>
                    setNewP((p) => ({
                      ...p,
                      exposure: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <DeloitteInput
                  label="Market Apportioned Denominator ($M)"
                  type="number"
                  value={newP.denominator || ""}
                  onChange={(e) =>
                    setNewP((p) => ({
                      ...p,
                      denominator: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
            </div>
            <div className="flex bg-[#f4f4f4] border-t border-[#e0e0e0] sticky bottom-0">
              <button
                onClick={() => setS3Modal(false)}
                className="flex-1 py-4 text-[#161616] text-[14px] hover:bg-[#e5e5e5] font-medium transition-colors border-r border-[#e0e0e0]"
              >
                Cancel
              </button>
              <button
                disabled={!newP.counterparty || !newP.exposure}
                onClick={handleAddPortfolio}
                className="flex-1 py-4 text-white text-[14px] bg-[#86bc25] hover:bg-[#70a31d] disabled:bg-[#c6c6c6] disabled:text-[#8d8d8d] font-medium transition-colors"
              >
                Commit Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
