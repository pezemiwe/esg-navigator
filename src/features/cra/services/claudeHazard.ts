/**
 * Claude API hazard-assessment service.
 *
 * Two modes:
 *  1. If a Vercel/proxy endpoint is available → POST /api/hazard  (API key lives server-side)
 *  2. If a user-supplied API key is provided → call Anthropic directly via the proxy URL
 *
 * Falls back to the local deterministic geo-math engine when neither is configured.
 */

import type { HazardRating } from "../domain/physicalRisk/types";
import { buildMatrixConfig, getRating } from "../domain/physicalRisk/constants";
import { assessHazard as geoMathAssess } from "../domain/physicalRisk/engine";
import { ALL_21_RISKS } from "../domain/physicalRisk/constants";

export interface HazardInput {
  asset: string;
  assetType: string;
  risk: string;
  latitude: number;
  longitude: number;
  country: string;
}

export interface HazardOutput {
  asset: string;
  risk: string;
  intensityScore: number;
  frequencyScore: number;
  intensityLabel: string;
  frequencyLabel: string;
  hazardRating: HazardRating;
}

/* ─── Claude prompt construction ─── */

function buildPrompt(items: HazardInput[], matrixSize: number): string {
  const mc = buildMatrixConfig(matrixSize);
  const intensityLabels = Object.entries(mc.intensityLabels)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");
  const frequencyLabels = Object.entries(mc.frequencyLabels)
    .map(([k, v]) => `${k}=${v}`)
    .join(", ");

  const assetLines = items
    .map(
      (it, i) =>
        `${i + 1}. Asset="${it.asset}" type="${it.assetType}" risk="${it.risk}" lat=${it.latitude.toFixed(4)} lon=${it.longitude.toFixed(4)} country="${it.country}"`,
    )
    .join("\n");

  return `You are an expert climate-risk analyst. For each asset–hazard pair below, assign an INTENSITY score and a FREQUENCY score on a 1–${matrixSize} scale.

Intensity scale: ${intensityLabels}
Frequency scale: ${frequencyLabels}

Consider the geographic location, asset type, and the specific climate hazard. Use real climate science and risk knowledge for the region.

Return ONLY a JSON array (no markdown, no explanation) with one object per input row:
[{"idx":1,"i":<intensity_score>,"f":<frequency_score>}, ...]

Asset-hazard pairs:
${assetLines}`;
}

/* ─── Batch size for Claude calls ─── */
const BATCH_SIZE = 50;

/**
 * Assess hazards using the Claude API.
 * Batches items, calls Claude, parses responses.
 */
export async function assessHazardsWithClaude(
  items: HazardInput[],
  matrixSize: number,
  apiKeyOrProxyUrl: string,
  onProgress?: (done: number, total: number) => void,
): Promise<HazardOutput[]> {
  const mc = buildMatrixConfig(matrixSize);
  const results: HazardOutput[] = [];
  const batches: HazardInput[][] = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    batches.push(items.slice(i, i + BATCH_SIZE));
  }

  let done = 0;
  for (const batch of batches) {
    const prompt = buildPrompt(batch, matrixSize);
    const raw = await callClaude(prompt, apiKeyOrProxyUrl);
    const parsed = parseClaudeResponse(raw, batch, mc);
    results.push(...parsed);
    done += batch.length;
    onProgress?.(done, items.length);
  }
  return results;
}

async function callClaude(
  prompt: string,
  apiKeyOrProxy: string,
): Promise<string> {
  const isProxy =
    apiKeyOrProxy.startsWith("http") || apiKeyOrProxy.startsWith("/");
  const url = isProxy ? apiKeyOrProxy : "/api/hazard";

  const body: Record<string, unknown> = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [{ role: "user", content: prompt }],
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!isProxy) {
    headers["x-api-key"] = apiKeyOrProxy;
  }

  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(
      isProxy && apiKeyOrProxy.startsWith("/") ? body : body,
    ),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Claude API error ${res.status}: ${text}`);
  }

  const data = await res.json();
  // Handle both direct API response and proxy response
  if (data.content && Array.isArray(data.content)) {
    return data.content[0]?.text ?? "[]";
  }
  if (typeof data === "string") return data;
  if (data.text) return data.text;
  return JSON.stringify(data);
}

function parseClaudeResponse(
  raw: string,
  batch: HazardInput[],
  mc: ReturnType<typeof buildMatrixConfig>,
): HazardOutput[] {
  try {
    // Extract JSON array from response
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in response");
    const arr = JSON.parse(jsonMatch[0]) as {
      idx: number;
      i: number;
      f: number;
    }[];

    return arr
      .map((item) => {
        const batchItem = batch[(item.idx ?? 1) - 1];
        if (!batchItem) return null;
        const iScore = Math.max(1, Math.min(mc.size, Math.round(item.i)));
        const fScore = Math.max(1, Math.min(mc.size, Math.round(item.f)));
        const rating = getRating(mc, iScore, fScore);
        return {
          asset: batchItem.asset,
          risk: batchItem.risk,
          intensityScore: iScore,
          frequencyScore: fScore,
          intensityLabel: mc.intensityLabels[iScore] ?? String(iScore),
          frequencyLabel: mc.frequencyLabels[fScore] ?? String(fScore),
          hazardRating: rating,
        };
      })
      .filter(Boolean) as HazardOutput[];
  } catch {
    // Fallback: use geo-math engine for the entire batch
    return batch.map((batchItem) => {
      const riskDef = ALL_21_RISKS.find((r) => r.risk === batchItem.risk);
      const { intensityScore, frequencyScore } = geoMathAssess(
        batchItem.risk,
        riskDef?.id ?? 1,
        batchItem.latitude,
        batchItem.longitude,
        mc,
      );
      const rating = getRating(mc, intensityScore, frequencyScore);
      return {
        asset: batchItem.asset,
        risk: batchItem.risk,
        intensityScore,
        frequencyScore,
        intensityLabel:
          mc.intensityLabels[intensityScore] ?? String(intensityScore),
        frequencyLabel:
          mc.frequencyLabels[frequencyScore] ?? String(frequencyScore),
        hazardRating: rating,
      };
    });
  }
}

/**
 * Assess hazards using local geo-math engine (fallback / default).
 */
export function assessHazardsLocally(
  items: HazardInput[],
  matrixSize: number,
): HazardOutput[] {
  const mc = buildMatrixConfig(matrixSize);
  return items.map((it) => {
    const riskDef = ALL_21_RISKS.find((r) => r.risk === it.risk);
    const { intensityScore, frequencyScore } = geoMathAssess(
      it.risk,
      riskDef?.id ?? 1,
      it.latitude,
      it.longitude,
      mc,
    );
    const rating = getRating(mc, intensityScore, frequencyScore);
    return {
      asset: it.asset,
      risk: it.risk,
      intensityScore,
      frequencyScore,
      intensityLabel:
        mc.intensityLabels[intensityScore] ?? String(intensityScore),
      frequencyLabel:
        mc.frequencyLabels[frequencyScore] ?? String(frequencyScore),
      hazardRating: rating,
    };
  });
}
