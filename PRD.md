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

## 4. MVP scope

### 4.1 Focus session (plants)
- User picks a duration and starts the session; the app locks the screen (overlay) and monitors whether the phone was used outside the app.
- A Sprout grows visibly in the UI for the duration of the session.
- If completed without leaving the app → the Sprout becomes a permanent collected Plant.
- If the user leaves the app before it ends → the Sprout is discarded (session fails, nothing is collected).

### 4.2 Animal collection
- Daily step goal (default 6,000), read via Health Connect (Android). Configurable in Settings.
- Hitting the goal triggers **one Draw per day** for an animal, with rarity (common/rare/epic) — walking more doesn't let you farm more than one per day.
- **Manual sighting log**: the user can add a plant or animal manually, with no automatic validation in the MVP.

### 4.3 Collection
- Single, integrated view of plants + animals (one "ecosystem").
- Dedicated **Pokédex/collection** screen, listing everything collected so far (and what's missing).
- The collection is **permanent** — nothing dies or decays after being collected.

### 4.4 Species catalog
- Static list of species (plants and animals), built from **GBIF** data (filtering to CC0/CC-BY licenses only, compatible with future commercial use).
- Every species is tagged with a **biome** from day one (e.g. Cerrado, Atlantic Forest, Caatinga), even though the MVP doesn't filter by biome yet.

### 4.5 Settings
- Notifications **off by default**, with an option to enable them (structure in place, no real notifications implemented in the MVP).
- Language selector: English or Portuguese (Brazil), applied to both UI chrome and species names/descriptions.
- Daily step goal is editable (default 6,000, adjustable in increments of 500).

## 5. Out of scope (v1, but mapped for later)

| Feature | Reason to defer |
|---|---|
| User-switchable biome (e.g. moved to a new city) | Needs a mature multi-biome catalog first |
| Real species recognition via photo (AI) | Depends on the backend; uses the iNaturalist Computer Vision API. Open to both plants and animals from the start; the entry created must match the real identified species, never a random Draw |
| Own backend (Node/NestJS + Prisma + PostgreSQL) | MVP runs 100% locally; backend comes once the app is validated (also doubles as a fullstack portfolio piece) |
| Real notifications (reminders, celebrations) | Reduce MVP technical scope |
| Monetization | No model defined yet; the app may become profitable, decision deferred until there's a user base |
| GPS / distance traveled | MVP uses step count only |
| Perk for exceeding the daily step goal | Paulo wants some reward for walking past the configured goal, not just hitting it. Must NOT add a second Draw per day — that "max once/day" rule was a deliberate anti-farming decision (see CONTEXT.md's Draw entry). Leading candidate: scale that day's Draw rarity odds up the further past the goal you go, still capped at one Draw. Not designed or implemented yet |
| Donating/planting a real tree as part of the reward | Backlog idea, not validated yet |
| Isometric biome visualization | Replace (or complement) the Collection grid with an isometric garden scene where collected species are placed visually, Forest-app style — see `design-references/isometric-biome-example.png` for the look Paulo wants. Toggle in Settings to switch between grid and isometric view. Real art/asset pipeline needed (can't reuse the flat GBIF catalog photos for this), not designed yet |
| Web app (browser-accessible layout) | A way to check progress/collection from a browser, not just the installed Android app. Needs its own responsive layout (not a reuse of the mobile-first screens) and depends on the future backend for the data to sync anywhere — blocked on that item above |
| Motivational quotes | Show a rotating motivational quote somewhere in the app. Off by default, toggle in Settings. Content (which quotes, source/licensing) not decided yet |

## 6. Technical requirements

- **Mobile stack:** Capacitor + Vite + React + TypeScript + Tailwind + Zustand (the same everyday web stack, packaged as an Android app).
- **Native plugins (Kotlin), isolated and minimal:**
  - Screen-lock overlay.
  - App usage reading (Usage Stats API).
  - Step count reading (Health Connect).
- **Storage:** on-device local storage (SQLite via Capacitor plugin), no backend in the MVP.
- **Localization:** i18next + react-i18next, with English and Portuguese (Brazil) supported from the MVP and user-switchable in Settings. Species names and descriptions are stored per-locale in the catalog itself, not just UI chrome.
- **Future backend (out of MVP scope):** NestJS + Prisma + PostgreSQL, for cross-device sync and/or multi-user support.
- **Platform:** Android first (iOS has strong restrictions on overlay/usage APIs; revisit later if it makes sense).

## 7. Data model (high level)

See `CONTEXT.md` for the full glossary these terms are drawn from.

- **Species**: id, name, type (`plant` | `animal`), rarity, biome[], image.
- **CollectedEntry**: id, speciesId, collectedAt, method (`focus_session` | `draw` | `manual_sighting` | `photo_ai` [future]).
- **FocusSession**: id, startedAt, endedAt, plannedDuration, status (`completed` | `failed`).
- **StepGoal**: the fixed daily step-count threshold (e.g. 6,000).
- **DailyProgress**: date, steps, goalMet (bool), drawCompleted (bool).

## 8. Success metrics (MVP, personal use)

- Consistent use of focus-lock sessions for at least a few weeks.
- At least one step goal met per day, on most days.
- Subjective sense that the collection motivates going outside (qualitative validation, not a product metric yet).

## 9. Known risks

- **Android APIs** (Usage Stats, overlay, Health Connect) require sensitive permissions — the onboarding flow needs to clearly explain why each one is requested.
- **Species data licensing**: ensure only GBIF records with CC0/CC-BY licenses make it into the catalog, so future monetization isn't blocked.
- **Personal scope → public product**: MVP decisions (no auth, no backend) will need rework if/when the project grows — accepted knowingly, not technical debt by neglect.
