# PRD — EcoFoco (working title)

> A productivity app that locks the phone and rewards the user by growing a plant during the focus session — with the twist of also collecting animals, encouraging not just focus in the moment, but going outside and exercising.

## 1. Problem and motivation

Rewarding someone just for *not* using their phone works for the moment of focus, but the incentive stops there — there's no link to real physical activity or contact with nature. The idea is to extend that reward into the real world: collecting animals requires actually moving (walking), not just standing still with the phone locked.

## 2. Goal

Build a personal app (with potential to become a public/profitable product later) that:
- Locks the phone during focus sessions, growing a plant while the session lasts.
- Adds an animal collection that only progresses with real physical activity.
- Serves as a fullstack portfolio project (mobile + backend).

## 3. Target audience (MVP)

Personal use by the creator. Validate the mechanic before thinking about external users.

## 4. Scope

v1 is the MVP loop (focus → plants, steps → animals, one permanent Collection) plus two additions decided after the first build: **location-based biomes** and the **isometric garden**. Each subsection says what is shipped and what is still planned; §6 holds the roadmap.

### 4.1 Focus session (plants)
- User picks a duration (3, 15, 25 or 45 minutes) and starts the session.
- A Sprout grows visibly in the UI for the duration of the session.
- If completed without leaving the app → the Sprout becomes a permanent collected Plant, drawn from the current biome (§4.5).
- If the user leaves the app before it ends → the Sprout is discarded (session fails, nothing is collected).
- **Shipped:** the app keeps the screen awake during a session, and the session fails as soon as the app goes to the background.
- **Planned (native focus lock, §6):** a real lock — a screen overlay plus app-usage monitoring — where turning the screen off counts as staying focused (Forest-style), while opening another app still fails the session. Today, turning the screen off backgrounds the app and fails the session.

### 4.2 Animal collection
- Daily step goal (default 6,000), read via Health Connect (Android). Configurable in Settings.
- Hitting the goal triggers **one Draw per day** for an animal from the current biome, weighted by rarity (common/rare/epic) — walking more doesn't let you farm more than one per day. The day is the device's local calendar day.
- **Manual sighting log**: the user can add a plant or animal of the current biome manually, with no automatic validation in the MVP.
- The Activity screen has a step simulator that writes test steps to Health Connect, so the Draw can be tested without walking. It is a development aid, to be removed before a public release (§6).

