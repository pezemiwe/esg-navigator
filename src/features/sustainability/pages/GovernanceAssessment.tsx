import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  FileText,
  Save,
  Lock,
  X,
  Plus,
  Building2,
  Users,
} from "lucide-react";
import {
  useSustainabilityStore,
  type GovernanceQuestion,
  type EntityType,
} from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import { useIndustry } from "@/hooks/useIndustry";

// ─── Static question bank ────────────────────────────────────────────────────
const QUESTION_BANK = [
  { ref: "L1", area: "Leadership", question: "Is there a clear sustainability vision or case for change from leadership?" },
  { ref: "L2", area: "Leadership", question: "Do leaders consistently support integration of sustainability into business decision-making?" },
  { ref: "L3", area: "Leadership", question: "Do compliance, finance and risk functions have a clear leadership mandate to integrate sustainability?" },
  { ref: "R1", area: "Roles and responsibilities", question: "Are sustainability roles and responsibilities clearly defined across functions?" },
  { ref: "R2", area: "Roles and responsibilities", question: "Do finance, risk and compliance teams understand their role in sustainability integration?" },
  { ref: "R3", area: "Roles and responsibilities", question: "Is the governance framework set up to support sustainability decision-making?" },
  { ref: "C1", area: "Competence / capability", question: "Is there adequate sustainability capability and resourcing across relevant functions?" },
  { ref: "C2", area: "Competence / capability", question: "Have sustainability-related competencies been identified for key teams?" },
  { ref: "C3", area: "Competence / capability", question: "Is relevant training provided to support sustainability integration?" },
  { ref: "W1", area: "Ways of working", question: "Are sustainability considerations integrated into ERM / risk processes?" },
  { ref: "W2", area: "Ways of working", question: "Are tools, data and processes available to assess sustainability-related risks and opportunities?" },
  { ref: "W3", area: "Ways of working", question: "Are sustainability considerations embedded into routine business and financial decision-making?" },
  { ref: "P1", area: "Performance management", question: "Are there sustainability targets or KPIs relevant to decision-making?" },
  { ref: "P2", area: "Performance management", question: "Are sustainability objectives reflected in individual or team performance management?" },
  { ref: "P3", area: "Performance management", question: "Are sustainability outcomes monitored and reported consistently?" },
  { ref: "T1", area: "Traceability", question: "Is there documented evidence of how sustainability-related risks and opportunities are identified?" },
  { ref: "T2", area: "Traceability", question: "Is there traceability from identification through assessment, response and reporting?" },
  { ref: "T3", area: "Traceability", question: "Does the current process generate information suitable for IFRS sustainability disclosure needs?" },
] as const;

const AREAS = [...new Set(QUESTION_BANK.map((q) => q.area))] as string[];

const SCORE_VALUES: Record<string, number> = {
  "No integration": 1,
  "Limited integration": 2,
  "Integrated": 3,
};

function scoreToColor(score: string) {
  if (score === "Integrated") return "text-[#10b981] bg-[#f0fdf4] border-[#10b981]/30";
  if (score === "Limited integration") return "text-[#f59e0b] bg-[#fffbeb] border-[#f59e0b]/30";
  if (score === "No integration") return "text-[#da1e28] bg-[#fff1f1] border-[#da1e28]/30";
  return "text-[#525252] bg-[#f4f4f4] border-[#e0e0e0]";
}

function integrationBadge(avg: number) {
  if (avg >= 2.5) return { label: "Integrated", color: "bg-[#10b981] text-white" };
  if (avg >= 1.5) return { label: "Limited integration", color: "bg-[#f59e0b] text-white" };
  return { label: "No integration", color: "bg-[#da1e28] text-white" };
}

function readinessBadge(avg: number) {
  if (avg >= 2.5) return { label: "High readiness", color: "text-[#10b981]" };
  if (avg >= 1.5) return { label: "Medium readiness", color: "text-[#f59e0b]" };
  return { label: "Low readiness", color: "text-[#da1e28]" };
}

function recommendedPath(avg: number) {
  if (avg >= 2.5) return "Strong governance foundations — focus on disclosure alignment and quantitative reporting.";
  if (avg >= 1.5) return "Partial foundations in place — strengthen integration of sustainability into risk and financial processes.";
  return "Proceed through all later phases with full build-out of methodology and higher reliance on external research / facilitated assessment.";
}

