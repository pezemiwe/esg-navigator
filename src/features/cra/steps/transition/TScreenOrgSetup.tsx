import { useState, useCallback, useRef } from "react";
import { useHeroCanvas } from "../../hooks/useHeroCanvas";
import {
  Building2,
  Plus,
  Trash2,
  Upload,
  AlertCircle,
  ChevronDown,
  Info,
  Database,
  ArrowRight,
  Check,
} from "lucide-react";
import { useTransitionRiskStore } from "@/store/transitionRiskStore";
import { useCRADataStore } from "@/store/craStore";
import {
  getSectorList,
  getCountryList,
} from "../../domain/transitionRisk/transitionData";
import type { OrgProfile } from "../../domain/transitionRisk/types";

const ACCENT = "#86BC25";

const CURRENCIES = ["NGN", "USD", "GHS", "KES", "ZAR", "GBP", "EUR"];
const SECTORS = getSectorList();
const COUNTRIES = getCountryList();

function InfoTip({ text }: { text: string }) {
  return (
    <span className="relative inline-block ml-1 group cursor-help align-middle">
      <Info
        size={10}
        className="text-[#BBBBBB] group-hover:text-[#86BC25] transition-colors"
      />
      <span className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-56 bg-[#1A1A1A] dark:bg-white text-white dark:text-[#111] text-[11px] leading-snug px-2.5 py-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-normal text-left shadow-xl">
        {text}
      </span>
    </span>
  );
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((line) => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else current += ch;
    }
    values.push(current.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? "";
    });
    return row;
  });
}

const num = (v: unknown) => {
  const n = parseFloat(String(v ?? "0").replace(/[,\s]/g, ""));
  return isNaN(n) ? 0 : n;
};
const bool = (v: unknown) => {
  const s = String(v ?? "").toLowerCase();
  return s === "true" || s === "1" || s === "yes";
};

const EMPTY_ORG: OrgProfile = {
  id: "",
  orgName: "",
  sector: SECTORS[0],
  country: "Nigeria",
  currency: "NGN",
  annualRevenueLocal: 0,
  annualOpexLocal: 0,
  totalAssetValueLocal: 0,
  assetRemainingLifeYears: 20,
  revenueCarbonFraction: 0.5,
  lowCarbonRevenueFraction: 0,
  technologyDependency: 0.5,
  internationalCapitalExposure: 0.5,
  isListed: false,
  supplyChainCarbonExposure: 0.5,
  hasTransitionPlan: false,
  disclosureQuality: 0.3,
  currentPdBps: 100,
};

const FIELD_GROUPS = [
  {
    label: "Identity",
    fields: [
      { key: "orgName", label: "Organisation Name", type: "text" },
      { key: "sector", label: "Sector", type: "select", options: SECTORS },
      { key: "country", label: "Country", type: "select", options: COUNTRIES },
      {
        key: "currency",
        label: "Currency",
        type: "select",
        options: CURRENCIES,
      },
    ],
  },
  {
    label: "Financials",
    fields: [
      {
        key: "annualRevenueLocal",
        label: "Annual Revenue",
        type: "number",
        tip: "Total revenue in local currency",
      },
      {
        key: "annualOpexLocal",
        label: "Annual OPEX",
        type: "number",
        tip: "Total operating expenditure",
      },
      {
        key: "totalAssetValueLocal",
        label: "Total Asset Value",
        type: "number",
        tip: "Book value of all fixed assets",
      },
      {
        key: "assetRemainingLifeYears",
        label: "Asset Remaining Life (yrs)",
        type: "number",
      },
      {
        key: "currentPdBps",
        label: "Current PD (bps)",
        type: "number",
        tip: "Probability of default in basis points",
      },
    ],
  },
  {
    label: "Carbon Profile",
    fields: [
      {
        key: "revenueCarbonFraction",
        label: "Revenue Carbon Fraction",
        type: "slider",
        tip: "% of revenue tied to carbon-intensive activities",
      },
      {
        key: "lowCarbonRevenueFraction",
        label: "Low-Carbon Revenue %",
        type: "slider",
        tip: "% of revenue from green/clean products",
      },
      {
        key: "technologyDependency",
        label: "Technology Dependency",
        type: "slider",
        tip: "Reliance on fossil-based technology (0–1)",
      },
      {
        key: "supplyChainCarbonExposure",
        label: "Supply Chain Carbon Exposure",
        type: "slider",
        tip: "Carbon intensity of supply chain (0–1)",
      },
    ],
  },
  {
    label: "Market & Governance",
    fields: [
      {
        key: "internationalCapitalExposure",
        label: "Intl Capital Exposure",
        type: "slider",
        tip: "Exposure to international ESG-sensitive capital",
      },
      {
        key: "disclosureQuality",
        label: "Disclosure Quality",
        type: "slider",
        tip: "Quality of climate disclosure (0=poor, 1=excellent)",
      },
      { key: "isListed", label: "Publicly Listed", type: "boolean" },
      {
        key: "hasTransitionPlan",
        label: "Has Transition Plan",
        type: "boolean",
      },
    ],
  },
] as const;

