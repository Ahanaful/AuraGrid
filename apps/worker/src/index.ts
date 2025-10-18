/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// apps/worker/src/index.ts
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { forecast } from './routes/forecast'
import { optimize } from './routes/optimize'
import { insight } from './routes/insight'

type Env = { auragrid_forecast: KVNamespace; AI: any }

const app = new Hono<{ Bindings: Env }>()

// Let middleware answer preflight; avoids the 204 call entirely
app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type'] }))

app.route('/', forecast)
app.route('/', optimize)
app.route('/', insight)

export default app

