const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const { setTicketMsg } = require('../../utils/db');

module.exports = {
  name: 'setticketmsg',
  aliases: ['ticketmsg'],
  description: 'Définit le message d\'accueil des tickets de ce serveur. Variable : {user}. Les retours à la ligne sont conservés.',
  usage: 'setticketmsg <message>',
  category: 'Tickets',
  userPerms: [PermissionFlagsBits.Administrator],

  async execute(message) {
    const customMessage = message.content.replace(/^\S+\s*/, '').trim();

    if (!customMessage) {
      return message.reply({ embeds: [embed.error('Erreur', 'Veuillez fournir le message à afficher à l\'ouverture d\'un ticket.')] });
    }
    if (customMessage.length > 4000) {
      return message.reply({ embeds: [embed.error('Erreur', 'Le message ne peut pas dépasser 4000 caractères.')] });
    }

    setTicketMsg(message.guild.id, customMessage);
    message.reply({ embeds: [embed.success('Succès', 'Le message d\'accueil des tickets a été mis à jour pour ce serveur !')] });
  },
};
