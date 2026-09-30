const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embed = require('../../utils/embed');

module.exports = {
  name: 'embed',
  description: 'Ouvre le constructeur d\'embed interactif.',
  usage: 'embed',
  category: 'Administration',
  userPerms: [PermissionFlagsBits.ManageMessages],
  botPerms: [PermissionFlagsBits.SendMessages],

  async execute(message) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_embed_modal')
        .setLabel('Créer mon Embed')
        .setEmoji('🖼️')
        .setStyle(ButtonStyle.Success)
    );

    const introEmbed = embed.info(
      'Constructeur d\'Embed',
      'Clique sur le bouton ci-dessous pour ouvrir le formulaire et créer ton message personnalisé.'
    );

    await message.reply({ embeds: [introEmbed], components: [row] });
  },
};