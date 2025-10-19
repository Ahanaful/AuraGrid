const DEFAULT_PEAK_THRESHOLD_RATIO = 0.9
const DEFAULT_MAX_SHIFT_RATIO = 0.05
const DEFAULT_BUDGET_RATIO = 0.4
const DEFAULT_MIN_INTENSITY_DELTA = 15 // kg CO₂/MWh

export interface CarbonAwareOptions {
  peakThresholdRatio?: number
  maxShiftRatio?: number
  budgetRatio?: number
  minIntensityDelta?: number
}

export function carbonAwareOptimize(
  base: number[],
  intensity: number[],
  options: CarbonAwareOptions = {},
) {
  if (base.length === 0) {
    return { optimized: [] as number[], shifts: 0 }
  }

  const {
    peakThresholdRatio = DEFAULT_PEAK_THRESHOLD_RATIO,
    maxShiftRatio = DEFAULT_MAX_SHIFT_RATIO,
    budgetRatio = DEFAULT_BUDGET_RATIO,
    minIntensityDelta = DEFAULT_MIN_INTENSITY_DELTA,
  } = options

  const maxLoad = Math.max(...base)
  const peakGuard = maxLoad * peakThresholdRatio
  const maxShiftPerHour = Math.max(10, Math.round(maxLoad * maxShiftRatio))
  let remainingBudget = Math.round(base.length * maxShiftPerHour * budgetRatio)

  const optimized = [...base]

  const sanitizedIntensity = intensity.map((value, index) => ({
    index,
    value: Number.isFinite(value) ? value : Infinity,
  }))

  const dirtyHours = sanitizedIntensity
    .filter((entry) => Number.isFinite(entry.value))
    .sort((a, b) => b.value - a.value)

  const cleanHours = [...dirtyHours].reverse()
  let shifts = 0

  for (const dirty of dirtyHours) {
    if (remainingBudget <= 0) break

    const currentIntensity = dirty.value
    if (!Number.isFinite(currentIntensity)) continue

    const dirtyIndex = dirty.index
    const available = Math.min(maxShiftPerHour, remainingBudget, optimized[dirtyIndex])
    if (available <= 0) continue

    const target = cleanHours.find(
      (candidate) =>
        candidate.index !== dirtyIndex &&
        Number.isFinite(candidate.value) &&
        currentIntensity - candidate.value >= minIntensityDelta,
    )

    if (!target) continue

    const targetIndex = target.index

    // Guardrail: do not push the destination hour much above its baseline + maxShiftPerHour
    const guardAllowance = Math.max(0, base[targetIndex] + maxShiftPerHour - optimized[targetIndex])
    if (guardAllowance <= 0) continue

    let transferable = Math.min(available, guardAllowance)
    if (optimized[targetIndex] + transferable > peakGuard) {
      const guardHeadroom = Math.max(0, peakGuard - optimized[targetIndex])
      transferable = Math.min(transferable, guardHeadroom)
    }
    if (transferable <= 0) continue

    optimized[dirtyIndex] -= transferable
    optimized[targetIndex] += transferable
    remainingBudget -= transferable
    shifts += transferable
  }

  return { optimized, shifts }
}
