// How the Sprout on the Focus screen grows during a FocusSession.

export type GrowthStage = 0 | 1 | 2 | 3

/** Session progress at which each stage starts: seedling, sapling, young plant, grown plant. */
export const STAGE_STARTS = [0, 0.25, 0.5, 0.8] as const

export function growthStage(progress: number): GrowthStage {
  for (let stage = STAGE_STARTS.length - 1; stage > 0; stage--) {
    if (progress >= STAGE_STARTS[stage]) return stage as GrowthStage
  }
  return 0
}

/** How far through its current stage the plant is, from 0 to 1. */
export function progressWithinStage(progress: number): number {
  const stage = growthStage(progress)
  const end = STAGE_STARTS[stage + 1] ?? 1
  return Math.min(1, Math.max(0, (progress - STAGE_STARTS[stage]) / (end - STAGE_STARTS[stage])))
}
