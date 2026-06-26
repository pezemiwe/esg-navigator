import { useMemo, useState } from "react";
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
} from "lucide-react";
import {
  useSustainabilityStore,
  type Phase5MetricScore,
} from "@/store/sustainabilityStore";
import { useShallow } from "zustand/react/shallow";
import { generateConsolidatedReport } from "../utils/generateConsolidatedReport";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";

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

// ─── Custom Scatter Tooltip ───────────────────────────────────────────────────
function MatrixTooltip({ active, payload }: { active?: boolean; payload?: { payload: { ref: string; metricName: string; likelihood: number; magnitude: number; final: number; material: boolean } }[] }) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-[#e0e0e0] shadow-lg p-3 max-w-[240px] text-[12px]">
      <p className="font-bold text-[#161616] mb-0.5">{d.ref}</p>
      <p className="text-[#525252] text-[11px] mb-1 leading-snug">{d.metricName}</p>
      <p className="text-[#525252]">L={d.likelihood} × M={d.magnitude}</p>
      <p className="text-[#525252]">Final: <span className="font-bold">{d.final}</span> → {d.material ? "Material" : "Not Material"}</p>
    </div>
  );
}

// ─── SRRO scoring row (expandable) ───────────────────────────────────────────
function SrroScoringRow({
  row,
  onUpdateMetric,
}: {
  row: {
    ref: string;
    title: string;
    type: string;
    srroCrro: string;
    valueChainStage: string;
    sasbSector: string;
    sasbIndustry: string;
    metrics: string[];
    metricScores: Phase5MetricScore[];
    srroMaterial: boolean;
    topScore: number;
  };
  onUpdateMetric: (metricName: string, updates: Partial<Phase5MetricScore>) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const getScore = (metric: string): Phase5MetricScore =>
    row.metricScores.find((s) => s.metricName === metric) ??
    { metricName: metric, likelihood: 0, magnitude: 0, qualitativeFlag: "", aggregationFlag: "" };

  const scoredCount = row.metrics.filter((m) => {
    const s = getScore(m);
    return s.likelihood > 0 && s.magnitude > 0;
  }).length;

  return (
    <div className="bg-white border border-[#e0e0e0] mb-2">
      {/* SRRO header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#fafafa] transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <ChevronRight className={`w-4 h-4 text-[#525252] shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`} />
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
          {row.topScore > 0 && (
            <span className={`text-[11px] font-bold px-2.5 py-0.5 whitespace-nowrap ${row.srroMaterial ? "bg-[#da1e28] text-white" : "bg-[#f4f4f4] text-[#525252] border border-[#e0e0e0]"}`}>
              {row.srroMaterial ? "Material" : "Not Material"}
            </span>
          )}
          {row.topScore === 0 && <span className="text-[11px] text-[#c6c6c6] italic">Pending</span>}
        </div>
      </div>

      {/* Metric scoring rows */}
      {expanded && (
        <div className="border-t border-[#e0e0e0]">
          {row.metrics.length === 0 ? (
            <div className="px-10 py-4 text-[12px] text-[#8d8d8d] italic">
              No metrics assigned. Go to Phase 4 to add metrics for this item.
            </div>
          ) : (
            <table className="w-full text-left border-collapse" style={{ minWidth: 880 }}>
              <thead>
                <tr className="bg-[#f4f4f4] text-[#525252] text-[10px] uppercase tracking-wide">
                  <th className="px-4 pl-10 py-2 min-w-52">Metric</th>
                  <th className="px-3 py-2 w-40">Likelihood</th>
                  <th className="px-3 py-2 w-40">Magnitude</th>
                  <th className="px-3 py-2 w-16 text-center">Score</th>
                  <th className="px-3 py-2 w-28 text-center">Qualitative?</th>
                  <th className="px-3 py-2 w-28 text-center">Aggregation?</th>
                  <th className="px-3 py-2 w-16 text-center">Final</th>
                  <th className="px-3 py-2 w-24 text-center">Materiality</th>
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
                      <td className="px-4 pl-10 py-2.5 text-[12px] font-medium text-[#161616] leading-snug">{metric}</td>
                      <td className="px-3 py-2">
                        <ScoreSelect value={s.likelihood} labels={LIKELIHOOD_LABELS} onChange={(v) => onUpdateMetric(metric, { likelihood: v })} />
                      </td>
                      <td className="px-3 py-2">
                        <ScoreSelect value={s.magnitude} labels={MAGNITUDE_LABELS} onChange={(v) => onUpdateMetric(metric, { magnitude: v })} />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${quant >= 12 ? "bg-[#da1e28] text-white" : quant >= 6 ? "bg-[#f59e0b] text-white" : quant >= 3 ? "bg-[#86bc25] text-white" : "bg-[#f4f4f4] text-[#525252]"}`}>
                          {quant || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <FlagButton value={s.qualitativeFlag} onChange={(v) => onUpdateMetric(metric, { qualitativeFlag: v as "Yes" | "No" })} />
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-center">
                          <FlagButton value={s.aggregationFlag} onChange={(v) => onUpdateMetric(metric, { aggregationFlag: v as "Yes" | "No" })} />
                        </div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`text-[12px] font-bold px-2 py-0.5 rounded ${scoreColor(fs)}`}>{fs || "—"}</span>
                      </td>
                      <td className="px-3 py-2 text-center">
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
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MaterialityAssessmentPage() {
  const navigate = useNavigate();
  const { srroItems, phase4Entries, phase5Items, upsertPhase5MetricScore, governanceAssessment, valueChain } = useSustainabilityStore(
    useShallow((s) => ({
      srroItems: s.srroItems,
      phase4Entries: s.phase4Entries,
      phase5Items: s.phase5Items,
      upsertPhase5MetricScore: s.upsertPhase5MetricScore,
      governanceAssessment: s.governanceAssessment,
      valueChain: s.valueChain,
    })),
  );
  const [saved, setSaved] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const handleDownloadReport = () => {
    setReportLoading(true);
    try {
      generateConsolidatedReport({ governanceAssessment, valueChain, srroItems, phase4Entries, phase5Items });
    } finally {
      setReportLoading(false);
    }
  };
  const [filterMaterial, setFilterMaterial] = useState<"All" | "Material" | "Not Material">("All");
  const [activeView, setActiveView] = useState<"table" | "matrix">("table");

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

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
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
              disabled={reportLoading}
              className="flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold border border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25] hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
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

      <div className="px-6 py-6 max-w-7xl">
        {/* Scoring guide */}
        <div className="flex items-start gap-3 bg-[#f4fadc] border border-[#86bc25]/30 px-4 py-3 mb-5">
          <Info className="w-4 h-4 text-[#86bc25] shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#435e12]">
            <strong>Final Score</strong> = Likelihood × Magnitude × (×2 if Qualitative = Yes) × (×2 if Aggregation = Yes). Threshold: <strong>Final ≥ 6 → Material</strong>. An SRRO/CRRO is material if <em>any one of its metrics</em> reaches the threshold. Click a row to expand and score its metrics.
          </p>
        </div>

        {activeView === "table" && (
          <div className="space-y-1">
            {visible.length === 0 ? (
              <div className="bg-white border border-[#e0e0e0] py-16 text-center">
                <p className="text-[14px] text-[#525252]">No items to display.</p>
              </div>
            ) : (
              visible.map((row) => (
                <SrroScoringRow
                  key={row.ref}
                  row={{
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
                  }}
                  onUpdateMetric={(metricName, updates) => upsertPhase5MetricScore(row.ref, metricName, updates)}
                />
              ))
            )}
          </div>
        )}

        {activeView === "matrix" && (
          <div className="bg-white border border-[#e0e0e0] p-6">
            <h3 className="text-[15px] font-semibold text-[#161616] mb-1">Materiality Matrix</h3>
            <p className="text-[12px] text-[#525252] mb-6">Each dot is a metric. Red = Material (Final ≥ 6). Green = Not Material.</p>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f4" />
                  <XAxis type="number" dataKey="likelihood" name="Likelihood" domain={[0.5, 4.5]} tickCount={4}
                    label={{ value: "Likelihood →", position: "insideBottom", offset: -10, style: { fontSize: 11, fill: "#525252" } }}
                    tick={{ fontSize: 11, fill: "#525252" }} />
                  <YAxis type="number" dataKey="magnitude" name="Magnitude" domain={[0.5, 4.5]} tickCount={4}
                    label={{ value: "Magnitude →", angle: -90, position: "insideLeft", offset: 10, style: { fontSize: 11, fill: "#525252" } }}
                    tick={{ fontSize: 11, fill: "#525252" }} />
                  <Tooltip content={<MatrixTooltip />} />
                  <Scatter data={scatterData} shape="circle">
                    {scatterData.map((d, i) => (
                      <Cell key={i} fill={d.material ? "#da1e28" : "#86bc25"} opacity={0.85} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
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

        <div className="flex justify-between items-center mt-6">
          <button onClick={() => navigate("/sustainability/material-information")} className="px-5 py-2.5 border border-[#e0e0e0] text-[13px] font-semibold text-[#161616] hover:border-[#86bc25] transition-colors">
            ← Back to Phase 4
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadReport}
              disabled={reportLoading}
              className="flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold border-2 border-[#86bc25] text-[#86bc25] hover:bg-[#86bc25] hover:text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {reportLoading ? "Generating…" : "Download Consolidated Report"}
            </button>
            <button onClick={() => navigate("/sustainability/materiality")} className="flex items-center gap-2 bg-[#86bc25] text-white px-6 py-2.5 text-[13px] font-semibold hover:bg-[#70a31d] transition-colors">
              Continue to Data Collection <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
