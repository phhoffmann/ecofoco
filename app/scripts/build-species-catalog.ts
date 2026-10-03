/**
 * Builds the bundled species catalog for Brazil's six Biomes from iNaturalist and GBIF (build time only).
 *
 * Outputs (all committed):
 *   src/catalog/<biome>.json              species per Biome: names, descriptions, Rarity, archetype, photo credit
 *   src/assets/species/<id>.webp          one CC0/CC-BY observation photo per species
 *   src/catalog/gbif-derived-dataset.csv  GBIF datasets behind the presence check, for the derived-dataset citation
 *
 * Run from app/ (Node ≥ 22.18, for TypeScript type stripping):  npm run build:catalog
 * Raw API responses and photos are cached in app/.catalog-cache/ (git-ignored; override with CATALOG_CACHE_DIR),
 * so reruns are cheap. Delete the cache to pick up new observations.
 *
 * Per Biome and kind: candidates are iNaturalist species with research-grade, native observations carrying
 * CC0/CC-BY photos in the Biome's states (scripts/catalog/config.ts), ranked by observation count. A candidate
 * is kept when GBIF has CC0/CC-BY occurrences inside the Biome's RESOLVE ecoregions. Species already in the
 * catalog keep their slot while they pass. Hand-edited ids, names and descriptions live in
 * scripts/catalog/species-text.ts; a selected species without one stops the run and is listed in
 * <cache>/missing-text.json.
 */
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import type { BiomeId, CatalogFile, CatalogSpecies, Rarity, SpeciesKind } from '../src/domain/catalogSchema.ts'
import { BIOME_IDS } from '../src/domain/catalogSchema.ts'
import { archetypeFor, isMarine, type Taxonomy } from './catalog/archetype.ts'
import {
  ANIMAL_QUOTAS,
  BIOME_PLACES,
  CANDIDATES_PER_TAXON,
  GBIF_MIN_INTERVAL_MS,
  GBIF_SAMPLE_SIZE,
  INAT_MIN_INTERVAL_MS,
  MIN_BIOME_OCCURRENCES,
  PHOTO_MAX_BYTES,
  PHOTO_MAX_EDGE,
  PHOTO_MIN_INTERVAL_MS,
  PHOTO_WEBP_QUALITIES,
  PLANT_SLOTS,
  type IconicTaxon,
} from './catalog/config.ts'
import { biomeBounds, inBiome, readGrid, type Bounds, type Occurrence } from './catalog/presence.ts'
import {
  byObservations,
  choosePhoto,
  fillQuotas,
  isAllowedGbifLicense,
  mostCommon,
  pickName,
  rarityByRank,
  slugify,
  type Candidate,
  type ChosenPhoto,
  type Observation,
} from './catalog/select.ts'
import { CachedFetcher, url } from './catalog/sources.ts'
import { SPECIES_TEXT } from './catalog/species-text.ts'

const appRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const CATALOG_DIR = join(appRoot, 'src/catalog')
const PHOTO_DIR = join(appRoot, 'src/assets/species')
const GRID_PATH = join(appRoot, 'src/assets/biomes/ecoregion-grid.bin')
const CACHE_DIR = process.env.CATALOG_CACHE_DIR ?? join(appRoot, '.catalog-cache')

const INAT_API = 'https://api.inaturalist.org/v1'
const GBIF_API = 'https://api.gbif.org/v1'

const inat = new CachedFetcher(join(CACHE_DIR, 'inat'), INAT_MIN_INTERVAL_MS)
const gbif = new CachedFetcher(join(CACHE_DIR, 'gbif'), GBIF_MIN_INTERVAL_MS)
const photos = new CachedFetcher(join(CACHE_DIR, 'photos'), PHOTO_MIN_INTERVAL_MS)
const grid = readGrid(GRID_PATH)

interface InatTaxon {
  id: number
  name: string
  rank: string
  iconic_taxon_name?: string
  preferred_common_name?: string
  english_common_name?: string
}

interface SpeciesCount {
  count: number
  taxon: InatTaxon
}

interface InatCandidate extends Candidate {
  group: IconicTaxon
  kind: SpeciesKind
  inatTaxonId: number
  inatNames: { en?: string; 'pt-BR'?: string }
}

interface GbifMatch {
  usageKey?: number
  acceptedUsageKey?: number
  matchType: string
  order?: string
  family?: string
  genus?: string
}

