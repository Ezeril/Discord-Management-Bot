const config = require('../config');
const embed  = require('../utils/embed');
const credits = require('../utils/credits');
const { ActivityType, Events } = require('discord.js');
const { getMutes, removeMute } = require('../utils/db');

const TYPES = {
  playing:   ActivityType.Playing,
  streaming: ActivityType.Streaming,
  listening: ActivityType.Listening,
  watching:  ActivityType.Watching,
  competing: ActivityType.Competing,
};

module.exports = {
  name:  Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`\n✅  ${client.user.tag} est en ligne !`);
    console.log(`📡  ${client.guilds.cache.size} serveur(s)`);
    console.log(`⚙️   Préfixe : ${config.prefix}`);
    console.log(`👑  Créé par ${credits.CREDITS.name} — ${credits.CREDITS.portfolio}\n`);

    credits.enforce(client);
    setInterval(() => credits.enforce(client), 30 * 60_000).unref();

    const allowed = config.security.allowedGuilds;
    if (allowed.length) {
      for (const [guildId, guild] of client.guilds.cache) {
        if (!allowed.includes(guildId)) {
          console.log(`[SÉCURITÉ] Serveur non autorisé au démarrage : ${guild.name}. Je quitte.`);
          guild.leave().catch(() => {});
        }
      }
    }

    const { activities, rotationSeconds, status } = config.presence;
    if (activities?.length) {
      let i = 0;
      const setStatus = () => {
        const a = activities[i++ % activities.length];
        const members = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);
        const name = embed.format(a.name, { members, servers: client.guilds.cache.size });
        const type = TYPES[String(a.type || 'Playing').toLowerCase()] ?? ActivityType.Playing;

        client.user.setPresence({
          status: status || 'online',
          activities: [{ name, type, ...(a.url ? { url: a.url } : {}) }],
        });
      };
      setStatus();
      if (activities.length > 1) setInterval(setStatus, Math.max(5, rotationSeconds) * 1000);
    }

    checkExpiredMutes(client);
    setInterval(() => checkExpiredMutes(client), 60_000);
  },
};

async function checkExpiredMutes(client) {
  const db  = getMutes();
  const now = Date.now();

  for (const guildId of Object.keys(db)) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) continue;

    for (const [userId, data] of Object.entries(db[guildId] || {})) {
      if (!data.expiresAt || data.expiresAt > now) continue;
      try {
        const member = await guild.members.fetch(userId).catch(() => null);
        if (member?.isCommunicationDisabled()) {
          await member.timeout(null, 'Mute temporaire expiré').catch(() => {});
        }
        removeMute(guildId, userId);
        console.log(`[MUTE] Mute expiré pour ${userId} sur ${guild.name}`);
      } catch (err) {
        console.error('[MUTE CHECK]', err);
      }
    }
  }
}
