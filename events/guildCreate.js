const config = require('../config');

module.exports = {
  name: 'guildCreate',
  execute(guild) {
    const allowed = config.security.allowedGuilds;
    if (!allowed.length || allowed.includes(guild.id)) {
      console.log(`[INFO] Serveur rejoint : ${guild.name} (${guild.id}).`);
      return;
    }

    console.log(`[SÉCURITÉ] Serveur non autorisé : ${guild.name} (${guild.id}). Je le quitte.`);
    guild.leave().catch(err => console.error(`Impossible de quitter ${guild.id}:`, err));
  },
};
