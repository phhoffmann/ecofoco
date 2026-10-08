import type { MotionPreference } from '../domain/types'

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)'

let preference: MotionPreference = 'system'

function systemReducesMotion(): boolean {
  return window.matchMedia?.(REDUCE_QUERY).matches ?? false
}

// index.css and the motion-reduce: variant key off <html data-motion>, so the in-app setting can
// override the device setting in both directions.
function apply() {
  const reduce = preference === 'reduce' || (preference === 'system' && systemReducesMotion())
  document.documentElement.dataset.motion = reduce ? 'reduce' : 'full'
}

export function setMotionPreference(next: MotionPreference): void {
  preference = next
  apply()
}

export function isMotionReduced(): boolean {
  return document.documentElement.dataset.motion === 'reduce'
}

window.matchMedia?.(REDUCE_QUERY).addEventListener?.('change', apply)
apply()
