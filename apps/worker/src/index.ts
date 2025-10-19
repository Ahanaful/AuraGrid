// apps/worker/src/index.ts
import type { Ai } from '@cloudflare/workers-types'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { forecast } from './routes/forecast'
import { optimize } from './routes/optimize'
import { insight } from './routes/insight'
import plan from './routes/plan'
import reopt from './routes/reoptimize'
import { SchedulerDO } from './do/SchedulerDO'
import { runReoptimization } from './services/reoptimizer'

type Env = {
  auragrid_forecast: KVNamespace
  AI: Ai
  auragrid_db: D1Database
  SCHEDULER_DO: DurableObjectNamespace
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
  scheduled: async (_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) => {
    await runReoptimization(
      {
        auragrid_forecast: env.auragrid_forecast,
        SCHEDULER_DO: env.SCHEDULER_DO,
        auragrid_db: env.auragrid_db,
      },
      { tenant: 'demo', trigger: 'cron-reoptimize' },
    )
  },
}

// Required for Wrangler to register the DO class
export { SchedulerDO }
