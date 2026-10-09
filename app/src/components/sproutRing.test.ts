import { describe, expect, it } from 'vitest'
import { FULL_RING_SIZE, sproutRingSize } from './sproutRing'

describe('sproutRingSize', () => {
  it('keeps the full ring on tall screens', () => {
    expect(sproutRingSize(900)).toBe(FULL_RING_SIZE)
    expect(sproutRingSize(2000)).toBe(FULL_RING_SIZE)
  })

  it('shrinks the ring on a 360×640 phone so the duration buttons stay above the nav', () => {
    // At 640px the Focus screen's other content needs about 430px.
    expect(sproutRingSize(640)).toBeLessThanOrEqual(640 - 430)
    expect(sproutRingSize(640)).toBeLessThan(FULL_RING_SIZE)
  })

  it('never shrinks the ring below a legible size', () => {
    expect(sproutRingSize(300)).toBe(168)
  })
})
