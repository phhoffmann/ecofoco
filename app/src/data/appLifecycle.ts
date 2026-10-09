import { App } from '@capacitor/app'
import { Capacitor, registerPlugin } from '@capacitor/core'

// Local native plugin in app/android (AwayTrackerPlugin.kt).
interface AwayTrackerPlugin {
  getOtherAppTime(): Promise<{ otherAppMs: number }>
  isScreenInUse(): Promise<{ inUse: boolean }>
}

const AwayTracker = registerPlugin<AwayTrackerPlugin>('AwayTracker')

/** Calls back whenever the app moves to or from the background; returns a function that stops listening. */
export function onAppStateChange(callback: (isActive: boolean) => void): () => void {
  const listener = App.addListener('appStateChange', ({ isActive }) => callback(isActive))
  return () => void listener.then((l) => l.remove())
}

/** Whether this build can tell the screen turning off or locking apart from switching apps. */
export function canTellScreenOffFromAppSwitch(): boolean {
  return Capacitor.isPluginAvailable('AwayTracker')
}

/**
 * Time spent in other apps, screen on and unlocked, during the current background period —
 * or the latest one, once back in the app. Screen-off and lock-screen time never count.
 */
export async function timeInOtherAppsMs(): Promise<number> {
  const { otherAppMs } = await AwayTracker.getOtherAppTime()
  return otherAppMs
}

/** Whether the screen is on and unlocked right now. */
export async function isScreenInUse(): Promise<boolean> {
  const { inUse } = await AwayTracker.isScreenInUse()
  return inUse
}