const ICONIC_TAXA = Object.keys(ANIMAL_QUOTAS) as IconicTaxon[]
const kindOf = (taxon: IconicTaxon): SpeciesKind => (taxon === 'Plantae' ? 'plant' : 'animal')
const placeIds = (biomes: BiomeId[]) => [...new Set(biomes.flatMap((b) => Object.values(BIOME_PLACES[b])))].join(',')

function toCandidate(row: SpeciesCount): InatCandidate | null {
  const group = row.taxon.iconic_taxon_name as IconicTaxon | undefined
  if (row.taxon.rank !== 'species' || !group || !(group === 'Plantae' || group in ANIMAL_QUOTAS)) return null
  return {
    scientificName: row.taxon.name,
    count: row.count,
    group,
    kind: kindOf(group),
    inatTaxonId: row.taxon.id,
    inatNames: { 'pt-BR': row.taxon.preferred_common_name, en: row.taxon.english_common_name },
  }
}

/** Research-grade, native, CC0/CC-BY-photographed species in the Biome's states. */
async function speciesCounts(biome: BiomeId, filter: Record<string, string | number>): Promise<InatCandidate[]> {
  const res = await inat.json<{ results: SpeciesCount[] }>(
    url(`${INAT_API}/observations/species_counts`, {
      place_id: placeIds([biome]),
      quality_grade: 'research',
      native: 'true',
      photo_license: 'cc0,cc-by',
      locale: 'pt-BR',
      per_page: CANDIDATES_PER_TAXON,
      ...filter,
    }),
  )
  return res.results.map(toCandidate).filter((c): c is InatCandidate => c !== null)
}

/** A species already in the catalog, as a candidate — or null when it no longer passes the native/licence filters. */
async function pinnedCandidate(biome: BiomeId, scientificName: string): Promise<InatCandidate | null> {
  const taxa = await inat.json<{ results: InatTaxon[] }>(
    url(`${INAT_API}/taxa`, { q: scientificName, rank: 'species', is_active: 'true', per_page: 10 }),
  )
  const taxon = taxa.results.find((t) => t.name === scientificName)
  if (!taxon) return null
  const [row] = await speciesCounts(biome, { taxon_id: taxon.id })
  return row?.scientificName === scientificName ? row : null
}

const matches = new Map<string, Promise<GbifMatch>>()
function gbifMatch(c: InatCandidate): Promise<GbifMatch> {
  if (!matches.has(c.scientificName)) {
    const kingdom = c.kind === 'plant' ? 'Plantae' : 'Animalia'
    matches.set(c.scientificName, gbif.json<GbifMatch>(url(`${GBIF_API}/species/match`, { name: c.scientificName, kingdom })))
  }
  return matches.get(c.scientificName)!
}

const gbifKey = (m: GbifMatch) => m.acceptedUsageKey ?? m.usageKey
const taxonomyOf = (c: InatCandidate, m: GbifMatch): Taxonomy => ({
  iconicTaxon: c.group,
  order: m.order,
  family: m.family,
  genus: m.genus,
})

const bounds = new Map<BiomeId, Bounds>(BIOME_IDS.map((b) => [b, biomeBounds(grid, b)]))
// GBIF datasets whose occurrences confirmed a species' presence: datasetKey → occurrences used.
const usedDatasets = new Map<string, number>()

/** At least MIN_BIOME_OCCURRENCES of the species' CC0/CC-BY GBIF occurrences fall in the Biome's ecoregions. */
async function presentIn(biome: BiomeId, c: InatCandidate): Promise<boolean> {
  const match = await gbifMatch(c)
  const key = gbifKey(match)
  if (!key || match.matchType === 'NONE' || isMarine(taxonomyOf(c, match))) return false
  const box = bounds.get(biome)!
  const res = await gbif.json<{ results: (Occurrence & { license?: string })[] }>(
    url(`${GBIF_API}/occurrence/search`, {
      taxonKey: key,
      country: 'BR',
      hasCoordinate: 'true',
      hasGeospatialIssue: 'false',
      occurrenceStatus: 'PRESENT',
      license: ['CC0_1_0', 'CC_BY_4_0'],
      decimalLatitude: `${box.minLat},${box.maxLat}`,
      decimalLongitude: `${box.minLng},${box.maxLng}`,
      limit: GBIF_SAMPLE_SIZE,
    }),
  )
  const inside = inBiome(
    grid,
    biome,
    res.results.filter((o) => isAllowedGbifLicense(o.license)),
  )
  if (inside.length < MIN_BIOME_OCCURRENCES) return false
  for (const o of inside) usedDatasets.set(o.datasetKey, (usedDatasets.get(o.datasetKey) ?? 0) + 1)
  return true
}

