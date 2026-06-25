import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ListChecks,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  X,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  Save,
} from "lucide-react";
import { useSustainabilityStore, type SRROItem } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import { PHASE3_INITIAL_DATA } from "@/config/phase3InitialData";

const SOURCES = ["Value chain assessment", "Regulators and peers", "IFRS S2 climate risk", "SASB", "CDSB", "Internal risk register"];
const STAGE_OPTS = ["Upstream", "Core", "Downstream"] as const;
const HORIZON_OPTS = ["Short", "Medium", "Long"] as const;
const SCORE_RANGE = [0, 1, 2, 3, 4] as const;
const LIKELIHOOD_LABELS: Record<number, string> = { 0: "—", 1: "Unlikely", 2: "Possible", 3: "Likely", 4: "Almost certain" };
const MAGNITUDE_LABELS: Record<number, string> = { 0: "—", 1: "Low", 2: "Moderate", 3: "High", 4: "Severe" };

function riskScore(l: number, m: number) { return l * m; }
function scoreColor(s: number) {
  if (s >= 12) return "bg-[#da1e28] text-white";
  if (s >= 6) return "bg-[#f59e0b] text-white";
  if (s >= 3) return "bg-[#86bc25] text-white";
  return "bg-[#f4f4f4] text-[#525252]";
}

