import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Trash2,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  X,
  ChevronDown,
  AlertTriangle,
  TrendingUp,
  Save,
  Pencil,
  Info,
  MessageSquare,
  Eye,
  Building2,
  Sparkles,
  Loader2,
  Database,
} from "lucide-react";
import { useSustainabilityStore, type SRROItem } from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import { PHASE3_INITIAL_DATA } from "@/config/phase3InitialData";
import ApprovalPanel from "../components/ApprovalPanel";
import { useScenarioStore } from "@/store/scenarioStore";
import { getSectorById } from "@/features/scenario-analysis/data/sectorConfig";
import { generateSrroItems } from "@/services/srroApi";

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
  const next = value === "Yes" ? "No" : "Yes";
  return (
    <button
      onClick={() => onChange(next)}
      title={`Click to toggle (${value || "unset"})`}
      className={`w-full text-[10px] font-bold py-1 transition-colors block ${
        value === "Yes" ? "bg-[#10b981] text-white" :
        value === "No" ? "bg-[#da1e28] text-white" :
        "bg-[#f4f4f4] text-[#8d8d8d] border border-[#e0e0e0]"
      }`}
    >
      {value || "—"}
    </button>
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

// Static badge for client read-only view
function YesNoBadge({ value }: { value: string }) {
  return (
    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 ${
      value === "Yes" ? "bg-[#10b981] text-white" :
      value === "No" ? "bg-[#da1e28] text-white" :
      "bg-[#f4f4f4] text-[#8d8d8d]"
    }`}>
      {value || "—"}
    </span>
  );
}

const BLANK_ITEM = (): Omit<SRROItem, "id"> => ({
  ref: "", source: "Value chain assessment", title: "", description: "", type: "Risk",
  valueChainStage: "Core", financialImpact: "", strategicImpact: "", operationalImpact: "",
  timeHorizon: "Medium", likelihood: 0, magnitude: 0, neededByPrimaryUser: "", includeInFinalList: "", srroCrro: "SRRO",
  clientNote: "",
});

export default function SRRORegister() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isClient = user?.role === UserRole.CLIENT;

  const {
    srroItems, setSrroItems, addSrroItem, updateSrroItem, removeSrroItem,
    srroApproval, submitSrroForReview, approveSrro, rejectSrro, resetSrroApproval,
    isGroupAssessment, groupName, assessmentEntities, activeEntityId, entitySnapshots, switchActiveEntity,
    governanceAssessment, valueChain,
  } = useSustainabilityStore(
    useShallow((s) => ({
      srroItems: s.srroItems, setSrroItems: s.setSrroItems, addSrroItem: s.addSrroItem,
      updateSrroItem: s.updateSrroItem, removeSrroItem: s.removeSrroItem,
      srroApproval: s.srroApproval, submitSrroForReview: s.submitSrroForReview,
      approveSrro: s.approveSrro, rejectSrro: s.rejectSrro, resetSrroApproval: s.resetSrroApproval,
      isGroupAssessment: s.isGroupAssessment, groupName: s.groupName,
      assessmentEntities: s.assessmentEntities, activeEntityId: s.activeEntityId,
      entitySnapshots: s.entitySnapshots, switchActiveEntity: s.switchActiveEntity,
      governanceAssessment: s.governanceAssessment,
      valueChain: s.valueChain,
    })),
  );

  // For admin: table is locked when under review / approved
  // For client: table is always locked (read-only) except the client note column
  const isLocked = srroApproval.status === "submitted" || srroApproval.status === "approved";
  const selectedSectorId = useScenarioStore((s) => s.selectedSectorId);

  useEffect(() => {
    if (srroItems.length === 0) setSrroItems(PHASE3_INITIAL_DATA);
  }, []);


  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterStage, setFilterStage] = useState("All");
  const [filterSource, setFilterSource] = useState("All");
  const [filterList, setFilterList] = useState("All");
  const [filterSrroCrro, setFilterSrroCrro] = useState("All");
  const [activeTab, setActiveTab] = useState<"register" | "finalList">("register");
  const [modal, setModal] = useState<{ open: boolean; mode: "add" | "edit"; editId?: string }>({ open: false, mode: "add" });
  const [formItem, setFormItem] = useState(BLANK_ITEM());
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const openAdd = () => { setFormItem(BLANK_ITEM()); setModal({ open: true, mode: "add" }); };
  const openEdit = (item: SRROItem) => {
    setFormItem({
      ref: item.ref, source: item.source, title: item.title, description: item.description,
      type: item.type, valueChainStage: item.valueChainStage, financialImpact: item.financialImpact,
      strategicImpact: item.strategicImpact, operationalImpact: item.operationalImpact,
      timeHorizon: item.timeHorizon, likelihood: item.likelihood, magnitude: item.magnitude,
      neededByPrimaryUser: item.neededByPrimaryUser, includeInFinalList: item.includeInFinalList,
      srroCrro: item.srroCrro, clientNote: item.clientNote ?? "",
    });
    setModal({ open: true, mode: "edit", editId: item.id });
  };
  const handleModalSave = () => {
    if (!formItem.title) return;
    if (modal.mode === "edit" && modal.editId) {
      updateSrroItem(modal.editId, formItem);
    } else {
      const nextRef = String(srroItems.length + 1).padStart(3, "0");
      addSrroItem({ ...formItem, id: `p3-custom-${Date.now()}`, ref: formItem.ref || nextRef });
    }
    setModal({ open: false, mode: "add" });
  };

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
      if (filterSrroCrro !== "All" && item.srroCrro !== filterSrroCrro) return false;
      if (filterList !== "All") {
        if (filterList === "Yes" && item.includeInFinalList !== "Yes") return false;
        if (filterList === "No" && item.includeInFinalList === "Yes") return false;
      }
      if (search) {
        const s = search.toLowerCase();
        return item.title.toLowerCase().includes(s) || item.ref.toLowerCase().includes(s) || item.description.toLowerCase().includes(s);
      }
      return true;
    });
  }, [srroItems, activeTab, filterType, filterStage, filterSource, filterSrroCrro, filterList, search]);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleGenerateWithAI = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const sectorFallback = getSectorById(selectedSectorId ?? "");
      const payload = {
        entityProfile: {
          clientName: governanceAssessment.clientName || "Unknown entity",
          sector: governanceAssessment.sector || (sectorFallback?.name ?? selectedSectorId ?? "Unknown sector"),
          subSector: sectorFallback?.subSectors[0] ?? "",
          geography: governanceAssessment.geography || "",
        },
        valueChainResponses: valueChain.questionnaireResponses ?? {},
        businessModelContext: {
          description: valueChain.businessModelDescription ?? "",
          keyProductsServices: valueChain.keyProductsServices ?? "",
          keyMarketsRegions: valueChain.keyMarketsRegions ?? "",
        },
        activities: (valueChain.activities ?? []).map((a) => ({
          stage: a.stage,
          activity: a.activity,
          description: a.description,
          keyInputs: a.keyInputs,
          keyOutputs: a.keyOutputs,
        })),
        resources: (valueChain.resources ?? []).map((r) => ({
          vendor: r.vendor,
          stage: r.valueChainStage,
          capitalType: r.capitalType,
          type: r.resourceRelationship,
          dependencyImpact: r.dependencyImpact,
          riskOpportunity: r.riskOpportunity,
          description: r.description,
        })),
        existingRefs: srroItems.map((i) => i.ref),
      };
      const newItems = await generateSrroItems(payload);
      const existingRefs = new Set(srroItems.map((i) => i.ref));
      const toAdd = newItems.filter((item) => !existingRefs.has(item.ref));
      toAdd.forEach((item) => addSrroItem(item));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setAiLoading(false);
    }
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
            <h1 className="text-[22px] font-semibold text-[#161616]">SRRO/CRRO Identification Register</h1>
            <p className="text-[13px] text-[#525252] mt-1 max-w-2xl">
              {isClient
                ? "Review the sustainability-related risks and opportunities identified for your organisation. Add your notes to each item using the Client Note column."
                : "Identify and validate sustainability-related risks and opportunities that could reasonably be expected to affect the entity's prospects."
              }
            </p>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-[11px] text-[#525252]">
                <span className="inline-flex items-center px-2 py-0.5 bg-[#f4f4f4] border border-[#e0e0e0] text-[10px] font-bold text-[#525252] tracking-wide">SRRO</span>
                Sustainability-Related Risks &amp; Opportunities
              </span>
              <span className="text-[#e0e0e0]">·</span>
              <span className="flex items-center gap-1.5 text-[11px] text-[#525252]">
                <span className="inline-flex items-center px-2 py-0.5 bg-[#dbeafe] border border-[#93c5fd] text-[10px] font-bold text-[#1d4ed8] tracking-wide">CRRO</span>
                Climate-Related Risks &amp; Opportunities
              </span>
              {srroItems.length === 0 && !isLocked && (
                <button
                  onClick={() => setSrroItems(PHASE3_INITIAL_DATA)}
                  className="flex items-center gap-1.5 px-3 py-1 border border-[#e0e0e0] text-[11px] text-[#525252] hover:border-[#86bc25] transition-colors"
                >
                  <Database className="w-3 h-3" />
                  Load sample data
                </button>
              )}
            </div>
          </div>
          {/* Action buttons — hidden for client */}
          {!isClient && (
            <div className="flex gap-2">
              <button onClick={openAdd} disabled={isLocked} className={`flex items-center gap-2 bg-[#86bc25] text-white px-4 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors ${isLocked ? "opacity-40 cursor-not-allowed" : ""}`}>
                <Plus className="w-4 h-4" /> Add SRRO
              </button>
              <button
                onClick={handleGenerateWithAI}
                disabled={isLocked || aiLoading}
                className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-[#161616] text-white hover:bg-[#86bc25] transition-colors ${(isLocked || aiLoading) ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {aiLoading ? "Generating..." : "Generate with AI"}
              </button>
              <button onClick={handleSave} disabled={isLocked} className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"} ${isLocked ? "opacity-40 cursor-not-allowed" : ""}`}>
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Saved" : "Save"}
              </button>
            </div>
          )}
          {/* Client save notes button */}
          {isClient && (
            <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"}`}>
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Notes Saved" : "Save Notes"}
            </button>
          )}
        </div>

        {/* Client read-only banner */}
        {isClient && (
          <div className="flex items-start gap-3 bg-[#fffbeb] border border-[#f59e0b]/30 px-4 py-3 mt-4">
            <Eye className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-[#92400e]">View Only — Client Note Column is Editable</p>
              <p className="text-[12px] text-[#525252] mt-0.5">
                All register fields are read-only. Use the <strong>Client Note</strong> column to add your perspective, context, or queries on each risk or opportunity.
              </p>
            </div>
          </div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] mt-6">
          {[
            { label: "Total SRRO/CRROs", value: stats.total, color: "text-[#161616]" },
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
          {[{ id: "register", label: "Full SRRO/CRRO Register" }, { id: "finalList", label: `Final List (${stats.inFinalList})` }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-5 py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${activeTab === tab.id ? "border-[#86bc25] text-[#161616]" : "border-transparent text-[#525252] hover:text-[#161616]"}`}
            >{tab.label}</button>
          ))}
        </div>
      </div>

      {/* ── Entity Switcher Banner ── */}
      {isGroupAssessment && assessmentEntities.length > 0 && (
        <div className="bg-[#f0f7e0] border-b border-[#86bc25]/40 px-8 py-3">
          <div className="max-w-5xl mx-auto flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#435e12] uppercase tracking-wider shrink-0">
              <Building2 className="w-3.5 h-3.5" />
              Group Assessment
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => switchActiveEntity("parent")}
                className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 border transition-colors ${activeEntityId === "parent" ? "bg-[#86bc25] text-white border-[#86bc25]" : "bg-white text-[#525252] border-[#e0e0e0] hover:border-[#86bc25] hover:text-[#435e12]"}`}
              >
                {groupName || "Parent Entity"}
                {activeEntityId === "parent" && <span className="w-1.5 h-1.5 rounded-full bg-white/80 inline-block" />}
              </button>
              {assessmentEntities.map((entity) => {
                const snap = entitySnapshots[entity.id];
                const isActive = activeEntityId === entity.id;
                const hasData = snap && (Object.keys(snap.governanceAssessment?.questions ?? {}).length > 0 || snap.srroItems?.length > 0 || snap.phase4Entries?.length > 0);
                return (
                  <button
                    key={entity.id}
                    onClick={() => switchActiveEntity(entity.id)}
                    className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 border transition-colors ${isActive ? "bg-[#86bc25] text-white border-[#86bc25]" : "bg-white text-[#525252] border-[#e0e0e0] hover:border-[#86bc25] hover:text-[#435e12]"}`}
                  >
                    {entity.name}
                    {hasData && !isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#86bc25] inline-block" />}
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/80 inline-block" />}
                  </button>
                );
              })}
            </div>
            {activeEntityId !== "parent" && (
              <span className="text-[11px] text-[#525252] ml-auto shrink-0">
                Assessing: <strong className="text-[#161616]">{assessmentEntities.find((e) => e.id === activeEntityId)?.name}</strong> · {assessmentEntities.find((e) => e.id === activeEntityId)?.entityType}
              </span>
            )}
          </div>
        </div>
      )}

      {aiError && (
        <div className="mx-8 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {aiError}
        </div>
      )}

      <div className="px-6 py-6">
        {/* Filters */}
        <div className="flex flex-wrap items-end gap-4 mb-3 bg-white border border-[#e0e0e0] p-4">
          <div className="flex flex-col gap-0.5 flex-1 min-w-[180px]">
            <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wide">Search</span>
            <div className="flex items-center gap-2 border-b border-[#e0e0e0] pb-1">
              <Search className="w-3.5 h-3.5 text-[#525252]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search ref, title, description…" className="flex-1 text-[13px] outline-none bg-transparent text-[#161616]" />
              {search && <button onClick={() => setSearch("")}><X className="w-3.5 h-3.5 text-[#525252]" /></button>}
            </div>
          </div>
          <div className="w-px h-10 bg-[#e0e0e0] self-end" />
          <div className="flex items-end gap-3 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-[#525252] mb-2" />
            {[
              { label: "Type", value: filterType, opts: ["All", "Risk", "Opportunity"], onChange: setFilterType },
              { label: "Stage", value: filterStage, opts: ["All", ...STAGE_OPTS], onChange: setFilterStage },
              { label: "Source", value: filterSource, opts: ["All", ...SOURCES], onChange: setFilterSource },
              { label: "SRRO / CRRO", value: filterSrroCrro, opts: ["All", "SRRO", "CRRO"], onChange: setFilterSrroCrro },
              { label: "Final List", value: filterList, opts: ["All", "Yes", "No"], onChange: setFilterList },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-semibold text-[#525252] uppercase tracking-wide">{f.label}</span>
                <div className="relative">
                  <select value={f.value} onChange={(e) => f.onChange(e.target.value)} className="appearance-none text-[12px] bg-[#f4f4f4] border border-[#e0e0e0] px-3 py-1.5 pr-7 outline-none cursor-pointer font-semibold text-[#161616]">
                    {f.opts.map((o) => <option key={o}>{o}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-[#525252]" />
                </div>
              </div>
            ))}
          </div>
          <span className="text-[12px] text-[#525252] mb-1.5 ml-auto">{filtered.length} items</span>
        </div>

        {/* Formula info note */}
        <div className="flex items-start gap-2 bg-[#f0f4ff] border border-[#c7d7fb] px-4 py-2.5 mb-4 text-[11px] text-[#1e3a8a]">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#3b82f6]" />
          <div className="leading-relaxed">
            <span className="font-semibold">Risk Score</span> = Likelihood × Magnitude (scale 1–16; ≥12 Critical, ≥6 Medium, ≥3 Low).{" "}
            <span className="font-semibold">Financial / Strategic / Operational Impact</span> are manually assessed (Yes/No).{" "}
            <span className="font-semibold">Final List</span>: include when Score ≥ 6 <em>or</em> at least one impact type is Yes, <em>and</em> the item is needed by the primary user.
          </div>
        </div>

        {/* Table */}
        <div className={`bg-white border border-[#e0e0e0] overflow-x-auto ${(isLocked && !isClient) ? "pointer-events-none select-none opacity-70" : ""}`}>
          <table className="w-full text-left border-collapse" style={{ minWidth: isClient ? 1900 : 1760 }}>
            <thead>
              <tr className="bg-[#f4f4f4] text-[#525252] text-[10px] uppercase tracking-wide border-b border-[#e0e0e0]">
                <th className="px-3 py-3" style={{ minWidth: 52 }}>Ref</th>
                <th className="px-3 py-3" style={{ minWidth: 200 }}>Source</th>
                <th className="px-3 py-3" style={{ minWidth: 280 }}>Title &amp; Description</th>
                <th className="px-3 py-3 text-center" style={{ minWidth: 110 }}>Type</th>
                <th className="px-3 py-3 text-center" style={{ minWidth: 110 }}>Stage</th>
                <th className="px-2 py-3 text-center leading-tight" style={{ minWidth: 82 }}>Financial<br/>Impact</th>
                <th className="px-2 py-3 text-center leading-tight" style={{ minWidth: 82 }}>Strategic<br/>Impact</th>
                <th className="px-2 py-3 text-center leading-tight" style={{ minWidth: 90 }}>Operational<br/>Impact</th>
                <th className="px-3 py-3" style={{ minWidth: 90 }}>Horizon</th>
                <th className="px-3 py-3" style={{ minWidth: 140 }}>Likelihood</th>
                <th className="px-3 py-3" style={{ minWidth: 140 }}>Magnitude</th>
                <th className="px-3 py-3 text-center" style={{ minWidth: 66 }}>Score</th>
                <th className="px-3 py-3 text-center" style={{ minWidth: 78 }}>Needed</th>
                <th className="px-3 py-3 text-center leading-tight" style={{ minWidth: 78 }}>Final<br/>List</th>
                <th className="px-3 py-3 text-center" style={{ minWidth: 100 }}>SRRO/CRRO</th>
                {/* Client Note column — always shown */}
                <th className="px-3 py-3 bg-[#f4fadc]/60" style={{ minWidth: 200 }}>
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3 h-3 text-[#86bc25]" />
                    <span>Client Note</span>
                    {isClient && <span className="text-[#86bc25] text-[9px] font-bold uppercase tracking-wider ml-1">Editable</span>}
                  </div>
                </th>
                {!isClient && <th className="px-3 py-3 text-center" style={{ minWidth: 72 }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => {
                const score = riskScore(item.likelihood, item.magnitude);
                const noteExpanded = expandedNoteId === item.id;
                return (
                  <tr key={item.id} className={`border-t border-[#e0e0e0] hover:bg-[#fafafa] transition-colors ${idx % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}>
                    <td className="px-3 py-2 text-[12px] font-bold text-[#86bc25]">{item.ref}</td>

                    {/* Source — static for client */}
                    <td className="px-3 py-2 text-[11px] text-[#525252]">
                      {isClient
                        ? <span className="text-[11px] text-[#525252]">{item.source}</span>
                        : <SelectCell value={item.source} options={SOURCES} onChange={(v) => updateSrroItem(item.id, { source: v })} />
                      }
                    </td>

                    {/* Title & Description */}
                    <td className="px-3 py-2">
                      <p className="text-[12px] font-semibold text-[#161616] whitespace-nowrap overflow-hidden text-ellipsis">{item.title}</p>
                      {item.description && (
                        <p className="text-[11px] text-[#525252] leading-snug mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                    </td>

                    {/* Type — static for client */}
                    <td className="px-2 py-2 text-center">
                      {isClient ? (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 ${item.type === "Risk" ? "bg-[#fff1f1] text-[#da1e28]" : "bg-[#f0fdf4] text-[#10b981]"}`}>
                          {item.type === "Risk" ? <AlertTriangle className="w-3 h-3 inline mr-0.5" /> : <TrendingUp className="w-3 h-3 inline mr-0.5" />}
                          {item.type}
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 ${item.type === "Risk" ? "bg-[#fff1f1] text-[#da1e28]" : "bg-[#f0fdf4] text-[#10b981]"}`}>
                          {item.type === "Risk" ? <AlertTriangle className="w-3 h-3 inline" /> : <TrendingUp className="w-3 h-3 inline" />}
                          <select value={item.type} onChange={(e) => updateSrroItem(item.id, { type: e.target.value as "Risk" | "Opportunity" })}
                            className="ml-0.5 appearance-none bg-transparent border-0 outline-none text-[10px] font-bold cursor-pointer w-16">
                            <option>Risk</option><option>Opportunity</option>
                          </select>
                        </span>
                      )}
                    </td>

                    {/* Stage */}
                    <td className="px-2 py-2">
                      {isClient ? (
                        <span className={`text-[11px] font-semibold px-2 py-0.5 ${
                          item.valueChainStage === "Upstream" ? "bg-[#dbeafe] text-[#1d4ed8]" :
                          item.valueChainStage === "Core" ? "bg-[#f4fadc] text-[#435e12]" :
                          item.valueChainStage === "Downstream" ? "bg-[#fef3c7] text-[#92400e]" : "text-[#525252]"
                        }`}>{item.valueChainStage || "—"}</span>
                      ) : (
                        <SelectCell value={item.valueChainStage} options={STAGE_OPTS} onChange={(v) => updateSrroItem(item.id, { valueChainStage: v as SRROItem["valueChainStage"] })}
                          colorMap={{ Upstream: "bg-[#dbeafe] text-[#1d4ed8]", Core: "bg-[#f4fadc] text-[#435e12]", Downstream: "bg-[#fef3c7] text-[#92400e]" }} />
                      )}
                    </td>

                    {/* Impact cells */}
                    <td className="px-2 py-2">{isClient ? <YesNoBadge value={item.financialImpact} /> : <YesNoCell value={item.financialImpact} onChange={(v) => updateSrroItem(item.id, { financialImpact: v as "Yes" | "No" })} />}</td>
                    <td className="px-2 py-2">{isClient ? <YesNoBadge value={item.strategicImpact} /> : <YesNoCell value={item.strategicImpact} onChange={(v) => updateSrroItem(item.id, { strategicImpact: v as "Yes" | "No" })} />}</td>
                    <td className="px-2 py-2">{isClient ? <YesNoBadge value={item.operationalImpact} /> : <YesNoCell value={item.operationalImpact} onChange={(v) => updateSrroItem(item.id, { operationalImpact: v as "Yes" | "No" })} />}</td>

                    {/* Horizon */}
                    <td className="px-2 py-2">
                      {isClient
                        ? <span className="text-[11px] text-[#161616] font-semibold">{item.timeHorizon || "—"}</span>
                        : <SelectCell value={item.timeHorizon} options={HORIZON_OPTS} onChange={(v) => updateSrroItem(item.id, { timeHorizon: v as SRROItem["timeHorizon"] })} />
                      }
                    </td>

                    {/* Likelihood */}
                    <td className="px-2 py-2">
                      {isClient
                        ? <span className="text-[11px] text-[#161616]">{item.likelihood === 0 ? "—" : `${item.likelihood} — ${LIKELIHOOD_LABELS[item.likelihood]}`}</span>
                        : <ScoreCell value={item.likelihood} labels={LIKELIHOOD_LABELS} onChange={(v) => updateSrroItem(item.id, { likelihood: v })} />
                      }
                    </td>

                    {/* Magnitude */}
                    <td className="px-2 py-2">
                      {isClient
                        ? <span className="text-[11px] text-[#161616]">{item.magnitude === 0 ? "—" : `${item.magnitude} — ${MAGNITUDE_LABELS[item.magnitude]}`}</span>
                        : <ScoreCell value={item.magnitude} labels={MAGNITUDE_LABELS} onChange={(v) => updateSrroItem(item.id, { magnitude: v })} />
                      }
                    </td>

                    {/* Score */}
                    <td className="px-2 py-2 text-center">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${scoreColor(score)}`}>{score || "—"}</span>
                    </td>

                    {/* Needed */}
                    <td className="px-2 py-2">{isClient ? <YesNoBadge value={item.neededByPrimaryUser} /> : <YesNoCell value={item.neededByPrimaryUser} onChange={(v) => updateSrroItem(item.id, { neededByPrimaryUser: v as "Yes" | "No" })} />}</td>

                    {/* Final List */}
                    <td className="px-2 py-2">{isClient ? <YesNoBadge value={item.includeInFinalList} /> : <YesNoCell value={item.includeInFinalList} onChange={(v) => updateSrroItem(item.id, { includeInFinalList: v as "Yes" | "No" })} />}</td>

                    {/* SRRO/CRRO */}
                    <td className="px-2 py-2 text-center">
                      {isClient ? (
                        <span className={`text-[10px] font-bold px-2 py-0.5 ${item.srroCrro === "CRRO" ? "bg-[#dbeafe] text-[#1d4ed8]" : "bg-[#f4f4f4] text-[#525252]"}`}>
                          {item.srroCrro || "—"}
                        </span>
                      ) : (
                        <SelectCell value={item.srroCrro} options={["SRRO", "CRRO"]} onChange={(v) => updateSrroItem(item.id, { srroCrro: v as "SRRO" | "CRRO" })}
                          colorMap={{ SRRO: "bg-[#f4f4f4] text-[#525252]", CRRO: "bg-[#dbeafe] text-[#1d4ed8]" }} />
                      )}
                    </td>

                    {/* ── Client Note column ── */}
                    <td className="px-3 py-2 bg-[#f4fadc]/30 border-l border-[#86bc25]/20" style={{ minWidth: 200 }}>
                      {isClient ? (
                        // Editable for client
                        <div>
                          <textarea
                            rows={noteExpanded ? 4 : 2}
                            value={item.clientNote ?? ""}
                            onChange={(e) => updateSrroItem(item.id, { clientNote: e.target.value })}
                            onFocus={() => setExpandedNoteId(item.id)}
                            onBlur={() => setExpandedNoteId(null)}
                            placeholder="Add your note or comment…"
                            className="w-full text-[11px] text-[#161616] bg-white border border-[#86bc25]/40 focus:border-[#86bc25] outline-none px-2 py-1.5 resize-none transition-all placeholder:text-[#8d8d8d]"
                          />
                        </div>
                      ) : (
                        // Read-only for admin — show client note with distinct styling
                        item.clientNote ? (
                          <div className="flex items-start gap-1.5">
                            <MessageSquare className="w-3 h-3 text-[#86bc25] shrink-0 mt-0.5" />
                            <p className="text-[11px] text-[#161616] leading-relaxed">{item.clientNote}</p>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#8d8d8d] italic">No note added</span>
                        )
                      )}
                    </td>

                    {/* Actions — hidden for client */}
                    {!isClient && (
                      <td className="px-2 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => openEdit(item)} className="p-1 hover:bg-[#f4fadc] hover:text-[#86bc25] text-[#525252] transition-colors" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteId(item.id)} className="p-1 hover:bg-[#fff1f1] hover:text-[#da1e28] text-[#525252] transition-colors" title="Remove">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Approval Panel — shown in Final List tab for both roles */}
        {activeTab === "finalList" && (
          <div className="mt-6">
            {isClient ? (
              // Client sees a read-only view of the review status
              <ApprovalPanel
                approval={srroApproval}
                phase="srro"
                title="SRRO/CRRO Final List — Review Status"
                subtitle="Review outcome from the Deloitte team."
                itemCount={stats.inFinalList}
                itemLabel="items in Final List"
                isLocked={isLocked}
                onSubmit={() => {}}
                onApprove={() => {}}
                onReject={() => {}}
                onReset={() => {}}
                clientView
              />
            ) : (
              // Admin sees the full approval workflow
              <ApprovalPanel
                approval={srroApproval}
                phase="srro"
                title="SRRO/CRRO Final List — Review & Approval"
                subtitle="Submit the Final List for independent review before proceeding to Phase 4."
                itemCount={stats.inFinalList}
                itemLabel="items in Final List"
                isLocked={isLocked}
                onSubmit={submitSrroForReview}
                onApprove={approveSrro}
                onReject={rejectSrro}
                onReset={resetSrroApproval}
              />
            )}
          </div>
        )}

        {/* Proceed button — hidden for client */}
        {!isClient && (
          <div className="flex justify-end mt-6">
            <button
              onClick={() => navigate("/sustainability/material-information")}
              disabled={srroApproval.status !== "approved"}
              title={srroApproval.status !== "approved" ? "Final List must be approved before proceeding" : ""}
              className={`flex items-center gap-2 bg-[#86bc25] text-white px-6 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors ${srroApproval.status !== "approved" ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              Proceed to Phase 4 — Material Information <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Modal — admin only */}
      {!isClient && modal.open && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#161616]/60 p-4">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto border border-[#e0e0e0] shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4]">
              <h3 className="text-[15px] font-semibold text-[#161616]">
                {modal.mode === "edit" ? "Edit SRRO" : "Add New SRRO"}
              </h3>
              <button onClick={() => setModal({ open: false, mode: "add" })}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              {[
                { label: "Ref", key: "ref" as const, placeholder: "e.g. 086" },
                { label: "Source", key: "source" as const, isSelect: true, opts: SOURCES },
                { label: "Title", key: "title" as const, placeholder: "SRRO title", full: true },
                { label: "Type", key: "type" as const, isSelect: true, opts: ["Risk", "Opportunity"] },
                { label: "Stage", key: "valueChainStage" as const, isSelect: true, opts: ["Upstream", "Core", "Downstream"] },
                { label: "Time Horizon", key: "timeHorizon" as const, isSelect: true, opts: ["Short", "Medium", "Long"] },
                { label: "SRRO/CRRO", key: "srroCrro" as const, isSelect: true, opts: ["SRRO", "CRRO"] },
              ].map((f) => (
                <div key={f.key} className={f.full ? "col-span-2" : ""}>
                  <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">{f.label}</label>
                  {f.isSelect ? (
                    <select value={String(formItem[f.key])} onChange={(e) => setFormItem((p) => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full appearance-none bg-[#f4f4f4] border-b border-[#8d8d8d] text-[13px] px-3 py-2 outline-none cursor-pointer">
                      {f.opts!.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input value={String(formItem[f.key])} onChange={(e) => setFormItem((p) => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder} className="w-full bg-[#f4f4f4] border-b border-[#8d8d8d] text-[13px] px-3 py-2 outline-none" />
                  )}
                </div>
              ))}
              <div className="col-span-2">
                <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Description</label>
                <textarea rows={3} value={formItem.description} onChange={(e) => setFormItem((p) => ({ ...p, description: e.target.value }))}
                  className="w-full bg-[#f4f4f4] border border-[#e0e0e0] text-[13px] px-3 py-2 outline-none resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e0e0e0]">
              <button onClick={() => setModal({ open: false, mode: "add" })} className="px-4 py-2 border border-[#e0e0e0] text-[13px] font-semibold text-[#525252] hover:border-[#da1e28] hover:text-[#da1e28] transition-colors">Cancel</button>
              <button onClick={handleModalSave} disabled={!formItem.title} className="px-4 py-2 bg-[#86bc25] text-white text-[13px] font-semibold hover:bg-[#70a31d] disabled:opacity-40 transition-colors flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {modal.mode === "edit" ? "Save Changes" : "Add SRRO"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm — admin only */}
      {!isClient && deleteId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#161616]/60 p-4">
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
