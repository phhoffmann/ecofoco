import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

/** A light tap on native devices; a no-op on the web or where there is no vibrator. */
export async function lightHaptic(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return
  try {
    await Haptics.impact({ style: ImpactStyle.Light })
  } catch {
    // Haptics are a nicety; never let them break collecting.
  }
}
