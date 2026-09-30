const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { modLog } = require('../../utils/logger');
const { resolveMember, replyIfBlocked } = require('../../utils/permissions');

module.exports = {
  name: 'kick',
  aliases: ['expulser'],
  description: 'Expulse un membre du serveur.',
  usage: 'kick <@membre|ID> [raison]',
  category: 'Modération',
  cooldown: 3,
  userPerms: [PermissionFlagsBits.KickMembers],
  botPerms: [PermissionFlagsBits.KickMembers],

  async execute(message, args, client) {
    const target = await resolveMember(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Veuillez mentionner un membre valide ou fournir son ID.')] });
    if (await replyIfBlocked(message, target, { action: 'expulser' })) return;
    if (!target.kickable) return message.reply({ embeds: [embed.error('Erreur', 'Je ne peux pas expulser ce membre.')] });

    const reason = args.slice(1).join(' ') || config.moderation.defaultReason;

    if (config.moderation.dmOnSanction) {
      await target.send({
        embeds: [embed.warning(`Expulsion de ${message.guild.name}`, `Vous avez été expulsé par **${message.author.tag}**.\n**Raison :** ${reason}`)],
      }).catch(() => {});
    }
    await target.kick(`[Kick par ${message.author.tag}] ${reason}`);

    message.reply({ embeds: [embed.success('Succès', `**${target.user.tag}** a été expulsé.\n**Raison :** ${reason}`)] });

    modLog(message.guild, client, {
      title: `${config.emojis.kick} Membre Expulsé`,
      color: config.colors.kick,
      thumbnail: target.user.displayAvatarURL(),
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });
  },
};
