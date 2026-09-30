const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { CREDITS, assertIntegrity } = require('../../utils/credits');

module.exports = {
  name: 'about',
  aliases: ['createur'],
  description: 'Affiche les informations sur le créateur du bot.',
  usage: 'about',
  category: 'Info',
  cooldown: 5,
  protected: true,
  
  async execute(message, args, client) {
    assertIntegrity(client);

    const creator = await client.users.fetch(CREDITS.id).catch(() => null);

    const e = embed.custom(config.colors.main)
      .setTitle('✨ À propos du bot')
      .setDescription(
        `Ce bot a été créé par **${CREDITS.name}** (<@${CREDITS.id}>).\n\n` +
        `Open source, performant et esthétique : des outils pour améliorer vos serveurs.`
      )
      .addFields(
        { name: '👑 Créateur', value: `${CREDITS.name}\n\`${CREDITS.id}\``, inline: true },
        { name: '🌐 Portfolio', value: `[${CREDITS.portfolio.replace('https://', '')}](${CREDITS.portfolio})`, inline: true },
        { name: '💬 Support', value: `[Serveur Discord](${CREDITS.support})`, inline: true },
      )
      .setThumbnail(creator?.displayAvatarURL({ size: 512 }) || client.user.displayAvatarURL({ size: 512 }));

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setLabel('Portfolio').setURL(CREDITS.portfolio).setStyle(ButtonStyle.Link).setEmoji('🌐'),
      new ButtonBuilder().setLabel('Serveur de support').setURL(CREDITS.support).setStyle(ButtonStyle.Link).setEmoji('💬'),
      new ButtonBuilder().setLabel('Profil Discord').setURL(`https://discord.com/users/${CREDITS.id}`).setStyle(ButtonStyle.Link).setEmoji('👤'),
    );

    await message.reply({ embeds: [e], components: [row] });
  },
};