### 4.3 Collection
- Single, integrated view of plants + animals (one "ecosystem").
- Dedicated **Pokédex/collection** grid for the current biome, listing everything collected so far (and what's missing).
- The collection is **permanent** — nothing dies or decays after being collected.
- **Isometric garden** view (Forest-style), switched from a grid ↔ garden toggle on the Collection screen itself: shows only what was collected in a chosen day / week / month, on a plot whose ground is tinted per biome; the grid stays as the full Pokédex. Sprites are CC0 placeholders, one per growth-form/body-plan archetype (not per species); baked archetype art replaces them later (§6).
- Tapping a species (grid or garden) opens a bottom sheet with its photo (and credit, where the license asks for one), description and collection history.
- Every new CollectedEntry plays a short celebration showing the species just collected.

### 4.4 Species catalog
- Static list of species (plants and animals), built at build time from **iNaturalist** and **GBIF** data (filtering to CC0/CC-BY licenses only, compatible with future commercial use): the most-observed species per biome, leaving out those recorded as introduced, with a bundled photo and its credit.
- Every species is tagged with a **biome** (e.g. Cerrado, Atlantic Forest, Caatinga) and a garden **archetype**. Brazil's catalog is bundled in the app, photos included, and covers all six IBGE biomes (about 20 plants and 20 animals each, with English and Portuguese (Brazil) names and descriptions); a biome without species would show as "coming soon".

### 4.5 Biomes
- The six biomes are IBGE's for Brazil. A biome is playable once the catalog has plants and animals for it.
- The home biome comes from the user's location: coarse location only, asked once at onboarding (plus a re-detect action in Settings), looked up in a bundled grid built from RESOLVE Ecoregions 2017. Only the biome id is stored, never coordinates. A manual picker is the fallback (permission denied, no fix, outside Brazil, or a biome without species yet).
- Focus rewards, step-goal Draws, manual sightings and the Collection grid all come from the **current** biome.
- Completed focus sessions and met step goals earn points (10 each); 100 points unlock one **neighbouring** biome (one that shares a border with an already unlocked biome — no travel needed). The user can switch only to an unlocked biome.
- A home that came from real detection stays unlocked if a later re-detect moves the home elsewhere; a manually picked home is a stand-in and does not.

### 4.6 Settings
- Notifications **off by default**, with an option to enable them (structure in place, no real notifications implemented in the MVP).
- Language selector: English or Portuguese (Brazil), applied to both UI chrome and species names/descriptions.
- Daily step goal is editable (default 6,000, adjustable in increments of 500).
- Biome: current biome, point balance, unlocking neighbours, switching, and re-detecting the home biome.
- Credits for the RESOLVE Ecoregions data (CC-BY 4.0).

### 4.7 Navigation
- Four tabs — Focus, Activity, Collection, Settings — in a bottom nav pinned to the screen; only the content scrolls.
- Until a home biome is set, the app shows the biome onboarding instead of the tabs.

## 5. Out of scope (v1, but mapped for later)

| Feature | Reason to defer |
|---|---|
| Biomes outside Brazil | v1 covers Brazil's six biomes; other countries need their own places and ecoregion groups in the catalog pipeline |
| Real species recognition via photo (AI) | Depends on the backend; uses the iNaturalist Computer Vision API. Open to both plants and animals from the start; the entry created must match the real identified species, never a random Draw |
| Own backend (Node/NestJS + Prisma + PostgreSQL) | MVP runs 100% locally; backend comes once the app is validated (also doubles as a fullstack portfolio piece) |
| Real notifications (reminders, celebrations) | Reduce MVP technical scope |
| Monetization | No model defined yet; the app may become profitable, decision deferred until there's a user base |
| GPS / distance traveled | MVP uses step count only; location is used only once, coarsely, to find the home biome |
| Perk for exceeding the daily step goal | Paulo wants some reward for walking past the configured goal, not just hitting it. Must NOT add a second Draw per day — that "max once/day" rule was a deliberate anti-farming decision (see CONTEXT.md's Draw entry). Leading candidate: scale that day's Draw rarity odds up the further past the goal you go, still capped at one Draw. Not designed or implemented yet |
| Donating/planting a real tree as part of the reward | Backlog idea, not validated yet |
| Web app (browser-accessible layout) | A way to check progress/collection from a browser, not just the installed Android app. Needs its own responsive layout (not a reuse of the mobile-first screens) and depends on the future backend for the data to sync anywhere — blocked on that item above |
| Motivational quotes | Show a rotating motivational quote somewhere in the app. Off by default, toggle in Settings. Content (which quotes, source/licensing) not decided yet |

## 6. Roadmap

Planned work, roughly in order of how much it unblocks:

1. **Native focus lock.** Kotlin plugins for the screen-lock overlay and app-usage reading (Usage Stats API), so a session survives the screen being turned off (Forest-style) and fails only when another app is used. Replaces today's keep-awake + leave-the-app-and-fail behaviour (§4.1).
2. **Catalog pipeline for Brazil's six biomes.** A repeatable way to pick native species from GBIF / iNaturalist with CC0/CC-BY photos, archetypes and en + pt-BR text, then fill Amazon, Cerrado, Pantanal and Pampa so no biome is "coming soon". The catalog stays bundled.
3. **App-wide visual polish.** Baked per-archetype garden art replacing the Kenney placeholders, richer per-biome ground (see `design-references/isometric-biome-example.png` for the target look), and motion/animation across the app, not only in the garden and celebrations.
4. **Android 8–11 coarse location.** Devices below Android 12 (API < 31) may not grant coarse-only location, leaving only the manual picker. Not tested on a real device yet; verify and fix if needed.
5. **Plugin permission trim.** `@capgo/capacitor-health` merges read + write permissions for every Health Connect type; the manifest strips all but steps, and CI fails if more come back. `WRITE_STEPS` exists only for the step simulator and goes away with it before a public release.

## 7. Technical requirements

- **Mobile stack:** Capacitor + Vite + React + TypeScript + Tailwind + Zustand (the same everyday web stack, packaged as an Android app).
- **Native capabilities today:** off-the-shelf Capacitor plugins only — SQLite, Health Connect steps (`@capgo/capacitor-health`), coarse geolocation, keep-awake, app lifecycle and haptics.
- **Native plugins (Kotlin), isolated and minimal — planned (§6):**
  - Screen-lock overlay.
  - App usage reading (Usage Stats API).
- **Storage:** on-device local storage (SQLite via `@capacitor-community/sqlite`; `jeep-sqlite` / sql.js wasm in the browser), no backend in the MVP.
- **Location → biome:** a bundled 0.1° world grid of RESOLVE ecoregion ids plus a curated ecoregion → biome table, both generated by a build script from the RESOLVE shapefile (not committed). Lookup is fully offline.
- **Localization:** i18next + react-i18next, with English and Portuguese (Brazil) supported from the MVP and user-switchable in Settings. Species names and descriptions are stored per-locale, not just UI chrome.
- **CI:** GitHub Actions runs lint, tests and the web build, then builds a debug APK, uploads it as an artifact, and fails if the merged Android manifest requests Health Connect permissions beyond steps or location beyond coarse.
- **Future backend (out of MVP scope):** NestJS + Prisma + PostgreSQL, for cross-device sync and/or multi-user support.
- **Platform:** Android first, Android 8.0+ (iOS has strong restrictions on overlay/usage APIs; revisit later if it makes sense).

## 8. Data model (high level)

See `CONTEXT.md` for the full glossary these terms are drawn from.

- **Species**: id, scientific name, type (`plant` | `animal`), rarity, biome[], archetype, image + license/credit. Localized names and descriptions live in the locale files.
- **CollectedEntry**: id, speciesId, collectedAt, method (`focus_session` | `draw` | `manual_sighting` | `photo_ai` [future]).
- **FocusSession**: id, startedAt, endedAt, plannedDuration, status (`completed` | `failed`).
- **StepGoal**: the daily step-count threshold (default 6,000).
- **DailyProgress**: date (local), steps, goalMet (bool), drawCompleted (bool).
- **Biome progress**: home biome (and whether it was detected or picked), current biome, biomes unlocked with points (and their cost). The point balance is derived: points earned from completed sessions and met goals, minus points spent.

## 9. Success metrics (MVP, personal use)

- Consistent use of focus-lock sessions for at least a few weeks.
- At least one step goal met per day, on most days.
- Subjective sense that the collection motivates going outside (qualitative validation, not a product metric yet).

## 10. Known risks

- **Android APIs** (Usage Stats, overlay, Health Connect, location) require sensitive permissions — the onboarding flow needs to clearly explain why each one is requested.
- **Location privacy**: only coarse location, asked once, and only the resulting biome id is stored. CI guards against fine location sneaking in through a dependency.
- **Species data licensing**: ensure only CC0/CC-BY records and photos make it into the catalog, with credit kept per species, so future monetization isn't blocked.
- **Personal scope → public product**: MVP decisions (no auth, no backend) will need rework if/when the project grows — accepted knowingly, not technical debt by neglect.
