import { Hono } from 'hono'
import { readForecast } from '../adapters/kvStore'
import { carbonAwareOptimize } from '../domain/optimize'
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
  const intensity = rows.map((row, index) => {
    const explicit = row.carbon_intensity_kg_per_mwh
    if (typeof explicit === 'number' && Number.isFinite(explicit)) {
      return explicit
    }

    const load = base[index] ?? 0
    const renewables = renewable[index] ?? 0
    const share = row.renewable_share ?? (load > 0 ? Math.min(Math.max(renewables / load, 0), 1) : 0)
    const baseline = 450
    const minimum = 80
    return minimum + (baseline - minimum) * (1 - share)
  })

  const { optimized, shifts } = carbonAwareOptimize(base, intensity)
  const metrics = computeMetrics(base, optimized, renewable, intensity)

  return c.json({ base, optimized, renewable, intensity, metrics, shifts })
})
