import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Save,
  AlertTriangle,
  TrendingUp,
  Plus,
  X,
  Info,
} from "lucide-react";
import { useSustainabilityStore, type Phase4Entry } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";

// ─── SASB Taxonomy ────────────────────────────────────────────────────────────
const SASB_DATA: Record<string, Record<string, string[]>> = {
  "Consumer Goods": {
    "Apparel, Accessories & Footwear": [
      "GHG Emissions — Scope 1 & 2", "Energy Management", "Water & Wastewater Management",
      "Raw Materials Sourcing & Traceability", "Labor Conditions in the Supply Chain",
      "Child & Forced Labor", "Product Lifecycle Management", "Packaging Sustainability",
    ],
    "Household & Personal Products": [
      "GHG Emissions", "Energy Management", "Water Management",
      "Packaging Lifecycle Management", "Product Safety & Ingredient Transparency",
      "Chemicals of Concern", "Supply Chain Management",
    ],
    "Multiline & Specialty Retailers": [
      "Energy Management", "Data Security", "Labor Practices",
      "Supply Chain Management", "Product Sourcing & Traceability",
    ],
    "Toys & Sporting Goods": [
      "Chemical Hazards in Products", "Product Safety", "Packaging", "Labor Conditions",
    ],
  },
  "Extractives & Minerals Processing": {
    "Coal Operations": [
      "GHG Emissions", "Air Quality", "Water Management",
      "Mine Safety", "Ecological Impacts", "Community Relations & Land Acquisition",
    ],
    "Iron & Steel Producers": [
      "GHG Emissions", "Air Quality", "Energy Management", "Water Management",
      "Waste & Hazardous Materials Management",
    ],
    "Metals & Mining": [
      "GHG Emissions", "Air Quality", "Energy Management", "Water Management",
      "Waste & Hazardous Materials Management", "Community Rights & Relations",
    ],
    "Oil & Gas — Exploration & Production": [
      "GHG Emissions", "Air Quality", "Water Management",
      "Biodiversity Impacts", "Community Relations", "Safety Management",
    ],
    "Oil & Gas — Midstream": [
      "GHG Emissions", "Air Quality", "Ecological Impacts", "Safety & Emergency Management",
    ],
    "Oil & Gas — Refining & Marketing": [
      "GHG Emissions", "Air Quality", "Water Management", "Product Design & Lifecycle Management",
    ],
  },
  "Financials": {
    "Asset Management & Custody Activities": [
      "Transparent Information & Fair Advice",
      "Incorporation of ESG Factors in Investment Management",
      "Financed Emissions", "Business Ethics & Transparency",
    ],
    "Commercial Banks": [
      "Financed Emissions", "Financial Inclusion & Capacity Building",
      "Data Security", "Business Ethics", "Customer Privacy",
    ],
    "Consumer Finance": [
      "Customer Privacy", "Data Security", "Selling Practices",
      "Financial Inclusion", "Business Ethics",
    ],
    "Insurance": [
      "Incorporation of ESG Factors in Investment Management",
      "Financed Emissions",
      "Physical Risk Exposure",
      "Transition Risk Exposure",
      "Systemic Risk Management",
      "Data Security & Customer Privacy",
      "Business Ethics & Regulatory Compliance",
      "Transparent Information & Fair Pricing",
      "Climate Risk Integration in Underwriting",
      "ESG Integration in Underwriting",
      "Loss Adjustment & Claims Management",
      "Product Affordability & Access",
    ],
    "Investment Banking & Brokerage": [
      "Financed Emissions", "Transparent Information & Fair Advice",
      "Business Ethics", "Data Security",
    ],
    "Mortgage Finance": [
      "Customer Privacy", "Responsible Lending", "Environmental Risk Exposure",
    ],
  },
  "Food & Beverage": {
    "Agricultural Products": [
      "GHG Emissions", "Water Management", "Land Use & Ecological Impacts",
      "Food Safety", "Ingredient Sourcing & Traceability",
    ],
    "Alcoholic Beverages": [
      "Energy & Water Use", "Wastewater Management", "Responsible Marketing",
    ],
    "Food Retailers & Distributors": [
      "Food Safety", "Product Labeling & Marketing", "Energy Management", "Supply Chain",
    ],
    "Meat, Poultry & Dairy": [
      "GHG Emissions", "Water & Wastewater", "Land Use", "Animal Care",
    ],
    "Non-Alcoholic Beverages": [
      "Energy Management", "Water Management", "Packaging Lifecycle", "Fleet Fuel Management",
    ],
    "Processed Foods": [
      "Product Labeling & Marketing", "Packaging Lifecycle", "Energy Management", "Water Management",
    ],
    "Restaurants": [
      "Energy Management", "Food Safety", "Supply Chain Management", "Labor Practices",
    ],
  },
  "Health Care": {
    "Biotechnology & Pharmaceuticals": [
      "Product Safety & Side Effects", "Drug Safety", "Access to Medicine",
      "Counterfeit Drugs", "Clinical Trial Practices",
    ],
    "Health Care Distributors": [
      "Drug Safety", "Access to Care", "Business Ethics",
    ],
    "Health Care Delivery": [
      "Patient Engagement & Safety", "Environmental Footprint", "Workforce Practices",
    ],
    "Medical Equipment & Supplies": [
      "Product Safety", "Counterfeit Products", "Supply Chain",
    ],
  },
  "Infrastructure": {
    "Electric Utilities & Power Generators": [
      "GHG Emissions", "Air Quality", "Water Management",
      "Coal Ash Management", "Grid Resiliency",
    ],
    "Engineering & Construction Services": [
      "GHG Emissions", "Energy Management", "Worker Health & Safety", "Ecological Impacts",
    ],
    "Real Estate": [
      "Energy Management", "Water Management",
      "Management of Tenant Sustainability Impacts", "Climate Change Adaptation",
    ],
    "Waste Management": [
      "GHG Emissions", "Air Quality", "Fleet Fuel Management", "Workforce Health & Safety",
    ],
    "Water Utilities & Services": [
      "Water Affordability & Access", "Water Source Quality", "Network Resiliency",
    ],
  },
  "Services": {
    "Education": ["Quality of Education", "Business Ethics", "Student Financial Assistance"],
    "Hotels & Lodging": [
      "Energy Management", "Water Management", "Waste Management", "Labor Practices",
    ],
    "Media & Entertainment": [
      "Data Privacy & Freedom of Expression", "Workforce Diversity",
    ],
    "Professional & Commercial Services": [
      "GHG Emissions", "Data Security", "Workforce Diversity & Inclusion",
    ],
    "Tourism & Travel": ["GHG Emissions", "Energy Management", "Labor Practices"],
  },
  "Technology & Communications": {
    "Electronic Manufacturing Services": [
      "Materials Sourcing & Efficiency", "Hazardous Waste Management", "Labor Conditions",
    ],
    "Hardware": ["Energy Management", "Materials Sourcing", "Worker Health & Safety"],
    "Internet Media & Services": [
      "Environmental Footprint", "Data Privacy & Freedom of Expression", "Data Security",
    ],
    "Semiconductors": [
      "Energy Management", "Water Management", "Materials Efficiency & Recycling",
    ],
    "Software & IT Services": [
      "Environmental Footprint of Hardware Infrastructure",
      "Data Privacy & Freedom of Expression", "Data Security",
    ],
    "Telecommunication Services": [
      "Environmental Footprint", "Data Privacy & Freedom of Expression", "Data Security",
    ],
  },
  "Transportation": {
    "Air Freight & Logistics": [
      "GHG Emissions", "Air Quality", "Fuel Economy & Emissions",
    ],
    "Airlines": [
      "Greenhouse Gas Emissions", "Air Quality", "Labour Practices", "Accident & Safety Management",
    ],
    "Automobiles": [
      "Product Safety", "Fuel Economy & Use-phase Emissions", "Materials Sourcing",
    ],
    "Marine Transportation": [
      "GHG Emissions", "Air Quality", "Ecological Impacts",
    ],
    "Rail Transportation": [
      "GHG Emissions", "Air Quality", "Worker Health & Safety",
    ],
    "Road Transportation": [
      "GHG Emissions", "Air Quality", "Driver Working Conditions",
    ],
  },
  "Renewable Resources & Alternative Energy": {
    "Biofuels": [
      "GHG Emissions", "Land Use & Ecological Impacts", "Water Management",
    ],
    "Forestry Management": [
      "GHG Emissions", "Ecological Impacts", "Community Relations",
    ],
    "Solar Energy": ["Energy Management", "Ecological Impacts", "Business Ethics"],
    "Wind Technology & Project Developers": [
      "Ecological Impacts", "Worker Health & Safety", "Business Ethics",
    ],
  },
  "Resource Transformation": {
    "Aerospace & Defense": [
      "Business Ethics", "Product Safety", "Fuel Economy",
    ],
    "Chemicals": [
      "GHG Emissions", "Air Quality", "Water Management", "Hazardous Waste Management",
    ],
    "Containers & Packaging": [
      "GHG Emissions", "Energy Management", "Product Design & Lifecycle Management",
    ],
    "Electrical & Electronic Equipment": [
      "Energy Management", "Materials Efficiency", "Hazardous Waste Management",
    ],
    "Industrial Machinery & Goods": [
      "Energy Management", "Employee Health & Safety", "Fuel Economy",
    ],
  },
};

