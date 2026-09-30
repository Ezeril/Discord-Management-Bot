const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const { isTicketChannel } = require('../../utils/tickets');
const { resolveMember } = require('../../utils/permissions');

module.exports = {
  name: 'removeuser',
  aliases: ['remove'],
  description: 'Retire un membre du ticket actuel.',
  usage: 'removeuser <@membre|ID>',
  category: 'Tickets',
  userPerms: [PermissionFlagsBits.ManageChannels],
  botPerms: [PermissionFlagsBits.ManageChannels],

  async execute(message, args) {
    if (!isTicketChannel(message.channel)) {
      return message.reply({ embeds: [embed.error('Erreur', 'Cette commande ne s\'utilise que dans un ticket.')] });
    }

    const target = await resolveMember(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });

    if (target.id === message.channel.topic) {
      return message.reply({ embeds: [embed.error('Erreur', 'Vous ne pouvez pas retirer le créateur du ticket. Utilisez `close` pour le fermer.')] });
    }

    await message.channel.permissionOverwrites.edit(target.id, {
      ViewChannel: false,
      SendMessages: false,
      ReadMessageHistory: false,
    });

    message.reply({ embeds: [embed.success('Succès', `**${target.user.tag}** a été retiré du ticket.`)] });
  },
};
