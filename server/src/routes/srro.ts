import { Hono } from 'hono'
import { callLLM } from '../llm/index.js'

const srroRouter = new Hono()

const SYSTEM_PROMPT = `You are an IFRS S1/S2 sustainability risk and opportunity identification expert. Your task is to identify Sustainability-Related Risks and Opportunities (SRROs) and Climate-Related Risks and Opportunities (CRROs) for a reporting entity, following the IFRS Sustainability Disclosure Standards framework.

CLASSIFICATION RULES:
- CRRO: Risk or Opportunity directly caused by or related to climate change (physical risks, transition risks, climate opportunities)
- SRRO: All other material sustainability risks and opportunities (governance, workforce, supply chain, social, water, biodiversity, technology, regulatory compliance, data/cyber, etc.)

VALUE CHAIN STAGES:
- Upstream: suppliers, raw materials, distributors, investors, financial partners, regulators as inputs
- Core: entity's own operations, products, services, technology, workforce, governance
- Downstream: customers, end users, communities, society

TIME HORIZONS: Short = 0–3 years, Medium = 3–10 years, Long = 10+ years

LIKELIHOOD and MAGNITUDE: Score 1–5 where 1 = very low, 5 = very high.
- neededByPrimaryUser: "Yes" if investors/lenders would need this for financial decisions
- includeInFinalList: "Yes" if material enough to include in the final IFRS report

Return a valid JSON array only. No markdown, no explanation, just the JSON array. Each item must follow this exact schema:
{"ref":"SRRO-AI-NNN","source":"AI Generation","title":"...","description":"...","type":"Risk|Opportunity","valueChainStage":"Upstream|Core|Downstream","financialImpact":"Yes|No","strategicImpact":"Yes|No","operationalImpact":"Yes|No","timeHorizon":"Short|Medium|Long","likelihood":N,"magnitude":N,"neededByPrimaryUser":"Yes|No","includeInFinalList":"Yes|No","srroCrro":"SRRO|CRRO"}

Generate 8–15 items covering a mix of Risk and Opportunity, SRRO and CRRO, all three value chain stages. Be specific to the entity's sector and the questionnaire responses provided. Do not duplicate any of the refs in the existing register.`

const FEW_SHOT_EXAMPLES = `Example items (use as format reference only, do not copy these — generate new ones specific to the entity):
[
  {"ref":"SRRO-AI-001","source":"AI Generation","title":"Climate risk supervision and resilience risk","description":"Climate change is a source of financial risk affecting insurer resilience and financial stability, with exposure through underwriting and investment activities.","type":"Risk","valueChainStage":"Core","financialImpact":"Yes","strategicImpact":"Yes","operationalImpact":"Yes","timeHorizon":"Long","likelihood":2,"magnitude":4,"neededByPrimaryUser":"Yes","includeInFinalList":"Yes","srroCrro":"CRRO"},
  {"ref":"SRRO-AI-002","source":"AI Generation","title":"Cybersecurity and data privacy risk","description":"Operational, regulatory, and reputational risks from cybersecurity or data privacy failures, especially where digital systems underpin core operations.","type":"Risk","valueChainStage":"Core","financialImpact":"Yes","strategicImpact":"Yes","operationalImpact":"Yes","timeHorizon":"Short","likelihood":3,"magnitude":4,"neededByPrimaryUser":"Yes","includeInFinalList":"Yes","srroCrro":"SRRO"},
  {"ref":"SRRO-AI-003","source":"AI Generation","title":"Sustainable finance opportunity","description":"Growing demand for ESG-linked products and green finance instruments creates a strategic revenue opportunity.","type":"Opportunity","valueChainStage":"Downstream","financialImpact":"Yes","strategicImpact":"Yes","operationalImpact":"No","timeHorizon":"Medium","likelihood":3,"magnitude":3,"neededByPrimaryUser":"Yes","includeInFinalList":"Yes","srroCrro":"SRRO"}
]`

interface EntityProfile {
  clientName: string
  sector: string
  subSector: string
  geography: string
}

interface RequestBody {
  entityProfile: EntityProfile
  valueChainResponses: Record<string, string>
  existingRefs: string[]
}

interface SRROItem {
  ref: string
  source: string
  title: string
  description: string
  type: 'Risk' | 'Opportunity'
  valueChainStage: 'Upstream' | 'Core' | 'Downstream'
  financialImpact: 'Yes' | 'No'
  strategicImpact: 'Yes' | 'No'
  operationalImpact: 'Yes' | 'No'
  timeHorizon: 'Short' | 'Medium' | 'Long'
  likelihood: number
  magnitude: number
  neededByPrimaryUser: 'Yes' | 'No'
  includeInFinalList: 'Yes' | 'No'
  srroCrro: 'SRRO' | 'CRRO'
  id: string
}

function buildUserMessage(body: RequestBody): string {
  const { entityProfile, valueChainResponses, existingRefs } = body
  const { clientName, sector, subSector, geography } = entityProfile

  const responsesText = Object.entries(valueChainResponses)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  const existingRefsText = existingRefs.length > 0 ? existingRefs.join(', ') : 'None'

  return `${FEW_SHOT_EXAMPLES}

Entity: ${clientName}
Sector: ${sector} — ${subSector}
Geography: ${geography}

Value chain questionnaire responses:
${responsesText}

Existing register refs (do not duplicate): ${existingRefsText}

Identify 8–15 SRROs and CRROs specific to this entity. Return JSON array only.`
}

function isValidItem(item: unknown): item is Omit<SRROItem, 'id'> {
  if (typeof item !== 'object' || item === null) return false
  const obj = item as Record<string, unknown>
  return (
    typeof obj.ref === 'string' &&
    typeof obj.title === 'string' &&
    (obj.type === 'Risk' || obj.type === 'Opportunity') &&
    (obj.srroCrro === 'SRRO' || obj.srroCrro === 'CRRO')
  )
}

srroRouter.post('/api/srro/generate', async (c) => {
  let body: RequestBody

  try {
    body = await c.req.json<RequestBody>()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  if (
    !body.entityProfile ||
    typeof body.entityProfile.clientName !== 'string' ||
    typeof body.entityProfile.sector !== 'string' ||
    typeof body.entityProfile.subSector !== 'string' ||
    typeof body.entityProfile.geography !== 'string'
  ) {
    return c.json({ error: 'Missing or invalid entityProfile fields' }, 400)
  }

  if (typeof body.valueChainResponses !== 'object' || body.valueChainResponses === null) {
    return c.json({ error: 'Missing or invalid valueChainResponses' }, 400)
  }

  if (!Array.isArray(body.existingRefs)) {
    return c.json({ error: 'Missing or invalid existingRefs' }, 400)
  }

  let llmResponse: string

  try {
    llmResponse = await callLLM({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: buildUserMessage(body) }],
      maxTokens: 4096,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: `LLM error: ${message}` }, 500)
  }

  const match = llmResponse.match(/\[[\s\S]*\]/)
  if (!match) {
    return c.json({ error: 'LLM did not return a JSON array' }, 500)
  }

  let parsed: unknown[]

  try {
    parsed = JSON.parse(match[0]) as unknown[]
  } catch {
    return c.json({ error: 'Failed to parse LLM JSON response' }, 500)
  }

  const items: SRROItem[] = parsed
    .filter(isValidItem)
    .map((item) => ({ ...item, id: crypto.randomUUID() }))

  return c.json({ items })
})

export default srroRouter
