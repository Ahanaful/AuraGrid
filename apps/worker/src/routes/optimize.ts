import { Hono } from "hono";
import { readForecast } from "../adapters/kvStore";
import { greedyOptimize } from "../domain/optimize";
import { computeMetrics } from "../domain/metrics";

export const optimize = new Hono<{ Bindings: { auragrid_forecast: KVNamespace } }>();

optimize.get("/api/optimize", async (c) => {
  const rows = await readForecast(c.env.auragrid_forecast);
  if (!rows || rows.length === 0)
    return c.json({ base:[], optimized:[], renewable:[], metrics:{} });

  const base = rows.map(r => r.load_pred_mw);
  const renewable = rows.map(r => (r.solar_mw ?? 0) + (r.wind_mw ?? 0));
  const optimized = greedyOptimize(base, renewable);
  const metrics = computeMetrics(base, optimized, renewable);

  return c.json({ base, optimized, renewable, metrics });
});
