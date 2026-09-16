import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDb = { query: vi.fn(), run: vi.fn() }
vi.mock('./db', () => ({ getDb: () => Promise.resolve(mockDb) }))

import { addCollectedEntry, listCollectedEntries } from './collectionRepo'

describe('collectionRepo', () => {
  beforeEach(() => {
    mockDb.query.mockReset()
    mockDb.run.mockReset()
  })

  it('listCollectedEntries returns rows from the database', async () => {
    const rows = [{ id: '1', speciesId: 'jatoba', collectedAt: '2026-01-01T00:00:00.000Z', method: 'draw' }]
    mockDb.query.mockResolvedValue({ values: rows })

    const result = await listCollectedEntries()

    expect(result).toEqual(rows)
    expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM collected_entries ORDER BY collectedAt DESC')
  })

  it('listCollectedEntries returns an empty array when there are no rows', async () => {
    mockDb.query.mockResolvedValue({ values: undefined })
    expect(await listCollectedEntries()).toEqual([])
  })

  it('addCollectedEntry inserts a new entry and returns it', async () => {
    mockDb.run.mockResolvedValue(undefined)

    const entry = await addCollectedEntry('jatoba', 'focus_session')

    expect(entry.speciesId).toBe('jatoba')
    expect(entry.method).toBe('focus_session')
    expect(entry.id).toEqual(expect.any(String))
    expect(() => new Date(entry.collectedAt).toISOString()).not.toThrow()

    expect(mockDb.run).toHaveBeenCalledWith(
      'INSERT INTO collected_entries (id, speciesId, collectedAt, method) VALUES (?, ?, ?, ?)',
      [entry.id, 'jatoba', entry.collectedAt, 'focus_session'],
    )
  })
})
