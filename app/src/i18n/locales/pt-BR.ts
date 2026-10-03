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
    amazon: 'Amazônia',
    'atlantic-forest': 'Mata Atlântica',
    caatinga: 'Caatinga',
    cerrado: 'Cerrado',
    pantanal: 'Pantanal',
    pampa: 'Pampa',
  },
  biomeSetup: {
    title: 'Onde você mora?',
    subtitle:
      'O EcoFoco cultiva as plantas e os animais do seu bioma. Sua localização aproximada o encontra — só o bioma é salvo, nunca onde você está.',
    useLocation: 'Usar minha localização aproximada',
    detecting: 'Procurando seu bioma…',
    pick: 'Ou escolha seu bioma',
    result: {
      detected: 'Bioma de casa: {{biome}}.',
      'coming-soon': 'Seu bioma é {{biome}}, e as espécies dele chegam em breve. Escolha um bioma para começar:',
      unsupported: 'Sua localização ainda não está em um bioma disponível. Escolha um:',
      unavailable: 'Não foi possível obter sua localização. Escolha seu bioma:',
    },
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
    view: {
      label: 'Visualização da coleção',
      grid: 'Grade',
      isometric: 'Jardim',
    },
    empty: 'Complete uma sessão de foco para coletar sua primeira espécie.',
    garden: {
      periods: {
        day: 'Dia',
        week: 'Semana',
        month: 'Mês',
      },
      previous: 'Período anterior',
      next: 'Próximo período',
      plants_one: '{{count}} planta',
      plants_other: '{{count}} plantas',
      animals_one: '{{count}} animal',
      animals_other: '{{count}} animais',
      empty: 'Nada coletado neste período ainda.',
      overflow: '+{{count}} não exibidos',
      sceneLabel: 'Jardim das espécies coletadas neste período',
    },
  },
  settings: {
    notifications: 'Notificações',
    notificationsHint: 'Lembretes e comemorações (ainda não implementado)',
    loading: 'Carregando…',
    language: 'Idioma',
    stepGoal: 'Meta diária de passos',
    stepGoalHint: 'Passos necessários pra liberar o sorteio de animal do dia',
    stepGoalValue: '{{count}} passos',
    biome: {
      title: 'Bioma',
      hint: 'As recompensas vêm do seu bioma atual. Ganhe pontos para desbloquear biomas vizinhos.',
      points_one: '{{count}} ponto',
      points_other: '{{count}} pontos',
      pointsHint: '+{{session}} por sessão de foco, +{{goal}} por meta de passos batida. Um vizinho custa {{cost}}.',
      home: 'Casa',
      current: 'Atual',
      switch: 'Trocar',
      unlock: 'Desbloquear · {{cost}}',
      locked: 'Bloqueado',
      comingSoon: 'Em breve',
      redetect: 'Detectar de novo pela localização',
      redetectUnavailable: 'Não foi possível obter sua localização. Seu bioma de casa não mudou.',
    },
    credits: {
      title: 'Créditos',
      biomeMap: 'Mapa de biomas: RESOLVE Ecoregions 2017 (Dinerstein et al.), CC-BY 4.0',
    },
  },
  celebration: {
    title: 'Você coletou!',
    tapToContinue: 'Toque para continuar',
  },
  speciesDetail: {
    method: {
      focus_session: 'Sessão de foco',
      draw: 'Sorteio por meta de passos',
      manual_sighting: 'Avistamento manual',
      photo_ai: 'Identificação por foto',
    },
    history: 'Histórico de coletas ({{count}})',
    firstCollected: 'Coletado pela primeira vez em {{date}}',
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
    quaresmeira: {
      name: 'Quaresmeira',
      description:
        'Nativa da Mata Atlântica, cobre as encostas de flores roxas vibrantes por volta da Quaresma, época que lhe dá o nome.',
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
    mandacaru: {
      name: 'Mandacaru',
      description:
        'Cacto colunar imponente e símbolo do sertão; o povo diz que, quando ele floresce, a chuva está para chegar.',
    },
    'xique-xique': {
      name: 'Xique-xique',
      description:
        'Cacto espinhoso que se espalha sobre as rochas; nas secas longas, os espinhos são queimados para o gado comer os caules.',
    },
    'jurema-preta': {
      name: 'Jurema-preta',
      description:
        'Arbusto pioneiro e espinhoso, um dos primeiros a ocupar áreas degradadas da Caatinga e enriquecer o solo com nitrogênio.',
    },
    catingueira: {
      name: 'Catingueira',
      description:
        'Uma das árvores mais comuns da Caatinga, de folhas com cheiro forte que brotam poucos dias depois da primeira chuva.',
    },
    facheiro: {
      name: 'Facheiro',
      description:
        'Cacto alto e azulado em forma de candelabro, com pontas lanosas onde abrem flores noturnas polinizadas por morcegos.',
    },
    'coroa-de-frade': {
      name: 'Coroa-de-frade',
      description:
        'Pequeno cacto globoso coroado por um cefálio vermelho e lanoso, de onde saem suas flores e frutos.',
    },
    faveleira: {
      name: 'Faveleira',
      description:
        'Árvore resistente à seca, coberta de pelos urticantes; suas sementes ricas em óleo alimentam gente e bichos no sertão.',
    },
    craibeira: {
      name: 'Craibeira',
      description:
        'Acompanha os leitos de rios secos do sertão e os ilumina com flores douradas na estação seca.',
    },
    mulungu: {
      name: 'Mulungu',
      description:
        'Explode em flores vermelho-coral nos galhos sem folhas da estação seca, atraindo beija-flores e periquitos.',
    },
    barriguda: {
      name: 'Barriguda',
      description:
        'Parente da paineira com tronco dilatado que armazena água e a ajuda a atravessar meses sem chuva.',
    },
    'asa-branca': {
      name: 'Asa-branca',
      description:
        'A ave da famosa canção de Luiz Gonzaga; seus bandos deixam o sertão na seca e voltam com as chuvas.',
    },
    carcara: {
      name: 'Carcará',
      description:
        'Falcão ousado e oportunista que anda pelo chão tanto quanto voa, comendo de carniça a insetos.',
    },
    'galo-de-campina': {
      name: 'Galo-de-campina',
      description:
        'Endêmico do Nordeste, de cabeça vermelho-viva, costuma ser visto aos pares na vegetação aberta.',
    },
    'sagui-de-tufo-branco': {
      name: 'Sagui-de-tufo-branco',
      description:
        'Pequeno sagui de tufos brancos nas orelhas que rói a casca das árvores para comer goma; nativo do Nordeste.',
    },
    calango: {
      name: 'Calango',
      description:
        'O lagarto que toma sol em toda pedra e muro do sertão, balançando a cabeça para afastar rivais.',
    },
    moco: {
      name: 'Mocó',
      description:
        'Roedor que só existe na Caatinga, vive entre lajedos e sobe em árvores com agilidade surpreendente.',
    },
    'cachorro-do-mato': {
      name: 'Cachorro-do-mato',
      description:
        'Canídeo silvestre de hábitos sobretudo noturnos que come frutos, insetos e pequenos animais, muitas vezes caçando aos pares.',
    },
    'periquito-da-caatinga': {
      name: 'Periquito-da-caatinga',
      description:
        'Periquito verde e barulhento da Caatinga que se alimenta de frutos de cactos e sementes.',
    },
    'arara-azul-de-lear': {
      name: 'Arara-azul-de-lear',
      description:
        'Arara azul ameaçada de extinção que só vive no norte da Bahia, faz ninhos em paredões de arenito e come coquinhos de licuri.',
    },
    'tatu-bola': {
      name: 'Tatu-bola',
      description:
        'O único tatu que se fecha numa bola perfeita; só existe no Brasil e foi mascote da Copa do Mundo de 2014.',
    },
  },
}
