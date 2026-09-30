const { version } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { CREDITS } = require('../../utils/credits');

module.exports = {
  name: 'botinfo',
  aliases: ['stats'],
  description: 'Affiche les statistiques du bot.',
  usage: 'botinfo',
  category: 'Info',
  cooldown: 5,

  async execute(message, args, client) {
    const uptime = process.uptime();
    const days  = Math.floor(uptime / 86400);
    const hours = Math.floor(uptime / 3600) % 24;
    const mins  = Math.floor(uptime / 60) % 60;
    const users = client.guilds.cache.reduce((acc, g) => acc + g.memberCount, 0);

    const e = embed.custom(config.colors.main)
      .setTitle(`🤖 Informations — ${client.user.username}`)
      .addFields(
        { name: '👑 Créateur', value: `\`${CREDITS.name}\``, inline: true },
        { name: '💾 Mémoire', value: `\`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\``, inline: true },
        { name: '⏳ Uptime', value: `\`${days}j ${hours}h ${mins}m\``, inline: true },
        { name: '📊 Stats', value: `Serveurs : \`${client.guilds.cache.size}\`\nMembres : \`${users}\``, inline: true },
        { name: '📚 Librairie', value: `discord.js v${version}`, inline: true },
        { name: '⚡ Node.js', value: process.version, inline: true },
      );
    if (config.embeds.showBotThumbnail) e.setThumbnail(client.user.displayAvatarURL());

    message.reply({ embeds: [e] });
  },
};
