const { ChannelType, PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { setTicketCategory } = require('../../utils/db');

module.exports = {
  name: 'setticketcategory',
  aliases: ['ticketcategory', 'categoryticket'],
  description: 'Définit la catégorie où les tickets seront créés.',
  usage: 'setticketcategory <ID de la catégorie>',
  category: 'Tickets',
  userPerms: [PermissionFlagsBits.Administrator],

  async execute(message, args) {
    const categoryId = args[0];
    if (!categoryId) {
      return message.reply({
        embeds: [embed.error('Erreur', `Veuillez fournir l'ID de la catégorie où les tickets doivent s'ouvrir.\nExemple : \`${config.prefix}setticketcategory 123456789012345678\``)],
      });
    }

    const category = message.guild.channels.cache.get(categoryId);
    if (!category || category.type !== ChannelType.GuildCategory) {
      return message.reply({ embeds: [embed.error('Erreur', 'L\'ID fourni ne correspond pas à une catégorie valide sur ce serveur.')] });
    }

    setTicketCategory(message.guild.id, category.id);
    message.reply({ embeds: [embed.success('Succès', `Les nouveaux tickets seront désormais créés dans la catégorie **${category.name}** !`)] });
  },
};
