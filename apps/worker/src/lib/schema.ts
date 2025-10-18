import { z } from "zod";

export const ForecastRowSchema = z.object({
  ds: z.string(),
  load_pred_mw: z.number(),
  solar_mw: z.number().optional(),
  wind_mw: z.number().optional(),
});

export const ForecastArraySchema = z.array(ForecastRowSchema);
