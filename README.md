# AuraGrid

AuraGrid is a carbon-aware scheduling toolkit that forecasts load, runs a greedy optimization, and surfaces insights through a Next.js dashboard and Cloudflare Worker API.

## Apps

- `apps/frontend` – Next.js App Router UI with Clerk auth, Recharts visuals, and typed service hooks.
- `apps/worker` – Cloudflare Worker (Hono) exposing `/api/forecast`, `/api/optimize`, and `/api/insight` backed by KV + Workers AI.
- `ml/` (planned) – Prophet script generates `data/forecast.json` that feeds the Worker.

## Development

```bash
npm install
npm run dev        # runs frontend + worker concurrently
npm run dev:fe     # runs only the Next.js app
npm run dev:worker # runs only the Cloudflare Worker
```
