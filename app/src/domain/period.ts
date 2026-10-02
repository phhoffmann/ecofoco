import type { CollectedEntry } from './types'

// Time scopes for the garden view. All boundaries are in the device's local time.

export type GardenPeriod = 'day' | 'week' | 'month'

export const GARDEN_PERIODS: GardenPeriod[] = ['day', 'week', 'month']

/** Half-open range: start is included, end is excluded. */
export interface DateRange {
  start: Date
  end: Date
}

/** The day / week (Sunday-first) / month containing `anchor`. */
export function periodRange(period: GardenPeriod, anchor: Date): DateRange {
  const y = anchor.getFullYear()
  const m = anchor.getMonth()
  const d = anchor.getDate()
  switch (period) {
    case 'day':
      return { start: new Date(y, m, d), end: new Date(y, m, d + 1) }
    case 'week': {
      const weekStart = d - anchor.getDay()
      return { start: new Date(y, m, weekStart), end: new Date(y, m, weekStart + 7) }
    }
    case 'month':
      return { start: new Date(y, m, 1), end: new Date(y, m + 1, 1) }
  }
}

/** The start of the period `delta` steps away from the one containing `anchor`. */
export function shiftPeriod(period: GardenPeriod, anchor: Date, delta: number): Date {
  const { start } = periodRange(period, anchor)
  const y = start.getFullYear()
  const m = start.getMonth()
  const d = start.getDate()
  switch (period) {
    case 'day':
      return new Date(y, m, d + delta)
    case 'week':
      return new Date(y, m, d + delta * 7)
    case 'month':
      return new Date(y, m + delta, 1)
  }
}

export function isInRange(date: Date, range: DateRange): boolean {
  return date >= range.start && date < range.end
}

export function entriesInRange(entries: readonly CollectedEntry[], range: DateRange): CollectedEntry[] {
  return entries.filter((e) => isInRange(new Date(e.collectedAt), range))
}
