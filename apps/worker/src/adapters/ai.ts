import type { Ai } from '@cloudflare/workers-types'
import type { OptimizeMetrics } from '../types/api'

const MODEL = '@cf/meta/llama-3.1-8b-instruct'

export async function summarize(ai: Ai, metrics: OptimizeMetrics) {
  const prompt = `You are advising a data center SRE. Metrics: ${JSON.stringify(metrics)}. In two short sentences (under 45 words), say when to shift jobs and why this reduces emissions and peaks.`

  const response = await ai.run(MODEL, { prompt })
  const summary = response?.response ?? String(response)
  return { summary, metrics }
}
