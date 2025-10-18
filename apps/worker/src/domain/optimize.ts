export interface OptimizeOptions {
  peakThresholdRatio?: number;
  maxShiftRatio?: number;
  budgetRatio?: number;
}

const DEFAULT_OPTIONS: Required<OptimizeOptions> = {
  peakThresholdRatio: 0.9,
  maxShiftRatio: 0.05,
  budgetRatio: 0.4,
};

export function greedyOptimize(
  base: number[],
  renewable: number[],
  options: OptimizeOptions = {},
) {
  if (!base.length) {
    return { optimized: [], shifts: 0 } as const;
  }

  const { peakThresholdRatio, maxShiftRatio, budgetRatio } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const maxLoad = Math.max(...base);
  const peakThreshold = maxLoad * peakThresholdRatio;
  const maxShiftPerHour = Math.max(10, Math.round(maxLoad * maxShiftRatio));
  let remainingBudget = Math.round(base.length * maxShiftPerHour * budgetRatio);

  const optimized = [...base];

  const peaks = base
    .map((value, index) => ({ index, overload: Math.max(0, value - peakThreshold) }))
    .filter((entry) => entry.overload > 0)
    .sort((a, b) => b.overload - a.overload)
    .map((entry) => entry.index);

  const greenHours = renewable
    .map((value, index) => ({ index, value }))
    .sort((a, b) => b.value - a.value)
    .map((entry) => entry.index);

  let shifts = 0;

  for (const peakIndex of peaks) {
    if (remainingBudget <= 0) break;

    const shiftAmount = Math.min(maxShiftPerHour, remainingBudget, optimized[peakIndex]);
    if (shiftAmount <= 0) continue;

    optimized[peakIndex] -= shiftAmount;
    const targetIndex = nextGreenSlot(greenHours, optimized, renewable, peakIndex);
    optimized[targetIndex] += shiftAmount;

    remainingBudget -= shiftAmount;
    shifts += shiftAmount;
  }

  return { optimized, shifts } as const;
}

function nextGreenSlot(
  candidates: number[],
  optimized: number[],
  renewable: number[],
  fallback: number,
) {
  while (candidates.length) {
    const index = candidates.shift();
    if (index === undefined) break;
    if ((renewable[index] ?? 0) >= (optimized[index] ?? 0)) {
      return index;
    }
  }

  return fallback;
}
