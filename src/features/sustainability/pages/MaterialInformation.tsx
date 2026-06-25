import { useMemo, useState } from "react";
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
  Info,
} from "lucide-react";
import { useSustainabilityStore, type Phase4Entry } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";

const DISCLOSURE_AREAS = ["Governance", "Strategy", "Risk Management", "Metrics and Targets"] as const;
const TIME_HORIZONS = ["Short", "Medium", "Long"] as const;
const METRIC_SOURCES = ["IFRS S1", "IFRS S2", "SASB", "GRI", "Internal Industry"] as const;

const DISCLOSURE_COLORS: Record<string, string> = {
  Governance: "bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]/40",
  Strategy: "bg-[#ede9fe] text-[#5b21b6] border-[#c4b5fd]/40",
  "Risk Management": "bg-[#fef3c7] text-[#92400e] border-[#fcd34d]/40",
  "Metrics and Targets": "bg-[#f4fadc] text-[#435e12] border-[#86bc25]/40",
};

const SOURCE_COLORS: Record<string, string> = {
  "IFRS S1": "bg-[#f4fadc] text-[#435e12]",
  "IFRS S2": "bg-[#dbeafe] text-[#1d4ed8]",
  "SASB": "bg-[#ede9fe] text-[#5b21b6]",
  "GRI": "bg-[#fef3c7] text-[#92400e]",
  "Internal Industry": "bg-[#f4f4f4] text-[#525252]",
};


