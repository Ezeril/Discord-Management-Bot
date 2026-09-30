const config = require('../../config');
const embed = require('../../utils/embed');

module.exports = {
  name: 'ping',
  description: 'Affiche la latence du bot.',
  usage: 'ping',
  category: 'Info',
  cooldown: 5,

  async execute(message, args, client) {
    const sent = await message.reply({ content: '🏓 Calcul en cours…' });
    const apiPing = Math.round(client.ws.ping);
    const botPing = sent.createdTimestamp - message.createdTimestamp;

    const status = ms => (ms < 100 ? '🟢' : ms < 200 ? '🟡' : '🔴');

    await sent.edit({
      content: null,
      embeds: [
        embed.custom(config.colors.main)
          .setTitle('🏓 Pong !')
          .addFields(
            { name: 'Bot', value: `${status(botPing)} \`${botPing}ms\``, inline: true },
            { name: 'API Discord', value: `${status(apiPing)} \`${apiPing}ms\``, inline: true },
          ),
      ],
    });
  },
};
