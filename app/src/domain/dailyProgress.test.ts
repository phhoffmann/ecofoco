import { describe, expect, it } from 'vitest'
import { canDraw } from './dailyProgress'
import type { DailyProgress } from './types'

const base: DailyProgress = { date: '2026-09-10', steps: 0, goalMet: false, drawCompleted: false }

describe('canDraw', () => {
  it('is false when the goal has not been met', () => {
    expect(canDraw({ ...base, goalMet: false, drawCompleted: false })).toBe(false)
  })

  it('is false when the draw was already completed today, even if the goal is met', () => {
    expect(canDraw({ ...base, goalMet: true, drawCompleted: true })).toBe(false)
  })

  it('is true when the goal is met and the draw has not happened yet', () => {
    expect(canDraw({ ...base, goalMet: true, drawCompleted: false })).toBe(true)
  })
})
