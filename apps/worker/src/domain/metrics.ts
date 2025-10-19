export function computeMetrics(
  base: number[],
  optimized: number[],
  renewable: number[],
  intensity?: number[],
  options?: {
    peakThresholdRatio?: number
  },
) {
  if (base.length === 0) {
    return { peak_reduction_pct: 0, renewable_gain_pct: 0, co2_avoided_kg: 0 }
  }

  const maxBase = Math.max(...base)
  const peakThresholdRatio = options?.peakThresholdRatio ?? 0.9
  const peakThreshold = peakThresholdRatio * maxBase

  const peakSum = base.reduce((sum, value) => sum + Math.max(value - peakThreshold, 0), 0)
  const peakSumOpt = optimized.reduce((sum, value) => sum + Math.max(value - peakThreshold, 0), 0)
  const peak_reduction_pct = peakSum ? ((peakSum - peakSumOpt) / peakSum) * 100 : 0

  const align = base.reduce((sum, value, index) => sum + Math.min(value, renewable[index] ?? 0), 0)
  const alignOpt = optimized.reduce((sum, value, index) => sum + Math.min(value, renewable[index] ?? 0), 0)
  const renewable_gain_pct = align ? ((alignOpt - align) / align) * 100 : 0

  let co2_avoided_kg = 0
  if (intensity && intensity.length === base.length) {
    const baselineCO2 = base.reduce((sum, load, index) => sum + load * intensity[index]!, 0)
    const optimizedCO2 = optimized.reduce(
      (sum, load, index) => sum + load * intensity[index]!,
      0,
    )
    co2_avoided_kg = Number((baselineCO2 - optimizedCO2).toFixed(2))
  } else {
    const carbonIntensityKgPerKWh = 0.4
    co2_avoided_kg = Math.max(0, alignOpt - align) * carbonIntensityKgPerKWh
  }

  return { peak_reduction_pct, renewable_gain_pct, co2_avoided_kg }
}
