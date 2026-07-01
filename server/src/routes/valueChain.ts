import { Hono } from 'hono'
import { callLLM } from '../llm/index.js'

const valueChainRouter = new Hono()

const SYSTEM_PROMPT = `You are a sustainability value chain analyst specialising in IFRS S1/S2 disclosures.

Given an entity's business model overview and questionnaire responses, map out:
1. Their value chain activities (upstream, core operations, downstream)
2. Their key resources and relationships (vendors, partners, capital providers)

Return ONLY a valid JSON object with this exact structure — no markdown, no explanation:
{
  "activities": [
    {
      "stage": "Upstream|Core|Downstream",
      "activity": "short activity name",
      "description": "1-2 sentence description",
      "vendorType": "optional vendor or team type",
      "keyStakeholders": "optional comma-separated stakeholders",
      "geography": "optional location",
      "keyInputs": "optional comma-separated inputs",
      "keyOutputs": "optional comma-separated outputs",
      "notes": ""
    }
  ],
  "resources": [
    {
      "vendor": "party name or type",
      "valueChainStage": "Upstream|Core|Downstream",
      "capitalType": "Financial|Manufactured|Intellectual|Human|Social|Natural",
      "resourceRelationship": "Resource|Relationship",
      "dependencyImpact": "Dependency|Impact",
      "riskOpportunity": "Risk|Opportunity",
      "description": "1-2 sentence description"
    }
  ]
}

RULES:
- stage and valueChainStage MUST be one of: Upstream, Core, Downstream
- capitalType MUST be one of: Financial, Manufactured, Intellectual, Human, Social, Natural
- resourceRelationship MUST be one of: Resource, Relationship
- dependencyImpact MUST be one of: Dependency, Impact
- riskOpportunity MUST be one of: Risk, Opportunity
- Generate 6–12 activities covering all three stages
- Generate 5–10 resources covering a variety of capital types
- Be specific to the entity's sector and questionnaire answers
- All string fields must be non-empty except "notes" which may be empty`

interface EntityProfile {
  clientName: string
  sector: string
  subSector: string
  geography: string
}

interface RequestBody {
  entityProfile: EntityProfile
  businessModelContext: {
    description: string
    keyProductsServices: string
    keyMarketsRegions: string
  }
  questionnaireResponses: Record<string, string>
}

interface ActivityResult {
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

interface ResourceResult {
  vendor: string
  valueChainStage: string
  capitalType: string
  resourceRelationship: string
  dependencyImpact: string
  riskOpportunity: string
  description: string
}

const VALID_STAGES = ['Upstream', 'Core', 'Downstream']
const VALID_CAPITAL_TYPES = ['Financial', 'Manufactured', 'Intellectual', 'Human', 'Social', 'Natural']
const VALID_RESOURCE_RELATIONSHIPS = ['Resource', 'Relationship']
const VALID_DEP_IMPACT = ['Dependency', 'Impact']
const VALID_RISK_OPP = ['Risk', 'Opportunity']

function isValidActivity(item: unknown): item is ActivityResult {
  if (typeof item !== 'object' || item === null) return false
  const obj = item as Record<string, unknown>
  return (
    VALID_STAGES.includes(obj.stage as string) &&
    typeof obj.activity === 'string' && obj.activity.length > 0 &&
    typeof obj.description === 'string' && obj.description.length > 0
  )
}

function isValidResource(item: unknown): item is ResourceResult {
  if (typeof item !== 'object' || item === null) return false
  const obj = item as Record<string, unknown>
  return (
    typeof obj.vendor === 'string' && obj.vendor.length > 0 &&
    VALID_STAGES.includes(obj.valueChainStage as string) &&
    VALID_CAPITAL_TYPES.includes(obj.capitalType as string) &&
    VALID_RESOURCE_RELATIONSHIPS.includes(obj.resourceRelationship as string) &&
    VALID_DEP_IMPACT.includes(obj.dependencyImpact as string) &&
    VALID_RISK_OPP.includes(obj.riskOpportunity as string)
  )
}

function buildUserMessage(body: RequestBody): string {
  const { entityProfile, businessModelContext, questionnaireResponses } = body
  const { clientName, sector, subSector, geography } = entityProfile

  const responsesText = Object.entries(questionnaireResponses)
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  return `Entity: ${clientName}
Sector: ${sector} — ${subSector}
Geography: ${geography}

Business model:
  Description: ${businessModelContext.description}
  Key products/services: ${businessModelContext.keyProductsServices}
  Key markets/regions: ${businessModelContext.keyMarketsRegions}

Questionnaire responses:
${responsesText || '(none provided)'}

Map the full value chain for this entity. Return the JSON object only.`
}

valueChainRouter.post('/api/value-chain/populate', async (c) => {
  let body: RequestBody
  try {
    body = await c.req.json<RequestBody>()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const { entityProfile, businessModelContext, questionnaireResponses } = body

  if (
    !entityProfile ||
    typeof entityProfile.clientName !== 'string' ||
    typeof entityProfile.sector !== 'string' ||
    typeof entityProfile.geography !== 'string'
  ) {
    return c.json({ error: 'entityProfile with clientName, sector, geography is required' }, 400)
  }

  if (!businessModelContext || !questionnaireResponses) {
    return c.json({ error: 'businessModelContext and questionnaireResponses are required' }, 400)
  }

  const userMessage = buildUserMessage(body)

  let raw: string
  try {
    raw = await callLLM({
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
      maxTokens: 4096,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'LLM call failed'
    return c.json({ error: msg }, 502)
  }

  // Extract the JSON object from the response
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) {
    return c.json({ error: 'LLM returned no parseable JSON object' }, 502)
  }

  let parsed: { activities?: unknown[]; resources?: unknown[] }
  try {
    parsed = JSON.parse(match[0])
  } catch {
    return c.json({ error: 'LLM returned invalid JSON' }, 502)
  }

  const activities = (parsed.activities ?? [])
    .filter(isValidActivity)
    .map((a) => ({
      stage: a.stage,
      activity: a.activity,
      description: a.description,
      vendorType: a.vendorType ?? '',
      keyStakeholders: a.keyStakeholders ?? '',
      geography: a.geography ?? '',
      keyInputs: a.keyInputs ?? '',
      keyOutputs: a.keyOutputs ?? '',
      notes: a.notes ?? '',
    }))

  const resources = (parsed.resources ?? [])
    .filter(isValidResource)
    .map((r) => ({
      vendor: r.vendor,
      valueChainStage: r.valueChainStage,
      capitalType: r.capitalType,
      resourceRelationship: r.resourceRelationship,
      dependencyImpact: r.dependencyImpact,
      riskOpportunity: r.riskOpportunity,
      description: r.description ?? '',
    }))

  return c.json({ activities, resources })
})

export default valueChainRouter
