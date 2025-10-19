# AuraGrid

AuraGrid is a carbon-aware scheduling toolkit that forecasts load, renewables, and carbon intensity, shifts flexible work into cleaner hours, and surfaces the avoided emissions through a Next.js dashboard and Cloudflare Worker API.

## Apps

- `apps/frontend` – Next.js App Router UI with Clerk auth, Recharts visuals, typed service hooks, and a Durable Object control panel.
- `apps/worker` – Cloudflare Worker (Hono) exposing `/api/forecast`, `/api/optimize`, `/api/insight`, and plan-management routes backed by KV, Durable Objects, Workers AI, and D1.
- `ml/` (planned) – Prophet script generates `data/forecast.json` that feeds the Worker.

## Development

```bash
npm install
npm run dev        # runs frontend + worker concurrently
npm run dev:fe     # runs only the Next.js app
npm run dev:worker # runs only the Cloudflare Worker
```

### Durable Object plan workflow

- `GET /api/plan` – Fetch the latest persisted plan payload (or `null` if nothing is stored).
- `POST /api/reoptimize` – Run the carbon-intensity heuristic, store the plan in the DO, and log metrics to D1.
- `POST /api/apply` – Apply a supplied plan after Turnstile verification.

For the hackathon demo, the dashboard sends the literal token `dev-placeholder` instead of a real Turnstile challenge. Swap in a production widget + secret when you are ready to go live.

### Optimization Strategy

- **Primary objective:** cut daily CO₂ intensity by moving discretionary work into the hours with the cleanest generation mix (typically solar-heavy mid-days in ERCOT).
- **Secondary guardrail:** respect grid peaks by capping how much load can be reallocated into any single hour—the planner never pushes target hours beyond their baseline + shift allowance.

Metrics reported by the Worker (peak reduction, renewable overlap, CO₂ avoided) reflect these two constraints.
