const { PermissionFlagsBits } = require('discord.js');
const embed = require('../../utils/embed');
const { resolveMember } = require('../../utils/permissions');

module.exports = {
  name: 'nick',
  aliases: ['nickname', 'setnick'],
  description: 'Change ou réinitialise le pseudo d\'un membre sur le serveur.',
  usage: 'nick <@membre|ID> [nouveau pseudo]',
  category: 'Modération',
  userPerms: [PermissionFlagsBits.ManageNicknames],
  botPerms: [PermissionFlagsBits.ManageNicknames],

  async execute(message, args) {
    const target = await resolveMember(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Veuillez mentionner un membre valide ou fournir son ID.')] });

    const isOwner = message.author.id === message.guild.ownerId;
    if (!isOwner && target.roles.highest.position >= message.member.roles.highest.position && target.id !== message.author.id) {
      return message.reply({ embeds: [embed.error('Erreur', 'Vous ne pouvez pas modifier le pseudo d\'un membre ayant un rôle supérieur ou égal au vôtre.')] });
    }
    if (target.id === message.guild.ownerId || target.roles.highest.position >= message.guild.members.me.roles.highest.position) {
      return message.reply({ embeds: [embed.error('Erreur', 'Je ne peux pas modifier le pseudo de ce membre (rôle trop élevé ou propriétaire).')] });
    }

    const newNick = args.slice(1).join(' ');
    if (newNick.length > 32) return message.reply({ embeds: [embed.error('Erreur', 'Le nouveau pseudo ne peut pas dépasser 32 caractères.')] });

    try {
      if (!newNick) {
        await target.setNickname(null, `Réinitialisé par ${message.author.tag}`);
        return message.reply({ embeds: [embed.success('Succès', `Le pseudo de **${target.user.username}** a été réinitialisé.`)] });
      }
      await target.setNickname(newNick, `Modifié par ${message.author.tag}`);
      message.reply({ embeds: [embed.success('Succès', `Le pseudo de **${target.user.username}** a été changé en **${newNick}**.`)] });
    } catch (error) {
      console.error('[NICK ERROR]', error);
      message.reply({ embeds: [embed.error('Erreur', 'Une erreur est survenue lors de la modification du pseudo.')] });
    }
  },
};
