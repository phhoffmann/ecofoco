import { KeepAwake } from '@capacitor-community/keep-awake'

export async function keepScreenAwake(): Promise<void> {
  await KeepAwake.keepAwake()
}

export async function allowScreenSleep(): Promise<void> {
  await KeepAwake.allowSleep()
}
