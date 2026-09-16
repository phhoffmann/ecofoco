import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDb = { query: vi.fn(), run: vi.fn() }
vi.mock('./db', () => ({ getDb: () => Promise.resolve(mockDb) }))

import { recordFocusSession } from './focusSessionRepo'

describe('focusSessionRepo', () => {
  beforeEach(() => {
    mockDb.query.mockReset()
    mockDb.run.mockReset()
  })

  it('records a completed session with the given start time and duration', async () => {
    const startedAt = '2026-09-10T10:00:00.000Z'

    const session = await recordFocusSession(startedAt, 900, 'completed')

    expect(session).toMatchObject({ startedAt, plannedDurationSeconds: 900, status: 'completed' })
    expect(mockDb.run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO focus_sessions'), [
      session.id,
      startedAt,
      session.endedAt,
      900,
      'completed',
    ])
  })

  it('records a failed session the same way, without collecting anything', async () => {
    const session = await recordFocusSession('2026-09-10T10:00:00.000Z', 900, 'failed')
    expect(session.status).toBe('failed')
  })
})
