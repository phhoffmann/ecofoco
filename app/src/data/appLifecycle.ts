import { App } from '@capacitor/app'
import { Capacitor, registerPlugin } from '@capacitor/core'

// Local native plugin in app/android (AwayTrackerPlugin.kt).
interface AwayTrackerPlugin {
  getOtherAppTime(): Promise<{ otherAppMs: number }>
}

const AwayTracker = registerPlugin<AwayTrackerPlugin>('AwayTracker')

export function onAppStateChange(callback: (isActive: boolean) => void): void {
  void App.addListener('appStateChange', ({ isActive }) => callback(isActive))
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
