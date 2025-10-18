import { Hono } from "hono";
import { jsonError } from "@/lib/errors";
import { forecastPayloadSchema } from "@/lib/schema";
import { readForecast } from "@/adapters/kvStore";
import { greedyOptimize } from "@/domain/optimize";
import { computeMetrics } from "@/domain/metrics";
import type { AuraContext } from "@/types/env";

export const optimizeRoutes = new Hono<AuraContext>();

optimizeRoutes.get("/api/optimize", async (c) => {
  try {
    const raw = await readForecast(c.env.FORECAST_KV);
    if (!raw || raw.length === 0) {
      return c.json({ base: [], optimized: [], renewable: [], metrics: { peak_reduction_pct: 0, renewable_gain_pct: 0, co2_avoided_kg: 0 } });
    }

    const rows = forecastPayloadSchema.parse(raw);
    const base = rows.map((row) => row.load_pred_mw);
    const renewable = rows.map((row) => (row.solar_mw ?? 0) + (row.wind_mw ?? 0));
    const { optimized, shifts } = greedyOptimize(base, renewable);
    const metrics = computeMetrics(base, optimized, renewable);

    return c.json({ base, optimized, renewable, metrics, shifts });
  } catch (error) {
    console.error("[optimize:get]", error);
    return jsonError(c, error);
  }
});
