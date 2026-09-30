const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const { isTicketChannel } = require('../../utils/tickets');
const { resolveMember } = require('../../utils/permissions');

module.exports = {
  name: 'adduser',
  aliases: ['add'],
  description: 'Ajoute un membre au ticket actuel.',
  usage: 'adduser <@membre|ID>',
  category: 'Tickets',
  userPerms: [PermissionFlagsBits.ManageChannels],
  botPerms: [PermissionFlagsBits.ManageChannels],

  async execute(message, args) {
    if (!isTicketChannel(message.channel)) {
      return message.reply({ embeds: [embed.error('Erreur', 'Cette commande ne s\'utilise que dans un ticket.')] });
    }

    const target = await resolveMember(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });

    await message.channel.permissionOverwrites.edit(target.id, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
    });

    message.reply({ embeds: [embed.success('Succès', `**${target.user.tag}** a été ajouté au ticket.`)] });
  },
};
