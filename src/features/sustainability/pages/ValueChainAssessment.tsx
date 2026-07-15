import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Network,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  ArrowRight,
  Save,
  GitFork,
  Users,
  ChevronDown,
  Download,
  Loader2,
  Lock,
  Eye,
  Building2,
  Sparkles,
  AlertTriangle,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  useSustainabilityStore,
  type ValueChainActivity,
  type ResourceRelationship,
} from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";
import { useScenarioStore } from "@/store/scenarioStore";
import { getSectorById } from "@/features/scenario-analysis/data/sectorConfig";
import { populateValueChain } from "@/services/valueChainApi";
import { generateSrroItems } from "@/services/srroApi";
import { ConfirmModal } from "@/components/ui";
import {
  GENERAL_QUESTIONS,
  UPSTREAM_PARAMS,
  CORE_PARAMS,
  DOWNSTREAM_PARAMS,
} from "../data/questionnaireData";
import {
  downloadQuestionnaireTemplate,
  parseQuestionnaireUpload,
  type QuestionnaireImportRow,
} from "../utils/questionnaireImportExport";
import {
  BulkUploadModal,
  QuestionnaireImportPreview,
} from "../components/BulkImportModals";

// ─── Types ────────────────────────────────────────────────────────────────────
const STAGE_OPTIONS = ["Upstream", "Core", "Downstream"] as const;
const CAPITAL_TYPES = ["Financial", "Manufactured", "Intellectual", "Human", "Social", "Natural"] as const;
const RESOURCE_TYPES = ["Resource", "Relationship"] as const;
const DEP_IMPACT = ["Dependency", "Impact"] as const;
const RISK_OPP = ["Risk", "Opportunity"] as const;

const STAGE_COLORS: Record<string, string> = {
  Upstream: "bg-[#dbeafe] text-[#1d4ed8] border-[#93c5fd]",
  Core: "bg-[#f4fadc] text-[#435e12] border-[#86bc25]/40",
  Downstream: "bg-[#fef3c7] text-[#92400e] border-[#fbbf24]/40",
};

const CAPITAL_COLORS: Record<string, string> = {
  Financial: "bg-[#dbeafe] text-[#1d4ed8]",
  Manufactured: "bg-[#fce7f3] text-[#9d174d]",
  Intellectual: "bg-[#ede9fe] text-[#5b21b6]",
  Human: "bg-[#d1fae5] text-[#065f46]",
  Social: "bg-[#fef3c7] text-[#92400e]",
  Natural: "bg-[#dcfce7] text-[#166534]",
};

// ─── Questionnaire data imported from ../data/questionnaireData.ts ─────────────

const blankActivity = (): Omit<ValueChainActivity, "id"> => ({
  stage: "",
  activity: "",
  description: "",
  vendorType: "",
  keyStakeholders: "",
  geography: "",
  keyInputs: "",
  keyOutputs: "",
  notes: "",
});

const blankResource = (): Omit<ResourceRelationship, "id"> => ({
  vendor: "",
  valueChainStage: "",
  capitalType: "",
  resourceRelationship: "",
  dependencyImpact: "",
  riskOpportunity: "",
  description: "",
});

// ─── Shared sub-components ────────────────────────────────────────────────────
function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-[#525252] uppercase tracking-wide mb-1">
        {label}{required && <span className="text-[#da1e28] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, readOnly }: { value: string; onChange: (v: string) => void; placeholder?: string; readOnly?: boolean }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => !readOnly && onChange(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full bg-[#f4f4f4] border-b border-[#8d8d8d] outline-none text-[13px] text-[#161616] px-3 py-2 transition-all ${readOnly ? "cursor-default opacity-80" : "focus:border-b-2 focus:border-[#86bc25]"}`}
    />
  );
}

function TextAreaInput({ value, onChange, rows = 2, placeholder, readOnly }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; readOnly?: boolean }) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(e) => !readOnly && onChange(e.target.value)}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full bg-[#f4f4f4] border border-[#e0e0e0] outline-none text-[13px] text-[#161616] px-3 py-2 resize-none transition-all ${readOnly ? "cursor-default opacity-80" : "focus:border-[#86bc25]"}`}
    />
  );
}

