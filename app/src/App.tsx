import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CelebrationOverlay } from './components/CelebrationOverlay'
import { ActivityScreen } from './screens/ActivityScreen'
import { CollectionScreen } from './screens/CollectionScreen'
import { FocusScreen } from './screens/FocusScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useSettingsStore } from './stores/settingsStore'

const TABS = ['focus', 'activity', 'collection', 'settings'] as const
type Tab = (typeof TABS)[number]

function App() {
  const [tab, setTab] = useState<Tab>('focus')
  const { t } = useTranslation()
  const loadSettings = useSettingsStore((s) => s.load)

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  // The shell is exactly one viewport tall and only <main> scrolls, so the nav never leaves the screen.
  return (
    <div className="flex h-svh flex-col overflow-hidden bg-emerald-950 text-emerald-50">
      <header className="shrink-0 px-6 pt-[calc(1.5rem+var(--safe-top))] pb-2 text-center text-xl font-medium">
        EcoFoco
      </header>

      <main key={tab} className="enter flex min-h-0 flex-1 flex-col overflow-y-auto">
        {tab === 'focus' && <FocusScreen />}
        {tab === 'activity' && <ActivityScreen />}
        {tab === 'collection' && <CollectionScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </main>

      <nav className="flex shrink-0 border-t border-emerald-800 bg-emerald-950 pb-[var(--safe-bottom)]">
        {TABS.map((id) => (
          <button
            key={id}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => setTab(id)}
            className={`press relative flex-1 py-4 text-sm font-medium ${tab === id ? 'text-emerald-50' : 'text-emerald-500'}`}
          >
            {t(`nav.${id}`)}
            <span
              aria-hidden
              className={`absolute inset-x-6 top-0 h-0.5 rounded-full bg-emerald-400 transition-opacity duration-200 ${
                tab === id ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </button>
        ))}
      </nav>

      <CelebrationOverlay />
    </div>
  )
}

export default App
