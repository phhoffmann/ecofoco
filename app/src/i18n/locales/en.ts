export const en = {
  common: {
    done: 'Done',
    cancel: 'Cancel',
    close: 'Close',
    tryAgain: 'Try again',
  },
  rarity: {
    common: 'Common',
    rare: 'Rare',
    epic: 'Epic',
  },
  speciesType: {
    plant: 'Plant',
    animal: 'Animal',
  },
  biome: {
    amazon: 'Amazon',
    'atlantic-forest': 'Atlantic Forest',
    caatinga: 'Caatinga',
    cerrado: 'Cerrado',
    pantanal: 'Pantanal',
    pampa: 'Pampa',
  },
  biomeSetup: {
    title: 'Where do you live?',
    subtitle:
      'EcoFoco grows the plants and animals of your biome. Your approximate location finds it — only the biome is saved, never where you are.',
    useLocation: 'Use my approximate location',
    detecting: 'Finding your biome…',
    pick: 'Or choose your biome',
    result: {
      detected: 'Home biome: {{biome}}.',
      'coming-soon': 'Your biome is {{biome}}, and its species are coming soon. Choose a biome to start with:',
      unsupported: "Your location isn't in a supported biome yet. Choose one:",
      unavailable: "Couldn't get your location. Choose your biome:",
    },
  },
  nav: {
    focus: 'Focus',
    activity: 'Activity',
    collection: 'Collection',
    settings: 'Settings',
  },
  focus: {
    chooseDuration: 'Choose a focus duration',
    durationMinutes: '{{count}} min',
    leaveWarning: 'Leaving the app now will fail this session and discard the sprout.',
    giveUp: 'Give up',
    youCollected: 'You collected',
    sessionFailed: 'Session failed',
    leftEarly: 'You left the app before the sprout finished growing.',
  },
  activity: {
    checkingHealthConnect: 'Checking Health Connect…',
    unavailable: "Health Connect isn't available on this device.",
    installHint: 'Install the "Health Connect" app from the Play Store, then come back here.',
    connectPrompt: 'Connect Health Connect to track your steps.',
    connecting: 'Connecting…',
    connect: 'Connect',
    todaySteps: "Today's steps",
    drawButton: 'Draw an animal!',
    drawDone: 'Animal already collected today — come back tomorrow.',
    keepWalking: "Keep walking to unlock today's animal draw.",
    syncSteps: 'Sync steps',
    simulateSteps: 'Simulate {{count}} steps (dev)',
  },
  collection: {
    discovered: '{{count}} / {{total}} species discovered',
    logSighting: '+ Log sighting',
    unknown: '???',
    view: {
      label: 'Collection view',
      grid: 'Grid',
      isometric: 'Garden',
    },
    empty: 'Complete a focus session to collect your first species.',
    garden: {
      periods: {
        day: 'Day',
        week: 'Week',
        month: 'Month',
      },
      previous: 'Previous period',
      next: 'Next period',
      plants_one: '{{count}} plant',
      plants_other: '{{count}} plants',
      animals_one: '{{count}} animal',
      animals_other: '{{count}} animals',
      empty: 'Nothing collected in this period yet.',
      overflow: '+{{count}} more not shown',
      sceneLabel: 'Garden of the species collected in this period',
    },
  },
  settings: {
    notifications: 'Notifications',
    notificationsHint: 'Reminders and celebrations (not implemented yet)',
    loading: 'Loading…',
    language: 'Language',
    stepGoal: 'Daily step goal',
    stepGoalHint: 'Steps needed to unlock the daily animal draw',
    stepGoalValue: '{{count}} steps',
    biome: {
      title: 'Biome',
      hint: 'Rewards come from your current biome. Earn points to unlock neighbouring biomes.',
      points_one: '{{count}} point',
      points_other: '{{count}} points',
      pointsHint: '+{{session}} per focus session, +{{goal}} per step goal met. A neighbour costs {{cost}}.',
      home: 'Home',
      current: 'Current',
      switch: 'Switch',
      unlock: 'Unlock · {{cost}}',
      locked: 'Locked',
      comingSoon: 'Coming soon',
      redetect: 'Re-detect from location',
      redetectUnavailable: "Couldn't get your location. Your home biome is unchanged.",
    },
    credits: {
      title: 'Credits',
      biomeMap: 'Biome map: RESOLVE Ecoregions 2017 (Dinerstein et al.), CC-BY 4.0',
    },
  },
  celebration: {
    title: 'You collected!',
    tapToContinue: 'Tap to continue',
  },
  speciesDetail: {
    method: {
      focus_session: 'Focus session',
      draw: 'Step goal draw',
      manual_sighting: 'Manual sighting',
      photo_ai: 'Photo identification',
    },
    history: 'Collection history ({{count}})',
    firstCollected: 'First collected on {{date}}',
    photoCredit: 'Photo: {{credit}}',
  },
  manualSighting: {
    title: 'Log a sighting',
    subtitle: "Spotted one of these in the wild? Add it to your collection — no photo needed yet.",
  },
  species: {
    'ipe-amarelo': {
      name: 'Yellow Trumpet Tree',
      description:
        'Iconic Brazilian tree known for its brilliant yellow blooms in late winter, often flowering with almost no leaves on the branches.',
    },
    quaresmeira: {
      name: 'Glory Bush Tree',
      description:
        'Atlantic Forest native that covers hillsides in vivid purple flowers around Lent, which gives it its Portuguese name.',
    },
    'pau-brasil': {
      name: 'Brazilwood',
      description:
        'The tree that gave Brazil its name — its reddish heartwood was historically prized for dye and is still used today for violin bows.',
    },
    'jequitiba-rosa': {
      name: 'Giant Jequitibá',
      description:
        'One of the tallest trees in the Atlantic Forest, capable of living over a thousand years and towering well above the surrounding canopy.',
    },
    'palmito-jucara': {
      name: 'Juçara Palm',
      description:
        'A slow-growing palm whose heart is a prized delicacy; overharvesting for palm hearts has made it endangered in the wild.',
    },
    'canela-guaica': {
      name: 'Guaicá Laurel',
      description:
        'A fast-growing native tree in the laurel family, often one of the first species to colonize forest clearings after disturbance.',
    },
    'ipe-roxo': {
      name: 'Pink Trumpet Tree',
      description:
        'Blooms in vivid pink-purple in late winter; its dense, durable wood is also prized for flooring and heavy construction.',
    },
    embauba: {
      name: 'Cecropia',
      description:
        'A fast-growing pioneer tree with distinctive umbrella-shaped leaves, an important food source for sloths and toucans alike.',
    },
    guapuruvu: {
      name: 'Brazilian Fern Tree',
      description: 'One of the fastest-growing native trees in Brazil, with huge fern-like leaves and bright yellow flower spikes.',
    },
    'aroeira-pimenteira': {
      name: 'Brazilian Pepper Tree',
      description:
        'Produces small red berries resembling pink peppercorns; considered invasive outside Brazil, but native and ecologically important here.',
    },
    'sagui-de-tufo-preto': {
      name: 'Black-tufted Marmoset',
      description:
        'A small, highly social marmoset recognizable by the black tufts of fur around its ears, common in urban parks and forest edges.',
    },
    'bem-te-vi': {
      name: 'Great Kiskadee',
      description:
        "A loud, bold yellow-bellied flycatcher whose call sounds like it's saying its own name — one of Brazil's most familiar birds.",
    },
    'gamba-de-orelha-preta': {
      name: 'Black-eared Opossum',
      description: "A nocturnal marsupial and one of Brazil's only native marsupial groups; it famously plays dead when threatened.",
    },
    jacu: {
      name: 'Dusky-legged Guan',
      description:
        'A large, turkey-like forest bird known for its loud dawn calls and an important seed disperser for the Atlantic Forest.',
    },
    'tucano-de-bico-verde': {
      name: 'Red-breasted Toucan',
      description:
        'A striking toucan with a green-and-orange bill, feeding mainly on fruit and playing a key role in dispersing forest seeds.',
    },
    quati: {
      name: 'South American Coati',
      description:
        'A raccoon relative that forages in noisy troops during the day, using its long flexible snout to dig for insects and fruit.',
    },
    'lagarto-teiu': {
      name: 'Black-and-white Tegu',
      description: "One of South America's largest lizards, an opportunistic omnivore that can grow over a meter long.",
    },
    'sabia-laranjeira': {
      name: 'Rufous-bellied Thrush',
      description: "Brazil's national bird, known for its rich, melodic song sung at dawn and dusk.",
    },
    'borboleta-azul': {
      name: 'Blue Morpho',
      description:
        'Famous for its dazzling iridescent blue wings, a shimmer caused by light-scattering scales rather than any actual pigment.',
    },
    prea: {
      name: 'Brazilian Guinea Pig',
      description:
        'A wild relative of the guinea pig, living in grassy areas in small family groups and mostly active at dawn and dusk.',
    },
    mandacaru: {
      name: 'Mandacaru Cactus',
      description:
        'A towering columnar cactus and symbol of the sertão; people say that when it blooms, rain is on the way.',
    },
    'xique-xique': {
      name: 'Xique-xique Cactus',
      description:
        'A spiny cactus that sprawls over bare rock; in long droughts its spines are singed off so cattle can eat the stems.',
    },
    'jurema-preta': {
      name: 'Black Jurema',
      description:
        'A thorny pioneer shrub, among the first to reclaim degraded Caatinga and enrich poor soil with nitrogen.',
    },
    catingueira: {
      name: 'Catingueira',
      description:
        'One of the most common Caatinga trees, with strong-smelling leaves that sprout within days of the first rain.',
    },
    facheiro: {
      name: 'Facheiro Cactus',
      description:
        'A tall, bluish candelabra cactus whose woolly tips open night flowers pollinated by bats.',
    },
    'coroa-de-frade': {
      name: "Turk's Cap Cactus",
      description:
        'A small globe cactus crowned by a red, woolly cap where its flowers and fruits appear.',
    },
    faveleira: {
      name: 'Faveleira',
      description:
        'A drought-hardy tree covered in stinging hairs; its oil-rich seeds feed people and wildlife in the sertão.',
    },
    craibeira: {
      name: 'Silver Trumpet Tree',
      description:
        'Lines the dry riverbeds of the sertão and lights them up with golden flowers in the dry season.',
    },
    mulungu: {
      name: 'Mulungu Coral Tree',
      description:
        'Bursts into coral-red flowers on bare branches in the dry season, drawing hummingbirds and parakeets.',
    },
    barriguda: {
      name: 'Bottle Tree',
      description:
        'A kapok relative with a swollen, water-storing trunk that carries it through months without rain.',
    },
    'asa-branca': {
      name: 'Picazuro Pigeon',
      description:
        "The bird of Luiz Gonzaga's famous song; its flocks leave the sertão in droughts and return with the rains.",
    },
    carcara: {
      name: 'Southern Crested Caracara',
      description:
        'A bold, opportunistic falcon that walks the ground as often as it flies, eating anything from carrion to insects.',
    },
    'galo-de-campina': {
      name: 'Red-cowled Cardinal',
      description:
        'A Northeast Brazil endemic with a bright red head, usually seen in pairs in open scrub.',
    },
    'sagui-de-tufo-branco': {
      name: 'Common Marmoset',
      description:
        'A small marmoset with white ear tufts that gnaws tree bark to feed on gum, native to the Northeast.',
    },
    calango: {
      name: "Peters' Lava Lizard",
      description:
        'The lizard basking on every rock and wall of the sertão, bobbing its head to warn off rivals.',
    },
    moco: {
      name: 'Rock Cavy',
      description:
        'A rodent found only in the Caatinga, living among rocky outcrops and climbing trees with surprising agility.',
    },
    'cachorro-do-mato': {
      name: 'Crab-eating Fox',
      description:
        'A mostly nocturnal wild canid that eats fruit, insects and small animals, often hunting in pairs.',
    },
    'periquito-da-caatinga': {
      name: 'Cactus Parakeet',
      description:
        'A noisy green parakeet of the Caatinga that feeds on cactus fruit and seeds.',
    },
    'arara-azul-de-lear': {
      name: "Lear's Macaw",
      description:
        'An endangered indigo macaw found only in northern Bahia, nesting in sandstone cliffs and feeding on licuri palm nuts.',
    },
    'tatu-bola': {
      name: 'Brazilian Three-banded Armadillo',
      description:
        'The only armadillo that rolls into a perfect ball; found only in Brazil and the mascot of the 2014 World Cup.',
    },
  },
}
