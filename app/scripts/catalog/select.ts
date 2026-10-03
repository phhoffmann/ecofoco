// Pure selection rules of the catalog pipeline: licence filter, ranking, quotas, Rarity, names and photo choice.
import type { PhotoLicense, Rarity } from '../../src/domain/catalogSchema.ts'
import { MIN_PHOTO_EDGE, RARITY_SHARES } from './config.ts'

/** iNaturalist licence code → bundled licence, or null when the licence is not allowed (NC, ND, SA, all rights reserved). */
export function inatLicense(code: string | null | undefined): PhotoLicense | null {
  switch (code?.toLowerCase()) {
    case 'cc0':
      return 'CC0'
    case 'cc-by':
      return 'CC-BY'
    default:
      return null
  }
}

/** GBIF occurrence licence (a Creative Commons URL) → whether it may feed the catalog. */
export function isAllowedGbifLicense(url: string | null | undefined): boolean {
  if (!url) return false
  return /\/publicdomain\/zero\/1\.0/.test(url) || /\/licenses\/by\/4\.0/.test(url)
}

/**
 * species_counts filters for a Biome's candidates: research-grade observations with CC0/CC-BY photos of
 * species not recorded as introduced in those places.
 *
 * `introduced=false` drops only species iNaturalist lists as introduced (invasive counts as introduced);
 * `native=true` would also drop every species with no establishment record for the place, which
 * excludes well-known natives such as Handroanthus albus and Penelope obscura in the Atlantic Forest.
 */
export function speciesCountsQuery(placeIds: number[]): Record<string, string> {
  return {
    place_id: placeIds.join(','),
    quality_grade: 'research',
    introduced: 'false',
    photo_license: 'cc0,cc-by',
  }
}

export interface Ranked {
  scientificName: string
  count: number
}

/** Most-observed first; ties fall back to the scientific name so reruns pick the same species. */
export function byObservations<T extends Ranked>(a: T, b: T): number {
  return b.count - a.count || a.scientificName.localeCompare(b.scientificName)
}

/**
 * Rarity from position in the observation ranking: the most-observed 60% are common, the next 30%
 * rare and the rest epic, mirroring the Draw weights.
 */
export function rarityByRank<T extends Ranked>(species: T[]): Map<string, Rarity> {
  const ranked = [...species].sort(byObservations)
  const commonCut = Math.round(ranked.length * RARITY_SHARES.common)
  const rareCut = Math.round(ranked.length * (RARITY_SHARES.common + RARITY_SHARES.rare))
  return new Map(
    ranked.map((s, i) => [s.scientificName, i < commonCut ? 'common' : i < rareCut ? 'rare' : 'epic'] as const),
  )
}

export interface Candidate extends Ranked {
  group: string
}

/**
 * Fills each group's quota with its most-observed accepted candidates, after the pinned ones (species
 * already in the catalog, kept while they still pass). A group short of accepted candidates hands its
 * slots to the best remaining candidates of any group. `accept` is asked at most once per species.
 */
export async function fillQuotas<T extends Candidate>(
  pinned: T[],
  candidates: T[],
  quotas: Record<string, number>,
  accept: (candidate: T) => Promise<boolean>,
): Promise<{ chosen: T[]; droppedPins: T[] }> {
  const verdicts = new Map<string, boolean>()
  const accepts = async (c: T) => {
    if (!verdicts.has(c.scientificName)) verdicts.set(c.scientificName, await accept(c))
    return verdicts.get(c.scientificName)!
  }
  const chosen: T[] = []
  const isChosen = (c: T) => chosen.some((s) => s.scientificName === c.scientificName)
  const left = { ...quotas }
  const droppedPins: T[] = []

  for (const pin of pinned) {
    if (await accepts(pin)) {
      chosen.push(pin)
      left[pin.group] = (left[pin.group] ?? 0) - 1
    } else {
      droppedPins.push(pin)
    }
  }

  const ranked = [...candidates].sort(byObservations)
  for (const group of Object.keys(quotas)) {
    for (const c of ranked) {
      if (left[group] <= 0) break
      if (c.group !== group || isChosen(c) || verdicts.get(c.scientificName) === false) continue
      if (await accepts(c)) {
        chosen.push(c)
        left[group]--
      }
    }
  }

  const slots = Object.values(quotas).reduce((sum, n) => sum + n, 0)
  for (const c of ranked) {
    if (chosen.length >= slots) break
    if (isChosen(c) || verdicts.get(c.scientificName) === false || !(c.group in quotas)) continue
    if (await accepts(c)) chosen.push(c)
  }

  return { chosen, droppedPins }
}

