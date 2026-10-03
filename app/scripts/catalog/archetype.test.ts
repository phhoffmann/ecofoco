import { describe, expect, it } from 'vitest'
import { archetypeFor, isMarine, type Taxonomy } from './archetype.ts'

describe('archetypeFor', () => {
  it.each<[Taxonomy, string]>([
    [{ iconicTaxon: 'Plantae', family: 'Arecaceae', genus: 'Euterpe' }, 'palm'],
    [{ iconicTaxon: 'Plantae', family: 'Bignoniaceae', genus: 'Handroanthus' }, 'flowering-tree'],
    [{ iconicTaxon: 'Plantae', family: 'Fabaceae', genus: 'Hymenaea' }, 'broadleaf-tree'],
    // A genus rule beats its family's rule.
    [{ iconicTaxon: 'Plantae', family: 'Fabaceae', genus: 'Schizolobium' }, 'pioneer-tree'],
    [{ iconicTaxon: 'Plantae', family: 'Fabaceae', genus: 'Mimosa' }, 'shrub'],
    [{ iconicTaxon: 'Plantae', family: 'Malvaceae', genus: 'Ceiba' }, 'emergent-tree'],
    [{ iconicTaxon: 'Plantae', family: 'Orchidaceae', genus: 'Cattleya' }, 'shrub'],
    [{ iconicTaxon: 'Aves', order: 'Passeriformes', family: 'Tyrannidae' }, 'songbird'],
    [{ iconicTaxon: 'Aves', order: 'Accipitriformes', family: 'Accipitridae' }, 'large-bird'],
    [{ iconicTaxon: 'Aves', order: 'Piciformes', family: 'Ramphastidae' }, 'large-bird'],
    [{ iconicTaxon: 'Aves', order: 'Psittaciformes', family: 'Psittacidae', genus: 'Ara' }, 'large-bird'],
    [{ iconicTaxon: 'Aves', order: 'Psittaciformes', family: 'Psittacidae', genus: 'Eupsittula' }, 'songbird'],
    [{ iconicTaxon: 'Mammalia', order: 'Primates' }, 'primate'],
    [{ iconicTaxon: 'Mammalia', order: 'Rodentia', genus: 'Kerodon' }, 'small-mammal'],
    [{ iconicTaxon: 'Mammalia', order: 'Rodentia', genus: 'Hydrochoerus' }, 'mid-mammal'],
    [{ iconicTaxon: 'Mammalia', order: 'Carnivora' }, 'mid-mammal'],
    [{ iconicTaxon: 'Reptilia', order: 'Squamata' }, 'reptile'],
    [{ iconicTaxon: 'Insecta', order: 'Lepidoptera' }, 'insect'],
  ])('%o → %s', (taxonomy, archetype) => {
    expect(archetypeFor(taxonomy)).toBe(archetype)
  })
})

describe('isMarine', () => {
  it('flags sea animals that wash up in coastal states', () => {
    expect(isMarine({ iconicTaxon: 'Mammalia', order: 'Carnivora', family: 'Otariidae' })).toBe(true)
    expect(isMarine({ iconicTaxon: 'Aves', order: 'Sphenisciformes' })).toBe(true)
    expect(isMarine({ iconicTaxon: 'Aves', order: 'Passeriformes', family: 'Tyrannidae' })).toBe(false)
  })
})
