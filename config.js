module.exports = {
  /** Préfixe des commandes (ex: '+' → +help, '!' → !help) */
  prefix: '+',

  /** Nom affiché dans les footers des embeds et dans les messages du bot */
  botName: 'Open Source',

  /** Nom de l'hébergeur / de l'équipe, utilisable dans les textes via {developer} */
  developer: 'Ezeril',

  embeds: {
    /**
     * Texte du footer de tous les embeds.
     * Variables : {botName}, {developer}
     */
    footerText: '{botName}',

    /** URL d'une icône affichée dans le footer ('' = aucune, 'bot' = avatar du bot) */
    footerIcon: '',

    /** Afficher l'heure en bas des embeds. */
    timestamp: true,

    /** Afficher la miniature (avatar du bot) dans les embeds d'aide / d'infos */
    showBotThumbnail: true,

    /** Image de bannière optionnelle sous le menu d'aide ('' = aucune) */
    helpBannerUrl: '',
  },

  colors: {
    main:    '#5865F2',
    success: '#57F287',
    error:   '#ED4245',
    warning: '#FEE75C',
    info:    '#5865F2',
    dark:    '#2B2D31',

    ban:     '#ED4245',
    kick:    '#FEE75C',
    mute:    '#FEE75C',
    warn:    '#FEE75C',
    unban:   '#57F287',
    unmute:  '#57F287',

    ticketRequest:  '#FFA500',
    ticketAccepted: '#57F287',
    ticketDenied:   '#ED4245',

    poll:   '#FFA500',
    love:   '#FF69B4',
    wanted: '#8B4513',
    embedBuilderDefault: '#2B2D31',
  },

  emojis: {
    success: '✅',
    error:   '❌',
    warning: '⚠️',
    info:    'ℹ️',
    mod:     '🛡️',
    ticket:  '🎫',
    lock:    '🔒',
    unlock:  '🔓',
    ban:     '🔨',
    kick:    '👢',
    mute:    '🔇',
    warn:    '⚠️',
    time:    '⏱️',
    user:    '👤',
    server:  '🌐',
  },

  // ───────────────────────────────────────────────────────────────────────
  //  STATUT / PRÉSENCE DU BOT
  //  Variables : {prefix}, {botName}, {members}, {servers}
  //  type : 'Playing' | 'Watching' | 'Listening'
  // ───────────────────────────────────────────────────────────────────────
  presence: {
    /** 'online' | 'idle' | 'dnd' */
    status: 'online',

    /** Délai (en secondes) entre chaque changement de statut */
    rotationSeconds: 15,

    activities: [
      { name: '{prefix}help | {botName}', type: 'Playing' },
      { name: '{members} membres', type: 'Watching' },
    ],
  },

  security: {
    /**
     * Liste blanche de serveurs. Le bot quitte automatiquement tout serveur
     * dont l'ID n'est pas dans cette liste
     * Laisse vide [] pour autoriser tous les serveurs (bot public)
     * Exemple : ['123456789012345678', '987654321098765432']
     */
    allowedGuilds: [],
  },

  channels: {
    /** Logs de modération (ban, kick, mute, warn...). */
    modLogs: '',

    /** Alertes anti-raid / anti-spam. */
    antiRaidLogs: '',
  },

  moderation: {
    /** Raison utilisée quand aucune raison n'est donnée */
    defaultReason: 'Aucune raison fournie.',

    /** Envoyer un MP au membre sanctionné (ban, kick, warn) */
    dmOnSanction: true,

    /** Durée (secondes) avant suppression des messages de confirmation de +purge */
    purgeConfirmDeleteSeconds: 3,
  },

  antiRaid: {
    enabled: true,

    // Anti-raid (arrivées)
    joinThreshold:      10,     // nombre de joins qui déclenche l'alerte
    joinTimeWindow:     10000,  // fenêtre de détection en ms (10 s)
    lockdownDuration:   60000,  // durée du lockdown automatique en ms (1 min)

    // Filtre de comptes récents
    minAccountAgeDays:  1,      // âge minimum du compte en jours (0 = désactivé)
    newAccountAction:   'kick', // 'kick' ou 'ban'

    // Anti-spam (messages identiques)
    spamThreshold:      5,      // nombre de messages identiques
    spamTimeWindow:     5000,   // fenêtre en ms (5 s)
    spamTimeoutMinutes: 5,      // durée du timeout appliqué

    // Anti mass-mention
    massMentionThreshold: 5,    // nombre de mentions dans un seul message
    massMentionTimeoutMinutes: 10,
  },

  tickets: {
    /**
     * true  → la demande est envoyée au staff qui l'accepte ou la refuse
     * false → le ticket est créé directement quand le membre clique
     */
    requireApproval: true,

    /** Salon où arrivent les demandes de tickets */
    requestChannelId: '',

    /**
     * Rôles staff ajoutés automatiquement dans chaque ticket.
     * Exemple : ['123456789012345678']
     */
    staffRoleIds: [],

    /**
     * Catégorie par défaut où créer les tickets ('' = sans catégorie)
     * Peut aussi être définie en jeu avec +setticketcategory
     */
    categoryId: '',

    /** Préfixe du nom des salons de tickets */
    channelPrefix: 'ticket-',

    /** Délai avant suppression d'un ticket fermé (secondes). */
    closeDelaySeconds: 5,

    // Panel
    panel: {
      title:       'Support Utilisateur',
      description: "Besoin d'aide ou d'une assistance ? Cliquez sur le bouton ci-dessous pour ouvrir un ticket privé avec l'équipe de modération.",
      buttonLabel: 'Ouvrir un ticket',
      buttonEmoji: '📩',
    },

    // Formulaire affiché quand un membre clique sur le bouton
    modal: {
      title:       'Demande de Ticket',
      label:       'Raison de votre ticket ?',
      placeholder: 'Expliquez brièvement pourquoi vous contactez le staff...',
      minLength:   5,
      maxLength:   1000,
    },

    /**
     * Message d'accueil par défaut dans un ticket
     * (peut être remplacé par serveur avec +setticketmsg).
     * Variables : {user}
     */
    welcomeMessage: 'Bienvenue {user} !\nPosez votre question ici, le staff vous répondra sous peu.',
  },

  // ───────────────────────────────────────────────────────────────────────
  //  COMMANDES DÉSACTIVÉES
  //  Ajoute le nom d'une commande pour la désactiver. Ex: ['wanted', 'couple']
  //  Tu peux aussi désactiver une catégorie entière avec disabledCategories,
  //  ex: ['Fun'] (noms : Modération, Administration, Tickets, Info, Fun).
  // ───────────────────────────────────────────────────────────────────────
  disabledCommands: [],
  disabledCategories: [],
};
