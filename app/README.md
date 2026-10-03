# EcoFoco app

The EcoFoco Android app: Capacitor 8 + Vite + React 19 + TypeScript + Tailwind 4 + Zustand. Everything runs on-device; there is no backend. Product scope lives in [`../PRD.md`](../PRD.md), domain terms in [`../CONTEXT.md`](../CONTEXT.md).

## Setup

Requires Node 22 (what CI uses). Run everything from this `app/` folder.

```sh
npm ci
npm run dev
```

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server. Runs `copy-sql-wasm` first. |
| `npm test` | Vitest, once (`vitest run`). |
| `npm run lint` | Oxlint. |
| `npm run build` | Type-checks (`tsc -b`) and builds to `dist/`. Runs `copy-sql-wasm` first. |
| `npm run preview` | Serves the built `dist/`. |
| `npm run copy-sql-wasm` | Copies `sql-wasm.wasm` into `public/assets/` (see below). |
| `npm run build:biome-grid -- <path/to/Ecoregions2017.shp>` | Regenerates the location → biome lookup (see below). |
| `npm run build:catalog` | Regenerates the species catalog and photos (see below). |

CI (`.github/workflows/ci.yml`) runs `npm ci`, `lint`, `test` and `build` on every push and pull request to `main`.

### The sql.js wasm copy step

In the browser, SQLite runs through `jeep-sqlite`, which loads `/assets/sql-wasm.wasm` at runtime. That wasm must come from the same sql.js version as its JS glue, so `package.json` pins sql.js through `overrides` and `scripts/copy-sql-wasm.mjs` copies the matching file to `public/assets/sql-wasm.wasm`. The copy is git-ignored and runs automatically before `dev` and `build`; run `npm run copy-sql-wasm` by hand only if you serve the app some other way. On Android the native SQLite plugin is used instead.

## Location → biome grid

The home biome is looked up offline in two committed, generated files:

- `src/assets/biomes/ecoregion-grid.bin` — a world grid of RESOLVE Ecoregions 2017 ids, one per 0.1° cell (~192 KB).
- `src/domain/ecoregionBiomes.ts` — the ecoregion id → biome table, generated from the curated groups in `scripts/brazil-biome-ecoregions.ts`.

To regenerate them (Node ≥ 22.18, for TypeScript type stripping), download the 149 MB RESOLVE shapefile — it is not committed — and run the build script:

```sh
curl -LO https://storage.googleapis.com/teow2016/Ecoregions2017.zip
unzip Ecoregions2017.zip -d /tmp/resolve
npm run build:biome-grid -- /tmp/resolve/Ecoregions2017.shp
```

The output is deterministic, so an unchanged source and table produce no diff. Edit `scripts/brazil-biome-ecoregions.ts` to change which ecoregions belong to which biome. Attribution and the changes made to the source data: [`src/assets/biomes/LICENSE.md`](src/assets/biomes/LICENSE.md).

## Species catalog

The bundled catalog — `src/catalog/<biome>.json` for Brazil's six biomes plus one WebP photo per species in
`src/assets/species/` — is generated at build time from iNaturalist and GBIF. The app never calls either API.
Regenerate it from `app/` with Node ≥ 22.18:

```sh
npm run build:catalog
```

- **Candidates:** iNaturalist species with research-grade observations that carry CC0/CC-BY photos, in the
  Brazilian states listed per biome in `scripts/catalog/config.ts`, ranked by observation count. Species
  iNaturalist records as introduced (or invasive) there are left out; species with no establishment record are
  kept, since many well-known natives have none. 20 plants
  and 20 animals per biome (8 birds, 5 mammals, 3 reptiles, 4 insects).
- **Biome check:** a candidate stays only if GBIF has CC0/CC-BY occurrences inside the biome's RESOLVE ecoregions
  (the same grid and ecoregion → biome table as location lookup).
- **Rarity:** the most-observed 60% of a biome's plants (and animals) are common, the next 30% rare, the rest epic.
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
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
```

The APK lands in `android/app/build/outputs/apk/debug/`.
