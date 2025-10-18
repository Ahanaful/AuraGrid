const PEAK_THRESHOLD_RATIO = 0.9
const MAX_SHIFT_RATIO = 0.05
const BUDGET_RATIO = 0.4

export function greedyOptimize(base: number[], renewable: number[]) {
  if (base.length === 0) {
    return [] as number[]
  }

  const maxLoad = Math.max(...base)
  const peakThreshold = maxLoad * PEAK_THRESHOLD_RATIO
  const maxShiftPerHour = Math.max(10, Math.round(maxLoad * MAX_SHIFT_RATIO))
  let remainingBudget = Math.round(base.length * maxShiftPerHour * BUDGET_RATIO)

  const optimized = [...base]

  const peaks = base
    .map((value, index) => ({ index, overload: Math.max(0, value - peakThreshold) }))
    .filter((entry) => entry.overload > 0)
    .sort((a, b) => b.overload - a.overload)
    .map((entry) => entry.index)

  const greenSlots = renewable
    .map((value, index) => ({ index, value }))
    .sort((a, b) => b.value - a.value)
    .map((entry) => entry.index)

  for (const peakIndex of peaks) {
    if (remainingBudget <= 0) break

    const shiftAmount = Math.min(maxShiftPerHour, remainingBudget, optimized[peakIndex])
    if (shiftAmount <= 0) continue

    optimized[peakIndex] -= shiftAmount
    const targetIndex = nextGreenSlot(greenSlots, optimized, renewable, peakIndex)
    optimized[targetIndex] += shiftAmount

    remainingBudget -= shiftAmount
  }

  return optimized
}

function nextGreenSlot(
  candidates: number[],
  optimized: number[],
  renewable: number[],
  fallback: number,
) {
  while (candidates.length) {
    const index = candidates.shift()
    if (index === undefined) break
    if ((renewable[index] ?? 0) >= (optimized[index] ?? 0)) {
      return index
    }
  }

  return fallback
}
