# ⚡ AuraGrid

**AuraGrid** is a carbon-aware scheduling co-pilot for data centers.
It forecasts hourly load and carbon intensity, shifts flexible workloads into cleaner windows, persists low-carbon plans, and explains the impact — all on **Cloudflare’s edge**.

---

## 🌟 Highlights

* **Forecast** – Prophet ingests historic ERCOT load + renewable data, producing 48-hour demand and carbon-intensity projections.
* **Optimize** – A guardrailed heuristic reallocates discretionary MW into greener hours while respecting peak constraints and shift budgets.
* **Persist** – Cloudflare Durable Objects store versioned plans; D1 logs every reoptimization and apply event.
* **Explain** – Cloudflare Workers AI (with deterministic fallback) summarizes CO₂ savings and peak compliance in plain language.
* **Visualize** – A Next.js dashboard combines baseline vs optimized load, renewables, carbon intensity, and active plan telemetry in a dual-axis chart.

---

## 🧰 Tech Stack

| **Layer**    | **Tooling**                                         | **Purpose**                                   |
| ------------ | --------------------------------------------------- | --------------------------------------------- |
| **Frontend** | Next.js (App Router), Tailwind, shadcn/ui, Recharts | Dashboard UX and marketing site               |
| **Backend**  | Cloudflare Workers + Hono                           | Edge APIs (forecast, optimize, plan, insight) |
| **State**    | Durable Objects + Cloudflare D1                     | Persisted plan versions and audit logs        |
| **Storage**  | Cloudflare KV                                       | Fast 48-hour forecast JSON                    |
| **AI**       | Cloudflare Workers AI (Llama 3.1 8B)                | Insight summaries with metrics-based fallback |
| **ML**       | Python Prophet                                      | Load & carbon-intensity forecasting           |
| **Auth**     | Clerk                                               | (Optional) dashboard authentication           |
| **Deploy**   | Wrangler                                            | Serverless deployments and KV uploads         |

---

## 📁 Repository Structure

```
.
├── apps/
│   ├── frontend/              # Next.js app (dashboard + marketing)
│   └── worker/                # Cloudflare Worker (edge APIs, Durable Object)
├── ml/
│   └── src/make_forecast.py   # Prophet script → data/forecast.json
├── data/
│   ├── ercot_load_for_hr_2025_october.csv
│   ├── renewable_energy_data_2025_october.csv
│   └── forecast.json          # Latest dataset (uploaded to KV)
└── README.md
```

---

## 🚀 Getting Started

### **Prerequisites**

* Node.js 20+
* npm 10+
* Python 3.11+
* Cloudflare account with Workers, KV, Durable Objects, Workers AI access
* (Optional) Clerk account for authentication

---

### **Install Dependencies**

```bash
npm install
```

---

### **Environment Variables**

Create `apps/frontend/.env.local`:

```bash
NEXT_PUBLIC_WORKER_BASE_URL=https://<your-worker-url>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<optional>
CLERK_SECRET_KEY=<optional>
```

Set Cloudflare bindings (`apps/worker/wrangler.toml`):

* KV namespace: `auragrid_forecast`
* Durable Object: `SchedulerDO`
* D1 database: `auragrid-db`
* Workers AI binding: `AI`

---

### **Running Locally**

Run frontend & worker (worker uses remote dev tunnel):

```bash
npm run dev
```

Or run them separately:

```bash
npm run dev:fe
npm run dev:worker   # requires `npx wrangler login`
```

If network access is blocked, use local Worker dev mode:

```bash
npx wrangler dev --config apps/worker/wrangler.toml
```

---

## 🔄 Forecast Workflow

1. **Generate the dataset:**

   ```bash
   python ml/src/make_forecast.py
   ```

2. **Push to KV:**

   ```bash
   npx wrangler kv:key put forecast.json \
     --binding auragrid_forecast \
     --path data/forecast.json \
     --config apps/worker/wrangler.toml \
     --env prod \
     --remote \
     --preview false
   ```

3. **Trigger reoptimization**
   From the dashboard or via API:

   ```bash
   curl https://<worker-url>/api/reoptimize
   ```

---

## 🧪 Worker Testing & Deployment

### **Redeploy Worker**

```bash
npx wrangler deploy --config apps/worker/wrangler.toml --env prod
```

### **Verify APIs**

```bash
curl https://<worker-url>/api/forecast
curl https://<worker-url>/api/optimize
curl https://<worker-url>/api/plan
curl https://<worker-url>/api/insight
```

---

## ⚙️ Known Constraints

* **Primary metric**: Peak reduction & renewable KPIs are hidden in the UI; **CO₂ avoided** is emphasized for accuracy under strict guardrails.
* **AI dependency**: Insight API requires Workers AI access, but deterministic fallbacks keep it functional.
* **Auth gating**: Dashboard and marketing site use Clerk; can be disabled for public demos.
* **Offline dev**: Remote Wrangler dev requires login; local testing may need mocks.

---

## 🗺️ Roadmap

* [ ] **User-specific tenancy** – Tie plan storage to Clerk `userId` instead of demo tenant
* [ ] **Historical analytics** – Surface CO₂ savings trends and plan history from D1
* [ ] **Adaptive guardrails** – Allow per-tenant shift budgets and add regression tests
* [ ] **Integration hooks** – Webhooks or APIs to push optimized schedules into orchestration systems (Kubernetes, Slurm)
* [ ] **Live data feeds** – Replace static ERCOT CSVs with real-time carbon-intensity APIs

---
