import { Hono } from "hono";
import { jsonError } from "@/lib/errors";
import { forecastPayloadSchema } from "@/lib/schema";
import { readForecast, writeForecast } from "@/adapters/kvStore";
import type { AuraContext } from "@/types/env";

export const forecastRoutes = new Hono<AuraContext>();

forecastRoutes.get("/api/forecast", async (c) => {
  try {
    const data = await readForecast(c.env.FORECAST_KV);
    if (!data) {
      return c.json([], 200);
    }

    const validated = forecastPayloadSchema.parse(data);
    return c.json(validated);
  } catch (error) {
    console.error("[forecast:get]", error);
    return jsonError(c, error);
  }
});

forecastRoutes.put("/api/forecast", async (c) => {
  try {
    const payload = await c.req.json();
    const parsed = forecastPayloadSchema.parse(payload);
    await writeForecast(c.env.FORECAST_KV, parsed);
    return c.json({ status: "ok", count: parsed.length });
  } catch (error) {
    console.error("[forecast:put]", error);
    return jsonError(c, error);
  }
});
