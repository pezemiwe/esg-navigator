import { Hono } from 'hono'
import { callLLM } from '../llm/index.js'

const reportRouter = new Hono()

const SUMMARY_SYSTEM_PROMPT = `You are a senior IFRS S1/S2 sustainability reporting consultant at a Big Four firm. Write a professional executive summary for a consolidated ESG materiality assessment report.

Requirements:
- 3–5 paragraphs, formal but readable
- Cover governance readiness, key material risks/opportunities identified, and recommended next steps for disclosure and data collection
- Reference specific material metrics where provided
- Do not invent data not supplied in the prompt
- No markdown, bullet points, or headings — flowing prose only
- British English spelling`

interface SummaryRequestBody {
  clientName: string
  sector: string
  geography: string
  governanceRating: string
  governanceAvg: number
  gapCount: number
  srroCount: number
  materialCount: number
  materialItems: { ref: string; title: string; metric: string; finalScore: number }[]
}

reportRouter.post('/api/report/generate-summary', async (c) => {
  let body: SummaryRequestBody

  try {
    body = await c.req.json<SummaryRequestBody>()
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400)
  }

  const materialLines = body.materialItems.length > 0
    ? body.materialItems
        .slice(0, 12)
        .map((m) => `- ${m.ref}: ${m.title} → ${m.metric} (Final score: ${m.finalScore})`)
        .join('\n')
    : 'None scored as material yet'

  const userMessage = `Client: ${body.clientName || 'Unknown'}
Sector: ${body.sector || 'Not specified'}
Geography: ${body.geography || 'Not specified'}

Governance assessment:
- Overall rating: ${body.governanceRating} (${body.governanceAvg.toFixed(2)} / 3.00)
- Governance gaps identified: ${body.gapCount}

Materiality outcomes:
- SRROs/CRROs on final list: ${body.srroCount}
- Material items (Final ≥ 6): ${body.materialCount}

Key material metrics:
${materialLines}

Write the executive summary for the consolidated report.`

  try {
    const summary = await callLLM({
      system: SUMMARY_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
      maxTokens: 1200,
    })
    return c.json({ summary: summary.trim() })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: `LLM error: ${message}` }, 500)
  }
})

export default reportRouter
