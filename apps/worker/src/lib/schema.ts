import { z } from "zod";

export const forecastRowSchema = z.object({
  ds: z.string().datetime({ offset: true, message: "ds must be ISO8601 date" }),
  load_pred_mw: z.number().finite(),
  solar_mw: z.number().finite().optional(),
  wind_mw: z.number().finite().optional(),
});

export const forecastPayloadSchema = z.array(forecastRowSchema).min(1, "Forecast must contain at least one data point.");

export const optimizeMetricsSchema = z.object({
  peak_reduction_pct: z.number(),
  renewable_gain_pct: z.number(),
  co2_avoided_kg: z.number(),
});

export type ForecastRowInput = z.infer<typeof forecastRowSchema>;
export type ForecastPayloadInput = z.infer<typeof forecastPayloadSchema>;
