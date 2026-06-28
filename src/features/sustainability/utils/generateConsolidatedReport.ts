import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type CellHookData = {
  section: "head" | "body" | "foot";
  column: { index: number };
  cell: { text: string[]; styles: { fillColor: unknown; textColor: unknown; fontStyle: unknown } };
};
import type {
  GovernanceAssessmentData,
  ValueChainData,
  SRROItem,
  Phase4Entry,
  Phase5Item,
  Phase5MetricScore,
  AssociatedEntity,
} from "@/store/sustainabilityStore";

// ─── Governance question bank (mirrors GovernanceAssessment.tsx) ──────────────
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
];

const SCORE_VALUES: Record<string, number> = {
  "No integration": 1,
  "Limited integration": 2,
  Integrated: 3,
};

const GENERAL_QUESTIONS = [
  { id: "g_1", sn: 1, text: "How would you describe the core way the business makes money, in simple terms?" },
  { id: "g_2", sn: 2, text: "What are the main insurance lines that really drive revenue today?" },
  { id: "g_3", sn: 3, text: "Are there any products that are growing faster or more strategically important?" },
  { id: "g_4", sn: 4, text: "Where do most of your customers sit geographically?" },
  { id: "g_5", sn: 5, text: "What sector do most of your customers operate in?" },
  { id: "g_6", sn: 6, text: "Are there markets or regions where risk exposure feels higher or more complex?" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcFinalScore(l: number, m: number, qual: string, agg: string) {
  const base = l * m;
  if (base === 0) return 0;
  return base * (qual === "Yes" ? 2 : 1) * (agg === "Yes" ? 2 : 1);
}

function isMaterial(fs: number) { return fs >= 6; }

type RGB = [number, number, number];
const BLACK: RGB   = [22, 22, 22];
const GREEN: RGB   = [134, 188, 37];
const LGREY: RGB   = [244, 244, 244];
const MGREY: RGB   = [224, 224, 224];
const WHITE: RGB   = [255, 255, 255];
const RED: RGB     = [218, 30, 40];
const AMBER: RGB   = [245, 158, 11];
const EMERALD: RGB = [16, 185, 129];
const LBLUE: RGB   = [219, 234, 254];

function scoreRgb(score: string): RGB {
  if (score === "Integrated")        return EMERALD;
  if (score === "Limited integration") return AMBER;
  if (score === "No integration")    return RED;
  return MGREY;
}

function fsRgb(fs: number): RGB {
  if (fs >= 12) return RED;
  if (fs >= 6)  return AMBER;
  if (fs > 0)   return GREEN;
  return MGREY;
}

interface ReportDoc extends jsPDF {
  lastAutoTable: { finalY: number };
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function generateConsolidatedReport(data: {
  governanceAssessment: GovernanceAssessmentData;
  valueChain: ValueChainData;
  srroItems: SRROItem[];
  phase4Entries: Phase4Entry[];
  phase5Items: Phase5Item[];
  assessmentEntities?: AssociatedEntity[];
  groupName?: string;
  isGroupAssessment?: boolean;
}) {
  const { governanceAssessment, valueChain, srroItems, phase4Entries, phase5Items, assessmentEntities = [], groupName = "", isGroupAssessment = false } = data;
  const client = governanceAssessment.clientName || "Client";
  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as ReportDoc;
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const contentW = W - M * 2;

  let y = 0;

  // ── Footers / headers on every page ──────────────────────────────────────────
  function addFooter() {
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      if (i === 1) continue; // cover page has no footer
      doc.setFillColor(...LGREY);
      doc.rect(0, H - 10, W, 10, "F");
      doc.setFontSize(7);
      doc.setTextColor(...BLACK);
      doc.setFont("helvetica", "normal");
      doc.text(`${client} — ESG Materiality Assessment | Confidential`, M, H - 4);
      doc.text(`Page ${i} of ${total}`, W - M, H - 4, { align: "right" });
    }
  }

  // ── Cover page ────────────────────────────────────────────────────────────────
  doc.setFillColor(...BLACK);
  doc.rect(0, 0, W, H, "F");

  // Green accent stripe
  doc.setFillColor(...GREEN);
  doc.rect(0, H - 18, W, 18, "F");

  // Logo-area text
  doc.setTextColor(...GREEN);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("ESG NAVIGATOR", M, 22);
  doc.setTextColor(...WHITE);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Powered by Deloitte methodology", M, 28);

  // Title block
  doc.setTextColor(...WHITE);
  doc.setFontSize(26);
  doc.setFont("helvetica", "bold");
  doc.text("ESG Materiality", M, 80);
  doc.text("Assessment Report", M, 94);

  doc.setFillColor(...GREEN);
  doc.rect(M, 100, 40, 1.5, "F");

  doc.setFontSize(13);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 200, 200);
  doc.text(client, M, 112);

  const meta: [string, string][] = [
    ["Sector", governanceAssessment.sector || "—"],
    ["Geography", governanceAssessment.geography || "—"],
    ["Assessment Date", governanceAssessment.assessmentDate || "—"],
    ["Reporting Basis", governanceAssessment.reportingBasis || "—"],
    ["Report Generated", today],
  ];
  let cy = 128;
  doc.setFontSize(9);
  for (const [label, value] of meta) {
    doc.setTextColor(...GREEN);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), M, cy);
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "normal");
    doc.text(value, M + 40, cy);
    cy += 9;
  }

  // Contents listing
  const sections = [
    "1.  Governance Assessment",
    "2.  Value Chain Assessment",
    "3.  SRRO / CRRO Register",
    "4.  Material Information Identification",
    "5.  Materiality Assessment & Scoring",
  ];
  doc.setFillColor(40, 40, 40);
  doc.rect(M, H - 78, contentW, sections.length * 10 + 8, "F");
  doc.setTextColor(...GREEN);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("CONTENTS", M + 4, H - 70);
  doc.setTextColor(190, 190, 190);
  doc.setFont("helvetica", "normal");
  sections.forEach((s, i) => doc.text(s, M + 4, H - 62 + i * 10));

  // ── Utility: section banner ───────────────────────────────────────────────────
  function newSection(phase: string, title: string) {
    doc.addPage();
    y = 0;
    doc.setFillColor(...BLACK);
    doc.rect(0, 0, W, 20, "F");
    doc.setFillColor(...GREEN);
    doc.rect(0, 20, W, 2, "F");
    doc.setTextColor(...GREEN);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(phase, M, 8);
    doc.setTextColor(...WHITE);
    doc.setFontSize(14);
    doc.text(title, M, 16);
    y = 30;
  }

  function subheading(text: string) {
    if (y > H - 30) { doc.addPage(); y = 20; }
    doc.setFillColor(...GREEN);
    doc.rect(M, y, contentW, 7, "F");
    doc.setTextColor(...WHITE);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text(text.toUpperCase(), M + 2, y + 5);
    y += 10;
  }

  function labelValue(label: string, value: string) {
    if (!value) return;
    if (y > H - 20) { doc.addPage(); y = 20; }
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...BLACK);
    doc.text(label + ":", M, y);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value, contentW - 32);
    doc.text(lines, M + 32, y);
    y += lines.length * 4.5 + 2;
  }

  function table(
    head: string[][],
    body: string[][],
    colStyles: Record<number, { cellWidth?: number; fillColor?: RGB }> = {},
    opts: Parameters<typeof autoTable>[1] = {},
  ) {
    if (y > H - 30) { doc.addPage(); y = 20; }
    autoTable(doc, {
      startY: y,
      head,
      body,
      margin: { left: M, right: M },
      styles: { fontSize: 7.5, cellPadding: 2, overflow: "linebreak", valign: "top" },
      headStyles: { fillColor: BLACK, textColor: WHITE, fontStyle: "bold", fontSize: 7.5 },
      alternateRowStyles: { fillColor: LGREY },
      columnStyles: colStyles as Record<number, object>,
      ...opts,
    });
    y = doc.lastAutoTable.finalY + 6;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 1: Governance Assessment
  // ─────────────────────────────────────────────────────────────────────────────
  newSection("PHASE 1", "Governance Assessment");

  // Client details
  subheading("Assessment Overview");
  labelValue("Client Name", client);
  labelValue("Sector", governanceAssessment.sector);
  labelValue("Geography", governanceAssessment.geography);
  labelValue("Reporting Basis", governanceAssessment.reportingBasis);
  labelValue("Assessment Date", governanceAssessment.assessmentDate);
  labelValue("Reporting Requirement", governanceAssessment.reportingRequirement);
  if (isGroupAssessment) {
    labelValue("Group Name", groupName || "—");
    const entityList = assessmentEntities.map((e) => `${e.name} (${e.entityType})`).join("; ") || "None";
    labelValue("Associated Entities", entityList);
  }
  labelValue("Documents Reviewed", (governanceAssessment.documentsReviewed ?? []).join("; ") || "None");

  y += 2;
  subheading("Governance Scoring — Question by Question");

  const govRows = QUESTION_BANK.map((q) => {
    const ans = governanceAssessment.questions?.[q.ref];
    return [
      q.ref,
      q.area,
      q.question,
      ans?.score || "—",
      ans?.gapIdentified || "—",
      ans?.evidenceNotes || "",
    ];
  });

  // Compute per-area avg
  const areas = [...new Set(QUESTION_BANK.map((q) => q.area))];
  const areaScores = areas.map((area) => {
    const qs = QUESTION_BANK.filter((q) => q.area === area);
    const scores = qs.map((q) => SCORE_VALUES[governanceAssessment.questions?.[q.ref]?.score ?? ""] ?? 0);
    const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    return { area, avg };
  });
  const overallAvg = areaScores.reduce((a, b) => a + b.avg, 0) / (areaScores.length || 1);

  table(
    [["Ref", "Area", "Question", "Score", "Gap?", "Evidence Notes"]],
    govRows,
    {
      0: { cellWidth: 8 },
      1: { cellWidth: 28 },
      2: { cellWidth: 72 },
      3: { cellWidth: 26 },
      4: { cellWidth: 10 },
      5: { cellWidth: contentW - 8 - 28 - 72 - 26 - 10 },
    },
    {
      didParseCell: (hookData: unknown) => { const h = hookData as CellHookData;
        if (h.column.index === 3 && h.section === "body") {
          const score = String(h.cell.text[0] ?? "");
          const rgb = scoreRgb(score);
          if (score !== "—") {
            h.cell.styles.fillColor = rgb;
            h.cell.styles.textColor = WHITE;
          }
        }
        if (h.column.index === 4 && h.section === "body") {
          if (h.cell.text[0] === "Yes") {
            h.cell.styles.fillColor = RED;
            h.cell.styles.textColor = WHITE;
          }
        }
      },
    },
  );

  // Area summary
  subheading("Area Summary");
  table(
    [["Area", "Avg Score", "Rating"]],
    areaScores.map(({ area, avg }) => {
      const rating = avg >= 2.5 ? "Integrated" : avg >= 1.5 ? "Limited integration" : "No integration";
      return [area, avg.toFixed(2), rating];
    }),
    {
      0: { cellWidth: 50 },
      1: { cellWidth: 22 },
      2: { cellWidth: contentW - 72 },
    },
    {
      didParseCell: (hookData: unknown) => { const h = hookData as CellHookData;
        if (h.column.index === 2 && h.section === "body") {
          const val = String(h.cell.text[0] ?? "");
          h.cell.styles.fillColor = scoreRgb(val);
          h.cell.styles.textColor = WHITE;
        }
      },
    },
  );

  // Overall rating
  if (y > H - 30) { doc.addPage(); y = 20; }
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  const rating = overallAvg >= 2.5 ? "Integrated" : overallAvg >= 1.5 ? "Limited integration" : "No integration";
  doc.text(`Overall Governance Rating: ${overallAvg.toFixed(2)} / 3.00 — ${rating}`, M, y);
  y += 8;

  // Conclusions
  if (governanceAssessment.overallConclusion) {
    subheading("Overall Conclusion");
    const lines = doc.splitTextToSize(governanceAssessment.overallConclusion, contentW);
    if (y + lines.length * 4.5 > H - 14) { doc.addPage(); y = 20; }
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...BLACK);
    doc.text(lines, M, y);
    y += lines.length * 4.5 + 4;
  }

  labelValue("Main Governance Weaknesses", governanceAssessment.mainGovernanceWeaknesses);
  labelValue("Immediate Actions", governanceAssessment.immediateActions);
  labelValue("Stakeholders to Engage", governanceAssessment.stakeholdersToEngage);

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 2: Value Chain Assessment
  // ─────────────────────────────────────────────────────────────────────────────
  newSection("PHASE 2", "Entity & Value Chain Assessment");

  const qr = valueChain.questionnaireResponses ?? {};

  // General questions
  subheading("Part A — General Business Understanding");
  table(
    [["#", "Question", "Response"]],
    GENERAL_QUESTIONS.map((q) => [String(q.sn), q.text, qr[q.id] || ""]),
    { 0: { cellWidth: 8 }, 1: { cellWidth: 70 }, 2: { cellWidth: contentW - 78 } },
  );

  // Value chain activities
  if (valueChain.activities.length > 0) {
    subheading("Activity Register");
    table(
      [["Stage", "Activity", "Description", "Key Inputs", "Key Outputs"]],
      valueChain.activities.map((a) => [
        a.stage, a.activity, a.description, a.keyInputs, a.keyOutputs,
      ]),
      {
        0: { cellWidth: 20 },
        1: { cellWidth: 30 },
        2: { cellWidth: 55 },
        3: { cellWidth: 30 },
        4: { cellWidth: contentW - 135 },
      },
    );
  }

  // Resources & relationships
  if (valueChain.resources.length > 0) {
    subheading("Resources & Relationships");
    table(
      [["Vendor", "Stage", "Capital Type", "Type", "Dep./Impact", "Risk/Opp.", "Description"]],
      valueChain.resources.map((r) => [
        r.vendor, r.valueChainStage, r.capitalType,
        r.resourceRelationship, r.dependencyImpact, r.riskOpportunity, r.description,
      ]),
      {
        0: { cellWidth: 28 },
        1: { cellWidth: 18 },
        2: { cellWidth: 22 },
        3: { cellWidth: 16 },
        4: { cellWidth: 18 },
        5: { cellWidth: 16 },
        6: { cellWidth: contentW - 118 },
      },
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 3: SRRO / CRRO Register
  // ─────────────────────────────────────────────────────────────────────────────
  newSection("PHASE 3", "SRRO / CRRO Identification Register");

  const finalList = srroItems.filter((i) => i.includeInFinalList === "Yes");
  const risks = srroItems.filter((i) => i.type === "Risk");
  const opps  = srroItems.filter((i) => i.type === "Opportunity");

  // KPI strip as table
  table(
    [["Total Items", "Risks", "Opportunities", "Final List"]],
    [[String(srroItems.length), String(risks.length), String(opps.length), String(finalList.length)]],
    {
      0: { cellWidth: contentW / 4 },
      1: { cellWidth: contentW / 4 },
      2: { cellWidth: contentW / 4 },
      3: { cellWidth: contentW / 4 },
    },
  );

  subheading("Full SRRO / CRRO Register");
  table(
    [["Ref", "Type", "SRRO/CRRO", "Stage", "Title & Description", "Fin.", "Str.", "Ops.", "L", "M", "Final List"]],
    srroItems.map((i) => [
      i.ref,
      i.type || "—",
      i.srroCrro || "—",
      i.valueChainStage || "—",
      i.title + (i.description ? `\n${i.description}` : ""),
      i.financialImpact || "—",
      i.strategicImpact || "—",
      i.operationalImpact || "—",
      String(i.likelihood || "—"),
      String(i.magnitude || "—"),
      i.includeInFinalList || "—",
    ]),
    {
      0: { cellWidth: 10 },
      1: { cellWidth: 16 },
      2: { cellWidth: 16 },
      3: { cellWidth: 18 },
      4: { cellWidth: contentW - 10 - 16 - 16 - 18 - 8 - 8 - 8 - 8 - 8 - 14 },
      5: { cellWidth: 8 },
      6: { cellWidth: 8 },
      7: { cellWidth: 8 },
      8: { cellWidth: 8 },
      9: { cellWidth: 8 },
      10: { cellWidth: 14 },
    },
    {
      didParseCell: (hookData: unknown) => { const h = hookData as CellHookData;
        if (h.section !== "body") return;
        if (h.column.index === 10) {
          if (h.cell.text[0] === "Yes") {
            h.cell.styles.fillColor = GREEN;
            h.cell.styles.textColor = WHITE;
          }
        }
        if (h.column.index === 1) {
          if (h.cell.text[0] === "Risk") {
            h.cell.styles.textColor = RED;
          } else if (h.cell.text[0] === "Opportunity") {
            h.cell.styles.textColor = EMERALD;
          }
        }
      },
    },
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 4: Material Information
  // ─────────────────────────────────────────────────────────────────────────────
  newSection("PHASE 4", "Material Information Identification");

  if (finalList.length === 0) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...MGREY);
    doc.text("No items in the final list.", M, y);
    y += 8;
  } else {
    subheading("SASB Sector Alignment & Metrics");
    table(
      [["Ref", "Title", "Sector", "Industry", "Material Topic", "Metrics", "Specific Information"]],
      finalList.map((srro) => {
        const p4 = phase4Entries.find((e) => e.ref === srro.ref);
        const metrics = [
          ...(p4?.selectedMetrics ?? []),
          ...(p4?.additionalMetrics
            ? p4.additionalMetrics.split(/[,\n]+/).map((m) => m.trim()).filter(Boolean)
            : []),
        ];
        return [
          srro.ref,
          srro.title,
          p4?.sasbSector || "—",
          p4?.sasbIndustry || "—",
          p4?.sasbTopic || "—",
          metrics.length ? metrics.join("\n") : "—",
          p4?.specificInformation || "—",
        ];
      }),
      {
        0: { cellWidth: 10 },
        1: { cellWidth: 30 },
        2: { cellWidth: 22 },
        3: { cellWidth: 24 },
        4: { cellWidth: 28 },
        5: { cellWidth: 40 },
        6: { cellWidth: contentW - 10 - 30 - 22 - 24 - 28 - 40 },
      },
      {
        didParseCell: (hookData: unknown) => { const h = hookData as CellHookData;
          if (h.column.index === 4 && h.section === "body") {
            h.cell.styles.fillColor = LBLUE;
          }
        },
      },
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION 5: Materiality Assessment
  // ─────────────────────────────────────────────────────────────────────────────
  newSection("PHASE 5", "Materiality Assessment & Scoring");

  // Build summary
  type SrroResult = {
    ref: string; title: string; srroCrro: string; type: string;
    metrics: { name: string; score: Phase5MetricScore; fs: number; material: boolean }[];
    topScore: number; srroMaterial: boolean;
  };

  const results: SrroResult[] = finalList.map((srro) => {
    const p4 = phase4Entries.find((e) => e.ref === srro.ref);
    const p5 = phase5Items.find((p) => p.ref === srro.ref);
    const allMetrics = [
      ...(p4?.selectedMetrics ?? []),
      ...(p4?.additionalMetrics
        ? p4.additionalMetrics.split(/[,\n]+/).map((m) => m.trim()).filter(Boolean)
        : []),
    ];
    const blank: Phase5MetricScore = { metricName: "", likelihood: 0, magnitude: 0, qualitativeFlag: "", aggregationFlag: "" };
    const metrics = allMetrics.map((name) => {
      const s = p5?.metricScores?.find((ms) => ms.metricName === name) ?? { ...blank, metricName: name };
      const fs = calcFinalScore(s.likelihood, s.magnitude, s.qualitativeFlag, s.aggregationFlag);
      return { name, score: s, fs, material: isMaterial(fs) };
    });
    const topScore = Math.max(0, ...metrics.map((m) => m.fs));
    return { ref: srro.ref, title: srro.title, srroCrro: srro.srroCrro, type: srro.type, metrics, topScore, srroMaterial: isMaterial(topScore) };
  });

  const materialCount = results.filter((r) => r.srroMaterial).length;

  // Executive summary strip
  table(
    [["Total SRROs/CRROs", "Material", "Not Material", "Pending Score"]],
    [[
      String(results.length),
      String(materialCount),
      String(results.filter((r) => !r.srroMaterial && r.topScore > 0).length),
      String(results.filter((r) => r.topScore === 0).length),
    ]],
    {
      0: { cellWidth: contentW / 4 },
      1: { cellWidth: contentW / 4 },
      2: { cellWidth: contentW / 4 },
      3: { cellWidth: contentW / 4 },
    },
    {
      didParseCell: (hookData: unknown) => { const h = hookData as CellHookData;
        if (h.section !== "body") return;
        if (h.column.index === 1) { h.cell.styles.fillColor = RED; h.cell.styles.textColor = WHITE; }
      },
    },
  );

  subheading("Scoring Detail — Per Metric");
  const scoringRows: string[][] = [];
  for (const r of results) {
    if (r.metrics.length === 0) {
      scoringRows.push([r.ref, r.title, "No metrics assigned", "—", "—", "—", "—", "—", "—", "Pending"]);
    } else {
      r.metrics.forEach((m, mi) => {
        scoringRows.push([
          mi === 0 ? r.ref : "",
          mi === 0 ? r.title : "",
          m.name,
          m.score.likelihood ? `${m.score.likelihood}` : "—",
          m.score.magnitude  ? `${m.score.magnitude}` : "—",
          m.score.likelihood && m.score.magnitude ? String(m.score.likelihood * m.score.magnitude) : "—",
          m.score.qualitativeFlag || "—",
          m.score.aggregationFlag || "—",
          m.fs > 0 ? String(m.fs) : "—",
          m.fs > 0 ? (m.material ? "Material" : "Not Material") : "Pending",
        ]);
      });
    }
  }

  table(
    [["Ref", "SRRO/CRRO Title", "Metric", "L", "M", "L×M", "Qual?", "Agg?", "Final", "Result"]],
    scoringRows,
    {
      0: { cellWidth: 10 },
      1: { cellWidth: 36 },
      2: { cellWidth: contentW - 10 - 36 - 8 - 8 - 10 - 10 - 10 - 12 - 22 },
      3: { cellWidth: 8 },
      4: { cellWidth: 8 },
      5: { cellWidth: 10 },
      6: { cellWidth: 10 },
      7: { cellWidth: 10 },
      8: { cellWidth: 12 },
      9: { cellWidth: 22 },
    },
    {
      didParseCell: (hookData: unknown) => { const h = hookData as CellHookData;
        if (h.section !== "body") return;
        if (h.column.index === 8) {
          const v = Number(h.cell.text[0]);
          if (!isNaN(v) && v > 0) {
            h.cell.styles.fillColor = fsRgb(v);
            h.cell.styles.textColor = WHITE;
          }
        }
        if (h.column.index === 9) {
          const v = String(h.cell.text[0] ?? "");
          if (v === "Material") { h.cell.styles.fillColor = RED; h.cell.styles.textColor = WHITE; }
          if (v === "Not Material") { h.cell.styles.fillColor = LGREY; h.cell.styles.textColor = BLACK; }
        }
      },
    },
  );

  // Material SRRO summary
  const materialItems = results.filter((r) => r.srroMaterial);
  if (materialItems.length > 0) {
    subheading(`Material SRROs / CRROs (${materialItems.length})`);
    table(
      [["Ref", "Title", "Type", "SRRO/CRRO", "Highest Metric Score", "Key Material Metric"]],
      materialItems.sort((a, b) => b.topScore - a.topScore).map((r) => {
        const topMetric = r.metrics.find((m) => m.fs === r.topScore);
        return [
          r.ref, r.title, r.type, r.srroCrro,
          String(r.topScore),
          topMetric?.name ?? "—",
        ];
      }),
      {
        0: { cellWidth: 10 },
        1: { cellWidth: 50 },
        2: { cellWidth: 18 },
        3: { cellWidth: 18 },
        4: { cellWidth: 24 },
        5: { cellWidth: contentW - 10 - 50 - 18 - 18 - 24 },
      },
      {
        headStyles: { fillColor: RED, textColor: WHITE, fontStyle: "bold" },
        didParseCell: (hookData: unknown) => { const h = hookData as CellHookData;
          if (h.column.index === 4 && h.section === "body") {
            h.cell.styles.fillColor = RED;
            h.cell.styles.textColor = WHITE;
            h.cell.styles.fontStyle = "bold";
          }
        },
      },
    );
  }

  // ── Scoring guide legend ──────────────────────────────────────────────────────
  if (y > H - 40) { doc.addPage(); y = 20; }
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...BLACK);
  doc.text("SCORING GUIDE", M, y); y += 5;
  doc.setFont("helvetica", "normal");
  doc.text("Final Score = Likelihood × Magnitude × (×2 if Qualitative = Yes) × (×2 if Aggregation = Yes)   |   Material threshold: Final Score ≥ 6", M, y);
  y += 4;
  const legend: [string, RGB][] = [["≥ 12 — High materiality", RED], ["6–11 — Material", AMBER], ["1–5 — Low score", GREEN], ["0 — Pending", MGREY]];
  let lx = M;
  for (const [label, color] of legend) {
    doc.setFillColor(...color);
    doc.rect(lx, y, 3, 3, "F");
    doc.setTextColor(...BLACK);
    doc.text(label, lx + 4.5, y + 2.5);
    lx += 46;
  }

  // ── Add footers to all pages ──────────────────────────────────────────────────
  addFooter();

  doc.save(`${client.replace(/\s+/g, "_")}_ESG_Materiality_Report.pdf`);
}
