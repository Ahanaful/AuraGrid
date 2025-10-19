// apps/worker/src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { forecast } from './routes/forecast'
import { optimize } from './routes/optimize'
import { insight } from './routes/insight'
import plan from './routes/plan'
import reopt from './routes/reoptimize'
import { SchedulerDO } from './do/SchedulerDO'

type ForecastRow = {
  load_pred_mw: number
  solar_mw?: number
  wind_mw?: number
}

type Env = {
  auragrid_forecast: KVNamespace; AI: Ai; auragrid_db: D1Database;
  SCHEDULER_DO: DurableObjectNamespace;
  TURNSTILE_SECRET: string;
}

const app = new Hono<{ Bindings: Env }>()
app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type'] }))

app.get('/health', c => c.json({ ok: true }))

app.route('/', forecast)
app.route('/', optimize)
app.route('/', insight)
app.route('/', plan)
app.route('/', reopt)

// Export fetch + scheduled to support Cron
export default {
  fetch: app.fetch,
  // Cron: call the same reopt logic for default tenant
  scheduled: async (_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) => {
    // Hono isn't directly usable here; just reconstruct minimal logic:
    // We’ll call DO directly to avoid extra plumbing, but re-using logic is cleaner:
    // For brevity, call the DO on schedule (you can also import the core functions and duplicate here).
    // A simple approach is to fetch your own endpoint if you deploy (works fine in prod):
    // await fetch('https://<your-worker>.workers.dev/api/reoptimize', { method: 'POST' })
    // For local/portable scheduled, re-implement tiny bit:
    const kv = env.auragrid_forecast
    const rows = JSON.parse((await kv.get('forecast.json')) || '[]') as ForecastRow[]
    if (!rows.length) return
    const base = rows.map((row) => row.load_pred_mw)
    const renewable = rows.map((row) => (row.solar_mw ?? 0) + (row.wind_mw ?? 0))
    // naive greedy (inline to avoid importing domain in sched): keep as is or import your functions.
    const max = Math.max(...base)
    const peakThreshold = 0.9 * max
    const maxShiftPerHour = Math.max(10, Math.round(max * 0.05))
    let budget = Math.round(base.length * 0.4)
    const optimized = [...base]
    const peaks = base
      .map((value, index) => ({ index, over: Math.max(value - peakThreshold, 0) }))
      .filter((entry) => entry.over > 0)
      .sort((a, b) => b.over - a.over)
      .map((entry) => entry.index)

    const greens = renewable
      .map((value, index) => ({ index, value }))
      .sort((a, b) => b.value - a.value)
      .map((entry) => entry.index)

    for (const from of peaks) {
      if (budget <= 0) break
      const to = greens.shift()
      if (to == null) break
      const transferable = Math.min(maxShiftPerHour, budget)
      optimized[from] = Math.max(0, optimized[from] - transferable)
      optimized[to] += transferable
      budget -= transferable
    }

    const peakSum = base.reduce((sum, value) => sum + Math.max(value - peakThreshold, 0), 0)
    const peakSumOpt = optimized.reduce((sum, value) => sum + Math.max(value - peakThreshold, 0), 0)
    const peak_reduction_pct = peakSum ? ((peakSum - peakSumOpt) / peakSum) * 100 : 0
    const align = base.reduce((sum, value, index) => sum + Math.min(value, renewable[index]), 0)
    const alignOpt = optimized.reduce((sum, value, index) => sum + Math.min(value, renewable[index]), 0)
    const renewable_gain_pct = align ? ((alignOpt - align) / align) * 100 : 0
    const co2_avoided_kg = Math.max(0, alignOpt - align) * 0.4

    const payload = {
      version: Date.now(),
      plan: { base, renewable, optimized },
      metrics: { peak_reduction_pct, renewable_gain_pct, co2_avoided_kg }
    }

    const id = env.SCHEDULER_DO.idFromName('demo')
    const stub = env.SCHEDULER_DO.get(id)
    await stub.fetch(new URL('/apply', 'http://do').toString(), { method: 'POST', body: JSON.stringify(payload), headers: { 'content-type': 'application/json' } })
    await env.auragrid_db
      .prepare('INSERT INTO audit_logs (action, tenant, version, metrics_json) VALUES (?1,?2,?3,?4)')
      .bind('cron-reoptimize', 'demo', payload.version, JSON.stringify(payload.metrics))
      .run()
    await env.auragrid_db
      .prepare('INSERT INTO impacts (tenant, peak_reduction_pct, renewable_gain_pct, co2_avoided_kg) VALUES (?1,?2,?3,?4)')
      .bind('demo', payload.metrics.peak_reduction_pct, payload.metrics.renewable_gain_pct, payload.metrics.co2_avoided_kg)
      .run()
  }
}

// Required for Wrangler to register the DO class
export { SchedulerDO }
