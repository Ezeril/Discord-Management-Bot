const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');

module.exports = {
  name: 'ticket',
  description: 'Génère le panel pour ouvrir un ticket.',
  usage: 'ticket',
  category: 'Tickets',
  userPerms: [PermissionFlagsBits.Administrator],

  async execute(message) {
    const { panel } = config.tickets;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('create_ticket')
        .setLabel(panel.buttonLabel)
        .setEmoji(panel.buttonEmoji)
        .setStyle(ButtonStyle.Primary)
    );

    await message.channel.send({
      embeds: [embed.info(panel.title, embed.format(panel.description))],
      components: [row],
    });
    await message.delete().catch(() => {});
  },
};
