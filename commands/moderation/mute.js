const { PermissionFlagsBits } = require('discord.js');
const config = require('../../config');
const embed = require('../../utils/embed');
const { modLog } = require('../../utils/logger');
const { removeMute } = require('../../utils/db');
const { resolveMember, replyIfBlocked } = require('../../utils/permissions');

const MAX_TIMEOUT = 28 * 24 * 60 * 60 * 1000;

module.exports = {
  name: 'mute',
  description: 'Rend un membre muet (timeout maximum de 28 jours).',
  usage: 'mute <@membre|ID> [raison]',
  category: 'Modération',
  userPerms: [PermissionFlagsBits.ModerateMembers],
  botPerms: [PermissionFlagsBits.ModerateMembers],

  async execute(message, args, client) {
    const target = await resolveMember(message, args);
    if (!target) return message.reply({ embeds: [embed.error('Erreur', 'Membre introuvable.')] });
    if (await replyIfBlocked(message, target, { action: 'rendre muet' })) return;
    if (!target.moderatable) return message.reply({ embeds: [embed.error('Erreur', 'Je ne peux pas rendre ce membre muet.')] });

    const reason = args.slice(1).join(' ') || config.moderation.defaultReason;

    await target.timeout(MAX_TIMEOUT, `[Par ${message.author.tag}] ${reason}`);
    removeMute(message.guild.id, target.id);
    message.reply({ embeds: [embed.success('Succès', `**${target.user.tag}** a été rendu muet pour 28 jours.\n**Raison :** ${reason}`)] });

    modLog(message.guild, client, {
      title: `${config.emojis.mute} Membre rendu muet`,
      color: config.colors.mute,
      fields: [
        { name: 'Membre', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Modérateur', value: `${message.author.tag}`, inline: true },
        { name: 'Raison', value: reason },
      ],
    });
  },
};
