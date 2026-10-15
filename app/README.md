# EcoFoco app

The EcoFoco Android app: Capacitor 8 + Vite + React 19 + TypeScript + Tailwind 4 + Zustand. Everything runs on-device; there is no backend. Product scope lives in [`../PRD.md`](../PRD.md), domain terms in [`../CONTEXT.md`](../CONTEXT.md).

## Setup

Requires Node 22 (what CI uses) and pnpm 12 (the exact version is pinned in the root `package.json`'s `packageManager` field). The app is one package of the pnpm workspace at the repository root: install from there, then run the scripts from this `app/` folder.

```sh
pnpm install     # from the repository root
pnpm dev
```

The game rules (points, biome neighbours, unlock cost) and the shared domain types live in [`../packages/shared`](../packages/shared) (`@ecofoco/shared`), so the API can apply the same code; `src/domain/biome.ts` and `src/domain/types.ts` re-export them. `pnpm dev` and `pnpm test` load it from source, so edits apply without a rebuild.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Vite dev server. Runs `copy-sql-wasm` first. |
| `pnpm test` | Vitest, once (`vitest run`). |
| `pnpm lint` | Oxlint. |
| `pnpm build` | Type-checks (`tsc -b`) and builds to `dist/`. Runs `copy-sql-wasm` first. |
| `pnpm preview` | Serves the built `dist/`. |
| `pnpm copy-sql-wasm` | Copies `sql-wasm.wasm` into `public/assets/` (see below). |
| `pnpm build:biome-grid <path/to/Ecoregions2017.shp>` | Regenerates the location → biome lookup (see below). |
| `pnpm build:catalog` | Regenerates the species catalog and photos (see below). |
| `pnpm bake:garden` | Re-renders the garden sprites from CC0 3D kits (see below). |

CI (`.github/workflows/ci.yml`) runs `pnpm install --frozen-lockfile`, `lint`, `test` and `build` on every push and pull request to `main`.

### The sql.js wasm copy step

In the browser, SQLite runs through `jeep-sqlite`, which loads `/assets/sql-wasm.wasm` at runtime. That wasm must come from the same sql.js version as its JS glue, so the root `pnpm-workspace.yaml` pins sql.js through `overrides` and `scripts/copy-sql-wasm.mjs` copies the matching file to `public/assets/sql-wasm.wasm`. The copy is git-ignored and runs automatically before `dev` and `build`; run `pnpm copy-sql-wasm` by hand only if you serve the app some other way. On Android the native SQLite plugin is used instead.

## Location → biome grid

The home biome is looked up offline in two committed, generated files:

- `src/assets/biomes/ecoregion-grid.bin` — a world grid of RESOLVE Ecoregions 2017 ids, one per 0.1° cell (~192 KB).
- `src/domain/ecoregionBiomes.ts` — the ecoregion id → biome table, generated from the curated groups in `scripts/brazil-biome-ecoregions.ts`.

To regenerate them (Node ≥ 22.18, for TypeScript type stripping), download the 149 MB RESOLVE shapefile — it is not committed — and run the build script:

```sh
curl -LO https://storage.googleapis.com/teow2016/Ecoregions2017.zip
unzip Ecoregions2017.zip -d /tmp/resolve
pnpm build:biome-grid /tmp/resolve/Ecoregions2017.shp
```

The output is deterministic, so an unchanged source and table produce no diff. Edit `scripts/brazil-biome-ecoregions.ts` to change which ecoregions belong to which biome. Attribution and the changes made to the source data: [`src/assets/biomes/LICENSE.md`](src/assets/biomes/LICENSE.md).

## Species catalog

The bundled catalog — `src/catalog/<biome>.json` for Brazil's six biomes plus one WebP photo per species in
`src/assets/species/` — is generated at build time from iNaturalist and GBIF. The app never calls either API.
Regenerate it from `app/` with Node ≥ 22.18:

```sh
pnpm build:catalog
```

- **Candidates:** iNaturalist species with research-grade observations that carry CC0/CC-BY photos, in the
  Brazilian states listed per biome in `scripts/catalog/config.ts`, ranked by observation count. Species
  iNaturalist records as introduced (or invasive) there are left out; species with no establishment record are
  kept, since many well-known natives have none. 20 plants
  and 20 animals per biome (8 birds, 5 mammals, 3 reptiles, 4 insects).
- **Biome check:** a candidate stays only if GBIF has CC0/CC-BY occurrences inside the biome's RESOLVE ecoregions
  (the same grid and ecoregion → biome table as location lookup).
- **Rarity:** the most-observed 60% of a biome's plants (and animals) are common, the next 30% rare, the rest epic.
  Rarity is per biome: a species shared by several biomes can have a different tier in each.
- **Photos:** a CC0/CC-BY observation photo (not the taxon's default photo), iNaturalist's medium size re-encoded
  as WebP; the photographer is credited in the app's Settings → Credits.
- **Hand-edited data:** `scripts/catalog/species-text.ts` holds each species' stable id, short original
  descriptions (never Wikipedia text) and optional overrides for names, archetype and rarity. When the pipeline
  selects a species with no entry there, it stops and lists them in `.catalog-cache/missing-text.json`.
- **Cache:** raw API responses and photos are cached in `.catalog-cache/` (git-ignored; set `CATALOG_CACHE_DIR`
  to move it), so reruns are fast and reproducible. Delete it to pick up new observations.
- **GBIF citation:** `src/catalog/gbif-derived-dataset.csv` lists the GBIF datasets behind the biome check, ready
  to register as a derived dataset at https://www.gbif.org/derived-dataset/register; put the DOI in
  `src/components/CreditsSheet.tsx`.

Removing a species from the catalog is safe: collected entries for ids that no longer exist are kept in the
database but not shown.

## Garden sprites

The garden and the Focus sprout use one transparent WebP per archetype (plus two early growth stages and a few
ground decorations) in `src/assets/garden/`, and `sprites.json` with each sprite's size and foot point. They are
baked from CC0 3D models rather than drawn, so every sprite shares one camera, one light and one palette:

```sh
pnpm bake:garden
```

- **What's rendered:** `scripts/garden-bake/sprites.ts` maps each sprite to a model from Kenney's Nature Kit or
  Cube Pets (downloaded once into `.garden-cache/`, git-ignored; set `GARDEN_CACHE_DIR` to move it), or to a
  hand-built model in `scripts/garden-bake/procedural.js` (the lizard and the seedling), with material
  recolours, scale and facing.
- **How:** `scripts/garden-bake/bake.html` renders one model with three.js (loaded from a CDN, not an app
  dependency) through an orthographic camera at 30° elevation and 45° azimuth, so one world unit of ground is
  exactly one 2:1 garden tile. The script screenshots it in headless Chrome (`CHROME_BIN` to override
  `google-chrome`), trims it with sharp and records where the model touches the ground.
- **Needs:** Chrome or Chromium, `unzip`, network access for the kits and three.js.

Licenses and sources per sprite: [`src/assets/garden/LICENSE.md`](src/assets/garden/LICENSE.md).

## Android

### Debug APK from CI

The `android` CI job builds a debug APK on every run and uploads it as the `ecofoco-debug-apk` artifact. It also fails the build if the merged manifest requests Health Connect permissions beyond steps or location beyond coarse.

With the GitHub CLI, from the repository:

```sh
gh run list --workflow CI --branch main --status success --limit 1
gh run download <run-id> -n ecofoco-debug-apk
adb install -r app-debug.apk
```

Or download the artifact from the run's page under **Actions** on GitHub and unzip it. The phone needs USB debugging enabled; the app needs Android 8.0+ and Health Connect for step counts.

### Local build

Mirrors the CI job; needs JDK 21 and the Android SDK.

```sh
pnpm build
pnpm exec cap sync android
cd android && ./gradlew assembleDebug
```

The workspace uses pnpm's hoisted `node_modules` (`nodeLinker: hoisted` in `pnpm-workspace.yaml`): Capacitor writes each plugin's real path into `android/capacitor.settings.gradle`, and pnpm's default symlinked store would put version-stamped paths into that committed file.

The APK lands in `android/app/build/outputs/apk/debug/`.
