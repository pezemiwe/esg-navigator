import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Save,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronRight,
  Download,
  Loader2,
  X,
  Building2,
} from "lucide-react";
import {
  useSustainabilityStore,
  type Phase5MetricScore,
} from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import { generateConsolidatedReport } from "../utils/generateConsolidatedReport";
import ApprovalPanel from "../components/ApprovalPanel";
import { generateReportSummary } from "@/services/reportApi";
import { useAuthStore } from "@/store/authStore";
import { UserRole } from "@/config/permissions.config";

// ─── Scoring helpers ──────────────────────────────────────────────────────────
const LIKELIHOOD_LABELS: Record<number, string> = { 0: "—", 1: "Unlikely", 2: "Possible", 3: "Likely", 4: "Almost certain" };
const MAGNITUDE_LABELS: Record<number, string> = { 0: "—", 1: "Low", 2: "Moderate", 3: "High", 4: "Severe" };

function finalScore(l: number, m: number, qual: string, agg: string) {
  const base = l * m;
  if (base === 0) return 0;
  return base * (qual === "Yes" ? 2 : 1) * (agg === "Yes" ? 2 : 1);
}
function isMaterial(fs: number) { return fs >= 6; }
function scoreColor(fs: number) {
  if (fs >= 12) return "bg-[#da1e28] text-white";
  if (fs >= 6) return "bg-[#f59e0b] text-white";
  if (fs > 0) return "bg-[#86bc25] text-white";
  return "bg-[#f4f4f4] text-[#525252]";
}

