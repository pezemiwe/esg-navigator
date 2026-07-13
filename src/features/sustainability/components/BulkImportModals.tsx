import { useState } from "react";
import { X, CheckCircle2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import type { SRROItem } from "@/store/sustainabilityStore";
import type { QuestionnaireImportRow } from "../utils/questionnaireImportExport";

// ─── Questionnaire preview ────────────────────────────────────────────────────

interface QuestionnairePreviewProps {
  rows: QuestionnaireImportRow[];
  onChange: (rows: QuestionnaireImportRow[]) => void;
  onApprove: () => void;
  onClose: () => void;
}

export function QuestionnaireImportPreview({
  rows,
  onChange,
  onApprove,
  onClose,
}: QuestionnairePreviewProps) {
  const filled = rows.filter((r) => r.answer.trim()).length;

  const updateAnswer = (id: string, answer: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, answer } : r)));
  };

  const removeRow = (id: string) => {
    onChange(rows.filter((r) => r.id !== id));
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#161616]/60 p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] flex flex-col border border-[#e0e0e0] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4]">
          <div>
            <h3 className="text-[15px] font-semibold text-[#161616]">Review Imported Responses</h3>
            <p className="text-[12px] text-[#525252] mt-0.5">
              {filled} of {rows.length} responses ready to import. Edit any answer before approving.
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#e0e0e0] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-[#161616] text-white text-[10px] uppercase tracking-wide">
                <th className="px-4 py-2.5 w-24">Section</th>
                <th className="px-4 py-2.5">Question</th>
                <th className="px-4 py-2.5 w-[45%]">Answer</th>
                <th className="px-4 py-2.5 w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.id} className={`border-t border-[#e0e0e0] ${idx % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}>
                  <td className="px-4 py-2 text-[11px] text-[#525252] align-top">
                    <span className="font-semibold text-[#86bc25]">{row.section}</span>
                    {row.parameter && <span className="block text-[10px] mt-0.5">{row.parameter}</span>}
                  </td>
                  <td className="px-4 py-2 text-[12px] text-[#161616] align-top leading-snug">{row.question}</td>
                  <td className="px-3 py-1.5 align-top">
                    <textarea
                      rows={2}
                      value={row.answer}
                      onChange={(e) => updateAnswer(row.id, e.target.value)}
                      className="w-full bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] text-[#161616] px-2 py-1.5 resize-none"
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <button
                      onClick={() => removeRow(row.id)}
                      title="Remove from import"
                      className="p-1 hover:bg-[#fff1f1] text-[#da1e28] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e0e0e0]">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#e0e0e0] text-[13px] font-semibold text-[#525252] hover:border-[#da1e28] hover:text-[#da1e28] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApprove}
            disabled={filled === 0}
            className="flex items-center gap-2 px-5 py-2 bg-[#86bc25] text-white text-[13px] font-semibold hover:bg-[#70a31d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve &amp; Import {filled} Response{filled !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SRRO preview ─────────────────────────────────────────────────────────────

const STAGE_OPTS = ["Upstream", "Core", "Downstream"] as const;
const HORIZON_OPTS = ["Short", "Medium", "Long"] as const;
const TYPE_OPTS = ["Risk", "Opportunity"] as const;
const SRRO_CRRO_OPTS = ["SRRO", "CRRO"] as const;
const YES_NO = ["Yes", "No"] as const;

interface SrroPreviewProps {
  items: Omit<SRROItem, "id">[];
  onChange: (items: Omit<SRROItem, "id">[]) => void;
  onApprove: () => void;
  onClose: () => void;
  source: string;
  aiEnriched?: boolean;
}

export function SrroImportPreview({
  items,
  onChange,
  onApprove,
  onClose,
  source,
  aiEnriched,
}: SrroPreviewProps) {
  const [expandedId, setExpandedId] = useState<number | null>(0);

  const updateItem = (idx: number, patch: Partial<Omit<SRROItem, "id">>) => {
    onChange(items.map((item, i) => (i === idx ? { ...item, ...patch } : item)));
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
    setExpandedId(null);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#161616]/60 p-4">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] flex flex-col border border-[#e0e0e0] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4]">
          <div>
            <h3 className="text-[15px] font-semibold text-[#161616]">Review Imported SRRO/CRRO Items</h3>
            <p className="text-[12px] text-[#525252] mt-0.5">
              Source: <strong>{source}</strong>
              {aiEnriched && (
                <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-[#ede9fe] text-[#5b21b6]">AI Enriched</span>
              )}
              {" · "}{items.length} item{items.length !== 1 ? "s" : ""} ready to add
            </p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-[#e0e0e0] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.map((item, idx) => {
            const expanded = expandedId === idx;
            return (
              <div key={idx} className="border border-[#e0e0e0] bg-white">
                <button
                  onClick={() => setExpandedId(expanded ? null : idx)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#fafafa] transition-colors"
                >
                  <span className="text-[11px] font-bold text-[#86bc25] w-10">{item.ref}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 shrink-0 ${
                    item.type === "Risk" ? "bg-[#fff1f1] text-[#da1e28]" :
                    item.type === "Opportunity" ? "bg-[#f0fdf4] text-[#10b981]" :
                    "bg-[#f4f4f4] text-[#8d8d8d]"
                  }`}>{item.type || "—"}</span>
                  <span className="flex-1 text-[13px] font-semibold text-[#161616] truncate">{item.title || "Untitled"}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 ${
                    item.srroCrro === "CRRO" ? "bg-[#dbeafe] text-[#1d4ed8]" : "bg-[#f4f4f4] text-[#525252]"
                  }`}>{item.srroCrro || "—"}</span>
                  {expanded ? <ChevronUp className="w-4 h-4 text-[#525252]" /> : <ChevronDown className="w-4 h-4 text-[#525252]" />}
                </button>

                {expanded && (
                  <div className="px-4 pb-4 border-t border-[#e0e0e0] pt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-semibold text-[#525252] uppercase tracking-wide">Title</label>
                      <input
                        value={item.title}
                        onChange={(e) => updateItem(idx, { title: e.target.value })}
                        className="w-full mt-0.5 bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] px-2 py-1.5"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-[10px] font-semibold text-[#525252] uppercase tracking-wide">Description</label>
                      <textarea
                        rows={3}
                        value={item.description}
                        onChange={(e) => updateItem(idx, { description: e.target.value })}
                        className="w-full mt-0.5 bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] px-2 py-1.5 resize-none"
                      />
                    </div>
                    {[
                      { label: "Type", key: "type" as const, opts: TYPE_OPTS },
                      { label: "Value Chain Stage", key: "valueChainStage" as const, opts: STAGE_OPTS },
                      { label: "SRRO / CRRO", key: "srroCrro" as const, opts: SRRO_CRRO_OPTS },
                      { label: "Time Horizon", key: "timeHorizon" as const, opts: HORIZON_OPTS },
                      { label: "Financial Impact", key: "financialImpact" as const, opts: YES_NO },
                      { label: "Strategic Impact", key: "strategicImpact" as const, opts: YES_NO },
                      { label: "Operational Impact", key: "operationalImpact" as const, opts: YES_NO },
                      { label: "Needed by Primary User", key: "neededByPrimaryUser" as const, opts: YES_NO },
                      { label: "Include in Final List", key: "includeInFinalList" as const, opts: YES_NO },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="text-[10px] font-semibold text-[#525252] uppercase tracking-wide">{f.label}</label>
                        <select
                          value={item[f.key]}
                          onChange={(e) => updateItem(idx, { [f.key]: e.target.value })}
                          className="w-full mt-0.5 bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] px-2 py-1.5"
                        >
                          <option value="">—</option>
                          {f.opts.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                    <div>
                      <label className="text-[10px] font-semibold text-[#525252] uppercase tracking-wide">Likelihood (1–4)</label>
                      <select
                        value={item.likelihood}
                        onChange={(e) => updateItem(idx, { likelihood: Number(e.target.value) })}
                        className="w-full mt-0.5 bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] px-2 py-1.5"
                      >
                        {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n === 0 ? "—" : n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-[#525252] uppercase tracking-wide">Magnitude (1–4)</label>
                      <select
                        value={item.magnitude}
                        onChange={(e) => updateItem(idx, { magnitude: Number(e.target.value) })}
                        className="w-full mt-0.5 bg-[#f4f4f4] border border-[#e0e0e0] focus:border-[#86bc25] outline-none text-[12px] px-2 py-1.5"
                      >
                        {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n === 0 ? "—" : n}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button
                        onClick={() => removeItem(idx)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-[#da1e28] hover:bg-[#fff1f1] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove item
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#e0e0e0]">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#e0e0e0] text-[13px] font-semibold text-[#525252] hover:border-[#da1e28] hover:text-[#da1e28] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onApprove}
            disabled={items.length === 0 || items.some((i) => !i.title)}
            className="flex items-center gap-2 px-5 py-2 bg-[#86bc25] text-white text-[13px] font-semibold hover:bg-[#70a31d] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Approve &amp; Add {items.length} Item{items.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Bulk upload trigger modal ────────────────────────────────────────────────

interface BulkUploadModalProps {
  title: string;
  description: string;
  onDownloadTemplate: () => void;
  onFileSelect: (file: File) => void;
  onClose: () => void;
  loading?: boolean;
  accept?: string;
}

export function BulkUploadModal({
  title,
  description,
  onDownloadTemplate,
  onFileSelect,
  onClose,
  loading,
  accept = ".csv,.xlsx,.xls",
}: BulkUploadModalProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["csv", "xlsx", "xls"].includes(ext)) return;
    onFileSelect(file);
  };

  return (
    <div className="fixed inset-0 z-[350] flex items-center justify-center bg-[#161616]/60 p-4">
      <div className="bg-white w-full max-w-lg border border-[#e0e0e0] shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4]">
          <h3 className="text-[15px] font-semibold text-[#161616]">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-[#e0e0e0] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-[12px] text-[#525252] mb-5 leading-relaxed">{description}</p>

          <div
            onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
            className={`text-center py-8 px-4 border-2 border-dashed transition-colors ${
              dragActive ? "border-[#86bc25] bg-[#f4fadc]" : "border-[#86bc25]/40 bg-[#86bc25]/5"
            }`}
          >
            <p className="text-[13px] font-semibold text-[#161616] mb-1">
              {loading ? "Processing…" : "Drop your file here"}
            </p>
            <p className="text-[11px] text-[#525252] mb-4">Supports CSV and Excel (.xlsx)</p>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={onDownloadTemplate}
                className="flex items-center gap-2 px-4 py-2 border border-[#86bc25]/50 text-[#435e12] text-[12px] font-semibold hover:bg-[#f4fadc] transition-colors"
              >
                Download Template
              </button>
              <label className={`flex items-center gap-2 px-5 py-2 bg-[#161616] text-white text-[12px] font-semibold hover:bg-[#86bc25] transition-colors cursor-pointer ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                Select File
                <input
                  type="file"
                  className="hidden"
                  accept={accept}
                  onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                  disabled={loading}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