// ─── Field components ─────────────────────────────────────────────────────────
function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-[#525252] uppercase tracking-wide mb-1">
        {label}{required && <span className="text-[#da1e28] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#f4f4f4] border-b border-[#8d8d8d] focus:border-b-2 focus:border-[#86bc25] outline-none text-[14px] text-[#161616] px-3 py-2.5 transition-all"
    />
  );
}

function TextAreaInput({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[14px] text-[#161616] px-3 py-2.5 resize-none transition-all"
    />
  );
}

function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-[#f4f4f4] border-b border-[#8d8d8d] focus:border-b-2 focus:border-[#86bc25] outline-none text-[14px] text-[#161616] px-3 py-2.5 pr-8 cursor-pointer transition-all"
      >
        <option value="">— Select —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#525252] pointer-events-none" />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function GovernanceAssessment() {
  const navigate = useNavigate();
  const {
    governanceAssessment,
    updateGovernanceAssessment,
    updateGovernanceQuestion,
    isGroupAssessment,
    groupName,
    assessmentEntities,
    activeEntityId,
    entitySnapshots,
    setIsGroupAssessment,
    setGroupName,
    addAssessmentEntity,
    removeAssessmentEntity,
    switchActiveEntity,
  } = useSustainabilityStore(
    useShallow((s) => ({
      governanceAssessment: s.governanceAssessment,
      updateGovernanceAssessment: s.updateGovernanceAssessment,
      updateGovernanceQuestion: s.updateGovernanceQuestion,
      isGroupAssessment: s.isGroupAssessment,
      groupName: s.groupName,
      assessmentEntities: s.assessmentEntities,
      activeEntityId: s.activeEntityId,
      entitySnapshots: s.entitySnapshots,
      setIsGroupAssessment: s.setIsGroupAssessment,
      setGroupName: s.setGroupName,
      addAssessmentEntity: s.addAssessmentEntity,
      removeAssessmentEntity: s.removeAssessmentEntity,
      switchActiveEntity: s.switchActiveEntity,
    })),
  );

  const { isTailored, sectorId } = useIndustry();
  // Use the raw sector id to derive display name — industryName reads the fallback config's name.
  const sectorDisplayName = sectorId
    ? sectorId.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "This sector";

  const [expandedAreas, setExpandedAreas] = useState<Record<string, boolean>>(
    Object.fromEntries(AREAS.map((a) => [a, true])),
  );
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<"context" | "assessment" | "summary" | "conclusion">("context");
  const [newEntityName, setNewEntityName] = useState("");
  const [newEntityType, setNewEntityType] = useState<EntityType>("Subsidiary");
  const [newDocInput, setNewDocInput] = useState("");

  const addEntity = () => {
    if (!newEntityName.trim()) return;
    addAssessmentEntity({
      id: crypto.randomUUID(),
      name: newEntityName.trim(),
      entityType: newEntityType,
      relationshipType: newEntityType,
      parentId: null,
      sectorId: "",
      subSector: "",
    });
    setNewEntityName("");
  };

  const addDocument = () => {
    if (!newDocInput.trim()) return;
    const docs = governanceAssessment.documentsReviewed ?? [];
    if (!docs.includes(newDocInput.trim())) {
      updateGovernanceAssessment({ documentsReviewed: [...docs, newDocInput.trim()] });
    }
    setNewDocInput("");
  };

  const removeDocument = (doc: string) => {
    updateGovernanceAssessment({
      documentsReviewed: (governanceAssessment.documentsReviewed ?? []).filter((d) => d !== doc),
    });
  };

  const qa = governanceAssessment;

  // Auto-calculate scoring
  const scoring = useMemo(() => {
    const areaScores: Record<string, { total: number; count: number }> = {};
    AREAS.forEach((a) => (areaScores[a] = { total: 0, count: 0 }));

    QUESTION_BANK.forEach((q) => {
      const ans = qa.questions[q.ref];
      const sv = ans?.score ? SCORE_VALUES[ans.score] ?? 0 : 0;
      if (sv > 0) {
        areaScores[q.area].total += sv;
        areaScores[q.area].count += 1;
      }
    });

    const areaAverages = Object.fromEntries(
      Object.entries(areaScores).map(([area, { total, count }]) => [
        area,
        count > 0 ? total / count : 0,
      ]),
    );

    const allScores = QUESTION_BANK.map((q) => {
      const ans = qa.questions[q.ref];
      return ans?.score ? SCORE_VALUES[ans.score] ?? 0 : 0;
    }).filter((s) => s > 0);

    const overallAvg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;

    const gapCount = QUESTION_BANK.filter((q) => qa.questions[q.ref]?.gapIdentified === "Yes").length;
    const lowestArea = Object.entries(areaAverages).filter(([, v]) => v > 0).sort((a, b) => a[1] - b[1])[0]?.[0] ?? "—";
    const highestArea = Object.entries(areaAverages).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

    return { areaAverages, overallAvg, gapCount, lowestArea, highestArea };
  }, [qa.questions]);

  const qForRef = (ref: string): GovernanceQuestion => qa.questions[ref] ?? { ref, score: "", evidenceNotes: "", gapIdentified: "" };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sectionTabs = [
    { id: "context", label: "1. Engagement Context" },
    { id: "assessment", label: "2. Assessment Questions" },
    { id: "summary", label: "3. Scoring Summary" },
    { id: "conclusion", label: "4. Consultant Conclusion" },
  ] as const;

  const answeredCount = QUESTION_BANK.filter((q) => qa.questions[q.ref]?.score).length;
  const progress = Math.round((answeredCount / QUESTION_BANK.length) * 100);
  const isComplete = answeredCount === QUESTION_BANK.length;
  const remaining = QUESTION_BANK.length - answeredCount;

  return (
    <div className="min-h-full bg-[#f4f4f4] pb-20">
      {/* Page Header */}
      <div className="bg-white border-b border-[#e0e0e0] px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-[#86bc25]"></div>
              <span className="text-[#86bc25] font-bold text-[10px] tracking-widest uppercase">Phase 1</span>
            </div>
            <h1 className="text-[22px] font-semibold text-[#161616]">Governance & Risk Management Assessment</h1>
            <p className="text-[13px] text-[#525252] mt-1 max-w-2xl">
              Assess how well sustainability is integrated into governance, ERM and decision-making, and determine readiness for subsequent materiality phases.
            </p>
            {!isTailored && (
              <div className="mt-2 flex items-center gap-2 text-[12px] text-[#8a6000] bg-[#fef8e7] border border-[#f0d060] px-3 py-1.5 w-fit">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>
                  <strong>{sectorDisplayName}</strong> does not yet have a tailored sector profile — assessments are using a financial-services baseline.
                </span>
              </div>
            )}
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"}`}
          >
            {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? "Saved" : "Save Progress"}
          </button>
        </div>

        {/* Progress bar */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] text-[#525252] font-medium">{answeredCount} / {QUESTION_BANK.length} questions answered</span>
            <span className="text-[12px] font-bold text-[#86bc25]">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#e0e0e0]">
            <div className="h-1.5 bg-[#86bc25] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex gap-0 mt-5 border-b border-[#e0e0e0] -mb-px">
          {sectionTabs.map((tab) => {
            const locked = (tab.id === "summary" || tab.id === "conclusion") && !isComplete;
            return (
              <button
                key={tab.id}
                onClick={() => !locked && setActiveSection(tab.id)}
                disabled={locked}
                title={locked ? `Complete all ${QUESTION_BANK.length} questions to unlock (${remaining} remaining)` : undefined}
                className={`flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold border-b-2 transition-colors
                  ${activeSection === tab.id ? "border-[#86bc25] text-[#161616]" : "border-transparent text-[#525252]"}
                  ${locked ? "opacity-40 cursor-not-allowed" : "hover:text-[#161616]"}`}
              >
                {tab.label}
                {locked && <Lock className="w-3 h-3" />}
              </button>
            );
          })}
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
                className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 border transition-colors ${
                  activeEntityId === "parent"
                    ? "bg-[#86bc25] text-white border-[#86bc25]"
                    : "bg-white text-[#525252] border-[#e0e0e0] hover:border-[#86bc25] hover:text-[#435e12]"
                }`}
              >
                {groupName || "Parent Entity"}
                {activeEntityId === "parent" && <span className="w-1.5 h-1.5 rounded-full bg-white/80 inline-block" />}
              </button>
              {assessmentEntities.map((entity) => {
                const snap = entitySnapshots[entity.id];
                const isActive = activeEntityId === entity.id;
                const hasData = snap && (
                  Object.keys(snap.governanceAssessment?.questions ?? {}).length > 0 ||
                  snap.srroItems?.length > 0 ||
                  snap.phase4Entries?.length > 0
                );
                return (
                  <button
                    key={entity.id}
                    onClick={() => switchActiveEntity(entity.id)}
                    className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 border transition-colors ${
                      isActive
                        ? "bg-[#86bc25] text-white border-[#86bc25]"
                        : "bg-white text-[#525252] border-[#e0e0e0] hover:border-[#86bc25] hover:text-[#435e12]"
                    }`}
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
                Assessing:{" "}
                <strong className="text-[#161616]">
                  {assessmentEntities.find((e) => e.id === activeEntityId)?.name}
                </strong>{" "}
                · {assessmentEntities.find((e) => e.id === activeEntityId)?.entityType}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── SECTION 1: Engagement Context ── */}
        {activeSection === "context" && (
          <div className="space-y-6">
            <SectionCard title="Engagement Context" icon={FileText} subtitle="Capture key client and engagement details before beginning the assessment.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Client Name" required>
                  <TextInput value={qa.clientName} onChange={(v) => updateGovernanceAssessment({ clientName: v })} placeholder="e.g. Heirs General Insurance Limited" />
                </FormField>
                <FormField label="Sector" required>
                  <TextInput value={qa.sector} onChange={(v) => updateGovernanceAssessment({ sector: v })} placeholder="e.g. Insurance" />
                </FormField>
                <FormField label="Geography">
                  <TextInput value={qa.geography} onChange={(v) => updateGovernanceAssessment({ geography: v })} placeholder="e.g. Lagos Island" />
                </FormField>
                <FormField label="Reporting Basis">
                  <SelectInput
                    value={qa.reportingBasis}
                    onChange={(v) => updateGovernanceAssessment({ reportingBasis: v })}
                    options={[
                      { value: "IFRS S1 and S2", label: "IFRS S1 and S2" },
                      { value: "GRI Standards", label: "GRI Standards" },
                      { value: "SASB", label: "SASB" },
                      { value: "TCFD", label: "TCFD" },
                      { value: "Other", label: "Other" },
                    ]}
                  />
                </FormField>
                <FormField label="Assessment Date">
                  <TextInput value={qa.assessmentDate} onChange={(v) => updateGovernanceAssessment({ assessmentDate: v })} placeholder="e.g. May 2026 – June 2026" />
                </FormField>
                <FormField label="Reporting Requirement">
                  <SelectInput
                    value={qa.reportingRequirement}
                    onChange={(v) => updateGovernanceAssessment({ reportingRequirement: v })}
                    options={[
                      { value: "International", label: "International" },
                      { value: "Local", label: "Local" },
                      { value: "Both", label: "Both" },
                    ]}
                  />
                </FormField>
              </div>

              {/* ── Entity Structure ── */}
              <div className="mt-5">
                <label className="block text-[12px] font-semibold text-[#525252] uppercase tracking-wide mb-3">
                  Entity Structure
                </label>
                <div className="flex gap-6 mb-4">
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="entityStructure"
                      checked={!isGroupAssessment}
                      onChange={() => setIsGroupAssessment(false)}
                      className="w-4 h-4 accent-[#86bc25] cursor-pointer"
                    />
                    <span className="text-[14px] text-[#161616] font-medium group-hover:text-[#86bc25] transition-colors">Standalone Entity</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="entityStructure"
                      checked={isGroupAssessment}
                      onChange={() => setIsGroupAssessment(true)}
                      className="w-4 h-4 accent-[#86bc25] cursor-pointer"
                    />
                    <span className="text-[14px] text-[#161616] font-medium group-hover:text-[#86bc25] transition-colors">Group / Parent Entity</span>
                  </label>
                </div>

                {isGroupAssessment && (
                  <div className="space-y-5 border-l-2 border-[#86bc25]/30 pl-4">
                    <FormField label="Group Name">
                      <TextInput
                        value={groupName}
                        onChange={setGroupName}
                        placeholder="e.g. Heirs Holdings Limited"
                      />
                    </FormField>

                    <div>
                      <label className="block text-[12px] font-semibold text-[#525252] uppercase tracking-wide mb-2">
                        Subsidiaries & Associated Entities
                      </label>
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={newEntityName}
                          onChange={(e) => setNewEntityName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addEntity()}
                          placeholder="Entity name..."
                          className="flex-1 bg-[#f4f4f4] border-b border-[#8d8d8d] focus:border-b-2 focus:border-[#86bc25] outline-none text-[14px] text-[#161616] px-3 py-2 transition-all"
                        />
                        <select
                          value={newEntityType}
                          onChange={(e) => setNewEntityType(e.target.value as EntityType)}
                          className="bg-[#f4f4f4] border-b border-[#8d8d8d] focus:border-b-2 focus:border-[#86bc25] outline-none text-[13px] text-[#525252] px-2 py-2 cursor-pointer transition-all"
                        >
                          <option value="Subsidiary">Subsidiary</option>
                          <option value="Joint Venture">Joint Venture</option>
                          <option value="Associate">Associate</option>
                          <option value="Branch">Branch</option>
                        </select>
                        <button
                          onClick={addEntity}
                          disabled={!newEntityName.trim()}
                          className="flex items-center gap-1.5 bg-[#161616] text-white text-[13px] font-semibold px-4 py-2 disabled:opacity-40 hover:bg-[#86bc25] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                      {assessmentEntities.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mb-3">
                          {assessmentEntities.map((entity) => (
                            <span
                              key={entity.id}
                              className="inline-flex items-center gap-1.5 bg-[#f0f7e0] border border-[#86bc25]/40 text-[#435e12] text-[12px] font-medium px-2.5 py-1"
                            >
                              <Building2 className="w-3 h-3" />
                              {entity.name}
                              <span className="text-[10px] text-[#86bc25] border-l border-[#86bc25]/30 pl-1.5 ml-0.5">
                                {entity.entityType}
                              </span>
                              <button
                                onClick={() => removeAssessmentEntity(entity.id)}
                                className="ml-0.5 hover:text-[#da1e28] transition-colors"
                                title="Remove entity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[12px] text-[#8d8d8d] italic mb-3">No entities added yet.</p>
                      )}
                      {assessmentEntities.length > 0 && (
                        <div className="flex items-start gap-2 text-[12px] text-[#525252] bg-[#f4f4f4] px-3 py-2.5 border-l-2 border-[#86bc25]">
                          <Users className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#86bc25]" />
                          <p>
                            Each entity above requires a separate full assessment (Phases 1–5). Use the entity switcher at the top of the page to navigate between entities. The final report will consolidate all entities.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-5 space-y-4">
                {/* ── Documents Requested ── */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#525252] uppercase tracking-wide mb-2">
                    Documents Requested / Reviewed
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newDocInput}
                      onChange={(e) => setNewDocInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addDocument()}
                      placeholder="e.g. Enterprise Risk Management Framework"
                      className="flex-1 bg-[#f4f4f4] border-b border-[#8d8d8d] focus:border-b-2 focus:border-[#86bc25] outline-none text-[14px] text-[#161616] px-3 py-2 transition-all"
                    />
                    <button
                      onClick={addDocument}
                      disabled={!newDocInput.trim()}
                      className="flex items-center gap-1.5 bg-[#161616] text-white text-[13px] font-semibold px-4 py-2 disabled:opacity-40 hover:bg-[#86bc25] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                  {(qa.documentsReviewed ?? []).length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {(qa.documentsReviewed ?? []).map((doc, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-[#f4f4f4] border border-[#e0e0e0] text-[#161616] text-[12px] px-2.5 py-1"
                        >
                          <FileText className="w-3 h-3 text-[#8d8d8d]" />
                          {doc}
                          <button
                            onClick={() => removeDocument(doc)}
                            className="ml-0.5 text-[#8d8d8d] hover:text-[#da1e28] transition-colors"
                            title="Remove document"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-[#8d8d8d] italic">
                      No documents added yet. Common examples: ERM Framework, Corporate Strategy, Organogram, Claims Policy
                    </p>
                  )}
                </div>
                <FormField label="Notes from Kick-off">
                  <TextAreaInput
                    value={qa.kickOffNotes}
                    onChange={(v) => updateGovernanceAssessment({ kickOffNotes: v })}
                    rows={3}
                    placeholder="Record key observations, commitments, or questions raised during the kick-off meeting."
                  />
                </FormField>
              </div>
            </SectionCard>
            <div className="flex justify-end">
              <button onClick={() => setActiveSection("assessment")} className="flex items-center gap-2 bg-[#161616] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#86bc25] transition-colors">
                Continue to Assessment Questions <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── SECTION 2: Assessment Questions ── */}
        {activeSection === "assessment" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] text-[#525252]">
                Score each question using the three-point scale. Flag gaps where identified.
              </p>
              <div className="flex items-center gap-3 text-[12px]">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#da1e28] inline-block"></span> No integration</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#f59e0b] inline-block"></span> Limited</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] inline-block"></span> Integrated</span>
              </div>
            </div>

            {AREAS.map((area) => {
              const areaQuestions = QUESTION_BANK.filter((q) => q.area === area);
              const isOpen = expandedAreas[area] !== false;
              const areaAvg = scoring.areaAverages[area] ?? 0;
              const badge = areaAvg > 0 ? integrationBadge(areaAvg) : null;

              return (
                <div key={area} className="bg-white border border-[#e0e0e0]">
                  <button
                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#f4f4f4] transition-colors"
                    onClick={() => setExpandedAreas((prev) => ({ ...prev, [area]: !isOpen }))}
                  >
                    <div className="flex items-center gap-3">
                      <ClipboardCheck className="w-4 h-4 text-[#86bc25]" />
                      <span className="text-[14px] font-semibold text-[#161616]">{area}</span>
                      {badge && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span>
                      )}
                      <span className="text-[12px] text-[#525252]">Avg: {areaAvg > 0 ? areaAvg.toFixed(2) : "—"}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#525252]" /> : <ChevronDown className="w-4 h-4 text-[#525252]" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-[#e0e0e0]">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#f4f4f4] text-[#525252] text-[11px] uppercase tracking-wide">
                            <th className="px-4 py-3 w-12">Ref</th>
                            <th className="px-4 py-3">Assessment Question</th>
                            <th className="px-4 py-3 w-44">Score</th>
                            <th className="px-4 py-3 w-32">Gap Identified</th>
                            <th className="px-4 py-3">Evidence / Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {areaQuestions.map((q, qi) => {
                            const ans = qForRef(q.ref);
                            return (
                              <tr key={q.ref} className={`border-t border-[#e0e0e0] ${qi % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}>
                                <td className="px-4 py-3 text-[12px] font-bold text-[#86bc25] align-top">{q.ref}</td>
                                <td className="px-4 py-3 text-[13px] text-[#161616] align-top leading-snug">{q.question}</td>
                                <td className="px-4 py-3 align-top">
                                  <div className="relative">
                                    <select
                                      value={ans.score}
                                      onChange={(e) => updateGovernanceQuestion(q.ref, { ref: q.ref, score: e.target.value as GovernanceQuestion["score"], evidenceNotes: ans.evidenceNotes, gapIdentified: ans.gapIdentified })}
                                      className={`w-full appearance-none text-[12px] font-semibold border px-2.5 py-1.5 pr-6 outline-none transition-colors cursor-pointer ${scoreToColor(ans.score)}`}
                                    >
                                      <option value="">Select</option>
                                      <option>No integration</option>
                                      <option>Limited integration</option>
                                      <option>Integrated</option>
                                    </select>
                                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                                  </div>
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <div className="relative">
                                    <select
                                      value={ans.gapIdentified}
                                      onChange={(e) => updateGovernanceQuestion(q.ref, { ref: q.ref, score: ans.score, evidenceNotes: ans.evidenceNotes, gapIdentified: e.target.value as GovernanceQuestion["gapIdentified"] })}
                                      className={`w-full appearance-none text-[12px] font-semibold border px-2.5 py-1.5 pr-6 outline-none cursor-pointer ${ans.gapIdentified === "Yes" ? "text-[#da1e28] bg-[#fff1f1] border-[#da1e28]/30" : ans.gapIdentified === "No" ? "text-[#10b981] bg-[#f0fdf4] border-[#10b981]/30" : "text-[#525252] bg-[#f4f4f4] border-[#e0e0e0]"}`}
                                    >
                                      <option value="">Select</option>
                                      <option>Yes</option>
                                      <option>No</option>
                                    </select>
                                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" />
                                  </div>
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <input
                                    type="text"
                                    value={ans.evidenceNotes}
                                    onChange={(e) => updateGovernanceQuestion(q.ref, { ref: q.ref, score: ans.score, evidenceNotes: e.target.value, gapIdentified: ans.gapIdentified })}
                                    placeholder="Add evidence or notes..."
                                    className="w-full bg-[#f4f4f4] border-b border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] text-[#161616] px-2 py-1.5"
                                  />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-between items-end mt-4">
              <button onClick={() => setActiveSection("context")} className="px-5 py-2.5 border border-[#e0e0e0] text-[13px] font-semibold text-[#161616] hover:border-[#86bc25] transition-colors">
                ← Back
              </button>
              <div className="flex flex-col items-end gap-1.5">
                {!isComplete && (
                  <p className="text-[12px] text-[#da1e28] font-medium">
                    {remaining} question{remaining !== 1 ? "s" : ""} still need{remaining === 1 ? "s" : ""} a score
                  </p>
                )}
                <button
                  onClick={() => isComplete && setActiveSection("summary")}
                  disabled={!isComplete}
                  title={!isComplete ? `Score all ${QUESTION_BANK.length} questions to continue` : undefined}
                  className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                    isComplete
                      ? "bg-[#161616] text-white hover:bg-[#86bc25] cursor-pointer"
                      : "bg-[#e0e0e0] text-[#8d8d8d] cursor-not-allowed"
                  }`}
                >
                  {!isComplete && <Lock className="w-3.5 h-3.5" />}
                  View Scoring Summary <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 3: Scoring Summary ── */}
        {activeSection === "summary" && (
          <div className="space-y-6">
            <SectionCard title="Scoring Summary" icon={BarChart3} subtitle="Auto-calculated from your assessment responses.">
              {/* Area averages */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e0e0e0] border border-[#e0e0e0]">
                {AREAS.map((area) => {
                  const avg = scoring.areaAverages[area] ?? 0;
                  const badge = avg > 0 ? integrationBadge(avg) : null;
                  return (
                    <div key={area} className="bg-white p-5">
                      <p className="text-[11px] uppercase font-semibold tracking-wide text-[#525252] mb-2">{area}</p>
                      <p className="text-[28px] font-light text-[#161616]">{avg > 0 ? avg.toFixed(2) : "—"}</p>
                      {badge && <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded ${badge.color}`}>{badge.label}</span>}
                    </div>
                  );
                })}
                <div className="bg-[#f4fadc] border-l-4 border-[#86bc25] p-5">
                  <p className="text-[11px] uppercase font-semibold tracking-wide text-[#435e12] mb-2">Overall Average</p>
                  <p className="text-[32px] font-light text-[#435e12]">{scoring.overallAvg > 0 ? scoring.overallAvg.toFixed(2) : "—"}</p>
                  {scoring.overallAvg > 0 && (
                    <span className={`mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded ${integrationBadge(scoring.overallAvg).color}`}>
                      {integrationBadge(scoring.overallAvg).label}
                    </span>
                  )}
                </div>
              </div>

              {/* Integration level interpretation */}
              {scoring.overallAvg > 0 && (
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white border border-[#e0e0e0] p-4">
                    <p className="text-[11px] uppercase font-semibold text-[#525252] mb-2">Integration Level</p>
                    <span className={`text-[12px] font-bold px-3 py-1 rounded ${integrationBadge(scoring.overallAvg).color}`}>
                      {integrationBadge(scoring.overallAvg).label}
                    </span>
                    <p className="text-[12px] text-[#525252] mt-2">
                      {scoring.overallAvg >= 2.5
                        ? "Sustainability is meaningfully embedded in governance and ERM."
                        : scoring.overallAvg >= 1.5
                          ? "Sustainability is partially embedded but lacks systematic integration."
                          : "Sustainability is not meaningfully embedded in governance or ERM processes."}
                    </p>
                  </div>
                  <div className="bg-white border border-[#e0e0e0] p-4">
                    <p className="text-[11px] uppercase font-semibold text-[#525252] mb-2">Readiness for Phase 2–6</p>
                    <p className={`text-[14px] font-bold ${readinessBadge(scoring.overallAvg).color}`}>
                      {readinessBadge(scoring.overallAvg).label}
                    </p>
                  </div>
                  <div className="bg-white border border-[#e0e0e0] p-4">
                    <p className="text-[11px] uppercase font-semibold text-[#525252] mb-2">Recommended Path</p>
                    <p className="text-[12px] text-[#525252] leading-relaxed">{recommendedPath(scoring.overallAvg)}</p>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Key Gaps */}
            <SectionCard title="Key Gaps & Observations" icon={AlertTriangle} subtitle="Automatically derived from your gap flags.">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#e0e0e0] border border-[#e0e0e0]">
                <div className="bg-white p-5 text-center">
                  <p className="text-[11px] uppercase font-semibold text-[#525252] mb-1">Gaps Flagged</p>
                  <p className="text-[36px] font-light text-[#da1e28]">{scoring.gapCount}</p>
                </div>
                <div className="bg-white p-5 text-center">
                  <p className="text-[11px] uppercase font-semibold text-[#525252] mb-1">Lowest Scoring Area</p>
                  <p className="text-[14px] font-semibold text-[#161616]">{scoring.lowestArea}</p>
                </div>
                <div className="bg-white p-5 text-center">
                  <p className="text-[11px] uppercase font-semibold text-[#525252] mb-1">Highest Scoring Area</p>
                  <p className="text-[14px] font-semibold text-[#161616]">{scoring.highestArea}</p>
                </div>
              </div>

              {/* Flagged questions list */}
              {scoring.gapCount > 0 && (
                <div className="mt-5">
                  <p className="text-[12px] font-semibold text-[#161616] mb-3 uppercase tracking-wide">Questions with identified gaps:</p>
                  <div className="space-y-2">
                    {QUESTION_BANK.filter((q) => qa.questions[q.ref]?.gapIdentified === "Yes").map((q) => (
                      <div key={q.ref} className="flex items-start gap-3 bg-[#fff1f1] border border-[#da1e28]/20 px-4 py-3">
                        <span className="text-[11px] font-bold text-[#86bc25] mt-0.5 min-w-[24px]">{q.ref}</span>
                        <p className="text-[13px] text-[#161616]">{q.question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>

            <div className="flex justify-between">
              <button onClick={() => setActiveSection("assessment")} className="px-5 py-2.5 border border-[#e0e0e0] text-[13px] font-semibold text-[#161616] hover:border-[#86bc25] transition-colors">
                ← Back to Questions
              </button>
              <button onClick={() => setActiveSection("conclusion")} className="flex items-center gap-2 bg-[#161616] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#86bc25] transition-colors">
                Consultant Conclusion <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── SECTION 4: Consultant Conclusion ── */}
        {activeSection === "conclusion" && (
          <div className="space-y-6">
            <SectionCard title="Consultant Conclusion" icon={ClipboardCheck} subtitle="Document key findings, weaknesses, and recommended next steps.">
              <div className="space-y-5">
                <FormField label="Overall Conclusion">
                  <TextAreaInput
                    value={qa.overallConclusion}
                    onChange={(v) => updateGovernanceAssessment({ overallConclusion: v })}
                    rows={3}
                    placeholder="e.g. Sustainability is not part of how the entity governs the business, manages risks, or makes decisions."
                  />
                </FormField>
                <FormField label="Main Governance Weaknesses">
                  <TextAreaInput
                    value={qa.mainGovernanceWeaknesses}
                    onChange={(v) => updateGovernanceAssessment({ mainGovernanceWeaknesses: v })}
                    rows={3}
                    placeholder="e.g. No one at the Board or executive level is clearly in charge of sustainability."
                  />
                </FormField>
                <FormField label="Immediate Actions Before Phase 2">
                  <TextAreaInput
                    value={qa.immediateActions}
                    onChange={(v) => updateGovernanceAssessment({ immediateActions: v })}
                    rows={3}
                    placeholder="e.g. Assign clear leadership responsibility, define roles, and begin sustainability risk discussions."
                  />
                </FormField>
                <FormField label="Stakeholders to Engage Next">
                  <TextAreaInput
                    value={qa.stakeholdersToEngage}
                    onChange={(v) => updateGovernanceAssessment({ stakeholdersToEngage: v })}
                    rows={2}
                    placeholder="e.g. Underwriting team, claims team, risk and finance functions."
                  />
                </FormField>
                <FormField label="Additional Support Needed">
                  <TextAreaInput
                    value={qa.additionalSupportNeeded}
                    onChange={(v) => updateGovernanceAssessment({ additionalSupportNeeded: v })}
                    rows={3}
                    placeholder="e.g. External support to design a governance framework, integrate sustainability into ERM, and provide Board training."
                  />
                </FormField>
              </div>
            </SectionCard>

            <div className="flex items-center justify-between">
              <button onClick={() => setActiveSection("summary")} className="px-5 py-2.5 border border-[#e0e0e0] text-[13px] font-semibold text-[#161616] hover:border-[#86bc25] transition-colors">
                ← Back to Summary
              </button>
              <div className="flex items-center gap-3">
                <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"}`}>
                  {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {saved ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => navigate("/sustainability/value-chain")}
                  className="flex items-center gap-2 bg-[#86bc25] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors"
                >
                  Proceed to Phase 2 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared card wrapper ────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, subtitle, children }: { title: string; icon: React.ElementType; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e0e0e0]">
      <div className="px-6 py-4 border-b border-[#e0e0e0] flex items-start gap-3">
        <div className="w-8 h-8 flex items-center justify-center bg-[#86bc25]/10 mt-0.5">
          <Icon className="w-4 h-4 text-[#435e12]" />
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-[#161616]">{title}</h3>
          {subtitle && <p className="text-[12px] text-[#525252] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
