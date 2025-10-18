export function greedyOptimize(base: number[], renewable: number[]) {
  const optimized = [...base];
  const max = Math.max(...base);
  const peakThreshold = 0.9 * max;
  const maxShiftPerHour = Math.max(10, Math.round(max * 0.05));
  let budget = Math.round(base.length * 0.4);

  const peaks = base
    .map((v,i)=>({i, over: Math.max(v - peakThreshold, 0)}))
    .filter(x=>x.over>0)
    .sort((a,b)=>b.over - a.over)
    .map(x=>x.i);

  const greens = renewable
    .map((v,i)=>({i,v}))
    .sort((a,b)=>b.v - a.v)
    .map(x=>x.i);

  for (const from of peaks) {
    if (budget <= 0) break;
    const to = greens.shift();
    if (to === undefined) break;
    const can = Math.min(maxShiftPerHour, budget);
    optimized[from] = Math.max(0, optimized[from] - can);
    optimized[to] = optimized[to] + can;
    budget -= can;
  }
  return optimized;
}
