const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { addWarn } = require('../../utils/db');
const { modLog } = require('../../utils/logger');
const { resolveMember, replyIfBlocked } = require('../../utils/permissions');

module.exports = {
  name: 'warn',
  description: 'Avertit un membre.',
  usage: 'warn <@membre|ID> <raison>',
  category: 'Modération',
  userPerms: [PermissionFlagsBits.ModerateMembers],

  async execute(message, args, client) {
    const target = await resolveMember(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });
    if (target.user.bot) return message.reply({ embeds: [embed.error('Erreur', 'Vous ne pouvez pas avertir un bot.')] });

    const isOwner = message.author.id === message.guild.ownerId;
    if (target.id === message.author.id) return message.reply({ embeds: [embed.error('Erreur', 'Vous ne pouvez pas vous avertir vous-même.')] });
    if (!isOwner && target.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply({ embeds: [embed.error('Erreur', 'Vous ne pouvez pas avertir ce membre : son rôle est supérieur ou égal au vôtre.')] });
    }

    const reason = args.slice(1).join(' ');
    if (!reason) return message.reply({ embeds: [embed.error('Erreur', 'Veuillez fournir une raison.')] });

    addWarn(message.guild.id, target.id, message.author.id, reason);

    if (config.moderation.dmOnSanction) {
      await target.send({ embeds: [embed.warning(`Avertissement sur ${message.guild.name}`, `Raison : ${reason}`)] }).catch(() => {});
    }
    message.reply({ embeds: [embed.success('Succès', `**${target.user.tag}** a été averti.\n**Raison :** ${reason}`)] });

    modLog(message.guild, client, {
      title: `${config.emojis.warn} Membre Averti`,
      color: config.colors.warn,
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });
  },
};
