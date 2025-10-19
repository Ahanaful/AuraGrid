import { Hono } from 'hono'
import { readForecast } from '../adapters/kvStore'
import { greedyOptimize } from '../domain/optimize'
import { computeMetrics } from '../domain/metrics'
import type { PlanPayload } from '../do/SchedulerDO'

export const reopt = new Hono<{
  Bindings: {
    auragrid_forecast: KVNamespace
    SCHEDULER_DO: DurableObjectNamespace
    auragrid_db: D1Database
  }
}>()

function getStub(c: any, tenant = 'demo') {
  const id = c.env.SCHEDULER_DO.idFromName(tenant)
  return c.env.SCHEDULER_DO.get(id)
}

reopt.post('/api/reoptimize', async (c) => {
  const rows = await readForecast(c.env.auragrid_forecast)
  if (!rows || !rows.length) return c.json({ error: 'no_forecast' }, 400)

  const base = rows.map(r => r.load_pred_mw)
  const renewable = rows.map(r => (r.solar_mw ?? 0) + (r.wind_mw ?? 0))
  const optimized = greedyOptimize(base, renewable)
  const metrics = computeMetrics(base, optimized, renewable)

  // version strategy: use current time ticks
  const payload: PlanPayload = {
    version: Date.now(),
    plan: { base, renewable, optimized },
    metrics
  }

  const stub = getStub(c, 'demo')
  const resp = await stub.fetch(new URL('/apply', 'http://do').toString(), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' }
  })
  if (!resp.ok) return c.json({ error: await resp.text() }, resp.status)

  await c.env.auragrid_db
    .prepare('INSERT INTO audit_logs (action, tenant, version, metrics_json) VALUES (?1, ?2, ?3, ?4)')
    .bind('cron-reoptimize', 'demo', payload.version, JSON.stringify(metrics))
    .run()

  await c.env.auragrid_db
    .prepare('INSERT INTO impacts (tenant, peak_reduction_pct, renewable_gain_pct, co2_avoided_kg) VALUES (?1, ?2, ?3, ?4)')
    .bind('demo', metrics.peak_reduction_pct, metrics.renewable_gain_pct, metrics.co2_avoided_kg)
    .run()

  return c.json({ ok: true, metrics, version: payload.version })
})

export default reopt
