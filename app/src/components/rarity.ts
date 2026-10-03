import type { Rarity } from '../domain/species'

/** Rarity tint shared by badges, the celebration burst, and species detail. */
export const RARITY_STYLES: Record<Rarity, { badge: string; ring: string; color: string }> = {
  common: { badge: 'bg-emerald-600 text-emerald-50', ring: 'ring-emerald-400', color: '#6ee7b7' },
  rare: { badge: 'bg-sky-600 text-sky-50', ring: 'ring-sky-400', color: '#7dd3fc' },
  epic: { badge: 'bg-amber-400 text-amber-950', ring: 'ring-amber-300', color: '#fcd34d' },
}