function TextArea({ value, onChange, placeholder, rows = 2 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[13px] text-[#161616] px-3 py-2 resize-none transition-all" />
  );
}

function EntryRow({ srro, entry, onUpdate }: { srro: { ref: string; title: string; type: string; srroCrro: string; valueChainStage: string }; entry: Phase4Entry; onUpdate: (updates: Partial<Phase4Entry>) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isComplete = entry.financialRelevance && entry.disclosureArea && entry.metricSource;

  return (
    <div className="bg-white border border-[#e0e0e0] mb-2">
      {/* Row header */}
      <div className="flex items-center gap-4 px-5 py-3 cursor-pointer hover:bg-[#fafafa] transition-colors" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-[11px] font-bold text-[#86bc25] min-w-[32px]">{srro.ref}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 shrink-0 ${srro.srroCrro === "CRRO" ? "bg-[#dbeafe] text-[#1d4ed8]" : "bg-[#f4f4f4] text-[#525252]"}`}>{srro.srroCrro}</span>
          {srro.type === "Risk" ? <AlertTriangle className="w-3 h-3 text-[#da1e28] shrink-0" /> : <TrendingUp className="w-3 h-3 text-[#10b981] shrink-0" />}
          <span className="text-[13px] font-semibold text-[#161616] truncate">{srro.title}</span>
          <span className={`text-[10px] font-semibold px-2 py-0.5 border shrink-0 ${
            srro.valueChainStage === "Upstream" ? "bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]" :
            srro.valueChainStage === "Core" ? "bg-[#f4fadc] text-[#435e12] border-[#86bc25]/40" :
            "bg-[#fef3c7] text-[#92400e] border-[#fcd34d]"}`}>{srro.valueChainStage}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {entry.disclosureArea && (
            <span className={`text-[10px] font-bold px-2 py-0.5 border ${DISCLOSURE_COLORS[entry.disclosureArea] ?? "bg-[#f4f4f4] text-[#525252]"}`}>
              {entry.disclosureArea}
            </span>
          )}
          {entry.metricSource && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${SOURCE_COLORS[entry.metricSource] ?? "bg-[#f4f4f4] text-[#525252]"}`}>
              {entry.metricSource}
            </span>
          )}
          {isComplete ? <CheckCircle2 className="w-4 h-4 text-[#10b981]" /> : <div className="w-4 h-4 rounded-full border-2 border-[#e0e0e0]" />}
          {expanded ? <ChevronUp className="w-4 h-4 text-[#525252]" /> : <ChevronDown className="w-4 h-4 text-[#525252]" />}
        </div>
      </div>

      {/* Expanded form */}
      {expanded && (
        <div className="border-t border-[#e0e0e0] px-5 py-5">
          {/* Section 1: Financial relevance + time horizon */}
          <div className="mb-5">
            <p className="text-[11px] font-bold text-[#86bc25] uppercase tracking-widest mb-3">Section 1 — Financial Relevance</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Financial Relevance</label>
                <div className="flex gap-2">
                  {["Yes", "No"].map((v) => (
                    <button key={v} onClick={() => onUpdate({ financialRelevance: v as "Yes" | "No" })}
                      className={`flex-1 py-2 text-[12px] font-bold border transition-colors ${entry.financialRelevance === v ? (v === "Yes" ? "bg-[#10b981] text-white border-[#10b981]" : "bg-[#da1e28] text-white border-[#da1e28]") : "border-[#e0e0e0] text-[#525252] hover:border-[#86bc25]"}`}
                    >{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Time Horizon</label>
                <div className="flex gap-2">
                  {TIME_HORIZONS.map((v) => (
                    <button key={v} onClick={() => onUpdate({ timeHorizon: v })}
                      className={`flex-1 py-2 text-[12px] font-bold border transition-colors ${entry.timeHorizon === v ? "bg-[#161616] text-white border-[#161616]" : "border-[#e0e0e0] text-[#525252] hover:border-[#86bc25]"}`}
                    >{v}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Disclosure alignment */}
          <div>
            <p className="text-[11px] font-bold text-[#86bc25] uppercase tracking-widest mb-3">Section 2 — Disclosure Alignment</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Disclosure Area</label>
                <div className="grid grid-cols-2 gap-2">
                  {DISCLOSURE_AREAS.map((area) => (
                    <button key={area} onClick={() => onUpdate({ disclosureArea: area })}
                      className={`py-2 px-3 text-[11px] font-bold border text-left transition-colors ${entry.disclosureArea === area ? `${DISCLOSURE_COLORS[area]} border-current` : "border-[#e0e0e0] text-[#525252] hover:border-[#86bc25]"}`}
                    >{area}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Metric Source</label>
                <div className="flex flex-wrap gap-2">
                  {METRIC_SOURCES.map((src) => (
                    <button key={src} onClick={() => onUpdate({ metricSource: src })}
                      className={`px-3 py-1.5 text-[11px] font-bold border transition-colors ${entry.metricSource === src ? `${SOURCE_COLORS[src]} border-current` : "border-[#e0e0e0] text-[#525252] hover:border-[#86bc25]"}`}
                    >{src}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Specific Information</label>
                <TextArea value={entry.specificInformation} onChange={(v) => onUpdate({ specificInformation: v })} placeholder="Describe the specific information to be disclosed…" rows={3} />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Metrics / KPIs</label>
                <TextArea value={entry.metricsKPI} onChange={(v) => onUpdate({ metricsKPI: v })} placeholder="List metrics and KPIs to track and disclose…" rows={3} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MaterialInformation() {
  const navigate = useNavigate();
  const { srroItems, phase4Entries, upsertPhase4Entry } = useSustainabilityStore(
    useShallow((s) => ({ srroItems: s.srroItems, phase4Entries: s.phase4Entries, upsertPhase4Entry: s.upsertPhase4Entry })),
  );
  const [saved, setSaved] = useState(false);
  const [filterDisclosure, setFilterDisclosure] = useState("All");

  // Only show final-list SRROs
  const finalList = useMemo(() => srroItems.filter((i) => i.includeInFinalList === "Yes"), [srroItems]);

  const getEntry = (ref: string): Phase4Entry => {
    return phase4Entries.find((e) => e.ref === ref) ?? {
      ref, financialRelevance: "", timeHorizon: "", disclosureArea: "", specificInformation: "", metricsKPI: "", metricSource: "",
    };
  };

  const grouped = useMemo(() => {
    const result: Record<string, typeof finalList> = { "All": finalList };
    DISCLOSURE_AREAS.forEach((area) => {
      result[area] = finalList.filter((i) => {
        const entry = phase4Entries.find((e) => e.ref === i.ref);
        return entry?.disclosureArea === area;
      });
    });
    return result;
  }, [finalList, phase4Entries]);

  const visibleItems = filterDisclosure === "All" ? finalList : grouped[filterDisclosure] ?? [];

  const completedCount = finalList.filter((i) => {
    const e = phase4Entries.find((e) => e.ref === i.ref);
    return e?.financialRelevance && e.disclosureArea && e.metricSource;
  }).length;
  const progress = finalList.length > 0 ? Math.round((completedCount / finalList.length) * 100) : 0;

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
              Identify sustainability-related information that is potentially material for disclosure under IFRS standards.
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
            <span className="text-[12px] text-[#525252]">{completedCount} / {finalList.length} SRROs aligned</span>
            <span className="text-[12px] font-bold text-[#86bc25]">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#e0e0e0]">
            <div className="h-1.5 bg-[#86bc25] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mt-4">
          {["All", ...DISCLOSURE_AREAS].map((area) => (
            <button key={area} onClick={() => setFilterDisclosure(area)}
              className={`px-4 py-1.5 text-[12px] font-semibold border transition-colors ${filterDisclosure === area ? (DISCLOSURE_COLORS[area] ? `${DISCLOSURE_COLORS[area]} border-current` : "bg-[#161616] text-white border-[#161616]") : "border-[#e0e0e0] text-[#525252] hover:border-[#86bc25]"}`}
            >
              {area} {area === "All" ? `(${finalList.length})` : `(${(grouped[area] ?? []).length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Info note */}
        <div className="flex items-start gap-3 bg-[#f4fadc] border border-[#86bc25]/30 px-4 py-3 mb-5">
          <Info className="w-4 h-4 text-[#86bc25] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#435e12]">
            This page shows the <strong>{finalList.length} SRROs</strong> from the Phase 3 Final List. For each, identify financial relevance, time horizon, disclosure area, specific information to disclose, metrics and KPIs, and the metric source.
          </p>
        </div>

        {visibleItems.length === 0 ? (
          <div className="bg-white border border-[#e0e0e0] py-20 flex flex-col items-center text-center">
            <BookOpen className="w-10 h-10 text-[#c6c6c6] mb-4 stroke-1" />
            <p className="text-[15px] font-medium text-[#161616]">No items in this category yet</p>
            <p className="text-[13px] text-[#525252] mt-1">Return to Phase 3 to mark SRROs for the Final List, or select a different disclosure area filter.</p>
          </div>
        ) : (
          <div>
            {visibleItems.map((srro) => (
              <EntryRow
                key={srro.ref}
                srro={{ ref: srro.ref, title: srro.title, type: srro.type, srroCrro: srro.srroCrro, valueChainStage: srro.valueChainStage }}
                entry={getEntry(srro.ref)}
                onUpdate={(updates) => upsertPhase4Entry({ ...getEntry(srro.ref), ...updates })}
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
