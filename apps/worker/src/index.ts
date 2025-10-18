import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { forecast } from './routes/forecast'
import { optimize } from './routes/optimize'
import { insight } from './routes/insight'
import type { Ai } from '@cloudflare/workers-types'

type Env = { auragrid_forecast: KVNamespace; AI: Ai }

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type'] }))

app.route('/', forecast)
app.route('/', optimize)
app.route('/', insight)

export default app