// ─── Score Select ─────────────────────────────────────────────────────────────
function ScoreSelect({ value, labels, onChange }: { value: number; labels: Record<number, string>; onChange: (v: number) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="w-full appearance-none text-[12px] bg-[#f4f4f4] border-b border-[#8d8d8d] focus:border-[#86bc25] outline-none px-2 py-1.5 pr-7 cursor-pointer transition-all">
        {[0, 1, 2, 3, 4].map((n) => <option key={n} value={n}>{n === 0 ? "—" : `${n} — ${labels[n]}`}</option>)}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-[#525252]" />
    </div>
  );
}

function FlagButton({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {["Yes", "No"].map((v) => (
        <button key={v} onClick={() => onChange(v)}
          className={`text-[11px] font-bold px-2.5 py-1 border transition-colors ${value === v ? (v === "Yes" ? "bg-[#10b981] text-white border-[#10b981]" : "bg-[#da1e28] text-white border-[#da1e28]") : "bg-white text-[#525252] border-[#e0e0e0] hover:border-[#86bc25]"}`}
        >{v}</button>
      ))}
    </div>
  );
}

// ─── Custom SVG Scatter Matrix ────────────────────────────────────────────────
type MatrixPoint = { ref: string; metricName: string; likelihood: number; magnitude: number; final: number; material: boolean };

const CW = 580, CH = 300;
const PAD = { top: 16, right: 24, bottom: 48, left: 52 };
const PW = CW - PAD.left - PAD.right;
const PH = CH - PAD.top - PAD.bottom;
const toX = (l: number) => PAD.left + ((l - 0.5) / 4) * PW;
const toY = (m: number) => PAD.top + ((4.5 - m) / 4) * PH;

function ScatterMatrix({ data }: { data: MatrixPoint[] }) {
  const [tip, setTip] = useState<{ px: number; py: number; d: MatrixPoint } | null>(null);
  const ticks = [1, 2, 3, 4];

  return (
    <div className="relative w-full select-none" onMouseLeave={() => setTip(null)}>
      <svg viewBox={`0 0 ${CW} ${CH}`} className="w-full h-auto" style={{ maxHeight: 320 }}>
        {/* Background zones */}
        <rect x={PAD.left} y={PAD.top} width={PW / 2} height={PH / 2} fill="#fef9c3" opacity={0.4} />
        <rect x={PAD.left + PW / 2} y={PAD.top} width={PW / 2} height={PH / 2} fill="#fee2e2" opacity={0.4} />
        <rect x={PAD.left} y={PAD.top + PH / 2} width={PW / 2} height={PH / 2} fill="#f0fdf4" opacity={0.4} />
        <rect x={PAD.left + PW / 2} y={PAD.top + PH / 2} width={PW / 2} height={PH / 2} fill="#fef9c3" opacity={0.4} />
        {/* Grid lines */}
        {ticks.map((t) => (
          <g key={t}>
            <line x1={toX(t)} y1={PAD.top} x2={toX(t)} y2={PAD.top + PH} stroke="#e0e0e0" strokeWidth={1} />
            <line x1={PAD.left} y1={toY(t)} x2={PAD.left + PW} y2={toY(t)} stroke="#e0e0e0" strokeWidth={1} />
          </g>
        ))}
        {/* Axes */}
        <line x1={PAD.left} y1={PAD.top + PH} x2={PAD.left + PW} y2={PAD.top + PH} stroke="#525252" strokeWidth={1.5} />
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + PH} stroke="#525252" strokeWidth={1.5} />
        {/* X ticks + labels */}
        {ticks.map((t) => (
          <g key={`xt${t}`}>
            <line x1={toX(t)} y1={PAD.top + PH} x2={toX(t)} y2={PAD.top + PH + 4} stroke="#525252" strokeWidth={1} />
            <text x={toX(t)} y={PAD.top + PH + 14} textAnchor="middle" fontSize={9} fill="#525252">{t}</text>
          </g>
        ))}
        {/* Y ticks + labels */}
        {ticks.map((t) => (
          <g key={`yt${t}`}>
            <line x1={PAD.left - 4} y1={toY(t)} x2={PAD.left} y2={toY(t)} stroke="#525252" strokeWidth={1} />
            <text x={PAD.left - 6} y={toY(t) + 3} textAnchor="end" fontSize={9} fill="#525252">{t}</text>
          </g>
        ))}
        {/* Axis labels */}
        <text x={PAD.left + PW / 2} y={CH - 4} textAnchor="middle" fontSize={10} fill="#525252" fontWeight="600">Likelihood →</text>
        <text x={12} y={PAD.top + PH / 2} textAnchor="middle" fontSize={10} fill="#525252" fontWeight="600" transform={`rotate(-90, 12, ${PAD.top + PH / 2})`}>Magnitude →</text>
        {/* Materiality threshold line: L×M = 6 approximated as curve */}
        <text x={toX(3.2)} y={toY(2) - 6} fontSize={8} fill="#da1e28" opacity={0.7}>≥ 6 threshold</text>
        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={toX(d.likelihood)}
            cy={toY(d.magnitude)}
            r={7}
            fill={d.material ? "#da1e28" : "#86bc25"}
            opacity={0.82}
            stroke="white"
            strokeWidth={1.5}
            className="cursor-pointer"
            onMouseEnter={(e) => {
              const svgRect = (e.currentTarget.closest("svg") as SVGSVGElement).getBoundingClientRect();
              const cx = toX(d.likelihood) / CW * svgRect.width + svgRect.left;
              const cy = toY(d.magnitude) / CH * svgRect.height + svgRect.top;
              setTip({ px: cx, py: cy, d });
            }}
          />
        ))}
        {data.length === 0 && (
          <text x={CW / 2} y={CH / 2} textAnchor="middle" fontSize={12} fill="#8d8d8d">No scored metrics yet</text>
        )}
      </svg>
      {tip && (
        <div
          className="fixed z-50 bg-white border border-[#e0e0e0] shadow-lg p-3 max-w-[220px] text-[12px] pointer-events-none"
          style={{ left: tip.px + 12, top: tip.py - 10 }}
        >
          <p className="font-bold text-[#161616] mb-0.5">{tip.d.ref}</p>
          <p className="text-[#525252] text-[11px] mb-1 leading-snug">{tip.d.metricName}</p>
          <p className="text-[#525252]">L={tip.d.likelihood} × M={tip.d.magnitude}</p>
          <p className="text-[#525252]">Final: <span className="font-bold">{tip.d.final}</span> → {tip.d.material ? "Material" : "Not Material"}</p>
        </div>
      )}
    </div>
  );
}

// ─── Scoring Detail Modal ─────────────────────────────────────────────────────
type ScoringRowData = {
  ref: string; title: string; type: string; srroCrro: string;
  valueChainStage: string; sasbSector: string; sasbIndustry: string;
  metrics: string[]; metricScores: Phase5MetricScore[];
  srroMaterial: boolean; topScore: number;
};

