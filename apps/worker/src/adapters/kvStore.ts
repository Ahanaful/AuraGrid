import { ForecastArraySchema } from '../lib/schema'
import type { ForecastRow } from '../types/api'

export const KV_KEYS = { FORECAST: 'forecast.json' } as const

export async function readForecast(kv: KVNamespace): Promise<ForecastRow[] | null> {
  const raw = await kv.get(KV_KEYS.FORECAST)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    const result = ForecastArraySchema.safeParse(parsed)
    if (!result.success) {
      console.warn('[kvStore:read] forecast schema invalid', result.error.flatten())
      return null
    }
    return result.data
  } catch (error) {
    console.error('[kvStore:read]', error)
    return null
  }
}

export async function writeForecast(kv: KVNamespace, body: string) {
  const parsed = JSON.parse(body)
  const result = ForecastArraySchema.safeParse(parsed)
  if (!result.success) {
    const issue = result.error.issues[0]
    const path = issue?.path?.length ? ` at ${issue.path.join('.')}` : ''
    const message = issue?.message ?? 'Invalid forecast JSON structure'
    throw new Error(`Invalid forecast JSON: ${message}${path}`)
  }

  await kv.put(KV_KEYS.FORECAST, body)
}
