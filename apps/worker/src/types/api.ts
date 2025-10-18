export type ForecastRow = {
  ds: string;
  load_pred_mw: number;
  solar_mw?: number;
  wind_mw?: number;
};

export type OptimizeResponse = {
  base: number[];
  optimized: number[];
  renewable: number[];
  metrics: {
    peak_reduction_pct: number;
    renewable_gain_pct: number;
    co2_avoided_kg: number;
  };
};

export type InsightResponse = {
  summary: string;
  metrics: OptimizeResponse["metrics"];
};
