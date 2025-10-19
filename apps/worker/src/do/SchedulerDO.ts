import { computePlanFromForecast, logRun } from '../services/reoptimizer'
import type { PlanPayload, RunTrigger, StoredPlan } from '../types/plan'

const AUTO_REOPT_DELAY_MS = 15 * 60 * 1000 // 15 minutes

type Env = {
  auragrid_forecast: KVNamespace
  auragrid_db: D1Database
}

type ApplyBody =
  | (PlanPayload & { tenant?: string; forecastDigest?: string; trigger?: RunTrigger })
  | {
      payload: PlanPayload
      tenant?: string
      forecastDigest?: string
      trigger?: RunTrigger
    }

export class SchedulerDO {
  private state: DurableObjectState
  private storage: DurableObjectStorage
  private env: Env
  private cachedTenant?: string

  constructor(state: DurableObjectState, env: Env) {
    this.state = state
    this.storage = state.storage
    this.env = env
  }

  async fetch(req: Request) {
    const url = new URL(req.url)

    if (req.method === 'GET' && url.pathname === '/plan') {
      const record = await this.storage.get<StoredPlan>('plan')
      return Response.json(record ?? null)
    }

    if (req.method === 'POST' && url.pathname === '/apply') {
      const body = (await req.json()) as ApplyBody
      const { payload, forecastDigest, trigger, tenant } = this.normalizeBody(body)

      const current = await this.storage.get<StoredPlan>('plan')
      if (current && payload.version <= current.payload.version) {
        return new Response('stale version', { status: 409 })
      }

      await this.ensureTenant(tenant)

      const record: StoredPlan = {
        payload,
        forecastDigest,
        trigger,
        updatedAt: Date.now(),
      }

      if (forecastDigest) {
        record.nextAlarmAt = Date.now() + AUTO_REOPT_DELAY_MS
        await this.storage.setAlarm(record.nextAlarmAt)
      } else {
        await this.storage.deleteAlarm()
      }

      await this.storage.put('plan', record)

      return Response.json({ ok: true, version: payload.version })
    }

    return new Response('Not found', { status: 404 })
  }

  async alarm() {
    const record = await this.storage.get<StoredPlan>('plan')
    if (!record || !record.forecastDigest) {
      // No digest to compare; nothing to do
      return
    }

    const computed = await computePlanFromForecast(
      { auragrid_forecast: this.env.auragrid_forecast },
      Date.now(),
    )

    if (!computed) {
      // Forecast missing; check again later
      await this.storage.setAlarm(Date.now() + AUTO_REOPT_DELAY_MS)
      return
    }

    if (computed.forecastDigest === record.forecastDigest) {
      // Forecast unchanged; schedule another check
      await this.storage.setAlarm(Date.now() + AUTO_REOPT_DELAY_MS)
      return
    }

    const tenant = await this.ensureTenant()
    const newRecord: StoredPlan = {
      payload: computed.payload,
      forecastDigest: computed.forecastDigest,
      trigger: 'alarm',
      updatedAt: Date.now(),
      nextAlarmAt: Date.now() + AUTO_REOPT_DELAY_MS,
    }

    await this.storage.put('plan', newRecord)
    await this.storage.setAlarm(newRecord.nextAlarmAt)

    await logRun(
      { auragrid_db: this.env.auragrid_db },
      {
        tenant,
        trigger: 'alarm',
        payload: computed.payload,
        forecastDigest: computed.forecastDigest,
      },
    )
  }

  private normalizeBody(body: ApplyBody) {
    if ('payload' in body && body.payload) {
      return {
        payload: body.payload,
        forecastDigest: body.forecastDigest,
        trigger: body.trigger ?? 'manual',
        tenant: body.tenant,
      }
    }

    const { tenant, forecastDigest, trigger, ...rest } = body
    return {
      payload: rest as PlanPayload,
      forecastDigest,
      trigger: trigger ?? 'manual',
      tenant,
    }
  }

  private async ensureTenant(candidate?: string) {
    if (candidate) {
      this.cachedTenant = candidate
      await this.storage.put('tenant', candidate)
      return candidate
    }

    if (this.cachedTenant) return this.cachedTenant

    const stored = await this.storage.get<string>('tenant')
    if (stored) {
      this.cachedTenant = stored
      return stored
    }

    // Fall back to the durable object name if available
    const fallback = (this.state.id as { name?: string }).name || 'demo'
    this.cachedTenant = fallback
    await this.storage.put('tenant', fallback)
    return fallback
  }
}
