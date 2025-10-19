import { ForecastArraySchema } from '../lib/schema'
import type { ForecastRow } from '../types/api'

export const KV_KEYS = { FORECAST: 'forecast.json' } as const

export async function readForecast(kv: KVNamespace): Promise<ForecastRow[] | null> {
  const raw = await kv.get(KV_KEYS.FORECAST)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    const result = ForecastArraySchema.safeParse(parsed)
    if (!result.success) return null
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
    throw new Error('Invalid forecast JSON')
  }

  await kv.put(KV_KEYS.FORECAST, body)
}
