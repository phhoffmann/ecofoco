/**
 * Hand-edited species data — the catalog's "manual override column". Keyed by scientific name.
 *
 * Every species the pipeline selects needs an entry here: a stable `id` (collected entries point at it,
 * so never change one) and 1–2 short original sentences per locale. Never paste Wikipedia or other
 * CC-BY-SA text. The optional fields override what the pipeline derives:
 *   names      display names (otherwise iNaturalist → GBIF vernacular → scientific name)
 *   archetype  garden sprite (otherwise mapped from taxonomy in archetype.ts)
 *   rarity     Rarity tier (otherwise from the observation-count ranking)
 *   keepIn     Biomes the species was already in: it keeps its slot there while it passes the native,
 *              licence and presence filters, ahead of the ranking
 *   photoObservation  iNaturalist observation to take the photo from, when the automatic pick is poor
 */
import type { Archetype, BiomeId, Rarity } from '../../src/domain/catalogSchema.ts'
import type { Locale } from '../../src/i18n/locale.ts'

export interface SpeciesText {
  id: string
  descriptions: Record<Locale, string>
  names?: Partial<Record<Locale, string>>
  archetype?: Archetype
  rarity?: Rarity
  keepIn?: BiomeId[]
  photoObservation?: number
}

export const SPECIES_TEXT: Record<string, SpeciesText> = {
  // From the first Atlantic Forest and Caatinga catalogs
  'Pleroma granulosum': {
    id: 'quaresmeira',
    keepIn: ['atlantic-forest'],
    archetype: 'flowering-tree',
    names: { en: 'Glory Bush Tree', 'pt-BR': 'Quaresmeira' },
    descriptions: {
      en: 'Atlantic Forest native that covers hillsides in vivid purple flowers around Lent, which gives it its Portuguese name.',
      'pt-BR': 'Nativa da Mata Atlântica, cobre as encostas de flores roxas vibrantes por volta da Quaresma, época que lhe dá o nome.',
    },
  },
  'Paubrasilia echinata': {
    id: 'pau-brasil',
    keepIn: ['atlantic-forest'],
    archetype: 'broadleaf-tree',
    names: { en: 'Brazilwood', 'pt-BR': 'Pau-brasil' },
    descriptions: {
      en: 'The tree that gave Brazil its name — its reddish heartwood was historically prized for dye and is still used today for violin bows.',
      'pt-BR': 'A árvore que deu nome ao Brasil — seu cerne avermelhado era historicamente usado como corante e ainda hoje é usado na fabricação de arcos de violino.',
    },
  },
  'Cariniana legalis': {
    id: 'jequitiba-rosa',
    keepIn: ['atlantic-forest'],
    archetype: 'emergent-tree',
    names: { en: 'Giant Jequitibá', 'pt-BR': 'Jequitibá-rosa' },
    descriptions: {
      en: 'One of the tallest trees in the Atlantic Forest, capable of living over a thousand years and towering well above the surrounding canopy.',
      'pt-BR': 'Uma das árvores mais altas da Mata Atlântica, capaz de viver mais de mil anos e se destacar bem acima do dossel da floresta.',
    },
  },
  'Euterpe edulis': {
    id: 'palmito-jucara',
    keepIn: ['atlantic-forest'],
    archetype: 'palm',
    names: { en: 'Juçara Palm', 'pt-BR': 'Palmito-juçara' },
    descriptions: {
      en: 'A slow-growing palm whose heart is a prized delicacy; overharvesting for palm hearts has made it endangered in the wild.',
      'pt-BR': 'Uma palmeira de crescimento lento cujo palmito é uma iguaria valorizada; a extração excessiva a deixou ameaçada de extinção na natureza.',
    },
  },
  'Ocotea puberula': {
    id: 'canela-guaica',
    keepIn: ['atlantic-forest'],
    archetype: 'broadleaf-tree',
    names: { en: 'Guaicá Laurel', 'pt-BR': 'Canela-guaicá' },
    descriptions: {
      en: 'A fast-growing native tree in the laurel family, often one of the first species to colonize forest clearings after disturbance.',
      'pt-BR': 'Árvore nativa de crescimento rápido da família das lauráceas, geralmente uma das primeiras a colonizar clareiras na floresta.',
    },
  },
  'Handroanthus impetiginosus': {
    id: 'ipe-roxo',
    keepIn: ['atlantic-forest'],
    archetype: 'flowering-tree',
    names: { en: 'Pink Trumpet Tree', 'pt-BR': 'Ipê-roxo' },
    descriptions: {
      en: 'Blooms in vivid pink-purple in late winter; its dense, durable wood is also prized for flooring and heavy construction.',
      'pt-BR': 'Floresce em tons vibrantes de rosa-roxo no final do inverno; sua madeira densa e durável também é usada em pisos e construção pesada.',
    },
  },
  'Cecropia pachystachya': {
    id: 'embauba',
    keepIn: ['atlantic-forest'],
    archetype: 'pioneer-tree',
    names: { en: 'Cecropia', 'pt-BR': 'Embaúba' },
    descriptions: {
      en: 'A fast-growing pioneer tree with distinctive umbrella-shaped leaves, an important food source for sloths and toucans alike.',
      'pt-BR': 'Árvore pioneira de crescimento rápido com folhas em formato de guarda-chuva, importante fonte de alimento para preguiças e tucanos.',
    },
  },
  'Schizolobium parahyba': {
    id: 'guapuruvu',
    keepIn: ['atlantic-forest'],
    archetype: 'pioneer-tree',
    names: { en: 'Brazilian Fern Tree', 'pt-BR': 'Guapuruvu' },
    descriptions: {
      en: 'One of the fastest-growing native trees in Brazil, with huge fern-like leaves and bright yellow flower spikes.',
      'pt-BR': 'Uma das árvores nativas de crescimento mais rápido do Brasil, com folhas enormes parecidas com samambaia e espigas de flores amarelas.',
    },
  },
  'Schinus terebinthifolia': {
    id: 'aroeira-pimenteira',
    keepIn: ['atlantic-forest'],
    archetype: 'shrub',
    names: { en: 'Brazilian Pepper Tree', 'pt-BR': 'Aroeira-pimenteira' },
    descriptions: {
      en: 'Produces small red berries resembling pink peppercorns; considered invasive outside Brazil, but native and ecologically important here.',
      'pt-BR': 'Produz pequenas bagas vermelhas parecidas com pimenta-rosa; considerada invasora fora do Brasil, mas nativa e ecologicamente importante aqui.',
    },
  },
  'Callithrix penicillata': {
    id: 'sagui-de-tufo-preto',
    keepIn: ['atlantic-forest'],
    archetype: 'primate',
    names: { en: 'Black-tufted Marmoset', 'pt-BR': 'Sagui-de-tufo-preto' },
    descriptions: {
      en: 'A small, highly social marmoset recognizable by the black tufts of fur around its ears, common in urban parks and forest edges.',
      'pt-BR': 'Um pequeno sagui muito social, reconhecível pelos tufos pretos de pelo ao redor das orelhas, comum em parques urbanos e bordas de mata.',
    },
  },
  'Pitangus sulphuratus': {
    id: 'bem-te-vi',
    keepIn: ['atlantic-forest'],
    archetype: 'songbird',
    names: { en: 'Great Kiskadee', 'pt-BR': 'Bem-te-vi' },
    descriptions: {
      en: 'A loud, bold yellow-bellied flycatcher whose call sounds like it\'s saying its own name — one of Brazil\'s most familiar birds.',
      'pt-BR': 'Ave insetívora barulhenta e destemida, de peito amarelo, cujo canto parece dizer o próprio nome — uma das aves mais conhecidas do Brasil.',
    },
  },
  'Didelphis aurita': {
    id: 'gamba-de-orelha-preta',
    keepIn: ['atlantic-forest'],
    archetype: 'small-mammal',
    names: { en: 'Black-eared Opossum', 'pt-BR': 'Gambá-de-orelha-preta' },
    descriptions: {
      en: 'A nocturnal marsupial and one of Brazil\'s only native marsupial groups; it famously plays dead when threatened.',
      'pt-BR': 'Marsupial noturno e um dos poucos representantes nativos dos marsupiais no Brasil; conhecido por fingir de morto quando ameaçado.',
    },
  },
  'Ramphastos dicolorus': {
    id: 'tucano-de-bico-verde',
    keepIn: ['atlantic-forest'],
    archetype: 'large-bird',
    names: { en: 'Red-breasted Toucan', 'pt-BR': 'Tucano-de-bico-verde' },
    descriptions: {
      en: 'A striking toucan with a green-and-orange bill, feeding mainly on fruit and playing a key role in dispersing forest seeds.',
      'pt-BR': 'Tucano marcante de bico verde e laranja, alimenta-se principalmente de frutas e tem papel importante na dispersão de sementes.',
    },
  },
  'Nasua nasua': {
    id: 'quati',
    keepIn: ['atlantic-forest'],
    archetype: 'mid-mammal',
    names: { en: 'South American Coati', 'pt-BR': 'Quati' },
    descriptions: {
      en: 'A raccoon relative that forages in noisy troops during the day, using its long flexible snout to dig for insects and fruit.',
      'pt-BR': 'Parente do guaxinim que forrageia em bandos barulhentos durante o dia, usando o focinho longo e flexível para procurar insetos e frutas.',
    },
  },
  'Salvator merianae': {
    id: 'lagarto-teiu',
    keepIn: ['atlantic-forest'],
    archetype: 'reptile',
    names: { en: 'Black-and-white Tegu', 'pt-BR': 'Lagarto-teiú' },
    descriptions: {
      en: 'One of South America\'s largest lizards, an opportunistic omnivore that can grow over a meter long.',
      'pt-BR': 'Um dos maiores lagartos da América do Sul, onívoro oportunista que pode ultrapassar um metro de comprimento.',
    },
  },
  'Turdus rufiventris': {
    id: 'sabia-laranjeira',
    keepIn: ['atlantic-forest'],
    archetype: 'songbird',
    names: { en: 'Rufous-bellied Thrush', 'pt-BR': 'Sabiá-laranjeira' },
    descriptions: {
      en: 'Brazil\'s national bird, known for its rich, melodic song sung at dawn and dusk.',
      'pt-BR': 'Ave símbolo do Brasil, conhecida pelo canto rico e melodioso entoado ao amanhecer e ao entardecer.',
    },
  },
  'Morpho helenor': {
    id: 'borboleta-azul',
    keepIn: ['atlantic-forest'],
    archetype: 'insect',
    names: { en: 'Blue Morpho', 'pt-BR': 'Borboleta-azul' },
    descriptions: {
      en: 'Famous for its dazzling iridescent blue wings, a shimmer caused by light-scattering scales rather than any actual pigment.',
      'pt-BR': 'Famosa pelas asas azuis iridescentes deslumbrantes, um brilho causado por escamas que dispersam a luz, e não por pigmento.',
    },
  },
  'Cavia aperea': {
    id: 'prea',
    keepIn: ['atlantic-forest'],
    archetype: 'small-mammal',
    names: { en: 'Brazilian Guinea Pig', 'pt-BR': 'Preá' },
    descriptions: {
      en: 'A wild relative of the guinea pig, living in grassy areas in small family groups and mostly active at dawn and dusk.',
      'pt-BR': 'Parente selvagem do porquinho-da-índia, vive em áreas de vegetação rasteira em pequenos grupos familiares, mais ativo ao amanhecer e ao entardecer.',
    },
  },
  'Cereus jamacaru': {
    id: 'mandacaru',
    keepIn: ['caatinga'],
    archetype: 'shrub',
    names: { en: 'Mandacaru Cactus', 'pt-BR': 'Mandacaru' },
    descriptions: {
      en: 'A towering columnar cactus and symbol of the sertão; people say that when it blooms, rain is on the way.',
      'pt-BR': 'Cacto colunar imponente e símbolo do sertão; o povo diz que, quando ele floresce, a chuva está para chegar.',
    },
  },
  'Xiquexique gounellei': {
    id: 'xique-xique',
    keepIn: ['caatinga'],
    archetype: 'shrub',
    names: { en: 'Xique-xique Cactus', 'pt-BR': 'Xique-xique' },
    descriptions: {
      en: 'A spiny cactus that sprawls over bare rock; in long droughts its spines are singed off so cattle can eat the stems.',
      'pt-BR': 'Cacto espinhoso que se espalha sobre as rochas; nas secas longas, os espinhos são queimados para o gado comer os caules.',
    },
  },
  'Mimosa tenuiflora': {
    id: 'jurema-preta',
    keepIn: ['caatinga'],
    archetype: 'pioneer-tree',
    names: { en: 'Black Jurema', 'pt-BR': 'Jurema-preta' },
    descriptions: {
      en: 'A thorny pioneer shrub, among the first to reclaim degraded Caatinga and enrich poor soil with nitrogen.',
      'pt-BR': 'Arbusto pioneiro e espinhoso, um dos primeiros a ocupar áreas degradadas da Caatinga e enriquecer o solo com nitrogênio.',
    },
  },
  'Cenostigma pyramidale': {
    id: 'catingueira',
    keepIn: ['caatinga'],
    archetype: 'broadleaf-tree',
    names: { en: 'Catingueira', 'pt-BR': 'Catingueira' },
    descriptions: {
      en: 'One of the most common Caatinga trees, with strong-smelling leaves that sprout within days of the first rain.',
      'pt-BR': 'Uma das árvores mais comuns da Caatinga, de folhas com cheiro forte que brotam poucos dias depois da primeira chuva.',
    },
  },
  'Pilosocereus pachycladus': {
    id: 'facheiro',
    keepIn: ['caatinga'],
    archetype: 'shrub',
    names: { en: 'Facheiro Cactus', 'pt-BR': 'Facheiro' },
    descriptions: {
      en: 'A tall, bluish candelabra cactus whose woolly tips open night flowers pollinated by bats.',
      'pt-BR': 'Cacto alto e azulado em forma de candelabro, com pontas lanosas onde abrem flores noturnas polinizadas por morcegos.',
    },
  },
  'Melocactus zehntneri': {
    id: 'coroa-de-frade',
    keepIn: ['caatinga'],
    archetype: 'shrub',
    names: { en: 'Turk\'s Cap Cactus', 'pt-BR': 'Coroa-de-frade' },
    descriptions: {
      en: 'A small globe cactus crowned by a red, woolly cap where its flowers and fruits appear.',
      'pt-BR': 'Pequeno cacto globoso coroado por um cefálio vermelho e lanoso, de onde saem suas flores e frutos.',
    },
  },
  'Cnidoscolus quercifolius': {
    id: 'faveleira',
    keepIn: ['caatinga'],
    archetype: 'pioneer-tree',
    names: { en: 'Faveleira', 'pt-BR': 'Faveleira' },
    descriptions: {
      en: 'A drought-hardy tree covered in stinging hairs; its oil-rich seeds feed people and wildlife in the sertão.',
      'pt-BR': 'Árvore resistente à seca, coberta de pelos urticantes; suas sementes ricas em óleo alimentam gente e bichos no sertão.',
    },
  },
  'Tabebuia aurea': {
    id: 'craibeira',
    keepIn: ['caatinga'],
    archetype: 'flowering-tree',
    names: { en: 'Silver Trumpet Tree', 'pt-BR': 'Craibeira' },
    descriptions: {
      en: 'Lines the dry riverbeds of the sertão and lights them up with golden flowers in the dry season.',
      'pt-BR': 'Acompanha os leitos de rios secos do sertão e os ilumina com flores douradas na estação seca.',
    },
  },
  'Erythrina velutina': {
    id: 'mulungu',
    keepIn: ['caatinga'],
    archetype: 'flowering-tree',
    names: { en: 'Mulungu Coral Tree', 'pt-BR': 'Mulungu' },
    descriptions: {
      en: 'Bursts into coral-red flowers on bare branches in the dry season, drawing hummingbirds and parakeets.',
      'pt-BR': 'Explode em flores vermelho-coral nos galhos sem folhas da estação seca, atraindo beija-flores e periquitos.',
    },
  },
  'Ceiba glaziovii': {
    id: 'barriguda',
    keepIn: ['caatinga'],
    archetype: 'emergent-tree',
    names: { en: 'Bottle Tree', 'pt-BR': 'Barriguda' },
    descriptions: {
      en: 'A kapok relative with a swollen, water-storing trunk that carries it through months without rain.',
      'pt-BR': 'Parente da paineira com tronco dilatado que armazena água e a ajuda a atravessar meses sem chuva.',
    },
  },
  'Patagioenas picazuro': {
    id: 'asa-branca',
    photoObservation: 198220270,
    keepIn: ['caatinga'],
    archetype: 'songbird',
    names: { en: 'Picazuro Pigeon', 'pt-BR': 'Asa-branca' },
    descriptions: {
      en: 'The bird of Luiz Gonzaga\'s famous song; its flocks leave the sertão in droughts and return with the rains.',
      'pt-BR': 'A ave da famosa canção de Luiz Gonzaga; seus bandos deixam o sertão na seca e voltam com as chuvas.',
    },
  },
  'Caracara plancus': {
    id: 'carcara',
    keepIn: ['caatinga'],
    archetype: 'large-bird',
    names: { en: 'Southern Crested Caracara', 'pt-BR': 'Carcará' },
    descriptions: {
      en: 'A bold, opportunistic falcon that walks the ground as often as it flies, eating anything from carrion to insects.',
      'pt-BR': 'Falcão ousado e oportunista que anda pelo chão tanto quanto voa, comendo de carniça a insetos.',
    },
  },
  'Paroaria dominicana': {
    id: 'galo-de-campina',
    keepIn: ['caatinga'],
    archetype: 'songbird',
    names: { en: 'Red-cowled Cardinal', 'pt-BR': 'Galo-de-campina' },
    descriptions: {
      en: 'A Northeast Brazil endemic with a bright red head, usually seen in pairs in open scrub.',
      'pt-BR': 'Endêmico do Nordeste, de cabeça vermelho-viva, costuma ser visto aos pares na vegetação aberta.',
    },
  },
  'Callithrix jacchus': {
    id: 'sagui-de-tufo-branco',
    photoObservation: 192070034,
    keepIn: ['caatinga'],
    archetype: 'primate',
    names: { en: 'Common Marmoset', 'pt-BR': 'Sagui-de-tufo-branco' },
    descriptions: {
      en: 'A small marmoset with white ear tufts that gnaws tree bark to feed on gum, native to the Northeast.',
      'pt-BR': 'Pequeno sagui de tufos brancos nas orelhas que rói a casca das árvores para comer goma; nativo do Nordeste.',
    },
  },
  'Tropidurus hispidus': {
    id: 'calango',
    keepIn: ['caatinga'],
    archetype: 'reptile',
    names: { en: 'Peters\' Lava Lizard', 'pt-BR': 'Calango' },
    descriptions: {
      en: 'The lizard basking on every rock and wall of the sertão, bobbing its head to warn off rivals.',
      'pt-BR': 'O lagarto que toma sol em toda pedra e muro do sertão, balançando a cabeça para afastar rivais.',
    },
  },
  'Kerodon rupestris': {
    id: 'moco',
    keepIn: ['caatinga'],
    archetype: 'small-mammal',
    names: { en: 'Rock Cavy', 'pt-BR': 'Mocó' },
    descriptions: {
      en: 'A rodent found only in the Caatinga, living among rocky outcrops and climbing trees with surprising agility.',
      'pt-BR': 'Roedor que só existe na Caatinga, vive entre lajedos e sobe em árvores com agilidade surpreendente.',
    },
  },
  'Cerdocyon thous': {
    id: 'cachorro-do-mato',
    keepIn: ['caatinga'],
    archetype: 'mid-mammal',
    names: { en: 'Crab-eating Fox', 'pt-BR': 'Cachorro-do-mato' },
    descriptions: {
      en: 'A mostly nocturnal wild canid that eats fruit, insects and small animals, often hunting in pairs.',
      'pt-BR': 'Canídeo silvestre de hábitos sobretudo noturnos que come frutos, insetos e pequenos animais, muitas vezes caçando aos pares.',
    },
  },
  'Eupsittula cactorum': {
    id: 'periquito-da-caatinga',
    keepIn: ['caatinga'],
    archetype: 'songbird',
    names: { en: 'Cactus Parakeet', 'pt-BR': 'Periquito-da-caatinga' },
    descriptions: {
      en: 'A noisy green parakeet of the Caatinga that feeds on cactus fruit and seeds.',
      'pt-BR': 'Periquito verde e barulhento da Caatinga que se alimenta de frutos de cactos e sementes.',
    },
  },
  'Anodorhynchus leari': {
    id: 'arara-azul-de-lear',
    keepIn: ['caatinga'],
    archetype: 'large-bird',
    names: { en: 'Lear\'s Macaw', 'pt-BR': 'Arara-azul-de-lear' },
    descriptions: {
      en: 'An endangered indigo macaw found only in northern Bahia, nesting in sandstone cliffs and feeding on licuri palm nuts.',
      'pt-BR': 'Arara azul ameaçada de extinção que só vive no norte da Bahia, faz ninhos em paredões de arenito e come coquinhos de licuri.',
    },
  },
  'Tolypeutes tricinctus': {
    id: 'tatu-bola',
    keepIn: ['caatinga'],
    archetype: 'mid-mammal',
    names: { en: 'Brazilian Three-banded Armadillo', 'pt-BR': 'Tatu-bola' },
    descriptions: {
      en: 'The only armadillo that rolls into a perfect ball; found only in Brazil and the mascot of the 2014 World Cup.',
      'pt-BR': 'O único tatu que se fecha numa bola perfeita; só existe no Brasil e foi mascote da Copa do Mundo de 2014.',
    },
  },

  // Amazon
  'Mauritia flexuosa': {
    id: 'buriti',
    names: { en: 'Moriche Palm' },
    descriptions: {
      en: 'A tall palm that grows in wet ground and swamps, where its scaly reddish fruits feed macaws, tapirs and people alike.',
      'pt-BR': 'Palmeira alta de áreas alagadas e veredas, cujos frutos escamosos e avermelhados alimentam araras, antas e pessoas.',
    },
  },
  'Pontederia crassipes': {
    id: 'aguape',
    names: { en: 'Water Hyacinth', 'pt-BR': 'Aguapé' },
    descriptions: {
      en: 'A floating plant with swollen leaf stalks that act as buoys; its lilac flowers carpet calm rivers and lagoons.',
      'pt-BR': 'Planta flutuante com pecíolos inchados que funcionam como boias; suas flores lilás cobrem rios e lagoas de águas calmas.',
    },
  },
  'Palicourea tomentosa': {
    id: 'palicourea-tomentosa',
    names: { en: 'Hot Lips', 'pt-BR': 'Palicourea tomentosa' },
    descriptions: {
      en: 'An understory shrub famous for its bright red bracts shaped like a pair of lips, which draw hummingbirds to the small flowers inside.',
      'pt-BR': 'Arbusto do sub-bosque famoso pelas brácteas vermelhas em forma de lábios, que atraem beija-flores para as pequenas flores do meio.',
    },
  },
  'Tridax procumbens': {
    id: 'erva-de-touro',
    descriptions: {
      en: 'A low, hairy daisy with cream flower heads on long stalks, common along paths and in open sunny ground.',
      'pt-BR': 'Pequena margarida rasteira e peluda, de flores creme em hastes longas, comum em beiras de caminho e terrenos abertos.',
    },
  },
  'Turnera subulata': {
    id: 'xanana',
    descriptions: {
      en: 'A small shrub whose cream flowers with a dark centre open in the morning and close by midday.',
      'pt-BR': 'Pequeno arbusto de flores creme com centro escuro, que abrem pela manhã e se fecham perto do meio-dia.',
    },
  },
  'Anacardium occidentale': {
    id: 'caju',
    descriptions: {
      en: 'The cashew tree: the juicy "fruit" is a swollen stalk, and the real fruit is the kidney-shaped nut hanging below it.',
      'pt-BR': 'O cajueiro: a parte suculenta é um pedúnculo inchado, e o fruto verdadeiro é a castanha em forma de rim pendurada embaixo.',
    },
  },
  'Euterpe oleracea': {
    id: 'acai',
    descriptions: {
      en: 'A slender, clump-forming palm of flooded forests whose dark purple berries become the famous açaí pulp.',
      'pt-BR': 'Palmeira fina que cresce em touceiras nas matas de várzea; seus frutos roxo-escuros viram a famosa polpa de açaí.',
    },
  },
  'Cecropia membranacea': {
    id: 'imbauba-verde',
    names: { en: 'Imbaúba-verde', 'pt-BR': 'Imbaúba-verde' },
    descriptions: {
      en: 'A fast-growing pioneer of riverbanks and clearings, with huge hand-shaped leaves and hollow stems often home to ants.',
      'pt-BR': 'Pioneira de crescimento rápido em margens de rio e clareiras, com folhas enormes em forma de mão e caule oco, muitas vezes habitado por formigas.',
    },
  },
  'Ceiba pentandra': {
    id: 'mafumeira',
    descriptions: {
      en: 'A giant with buttressed roots that rises above the canopy; its pods release seeds wrapped in silky fibre.',
      'pt-BR': 'Gigante de raízes tabulares que se ergue acima da copa da floresta; seus frutos liberam sementes envoltas em uma paina sedosa.',
    },
  },
  'Helosis cayennensis': {
    id: 'urupe',
    descriptions: {
      en: 'A parasitic plant with no green leaves that lives on tree roots and only shows itself as small red, club-shaped flower heads on the forest floor.',
      'pt-BR': 'Planta parasita sem folhas verdes que vive nas raízes das árvores e só aparece como pequenas inflorescências vermelhas em forma de clava no chão da mata.',
    },
  },
  'Miconia crenata': {
    id: 'pixirica',
    names: { en: 'Soapbush' },
    descriptions: {
      en: 'A hairy shrub of disturbed ground with deeply veined leaves and small blue-black berries eaten by birds.',
      'pt-BR': 'Arbusto peludo de áreas abertas, com folhas de nervuras marcadas e pequenos frutos negro-azulados comidos por aves.',
    },
  },
  'Bactris gasipaes': {
    id: 'pupunheira',
    names: { en: 'Peach Palm' },
    descriptions: {
      en: 'A spiny palm domesticated by Amazonian peoples thousands of years ago for its starchy orange fruit and its palm heart.',
      'pt-BR': 'Palmeira espinhosa domesticada por povos amazônicos há milhares de anos pelos frutos alaranjados e pelo palmito.',
    },
  },
  'Bixa orellana': {
    id: 'urucum',
    names: { en: 'Annatto' },
    descriptions: {
      en: 'A shrub with spiky red pods full of seeds coated in a bright red dye, used as body paint and as a food colouring.',
      'pt-BR': 'Arbusto de frutos vermelhos e espinhentos cheios de sementes cobertas por um corante vermelho, usado como pintura corporal e como colorau.',
    },
  },
  'Heliconia psittacorum': {
    id: 'heliconia-papagaio',
    descriptions: {
      en: 'A small heliconia with orange-and-green bracts shaped like a parrot’s beak, visited by hummingbirds.',
      'pt-BR': 'Pequena helicônia de brácteas laranja e verdes em forma de bico de papagaio, visitada por beija-flores.',
    },
  },
  'Mimosa pudica': {
    id: 'dormideira',
    descriptions: {
      en: 'Touch it and its leaflets fold up in seconds, a defence that makes grazing animals think twice.',
      'pt-BR': 'Basta tocar para que seus folíolos se fechem em segundos, uma defesa que desanima os animais que tentam comê-la.',
    },
  },
  'Socratea exorrhiza': {
    id: 'paxiubinha',
    descriptions: {
      en: 'A palm that stands on a cone of stilt roots, lifting its trunk above the wet forest floor.',
      'pt-BR': 'Palmeira que se apoia em um cone de raízes-escora, erguendo o tronco acima do chão úmido da floresta.',
    },
  },
  'Cecropia latiloba': {
    id: 'imbaubarana',
    names: { en: 'Imbaubarana', 'pt-BR': 'Imbaubarana' },
    descriptions: {
      en: 'An embaúba of the várzea that withstands months of flooding, with huge leaves that are pale underneath.',
      'pt-BR': 'Embaúba da várzea que suporta meses de cheia, com folhas enormes e esbranquiçadas na face de baixo.',
    },
  },
  'Couroupita guianensis': {
    id: 'abrico-de-macaco',
    names: { en: 'Cannonball Tree' },
    descriptions: {
      en: 'Its fragrant pink flowers and heavy round fruits grow straight from the trunk, like cannonballs hanging on ropes.',
      'pt-BR': 'Suas flores rosadas e perfumadas e seus frutos redondos e pesados nascem direto do tronco, como balas de canhão penduradas.',
    },
  },
  'Montrichardia linifera': {
    id: 'aninga',
    descriptions: {
      en: 'A tall aroid with arrow-shaped leaves that forms dense stands along muddy riverbanks of the lower Amazon.',
      'pt-BR': 'Arácea alta de folhas em forma de seta que forma grandes moitas nas margens lamacentas dos rios do baixo Amazonas.',
    },
  },
  'Phlebodium decumanum': {
    id: 'rabo-de-guariba',
    names: { en: 'Golden Polypody' },
    descriptions: {
      en: 'A big fern that creeps over tree trunks on thick rhizomes covered in golden-brown scales.',
      'pt-BR': 'Samambaia grande que se espalha pelos troncos com rizomas grossos cobertos de escamas castanho-douradas.',
    },
  },
  'Coragyps atratus': {
    id: 'urubu-preto',
    descriptions: {
      en: 'Black vultures soar in groups and find carrion by watching each other, cleaning up cities and fields alike.',
      'pt-BR': 'O urubu plana em bandos e encontra carcaças observando os companheiros, fazendo a limpeza de cidades e campos.',
    },
  },
  'Thraupis episcopus': {
    id: 'sanhaco-da-amazonia',
    photoObservation: 291177935,
    names: { 'pt-BR': 'Sanhaço-da-amazônia' },
    descriptions: {
      en: 'A pale blue-grey tanager with brighter wing patches, common in gardens and forest edges.',
      'pt-BR': 'Sanhaço azul-acinzentado com manchas mais vivas nas asas, comum em quintais e bordas de mata.',
    },
  },
  'Thraupis palmarum': {
    id: 'sanhaco-do-coqueiro',
    descriptions: {
      en: 'An olive-grey tanager that often feeds and nests in the crowns of palm trees.',
      'pt-BR': 'Sanhaço verde-acinzentado que costuma se alimentar e fazer ninho na copa de palmeiras.',
    },
  },
  'Ardea alba': {
    id: 'garca-branca-grande',
    descriptions: {
      en: 'A tall, all-white heron with a yellow bill that stands still in shallow water before spearing fish.',
      'pt-BR': 'Garça alta, toda branca e de bico amarelo, que fica imóvel na água rasa antes de arpoar peixes.',
    },
  },
  'Tyrannus melancholicus': {
    id: 'suiriri',
    descriptions: {
      en: 'A yellow-bellied flycatcher that sits on exposed perches and sallies out to snatch insects in mid-air.',
      'pt-BR': 'Papa-moscas de barriga amarela que pousa em galhos expostos e sai em voos curtos para capturar insetos no ar.',
    },
  },
  'Ramphastos tucanus': {
    id: 'tucano-de-peito-branco',
    descriptions: {
      en: 'A large toucan with a white throat and a huge dark bill; its yelping call carries far over the Amazon canopy.',
      'pt-BR': 'Tucano grande de garganta branca e bico enorme e escuro; seu canto em ganidos ecoa longe sobre a copa da floresta.',
    },
  },
  'Monasa nigrifrons': {
    id: 'chora-chuva-preto',
    descriptions: {
      en: 'A dark grey bird with a coral-red bill that lives in noisy groups along forest rivers.',
      'pt-BR': 'Ave cinza-escura de bico vermelho-coral que vive em grupos barulhentos nas matas ao longo dos rios.',
    },
  },
  'Ramphocelus carbo': {
    id: 'pipira-vermelha',
    descriptions: {
      en: 'The male looks black until the light reveals deep crimson, set off by a gleaming silver lower bill.',
      'pt-BR': 'O macho parece preto até a luz revelar o vermelho-escuro, realçado pela base do bico branco-prateada.',
    },
  },
  'Dasyprocta leporina': {
    id: 'cutia-de-crista',
    descriptions: {
      en: 'A long-legged rodent that buries seeds to eat later and forgets some, planting new trees.',
      'pt-BR': 'Roedor de pernas longas que enterra sementes para comer depois e esquece algumas, plantando novas árvores.',
    },
  },
  'Pteronura brasiliensis': {
    id: 'ariranha',
    descriptions: {
      en: 'The world’s longest otter lives in noisy family groups that hunt fish together in rivers and lakes.',
      'pt-BR': 'A maior lontra do mundo vive em grupos familiares barulhentos que caçam peixes juntos em rios e lagos.',
    },
  },
  'Bradypus variegatus': {
    id: 'preguica-comum',
    descriptions: {
      en: 'A three-toed sloth that moves so slowly algae grow in its fur, coming down only about once a week.',
      'pt-BR': 'Preguiça de três dedos tão lenta que algas crescem em seu pelo; desce da árvore só cerca de uma vez por semana.',
    },
  },
  'Sapajus apella': {
    id: 'macaco-prego-castanho',
    descriptions: {
      en: 'A clever capuchin that cracks hard nuts and fruits by banging them against branches.',
      'pt-BR': 'Macaco-prego esperto que quebra cocos e frutos duros batendo-os contra os galhos.',
    },
  },
  'Saimiri sciureus': {
    id: 'macaco-de-cheiro',
    descriptions: {
      en: 'A small, yellow-armed monkey that travels in large, chattering troops in search of insects and fruit.',
      'pt-BR': 'Macaco pequeno de braços amarelados que anda em bandos grandes e falantes atrás de insetos e frutas.',
    },
  },
  'Ameiva ameiva': {
    id: 'calango-verde',
    descriptions: {
      en: 'A fast, green-backed lizard that forages actively in sunny clearings, flicking its tongue to find insects.',
      'pt-BR': 'Lagarto rápido de dorso verde que caça ativamente em clareiras ensolaradas, usando a língua para achar insetos.',
    },
  },
  'Podocnemis expansa': {
    id: 'tartaruga-da-amazonia',
    names: { 'pt-BR': 'Tartaruga-da-amazônia' },
    descriptions: {
      en: 'South America’s largest river turtle; females gather by the thousands to lay eggs on sandbanks in the dry season.',
      'pt-BR': 'A maior tartaruga de rio da América do Sul; as fêmeas se reúnem aos milhares para desovar nas praias de areia na seca.',
    },
  },
  'Caiman crocodilus': {
    id: 'jacaretinga',
    descriptions: {
      en: 'A medium-sized caiman named for the bony ridge between its eyes, like the bridge of a pair of glasses.',
      'pt-BR': 'Jacaré de porte médio com uma crista óssea entre os olhos que lembra a ponte de um par de óculos.',
    },
  },
  'Anartia jatrophae': {
    id: 'borboleta-pavao-branco',
    descriptions: {
      en: 'A pale butterfly with small eyespots that flutters low over weedy fields and lawns.',
      'pt-BR': 'Borboleta clara com pequenos ocelos que voa baixo sobre gramados e terrenos com mato.',
    },
  },
  'Anartia amathea': {
    id: 'borboleta-pavao-escarlate',
    descriptions: {
      en: 'A dark butterfly with bold scarlet bands, often seen sipping nectar in gardens and pastures.',
      'pt-BR': 'Borboleta escura com faixas vermelho-vivas, vista com frequência tomando néctar em jardins e pastos.',
    },
  },
  'Marpesia chiron': {
    id: 'marpesia-chiron',
    names: { 'pt-BR': 'Marpesia chiron' },
    descriptions: {
      en: 'A brown, striped butterfly with long tails on its hindwings; groups drink minerals from wet sand by rivers.',
      'pt-BR': 'Borboleta marrom e listrada com caudas longas nas asas posteriores; grupos bebem sais minerais na areia úmida dos rios.',
    },
  },
  'Ascia monuste': {
    id: 'borboleta-da-couve',
    photoObservation: 186904817,
    descriptions: {
      en: 'A white butterfly with dark wing edges whose caterpillars feed on kale and other cabbage-family plants.',
      'pt-BR': 'Borboleta branca de bordas escuras nas asas, cujas lagartas comem couve e outras plantas da família do repolho.',
    },
  },
  // Atlantic Forest
  'Araucaria angustifolia': {
    id: 'araucaria',
    names: { en: 'Paraná Pine', 'pt-BR': 'Araucária' },
    descriptions: {
      en: 'The candelabra-shaped conifer of Brazil’s southern highlands, whose pinhão seeds feed jays, parrots and people through the winter.',
      'pt-BR': 'A conífera em forma de candelabro do planalto sul, cujos pinhões alimentam gralhas, papagaios e pessoas durante o inverno.',
    },
  },
  'Tillandsia stricta': {
    id: 'tillandsia-stricta',
    photoObservation: 167775008,
    descriptions: {
      en: 'A small air plant that clings to branches and wires, sending up pink bracts with violet flowers.',
      'pt-BR': 'Pequena bromélia que se prende a galhos e fios, soltando brácteas rosadas com flores violeta.',
    },
  },
  'Aechmea nudicaulis': {
    id: 'chupa-chupa',
    descriptions: {
      en: 'A tube-shaped bromeliad whose red flower stalk carries yellow flowers; rainwater in its cup shelters frogs and insects.',
      'pt-BR': 'Bromélia em forma de tubo com haste floral vermelha e flores amarelas; a água acumulada no copo abriga sapos e insetos.',
    },
  },
  'Cecropia glaziovii': {
    id: 'embauba-vermelha',
    names: { en: 'Red Embaúba', 'pt-BR': 'Embaúba-vermelha' },
    descriptions: {
      en: 'A pioneer of Atlantic Forest slopes with reddish leaf buds; sloths and many birds come for its leaves and fruit spikes.',
      'pt-BR': 'Pioneira das encostas da Mata Atlântica, de brotos avermelhados; preguiças e muitas aves vêm atrás de suas folhas e frutos.',
    },
  },
  'Ipomoea cairica': {
    id: 'campainha',
    descriptions: {
      en: 'A climbing morning glory with hand-shaped leaves and lilac funnel flowers that open in the morning.',
      'pt-BR': 'Trepadeira de folhas em forma de mão e flores lilás em funil que se abrem pela manhã.',
    },
  },
  'Asclepias curassavica': {
    id: 'oficial-de-sala',
    descriptions: {
      en: 'A milkweed with red-and-orange flowers whose toxic sap protects the monarch caterpillars that feed on it.',
      'pt-BR': 'Planta de flores vermelhas e laranja cuja seiva tóxica protege as lagartas da borboleta-monarca que se alimentam dela.',
    },
  },
  'Thaumatophyllum bipinnatifidum': {
    id: 'banana-de-imbe',
    names: { 'pt-BR': 'Banana-de-imbé' },
    descriptions: {
      en: 'A large philodendron with deeply cut leaves that grows on rocks and trees and drops long aerial roots.',
      'pt-BR': 'Filodendro grande de folhas muito recortadas que cresce sobre pedras e árvores, soltando longas raízes aéreas.',
    },
  },
  'Solanum americanum': {
    id: 'maria-pretinha',
    descriptions: {
      en: 'A small nightshade with white star-shaped flowers and clusters of shiny black berries.',
      'pt-BR': 'Pequena erva de flores brancas em forma de estrela e cachos de frutinhos pretos e brilhantes.',
    },
  },
  'Tillandsia recurvata': {
    id: 'tillandsia-recurvata',
    // iNaturalist calls it Cravo-do-mato too, like Tillandsia stricta in the same Biomes.
    names: { en: 'Ball Moss', 'pt-BR': 'Tillandsia recurvata' },
    descriptions: {
      en: 'Not a moss at all but a tiny bromeliad that forms grey balls on branches and power lines, living on air and rain.',
      'pt-BR': 'Pequena bromélia que forma bolinhas cinzentas em galhos e fios de luz, vivendo apenas de ar e chuva.',
    },
  },
  'Tillandsia tricholepis': {
    id: 'tillandsia-tricholepis',
    names: { en: 'Tillandsia tricholepis', 'pt-BR': 'Tillandsia tricholepis' },
    descriptions: {
      en: 'A tiny, scaly air plant that forms moss-like mats on twigs and rocks.',
      'pt-BR': 'Bromélia minúscula e escamosa que forma tapetes parecidos com musgo sobre galhos e pedras.',
    },
  },
  'Syagrus romanzoffiana': {
    id: 'jeriva',
    names: { en: 'Queen Palm' },
    descriptions: {
      en: 'A common native palm whose orange coconuts are a staple for parrots, squirrels and many other animals.',
      'pt-BR': 'Palmeira nativa comum cujos coquinhos alaranjados são alimento básico de papagaios, serelepes e muitos outros bichos.',
    },
  },
  'Sicalis flaveola': {
    id: 'canario-da-terra',
    descriptions: {
      en: 'A bright yellow finch with an orange forehead that sings from rooftops and feeds on seeds in open ground.',
      'pt-BR': 'Pássaro amarelo-vivo de testa alaranjada que canta dos telhados e come sementes em áreas abertas.',
    },
  },
  'Leptotila verreauxi': {
    id: 'juriti-pupu',
    photoObservation: 193600813,
    descriptions: {
      en: 'A ground-feeding dove whose low, hollow "hoo-oo" call is heard from forest edges.',
      'pt-BR': 'Pomba que se alimenta no chão e cujo canto grave e oco ecoa nas bordas de mata.',
    },
  },
  'Tachyphonus coronatus': {
    id: 'tie-preto',
    descriptions: {
      en: 'The glossy black male hides a red crown patch, while the female is reddish brown.',
      'pt-BR': 'O macho, preto e brilhante, esconde uma mancha vermelha no alto da cabeça; a fêmea é marrom-avermelhada.',
    },
  },
  'Vanellus chilensis': {
    id: 'quero-quero',
    descriptions: {
      en: 'A loud lapwing of lawns and fields that dives at anyone who comes near its nest on the ground.',
      'pt-BR': 'Ave barulhenta de gramados e campos que dá rasantes em quem se aproxima do seu ninho no chão.',
    },
  },
  'Sapajus nigritus': {
    id: 'macaco-prego-preto',
    descriptions: {
      en: 'A dark capuchin with two tufts on its head, from the southern Atlantic Forest, that forages in groups for fruit, insects and palm hearts.',
      'pt-BR': 'Macaco-prego escuro com dois tufos na cabeça, do sul da Mata Atlântica, que procura em bando frutos, insetos e palmito.',
    },
  },
  'Tropidurus catalanensis': {
    id: 'teiniagua',
    descriptions: {
      en: 'A collared lizard of rocky outcrops in southern Brazil that basks on stones and walls.',
      'pt-BR': 'Lagarto de colar dos afloramentos rochosos do sul do Brasil, que toma sol em pedras e muros.',
    },
  },
  'Tropidurus torquatus': {
    id: 'tropiduro-comum',
    descriptions: {
      en: 'A sturdy lizard with a black collar that is everywhere in sunny yards, sandy coasts and rocks.',
      'pt-BR': 'Lagarto robusto de colar preto, presente em quintais ensolarados, restingas e pedras.',
    },
  },
  'Tetragonisca angustula': {
    id: 'jatai',
    names: { 'pt-BR': 'Jataí' },
    descriptions: {
      en: 'A tiny stingless bee that builds a wax entrance tube to its nest and makes a prized honey.',
      'pt-BR': 'Abelha sem ferrão minúscula que constrói um tubinho de cera na entrada do ninho e produz um mel muito apreciado.',
    },
  },

  // Caatinga
  'Caladium bicolor': {
    id: 'tinhorao',
    names: { en: 'Angel Wings' },
    descriptions: {
      en: 'An aroid with heart-shaped leaves splashed in red, pink or white, which dies back to a tuber in the dry season.',
      'pt-BR': 'Arácea de folhas em forma de coração manchadas de vermelho, rosa ou branco, que some na seca e rebrota do tubérculo.',
    },
  },
  'Palicourea colorata': {
    id: 'perpetua-do-mato',
    names: { en: 'Perpétua-do-mato' },
    descriptions: {
      en: 'An understory shrub whose colourful flower clusters draw hummingbirds along forest edges.',
      'pt-BR': 'Arbusto do sub-bosque cujos cachos de flores coloridas atraem beija-flores nas bordas de mata.',
    },
  },
  'Melocactus ernestii': {
    id: 'coroa-de-frade-agulha',
    photoObservation: 135175188,
    names: { en: 'Needle Turk\'s Cap' },
    descriptions: {
      en: 'A round cactus with long, needle-like spines; once mature it grows a woolly, bristly cap where its flowers appear.',
      'pt-BR': 'Cacto redondo de espinhos longos como agulhas; quando adulto forma uma "coroa" lanosa e cheia de cerdas onde nascem as flores.',
    },
  },
  'Tacinga inamoena': {
    id: 'quipa',
    names: { en: 'Quipá' },
    descriptions: {
      en: 'A low, sprawling prickly-pear relative with orange flowers and yellow fruits eaten by animals of the sertão.',
      'pt-BR': 'Cacto baixo e rasteiro, parente da palma, de flores alaranjadas e frutos amarelos comidos pelos bichos do sertão.',
    },
  },
  'Ipomoea asarifolia': {
    id: 'salsa-brava',
    descriptions: {
      en: 'A creeping morning glory with round, leathery leaves and purple flowers, common on sandy ground; toxic to livestock.',
      'pt-BR': 'Trepadeira rasteira de folhas redondas e coriáceas e flores roxas, comum em solo arenoso; é tóxica para o gado.',
    },
  },
  'Centratherum punctatum': {
    id: 'perpetua-roxa',
    descriptions: {
      en: 'A small herb with fluffy lilac flower heads that last a long time, framed by leafy bracts.',
      'pt-BR': 'Erva pequena de inflorescências lilás e felpudas que duram bastante, rodeadas por brácteas verdes.',
    },
  },
  'Fluvicola nengeta': {
    id: 'lavadeira-mascarada',
    descriptions: {
      en: 'A white flycatcher with a black eye-stripe that hops along the edges of ponds and puddles looking for insects.',
      'pt-BR': 'Papa-moscas branco com uma faixa preta nos olhos que anda saltitando na beira de açudes e poças atrás de insetos.',
    },
  },
  'Hydrochoerus hydrochaeris': {
    id: 'capivara',
    descriptions: {
      en: 'The world’s largest rodent, a calm grazer that lives in groups near water and swims well.',
      'pt-BR': 'O maior roedor do mundo, um herbívoro tranquilo que vive em grupos perto da água e nada muito bem.',
    },
  },
  'Tropidurus semitaeniatus': {
    id: 'lagartixa-de-lajeiro',
    names: { en: 'Striped Lava Lizard', 'pt-BR': 'Lagartixa-de-lajeiro' },
    descriptions: {
      en: 'A flat-bodied, striped lizard that slips into narrow cracks of the granite outcrops of the Caatinga.',
      'pt-BR': 'Lagarto achatado e listrado que se esconde nas fendas estreitas dos lajedos de granito da Caatinga.',
    },
  },
  'Iguana iguana': {
    id: 'iguana-verde',
    descriptions: {
      en: 'A large, plant-eating lizard with a spiny crest that basks in trees near water and drops in to escape danger.',
      'pt-BR': 'Lagarto grande e herbívoro, de crista espinhosa, que toma sol em árvores perto da água e mergulha para fugir do perigo.',
    },
  },
  'Burnsius orcus': {
    id: 'burnsius-orcus',
    names: { 'pt-BR': 'Burnsius orcus' },
    descriptions: {
      en: 'A small black-and-white checkered skipper that darts low over weedy, open ground.',
      'pt-BR': 'Pequena borboleta quadriculada de preto e branco que voa rápido e baixo sobre terrenos abertos.',
    },
  },
  'Hamadryas feronia': {
    id: 'borboleta-estaladeira',
    names: { en: 'Variable Cracker' },
    descriptions: {
      en: 'A grey, bark-patterned butterfly that rests head-down on tree trunks and makes clicking sounds with its wings in flight.',
      'pt-BR': 'Borboleta cinza que imita a casca das árvores, pousa de cabeça para baixo nos troncos e estala as asas ao voar.',
    },
  },
  'Cycloneda sanguinea': {
    id: 'joaninha-sem-pintas',
    descriptions: {
      en: 'A spotless red ladybird that hunts aphids on garden and crop plants.',
      'pt-BR': 'Joaninha vermelha sem pintas que caça pulgões em hortas e plantações.',
    },
  },
  // Cerrado
  'Palicourea rigida': {
    id: 'bate-caixa',
    names: { en: 'Bate-caixa' },
    descriptions: {
      en: 'A gnarled Cerrado shrub with stiff, leathery leaves and yellow-and-red tubular flowers loved by hummingbirds.',
      'pt-BR': 'Arbusto retorcido do Cerrado, de folhas duras e coriáceas e flores tubulares amarelas e vermelhas, adoradas pelos beija-flores.',
    },
  },
  'Aechmea bromeliifolia': {
    id: 'abacaxi-de-tingir',
    names: { en: 'Abacaxi-de-tingir' },
    descriptions: {
      en: 'A ground bromeliad of savannas and dry forests with a woolly, cone-shaped flower spike that turns from white to yellow and black.',
      'pt-BR': 'Bromélia terrestre de cerrados e matas secas, com uma inflorescência lanosa em forma de cone que passa de branca a amarela e preta.',
    },
  },
  'Periandra mediterranea': {
    id: 'alcacuz-do-cerrado',
    names: { en: 'Brazilian Licorice', 'pt-BR': 'Alcaçuz-do-cerrado' },
    descriptions: {
      en: 'A small legume with blue-violet pea flowers and sweet-tasting roots, common in open Cerrado grassland.',
      'pt-BR': 'Pequena leguminosa de flores azul-violeta e raízes de sabor adocicado, comum nos campos abertos do Cerrado.',
    },
  },
  'Solanum lycocarpum': {
    id: 'lobeira',
    names: { en: 'Wolf Apple' },
    descriptions: {
      en: 'A spiny shrub with big green fruits that make up a large part of the maned wolf’s diet, which spreads its seeds.',
      'pt-BR': 'Arbusto espinhoso de frutos verdes e grandes que formam boa parte da dieta do lobo-guará, que espalha suas sementes.',
    },
  },
  'Miconia albicans': {
    id: 'canela-de-velho',
    names: { en: 'Canela-de-velho' },
    descriptions: {
      en: 'A Cerrado shrub with leaves white-felted underneath and small berries that many birds eat.',
      'pt-BR': 'Arbusto do Cerrado de folhas com a face de baixo branca e felpuda, e frutinhos que muitas aves comem.',
    },
  },
  'Augusta longifolia': {
    id: 'augusta-longifolia',
    descriptions: {
      en: 'A riverside shrub with narrow leaves and long white tubular flowers that grows among rocks in streams.',
      'pt-BR': 'Arbusto de beira de rio, de folhas estreitas e flores brancas, longas e tubulares, que cresce entre as pedras dos córregos.',
    },
  },
  'Acrocomia aculeata': {
    id: 'macauba',
    names: { en: 'Macaw Palm' },
    descriptions: {
      en: 'A spiny-trunked palm of open country whose oily yellow fruits feed macaws, cattle and people.',
      'pt-BR': 'Palmeira de tronco espinhoso das áreas abertas, cujos frutos amarelos e oleosos alimentam araras, gado e gente.',
    },
  },
  'Cambessedesia hilariana': {
    id: 'cambessedesia-hilariana',
    descriptions: {
      en: 'A small shrub of rocky Cerrado highlands with bright red-and-yellow star-shaped flowers.',
      'pt-BR': 'Pequeno arbusto dos campos rochosos de altitude do Cerrado, com flores em estrela vermelhas e amarelas.',
    },
  },
  'Justicia lanstyakii': {
    id: 'justicia-lanstyakii',
    descriptions: {
      en: 'A small shrub of dry forests and Cerrado whose tubular flowers are visited by hummingbirds.',
      'pt-BR': 'Pequeno arbusto de matas secas e do Cerrado cujas flores tubulares são visitadas por beija-flores.',
    },
  },
  'Xylopia aromatica': {
    id: 'pimenta-de-macaco',
    names: { en: 'Monkey Pepper', 'pt-BR': 'Pimenta-de-macaco' },
    descriptions: {
      en: 'A slender Cerrado tree whose small, peppery fruits open to show black seeds on a red lining.',
      'pt-BR': 'Árvore esguia do Cerrado cujos frutinhos picantes se abrem mostrando sementes pretas sobre um fundo vermelho.',
    },
  },
  'Pyrostegia venusta': {
    id: 'flor-de-sao-joao',
    names: { en: 'Flame Vine' },
    descriptions: {
      en: 'A climber that covers fences and trees in bright orange tubular flowers in winter, around the June festivals.',
      'pt-BR': 'Trepadeira que cobre cercas e árvores de flores tubulares laranja-vivo no inverno, na época das festas juninas.',
    },
  },
  'Vochysia elliptica': {
    id: 'gomeirinha',
    names: { en: 'Gomeirinha' },
    descriptions: {
      en: 'A small Cerrado tree with yellow flower spikes, typical of rocky slopes and grasslands.',
      'pt-BR': 'Arvoreta do Cerrado com cachos de flores amarelas, típica de encostas pedregosas e campos.',
    },
  },
  'Manihot peltata': {
    id: 'manihot-peltata',
    descriptions: {
      en: 'A wild relative of cassava from the Cerrado, with round leaves attached to the stalk at their centre.',
      'pt-BR': 'Parente silvestre da mandioca no Cerrado, de folhas arredondadas presas ao pecíolo pelo centro.',
    },
  },
  'Paepalanthus chiquitensis': {
    id: 'chuveirinho',
    names: { en: 'Chuveirinho' },
    descriptions: {
      en: 'An "everlasting" with a spray of tiny white flower heads on thin stalks, like a little shower head, in wet Cerrado grasslands.',
      'pt-BR': 'Sempre-viva com um feixe de pequenas cabecinhas brancas em hastes finas, como um chuveirinho, nos campos úmidos do Cerrado.',
    },
  },
  'Pilosocereus machrisii': {
    id: 'facheiro-do-cerrado',
    names: { en: 'Cerrado Facheiro' },
    descriptions: {
      en: 'A columnar cactus that grows among rocks in the Cerrado; its night-blooming flowers are pollinated by bats.',
      'pt-BR': 'Cacto colunar que cresce entre as pedras do Cerrado; suas flores noturnas são polinizadas por morcegos.',
    },
  },
  'Discocactus pseudoinsignis': {
    id: 'roseta-do-diabo',
    names: { en: 'Roseta-do-diabo', 'pt-BR': 'Roseta-do-diabo' },
    descriptions: {
      en: 'A flat, disc-shaped cactus of sandy Cerrado ground; its white, fragrant flowers open at night.',
      'pt-BR': 'Cacto achatado em forma de disco dos solos arenosos do Cerrado; suas flores brancas e perfumadas abrem à noite.',
    },
  },
  'Stilpnia cayana': {
    id: 'saira-amarela',
    descriptions: {
      en: 'A buff-gold tanager with a dark mask and turquoise wings, common in Cerrado woodland and city parks.',
      'pt-BR': 'Saíra dourada com máscara escura e asas azul-turquesa, comum no cerrado e em parques urbanos.',
    },
  },
  'Furnarius rufus': {
    id: 'joao-de-barro',
    names: { 'pt-BR': 'João-de-barro' },
    descriptions: {
      en: 'The ovenbird builds a domed clay nest like a little wood-fired oven on posts and branches.',
      'pt-BR': 'O joão-de-barro constrói um ninho de barro em forma de forninho sobre postes e galhos.',
    },
  },
  'Eupetomena macroura': {
    id: 'beija-flor-tesoura',
    descriptions: {
      en: 'A large, shimmering blue-green hummingbird with a long forked tail that chases rivals away from flowers.',
      'pt-BR': 'Beija-flor grande, verde-azulado e brilhante, de cauda longa e bifurcada, que expulsa os rivais das flores.',
    },
  },
  'Psittacara leucophthalmus': {
    id: 'periquitao',
    descriptions: {
      en: 'A green parakeet with red shoulder flecks that flies in loud flocks and roosts in palms and buildings.',
      'pt-BR': 'Periquito verde com pintas vermelhas nos ombros que voa em bandos barulhentos e dorme em palmeiras e prédios.',
    },
  },
  'Mimus saturninus': {
    id: 'sabia-do-campo',
    descriptions: {
      en: 'A grey-brown mockingbird with a white eyebrow that sings loudly and imitates other birds.',
      'pt-BR': 'Sabiá cinza-amarronzado de sobrancelha branca que canta alto e imita outras aves.',
    },
  },
  'Didelphis albiventris': {
    id: 'gamba-de-orelha-branca',
    descriptions: {
      en: 'An adaptable opossum with white ears that carries its young in a pouch and eats almost anything.',
      'pt-BR': 'Gambá adaptável de orelhas brancas que carrega os filhotes no marsúpio e come quase de tudo.',
    },
  },
  'Chrysocyon brachyurus': {
    id: 'lobo-guara',
    descriptions: {
      en: 'South America’s tallest wild canid, with long black legs for seeing over the grass; it eats both small animals and fruit.',
      'pt-BR': 'O maior canídeo da América do Sul, de pernas pretas e longas para enxergar acima do capim; come pequenos animais e frutos.',
    },
  },
  'Crotalus durissus': {
    id: 'cascavel',
    names: { 'pt-BR': 'Cascavel' },
    descriptions: {
      en: 'A venomous rattlesnake of open country that warns intruders with the rattle at the tip of its tail.',
      'pt-BR': 'Serpente peçonhenta de áreas abertas que avisa os intrusos com o chocalho na ponta da cauda.',
    },
  },
  'Boa constrictor': {
    id: 'jiboia',
    photoObservation: 330226584,
    descriptions: {
      en: 'A large, non-venomous snake that kills its prey by squeezing; it hunts at night by ambush.',
      'pt-BR': 'Serpente grande e sem peçonha que mata as presas por constrição; caça à noite, de tocaia.',
    },
  },
  'Callicore sorana': {
    id: 'borboleta-oitenta',
    photoObservation: 75088498,
    descriptions: {
      en: 'Its underside shows a pattern that reads like the number 80; the upperside is black with red and blue.',
      'pt-BR': 'A face de baixo das asas tem um desenho que lembra o número 80; a de cima é preta com vermelho e azul.',
    },
  },
  'Nhambikuara cerradensis': {
    id: 'nhambikuara-cerradensis',
    names: { en: 'Nhambikuara cerradensis', 'pt-BR': 'Nhambikuara cerradensis' },
    descriptions: {
      en: 'A small brown satyr butterfly of the Cerrado grasslands, described by science only in recent years.',
      'pt-BR': 'Pequena borboleta marrom dos campos do Cerrado, descrita pela ciência há poucos anos.',
    },
  },
  'Brassolis sophorae': {
    id: 'lagarta-das-palmeiras',
    descriptions: {
      en: 'A big brown owl-like butterfly; its caterpillars live in silk shelters in palm crowns and eat the fronds.',
      'pt-BR': 'Borboleta marrom e grande; suas lagartas vivem em abrigos de seda na copa das palmeiras e comem as folhas.',
    },
  },

  // Pantanal
  'Copernicia alba': {
    id: 'caranda',
    names: { en: 'Caranday Palm' },
    descriptions: {
      en: 'A fan palm that forms vast groves on the seasonally flooded plains of the Pantanal.',
      'pt-BR': 'Palmeira de folhas em leque que forma grandes carandazais nas planícies alagáveis do Pantanal.',
    },
  },
  'Pontederia azurea': {
    id: 'aguape-de-cordao',
    names: { en: 'Anchored Water Hyacinth', 'pt-BR': 'Aguapé-de-cordão' },
    descriptions: {
      en: 'A water hyacinth rooted in the mud whose long stems float out over the water, with blue-violet fringed flowers.',
      'pt-BR': 'Aguapé enraizado no lodo cujos ramos longos flutuam sobre a água, com flores azul-violeta franjadas.',
    },
  },
  'Acrocomia totai': {
    id: 'bocaiuva',
    names: { en: 'Totai Palm' },
    descriptions: {
      en: 'A spiny palm whose sweet, oily fruits are eaten fresh or made into flour in Mato Grosso do Sul.',
      'pt-BR': 'Palmeira espinhosa de frutos doces e oleosos, comidos frescos ou transformados em farinha no Mato Grosso do Sul.',
    },
  },
  'Bromelia balansae': {
    id: 'caraguata',
    names: { 'pt-BR': 'Caraguatá' },
    descriptions: {
      en: 'A spiny ground bromeliad whose inner leaves turn bright red when it flowers.',
      'pt-BR': 'Bromélia terrestre espinhosa cujas folhas centrais ficam vermelho-vivas quando floresce.',
    },
  },
  'Curatella americana': {
    id: 'lixeira',
    names: { en: 'Sandpaper Tree', 'pt-BR': 'Lixeira' },
    descriptions: {
      en: 'A twisted savanna tree whose leaves are so rough they were once used as sandpaper.',
      'pt-BR': 'Árvore retorcida do cerrado cujas folhas são tão ásperas que já foram usadas como lixa.',
    },
  },
  'Pistia stratiotes': {
    id: 'alface-d-agua',
    names: { 'pt-BR': 'Alface-d\'água' },
    descriptions: {
      en: 'A floating rosette of velvety leaves, like a head of lettuce, drifting on calm waters.',
      'pt-BR': 'Roseta flutuante de folhas aveludadas, como um pé de alface, que deriva em águas calmas.',
    },
  },
  'Commelina erecta': {
    id: 'trapoeraba',
    names: { en: 'Whitemouth Dayflower' },
    descriptions: {
      en: 'A dayflower with two sky-blue petals; each flower opens for just one morning.',
      'pt-BR': 'Erva de duas pétalas azul-celeste; cada flor abre por uma única manhã.',
    },
  },
  'Cereus stenogonus': {
    id: 'mandacaru-de-fruto-alaranjado',
    photoObservation: 198163369,
    names: { en: 'Orange-fruited Mandacaru' },
    descriptions: {
      en: 'A tall, branching cactus of dry woodlands with big white night flowers and orange fruits.',
      'pt-BR': 'Cacto alto e ramificado das matas secas, com grandes flores brancas noturnas e frutos alaranjados.',
    },
  },
  'Tillandsia loliacea': {
    id: 'barba-de-bode',
    names: { en: 'Barba-de-bode', 'pt-BR': 'Barba-de-bode' },
    descriptions: {
      en: 'A tiny grey air plant that grows in clumps on branches and cacti of dry forests.',
      'pt-BR': 'Bromélia cinzenta minúscula que cresce em tufos sobre galhos e cactos das matas secas.',
    },
  },
  'Tillandsia didisticha': {
    id: 'tillandsia-didisticha',
    descriptions: {
      en: 'An air plant with silvery leaves and a flattened flower spike that grows on trees in dry forests.',
      'pt-BR': 'Bromélia de folhas prateadas e inflorescência achatada, que cresce sobre árvores das matas secas.',
    },
  },
  'Camonea umbellata': {
    id: 'camonea-umbellata',
    names: { en: 'Yellow Merremia' },
    descriptions: {
      en: 'A twining vine related to morning glories, with clusters of yellow funnel flowers.',
      'pt-BR': 'Trepadeira parente das ipomeias, com cachos de flores amarelas em forma de funil.',
    },
  },
  'Handroanthus heptaphyllus': {
    id: 'ipe-roxo-de-sete-folhas',
    names: { en: 'Pink Ipê' },
    descriptions: {
      en: 'A trumpet tree whose bare branches burst into pink flowers in the dry season, painting the Pantanal landscape.',
      'pt-BR': 'Ipê cujos galhos sem folhas se cobrem de flores rosadas na seca, colorindo a paisagem do Pantanal.',
    },
  },
  'Ipomoea carnea': {
    id: 'algodao-bravo',
    names: { en: 'Bush Morning Glory' },
    descriptions: {
      en: 'A shrubby morning glory with pink funnel flowers that forms thickets in wetlands; poisonous to livestock.',
      'pt-BR': 'Ipomeia arbustiva de flores cor-de-rosa que forma moitas em áreas úmidas; é venenosa para o gado.',
    },
  },
  'Langsdorffia hypogaea': {
    id: 'erva-de-veado',
    names: { en: 'Erva-de-veado' },
    descriptions: {
      en: 'A strange root parasite without leaves that only appears above ground as a red, fleshy flower head.',
      'pt-BR': 'Planta parasita de raízes, sem folhas, que só aparece acima do solo como uma inflorescência vermelha e carnosa.',
    },
  },
  'Tillandsia duratii': {
    id: 'tillandsia-duratii',
    descriptions: {
      en: 'An air plant with curling grey leaves that wrap around twigs like tendrils, and fragrant lavender flowers.',
      'pt-BR': 'Bromélia de folhas cinzentas e enroladas que se prendem aos galhos como gavinhas, com flores lilás perfumadas.',
    },
  },
  'Jabiru mycteria': {
    id: 'tuiuiu',
    names: { 'pt-BR': 'Tuiuiú' },
    descriptions: {
      en: 'The giant stork that symbolises the Pantanal, with a bare black head and a red band at the base of its neck.',
      'pt-BR': 'A cegonha gigante símbolo do Pantanal, de cabeça preta e pelada e uma faixa vermelha na base do pescoço.',
    },
  },
  'Tigrisoma lineatum': {
    id: 'soco-boi',
    descriptions: {
      en: 'A heron with a rufous neck and finely barred plumage that stands motionless for long periods while hunting.',
      'pt-BR': 'Garça de pescoço ferrugíneo e plumagem finamente barrada que fica imóvel por muito tempo enquanto caça.',
    },
  },
  'Ardea cocoi': {
    id: 'garca-moura',
    descriptions: {
      en: 'South America’s largest heron, grey with a black cap, that wades slowly after big fish.',
      'pt-BR': 'A maior garça da América do Sul, cinza de boné preto, que caminha devagar na água atrás de peixes grandes.',
    },
  },
  'Ramphastos toco': {
    id: 'tucano-toco',
    descriptions: {
      en: 'The largest toucan, with a huge orange bill that also helps it shed heat.',
      'pt-BR': 'O maior dos tucanos, de bico laranja enorme que também ajuda a dissipar o calor do corpo.',
    },
  },
  'Crax fasciolata': {
    id: 'mutum-de-penacho',
    descriptions: {
      en: 'A turkey-sized forest bird; the male is black with a curly crest and a yellow bill base, the female barred.',
      'pt-BR': 'Ave florestal do tamanho de um peru; o macho é preto, de topete crespo e base do bico amarela, e a fêmea é barrada.',
    },
  },
  'Panthera onca': {
    id: 'onca-pintada',
    names: { 'pt-BR': 'Onça-pintada' },
    descriptions: {
      en: 'The Americas’ biggest cat has a bite strong enough to crack turtle shells, and it swims well after caimans and capybaras.',
      'pt-BR': 'O maior felino das Américas tem mordida capaz de quebrar casco de tartaruga e nada bem atrás de jacarés e capivaras.',
    },
  },
  'Blastocerus dichotomus': {
    id: 'cervo-do-pantanal',
    names: { 'pt-BR': 'Cervo-do-pantanal' },
    descriptions: {
      en: 'South America’s largest deer, with wide-splaying hooves for walking in marshes.',
      'pt-BR': 'O maior cervo da América do Sul, com cascos que se abrem bastante para andar em áreas alagadas.',
    },
  },
  'Caiman yacare': {
    id: 'jacare-do-pantanal',
    names: { 'pt-BR': 'Jacaré-do-pantanal' },
    descriptions: {
      en: 'The caiman of the Pantanal gathers in great numbers in the shrinking pools of the dry season.',
      'pt-BR': 'O jacaré do Pantanal se concentra aos montes nas lagoas que encolhem durante a seca.',
    },
  },
  'Hamadryas februa': {
    id: 'estaladeira-cinzenta',
    descriptions: {
      en: 'A grey cracker butterfly that blends in with bark and snaps its wings with an audible click.',
      'pt-BR': 'Borboleta estaladeira cinzenta que se camufla na casca das árvores e estala as asas fazendo um clique audível.',
    },
  },
  'Tropidacris collaris': {
    id: 'gafanhoto-soldadinho',
    photoObservation: 324729173,
    descriptions: {
      en: 'One of the world’s largest grasshoppers, with bright violet-blue hindwings that flash in flight.',
      'pt-BR': 'Um dos maiores gafanhotos do mundo, com asas posteriores azul-violeta que brilham ao voar.',
    },
  },

  // Pampa
  'Tillandsia geminiflora': {
    id: 'tillandsia-geminiflora',
    descriptions: {
      en: 'An air plant with soft green rosettes and a pink spike of tiny violet flowers, common on trees in the south.',
      'pt-BR': 'Bromélia de rosetas verdes e macias e inflorescência rosada de florzinhas violeta, comum nas árvores do sul.',
    },
  },
  'Tillandsia aeranthos': {
    id: 'cravo-do-ar',
    names: { en: 'Cravo-do-ar' },
    descriptions: {
      en: 'A stiff, spiky air plant with deep pink bracts and blue-violet flowers that grows on trees, rocks and fences.',
      'pt-BR': 'Bromélia rígida e pontuda, de brácteas rosa-escuras e flores azul-violeta, que cresce em árvores, pedras e cercas.',
    },
  },
  'Erythrina crista-galli': {
    id: 'corticeira-do-banhado',
    names: { en: 'Cockspur Coral Tree', 'pt-BR': 'Corticeira-do-banhado' },
    descriptions: {
      en: 'A riverside tree with corky bark and crimson flowers; it is the national flower of Argentina and Uruguay.',
      'pt-BR': 'Árvore de beira de rio com casca de cortiça e flores vermelho-carmim; é a flor nacional da Argentina e do Uruguai.',
    },
  },
  'Eugenia uniflora': {
    id: 'pitangueira',
    names: { en: 'Pitanga' },
    descriptions: {
      en: 'A shrub with ribbed red cherries that taste sweet and tangy; its leaves smell spicy when crushed.',
      'pt-BR': 'Arbusto de frutinhos vermelhos e gomados, de sabor doce e azedinho; as folhas têm cheiro forte quando amassadas.',
    },
  },
  'Sisyrinchium micranthum': {
    id: 'canchalagua',
    names: { en: 'Blue-eyed Grass' },
    descriptions: {
      en: 'A grass-like iris with tiny flowers, white to lilac with a yellow eye, that dot the grasslands in spring.',
      'pt-BR': 'Pequena irídea parecida com capim, de florzinhas brancas a lilás com centro amarelo, que pontilham os campos na primavera.',
    },
  },
  'Sagittaria montevidensis': {
    id: 'aguape-flecha',
    descriptions: {
      en: 'A marsh plant with arrow-shaped leaves and white flowers with a dark purple spot at the base of each petal.',
      'pt-BR': 'Planta de banhado com folhas em forma de flecha e flores brancas com uma mancha roxo-escura na base de cada pétala.',
    },
  },
  'Aspilia montevidensis': {
    id: 'mal-me-quer-do-campo',
    names: { en: 'Mal-me-quer-do-campo' },
    descriptions: {
      en: 'A rough-leaved daisy of the southern grasslands with bright yellow flower heads.',
      'pt-BR': 'Margarida de folhas ásperas dos campos sulinos, com flores amarelo-vivas.',
    },
  },
  'Lantana camara': {
    id: 'cambara',
    names: { en: 'Lantana', 'pt-BR': 'Cambará' },
    descriptions: {
      en: 'A shrub whose flower clusters change colour from yellow to orange and red, guiding butterflies to fresh nectar.',
      'pt-BR': 'Arbusto cujos buquês de flores mudam de amarelo para laranja e vermelho, guiando as borboletas até o néctar fresco.',
    },
  },
  'Aechmea recurvata': {
    id: 'aechmea-recurvata',
    descriptions: {
      en: 'A compact bromeliad whose central leaves turn scarlet when it blooms.',
      'pt-BR': 'Bromélia compacta cujas folhas centrais ficam escarlates quando floresce.',
    },
  },
  'Nymphoides humboldtiana': {
    id: 'estrela-branca',
    names: { en: 'Water Snowflake' },
    descriptions: {
      en: 'A floating-leaved water plant with small white flowers whose petals are fringed like snowflakes.',
      'pt-BR': 'Planta aquática de folhas flutuantes e pequenas flores brancas com pétalas franjadas como flocos de neve.',
    },
  },
  'Herbertia lahue': {
    id: 'herbertia',
    names: { 'pt-BR': 'Herbértia' },
    descriptions: {
      en: 'A small bulb of the grasslands with violet, three-petalled flowers that appear in spring.',
      'pt-BR': 'Pequena planta bulbosa dos campos, de flores violeta com três pétalas maiores, que aparecem na primavera.',
    },
  },
  'Passiflora caerulea': {
    id: 'maracuja-azul',
    names: { en: 'Blue Passionflower' },
    descriptions: {
      en: 'A climbing passionflower with a crown of blue-and-white filaments; its orange fruit is edible but bland.',
      'pt-BR': 'Maracujá trepador com uma coroa de filamentos azuis e brancos; seu fruto alaranjado é comestível, mas sem graça.',
    },
  },
  'Cereus hildmannianus': {
    id: 'mandacaru-de-fruto-amarelo',
    names: { en: 'Hedge Cactus' },
    descriptions: {
      en: 'A tall, branching cactus of southern Brazil whose large white flowers open at night.',
      'pt-BR': 'Cacto alto e ramificado do sul do Brasil, cujas grandes flores brancas abrem à noite.',
    },
  },
  'Ipomoea indica': {
    id: 'bons-dias',
    names: { en: 'Blue Morning Glory' },
    descriptions: {
      en: 'A vigorous climber whose blue flowers open in the morning and fade to pink by afternoon.',
      'pt-BR': 'Trepadeira vigorosa de flores azuis que abrem pela manhã e ficam rosadas à tarde.',
    },
  },
  'Paroaria coronata': {
    id: 'cardeal',
    descriptions: {
      en: 'A grey-and-white songbird with a bright red crested head, common in the open country of the south.',
      'pt-BR': 'Pássaro cinza e branco de cabeça vermelha com topete, comum nas áreas abertas do sul.',
    },
  },
  'Amazonetta brasiliensis': {
    id: 'marreca-ananai',
    names: { 'pt-BR': 'Marreca-ananaí' },
    descriptions: {
      en: 'A small brown duck with red legs and shiny blue-green wing patches, often seen in pairs on ponds.',
      'pt-BR': 'Pequena marreca marrom de pés vermelhos e espelho azul-esverdeado nas asas, vista aos pares em lagoas.',
    },
  },
  'Zenaida auriculata': {
    id: 'avoante',
    photoObservation: 235609705,
    descriptions: {
      en: 'A small dove with black spots on its wings that gathers in large flocks to feed on seeds in fields.',
      'pt-BR': 'Pomba pequena de pintas pretas nas asas que se junta em grandes bandos para comer sementes nos campos.',
    },
  },
  'Myocastor coypus': {
    id: 'ratao-do-banhado',
    names: { 'pt-BR': 'Ratão-do-banhado' },
    descriptions: {
      en: 'A large aquatic rodent with orange front teeth and webbed hind feet that grazes on marsh plants.',
      'pt-BR': 'Roedor aquático grande, de dentes da frente alaranjados e pés traseiros com membranas, que come plantas do banhado.',
    },
  },
  'Trachemys dorbigni': {
    id: 'tigre-d-agua',
    descriptions: {
      en: 'A freshwater turtle of southern Brazil with orange stripes on its head; it basks in groups on logs.',
      'pt-BR': 'Tartaruga de água doce do sul do Brasil com listras laranja na cabeça; toma sol em grupo sobre troncos.',
    },
  },
  'Phrynops hilarii': {
    id: 'cagado-da-lagoa',
    descriptions: {
      en: 'A side-necked turtle that tucks its head sideways under its shell, with two small barbels under its chin.',
      'pt-BR': 'Cágado que dobra o pescoço de lado para esconder a cabeça sob o casco, com duas pequenas barbelas no queixo.',
    },
  },
  'Methona themisto': {
    id: 'borboleta-do-manaca',
    descriptions: {
      en: 'A glasswing butterfly with see-through wings edged in black and orange; its caterpillars feed on manacá shrubs.',
      'pt-BR': 'Borboleta de asas transparentes contornadas de preto e laranja; suas lagartas se alimentam do manacá.',
    },
  },
  'Vanessa braziliensis': {
    id: 'dama-brasileira',
    photoObservation: 276843239,
    descriptions: {
      en: 'A fast, orange-and-black lady butterfly that visits flowers in open, sunny places.',
      'pt-BR': 'Borboleta veloz, laranja e preta, que visita flores em lugares abertos e ensolarados.',
    },
  },
}
