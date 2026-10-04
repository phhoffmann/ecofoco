import { describe, expect, it } from 'vitest'
import { growthStage, progressWithinStage } from './growth'

describe('growthStage', () => {
  it('moves through four stages as the session progresses', () => {
    expect([0, 0.2, 0.25, 0.49, 0.5, 0.79, 0.8, 1].map(growthStage)).toEqual([0, 0, 1, 1, 2, 2, 3, 3])
  })
})

describe('progressWithinStage', () => {
  it('restarts at each stage and reaches 1 at the end of the session', () => {
    expect(progressWithinStage(0)).toBe(0)
    expect(progressWithinStage(0.125)).toBeCloseTo(0.5)
    expect(progressWithinStage(0.5)).toBe(0)
    expect(progressWithinStage(0.9)).toBeCloseTo(0.5)
    expect(progressWithinStage(1)).toBe(1)
  })
})
