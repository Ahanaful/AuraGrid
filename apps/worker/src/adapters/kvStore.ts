import type { ForecastRow } from "@/types/api";

const KV_KEYS = {
  forecast: "forecast.json",
} as const;

export async function readForecast(kv: KVNamespace): Promise<ForecastRow[] | null> {
  const raw = await kv.get(KV_KEYS.forecast);
  return raw ? (JSON.parse(raw) as ForecastRow[]) : null;
}

export async function writeForecast(kv: KVNamespace, payload: ForecastRow[]) {
  await kv.put(KV_KEYS.forecast, JSON.stringify(payload));
}