interface Selected {
  candidate: InatCandidate
  biomes: Map<BiomeId, { count: number; rarity: Rarity }>
}

async function selectBiome(biome: BiomeId, selected: Map<string, Selected>, droppedIds: Set<string>) {
  const pins = Object.entries(SPECIES_TEXT).filter(([, text]) => text.keepIn?.includes(biome))
  const pinned: InatCandidate[] = []
  for (const [name, text] of pins) {
    const c = await pinnedCandidate(biome, name)
    if (c) pinned.push(c)
    else droppedIds.add(text.id)
  }

  const accept = (c: InatCandidate) => presentIn(biome, c)
  const plants = await fillQuotas(
    pinned.filter((c) => c.kind === 'plant'),
    await speciesCounts(biome, { iconic_taxa: 'Plantae' }),
    { Plantae: PLANT_SLOTS },
    accept,
  )
  const animalCandidates = (await Promise.all(ICONIC_TAXA.map((t) => speciesCounts(biome, { iconic_taxa: t })))).flat()
  const animals = await fillQuotas(
    pinned.filter((c) => c.kind === 'animal'),
    animalCandidates,
    ANIMAL_QUOTAS,
    accept,
  )
  for (const pin of [...plants.droppedPins, ...animals.droppedPins]) droppedIds.add(SPECIES_TEXT[pin.scientificName].id)

  for (const chosen of [plants.chosen, animals.chosen]) {
    const tiers = rarityByRank(chosen)
    for (const c of chosen) {
      const entry = selected.get(c.scientificName) ?? { candidate: c, biomes: new Map() }
      entry.biomes.set(biome, { count: c.count, rarity: tiers.get(c.scientificName)! })
      selected.set(c.scientificName, entry)
    }
  }
  console.log(`${biome}: ${plants.chosen.length} plants, ${animals.chosen.length} animals`)
}

async function gbifVernacular(c: InatCandidate, language: 'por' | 'eng'): Promise<string | undefined> {
  const key = gbifKey(await gbifMatch(c))
  if (!key) return undefined
  const res = await gbif.json<{ results: { vernacularName: string; language?: string }[] }>(
    url(`${GBIF_API}/species/${key}/vernacularNames`, { limit: 100 }),
  )
  return res.results.find((v) => v.language === language)?.vernacularName
}

/** iNaturalist medium photo → WebP within PHOTO_MAX_BYTES, at the highest quality step that fits. */
async function toWebp(jpeg: Buffer): Promise<Buffer> {
  const resized = sharp(jpeg).resize({ width: PHOTO_MAX_EDGE, height: PHOTO_MAX_EDGE, fit: 'inside', withoutEnlargement: true })
  let webp: Buffer | undefined
  for (const quality of PHOTO_WEBP_QUALITIES) {
    webp = await resized.clone().webp({ quality }).toBuffer()
    if (webp.length <= PHOTO_MAX_BYTES) break
  }
  return webp!
}

async function bundlePhoto(
  id: string,
  biomes: BiomeId[],
  c: InatCandidate,
  observationId?: number,
): Promise<CatalogSpecies['photo']> {
  if (observationId) {
    const res = await inat.json<{ results: Observation[] }>(`${INAT_API}/observations/${observationId}`)
    const photo = choosePhoto(res.results)
    if (!photo) throw new Error(`Observation ${observationId} has no CC0/CC-BY photo for ${c.scientificName}`)
    return writePhoto(id, photo)
  }
  const query = (place?: string) =>
    inat.json<{ results: Observation[] }>(
      url(`${INAT_API}/observations`, {
        taxon_id: c.inatTaxonId,
        ...(place ? { place_id: place } : {}),
        quality_grade: 'research',
        photo_license: 'cc0,cc-by',
        order_by: 'votes',
        per_page: 30,
      }),
    )
  const photo = choosePhoto((await query(placeIds(biomes))).results) ?? choosePhoto((await query()).results)
  if (!photo) throw new Error(`No CC0/CC-BY observation photo for ${c.scientificName}`)
  return writePhoto(id, photo)
}

async function writePhoto(id: string, photo: ChosenPhoto): Promise<CatalogSpecies['photo']> {
  const file = `${id}.webp`
  writeFileSync(join(PHOTO_DIR, file), await toWebp(await photos.bytes(photo.mediumUrl)))
  return { file, license: photo.license, credit: photo.credit, sourceUrl: photo.sourceUrl }
}

