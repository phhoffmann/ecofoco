import type { en } from './en'

export const ptBR: typeof en = {
  common: {
    done: 'Concluído',
    cancel: 'Cancelar',
    close: 'Fechar',
    tryAgain: 'Tentar de novo',
  },
  rarity: {
    common: 'Comum',
    rare: 'Raro',
    epic: 'Épico',
  },
  speciesType: {
    plant: 'Planta',
    animal: 'Animal',
  },
  biome: {
    'atlantic-forest': 'Mata Atlântica',
  },
  nav: {
    focus: 'Foco',
    activity: 'Atividade',
    collection: 'Coleção',
    settings: 'Ajustes',
  },
  focus: {
    chooseDuration: 'Escolha a duração do foco',
    durationMinutes: '{{count}} min',
    leaveWarning: 'Sair do app agora vai falhar essa sessão e descartar o broto.',
    giveUp: 'Desistir',
    youCollected: 'Você coletou',
    sessionFailed: 'Sessão falhou',
    leftEarly: 'Você saiu do app antes do broto terminar de crescer.',
  },
  activity: {
    checkingHealthConnect: 'Verificando o Health Connect…',
    unavailable: 'O Health Connect não está disponível neste aparelho.',
    installHint: 'Instale o app "Health Connect" pela Play Store e volte aqui.',
    connectPrompt: 'Conecte o Health Connect para acompanhar seus passos.',
    connecting: 'Conectando…',
    connect: 'Conectar',
    todaySteps: 'Passos de hoje',
    drawButton: 'Sortear um animal!',
    drawDone: 'Animal já coletado hoje — volte amanhã.',
    keepWalking: 'Continue caminhando para liberar o sorteio de animal de hoje.',
    syncSteps: 'Sincronizar passos',
    simulateSteps: 'Simular {{count}} passos (dev)',
  },
  collection: {
    discovered: '{{count}} / {{total}} espécies descobertas',
    logSighting: '+ Registrar avistamento',
    unknown: '???',
    empty: 'Complete uma sessão de foco para coletar sua primeira espécie.',
  },
  settings: {
    notifications: 'Notificações',
    notificationsHint: 'Lembretes e comemorações (ainda não implementado)',
    loading: 'Carregando…',
    language: 'Idioma',
    stepGoal: 'Meta diária de passos',
    stepGoalHint: 'Passos necessários pra liberar o sorteio de animal do dia',
    stepGoalValue: '{{count}} passos',
  },
  speciesDetail: {
    method: {
      focus_session: 'Sessão de foco',
      draw: 'Sorteio por meta de passos',
      manual_sighting: 'Avistamento manual',
      photo_ai: 'Identificação por foto',
    },
    history: 'Histórico de coletas ({{count}})',
    photoCredit: 'Foto: {{credit}}',
  },
  manualSighting: {
    title: 'Registrar avistamento',
    subtitle: 'Viu algum desses na natureza? Adicione à sua coleção — ainda sem necessidade de foto.',
  },
  species: {
    'ipe-amarelo': {
      name: 'Ipê-amarelo',
      description:
        'Árvore brasileira icônica, conhecida por suas flores amarelas vibrantes no final do inverno, muitas vezes florescendo quase sem folhas nos galhos.',
    },
    'jacaranda-mimoso': {
      name: 'Jacarandá-mimoso',
      description:
        'Nativa da América do Sul, famosa pelos cachos de flores roxo-azuladas em formato de trombeta que cobrem o chão a cada primavera.',
    },
    'pau-brasil': {
      name: 'Pau-brasil',
      description:
        'A árvore que deu nome ao Brasil — seu cerne avermelhado era historicamente usado como corante e ainda hoje é usado na fabricação de arcos de violino.',
    },
    'jequitiba-rosa': {
      name: 'Jequitibá-rosa',
      description:
        'Uma das árvores mais altas da Mata Atlântica, capaz de viver mais de mil anos e se destacar bem acima do dossel da floresta.',
    },
    'palmito-jucara': {
      name: 'Palmito-juçara',
      description:
        'Uma palmeira de crescimento lento cujo palmito é uma iguaria valorizada; a extração excessiva a deixou ameaçada de extinção na natureza.',
    },
    'canela-guaica': {
      name: 'Canela-guaicá',
      description:
        'Árvore nativa de crescimento rápido da família das lauráceas, geralmente uma das primeiras a colonizar clareiras na floresta.',
    },
    'ipe-roxo': {
      name: 'Ipê-roxo',
      description:
        'Floresce em tons vibrantes de rosa-roxo no final do inverno; sua madeira densa e durável também é usada em pisos e construção pesada.',
    },
    embauba: {
      name: 'Embaúba',
      description:
        'Árvore pioneira de crescimento rápido com folhas em formato de guarda-chuva, importante fonte de alimento para preguiças e tucanos.',
    },
    guapuruvu: {
      name: 'Guapuruvu',
      description:
        'Uma das árvores nativas de crescimento mais rápido do Brasil, com folhas enormes parecidas com samambaia e espigas de flores amarelas.',
    },
    'aroeira-pimenteira': {
      name: 'Aroeira-pimenteira',
      description:
        'Produz pequenas bagas vermelhas parecidas com pimenta-rosa; considerada invasora fora do Brasil, mas nativa e ecologicamente importante aqui.',
    },
    'sagui-de-tufo-preto': {
      name: 'Sagui-de-tufo-preto',
      description:
        'Um pequeno sagui muito social, reconhecível pelos tufos pretos de pelo ao redor das orelhas, comum em parques urbanos e bordas de mata.',
    },
    'bem-te-vi': {
      name: 'Bem-te-vi',
      description:
        'Ave insetívora barulhenta e destemida, de peito amarelo, cujo canto parece dizer o próprio nome — uma das aves mais conhecidas do Brasil.',
    },
    'gamba-de-orelha-preta': {
      name: 'Gambá-de-orelha-preta',
      description:
        'Marsupial noturno e um dos poucos representantes nativos dos marsupiais no Brasil; conhecido por fingir de morto quando ameaçado.',
    },
    jacu: {
      name: 'Jacu',
      description:
        'Ave florestal grande, parecida com um peru, conhecida pelos cantos altos ao amanhecer e importante dispersora de sementes da Mata Atlântica.',
    },
    'tucano-de-bico-verde': {
      name: 'Tucano-de-bico-verde',
      description: 'Tucano marcante de bico verde e laranja, alimenta-se principalmente de frutas e tem papel importante na dispersão de sementes.',
    },
    quati: {
      name: 'Quati',
      description:
        'Parente do guaxinim que forrageia em bandos barulhentos durante o dia, usando o focinho longo e flexível para procurar insetos e frutas.',
    },
    'lagarto-teiu': {
      name: 'Lagarto-teiú',
      description: 'Um dos maiores lagartos da América do Sul, onívoro oportunista que pode ultrapassar um metro de comprimento.',
    },
    'sabia-laranjeira': {
      name: 'Sabiá-laranjeira',
      description: 'Ave símbolo do Brasil, conhecida pelo canto rico e melodioso entoado ao amanhecer e ao entardecer.',
    },
    'borboleta-azul': {
      name: 'Borboleta-azul',
      description:
        'Famosa pelas asas azuis iridescentes deslumbrantes, um brilho causado por escamas que dispersam a luz, e não por pigmento.',
    },
    prea: {
      name: 'Preá',
      description:
        'Parente selvagem do porquinho-da-índia, vive em áreas de vegetação rasteira em pequenos grupos familiares, mais ativo ao amanhecer e ao entardecer.',
    },
  },
}
