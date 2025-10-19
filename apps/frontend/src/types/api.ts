export type ForecastRow = {
  ds: string;
  load_pred_mw: number;
  solar_mw?: number;
  wind_mw?: number;
  renewable_share?: number;
  carbon_intensity_kg_per_mwh?: number;
};

export type OptimizeMetrics = {
  peak_reduction_pct: number;
  renewable_gain_pct: number;
  co2_avoided_kg: number;
};

export type OptimizeResponse = {
  base: number[];
  optimized: number[];
  renewable: number[];
  intensity?: number[];
  metrics: OptimizeMetrics;
  shifts?: number;
};

export type InsightResponse = {
  summary: string;
  metrics?: OptimizeMetrics;
};

export type PlanPayload = {
  version: number;
  plan: {
    base: number[];
    optimized: number[];
    renewable: number[];
  };
  metrics: OptimizeMetrics;
};

export type PlanResponse = PlanPayload | null;

export type ApplyPlanRequest = {
  payload: PlanPayload;
  tenant?: string;
};
