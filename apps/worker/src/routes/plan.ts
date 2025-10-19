import { Hono } from 'hono'
import { applyPlanToDO, logRun } from '../services/reoptimizer'
import type { PlanPayload, StoredPlan } from '../types/plan'

export const plan = new Hono<{
  Bindings: {
    SCHEDULER_DO: DurableObjectNamespace
    auragrid_db: D1Database
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
  if (!resp.ok) {
    const message = await resp.text()
    console.error('[plan:get] DO error', message)
    return c.json({ error: 'do_error' }, 500)
  }

  const data = (await resp.json()) as StoredPlan | null
  if (!data) return c.json(null)

  const payload = {
    ...data.payload,
    trigger: data.trigger ?? null,
    updatedAt: data.updatedAt,
    nextAlarmAt: data.nextAlarmAt ?? null,
  }

  return c.json(payload)
})

plan.post('/api/apply', async (c) => {
  const body = (await c.req.json()) as {
    payload: PlanPayload
    tenant?: string
  }
  const { payload, tenant = 'demo' } = body

  try {
    await applyPlanToDO({ SCHEDULER_DO: c.env.SCHEDULER_DO }, tenant, {
      payload,
      trigger: 'apply',
    })
  } catch (error) {
    console.error('[plan:apply] applyPlanToDO failed', error)
    const message = error instanceof Error ? error.message : 'apply_failed'
    return c.json({ error: message }, 409)
  }

  try {
    await logRun({ auragrid_db: c.env.auragrid_db }, {
      tenant,
      trigger: 'apply',
      payload,
    })
  } catch (error) {
    console.error('[plan:apply] logRun failed', error)
    return c.json({ error: 'log_failed' }, 500)
  }

  return c.json({ ok: true, version: payload.version })
})

export default plan
