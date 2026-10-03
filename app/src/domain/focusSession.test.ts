import { describe, expect, it } from 'vitest'
import { computeRemainingSeconds, hasLeftTooLong, LEAVE_GRACE_MS } from './focusSession'

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

describe('hasLeftTooLong', () => {
  it('allows time in other apps up to the grace period', () => {
    expect(hasLeftTooLong(0)).toBe(false)
    expect(hasLeftTooLong(LEAVE_GRACE_MS)).toBe(false)
  })

  it('fails once the grace period is exceeded', () => {
    expect(hasLeftTooLong(LEAVE_GRACE_MS + 1)).toBe(true)
  })
})