function SelectInput({ value, onChange, options, placeholder = "— Select —" }: { value: string; onChange: (v: string) => void; options: readonly string[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-[#f4f4f4] border-b border-[#8d8d8d] focus:border-b-2 focus:border-[#86bc25] outline-none text-[13px] text-[#161616] px-3 py-2 pr-7 cursor-pointer transition-all"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252] pointer-events-none" />
    </div>
  );
}

// ─── Editable question cell (consultant can override the default wording) ────
function EditableQuestionCell({
  id, defaultText, override, onSave, onReset, editable, showEditAlways,
}: {
  id: string;
  defaultText: string;
  override?: string;
  onSave: (id: string, text: string) => void;
  onReset: (id: string) => void;
  editable: boolean;
  showEditAlways?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(override ?? defaultText);
  const text = override || defaultText;

  if (!editable) return <span>{text}</span>;

  if (editing) {
    return (
      <div className="space-y-1.5">
        <textarea
          rows={2}
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full bg-white border border-[#86bc25] outline-none text-[13px] text-[#161616] px-2 py-1.5 resize-none transition-all"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => { const t = draft.trim(); if (t) onSave(id, t); setEditing(false); }}
            className="px-2.5 py-1 text-[11px] font-semibold bg-[#86bc25] text-white hover:bg-[#70a31d] transition-colors"
          >
            Save
          </button>
          <button
            onClick={() => { setDraft(override ?? defaultText); setEditing(false); }}
            className="px-2.5 py-1 text-[11px] font-semibold border border-[#e0e0e0] text-[#525252] hover:border-[#da1e28] hover:text-[#da1e28] transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group/q flex items-start gap-2">
      <span className="flex-1">{text}</span>
      <button
        onClick={() => { setDraft(text); setEditing(true); }}
        title="Edit question"
        className={`shrink-0 p-1 hover:bg-[#e0e0e0] transition-all ${showEditAlways ? "opacity-100" : "opacity-0 group-hover/q:opacity-100"}`}
      >
        <Edit2 className="w-3 h-3 text-[#525252]" />
      </button>
      {override && (
        <span className="shrink-0 flex items-center gap-1">
          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#ede9fe] text-[#5b21b6]">Edited</span>
          <button onClick={() => onReset(id)} title="Reset to default wording" className="p-1 hover:bg-[#e0e0e0] transition-all">
            <X className="w-3 h-3 text-[#525252]" />
          </button>
        </span>
      )}
    </div>
  );
}

// ─── Parametric questionnaire section ────────────────────────────────────────
function ParametricSection({
  stage, stageColor, title, description, params, responses, onResponse, isReadOnly,
  questionOverrides, onEditQuestion, onResetQuestion, canEditQuestions, showEditAlways,
}: {
  stage: string;
  stageColor: string;
  title: string;
  description: string;
  params: { sn: number; parameter: string; questions: { id: string; text: string }[] }[];
  responses: Record<string, string>;
  onResponse: (id: string, value: string) => void;
  isReadOnly?: boolean;
  questionOverrides: Record<string, string>;
  onEditQuestion: (id: string, text: string) => void;
  onResetQuestion: (id: string) => void;
  canEditQuestions: boolean;
  showEditAlways?: boolean;
}) {
  return (
    <div className="bg-white border border-[#e0e0e0]">
      <div className="px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className={`text-[10px] font-bold px-2 py-0.5 ${stageColor}`}>{stage}</span>
          <p className="text-[12px] font-bold text-[#161616]">{title}</p>
        </div>
        <p className="text-[12px] text-[#525252] leading-relaxed max-w-3xl">
          <span className="font-semibold text-[#161616]">{stage} activities</span> {description}
        </p>
      </div>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-[#161616] text-white text-[11px] uppercase tracking-wide">
            <th className="px-4 py-2.5 w-10">S/N</th>
            <th className="px-4 py-2.5 w-[18%]">Parameters</th>
            <th className="px-4 py-2.5">Questions</th>
            <th className="px-4 py-2.5 w-[38%]">Answers</th>
          </tr>
        </thead>
        <tbody>
          {params.map((param) =>
            param.questions.map((q, qi) => (
              <tr key={q.id} className={`border-t border-[#e0e0e0] ${(param.sn + qi) % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}>
                {qi === 0 && (
                  <>
                    <td rowSpan={param.questions.length} className="px-4 py-3 text-[12px] font-bold text-[#86bc25] align-top border-r border-[#e0e0e0]">
                      {param.sn}.
                    </td>
                    <td rowSpan={param.questions.length} className="px-4 py-3 text-[13px] font-semibold text-[#161616] align-top border-r border-[#e0e0e0] leading-snug">
                      {param.parameter}
                    </td>
                  </>
                )}
                <td className="px-4 py-3 text-[13px] text-[#161616] leading-snug align-top">
                  <EditableQuestionCell
                    id={q.id}
                    defaultText={q.text}
                    override={questionOverrides[q.id]}
                    onSave={onEditQuestion}
                    onReset={onResetQuestion}
                    editable={canEditQuestions}
                    showEditAlways={showEditAlways}
                  />
                </td>
                <td className="px-3 py-2 align-top">
                  {isReadOnly ? (
                    <p className={`text-[12px] text-[#161616] px-3 py-2 min-h-[44px] bg-[#f4f4f4] border border-[#e0e0e0] leading-relaxed ${!responses[q.id] ? "text-[#8d8d8d] italic" : ""}`}>
                      {responses[q.id] || "No response provided"}
                    </p>
                  ) : (
                    <textarea
                      rows={2}
                      value={responses[q.id] ?? ""}
                      onChange={(e) => onResponse(q.id, e.target.value)}
                      placeholder="Enter your response…"
                      className="w-full bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] text-[#161616] px-3 py-2 resize-none transition-all"
                    />
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

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

// ─── Activity Modal ────────────────────────────────────────────────────────────
function ActivityModal({
  initial,
  onSave,
  onClose,
  title,
}: {
  initial: Omit<ValueChainActivity, "id">;
  onSave: (data: Omit<ValueChainActivity, "id">) => void;
  onClose: () => void;
  title: string;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#161616]/60 p-4">
      <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-[#e0e0e0] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4]">
          <h3 className="text-[15px] font-semibold text-[#161616]">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#e0e0e0] transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Stage" required>
            <SelectInput value={form.stage} onChange={set("stage")} options={STAGE_OPTIONS} />
          </FormField>
          <FormField label="Activity" required>
            <TextInput value={form.activity} onChange={set("activity")} placeholder="e.g. Underwriting Operations" />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Description" required>
              <TextAreaInput value={form.description} onChange={set("description")} rows={2} placeholder="Brief description of this activity..." />
            </FormField>
          </div>
          <FormField label="Vendor Type">
            <TextInput value={form.vendorType} onChange={set("vendorType")} placeholder="e.g. Broker, Regulator" />
          </FormField>
          <FormField label="Key Stakeholders">
            <TextInput value={form.keyStakeholders} onChange={set("keyStakeholders")} placeholder="e.g. Underwriting team; clients" />
          </FormField>
          <FormField label="Geography">
            <TextInput value={form.geography} onChange={set("geography")} placeholder="e.g. Lagos, Nigeria" />
          </FormField>
          <FormField label="Key Inputs / Resources">
            <TextInput value={form.keyInputs} onChange={set("keyInputs")} placeholder="e.g. Risk details, broker relationships" />
          </FormField>
          <FormField label="Key Outputs">
            <TextInput value={form.keyOutputs} onChange={set("keyOutputs")} placeholder="e.g. Quotation, policy issuance" />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Notes">
              <TextAreaInput value={form.notes} onChange={set("notes")} rows={2} placeholder="Any additional context or observations..." />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e0e0e0]">
          <button onClick={onClose} className="px-4 py-2 border border-[#e0e0e0] text-[13px] font-semibold text-[#525252] hover:border-[#da1e28] hover:text-[#da1e28] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (form.stage && form.activity && form.description) { onSave(form); onClose(); } }}
            className="px-4 py-2 bg-[#86bc25] text-white text-[13px] font-semibold hover:bg-[#70a31d] transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Activity
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Resource Modal ───────────────────────────────────────────────────────────
function ResourceModal({
  initial,
  onSave,
  onClose,
  title,
}: {
  initial: Omit<ResourceRelationship, "id">;
  onSave: (data: Omit<ResourceRelationship, "id">) => void;
  onClose: () => void;
  title: string;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof typeof form) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#161616]/60 p-4">
      <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto border border-[#e0e0e0] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4]">
          <h3 className="text-[15px] font-semibold text-[#161616]">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#e0e0e0] transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Vendor / Party" required>
            <TextInput value={form.vendor} onChange={set("vendor")} placeholder="e.g. Brokers, NAICOM, Africa Re" />
          </FormField>
          <FormField label="Value Chain Stage" required>
            <SelectInput value={form.valueChainStage} onChange={set("valueChainStage")} options={STAGE_OPTIONS} />
          </FormField>
          <FormField label="Capital Type" required>
            <SelectInput value={form.capitalType} onChange={set("capitalType")} options={CAPITAL_TYPES} />
          </FormField>
          <FormField label="Resource or Relationship">
            <SelectInput value={form.resourceRelationship} onChange={set("resourceRelationship")} options={RESOURCE_TYPES} />
          </FormField>
          <FormField label="Dependency or Impact">
            <SelectInput value={form.dependencyImpact} onChange={set("dependencyImpact")} options={DEP_IMPACT} />
          </FormField>
          <FormField label="Risk or Opportunity">
            <SelectInput value={form.riskOpportunity} onChange={set("riskOpportunity")} options={RISK_OPP} />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Description" required>
              <TextAreaInput value={form.description} onChange={set("description")} rows={3} placeholder="Describe the nature of this dependency, impact, risk, or opportunity..." />
            </FormField>
          </div>
        </div>
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e0e0e0]">
          <button onClick={onClose} className="px-4 py-2 border border-[#e0e0e0] text-[13px] font-semibold text-[#525252] hover:border-[#da1e28] hover:text-[#da1e28] transition-colors">
            Cancel
          </button>
          <button
            onClick={() => { if (form.vendor && form.valueChainStage && form.capitalType && form.description) { onSave(form); onClose(); } }}
            className="px-4 py-2 bg-[#86bc25] text-white text-[13px] font-semibold hover:bg-[#70a31d] transition-colors flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Save Entry
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ValueChainAssessment() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isClient = user?.role === UserRole.CLIENT;

  const {
    valueChain,
    updateValueChain,
    setValueChainActivities,
    setResourceRelationships,
    addValueChainActivity,
    updateValueChainActivity,
    removeValueChainActivity,
    addResourceRelationship,
    updateResourceRelationship,
    removeResourceRelationship,
    governanceAssessment,
    isGroupAssessment,
    groupName,
    assessmentEntities,
    activeEntityId,
    entitySnapshots,
    switchActiveEntity,
    saveCurrentProject,
    srroItems,
    setSrroItems,
  } = useSustainabilityStore(
    useShallow((s) => ({
      valueChain: s.valueChain,
      updateValueChain: s.updateValueChain,
      setValueChainActivities: s.setValueChainActivities,
      setResourceRelationships: s.setResourceRelationships,
      addValueChainActivity: s.addValueChainActivity,
      updateValueChainActivity: s.updateValueChainActivity,
      removeValueChainActivity: s.removeValueChainActivity,
      addResourceRelationship: s.addResourceRelationship,
      updateResourceRelationship: s.updateResourceRelationship,
      removeResourceRelationship: s.removeResourceRelationship,
      governanceAssessment: s.governanceAssessment,
      isGroupAssessment: s.isGroupAssessment,
      groupName: s.groupName,
      assessmentEntities: s.assessmentEntities,
      activeEntityId: s.activeEntityId,
      entitySnapshots: s.entitySnapshots,
      switchActiveEntity: s.switchActiveEntity,
      saveCurrentProject: s.saveCurrentProject,
      srroItems: s.srroItems,
      setSrroItems: s.setSrroItems,
    })),
  );
  const selectedSectorId = useScenarioStore((s) => s.selectedSectorId);

  const [activeSection, setActiveSection] = useState<"questionnaire" | "overview" | "activities" | "resources">("questionnaire");
  const [activityModal, setActivityModal] = useState<{ open: boolean; editId?: string; initial: Omit<ValueChainActivity, "id"> }>({ open: false, initial: blankActivity() });
  const [resourceModal, setResourceModal] = useState<{ open: boolean; editId?: string; initial: Omit<ResourceRelationship, "id"> }>({ open: false, initial: blankResource() });
  const [deleteActivityId, setDeleteActivityId] = useState<string | null>(null);
  const [deleteResourceId, setDeleteResourceId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [genConfirmOpen, setGenConfirmOpen] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<QuestionnaireImportRow[] | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSave = () => {
    saveCurrentProject();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };


  const handleSaveActivity = (data: Omit<ValueChainActivity, "id">) => {
    if (activityModal.editId) {
      updateValueChainActivity(activityModal.editId, data);
    } else {
      addValueChainActivity({ ...data, id: `act-${Date.now()}` });
    }
  };

  const handleSaveResource = (data: Omit<ResourceRelationship, "id">) => {
    if (resourceModal.editId) {
      updateResourceRelationship(resourceModal.editId, data);
    } else {
      addResourceRelationship({ ...data, id: `res-${Date.now()}` });
    }
  };

  const handleGenerateValueChain = () => {
    const hasExisting =
      vc.activities.length > 0 ||
      vc.resources.length > 0 ||
      srroItems.length > 0;
    if (hasExisting) {
      setGenConfirmOpen(true);
    } else {
      doGenerateValueChain();
    }
  };

  const doGenerateValueChain = async () => {
    setGenConfirmOpen(false);
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
        businessModelContext: {
          description: vc.businessModelDescription ?? "",
          keyProductsServices: vc.keyProductsServices ?? "",
          keyMarketsRegions: vc.keyMarketsRegions ?? "",
        },
        questionnaireResponses: vc.questionnaireResponses ?? {},
      };
      const result = await populateValueChain(payload);
      const generatedActivities = result.activities.map((a) => ({
        ...a,
        id: `act-ai-${crypto.randomUUID()}`,
      })) as unknown as ValueChainActivity[];
      const generatedResources = result.resources.map((r) => ({
        ...r,
        id: `res-ai-${crypto.randomUUID()}`,
      })) as unknown as ResourceRelationship[];

      setValueChainActivities(generatedActivities);
      setResourceRelationships(generatedResources);

      const generatedSrros = await generateSrroItems({
        entityProfile: payload.entityProfile,
        valueChainResponses: vc.questionnaireResponses ?? {},
        activities: generatedActivities.map((activity) => ({
          stage: activity.stage,
          activity: activity.activity,
          description: activity.description,
          vendorType: activity.vendorType,
          keyStakeholders: activity.keyStakeholders,
          geography: activity.geography,
          keyInputs: activity.keyInputs,
          keyOutputs: activity.keyOutputs,
          notes: activity.notes,
        })),
        resources: generatedResources.map((resource) => ({
          vendor: resource.vendor,
          stage: resource.valueChainStage,
          capitalType: resource.capitalType,
          type: resource.resourceRelationship,
          dependencyImpact: resource.dependencyImpact,
          riskOpportunity: resource.riskOpportunity,
          description: resource.description,
        })),
        existingRefs: [],
      });
      setSrroItems(generatedSrros);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "AI generation failed");
    } finally {
      setAiLoading(false);
    }
  };

  // Client can't open these sections until the consultant has actually populated them.
  const isOverviewFilled = !!valueChain.businessModelDescription?.trim();
  const isActivitiesFilled = (valueChain.activities?.length ?? 0) > 0;
  const isResourcesFilled = (valueChain.resources?.length ?? 0) > 0;

  const sectionTabs = [
    { id: "questionnaire", label: "Questionnaire", locked: false },
    { id: "overview", label: "Value Chain Overview", locked: isClient && !isOverviewFilled },
    { id: "activities", label: "Activity Register", locked: isClient && !isActivitiesFilled },
    { id: "resources", label: "Resources & Relationships", locked: isClient && !isResourcesFilled },
  ] as const;

  // Single choke point for every "Continue to…" / tab navigation — refuses to switch into a
  // section the client has locked, so no other button can bypass the tab-level lock.
  const goToSection = (id: (typeof sectionTabs)[number]["id"]) => {
    const tab = sectionTabs.find((t) => t.id === id);
    if (tab?.locked) return;
    setActiveSection(id);
  };
  const isSectionLocked = (id: (typeof sectionTabs)[number]["id"]) =>
    !!sectionTabs.find((t) => t.id === id)?.locked;

  const vc = valueChain;
  const qResponses = vc.questionnaireResponses ?? {};
  const setResponse = (id: string, value: string) => {
    updateValueChain({ questionnaireResponses: { ...qResponses, [id]: value } });
  };
  const r = (id: string) => qResponses[id] ?? "";

  // Consultant-only overrides of the default question wording, shared with the client's view and the PDF export.
  const qOverrides = vc.questionOverrides ?? {};
  const setQuestionOverride = (id: string, text: string) => {
    updateValueChain({ questionOverrides: { ...qOverrides, [id]: text } });
  };
  const resetQuestionOverride = (id: string) => {
    const next = { ...qOverrides };
    delete next[id];
    updateValueChain({ questionOverrides: next });
  };
  const qText = (id: string, defaultText: string) => qOverrides[id] || defaultText;

  const questionnaireIsFilled = Object.values(qResponses).some((v) => v.trim());

  const [pdfLoading, setPdfLoading] = useState(false);

  const clientName = governanceAssessment.clientName || "Client";

  const handleDownloadTemplate = () => {
    downloadQuestionnaireTemplate(qOverrides, qResponses, clientName);
  };

  const handleQuestionnaireFileUpload = async (file: File) => {
    setUploadLoading(true);
    setUploadError(null);
    try {
      const rows = await parseQuestionnaireUpload(file, qOverrides);
      if (rows.length === 0) {
        setUploadError("No matching responses found. Ensure your file uses the template format with Question ID and Answer columns.");
        return;
      }
      setUploadModalOpen(false);
      setImportPreview(rows);
    } catch {
      setUploadError("Failed to parse file. Please use the downloaded template format.");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleApproveQuestionnaireImport = () => {
    if (!importPreview) return;
    const merged = { ...qResponses };
    for (const row of importPreview) {
      if (row.answer.trim()) merged[row.id] = row.answer.trim();
    }
    updateValueChain({ questionnaireResponses: merged });
    setImportPreview(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDownloadPDF = () => {
    setPdfLoading(true);
    try {
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const W = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 14;

      // Cover block
      doc.setFillColor(22, 22, 22);
      doc.rect(0, 0, W, 38, "F");
      doc.setTextColor(134, 188, 37);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("ESG NAVIGATOR  ·  PHASE 2: VALUE CHAIN ASSESSMENT", margin, 14);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("Client Questionnaire", margin, 24);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`Prepared for: ${clientName}`, margin, 32);

      let y = 48;

      const addSectionHeader = (label: string, color: [number, number, number]) => {
        if (y > pageH - 30) { doc.addPage(); y = 20; }
        doc.setFillColor(...color);
        doc.rect(margin, y, W - margin * 2, 7, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(label, margin + 2, y + 5);
        y += 9;
      };

      const addTable = (head: string[][], body: string[][]) => {
        autoTable(doc, {
          startY: y,
          head,
          body,
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
          headStyles: { fillColor: [22, 22, 22], textColor: [255, 255, 255], fontStyle: "bold" },
          columnStyles: {
            0: { minCellWidth: 8 },
            1: { minCellWidth: 95 },
            2: { minCellWidth: W - margin * 2 - 8 - 95, fillColor: [244, 250, 220] },
          },
          didDrawPage: () => {
            const pg = doc.getNumberOfPages();
            doc.setFontSize(7);
            doc.setTextColor(130, 130, 130);
            doc.text(`${clientName} — Value Chain Questionnaire  |  Page ${pg}`, margin, pageH - 6);
          },
        });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      };

      // Part A: General
      addSectionHeader("PART A — General Business Understanding", [22, 22, 22]);
      addTable(
        [["#", "Question", "Answer"]],
        GENERAL_QUESTIONS.map((q) => [String(q.sn), qText(q.id, q.text), r(q.id)]),
      );

      const paramSections = [
        { label: "PART B — Upstream Activities", color: [29, 78, 216] as [number, number, number], params: UPSTREAM_PARAMS },
        { label: "PART C — Core Activities", color: [67, 94, 18] as [number, number, number], params: CORE_PARAMS },
        { label: "PART D — Downstream Activities", color: [146, 64, 14] as [number, number, number], params: DOWNSTREAM_PARAMS },
      ];

      for (const section of paramSections) {
        addSectionHeader(section.label, section.color);
        const rows: string[][] = [];
        for (const param of section.params) {
          param.questions.forEach((q, qi) => {
            rows.push([qi === 0 ? `${param.sn}.` : "", qi === 0 ? param.parameter : "", qText(q.id, q.text), r(q.id)]);
          });
        }
        autoTable(doc, {
          startY: y,
          head: [["#", "Parameter", "Question", "Answer"]],
          body: rows,
          margin: { left: margin, right: margin },
          styles: { fontSize: 8, cellPadding: 2.5, overflow: "linebreak" },
          headStyles: { fillColor: [22, 22, 22], textColor: [255, 255, 255], fontStyle: "bold" },
          columnStyles: {
            0: { minCellWidth: 8 },
            1: { minCellWidth: 32 },
            2: { minCellWidth: 75 },
            3: { minCellWidth: W - margin * 2 - 8 - 32 - 75, fillColor: [244, 250, 220] },
          },
          didDrawPage: () => {
            const pg = doc.getNumberOfPages();
            doc.setFontSize(7);
            doc.setTextColor(130, 130, 130);
            doc.text(`${clientName} — Value Chain Questionnaire  |  Page ${pg}`, margin, pageH - 6);
          },
        });
        y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
      }

      doc.save(`${clientName.replace(/\s+/g, "_")}_Value_Chain_Questionnaire.pdf`);
    } finally {
      setPdfLoading(false);
    }
  };


  return (
    <div className="min-h-full bg-[#f4f4f4] pb-20">
      {/* Page Header */}
      <div className="bg-white border-b border-[#e0e0e0] px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-[#86bc25]"></div>
              <span className="text-[#86bc25] font-bold text-[10px] tracking-widest uppercase">Phase 2</span>
            </div>
            <h1 className="text-[22px] font-semibold text-[#161616]">Entity & Value Chain Assessment</h1>
            <p className="text-[13px] text-[#525252] mt-1 max-w-2xl">
              Understand the entity's business model, value chain, and key dependencies to identify where sustainability-related impacts, risks, and opportunities arise.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {(isClient || activeSection === "questionnaire") && !questionnaireIsFilled && (
              <button
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border border-[#86bc25]/50 text-[#435e12] hover:bg-[#f4fadc] transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Download Template
              </button>
            )}
            {isClient && (
              <button
                onClick={() => { setUploadError(null); setUploadModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border border-[#e0e0e0] text-[#161616] hover:border-[#86bc25] transition-colors"
              >
                <Upload className="w-4 h-4" />
                Bulk Upload
              </button>
            )}
            {!isClient && activeSection === "questionnaire" && questionnaireIsFilled && (
              <button
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-[#161616] text-white hover:bg-[#86bc25] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {pdfLoading ? "Generating…" : "Download PDF"}
              </button>
            )}
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"}`}
            >
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved" : isClient ? "Save Progress" : "Save Progress"}
            </button>
          </div>
        </div>

        {/* Counters */}
        <div className="flex items-center gap-5 mt-5 text-[12px] text-[#525252]">
          <span className="flex items-center gap-1.5"><GitFork className="w-3.5 h-3.5 text-[#86bc25]" /> {vc.activities.length} activities mapped</span>
          <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-[#86bc25]" /> {vc.resources.length} resources / relationships</span>
        </div>

        {/* Section tabs */}
        <div className="flex gap-0 mt-5 border-b border-[#e0e0e0] -mb-px">
          {sectionTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => goToSection(tab.id)}
              disabled={tab.locked}
              title={tab.locked ? "Not available yet — your consultant hasn't completed this section." : undefined}
              className={`flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${
                tab.locked
                  ? "border-transparent text-[#c6c6c6] cursor-not-allowed"
                  : activeSection === tab.id
                  ? "border-[#86bc25] text-[#161616]"
                  : "border-transparent text-[#525252] hover:text-[#161616]"
              }`}
            >
              {tab.locked && <Lock className="w-3 h-3" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {uploadError && activeSection === "questionnaire" && (
        <div className="mx-6 mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-[12px]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {uploadError}
        </div>
      )}

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

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── SECTION 0: Client Questionnaire ── */}
        {activeSection === "questionnaire" && (
          <div className="space-y-6">

            {/* Role-aware banner */}
            {isClient ? (
              <div className="flex items-start gap-3 bg-[#f4fadc] border border-[#86bc25]/40 px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-[#86bc25] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-[#435e12]">Your Questionnaire</p>
                  <p className="text-[12px] text-[#525252] mt-0.5">Complete all sections below, or download the template, fill it offline, and bulk upload. Hover any question to edit wording if it does not fit your business. Responses save automatically.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 bg-[#f0f4ff] border border-[#c7d7fb] px-4 py-3">
                <Lock className="w-4 h-4 text-[#3b82f6] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-semibold text-[#1e3a8a]">Client-Completed Section</p>
                  <p className="text-[12px] text-[#525252] mt-0.5">Client responses are read-only here. Hover a question to tailor its wording; edits apply to the PDF, template download, and the client's live view. Bulk upload is available on the client's side.</p>
                </div>
              </div>
            )}

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-semibold text-[#161616]">Value Chain Questionnaire</p>
                <p className="text-[12px] text-[#525252] mt-0.5">
                  {isClient
                    ? "Complete inline, edit questions as needed, or use Download Template / Bulk Upload in the page header above."
                    : questionnaireIsFilled
                    ? "Review client responses below, or use the header button to download a PDF copy."
                    : "Review client responses below. A PDF download will be available once the client has started responding."}
                </p>
              </div>
            </div>

            {/* General questions */}
            <div className="bg-white border border-[#e0e0e0]">
              <div className="px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4]">
                <p className="text-[13px] font-bold text-[#161616] uppercase tracking-wide">Questionnaire</p>
                <p className="text-[12px] text-[#525252] mt-1 font-semibold">To assess the value chain of the business:</p>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#161616] text-white text-[11px] uppercase tracking-wide">
                    <th className="px-4 py-2.5 w-12">S/N</th>
                    <th className="px-4 py-2.5">Questions</th>
                    <th className="px-4 py-2.5 w-[42%]">Answers</th>
                  </tr>
                </thead>
                <tbody>
                  {GENERAL_QUESTIONS.map((q, idx) => (
                    <tr key={q.id} className={`border-t border-[#e0e0e0] ${idx % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}>
                      <td className="px-4 py-3 text-[12px] font-bold text-[#86bc25] align-top">{q.sn}.</td>
                      <td className="px-4 py-3 text-[13px] text-[#161616] leading-snug align-top">
                        <EditableQuestionCell
                          id={q.id}
                          defaultText={q.text}
                          override={qOverrides[q.id]}
                          onSave={setQuestionOverride}
                          onReset={resetQuestionOverride}
                          editable={true}
                          showEditAlways={isClient}
                        />
                      </td>
                      <td className="px-3 py-2 align-top">
                        {!isClient ? (
                          <p className={`text-[12px] text-[#161616] px-3 py-2 min-h-[44px] bg-[#f4f4f4] border border-[#e0e0e0] leading-relaxed ${!r(q.id) ? "text-[#8d8d8d] italic" : ""}`}>
                            {r(q.id) || "No response provided"}
                          </p>
                        ) : (
                          <textarea
                            rows={2}
                            value={r(q.id)}
                            onChange={(e) => setResponse(q.id, e.target.value)}
                            placeholder="Enter your response…"
                            className="w-full bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] text-[#161616] px-3 py-2 resize-none transition-all"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Upstream */}
            <ParametricSection
              stage="Upstream"
              stageColor="bg-[#dbeafe] text-[#1d4ed8]"
              title="To assess the Upstream activities of the business:"
              description="Upstream activities are essential steps an insurance company takes before selling a policy. They include securing funding and reinsurance, gathering data and analytics, complying with regulations, and working with external service providers. These activities help the company accurately price risk and ensure it operates legally and financially."
              params={UPSTREAM_PARAMS}
              responses={qResponses}
              onResponse={setResponse}
              isReadOnly={!isClient}
              questionOverrides={qOverrides}
              onEditQuestion={setQuestionOverride}
              onResetQuestion={resetQuestionOverride}
              canEditQuestions={true}
              showEditAlways={isClient}
            />

            {/* Core */}
            <ParametricSection
              stage="Core"
              stageColor="bg-[#f4fadc] text-[#435e12]"
              title="To assess the Core activities of the business:"
              description="Core activities are the main functions of an insurance company. They involve assessing and pricing risk, issuing and managing policies, handling claims, and supporting customers. These activities are central to how the company creates value by collecting premiums and paying out valid claims."
              params={CORE_PARAMS}
              responses={qResponses}
              onResponse={setResponse}
              isReadOnly={!isClient}
              questionOverrides={qOverrides}
              onEditQuestion={setQuestionOverride}
              onResetQuestion={resetQuestionOverride}
              canEditQuestions={true}
              showEditAlways={isClient}
            />

            {/* Downstream */}
            <ParametricSection
              stage="Downstream"
              stageColor="bg-[#fef3c7] text-[#92400e]"
              title="To assess the Downstream activities of the business:"
              description="Downstream activities occur after insurance products are sold. They cover sales and distribution, customer interactions, settling claims, renewals, handling complaints, and closing policies. These steps influence customer experience, trust, and the company's reputation."
              params={DOWNSTREAM_PARAMS}
              responses={qResponses}
              onResponse={setResponse}
              isReadOnly={!isClient}
              questionOverrides={qOverrides}
              onEditQuestion={setQuestionOverride}
              onResetQuestion={resetQuestionOverride}
              canEditQuestions={true}
              showEditAlways={isClient}
            />

            <div className="flex justify-between">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"}`}
              >
                {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? "Saved" : "Save Responses"}
              </button>
              {!isSectionLocked("overview") && (
                <button
                  onClick={() => goToSection("overview")}
                  className="flex items-center gap-2 bg-[#86bc25] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors"
                >
                  {isClient ? "View Value Chain Overview" : "Continue to Value Chain Overview"} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 1: Overview ── */}
        {activeSection === "overview" && (
          <div className="space-y-6">
            {isClient && (
              <div className="flex items-center gap-3 bg-[#fffbeb] border border-[#f59e0b]/30 px-4 py-3">
                <Eye className="w-4 h-4 text-[#f59e0b] shrink-0" />
                <p className="text-[12px] text-[#92400e]"><strong>View Only</strong> — This section is managed by the Deloitte team.</p>
              </div>
            )}
            <SectionCard title="Value Chain Overview" icon={Network} subtitle="Describe the entity's business model, products/services, and key markets.">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-[12px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Business Model Description</label>
                  <TextAreaInput
                    value={vc.businessModelDescription}
                    onChange={(v) => updateValueChain({ businessModelDescription: v })}
                    rows={3}
                    placeholder="e.g. Non-life insurance company providing motor, fire and oil & gas coverage."
                    readOnly={isClient}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Key Products / Services</label>
                    <TextAreaInput
                      value={vc.keyProductsServices}
                      onChange={(v) => updateValueChain({ keyProductsServices: v })}
                      rows={3}
                      placeholder="e.g. Motor, Fire, Oil & Gas insurance"
                      readOnly={isClient}
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-[#525252] uppercase tracking-wide mb-1">Key Markets / Regions</label>
                    <TextAreaInput
                      value={vc.keyMarketsRegions}
                      onChange={(v) => updateValueChain({ keyMarketsRegions: v })}
                      rows={3}
                      placeholder="e.g. Lagos — Island, Ikeja, Yaba, Surulere"
                      readOnly={isClient}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* Value chain swimlane preview */}
            {(vc.activities.length > 0) && (
              <SectionCard title="Value Chain Map" icon={GitFork} subtitle="Visual summary of mapped activities by stage.">
                <div className="grid grid-cols-3 gap-4">
                  {STAGE_OPTIONS.map((stage) => {
                    const items = vc.activities.filter((a) => a.stage === stage);
                    return (
                      <div key={stage} className={`border rounded-none p-4 ${STAGE_COLORS[stage]}`}>
                        <p className="text-[11px] font-bold uppercase tracking-widest mb-3">{stage}</p>
                        {items.length === 0 ? (
                          <p className="text-[12px] opacity-60 italic">No activities added yet</p>
                        ) : (
                          <ul className="space-y-1.5">
                            {items.map((a) => (
                              <li key={a.id} className="text-[12px] font-medium leading-tight">{a.activity}{a.description && <span className="block text-[11px] opacity-70 mt-0.5">{a.description.slice(0, 60)}{a.description.length > 60 ? "…" : ""}</span>}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}

            <div className="flex justify-between">
              <button onClick={() => goToSection("questionnaire")} className="px-5 py-2.5 border border-[#e0e0e0] text-[13px] font-semibold text-[#161616] hover:border-[#86bc25] transition-colors">
                ← Back to Questionnaire
              </button>
              {!isSectionLocked("activities") && (
                <button
                  onClick={() => goToSection("activities")}
                  className="flex items-center gap-2 bg-[#161616] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#86bc25] transition-colors"
                >
                  Continue to Activity Register <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 2: Activity Register ── */}
        {activeSection === "activities" && (
          <div className="space-y-5">
            {isClient && (
              <div className="flex items-center gap-3 bg-[#fffbeb] border border-[#f59e0b]/30 px-4 py-3">
                <Eye className="w-4 h-4 text-[#f59e0b] shrink-0" />
                <p className="text-[12px] text-[#92400e]"><strong>View Only</strong> — Activity mapping is managed by the Deloitte team.</p>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] text-[#525252]">Map all upstream, core and downstream activities across the entity's value chain.</p>
              {!isClient && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateValueChain}
                    disabled={aiLoading}
                    className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-[#161616] text-white hover:bg-[#86bc25] transition-colors ${aiLoading ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {aiLoading ? "Generating…" : "Generate with AI"}
                  </button>
                  <button
                    onClick={() => setActivityModal({ open: true, initial: blankActivity() })}
                    className="flex items-center gap-2 bg-[#86bc25] text-white px-4 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Activity
                  </button>
                </div>
              )}
            </div>

            {aiError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {aiError}
              </div>
            )}

            {vc.activities.length === 0 ? (
              <div className="bg-white border border-[#e0e0e0] py-20 flex flex-col items-center justify-center text-center">
                <GitFork className="w-10 h-10 text-[#c6c6c6] mb-4 stroke-1" />
                <p className="text-[15px] font-medium text-[#161616]">No activities added yet</p>
                <p className="text-[13px] text-[#525252] mt-1 mb-5">Add upstream, core and downstream activities to map the full value chain.</p>
                {!isClient && (
                  <button onClick={() => setActivityModal({ open: true, initial: blankActivity() })} className="flex items-center gap-2 bg-[#86bc25] text-white px-4 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors">
                    <Plus className="w-4 h-4" /> Add First Activity
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#e0e0e0] overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-[#f4f4f4] text-[#525252] text-[11px] uppercase tracking-wide">
                      <th className="px-4 py-3 w-28">Stage</th>
                      <th className="px-4 py-3 w-36">Activity</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 w-36">Vendor Type</th>
                      <th className="px-4 py-3 w-40">Key Stakeholders</th>
                      <th className="px-4 py-3 w-32">Geography</th>
                      {!isClient && <th className="px-4 py-3 w-20">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {STAGE_OPTIONS.flatMap((stage) => {
                      const items = vc.activities.filter((a) => a.stage === stage);
                      return items.map((activity, idx) => (
                        <tr key={activity.id} className={`border-t border-[#e0e0e0] hover:bg-[#f9f9f9] transition-colors ${idx === 0 ? "border-t-2 border-t-[#e0e0e0]" : ""}`}>
                          {idx === 0 && (
                            <td rowSpan={items.length} className={`px-3 py-3 align-top border-r border-[#e0e0e0]`}>
                              <span className={`inline-block text-[11px] font-bold px-2 py-1 border ${STAGE_COLORS[stage]}`}>{stage}</span>
                            </td>
                          )}
                          <td className="px-4 py-3 text-[13px] font-semibold text-[#161616] align-top">{activity.activity}</td>
                          <td className="px-4 py-3 text-[12px] text-[#525252] align-top leading-snug max-w-[250px]">{activity.description}</td>
                          <td className="px-4 py-3 text-[12px] text-[#525252] align-top">{activity.vendorType || "—"}</td>
                          <td className="px-4 py-3 text-[12px] text-[#525252] align-top leading-snug">{activity.keyStakeholders || "—"}</td>
                          <td className="px-4 py-3 text-[12px] text-[#525252] align-top">{activity.geography || "—"}</td>
                          {!isClient && (
                            <td className="px-4 py-3 align-top">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => setActivityModal({ open: true, editId: activity.id, initial: { stage: activity.stage, activity: activity.activity, description: activity.description, vendorType: activity.vendorType, keyStakeholders: activity.keyStakeholders, geography: activity.geography, keyInputs: activity.keyInputs, keyOutputs: activity.keyOutputs, notes: activity.notes } })}
                                  className="p-1.5 hover:bg-[#f4fadc] text-[#525252] hover:text-[#86bc25] transition-colors"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => setDeleteActivityId(activity.id)} className="p-1.5 hover:bg-[#fff1f1] text-[#525252] hover:text-[#da1e28] transition-colors">
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button onClick={() => goToSection("overview")} className="px-5 py-2.5 border border-[#e0e0e0] text-[13px] font-semibold text-[#161616] hover:border-[#86bc25] transition-colors">
                ← Back
              </button>
              {!isSectionLocked("resources") && (
                <button
                  onClick={() => goToSection("resources")}
                  className="flex items-center gap-2 bg-[#161616] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#86bc25] transition-colors"
                >
                  Continue to Resources &amp; Relationships <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── SECTION 3: Resources & Relationships ── */}
        {activeSection === "resources" && (
          <div className="space-y-5">
            {isClient && (
              <div className="flex items-center gap-3 bg-[#fffbeb] border border-[#f59e0b]/30 px-4 py-3">
                <Eye className="w-4 h-4 text-[#f59e0b] shrink-0" />
                <p className="text-[12px] text-[#92400e]"><strong>View Only</strong> — Resources & relationships are managed by the Deloitte team.</p>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] text-[#525252]">Document key vendors, partners and resources along with their nature and sustainability relevance.</p>
              {!isClient && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateValueChain}
                    disabled={aiLoading}
                    className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold bg-[#161616] text-white hover:bg-[#86bc25] transition-colors ${aiLoading ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {aiLoading ? "Generating…" : "Generate with AI"}
                  </button>
                  <button
                    onClick={() => setResourceModal({ open: true, initial: blankResource() })}
                    className="flex items-center gap-2 bg-[#86bc25] text-white px-4 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Entry
                  </button>
                </div>
              )}
            </div>

            {aiError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-[13px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {aiError}
              </div>
            )}

            {vc.resources.length === 0 ? (
              <div className="bg-white border border-[#e0e0e0] py-20 flex flex-col items-center justify-center text-center">
                <Users className="w-10 h-10 text-[#c6c6c6] mb-4 stroke-1" />
                <p className="text-[15px] font-medium text-[#161616]">No resources or relationships added yet</p>
                <p className="text-[13px] text-[#525252] mt-1 mb-5">Document key vendors, partners, capital types and sustainability dependencies.</p>
                {!isClient && (
                  <button onClick={() => setResourceModal({ open: true, initial: blankResource() })} className="flex items-center gap-2 bg-[#86bc25] text-white px-4 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors">
                    <Plus className="w-4 h-4" /> Add First Entry
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#e0e0e0] overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-[#f4f4f4] text-[#525252] text-[11px] uppercase tracking-wide">
                      <th className="px-4 py-3">Vendor / Party</th>
                      <th className="px-4 py-3 w-28">Stage</th>
                      <th className="px-4 py-3 w-28">Capital Type</th>
                      <th className="px-4 py-3 w-28">Type</th>
                      <th className="px-4 py-3 w-28">Dep. / Impact</th>
                      <th className="px-4 py-3 w-28">Risk / Opp.</th>
                      <th className="px-4 py-3">Description</th>
                      {!isClient && <th className="px-4 py-3 w-20">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {vc.resources.map((res, idx) => (
                      <tr key={res.id} className={`border-t border-[#e0e0e0] hover:bg-[#f9f9f9] transition-colors ${idx % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}>
                        <td className="px-4 py-3 text-[13px] font-semibold text-[#161616] align-top max-w-[200px]">{res.vendor}</td>
                        <td className="px-4 py-3 align-top">
                          <span className={`text-[11px] font-bold px-2 py-0.5 border ${STAGE_COLORS[res.valueChainStage] ?? "bg-[#f4f4f4] text-[#525252] border-[#e0e0e0]"}`}>
                            {res.valueChainStage || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          {res.capitalType ? (
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${CAPITAL_COLORS[res.capitalType] ?? "bg-[#f4f4f4] text-[#525252]"}`}>
                              {res.capitalType}
                            </span>
                          ) : "—"}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#525252] align-top">{res.resourceRelationship || "—"}</td>
                        <td className="px-4 py-3 align-top">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${res.dependencyImpact === "Dependency" ? "bg-[#fef3c7] text-[#92400e]" : res.dependencyImpact === "Impact" ? "bg-[#dbeafe] text-[#1d4ed8]" : ""}`}>
                            {res.dependencyImpact || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${res.riskOpportunity === "Risk" ? "bg-[#fff1f1] text-[#da1e28]" : res.riskOpportunity === "Opportunity" ? "bg-[#f0fdf4] text-[#065f46]" : ""}`}>
                            {res.riskOpportunity || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#525252] align-top leading-snug max-w-[280px]">{res.description}</td>
                        {!isClient && (
                          <td className="px-4 py-3 align-top">
                            <div className="flex gap-1">
                              <button
                                onClick={() => setResourceModal({ open: true, editId: res.id, initial: { vendor: res.vendor, valueChainStage: res.valueChainStage, capitalType: res.capitalType, resourceRelationship: res.resourceRelationship, dependencyImpact: res.dependencyImpact, riskOpportunity: res.riskOpportunity, description: res.description } })}
                                className="p-1.5 hover:bg-[#f4fadc] text-[#525252] hover:text-[#86bc25] transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setDeleteResourceId(res.id)} className="p-1.5 hover:bg-[#fff1f1] text-[#525252] hover:text-[#da1e28] transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between mt-4">
              <button onClick={() => goToSection("activities")} className="px-5 py-2.5 border border-[#e0e0e0] text-[13px] font-semibold text-[#161616] hover:border-[#86bc25] transition-colors">
                ← Back
              </button>
              <div className="flex gap-3">
                {isClient ? (
                  <button
                    onClick={() => navigate("/sustainability/srro-register")}
                    className="flex items-center gap-2 bg-[#86bc25] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors"
                  >
                    View SRRO/CRRO Register <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button onClick={handleSave} className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"}`}>
                      {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                      {saved ? "Saved" : "Save"}
                    </button>
                    <button onClick={() => navigate("/sustainability/srro-register")} className="flex items-center gap-2 bg-[#86bc25] text-white px-5 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors">
                      Proceed to Phase 3 — SRRO/CRRO Register <ArrowRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Activity Modal ── */}
      {activityModal.open && (
        <ActivityModal
          title={activityModal.editId ? "Edit Activity" : "Add Value Chain Activity"}
          initial={activityModal.initial}
          onSave={handleSaveActivity}
          onClose={() => setActivityModal({ open: false, initial: blankActivity() })}
        />
      )}

      {/* ── Resource Modal ── */}
      {resourceModal.open && (
        <ResourceModal
          title={resourceModal.editId ? "Edit Resource / Relationship" : "Add Resource / Relationship"}
          initial={resourceModal.initial}
          onSave={handleSaveResource}
          onClose={() => setResourceModal({ open: false, initial: blankResource() })}
        />
      )}

      {/* ── Delete Confirm: Activity ── */}
      {deleteActivityId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#161616]/60 p-4">
          <div className="bg-white border border-[#e0e0e0] p-6 max-w-sm w-full shadow-xl">
            <p className="text-[15px] font-semibold text-[#161616] mb-2">Remove Activity?</p>
            <p className="text-[13px] text-[#525252] mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteActivityId(null)} className="flex-1 py-2 border border-[#e0e0e0] text-[13px] font-semibold hover:border-[#86bc25] transition-colors">Cancel</button>
              <button onClick={() => { removeValueChainActivity(deleteActivityId); setDeleteActivityId(null); }} className="flex-1 py-2 bg-[#da1e28] text-white text-[13px] font-semibold hover:bg-[#b91c1c] transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm: Resource ── */}
      {deleteResourceId && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#161616]/60 p-4">
          <div className="bg-white border border-[#e0e0e0] p-6 max-w-sm w-full shadow-xl">
            <p className="text-[15px] font-semibold text-[#161616] mb-2">Remove Entry?</p>
            <p className="text-[13px] text-[#525252] mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteResourceId(null)} className="flex-1 py-2 border border-[#e0e0e0] text-[13px] font-semibold hover:border-[#86bc25] transition-colors">Cancel</button>
              <button onClick={() => { removeResourceRelationship(deleteResourceId); setDeleteResourceId(null); }} className="flex-1 py-2 bg-[#da1e28] text-white text-[13px] font-semibold hover:bg-[#b91c1c] transition-colors">Remove</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={genConfirmOpen}
        title="Replace existing data?"
        message="This will replace all existing activities and resources with AI-generated ones."
        confirmLabel="Yes, replace"
        onConfirm={doGenerateValueChain}
        onCancel={() => setGenConfirmOpen(false)}
      />

      {uploadModalOpen && (
        <BulkUploadModal
          title="Bulk Upload Questionnaire"
          description="Upload a filled template (CSV or Excel). Responses are matched by Question ID. Download the template first — it contains your latest question wording."
          onDownloadTemplate={handleDownloadTemplate}
          onFileSelect={handleQuestionnaireFileUpload}
          onClose={() => setUploadModalOpen(false)}
          loading={uploadLoading}
        />
      )}

      {importPreview && (
        <QuestionnaireImportPreview
          rows={importPreview}
          onChange={setImportPreview}
          onApprove={handleApproveQuestionnaireImport}
          onClose={() => setImportPreview(null)}
        />
      )}
    </div>
  );
}
