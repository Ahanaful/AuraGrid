# AuraGrid Worker

Cloudflare Worker powered by Hono. Serves forecasting data, runs the greedy optimization heuristic, and generates AI insights via Workers AI.

## Scripts

```bash
npm install
npm run dev
npm run deploy
```

## Environment

Configure bindings in `wrangler.toml`:

- `FORECAST_KV` – Cloudflare KV namespace storing the latest `forecast.json` upload.
- `AI` – Workers AI binding for Llama 3.1 Instruct.

## Source Structure

- `src/routes` – Hono route handlers for `/api/forecast`, `/api/optimize`, `/api/insight`.
- `src/domain` – pure optimization + metrics logic.
- `src/adapters` – Cloudflare bindings (KV + AI).
- `src/lib` – validation schema + error helpers.
- `src/types` – shared API contracts and Env bindings.
