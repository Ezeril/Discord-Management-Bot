const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { modLog } = require('../../utils/logger');
const { resolveMember, replyIfBlocked } = require('../../utils/permissions');

module.exports = {
  name: 'ban',
  description: 'Bannit un membre du serveur.',
  usage: 'ban <@membre|ID> [raison]',
  category: 'Modération',
  userPerms: [PermissionFlagsBits.BanMembers],
  botPerms: [PermissionFlagsBits.BanMembers],

  async execute(message, args, client) {
    const target = await resolveMember(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });
    if (await replyIfBlocked(message, target, { action: 'bannir' })) return;
    if (!target.bannable) return message.reply({ embeds: [embed.error('Erreur', 'Je ne peux pas bannir ce membre.')] });

    const reason = args.slice(1).join(' ') || config.moderation.defaultReason;

    if (config.moderation.dmOnSanction) {
      await target.send({ embeds: [embed.error(`Banni de ${message.guild.name}`, `Raison : ${reason}`)] }).catch(() => {});
    }
    await target.ban({ reason: `[Par ${message.author.tag}] ${reason}` });

    message.reply({ embeds: [embed.success('Bannissement', `**${target.user.tag}** a été banni définitivement.\n**Raison :** ${reason}`)] });

    modLog(message.guild, client, {
      title: `${config.emojis.ban} Membre Banni`,
      color: config.colors.ban,
      thumbnail: target.user.displayAvatarURL(),
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });
  },
};
