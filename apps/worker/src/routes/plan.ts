import { Hono } from 'hono'
import type { PlanPayload } from '../do/SchedulerDO'
import { verifyTurnstile } from '../adapters/turnstile'

export const plan = new Hono<{
  Bindings: {
    SCHEDULER_DO: DurableObjectNamespace
    auragrid_db: D1Database
    TURNSTILE_SECRET: string
  }
}>()

// Resolve tenant -> DO id. For MVP we use single-tenant 'demo'
function getStub(c: any, tenant = 'demo') {
  const id = c.env.SCHEDULER_DO.idFromName(tenant)
  return c.env.SCHEDULER_DO.get(id)
}

plan.get('/api/plan', async (c) => {
  const stub = getStub(c)
  const resp = await stub.fetch(new URL('/plan', 'http://do').toString())
  return new Response(resp.body, { headers: { 'content-type': 'application/json' } })
})

plan.post('/api/apply', async (c) => {
  const { token, payload, tenant = 'demo' } = await c.req.json<{
    token: string; payload: PlanPayload; tenant?: string
  }>()
  const ok = await verifyTurnstile(c.env.TURNSTILE_SECRET, token, c.req.header('cf-connecting-ip') || undefined)
  if (!ok) return c.json({ error: 'turnstile_failed' }, 400)

  const stub = getStub(c, tenant)
  const resp = await stub.fetch(new URL('/apply', 'http://do').toString(), {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'content-type': 'application/json' }
  })
  if (!resp.ok) return c.json({ error: await resp.text() }, resp.status)

  // Log to D1
  await c.env.auragrid_db
    .prepare('INSERT INTO audit_logs (action, tenant, version, metrics_json) VALUES (?1, ?2, ?3, ?4)')
    .bind('apply', tenant, payload.version, JSON.stringify(payload.metrics))
    .run()

  await c.env.auragrid_db
    .prepare('INSERT INTO impacts (tenant, peak_reduction_pct, renewable_gain_pct, co2_avoided_kg) VALUES (?1, ?2, ?3, ?4)')
    .bind(tenant, payload.metrics.peak_reduction_pct, payload.metrics.renewable_gain_pct, payload.metrics.co2_avoided_kg)
    .run()

  return c.json({ ok: true, version: payload.version })
})

export default plan
