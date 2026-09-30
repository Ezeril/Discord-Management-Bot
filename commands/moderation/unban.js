const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { modLog } = require('../../utils/logger');

module.exports = {
  name: 'unban',
  description: 'Débannit un utilisateur via son ID.',
  usage: 'unban <ID> [raison]',
  category: 'Modération',
  userPerms: [PermissionFlagsBits.BanMembers],
  botPerms: [PermissionFlagsBits.BanMembers],

  async execute(message, args, client) {
    const userId = args[0];
    if (!userId || !/^\d{17,20}$/.test(userId)) {
      return message.reply({ embeds: [embed.error('Erreur', 'Veuillez fournir l\'ID (numérique) de l\'utilisateur à débannir.')] });
    }

    const reason = args.slice(1).join(' ') || config.moderation.defaultReason;

    try {
      await message.guild.members.unban(userId, `[Par ${message.author.tag}] ${reason}`);
    } catch {
      return message.reply({ embeds: [embed.error('Erreur', 'Impossible de débannir cet utilisateur. L\'ID est-il correct et l\'utilisateur est-il bien banni ?')] });
    }

    message.reply({ embeds: [embed.success('Succès', `L'utilisateur avec l'ID **${userId}** a été débanni.`)] });

    modLog(message.guild, client, {
      title: '🕊️ Membre Débanni',
      color: config.colors.unban,
      fields: [
        { name: 'ID Utilisateur', value: userId, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });
  },
};
