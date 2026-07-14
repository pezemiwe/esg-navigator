import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Save,
  AlertTriangle,
  TrendingUp,
  Plus,
  X,
  Info,
  Building2,
} from "lucide-react";
import { useSustainabilityStore, type Phase4Entry } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import {
  GRI_DATA,
  IFRS_S2_CROSS_INDUSTRY_DATA,
  IFRS_S2_APPENDIX_B_DATA,
  getIfrsS2AppendixSectors,
  getIfrsS2AppendixIndustries,
  getIfrsS2AppendixTopics,
  getIfrsS2AppendixMetrics,
  INTERNAL_DATA,
  ALL_SOURCES,
  SOURCE_COLORS,
} from "../data/frameworkMetrics";

import { SASB_DATA } from "../data/sasbData";

const STAGE_COLORS: Record<string, string> = {
  Upstream:   "bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]",
  Core:       "bg-[#f4fadc] text-[#435e12] border-[#86bc25]/40",
  Downstream: "bg-[#fef3c7] text-[#92400e] border-[#fcd34d]",
};

const SOURCE_FULL_NAME: Record<string, string> = {
  SASB:      "SASB — Sustainability Accounting Standards Board",
  GRI:       "GRI — Global Reporting Initiative",
  "IFRS S2": "IFRS S2 — Climate-related Disclosures",
  Internal:  "Internal / CBN Metrics Framework",
};

