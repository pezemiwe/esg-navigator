export const downloadCSV = (data: string[][], filename: string): void => {
  const csvContent = data.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const calculateESSRiskCategory = (
  exclusionData: Record<string, boolean>,
  riskQuestions: Record<string, string>,
): string => {
  const hasExclusions = Object.values(exclusionData).some((value) => value);
  if (hasExclusions) return "Excluded";
  const yesAnswers = Object.values(riskQuestions).filter(
    (answer) => answer === "yes",
  ).length;
  if (yesAnswers >= 6) return "Category A";
  if (yesAnswers >= 3) return "Category B";
  return "Category C";
};

export const calculatePSScores = (
  performanceStandards: { id: string; questions: { key: string }[] }[],
  psQuestions: Record<string, string>,
): Record<string, number> => {
  const scores: Record<string, number> = {};
  performanceStandards.forEach((ps) => {
    const yesCount = ps.questions.filter(
      (q) => psQuestions[q.key] === "yes",
    ).length;
    scores[ps.id] = yesCount;
  });
  return scores;
};

export const calculateCategorizationRiskCategory = (
  totalScore: number,
): string => {
  if (totalScore >= 12) return "Category A";
  if (totalScore >= 6) return "Category B";
  return "Category C";
};

export const getTriggeredPS = (scores: Record<string, number>): string => {
  const triggered = Object.entries(scores)
    .filter(([, score]) => score > 0)
    .map(([psId]) => psId.toUpperCase());
  return triggered.length > 0 ? triggered.join(", ") : "None";
};

// ─────────────────────────────────────────────────────────────────────────────
// BRD 5-Dimension Weighted Scoring Engine
// ─────────────────────────────────────────────────────────────────────────────

import type { ScoringResult, DimensionScore, PSScore } from "../types";
import {
  sectorScores,
  psQuestionnaires,
  D2_MAX_RAW,
  D4_MAX_RAW,
  D5_MAX_RAW,
  DIMENSION_WEIGHTS,
  CATEGORY_THRESHOLDS,
  categoryActions,
} from "../data/scoringData";

/** Normalise a raw sum to 0–5 scale */
const normalise = (raw: number, max: number): number =>
  max > 0 ? (raw / max) * 5 : 0;

/** D1 – Sector / Activity Risk */
export const computeD1 = (sectorLabel: string): DimensionScore => {
  const sector = sectorScores.find((s) => s.label === sectorLabel);
  const score = sector?.score ?? 1;
  return {
    raw: score,
    normalised: score,
    weighted: score * DIMENSION_WEIGHTS.D1,
  };
};

/** D2 – Project Characteristics */
export const computeD2 = (answers: Record<string, number>): DimensionScore => {
  const raw = Object.values(answers).reduce((s, v) => s + v, 0);
  const norm = normalise(raw, D2_MAX_RAW);
  return { raw, normalised: norm, weighted: norm * DIMENSION_WEIGHTS.D2 };
};

/** D3 – PS Questionnaire (Severity × 0.70 + Breadth × 0.30) */
export const computeD3 = (
  psAnswers: Record<string, number>,
  triggeredPSIds: string[],
): DimensionScore & {
  severity: number;
  breadth: number;
  psScores: PSScore[];
} => {
  const psScores: PSScore[] = psQuestionnaires.map((ps) => {
    const triggered = ps.id === "ps1" || triggeredPSIds.includes(ps.id);
    let rawTotal = 0;
    if (triggered) {
      ps.questions.forEach((q) => {
        rawTotal += psAnswers[q.key] ?? 0;
      });
    }
    return {
      id: ps.id,
      rawTotal,
      maxRaw: ps.maxRaw,
      normalised: triggered ? normalise(rawTotal, ps.maxRaw) : 0,
      triggered,
    };
  });

  // Severity = highest normalised PS score
  const severity = Math.max(...psScores.map((p) => p.normalised), 0);

  // Breadth = (number of triggered PS / 8) × 5
  const totalPS = psQuestionnaires.length;
  const triggeredCount = psScores.filter((p) => p.triggered).length;
  const breadth = (triggeredCount / totalPS) * 5;

  const d3Norm = severity * 0.7 + breadth * 0.3;

  return {
    raw: psScores.reduce((s, p) => s + p.rawTotal, 0),
    normalised: d3Norm,
    weighted: d3Norm * DIMENSION_WEIGHTS.D3,
    severity,
    breadth,
    psScores,
  };
};

/** D4 – Context & Location Risk */
export const computeD4 = (answers: Record<string, number>): DimensionScore => {
  const raw = Object.values(answers).reduce((s, v) => s + v, 0);
  const norm = normalise(raw, D4_MAX_RAW);
  return { raw, normalised: norm, weighted: norm * DIMENSION_WEIGHTS.D4 };
};

/** D5 – Client Track Record */
export const computeD5 = (answers: Record<string, number>): DimensionScore => {
  const raw = Object.values(answers).reduce((s, v) => s + v, 0);
  const norm = normalise(raw, D5_MAX_RAW);
  return { raw, normalised: norm, weighted: norm * DIMENSION_WEIGHTS.D5 };
};

/** Auto-escalation checks per BRD */
const checkEscalations = (
  d3Result: ReturnType<typeof computeD3>,
  contextAnswers: Record<string, number>,
  clientAnswers: Record<string, number>,
): string[] => {
  const reasons: string[] = [];
  const findPS = (id: string) => d3Result.psScores.find((p) => p.id === id);

  // PS5 triggered → minimum Category B
  const ps5 = findPS("ps5");
  if (ps5?.triggered)
    reasons.push("PS5 (Land Acquisition) triggered → minimum Category B");

  // PS7 triggered → minimum Category B
  const ps7 = findPS("ps7");
  if (ps7?.triggered)
    reasons.push("PS7 (Indigenous Peoples) triggered → minimum Category B");

  // PS7 normalised > 3.5 → Category A
  if (ps7 && ps7.normalised > 3.5)
    reasons.push("PS7 normalised score > 3.5 → auto-escalate to Category A");

  // Conflict-affected context → Category A
  if ((contextAnswers["ctx_conflict"] ?? 0) >= 3)
    reasons.push(
      "Project in conflict-affected area → auto-escalate to Category A",
    );

  // PS6 normalised > 3.5 → Category A
  const ps6 = findPS("ps6");
  if (ps6 && ps6.normalised > 3.5)
    reasons.push(
      "PS6 (Biodiversity) normalised score > 3.5 → auto-escalate to Category A",
    );

  // Client major violations → Category A
  if ((clientAnswers["ctr_history"] ?? 0) >= 3)
    reasons.push(
      "Client has major E&S violations → auto-escalate to Category A",
    );

  return reasons;
};

/** Determine category from composite + escalations */
const resolveCategory = (
  composite: number,
  escalationReasons: string[],
): "A" | "B" | "C" => {
  // Check for Category A escalations
  const hasAEscalation = escalationReasons.some((r) =>
    r.includes("Category A"),
  );
  if (hasAEscalation) return "A";

  // Check for minimum Category B escalations
  const hasBEscalation = escalationReasons.some((r) =>
    r.includes("Category B"),
  );

  // Threshold-based
  if (composite >= CATEGORY_THRESHOLDS.A) return "A";
  if (composite >= CATEGORY_THRESHOLDS.B) return "B";

  // If escalated to min B but composite says C, return B
  if (hasBEscalation) return "B";
  return "C";
};

/** Full 5-dimension scoring calculation */
export const computeScoringResult = (
  sectorLabel: string,
  pcAnswers: Record<string, number>,
  triggeredPSIds: string[],
  psAnswers: Record<string, number>,
  contextAnswers: Record<string, number>,
  clientAnswers: Record<string, number>,
): ScoringResult => {
  const D1 = computeD1(sectorLabel);
  const D2 = computeD2(pcAnswers);
  const d3Full = computeD3(psAnswers, triggeredPSIds);
  const D3: ScoringResult["D3"] = {
    raw: d3Full.raw,
    normalised: d3Full.normalised,
    weighted: d3Full.weighted,
    severity: d3Full.severity,
    breadth: d3Full.breadth,
  };
  const D4 = computeD4(contextAnswers);
  const D5 = computeD5(clientAnswers);

  const composite =
    D1.weighted + D2.weighted + D3.weighted + D4.weighted + D5.weighted;
  const escalationReasons = checkEscalations(
    d3Full,
    contextAnswers,
    clientAnswers,
  );
  const category = resolveCategory(composite, escalationReasons);

  return {
    D1,
    D2,
    D3,
    D4,
    D5,
    composite,
    category,
    escalationReasons,
    psScores: d3Full.psScores,
    requiredActions: categoryActions[category] ?? [],
  };
};
