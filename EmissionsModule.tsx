import { useState, useMemo, useRef } from "react";
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
} from "lucide-react";
import { useSustainabilityStore } from "@/store/sustainabilityStore";
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

/* ──────────────────────────────────────────────────
   GHG ROUTING ENGINE (Unchanged Logic)
────────────────────────────────────────────────── */
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
        ▼
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
  const fileRef = useRef<HTMLInputElement>(null);

  const [portfolioAssets, setPortfolioAssets] = useState<PortfolioAsset[]>([]);

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
      {/* Deloitte UI Global Header */}
      <header className="bg-white border-b border-[#e0e0e0] px-6 py-4 flex items-center justify-between sticky top-0 z-10 w-full shadow-sm">
        <div>
          <h1 className="text-[18px] font-semibold text-[#161616] m-0 leading-none">
            Carbon Emissions & Reporting Workspace
          </h1>
          <p className="text-[12px] text-[#525252] mt-1">
            Audit-ready accounting following GHG Protocol and PCAF.
          </p>
        </div>
        <div className="flex items-center divide-x divide-[#e0e0e0]">
          <div className="px-6 text-right">
            <p className="text-[12px] text-[#525252] uppercase font-medium">
              Financed (Cat 15)
            </p>
            <p className="text-[16px] font-semibold text-[#161616] mt-0.5">
              {formatNumber(financedTotal)}{" "}
              <span className="text-[12px] font-normal text-[#525252]">
                tCO₂e
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
                tCO₂e
              </span>
            </p>
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
                            Total Impact (tCO₂e)
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
                            Total Impact (tCO₂e)
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
                <div className="bg-white border border-[#e0e0e0] flex items-center justify-between px-6 py-6 mb-6">
                  <div>
                    <h2 className="text-[20px] font-normal text-[#161616]">
                      PCAF Financed Modules (Scope 3)
                    </h2>
                    <p className="text-[14px] text-[#525252] mt-1">
                      Process and normalize lending, debt, and equity records
                      via standard parsing logic.
                    </p>
                  </div>
                  <button
                    onClick={() => setS3Modal(true)}
                    className="px-4 py-3 bg-[#393939] text-white hover:bg-[#262626] text-[14px] font-medium transition-colors flex items-center gap-2"
                  >
                    Manual Insertion
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Universal CSV Import (Carbon style) */}
                  <div className="bg-white border border-[#e0e0e0] p-6">
                    <h3 className="text-[16px] font-medium text-[#161616] mb-2">
                      Automated CSV Ingestion
                    </h3>
                    <p className="text-[14px] text-[#525252] mb-6">
                      Drag designated portfolio outputs securely onto the
                      landing zone.
                    </p>

                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleCsvUpload(f);
                        e.target.value = "";
                      }}
                    />

                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files[0];
                        if (f) handleCsvUpload(f);
                      }}
                      onClick={() =>
                        !isUploading["scope3"] && fileRef.current?.click()
                      }
                      className={`w-full border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        dragOver
                          ? "border-[#86bc25] bg-[#e5e5e5]"
                          : "border-[#8d8d8d] hover:border-[#86bc25] bg-[#f4f4f4]"
                      } ${isUploading["scope3"] ? "opacity-75 cursor-wait" : ""}`}
                    >
                      {isUploading["scope3"] ? (
                        <>
                          <Loader2 className="w-8 h-8 text-[#86bc25] mb-3 animate-spin stroke-1" />
                          <p className="text-[14px] text-[#161616] font-medium">
                            Synthesizing & Computing PCAF Routing...
                          </p>
                          <p className="text-[12px] text-[#525252] mt-1">
                            This may take a moment
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-[#525252] mb-3 stroke-1" />
                          <p className="text-[14px] text-[#161616] font-medium">
                            Upload File
                          </p>
                          <p className="text-[12px] text-[#525252] mt-1">
                            or drag files into this area
                          </p>
                        </>
                      )}
                    </div>
                    {csvError && (
                      <p className="text-[12px] text-[#da1e28] mt-3 font-medium bg-[#fff1f1] border-l-4 border-[#da1e28] p-2">
                        {csvError}
                      </p>
                    )}
                  </div>

                  {/* Schema Downloads */}
                  <div className="bg-white border border-[#e0e0e0] p-6">
                    <h3 className="text-[16px] font-medium text-[#161616] mb-2">
                      Reference Schema Download
                    </h3>
                    <p className="text-[14px] text-[#525252] mb-6">
                      Obtain structured mapping files aligned with the data
                      engine.
                    </p>
                    <div className="divide-y divide-[#e0e0e0] border border-[#e0e0e0]">
                      {[
                        ["Lending Products Format", "loans_template.csv"],
                        ["Bonds/Debt Securities", "bonds_template.csv"],
                        ["Equity Portfolio Specs", "equities_template.csv"],
                      ].map(([l, f]) => (
                        <div
                          key={l}
                          className="flex justify-between items-center p-4 hover:bg-[#f4f4f4] cursor-pointer transition-colors group"
                          onClick={() => dl(f)}
                        >
                          <span className="text-[14px] text-[#161616] group-hover:text-[#86bc25]">
                            {l}
                          </span>
                          <Download className="w-4 h-4 text-[#525252] group-hover:text-[#86bc25]" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {portfolioResults.length > 0 && (
                  <div className="bg-white border border-[#e0e0e0]">
                    <div className="bg-white px-6 py-5 border-b border-[#e0e0e0] flex justify-between items-center">
                      <h3 className="text-[16px] font-medium text-[#161616]">
                        Consolidated Financed Elements
                      </h3>
                      <span className="bg-[#f4f4f4] px-2 py-1 text-[12px] text-[#525252] border border-[#e0e0e0]">
                        {portfolioResults.length} Items Indexed
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[14px] text-left border-collapse">
                        <thead className="bg-[#f4f4f4] border-b border-[#e0e0e0] text-[#161616] font-semibold">
                          <tr>
                            <th className="px-6 py-3 font-semibold text-[13px]">
                              Entity Identifier
                            </th>
                            <th className="px-6 py-3 font-semibold text-[13px]">
                              Class Type
                            </th>
                            <th className="px-6 py-3 font-semibold text-[13px]">
                              Economic Segment
                            </th>
                            <th className="px-6 py-3 font-semibold text-[13px] text-right">
                              Computed tCO₂e
                            </th>
                            <th className="px-6 py-3 w-12 text-center">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#e0e0e0]">
                          {portfolioResults.map((r) => (
                            <tr key={r.id} className="hover:bg-[#f4f4f4] group">
                              <td className="px-6 py-4 text-[#161616] font-medium">
                                {r.counterparty}
                              </td>
                              <td className="px-6 py-4 text-[#525252]">
                                {r.assetClass}
                              </td>
                              <td className="px-6 py-4 text-[#525252] truncate max-w-62.5">
                                {r.sector}
                              </td>
                              <td className="px-6 py-4 text-[#161616] text-right">
                                {formatNumber(r.financedEmissions)}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => removePortfolioAsset(r.id)}
                                  className="text-[#86bc25] opacity-0 group-hover:opacity-100 hover:text-[#da1e28]"
                                >
                                  <Trash2 className="w-4 h-4 mx-auto" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 4: DASHBOARD / METRICS */}
            {step === 3 && (
              <div className="animate-in fade-in duration-200">
                <div className="mb-6">
                  <h2 className="text-[24px] font-normal text-[#161616] leading-tight">
                    Master KPI Dashboard
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] mb-6">
                  {[
                    { label: "Scope 1 Index", value: s1Total },
                    { label: "Scope 2 Index", value: s2Total },
                    { label: "Financed Scope 3", value: financedTotal },
                    {
                      label: "Enterprise Net Output",
                      value: grandTotal,
                      highlight: true,
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`p-6 flex flex-col justify-between ${stat.highlight ? "bg-[#f4fadc]" : "bg-white"}`}
                    >
                      <p
                        className={`text-[12px] uppercase font-semibold mb-6 tracking-wide ${stat.highlight ? "text-[#86bc25]" : "text-[#525252]"}`}
                      >
                        {stat.label}
                      </p>
                      <div>
                        <p
                          className={`text-[36px] font-light leading-none ${stat.highlight ? "text-[#435e12]" : "text-[#161616]"}`}
                        >
                          {formatNumber(stat.value)}
                        </p>
                        <p
                          className={`text-[12px] mt-1 ${stat.highlight ? "text-[#86bc25]" : "text-[#525252]"}`}
                        >
                          tCO₂e absolute
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {grandTotal > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="col-span-8 bg-white border border-[#e0e0e0] p-6">
                      <h3 className="text-[16px] font-medium text-[#161616] mb-8">
                        Scope Apportionment Histogram
                      </h3>
                      <div className="h-70">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: "Direct (S1)", value: s1Total },
                              { name: "Purchased Energy (S2)", value: s2Total },
                              { name: "Portfolio (S3)", value: financedTotal },
                            ]}
                          >
                            <CartesianGrid
                              strokeDasharray="3 3"
                              vertical={false}
                              stroke="#e0e0e0"
                            />
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: "#525252" }}
                              dy={10}
                            />
                            <YAxis
                              axisLine={false}
                              tickLine={false}
                              tick={{ fontSize: 12, fill: "#525252" }}
                              tickFormatter={(v) => formatNumber(v)}
                              dx={-10}
                            />
                            <Tooltip
                              cursor={{ fill: "#f4f4f4" }}
                              contentStyle={{
                                borderRadius: 0,
                                border: "1px solid #161616",
                                padding: "12px",
                                background: "#161616",
                                color: "#f4f4f4",
                                fontSize: "12px",
                              }}
                              itemStyle={{ color: "#f4f4f4" }}
                            />
                            <Bar dataKey="value" radius={0} barSize={60}>
                              {[0, 1, 2].map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    ["#86bc25", "#86bc25", "#000000"][index]
                                  }
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="col-span-4 bg-white border border-[#e0e0e0] p-6 flex flex-col items-center">
                      <h3 className="text-[16px] font-medium text-[#161616] mb-6 w-full text-left">
                        Data Quality Score (PCAF)
                      </h3>
                      <div className="h-60 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={Object.entries(
                                portfolioResults.reduce(
                                  (acc, r) => {
                                    acc[`DQS ${r.dqs} (${r.option})`] =
                                      (acc[`DQS ${r.dqs} (${r.option})`] || 0) +
                                      r.financedEmissions;
                                    return acc;
                                  },
                                  {} as Record<string, number>,
                                ),
                              ).map(([name, value]) => ({ name, value }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {Object.entries(portfolioResults).map(
                                (_, idx) => (
                                  <Cell
                                    key={idx}
                                    fill={
                                      [
                                        "#86bc25",
                                        "#000000",
                                        "#525252",
                                        "#8d8d8d",
                                        "#c6c6c6",
                                      ][idx % 5]
                                    }
                                    strokeWidth={0}
                                  />
                                ),
                              )}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                borderRadius: 0,
                                border: "none",
                                background: "#161616",
                                color: "#f4f4f4",
                                fontSize: "12px",
                              }}
                              itemStyle={{ color: "#f4f4f4" }}
                              formatter={(val: number | undefined) =>
                                formatNumber(val ?? 0)
                              }
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    {/* Add sector breakdown analytics */}
                    {portfolioResults.length > 0 && (
                      <div className="col-span-12 bg-white border border-[#e0e0e0] p-6 mt-6">
                        <h3 className="text-[16px] font-medium text-[#161616] mb-8">
                          Financed Emissions by Sector
                        </h3>
                        <div className="h-75">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={Object.entries(
                                portfolioResults.reduce(
                                  (acc, r) => {
                                    acc[r.sector] =
                                      (acc[r.sector] || 0) +
                                      r.financedEmissions;
                                    return acc;
                                  },
                                  {} as Record<string, number>,
                                ),
                              )
                                .map(([sector, val]) => ({
                                  name: sector,
                                  value: val,
                                }))
                                .sort((a, b) => b.value - a.value)
                                .slice(0, 10)}
                              layout="vertical"
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
                              />
                              <YAxis
                                dataKey="name"
                                type="category"
                                width={150}
                                tick={{ fontSize: 11 }}
                              />
                              <Tooltip
                                cursor={{ fill: "#f4f4f4" }}
                                formatter={(val: number | undefined) =>
                                  formatNumber(val ?? 0)
                                }
                                contentStyle={{
                                  borderRadius: 0,
                                  background: "#161616",
                                  color: "#f4f4f4",
                                }}
                              />
                              <Bar
                                dataKey="value"
                                fill="#86bc25"
                                barSize={20}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Persistent Footer Navigation */}
          <div className="fixed bottom-0 right-0 bg-[#f4f4f4] border-t border-[#e0e0e0] w-[calc(100%-256px)] p-4 flex justify-between z-20">
            <button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className="px-5 py-3 text-[14px] text-[#161616] bg-transparent hover:bg-[#e5e5e5] border border-transparent disabled:opacity-30 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 text-[14px] text-white bg-[#86bc25] hover:bg-[#70a31d] flex items-center gap-3 transition-colors rounded-none"
              >
                Proceed Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/sustainability/report")}
                className="px-6 py-3 text-[14px] text-white bg-[#161616] hover:bg-[#393939] flex items-center gap-3 transition-colors rounded-none"
              >
                Finalize & Generate Report <FileText className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>
      </div>

      {/* ──────────────── MODALS (CARBON STYLE) ──────────────── */}

      {s1Modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#161616]/70 pt-[10vh] px-4">
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#161616]/70 pt-[10vh] px-4">
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
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#161616]/70 pt-[10vh] px-4">
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