const STAGE_COLORS: Record<string, string> = {
  Upstream: "bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]",
  Core: "bg-[#f4fadc] text-[#435e12] border-[#86bc25]/40",
  Downstream: "bg-[#fef3c7] text-[#92400e] border-[#fcd34d]",
};

// ─── Metrics multi-select dropdown ───────────────────────────────────────────
function MetricsDropdown({
  availableMetrics,
  selected,
  onToggle,
}: {
  availableMetrics: string[];
  selected: string[];
  onToggle: (metric: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const displayText = selected.length === 0
    ? "Select metrics…"
    : selected.length === 1
    ? selected[0]
    : `${selected.length} metrics selected`;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-[#f4f4f4] border border-[#e0e0e0] focus-within:border-[#86bc25] text-[13px] text-left px-3 py-2 transition-all hover:border-[#86bc25]"
      >
        <span className={selected.length === 0 ? "text-[#a8a8a8]" : "text-[#161616] font-medium"}>
          {displayText}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#525252] transition-transform shrink-0 ml-2 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-30 left-0 right-0 top-full mt-0.5 bg-white border border-[#e0e0e0] shadow-lg max-h-52 overflow-y-auto">
          {availableMetrics.length === 0 ? (
            <p className="text-[12px] text-[#8d8d8d] px-3 py-2 italic">Select a sector and industry first</p>
          ) : (
            availableMetrics.map((metric) => {
              const checked = selected.includes(metric);
              return (
                <label key={metric} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[#f4fadc] transition-colors">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(metric)}
                    className="accent-[#86bc25] w-3.5 h-3.5"
                  />
                  <span className="text-[12px] text-[#161616] leading-snug">{metric}</span>
                </label>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── Entry row ────────────────────────────────────────────────────────────────
function EntryRow({
  srro,
  entry,
  onUpdate,
}: {
  srro: { ref: string; title: string; description: string; type: string; srroCrro: string; valueChainStage: string };
  entry: Phase4Entry;
  onUpdate: (updates: Partial<Phase4Entry>) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [newMetric, setNewMetric] = useState("");

  const industries = entry.sasbSector ? Object.keys(SASB_DATA[entry.sasbSector] ?? {}) : [];
  const availableMetrics = entry.sasbSector && entry.sasbIndustry
    ? (SASB_DATA[entry.sasbSector]?.[entry.sasbIndustry] ?? [])
    : [];

  const isComplete = !!entry.sasbSector && !!entry.sasbIndustry && entry.selectedMetrics.length > 0;

  const toggleMetric = (metric: string) => {
    const current = entry.selectedMetrics ?? [];
    const updated = current.includes(metric)
      ? current.filter((m) => m !== metric)
      : [...current, metric];
    onUpdate({ selectedMetrics: updated });
  };

  const addAdditionalMetric = () => {
    const trimmed = newMetric.trim();
    if (!trimmed) return;
    const current = entry.selectedMetrics ?? [];
    if (!current.includes(trimmed)) {
      onUpdate({ selectedMetrics: [...current, trimmed] });
    }
    setNewMetric("");
  };

  const removeMetric = (metric: string) => {
    onUpdate({ selectedMetrics: (entry.selectedMetrics ?? []).filter((m) => m !== metric) });
  };

  return (
    <div className="bg-white border border-[#e0e0e0] mb-2">
      {/* Row header */}
      <div
        className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-[#fafafa] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[11px] font-bold text-[#86bc25] min-w-8">{srro.ref}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 shrink-0 ${srro.srroCrro === "CRRO" ? "bg-[#dbeafe] text-[#1d4ed8]" : "bg-[#f4f4f4] text-[#525252]"}`}>
            {srro.srroCrro}
          </span>
          {srro.type === "Risk" ? <AlertTriangle className="w-3 h-3 text-[#da1e28] shrink-0" /> : <TrendingUp className="w-3 h-3 text-[#10b981] shrink-0" />}
          <span className="text-[13px] font-semibold text-[#161616] truncate">{srro.title}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 border shrink-0 ${STAGE_COLORS[srro.valueChainStage] ?? "bg-[#f4f4f4] text-[#525252] border-[#e0e0e0]"}`}>
            {srro.valueChainStage}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {entry.sasbSector && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#f4fadc] text-[#435e12] border border-[#86bc25]/40 truncate max-w-35">
              {entry.sasbIndustry || entry.sasbSector}
            </span>
          )}
          {entry.selectedMetrics.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ede9fe] text-[#5b21b6]">
              {entry.selectedMetrics.length} metric{entry.selectedMetrics.length > 1 ? "s" : ""}
            </span>
          )}
          {isComplete ? <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> : <div className="w-4 h-4 rounded-full border-2 border-[#e0e0e0]" />}
          {expanded ? <ChevronUp className="w-4 h-4 text-[#525252]" /> : <ChevronDown className="w-4 h-4 text-[#525252]" />}
        </div>
      </div>

      {/* Expanded form */}
      {expanded && (
        <div className="border-t border-[#e0e0e0] px-5 py-5 space-y-5">

          {/* Description (read-only) + Specific Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Description</label>
              <p className="text-[13px] text-[#161616] leading-relaxed bg-[#f4f4f4] border border-[#e0e0e0] px-3 py-2 min-h-[80px]">
                {srro.description || <span className="text-[#a8a8a8] italic">No description provided.</span>}
              </p>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Specific Information</label>
              <textarea
                rows={4}
                value={entry.specificInformation}
                onChange={(e) => onUpdate({ specificInformation: e.target.value })}
                placeholder="Describe specific information to be disclosed…"
                className="w-full bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[13px] text-[#161616] px-3 py-2 resize-none transition-all"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#e0e0e0]" />

          {/* Sector Alignment */}
          <div>
            <p className="text-[11px] font-bold text-[#86bc25] uppercase tracking-widest mb-3">Sector Alignment</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {/* SASB Sector */}
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">SASB Sector</label>
                <div className="relative">
                  <select
                    value={entry.sasbSector}
                    onChange={(e) => onUpdate({ sasbSector: e.target.value, sasbIndustry: "", selectedMetrics: [] })}
                    className="w-full appearance-none bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[13px] text-[#161616] px-3 py-2 pr-8 cursor-pointer transition-all"
                  >
                    <option value="">— Select Sector —</option>
                    {Object.keys(SASB_DATA).map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252] pointer-events-none" />
                </div>
              </div>

              {/* SASB Industry */}
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">SASB Industry</label>
                <div className="relative">
                  <select
                    value={entry.sasbIndustry}
                    onChange={(e) => onUpdate({ sasbIndustry: e.target.value, selectedMetrics: [] })}
                    disabled={!entry.sasbSector}
                    className="w-full appearance-none bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[13px] text-[#161616] px-3 py-2 pr-8 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">— Select Industry —</option>
                    {industries.map((ind) => <option key={ind}>{ind}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252] pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Metrics multi-select */}
            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">
                Select Metrics
                {availableMetrics.length > 0 && <span className="ml-1 normal-case font-normal text-[#8d8d8d]">({availableMetrics.length} available)</span>}
              </label>
              <MetricsDropdown
                availableMetrics={availableMetrics}
                selected={entry.selectedMetrics}
                onToggle={toggleMetric}
              />
            </div>

            {/* Additional metric input */}
            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Add Additional Metric</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMetric}
                  onChange={(e) => setNewMetric(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addAdditionalMetric()}
                  placeholder="Type a metric not listed above and press Enter or Add…"
                  className="flex-1 bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[13px] text-[#161616] px-3 py-2 transition-all"
                />
                <button
                  onClick={addAdditionalMetric}
                  disabled={!newMetric.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#161616] text-white text-[12px] font-semibold hover:bg-[#86bc25] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Selected metrics chips */}
            {entry.selectedMetrics.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-2">
                  Selected Metrics <span className="normal-case font-normal text-[#8d8d8d]">— these will be scored in Phase 5</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {entry.selectedMetrics.map((m) => (
                    <div key={m} className="flex items-center gap-1.5 bg-[#f4fadc] border border-[#86bc25]/40 px-2.5 py-1 text-[11px] font-semibold text-[#435e12]">
                      {m}
                      <button onClick={() => removeMetric(m)} className="text-[#86bc25] hover:text-[#da1e28] transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MaterialInformation() {
  const navigate = useNavigate();
  const { srroItems, phase4Entries, upsertPhase4Entry } = useSustainabilityStore(
    useShallow((s) => ({ srroItems: s.srroItems, phase4Entries: s.phase4Entries, upsertPhase4Entry: s.upsertPhase4Entry })),
  );
  const [saved, setSaved] = useState(false);
  const [filterSector, setFilterSector] = useState("All");

  const finalList = useMemo(() => srroItems.filter((i) => i.includeInFinalList === "Yes"), [srroItems]);

  const getEntry = (ref: string): Phase4Entry =>
    phase4Entries.find((e) => e.ref === ref) ?? {
      ref, sasbSector: "",
      sasbIndustry: "", selectedMetrics: [], additionalMetrics: "", specificInformation: "",
    };

  const completedCount = useMemo(
    () => finalList.filter((i) => {
      const e = phase4Entries.find((e) => e.ref === i.ref);
      return e?.sasbSector && e.sasbIndustry && (e.selectedMetrics?.length ?? 0) > 0;
    }).length,
    [finalList, phase4Entries],
  );
  const progress = finalList.length > 0 ? Math.round((completedCount / finalList.length) * 100) : 0;

  // Unique sectors used in entries (for filter)
  const usedSectors = useMemo(() => {
    const s = new Set<string>();
    phase4Entries.forEach((e) => { if (e.sasbSector) s.add(e.sasbSector); });
    return Array.from(s);
  }, [phase4Entries]);

  const visibleItems = useMemo(() => {
    if (filterSector === "All") return finalList;
    return finalList.filter((i) => {
      const e = phase4Entries.find((e) => e.ref === i.ref);
      return e?.sasbSector === filterSector;
    });
  }, [finalList, phase4Entries, filterSector]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="min-h-full bg-[#f4f4f4] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e0e0e0] px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-[#86bc25]" />
              <span className="text-[#86bc25] font-bold text-[10px] tracking-widest uppercase">Phase 4</span>
            </div>
            <h1 className="text-[22px] font-semibold text-[#161616]">Material Information Identification</h1>
            <p className="text-[13px] text-[#525252] mt-1 max-w-2xl">
              For each SRRO/CRRO in the final list, provide a description, time horizon, and SASB-aligned sector metrics that will be scored in Phase 5.
            </p>
          </div>
          <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"}`}>
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        {/* Progress */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-[#525252]">{completedCount} / {finalList.length} SRROs configured</span>
            <span className="text-[12px] font-bold text-[#86bc25]">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#e0e0e0]">
            <div className="h-1.5 bg-[#86bc25] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Filter chips */}
        {usedSectors.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {["All", ...usedSectors].map((s) => (
              <button key={s} onClick={() => setFilterSector(s)}
                className={`px-4 py-1.5 text-[12px] font-semibold border transition-colors ${filterSector === s ? "bg-[#161616] text-white border-[#161616]" : "border-[#e0e0e0] text-[#525252] hover:border-[#86bc25]"}`}
              >{s}</button>
            ))}
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Info note */}
        <div className="flex items-start gap-3 bg-[#f4fadc] border border-[#86bc25]/30 px-4 py-3 mb-5">
          <Info className="w-4 h-4 text-[#86bc25] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#435e12]">
            Select a SASB sector and industry for each SRRO/CRRO, then choose the relevant metrics. The selected metrics will appear as individual scoring rows in Phase 5 — Materiality Assessment.
          </p>
        </div>

        {visibleItems.length === 0 ? (
          <div className="bg-white border border-[#e0e0e0] py-20 flex flex-col items-center text-center">
            <BookOpen className="w-10 h-10 text-[#c6c6c6] mb-4 stroke-1" />
            <p className="text-[15px] font-medium text-[#161616]">No items in this category</p>
            <p className="text-[13px] text-[#525252] mt-1">Return to Phase 3 to mark SRROs for the Final List.</p>
          </div>
        ) : (
          <div>
            {visibleItems.map((srro) => (
              <EntryRow
                key={srro.ref}
                srro={{ ref: srro.ref, title: srro.title, description: srro.description, type: srro.type, srroCrro: srro.srroCrro, valueChainStage: srro.valueChainStage }}
                entry={getEntry(srro.ref)}
                onUpdate={(updates) => upsertPhase4Entry({ ...getEntry(srro.ref), ...updates } as Phase4Entry)}
              />
            ))}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button onClick={() => navigate("/sustainability/srro-register")} className="px-5 py-2.5 border border-[#e0e0e0] text-[13px] font-semibold text-[#161616] hover:border-[#86bc25] transition-colors">
            ← Back to Phase 3
          </button>
          <button onClick={() => navigate("/sustainability/materiality-scoring")} className="flex items-center gap-2 bg-[#86bc25] text-white px-6 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors">
            Proceed to Phase 5 — Materiality Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
