import type { SRROItem } from "@/store/sustainabilityStore";

export interface SrroGeneratePayload {
  entityProfile: {
    clientName: string;
    sector: string;
    subSector: string;
    geography: string;
  };
  valueChainResponses: Record<string, string>;
  businessModelContext?: {
    description: string;
    keyProductsServices: string;
    keyMarketsRegions: string;
  };
  activities?: Array<{
    stage: string;
    activity: string;
    description: string;
    keyInputs: string;
    keyOutputs: string;
  }>;
  resources?: Array<{
    vendor: string;
    stage: string;
    capitalType: string;
    type: string;
    dependencyImpact: string;
    riskOpportunity: string;
    description: string;
  }>;
  existingRefs: string[];
}

export async function generateSrroItems(payload: SrroGeneratePayload): Promise<SRROItem[]> {
  const res = await fetch("/api/srro/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" })) as { error?: string };
    throw new Error(err.error ?? `API error ${res.status}`);
  }
  const data = await res.json() as { items: SRROItem[] };
  return data.items;
}
