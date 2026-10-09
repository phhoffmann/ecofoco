import { afterEach, describe, expect, it, vi } from 'vitest'

function stubSystemReduce(reduce: boolean) {
  const listeners: Array<() => void> = []
  const query = { matches: reduce, addEventListener: (_: string, l: () => void) => listeners.push(l) }
  vi.stubGlobal('matchMedia', () => query)
  return {
    change(next: boolean) {
      query.matches = next
      for (const l of listeners) l()
    },
  }
}

async function loadMotion() {
  vi.resetModules()
  return import('./motion')
}

describe('motion preference', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    delete document.documentElement.dataset.motion
  })

  it('follows the device setting by default, including later changes', async () => {
    const system = stubSystemReduce(true)
    const { isMotionReduced } = await loadMotion()
    expect(isMotionReduced()).toBe(true)

    system.change(false)
    expect(isMotionReduced()).toBe(false)
  })

  it('lets the in-app setting override the device in either direction', async () => {
    const system = stubSystemReduce(true)
    const { isMotionReduced, setMotionPreference } = await loadMotion()

    setMotionPreference('full')
    expect(document.documentElement.dataset.motion).toBe('full')
    system.change(true)
    expect(isMotionReduced()).toBe(false)

    system.change(false)
    setMotionPreference('reduce')
    expect(isMotionReduced()).toBe(true)
  })
})
