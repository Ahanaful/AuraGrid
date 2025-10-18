import { Hono } from 'hono'
import { readForecast, writeForecast } from '../adapters/kvStore'

export const forecast = new Hono<{ Bindings: { auragrid_forecast: KVNamespace } }>()

forecast.get('/api/forecast', async (c) => {
  const data = await readForecast(c.env.auragrid_forecast)
  return c.json(data ?? [])
})

forecast.put('/api/forecast', async (c) => {
  const body = await c.req.text()
  try {
    await writeForecast(c.env.auragrid_forecast, body)
    return c.text('ok')
  } catch (error) {
    console.error('[forecast:put]', error)
    const message = error instanceof Error ? error.message : 'Invalid JSON'
    return c.json({ error: message }, 400)
  }
})

forecast.get('/health', (c) => c.json({ ok: true }))
