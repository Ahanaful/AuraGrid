import type { Ai } from '@cloudflare/workers-types'
import type { OptimizeMetrics } from '../types/api'

const MODEL = '@cf/meta/llama-3.1-8b-instruct'

export async function summarize(ai: Ai | undefined, metrics: OptimizeMetrics) {
  const fallback = buildFallbackSummary(metrics)

  if (!ai || typeof ai.run !== 'function') {
    return { summary: fallback, metrics }
  }

  try {
    const prompt = `You are advising a data center SRE. Metrics: ${JSON.stringify(
      metrics,
    )}. In two short sentences (under 45 words), explain which hours are cleanest, which fossil-heavy hours were relieved, and why this combination lowers emissions without creating new peaks.`

    const response = await ai.run(MODEL as any, { prompt })
    const summary =
      typeof response === 'object' && response !== null && 'response' in response
        ? String((response as { response: unknown }).response)
        : String(response)

    if (!summary.trim()) {
      return { summary: fallback, metrics }
    }

    return { summary, metrics }
  } catch (error) {
    console.warn('[insight:summarize] AI fallback engaged', error)
    return { summary: fallback, metrics }
  }
}

function buildFallbackSummary(metrics: OptimizeMetrics): string {
  const peak = metrics.peak_reduction_pct
  const renewable = metrics.renewable_gain_pct
  const co2 = metrics.co2_avoided_kg

  const peakPhrase = peak > 0.05 ? `Peak load above the guardrail dropped ${peak.toFixed(1)}%.` : 'Peak guardrails held steady.'
  const renewablePhrase = renewable > 0.05 ? `Renewable overlap improved ${renewable.toFixed(1)}%.` : 'Renewable overlap was unchanged.'
  const co2Phrase = co2 > 0 ? `Avoided ${co2.toFixed(0)} kg CO₂ versus baseline.` : 'No CO₂ savings this run.'

  return `${peakPhrase} ${renewablePhrase} ${co2Phrase}`
}
