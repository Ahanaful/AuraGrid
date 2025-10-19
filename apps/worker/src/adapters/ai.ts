import type { Ai } from '@cloudflare/workers-types'
import type { OptimizeMetrics } from '../types/api'

const MODEL = '@cf/meta/llama-3.1-8b-instruct'

type InsightContext = {
  cleanHours: (string | null)[]
  relievedHours: (string | null)[]
}

export async function summarize(
  ai: Ai | undefined,
  metrics: OptimizeMetrics,
  context?: InsightContext,
) {
  const fallback = buildFallbackSummary(metrics)

  if (!ai || typeof ai.run !== 'function') {
    return { summary: buildContextualSummary(fallback, context), metrics }
  }

  try {
    const prompt = createPrompt(metrics, context)

    const response = await ai.run(MODEL as any, {
      messages: [
        { role: 'system', content: 'You are an energy operations advisor.' },
        { role: 'user', content: prompt },
      ],
    } as any)

    const summary = extractText(response)
    if (!summary.trim()) {
      return { summary: buildContextualSummary(fallback, context), metrics }
    }

    return { summary, metrics }
  } catch (error) {
    console.warn('[insight:summarize] AI fallback engaged', error)
    return { summary: buildContextualSummary(fallback, context), metrics }
  }
}

function extractText(response: unknown): string {
  if (!response) return ''

  if (typeof response === 'string') return response

  if (typeof response === 'object') {
    const maybeRecord = response as Record<string, unknown>

    if (maybeRecord.response && typeof maybeRecord.response === 'string') {
      return maybeRecord.response
    }

    const maybeText = maybeRecord.text
    if (typeof maybeText === 'string') return maybeText

    const choices = maybeRecord.choices
    if (Array.isArray(choices) && choices.length) {
      const first = choices[0] as Record<string, unknown>
      const message = first.message as Record<string, unknown> | undefined
      const content = message?.content
      if (typeof content === 'string') return content
      if (Array.isArray(content)) {
        return content
          .map((block) => (typeof block?.text === 'string' ? block.text : ''))
          .join('\n')
      }
    }
  }

  return ''
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

function buildContextualSummary(base: string, context?: InsightContext | null) {
  if (!context) return base
  const clean = formatList(context.cleanHours)
  const relieved = formatList(context.relievedHours)

  const cleanSentence = `Cleanest hours: ${clean}.`
  const relievedSentence = `Relieved fossil-heavy hours: ${relieved}.`
  return `${cleanSentence} ${relievedSentence} ${base}`.trim()
}

function createPrompt(metrics: OptimizeMetrics, context?: InsightContext) {
  const clean = formatList(context?.cleanHours)
  const relieved = formatList(context?.relievedHours)

  return `You are advising a data center SRE. Metrics: ${JSON.stringify(
    metrics,
  )}. Provide exactly two sentences totaling under 45 words. The first sentence must begin with "Cleanest hours:" followed by ${clean}. The second must begin with "Relieved fossil-heavy hours:" followed by ${relieved}, finishing with a brief reason those hours lower emissions without introducing new peaks.`
}

function formatList(values?: (string | null)[]) {
  if (!values || values.length === 0) return 'none identified'
  const filtered = values.filter((value): value is string => Boolean(value))
  if (!filtered.length) return 'none identified'
  if (filtered.length === 1) return filtered[0]
  if (filtered.length === 2) return `${filtered[0]} and ${filtered[1]}`
  return `${filtered.slice(0, -1).join(', ')} and ${filtered.slice(-1)}`
}
