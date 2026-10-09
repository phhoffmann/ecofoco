import { describe, expect, it, vi } from 'vitest'

vi.mock('@capacitor-community/sqlite', () => ({ CapacitorSQLite: {}, SQLiteConnection: class {} }))
vi.mock('jeep-sqlite/loader', () => ({ defineCustomElements: vi.fn() }))

import { createWebStoreElement } from './db'

describe('web store', () => {
  it('saves every write to IndexedDB, so a reload keeps it', () => {
    const el = createWebStoreElement()
    expect(el.tagName.toLowerCase()).toBe('jeep-sqlite')
    // jeep-sqlite reads its autoSave prop from the lowercase `autosave` attribute.
    expect(el.getAttribute('autosave')).toBe('true')
  })
})
