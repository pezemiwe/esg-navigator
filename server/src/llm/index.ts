const LLM_CLIENT = process.env.LLM_CLIENT ?? 'anthropic'
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'

const MOCK_RESPONSE = JSON.stringify([
  {
    ref: 'SRRO-AI-001',
    source: 'AI Generation',
    title: 'Climate transition risk',
    description:
      'Exposure to policy, regulatory and market changes driven by the transition to a low-carbon economy',
    type: 'Risk',
    valueChainStage: 'Core',
    financialImpact: 'Yes',
    strategicImpact: 'Yes',
    operationalImpact: 'No',
    timeHorizon: 'Medium',
    likelihood: 3,
    magnitude: 4,
    neededByPrimaryUser: 'Yes',
    includeInFinalList: 'Yes',
    srroCrro: 'CRRO',
  },
  {
    ref: 'SRRO-AI-002',
    source: 'AI Generation',
    title: 'Physical climate risk — acute events',
    description:
      'Increased frequency and severity of extreme weather events impacting operations and assets',
    type: 'Risk',
    valueChainStage: 'Upstream',
    financialImpact: 'Yes',
    strategicImpact: 'No',
    operationalImpact: 'Yes',
    timeHorizon: 'Short',
    likelihood: 4,
    magnitude: 3,
    neededByPrimaryUser: 'Yes',
    includeInFinalList: 'Yes',
    srroCrro: 'CRRO',
  },
  {
    ref: 'SRRO-AI-003',
    source: 'AI Generation',
    title: 'Sustainable finance opportunity',
    description: 'Growing demand for ESG-linked products and green finance instruments',
    type: 'Opportunity',
    valueChainStage: 'Downstream',
    financialImpact: 'Yes',
    strategicImpact: 'Yes',
    operationalImpact: 'No',
    timeHorizon: 'Long',
    likelihood: 3,
    magnitude: 3,
    neededByPrimaryUser: 'Yes',
    includeInFinalList: 'Yes',
    srroCrro: 'SRRO',
  },
])

export async function callLLM(opts: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
  system?: string
  maxTokens?: number
}): Promise<string> {
  if (LLM_CLIENT === 'mock') {
    return MOCK_RESPONSE
  }

  if (LLM_CLIENT === 'bedrock') {
    throw new Error('Bedrock not yet implemented')
  }

  // anthropic (default)
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required when LLM_CLIENT is "anthropic"')
  }

  const body: Record<string, unknown> = {
    model: ANTHROPIC_MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    messages: opts.messages,
  }
  if (opts.system) {
    body.system = opts.system
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '(no body)')
    throw new Error(`Anthropic API error ${res.status} ${res.statusText}: ${detail}`)
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text: string }>
  }

  const text = data.content?.[0]?.text
  if (typeof text !== 'string') {
    throw new Error(`Unexpected Anthropic response shape: ${JSON.stringify(data)}`)
  }

  return text
}
