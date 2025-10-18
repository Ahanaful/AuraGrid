import type { Ai } from "@cloudflare/workers-types";
import type { OptimizeMetrics } from "@/types/api";

const MODEL = "@cf/meta/llama-3.1-8b-instruct";

interface InsightParams {
  metrics: OptimizeMetrics;
  horizonHours: number;
  shiftedMegawattHours: number;
}

export async function generateInsight(ai: Ai, params: InsightParams) {
  const { metrics, horizonHours, shiftedMegawattHours } = params;

  const prompt = `You are an energy analyst advising a data center operator. Summarize why the optimization matters in two concise sentences. Include when to shift load and the emissions reduction. Metrics: peak reduction ${metrics.peak_reduction_pct.toFixed(1)} percent, renewable gain ${metrics.renewable_gain_pct.toFixed(1)} percent, CO2 avoided ${metrics.co2_avoided_kg.toFixed(1)} kg per day. Horizon ${horizonHours} hours, shifted ${shiftedMegawattHours.toFixed(1)} MWh.`;

  const response = await ai.run(MODEL, {
    prompt,
    max_tokens: 180,
    temperature: 0.6,
  });

  if (!response || typeof response !== "object" || !("response" in response)) {
    throw new Error("Workers AI returned an unexpected payload");
  }

  return (response as { response: string }).response.trim();
}