type FieldDef = (typeof FIELD_GROUPS)[number]["fields"][number];

const fmtCompact = (v: number) =>
  v >= 1e9
    ? `${(v / 1e9).toFixed(1)}B`
    : v >= 1e6
      ? `${(v / 1e6).toFixed(1)}M`
      : v >= 1e3
        ? `${(v / 1e3).toFixed(0)}K`
        : String(v);

export default function TScreenOrgSetup() {
  const canvasRef = useHeroCanvas("transition");
  const {
    config,
    setConfig,
    organisations,
    setOrganisations,
    addOrganisation,
    removeOrganisation,
    setActiveStep,
  } = useTransitionRiskStore();
  const { assets: craAssets, companyProfile: craCompanyProfile } =
    useCRADataStore();

  const [editOrg, setEditOrg] = useState<OrgProfile>(() => {
    // Pre-fill from company profile if available
    const base = { ...EMPTY_ORG, id: `org_${Date.now()}` };
    if (craCompanyProfile.orgName) base.orgName = craCompanyProfile.orgName;
    if (craCompanyProfile.country) base.country = craCompanyProfile.country;
    if (
      craCompanyProfile.currency &&
      CURRENCIES.includes(craCompanyProfile.currency)
    )
      base.currency = craCompanyProfile.currency;
    if (craCompanyProfile.industry) {
      const match = SECTORS.find(
        (s) => s.toLowerCase() === craCompanyProfile.industry.toLowerCase(),
      );
      if (match) base.sector = match;
    }
    if (craCompanyProfile.totalAssets)
      base.totalAssetValueLocal =
        Number(craCompanyProfile.totalAssets.replace(/[,\s]/g, "")) || 0;
    return base;
  });
  const [showForm, setShowForm] = useState(organisations.length === 0);
  const [parseError, setParseError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [craImported, setCraImported] = useState(false);
  const [showCRAModal, setShowCRAModal] = useState(false);
  const [selectedCRATypes, setSelectedCRATypes] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const hasCRAData = Object.values(craAssets).some((d) => d.data.length > 0);

  const configDone = !!(config.assessorName && config.reportDate);
  const dataDone = organisations.length > 0;
  const RAIL_STEPS = [
    { num: "01", label: "Configuration", done: configDone },
    { num: "02", label: "Data Source", done: dataDone },
    { num: "03", label: "Review Portfolio", done: dataDone },
  ];
  const completedCount = RAIL_STEPS.filter((s) => s.done).length;
  const progressPct = (completedCount / RAIL_STEPS.length) * 100;

  const importFromCRAData = useCallback(
    (types?: string[]) => {
      const byBorrower: Record<string, OrgProfile> = {};
      let idx = 0;
      Object.entries(craAssets).forEach(([assetType, typeData]) => {
        if (!typeData.data.length) return;
        if (types && types.length > 0 && !types.includes(assetType)) return;
        typeData.data.forEach((asset) => {
          const key =
            (asset.borrowerName as string) ||
            (asset.id as string) ||
            `borrower_${idx}`;
          if (!byBorrower[key]) {
            const currency = (
              (asset.currency as string) || "NGN"
            ).toUpperCase();
            byBorrower[key] = {
              id: `cra_${idx}`,
              orgName: (asset.borrowerName as string) || `Borrower ${idx + 1}`,
              sector: (asset.sector as string) || SECTORS[0],
              country:
                (asset.country as string) ||
                (asset.region as string) ||
                "Ghana",
              currency: CURRENCIES.includes(currency) ? currency : "GHS",
              annualRevenueLocal: 0,
              annualOpexLocal: 0,
              totalAssetValueLocal: Number(asset.outstandingBalance) || 0,
              assetRemainingLifeYears: 20,
              revenueCarbonFraction: 0.5,
              lowCarbonRevenueFraction: 0,
              technologyDependency: 0.5,
              internationalCapitalExposure: 0.3,
              isListed: false,
              supplyChainCarbonExposure: 0.4,
              hasTransitionPlan: false,
              disclosureQuality: 0.3,
              currentPdBps: 100,
            };
            idx++;
          } else {
            byBorrower[key].totalAssetValueLocal +=
              Number(asset.outstandingBalance) || 0;
          }
        });
      });
      const orgs = Object.values(byBorrower);
      if (!orgs.length) return;
      setOrganisations(orgs);
      setCraImported(true);
      setShowForm(false);
    },
    [craAssets, setOrganisations],
  );

  const handleCSVUpload = useCallback(
    (file: File) => {
      setParseError("");
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const rows = parseCSV(text);
          if (!rows.length) {
            setParseError("Empty CSV or invalid format");
            return;
          }
          const mapped: OrgProfile[] = rows.map((r, i) => ({
            id: `csv_org_${i}`,
            orgName: r.org_name || r.orgName || r.name || `Org ${i + 1}`,
            sector: r.sector || SECTORS[0],
            country: r.country || "Nigeria",
            currency: r.currency || "NGN",
            annualRevenueLocal: num(
              r.annual_revenue_local || r.annualRevenueLocal,
            ),
            annualOpexLocal: num(r.annual_opex_local || r.annualOpexLocal),
            totalAssetValueLocal: num(
              r.total_asset_value_local || r.totalAssetValueLocal,
            ),
            assetRemainingLifeYears:
              num(r.asset_remaining_life_years || r.assetRemainingLifeYears) ||
              20,
            revenueCarbonFraction: num(
              r.revenue_carbon_fraction || r.revenueCarbonFraction,
            ),
            lowCarbonRevenueFraction: num(
              r.low_carbon_revenue_fraction || r.lowCarbonRevenueFraction,
            ),
            technologyDependency: num(
              r.technology_dependency || r.technologyDependency,
            ),
            internationalCapitalExposure: num(
              r.international_capital_exposure ||
                r.internationalCapitalExposure,
            ),
            isListed: bool(r.is_listed || r.isListed),
            supplyChainCarbonExposure: num(
              r.supply_chain_carbon_exposure || r.supplyChainCarbonExposure,
            ),
            hasTransitionPlan: bool(
              r.has_transition_plan || r.hasTransitionPlan,
            ),
            disclosureQuality: num(r.disclosure_quality || r.disclosureQuality),
            currentPdBps: num(r.current_pd_bps || r.currentPdBps) || 100,
          }));
          setOrganisations(mapped);
          setShowForm(false);
        } catch {
          setParseError("Failed to parse CSV file");
        }
      };
      reader.readAsText(file);
    },
    [setOrganisations],
  );

  const addCurrent = () => {
    if (!editOrg.orgName.trim()) return;
    addOrganisation({ ...editOrg });
    setEditOrg({ ...EMPTY_ORG, id: `org_${Date.now()}` });
    setShowForm(false);
  };

  const renderField = (f: FieldDef) => {
    const key = f.key as keyof OrgProfile;
    const val = editOrg[key];

    if (f.type === "select") {
      return (
        <div key={f.key} className="space-y-1">
          <label
            className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#666] dark:text-[#888]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {f.label}
          </label>
          <div className="relative">
            <select
              value={String(val)}
              onChange={(e) =>
                setEditOrg({ ...editOrg, [key]: e.target.value })
              }
              className="w-full h-10 px-3 pr-8 bg-[#F7F7F6] dark:bg-white/[0.04] border border-[#E5E5E3] dark:border-white/[0.08] text-[13px] text-[#333] dark:text-[#DDD] appearance-none rounded-lg focus:outline-none focus:ring-1 focus:ring-[#86BC25]"
            >
              {(f as { options?: string[] }).options?.map((o: string) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <ChevronDown
              size={12}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none"
            />
          </div>
        </div>
      );
    }
    if (f.type === "boolean") {
      return (
        <div key={f.key} className="flex items-center justify-between py-2">
          <span className="text-[12px] text-[#555] dark:text-[#AAA]">
            {f.label}
          </span>
          <button
            onClick={() => setEditOrg({ ...editOrg, [key]: !val })}
            className={`w-10 h-5 rounded-full transition-colors relative ${val ? "bg-[#86BC25]" : "bg-[#D1D5DB] dark:bg-white/10"}`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${val ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      );
    }
    if (f.type === "slider") {
      const v = Number(val) || 0;
      return (
        <div key={f.key} className="space-y-1">
          <div className="flex items-center justify-between">
            <label
              className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#666] dark:text-[#888]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {f.label}
              {"tip" in f && <InfoTip text={f.tip as string} />}
            </label>
            <span
              className="text-[12px] font-semibold text-[#86BC25]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {(v * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={v}
            onChange={(e) =>
              setEditOrg({ ...editOrg, [key]: parseFloat(e.target.value) })
            }
            className="w-full h-1.5 bg-[#E5E5E3] dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-[#86BC25]"
          />
        </div>
      );
    }
    if (f.type === "number") {
      return (
        <div key={f.key} className="space-y-1">
          <label
            className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#666] dark:text-[#888]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {f.label}
            {"tip" in f && <InfoTip text={f.tip as string} />}
          </label>
          <input
            type="text"
            value={val === 0 ? "" : String(val)}
            placeholder="0"
            onChange={(e) => {
              const c = e.target.value.replace(/[^0-9.]/g, "");
              setEditOrg({ ...editOrg, [key]: parseFloat(c) || 0 });
            }}
            className="w-full h-10 px-3 bg-[#F7F7F6] dark:bg-white/[0.04] border border-[#E5E5E3] dark:border-white/[0.08] text-[13px] text-[#333] dark:text-[#DDD] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#86BC25]"
          />
        </div>
      );
    }
    return (
      <div key={f.key} className="space-y-1">
        <label
          className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#666] dark:text-[#888]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {f.label}
        </label>
        <input
          type="text"
          value={String(val)}
          onChange={(e) => setEditOrg({ ...editOrg, [key]: e.target.value })}
          className="w-full h-10 px-3 bg-[#F7F7F6] dark:bg-white/[0.04] border border-[#E5E5E3] dark:border-white/[0.08] text-[13px] text-[#333] dark:text-[#DDD] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#86BC25]"
        />
      </div>
    );
  };

  void ACCENT; // suppress unused var warning

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-140px)] relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{ position: "fixed", top: 0, left: 0 }}
      />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="relative z-10 overflow-hidden bg-[#1A3C21] dark:bg-[#0F1F13]">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 41px)",
            }}
          />
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20"
            style={{
              background:
                "radial-gradient(circle, #86BC25 0%, transparent 70%)",
            }}
          />
          <div className="relative px-6 md:px-10 py-6 md:py-8">
            <div className="max-w-300 mx-auto flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-7 h-7 rounded-lg bg-[#86BC25] flex items-center justify-center">
                    <Building2 size={13} className="text-white" />
                  </div>
                  <span
                    className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Step 01 of 05 &mdash; Organisation Profile
                  </span>
                </div>
                <h1 className="text-[22px] md:text-[26px] font-bold text-white leading-[1.15] tracking-tight mb-1.5">
                  Organisation Portfolio Setup
                </h1>
                <p className="text-[13px] text-white/60 leading-relaxed max-w-100">
                  Add organisations manually, upload a CSV, or import from your
                  CRA portfolio data.
                </p>
              </div>
              <div className="flex items-center gap-5 shrink-0">
                <div className="text-right">
                  <div
                    className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/40 mb-1"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Organisations
                  </div>
                  <div className="text-[30px] font-bold text-white leading-none">
                    {organisations.length}
                  </div>
                </div>
                <svg
                  viewBox="0 0 40 40"
                  className="w-14 h-14 -rotate-90"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(134,188,37,0.3))",
                  }}
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="3"
                  />
                  <circle
                    cx="20"
                    cy="20"
                    r="16"
                    fill="none"
                    stroke="#86BC25"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 16}`}
                    strokeDashoffset={`${2 * Math.PI * 16 * (1 - progressPct / 100)}`}
                    style={{
                      transition:
                        "stroke-dashoffset 0.6s cubic-bezier(0.34,1.56,0.64,1)",
                    }}
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="h-0.5 bg-white/10">
            <div
              className="h-full bg-[#86BC25] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="relative z-10 flex-1 flex">
          <div className="hidden lg:flex flex-col w-75 shrink-0 border-r border-[#D8D8D8] dark:border-white/[0.07] bg-white dark:bg-[#111]">
            <div className="px-6 py-7 border-b border-[#EBEBEB] dark:border-white/[0.06]">
              <div
                className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#86BC25] mb-3"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Step 01 / 05
              </div>
              <h2 className="text-[16px] font-semibold text-[#111] dark:text-[#F0F0F0] leading-tight tracking-tight mb-1">
                Organisation Profile
              </h2>
              <p className="text-[13px] text-[#888] dark:text-[#666] leading-relaxed">
                Define the organisations in your transition risk portfolio.
              </p>
            </div>
            <div className="px-6 py-5 border-b border-[#EBEBEB] dark:border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] uppercase tracking-[0.12em] text-[#AAA]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Completion
                </span>
                <span
                  className="text-[11px] font-bold text-[#86BC25]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {completedCount}/{RAIL_STEPS.length}
                </span>
              </div>
              <div className="h-0.5 bg-[#F0F0EE] dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#86BC25] rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
            <div className="px-6 py-5 flex-1 overflow-y-auto">
              <div className="space-y-0.5 mb-6">
                {RAIL_STEPS.map((step, i) => {
                  const active = !step.done && completedCount === i;
                  return (
                    <div
                      key={step.num}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${active ? "bg-[#F3F9E8] dark:bg-[#86BC25]/[0.06]" : ""}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all duration-300 ${step.done ? "bg-[#86BC25]" : active ? "bg-[#86BC25]/10 border-[1.5px] border-[#86BC25]" : "bg-[#F4F4F2] dark:bg-white/[0.04] border border-[#E2E2E0] dark:border-white/[0.08]"}`}
                      >
                        {step.done ? (
                          <Check
                            size={11}
                            className="text-white"
                            strokeWidth={3}
                          />
                        ) : (
                          <span
                            className={`text-[9px] font-bold ${active ? "text-[#86BC25]" : "text-[#C0C0BE] dark:text-[#555]"}`}
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {step.num}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-[14px] transition-colors duration-200 ${step.done ? "text-[#86BC25] font-semibold" : active ? "text-[#1A1A1A] dark:text-[#EEE] font-semibold" : "text-[#A0A09E] dark:text-[#555]"}`}
                      >
                        {step.label}
                      </span>
                      {active && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#86BC25]" />
                      )}
                    </div>
                  );
                })}
              </div>
              {organisations.length > 0 && (
                <div className="pt-5 border-t border-[#E5E5E5] dark:border-white/[0.06] space-y-4">
                  {[
                    {
                      label: "Organisations",
                      value: String(organisations.length),
                      mono: true,
                    },
                    {
                      label: "Total Assets",
                      value: fmtCompact(
                        organisations.reduce(
                          (s, o) => s + o.totalAssetValueLocal,
                          0,
                        ),
                      ),
                      green: true,
                    },
                    {
                      label: "With Trans. Plan",
                      value: String(
                        organisations.filter((o) => o.hasTransitionPlan).length,
                      ),
                      mono: true,
                    },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div
                        className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAA] mb-1"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {stat.label}
                      </div>
                      <div
                        className={`text-[18px] font-semibold leading-none ${stat.green ? "text-[#86BC25]" : "text-[#111] dark:text-[#F0F0F0]"}`}
                        style={
                          stat.mono ? { fontFamily: "var(--font-mono)" } : {}
                        }
                      >
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-5 border-t border-[#E5E5E5] dark:border-white/[0.06] space-y-3">
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#AAA] block"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Assessment Config
                </span>
                {[
                  {
                    label: "Assessor Name",
                    type: "text",
                    value: config.assessorName,
                    onChange: (v: string) => setConfig({ assessorName: v }),
                    placeholder: "Your name",
                  },
                  {
                    label: "USD Rate",
                    type: "number",
                    value: String(config.usdRate),
                    onChange: (v: string) =>
                      setConfig({ usdRate: parseFloat(v) || 1 }),
                    placeholder: "1500",
                  },
                  {
                    label: "Report Date",
                    type: "date",
                    value: config.reportDate,
                    onChange: (v: string) => setConfig({ reportDate: v }),
                    placeholder: "",
                  },
                ].map((f) => (
                  <div key={f.label} className="space-y-1">
                    <label
                      className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#666] dark:text-[#888]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      value={f.value}
                      placeholder={f.placeholder}
                      onChange={(e) => f.onChange(e.target.value)}
                      className="w-full h-8 px-2.5 bg-[#F7F7F6] dark:bg-white/[0.04] border border-[#E5E5E3] dark:border-white/[0.08] text-[12px] text-[#333] dark:text-[#DDD] rounded-md focus:outline-none focus:ring-1 focus:ring-[#86BC25]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex-1 px-6 md:px-10 xl:pr-16 py-8 overflow-y-auto">
            <div className="max-w-205 space-y-6">
              <h2 className="text-[20px] font-semibold text-[#111] dark:text-[#F0F0F0] tracking-tight">
                Add your organisation portfolio
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${isDragging ? "border-[#86BC25] bg-[#86BC25]/5" : "border-[#E5E5E3] dark:border-white/10 hover:border-[#86BC25]/50 bg-white dark:bg-white/[0.02]"}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const f = e.dataTransfer.files[0];
                    if (f) handleCSVUpload(f);
                  }}
                >
                  <Upload size={24} className="mx-auto mb-2 text-[#86BC25]" />
                  <p className="text-[13px] font-semibold text-[#333] dark:text-[#DDD]">
                    Upload CSV
                  </p>
                  <p className="text-[11px] text-[#999] mt-1">
                    Drag & drop or click to browse
                  </p>
                  <a
                    href="/templates/sample_organisations.csv"
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 block text-[11px] text-[#86BC25] hover:underline"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Download sample template
                  </a>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCSVUpload(f);
                      if (e.target) e.target.value = "";
                    }}
                  />
                </div>
                <div
                  className={`rounded-xl p-5 border transition-all ${hasCRAData ? "border-[#86BC25]/30 bg-[#F3F9E8] dark:bg-[#86BC25]/[0.05]" : "border-[#E5E5E3] dark:border-white/10 bg-[#F7F7F6] dark:bg-white/[0.02] opacity-60"}`}
                >
                  <Database
                    size={24}
                    className={`mb-2 ${hasCRAData ? "text-[#86BC25]" : "text-[#BBB]"}`}
                  />
                  <p className="text-[13px] font-semibold text-[#333] dark:text-[#DDD]">
                    Import from CRA Portfolio
                  </p>
                  <p className="text-[11px] text-[#999] mt-1 mb-3">
                    {hasCRAData
                      ? "Use borrowers from your uploaded CRA portfolio data"
                      : "Upload portfolio data in the CRA Data module first"}
                  </p>
                  {hasCRAData ? (
                    <button
                      onClick={() => setShowCRAModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#86BC25] text-white text-[11px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] transition-colors"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <Database size={12} />
                      {craImported
                        ? "Re-import CRA Data"
                        : "Import from CRA Portfolio"}
                    </button>
                  ) : (
                    <span
                      className="text-[11px] text-[#BBB]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      No CRA data uploaded
                    </span>
                  )}
                </div>
              </div>

              {parseError && (
                <div className="flex items-center gap-1.5 text-[11px] text-red-500">
                  <AlertCircle size={12} /> {parseError}
                </div>
              )}
              {organisations.length > 0 && !showForm && (
                <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#E5E5E3] dark:border-white/[0.06] flex items-center justify-between">
                    <h3 className="text-[14px] font-semibold text-[#333] dark:text-[#DDD]">
                      Organisations ({organisations.length})
                    </h3>
                    <button
                      onClick={() => setShowForm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#86BC25] text-white text-[11px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] transition-colors"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="bg-[#F7F7F6] dark:bg-white/[0.02]">
                          {[
                            "Name",
                            "Sector",
                            "Country",
                            "Revenue",
                            "Assets",
                            "Carbon %",
                            "Disclosure",
                            "",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-2.5 text-left font-semibold uppercase tracking-[0.08em] text-[#888]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {organisations.map((org) => (
                          <tr
                            key={org.id}
                            className="border-t border-[#F0F0EE] dark:border-white/[0.04] hover:bg-[#FAFAF9] dark:hover:bg-white/[0.02]"
                          >
                            <td className="px-4 py-3 font-medium text-[#333] dark:text-[#DDD]">
                              {org.orgName}
                            </td>
                            <td className="px-4 py-3 text-[#666] dark:text-[#AAA]">
                              {org.sector}
                            </td>
                            <td className="px-4 py-3 text-[#666] dark:text-[#AAA]">
                              {org.country}
                            </td>
                            <td
                              className="px-4 py-3 text-[#666] dark:text-[#AAA]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {fmtCompact(org.annualRevenueLocal)}
                            </td>
                            <td
                              className="px-4 py-3 text-[#666] dark:text-[#AAA]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {fmtCompact(org.totalAssetValueLocal)}
                            </td>
                            <td
                              className="px-4 py-3 text-[#666] dark:text-[#AAA]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {(org.revenueCarbonFraction * 100).toFixed(0)}%
                            </td>
                            <td
                              className="px-4 py-3 text-[#666] dark:text-[#AAA]"
                              style={{ fontFamily: "var(--font-mono)" }}
                            >
                              {(org.disclosureQuality * 100).toFixed(0)}%
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeOrganisation(org.id)}
                                className="text-[#CCC] hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {(showForm || organisations.length === 0) && (
                <div className="bg-white dark:bg-white/[0.03] border border-[#E5E5E3] dark:border-white/[0.06] rounded-2xl p-6">
                  <h3 className="text-[14px] font-semibold text-[#333] dark:text-[#DDD] mb-6">
                    {organisations.length === 0
                      ? "Add Your First Organisation"
                      : "Add Organisation"}
                  </h3>
                  <div className="space-y-8">
                    {FIELD_GROUPS.map((group) => (
                      <div key={group.label}>
                        <h4
                          className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#86BC25] mb-4"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {group.label}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.fields.map((f) => renderField(f))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-8 pt-5 border-t border-[#E5E5E3] dark:border-white/[0.06]">
                    <button
                      onClick={addCurrent}
                      disabled={!editOrg.orgName.trim()}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] disabled:opacity-40 transition-colors"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      <Plus size={13} /> Add Organisation
                    </button>
                    {organisations.length > 0 && (
                      <button
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2.5 text-[12px] text-[#888] hover:text-[#333] dark:hover:text-[#DDD] transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
              {organisations.length > 0 && !showForm && (
                <div className="bg-[#F3F9E8] dark:bg-[#86BC25]/[0.06] border border-[#86BC25]/30 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#86BC25] mb-1"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Portfolio ready &mdash; {organisations.length}{" "}
                      organisation{organisations.length !== 1 ? "s" : ""} added
                    </p>
                    <p className="text-[13px] text-[#555] dark:text-[#AAA]">
                      Proceed to configure your NGFS scenarios and time
                      horizons.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveStep(1)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#86BC25] text-white text-[12px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] transition-colors shrink-0"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Scenario Configuration
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CRA Import Selection Modal */}
      {showCRAModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-lg shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-[#E0E0E0] dark:border-[#333]">
            <div className="px-5 py-4 border-b border-[#E0E0E0] dark:border-[#333]">
              <h3
                className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[#333] dark:text-white"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Select Asset Types to Import
              </h3>
              <p className="text-[11px] text-[#888] mt-1">
                Choose which CRA asset types to import as organisations
              </p>
            </div>
            <div className="px-5 py-3 max-h-[320px] overflow-y-auto">
              {Object.entries(craAssets)
                .filter(([, d]) => d.data.length > 0)
                .map(([key, d]) => {
                  const label =
                    key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase()) || key;
                  const checked = selectedCRATypes.includes(key);
                  return (
                    <label
                      key={key}
                      className="flex items-center gap-3 py-2.5 px-2 rounded hover:bg-[#F5F5F5] dark:hover:bg-[#2A2A2A] cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setSelectedCRATypes((prev) =>
                            checked
                              ? prev.filter((t) => t !== key)
                              : [...prev, key],
                          )
                        }
                        className="w-4 h-4 accent-[#86BC25] rounded"
                      />
                      <span className="flex-1 text-[12px] text-[#333] dark:text-[#CCC]">
                        {label}
                      </span>
                      <span className="text-[11px] text-[#999] font-mono">
                        {d.data.length} record{d.data.length !== 1 ? "s" : ""}
                      </span>
                    </label>
                  );
                })}
            </div>
            <div className="px-5 py-3 border-t border-[#E0E0E0] dark:border-[#333] flex items-center justify-between gap-2">
              <button
                onClick={() => {
                  const allKeys = Object.entries(craAssets)
                    .filter(([, d]) => d.data.length > 0)
                    .map(([k]) => k);
                  setSelectedCRATypes((prev) =>
                    prev.length === allKeys.length ? [] : allKeys,
                  );
                }}
                className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#86BC25] hover:underline"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {selectedCRATypes.length ===
                Object.entries(craAssets).filter(([, d]) => d.data.length > 0)
                  .length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCRAModal(false);
                    setSelectedCRATypes([]);
                  }}
                  className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#666] hover:text-[#333] dark:text-[#999] dark:hover:text-white transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    importFromCRAData(selectedCRATypes);
                    setShowCRAModal(false);
                    setSelectedCRATypes([]);
                  }}
                  disabled={selectedCRATypes.length === 0}
                  className="px-4 py-2 bg-[#86BC25] text-white text-[11px] font-semibold uppercase tracking-[0.08em] hover:bg-[#78AA1F] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Import Selected
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
