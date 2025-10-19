export type PlanPayload = {
  version: number
  plan: { optimized: number[]; renewable: number[]; base: number[] }
  metrics: { peak_reduction_pct: number; renewable_gain_pct: number; co2_avoided_kg: number }
}

export class SchedulerDO {
  state: DurableObjectState
  storage: DurableObjectStorage

  constructor(state: DurableObjectState) {
    this.state = state
    this.storage = state.storage
  }

  async fetch(req: Request) {
    const url = new URL(req.url)
    if (req.method === 'GET' && url.pathname === '/plan') {
      const value = await this.storage.get<PlanPayload>('plan')
      return Response.json(value ?? null)
    }

    if (req.method === 'POST' && url.pathname === '/apply') {
      const body = (await req.json()) as PlanPayload
      // simple version check to prevent overwrites
      const current = await this.storage.get<PlanPayload>('plan')
      if (current && body.version <= current.version) {
        return new Response('stale version', { status: 409 })
      }
      await this.storage.put('plan', body)
      return Response.json({ ok: true, version: body.version })
    }

    return new Response('Not found', { status: 404 })
  }
}
