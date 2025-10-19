import { Hono } from 'hono'
import { summarize } from '../adapters/ai'
import { computePlanFromForecast } from '../services/reoptimizer'

const CDT_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Chicago',
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
})

export const insight = new Hono<{
  Bindings: { AI: any; auragrid_forecast: KVNamespace }
}>()

insight.get('/api/insight', async (c) => {
  const computed = await computePlanFromForecast({ auragrid_forecast: c.env.auragrid_forecast })
  if (!computed) {
    return c.json({ summary: '', metrics: {} })
  }

  const metrics = computed.payload.metrics
  const context = buildContext(computed.payload.plan, computed.rows)
  const result = await summarize(c.env.AI, metrics, context)
  return c.json(result)
})

function buildContext(
  plan: { base: number[]; optimized: number[]; renewable: number[] },
  rows: { ds: string }[],
) {
  const deltas = plan.base.map((value, index) => Math.max(0, value - plan.optimized[index]))
  return {
    cleanHours: takeTopTimestamps(plan.renewable, rows),
    relievedHours: takeTopTimestamps(deltas, rows),
  }
}

function takeTopTimestamps(values: number[], rows: { ds: string }[], count = 2) {
  return values
    .map((value, index) => ({ value, index }))
    .filter(({ value }) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, count)
    .map(({ index }) => formatTimestamp(rows[index]?.ds))
    .filter((v): v is string => Boolean(v))
}

function formatTimestamp(ds?: string) {
  if (!ds) return null
  try {
    const date = new Date(ds)
    if (Number.isNaN(date.getTime())) return ds
    return CDT_FORMATTER.format(date)
  } catch (error) {
    console.warn('[insight:formatTimestamp]', error)
    return ds
  }
}
