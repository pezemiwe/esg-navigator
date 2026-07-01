export interface ValueChainPopulatePayload {
  entityProfile: {
    clientName: string
    sector: string
    subSector: string
    geography: string
  }
  businessModelContext: {
    description: string
    keyProductsServices: string
    keyMarketsRegions: string
  }
  questionnaireResponses: Record<string, string>
}

export interface GeneratedActivity {
  stage: string
  activity: string
  description: string
  vendorType: string
  keyStakeholders: string
  geography: string
  keyInputs: string
  keyOutputs: string
  notes: string
}

export interface GeneratedResource {
  vendor: string
  valueChainStage: string
  capitalType: string
  resourceRelationship: string
  dependencyImpact: string
  riskOpportunity: string
  description: string
}

export async function populateValueChain(
  payload: ValueChainPopulatePayload,
): Promise<{ activities: GeneratedActivity[]; resources: GeneratedResource[] }> {
  const res = await fetch('/api/value-chain/populate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Value chain generation failed (${res.status}): ${text}`)
  }
  return res.json()
}
