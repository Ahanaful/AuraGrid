import { z } from 'zod'

export const ForecastRowSchema = z.object({
  ds: z.string(),
  load_pred_mw: z.number(),
  solar_mw: z.number().optional(),
  wind_mw: z.number().optional(),
  renewable_share: z
    .number()
    .min(0)
    .max(1)
    .optional(),
  carbon_intensity_kg_per_mwh: z.number().nonnegative(),
})

export const ForecastArraySchema = z.array(ForecastRowSchema)
