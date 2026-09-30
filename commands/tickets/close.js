const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { isTicketChannel } = require('../../utils/tickets');

module.exports = {
  name: 'close',
  description: 'Ferme et supprime le ticket actuel.',
  usage: 'close',
  category: 'Tickets',
  userPerms: [PermissionFlagsBits.ManageChannels],
  botPerms: [PermissionFlagsBits.ManageChannels],

  async execute(message) {
    if (!isTicketChannel(message.channel)) {
      return message.reply({ embeds: [embed.error('Erreur', 'Cette commande ne peut être utilisée que dans un ticket.')] });
    }

    const delay = config.tickets.closeDelaySeconds;
    await message.reply({ embeds: [embed.warning('Fermeture', `Le ticket sera supprimé dans ${delay} seconde(s)...`)] });
    setTimeout(() => message.channel.delete().catch(() => {}), delay * 1000);
  },
};
