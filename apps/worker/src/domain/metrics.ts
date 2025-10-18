import type { OptimizeMetrics } from "@/types/api";

interface MetricOptions {
  carbonIntensityKgPerMwh?: number;
}

const DEFAULTS: Required<MetricOptions> = {
  carbonIntensityKgPerMwh: 400,
};

export function computeMetrics(
  base: number[],
  optimized: number[],
  renewable: number[],
  options: MetricOptions = {},
): OptimizeMetrics {
  if (!base.length) {
    return {
      peak_reduction_pct: 0,
      renewable_gain_pct: 0,
      co2_avoided_kg: 0,
    };
  }

  const { carbonIntensityKgPerMwh } = { ...DEFAULTS, ...options };
  const threshold = Math.max(...base) * 0.9;

  const peakOverage = base.reduce((total, value) => total + Math.max(0, value - threshold), 0);
  const optimizedOverage = optimized.reduce(
    (total, value) => total + Math.max(0, value - threshold),
    0,
  );

  const baselineRenewableAlignment = aggregateOverlap(base, renewable);
  const optimizedRenewableAlignment = aggregateOverlap(optimized, renewable);

  const peakReduction = peakOverage === 0 ? 0 : ((peakOverage - optimizedOverage) / peakOverage) * 100;
  const renewableGain = baselineRenewableAlignment === 0
    ? 0
    : ((optimizedRenewableAlignment - baselineRenewableAlignment) / baselineRenewableAlignment) * 100;

  const co2Avoided = Math.max(0, optimizedRenewableAlignment - baselineRenewableAlignment) * carbonIntensityKgPerMwh;

  return {
    peak_reduction_pct: Number(peakReduction.toFixed(2)),
    renewable_gain_pct: Number(renewableGain.toFixed(2)),
    co2_avoided_kg: Number(co2Avoided.toFixed(2)),
  };
}

function aggregateOverlap(load: number[], renewable: number[]) {
  return load.reduce((total, value, index) => {
    const available = renewable[index] ?? 0;
    return total + Math.min(value, available);
  }, 0);
}
