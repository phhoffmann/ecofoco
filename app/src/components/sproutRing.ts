export const FULL_RING_SIZE = 288
const MIN_RING_SIZE = 168
/** Vertical space the Focus screen needs besides the ring: header, nav, timer, copy and controls. */
const FOCUS_CHROME_PX = 430

/** The Sprout ring size that keeps the Focus controls above the nav: full size on tall screens, smaller on short ones (360×640). */
export function sproutRingSize(viewportHeight: number): number {
  return Math.round(Math.min(FULL_RING_SIZE, Math.max(MIN_RING_SIZE, viewportHeight - FOCUS_CHROME_PX)))
}
