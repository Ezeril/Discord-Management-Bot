const { ChannelType } = require('discord.js');
const config = require('../../config');
const embedUtil = require('../../utils/embed');

module.exports = {
  name: 'serverinfo',
  aliases: ['si', 'guildinfo'],
  description: 'Affiche les informations du serveur.',
  usage: 'serverinfo',
  category: 'Info',
  cooldown: 5,

  async execute(message) {
    const guild = message.guild;
    await guild.fetch();

    const channels = guild.channels.cache;
    const text  = channels.filter(c => c.type === ChannelType.GuildText).size;
    const voice = channels.filter(c => c.type === ChannelType.GuildVoice).size;
    const cat   = channels.filter(c => c.type === ChannelType.GuildCategory).size;

    const members = guild.members.cache;
    const humans  = members.filter(m => !m.user.bot).size;
    const bots    = members.filter(m => m.user.bot).size;

    const verifyLevel = {
      0: 'Aucune',
      1: 'Faible',
      2: 'Moyenne',
      3: 'Haute',
      4: 'Très haute',
    };

    const embed = embedUtil.custom(config.colors.main, { footerText: `${config.embeds.footerText} • Demandé par ${message.author.tag}` })
      .setTitle(`${config.emojis.server} ${guild.name}`)
      .setThumbnail(guild.iconURL({ size: 256 }))
      .addFields(
        { name: 'ID',               value: `\`${guild.id}\``,                                    inline: true },
        { name: 'Propriétaire',     value: `<@${guild.ownerId}>`,                                 inline: true },
        { name: 'Créé le',          value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,  inline: true },
        { name: 'Membres',          value: `👥 ${guild.memberCount} (≈ ${humans} humains, ${bots} bots en cache)`, inline: true },
        { name: 'Salons',           value: `💬 ${text} texte  🔊 ${voice} vocal  📁 ${cat} catégories`, inline: true },
        { name: 'Rôles',            value: `${guild.roles.cache.size}`,                           inline: true },
        { name: 'Niveau de verif.', value: verifyLevel[guild.verificationLevel] || 'Inconnu',     inline: true },
        { name: 'Boosts',           value: `${guild.premiumSubscriptionCount} (niveau ${guild.premiumTier})`, inline: true },
        { name: 'Emojis',           value: `${guild.emojis.cache.size}`,                          inline: true },
      )
      .setImage(guild.bannerURL({ size: 1024 }) || null);

    message.reply({ embeds: [embed] });
  },
};
