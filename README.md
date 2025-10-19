# AuraGrid

AuraGrid is a carbon-aware scheduling toolkit that forecasts load, runs a greedy optimization, and surfaces insights through a Next.js dashboard and Cloudflare Worker API.

## Apps

- `apps/frontend` – Next.js App Router UI with Clerk auth, Recharts visuals, and typed service hooks.
- `apps/worker` – Cloudflare Worker (Hono) exposing `/api/forecast`, `/api/optimize`, and `/api/insight` backed by KV + Workers AI.
- `ml/` (planned) – Prophet script will generate `data/forecast.json` that feeds the Worker.

## Development

```bash
npm install
npm run dev        # runs frontend + worker concurrently
npm run dev:fe     # runs only the Next.js app
npm run dev:worker # runs only the Cloudflare Worker
```

To seed data, upload a Prophet-generated JSON via `PUT /api/forecast`. The dashboard fetches the worker endpoints directly.

## Repository Layout

```
apps/
  frontend/
    src/
      app/             # marketing, auth, dashboard routes
      components/      # ui primitives, charts, auth wrappers
      hooks/           # data-fetch + state helpers
      lib/             # env + formatting utilities
      services/        # worker API client
      types/           # shared DTOs
  worker/
    src/
      routes/          # Hono route handlers
      domain/          # optimization + metric logic
      adapters/        # KV + AI integrations
      lib/             # schema + error helpers
      types/           # shared contracts + env bindings
```

Set `FORECAST_KV` and `AI` bindings in Wrangler before deploying.
