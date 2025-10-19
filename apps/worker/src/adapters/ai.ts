import type { Ai } from '@cloudflare/workers-types'
import type { OptimizeMetrics } from '../types/api'

const MODEL = '@cf/meta/llama-3.1-8b-instruct'

export async function summarize(ai: Ai, metrics: OptimizeMetrics) {
  const prompt = `You are advising a data center SRE. Metrics: ${JSON.stringify(
    metrics,
  )}. In two short sentences (under 45 words), explain which hours are cleanest, which fossil-heavy hours were relieved, and why this combination lowers emissions without creating new peaks.`

  const response = await ai.run(MODEL as any, { prompt })
  const summary =
    typeof response === 'object' && response !== null && 'response' in response
      ? String((response as { response: unknown }).response)
      : String(response)
  return { summary, metrics }
}
