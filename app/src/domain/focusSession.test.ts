import { describe, expect, it } from 'vitest'
import { computeRemainingSeconds } from './focusSession'

describe('computeRemainingSeconds', () => {
  it('returns the full duration when no time has elapsed', () => {
    expect(computeRemainingSeconds(1000, 60, 1000)).toBe(60)
  })

  it('subtracts elapsed whole seconds from the planned duration', () => {
    expect(computeRemainingSeconds(1000, 60, 1000 + 25_000)).toBe(35)
  })

  it('never goes below zero once the planned duration has passed', () => {
    expect(computeRemainingSeconds(1000, 60, 1000 + 90_000)).toBe(0)
  })
})
