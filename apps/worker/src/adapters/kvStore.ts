import type { ForecastRow } from "../types/api";
import { ForecastArraySchema } from "../lib/schema";

export const KV_KEYS = { FORECAST: "forecast.json" } as const;

export async function readForecast(kv: "auragrid_forecast"): Promise<ForecastRow[] | null> {
  const raw = await kv.get(KV_KEYS.FORECAST);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  const res = ForecastArraySchema.safeParse(parsed);
  return res.success ? res.data : null;
}

export async function writeForecast(kv: "auragrid_forecast", body: string) {
  const parsed = JSON.parse(body);
  const res = ForecastArraySchema.safeParse(parsed);
  if (!res.success) throw new Error("Invalid forecast JSON");
  await kv.put(KV_KEYS.FORECAST, body);
}
