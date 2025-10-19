import { readForecast } from '../adapters/kvStore'
import { carbonAwareOptimize } from '../domain/optimize'
import { computeMetrics } from '../domain/metrics'
import type { ForecastRow } from '../types/api'
import type { PlanPayload, RunTrigger } from '../types/plan'

export type ReoptBindings = {
  auragrid_forecast: KVNamespace
  SCHEDULER_DO: DurableObjectNamespace
  auragrid_db: D1Database
}

type MinimalBindings = Pick<ReoptBindings, 'auragrid_forecast'>
type DurableBindings = Pick<ReoptBindings, 'SCHEDULER_DO'>
type DatabaseBindings = Pick<ReoptBindings, 'auragrid_db'>

export type ComputedPlan = {
  payload: PlanPayload
  forecastDigest: string
  rows: ForecastRow[]
}

export async function computePlanFromForecast(
  bindings: MinimalBindings,
  version: number = Date.now(),
): Promise<ComputedPlan | null> {
  const rows = await readForecast(bindings.auragrid_forecast)
  if (!rows || rows.length === 0) return null

  const base = rows.map((r) => r.load_pred_mw)
  const renewable = rows.map((r) => (r.solar_mw ?? 0) + (r.wind_mw ?? 0))
  const intensity = rows.map((row, index) => {
    if (typeof row.carbon_intensity_kg_per_mwh === 'number') {
      return row.carbon_intensity_kg_per_mwh
    }

    const load = base[index] ?? 0
    const renewables = renewable[index] ?? 0
    const share = row.renewable_share ?? (load > 0 ? Math.min(Math.max(renewables / load, 0), 1) : 0)
    const baseline = 450
    const minimum = 80
    return minimum + (baseline - minimum) * (1 - share)
  })

  const { optimized } = carbonAwareOptimize(base, intensity)
  const metrics = computeMetrics(base, optimized, renewable, intensity)

  const payload: PlanPayload = {
    version,
    plan: { base, renewable, optimized },
    metrics,
  }

  const forecastDigest = await digestForecast(rows)

  return { payload, forecastDigest, rows }
}

export async function applyPlanToDO(
  bindings: DurableBindings,
  tenant: string,
  body: {
    payload: PlanPayload
    forecastDigest?: string
    trigger: RunTrigger
  },
): Promise<void> {
  const id = bindings.SCHEDULER_DO.idFromName(tenant)
  const stub = bindings.SCHEDULER_DO.get(id)
  const resp = await stub.fetch(new URL('/apply', 'http://do').toString(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...body, tenant }),
  })
  if (!resp.ok) {
    const message = await resp.text()
    throw new Error(message || 'failed_to_apply_plan')
  }
}

export async function logRun(
  bindings: DatabaseBindings,
  params: {
    tenant: string
    trigger: RunTrigger
    payload: PlanPayload
    forecastDigest?: string
  },
): Promise<void> {
  const { tenant, trigger, payload, forecastDigest } = params
  const metricsJson = JSON.stringify(payload.metrics)
  const planJson = JSON.stringify(payload.plan)

  await bindings.auragrid_db
    .prepare(
      'INSERT INTO runs (tenant, trigger, version, forecast_digest, plan_json, metrics_json) VALUES (?1, ?2, ?3, ?4, ?5, ?6)',
    )
    .bind(tenant, trigger, payload.version, forecastDigest ?? null, planJson, metricsJson)
    .run()

  await bindings.auragrid_db
    .prepare('INSERT INTO audit_logs (action, tenant, version, metrics_json) VALUES (?1, ?2, ?3, ?4)')
    .bind(trigger, tenant, payload.version, metricsJson)
    .run()

  await bindings.auragrid_db
    .prepare(
      'INSERT INTO impacts (tenant, peak_reduction_pct, renewable_gain_pct, co2_avoided_kg) VALUES (?1, ?2, ?3, ?4)',
    )
    .bind(
      tenant,
      payload.metrics.peak_reduction_pct,
      payload.metrics.renewable_gain_pct,
      payload.metrics.co2_avoided_kg,
    )
    .run()
}

export async function runReoptimization(
  bindings: ReoptBindings,
  options: {
    tenant?: string
    trigger: RunTrigger
    version?: number
  },
): Promise<PlanPayload | null> {
  const tenant = options.tenant ?? 'demo'
  const computed = await computePlanFromForecast(bindings, options.version)
  if (!computed) return null

  try {
    await applyPlanToDO(bindings, tenant, {
      payload: computed.payload,
      forecastDigest: computed.forecastDigest,
      trigger: options.trigger,
    })

    await logRun(bindings, {
      tenant,
      trigger: options.trigger,
      payload: computed.payload,
      forecastDigest: computed.forecastDigest,
    })
  } catch (error) {
    console.error('[runReoptimization]', error)
    throw error
  }

  return computed.payload
}

async function digestForecast(rows: ForecastRow[]): Promise<string> {
  if (!crypto?.subtle) {
    throw new Error('Web Crypto API unavailable for digest')
  }

  const encoder = new TextEncoder()
  const serialized = JSON.stringify(rows)
  const data = encoder.encode(serialized)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return bufferToHex(digest)
}

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
