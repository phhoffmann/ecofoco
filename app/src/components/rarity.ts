import type { Rarity } from '../domain/species'

/** Rarity tint shared by badges, the celebration burst, and species detail. The same in every Biome. */
export const RARITY_STYLES: Record<Rarity, { badge: string; ring: string; color: string }> = {
  common: { badge: 'bg-rarity-common text-[#05281b]', ring: 'ring-rarity-common', color: '#6ee7b7' },
  rare: { badge: 'bg-rarity-rare text-[#05243a]', ring: 'ring-rarity-rare', color: '#7dd3fc' },
  epic: { badge: 'bg-rarity-epic text-[#3a2a03]', ring: 'ring-rarity-epic', color: '#fcd34d' },
}
