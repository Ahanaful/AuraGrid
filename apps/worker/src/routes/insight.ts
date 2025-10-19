import { Hono } from 'hono'
import { summarize } from '../adapters/ai'

export const insight = new Hono<{ Bindings: { AI: any } }>()

insight.get('/api/insight', async (c) => {
  const requestUrl = new URL(c.req.url)
  const optimizeUrl = new URL('/api/optimize', requestUrl).toString()
  const response = await fetch(optimizeUrl)

  if (!response.ok) {
    return c.json({ summary: '', metrics: {} })
  }

  const optimization = (await response.json()) as { metrics?: any }
  if (!optimization.metrics) {
    return c.json({ summary: '', metrics: {} })
  }

  const result = await summarize(c.env.AI, optimization.metrics)
  return c.json(result)
})
