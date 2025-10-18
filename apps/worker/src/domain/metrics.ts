export function computeMetrics(base: number[], optimized: number[], renewable: number[]) {
  const maxBase = Math.max(...base);
  const peakThreshold = 0.9 * maxBase;

  const peakSum = base.reduce((s,v)=> s + Math.max(v - peakThreshold, 0), 0);
  const peakSumOpt = optimized.reduce((s,v)=> s + Math.max(v - peakThreshold, 0), 0);
  const peak_reduction_pct = peakSum ? ((peakSum - peakSumOpt)/peakSum)*100 : 0;

  const align = base.reduce((s, v, i)=> s + Math.min(v, renewable[i] ?? 0), 0);
  const alignOpt = optimized.reduce((s, v, i)=> s + Math.min(v, renewable[i] ?? 0), 0);
  const renewable_gain_pct = align ? ((alignOpt - align)/align)*100 : 0;

  const carbonIntensityKgPerKWh = 0.4;
  const co2_avoided_kg = Math.max(0, (alignOpt - align)) * carbonIntensityKgPerKWh;

  return { peak_reduction_pct, renewable_gain_pct, co2_avoided_kg };
}
