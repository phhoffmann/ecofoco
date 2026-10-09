import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { CatchSnackbar } from './components/CatchSnackbar'
import { CelebrationOverlay } from './components/CelebrationOverlay'
import { CollectionIcon, FootprintsIcon, MapPinIcon, SettingsIcon, SproutIcon } from './components/icons'
import { TimerPill } from './components/TimerPill'
import { ActivityScreen } from './screens/ActivityScreen'
import { BiomeSetupScreen } from './screens/BiomeSetupScreen'
import { CollectionScreen } from './screens/CollectionScreen'
import { FocusScreen } from './screens/FocusScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { useActiveBiome, useBiomeStore } from './stores/biomeStore'
import { useFocusSessionStore } from './stores/focusSessionStore'
import { TAB_IDS, useNavigationStore, type Tab } from './stores/navigationStore'
import { useSettingsStore } from './stores/settingsStore'

const TAB_ICONS: Record<Tab, typeof SproutIcon> = {
  focus: SproutIcon,
  activity: FootprintsIcon,
  collection: CollectionIcon,
  settings: SettingsIcon,
}
const TABS = TAB_IDS.map((id) => ({ id, icon: TAB_ICONS[id] }))

function App() {
  const { t } = useTranslation()
  const loadSettings = useSettingsStore((s) => s.load)
  const loadBiomes = useBiomeStore((s) => s.load)
  const biomesLoaded = useBiomeStore((s) => s.loaded)
  const hasHomeBiome = useBiomeStore((s) => s.homeBiome !== null)
  const recoverSession = useFocusSessionStore((s) => s.recover)
  const biome = useActiveBiome()

  useEffect(() => {
    void loadSettings()
    void loadBiomes()
    // A session the process was killed during resumes, or fails honestly if its time ran out.
    void recoverSession()
  }, [loadSettings, loadBiomes, recoverSession])

  // The palette in index.css follows the active Biome; onboarding keeps the default.
  useEffect(() => {
    const root = document.documentElement
    if (hasHomeBiome) root.dataset.biome = biome
    else delete root.dataset.biome
  }, [biome, hasHomeBiome])

  // The shell is exactly one viewport tall and only <main> scrolls, so the nav never leaves the screen.
  return (
    <div className="app-backdrop flex h-svh flex-col overflow-hidden text-ink">
      <header className="flex shrink-0 items-center justify-between gap-3 px-gutter pt-[calc(1rem+var(--safe-top))] pb-2">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-control bg-accent text-on-accent shadow-lift">
            <SproutIcon className="size-5" />
          </span>
          <span className="text-title tracking-tight">EcoFoco</span>
        </div>
        {hasHomeBiome && (
          <span key={biome} className="pop-in inline-flex items-center gap-1 rounded-full bg-surface/80 px-3 py-1 text-caption font-bold text-ink-muted ring-1 ring-line/60">
            <MapPinIcon className="size-3.5 text-accent" />
            {t(`biome.${biome}`)}
          </span>
        )}
      </header>

      {biomesLoaded &&
        (hasHomeBiome ? (
          <MainTabs />
        ) : (
          <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-[var(--safe-bottom)]">
            <BiomeSetupScreen />
          </main>
        ))}

      <CelebrationOverlay />
    </div>
  )
}

function MainTabs() {
  const { tab, setTab } = useNavigationStore()
  const { t } = useTranslation()
  const sessionRunning = useFocusSessionStore((s) => s.status === 'running')
  const showTimerPill = useSettingsStore((s) => s.display.timerPill) && sessionRunning && tab !== 'focus'
  const index = TABS.findIndex((item) => item.id === tab)
  return (
    <>
      <main key={tab} className="enter flex min-h-0 flex-1 flex-col overflow-y-auto">
        {tab === 'focus' && <FocusScreen />}
        {tab === 'activity' && <ActivityScreen />}
        {tab === 'collection' && <CollectionScreen />}
        {tab === 'settings' && <SettingsScreen />}
      </main>

      <nav className="shrink-0 px-3 pt-2 pb-[calc(0.5rem+var(--safe-bottom))]">
        {/* Part of the nav, not floating over <main>, so neither ever covers content. */}
        <div className="flex flex-col items-center gap-2 pb-2 empty:hidden">
          <CatchSnackbar />
          {showTimerPill && <TimerPill />}
        </div>
        <div className="relative flex rounded-card bg-surface/90 p-1.5 shadow-card ring-1 ring-line/60 backdrop-blur">
          {/* Indicator that slides under the active tab. */}
          <span
            aria-hidden
            className="absolute top-1.5 bottom-1.5 left-1.5 rounded-tile bg-accent/15 transition-transform duration-300 ease-spring motion-reduce:transition-none"
            style={{ width: `calc((100% - 0.75rem) / ${TABS.length})`, transform: `translateX(${index * 100}%)` }}
          />
          {TABS.map(({ id, icon: Icon }) => {
            const active = tab === id
            const sessionDot = id === 'focus' && sessionRunning && !active
            return (
              <button
                key={id}
                aria-current={active ? 'page' : undefined}
                onClick={() => setTab(id)}
                className={`press relative flex flex-1 flex-col items-center gap-0.5 py-2 text-overline normal-case tracking-normal ${
                  active ? 'text-accent' : 'text-ink-faint'
                }`}
              >
                <Icon key={active ? 'on' : 'off'} className={`size-6 ${active ? 'nav-bounce' : ''}`} />
                {sessionDot && (
                  <span aria-hidden className="glow-pulse absolute top-1.5 left-1/2 ml-2.5 size-2.5 rounded-full bg-accent ring-2 ring-surface" />
                )}
                {t(`nav.${id}`)}
              </button>
            )
          })}
        </div>
      </nav>
    </>
  )
}

export default App
