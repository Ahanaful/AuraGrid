export type PlanSeries = {
  base: number[]
  renewable: number[]
  optimized: number[]
}

export type PlanMetrics = {
  peak_reduction_pct: number
  renewable_gain_pct: number
  co2_avoided_kg: number
}

export type PlanPayload = {
  version: number
  plan: PlanSeries
  metrics: PlanMetrics
}

export type RunTrigger = 'manual' | 'reoptimize' | 'cron' | 'cron-reoptimize' | 'alarm' | 'apply'

export type StoredPlan = {
  payload: PlanPayload
  forecastDigest?: string
  trigger?: RunTrigger
  updatedAt: number
  nextAlarmAt?: number
}
