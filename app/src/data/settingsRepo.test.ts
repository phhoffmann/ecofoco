import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDb = { query: vi.fn(), run: vi.fn() }
vi.mock('./db', () => ({ getDb: () => Promise.resolve(mockDb) }))

import { getNotificationsEnabled, getStepGoal, setNotificationsEnabled, setStepGoal } from './settingsRepo'

describe('settingsRepo', () => {
  beforeEach(() => {
    mockDb.query.mockReset()
    mockDb.run.mockReset()
  })

  it('getNotificationsEnabled defaults to false when unset', async () => {
    mockDb.query.mockResolvedValue({ values: [] })
    expect(await getNotificationsEnabled()).toBe(false)
  })

  it('getNotificationsEnabled reflects a stored "true" value', async () => {
    mockDb.query.mockResolvedValue({ values: [{ value: 'true' }] })
    expect(await getNotificationsEnabled()).toBe(true)
  })

  it('setNotificationsEnabled persists the value as a string', async () => {
    await setNotificationsEnabled(true)
    expect(mockDb.run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO settings'), [
      'notificationsEnabled',
      'true',
    ])
  })

  it('getStepGoal falls back to the default (6000) when unset', async () => {
    mockDb.query.mockResolvedValue({ values: [] })
    expect(await getStepGoal()).toBe(6000)
  })

  it('getStepGoal falls back to the default when the stored value is invalid', async () => {
    mockDb.query.mockResolvedValue({ values: [{ value: 'not-a-number' }] })
    expect(await getStepGoal()).toBe(6000)
  })

  it('getStepGoal reflects a valid stored value', async () => {
    mockDb.query.mockResolvedValue({ values: [{ value: '8000' }] })
    expect(await getStepGoal()).toBe(8000)
  })

  it('setStepGoal persists the value as a string', async () => {
    await setStepGoal(8000)
    expect(mockDb.run).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO settings'), ['stepGoal', '8000'])
  })
})
