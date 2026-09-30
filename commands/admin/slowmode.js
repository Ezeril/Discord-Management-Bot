const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  name: 'slowmode',
  aliases: ['sm'],
  description: 'Définit le mode lent du salon (en secondes).',
  usage: 'slowmode <secondes>',
  category: 'Administration',
  userPerms: [PermissionFlagsBits.ManageChannels],
  botPerms: [PermissionFlagsBits.ManageChannels],

  async execute(message, args) {
    const time = parseInt(args[0]);

    if (isNaN(time) || time < 0 || time > 21600) {
      return message.reply({ embeds: [embed.error('Erreur', 'Veuillez préciser une durée valide entre 0 et 21600 secondes.')] });
    }

    await message.channel.setRateLimitPerUser(time);

    if (time === 0) {
      message.reply({ embeds: [embed.success('Mode Lent', 'Le mode lent a été désactivé.')] });
    } else {
      message.reply({ embeds: [embed.success('Mode Lent', `Le mode lent est maintenant défini sur **${time} secondes**.`)] });
    }
  },
};