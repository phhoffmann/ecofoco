import { App } from '@capacitor/app'

export function onAppBackgrounded(callback: () => void): void {
  void App.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) callback()
  })
}