function SelectCell({ value, options, onChange, colorMap }: { value: string; options: readonly string[]; onChange: (v: string) => void; colorMap?: Record<string, string> }) {
  const cls = colorMap ? (colorMap[value] ?? "bg-[#f4f4f4] text-[#525252]") : "";
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none text-[11px] font-semibold border-0 outline-none cursor-pointer px-2 py-1 pr-5 ${cls || "bg-transparent text-[#161616]"}`}
      >
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-0.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
    </div>
  );
}

function YesNoCell({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 justify-center">
      {["Yes", "No"].map((v) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`text-[10px] font-bold px-2 py-0.5 border transition-colors ${value === v ? (v === "Yes" ? "bg-[#10b981] text-white border-[#10b981]" : "bg-[#da1e28] text-white border-[#da1e28]") : "bg-white text-[#525252] border-[#e0e0e0] hover:border-[#86bc25]"}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

function ScoreCell({ value, labels, onChange }: { value: number; labels: Record<number, string>; onChange: (v: number) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full appearance-none text-[11px] font-semibold bg-transparent border-0 outline-none cursor-pointer px-1 py-0.5 pr-4"
      >
        {SCORE_RANGE.map((n) => <option key={n} value={n}>{n === 0 ? "—" : `${n} — ${labels[n]}`}</option>)}
      </select>
      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
    </div>
  );
}

const BLANK_ITEM = (): Omit<SRROItem, "id"> => ({
  ref: "", source: "Value chain assessment", title: "", description: "", type: "Risk",
  valueChainStage: "Core", financialImpact: "", strategicImpact: "", operationalImpact: "",
  timeHorizon: "Medium", likelihood: 0, magnitude: 0, neededByPrimaryUser: "", includeInFinalList: "", srroCrro: "SRRO",
});

export default function SRRORegister() {
  const navigate = useNavigate();
  const { srroItems, setSrroItems, addSrroItem, updateSrroItem, removeSrroItem } = useSustainabilityStore(
    useShallow((s) => ({ srroItems: s.srroItems, setSrroItems: s.setSrroItems, addSrroItem: s.addSrroItem, updateSrroItem: s.updateSrroItem, removeSrroItem: s.removeSrroItem })),
  );

  // Seed initial data on first load
  useEffect(() => {
    if (srroItems.length === 0) setSrroItems(PHASE3_INITIAL_DATA);
  }, []);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStage, setFilterStage] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [filterList, setFilterList] = useState("All");
  const [activeTab, setActiveTab] = useState<"register" | "finalList">("register");
  const [addModal, setAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState(BLANK_ITEM());
  const [saved, setSaved] = useState(false);

  const stats = useMemo(() => ({
    total: srroItems.length,
    risks: srroItems.filter((i) => i.type === "Risk").length,
    opps: srroItems.filter((i) => i.type === "Opportunity").length,
    inFinalList: srroItems.filter((i) => i.includeInFinalList === "Yes").length,
  }), [srroItems]);

  const filtered = useMemo(() => {
    return srroItems.filter((item) => {
      if (activeTab === "finalList" && item.includeInFinalList !== "Yes") return false;
      if (filterType !== "All" && item.type !== filterType) return false;
      if (filterStage !== "All" && item.valueChainStage !== filterStage) return false;
      if (filterSource !== "All" && item.source !== filterSource) return false;
      if (filterList !== "All") {
        if (filterList === "Yes" && item.includeInFinalList !== "Yes") return false;
        if (filterList === "No" && item.includeInFinalList === "Yes") return false;
      }
      if (search) {
        const s = search.toLowerCase();
        return item.title.toLowerCase().includes(s) || item.ref.includes(s) || item.description.toLowerCase().includes(s);
      }
      return true;
    });
  }, [srroItems, activeTab, filterType, filterStage, filterSource, filterList, search]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleAddItem = () => {
    if (!newItem.title) return;
    const nextRef = String(srroItems.length + 1).padStart(3, "0");
    addSrroItem({ ...newItem, id: `p3-custom-${Date.now()}`, ref: newItem.ref || nextRef });
    setNewItem(BLANK_ITEM());
    setAddModal(false);
  };

  return (
    <div className="min-h-full bg-[#f4f4f4] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e0e0e0] px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-[#86bc25]" />
              <span className="text-[#86bc25] font-bold text-[10px] tracking-widest uppercase">Phase 3</span>
            </div>
            <h1 className="text-[22px] font-semibold text-[#161616]">SRRO Identification Register</h1>
            <p className="text-[13px] text-[#525252] mt-1 max-w-2xl">
              Identify and validate sustainability-related risks and opportunities that could reasonably be expected to affect the entity's prospects.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setAddModal(true)} className="flex items-center gap-2 bg-[#86bc25] text-white px-4 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors">
              <Plus className="w-4 h-4" /> Add SRRO
            </button>
            <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"}`}>
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] mt-6">
          {[
            { label: "Total SRROs", value: stats.total, color: "text-[#161616]" },
            { label: "Risks", value: stats.risks, color: "text-[#da1e28]" },
            { label: "Opportunities", value: stats.opps, color: "text-[#10b981]" },
            { label: "In Final List", value: stats.inFinalList, color: "text-[#86bc25]" },
          ].map((k) => (
            <div key={k.label} className="bg-white px-6 py-4 text-center">
              <p className="text-[11px] uppercase font-semibold text-[#525252] mb-1">{k.label}</p>
              <p className={`text-[28px] font-light ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mt-5 border-b border-[#e0e0e0] -mb-px">
          {[{ id: "register", label: "Full SRRO Register" }, { id: "finalList", label: `Final List (${stats.inFinalList})` }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${activeTab === tab.id ? "border-[#86bc25] text-[#161616]" : "border-transparent text-[#525252] hover:text-[#161616]"}`}
            >{tab.label}</button>
          ))}
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5 bg-white border border-[#e0e0e0] p-4">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-[#525252]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ref, title, description…" className="flex-1 text-[13px] outline-none bg-transparent text-[#161616]" />
            {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-[#525252]" /></button>}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#525252]" />
            {[
              { label: "Type", value: filterType, opts: ["All", "Risk", "Opportunity"], onChange: setFilterType },
              { label: "Stage", value: filterStage, opts: ["All", ...STAGE_OPTS], onChange: setFilterStage },
              { label: "Source", value: filterSource, opts: ["All", ...SOURCES], onChange: setFilterSource },
              { label: "Final List", value: filterList, opts: ["All", "Yes", "No"], onChange: setFilterList },
            ].map((f) => (
              <div key={f.label} className="relative">
                <select value={f.value} onChange={(e) => f.onChange(e.target.value)} className="appearance-none text-[12px] bg-[#f4f4f4] border border-[#e0e0e0] px-3 py-1.5 pr-7 outline-none cursor-pointer font-semibold text-[#161616]">
                  {f.opts.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-[#525252]" />
              </div>
            ))}
            <span className="text-[12px] text-[#525252]">{filtered.length} items</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-[#e0e0e0] overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: 1400 }}>
            <thead>
              <tr className="bg-[#f4f4f4] text-[#525252] text-[10px] uppercase tracking-wide">
                <th className="px-3 py-3 w-14 sticky left-0 bg-[#f4f4f4] z-10">Ref</th>
                <th className="px-3 py-3 w-36">Source</th>
                <th className="px-3 py-3 min-w-[200px]">Title</th>
                <th className="px-3 py-3 w-16 text-center">Type</th>
                <th className="px-3 py-3 w-24 text-center">Stage</th>
                <th className="px-3 py-3 w-14 text-center">Fin.</th>
                <th className="px-3 py-3 w-14 text-center">Str.</th>
                <th className="px-3 py-3 w-14 text-center">Ops.</th>
                <th className="px-3 py-3 w-20">Horizon</th>
                <th className="px-3 py-3 w-28">Likelihood</th>
                <th className="px-3 py-3 w-28">Magnitude</th>
                <th className="px-3 py-3 w-14 text-center">Score</th>
                <th className="px-3 py-3 w-20 text-center">Needed</th>
                <th className="px-3 py-3 w-20 text-center">Final List</th>
                <th className="px-3 py-3 w-16 text-center">SRRO</th>
                <th className="px-3 py-3 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const score = riskScore(item.likelihood, item.magnitude);
                return (
                  <tr key={item.id} className={`border-t border-[#e0e0e0] hover:bg-[#fafafa] transition-colors ${idx % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}>
                    <td className="px-3 py-2 text-[12px] font-bold text-[#86bc25] sticky left-0 bg-inherit z-10">{item.ref}</td>
                    <td className="px-3 py-2 text-[11px] text-[#525252]">
                      <SelectCell value={item.source} options={SOURCES} onChange={(v) => updateSrroItem(item.id, { source: v })} />
                    </td>
                    <td className="px-3 py-2">
                      <input value={item.title} onChange={(e) => updateSrroItem(item.id, { title: e.target.value })}
                        className="w-full text-[12px] font-semibold text-[#161616] bg-transparent border-b border-transparent hover:border-[#86bc25]/40 focus:border-[#86bc25] outline-none py-0.5" />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 ${item.type === "Risk" ? "bg-[#fff1f1] text-[#da1e28]" : "bg-[#f0fdf4] text-[#10b981]"}`}>
                        {item.type === "Risk" ? <AlertTriangle className="w-3 h-3 inline" /> : <TrendingUp className="w-3 h-3 inline" />}
                        <select value={item.type} onChange={(e) => updateSrroItem(item.id, { type: e.target.value as "Risk" | "Opportunity" })}
                          className="ml-0.5 appearance-none bg-transparent border-0 outline-none text-[10px] font-bold cursor-pointer w-16">
                          <option>Risk</option><option>Opportunity</option>
                        </select>
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <SelectCell value={item.valueChainStage} options={STAGE_OPTS} onChange={(v) => updateSrroItem(item.id, { valueChainStage: v as SRROItem["valueChainStage"] })}
                        colorMap={{ Upstream: "bg-[#dbeafe] text-[#1d4ed8]", Core: "bg-[#f4fadc] text-[#435e12]", Downstream: "bg-[#fef3c7] text-[#92400e]" }} />
                    </td>
                    <td className="px-2 py-2"><YesNoCell value={item.financialImpact} onChange={(v) => updateSrroItem(item.id, { financialImpact: v as "Yes" | "No" })} /></td>
                    <td className="px-2 py-2"><YesNoCell value={item.strategicImpact} onChange={(v) => updateSrroItem(item.id, { strategicImpact: v as "Yes" | "No" })} /></td>
                    <td className="px-2 py-2"><YesNoCell value={item.operationalImpact} onChange={(v) => updateSrroItem(item.id, { operationalImpact: v as "Yes" | "No" })} /></td>
                    <td className="px-2 py-2">
                      <SelectCell value={item.timeHorizon} options={HORIZON_OPTS} onChange={(v) => updateSrroItem(item.id, { timeHorizon: v as SRROItem["timeHorizon"] })} />
                    </td>
                    <td className="px-2 py-2">
                      <ScoreCell value={item.likelihood} labels={LIKELIHOOD_LABELS} onChange={(v) => updateSrroItem(item.id, { likelihood: v })} />
                    </td>
                    <td className="px-2 py-2">
                      <ScoreCell value={item.magnitude} labels={MAGNITUDE_LABELS} onChange={(v) => updateSrroItem(item.id, { magnitude: v })} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${scoreColor(score)}`}>{score || "—"}</span>
                    </td>
                    <td className="px-2 py-2"><YesNoCell value={item.neededByPrimaryUser} onChange={(v) => updateSrroItem(item.id, { neededByPrimaryUser: v as "Yes" | "No" })} /></td>
                    <td className="px-2 py-2"><YesNoCell value={item.includeInFinalList} onChange={(v) => updateSrroItem(item.id, { includeInFinalList: v as "Yes" | "No" })} /></td>
                    <td className="px-2 py-2 text-center">
                      <SelectCell value={item.srroCrro} options={["SRRO", "CRRO"]} onChange={(v) => updateSrroItem(item.id, { srroCrro: v as "SRRO" | "CRRO" })}
                        colorMap={{ SRRO: "bg-[#f4f4f4] text-[#525252]", CRRO: "bg-[#dbeafe] text-[#1d4ed8]" }} />
                    </td>
                    <td className="px-2 py-2 text-center">
                      <button onClick={() => setDeleteId(item.id)} className="p-1 hover:bg-[#fff1f1] hover:text-[#da1e28] text-[#525252] transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6">
          <button onClick={() => navigate("/sustainability/material-information")} className="flex items-center gap-2 bg-[#86bc25] text-white px-6 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors">
            Proceed to Phase 4 — Material Information <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Modal */}
      {addModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161616]/60 p-4">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto border border-[#e0e0e0] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4]">
              <h3 className="text-[15px] font-semibold text-[#161616]">Add New SRRO</h3>
              <button onClick={() => setAddModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: "Ref", key: "ref", placeholder: "e.g. 086" },
                { label: "Source", key: "source", isSelect: true, opts: SOURCES },
                { label: "Title", key: "title", placeholder: "SRRO title", full: true },
                { label: "Type", key: "type", isSelect: true, opts: ["Risk", "Opportunity"] },
                { label: "Stage", key: "valueChainStage", isSelect: true, opts: ["Upstream", "Core", "Downstream"] },
                { label: "Time Horizon", key: "timeHorizon", isSelect: true, opts: ["Short", "Medium", "Long"] },
                { label: "SRRO/CRRO", key: "srroCrro", isSelect: true, opts: ["SRRO", "CRRO"] },
              ].map((f) => (
                <div key={f.key} className={f.full ? "col-span-2" : ""}>
                  <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">{f.label}</label>
                  {f.isSelect ? (
                    <select value={(newItem as any)[f.key]} onChange={(e) => setNewItem((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full appearance-none bg-[#f4f4f4] border-b border-[#8d8d8d] text-[13px] px-3 py-2 outline-none cursor-pointer">
                      {f.opts!.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={(newItem as any)[f.key]} onChange={(e) => setNewItem((p) => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} className="w-full bg-[#f4f4f4] border-b border-[#8d8d8d] text-[13px] px-3 py-2 outline-none" />
                  )}
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Description</label>
                <textarea rows={3} value={newItem.description} onChange={(e) => setNewItem((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#f4f4f4] border border-[#e0e0e0] text-[13px] px-3 py-2 outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e0e0e0]">
              <button onClick={() => setAddModal(false)} className="px-4 py-2 border border-[#e0e0e0] text-[13px] font-semibold text-[#525252] hover:border-[#da1e28] hover:text-[#da1e28] transition-colors">Cancel</button>
              <button onClick={handleAddItem} className="px-4 py-2 bg-[#86bc25] text-white text-[13px] font-semibold hover:bg-[#70a31d] transition-colors flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Add SRRO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#161616]/60 p-4">
          <div className="bg-white border border-[#e0e0e0] p-6 max-w-sm w-full shadow-xl">
            <p className="text-[15px] font-semibold text-[#161616] mb-2">Remove SRRO?</p>
            <p className="text-[13px] text-[#525252] mb-5">This will permanently remove this item from the register.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2 border border-[#e0e0e0] text-[13px] font-semibold hover:border-[#86bc25] transition-colors">Cancel</button>
              <button onClick={() => { removeSrroItem(deleteId); setDeleteId(null); }} className="flex-1 py-2 bg-[#da1e28] text-white text-[13px] font-semibold hover:bg-[#b91c1c] transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
