const config = require('../../config');
const embedUtil = require('../../utils/embed');

module.exports = {
  name: 'userinfo',
  aliases: ['ui', 'whois', 'memberinfo'],
  description: 'Affiche les informations d\'un membre.',
  usage: 'userinfo [@membre]',
  category: 'Info',
  cooldown: 5,

  async execute(message, args, client) {
    const target = message.mentions.members.first()
      || (args[0] ? await message.guild.members.fetch(args[0]).catch(() => null) : null)
      || message.member;

    if (!target) {
      return message.reply({ embeds: [embedUtil.error('Erreur', 'Membre introuvable.')] });
    }

    const user   = target.user;
    const roles  = target.roles.cache
      .filter(r => r.id !== message.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => r.toString());

    const flags = user.flags?.toArray().map(f => f.replace(/_/g, ' ')) || [];

    const embed = embedUtil.custom(target.displayHexColor === '#000000' ? config.colors.main : target.displayHexColor, { footerText: `${config.embeds.footerText} • Demandé par ${message.author.tag}` })
      .setTitle(`${config.emojis.user} Informations — ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ size: 256 }))
      .addFields(
        { name: 'ID',               value: `\`${user.id}\``,                                  inline: true },
        { name: 'Pseudo',           value: target.displayName,                                  inline: true },
        { name: 'Bot',              value: user.bot ? 'Oui' : 'Non',                            inline: true },
        { name: 'Compte créé le',   value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'A rejoint le',     value: `<t:${Math.floor(target.joinedTimestamp / 1000)}:F>`,inline: true },
        { name: 'En timeout',       value: target.isCommunicationDisabled() ? 'Oui' : 'Non',   inline: true },
        { name: `Rôles (${roles.length})`, value: roles.length ? roles.slice(0, 10).join(' ') : 'Aucun' },
        { name: 'Badges',           value: flags.length ? flags.join(', ') : 'Aucun' },
      );

    message.reply({ embeds: [embed] });
  },
};