function ScoringDetailModal({ row, onUpdateMetric, onClose }: {
  row: ScoringRowData;
  onUpdateMetric: (metricName: string, updates: Partial<Phase5MetricScore>) => void;
  onClose: () => void;
}) {
  const getScore = (metric: string): Phase5MetricScore =>
    row.metricScores.find((s) => s.metricName === metric) ??
    { metricName: metric, likelihood: 0, magnitude: 0, qualitativeFlag: "", aggregationFlag: "" };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#161616]/70 p-4" onClick={onClose}>
      <div
        className="bg-white w-full max-w-5xl max-h-[90vh] flex flex-col border border-[#e0e0e0] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-[#e0e0e0] bg-[#f4f4f4] shrink-0">
          <span className="text-[11px] font-bold text-[#86bc25] min-w-8">{row.ref}</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 ${row.srroCrro === "CRRO" ? "bg-[#dbeafe] text-[#1d4ed8]" : "bg-[#f4f4f4] border border-[#e0e0e0] text-[#525252]"}`}>
            {row.srroCrro}
          </span>
          {row.type === "Risk"
            ? <AlertTriangle className="w-3.5 h-3.5 text-[#da1e28]" />
            : <TrendingUp className="w-3.5 h-3.5 text-[#10b981]" />
          }
          <span className="text-[14px] font-semibold text-[#161616] flex-1">{row.title}</span>
          <div className="flex items-center gap-2 shrink-0">
            {row.sasbIndustry && (
              <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#f4fadc] text-[#435e12] border border-[#86bc25]/40">
                {row.sasbIndustry}
              </span>
            )}
            {row.topScore > 0 && (
              <span className={`text-[11px] font-bold px-2.5 py-1 ${row.srroMaterial ? "bg-[#da1e28] text-white" : "bg-[#f4f4f4] text-[#525252] border border-[#e0e0e0]"}`}>
                {row.srroMaterial ? "Material" : "Not Material"}
              </span>
            )}
            <button onClick={onClose} className="p-1.5 hover:bg-[#e0e0e0] transition-colors ml-2">
              <X className="w-4 h-4 text-[#525252]" />
            </button>
          </div>
        </div>

        {/* Formula reminder */}
        <div className="flex items-center gap-2 px-6 py-2.5 bg-[#f4fadc] border-b border-[#86bc25]/20 shrink-0">
          <Info className="w-3.5 h-3.5 text-[#86bc25] shrink-0" />
          <p className="text-[11px] text-[#435e12]">
            <strong>Final Score</strong> = L × M × (×2 Qualitative) × (×2 Aggregation). Threshold: <strong>≥ 6 → Material</strong>
          </p>
        </div>

        {/* Metric table */}
        <div className="overflow-auto flex-1">
          {row.metrics.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-[13px] text-[#8d8d8d] italic">
              No metrics assigned. Go to Phase 4 to add metrics for this item.
            </div>
          ) : (
            <table className="w-full text-left border-collapse" style={{ minWidth: 860 }}>
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#161616] text-white text-[10px] uppercase tracking-wide">
                  <th className="px-5 py-3 min-w-52">Metric</th>
                  <th className="px-4 py-3 w-44">Likelihood</th>
                  <th className="px-4 py-3 w-44">Magnitude</th>
                  <th className="px-4 py-3 w-16 text-center">Score</th>
                  <th className="px-4 py-3 w-28 text-center">Qualitative?</th>
                  <th className="px-4 py-3 w-28 text-center">Aggregation?</th>
                  <th className="px-4 py-3 w-16 text-center">Final</th>
                  <th className="px-4 py-3 w-28 text-center">Materiality</th>
                </tr>
              </thead>
              <tbody>
                {row.metrics.map((metric, idx) => {
                  const s = getScore(metric);
                  const quant = s.likelihood * s.magnitude;
                  const fs = finalScore(s.likelihood, s.magnitude, s.qualitativeFlag, s.aggregationFlag);
                  const mat = isMaterial(fs);
                  return (
                    <tr key={metric} className={`border-t border-[#e0e0e0] ${idx % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}>
                      <td className="px-5 py-3 text-[12px] font-medium text-[#161616] leading-snug">{metric}</td>
                      <td className="px-4 py-2.5">
                        <ScoreSelect value={s.likelihood} labels={LIKELIHOOD_LABELS} onChange={(v) => onUpdateMetric(metric, { likelihood: v })} />
                      </td>
                      <td className="px-4 py-2.5">
                        <ScoreSelect value={s.magnitude} labels={MAGNITUDE_LABELS} onChange={(v) => onUpdateMetric(metric, { magnitude: v })} />
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${quant >= 12 ? "bg-[#da1e28] text-white" : quant >= 6 ? "bg-[#f59e0b] text-white" : quant >= 3 ? "bg-[#86bc25] text-white" : "bg-[#f4f4f4] text-[#525252]"}`}>
                          {quant || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-center">
                          <FlagButton value={s.qualitativeFlag} onChange={(v) => onUpdateMetric(metric, { qualitativeFlag: v as "Yes" | "No" })} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-center">
                          <FlagButton value={s.aggregationFlag} onChange={(v) => onUpdateMetric(metric, { aggregationFlag: v as "Yes" | "No" })} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${scoreColor(fs)}`}>{fs || "—"}</span>
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        {fs > 0 ? (
                          <span className={`text-[11px] font-bold px-2.5 py-1 border whitespace-nowrap ${mat ? "bg-[#da1e28] text-white border-[#da1e28]" : "bg-[#f4f4f4] text-[#525252] border-[#e0e0e0]"}`}>
                            {mat ? "Material" : "Not Material"}
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#c6c6c6] italic">Pending</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-3 border-t border-[#e0e0e0] shrink-0">
          <button onClick={onClose} className="px-5 py-2 text-[13px] font-semibold border border-[#e0e0e0] hover:border-[#86bc25] text-[#525252] hover:text-[#161616] transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SRRO scoring row (click opens modal) ────────────────────────────────────
function SrroScoringRow({ row, onOpenModal }: { row: ScoringRowData; onOpenModal: () => void }) {
  const getScore = (metric: string): Phase5MetricScore =>
    row.metricScores.find((s) => s.metricName === metric) ??
    { metricName: metric, likelihood: 0, magnitude: 0, qualitativeFlag: "", aggregationFlag: "" };

  const scoredCount = row.metrics.filter((m) => {
    const s = getScore(m);
    return s.likelihood > 0 && s.magnitude > 0;
  }).length;

  return (
    <div
      className="bg-white border border-[#e0e0e0] mb-2 flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-[#fafafa] hover:border-[#86bc25]/50 transition-all group"
      onClick={onOpenModal}
    >
      <span className="text-[11px] font-bold text-[#86bc25] min-w-8 shrink-0">{row.ref}</span>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 shrink-0 ${row.srroCrro === "CRRO" ? "bg-[#dbeafe] text-[#1d4ed8]" : "bg-[#f4f4f4] text-[#525252]"}`}>
        {row.srroCrro}
      </span>
      {row.type === "Risk"
        ? <AlertTriangle className="w-3 h-3 text-[#da1e28] shrink-0" />
        : <TrendingUp className="w-3 h-3 text-[#10b981] shrink-0" />
      }
      <span className="text-[13px] font-semibold text-[#161616] truncate flex-1">{row.title}</span>

      <div className="flex items-center gap-2 shrink-0">
        {row.sasbIndustry && (
          <span className="text-[10px] font-semibold px-2 py-0.5 bg-[#f4fadc] text-[#435e12] border border-[#86bc25]/40 truncate max-w-35 hidden sm:block">
            {row.sasbIndustry}
          </span>
        )}
        <span className="text-[10px] text-[#525252]">{scoredCount}/{row.metrics.length} scored</span>
        {row.topScore > 0 ? (
          <span className={`text-[11px] font-bold px-2.5 py-0.5 whitespace-nowrap ${row.srroMaterial ? "bg-[#da1e28] text-white" : "bg-[#f4f4f4] text-[#525252] border border-[#e0e0e0]"}`}>
            {row.srroMaterial ? "Material" : "Not Material"}
          </span>
        ) : (
          <span className="text-[11px] text-[#c6c6c6] italic">Pending</span>
        )}
        <ChevronRight className="w-4 h-4 text-[#c6c6c6] group-hover:text-[#86bc25] transition-colors shrink-0" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MaterialityAssessmentPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isClient = user?.role === UserRole.CLIENT;
  const {
    srroItems, phase4Entries, phase5Items, upsertPhase5MetricScore,
    governanceAssessment, valueChain, isGroupAssessment, groupName, assessmentEntities,
    activeEntityId, entitySnapshots, switchActiveEntity,
    reportApproval, submitReportForReview, approveReport, rejectReport, resetReportApproval,
    saveCurrentProject,
  } = useSustainabilityStore(
    useShallow((s) => ({
      srroItems: s.srroItems,
      phase4Entries: s.phase4Entries,
      phase5Items: s.phase5Items,
      upsertPhase5MetricScore: s.upsertPhase5MetricScore,
      governanceAssessment: s.governanceAssessment,
      valueChain: s.valueChain,
      isGroupAssessment: s.isGroupAssessment,
      groupName: s.groupName,
      assessmentEntities: s.assessmentEntities,
      activeEntityId: s.activeEntityId,
      entitySnapshots: s.entitySnapshots,
      switchActiveEntity: s.switchActiveEntity,
      reportApproval: s.reportApproval,
      submitReportForReview: s.submitReportForReview,
      approveReport: s.approveReport,
      rejectReport: s.rejectReport,
      resetReportApproval: s.resetReportApproval,
      saveCurrentProject: s.saveCurrentProject,
    })),
  );
  const reportApproved = reportApproval.status === "approved";
  const [saved, setSaved] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [filterMaterial, setFilterMaterial] = useState<"All" | "Material" | "Not Material">("All");
  const [activeView, setActiveView] = useState<"table" | "matrix">("table");
  const [modalRef, setModalRef] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 400); return () => clearTimeout(t); }, []);

  // Build combined rows
  const rows = useMemo(() => {
    const finalRefs = srroItems.filter((i) => i.includeInFinalList === "Yes").map((i) => i.ref);
    return finalRefs.map((ref) => {
      const srro = srroItems.find((i) => i.ref === ref)!;
      const p4 = phase4Entries.find((e) => e.ref === ref);
      const p5 = phase5Items.find((p) => p.ref === ref);
      const metricScores: Phase5MetricScore[] = p5?.metricScores ?? [];

      // All metrics for this SRRO (selected + additional parsed)
      const selectedMetrics = p4?.selectedMetrics ?? [];
      const additionalParsed = p4?.additionalMetrics
        ? p4.additionalMetrics.split(/[,\n]+/).map((m) => m.trim()).filter(Boolean)
        : [];
      const allMetrics = [...new Set([...selectedMetrics, ...additionalParsed])];

      // Compute per-metric scores
      const scoredMetrics = allMetrics.map((metric) => {
        const s = metricScores.find((ms) => ms.metricName === metric) ??
          { metricName: metric, likelihood: 0, magnitude: 0, qualitativeFlag: "" as const, aggregationFlag: "" as const };
        const fs = finalScore(s.likelihood, s.magnitude, s.qualitativeFlag, s.aggregationFlag);
        return { metric, score: s, final: fs, material: isMaterial(fs) };
      });

      const topScore = Math.max(0, ...scoredMetrics.map((m) => m.final));
      const srroMaterial = isMaterial(topScore);

      return {
        ref, srro, p4, metricScores,
        metrics: allMetrics,
        scoredMetrics,
        topScore,
        srroMaterial,
        sasbSector: p4?.sasbSector ?? "",
        sasbIndustry: p4?.sasbIndustry ?? "",
      };
    });
  }, [srroItems, phase4Entries, phase5Items]);

  const visible = useMemo(() => {
    if (filterMaterial === "All") return rows;
    return rows.filter((r) => (filterMaterial === "Material") === r.srroMaterial);
  }, [rows, filterMaterial]);

  const stats = useMemo(() => ({
    total: rows.length,
    material: rows.filter((r) => r.srroMaterial).length,
    notMaterial: rows.filter((r) => !r.srroMaterial && r.topScore > 0).length,
    pending: rows.filter((r) => r.topScore === 0).length,
  }), [rows]);

  // Scatter data: one point per metric
  const scatterData = useMemo(() =>
    rows.flatMap((r) =>
      r.scoredMetrics
        .filter((m) => m.score.likelihood > 0 && m.score.magnitude > 0)
        .map((m) => ({
          ref: r.ref,
          metricName: m.metric,
          likelihood: m.score.likelihood,
          magnitude: m.score.magnitude,
          final: m.final,
          material: m.material,
        })),
    ),
    [rows],
  );

  // Derive modal row from live store data so dropdowns update immediately on selection
  const modalRow = useMemo((): ScoringRowData | null => {
    if (!modalRef) return null;
    const row = rows.find((r) => r.ref === modalRef);
    if (!row) return null;
    return {
      ref: row.ref,
      title: row.srro?.title ?? "",
      type: row.srro?.type ?? "",
      srroCrro: row.srro?.srroCrro ?? "",
      valueChainStage: row.srro?.valueChainStage ?? "",
      sasbSector: row.sasbSector,
      sasbIndustry: row.sasbIndustry,
      metrics: row.metrics,
      metricScores: row.metricScores,
      srroMaterial: row.srroMaterial,
      topScore: row.topScore,
    };
  }, [modalRef, rows]);

  const handleSave = () => { saveCurrentProject(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const handleDownloadReport = async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const materialItems = rows
        .filter((r) => r.srroMaterial)
        .flatMap((r) =>
          r.scoredMetrics
            .filter((m) => m.material)
            .map((m) => ({
              ref: r.ref,
              title: r.srro?.title ?? "",
              metric: m.metric,
              finalScore: m.final,
            })),
        );

      const scoreMap: Record<string, number> = { "No integration": 1, "Limited integration": 2, Integrated: 3 };
      const govScores = Object.values(governanceAssessment.questions ?? {})
        .map((q) => scoreMap[q.score ?? ""] ?? 0)
        .filter((s) => s > 0);
      const govAvg = govScores.length ? govScores.reduce((a, b) => a + b, 0) / govScores.length : 0;
      const govRating = govAvg >= 2.5 ? "Integrated" : govAvg >= 1.5 ? "Limited integration" : "No integration";
      const gapCount = Object.values(governanceAssessment.questions ?? {}).filter((q) => q.gapIdentified === "Yes").length;

      let aiSummary: string | undefined;
      try {
        aiSummary = await generateReportSummary({
          clientName: governanceAssessment.clientName,
          sector: governanceAssessment.sector,
          geography: governanceAssessment.geography,
          governanceRating: govRating,
          governanceAvg: govAvg,
          gapCount,
          srroCount: rows.length,
          materialCount: stats.material,
          materialItems,
        });
      } catch {
        aiSummary = undefined;
      }

      generateConsolidatedReport({
        governanceAssessment,
        valueChain,
        srroItems,
        phase4Entries,
        phase5Items,
        isGroupAssessment,
        groupName,
        assessmentEntities,
        entitySnapshots,
        aiSummary,
      });
    } catch (err) {
      setReportError(err instanceof Error ? err.message : "Report generation failed");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
    <div className="min-h-full bg-[#f4f4f4] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#e0e0e0] px-8 py-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-[#86bc25]" />
              <span className="text-[#86bc25] font-bold text-[10px] tracking-widest uppercase">Phase 5</span>
            </div>
            <h1 className="text-[22px] font-semibold text-[#161616]">Materiality Assessment</h1>
            <p className="text-[13px] text-[#525252] mt-1 max-w-2xl">
              Score each metric assigned to your SRROs/CRROs. A metric with a Final Score ≥ 6 makes its SRRO/CRRO material.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadReport}
              disabled={reportLoading || !reportApproved}
              title={!reportApproved ? "Report must be reviewed and approved before downloading" : ""}
              className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${reportApproved ? "border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25] hover:text-white" : "border-[#e0e0e0] text-[#8d8d8d]"}`}
            >
              {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {reportLoading ? "Generating…" : "Download Report"}
            </button>
            <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold transition-colors ${saved ? "bg-[#10b981] text-white" : "bg-[#161616] text-white hover:bg-[#86bc25]"}`}>
              {saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-4 gap-px bg-[#e0e0e0] border border-[#e0e0e0] mt-5">
          {[
            { label: "SRROs / CRROs", value: stats.total, color: "text-[#161616]" },
            { label: "Material", value: stats.material, color: "text-[#da1e28]" },
            { label: "Not Material", value: stats.notMaterial, color: "text-[#525252]" },
            { label: "Pending Score", value: stats.pending, color: "text-[#f59e0b]" },
          ].map((k) => (
            <div key={k.label} className="bg-white px-6 py-4 text-center">
              <p className="text-[11px] uppercase font-semibold text-[#525252] mb-1">{k.label}</p>
              <p className={`text-[28px] font-light ${k.color}`}>{k.value}</p>
            </div>
          ))}
        </div>

        {/* View + filter tabs */}
        <div className="flex items-center justify-between mt-5">
          <div className="flex gap-0 border-b border-[#e0e0e0] -mb-px">
            {[{ id: "table", label: "Scoring Table" }, { id: "matrix", label: "Materiality Matrix" }].map((tab) => (
              <button key={tab.id} onClick={() => setActiveView(tab.id as typeof activeView)}
                className={`px-5 py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${activeView === tab.id ? "border-[#86bc25] text-[#161616]" : "border-transparent text-[#525252] hover:text-[#161616]"}`}
              >{tab.label}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["All", "Material", "Not Material"] as const).map((f) => (
              <button key={f} onClick={() => setFilterMaterial(f)}
                className={`px-3 py-1.5 text-[12px] font-semibold border transition-colors ${filterMaterial === f ? "bg-[#161616] text-white border-[#161616]" : "border-[#e0e0e0] text-[#525252] hover:border-[#86bc25]"}`}
              >{f}</button>
            ))}
          </div>
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
            const ph5 = snap?.phase5Items ?? [];
            const ph3 = snap?.srroItems ?? [];
            const finalSnap = ph3.filter((i) => i.includeInFinalList === "Yes");
            const scored = finalSnap.filter((i) => ph5.some((p) => p.ref === i.ref && p.metricScores.some((sc) => sc.likelihood > 0 || sc.magnitude > 0))).length;
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
                {finalSnap.length > 0 && scored === finalSnap.length && <span className="w-1.5 h-1.5 rounded-full bg-[#86bc25] inline-block" />}
              </button>
            );
          })}
        </div>
      )}

      <div className="px-6 py-6 w-full max-w-7xl">
        {/* Scoring guide */}
        <div className="flex items-start gap-3 bg-[#f4fadc] border border-[#86bc25]/30 px-4 py-3 mb-5">
          <Info className="w-4 h-4 text-[#86bc25] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#435e12]">
            <strong>Final Score</strong> = Likelihood × Magnitude × (×2 if Qualitative = Yes) × (×2 if Aggregation = Yes). Threshold: <strong>Final ≥ 6 → Material</strong>. An SRRO/CRRO is material if <em>any one of its metrics</em> reaches the threshold. Click a row to expand and score its metrics.
          </p>
        </div>

        {activeView === "table" && (
          <div className="space-y-1">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white border border-[#e0e0e0] px-4 py-3 flex items-center gap-3 animate-pulse">
                    <div className="w-4 h-4 bg-[#e0e0e0] rounded" />
                    <div className="w-8 h-3 bg-[#e0e0e0] rounded" />
                    <div className="w-10 h-4 bg-[#e0e0e0] rounded" />
                    <div className="flex-1 h-3 bg-[#e0e0e0] rounded" />
                    <div className="w-20 h-3 bg-[#e0e0e0] rounded" />
                    <div className="w-20 h-6 bg-[#e0e0e0] rounded" />
                  </div>
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="bg-white border border-[#e0e0e0] py-16 text-center">
                <p className="text-[14px] text-[#525252]">No items to display.</p>
              </div>
            ) : (
              <>
                {visible.map((row) => {
                  const rowData: ScoringRowData = {
                    ref: row.ref,
                    title: row.srro?.title ?? "",
                    type: row.srro?.type ?? "",
                    srroCrro: row.srro?.srroCrro ?? "",
                    valueChainStage: row.srro?.valueChainStage ?? "",
                    sasbSector: row.sasbSector,
                    sasbIndustry: row.sasbIndustry,
                    metrics: row.metrics,
                    metricScores: row.metricScores,
                    srroMaterial: row.srroMaterial,
                    topScore: row.topScore,
                  };
                  return (
                    <SrroScoringRow
                      key={row.ref}
                      row={rowData}
                      onOpenModal={() => setModalRef(row.ref)}
                    />
                  );
                })}
              </>
            )}
          </div>
        )}

        {activeView === "matrix" && (
          <div className="bg-white border border-[#e0e0e0] p-6">
            <h3 className="text-[15px] font-semibold text-[#161616] mb-1">Materiality Matrix</h3>
            <p className="text-[12px] text-[#525252] mb-6">Each dot is a metric. Red = Material (Final ≥ 6). Green = Not Material.</p>
            <ScatterMatrix data={scatterData} />
            <div className="flex items-center gap-5 justify-center mt-4 text-[12px]">
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#da1e28] inline-block" /> Material (Final ≥ 6)</span>
              <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#86bc25] inline-block" /> Not Material (Final &lt; 6)</span>
            </div>

            {/* Material SRROs list */}
            {stats.material > 0 && (
              <div className="mt-6 border-t border-[#e0e0e0] pt-5">
                <p className="text-[12px] font-bold text-[#161616] uppercase tracking-wide mb-3">{stats.material} Material SRROs / CRROs</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {rows.filter((r) => r.srroMaterial).sort((a, b) => b.topScore - a.topScore).map((r) => (
                    <div key={r.ref} className="flex items-center gap-3 bg-[#fff1f1] border border-[#da1e28]/20 px-4 py-2.5">
                      <span className="text-[11px] font-bold text-[#86bc25] min-w-8">{r.ref}</span>
                      <span className="text-[12px] font-semibold text-[#161616] flex-1 leading-tight">{r.srro?.title}</span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${scoreColor(r.topScore)}`}>{r.topScore}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Approval Panel */}
        <div className="mt-8">
          {isClient ? (
            <ApprovalPanel
              approval={reportApproval}
              phase="report"
              title="Materiality Assessment — Review & Approval"
              subtitle="Review the completed materiality scoring and approve or request revisions before the consolidated report is generated."
              itemCount={stats.total}
              itemLabel="SRROs/CRROs assessed"
              isLocked={true}
              onSubmit={submitReportForReview}
              onApprove={approveReport}
              onReject={rejectReport}
              onReset={resetReportApproval}
            />
          ) : (
            <ApprovalPanel
              approval={reportApproval}
              phase="report"
              title="Materiality Assessment — Review Status"
              subtitle="Awaiting client review and approval before the consolidated report can be generated."
              itemCount={stats.total}
              itemLabel="SRROs/CRROs assessed"
              isLocked={true}
              onSubmit={() => {}}
              onApprove={() => {}}
              onReject={() => {}}
              onReset={() => {}}
              clientView
            />
          )}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button onClick={() => navigate("/sustainability/material-information")} className="px-5 py-2.5 border border-[#e0e0e0] text-[13px] font-semibold text-[#161616] hover:border-[#86bc25] transition-colors">
            ← Back to Phase 4
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadReport}
              disabled={reportLoading || !reportApproved}
              title={!reportApproved ? "Approved report required before downloading" : ""}
              className={`flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold border-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${reportApproved ? "border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25] hover:text-white" : "border-[#e0e0e0] text-[#8d8d8d]"}`}
            >
              {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {reportLoading ? "Generating…" : "Download Consolidated Report"}
            </button>
            {reportError && (
              <p className="text-[12px] text-[#da1e28]">{reportError}</p>
            )}
            <button
              onClick={() => navigate("/sustainability/materiality")}
              disabled={!reportApproved}
              title={!reportApproved ? "Report must be approved before material metrics move to Data Management" : ""}
              className="flex items-center gap-2 bg-[#86bc25] text-white px-6 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Data Collection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    {modalRow && (
      <ScoringDetailModal
        row={modalRow}
        onUpdateMetric={(metricName, updates) => upsertPhase5MetricScore(modalRow.ref, metricName, updates)}
        onClose={() => setModalRef(null)}
      />
    )}
    </>
  );
}