const capitalize = (name: string) => name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1)
// English names are Title Case ("Great Kiskadee"); Portuguese ones capitalize only the first word ("Bem-te-vi").
const titleCase = (name: string) => name.split(' ').map(capitalize).join(' ')

/** Display name: hand-edited override, then iNaturalist's common name, then GBIF's vernacular name, then the scientific name. */
export function pickName(sources: {
  locale: 'en' | 'pt-BR'
  override?: string
  inat?: string | null
  gbif?: string | null
  scientificName: string
}): string {
  if (sources.override?.trim()) return sources.override.trim()
  const name = [sources.inat, sources.gbif].find((n) => n && n.trim())?.trim()
  if (!name) return sources.scientificName
  return sources.locale === 'en' ? titleCase(name) : capitalize(name)
}

/** Stable-looking id suggestion for a new species, from its Portuguese name (ids never change once committed). */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export interface ObservationPhoto {
  id: number
  license_code: string | null
  url: string
  attribution: string
  original_dimensions?: { width: number; height: number } | null
  hidden?: boolean
  flags?: unknown[]
}

export interface Observation {
  id: number
  uri: string
  faves_count?: number
  user: { login: string; name?: string | null }
  photos: ObservationPhoto[]
}

export interface ChosenPhoto {
  photoId: number
  mediumUrl: string
  license: PhotoLicense
  credit: string
  sourceUrl: string
}

/** "(c) Jane Doe, some rights reserved (CC BY)" → "Jane Doe". */
export function creditFromAttribution(attribution: string, fallback: string): string {
  const match = /^\(c\)\s*(.+?),\s*(?:some|no) rights reserved/i.exec(attribution)
  return match?.[1].trim() || fallback
}

const isLandscape = (p: ObservationPhoto) =>
  !p.original_dimensions || p.original_dimensions.width >= p.original_dimensions.height
// Small originals are usually crops of distant, blurry subjects.
const isSharpEnough = (p: ObservationPhoto) =>
  !p.original_dimensions || Math.max(p.original_dimensions.width, p.original_dimensions.height) >= MIN_PHOTO_EDGE

/**
 * Picks the bundled photo from research-grade observations (never the taxon's default photo): CC0/CC-BY
 * only, unflagged, large originals first, then the most-faved observation, then landscape before portrait.
 */
export function choosePhoto(observations: Observation[]): ChosenPhoto | null {
  const options = observations.flatMap((o, order) =>
    o.photos
      .filter((p) => inatLicense(p.license_code) && !p.hidden && !p.flags?.length)
      .map((p, position) => ({ o, p, order, position })),
  )
  options.sort(
    (a, b) =>
      Number(isSharpEnough(b.p)) - Number(isSharpEnough(a.p)) ||
      (b.o.faves_count ?? 0) - (a.o.faves_count ?? 0) ||
      Number(isLandscape(b.p)) - Number(isLandscape(a.p)) ||
      a.order - b.order ||
      a.position - b.position,
  )
  const best = options[0]
  if (!best) return null
  return {
    photoId: best.p.id,
    mediumUrl: best.p.url.replace(/\/square\.(\w+)$/, '/medium.$1'),
    license: inatLicense(best.p.license_code)!,
    credit: creditFromAttribution(best.p.attribution, best.o.user.name || best.o.user.login),
    sourceUrl: best.o.uri,
  }
}