async function main() {
  const selected = new Map<string, Selected>()
  const droppedIds = new Set<string>()
  for (const biome of BIOME_IDS) await selectBiome(biome, selected, droppedIds)
  // A pin dropped in one Biome may still be kept in another.
  const keptIds = new Set([...selected.keys()].map((name) => SPECIES_TEXT[name]?.id))
  const removed = [...droppedIds].filter((id) => !keptIds.has(id))
  if (removed.length) console.log(`Removed (failed the native/licence/presence filters): ${removed.join(', ')}`)

  const missing = [...selected.values()].filter((s) => !SPECIES_TEXT[s.candidate.scientificName])
  if (missing.length) {
    const report = await Promise.all(
      missing.map(async ({ candidate: c, biomes }) => ({
        scientificName: c.scientificName,
        suggestedId: slugify(c.inatNames['pt-BR'] ?? (await gbifVernacular(c, 'por')) ?? c.scientificName),
        group: c.group,
        biomes: [...biomes.keys()],
        inatNames: c.inatNames,
        gbifNames: { 'pt-BR': await gbifVernacular(c, 'por'), en: await gbifVernacular(c, 'eng') },
        taxonomy: taxonomyOf(c, await gbifMatch(c)),
        observations: Object.fromEntries(biomes),
      })),
    )
    const reportPath = join(CACHE_DIR, 'missing-text.json')
    writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
    console.error(`${missing.length} selected species have no entry in scripts/catalog/species-text.ts — see ${reportPath}`)
    process.exit(1)
  }

  const ids = [...selected.keys()].map((name) => SPECIES_TEXT[name].id)
  const duplicate = ids.find((id, i) => ids.indexOf(id) !== i)
  if (duplicate) throw new Error(`Duplicate species id ${duplicate}`)

  mkdirSync(PHOTO_DIR, { recursive: true })
  mkdirSync(CATALOG_DIR, { recursive: true })
  const entries: { biomes: Selected['biomes']; species: CatalogSpecies }[] = []
  for (const [name, { candidate: c, biomes }] of selected) {
    const text = SPECIES_TEXT[name]
    const match = await gbifMatch(c)
    const biomeIds = [...biomes.keys()]
    const names = {
      en: pickName({
        locale: 'en',
        override: text.names?.en,
        inat: c.inatNames.en,
        gbif: text.names?.en || c.inatNames.en ? undefined : await gbifVernacular(c, 'eng'),
        scientificName: name,
      }),
      'pt-BR': pickName({
        locale: 'pt-BR',
        override: text.names?.['pt-BR'],
        inat: c.inatNames['pt-BR'],
        gbif: text.names?.['pt-BR'] || c.inatNames['pt-BR'] ? undefined : await gbifVernacular(c, 'por'),
        scientificName: name,
      }),
    }
    entries.push({
      biomes,
      species: {
        id: text.id,
        scientificName: name,
        type: c.kind,
        rarity: text.rarity ?? mostCommon([...biomes.values()].map((b) => b.rarity)),
        archetype: text.archetype ?? archetypeFor(taxonomyOf(c, match)),
        names,
        descriptions: text.descriptions,
        photo: await bundlePhoto(text.id, biomeIds, c, text.photoObservation),
        source: { inatTaxonId: c.inatTaxonId, gbifTaxonKey: gbifKey(match)!, observations: 0 },
      },
    })
  }

  for (const biome of BIOME_IDS) {
    const species = entries
      .filter((e) => e.biomes.has(biome))
      .map((e) => ({ ...e.species, source: { ...e.species.source, observations: e.biomes.get(biome)!.count } }))
      .sort(
        (a, b) =>
          a.type.localeCompare(b.type) ||
          byObservations({ ...a, count: a.source.observations }, { ...b, count: b.source.observations }),
      )
    const file: CatalogFile = { biome, species }
    writeFileSync(join(CATALOG_DIR, `${biome}.json`), `${JSON.stringify(file, null, 2)}\n`)
  }

  const bundled = new Set(entries.map((e) => e.species.photo.file))
  for (const file of readdirSync(PHOTO_DIR)) {
    if (file.endsWith('.webp') && !bundled.has(file)) rmSync(join(PHOTO_DIR, file))
  }

  const datasets = [...usedDatasets].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  writeFileSync(
    join(CATALOG_DIR, 'gbif-derived-dataset.csv'),
    `datasetKey,occurrences\n${datasets.map(([key, n]) => `${key},${n}`).join('\n')}\n`,
  )
  console.log(`Wrote ${entries.length} species across ${BIOME_IDS.length} biomes`)
}

if (!existsSync(GRID_PATH)) throw new Error(`Missing ${GRID_PATH}`)
await main()
