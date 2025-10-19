import { Hono } from 'hono'
import { readForecast } from '../adapters/kvStore'
import { greedyOptimize } from '../domain/optimize'
import { computeMetrics } from '../domain/metrics'

export const optimize = new Hono<{ Bindings: { auragrid_forecast: KVNamespace } }>()

optimize.get('/api/optimize', async (c) => {
  const rows = await readForecast(c.env.auragrid_forecast)
  if (!rows || rows.length === 0) {
    return c.json({
      base: [],
      optimized: [],
      renewable: [],
      metrics: { peak_reduction_pct: 0, renewable_gain_pct: 0, co2_avoided_kg: 0 },
    })
  }

  const base = rows.map((row) => row.load_pred_mw)
  const renewable = rows.map((row) => (row.solar_mw ?? 0) + (row.wind_mw ?? 0))
  const optimized = greedyOptimize(base, renewable)
  const metrics = computeMetrics(base, optimized, renewable)

  return c.json({ base, optimized, renewable, metrics })
})
