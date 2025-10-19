import { Hono } from 'hono'
import { runReoptimization } from '../services/reoptimizer'

export const reopt = new Hono<{
  Bindings: {
    auragrid_forecast: KVNamespace
    SCHEDULER_DO: DurableObjectNamespace
    auragrid_db: D1Database
  }
}>()

reopt.post('/api/reoptimize', async (c) => {
  try {
    const payload = await runReoptimization(
      {
        auragrid_forecast: c.env.auragrid_forecast,
        SCHEDULER_DO: c.env.SCHEDULER_DO,
        auragrid_db: c.env.auragrid_db,
      },
      { tenant: 'demo', trigger: 'reoptimize' },
    )

    if (!payload) return c.json({ error: 'no_forecast' }, 400)

    return c.json({ ok: true, metrics: payload.metrics, version: payload.version })
  } catch (error) {
    console.error('[reoptimize:post]', error)
    return c.json({ error: 'internal_error' }, 500)
  }
})

export default reopt
