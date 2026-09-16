import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityScreen } from './screens/ActivityScreen'
import { CollectionScreen } from './screens/CollectionScreen'
import { FocusScreen } from './screens/FocusScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useSettingsStore } from './stores/settingsStore'

type Tab = 'focus' | 'activity' | 'collection' | 'settings'

function App() {
  const [tab, setTab] = useState<Tab>('focus')
  const { t } = useTranslation()
  const loadSettings = useSettingsStore((s) => s.load)

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  return (
    <div className="flex min-h-svh flex-col bg-emerald-950 text-emerald-50">
      <header className="px-6 pt-6 pb-2 text-center text-xl font-medium">EcoFoco</header>

      {tab === 'focus' && <FocusScreen />}
      {tab === 'activity' && <ActivityScreen />}
      {tab === 'collection' && <CollectionScreen />}
      {tab === 'settings' && <SettingsScreen />}

      <nav className="flex border-t border-emerald-800">
        <button
          onClick={() => setTab('focus')}
          className={`flex-1 py-4 text-sm font-medium ${tab === 'focus' ? 'text-emerald-50' : 'text-emerald-500'}`}
        >
          {t('nav.focus')}
        </button>
        <button
          onClick={() => setTab('activity')}
          className={`flex-1 py-4 text-sm font-medium ${tab === 'activity' ? 'text-emerald-50' : 'text-emerald-500'}`}
        >
          {t('nav.activity')}
        </button>
        <button
          onClick={() => setTab('collection')}
          className={`flex-1 py-4 text-sm font-medium ${tab === 'collection' ? 'text-emerald-50' : 'text-emerald-500'}`}
        >
          {t('nav.collection')}
        </button>
        <button
          onClick={() => setTab('settings')}
          className={`flex-1 py-4 text-sm font-medium ${tab === 'settings' ? 'text-emerald-50' : 'text-emerald-500'}`}
        >
          {t('nav.settings')}
        </button>
      </nav>
    </div>
  )
}

export default App
