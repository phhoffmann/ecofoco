import { describe, expect, it } from 'vitest'
import { entriesInRange, isInRange, periodRange, shiftPeriod } from './period'
import type { CollectedEntry } from './types'

// Dates are built with the local-time Date constructor so these tests hold in any timezone.
const local = (y: number, m: number, d: number, h = 0, min = 0) => new Date(y, m - 1, d, h, min)

describe('periodRange', () => {
  it('day spans local midnight to the next local midnight', () => {
    expect(periodRange('day', local(2026, 10, 2, 15, 30))).toEqual({
      start: local(2026, 10, 2),
      end: local(2026, 10, 3),
    })
  })

  it('week starts on Sunday and lasts 7 days', () => {
    // 2026-10-02 is a Friday.
    expect(periodRange('week', local(2026, 10, 2, 9))).toEqual({
      start: local(2026, 9, 27),
      end: local(2026, 10, 4),
    })
  })

  it('a Sunday starts its own week', () => {
    expect(periodRange('week', local(2026, 10, 4, 23, 59)).start).toEqual(local(2026, 10, 4))
  })

  it('month spans the first of the month to the first of the next', () => {
    expect(periodRange('month', local(2026, 12, 31, 23))).toEqual({
      start: local(2026, 12, 1),
      end: local(2027, 1, 1),
    })
  })
})

describe('shiftPeriod', () => {
  it('moves days, weeks, and months back and forward', () => {
    const anchor = local(2026, 10, 2, 12)
    expect(shiftPeriod('day', anchor, -1)).toEqual(local(2026, 10, 1))
    expect(shiftPeriod('week', anchor, -1)).toEqual(local(2026, 9, 20))
    expect(shiftPeriod('week', anchor, 1)).toEqual(local(2026, 10, 4))
    expect(shiftPeriod('month', anchor, -1)).toEqual(local(2026, 9, 1))
  })

  it('does not skip short months when the anchor is late in the month', () => {
    expect(shiftPeriod('month', local(2026, 1, 31), 1)).toEqual(local(2026, 2, 1))
  })
})

describe('isInRange', () => {
  const range = periodRange('day', local(2026, 10, 2))

  it('includes the start and excludes the end', () => {
    expect(isInRange(local(2026, 10, 2), range)).toBe(true)
    expect(isInRange(local(2026, 10, 2, 23, 59), range)).toBe(true)
    expect(isInRange(local(2026, 10, 3), range)).toBe(false)
    expect(isInRange(local(2026, 10, 1, 23, 59), range)).toBe(false)
  })
})

describe('entriesInRange', () => {
  const entry = (id: string, at: Date): CollectedEntry => ({
    id,
    speciesId: 'ipe-amarelo',
    collectedAt: at.toISOString(),
    method: 'focus_session',
  })

  it('keeps only entries collected inside the period (by local time)', () => {
    const entries = [
      entry('before', local(2026, 9, 26, 23, 30)),
      entry('first', local(2026, 9, 27, 0, 0)),
      entry('mid', local(2026, 10, 1, 8)),
      entry('after', local(2026, 10, 4, 0, 0)),
    ]
    const result = entriesInRange(entries, periodRange('week', local(2026, 10, 2)))
    expect(result.map((e) => e.id)).toEqual(['first', 'mid'])
  })
})