// ─── Shared metric checkbox list ──────────────────────────────────────────────
function MetricChecklist({
  metrics,
  selected,
  onToggle,
  accentClass,
}: {
  metrics: string[];
  selected: string[];
  onToggle: (m: string) => void;
  accentClass: string;
}) {
  if (metrics.length === 0) return <p className="text-[12px] text-[#a8a8a8] italic py-1">No metrics available.</p>;
  return (
    <div className="grid grid-cols-1 gap-0.5 max-h-44 overflow-y-auto pr-1">
      {metrics.map((m) => (
        <label key={m} className={`flex items-start gap-2.5 px-3 py-2 cursor-pointer transition-colors rounded ${selected.includes(m) ? accentClass : "hover:bg-[#f4f4f4]"}`}>
          <input
            type="checkbox"
            checked={selected.includes(m)}
            onChange={() => onToggle(m)}
            className="accent-[#86bc25] w-3.5 h-3.5 mt-0.5 shrink-0"
          />
          <span className="text-[12px] text-[#161616] leading-snug">{m}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Shared select dropdown ───────────────────────────────────────────────────
function PickerSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLSelectElement>(null);
  return (
    <div className="relative">
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none bg-white border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] text-[#161616] px-3 py-2 pr-8 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252] pointer-events-none" />
    </div>
  );
}

// ─── SASB Picker ─────────────────────────────────────────────────────────────
function SasbPicker({
  entry,
  onUpdate,
}: {
  entry: Phase4Entry;
  onUpdate: (u: Partial<Phase4Entry>) => void;
}) {
  const industries = entry.sasbSector ? Object.keys(SASB_DATA[entry.sasbSector] ?? {}) : [];
  const topics = entry.sasbSector && entry.sasbIndustry
    ? Object.keys(SASB_DATA[entry.sasbSector]?.[entry.sasbIndustry] ?? {})
    : [];
  const availableMetrics = entry.sasbSector && entry.sasbIndustry && entry.sasbTopic
    ? (SASB_DATA[entry.sasbSector]?.[entry.sasbIndustry]?.[entry.sasbTopic] ?? [])
    : [];

  const toggleMetric = (metric: string) => {
    const cur = entry.selectedMetrics ?? [];
    onUpdate({ selectedMetrics: cur.includes(metric) ? cur.filter((m) => m !== metric) : [...cur, metric] });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Sector</label>
          <PickerSelect
            value={entry.sasbSector}
            onChange={(v) => onUpdate({ sasbSector: v, sasbIndustry: "", sasbTopic: "" })}
            options={Object.keys(SASB_DATA)}
            placeholder="— Select Sector —"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Industry</label>
          <PickerSelect
            value={entry.sasbIndustry}
            onChange={(v) => onUpdate({ sasbIndustry: v, sasbTopic: "" })}
            options={industries}
            placeholder="— Select Industry —"
            disabled={!entry.sasbSector}
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Material Topic</label>
          <PickerSelect
            value={entry.sasbTopic}
            onChange={(v) => onUpdate({ sasbTopic: v })}
            options={topics}
            placeholder="— Select Topic —"
            disabled={!entry.sasbIndustry}
          />
        </div>
      </div>

      {entry.sasbTopic && (
        <div>
          <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1.5">
            Metrics <span className="normal-case font-normal text-[#86bc25]">({availableMetrics.length} available)</span>
          </label>
          <MetricChecklist
            metrics={availableMetrics}
            selected={entry.selectedMetrics ?? []}
            onToggle={toggleMetric}
            accentClass="bg-[#f4fadc]"
          />
        </div>
      )}

      {!entry.sasbTopic && (
        <p className="text-[12px] text-[#a8a8a8] italic">Select a Sector, Industry, and Material Topic to see available SASB metrics.</p>
      )}
    </div>
  );
}

// ─── GRI Picker (Series → Standard → Disclosures) ─────────────────────────────
function GriPicker({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (m: string) => void;
}) {
  const [series, setSeries] = useState("");
  const [standard, setStandard] = useState("");

  const standards = series ? Object.keys(GRI_DATA[series] ?? {}) : [];
  const disclosures = series && standard ? (GRI_DATA[series]?.[standard] ?? []) : [];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">GRI Series</label>
          <PickerSelect
            value={series}
            onChange={(v) => { setSeries(v); setStandard(""); }}
            options={Object.keys(GRI_DATA)}
            placeholder="— Select Series —"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">GRI Standard</label>
          <PickerSelect
            value={standard}
            onChange={setStandard}
            options={standards}
            placeholder="— Select Standard —"
            disabled={!series}
          />
        </div>
      </div>

      {standard && (
        <div>
          <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1.5">
            Disclosures <span className="normal-case font-normal text-[#1d4ed8]">({disclosures.length} available)</span>
          </label>
          <MetricChecklist
            metrics={disclosures}
            selected={selected}
            onToggle={onToggle}
            accentClass="bg-[#dbeafe]"
          />
        </div>
      )}

      {!standard && (
        <p className="text-[12px] text-[#a8a8a8] italic">Select a Series and Standard to browse GRI disclosures.</p>
      )}
    </div>
  );
}

// ─── Category Picker for Internal (Category → Metrics) ───────────────────────
function CategoryPicker({
  data,
  selected,
  onToggle,
  accentClass,
  categoryLabel,
}: {
  data: Record<string, string[]>;
  selected: string[];
  onToggle: (m: string) => void;
  accentClass: string;
  categoryLabel: string;
}) {
  const [category, setCategory] = useState("");
  const metrics = category ? (data[category] ?? []) : [];

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">{categoryLabel}</label>
        <PickerSelect
          value={category}
          onChange={setCategory}
          options={Object.keys(data)}
          placeholder={`— Select ${categoryLabel} —`}
        />
      </div>

      {category && (
        <div>
          <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1.5">
            Metrics <span className="normal-case font-normal" style={{ color: "var(--src-color)" }}>({metrics.length} available)</span>
          </label>
          <MetricChecklist
            metrics={metrics}
            selected={selected}
            onToggle={onToggle}
            accentClass={accentClass}
          />
        </div>
      )}

      {!category && (
        <p className="text-[12px] text-[#a8a8a8] italic">Select a category to browse available metrics.</p>
      )}
    </div>
  );
}

// ─── IFRS S2 Picker — Cross-industry pillars OR Appendix B industry drill-down ──
type IfrsS2Mode = "cross-industry" | "industry-based";

function IfrsS2Picker({
  entry,
  onUpdate,
}: {
  entry: Phase4Entry;
  onUpdate: (u: Partial<Phase4Entry>) => void;
}) {
  const [mode, setMode] = useState<IfrsS2Mode>(
    entry.sasbSector ? "industry-based" : "cross-industry",
  );
  const [pillar, setPillar] = useState("");

  const sectors = getIfrsS2AppendixSectors(SASB_DATA);
  const industries = entry.sasbSector ? getIfrsS2AppendixIndustries(entry.sasbSector, SASB_DATA) : [];
  const topics =
    entry.sasbSector && entry.sasbIndustry
      ? getIfrsS2AppendixTopics(entry.sasbSector, entry.sasbIndustry, SASB_DATA)
      : [];
  const industryMetrics =
    entry.sasbSector && entry.sasbIndustry && entry.sasbTopic
      ? getIfrsS2AppendixMetrics(entry.sasbSector, entry.sasbIndustry, entry.sasbTopic, SASB_DATA)
      : [];
  const crossIndustryMetrics = pillar ? (IFRS_S2_CROSS_INDUSTRY_DATA[pillar] ?? []) : [];

  const isCuratedIndustry =
    !!entry.sasbSector &&
    !!entry.sasbIndustry &&
    !!IFRS_S2_APPENDIX_B_DATA[entry.sasbSector]?.[entry.sasbIndustry];

  const toggleMetric = (metric: string) => {
    const cur = entry.selectedMetrics ?? [];
    onUpdate({ selectedMetrics: cur.includes(metric) ? cur.filter((m) => m !== metric) : [...cur, metric] });
  };

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-0 border border-[#e0e0e0] w-fit">
        {([
          { id: "cross-industry" as const, label: "Cross-industry" },
          { id: "industry-based" as const, label: "Industry-based (Appendix B)" },
        ]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id)}
            className={`px-4 py-2 text-[12px] font-semibold transition-colors ${
              mode === tab.id
                ? "bg-[#5b21b6] text-white"
                : "bg-white text-[#525252] hover:bg-[#ede9fe] hover:text-[#5b21b6]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mode === "cross-industry" && (
        <div className="space-y-3">
          <p className="text-[11px] text-[#525252] leading-relaxed">
            Core IFRS S2 disclosure requirements applicable to all entities — Governance, Strategy, Risk Management, and cross-industry metrics (§5–§37).
          </p>
          <div>
            <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">
              Pillar / Category
            </label>
            <PickerSelect
              value={pillar}
              onChange={setPillar}
              options={Object.keys(IFRS_S2_CROSS_INDUSTRY_DATA)}
              placeholder="— Select Pillar / Category —"
            />
          </div>
          {pillar ? (
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1.5">
                Metrics{" "}
                <span className="normal-case font-normal text-[#5b21b6]">({crossIndustryMetrics.length} available)</span>
              </label>
              <MetricChecklist
                metrics={crossIndustryMetrics}
                selected={entry.selectedMetrics ?? []}
                onToggle={toggleMetric}
                accentClass="bg-[#ede9fe]"
              />
            </div>
          ) : (
            <p className="text-[12px] text-[#a8a8a8] italic">Select a pillar or category to browse cross-industry IFRS S2 metrics.</p>
          )}
        </div>
      )}

      {mode === "industry-based" && (
        <div className="space-y-3">
          <p className="text-[11px] text-[#525252] leading-relaxed">
            IFRS S2 Appendix B industry-based guidance (ISSB ED/2022/S2, derived from SASB Standards). Select your sector and industry, then choose material topics and metrics.
            {isCuratedIndustry && (
              <span className="ml-1 text-[10px] font-bold px-1.5 py-0.5 bg-[#ede9fe] text-[#5b21b6]">Curated IFRS S2 codes</span>
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Sector</label>
              <PickerSelect
                value={entry.sasbSector}
                onChange={(v) => onUpdate({ sasbSector: v, sasbIndustry: "", sasbTopic: "" })}
                options={sectors}
                placeholder="— Select Sector —"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Industry</label>
              <PickerSelect
                value={entry.sasbIndustry}
                onChange={(v) => onUpdate({ sasbIndustry: v, sasbTopic: "" })}
                options={industries}
                placeholder="— Select Industry —"
                disabled={!entry.sasbSector}
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Material Topic</label>
              <PickerSelect
                value={entry.sasbTopic}
                onChange={(v) => onUpdate({ sasbTopic: v })}
                options={topics}
                placeholder="— Select Topic —"
                disabled={!entry.sasbIndustry}
              />
            </div>
          </div>

          {entry.sasbTopic ? (
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1.5">
                Metrics{" "}
                <span className="normal-case font-normal text-[#5b21b6]">({industryMetrics.length} available)</span>
              </label>
              <MetricChecklist
                metrics={industryMetrics}
                selected={entry.selectedMetrics ?? []}
                onToggle={toggleMetric}
                accentClass="bg-[#ede9fe]"
              />
            </div>
          ) : (
            <p className="text-[12px] text-[#a8a8a8] italic">
              Select a Sector, Industry, and Material Topic to see IFRS S2 Appendix B metrics.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Source section wrapper ───────────────────────────────────────────────────
function SourceSection({ source, children }: { source: string; children: React.ReactNode }) {
  const c = SOURCE_COLORS[source] ?? SOURCE_COLORS["SASB"];
  return (
    <div className={`border ${c.border} mb-3 overflow-hidden`}>
      <div className={`flex items-center gap-2.5 px-4 py-2.5 ${c.bg} border-b ${c.border}`}>
        <span className={`text-[10px] font-bold px-2 py-0.5 ${c.badge}`}>{source}</span>
        <span className={`text-[12px] font-semibold ${c.text}`}>{SOURCE_FULL_NAME[source]}</span>
      </div>
      <div className="bg-white px-4 py-4">{children}</div>
    </div>
  );
}

// ─── Entry row (summary only — opens modal on click) ─────────────────────────
function EntryRow({
  srro,
  entry,
  onClick,
}: {
  srro: { ref: string; title: string; type: string; srroCrro: string; valueChainStage: string };
  entry: Phase4Entry;
  onClick: () => void;
}) {
  const sources = entry.sources ?? [];
  const isComplete = sources.length > 0 && (entry.selectedMetrics ?? []).length > 0;

  return (
    <div
      className="bg-white border border-[#e0e0e0] mb-2 flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-[#fafafa] hover:border-[#86bc25]/40 transition-all group"
      onClick={onClick}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-[11px] font-bold text-[#86bc25] shrink-0 min-w-8">{srro.ref}</span>
        <span className={`text-[10px] font-bold px-1.5 py-0.5 shrink-0 ${srro.srroCrro === "CRRO" ? "bg-[#dbeafe] text-[#1d4ed8]" : "bg-[#f4f4f4] text-[#525252]"}`}>
          {srro.srroCrro}
        </span>
        {srro.type === "Risk"
          ? <AlertTriangle className="w-3 h-3 text-[#da1e28] shrink-0" />
          : <TrendingUp className="w-3 h-3 text-[#10b981] shrink-0" />}
        <span className="text-[13px] font-semibold text-[#161616] truncate">{srro.title}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 border shrink-0 ${STAGE_COLORS[srro.valueChainStage] ?? "bg-[#f4f4f4] text-[#525252] border-[#e0e0e0]"}`}>
          {srro.valueChainStage}
        </span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {sources.map((s) => {
          const c = SOURCE_COLORS[s] ?? SOURCE_COLORS["SASB"];
          return <span key={s} className={`text-[10px] font-bold px-2 py-0.5 ${c.badge}`}>{s}</span>;
        })}
        {(entry.selectedMetrics ?? []).length > 0 && (
          <span className="text-[10px] font-bold px-2 py-0.5 bg-[#ede9fe] text-[#5b21b6]">
            {entry.selectedMetrics.length} metric{entry.selectedMetrics.length > 1 ? "s" : ""}
          </span>
        )}
        {isComplete
          ? <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          : <div className="w-4 h-4 rounded-full border-2 border-[#e0e0e0]" />}
        <ChevronRight className="w-4 h-4 text-[#c6c6c6] group-hover:text-[#86bc25] transition-colors" />
      </div>
    </div>
  );
}

// ─── Entry modal ──────────────────────────────────────────────────────────────
function EntryModal({
  srro,
  entry,
  onUpdate,
  onClose,
}: {
  srro: { ref: string; title: string; description: string; type: string; srroCrro: string; valueChainStage: string };
  entry: Phase4Entry;
  onUpdate: (updates: Partial<Phase4Entry>) => void;
  onClose: () => void;
}) {
  const [newMetric, setNewMetric] = useState("");
  const [customSrc, setCustomSrc] = useState<string>("SASB");
  const sources = entry.sources ?? [];

  const toggleSource = (source: string) => {
    const updated = sources.includes(source)
      ? sources.filter((s) => s !== source)
      : [...sources, source];
    onUpdate({ sources: updated });
  };

  const toggleMetric = (metric: string) => {
    const cur = entry.selectedMetrics ?? [];
    onUpdate({ selectedMetrics: cur.includes(metric) ? cur.filter((m) => m !== metric) : [...cur, metric] });
  };

  const addAdditionalMetric = () => {
    const trimmed = newMetric.trim();
    if (!trimmed) return;
    let metricText = trimmed;
    if (customSrc === "GRI" && !trimmed.startsWith("GRI ")) {
      metricText = `GRI Custom — ${trimmed}`;
    } else if (customSrc === "IFRS S2" && !trimmed.startsWith("IFRS S2")) {
      metricText = `IFRS S2 — ${trimmed}`;
    } else if (customSrc === "Internal" && !trimmed.startsWith("INT-") && !trimmed.startsWith("CBN ")) {
      metricText = `INT-Custom: ${trimmed}`;
    }
    const cur = entry.selectedMetrics ?? [];
    if (!cur.includes(metricText)) onUpdate({ selectedMetrics: [...cur, metricText] });
    setNewMetric("");
  };

  const removeMetric = (metric: string) => {
    onUpdate({ selectedMetrics: (entry.selectedMetrics ?? []).filter((m) => m !== metric) });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#161616]/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">

        {/* Modal header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e0e0e0] bg-white sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[11px] font-bold text-[#86bc25] shrink-0">{srro.ref}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 shrink-0 ${srro.srroCrro === "CRRO" ? "bg-[#dbeafe] text-[#1d4ed8]" : "bg-[#f4f4f4] text-[#525252]"}`}>
              {srro.srroCrro}
            </span>
            {srro.type === "Risk"
              ? <AlertTriangle className="w-3.5 h-3.5 text-[#da1e28] shrink-0" />
              : <TrendingUp className="w-3.5 h-3.5 text-[#10b981] shrink-0" />}
            <span className="text-[15px] font-semibold text-[#161616] truncate">{srro.title}</span>
            <span className={`text-[10px] font-semibold px-2 py-0.5 border shrink-0 ${STAGE_COLORS[srro.valueChainStage] ?? "bg-[#f4f4f4] text-[#525252] border-[#e0e0e0]"}`}>
              {srro.valueChainStage}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[#f4f4f4] transition-colors shrink-0 ml-2"
            title="Close"
          >
            <X className="w-5 h-5 text-[#525252]" />
          </button>
        </div>

        {/* Modal body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

          {/* Description + Specific Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Description</label>
              <p className="text-[13px] text-[#161616] leading-relaxed bg-[#f4f4f4] border border-[#e0e0e0] px-3 py-2 min-h-20">
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

          <div className="border-t border-[#e0e0e0]" />

          {/* Reporting Frameworks */}
          <div>
            <p className="text-[11px] font-bold text-[#86bc25] uppercase tracking-widest mb-1">Reporting Frameworks</p>
            <p className="text-[12px] text-[#525252] mb-3">Select one or more frameworks, then choose metrics from each.</p>

            <div className="flex flex-wrap gap-2 mb-5">
              {ALL_SOURCES.map((source) => {
                const active = sources.includes(source);
                const c = SOURCE_COLORS[source];
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source)}
                    className={`flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-bold border-2 transition-all ${
                      active
                        ? `${c.badge} border-transparent`
                        : "bg-white text-[#525252] border-[#e0e0e0] hover:border-[#86bc25]"
                    }`}
                  >
                    {active && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {source}
                  </button>
                );
              })}
            </div>

            {sources.length === 0 && (
              <div className="flex items-center gap-2 text-[12px] text-[#a8a8a8] italic py-2">
                <Info className="w-4 h-4 shrink-0" />
                Toggle at least one framework above to start selecting metrics.
              </div>
            )}

            {sources.includes("SASB") && (
              <SourceSection source="SASB">
                <SasbPicker entry={entry} onUpdate={onUpdate} />
              </SourceSection>
            )}
            {sources.includes("GRI") && (
              <SourceSection source="GRI">
                <GriPicker selected={entry.selectedMetrics ?? []} onToggle={toggleMetric} />
              </SourceSection>
            )}
            {sources.includes("IFRS S2") && (
              <SourceSection source="IFRS S2">
                <IfrsS2Picker entry={entry} onUpdate={onUpdate} />
              </SourceSection>
            )}
            {sources.includes("Internal") && (
              <SourceSection source="Internal">
                <CategoryPicker
                  data={INTERNAL_DATA}
                  selected={entry.selectedMetrics ?? []}
                  onToggle={toggleMetric}
                  accentClass="bg-[#fef3c7]"
                  categoryLabel="Category"
                />
              </SourceSection>
            )}
          </div>

          {/* Custom metric input */}
          <div>
            <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Add Custom Metric</label>
            <div className="flex gap-2">
              <div className="relative shrink-0">
                <select
                  value={customSrc}
                  onChange={(e) => setCustomSrc(e.target.value)}
                  className="appearance-none bg-white border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] font-semibold text-[#161616] pl-3 pr-7 py-2 cursor-pointer transition-all h-full"
                >
                  {ALL_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#525252] pointer-events-none" />
              </div>
              <input
                type="text"
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAdditionalMetric()}
                placeholder="Type a metric not listed in any framework above…"
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

          {/* Selected metrics pool */}
          {(entry.selectedMetrics ?? []).length > 0 && (
            <div>
              <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-2">
                Selected Metrics Pool{" "}
                <span className="normal-case font-normal text-[#8d8d8d]">— scored individually in Phase 5</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {entry.selectedMetrics.map((m) => {
                  const src = m.startsWith("GRI ")
                    ? "GRI"
                    : m.startsWith("IFRS S2")
                    ? "IFRS S2"
                    : m.startsWith("INT-") || m.startsWith("CBN ")
                    ? "Internal"
                    : "SASB";
                  const c = SOURCE_COLORS[src] ?? SOURCE_COLORS["SASB"];
                  return (
                    <div key={m} className={`flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}>
                      <span className={`text-[9px] font-bold px-1 py-0.5 ${c.badge} shrink-0`}>{src}</span>
                      <span className="truncate max-w-75" title={m}>{m}</span>
                      <button onClick={() => removeMetric(m)} className="hover:text-[#da1e28] transition-colors shrink-0">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal footer */}
        <div className="px-6 py-4 border-t border-[#e0e0e0] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#161616] text-white text-[13px] font-semibold hover:bg-[#86bc25] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MaterialInformation() {
  const navigate = useNavigate();
  const { srroItems, phase4Entries, upsertPhase4Entry, isGroupAssessment, groupName, assessmentEntities, activeEntityId, entitySnapshots, switchActiveEntity, saveCurrentProject } = useSustainabilityStore(
    useShallow((s) => ({ srroItems: s.srroItems, phase4Entries: s.phase4Entries, upsertPhase4Entry: s.upsertPhase4Entry, isGroupAssessment: s.isGroupAssessment, groupName: s.groupName, assessmentEntities: s.assessmentEntities, activeEntityId: s.activeEntityId, entitySnapshots: s.entitySnapshots, switchActiveEntity: s.switchActiveEntity, saveCurrentProject: s.saveCurrentProject })),
  );
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState<"all" | "complete" | "incomplete">("all");
  const [modalRef, setModalRef] = useState<string | null>(null);

  const finalList = useMemo(() => srroItems.filter((i) => i.includeInFinalList === "Yes"), [srroItems]);

  const getEntry = (ref: string): Phase4Entry =>
    phase4Entries.find((e) => e.ref === ref) ?? {
      ref, sources: [], sasbSector: "", sasbIndustry: "", sasbTopic: "",
      selectedMetrics: [], additionalMetrics: "", specificInformation: "",
    };

  const isEntryComplete = (ref: string) => {
    const e = phase4Entries.find((en) => en.ref === ref);
    return (e?.sources ?? []).length > 0 && (e?.selectedMetrics?.length ?? 0) > 0;
  };

  const completedCount = useMemo(() => finalList.filter((i) => isEntryComplete(i.ref)).length, [finalList, phase4Entries]);
  const progress = finalList.length > 0 ? Math.round((completedCount / finalList.length) * 100) : 0;

  const visibleItems = useMemo(() => {
    if (filter === "complete") return finalList.filter((i) => isEntryComplete(i.ref));
    if (filter === "incomplete") return finalList.filter((i) => !isEntryComplete(i.ref));
    return finalList;
  }, [finalList, phase4Entries, filter]);

  const handleSave = () => { saveCurrentProject(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

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
              For each SRRO/CRRO, select reporting frameworks (SASB, GRI, IFRS S2, Internal) and pick metrics from each. Selected metrics will be scored individually in Phase 5.
            </p>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"}`}
          >
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
        <div className="flex gap-2 mt-4">
          {(["all", "complete", "incomplete"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-[12px] font-semibold border capitalize transition-colors ${filter === f ? "bg-[#161616] text-white border-[#161616]" : "border-[#e0e0e0] text-[#525252] hover:border-[#86bc25]"}`}
            >
              {f === "all" ? `All (${finalList.length})` : f === "complete" ? `Complete (${completedCount})` : `Incomplete (${finalList.length - completedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Entity Switcher Banner */}
      {isGroupAssessment && assessmentEntities.length > 0 && (
        <div className="bg-[#161616] px-8 py-0 flex items-center gap-0 overflow-x-auto">
          <div className="flex items-center gap-2 text-white text-[11px] font-bold tracking-widest uppercase pr-6 border-r border-white/20 shrink-0 py-3">
            <Building2 className="w-4 h-4 text-[#86bc25]" />
            {groupName || "Group Assessment"}
          </div>
          <button
            onClick={() => switchActiveEntity("parent")}
            className={`px-5 py-3 text-[12px] font-semibold tracking-wide transition-colors border-b-2 shrink-0 ${
              activeEntityId === "parent"
                ? "text-[#86bc25] border-[#86bc25]"
                : "text-white/70 border-transparent hover:text-white"
            }`}
          >
            {groupName || "Parent Entity"}
          </button>
          {assessmentEntities.map((entity) => {
            const snap = entitySnapshots[entity.id];
            const ph4 = snap?.phase4Entries ?? [];
            const ph3 = snap?.srroItems ?? [];
            const finalSnap = ph3.filter((i) => i.includeInFinalList === "Yes");
            const completedSnap = finalSnap.filter((i) => (ph4.find((e) => e.ref === i.ref)?.sources ?? []).length > 0 && (ph4.find((e) => e.ref === i.ref)?.selectedMetrics?.length ?? 0) > 0).length;
            const pct = finalSnap.length > 0 ? Math.round((completedSnap / finalSnap.length) * 100) : 0;
            return (
              <button
                key={entity.id}
                onClick={() => switchActiveEntity(entity.id)}
                className={`px-5 py-3 text-[12px] font-semibold tracking-wide transition-colors border-b-2 shrink-0 flex items-center gap-2 ${
                  activeEntityId === entity.id
                    ? "text-[#86bc25] border-[#86bc25]"
                    : "text-white/70 border-transparent hover:text-white"
                }`}
              >
                {entity.name}
                {pct === 100 && <span className="w-1.5 h-1.5 rounded-full bg-[#86bc25] inline-block" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modalRef && (() => {
        const srro = srroItems.find((i) => i.ref === modalRef);
        if (!srro) return null;
        return (
          <EntryModal
            srro={{ ref: srro.ref, title: srro.title, description: srro.description, type: srro.type, srroCrro: srro.srroCrro, valueChainStage: srro.valueChainStage }}
            entry={getEntry(srro.ref)}
            onUpdate={(updates) => upsertPhase4Entry({ ...getEntry(srro.ref), ...updates } as Phase4Entry)}
            onClose={() => setModalRef(null)}
          />
        );
      })()}

      <div className="max-w-5xl mx-auto px-6 py-6">
        {visibleItems.length === 0 ? (
          <div className="bg-white border border-[#e0e0e0] py-20 flex flex-col items-center text-center">
            <BookOpen className="w-10 h-10 text-[#c6c6c6] mb-4 stroke-1" />
            <p className="text-[15px] font-medium text-[#161616]">
              {filter === "all" ? "No items in the final list" : `No ${filter} items`}
            </p>
            <p className="text-[13px] text-[#525252] mt-1">
              {filter === "all" ? "Return to Phase 3 to mark SRROs for the Final List." : "Change the filter above to see other items."}
            </p>
          </div>
        ) : (
          <div>
            {visibleItems.map((srro) => (
              <EntryRow
                key={srro.ref}
                srro={{ ref: srro.ref, title: srro.title, type: srro.type, srroCrro: srro.srroCrro, valueChainStage: srro.valueChainStage }}
                entry={getEntry(srro.ref)}
                onClick={() => setModalRef(srro.ref)}
              />
            ))}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate("/sustainability/srro-register")}
            className="px-5 py-2.5 border border-[#e0e0e0] text-[13px] font-semibold text-[#161616] hover:border-[#86bc25] transition-colors"
          >
            ← Back to Phase 3
          </button>
          <button
            onClick={() => navigate("/sustainability/materiality-scoring")}
            disabled={finalList.length === 0 || completedCount !== finalList.length}
            title={finalList.length === 0 || completedCount !== finalList.length ? "Complete metric mapping for every final-list item before proceeding" : ""}
            className={`flex items-center gap-2 px-6 py-2.5 text-[13px] font-semibold transition-colors ${finalList.length > 0 && completedCount === finalList.length ? "bg-[#86bc25] text-white hover:bg-[#70a31d]" : "bg-[#c6c6c6] text-white cursor-not-allowed"}`}
          >
            Proceed to Phase 5 — Materiality Assessment <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
