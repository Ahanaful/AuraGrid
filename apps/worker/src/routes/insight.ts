import { Hono } from "hono";
import { jsonError } from "@/lib/errors";
import { forecastPayloadSchema } from "@/lib/schema";
import { readForecast } from "@/adapters/kvStore";
import { greedyOptimize } from "@/domain/optimize";
import { computeMetrics } from "@/domain/metrics";
import { generateInsight } from "@/adapters/ai";
import type { AuraContext } from "@/types/env";

export const insightRoutes = new Hono<AuraContext>();

insightRoutes.get("/api/insight", async (c) => {
  try {
    const stored = await readForecast(c.env.FORECAST_KV);
    if (!stored || stored.length === 0) {
      return c.json({ summary: "No forecast available. Upload data via PUT /api/forecast." });
    }

    const rows = forecastPayloadSchema.parse(stored);
    const base = rows.map((row) => row.load_pred_mw);
    const renewable = rows.map((row) => (row.solar_mw ?? 0) + (row.wind_mw ?? 0));

    const { optimized, shifts } = greedyOptimize(base, renewable);
    const metrics = computeMetrics(base, optimized, renewable);

    const horizonHours = rows.length;
    const summary = await generateInsight(c.env.AI, {
      metrics,
      horizonHours,
      shiftedMegawattHours: shifts ?? 0,
    });

    return c.json({ summary, metrics });
  } catch (error) {
    console.error("[insight:get]", error);
    return jsonError(c, error);
  }
});
